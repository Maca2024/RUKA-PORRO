'use client'

import { useRef, useEffect } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { usePlayerStore } from '@/game/stores/usePlayerStore'
import {
  CAMERA_DEFAULT_DISTANCE,
  CAMERA_MIN_DISTANCE,
  CAMERA_MAX_DISTANCE,
  CAMERA_SMOOTHING,
} from '@/game/core/constants'
import { lerp, clamp } from '@/lib/math'

const TARGET_Y_OFFSET = 2.0 // look-at point above player root

export function PorroCamera() {
  const { camera, gl } = useThree()

  const yaw = useRef(0)        // horizontal orbit angle
  const pitch = useRef(0.28)   // vertical orbit angle (radians, clamped)
  const distance = useRef(CAMERA_DEFAULT_DISTANCE)
  const smoothPos = useRef(new THREE.Vector3(0, 5, -15))
  const isPointerLocked = useRef(false)

  // ── Pointer lock ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = gl.domElement

    const onClick = () => {
      if (!isPointerLocked.current) {
        canvas.requestPointerLock()
      }
    }

    const onLockChange = () => {
      isPointerLocked.current = document.pointerLockElement === canvas
    }

    const onMouseMove = (e: MouseEvent) => {
      if (!isPointerLocked.current) return
      yaw.current -= e.movementX * 0.0025
      pitch.current = clamp(
        pitch.current - e.movementY * 0.0025,
        -0.05,
        Math.PI * 0.4,
      )
    }

    const onWheel = (e: WheelEvent) => {
      distance.current = clamp(
        distance.current + e.deltaY * 0.01,
        CAMERA_MIN_DISTANCE,
        CAMERA_MAX_DISTANCE,
      )
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Escape' && isPointerLocked.current) {
        document.exitPointerLock()
      }
    }

    canvas.addEventListener('click', onClick)
    document.addEventListener('pointerlockchange', onLockChange)
    document.addEventListener('mousemove', onMouseMove)
    canvas.addEventListener('wheel', onWheel, { passive: true })
    window.addEventListener('keydown', onKeyDown)

    return () => {
      canvas.removeEventListener('click', onClick)
      document.removeEventListener('pointerlockchange', onLockChange)
      document.removeEventListener('mousemove', onMouseMove)
      canvas.removeEventListener('wheel', onWheel)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [gl])

  useFrame((_, delta) => {
    const playerPos = usePlayerStore.getState().position

    // Target look-at point
    const targetX = playerPos.x
    const targetY = playerPos.y + TARGET_Y_OFFSET
    const targetZ = playerPos.z

    // Orbit offset from player
    const d = distance.current
    const offX = Math.sin(yaw.current) * Math.cos(pitch.current) * d
    const offY = Math.sin(pitch.current) * d
    const offZ = Math.cos(yaw.current) * Math.cos(pitch.current) * d

    const desiredX = targetX - offX
    const desiredY = targetY + offY
    const desiredZ = targetZ - offZ

    // Smooth camera position with lerp
    const smoothFactor = clamp(CAMERA_SMOOTHING + delta * 3, 0, 1)
    smoothPos.current.x = lerp(smoothPos.current.x, desiredX, smoothFactor)
    smoothPos.current.y = lerp(smoothPos.current.y, desiredY, smoothFactor)
    smoothPos.current.z = lerp(smoothPos.current.z, desiredZ, smoothFactor)

    camera.position.copy(smoothPos.current)
    camera.lookAt(targetX, targetY, targetZ)
  })

  // This component has no visual output — it only drives the camera
  return null
}
