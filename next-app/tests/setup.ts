/**
 * RUKA-PORRO — Vitest global test setup
 * Enables Immer plugins required by stores that use Map/Set state.
 * useMissionStore keeps storyFlags as a Set<string> inside an Immer store,
 * so MapSet support must be loaded before any store is imported.
 */

import { enableMapSet } from 'immer'

enableMapSet()
