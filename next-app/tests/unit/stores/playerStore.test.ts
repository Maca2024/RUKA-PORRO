/**
 * RUKA-PORRO — usePlayerStore unit tests
 * Covers: tickStats, takeDamage, heal, consumeItem, addItem, removeItem,
 *         setSprinting, setInDialogue, rest, completeRespawn
 */

import { usePlayerStore } from '@/game/stores/usePlayerStore'
import {
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
} from '@/game/core/constants'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const CLEAN_STATE = {
  health: 100,
  energy: 100,
  warmth: 80,
  hunger: 80,
  isSprinting: false,
  isJumping: false,
  isGrounded: true,
  isInDialogue: false,
  isDead: false,
  respawnPending: false,
  position: { x: 0, y: 2, z: 0 },
  velocity: { x: 0, y: 0, z: 0 },
  inventory: [],
}

function reset(overrides: Partial<typeof CLEAN_STATE> = {}) {
  usePlayerStore.setState({ ...CLEAN_STATE, ...overrides })
}

function get() {
  return usePlayerStore.getState()
}

// ─── tickStats ────────────────────────────────────────────────────────────────

describe('usePlayerStore — tickStats', () => {
  beforeEach(() => reset())

  it('drains hunger by base rate * delta during normal walking', () => {
    const delta = 1
    get().tickStats(delta, 'clear', true)
    expect(get().hunger).toBeCloseTo(80 - HUNGER_DRAIN_BASE * delta, 5)
  })

  it('drains hunger at sprint rate when isSprinting is true', () => {
    reset({ isSprinting: true })
    const delta = 1
    get().tickStats(delta, 'clear', true)
    expect(get().hunger).toBeCloseTo(80 - HUNGER_DRAIN_SPRINT * delta, 5)
  })

  it('drains warmth faster during blizzard', () => {
    const delta = 1
    get().tickStats(delta, 'blizzard', true)
    const expectedDrain = (WARMTH_DRAIN_BASE + WARMTH_DRAIN_BLIZZARD) * delta
    expect(get().warmth).toBeCloseTo(80 - expectedDrain, 5)
  })

  it('drains warmth faster at night', () => {
    const delta = 1
    get().tickStats(delta, 'clear', false)
    const expectedDrain = (WARMTH_DRAIN_BASE + WARMTH_DRAIN_NIGHT) * delta
    expect(get().warmth).toBeCloseTo(80 - expectedDrain, 5)
  })

  it('drains warmth at combined night + blizzard rate', () => {
    const delta = 1
    get().tickStats(delta, 'blizzard', false)
    const expectedDrain = (WARMTH_DRAIN_BASE + WARMTH_DRAIN_NIGHT + WARMTH_DRAIN_BLIZZARD) * delta
    expect(get().warmth).toBeCloseTo(80 - expectedDrain, 5)
  })

  it('heavy-snow drains warmth at half blizzard rate on top of base', () => {
    const delta = 1
    get().tickStats(delta, 'heavy-snow', true)
    const expectedDrain = (WARMTH_DRAIN_BASE + WARMTH_DRAIN_BLIZZARD * 0.5) * delta
    expect(get().warmth).toBeCloseTo(80 - expectedDrain, 5)
  })

  it('drains health when warmth reaches 0', () => {
    reset({ warmth: 0 })
    const delta = 1
    get().tickStats(delta, 'clear', true)
    // Hunger also drained — but health drain is from warmth == 0
    expect(get().health).toBeCloseTo(100 - HEALTH_DRAIN_NO_WARMTH * delta, 5)
  })

  it('drains health when hunger reaches 0', () => {
    reset({ hunger: 0 })
    const delta = 1
    get().tickStats(delta, 'clear', true)
    expect(get().health).toBeCloseTo(100 - HEALTH_DRAIN_NO_HUNGER * delta, 5)
  })

  it('drains energy when sprinting', () => {
    reset({ isSprinting: true })
    const delta = 2
    get().tickStats(delta, 'clear', true)
    expect(get().energy).toBeCloseTo(100 - ENERGY_DRAIN_SPRINT * delta, 5)
  })

  it('regenerates energy when grounded and not sprinting', () => {
    reset({ energy: 50, isSprinting: false, isGrounded: true, isJumping: false })
    const delta = 1
    get().tickStats(delta, 'clear', true)
    expect(get().energy).toBeCloseTo(50 + ENERGY_REGEN_WALK * delta, 5)
  })

  it('stats never drop below 0', () => {
    reset({ hunger: 0.1, warmth: 0.1, health: 0.1, energy: 0.1 })
    get().tickStats(100, 'blizzard', false)
    const s = get()
    expect(s.hunger).toBeGreaterThanOrEqual(0)
    expect(s.warmth).toBeGreaterThanOrEqual(0)
    expect(s.health).toBeGreaterThanOrEqual(0)
    expect(s.energy).toBeGreaterThanOrEqual(0)
  })

  it('energy never exceeds 100', () => {
    reset({ energy: 99, isSprinting: false, isGrounded: true, isJumping: false })
    get().tickStats(100, 'clear', true)
    expect(get().energy).toBeLessThanOrEqual(100)
  })

  it('sets isDead and respawnPending when health reaches 0 through starvation', () => {
    reset({ health: 0.1, hunger: 0 })
    get().tickStats(1, 'clear', true)
    const s = get()
    expect(s.isDead).toBe(true)
    expect(s.respawnPending).toBe(true)
    expect(s.health).toBe(0)
  })

  it('does nothing when already isDead', () => {
    reset({ isDead: true, hunger: 80, warmth: 80 })
    get().tickStats(10, 'blizzard', false)
    const s = get()
    // Stats should not change while dead
    expect(s.hunger).toBe(80)
    expect(s.warmth).toBe(80)
  })

  it('disables sprinting automatically when energy is depleted', () => {
    reset({ isSprinting: true, energy: 0.01 })
    get().tickStats(1, 'clear', true)
    expect(get().isSprinting).toBe(false)
  })
})

