# 🎮 ClutchZone - Advanced Gaming Tournament Platform

## Overview

ClutchZone is a cutting-edge esports tournament platform with real-time features, Discord integration, comprehensive analytics, and admin management capabilities. Built with FastAPI, React-like frontend, WebSocket communication, and deployed on Digital Ocean.

## 🚀 Features

### Core Platform
- **Real-time Tournament System** - Live tournaments with instant updates
- **User Authentication** - Secure JWT-based auth with role management
- **WebSocket Communication** - Real-time chat, notifications, and live updates
- **Advanced Analytics** - Comprehensive API access tracking and user behavior analytics
- **Admin Dashboard** - Full tournament and user management with analytics

### Discord Integration
- **Two-way Communication** - Discord webhook notifications with admin reply capability
- **Automated Notifications** - User registration, support tickets, tournament updates
- **Bot Commands** - Discord bot for server management and user interaction
- **Support System** - Seamless support ticket system with Discord integration

### Advanced Features
- **API Access Monitoring** - Track all API calls, user sessions, and server metrics
- **Performance Analytics** - Real-time server monitoring with Prometheus and Grafana
- **Digital Ocean Deployment** - Complete containerized deployment with CI/CD
- **Security** - Rate limiting, CORS, SSL termination, and secure headers
- **Scalability** - Load balancer, managed databases, and container orchestration

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │◄──►│   Load Balancer  │◄──►│    Backend      │
│   (React-like)  │    │   (Nginx)        │    │   (FastAPI)     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       ▼
         │                       │              ┌─────────────────┐
         │                       │              │   PostgreSQL    │
         │                       │              │   (Managed DB)  │
         │                       │              └─────────────────┘
         │                       │                       │
         ▼                       │                       ▼
┌─────────────────┐              │              ┌─────────────────┐
│   WebSocket     │              │              │     Redis       │
│   (Real-time)   │              │              │   (Analytics)   │
└─────────────────┘              │              └─────────────────┘
         │                       │                       │
         │                       │                       ▼
         │                       │              ┌─────────────────┐
         │                       │              │   Discord Bot   │
         │                       │              │  (Integration)  │
         │                       │              └─────────────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌──────────────────┐
│   Monitoring    │    │   Container      │
│ (Prometheus +   │    │   Registry       │
│   Grafana)      │    │ (DigitalOcean)   │
└─────────────────┘    └──────────────────┘
```

## 🛠️ Technology Stack

### Backend
- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - ORM with PostgreSQL
- **WebSockets** - Real-time communication
- **Redis** - Caching and analytics storage
- **Prometheus** - Metrics collection
- **Discord.py** - Discord bot integration

### Frontend
- **Vanilla JavaScript** - Modern ES6+ with advanced features
- **WebSocket Client** - Real-time updates
- **Progressive Web App** - PWA capabilities
- **Responsive Design** - Mobile-first approach

### Infrastructure
- **Digital Ocean** - Cloud hosting platform
- **Docker** - Containerization
- **Nginx** - Reverse proxy and load balancer
- **PostgreSQL** - Managed database
- **Redis** - Managed cache
- **GitHub Actions** - CI/CD pipeline

## 📦 Installation & Deployment

### Quick Start (Local Development)

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/clutchzone.git
cd clutchzone
```

2. **Set up environment**
```bash
cp backend/.env.example backend/.env
# Edit .env with your configuration
```

3. **Install dependencies**
```bash
cd backend
pip install -r requirements.txt
```

4. **Run the development server**
```bash
cd backend
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

5. **Open your browser**
```
http://localhost:8000
```

### Production Deployment (Digital Ocean)

1. **Prepare Digital Ocean**
```bash
# Install doctl
brew install doctl  # macOS
# or download from https://docs.digitalocean.com/reference/doctl/how-to/install/

# Authenticate
doctl auth init
```

2. **Run deployment script**
```bash
chmod +x deploy-to-digitalocean.sh
./deploy-to-digitalocean.sh
```

3. **Set up GitHub secrets**
Add these secrets to your GitHub repository:
- `DIGITALOCEAN_ACCESS_TOKEN`
- `DROPLET_IP`
- `DROPLET_SSH_KEY`
- `DB_PASSWORD`
- `DISCORD_WEBHOOK_URL`
- `DISCORD_BOT_TOKEN`
- `SECRET_KEY`
- `GRAFANA_PASSWORD`

4. **Deploy via GitHub Actions**
```bash
git push origin main
```

## 🔧 Configuration

### Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:password@host:port/dbname
REDIS_URL=redis://host:port

# Discord Integration
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/YOUR_WEBHOOK_URL
DISCORD_BOT_TOKEN=your_bot_token_here

# Security
SECRET_KEY=your_secret_key_here
ENVIRONMENT=production

# Analytics
ANALYTICS_ENABLED=true
METRICS_ENABLED=true
```

### Discord Webhook Setup

