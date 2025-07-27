// ClutchZone Cookie Policy Page JavaScript
// Advanced cookie management and user preferences

class ClutchZoneCookies {
    constructor() {
        this.cookiePreferences = this.loadCookiePreferences();
        this.init();
    }

    init() {
        this.setupToggleSwitches();
        this.setupActionButtons();
        this.initializeAnimations();
        this.loadUserPreferences();
        this.trackPageVisit();
    }

    // Load existing cookie preferences from localStorage
    loadCookiePreferences() {
        try {
            const saved = localStorage.getItem('clutchzone_cookie_preferences');
            return saved ? JSON.parse(saved) : {
                essential: true,
                performance: true,
                gaming: true,
                marketing: false
            };
        } catch (error) {
            console.warn('Failed to load cookie preferences:', error);
            return {
                essential: true,
                performance: true,
                gaming: true,
                marketing: false
            };
        }
    }

    // Save cookie preferences to localStorage
    saveCookiePreferences() {
        try {
            localStorage.setItem('clutchzone_cookie_preferences', JSON.stringify(this.cookiePreferences));
            this.applyCookieSettings();
            this.showNotification('Cookie preferences saved successfully!', 'success');
            this.trackUserAction('preferences_saved', this.cookiePreferences);
        } catch (error) {
            console.error('Failed to save cookie preferences:', error);
            this.showNotification('Failed to save preferences. Please try again.', 'error');
        }
    }

    // Setup toggle switch functionality
    setupToggleSwitches() {
        const toggles = document.querySelectorAll('.toggle-switch input[type="checkbox"]');
        
        toggles.forEach(toggle => {
            if (!toggle.disabled) {
                toggle.addEventListener('change', (e) => {
                    const category = e.target.id;
                    this.cookiePreferences[category] = e.target.checked;
                    this.updateToggleLabel(toggle, e.target.checked);
                    this.trackUserAction('toggle_changed', { category, enabled: e.target.checked });
                });
            }
        });
    }

    // Update toggle switch labels
    updateToggleLabel(toggle, isEnabled) {
        const label = toggle.nextElementSibling;
        if (label) {
            label.textContent = isEnabled ? 'Enabled' : 'Disabled';
            label.style.color = isEnabled ? 'var(--primary-color)' : 'var(--text-muted)';
        }
    }

