'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePlayerStore } from '../../stores/usePlayerStore'
import { useUIStore, selectLanguage, selectIsPaused } from '../../stores/useUIStore'
import { StatBar } from './StatBar'
import { CorruptionMeter } from './CorruptionMeter'
import { MissionTracker } from './MissionTracker'

// ─── Controls help overlay ────────────────────────────────────────────────────

const CONTROLS_EN = [
  { key: 'WASD / ↑↓←→', action: 'Move' },
  { key: 'Space', action: 'Jump' },
  { key: 'Shift', action: 'Sprint' },
  { key: 'E', action: 'Interact' },
  { key: 'Scroll', action: 'Zoom' },
  { key: 'Click + drag', action: 'Look around' },
]

const CONTROLS_FI = [
  { key: 'WASD / ↑↓←→', action: 'Liiku' },
  { key: 'Välilyönti', action: 'Hyppää' },
  { key: 'Shift', action: 'Juokse' },
  { key: 'E', action: 'Vuorovaikuta' },
  { key: 'Vieritys', action: 'Lähennä' },
  { key: 'Klikkaa + vedä', action: 'Katso ympärille' },
]

const FADE_AFTER_MS = 10_000

interface ControlsHintProps {
  lang: 'fi' | 'en'
  isPaused: boolean
}

function ControlsHint({ lang, isPaused }: ControlsHintProps) {
  const [visible, setVisible] = useState(true)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const controls = lang === 'fi' ? CONTROLS_FI : CONTROLS_EN

  // Auto-hide after FADE_AFTER_MS, re-show when game is paused
  useEffect(() => {
    if (isPaused) {
      setVisible(true)
      if (timerRef.current) clearTimeout(timerRef.current)
      return
    }

    // Start / restart the fade timer when unpaused
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      setVisible(false)
    }, FADE_AFTER_MS)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isPaused])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="controls-hint"
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -8 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="absolute bottom-8 left-4 pointer-events-none"
          style={{ fontFamily: 'Nunito, sans-serif' }}
          role="complementary"
          aria-label={lang === 'fi' ? 'Ohjaimet' : 'Controls'}
        >
          <div
            className="rounded-2xl bg-black/40 backdrop-blur-sm border border-white/10 px-3 py-2.5"
            style={{ minWidth: '11rem' }}
          >
            <p className="text-xs font-extrabold text-white/50 uppercase tracking-widest mb-1.5">
              {lang === 'fi' ? 'Ohjaimet' : 'Controls'}
            </p>
            <ul className="flex flex-col gap-0.5">
              {controls.map(({ key, action }) => (
                <li key={key} className="flex items-center gap-2">
                  <kbd
                    className="rounded-md border border-white/20 bg-white/10 px-1.5 py-0.5
                               text-xs font-bold text-white whitespace-nowrap min-w-[2.5rem] text-center"
                  >
                    {key}
                  </kbd>
                  <span className="text-xs text-white/65">{action}</span>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ─── HUD root ─────────────────────────────────────────────────────────────────

interface HUDProps {
  interactionHint?: string | null
}

export function HUD({ interactionHint }: HUDProps) {
  const health = usePlayerStore((s) => s.health)
  const energy = usePlayerStore((s) => s.energy)
  const warmth = usePlayerStore((s) => s.warmth)
  const hunger = usePlayerStore((s) => s.hunger)
  const lang = useUIStore(selectLanguage)
  const isPaused = useUIStore(selectIsPaused)

  const isAnyCritical = health < 10 || energy < 10 || warmth < 10 || hunger < 10
  const vignetteOpacity = isAnyCritical ? 0.55 : 0

  const hint = interactionHint ?? null

  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{ fontFamily: 'Nunito, sans-serif' }}
    >
      {/* ── Red vignette when any stat critical ── */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 40%, rgba(220,38,38,0.85) 100%)',
        }}
        animate={{ opacity: vignetteOpacity }}
        transition={{ duration: 0.3 }}
      />

      {/* ── Top-left: Stat bars ── */}
      <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-auto">
        <StatBar
          value={health}
          icon="❤️"
          color="#ef4444"
          bgColor="rgba(239,68,68,0.2)"
          label={lang === 'fi' ? 'Terveys' : 'Health'}
        />
        <StatBar
          value={energy}
          icon="⚡"
          color="#f59e0b"
          bgColor="rgba(245,158,11,0.2)"
          label={lang === 'fi' ? 'Energia' : 'Energy'}
        />
        <StatBar
          value={warmth}
          icon="🔥"
          color="#f97316"
          bgColor="rgba(249,115,22,0.2)"
          label={lang === 'fi' ? 'Lämpö' : 'Warmth'}
        />
        <StatBar
          value={hunger}
          icon="🍃"
          color="#22c55e"
          bgColor="rgba(34,197,94,0.2)"
          label={lang === 'fi' ? 'Nälkä' : 'Hunger'}
        />
      </div>

      {/* ── Top-right: Corruption meter ── */}
      <div className="absolute top-4 right-4 flex items-start pointer-events-auto">
        <AnimatePresence>
          <CorruptionMeter />
        </AnimatePresence>
      </div>

      {/* ── Bottom-center: Mission tracker ── */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <AnimatePresence>
          <MissionTracker />
        </AnimatePresence>
      </div>

      {/* ── Bottom-left: Controls hint ── */}
      <ControlsHint lang={lang} isPaused={isPaused} />

      {/* ── Bottom-right: Interaction hint ── */}
      <AnimatePresence>
        {hint && (
          <motion.div
            key="interaction-hint"
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            className="absolute bottom-8 right-6 pointer-events-none"
          >
            <div className="flex items-center gap-2 rounded-2xl bg-black/50 backdrop-blur-sm border border-white/15 px-4 py-2.5">
              <motion.span
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 1.4, repeat: Infinity }}
                className="text-base"
                aria-hidden
              >
                💬
              </motion.span>
              <span className="text-sm font-bold text-white">{hint}</span>
              <kbd className="ml-1 rounded-lg border border-white/30 bg-white/10 px-2 py-0.5 text-xs font-bold text-white">
                E
              </kbd>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
