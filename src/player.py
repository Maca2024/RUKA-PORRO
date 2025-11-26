"""
Player controller with first-person movement and camera controls.
Includes physics, collision detection, and block interaction.
"""

from ursina import (
    Entity, Vec3, Vec2, camera, mouse, held_keys, time,
    raycast, color, destroy, clamp
)
from ursina.prefabs.first_person_controller import FirstPersonController
import math

from .blocks import BlockType, get_block_properties
from .voxel import ChunkManager, Voxel


class Player(Entity):
    """
    First-person player controller with:
    - WASD movement
    - Mouse look
    - Jumping and gravity
    - Block placement and destruction
    - Sprint with Shift
    """

    def __init__(self, chunk_manager: ChunkManager, **kwargs):
        super().__init__()
        self.chunk_manager = chunk_manager

        # Position
        self.position = kwargs.get('position', Vec3(0, 30, 0))

        # Movement settings
        self.speed = 5
        self.sprint_multiplier = 1.8
        self.jump_height = 1.5
        self.gravity = 25

        # Physics state
        self.velocity_y = 0
        self.grounded = False

        # Camera settings
        self.mouse_sensitivity = Vec2(40, 40)
        self.camera_pivot = Entity(parent=self, y=1.7)

        # Setup camera
        camera.parent = self.camera_pivot
        camera.position = Vec3(0, 0, 0)
        camera.rotation = Vec3(0, 0, 0)
        camera.fov = 90

        # Player collision
        self.height = 1.8
        self.radius = 0.3

        # Block interaction
        self.reach = 5
        self.selected_block = BlockType.SNOW
        self.block_highlight = Entity(
            model='wireframe_cube',
            color=color.white,
            scale=1.01,
            visible=False
        )

        # Lock mouse
        mouse.locked = True
        mouse.visible = False

        # Rotation
        self.rotation_y = 0
        self.camera_rotation_x = 0

    def update(self):
        """Called every frame."""
        self.handle_mouse_look()
        self.handle_movement()
        self.handle_gravity()
        self.update_block_highlight()
        self.handle_block_interaction()

        # Update chunks based on player position
        self.chunk_manager.update_chunks(self.x, self.z)

    def handle_mouse_look(self):
        """Handle mouse look for camera rotation."""
        if mouse.locked:
            # Horizontal rotation (yaw)
            self.rotation_y += mouse.velocity[0] * self.mouse_sensitivity.x

            # Vertical rotation (pitch) - clamped
            self.camera_rotation_x -= mouse.velocity[1] * self.mouse_sensitivity.y
            self.camera_rotation_x = clamp(self.camera_rotation_x, -90, 90)

            self.camera_pivot.rotation_x = self.camera_rotation_x

    def handle_movement(self):
        """Handle WASD movement with collision."""
        # Calculate move direction
        move_dir = Vec3(0, 0, 0)

        if held_keys['w']:
            move_dir += Vec3(0, 0, 1)
        if held_keys['s']:
            move_dir += Vec3(0, 0, -1)
        if held_keys['a']:
            move_dir += Vec3(-1, 0, 0)
        if held_keys['d']:
            move_dir += Vec3(1, 0, 0)

        if move_dir.length() > 0:
            move_dir = move_dir.normalized()

        # Apply rotation to movement
        move_dir = self.rotate_vector(move_dir, self.rotation_y)

        # Sprint
        speed = self.speed
        if held_keys['shift']:
            speed *= self.sprint_multiplier

        # Calculate velocity
        velocity = move_dir * speed * time.dt

        # Apply movement with collision
        self.move_with_collision(velocity)

        # Jump
        if held_keys['space'] and self.grounded:
            self.velocity_y = math.sqrt(2 * self.gravity * self.jump_height)
            self.grounded = False

    def rotate_vector(self, vec: Vec3, angle_degrees: float) -> Vec3:
        """Rotate a vector around Y axis."""
        angle_rad = math.radians(angle_degrees)
        cos_a = math.cos(angle_rad)
        sin_a = math.sin(angle_rad)

        return Vec3(
            vec.x * cos_a + vec.z * sin_a,
            vec.y,
            -vec.x * sin_a + vec.z * cos_a
        )

    def handle_gravity(self):
        """Apply gravity and vertical movement."""
        # Apply gravity
        self.velocity_y -= self.gravity * time.dt

        # Vertical movement
        new_y = self.y + self.velocity_y * time.dt

        # Ground check
        ground_ray = raycast(
            origin=self.position + Vec3(0, 0.1, 0),
            direction=Vec3(0, -1, 0),
            distance=0.3 + abs(self.velocity_y * time.dt),
            ignore=[self, self.block_highlight]
        )

        if ground_ray.hit:
            if self.velocity_y < 0:
                self.y = ground_ray.world_point.y
                self.velocity_y = 0
                self.grounded = True
        else:
            self.y = new_y
            self.grounded = False

        # Ceiling check
        if self.velocity_y > 0:
            ceiling_ray = raycast(
                origin=self.position + Vec3(0, self.height, 0),
                direction=Vec3(0, 1, 0),
                distance=self.velocity_y * time.dt + 0.1,
                ignore=[self, self.block_highlight]
            )
            if ceiling_ray.hit:
                self.velocity_y = 0

    def move_with_collision(self, velocity: Vec3):
        """Move with basic collision detection."""
        # X movement
        if velocity.x != 0:
            ray = raycast(
                origin=self.position + Vec3(0, 0.5, 0),
                direction=Vec3(1 if velocity.x > 0 else -1, 0, 0),
                distance=abs(velocity.x) + self.radius,
                ignore=[self, self.block_highlight]
            )
            if not ray.hit:
                self.x += velocity.x

        # Z movement
        if velocity.z != 0:
            ray = raycast(
                origin=self.position + Vec3(0, 0.5, 0),
                direction=Vec3(0, 0, 1 if velocity.z > 0 else -1),
                distance=abs(velocity.z) + self.radius,
                ignore=[self, self.block_highlight]
            )
            if not ray.hit:
                self.z += velocity.z

    def update_block_highlight(self):
        """Show highlight on block player is looking at."""
        hit = raycast(
            origin=camera.world_position,
            direction=camera.forward,
            distance=self.reach,
            ignore=[self, self.block_highlight]
        )

        if hit.hit and isinstance(hit.entity, Voxel):
            self.block_highlight.visible = True
            self.block_highlight.position = hit.entity.position
        else:
            self.block_highlight.visible = False

    def handle_block_interaction(self):
        """Handle block breaking and placement."""
        hit = raycast(
            origin=camera.world_position,
            direction=camera.forward,
            distance=self.reach,
            ignore=[self, self.block_highlight]
        )

        # Left click - break block
        if mouse.left and hit.hit and isinstance(hit.entity, Voxel):
            block_pos = hit.entity.position
            self.chunk_manager.set_block_at(
                int(block_pos.x),
                int(block_pos.y),
                int(block_pos.z),
                BlockType.AIR
            )
            mouse.left = False  # Prevent rapid fire

        # Right click - place block
        if mouse.right and hit.hit and isinstance(hit.entity, Voxel):
            # Calculate placement position
            place_pos = hit.entity.position + hit.normal
            self.chunk_manager.set_block_at(
                int(place_pos.x),
                int(place_pos.y),
                int(place_pos.z),
                self.selected_block
            )
            mouse.right = False  # Prevent rapid fire

    def input(self, key):
        """Handle input events."""
        # Toggle mouse lock with Escape
        if key == 'escape':
            mouse.locked = not mouse.locked
            mouse.visible = not mouse.locked

        # Block selection with number keys
        block_selection = {
            '1': BlockType.SNOW,
            '2': BlockType.FROZEN_DIRT,
            '3': BlockType.STONE,
            '4': BlockType.PINE_LOG,
            '5': BlockType.PINE_LEAVES,
            '6': BlockType.ICE,
            '7': BlockType.MOSS,
            '8': BlockType.BERRY_BUSH,
            '9': BlockType.REINDEER_LICHEN,
        }

        if key in block_selection:
            self.selected_block = block_selection[key]
            print(f"Selected: {get_block_properties(self.selected_block).name}")
