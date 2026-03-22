'use client'

import { useRef, useMemo } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { Billboard, Text } from '@react-three/drei'
import { RigidBody } from '@react-three/rapier'
import { usePlayerStore } from '@/game/stores/usePlayerStore'
import { distanceXZ } from '@/lib/math'
import type { NPCId } from '@/game/types/game'

interface NPCProps {
  id: NPCId
  position: [number, number, number]
  color: string
  modelType: string
  trust: number
  name: string
}

function trustEmoji(trust: number): string {
  if (trust >= 30) return '😊'
  if (trust >= -10) return '😐'
  return '😠'
}

// Different procedural shapes based on modelType
function NPCBody({
  modelType,
  color,
  glowIntensity,
}: {
  modelType: string
  color: string
  glowIntensity: number
}) {
  const baseColor = new THREE.Color(color)
  const glowColor = baseColor.clone().lerp(new THREE.Color('#ffffff'), glowIntensity * 0.5)

  const mat = useMemo(
    () => new THREE.MeshLambertMaterial({ color: glowColor }),
    [glowColor.getHex()],
  )
  const featureMat = useMemo(
    () => new THREE.MeshLambertMaterial({ color: glowColor.clone().multiplyScalar(1.3) }),
    [glowColor.getHex()],
  )
  const eyeMat = useMemo(
    () => new THREE.MeshLambertMaterial({ color: new THREE.Color('#f0f0f0') }),
    [],
  )
  const darkMat = useMemo(
    () => new THREE.MeshLambertMaterial({ color: new THREE.Color('#111111') }),
    [],
  )

  switch (modelType) {
    case 'mushroom_entity':
      return (
        <group>
          {/* Stem */}
          <mesh material={featureMat} castShadow position={[0, 0.5, 0]}>
            <cylinderGeometry args={[0.25, 0.3, 1.0, 8]} />
          </mesh>
          {/* Cap */}
          <mesh material={mat} castShadow position={[0, 1.15, 0]}>
            <sphereGeometry args={[0.65, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
          </mesh>
          {/* Spots */}
          {[0, 1, 2].map((i) => (
            <mesh
              key={i}
              material={eyeMat}
              position={[
                Math.cos((i * Math.PI * 2) / 3) * 0.42,
                1.28,
                Math.sin((i * Math.PI * 2) / 3) * 0.42,
              ]}
            >
              <sphereGeometry args={[0.1, 5, 5]} />
            </mesh>
          ))}
          {/* Eyes */}
          <mesh material={darkMat} position={[0.15, 0.7, 0.24]}>
            <sphereGeometry args={[0.06, 5, 5]} />
          </mesh>
          <mesh material={darkMat} position={[-0.15, 0.7, 0.24]}>
            <sphereGeometry args={[0.06, 5, 5]} />
          </mesh>
        </group>
      )

    case 'moss_entity':
      return (
        <group>
          {/* Lumpy body */}
          <mesh material={mat} castShadow position={[0, 0.6, 0]}>
            <sphereGeometry args={[0.55, 10, 8]} />
          </mesh>
          {/* Extra lumps */}
          {[0, 1, 2, 3, 4].map((i) => (
            <mesh
              key={i}
              material={featureMat}
              castShadow
              position={[
                Math.cos((i * Math.PI * 2) / 5) * 0.4,
                0.55 + Math.sin(i) * 0.15,
                Math.sin((i * Math.PI * 2) / 5) * 0.4,
              ]}
            >
              <sphereGeometry args={[0.18 + (i % 2) * 0.07, 6, 6]} />
            </mesh>
          ))}
          {/* Eyes */}
          <mesh material={eyeMat} position={[0.16, 0.75, 0.5]}>
            <sphereGeometry args={[0.065, 5, 5]} />
          </mesh>
          <mesh material={eyeMat} position={[-0.16, 0.75, 0.5]}>
            <sphereGeometry args={[0.065, 5, 5]} />
          </mesh>
        </group>
      )

    case 'dog_akita':
    case 'dog_amstaff': {
      const isBig = modelType === 'dog_amstaff'
      const s = isBig ? 1.15 : 1.0
      return (
        <group>
          {/* Body */}
          <mesh material={mat} castShadow position={[0, 0.6 * s, 0]}>
            <sphereGeometry args={[0.5 * s, 10, 8]} />
          </mesh>
          <mesh material={mat} castShadow position={[0, 0.6 * s, 0]}>
            <cylinderGeometry args={[0.38 * s, 0.42 * s, 0.7 * s, 8]} />
          </mesh>
          {/* Head */}
          <mesh material={mat} castShadow position={[0, 1.1 * s, 0.4 * s]}>
            <sphereGeometry args={[0.32 * s, 9, 8]} />
          </mesh>
          {/* Snout */}
          <mesh material={featureMat} castShadow position={[0, 1.02 * s, 0.68 * s]}>
            <sphereGeometry args={[0.18 * s, 7, 6]} />
          </mesh>
          {/* Ears */}
          <mesh material={mat} castShadow position={[0.22 * s, 1.28 * s, 0.3 * s]} rotation={[0.3, 0, 0.4]}>
            <coneGeometry args={[0.12 * s, 0.3 * s, 5]} />
          </mesh>
          <mesh material={mat} castShadow position={[-0.22 * s, 1.28 * s, 0.3 * s]} rotation={[0.3, 0, -0.4]}>
            <coneGeometry args={[0.12 * s, 0.3 * s, 5]} />
          </mesh>
          {/* Eyes */}
          <mesh material={darkMat} position={[0.14 * s, 1.14 * s, 0.68 * s]}>
            <sphereGeometry args={[0.055 * s, 5, 5]} />
          </mesh>
          <mesh material={darkMat} position={[-0.14 * s, 1.14 * s, 0.68 * s]}>
            <sphereGeometry args={[0.055 * s, 5, 5]} />
          </mesh>
          {/* Legs */}
          {[
            [0.3, 0, 0.28],
            [-0.3, 0, 0.28],
            [0.28, 0, -0.28],
            [-0.28, 0, -0.28],
          ].map(([lx, , lz], i) => (
            <mesh key={i} material={mat} castShadow position={[lx * s, 0.25 * s, lz * s]}>
              <cylinderGeometry args={[0.1 * s, 0.08 * s, 0.55 * s, 6]} />
            </mesh>
          ))}
          {/* Tail */}
          <mesh material={featureMat} castShadow position={[0, 0.85 * s, -0.58 * s]} rotation={[-0.8, 0, 0]}>
            <cylinderGeometry args={[0.06 * s, 0.04 * s, 0.4 * s, 5]} />
          </mesh>
        </group>
      )
    }

    case 'crow':
      return (
        <group>
          {/* Body */}
          <mesh material={mat} castShadow position={[0, 0.5, 0]}>
            <sphereGeometry args={[0.3, 8, 7]} />
          </mesh>
          {/* Wings */}
          <mesh material={featureMat} castShadow position={[0.4, 0.5, 0]} rotation={[0.2, 0, 0.3]}>
            <boxGeometry args={[0.6, 0.06, 0.35]} />
          </mesh>
          <mesh material={featureMat} castShadow position={[-0.4, 0.5, 0]} rotation={[0.2, 0, -0.3]}>
            <boxGeometry args={[0.6, 0.06, 0.35]} />
          </mesh>
          {/* Head */}
          <mesh material={mat} castShadow position={[0, 0.82, 0.15]}>
            <sphereGeometry args={[0.2, 7, 6]} />
          </mesh>
          {/* Beak */}
          <mesh material={featureMat} castShadow position={[0, 0.79, 0.34]} rotation={[0.3, 0, 0]}>
            <coneGeometry args={[0.05, 0.22, 4]} />
          </mesh>
          {/* Eye */}
          <mesh material={eyeMat} position={[0.1, 0.86, 0.31]}>
            <sphereGeometry args={[0.04, 5, 5]} />
          </mesh>
          <mesh material={eyeMat} position={[-0.1, 0.86, 0.31]}>
            <sphereGeometry args={[0.04, 5, 5]} />
          </mesh>
          {/* Legs */}
          <mesh material={featureMat} position={[0.1, 0.18, 0]} rotation={[0, 0, 0]}>
            <cylinderGeometry args={[0.025, 0.02, 0.38, 4]} />
          </mesh>
          <mesh material={featureMat} position={[-0.1, 0.18, 0]}>
            <cylinderGeometry args={[0.025, 0.02, 0.38, 4]} />
          </mesh>
        </group>
      )

    case 'wolf':
      return (
        <group>
          {/* Body */}
          <mesh material={mat} castShadow position={[0, 0.65, 0]}>
            <sphereGeometry args={[0.55, 10, 8]} />
          </mesh>
          <mesh material={mat} castShadow position={[0, 0.65, 0]}>
            <cylinderGeometry args={[0.42, 0.48, 0.85, 8]} />
          </mesh>
          {/* Head */}
          <mesh material={mat} castShadow position={[0, 1.2, 0.45]}>
            <sphereGeometry args={[0.38, 9, 8]} />
          </mesh>
          {/* Snout */}
          <mesh material={featureMat} castShadow position={[0, 1.1, 0.78]}>
            <sphereGeometry args={[0.22, 7, 6]} />
          </mesh>
          {/* Ears */}
          <mesh material={mat} castShadow position={[0.2, 1.5, 0.3]} rotation={[0.1, 0, 0.3]}>
            <coneGeometry args={[0.1, 0.28, 5]} />
          </mesh>
          <mesh material={mat} castShadow position={[-0.2, 1.5, 0.3]} rotation={[0.1, 0, -0.3]}>
            <coneGeometry args={[0.1, 0.28, 5]} />
          </mesh>
          {/* Eyes — slightly glowing for corrupted wolf */}
          <mesh material={new THREE.MeshLambertMaterial({ color: new THREE.Color('#ff2244'), emissive: new THREE.Color('#ff0000'), emissiveIntensity: 0.5 })} position={[0.16, 1.24, 0.78]}>
            <sphereGeometry args={[0.06, 5, 5]} />
          </mesh>
          <mesh material={new THREE.MeshLambertMaterial({ color: new THREE.Color('#ff2244'), emissive: new THREE.Color('#ff0000'), emissiveIntensity: 0.5 })} position={[-0.16, 1.24, 0.78]}>
            <sphereGeometry args={[0.06, 5, 5]} />
          </mesh>
          {/* Legs */}
          {[[0.3, 0, 0.3], [-0.3, 0, 0.3], [0.28, 0, -0.3], [-0.28, 0, -0.3]].map(([lx, , lz], i) => (
            <mesh key={i} material={mat} castShadow position={[lx, 0.28, lz]}>
              <cylinderGeometry args={[0.11, 0.09, 0.6, 6]} />
            </mesh>
          ))}
          {/* Tail */}
          <mesh material={featureMat} castShadow position={[0, 0.95, -0.68]} rotation={[-0.6, 0, 0]}>
            <cylinderGeometry args={[0.08, 0.05, 0.55, 5]} />
          </mesh>
        </group>
      )

    case 'building_school':
      return (
        <group>
          {/* Main building */}
          <mesh material={mat} castShadow position={[0, 2, 0]}>
            <boxGeometry args={[6, 4, 5]} />
          </mesh>
          {/* Roof */}
          <mesh material={featureMat} castShadow position={[0, 4.8, 0]} rotation={[0, 0.785, 0]}>
            <coneGeometry args={[4.2, 1.8, 4]} />
          </mesh>
          {/* Door */}
          <mesh material={new THREE.MeshLambertMaterial({ color: new THREE.Color('#5c3011') })} position={[0, 0.9, 2.51]}>
            <boxGeometry args={[1.0, 1.8, 0.1]} />
          </mesh>
          {/* Windows */}
          {[-1.8, 1.8].map((wx, i) => (
            <mesh key={i} material={new THREE.MeshLambertMaterial({ color: new THREE.Color('#a8d0f0'), emissive: new THREE.Color('#ffeecc'), emissiveIntensity: 0.4 })} position={[wx, 2.2, 2.51]}>
              <boxGeometry args={[1.0, 1.0, 0.1]} />
            </mesh>
          ))}
          {/* Chimney */}
          <mesh material={new THREE.MeshLambertMaterial({ color: new THREE.Color('#7a5c3c') })} castShadow position={[1.5, 5.4, -0.5]}>
            <cylinderGeometry args={[0.3, 0.35, 1.2, 6]} />
          </mesh>
          {/* Steps */}
          <mesh material={featureMat} position={[0, 0.1, 2.8]}>
            <boxGeometry args={[1.4, 0.2, 0.6]} />
          </mesh>
        </group>
      )

    case 'human_hunter':
      return (
        <group>
          {/* Legs */}
          <mesh material={new THREE.MeshLambertMaterial({ color: new THREE.Color('#3b2e1e') })} castShadow position={[0.18, 0.5, 0]}>
            <cylinderGeometry args={[0.13, 0.12, 1.0, 7]} />
          </mesh>
          <mesh material={new THREE.MeshLambertMaterial({ color: new THREE.Color('#3b2e1e') })} castShadow position={[-0.18, 0.5, 0]}>
            <cylinderGeometry args={[0.13, 0.12, 1.0, 7]} />
          </mesh>
          {/* Torso */}
          <mesh material={mat} castShadow position={[0, 1.25, 0]}>
            <cylinderGeometry args={[0.3, 0.28, 0.85, 8]} />
          </mesh>
          {/* Head */}
          <mesh material={new THREE.MeshLambertMaterial({ color: new THREE.Color('#d2a679') })} castShadow position={[0, 1.9, 0]}>
            <sphereGeometry args={[0.28, 8, 7]} />
          </mesh>
          {/* Hat */}
          <mesh material={new THREE.MeshLambertMaterial({ color: new THREE.Color('#2c1a0e') })} position={[0, 2.22, 0]}>
            <cylinderGeometry args={[0.25, 0.32, 0.35, 8]} />
          </mesh>
          <mesh material={new THREE.MeshLambertMaterial({ color: new THREE.Color('#2c1a0e') })} position={[0, 2.08, 0]}>
            <cylinderGeometry args={[0.42, 0.42, 0.06, 8]} />
          </mesh>
          {/* Rifle */}
          <mesh material={new THREE.MeshLambertMaterial({ color: new THREE.Color('#1a1a1a') })} position={[0.45, 1.2, 0.1]} rotation={[0.2, 0, 0.15]}>
            <cylinderGeometry args={[0.04, 0.04, 1.2, 5]} />
          </mesh>
        </group>
      )

    case 'bear':
      return (
        <group>
          {/* Large body */}
          <mesh material={mat} castShadow position={[0, 1.0, 0]}>
            <sphereGeometry args={[0.85, 10, 9]} />
          </mesh>
          <mesh material={mat} castShadow position={[0, 1.0, 0]}>
            <cylinderGeometry args={[0.7, 0.8, 1.1, 8]} />
          </mesh>
          {/* Head */}
          <mesh material={mat} castShadow position={[0, 1.9, 0.5]}>
            <sphereGeometry args={[0.55, 10, 8]} />
          </mesh>
          {/* Snout */}
          <mesh material={featureMat} castShadow position={[0, 1.75, 0.95]}>
            <sphereGeometry args={[0.3, 8, 6]} />
          </mesh>
          {/* Round ears */}
          <mesh material={mat} castShadow position={[0.35, 2.38, 0.35]}>
            <sphereGeometry args={[0.2, 6, 6]} />
          </mesh>
          <mesh material={mat} castShadow position={[-0.35, 2.38, 0.35]}>
            <sphereGeometry args={[0.2, 6, 6]} />
          </mesh>
          {/* Eyes — dark, menacing */}
          <mesh material={new THREE.MeshLambertMaterial({ color: new THREE.Color('#ff4400'), emissive: new THREE.Color('#cc2200'), emissiveIntensity: 0.8 })} position={[0.22, 1.98, 0.98]}>
            <sphereGeometry args={[0.075, 6, 6]} />
          </mesh>
          <mesh material={new THREE.MeshLambertMaterial({ color: new THREE.Color('#ff4400'), emissive: new THREE.Color('#cc2200'), emissiveIntensity: 0.8 })} position={[-0.22, 1.98, 0.98]}>
            <sphereGeometry args={[0.075, 6, 6]} />
          </mesh>
          {/* Legs */}
          {[[0.55, 0, 0.5], [-0.55, 0, 0.5], [0.5, 0, -0.5], [-0.5, 0, -0.5]].map(([lx, , lz], i) => (
            <mesh key={i} material={mat} castShadow position={[lx, 0.35, lz]}>
              <cylinderGeometry args={[0.22, 0.18, 0.75, 6]} />
            </mesh>
          ))}
        </group>
      )

    default:
      // Fallback: simple sphere with a face
      return (
        <group>
          <mesh material={mat} castShadow position={[0, 0.7, 0]}>
            <sphereGeometry args={[0.5, 9, 8]} />
          </mesh>
          <mesh material={eyeMat} position={[0.18, 0.8, 0.46]}>
            <sphereGeometry args={[0.06, 5, 5]} />
          </mesh>
          <mesh material={eyeMat} position={[-0.18, 0.8, 0.46]}>
            <sphereGeometry args={[0.06, 5, 5]} />
          </mesh>
        </group>
      )
  }
}

export function NPC({ id, position, color, modelType, trust, name }: NPCProps) {
  const groupRef = useRef<THREE.Group>(null)
  const glowRef = useRef(0)
  const idleOffset = useRef(Math.random() * Math.PI * 2)

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const t = clock.getElapsedTime()

    // Idle bob
    groupRef.current.position.y = position[1] + Math.sin(t * 1.2 + idleOffset.current) * 0.08

    // Glow when player is nearby
    const playerPos = usePlayerStore.getState().position
    const dist = distanceXZ(playerPos, { x: position[0], y: position[1], z: position[2] })
    glowRef.current = dist < 6 ? Math.min(1, glowRef.current + 0.05) : Math.max(0, glowRef.current - 0.05)
  })

  return (
    <group ref={groupRef} position={position}>
      <RigidBody type="kinematicPosition" colliders="hull">
        <NPCBody modelType={modelType} color={color} glowIntensity={glowRef.current} />
      </RigidBody>

      {/* Trust indicator — always faces camera */}
      <Billboard position={[0, 2.8, 0]} follow lockX={false} lockY={false} lockZ={false}>
        <Text
          fontSize={0.32}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#000000"
        >
          {`${trustEmoji(trust)} ${name}`}
        </Text>
      </Billboard>
    </group>
  )
}
