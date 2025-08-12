import { GameState, InventoryItem, SquadMemberInventorySlot } from '@/types/GameTypes';
import { GAME_ITEMS } from '@/data/GameItems';

export const equipItemReducer = (state: GameState, action: any): GameState => {
  const { squadMemberId, itemId, slot } = action;
  
  console.log(`Equipping item ${itemId} to ${squadMemberId} in slot ${slot}`);
  
  const squadMemberIndex = state.squad.findIndex(member => member.id === squadMemberId);
  if (squadMemberIndex === -1) {
    console.log(`Squad member ${squadMemberId} not found`);
    return state;
  }
  
  // Check if item exists in vault OR squad member's inventory
  const vaultItem = state.inventory.find(invItem => invItem.id === itemId);
  const gameItem = GAME_ITEMS.find(gameItem => gameItem.id === itemId);
  const squadMemberInventorySlot = state.squad[squadMemberIndex].inventory.find(slot => slot.item?.id === itemId);
  
  const item = vaultItem || gameItem || squadMemberInventorySlot?.item;
  if (!item) {
    console.log(`Item ${itemId} not found`);
    return state;
  }
  
  // Check if item type matches slot
  const validSlots = {
    weapon: ['weapon'],
    armor: ['armor'],
    accessory: ['accessory']
  };
  
  if (!validSlots[item.type as keyof typeof validSlots]?.includes(slot)) {
    console.log(`Item type ${item.type} cannot be equipped in slot ${slot}`);
    return state;
  }
  
  // Allow equipping duplicate items across different squad members as long as inventory has copies
  // Previously prevented equipping if another member had the same itemId equipped.

  
  const updatedSquad = [...state.squad];
  const member = { ...updatedSquad[squadMemberIndex] };
  
  // Ensure equipment object exists
  if (!member.equipment) {
    member.equipment = { weapon: null, armor: null, accessory: null };
  }
  
  // Unequip current item if any
  const currentEquippedId = member.equipment[slot as keyof typeof member.equipment];
  if (currentEquippedId) {
    const currentEquipped = GAME_ITEMS.find(item => item.id === currentEquippedId);
    if (currentEquipped) {
      // Add to squad member's inventory if there's space
      const emptySlotIndex = member.inventory.findIndex(slot => slot.item === null);
      if (emptySlotIndex !== -1) {
        member.inventory[emptySlotIndex] = {
          id: `${squadMemberId}-slot-${emptySlotIndex}`,
          item: { ...currentEquipped, quantity: 1 },
          quantity: 1
        };
      }
    }
  }
  
  // Equip new item
  member.equipment = {
    ...member.equipment,
    [slot]: itemId
  };
  
  console.log(`Successfully equipped ${itemId} to ${member.name} in slot ${slot}`);
  
  // Remove item from where it came from
  let updatedInventory = [...state.inventory];
  
  if (squadMemberInventorySlot) {
    // Remove from squad inventory
    const slotIndex = member.inventory.findIndex(slot => slot.item?.id === itemId);
    if (slotIndex !== -1) {
      if (member.inventory[slotIndex].quantity === 1) {
        member.inventory[slotIndex] = {
          id: member.inventory[slotIndex].id,
          item: null,
          quantity: 0
        };
      } else {
        member.inventory[slotIndex] = {
          ...member.inventory[slotIndex],
          quantity: member.inventory[slotIndex].quantity - 1
        };
      }
    }
  } else if (vaultItem) {
    // Remove from vault inventory
    updatedInventory = updatedInventory.map(item =>
      item.id === itemId
        ? { ...item, quantity: Math.max(0, item.quantity - 1) }
        : item
    ).filter(item => item.quantity > 0);
  }
  
  updatedSquad[squadMemberIndex] = member;
  
  const newState = {
    ...state,
    squad: updatedSquad,
    inventory: updatedInventory,
    // Force UI update by incrementing a timestamp
    lastEquipmentChange: Date.now()
  };
  
  console.log(`Equipment state updated for ${member.name}:`, member.equipment);
  
  return newState;
};

