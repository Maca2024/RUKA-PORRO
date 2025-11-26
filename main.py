#!/usr/bin/env python3
"""
RUKA-PORRO: A Lapland Taiga Voxel Game

Navigate through snowy Finnish Lapland with pine forests,
frozen lakes, and arctic wildlife. Explore and build in
this peaceful voxel world.

Controls:
    WASD        - Move
    Mouse       - Look around
    Space       - Jump
    Shift       - Sprint
    Left Click  - Break block
    Right Click - Place block
    1-9         - Select block type
    Escape      - Toggle mouse lock
    F           - Toggle fog
    P           - Toggle debug info
"""

from ursina import (
    Ursina, Entity, Sky, color, window, camera,
    Text, held_keys, time, application, Vec3
)

from src.blocks import BlockType, get_block_properties
from src.voxel import ChunkManager, CHUNK_SIZE
from src.world_gen import LaplandWorldGenerator
from src.player import Player


class VoxelGame:
    """Main game class for the Lapland voxel world."""

    def __init__(self):
        # Initialize Ursina
        self.app = Ursina(
            title='RUKA-PORRO - Lapland Voxel Game',
            borderless=False,
            fullscreen=False,
            development_mode=False,
            vsync=True
        )

        # Window settings
        window.color = color.rgb(135, 170, 210)  # Arctic sky blue
        window.fps_counter.enabled = True
        window.exit_button.visible = False

        # Create world container
        self.world = Entity()

        # World generation
        self.seed = 12345  # Fixed seed for reproducibility
        self.world_generator = LaplandWorldGenerator(seed=self.seed)

        # Chunk management
        self.chunk_manager = ChunkManager(
            self.world_generator,
            render_distance=4
        )
        self.chunk_manager.set_parent(self.world)

        # Generate initial chunks around origin
        print("Generating world...")
        self.chunk_manager.update_chunks(0, 0)
        print(f"Generated {len(self.chunk_manager.chunks)} chunks")

        # Find spawn height
        spawn_height = self.world_generator.get_height(0, 0) + 5

        # Create player
        self.player = Player(
            chunk_manager=self.chunk_manager,
            position=Vec3(0, spawn_height, 0)
        )

        # Sky (winter atmosphere)
        self.sky = Sky(
            color=color.rgb(180, 200, 220)
        )

        # Fog for atmosphere
        self.fog_enabled = True
        camera.clip_plane_far = 150
        self.setup_fog()

        # UI
        self.setup_ui()

        # Debug
        self.debug_enabled = False

    def setup_fog(self):
        """Setup atmospheric fog."""
        if self.fog_enabled:
            from ursina.shaders import lit_with_shadows_shader
            # Fog is created by limiting far clip plane
            camera.clip_plane_far = 80
        else:
            camera.clip_plane_far = 200

    def setup_ui(self):
        """Create UI elements."""
        # Crosshair
        self.crosshair = Text(
            text='+',
            origin=(0, 0),
            scale=2,
            color=color.white
        )

        # Block selection indicator
        self.block_text = Text(
            text='Block: Snow',
            position=(-0.85, 0.45),
            scale=1.5,
            color=color.white
        )

        # Controls hint
        self.hint_text = Text(
            text='WASD: Move | Space: Jump | Mouse: Look | 1-9: Blocks | ESC: Menu',
            position=(0, -0.45),
            origin=(0, 0),
            scale=1,
            color=color.rgba(255, 255, 255, 150)
        )

        # Debug text
        self.debug_text = Text(
            text='',
            position=(-0.85, 0.35),
            scale=1,
            color=color.yellow,
            visible=False
        )

    def update(self):
        """Game update loop."""
        # Update block selection display
        block_name = get_block_properties(self.player.selected_block).name
        self.block_text.text = f'Block: {block_name}'

        # Update debug info
        if self.debug_enabled:
            self.debug_text.text = (
                f'Pos: ({self.player.x:.1f}, {self.player.y:.1f}, {self.player.z:.1f})\n'
                f'Chunks: {len(self.chunk_manager.chunks)}\n'
                f'Grounded: {self.player.grounded}'
            )

    def input(self, key):
        """Handle input."""
        if key == 'f':
            self.fog_enabled = not self.fog_enabled
            self.setup_fog()
            print(f"Fog: {'On' if self.fog_enabled else 'Off'}")

        if key == 'p':
            self.debug_enabled = not self.debug_enabled
            self.debug_text.visible = self.debug_enabled

        if key == 'q':
            application.quit()

    def run(self):
        """Start the game."""
        print("\n" + "=" * 50)
        print("  RUKA-PORRO - Lapland Taiga Voxel Game")
        print("=" * 50)
        print("\nControls:")
        print("  WASD        - Move")
        print("  Mouse       - Look around")
        print("  Space       - Jump")
        print("  Shift       - Sprint")
        print("  Left Click  - Break block")
        print("  Right Click - Place block")
        print("  1-9         - Select block")
        print("  F           - Toggle fog")
        print("  P           - Debug info")
        print("  ESC         - Toggle mouse")
        print("  Q           - Quit")
        print("\nEnjoy the snowy Lapland!")
        print("=" * 50 + "\n")

        self.app.run()


def main():
    """Entry point."""
    game = VoxelGame()
    game.run()


if __name__ == '__main__':
    main()
