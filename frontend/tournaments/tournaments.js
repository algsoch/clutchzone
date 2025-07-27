// Ultra-Advanced Tournament Page Navigation & Authentication System
class UltraAdvancedTournamentNav {
    constructor() {
        this.nav = document.getElementById('advancedNavbar');
        this.navToggle = document.getElementById('navToggle');
        this.navMenu = document.getElementById('navMenu');
        this.authSection = document.getElementById('authSection');
        this.userSection = document.getElementById('userSection');
        this.logoutBtn = document.getElementById('tournamentLogoutBtn');
        this.guestActions = document.querySelector('.guest-actions');
        
        // Authentication state
        this.isAuthenticated = false;
        this.isAdmin = false;
        this.currentUser = null;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.initializeNavigation();
        this.checkAuthenticationState();
        this.startAdvancedAnimations();
    }
    
    setupEventListeners() {
        // Mobile toggle functionality
        this.navToggle?.addEventListener('click', () => this.toggleMobileNav());
        
        // Logout functionality
        this.logoutBtn?.addEventListener('click', () => this.handleLogout());
        
        // Navigation link hover effects
        this.setupNavLinkEffects();
        
        // Scroll effects
        window.addEventListener('scroll', () => this.handleScroll());
        
        // Resize handling
        window.addEventListener('resize', () => this.handleResize());
        
        // User profile click
        const userProfile = document.getElementById('userProfile');
        userProfile?.addEventListener('click', () => this.showUserMenu());
    }
    
    initializeNavigation() {
        // Add entrance animation
        setTimeout(() => {
            this.nav?.classList.add('nav-loaded');
            document.body.classList.add('nav-initialized');
        }, 100);
        
        // Staggered nav item entrance
        const navItems = this.navMenu?.querySelectorAll('.nav-link') || [];
        navItems.forEach((item, index) => {
            setTimeout(() => {
                item.classList.add('nav-item-loaded', 'nav-link-entrance');
            }, 200 + (index * 100));
        });
    }
    
    checkAuthenticationState() {
        // Check localStorage for auth token
        const authToken = localStorage.getItem('authToken') || localStorage.getItem('token');
        const userData = localStorage.getItem('userData');
        
        if (authToken && userData) {
            try {
                this.currentUser = JSON.parse(userData);
                this.isAuthenticated = true;
                this.isAdmin = this.currentUser.role === 'admin';
                this.updateAuthenticationUI();
            } catch (error) {
                console.error('Error parsing user data:', error);
                this.handleLogout();
            }
        } else if (authToken) {
            // If only token exists, create minimal user data
            this.currentUser = { username: 'Player', level: 1, xp: 0 };
            this.isAuthenticated = true;
            this.updateAuthenticationUI();
        } else {
            this.setGuestMode();
        }
    }
    
    updateAuthenticationUI() {
        if (this.isAuthenticated && this.currentUser) {
            // Set authenticated state on body
            document.body.classList.add('authenticated');
            document.body.classList.remove('guest-mode');
            
            // Show user section, hide guest actions
            if (this.userSection) {
                this.userSection.classList.remove('hidden');
                this.userSection.style.display = 'flex';
            }
            if (this.guestActions) {
                this.guestActions.style.display = 'none';
            }
            
            // Set admin state if applicable
            if (this.isAdmin) {
                document.body.classList.add('admin-user');
            }
            
            // Update user info
            this.updateUserProfile();
            
        } else {
            this.setGuestMode();
        }
    }
    
    setGuestMode() {
        // Set guest state on body
        document.body.classList.add('guest-mode');
        document.body.classList.remove('authenticated', 'admin-user');
        
        // Hide user section, show guest actions
        if (this.userSection) {
            this.userSection.classList.add('hidden');
            this.userSection.style.display = 'none';
        }
        if (this.guestActions) {
            this.guestActions.style.display = 'flex';
        }
    }
    
    updateUserProfile() {
        if (!this.currentUser) return;
        
        const username = document.getElementById('username');
        const userLevel = document.getElementById('userLevel');
        const userInitial = document.getElementById('userInitial');
        const xpFill = document.getElementById('xpFill');
        
        if (username) username.textContent = this.currentUser.username || 'Player';
        if (userLevel) userLevel.textContent = `Level ${this.currentUser.level || 1}`;
        if (userInitial) userInitial.textContent = (this.currentUser.username || 'P').charAt(0).toUpperCase();
        
        // Update XP bar
        if (xpFill && this.currentUser.xp !== undefined) {
            const xpPercentage = Math.min((this.currentUser.xp % 1000) / 10, 100);
            xpFill.style.width = `${xpPercentage}%`;
        }
    }
    
