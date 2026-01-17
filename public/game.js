/**
 * RUKA PORRO VOXL - AI EDITION
 * A Generative AI Narrative Adventure in Lapland
 * AETHERLINK FORGE // ATLAS PROTOCOL
 *
 * 10x Expanded World with Dynamic AI NPCs
 */

// ═══════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════

const CONFIG = {
    world: {
        size: 4000,              // 10x expansion (was 400)
        chunkSize: 64,           // Size of each chunk
        loadRadius: 3,           // Chunks to load around player
        lodDistances: [64, 192, 320]  // LOD transition distances
    },
    terrain: {
        baseHeight: 0,
        mountainCount: 25,       // Scaled for larger world
        hillCount: 40,
        lakeCount: 8
    },
    entities: {
        treeDensity: 0.003,      // Trees per unit area
        lichenDensity: 0.0005,
        birdFlocks: 20
    },
    player: {
        walkSpeed: 14,
        sprintSpeed: 26,
        jumpForce: 14
    }
};

// ═══════════════════════════════════════════════════════════════════
// PROCEDURAL NOISE GENERATOR
// ═══════════════════════════════════════════════════════════════════

class SimplexNoise {
    constructor(seed = Math.random()) {
        this.p = new Uint8Array(512);
        const perm = new Uint8Array(256);
        for (let i = 0; i < 256; i++) perm[i] = i;

        let s = seed * 65536;
        for (let i = 255; i > 0; i--) {
            s = (s * 1103515245 + 12345) & 0x7fffffff;
            const j = s % (i + 1);
            [perm[i], perm[j]] = [perm[j], perm[i]];
        }

        for (let i = 0; i < 512; i++) this.p[i] = perm[i & 255];
    }

    noise2D(x, y) {
        const F2 = 0.5 * (Math.sqrt(3) - 1);
        const G2 = (3 - Math.sqrt(3)) / 6;

        let s = (x + y) * F2;
        let i = Math.floor(x + s);
        let j = Math.floor(y + s);

        let t = (i + j) * G2;
        let X0 = i - t;
        let Y0 = j - t;
        let x0 = x - X0;
        let y0 = y - Y0;

        let i1, j1;
        if (x0 > y0) { i1 = 1; j1 = 0; }
        else { i1 = 0; j1 = 1; }

        let x1 = x0 - i1 + G2;
        let y1 = y0 - j1 + G2;
        let x2 = x0 - 1 + 2 * G2;
        let y2 = y0 - 1 + 2 * G2;

        i &= 255;
        j &= 255;

        const grad = (hash, x, y) => {
            const h = hash & 7;
            const u = h < 4 ? x : y;
            const v = h < 4 ? y : x;
            return ((h & 1) ? -u : u) + ((h & 2) ? -2 * v : 2 * v);
        };

        let n0 = 0, n1 = 0, n2 = 0;

        let t0 = 0.5 - x0 * x0 - y0 * y0;
        if (t0 >= 0) {
            t0 *= t0;
            n0 = t0 * t0 * grad(this.p[i + this.p[j]], x0, y0);
        }

        let t1 = 0.5 - x1 * x1 - y1 * y1;
        if (t1 >= 0) {
            t1 *= t1;
            n1 = t1 * t1 * grad(this.p[i + i1 + this.p[j + j1]], x1, y1);
        }

        let t2 = 0.5 - x2 * x2 - y2 * y2;
        if (t2 >= 0) {
            t2 *= t2;
            n2 = t2 * t2 * grad(this.p[i + 1 + this.p[j + 1]], x2, y2);
        }

        return 70 * (n0 + n1 + n2);
    }

    octaveNoise(x, y, octaves = 4, persistence = 0.5, lacunarity = 2, scale = 0.01) {
        let total = 0;
        let frequency = scale;
        let amplitude = 1;
        let maxValue = 0;

        for (let i = 0; i < octaves; i++) {
            total += this.noise2D(x * frequency, y * frequency) * amplitude;
            maxValue += amplitude;
            amplitude *= persistence;
            frequency *= lacunarity;
        }

        return total / maxValue;
    }
}

// ═══════════════════════════════════════════════════════════════════
// CHUNK MANAGER
// ═══════════════════════════════════════════════════════════════════

class ChunkManager {
    constructor(scene, noise) {
        this.scene = scene;
        this.noise = noise;
        this.chunks = new Map();
        this.chunkSize = CONFIG.world.chunkSize;
        this.loadRadius = CONFIG.world.loadRadius;

        this.generateWorldFeatures();
    }

    generateWorldFeatures() {
        const worldSize = CONFIG.world.size;
        const half = worldSize / 2;

        this.mountains = [];
        for (let i = 0; i < CONFIG.terrain.mountainCount; i++) {
            const angle = (i / CONFIG.terrain.mountainCount) * Math.PI * 2;
            const distance = half * (0.4 + Math.random() * 0.5);
            this.mountains.push({
                x: Math.cos(angle) * distance + (Math.random() - 0.5) * 400,
                z: Math.sin(angle) * distance + (Math.random() - 0.5) * 400,
                radius: 80 + Math.random() * 120,
                height: 30 + Math.random() * 50
            });
        }

        this.hills = [];
        for (let i = 0; i < CONFIG.terrain.hillCount; i++) {
            this.hills.push({
                x: (Math.random() - 0.5) * worldSize * 0.8,
                z: (Math.random() - 0.5) * worldSize * 0.8,
                radius: 30 + Math.random() * 50,
                height: 8 + Math.random() * 15
            });
        }

        this.lakes = [];
        for (let i = 0; i < CONFIG.terrain.lakeCount; i++) {
            this.lakes.push({
                x: (Math.random() - 0.5) * worldSize * 0.6,
                z: (Math.random() - 0.5) * worldSize * 0.6,
                radius: 40 + Math.random() * 80
            });
        }

        this.npcZones = {
            sieni: { x: 50, z: 50, radius: 30 },
            sammal: { x: -40, z: 80, radius: 25 },
            yuki: { x: 200, z: -150, radius: 40 },
            taisto: { x: -180, z: -200, radius: 35 },
            karen: { x: 0, z: 150, radius: 30 },
            susi: { x: 500, z: 0, radius: 100 },
            metsastaja: { x: -400, z: 400, radius: 80 },
            karhu: { x: 0, z: -800, radius: 150 },
            koulu: { x: -300, z: 0, radius: 50 }
        };
    }

    getChunkKey(cx, cz) {
        return `${cx},${cz}`;
    }

    worldToChunk(x, z) {
        return {
            cx: Math.floor(x / this.chunkSize),
            cz: Math.floor(z / this.chunkSize)
        };
    }

    getHeightAt(x, z) {
        let height = 0;

        height += this.noise.octaveNoise(x, z, 4, 0.5, 2, 0.008) * 8;
        height += this.noise.octaveNoise(x, z, 2, 0.5, 2, 0.002) * 3;

        for (const mt of this.mountains) {
            const dist = Math.sqrt((x - mt.x) ** 2 + (z - mt.z) ** 2);
            if (dist < mt.radius) {
                const factor = 1 - (dist / mt.radius);
                height += mt.height * factor * factor;
            }
        }

        for (const hill of this.hills) {
            const dist = Math.sqrt((x - hill.x) ** 2 + (z - hill.z) ** 2);
            if (dist < hill.radius) {
                const factor = 1 - (dist / hill.radius);
                height += hill.height * Math.cos(factor * Math.PI * 0.5);
            }
        }

        for (const lake of this.lakes) {
            const dist = Math.sqrt((x - lake.x) ** 2 + (z - lake.z) ** 2);
            if (dist < lake.radius) {
                const factor = 1 - (dist / lake.radius);
                height = Math.min(height, -1 + factor * 0.5);
            }
        }

        return Math.max(0, height);
    }

