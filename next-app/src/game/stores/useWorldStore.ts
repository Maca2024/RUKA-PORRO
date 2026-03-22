'use client'

/**
 * RUKA-PORRO — World store
 * Manages the day/night cycle, weather transitions, chunk loading,
 * and the global "world ready" flag.
 */

import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { WeatherType, TimeOfDay } from '../types/game'
import { getTimeOfDay } from '../types/game'
import {
  WORLD_SIZE,
  DAY_CYCLE_DURATION,
  WEATHER_TRANSITION_DURATION,
} from '../core/constants'
import { clamp } from '@/lib/math'

// ─── Types ────────────────────────────────────────────────────────────────────

interface WeatherRuntimeState {
  current: WeatherType
  /** Target weather we are transitioning toward */
  target: WeatherType
  windDirection: { x: number; z: number }
  windStrength: number
  temperature: number
  /** 0–1, how far along the transition we are */
  transitionProgress: number
  snowIntensity: number
  /** Estimated metres of visibility */
  visibility: number
}

interface WorldStoreState {
  // Time
  /** 0.0 = midnight, 0.5 = noon, 1.0 = next midnight */
  dayProgress: number
  timeOfDay: TimeOfDay
  isDay: boolean

  // Weather
  weather: WeatherRuntimeState

  // Chunks
  worldSize: number
  activeChunks: string[]

  // Readiness
  isReady: boolean

  // ── Actions ──────────────────────────────────────────────────────────────

  /**
   * Advance the day cycle and weather transitions.
   * Called by the R3F useFrame loop with the raw Three.js delta (seconds).
   */
  tick: (delta: number) => void

  /** Instantly set the day progress (0–1). Used by debug tools / cutscenes. */
  setDayProgress: (v: number) => void

  /** Queue a weather change. The transition takes WEATHER_TRANSITION_DURATION seconds. */
  requestWeather: (type: WeatherType) => void

  /** Immediately snap to a weather type with no transition. */
  setWeatherImmediate: (type: WeatherType) => void

  /** Update wind direction vector (will be normalised internally). */
  setWind: (x: number, z: number, strength: number) => void

  /** Register which terrain chunks are currently loaded. */
  setActiveChunks: (chunks: string[]) => void

  /** Mark the world scene as fully loaded and ready for gameplay. */
  setReady: (v: boolean) => void
}

// ─── Weather parameter tables ─────────────────────────────────────────────────

interface WeatherParams {
  snowIntensity: number
  windStrength: number
  temperature: number
  visibility: number
}

const WEATHER_PARAMS: Record<WeatherType, WeatherParams> = {
  'clear': {
    snowIntensity: 0,
    windStrength: 1.5,
    temperature: -8,
    visibility: 500,
  },
  'light-snow': {
    snowIntensity: 0.3,
    windStrength: 3,
    temperature: -12,
    visibility: 200,
  },
  'heavy-snow': {
    snowIntensity: 0.7,
    windStrength: 6,
    temperature: -18,
    visibility: 80,
  },
  'blizzard': {
    snowIntensity: 1.0,
    windStrength: 14,
    temperature: -28,
    visibility: 20,
  },
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useWorldStore = create<WorldStoreState>()(
  immer((set) => ({
    dayProgress: 0.35, // start at ~08:00 (dawn into day)
    timeOfDay: 'day',
    isDay: true,

    weather: {
      current: 'light-snow',
      target: 'light-snow',
      windDirection: { x: 0.6, z: 0.4 },
      windStrength: 3,
      temperature: -12,
      transitionProgress: 1,
      snowIntensity: 0.3,
      visibility: 200,
    },

    worldSize: WORLD_SIZE,
    activeChunks: [],
    isReady: false,

    // ── Tick ───────────────────────────────────────────────────────────────

    tick(delta) {
      set((s) => {
        // Advance day cycle (wraps 0→1)
        s.dayProgress = (s.dayProgress + delta / DAY_CYCLE_DURATION) % 1
        s.timeOfDay = getTimeOfDay(s.dayProgress)
        s.isDay = s.timeOfDay === 'day' || s.timeOfDay === 'dawn'

        // Advance weather transition
        const w = s.weather
        if (w.transitionProgress < 1) {
          w.transitionProgress = clamp(
            w.transitionProgress + delta / WEATHER_TRANSITION_DURATION,
            0,
            1,
          )

          const from = WEATHER_PARAMS[w.current]
          const to = WEATHER_PARAMS[w.target]
          const t = w.transitionProgress

          // Linearly blend weather parameters
          w.snowIntensity = from.snowIntensity + (to.snowIntensity - from.snowIntensity) * t
          w.windStrength = from.windStrength + (to.windStrength - from.windStrength) * t
          w.temperature = from.temperature + (to.temperature - from.temperature) * t
          w.visibility = from.visibility + (to.visibility - from.visibility) * t

          // Commit the new weather type when transition is complete
          if (w.transitionProgress >= 1) {
            w.current = w.target
          }
        }
      })
    },

    // ── Time control ───────────────────────────────────────────────────────

    setDayProgress(v) {
      set((s) => {
        s.dayProgress = clamp(v, 0, 1)
        s.timeOfDay = getTimeOfDay(s.dayProgress)
        s.isDay = s.timeOfDay === 'day' || s.timeOfDay === 'dawn'
      })
    },

    // ── Weather control ────────────────────────────────────────────────────

    requestWeather(type) {
      set((s) => {
        if (s.weather.target === type && s.weather.transitionProgress >= 1) return
        s.weather.target = type
        s.weather.transitionProgress = 0
      })
    },

    setWeatherImmediate(type) {
      set((s) => {
        const params = WEATHER_PARAMS[type]
        s.weather.current = type
        s.weather.target = type
        s.weather.transitionProgress = 1
        s.weather.snowIntensity = params.snowIntensity
        s.weather.windStrength = params.windStrength
        s.weather.temperature = params.temperature
        s.weather.visibility = params.visibility
      })
    },

    setWind(x, z, strength) {
      set((s) => {
        const mag = Math.sqrt(x * x + z * z)
        if (mag > 0) {
          s.weather.windDirection = { x: x / mag, z: z / mag }
        }
        s.weather.windStrength = Math.max(0, strength)
      })
    },

    // ── Chunks ─────────────────────────────────────────────────────────────

    setActiveChunks(chunks) {
      set((s) => { s.activeChunks = chunks })
    },

    // ── Readiness ──────────────────────────────────────────────────────────

    setReady(v) {
      set((s) => { s.isReady = v })
    },
  })),
)

// ─── Selector helpers ─────────────────────────────────────────────────────────

export const selectWeather = (s: WorldStoreState) => s.weather
export const selectDayProgress = (s: WorldStoreState) => s.dayProgress
export const selectTimeOfDay = (s: WorldStoreState) => s.timeOfDay
export const selectIsDay = (s: WorldStoreState) => s.isDay
