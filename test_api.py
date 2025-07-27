#!/usr/bin/env python3
"""
Simple test to check if the API endpoints are working
"""

import requests
import json

BASE_URL = "http://localhost:8000"

def test_endpoints():
    """Test various API endpoints"""
    
    # Test if server is running
    try:
        response = requests.get(f"{BASE_URL}/")
        print(f"Server status: {response.status_code}")
    except Exception as e:
        print(f"Server not running: {e}")
        return
    
    # Test tournaments endpoint
    try:
        response = requests.get(f"{BASE_URL}/api/tournaments")
        print(f"Tournaments endpoint: {response.status_code}")
        if response.status_code == 200:
            tournaments = response.json()
            print(f"Number of tournaments: {len(tournaments)}")
            if tournaments:
                print(f"Sample tournament: {tournaments[0]['name']}")
    except Exception as e:
        print(f"Tournaments endpoint error: {e}")
    
    # Test auth endpoints
    try:
        response = requests.post(f"{BASE_URL}/api/auth/check-username", 
                                json={"username": "testuser"})
        print(f"Username check endpoint: {response.status_code}")
    except Exception as e:
        print(f"Username check endpoint error: {e}")

if __name__ == "__main__":
    test_endpoints()
