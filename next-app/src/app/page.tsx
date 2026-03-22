'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import Link from 'next/link'

// ── Types ─────────────────────────────────────────────────────────────────────

type Lang = 'fi' | 'en'

// ── Aurora background ─────────────────────────────────────────────────────────

function AuroraBackground() {
  const rays = [
    { hue: 160, left: '5%',  w: 200, delay: 0    },
    { hue: 200, left: '25%', w: 260, delay: 0.8  },
    { hue: 280, left: '45%', w: 180, delay: 1.4  },
    { hue: 320, left: '62%', w: 300, delay: 0.5  },
    { hue: 200, left: '80%', w: 220, delay: 1.8  },
  ]

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {/* Deep space gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(to bottom, #010814 0%, #050b1e 35%, #0a0520 65%, #130325 100%)',
        }}
      />

      {/* Stars */}
      {Array.from({ length: 60 }, (_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            width: 1 + Math.random() * 2.5,
            height: 1 + Math.random() * 2.5,
            top: `${Math.random() * 70}%`,
            left: `${Math.random() * 100}%`,
          }}
          animate={{ opacity: [0.15, 0.9, 0.15] }}
          transition={{
            duration: 2 + Math.random() * 4,
            repeat: Infinity,
            delay: Math.random() * 5,
          }}
        />
      ))}

      {/* Aurora rays */}
      {rays.map((r, i) => (
        <motion.div
          key={i}
          className="absolute bottom-0 rounded-full"
          style={{
            left: r.left,
            width: r.w,
            height: '55%',
            background: `linear-gradient(to top,
              hsla(${r.hue}, 85%, 55%, 0.00) 0%,
              hsla(${r.hue}, 85%, 55%, 0.22) 40%,
              hsla(${r.hue}, 85%, 70%, 0.10) 70%,
              hsla(${r.hue}, 85%, 80%, 0.00) 100%)`,
            filter: 'blur(32px)',
            transformOrigin: 'bottom center',
          }}
          animate={{
            opacity: [0, 0.8, 0.5, 0.9, 0],
            scaleX: [1, 1.2, 0.85, 1.1, 1],
            rotate: [-6 + i * 2, 6 - i * 2, -3 + i, 3, -6 + i * 2],
          }}
          transition={{
            duration: 6 + i * 1.2,
            repeat: Infinity,
            delay: r.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

// ── Reindeer silhouette ───────────────────────────────────────────────────────

function LandingReindeer() {
  return (
    <motion.div
      animate={{
        y: [0, -14, 0],
        filter: [
          'drop-shadow(0 0 12px rgba(167,139,250,0.25))',
          'drop-shadow(0 0 32px rgba(167,139,250,0.60))',
          'drop-shadow(0 0 12px rgba(167,139,250,0.25))',
        ],
      }}
      transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
      aria-hidden
    >
      <svg
        viewBox="0 0 200 130"
        width={240}
        height={156}
        className="text-purple-300/60"
        fill="currentColor"
      >
        {/* Body */}
        <ellipse cx="100" cy="88" rx="46" ry="26" />
        {/* Neck */}
        <rect x="126" y="58" width="16" height="32" rx="8" />
        {/* Head */}
        <ellipse cx="148" cy="50" rx="18" ry="14" />
        {/* Snout */}
        <ellipse cx="166" cy="54" rx="8" ry="7" />
        {/* Eye */}
        <circle cx="157" cy="45" r="2.5" className="text-purple-900" fill="currentColor" />
        {/* Antlers left */}
        <path
          d="M138 38 L130 16 M130 16 L122 6 M130 16 L134 8 M130 16 L122 24"
          stroke="currentColor" strokeWidth="3.5" fill="none" strokeLinecap="round"
        />
        {/* Antlers right */}
        <path
          d="M152 34 L160 12 M160 12 L168 2 M160 12 L168 8 M160 12 L168 20"
          stroke="currentColor" strokeWidth="3.5" fill="none" strokeLinecap="round"
        />
        {/* Legs */}
        <rect x="60"  y="110" width="11" height="20" rx="5.5" />
        <rect x="80"  y="110" width="11" height="20" rx="5.5" />
        <rect x="108" y="110" width="11" height="20" rx="5.5" />
        <rect x="128" y="110" width="11" height="20" rx="5.5" />
        {/* Tail */}
        <ellipse cx="54" cy="84" rx="8" ry="7" />
      </svg>
    </motion.div>
  )
}

// ── Save slot detection (localStorage) ───────────────────────────────────────

function hasSaveData(): boolean {
  if (typeof window === 'undefined') return false
  return Boolean(localStorage.getItem('ruka-porro-save'))
}

// ── CTA Button ────────────────────────────────────────────────────────────────

interface CTAButtonProps {
  href?: string
  onClick?: () => void
  children: React.ReactNode
  variant: 'primary' | 'secondary' | 'ghost'
  icon?: string
  disabled?: boolean
}

function CTAButton({ href, onClick, children, variant, icon, disabled }: CTAButtonProps) {
  const baseClass =
    'flex items-center justify-center gap-3 rounded-2xl font-extrabold text-base transition-all min-h-[56px] px-7 py-3.5 w-full select-none'

  const variantClass = {
    primary:
      'bg-gradient-to-r from-violet-600 to-purple-500 text-white shadow-lg shadow-purple-900/60 hover:from-violet-500 hover:to-purple-400 hover:shadow-purple-700/60 hover:scale-105 active:scale-95',
    secondary:
      'bg-white/10 text-white border border-white/20 backdrop-blur-sm hover:bg-white/18 hover:scale-103 hover:border-white/35 active:scale-95',
    ghost:
      'text-white/50 hover:text-white/80 text-sm underline-offset-4 hover:underline active:scale-95',
  }[variant]

  const disabledClass = disabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : 'cursor-pointer'

  const content = (
    <>
      {icon && <span className="text-xl">{icon}</span>}
      {children}
    </>
  )

  if (href && !disabled) {
    return (
      <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }}>
        <Link href={href} className={`${baseClass} ${variantClass} ${disabledClass}`}>
          {content}
        </Link>
      </motion.div>
    )
  }

  return (
    <motion.button
      whileHover={disabled ? {} : { scale: 1.03 }}
      whileTap={disabled ? {} : { scale: 0.96 }}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClass} ${variantClass} ${disabledClass}`}
    >
      {content}
    </motion.button>
  )
}

// ── Language selector ─────────────────────────────────────────────────────────

interface LangSelectorProps {
  lang: Lang
  onChange: (l: Lang) => void
}

function LangSelector({ lang, onChange }: LangSelectorProps) {
  return (
    <div className="flex gap-2">
      {(['fi', 'en'] as Lang[]).map((l) => (
        <motion.button
          key={l}
          whileTap={{ scale: 0.9 }}
          onClick={() => onChange(l)}
          className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-sm font-bold transition-all min-h-[36px] ${
            lang === l
              ? 'border-purple-400/70 bg-purple-500/25 text-purple-200'
              : 'border-white/15 bg-white/5 text-white/50 hover:text-white/80 hover:bg-white/10'
          }`}
        >
          <span>{l === 'fi' ? '🇫🇮' : '🇬🇧'}</span>
          <span>{l === 'fi' ? 'Suomi' : 'English'}</span>
        </motion.button>
      ))}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const [lang, setLang] = useState<Lang>('fi')
  const [saveExists, setSaveExists] = useState(false)
  const [showCredits, setShowCredits] = useState(false)

  useEffect(() => {
    setSaveExists(hasSaveData())
  }, [])

  const T = {
    subtitle:      lang === 'fi' ? 'Seikkailu Lapin lumessa'  : 'An Adventure in Lapland Snow',
    start:         lang === 'fi' ? 'Aloita seikkailu'         : 'Start Adventure',
    continue:      lang === 'fi' ? 'Jatka peliä'              : 'Continue',
    settings:      lang === 'fi' ? 'Asetukset'                : 'Settings',
    credits:       lang === 'fi' ? 'Tekijät'                  : 'Credits',
    creditsTitle:  lang === 'fi' ? 'Tekijät'                  : 'Credits',
    creditsBody:   lang === 'fi'
      ? 'Tehty rakkaudella Suomen Lapista.\nPeli on omistettu kaikille seikkailullisille lapsille.'
      : 'Made with love from Finnish Lapland.\nDedicated to every adventurous child.',
    close:         lang === 'fi' ? 'Sulje'                    : 'Close',
    ageRating:     lang === 'fi' ? 'Kaikille ikäryhmille'     : 'All ages',
  }

  return (
    <div
      className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden"
      style={{ fontFamily: 'Nunito, sans-serif' }}
    >
      {/* Background */}
      <AuroraBackground />

      {/* Language selector — top-right */}
      <div className="absolute top-5 right-5 z-20">
        <LangSelector lang={lang} onChange={setLang} />
      </div>

      {/* Age rating — top-left */}
      <div className="absolute top-5 left-5 z-20">
        <span className="rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-bold text-white/50">
          {T.ageRating} · 6+
        </span>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center gap-8 px-6 w-full max-w-sm">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.8, ease: 'easeOut' }}
          className="flex flex-col items-center"
        >
          {/* Snowflake accent */}
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="text-3xl mb-3 text-blue-300/70"
            aria-hidden
          >
            ❄️
          </motion.span>

          <h1
            className="text-5xl sm:text-6xl font-black text-center leading-none tracking-tight"
            style={{
              background:
                'linear-gradient(135deg, #c4b5fd 0%, #818cf8 30%, #06b6d4 60%, #f0abfc 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: 'none',
              filter: 'drop-shadow(0 0 24px rgba(167,139,250,0.35))',
            }}
          >
            RUKA
            <br />
            PORRO
          </h1>

          <motion.p
            animate={{
              opacity: [0.5, 1, 0.5],
              letterSpacing: ['0.4em', '0.6em', '0.4em'],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="text-sm font-extrabold text-purple-300/70 tracking-[0.5em] uppercase mt-2"
          >
            V O X L
          </motion.p>

          <p className="mt-3 text-sm font-bold text-blue-200/70 text-center">
            {T.subtitle}
          </p>
        </motion.div>

        {/* Reindeer */}
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, type: 'spring', stiffness: 220, damping: 18 }}
        >
          <LandingReindeer />
        </motion.div>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.7 }}
          className="w-full flex flex-col gap-3"
        >
          {/* Primary — Start / Continue */}
          <motion.div
            animate={{
              boxShadow: [
                '0 0 20px rgba(124,58,237,0.35)',
                '0 0 40px rgba(124,58,237,0.65)',
                '0 0 20px rgba(124,58,237,0.35)',
              ],
            }}
            transition={{ duration: 2.5, repeat: Infinity }}
            className="rounded-2xl"
          >
            <CTAButton href="/game" variant="primary" icon="🦌">
              {T.start}
            </CTAButton>
          </motion.div>

          {/* Continue — only if save exists */}
          <AnimatePresence>
            {saveExists && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <CTAButton href="/game" variant="secondary" icon="💾">
                  {T.continue}
                </CTAButton>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Settings */}
          <CTAButton href="/settings" variant="secondary" icon="⚙️">
            {T.settings}
          </CTAButton>
        </motion.div>

        {/* Credits link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0 }}
        >
          <button
            onClick={() => setShowCredits(true)}
            className="text-xs font-bold text-white/30 hover:text-white/60 transition-colors underline-offset-4 hover:underline"
          >
            {T.credits}
          </button>
        </motion.div>
      </div>

      {/* Falling snowflakes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
        {Array.from({ length: 16 }, (_, i) => (
          <motion.div
            key={i}
            className="absolute text-white/20 text-sm select-none"
            style={{ left: `${5 + i * 6}%`, top: '-5%' }}
            animate={{ y: ['0vh', '110vh'], rotate: [0, 360] }}
            transition={{
              duration: 7 + Math.random() * 6,
              repeat: Infinity,
              delay: Math.random() * 8,
              ease: 'linear',
            }}
          >
            {i % 3 === 0 ? '❄' : i % 3 === 1 ? '❅' : '❆'}
          </motion.div>
        ))}
      </div>

      {/* Credits modal */}
      <AnimatePresence>
        {showCredits && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-6"
            style={{ fontFamily: 'Nunito, sans-serif' }}
          >
            <motion.div
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setShowCredits(false)}
            />
            <motion.div
              initial={{ scale: 0.85, y: 24 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.85, y: 16 }}
              transition={{ type: 'spring', stiffness: 300, damping: 24 }}
              className="relative z-10 max-w-xs w-full rounded-3xl border border-white/15 p-7 shadow-2xl text-center"
              style={{ background: 'rgba(12, 8, 28, 0.95)', backdropFilter: 'blur(20px)' }}
            >
              <span className="text-3xl mb-3 block">🌟</span>
              <h2 className="text-xl font-black text-white mb-3">{T.creditsTitle}</h2>
              <p className="text-sm font-semibold text-white/70 whitespace-pre-line leading-relaxed mb-5">
                {T.creditsBody}
              </p>
              <button
                onClick={() => setShowCredits(false)}
                className="rounded-2xl bg-purple-600/40 border border-purple-400/40 px-6 py-2.5 text-sm font-bold text-purple-200 hover:bg-purple-500/50 transition-colors"
              >
                {T.close}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
