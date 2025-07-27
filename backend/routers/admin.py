from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import List, Optional

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

router = APIRouter()

@router.get("/stats", response_model=AdminStats)
async def get_admin_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(auth.get_current_admin_user)
):
    """Get admin dashboard statistics"""
    
    # Get total users
    total_users = db.query(User).filter(User.is_active == True).count()
    
    # Get total tournaments
    total_tournaments = db.query(Tournament).count()
    
    # Get active tournaments
    active_tournaments = db.query(Tournament).filter(
        Tournament.status == "active"
    ).count()
    
    # Get total registrations
    total_registrations = db.query(Registration).count()
    
    # Get total revenue
    total_revenue = db.query(func.sum(Payment.amount)).filter(
        Payment.status == "completed",
        Payment.type == "entry_fee"
    ).scalar() or 0.0
    
    # Calculate average participants per tournament
    avg_participants = db.query(func.avg(
        func.count(Registration.id)
    )).select_from(Registration).group_by(
        Registration.tournament_id
    ).scalar() or 0.0
    
    return AdminStats(
        total_users=total_users,
        total_tournaments=total_tournaments,
        active_tournaments=active_tournaments,
        total_registrations=total_registrations,
        total_revenue=total_revenue,
        avg_participants_per_tournament=round(avg_participants, 2)
    )

@router.get("/tournaments", response_model=List[TournamentResponse])
async def get_all_tournaments(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth.get_current_admin_user)
):
    """Get all tournaments for admin"""
    
    tournaments = db.query(Tournament).offset(skip).limit(limit).all()
    
    tournament_responses = []
    for tournament in tournaments:
        participant_count = db.query(Registration).filter(
            Registration.tournament_id == tournament.id
        ).count()
        
        tournament_dict = tournament.__dict__.copy()
        tournament_dict['participant_count'] = participant_count
        tournament_dict['is_registered'] = False
        tournament_responses.append(tournament_dict)
    
    return tournament_responses

@router.put("/tournaments/{tournament_id}", response_model=TournamentResponse)
async def admin_update_tournament(
    tournament_id: int,
    tournament_update: AdminTournamentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth.get_current_admin_user)
):
    """Update tournament with admin privileges"""
    
    tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
    if not tournament:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tournament not found"
        )
    
    # Update fields
    update_data = tournament_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(tournament, field, value)
    
    db.commit()
    db.refresh(tournament)
    
    participant_count = db.query(Registration).filter(
        Registration.tournament_id == tournament.id
    ).count()
    
    tournament_dict = tournament.__dict__.copy()
    tournament_dict['participant_count'] = participant_count
    tournament_dict['is_registered'] = False
    
    return tournament_dict

@router.post("/tournaments/{tournament_id}/start", response_model=SuccessResponse)
async def start_tournament(
    tournament_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth.get_current_admin_user)
):
    """Start a tournament"""
    
    tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
    if not tournament:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tournament not found"
        )
    
    if getattr(tournament, 'status', '') != "upcoming":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tournament is not in upcoming status"
        )
    
    # Update tournament status using query update
    db.query(Tournament).filter(Tournament.id == tournament_id).update({
        Tournament.status: "active"
    })
    db.commit()
    
    return SuccessResponse(message="Tournament started successfully")

@router.post("/tournaments/{tournament_id}/complete", response_model=SuccessResponse)
async def complete_tournament(
    tournament_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth.get_current_admin_user)
):
    """Complete a tournament"""
    
    tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
    if not tournament:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tournament not found"
        )
    
    if getattr(tournament, 'status', '') != "active":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tournament is not active"
        )
    
    # Update tournament status using query update
    db.query(Tournament).filter(Tournament.id == tournament_id).update({
        Tournament.status: "completed"
    })
    db.commit()
    
    return SuccessResponse(message="Tournament completed successfully")

