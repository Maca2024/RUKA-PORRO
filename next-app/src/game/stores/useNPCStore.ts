'use client'

/**
 * RUKA-PORRO — NPC store
 * Manages runtime state for all 9 NPCs:
 * trust levels, FSM states, positions, and dialogue history.
 */

import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { NPCId, NPCFSMState, NPCDefinition, NPCState, Vec3 } from '../types/game'
import { TRUST_MIN, TRUST_MAX, NPC_NOTICE_RADIUS_DEFAULT } from '../core/constants'

// ─── Static NPC definitions ───────────────────────────────────────────────────

export const NPC_DEFINITIONS: Record<NPCId, NPCDefinition> = {
  sieni: {
    id: 'sieni',
    name: 'Sieni',
    nameFi: 'Sieni',
    species: 'Mushroom Spirit',
    role: 'Guide & Mentor',
    personality: 'wise',
    description: 'An ancient mushroom spirit who remembers the forest before the corruption arrived.',
    descriptionFi: 'Muinainen sieniolento, joka muistaa metsän ennen saastumista.',
    noticeRadius: 12,
    fleeThreshold: null,
    wanderSpeed: 2,
    trustGainRate: 1.2,
    initialTrust: 20,
    spawnPoint: { x: -30, y: 0, z: -20 },
    modelType: 'mushroom_entity',
    color: '#c0392b',
    isCorruptionSource: false,
    favoriteItems: ['mushroom', 'lichen'],
    fearItems: [],
  },
  sammal: {
    id: 'sammal',
    name: 'Sammal',
    nameFi: 'Sammal',
    species: 'Moss Spirit',
    role: 'Healer',
    personality: 'gentle',
    description: 'A soft-spoken moss spirit who tends to wounded forest creatures.',
    descriptionFi: 'Lempeä sammalhenki, joka hoitaa haavoittuneita metsäneläimiä.',
    noticeRadius: 10,
    fleeThreshold: null,
    wanderSpeed: 1.5,
    trustGainRate: 1.5,
    initialTrust: 30,
    spawnPoint: { x: 40, y: 0, z: 15 },
    modelType: 'moss_entity',
    color: '#27ae60',
    isCorruptionSource: false,
    favoriteItems: ['reindeer_moss', 'warm_broth'],
    fearItems: ['corruption_shard'],
  },
  yuki: {
    id: 'yuki',
    name: 'Yuki',
    nameFi: 'Yuki',
    species: 'Akita Dog',
    role: 'Loyal Companion',
    personality: 'loyal',
    description: 'A brave Akita who got separated from her family in the snowstorm.',
    descriptionFi: 'Urhoollinen Akita, joka erosi perheestään lumimyrskyssä.',
    noticeRadius: 18,
    fleeThreshold: null,
    wanderSpeed: 5,
    trustGainRate: 2.0,
    initialTrust: 0,
    spawnPoint: { x: 15, y: 0, z: 60 },
    modelType: 'dog_akita',
    color: '#f5cba7',
    isCorruptionSource: false,
    favoriteItems: ['reindeer_moss', 'lichen'],
    fearItems: ['corruption_shard', 'hunter_scent'],
  },
  taisto: {
    id: 'taisto',
    name: 'Taisto',
    nameFi: 'Taisto',
    species: 'American Staffordshire Terrier',
    role: 'Brave Guardian',
    personality: 'brave',
    description: 'A scarred but loyal dog who protects the forest clearing from predators.',
    descriptionFi: 'Arpeutunut mutta uskollinen koira, joka suojelee metsäaukeaa petoeläimiltä.',
    noticeRadius: 20,
    fleeThreshold: null,
    wanderSpeed: 4,
    trustGainRate: 0.8,
    initialTrust: -10,
    spawnPoint: { x: -60, y: 0, z: 40 },
    modelType: 'dog_amstaff',
    color: '#7f8c8d',
    isCorruptionSource: false,
    favoriteItems: ['warm_broth'],
    fearItems: [],
  },
  karen: {
    id: 'karen',
    name: 'Karen',
    nameFi: 'Kaaren',
    species: 'Crow',
    role: 'Trickster Messenger',
    personality: 'mischievous',
    description: 'A clever crow who trades secrets and feathers for shiny things.',
    descriptionFi: 'Nokkela varis, joka kaupittelee salaisuuksia ja sulkia kiiltävien tavaroiden vastineeksi.',
    noticeRadius: NPC_NOTICE_RADIUS_DEFAULT,
    fleeThreshold: -30,
    wanderSpeed: 0,
    trustGainRate: 1.0,
    initialTrust: 5,
    spawnPoint: { x: 5, y: 8, z: -50 },
    modelType: 'crow',
    color: '#1a1a2e',
    isCorruptionSource: false,
    favoriteItems: ['purification_crystal'],
    fearItems: [],
  },
  koulu: {
    id: 'koulu',
    name: 'Koulu',
    nameFi: 'Koulu',
    species: 'Abandoned School',
    role: 'Memory Sanctuary',
    personality: 'sanctuary',
    description: 'An old village school whose spirit holds the memories of forgotten children.',
    descriptionFi: 'Vanha kyläkoulu, jonka henki säilyttää unohtuneiden lasten muistot.',
    noticeRadius: 30,
    fleeThreshold: null,
    wanderSpeed: 0,
    trustGainRate: 0.5,
    initialTrust: 0,
    spawnPoint: { x: -80, y: 0, z: -80 },
    modelType: 'building_school',
    color: '#d35400',
    isCorruptionSource: false,
    favoriteItems: [],
    fearItems: ['corruption_shard'],
  },
  susi: {
    id: 'susi',
    name: 'Susi',
    nameFi: 'Susi',
    species: 'Wolf',
    role: 'Cunning Predator',
    personality: 'cunning',
    description: 'A grey wolf who has been touched by the corruption, making him unpredictable.',
    descriptionFi: 'Harmaa susi, jota saastuminen on koskettanut tehden hänestä arvaamattoman.',
    noticeRadius: 25,
    fleeThreshold: 60,
    wanderSpeed: 7,
    trustGainRate: 0.4,
    initialTrust: -40,
    spawnPoint: { x: 70, y: 0, z: -70 },
    modelType: 'wolf',
    color: '#8e9eab',
    isCorruptionSource: true,
    favoriteItems: [],
    fearItems: ['purification_crystal'],
  },
  metsastaja: {
    id: 'metsastaja',
    name: 'The Hunter',
    nameFi: 'Metsästäjä',
    species: 'Human',
    role: 'Antagonist Threat',
    personality: 'threatening',
    description: 'A hunter who has entered the forest seeking the rare white reindeer — Porro.',
    descriptionFi: 'Metsästäjä, joka on tullut metsään etsimään harvinaista valkoista poroa.',
    noticeRadius: 22,
    fleeThreshold: null,
    wanderSpeed: 3.5,
    trustGainRate: 0.2,
    initialTrust: -60,
    spawnPoint: { x: 90, y: 0, z: 20 },
    modelType: 'human_hunter',
    color: '#795548',
    isCorruptionSource: false,
    favoriteItems: [],
    fearItems: [],
  },
  karhu: {
    id: 'karhu',
    name: 'Karhu',
    nameFi: 'Karhu',
    species: 'Brown Bear',
    role: 'Ancient Boss',
    personality: 'ancient',
    description: 'The ancient bear who sleeps beneath the mountain and guards the heart of the forest.',
    descriptionFi: 'Muinainen karhu, joka nukkuu vuoren alla ja vartioi metsän sydäntä.',
    noticeRadius: 35,
    fleeThreshold: null,
    wanderSpeed: 4,
    trustGainRate: 0.3,
    initialTrust: -20,
    spawnPoint: { x: -120, y: 0, z: -120 },
    modelType: 'bear',
    color: '#6d4c41',
    isCorruptionSource: true,
    favoriteItems: ['purification_crystal'],
    fearItems: [],
  },
}

