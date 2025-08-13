import { GameState, InventoryItem, SquadMember, Mission, CompletedMission, Worker } from '@/types/GameTypes';
import { GAME_ITEMS } from '@/data/GameItems';
import { generateTraderInventory, getCurrentTrader } from '@/utils/TraderSystem';
import { generateSquadRecruit, generateWorkerRecruit } from '@/utils/RecruitGenerator';
import { addItemToSquadReducer } from './inventoryReducers';
import { pickWeatherForTerrain } from '@/data/WeatherEvents';
import { getTerrainByLocation } from '@/data/TerrainTypes';
import { SQUAD_PERKS } from '@/data/SquadPerks';
import { chooseEnemyPerks, chooseEnemyPerksForBalance } from '@/utils/PerkSystem';
import { CombatSynchronizer } from '@/utils/CombatSynchronizer';

export const manageFusionCoresReducer = (state: GameState, action: any): GameState => {
  switch (action.action) {
    case 'add':
      const newCore = {
        id: `core-${Date.now()}`,
        currentCharge: 1000,
        maxCharge: 1000,
        efficiency: 100,
        isActive: false
      };
      
      // Check if we're using inventory core
      const fusionCoreItem = state.inventory.find(item => item.id === 'fusion-core');
      if (fusionCoreItem && fusionCoreItem.quantity > 0) {
        return {
          ...state,
          fusionCores: [...state.fusionCores, newCore],
          inventory: state.inventory.map(item =>
            item.id === 'fusion-core'
              ? { ...item, quantity: item.quantity - 1 }
              : item
          ).filter(item => item.quantity > 0)
        };
      }
      
      return {
        ...state,
        fusionCores: [...state.fusionCores, newCore]
      };

    case 'remove':
      return {
        ...state,
        fusionCores: state.fusionCores.filter(core => core.id !== action.coreId)
      };

    case 'activate':
      return {
        ...state,
        fusionCores: state.fusionCores.map(core =>
          core.id === action.coreId ? { ...core, isActive: true } : core
        )
      };

    case 'deactivate':
      return {
        ...state,
        fusionCores: state.fusionCores.map(core =>
          core.id === action.coreId ? { ...core, isActive: false } : core
        )
      };

    default:
      return state;
  }
};

export const addItemReducer = (state: GameState, action: any): GameState => {
  const existingItemIndex = state.inventory.findIndex(item => item.id === action.itemId);
  
  if (existingItemIndex !== -1) {
    return {
      ...state,
      inventory: state.inventory.map((item, index) =>
        index === existingItemIndex
          ? { ...item, quantity: item.quantity + action.quantity }
          : item
      )
    };
    } else {
    const gameItem = GAME_ITEMS.find(item => item.id === action.itemId);
    if (gameItem) {
      return {
        ...state,
        inventory: [...state.inventory, { ...gameItem, quantity: action.quantity }]
      };
    }
  }
  
  return state;
};

export const removeItemReducer = (state: GameState, action: any): GameState => {
  return {
    ...state,
    inventory: state.inventory.map(item =>
      item.id === action.itemId
        ? { ...item, quantity: Math.max(0, item.quantity - action.quantity) }
        : item
    ).filter(item => item.quantity > 0)
  };
};

