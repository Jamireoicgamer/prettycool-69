import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { GAME_ITEMS } from '@/data/GameItems';
import { getInitialBaseModules } from '@/data/BaseModules';
import { gameReducer } from './gameReducer';
import { createGameActions } from './gameActions';
import { calculateOfflineProgress, applyOfflineProgress, generateOfflineNotifications } from '@/utils/OfflineProgressSystem';
import { CombatSynchronizer } from '@/utils/CombatSynchronizer';
import {
  GameState,
  InventoryItem,
  BaseModule,
  Notification,
  SquadMemberInventorySlot
} from '@/types/GameTypes';
import { PlayerCharacter } from '@/types/PlayerTypes';

export * from '@/types/GameTypes';

export interface GameContextType {
  gameState: GameState;
  login: (username: string) => boolean;
  spendCurrency: (type: string, amount: number) => boolean;
  addCurrency: (type: string, amount: number) => void;
  addExperience: (amount: number) => void;
  manageFusionCores: (action: string, coreId?: string) => void;
  upgradeModule: (moduleId: string) => void;
  toggleModule: (moduleId: string) => void;
  addItem: (itemId: string, quantity?: number) => void;
  removeItem: (itemId: string, quantity?: number) => void;
  useConsumable: (itemId: string, targetId?: string) => void;
  useChem: (chemId: string, targetId: string) => void;
  equipItem: (squadMemberId: string, itemId: string, slot: string) => void;
  unequipItem: (squadMemberId: string, slot: string) => void;
  transferItemToSquad: (itemId: string, squadMemberId: string, quantity: number) => void;
  transferItemFromSquad: (squadMemberId: string, itemIndex: number, quantity: number) => void;
  startMission: (missionId: string, squadMemberIds: string[], missionData?: any) => boolean;
  startRecruitment: () => boolean;
  startWorkerRecruitment: () => boolean;
  addNotification: (notification: Notification) => void;
  dismissNotification: (notificationId: string) => void;
  handleDialogueChoice: (notificationId: string, choiceIndex: number) => void;
  handleEventChoice: (eventId: string, choiceIndex: number) => void;
  getModuleDetails: (moduleId: string) => BaseModule | undefined;
  giveSquadMemberFood: (squadMemberId: string) => void;
  giveSquadMemberWater: (squadMemberId: string) => void;
  giveWorkerFood: (workerId: string) => void;
  giveWorkerWater: (workerId: string) => void;
  assignWorkerToModule: (workerId: string, moduleId: string) => void;
  unassignWorker: (workerId: string) => void;
  refreshTradingInventory: () => void;
  updateUISettings: (settings: Partial<GameState['uiSettings']>) => void;
  buyItem: (item: InventoryItem) => void;
  sellItem: (itemId: string, quantity: number) => void;
  refreshTrading: () => void;
  abortMission: (missionId: string) => void;
  respondToEncounter: (encounterId: string, choiceIndex: number) => void;
  supplyMedicalFacility: (supplyType: 'food' | 'water', amount: number) => void;
  assignWorkerToMedical: (workerId: string) => void;
  recoverKnockedOutMember: (memberId: string) => void;
  createPlayerCharacter: (character: PlayerCharacter) => void;
  feedPlayer: () => void;
  givePlayerWater: () => void;
  restPlayer: () => void;
  useRadAway: () => void;
  equipPlayerItem: (slot: string, itemId: string) => void;
  unequipPlayerItem: (slot: string) => void;
}

// Helper function to create empty inventory slots
const createEmptyInventorySlots = (): SquadMemberInventorySlot[] => {
  return Array.from({ length: 7 }, (_, index) => ({
    id: `slot-${index}`,
    item: null,
    quantity: 0
  }));
};

