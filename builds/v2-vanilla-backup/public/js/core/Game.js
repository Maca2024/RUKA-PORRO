/**
 * AI Academy - Game Orchestrator
 * Main game class that ties all systems together
 */

const CONFIG = window.CONFIG;
const BIOME_CONFIGS = window.BIOME_CONFIGS;
const MENTOR_PROFILES = window.MENTOR_PROFILES;
const BADGES = window.BADGES;
const i18n = window.i18n;
const EventBus = window.EventBus;
const SimplexNoise = window.SimplexNoise;
const SceneManager = window.SceneManager;
const InputManager = window.InputManager;
const ChunkManager = window.ChunkManager;
const Player = window.Player;
const CameraController = window.CameraController;
const BirdSystem = window.BirdSystem;
const SaveSystem = window.SaveSystem;
const ScoreSystem = window.ScoreSystem;
const AIEngine = window.AIEngine;
const VoiceInput = window.VoiceInput;
const AudioSystem = window.AudioSystem;
const WeatherSystem = window.WeatherSystem;
const MentorSystem = window.MentorSystem;
const ChallengeSystem = window.ChallengeSystem;
const PortalSystem = window.PortalSystem;
const WorldManager = window.WorldManager;
const ObjectiveSystem = window.ObjectiveSystem;
const HUD = window.HUD;
const ChallengeUI = window.ChallengeUI;
const NotificationUI = window.NotificationUI;
const WorldMapUI = window.WorldMapUI;
const TransitionUI = window.TransitionUI;
const DialogueUI = window.DialogueUI;
const Minimap = window.Minimap;

class Game {
    constructor() {
        this.clock = new THREE.Clock();
        this.noise = new SimplexNoise(12345);
        this.events = new EventBus();

        this.inDialogue = false;
        this.isListening = false;
        this.isProcessingDialogue = false;

        this.init();
    }

    init() {
        // Core
        this.sceneManager = new SceneManager();
        this.input = new InputManager(this.sceneManager.renderer);
        this.chunkManager = new ChunkManager(this.sceneManager.scene, this.noise);

        // Entities
        this.player = new Player(this.sceneManager.scene);
        this.camera = new CameraController(this.sceneManager, this.player);
        this.birdSystem = new BirdSystem(this.sceneManager.scene);

        // Systems
        this.saveSystem = new SaveSystem();
        this.scoreSystem = new ScoreSystem(this.saveSystem);
        this.aiEngine = new AIEngine();
        this.voiceInput = new VoiceInput();
        this.audioSystem = new AudioSystem();
        this.weatherSystem = new WeatherSystem(this.sceneManager.scene);
        this.mentorSystem = new MentorSystem(this);
        this.challengeSystem = new ChallengeSystem(this);
        this.portalSystem = new PortalSystem(this);
        this.worldManager = new WorldManager(this);
        this.objectiveSystem = new ObjectiveSystem(this);

        // UI
        this.hud = new HUD();
        this.challengeUI = new ChallengeUI();
        this.notificationUI = new NotificationUI();
        this.worldMapUI = new WorldMapUI();
        this.transitionUI = new TransitionUI();
        this.dialogueUI = new DialogueUI();
        this.minimap = new Minimap();

        // Setup
        this._setupInput();
        this.audioSystem.init();

        // Load saved state or default
        const savedWorld = this.saveSystem.data.currentWorld || 1;
        this.worldManager.loadWorld(savedWorld);

        // Create birds
        this.birdSystem.create();

        // Weather
        const biome = BIOME_CONFIGS[savedWorld];
        if (biome) {
            this.weatherSystem.configure(biome.weather);
            this.weatherSystem.createParticles();
        }

        // Update HUD
        this.hud.setWorld(savedWorld);
        this.hud.update();

        // Voice input
        this.voiceInput.onResult = (text) => this._handleVoiceInput(text);

        // Celebration effects (visual only - notifications handled by NotificationUI)
        window.addEventListener('levelUp', (e) => this._onLevelUp(e.detail.level));
        window.addEventListener('badgeEarned', (e) => this._onBadgeEarned(e.detail.badgeId));

        // Welcome / Objectives
        this.objectiveSystem.showWelcome();

        // Crosshair element for FP mode
        this.crosshair = document.createElement('div');
        this.crosshair.id = 'crosshair';
        document.getElementById('game-container').appendChild(this.crosshair);

        // Auto-hide controls hint after 30s
        this._controlsHideTimer = setTimeout(() => {
            const controls = document.querySelector('.hud-controls');
            if (controls) controls.style.opacity = '0';
        }, 30000);

        // Loading screen
        setTimeout(() => {
            const loading = document.getElementById('loading');
            if (loading) {
                loading.style.opacity = '0';
                setTimeout(() => loading.style.display = 'none', 500);
            }
        }, 2000);

        // Start game loop
        this.animate();
    }

