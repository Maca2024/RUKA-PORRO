/**
 * RUKA-PORRO — useMissionStore unit tests
 * Covers: startMission, completeMission, failMission, advanceObjective,
 *         setObjectiveProgress, modifyCorruption, usePurificationCrystal,
 *         setFlag / clearFlag / hasFlag, awardXP, resetAll, prerequisite gating
 */

import { useMissionStore } from '@/game/stores/useMissionStore'
import { getCorruptionLevel } from '@/game/types/game'
import { CORRUPTION_CRYSTAL_REDUCE } from '@/game/core/constants'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function reset() {
  useMissionStore.getState().resetAll()
}

function get() {
  return useMissionStore.getState()
}

const noOpTrust = vi.fn()

// ─── startMission ─────────────────────────────────────────────────────────────

describe('useMissionStore — startMission', () => {
  beforeEach(() => {
    reset()
    noOpTrust.mockClear()
  })

  it('sets activeMissionId when starting an available mission', () => {
    get().startMission('m1_first_snow')
    expect(get().activeMissionId).toBe('m1_first_snow')
  })

  it('changes mission status to active', () => {
    get().startMission('m1_first_snow')
    expect(get().missionStatuses['m1_first_snow']).toBe('active')
  })

  it('initialises objective progress to 0 for all objectives', () => {
    get().startMission('m1_first_snow')
    expect(get().objectiveProgress['m1_first_snow__reach_sieni']).toBe(0)
    expect(get().objectiveProgress['m1_first_snow__talk_sieni']).toBe(0)
  })

  it('is a no-op for a locked mission (prerequisites not met)', () => {
    // m2_whispers requires m1_first_snow completed
    get().startMission('m2_whispers')
    expect(get().activeMissionId).toBeNull()
    expect(get().missionStatuses['m2_whispers']).toBe('locked')
  })

  it('is a no-op if the mission is already active', () => {
    get().startMission('m1_first_snow')
    const firstActive = get().activeMissionId
    get().startMission('m1_first_snow') // second call
    expect(get().activeMissionId).toBe(firstActive)
  })

  it('is a no-op if the mission has been completed', () => {
    // Manually mark as completed
    useMissionStore.setState((s) => ({
      ...s,
      missionStatuses: { ...s.missionStatuses, m1_first_snow: 'completed' },
    }))
    get().startMission('m1_first_snow')
    // status should remain completed, not become active
    expect(get().missionStatuses['m1_first_snow']).toBe('completed')
  })

  it('does not start a mission that has prerequisites still locked', () => {
    // m5_old_school needs m3 + m4 which need m1 + m2
    get().startMission('m5_old_school')
    expect(get().activeMissionId).toBeNull()
  })
})

// ─── completeMission ──────────────────────────────────────────────────────────

describe('useMissionStore — completeMission', () => {
  beforeEach(() => {
    reset()
    noOpTrust.mockClear()
  })

  it('sets mission status to completed', () => {
    get().startMission('m1_first_snow')
    get().completeMission('m1_first_snow', noOpTrust)
    expect(get().missionStatuses['m1_first_snow']).toBe('completed')
  })

  it('clears activeMissionId when the active mission is completed', () => {
    get().startMission('m1_first_snow')
    get().completeMission('m1_first_snow', noOpTrust)
    expect(get().activeMissionId).toBeNull()
  })

  it('awards XP from mission reward', () => {
    get().startMission('m1_first_snow')
    const before = get().totalXP
    get().completeMission('m1_first_snow', noOpTrust)
    expect(get().totalXP).toBe(before + 50) // m1 rewards 50 XP
  })

  it('unlocks follow-up missions after completion', () => {
    get().startMission('m1_first_snow')
    get().completeMission('m1_first_snow', noOpTrust)
    // m2 and m3 both have m1 as only prerequisite
    expect(get().missionStatuses['m2_whispers']).toBe('available')
    expect(get().missionStatuses['m3_lost_dog']).toBe('available')
  })

  it('calls npcTrustUpdater with correct NPC and delta', () => {
    get().startMission('m1_first_snow')
    get().completeMission('m1_first_snow', noOpTrust)
    // m1 grants sieni +10 trust
    expect(noOpTrust).toHaveBeenCalledWith('sieni', 10)
  })

  it('applies corruptionDelta from reward', () => {
    // Manually unlock and complete m2 which has corruptionDelta: -5
    useMissionStore.setState((s) => ({
      ...s,
      missionStatuses: { ...s.missionStatuses, m2_whispers: 'active' },
      porroCorruption: 20,
      corruptionLevel: getCorruptionLevel(20),
    }))
    get().completeMission('m2_whispers', noOpTrust)
    expect(get().porroCorruption).toBe(15)
  })

  it('is a no-op when mission is not in active status', () => {
    // m1 is 'available', not 'active'
    get().completeMission('m1_first_snow', noOpTrust)
    expect(get().missionStatuses['m1_first_snow']).toBe('available')
  })

  it('does not unlock missions whose other prerequisites are still locked', () => {
    // m4 requires m2 which requires m1 — only completing m1 should not unlock m4
    get().startMission('m1_first_snow')
    get().completeMission('m1_first_snow', noOpTrust)
    expect(get().missionStatuses['m4_crow_feathers']).toBe('locked')
  })
})

