/**
 * RUKA-PORRO — Core game type definitions
 * Finnish Lapland 3D adventure for kids 6-12
 */

// ─── Identifiers ─────────────────────────────────────────────────────────────

export type NPCId =
  | 'sieni'
  | 'sammal'
  | 'yuki'
  | 'taisto'
  | 'karen'
  | 'koulu'
  | 'susi'
  | 'metsastaja'
  | 'karhu'

export type NPCPersonality =
  | 'wise'
  | 'gentle'
  | 'loyal'
  | 'brave'
  | 'mischievous'
  | 'sanctuary'
  | 'cunning'
  | 'threatening'
  | 'ancient'

export type NPCFSMState =
  | 'idle'
  | 'wandering'
  | 'noticing'
  | 'approaching'
  | 'dialogue'
  | 'fleeing'

export type WeatherType = 'clear' | 'light-snow' | 'heavy-snow' | 'blizzard'

export type MissionId =
  | 'm1_first_snow'
  | 'm2_whispers'
  | 'm3_lost_dog'
  | 'm4_crow_feathers'
  | 'm5_old_school'
  | 'm6_wolf_tracks'
  | 'm7_hunters_moon'
  | 'm8_last_stand'
  | 'm9_heart_of_porro'

export type ActId = 'act1' | 'act2' | 'act3'

export type UIScreen =
  | 'game'
  | 'pause'
  | 'dialogue'
  | 'inventory'
  | 'mission-log'
  | 'map'
  | 'settings'

export type CorruptionLevel =
  | 'pure'
  | 'touched'
  | 'influenced'
  | 'corrupted'
  | 'consumed'

export type TimeOfDay = 'dawn' | 'day' | 'dusk' | 'night'

export type SurfaceType = 'snow' | 'ice' | 'grass' | 'rock'

export type ObjectiveType = 'reach' | 'collect' | 'talk' | 'survive' | 'avoid' | 'defeat'

export type MissionStatus = 'locked' | 'available' | 'active' | 'completed' | 'failed'

// ─── Primitives ───────────────────────────────────────────────────────────────

export interface Vec3 {
  x: number
  y: number
  z: number
}

/** Bilingual string — always carry both languages so the UI can switch instantly */
export interface LocalizedText {
  fi: string
  en: string
}

// ─── Player ───────────────────────────────────────────────────────────────────

export interface InventoryItem {
  id: string
  type: 'food' | 'crystal' | 'quest'
  name: string
  nameFi: string
  quantity: number
  icon: string
}

export interface PlayerState {
  position: Vec3
  rotation: number
  velocity: Vec3
  /** 0–100 */
  health: number
  /** 0–100 */
  energy: number
  /** 0–100 */
  warmth: number
  /** 0–100 */
  hunger: number
  isGrounded: boolean
  isSprinting: boolean
  isJumping: boolean
  isInDialogue: boolean
  inventory: InventoryItem[]
}

// ─── NPCs ─────────────────────────────────────────────────────────────────────

export interface NPCDefinition {
  id: NPCId
  name: string
  nameFi: string
  species: string
  role: string
  personality: NPCPersonality
  description: string
  descriptionFi: string
  noticeRadius: number
  /** Trust value at which this NPC flees; null = never flees */
  fleeThreshold: number | null
  wanderSpeed: number
  trustGainRate: number
  /** Initial trust value in range -100…+100 */
  initialTrust: number
  spawnPoint: Vec3
  modelType: string
  color: string
  isCorruptionSource?: boolean
  favoriteItems: string[]
  fearItems: string[]
}

export interface NPCState {
  id: NPCId
  /** -100…+100 */
  trust: number
  currentState: NPCFSMState
  position: Vec3
  isInDialogue: boolean
  dialogueHistory: string[]
  /** Unix ms timestamp of last player interaction */
  lastInteraction: number
}

// ─── Dialogue ─────────────────────────────────────────────────────────────────

