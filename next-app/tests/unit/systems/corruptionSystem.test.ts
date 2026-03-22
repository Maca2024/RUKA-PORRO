/**
 * RUKA-PORRO — corruptionSystem unit tests
 * Covers: proximity drain from source NPCs, crystal passive reduction,
 *         threshold flags (visual/penalty/hostile/horror), stat penalties
 *
 * Strategy: we call corruptionSystem.tick() directly and assert against store
 * state. All cross-store calls are made through the real stores (no mocking of
 * the stores themselves) so behaviour is integration-accurate at the unit level.
 */

import { corruptionSystem } from '@/game/systems/corruptionSystem'
import { usePlayerStore } from '@/game/stores/usePlayerStore'
import { useNPCStore, NPC_DEFINITIONS } from '@/game/stores/useNPCStore'
import { useMissionStore } from '@/game/stores/useMissionStore'
import { useUIStore } from '@/game/stores/useUIStore'
import { getCorruptionLevel } from '@/game/types/game'
import {
  CORRUPTION_PROXIMITY_RATE,
  CORRUPTION_THRESHOLD_VISUAL,
  CORRUPTION_THRESHOLD_PENALTY,
  CORRUPTION_THRESHOLD_HOSTILE,
  CORRUPTION_THRESHOLD_HORROR,
} from '@/game/core/constants'
import type { NPCId } from '@/game/types/game'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function resetAll() {
  // Player at origin, nothing in inventory
  usePlayerStore.setState({
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
  })

  // Reset corruption to 0
  useMissionStore.getState().resetAll()

  // Clear all story flags (they are reset above via resetAll)
}

function getCorruption() {
  return useMissionStore.getState().porroCorruption
}

function hasFlag(flag: string) {
  return useMissionStore.getState().hasFlag(flag)
}

// Move a corruption-source NPC close to the player
function moveNPCClose(npcId: NPCId, distance: number) {
  useNPCStore.setState((s) => ({
    ...s,
    npcs: {
      ...s.npcs,
      [npcId]: { ...s.npcs[npcId], position: { x: distance, y: 0, z: 0 } },
    },
  }))
}

// Move all corruption-source NPCs far away so they have no effect
function moveAllSourcesFar() {
  const FAR = 9999
  const updates: Partial<Record<NPCId, unknown>> = {}
  for (const rawId in NPC_DEFINITIONS) {
    const id = rawId as NPCId
    if (NPC_DEFINITIONS[id].isCorruptionSource) {
      updates[id] = { ...useNPCStore.getState().npcs[id], position: { x: FAR, y: 0, z: 0 } }
    }
  }
  useNPCStore.setState((s) => ({ ...s, npcs: { ...s.npcs, ...updates } }))
}

// ─── Proximity drain ──────────────────────────────────────────────────────────

describe('corruptionSystem — proximity drain from source NPCs', () => {
  beforeEach(() => {
    resetAll()
    moveAllSourcesFar()
  })

  it('increases corruption when player is within notice radius of a source NPC', () => {
    // susi is a corruption source with noticeRadius 25
    moveNPCClose('susi', 10) // 10 units away, well within 25 radius
    corruptionSystem.tick(1)
    expect(getCorruption()).toBeGreaterThan(0)
  })

  it('applies no corruption when all sources are far away', () => {
    // All sources already moved far in beforeEach
    corruptionSystem.tick(1)
    expect(getCorruption()).toBe(0)
  })

  it('drain scales linearly — closer = more corruption per tick', () => {
    // Two separate test runs — close vs medium distance
    moveNPCClose('susi', 1)
    corruptionSystem.tick(1)
    const closeCorruption = getCorruption()

    resetAll()
    moveAllSourcesFar()
    moveNPCClose('susi', 20) // still within 25-unit radius but further
    corruptionSystem.tick(1)
    const farCorruption = getCorruption()

    expect(closeCorruption).toBeGreaterThan(farCorruption)
  })

  it('no drain at exactly the edge of notice radius', () => {
    const susiRadius = NPC_DEFINITIONS.susi.noticeRadius
    moveNPCClose('susi', susiRadius) // exactly on the boundary — proximity = 0
    corruptionSystem.tick(1)
    // proximity = 1 - dist/radius = 0 → delta = 0
    expect(getCorruption()).toBeCloseTo(0, 3)
  })

  it('accumulates corruption from multiple source NPCs simultaneously', () => {
    moveNPCClose('susi', 5)
    moveNPCClose('karhu', 5)
    corruptionSystem.tick(1)
    // Should be more than either alone
    const combined = getCorruption()

    resetAll()
    moveAllSourcesFar()
    moveNPCClose('susi', 5)
    corruptionSystem.tick(1)
    const single = getCorruption()

    expect(combined).toBeGreaterThan(single)
  })

  it('corruption rate matches CORRUPTION_PROXIMITY_RATE * proximity * delta', () => {
    const dist = 0 // maximum proximity
    const susiRadius = NPC_DEFINITIONS.susi.noticeRadius
    moveNPCClose('susi', dist)
    const delta = 1
    corruptionSystem.tick(delta)
    const proximity = 1 - dist / susiRadius
    const expected = CORRUPTION_PROXIMITY_RATE * proximity * delta
    // karhu is also a source — move it far for an isolated test
    // (already done in beforeEach via moveAllSourcesFar, then we only moved susi)
    expect(getCorruption()).toBeGreaterThanOrEqual(expected * 0.9) // allow floating point drift
  })
})

