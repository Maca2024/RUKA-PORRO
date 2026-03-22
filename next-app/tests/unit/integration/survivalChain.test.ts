/**
 * RUKA-PORRO — Survival Chain Integration Tests
 *
 * Tests stat drain chains, energy depletion mechanics, respawn behaviour,
 * rest mechanics, and inventory edge cases in isolation — no LLM or R3F calls.
 */

import { beforeEach, describe, expect, it } from 'vitest'
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
import type { InventoryItem } from '@/game/types/game'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const FULL_STATS = {
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
  position: { x: 0, y: 2, z: 0 },
  rotation: 0,
  velocity: { x: 0, y: 0, z: 0 },
  inventory: [] as InventoryItem[],
}

function resetPlayer(overrides: Partial<typeof FULL_STATS> = {}) {
  usePlayerStore.setState({ ...FULL_STATS, ...overrides })
}

function lichensInInventory(qty: number): InventoryItem[] {
  if (qty <= 0) return []
  return [{ id: 'lichen_1', type: 'food', name: 'Reindeer Lichen', nameFi: 'Poronjäkälä', quantity: qty, icon: 'lichen' }]
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Survival Chain Integration', () => {
  beforeEach(() => resetPlayer())

  // 1. Sprint depletes energy → forced walk when energy = 0
  it('sprinting drains energy and isSprinting is forced off when energy hits 0', () => {
    // Start with minimal energy so one tick drains it completely
    resetPlayer({ energy: 0.3, isSprinting: true, isGrounded: true })

    // 1-second sprint tick: energy drain = ENERGY_DRAIN_SPRINT * 1 = 0.4
    // 0.3 - 0.4 clamps to 0, then isSprinting is forced false
    usePlayerStore.getState().tickStats(1, 'light-snow', true)

    expect(usePlayerStore.getState().energy).toBe(0)
    expect(usePlayerStore.getState().isSprinting).toBe(false)
  })

  // 2. No food → hunger drops → health drops → game over
  it('sustained hunger drain eventually triggers game-over state', () => {
    // Start with zero hunger and zero warmth so only hunger-health chain fires purely
    resetPlayer({ hunger: 0, warmth: 100, health: 5 })

    // With hunger=0, health drains at HEALTH_DRAIN_NO_HUNGER/s
    // 5 health, 1 second → should kill the player
    usePlayerStore.getState().tickStats(5, 'clear', true)

    expect(usePlayerStore.getState().health).toBe(0)
    expect(usePlayerStore.getState().isDead).toBe(true)
    expect(usePlayerStore.getState().respawnPending).toBe(true)
  })

  // 3. Blizzard + night → warmth crashes → health drain cascade
  it('blizzard during night drains warmth at max rate and cascades into health drain', () => {
    resetPlayer({ warmth: 5, health: 100, hunger: 80 })

    // With warmth near 0: warmth drain = BASE + NIGHT + BLIZZARD = 0.3 + 0.8 + 2.0 = 3.1/s
    // 2 seconds will deplete remaining warmth and begin health drain
    usePlayerStore.getState().tickStats(2, 'blizzard', false) // isDay = false

    expect(usePlayerStore.getState().warmth).toBe(0)
    // Health should have started draining
    expect(usePlayerStore.getState().health).toBeLessThan(100)
  })

  // 4. Eating lichen breaks the hunger→health drain chain
  it('consuming lichen while hunger is critical stops the health drain chain', () => {
    resetPlayer({
      hunger: 2,
      warmth: 80,
      health: 60,
      inventory: lichensInInventory(2),
    })

    // One tick causes hunger drain; hunger may hit 0 and health starts draining
    usePlayerStore.getState().tickStats(1, 'clear', true)
    const healthAfterFirstTick = usePlayerStore.getState().health

    // Eat lichen — hunger rises to LICHEN_HUNGER_RESTORE
    const consumed = usePlayerStore.getState().consumeItem('lichen_1')
    expect(consumed).toBe(true)
    expect(usePlayerStore.getState().hunger).toBeGreaterThan(0)

    // Second tick — hunger is now positive, health drain from hunger stops
    const healthBeforeSecondTick = usePlayerStore.getState().health
    usePlayerStore.getState().tickStats(1, 'clear', true)
    const healthAfterSecondTick = usePlayerStore.getState().health

    // The health change in second tick must be less severe than in first tick
    // (first tick may have had hunger=0 drain; second tick should not)
    const firstDrop = healthAfterFirstTick - healthBeforeSecondTick // may be 0 or small
    const secondDrop = healthBeforeSecondTick - healthAfterSecondTick
    expect(secondDrop).toBeLessThanOrEqual(firstDrop + 0.1) // warmth drain only in second tick
  })

  // 5. Rest restores energy but warmth still drains in cold
  it('resting restores energy and warmth but hunger still drains during rest', () => {
    resetPlayer({ energy: 20, warmth: 50, hunger: 60 })

    // 10 seconds of rest: energy += 8*10=80, warmth += 4*10=40, hunger -= HUNGER_DRAIN_BASE*1.5*10
    usePlayerStore.getState().rest(10)

    const state = usePlayerStore.getState()
    expect(state.energy).toBeCloseTo(Math.min(100, 20 + 8 * 10), 1)
    expect(state.warmth).toBeCloseTo(Math.min(100, 50 + 4 * 10), 1)
    // Hunger must be lower than 60
    expect(state.hunger).toBeLessThan(60)
    expect(state.hunger).toBeCloseTo(60 - HUNGER_DRAIN_BASE * 1.5 * 10, 1)
  })

  // 6. Multiple simultaneous drains (warmth=0 AND hunger=0) stack correctly
  it('warmth=0 and hunger=0 simultaneously drain health at the combined rate', () => {
    resetPlayer({ warmth: 0, hunger: 0, health: 100 })

    usePlayerStore.getState().tickStats(1, 'clear', true)

    const expectedDrain = HEALTH_DRAIN_NO_WARMTH + HEALTH_DRAIN_NO_HUNGER
    expect(usePlayerStore.getState().health).toBeCloseTo(100 - expectedDrain, 1)
  })

  // 7. Respawn resets to partial stats but does not reset mission progress
  it('completing a respawn restores partial player stats but does not reset inventory', () => {
    resetPlayer({ health: 0, isDead: true, respawnPending: true, inventory: lichensInInventory(2) })

    usePlayerStore.getState().completeRespawn()

    const state = usePlayerStore.getState()
    expect(state.health).toBe(50)
    expect(state.energy).toBe(60)
    expect(state.warmth).toBe(70)
    expect(state.hunger).toBe(40)
    expect(state.isDead).toBe(false)
    expect(state.respawnPending).toBe(false)
    expect(state.isSprinting).toBe(false)
    // Inventory should be preserved (the "nap" mechanic, not death)
    expect(state.inventory).toHaveLength(1)
  })

  // 8. Inventory management: eat last lichen, try to eat again → fails
  it('consuming the last lichen removes it from inventory; a second consume attempt fails', () => {
    resetPlayer({ inventory: lichensInInventory(1), hunger: 40 })

    const firstResult = usePlayerStore.getState().consumeItem('lichen_1')
    expect(firstResult).toBe(true)
    expect(usePlayerStore.getState().inventory).toHaveLength(0)
    expect(usePlayerStore.getState().hunger).toBeCloseTo(40 + LICHEN_HUNGER_RESTORE, 1)

    const secondResult = usePlayerStore.getState().consumeItem('lichen_1')
    expect(secondResult).toBe(false)
  })

  // 9. Energy regenerates when walking (grounded, not sprinting, not jumping)
  it('energy regenerates at ENERGY_REGEN_WALK rate when grounded and idle', () => {
    resetPlayer({ energy: 40, isSprinting: false, isGrounded: true, isJumping: false })

    usePlayerStore.getState().tickStats(10, 'clear', true)

    expect(usePlayerStore.getState().energy).toBeCloseTo(Math.min(100, 40 + ENERGY_REGEN_WALK * 10), 1)
  })

  // 10. Energy does not regen when airborne (jumping)
  it('energy does not regenerate while jumping', () => {
    resetPlayer({ energy: 40, isSprinting: false, isGrounded: true, isJumping: true })

    usePlayerStore.getState().tickStats(5, 'clear', true)

    // isJumping = true prevents energy regen; hunger drains but energy stays at 40
    // Warmth drain happens but energy must be unchanged
    expect(usePlayerStore.getState().energy).toBeCloseTo(40, 1)
  })

  // 11. takeDamage immediately reduces health and triggers game-over at 0
  it('taking lethal damage sets isDead and respawnPending', () => {
    resetPlayer({ health: 10 })

    usePlayerStore.getState().takeDamage(10)

    expect(usePlayerStore.getState().health).toBe(0)
    expect(usePlayerStore.getState().isDead).toBe(true)
    expect(usePlayerStore.getState().respawnPending).toBe(true)
  })

  // 12. heal caps at STAT_MAX and does not exceed 100
  it('heal does not allow health to exceed 100', () => {
    resetPlayer({ health: 95 })

    usePlayerStore.getState().heal(20)

    expect(usePlayerStore.getState().health).toBe(100)
  })

  // 13. tickStats is a no-op when player is dead
  it('tickStats does not change any stats when the player is already dead', () => {
    resetPlayer({ health: 0, isDead: true, respawnPending: true, warmth: 30, hunger: 30 })

    const warmthBefore = usePlayerStore.getState().warmth
    const hungerBefore = usePlayerStore.getState().hunger

    usePlayerStore.getState().tickStats(5, 'blizzard', false)

    expect(usePlayerStore.getState().warmth).toBe(warmthBefore)
    expect(usePlayerStore.getState().hunger).toBe(hungerBefore)
    expect(usePlayerStore.getState().health).toBe(0) // stays at 0, not below
  })

  // 14. addItem stacks quantity for existing item IDs
  it('addItem stacks quantity when the same item id already exists in inventory', () => {
    resetPlayer({ inventory: lichensInInventory(2) })

    usePlayerStore.getState().addItem({
      id: 'lichen_1',
      type: 'food',
      name: 'Reindeer Lichen',
      nameFi: 'Poronjäkälä',
      quantity: 3,
      icon: 'lichen',
    })

    expect(usePlayerStore.getState().inventory[0].quantity).toBe(5)
    expect(usePlayerStore.getState().inventory).toHaveLength(1)
  })
})
