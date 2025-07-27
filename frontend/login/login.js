// ClutchZone Login - Ultra-Advanced JavaScript System with Database Integration
class ClutchZoneLogin {
    constructor() {
        this.API_BASE = 'https://api.clutchzone.dev';
        this.DB_CONFIG = {
            host: 'clutchzone-db-do-user-19447431-0.m.db.ondigitalocean.com',
            database: 'defaultdb',
            username: 'doadmin',
            port: 25060,
            ssl: true
        };
        
        this.elements = {};
        this.animations = {};
        this.validators = {};
        this.sounds = null;
        this.particles = null;
        this.backgroundAnimation = null;
        
        this.isLoading = false;
        this.loginAttempts = 0;
        this.maxLoginAttempts = 5;
        this.lockoutTime = 300000; // 5 minutes
        
        this.init();
    }

    // Initialize the login system
    async init() {
        try {
            this.cacheElements();
            this.setupEventListeners();
            await this.initializeAnimations();
            await this.initializeSounds();
            this.setupValidation();
            this.initializeParticles();
            this.startBackgroundAnimations();
            this.checkAuthStatus();
            this.setupConnectionMonitoring();
            
            console.log('ClutchZone Login System Initialized Successfully');
        } catch (error) {
            console.error('Failed to initialize login system:', error);
            this.showNotification('Failed to initialize login system', 'error');
        }
    }

    // Cache DOM elements
    cacheElements() {
        this.elements = {
            // Form elements
            loginForm: document.getElementById('loginForm'),
            emailInput: document.getElementById('email'),
            passwordInput: document.getElementById('password'),
            rememberMe: document.getElementById('rememberMe'),
            loginBtn: document.getElementById('loginBtn'),
            togglePassword: document.getElementById('togglePassword'),
            
            // Loading and modal elements
            loadingOverlay: document.getElementById('loadingOverlay'),
            successModal: document.getElementById('successModal'),
            modalCanvas: document.getElementById('modalCanvas'),
            
            // Progress elements
            progressFill: document.getElementById('progressFill'),
            loadingMessage: document.getElementById('loadingMessage'),
            step1: document.getElementById('step1'),
            step2: document.getElementById('step2'),
            step3: document.getElementById('step3'),
            
            // Modal elements
            welcomeUsername: document.getElementById('welcomeUsername'),
            lastSeen: document.getElementById('lastSeen'),
            userAvatar: document.getElementById('userAvatar'),
            userLevel: document.getElementById('userLevel'),
            xpProgress: document.getElementById('xpProgress'),
            levelUpNotification: document.getElementById('levelUpNotification'),
            continueBtn: document.getElementById('continueBtn'),
            profileBtn: document.getElementById('profileBtn'),
            closeModal: document.getElementById('closeModal'),
            
            // Social login buttons
            discordBtn: document.querySelector('.social-btn.discord'),
            steamBtn: document.querySelector('.social-btn.steam'),
            googleBtn: document.querySelector('.social-btn.google'),
            
            // Notification and status
            notificationContainer: document.getElementById('notificationContainer'),
            connectionStatus: document.getElementById('connectionStatus'),
            
            // Background elements
            bgCanvas: document.getElementById('bgCanvas'),
            particleField: document.querySelector('.particle-field'),
            floatingElements: document.querySelector('.floating-elements')
        };
    }

