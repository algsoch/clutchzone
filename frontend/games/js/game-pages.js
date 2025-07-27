/**
 * Game Pages JavaScript - Enhanced Animations and Functionality
 */

// Initialize game page functionality
function initializeGamePage(gameName) {
    console.log(`🎮 Initializing ${gameName.toUpperCase()} page...`);
    
    // Set up theme-specific animations
    initializeThemeAnimations(gameName);
    
    // Initialize particle effects
    initializeParticleEffects();
    
    // Set up scroll animations
    initializeScrollAnimations();
    
    // Load tournaments for this game
    loadGameTournaments(gameName);
    
    // Initialize stat counters animation
    initializeStatCounters();
    
    console.log(`✅ ${gameName.toUpperCase()} page initialized successfully!`);
}

// Theme-specific animations
function initializeThemeAnimations(gameName) {
    const gameSpecificAnimations = {
        valorant: () => {
            // Valorant-specific animations
            createValorantEffects();
        },
        csgo: () => {
            // CS:GO-specific animations
            createCSGOEffects();
        },
        pubg: () => {
            // PUBG-specific animations
            createPUBGEffects();
        },
        cod: () => {
            // Call of Duty-specific animations
            createCODEffects();
        }
    };
    
    if (gameSpecificAnimations[gameName]) {
        gameSpecificAnimations[gameName]();
    }
}

// Valorant-specific effects
function createValorantEffects() {
    // Add tactical scanner effect
    const heroSection = document.querySelector('.game-hero');
    if (heroSection) {
        const scanner = document.createElement('div');
        scanner.className = 'tactical-scanner';
        scanner.innerHTML = `
            <div class="scanner-line"></div>
            <div class="scanner-pulse"></div>
        `;
        heroSection.appendChild(scanner);
        
        // Animate scanner
        animateScanner();
    }
    
    // Add agent ability effects
    createAbilityEffects();
}

// CS:GO-specific effects
function createCSGOEffects() {
    // Add bomb timer effect
    const heroSection = document.querySelector('.game-hero');
    if (heroSection) {
        const bombTimer = document.createElement('div');
        bombTimer.className = 'bomb-timer';
        bombTimer.innerHTML = `
            <div class="timer-display">35</div>
            <div class="timer-beep"></div>
        `;
        heroSection.appendChild(bombTimer);
        
        // Animate bomb timer
        animateBombTimer();
    }
}

// PUBG-specific effects
function createPUBGEffects() {
    console.log('🪂 Creating PUBG effects...');
    
    // Add battleground atmosphere
    const heroSection = document.querySelector('.game-hero');
    if (heroSection) {
        // Create parachute animation effect
        const parachuteElement = document.createElement('div');
        parachuteElement.className = 'pubg-parachute-effect';
        parachuteElement.innerHTML = '<i class="fas fa-parachute-box"></i>';
        parachuteElement.style.cssText = `
            position: absolute;
            top: -50px;
            right: 20%;
            color: #ff6900;
            font-size: 24px;
            opacity: 0.6;
            animation: parachuteDrop 8s linear infinite;
        `;
        heroSection.appendChild(parachuteElement);
        
        // Add zone effect (shrinking circle)
        const zoneEffect = document.createElement('div');
        zoneEffect.className = 'pubg-zone-effect';
        zoneEffect.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            width: 300px;
            height: 300px;
            margin: -150px 0 0 -150px;
            border: 2px solid #ff6900;
            border-radius: 50%;
            opacity: 0.3;
            animation: zoneContract 10s ease-in-out infinite;
        `;
        heroSection.appendChild(zoneEffect);
    }
}

// Call of Duty-specific effects
function createCODEffects() {
    console.log('💀 Creating COD effects...');
    
    // Add tactical overlay
    const heroSection = document.querySelector('.game-hero');
    if (heroSection) {
        // Create crosshair effect
        const crosshairElement = document.createElement('div');
        crosshairElement.className = 'cod-crosshair-effect';
        crosshairElement.innerHTML = '<i class="fas fa-crosshairs"></i>';
        crosshairElement.style.cssText = `
            position: absolute;
            top: 40%;
            right: 15%;
            color: #00d4aa;
            font-size: 32px;
            opacity: 0.4;
            animation: crosshairPulse 3s ease-in-out infinite;
        `;
        heroSection.appendChild(crosshairElement);
        
        // Add tactical grid overlay
        const gridOverlay = document.createElement('div');
        gridOverlay.className = 'cod-grid-overlay';
        gridOverlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-image: 
                linear-gradient(rgba(0, 212, 170, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0, 212, 170, 0.1) 1px, transparent 1px);
            background-size: 50px 50px;
            opacity: 0.2;
            animation: gridScan 6s linear infinite;
        `;
        heroSection.appendChild(gridOverlay);
    }
}