// ─── takeDamage ───────────────────────────────────────────────────────────────

describe('usePlayerStore — takeDamage', () => {
  beforeEach(() => reset())

  it('reduces health by the given amount', () => {
    get().takeDamage(20)
    expect(get().health).toBe(80)
  })

  it('clamps health to 0 — not negative', () => {
    get().takeDamage(200)
    expect(get().health).toBe(0)
  })

  it('triggers isDead when health reaches 0', () => {
    get().takeDamage(100)
    expect(get().isDead).toBe(true)
  })

  it('triggers respawnPending when health reaches 0', () => {
    get().takeDamage(100)
    expect(get().respawnPending).toBe(true)
  })

  it('is a no-op when already dead', () => {
    reset({ isDead: true, health: 0 })
    get().takeDamage(50)
    expect(get().health).toBe(0)
  })

  it('does not trigger death for non-fatal damage', () => {
    get().takeDamage(50)
    expect(get().isDead).toBe(false)
    expect(get().health).toBe(50)
  })

  it('handles fractional damage correctly', () => {
    get().takeDamage(0.5)
    expect(get().health).toBeCloseTo(99.5, 5)
  })

  it('health is exactly 0 after damage equal to current health', () => {
    reset({ health: 30 })
    get().takeDamage(30)
    expect(get().health).toBe(0)
    expect(get().isDead).toBe(true)
  })
})

// ─── heal ─────────────────────────────────────────────────────────────────────

describe('usePlayerStore — heal', () => {
  beforeEach(() => reset())

  it('restores health by the given amount', () => {
    reset({ health: 60 })
    get().heal(20)
    expect(get().health).toBe(80)
  })

  it('caps health at 100', () => {
    reset({ health: 95 })
    get().heal(20)
    expect(get().health).toBe(100)
  })

  it('heal of 0 has no effect', () => {
    reset({ health: 70 })
    get().heal(0)
    expect(get().health).toBe(70)
  })

  it('heals from nearly dead', () => {
    reset({ health: 1 })
    get().heal(10)
    expect(get().health).toBe(11)
  })
})

// ─── consumeItem ──────────────────────────────────────────────────────────────