    // Setup event listeners
    setupEventListeners() {
        // Form submission
        if (this.elements.loginForm) {
            this.elements.loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Password toggle
        if (this.elements.togglePassword) {
            this.elements.togglePassword.addEventListener('click', () => this.togglePasswordVisibility());
        }

        // Input validation
        if (this.elements.emailInput) {
            this.elements.emailInput.addEventListener('input', () => this.validateEmail());
            this.elements.emailInput.addEventListener('blur', () => this.validateEmail());
        }

        if (this.elements.passwordInput) {
            this.elements.passwordInput.addEventListener('input', () => this.validatePassword());
            this.elements.passwordInput.addEventListener('blur', () => this.validatePassword());
        }

        // Social login buttons
        if (this.elements.discordBtn) {
            this.elements.discordBtn.addEventListener('click', () => this.socialLogin('discord'));
        }
        if (this.elements.steamBtn) {
            this.elements.steamBtn.addEventListener('click', () => this.socialLogin('steam'));
        }
        if (this.elements.googleBtn) {
            this.elements.googleBtn.addEventListener('click', () => this.socialLogin('google'));
        }

        // Modal controls
        if (this.elements.closeModal) {
            this.elements.closeModal.addEventListener('click', () => this.closeSuccessModal());
        }
        if (this.elements.continueBtn) {
            this.elements.continueBtn.addEventListener('click', () => this.continueToArena());
        }
        if (this.elements.profileBtn) {
            this.elements.profileBtn.addEventListener('click', () => this.viewProfile());
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));

        // Window events
        window.addEventListener('online', () => this.updateConnectionStatus(true));
        window.addEventListener('offline', () => this.updateConnectionStatus(false));
        window.addEventListener('beforeunload', () => this.cleanup());
    }

    // Initialize GSAP animations
    async initializeAnimations() {
        if (typeof gsap === 'undefined') {
            console.warn('GSAP not loaded, using fallback animations');
            return;
        }

        // Register ScrollTrigger plugin if available
        if (typeof ScrollTrigger !== 'undefined') {
            gsap.registerPlugin(ScrollTrigger);
        }

        // Set up initial animations
        this.setupEntranceAnimations();
        this.setupHoverAnimations();
        this.setupFormAnimations();
    }

    // Setup entrance animations
    setupEntranceAnimations() {
        if (typeof gsap === 'undefined') return;

        // Navbar animation
        gsap.from('.advanced-navbar', {
            y: -100,
            opacity: 0,
            duration: 1,
            ease: 'power3.out'
        });

        // Welcome panel animation
        gsap.from('.welcome-content > *', {
            x: -100,
            opacity: 0,
            duration: 1.2,
            stagger: 0.2,
            ease: 'power3.out',
            delay: 0.3
        });

        // Login panel animation
        gsap.from('.login-container', {
            x: 100,
            opacity: 0,
            duration: 1.2,
            ease: 'power3.out',
            delay: 0.5
        });

        // Floating elements animation
        this.animateFloatingElements();
    }

