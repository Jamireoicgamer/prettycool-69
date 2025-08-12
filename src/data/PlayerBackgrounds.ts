import { PlayerBackground } from '@/types/PlayerTypes';

export const PLAYER_BACKGROUNDS: PlayerBackground[] = [
  {
    id: 'vault-dweller',
    name: 'Vault Dweller',
    description: 'Raised in the safety of an underground vault, you possess technical knowledge but lack wasteland experience.',
    icon: '🚪',
    startingStats: {
      special: {
        strength: 4,
        perception: 6,
        endurance: 5,
        charisma: 6,
        intelligence: 8,
        agility: 5,
        luck: 6
      }
    },
    startingEquipment: ['vault-suit', 'pip-boy', 'stimpak'],
    startingPerks: ['tech-savvy'],
    backstory: 'Born and raised in Vault 111, you lived a sheltered life until the day the vault door opened. Your technical education and vault training prepared you for many things, but not the harsh realities of the wasteland.'
  },
  {
    id: 'wasteland-survivor',
    name: 'Wasteland Survivor',
    description: 'Born in the ruins, you know how to survive in the harsh post-apocalyptic world.',
    icon: '🏜️',
    startingStats: {
      special: {
        strength: 6,
        perception: 7,
        endurance: 8,
        charisma: 4,
        intelligence: 5,
        agility: 6,
        luck: 4
      }
    },
    startingEquipment: ['leather-armor', 'hunting-rifle', 'rad-away'],
    startingPerks: ['rad-resistance'],
    backstory: 'Raised by scavengers in the ruins of the old world, you learned early that only the strong survive. Every day was a struggle against radiation, mutants, and other survivors.'
  },
  {
    id: 'brotherhood-scribe',
    name: 'Brotherhood Scribe',
    description: 'Former member of the Brotherhood of Steel, trained in technology and combat tactics.',
    icon: '⚙️',
    startingStats: {
      special: {
        strength: 5,
        perception: 6,
        endurance: 6,
        charisma: 5,
        intelligence: 9,
        agility: 4,
        luck: 5
      }
    },
    startingEquipment: ['brotherhood-robe', 'laser-pistol', 'tech-manual'],
    startingPerks: ['energy-weapons'],
    backstory: 'Once a loyal scribe of the Brotherhood of Steel, you dedicated your life to preserving pre-war technology. Your extensive knowledge of science and energy weapons makes you invaluable in the wasteland.'
  },
  {
    id: 'raider-reformed',
    name: 'Reformed Raider',
    description: 'Former raider seeking redemption, experienced in combat and intimidation.',
    icon: '⚔️',
    startingStats: {
      special: {
        strength: 8,
        perception: 5,
        endurance: 7,
        charisma: 3,
        intelligence: 4,
        agility: 7,
        luck: 6
      }
    },
    startingEquipment: ['raider-armor', 'combat-knife', 'jet'],
    startingPerks: ['intimidation'],
    backstory: 'You spent years as a raider, taking what you wanted through violence and fear. Something changed your perspective, and now you seek to make amends for your past while using your combat skills for good.'
  },
  {
    id: 'enclave-defector',
    name: 'Enclave Defector',
    description: 'Former Enclave operative with advanced training and equipment knowledge.',
    icon: '🦅',
    startingStats: {
      special: {
        strength: 6,
        perception: 8,
        endurance: 6,
        charisma: 7,
        intelligence: 7,
        agility: 5,
        luck: 1
      }
    },
    startingEquipment: ['enclave-uniform', 'plasma-pistol', 'stealth-boy'],
    startingPerks: ['power-armor-training'],
    backstory: 'Once a loyal soldier of the Enclave, you discovered the true nature of their plans and defected. Your advanced military training and knowledge of pre-war technology makes you a formidable ally.'
  },
  {
    id: 'tribal-wanderer',
    name: 'Tribal Wanderer',
    description: 'Member of a post-war tribe with natural survival instincts and spiritual connection.',
    icon: '🪶',
    startingStats: {
      special: {
        strength: 7,
        perception: 8,
        endurance: 7,
        charisma: 6,
        intelligence: 3,
        agility: 8,
        luck: 1
      }
    },
    startingEquipment: ['tribal-outfit', 'spear', 'healing-powder'],
    startingPerks: ['animal-friend'],
    backstory: 'Raised by one of the few remaining tribal communities, you learned to live in harmony with the wasteland. Your connection to nature and primitive skills serve you well in the post-apocalyptic world.'
  },
  {
    id: 'ncr-veteran',
    name: 'NCR Veteran',
    description: 'Former New California Republic soldier with military training and leadership experience.',
    icon: '🎖️',
    startingStats: {
      special: {
        strength: 6,
        perception: 6,
        endurance: 7,
        charisma: 7,
        intelligence: 6,
        agility: 5,
        luck: 3
      }
    },
    startingEquipment: ['ncr-armor', 'service-rifle', 'med-x'],
    startingPerks: ['leadership'],
    backstory: 'You served with distinction in the New California Republic Army, fighting to bring order and democracy to the wasteland. Your military experience and leadership skills make you a natural commander.'
  },
  {
    id: 'caravan-trader',
    name: 'Caravan Trader',
    description: 'Experienced merchant who traveled the wasteland trading goods and information.',
    icon: '🐪',
    startingStats: {
      special: {
        strength: 4,
        perception: 7,
        endurance: 6,
        charisma: 9,
        intelligence: 6,
        agility: 5,
        luck: 3
      }
    },
    startingEquipment: ['merchant-outfit', 'caravan-shotgun', 'bottle-caps'],
    startingPerks: ['master-trader'],
    backstory: 'You spent years traveling the trade routes, building relationships and gathering information. Your silver tongue and business acumen helped you survive where others failed.'
  }
];

export const getBackgroundById = (id: string): PlayerBackground | undefined => {
  return PLAYER_BACKGROUNDS.find(bg => bg.id === id);
};

export const getRandomBackground = (): PlayerBackground => {
  return PLAYER_BACKGROUNDS[Math.floor(Math.random() * PLAYER_BACKGROUNDS.length)];
};