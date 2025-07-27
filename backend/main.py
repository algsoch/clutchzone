from fastapi import FastAPI, HTTPException, Depends, status, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.staticfiles import StaticFiles
from prometheus_client import generate_latest, CONTENT_TYPE_LATEST
import uvicorn
import os
import asyncio
from pathlib import Path

# Import routers
from routers import auth, tournaments, players, admin, ai
from routers.enhanced_admin import router as enhanced_admin_router
from database import create_tables, get_db
from analytics import analytics_manager, analytics_middleware
from discord_integration import discord_integration
from websocket_routes import router as websocket_router

app = FastAPI(
    title="ClutchZone API",
    description="Advanced Real-time Esports Tournament Platform API with Analytics",
    version="2.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add analytics middleware
app.middleware("http")(analytics_middleware)

# Security
security = HTTPBearer()

# Mount static files (for serving frontend)
frontend_path = Path(__file__).parent.parent / "frontend"
if frontend_path.exists():
    app.mount("/", StaticFiles(directory=str(frontend_path), html=True), name="static")

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(tournaments.router, prefix="/api/tournaments", tags=["Tournaments"])
app.include_router(players.router, prefix="/api/players", tags=["Players"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])
app.include_router(enhanced_admin_router, prefix="/api/admin/enhanced", tags=["Enhanced Admin"])
app.include_router(ai.router, prefix="/api/ai", tags=["AI Assistant"])
app.include_router(websocket_router, prefix="/api/ws", tags=["WebSocket"])

@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    create_tables()
    
    # Initialize analytics
    await analytics_manager.initialize()
    
    # Initialize Discord integration
    asyncio.create_task(discord_integration.initialize())
    
    print("🎮 ClutchZone API Server Started!")
    print("📊 Analytics system initialized")
    print("🤖 Discord integration ready")

@app.on_event("shutdown")
async def shutdown_event():
    """Clean up resources on shutdown"""
    await discord_integration.close()
    print("👋 ClutchZone API Server Shutdown")

@app.get("/")
async def root():
    """Root endpoint - redirects to frontend"""
    return {"message": "Welcome to ClutchZone API v2.0", "status": "online"}

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": analytics_manager.real_time_metrics.get('timestamp'),
        "version": "2.0.0",
        "services": {
            "analytics": "online",
            "discord": "online",
            "websocket": "online"
        }
    }

@app.get("/api/metrics")
async def get_metrics():
    """Prometheus metrics endpoint"""
    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)

@app.get("/api/stats/realtime")
async def get_realtime_stats():
    """Public real-time stats endpoint"""
    stats = await analytics_manager.get_real_time_stats()
    # Return only public stats
    return {
        "online_users": stats.get("online_users", 0),
        "active_tournaments": stats.get("active_tournaments", 0),
        "total_matches": stats.get("total_matches", 0),
        "server_health": stats.get("server_health", "healthy")
    }

# Discord webhook endpoints
@app.post("/api/discord/register")
async def notify_user_registration(user_data: dict):
    """Notify Discord about new user registration"""
    success = await discord_integration.send_user_registration_notification(user_data)
    return {"success": success}

@app.post("/api/discord/support")
async def notify_support_ticket(ticket_data: dict):
    """Notify Discord about new support ticket"""
    success = await discord_integration.send_support_ticket_notification(ticket_data)
    return {"success": success}

@app.post("/api/discord/message")
async def notify_user_message(message_data: dict):
    """Notify Discord about user message"""
    success = await discord_integration.send_user_message_notification(message_data)
    return {"success": success}

@app.get("/api/discord/reply/{user_id}")
async def get_discord_reply(user_id: str):
    """Get pending Discord reply for user"""
    reply = await discord_integration.get_pending_reply(user_id)
    return {"reply": reply}

if __name__ == "__main__":
    uvicorn.run(
        "main:app", 
        host="0.0.0.0", 
        port=8000, 
        reload=True,
        log_level="info"
    )
    return {"message": "ClutchZone API is running! Visit /docs for API documentation."}

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "ClutchZone API"}

if __name__ == "__main__":
    # Get port from environment variable or default to 8000
    port = int(os.getenv("PORT", 8000))
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=True,  # Remove in production
        access_log=True
    )
