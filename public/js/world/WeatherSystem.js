/**
 * AI Academy - Weather System
 * Per-world weather: snow, embers, sparkles, butterflies, etc.
 */

class WeatherSystem {
    constructor(scene) {
        this.scene = scene;
        this.particles = null;
        this.particleVelocities = [];
        this.config = {};
        this.dayTime = 0.3;
        this.isNight = false;
        this.auroraActive = false;
        this.aurora = null;

        this._createAurora();
    }

    configure(weatherConfig) {
        this.config = weatherConfig || {};
    }

    _createAurora() {
        const geometry = new THREE.PlaneGeometry(400, 80, 80, 16);
        const material = new THREE.MeshBasicMaterial({
            color: 0x00ff88, transparent: true, opacity: 0,
            side: THREE.DoubleSide, blending: THREE.AdditiveBlending
        });
        this.aurora = new THREE.Mesh(geometry, material);
        this.aurora.position.set(0, 60, -200);
        this.aurora.rotation.x = Math.PI * 0.15;
        this.scene.add(this.aurora);
    }

    createParticles() {
        // Remove old particles
        if (this.particles) {
            this.scene.remove(this.particles);
            this.particles.geometry.dispose();
            this.particles.material.dispose();
        }

        const intensity = this.config.snowIntensity || 0;
        const hasEmbers = this.config.embers;
        const hasSparkles = this.config.sparkles;
        const hasButterflies = this.config.butterflies;

        if (intensity <= 0 && !hasEmbers && !hasSparkles && !hasButterflies) {
            this.particles = null;
            this.particleVelocities = [];
            return;
        }

        const count = Math.floor(3000 * (intensity || 0.3));
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        this.particleVelocities = [];

        let color = 0xffffff;
        let size = 0.2;
        let opacity = 0.8;

        if (hasEmbers) {
            color = 0xff6600;
            size = 0.15;
            opacity = 0.9;
        } else if (hasSparkles) {
            color = 0xaaaaff;
            size = 0.1;
            opacity = 0.6;
        } else if (hasButterflies) {
            color = 0xffaa44;
            size = 0.25;
            opacity = 0.7;
        }

        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 300;
            positions[i * 3 + 1] = Math.random() * 80;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 300;

            if (hasEmbers) {
                this.particleVelocities.push({
                    y: 0.1 + Math.random() * 0.2, // Embers rise (positive = up)
                    x: (Math.random() - 0.5) * 0.2
                });
            } else if (hasButterflies) {
                this.particleVelocities.push({
                    y: 0.05 + Math.random() * 0.1,
                    x: (Math.random() - 0.5) * 0.3
                });
            } else {
                this.particleVelocities.push({
                    y: 0.3 + Math.random() * 0.4,
                    x: (Math.random() - 0.5) * 0.1
                });
            }
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.particles = new THREE.Points(geometry, new THREE.PointsMaterial({
            color, size, transparent: true, opacity,
            blending: hasEmbers ? THREE.AdditiveBlending : THREE.NormalBlending
        }));
        this.scene.add(this.particles);
    }

    update(delta, playerPosition, sceneManager) {
        // Day/night cycle
        this.dayTime += delta * 0.005;
        if (this.dayTime > 1) this.dayTime = 0;
        this.isNight = this.dayTime > 0.7 || this.dayTime < 0.25;

        const sunAngle = this.dayTime * Math.PI * 2 - Math.PI / 2;
        sceneManager.setSunPosition(Math.cos(sunAngle) * 150, Math.sin(sunAngle) * 100 + 50, 50);

        const sky = BIOME_CONFIGS[window.game?.worldManager?.currentWorldId || 1]?.sky;

        if (this.isNight) {
            sceneManager.setSunIntensity(0.2);
            sceneManager.setAmbientIntensity(0.15);
            sceneManager.setBackground(sky?.nightColor || 0x0a0a1a);
            sceneManager.setFogColor(sky?.nightColor || 0x0a0a1a);
        } else {
            sceneManager.setSunIntensity(0.8 + Math.sin(sunAngle) * 0.4);
            sceneManager.setAmbientIntensity(0.3 + Math.sin(sunAngle) * 0.2);
            sceneManager.setBackground(sky?.dayColor || 0x87CEEB);
            sceneManager.setFogColor(sky?.fogColor || 0xc8d8e8);
        }

        // Aurora
        if (this.config.hasAurora && this.isNight && this.dayTime > 0.8) {
            this.auroraActive = true;
            this.aurora.material.opacity = Math.sin((this.dayTime - 0.8) * Math.PI * 5) * 0.4;
            this.aurora.material.color.setHSL((Date.now() * 0.0001) % 1, 0.8, 0.5);
        } else {
            this.auroraActive = false;
            this.aurora.material.opacity = 0;
        }

        // Particles
        if (this.particles) {
            const positions = this.particles.geometry.attributes.position.array;
            const hasEmbers = this.config.embers;

            for (let i = 0; i < positions.length / 3; i++) {
                const vel = this.particleVelocities[i];
                if (hasEmbers) {
                    positions[i * 3 + 1] += vel.y; // Rise for embers
                } else {
                    positions[i * 3 + 1] -= vel.y; // Fall for snow
                }
                positions[i * 3] += vel.x;

                if (hasEmbers) {
                    if (positions[i * 3 + 1] > 80) {
                        positions[i * 3] = playerPosition.x + (Math.random() - 0.5) * 200;
                        positions[i * 3 + 1] = Math.random() * 5;
                        positions[i * 3 + 2] = playerPosition.z + (Math.random() - 0.5) * 200;
                    }
                } else {
                    if (positions[i * 3 + 1] < 0) {
                        positions[i * 3] = playerPosition.x + (Math.random() - 0.5) * 200;
                        positions[i * 3 + 1] = 60 + Math.random() * 20;
                        positions[i * 3 + 2] = playerPosition.z + (Math.random() - 0.5) * 200;
                    }
                }
            }
            this.particles.geometry.attributes.position.needsUpdate = true;
        }
    }
}

window.WeatherSystem = WeatherSystem;