    handleLogout() {
        // Show confirmation dialog
        if (confirm('Are you sure you want to logout?')) {
            // Clear authentication data
            localStorage.removeItem('authToken');
            localStorage.removeItem('token');
            localStorage.removeItem('userData');
            
            // Reset state
            this.isAuthenticated = false;
            this.isAdmin = false;
            this.currentUser = null;
            
            // Update UI
            this.setGuestMode();
            
            // Show logout animation
            this.showLogoutAnimation();
            
            // Redirect to login page
            setTimeout(() => {
                window.location.href = '../auth/login.html';
            }, 2000);
        }
    }
    
    showLogoutAnimation() {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 30px;
            background: linear-gradient(45deg, var(--secondary-color), var(--accent-color));
            color: var(--bg-dark);
            padding: 15px 25px;
            border-radius: 20px;
            box-shadow: 0 8px 25px rgba(255, 107, 53, 0.4);
            z-index: 10000;
            animation: slideInNotification 0.5s ease-out forwards;
            font-family: 'Orbitron', monospace;
            font-weight: 600;
        `;
        notification.innerHTML = '👋 Logged out successfully!';
        
        document.body.appendChild(notification);
        
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideInNotification {
                from { opacity: 0; transform: translateX(100%); }
                to { opacity: 1; transform: translateX(0); }
            }
        `;
        document.head.appendChild(style);
        
        setTimeout(() => {
            notification.remove();
            style.remove();
        }, 2000);
    }
    
    toggleMobileNav() {
        this.navToggle?.classList.toggle('active');
        this.navMenu?.classList.toggle('active');
    }
    
    setupNavLinkEffects() {
        const navLinkElements = document.querySelectorAll('.nav-link');
        
        navLinkElements.forEach(link => {
            link.addEventListener('mouseenter', (e) => {
                this.createNavLinkParticles(e.target);
            });
        });
    }
    