export const useConsumableReducer = (state: GameState, action: any): GameState => {
  const { itemId, targetId } = action;
  
  // Find the item in inventory
  const item = state.inventory.find(invItem => invItem.id === itemId);
  if (!item || item.quantity <= 0) return state;

  // Find the game item for effects
  const gameItem = GAME_ITEMS.find(gameItem => gameItem.id === itemId);
  if (!gameItem) return state;

  let newState = { ...state };

  // Remove item from inventory
  newState.inventory = newState.inventory.map(invItem =>
    invItem.id === itemId
      ? { ...invItem, quantity: invItem.quantity - 1 }
      : invItem
  ).filter(invItem => invItem.quantity > 0);

  // Apply effects based on target
  if (targetId) {
    // Apply to specific squad member
    const memberIndex = newState.squad.findIndex(member => member.id === targetId);
    if (memberIndex !== -1) {
      const member = { ...newState.squad[memberIndex] };
      
      // Special handling for stimpaks - revive knocked out members
      if (itemId === 'stimpak' && member.status === 'knocked-out') {
        member.status = 'available';
        member.knockedOutUntil = undefined;
        // Set health to minimum 30% of max health when reviving
        const minReviveHealth = Math.ceil(member.stats.maxHealth * 0.3);
        member.stats = {
          ...member.stats,
          health: Math.max(minReviveHealth, Math.min(member.stats.maxHealth, member.stats.health + 50))
        };
      } else if (gameItem.effects) {
        // Apply regular consumable effects
        member.stats = { ...member.stats };
        
        Object.entries(gameItem.effects).forEach(([effect, value]) => {
          switch (effect) {
            case 'health':
              member.stats.health = Math.min(member.stats.maxHealth, member.stats.health + (value as number));
              break;
            case 'hunger':
              member.stats.hunger = Math.min(100, member.stats.hunger + (value as number));
              break;
            case 'thirst':
              member.stats.thirst = Math.min(100, member.stats.thirst + (value as number));
              break;
          }
        });
      }

      // For chems, add to active chems with duration and trade-offs
      if (gameItem.type === 'chem' && gameItem.effects) {
        const duration = 300000; // 5 minutes in milliseconds
        const newChem = {
          id: itemId,
          name: gameItem.name,
          effects: gameItem.effects,
          duration,
          appliedAt: Date.now()
        };
        
        member.activeChems = [...(member.activeChems || []), newChem];
      }
      
      newState.squad = [
        ...newState.squad.slice(0, memberIndex),
        member,
        ...newState.squad.slice(memberIndex + 1)
      ];
    }
  } else if (newState.playerCharacter && gameItem.effects) {
    // Apply to player character
    newState.playerCharacter = { ...newState.playerCharacter } as any;
    
    Object.entries(gameItem.effects).forEach(([effect, value]) => {
      switch (effect) {
        case 'health':
          newState.playerCharacter!.health = Math.min(
            newState.playerCharacter!.maxHealth,
            newState.playerCharacter!.health + (value as number)
          );
          break;
        case 'hunger':
          newState.playerCharacter!.needs.hunger = Math.min(
            100,
            newState.playerCharacter!.needs.hunger + (value as number)
          );
          break;
        case 'thirst':
          newState.playerCharacter!.needs.thirst = Math.min(
            100,
            newState.playerCharacter!.needs.thirst + (value as number)
          );
          break;
        case 'radiation':
          newState.playerCharacter!.needs.radiation = Math.max(
            0,
            newState.playerCharacter!.needs.radiation + (value as number)
          );
          break;
      }
    });
  }

  return newState;
};

