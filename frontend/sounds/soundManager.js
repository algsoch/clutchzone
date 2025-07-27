/* ClutchZone Sounds Module - Advanced Audio System */

class SoundManager {
    constructor() {
        this.sounds = {};
        this.audioContext = null;
        this.masterVolume = 1.0;
        this.sfxVolume = 0.7;
        this.musicVolume = 0.5;
        this.soundEnabled = true;
        this.musicEnabled = true;
        this.currentMusic = null;
        this.audioBuffers = {};
        
        this.init();
    }

    init() {
        this.initializeAudioContext();
        this.loadSoundPreferences();
        this.createSoundEffects();
        this.setupAudioNodes();
        this.setupEventListeners();
        this.initProceduralAudio();
    }

    initializeAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Resume audio context on user interaction (required by browsers)
            document.addEventListener('click', () => {
                if (this.audioContext.state === 'suspended') {
                    this.audioContext.resume();
                }
            }, { once: true });
        } catch (error) {
            console.warn('Web Audio API not supported:', error);
        }
    }

    setupAudioNodes() {
        if (!this.audioContext) return;

        // Create master gain node
        this.masterGain = this.audioContext.createGain();
        this.masterGain.gain.value = this.masterVolume;
        this.masterGain.connect(this.audioContext.destination);

        // Create SFX gain node
        this.sfxGain = this.audioContext.createGain();
        this.sfxGain.gain.value = this.sfxVolume;
        this.sfxGain.connect(this.masterGain);

        // Create music gain node
        this.musicGain = this.audioContext.createGain();
        this.musicGain.gain.value = this.musicVolume;
        this.musicGain.connect(this.masterGain);

        // Create reverb node for ambient effects
        this.reverbNode = this.audioContext.createConvolver();
        this.createReverbBuffer();
        this.reverbNode.connect(this.masterGain);
    }

    createReverbBuffer() {
        if (!this.audioContext) return;

        const sampleRate = this.audioContext.sampleRate;
        const length = sampleRate * 2; // 2 seconds of reverb
        const buffer = this.audioContext.createBuffer(2, length, sampleRate);

        for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
            const channelData = buffer.getChannelData(channel);
            for (let i = 0; i < length; i++) {
                channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2);
            }
        }

        this.reverbNode.buffer = buffer;
    }

    createSoundEffects() {
        // Define sound effect parameters
        this.soundEffects = {
            // UI Sounds
            click: { frequency: 800, duration: 0.1, type: 'sine' },
            hover: { frequency: 600, duration: 0.05, type: 'sine' },
            success: { frequency: 880, duration: 0.3, type: 'sine' },
            error: { frequency: 220, duration: 0.5, type: 'sawtooth' },
            notification: { frequency: 1000, duration: 0.2, type: 'triangle' },
            
            // Game Sounds
            powerup: { frequency: 1200, duration: 0.4, type: 'sine' },
            coin: { frequency: 1760, duration: 0.2, type: 'square' },
            jump: { frequency: 440, duration: 0.3, type: 'sine' },
            explosion: { frequency: 80, duration: 0.8, type: 'sawtooth' },
            laser: { frequency: 1500, duration: 0.1, type: 'square' },
            
            // Achievement Sounds
            achievement: { frequency: 523, duration: 0.6, type: 'sine' },
            levelup: { frequency: 880, duration: 0.8, type: 'sine' },
            victory: { frequency: 1320, duration: 1.0, type: 'sine' },
            defeat: { frequency: 196, duration: 1.2, type: 'sawtooth' },
            
            // Chat/Social Sounds
            message: { frequency: 800, duration: 0.15, type: 'sine' },
            typing: { frequency: 1200, duration: 0.05, type: 'sine' },
            join: { frequency: 660, duration: 0.25, type: 'sine' },
            leave: { frequency: 440, duration: 0.25, type: 'sine' },
            
            // Match Sounds
            matchStart: { frequency: 1000, duration: 0.5, type: 'sine' },
            matchEnd: { frequency: 880, duration: 0.7, type: 'sine' },
            countdown: { frequency: 1100, duration: 0.3, type: 'sine' },
            buzzer: { frequency: 200, duration: 1.0, type: 'sawtooth' }
        };
    }

    playSound(soundName, options = {}) {
        if (!this.soundEnabled) return;

        // Try to use Web Audio API first
        if (this.audioContext) {
            const soundConfig = this.soundEffects[soundName];
            if (soundConfig) {
                // Merge default config with options
                const config = { ...soundConfig, ...options };
                
                // Create sound
                this.createAndPlayTone(config);
                return;
            }
        }

        // Fallback to procedural audio
        if (this.proceduralAudio) {
            this.proceduralAudio.play(soundName);
        } else {
            console.warn(`Sound '${soundName}' not found and no procedural audio available`);
        }
    }

    createAndPlayTone(config) {
        if (!this.audioContext) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        // Configure oscillator
        oscillator.type = config.type || 'sine';
        oscillator.frequency.setValueAtTime(config.frequency, this.audioContext.currentTime);
        
        // Configure gain (volume envelope)
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(config.volume || 0.3, this.audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + config.duration);
        
        // Connect nodes
        oscillator.connect(gainNode);
        gainNode.connect(this.sfxGain);
        
        // Add frequency modulation for more interesting sounds
        if (config.modulation) {
            oscillator.frequency.linearRampToValueAtTime(
                config.frequency * config.modulation, 
                this.audioContext.currentTime + config.duration
            );
        }
        
        // Play sound
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + config.duration);
    }

    playSequence(sequence, interval = 0.1) {
        if (!this.soundEnabled) return;

        sequence.forEach((soundName, index) => {
            setTimeout(() => {
                this.playSound(soundName);
            }, index * interval * 1000);
        });
    }

    playMelody(notes, tempo = 120) {
        if (!this.soundEnabled) return;

        const noteInterval = 60 / tempo; // Convert BPM to seconds per note
        
        notes.forEach((note, index) => {
            setTimeout(() => {
                this.createAndPlayTone({
                    frequency: this.noteToFrequency(note.note),
                    duration: note.duration || 0.25,
                    type: note.type || 'sine',
                    volume: note.volume || 0.3
                });
            }, index * noteInterval * 1000);
        });
    }

    noteToFrequency(note) {
        const notes = {
            'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13,
            'E4': 329.63, 'F4': 349.23, 'F#4': 369.99, 'G4': 392.00,
            'G#4': 415.30, 'A4': 440.00, 'A#4': 466.16, 'B4': 493.88,
            'C5': 523.25, 'C#5': 554.37, 'D5': 587.33, 'D#5': 622.25,
            'E5': 659.25, 'F5': 698.46, 'F#5': 739.99, 'G5': 783.99,
            'G#5': 830.61, 'A5': 880.00, 'A#5': 932.33, 'B5': 987.77
        };
        return notes[note] || 440;
    }

    playAmbientLoop(soundName, duration = 10) {
        if (!this.musicEnabled || !this.audioContext) return;

        const config = this.soundEffects[soundName];
        if (!config) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        
        // Configure oscillator
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(config.frequency * 0.5, this.audioContext.currentTime);
        
        // Configure filter for ambient effect
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, this.audioContext.currentTime);
        filter.Q.setValueAtTime(1, this.audioContext.currentTime);
        
        // Configure gain
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.1, this.audioContext.currentTime + 2);
        gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + duration - 2);
        
        // Connect nodes
        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.musicGain);
        
        // Add slow frequency modulation
        oscillator.frequency.linearRampToValueAtTime(
            config.frequency * 0.7, 
            this.audioContext.currentTime + duration
        );
        
        // Play ambient sound
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
        
        return oscillator;
    }

    setupEventListeners() {
        // Auto-play sounds for common UI interactions
        document.addEventListener('click', (e) => {
            if (e.target.matches('button, .btn, .nav-btn, .action-btn')) {
                this.playSound('click');
            }
        });

        document.addEventListener('mouseover', (e) => {
            if (e.target.matches('button, .btn, .nav-btn, .action-btn')) {
                this.playSound('hover');
            }
        });

        // Form submission sounds
        document.addEventListener('submit', () => {
            this.playSound('success');
        });

        // Notification sounds
        document.addEventListener('notification', (e) => {
            const type = e.detail?.type || 'info';
            switch (type) {
                case 'success':
                    this.playSound('success');
                    break;
                case 'error':
                    this.playSound('error');
                    break;
                case 'achievement':
                    this.playSound('achievement');
                    break;
                default:
                    this.playSound('notification');
            }
        });

        // Tab switching sounds
        document.addEventListener('tabSwitch', () => {
            this.playSound('click');
        });
    }

    // Volume Controls
    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        if (this.masterGain) {
            this.masterGain.gain.value = this.masterVolume;
        }
        this.saveSoundPreferences();
    }

    setSFXVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
        if (this.sfxGain) {
            this.sfxGain.gain.value = this.sfxVolume;
        }
        this.saveSoundPreferences();
    }

    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        if (this.musicGain) {
            this.musicGain.gain.value = this.musicVolume;
        }
        this.saveSoundPreferences();
    }

    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        this.saveSoundPreferences();
        
        if (this.soundEnabled) {
            this.playSound('success');
        }
    }

    toggleMusic() {
        this.musicEnabled = !this.musicEnabled;
        this.saveSoundPreferences();
        
        if (this.currentMusic) {
            if (this.musicEnabled) {
                this.currentMusic.gain.setValueAtTime(this.musicVolume, this.audioContext.currentTime);
            } else {
                this.currentMusic.gain.setValueAtTime(0, this.audioContext.currentTime);
            }
        }
    }

    // Preset Sound Combinations
    playUIFeedback(type) {
        switch (type) {
            case 'success':
                this.playSequence(['success', 'powerup'], 0.2);
                break;
            case 'error':
                this.playSequence(['error', 'buzzer'], 0.3);
                break;
            case 'achievement':
                this.playMelody([
                    { note: 'C5', duration: 0.2 },
                    { note: 'E5', duration: 0.2 },
                    { note: 'G5', duration: 0.4 }
                ], 240);
                break;
            case 'victory':
                this.playMelody([
                    { note: 'C5', duration: 0.3 },
                    { note: 'D5', duration: 0.3 },
                    { note: 'E5', duration: 0.3 },
                    { note: 'G5', duration: 0.6 }
                ], 180);
                break;
            case 'defeat':
                this.playMelody([
                    { note: 'G4', duration: 0.4 },
                    { note: 'F4', duration: 0.4 },
                    { note: 'E4', duration: 0.4 },
                    { note: 'D4', duration: 0.8 }
                ], 120);
                break;
        }
    }

    playMatchSound(event) {
        switch (event) {
            case 'start':
                this.playSound('matchStart');
                break;
            case 'end':
                this.playSound('matchEnd');
                break;
            case 'countdown':
                this.playSequence(['countdown', 'countdown', 'countdown', 'buzzer'], 1);
                break;
            case 'kill':
                this.playSound('explosion');
                break;
            case 'powerup':
                this.playSound('powerup');
                break;
        }
    }

    playSocialSound(event) {
        switch (event) {
            case 'message':
                this.playSound('message');
                break;
            case 'typing':
                this.playSound('typing');
                break;
            case 'join':
                this.playSound('join');
                break;
            case 'leave':
                this.playSound('leave');
                break;
        }
    }

    // Sound Preferences
    loadSoundPreferences() {
        const prefs = localStorage.getItem('clutchzone_sound_prefs');
        if (prefs) {
            try {
                const preferences = JSON.parse(prefs);
                this.masterVolume = preferences.masterVolume || 1.0;
                this.sfxVolume = preferences.sfxVolume || 0.7;
                this.musicVolume = preferences.musicVolume || 0.5;
                this.soundEnabled = preferences.soundEnabled !== false;
                this.musicEnabled = preferences.musicEnabled !== false;
            } catch (error) {
                console.error('Error loading sound preferences:', error);
            }
        }
    }

    saveSoundPreferences() {
        const preferences = {
            masterVolume: this.masterVolume,
            sfxVolume: this.sfxVolume,
            musicVolume: this.musicVolume,
            soundEnabled: this.soundEnabled,
            musicEnabled: this.musicEnabled
        };
        localStorage.setItem('clutchzone_sound_prefs', JSON.stringify(preferences));
    }

    // Advanced Audio Effects
    createEchoEffect(sound, delay = 0.3, feedback = 0.3) {
        if (!this.audioContext) return;

        const delayNode = this.audioContext.createDelay();
        const feedbackNode = this.audioContext.createGain();
        const outputNode = this.audioContext.createGain();

        delayNode.delayTime.setValueAtTime(delay, this.audioContext.currentTime);
        feedbackNode.gain.setValueAtTime(feedback, this.audioContext.currentTime);
        outputNode.gain.setValueAtTime(0.7, this.audioContext.currentTime);

        // Connect echo chain
        sound.connect(delayNode);
        delayNode.connect(feedbackNode);
        feedbackNode.connect(delayNode);
        delayNode.connect(outputNode);
        sound.connect(outputNode);

        return outputNode;
    }

    createDistortionEffect(sound, amount = 50) {
        if (!this.audioContext) return;

        const waveShaperNode = this.audioContext.createWaveShaper();
        const curve = new Float32Array(44100);
        const deg = Math.PI / 180;

        for (let i = 0; i < 44100; i++) {
            const x = (i * 2) / 44100 - 1;
            curve[i] = ((3 + amount) * x * 20 * deg) / (Math.PI + amount * Math.abs(x));
        }

        waveShaperNode.curve = curve;
        waveShaperNode.oversample = '4x';

        sound.connect(waveShaperNode);
        return waveShaperNode;
    }

    // Accessibility
    enableReducedMotion() {
        // Disable rapid-fire sounds for accessibility
        this.soundEffects.hover.duration = 0;
        this.soundEffects.click.duration = Math.min(this.soundEffects.click.duration, 0.1);
    }

    // Performance
    preloadSounds() {
        // Pre-create audio buffers for better performance
        Object.keys(this.soundEffects).forEach(soundName => {
            this.createSoundBuffer(soundName);
        });
    }

    createSoundBuffer(soundName) {
        if (!this.audioContext) return;

        const config = this.soundEffects[soundName];
        if (!config) return;

        // Create offline audio context for pre-rendering
        const offlineContext = new OfflineAudioContext(1, 44100 * config.duration, 44100);
        const oscillator = offlineContext.createOscillator();
        const gainNode = offlineContext.createGain();

        oscillator.type = config.type;
        oscillator.frequency.setValueAtTime(config.frequency, 0);
        
        gainNode.gain.setValueAtTime(0, 0);
        gainNode.gain.linearRampToValueAtTime(config.volume || 0.3, 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, config.duration);

        oscillator.connect(gainNode);
        gainNode.connect(offlineContext.destination);

        oscillator.start(0);
        oscillator.stop(config.duration);

        return offlineContext.startRendering().then(buffer => {
            this.audioBuffers[soundName] = buffer;
        });
    }

    playPreloadedSound(soundName) {
        if (!this.soundEnabled || !this.audioContext || !this.audioBuffers[soundName]) return;

        const bufferSource = this.audioContext.createBufferSource();
        bufferSource.buffer = this.audioBuffers[soundName];
        bufferSource.connect(this.sfxGain);
        bufferSource.start();
    }

    // Add procedural audio fallback
    initProceduralAudio() {
        if (typeof ProceduralAudio !== 'undefined') {
            this.proceduralAudio = new ProceduralAudio();
            this.proceduralAudio.setVolume(this.sfxVolume);
        }
    }

    // Clean up
    destroy() {
        if (this.audioContext) {
            this.audioContext.close();
        }
        if (this.currentMusic) {
            this.currentMusic.stop();
        }
    }
}

