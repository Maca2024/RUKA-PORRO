'use client'

import { useRef, useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { RigidBody, CapsuleCollider } from '@react-three/rapier'
import type { RapierRigidBody } from '@react-three/rapier'
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
  const legFLRef = useRef<THREE.Mesh>(null) // front-left
  const legFRRef = useRef<THREE.Mesh>(null) // front-right
  const legBLRef = useRef<THREE.Mesh>(null) // back-left
  const legBRRef = useRef<THREE.Mesh>(null) // back-right

  useFrame(() => {
    const phase = legPhase.current
    if (!phase && phase !== 0) return
    // Trot gait: FL+BR swing together, FR+BL swing together
    const swing = Math.sin(phase) * 0.45
    if (legFLRef.current) legFLRef.current.rotation.x = swing
    if (legBRRef.current) legBRRef.current.rotation.x = swing
    if (legFRRef.current) legFRRef.current.rotation.x = -swing
    if (legBLRef.current) legBLRef.current.rotation.x = -swing
  })

  const bodyMat = useMemo(
    () => new THREE.MeshLambertMaterial({ color: new THREE.Color('#8B5E3C') }),
    [],
  )
  const legMat = useMemo(
    () => new THREE.MeshLambertMaterial({ color: new THREE.Color('#7A4F2E') }),
    [],
  )
  const bellyMat = useMemo(
    () => new THREE.MeshLambertMaterial({ color: new THREE.Color('#D9C4A0') }),
    [],
  )
  const antlerMat = useMemo(
    () => new THREE.MeshLambertMaterial({ color: new THREE.Color('#C8A96E') }),
    [],
  )
  const eyeMat = useMemo(
    () => new THREE.MeshLambertMaterial({ color: new THREE.Color('#1a1a1a') }),
    [],
  )
  const noseMat = useMemo(
    () => new THREE.MeshLambertMaterial({ color: new THREE.Color('#cc4455') }),
    [],
  )

  return (
    <group>
      {/* Main body — elongated sphere */}
      <mesh material={bodyMat} castShadow position={[0, 0.7, 0]}>
        <sphereGeometry args={[0.65, 10, 8]} />
      </mesh>
      {/* Body stretch cylinder */}
      <mesh material={bodyMat} castShadow position={[0, 0.7, 0]}>
        <cylinderGeometry args={[0.55, 0.6, 0.9, 10]} />
      </mesh>

      {/* White belly patch */}
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

      {/* Antlers — left */}
      <group position={[0.22, 1.82, 0.6]}>
        <mesh material={antlerMat} castShadow rotation={[0.3, 0, 0.25]}>
          <cylinderGeometry args={[0.03, 0.05, 0.7, 5]} />
        </mesh>
        <mesh material={antlerMat} castShadow position={[0.15, 0.28, 0.0]} rotation={[0.1, 0, 0.6]}>
          <cylinderGeometry args={[0.025, 0.04, 0.4, 5]} />
        </mesh>
        <mesh material={antlerMat} castShadow position={[-0.05, 0.32, 0.1]} rotation={[-0.1, 0, -0.3]}>
          <cylinderGeometry args={[0.025, 0.04, 0.35, 5]} />
        </mesh>
      </group>

      {/* Antlers — right */}
      <group position={[-0.22, 1.82, 0.6]}>
        <mesh material={antlerMat} castShadow rotation={[0.3, 0, -0.25]}>
          <cylinderGeometry args={[0.03, 0.05, 0.7, 5]} />
        </mesh>
        <mesh material={antlerMat} castShadow position={[-0.15, 0.28, 0.0]} rotation={[0.1, 0, -0.6]}>
          <cylinderGeometry args={[0.025, 0.04, 0.4, 5]} />
        </mesh>
        <mesh material={antlerMat} castShadow position={[0.05, 0.32, 0.1]} rotation={[-0.1, 0, 0.3]}>
          <cylinderGeometry args={[0.025, 0.04, 0.35, 5]} />
        </mesh>
      </group>

      {/* Tail */}
      <mesh material={bellyMat} position={[0, 0.8, -0.68]}>
        <sphereGeometry args={[0.18, 6, 5]} />
      </mesh>

      {/* Legs — each group can rotate for animation */}
      {/* Front-Left */}
      <group position={[0.3, 0.25, 0.32]}>
        <mesh ref={legFLRef} material={legMat} castShadow position={[0, -0.3, 0]}>
          <cylinderGeometry args={[0.1, 0.08, 0.65, 7]} />
        </mesh>
      </group>
      {/* Front-Right */}
      <group position={[-0.3, 0.25, 0.32]}>
        <mesh ref={legFRRef} material={legMat} castShadow position={[0, -0.3, 0]}>
          <cylinderGeometry args={[0.1, 0.08, 0.65, 7]} />
        </mesh>
      </group>
      {/* Back-Left */}
      <group position={[0.3, 0.25, -0.32]}>
        <mesh ref={legBLRef} material={legMat} castShadow position={[0, -0.3, 0]}>
          <cylinderGeometry args={[0.1, 0.08, 0.65, 7]} />
        </mesh>
      </group>
      {/* Back-Right */}
      <group position={[-0.3, 0.25, -0.32]}>
        <mesh ref={legBRRef} material={legMat} castShadow position={[0, -0.3, 0]}>
          <cylinderGeometry args={[0.1, 0.08, 0.65, 7]} />
        </mesh>
      </group>
    </group>
  )
}