export const startMissionReducer = (state: GameState, action: any): GameState => {
  const { missionId, squadMemberIds, missionData } = action;
  
  // Check if squad members are available
  const availableMembers = squadMemberIds.filter((id: string) => {
    const member = state.squad.find(m => m.id === id);
    return member && member.status === 'available';
  });

  if (availableMembers.length === 0) return state;

  // Determine strongest squad member for level and perks
  const highestLevel = Math.max(
    ...availableMembers.map((id: string) => (state.squad.find(m => m.id === id)?.level || 1))
  );
  const highestPerkCount = Math.max(
    0,
    ...availableMembers.map((id: string) => (state.squad.find(m => m.id === id)?.perks?.length || 0))
  );

  // Assign enemies without artificial buffs; clamp accuracy, set level and balanced perks
  const scaledEnemies = (missionData.enemies || []).map((enemy: any, idx: number) => {
    const acc = Math.min(95, Math.max(30, enemy.accuracy ?? 60));
    const enemyPerks = chooseEnemyPerksForBalance(highestLevel, Math.max(0, highestPerkCount - 1));
    return {
      ...enemy,
      accuracy: acc,
      level: highestLevel,
      perks: enemyPerks
    };
  });

  // Determine terrain and weather
  const terrain = missionData.terrain || getTerrainByLocation(missionData.location).id;
  const weatherPick = missionData.weather ? { id: missionData.weather } : pickWeatherForTerrain(terrain);

  const mission: Mission = {
    id: missionId,
    title: missionData.title || 'Unknown Mission',
    type: missionData.type || 'mission',
    difficulty: missionData.difficulty || 1,
    duration: missionData.duration || 10,
    assignedSquad: availableMembers,
    startTime: Date.now(),
    location: missionData.location || 'Unknown Location',
    description: missionData.description,
    targetId: missionData.targetId,
    terrain,
    weather: weatherPick.id,
    includePlayer: missionData.includePlayer || false,
    rewards: missionData.rewards,
    enemies: scaledEnemies
  };

  // Update squad member status
  const updatedSquad = state.squad.map(member =>
    availableMembers.includes(member.id)
      ? { ...member, status: 'mission' as const }
      : member
  );

  // Deduct resources
  const foodCost = availableMembers.length * 2;
  const waterCost = availableMembers.length * 3;

  return {
    ...state,
    squad: updatedSquad,
    activeMissions: [...state.activeMissions, mission],
    food: Math.max(0, state.food - foodCost),
    water: Math.max(0, state.water - waterCost)
  };
};

