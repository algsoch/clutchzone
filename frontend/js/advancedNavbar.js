// Advanced Navigation System with Authentication Logic
class AdvancedNavbar {
    constructor() {
        this.currentUser = null;
        this.isAuthenticated = false;
        this.init();
    }

    init() {
        this.checkAuthState();
        this.setupEventListeners();
        this.setupMobileToggle();
        this.initializeAnimations();
        this.setupAIChatBot();
        this.setupTournamentDetails();
        this.setupActiveNavigation();
    }

    checkAuthState() {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        
        if (token && userData) {
            try {
                this.currentUser = JSON.parse(userData);
                this.isAuthenticated = true;
                this.updateNavbarForAuthenticatedUser();
                this.protectAuthenticatedRoutes();
            } catch (e) {
                console.error('Error parsing user data:', e);
                this.handleAuthError();
            }
        } else {
            this.updateNavbarForGuestUser();
            this.protectAuthenticatedRoutes();
        }
    }

    updateNavbarForAuthenticatedUser() {
        const userSection = document.querySelector('.user-section');
        if (userSection) {
            userSection.innerHTML = `
                <div class="user-profile">
                    <div class="user-avatar">
                        <img src="/images/default-avatar.png" alt="${this.currentUser.username}" onerror="this.style.display='none'">
                        <div class="user-initial">${this.currentUser.username.charAt(0).toUpperCase()}</div>
                    </div>
                    <div class="user-info">
                        <span class="username">${this.currentUser.username}</span>
                        <span class="user-level">Level ${this.currentUser.level || 1}</span>
                        <div class="xp-bar">
                            <div class="xp-fill" style="width: ${this.calculateXPPercentage()}%"></div>
                        </div>
                    </div>
                </div>
                <div class="user-actions">
                    <button class="btn btn-secondary" onclick="window.advancedNavbar.logout()">
                        <i class="icon-logout"></i> Logout
                    </button>
                </div>
            `;
        }

        // Show authenticated-only features
        this.showAuthenticatedFeatures();
    }

    updateNavbarForGuestUser() {
        const userSection = document.querySelector('.user-section');
        if (userSection) {
            userSection.innerHTML = `
                <div class="guest-actions">
                    <a href="/login/login.html" class="btn btn-primary">
                        <i class="icon-login"></i> Login
                    </a>
                    <a href="/register/register.html" class="btn btn-secondary">
                        <i class="icon-register"></i> Register
                    </a>
                </div>
            `;
        }

        // Hide authenticated-only features
        this.hideAuthenticatedFeatures();
    }

    showAuthenticatedFeatures() {
        const authOnlyItems = document.querySelectorAll('.auth-only');
        authOnlyItems.forEach(item => {
            item.style.display = 'block';
            item.classList.add('fade-in');
        });
    }

    hideAuthenticatedFeatures() {
        const authOnlyItems = document.querySelectorAll('.auth-only');
        authOnlyItems.forEach(item => {
            item.style.display = 'none';
            item.classList.remove('fade-in');
        });
    }

    calculateXPPercentage() {
        if (!this.currentUser) return 0;
        const currentXP = this.currentUser.xp || 0;
        const level = this.currentUser.level || 1;
        const xpForCurrentLevel = level * 100;
        const xpForNextLevel = (level + 1) * 100;
        const progress = ((currentXP - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)) * 100;
        return Math.max(0, Math.min(100, progress));
    }

    logout() {
        // Clear authentication data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Update navbar
        this.currentUser = null;
        this.isAuthenticated = false;
        this.updateNavbarForGuestUser();
        
        // Show logout animation
        this.showLogoutAnimation();
        
        // Redirect to home after animation
        setTimeout(() => {
            window.location.href = '/index.html';
        }, 2000);
    }

    showLogoutAnimation() {
        if (typeof NotificationManager !== 'undefined') {
            NotificationManager.show('Logging out...', 'info');
        }
        
        if (typeof SoundManager !== 'undefined') {
            SoundManager.play('click');
        }
    }

    setupEventListeners() {
        // Listen for auth state changes
        window.addEventListener('storage', (e) => {
            if (e.key === 'token' || e.key === 'user') {
                this.checkAuthState();
            }
        });

        // Listen for login/logout events
        window.addEventListener('userLogin', (e) => {
            this.currentUser = e.detail.user;
            this.isAuthenticated = true;
            this.updateNavbarForAuthenticatedUser();
            this.showWelcomeAnimation();
        });

        window.addEventListener('userLogout', () => {
            this.logout();
        });
    }

    setupMobileToggle() {
        const mobileToggle = document.querySelector('.nav-mobile-toggle');
        const navLinks = document.querySelector('.nav-links');

        if (mobileToggle && navLinks) {
            mobileToggle.addEventListener('click', () => {
                navLinks.classList.toggle('active');
                mobileToggle.classList.toggle('active');
                
                // Animate hamburger icon
                const spans = mobileToggle.querySelectorAll('span');
                spans.forEach(span => span.classList.toggle('active'));
            });

            // Close mobile menu when clicking on links
            navLinks.addEventListener('click', (e) => {
                if (e.target.tagName === 'A') {
                    navLinks.classList.remove('active');
                    mobileToggle.classList.remove('active');
                }
            });
        }
    }

    initializeAnimations() {
        // Navbar entrance animation
        const navbar = document.querySelector('.nav');
        if (navbar) {
            navbar.classList.add('nav-entrance');
            
            setTimeout(() => {
                navbar.classList.add('nav-visible');
            }, 100);
        }

        // Stagger animation for nav items
        const navItems = document.querySelectorAll('.nav-links li');
        navItems.forEach((item, index) => {
            item.style.animationDelay = `${index * 0.1}s`;
            item.classList.add('nav-item-entrance');
        });
    }

