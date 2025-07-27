// ClutchZone Utility Functions
class ClutchZoneUtils {
    constructor() {
        this.api = window.api;
        this.notifications = window.notifications;
        this.soundManager = window.soundManager || window.SoundManager;
        this.storage = {
            get: (key) => {
                try {
                    return JSON.parse(localStorage.getItem(key));
                } catch {
                    return localStorage.getItem(key);
                }
            },
            set: (key, value) => {
                if (typeof value === 'object') {
                    localStorage.setItem(key, JSON.stringify(value));
                } else {
                    localStorage.setItem(key, value);
                }
            },
            remove: (key) => localStorage.removeItem(key),
            clear: () => localStorage.clear()
        };
    }

    // Authentication helpers
    isAuthenticated() {
        return this.api && this.api.isAuthenticated();
    }

    getCurrentUser() {
        return this.api ? this.api.user : {};
    }

    redirectToLogin() {
        window.location.href = '../login/login.html';
    }

    redirectToProfile() {
        window.location.href = '../profile/profile.html';
    }

    logout() {
        if (this.api) {
            this.api.logout();
        }
        this.storage.clear();
        this.notifications?.success('Logged Out', 'You have been successfully logged out');
        setTimeout(() => {
            window.location.href = '../index.html';
        }, 1000);
    }

    // Page protection
    requireAuth() {
        if (!this.isAuthenticated()) {
            this.notifications?.warning('Authentication Required', 'Please login to access this page');
            this.redirectToLogin();
            return false;
        }
        return true;
    }

    requireAdmin() {
        if (!this.isAuthenticated()) {
            this.redirectToLogin();
            return false;
        }

        const user = this.getCurrentUser();
        if (user.role !== 'admin') {
            this.notifications?.error('Access Denied', 'You need admin privileges to access this page');
            window.location.href = '../index.html';
            return false;
        }
        return true;
    }

    // Form validation
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    validatePassword(password) {
        return {
            isValid: password.length >= 8,
            hasUpperCase: /[A-Z]/.test(password),
            hasLowerCase: /[a-z]/.test(password),
            hasNumber: /\d/.test(password),
            hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        };
    }

    validateUsername(username) {
        const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
        return usernameRegex.test(username);
    }

    // UI helpers
    showLoading(element) {
        if (element) {
            element.classList.add('loading');
            element.disabled = true;
            if (element.dataset.originalText === undefined) {
                element.dataset.originalText = element.textContent;
            }
            element.textContent = 'Loading...';
        }
    }

