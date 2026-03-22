/**
 * RUKA-PORRO — Save system
 * localStorage serialisation / deserialisation for the full game state.
 *
 * Serialises:
 *   - Player stats, position, inventory (runtime physics state excluded)
 *   - NPC trust levels and dialogue history
 *   - Completed missions, active mission, objective progress
 *   - Corruption meter and story flags
 *   - Game settings (volume, language, graphics quality)
 *
 * Never serialises: velocity, isGrounded, isSprinting, isJumping, isDead,
 *   respawnPending, NPC FSM states, or world weather (these reset on load).
 */

import { usePlayerStore } from '../stores/usePlayerStore'
import { useNPCStore } from '../stores/useNPCStore'
import { useMissionStore } from '../stores/useMissionStore'
import { useUIStore } from '../stores/useUIStore'
import type { SaveData, NPCId, MissionId } from '../types/game'

// ─── Constants ────────────────────────────────────────────────────────────────

const SAVE_KEY = 'ruka-porro-save'

/** Increment when the schema changes to invalidate old saves gracefully. */
const SAVE_VERSION = 2

interface VersionedSave {
  version: number
  data: SaveData
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isVersionedSave(value: unknown): value is VersionedSave {
  return (
    typeof value === 'object' &&
    value !== null &&
    'version' in value &&
    'data' in value &&
    typeof (value as VersionedSave).version === 'number'
  )
}

function isValidSaveData(data: unknown): data is SaveData {
  if (typeof data !== 'object' || data === null) return false
  const d = data as Partial<SaveData>
  return (
    typeof d.porroCorruption === 'number' &&
    Array.isArray(d.completedMissions) &&
    typeof d.playerState === 'object' &&
    d.playerState !== null &&
    Array.isArray(d.storyFlags) &&
    typeof d.settings === 'object' &&
    d.settings !== null &&
    typeof d.lastSaved === 'number'
  )
}

// ─── Auto-save interval tracking ──────────────────────────────────────────────

let secondsSinceLastAutoSave = 0
const AUTO_SAVE_INTERVAL = 30 // seconds

// ─── System ───────────────────────────────────────────────────────────────────

export const saveSystem = {
  /**
   * Serialise current game state and write to localStorage.
   */
  save(): void {
    try {
      const player = usePlayerStore.getState()
      const npcStore = useNPCStore.getState()
      const mission = useMissionStore.getState()
      const ui = useUIStore.getState()

      // Build NPC partial state (trust + dialogue history only)
      const npcStates: SaveData['npcStates'] = {}
      for (const rawId in npcStore.npcs) {
        const id = rawId as NPCId
        const npc = npcStore.npcs[id]
        npcStates[id] = {
          trust: npc.trust,
          dialogueHistory: [...npc.dialogueHistory],
        }
      }

      // Collect completed missions
      const completedMissions = (Object.keys(mission.missionStatuses) as MissionId[]).filter(
        (id) => mission.missionStatuses[id] === 'completed',
      )

      const saveData: SaveData = {
        playerState: {
          position: { ...player.position },
          rotation: player.rotation,
          health: player.health,
          energy: player.energy,
          warmth: player.warmth,
          hunger: player.hunger,
          isInDialogue: false, // always reset on load
          inventory: player.inventory.map((item) => ({ ...item })),
        },
        npcStates,
        completedMissions,
        activeMission: mission.activeMissionId,
        porroCorruption: mission.porroCorruption,
        storyFlags: [...mission.storyFlags],
        settings: { ...ui.settings },
        lastSaved: Date.now(),
      }

      const versioned: VersionedSave = { version: SAVE_VERSION, data: saveData }
      localStorage.setItem(SAVE_KEY, JSON.stringify(versioned))
    } catch (err) {
      // localStorage may be unavailable (private browsing, quota exceeded, etc.)
      console.warn('[saveSystem] Failed to write save:', err)
    }
  },

  /**
   * Read and parse save data from localStorage.
   * Returns null if no save exists, is unreadable, or has an incompatible version.
   */
  load(): SaveData | null {
    try {
      const raw = localStorage.getItem(SAVE_KEY)
      if (!raw) return null

      const parsed: unknown = JSON.parse(raw)
      if (!isVersionedSave(parsed)) return null
      if (parsed.version !== SAVE_VERSION) {
        console.info(
          `[saveSystem] Save version mismatch (stored ${parsed.version}, expected ${SAVE_VERSION}). Discarding.`,
        )
        return null
      }
      if (!isValidSaveData(parsed.data)) return null

      return parsed.data
    } catch (err) {
      console.warn('[saveSystem] Failed to read save:', err)
      return null
    }
  },

  /**
   * Apply a SaveData object to all stores (i.e. "continue game").
   * Call this after load() returns non-null.
   */
  applyToStores(data: SaveData): void {
    const playerStore = usePlayerStore.getState()
    const npcStore = useNPCStore.getState()
    const missionStore = useMissionStore.getState()
    const uiStore = useUIStore.getState()

    // ── Player ────────────────────────────────────────────────────────────
    playerStore.setPosition(data.playerState.position)
    playerStore.setRotation(data.playerState.rotation)
    // Re-apply stats via raw setState (not tickStats — we're setting, not draining)
    usePlayerStore.setState({
      health: data.playerState.health,
      energy: data.playerState.energy,
      warmth: data.playerState.warmth,
      hunger: data.playerState.hunger,
      inventory: data.playerState.inventory.map((item) => ({ ...item })),
      velocity: { x: 0, y: 0, z: 0 },
      isGrounded: true,
      isSprinting: false,
      isJumping: false,
      isInDialogue: false,
      isDead: false,
      respawnPending: false,
    })

    // ── NPCs ──────────────────────────────────────────────────────────────
    npcStore.resetAll()
    for (const rawId in data.npcStates) {
      const id = rawId as NPCId
      const saved = data.npcStates[id]
      if (!saved) continue
      npcStore.setTrust(id, saved.trust)
      for (const nodeId of saved.dialogueHistory) {
        npcStore.recordDialogueNode(id, nodeId)
      }
    }

    // ── Missions ──────────────────────────────────────────────────────────
    missionStore.resetAll()
    for (const missionId of data.completedMissions) {
      // completeMission requires an active state first — use raw status override
      useMissionStore.setState((s) => ({
        missionStatuses: { ...s.missionStatuses, [missionId]: 'completed' },
      }))
    }
    if (data.activeMission) {
      missionStore.startMission(data.activeMission)
    }
    missionStore.modifyCorruption(data.porroCorruption)
    for (const flag of data.storyFlags) {
      missionStore.setFlag(flag)
    }

    // ── Settings ──────────────────────────────────────────────────────────
    uiStore.updateSettings(data.settings)
  },

  /**
   * Called every frame by GameLoop. Triggers a save every AUTO_SAVE_INTERVAL seconds.
   */
  autoSave(delta: number): void {
    secondsSinceLastAutoSave += delta
    if (secondsSinceLastAutoSave >= AUTO_SAVE_INTERVAL) {
      secondsSinceLastAutoSave = 0
      this.save()
    }
  },

  /**
   * Erase the save from localStorage.
   */
  deleteSave(): void {
    try {
      localStorage.removeItem(SAVE_KEY)
    } catch {
      // Silently ignore — nothing to do if storage is unavailable
    }
  },

  /**
   * Returns true if a valid save file exists in localStorage.
   */
  hasSave(): boolean {
    return this.load() !== null
  },
}
