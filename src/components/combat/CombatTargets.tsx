import React from 'react';

export interface CombatTarget {
  id: string;
  name: string;
  faction: string;
  difficulty: number;
  minLevel: number;
  minSquadSize: number;
  rewards: { caps: number; scrip?: number; experience: number; items?: string[] };
  description: string;
  enemyCount: number;
  location: string;
  loot: string[];
  type: 'raider' | 'mutant' | 'robot' | 'creature' | 'faction' | 'legendary';
  unlockLevel: number;
  enemies: Array<{
    name: string;
    health: number;
    damage: number;
    accuracy: number;
    fireRate: number;
    weapon?: string;
  }>;
}

export const COMBAT_TARGETS: CombatTarget[] = [
  // Early Game (Level 1-3)
  {
    id: 'raiders-camp',
    name: 'Raider Camp',
    faction: 'Raiders',
    difficulty: 1,
    minLevel: 1,
    minSquadSize: 1,
    rewards: { caps: 50, experience: 20, items: ['scrap-metal', 'damaged-32-pistol'] },
    description: 'Small group of raiders harassing traders',
    enemyCount: 3,
    location: 'Highway 15',
    loot: ['stimpak', 'scrap-metal'],
    type: 'raider',
    unlockLevel: 1,
    enemies: [
      { name: 'Raider Thug', health: 60, damage: 8, accuracy: 50, fireRate: 3, weapon: 'damaged-32-pistol' },
      { name: 'Raider Scout', health: 45, damage: 6, accuracy: 60, fireRate: 4, weapon: 'combat-knife' },
      { name: 'Raider Leader', health: 80, damage: 12, accuracy: 55, fireRate: 2, weapon: 'pipe-rifle' }
    ]
  },
  {
    id: 'feral-pack-small',
    name: 'Feral Ghoul Pack',
    faction: 'Ferals',
    difficulty: 2,
    minLevel: 1,
    minSquadSize: 2,
    rewards: { caps: 75, experience: 30, items: ['rad-away'] },
    description: 'Small pack of mindless ghouls',
    enemyCount: 4,
    location: 'Dead Woods',
    loot: ['rad-away', 'glowing-blood', 'pre-war-clothes'],
    type: 'creature',
    unlockLevel: 1,
    enemies: [
      { name: 'Feral Ghoul', health: 70, damage: 10, accuracy: 40, fireRate: 5 },
      { name: 'Feral Ghoul', health: 70, damage: 10, accuracy: 40, fireRate: 5 },
      { name: 'Glowing One', health: 90, damage: 15, accuracy: 45, fireRate: 4 },
      { name: 'Feral Roamer', health: 55, damage: 8, accuracy: 35, fireRate: 6 }
    ]
  },
  {
    id: 'mole-rat-den',
    name: 'Mole Rat Den',
    faction: 'Wildlife',
    difficulty: 1,
    minLevel: 1,
    minSquadSize: 1,
    rewards: { caps: 40, experience: 15, items: ['mole-rat-meat'] },
    description: 'Territorial mole rats protecting their nest',
    enemyCount: 5,
    location: 'Underground Tunnels',
    loot: ['mole-rat-meat', 'cave-fungus', 'scrap-metal'],
    type: 'creature',
    unlockLevel: 1,
    enemies: [
      { name: 'Mole Rat', health: 35, damage: 5, accuracy: 70, fireRate: 7 },
      { name: 'Mole Rat', health: 35, damage: 5, accuracy: 70, fireRate: 7 },
      { name: 'Mole Rat Broodmother', health: 80, damage: 12, accuracy: 60, fireRate: 4 },
      { name: 'Young Mole Rat', health: 25, damage: 3, accuracy: 65, fireRate: 8 },
      { name: 'Young Mole Rat', health: 25, damage: 3, accuracy: 65, fireRate: 8 }
    ]
  },
  {
    id: 'raider-outpost',
    name: 'Raider Outpost',
    faction: 'Raiders',
    difficulty: 3,
    minLevel: 2,
    minSquadSize: 2,
    rewards: { caps: 100, scrip: 3, experience: 40, items: ['combat-rifle'] },
    description: 'Fortified raider position blocking trade routes',
    enemyCount: 4,
    location: 'Bridge Checkpoint',
    loot: ['combat-rifle', 'stimpak', 'psycho', 'scrap-metal'],
    type: 'raider',
    unlockLevel: 2,
    enemies: [
      { name: 'Raider Leader', health: 80, damage: 12, accuracy: 55, fireRate: 2, weapon: 'pipe-rifle' },
      { name: 'Raider Scout', health: 45, damage: 6, accuracy: 60, fireRate: 4, weapon: 'combat-knife' },
      { name: 'Raider Thug', health: 60, damage: 8, accuracy: 50, fireRate: 3, weapon: 'damaged-32-pistol' },
      { name: 'Raider Guard', health: 50, damage: 7, accuracy: 55, fireRate: 3 }
    ]
  },
  {
    id: 'bloatfly-swarm',
    name: 'Bloatfly Swarm',
    faction: 'Wildlife',
    difficulty: 2,
    minLevel: 2,
    minSquadSize: 2,
    rewards: { caps: 60, experience: 25, items: ['bloatfly-meat'] },
    description: 'Aggressive mutated flies in abandoned gas station',
    enemyCount: 8,
    location: 'Red Rocket Station',
    loot: ['bloatfly-meat', 'acid-sac', 'pre-war-money'],
    type: 'creature',
    unlockLevel: 2,
    enemies: [
      { name: 'Bloatfly', health: 30, damage: 5, accuracy: 70, fireRate: 7 },
      { name: 'Bloatfly', health: 30, damage: 5, accuracy: 70, fireRate: 7 },
      { name: 'Bloatfly', health: 30, damage: 5, accuracy: 70, fireRate: 7 },
      { name: 'Bloatfly', health: 30, damage: 5, accuracy: 70, fireRate: 7 },
      { name: 'Bloatfly', health: 30, damage: 5, accuracy: 70, fireRate: 7 },
      { name: 'Bloatfly', health: 30, damage: 5, accuracy: 70, fireRate: 7 },
      { name: 'Bloatfly', health: 30, damage: 5, accuracy: 70, fireRate: 7 },
      { name: 'Bloatfly', health: 30, damage: 5, accuracy: 70, fireRate: 7 }
    ]
  },

  // Mid Game (Level 3-6)
  {
    id: 'super-mutant-patrol',
    name: 'Super Mutant Patrol',
    faction: 'Super Mutants',
    difficulty: 4,
    minLevel: 3,
    minSquadSize: 3,
    rewards: { caps: 150, scrip: 8, experience: 60, items: ['super-sledge'] },
    description: 'Armed patrol of super mutants',
    enemyCount: 3,
    location: 'Industrial District',
    loot: ['super-sledge', 'mini-nuke', 'mutant-hound-meat'],
    type: 'mutant',
    unlockLevel: 3,
    enemies: [
      { name: 'Super Mutant', health: 150, damage: 20, accuracy: 50, fireRate: 2, weapon: 'Assault Rifle' },
      { name: 'Super Mutant Brute', health: 200, damage: 35, accuracy: 40, fireRate: 1, weapon: 'Super Sledge' },
      { name: 'Mutant Hound', health: 80, damage: 15, accuracy: 70, fireRate: 6 }
    ]
  },
  {
    id: 'protectron-facility',
    name: 'Protectron Facility',
    faction: 'Robots',
    difficulty: 3,
    minLevel: 3,
    minSquadSize: 2,
    rewards: { caps: 120, experience: 50, items: ['electronic-parts'] },
    description: 'Malfunctioning security robots in old factory',
    enemyCount: 6,
    location: 'RobCo Factory',
    loot: ['electronic-parts', 'fusion-cell', 'scrap-metal'],
    type: 'robot',
    unlockLevel: 3,
    enemies: [
      { name: 'Protectron', health: 50, damage: 10, accuracy: 80, fireRate: 2 },
      { name: 'Protectron', health: 50, damage: 10, accuracy: 80, fireRate: 2 },
      { name: 'Protectron', health: 50, damage: 10, accuracy: 80, fireRate: 2 },
      { name: 'Protectron', health: 50, damage: 10, accuracy: 80, fireRate: 2 },
      { name: 'Protectron', health: 50, damage: 10, accuracy: 80, fireRate: 2 },
      { name: 'Protectron', health: 50, damage: 10, accuracy: 80, fireRate: 2 }
    ]
  },
  {
    id: 'deathclaw-territory',
    name: 'Deathclaw Territory',
    faction: 'Wildlife',
    difficulty: 6,
    minLevel: 4,
    minSquadSize: 4,
    rewards: { caps: 300, scrip: 15, experience: 100, items: ['deathclaw-gauntlet'] },
    description: 'Extremely dangerous apex predator territory',
    enemyCount: 1,
    location: 'Quarry Junction',
    loot: ['deathclaw-gauntlet', 'deathclaw-meat', 'deathclaw-hide'],
    type: 'creature',
    unlockLevel: 4,
    enemies: [
      { name: 'Deathclaw Alpha', health: 400, damage: 60, accuracy: 80, fireRate: 3 }
    ]
  },
  {
    id: 'gunner-squad',
    name: 'Gunner Squad',
    faction: 'Gunners',
    difficulty: 5,
    minLevel: 4,
    minSquadSize: 3,
    rewards: { caps: 200, scrip: 10, experience: 75, items: ['assault-rifle'] },
    description: 'Well-equipped mercenary squad',
    enemyCount: 4,
    location: 'Highway Overpass',
    loot: ['assault-rifle', 'combat-armor', 'frag-grenade'],
    type: 'faction',
    unlockLevel: 4,
    enemies: [
      { name: 'Gunner', health: 70, damage: 10, accuracy: 70, fireRate: 6 },
      { name: 'Gunner', health: 70, damage: 10, accuracy: 70, fireRate: 6 },
      { name: 'Gunner', health: 70, damage: 10, accuracy: 70, fireRate: 6 },
      { name: 'Gunner', health: 70, damage: 10, accuracy: 70, fireRate: 6 }
    ]
  },
  {
    id: 'mirelurk-queen',
    name: 'Mirelurk Queen',
    faction: 'Wildlife',
    difficulty: 7,
    minLevel: 5,
    minSquadSize: 4,
    rewards: { caps: 400, scrip: 20, experience: 120, items: ['mirelurk-queen-meat'] },
    description: 'Massive crustacean matriarch guarding her eggs',
    enemyCount: 1,
    location: 'Coastal Caves',
    loot: ['mirelurk-queen-meat', 'softshell-meat', 'mirelurk-eggs'],
    type: 'creature',
    unlockLevel: 5,
    enemies: [
      { name: 'Mirelurk Queen', health: 200, damage: 30, accuracy: 70, fireRate: 6 },
      { name: 'Mirelurk Queen', health: 200, damage: 30, accuracy: 70, fireRate: 6 },
      { name: 'Mirelurk Queen', health: 200, damage: 30, accuracy: 70, fireRate: 6 },
      { name: 'Mirelurk Queen', health: 200, damage: 30, accuracy: 70, fireRate: 6 }
    ]
  },

  // High Level (Level 6-10)
  {
    id: 'brotherhood-patrol',
    name: 'Rogue Brotherhood Patrol',
    faction: 'Brotherhood of Steel',
    difficulty: 8,
    minLevel: 6,
    minSquadSize: 4,
    rewards: { caps: 500, scrip: 25, experience: 150, items: ['laser-rifle', 't45-power-armor'] },
    description: 'Elite Brotherhood soldiers gone rogue',
    enemyCount: 3,
    location: 'Military Checkpoint',
    loot: ['laser-rifle', 't45-power-armor', 'fusion-core'],
    type: 'faction',
    unlockLevel: 6,
    enemies: [
      { name: 'Brotherhood Soldier', health: 100, damage: 15, accuracy: 70, fireRate: 6 },
      { name: 'Brotherhood Soldier', health: 100, damage: 15, accuracy: 70, fireRate: 6 },
      { name: 'Brotherhood Soldier', health: 100, damage: 15, accuracy: 70, fireRate: 6 }
    ]
  },
  {
    id: 'enclave-outpost',
    name: 'Enclave Outpost',
    faction: 'Enclave',
    difficulty: 9,
    minLevel: 7,
    minSquadSize: 5,
    rewards: { caps: 600, scrip: 30, experience: 180, items: ['plasma-rifle', 'x01-power-armor'] },
    description: 'Advanced military remnants with power armor',
    enemyCount: 4,
    location: 'Research Facility',
    loot: ['plasma-rifle', 'x01-power-armor', 'enclave-keycard'],
    type: 'faction',
    unlockLevel: 7,
    enemies: [
      { name: 'Enclave Soldier', health: 120, damage: 18, accuracy: 70, fireRate: 6 },
      { name: 'Enclave Soldier', health: 120, damage: 18, accuracy: 70, fireRate: 6 },
      { name: 'Enclave Soldier', health: 120, damage: 18, accuracy: 70, fireRate: 6 },
      { name: 'Enclave Soldier', health: 120, damage: 18, accuracy: 70, fireRate: 6 }
    ]
  },
  {
    id: 'behemoth-lair',
    name: 'Super Mutant Behemoth',
    faction: 'Super Mutants',
    difficulty: 10,
    minLevel: 8,
    minSquadSize: 5,
    rewards: { caps: 800, scrip: 40, experience: 250, items: ['behemoth-bone-club'] },
    description: 'Colossal super mutant with devastating strength',
    enemyCount: 1,
    location: 'Capitol Building',
    loot: ['behemoth-bone-club', 'super-mutant-armor', 'mini-nuke'],
    type: 'mutant',
    unlockLevel: 8,
    enemies: [
      { name: 'Behemoth', health: 500, damage: 30, accuracy: 70, fireRate: 6 },
      { name: 'Behemoth', health: 500, damage: 30, accuracy: 70, fireRate: 6 },
      { name: 'Behemoth', health: 500, damage: 30, accuracy: 70, fireRate: 6 },
      { name: 'Behemoth', health: 500, damage: 30, accuracy: 70, fireRate: 6 }
    ]
  },
  {
    id: 'scorchbeast-queen',
    name: 'Scorchbeast Queen',
    faction: 'Scorched',
    difficulty: 12,
    minLevel: 10,
    minSquadSize: 6,
    rewards: { caps: 1200, scrip: 60, experience: 400, items: ['ultracite-scrap'] },
    description: 'Apex predator from the depths of Appalachia',
    enemyCount: 1,
    location: 'Cranberry Bog',
    loot: ['ultracite-scrap', 'scorchbeast-liver', 'stable-flux'],
    type: 'legendary',
    unlockLevel: 10,
    enemies: [
      { name: 'Scorchbeast Queen', health: 300, damage: 40, accuracy: 70, fireRate: 6 },
      { name: 'Scorchbeast Queen', health: 300, damage: 40, accuracy: 70, fireRate: 6 },
      { name: 'Scorchbeast Queen', health: 300, damage: 40, accuracy: 70, fireRate: 6 },
      { name: 'Scorchbeast Queen', health: 300, damage: 40, accuracy: 70, fireRate: 6 }
    ]
  },

  // Legendary Encounters (Level 10+)
  {
    id: 'frank-horrigan',
    name: 'Frank Horrigan',
    faction: 'Enclave',
    difficulty: 15,
    minLevel: 12,
    minSquadSize: 6,
    rewards: { caps: 2000, scrip: 100, experience: 600, items: ['advanced-power-armor'] },
    description: 'Legendary Enclave soldier in advanced power armor',
    enemyCount: 1,
    location: 'Oil Rig',
    loot: ['advanced-power-armor', 'plasma-caster', 'enclave-secrets'],
    type: 'legendary',
    unlockLevel: 12,
    enemies: [
      { name: 'Frank Horrigan', health: 300, damage: 50, accuracy: 70, fireRate: 6 },
      { name: 'Frank Horrigan', health: 300, damage: 50, accuracy: 70, fireRate: 6 },
      { name: 'Frank Horrigan', health: 300, damage: 50, accuracy: 70, fireRate: 6 }
    ]
  },
  {
    id: 'master-army',
    name: 'The Master\'s Army',
    faction: 'Unity',
    difficulty: 14,
    minLevel: 11,
    minSquadSize: 6,
    rewards: { caps: 1800, scrip: 80, experience: 500, items: ['fev-sample'] },
    description: 'Super mutant army led by the Master\'s lieutenant',
    enemyCount: 8,
    location: 'Mariposa Base',
    loot: ['fev-sample', 'super-mutant-armor', 'plasma-rifle'],
    type: 'legendary',
    unlockLevel: 11,
    enemies: [
      { name: 'Super Mutant', health: 200, damage: 35, accuracy: 40, fireRate: 1, weapon: 'Super Sledge' },
      { name: 'Super Mutant', health: 200, damage: 35, accuracy: 40, fireRate: 1, weapon: 'Super Sledge' },
      { name: 'Super Mutant', health: 200, damage: 35, accuracy: 40, fireRate: 1, weapon: 'Super Sledge' },
      { name: 'Super Mutant', health: 200, damage: 35, accuracy: 40, fireRate: 1, weapon: 'Super Sledge' },
      { name: 'Super Mutant', health: 200, damage: 35, accuracy: 40, fireRate: 1, weapon: 'Super Sledge' },
      { name: 'Super Mutant', health: 200, damage: 35, accuracy: 40, fireRate: 1, weapon: 'Super Sledge' },
      { name: 'Super Mutant', health: 200, damage: 35, accuracy: 40, fireRate: 1, weapon: 'Super Sledge' },
      { name: 'Super Mutant', health: 200, damage: 35, accuracy: 40, fireRate: 1, weapon: 'Super Sledge' }
    ]
  },

  // Special Events
  {
    id: 'alien-crash',
    name: 'Alien Crash Site',
    faction: 'Aliens',
    difficulty: 13,
    minLevel: 10,
    minSquadSize: 5,
    rewards: { caps: 1500, scrip: 75, experience: 450, items: ['alien-blaster'] },
    description: 'Extraterrestrial visitors with advanced technology',
    enemyCount: 3,
    location: 'Crash Site',
    loot: ['alien-blaster', 'alien-power-cell', 'alien-artifact'],
    type: 'legendary',
    unlockLevel: 10,
    enemies: [
      { name: 'Alien', health: 100, damage: 15, accuracy: 70, fireRate: 6 },
      { name: 'Alien', health: 100, damage: 15, accuracy: 70, fireRate: 6 },
      { name: 'Alien', health: 100, damage: 15, accuracy: 70, fireRate: 6 }
    ]
  },
  {
    id: 'mothman-cult',
    name: 'Mothman Cultists',
    faction: 'Cultists',
    difficulty: 6,
    minLevel: 5,
    minSquadSize: 3,
    rewards: { caps: 300, scrip: 15, experience: 90, items: ['mothman-wing'] },
    description: 'Fanatics worshipping the mysterious Mothman',
    enemyCount: 6,
    location: 'Point Pleasant',
    loot: ['mothman-wing', 'ritual-knife', 'occult-tome'],
    type: 'faction',
    unlockLevel: 5,
    enemies: [
      { name: 'Mothman Cultist', health: 50, damage: 10, accuracy: 70, fireRate: 6 },
      { name: 'Mothman Cultist', health: 50, damage: 10, accuracy: 70, fireRate: 6 },
      { name: 'Mothman Cultist', health: 50, damage: 10, accuracy: 70, fireRate: 6 },
      { name: 'Mothman Cultist', health: 50, damage: 10, accuracy: 70, fireRate: 6 },
      { name: 'Mothman Cultist', health: 50, damage: 10, accuracy: 70, fireRate: 6 },
      { name: 'Mothman Cultist', health: 50, damage: 10, accuracy: 70, fireRate: 6 }
    ]
  },
  {
    id: 'vault-experiment',
    name: 'Vault-Tec Experiment',
    faction: 'Vault-Tec',
    difficulty: 11,
    minLevel: 9,
    minSquadSize: 5,
    rewards: { caps: 1000, scrip: 50, experience: 300, items: ['experiment-data'] },
    description: 'Failed vault experiment with dangerous subjects',
    enemyCount: 5,
    location: 'Vault 87',
    loot: ['experiment-data', 'vault-suit', 'research-notes'],
    type: 'faction',
    unlockLevel: 9,
    enemies: [
      { name: 'Vault-Tec Subject', health: 100, damage: 15, accuracy: 70, fireRate: 6 },
      { name: 'Vault-Tec Subject', health: 100, damage: 15, accuracy: 70, fireRate: 6 },
      { name: 'Vault-Tec Subject', health: 100, damage: 15, accuracy: 70, fireRate: 6 },
      { name: 'Vault-Tec Subject', health: 100, damage: 15, accuracy: 70, fireRate: 6 },
      { name: 'Vault-Tec Subject', health: 100, damage: 15, accuracy: 70, fireRate: 6 }
    ]
  },
  {
    id: 'cazador-nest',
    name: 'Cazador Nest',
    faction: 'Wildlife',
    difficulty: 8,
    minLevel: 6,
    minSquadSize: 4,
    rewards: { caps: 450, scrip: 22, experience: 140, items: ['cazador-poison'] },
    description: 'Venomous flying predators defending their territory',
    enemyCount: 6,
    location: 'Mojave Outpost',
    loot: ['cazador-poison', 'poison-sac', 'insect-parts'],
    type: 'creature',
    unlockLevel: 6,
    enemies: [
      { name: 'Cazador', health: 70, damage: 10, accuracy: 70, fireRate: 6 },
      { name: 'Cazador', health: 70, damage: 10, accuracy: 70, fireRate: 6 },
      { name: 'Cazador', health: 70, damage: 10, accuracy: 70, fireRate: 6 },
      { name: 'Cazador', health: 70, damage: 10, accuracy: 70, fireRate: 6 },
      { name: 'Cazador', health: 70, damage: 10, accuracy: 70, fireRate: 6 },
      { name: 'Cazador', health: 70, damage: 10, accuracy: 70, fireRate: 6 }
    ]
  }
];
