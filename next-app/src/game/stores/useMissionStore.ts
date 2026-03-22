'use client'

/**
 * RUKA-PORRO — Mission store
 * Tracks mission progression, the corruption meter, story flags,
 * and active objective state.
 */

import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type {
  MissionId,
  MissionDefinition,
  MissionStatus,
  NPCId,
  CorruptionLevel,
} from '../types/game'
import { getCorruptionLevel } from '../types/game'
import {
  CORRUPTION_CRYSTAL_REDUCE,
  STAT_MAX,
  STAT_MIN,
} from '../core/constants'

// ─── Mission definitions ──────────────────────────────────────────────────────

export const MISSION_DEFINITIONS: Record<MissionId, MissionDefinition> = {
  m1_first_snow: {
    id: 'm1_first_snow',
    act: 'act1',
    sequence: 1,
    title: 'First Snow',
    titleFi: 'Ensimmäinen lumi',
    description: 'Explore the snowy forest and find Sieni the mushroom spirit.',
    descriptionFi: 'Tutki luminen metsä ja löydä sieniolento Sieni.',
    objectives: [
      {
        id: 'reach_sieni',
        type: 'reach',
        target: 'sieni_grove',
        count: 1,
        current: 0,
        description: 'Find the mushroom grove',
        descriptionFi: 'Löydä sienimetsikkö',
        optional: false,
      },
      {
        id: 'talk_sieni',
        type: 'talk',
        target: 'sieni',
        count: 1,
        current: 0,
        description: 'Speak with Sieni',
        descriptionFi: 'Puhu Sienin kanssa',
        optional: false,
      },
    ],
    prerequisites: [],
    rewards: {
      xp: 50,
      trustBonus: { sieni: 10 },
      corruptionDelta: 0,
    },
    requiredTrust: {},
    timeLimit: null,
    failureIsGameOver: false,
  },

  m2_whispers: {
    id: 'm2_whispers',
    act: 'act1',
    sequence: 2,
    title: 'Forest Whispers',
    titleFi: 'Metsän kuiskaukset',
    description: 'The forest is uneasy. Gather lichen and speak with Sammal about the dark energy.',
    descriptionFi: 'Metsä on levoton. Kerää jäkälää ja puhu Sammalin kanssa pimeästä energiasta.',
    objectives: [
      {
        id: 'collect_lichen',
        type: 'collect',
        target: 'lichen',
        count: 3,
        current: 0,
        description: 'Collect 3 bundles of lichen',
        descriptionFi: 'Kerää 3 jäkäläkimppua',
        optional: false,
      },
      {
        id: 'talk_sammal',
        type: 'talk',
        target: 'sammal',
        count: 1,
        current: 0,
        description: 'Speak with Sammal the healer',
        descriptionFi: 'Puhu parantaja Sammalin kanssa',
        optional: false,
      },
    ],
    prerequisites: ['m1_first_snow'],
    rewards: {
      xp: 80,
      items: ['purification_crystal'],
      trustBonus: { sammal: 15, sieni: 5 },
      corruptionDelta: -5,
    },
    requiredTrust: { sieni: 10 },
    timeLimit: null,
    failureIsGameOver: false,
  },

  m3_lost_dog: {
    id: 'm3_lost_dog',
    act: 'act1',
    sequence: 3,
    title: 'The Lost Dog',
    titleFi: 'Kadonnut koira',
    description: "Find Yuki the Akita who is lost in the blizzard and help her return home.",
    descriptionFi: 'Löydä lumimyrskyssä kadonnut Akita Yuki ja auta häntä palaamaan kotiin.',
    objectives: [
      {
        id: 'find_yuki',
        type: 'reach',
        target: 'yuki_location',
        count: 1,
        current: 0,
        description: 'Find Yuki in the blizzard',
        descriptionFi: 'Löydä Yuki lumimyrskystä',
        optional: false,
      },
      {
        id: 'survive_blizzard',
        type: 'survive',
        target: 'blizzard',
        count: 120,
        current: 0,
        description: 'Survive 2 minutes in the blizzard',
        descriptionFi: 'Selviä 2 minuuttia lumimyrskyssä',
        optional: false,
      },
      {
        id: 'talk_yuki',
        type: 'talk',
        target: 'yuki',
        count: 1,
        current: 0,
        description: 'Comfort Yuki',
        descriptionFi: 'Lohdutu Yukia',
        optional: false,
      },
    ],
    prerequisites: ['m1_first_snow'],
    rewards: {
      xp: 120,
      trustBonus: { yuki: 25 },
      corruptionDelta: -8,
    },
    requiredTrust: {},
    timeLimit: 300,
    failureIsGameOver: false,
  },

  m4_crow_feathers: {
    id: 'm4_crow_feathers',
    act: 'act1',
    sequence: 4,
    title: "Crow's Bargain",
    titleFi: 'Variksen kauppa',
    description: 'Karen the crow wants something shiny in exchange for information about the corruption.',
    descriptionFi: 'Varis Karen haluaa jotain kiiltävää vastineeksi tiedoista saastumisesta.',
    objectives: [
      {
        id: 'collect_crystals',
        type: 'collect',
        target: 'purification_crystal',
        count: 2,
        current: 0,
        description: 'Find 2 purification crystals',
        descriptionFi: 'Löydä 2 puhdistuskristallia',
        optional: false,
      },
      {
        id: 'talk_karen',
        type: 'talk',
        target: 'karen',
        count: 1,
        current: 0,
        description: 'Strike a deal with Karen',
        descriptionFi: 'Tee sopimus Karenin kanssa',
        optional: false,
      },
    ],
    prerequisites: ['m2_whispers'],
    rewards: {
      xp: 100,
      items: ['crow_feather'],
      trustBonus: { karen: 20 },
      corruptionDelta: -10,
    },
    requiredTrust: {},
    timeLimit: null,
    failureIsGameOver: false,
  },

  m5_old_school: {
    id: 'm5_old_school',
    act: 'act2',
    sequence: 1,
    title: 'Echoes in the School',
    titleFi: 'Kaikuja koulussa',
    description: 'The abandoned school Koulu holds memories that may reveal the source of the corruption.',
    descriptionFi: 'Hylätty koulu Koulu sisältää muistoja, jotka voivat paljastaa saastumisen lähteen.',
    objectives: [
      {
        id: 'reach_school',
        type: 'reach',
        target: 'school_building',
        count: 1,
        current: 0,
        description: 'Reach the old school',
        descriptionFi: 'Saavu vanhalle koululle',
        optional: false,
      },
      {
        id: 'collect_memories',
        type: 'collect',
        target: 'memory_fragment',
        count: 5,
        current: 0,
        description: 'Collect 5 memory fragments',
        descriptionFi: 'Kerää 5 muistisirpaletta',
        optional: false,
      },
      {
        id: 'avoid_corruption',
        type: 'avoid',
        target: 'corruption_zone',
        count: 1,
        current: 0,
        description: "Don't let corruption exceed 60%",
        descriptionFi: 'Älä anna saastumisen ylittää 60%',
        optional: false,
      },
    ],
    prerequisites: ['m3_lost_dog', 'm4_crow_feathers'],
    rewards: {
      xp: 200,
      items: ['ancient_key'],
      trustBonus: { koulu: 30, sieni: 10 },
      corruptionDelta: -15,
    },
    requiredTrust: { sammal: 15 },
    timeLimit: null,
    failureIsGameOver: false,
  },

  m6_wolf_tracks: {
    id: 'm6_wolf_tracks',
    act: 'act2',
    sequence: 2,
    title: "Wolf's Shadow",
    titleFi: 'Suden varjo',
    description: 'Susi the corrupted wolf has been hunting close to the safe zones. You must confront or redeem him.',
    descriptionFi: 'Saastainen susi on metsästänyt lähellä turvavyöhykkeitä. Sinun täytyy kohdata tai pelastaa hänet.',
    objectives: [
      {
        id: 'track_susi',
        type: 'reach',
        target: 'wolf_territory',
        count: 1,
        current: 0,
        description: "Enter Susi's territory",
        descriptionFi: 'Mene Susin reviirille',
        optional: false,
      },
      {
        id: 'purify_or_flee',
        type: 'collect',
        target: 'purification_crystal',
        count: 1,
        current: 0,
        description: 'Bring a purification crystal',
        descriptionFi: 'Tuo puhdistuskristalli',
        optional: false,
      },
      {
        id: 'talk_susi',
        type: 'talk',
        target: 'susi',
        count: 1,
        current: 0,
        description: 'Face Susi',
        descriptionFi: 'Kohtaa Susi',
        optional: false,
      },
    ],
    prerequisites: ['m5_old_school'],
    rewards: {
      xp: 250,
      trustBonus: { susi: 40, taisto: 15 },
      corruptionDelta: -20,
    },
    requiredTrust: { taisto: 10 },
    timeLimit: null,
    failureIsGameOver: false,
  },

  m7_hunters_moon: {
    id: 'm7_hunters_moon',
    act: 'act2',
    sequence: 3,
    title: "Hunter's Moon",
    titleFi: 'Metsästäjän kuu',
    description: 'The hunter is closing in. Use every friend you have made to create a diversion and escape.',
    descriptionFi: 'Metsästäjä lähestyy. Käytä kaikkia ystäviäsi harhauttaaksesi hänet ja paetaksesi.',
    objectives: [
      {
        id: 'avoid_hunter',
        type: 'avoid',
        target: 'metsastaja',
        count: 180,
        current: 0,
        description: 'Avoid the hunter for 3 minutes',
        descriptionFi: 'Vältä metsästäjää 3 minuuttia',
        optional: false,
      },
      {
        id: 'reach_safe_zone',
        type: 'reach',
        target: 'deep_forest_sanctuary',
        count: 1,
        current: 0,
        description: 'Reach the deep forest sanctuary',
        descriptionFi: 'Saavu syvän metsän pyhäkköön',
        optional: false,
      },
    ],
    prerequisites: ['m6_wolf_tracks'],
    rewards: {
      xp: 300,
      trustBonus: { yuki: 10, taisto: 10, karen: 10 },
      corruptionDelta: -10,
    },
    requiredTrust: { yuki: 25 },
    timeLimit: 480,
    failureIsGameOver: false,
  },

  m8_last_stand: {
    id: 'm8_last_stand',
    act: 'act3',
    sequence: 1,
    title: 'Last Stand',
    titleFi: 'Viimeinen asema',
    description: "The corruption's heart has been revealed. Gather your allies for the final confrontation with Karhu.",
    descriptionFi: 'Saastumisen sydän on paljastunut. Kokoa liittolaisesi viimeistä kohtaamista varten Karhun kanssa.',
    objectives: [
      {
        id: 'gather_allies',
        type: 'talk',
        target: 'all_friendly_npcs',
        count: 4,
        current: 0,
        description: 'Rally 4 allies',
        descriptionFi: 'Kokoa 4 liittolaista',
        optional: false,
      },
      {
        id: 'reach_mountain',
        type: 'reach',
        target: 'karhu_mountain',
        count: 1,
        current: 0,
        description: "Reach Karhu's mountain",
        descriptionFi: 'Saavu Karhun vuorelle',
        optional: false,
      },
      {
        id: 'survive_corruption',
        type: 'survive',
        target: 'corruption_storm',
        count: 60,
        current: 0,
        description: 'Survive the corruption storm for 1 minute',
        descriptionFi: 'Selviä saastumismyrskystä 1 minuutin ajan',
        optional: false,
      },
    ],
    prerequisites: ['m7_hunters_moon'],
    rewards: {
      xp: 400,
      trustBonus: { karhu: 30 },
      corruptionDelta: -25,
    },
    requiredTrust: { sieni: 20, sammal: 15, yuki: 25 },
    timeLimit: null,
    failureIsGameOver: false,
  },

  m9_heart_of_porro: {
    id: 'm9_heart_of_porro',
    act: 'act3',
    sequence: 2,
    title: "Heart of Porro",
    titleFi: 'Porron sydän',
    description: "Face the ancient bear Karhu and purify the forest's heart. The fate of Lapland is in your hooves.",
    descriptionFi: 'Kohtaa muinainen karhu Karhu ja puhdista metsän sydän. Lapin kohtalo on sorkkiesi varassa.',
    objectives: [
      {
        id: 'use_crystals_karhu',
        type: 'collect',
        target: 'purification_crystal',
        count: 5,
        current: 0,
        description: 'Bring 5 purification crystals to Karhu',
        descriptionFi: 'Tuo 5 puhdistuskristallia Karhulle',
        optional: false,
      },
      {
        id: 'defeat_corruption',
        type: 'defeat',
        target: 'corruption_core',
        count: 1,
        current: 0,
        description: 'Destroy the corruption core',
        descriptionFi: 'Tuhoa saastumisen ydin',
        optional: false,
      },
      {
        id: 'reach_zero_corruption',
        type: 'survive',
        target: 'pure_state',
        count: 1,
        current: 0,
        description: 'Reduce your corruption to 0',
        descriptionFi: 'Laske saastumisesi nollaan',
        optional: false,
      },
    ],
    prerequisites: ['m8_last_stand'],
    rewards: {
      xp: 1000,
      items: ['heart_of_forest'],
      trustBonus: { karhu: 100, sieni: 20, sammal: 20 },
      corruptionDelta: -100,
    },
    requiredTrust: { karhu: 30 },
    timeLimit: null,
    failureIsGameOver: true,
  },
}

