# RUKA PORRO VOXL - AI EDITION

<div align="center">

![PORO Banner](https://img.shields.io/badge/PORO-Taiga%20Adventure-blue?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0id2hpdGUiIGQ9Ik0xMiAyQzYuNDggMiAyIDYuNDggMiAxMnM0LjQ4IDEwIDEwIDEwIDEwLTQuNDggMTAtMTBTMTcuNTIgMiAxMiAyem0wIDE4Yy00LjQxIDAtOC0zLjU5LTgtOHMzLjU5LTggOC04IDggMy41OSA4IDgtMy41OSA4LTggOHoiLz48L3N2Zz4=)
![Three.js](https://img.shields.io/badge/Three.js-r128-black?style=for-the-badge&logo=three.js)
![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=for-the-badge&logo=node.js)
![Docker](https://img.shields.io/badge/Docker-Ready-blue?style=for-the-badge&logo=docker)
![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)

**A Generative AI Narrative Adventure in Finnish Lapland**

*Experience the mystical taiga through the eyes of a reindeer, meet AI-driven NPCs, and uncover the secrets of the ancient Porro corruption.*

[Play Now](#-quick-start) | [Game Design Document](docs/GAME_DESIGN_DOCUMENT_NL.md) | [Contributing](#-contributing)

</div>

---

## Table of Contents

- [Overview](#-overview)
- [Story & Lore](#-story--lore)
- [Features](#-features)
- [NPCs & Characters](#-npcs--characters)
- [Gameplay Mechanics](#-gameplay-mechanics)
- [Mission Structure](#-mission-structure)
- [Quick Start](#-quick-start)
- [Controls](#-controls)
- [Technical Architecture](#-technical-architecture)
- [Performance Optimizations](#-performance-optimizations)
- [Project Structure](#-project-structure)
- [Development](#-development)
- [API Integration](#-api-integration)
- [Contributing](#-contributing)
- [Credits](#-credits)

---

## Overview

**RUKA PORRO VOXL** is an immersive 3D adventure game set in the breathtaking wilderness of Ruka-Kuusamo, Finnish Lapland. Players take on the role of a young reindeer navigating the taiga forest, interacting with AI-powered NPCs, and uncovering the mysteries of an ancient corruption known as "Porro."

The game combines:
- **Survival mechanics** - Manage health, energy, warmth, and hunger
- **AI-driven narratives** - NPCs with unique personalities powered by LLM technology
- **Dynamic environments** - Day/night cycles, Aurora Borealis, and weather effects
- **Exploration** - A vast 400x400 unit procedurally enhanced world with mountains and valleys

---

## Story & Lore

### The Legend of Porro

In the ancient times of Lapland, the Sami people spoke of **Porro** - a mystical corruption that could possess both land and creature. It manifests as a dark, swirling energy that whispers promises of power while slowly consuming the soul.

### Your Journey

You are a young reindeer (*poro* in Finnish) who begins to sense the Porro corruption awakening in the forest. Through interactions with the inhabitants of the taiga - both friend and foe - you must:

1. **Discover** the source of the corruption
2. **Build alliances** with forest creatures
3. **Resist** the temptation of Porro's power
4. **Save** the taiga from eternal darkness

### The ETHERLINK FORGE Protocol

The game operates on the **ETHERLINK FORGE** protocol - a framework for AI-driven narrative experiences:

```
E - Emergent storytelling through AI
T - Trust-based relationship systems
H - Hierarchical quest structures
E - Environmental storytelling
R - Reactive NPC behaviors
L - Living world simulation
I - Immersive dialogue systems
N - Natural language processing
K - Knowledge persistence

F - Flexible narrative branches
O - Organic character development
R - Reputation mechanics
G - Generative content
E - Emotional AI responses
```

---

## Features

### Core Features

| Feature | Description |
|---------|-------------|
| **3D Voxel World** | Stylized terrain with snow-covered mountains, frozen lakes, and dense pine forests |
| **Dynamic Weather** | Snowfall particles, wind effects, and temperature changes |
| **Day/Night Cycle** | Full 24-hour cycle with sunrise, sunset, and midnight aurora |
| **Aurora Borealis** | Stunning northern lights that appear during clear nights |
| **Survival System** | Four stats to manage: Health, Energy, Warmth, and Hunger |
| **AI NPCs** | 9 unique characters with personality-driven dialogue |
| **Trust System** | Build or lose trust with NPCs based on your choices |
| **Mission System** | 9-mission story arc with branching paths |
| **Porro Corruption** | Dynamic corruption meter affecting gameplay and story |

### Visual Features

- **Procedural terrain** with mountains, hills, and valleys
- **400+ pine trees** with varied sizes and positions
- **60 lichen patches** for food collection
- **6 bird flocks** with animated flight patterns
- **2000 snow particles** creating atmospheric snowfall
- **Dynamic lighting** that changes with time of day
- **Fog effects** for atmospheric depth
- **Minimap** for navigation

---

## NPCs & Characters

The taiga is home to 9 unique characters, each with their own personality, backstory, and relationship to the Porro corruption:

### Friendly NPCs

| Character | Species | Role | Personality |
|-----------|---------|------|-------------|
| **Sieni** | Mushrooms | Mystic Guide | Wise, cryptic, speaks in riddles about the old ways |
| **Sammal** | Magic Moss | Healer | Gentle, nurturing, offers restoration and comfort |
| **Yuki** | White Akita | Guardian | Loyal, protective, a lost dog seeking purpose |
| **Taisto** | Amstaff | Warrior | Brave, direct, fights against the corruption |

### Neutral NPCs

| Character | Species | Role | Personality |
|-----------|---------|------|-------------|
| **Karen** | Crow | Trickster | Mischievous, knowledgeable, trades secrets for shiny objects |
| **Koulu** | Finnish School | Sanctuary | A mysterious green building that offers safety and knowledge |

### Antagonistic NPCs

| Character | Species | Role | Personality |
|-----------|---------|------|-------------|
| **Susi** | Wolf | Predator | Cunning, territorial, corrupted by Porro |
| **Metsastaja** | Hunter | Threat | Silent, methodical, represents human danger |
| **Karhu** | Bear | Boss | Powerful, ancient, the heart of Porro corruption |

### Trust System

Each NPC has a trust level from -100 to +100:

```
-100 to -50  : Hostile (may attack or refuse interaction)
-49 to -1    : Suspicious (limited dialogue options)
0            : Neutral (standard interactions)
1 to 49      : Friendly (bonus dialogue, hints)
50 to 100    : Allied (special quests, items, abilities)
```

---

## Gameplay Mechanics

### Survival Stats

```
Health (100)
├── Decreases when: Warmth < 20, Hunger < 20, attacked
├── Increases when: Eating lichen, resting, Sammal's healing
└── Game Over when: Health reaches 0

Energy (100)
├── Decreases when: Sprinting, jumping, fighting
├── Increases when: Walking, resting, eating
└── Effect when low: Cannot sprint, slower movement

Warmth (100)
├── Decreases when: Night time, blizzards, water
├── Increases when: Day time, near fire, shelter
└── Effect when low: Health drain, slower movement

Hunger (100)
├── Decreases when: Time passes, sprinting, fighting
├── Increases when: Eating lichen (+15 per patch)
└── Effect when low: Energy drain, health drain
```

### Porro Corruption Meter

The Porro corruption (0-100) affects your gameplay:

```
0-20   : Pure - Full stat regeneration, NPCs trust you
21-40  : Touched - Minor visual distortions, some NPCs wary
41-60  : Influenced - Stat penalties, aggressive NPC reactions
61-80  : Corrupted - Major debuffs, many NPCs hostile
81-100 : Consumed - Game becomes survival horror mode
```

### Movement & Actions

- **Walking**: Standard movement, minimal energy cost
- **Sprinting**: 1.8x speed, drains energy
- **Jumping**: Vertical traversal, costs energy
- **Eating**: Press E near lichen to consume (+15 hunger)
- **Interacting**: Press E near NPCs to engage dialogue

---

## Mission Structure

The game features a 9-mission story arc:

### Act I: Awakening
1. **"De Eerste Sneeuw"** (The First Snow) - Tutorial, learn controls, meet Sieni
2. **"Fluisteringen"** (Whispers) - Discover the Porro corruption, find Sammal
3. **"De Verloren Hond"** (The Lost Dog) - Rescue Yuki from the blizzard

### Act II: Alliances
4. **"Kraaienveren"** (Crow Feathers) - Negotiate with Karen for information
5. **"De Oude School"** (The Old School) - Find sanctuary in Koulu
6. **"Wolvensporen"** (Wolf Tracks) - Confront Susi's pack

### Act III: Confrontation
7. **"Jagersmaan"** (Hunter's Moon) - Evade Metsastaja
8. **"Taisto's Laatste Stand"** (Taisto's Last Stand) - Final alliance mission
9. **"Hart van Porro"** (Heart of Porro) - Final boss: Karhu

---

## Quick Start

### Prerequisites

- **Node.js** 18+ or **Docker**
- Modern web browser with WebGL support

### Option 1: Node.js

```bash
# Clone the repository
git clone https://github.com/Maca2024/RUKA-PORRO.git
cd RUKA-PORRO

# Install dependencies
npm install

# Start the server
npm start

# Open in browser
# Navigate to http://localhost:3000
```

### Option 2: Docker

```bash
# Using docker-compose (recommended)
docker-compose up

# Or build manually
docker build -t poro-game .
docker run -p 3000:3000 poro-game
```

### Option 3: Development Mode

```bash
# Install dependencies
npm install

# Run with auto-restart on changes
npm run dev
```

---

## Controls

### Keyboard Controls

| Key | Action |
|-----|--------|
| `W` / `Arrow Up` | Move forward |
| `S` / `Arrow Down` | Move backward |
| `A` / `Arrow Left` | Move left |
| `D` / `Arrow Right` | Move right |
| `Space` | Jump |
| `Shift` | Sprint (hold) |
| `E` | Eat lichen / Interact with NPC |

### Mouse Controls

| Action | Effect |
|--------|--------|
| Move mouse | Look around (when cursor locked) |
| Scroll wheel | Zoom in/out camera |
| Left click | Lock cursor to game |
| `Escape` | Unlock cursor |

### Camera System

The game features a third-person camera that:
- Follows the player smoothly
- Can be zoomed from 5 to 30 units distance
- Orbits around the player with mouse movement
- Has collision detection with terrain

---

## Technical Architecture

### Technology Stack

```
Frontend:
├── Three.js r128 (3D rendering)
├── HTML5 Canvas (minimap)
├── CSS3 (UI styling)
└── Vanilla JavaScript (game logic)

Backend:
├── Node.js 18+
├── Express.js (static file serving)
└── Docker (containerization)

Future Integrations:
├── OpenAI GPT-4 (NPC dialogue generation)
├── ElevenLabs (voice synthesis)
└── LangChain (conversation memory)
```

### Game Architecture

```
PoroGame (Main Class)
├── Scene Management
│   ├── THREE.Scene
│   ├── THREE.PerspectiveCamera
│   └── THREE.WebGLRenderer
├── World Generation
│   ├── createTerrain()      - PlaneGeometry with vertex displacement
│   ├── createTrees()        - 400 procedurally placed trees
│   ├── createLichen()       - 60 collectible food sources
│   ├── createSnowParticles() - 2000 particle snow system
│   ├── createAurora()       - Animated northern lights
│   └── createBirds()        - 6 animated bird flocks
├── NPC System
│   ├── createNPCs()         - Initialize all 9 characters
│   ├── updateNPCBehavior()  - AI movement and reactions
│   └── handleDialogue()     - Conversation system
├── Player Systems
│   ├── updatePlayerMovement() - Physics and controls
│   ├── updateStats()        - Survival stat management
│   └── updateCamera()       - Third-person camera
└── Game Loop
    ├── animate()            - Main render loop
    ├── updateWorld()        - Day/night, weather
    └── checkObjectives()    - Mission progress
```

---

## Performance Optimizations

The game has been heavily optimized for smooth performance:

### Terrain Optimization

**Before (Voxel-based):**
```javascript
// Created ~90,000 individual cube meshes
for (x = 0; x < 300; x++) {
    for (z = 0; z < 300; z++) {
        scene.add(new THREE.Mesh(cubeGeometry, material));
    }
}
// Result: Thousands of draw calls, browser freeze
```

**After (Optimized):**
```javascript
// Single PlaneGeometry with vertex displacement
const geometry = new THREE.PlaneGeometry(400, 400, 64, 64);
// Displace vertices for mountains/hills
// Apply vertex colors for variation
// Result: 1 draw call for terrain
```

### Object Count Optimization

| Object | Original | Optimized | Reduction |
|--------|----------|-----------|-----------|
| Terrain meshes | ~90,000 | 1 | 99.99% |
| Tree complexity | 20 segments | 6 segments | 70% |
| Snow particles | 10,000 | 2,000 | 80% |
| Bird geometry | 12 segments | 5 segments | 58% |

### Rendering Optimizations

```javascript
// Limit pixel ratio for high-DPI displays
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Use fog to hide draw distance
scene.fog = new THREE.Fog(0x87CEEB, 50, 180);

// Efficient particle systems using Points
const snow = new THREE.Points(geometry, pointsMaterial);

// BufferGeometry for all dynamic objects
const geometry = new THREE.BufferGeometry();
```

---

## Project Structure

```
RUKA-PORRO/
├── public/
│   ├── index.html          # Game UI, styles, and structure
│   └── game.js             # Main game engine (1300+ lines)
├── src/
│   └── server.js           # Express static file server
├── docs/
│   └── GAME_DESIGN_DOCUMENT_NL.md  # Full design doc (Dutch)
├── Dockerfile              # Container configuration
├── docker-compose.yml      # Container orchestration
├── package.json            # NPM dependencies
├── package-lock.json       # Locked dependencies
├── CONTEXT.md              # Development context and notes
├── GAME_CONCEPT.md         # Original game concept
└── README.md               # This file
```

### Key Files Explained

#### `public/game.js`
The heart of the game - a 1300+ line JavaScript file containing:
- `PoroGame` class with full game logic
- Terrain generation with vertex displacement
- NPC creation and behavior systems
- Player controls and physics
- Survival stat management
- Day/night cycle and weather
- Dialogue system framework
- Minimap rendering

#### `public/index.html`
The game's single-page application:
- Loading screen with progress animation
- HUD with stat bars (health, energy, warmth, hunger)
- Objectives panel
- Controls reference
- Minimap canvas
- Message display system

#### `docs/GAME_DESIGN_DOCUMENT_NL.md`
Comprehensive design document (in Dutch) covering:
- Full narrative design
- Character profiles and dialogue trees
- Mission specifications
- Technical requirements
- AI integration plans

---

## Development

### Local Development

```bash
# Install dependencies
npm install

# Run development server with auto-restart
npm run dev

# The game will be available at http://localhost:3000
```

### Modifying the Game

#### Adding a New NPC

```javascript
// In game.js, inside createNPCs() method
const newNPC = new THREE.Group();
newNPC.name = 'NPCName';
newNPC.userData = {
    type: 'friendly', // or 'neutral', 'hostile'
    dialogue: [
        "First dialogue line",
        "Second dialogue line"
    ],
    trust: 0,
    zone: 'forest' // spawn zone
};

// Add mesh components
const body = new THREE.Mesh(geometry, material);
newNPC.add(body);

// Position and add to scene
newNPC.position.set(x, y, z);
this.scene.add(newNPC);
this.npcs.push(newNPC);
```

#### Modifying Terrain

```javascript
// In createTerrain() method
// Add a new mountain:
const mountains = [
    { x: 0, z: -80, radius: 40, height: 25 },
    // Add your mountain here:
    { x: 100, z: 50, radius: 30, height: 20 }
];
```

#### Adding New Objectives

```javascript
// In updateObjectives() method
if (condition) {
    document.getElementById('obj-new').classList.add('completed');
    this.showMessage('New objective completed!');
}
```

### Building for Production

```bash
# Build Docker image
docker build -t poro-game:latest .

# Run production container
docker run -d -p 3000:3000 --name poro poro-game:latest
```

---

## API Integration

### Planned AI Integrations

#### OpenAI GPT-4 for Dialogue

```javascript
// Future implementation
async generateNPCResponse(npc, playerInput) {
    const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
            { role: "system", content: npc.personality },
            { role: "user", content: playerInput }
        ],
        max_tokens: 150
    });
    return response.choices[0].message.content;
}
```

#### ElevenLabs Voice Synthesis

```javascript
// Future implementation
async speakDialogue(text, voiceId) {
    const audio = await elevenlabs.textToSpeech({
        text: text,
        voice_id: voiceId,
        model_id: "eleven_multilingual_v2"
    });
    this.audioPlayer.play(audio);
}
```

### Current Dialogue System

The game currently uses a static dialogue system that can be extended:

```javascript
// Current implementation in game.js
npc.userData.dialogue = [
    "Welkom, jonge poro...",
    "De taiga spreekt tot wie luistert.",
    "Pas op voor de Porro corruptie..."
];
```

---

## Contributing

We welcome contributions! Here's how to get started:

### Reporting Issues

1. Check existing issues first
2. Use the issue template
3. Include browser/OS information
4. Attach console logs if applicable

### Submitting Changes

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test thoroughly
5. Commit with clear messages (`git commit -m 'Add amazing feature'`)
6. Push to your fork (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Code Style

- Use ES6+ JavaScript features
- Comment complex logic
- Follow existing naming conventions
- Keep functions focused and small

---

## Credits

### Development

- **Game Design & Development**: RUKA-PORRO Team
- **AI Assistance**: Claude (Anthropic)

### Inspiration

- **Minecraft** - Voxel aesthetics and survival mechanics
- **Veloren** - Open world exploration
- **Finnish Lapland** - Setting and atmosphere
- **Sami Culture** - Reindeer (poro) significance

### Assets

- **Three.js** - 3D rendering engine
- **Express.js** - Web server framework

### Special Thanks

- The Sami people for their rich cultural heritage
- Finnish Lapland for its magical landscapes
- The open-source community

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**RUKA PORRO VOXL - AI EDITION**

*Where Ancient Legends Meet Modern Gaming*

Made with love in Finnish Lapland

[Play Now](http://localhost:3000) | [Report Bug](https://github.com/Maca2024/RUKA-PORRO/issues) | [Request Feature](https://github.com/Maca2024/RUKA-PORRO/issues)

</div>
