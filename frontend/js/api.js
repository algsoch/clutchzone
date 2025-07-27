// ClutchZone API Client
class ClutchZoneAPI {
    constructor() {
        this.baseURL = 'https://clutchzone-api.ondigitalocean.app/api';
        this.token = localStorage.getItem('clutchzone_token');
        this.user = JSON.parse(localStorage.getItem('clutchzone_user') || '{}');
        this.isLoading = false;
        this.loadingCallbacks = [];
        this.errorCallbacks = [];
    }

    // Authentication methods
    setToken(token) {
        this.token = token;
        localStorage.setItem('clutchzone_token', token);
    }

    setUser(user) {
        this.user = user;
        localStorage.setItem('clutchzone_user', JSON.stringify(user));
    }

    logout() {
        this.token = null;
        this.user = {};
        localStorage.removeItem('clutchzone_token');
        localStorage.removeItem('clutchzone_user');
    }

    isAuthenticated() {
        return !!this.token;
    }

    // Request helper
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        const config = {
            method: 'GET',
            ...options,
            headers
        };

        try {
            this.setLoading(true);
            const response = await fetch(url, config);
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || `HTTP ${response.status}`);
            }

            const data = await response.json();
            this.setLoading(false);
            return data;
        } catch (error) {
            this.setLoading(false);
            this.handleError(error);
            throw error;
        }
    }

    // Loading state management
    setLoading(loading) {
        this.isLoading = loading;
        this.loadingCallbacks.forEach(callback => callback(loading));
    }

    onLoadingChange(callback) {
        this.loadingCallbacks.push(callback);
    }

    onError(callback) {
        this.errorCallbacks.push(callback);
    }

    handleError(error) {
        console.error('API Error:', error);
        this.errorCallbacks.forEach(callback => callback(error));
    }

    // Auth endpoints
    async register(userData) {
        const response = await this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
        
        if (response.success && response.data) {
            // Handle successful registration
            if (response.data.token || response.data.access_token) {
                const token = response.data.token || response.data.access_token;
                this.setToken(token);
            }
            
            if (response.data.user) {
                this.setUser(response.data.user);
            }
            
            return response;
        }
        
        return response;
    }

    async login(loginData) {
        const response = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify(loginData)
        });
        
        if (response.success && response.data) {
            // Handle successful login
            if (response.data.token || response.data.access_token) {
                const token = response.data.token || response.data.access_token;
                this.setToken(token);
            }
            
            if (response.data.user) {
                this.setUser(response.data.user);
            }
            
            return response;
        }
        
        return response;
    }

    async getCurrentUser() {
        return await this.request('/auth/me');
    }

    async refreshToken() {
        const response = await this.request('/auth/refresh', {
            method: 'POST'
        });
        
        if (response.access_token) {
            this.setToken(response.access_token);
        }
        
        return response;
    }

    async checkUsername(username) {
        return await this.request('/auth/check-username', {
            method: 'POST',
            body: JSON.stringify({ username })
        });
    }

    async checkEmail(email) {
        return await this.request(`/auth/check-email?email=${encodeURIComponent(email)}`);
    }

    // Tournament endpoints
    async getTournaments(filters = {}) {
        const params = new URLSearchParams();
        
        if (filters.status) params.append('status', filters.status);
        if (filters.game) params.append('game', filters.game);
        if (filters.skill_level) params.append('skill_level', filters.skill_level);
        
        const queryString = params.toString();
        return await this.request(`/tournaments${queryString ? '?' + queryString : ''}`);
    }

    async getTournament(id) {
        return await this.request(`/tournaments/${id}`);
    }

    async createTournament(tournamentData) {
        return await this.request('/tournaments', {
            method: 'POST',
            body: JSON.stringify(tournamentData)
        });
    }

    async updateTournament(id, tournamentData) {
        return await this.request(`/tournaments/${id}`, {
            method: 'PUT',
            body: JSON.stringify(tournamentData)
        });
    }

    async deleteTournament(id) {
        return await this.request(`/tournaments/${id}`, {
            method: 'DELETE'
        });
    }

    async registerForTournament(tournamentId) {
        return await this.request(`/tournaments/${tournamentId}/register`, {
            method: 'POST'
        });
    }

    async unregisterFromTournament(tournamentId) {
        return await this.request(`/tournaments/${tournamentId}/unregister`, {
            method: 'DELETE'
        });
    }

    async getTournamentRegistrations(tournamentId) {
        return await this.request(`/tournaments/${tournamentId}/registrations`);
    }

    // Player endpoints
    async getPlayerProfile() {
        return await this.request('/players/me');
    }

    async updatePlayerProfile(profileData) {
        return await this.request('/players/me', {
            method: 'PUT',
            body: JSON.stringify(profileData)
        });
    }

    async getLeaderboard(filters = {}) {
        const params = new URLSearchParams();
        
        if (filters.game) params.append('game', filters.game);
        if (filters.time_period) params.append('time_period', filters.time_period);
        if (filters.limit) params.append('limit', filters.limit);
        
        const queryString = params.toString();
        return await this.request(`/players/leaderboard${queryString ? '?' + queryString : ''}`);
    }

    async getPlayerStats(playerId) {
        return await this.request(`/players/${playerId}/stats`);
    }

    async getPlayerTournaments(playerId) {
        return await this.request(`/players/${playerId}/tournaments`);
    }

    async getPlayerMatches(playerId) {
        return await this.request(`/players/${playerId}/matches`);
    }

    async updatePlayerXP(xpData) {
        return await this.request('/players/me/xp', {
            method: 'POST',
            body: JSON.stringify(xpData)
        });
    }

    async getPlayerAchievements(playerId) {
        return await this.request(`/players/${playerId}/achievements`);
    }

    // Admin endpoints
    async getAdminStats() {
        return await this.request('/admin/stats');
    }

    async getAdminUsers(filters = {}) {
        const params = new URLSearchParams();
        
        if (filters.role) params.append('role', filters.role);
        if (filters.is_active !== undefined) params.append('is_active', filters.is_active);
        if (filters.limit) params.append('limit', filters.limit);
        
        const queryString = params.toString();
        return await this.request(`/admin/users${queryString ? '?' + queryString : ''}`);
    }

    async updateAdminUser(userId, userData) {
        return await this.request(`/admin/users/${userId}`, {
            method: 'PUT',
            body: JSON.stringify(userData)
        });
    }

    async deactivateUser(userId) {
        return await this.request(`/admin/users/${userId}/deactivate`, {
            method: 'POST'
        });
    }

    async getAdminTournaments() {
        return await this.request('/admin/tournaments');
    }

    async startTournament(tournamentId) {
        return await this.request(`/admin/tournaments/${tournamentId}/start`, {
            method: 'POST'
        });
    }

    async completeTournament(tournamentId) {
        return await this.request(`/admin/tournaments/${tournamentId}/complete`, {
            method: 'POST'
        });
    }

    async verifyMatchResult(matchId, resultData) {
        return await this.request(`/admin/matches/${matchId}/verify`, {
            method: 'POST',
            body: JSON.stringify(resultData)
        });
    }

    async getAdminPayments() {
        return await this.request('/admin/payments');
    }

    async getAdminSystemHealth() {
        return await this.request('/admin/health');
    }

    // Utility methods
    formatError(error) {
        if (error.message) {
            return error.message;
        }
        return 'An unexpected error occurred';
    }

    // WebSocket connection for real-time updates
    connectWebSocket() {
        if (!this.isAuthenticated()) {
            return null;
        }

        const wsUrl = `ws://localhost:8000/ws?token=${this.token}`;
        const ws = new WebSocket(wsUrl);

        ws.onopen = () => {
            console.log('WebSocket connected');
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.handleWebSocketMessage(data);
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        ws.onclose = () => {
            console.log('WebSocket disconnected');
            // Attempt to reconnect after 5 seconds
            setTimeout(() => {
                this.connectWebSocket();
            }, 5000);
        };

        return ws;
    }

    handleWebSocketMessage(data) {
        // Handle real-time updates
        switch (data.type) {
            case 'tournament_update':
                this.handleTournamentUpdate(data.data);
                break;
            case 'match_result':
                this.handleMatchResult(data.data);
                break;
            case 'leaderboard_update':
                this.handleLeaderboardUpdate(data.data);
                break;
            case 'notification':
                this.handleNotification(data.data);
                break;
            default:
                console.log('Unknown WebSocket message:', data);
        }
    }

    handleTournamentUpdate(tournament) {
        // Dispatch custom event for components to listen to
        window.dispatchEvent(new CustomEvent('tournamentUpdate', {
            detail: tournament
        }));
    }

    handleMatchResult(match) {
        window.dispatchEvent(new CustomEvent('matchResult', {
            detail: match
        }));
    }

    handleLeaderboardUpdate(leaderboard) {
        window.dispatchEvent(new CustomEvent('leaderboardUpdate', {
            detail: leaderboard
        }));
    }

    handleNotification(notification) {
        window.dispatchEvent(new CustomEvent('notification', {
            detail: notification
        }));
    }
}

// Create global API instance
const api = new ClutchZoneAPI();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ClutchZoneAPI, api };
}

// Make available globally
window.ClutchZoneAPI = ClutchZoneAPI;
window.api = api;