export const unequipItemReducer = (state: GameState, action: any): GameState => {
  const { squadMemberId, slot } = action;
  
  console.log(`Unequipping item from ${squadMemberId} slot ${slot}`);
  
  const squadMemberIndex = state.squad.findIndex(member => member.id === squadMemberId);
  if (squadMemberIndex === -1) return state;
  
  const updatedSquad = [...state.squad];
  const member = { ...updatedSquad[squadMemberIndex] };
  
  // Ensure equipment object exists
  if (!member.equipment) {
    member.equipment = { weapon: null, armor: null, accessory: null };
  }
  
  const equippedItemId = member.equipment[slot as keyof typeof member.equipment];
  if (!equippedItemId) return state;
  
  const equippedItem = GAME_ITEMS.find(item => item.id === equippedItemId);
  if (!equippedItem) return state;
  
  // Unequip the item
  member.equipment = {
    ...member.equipment,
    [slot]: null
  };
  
  console.log(`Successfully unequipped ${equippedItemId} from ${member.name}`);
  
  // Add to squad member's inventory if there's space
  const emptySlotIndex = member.inventory.findIndex(slot => slot.item === null);
  if (emptySlotIndex !== -1) {
    member.inventory[emptySlotIndex] = {
      id: `${squadMemberId}-slot-${emptySlotIndex}`,
      item: { ...equippedItem, quantity: 1 },
      quantity: 1
    };
  }
  
  updatedSquad[squadMemberIndex] = member;
  
  return {
    ...state,
    squad: updatedSquad,
    // Force UI update by incrementing a timestamp
    lastEquipmentChange: Date.now()
  };
};

export const transferItemToSquadReducer = (state: GameState, action: any): GameState => {
  const { itemId, squadMemberId, quantity } = action;
  
  const squadMemberIndex = state.squad.findIndex(member => member.id === squadMemberId);
  if (squadMemberIndex === -1) return state;
  
  const vaultItemIndex = state.inventory.findIndex(item => item.id === itemId);
  if (vaultItemIndex === -1 || state.inventory[vaultItemIndex].quantity < quantity) return state;
  
  const member = state.squad[squadMemberIndex];
  const emptySlotIndex = member.inventory.findIndex(slot => slot.item === null);
  
  if (emptySlotIndex === -1) return state; // No empty slots
  
  const item = state.inventory[vaultItemIndex];
  const updatedSquad = [...state.squad];
  const updatedMember = { ...member };
  
  // Add item to squad member's inventory
  updatedMember.inventory = [...member.inventory];
  updatedMember.inventory[emptySlotIndex] = {
    id: `${squadMemberId}-slot-${emptySlotIndex}`,
    item: { ...item, quantity },
    quantity
  };
  
  updatedSquad[squadMemberIndex] = updatedMember;
  
  // Remove item from vault inventory
  const updatedInventory = [...state.inventory];
  if (item.quantity === quantity) {
    updatedInventory.splice(vaultItemIndex, 1);
  } else {
    updatedInventory[vaultItemIndex] = {
      ...item,
      quantity: item.quantity - quantity
    };
  }
  
  return {
    ...state,
    squad: updatedSquad,
    inventory: updatedInventory
  };
};

