'use client'

import { useNPCStore } from '@/game/stores/useNPCStore'
import { NPC_DEFINITIONS } from '@/game/data/npcs'
import { NPC } from './NPC'
import type { NPCId } from '@/game/types/game'

export function NPCManager() {
  const npcs = useNPCStore((s) => s.npcs)

  return (
    <group>
      {(Object.keys(npcs) as NPCId[]).map((id) => {
        const state = npcs[id]
        const def = NPC_DEFINITIONS[id]
        if (!def) return null

        return (
          <NPC
            key={id}
            id={id}
            position={[state.position.x, state.position.y, state.position.z]}
            color={def.color}
            modelType={def.modelType}
            trust={state.trust}
            name={def.name}
          />
        )
      })}
    </group>
  )
}
