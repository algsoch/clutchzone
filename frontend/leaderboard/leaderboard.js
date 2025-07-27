// Ultra-Advanced Leaderboard Page JavaScript
class LeaderboardPage {
    constructor() {
        this.api = new APIClient();
        this.soundManager = new SoundManager();
        this.notificationManager = new NotificationManager();
        this.xpManager = new XPManager();
        this.sceneManager = new SceneManager('threeContainer');
        
        this.leaderboardData = [];
        this.filteredData = [];
        this.currentFilters = {
            game: '',
            time: 'all',
            category: 'overall',
            search: ''
        };
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.totalPages = 1;
        this.currentView = 'podium';
        
        // Ultra-Advanced Enhancement Properties
        this.animationQueue = [];
        this.particleSystem = null;
        this.isEnhancedMode = true;
        this.interactionHistory = [];
        this.performanceMetrics = {
            frameRate: 60,
            loadTime: Date.now(),
            interactions: 0
        };
        
        this.initializeUltraAdvancedFeatures();
        this.checkAuthentication();
        this.initializeEventListeners();
        this.initializeAnimations();
        this.initializeThreeJS();
        this.loadUserData();
        this.loadLeaderboardData();
        this.loadStats();
    }

    // Ultra-Advanced Features Initialization
    initializeUltraAdvancedFeatures() {
        console.log('🎮 Initializing Ultra-Advanced Leaderboard Features...');
        
        // Performance monitoring
        this.startPerformanceMonitoring();
        
        // Advanced interaction tracking
        this.initializeInteractionTracking();
        
        // Dynamic theme adaptation
        this.initializeDynamicTheme();
        
        // Advanced particle system
        this.initializeAdvancedParticleSystem();
        
        // Real-time data synchronization
        this.initializeRealTimeSync();
        
        // Advanced keyboard shortcuts
        this.initializeKeyboardShortcuts();
        
        // Enhanced accessibility features
        this.initializeAccessibilityFeatures();
        
        console.log('✅ Ultra-Advanced features initialized successfully');
    }

