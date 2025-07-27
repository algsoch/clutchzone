"""
Enhanced Admin API Routes for ClutchZone
Comprehensive admin panel with tournament management, analytics, and feature controls
"""

from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, and_, or_
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import json

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import get_db
from models import User, Tournament, Registration, MatchResult, Payment
from schemas import (
    TournamentCreate, TournamentResponse, AdminTournamentUpdate,
    AdminUserUpdate, AdminStats, SuccessResponse
)
import auth
from analytics import analytics_manager
from discord_integration import discord_integration

router = APIRouter()

@router.get("/dashboard", response_model=Dict[str, Any])
async def get_admin_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(auth.get_current_admin_user)
):
    """Get comprehensive admin dashboard data"""
    
    # Real-time stats
    real_time_stats = await analytics_manager.get_real_time_stats()
    
    # API analytics for last 24 hours
    api_analytics = await analytics_manager.get_api_analytics(hours=24)
    
    # Server metrics
    server_metrics = await analytics_manager.get_server_metrics()
    
    # Database stats
    total_users = db.query(User).filter(User.is_active == True).count()
    total_tournaments = db.query(Tournament).count()
    active_tournaments = db.query(Tournament).filter(Tournament.status == "active").count()
    total_registrations = db.query(Registration).count()
    
    # Revenue stats
    total_revenue = db.query(func.sum(Payment.amount)).filter(
        Payment.status == "completed",
        Payment.type == "entry_fee"
    ).scalar() or 0.0
    
    # Recent activity
    recent_users = db.query(User).filter(User.is_active == True).order_by(desc(User.created_at)).limit(10).all()
    recent_tournaments = db.query(Tournament).order_by(desc(Tournament.created_at)).limit(5).all()
    
    # Growth metrics
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    new_users_30d = db.query(User).filter(User.created_at >= thirty_days_ago).count()
    new_tournaments_30d = db.query(Tournament).filter(Tournament.created_at >= thirty_days_ago).count()
    
    return {
        "real_time_stats": real_time_stats,
        "api_analytics": api_analytics,
        "server_metrics": server_metrics,
        "database_stats": {
            "total_users": total_users,
            "total_tournaments": total_tournaments,
            "active_tournaments": active_tournaments,
            "total_registrations": total_registrations,
            "total_revenue": total_revenue,
            "new_users_30d": new_users_30d,
            "new_tournaments_30d": new_tournaments_30d
        },
        "recent_activity": {
            "recent_users": [{"id": u.id, "username": u.username, "created_at": u.created_at} for u in recent_users],
            "recent_tournaments": [{"id": t.id, "name": t.name, "game": t.game, "created_at": t.created_at} for t in recent_tournaments]
        }
    }

@router.post("/tournaments", response_model=TournamentResponse)
async def create_tournament(
    tournament: TournamentCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth.get_current_admin_user)
):
    """Create a new tournament"""
    
    # Validate tournament data
    if tournament.start_date <= datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tournament start date must be in the future"
        )
    
    if tournament.end_date <= tournament.start_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tournament end date must be after start date"
        )
    
    # Create tournament
    db_tournament = Tournament(
        name=tournament.name,
        description=tournament.description,
        game=tournament.game,
        format=tournament.format,
        max_participants=tournament.max_participants,
        entry_fee=tournament.entry_fee,
        prize_pool=tournament.prize_pool,
        start_date=tournament.start_date,
        end_date=tournament.end_date,
        registration_deadline=tournament.registration_deadline,
        rules=tournament.rules,
        status="upcoming",
        created_by=current_user.id
    )
    
    db.add(db_tournament)
    db.commit()
    db.refresh(db_tournament)
    
    # Send Discord notification
    background_tasks.add_task(
        discord_integration.send_tournament_notification,
        {
            "id": db_tournament.id,
            "name": db_tournament.name,
            "game": db_tournament.game,
            "prize_pool": db_tournament.prize_pool,
            "participants": 0,
            "start_date": db_tournament.start_date.isoformat(),
            "entry_fee": db_tournament.entry_fee
        },
        "created"
    )
    
    # Log activity
    await analytics_manager.track_user_session(
        str(current_user.id), 
        "tournament_created", 
        {"tournament_id": db_tournament.id, "tournament_name": db_tournament.name}
    )
    
    return db_tournament

