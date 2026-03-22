'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { usePlayerStore } from '../../stores/usePlayerStore'
import { useUIStore, selectLanguage } from '../../stores/useUIStore'
import { StatBar } from './StatBar'
import { CorruptionMeter } from './CorruptionMeter'
import { MissionTracker } from './MissionTracker'

interface HUDProps {
  interactionHint?: string | null
}

export function HUD({ interactionHint }: HUDProps) {
  const health = usePlayerStore((s) => s.health)
  const energy = usePlayerStore((s) => s.energy)
  const warmth = usePlayerStore((s) => s.warmth)
  const hunger = usePlayerStore((s) => s.hunger)
  const lang = useUIStore(selectLanguage)

  const isAnyCritical = health < 10 || energy < 10 || warmth < 10 || hunger < 10
  const vignetteOpacity = isAnyCritical ? 0.55 : 0

  const hint =
    interactionHint ??
    (lang === 'fi' ? null : null)

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
