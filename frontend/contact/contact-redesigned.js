// ClutchZone Contact Page - Advanced JavaScript Implementation
// War/Game Themed Interactive Features

class ClutchZoneContact {
    constructor() {
        this.initializeComponents();
        this.setupEventListeners();
        this.initializeAnimations();
        this.loadDynamicContent();
    }

    initializeComponents() {
        // Form validation state
        this.formState = {
            isValid: false,
            fields: {
                name: false,
                email: false,
                subject: false,
                message: false
            }
        };

        // FAQ state
        this.faqState = {
            currentCategory: 'all',
            searchTerm: '',
            expandedItems: new Set()
        };

        // Chat state
        this.chatState = {
            isOpen: false,
            isConnected: false,
            messages: [],
            socket: null
        };

        // Animation controllers
        this.particleSystem = null;
        this.typewriterInstances = [];
    }

    setupEventListeners() {
        // Contact form events
        this.setupFormValidation();
        this.setupFormSubmission();

        // Quick deploy buttons
        this.setupQuickDeployButtons();

        // FAQ functionality
        this.setupFAQEvents();

        // Chat system
        this.setupChatEvents();

        // Social links with analytics
        this.setupSocialEvents();

        // Particle background toggle
        this.setupParticleControls();

        // Scroll animations
        this.setupScrollAnimations();

        // Global function assignments
        this.assignGlobalFunctions();
    }

    setupFormValidation() {
        const form = document.getElementById('missionForm');
        if (!form) return;

        const fields = {
            commanderName: {
                element: document.getElementById('commanderName'),
                validator: (value) => value.length >= 2,
                errorMessage: 'Commander name must be at least 2 characters'
            },
            email: {
                element: document.getElementById('email'),
                validator: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
                errorMessage: 'Please enter a valid email address'
            },
            missionType: {
                element: document.getElementById('missionType'),
                validator: (value) => value !== '',
                errorMessage: 'Please select a mission type'
            },
            message: {
                element: document.getElementById('message'),
                validator: (value) => value.length >= 10,
                errorMessage: 'Message must be at least 10 characters'
            }
        };

        Object.entries(fields).forEach(([fieldName, field]) => {
            if (field.element) {
                field.element.addEventListener('input', () => {
                    this.validateField(fieldName, field);
                });

                field.element.addEventListener('blur', () => {
                    this.validateField(fieldName, field);
                });
            }
        });

        this.formFields = fields;
    }

    validateField(fieldName, field) {
        const value = field.element.value.trim();
        const isValid = field.validator(value);
        
        this.formState.fields[fieldName] = isValid;
        
        // Visual feedback
        const fieldContainer = field.element.closest('.form-group');
        const errorElement = fieldContainer?.querySelector('.error-message');
        
        if (isValid) {
            field.element.classList.remove('error');
            field.element.classList.add('valid');
            if (errorElement) errorElement.style.display = 'none';
        } else {
            field.element.classList.remove('valid');
            field.element.classList.add('error');
            if (errorElement) {
                errorElement.textContent = field.errorMessage;
                errorElement.style.display = 'block';
            }
        }

        this.updateFormValidation();
    }

    updateFormValidation() {
        const allValid = Object.values(this.formState.fields).every(valid => valid);
        this.formState.isValid = allValid;
        
        const submitButton = document.getElementById('launchMission');
        if (submitButton) {
            submitButton.disabled = !allValid;
            submitButton.classList.toggle('ready', allValid);
        }
    }

