/**
 * RUKA-PORRO — NPC system
 * Ticks all 9 NPC finite-state machines every frame.
 * Reads from usePlayerStore and useNPCStore; writes position + FSM state
 * back into useNPCStore.
 */

import { usePlayerStore } from '../stores/usePlayerStore'
import { useNPCStore, NPC_DEFINITIONS } from '../stores/useNPCStore'
import { useMissionStore } from '../stores/useMissionStore'
import { distanceXZ, randomRange, normalizeVec3 } from '@/lib/math'
import {
  NPC_DIALOGUE_RADIUS,
  NPC_FLEE_SPEED,
  CORRUPTION_PROXIMITY_RATE,
  WORLD_SIZE,
} from '../core/constants'
import type { NPCId, NPCFSMState, Vec3 } from '../types/game'

// ─── Per-NPC wander timers ─────────────────────────────────────────────────────

interface WanderState {
  /** Remaining seconds on the current idle pause before next wander step */
  idleTimer: number
  /** Current wander heading in radians */
  heading: number
  /** Remaining seconds to walk in this direction */
  walkTimer: number
}

const wanderStates: Partial<Record<NPCId, WanderState>> = {}

function getWanderState(id: NPCId): WanderState {
  if (!wanderStates[id]) {
    wanderStates[id] = {
      idleTimer: randomRange(2, 5),
      heading: randomRange(0, Math.PI * 2),
      walkTimer: 0,
    }
  }
  return wanderStates[id]!
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Clamp a position so NPCs never wander beyond the world boundary. */
function clampToWorld(pos: Vec3): Vec3 {
  const half = WORLD_SIZE / 2 - 2
  return {
    x: Math.max(-half, Math.min(half, pos.x)),
    y: pos.y,
    z: Math.max(-half, Math.min(half, pos.z)),
  }
}

/** Move `pos` toward `target` at `speed` units/second, never overshooting. */
function moveToward(pos: Vec3, target: Vec3, speed: number, delta: number): Vec3 {
  const dx = target.x - pos.x
  const dz = target.z - pos.z
  const dist = Math.sqrt(dx * dx + dz * dz)
  if (dist <= 0.01) return pos

  const step = Math.min(dist, speed * delta)
  const ratio = step / dist
  return clampToWorld({
    x: pos.x + dx * ratio,
    y: pos.y,
    z: pos.z + dz * ratio,
  })
}

/** Move `pos` away from `origin` at `speed` units/second. */
function moveAwayFrom(pos: Vec3, origin: Vec3, speed: number, delta: number): Vec3 {
  const dx = pos.x - origin.x
  const dz = pos.z - origin.z
  const dir = normalizeVec3({ x: dx, y: 0, z: dz })
  return clampToWorld({
    x: pos.x + dir.x * speed * delta,
    y: pos.y,
    z: pos.z + dir.z * speed * delta,
  })
}

// ─── System ───────────────────────────────────────────────────────────────────

export const npcSystem = {
  /**
   * Tick all NPCs. Called by GameLoop each frame.
   */
  tick(delta: number): void {
    const playerState = usePlayerStore.getState()
    const { npcs } = useNPCStore.getState()

    // Freeze all NPC movement while the player is in a dialogue
    if (playerState.isInDialogue) return

    const playerPos = playerState.position

    for (const rawId in npcs) {
      const npcId = rawId as NPCId
      const npcState = npcs[npcId]

      // NPCs actively in dialogue are handled by the dialogue system
      if (npcState.isInDialogue) continue

      this.tickNPC(npcId, delta, playerPos)
    }
  },

  /**
   * Individual NPC FSM tick.
   *
   * State transitions:
   *   idle       → wander (after idle timer expires)
   *   wandering  → idle (after walk timer expires) | notice (player in radius)
   *   noticing   → approaching (trust >= fleeThreshold) | fleeing (trust < fleeThreshold)
   *   approaching→ dialogue (player within dialogue radius) | notice (player left radius)
   *   fleeing    → idle (player beyond notice radius * 2)
   *   dialogue   → idle (managed externally by NPC store endDialogue)
   */
  tickNPC(npcId: NPCId, delta: number, playerPos: Vec3): void {
    const npcStore = useNPCStore.getState()
    const npcState = npcStore.npcs[npcId]
    const npcDef = NPC_DEFINITIONS[npcId]

    // Stationary NPCs (koulu, karen perched) never move — skip movement logic
    const isStationary = npcDef.wanderSpeed === 0
    const dist = distanceXZ(playerPos, npcState.position)

    // ── Determine next FSM state ─────────────────────────────────────────────

    let nextState: NPCFSMState = npcState.currentState
    let newPosition: Vec3 = { ...npcState.position }

    // Corruption source NPCs that are close to the player apply corruption
    if (npcDef.isCorruptionSource && dist <= npcDef.noticeRadius) {
      useMissionStore.getState().modifyCorruption(CORRUPTION_PROXIMITY_RATE * delta)
    }

    switch (npcState.currentState) {
      // ── idle ───────────────────────────────────────────────────────────────
      case 'idle': {
        if (!isStationary) {
          const ws = getWanderState(npcId)
          ws.idleTimer -= delta

          if (ws.idleTimer <= 0) {
            // Start a new wander step
            ws.heading = randomRange(0, Math.PI * 2)
            ws.walkTimer = randomRange(2, 6)
            nextState = 'wandering'
          }
        }

        // Notice the player regardless of idle/wander sub-state
        if (dist <= npcDef.noticeRadius) {
          nextState = 'noticing'
        }
        break
      }

      // ── wandering ─────────────────────────────────────────────────────────
      case 'wandering': {
        const ws = getWanderState(npcId)
        ws.walkTimer -= delta

        // Walk in current heading direction
        newPosition = clampToWorld({
          x: npcState.position.x + Math.sin(ws.heading) * npcDef.wanderSpeed * delta,
          y: npcState.position.y,
          z: npcState.position.z + Math.cos(ws.heading) * npcDef.wanderSpeed * delta,
        })

        if (ws.walkTimer <= 0) {
          // Return to idle and reset timer
          const fresh = getWanderState(npcId)
          fresh.idleTimer = randomRange(2, 5)
          nextState = 'idle'
        }

        // Notice player mid-wander
        if (dist <= npcDef.noticeRadius) {
          nextState = 'noticing'
        }
        break
      }

      // ── noticing ──────────────────────────────────────────────────────────
      case 'noticing': {
        // Player left the radius — go back to idle
        if (dist > npcDef.noticeRadius) {
          nextState = 'idle'
          break
        }

        const { fleeThreshold } = npcDef
        const trust = npcState.trust

        if (fleeThreshold !== null && trust < fleeThreshold) {
          nextState = 'fleeing'
        } else {
          nextState = isStationary ? 'idle' : 'approaching'
        }
        break
      }

      // ── approaching ───────────────────────────────────────────────────────
      case 'approaching': {
        // Reached dialogue radius — stop and wait for playerSystem to open dialogue
        if (dist <= NPC_DIALOGUE_RADIUS) {
          nextState = 'approaching' // hold here; playerSystem handles dialogue open
          break
        }

        // Player has moved too far away — abandon approach
        if (dist > npcDef.noticeRadius * 1.5) {
          nextState = 'idle'
          break
        }

        // Move toward player
        newPosition = moveToward(npcState.position, playerPos, npcDef.wanderSpeed * 1.5, delta)
        break
      }

      // ── fleeing ───────────────────────────────────────────────────────────
      case 'fleeing': {
        newPosition = moveAwayFrom(npcState.position, playerPos, NPC_FLEE_SPEED, delta)

        // Stop fleeing once player is far enough away
        if (dist > npcDef.noticeRadius * 2) {
          const ws = getWanderState(npcId)
          ws.idleTimer = randomRange(3, 6)
          nextState = 'idle'
        }
        break
      }

      // ── dialogue ──────────────────────────────────────────────────────────
      case 'dialogue': {
        // Dialogue is controlled externally. We just hold position.
        break
      }
    }

    // ── Apply updates ───────────────────────────────────────────────────────

    // Only call setters when values actually changed to avoid unnecessary
    // Zustand re-renders on every frame.
    if (nextState !== npcState.currentState) {
      npcStore.setNPCFSMState(npcId, nextState)
    }

    const posChanged =
      Math.abs(newPosition.x - npcState.position.x) > 0.001 ||
      Math.abs(newPosition.z - npcState.position.z) > 0.001

    if (posChanged) {
      npcStore.setNPCPosition(npcId, newPosition)
    }
  },
}
