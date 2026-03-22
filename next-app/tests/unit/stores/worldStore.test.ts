/**
 * RUKA-PORRO — useWorldStore unit tests
 * Covers: tick, setDayProgress, requestWeather, setWeatherImmediate,
 *         setWind, setActiveChunks, setReady, getTimeOfDay helper
 */

import { useWorldStore } from '@/game/stores/useWorldStore'
import { getTimeOfDay } from '@/game/types/game'
import {
  DAY_CYCLE_DURATION,
  WEATHER_TRANSITION_DURATION,
} from '@/game/core/constants'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function reset(overrides: Record<string, unknown> = {}) {
  useWorldStore.setState({
    dayProgress: 0.35,
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
    activeChunks: [],
    isReady: false,
    ...overrides,
  })
}

function get() {
  return useWorldStore.getState()
}

// ─── getTimeOfDay helper ──────────────────────────────────────────────────────

describe('getTimeOfDay — pure function', () => {
  it('returns night for progress < 0.2', () => {
    expect(getTimeOfDay(0)).toBe('night')
    expect(getTimeOfDay(0.1)).toBe('night')
    expect(getTimeOfDay(0.19)).toBe('night')
  })

  it('returns dawn for progress in [0.2, 0.3)', () => {
    expect(getTimeOfDay(0.2)).toBe('dawn')
    expect(getTimeOfDay(0.25)).toBe('dawn')
    expect(getTimeOfDay(0.299)).toBe('dawn')
  })

  it('returns day for progress in [0.3, 0.7)', () => {
    expect(getTimeOfDay(0.3)).toBe('day')
    expect(getTimeOfDay(0.5)).toBe('day')
    expect(getTimeOfDay(0.699)).toBe('day')
  })

  it('returns dusk for progress in [0.7, 0.8)', () => {
    expect(getTimeOfDay(0.7)).toBe('dusk')
    expect(getTimeOfDay(0.75)).toBe('dusk')
    expect(getTimeOfDay(0.799)).toBe('dusk')
  })

  it('returns night for progress >= 0.8', () => {
    expect(getTimeOfDay(0.8)).toBe('night')
    expect(getTimeOfDay(0.9)).toBe('night')
    expect(getTimeOfDay(0.999)).toBe('night')
  })
})

// ─── tick — day cycle ─────────────────────────────────────────────────────────

describe('useWorldStore — tick (day cycle)', () => {
  beforeEach(() => reset())

  it('advances dayProgress by delta / DAY_CYCLE_DURATION', () => {
    const before = get().dayProgress
    const delta = 60
    get().tick(delta)
    const expected = (before + delta / DAY_CYCLE_DURATION) % 1
    expect(get().dayProgress).toBeCloseTo(expected, 6)
  })

  it('wraps dayProgress back to ~0 when it passes 1.0', () => {
    // Set progress near end of day
    reset({ dayProgress: 0.999 })
    get().tick(DAY_CYCLE_DURATION * 0.01) // pushes past 1
    expect(get().dayProgress).toBeGreaterThanOrEqual(0)
    expect(get().dayProgress).toBeLessThan(0.1)
  })

  it('updates timeOfDay based on new dayProgress', () => {
    // Force into dawn range
    useWorldStore.setState((s) => ({ ...s, dayProgress: 0.19 }))
    get().tick(DAY_CYCLE_DURATION * 0.01) // advances into dawn (>= 0.2)
    expect(get().timeOfDay).toBe('dawn')
  })

  it('sets isDay true during day period', () => {
    reset({ dayProgress: 0.45 })
    get().tick(0.001)
    expect(get().isDay).toBe(true)
  })

  it('sets isDay true during dawn period', () => {
    reset({ dayProgress: 0.21 })
    get().tick(0.001)
    expect(get().isDay).toBe(true)
  })

  it('sets isDay false at night', () => {
    reset({ dayProgress: 0.85 })
    get().tick(0.001)
    expect(get().isDay).toBe(false)
  })

  it('sets isDay false at dusk', () => {
    reset({ dayProgress: 0.72 })
    get().tick(0.001)
    expect(get().isDay).toBe(false)
  })

  it('multiple small ticks accumulate correctly', () => {
    reset({ dayProgress: 0.35 })
    const smallDelta = 10
    const iterations = 6
    for (let i = 0; i < iterations; i++) {
      get().tick(smallDelta)
    }
    const expected = (0.35 + (smallDelta * iterations) / DAY_CYCLE_DURATION) % 1
    expect(get().dayProgress).toBeCloseTo(expected, 5)
  })
})

// ─── setDayProgress ───────────────────────────────────────────────────────────

describe('useWorldStore — setDayProgress', () => {
  beforeEach(() => reset())

  it('sets dayProgress to the given value', () => {
    get().setDayProgress(0.6)
    expect(get().dayProgress).toBeCloseTo(0.6, 6)
  })

  it('clamps to 0 for negative values', () => {
    get().setDayProgress(-0.5)
    expect(get().dayProgress).toBe(0)
  })

  it('clamps to 1 for values above 1', () => {
    get().setDayProgress(1.5)
    expect(get().dayProgress).toBe(1)
  })

  it('updates timeOfDay and isDay consistently', () => {
    get().setDayProgress(0.85) // night
    expect(get().timeOfDay).toBe('night')
    expect(get().isDay).toBe(false)
  })
})

// ─── requestWeather / weather transitions ─────────────────────────────────────

