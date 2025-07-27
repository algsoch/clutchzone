// ClutchZone Notification System
class NotificationSystem {
    constructor() {
        this.notifications = [];
        this.container = null;
        this.maxNotifications = 5;
        this.autoHideDelay = 5000;
        this.sounds = window.soundManager || null;
        this.init();
    }

    init() {
        this.createContainer();
        this.bindEvents();
        this.requestPermission();
    }

    createContainer() {
        this.container = document.createElement('div');
        this.container.id = 'notification-container';
        this.container.className = 'notification-container';
        document.body.appendChild(this.container);

        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .notification-container {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                max-width: 400px;
                pointer-events: none;
            }

            .notification {
                background: linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(45, 45, 45, 0.95) 100%);
                backdrop-filter: blur(20px);
                border-radius: 12px;
                padding: 16px 20px;
                margin-bottom: 12px;
                border: 1px solid rgba(255, 107, 53, 0.3);
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                transform: translateX(100%);
                opacity: 0;
                animation: slideIn 0.3s ease-out forwards;
                pointer-events: auto;
                cursor: pointer;
                transition: all 0.3s ease;
                position: relative;
                overflow: hidden;
            }

            .notification:hover {
                transform: translateX(0) scale(1.02);
                border-color: rgba(255, 107, 53, 0.5);
                box-shadow: 0 12px 48px rgba(255, 107, 53, 0.2);
            }