// Particle effects initialization
function initializeParticleEffects() {
    const particlesContainer = document.querySelector('.game-particles');
    if (!particlesContainer) return;
    
    // Create floating particles
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.className = 'floating-particle';
        particle.style.cssText = `
            position: absolute;
            width: ${Math.random() * 6 + 2}px;
            height: ${Math.random() * 6 + 2}px;
            background: var(--game-primary);
            border-radius: 50%;
            opacity: ${Math.random() * 0.5 + 0.2};
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation: particleFloat ${Math.random() * 10 + 10}s ease-in-out infinite;
            animation-delay: ${Math.random() * 5}s;
            box-shadow: 0 0 10px var(--game-primary);
        `;
        particlesContainer.appendChild(particle);
    }
}

// Scroll animations
function initializeScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                
                // Trigger counter animations if element has stat numbers
                const statNumbers = entry.target.querySelectorAll('.stat-number');
                if (statNumbers.length > 0) {
                    animateCountersInView(statNumbers);
                }
            }
        });
    }, observerOptions);
    
    // Observe elements for scroll animations
    const animatedElements = document.querySelectorAll('.feature-card, .stat-card, .tournament-card');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.8s ease-out';
        observer.observe(el);
    });
}

// Initialize stat counters animation
function initializeStatCounters() {
    const statNumbers = document.querySelectorAll('.stat-number[data-count]');
    
    // Intersection Observer for counter animation
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                if (!counter.dataset.animated) {
                    animateCounter(counter);
                    counter.dataset.animated = 'true';
                }
            }
        });
    }, {
        threshold: 0.5
    });
    
    statNumbers.forEach(counter => {
        counterObserver.observe(counter);
    });
}

// Animate individual counter
function animateCounter(counter) {
    const target = parseInt(counter.getAttribute('data-count'));
    const increment = target / 50;
    let current = 0;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            counter.textContent = target.toLocaleString();
            clearInterval(timer);
        } else {
            counter.textContent = Math.floor(current).toLocaleString();
        }
    }, 30);
}

// Animate counters
function animateCounters() {
    const counters = document.querySelectorAll('.stat-number[data-target]');
    
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'));
        const increment = target / 100;
        let current = 0;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                counter.textContent = target.toLocaleString();
                clearInterval(timer);
            } else {
                counter.textContent = Math.floor(current).toLocaleString();
            }
        }, 20);
    });
}

// Animate counters when in view
function animateCountersInView(counters) {
    counters.forEach(counter => {
        if (counter.getAttribute('data-animated')) return;
        counter.setAttribute('data-animated', 'true');
        
        const target = parseInt(counter.getAttribute('data-target')) || parseInt(counter.textContent.replace(/,/g, ''));
        const increment = target / 50;
        let current = 0;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                counter.textContent = target.toLocaleString();
                clearInterval(timer);
            } else {
                counter.textContent = Math.floor(current).toLocaleString();
            }
        }, 30);
    });
}

