# ClutchZone Backend API Documentation
# Contact System & Cookie Management Endpoints

## Overview
This document outlines the required backend API endpoints for ClutchZone's contact system, cookie management, and related features.

## Authentication
- All API requests should include proper authentication headers
- Use JWT tokens for authenticated requests
- Rate limiting should be implemented for all endpoints

## Base URL
```
Production: https://api.clutchzone.com
Development: http://localhost:3000/api
```

## Contact System Endpoints

### 1. Contact Form Submission
**Endpoint:** `POST /api/contact/submit`

**Description:** Submit contact form data from mission control interface

**Request Body:**
```json
{
  "commanderName": "string",
  "email": "string",
  "missionType": "string", // "bug_report", "feature_request", "general_inquiry", "partnership"
  "priority": "string", // "low", "medium", "high", "critical"
  "message": "string",
  "timestamp": "string", // ISO date
  "userAgent": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Mission launched successfully!",
  "ticketId": "CZ-2024-001234",
  "estimatedResponse": "24 hours"
}
```

### 2. Get Contact Status
**Endpoint:** `GET /api/contact/status/{ticketId}`

**Description:** Check status of submitted contact request

**Response:**
```json
{
  "success": true,
  "status": "in_progress", // "received", "in_progress", "resolved", "closed"
  "lastUpdated": "2024-12-20T10:30:00Z",
  "assignedAgent": "Agent Smith",
  "estimatedResolution": "2024-12-21T15:00:00Z"
}
```

## Live Chat System

### 3. WebSocket Chat Connection
**Endpoint:** `WS /ws/chat`

**Description:** Real-time chat connection for live support

**Message Types:**
```json
// User message
{
  "type": "user_message",
  "message": "string",
  "timestamp": "string"
}

// Agent message
{
  "type": "agent_message",
  "message": "string",
  "agentName": "string",
  "agentId": "string",
  "timestamp": "string"
}

// System message
{
  "type": "system_message",
  "message": "string",
  "timestamp": "string"
}

// Typing indicator
{
  "type": "typing",
  "isTyping": true,
  "agentName": "string"
}
```

### 4. Chat History
**Endpoint:** `GET /api/chat/history`

**Description:** Retrieve chat history for user session

**Parameters:**
- `sessionId`: string (optional)
- `limit`: number (default: 50)

**Response:**
```json
{
  "success": true,
  "messages": [
    {
      "type": "user_message",
      "message": "Hello, I need help",
      "timestamp": "2024-12-20T10:00:00Z"
    }
  ],
  "totalMessages": 25
}
```

### 5. HTTP Chat Fallback
**Endpoint:** `POST /api/chat/message`

**Description:** Fallback endpoint for chat when WebSocket is unavailable

**Request Body:**
```json
{
  "message": "string",
  "sessionId": "string"
}
```

**Response:**
```json
{
  "success": true,
  "response": "Thank you for your message. An agent will respond shortly.",
  "sessionId": "string"
}
```

## FAQ System

### 6. Get FAQ Data
**Endpoint:** `GET /api/content/faq`

**Description:** Retrieve FAQ data for dynamic loading

**Parameters:**
- `category`: string (optional) - "general", "technical", "account", "billing"
- `search`: string (optional)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "faq_001",
      "question": "How do I reset my password?",
      "answer": "You can reset your password by...",
      "category": "account",
      "tags": ["password", "login", "security"],
      "helpful": 45,
      "notHelpful": 2
    }
  ]
}
```

### 7. FAQ Feedback
**Endpoint:** `POST /api/faq/feedback`

**Description:** Submit feedback on FAQ helpfulness

**Request Body:**
```json
{
  "faqId": "string",
  "helpful": true,
  "feedback": "string" // optional
}
```

## Team & Status

### 8. Team Status
**Endpoint:** `GET /api/team/status`

**Description:** Get current team availability status

**Response:**
```json
{
  "success": true,
  "data": {
    "totalAgents": 15,
    "availableAgents": 8,
    "averageResponseTime": "12 minutes",
    "currentLoad": "medium", // "low", "medium", "high"
    "estimatedWaitTime": "5 minutes"
  }
}
```

### 9. Recent Updates
**Endpoint:** `GET /api/content/updates`

**Description:** Get recent platform updates and announcements

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "title": "New Tournament System",
      "description": "Enhanced tournament matching algorithm",
      "date": "2024-12-19T00:00:00Z",
      "type": "feature",
      "priority": "high"
    }
  ]
}
```

