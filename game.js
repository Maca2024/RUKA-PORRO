/**
 * 🦌 PORO - Voxel Game in Lapland Taiga
 * A beautiful voxel world set in the Finnish Lapland
 *
 * Features:
 * - Procedural terrain generation with Perlin noise
 * - Dynamic day/night cycle with aurora borealis
 * - First-person controls with physics
 * - Block placement and destruction
 * - Atmospheric effects (snow, fog, particles)
 * - Multiple biomes and block types
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
    // World settings
    CHUNK_SIZE: 16,
    CHUNK_HEIGHT: 64,
    RENDER_DISTANCE: 4,
    WORLD_HEIGHT: 48,
    WATER_LEVEL: 20,
    SNOW_LEVEL: 35,

    // Player settings
    PLAYER_HEIGHT: 1.8,
    PLAYER_SPEED: 0.15,
    SPRINT_MULTIPLIER: 1.8,
    JUMP_FORCE: 0.25,
    GRAVITY: 0.012,
    MOUSE_SENSITIVITY: 0.002,

    // Graphics settings
    FOG_NEAR: 50,
    FOG_FAR: 150,
    DAY_LENGTH: 600, // seconds for full day cycle

    // Block types
    BLOCKS: {
        AIR: 0,
        SNOW: 1,
        FROZEN_DIRT: 2,
        STONE: 3,
        PINE_WOOD: 4,
        PINE_LEAVES: 5,
        ICE: 6,
        FROZEN_WATER: 7,
        BERRY_BUSH: 8,
        MOSS_STONE: 9
    }
};

// Block colors and properties
const BLOCK_DATA = {
    [CONFIG.BLOCKS.AIR]: { name: 'Air', color: null, transparent: true },
    [CONFIG.BLOCKS.SNOW]: { name: 'Snow', color: 0xF0F5FF, emissive: 0x101520 },
    [CONFIG.BLOCKS.FROZEN_DIRT]: { name: 'Frozen Dirt', color: 0x4A3728 },
    [CONFIG.BLOCKS.STONE]: { name: 'Stone', color: 0x6B7280 },
    [CONFIG.BLOCKS.PINE_WOOD]: { name: 'Pine Wood', color: 0x5D4037 },
    [CONFIG.BLOCKS.PINE_LEAVES]: { name: 'Pine Leaves', color: 0x1B4332, transparent: false },
    [CONFIG.BLOCKS.ICE]: { name: 'Ice', color: 0xA5D8FF, transparent: true, opacity: 0.7 },
    [CONFIG.BLOCKS.FROZEN_WATER]: { name: 'Frozen Water', color: 0x74C0FC, transparent: true, opacity: 0.8 },
    [CONFIG.BLOCKS.BERRY_BUSH]: { name: 'Berry Bush', color: 0xDC2626 },
    [CONFIG.BLOCKS.MOSS_STONE]: { name: 'Moss Stone', color: 0x4A5D4A }
};

// ============================================================================
// NOISE GENERATOR
// ============================================================================

class SimplexNoise {
    constructor(seed = Math.random()) {
        this.p = new Uint8Array(512);
        this.perm = new Uint8Array(512);

        const source = new Uint8Array(256);
        for (let i = 0; i < 256; i++) source[i] = i;

        seed = seed * 65536;
        if (seed < 1) seed = 1;

        for (let i = 255; i > 0; i--) {
            seed = (seed * 16807) % 2147483647;
            const r = (seed % (i + 1) + i + 1) % (i + 1);
            [source[i], source[r]] = [source[r], source[i]];
        }

        for (let i = 0; i < 512; i++) {
            this.perm[i] = source[i & 255];
        }
    }

    noise2D(x, y) {
        const F2 = 0.5 * (Math.sqrt(3) - 1);
        const G2 = (3 - Math.sqrt(3)) / 6;

        let n0, n1, n2;

        const s = (x + y) * F2;
        const i = Math.floor(x + s);
        const j = Math.floor(y + s);

        const t = (i + j) * G2;
        const X0 = i - t;
        const Y0 = j - t;
        const x0 = x - X0;
        const y0 = y - Y0;

        let i1, j1;
        if (x0 > y0) { i1 = 1; j1 = 0; }
        else { i1 = 0; j1 = 1; }

        const x1 = x0 - i1 + G2;
        const y1 = y0 - j1 + G2;
        const x2 = x0 - 1 + 2 * G2;
        const y2 = y0 - 1 + 2 * G2;

        const ii = i & 255;
        const jj = j & 255;

        let t0 = 0.5 - x0 * x0 - y0 * y0;
        if (t0 < 0) n0 = 0;
        else {
            t0 *= t0;
            const gi0 = this.perm[ii + this.perm[jj]] % 8;
            n0 = t0 * t0 * this.dot2(gi0, x0, y0);
        }

        let t1 = 0.5 - x1 * x1 - y1 * y1;
        if (t1 < 0) n1 = 0;
        else {
            t1 *= t1;
            const gi1 = this.perm[ii + i1 + this.perm[jj + j1]] % 8;
            n1 = t1 * t1 * this.dot2(gi1, x1, y1);
        }

        let t2 = 0.5 - x2 * x2 - y2 * y2;
        if (t2 < 0) n2 = 0;
        else {
            t2 *= t2;
            const gi2 = this.perm[ii + 1 + this.perm[jj + 1]] % 8;
            n2 = t2 * t2 * this.dot2(gi2, x2, y2);
        }

        return 70 * (n0 + n1 + n2);
    }

    dot2(gi, x, y) {
        const grad = [
            [1, 1], [-1, 1], [1, -1], [-1, -1],
            [1, 0], [-1, 0], [0, 1], [0, -1]
        ];
        return grad[gi][0] * x + grad[gi][1] * y;
    }

    noise3D(x, y, z) {
        // Simplified 3D noise using 2D layers
        return (this.noise2D(x, y) + this.noise2D(y, z) + this.noise2D(x, z)) / 3;
    }

    octaveNoise2D(x, y, octaves, persistence = 0.5, lacunarity = 2) {
        let total = 0;
        let frequency = 1;
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

// ============================================================================
// GAME CLASS
// ============================================================================

class VoxelGame {
    constructor() {
        this.container = document.getElementById('game-container');
        this.loadingScreen = document.getElementById('loading-screen');
        this.loadingBar = document.getElementById('loading-bar');
        this.loadingText = document.getElementById('loading-text');
        this.clickToPlay = document.getElementById('click-to-play');

        // Game state
        this.chunks = new Map();
        this.blockChanges = new Map();
        this.isPlaying = false;
        this.isPaused = false;
        this.selectedBlock = CONFIG.BLOCKS.SNOW;
        this.hotbar = [
            CONFIG.BLOCKS.SNOW,
            CONFIG.BLOCKS.STONE,
            CONFIG.BLOCKS.PINE_WOOD,
            CONFIG.BLOCKS.PINE_LEAVES,
            CONFIG.BLOCKS.ICE,
            CONFIG.BLOCKS.FROZEN_DIRT
        ];
        this.selectedSlot = 0;

        // Time
        this.gameTime = 0.25; // Start at sunrise (0-1, where 0.25 is sunrise, 0.5 is noon)
        this.dayNightSpeed = 1 / (CONFIG.DAY_LENGTH * 60); // Convert to per-frame

        // Player state
        this.velocity = new THREE.Vector3();
        this.onGround = false;
        this.keys = {};

        // Performance
        this.frameCount = 0;
        this.lastFpsUpdate = 0;
        this.fps = 60;

        // Initialize
        this.init();
    }

    async init() {
        this.updateLoading(5, 'Creating renderer...');
        await this.delay(100);
        this.createRenderer();

        this.updateLoading(15, 'Setting up scene...');
        await this.delay(100);
        this.createScene();

        this.updateLoading(25, 'Creating camera...');
        await this.delay(100);
        this.createCamera();

        this.updateLoading(35, 'Adding lights...');
        await this.delay(100);
        this.createLights();

        this.updateLoading(45, 'Initializing noise...');
        await this.delay(100);
        this.noise = new SimplexNoise(12345);

        this.updateLoading(55, 'Generating terrain...');
        await this.delay(100);
        await this.generateInitialChunks();

        this.updateLoading(85, 'Creating atmosphere...');
        await this.delay(100);
        this.createAtmosphere();

        this.updateLoading(90, 'Setting up controls...');
        await this.delay(100);
        this.setupControls();

        this.updateLoading(95, 'Creating UI...');
        await this.delay(100);
        this.createUI();

        this.updateLoading(100, 'Ready!');
        await this.delay(500);

        this.loadingScreen.classList.add('hidden');
        this.clickToPlay.classList.add('visible');

        // Start game loop
        this.lastTime = performance.now();
        this.animate();
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    updateLoading(percent, text) {
        this.loadingBar.style.width = `${percent}%`;
        this.loadingText.textContent = text;
    }

    createRenderer() {
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0;
        this.container.appendChild(this.renderer.domElement);
    }

    createScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB);
        this.scene.fog = new THREE.Fog(0x87CEEB, CONFIG.FOG_NEAR, CONFIG.FOG_FAR);
    }

    createCamera() {
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );

        // Find spawn position
        const spawnY = this.getTerrainHeight(0, 0) + 3;
        this.camera.position.set(0, spawnY, 0);

        // Camera container for pitch/yaw
        this.pitch = 0;
        this.yaw = 0;
    }

    createLights() {
        // Ambient light
        this.ambientLight = new THREE.AmbientLight(0x6688cc, 0.4);
        this.scene.add(this.ambientLight);

        // Directional light (sun)
        this.sunLight = new THREE.DirectionalLight(0xffffff, 1.0);
        this.sunLight.position.set(100, 100, 50);
        this.sunLight.castShadow = true;
        this.sunLight.shadow.mapSize.width = 2048;
        this.sunLight.shadow.mapSize.height = 2048;
        this.sunLight.shadow.camera.near = 0.5;
        this.sunLight.shadow.camera.far = 500;
        this.sunLight.shadow.camera.left = -100;
        this.sunLight.shadow.camera.right = 100;
        this.sunLight.shadow.camera.top = 100;
        this.sunLight.shadow.camera.bottom = -100;
        this.scene.add(this.sunLight);

        // Moon light
        this.moonLight = new THREE.DirectionalLight(0x8888ff, 0.3);
        this.moonLight.position.set(-100, 50, -50);
        this.scene.add(this.moonLight);

        // Hemisphere light for sky/ground color bleed
        this.hemisphereLight = new THREE.HemisphereLight(0x87CEEB, 0x4A3728, 0.3);
        this.scene.add(this.hemisphereLight);
    }

    getTerrainHeight(worldX, worldZ) {
        const scale1 = 0.02;
        const scale2 = 0.05;
        const scale3 = 0.1;

        let height = 0;

        // Large hills
        height += this.noise.noise2D(worldX * scale1, worldZ * scale1) * 15;

        // Medium detail
        height += this.noise.noise2D(worldX * scale2, worldZ * scale2) * 8;

        // Small detail
        height += this.noise.noise2D(worldX * scale3, worldZ * scale3) * 4;

        // Base height
        height += CONFIG.WORLD_HEIGHT / 2;

        return Math.floor(height);
    }

    getBlockAt(x, y, z) {
        const key = `${x},${y},${z}`;
        if (this.blockChanges.has(key)) {
            return this.blockChanges.get(key);
        }

        const chunkX = Math.floor(x / CONFIG.CHUNK_SIZE);
        const chunkZ = Math.floor(z / CONFIG.CHUNK_SIZE);
        const chunkKey = `${chunkX},${chunkZ}`;
        const chunk = this.chunks.get(chunkKey);

        if (!chunk) return CONFIG.BLOCKS.AIR;

        const localX = ((x % CONFIG.CHUNK_SIZE) + CONFIG.CHUNK_SIZE) % CONFIG.CHUNK_SIZE;
        const localZ = ((z % CONFIG.CHUNK_SIZE) + CONFIG.CHUNK_SIZE) % CONFIG.CHUNK_SIZE;

        if (y < 0 || y >= CONFIG.CHUNK_HEIGHT) return CONFIG.BLOCKS.AIR;

        const index = localX + localZ * CONFIG.CHUNK_SIZE + y * CONFIG.CHUNK_SIZE * CONFIG.CHUNK_SIZE;
        return chunk.data[index] || CONFIG.BLOCKS.AIR;
    }

    setBlockAt(x, y, z, type) {
        const key = `${x},${y},${z}`;
        this.blockChanges.set(key, type);

        // Rebuild affected chunks
        const chunkX = Math.floor(x / CONFIG.CHUNK_SIZE);
        const chunkZ = Math.floor(z / CONFIG.CHUNK_SIZE);
        this.rebuildChunk(chunkX, chunkZ);

        // Rebuild neighboring chunks if on edge
        const localX = ((x % CONFIG.CHUNK_SIZE) + CONFIG.CHUNK_SIZE) % CONFIG.CHUNK_SIZE;
        const localZ = ((z % CONFIG.CHUNK_SIZE) + CONFIG.CHUNK_SIZE) % CONFIG.CHUNK_SIZE;

        if (localX === 0) this.rebuildChunk(chunkX - 1, chunkZ);
        if (localX === CONFIG.CHUNK_SIZE - 1) this.rebuildChunk(chunkX + 1, chunkZ);
        if (localZ === 0) this.rebuildChunk(chunkX, chunkZ - 1);
        if (localZ === CONFIG.CHUNK_SIZE - 1) this.rebuildChunk(chunkX, chunkZ + 1);
    }

    generateChunkData(chunkX, chunkZ) {
        const data = new Uint8Array(CONFIG.CHUNK_SIZE * CONFIG.CHUNK_SIZE * CONFIG.CHUNK_HEIGHT);

        for (let x = 0; x < CONFIG.CHUNK_SIZE; x++) {
            for (let z = 0; z < CONFIG.CHUNK_SIZE; z++) {
                const worldX = chunkX * CONFIG.CHUNK_SIZE + x;
                const worldZ = chunkZ * CONFIG.CHUNK_SIZE + z;

                const terrainHeight = this.getTerrainHeight(worldX, worldZ);

                for (let y = 0; y < CONFIG.CHUNK_HEIGHT; y++) {
                    const index = x + z * CONFIG.CHUNK_SIZE + y * CONFIG.CHUNK_SIZE * CONFIG.CHUNK_SIZE;

                    if (y > terrainHeight) {
                        // Above ground - check for water
                        if (y <= CONFIG.WATER_LEVEL) {
                            data[index] = CONFIG.BLOCKS.FROZEN_WATER;
                        } else {
                            data[index] = CONFIG.BLOCKS.AIR;
                        }
                    } else if (y === terrainHeight) {
                        // Surface
                        if (y > CONFIG.SNOW_LEVEL) {
                            data[index] = CONFIG.BLOCKS.SNOW;
                        } else if (y <= CONFIG.WATER_LEVEL + 1) {
                            data[index] = CONFIG.BLOCKS.ICE;
                        } else {
                            data[index] = CONFIG.BLOCKS.SNOW;
                        }
                    } else if (y > terrainHeight - 4) {
                        // Subsurface
                        data[index] = CONFIG.BLOCKS.FROZEN_DIRT;
                    } else {
                        // Deep underground
                        const caveNoise = this.noise.noise3D(worldX * 0.1, y * 0.1, worldZ * 0.1);
                        if (caveNoise > 0.6) {
                            data[index] = CONFIG.BLOCKS.AIR; // Cave
                        } else {
                            data[index] = CONFIG.BLOCKS.STONE;
                        }
                    }
                }
            }
        }

        return data;
    }

    shouldPlaceTree(worldX, worldZ, terrainHeight) {
        if (terrainHeight <= CONFIG.WATER_LEVEL + 2) return false;
        if (terrainHeight > CONFIG.SNOW_LEVEL + 5) return false;

        // Use noise for tree distribution
        const treeNoise = this.noise.noise2D(worldX * 0.3, worldZ * 0.3);
        const densityNoise = this.noise.noise2D(worldX * 0.05, worldZ * 0.05);

        const threshold = 0.7 - densityNoise * 0.2;
        return treeNoise > threshold;
    }

    generateTree(worldX, worldZ, terrainHeight, chunkData, chunkX, chunkZ) {
        const treeHeight = 6 + Math.floor(Math.random() * 4);
        const localX = ((worldX % CONFIG.CHUNK_SIZE) + CONFIG.CHUNK_SIZE) % CONFIG.CHUNK_SIZE;
        const localZ = ((worldZ % CONFIG.CHUNK_SIZE) + CONFIG.CHUNK_SIZE) % CONFIG.CHUNK_SIZE;

        // Check if tree is fully in this chunk
        if (localX < 2 || localX >= CONFIG.CHUNK_SIZE - 2) return;
        if (localZ < 2 || localZ >= CONFIG.CHUNK_SIZE - 2) return;

        // Trunk
        for (let y = terrainHeight + 1; y < terrainHeight + 1 + treeHeight && y < CONFIG.CHUNK_HEIGHT; y++) {
            const index = localX + localZ * CONFIG.CHUNK_SIZE + y * CONFIG.CHUNK_SIZE * CONFIG.CHUNK_SIZE;
            chunkData[index] = CONFIG.BLOCKS.PINE_WOOD;
        }

        // Pine leaves (conical shape)
        const leafStart = terrainHeight + 2;
        const leafEnd = terrainHeight + treeHeight + 2;

        for (let y = leafStart; y < leafEnd && y < CONFIG.CHUNK_HEIGHT; y++) {
            const progress = (y - leafStart) / (leafEnd - leafStart);
            const radius = Math.floor(3 * (1 - progress * 0.8));

            for (let dx = -radius; dx <= radius; dx++) {
                for (let dz = -radius; dz <= radius; dz++) {
                    if (dx === 0 && dz === 0) continue;
                    if (Math.abs(dx) + Math.abs(dz) > radius + 1) continue;

                    const lx = localX + dx;
                    const lz = localZ + dz;

                    if (lx >= 0 && lx < CONFIG.CHUNK_SIZE && lz >= 0 && lz < CONFIG.CHUNK_SIZE) {
                        const index = lx + lz * CONFIG.CHUNK_SIZE + y * CONFIG.CHUNK_SIZE * CONFIG.CHUNK_SIZE;
                        if (chunkData[index] === CONFIG.BLOCKS.AIR) {
                            // Add snow on top of leaves randomly
                            if (Math.random() > 0.7 && y === leafEnd - 1) {
                                chunkData[index] = CONFIG.BLOCKS.SNOW;
                            } else {
                                chunkData[index] = CONFIG.BLOCKS.PINE_LEAVES;
                            }
                        }
                    }
                }
            }
        }

        // Tree top
        const topY = Math.min(leafEnd, CONFIG.CHUNK_HEIGHT - 1);
        const topIndex = localX + localZ * CONFIG.CHUNK_SIZE + topY * CONFIG.CHUNK_SIZE * CONFIG.CHUNK_SIZE;
        chunkData[topIndex] = CONFIG.BLOCKS.PINE_LEAVES;
    }

    generateChunk(chunkX, chunkZ) {
        const chunkKey = `${chunkX},${chunkZ}`;
        if (this.chunks.has(chunkKey)) return;

        // Generate base terrain
        const data = this.generateChunkData(chunkX, chunkZ);

        // Add trees
        for (let x = 0; x < CONFIG.CHUNK_SIZE; x++) {
            for (let z = 0; z < CONFIG.CHUNK_SIZE; z++) {
                const worldX = chunkX * CONFIG.CHUNK_SIZE + x;
                const worldZ = chunkZ * CONFIG.CHUNK_SIZE + z;
                const terrainHeight = this.getTerrainHeight(worldX, worldZ);

                if (this.shouldPlaceTree(worldX, worldZ, terrainHeight)) {
                    this.generateTree(worldX, worldZ, terrainHeight, data, chunkX, chunkZ);
                }
            }
        }

        // Create mesh
        const geometry = this.createChunkGeometry(data, chunkX, chunkZ);

        if (geometry.attributes.position.count > 0) {
            const material = new THREE.MeshLambertMaterial({
                vertexColors: true,
                side: THREE.FrontSide
            });

            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(chunkX * CONFIG.CHUNK_SIZE, 0, chunkZ * CONFIG.CHUNK_SIZE);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            this.scene.add(mesh);

            this.chunks.set(chunkKey, { data, mesh });
        } else {
            this.chunks.set(chunkKey, { data, mesh: null });
        }
    }

    rebuildChunk(chunkX, chunkZ) {
        const chunkKey = `${chunkX},${chunkZ}`;
        const chunk = this.chunks.get(chunkKey);
        if (!chunk) return;

        // Remove old mesh
        if (chunk.mesh) {
            this.scene.remove(chunk.mesh);
            chunk.mesh.geometry.dispose();
            chunk.mesh.material.dispose();
        }

        // Create new geometry with block changes
        const geometry = this.createChunkGeometry(chunk.data, chunkX, chunkZ);

        if (geometry.attributes.position.count > 0) {
            const material = new THREE.MeshLambertMaterial({
                vertexColors: true,
                side: THREE.FrontSide
            });

            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(chunkX * CONFIG.CHUNK_SIZE, 0, chunkZ * CONFIG.CHUNK_SIZE);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            this.scene.add(mesh);

            chunk.mesh = mesh;
        } else {
            chunk.mesh = null;
        }
    }

    createChunkGeometry(data, chunkX, chunkZ) {
        const positions = [];
        const normals = [];
        const colors = [];

        const addFace = (x, y, z, normal, color) => {
            const [nx, ny, nz] = normal;
            const vertices = [];

            // Calculate face vertices based on normal direction
            if (nx !== 0) {
                const fx = x + (nx > 0 ? 1 : 0);
                vertices.push(
                    [fx, y, z], [fx, y + 1, z], [fx, y + 1, z + 1],
                    [fx, y, z], [fx, y + 1, z + 1], [fx, y, z + 1]
                );
            } else if (ny !== 0) {
                const fy = y + (ny > 0 ? 1 : 0);
                vertices.push(
                    [x, fy, z], [x, fy, z + 1], [x + 1, fy, z + 1],
                    [x, fy, z], [x + 1, fy, z + 1], [x + 1, fy, z]
                );
            } else {
                const fz = z + (nz > 0 ? 1 : 0);
                vertices.push(
                    [x, y, fz], [x + 1, y + 1, fz], [x, y + 1, fz],
                    [x, y, fz], [x + 1, y, fz], [x + 1, y + 1, fz]
                );
            }

            for (const v of vertices) {
                positions.push(...v);
                normals.push(nx, ny, nz);

                // Color with slight variation
                const r = ((color >> 16) & 255) / 255;
                const g = ((color >> 8) & 255) / 255;
                const b = (color & 255) / 255;
                const variation = 0.9 + Math.random() * 0.2;
                colors.push(r * variation, g * variation, b * variation);
            }
        };

        for (let x = 0; x < CONFIG.CHUNK_SIZE; x++) {
            for (let z = 0; z < CONFIG.CHUNK_SIZE; z++) {
                for (let y = 0; y < CONFIG.CHUNK_HEIGHT; y++) {
                    const worldX = chunkX * CONFIG.CHUNK_SIZE + x;
                    const worldZ = chunkZ * CONFIG.CHUNK_SIZE + z;

                    let blockType = data[x + z * CONFIG.CHUNK_SIZE + y * CONFIG.CHUNK_SIZE * CONFIG.CHUNK_SIZE];

                    // Check for block changes
                    const key = `${worldX},${y},${worldZ}`;
                    if (this.blockChanges.has(key)) {
                        blockType = this.blockChanges.get(key);
                    }

                    if (blockType === CONFIG.BLOCKS.AIR) continue;

                    const blockData = BLOCK_DATA[blockType];
                    if (!blockData || !blockData.color) continue;

                    const color = blockData.color;

                    // Check each face
                    const checkBlock = (dx, dy, dz) => {
                        const nx = worldX + dx;
                        const ny = y + dy;
                        const nz = worldZ + dz;

                        if (ny < 0 || ny >= CONFIG.CHUNK_HEIGHT) return true;

                        const neighborKey = `${nx},${ny},${nz}`;
                        if (this.blockChanges.has(neighborKey)) {
                            const neighborType = this.blockChanges.get(neighborKey);
                            return neighborType === CONFIG.BLOCKS.AIR || BLOCK_DATA[neighborType]?.transparent;
                        }

                        // Check within same chunk
                        const lx = x + dx;
                        const lz = z + dz;
                        if (lx >= 0 && lx < CONFIG.CHUNK_SIZE && lz >= 0 && lz < CONFIG.CHUNK_SIZE) {
                            const nIndex = lx + lz * CONFIG.CHUNK_SIZE + ny * CONFIG.CHUNK_SIZE * CONFIG.CHUNK_SIZE;
                            const neighborType = data[nIndex];
                            return neighborType === CONFIG.BLOCKS.AIR || BLOCK_DATA[neighborType]?.transparent;
                        }

                        // Check in neighbor chunk
                        return this.isBlockTransparent(nx, ny, nz);
                    };

                    // Add visible faces
                    if (checkBlock(1, 0, 0)) addFace(x, y, z, [1, 0, 0], color);
                    if (checkBlock(-1, 0, 0)) addFace(x, y, z, [-1, 0, 0], color);
                    if (checkBlock(0, 1, 0)) addFace(x, y, z, [0, 1, 0], color);
                    if (checkBlock(0, -1, 0)) addFace(x, y, z, [0, -1, 0], color);
                    if (checkBlock(0, 0, 1)) addFace(x, y, z, [0, 0, 1], color);
                    if (checkBlock(0, 0, -1)) addFace(x, y, z, [0, 0, -1], color);
                }
            }
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

        return geometry;
    }

    isBlockTransparent(x, y, z) {
        const blockType = this.getBlockAt(x, y, z);
        return blockType === CONFIG.BLOCKS.AIR || BLOCK_DATA[blockType]?.transparent;
    }

    async generateInitialChunks() {
        const radius = CONFIG.RENDER_DISTANCE;
        const total = (radius * 2 + 1) ** 2;
        let count = 0;

        for (let x = -radius; x <= radius; x++) {
            for (let z = -radius; z <= radius; z++) {
                this.generateChunk(x, z);
                count++;
                this.updateLoading(55 + (count / total) * 30, `Generating terrain ${Math.floor(count / total * 100)}%...`);
                if (count % 4 === 0) await this.delay(10);
            }
        }
    }

    createAtmosphere() {
        // Sky dome
        const skyGeometry = new THREE.SphereGeometry(400, 32, 32);
        const skyMaterial = new THREE.ShaderMaterial({
            uniforms: {
                topColor: { value: new THREE.Color(0x0044ff) },
                bottomColor: { value: new THREE.Color(0x87CEEB) },
                offset: { value: 20 },
                exponent: { value: 0.6 }
            },
            vertexShader: `
                varying vec3 vWorldPosition;
                void main() {
                    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                    vWorldPosition = worldPosition.xyz;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 topColor;
                uniform vec3 bottomColor;
                uniform float offset;
                uniform float exponent;
                varying vec3 vWorldPosition;
                void main() {
                    float h = normalize(vWorldPosition + offset).y;
                    gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
                }
            `,
            side: THREE.BackSide
        });

        this.sky = new THREE.Mesh(skyGeometry, skyMaterial);
        this.scene.add(this.sky);

        // Snowfall particles
        this.createSnowfall();

        // Aurora (visible at night)
        this.createAurora();
    }

    createSnowfall() {
        const particleCount = 3000;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const velocities = new Float32Array(particleCount);

        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 200;
            positions[i * 3 + 1] = Math.random() * 100;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 200;
            velocities[i] = 0.1 + Math.random() * 0.2;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.userData.velocities = velocities;

        const material = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.3,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });

        this.snowParticles = new THREE.Points(geometry, material);
        this.scene.add(this.snowParticles);
    }

    createAurora() {
        const geometry = new THREE.PlaneGeometry(300, 100, 50, 20);
        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                opacity: { value: 0 }
            },
            vertexShader: `
                uniform float time;
                varying vec2 vUv;
                varying float vDisplacement;

                void main() {
                    vUv = uv;
                    vec3 pos = position;

                    float wave1 = sin(pos.x * 0.02 + time) * 10.0;
                    float wave2 = sin(pos.x * 0.01 + time * 0.5) * 20.0;
                    float wave3 = cos(pos.x * 0.03 + time * 0.3) * 5.0;

                    pos.z += wave1 + wave2 + wave3;
                    pos.y += sin(pos.x * 0.02 + time * 0.7) * 5.0;

                    vDisplacement = (wave1 + wave2 + wave3) / 35.0;

                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                uniform float opacity;
                varying vec2 vUv;
                varying float vDisplacement;

                void main() {
                    vec3 color1 = vec3(0.0, 1.0, 0.5);  // Green
                    vec3 color2 = vec3(0.2, 0.5, 1.0);  // Blue
                    vec3 color3 = vec3(0.8, 0.2, 1.0);  // Purple

                    float t = vUv.x + vDisplacement * 0.5 + time * 0.1;
                    vec3 color = mix(color1, color2, sin(t * 3.14159) * 0.5 + 0.5);
                    color = mix(color, color3, sin(t * 2.0 + 1.0) * 0.5 + 0.5);

                    float alpha = (1.0 - abs(vUv.y - 0.5) * 2.0) * opacity;
                    alpha *= 0.5 + sin(vUv.x * 20.0 + time) * 0.3;
                    alpha *= smoothstep(0.0, 0.2, vUv.y) * smoothstep(1.0, 0.8, vUv.y);

                    gl_FragColor = vec4(color, alpha * 0.6);
                }
            `,
            transparent: true,
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        this.aurora = new THREE.Mesh(geometry, material);
        this.aurora.position.set(0, 120, -100);
        this.aurora.rotation.x = -0.3;
        this.scene.add(this.aurora);
    }

    setupControls() {
        // Keyboard
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;

            // Block selection
            if (e.code >= 'Digit1' && e.code <= 'Digit6') {
                const slot = parseInt(e.code.replace('Digit', '')) - 1;
                this.selectSlot(slot);
            }

            // ESC to unlock
            if (e.code === 'Escape') {
                this.isPaused = true;
                document.exitPointerLock();
                this.clickToPlay.classList.add('visible');
            }
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });

        // Mouse
        document.addEventListener('mousemove', (e) => {
            if (!this.isPlaying || this.isPaused) return;

            this.yaw -= e.movementX * CONFIG.MOUSE_SENSITIVITY;
            this.pitch -= e.movementY * CONFIG.MOUSE_SENSITIVITY;
            this.pitch = Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, this.pitch));
        });

        document.addEventListener('mousedown', (e) => {
            if (!this.isPlaying || this.isPaused) return;

            if (e.button === 0) this.breakBlock();
            if (e.button === 2) this.placeBlock();
        });

        document.addEventListener('contextmenu', (e) => e.preventDefault());

        // Pointer lock
        this.clickToPlay.addEventListener('click', () => {
            this.container.requestPointerLock();
        });

        document.addEventListener('pointerlockchange', () => {
            this.isPlaying = document.pointerLockElement === this.container;
            this.isPaused = !this.isPlaying;

            if (this.isPlaying) {
                this.clickToPlay.classList.remove('visible');
            }
        });

        // Window resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    createUI() {
        const selector = document.getElementById('block-selector');
        selector.innerHTML = '';

        this.hotbar.forEach((blockType, index) => {
            const slot = document.createElement('div');
            slot.className = 'block-slot' + (index === this.selectedSlot ? ' active' : '');

            const blockData = BLOCK_DATA[blockType];
            const color = blockData.color;
            slot.style.background = `#${color.toString(16).padStart(6, '0')}`;

            const hint = document.createElement('span');
            hint.className = 'key-hint';
            hint.textContent = index + 1;
            slot.appendChild(hint);

            slot.title = blockData.name;
            selector.appendChild(slot);
        });
    }

    selectSlot(index) {
        this.selectedSlot = index;
        this.selectedBlock = this.hotbar[index];
        this.createUI();
    }

    raycast() {
        const direction = new THREE.Vector3(0, 0, -1);
        direction.applyQuaternion(this.camera.quaternion);

        const step = 0.1;
        const maxDistance = 6;
        let prevX, prevY, prevZ;

        for (let d = 0; d < maxDistance; d += step) {
            const x = Math.floor(this.camera.position.x + direction.x * d);
            const y = Math.floor(this.camera.position.y + direction.y * d);
            const z = Math.floor(this.camera.position.z + direction.z * d);

            const block = this.getBlockAt(x, y, z);

            if (block !== CONFIG.BLOCKS.AIR && !BLOCK_DATA[block]?.transparent) {
                return {
                    hit: true,
                    x, y, z,
                    prevX, prevY, prevZ
                };
            }

            prevX = x;
            prevY = y;
            prevZ = z;
        }

        return { hit: false };
    }

    breakBlock() {
        const result = this.raycast();
        if (result.hit) {
            this.setBlockAt(result.x, result.y, result.z, CONFIG.BLOCKS.AIR);
        }
    }

    placeBlock() {
        const result = this.raycast();
        if (result.hit && result.prevX !== undefined) {
            // Check if player is not in the way
            const px = Math.floor(this.camera.position.x);
            const py = Math.floor(this.camera.position.y);
            const pz = Math.floor(this.camera.position.z);

            if (result.prevX === px && result.prevZ === pz &&
                (result.prevY === py || result.prevY === py - 1)) {
                return; // Would place inside player
            }

            this.setBlockAt(result.prevX, result.prevY, result.prevZ, this.selectedBlock);
        }
    }

    updatePlayer(delta) {
        if (!this.isPlaying || this.isPaused) return;

        // Update camera rotation
        const euler = new THREE.Euler(this.pitch, this.yaw, 0, 'YXZ');
        this.camera.quaternion.setFromEuler(euler);

        // Movement
        const speed = this.keys['ShiftLeft'] ? CONFIG.PLAYER_SPEED * CONFIG.SPRINT_MULTIPLIER : CONFIG.PLAYER_SPEED;
        const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion);
        const right = new THREE.Vector3(1, 0, 0).applyQuaternion(this.camera.quaternion);

        forward.y = 0;
        forward.normalize();
        right.y = 0;
        right.normalize();

        const moveDir = new THREE.Vector3();

        if (this.keys['KeyW']) moveDir.add(forward);
        if (this.keys['KeyS']) moveDir.sub(forward);
        if (this.keys['KeyD']) moveDir.add(right);
        if (this.keys['KeyA']) moveDir.sub(right);

        if (moveDir.length() > 0) {
            moveDir.normalize().multiplyScalar(speed);
        }

        // Apply gravity
        this.velocity.y -= CONFIG.GRAVITY;

        // Jump
        if (this.keys['Space'] && this.onGround) {
            this.velocity.y = CONFIG.JUMP_FORCE;
            this.onGround = false;
        }

        // Combine movement
        const newPos = this.camera.position.clone();
        newPos.x += moveDir.x;
        newPos.z += moveDir.z;
        newPos.y += this.velocity.y;

        // Collision detection
        this.onGround = false;

        // Check Y collision (vertical)
        const feetY = newPos.y - CONFIG.PLAYER_HEIGHT;
        const headY = newPos.y;
        const px = Math.floor(newPos.x);
        const pz = Math.floor(newPos.z);

        // Ground check
        for (let dx = -1; dx <= 1; dx++) {
            for (let dz = -1; dz <= 1; dz++) {
                const block = this.getBlockAt(px + dx, Math.floor(feetY), pz + dz);
                if (block !== CONFIG.BLOCKS.AIR && !BLOCK_DATA[block]?.transparent) {
                    if (this.velocity.y < 0) {
                        newPos.y = Math.floor(feetY) + 1 + CONFIG.PLAYER_HEIGHT;
                        this.velocity.y = 0;
                        this.onGround = true;
                    }
                }
            }
        }

        // Ceiling check
        const ceilingBlock = this.getBlockAt(px, Math.floor(headY) + 1, pz);
        if (ceilingBlock !== CONFIG.BLOCKS.AIR && !BLOCK_DATA[ceilingBlock]?.transparent) {
            if (this.velocity.y > 0) {
                this.velocity.y = 0;
            }
        }

        // Horizontal collision
        const checkX = this.getBlockAt(Math.floor(newPos.x), Math.floor(newPos.y - 1), Math.floor(this.camera.position.z));
        const checkZ = this.getBlockAt(Math.floor(this.camera.position.x), Math.floor(newPos.y - 1), Math.floor(newPos.z));

        if (checkX !== CONFIG.BLOCKS.AIR && !BLOCK_DATA[checkX]?.transparent) {
            newPos.x = this.camera.position.x;
        }
        if (checkZ !== CONFIG.BLOCKS.AIR && !BLOCK_DATA[checkZ]?.transparent) {
            newPos.z = this.camera.position.z;
        }

        this.camera.position.copy(newPos);

        // Update chunks based on player position
        this.updateChunks();
    }

    updateChunks() {
        const playerChunkX = Math.floor(this.camera.position.x / CONFIG.CHUNK_SIZE);
        const playerChunkZ = Math.floor(this.camera.position.z / CONFIG.CHUNK_SIZE);

        // Generate new chunks
        for (let x = playerChunkX - CONFIG.RENDER_DISTANCE; x <= playerChunkX + CONFIG.RENDER_DISTANCE; x++) {
            for (let z = playerChunkZ - CONFIG.RENDER_DISTANCE; z <= playerChunkZ + CONFIG.RENDER_DISTANCE; z++) {
                const key = `${x},${z}`;
                if (!this.chunks.has(key)) {
                    this.generateChunk(x, z);
                }
            }
        }

        // Remove far chunks
        for (const [key, chunk] of this.chunks) {
            const [x, z] = key.split(',').map(Number);
            if (Math.abs(x - playerChunkX) > CONFIG.RENDER_DISTANCE + 1 ||
                Math.abs(z - playerChunkZ) > CONFIG.RENDER_DISTANCE + 1) {
                if (chunk.mesh) {
                    this.scene.remove(chunk.mesh);
                    chunk.mesh.geometry.dispose();
                    chunk.mesh.material.dispose();
                }
                this.chunks.delete(key);
            }
        }
    }

    updateDayNight(delta) {
        this.gameTime += this.dayNightSpeed * delta;
        if (this.gameTime > 1) this.gameTime -= 1;

        // Calculate sun angle
        const sunAngle = this.gameTime * Math.PI * 2 - Math.PI / 2;
        const sunHeight = Math.sin(sunAngle);
        const sunDistance = 200;

        this.sunLight.position.set(
            Math.cos(sunAngle) * sunDistance,
            Math.max(sunHeight * sunDistance, 10),
            Math.sin(sunAngle) * sunDistance * 0.5
        );

        // Day/night colors
        const dayness = Math.max(0, sunHeight);
        const nightness = Math.max(0, -sunHeight);

        // Sky colors
        const dayTopColor = new THREE.Color(0x0044ff);
        const dayBottomColor = new THREE.Color(0x87CEEB);
        const nightTopColor = new THREE.Color(0x000011);
        const nightBottomColor = new THREE.Color(0x0a0a20);
        const sunsetColor = new THREE.Color(0xff6b35);

        // Interpolate colors
        let topColor = dayTopColor.clone().lerp(nightTopColor, nightness);
        let bottomColor = dayBottomColor.clone().lerp(nightBottomColor, nightness);

        // Add sunset/sunrise tint
        const sunsetFactor = Math.max(0, 1 - Math.abs(sunHeight) * 3) * 0.5;
        bottomColor.lerp(sunsetColor, sunsetFactor);

        this.sky.material.uniforms.topColor.value = topColor;
        this.sky.material.uniforms.bottomColor.value = bottomColor;

        // Scene fog
        const fogColor = bottomColor.clone();
        this.scene.fog.color = fogColor;
        this.scene.background = fogColor;

        // Light intensities
        this.sunLight.intensity = Math.max(0.1, dayness * 1.2);
        this.sunLight.color.setHex(sunsetFactor > 0.1 ? 0xffaa77 : 0xffffff);
        this.moonLight.intensity = Math.max(0, nightness * 0.4);
        this.ambientLight.intensity = 0.2 + dayness * 0.3;

        // Aurora visibility (only at night)
        if (this.aurora) {
            this.aurora.material.uniforms.opacity.value = Math.max(0, nightness - 0.2);
        }

        // Update time display
        const hours = Math.floor(this.gameTime * 24);
        const minutes = Math.floor((this.gameTime * 24 * 60) % 60);
        document.getElementById('game-time').textContent =
            `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

        let period = 'Day';
        if (this.gameTime < 0.25) period = 'Night';
        else if (this.gameTime < 0.3) period = 'Dawn';
        else if (this.gameTime < 0.4) period = 'Morning';
        else if (this.gameTime < 0.6) period = 'Midday';
        else if (this.gameTime < 0.7) period = 'Afternoon';
        else if (this.gameTime < 0.8) period = 'Evening';
        else if (this.gameTime < 0.85) period = 'Dusk';
        else period = 'Night';

        document.getElementById('time-period').textContent = period;
    }

    updateAtmosphere(delta) {
        // Update snowfall
        if (this.snowParticles) {
            const positions = this.snowParticles.geometry.attributes.position.array;
            const velocities = this.snowParticles.geometry.userData.velocities;

            for (let i = 0; i < positions.length; i += 3) {
                positions[i + 1] -= velocities[i / 3] * delta * 30;
                positions[i] += Math.sin(positions[i + 1] * 0.1) * 0.02;

                // Reset particle if below ground
                if (positions[i + 1] < 0) {
                    positions[i] = this.camera.position.x + (Math.random() - 0.5) * 200;
                    positions[i + 1] = this.camera.position.y + 50 + Math.random() * 50;
                    positions[i + 2] = this.camera.position.z + (Math.random() - 0.5) * 200;
                }
            }

            this.snowParticles.geometry.attributes.position.needsUpdate = true;
            this.snowParticles.position.set(0, 0, 0);
        }

        // Update aurora
        if (this.aurora) {
            this.aurora.material.uniforms.time.value += delta;
            this.aurora.position.x = this.camera.position.x;
            this.aurora.position.z = this.camera.position.z - 100;
        }
    }

    updateUI() {
        document.getElementById('pos-x').textContent = Math.floor(this.camera.position.x);
        document.getElementById('pos-y').textContent = Math.floor(this.camera.position.y);
        document.getElementById('pos-z').textContent = Math.floor(this.camera.position.z);

        // FPS counter
        this.frameCount++;
        const now = performance.now();
        if (now - this.lastFpsUpdate >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.lastFpsUpdate = now;
            document.getElementById('fps').textContent = this.fps;
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const now = performance.now();
        const delta = Math.min((now - this.lastTime) / 1000, 0.1);
        this.lastTime = now;

        this.updatePlayer(delta);
        this.updateDayNight(delta);
        this.updateAtmosphere(delta);
        this.updateUI();

        // Update sun shadow camera to follow player
        this.sunLight.target.position.copy(this.camera.position);
        this.sunLight.shadow.camera.updateProjectionMatrix();

        this.renderer.render(this.scene, this.camera);
    }
}

// ============================================================================
// START GAME
// ============================================================================

window.addEventListener('DOMContentLoaded', () => {
    new VoxelGame();
});
