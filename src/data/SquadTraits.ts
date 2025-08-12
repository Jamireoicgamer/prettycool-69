export interface SquadTrait {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: 'positive' | 'negative' | 'neutral';
  effects: {
    combat?: number;
    stealth?: number;
    tech?: number;
    charisma?: number;
    intelligence?: number;
    health?: number;
    accuracy?: number;
    damage?: number;
    defense?: number;
  };
  specialAbilities: string[];
  terrainBonuses?: { [terrainId: string]: any };
  combatTactics?: string[];
}

export const SQUAD_TRAITS: SquadTrait[] = [
  // Positive Traits
  {
    id: 'tactical-genius',
    name: 'Tactical Genius',
    description: 'Exceptional strategic thinking and battlefield awareness',
    icon: '🧠',
    type: 'positive',
    effects: {
      intelligence: 15,
      accuracy: 10,
      combat: 5
    },
    specialAbilities: [
      'Can predict enemy movements',
      'Grants team coordination bonuses',
      'Reduces friendly fire incidents'
    ],
    terrainBonuses: {
      'urban': { defense: 10 },
      'industrial': { accuracy: 15 }
    },
    combatTactics: [
      'Flanking maneuvers',
      'Coordinated suppressing fire',
      'Strategic positioning'
    ]
  },
  {
    id: 'wasteland-survivor',
    name: 'Wasteland Survivor',
    description: 'Born and raised in the harsh post-apocalyptic world',
    icon: '🏜️',
    type: 'positive',
    effects: {
      health: 20,
      defense: 10,
      stealth: 5
    },
    specialAbilities: [
      'Radiation resistance',
      'Scavenging expertise',
      'Environmental adaptation'
    ],
    terrainBonuses: {
      'wasteland': { damage: 15, movement: 10 },
      'desert': { defense: 20 },
      'crater': { damage: -10 }
    },
    combatTactics: [
      'Guerrilla warfare',
      'Resource conservation',
      'Endurance tactics'
    ]
  },
  {
    id: 'tech-savant',
    name: 'Tech Savant',
    description: 'Intuitive understanding of pre-war and post-war technology',
    icon: '⚙️',
    type: 'positive',
    effects: {
      tech: 20,
      intelligence: 10,
      accuracy: 5
    },
    specialAbilities: [
      'Hack enemy weapons',
      'Repair equipment mid-combat',
      'Override security systems'
    ],
    terrainBonuses: {
      'laboratory': { damage: 20, accuracy: 15 },
      'vault': { stealth: 25 },
      'industrial': { defense: 15 }
    },
    combatTactics: [
      'Electronic warfare',
      'Equipment sabotage',
      'Tactical analysis'
    ]
  },
  {
    id: 'natural-leader',
    name: 'Natural Leader',
    description: 'Inspiring presence that motivates allies in combat',
    icon: '👑',
    type: 'positive',
    effects: {
      charisma: 15,
      combat: 10,
      intelligence: 5
    },
    specialAbilities: [
      'Boost ally morale',
      'Coordinate team attacks',
      'Rally broken formations'
    ],
    terrainBonuses: {
      'vault': { accuracy: 20 },
      'rooftop': { damage: 15 }
    },
    combatTactics: [
      'Inspirational speeches',
      'Formation fighting',
      'Tactical commands'
    ]
  },
  {
    id: 'ghost-walker',
    name: 'Ghost Walker',
    description: 'Master of stealth and infiltration techniques',
    icon: '👻',
    type: 'positive',
    effects: {
      stealth: 25,
      accuracy: 10,
      intelligence: 5
    },
    specialAbilities: [
      'Invisible movement',
      'Silent takedowns',
      'Avoid detection systems'
    ],
    terrainBonuses: {
      'forest': { stealth: 20, damage: 15 },
      'urban': { stealth: 15 },
      'underground': { stealth: 25 }
    },
    combatTactics: [
      'Ambush attacks',
      'Reconnaissance',
      'Sabotage missions'
    ]
  },

  // Negative Traits
  {
    id: 'shell-shocked',
    name: 'Shell Shocked',
    description: 'Trauma from previous battles affects combat performance',
    icon: '💥',
    type: 'negative',
    effects: {
      accuracy: -15,
      intelligence: -10,
      combat: -5
    },
    specialAbilities: [
      'Panic under heavy fire',
      'Flashbacks during explosions',
      'Reduced reaction time'
    ],
    terrainBonuses: {
      'crater': { accuracy: -25, combat: -15 },
      'industrial': { accuracy: -10 }
    },
    combatTactics: [
      'Defensive positioning',
      'Avoid explosive weapons',
      'Require cover constantly'
    ]
  },
  {
    id: 'claustrophobic',
    name: 'Claustrophobic',
    description: 'Fear of enclosed spaces affects underground combat',
    icon: '😰',
    type: 'negative',
    effects: {
      stealth: -10,
      intelligence: -5
    },
    specialAbilities: [
      'Panic in tight spaces',
      'Reduced effectiveness indoors',
      'Rush to escape confinement'
    ],
    terrainBonuses: {
      'underground': { combat: -20, accuracy: -15, stealth: -25 },
      'vault': { combat: -15, accuracy: -10 }
    },
    combatTactics: [
      'Prefer open combat',
      'Avoid tunnel fighting',
      'Quick escapes'
    ]
  },
  {
    id: 'radiation-sickness',
    name: 'Radiation Sickness',
    description: 'Chronic exposure to radiation affects health and performance',
    icon: '☢️',
    type: 'negative',
    effects: {
      health: -25,
      defense: -10,
      combat: -5
    },
    specialAbilities: [
      'Weakened immune system',
      'Fatigue sets in quickly',
      'Vulnerable to environmental hazards'
    ],
    terrainBonuses: {
      'crater': { health: -30, combat: -20 },
      'swamp': { health: -15 },
      'coastal': { health: -10 }
    },
    combatTactics: [
      'Short engagements',
      'Avoid irradiated areas',
      'Medical support priority'
    ]
  },
  {
    id: 'technophobe',
    name: 'Technophobe',
    description: 'Distrust and fear of advanced technology',
    icon: '📵',
    type: 'negative',
    effects: {
      tech: -20,
      intelligence: -5,
      accuracy: -5
    },
    specialAbilities: [
      'Cannot use advanced weapons',
      'Avoids electronic systems',
      'Prefers simple solutions'
    ],
    terrainBonuses: {
      'laboratory': { combat: -15, accuracy: -20 },
      'vault': { tech: -30 },
      'spaceship': { combat: -25, accuracy: -30 }
    },
    combatTactics: [
      'Melee combat preference',
      'Avoid tech-heavy areas',
      'Simple weapon tactics'
    ]
  },
  {
    id: 'bloodthirsty',
    name: 'Bloodthirsty',
    description: 'Uncontrollable rage in combat leads to reckless behavior',
    icon: '🩸',
    type: 'negative',
    effects: {
      damage: 15,
      defense: -20,
      intelligence: -15
    },
    specialAbilities: [
      'Berserker rage',
      'Ignores tactical commands',
      'Charges into danger'
    ],
    terrainBonuses: {
      'urban': { damage: 20, defense: -15 },
      'underground': { damage: 25, defense: -25 }
    },
    combatTactics: [
      'Frontal assaults',
      'Melee charges',
      'Ignore cover'
    ]
  },

  // Neutral/Specialized Traits
  {
    id: 'night-owl',
    name: 'Night Owl',
    description: 'Enhanced performance in low-light conditions',
    icon: '🦉',
    type: 'neutral',
    effects: {
      stealth: 10,
      accuracy: 10
    },
    specialAbilities: [
      'Night vision enhancement',
      'Better performance in dark areas',
      'Reduced effectiveness in bright light'
    ],
    terrainBonuses: {
      'underground': { stealth: 20, accuracy: 15 },
      'vault': { stealth: 15 },
      'forest': { stealth: 15, accuracy: 10 }
    },
    combatTactics: [
      'Night operations',
      'Stealth approaches',
      'Avoid daylight combat'
    ]
  },
  {
    id: 'pack-rat',
    name: 'Pack Rat',
    description: 'Compulsive collector with extensive gear knowledge',
    icon: '🎒',
    type: 'neutral',
    effects: {
      intelligence: 10,
      tech: 5,
      combat: -5
    },
    specialAbilities: [
      'Extra inventory space',
      'Identify rare items',
      'Jury-rig equipment'
    ],
    terrainBonuses: {
      'wasteland': { tech: 15 },
      'urban': { tech: 10 }
    },
    combatTactics: [
      'Equipment specialist',
      'Support role',
      'Scavenging focus'
    ]
  },
  {
    id: 'mutant-hunter',
    name: 'Mutant Hunter',
    description: 'Specialized in fighting against mutated creatures',
    icon: '🏹',
    type: 'positive',
    effects: {
      damage: 10,
      accuracy: 15,
      intelligence: 5
    },
    specialAbilities: [
      'Know mutant weaknesses',
      'Tracking abilities',
      'Specialized ammunition crafting'
    ],
    terrainBonuses: {
      'swamp': { damage: 25, accuracy: 20 },
      'forest': { damage: 20 },
      'wasteland': { damage: 15 }
    },
    combatTactics: [
      'Creature behavior prediction',
      'Weakness exploitation',
      'Environmental traps'
    ]
  },
  {
    id: 'vault-dweller',
    name: 'Vault Dweller',
    description: 'Raised in the safety of a vault, inexperienced with wasteland dangers',
    icon: '🚪',
    type: 'neutral',
    effects: {
      tech: 15,
      intelligence: 10,
      combat: -10,
      stealth: -5
    },
    specialAbilities: [
      'Advanced technical knowledge',
      'Naive about wasteland dangers',
      'Quick learner'
    ],
    terrainBonuses: {
      'vault': { tech: 25, accuracy: 20 },
      'laboratory': { tech: 20 },
      'wasteland': { combat: -15, stealth: -10 }
    },
    combatTactics: [
      'Technology reliance',
      'Systematic approaches',
      'Learning adaptation'
    ]
  },
  {
    id: 'raider-reformed',
    name: 'Reformed Raider',
    description: 'Former raider trying to make amends, street-smart but untrusted',
    icon: '⚔️',
    type: 'neutral',
    effects: {
      combat: 15,
      stealth: 10,
      charisma: -10,
      intelligence: -5
    },
    specialAbilities: [
      'Know raider tactics',
      'Intimidation factor',
      'Trust issues with teammates'
    ],
    terrainBonuses: {
      'urban': { combat: 20, stealth: 15 },
      'wasteland': { combat: 15 }
    },
    combatTactics: [
      'Aggressive assaults',
      'Dirty fighting',
      'Independent action'
    ]
  }
];

// Utility functions
export const getRandomTrait = (): SquadTrait => {
  return SQUAD_TRAITS[Math.floor(Math.random() * SQUAD_TRAITS.length)];
};

export const getPositiveTraits = (): SquadTrait[] => {
  return SQUAD_TRAITS.filter(trait => trait.type === 'positive');
};

export const getNegativeTraits = (): SquadTrait[] => {
  return SQUAD_TRAITS.filter(trait => trait.type === 'negative');
};

export const getTraitById = (id: string): SquadTrait | undefined => {
  return SQUAD_TRAITS.find(trait => trait.id === id);
};