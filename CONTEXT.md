# RUKA PORRO VOXL - Development Context

This document provides comprehensive context for developers, contributors, and AI assistants working on the RUKA PORRO VOXL project.

---

## Project Overview

### What is RUKA PORRO VOXL?

RUKA PORRO VOXL is a browser-based 3D adventure game built with Three.js. The player controls a reindeer (poro in Finnish) exploring the taiga wilderness of Finnish Lapland. The game combines survival mechanics, AI-driven narrative, and atmospheric exploration.

### Project Origins

- **Initial Concept**: A voxel-style game inspired by Minecraft and Veloren
- **Setting**: Ruka-Kuusamo region of Finnish Lapland
- **Cultural Inspiration**: Sami reindeer herding traditions
- **Development Approach**: AI-assisted rapid development

### Current State

The game is fully playable with:
- Massive 4000x4000 procedurally generated world
- Complete terrain with mountains, hills, lakes, and forests
- 9 NPCs with AI-powered dialogue systems (Anthropic Claude, Google Gemini)
- Survival mechanics (health, energy, warmth, hunger)
- Day/night cycle with Aurora Borealis
- Weather effects (snow particles)
- Advanced third-person camera with 3 modes (Orbit, Cinematic, First Person)
- Environmental audio (wind, water, bird sounds)
- Animated Poro character with moving legs and cute eyes
- Minimap navigation
- Voice input support for NPC dialogue

---

## Technical Context

### Architecture Decisions

#### Why Three.js?

- Browser-native, no plugins required
- Large community and documentation
- Suitable for stylized 3D graphics
- CDN availability (no build step required)

#### Why Express.js?

- Minimal server requirements (static file serving)
- Easy Docker containerization
- Familiar to Node.js developers
- No complex backend needed for current features

#### Why Single-File Game Engine?

The entire game logic is in `public/game.js` (~1300 lines) because:
- Simplicity for rapid development
- No build/bundling complexity
- Easy to understand and modify
- Suitable for the current scope

### Performance Journey

The game went through significant performance optimization:

**Version 1 (Voxel-based):**
```
- Created individual cube meshes for terrain
- ~90,000 draw calls
- Result: Browser freeze on most systems
```

**Version 2 (Optimized):**
```
- Single PlaneGeometry with vertex displacement
- ~500 draw calls
- Result: Smooth 60fps on most systems
```

### Key Technical Constraints

1. **No Build Step**: Game must work with direct script loading
2. **CDN Dependencies**: Three.js loaded from CDN
3. **Single Page**: All UI in index.html
4. **Client-Side Only**: No server-side game logic
5. **WebGL Required**: Modern browser with WebGL support

---

## Code Organization

### Main Classes and Functions

```
PoroGame (class)
├── constructor()           - Initialize all properties
├── init()                  - Set up Three.js scene
├──
├── World Creation:
│   ├── createTerrain()     - PlaneGeometry with vertex displacement
│   ├── createTrees()       - 400 procedural trees
│   ├── createLichen()      - 60 collectible items
│   ├── createNPCs()        - 9 character entities
│   ├── createSnowParticles() - Weather system
│   ├── createAurora()      - Northern lights effect
│   └── createBirds()       - Animated bird flocks
│
├── Player Systems:
│   ├── createReindeer()    - Player model
│   ├── updatePlayerMovement() - Physics and input
│   ├── updateStats()       - Survival mechanics
│   └── updateCamera()      - Third-person camera
│
├── NPC Systems:
│   ├── updateNPCBehavior() - AI movement
│   └── Dialogue methods    - Conversation handling
│
├── World Systems:
│   ├── updateDayNight()    - Time cycle
│   ├── updateWeather()     - Snow and effects
│   └── updateAurora()      - Northern lights animation
│
└── Game Loop:
    ├── animate()           - Main render loop
    ├── updateMinimap()     - Navigation map
    └── checkObjectives()   - Mission tracking
```

### Important Code Patterns

#### Terrain Height Calculation
```javascript
getTerrainHeight(x, z) {
    // Mountains contribute height based on distance
    for (const mt of this.mountains) {
        const dist = Math.sqrt((x - mt.x) ** 2 + (z - mt.z) ** 2);
        if (dist < mt.radius) {
            height += mt.height * (1 - dist / mt.radius) ** 2;
        }
    }
    // Hills add smaller variations
    // Base terrain adds noise
    return height;
}
```

