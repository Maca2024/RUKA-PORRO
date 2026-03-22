'use client'

/**
 * GameScene — The complete 3D scene inside the R3F Canvas.
 * Dynamically imported by GameProvider to avoid SSR issues with Three.js/WASM.
 */

import { Suspense, useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { World } from '../scene/World/World'
import { Porro } from '../scene/Player/Porro'
import { PorroCamera } from '../scene/Player/PorroCamera'
import { NPCManager } from '../scene/NPCs/NPCManager'
import { GlowingCrystal } from '../scene/Items/GlowingCrystal'
import { GameLoop } from './GameLoop'

/**
 * Wrapper that tries to load Rapier physics.
 * If WASM fails (some browsers/environments), falls back to no-physics mode.
 */
function PhysicsWrapper({ children }: { children: React.ReactNode }) {
  const [PhysicsComponent, setPhysicsComponent] = useState<React.ComponentType<{
    gravity: [number, number, number]
    children: React.ReactNode
  }> | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    import('@react-three/rapier')
      .then((mod) => {
        setPhysicsComponent(() => mod.Physics)
      })
      .catch(() => {
        console.warn('Rapier WASM failed to load — running without physics')
        setFailed(true)
      })
  }, [])

  // While loading or if failed, render children without physics wrapper
  if (!PhysicsComponent || failed) {
    return <>{children}</>
  }

  return (
    <PhysicsComponent gravity={[0, -20, 0]}>
      {children}
    </PhysicsComponent>
  )
}

function SceneFallback() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#8B5E3C" />
    </mesh>
  )
}

export function GameScene() {
  return (
    <Canvas
      shadows
      dpr={[1, 1.5]}
      camera={{ fov: 60, near: 0.1, far: 500, position: [0, 8, 20] }}
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      style={{ width: '100%', height: '100%' }}
      onCreated={({ gl }) => {
        gl.setClearColor('#050b1a')
      }}
    >
      {/* Ambient + directional for immediate visibility */}
      <ambientLight intensity={0.4} color="#b0c4de" />
      <directionalLight
        position={[50, 80, 30]}
        intensity={1.2}
        color="#fff5e6"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <hemisphereLight args={['#87ceeb', '#e8eaf0', 0.5]} />
      <fog attach="fog" args={['#cbd5e1', 80, 300]} />

      <Suspense fallback={<SceneFallback />}>
        <PhysicsWrapper>
          {/* Game systems tick */}
          <GameLoop />

          {/* World: terrain, trees, snow, aurora, food */}
          <World />

          {/* Player reindeer */}
          <Porro />
          <PorroCamera />

          {/* NPCs */}
          <NPCManager />

          {/* Collectible crystals */}
          <GlowingCrystal />
        </PhysicsWrapper>
      </Suspense>
    </Canvas>
  )
}
