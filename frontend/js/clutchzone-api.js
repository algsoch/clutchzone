/**
 * Advanced ClutchZone Frontend API Integration
 * Handles authentication, real-time updates, Discord integration, and state management
 */

class ClutchZoneAPI {
    constructor() {
        this.baseURL = window.location.origin + '/api';
        this.wsURL = window.location.origin.replace('http', 'ws') + '/api/ws';
        this.authToken = localStorage.getItem('auth_token');
        this.socket = null;
        this.isAuthenticated = false;
        this.currentUser = null;
        this.realTimeStats = {};
        this.eventListeners = new Map();
        
        this.init();
    }

    async init() {
        // Check authentication status
        await this.checkAuthStatus();
        
        // Initialize WebSocket connection
        this.initWebSocket();
        
        // Start real-time stats updates
        this.startRealTimeUpdates();
        
        // Initialize notifications
        this.initNotifications();
        
        console.log('🎮 ClutchZone API initialized');
    }

    // Authentication Methods
    async checkAuthStatus() {
        if (!this.authToken) {
            this.updateAuthUI(false);
            return false;
        }

        try {
            const response = await this.request('/auth/me', 'GET');
            if (response.success) {
                this.isAuthenticated = true;
                this.currentUser = response.user;
                this.updateAuthUI(true);
                
                // Track user session
                this.trackUserAction('session_started', {
                    user_id: this.currentUser.id,
                    timestamp: new Date().toISOString()
                });
                
                return true;
            }
        } catch (error) {
            console.warn('Auth check failed:', error);
            this.logout();
        }
        
        return false;
    }

    async login(email, password) {
        try {
            const response = await this.request('/auth/login', 'POST', {
                email: email,
                password: password
            });

            if (response.access_token) {
                this.authToken = response.access_token;
                localStorage.setItem('auth_token', this.authToken);
                this.isAuthenticated = true;
                this.currentUser = response.user;
                
                this.updateAuthUI(true);
                this.showNotification('Welcome back, ' + this.currentUser.username + '!', 'success');
                
                // Track login
                this.trackUserAction('user_login', {
                    user_id: this.currentUser.id
                });
                
                return { success: true, user: this.currentUser };
            }
        } catch (error) {
            this.showNotification('Login failed: ' + error.message, 'error');
            return { success: false, error: error.message };
        }
    }

    async register(userData) {
        try {
            const response = await this.request('/auth/register', 'POST', userData);

            if (response.access_token) {
                this.authToken = response.access_token;
                localStorage.setItem('auth_token', this.authToken);
                this.isAuthenticated = true;
                this.currentUser = response.user;
                
                this.updateAuthUI(true);
                this.showNotification('Welcome to ClutchZone, ' + this.currentUser.username + '!', 'success');
                
                // Notify Discord about registration
                await this.notifyDiscordRegistration(this.currentUser);
                
                // Track registration
                this.trackUserAction('user_registration', {
                    user_id: this.currentUser.id
                });
                
                return { success: true, user: this.currentUser };
            }
        } catch (error) {
            this.showNotification('Registration failed: ' + error.message, 'error');
            return { success: false, error: error.message };
        }
    }

    logout() {
        this.authToken = null;
        this.currentUser = null;
        this.isAuthenticated = false;
        localStorage.removeItem('auth_token');
        
        this.updateAuthUI(false);
        this.showNotification('Logged out successfully', 'info');
        
        // Close WebSocket connection
        if (this.socket) {
            this.socket.close();
        }
        
        // Redirect to home
        if (window.location.pathname !== '/') {
            window.location.href = '/';
        }
    }

