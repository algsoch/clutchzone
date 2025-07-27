#!/usr/bin/env python3
"""
Script to add sample tournaments to the ClutchZone database
"""

import os
import sys
from datetime import datetime, timedelta
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Add the parent directory to the path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from models import Tournament, Base
from database import DATABASE_URL

# Create database engine
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create tables
Base.metadata.create_all(bind=engine)

def add_sample_tournaments():
    """Add sample tournaments to the database"""
    db = SessionLocal()
    
    try:
        # Sample tournaments data
        tournaments_data = [
            {
                "name": "Valorant Weekly Championship",
                "description": "Weekly competitive tournament for Valorant players. Open to all skill levels.",
                "game": "Valorant",
                "entry_fee": 0.0,
                "prize_pool": 0.0,
                "max_participants": 64,
                "date": datetime.now() + timedelta(days=7),
                "registration_end": datetime.now() + timedelta(days=5),
                "status": "open",
                "tournament_type": "elimination",
                "created_by": 1
            },
            {
                "name": "CS:GO Pro League",
                "description": "Professional CS:GO tournament with cash prizes. Teams of 5 players required.",
                "game": "Counter-Strike: Global Offensive",
                "entry_fee": 25.0,
                "prize_pool": 500.0,
                "max_participants": 32,
                "date": datetime.now() + timedelta(days=14),
                "registration_end": datetime.now() + timedelta(days=10),
                "status": "open",
                "tournament_type": "elimination",
                "created_by": 1
            },
            {
                "name": "Fortnite Battle Royale",
                "description": "Free-for-all Fortnite tournament. Solo players only. Winner takes all!",
                "game": "Fortnite",
                "entry_fee": 0.0,
                "prize_pool": 0.0,
                "max_participants": 100,
                "date": datetime.now() + timedelta(days=3),
                "registration_end": datetime.now() + timedelta(days=2),
                "status": "open",
                "tournament_type": "battle_royale",
                "created_by": 1
            },
            {
                "name": "League of Legends Ranked Cup",
                "description": "Competitive LoL tournament with ranking-based seeding. Teams of 5 required.",
                "game": "League of Legends",
                "entry_fee": 15.0,
                "prize_pool": 300.0,
                "max_participants": 40,
                "date": datetime.now() + timedelta(days=21),
                "registration_end": datetime.now() + timedelta(days=18),
                "status": "open",
                "tournament_type": "team_vs_team",
                "created_by": 1
            },
            {
                "name": "Rocket League Championship",
                "description": "High-octane Rocket League tournament. 3v3 teams. Fast-paced action guaranteed!",
                "game": "Rocket League",
                "entry_fee": 10.0,
                "prize_pool": 200.0,
                "max_participants": 24,
                "date": datetime.now() + timedelta(days=10),
                "registration_end": datetime.now() + timedelta(days=8),
                "status": "open",
                "tournament_type": "elimination",
                "created_by": 1
            },
            {
                "name": "Apex Legends Squad Battle",
                "description": "Free Apex Legends tournament. Squads of 3 players. Multiple rounds, highest placement wins.",
                "game": "Apex Legends",
                "entry_fee": 0.0,
                "prize_pool": 0.0,
                "max_participants": 60,
                "date": datetime.now() + timedelta(days=5),
                "registration_end": datetime.now() + timedelta(days=4),
                "status": "open",
                "tournament_type": "battle_royale",
                "created_by": 1
            },
            {
                "name": "FIFA Ultimate Team Cup",
                "description": "FIFA 24 Ultimate Team tournament. Build your dream team and compete for prizes!",
                "game": "FIFA 24",
                "entry_fee": 20.0,
                "prize_pool": 400.0,
                "max_participants": 32,
                "date": datetime.now() + timedelta(days=12),
                "registration_end": datetime.now() + timedelta(days=9),
                "status": "open",
                "tournament_type": "elimination",
                "created_by": 1
            },
            {
                "name": "Call of Duty: Modern Warfare Tournament",
                "description": "Tactical FPS tournament. 6v6 teams. Search and Destroy mode primarily.",
                "game": "Call of Duty: Modern Warfare",
                "entry_fee": 30.0,
                "prize_pool": 600.0,
                "max_participants": 24,
                "date": datetime.now() + timedelta(days=28),
                "registration_end": datetime.now() + timedelta(days=25),
                "status": "upcoming",
                "tournament_type": "elimination",
                "created_by": 1
            }
        ]
        
        # Add tournaments to database
        for tournament_data in tournaments_data:
            # Check if tournament already exists
            existing = db.query(Tournament).filter(Tournament.name == tournament_data["name"]).first()
            if not existing:
                tournament = Tournament(**tournament_data)
                db.add(tournament)
                print(f"Added tournament: {tournament_data['name']}")
            else:
                print(f"Tournament already exists: {tournament_data['name']}")
        
        db.commit()
        print(f"\nSuccessfully added sample tournaments to the database!")
        
    except Exception as e:
        db.rollback()
        print(f"Error adding tournaments: {str(e)}")
        
    finally:
        db.close()

if __name__ == "__main__":
    add_sample_tournaments()
