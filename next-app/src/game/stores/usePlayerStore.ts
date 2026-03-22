'use client'

/**
 * RUKA-PORRO — Player store
 * Manages all survival stats, movement flags, inventory, and game-over state.
 * Uses immer for ergonomic immutable updates.
 */

import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { InventoryItem, Vec3, WeatherType } from '../types/game'
import {
  STAT_MAX,
  STAT_MIN,
  HUNGER_DRAIN_BASE,
  HUNGER_DRAIN_SPRINT,
  WARMTH_DRAIN_BASE,
  WARMTH_DRAIN_NIGHT,
  WARMTH_DRAIN_BLIZZARD,
  ENERGY_DRAIN_SPRINT,
  ENERGY_REGEN_WALK,
  HEALTH_DRAIN_NO_WARMTH,
  HEALTH_DRAIN_NO_HUNGER,
  LICHEN_HUNGER_RESTORE,
  MUSHROOM_HEALTH_RESTORE,
} from '../core/constants'

// ─── Types ────────────────────────────────────────────────────────────────────

interface PlayerStoreState {
  // Position & orientation
  position: Vec3
  rotation: number
  velocity: Vec3

  // Stats (all 0–100)
  health: number
  energy: number
  warmth: number
  hunger: number

  // Movement flags
  isGrounded: boolean
  isSprinting: boolean
  isJumping: boolean
  isInDialogue: boolean

  // Game-over / respawn
  isDead: boolean
  respawnPending: boolean

  // Inventory
  inventory: InventoryItem[]

  // ── Actions ──────────────────────────────────────────────────────────────

  /** Called each game tick by the world update loop. */
  tickStats: (delta: number, weather: WeatherType, isDay: boolean) => void

  setPosition: (pos: Vec3) => void
  setRotation: (radians: number) => void
  setVelocity: (vel: Vec3) => void
  setGrounded: (v: boolean) => void
  setSprinting: (v: boolean) => void
  setJumping: (v: boolean) => void
  setInDialogue: (v: boolean) => void

  /** Use a consumable item from inventory. Returns true if consumed. */
  consumeItem: (itemId: string) => boolean

  /** Apply damage; triggers "nap" game-over if health reaches 0. */
  takeDamage: (amount: number) => void

  /** Directly restore health (e.g. from mushroom pickup). */
  heal: (amount: number) => void

  /**
   * Rest action — regenerates energy and warmth while hunger drains slightly
   * faster (standing still in cold still costs body heat).
   */
  rest: (delta: number) => void

  /** Add an item to the inventory, stacking if already present. */
  addItem: (item: InventoryItem) => void

  /** Remove `quantity` of an item. Returns true if successful. */
  removeItem: (itemId: string, quantity?: number) => boolean

