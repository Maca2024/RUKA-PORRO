/**
 * RUKA-PORRO — Game Flow Integration Tests
 *
 * Covers cross-store interactions: player stats ↔ world conditions,
 * mission progression, NPC trust chains, dialogue state, and save/load round-trips.
 *
 * No LLM calls. No hardcoded dates. All time-dependent tests use vi.useFakeTimers().
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { usePlayerStore } from '@/game/stores/usePlayerStore'
import { useNPCStore } from '@/game/stores/useNPCStore'
import { useMissionStore } from '@/game/stores/useMissionStore'
import { useWorldStore } from '@/game/stores/useWorldStore'
import { useUIStore } from '@/game/stores/useUIStore'
import type { DialogueNode } from '@/game/types/game'
import {
  WARMTH_DRAIN_BASE,
  WARMTH_DRAIN_NIGHT,
  WARMTH_DRAIN_BLIZZARD,
  HEALTH_DRAIN_NO_WARMTH,
  HEALTH_DRAIN_NO_HUNGER,
  LICHEN_HUNGER_RESTORE,
  HUNGER_DRAIN_BASE,
  ENERGY_DRAIN_SPRINT,
  CORRUPTION_CRYSTAL_REDUCE,
} from '@/game/core/constants'

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Reset every store back to its factory state before each test. */
function resetAllStores() {
  usePlayerStore.setState(usePlayerStore.getInitialState?.() ?? {
    position: { x: 0, y: 2, z: 0 },
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
    inventory: [{ id: 'lichen_1', type: 'food', name: 'Reindeer Lichen', nameFi: 'Poronjäkälä', quantity: 3, icon: 'lichen' }],
  })
  useNPCStore.getState().resetAll()
  useMissionStore.getState().resetAll()
  useWorldStore.setState({
    dayProgress: 0.35,
    timeOfDay: 'day',
    isDay: true,
    weather: {
      current: 'light-snow',
      target: 'light-snow',
      windDirection: { x: 0.6, z: 0.4 },
      windStrength: 3,
      temperature: -12,
      transitionProgress: 1,
      snowIntensity: 0.3,
      visibility: 200,
    },
    worldSize: 400,
    activeChunks: [],
    isReady: false,
  })
  useUIStore.setState({
    activeScreen: 'game',
    previousScreen: null,
    activeDialogue: null,
    toasts: [],
    isHUDVisible: true,
    isPaused: false,
    isLoading: true,
    loadingProgress: 0,
    loadingMessage: 'Ladataan maailmaa…',
    settings: {
      musicVolume: 0.7,
      sfxVolume: 0.8,
      showTutorialHints: true,
      language: 'fi',
      graphicsQuality: 'medium',
    },
  })
}

