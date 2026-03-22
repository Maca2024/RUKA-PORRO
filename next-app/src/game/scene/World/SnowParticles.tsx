'use client'

import { useRef, useMemo } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { useWorldStore } from '@/game/stores/useWorldStore'
import { usePlayerStore } from '@/game/stores/usePlayerStore'

const PARTICLE_COUNT = 3000
const SPAWN_HEIGHT = 45
const GROUND_Y = -2
const SPAWN_RADIUS = 80 // tight bubble around the player

// Per-particle size range (world units, sizeAttenuation: true)
const SIZE_MIN = 0.08
const SIZE_MAX = 0.25

// Gust parameters — a new gust fires every GUST_INTERVAL seconds
const GUST_INTERVAL = 6.0
const GUST_DURATION = 1.8
const GUST_STRENGTH = 4.5

export function SnowParticles() {
  const pointsRef = useRef<THREE.Points>(null)

  // Per-particle randomised data — never changes after init
  const { positions, speeds, offsets, sizes, swirlPhase, swirlRate } = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3)
    const speeds = new Float32Array(PARTICLE_COUNT)
    const offsets = new Float32Array(PARTICLE_COUNT)
    const sizes = new Float32Array(PARTICLE_COUNT)
    const swirlPhase = new Float32Array(PARTICLE_COUNT)
    const swirlRate = new Float32Array(PARTICLE_COUNT)

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3
      const angle = Math.random() * Math.PI * 2
      const r = Math.sqrt(Math.random()) * SPAWN_RADIUS
      positions[i3] = Math.cos(angle) * r
      positions[i3 + 1] = Math.random() * SPAWN_HEIGHT
      positions[i3 + 2] = Math.sin(angle) * r

      speeds[i] = 1.5 + Math.random() * 3.0
      offsets[i] = Math.random() * Math.PI * 2
      sizes[i] = SIZE_MIN + Math.random() * (SIZE_MAX - SIZE_MIN)
      swirlPhase[i] = Math.random() * Math.PI * 2
      swirlRate[i] = 0.4 + Math.random() * 1.2
    }
    return { positions, speeds, offsets, sizes, swirlPhase, swirlRate }
  }, [])

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions.slice(), 3))
    geo.setAttribute('size', new THREE.BufferAttribute(sizes.slice(), 1))
    return geo
  }, [positions, sizes])

  // Shared snowflake texture
  const material = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 32
    canvas.height = 32
    const ctx = canvas.getContext('2d')!
    const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16)
    gradient.addColorStop(0, 'rgba(255,255,255,0.95)')
    gradient.addColorStop(0.4, 'rgba(220,235,255,0.7)')
    gradient.addColorStop(0.75, 'rgba(200,220,255,0.25)')
    gradient.addColorStop(1, 'rgba(190,215,255,0)')
    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(16, 16, 16, 0, Math.PI * 2)
    ctx.fill()

    const texture = new THREE.CanvasTexture(canvas)

    return new THREE.PointsMaterial({
      size: SIZE_MAX,
      map: texture,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
      opacity: 0.82,
      vertexColors: false,
    })
  }, [])

  // Gust runtime state — kept in a ref to avoid re-renders
  const gustRef = useRef({ timer: 0, active: false, elapsed: 0 })

  useFrame((_, delta) => {
    if (!pointsRef.current) return

    const posAttr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute
    const posArray = posAttr.array as Float32Array

    const weather = useWorldStore.getState().weather
    const playerPos = usePlayerStore.getState().position

    const baseWindX = weather.windDirection.x * weather.windStrength * 0.12
    const baseWindZ = weather.windDirection.z * weather.windStrength * 0.12
    const time = performance.now() / 1000

    // Gust logic
    const gust = gustRef.current
    gust.timer += delta
    if (!gust.active && gust.timer >= GUST_INTERVAL) {
      gust.active = true
      gust.elapsed = 0
      gust.timer = 0
    }
    let gustMult = 0
    if (gust.active) {
      gust.elapsed += delta
      const t = gust.elapsed / GUST_DURATION
      if (t >= 1) {
        gust.active = false
        gust.elapsed = 0
      } else {
        // Bell curve: ramps up then fades
        gustMult = Math.sin(t * Math.PI) * GUST_STRENGTH
      }
    }

    const windX = baseWindX + weather.windDirection.x * gustMult * 0.08
    const windZ = baseWindZ + weather.windDirection.z * gustMult * 0.08

    const px = playerPos.x
    const pz = playerPos.z

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3

      // Gentle swirl: small horizontal oscillation that rotates over time
      const swirlAngle = time * swirlRate[i] + swirlPhase[i]
      const swirlX = Math.cos(swirlAngle) * 0.008
      const swirlZ = Math.sin(swirlAngle) * 0.008

      // Fall
      posArray[i3 + 1] -= speeds[i] * delta

      // Wind + swirl + classic lateral drift
      posArray[i3] += windX * delta + swirlX + Math.sin(time + offsets[i]) * 0.008
      posArray[i3 + 2] += windZ * delta + swirlZ + Math.cos(time * 0.7 + offsets[i]) * 0.008

      // Respawn relative to the player so the bubble always stays dense nearby
      if (posArray[i3 + 1] < GROUND_Y) {
        const angle = Math.random() * Math.PI * 2
        const r = Math.sqrt(Math.random()) * SPAWN_RADIUS
        posArray[i3] = px + Math.cos(angle) * r
        posArray[i3 + 1] = SPAWN_HEIGHT + Math.random() * 6
        posArray[i3 + 2] = pz + Math.sin(angle) * r
      }

      // Radial wrap: if a particle drifted too far from the player, re-seed it
      const dx = posArray[i3] - px
      const dz = posArray[i3 + 2] - pz
      if (dx * dx + dz * dz > SPAWN_RADIUS * SPAWN_RADIUS * 1.5) {
        const angle = Math.random() * Math.PI * 2
        const r = Math.sqrt(Math.random()) * SPAWN_RADIUS
        posArray[i3] = px + Math.cos(angle) * r
        posArray[i3 + 1] = Math.random() * SPAWN_HEIGHT
        posArray[i3 + 2] = pz + Math.sin(angle) * r
      }
    }

    // Depth-based opacity: material opacity is global so we approximate
    // by nudging the overall material opacity with weather intensity
    material.opacity = 0.55 + weather.snowIntensity * 0.35

    posAttr.needsUpdate = true
  })

  return <points ref={pointsRef} geometry={geometry} material={material} />
}