@router.put("/tournaments/{tournament_id}", response_model=TournamentResponse)
async def update_tournament(
    tournament_id: int,
    tournament_update: AdminTournamentUpdate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth.get_current_admin_user)
):
    """Update an existing tournament"""
    
    db_tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
    if not db_tournament:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tournament not found"
        )
    
    # Update fields
    update_data = tournament_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_tournament, field, value)
    
    db_tournament.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_tournament)
    
    # Log activity
    await analytics_manager.track_user_session(
        str(current_user.id), 
        "tournament_updated", 
        {"tournament_id": tournament_id, "updated_fields": list(update_data.keys())}
    )
    
    return db_tournament

@router.delete("/tournaments/{tournament_id}")
async def delete_tournament(
    tournament_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth.get_current_admin_user)
):
    """Delete a tournament"""
    
    db_tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
    if not db_tournament:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tournament not found"
        )
    
    # Check if tournament has registrations
    registration_count = db.query(Registration).filter(Registration.tournament_id == tournament_id).count()
    if registration_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot delete tournament with {registration_count} registrations"
        )
    
    db.delete(db_tournament)
    db.commit()
    
    # Log activity
    await analytics_manager.track_user_session(
        str(current_user.id), 
        "tournament_deleted", 
        {"tournament_id": tournament_id, "tournament_name": db_tournament.name}
    )
    
    return {"message": "Tournament deleted successfully"}

@router.get("/tournaments", response_model=List[TournamentResponse])
async def get_all_tournaments(
    skip: int = 0,
    limit: int = 100,
    status_filter: Optional[str] = None,
    game_filter: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth.get_current_admin_user)
):
    """Get all tournaments with filters"""
    
    query = db.query(Tournament)
    
    if status_filter:
        query = query.filter(Tournament.status == status_filter)
    
    if game_filter:
        query = query.filter(Tournament.game.ilike(f"%{game_filter}%"))
    
    tournaments = query.order_by(desc(Tournament.created_at)).offset(skip).limit(limit).all()
    
    return tournaments

@router.get("/users", response_model=List[Dict[str, Any]])
async def get_all_users(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    active_only: bool = True,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth.get_current_admin_user)
):
    """Get all users with search and filters"""
    
    query = db.query(User)
    
    if active_only:
        query = query.filter(User.is_active == True)
    
    if search:
        query = query.filter(
            or_(
                User.username.ilike(f"%{search}%"),
                User.email.ilike(f"%{search}%")
            )
        )
    
    users = query.order_by(desc(User.created_at)).offset(skip).limit(limit).all()
    
    # Add additional user stats
    user_data = []
    for user in users:
        tournament_count = db.query(Registration).filter(Registration.user_id == user.id).count()
        total_winnings = db.query(func.sum(Payment.amount)).filter(
            Payment.user_id == user.id,
            Payment.type == "prize_payout",
            Payment.status == "completed"
        ).scalar() or 0.0
        
        user_data.append({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "level": user.level,
            "xp": user.xp,
            "is_active": user.is_active,
            "is_admin": user.is_admin,
            "created_at": user.created_at,
            "last_login": user.last_login,
            "tournament_count": tournament_count,
            "total_winnings": total_winnings
        })
    
    return user_data

@router.put("/users/{user_id}")
async def update_user(
    user_id: int,
    user_update: AdminUserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth.get_current_admin_user)
):
    """Update user details (admin only)"""
    
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Update fields
    update_data = user_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_user, field, value)
    
    db_user.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_user)
    
    # Log activity
    await analytics_manager.track_user_session(
        str(current_user.id), 
        "user_updated", 
        {"target_user_id": user_id, "updated_fields": list(update_data.keys())}
    )
    
    return {"message": "User updated successfully", "user": db_user}

@router.get("/analytics/api")
async def get_api_analytics(
    hours: int = 24,
    current_user: User = Depends(auth.get_current_admin_user)
):
    """Get detailed API analytics"""
    return await analytics_manager.get_api_analytics(hours)

