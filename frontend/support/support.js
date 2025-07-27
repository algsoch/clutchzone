// Support Page JavaScript
class SupportPage {
    constructor() {
        this.isLoading = false;
        this.chatMessages = [];
        this.tickets = [];
        
        this.initializeEventListeners();
        this.initializeChatBot();
        this.loadSupportData();
    }
    
    initializeEventListeners() {
        // Live Chat Modal
        const liveChatBtn = document.getElementById('liveChatBtn');
        const liveChatModal = document.getElementById('liveChatModal');
        const closeChatModal = document.getElementById('closeChatModal');
        const sendChatBtn = document.getElementById('sendChatBtn');
        const chatInput = document.getElementById('chatInput');
        
        if (liveChatBtn) {
            liveChatBtn.addEventListener('click', () => this.openLiveChat());
        }
        
        if (closeChatModal) {
            closeChatModal.addEventListener('click', () => this.closeLiveChat());
        }
        
        if (sendChatBtn) {
            sendChatBtn.addEventListener('click', () => this.sendChatMessage());
        }
        
        if (chatInput) {
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendChatMessage();
                }
            });
        }
        
        // Ticket Modal
        const createTicketBtn = document.getElementById('createTicketBtn');
        const ticketModal = document.getElementById('ticketModal');
        const closeTicketModal = document.getElementById('closeTicketModal');
        const ticketForm = document.getElementById('ticketForm');
        
        if (createTicketBtn) {
            createTicketBtn.addEventListener('click', () => this.openTicketModal());
        }
        
        if (closeTicketModal) {
            closeTicketModal.addEventListener('click', () => this.closeTicketModal());
        }
        
        if (ticketForm) {
            ticketForm.addEventListener('submit', (e) => this.createTicket(e));
        }
        
        // Category Help Buttons
        const categoryBtns = document.querySelectorAll('.category-btn');
        categoryBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleCategoryHelp(e));
        });
        
        // Action Buttons
        const knowledgeBtn = document.getElementById('knowledgeBtn');
        const videoBtn = document.getElementById('videoBtn');
        
        if (knowledgeBtn) {
            knowledgeBtn.addEventListener('click', () => this.openKnowledgeBase());
        }
        
        if (videoBtn) {
            videoBtn.addEventListener('click', () => this.openVideoTutorials());
        }
        
        // Close modals when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === liveChatModal) {
                this.closeLiveChat();
            }
            if (e.target === ticketModal) {
                this.closeTicketModal();
            }
        });
    }
    
    initializeChatBot() {
        // Add some initial bot responses
        this.botResponses = {
            'hello': 'Hello! How can I help you today?',
            'payment': 'I can help you with payment issues. What specific problem are you experiencing?',
            'tournament': 'For tournament-related questions, I can guide you through registration, rules, and schedules.',
            'account': 'Account issues can be frustrating. Let me help you resolve them quickly.',
            'technical': 'Technical problems? I\'ll help you troubleshoot step by step.',
            'refund': 'I can help process your refund request. Please provide your transaction ID.',
            'default': 'I understand your concern. Let me connect you with a specialist who can help you better.'
        };
        
        // Simulate typing indicator
        this.typingIndicator = null;
    }
    
    loadSupportData() {
        // Simulate loading support statistics
        this.updateSupportStats();
        
        // Initialize animations
        this.initializeAnimations();
    }
    
    updateSupportStats() {
        // Update support status indicators
        const statusCards = document.querySelectorAll('.status-card');
        statusCards.forEach(card => {
            const indicator = card.querySelector('.status-indicator');
            if (indicator) {
                // Simulate real-time status updates
                this.updateStatusIndicator(indicator);
            }
        });
    }
    
    updateStatusIndicator(indicator) {
        // Simulate different status states
        const statuses = ['online', 'busy', 'offline'];
        const currentStatus = statuses[Math.floor(Math.random() * statuses.length)];
        
        indicator.className = `status-indicator ${currentStatus}`;
    }
    
    initializeAnimations() {
        // Animate support cards on scroll
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animation = 'slideInUp 0.6s ease forwards';
                }
            });
        });
        
        document.querySelectorAll('.action-card, .category-card, .status-card').forEach(card => {
            observer.observe(card);
        });
    }
    
    openLiveChat() {
        const modal = document.getElementById('liveChatModal');
        if (modal) {
            modal.style.display = 'block';
            
            // Focus on chat input
            setTimeout(() => {
                const chatInput = document.getElementById('chatInput');
                if (chatInput) {
                    chatInput.focus();
                }
            }, 100);
            
            // Play sound
            if (window.utils && window.utils.playSound) {
                window.utils.playSound('notification');
            }
        }
    }
    
    closeLiveChat() {
        const modal = document.getElementById('liveChatModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }
    
    sendChatMessage() {
        const chatInput = document.getElementById('chatInput');
        const chatMessages = document.getElementById('chatMessages');
        
        if (!chatInput || !chatMessages) return;
        
        const message = chatInput.value.trim();
        if (!message) return;
        
        // Add user message
        this.addChatMessage(message, 'user');
        
        // Clear input
        chatInput.value = '';
        
        // Show typing indicator
        this.showTypingIndicator();
        
        // Simulate bot response
        setTimeout(() => {
            this.hideTypingIndicator();
            const botResponse = this.getBotResponse(message);
            this.addChatMessage(botResponse, 'bot');
        }, 1000 + Math.random() * 2000);
    }
    
    addChatMessage(message, sender) {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        
        const avatar = sender === 'user' ? '👤' : '🤖';
        const time = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        
        messageDiv.innerHTML = `
            <div class="message-avatar">${avatar}</div>
            <div class="message-content">
                <p>${message}</p>
                <span class="message-time">${time}</span>
            </div>
        `;
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Add to messages array
        this.chatMessages.push({
            message,
            sender,
            timestamp: new Date()
        });
    }
    
    showTypingIndicator() {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;
        
        this.typingIndicator = document.createElement('div');
        this.typingIndicator.className = 'message bot typing';
        this.typingIndicator.innerHTML = `
            <div class="message-avatar">🤖</div>
            <div class="message-content">
                <p>Sarah is typing...</p>
            </div>
        `;
        
        chatMessages.appendChild(this.typingIndicator);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    hideTypingIndicator() {
        if (this.typingIndicator) {
            this.typingIndicator.remove();
            this.typingIndicator = null;
        }
    }
    
    getBotResponse(message) {
        const lowerMessage = message.toLowerCase();
        
        // Check for keywords
        for (const [keyword, response] of Object.entries(this.botResponses)) {
            if (lowerMessage.includes(keyword)) {
                return response;
            }
        }
        
        return this.botResponses.default;
    }
    
    openTicketModal() {
        const modal = document.getElementById('ticketModal');
        if (modal) {
            modal.style.display = 'block';
            
            // Focus on first input
            setTimeout(() => {
                const firstInput = modal.querySelector('select, input');
                if (firstInput) {
                    firstInput.focus();
                }
            }, 100);
        }
    }
    
    closeTicketModal() {
        const modal = document.getElementById('ticketModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }
    
    async createTicket(event) {
        event.preventDefault();
        
        if (this.isLoading) return;
        
        const formData = new FormData(event.target);
        const ticketData = {
            category: formData.get('category'),
            priority: formData.get('priority'),
            subject: formData.get('subject'),
            description: formData.get('description'),
            attachment: formData.get('attachment')
        };
        
        // Validate form
        if (!this.validateTicketForm(ticketData)) {
            return;
        }
        
        this.setLoading(true);
        
        try {
            // Simulate API call
            await this.simulateTicketCreation(ticketData);
            
            // Show success message
            this.showSuccessMessage('Ticket created successfully! We\'ll get back to you soon.');
            
            // Close modal
            this.closeTicketModal();
            
            // Reset form
            event.target.reset();
            
        } catch (error) {
            console.error('Ticket creation failed:', error);
            this.showErrorMessage('Failed to create ticket. Please try again.');
        } finally {
            this.setLoading(false);
        }
    }
    
    validateTicketForm(data) {
        if (!data.category) {
            this.showErrorMessage('Please select a category.');
            return false;
        }
        
        if (!data.subject.trim()) {
            this.showErrorMessage('Please enter a subject.');
            return false;
        }
        
        if (!data.description.trim()) {
            this.showErrorMessage('Please enter a description.');
            return false;
        }
        
        return true;
    }
    
    async simulateTicketCreation(ticketData) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Generate ticket ID
        const ticketId = 'TKT-' + Math.random().toString(36).substr(2, 9).toUpperCase();
        
        // Add to tickets array
        this.tickets.push({
            id: ticketId,
            ...ticketData,
            status: 'Open',
            createdAt: new Date(),
            updatedAt: new Date()
        });
        
        return ticketId;
    }
    
    handleCategoryHelp(event) {
        const card = event.target.closest('.category-card');
        if (!card) return;
        
        const category = card.classList[1]; // Get category class
        
        // Show category-specific help
        this.showCategoryHelp(category);
    }
    
    showCategoryHelp(category) {
        const helpMessages = {
            'account': 'Account help is available! You can reset your password, update your profile, or contact support for verification issues.',
            'payment': 'Payment support is here! We can help with failed transactions, refunds, and wallet issues.',
            'tournament': 'Tournament support ready! Get help with registration, rules, disputes, and prize distribution.',
            'technical': 'Technical support available! We can help with app issues, performance problems, and connectivity.'
        };
        
        const message = helpMessages[category] || 'Help is available for this category!';
        this.showInfoMessage(message);
    }
    
    openKnowledgeBase() {
        // In a real implementation, this would navigate to the knowledge base
        window.open('../help/help.html', '_blank');
    }
    
    openVideoTutorials() {
        // In a real implementation, this would navigate to video tutorials
        this.showInfoMessage('Video tutorials coming soon! Check back later for step-by-step guides.');
    }
    
    setLoading(loading) {
        this.isLoading = loading;
        
        const submitBtn = document.querySelector('#ticketForm button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = loading;
            submitBtn.textContent = loading ? 'Creating...' : 'Create Ticket';
        }
    }
    
    showSuccessMessage(message) {
        if (window.utils && window.utils.showNotification) {
            window.utils.showNotification(message, 'success');
        } else {
            alert(message);
        }
    }
    
    showErrorMessage(message) {
        if (window.utils && window.utils.showNotification) {
            window.utils.showNotification(message, 'error');
        } else {
            alert(message);
        }
    }
    
    showInfoMessage(message) {
        if (window.utils && window.utils.showNotification) {
            window.utils.showNotification(message, 'info');
        } else {
            alert(message);
        }
    }
}

// Initialize Support Page
document.addEventListener('DOMContentLoaded', function() {
    window.supportPage = new SupportPage();
});

// Add slide-in animation CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .typing .message-content p {
        animation: typing 1s infinite;
    }
    
    @keyframes typing {
        0%, 50% { opacity: 1; }
        51%, 100% { opacity: 0.5; }
    }
`;
document.head.appendChild(style);
