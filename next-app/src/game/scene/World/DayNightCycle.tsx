'use client'

import { useRef } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { useWorldStore } from '@/game/stores/useWorldStore'
import { lerp, smoothstep } from '@/lib/math'
import { COLORS } from '@/game/core/constants'

// Colours for sky at different times
const SKY_DAY = new THREE.Color(COLORS.sky)
const SKY_DAWN = new THREE.Color(COLORS.skyDawn)
const SKY_DUSK = new THREE.Color(COLORS.skyDusk)
const SKY_NIGHT = new THREE.Color(COLORS.skyNight)

const FOG_DAY = new THREE.Color('#c8d8e8')
const FOG_NIGHT = new THREE.Color('#0d1b2a')

function getSkyColor(dayProgress: number): THREE.Color {
  const col = new THREE.Color()
  if (dayProgress < 0.2) {
    // Night
    col.copy(SKY_NIGHT)
  } else if (dayProgress < 0.3) {
    // Night → Dawn
    const t = smoothstep(0.2, 0.3, dayProgress)
    col.copy(SKY_NIGHT).lerp(SKY_DAWN, t)
  } else if (dayProgress < 0.4) {
    // Dawn → Day
    const t = smoothstep(0.3, 0.4, dayProgress)
    col.copy(SKY_DAWN).lerp(SKY_DAY, t)
  } else if (dayProgress < 0.65) {
    // Full day
    col.copy(SKY_DAY)
  } else if (dayProgress < 0.75) {
    // Day → Dusk
    const t = smoothstep(0.65, 0.75, dayProgress)
    col.copy(SKY_DAY).lerp(SKY_DUSK, t)
  } else if (dayProgress < 0.85) {
    // Dusk → Night
    const t = smoothstep(0.75, 0.85, dayProgress)
    col.copy(SKY_DUSK).lerp(SKY_NIGHT, t)
  } else {
    col.copy(SKY_NIGHT)
  }
  return col
}

export function DayNightCycle() {
  const sunRef = useRef<THREE.DirectionalLight>(null)
  const ambientRef = useRef<THREE.AmbientLight>(null)
  const hemiRef = useRef<THREE.HemisphereLight>(null)
  const { scene } = useThree()

  useFrame((_, delta) => {
    // Advance the world clock
    useWorldStore.getState().tick(delta)

    const { dayProgress } = useWorldStore.getState()

    // ── Sun orbit ─────────────────────────────────────────────────────────────
    if (sunRef.current) {
      // dayProgress 0 = midnight, 0.5 = noon
      const angle = (dayProgress - 0.5) * Math.PI * 2
      const radius = 120
      sunRef.current.position.set(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius,
        -40,
      )

      // Intensity: bright at noon, zero at night
      const isDay = dayProgress > 0.2 && dayProgress < 0.8
      const noonT = 1 - Math.abs((dayProgress - 0.5) * 2)
      sunRef.current.intensity = isDay ? lerp(0.1, 2.2, smoothstep(0.2, 0.5, dayProgress) * smoothstep(0.8, 0.5, dayProgress) * 2) : 0

      const warmth = smoothstep(0.3, 0.5, dayProgress) - smoothstep(0.5, 0.75, dayProgress)
      const sunColor = new THREE.Color().setHSL(0.1 - warmth * 0.04, 0.6 + warmth * 0.3, 0.85 + warmth * 0.1)
      sunRef.current.color.copy(sunColor)
    }

    // ── Ambient ───────────────────────────────────────────────────────────────
    if (ambientRef.current) {
      const skyCol = getSkyColor(dayProgress)
      ambientRef.current.color.copy(skyCol)
      const isNight = dayProgress < 0.2 || dayProgress > 0.8
      ambientRef.current.intensity = isNight ? 0.08 : lerp(0.08, 0.45, smoothstep(0.2, 0.45, dayProgress))
    }

    // ── Hemisphere ────────────────────────────────────────────────────────────
    if (hemiRef.current) {
      const skyCol = getSkyColor(dayProgress)
      hemiRef.current.color.copy(skyCol)
      const isNight = dayProgress < 0.2 || dayProgress > 0.8
      hemiRef.current.intensity = isNight ? 0.05 : 0.35
    }

    // ── Scene fog ─────────────────────────────────────────────────────────────
    if (scene.fog instanceof THREE.Fog) {
      const isNight = dayProgress < 0.2 || dayProgress > 0.8
      const t = smoothstep(0.2, 0.4, dayProgress) * (1 - smoothstep(0.7, 0.85, dayProgress))
      scene.fog.color.copy(FOG_NIGHT).lerp(FOG_DAY, t)
      scene.fog.near = isNight ? 30 : 50
      scene.fog.far = isNight ? 120 : 260
    } else {
      scene.fog = new THREE.Fog(FOG_DAY, 50, 260)
    }

    // ── Background colour ─────────────────────────────────────────────────────
    scene.background = getSkyColor(dayProgress)
  })

  return (
    <>
      {/* Sun */}
      <directionalLight
        ref={sunRef}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={1}
        shadow-camera-far={300}
        shadow-camera-left={-80}
        shadow-camera-right={80}
        shadow-camera-top={80}
        shadow-camera-bottom={-80}
        shadow-bias={-0.0004}
      />
      {/* Ambient fill */}
      <ambientLight ref={ambientRef} intensity={0.35} />
      {/* Sky/ground hemisphere */}
      <hemisphereLight
        ref={hemiRef}
        args={[new THREE.Color('#87ceeb'), new THREE.Color('#dde4ee'), 0.3]}
      />
      {/* Static moon light — dim blue, fixed direction */}
      <directionalLight
        position={[-60, 80, -60]}
        intensity={0.06}
        color={new THREE.Color('#b0c8ff')}
      />
    </>
  )
}