    _setupInput() {
        // Keyboard
        this.input.on('keydown', (e) => {
            // Camera toggle
            if (e.code === 'KeyC' && !this.inDialogue) {
                const msg = this.camera.toggleMode();
                this._showMessage(msg);
            }

            // Talk to mentor
            if (e.code === 'KeyV' && !this.inDialogue && this.mentorSystem.nearbyMentor) {
                this._startDialogue();
            }

            // Voice in dialogue
            if (e.code === 'KeyV' && this.inDialogue) {
                if (!this.isListening) {
                    this.voiceInput.start();
                    this.isListening = true;
                    this._showMessage(i18n.lang === 'nl' ? 'Luisteren... spreek nu' : 'Listening... speak now');
                } else {
                    this.voiceInput.stop();
                    this.isListening = false;
                }
            }

            // Escape
            if (e.code === 'Escape') {
                if (this.challengeSystem.inChallenge) {
                    this.challengeSystem.endChallenge();
                } else if (this.inDialogue) {
                    this._endDialogue();
                } else if (this.worldMapUI.visible) {
                    this.worldMapUI.hide();
                }
            }

            // Map
            if (e.code === 'KeyM' && !this.inDialogue) {
                this.worldMapUI.toggle();
            }

            // Tab to cycle objectives
            if (e.code === 'Tab' && !this.inDialogue) {
                e.preventDefault();
                this._cycleObjective();
            }
        });

        // Mouse
        this.input.on('leftclick', (e) => {
            if (!this.input.mouseLocked && !this.inDialogue) {
                this.input.requestPointerLock();
            }
        });

        this.input.on('rightclick', () => {
            if (!this.inDialogue) this._eat();
        });

        this.input.on('mousemove', (data) => {
            if (!this.inDialogue) {
                this.camera.handleMouseMove(data.x, data.y);
            }
        });

        this.input.on('wheel', (data) => {
            this.camera.handleScroll(data.deltaY);
        });

        this.input.on('resize', (data) => {
            this.sceneManager.resize(data.width, data.height);
        });

        // Dialogue input
        const dialogueInput = document.getElementById('dialogue-input');
        if (dialogueInput) {
            dialogueInput.addEventListener('keydown', (e) => {
                if (e.code === 'Enter' && this.mentorSystem.nearbyMentor) {
                    const text = dialogueInput.value.trim();
                    if (text) {
                        this._processDialogue(this.mentorSystem.nearbyMentor.userData.mentorKey, text);
                        dialogueInput.value = '';
                    }
                }
                e.stopPropagation(); // Don't trigger game controls while typing
            });
        }
    }

    // ===============================================
    // Actions
    // ===============================================

    _eat() {
        const nearbyLichen = this.chunkManager.getNearbyLichen(
            this.player.position.x, this.player.position.z, 4
        );

        if (nearbyLichen.length > 0) {
            const lichen = nearbyLichen[0];
            lichen.userData.collected = true;
            lichen.visible = false;

            // Particle burst effect
            this._spawnCollectParticles(lichen.position);
            this._showMessage(i18n.lang === 'nl' ? 'Mmm! Korstmos gevonden!' : 'Yum! Found lichen!');
        }
    }

