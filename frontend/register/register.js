// ClutchZone - Register Module
// Handles user registration with gamification, 3D effects, and real-time validation

class RegisterManager {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.trophy = null;
        this.form = null;
        this.isSubmitting = false;
        this.soundManager = window.soundManager || window.SoundManager;
        this.utils = window.utils;
        
        this.init();
    }

    init() {
        // Initialize Three.js scene
        this.initThreeJS();
        
        // Initialize form handling
        this.initFormHandling();
        
        // Initialize animations
        this.initAnimations();
        
        // Initialize password strength checker
        this.initPasswordStrength();
        
        // Initialize XP preview animation
        this.initXPPreview();
    }

    initThreeJS() {
        const canvas = document.getElementById('trophy-canvas');
        if (!canvas) return;

        // Scene setup
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: canvas,
            alpha: true, 
            antialias: true 
        });
        
        this.renderer.setSize(300, 300);
        this.renderer.setClearColor(0x000000, 0);
        this.camera.position.z = 5;

        // Lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 0.8);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffd700, 1);
        directionalLight.position.set(5, 5, 5);
        this.scene.add(directionalLight);

        const pointLight = new THREE.PointLight(0x00ffff, 1, 100);
        pointLight.position.set(0, 0, 10);
        this.scene.add(pointLight);

        // Create trophy
        this.createTrophy();
        
        // Start render loop
        this.animate();
    }

    createTrophy() {
        // Trophy cup
        const cupGeometry = new THREE.ConeGeometry(0.8, 1.5, 8);
        const cupMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xffd700,
            shininess: 100,
            transparent: true,
            opacity: 0.9
        });
        
        this.trophy = new THREE.Mesh(cupGeometry, cupMaterial);
        this.trophy.position.set(0, 0.5, 0);
        this.scene.add(this.trophy);

        // Trophy base
        const baseGeometry = new THREE.CylinderGeometry(1, 1, 0.3, 16);
        const baseMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x333333,
            shininess: 50
        });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.set(0, -0.5, 0);
        this.scene.add(base);

        // Trophy handles
        const handleGeometry = new THREE.TorusGeometry(0.3, 0.05, 8, 16);
        const handleMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xffd700,
            shininess: 100
        });
        
        const leftHandle = new THREE.Mesh(handleGeometry, handleMaterial);
        leftHandle.position.set(-0.8, 0.5, 0);
        leftHandle.rotation.z = Math.PI / 2;
        this.scene.add(leftHandle);
        
        const rightHandle = new THREE.Mesh(handleGeometry, handleMaterial);
        rightHandle.position.set(0.8, 0.5, 0);
        rightHandle.rotation.z = Math.PI / 2;
        this.scene.add(rightHandle);

        // Floating particles around trophy
        this.createParticles();
    }

    createParticles() {
        const particleGeometry = new THREE.SphereGeometry(0.02, 8, 8);
        const particleMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x00ffff,
            transparent: true,
            opacity: 0.8
        });

        for (let i = 0; i < 20; i++) {
            const particle = new THREE.Mesh(particleGeometry, particleMaterial);
            particle.position.set(
                (Math.random() - 0.5) * 4,
                (Math.random() - 0.5) * 4,
                (Math.random() - 0.5) * 4
            );
            particle.userData = {
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 0.02,
                    (Math.random() - 0.5) * 0.02,
                    (Math.random() - 0.5) * 0.02
                ),
                originalPosition: particle.position.clone()
            };
            this.scene.add(particle);
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        if (this.trophy) {
            // Rotate trophy
            this.trophy.rotation.y += 0.02;
            
            // Float up and down
            this.trophy.position.y = 0.5 + Math.sin(Date.now() * 0.003) * 0.2;
            
            // Subtle scale pulsing
            const scale = 1 + Math.sin(Date.now() * 0.005) * 0.05;
            this.trophy.scale.set(scale, scale, scale);
        }

        // Animate particles
        this.scene.children.forEach(child => {
            if (child.userData && child.userData.velocity) {
                child.position.add(child.userData.velocity);
                
                // Reset particle if it goes too far
                if (child.position.distanceTo(child.userData.originalPosition) > 3) {
                    child.position.copy(child.userData.originalPosition);
                }
            }
        });

        this.renderer.render(this.scene, this.camera);
    }

    initFormHandling() {
        this.form = document.getElementById('registerForm');
        if (!this.form) return;

        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Real-time validation
        const inputs = this.form.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearFieldError(input));
        });

        // Username availability check
        const usernameInput = document.getElementById('username');
        if (usernameInput) {
            usernameInput.addEventListener('input', 
                ClutchZone.utils.debounce((e) => this.checkUsernameAvailability(e.target.value), 500)
            );
        }

        // Password confirmation
        const passwordInput = document.getElementById('password');
        const confirmPasswordInput = document.getElementById('confirmPassword');
        if (confirmPasswordInput) {
            confirmPasswordInput.addEventListener('input', () => {
                this.validatePasswordMatch(passwordInput.value, confirmPasswordInput.value);
            });
        }
    }

    initAnimations() {
        // Animate form elements on load
        gsap.from('.register-card', {
            duration: 1,
            y: 50,
            opacity: 0,
            ease: 'power2.out'
        });

        gsap.from('.xp-preview', {
            duration: 1,
            scale: 0.8,
            opacity: 0,
            delay: 0.3,
            ease: 'back.out(1.7)'
        });

        // Animate form groups
        gsap.from('.form-group', {
            duration: 0.8,
            y: 30,
            opacity: 0,
            stagger: 0.1,
            delay: 0.5,
            ease: 'power2.out'
        });
    }

    initPasswordStrength() {
        const passwordInput = document.getElementById('password');
        const strengthProgress = document.getElementById('strength-progress');
        const strengthText = document.getElementById('strength-text');

        if (!passwordInput || !strengthProgress || !strengthText) return;

        passwordInput.addEventListener('input', (e) => {
            const password = e.target.value;
            const strength = this.calculatePasswordStrength(password);
            
            strengthProgress.className = `strength-progress ${strength.level}`;
            strengthText.className = `strength-text ${strength.level}`;
            strengthText.textContent = `Password Strength: ${strength.text}`;
        });
    }

    calculatePasswordStrength(password) {
        let score = 0;
        
        if (password.length >= 8) score += 1;
        if (password.length >= 12) score += 1;
        if (/[a-z]/.test(password)) score += 1;
        if (/[A-Z]/.test(password)) score += 1;
        if (/\d/.test(password)) score += 1;
        if (/[^a-zA-Z\d]/.test(password)) score += 1;

        const levels = {
            0: { level: 'weak', text: 'Very Weak' },
            1: { level: 'weak', text: 'Weak' },
            2: { level: 'fair', text: 'Fair' },
            3: { level: 'fair', text: 'Fair' },
            4: { level: 'good', text: 'Good' },
            5: { level: 'good', text: 'Good' },
            6: { level: 'strong', text: 'Strong' }
        };

        return levels[score] || levels[0];
    }

    initXPPreview() {
        const previewXP = document.getElementById('preview-xp');
        if (!previewXP) return;

        // Animate XP bar as user fills form
        let progress = 0;
        const updateXPPreview = () => {
            const inputs = this.form.querySelectorAll('input[required], select[required]');
            const filledInputs = Array.from(inputs).filter(input => input.value.trim() !== '');
            progress = (filledInputs.length / inputs.length) * 100;
            
            gsap.to(previewXP, {
                duration: 0.5,
                width: `${progress}%`,
                ease: 'power2.out'
            });
        };

        // Update on input changes
        this.form.addEventListener('input', updateXPPreview);
        this.form.addEventListener('change', updateXPPreview);
    }

    async checkUsernameAvailability(username) {
        if (!username || username.length < 3) return;

        try {
            const response = await ClutchZone.api('/auth/check-username', {
                method: 'POST',
                body: { username }
            });

            const usernameInput = document.getElementById('username');
            const errorElement = document.getElementById('username-error');

            if (response.available) {
                usernameInput.classList.add('success');
                usernameInput.classList.remove('error');
                errorElement.classList.remove('show');
            } else {
                usernameInput.classList.add('error');
                usernameInput.classList.remove('success');
                errorElement.textContent = 'Username is already taken';
                errorElement.classList.add('show');
            }
        } catch (error) {
            console.error('Username check failed:', error);
        }
    }

    validateField(field) {
        const rules = {
            username: {
                required: true,
                type: 'username',
                label: 'Username'
            },
            email: {
                required: true,
                type: 'email',
                label: 'Email'
            },
            password: {
                required: true,
                type: 'password',
                label: 'Password'
            },
            confirmPassword: {
                required: true,
                validate: (value) => {
                    const password = document.getElementById('password').value;
                    return value === password ? null : 'Passwords do not match';
                }
            },
            favoriteGame: {
                required: true,
                label: 'Favorite Game'
            },
            terms: {
                required: true,
                validate: (value) => value ? null : 'You must agree to the terms'
            }
        };

        const rule = rules[field.name];
        if (!rule) return;

        const formData = { [field.name]: field.type === 'checkbox' ? field.checked : field.value };
        const errors = ClutchZone.validation.validateForm(formData, { [field.name]: rule });

        if (errors[field.name]) {
            field.classList.add('error');
            field.classList.remove('success');
            const errorElement = document.getElementById(`${field.name}-error`);
            if (errorElement) {
                errorElement.textContent = errors[field.name];
                errorElement.classList.add('show');
            }
        } else {
            field.classList.add('success');
            field.classList.remove('error');
            this.clearFieldError(field);
        }
    }

    validatePasswordMatch(password, confirmPassword) {
        const confirmField = document.getElementById('confirmPassword');
        const errorElement = document.getElementById('confirmPassword-error');

        if (confirmPassword && password !== confirmPassword) {
            confirmField.classList.add('error');
            confirmField.classList.remove('success');
            errorElement.textContent = 'Passwords do not match';
            errorElement.classList.add('show');
        } else if (confirmPassword) {
            confirmField.classList.add('success');
            confirmField.classList.remove('error');
            errorElement.classList.remove('show');
        }
    }

    clearFieldError(field) {
        const errorElement = document.getElementById(`${field.name}-error`);
        if (errorElement) {
            errorElement.classList.remove('show');
        }
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        if (this.isSubmitting) return;

        const formData = new FormData(this.form);
        const data = {
            username: formData.get('username'),
            email: formData.get('email'),
            password: formData.get('password'),
            confirmPassword: formData.get('confirmPassword'),
            favoriteGame: formData.get('favoriteGame'),
            terms: formData.get('terms') === 'on',
            notifications: formData.get('notifications') === 'on'
        };

        // Validate all fields
        const rules = {
            username: { required: true, type: 'username', label: 'Username' },
            email: { required: true, type: 'email', label: 'Email' },
            password: { required: true, type: 'password', label: 'Password' },
            confirmPassword: { 
                required: true, 
                validate: (value) => value === data.password ? null : 'Passwords do not match'
            },
            favoriteGame: { required: true, label: 'Favorite Game' },
            terms: { 
                required: true, 
                validate: (value) => value ? null : 'You must agree to the terms'
            }
        };

        const errors = ClutchZone.validation.validateForm(data, rules);

        if (Object.keys(errors).length > 0) {
            ClutchZone.validation.displayFormErrors(errors);
            this.playSound('error');
            return;
        }

        this.isSubmitting = true;
        const submitButton = this.form.querySelector('button[type="submit"]');
        
        // Show loading state
        submitButton.classList.add('loading');
        this.playSound('click');

        try {
            const response = await ClutchZone.api('/auth/register', {
                method: 'POST',
                body: data
            });

            // Success animation
            this.showSuccessAnimation(response);
            
        } catch (error) {
            console.error('Registration failed:', error);
            ClutchZone.notifications.show(error.message || 'Registration failed. Please try again.', 'error');
            this.playSound('error');
        } finally {
            this.isSubmitting = false;
            submitButton.classList.remove('loading');
        }
    }

    showSuccessAnimation(response) {
        this.playSound('success');
        
        // Store user data for welcome message
        const userData = {
            username: response.user?.username || 'New Player',
            email: response.user?.email || '',
            xp: response.user?.xp || 1000,
            level: response.user?.level || 1
        };
        
        // Store in localStorage for welcome message
        localStorage.setItem('userData', JSON.stringify(userData));
        localStorage.setItem('authToken', response.access_token);
        
        // Animate form disappearing
        gsap.to('.register-form', {
            duration: 0.5,
            opacity: 0,
            y: -20,
            ease: 'power2.out'
        });

        // Show success modal
        setTimeout(() => {
            const modal = document.getElementById('successModal');
            modal.classList.add('show');
            
            // Animate XP gain
            const modalXP = document.getElementById('modal-xp');
            gsap.fromTo(modalXP, 
                { width: '0%' },
                { 
                    width: '100%', 
                    duration: 2,
                    ease: 'power2.out',
                    delay: 0.5
                }
            );

            // Confetti animation
            this.createConfetti();
            
            // Show welcome message after success modal
            setTimeout(() => {
                if (window.welcomeMessage) {
                    welcomeMessage.showForNewUser(userData);
                }
            }, 2000);
            
            // Auto-redirect after 8 seconds (increased to allow for welcome message)
            setTimeout(() => {
                this.redirectToLogin();
            }, 8000);
        }, 500);
    }

    createConfetti() {
        const colors = ['#00ffff', '#ff6b35', '#ffd700', '#00ff88'];
        const confettiCount = 50;

        for (let i = 0; i < confettiCount; i++) {
            const confetti = document.createElement('div');
            confetti.style.cssText = `
                position: fixed;
                width: 8px;
                height: 8px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                border-radius: 50%;
                pointer-events: none;
                z-index: 10001;
                top: 50%;
                left: 50%;
            `;

            document.body.appendChild(confetti);

            gsap.to(confetti, {
                duration: 3,
                x: (Math.random() - 0.5) * 1000,
                y: (Math.random() - 0.5) * 1000,
                rotation: Math.random() * 360,
                opacity: 0,
                ease: 'power2.out',
                onComplete: () => confetti.remove()
            });
        }
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
            } else if (window.utils && typeof window.utils.playSound === 'function') {
                window.utils.playSound(soundName);
            }
        } catch (error) {
            console.warn('Sound play failed:', error);
        }
    }

    redirectToLogin() {
        this.playSound('click');
        setTimeout(() => {
            window.location.href = '../login/login.html';
        }, 300);
    }
}

// Global function for modal button
function redirectToLogin() {
    if (window.registerManager) {
        window.registerManager.redirectToLogin();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.registerManager = new RegisterManager();
});

// Handle window resize for Three.js
window.addEventListener('resize', () => {
    if (window.registerManager && window.registerManager.renderer) {
        window.registerManager.renderer.setSize(300, 300);
    }
});