@router.get("/analytics/realtime")
async def get_realtime_analytics(
    current_user: User = Depends(auth.get_current_admin_user)
):
    """Get real-time analytics"""
    return await analytics_manager.get_real_time_stats()

@router.get("/analytics/server")
async def get_server_analytics(
    current_user: User = Depends(auth.get_current_admin_user)
):
    """Get server performance metrics"""
    return await analytics_manager.get_server_metrics()

@router.post("/features/toggle")
async def toggle_feature(
    feature_name: str,
    enabled: bool,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth.get_current_admin_user)
):
    """Toggle platform features on/off"""
    
    # This would integrate with a feature flags system
    # For now, we'll just log the action
    await analytics_manager.track_user_session(
        str(current_user.id), 
        "feature_toggled", 
        {"feature_name": feature_name, "enabled": enabled}
    )
    
    return {"message": f"Feature '{feature_name}' {'enabled' if enabled else 'disabled'} successfully"}

@router.post("/announcements")
async def create_announcement(
    title: str,
    message: str,
    priority: str = "normal",
    target_audience: str = "all",
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth.get_current_admin_user)
):
    """Create a platform-wide announcement"""
    
    announcement_data = {
        "title": title,
        "message": message,
        "priority": priority,
        "target_audience": target_audience,
        "created_by": current_user.username,
        "created_at": datetime.utcnow().isoformat()
    }
    
    # This would broadcast to all connected WebSocket clients
    # For now, we'll just log it
    await analytics_manager.track_user_session(
        str(current_user.id), 
        "announcement_created", 
        announcement_data
    )
    
    return {"message": "Announcement created successfully", "data": announcement_data}

@router.get("/logs/recent")
async def get_recent_logs(
    count: int = 100,
    log_type: Optional[str] = None,
    current_user: User = Depends(auth.get_current_admin_user)
):
    """Get recent system logs"""
    
    # This would return recent logs from the analytics system
    logs = analytics_manager.access_logs[-count:] if analytics_manager.access_logs else []
    
    if log_type:
        logs = [log for log in logs if log.get('type') == log_type]
    
    return {"logs": logs, "total": len(logs)}

@router.post("/tournaments/{tournament_id}/start")
async def start_tournament(
    tournament_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth.get_current_admin_user)
):
    """Start a tournament"""
    
    db_tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
    if not db_tournament:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tournament not found"
        )
    
    if db_tournament.status != "upcoming":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tournament is not in upcoming status"
        )
    
    db_tournament.status = "active"
    db_tournament.start_date = datetime.utcnow()
    db.commit()
    
    # Send Discord notification
    participant_count = db.query(Registration).filter(Registration.tournament_id == tournament_id).count()
    background_tasks.add_task(
        discord_integration.send_tournament_notification,
        {
            "id": db_tournament.id,
            "name": db_tournament.name,
            "game": db_tournament.game,
            "prize_pool": db_tournament.prize_pool,
            "participants": participant_count,
            "start_date": db_tournament.start_date.isoformat(),
            "entry_fee": db_tournament.entry_fee
        },
        "started"
    )
    
    return {"message": "Tournament started successfully", "tournament": db_tournament}

@router.post("/tournaments/{tournament_id}/end")
async def end_tournament(
    tournament_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth.get_current_admin_user)
):
    """End a tournament"""
    
    db_tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
    if not db_tournament:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tournament not found"
        )
    
    if db_tournament.status != "active":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tournament is not active"
        )
    
    db_tournament.status = "completed"
    db_tournament.end_date = datetime.utcnow()
    db.commit()
    
    # Send Discord notification
    participant_count = db.query(Registration).filter(Registration.tournament_id == tournament_id).count()
    background_tasks.add_task(
        discord_integration.send_tournament_notification,
        {
            "id": db_tournament.id,
            "name": db_tournament.name,
            "game": db_tournament.game,
            "prize_pool": db_tournament.prize_pool,
            "participants": participant_count,
            "start_date": db_tournament.start_date.isoformat(),
            "entry_fee": db_tournament.entry_fee
        },
        "ended"
    )
    
    return {"message": "Tournament ended successfully", "tournament": db_tournament}
