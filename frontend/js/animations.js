// ClutchZone - Advanced Animations System

class ClutchZoneAnimations {
    constructor() {
        this.isOpeningCeremonyActive = true;
        this.relaxingPopupTimer = null;
        this.init();
    }

    init() {
        this.initOpeningCeremony();
        this.initRelaxingPopup();
        this.initAdvancedAnimations();
        this.initBackgroundEffects();
        this.initMouseTracking();
    }

    // Background Effects System
    initBackgroundEffects() {
        this.createBackgroundParticles();
        this.initDynamicBackground();
    }

    createBackgroundParticles() {
        const particleContainer = document.createElement('div');
        particleContainer.className = 'background-particles';
        document.body.appendChild(particleContainer);

        // Create floating particles
        for (let i = 0; i < 50; i++) {
            const particle = document.createElement('div');
            particle.className = 'bg-particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 15 + 's';
            particle.style.animationDuration = (15 + Math.random() * 10) + 's';
            particleContainer.appendChild(particle);
        }
    }

    initMouseTracking() {
        document.addEventListener('mousemove', (e) => {
            const x = (e.clientX / window.innerWidth) * 100;
            const y = (e.clientY / window.innerHeight) * 100;
            
            document.documentElement.style.setProperty('--mouse-x', x + '%');
            document.documentElement.style.setProperty('--mouse-y', y + '%');
        });
    }

    initDynamicBackground() {
        // Create dynamic color shifts based on time
        setInterval(() => {
            const time = Date.now() * 0.001;
            const hue1 = (time * 10) % 360;
            const hue2 = (time * 15 + 120) % 360;
            
            document.documentElement.style.setProperty('--dynamic-hue-1', hue1);
            document.documentElement.style.setProperty('--dynamic-hue-2', hue2);
        }, 100);
    }

    // Opening Ceremony Animation System
    initOpeningCeremony() {
        const ceremony = document.getElementById('openingCeremony');
        if (!ceremony) return;

        // Show ceremony on page load
        ceremony.style.display = 'flex';
        
        // Initialize canvas animation
        this.initCeremonyCanvas();
        
        // Auto-hide after 6 seconds
        setTimeout(() => {
            this.hideOpeningCeremony();
        }, 6000);

        // Skip button functionality
        const skipBtn = ceremony.querySelector('.skip-btn');
        if (skipBtn) {
            skipBtn.addEventListener('click', () => {
                this.hideOpeningCeremony();
            });
        }

        // Progress bar animation
        this.animateProgressBar();
    }