## Analytics & Tracking

### 10. Track User Action
**Endpoint:** `POST /api/analytics/track`

**Description:** Track user interactions for analytics

**Request Body:**
```json
{
  "action": "string",
  "data": "object", // optional
  "page": "string",
  "timestamp": "string",
  "userAgent": "string"
}
```

**Response:**
```json
{
  "success": true,
  "tracked": true
}
```

## Cookie Management

### 11. Cookie Consent
**Endpoint:** `POST /api/privacy/cookie-consent`

**Description:** Store user cookie preferences

**Request Body:**
```json
{
  "preferences": {
    "essential": true,
    "performance": true,
    "gaming": true,
    "marketing": false
  },
  "timestamp": "string",
  "ipAddress": "string",
  "userAgent": "string"
}
```

**Response:**
```json
{
  "success": true,
  "consentId": "consent_123456",
  "expiresAt": "2025-12-20T00:00:00Z"
}
```

### 12. Get Cookie Preferences
**Endpoint:** `GET /api/privacy/cookie-preferences`

**Description:** Retrieve user's cookie preferences

**Response:**
```json
{
  "success": true,
  "preferences": {
    "essential": true,
    "performance": true,
    "gaming": false,
    "marketing": false
  },
  "lastUpdated": "2024-12-20T10:00:00Z"
}
```

## Error Handling

All endpoints should return consistent error responses:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": "Additional technical details"
  },
  "timestamp": "2024-12-20T10:00:00Z"
}
```

## Rate Limiting

Implement rate limiting for all endpoints:
- Contact submissions: 5 requests per hour per IP
- Chat messages: 60 requests per minute per session
- Analytics tracking: 100 requests per minute per IP
- FAQ requests: 120 requests per minute per IP

## Security Headers

All responses should include appropriate security headers:
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'
```

## Database Schema

### Contact Submissions Table
```sql
CREATE TABLE contact_submissions (
    id SERIAL PRIMARY KEY,
    ticket_id VARCHAR(20) UNIQUE NOT NULL,
    commander_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    mission_type VARCHAR(50) NOT NULL,
    priority VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'received',
    assigned_agent_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_agent TEXT,
    ip_address INET
);
```

### Chat Sessions Table
```sql
CREATE TABLE chat_sessions (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(50) UNIQUE NOT NULL,
    user_id INTEGER,
    agent_id INTEGER,
    status VARCHAR(20) DEFAULT 'active',
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    feedback TEXT
);
```

### Chat Messages Table
```sql
CREATE TABLE chat_messages (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(50) NOT NULL,
    sender_type VARCHAR(20) NOT NULL, -- 'user', 'agent', 'system'
    sender_id INTEGER,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES chat_sessions(session_id)
);
```

### Cookie Consents Table
```sql
CREATE TABLE cookie_consents (
    id SERIAL PRIMARY KEY,
    consent_id VARCHAR(50) UNIQUE NOT NULL,
    user_id INTEGER,
    preferences JSONB NOT NULL,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL
);
```

## Implementation Notes

1. **WebSocket Implementation**: Use Socket.IO or native WebSockets for real-time chat
2. **Queue System**: Implement Redis or similar for chat queue management
3. **Email Integration**: Use SendGrid, Mailgun, or AWS SES for email notifications
4. **File Uploads**: Support file attachments in contact forms (max 10MB)
5. **Internationalization**: Support for multiple languages in responses
6. **Monitoring**: Implement logging and monitoring for all endpoints
7. **Backup**: Regular backups of contact data and chat history
8. **GDPR Compliance**: Data retention policies and user data deletion endpoints

## Testing

All endpoints should include:
- Unit tests for business logic
- Integration tests for API endpoints
- Load testing for high-traffic endpoints
- Security testing for input validation
- WebSocket connection testing

## Deployment

- Use Docker containers for consistent deployment
- Environment-specific configuration
- Health check endpoints
- Graceful shutdown handling
- Auto-scaling configuration for chat system
