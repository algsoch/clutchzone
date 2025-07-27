"""
Real-time WebSocket endpoints for ClutchZone
Handles live updates, chat, notifications, and tournament events
"""

from fastapi import WebSocket, WebSocketDisconnect, Depends, HTTPException
from fastapi.routing import APIRouter
import json
import asyncio
import logging
from datetime import datetime
from typing import Dict, List, Set
from sqlalchemy.orm import Session
from database import get_db
from models import User, Tournament, Match
from auth import decode_token
import redis

logger = logging.getLogger(__name__)

# Redis for pub/sub
redis_client = redis.Redis(host='localhost', port=6379, decode_responses=True)

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        # WebSocket connections
        self.active_connections: List[WebSocket] = []
        self.user_connections: Dict[int, WebSocket] = {}
        self.room_connections: Dict[str, Set[WebSocket]] = {}
        
        # Connection metadata
        self.connection_metadata: Dict[WebSocket, Dict] = {}
        
    async def connect(self, websocket: WebSocket, user_id: int = None, room: str = None):
        """Accept WebSocket connection and store metadata"""
        await websocket.accept()
        self.active_connections.append(websocket)
        
        # Store connection metadata
        metadata = {
            "user_id": user_id,
            "room": room,
            "connected_at": datetime.utcnow(),
            "last_ping": datetime.utcnow()
        }
        self.connection_metadata[websocket] = metadata
        
        # Store user-specific connection
        if user_id:
            self.user_connections[user_id] = websocket
        
        # Store room-specific connection
        if room:
            if room not in self.room_connections:
                self.room_connections[room] = set()
            self.room_connections[room].add(websocket)
        
        logger.info(f"WebSocket connected - User: {user_id}, Room: {room}, Total: {len(self.active_connections)}")
        
        # Send welcome message
        await self.send_personal_message(websocket, {
            "type": "welcome",
            "message": "Connected to ClutchZone real-time service",
            "user_id": user_id,
            "timestamp": datetime.utcnow().isoformat()
        })
        
        # Update online count
        await self.broadcast_user_count()
    
    def disconnect(self, websocket: WebSocket):
        """Remove WebSocket connection and clean up"""
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        
        # Get metadata before cleanup
        metadata = self.connection_metadata.get(websocket, {})
        user_id = metadata.get("user_id")
        room = metadata.get("room")
        
        # Remove from user connections
        if user_id and user_id in self.user_connections:
            del self.user_connections[user_id]
        
        # Remove from room connections
        if room and room in self.room_connections:
            self.room_connections[room].discard(websocket)
            if not self.room_connections[room]:
                del self.room_connections[room]
        
        # Remove metadata
        if websocket in self.connection_metadata:
            del self.connection_metadata[websocket]
        
        logger.info(f"WebSocket disconnected - User: {user_id}, Room: {room}, Total: {len(self.active_connections)}")
    
    async def send_personal_message(self, websocket: WebSocket, message: Dict):
        """Send message to specific WebSocket connection"""
        try:
            await websocket.send_text(json.dumps(message))
        except Exception as e:
            logger.error(f"Error sending personal message: {e}")
            self.disconnect(websocket)
    
    async def send_to_user(self, user_id: int, message: Dict):
        """Send message to specific user"""
        if user_id in self.user_connections:
            await self.send_personal_message(self.user_connections[user_id], message)
    
    async def send_to_room(self, room: str, message: Dict, exclude: WebSocket = None):
        """Send message to all connections in a room"""
        if room in self.room_connections:
            dead_connections = []
            for websocket in self.room_connections[room]:
                if websocket != exclude:
                    try:
                        await websocket.send_text(json.dumps(message))
                    except Exception as e:
                        logger.error(f"Error sending to room {room}: {e}")
                        dead_connections.append(websocket)
            
            # Clean up dead connections
            for dead_ws in dead_connections:
                self.disconnect(dead_ws)
    
    async def broadcast(self, message: Dict, exclude: WebSocket = None):
        """Broadcast message to all active connections"""
        dead_connections = []
        for websocket in self.active_connections:
            if websocket != exclude:
                try:
                    await websocket.send_text(json.dumps(message))
                except Exception as e:
                    logger.error(f"Error broadcasting: {e}")
                    dead_connections.append(websocket)
        
        # Clean up dead connections
        for dead_ws in dead_connections:
            self.disconnect(dead_ws)
    
    async def broadcast_user_count(self):
        """Broadcast current online user count"""
        message = {
            "type": "user_count_update",
            "count": len(self.active_connections),
            "timestamp": datetime.utcnow().isoformat()
        }
        await self.broadcast(message)
    
    def get_room_user_count(self, room: str) -> int:
        """Get number of users in a specific room"""
        return len(self.room_connections.get(room, set()))
    
    def get_online_users(self) -> List[int]:
        """Get list of online user IDs"""
        return list(self.user_connections.keys())

