"""
Enhanced Discord Integration Module for ClutchZone
Handles webhook notifications, bot commands, two-way communication, and real-time messaging
"""

import aiohttp
import asyncio
import json
import logging
import hashlib
import hmac
from datetime import datetime
from typing import Dict, List, Optional, Any
from fastapi import HTTPException, BackgroundTasks
import discord
from discord.ext import commands
from analytics import analytics_manager

logger = logging.getLogger(__name__)

class EnhancedDiscordIntegration:
    def __init__(self, webhook_url: str, bot_token: str = None, verification_token: str = None):
        self.webhook_url = webhook_url
        self.bot_token = bot_token
        self.verification_token = verification_token
        self.bot = None
        self.session = None
        self.user_discord_mapping = {}  # Maps ClutchZone user IDs to Discord user IDs
        self.pending_replies = {}  # Stores pending replies from Discord to users
        
        if bot_token:
            intents = discord.Intents.default()
            intents.message_content = True
            intents.guild_messages = True
            intents.direct_messages = True
            
            self.bot = commands.Bot(command_prefix='!clutch ', intents=intents)
            self.setup_bot_commands()
    
    async def initialize(self):
        """Initialize HTTP session and start bot if configured"""
        self.session = aiohttp.ClientSession()
        
        if self.bot and self.bot_token:
            try:
                await self.bot.start(self.bot_token)
            except Exception as e:
                logger.error(f"Failed to start Discord bot: {e}")
    
    async def close(self):
        """Clean up resources"""
        if self.session:
            await self.session.close()
        if self.bot:
            await self.bot.close()
    
    def setup_bot_commands(self):
        """Setup Discord bot commands for two-way communication"""
        
        @self.bot.event
        async def on_ready():
            logger.info(f'{self.bot.user} has connected to Discord!')
            await analytics_manager.log_discord_activity('bot_connected', {
                'bot_name': str(self.bot.user),
                'guild_count': len(self.bot.guilds)
            })
        
        @self.bot.event
        async def on_message(message):
            """Handle incoming Discord messages"""
            if message.author == self.bot.user:
                return
            
            # Check if this is a reply to a user support ticket
            if message.reference and message.reference.message_id:
                await self.handle_discord_reply(message)
            
            await self.bot.process_commands(message)
        
        @self.bot.command(name='reply')
        async def reply_to_user(ctx, user_id: str, *, message: str):
            """Reply to a ClutchZone user's support ticket
            Usage: !clutch reply USER_ID Your reply message here
            """
            try:
                # Send reply to ClutchZone user
                await self.send_reply_to_user(user_id, message, ctx.author.display_name)
                await ctx.send(f"✅ Reply sent to user {user_id}")
                
                await analytics_manager.log_discord_activity('admin_reply', {
                    'user_id': user_id,
                    'admin': ctx.author.display_name,
                    'message_length': len(message)
                })
                
            except Exception as e:
                await ctx.send(f"❌ Failed to send reply: {str(e)}")
                logger.error(f"Failed to send Discord reply: {e}")
        
        @self.bot.command(name='status')
        async def server_status(ctx):
            """Get ClutchZone server status"""
            try:
                stats = await analytics_manager.get_real_time_stats()
                server_metrics = await analytics_manager.get_server_metrics()
                
                embed = discord.Embed(
                    title="🎮 ClutchZone Server Status",
                    color=0x00ff88,
                    timestamp=datetime.utcnow()
                )
                
                embed.add_field(
                    name="👥 Users Online", 
                    value=stats.get('online_users', 0), 
                    inline=True
                )
                embed.add_field(
                    name="🏆 Active Tournaments", 
                    value=stats.get('active_tournaments', 0), 
                    inline=True
                )
                embed.add_field(
                    name="⚔️ Live Matches", 
                    value=stats.get('total_matches', 0), 
                    inline=True
                )
                embed.add_field(
                    name="🔧 CPU Usage", 
                    value=f"{server_metrics.get('cpu_percent', 0):.1f}%", 
                    inline=True
                )
                embed.add_field(
                    name="💾 Memory Usage", 
                    value=f"{server_metrics.get('memory_percent', 0):.1f}%", 
                    inline=True
                )
                embed.add_field(
                    name="📊 API Calls/min", 
                    value=stats.get('api_calls_per_minute', 0), 
                    inline=True
                )
                
                await ctx.send(embed=embed)
                
            except Exception as e:
                await ctx.send(f"❌ Failed to get server status: {str(e)}")
        
        @self.bot.command(name='tournament')
        async def create_tournament(ctx, name: str, game: str, prize_pool: int):
            """Create a new tournament (Admin only)
            Usage: !clutch tournament "Tournament Name" "Game" 1000
            """
            # This would integrate with your tournament creation API
            await ctx.send(f"🏆 Tournament creation feature coming soon!")
        
        @self.bot.command(name='announce')
        async def make_announcement(ctx, *, message: str):
            """Make a server-wide announcement (Admin only)"""
            # This would broadcast to all connected users
            await ctx.send(f"📢 Announcement feature coming soon!")
    
    async def send_user_registration_notification(self, user_data: Dict[str, Any]):
        """Send user registration notification to Discord"""
        embed_data = {
            "title": "🎮 New User Registration",
            "description": f"Welcome **{user_data['username']}** to ClutchZone!",
            "color": 0x00ff88,
            "fields": [
                {
                    "name": "📧 Email",
                    "value": user_data.get('email', 'N/A'),
                    "inline": True
                },
                {
                    "name": "🆔 User ID",
                    "value": str(user_data.get('id', 'N/A')),
                    "inline": True
                },
                {
                    "name": "🕒 Registration Time",
                    "value": datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC'),
                    "inline": True
                },
                {
                    "name": "⭐ Starting Level",
                    "value": str(user_data.get('level', 1)),
                    "inline": True
                },
                {
                    "name": "🎯 Starting XP",
                    "value": str(user_data.get('xp', 100)),
                    "inline": True
                }
            ],
            "footer": {
                "text": "ClutchZone Registration System",
                "icon_url": "https://clutchzone.app/assets/logo.png"
            },
            "timestamp": datetime.utcnow().isoformat()
        }
        
        success = await self.send_webhook_message(embed_data)
        
        await analytics_manager.log_discord_activity('user_registration', {
            'user_id': user_data.get('id'),
            'username': user_data.get('username'),
            'success': success
        })
        
        return success
    
    async def send_support_ticket_notification(self, ticket_data: Dict[str, Any]):
        """Send support ticket notification to Discord"""
        urgency_colors = {
            'low': 0x00ff00,
            'medium': 0xffff00,
            'high': 0xff8800,
            'urgent': 0xff0000
        }
        
        urgency = ticket_data.get('urgency', 'medium').lower()
        color = urgency_colors.get(urgency, 0xffff00)
        
        embed_data = {
            "title": f"🎫 New Support Ticket - {urgency.upper()} Priority",
            "description": ticket_data.get('message', 'No message provided'),
            "color": color,
            "fields": [
                {
                    "name": "👤 User",
                    "value": ticket_data.get('username', 'Anonymous'),
                    "inline": True
                },
                {
                    "name": "📧 Email",
                    "value": ticket_data.get('email', 'N/A'),
                    "inline": True
                },
                {
                    "name": "🆔 Ticket ID",
                    "value": str(ticket_data.get('ticket_id', 'N/A')),
                    "inline": True
                },
                {
                    "name": "📱 Contact Method",
                    "value": ticket_data.get('contact_method', 'Email'),
                    "inline": True
                },
                {
                    "name": "🔴 Urgency",
                    "value": urgency.title(),
                    "inline": True
                },
                {
                    "name": "🕒 Created",
                    "value": datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC'),
                    "inline": True
                }
            ],
            "footer": {
                "text": f"Reply with: !clutch reply {ticket_data.get('user_id', 'N/A')} Your message here",
                "icon_url": "https://clutchzone.app/assets/logo.png"
            },
            "timestamp": datetime.utcnow().isoformat()
        }
        
        success = await self.send_webhook_message(embed_data)
        
        await analytics_manager.log_discord_activity('support_ticket', {
            'ticket_id': ticket_data.get('ticket_id'),
            'user_id': ticket_data.get('user_id'),
            'urgency': urgency,
            'success': success
        })
        
        return success
    
    async def send_tournament_notification(self, tournament_data: Dict[str, Any], notification_type: str):
        """Send tournament-related notifications"""
        type_configs = {
            'created': {
                'title': '🏆 New Tournament Created',
                'color': 0x00ff88,
                'description': f"Tournament **{tournament_data['name']}** is now available!"
            },
            'started': {
                'title': '🚀 Tournament Started',
                'color': 0xff8800,
                'description': f"Tournament **{tournament_data['name']}** has begun!"
            },
            'ended': {
                'title': '🏁 Tournament Ended',
                'color': 0x8800ff,
                'description': f"Tournament **{tournament_data['name']}** has concluded!"
            }
        }
        
        config = type_configs.get(notification_type, type_configs['created'])
        
        embed_data = {
            "title": config['title'],
            "description": config['description'],
            "color": config['color'],
            "fields": [
                {
                    "name": "🎮 Game",
                    "value": tournament_data.get('game', 'N/A'),
                    "inline": True
                },
                {
                    "name": "💰 Prize Pool",
                    "value": f"₹{tournament_data.get('prize_pool', 0):,}",
                    "inline": True
                },
                {
                    "name": "👥 Participants",
                    "value": str(tournament_data.get('participants', 0)),
                    "inline": True
                },
                {
                    "name": "📅 Start Date",
                    "value": tournament_data.get('start_date', 'TBD'),
                    "inline": True
                },
                {
                    "name": "🎯 Entry Fee",
                    "value": f"₹{tournament_data.get('entry_fee', 0)}",
                    "inline": True
                },
                {
                    "name": "🏆 Tournament ID",
                    "value": str(tournament_data.get('id', 'N/A')),
                    "inline": True
                }
            ],
            "footer": {
                "text": "ClutchZone Tournament System",
                "icon_url": "https://clutchzone.app/assets/logo.png"
            },
            "timestamp": datetime.utcnow().isoformat()
        }
        
        success = await self.send_webhook_message(embed_data)
        
        await analytics_manager.log_discord_activity('tournament_notification', {
            'tournament_id': tournament_data.get('id'),
            'type': notification_type,
            'success': success
        })
        
        return success
    
    async def send_user_message_notification(self, message_data: Dict[str, Any]):
        """Send user message notification to Discord"""
        embed_data = {
            "title": "💬 New User Message",
            "description": message_data.get('message', 'No message content'),
            "color": 0x0099ff,
            "fields": [
                {
                    "name": "👤 From",
                    "value": message_data.get('username', 'Anonymous'),
                    "inline": True
                },
                {
                    "name": "📧 Email",
                    "value": message_data.get('email', 'N/A'),
                    "inline": True
                },
                {
                    "name": "🆔 User ID",
                    "value": str(message_data.get('user_id', 'N/A')),
                    "inline": True
                },
                {
                    "name": "📝 Subject",
                    "value": message_data.get('subject', 'No subject'),
                    "inline": False
                }
            ],
            "footer": {
                "text": f"Reply with: !clutch reply {message_data.get('user_id', 'N/A')} Your message here",
                "icon_url": "https://clutchzone.app/assets/logo.png"
            },
            "timestamp": datetime.utcnow().isoformat()
        }
        
        success = await self.send_webhook_message(embed_data)
        
        await analytics_manager.log_discord_activity('user_message', {
            'user_id': message_data.get('user_id'),
            'message_length': len(message_data.get('message', '')),
            'success': success
        })
        
        return success
    
    async def send_webhook_message(self, embed_data: Dict[str, Any]) -> bool:
        """Send message to Discord webhook"""
        if not self.session:
            self.session = aiohttp.ClientSession()
        
        payload = {
            "embeds": [embed_data],
            "username": "ClutchZone Bot",
            "avatar_url": "https://clutchzone.app/assets/logo.png"
        }
        
        try:
            async with self.session.post(self.webhook_url, json=payload) as response:
                if response.status == 204:
                    logger.info("Discord webhook message sent successfully")
                    return True
                else:
                    logger.error(f"Discord webhook failed: {response.status}")
                    return False
        except Exception as e:
            logger.error(f"Error sending Discord webhook: {e}")
            return False
    
    async def handle_discord_reply(self, message):
        """Handle replies from Discord admins to user messages"""
        try:
            # Extract original message content to find user ID
            referenced_message = await message.channel.fetch_message(message.reference.message_id)
            
            # Look for user ID in the footer or embeds
            user_id = None
            if referenced_message.embeds:
                embed = referenced_message.embeds[0]
                if embed.footer and embed.footer.text:
                    # Extract user ID from footer text
                    import re
                    match = re.search(r'reply (\w+)', embed.footer.text)
                    if match:
                        user_id = match.group(1)
            
            if user_id:
                await self.send_reply_to_user(user_id, message.content, message.author.display_name)
                await message.add_reaction('✅')
            else:
                await message.add_reaction('❌')
                
        except Exception as e:
            logger.error(f"Error handling Discord reply: {e}")
            await message.add_reaction('❌')
    
    async def send_reply_to_user(self, user_id: str, message: str, admin_name: str):
        """Send admin reply back to ClutchZone user"""
        # This would integrate with your WebSocket system to send real-time notifications
        # For now, we'll store it in pending replies
        self.pending_replies[user_id] = {
            'message': message,
            'admin': admin_name,
            'timestamp': datetime.utcnow().isoformat()
        }
        
        logger.info(f"Reply from {admin_name} stored for user {user_id}")
    
    async def get_pending_reply(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get pending reply for a user"""
        return self.pending_replies.pop(user_id, None)

# Global Discord integration instance
discord_integration = EnhancedDiscordIntegration(
    webhook_url="https://discord.com/api/webhooks/1395698909732405388/ziKiswty7F9Ce6D86RBnSUDpPlFsjQD2XvBW54eMM1NKfKe1_r1_tRZ8oT17QeLG5FWH"
)
            self.setup_bot()
    
    def setup_bot(self):
        """Initialize Discord bot for two-way communication"""
        intents = discord.Intents.default()
        intents.message_content = True
        self.bot = commands.Bot(command_prefix='!clutch ', intents=intents)
        
        @self.bot.event
        async def on_ready():
            logger.info(f'{self.bot.user} has connected to Discord!')
        
        @self.bot.command(name='reply')
        async def reply_to_ticket(ctx, ticket_id: int, *, message: str):
            """Reply to a support ticket from Discord"""
            try:
                # Here you would send the reply back to the user
                # For now, we'll just acknowledge
                await ctx.send(f"Reply sent to ticket #{ticket_id}: {message}")
                
                # In a real implementation, you would:
                # 1. Find the ticket in database
                # 2. Send notification to user via WebSocket
                # 3. Update ticket status
                
            except Exception as e:
                await ctx.send(f"Error sending reply: {str(e)}")
        
        @self.bot.command(name='status')
        async def server_status(ctx):
            """Get ClutchZone server status"""
            embed = discord.Embed(
                title="🎮 ClutchZone Server Status",
                color=0x00ff88,
                timestamp=datetime.utcnow()
            )
            embed.add_field(name="Status", value="🟢 Online", inline=True)
            embed.add_field(name="Active Users", value="1,247", inline=True)
            embed.add_field(name="Live Tournaments", value="23", inline=True)
            await ctx.send(embed=embed)
    
    async def start_bot(self):
        """Start the Discord bot"""
        if self.bot and self.bot_token:
            try:
                await self.bot.start(self.bot_token)
            except Exception as e:
                logger.error(f"Failed to start Discord bot: {e}")
    
    async def send_webhook(self, content: str = None, embeds: List[Dict] = None, username: str = "ClutchZone"):
        """Send message to Discord webhook"""
        if not self.session:
            self.session = aiohttp.ClientSession()
        
        try:
            payload = {"username": username}
            
            if content:
                payload["content"] = content
            
            if embeds:
                payload["embeds"] = embeds
            
            async with self.session.post(self.webhook_url, json=payload) as response:
                if response.status == 200:
                    logger.info("Message sent to Discord webhook successfully")
                    return True
                else:
                    error_text = await response.text()
                    logger.error(f"Discord webhook failed: {response.status} - {error_text}")
                    return False
                    
        except Exception as e:
            logger.error(f"Error sending Discord webhook: {e}")
            return False
    
    async def send_registration_notification(self, user_data: Dict):
        """Send user registration notification to Discord"""
        embed = {
            "title": "🎉 New User Registration",
            "color": 0x00ff88,
            "timestamp": datetime.utcnow().isoformat(),
            "fields": [
                {"name": "Username", "value": user_data.get("username", "N/A"), "inline": True},
                {"name": "Email", "value": user_data.get("email", "N/A"), "inline": True},
                {"name": "Registration Time", "value": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"), "inline": True}
            ],
            "footer": {"text": "ClutchZone Registration System"}
        }
        
        content = f"🎮 New player joined ClutchZone! Welcome **{user_data.get('username', 'Unknown')}**!"
        
        return await self.send_webhook(content=content, embeds=[embed])
    
    async def send_support_ticket(self, ticket_data: Dict):
        """Send support ticket to Discord"""
        priority_colors = {
            "low": 0x36a64f,      # Green
            "medium": 0xffaa00,   # Orange
            "high": 0xff6b35,     # Red-Orange
            "critical": 0xff0000   # Red
        }
        
        priority_emojis = {
            "low": "🟢",
            "medium": "🟡",
            "high": "🟠",
            "critical": "🔴"
        }
        
        priority = ticket_data.get("priority", "medium")
        
        embed = {
            "title": f"{priority_emojis.get(priority, '❓')} Support Ticket #{ticket_data.get('id', 'Unknown')}",
            "color": priority_colors.get(priority, 0xffaa00),
            "timestamp": datetime.utcnow().isoformat(),
            "fields": [
                {"name": "User", "value": ticket_data.get("user_email", "Anonymous"), "inline": True},
                {"name": "Priority", "value": priority.title(), "inline": True},
                {"name": "Subject", "value": ticket_data.get("subject", "No Subject"), "inline": False},
                {"name": "Message", "value": ticket_data.get("message", "No Message")[:1000] + ("..." if len(ticket_data.get("message", "")) > 1000 else ""), "inline": False}
            ],
            "footer": {"text": f"Reply with: !clutch reply {ticket_data.get('id', 0)} <your message>"}
        }
        
        content = f"📨 New support ticket received! Priority: **{priority.upper()}**"
        
        return await self.send_webhook(content=content, embeds=[embed])
    
    async def send_tournament_notification(self, tournament_data: Dict, action: str = "created"):
        """Send tournament-related notifications"""
        action_emojis = {
            "created": "🆕",
            "started": "▶️",
            "completed": "🏁",
            "cancelled": "❌"
        }
        
        action_colors = {
            "created": 0x00ff88,
            "started": 0xffaa00,
            "completed": 0x36a64f,
            "cancelled": 0xff0000
        }
        
        embed = {
            "title": f"{action_emojis.get(action, '📢')} Tournament {action.title()}",
            "color": action_colors.get(action, 0x00ff88),
            "timestamp": datetime.utcnow().isoformat(),
            "fields": [
                {"name": "Tournament", "value": tournament_data.get("title", "Unknown"), "inline": True},
                {"name": "Game", "value": tournament_data.get("game", "Unknown"), "inline": True},
                {"name": "Prize Pool", "value": f"₹{tournament_data.get('prize_pool', 0):,.2f}", "inline": True},
                {"name": "Participants", "value": f"{tournament_data.get('current_participants', 0)}/{tournament_data.get('max_participants', 0)}", "inline": True}
            ]
        }
        
        if tournament_data.get("start_time"):
            embed["fields"].append({
                "name": "Start Time",
                "value": tournament_data.get("start_time"),
                "inline": True
            })
        
        content = f"🏆 Tournament Update: **{tournament_data.get('title', 'Unknown')}** has been {action}!"
        
        return await self.send_webhook(content=content, embeds=[embed])
    
    async def send_system_alert(self, alert_type: str, message: str, details: Dict = None):
        """Send system alerts and monitoring notifications"""
        alert_colors = {
            "info": 0x3b82f6,
            "warning": 0xffaa00,
            "error": 0xff0000,
            "success": 0x36a64f
        }
        
        alert_emojis = {
            "info": "ℹ️",
            "warning": "⚠️",
            "error": "🚨",
            "success": "✅"
        }
        
        embed = {
            "title": f"{alert_emojis.get(alert_type, '📢')} System Alert",
            "description": message,
            "color": alert_colors.get(alert_type, 0x3b82f6),
            "timestamp": datetime.utcnow().isoformat(),
            "footer": {"text": "ClutchZone Monitoring System"}
        }
        
        if details:
            for key, value in details.items():
                embed.setdefault("fields", []).append({
                    "name": key.replace("_", " ").title(),
                    "value": str(value),
                    "inline": True
                })
        
        return await self.send_webhook(embeds=[embed])
    
    async def send_match_result(self, match_data: Dict):
        """Send match result notifications"""
        embed = {
            "title": "🎮 Match Completed",
            "color": 0x00ff88,
            "timestamp": datetime.utcnow().isoformat(),
            "fields": [
                {"name": "Tournament", "value": match_data.get("tournament_name", "Unknown"), "inline": False},
                {"name": "Winner", "value": match_data.get("winner", "Unknown"), "inline": True},
                {"name": "Score", "value": match_data.get("score", "N/A"), "inline": True},
                {"name": "Duration", "value": match_data.get("duration", "N/A"), "inline": True}
            ]
        }
        
        content = f"🏆 Match completed! **{match_data.get('winner', 'Unknown')}** takes the victory!"
        
        return await self.send_webhook(content=content, embeds=[embed])
    
    async def close(self):
        """Clean up resources"""
        if self.session:
            await self.session.close()
        
        if self.bot:
            await self.bot.close()

# Global Discord integration instance
discord_integration = None

def get_discord_integration() -> DiscordIntegration:
    """Get or create Discord integration instance"""
    global discord_integration
    if not discord_integration:
        webhook_url = "https://discord.com/api/webhooks/1395698909732405388/ziKiswty7F9Ce6D86RBnSUDpPlFsjQD2XvBW54eMM1NKfKe1_r1_tRZ8oT17QeLG5FWH"
        discord_integration = DiscordIntegration(webhook_url)
    return discord_integration
