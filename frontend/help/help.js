// Help Center JavaScript
class HelpCenter {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.helpCube = null;
        this.chatModal = null;
        this.isLoading = false;
        
        this.init();
    }

    init() {
        this.initNavbar();
        this.initThreeJS();
        this.initEventListeners();
        this.initAnimations();
        this.initChat();
    }

    initNavbar() {
        // Load navbar component
        fetch('../components/navbar.html')
            .then(response => response.text())
            .then(html => {
                document.getElementById('navbar').innerHTML = html;
                if (window.AdvancedNavbar) {
                    new AdvancedNavbar();
                }
            })
            .catch(error => console.error('Error loading navbar:', error));
    }

    initThreeJS() {
        const canvas = document.getElementById('help-canvas');
        if (!canvas) return;

        // Scene setup
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: canvas,
            alpha: true,
            antialias: true
        });
        
        this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
        this.renderer.setClearColor(0x000000, 0);
        this.camera.position.z = 5;

        // Lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0x00ffff, 1);
        directionalLight.position.set(5, 5, 5);
        this.scene.add(directionalLight);

        const pointLight = new THREE.PointLight(0xff6b35, 0.8, 100);
        pointLight.position.set(-5, 0, 3);
        this.scene.add(pointLight);

        // Create help visualization
        this.createHelpVisualization();
        
        // Start render loop
        this.animate();
    }

    createHelpVisualization() {
        // Create floating help icons
        const iconGeometry = new THREE.SphereGeometry(0.3, 16, 16);
        const icons = [
            { color: 0x00ffff, position: [0, 0, 0] },
            { color: 0xff6b35, position: [2, 1, -1] },
            { color: 0xffd700, position: [-2, -1, 1] },
            { color: 0x00ff88, position: [1, -2, 0] },
            { color: 0xff4757, position: [-1, 2, -2] }
        ];

        icons.forEach((icon, index) => {
            const material = new THREE.MeshPhongMaterial({ 
                color: icon.color,
                shininess: 100,
                transparent: true,
                opacity: 0.8
            });
            
            const mesh = new THREE.Mesh(iconGeometry, material);
            mesh.position.set(...icon.position);
            mesh.userData = { 
                originalY: icon.position[1],
                rotationSpeed: 0.01 + index * 0.002,
                floatSpeed: 0.005 + index * 0.001
            };
            this.scene.add(mesh);
        });

        // Create connecting lines
        const lineGeometry = new THREE.BufferGeometry();
        const lineMaterial = new THREE.LineBasicMaterial({ 
            color: 0x00ffff,
            transparent: true,
            opacity: 0.3
        });

        const points = [];
        for (let i = 0; i < icons.length; i++) {
            const current = icons[i].position;
            const next = icons[(i + 1) % icons.length].position;
            points.push(new THREE.Vector3(...current));
            points.push(new THREE.Vector3(...next));
        }

        lineGeometry.setFromPoints(points);
        const line = new THREE.Line(lineGeometry, lineMaterial);
        this.scene.add(line);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        // Animate help icons
        this.scene.children.forEach(child => {
            if (child.userData && child.userData.rotationSpeed) {
                child.rotation.y += child.userData.rotationSpeed;
                child.rotation.x += child.userData.rotationSpeed * 0.5;
                
                // Floating animation
                child.position.y = child.userData.originalY + Math.sin(Date.now() * child.userData.floatSpeed) * 0.5;
            }
        });

        this.renderer.render(this.scene, this.camera);
    }

    initEventListeners() {
        // Quick action buttons
        document.querySelectorAll('.action-card').forEach(card => {
            card.addEventListener('click', () => {
                const action = card.dataset.action;
                this.handleQuickAction(action);
            });
        });

        // Category cards
        document.querySelectorAll('.category-card').forEach(card => {
            card.addEventListener('click', () => {
                const category = card.dataset.category;
                this.handleCategorySelect(category);
            });
        });

        // Article cards
        document.querySelectorAll('.article-card').forEach(card => {
            card.addEventListener('click', () => {
                const article = card.dataset.article;
                this.handleArticleSelect(article);
            });
        });

        // Video cards
        document.querySelectorAll('.video-card').forEach(card => {
            card.addEventListener('click', () => {
                const video = card.dataset.video;
                this.handleVideoSelect(video);
            });
        });

        // Search functionality
        const searchInput = document.getElementById('helpSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });
        }

        // Modal close
        document.addEventListener('click', (e) => {
            if (e.target.matches('.close')) {
                this.closeModal();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });
    }

    initAnimations() {
        // Animate sections on scroll
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateSection(entry.target);
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.help-categories, .popular-articles, .video-tutorials').forEach(section => {
            observer.observe(section);
        });

        // Animate cards on hover
        document.querySelectorAll('.action-card, .category-card, .article-card, .video-card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                gsap.to(card, {
                    duration: 0.3,
                    y: -10,
                    boxShadow: '0 20px 40px rgba(0, 255, 255, 0.3)',
                    ease: 'power2.out'
                });
            });

            card.addEventListener('mouseleave', () => {
                gsap.to(card, {
                    duration: 0.3,
                    y: 0,
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
                    ease: 'power2.out'
                });
            });
        });
    }

    initChat() {
        this.chatModal = document.getElementById('liveChatModal');
        const chatMessages = document.getElementById('chatMessages');
        const chatInput = document.getElementById('chatInput');

        // Initialize chat with welcome message
        this.addChatMessage('ClutchZone Support', 'Hello! How can I help you today?', 'support');

        // Handle Enter key in chat input
        if (chatInput) {
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendMessage();
                }
            });
        }
    }

    handleQuickAction(action) {
        switch (action) {
            case 'live-chat':
                this.openLiveChat();
                break;
            case 'create-ticket':
                this.createTicket();
                break;
            case 'video-guides':
                this.openVideoGuides();
                break;
            case 'community':
                this.openCommunity();
                break;
            default:
                console.log('Unknown action:', action);
        }
    }

    handleCategorySelect(category) {
        // Scroll to category or expand details
        const categoryCard = document.querySelector(`[data-category="${category}"]`);
        if (categoryCard) {
            categoryCard.scrollIntoView({ behavior: 'smooth' });
            
            // Add visual feedback
            gsap.to(categoryCard, {
                duration: 0.3,
                scale: 1.05,
                ease: 'power2.out',
                yoyo: true,
                repeat: 1
            });
        }
    }

    handleArticleSelect(article) {
        // Simulate opening article
        if (window.ClutchZone?.notifications) {
            window.ClutchZone.notifications.show(`Opening article: ${article}`, 'info');
        }
        
        // Add sound effect
        if (window.ClutchZone?.sound) {
            window.ClutchZone.sound.play('click');
        }
    }

    handleVideoSelect(video) {
        // Simulate opening video
        if (window.ClutchZone?.notifications) {
            window.ClutchZone.notifications.show(`Loading video: ${video}`, 'info');
        }
        
        // Add sound effect
        if (window.ClutchZone?.sound) {
            window.ClutchZone.sound.play('click');
        }
    }

    handleSearch(query) {
        if (query.length < 2) return;
        
        // Simple search implementation
        const cards = document.querySelectorAll('.article-card, .category-card');
        cards.forEach(card => {
            const text = card.textContent.toLowerCase();
            const matches = text.includes(query.toLowerCase());
            
            if (matches) {
                card.style.display = 'block';
                card.style.opacity = '1';
            } else {
                card.style.opacity = '0.3';
            }
        });
    }

    openLiveChat() {
        if (this.chatModal) {
            this.chatModal.classList.add('show');
            
            // Add opening animation
            gsap.fromTo(this.chatModal.querySelector('.modal-content'), 
                { scale: 0.8, opacity: 0 },
                { scale: 1, opacity: 1, duration: 0.3, ease: 'power2.out' }
            );
        }
    }

    createTicket() {
        // Redirect to support page
        window.location.href = '../support/support.html';
    }

    openVideoGuides() {
        // Scroll to video section
        const videoSection = document.querySelector('.video-tutorials');
        if (videoSection) {
            videoSection.scrollIntoView({ behavior: 'smooth' });
        }
    }

    openCommunity() {
        // Open community in new tab
        window.open('https://discord.gg/clutchzone', '_blank');
    }

    sendMessage() {
        const chatInput = document.getElementById('chatInput');
        const message = chatInput.value.trim();
        
        if (!message) return;
        
        // Add user message
        this.addChatMessage('You', message, 'user');
        chatInput.value = '';
        
        // Simulate support response
        setTimeout(() => {
            const responses = [
                'Thank you for contacting us! Let me help you with that.',
                'I understand your concern. Let me look into this for you.',
                'That\'s a great question! Here\'s what I can tell you...',
                'I\'m here to help! Let me provide you with the information you need.'
            ];
            
            const randomResponse = responses[Math.floor(Math.random() * responses.length)];
            this.addChatMessage('ClutchZone Support', randomResponse, 'support');
        }, 1000);
    }

    addChatMessage(sender, message, type) {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;
        
        const messageElement = document.createElement('div');
        messageElement.className = `chat-message ${type}`;
        messageElement.innerHTML = `
            <div class="message-sender">${sender}</div>
            <div class="message-content">${message}</div>
            <div class="message-time">${new Date().toLocaleTimeString()}</div>
        `;
        
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Add animation
        gsap.fromTo(messageElement, 
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }
        );
    }

    closeModal() {
        if (this.chatModal) {
            gsap.to(this.chatModal.querySelector('.modal-content'), {
                scale: 0.8,
                opacity: 0,
                duration: 0.3,
                ease: 'power2.in',
                onComplete: () => {
                    this.chatModal.classList.remove('show');
                }
            });
        }
    }

    animateSection(section) {
        const cards = section.querySelectorAll('.category-card, .article-card, .video-card');
        
        gsap.fromTo(cards, 
            { opacity: 0, y: 50 },
            { 
                opacity: 1, 
                y: 0, 
                duration: 0.6, 
                stagger: 0.1,
                ease: 'power2.out' 
            }
        );
    }
}

// Global functions for buttons
window.openLiveChat = function() {
    if (window.helpCenter) {
        window.helpCenter.openLiveChat();
    }
};

window.createTicket = function() {
    if (window.helpCenter) {
        window.helpCenter.createTicket();
    }
};

window.sendMessage = function() {
    if (window.helpCenter) {
        window.helpCenter.sendMessage();
    }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.helpCenter = new HelpCenter();
});

// Handle window resize
window.addEventListener('resize', () => {
    if (window.helpCenter && window.helpCenter.renderer) {
        const canvas = document.getElementById('help-canvas');
        if (canvas) {
            window.helpCenter.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
            window.helpCenter.camera.aspect = canvas.clientWidth / canvas.clientHeight;
            window.helpCenter.camera.updateProjectionMatrix();
        }
    }
});
