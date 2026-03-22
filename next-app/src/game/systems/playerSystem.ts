/**
 * RUKA-PORRO — Player system
 * Pure system — ticked every frame by GameLoop.
 * Delegates stat drains/gains to usePlayerStore.tickStats,
 * then handles interaction detection and respawn sequencing.
 */

import { usePlayerStore } from '../stores/usePlayerStore'
import { useNPCStore, NPC_DEFINITIONS } from '../stores/useNPCStore'
import { useWorldStore } from '../stores/useWorldStore'
import { useUIStore } from '../stores/useUIStore'
import { distanceXZ } from '@/lib/math'
import {
  NPC_DIALOGUE_RADIUS,
} from '../core/constants'
import type { NPCId } from '../types/game'

// ─── Internal state ────────────────────────────────────────────────────────────

/** Cooldown in seconds before we can open another dialogue after closing one. */
const DIALOGUE_COOLDOWN = 2.0

/** Map of NPC ID → seconds remaining in its individual dialogue cooldown. */
const dialogueCooldowns: Partial<Record<NPCId, number>> = {}

// ─── System ───────────────────────────────────────────────────────────────────

export const playerSystem = {
  /**
   * Main per-frame tick.
   * Called by GameLoop with the capped delta (seconds).
   */
  tick(delta: number): void {
    const playerState = usePlayerStore.getState()

    // Skip all processing while dead / respawning
    if (playerState.isDead || playerState.respawnPending) {
      this._tickRespawn()
      return
    }

    // Drain/regen survival stats via the store's own logic
    const worldState = useWorldStore.getState()
    playerState.tickStats(delta, worldState.weather.current, worldState.isDay)

    // Cool down per-NPC dialogue timers
    this._tickDialogueCooldowns(delta)

    // Check interactions only when not already in dialogue
    if (!playerState.isInDialogue) {
      this.handleInteraction()
    }
  },

  /**
   * Checks proximity to NPCs and food items each frame,
   * triggering dialogue or consumption as appropriate.
   */
  handleInteraction(): void {
    const player = usePlayerStore.getState()
    const { npcs } = useNPCStore.getState()
    const ui = useUIStore.getState()

    // Already busy with a dialogue — skip
    if (ui.activeScreen === 'dialogue') return

    const playerPos = player.position

    for (const rawId in npcs) {
      const npcId = rawId as NPCId
      const npcState = npcs[npcId]
      const npcDef = NPC_DEFINITIONS[npcId]

      // Skip NPCs that are already in dialogue or fleeing
      if (npcState.currentState === 'dialogue' || npcState.currentState === 'fleeing') continue

      // Skip if this NPC has a dialogue cooldown active
      const cooldown = dialogueCooldowns[npcId] ?? 0
      if (cooldown > 0) continue

      const dist = distanceXZ(playerPos, npcState.position)

      if (dist <= NPC_DIALOGUE_RADIUS) {
        // Stationary NPCs (sanctuary, crow) auto-open dialogue on proximity.
        // Moving NPCs must be in the 'approaching' state first.
        const isStationary = npcDef.wanderSpeed === 0
        const isApproaching = npcState.currentState === 'approaching'

        if (isStationary || isApproaching) {
          this._openDialogueWith(npcId)
          return // only open one dialogue per frame
        }
      }
    }

    // Food proximity check — consume lichen on the ground within 3 units.
    // In this iteration food items are in the inventory, not as world objects,
    // so this is a stub hook for future world-item collision detection.
    // (World items will call player.addItem() themselves via R3F collision events.)
  },

  /**
   * Triggered when the "nap" respawn animation has finished.
   * Resets stats and teleports the player to the nearest shelter.
   */
  respawn(): void {
    usePlayerStore.getState().completeRespawn()

    // Notify the UI to fade back in
    const ui = useUIStore.getState()
    if (ui.activeScreen !== 'game') {
      ui.closeOverlay()
    }

    ui.addToast({
      type: 'warning',
      message: 'Porro woke up from a little nap…',
      messageFi: 'Porro heräsi pieniltä unilta…',
      icon: 'moon',
      duration: 4000,
    })
  },

  // ─── Private helpers ────────────────────────────────────────────────────────

  /** Watch respawnPending and fire respawn() after the nap delay. */
  _tickRespawn(): void {
    const player = usePlayerStore.getState()
    // respawnPending stays true until the animation component calls completeRespawn().
    // The animation system reads player.respawnPending and drives the cinematic.
    // We set a deferred call here as a fallback if no animation is running
    // (e.g. during tests or before the 3-D scene loads).
    if (player.respawnPending && !this._respawnScheduled) {
      this._respawnScheduled = true
      setTimeout(() => {
        this.respawn()
        this._respawnScheduled = false
      }, 3000)
    }
  },

  /** Sentinel to prevent stacking multiple setTimeout calls. */
  _respawnScheduled: false,

  /** Decrement all per-NPC dialogue cooldown timers. */
  _tickDialogueCooldowns(delta: number): void {
    for (const rawId in dialogueCooldowns) {
      const npcId = rawId as NPCId
      const remaining = dialogueCooldowns[npcId] ?? 0
      if (remaining > 0) {
        dialogueCooldowns[npcId] = Math.max(0, remaining - delta)
      }
    }
  },

  /** Start a dialogue session with `npcId` and freeze both parties. */
  _openDialogueWith(npcId: NPCId): void {
    const npcStore = useNPCStore.getState()
    const playerStore = usePlayerStore.getState()

    npcStore.beginDialogue(npcId)
    playerStore.setInDialogue(true)

    // The UI store / DialogueSystem drives the actual node tree.
    // We just register the cooldown so we don't re-trigger immediately.
    dialogueCooldowns[npcId] = DIALOGUE_COOLDOWN
  },
}