    // Setup action buttons
    setupActionButtons() {
        const saveBtn = document.getElementById('savePreferences');
        const acceptAllBtn = document.getElementById('acceptAll');
        const rejectAllBtn = document.getElementById('rejectAll');

        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.saveCookiePreferences();
            });
        }

        if (acceptAllBtn) {
            acceptAllBtn.addEventListener('click', () => {
                this.acceptAllCookies();
            });
        }

        if (rejectAllBtn) {
            rejectAllBtn.addEventListener('click', () => {
                this.rejectOptionalCookies();
            });
        }
    }

    // Accept all cookies
    acceptAllCookies() {
        this.cookiePreferences = {
            essential: true,
            performance: true,
            gaming: true,
            marketing: true
        };
        
        this.updateAllToggles();
        this.saveCookiePreferences();
        this.trackUserAction('accept_all_cookies');
    }

    // Reject optional cookies
    rejectOptionalCookies() {
        this.cookiePreferences = {
            essential: true,
            performance: false,
            gaming: false,
            marketing: false
        };
        
        this.updateAllToggles();
        this.saveCookiePreferences();
        this.trackUserAction('reject_optional_cookies');
    }

    // Update all toggle switches based on preferences
    updateAllToggles() {
        Object.entries(this.cookiePreferences).forEach(([category, enabled]) => {
            const toggle = document.getElementById(category);
            if (toggle && !toggle.disabled) {
                toggle.checked = enabled;
                this.updateToggleLabel(toggle, enabled);
            }
        });
    }

    // Load and display user preferences
    loadUserPreferences() {
        this.updateAllToggles();
        this.applyCookieSettings();
    }

    // Apply cookie settings to the website
    applyCookieSettings() {
        // Essential cookies (always enabled)
        this.setEssentialCookies();

        // Performance cookies
        if (this.cookiePreferences.performance) {
            this.enablePerformanceTracking();
        } else {
            this.disablePerformanceTracking();
        }

        // Gaming cookies
        if (this.cookiePreferences.gaming) {
            this.enableGamingAnalytics();
        } else {
            this.disableGamingAnalytics();
        }

        // Marketing cookies
        if (this.cookiePreferences.marketing) {
            this.enableMarketingTracking();
        } else {
            this.disableMarketingTracking();
        }

        // Update cookie banner if present
        this.updateCookieBanner();
    }

    // Set essential cookies (always required)
    setEssentialCookies() {
        // Session management
        this.setCookie('session_id', this.generateSessionId(), 0); // Session cookie
        
        // User preferences
        this.setCookie('user_preferences', JSON.stringify({
            theme: 'dark',
            language: 'en',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        }), 365);

        console.log('Essential cookies set');
    }

    // Enable performance tracking (Google Analytics, etc.)
    enablePerformanceTracking() {
        // Google Analytics
        if (typeof gtag !== 'undefined') {
            gtag('consent', 'update', {
                'analytics_storage': 'granted'
            });
        }

        // Performance monitoring
        this.setCookie('_ga', this.generateGAId(), 730);
        this.setCookie('performance_tracking', 'enabled', 365);
        
        console.log('Performance tracking enabled');
    }

    disablePerformanceTracking() {
        if (typeof gtag !== 'undefined') {
            gtag('consent', 'update', {
                'analytics_storage': 'denied'
            });
        }

        this.deleteCookie('_ga');
        this.deleteCookie('performance_tracking');
        
        console.log('Performance tracking disabled');
    }

    // Enable gaming analytics
    enableGamingAnalytics() {
        this.setCookie('game_stats', 'enabled', 365);
        this.setCookie('tournament_data', 'enabled', 730);
        
        // Initialize gaming analytics
        this.initializeGamingAnalytics();
        
        console.log('Gaming analytics enabled');
    }

    disableGamingAnalytics() {
        this.deleteCookie('game_stats');
        this.deleteCookie('tournament_data');
        
        console.log('Gaming analytics disabled');
    }

    // Enable marketing tracking
    enableMarketingTracking() {
        if (typeof gtag !== 'undefined') {
            gtag('consent', 'update', {
                'ad_storage': 'granted',
                'ad_user_data': 'granted',
                'ad_personalization': 'granted'
            });
        }

        this.setCookie('ad_targeting', 'enabled', 90);
        this.setCookie('marketing_tracking', 'enabled', 90);
        
        console.log('Marketing tracking enabled');
    }

    disableMarketingTracking() {
        if (typeof gtag !== 'undefined') {
            gtag('consent', 'update', {
                'ad_storage': 'denied',
                'ad_user_data': 'denied',
                'ad_personalization': 'denied'
            });
        }

        this.deleteCookie('ad_targeting');
        this.deleteCookie('marketing_tracking');
        
        console.log('Marketing tracking disabled');
    }

    // Cookie utility functions
    setCookie(name, value, days) {
        let expires = '';
        if (days) {
            const date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = '; expires=' + date.toUTCString();
        }
        document.cookie = `${name}=${value}${expires}; path=/; SameSite=Lax; Secure`;
    }

    deleteCookie(name) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    }

    getCookie(name) {
        const nameEQ = name + '=';
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }

    // Generate unique IDs
    generateSessionId() {
        return 'sess_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
    }

    generateGAId() {
        return 'GA1.1.' + Math.random().toString(36).substr(2, 9) + '.' + Math.floor(Date.now() / 1000);
    }

    // Initialize gaming analytics
    initializeGamingAnalytics() {
        // Track gaming preferences
        const gamingData = {
            favoriteGames: [],
            skillLevel: 'beginner',
            preferredGameModes: [],
            lastPlayed: null
        };

        this.setCookie('gaming_preferences', JSON.stringify(gamingData), 365);
    }

    // Update cookie banner if present on other pages
    updateCookieBanner() {
        const banner = document.querySelector('.cookie-banner');
        if (banner) {
            // Hide banner if preferences are set
            banner.style.display = 'none';
        }

        // Dispatch custom event for other components
        window.dispatchEvent(new CustomEvent('cookiePreferencesUpdated', {
            detail: this.cookiePreferences
        }));
    }

    // Initialize animations
    initializeAnimations() {
        this.animateOnScroll();
        this.addHoverEffects();
        this.initializeParticleEffects();
    }

    // Animate elements on scroll
    animateOnScroll() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, { threshold: 0.1 });

        // Observe cards and sections
        document.querySelectorAll('.info-card, .right-item, .control-category').forEach(el => {
            observer.observe(el);
        });
    }

    // Add hover effects
    addHoverEffects() {
        const cards = document.querySelectorAll('.info-card, .right-item');
        
        cards.forEach(card => {
            card.addEventListener('mouseenter', (e) => {
                this.createHoverParticles(e.target);
            });
        });
    }

    // Create particle effects on hover
    createHoverParticles(element) {
        for (let i = 0; i < 5; i++) {
            const particle = document.createElement('div');
            particle.className = 'hover-particle';
            particle.style.cssText = `
                position: absolute;
                width: 4px;
                height: 4px;
                background: var(--primary-color);
                border-radius: 50%;
                pointer-events: none;
                animation: particleFly 0.8s ease-out forwards;
                top: ${Math.random() * 100}%;
                left: ${Math.random() * 100}%;
                z-index: 1000;
            `;
            
            element.style.position = 'relative';
            element.appendChild(particle);
            
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            }, 800);
        }
    }

    // Initialize particle effects
    initializeParticleEffects() {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes particleFly {
                0% {
                    opacity: 1;
                    transform: scale(1) translate(0, 0);
                }
                100% {
                    opacity: 0;
                    transform: scale(0) translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px);
                }
            }
            
            .animate-in {
                animation: slideInUp 0.6s ease-out forwards;
            }
            
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
        `;
        document.head.appendChild(style);
    }

    // Show notification
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `cookie-notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-triangle' : 'info-circle'}"></i>
                <span>${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;

        // Styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--surface-color);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 1rem;
            z-index: 10000;
            max-width: 400px;
            box-shadow: var(--cyber-glow);
            animation: slideInRight 0.3s ease-out;
        `;

        const content = notification.querySelector('.notification-content');
        content.style.cssText = `
            display: flex;
            align-items: center;
            gap: 0.8rem;
            color: var(--text-primary);
        `;

        const icon = content.querySelector('i');
        icon.style.color = type === 'success' ? 'var(--success-color)' : 
                          type === 'error' ? 'var(--error-color)' : 
                          'var(--primary-color)';

        const closeBtn = content.querySelector('.notification-close');
        closeBtn.style.cssText = `
            background: none;
            border: none;
            color: var(--text-secondary);
            cursor: pointer;
            font-size: 1.2rem;
            margin-left: auto;
        `;

        document.body.appendChild(notification);

        // Auto remove
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-in forwards';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 4000);

        // Manual close
        closeBtn.addEventListener('click', () => {
            notification.style.animation = 'slideOutRight 0.3s ease-in forwards';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        });

        // Add animation styles
        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOutRight {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }

    // Track user actions
    trackUserAction(action, data = null) {
        if (!this.cookiePreferences.performance) return;

        // Google Analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', action, {
                event_category: 'cookie_management',
                event_label: data ? JSON.stringify(data) : null,
                value: 1
            });
        }

        // Custom analytics
        const eventData = {
            action,
            data,
            page: 'cookies',
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
        };

        // Send to backend if available
        fetch('/api/analytics/track', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(eventData)
        }).catch(error => {
            console.warn('Analytics tracking failed:', error);
        });

        console.log('Cookie action tracked:', action, data);
    }

    // Track page visit
    trackPageVisit() {
        this.trackUserAction('page_visit', {
            page: 'cookies',
            referrer: document.referrer,
            preferences: this.cookiePreferences
        });
    }

    // Export preferences (for GDPR compliance)
    exportPreferences() {
        const data = {
            preferences: this.cookiePreferences,
            timestamp: new Date().toISOString(),
            version: '1.0'
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'clutchzone-cookie-preferences.json';
        a.click();
        URL.revokeObjectURL(url);

        this.trackUserAction('preferences_exported');
    }

    // Clear all data
    clearAllData() {
        if (confirm('This will clear all your data and cookies. Are you sure?')) {
            // Clear localStorage
            localStorage.removeItem('clutchzone_cookie_preferences');
            
            // Clear all cookies
            document.cookie.split(";").forEach(cookie => {
                const eqPos = cookie.indexOf("=");
                const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
                document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
            });

            this.showNotification('All data cleared successfully!', 'success');
            this.trackUserAction('all_data_cleared');
            
            // Reload page after a delay
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.clutchZoneCookies = new ClutchZoneCookies();
});

// Global access for external scripts
window.ClutchZoneCookies = ClutchZoneCookies;