// Helper to create starting squad members with small stat ranges (1-3, one stat up to 6)
const createStartingMember = (id: string, specialization: 'combat' | 'stealth' | 'tech' | 'medic' | 'scavenger') => {
  const firstNames = ['Alex','Jordan','Casey','Morgan','Riley','Avery','Quinn','Sage','River','Phoenix','Marcus','Sarah'];
  const lastNames = ['Smith','Johnson','Williams','Brown','Taylor','Anderson','Martinez','Davis','Wilson','Moore'];
  const name = `${firstNames[Math.floor(Math.random()*firstNames.length)]} ${lastNames[Math.floor(Math.random()*lastNames.length)]}`;
  const baseStats = {
    combat: Math.floor(Math.random()*3)+1,
    stealth: Math.floor(Math.random()*3)+1,
    tech: Math.floor(Math.random()*3)+1,
    charisma: Math.floor(Math.random()*3)+1,
    intelligence: Math.floor(Math.random()*3)+1,
  } as any;
  const keys = ['combat','stealth','tech','charisma','intelligence'] as const;
  const boostKey = keys[Math.floor(Math.random()*keys.length)];
  baseStats[boostKey] = Math.max(baseStats[boostKey], Math.floor(Math.random()*6)+1);
  return {
    id,
    name,
    level: 1,
    specialization,
    status: 'available' as const,
    stats: {
      health: 100,
      maxHealth: 100,
      combat: baseStats.combat,
      stealth: baseStats.stealth,
      tech: baseStats.tech,
      charisma: baseStats.charisma,
      intelligence: baseStats.intelligence,
      hunger: 100,
      thirst: 100
    },
    equipment: { weapon: null, armor: null, accessory: null },
    inventory: createEmptyInventorySlots(),
    traits: [] as string[],
    // Progression defaults
    experience: 0,
    nextLevelExp: 100,
    perkPoints: 0,
    perks: [],
    autoPickPerks: false
  };
};

// ============ INITIAL STATE ============
const initialState: GameState = {
  isLoggedIn: false,
  username: 'Commander',
  playerCharacter: null,
  commanderLevel: 1,
  commanderExperience: 0,
  caps: 500,
  scrip: 20,
  nuclearFuel: 10,
  food: 20,
  water: 20,
  techFrags: 15,
  baseEnergy: 100,
  maxSquadSize: 6,
  maxWorkers: 2,
  storageUsed: 0,
  maxStorage: 100,
  vendorCaps: 1000,
  fusionCores: [
    {
      id: 'core-1',
      currentCharge: 1000,
      maxCharge: 1000,
      efficiency: 100,
      isActive: true
    }
  ],
  baseModules: getInitialBaseModules(),
  squad: [
    createStartingMember('member-1', 'combat'),
    createStartingMember('member-2', 'stealth')
  ].map(member => ({
    ...member,
    experience: 0,
    nextLevelExp: 100,
    perkPoints: 0,
    perks: [],
    autoPickPerks: false
  })),
  workers: [
    {
      id: 'worker-1',
      name: 'Jake Martinez',
      level: 1,
      status: 'available',
      stats: {
        health: 100,
        maxHealth: 100,
        hunger: 100,
        thirst: 100,
        precipitation: Math.floor(Math.random() * 10) + 1,
        strength: Math.floor(Math.random() * 10) + 1,
        agility: Math.floor(Math.random() * 10) + 1
      },
      equipment: {
        weapon: null,
        armor: null,
        accessory: null
      },
      inventory: [],
      traits: ['Hardworker']
    }
  ],
  inventory: [
    { ...GAME_ITEMS.find(item => item.id === 'stimpak')!, quantity: 5 },
    { ...GAME_ITEMS.find(item => item.id === 'nuka-cola')!, quantity: 3 },
    { ...GAME_ITEMS.find(item => item.id === 'steel')!, quantity: 10 },
    // Start with three uncommon firearms (no pipe pistols)
    { ...GAME_ITEMS.find(item => item.id === 'makeshift-rifle')!, quantity: 1 },
    { ...GAME_ITEMS.find(item => item.id === 'broken-laser-pistol')!, quantity: 1 },
    { ...GAME_ITEMS.find(item => item.id === 'scrap-shotgun')!, quantity: 1 }
  ],
  activeMissions: [],
  completedMissions: [],
  activeEvents: [],
  pendingNotifications: [],
  recruitmentCooldown: 0,
  combatCooldowns: {},
  encounterHistory: [],
  terminalLore: [],
  uiSettings: {
    buttonPosition: 'top',
    autoUseChems: false,
    autoPickPerks: false
  },
  customBackgrounds: {
    main: ''
  },
  tradingInventory: [],
  lastTradingRefresh: 0
};

