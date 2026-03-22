/**
 * AI Academy - Scene Manager
 * Manages Three.js scene, renderer, and lighting
 */

class SceneManager {
    constructor() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB);
        this.scene.fog = new THREE.Fog(0xc8d8e8, 100, 400);

        this.camera = new THREE.PerspectiveCamera(
            70,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );

        this.renderer = new THREE.WebGLRenderer({
            canvas: document.createElement('canvas'),
            antialias: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;

        document.getElementById('game-container').appendChild(this.renderer.domElement);

        this._setupLighting();
    }

    _setupLighting() {
        this.ambientLight = new THREE.AmbientLight(0x6688aa, 0.4);
        this.scene.add(this.ambientLight);

        this.sunLight = new THREE.DirectionalLight(0xffeedd, 1.0);
        this.sunLight.position.set(100, 100, 50);
        this.sunLight.castShadow = true;
        this.sunLight.shadow.mapSize.width = 2048;
        this.sunLight.shadow.mapSize.height = 2048;
        this.scene.add(this.sunLight);

        const hemiLight = new THREE.HemisphereLight(0x87CEEB, 0x444444, 0.3);
        this.scene.add(hemiLight);
    }

    add(object) {
        this.scene.add(object);
    }

    remove(object) {
        this.scene.remove(object);
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }

    resize(width, height) {
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    setBackground(color) {
        this.scene.background.setHex(color);
    }

    setFogColor(color) {
        this.scene.fog.color.setHex(color);
    }

    setSunIntensity(intensity) {
        this.sunLight.intensity = intensity;
    }

    setAmbientIntensity(intensity) {
        this.ambientLight.intensity = intensity;
    }

    setSunPosition(x, y, z) {
        this.sunLight.position.set(x, y, z);
    }
}

window.SceneManager = SceneManager;
export { SceneManager };
