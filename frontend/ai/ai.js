// AI Assistant JavaScript
class AIAssistant {
    constructor() {
        this.chatMessages = document.getElementById('chatMessages');
        this.chatInput = document.getElementById('chatInput');
        this.sendButton = document.getElementById('sendMessage');
        this.loadingOverlay = document.getElementById('loadingOverlay');
        this.clearButton = document.getElementById('clearChat');
        
        this.initializeEventListeners();
        this.setupQuickActions();
        this.setupFeatureButtons();
        this.setupSuggestions();
    }

    initializeEventListeners() {
        // Send message on button click
        this.sendButton?.addEventListener('click', () => this.sendMessage());
        
        // Send message on Enter key
        this.chatInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });
        
        // Clear chat
        this.clearButton?.addEventListener('click', () => this.clearChat());
    }

    setupQuickActions() {
        const quickButtons = document.querySelectorAll('.quick-btn');
        quickButtons.forEach(button => {
            button.addEventListener('click', () => {
                const topic = button.dataset.topic;
                this.getQuickHelp(topic);
            });
        });
    }

    setupFeatureButtons() {
        // Tournament suggestions
        document.getElementById('getSuggestions')?.addEventListener('click', () => {
            this.getTournamentSuggestions();
        });
        
        // Performance analysis
        document.getElementById('analyzePerformance')?.addEventListener('click', () => {
            this.getPerformanceAnalysis();
        });
        
        // Leaderboard insights
        document.getElementById('getInsights')?.addEventListener('click', () => {
            this.getLeaderboardInsights();
        });
    }

    setupSuggestions() {
        const suggestionButtons = document.querySelectorAll('.suggestion-btn');
        suggestionButtons.forEach(button => {
            button.addEventListener('click', () => {
                const message = button.textContent;
                this.chatInput.value = message;
                this.sendMessage();
            });
        });
    }

    async sendMessage() {
        const message = this.chatInput.value.trim();
        if (!message) return;

        // Add user message to chat
        this.addUserMessage(message);
        
        // Clear input
        this.chatInput.value = '';
        
        // Show loading
        this.showLoading();
        
        try {
            // Send to AI API
            const response = await this.callAIAPI(message);
            
            // Add AI response to chat
            this.addAIMessage(response.response);
            
            // Play notification sound
            if (window.soundManager) {
                soundManager.playSound('notification');
            }
            
        } catch (error) {
            console.error('AI Error:', error);
            this.addAIMessage('Sorry, I encountered an error. Please try again later.');
        } finally {
            this.hideLoading();
        }
    }

    async callAIAPI(message) {
        const token = localStorage.getItem('authToken');
        
        const response = await fetch('/api/ai/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ message })
        });

        if (!response.ok) {
            throw new Error('Failed to get AI response');
        }

        return await response.json();
    }

    async getQuickHelp(topic) {
        this.showLoading();
        
        try {
            const token = localStorage.getItem('authToken');
            
            const response = await fetch('/api/ai/quick-help', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ topic })
            });

            if (!response.ok) {
                throw new Error('Failed to get quick help');
            }

            const data = await response.json();
            this.addAIMessage(data.response);
            
        } catch (error) {
            console.error('Quick Help Error:', error);
            this.addAIMessage('Sorry, I couldn\'t get quick help at the moment. Please try again.');
        } finally {
            this.hideLoading();
        }
    }

    async getTournamentSuggestions() {
        this.showLoading();
        
        try {
            const token = localStorage.getItem('authToken');
            
            const response = await fetch('/api/ai/tournament-suggestions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to get tournament suggestions');
            }

            const data = await response.json();
            
            let message = `<strong>🎯 Tournament Suggestions for You:</strong><br><br>`;
            message += `<strong>Your Games:</strong> ${data.user_games.join(', ')}<br>`;
            message += `<strong>Skill Level:</strong> ${data.skill_level}<br>`;
            message += `<strong>Win Rate:</strong> ${(data.win_rate * 100).toFixed(1)}%<br><br>`;
            message += data.suggestions;
            
            this.addAIMessage(message);
            
        } catch (error) {
            console.error('Tournament Suggestions Error:', error);
            this.addAIMessage('Sorry, I couldn\'t get tournament suggestions at the moment. Please try again.');
        } finally {
            this.hideLoading();
        }
    }

    async getPerformanceAnalysis() {
        // For demo purposes, we'll analyze the most recent match
        // In a real implementation, you'd let the user select a match
        this.showLoading();
        
        try {
            const token = localStorage.getItem('authToken');
            
            // Mock match ID for demo
            const matchId = 1;
            
            const response = await fetch('/api/ai/analyze-performance', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ match_id: matchId })
            });

            if (!response.ok) {
                throw new Error('Failed to analyze performance');
            }

            const data = await response.json();
            
            let message = `<strong>📊 Performance Analysis:</strong><br><br>`;
            message += `<strong>Match:</strong> ${data.match_data.game}<br>`;
            message += `<strong>Result:</strong> ${data.match_data.result}<br>`;
            message += `<strong>Score:</strong> ${data.match_data.score}<br><br>`;
            message += data.analysis;
            
            this.addAIMessage(message);
            
        } catch (error) {
            console.error('Performance Analysis Error:', error);
            this.addAIMessage('Sorry, I couldn\'t analyze your performance at the moment. Please try again.');
        } finally {
            this.hideLoading();
        }
    }

    async getLeaderboardInsights() {
        this.showLoading();
        
        try {
            const token = localStorage.getItem('authToken');
            
            const response = await fetch('/api/ai/leaderboard-insights', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to get leaderboard insights');
            }

            const data = await response.json();
            
            let message = `<strong>🏆 Your Leaderboard Insights:</strong><br><br>`;
            message += `<strong>Current Rank:</strong> #${data.user_stats.rank} out of ${data.user_stats.total_users}<br>`;
            message += `<strong>XP:</strong> ${data.user_stats.xp}<br>`;
            message += `<strong>Level:</strong> ${data.user_stats.level}<br>`;
            message += `<strong>Win Rate:</strong> ${(data.user_stats.win_rate * 100).toFixed(1)}%<br><br>`;
            message += data.insights;
            
            this.addAIMessage(message);
            
        } catch (error) {
            console.error('Leaderboard Insights Error:', error);
            this.addAIMessage('Sorry, I couldn\'t get leaderboard insights at the moment. Please try again.');
        } finally {
            this.hideLoading();
        }
    }

    addUserMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.className = 'user-message';
        messageElement.innerHTML = `
            <div class="message-avatar">👤</div>
            <div class="message-content">
                <p>${this.escapeHtml(message)}</p>
            </div>
        `;
        
        this.chatMessages.appendChild(messageElement);
        this.scrollToBottom();
    }

    addAIMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.className = 'ai-message';
        messageElement.innerHTML = `
            <div class="message-avatar">🤖</div>
            <div class="message-content">
                <p>${message}</p>
            </div>
        `;
        
        this.chatMessages.appendChild(messageElement);
        this.scrollToBottom();
    }

    scrollToBottom() {
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    showLoading() {
        this.loadingOverlay.classList.add('show');
    }

    hideLoading() {
        this.loadingOverlay.classList.remove('show');
    }

    clearChat() {
        // Remove all messages except the initial welcome message
        const messages = this.chatMessages.querySelectorAll('.ai-message:not(:first-child), .user-message');
        messages.forEach(message => message.remove());
        
        // Play sound
        if (window.soundManager) {
            soundManager.playSound('ui');
        }
    }

    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
}

// Initialize AI Assistant when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const token = localStorage.getItem('authToken');
    if (!token) {
        // Redirect to login if not authenticated
        window.location.href = '../login/login.html';
        return;
    }
    
    // Initialize AI Assistant
    new AIAssistant();
    
    // Initialize sound manager
    if (window.soundManager) {
        soundManager.initialize();
    }
    
    // Show welcome message for first-time users
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    if (userData.username) {
        setTimeout(() => {
            if (window.welcomeMessage) {
                welcomeMessage.show(userData);
            }
        }, 1000);
    }
});