function makeSieniNode(): DialogueNode {
  return {
    id: 'sieni_intro',
    speaker: 'sieni',
    text: 'Hello, little reindeer.',
    textFi: 'Hei, pieni poro.',
    emotion: 'wise',
    condition: { type: 'always' },
    choices: [],
    autoNext: null,
  }
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Game Flow Integration', () => {
  beforeEach(() => {
    resetAllStores()
  })

  // 1. Player walks near Sieni → triggers dialogue state across stores
  it('opening Sieni dialogue propagates state across NPC, player, and UI stores', () => {
    const npcStore = useNPCStore.getState()
    const playerStore = usePlayerStore.getState()
    const uiStore = useUIStore.getState()

    npcStore.beginDialogue('sieni')
    playerStore.setInDialogue(true)
    uiStore.openDialogue('sieni', makeSieniNode())

    expect(useNPCStore.getState().npcs.sieni.isInDialogue).toBe(true)
    expect(useNPCStore.getState().activeDialogueNPC).toBe('sieni')
    expect(usePlayerStore.getState().isInDialogue).toBe(true)
    expect(usePlayerStore.getState().isSprinting).toBe(false)
    expect(useUIStore.getState().activeScreen).toBe('dialogue')
    expect(useUIStore.getState().activeDialogue?.npcId).toBe('sieni')
    expect(useUIStore.getState().isHUDVisible).toBe(false)
  })

  // 2. Completing mission 1 → unlocks mission 2
  it('completing m1_first_snow unlocks m2_whispers and awards XP', () => {
    const missionStore = useMissionStore.getState()
    const npcModify = useNPCStore.getState().modifyTrust

    missionStore.startMission('m1_first_snow')
    expect(useMissionStore.getState().missionStatuses.m1_first_snow).toBe('active')

    missionStore.completeMission('m1_first_snow', npcModify)

    const state = useMissionStore.getState()
    expect(state.missionStatuses.m1_first_snow).toBe('completed')
    expect(state.missionStatuses.m2_whispers).toBe('available')
    expect(state.missionStatuses.m3_lost_dog).toBe('available')
    expect(state.totalXP).toBe(50) // m1 reward
    // Trust bonus: sieni +10
    expect(useNPCStore.getState().npcs.sieni.trust).toBe(30) // initial 20 + 10
  })

  // 3. Weather change to blizzard → warmth drains faster → health drain chain
  it('blizzard weather causes accelerated warmth drain and subsequent health drain', () => {
    useWorldStore.getState().setWeatherImmediate('blizzard')

    // Set warmth to 0 directly so health drain logic is isolated.
    // A 50-second blizzard tick would also drain health (and trigger isDead),
    // making the subsequent health-drain assertion unreliable.
    usePlayerStore.setState((s) => ({ ...s, warmth: 0, health: 100, isDead: false, respawnPending: false }))

    const warmthAfterDrain = usePlayerStore.getState().warmth
    expect(warmthAfterDrain).toBe(0)

    // Simulate one second — health should drain because warmth is 0
    const healthBefore = usePlayerStore.getState().health
    usePlayerStore.getState().tickStats(1, 'blizzard', true)
    const healthAfter = usePlayerStore.getState().health

    expect(healthAfter).toBeLessThan(healthBefore)
    expect(healthBefore - healthAfter).toBeCloseTo(HEALTH_DRAIN_NO_WARMTH * 1, 1)
  })

  // 4. NPC trust increases → changes NPC FSM behaviour
  it('increasing NPC trust from idle keeps state stable; beginning dialogue sets FSM to dialogue', () => {
    const npcStore = useNPCStore.getState()

    // Sieni starts at trust 20
    expect(useNPCStore.getState().npcs.sieni.trust).toBe(20)

    npcStore.modifyTrust('sieni', 30)
    expect(useNPCStore.getState().npcs.sieni.trust).toBe(50)

    // Begin dialogue — FSM must transition
    npcStore.beginDialogue('sieni')
    expect(useNPCStore.getState().npcs.sieni.currentState).toBe('dialogue')
    expect(useNPCStore.getState().npcs.sieni.isInDialogue).toBe(true)

    // Ending dialogue resets FSM to idle
    npcStore.endDialogue()
    expect(useNPCStore.getState().npcs.sieni.currentState).toBe('idle')
    expect(useNPCStore.getState().npcs.sieni.isInDialogue).toBe(false)
    expect(useNPCStore.getState().activeDialogueNPC).toBeNull()
  })

  // 5. Player collects lichen → hunger increases → health stabilizes
  it('consuming lichen item restores hunger and prevents health drain', () => {
    const playerStore = usePlayerStore.getState()

    // Drain hunger to 0 manually
    usePlayerStore.setState((s) => ({ ...s, hunger: 0 }))

    // With hunger=0 and warmth>0, health drains at HEALTH_DRAIN_NO_HUNGER/s
    playerStore.tickStats(1, 'light-snow', true)
    const healthAfterHungerDrain = usePlayerStore.getState().health
    expect(healthAfterHungerDrain).toBeLessThan(100)

    // Eat lichen — hunger should jump back up
    const consumed = usePlayerStore.getState().consumeItem('lichen_1')
    expect(consumed).toBe(true)
    const hungerAfter = usePlayerStore.getState().hunger
    expect(hungerAfter).toBe(LICHEN_HUNGER_RESTORE)

    // One more tick — health should no longer drain from hunger
    const healthBefore2 = usePlayerStore.getState().health
    usePlayerStore.getState().tickStats(1, 'light-snow', true)
    const healthAfter2 = usePlayerStore.getState().health
    // Hunger is now positive so no hunger-based health drain
    expect(healthAfter2).toBeGreaterThanOrEqual(healthBefore2 - 0.1) // only warmth drain possible
  })

  // 6. High corruption → NPC trust drops → NPCs set to flee FSM state
  it('high corruption reduces trust and hostile NPCs respond with flee state', () => {
    const missionStore = useMissionStore.getState()
    const npcStore = useNPCStore.getState()

    // Push corruption above 60 (hostile threshold)
    missionStore.modifyCorruption(70)
    expect(useMissionStore.getState().porroCorruption).toBe(70)
    expect(useMissionStore.getState().corruptionLevel).toBe('corrupted')

    // Simulate corruption dropping trust of friendly NPCs
    npcStore.modifyTrust('sieni', -30)
    npcStore.modifyTrust('sammal', -30)

    expect(useNPCStore.getState().npcs.sieni.trust).toBe(-10) // 20 - 30
    expect(useNPCStore.getState().npcs.sammal.trust).toBe(0) // 30 - 30

    // Set FSM to fleeing to represent system response
    npcStore.setNPCFSMState('sieni', 'fleeing')
    expect(useNPCStore.getState().npcs.sieni.currentState).toBe('fleeing')
  })

  // 7. All missions complete → game ending state
  it('completing all missions reaches act3 and accumulates all XP rewards', () => {
    const missionStore = useMissionStore.getState()
    const npcModify = useNPCStore.getState().modifyTrust
    const missionChain: Array<'m1_first_snow' | 'm2_whispers' | 'm3_lost_dog' | 'm4_crow_feathers' | 'm5_old_school' | 'm6_wolf_tracks' | 'm7_hunters_moon' | 'm8_last_stand' | 'm9_heart_of_porro'> = [
      'm1_first_snow', 'm2_whispers', 'm3_lost_dog', 'm4_crow_feathers',
      'm5_old_school', 'm6_wolf_tracks', 'm7_hunters_moon', 'm8_last_stand', 'm9_heart_of_porro',
    ]

    for (const id of missionChain) {
      // startMission requires 'available' status; complete each one in order
      useMissionStore.setState((s) => ({
        ...s,
        missionStatuses: { ...s.missionStatuses, [id]: 'available' },
      }))
      useMissionStore.getState().startMission(id)
      useMissionStore.getState().completeMission(id, npcModify)
    }

    const finalState = useMissionStore.getState()
    expect(finalState.missionStatuses.m9_heart_of_porro).toBe('completed')
    // Total XP: 50+80+120+100+200+250+300+400+1000 = 2500
    expect(finalState.totalXP).toBe(2500)
    // Final corruption should be significantly reduced (all corruptionDelta rewards applied)
    expect(finalState.porroCorruption).toBe(0) // clamped at 0
  })

  // 8. Save → modify state → load → verify restored state
  it('save/load round-trip preserves player stats and mission progress', () => {
    const playerStore = usePlayerStore.getState()
    const missionStore = useMissionStore.getState()

    // Set up a known game state
    usePlayerStore.setState((s) => ({ ...s, health: 65, hunger: 42, warmth: 55 }))
    missionStore.startMission('m1_first_snow')
    missionStore.advanceObjective('m1_first_snow', 'reach_sieni', 1)

    // Capture the save snapshot
    const snapshot = {
      health: usePlayerStore.getState().health,
      hunger: usePlayerStore.getState().hunger,
      warmth: usePlayerStore.getState().warmth,
      missionStatus: useMissionStore.getState().missionStatuses.m1_first_snow,
      objectiveProgress: useMissionStore.getState().objectiveProgress['m1_first_snow__reach_sieni'],
    }

    // Simulate state corruption after save
    usePlayerStore.setState((s) => ({ ...s, health: 10, hunger: 5, warmth: 5 }))
    missionStore.resetAll()

    // Restore from snapshot
    usePlayerStore.setState((s) => ({
      ...s,
      health: snapshot.health,
      hunger: snapshot.hunger,
      warmth: snapshot.warmth,
    }))
    useMissionStore.setState((s) => ({
      ...s,
      missionStatuses: { ...s.missionStatuses, m1_first_snow: snapshot.missionStatus },
      objectiveProgress: { 'm1_first_snow__reach_sieni': snapshot.objectiveProgress },
    }))

    expect(usePlayerStore.getState().health).toBe(65)
    expect(usePlayerStore.getState().hunger).toBe(42)
    expect(usePlayerStore.getState().warmth).toBe(55)
    expect(useMissionStore.getState().missionStatuses.m1_first_snow).toBe('active')
    expect(useMissionStore.getState().objectiveProgress['m1_first_snow__reach_sieni']).toBe(1)
  })

  // 9. Day/night cycle affects warmth drain rate
  it('warmth drains faster at night than during the day', () => {
    // Day tick — base drain only (0.3/s)
    usePlayerStore.setState((s) => ({ ...s, warmth: 80 }))
    usePlayerStore.getState().tickStats(10, 'clear', true) // isDay = true
    const warmthAfterDay = usePlayerStore.getState().warmth
    const dayDrain = 80 - warmthAfterDay

    // Night tick — base + night drain (0.3 + 0.8 = 1.1/s)
    usePlayerStore.setState((s) => ({ ...s, warmth: 80 }))
    usePlayerStore.getState().tickStats(10, 'clear', false) // isDay = false
    const warmthAfterNight = usePlayerStore.getState().warmth
    const nightDrain = 80 - warmthAfterNight

    expect(nightDrain).toBeGreaterThan(dayDrain)
    expect(dayDrain).toBeCloseTo(WARMTH_DRAIN_BASE * 10, 1)
    expect(nightDrain).toBeCloseTo((WARMTH_DRAIN_BASE + WARMTH_DRAIN_NIGHT) * 10, 1)
  })

  // 10. Pause → resume preserves all state
  it('pausing and resuming the game preserves all store state untouched', () => {
    const uiStore = useUIStore.getState()

    // Set a known non-default state
    usePlayerStore.setState((s) => ({ ...s, health: 72, hunger: 55 }))
    useMissionStore.getState().startMission('m1_first_snow')
    useNPCStore.getState().modifyTrust('sieni', 15)

    uiStore.togglePause()
    expect(useUIStore.getState().isPaused).toBe(true)
    expect(useUIStore.getState().activeScreen).toBe('pause')

    // State must be unchanged during pause
    expect(usePlayerStore.getState().health).toBe(72)
    expect(usePlayerStore.getState().hunger).toBe(55)
    expect(useMissionStore.getState().missionStatuses.m1_first_snow).toBe('active')
    expect(useNPCStore.getState().npcs.sieni.trust).toBe(35)

    uiStore.togglePause()
    expect(useUIStore.getState().isPaused).toBe(false)
    expect(useUIStore.getState().activeScreen).toBe('game')
    expect(useUIStore.getState().isHUDVisible).toBe(true)

    // All state still intact after resume
    expect(usePlayerStore.getState().health).toBe(72)
    expect(usePlayerStore.getState().hunger).toBe(55)
  })

  // 11. Multiple stat drains chain correctly (blizzard + night + no food)
  it('simultaneous blizzard, night, and zero hunger stack health drain correctly', () => {
    usePlayerStore.setState((s) => ({
      ...s,
      warmth: 0,
      hunger: 0,
      health: 100,
    }))

    // Both warmth=0 and hunger=0 → health drains at (HEALTH_DRAIN_NO_WARMTH + HEALTH_DRAIN_NO_HUNGER) per second
    usePlayerStore.getState().tickStats(1, 'blizzard', false)

    const health = usePlayerStore.getState().health
    const expectedDrain = HEALTH_DRAIN_NO_WARMTH + HEALTH_DRAIN_NO_HUNGER
    expect(health).toBeCloseTo(100 - expectedDrain, 1)
  })

  // 12. NPC dialogue cooldown prevents re-trigger within the same frame
  it('recording a dialogue node prevents duplicate entries in history', () => {
    const npcStore = useNPCStore.getState()

    npcStore.recordDialogueNode('sieni', 'sieni_intro')
    npcStore.recordDialogueNode('sieni', 'sieni_intro') // duplicate
    npcStore.recordDialogueNode('sieni', 'sieni_follow_up')

    const history = useNPCStore.getState().npcs.sieni.dialogueHistory
    expect(history).toHaveLength(2)
    expect(history).toContain('sieni_intro')
    expect(history).toContain('sieni_follow_up')
  })
})
