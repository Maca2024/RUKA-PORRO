/**
 * AI Academy - Chunk Manager
 * Procedural terrain with configurable biomes per world
 */

const CONFIG = window.CONFIG;
const BIOME_CONFIGS = window.BIOME_CONFIGS;

class ChunkManager {
    constructor(scene, noise) {
        this.scene = scene;
        this.noise = noise;
        this.chunks = new Map();
        this.chunkSize = CONFIG.world.chunkSize;
        this.loadRadius = CONFIG.world.loadRadius;
        this.currentBiome = null;
        this.npcZones = {};
        this._sharedMaterials = {};

        this.setBiome(1); // Default to World 1
    }

    setBiome(worldId) {
        const biome = BIOME_CONFIGS[worldId];
        if (!biome) return;

        this.currentBiome = biome;

        // Dispose old shared materials
        Object.values(this._sharedMaterials).forEach(m => m.dispose());
        this._sharedMaterials = {};

        // Create shared materials for this biome
        const treeCfg = biome.trees || {};
        this._sharedMaterials.trunk = new THREE.MeshLambertMaterial({ color: treeCfg.trunkColor || 0x4a3728 });
        this._sharedMaterials.foliage = new THREE.MeshLambertMaterial({ color: treeCfg.foliageColor || 0x1a4a1a });
        this._sharedMaterials.snow = new THREE.MeshLambertMaterial({ color: 0xffffff });
        this._sharedMaterials.lichen = new THREE.MeshLambertMaterial({
            color: 0x7cb342, emissive: 0x2e7d32, emissiveIntensity: 0.3
        });
        this._sharedMaterials.crystal = new THREE.MeshLambertMaterial({
            color: treeCfg.foliageColor || 0x8060c0,
            emissive: treeCfg.foliageColor || 0x8060c0,
            emissiveIntensity: 0.3,
            transparent: true,
            opacity: 0.8
        });

        // Clear existing chunks
        for (const [key, chunk] of this.chunks) {
            this.scene.remove(chunk);
            chunk.traverse(obj => {
                if (obj.geometry) obj.geometry.dispose();
                if (obj.material) obj.material.dispose();
            });
        }
        this.chunks.clear();

        // Regenerate features with biome config
        this.generateWorldFeatures();
    }

