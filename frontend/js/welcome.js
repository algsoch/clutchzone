// Welcome Message System
class WelcomeMessage {
    constructor() {
        this.isShowing = false;
        this.autoCloseTimer = null;
    }

    show(userData = {}) {
        if (this.isShowing) return;
        
        this.isShowing = true;
        this.createWelcomeMessage(userData);
        
        // Auto-close after 10 seconds
        this.autoCloseTimer = setTimeout(() => {
            this.close();
        }, 10000);
    }

    createWelcomeMessage(userData) {
        // Create overlay
        const overlay = document.createElement('div');
        overlay.className = 'welcome-overlay';
        overlay.id = 'welcomeOverlay';

        // Create message container
        const messageContainer = document.createElement('div');
        messageContainer.className = 'welcome-message';

        // Create particles background
        const particlesContainer = document.createElement('div');
        particlesContainer.className = 'welcome-particles';
        this.createParticles(particlesContainer);

        // Create close button
        const closeBtn = document.createElement('button');
        closeBtn.className = 'welcome-close';
        closeBtn.innerHTML = '×';
        closeBtn.addEventListener('click', () => this.close());

        // Create content
        const content = this.createContent(userData);
        
        // Assemble message
        messageContainer.appendChild(particlesContainer);
        messageContainer.appendChild(closeBtn);
        messageContainer.appendChild(content);
        overlay.appendChild(messageContainer);

        // Add to DOM
        document.body.appendChild(overlay);

        // Show with animation
        requestAnimationFrame(() => {
            overlay.classList.add('show');
        });

        // Play welcome sound
        if (window.soundManager) {
            soundManager.playSound('welcome');
        }
    }

    createContent(userData) {
        const content = document.createElement('div');
        content.className = 'welcome-content';

        const username = userData.username || 'Gamer';
        const xp = userData.xp || 1000;
        const level = userData.level || 1;

        content.innerHTML = `
            <div class="welcome-icon">🎮</div>
            <h1 class="welcome-title">Welcome to ClutchZone!</h1>
            <p class="welcome-subtitle">Hey ${username}, ready to dominate the arena?</p>
            
            <div class="welcome-stats">
                <div class="welcome-stat">
                    <span class="welcome-stat-number">${xp}</span>
                    <span class="welcome-stat-label">Starting XP</span>
                </div>
                <div class="welcome-stat">
                    <span class="welcome-stat-number">${level}</span>
                    <span class="welcome-stat-label">Level</span>
                </div>
                <div class="welcome-stat">
                    <span class="welcome-stat-number">∞</span>
                    <span class="welcome-stat-label">Potential</span>
                </div>
            </div>

            <div class="welcome-features">
                <div class="welcome-feature">
                    <div class="welcome-feature-icon">🏆</div>
                    <div class="welcome-feature-text">Join Tournaments</div>
                </div>
                <div class="welcome-feature">
                    <div class="welcome-feature-icon">🥇</div>
                    <div class="welcome-feature-text">Climb Leaderboards</div>
                </div>
                <div class="welcome-feature">
                    <div class="welcome-feature-icon">💰</div>
                    <div class="welcome-feature-text">Earn Rewards</div>
                </div>
                <div class="welcome-feature">
                    <div class="welcome-feature-icon">⚔️</div>
                    <div class="welcome-feature-text">Battle Players</div>
                </div>
            </div>

            <div class="welcome-buttons">
                <a href="tournaments/tournaments.html" class="welcome-btn">
                    🏆 Join Tournament
                </a>
                <a href="profile/profile.html" class="welcome-btn secondary">
                    👤 Setup Profile
                </a>
                <button class="welcome-btn secondary" onclick="welcomeMessage.close()">
                    ✨ Start Gaming
                </button>
            </div>
        `;

        return content;
    }

    createParticles(container) {
        const particleCount = 20;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'welcome-particle';
            
            // Random position
            particle.style.left = Math.random() * 100 + '%';
            particle.style.top = Math.random() * 100 + '%';
            
            // Random animation delay
            particle.style.animationDelay = Math.random() * 4 + 's';
            
            // Random size
            const size = Math.random() * 4 + 2;
            particle.style.width = size + 'px';
            particle.style.height = size + 'px';
            
            container.appendChild(particle);
        }
    }

    close() {
        if (!this.isShowing) return;
        
        const overlay = document.getElementById('welcomeOverlay');
        if (overlay) {
            overlay.classList.remove('show');
            
            setTimeout(() => {
                overlay.remove();
                this.isShowing = false;
                
                if (this.autoCloseTimer) {
                    clearTimeout(this.autoCloseTimer);
                    this.autoCloseTimer = null;
                }
            }, 500);
        }
    }

    // Show welcome message for new users
    showForNewUser(userData) {
        // Add special new user content
        const enhancedUserData = {
            ...userData,
            isNewUser: true
        };
        
        this.show(enhancedUserData);
    }

    // Show welcome message for returning users
    showForReturningUser(userData) {
        // Add special returning user content
        const enhancedUserData = {
            ...userData,
            isReturning: true
        };
        
        this.show(enhancedUserData);
    }
}

// Global welcome message instance
const welcomeMessage = new WelcomeMessage();

// Auto-show welcome message on page load for demo
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in and show appropriate welcome
    const isLoggedIn = localStorage.getItem('authToken');
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    
    if (isLoggedIn && userData.username) {
        // Show for logged in users after a short delay
        setTimeout(() => {
            welcomeMessage.showForReturningUser(userData);
        }, 1000);
    }
});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WelcomeMessage;
}
