/**
 * AI Academy - Input Manager
 * Handles keyboard, mouse, and pointer lock
 */

class InputManager {
    constructor(renderer) {
        this.renderer = renderer;
        this.keys = {};
        this.mouseLocked = false;
        this.callbacks = {};
        this.cameraVelocityX = 0;
        this.cameraVelocityY = 0;
        this.mouseMovement = { x: 0, y: 0 };
        this.scrollDelta = 0;

        this._setupKeyboard();
        this._setupMouse();
        this._setupResize();
    }

    on(event, callback) {
        if (!this.callbacks[event]) this.callbacks[event] = [];
        this.callbacks[event].push(callback);
    }

    emit(event, data) {
        if (this.callbacks[event]) {
            this.callbacks[event].forEach(cb => cb(data));
        }
    }

    isDown(code) {
        return !!this.keys[code];
    }

    isSprinting() {
        return this.isDown('ShiftLeft') || this.isDown('ShiftRight');
    }

    _setupKeyboard() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            this.emit('keydown', e);
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
            this.emit('keyup', e);
        });
    }

    _setupMouse() {
        document.addEventListener('click', (e) => {
            if (e.button === 0) {
                this.emit('leftclick', e);
            }
        });

        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.emit('rightclick', e);
        });

        document.addEventListener('mousedown', (e) => {
            if (e.button === 2) {
                this.emit('rightclick', e);
            }
        });

        document.addEventListener('pointerlockchange', () => {
            this.mouseLocked = document.pointerLockElement === this.renderer.domElement;
            this.emit('pointerlockchange', { locked: this.mouseLocked });
        });

        document.addEventListener('mousemove', (e) => {
            if (this.mouseLocked) {
                this.mouseMovement.x = e.movementX;
                this.mouseMovement.y = e.movementY;
                this.emit('mousemove', { x: e.movementX, y: e.movementY });
            }
        });

        window.addEventListener('wheel', (e) => {
            this.scrollDelta = e.deltaY;
            this.emit('wheel', { deltaY: e.deltaY });
        });
    }

    _setupResize() {
        window.addEventListener('resize', () => {
            this.emit('resize', {
                width: window.innerWidth,
                height: window.innerHeight
            });
        });
    }

    requestPointerLock() {
        this.renderer.domElement.requestPointerLock();
    }

    exitPointerLock() {
        document.exitPointerLock();
    }
}

window.InputManager = InputManager;