// ============ CONTEXT IMPLEMENTATION ============
const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [gameState, dispatch] = useReducer(gameReducer, initialState);

  // Auto-save every second and enable offline progress
  useEffect(() => {
    const autoSave = setInterval(() => {
      const saveData = {
        ...gameState,
        lastSaveTime: Date.now()
      };
      localStorage.setItem('fallout-scrapline-save', JSON.stringify(saveData));
    }, 1000);

    return () => clearInterval(autoSave);
  }, [gameState]);

  // Load saved game and calculate offline progress
  useEffect(() => {
    const savedGame = localStorage.getItem('fallout-scrapline-save');
    if (savedGame) {
      try {
        const parsedGame = JSON.parse(savedGame);
        const offlineTime = Date.now() - (parsedGame.lastSaveTime || Date.now());
        
        // Calculate offline production
        if (offlineTime > 60000) { // More than 1 minute offline
          const offlineHours = offlineTime / (1000 * 60 * 60);
          dispatch({ type: 'CALCULATE_OFFLINE_PROGRESS', offlineHours });
        }
        
        Object.keys(parsedGame).forEach(key => {
          if (key in gameState && key !== 'lastSaveTime') {
            dispatch({ type: 'LOAD_SAVE', data: parsedGame });
          }
        });
      } catch (error) {
        console.error('Failed to load saved game:', error);
      }
    }
  }, []);

  // Squad needs update timer
  useEffect(() => {
    const needsInterval = setInterval(() => {
      dispatch({ type: 'UPDATE_SQUAD_NEEDS' });
    }, 1000);

    return () => clearInterval(needsInterval);
  }, []);

  // Production update timer (every second for live updates)
  useEffect(() => {
    const productionInterval = setInterval(() => {
      dispatch({ type: 'UPDATE_PRODUCTION' });
    }, 1000);

    return () => clearInterval(productionInterval);
  }, []);

  // Mission completion checker with retreat slowdown
  useEffect(() => {
    const checkMissions = () => {
      gameState.activeMissions.forEach(mission => {
        console.log(`[GameContext] Checking mission: ${mission.id}, type: ${mission.type}`);
        
        // Base end time
        const baseEnd = mission.startTime + mission.duration * 60000;
        // If any assigned member is knocked out or at critical HP (<=5), add 25% slower extraction
        const hasRetreatPenalty = gameState.squad.some(m =>
          mission.assignedSquad.includes(m.id) && (m.status === 'knocked-out' || m.stats.health <= 5)
        );
        const penaltyMultiplier = hasRetreatPenalty ? 1.25 : 1;
        const effectiveEnd = Math.floor(baseEnd * penaltyMultiplier);
        
        console.log(`[GameContext] Mission ${mission.id} - Current: ${Date.now()}, End: ${effectiveEnd}, Ready: ${Date.now() >= effectiveEnd}`);
        
        if (Date.now() >= effectiveEnd) {
          // Gate combat missions until the synchronized combat has actually ended
          if (mission.type === 'combat') {
            const sync = CombatSynchronizer.getInstance();
            const resultsReady = !!sync.getCombatResults(mission.id);
            const stillActive = sync.isCombatActive(mission.id);
            console.log(`[GameContext] Combat mission ${mission.id} - Results ready: ${resultsReady}, Still active: ${stillActive}`);
            if (!resultsReady || stillActive) {
              console.log(`[GameContext] Combat not ready, waiting for synchronizer...`);
              return; // wait for real combat end to persist health properly
            }
          }
          console.log(`[GameContext] Completing mission: ${mission.id}`);
          dispatch({ type: 'COMPLETE_MISSION', missionId: mission.id });
        }
      });
    };

    const missionInterval = setInterval(checkMissions, 2000); // Check every 2 seconds instead of 1
    return () => clearInterval(missionInterval);
  }, [gameState.activeMissions, gameState.squad]);

  // Update max squad size based on barracks level
  useEffect(() => {
    const barracks = gameState.baseModules.find(m => m.id === 'barracks');
    if (barracks) {
      const newMaxSquadSize = 6 + (barracks.level - 1) * 2;
      if (gameState.maxSquadSize !== newMaxSquadSize) {
        dispatch({ type: 'UPDATE_MAX_SQUAD_SIZE', maxSquadSize: newMaxSquadSize });
      }
    }
  }, [gameState.baseModules]);

  // ============ CONTEXT METHODS ============
  const addNotification = (notification: Notification) => {
    dispatch({ type: 'ADD_NOTIFICATION', notification });
  };

  const getModuleDetails = (moduleId: string): BaseModule | undefined => {
    return gameState.baseModules.find(module => module.id === moduleId);
  };

  // Create all game actions using the factory function
  const gameActions = createGameActions(gameState, dispatch, addNotification);

  const contextValue: GameContextType = {
    gameState,
    addNotification,
    getModuleDetails,
    ...gameActions
  };

  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