    getBiomeAt(x, z) {
        for (const lake of this.lakes) {
            const dist = Math.sqrt((x - lake.x) ** 2 + (z - lake.z) ** 2);
            if (dist < lake.radius * 0.9) return 'ice';
        }

        const height = this.getHeightAt(x, z);
        if (height > 40) return 'mountain';
        if (height > 20) return 'rocky';
        if (height < 2) return 'snow_flat';
        return 'forest';
    }

    createChunk(cx, cz) {
        const key = this.getChunkKey(cx, cz);
        if (this.chunks.has(key)) return this.chunks.get(key);

        const chunk = new THREE.Group();
        chunk.userData = { cx, cz, trees: [], lichen: [] };

        const offsetX = cx * this.chunkSize;
        const offsetZ = cz * this.chunkSize;

        const segments = 8;
        const geometry = new THREE.PlaneGeometry(
            this.chunkSize, this.chunkSize, segments, segments
        );
        geometry.rotateX(-Math.PI / 2);

        const positions = geometry.attributes.position.array;
        const colors = new Float32Array(positions.length);

        for (let i = 0; i < positions.length; i += 3) {
            const localX = positions[i];
            const localZ = positions[i + 2];
            const worldX = offsetX + localX + this.chunkSize / 2;
            const worldZ = offsetZ + localZ + this.chunkSize / 2;

            const height = this.getHeightAt(worldX, worldZ);
            positions[i + 1] = height;

            const biome = this.getBiomeAt(worldX, worldZ);
            let r, g, b;

            switch (biome) {
                case 'ice': r = 0.7; g = 0.85; b = 0.95; break;
                case 'mountain': r = 0.5; g = 0.5; b = 0.55; break;
                case 'rocky': r = 0.6; g = 0.6; b = 0.6; break;
                case 'snow_flat': r = 0.95; g = 0.97; b = 1.0; break;
                default: r = 0.9; g = 0.93; b = 0.96;
            }

            const variation = this.noise.noise2D(worldX * 0.1, worldZ * 0.1) * 0.05;
            colors[i] = Math.min(1, r + variation);
            colors[i + 1] = Math.min(1, g + variation);
            colors[i + 2] = Math.min(1, b + variation);
        }

        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.computeVertexNormals();

        const material = new THREE.MeshLambertMaterial({
            vertexColors: true,
            flatShading: true
        });

        const terrain = new THREE.Mesh(geometry, material);
        terrain.position.set(offsetX + this.chunkSize / 2, 0, offsetZ + this.chunkSize / 2);
        terrain.receiveShadow = true;
        chunk.add(terrain);

        this.populateChunkTrees(chunk, offsetX, offsetZ);
        this.populateChunkLichen(chunk, offsetX, offsetZ);

        chunk.position.set(0, 0, 0);
        this.chunks.set(key, chunk);
        this.scene.add(chunk);

        return chunk;
    }

    populateChunkTrees(chunk, offsetX, offsetZ) {
        const treesPerChunk = Math.floor(this.chunkSize * this.chunkSize * CONFIG.entities.treeDensity);

        for (let i = 0; i < treesPerChunk; i++) {
            const localX = Math.random() * this.chunkSize;
            const localZ = Math.random() * this.chunkSize;
            const worldX = offsetX + localX;
            const worldZ = offsetZ + localZ;

            const biome = this.getBiomeAt(worldX, worldZ);
            if (biome === 'ice' || biome === 'mountain') continue;

            const height = this.getHeightAt(worldX, worldZ);
            const treeHeight = 4 + Math.random() * 6;

            const tree = this.createTree(treeHeight);
            tree.position.set(worldX, height, worldZ);
            chunk.add(tree);
            chunk.userData.trees.push(tree);
        }
    }

    createTree(height) {
        const tree = new THREE.Group();

        const trunkGeom = new THREE.CylinderGeometry(0.2, 0.35, height * 0.4, 5);
        const trunkMat = new THREE.MeshLambertMaterial({ color: 0x4a3728 });
        const trunk = new THREE.Mesh(trunkGeom, trunkMat);
        trunk.position.y = height * 0.2;
        tree.add(trunk);

        const foliageMat = new THREE.MeshLambertMaterial({ color: 0x1a4a1a });
        const layers = 3 + Math.floor(Math.random() * 2);

        for (let i = 0; i < layers; i++) {
            const layerHeight = height * 0.3 + (i / layers) * height * 0.6;
            const radius = (1 - i / layers) * height * 0.25 + 0.5;
            const coneHeight = height * 0.25;

            const foliageGeom = new THREE.ConeGeometry(radius, coneHeight, 6);
            const foliage = new THREE.Mesh(foliageGeom, foliageMat);
            foliage.position.y = layerHeight;
            tree.add(foliage);
        }

        const snowGeom = new THREE.ConeGeometry(height * 0.15, height * 0.1, 6);
        const snowMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
        const snow = new THREE.Mesh(snowGeom, snowMat);
        snow.position.y = height * 0.95;
        tree.add(snow);

        return tree;
    }

    populateChunkLichen(chunk, offsetX, offsetZ) {
        const lichenPerChunk = Math.floor(this.chunkSize * this.chunkSize * CONFIG.entities.lichenDensity);

        for (let i = 0; i < lichenPerChunk; i++) {
            const localX = Math.random() * this.chunkSize;
            const localZ = Math.random() * this.chunkSize;
            const worldX = offsetX + localX;
            const worldZ = offsetZ + localZ;

            const biome = this.getBiomeAt(worldX, worldZ);
            if (biome === 'ice' || biome === 'mountain') continue;

            const height = this.getHeightAt(worldX, worldZ);

            const lichen = this.createLichen();
            lichen.position.set(worldX, height + 0.1, worldZ);
            chunk.add(lichen);
            chunk.userData.lichen.push(lichen);
        }
    }

    createLichen() {
        const lichen = new THREE.Group();
        lichen.userData.isLichen = true;
        lichen.userData.collected = false;

        const patches = 3 + Math.floor(Math.random() * 3);
        const mat = new THREE.MeshLambertMaterial({
            color: 0x7cb342,
            emissive: 0x2e7d32,
            emissiveIntensity: 0.3
        });

        for (let i = 0; i < patches; i++) {
            const size = 0.15 + Math.random() * 0.2;
            const geom = new THREE.SphereGeometry(size, 5, 4);
            geom.scale(1, 0.3, 1);
            const patch = new THREE.Mesh(geom, mat);
            patch.position.set(
                (Math.random() - 0.5) * 0.6,
                0,
                (Math.random() - 0.5) * 0.6
            );
            lichen.add(patch);
        }

        return lichen;
    }

    update(playerX, playerZ) {
        const { cx: playerCX, cz: playerCZ } = this.worldToChunk(playerX, playerZ);

        for (let dx = -this.loadRadius; dx <= this.loadRadius; dx++) {
            for (let dz = -this.loadRadius; dz <= this.loadRadius; dz++) {
                const cx = playerCX + dx;
                const cz = playerCZ + dz;
                const key = this.getChunkKey(cx, cz);

                if (!this.chunks.has(key)) {
                    this.createChunk(cx, cz);
                }
            }
        }

        const unloadDistance = this.loadRadius + 2;
        for (const [key, chunk] of this.chunks) {
            const [cx, cz] = key.split(',').map(Number);
            const dx = Math.abs(cx - playerCX);
            const dz = Math.abs(cz - playerCZ);

            if (dx > unloadDistance || dz > unloadDistance) {
                this.scene.remove(chunk);
                chunk.traverse(obj => {
                    if (obj.geometry) obj.geometry.dispose();
                    if (obj.material) obj.material.dispose();
                });
                this.chunks.delete(key);
            }
        }
    }