    initCeremonyCanvas() {
        const canvas = document.getElementById('ceremonyCanvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const particles = [];
        const particleCount = 100;

        // Create particles
        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                size: Math.random() * 3 + 1,
                color: `rgba(${Math.random() > 0.5 ? '0, 255, 136' : '139, 92, 246'}, ${Math.random() * 0.8 + 0.2})`
            });
        }

        // Animation loop
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            particles.forEach(particle => {
                // Update position
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
                ctx.fillStyle = particle.color;
                ctx.fill();

                // Add glow effect
                ctx.shadowBlur = 10;
                ctx.shadowColor = particle.color;
            });

            if (this.isOpeningCeremonyActive) {
                requestAnimationFrame(animate);
            }
        };

        animate();
    }

    animateProgressBar() {
        const progressFill = document.querySelector('.progress-fill');
        const loadingText = document.querySelector('.loading-text');
        
        if (!progressFill || !loadingText) return;

        const messages = [
            'Initializing ClutchZone...',
            'Loading gaming assets...',
            'Connecting to battle servers...',
            'Preparing your experience...',
            'Almost ready!'
        ];

        let messageIndex = 0;
        const messageInterval = setInterval(() => {
            if (messageIndex < messages.length) {
                loadingText.textContent = messages[messageIndex];
                messageIndex++;
            } else {
                clearInterval(messageInterval);
            }
        }, 1000);
    }

    hideOpeningCeremony() {
        const ceremony = document.getElementById('openingCeremony');
        if (!ceremony) return;

        this.isOpeningCeremonyActive = false;
        ceremony.style.animation = 'ceremonyOutro 1s ease-in-out forwards';
        
        setTimeout(() => {
            ceremony.style.display = 'none';
            // Start relaxing popup timer after ceremony ends
            this.startRelaxingTimer();
        }, 1000);
    }

    // Relaxing Animation Popup System
    initRelaxingPopup() {
        const popup = document.getElementById('relaxingPopup');
        if (!popup) return;

        // Close button functionality
        const closeBtn = popup.querySelector('.relaxing-close');
        const okBtn = popup.querySelector('#relaxingOk');
        
        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.hideRelaxingPopup();
            });
        }

        if (okBtn) {
            okBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.hideRelaxingPopup();
            });
        }

        // Click outside to close
        popup.addEventListener('click', (e) => {
            if (e.target === popup) {
                this.hideRelaxingPopup();
            }
        });

        // Escape key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && popup.style.display === 'flex') {
                this.hideRelaxingPopup();
            }
        });
    }

    startRelaxingTimer() {
        // Show relaxing popup every hour (3600000 ms)
        this.relaxingPopupTimer = setInterval(() => {
            this.showRelaxingPopup();
        }, 3600000); // 1 hour interval
    }

    showRelaxingPopup() {
        const popup = document.getElementById('relaxingPopup');
        if (!popup) return;

        popup.style.display = 'flex';
        
        // Start breathing animation
        this.startBreathingGuide();
        
        // Auto-hide after 30 seconds
        setTimeout(() => {
            this.hideRelaxingPopup();
        }, 30000);
    }

    hideRelaxingPopup() {
        const popup = document.getElementById('relaxingPopup');
        if (!popup) return;

        popup.style.display = 'none';
    }

    startBreathingGuide() {
        const breathText = document.querySelector('.breath-text');
        if (!breathText) return;

        const breathSteps = ['Breathe In...', 'Hold...', 'Breathe Out...', 'Hold...'];
        let stepIndex = 0;

        const breathInterval = setInterval(() => {
            breathText.textContent = breathSteps[stepIndex];
            stepIndex = (stepIndex + 1) % breathSteps.length;
        }, 1000);

        // Stop after 20 seconds
        setTimeout(() => {
            clearInterval(breathInterval);
            breathText.textContent = 'Take a moment to relax';
        }, 20000);
    }

    // Advanced Animation Enhancements
    initAdvancedAnimations() {
        this.initHeroVisualEnhancements();
        this.initCTAAnimations();
        this.initDeveloperBattle();
        this.initTournamentDetailsFloat();
        this.initAdvancedHovers();
    }

    // Tournament Details Float Enhanced
    initTournamentDetailsFloat() {
        const tournamentFloat = document.getElementById('tournamentDetailsFloat');
        const tournamentFloat2 = document.getElementById('tournamentDetailsFloat2');
        const closeBtn = document.getElementById('closeTournamentDetails');
        const closeBtn2 = document.getElementById('closeTournamentDetails2');
        const closeUpdate = document.getElementById('closeUpdate');
        
        // Show tournament float after a delay
        setTimeout(() => {
            if (tournamentFloat) {
                tournamentFloat.classList.add('show');
                tournamentFloat.classList.add('enhanced');
            }
        }, 3000);

        // Close button functionality
        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (tournamentFloat) {
                    tournamentFloat.classList.remove('show');
                    setTimeout(() => {
                        tournamentFloat.style.display = 'none';
                    }, 500);
                }
            });
        }

        if (closeBtn2) {
            closeBtn2.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (tournamentFloat2) {
                    tournamentFloat2.classList.remove('show');
                    setTimeout(() => {
                        tournamentFloat2.style.display = 'none';
                    }, 500);
                }
            });
        }

        if (closeUpdate) {
            closeUpdate.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const liveUpdates = document.getElementById('liveUpdates');
                if (liveUpdates) {
                    liveUpdates.style.animation = 'slideOut 0.3s ease-out forwards';
                    setTimeout(() => {
                        liveUpdates.style.display = 'none';
                    }, 300);
                }
            });
        }

        // Auto-update tournament messages
        this.startTournamentUpdates();
    }

    startTournamentUpdates() {
        const updateText = document.getElementById('updateText');
        if (!updateText) return;

        const messages = [
            '🏆 Welcome to ClutchZone Elite Gaming Arena!',
            '🔥 5 new tournaments starting in 10 minutes!',
            '💰 Prize pools updated - Total: ₹2.5L this week!',
            '⚡ New player record: 10,000+ online!',
            '🎮 PUBG Championship finals starting soon!',
            '🏅 Weekly leaderboard rankings updated!',
            '🚀 Join 156 live tournaments now!'
        ];

        let messageIndex = 0;
        setInterval(() => {
            messageIndex = (messageIndex + 1) % messages.length;
            updateText.textContent = messages[messageIndex];
            
            // Add update animation
            updateText.style.animation = 'none';
            setTimeout(() => {
                updateText.style.animation = 'textGlow 0.5s ease-in-out';
            }, 10);
        }, 4000);
    }

    // Advanced Hover Effects System
    initAdvancedHovers() {
        // Add hover classes to interactive elements
        const hoverElements = document.querySelectorAll('.btn, .card, .nav-link, .stat-item');
        hoverElements.forEach(element => {
            element.classList.add('hover-enhanced');
        });

        // Add 3D hover to tournament cards
        const tournamentCards = document.querySelectorAll('.tournament-card');
        tournamentCards.forEach(card => {
            card.addEventListener('mouseenter', (e) => {
                card.style.transform = 'translateY(-10px) scale(1.02) rotateY(2deg)';
            });
            
            card.addEventListener('mouseleave', (e) => {
                card.style.transform = 'translateY(0) scale(1) rotateY(0deg)';
            });
        });

        // Add glow effect to feature cards
        const featureCards = document.querySelectorAll('.feature-card');
        featureCards.forEach(card => {
            card.addEventListener('mouseenter', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                card.style.setProperty('--mouse-x', x + 'px');
                card.style.setProperty('--mouse-y', y + 'px');
            });
        });
    }

    initHeroVisualEnhancements() {
        const heroVisual = document.querySelector('.hero-visual');
        if (!heroVisual) return;

        // Add particle system to hero
        this.createHeroParticles();
        
        // Add interactive effects
        heroVisual.addEventListener('mouseenter', () => {
            heroVisual.style.transform = 'scale(1.02) rotateY(5deg)';
        });

        heroVisual.addEventListener('mouseleave', () => {
            heroVisual.style.transform = 'scale(1) rotateY(0deg)';
        });
    }

    createHeroParticles() {
        const heroVisual = document.querySelector('.hero-visual');
        if (!heroVisual) return;

        // Create floating particles
        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.className = 'hero-particle';
            particle.style.cssText = `
                position: absolute;
                width: 4px;
                height: 4px;
                background: var(--primary-color);
                border-radius: 50%;
                animation: heroParticleFloat ${3 + Math.random() * 2}s ease-in-out infinite;
                animation-delay: ${Math.random() * 3}s;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                opacity: ${0.3 + Math.random() * 0.4};
            `;
            heroVisual.appendChild(particle);
        }
    }

    initCTAAnimations() {
        const ctaSection = document.querySelector('.animated-cta');
        if (!ctaSection) return;

        // Add intersection observer for scroll animations
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, { threshold: 0.2 });

        observer.observe(ctaSection);

        // Enhanced button interactions
        const animatedBtns = document.querySelectorAll('.animated-btn');
        animatedBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.createRippleEffect(e, btn);
            });
        });
    }

    createRippleEffect(event, element) {
        const ripple = element.querySelector('.btn-ripple');
        if (!ripple) return;

        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;

        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.style.opacity = '1';

        setTimeout(() => {
            ripple.style.opacity = '0';
        }, 600);
    }

    initDeveloperBattle() {
        const battleAnimation = document.querySelector('.developer-animation');
        if (!battleAnimation) return;

        // Create battle effects
        this.createBattleEffects();
        
        // Animate battle status
        this.animateBattleStatus();
    }

    createBattleEffects() {
        const battleArena = document.querySelector('.battle-arena');
        if (!battleArena) return;

        // Create sparks and effects
        setInterval(() => {
            const spark = document.createElement('div');
            spark.className = 'battle-spark-dynamic';
            spark.style.cssText = `
                position: absolute;
                width: 2px;
                height: 2px;
                background: var(--secondary-color);
                border-radius: 50%;
                left: ${40 + Math.random() * 20}%;
                top: ${40 + Math.random() * 20}%;
                animation: dynamicSpark 0.5s ease-out forwards;
            `;
            battleArena.appendChild(spark);

            // Remove spark after animation
            setTimeout(() => {
                spark.remove();
            }, 500);
        }, 300);
    }

    animateBattleStatus() {
        const battleStatus = document.querySelector('.battle-status');
        if (!battleStatus) return;

        const statuses = [
            '⚔️ Epic coding battle in progress!',
            '💥 Algsoch lands a critical hit!',
            '🔥 Vicky Kumar counters with brilliant code!',
            '⚡ The battle intensifies!',
            '🏆 Both developers are legendary!'
        ];

        let statusIndex = 0;
        setInterval(() => {
            battleStatus.textContent = statuses[statusIndex];
            statusIndex = (statusIndex + 1) % statuses.length;
        }, 3000);
    }

    // Utility method to add CSS for dynamic elements
    addDynamicStyles() {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes ceremonyOutro {
                0% { opacity: 1; transform: scale(1); }
                100% { opacity: 0; transform: scale(0.8); }
            }

            @keyframes heroParticleFloat {
                0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.3; }
                50% { transform: translateY(-20px) translateX(10px); opacity: 0.8; }
            }

            @keyframes dynamicSpark {
                0% { opacity: 1; transform: scale(1) translate(0, 0); }
                100% { opacity: 0; transform: scale(0.3) translate(${Math.random() * 40 - 20}px, ${Math.random() * 40 - 20}px); }
            }

            .animate-in {
                animation: slideInUp 0.8s ease-out;
            }

            @keyframes slideInUp {
                0% { opacity: 0; transform: translateY(30px); }
                100% { opacity: 1; transform: translateY(0); }
            }
        `;
        document.head.appendChild(style);
    }
}

// Initialize animations when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const animations = new ClutchZoneAnimations();
    animations.addDynamicStyles();
    
    // Initialize enhanced features
    initializeAdvancedParticles();
    initializeAIChat();
    initializeAdvancedHovers();
});

// Enhanced AI Chat Bot functionality
function initializeAIChat() {
    const aiChatBtn = document.getElementById('aiChatBtn');
    const aiChatModal = document.getElementById('aiChatModal');
    const aiModalClose = document.getElementById('aiModalClose');

    if (aiChatBtn && aiChatModal) {
        aiChatBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // Load AI interface
            if (!aiChatModal.dataset.loaded) {
                loadAIInterface();
                aiChatModal.dataset.loaded = 'true';
            }
            
            aiChatModal.classList.add('show');
            document.body.style.overflow = 'hidden';
        });

        if (aiModalClose) {
            aiModalClose.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                closeAIModal();
            });
        }

        // Close on overlay click
        aiChatModal.addEventListener('click', (e) => {
            if (e.target === aiChatModal) {
                closeAIModal();
            }
        });

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && aiChatModal.classList.contains('show')) {
                closeAIModal();
            }
        });
    }
}

function loadAIInterface() {
    // Load AI page content dynamically
    fetch('./ai/ai.html')
        .then(response => response.text())
        .then(html => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const aiContent = doc.querySelector('.ai-chat-container');
            
            if (aiContent) {
                const modalContent = document.querySelector('#aiChatModal .ai-chat-container');
                if (modalContent) {
                    modalContent.innerHTML = aiContent.innerHTML;
                }
            }
            
            // Load AI CSS if not already loaded
            if (!document.querySelector('link[href*="ai.css"]')) {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = './ai/ai.css';
                document.head.appendChild(link);
            }
            
            // Load AI JavaScript if not already loaded
            if (!document.querySelector('script[src*="ai.js"]')) {
                const script = document.createElement('script');
                script.src = './ai/ai.js';
                document.head.appendChild(script);
            }
        })
        .catch(error => {
            console.error('Error loading AI interface:', error);
            // Fallback content
            const modalContent = document.querySelector('#aiChatModal .ai-chat-container');
            if (modalContent) {
                modalContent.innerHTML = `
                    <div class="ai-chat-messages">
                        <div class="ai-message ai-message-bot">
                            <div class="ai-message-avatar">🤖</div>
                            <div class="ai-message-content">
                                <p>Hello! I'm your ClutchZone AI assistant. How can I help you today?</p>
                            </div>
                        </div>
                    </div>
                    <div class="ai-chat-input-container">
                        <input type="text" placeholder="Type your message..." maxlength="500">
                        <button class="ai-send-btn">
                            <i class="fas fa-paper-plane"></i>
                        </button>
                    </div>
                `;
            }
        });
}

function closeAIModal() {
    const aiChatModal = document.getElementById('aiChatModal');
    aiChatModal.classList.remove('show');
    document.body.style.overflow = '';
}

// Advanced Background Particle System V2
function initializeAdvancedParticles() {
    const particleContainer = document.querySelector('.background-particles') || 
                             (() => {
                                 const container = document.createElement('div');
                                 container.className = 'background-particles';
                                 document.body.appendChild(container);
                                 return container;
                             })();

    // Create mouse gradient tracker
    const mouseGradient = document.createElement('div');
    mouseGradient.className = 'mouse-gradient';
    document.body.appendChild(mouseGradient);

    // Enhanced mouse tracking
    let mouseX = 0, mouseY = 0;
    let targetX = 0, targetY = 0;

    document.addEventListener('mousemove', (e) => {
        targetX = e.clientX;
        targetY = e.clientY;
        
        // Update CSS custom properties for advanced effects
        document.documentElement.style.setProperty('--mouse-x', `${(e.clientX / window.innerWidth) * 100}%`);
        document.documentElement.style.setProperty('--mouse-y', `${(e.clientY / window.innerHeight) * 100}%`);
    });

    // Smooth mouse gradient animation
    function animateMouseGradient() {
        mouseX += (targetX - mouseX) * 0.1;
        mouseY += (targetY - mouseY) * 0.1;
        
        mouseGradient.style.left = `${mouseX}px`;
        mouseGradient.style.top = `${mouseY}px`;
        
        requestAnimationFrame(animateMouseGradient);
    }
    animateMouseGradient();

    // Enhanced particle creation
    function createParticle() {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Randomize particle properties
        const startX = Math.random() * window.innerWidth;
        const duration = 15000 + Math.random() * 10000; // 15-25 seconds
        const size = 2 + Math.random() * 4; // 2-6px
        const delay = Math.random() * 5000; // 0-5 second delay
        
        particle.style.left = `${startX}px`;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.setProperty('--duration', `${duration}ms`);
        particle.style.animationDelay = `${delay}ms`;
        
        // Random colors
        const colors = ['var(--primary-color)', 'var(--accent-color)', 'var(--secondary-color)'];
        particle.style.background = colors[Math.floor(Math.random() * colors.length)];
        
        particleContainer.appendChild(particle);
        
        // Remove particle after animation
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, duration + delay);
    }

    // Performance-optimized particle generation
    let particleCount = 0;
    const maxParticles = 30;
    
    function generateParticles() {
        if (particleCount < maxParticles && !document.hidden) {
            createParticle();
            particleCount++;
            
            setTimeout(() => {
                particleCount--;
            }, 20000); // Decrease count after 20 seconds
        }
    }

    // Create initial particles
    for (let i = 0; i < 15; i++) {
        setTimeout(generateParticles, i * 1000);
    }

    // Continuous particle generation
    setInterval(generateParticles, 2000);
    
    // Pause particles when tab is not visible
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            particleContainer.style.display = 'none';
        } else {
            particleContainer.style.display = 'block';
        }
    });
}

// Enhanced Hover Effects System
function initializeAdvancedHovers() {
    // Universal hover effect enhancer
    const hoverElements = document.querySelectorAll(`
        .btn, .card, .feature-pill, .nav-link, .social-link,
        .tournament-card, .leaderboard-card, .status-metric,
        .floating-card, .cta-feature, .game-link, .footer-link,
        .stat-item, .hero-badge, .action-btn, .platform-feature
    `);

    hoverElements.forEach(element => {
        if (!element.classList.contains('hover-enhanced')) {
            element.classList.add('hover-enhanced');
            
            element.addEventListener('mouseenter', (e) => {
                e.target.style.transform = e.target.style.transform || '';
                
                if (!e.target.style.transform.includes('scale')) {
                    e.target.style.transform += ' scale(1.05)';
                }
                
                // Add glow effect for specific elements
                if (e.target.classList.contains('btn') || 
                    e.target.classList.contains('feature-pill') ||
                    e.target.classList.contains('status-metric')) {
                    e.target.style.boxShadow = '0 0 20px rgba(0, 255, 136, 0.3)';
                }
            });

            element.addEventListener('mouseleave', (e) => {
                e.target.style.transform = e.target.style.transform.replace(' scale(1.05)', '');
                if (e.target.style.transform.trim() === '') {
                    e.target.style.transform = '';
                }
                e.target.style.boxShadow = '';
            });
        }
    });

    // Special text hover effects for feature pills and CTA features
    const textElements = document.querySelectorAll('.feature-pill span, .cta-feature span, .footer-link, .nav-link span');
    textElements.forEach(element => {
        element.addEventListener('mouseenter', (e) => {
            e.target.style.color = 'var(--primary-color)';
            e.target.style.textShadow = '0 0 10px rgba(0, 255, 136, 0.5)';
            e.target.style.transition = 'all 0.3s ease';
        });

        element.addEventListener('mouseleave', (e) => {
            e.target.style.color = '';
            e.target.style.textShadow = '';
        });
    });
}

// Handle window resize for canvas
window.addEventListener('resize', () => {
    const canvas = document.getElementById('ceremonyCanvas');
    if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
});
