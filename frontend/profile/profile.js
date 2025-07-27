/* ===== ELITE GAMING PROFILE - ULTRA ADVANCED JAVASCRIPT ===== */

// ===== ULTRA ADVANCED PROFILE ARENA INITIALIZATION =====
class EliteProfileArena {
    constructor() {
        this.particles = [];
        this.mousePosition = { x: 0, y: 0 };
        this.canvasElements = [];
        this.activeTab = 'overview';
        this.animations = new Map();
        this.devNoticeShown = false;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeParticleSystem();
        this.setupThreeJSBackground();
        this.initializeDevNotice();
        this.setupTabSystem();
        this.initializeEnhancementModal();
        this.setupMouseEffects();
        this.initializeAnimations();
    }

    // ===== PARTICLE SYSTEM =====
    initializeParticleSystem() {
        const particleContainer = document.querySelector('.gaming-particles');
        if (!particleContainer) return;

        // Create floating particles
        for (let i = 0; i < 15; i++) {
            this.createParticle(particleContainer, i);
        }

        // Regenerate particles continuously
        setInterval(() => {
            this.createParticle(particleContainer, Math.random() * 10);
        }, 3000);
    }

    createParticle(container, index) {
        const particle = document.createElement('div');
        particle.className = `particle particle-${(index % 10) + 1}`;
        
        // Random properties
        const size = Math.random() * 4 + 2;
        const leftPosition = Math.random() * 100;
        const animationDuration = Math.random() * 10 + 15;
        
        particle.style.cssText = `
            left: ${leftPosition}%;
            width: ${size}px;
            height: ${size}px;
            animation-duration: ${animationDuration}s;
            animation-delay: ${Math.random() * 5}s;
        `;

        container.appendChild(particle);

        // Remove particle after animation
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, animationDuration * 1000);
    }

    // ===== THREE.JS BACKGROUND SYSTEM =====
    setupThreeJSBackground() {
        const canvas = document.getElementById('profile-canvas');
        if (!canvas || !window.THREE) return;

        try {
            // Scene setup
            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
            const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true });
            
            renderer.setSize(canvas.clientWidth, canvas.clientHeight);
            renderer.setClearColor(0x000000, 0);

            // Create holographic grid
            const geometry = new THREE.PlaneGeometry(20, 20, 32, 32);
            const material = new THREE.MeshBasicMaterial({
                color: 0x00ff88,
                wireframe: true,
                transparent: true,
                opacity: 0.3
            });

            const holoGrid = new THREE.Mesh(geometry, material);
            holoGrid.rotation.x = -Math.PI / 3;
            scene.add(holoGrid);

            // Add floating cubes
            for (let i = 0; i < 8; i++) {
                const cubeGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
                const cubeMaterial = new THREE.MeshBasicMaterial({
                    color: Math.random() > 0.5 ? 0x00ff88 : 0x8b5cf6,
                    transparent: true,
                    opacity: 0.6
                });

                const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
                cube.position.set(
                    (Math.random() - 0.5) * 15,
                    (Math.random() - 0.5) * 10,
                    (Math.random() - 0.5) * 10
                );
                scene.add(cube);
                this.canvasElements.push(cube);
            }

            camera.position.z = 8;

            // Animation loop
            const animate = () => {
                requestAnimationFrame(animate);

                // Rotate grid
                holoGrid.rotation.z += 0.005;

                // Animate cubes
                this.canvasElements.forEach((cube, index) => {
                    cube.rotation.x += 0.01 + index * 0.001;
                    cube.rotation.y += 0.01 + index * 0.001;
                    cube.position.y += Math.sin(Date.now() * 0.001 + index) * 0.01;
                });

                renderer.render(scene, camera);
            };

            animate();

            // Resize handler
            const handleResize = () => {
                camera.aspect = canvas.clientWidth / canvas.clientHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(canvas.clientWidth, canvas.clientHeight);
            };

            window.addEventListener('resize', handleResize);

        } catch (error) {
            console.log('Three.js background initialization failed:', error);
        }
    }

    // ===== DEVELOPMENT NOTICE SYSTEM =====
    initializeDevNotice() {
        const devNotice = document.querySelector('.dev-notice');
        if (!devNotice) return;

        // Show notice after 1 second
        setTimeout(() => {
            if (!this.devNoticeShown) {
                devNotice.style.display = 'block';
                this.animateProgressBars();
                this.devNoticeShown = true;
            }
        }, 1000);

        // Close button
        const closeBtn = devNotice.querySelector('.dev-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                devNotice.style.display = 'none';
            });
        }

        // Auto-hide after 10 seconds
        setTimeout(() => {
            if (devNotice.style.display !== 'none') {
                devNotice.style.opacity = '0';
                setTimeout(() => {
                    devNotice.style.display = 'none';
                }, 500);
            }
        }, 10000);
    }

    animateProgressBars() {
        const progressBars = document.querySelectorAll('.progress-fill');
        const progressValues = [75, 60, 45, 90]; // Different completion percentages

        progressBars.forEach((bar, index) => {
            const targetWidth = progressValues[index] || Math.random() * 80 + 20;
            
            setTimeout(() => {
                bar.style.width = `${targetWidth}%`;
            }, index * 200);
        });
    }

    // ===== TAB SYSTEM =====
    setupTabSystem() {
        const tabs = document.querySelectorAll('.crystal-tab');
        const contents = document.querySelectorAll('.dashboard-content');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetTab = tab.dataset.tab;
                this.switchTab(targetTab, tabs, contents);
            });
        });
    }

    switchTab(targetTab, tabs, contents) {
        if (this.activeTab === targetTab) return;

        // Remove active class from all tabs and contents
        tabs.forEach(tab => tab.classList.remove('active'));
        contents.forEach(content => content.classList.remove('active'));

        // Add active class to selected tab and content
        const activeTab = document.querySelector(`[data-tab="${targetTab}"]`);
        const activeContent = document.getElementById(targetTab);

        if (activeTab && activeContent) {
            activeTab.classList.add('active');
            activeContent.classList.add('active');
            this.activeTab = targetTab;

            // Trigger tab-specific animations
            this.triggerTabAnimations(targetTab);
        }
    }

    triggerTabAnimations(tabName) {
        const content = document.getElementById(tabName);
        if (!content) return;

        // Animate cards entering
        const cards = content.querySelectorAll('.gaming-card, .stat-crystal, .achievement-badge');
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            
            setTimeout(() => {
                card.style.transition = 'all 0.6s cubic-bezier(0.23, 1, 0.32, 1)';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }

    // ===== ENHANCEMENT MODAL =====
    initializeEnhancementModal() {
        const modal = document.querySelector('.enhancement-modal');
        const triggers = document.querySelectorAll('[data-enhancement]');
        const closeBtn = modal?.querySelector('.modal-close');

        triggers.forEach(trigger => {
            trigger.addEventListener('click', () => {
                if (modal) {
                    modal.classList.add('active');
                    this.animateFeaturePreview();
                }
            });
        });

        if (closeBtn && modal) {
            closeBtn.addEventListener('click', () => {
                modal.classList.remove('active');
            });
        }

        // Close on outside click
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
        }
    }

    animateFeaturePreview() {
        const features = document.querySelectorAll('.feature-item');
        features.forEach((feature, index) => {
            feature.style.opacity = '0';
            feature.style.transform = 'translateX(-20px)';
            
            setTimeout(() => {
                feature.style.transition = 'all 0.4s ease';
                feature.style.opacity = '1';
                feature.style.transform = 'translateX(0)';
            }, index * 150);
        });
    }

    // ===== MOUSE EFFECTS =====
    setupMouseEffects() {
        const mouseGradient = document.querySelector('.mouse-gradient');
        if (!mouseGradient) return;

        document.addEventListener('mousemove', (e) => {
            this.mousePosition.x = e.clientX;
            this.mousePosition.y = e.clientY;
            
            mouseGradient.style.left = `${e.clientX}px`;
            mouseGradient.style.top = `${e.clientY}px`;
        });

        // Hide mouse gradient when not moving
        let mouseTimeout;
        document.addEventListener('mousemove', () => {
            mouseGradient.style.opacity = '1';
            clearTimeout(mouseTimeout);
            mouseTimeout = setTimeout(() => {
                mouseGradient.style.opacity = '0';
            }, 2000);
        });
    }

    // ===== ADVANCED ANIMATIONS =====
    initializeAnimations() {
        this.setupScrollAnimations();
        this.setupHoverEffects();
        this.setupCounterAnimations();
        this.setupGSAPAnimations();
    }

    setupScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);

        // Observe all animatable elements
        const animatableElements = document.querySelectorAll('.gaming-card, .stat-crystal, .elite-avatar-container');
        animatableElements.forEach(el => {
            el.classList.add('animate-on-scroll');
            observer.observe(el);
        });
    }

    setupHoverEffects() {
        // Enhanced hover effects for interactive elements
        const interactiveElements = document.querySelectorAll('.gaming-card, .crystal-tab, .elite-btn, .achievement-badge');
        
        interactiveElements.forEach(element => {
            element.addEventListener('mouseenter', () => {
                element.style.transform = 'translateY(-5px) scale(1.02)';
                element.style.boxShadow = '0 20px 40px rgba(0, 255, 136, 0.3)';
            });

            element.addEventListener('mouseleave', () => {
                element.style.transform = '';
                element.style.boxShadow = '';
            });
        });
    }

    setupCounterAnimations() {
        const counters = document.querySelectorAll('.stat-value');
        
        counters.forEach(counter => {
            const target = parseInt(counter.textContent) || 0;
            const duration = 2000; // 2 seconds
            const startTime = performance.now();
            
            const updateCounter = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Easing function
                const easeOutQuart = 1 - Math.pow(1 - progress, 4);
                const current = Math.floor(target * easeOutQuart);
                
                counter.textContent = current.toLocaleString();
                
                if (progress < 1) {
                    requestAnimationFrame(updateCounter);
                }
            };
            
            // Start animation when element becomes visible
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        requestAnimationFrame(updateCounter);
                        observer.unobserve(entry.target);
                    }
                });
            });
            
            observer.observe(counter);
        });
    }

    setupGSAPAnimations() {
        if (typeof gsap === 'undefined') return;

        // Timeline for profile showcase entrance
        const showcaseTl = gsap.timeline({ delay: 0.5 });
        
        showcaseTl
            .from('.elite-avatar-container', {
                scale: 0,
                rotation: 180,
                duration: 1,
                ease: 'back.out(1.7)'
            })
            .from('.elite-name', {
                y: 50,
                opacity: 0,
                duration: 0.8,
                ease: 'power3.out'
            }, '-=0.5')
            .from('.stat-crystal', {
                y: 30,
                opacity: 0,
                duration: 0.6,
                stagger: 0.1,
                ease: 'power2.out'
            }, '-=0.3');

        // Continuous floating animation for avatar
        gsap.to('.avatar-hologram', {
            y: -10,
            duration: 3,
            ease: 'sine.inOut',
            yoyo: true,
            repeat: -1
        });

        // Crystal glow pulse animation
        gsap.to('.crystal-glow', {
            opacity: 0.3,
            scale: 1.05,
            duration: 2,
            ease: 'sine.inOut',
            yoyo: true,
            repeat: -1,
            stagger: 0.2
        });
    }

    // ===== EVENT LISTENERS =====
    setupEventListeners() {
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case '1':
                        e.preventDefault();
                        this.switchToTab('overview');
                        break;
                    case '2':
                        e.preventDefault();
                        this.switchToTab('tournaments');
                        break;
                    case '3':
                        e.preventDefault();
                        this.switchToTab('achievements');
                        break;
                    case '4':
                        e.preventDefault();
                        this.switchToTab('stats');
                        break;
                    case '5':
                        e.preventDefault();
                        this.switchToTab('settings');
                        break;
                }
            }
        });

        // Window resize optimization
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.handleResize();
            }, 250);
        });

        // Visibility change handling
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseAnimations();
            } else {
                this.resumeAnimations();
            }
        });
    }

    switchToTab(tabName) {
        const tab = document.querySelector(`[data-tab="${tabName}"]`);
        if (tab) {
            tab.click();
        }
    }

    handleResize() {
        // Recalculate particle positions
        this.initializeParticleSystem();
        
        // Update Three.js canvas if exists
        const canvas = document.getElementById('profile-canvas');
        if (canvas && this.canvasElements.length > 0) {
            // Trigger Three.js resize handling
            window.dispatchEvent(new Event('resize'));
        }
    }

    pauseAnimations() {
        document.querySelectorAll('*').forEach(el => {
            el.style.animationPlayState = 'paused';
        });
    }

    resumeAnimations() {
        document.querySelectorAll('*').forEach(el => {
            el.style.animationPlayState = 'running';
        });
    }
}

