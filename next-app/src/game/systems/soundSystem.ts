/**
 * RUKA-PORRO — Sound system
 * Singleton using Howler.js.
 * Manages: ambient layer, music layer, SFX pools (4 instances each for overlap).
 *
 * Intended usage:
 *   soundSystem.init()          — call once after page load
 *   soundSystem.tick(delta)     — call every frame from GameLoop
 *   soundSystem.dispose()       — call on unmount / hot-reload
 */

import { Howl, Howler } from 'howler'
import type { WeatherType, TimeOfDay, SurfaceType } from '../types/game'

// ─── Types ────────────────────────────────────────────────────────────────────

/** A pool of N Howl instances for a single sound, enabling overlapping playback. */
type HowlPool = Howl[]

// ─── Asset paths ──────────────────────────────────────────────────────────────
// All audio assets are expected under /public/audio/.
// Using placeholder paths that can be swapped for real files.

const AMBIENT_PATHS: Record<string, string> = {
  wind_light: '/audio/ambient/wind_light.mp3',
  wind_heavy: '/audio/ambient/wind_heavy.mp3',
  storm: '/audio/ambient/storm.mp3',
  forest_calm: '/audio/ambient/forest_calm.mp3',
}

const MUSIC_PATHS: Record<string, string> = {
  peaceful: '/audio/music/peaceful.mp3',
  tense: '/audio/music/tense.mp3',
  corruption: '/audio/music/corruption.mp3',
}

const SFX_PATHS: Record<string, string> = {
  'item-collect': '/audio/sfx/item_collect.mp3',
  'mission-complete': '/audio/sfx/mission_complete.mp3',
  'trust-up': '/audio/sfx/trust_up.mp3',
  'trust-down': '/audio/sfx/trust_down.mp3',
  'jump': '/audio/sfx/jump.mp3',
  'land': '/audio/sfx/land.mp3',
  'eat': '/audio/sfx/eat.mp3',
  'footstep_snow': '/audio/sfx/footstep_snow.mp3',
  'footstep_ice': '/audio/sfx/footstep_ice.mp3',
  'footstep_grass': '/audio/sfx/footstep_grass.mp3',
  'footstep_rock': '/audio/sfx/footstep_rock.mp3',
  'dialogue_open': '/audio/sfx/dialogue_open.mp3',
  'corruption_tick': '/audio/sfx/corruption_tick.mp3',
}

const POOL_SIZE = 4

// ─── Internal crossfade helper ────────────────────────────────────────────────

interface CrossfadeState {
  outgoing: Howl | null
  incoming: Howl | null
  /** 0–1 progress (1 = complete) */
  progress: number
  durationMs: number
}

function stepCrossfade(cf: CrossfadeState, delta: number, targetVolume: number): CrossfadeState {
  if (cf.progress >= 1) return cf

  const step = delta * 1000 / cf.durationMs
  const newProgress = Math.min(1, cf.progress + step)

  if (cf.outgoing) cf.outgoing.volume(targetVolume * (1 - newProgress))
  if (cf.incoming) cf.incoming.volume(targetVolume * newProgress)

  if (newProgress >= 1) {
    if (cf.outgoing) {
      cf.outgoing.stop()
      cf.outgoing.unload()
    }
  }

  return { ...cf, progress: newProgress }
}

// ─── SoundSystemClass ─────────────────────────────────────────────────────────

class SoundSystemClass {
  private initialised = false

  private ambient: Howl | null = null
  private ambientCrossfade: CrossfadeState = { outgoing: null, incoming: null, progress: 1, durationMs: 3000 }

  private music: Howl | null = null
  private musicCrossfade: CrossfadeState = { outgoing: null, incoming: null, progress: 1, durationMs: 4000 }

  private sfxPool: Map<string, HowlPool> = new Map()

  musicVolume = 0.5
  sfxVolume = 0.7

  /** Track current ambient/music keys to avoid restarting identical layers. */
  private currentAmbientKey = ''
  private currentMusicKey = ''

  // ─── Initialisation ────────────────────────────────────────────────────────

  init(): void {
    if (this.initialised) return
    this.initialised = true

    // Preload SFX pools
    for (const [id, src] of Object.entries(SFX_PATHS)) {
      const pool: HowlPool = []
      for (let i = 0; i < POOL_SIZE; i++) {
        pool.push(new Howl({
          src: [src],
          volume: this.sfxVolume,
          preload: true,
          // Suppress 404 errors in development when audio files don't exist yet
          onloaderror: () => { /* silent */ },
        }))
      }
      this.sfxPool.set(id, pool)
    }

    // Start with calm forest ambient
    this._startAmbient('forest_calm')
  }

  // ─── Per-frame tick ────────────────────────────────────────────────────────

  /**
   * Advance crossfade transitions. Call from GameLoop.
   */
  tick(delta: number): void {
    if (!this.initialised) return

    this.ambientCrossfade = stepCrossfade(this.ambientCrossfade, delta, this.musicVolume * 0.6)
    this.musicCrossfade = stepCrossfade(this.musicCrossfade, delta, this.musicVolume)

    // Update ambient reference once crossfade completes
    if (this.ambientCrossfade.progress >= 1 && this.ambientCrossfade.incoming) {
      this.ambient = this.ambientCrossfade.incoming
    }
    if (this.musicCrossfade.progress >= 1 && this.musicCrossfade.incoming) {
      this.music = this.musicCrossfade.incoming
    }
  }