export const completeMissionReducer = (state: GameState, action: any): GameState => {
  const mission = state.activeMissions.find(m => m.id === action.missionId);
  if (!mission) return state;

  let newState = { ...state };

  // Calculate experience gain based on mission difficulty and duration
  const baseExperience = (mission.rewards?.experience || 50) + (mission.difficulty * 25);
  const experiencePerMember = Math.floor(baseExperience / mission.assignedSquad.length);

  // Update squad members: return to base, apply final healths/KO, and grant experience
  const synchronizer = CombatSynchronizer.getInstance();
  const results = synchronizer.getCombatResults(mission.id);

  newState.squad = newState.squad.map(member => {
    if (mission.assignedSquad.includes(member.id)) {
      // Base update
      let updatedMember: SquadMember = {
        ...member,
        status: 'available',
        experience: (member.experience || 0) + experiencePerMember,
        nextLevelExp: member.nextLevelExp || 100
      };

      // Persist combat health results if available
      const finalHealth = results?.finalHealths?.[member.id];
      if (typeof finalHealth === 'number') {
        updatedMember.stats = {
          ...updatedMember.stats,
          health: Math.max(0, Math.floor(finalHealth))
        };
        if (finalHealth <= 0) {
          updatedMember.status = 'knocked-out' as const;
          updatedMember.knockedOutUntil = Date.now() + (2 * 60 * 60 * 1000); // 2 hours
        }
      }

      // Check for level up
      if (updatedMember.experience >= updatedMember.nextLevelExp) {
        updatedMember.level = (member.level || 1) + 1;
        updatedMember.perkPoints = (member.perkPoints || 0) + 1;
        updatedMember.nextLevelExp = Math.floor(updatedMember.nextLevelExp * 1.5);

        // Auto-pick perks if enabled
        const autoPickEnabled = member.autoPickPerks ?? state.uiSettings.autoPickPerks;
        if (autoPickEnabled && updatedMember.perkPoints > 0) {
          const availablePerks = SQUAD_PERKS.filter(perk => {
            const owned = new Set(member.perks || []);
            if (owned.has(perk.id)) return false;
            const levelReq = perk.requires?.level || 1;
            if (updatedMember.level < levelReq) return false;
            const priorPerks = perk.requires?.perks || [];
            return priorPerks.every(p => owned.has(p));
          });

          if (availablePerks.length > 0) {
            let preferredPerk = availablePerks.find(perk => {
              if (member.specialization === 'combat' && perk.path === 'assault') return true;
              if (member.specialization === 'stealth' && perk.path === 'scout') return true;
              if (member.specialization === 'tech' && perk.path === 'support') return true;
              if (member.specialization === 'medic' && perk.path === 'support') return true;
              return false;
            });
            if (!preferredPerk) preferredPerk = availablePerks[0];
            updatedMember.perks = [...(member.perks || []), preferredPerk.id];
            updatedMember.perkPoints = updatedMember.perkPoints - 1;

            newState.pendingNotifications = [
              ...newState.pendingNotifications,
              {
                id: `perk-selected-${member.id}-${Date.now()}`,
                type: 'success',
                title: 'Perk Auto-Selected!',
                message: `${member.name} learned ${preferredPerk.name}: ${preferredPerk.description}`,
                priority: 'low'
              }
            ];
          }
        }

        newState.pendingNotifications = [
          ...newState.pendingNotifications,
          {
            id: `levelup-${member.id}-${Date.now()}`,
            type: 'success',
            title: 'Squad Member Level Up!',
            message: `${member.name} reached level ${updatedMember.level} and gained a perk point!`,
            priority: 'medium'
          }
        ];
      }

      return updatedMember;
    }
    return member;
  });

  // Apply mission rewards
  if (mission.rewards) {
    newState.caps += mission.rewards.caps || 0;
    newState.commanderExperience += mission.rewards.experience || 0;
    
    if (mission.rewards.scrip) {
      newState.scrip += mission.rewards.scrip;
    }
    
    if (mission.rewards.techFrags) {
      newState.techFrags += mission.rewards.techFrags;
    }

    // Add reward items
    if (mission.rewards.items) {
      mission.rewards.items.forEach(itemId => {
        const existingItemIndex = newState.inventory.findIndex(item => item.id === itemId);
        if (existingItemIndex !== -1) {
          newState.inventory[existingItemIndex].quantity += 1;
        } else {
          const gameItem = GAME_ITEMS.find(item => item.id === itemId);
          if (gameItem) {
            newState.inventory.push({ ...gameItem, quantity: 1 });
          }
        }
      });
    }
  }

  // Move to completed missions
  const completedMission: CompletedMission = {
    ...mission,
    completedAt: Date.now(),
    success: results?.victory ?? true
  };

  newState.completedMissions = [...newState.completedMissions, completedMission];
  newState.activeMissions = newState.activeMissions.filter(m => m.id !== action.missionId);

  // Build detailed terminal report (online combat has rich report)
  const report = synchronizer.getCombatReport(mission.id);
  const memberMap = new Map(newState.squad.map(m => [m.id, m]));
  const finalHealths = results?.finalHealths || {};
  const casualties = Object.entries(finalHealths)
    .filter(([id, hp]) => (hp as number) <= 0)
    .map(([id]) => memberMap.get(id)?.name)
    .filter(Boolean) as string[];
  let topDamageLines: string[] = [];
  if (report?.events && report.events.length) {
    const dmgByActor: Record<string, number> = {};
    report.events.forEach(evt => {
      if (evt.type === 'damage' && evt.actor && typeof evt.damage === 'number') {
        dmgByActor[evt.actor] = (dmgByActor[evt.actor] || 0) + evt.damage;
      }
    });
    topDamageLines = Object.entries(dmgByActor)
      .sort((a,b) => b[1]-a[1])
      .slice(0,3)
      .map(([actor, dmg]) => `${actor}: ${Math.round(dmg)} dmg`);
  }
  const hpLines = mission.assignedSquad.map(id => {
    const m = memberMap.get(id);
    const hp = finalHealths[id];
    return m ? `${m.name}: ${typeof hp === 'number' ? Math.max(0, Math.floor(hp)) : m.stats.health}/${m.stats.maxHealth}` : '';
  }).filter(Boolean);

  const detailedContent = mission.type === 'combat'
    ? `Mission "${mission.title}" at ${mission.location} ${results?.victory ? 'ended in Victory' : 'ended in Defeat'}.
Duration: ${Math.floor((results?.actualDuration || 0))}s.
Squad Status: ${hpLines.join(', ')}${casualties.length ? `\nCasualties: ${casualties.join(', ')}` : ''}${topDamageLines.length ? `\nTop Damage: ${topDamageLines.join(' | ')}` : ''}`
    : `Operation "${mission.title}" at ${mission.location} completed.`;

  newState.terminalLore = [
    ...(newState.terminalLore || []),
    {
      id: `mission-${mission.id}-${Date.now()}`,
      title: mission.type === 'combat' ? 'Combat Report' : 'Operation Report',
      content: detailedContent,
      timestamp: Date.now(),
      unlockedBy: mission.type,
      category: mission.type === 'combat' ? 'combat' : 'operations'
    }
  ];

  // Add combat cooldown for combat missions
  if (mission.type === 'combat' && mission.targetId) {
    newState.combatCooldowns = {
      ...newState.combatCooldowns,
      [mission.targetId]: Date.now() + (10 * 60 * 1000) // 10 minutes
    };
  }

  return newState;
};

