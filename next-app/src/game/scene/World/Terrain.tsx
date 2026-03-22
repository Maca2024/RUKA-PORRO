'use client'

import { useRef, useMemo } from 'react'
import * as THREE from 'three'
import { WORLD_SIZE } from '@/game/core/constants'

// ─── Deterministic pseudo-random ─────────────────────────────────────────────

function seededRandom(seed: number): number {
  const x = Math.sin(seed + 1.0) * 43758.5453123
  return x - Math.floor(x)
}

// ─── Multi-octave terrain height ──────────────────────────────────────────────
// Returns height in world units. Mountains up to ~25 units on the north side.

function terrainHeight(x: number, z: number): number {
  const nx = x / WORLD_SIZE
  const nz = z / WORLD_SIZE

  // Base rolling hills
  let h = 0
  h += Math.sin(nx * 3.1 + 0.5) * Math.cos(nz * 2.7 + 1.2) * 6.0
  h += Math.sin(nx * 7.3 - 1.1) * Math.cos(nz * 6.1 + 0.8) * 3.0
  h += Math.sin(nx * 15.7 + 2.3) * Math.cos(nz * 13.9 - 0.4) * 1.5
  h += Math.sin(nx * 31.1 - 0.7) * Math.cos(nz * 28.3 + 1.8) * 0.7
  // Fine detail
  h += Math.sin(nx * 63.2 + 1.3) * Math.cos(nz * 57.1 - 0.9) * 0.3

  // Mountain range on the north side (z < -80)
  if (z < -80) {
    const mountainBlend = Math.min(1, (-z - 80) / 80) // 0 at z=-80, 1 at z=-160
    const mountainRidge =
      Math.sin(nx * 5.2 + 0.8) * Math.cos(nz * 4.3 - 0.6) * 18.0 +
      Math.sin(nx * 9.7 - 1.4) * Math.cos(nz * 8.1 + 1.1) * 8.0 +
      Math.sin(nx * 20.3 + 0.3) * Math.cos(nz * 17.8 - 0.5) * 3.0
    h += Math.max(0, mountainRidge) * mountainBlend
  }

  // Taper terrain at world edges so it doesn't look clipped
  const dist = Math.sqrt(nx * nx + nz * nz)
  h *= Math.max(0, 1 - dist * 0.55)

  return h
}

// ─── Lake / water body helpers ────────────────────────────────────────────────

interface LakeDesc {
  cx: number
  cz: number
  r: number
  depth: number // how far below 0 the lake sits
}

const LAKES: LakeDesc[] = [
  { cx: 50,  cz: 50,  r: 30,   depth: 0.3 }, // main frozen lake
  { cx: -40, cz: 70,  r: 12,   depth: 0.25 }, // small pond
]

// River corridor connecting the two lakes — a curved strip
function isOnRiver(x: number, z: number): boolean {
  // Parametric curve from (-40,70) toward (50,50) — sample 20 points
  for (let t = 0; t <= 1; t += 0.05) {
    const rx = -40 + t * 90 + Math.sin(t * Math.PI) * 15
    const rz = 70 - t * 20
    const dx = x - rx
    const dz = z - rz
    if (dx * dx + dz * dz < 36) return true // 6-unit half-width
  }
  return false
}

function lakeDepthAt(x: number, z: number): number | null {
  for (const lake of LAKES) {
    const dx = x - lake.cx
    const dz = z - lake.cz
    if (dx * dx + dz * dz <= lake.r * lake.r) return lake.depth
  }
  if (isOnRiver(x, z)) return 0.2
  return null
}

function isOnAnyLake(x: number, z: number): boolean {
  return lakeDepthAt(x, z) !== null
}

// ─── Vertex colour based on height ───────────────────────────────────────────

function heightToColor(h: number, isLake: boolean): THREE.Color {
  if (isLake) return new THREE.Color('#8ab8d4') // frozen blue-grey ice

  if (h < -0.5) {
    // Ice / water edge
    return new THREE.Color('#ccd8e8')
  } else if (h < 1.5) {
    // Flat snowy valley — warm white
    return new THREE.Color('#dde8f0')
  } else if (h < 5) {
    // Rolling hills — snow with hints of grey rock
    const t = (h - 1.5) / 3.5
    const r = THREE.MathUtils.lerp(0.87, 0.72, t)
    const g = THREE.MathUtils.lerp(0.91, 0.76, t)
    const b = THREE.MathUtils.lerp(0.94, 0.80, t)
    return new THREE.Color(r, g, b)
  } else if (h < 12) {
    // Higher terrain — grey rock with snow patches
    const t = (h - 5) / 7
    const r = THREE.MathUtils.lerp(0.72, 0.55, t)
    const g = THREE.MathUtils.lerp(0.74, 0.56, t)
    const b = THREE.MathUtils.lerp(0.78, 0.60, t)
    return new THREE.Color(r, g, b)
  } else {
    // Mountain peaks — darker rock, snow streaks
    const t = Math.min(1, (h - 12) / 10)
    const r = THREE.MathUtils.lerp(0.55, 0.82, t * 0.4)
    const g = THREE.MathUtils.lerp(0.56, 0.84, t * 0.4)
    const b = THREE.MathUtils.lerp(0.60, 0.88, t * 0.4)
    return new THREE.Color(r, g, b)
  }
}

