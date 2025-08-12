export interface TerrainModifier {
  id: string;
  name: string;
  description: string;
  icon: string;
  playerEffects: {
    damage?: number;
    accuracy?: number;
    defense?: number;
    stealth?: number;
    movement?: number;
  };
  enemyEffects: {
    damage?: number;
    accuracy?: number;
    defense?: number;
    stealth?: number;
    movement?: number;
  };
  specialRules: string[];
  tacticalAdvantages: string[];
  environmentalHazards: string[];
}

export const TERRAIN_TYPES: TerrainModifier[] = [
  {
    id: 'urban',
    name: 'Urban Ruins',
    description: 'Collapsed buildings and rubble provide cover but limit movement',
    icon: '🏙️',
    playerEffects: {
      defense: 15,
      accuracy: -10,
      movement: -20
    },
    enemyEffects: {
      defense: 10,
      accuracy: -15,
      movement: -15
    },
    specialRules: [
      'High cover availability increases defense',
      'Debris slows movement for all units',
      'Collapsed structures can provide flanking routes'
    ],
    tacticalAdvantages: [
      'Snipers gain elevated positions',
      'Stealth units can use shadows effectively',
      'Heavy weapons have reduced effectiveness'
    ],
    environmentalHazards: [
      'Building collapse during explosions',
      'Glass and debris cause movement penalties',
      'Unstable structures may shift during combat'
    ]
  },
  {
    id: 'wasteland',
    name: 'Open Wasteland', 
    description: 'Flat, barren terrain with minimal cover but clear sightlines',
    icon: '🏜️',
    playerEffects: {
      accuracy: 20,
      defense: -15,
      movement: 10
    },
    enemyEffects: {
      accuracy: 15,
      defense: -20,
      movement: 15
    },
    specialRules: [
      'No cover penalties apply',
      'Long-range weapons gain accuracy bonus',
      'Fast movement across open ground'
    ],
    tacticalAdvantages: [
      'Perfect for sniper duels',
      'Vehicles and power armor excel',
      'Formation tactics become critical'
    ],
    environmentalHazards: [
      'Radiation storms reduce visibility',
      'Sandstorms can blind combatants',
      'Heat mirages affect long-range targeting'
    ]
  },
  {
    id: 'forest',
    name: 'Overgrown Forest',
    description: 'Dense vegetation provides concealment but blocks line of sight',
    icon: '🌲',
    playerEffects: {
      stealth: 25,
      accuracy: -20,
      defense: 10
    },
    enemyEffects: {
      stealth: 20,
      accuracy: -25,
      defense: 5
    },
    specialRules: [
      'Stealth bonuses for all units',
      'Limited visibility beyond close range',
      'Natural camouflage aids concealment'
    ],
    tacticalAdvantages: [
      'Ambush tactics highly effective',
      'Close-quarters combat specialists excel',
      'Tech specialists can set traps'
    ],
    environmentalHazards: [
      'Mutated plant life may attack',
      'Thick canopy blocks aerial support',
      'Root systems create movement obstacles'
    ]
  },
  {
    id: 'swamp',
    name: 'Radioactive Swamp',
    description: 'Toxic marshland that slows movement and damages unprotected units',
    icon: '🐊',
    playerEffects: {
      movement: -30,
      defense: -5,
      damage: -10
    },
    enemyEffects: {
      movement: -25,
      defense: -10,
      damage: -5
    },
    specialRules: [
      'Radiation deals damage over time',
      'Water slows all movement significantly',
      'Power armor provides radiation protection'
    ],
    tacticalAdvantages: [
      'Hazmat suits become essential',
      'Rad-resistant units gain advantage',
      'Area denial weapons more effective'
    ],
    environmentalHazards: [
      'Constant radiation exposure',
      'Quicksand patches trap units',
      'Mutant creatures lurk underwater'
    ]
  },
  {
    id: 'industrial',
    name: 'Industrial Complex',
    description: 'Machinery and chemical hazards create dangerous but tactically rich environment',
    icon: '🏭',
    playerEffects: {
      defense: 10,
      damage: 15,
      accuracy: -5
    },
    enemyEffects: {
      defense: 5,
      damage: 10,
      accuracy: -10
    },
    specialRules: [
      'Explosive machinery can be triggered',
      'Chemical leaks create hazard zones',
      'Metal structures provide good cover'
    ],
    tacticalAdvantages: [
      'Tech specialists can hack machinery',
      'Explosive weapons cause chain reactions',
      'Electrical systems can be weaponized'
    ],
    environmentalHazards: [
      'Chemical spills cause damage',
      'Electrical hazards stun units',
      'Steam vents obscure vision'
    ]
  },
  {
    id: 'underground',
    name: 'Underground Tunnels',
    description: 'Confined spaces limit movement but create chokepoints',
    icon: '🕳️',
    playerEffects: {
      defense: 20,
      movement: -35,
      accuracy: -15
    },
    enemyEffects: {
      defense: 15,
      movement: -30,
      accuracy: -20
    },
    specialRules: [
      'No aerial support or long-range weapons',
      'Close-quarters combat only',
      'Sound echoes reveal positions'
    ],
    tacticalAdvantages: [
      'Shotguns and melee weapons excel',
      'Chokepoints favor defenders',
      'Explosives cause tunnel collapse'
    ],
    environmentalHazards: [
      'Cave-ins block passages',
      'Flooding from broken pipes',
      'Toxic gas accumulation'
    ]
  },
  {
    id: 'desert',
    name: 'Scorching Desert',
    description: 'Extreme heat and shifting sand dunes affect combat effectiveness',
    icon: '🌵',
    playerEffects: {
      movement: -10,
      accuracy: -10,
      damage: -5
    },
    enemyEffects: {
      movement: -15,
      accuracy: -15,
      damage: -10
    },
    specialRules: [
      'Heat exhaustion reduces effectiveness',
      'Sand dunes provide temporary cover',
      'Mirages can confuse targeting'
    ],
    tacticalAdvantages: [
      'Desert-adapted units gain bonuses',
      'Water becomes tactical resource',
      'Sandstorms provide concealment'
    ],
    environmentalHazards: [
      'Dehydration affects all units',
      'Sandstorms reduce visibility to zero',
      'Unstable dunes may shift'
    ]
  },
  {
    id: 'arctic',
    name: 'Frozen Wasteland',
    description: 'Bitter cold and ice make footing treacherous but preserve visibility',
    icon: '❄️',
    playerEffects: {
      movement: -25,
      accuracy: 10,
      defense: -10
    },
    enemyEffects: {
      movement: -30,
      accuracy: 5,
      defense: -15
    },
    specialRules: [
      'Hypothermia reduces combat effectiveness',
      'Ice provides slippery surfaces',
      'Clear air improves long-range visibility'
    ],
    tacticalAdvantages: [
      'Cold-weather gear becomes essential',
      'Footprints reveal enemy positions',
      'Frozen water blocks some routes'
    ],
    environmentalHazards: [
      'Frostbite damages exposed units',
      'Ice cracks under heavy weight',
      'Blizzards create whiteout conditions'
    ]
  },
  {
    id: 'coastal',
    name: 'Irradiated Coastline',
    description: 'Rocky shores and tide pools with radioactive sea spray',
    icon: '🌊',
    playerEffects: {
      defense: 5,
      movement: -15,
      stealth: 15
    },
    enemyEffects: {
      defense: 0,
      movement: -20,
      stealth: 10
    },
    specialRules: [
      'Tides change battlefield layout',
      'Radioactive spray causes damage',
      'Rocky outcrops provide cover'
    ],
    tacticalAdvantages: [
      'Amphibious units gain mobility',
      'Cliff positions offer height advantage',
      'Sea creatures may interfere'
    ],
    environmentalHazards: [
      'Radioactive water damages health',
      'Slippery rocks cause falls',
      'Rogue waves can sweep units away'
    ]
  },
  {
    id: 'crater',
    name: 'Nuclear Crater',
    description: 'Ground zero of atomic devastation with intense radiation and glass formations',
    icon: '☢️',
    playerEffects: {
      damage: -20,
      defense: -15,
      movement: -20
    },
    enemyEffects: {
      damage: -25,
      defense: -20,
      movement: -25
    },
    specialRules: [
      'Extreme radiation affects all units',
      'Glasified ground creates unique terrain',
      'Residual energy interferes with electronics'
    ],
    tacticalAdvantages: [
      'Radiation suits mandatory for survival',
      'Electronic equipment may malfunction',
      'Glowing terrain eliminates stealth'
    ],
    environmentalHazards: [
      'Lethal radiation levels',
      'Glass shards cause movement damage',
      'Electromagnetic interference'
    ]
  },
  {
    id: 'laboratory',
    name: 'Abandoned Laboratory',
    description: 'Scientific facility with experimental hazards and technological advantages',
    icon: '🧪',
    playerEffects: {
      defense: 15,
      stealth: -10,
      accuracy: 5
    },
    enemyEffects: {
      defense: 10,
      stealth: -15,
      accuracy: 0
    },
    specialRules: [
      'Scientific equipment can be activated',
      'Chemical spills create hazard zones',
      'Security systems may still function'
    ],
    tacticalAdvantages: [
      'Tech specialists can access computers',
      'Medical equipment aids healing',
      'Laser grids can be redirected'
    ],
    environmentalHazards: [
      'Chemical exposure causes mutations',
      'Automated defenses activate randomly',
      'Containment breaches release dangers'
    ]
  },
  {
    id: 'rooftop',
    name: 'Urban Rooftops',
    description: 'High-altitude combat across building tops with elevation advantages',
    icon: '🏢',
    playerEffects: {
      accuracy: 25,
      defense: -20,
      movement: -10
    },
    enemyEffects: {
      accuracy: 20,
      defense: -25,
      movement: -15
    },
    specialRules: [
      'Height advantage for ranged combat',
      'Fall damage from edges is lethal',
      'Wind affects projectile accuracy'
    ],
    tacticalAdvantages: [
      'Snipers dominate the battlefield',
      'Air drops become possible',
      'Ziplines enable rapid movement'
    ],
    environmentalHazards: [
      'High winds affect accuracy',
      'Structural damage may cause collapse',
      'Limited escape routes'
    ]
  },
  {
    id: 'vault',
    name: 'Vault Interior',
    description: 'Sterile underground facility with controlled environment and tight corridors',
    icon: '🚪',
    playerEffects: {
      defense: 25,
      movement: -30,
      stealth: -20
    },
    enemyEffects: {
      defense: 20,
      movement: -35,
      stealth: -25
    },
    specialRules: [
      'No environmental hazards',
      'Security systems can be activated',
      'Confined spaces favor defensive tactics'
    ],
    tacticalAdvantages: [
      'Security cameras reveal positions',
      'Blast doors can seal sections',
      'Computer terminals provide tactical data'
    ],
    environmentalHazards: [
      'Lockdown protocols trap combatants',
      'Life support can be disrupted',
      'Automated turrets may activate'
    ]
  },
  {
    id: 'quarry',
    name: 'Open Pit Quarry',
    description: 'Multi-level mining operation with unstable rock faces and heavy machinery',
    icon: '⛏️',
    playerEffects: {
      accuracy: 15,
      defense: 5,
      movement: -15
    },
    enemyEffects: {
      accuracy: 10,
      defense: 0,
      movement: -20
    },
    specialRules: [
      'Multiple elevation levels',
      'Heavy machinery can be activated',
      'Rock falls can be triggered'
    ],
    tacticalAdvantages: [
      'High ground provides firing positions',
      'Conveyor belts enable movement',
      'Blasting charges cause avalanches'
    ],
    environmentalHazards: [
      'Rock slides block passages',
      'Unstable ledges may collapse',
      'Dust clouds obscure vision'
    ]
  },
  {
    id: 'spaceship',
    name: 'Crashed Mothership',
    description: 'Alien vessel with advanced technology and exotic environmental effects',
    icon: '🛸',
    playerEffects: {
      stealth: -25,
      accuracy: -10,
      damage: 10
    },
    enemyEffects: {
      stealth: -30,
      accuracy: -15,
      damage: 5
    },
    specialRules: [
      'Alien technology creates energy fields',
      'Gravity generators may malfunction',
      'Universal translator affects communication'
    ],
    tacticalAdvantages: [
      'Energy weapons gain power boost',
      'Alien tech can be repurposed',
      'Force fields provide mobile cover'
    ],
    environmentalHazards: [
      'Radiation from alien fuel',
      'Gravity anomalies disorient units',
      'Self-destruct systems may activate'
    ]
  }
];

