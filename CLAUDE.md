# CLAUDE.md - AI Assistant Guide for RUKA-PORRO

## Project Overview

**RUKA-PORRO** is a voxel game set in Lapland Taiga (Finnish wilderness). The project is built with Python and aims to create an immersive voxel-based gaming experience inspired by the natural beauty of Lapland.

- **Project Name**: RUKA-PORRO (named after Ruka, a famous fell/ski resort area in Finnish Lapland, and "poro" meaning reindeer in Finnish)
- **Type**: Voxel Game
- **Language**: Python
- **Theme**: Lapland Taiga (subarctic wilderness)

## Repository Structure

```
RUKA-PORRO/
├── CLAUDE.md          # AI assistant guidelines (this file)
├── README.md          # Project description
├── .gitignore         # Python-focused gitignore
└── (future directories to be added)
```

### Planned Structure (recommended)

```
RUKA-PORRO/
├── src/               # Main source code
│   ├── __init__.py
│   ├── main.py        # Entry point
│   ├── engine/        # Voxel engine core
│   ├── world/         # World generation, chunks, biomes
│   ├── entities/      # Player, animals (reindeer/poro, etc.)
│   ├── rendering/     # Graphics and rendering
│   └── utils/         # Utility functions
├── assets/            # Game assets
│   ├── textures/
│   ├── sounds/
│   └── models/
├── tests/             # Unit and integration tests
├── docs/              # Documentation
├── requirements.txt   # Python dependencies
├── pyproject.toml     # Project configuration
└── setup.py           # Package setup (if needed)
```

## Development Guidelines

### Python Environment

- **Python Version**: 3.10+ recommended
- **Virtual Environment**: Use `venv`, `poetry`, or `uv` for dependency management
- **Package Manager**: pip, poetry, or uv

```bash
# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
# or
.venv\Scripts\activate     # Windows

# Install dependencies (when requirements.txt exists)
pip install -r requirements.txt
```

### Code Style Conventions

1. **Formatting**: Use `black` for code formatting
2. **Linting**: Use `ruff` or `flake8` for linting
3. **Type Hints**: Use type annotations for all function signatures
4. **Docstrings**: Use Google-style docstrings
5. **Naming**:
   - `snake_case` for functions and variables
   - `PascalCase` for classes
   - `UPPER_SNAKE_CASE` for constants
   - Prefix private members with underscore (`_private_method`)

### Example Code Style

```python
"""Module docstring describing purpose."""

from typing import Optional, List

CHUNK_SIZE: int = 16
WORLD_HEIGHT: int = 256


class VoxelChunk:
    """Represents a chunk of voxels in the world.

    Args:
        x: Chunk X coordinate.
        z: Chunk Z coordinate.
    """

    def __init__(self, x: int, z: int) -> None:
        self.x = x
        self.z = z
        self._blocks: List[int] = []

    def get_block(self, x: int, y: int, z: int) -> Optional[int]:
        """Retrieves a block at the specified local coordinates.

        Args:
            x: Local X coordinate (0-15).
            y: Y coordinate (0-255).
            z: Local Z coordinate (0-15).

        Returns:
            Block ID if valid, None otherwise.
        """
        # Implementation
        pass
```

## Game-Specific Conventions

### Voxel Engine

- **Chunk System**: Use 16x256x16 chunk dimensions (standard voxel game size)
- **Coordinate System**: Y-up, right-handed coordinate system
- **Block IDs**: Use integer IDs for block types, with 0 = air

### Lapland Theme Elements

The game should incorporate authentic Lapland elements:
- **Biomes**: Taiga forest, fell (tunturi), frozen lakes, wetlands (suo)
- **Flora**: Pine trees (mänty), spruce (kuusi), birch (koivu), lingonberry (puolukka), cloudberry (lakka)
- **Fauna**: Reindeer (poro), arctic fox, ptarmigan (riekko), elk (hirvi)
- **Weather**: Northern lights (revontulet), snow, midnight sun, polar night
- **Structures**: Kota (Sami tent), log cabins, reindeer fences

### Recommended Libraries

For voxel game development in Python:
- **Graphics**: `pygame`, `pyglet`, `moderngl`, `ursina`, `panda3d`
- **Math/Noise**: `numpy`, `noise`, `opensimplex`
- **GUI**: `pygame-gui`, `imgui`
- **Networking** (if multiplayer): `asyncio`, `websockets`

## Testing

### Running Tests

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=src

# Run specific test file
pytest tests/test_world.py
```

### Test Conventions

- Place tests in `tests/` directory mirroring `src/` structure
- Name test files with `test_` prefix
- Use `pytest` fixtures for common setup
- Aim for >80% code coverage on core game logic

## Git Workflow

### Branch Naming

- `main` - Stable release branch
- `develop` - Development integration branch
- `feature/<name>` - New features
- `bugfix/<name>` - Bug fixes
- `claude/<session-id>` - AI assistant working branches

### Commit Messages

Use conventional commit format:
```
type(scope): description

[optional body]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Examples:
```
feat(world): add taiga biome generation
fix(rendering): resolve chunk culling issue
docs(readme): update installation instructions
```

## Common Commands

```bash
# Development server (when implemented)
python -m src.main

# Format code
black src/ tests/

# Lint code
ruff check src/ tests/

# Type checking
mypy src/

# Build package
python -m build
```

## AI Assistant Instructions

When working on this codebase:

1. **Preserve Theme**: Maintain the Lapland/Finnish wilderness aesthetic in all features
2. **Follow Python Best Practices**: Use type hints, proper error handling, and clear documentation
3. **Performance Matters**: Voxel games are performance-critical; optimize hot paths
4. **Test Coverage**: Write tests for new functionality
5. **Incremental Changes**: Make small, focused commits
6. **Documentation**: Update this file when adding new systems or changing conventions

### Key Files to Know

| File/Directory | Purpose |
|---------------|---------|
| `src/main.py` | Application entry point |
| `src/engine/` | Core voxel engine |
| `src/world/` | World generation |
| `pyproject.toml` | Project configuration |
| `requirements.txt` | Dependencies |

### Things to Avoid

- Don't add unnecessary dependencies
- Don't break the voxel engine's chunk system
- Don't use global state; prefer dependency injection
- Don't hardcode magic numbers; use named constants
- Don't ignore type hints in new code

## Finnish Terminology Reference

For consistency in naming game elements:

| Finnish | English | Usage |
|---------|---------|-------|
| Poro | Reindeer | Main animal entity |
| Tunturi | Fell/Mountain | Biome type |
| Taiga | Boreal forest | Primary biome |
| Revontulet | Northern lights | Weather/visual effect |
| Kota | Traditional tent | Structure |
| Mänty | Pine | Tree type |
| Kuusi | Spruce | Tree type |
| Koivu | Birch | Tree type |
| Lakka | Cloudberry | Plant/food |
| Suo | Swamp/Wetland | Biome type |
| Joki | River | Terrain feature |
| Järvi | Lake | Terrain feature |
| Lumi | Snow | Weather/block type |

---

*Last updated: 2025-11-25*
