"""
World generation for Lapland taiga biome.
Creates snowy terrain with pine forests, frozen lakes, and arctic features.
"""

import random
import math
from typing import Tuple
from noise import pnoise2, snoise2

from .blocks import BlockType
from .voxel import Chunk, CHUNK_SIZE, CHUNK_HEIGHT


class LaplandWorldGenerator:
    """
    Generates a Lapland taiga biome with:
    - Rolling snowy hills
    - Dense pine forests
    - Frozen lakes
    - Rocky outcrops
    - Reindeer lichen patches
    - Berry bushes
    """

    def __init__(self, seed: int = None):
        self.seed = seed or random.randint(0, 1000000)
        random.seed(self.seed)

        # Terrain parameters
        self.base_height = 20
        self.height_scale = 15
        self.terrain_frequency = 0.02
        self.detail_frequency = 0.08

        # Feature parameters
        self.tree_density = 0.15
        self.lake_threshold = -0.3
        self.rock_threshold = 0.7

    def get_height(self, world_x: int, world_z: int) -> int:
        """Calculate terrain height at given coordinates using noise."""
        # Base terrain
        base = pnoise2(
            world_x * self.terrain_frequency,
            world_z * self.terrain_frequency,
            octaves=4,
            persistence=0.5,
            lacunarity=2.0,
            base=self.seed
        )

        # Detail noise for variation
        detail = pnoise2(
            world_x * self.detail_frequency,
            world_z * self.detail_frequency,
            octaves=2,
            persistence=0.3,
            base=self.seed + 1000
        )

        height = self.base_height + int((base * 0.7 + detail * 0.3) * self.height_scale)
        return max(1, min(height, CHUNK_HEIGHT - 10))

    def get_lake_value(self, world_x: int, world_z: int) -> float:
        """Check if position is in a frozen lake."""
        return pnoise2(
            world_x * 0.01,
            world_z * 0.01,
            octaves=2,
            persistence=0.5,
            base=self.seed + 2000
        )

    def get_rock_value(self, world_x: int, world_z: int) -> float:
        """Check if position has rocky outcrop."""
        return pnoise2(
            world_x * 0.03,
            world_z * 0.03,
            octaves=3,
            persistence=0.6,
            base=self.seed + 3000
        )

    def should_place_tree(self, world_x: int, world_z: int, height: int) -> bool:
        """Determine if a tree should be placed at this location."""
        # Use noise for natural tree distribution
        tree_noise = pnoise2(
            world_x * 0.1,
            world_z * 0.1,
            octaves=2,
            base=self.seed + 4000
        )

        # Additional randomness
        random.seed(world_x * 73856093 ^ world_z * 19349663 ^ self.seed)
        rand_val = random.random()

        # Trees more likely in lower areas, avoid lakes
        lake_val = self.get_lake_value(world_x, world_z)
        if lake_val < self.lake_threshold:
            return False

        return tree_noise > 0.2 and rand_val < self.tree_density

    def generate_pine_tree(self, chunk: Chunk, local_x: int, base_y: int, local_z: int):
        """Generate a pine tree at the given position."""
        # Random tree height
        random.seed(local_x * 73856093 ^ local_z * 19349663 ^ base_y)
        trunk_height = random.randint(5, 9)

        world_x, _, world_z = chunk.local_to_world(local_x, 0, local_z)

        # Trunk
        for y in range(trunk_height):
            if base_y + y < CHUNK_HEIGHT:
                chunk.set_block(local_x, base_y + y, local_z, BlockType.PINE_LOG)

        # Conical pine leaves
        leaf_start = base_y + 2
        leaf_end = base_y + trunk_height + 2

        for y in range(leaf_start, leaf_end):
            # Radius decreases as we go up (cone shape)
            progress = (y - leaf_start) / (leaf_end - leaf_start)
            radius = int(3 * (1 - progress * 0.8))

            for dx in range(-radius, radius + 1):
                for dz in range(-radius, radius + 1):
                    # Circular-ish shape
                    if dx * dx + dz * dz <= radius * radius + 1:
                        lx, lz = local_x + dx, local_z + dz
                        if 0 <= lx < CHUNK_SIZE and 0 <= lz < CHUNK_SIZE:
                            if y < CHUNK_HEIGHT:
                                # Don't overwrite trunk
                                if not (dx == 0 and dz == 0 and y < base_y + trunk_height):
                                    chunk.set_block(lx, y, lz, BlockType.PINE_LEAVES)

        # Tree top
        if leaf_end < CHUNK_HEIGHT:
            chunk.set_block(local_x, leaf_end, local_z, BlockType.PINE_LEAVES)

    def generate_chunk(self, chunk: Chunk):
        """Generate terrain for a chunk."""
        chunk_world_x = chunk.chunk_pos[0] * CHUNK_SIZE
        chunk_world_z = chunk.chunk_pos[1] * CHUNK_SIZE

        # First pass: terrain
        for local_x in range(CHUNK_SIZE):
            for local_z in range(CHUNK_SIZE):
                world_x = chunk_world_x + local_x
                world_z = chunk_world_z + local_z

                height = self.get_height(world_x, world_z)
                lake_val = self.get_lake_value(world_x, world_z)
                rock_val = self.get_rock_value(world_x, world_z)

                # Check for frozen lake
                is_lake = lake_val < self.lake_threshold
                lake_surface = self.base_height - 3

                if is_lake:
                    height = min(height, lake_surface - 1)

                # Generate terrain column
                for y in range(CHUNK_HEIGHT):
                    if y == 0:
                        # Bedrock equivalent - deep stone
                        chunk.set_block(local_x, y, local_z, BlockType.STONE)
                    elif is_lake and y == lake_surface:
                        # Frozen lake surface
                        chunk.set_block(local_x, y, local_z, BlockType.ICE)
                    elif is_lake and y < lake_surface and y > height:
                        # Water under ice
                        chunk.set_block(local_x, y, local_z, BlockType.FROZEN_WATER)
                    elif y < height - 4:
                        # Deep stone
                        chunk.set_block(local_x, y, local_z, BlockType.STONE)
                    elif y < height:
                        # Frozen dirt layer
                        chunk.set_block(local_x, y, local_z, BlockType.FROZEN_DIRT)
                    elif y == height and not is_lake:
                        # Surface layer
                        if rock_val > self.rock_threshold:
                            chunk.set_block(local_x, y, local_z, BlockType.STONE)
                        else:
                            chunk.set_block(local_x, y, local_z, BlockType.SNOW)

        # Second pass: surface features (trees, bushes, lichen)
        for local_x in range(CHUNK_SIZE):
            for local_z in range(CHUNK_SIZE):
                world_x = chunk_world_x + local_x
                world_z = chunk_world_z + local_z

                height = self.get_height(world_x, world_z)
                lake_val = self.get_lake_value(world_x, world_z)
                rock_val = self.get_rock_value(world_x, world_z)

                if lake_val >= self.lake_threshold and rock_val <= self.rock_threshold:
                    # Trees
                    if self.should_place_tree(world_x, world_z, height):
                        self.generate_pine_tree(chunk, local_x, height + 1, local_z)
                    else:
                        # Small vegetation
                        random.seed(world_x * 12345 ^ world_z * 67890 ^ self.seed)
                        veg_roll = random.random()

                        if veg_roll < 0.05:
                            # Berry bush
                            if height + 1 < CHUNK_HEIGHT:
                                chunk.set_block(local_x, height + 1, local_z, BlockType.BERRY_BUSH)
                        elif veg_roll < 0.15:
                            # Reindeer lichen
                            if height + 1 < CHUNK_HEIGHT:
                                chunk.set_block(local_x, height + 1, local_z, BlockType.REINDEER_LICHEN)
                        elif veg_roll < 0.25:
                            # Moss patches
                            chunk.set_block(local_x, height, local_z, BlockType.MOSS)

        chunk.is_generated = True
