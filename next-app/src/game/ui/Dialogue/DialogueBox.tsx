'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useRef, useState, useCallback } from 'react'
import { useUIStore, selectActiveDialogue, selectLanguage } from '../../stores/useUIStore'
import { useNPCStore, NPC_DEFINITIONS } from '../../stores/useNPCStore'
import type { DialogueChoice } from '../../types/game'

const PERSONALITY_COLORS: Record<string, string> = {
  wise:        '#a78bfa',
  gentle:      '#6ee7b7',
  loyal:       '#60a5fa',
  brave:       '#fbbf24',
  mischievous: '#f472b6',
  sanctuary:   '#fcd34d',
  cunning:     '#94a3b8',
  threatening: '#f87171',
  ancient:     '#c084fc',
}

const NPC_EMOJI: Record<string, string> = {
  sieni:      '🍄',
  sammal:     '🌿',
  yuki:       '🐕',
  taisto:     '🐶',
  karen:      '🐦‍⬛',
  koulu:      '🏫',
  susi:       '🐺',
  metsastaja: '🏹',
  karhu:      '🐻',
}

const TYPEWRITER_SPEED = 40 // ms per character

export function DialogueBox() {
  const dialogue = useUIStore(selectActiveDialogue)
  const lang = useUIStore(selectLanguage)
  const advanceDialogue = useUIStore((s) => s.advanceDialogue)
  const closeDialogue = useUIStore((s) => s.closeDialogue)
  const npcStore = useNPCStore()

  const [displayedText, setDisplayedText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [choicesVisible, setChoicesVisible] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const node = dialogue?.currentNode
  const npcId = dialogue?.npcId
  const npcDef = npcId ? NPC_DEFINITIONS[npcId] : null

  const fullText = node ? (lang === 'fi' ? node.textFi : node.text) : ''
  const npcColor = npcDef ? (PERSONALITY_COLORS[npcDef.personality] ?? '#a78bfa') : '#a78bfa'

  // Typewriter effect
  useEffect(() => {
    if (!fullText) return

    setDisplayedText('')
    setIsTyping(true)
    setChoicesVisible(false)

    let i = 0
    intervalRef.current = setInterval(() => {
      i++
      setDisplayedText(fullText.slice(0, i))
      if (i >= fullText.length) {
        clearInterval(intervalRef.current!)
        setIsTyping(false)
        setChoicesVisible(true)
      }
    }, TYPEWRITER_SPEED)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [fullText])

  // Skip typewriter on Space / click when typing
  const skipOrAdvance = useCallback(() => {
    if (isTyping) {
      // Skip to full text
      if (intervalRef.current) clearInterval(intervalRef.current)
      setDisplayedText(fullText)
      setIsTyping(false)
      setChoicesVisible(true)
      return
    }
    // Auto-advance (no choices)
    if (node && node.choices.length === 0) {
      if (node.autoNext) {
        // Caller must resolve node — for now just close
        closeDialogue()
      } else {
        closeDialogue()
      }
    }
  }, [isTyping, fullText, node, closeDialogue])

  const handleChoice = (choice: DialogueChoice) => {
    if (choice.next === null) {
      closeDialogue()
    } else {
      // In a real implementation advanceDialogue would look up the node from the tree.
      // We signal via closeDialogue for now if the store doesn't hold the full tree.
      closeDialogue()
    }
  }

  // Keyboard handler
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault()
        skipOrAdvance()
      }
      if (e.code === 'Escape') {
        closeDialogue()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [skipOrAdvance, closeDialogue])

  if (!dialogue || !node || !npcDef) return null

  const npcName = lang === 'fi' ? npcDef.nameFi : npcDef.name
  const hasChoices = node.choices.length > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 30, scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 320, damping: 28 }}
      className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 pointer-events-auto z-50"
      style={{ fontFamily: 'Nunito, sans-serif' }}
    >
      <div
        className="rounded-3xl border border-white/15 shadow-2xl overflow-hidden"
        style={{
          background: 'rgba(10, 10, 20, 0.82)',
          backdropFilter: 'blur(18px)',
        }}
      >
        {/* Speaker bar */}
        <div
          className="flex items-center gap-3 px-5 py-3 border-b border-white/10"
          style={{ background: `${npcColor}18` }}
        >
          {/* NPC emoji portrait */}
          <motion.div
            animate={{ rotate: [0, -5, 5, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="flex h-11 w-11 items-center justify-center rounded-2xl text-2xl shadow-lg flex-shrink-0"
            style={{ background: `${npcColor}30`, border: `2px solid ${npcColor}60` }}
          >
            {NPC_EMOJI[npcDef.id] ?? '🌟'}
          </motion.div>

          {/* Name + emotion */}
          <div>
            <p className="text-sm font-extrabold" style={{ color: npcColor }}>
              {npcName}
            </p>
            <p className="text-xs text-white/50 capitalize">{node.emotion}</p>
          </div>

          {/* Close button */}
          <button
            onClick={closeDialogue}
            className="ml-auto flex h-8 w-8 items-center justify-center rounded-xl text-white/40 hover:text-white/80 hover:bg-white/10 transition-colors"
            aria-label="Close dialogue"
          >
            ✕
          </button>
        </div>

        {/* Text body */}
        <div
          className="min-h-[80px] px-5 py-4 cursor-pointer"
          onClick={skipOrAdvance}
        >
          <p className="text-base font-semibold text-white leading-relaxed">
            {displayedText}
            {isTyping && (
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="inline-block ml-0.5 w-0.5 h-4 align-middle bg-white"
              />
            )}
          </p>
        </div>

        {/* Choices or continue prompt */}
        <div className="px-5 pb-5">
          <AnimatePresence>
            {choicesVisible && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                {hasChoices ? (
                  <div className="flex flex-col gap-2">
                    {node.choices.map((choice, i) => {
                      const choiceText = lang === 'fi' ? choice.textFi : choice.text
                      return (
                        <motion.button
                          key={choice.id}
                          initial={{ opacity: 0, x: -12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.07 }}
                          onClick={() => handleChoice(choice)}
                          className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-left text-sm font-bold text-white transition-all hover:bg-white/15 hover:border-white/30 active:scale-95 min-h-[48px]"
                          style={{ whiteSpace: 'normal' }}
                        >
                          <span className="text-base flex-shrink-0">
                            {choice.icon ?? '💬'}
                          </span>
                          <span>{choiceText}</span>
                          {choice.trustDelta > 0 && (
                            <span className="ml-auto text-xs text-pink-400 font-extrabold flex-shrink-0">
                              +{choice.trustDelta} 💗
                            </span>
                          )}
                        </motion.button>
                      )
                    })}
                  </div>
                ) : (
                  <motion.p
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="text-center text-xs font-bold text-white/50"
                  >
                    {lang === 'fi'
                      ? 'Paina VÄLILYÖNTIÄ jatkaaksesi…'
                      : 'Press SPACE to continue…'}
                  </motion.p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}
