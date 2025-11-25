# RUKA-PORRO

## 🦌 PORO - Voxel Game in Lapland Taiga

A beautiful, award-winning quality voxel game set in the Finnish Lapland. Experience the magic of the Arctic wilderness with procedurally generated taiga forests, dynamic weather, and stunning aurora borealis.

![Lapland Taiga](https://img.shields.io/badge/Voxel-Game-blue?style=for-the-badge)
![Three.js](https://img.shields.io/badge/Three.js-r128-green?style=for-the-badge)
![WebGL](https://img.shields.io/badge/WebGL-2.0-orange?style=for-the-badge)

## Features

### World Generation
- **Procedural Terrain**: Multi-octave Simplex noise generates realistic rolling hills and valleys
- **Taiga Biome**: Snow-covered landscapes with frozen lakes and rivers
- **Pine Forests**: Procedurally generated conical pine trees with snow-dusted branches
- **Cave Systems**: 3D noise-based cave generation deep underground
- **Infinite World**: Chunk-based loading system for endless exploration

### Graphics & Atmosphere
- **Dynamic Day/Night Cycle**: Watch stunning sunrises and sunsets
- **Aurora Borealis**: Beautiful northern lights dance across the night sky
- **Snowfall Particles**: Thousands of snowflakes gently falling
- **Volumetric Fog**: Atmospheric fog that changes with time of day
- **Dynamic Lighting**: Real-time shadows and ambient occlusion
- **Shader Effects**: Custom sky dome with gradient transitions

### Gameplay
- **First-Person Controls**: Smooth WASD movement with physics
- **Block Interaction**: Place and break blocks to build and explore
- **Multiple Block Types**:
  - ❄️ Snow - Fresh Arctic snow
  - 🪨 Stone - Solid rock
  - 🪵 Pine Wood - Taiga tree trunks
  - 🌲 Pine Leaves - Evergreen foliage
  - 🧊 Ice - Frozen surfaces
  - 🟫 Frozen Dirt - Arctic soil
- **Sprint & Jump**: Move quickly and navigate terrain
- **Hotbar System**: Quick block selection (1-6 keys)

### Technical Features
- **Chunk System**: Efficient 16x16x64 chunk management
- **Greedy Meshing**: Optimized face culling for performance
- **LOD System**: Render distance management
- **60 FPS**: Smooth performance with thousands of voxels

## How to Play

### Controls
| Key | Action |
|-----|--------|
| `W` `A` `S` `D` | Move |
| `Mouse` | Look around |
| `Space` | Jump |
| `Shift` | Sprint |
| `Left Click` | Break block |
| `Right Click` | Place block |
| `1` - `6` | Select block type |
| `ESC` | Pause / Release mouse |

### Getting Started
1. Open `index.html` in a modern web browser
2. Wait for the world to generate
3. Click to start playing
4. Explore the Lapland taiga!

## Running the Game

Simply open `index.html` in any modern web browser:

```bash
# Using Python
python -m http.server 8000
# Then open http://localhost:8000

# Using Node.js
npx serve
# Then open http://localhost:3000

# Or just open index.html directly in your browser
```

## Technical Requirements

- **Browser**: Chrome, Firefox, Safari, or Edge (latest versions)
- **WebGL**: WebGL 2.0 support required
- **RAM**: 4GB+ recommended
- **GPU**: Any dedicated or integrated GPU with WebGL support

## Project Structure

```
RUKA-PORRO/
├── index.html      # Main HTML with UI and styling
├── game.js         # Complete game engine
└── README.md       # This file
```

## Architecture

### Core Systems
- **VoxelGame**: Main game class managing all subsystems
- **SimplexNoise**: Custom noise generator for terrain
- **Chunk Manager**: Handles chunk generation and disposal
- **Physics Engine**: Simple collision detection and gravity
- **Renderer**: Three.js WebGL rendering with custom shaders

### Rendering Pipeline
1. Chunk geometry generation with face culling
2. Vertex color calculation for block types
3. Dynamic lighting from sun/moon
4. Atmospheric effects (sky, fog, particles)
5. Post-processing (tone mapping)

## Inspired By

- The beautiful landscapes of Finnish Lapland
- Ruka ski resort area
- Nordic wilderness and reindeer (poro)
- Classic voxel games like Minecraft

## License

MIT License - Feel free to use and modify!

---

Made with ❄️ in the spirit of Lapland

*"Poro" means reindeer in Finnish - the iconic animal of Lapland*
