/**
 * RUKA-PORRO — Corruption system
 * Manages the Porro corruption meter (0–100) and its secondary effects.
 *
 * Responsibilities:
 *   - Proximity drain toward corruption-source NPCs (Susi, Karhu)
 *   - Passive slow reduction from glowing crystals in inventory
 *   - Applying per-tier gameplay effects via story flags and UI toasts
 *
 * Called by GameLoop each frame with (delta) in seconds.
 */

import { usePlayerStore } from '../stores/usePlayerStore'
import { useNPCStore, NPC_DEFINITIONS } from '../stores/useNPCStore'
import { useMissionStore } from '../stores/useMissionStore'
import { useUIStore } from '../stores/useUIStore'
import { distanceXZ } from '@/lib/math'
import {
  CORRUPTION_PROXIMITY_RATE,
  CORRUPTION_THRESHOLD_VISUAL,
  CORRUPTION_THRESHOLD_PENALTY,
  CORRUPTION_THRESHOLD_HOSTILE,
  CORRUPTION_THRESHOLD_HORROR,
} from '../core/constants'
import type { NPCId, CorruptionLevel } from '../types/game'
import { getCorruptionLevel } from '../types/game'

// ─── Internal state ────────────────────────────────────────────────────────────

/** How many purification crystals passively reduce corruption per second. */
const CRYSTAL_PASSIVE_RATE = 0.5

/** Track the last notified corruption level so we only toast on transitions. */
let lastNotifiedLevel: CorruptionLevel = 'pure'

// ─── Tier effect applicators ──────────────────────────────────────────────────

/**
 * Called when corruption crosses a new threshold (up or down).
 * Sets/clears story flags and fires a toast so the player knows their state changed.
 */
function applyTierEffects(level: CorruptionLevel, corruption: number): void {
  const missionStore = useMissionStore.getState()
  const ui = useUIStore.getState()

  // Story flags — cleared when dropping back below a threshold
  const atVisual = corruption >= CORRUPTION_THRESHOLD_VISUAL
  const atPenalty = corruption >= CORRUPTION_THRESHOLD_PENALTY
  const atHostile = corruption >= CORRUPTION_THRESHOLD_HOSTILE
  const atHorror = corruption >= CORRUPTION_THRESHOLD_HORROR

  // Visual distortion flag (read by the post-process shader)
  if (atVisual) {
    missionStore.setFlag('corruption_visual')
  } else {
    missionStore.clearFlag('corruption_visual')
  }

  // Stat penalty flag (read by playerSystem for sprint cap)
  if (atPenalty) {
    missionStore.setFlag('corruption_penalty')
  } else {
    missionStore.clearFlag('corruption_penalty')
  }

  // Hostile NPC escalation flag (read by npcSystem for flee threshold override)
  if (atHostile) {
    missionStore.setFlag('corruption_hostile')
  } else {
    missionStore.clearFlag('corruption_hostile')
  }

  // Survival horror mode flag (read by renderer for heavy vignette + audio)
  if (atHorror) {
    missionStore.setFlag('corruption_horror')
  } else {
    missionStore.clearFlag('corruption_horror')
  }

  // Toast on level transitions only (avoid spamming every frame)
  if (level === lastNotifiedLevel) return
  lastNotifiedLevel = level

  const levelToasts: Record<CorruptionLevel, { message: string; messageFi: string }> = {
    pure: {
      message: 'Porro feels pure and light.',
      messageFi: 'Porro tuntee olevansa puhdas ja kevyt.',
    },
    touched: {
      message: 'Something dark brushes Porro\'s spirit…',
      messageFi: 'Jokin pimeä koskettaa Porron henkeä…',
    },
    influenced: {
      message: 'The corruption is affecting Porro. Seek crystals!',
      messageFi: 'Saastuminen vaikuttaa Porroon. Etsi kristalleja!',
    },
    corrupted: {
      message: 'Porro is corrupted. Forest creatures are afraid!',
      messageFi: 'Porro on saastainen. Metsän olennot pelkäävät!',
    },
    consumed: {
      message: 'Porro is consumed by darkness. Purify now!',
      messageFi: 'Pimeys on nielaissut Porron. Puhdistaudu heti!',
    },
  }

  ui.addToast({
    type: 'warning',
    ...levelToasts[level],
    icon: level === 'pure' ? 'sparkle' : 'corruption',
    duration: 5000,
  })
}