#### NPC Data Structure
```javascript
npc.userData = {
    type: 'friendly' | 'neutral' | 'hostile',
    dialogue: string[],
    trust: number,        // -100 to 100
    zone: string,         // Spawn area identifier
    behavior: string      // 'wander', 'patrol', 'static'
}
```

#### Survival Stat Updates
```javascript
updateStats(delta) {
    // Hunger decreases over time
    this.stats.hunger -= 0.5 * delta;

    // Warmth affected by day/night
    if (this.isNight) {
        this.stats.warmth -= 1.5 * delta;
    } else {
        this.stats.warmth += 0.5 * delta;
    }

    // Health affected by critical stats
    if (this.stats.warmth < 20 || this.stats.hunger < 20) {
        this.stats.health -= 1 * delta;
    }
}
```

---

## NPCs Deep Dive

### Character Design Philosophy

Each NPC serves a narrative and mechanical purpose:

| NPC | Narrative Role | Mechanical Role |
|-----|----------------|-----------------|
| Sieni | Exposition | Tutorial hints |
| Sammal | Healing | Health restoration |
| Yuki | Companion | Protection buff |
| Taisto | Ally | Combat assistance |
| Karen | Information | Quest hints |
| Koulu | Sanctuary | Safe zone |
| Susi | Threat | Danger element |
| Metsastaja | Fear | Stealth challenge |
| Karhu | Boss | End-game challenge |

### NPC Positioning

NPCs are placed in specific zones:
```
North: Karhu (Bear) - Boss area, mountainous
East: Susi (Wolf) - Wolf territory, forest edge
West: Koulu (School) - Safe zone, clearing
South: Metsastaja (Hunter) - Human threat area
Center: Friendly NPCs - Starting area proximity
```

### Trust System Details

Trust affects:
- Available dialogue options
- NPC behavior (approach vs flee)
- Quest availability
- Special abilities/items

Trust changes through:
- Dialogue choices (+/- 5-20)
- Completing quests (+10-30)
- Attacking NPCs (-50)
- Time spent nearby (+1 per minute)

---

## Game Design Decisions

### Why Survival Mechanics?

- Creates urgency and purpose
- Encourages exploration (find food)
- Adds tension during night
- Provides measurable progress

### Why Day/Night Cycle?

- Visual variety
- Gameplay variety (night is dangerous)
- Aurora Borealis as reward
- Ties to Finnish Lapland setting

### Why Third-Person Camera?

- See the reindeer character
- Better spatial awareness
- More cinematic feel
- Easier terrain navigation

### Why No Combat System (Yet)?

- Focus on exploration first
- Survival is the challenge
- Dialogue over violence
- Can be added later

---

## Known Limitations

### Current Limitations

1. **No Save System**: Game resets on refresh
2. **Single Biome**: Only snow/taiga environment
3. **No Multiplayer**: Single-player only
4. **API Keys Required**: AI dialogue features need Anthropic/Gemini/ElevenLabs API keys in .env file

### Technical Debt

1. **Monolithic game.js**: Could benefit from modules
2. **No State Management**: Direct property mutation
3. **Hardcoded Values**: Magic numbers in code
4. **No Tests**: Manual testing only
5. **No TypeScript**: Plain JavaScript

### Browser Compatibility

- **Tested**: Chrome 90+, Firefox 88+, Edge 90+
- **Requires**: WebGL 2.0 support
- **Mobile**: Not optimized, may work on tablets
- **Performance**: Varies with GPU capability

---

## Future Development

### Planned Features

#### Phase 1: Polish
- [ ] Sound effects and music
- [ ] Particle effects for interactions
- [ ] Screen shake and juice
- [ ] Loading progress indicator

#### Phase 2: AI Integration
- [ ] GPT-4 powered NPC dialogue
- [ ] ElevenLabs voice synthesis
- [ ] Dynamic quest generation
- [ ] Personality-based responses

#### Phase 3: Content
- [ ] More NPCs and quests
- [ ] Additional biomes
- [ ] Crafting system
- [ ] Shelter building

#### Phase 4: Technical
- [ ] Save/load system
- [ ] Settings menu
- [ ] Performance modes
- [ ] Mobile optimization

### AI Integration Plans

The ETHERLINK FORGE protocol outlines AI integration:

