'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useUIStore, selectIsLoading, selectLanguage } from '../../stores/useUIStore'

// Aurora ray component
function AuroraRay({ index }: { index: number }) {
  const hues = [160, 200, 280, 320]
  const hue = hues[index % hues.length]
  const left = 10 + index * 22
  const delay = index * 0.6

  return (
    <motion.div
      className="absolute bottom-0 rounded-full opacity-0 pointer-events-none"
      style={{
        left: `${left}%`,
        width: 120 + index * 30,
        height: '60%',
        background: `linear-gradient(to top, hsla(${hue}, 80%, 55%, 0.0), hsla(${hue}, 80%, 55%, 0.18), hsla(${hue}, 80%, 70%, 0.0))`,
        filter: 'blur(28px)',
        transformOrigin: 'bottom center',
      }}
      animate={{
        opacity: [0, 0.7, 0.4, 0.8, 0],
        scaleX: [1, 1.15, 0.9, 1.05, 1],
        rotate: [-4 + index * 2, 4 - index * 2, -2 + index, 2, -4 + index * 2],
      }}
      transition={{
        duration: 5 + index * 0.8,
        repeat: Infinity,
        delay,
        ease: 'easeInOut',
      }}
    />
  )
}

// Animated dots
function LoadingDots() {
  return (
    <span className="inline-flex gap-1 ml-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.18 }}
          className="inline-block text-xl font-black text-blue-200"
        >
          •
        </motion.span>
      ))}
    </span>
  )
}

// Reindeer silhouette via SVG
function ReindeerSilhouette() {
  return (
    <motion.div
      animate={{
        y: [0, -10, 0],
        filter: [
          'drop-shadow(0 0 8px rgba(167,139,250,0.3))',
          'drop-shadow(0 0 20px rgba(167,139,250,0.6))',
          'drop-shadow(0 0 8px rgba(167,139,250,0.3))',
        ],
      }}
      transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
    >
      <svg
        viewBox="0 0 120 80"
        width={160}
        height={106}
        fill="currentColor"
        className="text-purple-300/70"
        aria-hidden
      >
        {/* Simplified reindeer silhouette */}
        {/* Body */}
        <ellipse cx="60" cy="52" rx="28" ry="16" />
        {/* Neck */}
        <rect x="75" y="34" width="10" height="20" rx="5" />
        {/* Head */}
        <ellipse cx="83" cy="30" rx="10" ry="8" />
        {/* Snout */}
        <ellipse cx="93" cy="32" rx="5" ry="4" />
        {/* Antlers left */}
        <path d="M78 24 L74 10 M74 10 L70 4 M74 10 L78 6 M74 10 L68 14" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        {/* Antlers right */}
        <path d="M86 22 L90 8 M90 8 L94 2 M90 8 L96 6 M90 8 L94 14" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        {/* Legs */}
        <rect x="40" y="66" width="7" height="14" rx="3" />
        <rect x="52" y="66" width="7" height="14" rx="3" />
        <rect x="65" y="66" width="7" height="14" rx="3" />
        <rect x="77" y="66" width="7" height="14" rx="3" />
        {/* Tail */}
        <ellipse cx="32" cy="50" rx="5" ry="4" />
      </svg>
    </motion.div>
  )
}

interface LoadingScreenProps {
  /** Called when exit animation completes */
  onExited?: () => void
}

export function LoadingScreen({ onExited }: LoadingScreenProps) {
  const isLoading = useUIStore(selectIsLoading)
  const loadingProgress = useUIStore((s) => s.loadingProgress)
  const loadingMessage = useUIStore((s) => s.loadingMessage)
  const lang = useUIStore(selectLanguage)

  const titleText = lang === 'fi' ? 'Ladataan…' : 'Loading…'

  return (
    <AnimatePresence onExitComplete={onExited}>
      {isLoading && (
        <motion.div
          key="loading"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: 'easeInOut' }}
          className="absolute inset-0 flex flex-col items-center justify-center z-[100] overflow-hidden"
          style={{
            background: 'linear-gradient(to bottom, #050b1a 0%, #0d0525 50%, #150330 100%)',
            fontFamily: 'Nunito, sans-serif',
          }}
          aria-live="assertive"
          aria-label={loadingMessage}
        >
          {/* Stars */}
          {Array.from({ length: 40 }, (_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                width: 1 + Math.random() * 2,
                height: 1 + Math.random() * 2,
                top: `${Math.random() * 60}%`,
                left: `${Math.random() * 100}%`,
              }}
              animate={{ opacity: [0.2, 1, 0.2] }}
              transition={{
                duration: 2 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 3,
              }}
            />
          ))}

          {/* Aurora rays */}
          <div className="absolute inset-0">
            {[0, 1, 2, 3].map((i) => <AuroraRay key={i} index={i} />)}
          </div>

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center gap-6 px-8">
            {/* Game logo */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-center"
            >
              <h1
                className="text-4xl font-black tracking-tight text-transparent"
                style={{
                  background: 'linear-gradient(135deg, #a78bfa 0%, #06b6d4 50%, #f0abfc 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                RUKA PORRO
              </h1>
              <p className="text-xs font-bold tracking-[0.4em] text-purple-300/60 uppercase mt-1">
                V O X L
              </p>
            </motion.div>

            {/* Reindeer */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <ReindeerSilhouette />
            </motion.div>

            {/* Loading text */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex items-baseline text-lg font-bold text-blue-200"
            >
              {titleText}
              <LoadingDots />
            </motion.div>

            {/* Progress bar */}
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: '100%' }}
              transition={{ delay: 0.5 }}
              className="w-64"
            >
              <div className="relative h-2.5 rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{
                    background:
                      'linear-gradient(to right, #7c3aed, #06b6d4)',
                  }}
                  animate={{ width: `${loadingProgress}%` }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                />
                {/* Shimmer */}
                <motion.div
                  className="absolute inset-y-0 w-16 bg-white/20 skew-x-12"
                  animate={{ left: ['-20%', '120%'] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
                />
              </div>
              <p className="mt-2 text-center text-xs text-purple-300/70 font-semibold">
                {loadingMessage}
              </p>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