// ─── Store types ──────────────────────────────────────────────────────────────

interface NPCStoreState {
  npcs: Record<NPCId, NPCState>
  activeDialogueNPC: NPCId | null

  // ── Actions ──────────────────────────────────────────────────────────────

  /** Update an NPC's FSM state. */
  setNPCFSMState: (id: NPCId, state: NPCFSMState) => void

  /** Update an NPC's world position. */
  setNPCPosition: (id: NPCId, position: Vec3) => void

  /** Apply a trust delta to an NPC, clamped to [-100, +100]. */
  modifyTrust: (id: NPCId, delta: number) => void

  /** Set trust to an exact value, clamped. */
  setTrust: (id: NPCId, value: number) => void

  /** Start a dialogue session with an NPC. */
  beginDialogue: (id: NPCId) => void

  /** End the active dialogue session. */
  endDialogue: () => void

  /** Push a dialogue node ID into the NPC's history (for "first time" checks). */
  recordDialogueNode: (id: NPCId, nodeId: string) => void

  /** Reset all NPC states to initial values (used on new game). */
  resetAll: () => void
}

// ─── Initial runtime states ───────────────────────────────────────────────────

function buildInitialNPCStates(): Record<NPCId, NPCState> {
  const ids = Object.keys(NPC_DEFINITIONS) as NPCId[]
  const result = {} as Record<NPCId, NPCState>
  for (const id of ids) {
    result[id] = {
      id,
      trust: NPC_DEFINITIONS[id].initialTrust ?? 0,
      currentState: 'idle' as NPCFSMState,
      position: { ...NPC_DEFINITIONS[id].spawnPoint },
      isInDialogue: false,
      dialogueHistory: [],
      lastInteraction: 0,
    }
  }
  return result
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useNPCStore = create<NPCStoreState>()(
  immer((set) => ({
    npcs: buildInitialNPCStates(),
    activeDialogueNPC: null,

    setNPCFSMState(id, fsmState) {
      set((s) => { s.npcs[id].currentState = fsmState })
    },

    setNPCPosition(id, position) {
      set((s) => { s.npcs[id].position = position })
    },

    modifyTrust(id, delta) {
      set((s) => {
        const npc = s.npcs[id]
        npc.trust = Math.min(TRUST_MAX, Math.max(TRUST_MIN, npc.trust + delta))
      })
    },

    setTrust(id, value) {
      set((s) => {
        s.npcs[id].trust = Math.min(TRUST_MAX, Math.max(TRUST_MIN, value))
      })
    },

    beginDialogue(id) {
      set((s) => {
        s.npcs[id].currentState = 'dialogue'
        s.npcs[id].isInDialogue = true
        s.npcs[id].lastInteraction = Date.now()
        s.activeDialogueNPC = id
      })
    },

    endDialogue() {
      set((s) => {
        if (s.activeDialogueNPC) {
          s.npcs[s.activeDialogueNPC].currentState = 'idle'
          s.npcs[s.activeDialogueNPC].isInDialogue = false
        }
        s.activeDialogueNPC = null
      })
    },

    recordDialogueNode(id, nodeId) {
      set((s) => {
        const history = s.npcs[id].dialogueHistory
        if (!history.includes(nodeId)) {
          history.push(nodeId)
        }
      })
    },

    resetAll() {
      set((s) => {
        s.npcs = buildInitialNPCStates()
        s.activeDialogueNPC = null
      })
    },
  })),
)

// ─── Selector helpers (avoid re-renders) ─────────────────────────────────────

export const selectNPC = (id: NPCId) => (s: NPCStoreState) => s.npcs[id]
export const selectNPCTrust = (id: NPCId) => (s: NPCStoreState) => s.npcs[id].trust
export const selectActiveDialogueNPC = (s: NPCStoreState) => s.activeDialogueNPC
