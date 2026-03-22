'use client'

import { useMemo, useRef, type RefObject } from 'react'
import * as THREE from 'three'
import { WORLD_SIZE } from '@/game/core/constants'

// ─── Constants ────────────────────────────────────────────────────────────────

const TOTAL_TREES = 800

// Type split (must sum to 1.0)
const TALL_SPRUCE_RATIO = 0.60
const WIDE_SPRUCE_RATIO = 0.25
// Birch fills the rest: 0.15

const TALL_SPRUCE_COUNT = Math.round(TOTAL_TREES * TALL_SPRUCE_RATIO)
const WIDE_SPRUCE_COUNT = Math.round(TOTAL_TREES * WIDE_SPRUCE_RATIO)
const BIRCH_COUNT = TOTAL_TREES - TALL_SPRUCE_COUNT - WIDE_SPRUCE_COUNT

const BUSH_COUNT = 50

// ─── Deterministic PRNG ───────────────────────────────────────────────────────

class SeededRandom {
  private state: number

  constructor(seed: number) {
    this.state = seed >>> 0
  }

  next(): number {
    this.state = (Math.imul(this.state, 1664525) + 1013904223) >>> 0
    return this.state / 0xffffffff
  }

  range(min: number, max: number): number {
    return min + this.next() * (max - min)
  }
}

// ─── Placement helpers ────────────────────────────────────────────────────────

function isOnLake(x: number, z: number): boolean {
  // Main lake
  const dx1 = x - 50; const dz1 = z - 50
  if (dx1 * dx1 + dz1 * dz1 <= 1764) return true // r=42 exclusion
  // Small pond
  const dx2 = x + 40; const dz2 = z - 70
  if (dx2 * dx2 + dz2 * dz2 <= 289) return true // r=17 exclusion
  return false
}

function isNearCenter(x: number, z: number): boolean {
  return x * x + z * z <= 100 // keep spawn area clear
}

// ─── Clustered placement with Poisson-disc feel ───────────────────────────────

interface PlacedTree {
  x: number
  z: number
  rotation: number
  scale: number
}

function placeTrees(count: number, rng: SeededRandom, scaleMin: number, scaleMax: number): PlacedTree[] {
  const half = WORLD_SIZE / 2 - 12
  const result: PlacedTree[] = []
  let attempts = 0

  // Cluster centres — trees are denser near these
  const clusterCount = Math.ceil(count / 20)
  const clusters: Array<{ x: number; z: number }> = []
  for (let i = 0; i < clusterCount; i++) {
    let cx = 0; let cz = 0; let valid = false
    for (let a = 0; a < 20; a++) {
      cx = rng.range(-half, half)
      cz = rng.range(-half, half)
      if (!isOnLake(cx, cz) && !isNearCenter(cx, cz)) { valid = true; break }
    }
    if (valid) clusters.push({ x: cx, z: cz })
  }

  while (result.length < count && attempts < count * 10) {
    attempts++

    let x: number
    let z: number

    if (clusters.length > 0 && rng.next() < 0.70) {
      // 70% chance: place near a cluster centre
      const c = clusters[Math.floor(rng.next() * clusters.length)]
      const spread = rng.range(2, 35)
      const angle = rng.next() * Math.PI * 2
      x = c.x + Math.cos(angle) * spread
      z = c.z + Math.sin(angle) * spread
    } else {
      // 30% chance: fully random scatter
      x = rng.range(-half, half)
      z = rng.range(-half, half)
    }

    if (isOnLake(x, z) || isNearCenter(x, z)) continue
    if (Math.abs(x) > half || Math.abs(z) > half) continue

    result.push({
      x,
      z,
      rotation: rng.next() * Math.PI * 2,
      scale: rng.range(scaleMin, scaleMax),
    })
  }

  return result
}

// ─── Geometry builders ────────────────────────────────────────────────────────

// Tall spruce: 3 stacked cones (classic Finnish taiga shape)
function buildTallSpruceGeos(): THREE.ConeGeometry[] {
  return [
    new THREE.ConeGeometry(1.1, 4.0, 7), // bottom tier
    new THREE.ConeGeometry(0.8, 3.2, 7), // middle tier
    new THREE.ConeGeometry(0.5, 2.4, 7), // top tier
  ]
}