    showWelcomeAnimation() {
        if (!this.currentUser) return;

        const directions = ['top', 'bottom', 'left', 'right'];
        const randomDirection = directions[Math.floor(Math.random() * directions.length)];

        const welcomeOverlay = document.createElement('div');
        welcomeOverlay.className = `welcome-overlay welcome-${randomDirection}`;
        welcomeOverlay.innerHTML = `
            <div class="welcome-content">
                <div class="welcome-icon">🎮</div>
                <h2>Welcome back, ${this.currentUser.username}!</h2>
                <p>Level ${this.currentUser.level || 1} • ${this.currentUser.xp || 0} XP</p>
                <div class="welcome-effects">
                    <div class="particle"></div>
                    <div class="particle"></div>
                    <div class="particle"></div>
                    <div class="particle"></div>
                    <div class="particle"></div>
                </div>
                <div class="welcome-features">
                    <div class="feature-unlock">
                        <span class="unlock-icon">🔓</span>
                        <span>Profile & Wallet Unlocked!</span>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(welcomeOverlay);

        // Animate welcome message from random direction
        setTimeout(() => {
            welcomeOverlay.classList.add('show');
        }, 100);

        // Remove after 5 seconds
        setTimeout(() => {
            welcomeOverlay.classList.add('hide');
            setTimeout(() => {
                document.body.removeChild(welcomeOverlay);
            }, 500);
        }, 5000);

        // Play sound effect
        if (typeof SoundManager !== 'undefined') {
            SoundManager.play('success');
        }
    }

    handleAuthError() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.updateNavbarForGuestUser();
    }

    setupAIChatBot() {
        const aiChatBtn = document.getElementById('aiChatBtn');
        const aiChatFloat = document.getElementById('aiChatFloat');
        
        if (aiChatBtn) {
            aiChatBtn.addEventListener('click', () => {
                // Open AI Assistant page
                window.open('/ai/ai.html', '_blank');
            });
        }
        
        // Show AI chatbot on specific pages
        const currentPage = window.location.pathname;
        const showAIPages = ['/index.html', '/tournaments/tournaments.html', '/leaderboard/leaderboard.html', '/profile/profile.html'];
        
        if (showAIPages.some(page => currentPage.includes(page)) || currentPage === '/') {
            if (aiChatFloat) {
                aiChatFloat.style.display = 'block';
                setTimeout(() => {
                    aiChatFloat.classList.add('show');
                }, 1000);
            }
        }
    }

    setupTournamentDetails() {
        const currentPage = window.location.pathname;
        
        if (currentPage.includes('/index.html') || currentPage === '/') {
            this.loadTournamentDetails();
        }
    }

    loadTournamentDetails() {
        const tournamentsList = document.getElementById('liveTournamentsList');
        if (!tournamentsList) return;

        // Sample tournament data - replace with actual API call
        const tournaments = [
            {
                id: 1,
                name: "Valorant Championship",
                prize: "₹50,000",
                participants: "128/128",
                status: "Live",
                timeRemaining: "2h 30m"
            },
            {
                id: 2,
                name: "CS:GO Weekly",
                prize: "₹25,000",
                participants: "64/64",
                status: "Starting Soon",
                timeRemaining: "15m"
            },
            {
                id: 3,
                name: "PUBG Battle Royale",
                prize: "₹35,000",
                participants: "96/100",
                status: "Registering",
                timeRemaining: "1h 45m"
            }
        ];

        tournamentsList.innerHTML = tournaments.map(tournament => `
            <div class="tournament-item">
                <div class="tournament-info">
                    <h4>${tournament.name}</h4>
                    <p class="prize">Prize: ${tournament.prize}</p>
                    <p class="participants">Players: ${tournament.participants}</p>
                </div>
                <div class="tournament-status">
                    <span class="status ${tournament.status.toLowerCase().replace(' ', '-')}">${tournament.status}</span>
                    <span class="time-remaining">${tournament.timeRemaining}</span>
                </div>
            </div>
        `).join('');

        // Setup close button
        const closeBtn = document.getElementById('closeTournamentDetails');
        const tournamentFloat = document.getElementById('tournamentDetailsFloat');
        
        if (closeBtn && tournamentFloat) {
            closeBtn.addEventListener('click', () => {
                tournamentFloat.classList.remove('show');
            });
        }

        // Auto-show tournament details on index page
        if (tournamentFloat) {
            setTimeout(() => {
                tournamentFloat.classList.add('show');
            }, 3000);
        }
    }

    setupActiveNavigation() {
        const currentPage = window.location.pathname;
        const navLinks = document.querySelectorAll('.nav-links a');
        
        navLinks.forEach(link => {
            const linkPath = link.getAttribute('href');
            if (linkPath && currentPage.includes(linkPath)) {
                link.classList.add('active');
            }
        });
    }

    protectAuthenticatedRoutes() {
        const currentPage = window.location.pathname;
        const protectedRoutes = ['/profile/profile.html', '/wallet/wallet.html', '/admin/admin.html'];
        
        const isProtectedRoute = protectedRoutes.some(route => currentPage.includes(route));
        
        if (isProtectedRoute && !this.isAuthenticated) {
            // Redirect to login page
            window.location.href = '/login/login.html';
        }
    }
}

// Initialize advanced navbar
window.advancedNavbar = new AdvancedNavbar();

// Export for global use
window.AdvancedNavbar = AdvancedNavbar;
