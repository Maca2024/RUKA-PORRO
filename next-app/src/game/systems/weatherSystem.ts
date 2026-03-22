/**
 * RUKA-PORRO — Weather system
 * Manages autonomous weather transitions and rotating wind direction.
 * The store (useWorldStore) already handles the lerp math in its own tick();
 * this system is responsible for *deciding* when to queue new weather changes
 * and for gently rotating the wind over time.
 *
 * Called by GameLoop with (delta) in seconds.
 */

import { useWorldStore } from '../stores/useWorldStore'
import { randomRange } from '@/lib/math'
import { DAY_CYCLE_DURATION, WEATHER_TRANSITION_DURATION } from '../core/constants'
import type { WeatherType } from '../types/game'

// ─── Probability tables ────────────────────────────────────────────────────────

/**
 * For each current weather type, the probability weights of the *next* weather.
 * Weights need not sum to 1 — they are normalised at runtime.
 */
const TRANSITION_WEIGHTS: Record<WeatherType, Record<WeatherType, number>> = {
  'clear': {
    'clear': 2,
    'light-snow': 4,
    'heavy-snow': 1,
    'blizzard': 0,
  },
  'light-snow': {
    'clear': 2,
    'light-snow': 3,
    'heavy-snow': 3,
    'blizzard': 1,
  },
  'heavy-snow': {
    'clear': 1,
    'light-snow': 3,
    'heavy-snow': 2,
    'blizzard': 2,
  },
  'blizzard': {
    'clear': 0,
    'light-snow': 2,
    'heavy-snow': 3,
    'blizzard': 1,
  },
}

/** Pick next weather using weighted random selection. */
function pickNextWeather(current: WeatherType): WeatherType {
  const weights = TRANSITION_WEIGHTS[current]
  const types = Object.keys(weights) as WeatherType[]
  const totalWeight = types.reduce((sum, t) => sum + weights[t], 0)

  let roll = Math.random() * totalWeight
  for (const type of types) {
    roll -= weights[type]
    if (roll <= 0) return type
  }
  // Fallback (floating-point rounding)
  return types[types.length - 1]
}

// ─── Internal state ────────────────────────────────────────────────────────────

/** Seconds until the next weather change is triggered. */
let nextChangeIn: number = randomRange(60, 120)

/** Current wind direction angle in radians. */
let windAngle: number = randomRange(0, Math.PI * 2)

/** Rate at which wind angle rotates — radians per second. */
const WIND_ROTATION_SPEED = 0.04

// ─── System ───────────────────────────────────────────────────────────────────

export const weatherSystem = {
  /**
   * Main per-frame tick. Delegates the actual number-crunching to
   * useWorldStore.tick() and only manages *when* to request transitions.
   */
  tick(delta: number): void {
    const store = useWorldStore.getState()

    // Let the world store advance day progress and lerp weather parameters
    store.tick(delta)

    // Rotate wind angle slowly — gives a sense of a living environment
    windAngle = (windAngle + WIND_ROTATION_SPEED * delta) % (Math.PI * 2)

    // Night-time amplifies wind strength by up to 40 %
    const nightMultiplier = !store.isDay ? 1.4 : 1.0
    const baseStrength = store.weather.windStrength
    store.setWind(
      Math.sin(windAngle),
      Math.cos(windAngle),
      baseStrength * nightMultiplier,
    )

    // Only trigger new weather changes when no transition is already underway
    if (store.weather.transitionProgress < 1) return

    nextChangeIn -= delta
    if (nextChangeIn <= 0) {
      const next = pickNextWeather(store.weather.current)
      this.transitionTo(next)
      // Next change: 60–120 s, but blizzards clear faster (30–60 s)
      nextChangeIn = store.weather.current === 'blizzard'
        ? randomRange(30, 60)
        : randomRange(60, 120)
    }
  },

  /**
   * Request a smooth transition to the given weather type.
   * The store handles the interpolation over WEATHER_TRANSITION_DURATION seconds.
   */
  transitionTo(target: WeatherType): void {
    useWorldStore.getState().requestWeather(target)
  },

  /**
   * Force-snap to a weather type immediately (no crossfade).
   * Used by cutscenes and debug tooling.
   */
  setImmediate(target: WeatherType): void {
    useWorldStore.getState().setWeatherImmediate(target)
    // Reset the change timer so we don't immediately override the forced weather
    nextChangeIn = randomRange(90, 150)
  },

  /**
   * Advance the internal day cycle by `seconds` (useful for time-skip cutscenes).
   * One in-game day = DAY_CYCLE_DURATION real seconds.
   */
  skipTime(seconds: number): void {
    const store = useWorldStore.getState()
    const advance = seconds / DAY_CYCLE_DURATION
    const next = (store.dayProgress + advance) % 1
    store.setDayProgress(next)
  },
}
