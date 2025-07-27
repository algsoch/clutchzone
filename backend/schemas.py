from pydantic import BaseModel, EmailStr, validator
from datetime import datetime
from typing import Optional, List
from enum import Enum

# Enums
class UserRole(str, Enum):
    PLAYER = "player"
    ADMIN = "admin"
    MODERATOR = "moderator"

class TournamentStatus(str, Enum):
    UPCOMING = "upcoming"
    ACTIVE = "active"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class TournamentType(str, Enum):
    BATTLE_ROYALE = "battle_royale"
    ELIMINATION = "elimination"
    TEAM_VS_TEAM = "team_vs_team"

class PaymentStatus(str, Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"

class Game(str, Enum):
    VALORANT = "valorant"
    CSGO = "csgo"
    PUBG = "pubg"
    COD = "cod"
    APEX = "apex"
    FORTNITE = "fortnite"
    LOL = "lol"
    DOTA2 = "dota2"

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    username: str
    favorite_game: Optional[str] = None
    notifications_enabled: bool = True

class UserCreate(UserBase):
    password: str
    confirm_password: str
    terms: bool
    
    @validator('username')
    def validate_username(cls, v):
        if len(v) < 3:
            raise ValueError('Username must be at least 3 characters long')
        if not v.replace('_', '').isalnum():
            raise ValueError('Username can only contain letters, numbers, and underscores')
        return v
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if not any(c.isupper() for c in v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not any(c.islower() for c in v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not any(c.isdigit() for c in v):
            raise ValueError('Password must contain at least one number')
        return v
    
    @validator('confirm_password')
    def passwords_match(cls, v, values, **kwargs):
        if 'password' in values and v != values['password']:
            raise ValueError('Passwords do not match')
        return v
    
    @validator('terms')
    def terms_accepted(cls, v):
        if not v:
            raise ValueError('You must accept the terms and conditions')
        return v

class UserLogin(BaseModel):
    username: str  # Can be either username or email
    password: str
    remember_me: bool = False

class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    role: UserRole
    xp: int
    level: int
    favorite_game: Optional[str]
    notifications_enabled: bool
    is_active: bool
    is_verified: bool
    joined_at: datetime
    last_login: Optional[datetime]
    
    class Config:
        orm_mode = True

class UserProfile(UserResponse):
    total_tournaments: int
    total_wins: int
    total_kills: int
    best_rank: int
    win_rate: float

class UsernameCheck(BaseModel):
    username: str

class UsernameCheckResponse(BaseModel):
    available: bool
    message: str

# Tournament Schemas
class TournamentBase(BaseModel):
    name: str
    description: Optional[str] = None
    game: str
    date: datetime
    registration_end: datetime
    max_participants: int = 100
    entry_fee: float = 0.0
    prize_pool: float = 0.0
    tournament_type: TournamentType = TournamentType.BATTLE_ROYALE

class TournamentCreate(TournamentBase):
    pass

class TournamentUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    date: Optional[datetime] = None
    registration_end: Optional[datetime] = None
    max_participants: Optional[int] = None
    entry_fee: Optional[float] = None
    prize_pool: Optional[float] = None
    room_id: Optional[str] = None
    room_password: Optional[str] = None
    status: Optional[TournamentStatus] = None

class TournamentResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    game: str
    date: datetime
    registration_end: datetime
    max_participants: int
    entry_fee: float
    prize_pool: float
    room_id: Optional[str]
    status: TournamentStatus
    tournament_type: TournamentType
    created_by: int
    created_at: datetime
    participant_count: int
    is_registered: bool = False
    
    class Config:
        orm_mode = True

# Registration Schemas
class RegistrationCreate(BaseModel):
    tournament_id: int

class RegistrationResponse(BaseModel):
    id: int
    user_id: int
    tournament_id: int
    registered_at: datetime
    payment_status: str
    
    class Config:
        orm_mode = True

# Match Result Schemas
class MatchResultCreate(BaseModel):
    tournament_id: int
    rank: int
    kills: int = 0
    score: int = 0
    screenshot_url: Optional[str] = None

class MatchResultResponse(BaseModel):
    id: int
    user_id: int
    tournament_id: int
    rank: int
    kills: int
    score: int
    screenshot_url: Optional[str]
    verified: bool
    xp_gained: int
    prize_amount: float
    submitted_at: datetime
    verified_at: Optional[datetime]
    
    class Config:
        orm_mode = True

# Notification Schemas
class NotificationCreate(BaseModel):
    user_id: int
    title: str
    message: str
    type: str = "info"

class NotificationResponse(BaseModel):
    id: int
    title: str
    message: str
    type: str
    read: bool
    created_at: datetime
    
    class Config:
        orm_mode = True

# Payment Schemas
class PaymentCreate(BaseModel):
    tournament_id: int
    amount: float
    type: str
    payment_method: Optional[str] = None

class PaymentResponse(BaseModel):
    id: int
    user_id: int
    tournament_id: int
    amount: float
    type: str
    status: PaymentStatus
    payment_method: Optional[str]
    transaction_id: Optional[str]
    created_at: datetime
    
    class Config:
        orm_mode = True

# Authentication Schemas
class Token(BaseModel):
    access_token: str
    token_type: str
    expires_in: int
    user: UserResponse

class TokenData(BaseModel):
    email: Optional[str] = None
    user_id: Optional[int] = None

# Leaderboard Schemas
class LeaderboardEntry(BaseModel):
    rank: int
    user_id: int
    username: str
    xp: int
    level: int
    total_wins: int
    total_tournaments: int
    win_rate: float
    favorite_game: Optional[str]

class LeaderboardResponse(BaseModel):
    entries: List[LeaderboardEntry]
    user_rank: Optional[int] = None
    total_players: int

# Admin Schemas
class AdminTournamentUpdate(TournamentUpdate):
    room_id: Optional[str] = None
    room_password: Optional[str] = None

class AdminUserUpdate(BaseModel):
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None
    is_verified: Optional[bool] = None
    xp: Optional[int] = None

class AdminStats(BaseModel):
    total_users: int
    total_tournaments: int
    active_tournaments: int
    total_registrations: int
    total_revenue: float
    avg_participants_per_tournament: float

# Error Schemas
class ErrorResponse(BaseModel):
    detail: str
    error_code: Optional[str] = None

# Success Schemas
class SuccessResponse(BaseModel):
    message: str
    data: Optional[dict] = None
