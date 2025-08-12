import { GameState } from '@/types/GameTypes';
import {
  manageFusionCoresReducer,
  addItemReducer,
  removeItemReducer,
  useConsumableReducer,
  startMissionReducer,
  completeMissionReducer,
  startRecruitmentReducer,
  updateSquadNeedsReducer,
  refreshTradingReducer,
  giveSquadFoodReducer,
  giveSquadWaterReducer,
  abortMissionReducer,
  respondToEncounterReducer,
  assignWorkerReducer,
  unassignWorkerReducer,
  giveWorkerFoodReducer,
  giveWorkerWaterReducer,
  updateProductionReducer,
  calculateOfflineProgressReducer
} from './gameReducers';
import {
  equipItemReducer as inventoryEquipItemReducer,
  unequipItemReducer as inventoryUnequipItemReducer,
  transferItemToSquadReducer as inventoryTransferItemToSquadReducer,
  transferItemFromSquadReducer as inventoryTransferItemFromSquadReducer
} from './inventoryReducers';
import { generateSquadRecruit, generateWorkerRecruit } from '@/utils/RecruitGenerator';
import { GAME_ITEMS } from '@/data/GameItems';

export const gameReducer = (state: GameState, action: any): GameState => {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, isLoggedIn: true, username: action.username };

    case 'CREATE_PLAYER_CHARACTER':
      return { ...state, playerCharacter: action.character };

    case 'FEED_PLAYER':
      if (state.playerCharacter && state.food > 0) {
        return {
          ...state,
          food: state.food - 1,
          playerCharacter: {
            ...state.playerCharacter,
            needs: {
              ...state.playerCharacter.needs,
              hunger: Math.min(100, state.playerCharacter.needs.hunger + 25)
            }
          }
        };
      }
      return state;

    case 'GIVE_PLAYER_WATER':
      if (state.playerCharacter && state.water > 0) {
        return {
          ...state,
          water: state.water - 1,
          playerCharacter: {
            ...state.playerCharacter,
            needs: {
              ...state.playerCharacter.needs,
              thirst: Math.min(100, state.playerCharacter.needs.thirst + 25)
            }
          }
        };
      }
      return state;

    case 'REST_PLAYER':
      if (state.playerCharacter) {
        return {
          ...state,
          playerCharacter: {
            ...state.playerCharacter,
            needs: {
              ...state.playerCharacter.needs,
              sleep: Math.min(100, state.playerCharacter.needs.sleep + 50)
            }
          }
        };
      }
      return state;

    case 'USE_RADAWAY':
      const radAwayItem = state.inventory.find(item => item.id === 'radaway');
      if (state.playerCharacter && radAwayItem && radAwayItem.quantity > 0) {
        return {
          ...state,
          inventory: state.inventory.map(item => 
            item.id === 'radaway' 
              ? { ...item, quantity: item.quantity - 1 }
              : item
          ),
          playerCharacter: {
            ...state.playerCharacter,
            needs: {
              ...state.playerCharacter.needs,
              radiation: Math.max(0, state.playerCharacter.needs.radiation - 100)
            }
          }
        };
      }
      return state;

    case 'LOAD_SAVE':
      return { ...state, ...action.data };

    case 'CALCULATE_OFFLINE_PROGRESS':
      return calculateOfflineProgressReducer(state, action);

    case 'SPEND_CURRENCY':
      if ((state[action.currencyType as keyof GameState] as number) >= action.amount) {
        return {
          ...state,
          [action.currencyType]: (state[action.currencyType as keyof GameState] as number) - action.amount
        };
      }
      return state;

    case 'ADD_CURRENCY':
      return {
        ...state,
        [action.currencyType]: (state[action.currencyType as keyof GameState] as number) + action.amount
      };

    case 'ADD_EXPERIENCE':
      const newExp = state.commanderExperience + action.amount;
      const newLevel = Math.floor(newExp / 100) + 1;
      return {
        ...state,
        commanderExperience: newExp,
        commanderLevel: Math.max(state.commanderLevel, newLevel)
      };

    case 'MANAGE_FUSION_CORES':
      return manageFusionCoresReducer(state, action);

    case 'UPGRADE_MODULE':
      const moduleToUpgrade = state.baseModules.find(m => m.id === action.moduleId);
      if (!moduleToUpgrade || moduleToUpgrade.level >= moduleToUpgrade.maxLevel) {
        return state;
      }

      const upgradeCost = {
        caps: Math.floor(moduleToUpgrade.upgradeRequirements.caps * Math.pow(1.2, moduleToUpgrade.level - 1)),
        techFrags: Math.floor(moduleToUpgrade.upgradeRequirements.techFrags * Math.pow(1.2, moduleToUpgrade.level - 1))
      };

      if (state.caps < upgradeCost.caps || state.techFrags < upgradeCost.techFrags) {
        return state;
      }

      const updatedState = {
        ...state,
        caps: state.caps - upgradeCost.caps,
        techFrags: state.techFrags - upgradeCost.techFrags,
        baseModules: state.baseModules.map(module =>
          module.id === action.moduleId 
            ? { ...module, level: module.level + 1 }
            : module
        )
      };

      // Update max squad size if barracks was upgraded
      if (action.moduleId === 'barracks') {
        const barracks = updatedState.baseModules.find(m => m.id === 'barracks');
        if (barracks) {
          const newMaxSquadSize = 6 + ((barracks.level - 1) * 2);
          updatedState.maxSquadSize = newMaxSquadSize;
        }
      }

      return updatedState;

    case 'TOGGLE_MODULE':
      const toggledState = {
        ...state,
        baseModules: state.baseModules.map(module =>
          module.id === action.moduleId
            ? { ...module, isActive: !module.isActive }
            : module
        )
      };

      // If toggling fusion generator, update fusion core states
      if (action.moduleId === 'fusion-generator') {
        const fusionGenerator = toggledState.baseModules.find(m => m.id === 'fusion-generator');
        if (!fusionGenerator?.isActive) {
          toggledState.fusionCores = state.fusionCores.map(core => ({
            ...core,
            isActive: false
          }));
        }
      }

      return toggledState;

    case 'UPDATE_MAX_SQUAD_SIZE':
      return {
        ...state,
        maxSquadSize: action.maxSquadSize
      };

    case 'UPDATE_PRODUCTION':
      let productionState = updateProductionReducer(state);
      
      // Calculate total power consumption
      const totalPowerConsumption = productionState.baseModules
        .filter(module => module.isActive)
        .reduce((total, module) => total + (module.energyCost || 0), 0);
      
      // Update fusion core consumption with 4-hour base duration and power scaling
      const activeCores = productionState.fusionCores.filter(core => core.isActive);
      
      if (activeCores.length > 0 && totalPowerConsumption > 0) {
        // Base duration: 4 hours (14400 seconds)
        const baseDurationSeconds = 4 * 60 * 60;
        
        // Calculate consumption rate based on power usage
        // Lower power usage = longer duration, higher power usage = shorter duration
        const powerEfficiencyMultiplier = Math.max(0.5, Math.min(2.0, 10 / totalPowerConsumption));
        const effectiveDuration = baseDurationSeconds * powerEfficiencyMultiplier;
        
        // Calculate consumption per second per core
        const consumptionPerSecondPerCore = 1000 / (effectiveDuration / activeCores.length);
        
        productionState.fusionCores = productionState.fusionCores.map(core => {
          if (core.isActive && core.currentCharge > 0) {
            const newCharge = Math.max(0, core.currentCharge - consumptionPerSecondPerCore);
            return { ...core, currentCharge: newCharge };
          }
          return core;
        });
      }
      
      return productionState;

    case 'ADD_ITEM':
      return addItemReducer(state, action);

    case 'REMOVE_ITEM':
      return removeItemReducer(state, action);

    case 'USE_CONSUMABLE':
      return useConsumableReducer(state, action);

    case 'EQUIP_ITEM':
      return inventoryEquipItemReducer(state, action);

    case 'UNEQUIP_ITEM':
      return inventoryUnequipItemReducer(state, action);

    case 'TRANSFER_ITEM_TO_SQUAD':
      return inventoryTransferItemToSquadReducer(state, action);

    case 'TRANSFER_ITEM_FROM_SQUAD':
      return inventoryTransferItemFromSquadReducer(state, action);

    case 'START_MISSION':
      return startMissionReducer(state, action);

    case 'COMPLETE_MISSION':
      return completeMissionReducer(state, action);

    case 'START_RECRUITMENT':
      return startRecruitmentReducer(state, action);

    case 'START_WORKER_RECRUITMENT':
      const workerCost = 200 + (state.workers.length * 75);
      if (state.caps >= workerCost && state.workers.length < state.maxWorkers) {
        const newWorker = generateWorkerRecruit();
        return {
          ...state,
          caps: state.caps - workerCost,
          workers: [...state.workers, {
            ...newWorker,
            status: 'available' as const,
            equipment: { weapon: null, armor: null, accessory: null },
            inventory: []
          }],
          recruitmentCooldown: Date.now() + (5 * 60 * 1000) // 5 minutes
        };
      }
      return state;

    case 'ADD_NOTIFICATION':
      return {
        ...state,
        pendingNotifications: [...state.pendingNotifications, action.notification]
      };

    case 'DISMISS_NOTIFICATION':
      return {
        ...state,
        pendingNotifications: state.pendingNotifications.filter(n => n.id !== action.notificationId)
      };

    case 'UPDATE_SQUAD_NEEDS':
      return updateSquadNeedsReducer(state);

    case 'GIVE_SQUAD_FOOD':
      return giveSquadFoodReducer(state, action);

    case 'GIVE_SQUAD_WATER':
      return giveSquadWaterReducer(state, action);

    case 'REFRESH_TRADING':
      return refreshTradingReducer(state);

    case 'UPDATE_UI_SETTINGS':
      return {
        ...state,
        uiSettings: {
          ...state.uiSettings,
          ...action.settings
        }
      };

    case 'CHOOSE_SQUAD_PERK': {
      const { memberId, perkId } = action;
      const idx = state.squad.findIndex(m => m.id === memberId);
      if (idx === -1) return state;
      const member = state.squad[idx];
      const perkPoints = (member.perkPoints ?? 0);
      if (perkPoints <= 0) return state;
      // Prevent duplicates
      const owned = new Set(member.perks ?? []);
      if (owned.has(perkId)) return state;

      const updated = { ...member, perks: [...(member.perks ?? []), perkId], perkPoints: perkPoints - 1 };
      return {
        ...state,
        squad: state.squad.map((m, i) => i === idx ? updated : m)
      };
    }

    case 'USE_CONSUMABLE_ON_MEMBER': {
      const { itemId, memberId } = action.payload;
      const item = GAME_ITEMS.find(item => item.id === itemId);
      
      if (!item) return state;
      
      let newState = { ...state };
      
      // Remove item from inventory  
      const inventoryItem = newState.inventory.find(invItem => invItem.id === itemId);
      if (inventoryItem && inventoryItem.quantity > 0) {
        newState.inventory = newState.inventory.map(invItem => 
          invItem.id === itemId 
            ? { ...invItem, quantity: invItem.quantity - 1 }
            : invItem
        );
      }
      
      // Apply item effects based on type
      if (item.type === 'chem' && item.effects) {
        // Find the squad member
        const memberIndex = newState.squad.findIndex(member => member.id === memberId);
        if (memberIndex !== -1) {
          const member = { ...newState.squad[memberIndex] };
          
          // Special handling for stimpaks - revive knocked out members
          if (itemId === 'stimpak' && member.status === 'knocked-out') {
            member.status = 'available';
            member.knockedOutUntil = undefined;
            member.stats = {
              ...member.stats,
              health: Math.min(member.stats.maxHealth, member.stats.health + 50) // Heal 50 HP
            };
            
            newState.pendingNotifications = [
              ...newState.pendingNotifications,
              {
                id: Date.now().toString(),
                title: 'Revival Successful',
                message: `${member.name} has been revived with a Stimpak and is back in action!`,
                type: 'success',
                priority: 'medium'
              }
            ];
          }
          
          // Create new active chem with effects and duration
          const newChem = {
            id: itemId,
            name: item.name,
            effects: item.effects,
            duration: 300, // 5 minutes default
            timeRemaining: 300,
            appliedAt: Date.now()
          };
          
          // Add to active chems (replace if same chem exists)
          const existingChemIndex = (member.activeChems || []).findIndex(chem => chem.id === itemId);
          if (existingChemIndex !== -1) {
            member.activeChems![existingChemIndex] = newChem;
          } else {
            member.activeChems = [...(member.activeChems || []), newChem];
          }
          
          newState.squad = [
            ...newState.squad.slice(0, memberIndex),
            member,
            ...newState.squad.slice(memberIndex + 1)
          ];
        }
      }
      
      return newState;
    }

    case 'EQUIP_PLAYER_ITEM':
      if (state.playerCharacter) {
        const newEquipment = { ...state.playerCharacter.equipment };
        newEquipment[action.slot as keyof typeof newEquipment] = action.itemId;
        return {
          ...state,
          playerCharacter: {
            ...state.playerCharacter,
            equipment: newEquipment
          }
        };
      }
      return state;

    case 'UNEQUIP_PLAYER_ITEM':
      if (state.playerCharacter) {
        const newEquipment = { ...state.playerCharacter.equipment };
        newEquipment[action.slot as keyof typeof newEquipment] = null;
        return {
          ...state,
          playerCharacter: {
            ...state.playerCharacter,
            equipment: newEquipment
          }
        };
      }
      return state;

    default:
      return state;
  }
};
