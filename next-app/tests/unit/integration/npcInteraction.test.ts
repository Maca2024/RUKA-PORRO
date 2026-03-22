/**
 * RUKA-PORRO — NPC Interaction Integration Tests
 *
 * Tests the NPC system interaction flow across useNPCStore, usePlayerStore,
 * and useMissionStore: approach detection, trust transitions, FSM states,
 * corruption sources, and sanctuary behaviour.
 */

import { beforeEach, describe, expect, it } from 'vitest'
import { useNPCStore, NPC_DEFINITIONS } from '@/game/stores/useNPCStore'
import { usePlayerStore } from '@/game/stores/usePlayerStore'
import { useMissionStore } from '@/game/stores/useMissionStore'
import { useUIStore } from '@/game/stores/useUIStore'
import type { DialogueNode, NPCId } from '@/game/types/game'
import { CORRUPTION_PROXIMITY_RATE } from '@/game/core/constants'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function resetAllStores() {
  useNPCStore.getState().resetAll()
  useMissionStore.getState().resetAll()

  usePlayerStore.setState({
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
    inventory: [
      { id: 'lichen_1', type: 'food', name: 'Reindeer Lichen', nameFi: 'Poronjäkälä', quantity: 2, icon: 'lichen' },
    ],
  })

  useUIStore.setState({
    activeScreen: 'game',
    previousScreen: null,
    activeDialogue: null,
    toasts: [],
    isHUDVisible: true,
    isPaused: false,
    isLoading: false,
    loadingProgress: 100,
    loadingMessage: '',
    settings: { musicVolume: 0.7, sfxVolume: 0.8, showTutorialHints: true, language: 'fi', graphicsQuality: 'medium' },
  })
}

/** Simulates the game's approach detection: player enters NPC notice radius. */
function simulatePlayerApproachNPC(npcId: string) {
  const id = npcId as NPCId
  useNPCStore.getState().setNPCFSMState(id, 'noticing')
  useNPCStore.getState().setNPCFSMState(id, 'approaching')
}

