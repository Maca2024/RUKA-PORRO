'use client'

import { useFrame } from '@react-three/fiber'
import { playerSystem } from '../systems/playerSystem'
import { weatherSystem } from '../systems/weatherSystem'
import { corruptionSystem } from '../systems/corruptionSystem'
import { useWorldStore } from '../stores/worldStore'

const DAY_CYCLE_SPEED = 1 / 240 // full day in 240 real seconds
const MAX_DELTA = 0.1

export function GameLoop(): null {
  const setDayProgress = useWorldStore((s) => s.setDayProgress)

  useFrame((_state, rawDelta) => {
    const delta = Math.min(rawDelta, MAX_DELTA)

    // Tick all game systems
    playerSystem.tick(delta)
    weatherSystem.tick(delta)
    corruptionSystem.tick(delta)

    // Advance day/night cycle
    const current = useWorldStore.getState().dayProgress
    const next = (current + delta * DAY_CYCLE_SPEED) % 1.0
    setDayProgress(next)
  })

  return null
}