# Global connection manager
manager = ConnectionManager()

@router.websocket("/ws/general")
async def websocket_general(websocket: WebSocket, token: str = None):
    """General WebSocket endpoint for real-time updates"""
    user_id = None
    
    # Authenticate user if token provided
    if token:
        try:
            payload = decode_token(token)
            user_id = payload.get("sub")
        except Exception as e:
            logger.warning(f"WebSocket auth failed: {e}")
    
    await manager.connect(websocket, user_id=user_id, room="general")
    
    try:
        while True:
            # Receive and handle messages
            data = await websocket.receive_text()
            try:
                message = json.loads(data)
                await handle_websocket_message(websocket, message, user_id)
            except json.JSONDecodeError:
                await manager.send_personal_message(websocket, {
                    "type": "error",
                    "message": "Invalid JSON format"
                })
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@router.websocket("/ws/tournament/{tournament_id}")
async def websocket_tournament(websocket: WebSocket, tournament_id: int, token: str = None):
    """Tournament-specific WebSocket for live updates"""
    user_id = None
    
    # Authenticate user if token provided
    if token:
        try:
            payload = decode_token(token)
            user_id = payload.get("sub")
        except Exception as e:
            logger.warning(f"WebSocket auth failed: {e}")
    
    room = f"tournament_{tournament_id}"
    await manager.connect(websocket, user_id=user_id, room=room)
    
    # Send tournament status
    # TODO: Fetch tournament data and send initial state
    
    try:
        while True:
            data = await websocket.receive_text()
            try:
                message = json.loads(data)
                message["tournament_id"] = tournament_id
                await handle_websocket_message(websocket, message, user_id)
            except json.JSONDecodeError:
                await manager.send_personal_message(websocket, {
                    "type": "error",
                    "message": "Invalid JSON format"
                })
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@router.websocket("/ws/chat")
async def websocket_chat(websocket: WebSocket, token: str = None):
    """Chat WebSocket endpoint"""
    user_id = None
    
    # Authenticate user
    if token:
        try:
            payload = decode_token(token)
            user_id = payload.get("sub")
        except Exception as e:
            await websocket.close(code=4001, reason="Authentication failed")
            return
    else:
        # Allow anonymous chat for support
        pass
    
    await manager.connect(websocket, user_id=user_id, room="chat")
    
    try:
        while True:
            data = await websocket.receive_text()
            try:
                message = json.loads(data)
                await handle_chat_message(websocket, message, user_id)
            except json.JSONDecodeError:
                await manager.send_personal_message(websocket, {
                    "type": "error",
                    "message": "Invalid JSON format"
                })
    except WebSocketDisconnect:
        manager.disconnect(websocket)

