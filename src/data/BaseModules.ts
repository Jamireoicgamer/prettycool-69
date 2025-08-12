
import { BaseModule } from '@/types/GameTypes';

export const getInitialBaseModules = (): BaseModule[] => [
  {
    id: 'fusion-generator',
    name: 'Fusion Generator',
    type: 'power',
    level: 1,
    maxLevel: 5,
    isActive: true,
    description: 'Primary power source for the base. Each level increases fusion core power output by 20 units.',
    energyCost: 0,
    benefits: [
      'Level 1: 100 power per fusion core',
      'Each upgrade adds +20 power per fusion core',
      'Reduces power fluctuations',
      'Enables advanced module operations'
    ],
    upgradeRequirements: {
      caps: 200,
      techFrags: 5,
      materials: ['steel', 'circuitry']
    },
    lastProduction: Date.now(),
    productionProgress: 0
  },
  {
    id: 'recruitment-radio',
    name: 'Recruitment Radio',
    type: 'recruitment',
    level: 1,
    maxLevel: 3,
    isActive: true,
    description: 'Broadcasts recruitment signals to attract new operatives and workers.',
    energyCost: 15,
    benefits: [
      'Enables recruitment of squad members and workers',
      'Reduces recruitment costs by 10% per level',
      'Increases recruitment success rate'
    ],
    upgradeRequirements: {
      caps: 100,
      techFrags: 2,
      materials: ['circuitry']
    },
    recruitmentActive: false,
    lastProduction: Date.now(),
    productionProgress: 0
  },
  {
    id: 'workshop',
    name: 'Workshop',
    type: 'workshop',
    level: 1,
    maxLevel: 4,
    isActive: false,
    description: 'Equipment crafting and modification facility.',
    energyCost: 25,
    benefits: [
      'Enables weapon and armor crafting',
      'Improves equipment modification success rate',
      'Unlocks advanced crafting recipes per level'
    ],
    upgradeRequirements: {
      caps: 250,
      techFrags: 6,
      materials: ['steel', 'circuitry']
    },
    lastProduction: Date.now(),
    productionProgress: 0
  },
  {
    id: 'medical-facility',
    name: 'Medical Facility',
    type: 'medical-facility',
    level: 1,
    maxLevel: 5,
    isActive: false,
    description: 'Automated medical bay that passively heals squad members over time. Requires food and water to operate.',
    energyCost: 30,
    benefits: [
      'Level 1: Heals squad members at 10 HP per minute (base rate)',
      'Each level increases healing rate by 25% (Level 2: 12.5 HP/min, Level 5: 25 HP/min)',
      'With assigned worker: 50% faster healing',
      'Requires 1 food and 1 water per hour to operate',
      'Current efficiency displayed in real-time'
    ],
    upgradeRequirements: {
      caps: 300,
      techFrags: 8,
      materials: ['steel', 'circuitry']
    },
    lastProduction: Date.now(),
    productionProgress: 0,
    efficiency: 50,
    storedFood: 0,
    storedWater: 0
  },
  {
    id: 'food-production',
    name: 'Food Production Unit',
    type: 'food-production',
    level: 1,
    maxLevel: 5,
    isActive: false,
    description: 'Produces food for your base. Requires a worker for full efficiency. Each level increases production by 20%.',
    energyCost: 20,
    benefits: [
      'Produces 1 food per hour at 100% efficiency with worker',
      'Produces 0.5 food per hour at 50% efficiency without worker',
      'Efficiency increases by 20% per level',
      'Worker agility affects production speed'
    ],
    upgradeRequirements: {
      caps: 200,
      techFrags: 3,
      materials: ['steel']
    },
    lastProduction: Date.now(),
    productionProgress: 0,
    efficiency: 50
  },
  {
    id: 'water-purification',
    name: 'Water Purification Plant',
    type: 'water-purification',
    level: 1,
    maxLevel: 5,
    isActive: false,
    description: 'Purifies water for your base. Requires a worker for full efficiency. Each level increases production by 20%.',
    energyCost: 30,
    benefits: [
      'Produces 1 purified water per hour at 100% efficiency with worker',
      'Produces 0.5 purified water per hour at 50% efficiency without worker',
      'Efficiency increases by 20% per level',
      'Worker precipitation affects production speed'
    ],
    upgradeRequirements: {
      caps: 250,
      techFrags: 4,
      materials: ['steel', 'circuitry']
    },
    lastProduction: Date.now(),
    productionProgress: 0,
    efficiency: 50
  },
  {
    id: 'barracks',
    name: 'Barracks',
    type: 'barracks',
    level: 1,
    maxLevel: 5,
    isActive: true,
    description: 'Housing and training facility for squad members. Each level adds 2 more squad slots.',
    energyCost: 10,
    benefits: [
      'Provides 6 squad member slots at level 1',
      'Each upgrade adds 2 more squad member slots',
      'Improves squad member training efficiency',
      'Reduces squad member food and water consumption'
    ],
    upgradeRequirements: {
      caps: 300,
      techFrags: 4,
      materials: ['steel']
    },
    lastProduction: Date.now(),
    productionProgress: 0
  }
];