```javascript
// Future dialogue system
class AIDialogueSystem {
    async generateResponse(npc, playerInput) {
        const context = {
            npcPersonality: npc.personality,
            trustLevel: npc.trust,
            currentMission: game.currentMission,
            playerStats: game.stats,
            conversationHistory: this.getHistory(npc)
        };

        return await openai.chat.completions.create({
            model: "gpt-4",
            messages: this.buildPrompt(context, playerInput)
        });
    }
}
```

---

## Development Guidelines

### Code Style

```javascript
// Use descriptive names
const terrainHeight = this.getTerrainHeight(x, z);

// Group related logic
// === PLAYER MOVEMENT ===
updatePlayerMovement(delta) { ... }

// Comment non-obvious code
// Smooth camera follow using lerp
this.camera.position.lerp(targetPosition, 0.1);

// Use constants for magic numbers
const SPRINT_MULTIPLIER = 1.8;
const HUNGER_DECAY_RATE = 0.5;
```

### Adding Features

1. **Plan the feature** - What does it do? How does it fit?
2. **Find the right place** - Which method/section?
3. **Implement minimally** - Start simple, iterate
4. **Test thoroughly** - Check performance impact
5. **Document** - Update this file if significant

### Common Tasks

#### Adding a New NPC
1. Add creation code in `createNPCs()`
2. Define `userData` with dialogue
3. Position appropriately
4. Add to `this.npcs` array

#### Modifying Terrain
1. Adjust mountains/hills arrays in `createTerrain()`
2. Update `getTerrainHeight()` if needed
3. Test NPC/player positioning

#### Adding UI Elements
1. Add HTML in `index.html`
2. Style with CSS
3. Update via JavaScript in game methods

---

## Environment Setup

### Prerequisites

```bash
# Node.js (recommended: use nvm)
nvm install 18
nvm use 18

# Verify installation
node --version  # Should be 18.x
npm --version   # Should be 9.x or 10.x
```

### Running Locally

```bash
# Clone repository
git clone https://github.com/Maca2024/RUKA-PORRO.git
cd RUKA-PORRO

# Install dependencies
npm install

# Start development server
npm run dev

# Or start production server
npm start
```

### Docker Development

```bash
# Build and run
docker-compose up --build

# Run in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

---

## Debugging Tips

### Common Issues

**Game won't load:**
- Check browser console for errors
- Verify Three.js CDN is accessible
- Check WebGL support: `about:support` (Firefox) or `chrome://gpu` (Chrome)

**Poor performance:**
- Reduce `treeCount` in `createTrees()`
- Lower snow particle count
- Check for geometry leaks (meshes not being disposed)

**NPC not appearing:**
- Check position (might be underground or far away)
- Verify added to `this.npcs` array
- Check `scene.add()` was called

**Terrain holes:**
- Check `getTerrainHeight()` logic
- Verify mountain/hill arrays
- Check for NaN in calculations

### Debug Mode

Add to `game.js` for debugging:
```javascript
// Show FPS
const stats = new Stats();
document.body.appendChild(stats.dom);

// In animate():
stats.update();

// Show wireframe
material.wireframe = true;

// Log player position
console.log(this.player.position);
```

---

## File Manifest

```
RUKA-PORRO/
├── public/
│   ├── index.html      # 262 lines - UI and structure
│   └── game.js         # 1298 lines - Game engine
├── src/
│   └── server.js       # 15 lines - Express server
├── docs/
│   └── GAME_DESIGN_DOCUMENT_NL.md  # Full Dutch design doc
├── Dockerfile          # Node 18 Alpine container
├── docker-compose.yml  # Container orchestration
├── .dockerignore       # Docker build exclusions
├── package.json        # NPM configuration
├── package-lock.json   # Locked dependencies
├── CONTEXT.md          # This file
├── GAME_CONCEPT.md     # Original concept
└── README.md           # Main documentation
```

---

## Contact & Resources

### Repository
https://github.com/Maca2024/RUKA-PORRO

### Dependencies Documentation
- Three.js: https://threejs.org/docs/
- Express.js: https://expressjs.com/
- Docker: https://docs.docker.com/

### Cultural References
- Finnish Lapland: https://www.visitfinland.com/lapland/
- Sami Culture: https://www.samiculture.com/
- Reindeer (Poro): https://reindeerherding.org/

---

*Last Updated: January 2026*
*Version: 3.0 (AI Edition with Advanced Controls)*
