'use client'

import { useRef, useMemo, useState, useEffect } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { usePlayerStore } from '@/game/stores/usePlayerStore'
import { useMissionStore } from '@/game/stores/useMissionStore'
import { distanceXZ } from '@/lib/math'

const COLLECT_RADIUS = 3.0

// 7 crystal positions spread across the world
const CRYSTAL_POSITIONS: [number, number, number][] = [
  [25, 1.0, -35],
  [-45, 1.0, 30],
  [70, 1.0, 55],
  [-20, 1.0, -65],
  [55, 1.0, -70],
  [-75, 1.0, -30],
  [10, 1.0, 80],
]

interface CrystalProps {
  position: [number, number, number]
  index: number
  onCollect: (index: number) => void
}

function Crystal({ position, index, onCollect }: CrystalProps) {
  const groupRef = useRef<THREE.Group>(null)
  const glowRef = useRef(0)
  const [collected, setCollected] = useState(false)
  const hasCollectedRef = useRef(false)
  const phase = useMemo(() => Math.random() * Math.PI * 2, [])

  const crystalMat = useMemo(
    () =>
      new THREE.MeshLambertMaterial({
        color: new THREE.Color('#c084fc'),
        emissive: new THREE.Color('#7c3aed'),
        emissiveIntensity: 0.5,
        transparent: true,
        opacity: 0.9,
      }),
    [],
  )

  const innerMat = useMemo(
    () =>
      new THREE.MeshLambertMaterial({
        color: new THREE.Color('#ffffff'),
        emissive: new THREE.Color('#e0d0ff'),
        emissiveIntensity: 1.2,
        transparent: true,
        opacity: 0.6,
      }),
    [],
  )

  const glowSphereMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: new THREE.Color('#9333ea'),
        transparent: true,
        opacity: 0.12,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    [],
  )

  // E-key collection listener
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code !== 'KeyE') return
      if (hasCollectedRef.current) return

      const playerPos = usePlayerStore.getState().position
      const dist = distanceXZ(playerPos, { x: position[0], y: position[1], z: position[2] })
      if (dist <= COLLECT_RADIUS) {
        hasCollectedRef.current = true
        setCollected(true)
        onCollect(index)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [position, index, onCollect])

  useFrame(({ clock }) => {
    if (!groupRef.current || collected) return
    const t = clock.getElapsedTime() + phase

    // Float up and down
    groupRef.current.position.y = position[1] + Math.sin(t * 1.5) * 0.25

    // Slow spin
    groupRef.current.rotation.y = t * 0.6

    // Glow pulse when player is near
    const playerPos = usePlayerStore.getState().position
    const dist = distanceXZ(playerPos, { x: position[0], y: position[1], z: position[2] })
    const targetGlow = dist < COLLECT_RADIUS * 2 ? 1.2 + Math.sin(t * 3) * 0.3 : 0.5

    glowRef.current += (targetGlow - glowRef.current) * 0.05
    crystalMat.emissiveIntensity = glowRef.current * 0.6
    innerMat.emissiveIntensity = glowRef.current * 1.4
    glowSphereMat.opacity = 0.06 + (dist < COLLECT_RADIUS * 2 ? 0.1 * (Math.sin(t * 2) * 0.5 + 0.5) : 0)
  })

  if (collected) return null

  return (
    <group ref={groupRef} position={position}>
      {/* Outer glow sphere */}
      <mesh material={glowSphereMat}>
        <sphereGeometry args={[1.1, 10, 8]} />
      </mesh>

      {/* Main octahedron crystal */}
      <mesh material={crystalMat} castShadow>
        <octahedronGeometry args={[0.55, 0]} />
      </mesh>

      {/* Inner bright core */}
      <mesh material={innerMat}>
        <octahedronGeometry args={[0.28, 0]} />
      </mesh>

      {/* Facet accents — small diamond plates */}
      {[0, 1, 2, 3].map((i) => (
        <mesh
          key={i}
          material={crystalMat}
          position={[
            Math.cos((i * Math.PI) / 2) * 0.38,
            Math.sin(i * 0.9) * 0.2,
            Math.sin((i * Math.PI) / 2) * 0.38,
          ]}
          rotation={[
            Math.cos(i * 1.2) * 0.6,
            (i * Math.PI) / 2,
            Math.sin(i * 0.8) * 0.4,
          ]}
        >
          <octahedronGeometry args={[0.16, 0]} />
        </mesh>
      ))}

      {/* Vertical light beam */}
      <mesh
        material={
          new THREE.MeshBasicMaterial({
            color: new THREE.Color('#c084fc'),
            transparent: true,
            opacity: 0.08,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            side: THREE.DoubleSide,
          })
        }
        position={[0, 3, 0]}
      >
        <cylinderGeometry args={[0.08, 0.35, 6, 6, 1, true]} />
      </mesh>

      {/* Ground ring */}
      <mesh
        material={
          new THREE.MeshBasicMaterial({
            color: new THREE.Color('#9333ea'),
            transparent: true,
            opacity: 0.15,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
          })
        }
        position={[0, -0.9, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <ringGeometry args={[0.5, 1.5, 24]} />
      </mesh>
    </group>
  )
}

// ─── Manager component that renders all 7 crystals ───────────────────────────

export function GlowingCrystal() {
  const handleCollect = (index: number) => {
    // Reduce corruption when a crystal is collected
    try {
      const missionState = useMissionStore.getState()
      if ('reduceCorruption' in missionState && typeof (missionState as Record<string, unknown>).reduceCorruption === 'function') {
        (missionState as Record<string, unknown> & { reduceCorruption: (v: number) => void }).reduceCorruption(15)
      }
    } catch {
      // Store may not expose this action yet — add item instead
    }

    usePlayerStore.getState().addItem({
      id: `purification_crystal_${index}_${Date.now()}`,
      type: 'crystal',
      name: 'Purification Crystal',
      nameFi: 'Puhdistuskide',
      quantity: 1,
      icon: 'crystal',
    })
  }

  return (
    <group>
      {CRYSTAL_POSITIONS.map((pos, i) => (
        <Crystal key={i} position={pos} index={i} onCollect={handleCollect} />
      ))}
    </group>
  )
}