    generateWorldFeatures() {
        const worldSize = CONFIG.world.size;
        const half = worldSize / 2;
        const tc = this.currentBiome?.terrain || CONFIG.terrain;

        this.mountains = [];
        const mCount = tc.mountainCount || CONFIG.terrain.mountainCount;
        for (let i = 0; i < mCount; i++) {
            const angle = (i / mCount) * Math.PI * 2;
            const distance = half * (0.4 + Math.random() * 0.5);
            this.mountains.push({
                x: Math.cos(angle) * distance + (Math.random() - 0.5) * 400,
                z: Math.sin(angle) * distance + (Math.random() - 0.5) * 400,
                radius: 80 + Math.random() * 120,
                height: 30 + Math.random() * (tc.maxHeight || 50)
            });
        }

        this.hills = [];
        const hCount = tc.hillCount || CONFIG.terrain.hillCount;
        for (let i = 0; i < hCount; i++) {
            this.hills.push({
                x: (Math.random() - 0.5) * worldSize * 0.8,
                z: (Math.random() - 0.5) * worldSize * 0.8,
                radius: 30 + Math.random() * 50,
                height: 8 + Math.random() * 15
            });
        }

        this.lakes = [];
        const lCount = tc.lakeCount || CONFIG.terrain.lakeCount;
        for (let i = 0; i < lCount; i++) {
            this.lakes.push({
                x: (Math.random() - 0.5) * worldSize * 0.6,
                z: (Math.random() - 0.5) * worldSize * 0.6,
                radius: 40 + Math.random() * 80
            });
        }
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
        let height = this.currentBiome?.terrain?.baseHeight || 0;
        const scale = this.currentBiome?.terrain?.noiseScale || 0.008;

        height += this.noise.octaveNoise(x, z, 4, 0.5, 2, scale) * 8;
        height += this.noise.octaveNoise(x, z, 2, 0.5, 2, scale * 0.25) * 3;

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

    _getBiomeColor(biomeType) {
        const colors = this.currentBiome?.colors;
        if (!colors) {
            // Defaults (snow world)
            switch (biomeType) {
                case 'ice': return { r: 0.7, g: 0.85, b: 0.95 };
                case 'mountain': return { r: 0.5, g: 0.5, b: 0.55 };
                case 'rocky': return { r: 0.6, g: 0.6, b: 0.6 };
                case 'snow_flat': return { r: 0.95, g: 0.97, b: 1.0 };
                default: return { r: 0.9, g: 0.93, b: 0.96 };
            }
        }

        switch (biomeType) {
            case 'ice': return colors.ice;
            case 'mountain': return colors.mountain;
            case 'rocky': return colors.hills;
            case 'snow_flat': return colors.ground;
            default: return colors.forest;
        }
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

            const biomeType = this.getBiomeAt(worldX, worldZ);
            const color = this._getBiomeColor(biomeType);

            const variation = this.noise.noise2D(worldX * 0.1, worldZ * 0.1) * 0.05;
            colors[i] = Math.min(1, color.r + variation);
            colors[i + 1] = Math.min(1, color.g + variation);
            colors[i + 2] = Math.min(1, color.b + variation);
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
        const treeCfg = this.currentBiome?.trees || {};
        const density = treeCfg.density || CONFIG.entities.treeDensity;
        const treesPerChunk = Math.floor(this.chunkSize * this.chunkSize * density);

        for (let i = 0; i < treesPerChunk; i++) {
            const localX = Math.random() * this.chunkSize;
            const localZ = Math.random() * this.chunkSize;
            const worldX = offsetX + localX;
            const worldZ = offsetZ + localZ;

            const biome = this.getBiomeAt(worldX, worldZ);
            if (biome === 'ice' || biome === 'mountain') continue;

            const height = this.getHeightAt(worldX, worldZ);
            const treeHeight = 4 + Math.random() * 6;

            const tree = treeCfg.isCrystal ? this.createCrystal(treeHeight) : this.createTree(treeHeight);
            tree.position.set(worldX, height, worldZ);
            chunk.add(tree);
            chunk.userData.trees.push(tree);
        }
    }

    createTree(height) {
        const tree = new THREE.Group();
        const treeCfg = this.currentBiome?.trees || {};

        const trunkGeom = new THREE.CylinderGeometry(0.2, 0.35, height * 0.4, 5);
        const trunk = new THREE.Mesh(trunkGeom, this._sharedMaterials.trunk);
        trunk.position.y = height * 0.2;
        tree.add(trunk);

        const layers = 3 + Math.floor(Math.random() * 2);

        for (let i = 0; i < layers; i++) {
            const layerHeight = height * 0.3 + (i / layers) * height * 0.6;
            const radius = (1 - i / layers) * height * 0.25 + 0.5;
            const coneHeight = height * 0.25;

            const foliageGeom = new THREE.ConeGeometry(radius, coneHeight, 6);
            const foliage = new THREE.Mesh(foliageGeom, this._sharedMaterials.foliage);
            foliage.position.y = layerHeight;
            tree.add(foliage);
        }

        if (treeCfg.snowCap !== false) {
            const snowGeom = new THREE.ConeGeometry(height * 0.15, height * 0.1, 6);
            const snow = new THREE.Mesh(snowGeom, this._sharedMaterials.snow);
            snow.position.y = height * 0.95;
            tree.add(snow);
        }

        return tree;
    }

    createCrystal(height) {
        const crystal = new THREE.Group();

        const crystalGeom = new THREE.OctahedronGeometry(height * 0.15, 0);

        const count = 1 + Math.floor(Math.random() * 3);
        for (let i = 0; i < count; i++) {
            const shard = new THREE.Mesh(crystalGeom, this._sharedMaterials.crystal);
            shard.position.set(
                (Math.random() - 0.5) * 0.5,
                height * (0.3 + i * 0.25),
                (Math.random() - 0.5) * 0.5
            );
            shard.rotation.set(Math.random(), Math.random(), Math.random());
            shard.scale.setScalar(0.5 + Math.random() * 1.5);
            crystal.add(shard);
        }

        return crystal;
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

        for (let i = 0; i < patches; i++) {
            const size = 0.15 + Math.random() * 0.2;
            const geom = new THREE.SphereGeometry(size, 5, 4);
            geom.scale(1, 0.3, 1);
            const patch = new THREE.Mesh(geom, this._sharedMaterials.lichen);
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
                const sharedMats = new Set(Object.values(this._sharedMaterials));
                chunk.traverse(obj => {
                    if (obj.geometry) obj.geometry.dispose();
                    if (obj.material && !sharedMats.has(obj.material)) obj.material.dispose();
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

window.ChunkManager = ChunkManager;
export { ChunkManager };
