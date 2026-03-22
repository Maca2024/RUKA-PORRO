'use client'

import { useRef, useMemo } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { useWorldStore } from '@/game/stores/useWorldStore'
import { smoothstep } from '@/lib/math'

// One aurora ribbon: a curved plane mesh with animated vertices
interface RibbonProps {
  baseX: number
  baseZ: number
  width: number
  height: number
  yBottom: number
  colorA: THREE.Color
  colorB: THREE.Color
  phaseOffset: number
  opacityScale: number
}

function AuroraRibbon({
  baseX,
  baseZ,
  width,
  height,
  yBottom,
  colorA,
  colorB,
  phaseOffset,
  opacityScale,
}: RibbonProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const SEGS_W = 24
  const SEGS_H = 8

  const { geometry, positionsRef } = useMemo(() => {
    const geo = new THREE.PlaneGeometry(width, height, SEGS_W, SEGS_H)
    // Move pivot to bottom edge
    geo.translate(0, height / 2, 0)

    // Store original X positions for wave animation
    const pos = geo.attributes.position as THREE.BufferAttribute
    const originalX = new Float32Array(pos.count)
    for (let i = 0; i < pos.count; i++) {
      originalX[i] = pos.getX(i)
    }

    return { geometry: geo, positionsRef: { orig: originalX } }
  }, [width, height])

  const material = useMemo(() => {
    const mat = new THREE.MeshBasicMaterial({
      vertexColors: true,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    })

    // Build vertex color gradient (green → purple top-to-bottom)
    const pos = geometry.attributes.position as THREE.BufferAttribute
    const colors = new Float32Array(pos.count * 3)
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i)
      const t = (y + height / 2) / height // 0 at bottom, 1 at top... wait, pivot moved
      // After translate, y ranges from 0 to height
      const tNorm = Math.max(0, Math.min(1, (y + 0.1) / height))
      const c = colorA.clone().lerp(colorB, tNorm)
      colors[i * 3] = c.r
      colors[i * 3 + 1] = c.g
      colors[i * 3 + 2] = c.b
    }
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    return mat
  }, [geometry, colorA, colorB, height])

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    const t = clock.getElapsedTime()

    const pos = geometry.attributes.position as THREE.BufferAttribute
    const verts = SEGS_W + 1

    for (let row = 0; row <= SEGS_H; row++) {
      for (let col = 0; col <= SEGS_W; col++) {
        const idx = row * verts + col
        const origX = positionsRef.orig[idx]
        const yPos = pos.getY(idx)

        // Wave along X axis, stronger at top
        const heightFactor = yPos / height
        const wave =
          Math.sin(origX * 0.06 + t * 0.5 + phaseOffset) * 2.5 * heightFactor +
          Math.sin(origX * 0.12 - t * 0.3 + phaseOffset * 1.7) * 1.2 * heightFactor

        pos.setX(idx, origX + wave)
        // Slight Z undulation
        pos.setZ(idx, Math.sin(origX * 0.04 + t * 0.4 + phaseOffset) * 1.5 * heightFactor)
      }
    }

    pos.needsUpdate = true
    geometry.computeVertexNormals()

    // Opacity pulsing
    material.opacity = opacityScale * (0.25 + 0.15 * Math.sin(t * 0.8 + phaseOffset))
  })

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      material={material}
      position={[baseX, yBottom, baseZ]}
      rotation={[0, Math.PI * 0.15 * phaseOffset, 0]}
    />
  )
}

export function AuroraBorealis() {
  const groupRef = useRef<THREE.Group>(null)

  const ribbons: RibbonProps[] = useMemo(() => [
    {
      baseX: -60,
      baseZ: -100,
      width: 180,
      height: 45,
      yBottom: 80,
      colorA: new THREE.Color('#00ff88'),
      colorB: new THREE.Color('#9900ff'),
      phaseOffset: 0,
      opacityScale: 1,
    },
    {
      baseX: 80,
      baseZ: -80,
      width: 140,
      height: 35,
      yBottom: 90,
      colorA: new THREE.Color('#00eeff'),
      colorB: new THREE.Color('#ff00cc'),
      phaseOffset: 1.8,
      opacityScale: 0.7,
    },
    {
      baseX: 20,
      baseZ: -120,
      width: 200,
      height: 50,
      yBottom: 85,
      colorA: new THREE.Color('#44ff66'),
      colorB: new THREE.Color('#6600ff'),
      phaseOffset: 3.5,
      opacityScale: 0.85,
    },
  ], [])

  // Fade the whole group in/out based on time of day
  useFrame(() => {
    if (!groupRef.current) return
    const { dayProgress } = useWorldStore.getState()

    // Visible at night: dayProgress < 0.2 (night start) or > 0.8 (night end)
    let nightFactor = 0
    if (dayProgress < 0.2) {
      nightFactor = smoothstep(0.05, 0.0, dayProgress) // brightest at midnight
        + smoothstep(0.05, 0.2, dayProgress) * -1 + 1
      nightFactor = 1 - smoothstep(0.0, 0.2, dayProgress)
    } else if (dayProgress > 0.8) {
      nightFactor = smoothstep(0.8, 1.0, dayProgress)
    }

    groupRef.current.visible = nightFactor > 0.01
    groupRef.current.children.forEach((child) => {
      if (child instanceof THREE.Mesh) {
        const mat = child.material as THREE.MeshBasicMaterial
        mat.opacity = nightFactor * 0.4
      }
    })
  })

  return (
    <group ref={groupRef}>
      {ribbons.map((props, i) => (
        <AuroraRibbon key={i} {...props} />
      ))}
    </group>
  )
}
