"""
Block system for the voxel game.
Defines all block types and their properties for Lapland taiga biome.
"""

from enum import Enum, auto
from dataclasses import dataclass
from typing import Tuple
from ursina import color, Vec3


class BlockType(Enum):
    """All available block types in the game."""
    AIR = auto()
    SNOW = auto()
    FROZEN_DIRT = auto()
    STONE = auto()
    PINE_LOG = auto()
    PINE_LEAVES = auto()
    ICE = auto()
    FROZEN_WATER = auto()
    MOSS = auto()
    BERRY_BUSH = auto()
    REINDEER_LICHEN = auto()


@dataclass
class BlockProperties:
    """Properties for each block type."""
    name: str
    solid: bool
    transparent: bool
    color_value: Tuple[float, float, float, float]
    breakable: bool = True

    @property
    def color(self):
        """Return ursina color from tuple."""
        return color.rgba(*self.color_value)


# Block property definitions for Lapland taiga biome
BLOCK_PROPERTIES = {
    BlockType.AIR: BlockProperties(
        name="Air",
        solid=False,
        transparent=True,
        color_value=(0, 0, 0, 0),
        breakable=False
    ),
    BlockType.SNOW: BlockProperties(
        name="Snow",
        solid=True,
        transparent=False,
        color_value=(0.95, 0.95, 1.0, 1.0)
    ),
    BlockType.FROZEN_DIRT: BlockProperties(
        name="Frozen Dirt",
        solid=True,
        transparent=False,
        color_value=(0.35, 0.25, 0.2, 1.0)
    ),
    BlockType.STONE: BlockProperties(
        name="Stone",
        solid=True,
        transparent=False,
        color_value=(0.5, 0.5, 0.55, 1.0)
    ),
    BlockType.PINE_LOG: BlockProperties(
        name="Pine Log",
        solid=True,
        transparent=False,
        color_value=(0.4, 0.25, 0.15, 1.0)
    ),
    BlockType.PINE_LEAVES: BlockProperties(
        name="Pine Leaves",
        solid=True,
        transparent=True,
        color_value=(0.1, 0.35, 0.15, 0.9)
    ),
    BlockType.ICE: BlockProperties(
        name="Ice",
        solid=True,
        transparent=True,
        color_value=(0.7, 0.85, 1.0, 0.7)
    ),
    BlockType.FROZEN_WATER: BlockProperties(
        name="Frozen Water",
        solid=False,
        transparent=True,
        color_value=(0.4, 0.6, 0.9, 0.6)
    ),
    BlockType.MOSS: BlockProperties(
        name="Moss",
        solid=True,
        transparent=False,
        color_value=(0.3, 0.45, 0.25, 1.0)
    ),
    BlockType.BERRY_BUSH: BlockProperties(
        name="Berry Bush",
        solid=False,
        transparent=True,
        color_value=(0.2, 0.4, 0.2, 0.8)
    ),
    BlockType.REINDEER_LICHEN: BlockProperties(
        name="Reindeer Lichen",
        solid=False,
        transparent=True,
        color_value=(0.8, 0.85, 0.75, 0.9)
    ),
}


def get_block_properties(block_type: BlockType) -> BlockProperties:
    """Get properties for a given block type."""
    return BLOCK_PROPERTIES.get(block_type, BLOCK_PROPERTIES[BlockType.AIR])


def is_solid(block_type: BlockType) -> bool:
    """Check if a block type is solid."""
    return get_block_properties(block_type).solid


def is_transparent(block_type: BlockType) -> bool:
    """Check if a block type is transparent."""
    return get_block_properties(block_type).transparent
