'use client'

import { useRef, useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { usePlayerStore } from '@/game/stores/usePlayerStore'
import { playerSystem } from '@/game/systems/playerSystem'
import {
  PLAYER_WALK_SPEED,
  PLAYER_SPRINT_SPEED,
  PLAYER_JUMP_FORCE,
} from '@/game/core/constants'

// ─── Keyboard state (module-level, no re-render on change) ───────────────────

const keys: Record<string, boolean> = {}

// ─── Reindeer body geometry ───────────────────────────────────────────────────

function PorroMesh({ legPhase }: { legPhase: React.MutableRefObject<number> }) {
  const legFLRef = useRef<THREE.Mesh>(null)
  const legFRRef = useRef<THREE.Mesh>(null)
  const legBLRef = useRef<THREE.Mesh>(null)
  const legBRRef = useRef<THREE.Mesh>(null)

  useFrame(() => {
    const phase = legPhase.current
    if (!phase && phase !== 0) return
    const swing = Math.sin(phase) * 0.45
    if (legFLRef.current) legFLRef.current.rotation.x = swing
    if (legBRRef.current) legBRRef.current.rotation.x = swing
    if (legFRRef.current) legFRRef.current.rotation.x = -swing
    if (legBLRef.current) legBLRef.current.rotation.x = -swing
  })

  const bodyMat = useMemo(() => new THREE.MeshLambertMaterial({ color: '#8B5E3C' }), [])
  const legMat = useMemo(() => new THREE.MeshLambertMaterial({ color: '#7A4F2E' }), [])
  const bellyMat = useMemo(() => new THREE.MeshLambertMaterial({ color: '#D9C4A0' }), [])
  const antlerMat = useMemo(() => new THREE.MeshLambertMaterial({ color: '#C8A96E' }), [])
  const eyeMat = useMemo(() => new THREE.MeshLambertMaterial({ color: '#1a1a1a' }), [])
  const noseMat = useMemo(() => new THREE.MeshLambertMaterial({ color: '#cc4455' }), [])

  return (
    <group>
      {/* Main body */}
      <mesh material={bodyMat} castShadow position={[0, 0.7, 0]}>
        <sphereGeometry args={[0.65, 10, 8]} />
      </mesh>
      <mesh material={bodyMat} castShadow position={[0, 0.7, 0]}>
        <cylinderGeometry args={[0.55, 0.6, 0.9, 10]} />
      </mesh>

      {/* White belly */}
      <mesh material={bellyMat} position={[0, 0.4, 0.45]}>
        <sphereGeometry args={[0.38, 8, 6]} />
      </mesh>

      {/* Neck */}
      <mesh material={bodyMat} castShadow position={[0, 1.15, 0.35]} rotation={[0.55, 0, 0]}>
        <cylinderGeometry args={[0.22, 0.28, 0.65, 8]} />
      </mesh>

      {/* Head */}
      <mesh material={bodyMat} castShadow position={[0, 1.55, 0.72]}>
        <sphereGeometry args={[0.35, 10, 8]} />
      </mesh>

      {/* Snout */}
      <mesh material={bodyMat} castShadow position={[0, 1.46, 1.02]}>
        <sphereGeometry args={[0.22, 8, 6]} />
      </mesh>

      {/* Nose */}
      <mesh material={noseMat} position={[0, 1.46, 1.22]}>
        <sphereGeometry args={[0.09, 6, 5]} />
      </mesh>

      {/* Eyes */}
      <mesh material={eyeMat} position={[0.17, 1.62, 0.95]}>
        <sphereGeometry args={[0.055, 6, 5]} />
      </mesh>
      <mesh material={eyeMat} position={[-0.17, 1.62, 0.95]}>
        <sphereGeometry args={[0.055, 6, 5]} />
      </mesh>

      {/* Antlers left */}
      <group position={[0.22, 1.82, 0.6]}>
        <mesh material={antlerMat} castShadow rotation={[0.3, 0, 0.25]}>
          <cylinderGeometry args={[0.03, 0.05, 0.7, 5]} />
        </mesh>
        <mesh material={antlerMat} castShadow position={[0.15, 0.28, 0]} rotation={[0.1, 0, 0.6]}>
          <cylinderGeometry args={[0.025, 0.04, 0.4, 5]} />
        </mesh>
      </group>

      {/* Antlers right */}
      <group position={[-0.22, 1.82, 0.6]}>
        <mesh material={antlerMat} castShadow rotation={[0.3, 0, -0.25]}>
          <cylinderGeometry args={[0.03, 0.05, 0.7, 5]} />
        </mesh>
        <mesh material={antlerMat} castShadow position={[-0.15, 0.28, 0]} rotation={[0.1, 0, -0.6]}>
          <cylinderGeometry args={[0.025, 0.04, 0.4, 5]} />
        </mesh>
      </group>

      {/* Tail */}
      <mesh material={bellyMat} position={[0, 0.8, -0.68]}>
        <sphereGeometry args={[0.18, 6, 5]} />
      </mesh>

      {/* Legs */}
      <group position={[0.3, 0.25, 0.32]}>
        <mesh ref={legFLRef} material={legMat} castShadow position={[0, -0.3, 0]}>
          <cylinderGeometry args={[0.1, 0.08, 0.65, 7]} />
        </mesh>
      </group>
      <group position={[-0.3, 0.25, 0.32]}>
        <mesh ref={legFRRef} material={legMat} castShadow position={[0, -0.3, 0]}>
          <cylinderGeometry args={[0.1, 0.08, 0.65, 7]} />
        </mesh>
      </group>
      <group position={[0.3, 0.25, -0.32]}>
        <mesh ref={legBLRef} material={legMat} castShadow position={[0, -0.3, 0]}>
          <cylinderGeometry args={[0.1, 0.08, 0.65, 7]} />
        </mesh>
      </group>
      <group position={[-0.3, 0.25, -0.32]}>
        <mesh ref={legBRRef} material={legMat} castShadow position={[0, -0.3, 0]}>
          <cylinderGeometry args={[0.1, 0.08, 0.65, 7]} />
        </mesh>
      </group>
    </group>
  )
}

// ─── Main player component — simple movement (no physics engine) ─────────────

export function Porro() {
  const groupRef = useRef<THREE.Group>(null)
  const legPhase = useRef(0)
  const facingAngle = useRef(0)
  const posRef = useRef(new THREE.Vector3(0, 2, 0))
  const velRef = useRef(new THREE.Vector3(0, 0, 0))

  const setPosition = usePlayerStore((s) => s.setPosition)
  const setRotation = usePlayerStore((s) => s.setRotation)
  const setSprinting = usePlayerStore((s) => s.setSprinting)
  const setJumping = usePlayerStore((s) => s.setJumping)
  const setGrounded = usePlayerStore((s) => s.setGrounded)
  const isInDialogue = usePlayerStore((s) => s.isInDialogue)
  const isDead = usePlayerStore((s) => s.isDead)

  // Keyboard listeners
  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      keys[e.code] = true
      if (e.code === 'KeyE') playerSystem.handleInteraction()
    }
    const onUp = (e: KeyboardEvent) => { keys[e.code] = false }
    window.addEventListener('keydown', onDown)
    window.addEventListener('keyup', onUp)
    return () => {
      window.removeEventListener('keydown', onDown)
      window.removeEventListener('keyup', onUp)
    }
  }, [])

  useFrame((_state, delta) => {
    const group = groupRef.current
    if (!group || isDead || isInDialogue) return

    const cappedDelta = Math.min(delta, 0.1)
    const isSprinting = (keys['ShiftLeft'] || keys['ShiftRight']) && usePlayerStore.getState().energy > 0
    setSprinting(isSprinting)

    const speed = isSprinting ? PLAYER_SPRINT_SPEED : PLAYER_WALK_SPEED

    const forward = keys['KeyW'] || keys['ArrowUp']
    const backward = keys['KeyS'] || keys['ArrowDown']
    const left = keys['KeyA'] || keys['ArrowLeft']
    const right = keys['KeyD'] || keys['ArrowRight']
    const jumpPressed = keys['Space']

    const moveX = (right ? 1 : 0) - (left ? 1 : 0)
    const moveZ = (backward ? 1 : 0) - (forward ? 1 : 0)
    const isMoving = moveX !== 0 || moveZ !== 0

    // Rotate to face movement direction
    if (isMoving) {
      const targetAngle = Math.atan2(moveX, moveZ)
      facingAngle.current += (targetAngle - facingAngle.current) * Math.min(1, cappedDelta * 10)
      group.rotation.y = facingAngle.current
    }

    // Leg animation
    if (isMoving) {
      legPhase.current += cappedDelta * (isSprinting ? 8 : 5)
    } else {
      legPhase.current += cappedDelta * 0.4
    }

    // Simple movement
    const angle = facingAngle.current
    if (isMoving) {
      velRef.current.x = Math.sin(angle) * speed
      velRef.current.z = Math.cos(angle) * speed
    } else {
      velRef.current.x *= 0.85
      velRef.current.z *= 0.85
    }

    // Jump
    if (jumpPressed && posRef.current.y <= 2.1) {
      velRef.current.y = PLAYER_JUMP_FORCE * 0.5
      setJumping(true)
    }

    // Gravity
    velRef.current.y -= 20 * cappedDelta

    // Apply velocity
    posRef.current.x += velRef.current.x * cappedDelta
    posRef.current.y += velRef.current.y * cappedDelta
    posRef.current.z += velRef.current.z * cappedDelta

    // Floor clamp at y=2 (approximate terrain height)
    if (posRef.current.y < 2) {
      posRef.current.y = 2
      velRef.current.y = 0
      setJumping(false)
      setGrounded(true)
    }

    // World bounds
    posRef.current.x = Math.max(-200, Math.min(200, posRef.current.x))
    posRef.current.z = Math.max(-200, Math.min(200, posRef.current.z))

    // Update store and visual
    setPosition({ x: posRef.current.x, y: posRef.current.y, z: posRef.current.z })
    setRotation(facingAngle.current)
    group.position.set(posRef.current.x, posRef.current.y - 1.1, posRef.current.z)
  })

  return (
    <group ref={groupRef} position={[0, 0.9, 0]}>
      <PorroMesh legPhase={legPhase} />
    </group>
  )
}
