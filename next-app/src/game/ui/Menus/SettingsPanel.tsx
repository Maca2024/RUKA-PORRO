'use client'

import { motion } from 'framer-motion'
import { useUIStore, selectSettings, selectLanguage } from '../../stores/useUIStore'

interface SliderProps {
  label: string
  icon: string
  value: number
  onChange: (v: number) => void
}

function VolumeSlider({ label, icon, value, onChange }: SliderProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className="text-xl">{icon}</span>
        <label className="text-sm font-bold text-white/90">{label}</label>
        <span className="ml-auto text-sm font-extrabold text-purple-300">
          {Math.round(value * 100)}%
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={1}
        step={0.05}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-3 rounded-full cursor-pointer accent-purple-400"
        style={{ minHeight: 48 }}
        aria-label={label}
      />
    </div>
  )
}

type Quality = 'low' | 'medium' | 'high'

interface SettingsPanelProps {
  onClose: () => void
}

export function SettingsPanel({ onClose }: SettingsPanelProps) {
  const settings = useUIStore(selectSettings)
  const lang = useUIStore(selectLanguage)
  const setMusicVolume = useUIStore((s) => s.setMusicVolume)
  const setSFXVolume = useUIStore((s) => s.setSFXVolume)
  const setLanguage = useUIStore((s) => s.setLanguage)
  const setGraphicsQuality = useUIStore((s) => s.setGraphicsQuality)
  const toggleTutorialHints = useUIStore((s) => s.toggleTutorialHints)

  const qualityOptions: { value: Quality; label: string; icon: string }[] = [
    { value: 'low',    label: lang === 'fi' ? 'Matala'  : 'Low',    icon: '🔋' },
    { value: 'medium', label: lang === 'fi' ? 'Keski'   : 'Medium', icon: '⚡' },
    { value: 'high',   label: lang === 'fi' ? 'Korkea'  : 'High',   icon: '✨' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92, y: 16 }}
      transition={{ type: 'spring', stiffness: 300, damping: 26 }}
      className="relative w-full max-w-md rounded-3xl p-6 shadow-2xl border border-white/15"
      style={{
        background: 'rgba(14, 10, 28, 0.94)',
        backdropFilter: 'blur(20px)',
        fontFamily: 'Nunito, sans-serif',
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl">⚙️</span>
        <h2 className="text-xl font-extrabold text-white">
          {lang === 'fi' ? 'Asetukset' : 'Settings'}
        </h2>
        <button
          onClick={onClose}
          className="ml-auto flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all active:scale-90"
          aria-label="Close settings"
        >
          ✕
        </button>
      </div>

      <div className="flex flex-col gap-5">
        {/* Music volume */}
        <VolumeSlider
          label={lang === 'fi' ? 'Musiikki' : 'Music Volume'}
          icon="🎵"
          value={settings.musicVolume}
          onChange={setMusicVolume}
        />

        {/* SFX volume */}
        <VolumeSlider
          label={lang === 'fi' ? 'Ääniefektit' : 'Sound Effects'}
          icon="🔊"
          value={settings.sfxVolume}
          onChange={setSFXVolume}
        />

        {/* Divider */}
        <div className="border-t border-white/10" />

        {/* Language */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">🌍</span>
            <span className="text-sm font-bold text-white/90">
              {lang === 'fi' ? 'Kieli' : 'Language'}
            </span>
          </div>
          <div className="flex gap-2">
            {(['fi', 'en'] as const).map((l) => (
              <motion.button
                key={l}
                onClick={() => setLanguage(l)}
                whileTap={{ scale: 0.93 }}
                className={`flex-1 rounded-2xl border py-3 text-sm font-extrabold transition-all min-h-[48px] ${
                  settings.language === l
                    ? 'border-purple-400 bg-purple-500/30 text-purple-200'
                    : 'border-white/15 bg-white/5 text-white/60 hover:bg-white/10'
                }`}
              >
                {l === 'fi' ? '🇫🇮 Suomi' : '🇬🇧 English'}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Graphics quality */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">🖥️</span>
            <span className="text-sm font-bold text-white/90">
              {lang === 'fi' ? 'Grafiikka' : 'Graphics Quality'}
            </span>
          </div>
          <div className="flex gap-2">
            {qualityOptions.map((opt) => (
              <motion.button
                key={opt.value}
                onClick={() => setGraphicsQuality(opt.value)}
                whileTap={{ scale: 0.93 }}
                className={`flex-1 flex flex-col items-center gap-1 rounded-2xl border py-3 text-xs font-extrabold transition-all min-h-[48px] ${
                  settings.graphicsQuality === opt.value
                    ? 'border-cyan-400 bg-cyan-500/20 text-cyan-200'
                    : 'border-white/15 bg-white/5 text-white/60 hover:bg-white/10'
                }`}
              >
                <span className="text-base">{opt.icon}</span>
                {opt.label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Tutorial hints toggle */}
        <div className="flex items-center gap-3">
          <span className="text-xl">💡</span>
          <span className="flex-1 text-sm font-bold text-white/90">
            {lang === 'fi' ? 'Opastusvihje' : 'Tutorial Hints'}
          </span>
          <motion.button
            onClick={toggleTutorialHints}
            whileTap={{ scale: 0.88 }}
            className={`relative h-8 w-14 rounded-full border transition-colors min-h-[48px] flex items-center ${
              settings.showTutorialHints
                ? 'bg-green-500 border-green-400'
                : 'bg-white/10 border-white/20'
            }`}
            aria-pressed={settings.showTutorialHints}
            aria-label="Toggle tutorial hints"
          >
            <motion.div
              animate={{ x: settings.showTutorialHints ? 26 : 4 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="absolute h-6 w-6 rounded-full bg-white shadow-md"
            />
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}
