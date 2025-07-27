"""
Advanced Analytics and API Access Monitoring System for ClutchZone
Tracks all API calls, user interactions, Discord notifications, and server metrics
"""

import asyncio
import json
import logging
import time
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from collections import defaultdict, Counter
from fastapi import Request, Response
from sqlalchemy.orm import Session
import redis
import aioredis
from prometheus_client import Counter as PrometheusCounter, Histogram, Gauge, generate_latest
import psutil
import platform

# Prometheus metrics
API_REQUESTS = PrometheusCounter('api_requests_total', 'Total API requests', ['method', 'endpoint', 'status'])
API_LATENCY = Histogram('api_request_duration_seconds', 'API request latency')
ACTIVE_USERS = Gauge('active_users', 'Currently active users')
DISCORD_NOTIFICATIONS = PrometheusCounter('discord_notifications_total', 'Discord notifications sent', ['type'])
SERVER_RESOURCES = Gauge('server_resources', 'Server resource usage', ['resource'])

logger = logging.getLogger(__name__)

class AnalyticsManager:
    def __init__(self, redis_url: str = "redis://localhost:6379"):
        self.redis_url = redis_url
        self.redis_client = None
        self.access_logs = []
        self.user_sessions = {}
        self.api_stats = defaultdict(int)
        self.real_time_metrics = {
            'online_users': 0,
            'active_tournaments': 0,
            'total_matches': 0,
            'api_calls_per_minute': 0,
            'discord_messages_sent': 0,
            'server_health': 'healthy'
        }
        
    async def initialize(self):
        """Initialize Redis connection and start background tasks"""
        try:
            self.redis_client = await aioredis.from_url(self.redis_url, decode_responses=True)
            await self.redis_client.ping()
            logger.info("Analytics Redis connection established")
            
            # Start background tasks
            asyncio.create_task(self.update_real_time_metrics())
            asyncio.create_task(self.cleanup_old_data())
            
        except Exception as e:
            logger.error(f"Failed to initialize analytics Redis: {e}")
            # Fallback to in-memory storage
            self.redis_client = None

    async def log_api_access(self, request: Request, response: Response, process_time: float):
        """Log detailed API access information"""
        timestamp = datetime.utcnow()
        user_agent = request.headers.get("user-agent", "unknown")
        ip_address = request.client.host if request.client else "unknown"
        
        # Extract user ID from JWT token if available
        user_id = await self._extract_user_id(request)
        
        access_log = {
            'timestamp': timestamp.isoformat(),
            'method': request.method,
            'endpoint': str(request.url),
            'path': request.url.path,
            'status_code': response.status_code,
            'process_time': process_time,
            'ip_address': ip_address,
            'user_agent': user_agent,
            'user_id': user_id,
            'request_size': len(await self._get_request_body(request)),
            'response_size': self._get_response_size(response),
            'query_params': dict(request.query_params),
            'headers': dict(request.headers)
        }
        
        # Store in Redis with TTL
        if self.redis_client:
            key = f"api_log:{timestamp.timestamp()}"
            await self.redis_client.setex(key, 86400 * 7, json.dumps(access_log))  # 7 days TTL
        
        # Store in memory for immediate access
        self.access_logs.append(access_log)
        if len(self.access_logs) > 1000:  # Keep only last 1000 logs in memory
            self.access_logs.pop(0)
        
        # Update Prometheus metrics
        API_REQUESTS.labels(method=request.method, endpoint=request.url.path, status=response.status_code).inc()
        API_LATENCY.observe(process_time)
        
        # Update API stats
        endpoint_key = f"{request.method}:{request.url.path}"
        self.api_stats[endpoint_key] += 1
        
        logger.info(f"API Access: {request.method} {request.url.path} - {response.status_code} - {process_time:.3f}s - User: {user_id}")
        
    async def log_discord_activity(self, activity_type: str, data: Dict[str, Any]):
        """Log Discord webhook and bot activities"""
        timestamp = datetime.utcnow()
        
        discord_log = {
            'timestamp': timestamp.isoformat(),
            'type': activity_type,
            'data': data,
            'success': data.get('success', False)
        }
        
        if self.redis_client:
            key = f"discord_log:{timestamp.timestamp()}"
            await self.redis_client.setex(key, 86400 * 30, json.dumps(discord_log))  # 30 days TTL
        
        # Update metrics
        DISCORD_NOTIFICATIONS.labels(type=activity_type).inc()
        self.real_time_metrics['discord_messages_sent'] += 1
        
        logger.info(f"Discord Activity: {activity_type} - {data}")

    async def track_user_session(self, user_id: str, action: str, data: Dict[str, Any] = None):
        """Track user session activities"""
        timestamp = datetime.utcnow()
        
        if user_id not in self.user_sessions:
            self.user_sessions[user_id] = {
                'first_seen': timestamp,
                'last_activity': timestamp,
                'actions': [],
                'total_actions': 0
            }
        
        session = self.user_sessions[user_id]
        session['last_activity'] = timestamp
        session['total_actions'] += 1
        session['actions'].append({
            'timestamp': timestamp.isoformat(),
            'action': action,
            'data': data or {}
        })
        
        # Keep only last 50 actions per user
        if len(session['actions']) > 50:
            session['actions'] = session['actions'][-50:]
        
        # Store in Redis
        if self.redis_client:
            key = f"user_session:{user_id}"
            await self.redis_client.setex(key, 86400, json.dumps(session, default=str))  # 24 hours TTL

    async def get_real_time_stats(self) -> Dict[str, Any]:
        """Get current real-time statistics"""
        # Update active users count
        active_users = len([s for s in self.user_sessions.values() 
                           if (datetime.utcnow() - s['last_activity']).seconds < 300])  # 5 minutes
        
        ACTIVE_USERS.set(active_users)
        self.real_time_metrics['online_users'] = active_users
        
        # Calculate API calls per minute
        current_time = time.time()
        recent_logs = [log for log in self.access_logs 
                      if current_time - datetime.fromisoformat(log['timestamp']).timestamp() < 60]
        self.real_time_metrics['api_calls_per_minute'] = len(recent_logs)
        
        return self.real_time_metrics.copy()

    async def get_api_analytics(self, hours: int = 24) -> Dict[str, Any]:
        """Get comprehensive API analytics"""
        current_time = datetime.utcnow()
        start_time = current_time - timedelta(hours=hours)
        
        # Filter logs by time period
        filtered_logs = [log for log in self.access_logs 
                        if datetime.fromisoformat(log['timestamp']) >= start_time]
        
        # Analyze data
        total_requests = len(filtered_logs)
        unique_users = len(set(log['user_id'] for log in filtered_logs if log['user_id']))
        avg_response_time = sum(log['process_time'] for log in filtered_logs) / total_requests if total_requests > 0 else 0
        
        # Group by endpoint
        endpoint_stats = Counter(f"{log['method']}:{log['path']}" for log in filtered_logs)
        
        # Group by status code
        status_stats = Counter(log['status_code'] for log in filtered_logs)
        
        # Group by hour
        hourly_stats = defaultdict(int)
        for log in filtered_logs:
            hour = datetime.fromisoformat(log['timestamp']).strftime('%Y-%m-%d %H:00')
            hourly_stats[hour] += 1
        
        return {
            'total_requests': total_requests,
            'unique_users': unique_users,
            'average_response_time': avg_response_time,
            'endpoint_stats': dict(endpoint_stats.most_common(10)),
            'status_code_stats': dict(status_stats),
            'hourly_stats': dict(hourly_stats),
            'error_rate': status_stats.get(500, 0) / total_requests if total_requests > 0 else 0
        }

    async def get_server_metrics(self) -> Dict[str, Any]:
        """Get server performance metrics"""
        cpu_percent = psutil.cpu_percent(interval=1)
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage('/')
        
        # Update Prometheus metrics
        SERVER_RESOURCES.labels(resource='cpu_percent').set(cpu_percent)
        SERVER_RESOURCES.labels(resource='memory_percent').set(memory.percent)
        SERVER_RESOURCES.labels(resource='disk_percent').set(disk.percent)
        
        return {
            'cpu_percent': cpu_percent,
            'memory_percent': memory.percent,
            'memory_available_gb': memory.available / (1024**3),
            'disk_percent': disk.percent,
            'disk_free_gb': disk.free / (1024**3),
            'platform': platform.system(),
            'python_version': platform.python_version(),
            'uptime_seconds': time.time() - psutil.boot_time()
        }

    async def update_real_time_metrics(self):
        """Background task to update real-time metrics"""
        while True:
            try:
                await self.get_real_time_stats()
                await self.get_server_metrics()
                await asyncio.sleep(30)  # Update every 30 seconds
            except Exception as e:
                logger.error(f"Error updating real-time metrics: {e}")
                await asyncio.sleep(60)

    async def cleanup_old_data(self):
        """Background task to clean up old data"""
        while True:
            try:
                # Clean up old access logs from memory
                cutoff_time = datetime.utcnow() - timedelta(hours=24)
                self.access_logs = [log for log in self.access_logs 
                                   if datetime.fromisoformat(log['timestamp']) > cutoff_time]
                
                # Clean up old user sessions
                active_cutoff = datetime.utcnow() - timedelta(hours=24)
                inactive_users = [user_id for user_id, session in self.user_sessions.items()
                                 if session['last_activity'] < active_cutoff]
                for user_id in inactive_users:
                    del self.user_sessions[user_id]
                
                logger.info(f"Cleaned up {len(inactive_users)} inactive user sessions")
                await asyncio.sleep(3600)  # Run every hour
                
            except Exception as e:
                logger.error(f"Error during cleanup: {e}")
                await asyncio.sleep(3600)

    async def _extract_user_id(self, request: Request) -> Optional[str]:
        """Extract user ID from JWT token"""
        try:
            auth_header = request.headers.get("authorization")
            if auth_header and auth_header.startswith("Bearer "):
                # This would normally decode the JWT token
                # For now, return a placeholder
                return "user_from_token"
            return None
        except Exception:
            return None

    async def _get_request_body(self, request: Request) -> bytes:
        """Get request body size"""
        try:
            return await request.body()
        except Exception:
            return b""

    def _get_response_size(self, response: Response) -> int:
        """Get response body size"""
        try:
            if hasattr(response, 'body'):
                return len(response.body)
            return 0
        except Exception:
            return 0

# Global analytics manager instance
analytics_manager = AnalyticsManager()

# Middleware function
async def analytics_middleware(request: Request, call_next):
    """FastAPI middleware to track all API calls"""
    start_time = time.time()
    
    response = await call_next(request)
    
    process_time = time.time() - start_time
    await analytics_manager.log_api_access(request, response, process_time)
    
    return response
