/**
 * AI Academy - Camera System
 * Orbit, cinematic, and first-person camera modes
 */

const i18n = window.i18n;

class CameraController {
    constructor(sceneManager, player) {
        this.sceneManager = sceneManager;
        this.camera = sceneManager.camera;
        this.player = player;

        this.mode = 'orbit'; // 'orbit', 'cinematic', 'firstPerson'
        this.distance = 15;
        this.height = 4;
        this.angleX = 0.5;  // pitch (vertical)
        this.angleY = 0;    // yaw (horizontal)
        this.targetDistance = 15;
        this.smoothness = 0.1;
        this.shake = 0;

        // First-person pitch (separate from orbit pitch)
        this.fpPitch = 0;

        // Head bob for FP immersion
        this.headBobPhase = 0;
        this.headBobIntensity = 0;

        // Sprint FOV
        this.baseFOV = 70;
        this.targetFOV = 70;
    }

    toggleMode() {
        const modes = ['orbit', 'cinematic', 'firstPerson'];
        const currentIndex = modes.indexOf(this.mode);
        this.mode = modes[(currentIndex + 1) % modes.length];

        switch (this.mode) {
            case 'orbit':
                this.targetDistance = 12;
                this.height = 6;
                this.player.setVisible(true);
                return i18n.t('controls.camera') + ': Orbit';
            case 'cinematic':
                this.targetDistance = 20;
                this.height = 10;
                this.player.setVisible(true);
                return i18n.t('controls.camera') + ': Cinematic';
            case 'firstPerson':
                this.fpPitch = 0;
                this.player.setVisible(false);
                return i18n.t('controls.camera') + ': First Person';
        }
    }

    handleMouseMove(movementX, movementY) {
        const sensitivity = 0.004;
        // Negate X: mouse-right must decrease angleY so lookX = -sin(negative) = positive = RIGHT
        this.angleY -= movementX * sensitivity;

        if (this.mode === 'firstPerson') {
            // First-person: direct pitch control
            this.fpPitch -= movementY * sensitivity;
            this.fpPitch = Math.max(-1.2, Math.min(1.2, this.fpPitch));
        } else {
            // Orbit/cinematic: orbit pitch
            this.angleX -= movementY * sensitivity;
            this.angleX = Math.max(0.2, Math.min(1.4, this.angleX));
        }
    }

    handleScroll(deltaY) {
        if (this.mode !== 'firstPerson') {
            this.targetDistance += deltaY * 0.015;
            this.targetDistance = Math.max(4, Math.min(40, this.targetDistance));
        }
    }

    addShake(amount) {
        this.shake = Math.min(1, this.shake + amount);
    }

    setSprinting(isSprinting) {
        this.targetFOV = isSprinting ? 78 : this.baseFOV;
    }

    update(delta) {
        // Smooth zoom
        this.distance += (this.targetDistance - this.distance) * 0.1;

        // Smooth FOV for sprint
        const fovDiff = this.targetFOV - this.camera.fov;
        if (Math.abs(fovDiff) > 0.1) {
            this.camera.fov += fovDiff * 0.08;
            this.camera.updateProjectionMatrix();
        }

        // Decay shake
        this.shake *= 0.95;

        if (this.mode === 'firstPerson') {
            // Head bob when moving
            const isMoving = this.headBobIntensity > 0.01;
            if (isMoving) {
                this.headBobPhase += delta * 10;
            } else {
                this.headBobPhase = 0;
            }
            this.headBobIntensity *= 0.9; // decay

            const bobY = Math.sin(this.headBobPhase) * this.headBobIntensity * 0.04;
            const bobX = Math.cos(this.headBobPhase * 0.5) * this.headBobIntensity * 0.02;

            // Eye position: on the reindeer's head, no model rotation dependency
            const eyePos = new THREE.Vector3(
                this.player.position.x + bobX,
                this.player.position.y + 1.8 + bobY,
                this.player.position.z
            );
            this.camera.position.lerp(eyePos, 0.3);

            // Apply shake in FP too
            if (this.shake > 0.01) {
                this.camera.position.x += (Math.random() - 0.5) * this.shake * 0.3;
                this.camera.position.y += (Math.random() - 0.5) * this.shake * 0.2;
            }

            // Look direction from mouse-controlled angleY and fpPitch
            const lookDir = new THREE.Vector3(
                -Math.sin(this.angleY) * Math.cos(this.fpPitch),
                Math.sin(this.fpPitch),
                -Math.cos(this.angleY) * Math.cos(this.fpPitch)
            );
            const lookTarget = this.camera.position.clone().add(lookDir.multiplyScalar(10));
            this.camera.lookAt(lookTarget);

            // Sync player rotation to camera yaw in FP mode
            this.player.rotation.y = this.angleY;
        } else {
            const dist = this.distance;
            const height = this.height + dist * Math.sin(this.angleX);

            const camX = this.player.position.x + Math.sin(this.angleY) * dist * Math.cos(this.angleX);
            const camZ = this.player.position.z + Math.cos(this.angleY) * dist * Math.cos(this.angleX);
            const camY = this.player.position.y + height;

            const smoothness = this.mode === 'cinematic' ? 0.05 : 0.12;
            this.camera.position.x += (camX - this.camera.position.x) * smoothness;
            this.camera.position.y += (camY - this.camera.position.y) * smoothness;
            this.camera.position.z += (camZ - this.camera.position.z) * smoothness;

            // Apply shake
            if (this.shake > 0.01) {
                this.camera.position.x += (Math.random() - 0.5) * this.shake * 0.5;
                this.camera.position.y += (Math.random() - 0.5) * this.shake * 0.3;
            }

            this.camera.lookAt(
                this.player.position.x,
                this.player.position.y + 1,
                this.player.position.z
            );
        }
    }
}

window.CameraController = CameraController;
export { CameraController };