describe('usePlayerStore — consumeItem', () => {
  beforeEach(() => reset())

  it('restores hunger by LICHEN_HUNGER_RESTORE when consuming lichen', () => {
    reset({
      hunger: 50,
      inventory: [{ id: 'lichen', type: 'food', name: 'Lichen', nameFi: '', quantity: 2, icon: 'lichen' }],
    })
    const result = get().consumeItem('lichen')
    expect(result).toBe(true)
    expect(get().hunger).toBeCloseTo(50 + LICHEN_HUNGER_RESTORE, 5)
  })

  it('caps hunger at 100 when consuming lichen near full', () => {
    reset({
      hunger: 95,
      inventory: [{ id: 'lichen', type: 'food', name: 'Lichen', nameFi: '', quantity: 1, icon: 'lichen' }],
    })
    get().consumeItem('lichen')
    expect(get().hunger).toBe(100)
  })

  it('restores health by MUSHROOM_HEALTH_RESTORE when consuming mushroom', () => {
    reset({
      health: 70,
      inventory: [{ id: 'mushroom', type: 'food', name: 'Mushroom', nameFi: '', quantity: 1, icon: 'mushroom' }],
    })
    get().consumeItem('mushroom')
    expect(get().health).toBeCloseTo(70 + MUSHROOM_HEALTH_RESTORE, 5)
  })

  it('decrements item quantity after consumption', () => {
    reset({
      inventory: [{ id: 'lichen', type: 'food', name: 'Lichen', nameFi: '', quantity: 3, icon: 'lichen' }],
    })
    get().consumeItem('lichen')
    expect(get().inventory[0].quantity).toBe(2)
  })

  it('removes item from inventory when quantity reaches 0', () => {
    reset({
      inventory: [{ id: 'lichen', type: 'food', name: 'Lichen', nameFi: '', quantity: 1, icon: 'lichen' }],
    })
    get().consumeItem('lichen')
    expect(get().inventory).toHaveLength(0)
  })

  it('returns false when inventory is empty', () => {
    reset({ inventory: [] })
    const result = get().consumeItem('lichen')
    expect(result).toBe(false)
  })

  it('returns false for an unknown item type', () => {
    reset({
      inventory: [{ id: 'xyz_unknown', type: 'quest', name: 'Key', nameFi: '', quantity: 1, icon: 'key' }],
    })
    const result = get().consumeItem('xyz_unknown')
    expect(result).toBe(false)
  })

  it('warm_broth restores both warmth and hunger', () => {
    reset({
      warmth: 50,
      hunger: 60,
      inventory: [{ id: 'warm_broth', type: 'food', name: 'Warm Broth', nameFi: '', quantity: 1, icon: 'broth' }],
    })
    get().consumeItem('warm_broth')
    expect(get().warmth).toBeCloseTo(75, 5)
    expect(get().hunger).toBeCloseTo(70, 5)
  })
})

// ─── addItem / removeItem ─────────────────────────────────────────────────────

describe('usePlayerStore — addItem', () => {
  beforeEach(() => reset())

  it('adds a new item to an empty inventory', () => {
    get().addItem({ id: 'crystal_1', type: 'crystal', name: 'Crystal', nameFi: '', quantity: 1, icon: 'crystal' })
    expect(get().inventory).toHaveLength(1)
    expect(get().inventory[0].id).toBe('crystal_1')
  })

  it('stacks quantity when adding an item that already exists', () => {
    reset({
      inventory: [{ id: 'lichen', type: 'food', name: 'Lichen', nameFi: '', quantity: 2, icon: 'lichen' }],
    })
    get().addItem({ id: 'lichen', type: 'food', name: 'Lichen', nameFi: '', quantity: 3, icon: 'lichen' })
    expect(get().inventory).toHaveLength(1)
    expect(get().inventory[0].quantity).toBe(5)
  })

  it('does not stack items with different ids', () => {
    get().addItem({ id: 'lichen_a', type: 'food', name: 'Lichen A', nameFi: '', quantity: 1, icon: 'lichen' })
    get().addItem({ id: 'lichen_b', type: 'food', name: 'Lichen B', nameFi: '', quantity: 1, icon: 'lichen' })
    expect(get().inventory).toHaveLength(2)
  })
})

describe('usePlayerStore — removeItem', () => {
  beforeEach(() => reset())

  it('decrements quantity by 1 by default', () => {
    reset({
      inventory: [{ id: 'lichen', type: 'food', name: 'Lichen', nameFi: '', quantity: 3, icon: 'lichen' }],
    })
    const result = get().removeItem('lichen')
    expect(result).toBe(true)
    expect(get().inventory[0].quantity).toBe(2)
  })

  it('removes item entirely when quantity reaches 0', () => {
    reset({
      inventory: [{ id: 'lichen', type: 'food', name: 'Lichen', nameFi: '', quantity: 1, icon: 'lichen' }],
    })
    get().removeItem('lichen')
    expect(get().inventory).toHaveLength(0)
  })

  it('returns false when item is not in inventory', () => {
    reset({ inventory: [] })
    expect(get().removeItem('lichen')).toBe(false)
  })

  it('returns false when quantity would go negative', () => {
    reset({
      inventory: [{ id: 'lichen', type: 'food', name: 'Lichen', nameFi: '', quantity: 1, icon: 'lichen' }],
    })
    expect(get().removeItem('lichen', 5)).toBe(false)
    // inventory unchanged
    expect(get().inventory[0].quantity).toBe(1)
  })

  it('removes a bulk quantity in one call', () => {
    reset({
      inventory: [{ id: 'lichen', type: 'food', name: 'Lichen', nameFi: '', quantity: 5, icon: 'lichen' }],
    })
    get().removeItem('lichen', 3)
    expect(get().inventory[0].quantity).toBe(2)
  })
})

