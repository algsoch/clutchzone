from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import List, Optional

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import get_db
from models import User, MatchResult, Tournament, Registration
from schemas import (
    UserProfile, LeaderboardResponse, LeaderboardEntry, 
    UserResponse, SuccessResponse
)
import auth

router = APIRouter()

@router.get("/me", response_model=UserProfile)
async def get_my_profile(
    current_user: User = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get current user's profile with stats"""
    
    # Get tournament stats
    total_tournaments = db.query(Registration).filter(
        Registration.user_id == current_user.id
    ).count()
    
    # Get wins (rank 1 results)
    total_wins = db.query(MatchResult).filter(
        MatchResult.user_id == current_user.id,
        MatchResult.rank == 1
    ).count()
    
    # Get total kills
    total_kills = db.query(func.sum(MatchResult.kills)).filter(
        MatchResult.user_id == current_user.id
    ).scalar() or 0
    
    # Get best rank
    best_rank = db.query(func.min(MatchResult.rank)).filter(
        MatchResult.user_id == current_user.id
    ).scalar() or 0
    
    # Calculate win rate
    win_rate = (total_wins / total_tournaments * 100) if total_tournaments > 0 else 0
    
    profile_data = {
        **current_user.__dict__,
        "total_tournaments": total_tournaments,
        "total_wins": total_wins,
        "total_kills": total_kills,
        "best_rank": best_rank,
        "win_rate": round(win_rate, 2)
    }
    
    return profile_data

@router.get("/{user_id}", response_model=UserProfile)
async def get_user_profile(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth.get_current_active_user)
):
    """Get user profile by ID"""
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if getattr(user, 'is_active', True) is False:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Get tournament stats
    total_tournaments = db.query(Registration).filter(
        Registration.user_id == user.id
    ).count()
    
    # Get wins (rank 1 results)
    total_wins = db.query(MatchResult).filter(
        MatchResult.user_id == user.id,
        MatchResult.rank == 1
    ).count()
    
    # Get total kills
    total_kills = db.query(func.sum(MatchResult.kills)).filter(
        MatchResult.user_id == user.id
    ).scalar() or 0
    
    # Get best rank
    best_rank = db.query(func.min(MatchResult.rank)).filter(
        MatchResult.user_id == user.id
    ).scalar() or 0
    
    # Calculate win rate
    win_rate = (total_wins / total_tournaments * 100) if total_tournaments > 0 else 0
    
    profile_data = {
        **user.__dict__,
        "total_tournaments": total_tournaments,
        "total_wins": total_wins,
        "total_kills": total_kills,
        "best_rank": best_rank,
        "win_rate": round(win_rate, 2)
    }
    
    return profile_data

@router.get("/", response_model=List[UserResponse])
async def get_players(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth.get_current_active_user)
):
    """Get list of players"""
    
    query = db.query(User).filter(User.is_active == True)
    
    if search:
        query = query.filter(
            User.username.ilike(f"%{search}%")
        )
    
    players = query.offset(skip).limit(limit).all()
    return players

@router.get("/leaderboard/global", response_model=LeaderboardResponse)
async def get_global_leaderboard(
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth.get_current_active_user)
):
    """Get global leaderboard"""
    
    # Get top players by XP
    top_players = db.query(User).filter(
        User.is_active == True
    ).order_by(desc(User.xp)).limit(limit).all()
    
    leaderboard_entries = []
    for rank, player in enumerate(top_players, 1):
        # Get player stats
        total_tournaments = db.query(Registration).filter(
            Registration.user_id == player.id
        ).count()
        
        total_wins = db.query(MatchResult).filter(
            MatchResult.user_id == player.id,
            MatchResult.rank == 1
        ).count()
        
        win_rate = (total_wins / total_tournaments * 100) if total_tournaments > 0 else 0
        
        leaderboard_entries.append(LeaderboardEntry(
            rank=rank,
            user_id=getattr(player, 'id', 0),
            username=getattr(player, 'username', ''),
            xp=getattr(player, 'xp', 0),
            level=getattr(player, 'level', 1),
            total_wins=total_wins,
            total_tournaments=total_tournaments,
            win_rate=round(win_rate, 2),
            favorite_game=getattr(player, 'favorite_game', '')
        ))
    
    # Get current user's rank
    user_rank = None
    all_users = db.query(User).filter(
        User.is_active == True
    ).order_by(desc(User.xp)).all()
    
    for rank, user in enumerate(all_users, 1):
        if getattr(user, 'id', None) == getattr(current_user, 'id', None):
            user_rank = rank
            break
    
    total_players = db.query(User).filter(User.is_active == True).count()
    
    return LeaderboardResponse(
        entries=leaderboard_entries,
        user_rank=user_rank,
        total_players=total_players
    )