// Initialize global sound manager
const soundManager = new SoundManager();

// Export for use in other modules
window.soundManager = soundManager;

// Utility functions for easy access
window.playSound = (soundName, options) => soundManager.playSound(soundName, options);
window.playUIFeedback = (type) => soundManager.playUIFeedback(type);
window.playMatchSound = (event) => soundManager.playMatchSound(event);
window.playSocialSound = (event) => soundManager.playSocialSound(event);

// Add sound control UI
const soundControlsHTML = `
    <div id="sound-controls" class="sound-controls">
        <button id="sound-toggle" class="sound-toggle" title="Toggle Sound">
            <i class="fas fa-volume-up"></i>
        </button>
        <div class="sound-panel">
            <div class="volume-control">
                <label>Master Volume</label>
                <input type="range" id="master-volume" min="0" max="1" step="0.1" value="1">
            </div>
            <div class="volume-control">
                <label>SFX Volume</label>
                <input type="range" id="sfx-volume" min="0" max="1" step="0.1" value="0.7">
            </div>
            <div class="volume-control">
                <label>Music Volume</label>
                <input type="range" id="music-volume" min="0" max="1" step="0.1" value="0.5">
            </div>
            <button id="music-toggle" class="music-toggle">
                <i class="fas fa-music"></i> Music
            </button>
        </div>
    </div>
`;

