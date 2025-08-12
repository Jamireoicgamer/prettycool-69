import { PlayerPerk } from '@/types/PlayerTypes';

export const PLAYER_PERKS: PlayerPerk[] = [
  // Combat Perks
  {
    id: 'gunslinger',
    name: 'Gunslinger',
    description: 'Your quick draw and steady aim make you deadly with pistols.',
    icon: '🔫',
    level: 1,
    maxLevel: 3,
    requirements: {
      level: 7,
      special: { agility: 6 }
    },
    effects: {
      pistolDamage: 20,
      pistolAccuracy: 10
    }
  },
  {
    id: 'rifleman',
    name: 'Rifleman',
    description: 'Keep your distance long and your barrel clean.',
    icon: '🎯',
    level: 1,
    maxLevel: 5,
    requirements: {
      level: 2,
      special: { perception: 4 }
    },
    effects: {
      rifleDamage: 20,
      rifleAccuracy: 15
    }
  },
  {
    id: 'commando',
    name: 'Commando',
    description: 'Rigorous combat training means automatic weapons dish out more pain.',
    icon: '🔥',
    level: 1,
    maxLevel: 5,
    requirements: {
      level: 8,
      special: { strength: 5 }
    },
    effects: {
      automaticDamage: 20,
      automaticAccuracy: 10
    }
  },
  {
    id: 'iron-fist',
    name: 'Iron Fist',
    description: 'Channel your chi to unleash devastating fury!',
    icon: '👊',
    level: 1,
    maxLevel: 5,
    requirements: {
      level: 1,
      special: { strength: 4 }
    },
    effects: {
      unarmedDamage: 20,
      unarmedCritChance: 5
    }
  },
  {
    id: 'big-leagues',
    name: 'Big Leagues',
    description: 'Swing for the fences! Do more melee weapon damage.',
    icon: '⚾',
    level: 1,
    maxLevel: 5,
    requirements: {
      level: 1,
      special: { strength: 6 }
    },
    effects: {
      meleeDamage: 20,
      meleeCritChance: 5
    }
  },

  // Stealth Perks
  {
    id: 'sneak',
    name: 'Sneak',
    description: 'Become whisper, become shadow.',
    icon: '👤',
    level: 1,
    maxLevel: 5,
    requirements: {
      level: 1,
      special: { agility: 3 }
    },
    effects: {
      stealthBonus: 20,
      movementNoise: -50
    }
  },
  {
    id: 'ninja',
    name: 'Ninja',
    description: 'Trained as a shadow warrior, your ranged sneak attacks do more damage.',
    icon: '🥷',
    level: 1,
    maxLevel: 3,
    requirements: {
      level: 16,
      special: { agility: 7 }
    },
    effects: {
      sneakAttackDamage: 100,
      rangedSneakDamage: 50
    }
  },
  {
    id: 'mister-sandman',
    name: 'Mister Sandman',
    description: 'As an agent of death, you can instantly kill a sleeping person.',
    icon: '😴',
    level: 1,
    maxLevel: 3,
    requirements: {
      level: 23,
      special: { agility: 7 }
    },
    effects: {
      silencedWeaponDamage: 30,
      sleepingTargetDamage: 500
    }
  },

  // Utility Perks
  {
    id: 'locksmith',
    name: 'Locksmith',
    description: 'Your bobby pins never break during lockpicking.',
    icon: '🔓',
    level: 1,
    maxLevel: 4,
    requirements: {
      level: 7,
      special: { perception: 4 }
    },
    effects: {
      lockpickBonus: 25,
      bobbyPinBreakChance: -50
    }
  },
  {
    id: 'hacker',
    name: 'Hacker',
    description: 'Knowledge of cutting-edge computer encryption.',
    icon: '💻',
    level: 1,
    maxLevel: 4,
    requirements: {
      level: 9,
      special: { intelligence: 4 }
    },
    effects: {
      hackingBonus: 25,
      terminalLockoutTime: -50
    }
  },
  {
    id: 'scrounger',
    name: 'Scrounger',
    description: 'You find more ammunition in containers.',
    icon: '🔍',
    level: 1,
    maxLevel: 4,
    requirements: {
      level: 8,
      special: { luck: 2 }
    },
    effects: {
      ammoFindChance: 50,
      containerSearchBonus: 25
    }
  },

  // Social Perks
  {
    id: 'lady-killer',
    name: 'Lady Killer',
    description: 'You are especially charming to the opposite sex.',
    icon: '💕',
    level: 1,
    maxLevel: 3,
    requirements: {
      level: 2,
      special: { charisma: 2 }
    },
    effects: {
      oppositeGenderDamage: 10,
      oppositeGenderPersuasion: 25
    }
  },
  {
    id: 'lone-wanderer',
    name: 'Lone Wanderer',
    description: 'Who needs friends? You take less damage and carry more.',
    icon: '🚶',
    level: 1,
    maxLevel: 4,
    requirements: {
      level: 3,
      special: { charisma: 3 }
    },
    effects: {
      soloCarryWeight: 50,
      soloDamageReduction: 15
    }
  },
  {
    id: 'local-leader',
    name: 'Local Leader',
    description: 'As the ruler everyone turns to, you are able to establish supply lines.',
    icon: '👑',
    level: 1,
    maxLevel: 2,
    requirements: {
      level: 14,
      special: { charisma: 6 }
    },
    effects: {
      settlementManagement: 100,
      supplyLineEfficiency: 50
    }
  },

  // Survival Perks
  {
    id: 'toughness',
    name: 'Toughness',
    description: 'If nothing else, you can take a beating.',
    icon: '🛡️',
    level: 1,
    maxLevel: 5,
    requirements: {
      level: 1,
      special: { endurance: 1 }
    },
    effects: {
      damageResistance: 10
    }
  },
  {
    id: 'lead-belly',
    name: 'Lead Belly',
    description: 'Your stomach has adjusted to the weirdness of the wasteland.',
    icon: '🤢',
    level: 1,
    maxLevel: 3,
    requirements: {
      level: 6,
      special: { endurance: 2 }
    },
    effects: {
      radiationFromFood: -50,
      foodHealing: 25
    }
  },
  {
    id: 'aquaboy',
    name: 'Aquaboy',
    description: 'Water is your ally. You no longer take radiation damage from water.',
    icon: '🏊',
    level: 1,
    maxLevel: 2,
    requirements: {
      level: 16,
      special: { endurance: 5 }
    },
    effects: {
      waterRadiation: -100,
      underwaterBreathing: 100
    }
  },

  // Crafting Perks
  {
    id: 'gun-nut',
    name: 'Gun Nut',
    description: 'You know the difference between magazines and clips.',
    icon: '🔧',
    level: 1,
    maxLevel: 4,
    requirements: {
      level: 13,
      special: { intelligence: 3 }
    },
    effects: {
      weaponModCrafting: 100,
      weaponRepairEfficiency: 50
    }
  },
  {
    id: 'armorer',
    name: 'Armorer',
    description: 'Protect yourself and your settlements by crafting better armor.',
    icon: '🛡️',
    level: 1,
    maxLevel: 4,
    requirements: {
      level: 13,
      special: { strength: 3 }
    },
    effects: {
      armorModCrafting: 100,
      armorRepairEfficiency: 50
    }
  },
  {
    id: 'chemist',
    name: 'Chemist',
    description: 'Any chems you take last twice as long.',
    icon: '⚗️',
    level: 1,
    maxLevel: 4,
    requirements: {
      level: 7,
      special: { intelligence: 4 }
    },
    effects: {
      chemDuration: 100,
      chemCrafting: 50
    }
  },

  // Special Background Perks
  {
    id: 'tech-savvy',
    name: 'Tech Savvy',
    description: 'Your vault education gives you an edge with technology.',
    icon: '⚙️',
    level: 1,
    maxLevel: 1,
    requirements: {},
    effects: {
      hackingBonus: 15,
      techSkillBonus: 20
    }
  },
  {
    id: 'rad-resistance',
    name: 'Rad Resistance',
    description: 'Growing up in the wasteland made you resistant to radiation.',
    icon: '☢️',
    level: 1,
    maxLevel: 1,
    requirements: {},
    effects: {
      radiationResistance: 25
    }
  },
  {
    id: 'energy-weapons',
    name: 'Energy Weapons',
    description: 'Your Brotherhood training makes you proficient with energy weapons.',
    icon: '⚡',
    level: 1,
    maxLevel: 1,
    requirements: {},
    effects: {
      energyWeaponDamage: 20,
      energyWeaponAccuracy: 15
    }
  },
  {
    id: 'intimidation',
    name: 'Intimidation',
    description: 'Your raider past makes you naturally intimidating.',
    icon: '😠',
    level: 1,
    maxLevel: 1,
    requirements: {},
    effects: {
      intimidationBonus: 50,
      fearEffect: 25
    }
  },
  {
    id: 'power-armor-training',
    name: 'Power Armor Training',
    description: 'Your Enclave training allows you to use power armor effectively.',
    icon: '🤖',
    level: 1,
    maxLevel: 1,
    requirements: {},
    effects: {
      powerArmorEfficiency: 50,
      powerArmorMovement: 25
    }
  },
  {
    id: 'animal-friend',
    name: 'Animal Friend',
    description: 'Your tribal connection allows you to befriend wasteland creatures.',
    icon: '🐕',
    level: 1,
    maxLevel: 1,
    requirements: {},
    effects: {
      animalFriendship: 100,
      animalCompanionBonus: 25
    }
  },
  {
    id: 'leadership',
    name: 'Leadership',
    description: 'Your military experience makes you a natural leader.',
    icon: '🎖️',
    level: 1,
    maxLevel: 1,
    requirements: {},
    effects: {
      squadMoraleBonus: 25,
      commandBonus: 50
    }
  },
  {
    id: 'master-trader',
    name: 'Master Trader',
    description: 'Your merchant experience gives you better prices.',
    icon: '💰',
    level: 1,
    maxLevel: 1,
    requirements: {},
    effects: {
      tradingBonus: 25,
      vendorPrices: -15
    }
  }
];

export const getPerkById = (id: string): PlayerPerk | undefined => {
  return PLAYER_PERKS.find(perk => perk.id === id);
};

export const getPerksForLevel = (level: number): PlayerPerk[] => {
  return PLAYER_PERKS.filter(perk => 
    !perk.requirements.level || perk.requirements.level <= level
  );
};

export const checkPerkRequirements = (perk: PlayerPerk, playerLevel: number, specialStats: any): boolean => {
  if (perk.requirements.level && playerLevel < perk.requirements.level) {
    return false;
  }
  
  if (perk.requirements.special) {
    for (const [stat, value] of Object.entries(perk.requirements.special)) {
      if (specialStats[stat] < value) {
        return false;
      }
    }
  }
  
  return true;
};