// ===== PERFORMANCE MONITORING =====
class PerformanceMonitor {
    constructor() {
        this.frameCount = 0;
        this.lastTime = performance.now();
        this.fps = 60;
        
        this.startMonitoring();
    }

    startMonitoring() {
        const monitor = () => {
            this.frameCount++;
            const currentTime = performance.now();
            
            if (currentTime - this.lastTime >= 1000) {
                this.fps = this.frameCount;
                this.frameCount = 0;
                this.lastTime = currentTime;
                
                // Optimize based on FPS
                this.optimizePerformance();
            }
            
            requestAnimationFrame(monitor);
        };
        
        requestAnimationFrame(monitor);
    }

    optimizePerformance() {
        const body = document.body;
        
        if (this.fps < 30) {
            // Reduce animations for low-end devices
            body.classList.add('reduced-motion');
        } else if (this.fps > 55) {
            // Enable full animations for high-end devices
            body.classList.remove('reduced-motion');
        }
    }
}

// ===== UTILITY FUNCTIONS =====
const ProfileUtils = {
    // Format numbers with animations
    animateNumber: (element, target, duration = 1000) => {
        const start = parseInt(element.textContent) || 0;
        const startTime = performance.now();
        
        const update = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const current = Math.floor(start + (target - start) * progress);
            
            element.textContent = current.toLocaleString();
            
            if (progress < 1) {
                requestAnimationFrame(update);
            }
        };
        
        requestAnimationFrame(update);
    },

    // Create particle burst effect
    createBurst: (x, y, color = '#00ff88') => {
        for (let i = 0; i < 12; i++) {
            const particle = document.createElement('div');
            particle.className = 'burst-particle';
            particle.style.cssText = `
                position: fixed;
                left: ${x}px;
                top: ${y}px;
                width: 4px;
                height: 4px;
                background: ${color};
                border-radius: 50%;
                pointer-events: none;
                z-index: 9999;
            `;
            
            document.body.appendChild(particle);
            
            const angle = (i / 12) * Math.PI * 2;
            const velocity = 100 + Math.random() * 50;
            const dx = Math.cos(angle) * velocity;
            const dy = Math.sin(angle) * velocity;
            
            particle.animate([
                { transform: 'translate(0, 0) scale(1)', opacity: 1 },
                { transform: `translate(${dx}px, ${dy}px) scale(0)`, opacity: 0 }
            ], {
                duration: 800,
                easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            }).onfinish = () => {
                particle.remove();
            };
        }
    },

    // Smooth scroll to element
    smoothScrollTo: (element) => {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });
    }
};

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the elite profile arena
    const profileArena = new EliteProfileArena();
    
    // Initialize performance monitoring
    const performanceMonitor = new PerformanceMonitor();
    
    // Add click effects to interactive elements
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('elite-btn') || 
            e.target.classList.contains('crystal-tab') ||
            e.target.classList.contains('achievement-badge')) {
            ProfileUtils.createBurst(e.clientX, e.clientY);
        }
    });
    
    // Add keyboard shortcut hints
    const shortcutHints = document.createElement('div');
    shortcutHints.className = 'shortcut-hints';
    shortcutHints.innerHTML = `
        <div class="hint">Press Ctrl+1-5 to switch tabs</div>
    `;
    shortcutHints.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: rgba(0, 0, 0, 0.8);
        color: #00ff88;
        padding: 10px 15px;
        border-radius: 10px;
        font-size: 0.8rem;
        opacity: 0;
        transition: opacity 0.3s ease;
        z-index: 1000;
    `;
    
    document.body.appendChild(shortcutHints);
    
    // Show hints on first visit
    setTimeout(() => {
        shortcutHints.style.opacity = '1';
        setTimeout(() => {
            shortcutHints.style.opacity = '0';
        }, 5000);
    }, 3000);
    
    console.log('🎮 Elite Gaming Profile Arena Initialized Successfully!');
});

// ===== EXPORT FOR GLOBAL ACCESS =====
window.EliteProfileArena = EliteProfileArena;
window.ProfileUtils = ProfileUtils;
            this.shareProfile();
        });

        document.getElementById('avatarEditBtn').addEventListener('click', () => {
            this.changeAvatar();
        });

        // Modal handlers
        document.getElementById('closeEditModal').addEventListener('click', () => {
            this.closeEditModal();
        });

        document.getElementById('cancelEditBtn').addEventListener('click', () => {
            this.closeEditModal();
        });

        document.getElementById('editProfileForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveProfile();
        });

        // Settings form
        document.getElementById('accountForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveAccountSettings();
        });

        // Tournament filter
        document.getElementById('tournamentFilter').addEventListener('change', (e) => {
            this.filterTournaments(e.target.value);
        });

        // Notification settings
        document.querySelectorAll('.notification-settings input').forEach(input => {
            input.addEventListener('change', (e) => {
                this.updateNotificationSettings(e.target.id, e.target.checked);
            });
        });

        // Privacy settings
        document.querySelectorAll('.privacy-settings input').forEach(input => {
            input.addEventListener('change', (e) => {
                this.updatePrivacySettings(e.target.id, e.target.checked);
            });
        });

        // Navigation
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.logout();
        });

        document.getElementById('walletBtn').addEventListener('click', () => {
            window.location.href = '../wallet/wallet.html';
        });

        // Modal close on outside click
        window.addEventListener('click', (e) => {
            if (e.target === document.getElementById('editProfileModal')) {
                this.closeEditModal();
            }
        });
    }

    initializeAnimations() {
        // Animate profile header
        gsap.from('.profile-content > *', {
            duration: 0.8,
            y: 30,
            opacity: 0,
            stagger: 0.2,
            ease: 'power3.out'
        });

        // Animate nav tabs
        gsap.from('.nav-tab', {
            duration: 0.6,
            x: -30,
            opacity: 0,
            stagger: 0.1,
            delay: 0.5,
            ease: 'power3.out'
        });

        // Animate cards
        gsap.from('.overview-card', {
            duration: 0.8,
            y: 50,
            opacity: 0,
            stagger: 0.2,
            delay: 0.8,
            ease: 'power3.out'
        });
    }

    async loadUserProfile() {
        try {
            const response = await this.api.get('/players/me');
            this.userProfile = response;
            this.updateProfileUI();
        } catch (error) {
            console.error('Error loading profile:', error);
            this.notificationManager.show('Error loading profile', 'error');
        }
    }

    updateProfileUI() {
        const profile = this.userProfile;
        
        // Update header
        document.getElementById('profileName').textContent = profile.username;
        document.getElementById('profileEmail').textContent = profile.email;
        document.getElementById('profileLevel').textContent = profile.level;
        document.getElementById('profileXP').textContent = profile.xp;
        document.getElementById('profileRank').textContent = profile.rank || '-';
        
        // Update navigation
        document.getElementById('userName').textContent = profile.username;
        document.getElementById('walletBalance').textContent = `₹${profile.wallet_balance.toFixed(2)}`;
        
        // Update avatars
        if (profile.avatar) {
            document.getElementById('profileAvatar').src = profile.avatar;
            document.getElementById('userAvatar').src = profile.avatar;
        }
        
        // Update quick stats
        document.getElementById('totalWins').textContent = profile.wins || 0;
        document.getElementById('totalKills').textContent = profile.kills || 0;
        document.getElementById('totalEarnings').textContent = `₹${profile.total_earnings || 0}`;
        
        const winRate = profile.matches_played > 0 ? 
            ((profile.wins / profile.matches_played) * 100).toFixed(1) : 0;
        document.getElementById('winRate').textContent = `${winRate}%`;
        
        // Update favorite game
        if (profile.favorite_game) {
            document.getElementById('favoriteGameName').textContent = profile.favorite_game.toUpperCase();
            document.getElementById('favoriteGameIcon').src = `../assets/images/games/${profile.favorite_game}.png`;
        }
        
        // Update stats tab
        document.getElementById('matchesPlayed').textContent = profile.matches_played || 0;
        document.getElementById('statWins').textContent = profile.wins || 0;
        document.getElementById('statLosses').textContent = profile.losses || 0;
        document.getElementById('statWinRate').textContent = `${winRate}%`;
        document.getElementById('avgKills').textContent = profile.avg_kills || 0;
        document.getElementById('bestRank').textContent = profile.best_rank || '-';
        
        // Update settings
        document.getElementById('settingsUsername').value = profile.username;
        document.getElementById('settingsEmail').value = profile.email;
        document.getElementById('settingsPhone').value = profile.phone || '';
        document.getElementById('settingsFavoriteGame').value = profile.favorite_game || 'bgmi';
        
        // Update edit modal
        document.getElementById('editUsername').value = profile.username;
        document.getElementById('editEmail').value = profile.email;
        document.getElementById('editPhone').value = profile.phone || '';
        document.getElementById('editFavoriteGame').value = profile.favorite_game || 'bgmi';
        
        // Update notification settings
        document.getElementById('tournamentNotifications').checked = profile.tournament_notifications !== false;
        document.getElementById('resultsNotifications').checked = profile.results_notifications !== false;
        document.getElementById('newTournamentNotifications').checked = profile.new_tournament_notifications !== false;
        
        // Update privacy settings
        document.getElementById('showInLeaderboard').checked = profile.show_in_leaderboard !== false;
        document.getElementById('allowFriendRequests').checked = profile.allow_friend_requests !== false;
        
        // Update XP bar
        this.xpManager.updateXPBar(profile.level, profile.xp);
        
        // Show/hide admin link
        if (profile.role === 'admin') {
            document.querySelector('.admin-only').style.display = 'inline-block';
        }
        
        // Animate numbers
        this.animateNumbers();
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

    async loadUserTournaments() {
        try {
            const response = await this.api.get('/players/my-tournaments');
            this.tournaments = response.tournaments || [];
            this.renderTournaments();
        } catch (error) {
            console.error('Error loading tournaments:', error);
            this.renderTournaments(); // Render empty state
        }
    }

    renderTournaments(filter = 'all') {
        const container = document.getElementById('registeredTournaments');
        let filteredTournaments = this.tournaments;
        
        if (filter !== 'all') {
            filteredTournaments = this.tournaments.filter(t => t.status === filter);
        }
        
        if (filteredTournaments.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">🏆</div>
                    <h3>No tournaments found</h3>
                    <p>You haven't registered for any tournaments yet.</p>
                    <button class="btn-primary" onclick="window.location.href='../tournaments/tournaments.html'">
                        Browse Tournaments
                    </button>
                </div>
            `;
            return;
        }
        
        container.innerHTML = filteredTournaments.map(tournament => `
            <div class="tournament-item">
                <div class="tournament-name">${tournament.name}</div>
                <div class="tournament-date">${new Date(tournament.date).toLocaleDateString()}</div>
                <div class="tournament-status ${tournament.status}">${tournament.status}</div>
                <div class="tournament-game">${tournament.game.toUpperCase()}</div>
                <div class="tournament-prize">Prize: ₹${tournament.prize_pool}</div>
            </div>
        `).join('');
    }

    filterTournaments(filter) {
        this.renderTournaments(filter);
    }

    async loadUserAchievements() {
        try {
            const response = await this.api.get('/players/my-achievements');
            this.achievements = response.achievements || [];
            this.renderAchievements();
        } catch (error) {
            console.error('Error loading achievements:', error);
            this.renderAchievements(); // Render empty state
        }
    }

    renderAchievements() {
        const container = document.getElementById('achievementList');
        
        if (this.achievements.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">🏅</div>
                    <h3>No achievements yet</h3>
                    <p>Start competing in tournaments to earn achievements!</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = this.achievements.map(achievement => `
            <div class="achievement-item">
                <div class="achievement-icon">${achievement.icon}</div>
                <div class="achievement-title">${achievement.title}</div>
                <div class="achievement-description">${achievement.description}</div>
                <div class="achievement-date">Earned: ${new Date(achievement.earned_at).toLocaleDateString()}</div>
            </div>
        `).join('');
    }

    async loadUserActivity() {
        try {
            const response = await this.api.get('/players/my-activity');
            this.activityData = response.activities || [];
            this.renderActivity();
        } catch (error) {
            console.error('Error loading activity:', error);
            this.renderActivity(); // Render empty state
        }
    }

    renderActivity() {
        const container = document.getElementById('recentActivity');
        
        if (this.activityData.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📈</div>
                    <p>No recent activity</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = this.activityData.map(activity => `
            <div class="activity-item">
                <div class="activity-icon">${this.getActivityIcon(activity.type)}</div>
                <div class="activity-info">
                    <div class="activity-title">${activity.title}</div>
                    <div class="activity-time">${this.formatTime(activity.created_at)}</div>
                </div>
            </div>
        `).join('');
    }

    getActivityIcon(type) {
        const icons = {
            'tournament_join': '🏆',
            'match_win': '🥇',
            'match_loss': '💪',
            'level_up': '⬆️',
            'achievement': '🏅',
            'payment': '💰'
        };
        return icons[type] || '📌';
    }

    formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        return `${Math.floor(diff / 86400000)}d ago`;
    }

    setupChart() {
        const ctx = document.getElementById('historyChart');
        if (!ctx) return;
        
        // For now, show a placeholder
        ctx.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #b0b0b0;">
                <div style="text-align: center;">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">📊</div>
                    <div>Tournament history chart coming soon</div>
                </div>
            </div>
        `;
    }

    switchTab(tabName) {
        // Update active tab
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        // Update active content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tabName).classList.add('active');
        
        this.currentTab = tabName;
        this.soundManager.playSound('click');
    }

    openEditModal() {
        document.getElementById('editProfileModal').style.display = 'block';
        this.soundManager.playSound('open');
    }

    closeEditModal() {
        document.getElementById('editProfileModal').style.display = 'none';
        this.soundManager.playSound('close');
    }

    async saveProfile() {
        try {
            const formData = {
                email: document.getElementById('editEmail').value,
                phone: document.getElementById('editPhone').value,
                favorite_game: document.getElementById('editFavoriteGame').value
            };
            
            const response = await this.api.put('/players/me', formData);
            
            if (response.success) {
                this.userProfile = { ...this.userProfile, ...formData };
                this.updateProfileUI();
                this.closeEditModal();
                this.notificationManager.show('Profile updated successfully!', 'success');
                this.soundManager.playSound('success');
            }
        } catch (error) {
            console.error('Error saving profile:', error);
            this.notificationManager.show('Error updating profile', 'error');
            this.soundManager.playSound('error');
        }
    }

    async saveAccountSettings() {
        try {
            const formData = {
                email: document.getElementById('settingsEmail').value,
                phone: document.getElementById('settingsPhone').value,
                favorite_game: document.getElementById('settingsFavoriteGame').value
            };
            
            const response = await this.api.put('/players/me', formData);
            
            if (response.success) {
                this.userProfile = { ...this.userProfile, ...formData };
                this.updateProfileUI();
                this.notificationManager.show('Settings saved successfully!', 'success');
                this.soundManager.playSound('success');
            }
        } catch (error) {
            console.error('Error saving settings:', error);
            this.notificationManager.show('Error saving settings', 'error');
            this.soundManager.playSound('error');
        }
    }

    async updateNotificationSettings(setting, enabled) {
        try {
            const data = {};
            data[setting] = enabled;
            
            await this.api.put('/players/me/notifications', data);
            this.notificationManager.show('Notification settings updated', 'success');
        } catch (error) {
            console.error('Error updating notification settings:', error);
            this.notificationManager.show('Error updating settings', 'error');
        }
    }

    async updatePrivacySettings(setting, enabled) {
        try {
            const data = {};
            data[setting] = enabled;
            
            await this.api.put('/players/me/privacy', data);
            this.notificationManager.show('Privacy settings updated', 'success');
        } catch (error) {
            console.error('Error updating privacy settings:', error);
            this.notificationManager.show('Error updating settings', 'error');
        }
    }

    async changeAvatar() {
        // Create file input
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                this.notificationManager.show('File size must be less than 5MB', 'error');
                return;
            }
            
            // Validate file type
            if (!file.type.startsWith('image/')) {
                this.notificationManager.show('Please select an image file', 'error');
                return;
            }
            
            try {
                const formData = new FormData();
                formData.append('avatar', file);
                
                const response = await this.api.post('/players/me/avatar', formData);
                
                if (response.success) {
                    // Update avatar in UI
                    document.getElementById('profileAvatar').src = response.avatar_url;
                    document.getElementById('userAvatar').src = response.avatar_url;
                    
                    this.notificationManager.show('Avatar updated successfully!', 'success');
                    this.soundManager.playSound('success');
                }
            } catch (error) {
                console.error('Error uploading avatar:', error);
                this.notificationManager.show('Error uploading avatar', 'error');
                this.soundManager.playSound('error');
            }
        };
        
        input.click();
    }

    shareProfile() {
        const profileUrl = `${window.location.origin}/profile?id=${this.userProfile.id}`;
        
        if (navigator.share) {
            navigator.share({
                title: `${this.userProfile.username}'s Profile - ClutchZone`,
                text: `Check out my gaming profile on ClutchZone!`,
                url: profileUrl
            });
        } else {
            // Fallback to clipboard
            navigator.clipboard.writeText(profileUrl).then(() => {
                this.notificationManager.show('Profile link copied to clipboard!', 'success');
            });
        }
        
        this.soundManager.playSound('success');
    }

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
        window.location.href = '../login/login.html';
    }
}