    createNavLinkParticles(element) {
        const rect = element.getBoundingClientRect();
        const particleCount = 3;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: fixed;
                width: 4px;
                height: 4px;
                background: var(--primary-color);
                border-radius: 50%;
                pointer-events: none;
                z-index: 9999;
                left: ${rect.left + Math.random() * rect.width}px;
                top: ${rect.top + Math.random() * rect.height}px;
                animation: navParticleFloat 1s ease-out forwards;
            `;
            
            document.body.appendChild(particle);
            setTimeout(() => particle.remove(), 1000);
        }
        
        if (!document.getElementById('nav-particle-styles')) {
            const style = document.createElement('style');
            style.id = 'nav-particle-styles';
            style.textContent = `
                @keyframes navParticleFloat {
                    0% { opacity: 1; transform: translateY(0) scale(1); }
                    100% { opacity: 0; transform: translateY(-30px) scale(0); }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    handleScroll() {
        const scrollY = window.scrollY;
        
        if (scrollY > 100 && this.nav) {
            this.nav.style.background = `linear-gradient(135deg, 
                rgba(10, 10, 15, 0.99) 0%, 
                rgba(26, 26, 46, 0.99) 50%, 
                rgba(22, 33, 62, 0.99) 100%)`;
        } else if (this.nav) {
            this.nav.style.background = `linear-gradient(135deg, 
                rgba(10, 10, 15, 0.98) 0%, 
                rgba(26, 26, 46, 0.98) 50%, 
                rgba(22, 33, 62, 0.98) 100%)`;
        }
    }
    
    handleResize() {
        if (window.innerWidth > 768) {
            this.navToggle?.classList.remove('active');
            this.navMenu?.classList.remove('active');
        }
    }
    
    startAdvancedAnimations() {
        setInterval(() => {
            if (Math.random() < 0.3) {
                this.createRandomParticle();
            }
        }, 2000);
    }
    
    createRandomParticle() {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: fixed;
            width: 2px;
            height: 2px;
            background: ${Math.random() > 0.5 ? 'var(--primary-color)' : 'var(--accent-color)'};
            border-radius: 50%;
            pointer-events: none;
            z-index: 999;
            left: ${Math.random() * window.innerWidth}px;
            top: 80px;
            animation: randomParticleFall 8s linear forwards;
            opacity: 0.6;
        `;
        
        document.body.appendChild(particle);
        setTimeout(() => particle.remove(), 8000);
        
        if (!document.getElementById('random-particle-styles')) {
            const style = document.createElement('style');
            style.id = 'random-particle-styles';
            style.textContent = `
                @keyframes randomParticleFall {
                    to { transform: translateY(100vh) rotate(360deg); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }
}

// Initialize navigation system
let tournamentNav;

// Tournaments Page JavaScript
class TournamentsPage {
    constructor() {
        this.api = new APIClient();
        this.soundManager = new SoundManager();
        this.notificationManager = new NotificationManager();
        this.xpManager = new XPManager();
        this.sceneManager = new SceneManager('threeContainer');
        
        // Initialize ultra-advanced navigation system
        this.navigation = new UltraAdvancedTournamentNav();
        
        this.tournaments = [];
        this.filteredTournaments = [];
        this.currentView = 'grid';
        this.currentFilters = {
            game: '',
            status: '',
            type: '',
            entryFee: '',
            search: ''
        };
        
        this.selectedTournament = null;
        
        this.checkAuthentication();
        this.initializeEventListeners();
        this.initializeAnimations();
        this.initializeThreeJS();
        this.loadUserData();
        this.loadTournaments();
        this.loadStats();
    }

    checkAuthentication() {
        const token = localStorage.getItem('token') || localStorage.getItem('authToken');
        if (!token) {
            // Instead of redirecting immediately, let navigation handle guest state
            console.log('No authentication token found - setting guest mode');
            return false;
        }
        
        // Set token in API client
        this.api.setAuthToken(token);
        
        // Sync with navigation authentication state
        if (this.navigation && this.navigation.isAuthenticated) {
            return true;
        }
        
        return true;
    }

    initializeEventListeners() {
        // Filter handlers
        document.getElementById('gameFilter').addEventListener('change', (e) => {
            this.currentFilters.game = e.target.value;
            this.applyFilters();
        });
        
        document.getElementById('statusFilter').addEventListener('change', (e) => {
            this.currentFilters.status = e.target.value;
            this.applyFilters();
        });
        
        document.getElementById('typeFilter').addEventListener('change', (e) => {
            this.currentFilters.type = e.target.value;
            this.applyFilters();
        });
        
        document.getElementById('entryFeeFilter').addEventListener('change', (e) => {
            this.currentFilters.entryFee = e.target.value;
            this.applyFilters();
        });
        
        // Search handler
        const searchInput = document.getElementById('searchInput');
        searchInput.addEventListener('input', (e) => {
            this.currentFilters.search = e.target.value.toLowerCase();
            this.applyFilters();
        });
        
        document.getElementById('searchBtn').addEventListener('click', () => {
            this.applyFilters();
        });
        
        // View toggle
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const view = e.target.dataset.view;
                this.switchView(view);
            });
        });
        
        // Modal handlers
        document.getElementById('closeModal').addEventListener('click', () => {
            this.hideModal('tournamentModal');
        });
        
        document.getElementById('cancelBtn').addEventListener('click', () => {
            this.hideModal('tournamentModal');
        });
        
        document.getElementById('registerBtn').addEventListener('click', () => {
            this.registerForTournament();
        });
        
        document.getElementById('closeSuccessModal').addEventListener('click', () => {
            this.hideModal('successModal');
        });
        
        document.getElementById('continueBtn').addEventListener('click', () => {
            this.hideModal('successModal');
        });
        
        // Logout handler
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.logout();
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideModal('tournamentModal');
                this.hideModal('successModal');
            }
        });
    }

    initializeAnimations() {
        // Animate elements on load
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

        gsap.from('.tournament-stats', {
            duration: 1,
            y: 40,
            opacity: 0,
            delay: 0.4,
            ease: 'power3.out'
        });

        gsap.from('.filters-container', {
            duration: 1,
            y: 30,
            opacity: 0,
            delay: 0.6,
            ease: 'power3.out'
        });

        // Floating animation for orbs
        gsap.to('.orb-1', {
            duration: 4,
            y: -20,
            rotation: 360,
            repeat: -1,
            yoyo: true,
            ease: 'power1.inOut'
        });

        gsap.to('.orb-2', {
            duration: 6,
            y: -30,
            rotation: -360,
            repeat: -1,
            yoyo: true,
            ease: 'power1.inOut'
        });

        gsap.to('.orb-3', {
            duration: 5,
            y: -25,
            rotation: 360,
            repeat: -1,
            yoyo: true,
            ease: 'power1.inOut'
        });

        // Circuit line animations
        gsap.from('.circuit-line', {
            duration: 2,
            scaleX: 0,
            delay: 0.5,
            stagger: 0.3,
            ease: 'power2.out'
        });
    }

    initializeThreeJS() {
        // Create 3D scene with tournament elements
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        
        const container = document.getElementById('threeContainer');
        this.renderer.setSize(container.offsetWidth, container.offsetHeight);
        this.renderer.setClearColor(0x000000, 0);
        container.appendChild(this.renderer.domElement);

        // Add ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);

        // Add directional light
        const directionalLight = new THREE.DirectionalLight(0x00ffff, 0.8);
        directionalLight.position.set(5, 5, 5);
        this.scene.add(directionalLight);

        // Create rotating trophy
        this.createTrophy();

        // Create floating particles
        this.createParticles();

        // Set camera position
        this.camera.position.z = 15;

        // Start animation loop
        this.animate();

        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());
    }

    createTrophy() {
        const group = new THREE.Group();
        
        // Trophy cup
        const cupGeometry = new THREE.CylinderGeometry(0.8, 0.6, 1.5, 16);
        const cupMaterial = new THREE.MeshPhongMaterial({
            color: 0xffd700,
            shininess: 100,
            transparent: true,
            opacity: 0.9
        });
        const cup = new THREE.Mesh(cupGeometry, cupMaterial);
        cup.position.y = 0.5;
        group.add(cup);

        // Trophy base
        const baseGeometry = new THREE.CylinderGeometry(1, 1, 0.3, 16);
        const baseMaterial = new THREE.MeshPhongMaterial({
            color: 0x8B4513,
            shininess: 50
        });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.y = -0.6;
        group.add(base);

        // Trophy handles
        const handleGeometry = new THREE.TorusGeometry(0.3, 0.1, 8, 16);
        const handleMaterial = new THREE.MeshPhongMaterial({
            color: 0xffd700,
            shininess: 100
        });
        
        const handle1 = new THREE.Mesh(handleGeometry, handleMaterial);
        handle1.position.set(0.9, 0.3, 0);
        handle1.rotation.z = Math.PI / 2;
        group.add(handle1);
        
        const handle2 = new THREE.Mesh(handleGeometry, handleMaterial);
        handle2.position.set(-0.9, 0.3, 0);
        handle2.rotation.z = Math.PI / 2;
        group.add(handle2);

        group.position.set(0, 0, 0);
        this.trophy = group;
        this.scene.add(group);
    }

    createParticles() {
        const particleCount = 150;
        const particles = new THREE.BufferGeometry();
        const positions = [];
        const colors = [];

        for (let i = 0; i < particleCount; i++) {
            positions.push(
                (Math.random() - 0.5) * 50,
                (Math.random() - 0.5) * 50,
                (Math.random() - 0.5) * 50
            );
            
            colors.push(
                Math.random() * 0.5 + 0.5,
                Math.random() * 0.5 + 0.5,
                1
            );
        }

        particles.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        particles.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

        const particleMaterial = new THREE.PointsMaterial({
            size: 0.1,
            vertexColors: true,
            transparent: true,
            opacity: 0.8
        });

        this.particleSystem = new THREE.Points(particles, particleMaterial);
        this.scene.add(this.particleSystem);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        // Rotate trophy
        if (this.trophy) {
            this.trophy.rotation.y += 0.01;
            this.trophy.position.y = Math.sin(Date.now() * 0.001) * 0.2;
        }

        // Animate particles
        if (this.particleSystem) {
            this.particleSystem.rotation.y += 0.002;
        }

        this.renderer.render(this.scene, this.camera);
    }

    onWindowResize() {
        const container = document.getElementById('threeContainer');
        this.camera.aspect = container.offsetWidth / container.offsetHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(container.offsetWidth, container.offsetHeight);
    }

    async loadUserData() {
        try {
            const response = await this.api.get('/auth/me');
            
            if (response.success) {
                const user = response.data;
                document.getElementById('userXP')?.textContent = user.xp.toLocaleString();
                document.getElementById('userLevel')?.textContent = user.level;
                
                // Store user data for navigation system
                localStorage.setItem('user', JSON.stringify(user));
                localStorage.setItem('userData', JSON.stringify({
                    username: user.username || user.name,
                    level: user.level,
                    xp: user.xp,
                    role: user.role || 'user'
                }));
                
                // Update navigation with user data
                if (this.navigation) {
                    this.navigation.currentUser = {
                        username: user.username || user.name,
                        level: user.level,
                        xp: user.xp,
                        role: user.role || 'user'
                    };
                    this.navigation.updateUserProfile();
                }
            }
        } catch (error) {
            console.error('Failed to load user data:', error);
            if (error.status === 401) {
                this.logout();
            }
        }
    }

    async loadTournaments() {
        this.showLoading();
        
        try {
            const response = await this.api.get('/tournaments/');
            
            if (response.success) {
                this.tournaments = response.data;
                this.filteredTournaments = [...this.tournaments];
                this.renderTournaments();
                this.hideLoading();
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            console.error('Failed to load tournaments:', error);
            this.hideLoading();
            this.showEmptyState();
            this.notificationManager.showError('Failed to load tournaments');
        }
    }

    async loadStats() {
        try {
            const response = await this.api.get('/tournaments/stats');
            
            if (response.success) {
                this.updateStats(response.data);
            }
        } catch (error) {
            console.error('Failed to load stats:', error);
        }
    }

    updateStats(stats) {
        this.animateNumber(document.getElementById('activeTournaments'), stats.active_tournaments || 0);
        this.animateNumber(document.getElementById('totalPlayers'), stats.total_players || 0);
        this.animateNumber(document.getElementById('totalPrizePool'), stats.total_prize_pool || 0, '$');
    }

    animateNumber(element, target, prefix = '') {
        gsap.to({ value: 0 }, {
            duration: 2,
            value: target,
            roundProps: 'value',
            onUpdate: function() {
                element.textContent = prefix + this.targets()[0].value.toLocaleString();
            },
            ease: 'power2.out'
        });
    }

    applyFilters() {
        this.filteredTournaments = this.tournaments.filter(tournament => {
            // Game filter
            if (this.currentFilters.game && tournament.game !== this.currentFilters.game) {
                return false;
            }
            
            // Status filter
            if (this.currentFilters.status && tournament.status !== this.currentFilters.status) {
                return false;
            }
            
            // Type filter
            if (this.currentFilters.type && tournament.type !== this.currentFilters.type) {
                return false;
            }
            
            // Entry fee filter
            if (this.currentFilters.entryFee) {
                const isFree = tournament.entry_fee === 0;
                if (this.currentFilters.entryFee === 'free' && !isFree) {
                    return false;
                }
                if (this.currentFilters.entryFee === 'paid' && isFree) {
                    return false;
                }
            }
            
            // Search filter
            if (this.currentFilters.search) {
                const searchTerm = this.currentFilters.search.toLowerCase();
                const searchableText = `${tournament.name} ${tournament.game} ${tournament.description}`.toLowerCase();
                if (!searchableText.includes(searchTerm)) {
                    return false;
                }
            }
            
            return true;
        });
        
        this.renderTournaments();
    }

    switchView(view) {
        this.currentView = view;
        
        // Update active button
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-view="${view}"]`).classList.add('active');
        
        // Update grid class
        const grid = document.getElementById('tournamentGrid');
        grid.className = `tournament-grid ${view === 'list' ? 'list-view' : ''}`;
        
        this.soundManager.playSound('button_click');
    }

    renderTournaments() {
        const grid = document.getElementById('tournamentGrid');
        
        if (this.filteredTournaments.length === 0) {
            this.showEmptyState();
            return;
        }
        
        this.hideEmptyState();
        
        grid.innerHTML = this.filteredTournaments.map(tournament => 
            this.createTournamentCard(tournament)
        ).join('');
        
        // Add click handlers to cards
        document.querySelectorAll('.tournament-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.classList.contains('action-btn')) {
                    const tournamentId = card.dataset.tournamentId;
                    this.showTournamentDetails(tournamentId);
                }
            });
        });
        
        // Add action button handlers
        document.querySelectorAll('.action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = btn.dataset.action;
                const tournamentId = btn.closest('.tournament-card').dataset.tournamentId;
                
                if (action === 'register') {
                    this.showTournamentDetails(tournamentId);
                } else if (action === 'view') {
                    this.showTournamentDetails(tournamentId);
                }
            });
        });
        
        // Animate cards
        gsap.from('.tournament-card', {
            duration: 0.6,
            y: 30,
            opacity: 0,
            stagger: 0.1,
            ease: 'power3.out'
        });
    }

    createTournamentCard(tournament) {
        const progressPercentage = tournament.max_participants > 0 
            ? (tournament.participant_count / tournament.max_participants) * 100 
            : 0;
        
        const isRegistered = tournament.is_registered || false;
        const canRegister = tournament.status === 'upcoming' && !isRegistered && 
                          tournament.participant_count < tournament.max_participants;
        
        return `
            <div class="tournament-card" data-tournament-id="${tournament.id}">
                <div class="tournament-header">
                    <div>
                        <div class="tournament-title">${tournament.name}</div>
                        <div class="tournament-game">${tournament.game}</div>
                    </div>
                    <div class="tournament-status ${tournament.status}">
                        ${tournament.status}
                    </div>
                </div>
                
                <div class="tournament-info">
                    <div class="info-item">
                        <span class="info-label">Prize Pool</span>
                        <span class="info-value prize-pool">$${tournament.prize_pool.toLocaleString()}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Entry Fee</span>
                        <span class="info-value">${tournament.entry_fee === 0 ? 'Free' : '$' + tournament.entry_fee}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Start Date</span>
                        <span class="info-value">${new Date(tournament.start_date).toLocaleDateString()}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Type</span>
                        <span class="info-value">${tournament.type.replace('_', ' ')}</span>
                    </div>
                </div>
                
                <div class="tournament-progress">
                    <div class="progress-info">
                        <span class="progress-label">Participants</span>
                        <span class="progress-value">${tournament.participant_count}/${tournament.max_participants}</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progressPercentage}%"></div>
                    </div>
                </div>
                
                <div class="tournament-actions">
                    ${canRegister ? 
                        `<button class="action-btn primary" data-action="register">Register</button>` :
                        isRegistered ? 
                        `<button class="action-btn secondary" disabled>Registered</button>` :
                        `<button class="action-btn secondary" data-action="view">View Details</button>`
                    }
                    <button class="action-btn secondary" data-action="view">Details</button>
                </div>
            </div>
        `;
    }

    showTournamentDetails(tournamentId) {
        const tournament = this.tournaments.find(t => t.id === parseInt(tournamentId));
        if (!tournament) return;
        
        this.selectedTournament = tournament;
        
        const modalBody = document.getElementById('modalBody');
        modalBody.innerHTML = `
            <div class="tournament-details">
                <div class="detail-header">
                    <h3>${tournament.name}</h3>
                    <span class="tournament-status ${tournament.status}">${tournament.status}</span>
                </div>
                
                <div class="detail-info">
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="info-label">Game</span>
                            <span class="info-value">${tournament.game}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Type</span>
                            <span class="info-value">${tournament.type.replace('_', ' ')}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Prize Pool</span>
                            <span class="info-value prize-pool">$${tournament.prize_pool.toLocaleString()}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Entry Fee</span>
                            <span class="info-value">${tournament.entry_fee === 0 ? 'Free' : '$' + tournament.entry_fee}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Start Date</span>
                            <span class="info-value">${new Date(tournament.start_date).toLocaleString()}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">End Date</span>
                            <span class="info-value">${new Date(tournament.end_date).toLocaleString()}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Participants</span>
                            <span class="info-value">${tournament.participant_count}/${tournament.max_participants}</span>
                        </div>
                    </div>
                </div>
                
                <div class="detail-description">
                    <h4>Description</h4>
                    <p>${tournament.description}</p>
                </div>
                
                <div class="detail-rules">
                    <h4>Rules</h4>
                    <div class="rules-content">
                        ${tournament.rules || 'Standard tournament rules apply.'}
                    </div>
                </div>
            </div>
        `;
        
        // Update register button
        const registerBtn = document.getElementById('registerBtn');
        const isRegistered = tournament.is_registered || false;
        const canRegister = tournament.status === 'upcoming' && !isRegistered && 
                          tournament.participant_count < tournament.max_participants;
        
        if (canRegister) {
            registerBtn.textContent = 'Register';
            registerBtn.disabled = false;
            registerBtn.classList.add('primary');
        } else {
            registerBtn.textContent = isRegistered ? 'Already Registered' : 'Registration Closed';
            registerBtn.disabled = true;
            registerBtn.classList.remove('primary');
        }
        
        this.showModal('tournamentModal');
    }

    async registerForTournament() {
        if (!this.selectedTournament) return;
        
        try {
            const response = await this.api.post(`/tournaments/${this.selectedTournament.id}/register`);
            
            if (response.success) {
                this.soundManager.playSound('success');
                this.hideModal('tournamentModal');
                this.showSuccessModal();
                
                // Update tournament in list
                const tournament = this.tournaments.find(t => t.id === this.selectedTournament.id);
                if (tournament) {
                    tournament.is_registered = true;
                    tournament.participant_count++;
                }
                
                this.renderTournaments();
                
                // Update user XP
                this.updateUserXP(25);
                
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            console.error('Registration failed:', error);
            this.soundManager.playSound('error');
            this.notificationManager.showError(error.message || 'Registration failed');
        }
    }

    showSuccessModal() {
        this.showModal('successModal');
        this.createConfetti();
        
        // Animate modal appearance
        gsap.fromTo('.modal', {
            scale: 0.8,
            opacity: 0
        }, {
            scale: 1,
            opacity: 1,
            duration: 0.5,
            ease: 'power3.out'
        });
    }

    createConfetti() {
        const container = document.getElementById('confettiContainer');
        container.innerHTML = '';
        
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti-piece';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.backgroundColor = Math.random() > 0.5 ? 'var(--primary-color)' : 'var(--secondary-color)';
            confetti.style.animationDelay = Math.random() * 3 + 's';
            confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';
            container.appendChild(confetti);
        }
    }

    updateUserXP(bonus) {
        const userXPElement = document.getElementById('userXP');
        const currentXP = parseInt(userXPElement.textContent.replace(',', ''));
        const newXP = currentXP + bonus;
        
        this.animateNumber(userXPElement, newXP);
        
        // Update local storage
        const user = JSON.parse(localStorage.getItem('user'));
        if (user) {
            user.xp = newXP;
            localStorage.setItem('user', JSON.stringify(user));
        }
    }

    showModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.add('active');
        this.soundManager.playSound('button_click');
    }

    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.remove('active');
        this.soundManager.playSound('button_click');
    }

    showLoading() {
        document.getElementById('loadingState').classList.add('active');
        document.getElementById('tournamentGrid').style.display = 'none';
        document.getElementById('emptyState').classList.remove('active');
    }

    hideLoading() {
        document.getElementById('loadingState').classList.remove('active');
        document.getElementById('tournamentGrid').style.display = 'grid';
    }

    showEmptyState() {
        document.getElementById('emptyState').classList.add('active');
        document.getElementById('tournamentGrid').style.display = 'none';
    }

    hideEmptyState() {
        document.getElementById('emptyState').classList.remove('active');
        document.getElementById('tournamentGrid').style.display = 'grid';
    }

    logout() {
        // Sync logout with navigation system
        if (this.navigation) {
            this.navigation.handleLogout();
        } else {
            // Fallback logout if navigation not available
            localStorage.removeItem('token');
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            localStorage.removeItem('userData');
            window.location.href = '../auth/login.html';
        }
    }
}

// Initialize tournaments page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TournamentsPage();
});

// Handle page visibility change
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Page is hidden, pause animations
        gsap.globalTimeline.pause();
    } else {
        // Page is visible, resume animations
        gsap.globalTimeline.resume();
    }
});

// Handle online/offline status
window.addEventListener('online', () => {
    console.log('Connection restored');
});

window.addEventListener('offline', () => {
    console.log('Connection lost');
});
