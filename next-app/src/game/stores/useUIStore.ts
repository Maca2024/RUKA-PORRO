'use client'

/**
 * RUKA-PORRO — UI store
 * Manages screen state, active dialogue, toast notifications,
 * game settings, and language selection.
 */

import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { UIScreen, ToastNotification, GameSettings, NPCId, DialogueNode } from '../types/game'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ActiveDialogueState {
  npcId: NPCId
  currentNode: DialogueNode
  /** IDs of nodes visited in this conversation session */
  visitedNodes: string[]
}

interface UIStoreState {
  activeScreen: UIScreen
  previousScreen: UIScreen | null

  /** Non-null while a dialogue is running */
  activeDialogue: ActiveDialogueState | null

  /** FIFO toast queue — renderer pops from the front */
  toasts: ToastNotification[]

  /** Whether the HUD stat bars are visible */
  isHUDVisible: boolean

  /** Whether the game is currently paused */
  isPaused: boolean

  /** Whether a loading screen should be shown */
  isLoading: boolean
  loadingProgress: number
  loadingMessage: string

  settings: GameSettings

  // ── Navigation ────────────────────────────────────────────────────────────

  /** Navigate to a screen, remembering the previous one. */
  openScreen: (screen: UIScreen) => void

  /** Return to the previous screen, or 'game' if none. */
  goBack: () => void

  /** Close any overlay and return to 'game'. */
  closeOverlay: () => void

  // ── Pause ─────────────────────────────────────────────────────────────────

  togglePause: () => void
  setPaused: (v: boolean) => void

  // ── Dialogue ──────────────────────────────────────────────────────────────

  /** Open a dialogue with an NPC at the given entry node. */
  openDialogue: (npcId: NPCId, entryNode: DialogueNode) => void

  /** Advance to the next node in the active dialogue. */
  advanceDialogue: (nextNode: DialogueNode) => void

  /** Close the active dialogue. */
  closeDialogue: () => void

  // ── Toasts ────────────────────────────────────────────────────────────────

  /** Push a notification onto the queue. */
  addToast: (toast: Omit<ToastNotification, 'id'>) => void

  /** Remove a specific toast by ID (called when its timer expires). */
  dismissToast: (id: string) => void

  /** Clear all pending toasts. */
  clearToasts: () => void

  // ── Loading ───────────────────────────────────────────────────────────────

  setLoading: (v: boolean) => void
  setLoadingProgress: (pct: number, message?: string) => void

  // ── HUD ───────────────────────────────────────────────────────────────────

  setHUDVisible: (v: boolean) => void

  // ── Settings ──────────────────────────────────────────────────────────────

