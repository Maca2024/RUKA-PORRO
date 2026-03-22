/**
 * RUKA-PORRO — Game constants
 * Single source of truth for all numeric tuning values and palette colours.
 */

// ─── World geometry ───────────────────────────────────────────────────────────

export const WORLD_SIZE = 400
export const CHUNK_SIZE = 64
export const LOAD_RADIUS = 3

// ─── Player movement ──────────────────────────────────────────────────────────

export const PLAYER_WALK_SPEED = 14
export const PLAYER_SPRINT_SPEED = 26
export const PLAYER_JUMP_FORCE = 14
export const PLAYER_HEIGHT = 2.0

// ─── Stat caps ────────────────────────────────────────────────────────────────

export const STAT_MAX = 100
export const STAT_MIN = 0

// ─── Survival drain / regen (per second) ─────────────────────────────────────

export const HUNGER_DRAIN_BASE = 0.5
export const HUNGER_DRAIN_SPRINT = 1.0
export const WARMTH_DRAIN_BASE = 0.3
export const WARMTH_DRAIN_NIGHT = 0.8
export const WARMTH_DRAIN_BLIZZARD = 2.0
export const ENERGY_DRAIN_SPRINT = 0.4
export const ENERGY_REGEN_WALK = 0.2
export const HEALTH_DRAIN_NO_WARMTH = 2.0
export const HEALTH_DRAIN_NO_HUNGER = 1.0

// ─── Consumable restores ──────────────────────────────────────────────────────

export const LICHEN_HUNGER_RESTORE = 15
export const MUSHROOM_HEALTH_RESTORE = 10

// ─── NPC behaviour ────────────────────────────────────────────────────────────

export const NPC_NOTICE_RADIUS_DEFAULT = 15
export const NPC_DIALOGUE_RADIUS = 3
export const NPC_FLEE_SPEED = 12
export const TRUST_MIN = -100
export const TRUST_MAX = 100

// ─── Corruption ───────────────────────────────────────────────────────────────

/** Corruption gained per second while standing near a corruption source */
export const CORRUPTION_PROXIMITY_RATE = 2
/** Corruption removed when a purification crystal is used */
export const CORRUPTION_CRYSTAL_REDUCE = 15
/** Corruption % above which visual distortion begins */
export const CORRUPTION_THRESHOLD_VISUAL = 20
/** Corruption % above which movement is slightly penalised */
export const CORRUPTION_THRESHOLD_PENALTY = 40
/** Corruption % above which hostile NPCs become aggressive */
export const CORRUPTION_THRESHOLD_HOSTILE = 60
/** Corruption % above which horror visuals kick in */
export const CORRUPTION_THRESHOLD_HORROR = 80

// ─── Time / weather ───────────────────────────────────────────────────────────

/** Seconds for a complete 24-hour in-game day */
export const DAY_CYCLE_DURATION = 600
/** Seconds a weather transition takes to complete */
export const WEATHER_TRANSITION_DURATION = 10

// ─── Scene population ─────────────────────────────────────────────────────────

export const TREE_COUNT = 400
export const LICHEN_COUNT = 60
export const SNOW_PARTICLE_COUNT = 2000
export const BIRD_FLOCK_COUNT = 6

// ─── Camera ───────────────────────────────────────────────────────────────────

export const CAMERA_MIN_DISTANCE = 5
export const CAMERA_MAX_DISTANCE = 30
export const CAMERA_DEFAULT_DISTANCE = 12
export const CAMERA_SMOOTHING = 0.1

// ─── Palette ──────────────────────────────────────────────────────────────────

export const COLORS = {
  snow: '#e8eaf0',
  snowDark: '#c5cad4',
  ice: '#8ecae6',
  pine: '#2d5a3d',
  pineDark: '#1a3a25',
  bark: '#5c4033',
  lichen: '#a8d5ba',
  aurora: '#00ff88',
  auroraSecondary: '#ff00ff',
  corruption: '#6b21a8',
  corruptionDark: '#3b0764',
  health: '#ef4444',
  energy: '#f59e0b',
  warmth: '#f97316',
  hunger: '#22c55e',
  trust: '#ec4899',
  sky: '#87ceeb',
  skyNight: '#0f172a',
  skyDawn: '#fbbf24',
  skyDusk: '#f97316',
  fog: '#cbd5e1',
} as const

export type ColorKey = keyof typeof COLORS