    startPerformanceMonitoring() {
        this.performanceObserver = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (entry.entryType === 'measure') {
                    this.performanceMetrics[entry.name] = entry.duration;
                }
            }
        });
        
        this.performanceObserver.observe({ entryTypes: ['measure'] });
        
        // Monitor frame rate
        let frameCount = 0;
        let lastTime = performance.now();
        
        const measureFrameRate = (currentTime) => {
            frameCount++;
            if (currentTime - lastTime >= 1000) {
                this.performanceMetrics.frameRate = frameCount;
                frameCount = 0;
                lastTime = currentTime;
                
                // Adjust quality based on performance
                this.adjustQualitySettings();
            }
            requestAnimationFrame(measureFrameRate);
        };
        
        requestAnimationFrame(measureFrameRate);
    }

    adjustQualitySettings() {
        const { frameRate } = this.performanceMetrics;
        
        if (frameRate < 30) {
            // Reduce quality for better performance
            document.body.classList.add('low-performance-mode');
            this.isEnhancedMode = false;
        } else if (frameRate > 50) {
            // Enable high quality features
            document.body.classList.remove('low-performance-mode');
            this.isEnhancedMode = true;
        }
    }

    initializeInteractionTracking() {
        const trackInteraction = (type, element, data = {}) => {
            this.performanceMetrics.interactions++;
            this.interactionHistory.push({
                type,
                element: element.className,
                timestamp: Date.now(),
                data
            });
            
            // Keep only last 100 interactions
            if (this.interactionHistory.length > 100) {
                this.interactionHistory.shift();
            }
        };
        
        // Track clicks
        document.addEventListener('click', (e) => {
            trackInteraction('click', e.target, {
                x: e.clientX,
                y: e.clientY
            });
        });
        
        // Track hovers
        document.addEventListener('mouseover', (e) => {
            if (e.target.classList.contains('interactive')) {
                trackInteraction('hover', e.target);
            }
        });
    }

    initializeDynamicTheme() {
        // Time-based theme adaptation
        const hour = new Date().getHours();
        let timeTheme = 'default';
        
        if (hour >= 6 && hour < 12) {
            timeTheme = 'morning';
        } else if (hour >= 12 && hour < 18) {
            timeTheme = 'afternoon';
        } else if (hour >= 18 && hour < 22) {
            timeTheme = 'evening';
        } else {
            timeTheme = 'night';
        }
        
        document.body.classList.add(`theme-${timeTheme}`);
        
        // Performance-based theme
        if (this.performanceMetrics.frameRate < 30) {
            document.body.classList.add('theme-performance');
        }
        
        // User preference detection
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            document.body.classList.add('reduced-motion');
        }
        
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.body.classList.add('prefer-dark');
        }
    }

    initializeAdvancedParticleSystem() {
        if (!this.isEnhancedMode || window.innerWidth < 768) return;
        
        const canvas = document.createElement('canvas');
        canvas.id = 'advanced-particles';
        canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1;
            opacity: 0.4;
        `;
        
        document.body.appendChild(canvas);
        
        this.particleSystem = new AdvancedParticleSystem(canvas);
        this.particleSystem.initialize();
    }

    initializeRealTimeSync() {
        // WebSocket connection for real-time updates
        if (typeof WebSocket !== 'undefined') {
            this.wsConnection = new WebSocket('wss://api.clutchzone.com/leaderboard');
            
            this.wsConnection.onmessage = (event) => {
                const data = JSON.parse(event.data);
                this.handleRealTimeUpdate(data);
            };
            
            this.wsConnection.onclose = () => {
                // Attempt reconnection after 5 seconds
                setTimeout(() => {
                    this.initializeRealTimeSync();
                }, 5000);
            };
        }
    }

    handleRealTimeUpdate(data) {
        switch (data.type) {
            case 'leaderboard_update':
                this.updateLeaderboardData(data.payload);
                break;
            case 'player_online':
                this.updatePlayerStatus(data.playerId, 'online');
                break;
            case 'player_offline':
                this.updatePlayerStatus(data.playerId, 'offline');
                break;
            case 'new_achievement':
                this.showAchievementNotification(data.payload);
                break;
        }
    }

    initializeKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + key combinations
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'f':
                        e.preventDefault();
                        document.querySelector('.search-input')?.focus();
                        break;
                    case 'r':
                        e.preventDefault();
                        this.refreshLeaderboard();
                        break;
                    case '1':
                        e.preventDefault();
                        this.switchView('podium');
                        break;
                    case '2':
                        e.preventDefault();
                        this.switchView('table');
                        break;
                }
            }
            
            // Regular key shortcuts
            switch (e.key) {
                case 'Escape':
                    this.closeAllModals();
                    break;
                case 'ArrowUp':
                    if (e.target.closest('.table-container')) {
                        e.preventDefault();
                        this.navigateTable(-1);
                    }
                    break;
                case 'ArrowDown':
                    if (e.target.closest('.table-container')) {
                        e.preventDefault();
                        this.navigateTable(1);
                    }
                    break;
                case 'Enter':
                    if (e.target.classList.contains('table-row')) {
                        this.openPlayerDetails(e.target);
                    }
                    break;
            }
        });
    }

    initializeAccessibilityFeatures() {
        // Screen reader announcements
        this.announcer = document.createElement('div');
        this.announcer.setAttribute('aria-live', 'polite');
        this.announcer.setAttribute('aria-atomic', 'true');
        this.announcer.style.cssText = `
            position: absolute;
            left: -10000px;
            width: 1px;
            height: 1px;
            overflow: hidden;
        `;
        document.body.appendChild(this.announcer);
        
        // High contrast mode detection
        if (window.matchMedia('(prefers-contrast: high)').matches) {
            document.body.classList.add('high-contrast');
        }
        
        // Reduced motion support
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            document.body.classList.add('reduced-motion');
        }
    }

    announceToScreenReader(message) {
        this.announcer.textContent = message;
    }

    checkAuthentication() {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = '../login/login.html';
            return;
        }
        
        // Set token in API client
        this.api.setAuthToken(token);
    }

    initializeEventListeners() {
        // Filter handlers
        document.getElementById('gameFilter').addEventListener('change', (e) => {
            this.currentFilters.game = e.target.value;
            this.applyFilters();
        });
        
        document.getElementById('timeFilter').addEventListener('change', (e) => {
            this.currentFilters.time = e.target.value;
            this.applyFilters();
        });
        
        document.getElementById('categoryFilter').addEventListener('change', (e) => {
            this.currentFilters.category = e.target.value;
            this.applyFilters();
        });

        // Search handler
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.currentFilters.search = e.target.value.toLowerCase();
            this.applyFilters();
        });

        document.getElementById('searchBtn').addEventListener('click', () => {
            this.applyFilters();
        });

        // View toggle handlers
        document.getElementById('podiumView').addEventListener('click', () => {
            this.switchView('podium');
        });
        
        document.getElementById('listView').addEventListener('click', () => {
            this.switchView('list');
        });

        // Pagination handlers
        document.getElementById('prevBtn').addEventListener('click', () => {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.renderLeaderboard();
            }
        });

        document.getElementById('nextBtn').addEventListener('click', () => {
            if (this.currentPage < this.totalPages) {
                this.currentPage++;
                this.renderLeaderboard();
            }
        });

        // Modal handlers
        document.getElementById('closeModal').addEventListener('click', () => {
            this.closePlayerModal();
        });

        window.addEventListener('click', (e) => {
            if (e.target === document.getElementById('playerModal')) {
                this.closePlayerModal();
            }
        });

        // Logout handler
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.logout();
        });

        // Wallet handler
        document.getElementById('walletBtn').addEventListener('click', () => {
            window.location.href = '../wallet/wallet.html';
        });
    }

    initializeAnimations() {
        // Animate hero elements
        gsap.from('.hero-title', {
            duration: 1,
            y: 50,
            opacity: 0,
            ease: 'power3.out'
        });

        gsap.from('.hero-subtitle', {
            duration: 1,
            y: 30,
            opacity: 0,
            delay: 0.2,
            ease: 'power3.out'
        });

        gsap.from('.hero-stats .stat-item', {
            duration: 0.8,
            y: 30,
            opacity: 0,
            delay: 0.4,
            stagger: 0.2,
            ease: 'power3.out'
        });

        // Animate controls
        gsap.from('.controls-container', {
            duration: 0.8,
            y: 30,
            opacity: 0,
            delay: 0.6,
            ease: 'power3.out'
        });
    }

    initializeThreeJS() {
        // Create 3D trophy scene
        this.sceneManager.createTrophyScene();
        
        // Add floating particles
        this.sceneManager.addParticles();
        
        // Start animation loop
        this.sceneManager.animate();
    }

    async loadUserData() {
        try {
            const userData = await this.api.get('/players/me');
            this.updateUserInterface(userData);
        } catch (error) {
            console.error('Error loading user data:', error);
            this.notificationManager.show('Error loading user data', 'error');
        }
    }

    updateUserInterface(userData) {
        document.getElementById('userName').textContent = userData.username;
        document.getElementById('userLevel').textContent = `Level ${userData.level}`;
        document.getElementById('userXP').textContent = `${userData.xp} XP`;
        document.getElementById('walletBalance').textContent = `₹${userData.wallet_balance.toFixed(2)}`;
        
        if (userData.avatar) {
            document.getElementById('userAvatar').src = userData.avatar;
        }
        
        // Update XP bar
        this.xpManager.updateXPBar(userData.level, userData.xp);
        
        // Show/hide admin link
        if (userData.role === 'admin') {
            document.querySelector('.admin-only').style.display = 'inline-block';
        }
    }

    async loadLeaderboardData() {
        try {
            document.getElementById('loadingSpinner').style.display = 'flex';
            
            const response = await this.api.get('/players/leaderboard', {
                category: this.currentFilters.category,
                time_period: this.currentFilters.time,
                game: this.currentFilters.game
            });
            
            this.leaderboardData = response.players || [];
            this.applyFilters();
            this.renderPodium();
            
            document.getElementById('loadingSpinner').style.display = 'none';
        } catch (error) {
            console.error('Error loading leaderboard:', error);
            this.notificationManager.show('Error loading leaderboard', 'error');
            document.getElementById('loadingSpinner').style.display = 'none';
        }
    }

    async loadStats() {
        try {
            const stats = await this.api.get('/players/stats');
            
            document.getElementById('totalPlayers').textContent = stats.total_players || 0;
            document.getElementById('totalTournaments').textContent = stats.total_tournaments || 0;
            document.getElementById('totalPrizePool').textContent = `₹${stats.total_prize_pool || 0}`;
            
            // Animate numbers
            this.animateNumbers();
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    }

    animateNumbers() {
        const numbers = document.querySelectorAll('.stat-number');
        numbers.forEach(number => {
            const target = parseInt(number.textContent.replace(/[^\d]/g, ''));
            if (target > 0) {
                gsap.to(number, {
                    duration: 2,
                    innerHTML: target,
                    roundProps: "innerHTML",
                    ease: "power2.out"
                });
            }
        });
    }

    applyFilters() {
        this.filteredData = this.leaderboardData.filter(player => {
            // Game filter
            if (this.currentFilters.game && player.favorite_game !== this.currentFilters.game) {
                return false;
            }
            
            // Search filter
            if (this.currentFilters.search && 
                !player.username.toLowerCase().includes(this.currentFilters.search)) {
                return false;
            }
            
            return true;
        });
        
        // Sort based on category
        this.sortData();
        
        // Reset to first page
        this.currentPage = 1;
        this.totalPages = Math.ceil(this.filteredData.length / this.itemsPerPage);
        
        // Render based on current view
        if (this.currentView === 'podium') {
            this.renderPodium();
        } else {
            this.renderLeaderboard();
        }
    }

    sortData() {
        switch (this.currentFilters.category) {
            case 'wins':
                this.filteredData.sort((a, b) => b.wins - a.wins);
                break;
            case 'earnings':
                this.filteredData.sort((a, b) => b.total_earnings - a.total_earnings);
                break;
            case 'xp':
                this.filteredData.sort((a, b) => b.xp - a.xp);
                break;
            case 'level':
                this.filteredData.sort((a, b) => b.level - a.level);
                break;
            default: // overall
                this.filteredData.sort((a, b) => {
                    const scoreA = (a.wins * 10) + (a.xp * 0.01) + (a.total_earnings * 0.1);
                    const scoreB = (b.wins * 10) + (b.xp * 0.01) + (b.total_earnings * 0.1);
                    return scoreB - scoreA;
                });
        }
    }

    switchView(view) {
        this.currentView = view;
        
        // Update view buttons
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        if (view === 'podium') {
            document.getElementById('podiumView').classList.add('active');
            document.getElementById('podiumSection').style.display = 'block';
            document.getElementById('leaderboardSection').style.display = 'none';
            this.renderPodium();
        } else {
            document.getElementById('listView').classList.add('active');
            document.getElementById('podiumSection').style.display = 'none';
            document.getElementById('leaderboardSection').style.display = 'block';
            this.renderLeaderboard();
        }
        
        this.soundManager.playSound('click');
    }

    renderPodium() {
        const topThree = this.filteredData.slice(0, 3);
        
        // Clear podium
        for (let i = 1; i <= 3; i++) {
            document.getElementById(`player${i}Name`).textContent = '-';
            document.getElementById(`player${i}Level`).textContent = 'Level -';
            document.getElementById(`player${i}XP`).textContent = '- XP';
            document.getElementById(`player${i}Wins`).textContent = '- Wins';
            document.getElementById(`player${i}Earnings`).textContent = '₹-';
            document.getElementById(`player${i}Avatar`).src = '../assets/images/default-avatar.png';
        }
        
        // Populate podium
        topThree.forEach((player, index) => {
            const position = index === 0 ? 1 : index === 1 ? 2 : 3;
            const playerIndex = position === 1 ? 1 : position === 2 ? 2 : 3;
            
            document.getElementById(`player${playerIndex}Name`).textContent = player.username;
            document.getElementById(`player${playerIndex}Level`).textContent = `Level ${player.level}`;
            document.getElementById(`player${playerIndex}XP`).textContent = `${player.xp} XP`;
            document.getElementById(`player${playerIndex}Wins`).textContent = `${player.wins} Wins`;
            document.getElementById(`player${playerIndex}Earnings`).textContent = `₹${player.total_earnings.toFixed(2)}`;
            
            if (player.avatar) {
                document.getElementById(`player${playerIndex}Avatar`).src = player.avatar;
            }
        });
        
        // Animate podium
        gsap.from('.podium-rank', {
            duration: 0.8,
            y: 50,
            opacity: 0,
            stagger: 0.2,
            ease: 'power3.out'
        });
    }

    renderLeaderboard() {
        const tbody = document.getElementById('leaderboardBody');
        tbody.innerHTML = '';
        
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const currentData = this.filteredData.slice(startIndex, endIndex);
        
        currentData.forEach((player, index) => {
            const rank = startIndex + index + 1;
            const row = this.createLeaderboardRow(player, rank);
            tbody.appendChild(row);
        });
        
        // Update pagination
        this.updatePagination();
        
        // Animate rows
        gsap.from('.table-row', {
            duration: 0.6,
            x: -50,
            opacity: 0,
            stagger: 0.1,
            ease: 'power3.out'
        });
    }

    createLeaderboardRow(player, rank) {
        const row = document.createElement('div');
        row.className = 'table-row';
        row.onclick = () => this.showPlayerModal(player);
        
        const winRate = player.matches_played > 0 ? 
            ((player.wins / player.matches_played) * 100).toFixed(1) : '0.0';
        
        row.innerHTML = `
            <div class="rank-cell">${rank}</div>
            <div class="player-cell">
                <img src="${player.avatar || '../assets/images/default-avatar.png'}" alt="${player.username}">
                <span class="player-name">${player.username}</span>
            </div>
            <div class="cell-data">${player.level}</div>
            <div class="cell-data">${player.xp}</div>
            <div class="cell-data">${player.wins}</div>
            <div class="cell-data earnings-cell">₹${player.total_earnings.toFixed(2)}</div>
            <div class="cell-data">${winRate}%</div>
            <div class="cell-data">
                <button class="action-btn" onclick="event.stopPropagation(); window.location.href='../profile/profile.html?id=${player.id}'">
                    View Profile
                </button>
            </div>
        `;
        
        return row;
    }

    updatePagination() {
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const pageInfo = document.getElementById('pageInfo');
        
        prevBtn.disabled = this.currentPage === 1;
        nextBtn.disabled = this.currentPage >= this.totalPages;
        
        pageInfo.textContent = `Page ${this.currentPage} of ${this.totalPages}`;
    }

    showPlayerModal(player) {
        document.getElementById('modalPlayerName').textContent = player.username;
        document.getElementById('modalPlayerLevel').textContent = player.level;
        document.getElementById('modalPlayerXP').textContent = player.xp;
        document.getElementById('modalPlayerWins').textContent = player.wins;
        document.getElementById('modalPlayerLosses').textContent = player.losses || 0;
        document.getElementById('modalPlayerEarnings').textContent = `₹${player.total_earnings.toFixed(2)}`;
        
        const winRate = player.matches_played > 0 ? 
            ((player.wins / player.matches_played) * 100).toFixed(1) : '0.0';
        document.getElementById('modalPlayerWinRate').textContent = `${winRate}%`;
        
        if (player.avatar) {
            document.getElementById('modalPlayerAvatar').src = player.avatar;
        }
        
        // Load achievements
        this.loadPlayerAchievements(player.id);
        
        document.getElementById('playerModal').style.display = 'block';
        this.soundManager.playSound('open');
    }

    async loadPlayerAchievements(playerId) {
        try {
            const achievements = await this.api.get(`/players/${playerId}/achievements`);
            const container = document.getElementById('modalPlayerAchievements');
            container.innerHTML = '';
            
            if (achievements.length > 0) {
                achievements.forEach(achievement => {
                    const badge = document.createElement('div');
                    badge.className = 'achievement-badge';
                    badge.textContent = achievement.title;
                    container.appendChild(badge);
                });
            } else {
                container.innerHTML = '<p style="color: #b0b0b0;">No achievements yet</p>';
            }
        } catch (error) {
            console.error('Error loading achievements:', error);
            document.getElementById('modalPlayerAchievements').innerHTML = 
                '<p style="color: #b0b0b0;">Unable to load achievements</p>';
        }
    }

    closePlayerModal() {
        document.getElementById('playerModal').style.display = 'none';
        this.soundManager.playSound('close');
    }

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
        window.location.href = '../login/login.html';
    }
}

// Initialize the leaderboard page
document.addEventListener('DOMContentLoaded', () => {
    new LeaderboardPage();
});

// Add mobile menu toggle functionality
document.addEventListener('DOMContentLoaded', () => {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (navToggle) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }
});

// Add keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const modal = document.getElementById('playerModal');
        if (modal.style.display === 'block') {
            modal.style.display = 'none';
        }
    }
});

// Add scroll-to-top functionality
window.addEventListener('scroll', () => {
    const scrollTop = document.querySelector('.scroll-top');
    if (scrollTop) {
        if (window.pageYOffset > 100) {
            scrollTop.style.display = 'block';
        } else {
            scrollTop.style.display = 'none';
        }
    }
});

// Performance optimization - debounce search
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Apply debounce to search input
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        const debouncedSearch = debounce((e) => {
            const event = new CustomEvent('debouncedInput', { detail: e.target.value });
            searchInput.dispatchEvent(event);
        }, 300);
        
        searchInput.addEventListener('input', debouncedSearch);
    }
});

// Ultra-Advanced Particle System Class
class AdvancedParticleSystem {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.connections = [];
        this.mouse = { x: 0, y: 0 };
        this.animationId = null;
        this.isActive = true;
        
        this.config = {
            particleCount: 50,
            maxDistance: 150,
            particleSpeed: 0.5,
            connectionOpacity: 0.3,
            colors: ['#00ff88', '#8b5cf6', '#ff6b35', '#ffd700']
        };
        
        this.bindEvents();
    }
    
    initialize() {
        this.resizeCanvas();
        this.createParticles();
        this.animate();
    }
    
    bindEvents() {
        window.addEventListener('resize', () => this.resizeCanvas());
        
        document.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });
        
        document.addEventListener('visibilitychange', () => {
            this.isActive = !document.hidden;
            if (this.isActive) {
                this.animate();
            } else {
                cancelAnimationFrame(this.animationId);
            }
        });
    }
    
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    createParticles() {
        this.particles = [];
        
        for (let i = 0; i < this.config.particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * this.config.particleSpeed,
                vy: (Math.random() - 0.5) * this.config.particleSpeed,
                size: Math.random() * 3 + 1,
                alpha: Math.random() * 0.5 + 0.3,
                color: this.config.colors[Math.floor(Math.random() * this.config.colors.length)],
                pulse: Math.random() * Math.PI * 2
            });
        }
    }
    
    updateParticles() {
        this.particles.forEach(particle => {
            // Update position
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Bounce off edges
            if (particle.x < 0 || particle.x > this.canvas.width) {
                particle.vx *= -1;
            }
            if (particle.y < 0 || particle.y > this.canvas.height) {
                particle.vy *= -1;
            }
            
            // Mouse interaction
            const dx = this.mouse.x - particle.x;
            const dy = this.mouse.y - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 100) {
                const force = (100 - distance) / 100;
                particle.vx += dx * force * 0.001;
                particle.vy += dy * force * 0.001;
            }
            
            // Update pulse for breathing effect
            particle.pulse += 0.02;
            particle.currentAlpha = particle.alpha + Math.sin(particle.pulse) * 0.2;
        });
    }
    
    drawParticles() {
        this.particles.forEach(particle => {
            this.ctx.save();
            this.ctx.globalAlpha = Math.max(0, particle.currentAlpha);
            this.ctx.fillStyle = particle.color;
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = particle.color;
            
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        });
    }
    
    drawConnections() {
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < this.config.maxDistance) {
                    const opacity = (this.config.maxDistance - distance) / this.config.maxDistance * this.config.connectionOpacity;
                    
                    this.ctx.save();
                    this.ctx.globalAlpha = opacity;
                    this.ctx.strokeStyle = '#00ff88';
                    this.ctx.lineWidth = 1;
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.stroke();
                    this.ctx.restore();
                }
            }
        }
    }
    
    animate() {
        if (!this.isActive) return;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.updateParticles();
        this.drawConnections();
        this.drawParticles();
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    destroy() {
        this.isActive = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        if (this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
    }
}

// Ultra-Advanced Animation Queue Manager
class AnimationQueueManager {
    constructor() {
        this.queue = [];
        this.isProcessing = false;
        this.maxConcurrent = 3;
        this.currentAnimations = 0;
    }
    
    add(animation) {
        this.queue.push({
            ...animation,
            id: Math.random().toString(36).substr(2, 9),
            timestamp: Date.now()
        });
        
        this.process();
    }
    
    async process() {
        if (this.isProcessing || this.currentAnimations >= this.maxConcurrent) {
            return;
        }
        
        this.isProcessing = true;
        
        while (this.queue.length > 0 && this.currentAnimations < this.maxConcurrent) {
            const animation = this.queue.shift();
            this.currentAnimations++;
            
            this.executeAnimation(animation).finally(() => {
                this.currentAnimations--;
                this.process();
            });
        }
        
        this.isProcessing = false;
    }
    
    async executeAnimation(animation) {
        try {
            if (animation.type === 'css') {
                await this.executeCSSAnimation(animation);
            } else if (animation.type === 'js') {
                await this.executeJSAnimation(animation);
            } else if (animation.type === 'gsap') {
                await this.executeGSAPAnimation(animation);
            }
        } catch (error) {
            console.error('Animation execution failed:', error);
        }
    }
    
    async executeCSSAnimation(animation) {
        return new Promise((resolve) => {
            const element = animation.element;
            const className = animation.className;
            
            element.classList.add(className);
            
            const handleAnimationEnd = () => {
                element.removeEventListener('animationend', handleAnimationEnd);
                if (animation.cleanup) {
                    element.classList.remove(className);
                }
                resolve();
            };
            
            element.addEventListener('animationend', handleAnimationEnd);
            
            // Fallback timeout
            setTimeout(() => {
                handleAnimationEnd();
            }, animation.duration || 1000);
        });
    }
    
    async executeJSAnimation(animation) {
        return new Promise((resolve) => {
            if (typeof animation.function === 'function') {
                animation.function(resolve);
            } else {
                resolve();
            }
        });
    }
    
    async executeGSAPAnimation(animation) {
        return new Promise((resolve) => {
            if (typeof gsap !== 'undefined') {
                gsap.to(animation.element, {
                    ...animation.properties,
                    onComplete: resolve
                });
            } else {
                resolve();
            }
        });
    }
    
    clear() {
        this.queue = [];
    }
    
    getQueueLength() {
        return this.queue.length;
    }
}

// Ultra-Advanced Performance Monitor
class PerformanceMonitor {
    constructor() {
        this.metrics = {
            fps: 0,
            memory: 0,
            loadTime: 0,
            renderTime: 0,
            domNodes: 0
        };
        
        this.observers = [];
        this.isMonitoring = false;
        
        this.startMonitoring();
    }
    
    startMonitoring() {
        if (this.isMonitoring) return;
        this.isMonitoring = true;
        
        // FPS monitoring
        this.monitorFPS();
        
        // Memory monitoring
        this.monitorMemory();
        
        // DOM nodes monitoring
        this.monitorDOMNodes();
        
        // Performance observer for render timing
        if ('PerformanceObserver' in window) {
            this.setupPerformanceObserver();
        }
    }
    
    monitorFPS() {
        let frames = 0;
        let lastTime = performance.now();
        
        const calculateFPS = (currentTime) => {
            frames++;
            
            if (currentTime - lastTime >= 1000) {
                this.metrics.fps = Math.round((frames * 1000) / (currentTime - lastTime));
                frames = 0;
                lastTime = currentTime;
                
                this.notifyObservers('fps', this.metrics.fps);
            }
            
            if (this.isMonitoring) {
                requestAnimationFrame(calculateFPS);
            }
        };
        
        requestAnimationFrame(calculateFPS);
    }
    
    monitorMemory() {
        if ('memory' in performance) {
            setInterval(() => {
                this.metrics.memory = performance.memory.usedJSHeapSize;
                this.notifyObservers('memory', this.metrics.memory);
            }, 5000);
        }
    }
    
    monitorDOMNodes() {
        setInterval(() => {
            this.metrics.domNodes = document.querySelectorAll('*').length;
            this.notifyObservers('domNodes', this.metrics.domNodes);
        }, 10000);
    }
    
    setupPerformanceObserver() {
        const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (entry.entryType === 'measure') {
                    this.metrics.renderTime = entry.duration;
                    this.notifyObservers('renderTime', this.metrics.renderTime);
                }
            }
        });
        
        observer.observe({ entryTypes: ['measure', 'navigation'] });
    }
    
    addObserver(callback) {
        this.observers.push(callback);
    }
    
    removeObserver(callback) {
        const index = this.observers.indexOf(callback);
        if (index > -1) {
            this.observers.splice(index, 1);
        }
    }
    
    notifyObservers(metric, value) {
        this.observers.forEach(callback => {
            try {
                callback(metric, value, this.metrics);
            } catch (error) {
                console.error('Performance observer callback error:', error);
            }
        });
    }
    
    getMetrics() {
        return { ...this.metrics };
    }
    
    stopMonitoring() {
        this.isMonitoring = false;
    }
}

// Ultra-Advanced Accessibility Manager
class AccessibilityManager {
    constructor() {
        this.announcements = [];
        this.focusHistory = [];
        this.shortcuts = new Map();
        
        this.initialize();
    }
    
    initialize() {
        this.createLiveRegion();
        this.setupFocusManagement();
        this.setupKeyboardNavigation();
        this.detectUserPreferences();
    }
    
    createLiveRegion() {
        this.liveRegion = document.createElement('div');
        this.liveRegion.setAttribute('aria-live', 'polite');
        this.liveRegion.setAttribute('aria-atomic', 'true');
        this.liveRegion.style.cssText = `
            position: absolute;
            left: -10000px;
            width: 1px;
            height: 1px;
            overflow: hidden;
        `;
        document.body.appendChild(this.liveRegion);
    }
    
    announce(message, priority = 'polite') {
        if (priority === 'assertive') {
            this.liveRegion.setAttribute('aria-live', 'assertive');
        } else {
            this.liveRegion.setAttribute('aria-live', 'polite');
        }
        
        this.liveRegion.textContent = message;
        
        this.announcements.push({
            message,
            priority,
            timestamp: Date.now()
        });
        
        // Clear after announcement
        setTimeout(() => {
            this.liveRegion.textContent = '';
        }, 1000);
    }
    
    setupFocusManagement() {
        document.addEventListener('focusin', (e) => {
            this.focusHistory.push({
                element: e.target,
                timestamp: Date.now()
            });
            
            // Keep only last 10 focus events
            if (this.focusHistory.length > 10) {
                this.focusHistory.shift();
            }
        });
    }
    
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            const handler = this.shortcuts.get(this.getShortcutKey(e));
            if (handler) {
                e.preventDefault();
                handler(e);
            }
        });
    }
    
    getShortcutKey(event) {
        let key = '';
        if (event.ctrlKey) key += 'ctrl+';
        if (event.altKey) key += 'alt+';
        if (event.shiftKey) key += 'shift+';
        key += event.key.toLowerCase();
        return key;
    }
    
    addShortcut(keyCombo, handler, description) {
        this.shortcuts.set(keyCombo, handler);
        
        // Add to help system
        this.addToShortcutHelp(keyCombo, description);
    }
    
    addToShortcutHelp(keyCombo, description) {
        let helpContainer = document.getElementById('keyboard-shortcuts-help');
        if (!helpContainer) {
            helpContainer = document.createElement('div');
            helpContainer.id = 'keyboard-shortcuts-help';
            helpContainer.style.display = 'none';
            document.body.appendChild(helpContainer);
        }
        
        const shortcut = document.createElement('div');
        shortcut.innerHTML = `<kbd>${keyCombo}</kbd>: ${description}`;
        helpContainer.appendChild(shortcut);
    }
    
    detectUserPreferences() {
        // Reduced motion
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            document.body.classList.add('reduced-motion');
            this.announce('Reduced motion mode detected', 'polite');
        }
        
        // High contrast
        if (window.matchMedia('(prefers-contrast: high)').matches) {
            document.body.classList.add('high-contrast');
            this.announce('High contrast mode detected', 'polite');
        }
        
        // Color scheme
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.body.classList.add('dark-scheme');
        }
    }
    
    manageFocus(element) {
        if (element && typeof element.focus === 'function') {
            element.focus();
            
            // Ensure element is visible
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }
    }
    
    getLastFocusedElement() {
        return this.focusHistory.length > 0 ? 
            this.focusHistory[this.focusHistory.length - 1].element : null;
    }
}

// Initialize global instances
window.animationQueueManager = new AnimationQueueManager();
window.performanceMonitor = new PerformanceMonitor();
window.accessibilityManager = new AccessibilityManager();

console.log('🚀 Ultra-Advanced Leaderboard System Fully Loaded!');
