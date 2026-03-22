'use client'

import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'

// ─── Types ────────────────────────────────────────────────────────────────────

interface RockSpec {
  x: number
  z: number
  scale: number
  rotY: number
  tiltX: number
  tiltZ: number
}

const ROCK_COUNT = 50

// ─── Deterministic spec builder ───────────────────────────────────────────────

function buildRockSpecs(): RockSpec[] {
  let s = 42
  const rand = () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }

  const specs: RockSpec[] = []

  // Cluster 1: lake shore ring — lake is roughly centred at (30, -30) r≈18
  for (let i = 0; i < 14; i++) {
    const angle = (i / 14) * Math.PI * 2 + rand() * 0.5
    const r = 18 + rand() * 6 - 3
    specs.push({
      x: 30 + Math.cos(angle) * r,
      z: -30 + Math.sin(angle) * r,
      scale: 0.5 + rand() * 1.2,
      rotY: rand() * Math.PI * 2,
      tiltX: (rand() - 0.5) * 0.4,
      tiltZ: (rand() - 0.5) * 0.3,
    })
  }

  // Cluster 2: mountain base — mountain at roughly (0, -60) r≈25
  for (let i = 0; i < 16; i++) {
    const angle = rand() * Math.PI * 2
    const r = 20 + rand() * 12
    specs.push({
      x: Math.cos(angle) * r,
      z: -60 + Math.sin(angle) * r,
      scale: 0.8 + rand() * 2.2,
      rotY: rand() * Math.PI * 2,
      tiltX: (rand() - 0.5) * 0.35,
      tiltZ: (rand() - 0.5) * 0.25,
    })
  }

  // Cluster 3: scattered forest floor
  for (let i = 0; i < 20; i++) {
    specs.push({
      x: (rand() - 0.5) * 160,
      z: (rand() - 0.5) * 160,
      scale: 0.5 + rand() * 1.0,
      rotY: rand() * Math.PI * 2,
      tiltX: (rand() - 0.5) * 0.3,
      tiltZ: (rand() - 0.5) * 0.2,
    })
  }

  return specs
}

// ─── Geometry helpers ─────────────────────────────────────────────────────────

function makeJitteredRockGeo(amount: number): THREE.BufferGeometry {
  const geo = new THREE.DodecahedronGeometry(1, 0)
  const pos = geo.attributes.position as THREE.BufferAttribute
  const arr = pos.array as Float32Array
  for (let i = 0; i < arr.length; i++) {
    arr[i] += (Math.random() - 0.5) * amount
  }
  pos.needsUpdate = true
  geo.computeVertexNormals()
  return geo
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Rocks() {
  const specs = useMemo(buildRockSpecs, [])

  const stoneMat = useMemo(
    () => new THREE.MeshLambertMaterial({ color: new THREE.Color(0x6b6e75) }),
    [],
  )

  const snowMat = useMemo(
    () => new THREE.MeshLambertMaterial({ color: new THREE.Color(0xe8eaf0) }),
    [],
  )

  const rockGeo = useMemo(() => makeJitteredRockGeo(0.18), [])

  // Snow cap: open half-sphere sitting on top of the rock
  const snowCapGeo = useMemo(
    () => new THREE.SphereGeometry(1, 7, 5, 0, Math.PI * 2, 0, Math.PI * 0.42),
    [],
  )

  const rocksMeshRef = useRef<THREE.InstancedMesh>(null)
  const snowCapsMeshRef = useRef<THREE.InstancedMesh>(null)
  const initialised = useRef(false)

  useFrame(() => {
    if (initialised.current) return
    if (!rocksMeshRef.current || !snowCapsMeshRef.current) return
    initialised.current = true

    const dummy = new THREE.Object3D()
    for (let i = 0; i < ROCK_COUNT; i++) {
      const spec = specs[i]
      if (!spec) continue

      // Rock body — partially buried (y offset = half its scale minus a bit)
      dummy.position.set(spec.x, spec.scale * 0.48 - 0.25, spec.z)
      dummy.rotation.set(spec.tiltX, spec.rotY, spec.tiltZ)
      dummy.scale.setScalar(spec.scale)
      dummy.updateMatrix()
      rocksMeshRef.current.setMatrixAt(i, dummy.matrix)

      // Snow cap — flat dome resting on top
      dummy.position.set(spec.x, spec.scale * 0.88, spec.z)
      dummy.rotation.set(-Math.PI * 0.04, spec.rotY, 0)
      dummy.scale.set(spec.scale * 0.74, spec.scale * 0.3, spec.scale * 0.74)
      dummy.updateMatrix()
      snowCapsMeshRef.current.setMatrixAt(i, dummy.matrix)
    }

    rocksMeshRef.current.instanceMatrix.needsUpdate = true
    snowCapsMeshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <group>
      <instancedMesh
        ref={rocksMeshRef}
        args={[rockGeo, stoneMat, ROCK_COUNT]}
        castShadow
        receiveShadow
      />
      <instancedMesh
        ref={snowCapsMeshRef}
        args={[snowCapGeo, snowMat, ROCK_COUNT]}
        receiveShadow
      />
    </group>
  )
}