async def handle_websocket_message(websocket: WebSocket, message: Dict, user_id: int = None):
    """Handle incoming WebSocket messages"""
    message_type = message.get("type")
    
    if message_type == "ping":
        # Handle ping/pong for connection health
        await manager.send_personal_message(websocket, {
            "type": "pong",
            "timestamp": datetime.utcnow().isoformat()
        })
        
        # Update last ping time
        if websocket in manager.connection_metadata:
            manager.connection_metadata[websocket]["last_ping"] = datetime.utcnow()
    
    elif message_type == "join_room":
        # Handle room joining
        room = message.get("room")
        if room:
            # Add to room
            if room not in manager.room_connections:
                manager.room_connections[room] = set()
            manager.room_connections[room].add(websocket)
            
            await manager.send_personal_message(websocket, {
                "type": "room_joined",
                "room": room,
                "user_count": len(manager.room_connections[room])
            })
    
    elif message_type == "leave_room":
        # Handle room leaving
        room = message.get("room")
        if room and room in manager.room_connections:
            manager.room_connections[room].discard(websocket)
            if not manager.room_connections[room]:
                del manager.room_connections[room]
            
            await manager.send_personal_message(websocket, {
                "type": "room_left",
                "room": room
            })
    
    elif message_type == "tournament_update":
        # Handle tournament updates (admin only)
        tournament_id = message.get("tournament_id")
        if tournament_id:
            room = f"tournament_{tournament_id}"
            await manager.send_to_room(room, {
                "type": "tournament_update",
                "data": message.get("data"),
                "timestamp": datetime.utcnow().isoformat()
            }, exclude=websocket)
    
    else:
        # Unknown message type
        await manager.send_personal_message(websocket, {
            "type": "error",
            "message": f"Unknown message type: {message_type}"
        })

async def handle_chat_message(websocket: WebSocket, message: Dict, user_id: int = None):
    """Handle chat messages"""
    message_type = message.get("type")
    
    if message_type == "chat_message":
        content = message.get("content", "").strip()
        if not content:
            return
        
        # Create chat message object
        chat_message = {
            "type": "chat_message",
            "user_id": user_id,
            "username": message.get("username", "Anonymous"),
            "content": content,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        # Broadcast to all chat participants
        await manager.send_to_room("chat", chat_message, exclude=websocket)
        
        # Store in Redis for chat history
        redis_client.lpush("chat_history", json.dumps(chat_message))
        redis_client.ltrim("chat_history", 0, 99)  # Keep last 100 messages
    
    elif message_type == "typing":
        # Handle typing indicators
        typing_message = {
            "type": "typing",
            "user_id": user_id,
            "username": message.get("username", "Anonymous"),
            "timestamp": datetime.utcnow().isoformat()
        }
        
        await manager.send_to_room("chat", typing_message, exclude=websocket)

# Background tasks for real-time updates
async def tournament_status_updater():
    """Background task to send tournament status updates"""
    while True:
        try:
            # Get active tournaments and broadcast updates
            # This would integrate with your database
            
            message = {
                "type": "tournament_status",
                "active_tournaments": 15,  # Replace with actual count
                "timestamp": datetime.utcnow().isoformat()
            }
            
            await manager.broadcast(message)
            
        except Exception as e:
            logger.error(f"Error in tournament status updater: {e}")
        
        await asyncio.sleep(30)  # Update every 30 seconds

async def system_stats_updater():
    """Background task to send system statistics"""
    while True:
        try:
            import psutil
            
            stats = {
                "type": "system_stats",
                "online_users": len(manager.active_connections),
                "cpu_usage": psutil.cpu_percent(),
                "memory_usage": psutil.virtual_memory().percent,
                "active_rooms": len(manager.room_connections),
                "timestamp": datetime.utcnow().isoformat()
            }
            
            # Send to admin room only
            await manager.send_to_room("admin", stats)
            
        except Exception as e:
            logger.error(f"Error in system stats updater: {e}")
        
        await asyncio.sleep(10)  # Update every 10 seconds

# Utility functions for other modules to send real-time updates
async def send_tournament_update(tournament_id: int, update_data: Dict):
    """Send tournament update to all connected clients"""
    room = f"tournament_{tournament_id}"
    message = {
        "type": "tournament_update",
        "tournament_id": tournament_id,
        "data": update_data,
        "timestamp": datetime.utcnow().isoformat()
    }
    await manager.send_to_room(room, message)

async def send_user_notification(user_id: int, notification: Dict):
    """Send notification to specific user"""
    message = {
        "type": "notification",
        "data": notification,
        "timestamp": datetime.utcnow().isoformat()
    }
    await manager.send_to_user(user_id, message)

async def send_global_announcement(announcement: Dict):
    """Send global announcement to all users"""
    message = {
        "type": "announcement",
        "data": announcement,
        "timestamp": datetime.utcnow().isoformat()
    }
    await manager.broadcast(message)

# Export the manager for use in other modules
def get_connection_manager():
    return manager