  /** Triggered when the respawn animation has finished. */
  completeRespawn: () => void
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function cap(value: number): number {
  return Math.min(STAT_MAX, Math.max(STAT_MIN, value))
}

const ITEM_EFFECTS: Record<string, (state: PlayerStoreState) => void> = {
  lichen: (s) => { s.hunger = cap(s.hunger + LICHEN_HUNGER_RESTORE) },
  mushroom: (s) => { s.health = cap(s.health + MUSHROOM_HEALTH_RESTORE) },
  warm_broth: (s) => {
    s.warmth = cap(s.warmth + 25)
    s.hunger = cap(s.hunger + 10)
  },
  reindeer_moss: (s) => { s.hunger = cap(s.hunger + 20) },
  purification_crystal: (s) => {
    // Corruption reduction is handled by useMissionStore — we just mark the item used.
    // No direct stat change here.
  },
}

// ─── Initial state ────────────────────────────────────────────────────────────

const INITIAL_POSITION: Vec3 = { x: 0, y: 2, z: 0 }
const RESPAWN_POSITION: Vec3 = { x: 0, y: 2, z: 0 }

// ─── Store ────────────────────────────────────────────────────────────────────

export const usePlayerStore = create<PlayerStoreState>()(
  immer((set, get) => ({
    position: INITIAL_POSITION,
    rotation: 0,
    velocity: { x: 0, y: 0, z: 0 },

    health: 100,
    energy: 100,
    warmth: 80,
    hunger: 80,

    isGrounded: true,
    isSprinting: false,
    isJumping: false,
    isInDialogue: false,

    isDead: false,
    respawnPending: false,

    inventory: [
      {
        id: 'lichen_1',
        type: 'food',
        name: 'Reindeer Lichen',
        nameFi: 'Poronjäkälä',
        quantity: 3,
        icon: 'lichen',
      },
    ],

    // ── Tick ───────────────────────────────────────────────────────────────

    tickStats(delta, weather, isDay) {
      set((s) => {
        if (s.isDead || s.respawnPending) return

        const sprinting = s.isSprinting && s.isGrounded

        // Hunger drains faster when sprinting
        const hungerDrain = sprinting ? HUNGER_DRAIN_SPRINT : HUNGER_DRAIN_BASE
        s.hunger = cap(s.hunger - hungerDrain * delta)

        // Warmth drain depends on time of day and weather severity
        let warmthDrain = WARMTH_DRAIN_BASE
        if (!isDay) warmthDrain += WARMTH_DRAIN_NIGHT
        if (weather === 'blizzard') warmthDrain += WARMTH_DRAIN_BLIZZARD
        else if (weather === 'heavy-snow') warmthDrain += WARMTH_DRAIN_BLIZZARD * 0.5
        s.warmth = cap(s.warmth - warmthDrain * delta)

        // Energy drains when sprinting, regenerates while walking/idle
        if (sprinting) {
          s.energy = cap(s.energy - ENERGY_DRAIN_SPRINT * delta)
        } else if (s.isGrounded && !s.isJumping) {
          s.energy = cap(s.energy + ENERGY_REGEN_WALK * delta)
        }

        // Health consequences of critical stats
        if (s.warmth <= 0) {
          s.health = cap(s.health - HEALTH_DRAIN_NO_WARMTH * delta)
        }
        if (s.hunger <= 0) {
          s.health = cap(s.health - HEALTH_DRAIN_NO_HUNGER * delta)
        }

        // Forced slow-down when energy is depleted
        if (s.energy <= 0 && s.isSprinting) {
          s.isSprinting = false
        }

        // Game over — trigger gentle "nap" respawn
        if (s.health <= 0) {
          s.health = 0
          s.isDead = true
          s.respawnPending = true
        }
      })
    },

    // ── Position / orientation ─────────────────────────────────────────────

    setPosition(pos) {
      set((s) => { s.position = pos })
    },

    setRotation(radians) {
      set((s) => { s.rotation = radians })
    },

    setVelocity(vel) {
      set((s) => { s.velocity = vel })
    },

    // ── Movement flags ─────────────────────────────────────────────────────

    setGrounded(v) {
      set((s) => { s.isGrounded = v })
    },

    setSprinting(v) {
      set((s) => {
        // Can't sprint while in dialogue or with no energy
        if (v && (s.isInDialogue || s.energy <= 0)) return
        s.isSprinting = v
      })
    },

    setJumping(v) {
      set((s) => { s.isJumping = v })
    },

    setInDialogue(v) {
      set((s) => {
        s.isInDialogue = v
        // Stop sprinting when a conversation starts
        if (v) s.isSprinting = false
      })
    },

    // ── Item consumption ───────────────────────────────────────────────────

    consumeItem(itemId) {
      const state = get()
      const item = state.inventory.find((i) => i.id === itemId || i.type + '_' + i.id === itemId)
      if (!item || item.quantity <= 0) return false

      const effectKey = Object.keys(ITEM_EFFECTS).find((k) => itemId.startsWith(k)) ?? itemId
      const effect = ITEM_EFFECTS[effectKey]
      if (!effect) return false

      set((s) => {
        effect(s)
        const inv = s.inventory.find((i) => i.id === itemId)
        if (inv) {
          inv.quantity -= 1
          if (inv.quantity <= 0) {
            s.inventory = s.inventory.filter((i) => i.id !== itemId)
          }
        }
      })
      return true
    },

    // ── Health manipulation ────────────────────────────────────────────────

    takeDamage(amount) {
      set((s) => {
        if (s.isDead) return
        s.health = cap(s.health - amount)
        if (s.health <= 0) {
          s.health = 0
          s.isDead = true
          s.respawnPending = true
        }
      })
    },

    heal(amount) {
      set((s) => {
        s.health = cap(s.health + amount)
      })
    },

    // ── Rest ───────────────────────────────────────────────────────────────

    rest(delta) {
      set((s) => {
        if (s.isDead || s.isInDialogue) return
        // Resting restores energy and warmth but still costs a little hunger
        s.energy = cap(s.energy + 8 * delta)
        s.warmth = cap(s.warmth + 4 * delta)
        s.hunger = cap(s.hunger - HUNGER_DRAIN_BASE * 1.5 * delta)
      })
    },

    // ── Inventory ──────────────────────────────────────────────────────────

    addItem(item) {
      set((s) => {
        const existing = s.inventory.find((i) => i.id === item.id)
        if (existing) {
          existing.quantity += item.quantity
        } else {
          s.inventory.push({ ...item })
        }
      })
    },

    removeItem(itemId, quantity = 1) {
      const item = get().inventory.find((i) => i.id === itemId)
      if (!item || item.quantity < quantity) return false

      set((s) => {
        const inv = s.inventory.find((i) => i.id === itemId)
        if (!inv) return
        inv.quantity -= quantity
        if (inv.quantity <= 0) {
          s.inventory = s.inventory.filter((i) => i.id !== itemId)
        }
      })
      return true
    },

    // ── Respawn ────────────────────────────────────────────────────────────

    completeRespawn() {
      set((s) => {
        // Gentle "nap" mechanic — poro wakes up refreshed but with reduced stats
        s.health = 50
        s.energy = 60
        s.warmth = 70
        s.hunger = 40
        s.position = { ...RESPAWN_POSITION }
        s.velocity = { x: 0, y: 0, z: 0 }
        s.isDead = false
        s.respawnPending = false
        s.isSprinting = false
        s.isJumping = false
      })
    },
  })),
)
