// Privacy Policy JavaScript - Ultra Advanced Version
class PrivacyPage {
    constructor() {
        this.particleSystem = null;
        this.glitchTimers = [];
        this.matrixCanvas = null;
        this.init();
    }

    init() {
        this.initializeNavbar();
        this.setupSmoothScrolling();
        this.initializeAdvancedAnimations();
        this.setupUltraInteractions();
        this.createParticleSystem();
        this.initializeMatrixRain();
        this.setupAdvancedHoverEffects();
        this.initializeGlitchEffects();
        this.setupPerformanceOptimizations();
    }

    async initializeNavbar() {
        try {
            const response = await fetch('../components/navbar.html');
            const navbarHTML = await response.text();
            document.getElementById('navbar-container').innerHTML = navbarHTML;
            
            // Initialize navbar functionality
            if (window.initializeAdvancedNavbar) {
                window.initializeAdvancedNavbar();
            }
        } catch (error) {
            console.error('Failed to load navbar:', error);
        }
    }

    setupSmoothScrolling() {
        // Smooth scrolling for navigation links
        document.querySelectorAll('.content-nav a[href^="#"]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                    
                    // Update active link
                    document.querySelectorAll('.content-nav a').forEach(l => l.classList.remove('active'));
                    link.classList.add('active');
                }
            });
        });

        // Update active link on scroll
        window.addEventListener('scroll', () => {
            const sections = document.querySelectorAll('.content-section');
            const navLinks = document.querySelectorAll('.content-nav a');
            
            let current = '';
            sections.forEach(section => {
                const sectionTop = section.offsetTop - 120;
                if (window.scrollY >= sectionTop) {
                    current = section.getAttribute('id');
                }
            });

            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${current}`) {
                    link.classList.add('active');
                }
            });
        });
    }

    initializeAdvancedAnimations() {
        // GSAP animations with ultra-advanced effects
        gsap.registerPlugin(ScrollTrigger);

        // Ultra-advanced hero animations with 3D transforms
        const heroTimeline = gsap.timeline();
        
        heroTimeline
            .from('.hero-icon', {
                duration: 2,
                scale: 0,
                rotation: 720,
                z: -1000,
                transformPerspective: 1000,
                ease: 'elastic.out(1, 0.5)',
                onComplete: () => this.startHeroFloating()
            })
            .from('.privacy-hero h1', {
                duration: 1.2,
                y: 100,
                opacity: 0,
                rotationX: 90,
                transformOrigin: 'center bottom',
                ease: 'power3.out',
                onStart: () => this.typeWriterEffect('.privacy-hero h1')
            }, '-=1')
            .from('.privacy-hero p', {
                duration: 1,
                y: 50,
                opacity: 0,
                scale: 0.8,
                ease: 'back.out(1.7)'
            }, '-=0.5')
            .from('.last-updated', {
                duration: 1,
                scale: 0,
                rotation: 360,
                opacity: 0,
                ease: 'elastic.out(1, 0.8)'
            }, '-=0.3');

        // Ultra-advanced section animations with staggered effects
        gsap.utils.toArray('.content-section').forEach((section, index) => {
            const sectionTl = gsap.timeline({
                scrollTrigger: {
                    trigger: section,
                    start: 'top 80%',
                    end: 'bottom 20%',
                    toggleActions: 'play none none reverse',
                    onEnter: () => this.triggerSectionEffects(section),
                    scrub: 1
                }
            });

            sectionTl
                .from(section, {
                    duration: 1,
                    y: 100,
                    opacity: 0,
                    rotationX: 45,
                    transformPerspective: 1000,
                    ease: 'power3.out'
                })
                .from(section.querySelectorAll('h2'), {
                    duration: 0.8,
                    x: -100,
                    opacity: 0,
                    ease: 'power2.out'
                }, '-=0.5')
                .from(section.querySelectorAll('p'), {
                    duration: 0.6,
                    y: 30,
                    opacity: 0,
                    stagger: 0.1,
                    ease: 'power2.out'
                }, '-=0.3');
        });

        // Ultra-advanced card animations with 3D transforms
        gsap.utils.toArray('.info-card, .sharing-card, .rights-item, .security-item, .contact-item').forEach((card, index) => {
            gsap.set(card, { transformPerspective: 1000 });
            
            gsap.from(card, {
                scrollTrigger: {
                    trigger: card,
                    start: 'top 90%',
                    toggleActions: 'play none none reverse'
                },
                duration: 0.8,
                y: 50,
                opacity: 0,
                rotationY: 45,
                scale: 0.8,
                delay: index * 0.1,
                ease: 'back.out(1.7)',
                onComplete: () => this.addCardFloating(card)
            });
        });

        // Navigation animations with ultra-advanced effects
        gsap.utils.toArray('.content-nav li').forEach((item, index) => {
            gsap.from(item, {
                duration: 0.6,
                x: -50,
                opacity: 0,
                delay: index * 0.1,
                ease: 'power2.out'
            });
        });

        // Usage items with advanced slide-in effects
        gsap.utils.toArray('.usage-item').forEach((item, index) => {
            gsap.from(item, {
                scrollTrigger: {
                    trigger: item,
                    start: 'top 85%',
                    toggleActions: 'play none none reverse'
                },
                duration: 0.8,
                x: index % 2 === 0 ? -100 : 100,
                opacity: 0,
                rotation: index % 2 === 0 ? -10 : 10,
                delay: index * 0.2,
                ease: 'power3.out'
            });
        });

        // Background matrix rain animation
        this.setupMatrixRainAnimation();
    }

    setupUltraInteractions() {
        // Ultra-advanced hover effects with 3D transforms
        document.querySelectorAll('.info-card, .sharing-card, .security-item, .rights-item, .contact-item').forEach(card => {
            gsap.set(card, { transformPerspective: 1000 });

            card.addEventListener('mouseenter', (e) => {
                this.createHoverParticles(e.target);
                this.addMagneticEffect(e.target);
                
                gsap.to(card, {
                    duration: 0.4,
                    scale: 1.08,
                    rotationY: 5,
                    rotationX: 5,
                    z: 100,
                    ease: 'power2.out'
                });

                // Add glow effect
                card.style.boxShadow = `
                    0 20px 40px rgba(0, 255, 136, 0.3),
                    0 0 50px rgba(0, 255, 136, 0.2),
                    inset 0 0 20px rgba(0, 255, 136, 0.1)
                `;
            });

            card.addEventListener('mousemove', (e) => {
                this.updateMagneticEffect(e, card);
            });

            card.addEventListener('mouseleave', () => {
                gsap.to(card, {
                    duration: 0.4,
                    scale: 1,
                    rotationY: 0,
                    rotationX: 0,
                    z: 0,
                    ease: 'power2.out'
                });

                card.style.boxShadow = '';
                this.removeMagneticEffect(card);
            });

            // Click ripple effect
            card.addEventListener('click', (e) => {
                this.createRippleEffect(e, card);
                this.triggerClickGlow(card);
            });
        });

        // Ultra-advanced navigation link effects
        document.querySelectorAll('.content-nav a').forEach(link => {
            link.addEventListener('mouseenter', () => {
                this.createLinkTrail(link);
                gsap.to(link, {
                    duration: 0.3,
                    x: 10,
                    color: '#00ff88',
                    ease: 'power2.out'
                });
            });

            link.addEventListener('mouseleave', () => {
                gsap.to(link, {
                    duration: 0.3,
                    x: 0,
                    color: '',
                    ease: 'power2.out'
                });
            });

            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.ultraSmoothScroll(link);
            });
        });

        // Contact method ultra-interactions
        document.querySelectorAll('.contact-item').forEach(method => {
            method.addEventListener('click', (e) => {
                this.handleContactClick(method);
            });
        });

        // Section header glitch effects
        document.querySelectorAll('.content-section h2').forEach(header => {
            header.addEventListener('mouseenter', () => {
                this.triggerGlitchEffect(header);
            });
        });
    }
    // Ultra-Advanced Effect Methods
    createParticleSystem() {
        const particleContainer = document.createElement('div');
        particleContainer.className = 'particle-system';
        particleContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1;
            overflow: hidden;
        `;
        document.body.appendChild(particleContainer);

        for (let i = 0; i < 50; i++) {
            this.createFloatingParticle(particleContainer);
        }
    }

    createFloatingParticle(container) {
        const particle = document.createElement('div');
        particle.className = 'floating-particle';
        particle.style.cssText = `
            position: absolute;
            width: ${2 + Math.random() * 4}px;
            height: ${2 + Math.random() * 4}px;
            background: var(--primary-color);
            border-radius: 50%;
            opacity: ${0.2 + Math.random() * 0.3};
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
        `;

        container.appendChild(particle);

        gsap.to(particle, {
            duration: 10 + Math.random() * 20,
            y: -window.innerHeight - 100,
            x: (Math.random() - 0.5) * 200,
            rotation: 360,
            ease: 'none',
            repeat: -1,
            delay: Math.random() * 10
        });
    }

    createHoverParticles(element) {
        const rect = element.getBoundingClientRect();
        const particleCount = 12;

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'hover-particle';
            particle.style.cssText = `
                position: fixed;
                width: 3px;
                height: 3px;
                background: var(--primary-color);
                border-radius: 50%;
                pointer-events: none;
                z-index: 1000;
                left: ${rect.left + rect.width/2}px;
                top: ${rect.top + rect.height/2}px;
            `;

            document.body.appendChild(particle);

            gsap.to(particle, {
                duration: 1,
                x: (Math.random() - 0.5) * 100,
                y: (Math.random() - 0.5) * 100,
                opacity: 0,
                scale: 0,
                ease: 'power2.out',
                onComplete: () => particle.remove()
            });
        }
    }

    addMagneticEffect(element) {
        element.magneticData = {
            isActive: true,
            bounds: element.getBoundingClientRect()
        };
    }

    updateMagneticEffect(event, element) {
        if (!element.magneticData?.isActive) return;

        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const deltaX = (event.clientX - centerX) * 0.1;
        const deltaY = (event.clientY - centerY) * 0.1;

        gsap.to(element, {
            duration: 0.3,
            x: deltaX,
            y: deltaY,
            ease: 'power2.out'
        });
    }

    removeMagneticEffect(element) {
        if (element.magneticData) {
            element.magneticData.isActive = false;
        }
        
        gsap.to(element, {
            duration: 0.4,
            x: 0,
            y: 0,
            ease: 'elastic.out(1, 0.5)'
        });
    }

    createRippleEffect(event, element) {
        const rect = element.getBoundingClientRect();
        const ripple = document.createElement('div');
        const size = Math.max(rect.width, rect.height) * 1.5;
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;

        ripple.className = 'ripple-effect';
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: radial-gradient(circle, rgba(0, 255, 136, 0.3) 0%, transparent 70%);
            border-radius: 50%;
            transform: scale(0);
            pointer-events: none;
            z-index: 10;
        `;

        element.style.position = 'relative';
        element.style.overflow = 'hidden';
        element.appendChild(ripple);

        gsap.to(ripple, {
            duration: 0.8,
            scale: 1,
            opacity: 0,
            ease: 'power2.out',
            onComplete: () => ripple.remove()
        });
    }

    triggerClickGlow(element) {
        const glow = document.createElement('div');
        glow.className = 'click-glow';
        glow.style.cssText = `
            position: absolute;
            top: -5px;
            left: -5px;
            right: -5px;
            bottom: -5px;
            background: linear-gradient(45deg, var(--primary-color), var(--secondary-color), var(--accent-color));
            border-radius: inherit;
            z-index: -1;
            opacity: 0;
        `;

        element.appendChild(glow);

        gsap.to(glow, {
            duration: 0.5,
            opacity: 0.6,
            yoyo: true,
            repeat: 1,
            ease: 'power2.inOut',
            onComplete: () => glow.remove()
        });
    }

    createLinkTrail(link) {
        const trail = document.createElement('div');
        trail.className = 'link-trail';
        trail.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, var(--primary-color), transparent);
            opacity: 0;
            pointer-events: none;
        `;

        link.style.position = 'relative';
        link.appendChild(trail);

        gsap.to(trail, {
            duration: 0.6,
            opacity: 0.3,
            x: '100%',
            ease: 'power2.out',
            onComplete: () => trail.remove()
        });
    }

    ultraSmoothScroll(link) {
        const targetId = link.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
            // Flash effect
            this.createSectionFlash(targetElement);
            
            // Ultra smooth scroll with GSAP
            gsap.to(window, {
                duration: 1.5,
                scrollTo: {
                    y: targetElement,
                    offsetY: 100
                },
                ease: 'power3.inOut'
            });

            // Update active link with animation
            document.querySelectorAll('.content-nav a').forEach(l => {
                gsap.to(l, {duration: 0.3, color: '', scale: 1});
            });
            
            gsap.to(link, {
                duration: 0.3,
                color: '#00ff88',
                scale: 1.1,
                ease: 'back.out(1.7)'
            });
        }
    }

    createSectionFlash(section) {
        const flash = document.createElement('div');
        flash.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 255, 136, 0.1);
            pointer-events: none;
            z-index: 5;
        `;

        section.style.position = 'relative';
        section.appendChild(flash);

        gsap.to(flash, {
            duration: 1,
            opacity: 0,
            ease: 'power2.out',
            onComplete: () => flash.remove()
        });
    }

    triggerGlitchEffect(element) {
        const glitchClone = element.cloneNode(true);
        glitchClone.className = 'glitch-clone';
        glitchClone.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            color: #ff6b35;
            z-index: -1;
            pointer-events: none;
        `;

        element.style.position = 'relative';
        element.appendChild(glitchClone);

        const glitchTl = gsap.timeline({
            onComplete: () => glitchClone.remove()
        });

        glitchTl
            .to(glitchClone, {duration: 0.1, x: -2, y: 2})
            .to(glitchClone, {duration: 0.1, x: 2, y: -2})
            .to(glitchClone, {duration: 0.1, x: -1, y: 1})
            .to(glitchClone, {duration: 0.1, x: 1, y: -1})
            .to(glitchClone, {duration: 0.1, x: 0, y: 0});
    }

    handleContactClick(contactItem) {
        // Enhanced contact interaction with visual feedback
        this.createContactFeedback(contactItem);
        
        const emailElement = contactItem.querySelector('p');
        if (emailElement) {
            const text = emailElement.textContent;
            if (text.includes('@')) {
                window.open(`mailto:${text}`, '_blank');
            } else if (text.includes('+')) {
                window.open(`tel:${text}`, '_blank');
            }
        }
    }

    createContactFeedback(element) {
        const feedback = document.createElement('div');
        feedback.textContent = 'Copied!';
        feedback.style.cssText = `
            position: absolute;
            top: -30px;
            left: 50%;
            transform: translateX(-50%);
            background: var(--primary-color);
            color: var(--bg-color);
            padding: 5px 10px;
            border-radius: 5px;
            font-size: 12px;
            font-weight: bold;
            pointer-events: none;
            z-index: 1000;
        `;

        element.style.position = 'relative';
        element.appendChild(feedback);

        gsap.fromTo(feedback, 
            {opacity: 0, y: 10},
            {
                duration: 0.3,
                opacity: 1,
                y: 0,
                ease: 'back.out(1.7)'
            }
        );

        gsap.to(feedback, {
            duration: 0.3,
            delay: 1,
            opacity: 0,
            y: -10,
            ease: 'power2.in',
            onComplete: () => feedback.remove()
        });
    }

    // Advanced animation helpers
    startHeroFloating() {
        gsap.to('.hero-icon', {
            duration: 4,
            y: -30,
            rotation: 15,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut'
        });
    }

    typeWriterEffect(selector) {
        const element = document.querySelector(selector);
        if (!element) return;

        const text = element.textContent;
        element.textContent = '';
        element.style.opacity = '1';

        const chars = text.split('');
        chars.forEach((char, index) => {
            setTimeout(() => {
                element.textContent += char;
            }, index * 50);
        });
    }

    triggerSectionEffects(section) {
        // Add floating particles to section
        this.addSectionParticles(section);
    }

    addSectionParticles(section) {
        for (let i = 0; i < 5; i++) {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: absolute;
                width: 3px;
                height: 3px;
                background: var(--primary-color);
                border-radius: 50%;
                opacity: 0.3;
                pointer-events: none;
                top: ${Math.random() * 100}%;
                left: ${Math.random() * 100}%;
            `;

            section.style.position = 'relative';
            section.appendChild(particle);

            gsap.to(particle, {
                duration: 3 + Math.random() * 2,
                y: -50,
                opacity: 0,
                ease: 'power1.out',
                onComplete: () => particle.remove()
            });
        }
    }

    addCardFloating(card) {
        gsap.to(card, {
            duration: 3 + Math.random() * 2,
            y: -5,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
            delay: Math.random() * 2
        });
    }

    initializeMatrixRain() {
        const canvas = document.createElement('canvas');
        canvas.className = 'matrix-rain';
        canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: -2;
            opacity: 0.05;
        `;

        document.body.appendChild(canvas);
        this.matrixCanvas = canvas;

        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const chars = '01ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
        const fontSize = 14;
        const columns = canvas.width / fontSize;
        const drops = Array(Math.floor(columns)).fill(1);

        const draw = () => {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = '#00ff88';
            ctx.font = `${fontSize}px monospace`;

            drops.forEach((y, x) => {
                const char = chars[Math.floor(Math.random() * chars.length)];
                ctx.fillText(char, x * fontSize, y * fontSize);

                if (y * fontSize > canvas.height && Math.random() > 0.975) {
                    drops[x] = 0;
                }
                drops[x]++;
            });
        };

        const interval = setInterval(draw, 35);

        // Cleanup on page unload
        window.addEventListener('beforeunload', () => {
            clearInterval(interval);
        });
    }

    setupAdvancedHoverEffects() {
        // Magnetic cursor effect for interactive elements
        document.querySelectorAll('.info-card, .sharing-card, .security-item, .rights-item, .contact-item, .content-nav a').forEach(element => {
            element.addEventListener('mousemove', (e) => {
                const rect = element.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                
                const deltaX = (e.clientX - centerX) * 0.05;
                const deltaY = (e.clientY - centerY) * 0.05;

                gsap.to(element, {
                    duration: 0.3,
                    rotationX: deltaY,
                    rotationY: deltaX,
                    ease: 'power2.out'
                });
            });

            element.addEventListener('mouseleave', () => {
                gsap.to(element, {
                    duration: 0.5,
                    rotationX: 0,
                    rotationY: 0,
                    ease: 'elastic.out(1, 0.5)'
                });
            });
        });
    }

    initializeGlitchEffects() {
        // Random glitch effects on headers
        setInterval(() => {
            if (Math.random() > 0.95) {
                const headers = document.querySelectorAll('.content-section h2');
                const randomHeader = headers[Math.floor(Math.random() * headers.length)];
                if (randomHeader) {
                    this.triggerGlitchEffect(randomHeader);
                }
            }
        }, 5000);
    }

    setupMatrixRainAnimation() {
        // Additional matrix rain particles
        setInterval(() => {
            this.createMatrixParticle();
        }, 100);
    }

    createMatrixParticle() {
        const particle = document.createElement('div');
        particle.textContent = Math.random() > 0.5 ? '0' : '1';
        particle.style.cssText = `
            position: fixed;
            color: var(--primary-color);
            font-family: monospace;
            font-size: ${10 + Math.random() * 8}px;
            opacity: ${0.2 + Math.random() * 0.3};
            left: ${Math.random() * 100}%;
            top: -20px;
            pointer-events: none;
            z-index: -1;
        `;

        document.body.appendChild(particle);

        gsap.to(particle, {
            duration: 3 + Math.random() * 3,
            y: window.innerHeight + 20,
            opacity: 0,
            ease: 'none',
            onComplete: () => particle.remove()
        });
    }

    setupPerformanceOptimizations() {
        // Optimize animations for performance
        gsap.config({
            force3D: true,
            nullTargetWarn: false
        });

        // Preload critical elements
        document.querySelectorAll('.info-card, .sharing-card, .security-item, .rights-item, .contact-item').forEach(element => {
            element.style.willChange = 'transform, opacity, box-shadow';
        });

        // Cleanup unused particles
        setInterval(() => {
            document.querySelectorAll('.hover-particle, .floating-particle').forEach(particle => {
                if (parseFloat(getComputedStyle(particle).opacity) <= 0.01) {
                    particle.remove();
                }
            });
        }, 10000);
    }
}

// Initialize when DOM is loaded with enhanced loading sequence
document.addEventListener('DOMContentLoaded', () => {
    // Add page loading class
    document.body.classList.add('page-loading');
    
    // Initialize privacy page with delay for smooth entrance
    setTimeout(() => {
        const privacyPage = new PrivacyPage();
        document.body.classList.remove('page-loading');
        document.body.classList.add('page-loaded');
        
        // Trigger entrance animations
        gsap.from('body', {
            duration: 1,
            opacity: 0,
            ease: 'power2.out'
        });
    }, 100);
});

// Handle page visibility changes for performance
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Pause heavy animations when page is hidden
        gsap.globalTimeline.pause();
    } else {
        // Resume animations when page is visible
        gsap.globalTimeline.resume();
    }
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    // Clear all timers and intervals
    gsap.killTweensOf('*');
});
