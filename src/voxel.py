"""
Voxel and chunk system for the game engine.
Handles voxel rendering and chunk management.
"""

from ursina import Entity, Vec3, destroy, color
from typing import Dict, Tuple, Optional
import numpy as np

from .blocks import BlockType, get_block_properties, is_transparent


# Chunk dimensions
CHUNK_SIZE = 16
CHUNK_HEIGHT = 64


class Voxel(Entity):
    """A single voxel block in the world."""

    def __init__(self, position: Vec3, block_type: BlockType, **kwargs):
        self.block_type = block_type
        props = get_block_properties(block_type)

        super().__init__(
            parent=kwargs.get('parent'),
            position=position,
            model='cube',
            origin_y=0.5,
            color=props.color,
            scale=1,
            collider='box' if props.solid else None,
        )

        # Store block properties
        self.solid = props.solid
        self.transparent = props.transparent


class Chunk:
    """
    A chunk contains a 3D array of block types and manages voxel entities.
    Only visible faces are rendered for performance.
    """

    def __init__(self, chunk_pos: Tuple[int, int], parent=None):
        self.chunk_pos = chunk_pos
        self.parent = parent
        self.blocks = np.full(
            (CHUNK_SIZE, CHUNK_HEIGHT, CHUNK_SIZE),
            BlockType.AIR,
            dtype=object
        )
        self.voxels: Dict[Tuple[int, int, int], Voxel] = {}
        self.is_generated = False
        self.is_meshed = False

    def set_block(self, x: int, y: int, z: int, block_type: BlockType):
        """Set a block at local chunk coordinates."""
        if 0 <= x < CHUNK_SIZE and 0 <= y < CHUNK_HEIGHT and 0 <= z < CHUNK_SIZE:
            self.blocks[x, y, z] = block_type

    def get_block(self, x: int, y: int, z: int) -> BlockType:
        """Get block at local chunk coordinates."""
        if 0 <= x < CHUNK_SIZE and 0 <= y < CHUNK_HEIGHT and 0 <= z < CHUNK_SIZE:
            return self.blocks[x, y, z]
        return BlockType.AIR

    def world_to_local(self, world_x: int, world_y: int, world_z: int) -> Tuple[int, int, int]:
        """Convert world coordinates to local chunk coordinates."""
        local_x = world_x - self.chunk_pos[0] * CHUNK_SIZE
        local_z = world_z - self.chunk_pos[1] * CHUNK_SIZE
        return local_x, world_y, local_z

    def local_to_world(self, local_x: int, local_y: int, local_z: int) -> Tuple[int, int, int]:
        """Convert local chunk coordinates to world coordinates."""
        world_x = local_x + self.chunk_pos[0] * CHUNK_SIZE
        world_z = local_z + self.chunk_pos[1] * CHUNK_SIZE
        return world_x, local_y, world_z

    def is_face_visible(self, x: int, y: int, z: int, dx: int, dy: int, dz: int) -> bool:
        """Check if a face should be visible (adjacent to air or transparent block)."""
        nx, ny, nz = x + dx, y + dy, z + dz

        # Check bounds
        if ny < 0 or ny >= CHUNK_HEIGHT:
            return True
        if nx < 0 or nx >= CHUNK_SIZE or nz < 0 or nz >= CHUNK_SIZE:
            return True  # Chunk border - render for now

        neighbor = self.blocks[nx, ny, nz]
        return neighbor == BlockType.AIR or is_transparent(neighbor)

    def build_mesh(self):
        """
        Build visible voxels for this chunk.
        Only creates voxels where at least one face is visible.
        """
        # Clear existing voxels
        self.clear_mesh()

        for x in range(CHUNK_SIZE):
            for y in range(CHUNK_HEIGHT):
                for z in range(CHUNK_SIZE):
                    block_type = self.blocks[x, y, z]
                    if block_type == BlockType.AIR:
                        continue

                    # Check if any face is visible
                    visible = False
                    for dx, dy, dz in [(1, 0, 0), (-1, 0, 0), (0, 1, 0), (0, -1, 0), (0, 0, 1), (0, 0, -1)]:
                        if self.is_face_visible(x, y, z, dx, dy, dz):
                            visible = True
                            break

                    if visible:
                        world_x, world_y, world_z = self.local_to_world(x, y, z)
                        voxel = Voxel(
                            position=Vec3(world_x, world_y, world_z),
                            block_type=block_type,
                            parent=self.parent
                        )
                        self.voxels[(x, y, z)] = voxel

        self.is_meshed = True

    def clear_mesh(self):
        """Remove all voxel entities from this chunk."""
        for voxel in self.voxels.values():
            destroy(voxel)
        self.voxels.clear()
        self.is_meshed = False

    def update_block(self, x: int, y: int, z: int, block_type: BlockType):
        """Update a single block and refresh nearby voxels."""
        self.set_block(x, y, z, block_type)

        # Remove existing voxel if present
        if (x, y, z) in self.voxels:
            destroy(self.voxels[(x, y, z)])
            del self.voxels[(x, y, z)]

        # Create new voxel if not air and visible
        if block_type != BlockType.AIR:
            visible = False
            for dx, dy, dz in [(1, 0, 0), (-1, 0, 0), (0, 1, 0), (0, -1, 0), (0, 0, 1), (0, 0, -1)]:
                if self.is_face_visible(x, y, z, dx, dy, dz):
                    visible = True
                    break

            if visible:
                world_x, world_y, world_z = self.local_to_world(x, y, z)
                self.voxels[(x, y, z)] = Voxel(
                    position=Vec3(world_x, world_y, world_z),
                    block_type=block_type,
                    parent=self.parent
                )


