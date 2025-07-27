// ClutchZone Main Application JavaScript
document.addEventListener('DOMContentLoaded', function() {
    console.log('ClutchZone - Gaming Platform Initialized');
    
    // Initialize mobile navigation
    initMobileNavigation();
    
    // Initialize sound system
    if (typeof SoundManager !== 'undefined') {
        SoundManager.init();
    }
    
    // Initialize notifications
    if (typeof NotificationManager !== 'undefined') {
        NotificationManager.init();
    }
    
    // Initialize 3D background effects
    init3DBackground();
    
    // Initialize authentication state
    checkAuthState();
    
    // Initialize tournament data
    loadTournamentData();
});

// Mobile Navigation
function initMobileNavigation() {
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');
    
    if (navToggle && navLinks) {
        navToggle.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            navToggle.classList.toggle('active');
        });
    }
}

// 3D Background Effects
function init3DBackground() {
    if (typeof THREE === 'undefined') return;
    
    const canvas = document.createElement('canvas');
    canvas.id = 'background-canvas';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.zIndex = '-1';
    canvas.style.pointerEvents = 'none';
    
    document.body.appendChild(canvas);
    
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    // Create particles
    const particleCount = 1000;
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 100;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 100;
        
        colors[i * 3] = Math.random();
        colors[i * 3 + 1] = Math.random();
        colors[i * 3 + 2] = Math.random();
    }
    
    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const material = new THREE.PointsMaterial({
        size: 0.5,
        vertexColors: true,
        transparent: true,
        opacity: 0.6
    });
    
    const particleSystem = new THREE.Points(particles, material);
    scene.add(particleSystem);
    
    camera.position.z = 50;
    
    function animate() {
        requestAnimationFrame(animate);
        
        particleSystem.rotation.y += 0.001;
        particleSystem.rotation.x += 0.0005;
        
        renderer.render(scene, camera);
    }
    
    animate();
    
    // Handle window resize
    window.addEventListener('resize', function() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

// Authentication State
function checkAuthState() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
        updateUIForAuthenticatedUser(JSON.parse(user));
    } else {
        updateUIForGuestUser();
    }
}

function updateUIForAuthenticatedUser(user) {
    const authButtons = document.querySelector('.auth-buttons');
    if (authButtons) {
        authButtons.innerHTML = `
            <div class="user-info">
                <span>Welcome, ${user.username}!</span>
                <button class="btn btn-secondary" onclick="logout()">Logout</button>
            </div>
        `;
    }
}

function updateUIForGuestUser() {
    const authButtons = document.querySelector('.auth-buttons');
    if (authButtons) {
        authButtons.innerHTML = `
            <a href="login/login.html" class="btn btn-primary">Login</a>
            <a href="register/register.html" class="btn btn-secondary">Register</a>
        `;
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

// Tournament Data
async function loadTournamentData() {
    try {
        const response = await fetch('/api/tournaments');
        const tournaments = await response.json();
        
        displayFeaturedTournaments(tournaments);
    } catch (error) {
        console.error('Error loading tournaments:', error);
    }
}

function displayFeaturedTournaments(tournaments) {
    const container = document.querySelector('.featured-tournaments');
    if (!container) return;
    
    const featuredTournaments = tournaments.slice(0, 3);
    
    container.innerHTML = featuredTournaments.map(tournament => `
        <div class="tournament-card">
            <h3>${tournament.name}</h3>
            <p class="tournament-game">${tournament.game}</p>
            <p class="tournament-prize">Prize: ${tournament.entry_fee > 0 ? '$' + tournament.prize_pool : 'Free'}</p>
            <p class="tournament-date">${new Date(tournament.start_date).toLocaleDateString()}</p>
            <a href="tournaments/tournaments.html" class="btn btn-primary">View Details</a>
        </div>
    `).join('');
}

// Utility Functions
function showNotification(message, type = 'info') {
    if (typeof NotificationManager !== 'undefined') {
        NotificationManager.show(message, type);
    } else {
        console.log(`${type.toUpperCase()}: ${message}`);
    }
}

function playSound(soundName) {
    if (typeof SoundManager !== 'undefined') {
        SoundManager.play(soundName);
    }
}

// Gaming Statistics
function updateStats() {
    const statsContainer = document.querySelector('.stats-container');
    if (!statsContainer) return;
    
    // Mock statistics - replace with real API calls
    const stats = {
        totalPlayers: 15847,
        activeTournaments: 23,
        totalPrizePool: 50000,
        onlineNow: 1234
    };
    
    statsContainer.innerHTML = `
        <div class="stat-item">
            <h3>${stats.totalPlayers.toLocaleString()}</h3>
            <p>Total Players</p>
        </div>
        <div class="stat-item">
            <h3>${stats.activeTournaments}</h3>
            <p>Active Tournaments</p>
        </div>
        <div class="stat-item">
            <h3>$${stats.totalPrizePool.toLocaleString()}</h3>
            <p>Total Prize Pool</p>
        </div>
        <div class="stat-item">
            <h3>${stats.onlineNow.toLocaleString()}</h3>
            <p>Online Now</p>
        </div>
    `;
}

// Initialize stats on page load
setTimeout(updateStats, 1000);
