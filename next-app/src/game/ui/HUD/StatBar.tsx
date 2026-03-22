'use client'

import { motion, useAnimation } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

interface StatBarProps {
  value: number
  maxValue?: number
  icon: string
  color: string
  bgColor: string
  label: string
}

export function StatBar({
  value,
  maxValue = 100,
  icon,
  color,
  bgColor,
  label,
}: StatBarProps) {
  const pct = Math.min(100, Math.max(0, (value / maxValue) * 100))
  const isLow = pct < 25
  const isCritical = pct < 10
  const [showTooltip, setShowTooltip] = useState(false)
  const controls = useAnimation()
  const prevPct = useRef(pct)

  // Shake on critical drop
  useEffect(() => {
    if (isCritical && prevPct.current >= 10) {
      void controls.start({
        x: [0, -6, 6, -6, 6, -4, 4, 0],
        transition: { duration: 0.5, ease: 'easeInOut' },
      })
    }
    prevPct.current = pct
  }, [isCritical, controls, pct])

  return (
    <motion.div
      animate={controls}
      className="relative flex items-center gap-1.5 w-36"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Icon with pulse when low */}
      <motion.span
        className="text-lg leading-none select-none"
        animate={
          isLow
            ? {
                scale: [1, 1.25, 1],
                filter: [
                  'drop-shadow(0 0 0px transparent)',
                  `drop-shadow(0 0 6px ${color})`,
                  'drop-shadow(0 0 0px transparent)',
                ],
              }
            : { scale: 1 }
        }
        transition={
          isLow
            ? { duration: 1.2, repeat: Infinity, ease: 'easeInOut' }
            : {}
        }
      >
        {icon}
      </motion.span>

      {/* Bar track */}
      <div
        className="relative flex-1 h-3 rounded-full overflow-hidden"
        style={{ backgroundColor: bgColor }}
      >
        {/* Fill */}
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ backgroundColor: color }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />

        {/* Glow overlay when low */}
        {isLow && (
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{ backgroundColor: color, mixBlendMode: 'screen' }}
            animate={{ opacity: [0, 0.5, 0] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <motion.div
          initial={{ opacity: 0, y: 4, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="absolute -top-9 left-1/2 -translate-x-1/2 z-50 whitespace-nowrap rounded-xl bg-gray-900/90 px-3 py-1 text-xs font-bold text-white shadow-lg backdrop-blur-sm pointer-events-none"
          style={{ fontFamily: 'Nunito, sans-serif' }}
        >
          {label}: {Math.round(value)}/{maxValue}
          {/* Arrow */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900/90" />
        </motion.div>
      )}
    </motion.div>
  )
}