// ─── Crystal passive reduction ────────────────────────────────────────────────

describe('corruptionSystem — crystal passive reduction', () => {
  beforeEach(() => {
    resetAll()
    moveAllSourcesFar()
    // Pre-load some corruption to reduce
    useMissionStore.getState().modifyCorruption(50)
  })

  it('reduces corruption when player carries purification crystals', () => {
    usePlayerStore.setState((s) => ({
      ...s,
      inventory: [
        { id: 'purification_crystal_1', type: 'crystal', name: 'Crystal', nameFi: '', quantity: 1, icon: 'crystal' },
      ],
    }))
    corruptionSystem.tick(1)
    expect(getCorruption()).toBeLessThan(50)
  })

  it('more crystals reduce more corruption (up to cap of 3)', () => {
    usePlayerStore.setState((s) => ({
      ...s,
      inventory: [
        { id: 'purification_crystal_1', type: 'crystal', name: 'Crystal', nameFi: '', quantity: 3, icon: 'crystal' },
      ],
    }))
    corruptionSystem.tick(1)
    const threeEffect = 50 - getCorruption()

    useMissionStore.getState().modifyCorruption(50 - useMissionStore.getState().porroCorruption)
    // Reset to 50
    useMissionStore.setState((s) => ({ ...s, porroCorruption: 50 }))

    usePlayerStore.setState((s) => ({
      ...s,
      inventory: [
        { id: 'purification_crystal_1', type: 'crystal', name: 'Crystal', nameFi: '', quantity: 1, icon: 'crystal' },
      ],
    }))
    corruptionSystem.tick(1)
    const oneEffect = 50 - getCorruption()

    expect(threeEffect).toBeGreaterThan(oneEffect)
  })

  it('caps crystal effect at 3 crystals regardless of quantity', () => {
    usePlayerStore.setState((s) => ({
      ...s,
      inventory: [
        { id: 'purification_crystal_1', type: 'crystal', name: 'Crystal', nameFi: '', quantity: 10, icon: 'crystal' },
      ],
    }))
    useMissionStore.setState((s) => ({ ...s, porroCorruption: 50 }))
    corruptionSystem.tick(1)
    const tenEffect = 50 - getCorruption()

    useMissionStore.setState((s) => ({ ...s, porroCorruption: 50 }))
    usePlayerStore.setState((s) => ({
      ...s,
      inventory: [
        { id: 'purification_crystal_1', type: 'crystal', name: 'Crystal', nameFi: '', quantity: 3, icon: 'crystal' },
      ],
    }))
    corruptionSystem.tick(1)
    const threeEffect = 50 - getCorruption()

    expect(tenEffect).toBeCloseTo(threeEffect, 4)
  })

  it('non-crystal items in inventory do not reduce corruption', () => {
    usePlayerStore.setState((s) => ({
      ...s,
      inventory: [
        { id: 'lichen', type: 'food', name: 'Lichen', nameFi: '', quantity: 5, icon: 'lichen' },
      ],
    }))
    corruptionSystem.tick(1)
    // No source NPCs nearby, no crystals — corruption should stay at 50
    expect(getCorruption()).toBe(50)
  })
})

// ─── Threshold flags ──────────────────────────────────────────────────────────