    hideLoading(element) {
        if (element) {
            element.classList.remove('loading');
            element.disabled = false;
            if (element.dataset.originalText) {
                element.textContent = element.dataset.originalText;
            }
        }
    }

    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }

    formatDate(date) {
        if (typeof date === 'string') {
            date = new Date(date);
        }
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    formatDateTime(date) {
        if (typeof date === 'string') {
            date = new Date(date);
        }
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    formatTimeAgo(date) {
        if (typeof date === 'string') {
            date = new Date(date);
        }
        
        const now = new Date();
        const diff = now - date;
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) {
            return `${days} day${days > 1 ? 's' : ''} ago`;
        } else if (hours > 0) {
            return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        } else if (minutes > 0) {
            return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        } else {
            return 'Just now';
        }
    }

    formatDuration(minutes) {
        if (minutes < 60) {
            return `${minutes}m`;
        } else if (minutes < 1440) {
            const hours = Math.floor(minutes / 60);
            const mins = minutes % 60;
            return `${hours}h ${mins}m`;
        } else {
            const days = Math.floor(minutes / 1440);
            const hours = Math.floor((minutes % 1440) / 60);
            return `${days}d ${hours}h`;
        }
    }

    // Game data helpers
    getGameIcon(game) {
        const icons = {
            'cs2': '🎯',
            'valorant': '🔫',
            'lol': '⚔️',
            'dota2': '🏰',
            'overwatch': '🦸',
            'apex': '🏆',
            'fortnite': '🏗️',
            'rocket_league': '🚗',
            'fifa': '⚽',
            'cod': '💥'
        };
        return icons[game] || '🎮';
    }

    getSkillLevelColor(level) {
        const colors = {
            'bronze': '#CD7F32',
            'silver': '#C0C0C0',
            'gold': '#FFD700',
            'platinum': '#E5E4E2',
            'diamond': '#B9F2FF',
            'master': '#FF6B35',
            'grandmaster': '#F7931E'
        };
        return colors[level] || '#666';
    }

    getTournamentStatusColor(status) {
        const colors = {
            'upcoming': '#3B82F6',
            'active': '#10B981',
            'completed': '#6B7280',
            'cancelled': '#EF4444'
        };
        return colors[status] || '#666';
    }

    // Animation helpers
    animateCounter(element, start, end, duration = 1000) {
        const startTime = performance.now();
        const difference = end - start;

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const current = start + (difference * this.easeOutQuart(progress));
            
            element.textContent = Math.floor(current).toLocaleString();
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }

    easeOutQuart(t) {
        return 1 - Math.pow(1 - t, 4);
    }

    // Debounce function
    debounce(func, wait) {
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

    // Throttle function
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // Copy to clipboard
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            this.notifications?.success('Copied', 'Text copied to clipboard');
            return true;
        } catch (err) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.notifications?.success('Copied', 'Text copied to clipboard');
            return true;
        }
    }

    // Generate random ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Initialize common page elements
    initializePageElements() {
        // Initialize navigation
        this.initializeNavigation();
        
        // Initialize auth state
        this.initializeAuthState();
        
        // Initialize keyboard shortcuts
        this.initializeKeyboardShortcuts();
        
        // Initialize sound controls
        this.initializeSoundControls();
    }

    initializeNavigation() {
        // Add active class to current page
        const currentPage = window.location.pathname.split('/').pop();
        const navLinks = document.querySelectorAll('.nav-links a');
        
        navLinks.forEach(link => {
            const linkPage = link.getAttribute('href').split('/').pop();
            if (linkPage === currentPage) {
                link.classList.add('active');
            }
        });
    }

    initializeAuthState() {
        const user = this.getCurrentUser();
        const loginLink = document.querySelector('a[href*="login"]');
        const registerLink = document.querySelector('a[href*="register"]');

        if (this.isAuthenticated() && user.username) {
            // Update navigation for authenticated users
            if (loginLink) {
                loginLink.textContent = user.username;
                loginLink.href = '../profile/profile.html';
            }
            if (registerLink) {
                registerLink.textContent = 'Logout';
                registerLink.href = '#';
                registerLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.logout();
                });
            }
        }
    }

    initializeKeyboardShortcuts() {
        // Global shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === '/' && !e.target.matches('input, textarea')) {
                e.preventDefault();
                const searchInput = document.querySelector('input[type="search"]');
                if (searchInput) {
                    searchInput.focus();
                }
            }

            if (e.key === 'Escape') {
                const modals = document.querySelectorAll('.modal.active');
                modals.forEach(modal => {
                    const closeButton = modal.querySelector('.close-modal');
                    if (closeButton) {
                        closeButton.click();
                    }
                });
            }
        });
    }

    initializeSoundControls() {
        if (this.sounds) {
            // Add sound control to page
            const soundControl = document.createElement('div');
            soundControl.className = 'sound-control-widget';
            soundControl.innerHTML = `
                <button class="sound-toggle" title="Toggle Sound">
                    <span class="sound-icon">🔊</span>
                </button>
            `;
            
            document.body.appendChild(soundControl);
            
            const toggleButton = soundControl.querySelector('.sound-toggle');
            toggleButton.addEventListener('click', () => {
                this.sounds.toggleMute();
                const icon = toggleButton.querySelector('.sound-icon');
                icon.textContent = this.sounds.isMuted() ? '🔇' : '🔊';
            });
        }
    }

    // Sound utilities
    playSound(soundName) {
        try {
            // Try to use the global soundManager first
            if (this.soundManager && typeof this.soundManager.playSound === 'function') {
                this.soundManager.playSound(soundName);
                return;
            }
            
            // Fallback to window.soundManager
            if (window.soundManager && typeof window.soundManager.playSound === 'function') {
                window.soundManager.playSound(soundName);
                return;
            }
            
            // Fallback to simple audio play
            this.playSimpleSound(soundName);
        } catch (error) {
            console.warn('Sound play failed:', error);
        }
    }

    playSimpleSound(soundName) {
        // Simple procedural audio generation as fallback
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            // Define sound frequencies
            const frequencies = {
                'click': 800,
                'success': 1000,
                'error': 300,
                'notification': 600,
                'hover': 400
            };
            
            oscillator.frequency.setValueAtTime(frequencies[soundName] || 500, audioContext.currentTime);
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
        } catch (error) {
            console.warn('Procedural audio failed:', error);
        }
    }

    // Initialize common page elements
    initializePageElements() {
        // Initialize navigation
        this.initializeNavigation();
        
        // Initialize auth state
        this.initializeAuthState();
        
        // Initialize keyboard shortcuts
        this.initializeKeyboardShortcuts();
        
        // Initialize sound controls
        this.initializeSoundControls();
    }

    initializeNavigation() {
        // Add active class to current page
        const currentPage = window.location.pathname.split('/').pop();
        const navLinks = document.querySelectorAll('.nav-links a');
        
        navLinks.forEach(link => {
            const linkPage = link.getAttribute('href').split('/').pop();
            if (linkPage === currentPage) {
                link.classList.add('active');
            }
        });
    }

    initializeAuthState() {
        const user = this.getCurrentUser();
        const loginLink = document.querySelector('a[href*="login"]');
        const registerLink = document.querySelector('a[href*="register"]');

        if (this.isAuthenticated() && user.username) {
            // Update navigation for authenticated users
            if (loginLink) {
                loginLink.textContent = user.username;
                loginLink.href = '../profile/profile.html';
            }
            if (registerLink) {
                registerLink.textContent = 'Logout';
                registerLink.href = '#';
                registerLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.logout();
                });
            }
        }
    }

    initializeKeyboardShortcuts() {
        // Global shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === '/' && !e.target.matches('input, textarea')) {
                e.preventDefault();
                const searchInput = document.querySelector('input[type="search"]');
                if (searchInput) {
                    searchInput.focus();
                }
            }

            if (e.key === 'Escape') {
                const modals = document.querySelectorAll('.modal.active');
                modals.forEach(modal => {
                    const closeButton = modal.querySelector('.close-modal');
                    if (closeButton) {
                        closeButton.click();
                    }
                });
            }
        });
    }

    initializeSoundControls() {
        if (this.sounds) {
            // Add sound control to page
            const soundControl = document.createElement('div');
            soundControl.className = 'sound-control-widget';
            soundControl.innerHTML = `
                <button class="sound-toggle" title="Toggle Sound">
                    <span class="sound-icon">🔊</span>
                </button>
            `;
            
            document.body.appendChild(soundControl);
            
            const toggleButton = soundControl.querySelector('.sound-toggle');
            toggleButton.addEventListener('click', () => {
                this.sounds.toggleMute();
                const icon = toggleButton.querySelector('.sound-icon');
                icon.textContent = this.sounds.isMuted() ? '🔇' : '🔊';
            });
        }
    }
}

