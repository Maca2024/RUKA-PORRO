# RUKA-PORRO

A Lapland Taiga Voxel Game - Explore the snowy Finnish wilderness!

## About

RUKA-PORRO is a voxel-based exploration game set in the beautiful Lapland taiga biome. Navigate through snowy landscapes, dense pine forests, frozen lakes, and arctic terrain. Build and shape the world around you while experiencing the peaceful atmosphere of Finnish Lapland.

## Features

- **Procedural World Generation** - Infinite snowy terrain with realistic height maps
- **Lapland Taiga Biome** - Snow-covered ground, pine forests, frozen lakes, rocky outcrops
- **Block System** - 11 unique block types including snow, ice, pine trees, reindeer lichen
- **First-Person Controls** - Smooth movement, jumping, sprinting, and mouse look
- **Block Interaction** - Break and place blocks to shape your world
- **Dynamic Chunk Loading** - Efficient chunk-based world management
- **Atmospheric Effects** - Fog and arctic sky ambiance

## Block Types

1. Snow - Fresh white snow cover
2. Frozen Dirt - Permafrost soil
3. Stone - Rocky terrain
4. Pine Log - Tree trunks
5. Pine Leaves - Coniferous foliage
6. Ice - Frozen lake surfaces
7. Frozen Water - Under-ice water
8. Moss - Ground cover
9. Berry Bush - Arctic berries
10. Reindeer Lichen - Traditional reindeer food

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/RUKA-PORRO.git
cd RUKA-PORRO

# Create virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the game
python main.py
```

## Requirements

- Python 3.8+
- Ursina Engine 7.0+
- noise (Perlin noise library)
- numpy

## Controls

| Key | Action |
|-----|--------|
| W/A/S/D | Move forward/left/backward/right |
| Mouse | Look around |
| Space | Jump |
| Shift | Sprint |
| Left Click | Break block |
| Right Click | Place block |
| 1-9 | Select block type |
| F | Toggle fog |
| P | Toggle debug info |
| ESC | Toggle mouse lock |
| Q | Quit game |

## Project Structure

```
RUKA-PORRO/
├── main.py              # Game entry point
├── requirements.txt     # Python dependencies
├── src/
│   ├── __init__.py
│   ├── blocks.py        # Block types and properties
│   ├── voxel.py         # Voxel and chunk system
│   ├── world_gen.py     # Lapland terrain generation
│   └── player.py        # Player controller
└── README.md
```

## Technical Details

- **Chunk System**: 16x64x16 block chunks with dynamic loading/unloading
- **World Generation**: Multi-octave Perlin noise for natural terrain
- **Render Distance**: Configurable chunk render distance (default: 4 chunks)
- **Collision Detection**: Raycast-based physics for player movement

## License

MIT License - Feel free to use, modify, and distribute!

---

*Inspired by the beautiful Lapland region of Finland*
