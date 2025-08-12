import { GameState, Notification, InventoryItem } from '@/types/GameTypes';

export const createGameActions = (gameState: GameState, dispatch: any, addNotification: (notification: Notification) => void) => {
  const login = (username: string) => {
    dispatch({ type: 'LOGIN', username });
    
    // If no player character exists, trigger character creation
    if (!gameState.playerCharacter) {
      addNotification({
        id: `character-creation-${Date.now()}`,
        type: 'default',
        title: 'Welcome to the Wasteland!',
        message: 'Create your character to begin your journey.',
        priority: 'high'
      });
    }
    
    return true;
  };

  const spendCurrency = (type: string, amount: number) => {
    if ((gameState[type as keyof GameState] as number) >= amount) {
      dispatch({ type: 'SPEND_CURRENCY', currencyType: type, amount });
      return true;
    }
    return false;
  };

  const addCurrency = (type: string, amount: number) => {
    dispatch({ type: 'ADD_CURRENCY', currencyType: type, amount });
  };

  const addExperience = (amount: number) => {
    dispatch({ type: 'ADD_EXPERIENCE', amount });
  };

  const manageFusionCores = (action: string, coreId?: string) => {
    dispatch({ type: 'MANAGE_FUSION_CORES', action, coreId });
  };

  const upgradeModule = (moduleId: string) => {
    const module = gameState.baseModules.find(m => m.id === moduleId);
    if (!module || module.level >= module.maxLevel) return;

    const costs = module.upgradeRequirements;
    if (gameState.caps >= costs.caps && gameState.techFrags >= costs.techFrags) {
      dispatch({ type: 'SPEND_CURRENCY', currencyType: 'caps', amount: costs.caps });
      dispatch({ type: 'SPEND_CURRENCY', currencyType: 'techFrags', amount: costs.techFrags });
      dispatch({ type: 'UPGRADE_MODULE', moduleId });
    }
  };

  const toggleModule = (moduleId: string) => {
    dispatch({ type: 'TOGGLE_MODULE', moduleId });
  };

  const addItem = (itemId: string, quantity: number = 1) => {
    dispatch({ type: 'ADD_ITEM', itemId, quantity });
  };

  const removeItem = (itemId: string, quantity: number = 1) => {
    dispatch({ type: 'REMOVE_ITEM', itemId, quantity });
  };

  const useConsumable = (itemId: string, targetId?: string) => {
    dispatch({ type: 'USE_CONSUMABLE', itemId, targetId });
  };

  const useChem = (chemId: string, targetId: string) => {
    dispatch({ type: 'USE_CONSUMABLE', itemId: chemId, targetId });
  };

  const chooseSquadPerk = (memberId: string, perkId: string) => {
    dispatch({ type: 'CHOOSE_SQUAD_PERK', memberId, perkId });
  };

  const equipItem = (squadMemberId: string, itemId: string, slot: string) => {
    // Allow equipping duplicates if you own multiple copies
    dispatch({ type: 'EQUIP_ITEM', squadMemberId, itemId, slot });
  };

  const unequipItem = (squadMemberId: string, slot: string) => {
    dispatch({ type: 'UNEQUIP_ITEM', squadMemberId, slot });
  };

  const transferItemToSquad = (itemId: string, squadMemberId: string, quantity: number) => {
    // Check if item is equipped by anyone
    const isEquipped = gameState.squad.some(member => 
      member.equipment.weapon === itemId ||
      member.equipment.armor === itemId ||
      member.equipment.accessory === itemId
    );

    if (isEquipped) {
      addNotification({
        id: `transfer-error-${Date.now()}`,
        type: 'error',
        title: 'Transfer Error',
        message: 'Cannot transfer equipped items. Unequip first!',
        priority: 'medium'
      });
      return;
    }

    const member = gameState.squad.find(m => m.id === squadMemberId);
    const emptySlots = member?.inventory.filter(slot => slot.item === null).length || 0;
    
    if (emptySlots === 0) {
      addNotification({
        id: `inventory-full-${Date.now()}`,
        type: 'error',
        title: 'Inventory Full',
        message: `${member?.name}'s inventory is full!`,
        priority: 'medium'
      });
      return;
    }

    dispatch({ type: 'TRANSFER_ITEM_TO_SQUAD', itemId, squadMemberId, quantity });
  };

  const transferItemFromSquad = (squadMemberId: string, itemIndex: number, quantity: number) => {
    const member = gameState.squad.find(m => m.id === squadMemberId);
    if (!member || itemIndex >= member.inventory.length) return;

    const slot = member.inventory[itemIndex];
    if (!slot?.item) return;
    
    // Check if item is equipped
    const isEquipped = gameState.squad.some(squadMember => 
      squadMember.equipment.weapon === slot.item!.id ||
      squadMember.equipment.armor === slot.item!.id ||
      squadMember.equipment.accessory === slot.item!.id
    );

    if (isEquipped) {
      addNotification({
        id: `transfer-error-${Date.now()}`,
        type: 'error',
        title: 'Transfer Error',
        message: 'Cannot transfer equipped items. Unequip first!',
        priority: 'medium'
      });
      return;
    }

    dispatch({ type: 'TRANSFER_ITEM_FROM_SQUAD', squadMemberId, itemIndex, quantity });
  };

  const startMission = (missionId: string, squadMemberIds: string[], missionData?: any) => {
    const actualMissionData = missionData || {
      title: `Mission ${missionId}`,
      type: 'mission',
      difficulty: 1,
      duration: 5,
      location: 'Unknown Location',
      description: 'A standard mission',
      includePlayer: false
    };

    // Add option to include player character
    if (missionData?.includePlayer && gameState.playerCharacter) {
      actualMissionData.includePlayer = true;
    }

    // Auto-use chems if enabled and this is a combat mission
    if (gameState.uiSettings.autoUseChems && (actualMissionData.type === 'combat' || actualMissionData.id?.startsWith('combat-'))) {
      squadMemberIds.forEach(memberId => {
        const member = gameState.squad.find(m => m.id === memberId);
        if (member) {
          // Find suitable chem based on specialization
          let suitableChem = null;
          if (member.specialization === 'combat') {
            suitableChem = gameState.inventory.find(item => item.id === 'psycho' && item.quantity > 0);
          } else if (member.specialization === 'stealth') {
            suitableChem = gameState.inventory.find(item => item.id === 'jet' && item.quantity > 0);
          } else if (member.specialization === 'tech') {
            suitableChem = gameState.inventory.find(item => item.id === 'mentats' && item.quantity > 0);
          }
          
          if (suitableChem) {
            dispatch({ type: 'USE_CONSUMABLE', itemId: suitableChem.id, targetId: member.id });
          }
        }
      });
    }

    const success = dispatch({ 
      type: 'START_MISSION', 
      missionId, 
      squadMemberIds, 
      missionData: actualMissionData 
    });
    
    if (success !== false) {
      const participants = actualMissionData.includePlayer ? 
        `Squad + ${gameState.playerCharacter?.name}` : 'Squad';
      
      addNotification({
        id: `mission-start-${Date.now()}`,
        type: 'success',
        title: 'Mission Started',
        message: `${participants} deployed on: ${actualMissionData.title}`,
        priority: 'medium'
      });
      return true;
    }
    return false;
  };

  const startRecruitment = () => {
    const cost = 150 + (gameState.squad.length * 50);
    if (gameState.caps >= cost && gameState.squad.length < gameState.maxSquadSize) {
      dispatch({ type: 'START_RECRUITMENT' });
      return true;
    }
    return false;
  };

  const startWorkerRecruitment = () => {
    const cost = 200 + (gameState.workers.length * 75);
    if (gameState.caps >= cost && gameState.workers.length < gameState.maxWorkers) {
      dispatch({ type: 'START_WORKER_RECRUITMENT' });
      return true;
    }
    return false;
  };

  const dismissNotification = (notificationId: string) => {
    dispatch({ type: 'DISMISS_NOTIFICATION', notificationId });
  };

  const handleDialogueChoice = (notificationId: string, choiceIndex: number) => {
    // Handle dialogue choice logic
  };

  const handleEventChoice = (eventId: string, choiceIndex: number) => {
    // Handle event choice logic
  };

  const giveSquadMemberFood = (squadMemberId: string) => {
    dispatch({ type: 'GIVE_SQUAD_FOOD', squadMemberId });
  };

  const giveSquadMemberWater = (squadMemberId: string) => {
    dispatch({ type: 'GIVE_SQUAD_WATER', squadMemberId });
  };

  const giveWorkerFood = (workerId: string) => {
    dispatch({ type: 'GIVE_WORKER_FOOD', workerId });
  };

  const giveWorkerWater = (workerId: string) => {
    dispatch({ type: 'GIVE_WORKER_WATER', workerId });
  };

  const assignWorkerToModule = (workerId: string, moduleId: string) => {
    dispatch({ type: 'ASSIGN_WORKER', workerId, moduleId });
  };

  const unassignWorker = (workerId: string) => {
    dispatch({ type: 'UNASSIGN_WORKER', workerId });
  };

  const refreshTradingInventory = () => {
    dispatch({ type: 'REFRESH_TRADING' });
  };

  const updateUISettings = (settings: Partial<GameState['uiSettings']>) => {
    dispatch({ type: 'UPDATE_UI_SETTINGS', settings });
  };

  const buyItem = (item: InventoryItem) => {
    if (item.currency === 'scrip' && gameState.scrip >= (item.price || 0)) {
      dispatch({ type: 'SPEND_CURRENCY', currencyType: 'scrip', amount: item.price });
      dispatch({ type: 'ADD_ITEM', itemId: item.id, quantity: 1 });
    } else if (gameState.caps >= (item.price || 0)) {
      dispatch({ type: 'SPEND_CURRENCY', currencyType: 'caps', amount: item.price });
      dispatch({ type: 'ADD_ITEM', itemId: item.id, quantity: 1 });
    }
  };

  const sellItem = (itemId: string, quantity: number) => {
    dispatch({ type: 'REMOVE_ITEM', itemId, quantity });
  };

  const refreshTrading = () => {
    dispatch({ type: 'REFRESH_TRADING' });
  };

  const abortMission = (missionId: string) => {
    dispatch({ type: 'ABORT_MISSION', missionId });
  };

  const respondToEncounter = (encounterId: string, choiceIndex: number) => {
    dispatch({ type: 'RESPOND_TO_ENCOUNTER', encounterId, choiceIndex });
  };

  const supplyMedicalFacility = (supplyType: 'food' | 'water', amount: number) => {
    dispatch({ type: 'SUPPLY_MEDICAL_FACILITY', supplyType, amount });
  };

  const assignWorkerToMedical = (workerId: string) => {
    dispatch({ type: 'ASSIGN_WORKER_TO_MEDICAL', workerId });
  };

  const recoverKnockedOutMember = (memberId: string) => {
    dispatch({ type: 'RECOVER_KNOCKED_OUT_MEMBER', memberId });
  };

  const createPlayerCharacter = (character: any) => {
    dispatch({ type: 'CREATE_PLAYER_CHARACTER', character });
  };

  const feedPlayer = () => {
    if (gameState.food > 0 && gameState.playerCharacter) {
      dispatch({ type: 'FEED_PLAYER' });
    }
  };

  const givePlayerWater = () => {
    if (gameState.water > 0 && gameState.playerCharacter) {
      dispatch({ type: 'GIVE_PLAYER_WATER' });
    }
  };

  const restPlayer = () => {
    if (gameState.playerCharacter) {
      dispatch({ type: 'REST_PLAYER' });
    }
  };

  const useRadAway = () => {
    const radAwayItem = gameState.inventory.find(item => item.id === 'radaway');
    if (radAwayItem && radAwayItem.quantity > 0 && gameState.playerCharacter) {
      dispatch({ type: 'USE_RADAWAY' });
    }
  };

  const equipPlayerItem = (slot: string, itemId: string) => {
    if (!gameState.playerCharacter) return;

    // Check if item exists in inventory
    const item = gameState.inventory.find(inv => inv.id === itemId);
    if (!item || item.quantity <= 0) {
      addNotification({
        id: `equip-error-${Date.now()}`,
        type: 'error',
        title: 'Equipment Error',
        message: 'Item not found in inventory!',
        priority: 'medium'
      });
      return;
    }

    // Check if item type matches slot
    const validSlots: { [key: string]: string[] } = {
      weapon: ['weapon'],
      armor: ['armor', 'clothing'],
      accessory: ['accessory', 'aid']
    };

    if (!validSlots[slot]?.includes(item.type)) {
      addNotification({
        id: `equip-error-${Date.now()}`,
        type: 'error',
        title: 'Equipment Error',
        message: `Cannot equip ${item.type} in ${slot} slot!`,
        priority: 'medium'
      });
      return;
    }

    dispatch({ type: 'EQUIP_PLAYER_ITEM', slot, itemId });
  };

  const unequipPlayerItem = (slot: string) => {
    if (gameState.playerCharacter) {
      dispatch({ type: 'UNEQUIP_PLAYER_ITEM', slot });
    }
  };

  return {
    login,
    spendCurrency,
    addCurrency,
    addExperience,
    manageFusionCores,
    upgradeModule,
    toggleModule,
    addItem,
    removeItem,
    useConsumable,
    useChem,
    equipItem,
    unequipItem,
    transferItemToSquad,
    transferItemFromSquad,
    startMission,
    startRecruitment,
    startWorkerRecruitment,
    dismissNotification,
    handleDialogueChoice,
    handleEventChoice,
    giveSquadMemberFood,
    giveSquadMemberWater,
    giveWorkerFood,
    giveWorkerWater,
    assignWorkerToModule,
    unassignWorker,
    refreshTradingInventory,
    updateUISettings,
    buyItem,
    sellItem,
    refreshTrading,
    abortMission,
    respondToEncounter,
    supplyMedicalFacility,
    assignWorkerToMedical,
    recoverKnockedOutMember,
    createPlayerCharacter,
    feedPlayer,
    givePlayerWater,
    restPlayer,
    useRadAway,
    equipPlayerItem,
    unequipPlayerItem
  };
};