// ─── Main player component ────────────────────────────────────────────────────

export function Porro() {
  const rigidBodyRef = useRef<RapierRigidBody>(null)
  const groupRef = useRef<THREE.Group>(null)
  const legPhase = useRef(0)
  const isGroundedRef = useRef(true)
  const facingAngle = useRef(0)
  const prevVelY = useRef(0)

  const setPosition = usePlayerStore((s) => s.setPosition)
  const setRotation = usePlayerStore((s) => s.setRotation)
  const setSprinting = usePlayerStore((s) => s.setSprinting)
  const setJumping = usePlayerStore((s) => s.setJumping)
  const setGrounded = usePlayerStore((s) => s.setGrounded)
  const isInDialogue = usePlayerStore((s) => s.isInDialogue)
  const isDead = usePlayerStore((s) => s.isDead)

  // ── Keyboard listeners ──────────────────────────────────────────────────────
  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      keys[e.code] = true

      if (e.code === 'KeyE') {
        playerSystem.handleInteraction()
      }
    }
    const onUp = (e: KeyboardEvent) => {
      keys[e.code] = false
    }

    window.addEventListener('keydown', onDown)
    window.addEventListener('keyup', onUp)
    return () => {
      window.removeEventListener('keydown', onDown)
      window.removeEventListener('keyup', onUp)
    }
  }, [])

  useFrame((state, delta) => {
    const rb = rigidBodyRef.current
    const group = groupRef.current
    if (!rb || !group || isDead || isInDialogue) return

    // ── Grounded check via velocity ───────────────────────────────────────────
    const vel = rb.linvel()
    const wasGrounded = isGroundedRef.current
    // Consider grounded when vertical velocity is near zero and we were previously on ground
    // or transitioning from falling
    isGroundedRef.current = Math.abs(vel.y) < 0.5 || (vel.y > -0.1 && prevVelY.current <= vel.y)
    prevVelY.current = vel.y
    setGrounded(isGroundedRef.current)

    // ── Input ──────────────────────────────────────────────────────────────────
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

    // Rotate character to face movement direction
    if (isMoving) {
      const targetAngle = Math.atan2(moveX, moveZ)
      facingAngle.current += (targetAngle - facingAngle.current) * Math.min(1, delta * 10)
      group.rotation.y = facingAngle.current
    }

    // Advance leg animation phase
    if (isMoving) {
      legPhase.current += delta * (isSprinting ? 8 : 5)
    } else {
      // Gentle idle sway
      legPhase.current += delta * 0.4
    }

    // Apply horizontal velocity (world-space WASD)
    const angle = facingAngle.current
    let vx = vel.x
    let vz = vel.z

    if (isMoving) {
      vx = Math.sin(angle) * speed
      vz = Math.cos(angle) * speed
    } else {
      // Friction
      vx *= 0.85
      vz *= 0.85
    }

    // Jump
    let vy = vel.y
    if (jumpPressed && isGroundedRef.current) {
      vy = PLAYER_JUMP_FORCE
      setJumping(true)
      isGroundedRef.current = false
    } else if (Math.abs(vel.y) < 0.2) {
      setJumping(false)
    }

    rb.setLinvel({ x: vx, y: vy, z: vz }, true)

    // Sync store position
    const pos = rb.translation()
    setPosition({ x: pos.x, y: pos.y, z: pos.z })
    setRotation(facingAngle.current)

    // Sync visual group position
    group.position.set(pos.x, pos.y - 1.1, pos.z)
  })

  return (
    <>
      <RigidBody
        ref={rigidBodyRef}
        type="dynamic"
        position={[0, 3, 0]}
        enabledRotations={[false, false, false]}
        linearDamping={0.5}
        angularDamping={1}
        mass={80}
        colliders={false}
      >
        <CapsuleCollider args={[0.5, 0.5]} />
      </RigidBody>

      <group ref={groupRef}>
        <PorroMesh legPhase={legPhase} />
      </group>
    </>
  )
}