// Add sound controls to page
document.addEventListener('DOMContentLoaded', () => {
    document.body.insertAdjacentHTML('beforeend', soundControlsHTML);
    
    // Setup sound control event listeners
    const soundToggle = document.getElementById('sound-toggle');
    const musicToggle = document.getElementById('music-toggle');
    const masterVolume = document.getElementById('master-volume');
    const sfxVolume = document.getElementById('sfx-volume');
    const musicVolumeSlider = document.getElementById('music-volume');
    
    if (soundToggle) {
        soundToggle.addEventListener('click', () => {
            soundManager.toggleSound();
            soundToggle.querySelector('i').className = soundManager.soundEnabled ? 'fas fa-volume-up' : 'fas fa-volume-mute';
        });
    }
    
    if (musicToggle) {
        musicToggle.addEventListener('click', () => {
            soundManager.toggleMusic();
            musicToggle.classList.toggle('active', soundManager.musicEnabled);
        });
    }
    
    if (masterVolume) {
        masterVolume.addEventListener('input', (e) => {
            soundManager.setMasterVolume(parseFloat(e.target.value));
        });
    }
    
    if (sfxVolume) {
        sfxVolume.addEventListener('input', (e) => {
            soundManager.setSFXVolume(parseFloat(e.target.value));
        });
    }
    
    if (musicVolumeSlider) {
        musicVolumeSlider.addEventListener('input', (e) => {
            soundManager.setMusicVolume(parseFloat(e.target.value));
        });
    }
    
    // Initialize control states
    soundToggle.querySelector('i').className = soundManager.soundEnabled ? 'fas fa-volume-up' : 'fas fa-volume-mute';
    musicToggle.classList.toggle('active', soundManager.musicEnabled);
    masterVolume.value = soundManager.masterVolume;
    sfxVolume.value = soundManager.sfxVolume;
    musicVolumeSlider.value = soundManager.musicVolume;
});

// Clean up on page unload
window.addEventListener('beforeunload', () => {
    soundManager.destroy();
});

export { soundManager, SoundManager };