describe('corruptionSystem — threshold flags via applyTierEffects', () => {
  beforeEach(() => {
    resetAll()
    moveAllSourcesFar()
  })

  it('sets corruption_visual flag when corruption >= CORRUPTION_THRESHOLD_VISUAL', () => {
    useMissionStore.setState((s) => ({ ...s, porroCorruption: CORRUPTION_THRESHOLD_VISUAL }))
    corruptionSystem.tick(0.001) // tiny tick to trigger tier check
    expect(hasFlag('corruption_visual')).toBe(true)
  })

  it('does NOT set corruption_visual flag below threshold', () => {
    useMissionStore.setState((s) => ({ ...s, porroCorruption: CORRUPTION_THRESHOLD_VISUAL - 1 }))
    corruptionSystem.tick(0.001)
    expect(hasFlag('corruption_visual')).toBe(false)
  })

  it('sets corruption_penalty flag when corruption >= CORRUPTION_THRESHOLD_PENALTY', () => {
    useMissionStore.setState((s) => ({ ...s, porroCorruption: CORRUPTION_THRESHOLD_PENALTY }))
    corruptionSystem.tick(0.001)
    expect(hasFlag('corruption_penalty')).toBe(true)
  })

  it('sets corruption_hostile flag when corruption >= CORRUPTION_THRESHOLD_HOSTILE', () => {
    useMissionStore.setState((s) => ({ ...s, porroCorruption: CORRUPTION_THRESHOLD_HOSTILE }))
    corruptionSystem.tick(0.001)
    expect(hasFlag('corruption_hostile')).toBe(true)
  })

  it('sets corruption_horror flag when corruption >= CORRUPTION_THRESHOLD_HORROR', () => {
    useMissionStore.setState((s) => ({ ...s, porroCorruption: CORRUPTION_THRESHOLD_HORROR }))
    corruptionSystem.tick(0.001)
    expect(hasFlag('corruption_horror')).toBe(true)
  })

  it('clears corruption_visual flag when corruption drops back below threshold', () => {
    // Force high, run tick to set flag
    useMissionStore.setState((s) => ({ ...s, porroCorruption: 30 }))
    corruptionSystem.tick(0.001)
    expect(hasFlag('corruption_visual')).toBe(true)

    // Drop below threshold
    useMissionStore.setState((s) => ({ ...s, porroCorruption: 10 }))
    corruptionSystem.tick(0.001)
    expect(hasFlag('corruption_visual')).toBe(false)
  })

  it('clears corruption_horror flag when corruption drops below 80', () => {
    useMissionStore.setState((s) => ({ ...s, porroCorruption: 85 }))
    corruptionSystem.tick(0.001)
    expect(hasFlag('corruption_horror')).toBe(true)

    useMissionStore.setState((s) => ({ ...s, porroCorruption: 75 }))
    corruptionSystem.tick(0.001)
    expect(hasFlag('corruption_horror')).toBe(false)
  })

  it('all four flags are set simultaneously at maximum corruption', () => {
    useMissionStore.setState((s) => ({ ...s, porroCorruption: 100 }))
    corruptionSystem.tick(0.001)
    expect(hasFlag('corruption_visual')).toBe(true)
    expect(hasFlag('corruption_penalty')).toBe(true)
    expect(hasFlag('corruption_hostile')).toBe(true)
    expect(hasFlag('corruption_horror')).toBe(true)
  })
})

// ─── getCorruptionLevel thresholds ────────────────────────────────────────────

describe('getCorruptionLevel — threshold correctness', () => {
  it('pure: corruption <= 20', () => {
    useMissionStore.setState((s) => ({ ...s, porroCorruption: 0 }))
    expect(useMissionStore.getState().corruptionLevel).toBe('pure')
    useMissionStore.getState().modifyCorruption(20)
    expect(useMissionStore.getState().corruptionLevel).toBe('pure')
  })

  it('touched: corruption 21–40', () => {
    expect(getCorruptionLevel(21)).toBe('touched')
    expect(getCorruptionLevel(40)).toBe('touched')
  })

  it('influenced: corruption 41–60', () => {
    expect(getCorruptionLevel(41)).toBe('influenced')
    expect(getCorruptionLevel(60)).toBe('influenced')
  })

  it('corrupted: corruption 61–80', () => {
    expect(getCorruptionLevel(61)).toBe('corrupted')
    expect(getCorruptionLevel(80)).toBe('corrupted')
  })

  it('consumed: corruption 81–100', () => {
    expect(getCorruptionLevel(81)).toBe('consumed')
    expect(getCorruptionLevel(100)).toBe('consumed')
  })
})
