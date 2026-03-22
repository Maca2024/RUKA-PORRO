'use client'

import { useRef, useMemo } from 'react'
import * as THREE from 'three'
import { WORLD_SIZE } from '@/game/core/constants'

// Lightweight seeded pseudo-random for stable terrain
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 43758.5453123
  return x - Math.floor(x)
}

// Simple multi-octave noise using sine harmonics (no external dep)
function terrainHeight(x: number, z: number): number {
  const nx = x / WORLD_SIZE
  const nz = z / WORLD_SIZE

  let h = 0
  h += Math.sin(nx * 3.1 + 0.5) * Math.cos(nz * 2.7 + 1.2) * 4.0
  h += Math.sin(nx * 7.3 - 1.1) * Math.cos(nz * 6.1 + 0.8) * 2.0
  h += Math.sin(nx * 15.7 + 2.3) * Math.cos(nz * 13.9 - 0.4) * 1.0
  h += Math.sin(nx * 31.1 - 0.7) * Math.cos(nz * 28.3 + 1.8) * 0.5

  // Gentle slope toward centre
  const dist = Math.sqrt(nx * nx + nz * nz)
  h *= Math.max(0, 1 - dist * 0.6)

  return h
}

function isOnLake(x: number, z: number): boolean {
  const dx = x - 50
  const dz = z - 50
  return dx * dx + dz * dz <= 900 // radius 30
}

// Build a Float32Array of heights matching PlaneGeometry vertex order.
// PlaneGeometry(W, H, segW, segH) vertices go row by row, -Z to +Z, -X to +X.
function buildHeightfield(segments: number): Float32Array {
  const verts = segments + 1
  const heights = new Float32Array(verts * verts)
  const half = WORLD_SIZE / 2

  for (let row = 0; row < verts; row++) {
    for (let col = 0; col < verts; col++) {
      const wx = -half + (col / segments) * WORLD_SIZE
      const wz = -half + (row / segments) * WORLD_SIZE

      const idx = row * verts + col
      if (isOnLake(wx, wz)) {
        heights[idx] = -0.2 // flat frozen lake — slightly depressed
      } else {
        heights[idx] = terrainHeight(wx, wz)
      }
    }
  }
  return heights
}

export function Terrain() {
  const meshRef = useRef<THREE.Mesh>(null)
  const SEGMENTS = 128

  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(WORLD_SIZE, WORLD_SIZE, SEGMENTS, SEGMENTS)
    geo.rotateX(-Math.PI / 2)

    const positions = geo.attributes.position as THREE.BufferAttribute
    const verts = SEGMENTS + 1
    const half = WORLD_SIZE / 2

    for (let row = 0; row < verts; row++) {
      for (let col = 0; col < verts; col++) {
        const idx = row * verts + col
        const wx = -half + (col / SEGMENTS) * WORLD_SIZE
        const wz = -half + (row / SEGMENTS) * WORLD_SIZE

        const y = isOnLake(wx, wz) ? -0.2 : terrainHeight(wx, wz)
        positions.setY(idx, y)
      }
    }

    geo.computeVertexNormals()
    return geo
  }, [])

  // Snow material: white with subtle blue tint
  const material = useMemo(() => {
    return new THREE.MeshLambertMaterial({
      color: new THREE.Color('#dde4ee'),
      flatShading: false,
    })
  }, [])

  // The lake overlay — a flat disc on top of the terrain
  const lakeGeometry = useMemo(() => {
    return new THREE.CircleGeometry(29.5, 48)
  }, [])

  const lakeMaterial = useMemo(() => {
    return new THREE.MeshLambertMaterial({
      color: new THREE.Color('#8ecae6'),
      transparent: true,
      opacity: 0.85,
    })
  }, [])

  // Heightfield data for Rapier collider
  const heightfieldData = useMemo(() => buildHeightfield(SEGMENTS), [])

  return (
    <group>
      {/* Terrain mesh */}
      <mesh
        ref={meshRef}
        geometry={geometry}
        material={material}
        receiveShadow
      />

      {/* Frozen lake surface */}
      <mesh
        geometry={lakeGeometry}
        material={lakeMaterial}
        position={[50, -0.18, 50]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      />
    </group>
  )
}
