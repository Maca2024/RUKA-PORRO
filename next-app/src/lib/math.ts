/**
 * RUKA-PORRO — Math utilities
 * Pure functions, zero dependencies, fully typed.
 */

import type { Vec3 } from '@/game/types/game'

// ─── Basic interpolation ──────────────────────────────────────────────────────

/**
 * Linear interpolation between a and b by factor t (unclamped).
 * t = 0 → a, t = 1 → b.
 */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

/**
 * Clamp x to the inclusive range [min, max].
 */
export function clamp(x: number, min: number, max: number): number {
  return Math.min(Math.max(x, min), max)
}

/**
 * Clamp x to [0, 1].
 */
export function saturate(x: number): number {
  return clamp(x, 0, 1)
}

/**
 * Smooth Hermite interpolation (Ken Perlin's smoothstep).
 * Result is clamped to [0, 1].
 */
export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = saturate((x - edge0) / (edge1 - edge0))
  return t * t * (3 - 2 * t)
}

/**
 * Smoother 6th-degree Hermite (C2-continuous, Perlin noise quality).
 */
export function smootherstep(edge0: number, edge1: number, x: number): number {
  const t = saturate((x - edge0) / (edge1 - edge0))
  return t * t * t * (t * (t * 6 - 15) + 10)
}

// ─── Easing ───────────────────────────────────────────────────────────────────

/**
 * Quadratic ease-in (slow start).
 */
export function easeIn(t: number): number {
  return t * t
}

/**
 * Quadratic ease-out (slow end).
 */
export function easeOut(t: number): number {
  return t * (2 - t)
}

/**
 * Quadratic ease-in-out (slow start and end).
 * t must be in [0, 1].
 */
export function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
}

/**
 * Cubic ease-in-out — smoother than quadratic for camera motion.
 */
export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

/**
 * Elastic ease-out — good for UI pop-in animations.
 */
export function easeOutElastic(t: number): number {
  if (t === 0 || t === 1) return t
  const c4 = (2 * Math.PI) / 3
  return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1
}

// ─── 3-D distance ─────────────────────────────────────────────────────────────

/**
 * Euclidean distance between two Vec3 points.
 */
export function distance3D(a: Vec3, b: Vec3): number {
  const dx = a.x - b.x
  const dy = a.y - b.y
  const dz = a.z - b.z
  return Math.sqrt(dx * dx + dy * dy + dz * dz)
}

/**
 * Squared distance — faster when you only need relative comparisons.
 */
export function distanceSq3D(a: Vec3, b: Vec3): number {
  const dx = a.x - b.x
  const dy = a.y - b.y
  const dz = a.z - b.z
  return dx * dx + dy * dy + dz * dz
}

/**
 * XZ (horizontal) distance, ignoring the Y axis.
 * Used for NPC notice radii where height is irrelevant.
 */
export function distanceXZ(a: Vec3, b: Vec3): number {
  const dx = a.x - b.x
  const dz = a.z - b.z
  return Math.sqrt(dx * dx + dz * dz)
}

// ─── Random ───────────────────────────────────────────────────────────────────

/**
 * Uniform random float in [min, max).
 */
export function randomRange(min: number, max: number): number {
  return min + Math.random() * (max - min)
}

/**
 * Random integer in [min, max] (both inclusive).
 */
export function randomInt(min: number, max: number): number {
  return Math.floor(randomRange(min, max + 1))
}

/**
 * Pick a random element from an array.
 * Returns undefined if the array is empty.
 */
export function randomChoice<T>(array: readonly T[]): T | undefined {
  if (array.length === 0) return undefined
  return array[Math.floor(Math.random() * array.length)]
}

/**
 * Gaussian (normal) random using Box-Muller transform.
 * Returns a value with mean 0 and stddev 1.
 */
export function randomGaussian(): number {
  let u = 0
  let v = 0
  while (u === 0) u = Math.random()
  while (v === 0) v = Math.random()
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)
}

// ─── Angle / rotation ─────────────────────────────────────────────────────────

/** Convert degrees to radians. */
export function degToRad(degrees: number): number {
  return degrees * (Math.PI / 180)
}

/** Convert radians to degrees. */
export function radToDeg(radians: number): number {
  return radians * (180 / Math.PI)
}

/**
 * Normalise an angle in radians to [-π, π].
 */
export function normalizeAngle(angle: number): number {
  let a = angle % (2 * Math.PI)
  if (a > Math.PI) a -= 2 * Math.PI
  if (a < -Math.PI) a += 2 * Math.PI
  return a
}

/**
 * Shortest angular lerp between two angles (radians).
 * Handles wrap-around correctly.
 */
export function lerpAngle(a: number, b: number, t: number): number {
  return a + normalizeAngle(b - a) * t
}

// ─── Vec3 helpers ─────────────────────────────────────────────────────────────

/** Add two Vec3s. */
export function addVec3(a: Vec3, b: Vec3): Vec3 {
  return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z }
}

/** Scale a Vec3 by a scalar. */
export function scaleVec3(v: Vec3, s: number): Vec3 {
  return { x: v.x * s, y: v.y * s, z: v.z * s }
}

/** Linear interpolation between two Vec3 points. */
export function lerpVec3(a: Vec3, b: Vec3, t: number): Vec3 {
  return {
    x: lerp(a.x, b.x, t),
    y: lerp(a.y, b.y, t),
    z: lerp(a.z, b.z, t),
  }
}

/** Magnitude (length) of a Vec3. */
export function magnitudeVec3(v: Vec3): number {
  return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z)
}

/** Normalise a Vec3 to unit length. Returns zero-vector if magnitude is ~0. */
export function normalizeVec3(v: Vec3): Vec3 {
  const mag = magnitudeVec3(v)
  if (mag < 1e-9) return { x: 0, y: 0, z: 0 }
  return { x: v.x / mag, y: v.y / mag, z: v.z / mag }
}

// ─── Misc ─────────────────────────────────────────────────────────────────────

/**
 * Map a value from one range to another.
 * inputMin → outputMin, inputMax → outputMax.
 */
export function mapRange(
  value: number,
  inputMin: number,
  inputMax: number,
  outputMin: number,
  outputMax: number,
  shouldClamp = false,
): number {
  const mapped = outputMin + ((value - inputMin) / (inputMax - inputMin)) * (outputMax - outputMin)
  return shouldClamp ? clamp(mapped, Math.min(outputMin, outputMax), Math.max(outputMin, outputMax)) : mapped
}

/**
 * Round a number to a given number of decimal places.
 */
export function roundTo(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals)
  return Math.round(value * factor) / factor
}

/**
 * Return true with a probability of `chance` (0–1).
 */
export function chance(probability: number): boolean {
  return Math.random() < probability
}
