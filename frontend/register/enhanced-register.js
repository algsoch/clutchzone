/**
 * ClutchZone Register - Ultra-Advanced Registration Animation System
 * Consistent with Login Page Design & Functionality
 */

class EnhancedRegisterSystem {
    constructor() {
        this.initializeSystem();
        this.setupEventListeners();
        this.initializeAnimations();
        this.setupXPPreview();
        this.initializeTrophyDisplay();
        this.setupPasswordStrength();
        this.setupFormValidation();
        this.setupRealTimeEffects();
        this.initializeCanvasBackground();
        this.initializeHUDSystem();
        this.initializeWeaponArsenal();
        this.initializeChessAnimationBox();
        this.startSystemSequence();
    }

    initializeSystem() {
        console.log('🚀 ClutchZone Register System - Ultra-Advanced Mode Activated');
        
        // Gaming Variables
        this.config = {
            xpGainRate: 10,
            maxPreviewXP: 100,
            animationSpeed: 1000,
            glowIntensity: 0.8,
            particleCount: 100,
            soundEnabled: true,
            hapticFeedback: true
        };

        // Animation States
        this.animationStates = {
            previewXP: 0,
            trophyRotation: 0,
            particleSystem: null,
            typingEffect: false,
            validationActive: false,
            systemReady: false
        };

        // Form Elements
        this.elements = {
            form: document.getElementById('registerForm'),
            previewXP: document.getElementById('preview-xp'),
            modalXP: document.getElementById('modal-xp'),
            strengthProgress: document.getElementById('strength-progress'),
            strengthText: document.getElementById('strength-text'),
            trophyCanvas: document.getElementById('trophy-canvas'),
            successModal: document.getElementById('successModal'),
            inputs: {}
        };

        // Cache all input elements
        const inputIds = ['username', 'email', 'password', 'confirmPassword', 'favoriteGame', 'terms', 'notifications'];
        inputIds.forEach(id => {
            this.elements.inputs[id] = document.getElementById(id);
        });

        // Password Strength Levels
        this.strengthLevels = {
            weak: { score: 1, text: 'Weak', class: 'weak' },
            fair: { score: 2, text: 'Fair', class: 'fair' },
            good: { score: 3, text: 'Good', class: 'good' },
            strong: { score: 4, text: 'Strong', class: 'strong' }
        };

        // Validation Rules
        this.validationRules = {
            username: {
                minLength: 3,
                maxLength: 20,
                pattern: /^[a-zA-Z0-9_-]+$/,
                message: 'Username must be 3-20 characters (letters, numbers, _, - only)'
            },
            email: {
                pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Please enter a valid email address'
            },
            password: {
                minLength: 8,
                pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                message: 'Password must contain: 8+ chars, uppercase, lowercase, number, special char'
            }
        };
    }

