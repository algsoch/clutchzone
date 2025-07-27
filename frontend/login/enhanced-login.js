// Enhanced Login System with Advanced Animations
class EnhancedLoginSystem {
    constructor() {
        this.initializeSystem();
        this.setupEventListeners();
        this.setupTypingAnimations();
        this.setupFormValidation();
        this.setupLoadingSystem();
        this.setupNotificationSystem();
        this.startLiveStats();
    }

    initializeSystem() {
        console.log('🎮 ClutchZone Enhanced Login System Initialized');
        
        // Add initial classes for animations
        this.addAnimationClasses();
        
        // Setup connection status
        this.updateConnectionStatus(true);
        
        // Initialize canvas effects
        this.initializeCanvasEffects();
    }

    addAnimationClasses() {
        // Add typing class on input events
        const inputs = document.querySelectorAll('.form-input');
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                input.classList.add('typing');
                clearTimeout(input.typingTimeout);
                input.typingTimeout = setTimeout(() => {
                    input.classList.remove('typing');
                }, 200);
            });
        });
    }

    setupEventListeners() {
        // Form submission
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Password toggle
        const togglePassword = document.getElementById('togglePassword');
        if (togglePassword) {
            togglePassword.addEventListener('click', () => this.togglePasswordVisibility());
        }

        // Social login buttons
        const socialButtons = document.querySelectorAll('.social-btn');
        socialButtons.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleSocialLogin(e));
        });

        // Forgot password
        const forgotPassword = document.getElementById('forgotPassword');
        if (forgotPassword) {
            forgotPassword.addEventListener('click', (e) => this.handleForgotPassword(e));
        }

        // Window events
        window.addEventListener('load', () => this.onPageLoad());
        window.addEventListener('beforeunload', () => this.onPageUnload());
    }

    setupTypingAnimations() {
        const inputs = document.querySelectorAll('.form-input');
        
        inputs.forEach((input, index) => {
            // Focus animations
            input.addEventListener('focus', () => {
                input.closest('.form-group').classList.add('focused');
                this.showInputGlow(input);
            });

            // Blur animations
            input.addEventListener('blur', () => {
                input.closest('.form-group').classList.remove('focused');
                this.hideInputGlow(input);
                this.validateInput(input);
            });

            // Real-time typing effects
            input.addEventListener('input', (e) => {
                this.handleTyping(e.target);
                this.realTimeValidation(e.target);
            });

            // Enhanced keyboard effects
            input.addEventListener('keydown', (e) => {
                this.handleKeyEffects(e);
            });
        });
    }

    handleTyping(input) {
        // Add typing effect
        input.classList.add('typing');
        
        // Create typing particles
        this.createTypingParticles(input);
        
        // Remove typing class after delay
        clearTimeout(input.typingTimeout);
        input.typingTimeout = setTimeout(() => {
            input.classList.remove('typing');
        }, 300);
    }

    createTypingParticles(input) {
        const rect = input.getBoundingClientRect();
        const particle = document.createElement('div');
        particle.className = 'typing-particle';
        particle.style.cssText = `
            position: fixed;
            width: 4px;
            height: 4px;
            background: var(--primary-color);
            border-radius: 50%;
            pointer-events: none;
            z-index: 9999;
            left: ${rect.right - 20}px;
            top: ${rect.top + rect.height / 2}px;
            animation: particleFloat 1s ease-out forwards;
        `;
        
        document.body.appendChild(particle);
        
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, 1000);
    }

    showInputGlow(input) {
        const glow = input.nextElementSibling;
        if (glow && glow.classList.contains('input-glow')) {
            glow.style.opacity = '1';
        }
    }

    hideInputGlow(input) {
        const glow = input.nextElementSibling;
        if (glow && glow.classList.contains('input-glow')) {
            glow.style.opacity = '0';
        }
    }

    setupFormValidation() {
        // Real-time validation setup
        this.validationRules = {
            username: {
                required: true,
                minLength: 3,
                pattern: /^[a-zA-Z0-9._@-]+$/
            },
            password: {
                required: true,
                minLength: 6
            }
        };
    }

    realTimeValidation(input) {
        const fieldName = input.name;
        const value = input.value;
        const rules = this.validationRules[fieldName];
        
        if (!rules) return;
        
        let isValid = true;
        let message = '';
        
        // Check required
        if (rules.required && !value.trim()) {
            isValid = false;
            message = 'This field is required';
        }
        
        // Check minimum length
        if (isValid && rules.minLength && value.length < rules.minLength) {
            isValid = false;
            message = `Minimum ${rules.minLength} characters required`;
        }
        
        // Check pattern
        if (isValid && rules.pattern && !rules.pattern.test(value)) {
            isValid = false;
            message = 'Invalid format';
        }
        
        this.updateValidationUI(input, isValid, message);
    }

    updateValidationUI(input, isValid, message) {
        const validation = input.parentNode.querySelector('.input-validation');
        const group = input.closest('.form-group');
        
        if (isValid && input.value.trim()) {
            group.classList.add('valid');
            group.classList.remove('invalid');
            if (validation) {
                validation.classList.add('show');
                validation.innerHTML = '<i class="fas fa-check"></i>';
            }
        } else if (!isValid && input.value.trim()) {
            group.classList.add('invalid');
            group.classList.remove('valid');
            if (validation) {
                validation.classList.remove('show');
            }
            this.showTooltip(input, message);
        } else {
            group.classList.remove('valid', 'invalid');
            if (validation) {
                validation.classList.remove('show');
            }
        }
    }

    validateInput(input) {
        const fieldName = input.name;
        const value = input.value;
        const rules = this.validationRules[fieldName];
        
        if (!rules) return true;
        
        // Check all validation rules
        if (rules.required && !value.trim()) return false;
        if (rules.minLength && value.length < rules.minLength) return false;
        if (rules.pattern && !rules.pattern.test(value)) return false;
        
        return true;
    }

    handleKeyEffects(e) {
        // Add special effects for certain keys
        if (e.key === 'Enter') {
            this.createEnterEffect(e.target);
        } else if (e.key === 'Backspace') {
            this.createBackspaceEffect(e.target);
        }
    }

    createEnterEffect(input) {
        const effect = document.createElement('div');
        effect.innerHTML = '⚡';
        effect.style.cssText = `
            position: absolute;
            right: 10px;
            top: 50%;
            transform: translateY(-50%);
            color: var(--primary-color);
            font-size: 1.2rem;
            animation: enterEffect 0.5s ease-out forwards;
            pointer-events: none;
        `;
        
        input.parentNode.appendChild(effect);
        
        setTimeout(() => {
            if (effect.parentNode) {
                effect.parentNode.removeChild(effect);
            }
        }, 500);
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const loginData = {
            username: formData.get('username'),
            password: formData.get('password'),
            rememberMe: formData.get('rememberMe') === 'on'
        };
        
        // Validate form
        if (!this.validateForm(e.target)) {
            this.showNotification('Please fill in all required fields correctly', 'error');
            this.animateFormError();
            return;
        }
        
        // Start loading animation
        this.startLoadingAnimation();
        
        try {
            // Simulate API call with proper timing
            await this.simulateLogin(loginData);
            
            // Success animation
            this.showSuccessAnimation();
            
            // Show success notification
            this.showNotification('Login successful! Welcome back, Champion! 🎮', 'success');
            
            // Redirect after delay
            setTimeout(() => {
                window.location.href = '../index.html';
            }, 2000);
            
        } catch (error) {
            // Error animation
            this.showErrorAnimation();
            this.showNotification(error.message || 'Login failed. Please try again.', 'error');
        }
    }

    validateForm(form) {
        const inputs = form.querySelectorAll('.form-input[required]');
        let isValid = true;
        
        inputs.forEach(input => {
            if (!this.validateInput(input)) {
                isValid = false;
                input.classList.add('error');
                setTimeout(() => input.classList.remove('error'), 2000);
            }
        });
        
        return isValid;
    }

    async simulateLogin(loginData) {
        // Simulate different stages of login
        await this.updateLoadingProgress('Verifying credentials...', 30);
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        await this.updateLoadingProgress('Authenticating user...', 60);
        await new Promise(resolve => setTimeout(resolve, 800));
        
        await this.updateLoadingProgress('Loading profile...', 90);
        await new Promise(resolve => setTimeout(resolve, 600));
        
        await this.updateLoadingProgress('Preparing arena...', 100);
        await new Promise(resolve => setTimeout(resolve, 400));
        
        // Simulate success/failure based on credentials
        if (loginData.username === 'demo' && loginData.password === 'demo123') {
            return { success: true, user: { username: loginData.username, level: 1 } };
        } else {
            throw new Error('Invalid credentials. Try demo/demo123');
        }
    }

    startLoadingAnimation() {
        const submitBtn = document.querySelector('.submit-btn');
        const loadingOverlay = document.getElementById('loadingOverlay');
        
        if (submitBtn) {
            submitBtn.classList.add('loading');
            submitBtn.disabled = true;
        }
        
        if (loadingOverlay) {
            loadingOverlay.classList.add('active');
        }
        
        this.resetLoadingProgress();
    }

    async updateLoadingProgress(message, percentage) {
        const loadingMessage = document.getElementById('loadingMessage');
        const progressFill = document.getElementById('progressFill');
        
        if (loadingMessage) {
            loadingMessage.textContent = message;
        }
        
        if (progressFill) {
            progressFill.style.width = `${percentage}%`;
        }
        
        return new Promise(resolve => {
            setTimeout(resolve, 200);
        });
    }

    resetLoadingProgress() {
        const progressFill = document.getElementById('progressFill');
        if (progressFill) {
            progressFill.style.width = '0%';
        }
    }

    showSuccessAnimation() {
        const submitBtn = document.querySelector('.submit-btn');
        const loadingOverlay = document.getElementById('loadingOverlay');
        
        if (submitBtn) {
            submitBtn.classList.remove('loading');
            submitBtn.classList.add('success');
            submitBtn.innerHTML = '<i class="fas fa-check"></i> Success!';
        }
        
        if (loadingOverlay) {
            loadingOverlay.classList.remove('active');
        }
        
        this.createSuccessParticles();
    }

    showErrorAnimation() {
        const submitBtn = document.querySelector('.submit-btn');
        const loadingOverlay = document.getElementById('loadingOverlay');
        
        if (submitBtn) {
            submitBtn.classList.remove('loading');
            submitBtn.classList.add('error');
            submitBtn.disabled = false;
            
            setTimeout(() => {
                submitBtn.classList.remove('error');
                submitBtn.innerHTML = '<span class="btn-content"><i class="fas fa-sign-in-alt btn-icon"></i><span class="btn-text">Access Arena</span></span>';
            }, 2000);
        }
        
        if (loadingOverlay) {
            loadingOverlay.classList.remove('active');
        }
    }

    animateFormError() {
        const formContainer = document.querySelector('.form-container');
        if (formContainer) {
            formContainer.style.animation = 'errorShake 0.6s ease-out';
            setTimeout(() => {
                formContainer.style.animation = '';
            }, 600);
        }
    }

    createSuccessParticles() {
        for (let i = 0; i < 20; i++) {
            setTimeout(() => {
                this.createParticle('success');
            }, i * 100);
        }
    }

    createParticle(type) {
        const particle = document.createElement('div');
        const symbols = type === 'success' ? ['🎉', '⭐', '🏆', '✨'] : ['💥', '⚡', '🔥'];
        const symbol = symbols[Math.floor(Math.random() * symbols.length)];
        
        particle.innerHTML = symbol;
        particle.style.cssText = `
            position: fixed;
            font-size: 1.5rem;
            pointer-events: none;
            z-index: 10000;
            left: ${Math.random() * window.innerWidth}px;
            top: ${window.innerHeight}px;
            animation: particleExplode 3s ease-out forwards;
        `;
        
        document.body.appendChild(particle);
        
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, 3000);
    }

    setupLoadingSystem() {
        // Add loading progress steps animation
        const steps = document.querySelectorAll('.progress-steps .step');
        steps.forEach((step, index) => {
            step.style.animationDelay = `${index * 0.5}s`;
        });
    }

    setupNotificationSystem() {
        // Create notification container if it doesn't exist
        if (!document.getElementById('notificationContainer')) {
            const container = document.createElement('div');
            container.id = 'notificationContainer';
            container.className = 'notification-container';
            document.body.appendChild(container);
        }
    }

    showNotification(message, type = 'info') {
        const container = document.getElementById('notificationContainer');
        if (!container) return;
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        const icon = this.getNotificationIcon(type);
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <i class="${icon}"></i>
                <span>${message}</span>
            </div>
        `;
        
        container.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'notificationSlideOut 0.5s ease-out forwards';
                setTimeout(() => {
                    notification.parentNode.removeChild(notification);
                }, 500);
            }
        }, 5000);
    }

    getNotificationIcon(type) {
        switch (type) {
            case 'success': return 'fas fa-check-circle';
            case 'error': return 'fas fa-exclamation-circle';
            case 'warning': return 'fas fa-exclamation-triangle';
            default: return 'fas fa-info-circle';
        }
    }

    togglePasswordVisibility() {
        const passwordInput = document.getElementById('password');
        const toggleBtn = document.getElementById('togglePassword');
        
        if (passwordInput && toggleBtn) {
            const isPassword = passwordInput.type === 'password';
            passwordInput.type = isPassword ? 'text' : 'password';
            toggleBtn.innerHTML = isPassword ? '<i class="fas fa-eye-slash"></i>' : '<i class="fas fa-eye"></i>';
            
            // Add toggle animation
            toggleBtn.style.animation = 'toggleBounce 0.3s ease-out';
            setTimeout(() => {
                toggleBtn.style.animation = '';
            }, 300);
        }
    }

    handleSocialLogin(e) {
        const platform = e.currentTarget.classList.contains('discord') ? 'Discord' :
                        e.currentTarget.classList.contains('steam') ? 'Steam' : 'Google';
        
        // Add click animation
        e.currentTarget.style.animation = 'socialBounce 0.3s ease-out';
        setTimeout(() => {
            e.currentTarget.style.animation = '';
        }, 300);
        
        this.showNotification(`${platform} login coming soon! 🚀`, 'info');
    }

    handleForgotPassword(e) {
        e.preventDefault();
        this.showNotification('Password reset email would be sent! 📧', 'info');
    }

    startLiveStats() {
        // Animate live stats with realistic changes
        this.updateLiveStats();
        setInterval(() => this.updateLiveStats(), 5000);
    }

    updateLiveStats() {
        const playersCount = document.getElementById('livePlayersCount');
        const tournamentsCount = document.getElementById('liveTournamentsCount');
        const prizePool = document.getElementById('totalPrizePool');
        
        if (playersCount) {
            const current = parseInt(playersCount.textContent.replace(/,/g, ''));
            const change = Math.floor(Math.random() * 20) - 10;
            const newCount = Math.max(5000, current + change);
            this.animateNumber(playersCount, newCount);
        }
        
        if (tournamentsCount) {
            const current = parseInt(tournamentsCount.textContent);
            const change = Math.random() > 0.7 ? (Math.random() > 0.5 ? 1 : -1) : 0;
            const newCount = Math.max(8, current + change);
            this.animateNumber(tournamentsCount, newCount);
        }
        
        if (prizePool) {
            const current = parseInt(prizePool.textContent.replace(/[₹,]/g, ''));
            const change = Math.floor(Math.random() * 1000) - 500;
            const newAmount = Math.max(50000, current + change);
            this.animateNumber(prizePool, newAmount, '₹');
        }
    }

    animateNumber(element, targetValue, prefix = '') {
        const currentValue = parseInt(element.textContent.replace(/[^\d]/g, ''));
        const increment = (targetValue - currentValue) / 20;
        let current = currentValue;
        
        const animation = setInterval(() => {
            current += increment;
            if ((increment > 0 && current >= targetValue) || (increment < 0 && current <= targetValue)) {
                current = targetValue;
                clearInterval(animation);
            }
            
            const formatted = prefix + Math.floor(current).toLocaleString();
            element.textContent = formatted;
            
            // Add pulse effect on change
            element.style.animation = 'numberPulse 0.3s ease-out';
            setTimeout(() => {
                element.style.animation = '';
            }, 300);
        }, 50);
    }

    updateConnectionStatus(isConnected) {
        const statusElement = document.getElementById('connectionStatus');
        const statusText = statusElement?.querySelector('.status-text');
        
        if (statusElement && statusText) {
            if (isConnected) {
                statusElement.classList.remove('disconnected');
                statusText.textContent = 'Connected';
            } else {
                statusElement.classList.add('disconnected');
                statusText.textContent = 'Disconnected';
            }
        }
    }

    initializeCanvasEffects() {
        // Initialize welcome canvas
        const welcomeCanvas = document.getElementById('welcomeCanvas');
        if (welcomeCanvas) {
            this.setupCanvasEffect(welcomeCanvas, 'welcome');
        }
        
        // Initialize login canvas
        const loginCanvas = document.getElementById('loginCanvas');
        if (loginCanvas) {
            this.setupCanvasEffect(loginCanvas, 'login');
        }
    }

    setupCanvasEffect(canvas, type) {
        const ctx = canvas.getContext('2d');
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        
        const particles = [];
        const particleCount = type === 'welcome' ? 50 : 30;
        
        // Create particles
        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 2 + 1,
                opacity: Math.random() * 0.5 + 0.2
            });
        }
        
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            particles.forEach(particle => {
                particle.x += particle.vx;
                particle.y += particle.vy;
                
                // Wrap around edges
                if (particle.x < 0) particle.x = canvas.width;
                if (particle.x > canvas.width) particle.x = 0;
                if (particle.y < 0) particle.y = canvas.height;
                if (particle.y > canvas.height) particle.y = 0;
                
                // Draw particle
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(0, 255, 136, ${particle.opacity})`;
                ctx.fill();
            });
            
            requestAnimationFrame(animate);
        };
        
        animate();
        
        // Handle resize
        window.addEventListener('resize', () => {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        });
    }

    onPageLoad() {
        // Add page load animations
        document.body.classList.add('loaded');
        
        // Initialize XP bar animation
        const xpFill = document.querySelector('.xp-fill');
        if (xpFill) {
            setTimeout(() => {
                xpFill.style.width = '50%';
            }, 2000);
        }
    }

    onPageUnload() {
        // Cleanup
        console.log('🎮 Enhanced Login System Cleanup');
    }
}