export const transferItemFromSquadReducer = (state: GameState, action: any): GameState => {
  const { squadMemberId, itemIndex, quantity } = action;
  
  const squadMemberIndex = state.squad.findIndex(member => member.id === squadMemberId);
  if (squadMemberIndex === -1) return state;
  
  const member = state.squad[squadMemberIndex];
  if (itemIndex >= member.inventory.length || !member.inventory[itemIndex].item) return state;
  
  const slot = member.inventory[itemIndex];
  const item = slot.item!;
  
  if (slot.quantity < quantity) return state;
  
  const updatedSquad = [...state.squad];
  const updatedMember = { ...member };
  updatedMember.inventory = [...member.inventory];
  
  // Remove from squad member's inventory
  if (slot.quantity === quantity) {
    updatedMember.inventory[itemIndex] = {
      id: slot.id,
      item: null,
      quantity: 0
    };
  } else {
    updatedMember.inventory[itemIndex] = {
      ...slot,
      quantity: slot.quantity - quantity
    };
  }
  
  updatedSquad[squadMemberIndex] = updatedMember;
  
  // Add to vault inventory
  const existingVaultItemIndex = state.inventory.findIndex(vaultItem => vaultItem.id === item.id);
  const updatedInventory = [...state.inventory];
  
  if (existingVaultItemIndex !== -1) {
    updatedInventory[existingVaultItemIndex] = {
      ...updatedInventory[existingVaultItemIndex],
      quantity: updatedInventory[existingVaultItemIndex].quantity + quantity
    };
  } else {
    updatedInventory.push({
      ...item,
      quantity
    });
  }
  
  return {
    ...state,
    squad: updatedSquad,
    inventory: updatedInventory
  };
};

export const addItemToSquadReducer = (state: GameState, itemId: string, squadMemberId: string, quantity: number = 1): GameState => {
  const squadMemberIndex = state.squad.findIndex(member => member.id === squadMemberId);
  if (squadMemberIndex === -1) return state;
  
  const item = GAME_ITEMS.find(gameItem => gameItem.id === itemId);
  if (!item) return state;
  
  const member = state.squad[squadMemberIndex];
  const emptySlotIndex = member.inventory.findIndex(slot => slot.item === null);
  
  if (emptySlotIndex === -1) return state; // No empty slots
  
  const updatedSquad = [...state.squad];
  const updatedMember = { ...member };
  updatedMember.inventory = [...member.inventory];
  
  updatedMember.inventory[emptySlotIndex] = {
    id: `${squadMemberId}-slot-${emptySlotIndex}`,
    item: { ...item, quantity },
    quantity
  };
  
  updatedSquad[squadMemberIndex] = updatedMember;
  
  return {
    ...state,
    squad: updatedSquad
  };
};

export const useConsumableFromSquadReducer = (state: GameState, action: any): GameState => {
  const { itemId, squadMemberId, slotIndex } = action;
  
  const squadMemberIndex = state.squad.findIndex(member => member.id === squadMemberId);
  if (squadMemberIndex === -1) return state;
  
  const member = state.squad[squadMemberIndex];
  const slot = member.inventory[slotIndex];
  
  if (!slot?.item || slot.item.type !== 'consumable' || slot.quantity <= 0) return state;
  
  const updatedSquad = [...state.squad];
  const updatedMember = { ...member };
  updatedMember.inventory = [...member.inventory];
  
  // Apply consumable effects
  if (slot.item.effects) {
    updatedMember.stats = { ...member.stats };
    
    Object.entries(slot.item.effects).forEach(([effect, value]) => {
      switch (effect) {
        case 'health':
          updatedMember.stats.health = Math.min(
            updatedMember.stats.maxHealth,
            updatedMember.stats.health + (value as number)
          );
          break;
        case 'hunger':
          updatedMember.stats.hunger = Math.min(100, updatedMember.stats.hunger + (value as number));
          break;
        case 'thirst':
          updatedMember.stats.thirst = Math.min(100, updatedMember.stats.thirst + (value as number));
          break;
      }
    });
  }
  
  // Consume the item
  if (slot.quantity === 1) {
    updatedMember.inventory[slotIndex] = {
      id: slot.id,
      item: null,
      quantity: 0
    };
  } else {
    updatedMember.inventory[slotIndex] = {
      ...slot,
      quantity: slot.quantity - 1
    };
  }
  
  updatedSquad[squadMemberIndex] = updatedMember;
  
  return {
    ...state,
    squad: updatedSquad
  };
};