// ─── failMission ──────────────────────────────────────────────────────────────

describe('useMissionStore — failMission', () => {
  beforeEach(() => reset())

  it('sets mission back to available on failure', () => {
    get().startMission('m1_first_snow')
    get().failMission('m1_first_snow')
    expect(get().missionStatuses['m1_first_snow']).toBe('available')
  })

  it('clears activeMissionId on failure', () => {
    get().startMission('m1_first_snow')
    get().failMission('m1_first_snow')
    expect(get().activeMissionId).toBeNull()
  })

  it('is a no-op for a non-active mission', () => {
    get().failMission('m1_first_snow') // still 'available'
    expect(get().missionStatuses['m1_first_snow']).toBe('available')
  })
})

// ─── advanceObjective / setObjectiveProgress ──────────────────────────────────

describe('useMissionStore — advanceObjective', () => {
  beforeEach(() => {
    reset()
    get().startMission('m1_first_snow')
  })

  it('increments objective progress by 1 by default', () => {
    get().advanceObjective('m1_first_snow', 'reach_sieni')
    expect(get().objectiveProgress['m1_first_snow__reach_sieni']).toBe(1)
  })

  it('increments by a custom delta', () => {
    get().advanceObjective('m1_first_snow', 'reach_sieni', 1)
    get().advanceObjective('m1_first_snow', 'reach_sieni', 1)
    // count for reach_sieni is 1, so caps at 1
    expect(get().objectiveProgress['m1_first_snow__reach_sieni']).toBe(1)
  })

  it('never exceeds the objective count', () => {
    get().advanceObjective('m1_first_snow', 'reach_sieni', 99)
    expect(get().objectiveProgress['m1_first_snow__reach_sieni']).toBe(1)
  })

  it('is a no-op for an unknown objective id', () => {
    get().advanceObjective('m1_first_snow', 'fake_objective')
    expect(get().objectiveProgress['m1_first_snow__fake_objective']).toBeUndefined()
  })

  it('advances multiple objectives independently', () => {
    get().advanceObjective('m1_first_snow', 'reach_sieni')
    get().advanceObjective('m1_first_snow', 'talk_sieni')
    expect(get().objectiveProgress['m1_first_snow__reach_sieni']).toBe(1)
    expect(get().objectiveProgress['m1_first_snow__talk_sieni']).toBe(1)
  })
})

describe('useMissionStore — setObjectiveProgress', () => {
  beforeEach(() => {
    reset()
    get().startMission('m2_whispers')
  })

  it('sets progress directly', () => {
    // m2 collect_lichen count = 3
    useMissionStore.setState((s) => ({
      ...s,
      missionStatuses: { ...s.missionStatuses, m2_whispers: 'active' },
      objectiveProgress: { ...s.objectiveProgress, 'm2_whispers__collect_lichen': 0 },
    }))
    get().setObjectiveProgress('m2_whispers', 'collect_lichen', 2)
    expect(get().objectiveProgress['m2_whispers__collect_lichen']).toBe(2)
  })

  it('clamps to the objective maximum', () => {
    useMissionStore.setState((s) => ({
      ...s,
      missionStatuses: { ...s.missionStatuses, m2_whispers: 'active' },
      objectiveProgress: { ...s.objectiveProgress, 'm2_whispers__collect_lichen': 0 },
    }))
    get().setObjectiveProgress('m2_whispers', 'collect_lichen', 99)
    expect(get().objectiveProgress['m2_whispers__collect_lichen']).toBe(3)
  })

  it('clamps to 0 minimum', () => {
    useMissionStore.setState((s) => ({
      ...s,
      missionStatuses: { ...s.missionStatuses, m2_whispers: 'active' },
      objectiveProgress: { ...s.objectiveProgress, 'm2_whispers__collect_lichen': 2 },
    }))
    get().setObjectiveProgress('m2_whispers', 'collect_lichen', -5)
    expect(get().objectiveProgress['m2_whispers__collect_lichen']).toBe(0)
  })
})

// ─── modifyCorruption ─────────────────────────────────────────────────────────

describe('useMissionStore — modifyCorruption', () => {
  beforeEach(() => reset())

  it('increases corruption by a positive delta', () => {
    get().modifyCorruption(25)
    expect(get().porroCorruption).toBe(25)
  })

  it('decreases corruption by a negative delta', () => {
    useMissionStore.setState((s) => ({ ...s, porroCorruption: 50 }))
    get().modifyCorruption(-10)
    expect(get().porroCorruption).toBe(40)
  })

  it('clamps to 0 when delta pushes below 0', () => {
    get().modifyCorruption(-999)
    expect(get().porroCorruption).toBe(0)
  })

  it('clamps to 100 when delta pushes above 100', () => {
    get().modifyCorruption(999)
    expect(get().porroCorruption).toBe(100)
  })

  it('updates corruptionLevel when crossing a threshold', () => {
    get().modifyCorruption(25) // 25 → 'touched'
    expect(get().corruptionLevel).toBe('touched')
  })

  it('corruption levels match thresholds: pure ≤ 20', () => {
    get().modifyCorruption(20)
    expect(get().corruptionLevel).toBe('pure')
  })

  it('corruption level is influenced at 41', () => {
    get().modifyCorruption(41)
    expect(get().corruptionLevel).toBe('influenced')
  })

  it('corruption level is consumed at 100', () => {
    get().modifyCorruption(100)
    expect(get().corruptionLevel).toBe('consumed')
  })
})

