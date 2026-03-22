'use client'

import { Terrain } from './Terrain'
import { TreeForest } from './TreeForest'
import { SnowParticles } from './SnowParticles'
import { AuroraBorealis } from './AuroraBorealis'
import { DayNightCycle } from './DayNightCycle'
import { FoodPatches } from '../Items/FoodPatches'
import { Rocks } from './Rocks'
import { GroundDetails } from './GroundDetails'

export function World() {
  return (
    <group>
      <DayNightCycle />
      <Terrain />
      <TreeForest />
      <Rocks />
      <GroundDetails />
      <SnowParticles />
      <AuroraBorealis />
      <FoodPatches />
    </group>
  )
}
