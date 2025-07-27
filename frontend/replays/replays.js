// Replays Module JavaScript - Advanced Functionality
class ReplaysManager {
    constructor() {
        this.currentTab = 'browse';
        this.replays = [];
        this.filteredReplays = [];
        this.currentModal = null;
        this.currentReplay = null;
        this.isLoading = false;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadReplays();
        this.setupTabSwitching();
        this.setupFilters();
        this.setupModals();
        this.setupUploadHandlers();
        this.setupVideoPlayer();
        this.initializeAnimations();
    }

    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
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
            if (e.key === 'Enter' && e.target.classList.contains('filter-select')) {
                this.applyFilters();
            }
        });

        // Window resize handler
        window.addEventListener('resize', () => {
            this.handleResize();
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
            case 'browse':
                this.loadReplays();
                break;
            case 'my-replays':
                this.loadUserReplays();
                break;
            case 'featured':
                this.loadFeaturedReplays();
                break;
            case 'upload':
                this.initializeUpload();
                break;
        }
    }

    async loadReplays() {
        this.setLoading(true);
        
        try {
            const response = await fetch('/api/replays', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                this.replays = await response.json();
                this.filteredReplays = [...this.replays];
                this.renderReplays();
            } else {
                this.showNotification('Failed to load replays', 'error');
            }
        } catch (error) {
            console.error('Error loading replays:', error);
            this.showNotification('Error loading replays', 'error');
            this.loadMockReplays(); // Fallback to mock data
        } finally {
            this.setLoading(false);
        }
    }

    async loadUserReplays() {
        this.setLoading(true);
        
        try {
            const response = await fetch('/api/replays/user', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                this.replays = await response.json();
                this.filteredReplays = [...this.replays];
                this.renderReplays();
            } else {
                this.showNotification('Failed to load user replays', 'error');
            }
        } catch (error) {
            console.error('Error loading user replays:', error);
            this.showNotification('Error loading user replays', 'error');
        } finally {
            this.setLoading(false);
        }
    }

    async loadFeaturedReplays() {
        this.setLoading(true);
        
        try {
            const response = await fetch('/api/replays/featured', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                this.replays = await response.json();
                this.filteredReplays = [...this.replays];
                this.renderReplays();
            } else {
                this.showNotification('Failed to load featured replays', 'error');
            }
        } catch (error) {
            console.error('Error loading featured replays:', error);
            this.showNotification('Error loading featured replays', 'error');
        } finally {
            this.setLoading(false);
        }
    }

    loadMockReplays() {
        this.replays = [
            {
                id: 1,
                title: 'Epic CS:GO Comeback',
                game: 'CS:GO',
                duration: '32:45',
                date: '2024-01-15',
                views: 1250,
                likes: 89,
                thumbnail: '/images/replay1.jpg',
                player: 'ProGamer123',
                description: 'Amazing comeback from 2-15 to 16-15 victory',
                tags: ['clutch', 'comeback', 'competitive']
            },
            {
                id: 2,
                title: 'Valorant Ace Round',
                game: 'Valorant',
                duration: '2:30',
                date: '2024-01-14',
                views: 890,
                likes: 156,
                thumbnail: '/images/replay2.jpg',
                player: 'ValorantPro',
                description: 'Perfect ace round with Jett',
                tags: ['ace', 'jett', 'ranked']
            },
            {
                id: 3,
                title: 'Rocket League Aerial Goal',
                game: 'Rocket League',
                duration: '0:45',
                date: '2024-01-13',
                views: 2340,
                likes: 234,
                thumbnail: '/images/replay3.jpg',
                player: 'RocketMaster',
                description: 'Insane aerial goal from across the field',
                tags: ['aerial', 'goal', 'freestyle']
            }
        ];
        this.filteredReplays = [...this.replays];
        this.renderReplays();
    }

    renderReplays() {
        const grids = document.querySelectorAll('.replays-grid');
        grids.forEach(grid => {
            grid.innerHTML = '';
            
            if (this.filteredReplays.length === 0) {
                grid.innerHTML = `
                    <div class="no-replays">
                        <div class="no-replays-icon">🎮</div>
                        <h3>No replays found</h3>
                        <p>Try adjusting your filters or upload your first replay!</p>
                    </div>
                `;
                return;
            }

            this.filteredReplays.forEach(replay => {
                const replayCard = this.createReplayCard(replay);
                grid.appendChild(replayCard);
            });
        });
    }

    createReplayCard(replay) {
        const card = document.createElement('div');
        card.className = 'replay-card';
        card.innerHTML = `
            <div class="replay-thumbnail" onclick="replaysManager.openReplayModal(${replay.id})" style="background-image: url('${replay.thumbnail}')">
                <div class="thumbnail-overlay">
                    <i class="fas fa-play-circle"></i>
                </div>
            </div>
            <div class="replay-info">
                <h3>${replay.title}</h3>
                <div class="replay-meta">
                    <span class="replay-date">${this.formatDate(replay.date)}</span>
                    <span class="replay-duration">${replay.duration}</span>
                </div>
                <div class="replay-stats">
                    <div class="stat-item">
                        <i class="fas fa-eye"></i>
                        <span class="stat-value">${this.formatNumber(replay.views)}</span>
                    </div>
                    <div class="stat-item">
                        <i class="fas fa-heart"></i>
                        <span class="stat-value">${this.formatNumber(replay.likes)}</span>
                    </div>
                    <div class="stat-item">
                        <i class="fas fa-gamepad"></i>
                        <span class="stat-value">${replay.game}</span>
                    </div>
                </div>
                <div class="replay-actions">
                    <button class="action-btn primary" onclick="replaysManager.playReplay(${replay.id})">
                        <i class="fas fa-play"></i> Play
                    </button>
                    <button class="action-btn" onclick="replaysManager.shareReplay(${replay.id})">
                        <i class="fas fa-share"></i> Share
                    </button>
                    <button class="action-btn" onclick="replaysManager.downloadReplay(${replay.id})">
                        <i class="fas fa-download"></i> Download
                    </button>
                </div>
            </div>
        `;
        return card;
    }

    setupFilters() {
        const filterSelects = document.querySelectorAll('.filter-select');
        filterSelects.forEach(select => {
            select.addEventListener('change', () => {
                this.applyFilters();
            });
        });
    }

    applyFilters() {
        const gameFilter = document.getElementById('game-filter')?.value || '';
        const durationFilter = document.getElementById('duration-filter')?.value || '';
        const sortFilter = document.getElementById('sort-filter')?.value || 'date';

        this.filteredReplays = this.replays.filter(replay => {
            let matchesGame = !gameFilter || replay.game.toLowerCase().includes(gameFilter.toLowerCase());
            let matchesDuration = !durationFilter || this.checkDurationFilter(replay.duration, durationFilter);
            return matchesGame && matchesDuration;
        });

        // Sort replays
        this.sortReplays(sortFilter);
        this.renderReplays();
    }

    checkDurationFilter(duration, filter) {
        const minutes = this.durationToMinutes(duration);
        switch (filter) {
            case 'short': return minutes <= 5;
            case 'medium': return minutes > 5 && minutes <= 30;
            case 'long': return minutes > 30;
            default: return true;
        }
    }

    durationToMinutes(duration) {
        const parts = duration.split(':');
        return parseInt(parts[0]) + (parseInt(parts[1]) / 60);
    }

    sortReplays(sortBy) {
        this.filteredReplays.sort((a, b) => {
            switch (sortBy) {
                case 'date':
                    return new Date(b.date) - new Date(a.date);
                case 'views':
                    return b.views - a.views;
                case 'likes':
                    return b.likes - a.likes;
                case 'duration':
                    return this.durationToMinutes(b.duration) - this.durationToMinutes(a.duration);
                default:
                    return 0;
            }
        });
    }

    setupModals() {
        // Initialize modal functionality
        this.setupVideoPlayerControls();
    }

    openReplayModal(replayId) {
        const replay = this.replays.find(r => r.id === replayId);
        if (!replay) return;

        this.currentReplay = replay;
        const modal = document.getElementById('replay-modal');
        
        // Update modal content
        document.getElementById('modal-title').textContent = replay.title;
        document.getElementById('modal-description').textContent = replay.description;
        document.getElementById('modal-player').textContent = `by ${replay.player}`;
        document.getElementById('modal-stats').innerHTML = `
            <div class="modal-stat">
                <i class="fas fa-eye"></i>
                <span>${this.formatNumber(replay.views)} views</span>
            </div>
            <div class="modal-stat">
                <i class="fas fa-heart"></i>
                <span>${this.formatNumber(replay.likes)} likes</span>
            </div>
            <div class="modal-stat">
                <i class="fas fa-clock"></i>
                <span>${replay.duration}</span>
            </div>
        `;

        // Setup video player
        this.setupVideoPlayer(replay);
        
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.style.display = 'none';
        });
        document.body.style.overflow = 'auto';
        this.currentModal = null;
        this.currentReplay = null;
    }

    setupVideoPlayer(replay) {
        const videoPlayer = document.querySelector('.video-player');
        const playBtn = document.querySelector('.play-btn');
        const progressBar = document.querySelector('.progress-bar');
        const progressFill = document.querySelector('.progress-fill');
        const timeDisplay = document.querySelector('.time-display');

        // Mock video player setup
        let isPlaying = false;
        let currentTime = 0;
        let duration = this.durationToSeconds(replay.duration);

        playBtn.addEventListener('click', () => {
            isPlaying = !isPlaying;
            playBtn.innerHTML = isPlaying ? '<i class="fas fa-pause"></i>' : '<i class="fas fa-play"></i>';
            
            if (isPlaying) {
                this.startVideoPlayback();
            } else {
                this.pauseVideoPlayback();
            }
        });

        progressBar.addEventListener('click', (e) => {
            const rect = progressBar.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const percentage = clickX / rect.width;
            currentTime = percentage * duration;
            progressFill.style.width = `${percentage * 100}%`;
            this.updateTimeDisplay(currentTime, duration);
        });

        this.updateTimeDisplay(0, duration);
    }

    setupVideoPlayerControls() {
        // Additional video player controls setup
        this.videoInterval = null;
    }

    startVideoPlayback() {
        // Mock video playback
        this.videoInterval = setInterval(() => {
            const progressFill = document.querySelector('.progress-fill');
            const timeDisplay = document.querySelector('.time-display');
            
            if (this.currentReplay) {
                const duration = this.durationToSeconds(this.currentReplay.duration);
                const currentWidth = parseFloat(progressFill.style.width || '0');
                const newWidth = Math.min(currentWidth + (100 / duration), 100);
                
                progressFill.style.width = `${newWidth}%`;
                this.updateTimeDisplay(Math.floor((newWidth / 100) * duration), duration);
                
                if (newWidth >= 100) {
                    this.pauseVideoPlayback();
                }
            }
        }, 1000);
    }

    pauseVideoPlayback() {
        if (this.videoInterval) {
            clearInterval(this.videoInterval);
            this.videoInterval = null;
        }
    }

    updateTimeDisplay(current, total) {
        const timeDisplay = document.querySelector('.time-display');
        if (timeDisplay) {
            timeDisplay.textContent = `${this.formatTime(current)} / ${this.formatTime(total)}`;
        }
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    durationToSeconds(duration) {
        const parts = duration.split(':');
        return parseInt(parts[0]) * 60 + parseInt(parts[1]);
    }

    setupUploadHandlers() {
        const uploadBtn = document.querySelector('.upload-btn');
        const uploadSection = document.querySelector('.upload-section');
        
        if (uploadBtn) {
            uploadBtn.addEventListener('click', () => {
                this.openUploadModal();
            });
        }

        if (uploadSection) {
            uploadSection.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadSection.classList.add('drag-over');
            });

            uploadSection.addEventListener('dragleave', () => {
                uploadSection.classList.remove('drag-over');
            });

            uploadSection.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadSection.classList.remove('drag-over');
                this.handleFileUpload(e.dataTransfer.files);
            });
        }
    }

    openUploadModal() {
        const modal = document.getElementById('upload-modal');
        if (modal) {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }
    }

    handleFileUpload(files) {
        if (files.length === 0) return;

        const file = files[0];
        if (!this.isValidVideoFile(file)) {
            this.showNotification('Please select a valid video file', 'error');
            return;
        }

        this.uploadReplay(file);
    }

    isValidVideoFile(file) {
        const validTypes = ['video/mp4', 'video/webm', 'video/ogg'];
        return validTypes.includes(file.type);
    }

    async uploadReplay(file) {
        this.setLoading(true);
        
        const formData = new FormData();
        formData.append('replay', file);
        formData.append('title', document.getElementById('upload-title')?.value || '');
        formData.append('description', document.getElementById('upload-description')?.value || '');
        formData.append('game', document.getElementById('upload-game')?.value || '');

        try {
            const response = await fetch('/api/replays/upload', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: formData
            });

            if (response.ok) {
                this.showNotification('Replay uploaded successfully!', 'success');
                this.closeModal();
                this.loadReplays();
            } else {
                this.showNotification('Failed to upload replay', 'error');
            }
        } catch (error) {
            console.error('Error uploading replay:', error);
            this.showNotification('Error uploading replay', 'error');
        } finally {
            this.setLoading(false);
        }
    }

    initializeUpload() {
        // Initialize upload tab specific functionality
        const uploadForm = document.getElementById('upload-form');
        if (uploadForm) {
            uploadForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleFormUpload();
            });
        }
    }

    handleFormUpload() {
        const fileInput = document.getElementById('replay-file');
        if (fileInput && fileInput.files.length > 0) {
            this.handleFileUpload(fileInput.files);
        } else {
            this.showNotification('Please select a file to upload', 'error');
        }
    }

    async playReplay(replayId) {
        const replay = this.replays.find(r => r.id === replayId);
        if (!replay) return;

        this.openReplayModal(replayId);
    }

    async shareReplay(replayId) {
        const replay = this.replays.find(r => r.id === replayId);
        if (!replay) return;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: replay.title,
                    text: replay.description,
                    url: `${window.location.origin}/replays/${replayId}`
                });
            } catch (error) {
                console.log('Error sharing:', error);
            }
        } else {
            // Fallback to clipboard
            const url = `${window.location.origin}/replays/${replayId}`;
            await navigator.clipboard.writeText(url);
            this.showNotification('Link copied to clipboard!', 'success');
        }
    }

    async downloadReplay(replayId) {
        const replay = this.replays.find(r => r.id === replayId);
        if (!replay) return;

        try {
            const response = await fetch(`/api/replays/${replayId}/download`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${replay.title}.mp4`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
                this.showNotification('Download started!', 'success');
            } else {
                this.showNotification('Failed to download replay', 'error');
            }
        } catch (error) {
            console.error('Error downloading replay:', error);
            this.showNotification('Error downloading replay', 'error');
        }
    }

    initializeAnimations() {
        // Initialize scroll animations
        this.setupScrollAnimations();
        
        // Initialize particle effects
        this.setupParticleEffects();
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

        document.querySelectorAll('.replay-card').forEach(card => {
            observer.observe(card);
        });
    }

    setupParticleEffects() {
        // Add subtle particle effects for enhanced UI
        const container = document.querySelector('.replays-container');
        if (container) {
            for (let i = 0; i < 20; i++) {
                const particle = document.createElement('div');
                particle.className = 'particle';
                particle.style.cssText = `
                    position: absolute;
                    width: 2px;
                    height: 2px;
                    background: rgba(0, 255, 255, 0.5);
                    border-radius: 50%;
                    pointer-events: none;
                    animation: float ${5 + Math.random() * 5}s linear infinite;
                    left: ${Math.random() * 100}%;
                    top: ${Math.random() * 100}%;
                `;
                container.appendChild(particle);
            }
        }
    }

    handleResize() {
        // Handle responsive adjustments
        const screenWidth = window.innerWidth;
        
        if (screenWidth < 768) {
            this.adjustMobileLayout();
        } else {
            this.adjustDesktopLayout();
        }
    }

    adjustMobileLayout() {
        // Mobile-specific adjustments
        const grids = document.querySelectorAll('.replays-grid');
        grids.forEach(grid => {
            grid.style.gridTemplateColumns = '1fr';
        });
    }

    adjustDesktopLayout() {
        // Desktop-specific adjustments
        const grids = document.querySelectorAll('.replays-grid');
        grids.forEach(grid => {
            grid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(350px, 1fr))';
        });
    }

    setLoading(loading) {
        this.isLoading = loading;
        const loadingElements = document.querySelectorAll('.loading-spinner');
        loadingElements.forEach(el => {
            el.style.display = loading ? 'block' : 'none';
        });
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

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }
}

// Initialize the replays manager when the page loads
let replaysManager;

document.addEventListener('DOMContentLoaded', () => {
    replaysManager = new ReplaysManager();
});

// Add particle animation CSS
const style = document.createElement('style');
style.textContent = `
    .particle {
        animation: float 10s linear infinite;
    }
    
    @keyframes float {
        0% {
            transform: translateY(100vh) rotate(0deg);
            opacity: 0;
        }
        10% {
            opacity: 1;
        }
        90% {
            opacity: 1;
        }
        100% {
            transform: translateY(-100px) rotate(360deg);
            opacity: 0;
        }
    }
    
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
    
    .drag-over {
        background: rgba(0, 255, 255, 0.1) !important;
        border-color: #00ffff !important;
    }
    
    .no-replays {
        grid-column: 1 / -1;
        text-align: center;
        padding: 3rem;
        color: #b8b8d4;
    }
    
    .no-replays-icon {
        font-size: 4rem;
        margin-bottom: 1rem;
    }
    
    .no-replays h3 {
        font-family: 'Orbitron', monospace;
        font-size: 1.5rem;
        color: #fff;
        margin-bottom: 1rem;
    }
`;
document.head.appendChild(style);

// Export for global access
window.replaysManager = replaysManager;
