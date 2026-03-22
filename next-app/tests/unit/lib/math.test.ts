import { describe, it, expect } from 'vitest'
import { lerp, clamp, smoothstep, distance3D, randomRange, distanceXZ } from '@/lib/math'

describe('math utilities', () => {
  describe('lerp', () => {
    it('returns start when t=0', () => {
      expect(lerp(0, 10, 0)).toBe(0)
    })
    it('returns end when t=1', () => {
      expect(lerp(0, 10, 1)).toBe(10)
    })
    it('returns midpoint when t=0.5', () => {
      expect(lerp(0, 10, 0.5)).toBe(5)
    })
    it('works with negative numbers', () => {
      expect(lerp(-10, 10, 0.5)).toBe(0)
    })
    it('extrapolates beyond 0-1', () => {
      expect(lerp(0, 10, 2)).toBe(20)
    })
  })

  describe('clamp', () => {
    it('returns value when within range', () => {
      expect(clamp(5, 0, 10)).toBe(5)
    })
    it('returns min when value below range', () => {
      expect(clamp(-5, 0, 10)).toBe(0)
    })
    it('returns max when value above range', () => {
      expect(clamp(15, 0, 10)).toBe(10)
    })
    it('handles equal min and max', () => {
      expect(clamp(5, 5, 5)).toBe(5)
    })
    it('handles negative ranges', () => {
      expect(clamp(-3, -10, -1)).toBe(-3)
    })
  })

  describe('smoothstep', () => {
    it('returns 0 at edge0', () => {
      expect(smoothstep(0, 1, 0)).toBe(0)
    })
    it('returns 1 at edge1', () => {
      expect(smoothstep(0, 1, 1)).toBe(1)
    })
    it('returns 0.5 at midpoint', () => {
      expect(smoothstep(0, 1, 0.5)).toBe(0.5)
    })
    it('clamps below edge0', () => {
      expect(smoothstep(0, 1, -1)).toBe(0)
    })
    it('clamps above edge1', () => {
      expect(smoothstep(0, 1, 2)).toBe(1)
    })
  })

  describe('distance3D', () => {
    it('returns 0 for same point', () => {
      expect(distance3D({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 0 })).toBe(0)
    })
    it('returns correct distance for 3-4-5 triangle', () => {
      expect(distance3D({ x: 0, y: 0, z: 0 }, { x: 3, y: 4, z: 0 })).toBe(5)
    })
    it('works with negative coords', () => {
      const d = distance3D({ x: -1, y: -1, z: -1 }, { x: 1, y: 1, z: 1 })
      expect(d).toBeCloseTo(Math.sqrt(12))
    })
  })

  describe('distanceXZ', () => {
    it('ignores Y component', () => {
      const d = distanceXZ({ x: 0, y: 0, z: 0 }, { x: 3, y: 999, z: 4 })
      expect(d).toBe(5)
    })
  })

  describe('randomRange', () => {
    it('returns value within range', () => {
      for (let i = 0; i < 100; i++) {
        const val = randomRange(5, 10)
        expect(val).toBeGreaterThanOrEqual(5)
        expect(val).toBeLessThanOrEqual(10)
      }
    })
    it('returns exact value when min equals max', () => {
      expect(randomRange(5, 5)).toBe(5)
    })
  })
})