describe('useWorldStore — requestWeather', () => {
  beforeEach(() => reset())

  it('sets target weather and resets transitionProgress to 0', () => {
    get().requestWeather('blizzard')
    expect(get().weather.target).toBe('blizzard')
    expect(get().weather.transitionProgress).toBe(0)
  })

  it('is a no-op if already targeting the same weather with complete transition', () => {
    // Already at light-snow with transitionProgress == 1
    const before = { ...get().weather }
    get().requestWeather('light-snow')
    expect(get().weather.transitionProgress).toBe(before.transitionProgress)
  })

  it('tick advances transitionProgress toward 1', () => {
    get().requestWeather('blizzard')
    expect(get().weather.transitionProgress).toBe(0)
    get().tick(WEATHER_TRANSITION_DURATION * 0.5)
    expect(get().weather.transitionProgress).toBeCloseTo(0.5, 1)
  })

  it('commits current weather type when transition completes', () => {
    get().requestWeather('blizzard')
    // Advance enough to complete the transition
    get().tick(WEATHER_TRANSITION_DURATION + 1)
    expect(get().weather.current).toBe('blizzard')
    expect(get().weather.transitionProgress).toBeCloseTo(1, 2)
  })

  it('blends snowIntensity during transition', () => {
    // Start from clear (snowIntensity=0), transition to blizzard (snowIntensity=1)
    get().setWeatherImmediate('clear')
    get().requestWeather('blizzard')
    get().tick(WEATHER_TRANSITION_DURATION * 0.5)
    // At 50% — snowIntensity should be ~0.5
    expect(get().weather.snowIntensity).toBeGreaterThan(0)
    expect(get().weather.snowIntensity).toBeLessThan(1)
  })

  it('blends temperature during transition', () => {
    get().setWeatherImmediate('clear') // temp -8
    get().requestWeather('blizzard')   // target temp -28
    get().tick(WEATHER_TRANSITION_DURATION * 0.5)
    const temp = get().weather.temperature
    expect(temp).toBeLessThan(-8)
    expect(temp).toBeGreaterThan(-28)
  })
})

// ─── setWeatherImmediate ──────────────────────────────────────────────────────

describe('useWorldStore — setWeatherImmediate', () => {
  beforeEach(() => reset())

  it('immediately sets current and target to the given type', () => {
    get().setWeatherImmediate('blizzard')
    expect(get().weather.current).toBe('blizzard')
    expect(get().weather.target).toBe('blizzard')
  })

  it('sets transitionProgress to 1 (complete)', () => {
    get().setWeatherImmediate('blizzard')
    expect(get().weather.transitionProgress).toBe(1)
  })

  it('sets correct snowIntensity for blizzard (1.0)', () => {
    get().setWeatherImmediate('blizzard')
    expect(get().weather.snowIntensity).toBe(1.0)
  })

  it('sets correct snowIntensity for clear (0)', () => {
    get().setWeatherImmediate('clear')
    expect(get().weather.snowIntensity).toBe(0)
  })

  it('sets correct temperature for blizzard (-28)', () => {
    get().setWeatherImmediate('blizzard')
    expect(get().weather.temperature).toBe(-28)
  })

  it('sets correct visibility for blizzard (20)', () => {
    get().setWeatherImmediate('blizzard')
    expect(get().weather.visibility).toBe(20)
  })

  it('sets correct visibility for clear (500)', () => {
    get().setWeatherImmediate('clear')
    expect(get().weather.visibility).toBe(500)
  })
})

// ─── setWind ──────────────────────────────────────────────────────────────────

describe('useWorldStore — setWind', () => {
  beforeEach(() => reset())

  it('normalises the wind direction vector', () => {
    get().setWind(3, 4, 10)
    const dir = get().weather.windDirection
    const mag = Math.sqrt(dir.x * dir.x + dir.z * dir.z)
    expect(mag).toBeCloseTo(1, 5)
  })

  it('sets x component correctly after normalisation (3-4-5 triangle)', () => {
    get().setWind(3, 4, 10)
    expect(get().weather.windDirection.x).toBeCloseTo(0.6, 5)
  })

  it('sets z component correctly after normalisation (3-4-5 triangle)', () => {
    get().setWind(3, 4, 10)
    expect(get().weather.windDirection.z).toBeCloseTo(0.8, 5)
  })

  it('clamps strength to minimum 0', () => {
    get().setWind(1, 0, -5)
    expect(get().weather.windStrength).toBe(0)
  })

  it('accepts positive strength', () => {
    get().setWind(1, 0, 7)
    expect(get().weather.windStrength).toBe(7)
  })
})

// ─── setActiveChunks / setReady ───────────────────────────────────────────────

describe('useWorldStore — setActiveChunks and setReady', () => {
  beforeEach(() => reset())

  it('updates activeChunks list', () => {
    get().setActiveChunks(['0_0', '1_0', '0_1'])
    expect(get().activeChunks).toEqual(['0_0', '1_0', '0_1'])
  })

  it('replaces previous chunk list', () => {
    get().setActiveChunks(['0_0'])
    get().setActiveChunks(['1_1', '2_2'])
    expect(get().activeChunks).toHaveLength(2)
    expect(get().activeChunks).not.toContain('0_0')
  })

  it('sets isReady to true', () => {
    get().setReady(true)
    expect(get().isReady).toBe(true)
  })

  it('sets isReady to false', () => {
    useWorldStore.setState((s) => ({ ...s, isReady: true }))
    get().setReady(false)
    expect(get().isReady).toBe(false)
  })
})
