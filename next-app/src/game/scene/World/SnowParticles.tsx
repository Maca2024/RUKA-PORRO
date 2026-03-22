'use client'

import { useRef, useMemo } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { useWorldStore } from '@/game/stores/useWorldStore'
import { SNOW_PARTICLE_COUNT, WORLD_SIZE } from '@/game/core/constants'

const HALF_WORLD = WORLD_SIZE / 2
const SPAWN_HEIGHT = 40
const GROUND_Y = -2

export function SnowParticles() {
  const pointsRef = useRef<THREE.Points>(null)

  const { positions, speeds, offsets } = useMemo(() => {
    const positions = new Float32Array(SNOW_PARTICLE_COUNT * 3)
    const speeds = new Float32Array(SNOW_PARTICLE_COUNT)
    const offsets = new Float32Array(SNOW_PARTICLE_COUNT) // horizontal drift phase

    for (let i = 0; i < SNOW_PARTICLE_COUNT; i++) {
      const i3 = i * 3
      positions[i3] = (Math.random() - 0.5) * WORLD_SIZE
      positions[i3 + 1] = Math.random() * SPAWN_HEIGHT
      positions[i3 + 2] = (Math.random() - 0.5) * WORLD_SIZE

      speeds[i] = 1.5 + Math.random() * 3.0
      offsets[i] = Math.random() * Math.PI * 2
    }
    return { positions, speeds, offsets }
  }, [])

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions.slice(), 3))
    return geo
  }, [positions])

  const material = useMemo(() => {
    // A small white circle sprite
    const canvas = document.createElement('canvas')
    canvas.width = 16
    canvas.height = 16
    const ctx = canvas.getContext('2d')!
    const gradient = ctx.createRadialGradient(8, 8, 0, 8, 8, 8)
    gradient.addColorStop(0, 'rgba(255,255,255,0.9)')
    gradient.addColorStop(0.5, 'rgba(220,235,255,0.6)')
    gradient.addColorStop(1, 'rgba(200,220,255,0)')
    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(8, 8, 8, 0, Math.PI * 2)
    ctx.fill()

    const texture = new THREE.CanvasTexture(canvas)

    return new THREE.PointsMaterial({
      size: 0.18,
      map: texture,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
      opacity: 0.75,
    })
  }, [])

  useFrame((_, delta) => {
    if (!pointsRef.current) return

    const posAttr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute
    const posArray = posAttr.array as Float32Array

    const weather = useWorldStore.getState().weather
    const windX = weather.windDirection.x * weather.windStrength * 0.12
    const windZ = weather.windDirection.z * weather.windStrength * 0.12
    const time = performance.now() / 1000

    for (let i = 0; i < SNOW_PARTICLE_COUNT; i++) {
      const i3 = i * 3

      // Fall downward
      posArray[i3 + 1] -= speeds[i] * delta

      // Wind drift
      posArray[i3] += windX * delta + Math.sin(time + offsets[i]) * 0.01
      posArray[i3 + 2] += windZ * delta + Math.cos(time * 0.7 + offsets[i]) * 0.01

      // Wrap horizontally
      if (posArray[i3] > HALF_WORLD) posArray[i3] -= WORLD_SIZE
      if (posArray[i3] < -HALF_WORLD) posArray[i3] += WORLD_SIZE
      if (posArray[i3 + 2] > HALF_WORLD) posArray[i3 + 2] -= WORLD_SIZE
      if (posArray[i3 + 2] < -HALF_WORLD) posArray[i3 + 2] += WORLD_SIZE

      // Reset to top when below ground
      if (posArray[i3 + 1] < GROUND_Y) {
        posArray[i3 + 1] = SPAWN_HEIGHT + Math.random() * 5
        posArray[i3] = (Math.random() - 0.5) * WORLD_SIZE
        posArray[i3 + 2] = (Math.random() - 0.5) * WORLD_SIZE
      }
    }

    posAttr.needsUpdate = true
  })

  return <points ref={pointsRef} geometry={geometry} material={material} />
}
