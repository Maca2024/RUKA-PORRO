'use client'

import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { WORLD_SIZE, TREE_COUNT, COLORS } from '@/game/core/constants'
import { randomRange } from '@/lib/math'

interface TreeData {
  position: [number, number, number]
  height: number
  scale: number
  rotation: number
}

function isOnLake(x: number, z: number): boolean {
  const dx = x - 50
  const dz = z - 50
  return dx * dx + dz * dz <= 1600 // radius 40 exclusion zone around lake
}

function isNearCenter(x: number, z: number): boolean {
  return x * x + z * z <= 100 // keep spawn area clear
}

function generateTrees(count: number): TreeData[] {
  const trees: TreeData[] = []
  const half = WORLD_SIZE / 2 - 10
  let attempts = 0

  // Use a deterministic seed pattern
  let seedState = 42
  const nextRand = () => {
    seedState = (seedState * 1664525 + 1013904223) & 0xffffffff
    return ((seedState >>> 0) / 0xffffffff)
  }

  while (trees.length < count && attempts < count * 6) {
    attempts++
    const x = (nextRand() - 0.5) * 2 * half
    const z = (nextRand() - 0.5) * 2 * half

    if (isOnLake(x, z) || isNearCenter(x, z)) continue

    const height = 4 + nextRand() * 4 // 4–8 units
    const scale = 0.7 + nextRand() * 0.6
    const rotation = nextRand() * Math.PI * 2

    trees.push({ position: [x, 0, z], height, scale, rotation })
  }
  return trees
}

// Single pine tree as merged geometry for instancing
function buildTreeGeometry(height: number): THREE.BufferGeometry {
  const geo = new THREE.ConeGeometry(height * 0.35, height * 0.7, 6)
  geo.translate(0, height * 0.55, 0)
  return geo
}

export function TreeForest() {
  const trees = useMemo(() => generateTrees(TREE_COUNT), [])

  // Foliage instances
  const foliageMeshRef = useRef<THREE.InstancedMesh>(null)
  const trunkMeshRef = useRef<THREE.InstancedMesh>(null)
  const snowCapMeshRef = useRef<THREE.InstancedMesh>(null)

  const foliageGeo = useMemo(() => new THREE.ConeGeometry(1.5, 5, 7), [])
  const trunkGeo = useMemo(() => new THREE.CylinderGeometry(0.2, 0.3, 2, 6), [])
  const snowCapGeo = useMemo(() => new THREE.ConeGeometry(0.8, 1.2, 7), [])

  const foliageMat = useMemo(
    () => new THREE.MeshLambertMaterial({ color: new THREE.Color(COLORS.pine) }),
    [],
  )
  const trunkMat = useMemo(
    () => new THREE.MeshLambertMaterial({ color: new THREE.Color(COLORS.bark) }),
    [],
  )
  const snowCapMat = useMemo(
    () =>
      new THREE.MeshLambertMaterial({
        color: new THREE.Color('#eef2f8'),
        transparent: true,
        opacity: 0.92,
      }),
    [],
  )

  // Set instance transforms once after mount
  useMemo(() => {
    const dummy = new THREE.Object3D()

    trees.forEach((tree, i) => {
      const [x, , z] = tree.position
      const h = tree.height
      const s = tree.scale

      // Foliage cone — centred mid-height
      dummy.position.set(x, h * 0.5 * s, z)
      dummy.scale.set(s, s * (h / 5), s)
      dummy.rotation.y = tree.rotation
      dummy.updateMatrix()
      foliageMeshRef.current?.setMatrixAt(i, dummy.matrix)

      // Trunk cylinder
      dummy.position.set(x, h * 0.1 * s, z)
      dummy.scale.set(s, s * (h / 5) * 0.35, s)
      dummy.rotation.y = 0
      dummy.updateMatrix()
      trunkMeshRef.current?.setMatrixAt(i, dummy.matrix)

      // Snow cap on top
      dummy.position.set(x, h * 0.88 * s, z)
      dummy.scale.set(s * 0.65, s * 0.3, s * 0.65)
      dummy.rotation.y = tree.rotation
      dummy.updateMatrix()
      snowCapMeshRef.current?.setMatrixAt(i, dummy.matrix)
    })

    if (foliageMeshRef.current) foliageMeshRef.current.instanceMatrix.needsUpdate = true
    if (trunkMeshRef.current) trunkMeshRef.current.instanceMatrix.needsUpdate = true
    if (snowCapMeshRef.current) snowCapMeshRef.current.instanceMatrix.needsUpdate = true
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trees])

  return (
    <group>
      <instancedMesh
        ref={foliageMeshRef}
        args={[foliageGeo, foliageMat, TREE_COUNT]}
        castShadow
        receiveShadow
      />
      <instancedMesh
        ref={trunkMeshRef}
        args={[trunkGeo, trunkMat, TREE_COUNT]}
        castShadow
      />
      <instancedMesh
        ref={snowCapMeshRef}
        args={[snowCapGeo, snowCapMat, TREE_COUNT]}
        castShadow
      />
    </group>
  )
}
