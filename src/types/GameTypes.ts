
import { PlayerCharacter } from './PlayerTypes';

export interface InventoryItem {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'consumable' | 'material' | 'chem' | 'fuel' | 'special' | 'accessory';
  rarity: 'common' | 'uncommon' | 'rare' | 'relic';
  description: string;
  value: number;
  weight: number;
  icon: string;
  function?: string;
  stats?: { [key: string]: number };
  effects?: { [key: string]: number };
  quantity: number;
  price?: number;
  currency?: 'caps' | 'scrip';
  stock?: number;
}

export interface BaseModule {
  id: string;
  name: string;
  type: 'power' | 'recruitment' | 'workshop' | 'medical-facility' | 'food-production' | 'water-purification' | 'barracks';
  level: number;
  maxLevel: number;
  isActive: boolean;
  energyCost: number;
  description: string;
  benefits: string[];
  upgradeRequirements: {
    caps: number;
    techFrags: number;
    materials: string[];
  };
  recruitmentActive?: boolean;
  assignedWorker?: string;
  lastProduction?: number;
  productionProgress?: number;
  efficiency?: number;
  storedFood?: number;
  storedWater?: number;
}

export interface FusionCore {
  id: string;
  currentCharge: number;
  maxCharge: number;
  efficiency: number;
  isActive: boolean;
  stationId?: string;
}

export interface ActiveChem {
  id: string;
  name: string;
  effects: { [key: string]: number };
  duration: number;
  appliedAt: number;
}

export interface SquadMemberInventorySlot {
  id: string;
  item: InventoryItem | null;
  quantity: number;
}

export interface SquadMember {
  id: string;
  name: string;
  level: number;
  specialization: 'combat' | 'stealth' | 'tech' | 'medic' | 'scavenger';
  status: 'available' | 'mission' | 'injured' | 'recruiting' | 'knocked-out';
  stats: {
    health: number;
    maxHealth: number;
    combat: number;
    stealth: number;
    tech: number;
    charisma: number;
    intelligence: number;
    hunger: number;
    thirst: number;
  };
  equipment: {
    weapon: string | null;
    armor: string | null;
    accessory: string | null;
  };
  inventory: SquadMemberInventorySlot[]; // 7 slots for general items
  traits?: string[];
  currentTerrain?: string;
  knockedOutUntil?: number;
  activeChems?: ActiveChem[];
  // Progression & perks
  experience: number;
  nextLevelExp: number;
  perkPoints: number;
  perks: string[];
  autoPickPerks: boolean;
}

export interface Worker {
  id: string;
  name: string;
  level: number;
  status: 'available' | 'assigned' | 'injured';
  assignedModule?: string;
  stats: {
    health: number;
    maxHealth: number;
    hunger: number;
    thirst: number;
    precipitation: number; // 1-10, affects water production
    strength: number; // 1-10, affects power efficiency
    agility: number; // 1-10, affects food production
  };
  equipment: {
    weapon: string | null;
    armor: string | null;
    accessory: string | null;
  };
  inventory: InventoryItem[];
  traits?: string[];
}

export interface Mission {
  id: string;
  title: string;
  type: 'mission' | 'combat' | 'exploration';
  difficulty: number;
  duration: number;
  assignedSquad: string[];
  startTime: number;
  location: string;
  description?: string;
  targetId?: string;
  terrain?: string;
  weather?: string;
  includePlayer?: boolean;
  rewards?: {
    caps: number;
    experience: number;
    scrip?: number;
    techFrags?: number;
    items?: string[];
  };
  enemies?: Array<{
    name: string;
    combat: number;
    health: number;
    weapon?: { damage: number; fireRate: number } | null;
  }>;
}

export interface CompletedMission {
  id: string;
  title: string;
  type: 'mission' | 'combat' | 'exploration';
  difficulty: number;
  duration: number;
  assignedSquad: string[];
  startTime: number;
  location: string;
  description?: string;
  targetId?: string;
  terrain?: string;
  rewards?: {
    caps: number;
    experience: number;
    scrip?: number;
    techFrags?: number;
    items?: string[];
  };
  enemies?: Array<{
    name: string;
    combat: number;
    health: number;
    weapon?: { damage: number; fireRate: number } | null;
  }>;
  completedAt: number;
  success: boolean;
}

export interface EncounterEvent {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: number;
  choices: { text: string; outcome: any }[];
  dialogueOptions?: { text: string; requirement?: { charisma?: number } }[];
  character?: { name: string; faction: string; image?: string };
  message?: string;
  outcome?: any;
  responded?: boolean;
}

export interface TerminalLoreEntry {
  id: string;
  title: string;
  content: string;
  timestamp: number;
  unlockedBy: string;
  category: 'operations' | 'combat' | 'general';
}

export interface Notification {
  id: string;
  type: 'combat' | 'mission' | 'trade' | 'default' | 'resource' | 'upgrade' | 'error' | 'success' | 'completion' | 'event';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  character?: { name: string; faction: string; image?: string };
  dialogueOptions?: { text: string; requirement?: { charisma?: number } }[];
}

export interface GameState {
  isLoggedIn: boolean;
  username: string;
  playerCharacter: PlayerCharacter | null;
  commanderLevel: number;
  commanderExperience: number;
  caps: number;
  scrip: number;
  nuclearFuel: number;
  food: number;
  water: number;
  techFrags: number;
  baseEnergy: number;
  maxSquadSize: number;
  maxWorkers: number;
  storageUsed: number;
  maxStorage: number;
  vendorCaps: number;
  fusionCores: FusionCore[];
  baseModules: BaseModule[];
  squad: SquadMember[];
  workers: Worker[];
  inventory: InventoryItem[];
  activeMissions: Mission[];
  completedMissions: CompletedMission[];
  activeEvents: EncounterEvent[];
  pendingNotifications: Notification[];
  recruitmentCooldown: number;
  combatCooldowns: { [key: string]: number };
  encounterHistory: EncounterEvent[];
  terminalLore: TerminalLoreEntry[];
  uiSettings: {
    buttonPosition: 'top' | 'bottom';
    autoUseChems?: boolean;
    autoPickPerks?: boolean;
  };
  customBackgrounds: {
    main: string;
  };
  tradingInventory: InventoryItem[];
  lastTradingRefresh: number;
  lastNeedsUpdate?: number;
  lastProductionUpdate?: number;
  lastEquipmentChange?: number;
  currentTrader?: string;
}