// Create global utils instance
const utils = new ClutchZoneUtils();

// Make available globally
window.utils = utils;
window.ClutchZoneUtils = ClutchZoneUtils;

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ClutchZoneUtils, utils };
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        utils.initializePageElements();
    });
} else {
    utils.initializePageElements();
}

// Legacy compatibility - keeping old functions for existing code
const API_BASE_URL = 'https://clutchzone-api.ondigitalocean.app/api';

// Sound Manager (legacy)
class SoundManager {
    constructor() {
        this.sounds = {};
        this.isEnabled = true;
        this.loadSounds();
    }

    loadSounds() {
        const soundFiles = {
            click: '/sounds/click.mp3',
            register: '/sounds/register.mp3',
            success: '/sounds/success.mp3',
            error: '/sounds/error.mp3',
            notification: '/sounds/notification.mp3',
            countdown: '/sounds/countdown.mp3',
            victory: '/sounds/victory.mp3'
        };

        for (const [name, path] of Object.entries(soundFiles)) {
            try {
                this.sounds[name] = new Audio(path);
                this.sounds[name].preload = 'auto';
                this.sounds[name].volume = 0.3;
                
                // Handle load errors gracefully
                this.sounds[name].addEventListener('error', () => {
                    console.warn(`Sound file not found: ${path}`);
                    delete this.sounds[name];
                });
            } catch (error) {
                console.warn(`Failed to load sound: ${name}`, error);
            }
        }
    }

    play(soundName) {
        if (!this.isEnabled || !this.sounds[soundName]) {
            // Fallback to procedural audio if sound file doesn't exist
            if (window.soundManager && window.soundManager.playSound) {
                window.soundManager.playSound(soundName);
            }
            return;
        }
        
        try {
            const sound = this.sounds[soundName];
            sound.currentTime = 0;
            sound.play().catch(e => {
                console.warn('Sound play failed:', e);
                // Try procedural audio as fallback
                if (window.soundManager && window.soundManager.playSound) {
                    window.soundManager.playSound(soundName);
                }
            });
        } catch (error) {
            console.warn('Sound play error:', error);
        }
    }