    getNearbyLichen(x, z, radius = 3) {
        const nearby = [];
        for (const chunk of this.chunks.values()) {
            for (const lichen of chunk.userData.lichen) {
                if (lichen.userData.collected) continue;
                const dx = lichen.position.x - x;
                const dz = lichen.position.z - z;
                if (Math.sqrt(dx * dx + dz * dz) < radius) {
                    nearby.push(lichen);
                }
            }
        }
        return nearby;
    }
}

// ═══════════════════════════════════════════════════════════════════
// MAIN GAME CLASS
// ═══════════════════════════════════════════════════════════════════

class PoroGame {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.clock = new THREE.Clock();
        this.noise = new SimplexNoise(12345);

        this.chunkManager = null;
        this.aiDialogue = null;
        this.voiceInput = null;

        this.player = {
            position: new THREE.Vector3(0, 10, 0),
            velocity: new THREE.Vector3(0, 0, 0),
            rotation: { x: 0, y: 0 },
            onGround: false
        };

        // Camera System
        this.cameraMode = 'orbit'; // 'orbit', 'firstPerson', 'cinematic'
        this.cameraDistance = 15;
        this.cameraHeight = 4;
        this.cameraAngleX = 0.5; // Vertical angle (0.2-1.4 range, 0.5 = nice angle)
        this.cameraAngleY = 0; // Horizontal orbit angle
        this.targetCameraDistance = 15;
        this.targetCameraAngleX = 0.5;
        this.targetCameraAngleY = 0;
        this.cameraSmoothness = 0.1;
        this.cameraShake = 0;

        // Audio System
        this.audioContext = null;
        this.audioSources = {};
        this.audioInitialized = false;

        this.stats = {
            health: 100,
            energy: 100,
            warmth: 100,
            hunger: 100
        };

        this.lichenCollected = 0;
        this.dayTime = 0.3;
        this.isNight = false;
        this.auroraActive = false;

        this.npcs = [];
        this.nearbyNPC = null;

        this.inDialogue = false;
        this.dialogueText = '';
        this.isListening = false;
        this.isProcessingDialogue = false;

        this.keys = {};
        this.mouseLocked = false;

        this.objectives = {
            explore: false,
            lichen: false,
            survive: false,
            aurora: false
        };

        this.worldSize = CONFIG.world.size;