@router.get("/leaderboard/game/{game}", response_model=LeaderboardResponse)
async def get_game_leaderboard(
    game: str,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth.get_current_active_user)
):
    """Get leaderboard for specific game"""
    
    # Get players who play this game
    players_query = db.query(User).filter(
        User.is_active == True,
        User.favorite_game == game
    ).order_by(desc(User.xp)).limit(limit)
    
    top_players = players_query.all()
    
    leaderboard_entries = []
    for rank, player in enumerate(top_players, 1):
        # Get player stats for this game
        total_tournaments = db.query(Registration).join(
            Tournament, Registration.tournament_id == Tournament.id
        ).filter(
            Registration.user_id == player.id,
            Tournament.game == game
        ).count()
        
        total_wins = db.query(MatchResult).join(
            Tournament, MatchResult.tournament_id == Tournament.id
        ).filter(
            MatchResult.user_id == player.id,
            MatchResult.rank == 1,
            Tournament.game == game
        ).count()
        
        win_rate = (total_wins / total_tournaments * 100) if total_tournaments > 0 else 0
        
        leaderboard_entries.append(LeaderboardEntry(
            rank=rank,
            user_id=getattr(player, 'id', 0),
            username=getattr(player, 'username', ''),
            xp=getattr(player, 'xp', 0),
            level=getattr(player, 'level', 1),
            total_wins=total_wins,
            total_tournaments=total_tournaments,
            win_rate=round(win_rate, 2),
            favorite_game=getattr(player, 'favorite_game', '')
        ))
    
    # Get current user's rank in this game
    user_rank = None
    all_users = db.query(User).filter(
        User.is_active == True,
        User.favorite_game == game
    ).order_by(desc(User.xp)).all()
    
    for rank, user in enumerate(all_users, 1):
        if getattr(user, 'id', None) == getattr(current_user, 'id', None):
            user_rank = rank
            break
    
    total_players = db.query(User).filter(
        User.is_active == True,
        User.favorite_game == game
    ).count()
    
    return LeaderboardResponse(
        entries=leaderboard_entries,
        user_rank=user_rank,
        total_players=total_players
    )

@router.put("/me", response_model=UserResponse)
async def update_my_profile(
    profile_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth.get_current_active_user)
):
    """Update current user's profile"""
    
    # Allow only specific fields to be updated
    allowed_fields = ['favorite_game', 'notifications_enabled']
    
    for field, value in profile_data.items():
        if field in allowed_fields and hasattr(current_user, field):
            setattr(current_user, field, value)
    
    db.commit()
    db.refresh(current_user)
    
    return current_user

@router.get("/me/tournaments", response_model=List[dict])
async def get_my_tournaments(
    db: Session = Depends(get_db),
    current_user: User = Depends(auth.get_current_active_user)
):
    """Get current user's tournament history"""
    
    registrations = db.query(Registration, Tournament).join(
        Tournament, Registration.tournament_id == Tournament.id
    ).filter(Registration.user_id == current_user.id).all()
    
    tournament_history = []
    for registration, tournament in registrations:
        # Get match result if exists
        match_result = db.query(MatchResult).filter(
            MatchResult.user_id == current_user.id,
            MatchResult.tournament_id == tournament.id
        ).first()
        
        tournament_info = {
            "tournament_id": tournament.id,
            "tournament_name": tournament.name,
            "game": tournament.game,
            "date": tournament.date,
            "status": tournament.status,
            "registered_at": registration.registered_at,
            "payment_status": registration.payment_status,
            "rank": match_result.rank if match_result else None,
            "kills": match_result.kills if match_result else None,
            "xp_gained": match_result.xp_gained if match_result else None,
            "prize_amount": match_result.prize_amount if match_result else None
        }
        
        tournament_history.append(tournament_info)
    
    return tournament_history

@router.get("/me/stats", response_model=dict)
async def get_my_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(auth.get_current_active_user)
):
    """Get current user's detailed statistics"""
    
    # Basic stats
    total_tournaments = db.query(Registration).filter(
        Registration.user_id == current_user.id
    ).count()
    
    total_wins = db.query(MatchResult).filter(
        MatchResult.user_id == current_user.id,
        MatchResult.rank == 1
    ).count()
    
    total_kills = db.query(func.sum(MatchResult.kills)).filter(
        MatchResult.user_id == current_user.id
    ).scalar() or 0
    
    best_rank = db.query(func.min(MatchResult.rank)).filter(
        MatchResult.user_id == current_user.id
    ).scalar() or 0
    
    avg_rank = db.query(func.avg(MatchResult.rank)).filter(
        MatchResult.user_id == current_user.id
    ).scalar() or 0
    
    # Game-specific stats
    game_stats = db.query(
        Tournament.game,
        func.count(Registration.id).label('tournaments'),
        func.count(MatchResult.id).label('completed'),
        func.sum(MatchResult.kills).label('kills'),
        func.avg(MatchResult.rank).label('avg_rank')
    ).select_from(Registration).join(
        Tournament, Registration.tournament_id == Tournament.id
    ).outerjoin(
        MatchResult, 
        (MatchResult.user_id == Registration.user_id) & 
        (MatchResult.tournament_id == Registration.tournament_id)
    ).filter(
        Registration.user_id == current_user.id
    ).group_by(Tournament.game).all()
    
    game_breakdown = []
    for game, tournaments, completed, kills, avg_rank in game_stats:
        game_breakdown.append({
            "game": game,
            "tournaments": tournaments,
            "completed": completed or 0,
            "kills": kills or 0,
            "avg_rank": round(avg_rank, 2) if avg_rank else 0
        })
    
    return {
        "total_tournaments": total_tournaments,
        "total_wins": total_wins,
        "total_kills": total_kills,
        "best_rank": best_rank,
        "avg_rank": round(avg_rank, 2) if avg_rank else 0,
        "win_rate": round((total_wins / total_tournaments * 100), 2) if total_tournaments > 0 else 0,
        "game_breakdown": game_breakdown
    }
