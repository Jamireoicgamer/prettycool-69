export interface PlayerCharacter {
  id: string;
  name: string;
  avatar: string;
  level: number;
  experience: number;
  experienceToNext: number;
  
  // SPECIAL Stats (Fallout style)
  special: {
    strength: number;      // Affects carrying capacity, melee damage
    perception: number;    // Affects accuracy, spotting enemies
    endurance: number;     // Affects health, radiation resistance
    charisma: number;      // Affects trading, dialogue options
    intelligence: number;  // Affects skill points, hacking
    agility: number;       // Affects action points, stealth
    luck: number;          // Affects critical hits, random events
  };
  
  // Derived Stats
  health: number;
  maxHealth: number;
  actionPoints: number;
  maxActionPoints: number;
  carryWeight: number;
  maxCarryWeight: number;
  
  // Needs Management
  needs: {
    hunger: number;        // 0-100
    thirst: number;        // 0-100
    sleep: number;         // 0-100
    radiation: number;     // 0-1000 (rads)
  };
  
  // Equipment
  equipment: {
    weapon: string | null;
    armor: string | null;
    helmet: string | null;
    accessory: string | null;
    outfit: string | null;
  };
  
  // Personal Inventory
  inventory: PlayerInventorySlot[];
  
  // Character Background
  background: string;
  
  // Traits and Perks
  traits: string[];
  perks: PlayerPerk[];
  
  // Status Effects
  statusEffects: PlayerStatusEffect[];
  
  // Character Creation
  isCreated: boolean;
  createdAt: number;
  
  // Offline Progress
  lastActiveTime: number;
}

export interface PlayerInventorySlot {
  id: string;
  item: PlayerInventoryItem | null;
  quantity: number;
}

export interface PlayerInventoryItem {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'consumable' | 'material' | 'chem' | 'misc' | 'ammo';
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  description: string;
  value: number;
  weight: number;
  icon: string;
  stats?: { [key: string]: number };
  effects?: { [key: string]: number };
  durability?: number;
  maxDurability?: number;
}

export interface PlayerPerk {
  id: string;
  name: string;
  description: string;
  icon: string;
  level: number;
  maxLevel: number;
  requirements: {
    level?: number;
    special?: { [key: string]: number };
    skills?: { [key: string]: number };
  };
  effects: { [key: string]: number };
}

export interface PlayerStatusEffect {
  id: string;
  name: string;
  description: string;
  icon: string;
  duration: number;
  appliedAt: number;
  effects: { [key: string]: number };
  type: 'buff' | 'debuff' | 'neutral';
}

export interface PlayerBackground {
  id: string;
  name: string;
  description: string;
  icon: string;
  startingStats: {
    special: { [key: string]: number };
    skills?: { [key: string]: number };
  };
  startingEquipment: string[];
  startingPerks: string[];
  backstory: string;
}

export interface OfflineProgress {
  timeOffline: number;
  resourcesGenerated: { [key: string]: number };
  needsDecay: { [key: string]: number };
  eventsOccurred: OfflineEvent[];
  missionsCompleted: string[];
}

export interface OfflineEvent {
  id: string;
  type: 'resource' | 'random' | 'mission' | 'emergency';
  title: string;
  description: string;
  timestamp: number;
  effects: { [key: string]: any };
}