        this.init();
    }

    init() {
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

        this.setupLighting();

        this.chunkManager = new ChunkManager(this.scene, this.noise);
        this.chunkManager.update(0, 0);

        this.createReindeer();
        this.createNPCs();
        this.createSnowParticles();
        this.createAurora();
        this.createBirds();

        this.initializeAI();
        this.initializeAudio();

        this.setupEventListeners();

        setTimeout(() => {
            document.getElementById('loading').style.opacity = '0';
            setTimeout(() => {
                document.getElementById('loading').style.display = 'none';
            }, 500);
        }, 2000);

        this.animate();
    }

    setupLighting() {
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

    createReindeer() {
        this.reindeer = new THREE.Group();
        this.legs = [];
        this.legPhase = 0;

        // Body
        const bodyGeom = new THREE.CapsuleGeometry(0.5, 1.2, 4, 8);
        const bodyMat = new THREE.MeshLambertMaterial({ color: 0x8B7355 });
        const body = new THREE.Mesh(bodyGeom, bodyMat);
        body.rotation.z = Math.PI / 2;
        body.position.y = 0.8;
        this.reindeer.add(body);

        // Head
        const headGeom = new THREE.SphereGeometry(0.35, 8, 6);
        this.head = new THREE.Mesh(headGeom, bodyMat);
        this.head.position.set(0.9, 1.1, 0);
        this.reindeer.add(this.head);

        // EYES - Big cute eyes!
        const eyeWhiteGeom = new THREE.SphereGeometry(0.12, 8, 8);
        const eyeWhiteMat = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
        const eyePupilGeom = new THREE.SphereGeometry(0.07, 8, 8);
        const eyePupilMat = new THREE.MeshLambertMaterial({ color: 0x1a1a1a });
        const eyeShineGeom = new THREE.SphereGeometry(0.025, 6, 6);
        const eyeShineMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });

        // Left eye
        const leftEye = new THREE.Group();
        const leftWhite = new THREE.Mesh(eyeWhiteGeom, eyeWhiteMat);
        const leftPupil = new THREE.Mesh(eyePupilGeom, eyePupilMat);
        leftPupil.position.x = 0.05;
        const leftShine = new THREE.Mesh(eyeShineGeom, eyeShineMat);
        leftShine.position.set(0.08, 0.03, 0.03);
        leftEye.add(leftWhite, leftPupil, leftShine);
        leftEye.position.set(1.15, 1.2, 0.15);
        this.reindeer.add(leftEye);

        // Right eye
        const rightEye = new THREE.Group();
        const rightWhite = new THREE.Mesh(eyeWhiteGeom, eyeWhiteMat);
        const rightPupil = new THREE.Mesh(eyePupilGeom, eyePupilMat);
        rightPupil.position.x = 0.05;
        const rightShine = new THREE.Mesh(eyeShineGeom, eyeShineMat);
        rightShine.position.set(0.08, 0.03, -0.03);
        rightEye.add(rightWhite, rightPupil, rightShine);
        rightEye.position.set(1.15, 1.2, -0.15);
        this.reindeer.add(rightEye);

        // Store eye position for first-person camera
        this.eyePosition = new THREE.Vector3(1.15, 1.25, 0);

        // Nose
        const noseGeom = new THREE.SphereGeometry(0.08, 6, 6);
        const noseMat = new THREE.MeshLambertMaterial({ color: 0x2a2a2a });
        const nose = new THREE.Mesh(noseGeom, noseMat);
        nose.position.set(1.25, 1.05, 0);
        this.reindeer.add(nose);

        // Antlers
        const antlerMat = new THREE.MeshLambertMaterial({ color: 0x5C4033 });
        [-0.25, 0.25].forEach(z => {
            const antlerGroup = new THREE.Group();
            const mainBeam = new THREE.CylinderGeometry(0.04, 0.06, 0.8, 5);
            const main = new THREE.Mesh(mainBeam, antlerMat);
            main.position.y = 0.4;
            main.rotation.z = z > 0 ? 0.3 : -0.3;
            antlerGroup.add(main);

            // Add branches to antlers
            const branchGeom = new THREE.CylinderGeometry(0.02, 0.03, 0.3, 4);
            const branch1 = new THREE.Mesh(branchGeom, antlerMat);
            branch1.position.set(0, 0.5, z > 0 ? 0.1 : -0.1);
            branch1.rotation.z = z > 0 ? -0.5 : 0.5;
            antlerGroup.add(branch1);

            antlerGroup.position.set(0.8, 1.4, z);
            this.reindeer.add(antlerGroup);
        });

        // ANIMATED LEGS - stored for animation
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

            // Upper leg
            const upperLeg = new THREE.Mesh(legGeom, legMat);
            upperLeg.position.y = -0.2;
            legGroup.add(upperLeg);

            // Hoof
            const hoof = new THREE.Mesh(hoofGeom, hoofMat);
            hoof.position.y = -0.65;
            legGroup.add(hoof);

            legGroup.position.set(pos.x, 0.8, pos.z);
            legGroup.userData = {
                name: pos.name,
                baseY: 0.8,
                phase: index % 2 === 0 ? 0 : Math.PI // Alternate legs
            };

            this.reindeer.add(legGroup);
            this.legs.push(legGroup);
        });

        // Belly
        const bellyGeom = new THREE.SphereGeometry(0.4, 8, 6);
        const bellyMat = new THREE.MeshLambertMaterial({ color: 0xDDD5C8 });
        const belly = new THREE.Mesh(bellyGeom, bellyMat);
        belly.position.set(0, 0.6, 0);
        belly.scale.set(1.5, 0.5, 0.8);
        this.reindeer.add(belly);

        // Tail
        const tailGeom = new THREE.SphereGeometry(0.15, 6, 6);
        const tailMat = new THREE.MeshLambertMaterial({ color: 0xDDD5C8 });
        const tail = new THREE.Mesh(tailGeom, tailMat);
        tail.position.set(-0.9, 0.9, 0);
        tail.scale.set(1, 0.7, 0.7);
        this.reindeer.add(tail);

        this.scene.add(this.reindeer);
    }

    animateLegs(delta, isMoving, speed) {
        if (!this.legs || this.legs.length === 0) return;

        if (isMoving) {
            this.legPhase += delta * speed * 0.8;

            this.legs.forEach((leg, index) => {
                const phase = this.legPhase + leg.userData.phase;

                // Leg swing (rotation)
                leg.rotation.x = Math.sin(phase) * 0.4;

                // Leg lift (position)
                const lift = Math.max(0, Math.sin(phase)) * 0.1;
                leg.position.y = leg.userData.baseY + lift;
            });
        } else {
            // Return to neutral position smoothly
            this.legs.forEach(leg => {
                leg.rotation.x *= 0.9;
                leg.position.y += (leg.userData.baseY - leg.position.y) * 0.1;
            });
        }
    }

    createNPCs() {
        const zones = this.chunkManager.npcZones;

        // Sieni - Mushrooms
        this.createNPC('sieni', zones.sieni, () => {
            const group = new THREE.Group();
            const caps = [
                { x: 0, z: 0, h: 1.2, r: 0.5 },
                { x: 0.4, z: 0.3, h: 0.8, r: 0.35 },
                { x: -0.3, z: 0.4, h: 0.9, r: 0.4 }
            ];
            caps.forEach(cap => {
                const stemGeom = new THREE.CylinderGeometry(0.1, 0.15, cap.h * 0.6, 8);
                const stemMat = new THREE.MeshLambertMaterial({ color: 0xF5F5DC });
                const stem = new THREE.Mesh(stemGeom, stemMat);
                stem.position.set(cap.x, cap.h * 0.3, cap.z);
                group.add(stem);

                const capGeom = new THREE.SphereGeometry(cap.r, 8, 6);
                const capMat = new THREE.MeshLambertMaterial({
                    color: 0xCD5C5C,
                    emissive: 0x330000,
                    emissiveIntensity: 0.2
                });
                const capMesh = new THREE.Mesh(capGeom, capMat);
                capMesh.position.set(cap.x, cap.h * 0.6 + cap.r * 0.5, cap.z);
                capMesh.scale.y = 0.5;
                group.add(capMesh);
            });
            return group;
        });

        // Sammal - Moss
        this.createNPC('sammal', zones.sammal, () => {
            const group = new THREE.Group();
            const mossMat = new THREE.MeshLambertMaterial({
                color: 0x228B22,
                emissive: 0x004400,
                emissiveIntensity: 0.3
            });
            const moundGeom = new THREE.SphereGeometry(1, 12, 8);
            const mound = new THREE.Mesh(moundGeom, mossMat);
            mound.scale.set(1.5, 0.5, 1.5);
            mound.position.y = 0.25;
            group.add(mound);
            return group;
        });

        // Yuki - White Akita
        this.createNPC('yuki', zones.yuki, () => {
            const group = new THREE.Group();
            const furMat = new THREE.MeshLambertMaterial({ color: 0xFFFFF0 });
            const bodyGeom = new THREE.CapsuleGeometry(0.4, 0.8, 4, 8);
            const body = new THREE.Mesh(bodyGeom, furMat);
            body.rotation.z = Math.PI / 2;
            body.position.y = 0.6;
            group.add(body);
            const headGeom = new THREE.SphereGeometry(0.35, 8, 6);
            const head = new THREE.Mesh(headGeom, furMat);
            head.position.set(0.6, 0.9, 0);
            group.add(head);
            return group;
        });

        // Taisto - Amstaff
        this.createNPC('taisto', zones.taisto, () => {
            const group = new THREE.Group();
            const furMat = new THREE.MeshLambertMaterial({ color: 0x4A4A4A });
            const bodyGeom = new THREE.CapsuleGeometry(0.5, 0.7, 4, 8);
            const body = new THREE.Mesh(bodyGeom, furMat);
            body.rotation.z = Math.PI / 2;
            body.position.y = 0.5;
            group.add(body);
            return group;
        });

        // Karen - Crow
        this.createNPC('karen', zones.karen, () => {
            const group = new THREE.Group();
            const featherMat = new THREE.MeshLambertMaterial({ color: 0x1a1a1a });
            const bodyGeom = new THREE.SphereGeometry(0.3, 8, 6);
            const body = new THREE.Mesh(bodyGeom, featherMat);
            body.scale.set(1, 1, 1.3);
            body.position.y = 0.5;
            group.add(body);
            return group;
        });

        // Susi - Wolf
        this.createNPC('susi', zones.susi, () => {
            const group = new THREE.Group();
            const furMat = new THREE.MeshLambertMaterial({ color: 0x4a4a4a });
            const bodyGeom = new THREE.CapsuleGeometry(0.45, 1.0, 4, 8);
            const body = new THREE.Mesh(bodyGeom, furMat);
            body.rotation.z = Math.PI / 2;
            body.position.y = 0.7;
            group.add(body);

            const eyeGeom = new THREE.SphereGeometry(0.05, 6, 6);
            const eyeMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
            [-0.12, 0.12].forEach(z => {
                const eye = new THREE.Mesh(eyeGeom, eyeMat);
                eye.position.set(0.95, 0.98, z);
                group.add(eye);
            });
            return group;
        });

        // Metsästäjä - Hunter
        this.createNPC('metsastaja', zones.metsastaja, () => {
            const group = new THREE.Group();
            const coatMat = new THREE.MeshLambertMaterial({ color: 0x2F4F2F });
            const coatGeom = new THREE.CylinderGeometry(0.3, 0.4, 1.2, 8);
            const coat = new THREE.Mesh(coatGeom, coatMat);
            coat.position.y = 0.8;
            group.add(coat);

            const headGeom = new THREE.SphereGeometry(0.25, 8, 6);
            const headMat = new THREE.MeshLambertMaterial({ color: 0xDEB887 });
            const head = new THREE.Mesh(headGeom, headMat);
            head.position.y = 1.6;
            group.add(head);
            return group;
        });

        // Karhu - Bear
        this.createNPC('karhu', zones.karhu, () => {
            const group = new THREE.Group();
            const furMat = new THREE.MeshLambertMaterial({
                color: 0x3a2a1a,
                emissive: 0x1a0505,
                emissiveIntensity: 0.2
            });

            const bodyGeom = new THREE.SphereGeometry(1.2, 12, 10);
            const body = new THREE.Mesh(bodyGeom, furMat);
            body.scale.set(1.3, 0.9, 1);
            body.position.y = 1.2;
            group.add(body);

            const headGeom = new THREE.SphereGeometry(0.6, 10, 8);
            const head = new THREE.Mesh(headGeom, furMat);
            head.position.set(1.2, 1.8, 0);
            group.add(head);

            const eyeGeom = new THREE.SphereGeometry(0.12, 8, 8);
            const eyeMat = new THREE.MeshBasicMaterial({ color: 0xff3300 });
            [-0.25, 0.25].forEach(z => {
                const eye = new THREE.Mesh(eyeGeom, eyeMat);
                eye.position.set(1.5, 2.0, z);
                group.add(eye);
            });
            return group;
        });

        // Koulu - School
        this.createNPC('koulu', zones.koulu, () => {
            const group = new THREE.Group();
            const buildingMat = new THREE.MeshLambertMaterial({ color: 0x228B22 });
            const buildingGeom = new THREE.BoxGeometry(8, 4, 6);
            const building = new THREE.Mesh(buildingGeom, buildingMat);
            building.position.y = 2;
            group.add(building);

            const roofMat = new THREE.MeshLambertMaterial({ color: 0x8B0000 });
            const roofGeom = new THREE.ConeGeometry(5, 2, 4);
            const roof = new THREE.Mesh(roofGeom, roofMat);
            roof.position.y = 5;
            roof.rotation.y = Math.PI / 4;
            group.add(roof);

            const windowMat = new THREE.MeshBasicMaterial({ color: 0xFFD700 });
            const windowGeom = new THREE.PlaneGeometry(0.8, 1.2);
            [[-3, 2, 3.01], [-1, 2, 3.01], [1, 2, 3.01], [3, 2, 3.01]].forEach(pos => {
                const win = new THREE.Mesh(windowGeom, windowMat);
                win.position.set(...pos);
                group.add(win);
            });
            return group;
        });
    }

    createNPC(name, zone, modelCreator) {
        const model = modelCreator();
        model.name = name;
        model.userData = { type: 'npc', npcName: name, zone: zone };

        const height = this.chunkManager.getHeightAt(zone.x, zone.z);
        model.position.set(zone.x, height, zone.z);

        this.scene.add(model);
        this.npcs.push(model);
    }

    createSnowParticles() {
        const count = 3000;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        this.snowVelocities = [];

        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 300;
            positions[i * 3 + 1] = Math.random() * 80;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 300;
            this.snowVelocities.push({ y: 0.3 + Math.random() * 0.4, x: (Math.random() - 0.5) * 0.1 });
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.snow = new THREE.Points(geometry, new THREE.PointsMaterial({
            color: 0xffffff, size: 0.2, transparent: true, opacity: 0.8
        }));
        this.scene.add(this.snow);
    }

    createAurora() {
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

    createBirds() {
        this.birdFlocks = [];

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

            this.birdFlocks.push({ birds, center, speed, direction });
        }
    }

    initializeAI() {
        if (window.OmniDialogue) {
            this.aiDialogue = new window.OmniDialogue();
            console.log('AI Dialogue system initialized');
        }

        if (window.VoiceInput) {
            this.voiceInput = new window.VoiceInput();
            this.voiceInput.onResult = (text) => this.handleVoiceInput(text);
            console.log('Voice input system initialized');
        }
    }

    initializeAudio() {
        // Create audio context on first user interaction
        const initAudioContext = () => {
            if (this.audioInitialized) return;

            try {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

                // Create ambient sound nodes
                this.createAmbientSounds();
                this.audioInitialized = true;
                console.log('Audio system initialized');

                // Remove listeners after init
                document.removeEventListener('click', initAudioContext);
                document.removeEventListener('keydown', initAudioContext);
            } catch (e) {
                console.warn('Audio not supported:', e);
            }
        };

        document.addEventListener('click', initAudioContext);
        document.addEventListener('keydown', initAudioContext);
    }

    createAmbientSounds() {
        if (!this.audioContext) return;

        // Wind sound - procedural white noise with filtering
        const windGain = this.audioContext.createGain();
        windGain.gain.value = 0.15;
        windGain.connect(this.audioContext.destination);

        const windFilter = this.audioContext.createBiquadFilter();
        windFilter.type = 'lowpass';
        windFilter.frequency.value = 400;
        windFilter.connect(windGain);

        // Create wind noise
        const bufferSize = 2 * this.audioContext.sampleRate;
        const noiseBuffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }

        const windNoise = this.audioContext.createBufferSource();
        windNoise.buffer = noiseBuffer;
        windNoise.loop = true;
        windNoise.connect(windFilter);
        windNoise.start();

        this.audioSources.wind = { source: windNoise, gain: windGain, filter: windFilter };

        // Bird chirps - periodic oscillator bursts
        this.scheduleBirdSounds();

        // Water sound (near lakes) - filtered noise
        const waterGain = this.audioContext.createGain();
        waterGain.gain.value = 0;
        waterGain.connect(this.audioContext.destination);

        const waterFilter = this.audioContext.createBiquadFilter();
        waterFilter.type = 'bandpass';
        waterFilter.frequency.value = 800;
        waterFilter.Q.value = 0.5;
        waterFilter.connect(waterGain);

        const waterNoise = this.audioContext.createBufferSource();
        waterNoise.buffer = noiseBuffer;
        waterNoise.loop = true;
        waterNoise.connect(waterFilter);
        waterNoise.start();

        this.audioSources.water = { source: waterNoise, gain: waterGain };

        console.log('Ambient sounds created');
    }

    scheduleBirdSounds() {
        if (!this.audioContext || !this.audioInitialized) return;

        const playBirdChirp = () => {
            if (!this.audioContext || this.audioContext.state === 'closed') return;

            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(800 + Math.random() * 1200, this.audioContext.currentTime);
            osc.frequency.exponentialRampToValueAtTime(
                400 + Math.random() * 800,
                this.audioContext.currentTime + 0.1
            );

            gain.gain.setValueAtTime(0, this.audioContext.currentTime);
            gain.gain.linearRampToValueAtTime(0.05, this.audioContext.currentTime + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.15);

            osc.connect(gain);
            gain.connect(this.audioContext.destination);

            osc.start();
            osc.stop(this.audioContext.currentTime + 0.15);

            // Schedule next chirp
            const nextDelay = 2000 + Math.random() * 8000;
            setTimeout(playBirdChirp, nextDelay);
        };

        // Start bird sounds with random delay
        setTimeout(playBirdChirp, 1000 + Math.random() * 3000);
    }

    updateAudio() {
        if (!this.audioInitialized || !this.audioSources.wind) return;

        // Adjust wind based on height and speed
        const playerSpeed = Math.sqrt(
            this.player.velocity.x ** 2 + this.player.velocity.z ** 2
        );
        const heightFactor = Math.min(1, this.player.position.y / 50);
        const windVolume = 0.1 + heightFactor * 0.15 + playerSpeed * 0.01;
        this.audioSources.wind.gain.gain.setTargetAtTime(
            Math.min(0.4, windVolume),
            this.audioContext.currentTime,
            0.3
        );

        // Wind filter based on sprint
        const isSprinting = this.keys['ShiftLeft'] || this.keys['ShiftRight'];
        this.audioSources.wind.filter.frequency.setTargetAtTime(
            isSprinting ? 600 : 350,
            this.audioContext.currentTime,
            0.2
        );

        // Water sound near lakes
        if (this.audioSources.water) {
            let nearWater = false;
            for (const lake of this.chunkManager.lakes) {
                const dist = Math.sqrt(
                    (this.player.position.x - lake.x) ** 2 +
                    (this.player.position.z - lake.z) ** 2
                );
                if (dist < lake.radius * 1.5) {
                    const waterVolume = Math.max(0, 1 - dist / (lake.radius * 1.5)) * 0.2;
                    this.audioSources.water.gain.gain.setTargetAtTime(
                        waterVolume,
                        this.audioContext.currentTime,
                        0.5
                    );
                    nearWater = true;
                    break;
                }
            }
            if (!nearWater) {
                this.audioSources.water.gain.gain.setTargetAtTime(0, this.audioContext.currentTime, 0.5);
            }
        }
    }

    handleVoiceInput(text) {
        if (this.nearbyNPC && !this.isProcessingDialogue) {
            this.processDialogue(this.nearbyNPC.userData.npcName, text);
        }
    }

    async processDialogue(npcName, playerInput) {
        if (!this.aiDialogue || this.isProcessingDialogue) return;

        this.isProcessingDialogue = true;
        this.showDialogueUI(npcName, playerInput, '...');

        try {
            const response = await this.aiDialogue.generateResponse(npcName, playerInput, this.stats);
            if (response) {
                this.showDialogueUI(npcName, playerInput, response);
                this.aiDialogue.speakResponse(response, npcName);
            }
        } catch (error) {
            console.error('Dialogue error:', error);
        }

        this.isProcessingDialogue = false;
    }

    showDialogueUI(npcName, playerText, npcResponse) {
        const dialogueBox = document.getElementById('dialogue-box');
        const npcNameEl = document.getElementById('dialogue-npc-name');
        const npcResponseEl = document.getElementById('dialogue-npc-response');

        if (dialogueBox && npcNameEl && npcResponseEl) {
            npcNameEl.textContent = npcName.charAt(0).toUpperCase() + npcName.slice(1);
            npcResponseEl.textContent = npcResponse;
            dialogueBox.classList.add('show');
        }
    }

    hideDialogueUI() {
        const dialogueBox = document.getElementById('dialogue-box');
        if (dialogueBox) dialogueBox.classList.remove('show');
        if (this.aiDialogue) this.aiDialogue.stopSpeaking();
    }

    setupEventListeners() {
        // ═══════════════════════════════════════════════════════════
        // BUTTER-SMOOTH INPUT SYSTEM
        // Zero-latency keyboard + mouse synchronization
        // ═══════════════════════════════════════════════════════════

        // Smooth camera velocity for interpolation
        this.cameraVelocityX = 0;
        this.cameraVelocityY = 0;
        this.targetCameraAngleX = this.cameraAngleX;
        this.targetCameraAngleY = this.cameraAngleY;

        // Keyboard input - instant response
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;

            // Camera mode toggle with C
            if (e.code === 'KeyC' && !this.inDialogue) {
                this.toggleCameraMode();
            }

            // V key - Talk to NPC
            if (e.code === 'KeyV' && !this.inDialogue && this.nearbyNPC) {
                this.talk();
            }

            // V key in dialogue - voice input
            if (e.code === 'KeyV' && this.inDialogue && this.voiceInput) {
                if (!this.isListening) {
                    this.voiceInput.start();
                    this.isListening = true;
                    this.showMessage('Listening... speak now');
                } else {
                    this.voiceInput.stop();
                    this.isListening = false;
                }
            }

            // Escape - exit dialogue
            if (e.code === 'Escape' && this.inDialogue) {
                this.endDialogue();
            }
        });

        window.addEventListener('keyup', (e) => this.keys[e.code] = false);

        // ═══════════════════════════════════════════════════════════
        // MOUSE CONTROLS - Smooth orbit camera
        // ═══════════════════════════════════════════════════════════

        // Left click - lock pointer for camera control
        document.addEventListener('click', (e) => {
            if (e.button === 0 && !this.mouseLocked && !this.inDialogue) {
                this.renderer.domElement.requestPointerLock();
            }
        });

        // Right click - EAT action
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            if (!this.inDialogue) {
                this.eat();
            }
        });

        // Mouse down for right click detection
        document.addEventListener('mousedown', (e) => {
            if (e.button === 2 && !this.inDialogue) {
                this.eat();
            }
        });

        document.addEventListener('pointerlockchange', () => {
            this.mouseLocked = document.pointerLockElement === this.renderer.domElement;
        });

        // ═══════════════════════════════════════════════════════════
        // MOUSE CAMERA CONTROL - Direct and responsive
        // ═══════════════════════════════════════════════════════════
        document.addEventListener('mousemove', (e) => {
            if (this.mouseLocked && !this.inDialogue) {
                const sensitivity = 0.004;

                // Horizontal: move mouse right = camera rotates right (sees more of left side)
                this.cameraAngleY += e.movementX * sensitivity;

                // Vertical: move mouse up = camera looks up
                this.cameraAngleX -= e.movementY * sensitivity;

                // Clamp vertical (0.2 = almost level, 1.4 = looking down from above)
                this.cameraAngleX = Math.max(0.2, Math.min(1.4, this.cameraAngleX));

                // Sync targets for smooth system
                this.targetCameraAngleY = this.cameraAngleY;
                this.targetCameraAngleX = this.cameraAngleX;
            }
        });

        // Scroll wheel - smooth zoom
        window.addEventListener('wheel', (e) => {
            if (this.cameraMode !== 'firstPerson') {
                this.targetCameraDistance += e.deltaY * 0.015;
                this.targetCameraDistance = Math.max(4, Math.min(40, this.targetCameraDistance));
            }
        });

        // Window resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });

        // Dialogue input
        const dialogueInput = document.getElementById('dialogue-input');
        if (dialogueInput) {
            dialogueInput.addEventListener('keydown', (e) => {
                if (e.code === 'Enter' && this.nearbyNPC) {
                    const text = dialogueInput.value.trim();
                    if (text) {
                        this.processDialogue(this.nearbyNPC.userData.npcName, text);
                        dialogueInput.value = '';
                    }
                }
            });
        }
    }

    // ═══════════════════════════════════════════════════════════
    // ACTION HANDLERS
    // ═══════════════════════════════════════════════════════════

    eat() {
        const nearbyLichen = this.chunkManager.getNearbyLichen(
            this.player.position.x, this.player.position.z, 4
        );

        if (nearbyLichen.length > 0) {
            const lichen = nearbyLichen[0];
            lichen.userData.collected = true;
            lichen.visible = false;
            this.lichenCollected++;
            this.stats.hunger = Math.min(100, this.stats.hunger + 15);
            this.stats.energy = Math.min(100, this.stats.energy + 5);
            this.showMessage('Yum! Ate lichen (+15 Hunger, +5 Energy)');
            console.log('PORO is eating... Lichen collected:', this.lichenCollected);
        } else {
            this.showMessage('No lichen nearby to eat');
        }
    }

    talk() {
        if (this.nearbyNPC && !this.inDialogue) {
            console.log('PORO wants to talk to:', this.nearbyNPC.userData.npcName);
            this.startDialogue();
        } else if (!this.nearbyNPC) {
            this.showMessage('No one nearby to talk to');
        }
    }

    toggleCameraMode() {
        const modes = ['orbit', 'cinematic', 'firstPerson'];
        const currentIndex = modes.indexOf(this.cameraMode);
        this.cameraMode = modes[(currentIndex + 1) % modes.length];

        // Adjust settings per mode
        switch (this.cameraMode) {
            case 'orbit':
                this.targetCameraDistance = 12;
                this.cameraHeight = 6;
                this.reindeer.visible = true;
                this.showMessage('Camera: Orbit Mode (scroll to zoom)');
                break;
            case 'cinematic':
                this.targetCameraDistance = 20;
                this.cameraHeight = 10;
                this.reindeer.visible = true;
                this.showMessage('Camera: Cinematic Mode');
                break;
            case 'firstPerson':
                this.reindeer.visible = false;
                this.showMessage('Camera: First Person (through Poro eyes)');
                break;
        }
    }

    startDialogue() {
        if (!this.nearbyNPC) return;
        this.inDialogue = true;
        document.exitPointerLock();

        const dialogueUI = document.getElementById('dialogue-ui');
        if (dialogueUI) {
            dialogueUI.classList.add('show');
            const input = document.getElementById('dialogue-input');
            if (input) input.focus();
        }

        this.showMessage(`Press V to speak or type your message`);
    }

    endDialogue() {
        this.inDialogue = false;
        this.hideDialogueUI();

        const dialogueUI = document.getElementById('dialogue-ui');
        if (dialogueUI) dialogueUI.classList.remove('show');

        if (this.voiceInput) {
            this.voiceInput.stop();
            this.isListening = false;
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const delta = Math.min(this.clock.getDelta(), 0.1);

        this.updatePlayerMovement(delta);
        this.updateCamera(delta);
        this.updateStats(delta);
        this.updateDayNight(delta);
        this.updateWeather(delta);
        this.updateNPCs(delta);
        this.updateBirds(delta);
        this.updateAudio();
        this.updateUI();
        this.updateMinimap();
        this.checkObjectives();

        this.chunkManager.update(this.player.position.x, this.player.position.z);

        this.renderer.render(this.scene, this.camera);
    }

    updatePlayerMovement(delta) {
        if (this.inDialogue) return;

        const isSprinting = this.keys['ShiftLeft'] || this.keys['ShiftRight'];
        const moveSpeed = isSprinting ? CONFIG.player.sprintSpeed : CONFIG.player.walkSpeed;

        // Input: wat de speler wil
        let forward = 0;  // + = vooruit (weg van camera), - = achteruit
        let right = 0;    // + = rechts, - = links

        // Pijltjes en WASD
        if (this.keys['ArrowUp'] || this.keys['KeyW']) forward = 1;     // Vooruit
        if (this.keys['ArrowDown'] || this.keys['KeyS']) forward = -1;  // Achteruit
        if (this.keys['ArrowRight'] || this.keys['KeyD']) right = 1;    // Rechts
        if (this.keys['ArrowLeft'] || this.keys['KeyA']) right = -1;    // Links

        const isMoving = forward !== 0 || right !== 0;

        if (isMoving) {
            // Normalize diagonaal
            const len = Math.sqrt(forward * forward + right * right);
            forward /= len;
            right /= len;

            // Camera kijkt naar speler vanuit cameraAngleY
            // Forward richting = TEGENGESTELD aan camera positie
            // Camera staat op: sin(camY), cos(camY) relatief aan speler
            // Dus forward = -sin(camY), -cos(camY)
            const camY = this.cameraAngleY;

            // Forward vector (weg van camera)
            const forwardX = -Math.sin(camY);
            const forwardZ = -Math.cos(camY);

            // Right vector (90 graden rechts van forward)
            const rightX = Math.cos(camY);
            const rightZ = -Math.sin(camY);

            // Bereken beweging
            const dx = (forward * forwardX + right * rightX) * moveSpeed * delta;
            const dz = (forward * forwardZ + right * rightZ) * moveSpeed * delta;

            this.player.position.x += dx;
            this.player.position.z += dz;

            this.player.velocity.x = dx / delta;
            this.player.velocity.z = dz / delta;

            if (isSprinting) {
                this.stats.energy = Math.max(0, this.stats.energy - 4 * delta);
            }
        } else {
            this.player.velocity.x *= 0.9;
            this.player.velocity.z *= 0.9;
        }

        // PORO kijkt ALTIJD naar voren (weg van camera)
        if (this.cameraMode !== 'firstPerson') {
            const targetRot = this.cameraAngleY - Math.PI / 2; // 180 graden gedraaid
            let diff = targetRot - this.player.rotation.y;
            while (diff > Math.PI) diff -= Math.PI * 2;
            while (diff < -Math.PI) diff += Math.PI * 2;
            this.player.rotation.y += diff * 0.1;
        }

        this.animateLegs(delta, isMoving, moveSpeed);

        // Gravity
        const terrainHeight = this.chunkManager.getHeightAt(
            this.player.position.x, this.player.position.z
        );

        this.player.velocity.y -= 30 * delta;

        if (this.player.position.y <= terrainHeight + 1) {
            this.player.position.y = terrainHeight + 1;
            this.player.velocity.y = 0;
            this.player.onGround = true;
        } else {
            this.player.onGround = false;
        }

        this.player.position.y += this.player.velocity.y * delta;

        // Jump
        if (this.keys['Space'] && this.player.onGround) {
            this.player.velocity.y = CONFIG.player.jumpForce;
            this.player.onGround = false;
        }

        // World bounds
        const halfWorld = this.worldSize / 2;
        this.player.position.x = Math.max(-halfWorld, Math.min(halfWorld, this.player.position.x));
        this.player.position.z = Math.max(-halfWorld, Math.min(halfWorld, this.player.position.z));

        // Update reindeer
        this.reindeer.position.copy(this.player.position);
        this.reindeer.rotation.y = this.player.rotation.y + Math.PI;
    }

    updateCamera(delta) {
        // Smooth zoom
        this.cameraDistance += (this.targetCameraDistance - this.cameraDistance) * 0.1;

        if (this.cameraMode === 'firstPerson') {
            // First person view
            const eyeWorldPos = new THREE.Vector3();
            eyeWorldPos.copy(this.eyePosition);
            eyeWorldPos.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.player.rotation.y + Math.PI);
            eyeWorldPos.add(this.player.position);
            this.camera.position.lerp(eyeWorldPos, 0.2);

            const lookDir = new THREE.Vector3(
                Math.sin(this.player.rotation.y),
                0,
                Math.cos(this.player.rotation.y)
            );
            const lookTarget = this.camera.position.clone().add(lookDir.multiplyScalar(10));
            this.camera.lookAt(lookTarget);
        } else {
            // Orbit camera - simple and direct
            const dist = this.cameraDistance;
            const height = this.cameraHeight + dist * Math.sin(this.cameraAngleX);

            // Camera position orbits around player
            const camX = this.player.position.x + Math.sin(this.cameraAngleY) * dist * Math.cos(this.cameraAngleX);
            const camZ = this.player.position.z + Math.cos(this.cameraAngleY) * dist * Math.cos(this.cameraAngleX);
            const camY = this.player.position.y + height;

            // Smooth follow
            const smoothness = this.cameraMode === 'cinematic' ? 0.05 : 0.12;
            this.camera.position.x += (camX - this.camera.position.x) * smoothness;
            this.camera.position.y += (camY - this.camera.position.y) * smoothness;
            this.camera.position.z += (camZ - this.camera.position.z) * smoothness;

            // Always look at player
            this.camera.lookAt(
                this.player.position.x,
                this.player.position.y + 1,
                this.player.position.z
            );
        }
    }

    updateStats(delta) {
        this.stats.hunger = Math.max(0, this.stats.hunger - 0.3 * delta);

        if (this.isNight) {
            this.stats.warmth = Math.max(0, this.stats.warmth - 1.5 * delta);
        } else {
            this.stats.warmth = Math.min(100, this.stats.warmth + 0.5 * delta);
        }

        if (!(this.keys['ShiftLeft'] || this.keys['ShiftRight'])) {
            this.stats.energy = Math.min(100, this.stats.energy + 2 * delta);
        }

        if (this.stats.warmth < 20 || this.stats.hunger < 20) {
            this.stats.health = Math.max(0, this.stats.health - 1 * delta);
        } else if (this.stats.health < 100) {
            this.stats.health = Math.min(100, this.stats.health + 0.2 * delta);
        }
    }

    updateDayNight(delta) {
        this.dayTime += delta * 0.005;
        if (this.dayTime > 1) this.dayTime = 0;

        this.isNight = this.dayTime > 0.7 || this.dayTime < 0.25;

        const sunAngle = this.dayTime * Math.PI * 2 - Math.PI / 2;
        this.sunLight.position.set(Math.cos(sunAngle) * 150, Math.sin(sunAngle) * 100 + 50, 50);

        if (this.isNight) {
            this.sunLight.intensity = 0.2;
            this.ambientLight.intensity = 0.15;
            this.scene.background.setHex(0x0a0a1a);
            this.scene.fog.color.setHex(0x0a0a1a);
        } else {
            this.sunLight.intensity = 0.8 + Math.sin(sunAngle) * 0.4;
            this.ambientLight.intensity = 0.3 + Math.sin(sunAngle) * 0.2;
            this.scene.background.setHex(0x87CEEB);
            this.scene.fog.color.setHex(0xc8d8e8);
        }

        if (this.isNight && this.dayTime > 0.8) {
            this.auroraActive = true;
            this.aurora.material.opacity = Math.sin((this.dayTime - 0.8) * Math.PI * 5) * 0.4;
            this.aurora.material.color.setHSL((Date.now() * 0.0001) % 1, 0.8, 0.5);
        } else {
            this.auroraActive = false;
            this.aurora.material.opacity = 0;
        }
    }

    updateWeather(delta) {
        if (this.snow) {
            const positions = this.snow.geometry.attributes.position.array;
            for (let i = 0; i < positions.length / 3; i++) {
                positions[i * 3 + 1] -= this.snowVelocities[i].y;
                positions[i * 3] += this.snowVelocities[i].x;

                if (positions[i * 3 + 1] < 0) {
                    positions[i * 3] = this.player.position.x + (Math.random() - 0.5) * 200;
                    positions[i * 3 + 1] = 60 + Math.random() * 20;
                    positions[i * 3 + 2] = this.player.position.z + (Math.random() - 0.5) * 200;
                }
            }
            this.snow.geometry.attributes.position.needsUpdate = true;
        }
    }

    updateNPCs(delta) {
        this.nearbyNPC = null;

        for (const npc of this.npcs) {
            const dx = npc.position.x - this.player.position.x;
            const dz = npc.position.z - this.player.position.z;
            const distance = Math.sqrt(dx * dx + dz * dz);

            if (distance < 8 && (!this.nearbyNPC || distance < this.nearbyNPC._distance)) {
                this.nearbyNPC = npc;
                npc._distance = distance;
            }

            if (npc.userData.npcName !== 'koulu') {
                npc.rotation.y += Math.sin(Date.now() * 0.001 + npc.position.x) * 0.001;
            }

            if (distance < 15 && npc.userData.npcName !== 'koulu') {
                const targetAngle = Math.atan2(
                    this.player.position.x - npc.position.x,
                    this.player.position.z - npc.position.z
                );
                npc.rotation.y = targetAngle;
            }
        }

        if (this.nearbyNPC && !this.inDialogue) {
            this.showMessage(`Press E to talk to ${this.nearbyNPC.userData.npcName}`);
        }
    }

    updateBirds(delta) {
        for (const flock of this.birdFlocks) {
            flock.center.x += Math.cos(flock.direction) * flock.speed * delta;
            flock.center.z += Math.sin(flock.direction) * flock.speed * delta;

            const halfWorld = this.worldSize / 2;
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

    updateUI() {
        document.getElementById('health-bar').style.width = `${this.stats.health}%`;
        document.getElementById('energy-bar').style.width = `${this.stats.energy}%`;
        document.getElementById('warmth-bar').style.width = `${this.stats.warmth}%`;
        document.getElementById('hunger-bar').style.width = `${this.stats.hunger}%`;
        document.getElementById('lichen-count').textContent = this.lichenCollected;
    }

    updateMinimap() {
        const canvas = document.getElementById('minimap');
        const ctx = canvas.getContext('2d');
        const size = 150;
        const scale = size / 200;

        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, size, size);

        for (let x = 0; x < size; x += 10) {
            for (let y = 0; y < size; y += 10) {
                const worldX = this.player.position.x + (x - size / 2) / scale;
                const worldZ = this.player.position.z + (y - size / 2) / scale;
                const height = this.chunkManager.getHeightAt(worldX, worldZ);
                const brightness = Math.min(255, 40 + height * 5);
                ctx.fillStyle = `rgb(${brightness * 0.3}, ${brightness * 0.4}, ${brightness * 0.5})`;
                ctx.fillRect(x, y, 10, 10);
            }
        }

        for (const npc of this.npcs) {
            const relX = (npc.position.x - this.player.position.x) * scale + size / 2;
            const relZ = (npc.position.z - this.player.position.z) * scale + size / 2;

            if (relX >= 0 && relX < size && relZ >= 0 && relZ < size) {
                ctx.fillStyle = '#f39c12';
                ctx.beginPath();
                ctx.arc(relX, relZ, 4, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        ctx.fillStyle = '#3498db';
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#3498db';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(size / 2, size / 2);
        ctx.lineTo(
            size / 2 + Math.sin(this.player.rotation.y) * 10,
            size / 2 + Math.cos(this.player.rotation.y) * 10
        );
        ctx.stroke();
    }

    checkObjectives() {
        const distFromSpawn = Math.sqrt(this.player.position.x ** 2 + this.player.position.z ** 2);
        if (distFromSpawn > 50 && !this.objectives.explore) {
            this.objectives.explore = true;
            document.getElementById('obj-explore').classList.add('completed');
            this.showMessage('Objective Complete: Explore the taiga!');
        }

        if (this.lichenCollected >= 10 && !this.objectives.lichen) {
            this.objectives.lichen = true;
            document.getElementById('obj-lichen').classList.add('completed');
            this.showMessage('Objective Complete: Collected 10 lichen!');
        }

        if (this.isNight && this.stats.health > 50 && !this.objectives.survive) {
            setTimeout(() => {
                if (this.isNight && this.stats.health > 50) {
                    this.objectives.survive = true;
                    document.getElementById('obj-survive').classList.add('completed');
                    this.showMessage('Objective Complete: Survived the night!');
                }
            }, 10000);
        }

        if (this.auroraActive && !this.objectives.aurora) {
            this.objectives.aurora = true;
            document.getElementById('obj-aurora').classList.add('completed');
            this.showMessage('Objective Complete: Witnessed the Aurora!');
        }
    }

    showMessage(text) {
        const messageEl = document.getElementById('message');
        messageEl.textContent = text;
        messageEl.classList.add('show');
        setTimeout(() => messageEl.classList.remove('show'), 3000);
    }
}

window.addEventListener('load', () => {
    window.game = new PoroGame();
});
