'use client'

import { Suspense, type ReactNode } from 'react'
import { Canvas } from '@react-three/fiber'

interface GameCanvasProps {
  children?: ReactNode
}

function LoadingFallback(): null {
  return null
}

export function GameCanvas({ children }: GameCanvasProps) {
  return (
    <Canvas
      shadows
      dpr={[1, 1.5]}
      camera={{ fov: 60, near: 0.1, far: 500, position: [0, 8, 20] }}
      gl={{ antialias: true, alpha: false }}
      style={{ width: '100%', height: '100%' }}
    >
      <Suspense fallback={<LoadingFallback />}>
        {children}
      </Suspense>
    </Canvas>
  )
}