// ─── Store types ──────────────────────────────────────────────────────────────

interface MissionStoreState {
  missionStatuses: Record<MissionId, MissionStatus>
  /** Progress for each objective within its mission */
  objectiveProgress: Record<string, number>
  activeMissionId: MissionId | null
  /** 0–100 corruption meter */
  porroCorruption: number
  corruptionLevel: CorruptionLevel
  /** Arbitrary named boolean flags for story gating */
  storyFlags: string[]
  totalXP: number

  // ── Actions ──────────────────────────────────────────────────────────────

  /** Unlock and start a mission. No-op if prerequisites are not met. */
  startMission: (id: MissionId) => void

  /** Mark a mission as completed and apply its rewards. */
  completeMission: (id: MissionId, npcTrustUpdater: (id: NPCId, delta: number) => void) => void

  /** Mark a mission as failed. */
  failMission: (id: MissionId) => void

  /** Advance an objective counter by delta (default 1). */
  advanceObjective: (missionId: MissionId, objectiveId: string, delta?: number) => void

  /** Directly set an objective's progress value. */
  setObjectiveProgress: (missionId: MissionId, objectiveId: string, value: number) => void

  /** Add or subtract from the corruption meter. Clamped to 0–100. */
  modifyCorruption: (delta: number) => void