export const startRecruitmentReducer = (state: GameState, action: any): GameState => {
  const cost = 150 + (state.squad.length * 50);
  
  if (state.caps >= cost && state.squad.length < state.maxSquadSize) {
    const newRecruit = generateSquadRecruit();
    
    return {
      ...state,
      caps: state.caps - cost,
      squad: [...state.squad, {
        ...newRecruit,
        specialization: newRecruit.specialization as 'combat' | 'stealth' | 'tech' | 'medic' | 'scavenger',
        status: 'available' as const,
        equipment: { weapon: null, armor: null, accessory: null },
        inventory: Array.from({ length: 7 }, (_, index) => ({
          id: `${newRecruit.id}-slot-${index}`,
          item: null,
          quantity: 0
        })),
        experience: 0,
        nextLevelExp: 100,
        perkPoints: 0,
        perks: [],
        autoPickPerks: false
      }],
      recruitmentCooldown: Date.now() + (5 * 60 * 1000)
    };
  }
  
  return state;
};

export const updateSquadNeedsReducer = (state: GameState): GameState => {
  const now = Date.now();
  const lastUpdate = state.lastNeedsUpdate || now;
  const timeDiff = now - lastUpdate;
  
  if (timeDiff < 1000) return state; // Only update every second

  const hungerDecay = 0.02; // 0.02% per second
  const thirstDecay = 0.03; // 0.03% per second

  const updatedSquad = state.squad.map(member => ({
    ...member,
    stats: {
      ...member.stats,
      hunger: Math.max(0, member.stats.hunger - hungerDecay),
      thirst: Math.max(0, member.stats.thirst - thirstDecay)
    },
    // Clean up expired chems
    activeChems: (member.activeChems || []).filter(chem => 
      (chem.appliedAt + chem.duration) > now
    )
  }));

  const updatedWorkers = state.workers.map(worker => ({
    ...worker,
    stats: {
      ...worker.stats,
      hunger: Math.max(0, worker.stats.hunger - hungerDecay),
      thirst: Math.max(0, worker.stats.thirst - thirstDecay)
    }
  }));

  // Update player character needs if exists
  let updatedPlayerCharacter = state.playerCharacter;
  if (updatedPlayerCharacter) {
    updatedPlayerCharacter = {
      ...updatedPlayerCharacter,
      needs: {
        ...updatedPlayerCharacter.needs,
        hunger: Math.max(0, updatedPlayerCharacter.needs.hunger - hungerDecay),
        thirst: Math.max(0, updatedPlayerCharacter.needs.thirst - thirstDecay),
        sleep: Math.max(0, updatedPlayerCharacter.needs.sleep - 0.01) // Sleep decays slower
      }
    };
  }

  return {
    ...state,
    squad: updatedSquad,
    workers: updatedWorkers,
    playerCharacter: updatedPlayerCharacter,
    lastNeedsUpdate: now
  };
};