  updateSettings: (patch: Partial<GameSettings>) => void
  setLanguage: (lang: 'fi' | 'en') => void
  setMusicVolume: (v: number) => void
  setSFXVolume: (v: number) => void
  setGraphicsQuality: (q: GameSettings['graphicsQuality']) => void
  toggleTutorialHints: () => void
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

const DEFAULT_SETTINGS: GameSettings = {
  musicVolume: 0.7,
  sfxVolume: 0.8,
  showTutorialHints: true,
  language: 'fi',
  graphicsQuality: 'medium',
}

let toastCounter = 0

function nextToastId(): string {
  return `toast_${++toastCounter}_${Date.now()}`
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useUIStore = create<UIStoreState>()(
  immer((set, get) => ({
    activeScreen: 'game',
    previousScreen: null,
    activeDialogue: null,
    toasts: [],
    isHUDVisible: true,
    isPaused: false,
    isLoading: true,
    loadingProgress: 0,
    loadingMessage: 'Ladataan maailmaa…',
    settings: { ...DEFAULT_SETTINGS },

    // ── Navigation ────────────────────────────────────────────────────────

    openScreen(screen) {
      set((s) => {
        s.previousScreen = s.activeScreen
        s.activeScreen = screen
        // Hide HUD when entering any overlay
        if (screen !== 'game') s.isHUDVisible = false
      })
    },

    goBack() {
      set((s) => {
        const prev = s.previousScreen ?? 'game'
        s.previousScreen = s.activeScreen
        s.activeScreen = prev
        if (s.activeScreen === 'game') s.isHUDVisible = true
      })
    },

    closeOverlay() {
      set((s) => {
        s.previousScreen = s.activeScreen
        s.activeScreen = 'game'
        s.isHUDVisible = true
      })
    },

    // ── Pause ─────────────────────────────────────────────────────────────

    togglePause() {
      set((s) => {
        s.isPaused = !s.isPaused
        if (s.isPaused) {
          s.previousScreen = s.activeScreen
          s.activeScreen = 'pause'
          s.isHUDVisible = false
        } else {
          s.activeScreen = s.previousScreen ?? 'game'
          s.previousScreen = null
          if (s.activeScreen === 'game') s.isHUDVisible = true
        }
      })
    },

    setPaused(v) {
      if (v !== get().isPaused) get().togglePause()
    },

    // ── Dialogue ──────────────────────────────────────────────────────────

    openDialogue(npcId, entryNode) {
      set((s) => {
        s.activeDialogue = {
          npcId,
          currentNode: entryNode,
          visitedNodes: [entryNode.id],
        }
        s.previousScreen = s.activeScreen
        s.activeScreen = 'dialogue'
        s.isHUDVisible = false
      })
    },

    advanceDialogue(nextNode) {
      set((s) => {
        if (!s.activeDialogue) return
        s.activeDialogue.currentNode = nextNode
        if (!s.activeDialogue.visitedNodes.includes(nextNode.id)) {
          s.activeDialogue.visitedNodes.push(nextNode.id)
        }
      })
    },

    closeDialogue() {
      set((s) => {
        s.activeDialogue = null
        s.activeScreen = s.previousScreen ?? 'game'
        s.previousScreen = null
        if (s.activeScreen === 'game') s.isHUDVisible = true
      })
    },

    // ── Toasts ────────────────────────────────────────────────────────────

    addToast(toast) {
      set((s) => {
        // Keep queue length reasonable for kids' game — max 5 pending toasts
        if (s.toasts.length >= 5) {
          s.toasts.shift()
        }
        s.toasts.push({ ...toast, id: nextToastId() })
      })
    },

    dismissToast(id) {
      set((s) => {
        s.toasts = s.toasts.filter((t) => t.id !== id)
      })
    },

    clearToasts() {
      set((s) => { s.toasts = [] })
    },

    // ── Loading ───────────────────────────────────────────────────────────

    setLoading(v) {
      set((s) => { s.isLoading = v })
    },

    setLoadingProgress(pct, message) {
      set((s) => {
        s.loadingProgress = Math.min(100, Math.max(0, pct))
        if (message !== undefined) s.loadingMessage = message
      })
    },

    // ── HUD ───────────────────────────────────────────────────────────────

    setHUDVisible(v) {
      set((s) => { s.isHUDVisible = v })
    },

    // ── Settings ──────────────────────────────────────────────────────────

    updateSettings(patch) {
      set((s) => {
        Object.assign(s.settings, patch)
      })
    },

    setLanguage(lang) {
      set((s) => { s.settings.language = lang })
    },

    setMusicVolume(v) {
      set((s) => { s.settings.musicVolume = Math.min(1, Math.max(0, v)) })
    },

    setSFXVolume(v) {
      set((s) => { s.settings.sfxVolume = Math.min(1, Math.max(0, v)) })
    },

    setGraphicsQuality(q) {
      set((s) => { s.settings.graphicsQuality = q })
    },

    toggleTutorialHints() {
      set((s) => { s.settings.showTutorialHints = !s.settings.showTutorialHints })
    },
  })),
)

// ─── Selector helpers ─────────────────────────────────────────────────────────

export const selectScreen = (s: UIStoreState) => s.activeScreen
export const selectIsPaused = (s: UIStoreState) => s.isPaused
export const selectActiveDialogue = (s: UIStoreState) => s.activeDialogue
export const selectToasts = (s: UIStoreState) => s.toasts
export const selectSettings = (s: UIStoreState) => s.settings
export const selectLanguage = (s: UIStoreState) => s.settings.language
export const selectIsLoading = (s: UIStoreState) => s.isLoading
export const selectHUDVisible = (s: UIStoreState) => s.isHUDVisible
