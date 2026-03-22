'use client'

import { GameProvider } from '@/game/core/GameProvider'

export default function GamePage() {
  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden">
      <GameProvider />
    </div>
  )
}
