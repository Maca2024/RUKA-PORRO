/**
 * AI Academy - Player (Poro the Reindeer)
 * Reindeer model with animated legs and movement
 */

const CONFIG = window.CONFIG;

class Player {
    constructor(scene) {
        this.scene = scene;
        this.position = new THREE.Vector3(0, 10, 0);
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.rotation = { x: 0, y: 0 };
        this.onGround = false;

        this.legs = [];
        this.legPhase = 0;
        this.head = null;
        this.eyePosition = new THREE.Vector3(0, 1.8, 0);

        this._createReindeer();
    }

    _createReindeer() {
        this.model = new THREE.Group();

        // Body
        const bodyGeom = new THREE.CapsuleGeometry(0.5, 1.2, 4, 8);
        const bodyMat = new THREE.MeshLambertMaterial({ color: 0x8B7355 });
        const body = new THREE.Mesh(bodyGeom, bodyMat);
        body.rotation.z = Math.PI / 2;
        body.position.y = 0.8;
        this.model.add(body);

        // Head
        const headGeom = new THREE.SphereGeometry(0.35, 8, 6);
        this.head = new THREE.Mesh(headGeom, bodyMat);
        this.head.position.set(0.9, 1.1, 0);
        this.model.add(this.head);

        // Eyes
        const eyeWhiteGeom = new THREE.SphereGeometry(0.12, 8, 8);
        const eyeWhiteMat = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
        const eyePupilGeom = new THREE.SphereGeometry(0.07, 8, 8);
        const eyePupilMat = new THREE.MeshLambertMaterial({ color: 0x1a1a1a });
        const eyeShineGeom = new THREE.SphereGeometry(0.025, 6, 6);
        const eyeShineMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });

        // Left eye
        const leftEye = new THREE.Group();
        leftEye.add(new THREE.Mesh(eyeWhiteGeom, eyeWhiteMat));
        const leftPupil = new THREE.Mesh(eyePupilGeom, eyePupilMat);
        leftPupil.position.x = 0.05;
        leftEye.add(leftPupil);
        const leftShine = new THREE.Mesh(eyeShineGeom, eyeShineMat);
        leftShine.position.set(0.08, 0.03, 0.03);
        leftEye.add(leftShine);
        leftEye.position.set(1.15, 1.2, 0.15);
        this.model.add(leftEye);

        // Right eye
        const rightEye = new THREE.Group();
        rightEye.add(new THREE.Mesh(eyeWhiteGeom, eyeWhiteMat));
        const rightPupil = new THREE.Mesh(eyePupilGeom, eyePupilMat);
        rightPupil.position.x = 0.05;
        rightEye.add(rightPupil);
        const rightShine = new THREE.Mesh(eyeShineGeom, eyeShineMat);
        rightShine.position.set(0.08, 0.03, -0.03);
        rightEye.add(rightShine);
        rightEye.position.set(1.15, 1.2, -0.15);
        this.model.add(rightEye);

        // Nose
        const noseGeom = new THREE.SphereGeometry(0.08, 6, 6);
        const noseMat = new THREE.MeshLambertMaterial({ color: 0x2a2a2a });
        const nose = new THREE.Mesh(noseGeom, noseMat);
        nose.position.set(1.25, 1.05, 0);
        this.model.add(nose);

        // Antlers
        const antlerMat = new THREE.MeshLambertMaterial({ color: 0x5C4033 });
        [-0.25, 0.25].forEach(z => {
            const antlerGroup = new THREE.Group();
            const mainBeam = new THREE.CylinderGeometry(0.04, 0.06, 0.8, 5);
            const main = new THREE.Mesh(mainBeam, antlerMat);
            main.position.y = 0.4;
            main.rotation.z = z > 0 ? 0.3 : -0.3;
            antlerGroup.add(main);

            const branchGeom = new THREE.CylinderGeometry(0.02, 0.03, 0.3, 4);
            const branch1 = new THREE.Mesh(branchGeom, antlerMat);
            branch1.position.set(0, 0.5, z > 0 ? 0.1 : -0.1);
            branch1.rotation.z = z > 0 ? -0.5 : 0.5;
            antlerGroup.add(branch1);

            antlerGroup.position.set(0.8, 1.4, z);
            this.model.add(antlerGroup);
        });

        // Legs
        const legGeom = new THREE.CylinderGeometry(0.08, 0.06, 0.8, 6);
        const legMat = new THREE.MeshLambertMaterial({ color: 0x6B5344 });
        const hoofGeom = new THREE.CylinderGeometry(0.07, 0.09, 0.1, 6);
        const hoofMat = new THREE.MeshLambertMaterial({ color: 0x2a2a2a });

        const legPositions = [
            { x: 0.4, z: 0.2, name: 'frontLeft' },
            { x: 0.4, z: -0.2, name: 'frontRight' },
            { x: -0.4, z: 0.2, name: 'backLeft' },
            { x: -0.4, z: -0.2, name: 'backRight' }
        ];

        legPositions.forEach((pos, index) => {
            const legGroup = new THREE.Group();
            const upperLeg = new THREE.Mesh(legGeom, legMat);
            upperLeg.position.y = -0.2;
            legGroup.add(upperLeg);

            const hoof = new THREE.Mesh(hoofGeom, hoofMat);
            hoof.position.y = -0.65;
            legGroup.add(hoof);

            legGroup.position.set(pos.x, 0.8, pos.z);
            legGroup.userData = {
                name: pos.name,
                baseY: 0.8,
                phase: index % 2 === 0 ? 0 : Math.PI
            };

            this.model.add(legGroup);
            this.legs.push(legGroup);
        });

        // Belly
        const bellyGeom = new THREE.SphereGeometry(0.4, 8, 6);
        const bellyMat = new THREE.MeshLambertMaterial({ color: 0xDDD5C8 });
        const belly = new THREE.Mesh(bellyGeom, bellyMat);
        belly.position.set(0, 0.6, 0);
        belly.scale.set(1.5, 0.5, 0.8);
        this.model.add(belly);

        // Tail
        const tailGeom = new THREE.SphereGeometry(0.15, 6, 6);
        const tailMat = new THREE.MeshLambertMaterial({ color: 0xDDD5C8 });
        const tail = new THREE.Mesh(tailGeom, tailMat);
        tail.position.set(-0.9, 0.9, 0);
        tail.scale.set(1, 0.7, 0.7);
        this.model.add(tail);

        this.scene.add(this.model);
    }

    animateLegs(delta, isMoving, speed) {
        if (!this.legs || this.legs.length === 0) return;

        if (isMoving) {
            this.legPhase += delta * speed * 0.8;
            this.legs.forEach(leg => {
                const phase = this.legPhase + leg.userData.phase;
                leg.rotation.x = Math.sin(phase) * 0.4;
                const lift = Math.max(0, Math.sin(phase)) * 0.1;
                leg.position.y = leg.userData.baseY + lift;
            });
        } else {
            this.legs.forEach(leg => {
                leg.rotation.x *= 0.9;
                leg.position.y += (leg.userData.baseY - leg.position.y) * 0.1;
            });
        }
    }

    update(delta, input, cameraAngleY, cameraMode, chunkManager) {
        const inDialogue = window.game?.inDialogue;
        if (inDialogue) return;

        const isSprinting = input.isSprinting();
        const moveSpeed = isSprinting ? CONFIG.player.sprintSpeed : CONFIG.player.walkSpeed;

        let forward = 0;
        let right = 0;

        if (input.isDown('ArrowUp') || input.isDown('KeyW')) forward = 1;
        if (input.isDown('ArrowDown') || input.isDown('KeyS')) forward = -1;
        if (input.isDown('ArrowRight') || input.isDown('KeyD')) right = 1;
        if (input.isDown('ArrowLeft') || input.isDown('KeyA')) right = -1;

        const isMoving = forward !== 0 || right !== 0;

        let dx = 0;
        let dz = 0;

        if (isMoving) {
            const len = Math.sqrt(forward * forward + right * right);
            forward /= len;
            right /= len;

            // Movement relative to camera direction
            const camY = cameraAngleY;
            const forwardX = -Math.sin(camY);
            const forwardZ = -Math.cos(camY);
            // Right = forward rotated 90° CW from above: (-fz, fx)
            const rightX = Math.cos(camY);
            const rightZ = -Math.sin(camY);

            dx = (forward * forwardX + right * rightX) * moveSpeed * delta;
            dz = (forward * forwardZ + right * rightZ) * moveSpeed * delta;

            this.position.x += dx;
            this.position.z += dz;
            this.velocity.x = dx / delta;
            this.velocity.z = dz / delta;
        } else {
            this.velocity.x *= 0.9;
            this.velocity.z *= 0.9;
        }

        // Poro model faces movement direction (not camera), except in first person
        if (cameraMode !== 'firstPerson') {
            if (isMoving) {
                // Face movement direction
                const moveAngle = Math.atan2(dx, dz);
                let diff = moveAngle - this.rotation.y;
                while (diff > Math.PI) diff -= Math.PI * 2;
                while (diff < -Math.PI) diff += Math.PI * 2;
                this.rotation.y += diff * 0.15;
            }
            // When not moving, keep facing last direction (don't snap to camera)
        }
        // In first-person, rotation is set by CameraController

        this.animateLegs(delta, isMoving, moveSpeed);

        // Gravity
        const terrainHeight = chunkManager.getHeightAt(this.position.x, this.position.z);
        this.velocity.y -= 30 * delta;

        if (this.position.y <= terrainHeight + 1) {
            this.position.y = terrainHeight + 1;
            this.velocity.y = 0;
            this.onGround = true;
        } else {
            this.onGround = false;
        }

        this.position.y += this.velocity.y * delta;

        // Jump
        if (input.isDown('Space') && this.onGround) {
            this.velocity.y = CONFIG.player.jumpForce;
            this.onGround = false;
        }

        // World bounds
        const halfWorld = CONFIG.world.size / 2;
        this.position.x = Math.max(-halfWorld, Math.min(halfWorld, this.position.x));
        this.position.z = Math.max(-halfWorld, Math.min(halfWorld, this.position.z));

        // Sync model
        this.model.position.copy(this.position);
        this.model.rotation.y = this.rotation.y;
    }

    setVisible(visible) {
        this.model.visible = visible;
    }
}

window.Player = Player;
export { Player };