export const updateProductionReducer = (state: GameState): GameState => {
  const now = Date.now();
  const lastUpdate = state.lastProductionUpdate || now;
  const timeDiff = now - lastUpdate;
  
  if (timeDiff < 1000) return state; // Only update every second

  let newState = { ...state };

  // Calculate power efficiency
  const activeCores = state.fusionCores.filter(core => core.isActive && core.currentCharge > 0);
  const fusionGeneratorLevel = state.baseModules.find(m => m.id === 'fusion-generator')?.level || 1;
  const powerPerCore = 100 + (fusionGeneratorLevel - 1) * 25;
  const totalPowerGeneration = activeCores.length * powerPerCore;
  
  const totalPowerConsumption = state.baseModules
    .filter(module => module.isActive)
    .reduce((sum, module) => sum + module.energyCost, 0);
  
  const powerEfficiency = totalPowerConsumption > 0 
    ? Math.min(100, (totalPowerGeneration / totalPowerConsumption) * 100)
    : 100;

  // Update production modules
  newState.baseModules = state.baseModules.map(module => {
    if (!module.isActive) return module;

    const updatedModule = { ...module };

    // Food production
    if (module.type === 'food-production') {
      const assignedWorker = state.workers.find(w => w.assignedModule === module.id);
      let efficiency = powerEfficiency / 100;
      
      if (assignedWorker) {
        efficiency *= (1 + (assignedWorker.stats.agility * 0.05)); // 5% per agility point
      } else {
        efficiency *= 0.5; // 50% without worker
      }
      
      efficiency *= (1 + (module.level - 1) * 0.2); // 20% per level
      
      const productionRate = 1 * efficiency; // 1 per hour base
      const productionPerSecond = productionRate / 3600;
      
      if (Math.random() < productionPerSecond) {
        newState.food += 1;
      }
      
      updatedModule.efficiency = Math.min(100, efficiency * 100);
    }

    // Water purification
    if (module.type === 'water-purification') {
      const assignedWorker = state.workers.find(w => w.assignedModule === module.id);
      let efficiency = powerEfficiency / 100;
      
      if (assignedWorker) {
        efficiency *= (1 + (assignedWorker.stats.precipitation * 0.05)); // 5% per precipitation point
      } else {
        efficiency *= 0.5; // 50% without worker
      }
      
      efficiency *= (1 + (module.level - 1) * 0.2); // 20% per level
      
      const productionRate = 1 * efficiency; // 1 per hour base
      const productionPerSecond = productionRate / 3600;
      
      if (Math.random() < productionPerSecond) {
        newState.water += 1;
      }
      
      updatedModule.efficiency = Math.min(100, efficiency * 100);
    }

    // Medical facility healing
    if (module.type === 'medical-facility' && (module.storedFood || 0) > 0 && (module.storedWater || 0) > 0) {
      const baseHealRate = 10; // HP per minute
      const levelMultiplier = 1 + ((module.level - 1) * 0.25);
      const workerBonus = module.assignedWorker ? 1.2 : 0.8;
      const healRate = baseHealRate * levelMultiplier * workerBonus;
      const healPerSecond = healRate / 60;

      // Heal all squad members and workers
      newState.squad = newState.squad.map(member => {
        // Do not heal operatives while on missions to avoid HP popping during combat
        if (member.status === 'available' && member.stats.health < member.stats.maxHealth) {
          return {
            ...member,
            stats: {
              ...member.stats,
              health: Math.min(member.stats.maxHealth, member.stats.health + healPerSecond)
            }
          };
        }
        return member;
      });

      newState.workers = newState.workers.map(worker => {
        if (worker.stats.health < worker.stats.maxHealth) {
          return {
            ...worker,
            stats: {
              ...worker.stats,
              health: Math.min(worker.stats.maxHealth, worker.stats.health + healPerSecond)
            }
          };
        }
        return worker;
      });

      // Consume resources every hour
      if (Math.random() < (1 / 3600)) { // 1/3600 chance per second = once per hour
        updatedModule.storedFood = Math.max(0, (module.storedFood || 0) - 1);
        updatedModule.storedWater = Math.max(0, (module.storedWater || 0) - 1);
      }
    }

    return updatedModule;
  });

  return {
    ...newState,
    lastProductionUpdate: now
  };
};

