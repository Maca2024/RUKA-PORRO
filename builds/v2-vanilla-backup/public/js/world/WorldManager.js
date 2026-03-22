/**
 * AI Academy - World Manager
 * Handles world transitions, loading/unloading worlds
 */

const BIOME_CONFIGS = window.BIOME_CONFIGS;
const CONFIG = window.CONFIG;
const i18n = window.i18n;

class WorldManager {
    constructor(game) {
        this.game = game;
        this.currentWorldId = 1;
        this.worlds = {};
        this.transitioning = false;
    }

    getCurrentWorld() {
        return this.worlds[this.currentWorldId];
    }

    async loadWorld(worldId) {
        if (this.transitioning) return;
        this.transitioning = true;

        const biome = BIOME_CONFIGS[worldId];
        if (!biome) {
            console.error('Unknown world:', worldId);
            this.transitioning = false;
            return;
        }

        // Show transition
        if (this.game.transitionUI) {
            await this.game.transitionUI.show(worldId);
        }

        // Unload current world entities
        this._unloadCurrentWorld();

        // Update biome
        this.currentWorldId = worldId;
        this.game.chunkManager.setBiome(worldId);

        // Update sky
        const sky = biome.sky;
        this.game.sceneManager.setBackground(sky.dayColor);
        this.game.sceneManager.setFogColor(sky.fogColor);
        this.game.sceneManager.scene.fog.near = sky.fogNear;
        this.game.sceneManager.scene.fog.far = sky.fogFar;

        // Reset player position
        this.game.player.position.set(0, 10, 0);
        this.game.player.velocity.set(0, 0, 0);

        // Load terrain
        this.game.chunkManager.update(0, 0);

        // Load world-specific NPCs (mentors)
        if (this.game.mentorSystem) {
            this.game.mentorSystem.loadWorldMentors(worldId);
        }

        // Load portals
        if (this.game.portalSystem) {
            this.game.portalSystem.setupForWorld(worldId);
        }

        // Load challenges
        if (this.game.challengeSystem) {
            this.game.challengeSystem.loadWorldChallenges(worldId);
        }

        // Update weather
        if (this.game.weatherSystem) {
            this.game.weatherSystem.configure(biome.weather);
        }

        // Update HUD
        if (this.game.hud) {
            this.game.hud.setWorld(worldId);
        }

        // Regenerate snow/particles
        this.game.weatherSystem?.createParticles();

        // Hide transition
        if (this.game.transitionUI) {
            await this.game.transitionUI.hide();
        }

        this.transitioning = false;

        // Notification
        if (this.game.notificationUI) {
            const worldName = i18n.t(`world.${worldId}.name`);
            const worldSkill = i18n.t(`world.${worldId}.skill`);
            this.game.notificationUI.show(`${worldName}`, worldSkill, 'world');
        }

        // Refresh objectives for new world
        if (this.game.objectiveSystem) {
            this.game.objectiveSystem.onWorldChanged(worldId);
        }

        // Save current world
        if (this.game.saveSystem) {
            this.game.saveSystem.setCurrentWorld(worldId);
        }

        console.log(`World ${worldId} loaded: ${biome.name}`);
    }

    _unloadCurrentWorld() {
        // Remove world-specific entities
        if (this.game.mentorSystem) {
            this.game.mentorSystem.unloadMentors();
        }
        if (this.game.portalSystem) {
            this.game.portalSystem.cleanup();
        }
    }

    canAccessWorld(worldId) {
        if (worldId === 1) return true;
        // Previous world must be >= 80% complete
        const prevProgress = this.game.scoreSystem?.getWorldCompletion(worldId - 1) || 0;
        return prevProgress >= CONFIG.academy.portalActivationThreshold;
    }

    getWorldCount() {
        return Object.keys(BIOME_CONFIGS).length;
    }
}

window.WorldManager = WorldManager;
export { WorldManager };
