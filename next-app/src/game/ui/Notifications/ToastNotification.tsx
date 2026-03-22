'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { useUIStore, selectToasts, selectLanguage } from '../../stores/useUIStore'
import type { ToastNotification as ToastType } from '../../types/game'

const TOAST_STYLES: Record<ToastType['type'], { bg: string; border: string; icon: string; label: string }> = {
  mission:     { bg: 'from-amber-500/20 to-yellow-600/10',  border: 'border-amber-400/40',  icon: '🗺️', label: 'Mission'     },
  trust:       { bg: 'from-pink-500/20 to-rose-600/10',     border: 'border-pink-400/40',   icon: '💗', label: 'Trust'       },
  item:        { bg: 'from-green-500/20 to-emerald-600/10', border: 'border-green-400/40',  icon: '✨', label: 'Item'        },
  warning:     { bg: 'from-orange-500/20 to-red-600/10',    border: 'border-orange-400/40', icon: '⚠️', label: 'Warning'     },
  achievement: { bg: 'from-purple-500/20 to-violet-600/10', border: 'border-purple-400/40', icon: '🏆', label: 'Achievement' },
}

const MAX_VISIBLE = 3

interface ToastItemProps {
  toast: ToastType
  lang: 'fi' | 'en'
}

function ToastItem({ toast, lang }: ToastItemProps) {
  const dismiss = useUIStore((s) => s.dismissToast)
  const style = TOAST_STYLES[toast.type]
  const message = lang === 'fi' ? toast.messageFi : toast.message
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      dismiss(toast.id)
    }, toast.duration)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [toast.id, toast.duration, dismiss])

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -24, scale: 0.88 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -16, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 380, damping: 28 }}
      className={`flex items-center gap-3 rounded-2xl border bg-gradient-to-r backdrop-blur-md px-4 py-3 shadow-xl min-w-[260px] max-w-[340px] cursor-pointer ${style.bg} ${style.border}`}
      style={{ fontFamily: 'Nunito, sans-serif' }}
      onClick={() => dismiss(toast.id)}
      role="alert"
      aria-live="polite"
    >
      {/* Icon with bounce */}
      <motion.span
        animate={{ scale: [1, 1.3, 1] }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="text-xl flex-shrink-0"
      >
        {toast.icon ?? style.icon}
      </motion.span>

      {/* Message */}
      <p className="flex-1 text-sm font-bold text-white leading-snug">
        {message}
      </p>

      {/* Dismiss button */}
      <button
        className="flex-shrink-0 text-white/30 hover:text-white/70 text-xs transition-colors"
        aria-label="Dismiss notification"
      >
        ✕
      </button>
    </motion.div>
  )
}

export function ToastNotification() {
  const toasts = useUIStore(selectToasts)
  const lang = useUIStore(selectLanguage)

  // Show at most MAX_VISIBLE newest toasts
  const visible = toasts.slice(-MAX_VISIBLE)

  return (
    <div
      className="absolute top-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-50 pointer-events-none"
      aria-label="Notifications"
    >
      <AnimatePresence mode="sync">
        {visible.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} lang={lang} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  )
}