// ─── Heightfield for Rapier collider ─────────────────────────────────────────

function buildHeightfield(segments: number): Float32Array {
  const verts = segments + 1
  const heights = new Float32Array(verts * verts)
  const half = WORLD_SIZE / 2

  for (let row = 0; row < verts; row++) {
    for (let col = 0; col < verts; col++) {
      const wx = -half + (col / segments) * WORLD_SIZE
      const wz = -half + (row / segments) * WORLD_SIZE
      const depth = lakeDepthAt(wx, wz)
      heights[row * verts + col] = depth !== null ? -depth : terrainHeight(wx, wz)
    }
  }
  return heights
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Terrain() {
  const meshRef = useRef<THREE.Mesh>(null)
  const SEGMENTS = 160 // more segments for mountain detail

  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(WORLD_SIZE, WORLD_SIZE, SEGMENTS, SEGMENTS)
    geo.rotateX(-Math.PI / 2)

    const positions = geo.attributes.position as THREE.BufferAttribute
    const verts = SEGMENTS + 1
    const half = WORLD_SIZE / 2

    // Build per-vertex colour array
    const colors = new Float32Array(verts * verts * 3)

    for (let row = 0; row < verts; row++) {
      for (let col = 0; col < verts; col++) {
        const idx = row * verts + col
        const wx = -half + (col / SEGMENTS) * WORLD_SIZE
        const wz = -half + (row / SEGMENTS) * WORLD_SIZE

        const depth = lakeDepthAt(wx, wz)
        const onLake = depth !== null
        const y = onLake ? -depth : terrainHeight(wx, wz)

        positions.setY(idx, y)

        const color = heightToColor(y, onLake)
        colors[idx * 3 + 0] = color.r
        colors[idx * 3 + 1] = color.g
        colors[idx * 3 + 2] = color.b
      }
    }

    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    geo.computeVertexNormals()
    return geo
  }, [])

  // Vertex-coloured terrain material
  const material = useMemo(() => {
    return new THREE.MeshLambertMaterial({
      vertexColors: true,
      flatShading: false,
    })
  }, [])

  // ── Lakes ──────────────────────────────────────────────────────────────────

  // Main lake — larger, frozen with slight metalness
  const mainLakeGeo = useMemo(() => new THREE.CircleGeometry(29.5, 64), [])
  const mainLakeMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: new THREE.Color('#7ab5d0'),
    roughness: 0.1,
    metalness: 0.3,
    transparent: true,
    opacity: 0.88,
  }), [])

  // Small pond
  const pondGeo = useMemo(() => new THREE.CircleGeometry(11.5, 32), [])
  const pondMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: new THREE.Color('#8abfc8'),
    roughness: 0.15,
    metalness: 0.25,
    transparent: true,
    opacity: 0.82,
  }), [])

  // Ice crack lines on main lake — procedural LineSegments
  const crackGeo = useMemo(() => {
    const points: THREE.Vector3[] = []
    // Generate a set of random cracks radiating from centre
    for (let i = 0; i < 18; i++) {
      const angle = (i / 18) * Math.PI * 2
      const len = 5 + seededRandom(i * 3.71) * 18
      const wobble = seededRandom(i * 7.13) * 0.4
      // Each crack is 2-4 segments with slight bends
      const segs = 2 + Math.floor(seededRandom(i * 11.3) * 3)
      for (let s = 0; s < segs; s++) {
        const t0 = (s / segs) * len
        const t1 = ((s + 1) / segs) * len
        const a0 = angle + wobble * s
        const a1 = angle + wobble * (s + 1)
        points.push(
          new THREE.Vector3(Math.cos(a0) * t0, 0.02, Math.sin(a0) * t0),
          new THREE.Vector3(Math.cos(a1) * t1, 0.02, Math.sin(a1) * t1),
        )
      }
    }
    return new THREE.BufferGeometry().setFromPoints(points)
  }, [])

  const crackMat = useMemo(() => new THREE.LineBasicMaterial({
    color: '#4a7a95',
    transparent: true,
    opacity: 0.45,
  }), [])

  // Heightfield data for Rapier collider (exported via ref if needed)
  const heightfieldData = useMemo(() => buildHeightfield(SEGMENTS), [])
  void heightfieldData // suppress unused warning — consumed by physics system

  return (
    <group>
      {/* Terrain mesh with vertex colours */}
      <mesh
        ref={meshRef}
        geometry={geometry}
        material={material}
        receiveShadow
      />

      {/* Main frozen lake */}
      <mesh
        geometry={mainLakeGeo}
        material={mainLakeMat}
        position={[50, -0.28, 50]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      />

      {/* Ice cracks on main lake */}
      <lineSegments
        geometry={crackGeo}
        material={crackMat}
        position={[50, -0.26, 50]}
      />

      {/* Small pond */}
      <mesh
        geometry={pondGeo}
        material={pondMat}
        position={[-40, -0.24, 70]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      />
    </group>
  )
}
