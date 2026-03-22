'use client'

import { useRef, useMemo, useState, useCallback } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { usePlayerStore } from '@/game/stores/usePlayerStore'
import { distanceXZ } from '@/lib/math'
import { LICHEN_COUNT } from '@/game/core/constants'

const COLLECT_RADIUS = 5
const RESPAWN_SECONDS = 60

interface PatchData {
  position: [number, number, number]
  rotation: number
  scale: number
}

function isOnLake(x: number, z: number): boolean {
  const dx = x - 50
  const dz = z - 50
  return dx * dx + dz * dz <= 1600
}

function generatePatches(count: number): PatchData[] {
  const patches: PatchData[] = []
  let seed = 137

  const nextRand = () => {
    seed = (seed * 6364136223846793005 + 1442695040888963407) & 0xffffffff
    return ((seed >>> 0) / 0xffffffff)
  }

  let attempts = 0
  while (patches.length < count && attempts < count * 8) {
    attempts++
    const x = (nextRand() - 0.5) * 340
    const z = (nextRand() - 0.5) * 340
    if (isOnLake(x, z)) continue

    patches.push({
      position: [x, 0.05, z],
      rotation: nextRand() * Math.PI * 2,
      scale: 0.6 + nextRand() * 0.8,
    })
  }
  return patches
}

export function FoodPatches() {
  const patches = useMemo(() => generatePatches(LICHEN_COUNT), [])

  // Track collected state and respawn timers
  const [collected, setCollected] = useState<boolean[]>(() => new Array(LICHEN_COUNT).fill(false))
  const respawnTimers = useRef<number[]>(new Array(LICHEN_COUNT).fill(0))

  const addItem = usePlayerStore((s) => s.addItem)

  const glowIntensities = useRef<number[]>(new Array(LICHEN_COUNT).fill(0))
  const meshRefs = useRef<(THREE.Mesh | null)[]>(new Array(LICHEN_COUNT).fill(null))

  // Geometries and materials
  const discGeo = useMemo(() => new THREE.CylinderGeometry(0.5, 0.6, 0.12, 10), [])
  const innerGeo = useMemo(() => new THREE.CylinderGeometry(0.25, 0.3, 0.08, 8), [])

  const lichMat = useMemo(
    () =>
      new THREE.MeshLambertMaterial({
        color: new THREE.Color('#a8d5ba'),
        emissive: new THREE.Color('#006633'),
        emissiveIntensity: 0,
      }),
    [],
  )
  const innerMat = useMemo(
    () =>
      new THREE.MeshLambertMaterial({
        color: new THREE.Color('#c8e6c9'),
        emissive: new THREE.Color('#00aa44'),
        emissiveIntensity: 0,
      }),
    [],
  )

  const collectPatch = useCallback(
    (index: number) => {
      setCollected((prev) => {
        const next = [...prev]
        next[index] = true
        return next
      })
      respawnTimers.current[index] = RESPAWN_SECONDS

      addItem({
        id: `lichen_patch_${Date.now()}`,
        type: 'food',
        name: 'Reindeer Lichen',
        nameFi: 'Poronjäkälä',
        quantity: 1,
        icon: 'lichen',
      })
    },
    [addItem],
  )

  useFrame((_, delta) => {
    const playerPos = usePlayerStore.getState().position

    for (let i = 0; i < patches.length; i++) {
      // Respawn countdown
      if (collected[i]) {
        respawnTimers.current[i] -= delta
        if (respawnTimers.current[i] <= 0) {
          setCollected((prev) => {
            const next = [...prev]
            next[i] = false
            return next
          })
        }
        continue
      }

      const patch = patches[i]
      const dist = distanceXZ(playerPos, { x: patch.position[0], y: patch.position[1], z: patch.position[2] })

      // Glow when player is close
      const targetGlow = dist < COLLECT_RADIUS ? 0.8 : 0
      glowIntensities.current[i] +=
        (targetGlow - glowIntensities.current[i]) * Math.min(1, delta * 4)

      const mesh = meshRefs.current[i]
      if (mesh) {
        const mat = mesh.material as THREE.MeshLambertMaterial
        mat.emissiveIntensity = glowIntensities.current[i]
      }

      // Auto-collect when very close (walk-over)
      if (dist < 2.0) {
        collectPatch(i)
      }
    }
  })

  return (
    <group>
      {patches.map((patch, i) => {
        if (collected[i]) return null
        const [x, y, z] = patch.position

        return (
          <group
            key={i}
            position={[x, y, z]}
            rotation={[0, patch.rotation, 0]}
            scale={patch.scale}
          >
            {/* Main disc */}
            <mesh
              ref={(el) => {
                meshRefs.current[i] = el
              }}
              geometry={discGeo}
              material={lichMat.clone()}
              receiveShadow
            />
            {/* Inner highlight */}
            <mesh
              geometry={innerGeo}
              material={innerMat.clone()}
              position={[0, 0.04, 0]}
            />
            {/* Small bumps for texture */}
            {[0, 1, 2, 3, 4].map((j) => (
              <mesh
                key={j}
                material={lichMat}
                position={[
                  Math.cos((j * Math.PI * 2) / 5) * 0.3,
                  0.1,
                  Math.sin((j * Math.PI * 2) / 5) * 0.3,
                ]}
              >
                <sphereGeometry args={[0.08, 5, 4]} />
              </mesh>
            ))}
          </group>
        )
      })}
    </group>
  )
}
