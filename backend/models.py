from sqlalchemy import create_engine, Column, Integer, String, DateTime, Boolean, Float, Text, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from sqlalchemy.sql import func
from datetime import datetime
import os

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./clutchzone.db")

# For PostgreSQL production
if DATABASE_URL.startswith("postgresql"):
    engine = create_engine(DATABASE_URL)
else:
    # SQLite for development
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Database Models
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, default="player")  # player, admin, moderator
    xp = Column(Integer, default=0)
    level = Column(Integer, default=1)
    favorite_game = Column(String, nullable=True)
    notifications_enabled = Column(Boolean, default=True)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    joined_at = Column(DateTime, default=func.now())
    last_login = Column(DateTime, nullable=True)
    
    # Relationships
    registrations = relationship("Registration", back_populates="user")
    match_results = relationship("MatchResult", back_populates="user")
    notifications = relationship("Notification", back_populates="user")
    payments = relationship("Payment", back_populates="user")
    created_tournaments = relationship("Tournament", back_populates="creator")

class Tournament(Base):
    __tablename__ = "tournaments"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    game = Column(String, nullable=False)
    date = Column(DateTime, nullable=False)
    registration_end = Column(DateTime, nullable=False)
    max_participants = Column(Integer, default=100)
    entry_fee = Column(Float, default=0.0)
    prize_pool = Column(Float, default=0.0)
    room_id = Column(String, nullable=True)
    room_password = Column(String, nullable=True)
    status = Column(String, default="upcoming")  # upcoming, active, completed, cancelled
    tournament_type = Column(String, default="battle_royale")  # battle_royale, elimination, team_vs_team
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    creator = relationship("User", back_populates="created_tournaments")
    registrations = relationship("Registration", back_populates="tournament")
    match_results = relationship("MatchResult", back_populates="tournament")
    payments = relationship("Payment", back_populates="tournament")

class Registration(Base):
    __tablename__ = "registrations"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    tournament_id = Column(Integer, ForeignKey("tournaments.id"))
    registered_at = Column(DateTime, default=func.now())
    payment_status = Column(String, default="pending")  # pending, paid, refunded
    
    # Relationships
    user = relationship("User", back_populates="registrations")
    tournament = relationship("Tournament", back_populates="registrations")

class MatchResult(Base):
    __tablename__ = "match_results"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    tournament_id = Column(Integer, ForeignKey("tournaments.id"))
    rank = Column(Integer, nullable=False)
    kills = Column(Integer, default=0)
    score = Column(Integer, default=0)
    screenshot_url = Column(String, nullable=True)
    verified = Column(Boolean, default=False)
    xp_gained = Column(Integer, default=0)
    prize_amount = Column(Float, default=0.0)
    submitted_at = Column(DateTime, default=func.now())
    verified_at = Column(DateTime, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="match_results")
    tournament = relationship("Tournament", back_populates="match_results")

class Notification(Base):
    __tablename__ = "notifications"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String, default="info")  # info, warning, success, error
    read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="notifications")

class Payment(Base):
    __tablename__ = "payments"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    tournament_id = Column(Integer, ForeignKey("tournaments.id"))
    amount = Column(Float, nullable=False)
    type = Column(String, nullable=False)  # entry_fee, prize_payout
    status = Column(String, default="pending")  # pending, completed, failed, refunded
    payment_method = Column(String, nullable=True)
    transaction_id = Column(String, nullable=True)
    payu_txn_id = Column(String, nullable=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="payments")
    tournament = relationship("Tournament", back_populates="payments")

# Database helper functions
def get_db():
    """Get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_tables():
    """Create all database tables"""
    Base.metadata.create_all(bind=engine)

# Utility functions for XP and levels
def calculate_level_from_xp(xp: int) -> int:
    """Calculate user level based on XP"""
    if xp < 100:
        return 1
    elif xp < 300:
        return 2
    elif xp < 600:
        return 3
    elif xp < 1000:
        return 4
    elif xp < 1500:
        return 5
    elif xp < 2100:
        return 6
    elif xp < 2800:
        return 7
    elif xp < 3600:
        return 8
    elif xp < 4500:
        return 9
    elif xp < 5500:
        return 10
    else:
        return 10 + (xp - 5500) // 1000

def get_xp_for_level(level: int) -> int:
    """Get minimum XP required for a level"""
    xp_thresholds = [0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500, 5500]
    if level <= 10:
        return xp_thresholds[level - 1] if level > 0 else 0
    else:
        return 5500 + (level - 10) * 1000

def calculate_xp_gain(rank: int, kills: int, tournament_type: str = "battle_royale") -> int:
    """Calculate XP gained based on performance"""
    base_xp = 50
    
    # Rank-based XP
    if rank == 1:
        rank_xp = 200
    elif rank <= 3:
        rank_xp = 150
    elif rank <= 10:
        rank_xp = 100
    elif rank <= 25:
        rank_xp = 75
    else:
        rank_xp = 25
    
    # Kill-based XP
    kill_xp = kills * 10
    
    # Tournament type multiplier
    multiplier = 1.0
    if tournament_type == "elimination":
        multiplier = 1.2
    elif tournament_type == "team_vs_team":
        multiplier = 1.5
    
    total_xp = int((base_xp + rank_xp + kill_xp) * multiplier)
    return total_xp