1. Go to your Discord server settings
2. Navigate to Integrations → Webhooks
3. Create a new webhook
4. Copy the webhook URL
5. Add it to your environment variables

### Discord Bot Setup (Optional)

1. Go to Discord Developer Portal
2. Create a new application
3. Create a bot user
4. Copy the bot token
5. Invite bot to your server with appropriate permissions

## 📊 API Documentation

### Core Endpoints

#### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user info

#### Tournaments
- `GET /api/tournaments` - List tournaments
- `POST /api/tournaments` - Create tournament (admin)
- `PUT /api/tournaments/{id}` - Update tournament (admin)
- `DELETE /api/tournaments/{id}` - Delete tournament (admin)

#### Analytics (Admin)
- `GET /api/admin/enhanced/dashboard` - Admin dashboard data
- `GET /api/admin/enhanced/analytics/api` - API analytics
- `GET /api/admin/enhanced/analytics/realtime` - Real-time stats
- `GET /api/admin/enhanced/analytics/server` - Server metrics

#### Discord Integration
- `POST /api/discord/register` - Send registration notification
- `POST /api/discord/support` - Send support ticket notification
- `POST /api/discord/message` - Send user message notification
- `GET /api/discord/reply/{user_id}` - Get pending admin reply

#### WebSocket Endpoints
- `WS /api/ws/live` - Real-time updates
- `WS /api/ws/chat` - Live chat
- `WS /api/ws/tournaments` - Tournament updates

### Real-time Features

#### WebSocket Messages
```javascript
// Connect to WebSocket
const socket = new WebSocket('wss://clutchzone.app/api/ws/live');

// Authentication
socket.send(JSON.stringify({
    type: 'auth',
    token: 'your_jwt_token'
}));

// Listen for updates
socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    switch(data.type) {
        case 'real_time_stats':
            updateUI(data.data);
            break;
        case 'tournament_update':
            handleTournamentUpdate(data.data);
            break;
        case 'admin_reply':
            showAdminReply(data.data);
            break;
    }
};
```

## 🎮 Usage Guide

### For Users

1. **Registration**
   - Visit the website
   - Click "Register" 
   - Fill out the form
   - Receive Discord notification (if configured)

2. **Tournaments**
   - Browse available tournaments
   - Register for tournaments
   - Receive real-time updates
   - View results and rankings

3. **Support**
   - Use the contact form
   - Create support tickets
   - Receive admin replies via Discord integration

### For Admins

1. **Admin Dashboard**
   - Access `/admin/admin.html`
   - View comprehensive analytics
   - Monitor real-time stats
   - Manage users and tournaments

2. **Tournament Management**
   - Create new tournaments
   - Modify existing tournaments
   - Start/end tournaments
   - View participant analytics

3. **Discord Management**
   - Use `!clutch status` for server status
   - Use `!clutch reply USER_ID message` to reply to users
   - Monitor all platform notifications

## 📈 Analytics & Monitoring

### Available Metrics

- **API Usage** - Request counts, response times, error rates
- **User Activity** - Session tracking, action analytics
- **Server Performance** - CPU, memory, disk usage
- **Tournament Metrics** - Participation, completion rates
- **Discord Activity** - Message counts, notification success rates

### Monitoring Dashboard

Access monitoring at `https://monitoring.clutchzone.app`

- **Grafana Dashboards** - Visual analytics
- **Prometheus Metrics** - Raw metric data
- **Real-time Alerts** - Performance notifications

## 🔒 Security Features

- **JWT Authentication** - Secure token-based auth
- **Rate Limiting** - API abuse prevention
- **CORS Protection** - Cross-origin request security
- **SSL Termination** - HTTPS encryption
- **Input Validation** - SQL injection prevention
- **Security Headers** - XSS and clickjacking protection

## 🚦 API Rate Limits

- **General API**: 10 requests/second
- **Authentication**: 5 requests/second
- **WebSocket**: No limit (authenticated)

## 🧪 Testing

### Run Tests
```bash
cd backend
pytest tests/ -v
```

### Load Testing
```bash
# Install locust
pip install locust

# Run load test
locust -f tests/load_test.py --host=https://clutchzone.app
```

## 🐛 Troubleshooting

### Common Issues

1. **Discord notifications not working**
   - Check webhook URL format
   - Verify Discord server permissions
   - Check application logs

2. **WebSocket connection fails**
   - Verify SSL certificate
   - Check firewall settings
   - Confirm port accessibility

3. **Database connection issues**
   - Check connection string format
   - Verify database credentials
   - Confirm network access

### Debug Mode

Enable debug logging:
```bash
export LOG_LEVEL=DEBUG
python -m uvicorn main:app --reload
```

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- FastAPI community
- Discord.py developers
- Digital Ocean platform
- Open source contributors

## 📞 Support

- **Discord**: Join our server for support
- **Email**: admin@clutchzone.app
- **Issues**: GitHub Issues page

---

Built with ❤️ for the gaming community