// ─── usePurificationCrystal ───────────────────────────────────────────────────

describe('useMissionStore — usePurificationCrystal', () => {
  beforeEach(() => reset())

  it('reduces corruption by CORRUPTION_CRYSTAL_REDUCE', () => {
    useMissionStore.setState((s) => ({
      ...s, porroCorruption: 50, corruptionLevel: getCorruptionLevel(50),
    }))
    get().usePurificationCrystal()
    expect(get().porroCorruption).toBe(50 - CORRUPTION_CRYSTAL_REDUCE)
  })

  it('does not reduce below 0', () => {
    useMissionStore.setState((s) => ({
      ...s, porroCorruption: 5, corruptionLevel: getCorruptionLevel(5),
    }))
    get().usePurificationCrystal()
    expect(get().porroCorruption).toBe(0)
  })

  it('updates corruptionLevel after crystal use', () => {
    useMissionStore.setState((s) => ({
      ...s, porroCorruption: 30, corruptionLevel: 'touched',
    }))
    get().usePurificationCrystal() // 30 - 15 = 15 → pure
    expect(get().corruptionLevel).toBe('pure')
  })
})

// ─── Story flags ──────────────────────────────────────────────────────────────

describe('useMissionStore — story flags', () => {
  beforeEach(() => reset())

  it('setFlag marks a flag as set', () => {
    get().setFlag('chapter_1_intro_seen')
    expect(get().hasFlag('chapter_1_intro_seen')).toBe(true)
  })

  it('clearFlag removes a flag', () => {
    get().setFlag('my_flag')
    get().clearFlag('my_flag')
    expect(get().hasFlag('my_flag')).toBe(false)
  })

  it('hasFlag returns false for a flag that was never set', () => {
    expect(get().hasFlag('nonexistent_flag')).toBe(false)
  })

  it('multiple flags can coexist', () => {
    get().setFlag('flag_a')
    get().setFlag('flag_b')
    expect(get().hasFlag('flag_a')).toBe(true)
    expect(get().hasFlag('flag_b')).toBe(true)
  })

  it('clearing one flag does not affect others', () => {
    get().setFlag('flag_a')
    get().setFlag('flag_b')
    get().clearFlag('flag_a')
    expect(get().hasFlag('flag_b')).toBe(true)
  })

  it('flags survive a mission completion call', () => {
    get().setFlag('persistent_story_flag')
    get().startMission('m1_first_snow')
    get().completeMission('m1_first_snow', noOpTrust)
    expect(get().hasFlag('persistent_story_flag')).toBe(true)
  })

  it('resetAll clears all flags', () => {
    get().setFlag('flag_x')
    get().resetAll()
    expect(get().hasFlag('flag_x')).toBe(false)
  })
})

// ─── awardXP ──────────────────────────────────────────────────────────────────

describe('useMissionStore — awardXP', () => {
  beforeEach(() => reset())

  it('adds XP to totalXP', () => {
    get().awardXP(100)
    expect(get().totalXP).toBe(100)
  })

  it('accumulates across multiple calls', () => {
    get().awardXP(50)
    get().awardXP(75)
    expect(get().totalXP).toBe(125)
  })
})

// ─── resetAll ─────────────────────────────────────────────────────────────────

describe('useMissionStore — resetAll', () => {
  beforeEach(() => reset())

  it('resets totalXP to 0', () => {
    get().awardXP(500)
    get().resetAll()
    expect(get().totalXP).toBe(0)
  })

  it('resets porroCorruption to 0', () => {
    get().modifyCorruption(60)
    get().resetAll()
    expect(get().porroCorruption).toBe(0)
  })

  it('resets activeMissionId to null', () => {
    get().startMission('m1_first_snow')
    get().resetAll()
    expect(get().activeMissionId).toBeNull()
  })

  it('resets m1_first_snow back to available', () => {
    get().startMission('m1_first_snow')
    get().completeMission('m1_first_snow', noOpTrust)
    get().resetAll()
    expect(get().missionStatuses['m1_first_snow']).toBe('available')
  })

  it('resets all other missions to locked', () => {
    get().startMission('m1_first_snow')
    get().completeMission('m1_first_snow', noOpTrust)
    get().resetAll()
    expect(get().missionStatuses['m2_whispers']).toBe('locked')
  })

  it('clears objectiveProgress', () => {
    get().startMission('m1_first_snow')
    get().advanceObjective('m1_first_snow', 'reach_sieni')
    get().resetAll()
    expect(Object.keys(get().objectiveProgress)).toHaveLength(0)
  })
})