export const refreshTradingReducer = (state: GameState): GameState => {
  const currentTrader = getCurrentTrader(Date.now());
  const newInventory = generateTraderInventory(currentTrader);
  
  return {
    ...state,
    tradingInventory: newInventory,
    lastTradingRefresh: Date.now(),
    currentTrader: currentTrader.id
  };
};

export const giveSquadFoodReducer = (state: GameState, action: any): GameState => {
  const member = state.squad.find(m => m.id === action.squadMemberId);
  if (!member || state.food <= 0) return state;

  return {
    ...state,
    food: state.food - 1,
    squad: state.squad.map(m =>
      m.id === action.squadMemberId
        ? {
            ...m,
            stats: {
              ...m.stats,
              hunger: Math.min(100, m.stats.hunger + 30)
            }
          }
        : m
    )
  };
};

export const giveSquadWaterReducer = (state: GameState, action: any): GameState => {
  const member = state.squad.find(m => m.id === action.squadMemberId);
  if (!member || state.water <= 0) return state;

  return {
    ...state,
    water: state.water - 1,
    squad: state.squad.map(m =>
      m.id === action.squadMemberId
        ? {
            ...m,
            stats: {
              ...m.stats,
              thirst: Math.min(100, m.stats.thirst + 25)
            }
          }
        : m
    )
  };
};

export const giveWorkerFoodReducer = (state: GameState, action: any): GameState => {
  const worker = state.workers.find(w => w.id === action.workerId);
  if (!worker || state.food <= 0) return state;

  return {
    ...state,
    food: state.food - 1,
    workers: state.workers.map(w =>
      w.id === action.workerId
        ? {
            ...w,
            stats: {
              ...w.stats,
              hunger: Math.min(100, w.stats.hunger + 30)
            }
          }
        : w
    )
  };
};

export const giveWorkerWaterReducer = (state: GameState, action: any): GameState => {
  const worker = state.workers.find(w => w.id === action.workerId);
  if (!worker || state.water <= 0) return state;

  return {
    ...state,
    water: state.water - 1,
    workers: state.workers.map(w =>
      w.id === action.workerId
        ? {
            ...w,
            stats: {
              ...w.stats,
              thirst: Math.min(100, w.stats.thirst + 25)
            }
          }
        : w
    )
  };
};

export const assignWorkerReducer = (state: GameState, action: any): GameState => {
  const worker = state.workers.find(w => w.id === action.workerId);
  if (!worker || worker.status !== 'available') return state;

  return {
    ...state,
    workers: state.workers.map(w =>
      w.id === action.workerId
        ? { ...w, status: 'assigned' as const, assignedModule: action.moduleId }
        : w
    ),
    baseModules: state.baseModules.map(module =>
      module.id === action.moduleId
        ? { ...module, assignedWorker: action.workerId }
        : module
    )
  };
};

export const unassignWorkerReducer = (state: GameState, action: any): GameState => {
  const worker = state.workers.find(w => w.id === action.workerId);
  if (!worker) return state;

  return {
    ...state,
    workers: state.workers.map(w =>
      w.id === action.workerId
        ? { ...w, status: 'available' as const, assignedModule: undefined }
        : w
    ),
    baseModules: state.baseModules.map(module =>
      module.assignedWorker === action.workerId
        ? { ...module, assignedWorker: undefined }
        : module
    )
  };
};

export const abortMissionReducer = (state: GameState, action: any): GameState => {
  const mission = state.activeMissions.find(m => m.id === action.missionId);
  if (!mission) return state;

  // Return squad members to available status
  const updatedSquad = state.squad.map(member =>
    mission.assignedSquad.includes(member.id)
      ? { ...member, status: 'available' as const }
      : member
  );

  return {
    ...state,
    squad: updatedSquad,
    activeMissions: state.activeMissions.filter(m => m.id !== action.missionId)
  };
};

