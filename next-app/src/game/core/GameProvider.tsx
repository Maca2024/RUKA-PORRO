'use client'

/**
 * GameProvider — top-level shell that composes the R3F Canvas
 * and the DOM UI overlay side by side in the same container.
 */

import { useEffect } from 'react'
import { GameCanvas } from './GameCanvas'
import { GameLoop } from './GameLoop'
import { GameUI } from '../ui/GameUI'
import { useUIStore } from '../stores/useUIStore'

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

  return (
    // Relative container so the overlay sits above the canvas
    <div className="relative w-full h-full" style={{ background: '#050b1a' }}>
      {/* R3F Canvas */}
      <GameCanvas>
        {/* Game systems run inside the Canvas render loop */}
        <GameLoop />
        {/* 3D scene objects go here — terrain, NPCs, player, etc. */}
      </GameCanvas>

      {/* DOM UI overlay — lives outside Canvas, same stacking context */}
      <GameUI />
    </div>
  )
}