  // ─── Weather-driven ambient ────────────────────────────────────────────────

  /**
   * Switch ambient layer based on current weather.
   */
  setWeather(weather: WeatherType): void {
    const keyMap: Record<WeatherType, string> = {
      'clear': 'forest_calm',
      'light-snow': 'wind_light',
      'heavy-snow': 'wind_heavy',
      'blizzard': 'storm',
    }
    const key = keyMap[weather]
    if (key !== this.currentAmbientKey) {
      this._crossfadeAmbient(key)
    }
  }

  // ─── Music mood ────────────────────────────────────────────────────────────

  /**
   * Pick and crossfade the music track based on corruption level and time of day.
   */
  setMusicMood(corruption: number, timeOfDay: TimeOfDay): void {
    let key: string

    if (corruption >= 70) {
      key = 'corruption'
    } else if (corruption >= 30 || timeOfDay === 'night') {
      key = 'tense'
    } else {
      key = 'peaceful'
    }

    if (key !== this.currentMusicKey) {
      this._crossfadeMusic(key)
    }
  }

  // ─── Footsteps ────────────────────────────────────────────────────────────

  /**
   * Play a footstep sound for the given surface type.
   * Applies ±10 % pitch variation for naturalness.
   */
  playFootstep(surface: SurfaceType): void {
    const sfxId = `footstep_${surface}` as keyof typeof SFX_PATHS
    const pool = this.sfxPool.get(sfxId)
    if (!pool) return

    const howl = this._getFreeInstance(pool)
    if (!howl) return

    // ±10 % pitch variation
    const rate = 0.9 + Math.random() * 0.2
    howl.rate(rate)
    howl.volume(this.sfxVolume * (0.8 + Math.random() * 0.2))
    howl.play()
  }

  // ─── General SFX ──────────────────────────────────────────────────────────

  /**
   * Play a named one-shot SFX.
   * Valid IDs: 'item-collect', 'mission-complete', 'trust-up', 'trust-down',
   *            'jump', 'land', 'eat', 'dialogue_open', 'corruption_tick'
   */
  playSFX(id: string): void {
    const pool = this.sfxPool.get(id)
    if (!pool) return

    const howl = this._getFreeInstance(pool)
    if (!howl) return

    howl.volume(this.sfxVolume)
    howl.play()
  }

  // ─── Volume control ────────────────────────────────────────────────────────

  setVolumes(music: number, sfx: number): void {
    this.musicVolume = Math.max(0, Math.min(1, music))
    this.sfxVolume = Math.max(0, Math.min(1, sfx))

    // Apply immediately to active streams
    if (this.music) this.music.volume(this.musicVolume)
    if (this.ambient) this.ambient.volume(this.musicVolume * 0.6)

    // Update all SFX pool volumes
    for (const pool of this.sfxPool.values()) {
      for (const howl of pool) {
        howl.volume(this.sfxVolume)
      }
    }

    // Sync global Howler volume (affects all instances)
    Howler.volume(1.0) // per-instance volumes already set above
  }

  // ─── Cleanup ───────────────────────────────────────────────────────────────

  dispose(): void {
    if (this.ambient) { this.ambient.stop(); this.ambient.unload() }
    if (this.music) { this.music.stop(); this.music.unload() }

    for (const pool of this.sfxPool.values()) {
      for (const howl of pool) {
        howl.stop()
        howl.unload()
      }
    }
    this.sfxPool.clear()

    this.ambient = null
    this.music = null
    this.currentAmbientKey = ''
    this.currentMusicKey = ''
    this.initialised = false
  }

  // ─── Private helpers ───────────────────────────────────────────────────────

  private _startAmbient(key: string): void {
    const src = AMBIENT_PATHS[key]
    if (!src) return

    const howl = new Howl({
      src: [src],
      loop: true,
      volume: this.musicVolume * 0.6,
      onloaderror: () => { /* silent */ },
    })
    howl.play()
    this.ambient = howl
    this.currentAmbientKey = key
  }

  private _crossfadeAmbient(key: string): void {
    const src = AMBIENT_PATHS[key]
    if (!src) return

    const incoming = new Howl({
      src: [src],
      loop: true,
      volume: 0,
      onloaderror: () => { /* silent */ },
    })
    incoming.play()

    this.ambientCrossfade = {
      outgoing: this.ambient,
      incoming,
      progress: 0,
      durationMs: 3000,
    }
    this.ambient = incoming
    this.currentAmbientKey = key
  }

  private _crossfadeMusic(key: string): void {
    const src = MUSIC_PATHS[key]
    if (!src) return

    const incoming = new Howl({
      src: [src],
      loop: true,
      volume: 0,
      onloaderror: () => { /* silent */ },
    })
    incoming.play()

    this.musicCrossfade = {
      outgoing: this.music,
      incoming,
      progress: 0,
      durationMs: 4000,
    }
    this.music = incoming
    this.currentMusicKey = key
  }

  /** Return the first Howl instance in the pool that is not currently playing. */
  private _getFreeInstance(pool: HowlPool): Howl | null {
    for (const howl of pool) {
      if (!howl.playing()) return howl
    }
    // All instances busy — steal the oldest (first in array)
    const oldest = pool[0]
    oldest.stop()
    return oldest
  }
}

// ─── Singleton export ─────────────────────────────────────────────────────────

export const soundSystem = new SoundSystemClass()
