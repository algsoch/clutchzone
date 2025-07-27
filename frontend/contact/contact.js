// Contact Module JavaScript - Advanced Functionality
class ContactManager {
    constructor() {
        this.currentTab = 'contact';
        this.chatSocket = null;
        this.chatMessages = [];
        this.isTyping = false;
        this.typingTimeout = null;
        this.supportAgentOnline = false;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupFormValidation();
        this.setupLiveChat();
        this.setupFAQToggle();
        this.initializeAnimations();
        this.loadContactData();
    }

    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Contact form submission
        const contactForm = document.getElementById('contact-form');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleContactSubmission();
            });
        }

        // Live chat form
        const chatForm = document.getElementById('chat-form');
        if (chatForm) {
            chatForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.sendChatMessage();
            });
        }

        // Chat input typing indicator
        const chatInput = document.getElementById('chat-input');
        if (chatInput) {
            chatInput.addEventListener('input', () => {
                this.handleTyping();
            });
            
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendChatMessage();
                }
            });
        }

        // FAQ toggle buttons - Updated for better functionality
        this.setupFAQInteractions();

        // FAQ category buttons
        document.querySelectorAll('.faq-category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.filterFAQByCategory(e.target.dataset.category);
            });
        });

        // Close modal listeners
        document.querySelectorAll('.close-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.closeModal();
            });
        });

        // Modal background click
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });

        // File upload handling
        const fileInput = document.getElementById('attachment');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                this.handleFileUpload(e.target.files);
            });
        }

        // Social media links
        document.querySelectorAll('.social-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.openSocialMedia(link.dataset.platform);
            });
        });
    }

    switchTab(tabName) {
        // Update active tab button
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update active tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`).classList.add('active');

        this.currentTab = tabName;
        this.handleTabChange(tabName);
    }

    handleTabChange(tabName) {
        switch (tabName) {
            case 'contact':
                this.initializeContactForm();
                break;
            case 'chat':
                this.initializeLiveChat();
                break;
            case 'faq':
                this.loadFAQs();
                break;
        }
    }

    setupFormValidation() {
        const form = document.getElementById('contact-form');
        if (!form) return;

        // Real-time validation
        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                this.validateField(input);
            });
            
            input.addEventListener('input', () => {
                this.clearFieldError(input);
            });
        });
    }

    validateField(field) {
        const value = field.value.trim();
        const fieldName = field.name;
        let isValid = true;
        let errorMessage = '';

        // Clear previous errors
        this.clearFieldError(field);

        // Required field validation
        if (field.hasAttribute('required') && !value) {
            isValid = false;
            errorMessage = `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
        }

        // Email validation
        if (fieldName === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                errorMessage = 'Please enter a valid email address';
            }
        }

        // Phone validation
        if (fieldName === 'phone' && value) {
            const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
            if (!phoneRegex.test(value.replace(/\s/g, ''))) {
                isValid = false;
                errorMessage = 'Please enter a valid phone number';
            }
        }

        // Message length validation
        if (fieldName === 'message' && value) {
            if (value.length < 10) {
                isValid = false;
                errorMessage = 'Message must be at least 10 characters long';
            }
            if (value.length > 1000) {
                isValid = false;
                errorMessage = 'Message must be less than 1000 characters';
            }
        }

        if (!isValid) {
            this.showFieldError(field, errorMessage);
        }

        return isValid;
    }

    showFieldError(field, message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.textContent = message;
        
        field.classList.add('error');
        field.parentNode.appendChild(errorDiv);
    }

    clearFieldError(field) {
        field.classList.remove('error');
        const errorDiv = field.parentNode.querySelector('.field-error');
        if (errorDiv) {
            errorDiv.remove();
        }
    }

    async handleContactSubmission() {
        const form = document.getElementById('contact-form');
        if (!form) return;

        // Validate all fields
        const inputs = form.querySelectorAll('input, textarea, select');
        let isFormValid = true;

        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isFormValid = false;
            }
        });

        if (!isFormValid) {
            this.showNotification('Please fix the errors in the form', 'error');
            return;
        }

        // Show loading state
        const submitBtn = form.querySelector('.submit-btn');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;

        // Prepare form data
        const formData = new FormData(form);
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            subject: formData.get('subject'),
            category: formData.get('category'),
            message: formData.get('message'),
            priority: formData.get('priority') || 'normal'
        };

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                const result = await response.json();
                this.showNotification('Message sent successfully! We\'ll get back to you soon.', 'success');
                form.reset();
                this.showConfirmationModal(result.ticketId);
            } else {
                const error = await response.json();
                this.showNotification(error.message || 'Failed to send message', 'error');
            }
        } catch (error) {
            console.error('Error sending message:', error);
            this.showNotification('Network error. Please try again.', 'error');
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }

    showConfirmationModal(ticketId) {
        const modal = document.getElementById('confirmation-modal');
        if (!modal) return;

        document.getElementById('ticket-id').textContent = ticketId;
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    setupLiveChat() {
        // Initialize WebSocket connection for live chat
        this.initializeChatSocket();
        this.loadChatHistory();
        this.checkAgentStatus();
    }

    initializeChatSocket() {
        // Mock WebSocket for demo purposes
        // In production, this would connect to a real WebSocket server
        this.chatSocket = {
            send: (message) => {
                // Mock sending message
                setTimeout(() => {
                    this.receiveChatMessage({
                        id: Date.now(),
                        message: this.generateAutoResponse(message),
                        sender: 'support',
                        timestamp: new Date().toISOString(),
                        type: 'text'
                    });
                }, 1000 + Math.random() * 2000);
            },
            close: () => {
                console.log('Chat socket closed');
            }
        };
    }

    generateAutoResponse(userMessage) {
        const responses = [
            "Thank you for your message! A support agent will be with you shortly.",
            "I understand your concern. Let me help you with that.",
            "That's a great question! Here's what I can tell you about that...",
            "I'm looking into this for you. Please give me a moment.",
            "Thanks for reaching out! I'll make sure to get you the information you need.",
            "I see what you're asking about. Let me check our knowledge base for you."
        ];
        
        return responses[Math.floor(Math.random() * responses.length)];
    }

    async sendChatMessage() {
        const input = document.getElementById('chat-input');
        if (!input) return;

        const message = input.value.trim();
        if (!message) return;

        // Add user message to chat
        this.addChatMessage({
            id: Date.now(),
            message: message,
            sender: 'user',
            timestamp: new Date().toISOString(),
            type: 'text'
        });

        // Clear input
        input.value = '';

        // Send to server (mock)
        if (this.chatSocket) {
            this.chatSocket.send(message);
        }

        // Show typing indicator
        this.showTypingIndicator();
    }

    addChatMessage(messageData) {
        const chatMessages = document.getElementById('chat-messages');
        if (!chatMessages) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${messageData.sender}`;
        messageDiv.innerHTML = `
            <div class="message-content">
                <div class="message-text">${messageData.message}</div>
                <div class="message-time">${this.formatTime(messageData.timestamp)}</div>
            </div>
            ${messageData.sender === 'support' ? '<div class="message-avatar">👨‍💻</div>' : ''}
        `;

        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Add animation
        messageDiv.style.opacity = '0';
        messageDiv.style.transform = 'translateY(20px)';
        setTimeout(() => {
            messageDiv.style.transition = 'all 0.3s ease';
            messageDiv.style.opacity = '1';
            messageDiv.style.transform = 'translateY(0)';
        }, 100);

        this.chatMessages.push(messageData);
    }

    receiveChatMessage(messageData) {
        this.hideTypingIndicator();
        this.addChatMessage(messageData);
        
        // Play notification sound (mock)
        this.playNotificationSound();
    }

    showTypingIndicator() {
        const chatMessages = document.getElementById('chat-messages');
        if (!chatMessages) return;

        const typingDiv = document.createElement('div');
        typingDiv.className = 'typing-indicator';
        typingDiv.id = 'typing-indicator';
        typingDiv.innerHTML = `
            <div class="message-content">
                <div class="typing-animation">
                    <div class="typing-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                    <div class="typing-text">Support is typing...</div>
                </div>
            </div>
            <div class="message-avatar">👨‍💻</div>
        `;

        chatMessages.appendChild(typingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    handleTyping() {
        if (!this.isTyping) {
            this.isTyping = true;
            // In a real implementation, this would send a typing indicator to the server
        }

        // Reset typing timeout
        clearTimeout(this.typingTimeout);
        this.typingTimeout = setTimeout(() => {
            this.isTyping = false;
        }, 1000);
    }

    loadChatHistory() {
        // Mock chat history
        const mockMessages = [
            {
                id: 1,
                message: "Hello! Welcome to ClutchZone support. How can I help you today?",
                sender: 'support',
                timestamp: new Date(Date.now() - 300000).toISOString(),
                type: 'text'
            }
        ];

        mockMessages.forEach(msg => {
            this.addChatMessage(msg);
        });
    }

    checkAgentStatus() {
        // Mock agent status check
        this.supportAgentOnline = Math.random() > 0.3; // 70% chance agent is online
        this.updateAgentStatus();
    }

    updateAgentStatus() {
        const statusElement = document.getElementById('agent-status');
        if (!statusElement) return;

        if (this.supportAgentOnline) {
            statusElement.innerHTML = `
                <div class="status-indicator online"></div>
                <span>Support Agent Online</span>
            `;
        } else {
            statusElement.innerHTML = `
                <div class="status-indicator offline"></div>
                <span>Leave a message</span>
            `;
        }
    }

    setupFAQToggle() {
        // FAQ toggle functionality is handled in the main event listener
        this.loadFAQs();
    }

    loadFAQs() {
        const faqContainer = document.getElementById('faq-list');
        if (!faqContainer) return;

        const faqs = [
            {
                question: "How do I create an account?",
                answer: "To create an account, click the 'Register' button in the top right corner and fill out the registration form with your details. You'll need to verify your email address before you can start using all features."
            },
            {
                question: "How do I join a tournament?",
                answer: "Navigate to the Tournaments section, browse available tournaments, and click 'Join Tournament' on any tournament that interests you. Make sure you meet the requirements and have registered before the deadline."
            },
            {
                question: "Can I upload my own replays?",
                answer: "Yes! Go to the Replays section and click 'Upload Replay'. You can upload video files of your best gaming moments. Supported formats include MP4, AVI, and MOV files up to 500MB."
            },
            {
                question: "How does the ranking system work?",
                answer: "Our ranking system is based on tournament performance, match wins, and community engagement. You earn points for tournament participation, wins, and positive community interactions. Rankings are updated daily."
            },
            {
                question: "Is ClutchZone free to use?",
                answer: "ClutchZone offers both free and premium features. Basic features like account creation, tournament viewing, and community participation are free. Premium features include advanced statistics, priority support, and exclusive tournaments."
            },
            {
                question: "How do I report a bug or issue?",
                answer: "You can report bugs through this contact form by selecting 'Bug Report' as the category, or use the live chat feature. Please include as much detail as possible about the issue you're experiencing."
            },
            {
                question: "Can I change my username?",
                answer: "Yes, you can change your username once every 30 days. Go to your Profile settings and click 'Edit Profile'. Premium users can change their username more frequently."
            },
            {
                question: "How do I enable notifications?",
                answer: "Go to your Profile settings and navigate to the Notifications section. You can customize which types of notifications you receive, including tournament updates, match reminders, and community messages."
            }
        ];

        faqContainer.innerHTML = '';
        faqs.forEach((faq, index) => {
            const faqItem = document.createElement('div');
            faqItem.className = 'faq-item';
            faqItem.innerHTML = `
                <div class="faq-question">
                    <h3>${faq.question}</h3>
                    <button class="faq-toggle" aria-expanded="false">
                        <i class="fas fa-chevron-down"></i>
                    </button>
                </div>
                <div class="faq-answer">
                    <p>${faq.answer}</p>
                </div>
            `;
            faqContainer.appendChild(faqItem);
        });

        // Re-attach FAQ toggle listeners
        this.attachFAQListeners();
    }

    attachFAQListeners() {
        document.querySelectorAll('.faq-toggle').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.toggleFAQ(e.target.closest('.faq-item'));
            });
        });
    }

    setupFAQInteractions() {
        // Set up FAQ question click handlers
        document.querySelectorAll('.faq-question').forEach(question => {
            question.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleFAQ(question.closest('.faq-item'));
            });
        });

        // Set up FAQ toggle button handlers
        document.querySelectorAll('.faq-toggle').forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleFAQ(toggle.closest('.faq-item'));
            });
        });
    }

    toggleFAQ(faqItem) {
        if (!faqItem) return;

        const answer = faqItem.querySelector('.faq-answer');
        const toggle = faqItem.querySelector('.faq-toggle');
        const question = faqItem.querySelector('.faq-question');
        
        if (!answer || !toggle) return;

        const isOpen = faqItem.classList.contains('active');

        // Close all other FAQ items first
        document.querySelectorAll('.faq-item.active').forEach(item => {
            if (item !== faqItem) {
                item.classList.remove('active');
                const otherAnswer = item.querySelector('.faq-answer');
                const otherToggle = item.querySelector('.faq-toggle');
                if (otherAnswer) otherAnswer.style.maxHeight = '0px';
                if (otherToggle) otherToggle.textContent = '+';
            }
        });

        // Toggle current FAQ item
        if (isOpen) {
            // Close
            faqItem.classList.remove('active');
            answer.style.maxHeight = '0px';
            toggle.textContent = '+';
            question.classList.remove('active');
        } else {
            // Open
            faqItem.classList.add('active');
            answer.style.maxHeight = answer.scrollHeight + 'px';
            toggle.textContent = '−';
            question.classList.add('active');
        }

        // Play sound effect
        try {
            if (window.utils && typeof window.utils.playSound === 'function') {
                window.utils.playSound('click');
            }
        } catch (error) {
            console.warn('Sound play failed:', error);
        }
    }

    filterFAQByCategory(category) {
        const faqItems = document.querySelectorAll('.faq-item');
        const categoryBtns = document.querySelectorAll('.faq-category-btn');

        // Update category button states
        categoryBtns.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.category === category) {
                btn.classList.add('active');
            }
        });

        // Show/hide FAQ items based on category
        faqItems.forEach(item => {
            const itemCategory = item.dataset.category;
            if (category === 'all' || itemCategory === category) {
                item.style.display = 'block';
                // Add animation
                gsap.fromTo(item, 
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }
                );
            } else {
                item.style.display = 'none';
            }
        });

        // Play sound effect
        try {
            if (window.utils && typeof window.utils.playSound === 'function') {
                window.utils.playSound('click');
            }
        } catch (error) {
            console.warn('Sound play failed:', error);
        }
    }

    handleFileUpload(files) {
        if (files.length === 0) return;

        const file = files[0];
        const maxSize = 5 * 1024 * 1024; // 5MB

        if (file.size > maxSize) {
            this.showNotification('File size must be less than 5MB', 'error');
            return;
        }

        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain'];
        if (!allowedTypes.includes(file.type)) {
            this.showNotification('File type not supported', 'error');
            return;
        }

        // Show file preview
        const filePreview = document.getElementById('file-preview');
        if (filePreview) {
            filePreview.innerHTML = `
                <div class="file-info">
                    <i class="fas fa-paperclip"></i>
                    <span>${file.name}</span>
                    <button type="button" onclick="contactManager.removeFile()" class="remove-file">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
            filePreview.style.display = 'block';
        }
    }

    removeFile() {
        const fileInput = document.getElementById('attachment');
        const filePreview = document.getElementById('file-preview');
        
        if (fileInput) fileInput.value = '';
        if (filePreview) filePreview.style.display = 'none';
    }

    openSocialMedia(platform) {
        const urls = {
            twitter: 'https://twitter.com/clutchzone',
            discord: 'https://discord.gg/clutchzone',
            youtube: 'https://youtube.com/clutchzone',
            twitch: 'https://twitch.tv/clutchzone',
            facebook: 'https://facebook.com/clutchzone',
            instagram: 'https://instagram.com/clutchzone'
        };

        if (urls[platform]) {
            window.open(urls[platform], '_blank');
        }
    }

    initializeContactForm() {
        // Initialize any contact form specific functionality
        const categorySelect = document.getElementById('category');
        if (categorySelect) {
            categorySelect.addEventListener('change', (e) => {
                this.updateFormBasedOnCategory(e.target.value);
            });
        }
    }

    updateFormBasedOnCategory(category) {
        const priorityGroup = document.getElementById('priority-group');
        
        if (category === 'bug-report' || category === 'technical-issue') {
            if (priorityGroup) priorityGroup.style.display = 'block';
        } else {
            if (priorityGroup) priorityGroup.style.display = 'none';
        }
    }

    initializeLiveChat() {
        // Initialize live chat specific functionality
        const chatInput = document.getElementById('chat-input');
        if (chatInput) {
            chatInput.focus();
        }
    }

    loadContactData() {
        // Load any saved contact data or preferences
        const savedData = localStorage.getItem('contactPreferences');
        if (savedData) {
            try {
                const preferences = JSON.parse(savedData);
                this.applyContactPreferences(preferences);
            } catch (error) {
                console.error('Error loading contact preferences:', error);
            }
        }
    }

    applyContactPreferences(preferences) {
        // Apply saved preferences to the form
        if (preferences.preferredContact) {
            const form = document.getElementById('contact-form');
            if (form) {
                const categorySelect = form.querySelector('#category');
                if (categorySelect) {
                    categorySelect.value = preferences.preferredContact;
                }
            }
        }
    }

    closeModal() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.style.display = 'none';
        });
        document.body.style.overflow = 'auto';
    }

    initializeAnimations() {
        // Initialize scroll animations
        this.setupScrollAnimations();
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

        document.querySelectorAll('.contact-card, .info-card, .faq-item').forEach(element => {
            observer.observe(element);
        });
    }

    playNotificationSound() {
        // Mock notification sound
        // In production, this would play an actual sound file
        console.log('🔊 Notification sound played');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    formatTime(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    destroy() {
        // Clean up when component is destroyed
        if (this.chatSocket) {
            this.chatSocket.close();
        }
        
        if (this.typingTimeout) {
            clearTimeout(this.typingTimeout);
        }
    }
}

// Global FAQ function for contact.html
function toggleFAQ(element) {
    if (window.contactManager && typeof window.contactManager.toggleFAQ === 'function') {
        const faqItem = element.closest('.faq-item');
        window.contactManager.toggleFAQ(faqItem);
    }
}

// Initialize contact manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.contactManager = new ContactManager();
});

