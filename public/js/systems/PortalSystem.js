/**
 * AI Academy - Portal System
 * Torus ring portals for world transitions
 */

class PortalSystem {
    constructor(game) {
        this.game = game;
        this.portal = null;
        this.active = false;
        this.portalPosition = new THREE.Vector3(100, 0, 100);
        this.particles = null;
        this.rotationSpeed = 0;
    }

    setupForWorld(worldId) {
        this.cleanup();
        this.active = false;

        // Portal position varies by world
        const angle = (worldId * 0.7) % (Math.PI * 2);
        const dist = 80 + Math.random() * 40;
        this.portalPosition.set(
            Math.cos(angle) * dist,
            0,
            Math.sin(angle) * dist
        );

        this._createPortal();
    }

    _createPortal() {
        this.portal = new THREE.Group();

        // Torus ring
        const torusGeom = new THREE.TorusGeometry(3, 0.3, 16, 32);
        const torusMat = new THREE.MeshLambertMaterial({
            color: 0x00aaff,
            emissive: 0x004488,
            emissiveIntensity: 0.3
        });
        const torus = new THREE.Mesh(torusGeom, torusMat);
        torus.userData.isPortalRing = true;
        this.portal.add(torus);

        // Inner vortex plane
        const vortexGeom = new THREE.CircleGeometry(2.8, 32);
        const vortexMat = new THREE.MeshBasicMaterial({
            color: 0x0066ff,
            transparent: true,
            opacity: 0,
            side: THREE.DoubleSide
        });
        const vortex = new THREE.Mesh(vortexGeom, vortexMat);
        vortex.userData.isVortex = true;
        this.portal.add(vortex);

        // Portal particles
        const particleCount = 100;
        const particleGeom = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = 2 + Math.random() * 2;
            positions[i * 3] = Math.cos(angle) * radius;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 4;
            positions[i * 3 + 2] = Math.sin(angle) * radius;
        }
        particleGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.particles = new THREE.Points(particleGeom, new THREE.PointsMaterial({
            color: 0x44aaff, size: 0.1, transparent: true, opacity: 0,
            blending: THREE.AdditiveBlending
        }));
        this.portal.add(this.particles);

        // Position
        const height = this.game.chunkManager.getHeightAt(this.portalPosition.x, this.portalPosition.z);
        this.portal.position.set(this.portalPosition.x, height + 3.5, this.portalPosition.z);

        // Light beacon (visible from far away)
        const beaconGeom = new THREE.CylinderGeometry(0.15, 0.8, 40, 8, 1, true);
        const beaconMat = new THREE.MeshBasicMaterial({
            color: 0x44aaff, transparent: true, opacity: 0,
            side: THREE.DoubleSide, blending: THREE.AdditiveBlending
        });
        this.beacon = new THREE.Mesh(beaconGeom, beaconMat);
        this.beacon.position.y = 20;
        this.portal.add(this.beacon);

        // Glow ring on ground
        const glowRingGeom = new THREE.RingGeometry(3.5, 5, 32);
        const glowRingMat = new THREE.MeshBasicMaterial({
            color: 0x44aaff, transparent: true, opacity: 0,
            side: THREE.DoubleSide, blending: THREE.AdditiveBlending
        });
        this.glowRing = new THREE.Mesh(glowRingGeom, glowRingMat);
        this.glowRing.rotation.x = -Math.PI / 2;
        this.glowRing.position.y = -3;
        this.portal.add(this.glowRing);

        // Initially locked appearance
        torusMat.color.setHex(0x555555);
        torusMat.emissive.setHex(0x222222);

        this.game.sceneManager.add(this.portal);
    }

    activate() {
        if (this.active) return;
        this.active = true;

        // Unlock visual
        this.portal.traverse(child => {
            if (child.userData.isPortalRing) {
                child.material.color.setHex(0x00aaff);
                child.material.emissive.setHex(0x004488);
            }
            if (child.userData.isVortex) {
                child.material.opacity = 0.4;
            }
        });
        this.particles.material.opacity = 0.6;

        // Activate beacon and glow ring
        if (this.beacon) this.beacon.material.opacity = 0.15;
        if (this.glowRing) this.glowRing.material.opacity = 0.2;

        // Dramatic camera shake
        if (this.game.camera) {
            this.game.camera.addShake(0.8);
        }

        if (this.game.notificationUI) {
            this.game.notificationUI.show(i18n.t('portal.ready'), '', 'portal');
        }
    }

    cleanup() {
        if (this.portal) {
            this.game.sceneManager.remove(this.portal);
            this.portal.traverse(obj => {
                if (obj.geometry) obj.geometry.dispose();
                if (obj.material) obj.material.dispose();
            });
            this.portal = null;
            this.particles = null;
        }
    }

    update(delta, playerPosition) {
        if (!this.portal) return;

        // Rotate ring
        this.rotationSpeed = this.active ? 0.5 : 0.1;
        this.portal.traverse(child => {
            if (child.userData.isPortalRing) {
                child.rotation.z += delta * this.rotationSpeed;
            }
        });

        // Rotate particles
        if (this.particles && this.active) {
            const positions = this.particles.geometry.attributes.position.array;
            for (let i = 0; i < positions.length / 3; i++) {
                const x = positions[i * 3];
                const z = positions[i * 3 + 2];
                const angle = Math.atan2(z, x) + delta * 0.5;
                const radius = Math.sqrt(x * x + z * z);
                positions[i * 3] = Math.cos(angle) * radius;
                positions[i * 3 + 2] = Math.sin(angle) * radius;
                positions[i * 3 + 1] += (Math.random() - 0.5) * 0.05;
            }
            this.particles.geometry.attributes.position.needsUpdate = true;
        }

        // Animate beacon
        if (this.beacon && this.active) {
            this.beacon.material.opacity = 0.1 + Math.sin(Date.now() * 0.002) * 0.05;
            this.beacon.rotation.y += delta * 0.3;
        }
        if (this.glowRing && this.active) {
            this.glowRing.material.opacity = 0.15 + Math.sin(Date.now() * 0.003) * 0.08;
            const scale = 1 + Math.sin(Date.now() * 0.002) * 0.1;
            this.glowRing.scale.set(scale, scale, 1);
        }

        // Check player proximity for transport
        if (this.active) {
            const dx = playerPosition.x - this.portalPosition.x;
            const dz = playerPosition.z - this.portalPosition.z;
            const distance = Math.sqrt(dx * dx + dz * dz);

            // Proximity glow intensifies near portal
            if (distance < 20) {
                const proximity = 1 - distance / 20;
                this.portal.traverse(child => {
                    if (child.userData.isVortex) {
                        child.material.opacity = 0.4 + proximity * 0.3;
                    }
                });
                if (this.glowRing) {
                    this.glowRing.material.opacity = 0.2 + proximity * 0.3;
                }
            }

            if (distance < 4) {
                this._transport();
            }
        }
    }

    async _transport() {
        const currentWorld = this.game.worldManager.currentWorldId;
        const nextWorld = currentWorld + 1;

        if (nextWorld > CONFIG.academy.totalWorlds) {
            // Game complete!
            if (this.game.notificationUI) {
                this.game.notificationUI.show('🎉 AI Academy Complete!', i18n.t('notify.worldcomplete'), 'victory');
            }
            return;
        }

        if (this.game.worldManager.canAccessWorld(nextWorld)) {
            await this.game.worldManager.loadWorld(nextWorld);
        } else {
            if (this.game.notificationUI) {
                this.game.notificationUI.show(i18n.t('portal.locked'), '', 'warning');
            }
        }
    }
}

window.PortalSystem = PortalSystem;