    _spawnCollectParticles(position) {
        const count = 12;
        const geom = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const velocities = [];

        for (let i = 0; i < count; i++) {
            positions[i * 3] = position.x;
            positions[i * 3 + 1] = position.y + 0.5;
            positions[i * 3 + 2] = position.z;
            velocities.push({
                x: (Math.random() - 0.5) * 3,
                y: 2 + Math.random() * 3,
                z: (Math.random() - 0.5) * 3
            });
        }

        geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const particles = new THREE.Points(geom, new THREE.PointsMaterial({
            color: 0x7cb342, size: 0.3, transparent: true, opacity: 1,
            blending: THREE.AdditiveBlending
        }));

        this.sceneManager.add(particles);

        let life = 0;
        const animate = () => {
            life += 0.016;
            if (life > 0.8) {
                this.sceneManager.remove(particles);
                geom.dispose();
                particles.material.dispose();
                return;
            }
            const pos = particles.geometry.attributes.position.array;
            for (let i = 0; i < count; i++) {
                pos[i * 3] += velocities[i].x * 0.016;
                pos[i * 3 + 1] += velocities[i].y * 0.016;
                pos[i * 3 + 2] += velocities[i].z * 0.016;
                velocities[i].y -= 5 * 0.016;
            }
            particles.geometry.attributes.position.needsUpdate = true;
            particles.material.opacity = 1 - life / 0.8;
            requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    }

    _startDialogue() {
        if (!this.mentorSystem.nearbyMentor) return;
        this.inDialogue = true;
        this.input.exitPointerLock();

        const mentorKey = this.mentorSystem.nearbyMentor.userData.mentorKey;
        this.dialogueUI.show(mentorKey);

        // Track mentor meeting
        this.saveSystem.meetMentor(mentorKey);
        this.objectiveSystem.onMentorMet();
    }

    _endDialogue() {
        this.inDialogue = false;
        this.dialogueUI.hide();
        this.aiEngine.stopSpeaking();

        if (this.voiceInput) {
            this.voiceInput.stop();
            this.isListening = false;
        }
    }

    _handleVoiceInput(text) {
        if (this.mentorSystem.nearbyMentor && !this.isProcessingDialogue) {
            this._processDialogue(this.mentorSystem.nearbyMentor.userData.mentorKey, text);
        }
    }

    async _processDialogue(mentorKey, playerInput) {
        if (this.isProcessingDialogue) return;
        this.isProcessingDialogue = true;

        const mentor = MENTOR_PROFILES[mentorKey];
        this.dialogueUI.showResponse(mentor?.name || mentorKey, '');
        this.dialogueUI.showThinking();

        try {
            const response = await this.aiEngine.generateResponse(mentorKey, playerInput);
            if (response) {
                this.dialogueUI.showResponse(mentor?.name || mentorKey, response);
                this.aiEngine.speakResponse(response, mentorKey);
            }
        } catch (error) {
            console.error('Dialogue error:', error);
        }

        this.isProcessingDialogue = false;
    }

    _cycleObjective() {
        if (this.objectiveSystem.objectives.length > 1) {
            const idx = this.objectiveSystem.objectives.indexOf(this.objectiveSystem.currentObjective);
            const next = (idx + 1) % this.objectiveSystem.objectives.length;
            this.objectiveSystem.currentObjective = this.objectiveSystem.objectives[next];
            this.objectiveSystem._updateUI();
        }
    }

    _onLevelUp(level) {
        this.camera.addShake(0.6);
        this._spawnCelebrationBurst(0xFFD700, 30);
        this.hud.update();
    }

    _onBadgeEarned(badgeId) {
        const badge = BADGES[badgeId];
        if (!badge) return;

        this.camera.addShake(0.3);
        this._spawnCelebrationBurst(0x00C9A7, 20);
        this.hud.update();
    }

    _spawnCelebrationBurst(color, count) {
        const geom = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const velocities = [];

        for (let i = 0; i < count; i++) {
            positions[i * 3] = this.player.position.x;
            positions[i * 3 + 1] = this.player.position.y + 2;
            positions[i * 3 + 2] = this.player.position.z;
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 4;
            velocities.push({
                x: Math.cos(angle) * speed,
                y: 3 + Math.random() * 5,
                z: Math.sin(angle) * speed
            });
        }

        geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const particles = new THREE.Points(geom, new THREE.PointsMaterial({
            color, size: 0.4, transparent: true, opacity: 1,
            blending: THREE.AdditiveBlending
        }));

        this.sceneManager.add(particles);

        let life = 0;
        const animate = () => {
            life += 0.016;
            if (life > 1.5) {
                this.sceneManager.remove(particles);
                geom.dispose();
                particles.material.dispose();
                return;
            }
            const pos = particles.geometry.attributes.position.array;
            for (let i = 0; i < count; i++) {
                pos[i * 3] += velocities[i].x * 0.016;
                pos[i * 3 + 1] += velocities[i].y * 0.016;
                pos[i * 3 + 2] += velocities[i].z * 0.016;
                velocities[i].y -= 4 * 0.016;
            }
            particles.geometry.attributes.position.needsUpdate = true;
            particles.material.opacity = 1 - life / 1.5;
            requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    }

    _showMessage(text) {
        const messageEl = document.getElementById('message');
        if (messageEl) {
            messageEl.textContent = text;
            messageEl.classList.add('show');
            setTimeout(() => messageEl.classList.remove('show'), 3000);
        }
    }

    // ===============================================
    // Game Loop
    // ===============================================

    animate() {
        requestAnimationFrame(() => this.animate());

        try {

        const delta = Math.min(this.clock.getDelta(), 0.1);

        // Sprint FOV
        const isSprinting = this.input.isSprinting();
        this.camera.setSprinting(isSprinting);

        // Head bob intensity based on movement
        const speed = Math.sqrt(this.player.velocity.x ** 2 + this.player.velocity.z ** 2);
        this.camera.headBobIntensity = Math.min(1, speed / CONFIG.player.sprintSpeed);

        // Crosshair visibility
        if (this.crosshair) {
            this.crosshair.style.display = this.camera.mode === 'firstPerson' && this.input.mouseLocked ? 'block' : 'none';
        }

        // Update systems
        this.player.update(delta, this.input, this.camera.angleY, this.camera.mode, this.chunkManager);
        this.camera.update(delta);
        this.weatherSystem.update(delta, this.player.position, this.sceneManager);
        this.birdSystem.update(delta);
        this.mentorSystem.update(delta, this.player.position);
        this.portalSystem.update(delta, this.player.position);
        this.audioSystem.update(
            this.player.position,
            this.player.velocity,
            isSprinting,
            this.chunkManager.lakes
        );

        // Chunk loading
        this.chunkManager.update(this.player.position.x, this.player.position.z);

        // Objective / compass
        this.objectiveSystem.update(this.player.position, this.camera.angleY);

        // Show nearby mentor prompt
        if (this.mentorSystem.nearbyMentor && !this.inDialogue) {
            const name = this.mentorSystem.nearbyMentor.userData.mentorName;
            this._showMessage(`V - ${i18n.t('controls.talk')} ${name}`);
        }

        // Update minimap
        this.minimap.update(
            this.player.position,
            this.camera.angleY,
            this.chunkManager,
            this.mentorSystem.mentors,
            this.portalSystem
        );

        // Periodic badge check
        if (Math.random() < 0.001) {
            this.scoreSystem.checkBadges();
        }

        // Render
        this.sceneManager.render();

        } catch (error) {
            console.error('Game loop error:', error);
        }
    }
}

// Start game
window.addEventListener('load', () => {
    window.game = new Game();
});

export { Game };
