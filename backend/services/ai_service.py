import google.generativeai as genai
import json
import os
from typing import Dict, Any, Optional
from fastapi import HTTPException

class AIService:
    def __init__(self):
        self.api_key = "AIzaSyDxYQ8CYXJAxlz6Stj72iTnokxWjleTgZI"
        genai.configure(api_key=self.api_key)
        self.model = genai.GenerativeModel('gemini-1.5-flash')
        
    async def chat_with_ai(self, user_message: str, context: Optional[Dict[str, Any]] = None) -> str:
        """Chat with AI agent about ClutchZone features"""
        
        # System prompt for ClutchZone AI Agent
        system_prompt = """
        You are ClutchZone AI Assistant, an expert gaming and esports platform assistant.
        
        You help users with:
        - Tournament registration and management
        - Profile optimization and statistics
        - Leaderboard rankings and achievements
        - Match scheduling and results
        - Payment and wallet management
        - Gaming tips and strategies
        - Platform features and navigation
        
        Available ClutchZone features:
        - Real-time tournaments across multiple games
        - XP and leveling system
        - Global and game-specific leaderboards
        - Match replay system
        - Wallet and payment processing
        - Admin panel for tournament management
        - Contact and support system
        
        Always be helpful, gaming-focused, and provide actionable advice.
        Keep responses concise but informative.
        """
        
        try:
            # Prepare the full prompt
            context_str = ""
            if context:
                context_str = f"User context: {json.dumps(context)}\n\n"
            
            full_prompt = f"{system_prompt}\n\n{context_str}User: {user_message}"
            
            # Generate response
            response = self.model.generate_content(full_prompt)
            
            return response.text
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"AI service error: {str(e)}")
    
    async def get_tournament_suggestions(self, user_games: list, user_skill_level: str) -> str:
        """Get personalized tournament suggestions"""
        
        prompt = f"""
        Based on user preferences:
        - Games: {', '.join(user_games)}
        - Skill level: {user_skill_level}
        
        Suggest 3-5 tournaments they should participate in and explain why.
        Include strategy tips for each game.
        """
        
        return await self.chat_with_ai(prompt)
    
    async def analyze_match_performance(self, match_data: Dict[str, Any]) -> str:
        """Analyze match performance and provide improvement suggestions"""
        
        prompt = f"""
        Analyze this match performance:
        {json.dumps(match_data, indent=2)}
        
        Provide:
        1. Performance analysis
        2. Areas for improvement
        3. Specific strategies for next matches
        4. Training recommendations
        """
        
        return await self.chat_with_ai(prompt)
    
    async def get_leaderboard_insights(self, user_stats: Dict[str, Any]) -> str:
        """Get insights about leaderboard position and improvement tips"""
        
        prompt = f"""
        User leaderboard stats:
        {json.dumps(user_stats, indent=2)}
        
        Provide insights about:
        1. Current ranking analysis
        2. Path to next level/rank
        3. Comparison with top players
        4. Specific improvement strategies
        """
        
        return await self.chat_with_ai(prompt)

# Global AI service instance
ai_service = AIService()
