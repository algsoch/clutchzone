#!/usr/bin/env python3
"""
Script to create a test user for ClutchZone
"""

import os
import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from passlib.context import CryptContext

# Add the parent directory to the path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from models import User, Base
from database import DATABASE_URL

# Create database engine
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_test_user():
    """Create a test user for the tournaments"""
    db = SessionLocal()
    
    try:
        # Check if user already exists
        existing_user = db.query(User).filter(User.username == "admin").first()
        if existing_user:
            print("Test user already exists")
            return

        # Create test user
        hashed_password = pwd_context.hash("admin123")
        test_user = User(
            email="admin@clutchzone.com",
            username="admin",
            password_hash=hashed_password,
            role="admin",
            is_active=True,
            is_verified=True
        )
        
        db.add(test_user)
        db.commit()
        print("Test user created successfully!")
        print("Username: admin")
        print("Password: admin123")
        
    except Exception as e:
        db.rollback()
        print(f"Error creating test user: {str(e)}")
        
    finally:
        db.close()

if __name__ == "__main__":
    create_test_user()
