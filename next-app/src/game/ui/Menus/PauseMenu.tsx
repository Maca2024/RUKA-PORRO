'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { useUIStore, selectLanguage } from '../../stores/useUIStore'
import { SettingsPanel } from './SettingsPanel'

type PauseTab = 'main' | 'settings'

const buttonVariants = {
  initial: { opacity: 0, y: 16, scale: 0.94 },
  animate: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { delay: 0.05 + i * 0.07, type: 'spring' as const, stiffness: 300, damping: 22 },
  }),
}

interface MenuButtonProps {
  icon: string
  label: string
  onClick: () => void
  index: number
  variant?: 'default' | 'danger'
}

function MenuButton({ icon, label, onClick, index, variant = 'default' }: MenuButtonProps) {
  return (
    <motion.button
      custom={index}
      variants={buttonVariants}
      initial="initial"
      animate="animate"
      whileHover={{ scale: 1.04, y: -2 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`flex items-center gap-3 w-full rounded-2xl border px-5 py-4 text-base font-extrabold transition-all min-h-[56px] ${
        variant === 'danger'
          ? 'border-red-500/40 bg-red-900/20 text-red-300 hover:bg-red-800/30 hover:border-red-400/60'
          : 'border-white/15 bg-white/8 text-white hover:bg-white/15 hover:border-white/25'
      }`}
      style={{ backdropFilter: 'blur(6px)' }}
    >
      <span className="text-xl w-7 text-center flex-shrink-0">{icon}</span>
      {label}
    </motion.button>
  )
}

export function PauseMenu() {
  const togglePause = useUIStore((s) => s.togglePause)
  const openScreen = useUIStore((s) => s.openScreen)
  const lang = useUIStore(selectLanguage)
  const [tab, setTab] = useState<PauseTab>('main')

  const handleResume = () => togglePause()

  const handleSave = () => {
    // TODO: implement save system
    togglePause()
  }

  const handleQuit = () => {
    // Navigate back to landing
    window.location.href = '/'
  }

  const L = {
    title:      lang === 'fi' ? 'Tauko' : 'Paused',
    resume:     lang === 'fi' ? 'Jatka peliä' : 'Resume',
    save:       lang === 'fi' ? 'Tallenna peli' : 'Save Game',
    settings:   lang === 'fi' ? 'Asetukset' : 'Settings',
    missionLog: lang === 'fi' ? 'Tehtäväloki' : 'Mission Log',
    quit:       lang === 'fi' ? 'Poistu päävalikkoon' : 'Quit to Menu',
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 flex items-center justify-center pointer-events-auto z-40"
      style={{ fontFamily: 'Nunito, sans-serif' }}
    >
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-black/65 backdrop-blur-sm"
        onClick={handleResume}
      />

      {/* Panel */}
      <AnimatePresence mode="wait">
        {tab === 'settings' ? (
          <SettingsPanel key="settings" onClose={() => setTab('main')} />
        ) : (
          <motion.div
            key="main"
            initial={{ opacity: 0, scale: 0.88, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 16 }}
            transition={{ type: 'spring', stiffness: 280, damping: 24 }}
            className="relative z-10 w-full max-w-sm px-4"
          >
            <div
              className="rounded-3xl border border-white/15 p-6 shadow-2xl"
              style={{
                background: 'rgba(10, 8, 20, 0.92)',
                backdropFilter: 'blur(24px)',
              }}
            >
              {/* Title */}
              <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center mb-6"
              >
                <motion.span
                  animate={{ rotate: [0, -8, 8, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  className="text-4xl mb-2"
                >
                  ❄️
                </motion.span>
                <h2 className="text-2xl font-black text-white tracking-tight">
                  {L.title}
                </h2>
                <p className="text-xs text-white/40 font-semibold mt-0.5 tracking-widest uppercase">
                  Ruka Porro Voxl
                </p>
              </motion.div>

              {/* Buttons */}
              <div className="flex flex-col gap-3">
                <MenuButton icon="▶️" label={L.resume}     onClick={handleResume}              index={0} />
                <MenuButton icon="💾" label={L.save}       onClick={handleSave}                index={1} />
                <MenuButton icon="⚙️" label={L.settings}   onClick={() => setTab('settings')}  index={2} />
                <MenuButton icon="📋" label={L.missionLog} onClick={() => openScreen('mission-log')} index={3} />
                <div className="border-t border-white/10 my-1" />
                <MenuButton icon="🚪" label={L.quit}       onClick={handleQuit}                index={4} variant="danger" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