  /** Use a purification crystal — reduces corruption by the constant amount. */
  usePurificationCrystal: () => void

  /** Set a story flag. */
  setFlag: (flag: string) => void

  /** Clear a story flag. */
  clearFlag: (flag: string) => void

  /** Check if a story flag is set. */
  hasFlag: (flag: string) => boolean

  /** Award XP directly. */
  awardXP: (amount: number) => void

  /** Reset all mission state (new game). */
  resetAll: () => void
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildInitialStatuses(): Record<MissionId, MissionStatus> {
  return {
    m1_first_snow: 'available',
    m2_whispers: 'locked',
    m3_lost_dog: 'locked',
    m4_crow_feathers: 'locked',
    m5_old_school: 'locked',
    m6_wolf_tracks: 'locked',
    m7_hunters_moon: 'locked',
    m8_last_stand: 'locked',
    m9_heart_of_porro: 'locked',
  }
}

function checkPrerequisites(
  id: MissionId,
  statuses: Record<MissionId, MissionStatus>,
): boolean {
  return MISSION_DEFINITIONS[id].prerequisites.every(
    (prereq) => statuses[prereq] === 'completed',
  )
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useMissionStore = create<MissionStoreState>()(
  immer((set, get) => ({
    missionStatuses: buildInitialStatuses(),
    objectiveProgress: {},
    activeMissionId: null,
    porroCorruption: 0,
    corruptionLevel: 'pure',
    storyFlags: [] as string[],
    totalXP: 0,

    // ── Missions ───────────────────────────────────────────────────────────

    startMission(id) {
      set((s) => {
        const status = s.missionStatuses[id]
        if (status !== 'available') return
        if (!checkPrerequisites(id, s.missionStatuses)) return

        s.missionStatuses[id] = 'active'
        s.activeMissionId = id

        // Initialise objective counters
        const def = MISSION_DEFINITIONS[id]
        for (const obj of def.objectives) {
          s.objectiveProgress[`${id}__${obj.id}`] = 0
        }
      })
    },

    completeMission(id, npcTrustUpdater) {
      set((s) => {
        if (s.missionStatuses[id] !== 'active') return

        s.missionStatuses[id] = 'completed'
        if (s.activeMissionId === id) s.activeMissionId = null

        const def = MISSION_DEFINITIONS[id]
        const { rewards } = def

        // XP
        s.totalXP += rewards.xp

        // Corruption delta
        if (rewards.corruptionDelta != null) {
          s.porroCorruption = Math.min(
            100,
            Math.max(0, s.porroCorruption + rewards.corruptionDelta),
          )
          s.corruptionLevel = getCorruptionLevel(s.porroCorruption)
        }

        // Unlock follow-up missions
        const allMissions = Object.keys(MISSION_DEFINITIONS) as MissionId[]
        for (const mid of allMissions) {
          if (
            s.missionStatuses[mid] === 'locked' &&
            checkPrerequisites(mid, s.missionStatuses)
          ) {
            s.missionStatuses[mid] = 'available'
          }
        }

        // Trust bonuses are applied outside immer to avoid cross-store mutation
        // The caller provides npcTrustUpdater so we can keep stores decoupled.
        if (rewards.trustBonus) {
          for (const [npcId, delta] of Object.entries(rewards.trustBonus)) {
            npcTrustUpdater(npcId as NPCId, delta)
          }
        }
      })
    },

    failMission(id) {
      set((s) => {
        if (s.missionStatuses[id] !== 'active') return
        s.missionStatuses[id] = 'available'
        if (s.activeMissionId === id) s.activeMissionId = null
      })
    },

    // ── Objectives ─────────────────────────────────────────────────────────

    advanceObjective(missionId, objectiveId, delta = 1) {
      set((s) => {
        const key = `${missionId}__${objectiveId}`
        const def = MISSION_DEFINITIONS[missionId]
        const obj = def.objectives.find((o) => o.id === objectiveId)
        if (!obj) return

        const prev = s.objectiveProgress[key] ?? 0
        s.objectiveProgress[key] = Math.min(obj.count, prev + delta)
      })
    },

    setObjectiveProgress(missionId, objectiveId, value) {
      set((s) => {
        const key = `${missionId}__${objectiveId}`
        const def = MISSION_DEFINITIONS[missionId]
        const obj = def.objectives.find((o) => o.id === objectiveId)
        if (!obj) return
        s.objectiveProgress[key] = Math.min(obj.count, Math.max(0, value))
      })
    },

    // ── Corruption ─────────────────────────────────────────────────────────

    modifyCorruption(delta) {
      set((s) => {
        s.porroCorruption = Math.min(STAT_MAX, Math.max(STAT_MIN, s.porroCorruption + delta))
        s.corruptionLevel = getCorruptionLevel(s.porroCorruption)
      })
    },

    usePurificationCrystal() {
      set((s) => {
        s.porroCorruption = Math.max(STAT_MIN, s.porroCorruption - CORRUPTION_CRYSTAL_REDUCE)
        s.corruptionLevel = getCorruptionLevel(s.porroCorruption)
      })
    },

    // ── Story flags ────────────────────────────────────────────────────────

    setFlag(flag) {
      set((s) => { if (!s.storyFlags.includes(flag)) s.storyFlags.push(flag) })
    },

    clearFlag(flag) {
      set((s) => { s.storyFlags = s.storyFlags.filter((f) => f !== flag) })
    },

    hasFlag(flag) {
      return get().storyFlags.includes(flag)
    },

    // ── XP ─────────────────────────────────────────────────────────────────

    awardXP(amount) {
      set((s) => { s.totalXP += amount })
    },

    // ── Reset ──────────────────────────────────────────────────────────────

    resetAll() {
      set((s) => {
        s.missionStatuses = buildInitialStatuses()
        s.objectiveProgress = {}
        s.activeMissionId = null
        s.porroCorruption = 0
        s.corruptionLevel = 'pure'
        s.storyFlags = [] as string[]
        s.totalXP = 0
      })
    },
  })),
)

// ─── Selector helpers ─────────────────────────────────────────────────────────

export const selectActiveMission = (s: MissionStoreState) =>
  s.activeMissionId ? MISSION_DEFINITIONS[s.activeMissionId] : null

export const selectCorruption = (s: MissionStoreState) => s.porroCorruption
export const selectCorruptionLevel = (s: MissionStoreState) => s.corruptionLevel
export const selectTotalXP = (s: MissionStoreState) => s.totalXP

export const selectObjectiveProgress = (
  missionId: MissionId,
  objectiveId: string,
) => (s: MissionStoreState) =>
  s.objectiveProgress[`${missionId}__${objectiveId}`] ?? 0
