'use client'

/**
 * GameUI — Root DOM UI compositor
 * Renders above the R3F Canvas as an absolute overlay.
 * All children get pointer-events:none by default;
 * interactive sub-panels re-enable them locally.
 */

import { AnimatePresence } from 'framer-motion'
import { useEffect } from 'react'
import { useUIStore } from '../stores/useUIStore'
import { HUD } from './HUD/HUD'
import { DialogueBox } from './Dialogue/DialogueBox'
import { PauseMenu } from './Menus/PauseMenu'
import { ToastNotification } from './Notifications/ToastNotification'
import { LoadingScreen } from './Loading/LoadingScreen'

interface GameUIProps {
  /** Optional interaction hint text (e.g. "Press E to talk to Sieni") */
  interactionHint?: string | null
}

export function GameUI({ interactionHint }: GameUIProps) {
  const activeScreen = useUIStore((s) => s.activeScreen)
  const isPaused = useUIStore((s) => s.isPaused)
  const isHUDVisible = useUIStore((s) => s.isHUDVisible)
  const isLoading = useUIStore((s) => s.isLoading)
  const togglePause = useUIStore((s) => s.togglePause)

  // Global Escape key → toggle pause (only during active gameplay)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Escape' && activeScreen !== 'dialogue' && !isLoading) {
        e.preventDefault()
        togglePause()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [activeScreen, isLoading, togglePause])

  return (
    // Root overlay — covers the full canvas; pointer-events:none by default
    <div
      className="absolute inset-0 overflow-hidden"
      style={{ pointerEvents: 'none', zIndex: 10 }}
    >
      {/* ── Loading screen (highest z) ── */}
      <AnimatePresence>
        {isLoading && <LoadingScreen key="loading" />}
      </AnimatePresence>

      {/* ── Toast notifications — always present ── */}
      <ToastNotification />

      {/* ── HUD — shown during active gameplay ── */}
      <AnimatePresence>
        {isHUDVisible && !isLoading && (
          <HUD key="hud" interactionHint={interactionHint} />
        )}
      </AnimatePresence>

      {/* ── Dialogue box ── */}
      <AnimatePresence>
        {activeScreen === 'dialogue' && (
          <DialogueBox key="dialogue" />
        )}
      </AnimatePresence>

      {/* ── Pause menu ── */}
      <AnimatePresence>
        {isPaused && (
          <PauseMenu key="pause" />
        )}
      </AnimatePresence>
    </div>
  )
}
