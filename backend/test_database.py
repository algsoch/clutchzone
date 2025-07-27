#!/usr/bin/env python3
"""
Test script to check database connectivity and data
"""

import os
import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Add the parent directory to the path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from models import Tournament, User, Base
from database import DATABASE_URL

# Create database engine
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def test_database():
    """Test database connectivity and data"""
    db = SessionLocal()
    
    try:
        # Test users
        users = db.query(User).all()
        print(f"Users in database: {len(users)}")
        for user in users:
            print(f"  - {user.username} ({user.email})")
        
        # Test tournaments
        tournaments = db.query(Tournament).all()
        print(f"\nTournaments in database: {len(tournaments)}")
        for tournament in tournaments:
            print(f"  - {tournament.name} ({tournament.game}) - {tournament.status}")
            
    except Exception as e:
        print(f"Database error: {str(e)}")
        
    finally:
        db.close()

if __name__ == "__main__":
    test_database()