// ─── setSprinting / setInDialogue ─────────────────────────────────────────────

describe('usePlayerStore — setSprinting / setInDialogue', () => {
  beforeEach(() => reset())

  it('sets isSprinting to true when conditions allow', () => {
    get().setSprinting(true)
    expect(get().isSprinting).toBe(true)
  })

  it('cannot start sprinting while in dialogue', () => {
    reset({ isInDialogue: true })
    get().setSprinting(true)
    expect(get().isSprinting).toBe(false)
  })

  it('cannot start sprinting with 0 energy', () => {
    reset({ energy: 0 })
    get().setSprinting(true)
    expect(get().isSprinting).toBe(false)
  })

  it('setInDialogue stops sprinting when dialogue starts', () => {
    reset({ isSprinting: true })
    get().setInDialogue(true)
    expect(get().isSprinting).toBe(false)
    expect(get().isInDialogue).toBe(true)
  })

  it('clearning dialogue does not force-start sprinting', () => {
    get().setInDialogue(false)
    expect(get().isSprinting).toBe(false)
  })
})

// ─── rest ─────────────────────────────────────────────────────────────────────

describe('usePlayerStore — rest', () => {
  beforeEach(() => reset())

  it('restores energy while resting', () => {
    reset({ energy: 40 })
    get().rest(1)
    expect(get().energy).toBeGreaterThan(40)
  })

  it('restores warmth while resting', () => {
    reset({ warmth: 40 })
    get().rest(1)
    expect(get().warmth).toBeGreaterThan(40)
  })

  it('still drains a little hunger while resting', () => {
    get().rest(1)
    expect(get().hunger).toBeLessThan(80)
  })

  it('does nothing when isDead', () => {
    reset({ isDead: true, energy: 40 })
    get().rest(1)
    expect(get().energy).toBe(40)
  })

  it('does nothing when in dialogue', () => {
    reset({ isInDialogue: true, energy: 40 })
    get().rest(1)
    expect(get().energy).toBe(40)
  })
})

// ─── completeRespawn ──────────────────────────────────────────────────────────

describe('usePlayerStore — completeRespawn', () => {
  beforeEach(() => reset({ isDead: true, respawnPending: true, health: 0, energy: 0, warmth: 0, hunger: 0 }))

  it('sets health to 50 after respawn', () => {
    get().completeRespawn()
    expect(get().health).toBe(50)
  })

  it('sets energy to 60 after respawn', () => {
    get().completeRespawn()
    expect(get().energy).toBe(60)
  })

  it('sets warmth to 70 after respawn', () => {
    get().completeRespawn()
    expect(get().warmth).toBe(70)
  })

  it('sets hunger to 40 after respawn', () => {
    get().completeRespawn()
    expect(get().hunger).toBe(40)
  })

  it('clears isDead flag', () => {
    get().completeRespawn()
    expect(get().isDead).toBe(false)
  })

  it('clears respawnPending flag', () => {
    get().completeRespawn()
    expect(get().respawnPending).toBe(false)
  })

  it('resets movement flags', () => {
    reset({ isDead: true, respawnPending: true, isSprinting: true, isJumping: true })
    get().completeRespawn()
    expect(get().isSprinting).toBe(false)
    expect(get().isJumping).toBe(false)
  })

  it('resets position to spawn point', () => {
    reset({ isDead: true, respawnPending: true, position: { x: 99, y: 99, z: 99 } })
    get().completeRespawn()
    const pos = get().position
    expect(pos.x).toBe(0)
    expect(pos.y).toBe(2)
    expect(pos.z).toBe(0)
  })

  it('zeroes out velocity', () => {
    reset({ isDead: true, respawnPending: true, velocity: { x: 5, y: -3, z: 2 } })
    get().completeRespawn()
    const vel = get().velocity
    expect(vel.x).toBe(0)
    expect(vel.y).toBe(0)
    expect(vel.z).toBe(0)
  })
})
