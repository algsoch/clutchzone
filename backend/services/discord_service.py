import aiohttp
import json
from typing import Dict, Any
import os

class DiscordService:
    def __init__(self):
        # You'll need to set this webhook URL in your environment
        self.webhook_url = os.getenv("DISCORD_WEBHOOK_URL", "")
        
    async def send_welcome_message(self, user_data: Dict[str, Any]) -> bool:
        """Send welcome message to Discord when user registers"""
        
        if not self.webhook_url:
            print("Discord webhook URL not configured")
            return False
            
        try:
            embed = {
                "title": "🎮 New Player Joined ClutchZone!",
                "description": f"Welcome **{user_data.get('username', 'Unknown')}** to the arena!",
                "color": 0x00ff00,  # Green color
                "fields": [
                    {
                        "name": "Username",
                        "value": user_data.get('username', 'Unknown'),
                        "inline": True
                    },
                    {
                        "name": "Email",
                        "value": user_data.get('email', 'Unknown'),
                        "inline": True
                    },
                    {
                        "name": "Starting XP",
                        "value": str(user_data.get('xp', 1000)),
                        "inline": True
                    }
                ],
                "footer": {
                    "text": "ClutchZone Elite Gaming Platform",
                    "icon_url": "https://cdn.discordapp.com/attachments/your-icon-url"
                },
                "timestamp": user_data.get('created_at', '').isoformat() if user_data.get('created_at') else None
            }
            
            payload = {
                "content": f"🔥 **{user_data.get('username')}** just joined the battle!",
                "embeds": [embed]
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    self.webhook_url,
                    json=payload,
                    headers={'Content-Type': 'application/json'}
                ) as response:
                    return response.status == 204
                    
        except Exception as e:
            print(f"Error sending Discord message: {e}")
            return False
    
    async def send_tournament_notification(self, tournament_data: Dict[str, Any]) -> bool:
        """Send tournament notifications to Discord"""
        
        if not self.webhook_url:
            return False
            
        try:
            embed = {
                "title": "🏆 New Tournament Alert!",
                "description": f"**{tournament_data.get('name')}** is now open for registration!",
                "color": 0xffd700,  # Gold color
                "fields": [
                    {
                        "name": "Game",
                        "value": tournament_data.get('game', 'Unknown'),
                        "inline": True
                    },
                    {
                        "name": "Entry Fee",
                        "value": f"${tournament_data.get('entry_fee', 0)}",
                        "inline": True
                    },
                    {
                        "name": "Prize Pool",
                        "value": f"${tournament_data.get('prize_pool', 0)}",
                        "inline": True
                    },
                    {
                        "name": "Start Date",
                        "value": tournament_data.get('start_date', 'TBD'),
                        "inline": True
                    },
                    {
                        "name": "Max Players",
                        "value": str(tournament_data.get('max_players', 'Unlimited')),
                        "inline": True
                    }
                ],
                "footer": {
                    "text": "Register now at ClutchZone!",
                    "icon_url": "https://cdn.discordapp.com/attachments/your-icon-url"
                }
            }
            
            payload = {
                "content": "🎯 New tournament is live! Don't miss out!",
                "embeds": [embed]
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    self.webhook_url,
                    json=payload,
                    headers={'Content-Type': 'application/json'}
                ) as response:
                    return response.status == 204
                    
        except Exception as e:
            print(f"Error sending Discord tournament notification: {e}")
            return False

# Global Discord service instance
discord_service = DiscordService()
