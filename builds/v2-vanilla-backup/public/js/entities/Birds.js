/**
 * AI Academy - Bird Flocks
 * Ambient bird flocks flying through the world
 */

const CONFIG = window.CONFIG;

class BirdSystem {
    constructor(scene) {
        this.scene = scene;
        this.flocks = [];
        this.worldSize = CONFIG.world.size;
    }

    create() {
        this.cleanup();

        for (let flock = 0; flock < CONFIG.entities.birdFlocks; flock++) {
            const center = new THREE.Vector3(
                (Math.random() - 0.5) * this.worldSize * 0.3,
                40 + Math.random() * 30,
                (Math.random() - 0.5) * this.worldSize * 0.3
            );
            const speed = 8 + Math.random() * 6;
            const direction = Math.random() * Math.PI * 2;
            const flockSize = 4 + Math.floor(Math.random() * 6);
            const birds = [];

            for (let i = 0; i < flockSize; i++) {
                const bird = new THREE.Group();
                const body = new THREE.Mesh(
                    new THREE.SphereGeometry(0.15, 5, 5),
                    new THREE.MeshLambertMaterial({ color: 0x2a2a2a })
                );
                body.scale.set(1, 0.6, 1.4);
                bird.add(body);

                const wingGeom = new THREE.BoxGeometry(0.6, 0.04, 0.2);
                const wingMat = new THREE.MeshLambertMaterial({ color: 0x1a1a1a });
                const leftWing = new THREE.Mesh(wingGeom, wingMat);
                leftWing.position.set(-0.3, 0, 0);
                bird.add(leftWing);
                const rightWing = new THREE.Mesh(wingGeom, wingMat);
                rightWing.position.set(0.3, 0, 0);
                bird.add(rightWing);

                bird.position.set(
                    center.x + (Math.random() - 0.5) * 8,
                    center.y + (Math.random() - 0.5) * 4,
                    center.z + (Math.random() - 0.5) * 8
                );

                bird.userData = { leftWing, rightWing, wingPhase: Math.random() * Math.PI * 2 };
                this.scene.add(bird);
                birds.push(bird);
            }

            this.flocks.push({ birds, center, speed, direction });
        }
    }

    cleanup() {
        for (const flock of this.flocks) {
            for (const bird of flock.birds) {
                this.scene.remove(bird);
                bird.traverse(obj => {
                    if (obj.geometry) obj.geometry.dispose();
                    if (obj.material) obj.material.dispose();
                });
            }
        }
        this.flocks = [];
    }

    update(delta) {
        const halfWorld = this.worldSize / 2;

        for (const flock of this.flocks) {
            flock.center.x += Math.cos(flock.direction) * flock.speed * delta;
            flock.center.z += Math.sin(flock.direction) * flock.speed * delta;

            if (flock.center.x > halfWorld) flock.center.x = -halfWorld;
            if (flock.center.x < -halfWorld) flock.center.x = halfWorld;
            if (flock.center.z > halfWorld) flock.center.z = -halfWorld;
            if (flock.center.z < -halfWorld) flock.center.z = halfWorld;

            if (Math.random() < 0.002) flock.direction += (Math.random() - 0.5) * 0.5;

            for (const bird of flock.birds) {
                bird.position.lerp(new THREE.Vector3(
                    flock.center.x + (Math.random() - 0.5) * 5,
                    flock.center.y + (Math.random() - 0.5) * 2,
                    flock.center.z + (Math.random() - 0.5) * 5
                ), 0.02);

                bird.rotation.y = flock.direction + Math.PI;
                bird.userData.wingPhase += delta * 15;
                const wingAngle = Math.sin(bird.userData.wingPhase) * 0.5;
                bird.userData.leftWing.rotation.z = wingAngle;
                bird.userData.rightWing.rotation.z = -wingAngle;
            }
        }
    }
}

window.BirdSystem = BirdSystem;
export { BirdSystem };