// Load game-specific tournaments
async function loadGameTournaments(gameName) {
    const tournamentsContainer = document.getElementById('tournamentsContainer');
    if (!tournamentsContainer) return;
    
    // Show loading state
    showLoadingState(tournamentsContainer, `Loading ${gameName.toUpperCase()} tournaments...`);
    
    try {
        let tournaments = [];
        
        // Try to fetch from API or use mock data
        if (window.clutchAPI && clutchAPI.getTournaments) {
            tournaments = await clutchAPI.getTournaments({ game: gameName });
        } else {
            // Mock data for demonstration
            await new Promise(resolve => setTimeout(resolve, 1000));
            tournaments = generateMockTournaments(gameName);
        }
        
        hideLoadingState(tournamentsContainer);
        renderGameTournaments(tournaments, tournamentsContainer);
        
    } catch (error) {
        console.error(`Failed to load ${gameName} tournaments:`, error);
        tournamentsContainer.innerHTML = `
            <div class="error-state">
                <div class="error-icon">⚠️</div>
                <div class="error-message">Failed to load tournaments</div>
                <button class="btn btn-outline" onclick="loadGameTournaments('${gameName}')">Try Again</button>
            </div>
        `;
    }
}

// Generate mock tournament data
function generateMockTournaments(gameName) {
    const gameData = {
        valorant: {
            icon: '🎯',
            tournaments: [
                { title: 'Valorant Champions Cup', rank: 'Professional', prize: '₹75,000', players: '64/128' },
                { title: 'Tactical Masters', rank: 'Intermediate', prize: '₹25,000', players: '32/64' },
                { title: 'Radiant Rising', rank: 'Beginner', prize: '₹10,000', players: '48/64' }
            ]
        },
        csgo: {
            icon: '🔫',
            tournaments: [
                { title: 'CS:GO Major League', rank: 'Professional', prize: '₹1,00,000', players: '128/256' },
                { title: 'Dust2 Masters', rank: 'Intermediate', prize: '₹30,000', players: '64/128' },
                { title: 'Newcomer Cup', rank: 'Beginner', prize: '₹15,000', players: '32/64' }
            ]
        },
        pubg: {
            icon: '🏹',
            tournaments: [
                { title: 'PUBG Championship', rank: 'Professional', prize: '₹80,000', players: '200/300' },
                { title: 'Chicken Dinner League', rank: 'Intermediate', prize: '₹35,000', players: '150/200' },
                { title: 'Battle Royale Beginners', rank: 'Beginner', prize: '₹20,000', players: '100/150' }
            ]
        },
        cod: {
            icon: '💥',
            tournaments: [
                { title: 'Call of Duty Pro League', rank: 'Professional', prize: '₹90,000', players: '128/256' },
                { title: 'Warzone Warriors', rank: 'Intermediate', prize: '₹40,000', players: '100/150' },
                { title: 'Boot Camp Battle', rank: 'Beginner', prize: '₹18,000', players: '64/100' }
            ]
        }
    };
    
    const data = gameData[gameName] || gameData.valorant;
    return data.tournaments.map((tournament, index) => ({
        id: index + 1,
        title: tournament.title,
        game: gameName.toUpperCase(),
        rank: tournament.rank,
        status: index === 0 ? 'live' : 'upcoming',
        prize_pool: tournament.prize,
        participants: tournament.players.split('/')[0],
        max_participants: tournament.players.split('/')[1],
        game_icon: data.icon
    }));
}