export const respondToEncounterReducer = (state: GameState, action: any): GameState => {
  const encounter = state.encounterHistory.find(e => e.id === action.encounterId);
  if (!encounter) return state;

  const choice = encounter.choices[action.choiceIndex];
  if (!choice) return state;

  // Apply choice outcome
  let newState = { ...state };
  
  if (choice.outcome) {
    if (choice.outcome.caps) {
      newState.caps += choice.outcome.caps;
    }
    if (choice.outcome.experience) {
      newState.commanderExperience += choice.outcome.experience;
    }
  }

  // Mark encounter as responded
  newState.encounterHistory = state.encounterHistory.map(e =>
    e.id === action.encounterId
      ? { ...e, responded: true, outcome: choice.outcome }
      : e
  );

  return newState;
};

export const calculateOfflineProgressReducer = (state: GameState, action: any): GameState => {
  const offlineHours = action.offlineHours;
  let newState = { ...state };

  // Production from active modules with workers
  state.baseModules.forEach(module => {
    if (module.isActive && module.assignedWorker) {
      const worker = state.workers.find(w => w.id === module.assignedWorker);
      if (worker) {
        switch (module.type) {
          case 'food-production':
            const foodProduced = Math.floor(offlineHours * (worker.stats.agility / 10));
            newState.food += foodProduced;
            break;
          case 'water-purification':
            const waterProduced = Math.floor(offlineHours * (worker.stats.precipitation / 10));
            newState.water += waterProduced;
            break;
        }
      }
    }
  });

  // Decay needs for offline time
  if (newState.playerCharacter) {
    newState.playerCharacter = {
      ...newState.playerCharacter,
      needs: {
        ...newState.playerCharacter.needs,
        hunger: Math.max(0, newState.playerCharacter.needs.hunger - (offlineHours * 2)),
        thirst: Math.max(0, newState.playerCharacter.needs.thirst - (offlineHours * 3)),
        sleep: Math.max(0, newState.playerCharacter.needs.sleep - (offlineHours * 1.5))
      }
    };
  }

  newState.squad = newState.squad.map(member => ({
    ...member,
    stats: {
      ...member.stats,
      hunger: Math.max(0, member.stats.hunger - (offlineHours * 1.5)),
      thirst: Math.max(0, member.stats.thirst - (offlineHours * 2))
    }
  }));

  // Recover knocked out members based on offline time
  const now = Date.now();
  const offlineMs = offlineHours * 60 * 60 * 1000;
  newState.squad = newState.squad.map(member => {
    if ((member as any).knockedOutUntil && (member as any).knockedOutUntil <= now) {
      return { ...member, status: 'available' as const, knockedOutUntil: undefined };
    }
    return member;
  });

  // Complete missions that finished while offline and add terminal entries
  const completedIds: string[] = [];
  newState.activeMissions.forEach(mission => {
    const endTime = mission.startTime + mission.duration * 60000;
    if (endTime <= now) {
      completedIds.push(mission.id);
      // Return squad
      mission.assignedSquad.forEach(id => {
        const m = newState.squad.find(s => s.id === id);
        if (m) m.status = 'available';
      });
      // Push to completed
      newState.completedMissions.push({ ...mission, completedAt: now, success: true });
      // Add cooldown for combat targets
      if (mission.type === 'combat' && mission.targetId) {
        newState.combatCooldowns = { ...newState.combatCooldowns, [mission.targetId]: now + (10 * 60 * 1000) };
      }
      // Terminal entry
      newState.terminalLore = [
        ...(newState.terminalLore || []),
        {
          id: `offline-mission-${mission.id}-${now}`,
          title: mission.type === 'combat' ? 'Combat Report (Offline)' : 'Operation Report (Offline)',
          content: `Mission "${mission.title}" at ${mission.location} completed while you were offline. Rewards have been applied.`,
          timestamp: now,
          unlockedBy: mission.type,
          category: mission.type === 'combat' ? 'combat' : 'operations'
        }
      ];
    }
  });
  if (completedIds.length) {
    newState.activeMissions = newState.activeMissions.filter(m => !completedIds.includes(m.id));
  }

  return newState;
};