class ChunkManager:
    """Manages loading and unloading of chunks based on player position."""

    def __init__(self, world_generator, render_distance: int = 4):
        self.world_generator = world_generator
        self.render_distance = render_distance
        self.chunks: Dict[Tuple[int, int], Chunk] = {}
        self.parent = None

    def set_parent(self, parent):
        """Set the parent entity for all voxels."""
        self.parent = parent

    def get_chunk_pos(self, world_x: float, world_z: float) -> Tuple[int, int]:
        """Get chunk position from world coordinates."""
        return (int(world_x) // CHUNK_SIZE, int(world_z) // CHUNK_SIZE)

    def get_chunk(self, chunk_x: int, chunk_z: int) -> Optional[Chunk]:
        """Get a chunk by its position."""
        return self.chunks.get((chunk_x, chunk_z))

    def update_chunks(self, player_x: float, player_z: float):
        """Load/unload chunks based on player position."""
        player_chunk = self.get_chunk_pos(player_x, player_z)

        # Determine which chunks should be loaded
        needed_chunks = set()
        for dx in range(-self.render_distance, self.render_distance + 1):
            for dz in range(-self.render_distance, self.render_distance + 1):
                needed_chunks.add((player_chunk[0] + dx, player_chunk[1] + dz))

        # Unload far chunks
        chunks_to_remove = []
        for chunk_pos in self.chunks:
            if chunk_pos not in needed_chunks:
                chunks_to_remove.append(chunk_pos)

        for chunk_pos in chunks_to_remove:
            self.chunks[chunk_pos].clear_mesh()
            del self.chunks[chunk_pos]

        # Load new chunks
        for chunk_pos in needed_chunks:
            if chunk_pos not in self.chunks:
                self.load_chunk(chunk_pos)

    def load_chunk(self, chunk_pos: Tuple[int, int]):
        """Generate and mesh a new chunk."""
        chunk = Chunk(chunk_pos, self.parent)
        self.world_generator.generate_chunk(chunk)
        chunk.build_mesh()
        self.chunks[chunk_pos] = chunk

    def get_block_at(self, world_x: int, world_y: int, world_z: int) -> BlockType:
        """Get block at world coordinates."""
        chunk_pos = self.get_chunk_pos(world_x, world_z)
        chunk = self.get_chunk(*chunk_pos)
        if chunk:
            local_x, local_y, local_z = chunk.world_to_local(world_x, world_y, world_z)
            return chunk.get_block(local_x, local_y, local_z)
        return BlockType.AIR

    def set_block_at(self, world_x: int, world_y: int, world_z: int, block_type: BlockType):
        """Set block at world coordinates."""
        chunk_pos = self.get_chunk_pos(world_x, world_z)
        chunk = self.get_chunk(*chunk_pos)
        if chunk:
            local_x, local_y, local_z = chunk.world_to_local(world_x, world_y, world_z)
            chunk.update_block(local_x, local_y, local_z, block_type)