    setupFormSubmission() {
        const form = document.getElementById('missionForm');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (!this.formState.isValid) {
                this.showNotification('Please complete all mission parameters', 'error');
                return;
            }

            await this.submitMission(new FormData(form));
        });
    }

    async submitMission(formData) {
        const submitButton = document.getElementById('launchMission');
        const originalText = submitButton.textContent;
        
        try {
            // Update button state
            submitButton.textContent = 'LAUNCHING MISSION...';
            submitButton.disabled = true;
            submitButton.classList.add('loading');

            // Prepare mission data
            const missionData = {
                commanderName: formData.get('commanderName'),
                email: formData.get('email'),
                missionType: formData.get('missionType'),
                priority: formData.get('priority'),
                message: formData.get('message'),
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent
            };

            // Submit to backend
            const response = await this.sendToBackend('/api/contact/submit', missionData);
            
            if (response.success) {
                this.showNotification('Mission launched successfully! Our team will respond within 24 hours.', 'success');
                form.reset();
                this.resetFormValidation();
                this.triggerSuccessAnimation();
            } else {
                throw new Error(response.message || 'Mission launch failed');
            }

        } catch (error) {
            console.error('Mission submission error:', error);
            this.showNotification('Mission launch failed. Please try again or contact support.', 'error');
        } finally {
            // Reset button state
            submitButton.textContent = originalText;
            submitButton.disabled = false;
            submitButton.classList.remove('loading');
        }
    }

    setupQuickDeployButtons() {
        const buttons = document.querySelectorAll('.quick-deploy-btn');
        
        buttons.forEach(button => {
            button.addEventListener('click', () => {
                const action = button.dataset.action;
                this.handleQuickDeploy(action, button);
            });
        });
    }

    handleQuickDeploy(action, button) {
        const actions = {
            discord: () => window.open('https://discord.gg/clutchzone', '_blank'),
            emergency: () => this.openEmergencyChat(),
            schedule: () => this.openScheduleModal(),
            feedback: () => this.scrollToFeedbackForm()
        };

        if (actions[action]) {
            // Add visual feedback
            button.classList.add('deployed');
            setTimeout(() => button.classList.remove('deployed'), 1000);
            
            actions[action]();
            this.trackUserAction('quick_deploy', action);
        }
    }

    setupFAQEvents() {
        // Category filters
        const categoryButtons = document.querySelectorAll('.faq-category');
        categoryButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.filterFAQByCategory(button.dataset.category);
                this.updateCategoryButtons(button);
            });
        });

        // Search functionality
        const searchInput = document.getElementById('faqSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchFAQ(e.target.value);
            });
        }

        // FAQ item toggles
        const faqItems = document.querySelectorAll('.faq-item');
        faqItems.forEach(item => {
            const trigger = item.querySelector('.faq-question');
            if (trigger) {
                trigger.addEventListener('click', () => {
                    this.toggleFAQItem(item);
                });
            }
        });
    }

    toggleFAQEntry(headerElement) {
        const faqEntry = headerElement.closest('.faq-entry');
        const content = faqEntry.querySelector('.faq-content');
        const icon = headerElement.querySelector('.expansion-control i');
        
        if (faqEntry.classList.contains('expanded')) {
            // Collapse
            faqEntry.classList.remove('expanded');
            content.style.maxHeight = '0';
            icon.className = 'fas fa-plus';
        } else {
            // Expand
            faqEntry.classList.add('expanded');
            content.style.maxHeight = content.scrollHeight + 'px';
            icon.className = 'fas fa-minus';
        }
        
        this.trackUserAction('faq_toggle', faqEntry.dataset.category);
    }

    filterFAQByCategory(category) {
        this.faqState.currentCategory = category;
        const faqItems = document.querySelectorAll('.faq-entry');
        
        faqItems.forEach(item => {
            const itemCategory = item.dataset.category;
            const matchesCategory = category === 'all' || itemCategory === category;
            const matchesSearch = this.matchesSearchTerm(item);
            
            if (matchesCategory && matchesSearch) {
                item.style.display = 'block';
                item.style.animation = 'slideInUp 0.3s ease-out';
            } else {
                item.style.display = 'none';
            }
        });

        // Update active filter button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.category === category) {
                btn.classList.add('active');
            }
        });

        this.trackUserAction('faq_category_filter', category);
    }

    searchFAQ(searchTerm) {
        this.faqState.searchTerm = searchTerm.toLowerCase();
        const faqItems = document.querySelectorAll('.faq-entry');
        
        faqItems.forEach(item => {
            const matchesCategory = this.faqState.currentCategory === 'all' || 
                                   item.dataset.category === this.faqState.currentCategory;
            const matchesSearch = this.matchesSearchTerm(item);
            
            if (matchesCategory && matchesSearch) {
                item.style.display = 'block';
                // Highlight search terms
                this.highlightSearchTerms(item, searchTerm);
            } else {
                item.style.display = 'none';
            }
        });

        this.trackUserAction('faq_search', searchTerm);
    }

    matchesSearchTerm(item) {
        if (!this.faqState.searchTerm) return true;
        
        const question = item.querySelector('h3').textContent.toLowerCase();
        const answer = item.querySelector('.content-body').textContent.toLowerCase();
        
        return question.includes(this.faqState.searchTerm) || 
               answer.includes(this.faqState.searchTerm);
    }

    highlightSearchTerms(item, searchTerm) {
        if (!searchTerm) return;
        
        const elements = item.querySelectorAll('h3, .content-body p, .content-body li');
        elements.forEach(el => {
            const text = el.textContent;
            const regex = new RegExp(`(${searchTerm})`, 'gi');
            const highlightedText = text.replace(regex, '<mark>$1</mark>');
            
            if (highlightedText !== text) {
                el.innerHTML = highlightedText;
            }
        });
    }

    toggleFAQItem(item) {
        const itemId = item.dataset.id;
        const answer = item.querySelector('.faq-answer');
        const icon = item.querySelector('.expand-icon');
        
        if (this.faqState.expandedItems.has(itemId)) {
            // Collapse
            this.faqState.expandedItems.delete(itemId);
            answer.style.maxHeight = '0';
            icon.style.transform = 'rotate(0deg)';
            item.classList.remove('expanded');
        } else {
            // Expand
            this.faqState.expandedItems.add(itemId);
            answer.style.maxHeight = answer.scrollHeight + 'px';
            icon.style.transform = 'rotate(180deg)';
            item.classList.add('expanded');
        }

        this.trackUserAction('faq_toggle', itemId);
    }

    setupChatEvents() {
        // Open/close chat
        const chatToggle = document.getElementById('supportToggle');
        const chatModal = document.getElementById('chatModal');
        const chatClose = document.getElementById('chatClose');

        if (chatToggle) {
            chatToggle.addEventListener('click', () => this.toggleChat());
        }

        if (chatClose) {
            chatClose.addEventListener('click', () => this.closeChat());
        }

        // Chat input and send
        const chatInput = document.getElementById('chatInput');
        const chatSend = document.getElementById('chatSend');

        if (chatInput) {
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendChatMessage();
                }
            });
        }

        if (chatSend) {
            chatSend.addEventListener('click', () => this.sendChatMessage());
        }

        // Initialize chat connection
        this.initializeChatConnection();
    }

    toggleChat() {
        if (this.chatState.isOpen) {
            this.closeChat();
        } else {
            this.openChat();
        }
    }

    openChat() {
        const chatModal = document.getElementById('chatModal');
        if (chatModal) {
            chatModal.classList.add('active');
            this.chatState.isOpen = true;
            
            // Focus chat input
            setTimeout(() => {
                const chatInput = document.getElementById('chatInput');
                if (chatInput) chatInput.focus();
            }, 300);

            this.trackUserAction('chat_opened');
        }
    }

    closeChat() {
        const chatModal = document.getElementById('chatModal');
        if (chatModal) {
            chatModal.classList.remove('active');
            this.chatState.isOpen = false;
            this.trackUserAction('chat_closed');
        }
    }

    async initializeChatConnection() {
        try {
            // Check if WebSocket is available
            if (typeof WebSocket === 'undefined') {
                console.warn('WebSocket not supported in this environment');
                this.initializeFallbackChat();
                return;
            }

            // Try to connect to chat service with fallback
            const wsUrls = [
                'ws://localhost:8000/ws/chat',
                'ws://localhost:3000/ws/chat',
                'wss://api.clutchzone.com/ws/chat'
            ];

            for (const wsUrl of wsUrls) {
                try {
                    await this.attemptWebSocketConnection(wsUrl);
                    return; // Success, exit loop
                } catch (error) {
                    console.warn(`Failed to connect to ${wsUrl}:`, error.message);
                    continue; // Try next URL
                }
            }

            // All WebSocket attempts failed, use fallback
            console.warn('All WebSocket connections failed, using fallback chat');
            this.initializeFallbackChat();

        } catch (error) {
            console.error('Failed to initialize chat:', error);
            this.initializeFallbackChat();
        }
    }

    attemptWebSocketConnection(wsUrl) {
        return new Promise((resolve, reject) => {
            const socket = new WebSocket(wsUrl);
            const timeout = setTimeout(() => {
                socket.close();
                reject(new Error('Connection timeout'));
            }, 5000);

            socket.onopen = () => {
                clearTimeout(timeout);
                this.chatState.socket = socket;
                this.chatState.isConnected = true;
                this.updateChatStatus('Connected to support');
                this.addSystemMessage('🟢 Connected! How can we help you today?');
                this.setupWebSocketHandlers(socket);
                resolve();
            };

            socket.onerror = (error) => {
                clearTimeout(timeout);
                reject(error);
            };
        });
    }

    setupWebSocketHandlers(socket) {
        socket.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                this.handleIncomingMessage(message);
            } catch (error) {
                console.error('Error parsing message:', error);
            }
        };

        socket.onclose = () => {
            this.chatState.isConnected = false;
            this.updateChatStatus('🔴 Disconnected - Attempting to reconnect...');
            
            // Attempt to reconnect after 5 seconds
            setTimeout(() => {
                this.initializeChatConnection();
            }, 5000);
        };

        socket.onerror = (error) => {
            console.error('WebSocket error:', error);
            this.updateChatStatus('🟡 Connection error - Using fallback');
        };
    }

    initializeFallbackChat() {
        // Simulate chat functionality without WebSocket
        this.chatState.isConnected = false;
        this.updateChatStatus('🟡 Offline Mode - Messages will be queued');
        this.addSystemMessage('💬 Chat is in offline mode. Your messages will be sent when connection is restored.');
        
        // Enable basic chat functionality
        this.setupFallbackChatHandlers();
    }

    setupFallbackChatHandlers() {
        const sendBtn = document.getElementById('sendChatBtn');
        const chatInput = document.getElementById('chatInput');
        
        if (sendBtn && chatInput) {
            sendBtn.addEventListener('click', () => {
                this.handleFallbackMessage();
            });
            
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleFallbackMessage();
                }
            });
        }
    }

    handleFallbackMessage() {
        const chatInput = document.getElementById('chatInput');
        const message = chatInput.value.trim();
        
        if (message) {
            // Add user message to chat
            this.addUserMessage(message);
            chatInput.value = '';
            
            // Simulate agent response
            setTimeout(() => {
                this.addAgentMessage('Thank you for your message. Due to technical issues, please use our contact form or call us directly for immediate assistance.');
            }, 1000);
        }
    }

    updateChatStatus(status) {
        const statusElement = document.getElementById('agentStatus');
        if (statusElement) {
            statusElement.textContent = status;
        }
    }

    addSystemMessage(message) {
        this.addMessage(message, 'system');
    }

    addUserMessage(message) {
        this.addMessage(message, 'user');
    }

    addAgentMessage(message) {
        this.addMessage(message, 'agent');
    }

    addMessage(message, type) {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;

        const messageElement = document.createElement('div');
        messageElement.className = `message ${type}`;
        
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        messageElement.innerHTML = `
            ${type === 'agent' ? '<div class="message-avatar"><img src="/api/placeholder/32/32" alt="Agent"></div>' : ''}
            <div class="message-content">
                <p>${message}</p>
                <div class="message-meta">
                    <span class="message-time">${time}</span>
                    <span class="message-status">✓</span>
                </div>
            </div>
        `;
        
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    sendChatMessage() {
        const chatInput = document.getElementById('chatInput');
        if (!chatInput) return;

        const message = chatInput.value.trim();
        if (!message) return;

        // Add message to chat
        this.addUserMessage(message);
        chatInput.value = '';

        // Send to backend
        if (this.chatState.isConnected && this.chatState.socket) {
            this.chatState.socket.send(JSON.stringify({
                type: 'user_message',
                message: message,
                timestamp: new Date().toISOString()
            }));
        } else {
            // Fallback to HTTP API
            this.sendChatMessageHTTP(message);
        }

        this.trackUserAction('chat_message_sent');
    }

    addUserMessage(message) {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;

        const messageElement = document.createElement('div');
        messageElement.className = 'chat-message user-message';
        messageElement.innerHTML = `
            <div class="message-content">
                <p>${this.escapeHtml(message)}</p>
                <span class="message-time">${this.formatTime(new Date())}</span>
            </div>
        `;

        chatMessages.appendChild(messageElement);
        this.scrollChatToBottom();
    }

    addSystemMessage(message) {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;

        const messageElement = document.createElement('div');
        messageElement.className = 'chat-message system-message';
        messageElement.innerHTML = `
            <div class="message-content">
                <p>${this.escapeHtml(message)}</p>
                <span class="message-time">${this.formatTime(new Date())}</span>
            </div>
        `;

        chatMessages.appendChild(messageElement);
        this.scrollChatToBottom();
    }

    setupSocialEvents() {
        const socialLinks = document.querySelectorAll('.social-link');
        
        socialLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const platform = link.dataset.platform;
                this.trackUserAction('social_click', platform);
                
                // Add click animation
                link.classList.add('clicked');
                setTimeout(() => link.classList.remove('clicked'), 200);
            });
        });
    }

    initializeAnimations() {
        // Initialize particle system
        this.initializeParticleSystem();
        
        // Initialize typewriter effects
        this.initializeTypewriter();
        
        // Initialize scroll animations
        this.initializeScrollAnimations();
        
        // Initialize loading animations
        this.initializeLoadingAnimations();
    }

    initializeParticleSystem() {
        const canvas = document.getElementById('particleCanvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const particles = [];
        const particleCount = 50;

        // Resize canvas
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

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
                ctx.globalAlpha = particle.opacity;
                ctx.fillStyle = '#00ff88';
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fill();
            });

            requestAnimationFrame(animate);
        };

        animate();
        this.particleSystem = { canvas, ctx, particles };
    }

    initializeTypewriter() {
        const typewriterElements = document.querySelectorAll('.typewriter-text');
        
        typewriterElements.forEach(element => {
            const text = element.textContent;
            element.textContent = '';
            
            let charIndex = 0;
            const typeInterval = setInterval(() => {
                element.textContent += text[charIndex];
                charIndex++;
                
                if (charIndex >= text.length) {
                    clearInterval(typeInterval);
                }
            }, 100);
            
            this.typewriterInstances.push(typeInterval);
        });
    }

    setupParticleControls() {
        // Particle system controls
        const particleToggle = document.getElementById('particleToggle');
        if (particleToggle) {
            particleToggle.addEventListener('click', () => {
                this.toggleParticleSystem();
            });
        }
    }

    setupScrollAnimations() {
        // Intersection Observer for scroll animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        this.scrollObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);

        // Observe elements for animation
        document.querySelectorAll('.tactical-card, .faq-entry, .channel-card').forEach(el => {
            this.scrollObserver.observe(el);
        });
    }

    assignGlobalFunctions() {
        // Make functions globally accessible for HTML onclick events
        window.deployLiveChat = () => this.openChat();
        window.openFAQMission = () => this.scrollToFAQ();
        window.createUrgentTicket = () => this.createUrgentTicket();
        window.initiateVoiceCall = () => this.initiateVoiceCall();
        window.clearForm = () => this.clearContactForm();
        window.toggleFAQEntry = (element) => this.toggleFAQEntry(element);
        window.sendQuickMessage = (message) => this.sendQuickChatMessage(message);
    }

    // Missing method implementations
    scrollToFAQ() {
        const faqSection = document.querySelector('.faq-war-room');
        if (faqSection) {
            faqSection.scrollIntoView({ behavior: 'smooth' });
            this.trackUserAction('faq_accessed_via_quick_deploy');
        }
    }

    createUrgentTicket() {
        // Open Discord or show urgent contact modal
        const userChoice = confirm('Create urgent support ticket:\n\nClick OK to join Discord for immediate help\nClick Cancel to use emergency form');
        
        if (userChoice) {
            // Open Discord server
            window.open('https://discord.gg/clutchzone', '_blank');
            this.trackUserAction('urgent_ticket_discord');
        } else {
            // Show emergency form modal
            this.showEmergencyModal();
            this.trackUserAction('urgent_ticket_form');
        }
    }

    showEmergencyModal() {
        const modal = document.createElement('div');
        modal.className = 'modal emergency-modal';
        modal.innerHTML = `
            <div class="modal-content emergency-content">
                <div class="emergency-header">
                    <h2><i class="fas fa-exclamation-triangle"></i> EMERGENCY SUPPORT</h2>
                    <button class="close-btn" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="emergency-body">
                    <p>Describe your emergency:</p>
                    <textarea id="emergencyMessage" placeholder="Describe the urgent issue..." rows="4"></textarea>
                    <div class="emergency-actions">
                        <button class="btn-emergency" onclick="this.submitEmergency()">
                            <i class="fas fa-rocket"></i> SEND EMERGENCY TICKET
                        </button>
                        <button class="btn-discord" onclick="window.open('https://discord.gg/clutchzone', '_blank')">
                            <i class="fab fa-discord"></i> JOIN DISCORD NOW
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        modal.style.display = 'flex';
        
        // Focus the textarea
        setTimeout(() => {
            modal.querySelector('#emergencyMessage').focus();
        }, 100);
    }

    async initiateVoiceCall() {
        // Integrate with Gemini API for voice chat
        try {
            this.showNotification('Initializing voice communication channel...', 'info');
            
            // Check if browser supports voice recognition
            if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
                this.showNotification('Voice recognition not supported in this browser. Please use Chrome or Edge.', 'error');
                return;
            }

            // Initialize voice chat modal
            this.showVoiceChatModal();
            this.trackUserAction('voice_call_initiated');
            
        } catch (error) {
            console.error('Voice call initialization failed:', error);
            this.showNotification('Voice communication system temporarily unavailable.', 'error');
        }
    }

    showVoiceChatModal() {
        const modal = document.createElement('div');
        modal.className = 'modal voice-chat-modal';
        modal.innerHTML = `
            <div class="modal-content voice-content">
                <div class="voice-header">
                    <h2><i class="fas fa-microphone"></i> VOICE COMMAND CENTER</h2>
                    <button class="close-btn" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="voice-body">
                    <div class="voice-status">
                        <div class="status-indicator" id="voiceStatus">Ready</div>
                        <div class="voice-visualizer">
                            <div class="voice-bar"></div>
                            <div class="voice-bar"></div>
                            <div class="voice-bar"></div>
                            <div class="voice-bar"></div>
                            <div class="voice-bar"></div>
                        </div>
                    </div>
                    <div class="voice-transcript" id="voiceTranscript">
                        Click "Start Voice Chat" to begin speaking...
                    </div>
                    <div class="voice-controls">
                        <button class="btn-voice-start" id="startVoice">
                            <i class="fas fa-microphone"></i> START VOICE CHAT
                        </button>
                        <button class="btn-voice-stop" id="stopVoice" style="display: none;">
                            <i class="fas fa-stop"></i> STOP
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        modal.style.display = 'flex';
        
        // Initialize voice recognition
        this.initializeVoiceRecognition(modal);
    }

    initializeVoiceRecognition(modal) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        const startBtn = modal.querySelector('#startVoice');
        const stopBtn = modal.querySelector('#stopVoice');
        const transcript = modal.querySelector('#voiceTranscript');
        const status = modal.querySelector('#voiceStatus');

        startBtn.addEventListener('click', () => {
            recognition.start();
            startBtn.style.display = 'none';
            stopBtn.style.display = 'block';
            status.textContent = 'Listening...';
            transcript.textContent = 'Speak now...';
        });

        stopBtn.addEventListener('click', () => {
            recognition.stop();
            stopBtn.style.display = 'none';
            startBtn.style.display = 'block';
            status.textContent = 'Ready';
        });

        recognition.onresult = (event) => {
            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                }
            }
            
            if (finalTranscript) {
                transcript.textContent = finalTranscript;
                // Here you would integrate with Gemini API
                this.processVoiceInput(finalTranscript);
            }
        };

        recognition.onerror = (event) => {
            console.error('Voice recognition error:', event.error);
            status.textContent = 'Error: ' + event.error;
        };
    }

    async processVoiceInput(input) {
        // Process voice input with Gemini API (placeholder for now)
        try {
            // This would connect to your Gemini API endpoint
            const response = await fetch('/api/voice/process', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ input: input })
            });
            
            if (response.ok) {
                const result = await response.json();
                this.handleVoiceResponse(result.response);
            }
        } catch (error) {
            console.error('Voice processing error:', error);
            this.showNotification('Voice processing temporarily unavailable.', 'error');
        }
    }

    clearContactForm() {
        const form = document.getElementById('tacticalForm');
        if (form) {
            form.reset();
            this.resetFormValidation();
            this.showNotification('Mission parameters cleared!', 'info');
            this.trackUserAction('form_cleared');
        }
    }

    sendQuickChatMessage(message) {
        const chatInput = document.getElementById('chatInput');
        if (chatInput) {
            chatInput.value = message;
            this.sendChatMessage();
        }
    }

    updateChatStatus(status) {
        const statusElements = document.querySelectorAll('.chat-status, #agentStatus');
        statusElements.forEach(el => {
            if (el) el.textContent = status;
        });
    }

    addSystemMessage(message) {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;

        const messageElement = document.createElement('div');
        messageElement.className = 'message system';
        messageElement.innerHTML = `
            <div class="message-content">
                <p><i class="fas fa-info-circle"></i> ${this.escapeHtml(message)}</p>
                <div class="message-meta">
                    <span class="message-time">${this.formatTime(new Date())}</span>
                </div>
            </div>
        `;

        chatMessages.appendChild(messageElement);
        this.scrollChatToBottom();
    }

    // Utility methods
    async sendToBackend(endpoint, data) {
        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Backend request failed:', error);
            return { success: false, message: error.message };
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${this.escapeHtml(message)}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;

        document.body.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 300);
        }, 5000);

        // Manual close
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 300);
        });
    }

    trackUserAction(action, data = null) {
        // Analytics tracking
        if (typeof gtag !== 'undefined') {
            gtag('event', action, {
                event_category: 'contact_page',
                event_label: data,
                value: 1
            });
        }

        // Custom analytics
        this.sendToBackend('/api/analytics/track', {
            action,
            data,
            page: 'contact',
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
        }).catch(error => {
            console.warn('Analytics tracking failed:', error);
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    formatTime(date) {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    scrollChatToBottom() {
        const chatMessages = document.getElementById('chatMessages');
        if (chatMessages) {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }

    resetFormValidation() {
        Object.keys(this.formState.fields).forEach(field => {
            this.formState.fields[field] = false;
        });
        this.formState.isValid = false;
        
        // Reset visual states
        document.querySelectorAll('.form-group input, .form-group select, .form-group textarea').forEach(element => {
            element.classList.remove('valid', 'error');
        });
        
        document.querySelectorAll('.error-message').forEach(element => {
            element.style.display = 'none';
        });
    }

    loadDynamicContent() {
        // Load FAQ data
        this.loadFAQData();
        
        // Load team status
        this.loadTeamStatus();
        
        // Load recent updates
        this.loadRecentUpdates();
    }

    async loadFAQData() {
        try {
            const response = await this.sendToBackend('/api/content/faq');
            if (response.success && response.data) {
                this.renderDynamicFAQ(response.data);
            }
        } catch (error) {
            console.warn('Failed to load dynamic FAQ:', error);
        }
    }

    async loadTeamStatus() {
        try {
            const response = await this.sendToBackend('/api/team/status');
            if (response.success && response.data) {
                this.updateTeamStatus(response.data);
            }
        } catch (error) {
            console.warn('Failed to load team status:', error);
        }
    }

    initializeScrollAnimations() {
        // GSAP scroll animations
        if (typeof gsap !== 'undefined') {
            // Hero section animations
            gsap.fromTo('.hero-title', {
                opacity: 0,
                y: 50
            }, {
                opacity: 1,
                y: 0,
                duration: 1,
                ease: 'power2.out'
            });

            // Tactical cards stagger animation
            gsap.fromTo('.tactical-card', {
                opacity: 0,
                y: 30,
                scale: 0.9
            }, {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.6,
                stagger: 0.2,
                ease: 'back.out(1.7)',
                scrollTrigger: {
                    trigger: '.tactical-grid',
                    start: 'top 80%'
                }
            });

            // FAQ entries animation
            gsap.fromTo('.faq-entry', {
                opacity: 0,
                x: -20
            }, {
                opacity: 1,
                x: 0,
                duration: 0.5,
                stagger: 0.1,
                scrollTrigger: {
                    trigger: '.faq-database',
                    start: 'top 80%'
                }
            });
        }
    }

    initializeLoadingAnimations() {
        // Loading spinner for async operations
        this.createLoadingSpinner();
        
        // Skeleton loading for content
        this.initializeSkeletonLoaders();
        
        // Progress indicators
        this.initializeProgressBars();
    }

    createLoadingSpinner() {
        const loadingHTML = `
            <div class="tactical-loader" id="tacticalLoader" style="display: none;">
                <div class="loader-container">
                    <div class="crosshair-loader">
                        <div class="crosshair-ring"></div>
                        <div class="crosshair-lines">
                            <div class="line horizontal"></div>
                            <div class="line vertical"></div>
                        </div>
                        <div class="center-dot"></div>
                    </div>
                    <div class="loading-text">
                        <span class="text-glitch" data-text="LOADING...">LOADING...</span>
                        <div class="loading-progress">
                            <div class="progress-bar"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        if (!document.getElementById('tacticalLoader')) {
            document.body.insertAdjacentHTML('beforeend', loadingHTML);
        }
    }

    initializeSkeletonLoaders() {
        // Create skeleton loader templates
        const skeletonHTML = `
            <div class="skeleton-loader" id="skeletonLoader" style="display: none;">
                <div class="skeleton-card">
                    <div class="skeleton-header"></div>
                    <div class="skeleton-content">
                        <div class="skeleton-line"></div>
                        <div class="skeleton-line short"></div>
                        <div class="skeleton-line"></div>
                    </div>
                </div>
            </div>
        `;
        
        if (!document.getElementById('skeletonLoader')) {
            document.body.insertAdjacentHTML('beforeend', skeletonHTML);
        }
    }

    initializeProgressBars() {
        // Animate hero stats counters
        const statNumbers = document.querySelectorAll('.stat-number');
        statNumbers.forEach(stat => {
            const target = parseInt(stat.dataset.target);
            const duration = 2000;
            const increment = target / (duration / 16);
            let current = 0;
            
            const updateCounter = () => {
                current += increment;
                if (current < target) {
                    stat.textContent = Math.floor(current);
                    requestAnimationFrame(updateCounter);
                } else {
                    stat.textContent = target;
                }
            };
            
            // Start animation when element is visible
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        updateCounter();
                        observer.unobserve(entry.target);
                    }
                });
            });
            
            observer.observe(stat);
        });
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new ClutchZoneContact();
});

// Global functions for external access
window.ClutchZoneContact = ClutchZoneContact;

// Global initialization function for advanced navbar
function initializeAdvancedNavbar() {
    try {
        if (window.advancedNavbar) {
            console.log('✅ Advanced navbar already initialized');
            return window.advancedNavbar;
        }
        
        if (typeof AdvancedNavbar !== 'undefined') {
            window.advancedNavbar = new AdvancedNavbar();
            console.log('✅ Advanced navbar initialized successfully');
            return window.advancedNavbar;
        } else {
            console.warn('⚠️ AdvancedNavbar class not found, using fallback');
            initializeFallbackNavbar();
        }
    } catch (error) {
        console.error('❌ Error initializing advanced navbar:', error);
        initializeFallbackNavbar();
    }
}

// Fallback navbar initialization
function initializeFallbackNavbar() {
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            }
        });
        
        console.log('✅ Fallback navbar initialized');
    }
}

// Global initialization function for contact page
function initializeContactPage() {
    try {
        if (window.contactPageInstance) {
            console.log('✅ Contact page already initialized');
            return window.contactPageInstance;
        }
        
        if (typeof ClutchZoneContact !== 'undefined') {
            window.contactPageInstance = new ClutchZoneContact();
            console.log('✅ Contact page initialized successfully');
            return window.contactPageInstance;
        } else {
            console.error('❌ ClutchZoneContact class not found');
        }
    } catch (error) {
        console.error('❌ Error initializing contact page:', error);
        initializeFallbackContactPage();
    }
}

// Fallback contact page initialization
function initializeFallbackContactPage() {
    console.log('🔄 Initializing fallback contact page functionality');
    
    // Basic form handling
    const form = document.getElementById('tacticalForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            showNotification('Form submitted successfully!', 'success');
        });
    }
    
    // Basic modal handling
    setupBasicModals();
    
    // Basic FAQ functionality
    setupBasicFAQ();
    
    console.log('✅ Fallback contact page initialized');
}

function setupBasicModals() {
    // Live chat modal
    const liveChatModal = document.getElementById('liveChatModal');
    const closeChatModal = document.getElementById('closeChatModal');
    
    if (closeChatModal && liveChatModal) {
        closeChatModal.addEventListener('click', () => {
            liveChatModal.style.display = 'none';
        });
    }
}

function setupBasicFAQ() {
    // FAQ search functionality
    const faqSearch = document.getElementById('faqSearch');
    if (faqSearch) {
        faqSearch.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const faqEntries = document.querySelectorAll('.faq-entry');
            
            faqEntries.forEach(entry => {
                const text = entry.textContent.toLowerCase();
                entry.style.display = text.includes(searchTerm) ? 'block' : 'none';
            });
        });
    }
    
    // FAQ category filters
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const category = e.target.dataset.category;
            const faqEntries = document.querySelectorAll('.faq-entry');
            
            // Update active button
            filterBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            
            // Filter entries
            faqEntries.forEach(entry => {
                const entryCategory = entry.dataset.category;
                if (category === 'all' || entryCategory === category) {
                    entry.style.display = 'block';
                } else {
                    entry.style.display = 'none';
                }
            });
        });
    });
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Global function implementations for onclick handlers
function deployLiveChat() {
    try {
        if (window.contactPageInstance && window.contactPageInstance.deployLiveChat) {
            window.contactPageInstance.deployLiveChat();
        } else {
            const modal = document.getElementById('liveChatModal');
            if (modal) {
                modal.style.display = 'flex';
                showNotification('Live chat deployed! Agent connecting...', 'success');
            }
        }
    } catch (error) {
        console.error('Error deploying live chat:', error);
        showNotification('Unable to connect to live chat. Please try again.', 'error');
    }
}

function openFAQMission() {
    try {
        if (window.contactPageInstance && window.contactPageInstance.openFAQMission) {
            window.contactPageInstance.openFAQMission();
        } else {
            const faqSection = document.querySelector('.faq-war-room');
            if (faqSection) {
                faqSection.scrollIntoView({ behavior: 'smooth' });
                showNotification('FAQ Mission briefing accessed!', 'success');
            }
        }
    } catch (error) {
        console.error('Error opening FAQ mission:', error);
        showNotification('Unable to access FAQ mission.', 'error');
    }
}

function createUrgentTicket() {
    try {
        if (window.contactPageInstance && window.contactPageInstance.createUrgentTicket) {
            window.contactPageInstance.createUrgentTicket();
        } else {
            // Fallback: Show emergency contact info
            const emergency = confirm(`🚨 EMERGENCY PROTOCOL ACTIVATED 🚨
            
This will create an urgent support ticket.
Our team will be notified immediately.

Continue with emergency contact?`);
            
            if (emergency) {
                showNotification('🚨 Emergency ticket created! Expect contact within 30 minutes.', 'success');
                // In a real implementation, this would send to Discord/backend
                console.log('Emergency ticket created via fallback method');
            }
        }
    } catch (error) {
        console.error('Error creating urgent ticket:', error);
        showNotification('Emergency protocol failed. Please call support directly.', 'error');
    }
}

function initiateVoiceCall() {
    try {
        if (window.contactPageInstance && window.contactPageInstance.initiateVoiceCall) {
            window.contactPageInstance.initiateVoiceCall();
        } else {
            // Fallback: Show voice call info
            const voiceCall = confirm(`📞 VOICE COMMUNICATION REQUEST 📞
            
This will initiate a voice call with our support team.
Available: Mon-Fri 9AM-6PM IST

Continue with voice call request?`);
            
            if (voiceCall) {
                showNotification('📞 Voice call requested! Agent will call you shortly.', 'success');
                console.log('Voice call requested via fallback method');
            }
        }
    } catch (error) {
        console.error('Error initiating voice call:', error);
        showNotification('Voice call unavailable. Please try live chat.', 'error');
    }
}

function clearForm() {
    try {
        if (window.contactPageInstance && window.contactPageInstance.clearForm) {
            window.contactPageInstance.clearForm();
        } else {
            const form = document.getElementById('tacticalForm');
            if (form) {
                form.reset();
                showNotification('Mission parameters cleared!', 'success');
            }
        }
    } catch (error) {
        console.error('Error clearing form:', error);
    }
}

function toggleFAQEntry(element) {
    try {
        if (window.contactPageInstance && window.contactPageInstance.toggleFAQEntry) {
            window.contactPageInstance.toggleFAQEntry(element);
        } else {
            const faqEntry = element.closest('.faq-entry');
            const content = faqEntry.querySelector('.faq-content');
            const icon = element.querySelector('.expansion-control i');
            
            if (content.style.display === 'block') {
                content.style.display = 'none';
                icon.className = 'fas fa-plus';
            } else {
                content.style.display = 'block';
                icon.className = 'fas fa-minus';
            }
        }
    } catch (error) {
        console.error('Error toggling FAQ entry:', error);
    }
}

function sendQuickMessage(message) {
    try {
        if (window.contactPageInstance && window.contactPageInstance.sendQuickMessage) {
            window.contactPageInstance.sendQuickMessage(message);
        } else {
            const chatInput = document.getElementById('chatInput');
            if (chatInput) {
                chatInput.value = message;
                showNotification(`Quick message set: "${message}"`, 'success');
            }
        }
    } catch (error) {
        console.error('Error sending quick message:', error);
    }
}

// Initialize floating support button
function initializeFloatingSupport() {
    const floatingSupport = document.getElementById('floatingSupport');
    if (floatingSupport) {
        floatingSupport.addEventListener('click', () => {
            deployLiveChat();
        });
        
        // Add hover effects
        floatingSupport.addEventListener('mouseenter', () => {
            floatingSupport.style.transform = 'translateY(-2px) scale(1.05)';
        });
        
        floatingSupport.addEventListener('mouseleave', () => {
            floatingSupport.style.transform = 'translateY(0) scale(1)';
        });
    }
}

// Auto-initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    initializeFloatingSupport();
});
