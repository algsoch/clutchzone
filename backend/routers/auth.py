from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import List

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import get_db
from models import User, calculate_level_from_xp
from schemas import (
    UserCreate, UserLogin, UserResponse, Token, UsernameCheck,
    UsernameCheckResponse, SuccessResponse, ErrorResponse
)
import auth
from services.email_service import send_welcome_email
from services.discord_service import discord_service

router = APIRouter()

@router.post("/register", response_model=Token)
async def register(user: UserCreate, db: Session = Depends(get_db)):
    """Register a new user"""
    
    # Check if username is available
    if not auth.check_username_availability(db, user.username):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username is already taken"
        )
    
    # Check if email is available
    if not auth.check_email_availability(db, user.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is already registered"
        )
    
    # Hash password
    hashed_password = auth.get_password_hash(user.password)
    
    # Create user with calculated level
    welcome_xp = 100
    calculated_level = calculate_level_from_xp(welcome_xp)
    
    db_user = User(
        email=user.email,
        username=user.username,
        password_hash=hashed_password,
        favorite_game=user.favorite_game,
        notifications_enabled=user.notifications_enabled,
        xp=welcome_xp,
        level=calculated_level,
        is_active=True,
        is_verified=False
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Send welcome email - convert to string values
    try:
        await send_welcome_email(str(db_user.email), str(db_user.username))
    except Exception as e:
        print(f"Failed to send welcome email: {e}")
        # Don't fail registration if email fails
    
    # Send Discord welcome notification
    try:
        user_data = {
            "username": str(db_user.username),
            "email": str(db_user.email),
            "xp": int(db_user.xp),
            "created_at": db_user.created_at
        }
        await discord_service.send_welcome_message(user_data)
    except Exception as e:
        print(f"Failed to send Discord welcome message: {e}")
        # Don't fail registration if Discord fails
    
    # Create access token
    access_token_expires = timedelta(minutes=30 * 24 * 60)  # 30 days
    access_token = auth.create_access_token(
        data={"sub": db_user.email, "user_id": db_user.id},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": 30 * 24 * 60 * 60,  # 30 days in seconds
        "user": UserResponse.from_orm(db_user)
    }

@router.post("/login", response_model=Token)
async def login(user_credentials: UserLogin, db: Session = Depends(get_db)):
    """Login user"""
    
    # Authenticate user
    user = auth.authenticate_user(db, user_credentials.username, user_credentials.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username/email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check if user is active - use getattr to avoid type issues
    if getattr(user, 'is_active', True) is False:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account is deactivated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Daily login bonus (50 XP) - get current values using getattr
    daily_bonus = 50
    current_xp = getattr(user, 'xp', 0)
    current_level = getattr(user, 'level', 1)
    new_xp = current_xp + daily_bonus
    new_level = calculate_level_from_xp(new_xp)
    level_up = new_level > current_level
    
    # Update user data using SQLAlchemy update
    db.query(User).filter(User.id == user.id).update({
        User.xp: new_xp,
        User.level: new_level,
        User.last_login: datetime.utcnow()
    })
    db.commit()
    
    # Refresh the user object to get updated values
    db.refresh(user)
    
    # Create access token
    token_expires = timedelta(minutes=30 * 24 * 60) if user_credentials.remember_me else timedelta(minutes=60)
    access_token = auth.create_access_token(
        data={"sub": user.email, "user_id": user.id},
        expires_delta=token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": int(token_expires.total_seconds()),
        "user": UserResponse.from_orm(user),
        "xp_bonus": daily_bonus,
        "level_up": level_up
    }

@router.post("/check-username", response_model=UsernameCheckResponse)
async def check_username(username_data: UsernameCheck, db: Session = Depends(get_db)):
    """Check if username is available"""
    
    if len(username_data.username) < 3:
        return UsernameCheckResponse(
            available=False,
            message="Username must be at least 3 characters long"
        )
    
    if not username_data.username.replace('_', '').isalnum():
        return UsernameCheckResponse(
            available=False,
            message="Username can only contain letters, numbers, and underscores"
        )
    
    available = auth.check_username_availability(db, username_data.username)
    
    return UsernameCheckResponse(
        available=available,
        message="Username is available" if available else "Username is already taken"
    )

@router.post("/check-email", response_model=UsernameCheckResponse)
async def check_email(email_data: dict, db: Session = Depends(get_db)):
    """Check if email is available"""
    
    email = email_data.get("email")
    if not email:
        return UsernameCheckResponse(
            available=False,
            message="Email is required"
        )
    
    available = auth.check_email_availability(db, email)
    
    return UsernameCheckResponse(
        available=available,
        message="Email is available" if available else "Email is already registered"
    )

@router.post("/logout", response_model=SuccessResponse)
async def logout():
    """Logout user (client should remove token)"""
    return SuccessResponse(message="Logged out successfully")

@router.post("/refresh", response_model=Token)
async def refresh_token(current_user: User = Depends(auth.get_current_active_user)):
    """Refresh access token"""
    
    # Create new access token
    access_token_expires = timedelta(minutes=30 * 24 * 60)  # 30 days
    access_token = auth.create_access_token(
        data={"sub": current_user.email, "user_id": current_user.id},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": 30 * 24 * 60 * 60,  # 30 days in seconds
        "user": UserResponse.from_orm(current_user)
    }

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(auth.get_current_active_user)):
    """Get current user information"""
    return UserResponse.from_orm(current_user)

@router.post("/verify-email")
async def verify_email(token: str, db: Session = Depends(get_db)):
    """Verify user email with token"""
    # TODO: Implement email verification logic
    return SuccessResponse(message="Email verified successfully")

@router.post("/forgot-password")
async def forgot_password(email_data: dict, db: Session = Depends(get_db)):
    """Request password reset"""
    # TODO: Implement password reset logic
    return SuccessResponse(message="Password reset email sent")

@router.post("/reset-password")
async def reset_password(reset_data: dict, db: Session = Depends(get_db)):
    """Reset password with token"""
    # TODO: Implement password reset logic
    return SuccessResponse(message="Password reset successfully")
