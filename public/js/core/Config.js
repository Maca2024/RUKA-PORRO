/**
 * AI Academy - Game Configuration
 * Central config for all game systems
 */

const CONFIG = {
    world: {
        size: 4000,
        chunkSize: 64,
        loadRadius: 3,
        lodDistances: [64, 192, 320]
    },
    terrain: {
        baseHeight: 0,
        mountainCount: 25,
        hillCount: 40,
        lakeCount: 8
    },
    entities: {
        treeDensity: 0.003,
        lichenDensity: 0.0005,
        birdFlocks: 20
    },
    player: {
        walkSpeed: 14,
        sprintSpeed: 26,
        jumpForce: 14
    },
    // AI Academy specific
    academy: {
        portalActivationThreshold: 0.8, // 80% completion to unlock portal
        maxStars: 5,
        xpPerStar: 20,
        xpPerChallenge: 50,
        xpPerBoss: 200,
        xpPerLevel: [0, 100, 250, 500, 800, 1200, 1700, 2300, 3000, 4000, 5000],
        totalWorlds: 10,
        mvpWorlds: 4,
        challengesPerWorld: 5,
    }
};

window.CONFIG = CONFIG;
