'use client'

import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'

// ─── Frost patches ────────────────────────────────────────────────────────────

const FROST_COUNT = 30
const LOG_COUNT = 10

// NPC spawn points — used for footprint impressions
const NPC_SPAWN_POINTS: [number, number][] = [
  [0, 30],   // Sieni
  [-20, 15], // Sammal
  [25, -10], // Karen
  [-15, -25],// Yuki
  [10, 50],  // Taisto
]

function buildFrostPositions(): Float32Array {
  const arr = new Float32Array(FROST_COUNT * 3)
  // Deterministic seeded
  let s = 1337
  const rand = () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
  for (let i = 0; i < FROST_COUNT; i++) {
    const i3 = i * 3
    arr[i3] = (rand() - 0.5) * 180
    arr[i3 + 1] = 0.02 // just above ground
    arr[i3 + 2] = (rand() - 0.5) * 180
  }
  return arr
}

interface LogSpec {
  x: number
  y: number
  z: number
  rotY: number
  length: number
  radius: number
}

function buildLogSpecs(): LogSpec[] {
  let s = 9001
  const rand = () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }

  const specs: LogSpec[] = []
  // Keep logs in forested area — roughly x -80..80, z -80..80
  for (let i = 0; i < LOG_COUNT; i++) {
    specs.push({
      x: (rand() - 0.5) * 160,
      y: 0.28,
      z: (rand() - 0.5) * 160,
      rotY: rand() * Math.PI,
      length: 2.5 + rand() * 3.5,
      radius: 0.25 + rand() * 0.2,
    })
  }
  return specs
}

// ─── Component ────────────────────────────────────────────────────────────────

export function GroundDetails() {
  // ── Frost patches (InstancedMesh of flat circles) ───────────────────────
  const frostMeshRef = useRef<THREE.InstancedMesh>(null)
  const frostPositions = useMemo(buildFrostPositions, [])

  const frostGeo = useMemo(() => {
    return new THREE.CircleGeometry(1, 12)
  }, [])

  const frostMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(0xd0e8ff),
        transparent: true,
        opacity: 0.32,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
    [],
  )

  // ── Footprint impressions (small flat ellipses near NPC spawns) ──────────
  const footprintMeshRef = useRef<THREE.InstancedMesh>(null)
  const FOOTPRINT_COUNT = NPC_SPAWN_POINTS.length * 4 // 4 imprints per NPC

  const footprintGeo = useMemo(() => {
    return new THREE.CircleGeometry(0.18, 6)
  }, [])

  const footprintMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(0xa8bfd0),
        transparent: true,
        opacity: 0.45,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
    [],
  )

  // ── Fallen logs ──────────────────────────────────────────────────────────
  const logSpecs = useMemo(buildLogSpecs, [])
  const logMeshRef = useRef<THREE.InstancedMesh>(null)
  const snowLogMeshRef = useRef<THREE.InstancedMesh>(null)

  // Logs are horizontal cylinders — we use a shared unit cylinder
  const logGeo = useMemo(() => {
    return new THREE.CylinderGeometry(0.5, 0.5, 1, 8)
  }, [])

  const logMat = useMemo(
    () =>
      new THREE.MeshLambertMaterial({
        color: new THREE.Color(0x4a3020),
      }),
    [],
  )

  // Snow on top of logs — flat half-cylinder
  const snowLogGeo = useMemo(() => {
    return new THREE.CylinderGeometry(0.52, 0.52, 1, 8, 1, false, 0, Math.PI)
  }, [])

  const snowLogMat = useMemo(
    () =>
      new THREE.MeshLambertMaterial({
        color: new THREE.Color(0xe8eaf0),
      }),
    [],
  )

  // ── Instance matrix setup ────────────────────────────────────────────────
  const initialised = useRef(false)

  useFrame(() => {
    if (initialised.current) return
    if (
      !frostMeshRef.current ||
      !footprintMeshRef.current ||
      !logMeshRef.current ||
      !snowLogMeshRef.current
    ) return

    initialised.current = true

    const dummy = new THREE.Object3D()

    // Frost patches
    for (let i = 0; i < FROST_COUNT; i++) {
      const i3 = i * 3
      const scaleX = 1.2 + (i % 7) * 0.4
      const scaleZ = 0.8 + (i % 5) * 0.3
      dummy.position.set(frostPositions[i3], 0.02, frostPositions[i3 + 2])
      dummy.rotation.set(-Math.PI / 2, 0, (i * 0.7) % (Math.PI * 2))
      dummy.scale.set(scaleX, scaleZ, 1)
      dummy.updateMatrix()
      frostMeshRef.current.setMatrixAt(i, dummy.matrix)
    }
    frostMeshRef.current.instanceMatrix.needsUpdate = true

    // Footprints — a rough trail around each NPC spawn
    let fi = 0
    for (const [nx, nz] of NPC_SPAWN_POINTS) {
      for (let step = 0; step < 4; step++) {
        const angle = (step / 4) * Math.PI * 0.6 + (fi * 0.3)
        const dist = 0.5 + step * 0.55
        dummy.position.set(
          nx + Math.cos(angle) * dist,
          0.025,
          nz + Math.sin(angle) * dist,
        )
        dummy.rotation.set(-Math.PI / 2, 0, angle)
        dummy.scale.set(0.9, 1.3, 1)
        dummy.updateMatrix()
        footprintMeshRef.current.setMatrixAt(fi, dummy.matrix)
        fi++
      }
    }
    footprintMeshRef.current.instanceMatrix.needsUpdate = true

    // Fallen logs — horizontal: rotate around Z, scale Y = length, XZ = radius
    for (let i = 0; i < LOG_COUNT; i++) {
      const spec = logSpecs[i]

      // Log body
      dummy.position.set(spec.x, spec.y, spec.z)
      dummy.rotation.set(0, spec.rotY, Math.PI / 2) // lay on its side
      dummy.scale.set(spec.radius, spec.length, spec.radius)
      dummy.updateMatrix()
      logMeshRef.current.setMatrixAt(i, dummy.matrix)

      // Snow on top
      dummy.position.set(spec.x, spec.y + spec.radius * 0.9, spec.z)
      dummy.rotation.set(0, spec.rotY, Math.PI / 2)
      dummy.scale.set(spec.radius * 1.02, spec.length, spec.radius * 1.02)
      dummy.updateMatrix()
      snowLogMeshRef.current.setMatrixAt(i, dummy.matrix)
    }
    logMeshRef.current.instanceMatrix.needsUpdate = true
    snowLogMeshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <group>
      {/* Frost patches */}
      <instancedMesh
        ref={frostMeshRef}
        args={[frostGeo, frostMat, FROST_COUNT]}
        renderOrder={1}
      />

      {/* Footprint impressions */}
      <instancedMesh
        ref={footprintMeshRef}
        args={[footprintGeo, footprintMat, FOOTPRINT_COUNT]}
        renderOrder={2}
      />

      {/* Fallen logs */}
      <instancedMesh
        ref={logMeshRef}
        args={[logGeo, logMat, LOG_COUNT]}
        castShadow
        receiveShadow
      />

      {/* Snow on logs */}
      <instancedMesh
        ref={snowLogMeshRef}
        args={[snowLogGeo, snowLogMat, LOG_COUNT]}
        receiveShadow
      />
    </group>
  )
}