    // Setup hover animations
    setupHoverAnimations() {
        if (typeof gsap === 'undefined') return;

        // Button hover animations
        document.querySelectorAll('.login-btn, .social-btn, .modal-btn').forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                gsap.to(btn, {
                    scale: 1.05,
                    duration: 0.3,
                    ease: 'power2.out'
                });
            });

            btn.addEventListener('mouseleave', () => {
                gsap.to(btn, {
                    scale: 1,
                    duration: 0.3,
                    ease: 'power2.out'
                });
            });
        });

        // Input focus animations
        document.querySelectorAll('.form-input').forEach(input => {
            input.addEventListener('focus', () => {
                gsap.to(input.parentElement, {
                    scale: 1.02,
                    duration: 0.3,
                    ease: 'power2.out'
                });
            });

            input.addEventListener('blur', () => {
                gsap.to(input.parentElement, {
                    scale: 1,
                    duration: 0.3,
                    ease: 'power2.out'
                });
            });
        });
    }

    // Setup form animations
    setupFormAnimations() {
        if (typeof gsap === 'undefined') return;

        // Form group stagger animation
        gsap.from('.form-group', {
            y: 30,
            opacity: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: 'power3.out',
            delay: 1
        });

        // Social buttons animation
        gsap.from('.social-btn', {
            scale: 0,
            rotation: 180,
            duration: 0.8,
            stagger: 0.1,
            ease: 'back.out(1.7)',
            delay: 1.5
        });
    }

    // Animate floating elements
    animateFloatingElements() {
        if (!this.elements.floatingElements) return;

        // Create floating particles
        for (let i = 0; i < 20; i++) {
            const element = document.createElement('div');
            element.className = 'floating-element';
            element.style.left = Math.random() * 100 + '%';
            element.style.animationDelay = Math.random() * 20 + 's';
            element.style.animationDuration = (Math.random() * 10 + 20) + 's';
            this.elements.floatingElements.appendChild(element);
        }
    }
    // Initialize sound system
    async initializeSounds() {
        if (typeof Howl === 'undefined') {
            console.warn('Howler.js not loaded, sounds disabled');
            return;
        }

        try {
            this.sounds = {
                hover: new Howl({
                    src: ['../sounds/hover.mp3', '../sounds/hover.ogg'],
                    volume: 0.3,
                    preload: true
                }),
                click: new Howl({
                    src: ['../sounds/click.mp3', '../sounds/click.ogg'],
                    volume: 0.4,
                    preload: true
                }),
                success: new Howl({
                    src: ['../sounds/success.mp3', '../sounds/success.ogg'],
                    volume: 0.5,
                    preload: true
                }),
                error: new Howl({
                    src: ['../sounds/error.mp3', '../sounds/error.ogg'],
                    volume: 0.4,
                    preload: true
                }),
                notification: new Howl({
                    src: ['../sounds/notification.mp3', '../sounds/notification.ogg'],
                    volume: 0.3,
                    preload: true
                })
            };

            // Add sound effects to interactive elements
            this.addSoundEffects();
        } catch (error) {
            console.warn('Failed to initialize sounds:', error);
        }
    }

    // Add sound effects to elements
    addSoundEffects() {
        if (!this.sounds) return;

        // Hover sounds
        document.querySelectorAll('.login-btn, .social-btn, .nav-link').forEach(element => {
            element.addEventListener('mouseenter', () => this.playSound('hover'));
        });

        // Click sounds
        document.querySelectorAll('button, .nav-link, a').forEach(element => {
            element.addEventListener('click', () => this.playSound('click'));
        });
    }

    // Play sound effect
    playSound(soundName) {
        if (this.sounds && this.sounds[soundName]) {
            this.sounds[soundName].play();
        }
    }

    // Setup form validation
    setupValidation() {
        this.validators = {
            email: {
                rules: [
                    { test: (value) => /.+@.+\..+/.test(value), message: 'Please enter a valid email address' },
                    { test: (value) => value.length >= 5, message: 'Email must be at least 5 characters' }
                ]
            },
            password: {
                rules: [
                    { test: (value) => value.length >= 8, message: 'Password must be at least 8 characters' },
                    { test: (value) => /[A-Z]/.test(value), message: 'Password must contain an uppercase letter' },
                    { test: (value) => /[a-z]/.test(value), message: 'Password must contain a lowercase letter' },
                    { test: (value) => /\d/.test(value), message: 'Password must contain a number' }
                ]
            }
        };
    }

    // Validate email
    validateEmail() {
        const email = this.elements.emailInput?.value;
        return this.validateField('email', email);
    }

    // Validate password
    validatePassword() {
        const password = this.elements.passwordInput?.value;
        return this.validateField('password', password);
    }

    // Validate field
    validateField(fieldName, value) {
        const validator = this.validators[fieldName];
        if (!validator) return true;

        const input = this.elements[fieldName + 'Input'];
        const validationIcon = input?.parentElement.querySelector('.input-validation');

        for (const rule of validator.rules) {
            if (!rule.test(value)) {
                this.showFieldError(input, rule.message);
                if (validationIcon) {
                    validationIcon.classList.remove('show');
                }
                return false;
            }
        }

        this.clearFieldError(input);
        if (validationIcon) {
            validationIcon.classList.add('show');
        }
        return true;
    }

    // Show field error
    showFieldError(input, message) {
        if (!input) return;

        input.style.borderColor = 'var(--error-color)';
        input.style.boxShadow = '0 0 20px rgba(220, 53, 69, 0.3)';

        // Remove existing error message
        const existingError = input.parentElement.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }

        // Add new error message
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.textContent = message;
        errorElement.style.cssText = `
            color: var(--error-color);
            font-size: 0.8rem;
            margin-top: 5px;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        
        input.parentElement.appendChild(errorElement);
        setTimeout(() => errorElement.style.opacity = '1', 10);
    }

    // Clear field error
    clearFieldError(input) {
        if (!input) return;

        input.style.borderColor = '';
        input.style.boxShadow = '';

        const errorMessage = input.parentElement.querySelector('.error-message');
        if (errorMessage) {
            errorMessage.style.opacity = '0';
            setTimeout(() => errorMessage.remove(), 300);
        }
    }

    // Toggle password visibility
    togglePasswordVisibility() {
        const passwordInput = this.elements.passwordInput;
        const toggleBtn = this.elements.togglePassword;
        
        if (!passwordInput || !toggleBtn) return;

        const isPassword = passwordInput.type === 'password';
        passwordInput.type = isPassword ? 'text' : 'password';
        
        const icon = toggleBtn.querySelector('i');
        if (icon) {
            icon.className = isPassword ? 'fas fa-eye-slash' : 'fas fa-eye';
        }

        // Animate the toggle
        if (typeof gsap !== 'undefined') {
            gsap.to(toggleBtn, {
                rotation: 360,
                duration: 0.5,
                ease: 'power2.out'
            });
        }
    }
            transparent: true,
            opacity: 0.8
        });
        
        this.controller = new THREE.Mesh(geometry, material);
        this.controller.position.set(0, 0, 0);
        this.scene.add(this.controller);

        // Add controller details
        const buttonGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.05, 8);
        const buttonMaterial = new THREE.MeshPhongMaterial({ color: 0xff6b6b });
        
        for (let i = 0; i < 4; i++) {
            const button = new THREE.Mesh(buttonGeometry, buttonMaterial);
            button.position.set(
                Math.cos(i * Math.PI / 2) * 0.5,
                Math.sin(i * Math.PI / 2) * 0.3,
                0.2
            );
            this.controller.add(button);
        }
    }

    createParticles() {
        const particleCount = 100;
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

        // Rotate controller
        if (this.controller) {
            this.controller.rotation.y += 0.01;
            this.controller.rotation.x = Math.sin(Date.now() * 0.001) * 0.1;
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

    async handleLogin(event) {
        event.preventDefault();
        
        if (this.isLoading) return;
        
        // Check if locked out
        if (this.isLockedOut()) {
            this.showError('Too many failed attempts. Please wait before trying again.');
            return;
        }

        const formData = new FormData(event.target);
        const loginData = {
            username: formData.get('username').trim(),
            password: formData.get('password'),
            remember_me: formData.get('rememberMe') === 'on'
        };

        // Validate form
        if (!this.validateForm(loginData)) {
            return;
        }

        this.setLoading(true);
        
        // Play sound with fallback
        try {
            if (this.soundManager && typeof this.soundManager.playSound === 'function') {
                this.soundManager.playSound('click');
            } else if (this.utils && typeof this.utils.playSound === 'function') {
                this.utils.playSound('click');
            }
        } catch (error) {
            console.warn('Sound play failed:', error);
        }

        try {
            const response = await this.api.login(loginData);
            
            if (response.success) {
                this.loginAttempts = 0;
                
                // Play success sound with fallback
                try {
                    if (this.soundManager && typeof this.soundManager.playSound === 'function') {
                        this.soundManager.playSound('success');
                    } else if (this.utils && typeof this.utils.playSound === 'function') {
                        this.utils.playSound('success');
                    }
                } catch (error) {
                    console.warn('Sound play failed:', error);
                }
                
                // Store authentication data
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                localStorage.setItem('userData', JSON.stringify(response.data.user));
                localStorage.setItem('authToken', response.data.token);
                
                if (loginData.remember_me) {
                    localStorage.setItem('remember_me', 'true');
                }

                // Show success modal
                this.showSuccessModal(response.data);
                
                // Trigger welcome animation via advanced navbar
                if (window.advancedNavbar) {
                    window.advancedNavbar.currentUser = response.data.user;
                    window.advancedNavbar.isAuthenticated = true;
                    window.advancedNavbar.updateNavbarForAuthenticatedUser();
                    
                    // Trigger welcome animation
                    setTimeout(() => {
                        window.advancedNavbar.showWelcomeAnimation();
                    }, 1000);
                }
                
                // Dispatch login event for navbar
                const loginEvent = new CustomEvent('userLogin', {
                    detail: { user: response.data.user }
                });
                window.dispatchEvent(loginEvent);
                
                // Show welcome message after a delay
                setTimeout(() => {
                    if (window.welcomeMessage) {
                        welcomeMessage.showForReturningUser(response.data.user);
                    }
                }, 1500);
                
                // Animate XP gain
                this.animateXPGain(50);
                
                // Check for level up
                if (response.data.level_up) {
                    this.showLevelUp();
                }
                
            } else {
                this.loginAttempts++;
                this.soundManager.playSound('error');
                this.showError(response.message || 'Login failed. Please check your credentials.');
            }
            
        } catch (error) {
            this.loginAttempts++;
            this.soundManager.playSound('error');
            
            if (error.status === 401) {
                this.showError('Invalid username or password.');
            } else if (error.status === 429) {
                this.showError('Too many login attempts. Please wait before trying again.');
            } else {
                this.showError('Network error. Please try again.');
            }
        } finally {
            this.setLoading(false);
        }
    }

    validateForm(data) {
        let isValid = true;
        
        // Username validation
        if (!data.username || data.username.length < 3) {
            this.showInputError('username', 'Username must be at least 3 characters long.');
            isValid = false;
        } else {
            this.clearInputError('username');
        }
        
        // Password validation
        if (!data.password || data.password.length < 6) {
            this.showInputError('password', 'Password must be at least 6 characters long.');
            isValid = false;
        } else {
            this.clearInputError('password');
        }
        
        return isValid;
    }

    validateInput(input) {
        const value = input.value.trim();
        
        switch (input.id) {
            case 'username':
                if (value.length < 3) {
                    this.showInputError('username', 'Username must be at least 3 characters long.');
                } else {
                    this.clearInputError('username');
                }
                break;
                
            case 'password':
                if (value.length < 6) {
                    this.showInputError('password', 'Password must be at least 6 characters long.');
                } else {
                    this.clearInputError('password');
                }
                break;
        }
    }

    showInputError(inputId, message) {
        const input = document.getElementById(inputId);
        const container = input.parentElement;
        
        // Remove existing error
        const existingError = container.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        
        // Add error styling
        input.style.borderColor = 'var(--error-color)';
        
        // Add error message
        const errorElement = document.createElement('span');
        errorElement.className = 'error-message';
        errorElement.textContent = message;
        errorElement.style.color = 'var(--error-color)';
        errorElement.style.fontSize = '12px';
        errorElement.style.marginTop = '5px';
        
        container.appendChild(errorElement);
    }

    clearInputError(inputId) {
        const input = document.getElementById(inputId);
        const container = input.parentElement;
        
        // Remove error styling
        input.style.borderColor = '';
        
        // Remove error message
        const errorElement = container.querySelector('.error-message');
        if (errorElement) {
            errorElement.remove();
        }
    }

    togglePasswordVisibility() {
        const passwordInput = document.getElementById('password');
        const toggleBtn = document.getElementById('togglePassword');
        const eyeIcon = toggleBtn.querySelector('.eye-icon');
        
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            eyeIcon.textContent = '🙈';
        } else {
            passwordInput.type = 'password';
            eyeIcon.textContent = '👁️';
        }
        
        this.soundManager.playSound('button_click');
    }

    async handleForgotPassword(event) {
        event.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        
        if (!username) {
            this.showError('Please enter your username or email first.');
            return;
        }
        
        try {
            const response = await this.api.post('/auth/forgot-password', { username });
            
            if (response.success) {
                this.showSuccess('Password reset instructions sent to your email.');
                this.soundManager.playSound('success');
            } else {
                this.showError(response.message || 'Failed to send reset instructions.');
                this.soundManager.playSound('error');
            }
        } catch (error) {
            this.showError('Network error. Please try again.');
            this.soundManager.playSound('error');
        }
    }

    setLoading(loading) {
        this.isLoading = loading;
        const loginBtn = document.getElementById('loginBtn');
        const loadingOverlay = document.getElementById('loadingOverlay');
        
        if (loading) {
            loginBtn.classList.add('loading');
            loginBtn.disabled = true;
            loadingOverlay.classList.add('active');
        } else {
            loginBtn.classList.remove('loading');
            loginBtn.disabled = false;
            loadingOverlay.classList.remove('active');
        }
    }

    showSuccessModal(data) {
        const modal = document.getElementById('successModal');
        modal.classList.add('active');
        
        // Create confetti effect
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

    hideModal() {
        const modal = document.getElementById('successModal');
        modal.classList.remove('active');
        this.soundManager.playSound('button_click');
    }

    handleContinue() {
        this.hideModal();
        // Redirect to dashboard or previous page
        const redirectUrl = new URLSearchParams(window.location.search).get('redirect') || '../tournaments/tournaments.html';
        window.location.href = redirectUrl;
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

    animateXPGain(amount) {
        const xpText = document.querySelector('.xp-text');
        const xpFill = document.querySelector('.xp-fill');
        
        if (xpText && xpFill) {
            // Animate XP number
            gsap.to(xpText, {
                duration: 1,
                scale: 1.2,
                yoyo: true,
                repeat: 1,
                ease: 'power2.inOut'
            });
            
            // Animate XP bar
            gsap.to(xpFill, {
                duration: 1,
                width: '100%',
                ease: 'power2.out'
            });
        }
    }

    showLevelUp() {
        const levelUpNotification = document.getElementById('levelUpNotification');
        levelUpNotification.classList.add('show');
        
        // Play level up sound
        this.soundManager.playSound('level_up');
        
        // Hide after 3 seconds
        setTimeout(() => {
            levelUpNotification.classList.remove('show');
        }, 3000);
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
        const totalTournaments = document.getElementById('totalTournaments');
        const activePlayers = document.getElementById('activePlayers');
        const totalPrizes = document.getElementById('totalPrizes');
        
        // Animate numbers
        this.animateNumber(totalTournaments, stats.total_tournaments || 0);
        this.animateNumber(activePlayers, stats.active_players || 0);
        this.animateNumber(totalPrizes, stats.total_prizes || 0, '$');
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

    checkLoginStatus() {
        const token = localStorage.getItem('token');
        if (token) {
            // User is already logged in, redirect to dashboard
            window.location.href = '../tournaments/tournaments.html';
        }
    }

    isLockedOut() {
        if (this.loginAttempts >= this.maxLoginAttempts) {
            const lastAttempt = localStorage.getItem('last_login_attempt');
            if (lastAttempt) {
                const timeSinceLastAttempt = Date.now() - parseInt(lastAttempt);
                if (timeSinceLastAttempt < this.lockoutTime) {
                    return true;
                } else {
                    // Lockout period has passed, reset attempts
                    this.loginAttempts = 0;
                    localStorage.removeItem('last_login_attempt');
                }
            }
        }
        return false;
    }

    showError(message) {
        this.notificationManager.showError(message);
    }

    showSuccess(message) {
        this.notificationManager.showSuccess(message);
    }

    // Sound utilities
    playSound(soundName) {
        try {
            if (this.soundManager && typeof this.soundManager.playSound === 'function') {
                this.soundManager.playSound(soundName);
            } else if (this.utils && typeof this.utils.playSound === 'function') {
                this.utils.playSound(soundName);
            } else if (window.soundManager && typeof window.soundManager.playSound === 'function') {
                window.soundManager.playSound(soundName);
            } else {
                // Fallback to utils
                if (window.utils && typeof window.utils.playSound === 'function') {
                    window.utils.playSound(soundName);
                }
            }
        } catch (error) {
            console.warn('Sound play failed:', error);
        }
    }

    handleKeyboard(event) {
        // Enter key to submit form
        if (event.key === 'Enter' && !event.shiftKey) {
            const form = document.getElementById('loginForm');
            if (document.activeElement && form.contains(document.activeElement)) {
                event.preventDefault();
                form.dispatchEvent(new Event('submit'));
            }
        }
        
        // Escape key to close modal
        if (event.key === 'Escape') {
            const modal = document.getElementById('successModal');
            if (modal.classList.contains('active')) {
                this.hideModal();
            }
        }
    }
}

// Initialize login page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new LoginPage();
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
