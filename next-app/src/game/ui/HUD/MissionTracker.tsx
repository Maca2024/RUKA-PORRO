'use client'

import { motion } from 'framer-motion'
import { useMissionStore, selectActiveMission, MISSION_DEFINITIONS } from '../../stores/useMissionStore'
import { useUIStore, selectLanguage } from '../../stores/useUIStore'

export function MissionTracker() {
  const activeMission = useMissionStore(selectActiveMission)
  const objectiveProgress = useMissionStore((s) => s.objectiveProgress)
  const lang = useUIStore(selectLanguage)

  if (!activeMission) return null

  const title = lang === 'fi' ? activeMission.titleFi : activeMission.title

  // Find the first incomplete non-optional objective
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="flex flex-col items-center gap-1 max-w-sm"
      style={{ fontFamily: 'Nunito, sans-serif' }}
    >
      {/* Mission title */}
      <div className="flex items-center gap-2">
        <span className="text-base">🗺️</span>
        <span className="text-sm font-extrabold text-white drop-shadow-lg tracking-wide">
          {title}
        </span>
      </div>

      {/* Objective text */}
      <motion.div
        key={currentObjective.id}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl bg-black/40 backdrop-blur-sm border border-white/10 px-4 py-2 text-center"
      >
        <p className="text-sm font-bold text-amber-200 leading-snug">
          {objLabel}
          {isCountable && (
            <span className="ml-2 text-amber-400 font-extrabold">
              {progress}/{currentObjective.count}
            </span>
          )}
        </p>

        {/* Progress bar — only for countable objectives */}
        {isCountable && (
          <div className="mt-1.5 h-2 rounded-full bg-white/10 overflow-hidden">
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