    // API Request Methods
    async request(endpoint, method = 'GET', data = null) {
        const url = this.baseURL + endpoint;
        const config = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        if (this.authToken) {
            config.headers['Authorization'] = `Bearer ${this.authToken}`;
        }

        if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
            config.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(url, config);
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.detail || `HTTP ${response.status}`);
            }

            return result;
        } catch (error) {
            console.error('API Request failed:', error);
            throw error;
        }
    }

    // WebSocket Methods
    initWebSocket() {
        if (!window.WebSocket) {
            console.warn('WebSocket not supported');
            return;
        }

        const wsUrl = this.wsURL + '/live';
        this.socket = new WebSocket(wsUrl);

        this.socket.onopen = () => {
            console.log('🔗 WebSocket connected');
            
            // Authenticate WebSocket if logged in
            if (this.authToken) {
                this.socket.send(JSON.stringify({
                    type: 'auth',
                    token: this.authToken
                }));
            }
        };

        this.socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                this.handleWebSocketMessage(data);
            } catch (error) {
                console.error('WebSocket message parsing failed:', error);
            }
        };

        this.socket.onclose = () => {
            console.log('🔌 WebSocket disconnected');
            // Attempt to reconnect after 5 seconds
            setTimeout(() => {
                if (this.isAuthenticated) {
                    this.initWebSocket();
                }
            }, 5000);
        };

        this.socket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };
    }

    handleWebSocketMessage(data) {
        switch (data.type) {
            case 'real_time_stats':
                this.realTimeStats = data.data;
                this.updateRealTimeUI();
                break;
                
            case 'tournament_update':
                this.handleTournamentUpdate(data.data);
                break;
                
            case 'user_notification':
                this.showNotification(data.message, data.priority || 'info');
                break;
                
            case 'admin_reply':
                this.handleAdminReply(data.data);
                break;
                
            case 'live_announcement':
                this.showLiveAnnouncement(data.data);
                break;
                
            default:
                console.log('Unknown WebSocket message type:', data.type);
        }
        
        // Emit to custom listeners
        if (this.eventListeners.has(data.type)) {
            this.eventListeners.get(data.type).forEach(callback => {
                callback(data.data);
            });
        }
    }

    // Discord Integration Methods
    async notifyDiscordRegistration(user) {
        try {
            await this.request('/discord/register', 'POST', user);
        } catch (error) {
            console.warn('Discord registration notification failed:', error);
        }
    }

    async sendSupportMessage(messageData) {
        try {
            // Send to backend
            const response = await this.request('/support/tickets', 'POST', messageData);
            
            // Notify Discord
            await this.request('/discord/support', 'POST', {
                ...messageData,
                ticket_id: response.ticket_id,
                user_id: this.currentUser?.id
            });
            
            this.showNotification('Support ticket created successfully!', 'success');
            return response;
        } catch (error) {
            this.showNotification('Failed to send support message: ' + error.message, 'error');
            throw error;
        }
    }

    async sendUserMessage(messageData) {
        try {
            // Send to backend
            const response = await this.request('/messages', 'POST', messageData);
            
            // Notify Discord
            await this.request('/discord/message', 'POST', {
                ...messageData,
                user_id: this.currentUser?.id,
                username: this.currentUser?.username
            });
            
            this.showNotification('Message sent successfully!', 'success');
            return response;
        } catch (error) {
            this.showNotification('Failed to send message: ' + error.message, 'error');
            throw error;
        }
    }

    async checkDiscordReply() {
        if (!this.currentUser) return null;
        
        try {
            const response = await this.request(`/discord/reply/${this.currentUser.id}`, 'GET');
            return response.reply;
        } catch (error) {
            console.warn('Failed to check Discord reply:', error);
            return null;
        }
    }

    // Real-time Stats Methods
    async startRealTimeUpdates() {
        await this.updateRealTimeStats();
        
        // Update every 30 seconds
        setInterval(async () => {
            await this.updateRealTimeStats();
        }, 30000);
    }

    async updateRealTimeStats() {
        try {
            const stats = await this.request('/stats/realtime', 'GET');
            this.realTimeStats = stats;
            this.updateRealTimeUI();
        } catch (error) {
            console.warn('Failed to update real-time stats:', error);
        }
    }

    updateRealTimeUI() {
        // Update online users
        const onlineUsersEl = document.getElementById('onlineUsers');
        if (onlineUsersEl) {
            onlineUsersEl.textContent = `${this.realTimeStats.online_users || 0} Online`;
        }

        // Update active tournaments
        const activeTournamentsEl = document.getElementById('activeTournaments');
        if (activeTournamentsEl) {
            activeTournamentsEl.textContent = `${this.realTimeStats.active_tournaments || 0} Live Tournaments`;
        }

        // Update active matches
        const activeMatchesEl = document.getElementById('activeMatches');
        if (activeMatchesEl) {
            activeMatchesEl.textContent = `${this.realTimeStats.total_matches || 0} Live Matches`;
        }

        // Update status indicator
        const statusEl = document.querySelector('.status-online');
        if (statusEl) {
            const health = this.realTimeStats.server_health;
            statusEl.className = `fas fa-circle status-${health === 'healthy' ? 'online' : 'offline'}`;
        }
    }

    // UI Update Methods
    updateAuthUI(isAuthenticated) {
        const authSection = document.getElementById('authSection');
        if (!authSection) return;

        if (isAuthenticated && this.currentUser) {
            authSection.innerHTML = `
                <div class="user-profile">
                    <div class="user-avatar">
                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=${this.currentUser.username}" 
                             alt="${this.currentUser.username}" class="avatar-img">
                        <div class="level-badge">${this.currentUser.level || 1}</div>
                    </div>
                    <div class="user-info">
                        <span class="username">${this.currentUser.username}</span>
                        <span class="xp">${this.currentUser.xp || 0} XP</span>
                    </div>
                    <div class="user-menu">
                        <button class="btn-icon" onclick="clutchAPI.showUserMenu()" title="User menu">
                            <i class="fas fa-chevron-down"></i>
                        </button>
                    </div>
                </div>
            `;
            
            // Show auth-required elements
            document.querySelectorAll('.auth-required, .auth-only').forEach(el => {
                el.style.display = '';
            });
            
            // Show admin elements if user is admin
            if (this.currentUser.is_admin) {
                document.querySelectorAll('.admin-only').forEach(el => {
                    el.style.display = '';
                });
            }
        } else {
            authSection.innerHTML = `
                <div class="auth-buttons">
                    <a href="/login/login.html" class="btn btn-outline">Login</a>
                    <a href="/register/register.html" class="btn btn-primary">Register</a>
                </div>
            `;
            
            // Hide auth-required elements
            document.querySelectorAll('.auth-required, .auth-only, .admin-only').forEach(el => {
                el.style.display = 'none';
            });
        }
    }

    showUserMenu() {
        const menu = document.createElement('div');
        menu.className = 'user-menu-dropdown';
        menu.innerHTML = `
            <a href="/profile/profile.html" class="menu-item">
                <i class="fas fa-user"></i> Profile
            </a>
            <a href="/wallet/wallet.html" class="menu-item">
                <i class="fas fa-wallet"></i> Wallet
            </a>
            ${this.currentUser.is_admin ? '<a href="/admin/admin.html" class="menu-item"><i class="fas fa-cog"></i> Admin Panel</a>' : ''}
            <hr>
            <button onclick="clutchAPI.logout()" class="menu-item logout">
                <i class="fas fa-sign-out-alt"></i> Logout
            </button>
        `;
        
        // Position and show menu
        document.body.appendChild(menu);
        
        // Close menu when clicking outside
        setTimeout(() => {
            document.addEventListener('click', () => {
                menu.remove();
            }, { once: true });
        }, 100);
    }

    // Notification Methods
    initNotifications() {
        // Request notification permission
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }

    showNotification(message, type = 'info', duration = 5000) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close" onclick="this.parentElement.remove()">×</button>
        `;

        // Add to notification container
        let container = document.getElementById('notificationContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notificationContainer';
            container.className = 'notification-container';
            document.body.appendChild(container);
        }

        container.appendChild(notification);

        // Auto remove after duration
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, duration);

        // Browser notification for important messages
        if (type === 'error' || type === 'success') {
            this.showBrowserNotification(message, type);
        }
    }

    showBrowserNotification(message, type) {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('ClutchZone', {
                body: message,
                icon: '/assets/logo.png',
                tag: type
            });
        }
    }

    getNotificationIcon(type) {
        const icons = {
            'success': 'check-circle',
            'error': 'exclamation-circle',
            'warning': 'exclamation-triangle',
            'info': 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    // Utility Methods
    trackUserAction(action, data = {}) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify({
                type: 'track_action',
                action: action,
                data: data,
                timestamp: new Date().toISOString()
            }));
        }
    }

    addEventListener(eventType, callback) {
        if (!this.eventListeners.has(eventType)) {
            this.eventListeners.set(eventType, []);
        }
        this.eventListeners.get(eventType).push(callback);
    }

    removeEventListener(eventType, callback) {
        if (this.eventListeners.has(eventType)) {
            const listeners = this.eventListeners.get(eventType);
            const index = listeners.indexOf(callback);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        }
    }

    handleTournamentUpdate(data) {
        this.showNotification(`Tournament "${data.name}" has been ${data.status}!`, 'info');
        
        // Update tournament displays
        const tournamentElements = document.querySelectorAll(`[data-tournament-id="${data.id}"]`);
        tournamentElements.forEach(el => {
            // Update tournament status in UI
            const statusEl = el.querySelector('.tournament-status');
            if (statusEl) {
                statusEl.textContent = data.status;
                statusEl.className = `tournament-status status-${data.status}`;
            }
        });
    }

    handleAdminReply(data) {
        this.showNotification(`Admin ${data.admin} replied to your message!`, 'info');
        
        // You could show a modal or redirect to messages page
        this.showAdminReplyModal(data);
    }

    showAdminReplyModal(replyData) {
        const modal = document.createElement('div');
        modal.className = 'modal admin-reply-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Admin Reply</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
                </div>
                <div class="modal-body">
                    <p><strong>From:</strong> ${replyData.admin}</p>
                    <p><strong>Message:</strong></p>
                    <div class="reply-message">${replyData.message}</div>
                    <small>Received: ${new Date(replyData.timestamp).toLocaleString()}</small>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" onclick="this.closest('.modal').remove()">OK</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    showLiveAnnouncement(data) {
        const announcement = document.createElement('div');
        announcement.className = `live-announcement priority-${data.priority}`;
        announcement.innerHTML = `
            <div class="announcement-content">
                <h4>${data.title}</h4>
                <p>${data.message}</p>
                <small>By: ${data.created_by}</small>
            </div>
            <button class="announcement-close" onclick="this.parentElement.remove()">×</button>
        `;
        
        document.body.appendChild(announcement);
        
        // Auto remove after 30 seconds for normal priority
        if (data.priority !== 'urgent') {
            setTimeout(() => {
                if (announcement.parentElement) {
                    announcement.remove();
                }
            }, 30000);
        }
    }
}

// Initialize global API instance
const clutchAPI = new ClutchZoneAPI();

// Make it globally available
window.clutchAPI = clutchAPI;

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ClutchZoneAPI;
}