// Initialize the profile page
document.addEventListener('DOMContentLoaded', () => {
    new ProfilePage();
});

// Handle URL parameters (for viewing other profiles)
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('id');
    
    if (userId) {
        // Load specific user's profile
        // This would modify the ProfilePage class to handle viewing other users
        console.log('Loading profile for user:', userId);
    }
});

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
            case 'e':
                e.preventDefault();
                document.getElementById('editProfileBtn').click();
                break;
            case 's':
                e.preventDefault();
                if (document.getElementById('editProfileModal').style.display === 'block') {
                    document.getElementById('editProfileForm').dispatchEvent(new Event('submit'));
                }
                break;
        }
    }
    
    if (e.key === 'Escape') {
        if (document.getElementById('editProfileModal').style.display === 'block') {
            document.getElementById('closeEditModal').click();
        }
    }
});

// Add smooth scrolling for tab navigation
document.addEventListener('DOMContentLoaded', () => {
    const tabs = document.querySelectorAll('.nav-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelector('.tab-content.active').scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        });
    });
});

// Add auto-save for settings
let settingsTimeout;
document.addEventListener('DOMContentLoaded', () => {
    const settingsInputs = document.querySelectorAll('#accountForm input, #accountForm select');
    settingsInputs.forEach(input => {
        input.addEventListener('input', () => {
            clearTimeout(settingsTimeout);
            settingsTimeout = setTimeout(() => {
                // Auto-save settings after 2 seconds of inactivity
                document.getElementById('accountForm').dispatchEvent(new Event('submit'));
            }, 2000);
        });
    });
});