// Wide spruce: 2 stacked cones, bushier
function buildWideSpruceGeos(): THREE.ConeGeometry[] {
  return [
    new THREE.ConeGeometry(1.4, 3.2, 7), // bottom tier
    new THREE.ConeGeometry(0.9, 2.4, 7), // top tier
  ]
}

// Birch crown — small sphere-like low-poly cone
function buildBirchCrownGeo(): THREE.ConeGeometry {
  return new THREE.ConeGeometry(0.7, 2.0, 6)
}

// Birch trunk — thin cylinder
function buildBirchTrunkGeo(): THREE.CylinderGeometry {
  return new THREE.CylinderGeometry(0.06, 0.1, 1, 5)
}

// Spruce trunk
function buildSpruceTrunkGeo(): THREE.CylinderGeometry {
  return new THREE.CylinderGeometry(0.15, 0.25, 1, 6)
}

// Bush — tiny squat cone for ground cover
function buildBushGeo(): THREE.ConeGeometry {
  return new THREE.ConeGeometry(0.6, 0.9, 5)
}

// ─── Component ────────────────────────────────────────────────────────────────

export function TreeForest() {
  const tallTrees = useMemo(() => {
    const r = new SeededRandom(101)
    return placeTrees(TALL_SPRUCE_COUNT, r, 0.8, 1.6)
  }, [])

  const wideTrees = useMemo(() => {
    const r = new SeededRandom(202)
    return placeTrees(WIDE_SPRUCE_COUNT, r, 0.7, 1.3)
  }, [])

  const birchTrees = useMemo(() => {
    const r = new SeededRandom(303)
    return placeTrees(BIRCH_COUNT, r, 0.6, 1.2)
  }, [])

  const bushPositions = useMemo(() => {
    const r = new SeededRandom(404)
    return placeTrees(BUSH_COUNT, r, 0.5, 1.1)
  }, [])

  // ── Geometries ──────────────────────────────────────────────────────────────

  const tallSpruceGeos = useMemo(() => buildTallSpruceGeos(), [])
  const wideSpruceGeos = useMemo(() => buildWideSpruceGeos(), [])
  const birchCrownGeo = useMemo(() => buildBirchCrownGeo(), [])
  const birchTrunkGeo = useMemo(() => buildBirchTrunkGeo(), [])
  const spruceTrunkGeo = useMemo(() => buildSpruceTrunkGeo(), [])
  const bushGeo = useMemo(() => buildBushGeo(), [])

  // ── Materials ───────────────────────────────────────────────────────────────

  // Dark spruce foliage — slight colour variation via two mats
  const tallFoliageMat = useMemo(() => new THREE.MeshLambertMaterial({
    color: new THREE.Color('#1a4d2e'),
  }), [])

  const wideFoliageMat = useMemo(() => new THREE.MeshLambertMaterial({
    color: new THREE.Color('#2d6b3f'),
  }), [])

  // Snow cap — blue-white
  const snowCapMat = useMemo(() => new THREE.MeshLambertMaterial({
    color: new THREE.Color('#e8f0ff'),
    transparent: true,
    opacity: 0.92,
  }), [])

  // Spruce trunk — dark brown
  const spruceTrunkMat = useMemo(() => new THREE.MeshLambertMaterial({
    color: new THREE.Color('#3d2b1a'),
  }), [])

  // Birch trunk — white bark
  const birchTrunkMat = useMemo(() => new THREE.MeshLambertMaterial({
    color: new THREE.Color('#e8e0d0'),
  }), [])

  // Birch crown — pale gold-green
  const birchCrownMat = useMemo(() => new THREE.MeshLambertMaterial({
    color: new THREE.Color('#b8c475'),
  }), [])

  // Bush — muted dark green with snow
  const bushMat = useMemo(() => new THREE.MeshLambertMaterial({
    color: new THREE.Color('#d4dce8'),
  }), [])

  // ── InstancedMesh refs ──────────────────────────────────────────────────────

  // Tall spruce: 3 tiers + trunk + snow caps per tier
  const tallTier0 = useRef<THREE.InstancedMesh>(null)
  const tallTier1 = useRef<THREE.InstancedMesh>(null)
  const tallTier2 = useRef<THREE.InstancedMesh>(null)
  const tallSnow0 = useRef<THREE.InstancedMesh>(null)
  const tallSnow1 = useRef<THREE.InstancedMesh>(null)
  const tallSnow2 = useRef<THREE.InstancedMesh>(null)
  const tallTrunk = useRef<THREE.InstancedMesh>(null)

  // Wide spruce: 2 tiers + trunk + snow caps
  const wideTier0 = useRef<THREE.InstancedMesh>(null)
  const wideTier1 = useRef<THREE.InstancedMesh>(null)
  const wideSnow0 = useRef<THREE.InstancedMesh>(null)
  const wideSnow1 = useRef<THREE.InstancedMesh>(null)
  const wideTrunk = useRef<THREE.InstancedMesh>(null)

  // Birch
  const birchCrown = useRef<THREE.InstancedMesh>(null)
  const birchTrunk = useRef<THREE.InstancedMesh>(null)
  const birchSnow = useRef<THREE.InstancedMesh>(null)

  // Bushes
  const bushMesh = useRef<THREE.InstancedMesh>(null)

  // ── Set transforms on mount ─────────────────────────────────────────────────

  useMemo(() => {
    const dummy = new THREE.Object3D()
    const localRng = new SeededRandom(999)

    // ── Tall spruce ──────────────────────────────────────────────────────────
    // Heights: 8–14 units total (scale applied)
    tallTrees.forEach((t, i) => {
      const s = t.scale
      const baseH = localRng.range(8, 14) * s
      // Tier heights (bottom of each cone, from ground up)
      // Bottom tier: 0 to baseH*0.42
      // Middle tier: baseH*0.30 to baseH*0.68
      // Top tier: baseH*0.55 to baseH*0.92

      const tierOffsets = [0.21, 0.49, 0.73] // centre Y of each cone in normalised units
      const tierScales  = [s * 1.0, s * 0.78, s * 0.58]
      const tierRots    = [t.rotation, t.rotation + 0.4, t.rotation + 0.8]

      const setTier = (ref: RefObject<THREE.InstancedMesh | null>, tier: number) => {
        if (!ref.current) return
        dummy.position.set(t.x, tierOffsets[tier] * baseH, t.z)
        dummy.scale.set(tierScales[tier], tierScales[tier], tierScales[tier])
        dummy.rotation.y = tierRots[tier]
        dummy.updateMatrix()
        ref.current.setMatrixAt(i, dummy.matrix)
      }

      setTier(tallTier0, 0)
      setTier(tallTier1, 1)
      setTier(tallTier2, 2)

      // Snow caps (slightly smaller than foliage, on top of each tier)
      const setSnow = (ref: RefObject<THREE.InstancedMesh | null>, tier: number) => {
        if (!ref.current) return
        const sf = tierScales[tier] * 0.55
        dummy.position.set(t.x, (tierOffsets[tier] + 0.09) * baseH, t.z)
        dummy.scale.set(sf, sf, sf)
        dummy.rotation.y = tierRots[tier] + 0.2
        dummy.updateMatrix()
        ref.current.setMatrixAt(i, dummy.matrix)
      }

      setSnow(tallSnow0, 0)
      setSnow(tallSnow1, 1)
      setSnow(tallSnow2, 2)

      // Trunk
      if (tallTrunk.current) {
        const trunkH = baseH * 0.22
        dummy.position.set(t.x, trunkH * 0.5, t.z)
        dummy.scale.set(s, s * trunkH, s)
        dummy.rotation.y = 0
        dummy.updateMatrix()
        tallTrunk.current.setMatrixAt(i, dummy.matrix)
      }
    })

    if (tallTier0.current) tallTier0.current.instanceMatrix.needsUpdate = true
    if (tallTier1.current) tallTier1.current.instanceMatrix.needsUpdate = true
    if (tallTier2.current) tallTier2.current.instanceMatrix.needsUpdate = true
    if (tallSnow0.current) tallSnow0.current.instanceMatrix.needsUpdate = true
    if (tallSnow1.current) tallSnow1.current.instanceMatrix.needsUpdate = true
    if (tallSnow2.current) tallSnow2.current.instanceMatrix.needsUpdate = true
    if (tallTrunk.current) tallTrunk.current.instanceMatrix.needsUpdate = true

    // ── Wide spruce ──────────────────────────────────────────────────────────
    // Heights: 5–8 units total
    wideTrees.forEach((t, i) => {
      const s = t.scale
      const baseH = localRng.range(5, 8) * s

      const tierOffsets = [0.25, 0.60]
      const tierScales  = [s * 1.0, s * 0.65]

      const setWide = (ref: RefObject<THREE.InstancedMesh | null>, tier: number) => {
        if (!ref.current) return
        dummy.position.set(t.x, tierOffsets[tier] * baseH, t.z)
        dummy.scale.set(tierScales[tier], tierScales[tier], tierScales[tier])
        dummy.rotation.y = t.rotation + tier * 0.5
        dummy.updateMatrix()
        ref.current.setMatrixAt(i, dummy.matrix)
      }

      setWide(wideTier0, 0)
      setWide(wideTier1, 1)

      const setWideSnow = (ref: RefObject<THREE.InstancedMesh | null>, tier: number) => {
        if (!ref.current) return
        const sf = tierScales[tier] * 0.55
        dummy.position.set(t.x, (tierOffsets[tier] + 0.10) * baseH, t.z)
        dummy.scale.set(sf, sf, sf)
        dummy.rotation.y = t.rotation + tier * 0.5 + 0.3
        dummy.updateMatrix()
        ref.current.setMatrixAt(i, dummy.matrix)
      }

      setWideSnow(wideSnow0, 0)
      setWideSnow(wideSnow1, 1)

      if (wideTrunk.current) {
        const trunkH = baseH * 0.28
        dummy.position.set(t.x, trunkH * 0.5, t.z)
        dummy.scale.set(s, s * trunkH, s)
        dummy.rotation.y = 0
        dummy.updateMatrix()
        wideTrunk.current.setMatrixAt(i, dummy.matrix)
      }
    })

    if (wideTier0.current) wideTier0.current.instanceMatrix.needsUpdate = true
    if (wideTier1.current) wideTier1.current.instanceMatrix.needsUpdate = true
    if (wideSnow0.current) wideSnow0.current.instanceMatrix.needsUpdate = true
    if (wideSnow1.current) wideSnow1.current.instanceMatrix.needsUpdate = true
    if (wideTrunk.current) wideTrunk.current.instanceMatrix.needsUpdate = true

    // ── Birch ────────────────────────────────────────────────────────────────
    // Height: 5–9 units. Thin white trunk, pale crown.
    birchTrees.forEach((t, i) => {
      const s = t.scale
      const totalH = localRng.range(5, 9) * s
      const trunkH = totalH * 0.72
      const crownH = totalH * 0.35

      if (birchTrunk.current) {
        dummy.position.set(t.x, trunkH * 0.5, t.z)
        dummy.scale.set(s, s * trunkH, s)
        dummy.rotation.y = 0
        dummy.updateMatrix()
        birchTrunk.current.setMatrixAt(i, dummy.matrix)
      }

      if (birchCrown.current) {
        dummy.position.set(t.x, trunkH + crownH * 0.5, t.z)
        dummy.scale.set(s * 1.1, s * 1.1, s * 1.1)
        dummy.rotation.y = t.rotation
        dummy.updateMatrix()
        birchCrown.current.setMatrixAt(i, dummy.matrix)
      }

      if (birchSnow.current) {
        const sf = s * 0.6
        dummy.position.set(t.x, trunkH + crownH * 0.85, t.z)
        dummy.scale.set(sf, sf, sf)
        dummy.rotation.y = t.rotation + 0.5
        dummy.updateMatrix()
        birchSnow.current.setMatrixAt(i, dummy.matrix)
      }
    })

    if (birchTrunk.current) birchTrunk.current.instanceMatrix.needsUpdate = true
    if (birchCrown.current) birchCrown.current.instanceMatrix.needsUpdate = true
    if (birchSnow.current) birchSnow.current.instanceMatrix.needsUpdate = true

    // ── Bushes ───────────────────────────────────────────────────────────────
    bushPositions.forEach((b, i) => {
      if (!bushMesh.current) return
      const s = b.scale
      dummy.position.set(b.x, 0.35 * s, b.z)
      dummy.scale.set(s, s, s)
      dummy.rotation.y = b.rotation
      dummy.updateMatrix()
      bushMesh.current.setMatrixAt(i, dummy.matrix)
    })

    if (bushMesh.current) bushMesh.current.instanceMatrix.needsUpdate = true

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tallTrees, wideTrees, birchTrees, bushPositions])

  return (
    <group>
      {/* ── Tall spruce foliage ── */}
      <instancedMesh ref={tallTier0} args={[tallSpruceGeos[0], tallFoliageMat, TALL_SPRUCE_COUNT]} castShadow receiveShadow />
      <instancedMesh ref={tallTier1} args={[tallSpruceGeos[1], tallFoliageMat, TALL_SPRUCE_COUNT]} castShadow receiveShadow />
      <instancedMesh ref={tallTier2} args={[tallSpruceGeos[2], tallFoliageMat, TALL_SPRUCE_COUNT]} castShadow receiveShadow />

      {/* ── Tall spruce snow caps ── */}
      <instancedMesh ref={tallSnow0} args={[tallSpruceGeos[0], snowCapMat, TALL_SPRUCE_COUNT]} castShadow />
      <instancedMesh ref={tallSnow1} args={[tallSpruceGeos[1], snowCapMat, TALL_SPRUCE_COUNT]} castShadow />
      <instancedMesh ref={tallSnow2} args={[tallSpruceGeos[2], snowCapMat, TALL_SPRUCE_COUNT]} castShadow />

      {/* ── Tall spruce trunks ── */}
      <instancedMesh ref={tallTrunk} args={[spruceTrunkGeo, spruceTrunkMat, TALL_SPRUCE_COUNT]} castShadow />

      {/* ── Wide spruce foliage ── */}
      <instancedMesh ref={wideTier0} args={[wideSpruceGeos[0], wideFoliageMat, WIDE_SPRUCE_COUNT]} castShadow receiveShadow />
      <instancedMesh ref={wideTier1} args={[wideSpruceGeos[1], wideFoliageMat, WIDE_SPRUCE_COUNT]} castShadow receiveShadow />

      {/* ── Wide spruce snow caps ── */}
      <instancedMesh ref={wideSnow0} args={[wideSpruceGeos[0], snowCapMat, WIDE_SPRUCE_COUNT]} castShadow />
      <instancedMesh ref={wideSnow1} args={[wideSpruceGeos[1], snowCapMat, WIDE_SPRUCE_COUNT]} castShadow />

      {/* ── Wide spruce trunks ── */}
      <instancedMesh ref={wideTrunk} args={[spruceTrunkGeo, spruceTrunkMat, WIDE_SPRUCE_COUNT]} castShadow />

      {/* ── Birch crowns ── */}
      <instancedMesh ref={birchCrown} args={[birchCrownGeo, birchCrownMat, BIRCH_COUNT]} castShadow receiveShadow />
      <instancedMesh ref={birchSnow} args={[birchCrownGeo, snowCapMat, BIRCH_COUNT]} castShadow />

      {/* ── Birch trunks ── */}
      <instancedMesh ref={birchTrunk} args={[birchTrunkGeo, birchTrunkMat, BIRCH_COUNT]} castShadow />

      {/* ── Ground bushes ── */}
      <instancedMesh ref={bushMesh} args={[bushGeo, bushMat, BUSH_COUNT]} castShadow receiveShadow />
    </group>
  )
}
