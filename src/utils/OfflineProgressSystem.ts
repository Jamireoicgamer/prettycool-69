import { GameState, Notification } from '@/types/GameTypes';
import { PlayerCharacter, OfflineProgress, OfflineEvent } from '@/types/PlayerTypes';

export const calculateOfflineProgress = (
  gameState: GameState,
  offlineTimeMs: number
): OfflineProgress => {
  const offlineHours = offlineTimeMs / (1000 * 60 * 60);
  const events: OfflineEvent[] = [];
  const resourcesGenerated: { [key: string]: number } = {};
  const needsDecay: { [key: string]: number } = {};
  const missionsCompleted: string[] = [];

  console.log(`Calculating offline progress: ${offlineHours.toFixed(2)} hours offline`);

  // Resource production from base modules
  gameState.baseModules.forEach(module => {
    if (module.isActive && module.assignedWorker) {
      const worker = gameState.workers.find(w => w.id === module.assignedWorker);
      if (worker) {
        let productionRate = 1;
        
        switch (module.type) {
          case 'food-production':
            const foodProduced = Math.floor(offlineHours * productionRate * (worker.stats.agility / 10));
            resourcesGenerated.food = (resourcesGenerated.food || 0) + foodProduced;
            events.push({
              id: `food-${Date.now()}`,
              type: 'resource',
              title: 'Food Production',
              description: `${worker.name} produced ${foodProduced} food while you were away`,
              timestamp: Date.now() - Math.random() * offlineTimeMs,
              effects: { food: foodProduced }
            });
            break;
            
          case 'water-purification':
            const waterProduced = Math.floor(offlineHours * productionRate * (worker.stats.precipitation / 10));
            resourcesGenerated.water = (resourcesGenerated.water || 0) + waterProduced;
            events.push({
              id: `water-${Date.now()}`,
              type: 'resource',
              title: 'Water Purification',
              description: `${worker.name} purified ${waterProduced} water while you were away`,
              timestamp: Date.now() - Math.random() * offlineTimeMs,
              effects: { water: waterProduced }
            });
            break;
            
          case 'workshop':
            const materialsProduced = Math.floor(offlineHours * productionRate * (worker.stats.strength / 10));
            resourcesGenerated.techFrags = (resourcesGenerated.techFrags || 0) + materialsProduced;
            events.push({
              id: `materials-${Date.now()}`,
              type: 'resource',
              title: 'Workshop Production',
              description: `${worker.name} created ${materialsProduced} tech fragments while you were away`,
              timestamp: Date.now() - Math.random() * offlineTimeMs,
              effects: { techFrags: materialsProduced }
            });
            break;
        }
      }
    }
  });

  // Player character needs decay (if player exists)
  if (gameState.playerCharacter) {
    const hungerDecay = Math.min(100, Math.floor(offlineHours * 2)); // 2 per hour
    const thirstDecay = Math.min(100, Math.floor(offlineHours * 3)); // 3 per hour
    const sleepDecay = Math.min(100, Math.floor(offlineHours * 1.5)); // 1.5 per hour
    const radiationIncrease = Math.min(500, Math.floor(offlineHours * 0.5)); // 0.5 per hour

    needsDecay.hunger = hungerDecay;
    needsDecay.thirst = thirstDecay;
    needsDecay.sleep = sleepDecay;
    needsDecay.radiation = radiationIncrease;

    if (hungerDecay > 30 || thirstDecay > 30) {
      events.push({
        id: `needs-${Date.now()}`,
        type: 'emergency',
        title: 'Survival Needs Critical',
        description: `Your character's basic needs deteriorated while you were away. Hunger: -${hungerDecay}, Thirst: -${thirstDecay}`,
        timestamp: Date.now() - Math.random() * offlineTimeMs,
        effects: { hunger: -hungerDecay, thirst: -thirstDecay }
      });
    }
  }

  // Squad member needs decay
  gameState.squad.forEach(member => {
    const hungerDecay = Math.min(100, Math.floor(offlineHours * 1.5));
    const thirstDecay = Math.min(100, Math.floor(offlineHours * 2));
    
    if (hungerDecay > 20 || thirstDecay > 20) {
      events.push({
        id: `squad-needs-${member.id}-${Date.now()}`,
        type: 'resource',
        title: 'Squad Member Needs',
        description: `${member.name}'s needs decreased while you were away`,
        timestamp: Date.now() - Math.random() * offlineTimeMs,
        effects: { squadMember: member.id, hunger: -hungerDecay, thirst: -thirstDecay }
      });
    }
  });

  // Complete active missions that would have finished
  gameState.activeMissions.forEach(mission => {
    const missionEndTime = mission.startTime + (mission.duration * 60000);
    const currentTime = Date.now();
    
    if (missionEndTime <= currentTime) {
      missionsCompleted.push(mission.id);
      
      if (mission.rewards) {
        Object.entries(mission.rewards).forEach(([resource, amount]) => {
          if (typeof amount === 'number') {
            resourcesGenerated[resource] = (resourcesGenerated[resource] || 0) + amount;
          }
        });
      }
      
      events.push({
        id: `mission-${mission.id}-${Date.now()}`,
        type: 'mission',
        title: 'Mission Completed',
        description: `Mission "${mission.title}" was completed while you were away`,
        timestamp: missionEndTime,
        effects: mission.rewards || {}
      });
    }
  });

  // Random events during offline time
  const randomEventChance = Math.min(0.8, offlineHours * 0.1); // Max 80% chance
  if (Math.random() < randomEventChance) {
    const randomEvents = [
      {
        title: 'Scavenger Discovery',
        description: 'Your workers found valuable scrap while maintaining the base',
        effects: { caps: Math.floor(Math.random() * 50) + 10, steel: Math.floor(Math.random() * 10) + 5 }
      },
      {
        title: 'Successful Trade',
        description: 'A passing trader made a good deal with your settlement',
        effects: { caps: Math.floor(Math.random() * 100) + 25 }
      },
      {
        title: 'Equipment Maintenance',
        description: 'Your workers maintained equipment, improving efficiency',
        effects: { techFrags: Math.floor(Math.random() * 15) + 5 }
      },
      {
        title: 'Raider Deterrent',
        description: 'Your defenses successfully deterred a small raider group',
        effects: { experience: Math.floor(Math.random() * 50) + 25 }
      }
    ];
    
    const randomEvent = randomEvents[Math.floor(Math.random() * randomEvents.length)];
    Object.entries(randomEvent.effects).forEach(([resource, amount]) => {
      resourcesGenerated[resource] = (resourcesGenerated[resource] || 0) + amount;
    });
    
    events.push({
      id: `random-${Date.now()}`,
      type: 'random',
      title: randomEvent.title,
      description: randomEvent.description,
      timestamp: Date.now() - Math.random() * offlineTimeMs,
      effects: randomEvent.effects
    });
  }

  // Sort events by timestamp
  events.sort((a, b) => a.timestamp - b.timestamp);

  return {
    timeOffline: offlineTimeMs,
    resourcesGenerated,
    needsDecay,
    eventsOccurred: events,
    missionsCompleted
  };
};