    toggle() {
        this.isEnabled = !this.isEnabled;
        return this.isEnabled;
    }
}

// Initialize Sound Manager (legacy)
const soundManager = new SoundManager();

// API Helper Functions (legacy)
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = localStorage.getItem('clutchzone_token');
    
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        }
    };

    const config = { ...defaultOptions, ...options };
    if (config.body && typeof config.body === 'object') {
        config.body = JSON.stringify(config.body);
    }

    try {
        const response = await fetch(url, config);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || 'API request failed');
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Authentication helpers
function saveToken(token) {
    localStorage.setItem('clutchzone_token', token);
}

function getToken() {
    return localStorage.getItem('clutchzone_token');
}

function clearToken() {
    localStorage.removeItem('clutchzone_token');
}

function isAuthenticated() {
    return !!getToken();
}

// User data helpers
function saveUserData(userData) {
    localStorage.setItem('clutchzone_user', JSON.stringify(userData));
}

function getUserData() {
    const data = localStorage.getItem('clutchzone_user');
    return data ? JSON.parse(data) : null;
}

function clearUserData() {
    localStorage.removeItem('clutchzone_user');
}

// Notification System
class NotificationManager {
    constructor() {
        this.container = null;
        this.init();
    }

    init() {
        this.container = document.createElement('div');
        this.container.id = 'notification-container';
        this.container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            max-width: 400px;
        `;
        document.body.appendChild(this.container);
    }

    show(message, type = 'info', duration = 5000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;

        notification.style.cssText = `
            background: ${this.getTypeColor(type)};
            color: white;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 10px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            transform: translateX(100%);
            transition: transform 0.3s ease;
            backdrop-filter: blur(10px);
        `;

        this.container.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Auto remove
        if (duration > 0) {
            setTimeout(() => {
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => notification.remove(), 300);
            }, duration);
        }

        // Play sound
        soundManager.play(type === 'error' ? 'error' : 'notification');
    }

    getTypeColor(type) {
        const colors = {
            info: 'rgba(0, 255, 255, 0.9)',
            success: 'rgba(0, 255, 136, 0.9)',
            error: 'rgba(255, 68, 68, 0.9)',
            warning: 'rgba(255, 170, 0, 0.9)'
        };
        return colors[type] || colors.info;
    }
}

// Initialize Notification Manager
const notificationManager = new NotificationManager();

// XP Progress Bar Animation
function animateXPBar(currentXP, maxXP, element) {
    const percentage = (currentXP / maxXP) * 100;
    const progressBar = element.querySelector('.xp-progress');
    
    if (progressBar) {
        progressBar.style.width = `${percentage}%`;
        
        // Add glow effect
        setTimeout(() => {
            progressBar.style.boxShadow = '0 0 20px var(--primary-color)';
        }, 500);
    }
}

// Form Validation
function validateForm(formData, rules) {
    const errors = {};

    for (const [field, value] of Object.entries(formData)) {
        const rule = rules[field];
        if (!rule) continue;

        // Required validation
        if (rule.required && (!value || (typeof value === 'string' && value.trim() === '') || value === '')) {
            errors[field] = `${rule.label || field} is required`;
            continue;
        }

        // Email validation
        if (rule.type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                errors[field] = 'Please enter a valid email address';
            }
        }

        // Password validation
        if (rule.type === 'password' && value) {
            if (value.length < 8) {
                errors[field] = 'Password must be at least 8 characters long';
            } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
                errors[field] = 'Password must contain uppercase, lowercase, and number';
            }
        }

        // Username validation
        if (rule.type === 'username' && value) {
            if (value.length < 3) {
                errors[field] = 'Username must be at least 3 characters long';
            } else if (!/^[a-zA-Z0-9_]+$/.test(value)) {
                errors[field] = 'Username can only contain letters, numbers, and underscores';
            }
        }

        // Custom validation
        if (rule.validate && typeof rule.validate === 'function') {
            const customError = rule.validate(value);
            if (customError) {
                errors[field] = customError;
            }
        }
    }

    return errors;
}

// Display form errors
function displayFormErrors(errors) {
    // Clear previous errors
    document.querySelectorAll('.error-message').forEach(el => {
        el.classList.remove('show');
    });

    // Show new errors
    for (const [field, message] of Object.entries(errors)) {
        const errorElement = document.getElementById(`${field}-error`);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.add('show');
        }
    }
}

// Loading state management
function setLoadingState(element, isLoading) {
    const originalText = element.getAttribute('data-original-text') || element.textContent;
    element.setAttribute('data-original-text', originalText);

    if (isLoading) {
        element.disabled = true;
        element.innerHTML = `<span class="loading"></span> Loading...`;
    } else {
        element.disabled = false;
        element.textContent = originalText;
    }
}

// Particle System
class ParticleSystem {
    constructor() {
        this.particles = [];
        this.container = null;
        this.init();
    }

    init() {
        this.container = document.createElement('div');
        this.container.className = 'particles';
        document.body.appendChild(this.container);
        
        this.createParticles();
        this.animate();
    }

    createParticles() {
        for (let i = 0; i < 50; i++) {
            this.createParticle();
        }
    }

    createParticle() {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 6 + 's';
        particle.style.animationDuration = (Math.random() * 3 + 3) + 's';
        
        this.container.appendChild(particle);
        this.particles.push(particle);

        // Remove particle after animation
        setTimeout(() => {
            particle.remove();
            const index = this.particles.indexOf(particle);
            if (index > -1) {
                this.particles.splice(index, 1);
            }
        }, 6000);
    }

    animate() {
        setInterval(() => {
            if (this.particles.length < 50) {
                this.createParticle();
            }
        }, 200);
    }
}

// Initialize Particle System
const particleSystem = new ParticleSystem();

// Three.js Scene Manager
class SceneManager {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.trophy = null;
        this.init();
    }

    init() {
        // Create scene
        this.scene = new THREE.Scene();
        
        // Create camera
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.z = 5;

        // Create renderer
        this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x000000, 0);
        
        // Add canvas to DOM
        const canvas = this.renderer.domElement;
        canvas.id = 'three-canvas';
        document.body.appendChild(canvas);

        // Add lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0x00ffff, 1);
        directionalLight.position.set(5, 5, 5);
        this.scene.add(directionalLight);

        // Create floating trophy
        this.createTrophy();

        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());

        // Start animation loop
        this.animate();
    }

    createTrophy() {
        // Create a simple trophy geometry
        const geometry = new THREE.ConeGeometry(0.3, 0.8, 8);
        const material = new THREE.MeshPhongMaterial({ 
            color: 0xffd700,
            shininess: 100,
            transparent: true,
            opacity: 0.8
        });
        
        this.trophy = new THREE.Mesh(geometry, material);
        this.trophy.position.set(2, 0, 0);
        this.scene.add(this.trophy);

        // Add base
        const baseGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.1, 16);
        const baseMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.set(2, -0.5, 0);
        this.scene.add(base);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        // Rotate trophy
        if (this.trophy) {
            this.trophy.rotation.y += 0.01;
            this.trophy.position.y = Math.sin(Date.now() * 0.001) * 0.1;
        }

        this.renderer.render(this.scene, this.camera);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

// Utility Functions
function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

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

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Three.js scene if Three.js is available
    if (typeof THREE !== 'undefined') {
        new SceneManager();
    }

    // Add sound toggle button
    const soundToggle = document.createElement('button');
    soundToggle.innerHTML = '🔊';
    soundToggle.className = 'sound-toggle';
    soundToggle.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: rgba(0, 255, 255, 0.2);
        border: 1px solid var(--primary-color);
        color: var(--primary-color);
        font-size: 20px;
        cursor: pointer;
        z-index: 1000;
        transition: all 0.3s ease;
    `;
    
    soundToggle.addEventListener('click', () => {
        const isEnabled = soundManager.toggle();
        soundToggle.innerHTML = isEnabled ? '🔊' : '🔇';
        soundManager.play('click');
    });
    
    document.body.appendChild(soundToggle);

    // Add click sound to all buttons
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn') || e.target.tagName === 'BUTTON') {
            soundManager.play('click');
        }
    });
});

// Export for use in other modules
window.ClutchZone = {
    api: apiRequest,
    auth: {
        saveToken,
        getToken,
        clearToken,
        isAuthenticated,
        saveUserData,
        getUserData,
        clearUserData
    },
    sound: soundManager,
    notifications: notificationManager,
    validation: {
        validateForm,
        displayFormErrors
    },
    ui: {
        setLoadingState,
        animateXPBar
    },
    utils: {
        formatDate,
        formatCurrency,
        debounce,
        throttle
    }
};