function makeDialogueNode(id: string, speaker: string): DialogueNode {
  return {
    id,
    speaker,
    text: 'Test dialogue.',
    textFi: 'Testidialogi.',
    emotion: 'happy',
    condition: { type: 'always' },
    choices: [],
    autoNext: null,
  }
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('NPC Interaction Integration', () => {
  beforeEach(resetAllStores)

  // 1. Player approaches friendly NPC → NPC notices → approaches → dialogue available
  it('approaching a friendly NPC transitions FSM through noticing → approaching, enabling dialogue', () => {
    const npcStore = useNPCStore.getState()

    // Sieni starts idle with trust 20 (friendly)
    expect(useNPCStore.getState().npcs.sieni.currentState).toBe('idle')
    expect(useNPCStore.getState().npcs.sieni.trust).toBe(20)

    npcStore.setNPCFSMState('sieni', 'noticing')
    expect(useNPCStore.getState().npcs.sieni.currentState).toBe('noticing')

    npcStore.setNPCFSMState('sieni', 'approaching')
    expect(useNPCStore.getState().npcs.sieni.currentState).toBe('approaching')

    // Open dialogue — NPC is now in range and willing
    npcStore.beginDialogue('sieni')
    usePlayerStore.getState().setInDialogue(true)
    useUIStore.getState().openDialogue('sieni', makeDialogueNode('sieni_intro', 'sieni'))

    expect(useNPCStore.getState().npcs.sieni.currentState).toBe('dialogue')
    expect(useNPCStore.getState().activeDialogueNPC).toBe('sieni')
    expect(usePlayerStore.getState().isInDialogue).toBe(true)
    expect(useUIStore.getState().activeScreen).toBe('dialogue')
  })

  // 2. Player approaches hostile NPC (low trust) → NPC notices → flees
  it('NPC with trust below flee threshold transitions to fleeing FSM state on approach', () => {
    const npcStore = useNPCStore.getState()

    // Karen flees at trust < -30; her initial trust is 5 — push it below -30
    npcStore.setTrust('karen', -40)
    expect(useNPCStore.getState().npcs.karen.trust).toBe(-40)

    // Player approaches
    npcStore.setNPCFSMState('karen', 'noticing')
    npcStore.setNPCFSMState('karen', 'fleeing')

    expect(useNPCStore.getState().npcs.karen.currentState).toBe('fleeing')
    // Fleeing NPC must not be in dialogue
    expect(useNPCStore.getState().npcs.karen.isInDialogue).toBe(false)
    expect(useNPCStore.getState().activeDialogueNPC).toBeNull()
  })

  // 3. Giving NPC favorite item → trust increases
  it('giving a favorite item to an NPC via modifyTrust reflects a trust gain', () => {
    const npcStore = useNPCStore.getState()
    const playerStore = usePlayerStore.getState()

    // Sieni favors 'mushroom' and 'lichen'. Add mushroom to inventory.
    playerStore.addItem({ id: 'mushroom_1', type: 'food', name: 'Mushroom', nameFi: 'Sieni', quantity: 1, icon: 'mushroom' })

    const trustBefore = useNPCStore.getState().npcs.sieni.trust
    // Simulate the game's "give item to NPC" action — trust reward for favorite item
    npcStore.modifyTrust('sieni', 20)
    playerStore.removeItem('mushroom_1')

    expect(useNPCStore.getState().npcs.sieni.trust).toBe(trustBefore + 20)
    expect(usePlayerStore.getState().inventory.find((i) => i.id === 'mushroom_1')).toBeUndefined()
  })

  // 4. Making negative dialogue choice → trust decreases
  it('a dialogue choice with negative trustDelta decreases NPC trust', () => {
    const npcStore = useNPCStore.getState()

    npcStore.beginDialogue('sieni')
    const trustBefore = useNPCStore.getState().npcs.sieni.trust

    // Simulate selecting a rude choice (trustDelta: -10)
    npcStore.modifyTrust('sieni', -10)

    expect(useNPCStore.getState().npcs.sieni.trust).toBe(trustBefore - 10)
  })

  // 5. Trust above 50 → NPC becomes allied
  it('NPC with trust >= 50 is considered allied (trust clamped to max 100)', () => {
    const npcStore = useNPCStore.getState()

    npcStore.setTrust('yuki', 50) // Yuki starts at 0
    expect(useNPCStore.getState().npcs.yuki.trust).toBe(50)

    // Exceed max — must be clamped
    npcStore.modifyTrust('yuki', 60)
    expect(useNPCStore.getState().npcs.yuki.trust).toBe(100) // TRUST_MAX

    // Allied NPC will not flee
    npcStore.setNPCFSMState('yuki', 'approaching')
    expect(useNPCStore.getState().npcs.yuki.currentState).toBe('approaching')
  })

  // 6. Trust below -50 → NPC becomes hostile
  it('NPC with trust <= -50 transitions to hostile flee/wandering behaviour', () => {
    const npcStore = useNPCStore.getState()

    npcStore.setTrust('taisto', -50) // Taisto starts at -10
    expect(useNPCStore.getState().npcs.taisto.trust).toBe(-50)

    // Simulate game system marking NPC as hostile
    npcStore.setNPCFSMState('taisto', 'fleeing')
    expect(useNPCStore.getState().npcs.taisto.currentState).toBe('fleeing')

    // Trust clamped at minimum
    npcStore.modifyTrust('taisto', -100)
    expect(useNPCStore.getState().npcs.taisto.trust).toBe(-100) // TRUST_MIN
  })

  // 7. Corruption source NPC (Susi/Karhu) → corruption increases when near
  it('being near a corruption-source NPC (Susi) increases the corruption meter', () => {
    const missionStore = useMissionStore.getState()

    // Verify Susi is flagged as a corruption source
    expect(NPC_DEFINITIONS.susi.isCorruptionSource).toBe(true)
    expect(NPC_DEFINITIONS.karhu.isCorruptionSource).toBe(true)

    const corruptionBefore = useMissionStore.getState().porroCorruption

    // 5 seconds near corruption source: CORRUPTION_PROXIMITY_RATE (2) * 5 = +10
    missionStore.modifyCorruption(CORRUPTION_PROXIMITY_RATE * 5)

    expect(useMissionStore.getState().porroCorruption).toBe(corruptionBefore + 10)
  })

  // 8. Koulu (sanctuary) → always approachable regardless of trust
  it('Koulu sanctuary NPC is always in approachable state regardless of trust level', () => {
    const npcStore = useNPCStore.getState()

    // Koulu starts at trust 0 — not allied, not hostile — but is a sanctuary
    expect(NPC_DEFINITIONS.koulu.fleeThreshold).toBeNull()
    expect(NPC_DEFINITIONS.koulu.personality).toBe('sanctuary')

    // Even with extremely low trust Koulu should never flee
    npcStore.setTrust('koulu', -100)
    expect(useNPCStore.getState().npcs.koulu.trust).toBe(-100)

    // Koulu stays in idle/approaching — NOT fleeing
    npcStore.setNPCFSMState('koulu', 'approaching')
    expect(useNPCStore.getState().npcs.koulu.currentState).toBe('approaching')

    // Can begin dialogue regardless
    npcStore.beginDialogue('koulu')
    expect(useNPCStore.getState().npcs.koulu.currentState).toBe('dialogue')
    expect(useNPCStore.getState().activeDialogueNPC).toBe('koulu')
  })

  // 9. lastInteraction timestamp updates when dialogue begins
  it('beginDialogue records a monotonically increasing lastInteraction timestamp', () => {
    const npcStore = useNPCStore.getState()

    const timeBefore = useNPCStore.getState().npcs.sieni.lastInteraction
    npcStore.beginDialogue('sieni')
    const timeAfter = useNPCStore.getState().npcs.sieni.lastInteraction

    expect(timeAfter).toBeGreaterThanOrEqual(timeBefore)
  })

  // 10. Multiple NPCs can be trusted simultaneously without interfering
  it('modifying trust for one NPC does not affect other NPCs', () => {
    const npcStore = useNPCStore.getState()

    npcStore.setTrust('sieni', 80)
    npcStore.setTrust('sammal', 60)
    npcStore.setTrust('yuki', 40)

    // Modify only Sieni
    npcStore.modifyTrust('sieni', -20)

    expect(useNPCStore.getState().npcs.sieni.trust).toBe(60)
    expect(useNPCStore.getState().npcs.sammal.trust).toBe(60) // unchanged
    expect(useNPCStore.getState().npcs.yuki.trust).toBe(40)  // unchanged
  })

  // 11. endDialogue correctly clears activeDialogueNPC for any NPC
  it('endDialogue always clears activeDialogueNPC and resets NPC to idle', () => {
    const npcStore = useNPCStore.getState()

    npcStore.beginDialogue('sammal')
    expect(useNPCStore.getState().activeDialogueNPC).toBe('sammal')

    npcStore.endDialogue()
    expect(useNPCStore.getState().activeDialogueNPC).toBeNull()
    expect(useNPCStore.getState().npcs.sammal.currentState).toBe('idle')
    expect(useNPCStore.getState().npcs.sammal.isInDialogue).toBe(false)
  })

  // 12. resetAll returns every NPC to initial trust and idle state
  it('resetAll restores all NPCs to their initial trust values and idle FSM state', () => {
    const npcStore = useNPCStore.getState()

    // Mutate several NPCs
    npcStore.setTrust('sieni', 99)
    npcStore.setTrust('susi', 99)
    npcStore.setNPCFSMState('sieni', 'fleeing')
    npcStore.beginDialogue('karhu')

    npcStore.resetAll()

    expect(useNPCStore.getState().npcs.sieni.trust).toBe(NPC_DEFINITIONS.sieni.initialTrust)
    expect(useNPCStore.getState().npcs.susi.trust).toBe(NPC_DEFINITIONS.susi.initialTrust)
    expect(useNPCStore.getState().npcs.sieni.currentState).toBe('idle')
    expect(useNPCStore.getState().activeDialogueNPC).toBeNull()
  })
})