            .notification.success {
                border-color: rgba(34, 197, 94, 0.5);
                background: linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(26, 26, 26, 0.95) 100%);
            }

            .notification.error {
                border-color: rgba(239, 68, 68, 0.5);
                background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(26, 26, 26, 0.95) 100%);
            }

            .notification.warning {
                border-color: rgba(245, 158, 11, 0.5);
                background: linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(26, 26, 26, 0.95) 100%);
            }

            .notification.info {
                border-color: rgba(59, 130, 246, 0.5);
                background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(26, 26, 26, 0.95) 100%);
            }

            .notification::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 2px;
                background: linear-gradient(90deg, 
                    rgba(255, 107, 53, 0.8) 0%, 
                    rgba(247, 147, 30, 0.8) 100%);
                animation: progressBar var(--duration, 5s) linear forwards;
            }

            .notification.success::before {
                background: linear-gradient(90deg, 
                    rgba(34, 197, 94, 0.8) 0%, 
                    rgba(16, 185, 129, 0.8) 100%);
            }

            .notification.error::before {
                background: linear-gradient(90deg, 
                    rgba(239, 68, 68, 0.8) 0%, 
                    rgba(220, 38, 38, 0.8) 100%);
            }

            .notification.warning::before {
                background: linear-gradient(90deg, 
                    rgba(245, 158, 11, 0.8) 0%, 
                    rgba(217, 119, 6, 0.8) 100%);
            }

            .notification.info::before {
                background: linear-gradient(90deg, 
                    rgba(59, 130, 246, 0.8) 0%, 
                    rgba(37, 99, 235, 0.8) 100%);
            }

            .notification-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 8px;
            }

            .notification-title {
                font-size: 14px;
                font-weight: 600;
                color: white;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .notification-icon {
                font-size: 16px;
                width: 20px;
                height: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.1);
            }

            .notification-close {
                background: none;
                border: none;
                color: rgba(255, 255, 255, 0.6);
                font-size: 18px;
                cursor: pointer;
                padding: 0;
                width: 20px;
                height: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: all 0.2s ease;
            }

            .notification-close:hover {
                color: white;
                background: rgba(255, 255, 255, 0.1);
            }

            .notification-message {
                font-size: 13px;
                color: rgba(255, 255, 255, 0.9);
                line-height: 1.4;
            }

            .notification-actions {
                margin-top: 12px;
                display: flex;
                gap: 8px;
            }

            .notification-action {
                padding: 6px 12px;
                border: 1px solid rgba(255, 107, 53, 0.3);
                background: rgba(255, 107, 53, 0.1);
                color: #ff6b35;
                border-radius: 6px;
                font-size: 12px;
                cursor: pointer;
                transition: all 0.2s ease;
            }

            .notification-action:hover {
                background: rgba(255, 107, 53, 0.2);
                border-color: rgba(255, 107, 53, 0.5);
            }

            .notification-action.secondary {
                border-color: rgba(255, 255, 255, 0.2);
                background: rgba(255, 255, 255, 0.1);
                color: white;
            }

            .notification-action.secondary:hover {
                background: rgba(255, 255, 255, 0.2);
            }

            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }

            @keyframes slideOut {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }

            @keyframes progressBar {
                from {
                    width: 100%;
                }
                to {
                    width: 0%;
                }
            }

            .notification.removing {
                animation: slideOut 0.3s ease-in forwards;
            }

            @media (max-width: 768px) {
                .notification-container {
                    left: 20px;
                    right: 20px;
                    max-width: none;
                }

                .notification {
                    margin-bottom: 8px;
                }
            }
        `;
        document.head.appendChild(style);
    }

    bindEvents() {
        // Listen for API events
        if (window.api) {
            window.api.onError((error) => {
                this.show({
                    type: 'error',
                    title: 'Error',
                    message: window.api.formatError(error),
                    duration: 7000
                });
            });

            window.api.onLoadingChange((loading) => {
                if (loading) {
                    this.showLoading();
                } else {
                    this.hideLoading();
                }
            });
        }

        // Listen for custom events
        window.addEventListener('tournamentUpdate', (event) => {
            this.show({
                type: 'info',
                title: 'Tournament Update',
                message: `Tournament "${event.detail.name}" has been updated`,
                duration: 4000
            });
        });

        window.addEventListener('matchResult', (event) => {
            this.show({
                type: 'success',
                title: 'Match Result',
                message: `Match completed: ${event.detail.result}`,
                duration: 6000
            });
        });

        window.addEventListener('leaderboardUpdate', (event) => {
            this.show({
                type: 'info',
                title: 'Leaderboard',
                message: 'Leaderboard has been updated',
                duration: 3000
            });
        });

        window.addEventListener('notification', (event) => {
            this.show(event.detail);
        });
    }

    requestPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }

    show(options = {}) {
        const notification = {
            id: Date.now() + Math.random(),
            type: options.type || 'info',
            title: options.title || 'Notification',
            message: options.message || '',
            duration: options.duration || this.autoHideDelay,
            actions: options.actions || [],
            onClick: options.onClick || null,
            persistent: options.persistent || false,
            sound: options.sound !== false
        };

        // Play sound if enabled
        if (notification.sound && this.sounds) {
            this.sounds.playUISound('notification');
        }

        // Show browser notification if permission granted
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(notification.title, {
                body: notification.message,
                icon: '/favicon.ico',
                tag: notification.id
            });
        }

        // Add to notifications array
        this.notifications.push(notification);

        // Remove old notifications if exceeding limit
        if (this.notifications.length > this.maxNotifications) {
            const oldNotification = this.notifications.shift();
            this.remove(oldNotification.id);
        }

        // Create DOM element
        this.createNotificationElement(notification);

        // Auto-hide if not persistent
        if (!notification.persistent) {
            setTimeout(() => {
                this.remove(notification.id);
            }, notification.duration);
        }

        return notification.id;
    }

    createNotificationElement(notification) {
        const element = document.createElement('div');
        element.className = `notification ${notification.type}`;
        element.dataset.id = notification.id;
        element.style.setProperty('--duration', notification.duration + 'ms');

        const icon = this.getIcon(notification.type);
        
        element.innerHTML = `
            <div class="notification-header">
                <div class="notification-title">
                    <span class="notification-icon">${icon}</span>
                    ${notification.title}
                </div>
                <button class="notification-close" title="Close">&times;</button>
            </div>
            <div class="notification-message">${notification.message}</div>
            ${notification.actions.length > 0 ? `
                <div class="notification-actions">
                    ${notification.actions.map(action => `
                        <button class="notification-action ${action.type || ''}" 
                                data-action="${action.id}">${action.label}</button>
                    `).join('')}
                </div>
            ` : ''}
        `;

        // Add event listeners
        element.addEventListener('click', (e) => {
            if (e.target.classList.contains('notification-close')) {
                this.remove(notification.id);
            } else if (e.target.classList.contains('notification-action')) {
                const actionId = e.target.dataset.action;
                const action = notification.actions.find(a => a.id === actionId);
                if (action && action.onClick) {
                    action.onClick();
                }
                if (action && action.closeOnClick !== false) {
                    this.remove(notification.id);
                }
            } else if (notification.onClick) {
                notification.onClick();
            }
        });

        this.container.appendChild(element);
    }

    getIcon(type) {
        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };
        return icons[type] || icons.info;
    }

    remove(id) {
        const element = this.container.querySelector(`[data-id="${id}"]`);
        if (element) {
            element.classList.add('removing');
            setTimeout(() => {
                element.remove();
            }, 300);
        }

        // Remove from notifications array
        this.notifications = this.notifications.filter(n => n.id !== id);
    }

    clear() {
        this.notifications.forEach(notification => {
            this.remove(notification.id);
        });
        this.notifications = [];
    }

    showLoading() {
        if (this.loadingNotification) return;

        this.loadingNotification = this.show({
            type: 'info',
            title: 'Loading...',
            message: 'Please wait while we process your request',
            persistent: true,
            sound: false
        });
    }

    hideLoading() {
        if (this.loadingNotification) {
            this.remove(this.loadingNotification);
            this.loadingNotification = null;
        }
    }

    // Preset notification types
    success(title, message, options = {}) {
        return this.show({
            type: 'success',
            title,
            message,
            ...options
        });
    }

    error(title, message, options = {}) {
        return this.show({
            type: 'error',
            title,
            message,
            duration: 7000,
            ...options
        });
    }

    warning(title, message, options = {}) {
        return this.show({
            type: 'warning',
            title,
            message,
            duration: 6000,
            ...options
        });
    }

    info(title, message, options = {}) {
        return this.show({
            type: 'info',
            title,
            message,
            ...options
        });
    }

    // Game-specific notifications
    tournamentStarted(tournament) {
        this.success('Tournament Started', `${tournament.name} has begun!`, {
            actions: [
                {
                    id: 'view',
                    label: 'View Tournament',
                    onClick: () => window.location.href = `tournaments/tournaments.html?id=${tournament.id}`
                }
            ]
        });
    }

    tournamentEnded(tournament) {
        this.info('Tournament Ended', `${tournament.name} has concluded`, {
            actions: [
                {
                    id: 'results',
                    label: 'View Results',
                    onClick: () => window.location.href = `tournaments/tournaments.html?id=${tournament.id}`
                }
            ]
        });
    }

    xpGained(amount, reason) {
        this.success('XP Gained', `+${amount} XP for ${reason}`, {
            duration: 4000
        });
    }

    levelUp(newLevel) {
        this.success('Level Up!', `Congratulations! You've reached level ${newLevel}`, {
            duration: 6000,
            actions: [
                {
                    id: 'profile',
                    label: 'View Profile',
                    onClick: () => window.location.href = 'profile/profile.html'
                }
            ]
        });
    }

    matchFound(match) {
        this.info('Match Found', `Your match is ready to start!`, {
            actions: [
                {
                    id: 'join',
                    label: 'Join Match',
                    onClick: () => window.location.href = `match/match.html?id=${match.id}`
                }
            ]
        });
    }
}

// Create global notification system
const notifications = new NotificationSystem();

// Make available globally
window.notifications = notifications;

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { NotificationSystem, notifications };
}
