/**
 * AI Academy - Biome Configuration
 * Defines terrain, colors, and features for each of the 10 worlds
 */

const BIOME_CONFIGS = {
    // World 1: The Awakening - Snowy meadow (tutorial)
    1: {
        name: 'awakening',
        terrain: {
            mountainCount: 8,
            hillCount: 15,
            lakeCount: 3,
            baseHeight: 0,
            noiseScale: 0.008,
            maxHeight: 25
        },
        colors: {
            ground: { r: 0.95, g: 0.97, b: 1.0 },       // Snow white
            hills: { r: 0.9, g: 0.93, b: 0.96 },          // Light snow
            mountain: { r: 0.5, g: 0.5, b: 0.55 },        // Rocky grey
            ice: { r: 0.7, g: 0.85, b: 0.95 },            // Frozen blue
            forest: { r: 0.88, g: 0.92, b: 0.95 },        // Snowy forest
        },
        trees: {
            density: 0.003,
            trunkColor: 0x4a3728,
            foliageColor: 0x1a4a1a,
            snowCap: true
        },
        sky: {
            dayColor: 0x87CEEB,
            nightColor: 0x0a0a1a,
            fogColor: 0xc8d8e8,
            fogNear: 100,
            fogFar: 400
        },
        weather: {
            snowIntensity: 1.0,
            windStrength: 0.3,
            hasAurora: true
        },
        ambient: {
            music: 'peaceful_snow',
            sfx: ['wind', 'birds', 'crunch']
        }
    },

    // World 2: The Prompt Forge - Volcanic workshop
    2: {
        name: 'prompt_forge',
        terrain: {
            mountainCount: 12,
            hillCount: 20,
            lakeCount: 4, // Lava lakes
            baseHeight: 2,
            noiseScale: 0.01,
            maxHeight: 40
        },
        colors: {
            ground: { r: 0.25, g: 0.18, b: 0.15 },       // Dark volcanic
            hills: { r: 0.35, g: 0.22, b: 0.15 },         // Brown rock
            mountain: { r: 0.2, g: 0.15, b: 0.12 },       // Dark mountain
            ice: { r: 0.9, g: 0.3, b: 0.1 },              // Lava (replaces ice)
            forest: { r: 0.3, g: 0.2, b: 0.15 },          // Volcanic soil
        },
        trees: {
            density: 0.001,
            trunkColor: 0x2a1a0a,
            foliageColor: 0x3a1a0a,
            snowCap: false
        },
        sky: {
            dayColor: 0x8B4513,
            nightColor: 0x1a0505,
            fogColor: 0x4a2a1a,
            fogNear: 80,
            fogFar: 300
        },
        weather: {
            snowIntensity: 0,
            windStrength: 0.1,
            hasAurora: false,
            embers: true
        },
        ambient: {
            music: 'forge_drums',
            sfx: ['lava_bubble', 'hammering', 'fire_crackle']
        }
    },

    // World 3: Context Caverns - Crystal caves
    3: {
        name: 'context_caverns',
        terrain: {
            mountainCount: 20,
            hillCount: 30,
            lakeCount: 6,
            baseHeight: -5,
            noiseScale: 0.012,
            maxHeight: 50
        },
        colors: {
            ground: { r: 0.15, g: 0.12, b: 0.25 },       // Dark purple
            hills: { r: 0.2, g: 0.15, b: 0.35 },          // Deep violet
            mountain: { r: 0.25, g: 0.2, b: 0.4 },        // Crystal purple
            ice: { r: 0.4, g: 0.6, b: 0.9 },              // Crystal blue pools
            forest: { r: 0.18, g: 0.15, b: 0.3 },         // Cave floor
        },
        trees: {
            density: 0.0005,
            trunkColor: 0x6040a0,
            foliageColor: 0x8060c0, // Crystal formations
            snowCap: false,
            isCrystal: true
        },
        sky: {
            dayColor: 0x1a1a3a,
            nightColor: 0x0a0a1a,
            fogColor: 0x151530,
            fogNear: 40,
            fogFar: 200
        },
        weather: {
            snowIntensity: 0,
            windStrength: 0,
            hasAurora: false,
            sparkles: true
        },
        ambient: {
            music: 'crystal_echoes',
            sfx: ['drip', 'echo', 'crystal_hum']
        }
    },

    // World 4: Few-Shot Fields - Farmland
    4: {
        name: 'fewshot_fields',
        terrain: {
            mountainCount: 5,
            hillCount: 25,
            lakeCount: 4,
            baseHeight: 0,
            noiseScale: 0.006,
            maxHeight: 15
        },
        colors: {
            ground: { r: 0.45, g: 0.6, b: 0.25 },        // Green grass
            hills: { r: 0.55, g: 0.5, b: 0.3 },           // Golden wheat
            mountain: { r: 0.4, g: 0.45, b: 0.35 },       // Distant hills
            ice: { r: 0.3, g: 0.5, b: 0.7 },              // Ponds
            forest: { r: 0.35, g: 0.55, b: 0.2 },         // Fertile ground
        },
        trees: {
            density: 0.001,
            trunkColor: 0x5a4030,
            foliageColor: 0x4a8a2a,
            snowCap: false
        },
        sky: {
            dayColor: 0x87CEEB,
            nightColor: 0x0a0a2a,
            fogColor: 0xb8d8c8,
            fogNear: 120,
            fogFar: 500
        },
        weather: {
            snowIntensity: 0,
            windStrength: 0.5,
            hasAurora: false,
            butterflies: true
        },
        ambient: {
            music: 'pastoral',
            sfx: ['birds', 'wind_grass', 'crickets']
        }
    },

    // World 5: Chain of Thought Mountains
    5: {
        name: 'thought_mountains',
        terrain: {
            mountainCount: 30,
            hillCount: 10,
            lakeCount: 2,
            baseHeight: 5,
            noiseScale: 0.015,
            maxHeight: 60
        },
        colors: {
            ground: { r: 0.55, g: 0.5, b: 0.45 },
            hills: { r: 0.6, g: 0.55, b: 0.5 },
            mountain: { r: 0.8, g: 0.8, b: 0.85 },
            ice: { r: 0.6, g: 0.75, b: 0.85 },
            forest: { r: 0.3, g: 0.4, b: 0.25 },
        },
        trees: { density: 0.002, trunkColor: 0x4a3728, foliageColor: 0x2a5a2a, snowCap: true },
        sky: { dayColor: 0x6BA5D7, nightColor: 0x0a0a2a, fogColor: 0xa8c8e8, fogNear: 60, fogFar: 350 },
        weather: { snowIntensity: 0.5, windStrength: 0.8, hasAurora: true },
        ambient: { music: 'mountain_wind', sfx: ['wind', 'eagle', 'rocks'] }
    },

    // World 6: RAG Ruins - Library ruins
    6: {
        name: 'rag_ruins',
        terrain: {
            mountainCount: 10,
            hillCount: 20,
            lakeCount: 3,
            baseHeight: 0,
            noiseScale: 0.008,
            maxHeight: 20
        },
        colors: {
            ground: { r: 0.5, g: 0.45, b: 0.35 },
            hills: { r: 0.55, g: 0.5, b: 0.4 },
            mountain: { r: 0.6, g: 0.55, b: 0.45 },
            ice: { r: 0.3, g: 0.45, b: 0.5 },
            forest: { r: 0.4, g: 0.42, b: 0.32 },
        },
        trees: { density: 0.001, trunkColor: 0x5a4a3a, foliageColor: 0x3a4a2a, snowCap: false },
        sky: { dayColor: 0x9BA5A0, nightColor: 0x0a0a1a, fogColor: 0x8a9590, fogNear: 80, fogFar: 300 },
        weather: { snowIntensity: 0, windStrength: 0.2, hasAurora: false, dustMotes: true },
        ambient: { music: 'ancient_library', sfx: ['pages', 'whispers', 'stone'] }
    },

    // World 7: Fine-Tune Factory - Steampunk
    7: {
        name: 'finetune_factory',
        terrain: {
            mountainCount: 8,
            hillCount: 15,
            lakeCount: 2,
            baseHeight: 1,
            noiseScale: 0.008,
            maxHeight: 20
        },
        colors: {
            ground: { r: 0.35, g: 0.3, b: 0.28 },
            hills: { r: 0.4, g: 0.35, b: 0.3 },
            mountain: { r: 0.45, g: 0.4, b: 0.35 },
            ice: { r: 0.3, g: 0.35, b: 0.25 },  // Toxic pools
            forest: { r: 0.3, g: 0.28, b: 0.25 },
        },
        trees: { density: 0.0005, trunkColor: 0x4a4040, foliageColor: 0x605050, snowCap: false },
        sky: { dayColor: 0x7A7A6A, nightColor: 0x0a0a0a, fogColor: 0x5a5a4a, fogNear: 60, fogFar: 250 },
        weather: { snowIntensity: 0, windStrength: 0.1, hasAurora: false, steam: true },
        ambient: { music: 'factory_rhythms', sfx: ['gears', 'steam', 'whistles'] }
    },

    // World 8: Agent Arena - Futuristic colosseum
    8: {
        name: 'agent_arena',
        terrain: {
            mountainCount: 6,
            hillCount: 10,
            lakeCount: 2,
            baseHeight: 0,
            noiseScale: 0.006,
            maxHeight: 15
        },
        colors: {
            ground: { r: 0.2, g: 0.25, b: 0.35 },
            hills: { r: 0.25, g: 0.3, b: 0.4 },
            mountain: { r: 0.3, g: 0.35, b: 0.45 },
            ice: { r: 0.1, g: 0.4, b: 0.6 },  // Energy pools
            forest: { r: 0.18, g: 0.22, b: 0.3 },
        },
        trees: { density: 0.0003, trunkColor: 0x3a3a5a, foliageColor: 0x2a2a4a, snowCap: false },
        sky: { dayColor: 0x2A3A5A, nightColor: 0x050510, fogColor: 0x1a2a3a, fogNear: 80, fogFar: 350 },
        weather: { snowIntensity: 0, windStrength: 0.2, hasAurora: false, holographicParticles: true },
        ambient: { music: 'digital_arena', sfx: ['electric', 'crowd', 'beeps'] }
    },

    // World 9: Ethics Citadel - Marble
    9: {
        name: 'ethics_citadel',
        terrain: {
            mountainCount: 10,
            hillCount: 12,
            lakeCount: 4,
            baseHeight: 2,
            noiseScale: 0.007,
            maxHeight: 25
        },
        colors: {
            ground: { r: 0.85, g: 0.82, b: 0.78 },
            hills: { r: 0.9, g: 0.87, b: 0.83 },
            mountain: { r: 0.95, g: 0.93, b: 0.9 },
            ice: { r: 0.6, g: 0.7, b: 0.8 },
            forest: { r: 0.8, g: 0.78, b: 0.72 },
        },
        trees: { density: 0.001, trunkColor: 0x8a7a6a, foliageColor: 0x5a7a5a, snowCap: false },
        sky: { dayColor: 0xE8E0D8, nightColor: 0x1a1520, fogColor: 0xd8d0c8, fogNear: 100, fogFar: 400 },
        weather: { snowIntensity: 0, windStrength: 0.15, hasAurora: false, goldenMotes: true },
        ambient: { music: 'marble_halls', sfx: ['fountains', 'bells', 'echoes'] }
    },

    // World 10: Final Integration - All biomes shifting
    10: {
        name: 'final_integration',
        terrain: {
            mountainCount: 20,
            hillCount: 30,
            lakeCount: 6,
            baseHeight: 0,
            noiseScale: 0.01,
            maxHeight: 40
        },
        colors: {
            ground: { r: 0.5, g: 0.5, b: 0.5 },
            hills: { r: 0.6, g: 0.6, b: 0.6 },
            mountain: { r: 0.7, g: 0.7, b: 0.7 },
            ice: { r: 0.5, g: 0.6, b: 0.8 },
            forest: { r: 0.45, g: 0.5, b: 0.45 },
        },
        trees: { density: 0.002, trunkColor: 0x4a3728, foliageColor: 0x2a5a2a, snowCap: true },
        sky: { dayColor: 0x87CEEB, nightColor: 0x0a0a1a, fogColor: 0xa8b8c8, fogNear: 80, fogFar: 350 },
        weather: { snowIntensity: 0.3, windStrength: 0.4, hasAurora: true, shifting: true },
        ambient: { music: 'epic_finale', sfx: ['all'] }
    }
};

window.BIOME_CONFIGS = BIOME_CONFIGS;
export { BIOME_CONFIGS };