// Render game tournaments
function renderGameTournaments(tournaments, container) {
    if (tournaments.length === 0) {
        container.innerHTML = `
            <div class="no-tournaments">
                <div class="no-tournaments-icon">🏆</div>
                <div class="no-tournaments-message">No tournaments available</div>
                <div class="no-tournaments-subtext">Check back soon for new competitions!</div>
            </div>
        `;
        return;
    }
    
    container.innerHTML = tournaments.map(tournament => `
        <div class="tournament-card game-tournament-card" data-tournament-id="${tournament.id}" data-rank="${tournament.rank.toLowerCase()}">
            <div class="tournament-banner">
                <div class="tournament-game-icon">${tournament.game_icon}</div>
                <div class="tournament-status status-${tournament.status}">
                    ${tournament.status.toUpperCase()}
                </div>
                ${tournament.rank ? `<div class="tournament-rank">${tournament.rank}</div>` : ''}
            </div>
            
            <div class="tournament-meta">
                <h3 class="tournament-title">${tournament.title}</h3>
                <p class="tournament-game">${tournament.game}</p>
                
                <div class="tournament-info">
                    <div class="tournament-detail">
                        <div class="tournament-detail-label">Prize Pool</div>
                        <div class="tournament-detail-value prize-value">${tournament.prize_pool}</div>
                    </div>
                    <div class="tournament-detail">
                        <div class="tournament-detail-label">Players</div>
                        <div class="tournament-detail-value">${tournament.participants}/${tournament.max_participants}</div>
                    </div>
                    <div class="tournament-detail">
                        <div class="tournament-detail-label">Rank</div>
                        <div class="tournament-detail-value">${tournament.rank}</div>
                    </div>
                </div>
            </div>
            
            <div class="tournament-actions">
                <button class="btn-tournament btn-join" onclick="joinGameTournament(${tournament.id})">
                    ${tournament.status === 'live' ? 'Join Now' : 'Register'}
                </button>
                <button class="btn-tournament btn-view" onclick="viewTournamentDetails(${tournament.id})">
                    View Details
                </button>
            </div>
        </div>
    `).join('');
    
    // Add entrance animations
    const cards = container.querySelectorAll('.tournament-card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        setTimeout(() => {
            card.style.transition = 'all 0.6s ease-out';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

// Tournament filter functionality
function initializeTournamentFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const tournamentCards = document.querySelectorAll('.tournament-card');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const filter = button.getAttribute('data-filter');
            
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Filter tournaments
            tournamentCards.forEach(card => {
                const rank = card.getAttribute('data-rank');
                if (filter === 'all' || rank === filter) {
                    card.style.display = 'block';
                    card.style.animation = 'fadeInUp 0.5s ease-out';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
}

// Join tournament functionality
function joinGameTournament(tournamentId) {
    if (!window.clutchAPI || !clutchAPI.isAuthenticated) {
        clutchAPI.showNotification('Please login to join tournaments', 'warning');
        setTimeout(() => {
            window.location.href = '../login/login.html';
        }, 1500);
        return;
    }
    
    // Show joining animation
    const button = document.querySelector(`[data-tournament-id="${tournamentId}"] .btn-join`);
    if (button) {
        const originalText = button.textContent;
        button.innerHTML = '<div class="loading-spinner"></div> Joining...';
        button.disabled = true;
        
        setTimeout(() => {
            button.textContent = 'Joined!';
            button.classList.add('btn-success');
            clutchAPI.showNotification('Successfully joined tournament!', 'success');
            
            setTimeout(() => {
                button.textContent = originalText;
                button.disabled = false;
                button.classList.remove('btn-success');
            }, 2000);
        }, 1500);
    }
}

// View tournament details
function viewTournamentDetails(tournamentId) {
    window.location.href = `../tournaments/tournament-details.html?id=${tournamentId}`;
}

// Show loading state
function showLoadingState(element, message = 'Loading...') {
    if (!element) return;
    
    element.innerHTML = `
        <div class="loading-content game-loading">
            <div class="loading-spinner game-spinner"></div>
            <span class="loading-text">${message}</span>
        </div>
    `;
    element.classList.add('loading-state');
}

// Hide loading state
function hideLoadingState(element) {
    if (!element) return;
    element.classList.remove('loading-state');
}

// Game-specific animation functions
function animateScanner() {
    const scannerLine = document.querySelector('.scanner-line');
    if (scannerLine) {
        setInterval(() => {
            scannerLine.style.animation = 'none';
            scannerLine.offsetHeight; // Trigger reflow
            scannerLine.style.animation = 'scannerSweep 3s ease-in-out';
        }, 4000);
    }
}

function animateBombTimer() {
    const timerDisplay = document.querySelector('.timer-display');
    const timerBeep = document.querySelector('.timer-beep');
    
    if (timerDisplay && timerBeep) {
        let time = 35;
        const timer = setInterval(() => {
            time--;
            timerDisplay.textContent = time;
            
            if (time <= 10) {
                timerBeep.style.animation = 'bombBeep 0.5s ease-in-out';
            }
            
            if (time <= 0) {
                clearInterval(timer);
                timerDisplay.textContent = 'BOOM!';
                timerDisplay.style.color = '#ff4655';
            }
        }, 1000);
    }
}

function animateZone() {
    const zoneCircle = document.querySelector('.zone-circle');
    if (zoneCircle) {
        setInterval(() => {
            zoneCircle.style.transform = `scale(${0.8 + Math.random() * 0.4})`;
        }, 2000);
    }
}

function animateKillstreak() {
    const killstreakElement = document.querySelector('.killstreak-ready');
    if (killstreakElement) {
        setInterval(() => {
            killstreakElement.style.animation = 'none';
            killstreakElement.offsetHeight; // Trigger reflow
            killstreakElement.style.animation = 'killstreakPulse 2s ease-in-out';
        }, 3000);
    }
}

function createAbilityEffects() {
    const heroSection = document.querySelector('.game-hero');
    if (!heroSection) return;
    
    // Create ability icons floating around
    const abilities = ['⚡', '🔥', '❄️', '🌪️'];
    abilities.forEach((ability, index) => {
        const abilityElement = document.createElement('div');
        abilityElement.className = 'floating-ability';
        abilityElement.textContent = ability;
        abilityElement.style.cssText = `
            position: absolute;
            font-size: 2rem;
            color: var(--game-primary);
            animation: abilityFloat ${4 + index}s ease-in-out infinite;
            animation-delay: ${index * 0.5}s;
            top: ${20 + index * 20}%;
            right: ${10 + index * 5}%;
            filter: drop-shadow(0 0 10px var(--game-primary));
            z-index: 1;
        `;
        heroSection.appendChild(abilityElement);
    });
}

// Add custom CSS animations dynamically
function addCustomAnimations() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes scannerSweep {
            0% { transform: translateX(-100px) rotate(45deg); opacity: 0; }
            50% { opacity: 1; }
            100% { transform: translateX(400px) rotate(45deg); opacity: 0; }
        }
        
        @keyframes bombBeep {
            0%, 100% { background: transparent; }
            50% { background: #ff4655; }
        }
        
        @keyframes killstreakPulse {
            0%, 100% { transform: scale(1); opacity: 0.8; }
            50% { transform: scale(1.1); opacity: 1; }
        }
        
        @keyframes abilityFloat {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-15px) rotate(180deg); }
        }
        
        .game-loading {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 4rem 2rem;
            color: var(--text-secondary);
        }
        
        .game-spinner {
            width: 40px;
            height: 40px;
            border: 3px solid var(--border-color);
            border-top: 3px solid var(--game-primary);
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 1rem;
        }
        
        .tournament-rank {
            padding: 0.25rem 0.5rem;
            background: rgba(var(--game-primary), 0.2);
            color: var(--game-primary);
            border-radius: var(--radius-sm);
            font-size: 0.7rem;
            font-weight: bold;
            text-transform: uppercase;
        }
        
        .btn-success {
            background: linear-gradient(45deg, var(--success-color), #16a34a) !important;
            color: white !important;
        }
        
        @keyframes parachuteDrop {
            0% { 
                transform: translateY(-50px) rotate(0deg);
                opacity: 0.6;
            }
            50% {
                transform: translateY(300px) rotate(180deg);
                opacity: 1;
            }
            100% { 
                transform: translateY(800px) rotate(360deg);
                opacity: 0;
            }
        }
        
        @keyframes zoneContract {
            0%, 100% { 
                transform: scale(1);
                opacity: 0.3;
            }
            50% { 
                transform: scale(0.6);
                opacity: 0.6;
            }
        }
        
        @keyframes crosshairPulse {
            0%, 100% { 
                transform: scale(1) rotate(0deg);
                opacity: 0.4;
            }
            50% { 
                transform: scale(1.2) rotate(45deg);
                opacity: 0.8;
            }
        }
        
        @keyframes gridScan {
            0% { 
                background-position: 0 0;
            }
            100% { 
                background-position: 50px 50px;
            }
        }
    `;
    document.head.appendChild(style);
}

// Initialize custom animations on page load
document.addEventListener('DOMContentLoaded', addCustomAnimations);

// Initialize game-specific animations on load
document.addEventListener('DOMContentLoaded', function() {
    addGameSpecificAnimations();
});
