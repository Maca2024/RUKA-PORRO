'use client'

import { motion } from 'framer-motion'
import { useMissionStore, selectCorruption, selectCorruptionLevel } from '../../stores/useMissionStore'
import type { CorruptionLevel } from '../../types/game'

const LEVEL_LABELS: Record<CorruptionLevel, { en: string; fi: string; color: string }> = {
  pure:       { en: 'Pure',       fi: 'Puhdas',     color: '#a78bfa' },
  touched:    { en: 'Touched',    fi: 'Kosketettu', color: '#8b5cf6' },
  influenced: { en: 'Influenced', fi: 'Vaikutettu', color: '#7c3aed' },
  corrupted:  { en: 'Corrupted',  fi: 'Saastunut',  color: '#6d28d9' },
  consumed:   { en: 'Consumed',   fi: 'Nielty',     color: '#4c1d95' },
}

// Floating particle for high corruption
function CorruptionParticle({ index }: { index: number }) {
  const angle = (index / 8) * Math.PI * 2
  const radius = 20 + Math.random() * 10
  return (
    <motion.div
      className="absolute w-1 h-1 rounded-full bg-purple-400 pointer-events-none"
      style={{ top: '50%', left: '50%' }}
      animate={{
        x: [0, Math.cos(angle) * radius, 0],
        y: [0, Math.sin(angle) * radius, 0],
        opacity: [0, 0.8, 0],
        scale: [0, 1.5, 0],
      }}
      transition={{
        duration: 2 + index * 0.3,
        repeat: Infinity,
        delay: index * 0.2,
        ease: 'easeInOut',
      }}
    />
  )
}

export function CorruptionMeter() {
  const corruption = useMissionStore(selectCorruption)
  const level = useMissionStore(selectCorruptionLevel)

  // Only visible when corruption > 10
  if (corruption <= 10) return null

  const pct = Math.min(100, Math.max(0, corruption))
  const levelInfo = LEVEL_LABELS[level]
  const glowIntensity = Math.floor((pct / 100) * 20)
  const showParticles = pct >= 60

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="flex flex-col items-center gap-2 pointer-events-auto"
      style={{ fontFamily: 'Nunito, sans-serif' }}
    >
      {/* Label */}
      <motion.span
        className="text-xs font-extrabold tracking-wide uppercase text-purple-300"
        animate={
          pct >= 80
            ? { opacity: [1, 0.4, 1] }
            : { opacity: 1 }
        }
        transition={pct >= 80 ? { duration: 0.8, repeat: Infinity } : {}}
      >
        {levelInfo.en}
      </motion.span>

      {/* Vertical bar */}
      <div className="relative flex flex-col items-center">
        {/* Glow halo */}
        {pct > 20 && (
          <motion.div
            className="absolute inset-0 rounded-full blur-md"
            style={{ backgroundColor: '#7c3aed' }}
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}

        {/* Track */}
        <div
          className="relative w-5 rounded-full overflow-hidden border border-purple-800/60"
          style={{
            height: 100,
            backgroundColor: '#1e0a3c',
            boxShadow: pct > 0 ? `0 0 ${glowIntensity}px #7c3aed` : 'none',
          }}
        >
          {/* Fill — grows from bottom */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 rounded-full"
            style={{
              background: `linear-gradient(to top, ${levelInfo.color}, #c4b5fd)`,
            }}
            animate={{ height: `${pct}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />

          {/* Shimmer */}
          <motion.div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(to bottom, rgba(255,255,255,0.15) 0%, transparent 50%, rgba(255,255,255,0.05) 100%)',
            }}
          />

          {/* Tick marks */}
          {[25, 50, 75].map((tick) => (
            <div
              key={tick}
              className="absolute left-0 right-0 h-px bg-purple-900/60"
              style={{ bottom: `${tick}%` }}
            />
          ))}
        </div>

        {/* Particles at high corruption */}
        {showParticles && (
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 8 }, (_, i) => (
              <CorruptionParticle key={i} index={i} />
            ))}
          </div>
        )}
      </div>

      {/* Percentage */}
      <motion.span
        className="text-xs font-bold text-purple-300"
        animate={
          pct >= 80
            ? { color: ['#c4b5fd', '#f0abfc', '#c4b5fd'] }
            : {}
        }
        transition={pct >= 80 ? { duration: 1, repeat: Infinity } : {}}
      >
        {Math.round(pct)}%
      </motion.span>
    </motion.div>
  )
}
