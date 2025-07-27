from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List, Optional

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import get_db
from models import Tournament, Registration, User
from schemas import (
    TournamentCreate, TournamentResponse, TournamentUpdate,
    RegistrationCreate, RegistrationResponse, SuccessResponse
)
import auth

router = APIRouter()

@router.get("/", response_model=List[TournamentResponse])
async def get_tournaments(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    game: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get list of tournaments"""
    query = db.query(Tournament)
    
    if status:
        query = query.filter(Tournament.status == status)
    if game:
        query = query.filter(Tournament.game == game)
    
    tournaments = query.offset(skip).limit(limit).all()
    
    # Add participant count and registration status
    tournament_responses = []
    for tournament in tournaments:
        participant_count = db.query(Registration).filter(
            Registration.tournament_id == tournament.id
        ).count()
        
        is_registered = db.query(Registration).filter(
            Registration.tournament_id == tournament.id,
            Registration.user_id == current_user.id
        ).first() is not None
        
        tournament_dict = tournament.__dict__.copy()
        tournament_dict['participant_count'] = participant_count
        tournament_dict['is_registered'] = is_registered
        tournament_responses.append(tournament_dict)
    
    return tournament_responses

@router.get("/{tournament_id}", response_model=TournamentResponse)
async def get_tournament(
    tournament_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth.get_current_active_user)
):
    """Get specific tournament"""
    tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
    if not tournament:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tournament not found"
        )
    
    # Add participant count and registration status
    participant_count = db.query(Registration).filter(
        Registration.tournament_id == tournament.id
    ).count()
    
    is_registered = db.query(Registration).filter(
        Registration.tournament_id == tournament.id,
        Registration.user_id == current_user.id
    ).first() is not None
    
    tournament_dict = tournament.__dict__.copy()
    tournament_dict['participant_count'] = participant_count
    tournament_dict['is_registered'] = is_registered
    
    return tournament_dict

@router.post("/", response_model=TournamentResponse)
async def create_tournament(
    tournament: TournamentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth.get_current_admin_user)
):
    """Create new tournament (Admin only)"""
    db_tournament = Tournament(
        name=tournament.name,
        description=tournament.description,
        game=tournament.game,
        date=tournament.date,
        registration_end=tournament.registration_end,
        max_participants=tournament.max_participants,
        entry_fee=tournament.entry_fee,
        prize_pool=tournament.prize_pool,
        tournament_type=tournament.tournament_type,
        created_by=current_user.id
    )
    
    db.add(db_tournament)
    db.commit()
    db.refresh(db_tournament)
    
    tournament_dict = db_tournament.__dict__.copy()
    tournament_dict['participant_count'] = 0
    tournament_dict['is_registered'] = False
    
    return tournament_dict

@router.put("/{tournament_id}", response_model=TournamentResponse)
async def update_tournament(
    tournament_id: int,
    tournament_update: TournamentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth.get_current_admin_user)
):
    """Update tournament (Admin only)"""
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
    
    # Update the timestamp using query update
    db.query(Tournament).filter(Tournament.id == tournament_id).update({
        Tournament.updated_at: datetime.utcnow()
    })
    db.commit()
    db.refresh(tournament)
    
    participant_count = db.query(Registration).filter(
        Registration.tournament_id == tournament.id
    ).count()
    
    tournament_dict = tournament.__dict__.copy()
    tournament_dict['participant_count'] = participant_count
    tournament_dict['is_registered'] = False
    
    return tournament_dict

@router.delete("/{tournament_id}", response_model=SuccessResponse)
async def delete_tournament(
    tournament_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth.get_current_admin_user)
):
    """Delete tournament (Admin only)"""
    tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
    if not tournament:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tournament not found"
        )
    
    db.delete(tournament)
    db.commit()
    
    return SuccessResponse(message="Tournament deleted successfully")

@router.post("/{tournament_id}/register", response_model=RegistrationResponse)
async def register_for_tournament(
    tournament_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth.get_current_active_user)
):
    """Register for tournament"""
    tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
    if not tournament:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tournament not found"
        )
    
    # Check if already registered
    existing_registration = db.query(Registration).filter(
        Registration.tournament_id == tournament_id,
        Registration.user_id == current_user.id
    ).first()
    
    if existing_registration:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Already registered for this tournament"
        )
    
    # Check if tournament is full
    participant_count = db.query(Registration).filter(
        Registration.tournament_id == tournament_id
    ).count()
    
    max_participants = getattr(tournament, 'max_participants', 0)
    if participant_count >= max_participants:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tournament is full"
        )
    
    # Check if registration is still open
    registration_end = getattr(tournament, 'registration_end', None)
    if registration_end and datetime.utcnow() > registration_end:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Registration period has ended"
        )
    
    # Create registration
    entry_fee = getattr(tournament, 'entry_fee', 0)
    registration = Registration(
        user_id=current_user.id,
        tournament_id=tournament_id,
        payment_status="paid" if entry_fee == 0 else "pending"
    )
    
    db.add(registration)
    db.commit()
    db.refresh(registration)
    
    return registration

@router.delete("/{tournament_id}/register", response_model=SuccessResponse)
async def unregister_from_tournament(
    tournament_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth.get_current_active_user)
):
    """Unregister from tournament"""
    registration = db.query(Registration).filter(
        Registration.tournament_id == tournament_id,
        Registration.user_id == current_user.id
    ).first()
    
    if not registration:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Registration not found"
        )
    
    db.delete(registration)
    db.commit()
    
    return SuccessResponse(message="Unregistered successfully")

@router.get("/{tournament_id}/participants", response_model=List[dict])
async def get_tournament_participants(
    tournament_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(auth.get_current_active_user)
):
    """Get tournament participants"""
    tournament = db.query(Tournament).filter(Tournament.id == tournament_id).first()
    if not tournament:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tournament not found"
        )
    
    participants = db.query(Registration, User).join(
        User, Registration.user_id == User.id
    ).filter(Registration.tournament_id == tournament_id).all()
    
    participant_list = []
    for registration, user in participants:
        participant_list.append({
            "user_id": user.id,
            "username": user.username,
            "level": user.level,
            "xp": user.xp,
            "registered_at": registration.registered_at,
            "payment_status": registration.payment_status
        })
    
    return participant_list
