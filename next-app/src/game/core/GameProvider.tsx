'use client'

/**
 * GameProvider — top-level shell that composes the R3F Canvas
 * and the DOM UI overlay side by side in the same container.
 */

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { GameUI } from '../ui/GameUI'
import { useUIStore } from '../stores/useUIStore'

// Dynamic import for the entire 3D scene to avoid SSR issues with Three.js / WASM
const GameScene = dynamic(() => import('./GameScene').then((m) => m.GameScene), {
  ssr: false,
})

// Simulated asset loading — replace with real asset loader integration
function useSimulatedLoading() {
  const setLoadingProgress = useUIStore((s) => s.setLoadingProgress)
  const setLoading = useUIStore((s) => s.setLoading)

  useEffect(() => {
    const steps = [
      { pct: 10,  msg: 'Initializing world…'    },
      { pct: 30,  msg: 'Loading terrain…'        },
      { pct: 55,  msg: 'Summoning spirits…'      },
      { pct: 75,  msg: 'Placing snow…'           },
      { pct: 90,  msg: 'Waking the forest…'      },
      { pct: 100, msg: 'Ready!'                  },
    ]

    let i = 0
    const advance = () => {
      if (i >= steps.length) {
        setTimeout(() => setLoading(false), 400)
        return
      }
      const { pct, msg } = steps[i++]
      setLoadingProgress(pct, msg)
      setTimeout(advance, 500)
    }
    advance()
  }, [setLoadingProgress, setLoading])
}

export function GameProvider() {
  useSimulatedLoading()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    // Relative container so the overlay sits above the canvas
    <div className="relative w-full h-full" style={{ background: '#050b1a' }}>
      {/* 3D scene — dynamically imported, only renders client-side */}
      {mounted && <GameScene />}

      {/* DOM UI overlay — lives outside Canvas, same stacking context */}
      <GameUI />
    </div>
  )
}