    setupEventListeners() {
        // Form submission with advanced animation
        this.elements.form.addEventListener('submit', (e) => this.handleFormSubmit(e));

        // Real-time input validation and effects
        Object.keys(this.elements.inputs).forEach(inputName => {
            const input = this.elements.inputs[inputName];
            if (!input) return;

            if (input.type === 'checkbox') {
                input.addEventListener('change', (e) => this.handleCheckboxChange(e));
            } else {
                input.addEventListener('input', (e) => this.handleInputChange(e));
                input.addEventListener('focus', (e) => this.handleInputFocus(e));
                input.addEventListener('blur', (e) => this.handleInputBlur(e));
            }
        });

        // Special password validation
        if (this.elements.inputs.password) {
            this.elements.inputs.password.addEventListener('input', (e) => this.updatePasswordStrength(e.target.value));
        }

        // Confirm password validation
        if (this.elements.inputs.confirmPassword) {
            this.elements.inputs.confirmPassword.addEventListener('input', (e) => this.validatePasswordMatch());
        }

        // Window events
        window.addEventListener('resize', () => this.handleResize());
        window.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));

        // Advanced hover effects
        document.querySelectorAll('.form-control').forEach(input => {
            input.addEventListener('mouseenter', (e) => this.createHoverEffect(e.target));
            input.addEventListener('mouseleave', (e) => this.removeHoverEffect(e.target));
        });
    }

    initializeAnimations() {
        // Initialize chess animations
        this.initChessAnimations();
        
        // Initialize form enhancements  
        this.initFormEnhancements();
        
        // Initialize XP system enhancements
        this.initXPSystemEnhancements();
        
        // Animate form groups with staggered entrance
        const formGroups = document.querySelectorAll('.form-group, .ultra-form-group');
        formGroups.forEach((group, index) => {
            setTimeout(() => {
                group.style.animation = `formGroupSlideIn 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards`;
                this.createSparkleEffect(group);
            }, index * 150);
        });

        // Animate title with typing effect
        this.animateTitle();

        // Start XP preview animation
        this.startXPPreviewAnimation();

        // Initialize card entrance
        this.animateCardEntrance();
        
        console.log('✨ All ultra-advanced animations initialized successfully');
    }

    initChessAnimations() {
        // Initialize chess piece movements and animations
        this.createChessParticles();
        this.animateChessPieces();
        this.createChessMoveTrails();
        console.log('♚ Chess animations activated');
    }

    createChessParticles() {
        const chessContainer = document.querySelector('.chess-game-animation');
        if (!chessContainer) return;

        // Add dynamic chess particles
        const chessSymbols = ['♛', '♚', '♜', '♝', '♞', '♟'];
        for (let i = 0; i < 8; i++) {
            const particle = document.createElement('div');
            particle.innerHTML = chessSymbols[Math.floor(Math.random() * chessSymbols.length)];
            particle.className = 'chess-particle';
            particle.style.cssText = `
                position: absolute;
                font-size: ${1.2 + Math.random() * 0.8}rem;
                color: rgba(0, 255, 136, ${0.4 + Math.random() * 0.4});
                pointer-events: none;
                animation: chessParticleFloat ${6 + Math.random() * 4}s ease-in-out infinite;
                animation-delay: ${Math.random() * 2}s;
                top: ${Math.random() * 80}%;
                left: ${Math.random() * 80}%;
                z-index: 1;
            `;
            chessContainer.appendChild(particle);
        }
    }

    animateChessPieces() {
        // Enhanced chess piece movement logic
        const pieces = document.querySelectorAll('.animated-queen, .animated-king, .animated-pawn, .animated-rook, .animated-bishop, .animated-knight');
        pieces.forEach((piece, index) => {
            piece.addEventListener('animationiteration', () => {
                // Add sparkle effect on animation cycle
                this.createAdvancedSparkleEffect(piece);
            });
            
            // Add hover effects
            piece.addEventListener('mouseenter', () => {
                piece.style.transform += ' scale(1.2)';
                piece.style.filter = 'brightness(1.5) drop-shadow(0 0 20px currentColor)';
            });
            
            piece.addEventListener('mouseleave', () => {
                piece.style.transform = piece.style.transform.replace(' scale(1.2)', '');
                piece.style.filter = piece.style.filter.replace(' brightness(1.5)', '');
            });
        });
    }

    createAdvancedSparkleEffect(element) {
        const sparkles = ['✨', '⭐', '💫', '🌟'];
        const sparkle = document.createElement('div');
        sparkle.innerHTML = sparkles[Math.floor(Math.random() * sparkles.length)];
        sparkle.style.cssText = `
            position: absolute;
            top: ${Math.random() * 100}%;
            left: ${Math.random() * 100}%;
            font-size: 1rem;
            color: var(--primary-color);
            pointer-events: none;
            animation: sparkleEffect 1.5s ease-out forwards;
            z-index: 1000;
        `;
        element.appendChild(sparkle);
        
        setTimeout(() => sparkle.remove(), 1500);
    }

    createChessMoveTrails() {
        // Create dynamic move trails
        const trailContainer = document.querySelector('.chess-game-animation');
        if (!trailContainer) return;

        for (let i = 0; i < 6; i++) {
            const trail = document.createElement('div');
            trail.className = 'chess-move-trail';
            trail.style.cssText = `
                position: absolute;
                width: 2px;
                height: 40px;
                background: linear-gradient(45deg, var(--primary-color), transparent);
                animation: chessMoveTrail ${2 + Math.random() * 2}s ease-in-out infinite;
                animation-delay: ${Math.random() * 3}s;
                top: ${Math.random() * 80}%;
                left: ${Math.random() * 80}%;
                opacity: 0.6;
            `;
            trailContainer.appendChild(trail);
        }
    }

    initFormEnhancements() {
        // Enhanced form field interactions
        const formInputs = document.querySelectorAll('.ultra-form-input, input[type="text"], input[type="email"], input[type="password"]');
        formInputs.forEach(input => {
            this.enhanceFormField(input);
        });
        console.log('📝 Form enhancements activated');
    }

    enhanceFormField(input) {
        // Add wrapper if not exists
        if (!input.parentNode.querySelector('.field-energy-border')) {
            const energyBorder = document.createElement('div');
            energyBorder.className = 'field-energy-border';
            input.parentNode.style.position = 'relative';
            input.parentNode.appendChild(energyBorder);
        }

        // Enhanced focus effects
        input.addEventListener('focus', () => {
            this.createFocusParticles(input);
            input.parentNode.classList.add('ultra-focused');
            input.style.animation = 'inputFocusGlow 2s ease-in-out infinite';
        });

        input.addEventListener('blur', () => {
            input.parentNode.classList.remove('ultra-focused');
            input.style.animation = '';
        });

        // Real-time typing effects
        input.addEventListener('input', () => {
            this.createTypingParticles(input);
            this.validateFieldRealtime(input);
        });
    }

    createFocusParticles(input) {
        for (let i = 0; i < 5; i++) {
            const particle = document.createElement('div');
            particle.innerHTML = '✦';
            particle.style.cssText = `
                position: absolute;
                top: ${Math.random() * 100}%;
                left: ${Math.random() * 100}%;
                color: var(--primary-color);
                font-size: 0.8rem;
                pointer-events: none;
                animation: focusParticle 2s ease-out forwards;
                z-index: 1000;
            `;
            input.parentNode.appendChild(particle);
            
            setTimeout(() => particle.remove(), 2000);
        }
    }

    createTypingParticles(input) {
        const particle = document.createElement('div');
        particle.innerHTML = '•';
        particle.style.cssText = `
            position: absolute;
            top: 50%;
            right: 2rem;
            color: var(--accent-color);
            font-size: 1rem;
            pointer-events: none;
            animation: typingParticle 0.8s ease-out forwards;
            z-index: 1000;
        `;
        input.parentNode.appendChild(particle);
        
        setTimeout(() => particle.remove(), 800);
    }

    validateFieldRealtime(input) {
        // Real-time field validation with visual feedback
        let isValid = false;
        
        switch(input.type) {
            case 'email':
                isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value);
                break;
            case 'password':
                isValid = input.value.length >= 6;
                break;
            default:
                isValid = input.value.length > 0;
        }
        
        // Apply validation styling
        if (isValid) {
            input.style.borderColor = 'var(--primary-color)';
            input.style.boxShadow = '0 0 0 2px rgba(0, 255, 136, 0.3)';
            this.createValidationSuccess(input);
        } else if (input.value.length > 0) {
            input.style.borderColor = '#ff4757';
            input.style.boxShadow = '0 0 0 2px rgba(255, 71, 87, 0.3)';
        } else {
            input.style.borderColor = 'var(--border-color)';
            input.style.boxShadow = '';
        }
    }

    createValidationSuccess(input) {
        const checkmark = document.createElement('div');
        checkmark.innerHTML = '✓';
        checkmark.style.cssText = `
            position: absolute;
            top: 50%;
            right: 0.5rem;
            color: var(--primary-color);
            font-size: 1.2rem;
            font-weight: bold;
            pointer-events: none;
            animation: validationSuccess 1s ease-out forwards;
            z-index: 1000;
        `;
        input.parentNode.appendChild(checkmark);
        
        setTimeout(() => checkmark.remove(), 1000);
    }

    initXPSystemEnhancements() {
        // Enhanced XP system with advanced animations
        const xpSystem = document.querySelector('.ultra-xp-system');
        if (!xpSystem) return;

        this.createXPParticles();
        this.animateXPProgress();
        this.initXPBoostEffects();
        this.animateXPStars();
        console.log('⭐ Enhanced XP System activated');
    }

    createXPParticles() {
        const xpSystem = document.querySelector('.ultra-xp-system');
        if (!xpSystem) return;

        // Add floating XP particles
        for (let i = 0; i < 12; i++) {
            const particle = document.createElement('div');
            particle.innerHTML = ['✦', '⭐', '💫', '🌟'][Math.floor(Math.random() * 4)];
            particle.style.cssText = `
                position: absolute;
                top: ${Math.random() * 100}%;
                left: ${Math.random() * 100}%;
                color: var(--primary-color);
                font-size: ${0.6 + Math.random() * 0.6}rem;
                pointer-events: none;
                animation: xpParticleFloat ${3 + Math.random() * 4}s ease-in-out infinite;
                animation-delay: ${Math.random() * 2}s;
                opacity: ${0.5 + Math.random() * 0.5};
                z-index: 1;
            `;
            xpSystem.appendChild(particle);
        }
    }

    animateXPProgress() {
        const progressFill = document.querySelector('.xp-progress-fill');
        if (!progressFill) return;

        // Animate progress bar filling with delay
        setTimeout(() => {
            progressFill.style.width = '75%';
            progressFill.style.animation = 'progressShine 3s linear infinite';
        }, 1500);

        // Add progress milestone effects
        progressFill.addEventListener('transitionend', () => {
            this.createXPMilestoneEffect();
        });
    }

    createXPMilestoneEffect() {
        const xpSystem = document.querySelector('.ultra-xp-system');
        if (!xpSystem) return;

        // Create milestone celebration
        for (let i = 0; i < 8; i++) {
            const star = document.createElement('div');
            star.innerHTML = '⭐';
            star.style.cssText = `
                position: absolute;
                top: 50%;
                left: 50%;
                font-size: ${1.5 + Math.random() * 1}rem;
                color: var(--accent-color);
                pointer-events: none;
                animation: milestoneStar 2.5s ease-out forwards;
                animation-delay: ${i * 0.15}s;
                z-index: 1000;
                transform: translate(-50%, -50%);
            `;
            xpSystem.appendChild(star);
            
            setTimeout(() => star.remove(), 2650);
        }
    }

    animateXPStars() {
        const xpStars = document.querySelectorAll('.xp-star');
        xpStars.forEach((star, index) => {
            star.addEventListener('mouseenter', () => {
                star.style.transform = 'scale(1.3) rotate(360deg)';
                star.style.filter = 'brightness(1.5) drop-shadow(0 0 15px currentColor)';
            });
            
            star.addEventListener('mouseleave', () => {
                star.style.transform = '';
                star.style.filter = '';
            });
        });
    }

    initXPBoostEffects() {
        const boostIndicator = document.querySelector('.xp-boost-indicator');
        if (!boostIndicator) return;

        boostIndicator.addEventListener('click', () => {
            this.triggerXPBoost();
        });
    }

    triggerXPBoost() {
        const xpSystem = document.querySelector('.ultra-xp-system');
        if (!xpSystem) return;

        // Create XP boost effect
        xpSystem.style.animation = 'xpSystemPulse 0.5s ease-in-out 3';
        
        // Add boost particles
        for (let i = 0; i < 15; i++) {
            const particle = document.createElement('div');
            particle.innerHTML = '+' + (50 + Math.floor(Math.random() * 100)) + ' XP';
            particle.style.cssText = `
                position: absolute;
                top: ${30 + Math.random() * 40}%;
                left: ${30 + Math.random() * 40}%;
                color: var(--primary-color);
                font-size: 1rem;
                font-weight: bold;
                pointer-events: none;
                animation: xpBoostParticle 3s ease-out forwards;
                animation-delay: ${i * 0.08}s;
                z-index: 1000;
            `;
            xpSystem.appendChild(particle);
            
            setTimeout(() => particle.remove(), 3200);
        }

        setTimeout(() => {
            xpSystem.style.animation = '';
        }, 1500);
    }

    animateTitle() {
        const title = document.querySelector('.title');
        if (!title) return;

        const originalText = title.textContent;
        title.textContent = '';
        title.style.opacity = '1';

        let charIndex = 0;
        const typeSpeed = 100;

        const typeInterval = setInterval(() => {
            if (charIndex < originalText.length) {
                title.textContent += originalText[charIndex];
                this.createTextSparkle(title);
                charIndex++;
            } else {
                clearInterval(typeInterval);
                this.pulseTitleGlow(title);
            }
        }, typeSpeed);
    }

    createTextSparkle(element) {
        const sparkle = document.createElement('div');
        sparkle.style.cssText = `
            position: absolute;
            width: 4px;
            height: 4px;
            background: var(--primary-color);
            border-radius: 50%;
            pointer-events: none;
            animation: sparkleFloat 1s ease-out forwards;
            top: ${Math.random() * 20 - 10}px;
            left: ${Math.random() * 20 - 10}px;
        `;

        element.style.position = 'relative';
        element.appendChild(sparkle);

        setTimeout(() => sparkle.remove(), 1000);
    }

    pulseTitleGlow(title) {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes titleGlowPulse {
                0%, 100% { 
                    text-shadow: 0 0 20px rgba(0, 255, 136, 0.5),
                                 0 0 40px rgba(0, 255, 136, 0.3),
                                 0 0 60px rgba(0, 255, 136, 0.1);
                }
                50% { 
                    text-shadow: 0 0 30px rgba(0, 255, 136, 0.8),
                                 0 0 60px rgba(0, 255, 136, 0.5),
                                 0 0 90px rgba(0, 255, 136, 0.3);
                }
            }
        `;
        document.head.appendChild(style);

        title.style.animation = 'titleGlowPulse 2s ease-in-out infinite';
    }

    animateCardEntrance() {
        const card = document.querySelector('.register-card');
        if (!card) return;

        // Add entrance animation with 3D effect
        card.style.transform = 'translateY(100px) rotateX(20deg) scale(0.8)';
        card.style.opacity = '0';

        setTimeout(() => {
            card.style.transition = 'all 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            card.style.transform = 'translateY(0) rotateX(0deg) scale(1)';
            card.style.opacity = '1';

            // Add subtle floating animation
            setTimeout(() => {
                card.style.animation = 'cardFloat 6s ease-in-out infinite';
            }, 1200);
        }, 500);

        // Add card floating keyframes
        const style = document.createElement('style');
        style.textContent = `
            @keyframes cardFloat {
                0%, 100% { transform: translateY(0px) rotateY(0deg); }
                50% { transform: translateY(-10px) rotateY(1deg); }
            }
            @keyframes sparkleFloat {
                0% { opacity: 1; transform: scale(0) rotate(0deg); }
                50% { opacity: 1; transform: scale(1) rotate(180deg); }
                100% { opacity: 0; transform: scale(0) rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }

    setupXPPreview() {
        this.startXPAnimation();
    }

    startXPAnimation() {
        let currentXP = 0;
        const targetXP = 100;
        const duration = 3000;
        const increment = targetXP / (duration / 50);

        const xpInterval = setInterval(() => {
            currentXP += increment;
            if (currentXP >= targetXP) {
                currentXP = targetXP;
                clearInterval(xpInterval);
                this.triggerXPComplete();
            }

            this.updateXPDisplay(currentXP, targetXP);
        }, 50);
    }

    updateXPDisplay(current, max) {
        const percentage = (current / max) * 100;
        const previewBar = this.elements.previewXP;
        
        if (previewBar) {
            previewBar.style.width = `${percentage}%`;
            
            // Update text
            const xpText = document.querySelector('.xp-preview .xp-text');
            if (xpText) {
                xpText.textContent = `${Math.floor(current)} / ${max} XP`;
            }

            // Add glow effect at milestones
            if (current % 25 < 2) {
                this.createXPMilestoneEffect(previewBar);
            }
        }
    }

    createXPMilestoneEffect(element) {
        element.style.boxShadow = '0 0 30px rgba(0, 255, 136, 0.8)';
        setTimeout(() => {
            element.style.boxShadow = '0 0 15px rgba(0, 255, 136, 0.5)';
        }, 500);
    }

    triggerXPComplete() {
        const xpPreview = document.querySelector('.xp-preview');
        if (xpPreview) {
            // Create completion celebration
            this.createCelebrationParticles(xpPreview);
            
            // Add completion glow
            xpPreview.style.border = '2px solid var(--primary-color)';
            xpPreview.style.boxShadow = '0 0 30px rgba(0, 255, 136, 0.5)';
            
            // Trigger success sound
            this.playSuccessSound('xp-complete');
        }
    }

    setupPasswordStrength() {
        // Initialize strength display
        if (this.elements.strengthProgress) {
            this.elements.strengthProgress.style.width = '0%';
        }
        if (this.elements.strengthText) {
            this.elements.strengthText.textContent = 'Enter password to check strength';
            this.elements.strengthText.className = 'strength-text';
        }
    }

    updatePasswordStrength(password) {
        if (!password) {
            this.resetPasswordStrength();
            return;
        }

        const strength = this.calculatePasswordStrength(password);
        this.displayPasswordStrength(strength);
        this.animateStrengthChange(strength);
    }

    calculatePasswordStrength(password) {
        let score = 0;
        let feedback = [];

        // Length check
        if (password.length >= 8) score++;
        else feedback.push('At least 8 characters');

        // Uppercase check
        if (/[A-Z]/.test(password)) score++;
        else feedback.push('Uppercase letter');

        // Lowercase check
        if (/[a-z]/.test(password)) score++;
        else feedback.push('Lowercase letter');

        // Number check
        if (/\d/.test(password)) score++;
        else feedback.push('Number');

        // Special character check
        if (/[@$!%*?&]/.test(password)) score++;
        else feedback.push('Special character');

        // Determine level
        let level;
        if (score <= 2) level = this.strengthLevels.weak;
        else if (score === 3) level = this.strengthLevels.fair;
        else if (score === 4) level = this.strengthLevels.good;
        else level = this.strengthLevels.strong;

        return { score, level, feedback };
    }

    displayPasswordStrength(strength) {
        const { level, feedback } = strength;
        
        if (this.elements.strengthProgress) {
            this.elements.strengthProgress.className = `strength-progress ${level.class}`;
            this.elements.strengthProgress.style.width = `${(strength.score / 5) * 100}%`;
        }

        if (this.elements.strengthText) {
            this.elements.strengthText.textContent = level.text;
            this.elements.strengthText.className = `strength-text ${level.class}`;
        }
    }

    animateStrengthChange(strength) {
        const progress = this.elements.strengthProgress;
        if (!progress) return;

        // Add pulse animation for strength improvements
        progress.style.animation = 'strengthPulse 0.5s ease-out';
        
        setTimeout(() => {
            progress.style.animation = '';
        }, 500);

        // Add strength pulse keyframes
        if (!document.getElementById('strength-animations')) {
            const style = document.createElement('style');
            style.id = 'strength-animations';
            style.textContent = `
                @keyframes strengthPulse {
                    0% { transform: scaleY(1); }
                    50% { transform: scaleY(1.2); }
                    100% { transform: scaleY(1); }
                }
            `;
            document.head.appendChild(style);
        }
    }

    resetPasswordStrength() {
        if (this.elements.strengthProgress) {
            this.elements.strengthProgress.style.width = '0%';
            this.elements.strengthProgress.className = 'strength-progress';
        }
        if (this.elements.strengthText) {
            this.elements.strengthText.textContent = 'Enter password to check strength';
            this.elements.strengthText.className = 'strength-text';
        }
    }

    validatePasswordMatch() {
        const password = this.elements.inputs.password?.value;
        const confirmPassword = this.elements.inputs.confirmPassword?.value;
        const errorElement = document.getElementById('confirmPassword-error');

        if (!confirmPassword) {
            this.hideError('confirmPassword');
            return;
        }

        if (password !== confirmPassword) {
            this.showError('confirmPassword', 'Passwords do not match');
            this.addErrorAnimation(this.elements.inputs.confirmPassword);
        } else {
            this.hideError('confirmPassword');
            this.addSuccessAnimation(this.elements.inputs.confirmPassword);
        }
    }

    setupFormValidation() {
        // Real-time validation setup is handled in event listeners
        console.log('✅ Form validation system initialized');
    }

    handleInputChange(event) {
        const input = event.target;
        const inputName = input.name || input.id;
        
        // Real-time validation
        this.validateInput(input);
        
        // Update XP preview based on completion
        this.updateFormCompletionXP();
        
        // Create typing effect
        this.createTypingEffect(input);
        
        // Advanced input animations
        this.triggerInputAnimation(input);
    }

    validateInput(input) {
        const inputName = input.name || input.id;
        const value = input.value.trim();
        const rules = this.validationRules[inputName];

        if (!rules) return true;

        let isValid = true;
        let errorMessage = '';

        // Required field check
        if (input.hasAttribute('required') && !value) {
            isValid = false;
            errorMessage = `${this.getFieldLabel(inputName)} is required`;
        }
        // Pattern validation
        else if (value && rules.pattern && !rules.pattern.test(value)) {
            isValid = false;
            errorMessage = rules.message;
        }
        // Length validation
        else if (value && rules.minLength && value.length < rules.minLength) {
            isValid = false;
            errorMessage = `${this.getFieldLabel(inputName)} must be at least ${rules.minLength} characters`;
        }
        else if (value && rules.maxLength && value.length > rules.maxLength) {
            isValid = false;
            errorMessage = `${this.getFieldLabel(inputName)} must be no more than ${rules.maxLength} characters`;
        }

        // Update UI based on validation
        if (isValid) {
            this.hideError(inputName);
            input.classList.remove('error');
            input.classList.add('success');
        } else {
            this.showError(inputName, errorMessage);
            input.classList.remove('success');
            input.classList.add('error');
        }

        return isValid;
    }

    getFieldLabel(inputName) {
        const labels = {
            username: 'Gamer Tag',
            email: 'Email Address',
            password: 'Password',
            confirmPassword: 'Confirm Password',
            favoriteGame: 'Favorite Game'
        };
        return labels[inputName] || inputName;
    }

    showError(inputName, message) {
        const errorElement = document.getElementById(`${inputName}-error`);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.add('show');
        }
    }

    hideError(inputName) {
        const errorElement = document.getElementById(`${inputName}-error`);
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.classList.remove('show');
        }
    }

    addErrorAnimation(input) {
        input.style.animation = 'fieldShake 0.5s ease-in-out';
        setTimeout(() => {
            input.style.animation = '';
        }, 500);
    }

    addSuccessAnimation(input) {
        // Create success sparkle effect
        this.createSparkleEffect(input);
        
        // Add success glow
        input.style.boxShadow = '0 0 20px rgba(34, 197, 94, 0.3)';
        setTimeout(() => {
            input.style.boxShadow = '';
        }, 1000);
    }

    handleInputFocus(event) {
        const input = event.target;
        
        // Create focus ripple effect
        this.createFocusRipple(input);
        
        // Add focus glow animation
        this.addFocusGlow(input);
        
        // Play focus sound
        this.playSuccessSound('input-focus');
    }

    handleInputBlur(event) {
        const input = event.target;
        
        // Remove focus effects
        this.removeFocusGlow(input);
        
        // Validate on blur
        this.validateInput(input);
    }

    createFocusRipple(input) {
        const ripple = document.createElement('div');
        ripple.style.cssText = `
            position: absolute;
            border-radius: 50%;
            background: rgba(0, 255, 136, 0.3);
            transform: scale(0);
            animation: rippleExpand 0.6s ease-out;
            pointer-events: none;
            z-index: -1;
        `;

        const rect = input.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        ripple.style.width = size + 'px';
        ripple.style.height = size + 'px';
        ripple.style.left = '-' + (size / 2) + 'px';
        ripple.style.top = '-' + (size / 2) + 'px';

        input.style.position = 'relative';
        input.appendChild(ripple);

        setTimeout(() => ripple.remove(), 600);

        // Add ripple keyframes if not exists
        if (!document.getElementById('ripple-animations')) {
            const style = document.createElement('style');
            style.id = 'ripple-animations';
            style.textContent = `
                @keyframes rippleExpand {
                    to {
                        transform: scale(1);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    addFocusGlow(input) {
        input.style.transition = 'all 0.3s ease';
        input.style.transform = 'translateY(-2px)';
        input.style.boxShadow = '0 8px 25px rgba(0, 255, 136, 0.2)';
    }

    removeFocusGlow(input) {
        input.style.transform = '';
        input.style.boxShadow = '';
    }

    handleCheckboxChange(event) {
        const checkbox = event.target;
        
        // Create checkbox animation
        this.animateCheckbox(checkbox);
        
        // Update form completion
        this.updateFormCompletionXP();
        
        // Play interaction sound
        this.playSuccessSound('checkbox-toggle');
    }

    animateCheckbox(checkbox) {
        const checkmark = checkbox.nextElementSibling;
        if (checkmark && checkmark.classList.contains('checkmark')) {
            if (checkbox.checked) {
                checkmark.style.animation = 'checkboxSuccess 0.3s ease-out';
                this.createSparkleEffect(checkmark);
            } else {
                checkmark.style.animation = '';
            }
        }

        // Add checkbox success keyframes
        if (!document.getElementById('checkbox-animations')) {
            const style = document.createElement('style');
            style.id = 'checkbox-animations';
            style.textContent = `
                @keyframes checkboxSuccess {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.2); }
                    100% { transform: scale(1); }
                }
            `;
            document.head.appendChild(style);
        }
    }

    updateFormCompletionXP() {
        const formInputs = Object.values(this.elements.inputs).filter(input => 
            input && (input.type !== 'checkbox' || input.id === 'terms')
        );
        
        let completedFields = 0;
        formInputs.forEach(input => {
            if (input.type === 'checkbox') {
                if (input.checked) completedFields++;
            } else {
                if (input.value.trim()) completedFields++;
            }
        });

        const completionPercentage = (completedFields / formInputs.length) * 100;
        this.updatePreviewXP(completionPercentage);
    }

    updatePreviewXP(percentage) {
        const previewBar = this.elements.previewXP;
        if (previewBar) {
            previewBar.style.width = `${percentage}%`;
            
            // Update XP text
            const xpText = document.querySelector('.xp-preview .xp-text');
            if (xpText) {
                const currentXP = Math.floor((percentage / 100) * 100);
                xpText.textContent = `${currentXP} / 100 XP - Form Completion`;
            }

            // Create milestone effects
            if (percentage >= 100) {
                this.triggerFormCompletionCelebration();
            }
        }
    }

    triggerFormCompletionCelebration() {
        const xpPreview = document.querySelector('.xp-preview');
        if (xpPreview) {
            this.createCelebrationParticles(xpPreview);
            this.playSuccessSound('form-complete');
            
            // Add completion message
            const xpLabel = document.querySelector('.xp-preview .xp-label');
            if (xpLabel) {
                xpLabel.textContent = '🎉 Form Complete! Ready to Register';
                xpLabel.style.color = 'var(--success-color)';
            }
        }
    }

    createTypingEffect(input) {
        // Create typing indicator
        const indicator = document.createElement('div');
        indicator.style.cssText = `
            position: absolute;
            right: 15px;
            top: 50%;
            transform: translateY(-50%);
            width: 8px;
            height: 8px;
            background: var(--primary-color);
            border-radius: 50%;
            animation: typingPulse 1s ease-in-out infinite;
            pointer-events: none;
        `;

        input.style.position = 'relative';
        input.parentElement.style.position = 'relative';
        input.parentElement.appendChild(indicator);

        setTimeout(() => indicator.remove(), 1500);

        // Add typing pulse keyframes
        if (!document.getElementById('typing-animations')) {
            const style = document.createElement('style');
            style.id = 'typing-animations';
            style.textContent = `
                @keyframes typingPulse {
                    0%, 100% { opacity: 1; transform: translateY(-50%) scale(1); }
                    50% { opacity: 0.3; transform: translateY(-50%) scale(0.8); }
                }
            `;
            document.head.appendChild(style);
        }
    }

    triggerInputAnimation(input) {
        // Create input interaction particle effect
        this.createInputParticles(input);
    }

    createInputParticles(input) {
        const particleCount = 3;
        const rect = input.getBoundingClientRect();

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: fixed;
                width: 4px;
                height: 4px;
                background: var(--primary-color);
                border-radius: 50%;
                pointer-events: none;
                z-index: 10000;
                animation: particleFloat 2s ease-out forwards;
            `;

            particle.style.left = (rect.left + Math.random() * rect.width) + 'px';
            particle.style.top = (rect.top + rect.height / 2) + 'px';

            document.body.appendChild(particle);
            setTimeout(() => particle.remove(), 2000);
        }

        // Add particle float keyframes
        if (!document.getElementById('particle-animations')) {
            const style = document.createElement('style');
            style.id = 'particle-animations';
            style.textContent = `
                @keyframes particleFloat {
                    0% {
                        opacity: 1;
                        transform: translateY(0px) scale(1);
                    }
                    100% {
                        opacity: 0;
                        transform: translateY(-50px) scale(0);
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    handleFormSubmit(event) {
        event.preventDefault();
        
        // Validate entire form
        if (!this.validateEntireForm()) {
            this.showFormErrors();
            return;
        }

        // Show loading state
        this.showLoadingState();
        
        // Simulate registration process
        this.simulateRegistration();
    }

    validateEntireForm() {
        let isValid = true;
        
        // Validate all inputs
        Object.values(this.elements.inputs).forEach(input => {
            if (input && input.type !== 'checkbox') {
                if (!this.validateInput(input)) {
                    isValid = false;
                }
            }
        });

        // Check password match
        const password = this.elements.inputs.password?.value;
        const confirmPassword = this.elements.inputs.confirmPassword?.value;
        if (password !== confirmPassword) {
            this.showError('confirmPassword', 'Passwords do not match');
            isValid = false;
        }

        // Check terms acceptance
        if (this.elements.inputs.terms && !this.elements.inputs.terms.checked) {
            this.showError('terms', 'You must accept the Terms of Service');
            isValid = false;
        }

        return isValid;
    }

    showFormErrors() {
        // Animate form shake
        const form = this.elements.form;
        if (form) {
            form.style.animation = 'formShake 0.5s ease-in-out';
            setTimeout(() => {
                form.style.animation = '';
            }, 500);
        }

        // Play error sound
        this.playSuccessSound('form-error');

        // Add form shake keyframes
        if (!document.getElementById('form-animations')) {
            const style = document.createElement('style');
            style.id = 'form-animations';
            style.textContent = `
                @keyframes formShake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-10px); }
                    75% { transform: translateX(10px); }
                }
            `;
            document.head.appendChild(style);
        }
    }

    showLoadingState() {
        const submitButton = document.querySelector('.btn-register');
        if (submitButton) {
            submitButton.classList.add('loading');
            submitButton.disabled = true;
            
            const btnText = submitButton.querySelector('.btn-text');
            if (btnText) {
                btnText.textContent = '⏳ Creating Account...';
            }
        }
    }

    simulateRegistration() {
        // Simulate API call delay
        setTimeout(() => {
            this.showSuccessModal();
            this.celebrateRegistration();
        }, 2000);
    }

    showSuccessModal() {
        const modal = this.elements.successModal;
        if (modal) {
            modal.classList.add('show');
            this.animateModalEntrance();
            this.startModalXPAnimation();
        }
    }

    animateModalEntrance() {
        const modalContent = document.querySelector('.modal-content');
        if (modalContent) {
            modalContent.style.animation = 'modalSlideIn 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards';
        }

        // Add modal slide keyframes
        if (!document.getElementById('modal-animations')) {
            const style = document.createElement('style');
            style.id = 'modal-animations';
            style.textContent = `
                @keyframes modalSlideIn {
                    0% {
                        opacity: 0;
                        transform: scale(0.8) translateY(50px);
                    }
                    100% {
                        opacity: 1;
                        transform: scale(1) translateY(0);
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    startModalXPAnimation() {
        const modalXP = this.elements.modalXP;
        if (modalXP) {
            setTimeout(() => {
                modalXP.style.width = '100%';
                this.createCelebrationParticles(modalXP);
            }, 500);
        }
    }

    celebrateRegistration() {
        // Create screen-wide celebration
        this.createFullScreenCelebration();
        
        // Play celebration sound
        this.playSuccessSound('registration-success');
        
        // Trigger confetti
        this.triggerConfetti();
    }

    createFullScreenCelebration() {
        const celebration = document.createElement('div');
        celebration.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            pointer-events: none;
            z-index: 9999;
        `;

        // Create multiple celebration particles
        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                this.createCelebrationParticle(celebration);
            }, i * 50);
        }

        document.body.appendChild(celebration);
        setTimeout(() => celebration.remove(), 5000);
    }

    createCelebrationParticle(container) {
        const particle = document.createElement('div');
        const symbols = ['🎉', '🏆', '⭐', '💫', '🚀', '🎊'];
        const symbol = symbols[Math.floor(Math.random() * symbols.length)];
        
        particle.textContent = symbol;
        particle.style.cssText = `
            position: absolute;
            font-size: ${Math.random() * 20 + 20}px;
            left: ${Math.random() * 100}vw;
            top: -50px;
            animation: celebrationFall ${Math.random() * 3 + 3}s linear forwards;
            pointer-events: none;
        `;

        container.appendChild(particle);
        setTimeout(() => particle.remove(), 6000);

        // Add celebration fall keyframes
        if (!document.getElementById('celebration-animations')) {
            const style = document.createElement('style');
            style.id = 'celebration-animations';
            style.textContent = `
                @keyframes celebrationFall {
                    0% {
                        transform: translateY(-50px) rotate(0deg);
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(100vh) rotate(360deg);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    triggerConfetti() {
        const confettiElements = document.querySelectorAll('.confetti');
        confettiElements.forEach(confetti => {
            confetti.style.animation = 'confettiCelebration 3s ease-out infinite';
        });
    }

    createSparkleEffect(element) {
        const sparkleCount = 5;
        const rect = element.getBoundingClientRect();

        for (let i = 0; i < sparkleCount; i++) {
            const sparkle = document.createElement('div');
            sparkle.style.cssText = `
                position: fixed;
                width: 3px;
                height: 3px;
                background: var(--primary-color);
                border-radius: 50%;
                pointer-events: none;
                z-index: 10000;
                animation: sparkleEffect 1.5s ease-out forwards;
            `;

            sparkle.style.left = (rect.left + Math.random() * rect.width) + 'px';
            sparkle.style.top = (rect.top + Math.random() * rect.height) + 'px';

            document.body.appendChild(sparkle);
            setTimeout(() => sparkle.remove(), 1500);
        }

        // Add sparkle effect keyframes
        if (!document.getElementById('sparkle-animations')) {
            const style = document.createElement('style');
            style.id = 'sparkle-animations';
            style.textContent = `
                @keyframes sparkleEffect {
                    0% {
                        opacity: 1;
                        transform: scale(0) rotate(0deg);
                    }
                    50% {
                        opacity: 1;
                        transform: scale(1) rotate(180deg);
                    }
                    100% {
                        opacity: 0;
                        transform: scale(0) rotate(360deg);
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    createCelebrationParticles(element) {
        const particleCount = 20;
        const rect = element.getBoundingClientRect();

        for (let i = 0; i < particleCount; i++) {
            setTimeout(() => {
                const particle = document.createElement('div');
                particle.style.cssText = `
                    position: fixed;
                    width: 4px;
                    height: 4px;
                    background: var(--primary-color);
                    border-radius: 50%;
                    pointer-events: none;
                    z-index: 10000;
                    animation: celebrationParticle 2s ease-out forwards;
                `;

                particle.style.left = (rect.left + rect.width / 2) + 'px';
                particle.style.top = (rect.top + rect.height / 2) + 'px';

                document.body.appendChild(particle);
                setTimeout(() => particle.remove(), 2000);
            }, i * 50);
        }

        // Add celebration particle keyframes
        if (!document.getElementById('celebration-particle-animations')) {
            const style = document.createElement('style');
            style.id = 'celebration-particle-animations';
            style.textContent = `
                @keyframes celebrationParticle {
                    0% {
                        opacity: 1;
                        transform: translate(0, 0) scale(1);
                    }
                    100% {
                        opacity: 0;
                        transform: translate(${Math.random() * 200 - 100}px, ${Math.random() * 200 - 100}px) scale(0);
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    // Additional utility methods
    setupRealTimeEffects() {
        // Ambient background effects
        this.startAmbientEffects();
    }

    startAmbientEffects() {
        // Subtle background animation
        setInterval(() => {
            this.createAmbientParticle();
        }, 3000);
    }

    createAmbientParticle() {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: fixed;
            width: 2px;
            height: 2px;
            background: rgba(0, 255, 136, 0.3);
            border-radius: 50%;
            pointer-events: none;
            z-index: 1;
            animation: ambientFloat 10s linear forwards;
        `;

        particle.style.left = Math.random() * window.innerWidth + 'px';
        particle.style.top = window.innerHeight + 'px';

        document.body.appendChild(particle);
        setTimeout(() => particle.remove(), 10000);

        // Add ambient float keyframes
        if (!document.getElementById('ambient-animations')) {
            const style = document.createElement('style');
            style.id = 'ambient-animations';
            style.textContent = `
                @keyframes ambientFloat {
                    0% {
                        opacity: 0;
                        transform: translateY(0);
                    }
                    10% {
                        opacity: 1;
                    }
                    90% {
                        opacity: 1;
                    }
                    100% {
                        opacity: 0;
                        transform: translateY(-100vh);
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    initializeCanvasBackground() {
        // Initialize particle canvas background
        this.createCanvasBackground();
    }

    createCanvasBackground() {
        const canvas = document.createElement('canvas');
        canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            pointer-events: none;
            z-index: -1;
            opacity: 0.3;
        `;

        document.body.appendChild(canvas);
        this.animateCanvasBackground(canvas);
    }

    animateCanvasBackground(canvas) {
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const particles = [];
        const particleCount = 50;

        // Initialize particles
        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 2 + 1
            });
        }

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            particles.forEach(particle => {
                particle.x += particle.vx;
                particle.y += particle.vy;

                if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
                if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(0, 255, 136, 0.5)';
                ctx.fill();
            });

            requestAnimationFrame(animate);
        };

        animate();

        // Handle resize
        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        });
    }

    initializeTrophyDisplay() {
        // Initialize 3D trophy if Three.js is available
        if (typeof THREE !== 'undefined') {
            this.setup3DTrophy();
        }
    }

    setup3DTrophy() {
        const canvas = this.elements.trophyCanvas;
        if (!canvas) return;

        try {
            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
            const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
            
            renderer.setSize(400, 400);
            renderer.setClearColor(0x000000, 0);

            // Create trophy geometry
            const geometry = new THREE.ConeGeometry(1, 2, 8);
            const material = new THREE.MeshPhongMaterial({ 
                color: 0x00ff88,
                shininess: 100,
                transparent: true,
                opacity: 0.8
            });
            
            const trophy = new THREE.Mesh(geometry, material);
            scene.add(trophy);

            // Add lighting
            const light = new THREE.DirectionalLight(0xffffff, 1);
            light.position.set(5, 5, 5);
            scene.add(light);

            const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
            scene.add(ambientLight);

            camera.position.z = 5;

            // Animation loop
            const animate = () => {
                requestAnimationFrame(animate);
                
                trophy.rotation.x += 0.01;
                trophy.rotation.y += 0.01;
                
                renderer.render(scene, camera);
            };

            animate();
        } catch (error) {
            console.log('3D trophy initialization failed, using fallback');
            this.create2DTrophy();
        }
    }

    create2DTrophy() {
        const canvas = this.elements.trophyCanvas;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        canvas.width = 400;
        canvas.height = 400;

        const drawTrophy = () => {
            ctx.clearRect(0, 0, 400, 400);
            
            // Trophy cup
            ctx.beginPath();
            ctx.fillStyle = '#00ff88';
            ctx.arc(200, 150, 80, 0, Math.PI * 2);
            ctx.fill();
            
            // Trophy base
            ctx.fillRect(170, 220, 60, 40);
            
            // Trophy handles
            ctx.beginPath();
            ctx.arc(120, 150, 20, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.beginPath();
            ctx.arc(280, 150, 20, 0, Math.PI * 2);
            ctx.fill();
            
            requestAnimationFrame(drawTrophy);
        };

        drawTrophy();
    }

    playSuccessSound(type) {
        if (!this.config.soundEnabled) return;

        // Create audio context for sound effects
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            // Different sounds for different actions
            const soundMap = {
                'input-focus': { frequency: 800, duration: 0.1 },
                'checkbox-toggle': { frequency: 1000, duration: 0.15 },
                'xp-complete': { frequency: 1200, duration: 0.3 },
                'form-complete': { frequency: 1500, duration: 0.5 },
                'form-error': { frequency: 300, duration: 0.2 },
                'registration-success': { frequency: 2000, duration: 1.0 }
            };

            const sound = soundMap[type] || { frequency: 800, duration: 0.1 };

            oscillator.frequency.setValueAtTime(sound.frequency, audioContext.currentTime);
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + sound.duration);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + sound.duration);
        } catch (error) {
            console.log('Sound effect failed:', error);
        }
    }

    handleMouseMove(event) {
        // Create subtle mouse trail effect
        if (Math.random() > 0.95) { // Only occasionally to avoid performance issues
            this.createMouseTrail(event.clientX, event.clientY);
        }
    }

    createMouseTrail(x, y) {
        const trail = document.createElement('div');
        trail.style.cssText = `
            position: fixed;
            width: 4px;
            height: 4px;
            background: rgba(0, 255, 136, 0.6);
            border-radius: 50%;
            pointer-events: none;
            z-index: 10000;
            animation: trailFade 1s ease-out forwards;
        `;

        trail.style.left = x + 'px';
        trail.style.top = y + 'px';

        document.body.appendChild(trail);
        setTimeout(() => trail.remove(), 1000);

        // Add trail fade keyframes
        if (!document.getElementById('trail-animations')) {
            const style = document.createElement('style');
            style.id = 'trail-animations';
            style.textContent = `
                @keyframes trailFade {
                    0% {
                        opacity: 1;
                        transform: scale(1);
                    }
                    100% {
                        opacity: 0;
                        transform: scale(0);
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    createHoverEffect(element) {
        // Enhanced hover effect
        element.style.transition = 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        element.style.transform = 'translateY(-3px) scale(1.02)';
        element.style.boxShadow = '0 10px 30px rgba(0, 255, 136, 0.2)';
    }

    removeHoverEffect(element) {
        element.style.transform = '';
        element.style.boxShadow = '';
    }

    handleKeyboardShortcuts(event) {
        // Add keyboard shortcuts for enhanced UX
        if (event.ctrlKey || event.metaKey) {
            switch (event.key) {
                case 'Enter':
                    // Ctrl+Enter to submit form
                    event.preventDefault();
                    this.elements.form.dispatchEvent(new Event('submit'));
                    break;
                case 'r':
                    // Ctrl+R to reset form (prevent default refresh)
                    event.preventDefault();
                    this.resetForm();
                    break;
            }
        }

        // Tab navigation enhancements
        if (event.key === 'Tab') {
            this.enhanceTabNavigation(event);
        }
    }

    resetForm() {
        this.elements.form.reset();
        this.resetPasswordStrength();
        this.updateFormCompletionXP();
        
        // Clear all errors
        Object.keys(this.elements.inputs).forEach(inputName => {
            this.hideError(inputName);
            const input = this.elements.inputs[inputName];
            if (input) {
                input.classList.remove('success', 'error');
            }
        });
    }

    enhanceTabNavigation(event) {
        // Add visual indication for tab navigation
        const activeElement = document.activeElement;
        if (activeElement && activeElement.classList.contains('form-control')) {
            this.createFocusRipple(activeElement);
        }
    }

    handleResize() {
        // Handle responsive adjustments
        this.adjustResponsiveElements();
    }

    adjustResponsiveElements() {
        // Adjust canvas and particle systems for new screen size
        const canvases = document.querySelectorAll('canvas');
        canvases.forEach(canvas => {
            if (canvas.id === 'trophy-canvas') return; // Skip 3D trophy canvas
            
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        });
    }

    startSystemSequence() {
        // Final system initialization sequence
        setTimeout(() => {
            this.animationStates.systemReady = true;
            console.log('🎮 Enhanced Register System Fully Loaded - Ready for Action!');
            
            // Trigger final setup
            this.triggerSystemReadyEffects();
        }, 2000);
    }

    triggerSystemReadyEffects() {
        // System ready celebration
        const readyMessage = document.createElement('div');
        readyMessage.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(0, 255, 136, 0.1);
            border: 1px solid var(--primary-color);
            border-radius: 8px;
            padding: 1rem;
            color: var(--primary-color);
            font-family: var(--font-mono);
            font-size: 0.9rem;
            z-index: 10000;
            animation: systemNotification 3s ease-out forwards;
        `;
        
        readyMessage.textContent = '🚀 System Ready - Enhanced Mode Active!';
        document.body.appendChild(readyMessage);
        
        setTimeout(() => readyMessage.remove(), 3000);

        // Add system notification keyframes
        const style = document.createElement('style');
        style.textContent = `
            @keyframes systemNotification {
                0% {
                    opacity: 0;
                    transform: translateX(100%);
                }
                10% {
                    opacity: 1;
                    transform: translateX(0);
                }
                90% {
                    opacity: 1;
                    transform: translateX(0);
                }
                100% {
                    opacity: 0;
                    transform: translateX(100%);
                }
            }
        `;
        document.head.appendChild(style);
    }

    // ========================================
    // ULTRA-ENHANCED HUD SYSTEM METHODS
    // ========================================

    initializeHUDSystem() {
        console.log('🎮 Initializing Gaming HUD System...');
        
        // Animate HUD system entrance
        this.animateHUDEntrance();
        
        // Setup real-time HUD updates
        this.setupHUDUpdates();
        
        // Initialize interactive HUD elements
        this.setupHUDInteractions();
    }

    animateHUDEntrance() {
        const hudSystem = document.querySelector('.gaming-hud-system');
        if (!hudSystem) return;

        // Add entrance animation class
        hudSystem.style.opacity = '0';
        hudSystem.style.transform = 'translateX(300px) rotateY(45deg)';
        
        setTimeout(() => {
            hudSystem.style.transition = 'all 2s ease-out';
            hudSystem.style.opacity = '1';
            hudSystem.style.transform = 'translateX(0) rotateY(0deg)';
        }, 500);

        // Animate individual HUD items
        const hudItems = document.querySelectorAll('.hud-item');
        hudItems.forEach((item, index) => {
            setTimeout(() => {
                item.style.animation = `hudItemSlideIn 0.5s ease-out both`;
            }, 800 + (index * 200));
        });
    }

    setupHUDUpdates() {
        // Real-time XP counter update
        this.updateXPCounter();
        
        // Status indicators
        this.updateStatusIndicators();
        
        // Dynamic level progression
        this.updateLevelDisplay();
        
        // Setup periodic updates
        setInterval(() => {
            this.updateHUDMetrics();
        }, 5000);
    }

    updateXPCounter() {
        const xpCounter = document.querySelector('.xp-counter');
        if (!xpCounter) return;

        let currentXP = 0;
        const targetXP = 100;
        const duration = 2000;
        const increment = targetXP / (duration / 50);

        const updateInterval = setInterval(() => {
            currentXP += increment;
            if (currentXP >= targetXP) {
                currentXP = targetXP;
                clearInterval(updateInterval);
                this.triggerXPBoost();
            }
            xpCounter.textContent = `${Math.floor(currentXP)}/100`;
        }, 50);
    }

    updateStatusIndicators() {
        const statusValue = document.querySelector('.status-online');
        if (statusValue) {
            statusValue.style.animation = 'statusPulse 2s ease-in-out infinite';
        }

        const levelValue = document.querySelector('.level-rookie');
        if (levelValue) {
            levelValue.style.animation = 'levelGlow 3s ease-in-out infinite';
        }

        const rankValue = document.querySelector('.rank-display');
        if (rankValue) {
            rankValue.style.animation = 'rankShimmer 4s ease-in-out infinite';
        }
    }

    updateLevelDisplay() {
        const levelDisplay = document.querySelector('.level-rookie');
        if (!levelDisplay) return;

        // Simulate level progression
        setTimeout(() => {
            levelDisplay.style.transform = 'scale(1.2)';
            levelDisplay.style.color = '#00ff88';
            setTimeout(() => {
                levelDisplay.style.transform = 'scale(1)';
            }, 300);
        }, 3000);
    }

    setupHUDInteractions() {
        const hudItems = document.querySelectorAll('.hud-item');
        
        hudItems.forEach(item => {
            item.addEventListener('mouseenter', () => {
                item.style.background = 'rgba(0, 255, 136, 0.1)';
                item.style.transform = 'translateX(-5px)';
                item.style.boxShadow = '0 0 15px rgba(0, 255, 136, 0.3)';
            });

            item.addEventListener('mouseleave', () => {
                item.style.background = '';
                item.style.transform = '';
                item.style.boxShadow = '';
            });
        });
    }

    updateHUDMetrics() {
        // Simulate dynamic updates
        const statusItems = [
            { selector: '.status-online', values: ['ONLINE', 'ACTIVE', 'READY'] },
            { selector: '.rank-display', values: ['UNRANKED', 'BRONZE', 'SILVER'] }
        ];

        statusItems.forEach(item => {
            const element = document.querySelector(item.selector);
            if (element && Math.random() > 0.7) {
                const randomValue = item.values[Math.floor(Math.random() * item.values.length)];
                element.textContent = randomValue;
            }
        });
    }

    triggerXPBoost() {
        const xpCounter = document.querySelector('.xp-counter');
        if (!xpCounter) return;

        // Create boost effect
        const boostEffect = document.createElement('div');
        boostEffect.innerHTML = '+100 XP!';
        boostEffect.style.cssText = `
            position: absolute;
            top: -20px;
            right: 0;
            color: #00ff88;
            font-weight: bold;
            font-size: 0.9rem;
            animation: xpBoostFly 2s ease-out forwards;
            pointer-events: none;
            z-index: 1000;
        `;

        xpCounter.parentElement.style.position = 'relative';
        xpCounter.parentElement.appendChild(boostEffect);

        setTimeout(() => {
            boostEffect.remove();
        }, 2000);
    }

    // ========================================
    // ULTRA-ENHANCED WEAPON ARSENAL METHODS
    // ========================================

    initializeWeaponArsenal() {
        console.log('⚔️ Initializing Weapon Arsenal System...');
        
        // Animate weapon arsenal entrance
        this.animateWeaponArsenalEntrance();
        
        // Setup weapon selection
        this.setupWeaponSelection();
        
        // Initialize weapon animations
        this.setupWeaponAnimations();
        
        // Setup weapon interactions
        this.setupWeaponInteractions();
    }

    animateWeaponArsenalEntrance() {
        const weaponArsenal = document.querySelector('.weapon-arsenal');
        if (!weaponArsenal) return;

        // Initial state
        weaponArsenal.style.opacity = '0';
        weaponArsenal.style.transform = 'translateY(50px) rotateX(45deg)';
        
        setTimeout(() => {
            weaponArsenal.style.transition = 'all 2s ease-out';
            weaponArsenal.style.opacity = '1';
            weaponArsenal.style.transform = 'translateY(0) rotateX(0deg)';
        }, 1000);

        // Animate weapon slots
        const weaponSlots = document.querySelectorAll('.weapon-slot');
        weaponSlots.forEach((slot, index) => {
            setTimeout(() => {
                slot.style.animation = `weaponSlotSlideIn 0.6s ease-out both`;
            }, 1500 + (index * 200));
        });
    }

    setupWeaponSelection() {
        const weaponSlots = document.querySelectorAll('.weapon-slot');
        
        weaponSlots.forEach((slot, index) => {
            slot.addEventListener('click', () => {
                // Remove active class from all slots
                weaponSlots.forEach(s => s.classList.remove('active'));
                
                // Add active class to clicked slot
                slot.classList.add('active');
                
                // Trigger weapon selection effect
                this.triggerWeaponSelection(slot, index);
            });
        });
    }

    setupWeaponAnimations() {
        const weaponIcons = document.querySelectorAll('.weapon-icon');
        
        weaponIcons.forEach((icon, index) => {
            // Set staggered animation delays
            icon.style.animationDelay = `${index * 0.5}s`;
            
            // Add floating animation
            icon.style.animation = 'weaponIconFloat 3s ease-in-out infinite';
        });
    }

    setupWeaponInteractions() {
        const weaponSlots = document.querySelectorAll('.weapon-slot');
        
        weaponSlots.forEach(slot => {
            slot.addEventListener('mouseenter', () => {
                const icon = slot.querySelector('.weapon-icon');
                const name = slot.querySelector('.weapon-name');
                
                if (icon) {
                    icon.style.transform = 'scale(1.2) rotateZ(10deg)';
                    icon.style.filter = 'drop-shadow(0 0 15px currentColor)';
                }
                
                if (name) {
                    name.style.color = 'var(--accent-color)';
                    name.style.textShadow = '0 0 8px currentColor';
                    name.style.transform = 'translateX(5px)';
                }
                
                // Add hover effect
                slot.style.background = 'rgba(139, 92, 246, 0.2)';
                slot.style.borderColor = 'var(--accent-color)';
                slot.style.transform = 'translateX(-8px) scale(1.02)';
                slot.style.boxShadow = `
                    0 5px 20px rgba(139, 92, 246, 0.4),
                    inset 0 0 15px rgba(139, 92, 246, 0.1)
                `;
            });

            slot.addEventListener('mouseleave', () => {
                if (!slot.classList.contains('active')) {
                    const icon = slot.querySelector('.weapon-icon');
                    const name = slot.querySelector('.weapon-name');
                    
                    if (icon) {
                        icon.style.transform = '';
                        icon.style.filter = '';
                    }
                    
                    if (name) {
                        name.style.color = '';
                        name.style.textShadow = '';
                        name.style.transform = '';
                    }
                    
                    // Remove hover effect
                    slot.style.background = '';
                    slot.style.borderColor = '';
                    slot.style.transform = '';
                    slot.style.boxShadow = '';
                }
            });
        });
    }

    triggerWeaponSelection(slot, index) {
        // Create selection effect
        const selectionEffect = document.createElement('div');
        selectionEffect.innerHTML = '⚡ SELECTED ⚡';
        selectionEffect.style.cssText = `
            position: absolute;
            top: -30px;
            left: 50%;
            transform: translateX(-50%);
            color: var(--primary-color);
            font-weight: bold;
            font-size: 0.8rem;
            animation: weaponSelectionEffect 1.5s ease-out forwards;
            pointer-events: none;
            z-index: 1000;
            text-shadow: 0 0 10px var(--primary-color);
        `;

        slot.style.position = 'relative';
        slot.appendChild(selectionEffect);

        // Play selection sound effect (if audio is available)
        this.playWeaponSelectionSound(index);

        // Update HUD with selected weapon
        this.updateSelectedWeapon(slot);

        setTimeout(() => {
            selectionEffect.remove();
        }, 1500);
    }

    playWeaponSelectionSound(index) {
        // Simulate weapon selection sound
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const frequencies = [440, 523, 659, 784]; // Different tones for different weapons
            
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = frequencies[index] || 440;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
        } catch (e) {
            console.log('Audio context not available');
        }
    }

    updateSelectedWeapon(slot) {
        const weaponName = slot.querySelector('.weapon-name').textContent;
        const weaponIcon = slot.querySelector('.weapon-icon').textContent;
        
        // Update HUD with selected weapon info
        console.log(`🎯 Weapon Selected: ${weaponIcon} ${weaponName}`);
        
        // Could update a HUD element here if needed
        const statusDisplay = document.querySelector('.rank-display');
        if (statusDisplay) {
            statusDisplay.textContent = `${weaponName} READY`;
            statusDisplay.style.color = 'var(--primary-color)';
            statusDisplay.style.animation = 'weaponReadyPulse 1s ease-in-out 3';
        }
    }

    // ========================================
    // ENHANCED SYSTEM INTEGRATIONS
    // ========================================

    integrateHUDWithForm() {
        // Update HUD based on form progress
        const formInputs = document.querySelectorAll('.form-control');
        
        formInputs.forEach(input => {
            input.addEventListener('input', () => {
                const filledInputs = Array.from(formInputs).filter(inp => inp.value.trim() !== '');
                const progress = (filledInputs.length / formInputs.length) * 100;
                
                // Update XP based on form completion
                const xpProgress = document.getElementById('preview-xp');
                if (xpProgress) {
                    xpProgress.style.width = `${progress}%`;
                }
                
                // Update HUD metrics
                const xpCounter = document.querySelector('.xp-counter');
                if (xpCounter) {
                    xpCounter.textContent = `${Math.floor(progress)}/100`;
                }
            });
        });
    }

    // Add CSS for new animations
    addDynamicStyles() {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes xpBoostFly {
                0% {
                    transform: translateY(0) scale(1);
                    opacity: 1;
                }
                100% {
                    transform: translateY(-30px) scale(1.2);
                    opacity: 0;
                }
            }
            
            @keyframes weaponSelectionEffect {
                0% {
                    transform: translateX(-50%) scale(0.8);
                    opacity: 0;
                }
                50% {
                    transform: translateX(-50%) scale(1.2);
                    opacity: 1;
                }
                100% {
                    transform: translateX(-50%) scale(1) translateY(-10px);
                    opacity: 0;
                }
            }
            
            @keyframes weaponReadyPulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.1); }
            }
            
            @keyframes hudItemSlideIn {
                0% {
                    transform: translateX(50px);
                    opacity: 0;
                }
                100% {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @keyframes weaponSlotSlideIn {
                0% {
                    transform: translateY(30px) rotateX(45deg);
                    opacity: 0;
                }
                100% {
                    transform: translateY(0) rotateX(0deg);
                    opacity: 1;
                }
            }
            
            @keyframes statCardEntrance {
                0% {
                    transform: translateY(50px) rotateX(45deg);
                    opacity: 0;
                }
                100% {
                    transform: translateY(0) rotateX(0deg);
                    opacity: 1;
                }
            }
            
            @keyframes feedItemUpdate {
                0% {
                    background: rgba(0, 255, 136, 0.05);
                    transform: scale(1);
                }
                50% {
                    background: rgba(0, 255, 136, 0.2);
                    transform: scale(1.02);
                }
                100% {
                    background: rgba(0, 255, 136, 0.05);
                    transform: scale(1);
                }
            }
            
            @keyframes logoHoverEffect {
                0% {
                    transform: rotate(0deg) scale(1);
                    filter: drop-shadow(0 0 20px var(--primary-color));
                }
                100% {
                    transform: rotate(360deg) scale(1.2);
                    filter: drop-shadow(0 0 40px var(--primary-color));
                }
            }
        `;
        document.head.appendChild(style);
    }

    // Initialize all systems
    initializeAllSystems() {
        this.addDynamicStyles();
        this.integrateHUDWithForm();
        this.initializeBrandingSection();
        this.startCounterAnimations();
        console.log('🚀 All Enhanced Systems Initialized Successfully!');
    }

    // Initialize ClutchZone Branding Section
    initializeBrandingSection() {
        console.log('🏆 Initializing ClutchZone Branding Section...');
        
        // Animate branding section entrance
        this.animateBrandingEntrance();
        
        // Setup activity feed updates
        this.setupActivityFeed();
        
        // Initialize logo animations
        this.setupLogoAnimations();
    }

    animateBrandingEntrance() {
        const brandingSection = document.querySelector('.clutchzone-branding-section');
        if (!brandingSection) return;

        // Add staggered animations for stat cards
        const statCards = document.querySelectorAll('.stat-card');
        statCards.forEach((card, index) => {
            setTimeout(() => {
                card.style.animation = `statCardEntrance 0.8s ease-out both`;
            }, 1000 + (index * 200));
        });

        // Animate activity feed items
        const feedItems = document.querySelectorAll('.feed-item');
        feedItems.forEach((item, index) => {
            setTimeout(() => {
                item.style.animation = `feedItemSlideIn 0.5s ease-out both`;
            }, 2000 + (index * 300));
        });
    }

    setupActivityFeed() {
        const activities = [
            { player: 'ProGamer_X', action: 'won', tournament: 'Valorant Championship' },
            { player: 'EliteSniper', action: 'joined', tournament: 'CS2 Tournament' },
            { player: 'ChessKing', action: 'leads', tournament: 'Strategy Masters' },
            { player: 'TacticalAce', action: 'qualified', tournament: 'Elite League' },
            { player: 'GameMaster', action: 'defeated', tournament: 'Boss Battle' },
            { player: 'ClutchLord', action: 'achieved', tournament: 'Perfect Score' }
        ];

        let activityIndex = 0;
        
        // Update activity feed every 5 seconds
        setInterval(() => {
            const feedItems = document.querySelectorAll('.feed-item');
            if (feedItems.length > 0) {
                const randomIndex = Math.floor(Math.random() * feedItems.length);
                const newActivity = activities[activityIndex % activities.length];
                
                const item = feedItems[randomIndex];
                const playerNameEl = item.querySelector('.player-name');
                const actionEl = item.querySelector('.action');
                const tournamentEl = item.querySelector('.tournament');
                
                if (playerNameEl && actionEl && tournamentEl) {
                    playerNameEl.textContent = newActivity.player;
                    actionEl.textContent = newActivity.action;
                    tournamentEl.textContent = newActivity.tournament;
                    
                    // Add update animation
                    item.style.animation = 'feedItemUpdate 0.5s ease-out';
                }
                
                activityIndex++;
            }
        }, 5000);
    }

    setupLogoAnimations() {
        const logo = document.querySelector('.brand-logo-main');
        if (!logo) return;

        // Add hover effects
        logo.addEventListener('mouseenter', () => {
            logo.style.animation = 'logoHoverEffect 0.5s ease-out forwards';
        });

        logo.addEventListener('mouseleave', () => {
            logo.style.animation = 'logoRotate 10s linear infinite';
        });
    }

    // Counter Animation System
    startCounterAnimations() {
        const counters = document.querySelectorAll('.counter-animation');
        
        counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-target')) || parseInt(counter.textContent);
            const duration = 2000; // 2 seconds
            const increment = target / (duration / 50);
            let current = 0;

            const updateCounter = () => {
                current += increment;
                if (current >= target) {
                    current = target;
                    counter.textContent = target.toLocaleString();
                    clearInterval(counterInterval);
                } else {
                    counter.textContent = Math.floor(current).toLocaleString();
                }
            };

            // Start counter after a delay
            setTimeout(() => {
                const counterInterval = setInterval(updateCounter, 50);
            }, 1500);
        });
    }

    // Call initialization
    startSystemSequence() {
        // Call parent method if exists
        if (super.startSystemSequence) {
            super.startSystemSequence();
        }
        
        // Add our new systems
        setTimeout(() => {
            this.initializeAllSystems();
        }, 1000);
    }
    
    /**
     * Initialize Chess Animation Box
     */
    initializeChessAnimationBox() {
        console.log('♔ Initializing Chess Animation Box');
        
        const chessBox = document.querySelector('.chess-animation-box');
        if (!chessBox) return;
        
        // Initialize chess piece movements
        this.startChessPieceAnimations();
        
        // Initialize chess timer countdown
        this.startChessTimer();
        
        // Initialize move indicators
        this.startMoveIndicators();
        
        // Initialize player status updates
        this.updatePlayerStatus();
        
        console.log('♔ Chess Animation Box initialized successfully');
    }
    
    /**
     * Start Chess Piece Animations
     */
    startChessPieceAnimations() {
        const pieces = document.querySelectorAll('.chess-piece-icon');
        
        pieces.forEach((piece, index) => {
            // Add random delay for more natural movement
            const delay = Math.random() * 2000;
            
            setTimeout(() => {
                piece.style.animation = `${piece.classList.contains('king') ? 'kingMajestic' : 
                                        piece.classList.contains('queen') ? 'queenPower' :
                                        piece.classList.contains('rook') ? 'rookSolid' :
                                        piece.classList.contains('bishop') ? 'bishopDiagonal' :
                                        piece.classList.contains('knight') ? 'knightJump' :
                                        'pawnMarch'} ${3 + Math.random() * 2}s ease-in-out infinite`;
            }, delay);
        });
    }
    
    /**
     * Start Chess Timer Countdown
     */
    startChessTimer() {
        const whiteTimer = document.querySelector('.timer-white');
        const blackTimer = document.querySelector('.timer-black');
        
        if (!whiteTimer || !blackTimer) return;
        
        let whiteTime = 330; // 5:30 in seconds
        let blackTime = 255; // 4:15 in seconds
        let activePlayer = 'white';
        
        const updateTimer = () => {
            // Update white timer
            const whiteMinutes = Math.floor(whiteTime / 60);
            const whiteSeconds = whiteTime % 60;
            whiteTimer.textContent = `${whiteMinutes.toString().padStart(2, '0')}:${whiteSeconds.toString().padStart(2, '0')}`;
            
            // Update black timer
            const blackMinutes = Math.floor(blackTime / 60);
            const blackSeconds = blackTime % 60;
            blackTimer.textContent = `${blackMinutes.toString().padStart(2, '0')}:${blackSeconds.toString().padStart(2, '0')}`;
            
            // Countdown active player's time
            if (activePlayer === 'white' && whiteTime > 0) {
                whiteTime--;
                if (whiteTime % 30 === 0) { // Switch every 30 seconds for demo
                    activePlayer = 'black';
                    this.updateTurnIndicator('black');
                }
            } else if (activePlayer === 'black' && blackTime > 0) {
                blackTime--;
                if (blackTime % 25 === 0) { // Switch every 25 seconds for demo
                    activePlayer = 'white';
                    this.updateTurnIndicator('white');
                }
            }
        };
        
        // Update every second
        setInterval(updateTimer, 1000);
    }
    
    /**
     * Update Turn Indicator
     */
    updateTurnIndicator(player) {
        const indicator = document.querySelector('.turn-indicator');
        const statusText = document.querySelector('.status-text');
        
        if (indicator && statusText) {
            indicator.className = `turn-indicator ${player}-turn`;
            statusText.textContent = `${player.charAt(0).toUpperCase() + player.slice(1)}'s Turn`;
        }
    }
    
    /**
     * Start Move Indicators Animation
     */
    startMoveIndicators() {
        const indicators = document.querySelectorAll('.move-indicator');
        
        indicators.forEach((indicator, index) => {
            setTimeout(() => {
                indicator.classList.add('active');
                
                // Remove active class after some time and reactivate randomly
                setTimeout(() => {
                    indicator.classList.remove('active');
                    
                    // Reactivate randomly
                    const randomDelay = Math.random() * 5000 + 3000;
                    setTimeout(() => {
                        if (Math.random() > 0.5) {
                            indicator.classList.add('active');
                        }
                    }, randomDelay);
                }, 2000 + Math.random() * 3000);
            }, index * 1000);
        });
    }
    
    /**
     * Update Player Status
     */
    updatePlayerStatus() {
        const statusUpdates = [
            { player: 'white', name: 'GrandMaster_X', elo: '2,450' },
            { player: 'white', name: 'ProChess_X', elo: '2,465' },
            { player: 'white', name: 'ElitePlayer_X', elo: '2,440' },
            { player: 'black', name: 'ChessKing_Y', elo: '2,380' },
            { player: 'black', name: 'StrategyMaster_Y', elo: '2,395' },
            { player: 'black', name: 'TacticalGenius_Y', elo: '2,375' }
        ];
        
        let updateIndex = 0;
        
        setInterval(() => {
            const update = statusUpdates[updateIndex];
            const playerElement = document.querySelector(`.${update.player}-player .player-name`);
            const eloElement = document.querySelector(`.${update.player}-player .player-elo`);
            
            if (playerElement && eloElement) {
                playerElement.textContent = update.name;
                eloElement.textContent = `${update.elo} ELO`;
                
                // Add update flash effect
                playerElement.style.animation = 'chessTitleGlow 0.5s ease-in-out';
                setTimeout(() => {
                    playerElement.style.animation = '';
                }, 500);
            }
            
            updateIndex = (updateIndex + 1) % statusUpdates.length;
        }, 15000); // Update every 15 seconds
    }
}
}

// Global Functions
function redirectToLogin() {
    // Create transition effect before redirect
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
        z-index: 100000;
        opacity: 0;
        transition: opacity 0.5s ease;
    `;
    
    document.body.appendChild(overlay);
    
    setTimeout(() => {
        overlay.style.opacity = '1';
    }, 100);
    
    setTimeout(() => {
        window.location.href = '../login/login.html';
    }, 600);
}

// Initialize the Enhanced Register System when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new EnhancedRegisterSystem();
});

// Additional event listeners for enhanced functionality
window.addEventListener('load', () => {
    // Trigger final loading effects
    console.log('🏆 ClutchZone Register - All Systems Operational!');
});

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnhancedRegisterSystem;
}