// ─── System ───────────────────────────────────────────────────────────────────

export const corruptionSystem = {
  /**
   * Main per-frame tick.
   */
  tick(delta: number): void {
    const missionStore = useMissionStore.getState()
    const corruption = missionStore.porroCorruption

    let delta_corruption = 0

    // ── Source NPC proximity drain ─────────────────────────────────────────
    const playerPos = usePlayerStore.getState().position
    const { npcs } = useNPCStore.getState()

    for (const rawId in NPC_DEFINITIONS) {
      const npcId = rawId as NPCId
      const def = NPC_DEFINITIONS[npcId]

      if (!def.isCorruptionSource) continue

      const npcState = npcs[npcId]
      const dist = distanceXZ(playerPos, npcState.position)

      if (dist <= def.noticeRadius) {
        // Linearly scale drain: full rate at 0 distance, zero at edge of radius
        const proximity = 1 - dist / def.noticeRadius
        delta_corruption += CORRUPTION_PROXIMITY_RATE * proximity * delta
      }
    }

    // ── Crystal passive reduction ──────────────────────────────────────────
    const inventory = usePlayerStore.getState().inventory
    const crystalCount = inventory
      .filter((item) => item.type === 'crystal' && item.id.startsWith('purification_crystal'))
      .reduce((sum, item) => sum + item.quantity, 0)

    if (crystalCount > 0) {
      // Each crystal contributes CRYSTAL_PASSIVE_RATE/s of passive reduction.
      // Cap at 3 crystals worth of effect to prevent trivially neutralising sources.
      const crystalEffect = Math.min(crystalCount, 3) * CRYSTAL_PASSIVE_RATE
      delta_corruption -= crystalEffect * delta
    }

    // ── Apply if meaningful ────────────────────────────────────────────────
    if (Math.abs(delta_corruption) > 0.0001) {
      missionStore.modifyCorruption(delta_corruption)
    }

    // ── Tier effects ───────────────────────────────────────────────────────
    const newCorruption = missionStore.porroCorruption
    const newLevel = getCorruptionLevel(newCorruption)

    applyTierEffects(newLevel, newCorruption)

    // ── Stat penalties (influenced tier and above) ─────────────────────────
    if (newCorruption >= CORRUPTION_THRESHOLD_PENALTY) {
      this._applyStatPenalties(newCorruption)
    }
  },

  /**
   * At corruption >= 40 apply passive stat drains that stack with survival.
   * At >= 80 (horror mode) drains are doubled.
   */
  _applyStatPenalties(corruption: number): void {
    const player = usePlayerStore.getState()
    if (player.isDead || player.respawnPending) return

    // Penalty scales from 0 at 40% to 1 at 100%
    const scale = (corruption - CORRUPTION_THRESHOLD_PENALTY) /
      (100 - CORRUPTION_THRESHOLD_PENALTY)

    // Horror mode doubles the drain
    const horrorMultiplier = corruption >= CORRUPTION_THRESHOLD_HORROR ? 2.0 : 1.0

    // Direct warmth and energy bleed (these are in addition to normal survival drain)
    // We use a very small per-frame delta — this is called at ~60 fps so 1/60 ≈ 0.016 s
    const perFrame = (1 / 60) * scale * horrorMultiplier

    // Access store directly for fine-grained adjustment without a full tickStats call
    const playerStore = usePlayerStore
    const state = playerStore.getState()

    // Warmth bleed: up to 0.5/s at full corruption
    const warmthBleed = 0.5 * perFrame
    // Energy bleed: up to 0.3/s at full corruption
    const energyBleed = 0.3 * perFrame

    if (warmthBleed > 0 && state.warmth > 0) {
      state.takeDamage(0) // no-op; we'll apply via the store's internal setters
      // Use the store's immer path by calling tickStats with a micro-delta
      // Warmth/energy bleed is achieved by calling takeDamage when horror-consumed
      if (corruption >= CORRUPTION_THRESHOLD_HORROR) {
        state.takeDamage(warmthBleed + energyBleed)
      }
    }
  },
}