export type DialogueCondition =
  | { type: 'trust_gte'; value: number }
  | { type: 'trust_lte'; value: number }
  | { type: 'mission_active'; missionId: MissionId }
  | { type: 'mission_completed'; missionId: MissionId }
  | { type: 'has_item'; itemId: string }
  | { type: 'always' }

export interface DialogueChoice {
  id: string
  text: string
  textFi: string
  trustDelta: number
  /** Node to advance to, or null to end the conversation */
  next: string | null
  icon?: string
}

export interface DialogueNode {
  id: string
  speaker: NPCId
  text: string
  textFi: string
  emotion: 'happy' | 'sad' | 'mysterious' | 'warning' | 'playful' | 'angry' | 'wise' | 'gentle' | 'scared'
  condition: DialogueCondition
  choices: DialogueChoice[]
  /** Auto-advance to this node when there are no choices; null = end */
  autoNext: string | null
  trustDelta?: number
  missionTrigger?: MissionId
}

export interface DialogueTree {
  npcId: NPCId
  entryNodeId: string
  nodes: Record<string, DialogueNode>
}

// ─── Missions ─────────────────────────────────────────────────────────────────

export interface MissionObjective {
  id: string
  type: ObjectiveType
  target: string
  count: number
  current: number
  description: string
  descriptionFi: string
  optional: boolean
}

export interface MissionReward {
  xp: number
  items?: string[]
  trustBonus?: Partial<Record<NPCId, number>>
  corruptionDelta?: number
  abilityUnlocks?: string[]
}

export interface MissionDefinition {
  id: MissionId
  act: ActId
  /** 1-based sequence within the act */
  sequence: number
  title: string
  titleFi: string
  description: string
  descriptionFi: string
  objectives: MissionObjective[]
  prerequisites: MissionId[]
  rewards: MissionReward
  requiredTrust?: Partial<Record<NPCId, number>>
  /** Seconds to complete, null = no limit */
  timeLimit: number | null
  failureIsGameOver: boolean
}

// ─── Weather ──────────────────────────────────────────────────────────────────

export interface WeatherState {
  current: WeatherType
  windDirection: { x: number; z: number }
  windStrength: number
  temperature: number
  visibility: number
  transitionProgress: number
  snowIntensity: number
}

// ─── World ────────────────────────────────────────────────────────────────────

export interface WorldState {
  timeOfDay: TimeOfDay
  dayProgress: number
  worldSize: number
  activeChunks: string[]
}

// ─── Settings & Persistence ───────────────────────────────────────────────────

export interface GameSettings {
  musicVolume: number
  sfxVolume: number
  showTutorialHints: boolean
  language: 'fi' | 'en'
  graphicsQuality: 'low' | 'medium' | 'high'
}

export interface SaveData {
  playerState: Omit<PlayerState, 'velocity' | 'isGrounded' | 'isSprinting' | 'isJumping'>
  npcStates: Partial<Record<NPCId, Pick<NPCState, 'trust' | 'dialogueHistory'>>>
  completedMissions: MissionId[]
  activeMission: MissionId | null
  porroCorruption: number
  storyFlags: string[]
  settings: GameSettings
  lastSaved: number
}

// ─── UI ───────────────────────────────────────────────────────────────────────

export interface ToastNotification {
  id: string
  type: 'mission' | 'trust' | 'item' | 'warning' | 'achievement'
  message: string
  messageFi: string
  icon?: string
  duration: number
}

// ─── Pure helpers ─────────────────────────────────────────────────────────────

export function getCorruptionLevel(value: number): CorruptionLevel {
  if (value <= 20) return 'pure'
  if (value <= 40) return 'touched'
  if (value <= 60) return 'influenced'
  if (value <= 80) return 'corrupted'
  return 'consumed'
}

export function getTimeOfDay(progress: number): TimeOfDay {
  if (progress < 0.2) return 'night'
  if (progress < 0.3) return 'dawn'
  if (progress < 0.7) return 'day'
  if (progress < 0.8) return 'dusk'
  return 'night'
}
