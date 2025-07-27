from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, Any, Optional
import json

from database import get_db
from models import User, Tournament, Registration, MatchResult
from schemas import SuccessResponse
import auth
from services.ai_service import ai_service

router = APIRouter()

@router.post("/chat", response_model=Dict[str, Any])
async def chat_with_ai(
    request: Dict[str, Any],
    current_user: User = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db)
):
    """Chat with AI assistant about ClutchZone features"""
    
    user_message = request.get("message", "")
    if not user_message:
        raise HTTPException(status_code=400, detail="Message is required")
    
    # Get user context
    user_context = {
        "username": current_user.username,
        "email": current_user.email,
        "xp": current_user.xp,
        "level": current_user.level,
        "wins": current_user.wins,
        "losses": current_user.losses,
        "role": current_user.role
    }
    
    # Get recent tournaments
    recent_tournaments = db.query(Tournament).filter(
        Tournament.status == "active"
    ).limit(5).all()
    
    user_context["recent_tournaments"] = [
        {
            "name": t.name,
            "game": t.game,
            "entry_fee": t.entry_fee,
            "prize_pool": t.prize_pool,
            "start_date": t.start_date.isoformat() if t.start_date else None
        }
        for t in recent_tournaments
    ]
    
    # Get user's registrations
    user_registrations = db.query(Registration).filter(
        Registration.user_id == current_user.id
    ).limit(5).all()
    
    user_context["user_tournaments"] = [
        {
            "tournament_id": r.tournament_id,
            "status": r.status,
            "registered_at": r.registered_at.isoformat() if r.registered_at else None
        }
        for r in user_registrations
    ]
    
    try:
        ai_response = await ai_service.chat_with_ai(user_message, user_context)
        
        return {
            "response": ai_response,
            "user_message": user_message,
            "timestamp": "2025-07-16T00:00:00Z"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI service error: {str(e)}")

@router.post("/tournament-suggestions", response_model=Dict[str, Any])
async def get_tournament_suggestions(
    current_user: User = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get personalized tournament suggestions"""
    
    # Get user's preferred games (from match history)
    user_games = db.query(MatchResult.game).filter(
        MatchResult.user_id == current_user.id
    ).distinct().limit(5).all()
    
    games_list = [game[0] for game in user_games] if user_games else ["General"]
    
    # Determine skill level based on win rate
    total_matches = current_user.wins + current_user.losses
    if total_matches > 0:
        win_rate = current_user.wins / total_matches
        if win_rate >= 0.8:
            skill_level = "Expert"
        elif win_rate >= 0.6:
            skill_level = "Advanced"
        elif win_rate >= 0.4:
            skill_level = "Intermediate"
        else:
            skill_level = "Beginner"
    else:
        skill_level = "Beginner"
    
    try:
        suggestions = await ai_service.get_tournament_suggestions(games_list, skill_level)
        
        return {
            "suggestions": suggestions,
            "user_games": games_list,
            "skill_level": skill_level,
            "win_rate": current_user.wins / max(total_matches, 1)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI service error: {str(e)}")

@router.post("/analyze-performance", response_model=Dict[str, Any])
async def analyze_match_performance(
    request: Dict[str, Any],
    current_user: User = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db)
):
    """Analyze user's match performance"""
    
    match_id = request.get("match_id")
    if not match_id:
        raise HTTPException(status_code=400, detail="Match ID is required")
    
    # Get match data
    match = db.query(MatchResult).filter(
        MatchResult.id == match_id,
        MatchResult.user_id == current_user.id
    ).first()
    
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    
    match_data = {
        "game": match.game,
        "result": match.result,
        "score": match.score,
        "duration": match.duration,
        "xp_gained": match.xp_gained,
        "played_at": match.played_at.isoformat() if match.played_at else None
    }
    
    try:
        analysis = await ai_service.analyze_match_performance(match_data)
        
        return {
            "analysis": analysis,
            "match_data": match_data,
            "user_stats": {
                "total_wins": current_user.wins,
                "total_losses": current_user.losses,
                "current_xp": current_user.xp,
                "level": current_user.level
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI service error: {str(e)}")

@router.get("/leaderboard-insights", response_model=Dict[str, Any])
async def get_leaderboard_insights(
    current_user: User = Depends(auth.get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get insights about user's leaderboard position"""
    
    # Get user's ranking
    user_rank = db.query(User).filter(
        User.xp > current_user.xp
    ).count() + 1
    
    total_users = db.query(User).filter(User.is_active == True).count()
    
    # Get top 10 users
    top_users = db.query(User).order_by(User.xp.desc()).limit(10).all()
    
    user_stats = {
        "rank": user_rank,
        "total_users": total_users,
        "xp": current_user.xp,
        "level": current_user.level,
        "wins": current_user.wins,
        "losses": current_user.losses,
        "win_rate": current_user.wins / max(current_user.wins + current_user.losses, 1),
        "top_10_threshold": top_users[9].xp if len(top_users) >= 10 else 0,
        "next_level_xp": (current_user.level + 1) * 1000  # Assuming 1000 XP per level
    }
    
    try:
        insights = await ai_service.get_leaderboard_insights(user_stats)
        
        return {
            "insights": insights,
            "user_stats": user_stats,
            "improvement_needed": user_stats["next_level_xp"] - current_user.xp
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI service error: {str(e)}")

@router.post("/quick-help", response_model=Dict[str, Any])
async def get_quick_help(
    request: Dict[str, Any],
    current_user: User = Depends(auth.get_current_active_user)
):
    """Get quick help for common questions"""
    
    topic = request.get("topic", "general")
    
    quick_help_responses = {
        "tournaments": "I can help you find tournaments, register for events, understand rules, and track your progress. What specific tournament question do you have?",
        "profile": "I can help you optimize your profile, understand your stats, improve your ranking, and manage your account settings. What would you like to know?",
        "wallet": "I can help you with payments, transaction history, earnings, and wallet management. What wallet-related question do you have?",
        "matches": "I can help you schedule matches, understand results, analyze performance, and view replays. What match-related help do you need?",
        "leaderboard": "I can explain rankings, help you climb the leaderboard, understand XP system, and compare with other players. What ranking question do you have?",
        "general": "I'm your ClutchZone AI assistant! I can help with tournaments, profiles, wallet, matches, leaderboards, and more. What would you like to know?"
    }
    
    response = quick_help_responses.get(topic, quick_help_responses["general"])
    
    return {
        "response": response,
        "topic": topic,
        "available_topics": list(quick_help_responses.keys())
    }