// Additional CSS for particle animations
const additionalStyles = `
    @keyframes particleFloat {
        0% {
            transform: translateY(0) translateX(0) scale(1);
            opacity: 1;
        }
        100% {
            transform: translateY(-20px) translateX(10px) scale(0);
            opacity: 0;
        }
    }

    @keyframes enterEffect {
        0% {
            transform: translateY(-50%) scale(0) rotate(0deg);
            opacity: 1;
        }
        50% {
            transform: translateY(-50%) scale(1.2) rotate(180deg);
            opacity: 0.8;
        }
        100% {
            transform: translateY(-50%) scale(0) rotate(360deg);
            opacity: 0;
        }
    }

    @keyframes particleExplode {
        0% {
            transform: translateY(0) scale(1) rotate(0deg);
            opacity: 1;
        }
        50% {
            transform: translateY(-50vh) scale(1.2) rotate(180deg);
            opacity: 0.8;
        }
        100% {
            transform: translateY(-100vh) scale(0) rotate(360deg);
            opacity: 0;
        }
    }

    @keyframes notificationSlideOut {
        0% {
            opacity: 1;
            transform: translateX(0) rotateY(0deg);
        }
        100% {
            opacity: 0;
            transform: translateX(100%) rotateY(15deg);
        }
    }

    @keyframes toggleBounce {
        0%, 100% { transform: translateY(-50%) scale(1); }
        50% { transform: translateY(-50%) scale(1.2); }
    }

    @keyframes socialBounce {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
    }

    @keyframes numberPulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); color: var(--primary-color); }
    }

    .form-input.error {
        border-color: var(--error-color);
        animation: inputShake 0.5s ease-out;
    }

    @keyframes inputShake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }

    .body.loaded {
        animation: fadeIn 1s ease-out;
    }

    @keyframes fadeIn {
        0% { opacity: 0; }
        100% { opacity: 1; }
    }
`;

// Inject additional styles
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);

// Initialize the enhanced login system when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new EnhancedLoginSystem();
    });
} else {
    new EnhancedLoginSystem();
}