@router.get("/users", response_model=List[dict])
async def get_all_users(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth.get_current_admin_user)
):
    """Get all users for admin"""
    
    query = db.query(User)
    
    if search:
        query = query.filter(
            User.username.ilike(f"%{search}%") |
            User.email.ilike(f"%{search}%")
        )
    
    users = query.offset(skip).limit(limit).all()
    
    user_list = []
    for user in users:
        # Get user stats
        total_tournaments = db.query(Registration).filter(
            Registration.user_id == user.id
        ).count()
        
        total_wins = db.query(MatchResult).filter(
            MatchResult.user_id == user.id,
            MatchResult.rank == 1
        ).count()
        
        user_dict = user.__dict__.copy()
        user_dict['total_tournaments'] = total_tournaments
        user_dict['total_wins'] = total_wins
        user_list.append(user_dict)
    
    return user_list

@router.put("/users/{user_id}", response_model=dict)
async def admin_update_user(
    user_id: int,
    user_update: AdminUserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth.get_current_admin_user)
):
    """Update user with admin privileges"""
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Update fields
    update_data = user_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user, field, value)
    
    db.commit()
    db.refresh(user)
    
    return user.__dict__

@router.delete("/users/{user_id}", response_model=SuccessResponse)
async def deactivate_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth.get_current_admin_user)
):
    """Deactivate user account"""
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if getattr(user, 'id', None) == getattr(current_user, 'id', None):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot deactivate your own account"
        )
    
    # Update user status using query update
    db.query(User).filter(User.id == user_id).update({
        User.is_active: False
    })
    db.commit()
    
    return SuccessResponse(message="User deactivated successfully")

@router.get("/tournaments/{tournament_id}/results", response_model=List[dict])
async def get_tournament_results(
    tournament_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth.get_current_admin_user)
):
    """Get tournament results"""
    
    tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
    if not tournament:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tournament not found"
        )
    
    results = db.query(MatchResult, User).join(
        User, MatchResult.user_id == User.id
    ).filter(
        MatchResult.tournament_id == tournament_id
    ).order_by(MatchResult.rank).all()
    
    result_list = []
    for result, user in results:
        result_dict = {
            "rank": result.rank,
            "user_id": user.id,
            "username": user.username,
            "kills": result.kills,
            "score": result.score,
            "xp_gained": result.xp_gained,
            "prize_amount": result.prize_amount,
            "verified": result.verified,
            "screenshot_url": result.screenshot_url,
            "submitted_at": result.submitted_at
        }
        result_list.append(result_dict)
    
    return result_list

@router.put("/results/{result_id}/verify", response_model=SuccessResponse)
async def verify_result(
    result_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth.get_current_admin_user)
):
    """Verify a match result"""
    
    result = db.query(MatchResult).filter(MatchResult.id == result_id).first()
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Result not found"
        )
    
    # Update result verification using query update
    db.query(MatchResult).filter(MatchResult.id == result_id).update({
        MatchResult.verified: True,
        MatchResult.verified_at: func.now()
    })
    db.commit()
    
    return SuccessResponse(message="Result verified successfully")

@router.get("/payments", response_model=List[dict])
async def get_all_payments(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth.get_current_admin_user)
):
    """Get all payments for admin"""
    
    payments = db.query(Payment, User, Tournament).join(
        User, Payment.user_id == User.id
    ).join(
        Tournament, Payment.tournament_id == Tournament.id
    ).offset(skip).limit(limit).all()
    
    payment_list = []
    for payment, user, tournament in payments:
        payment_dict = {
            "id": payment.id,
            "amount": payment.amount,
            "type": payment.type,
            "status": payment.status,
            "payment_method": payment.payment_method,
            "transaction_id": payment.transaction_id,
            "created_at": payment.created_at,
            "user_id": user.id,
            "username": user.username,
            "tournament_id": tournament.id,
            "tournament_name": tournament.name
        }
        payment_list.append(payment_dict)
    
    return payment_list