// Initialize the contact manager when the page loads
let contactManager;

document.addEventListener('DOMContentLoaded', () => {
    contactManager = new ContactManager();
});

// Add animation CSS
const style = document.createElement('style');
style.textContent = `
    .animate-in {
        animation: slideInUp 0.6s ease-out forwards;
    }
    
    @keyframes slideInUp {
        from {
            opacity: 0;
            transform: translateY(50px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .field-error {
        color: #ff4444;
        font-size: 0.9rem;
        margin-top: 0.5rem;
        font-family: 'Rajdhani', sans-serif;
    }
    
    .error {
        border-color: #ff4444 !important;
        box-shadow: 0 0 10px rgba(255, 68, 68, 0.3) !important;
    }
    
    .chat-message {
        display: flex;
        margin-bottom: 1rem;
        gap: 1rem;
    }
    
    .chat-message.user {
        justify-content: flex-end;
    }
    
    .chat-message.user .message-content {
        background: linear-gradient(135deg, #00ffff, #0080ff);
        color: #000;
        border-radius: 20px 20px 5px 20px;
    }
    
    .chat-message.support .message-content {
        background: rgba(255, 255, 255, 0.1);
        color: #fff;
        border-radius: 20px 20px 20px 5px;
    }
    
    .message-content {
        padding: 1rem;
        max-width: 70%;
        position: relative;
    }
    
    .message-text {
        margin-bottom: 0.5rem;
        line-height: 1.4;
    }
    
    .message-time {
        font-size: 0.8rem;
        opacity: 0.7;
        font-family: 'Rajdhani', sans-serif;
    }
    
    .message-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: linear-gradient(135deg, #2d1b69, #4a4a8a);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.2rem;
        flex-shrink: 0;
    }
    
    .typing-indicator {
        display: flex;
        gap: 1rem;
        margin-bottom: 1rem;
    }
    
    .typing-animation {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .typing-dots {
        display: flex;
        gap: 0.3rem;
    }
    
    .typing-dots span {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #00ffff;
        animation: typing 1.4s infinite;
    }
    
    .typing-dots span:nth-child(2) {
        animation-delay: 0.2s;
    }
    
    .typing-dots span:nth-child(3) {
        animation-delay: 0.4s;
    }
    
    @keyframes typing {
        0%, 60%, 100% {
            transform: translateY(0);
            opacity: 0.4;
        }
        30% {
            transform: translateY(-10px);
            opacity: 1;
        }
    }
    
    .typing-text {
        color: #b8b8d4;
        font-size: 0.9rem;
        font-style: italic;
    }
    
    .status-indicator {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        display: inline-block;
        margin-right: 0.5rem;
    }
    
    .status-indicator.online {
        background: #00ff88;
        box-shadow: 0 0 10px rgba(0, 255, 136, 0.5);
    }
    
    .status-indicator.offline {
        background: #ff4444;
        box-shadow: 0 0 10px rgba(255, 68, 68, 0.5);
    }
    
    .file-info {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 5px;
        margin-top: 0.5rem;
    }
    
    .remove-file {
        background: none;
        border: none;
        color: #ff4444;
        cursor: pointer;
        padding: 0.2rem;
        border-radius: 3px;
        transition: background 0.3s ease;
    }
    
    .remove-file:hover {
        background: rgba(255, 68, 68, 0.2);
    }
    
    #file-preview {
        display: none;
    }
`;
document.head.appendChild(style);

// Clean up on page unload
window.addEventListener('beforeunload', () => {
    if (contactManager) {
        contactManager.destroy();
    }
});

// Export for global access
window.contactManager = contactManager;