// Utility function to get random terrain for missions
export const getRandomTerrain = (): TerrainModifier => {
  return TERRAIN_TYPES[Math.floor(Math.random() * TERRAIN_TYPES.length)];
};

// Function to get terrain by biome/location type
export const getTerrainByLocation = (location: string): TerrainModifier => {
  const locationLower = location.toLowerCase();
  
  if (locationLower.includes('highway') || locationLower.includes('bridge')) {
    return TERRAIN_TYPES.find(t => t.id === 'urban') || TERRAIN_TYPES[0];
  }
  if (locationLower.includes('woods') || locationLower.includes('forest')) {
    return TERRAIN_TYPES.find(t => t.id === 'forest') || TERRAIN_TYPES[0];
  }
  if (locationLower.includes('swamp') || locationLower.includes('marsh')) {
    return TERRAIN_TYPES.find(t => t.id === 'swamp') || TERRAIN_TYPES[0];
  }
  if (locationLower.includes('factory') || locationLower.includes('industrial')) {
    return TERRAIN_TYPES.find(t => t.id === 'industrial') || TERRAIN_TYPES[0];
  }
  if (locationLower.includes('underground') || locationLower.includes('tunnel')) {
    return TERRAIN_TYPES.find(t => t.id === 'underground') || TERRAIN_TYPES[0];
  }
  if (locationLower.includes('coast') || locationLower.includes('shore')) {
    return TERRAIN_TYPES.find(t => t.id === 'coastal') || TERRAIN_TYPES[0];
  }
  if (locationLower.includes('vault')) {
    return TERRAIN_TYPES.find(t => t.id === 'vault') || TERRAIN_TYPES[0];
  }
  if (locationLower.includes('lab') || locationLower.includes('research')) {
    return TERRAIN_TYPES.find(t => t.id === 'laboratory') || TERRAIN_TYPES[0];
  }
  if (locationLower.includes('mothership') || locationLower.includes('crash') || locationLower.includes('alien')) {
    return TERRAIN_TYPES.find(t => t.id === 'spaceship') || TERRAIN_TYPES[0];
  }
  if (locationLower.includes('quarry') || locationLower.includes('mining')) {
    return TERRAIN_TYPES.find(t => t.id === 'quarry') || TERRAIN_TYPES[0];
  }
  
  // Default to wasteland for unknown locations
  return TERRAIN_TYPES.find(t => t.id === 'wasteland') || TERRAIN_TYPES[0];
};