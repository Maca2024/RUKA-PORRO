'use client'

import { useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  useMissionStore,
  selectActiveMission,
  MISSION_DEFINITIONS,
} from '../../stores/useMissionStore'
import { useUIStore, selectLanguage } from '../../stores/useUIStore'
import { usePlayerStore } from '../../stores/usePlayerStore'

// Sieni's fixed spawn position (world units)
const SIENI_POSITION = { x: 0, z: 30 }

// ─── Compass arrow SVG ────────────────────────────────────────────────────────

interface CompassArrowProps {
  angleDeg: number
  distance: number
}

function CompassArrow({ angleDeg, distance }: CompassArrowProps) {
  const isClose = distance < 5

  return (
    <div className="relative flex items-center justify-center w-8 h-8">
      <motion.div
        animate={{ rotate: angleDeg }}
        transition={{ type: 'spring', stiffness: 120, damping: 18 }}
        className="absolute"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          {/* Arrow pointing up — rotation handles direction */}
          <path
            d="M12 3 L16 14 L12 12 L8 14 Z"
            fill={isClose ? '#fbbf24' : '#f97316'}
            stroke="rgba(0,0,0,0.4)"
            strokeWidth="0.8"
          />
          <path
            d="M12 12 L16 14 L12 21 L8 14 Z"
            fill="rgba(0,0,0,0.3)"
            stroke="rgba(0,0,0,0.3)"
            strokeWidth="0.5"
          />
        </svg>
      </motion.div>
      {/* Pulsing ring when close */}
      {isClose && (
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-amber-400"
          animate={{ scale: [1, 1.5, 1], opacity: [0.8, 0, 0.8] }}
          transition={{ duration: 1.2, repeat: Infinity }}
        />
      )}
    </div>
  )
}

// ─── Distance display ─────────────────────────────────────────────────────────

function formatDistance(dist: number, lang: 'fi' | 'en'): string {
  if (dist < 1) return lang === 'fi' ? 'Lähellä!' : 'Close!'
  if (dist < 10) return `${Math.round(dist)}m`
  return `${Math.round(dist)}m`
}

// ─── Main component ───────────────────────────────────────────────────────────

export function MissionTracker() {
  const activeMission = useMissionStore(selectActiveMission)
  const missionStatus = useMissionStore((s) => s.missionStatuses['m1_first_snow'])
  const objectiveProgress = useMissionStore((s) => s.objectiveProgress)
  const startMission = useMissionStore((s) => s.startMission)
  const lang = useUIStore(selectLanguage)
  const playerPos = usePlayerStore((s) => s.position)

  // Auto-start m1 on first mount if it has not been started yet
  useEffect(() => {
    if (missionStatus === 'available') {
      startMission('m1_first_snow')
    }
  }, [missionStatus, startMission])

  // Derive compass bearing toward Sieni (only relevant for reach_sieni objective)
  const { compassAngle, distanceToSieni } = useMemo(() => {
    const dx = SIENI_POSITION.x - playerPos.x
    const dz = SIENI_POSITION.z - playerPos.z
    // atan2 gives angle from +X axis; we convert to bearing from north (+Z)
    // Three.js: camera looks down -Z by default, but our world Y-up means
    // +Z is "north". We want the arrow to rotate to point toward the target
    // relative to screen-top. Using atan2(dx, dz) gives bearing from +Z.
    const angleRad = Math.atan2(dx, dz)
    const angleDeg = (angleRad * 180) / Math.PI
    const dist = Math.sqrt(dx * dx + dz * dz)
    return { compassAngle: angleDeg, distanceToSieni: dist }
  }, [playerPos.x, playerPos.z])

  if (!activeMission) return null

  const title = lang === 'fi' ? activeMission.titleFi : activeMission.title

  // Act label
  const actLabel =
    activeMission.act === 'act1'
      ? lang === 'fi'
        ? 'Osa I: Herätys'
        : 'Act I: Awakening'
      : activeMission.act === 'act2'
      ? lang === 'fi'
        ? 'Osa II: Varjo'
        : 'Act II: Shadow'
      : lang === 'fi'
      ? 'Osa III: Sydän'
      : 'Act III: Heart'

  // First incomplete non-optional objective
  const currentObjective = activeMission.objectives.find((obj) => {
    const key = `${activeMission.id}__${obj.id}`
    const progress = objectiveProgress[key] ?? 0
    return progress < obj.count && !obj.optional
  })

  if (!currentObjective) return null

  const progressKey = `${activeMission.id}__${currentObjective.id}`
  const progress = objectiveProgress[progressKey] ?? 0
  const objLabel =
    lang === 'fi' ? currentObjective.descriptionFi : currentObjective.description
  const pct = Math.min(100, (progress / currentObjective.count) * 100)
  const isCountable = currentObjective.count > 1
  const isReachSieni =
    activeMission.id === 'm1_first_snow' && currentObjective.id === 'reach_sieni'

  // Override objective label for m1 first objective to match brief spec
  const displayLabel = isReachSieni
    ? lang === 'fi'
      ? 'Etsi Sieni — Löydä mystinen sieniopas'
      : 'Find Sieni — Locate the mystic mushroom guide'
    : objLabel

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="flex flex-col items-center gap-1.5 max-w-xs w-full"
      style={{ fontFamily: 'Nunito, sans-serif' }}
    >
      {/* Act badge */}
      <motion.div
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="px-2.5 py-0.5 rounded-full bg-violet-900/60 backdrop-blur-sm
                   border border-violet-400/30 text-xs font-bold text-violet-200 tracking-widest uppercase"
      >
        {actLabel}
      </motion.div>

      {/* Mission title */}
      <div className="flex items-center gap-2">
        <span className="text-base" aria-hidden>🗺️</span>
        <span className="text-sm font-extrabold text-white drop-shadow-lg tracking-wide">
          {title}
        </span>
      </div>

      {/* Objective card */}
      <motion.div
        key={currentObjective.id}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full rounded-2xl bg-black/45 backdrop-blur-sm border border-white/12 px-4 py-2.5"
      >
        {/* Objective text + compass row */}
        <div className="flex items-center gap-3">
          {/* Pulsing objective dot */}
          <motion.div
            className="w-2 h-2 rounded-full bg-amber-400 shrink-0"
            animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          />

          <p className="flex-1 text-sm font-bold text-amber-200 leading-snug">
            {displayLabel}
            {isCountable && (
              <span className="ml-2 text-amber-400 font-extrabold">
                {progress}/{currentObjective.count}
              </span>
            )}
          </p>

          {/* Compass — only for navigation objectives */}
          {isReachSieni && (
            <div className="flex flex-col items-center gap-0.5 shrink-0">
              <CompassArrow angleDeg={compassAngle} distance={distanceToSieni} />
              <span className="text-xs font-bold text-white/70">
                {formatDistance(distanceToSieni, lang)}
              </span>
            </div>
          )}
        </div>

        {/* Progress bar — only for countable objectives */}
        {isCountable && (
          <div className="mt-2 h-1.5 rounded-full bg-white/10 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-amber-400 to-yellow-300"
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