export const applyOfflineProgress = (
  gameState: GameState,
  progress: OfflineProgress
): GameState => {
  const newState = { ...gameState };

  // Apply resource gains
  Object.entries(progress.resourcesGenerated).forEach(([resource, amount]) => {
    switch (resource) {
      case 'caps':
        newState.caps += amount;
        break;
      case 'food':
        newState.food += amount;
        break;
      case 'water':
        newState.water += amount;
        break;
      case 'techFrags':
        newState.techFrags += amount;
        break;
      case 'steel':
        // Add steel to inventory
        const steelItem = newState.inventory.find(item => item.id === 'steel');
        if (steelItem) {
          steelItem.quantity += amount;
        }
        break;
    }
  });

  // Apply player character needs decay
  if (newState.playerCharacter && Object.keys(progress.needsDecay).length > 0) {
    newState.playerCharacter = {
      ...newState.playerCharacter,
      needs: {
        ...newState.playerCharacter.needs,
        hunger: Math.max(0, newState.playerCharacter.needs.hunger - (progress.needsDecay.hunger || 0)),
        thirst: Math.max(0, newState.playerCharacter.needs.thirst - (progress.needsDecay.thirst || 0)),
        sleep: Math.max(0, newState.playerCharacter.needs.sleep - (progress.needsDecay.sleep || 0)),
        radiation: Math.min(1000, newState.playerCharacter.needs.radiation + (progress.needsDecay.radiation || 0))
      }
    };
  }

  // Apply squad member needs decay
  newState.squad = newState.squad.map(member => {
    const memberNeedsEvent = progress.eventsOccurred.find(event => 
      event.effects.squadMember === member.id
    );
    
    if (memberNeedsEvent) {
      return {
        ...member,
        stats: {
          ...member.stats,
          hunger: Math.max(0, member.stats.hunger + (memberNeedsEvent.effects.hunger || 0)),
          thirst: Math.max(0, member.stats.thirst + (memberNeedsEvent.effects.thirst || 0))
        }
      };
    }
    return member;
  });

  // Complete missions
  progress.missionsCompleted.forEach(missionId => {
    const mission = newState.activeMissions.find(m => m.id === missionId);
    if (mission) {
      // Move to completed missions
      newState.completedMissions.push({
        ...mission,
        completedAt: Date.now(),
        success: true
      });
      
      // Remove from active missions
      newState.activeMissions = newState.activeMissions.filter(m => m.id !== missionId);
      
      // Return squad members
      mission.assignedSquad.forEach(memberId => {
        const member = newState.squad.find(m => m.id === memberId);
        if (member) {
          member.status = 'available';
        }
      });
    }
  });

  return newState;
};

export const generateOfflineNotifications = (progress: OfflineProgress): Notification[] => {
  const notifications: Notification[] = [];

  // Summary notification
  const totalResources = Object.values(progress.resourcesGenerated).reduce((sum, amount) => sum + amount, 0);
  
  if (totalResources > 0 || progress.eventsOccurred.length > 0) {
    notifications.push({
      id: `offline-summary-${Date.now()}`,
      type: 'completion',
      title: 'Welcome Back, Commander!',
      message: `While you were away for ${Math.floor(progress.timeOffline / (1000 * 60 * 60))} hours, ${progress.eventsOccurred.length} events occurred. Your base generated ${totalResources} total resources.`,
      priority: 'medium'
    });
  }

  // Event-specific notifications
  progress.eventsOccurred.forEach(event => {
    notifications.push({
      id: `offline-event-${event.id}`,
      type: event.type as any,
      title: event.title,
      message: event.description,
      priority: event.type === 'emergency' ? 'high' : 'low'
    });
  });

  return notifications;
};