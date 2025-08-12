import React, { useState, useMemo, useEffect } from 'react';
import { useGame } from '@/context/GameContext';
import { SquadMember, InventoryItem } from '@/types/GameTypes';
import { X, Package, Sword, Shield, Star, ArrowLeft, ArrowRight } from 'lucide-react';
import { calculateCombatStats, getWeaponEffects, getArmorEffects } from '@/utils/CombatCalculations';
import { GAME_ITEMS } from '@/data/GameItems';
import { useToast } from '@/hooks/use-toast';

interface SquadInventoryProps {
  member: SquadMember;
  onClose: () => void;
}

export const SquadInventory = ({ member, onClose }: SquadInventoryProps) => {
  const { gameState, equipItem, unequipItem, transferItemToSquad, transferItemFromSquad } = useGame();
  const [activeTab, setActiveTab] = useState<'equipment' | 'inventory' | 'vault'>('equipment');
  const [forceUpdate, setForceUpdate] = useState(0);
  const { toast } = useToast();

  // Force re-calculation when equipment changes or gameState updates
  const combatStats = useMemo(() => {
    console.log(`Recalculating combat stats for ${member.name} (update: ${forceUpdate})`);
    return calculateCombatStats(member);
  }, [member.equipment, member.stats, member.activeChems, forceUpdate, gameState.lastEquipmentChange]);

  // Force update when equipment changes
  useEffect(() => {
    setForceUpdate(prev => prev + 1);
  }, [member.equipment]);

  const getSlotIcon = (slot: string) => {
    switch (slot) {
      case 'weapon': return <Sword size={16} className="text-red-400" />;
      case 'armor': return <Shield size={16} className="text-blue-400" />;
      case 'accessory': return <Star size={16} className="text-purple-400" />;
      default: return null;
    }
  };

  const getEquippedItem = (slot: string) => {
    const equippedItemId = member.equipment?.[slot as keyof typeof member.equipment];
    if (!equippedItemId) return null;
    
    // Look in GAME_ITEMS for the equipped item and convert to InventoryItem format
    const gameItem = GAME_ITEMS.find(item => item.id === equippedItemId);
    if (!gameItem) return null;
    
    // Convert GameItem to InventoryItem by adding quantity
    return {
      ...gameItem,
      quantity: 1
    } as InventoryItem;
  };

  const isItemEquippedByAnyone = (itemId: string) => {
    return gameState.squad.some(squadMember => 
      squadMember.equipment?.weapon === itemId ||
      squadMember.equipment?.armor === itemId ||
      squadMember.equipment?.accessory === itemId
    );
  };

  const canEquipItem = (item: InventoryItem, slot: string) => {
    return (item.type === 'weapon' && slot === 'weapon') ||
           (item.type === 'armor' && slot === 'armor') ||
           (item.type === 'accessory' && slot === 'accessory');
  };

  const getVaultItemsByType = (type: string) => {
    return gameState.inventory.filter(item => item.type === type && item.quantity > 0);
  };

  const handleEquipFromVault = async (itemId: string, slot: string) => {
    try {
      console.log(`Attempting to equip ${itemId} from vault to ${member.name} in slot ${slot}`);
      
      // Unequip current item if any
      if (member.equipment?.[slot as keyof typeof member.equipment]) {
        await unequipItem(member.id, slot);
        // Small delay to ensure state update
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      await equipItem(member.id, itemId, slot);
      
      // Force re-render
      setForceUpdate(prev => prev + 1);
      
      toast({
        title: "Item Equipped",
        description: `Successfully equipped item to ${member.name}`,
      });
    } catch (error) {
      console.error('Equipment failed:', error);
      toast({
        title: "Equipment Failed",
        description: "Could not equip item. It may already be equipped by another squad member.",
        variant: "destructive",
      });
    }
  };

  const handleUnequipItem = async (slot: string) => {
    try {
      console.log(`Attempting to unequip ${slot} from ${member.name}`);
      await unequipItem(member.id, slot);
      
      // Force re-render
      setForceUpdate(prev => prev + 1);
      
      toast({
        title: "Item Unequipped",
        description: `Successfully unequipped ${slot} from ${member.name}`,
      });
    } catch (error) {
      console.error('Unequip failed:', error);
      toast({
        title: "Unequip Failed",
        description: "Could not unequip item.",
        variant: "destructive",
      });
    }
  };

  const handleTransferToSquad = (itemId: string) => {
    const emptySlots = member.inventory.filter(slot => slot.item === null).length;
    if (emptySlots === 0) {
      toast({
        title: "Transfer Failed",
        description: `${member.name}'s inventory is full`,
        variant: "destructive",
      });
      return;
    }
    if (isItemEquippedByAnyone(itemId)) {
      toast({
        title: "Transfer Failed",
        description: "Item is currently equipped by a squad member",
        variant: "destructive",
      });
      return;
    }
    transferItemToSquad(itemId, member.id, 1);
    toast({
      title: "Item Transferred",
      description: `Item transferred to ${member.name}'s inventory`,
    });
  };

  const handleTransferFromSquad = (slotIndex: number) => {
    const slot = member.inventory[slotIndex];
    if (!slot?.item || isItemEquippedByAnyone(slot.item.id)) {
      toast({
        title: "Transfer Failed",
        description: "Item is currently equipped",
        variant: "destructive",
      });
      return;
    }
    transferItemFromSquad(member.id, slotIndex, 1);
    toast({
      title: "Item Transferred",
      description: "Item transferred back to vault",
    });
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-400 bg-gray-500/10';
      case 'uncommon': return 'border-green-400 bg-green-500/10';
      case 'rare': return 'border-blue-400 bg-blue-500/10';
      case 'relic': return 'border-purple-400 bg-purple-500/10';
      default: return 'border-gray-400 bg-gray-500/10';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-black/90 backdrop-blur-sm rounded-xl p-6 max-w-6xl w-full max-h-[90vh] overflow-y-auto border border-blue-500/20 animate-scale-in">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-blue-400">{member.name}'s Inventory</h2>
            <div className="flex space-x-4 text-sm text-gray-400">
              <span>Health: {Math.floor(combatStats.health)}</span>
              <span className="text-red-400 font-bold">Damage: {combatStats.damage}</span>
              <span className="text-yellow-400">Accuracy: {combatStats.accuracy}%</span>
              <span className="text-blue-400">Defense: {combatStats.defense}</span>
              <span className="text-amber-400 font-bold">Overall Combat: {Math.floor(combatStats.overallStat)}</span>
            </div>
            {/* Debug info - can be removed in production */}
            <div className="text-xs text-gray-500 mt-1">
              Equipment: {JSON.stringify(member.equipment)}
            </div>
          </div>
          <button
            onClick={onClose}
            className="bg-red-600 hover:bg-red-500 p-2 rounded-lg text-white transition-all hover-scale"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-2 mb-6">
          {[
            { key: 'equipment', label: 'Equipment', icon: '⚔️' },
            { key: 'inventory', label: 'Personal Items', icon: '🎒' },
            { key: 'vault', label: 'Vault Items', icon: '🏛️' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as 'equipment' | 'inventory' | 'vault')}
              className={`px-4 py-2 rounded-lg text-sm transition-all flex items-center space-x-2 ${
                activeTab === tab.key
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'bg-black/40 text-gray-400 border border-gray-500/30 hover:text-white'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Equipment Tab */}
        {activeTab === 'equipment' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-amber-400">Equipment Slots</h3>
            
            {['weapon', 'armor', 'accessory'].map(slot => {
              const equippedItem = getEquippedItem(slot);
              const effects = slot === 'weapon' && equippedItem 
                ? getWeaponEffects(equippedItem.id)
                : slot === 'armor' && equippedItem 
                ? getArmorEffects(equippedItem.id)
                : null;

              return (
                <div key={slot} className="bg-black/40 rounded-lg p-4 border border-gray-500/20">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      {getSlotIcon(slot)}
                      <span className="text-white font-medium capitalize">{slot}</span>
                    </div>
                    {equippedItem && (
                      <button
                        onClick={() => handleUnequipItem(slot)}
                        className="text-xs bg-red-600 hover:bg-red-500 px-2 py-1 rounded text-white transition-all hover-scale"
                      >
                        Unequip
                      </button>
                    )}
                  </div>
                  
                  {equippedItem ? (
                    <div className={`p-3 rounded-lg border-2 ${getRarityColor(equippedItem.rarity)}`}>
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{equippedItem.icon}</span>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <p className="text-white font-medium">{equippedItem.name}</p>
                            <span className={`text-xs px-2 py-1 rounded capitalize ${getRarityColor(equippedItem.rarity)}`}>
                              {equippedItem.rarity}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400">{equippedItem.description}</p>
                          {effects && (
                            <p className="text-xs text-green-400 mt-1 font-bold">{effects.description}</p>
                          )}
                          {equippedItem.stats && (
                            <div className="flex space-x-4 mt-2">
                              {Object.entries(equippedItem.stats).map(([key, value]) => (
                                <div key={key} className="text-xs">
                                  <span className="text-gray-400 capitalize">{key}: </span>
                                  <span className="text-amber-400 font-bold">+{value}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-800/20 p-3 rounded-lg border-2 border-dashed border-gray-500/30 text-center">
                      <p className="text-gray-400 text-sm">No {slot} equipped</p>
                      <div className="mt-2 space-y-1">
                        {getVaultItemsByType(slot).slice(0, 3).map(item => (
                          <button
                            key={item.id}
                            onClick={() => handleEquipFromVault(item.id, slot)}
                            className="block w-full text-xs bg-blue-600 hover:bg-blue-500 px-2 py-1 rounded text-white transition-all"
                          >
                            Equip {item.name}
                          </button>
                        ))}
                        {getVaultItemsByType(slot).length > 3 && (
                          <p className="text-xs text-gray-500">+{getVaultItemsByType(slot).length - 3} more in vault</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Personal Inventory Tab */}
        {activeTab === 'inventory' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-green-400">Personal Inventory</h3>
              <span className="text-sm text-gray-400">
                {member.inventory.filter(slot => slot.item !== null).length}/7 slots used
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {member.inventory.map((slot, index) => (
                <div key={slot.id} className="bg-black/40 rounded-lg p-3 border border-gray-500/20 min-h-[100px]">
                  {slot.item ? (
                    <div className={`p-3 rounded-lg border-2 ${getRarityColor(slot.item.rarity)}`}>
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-xl">{slot.item.icon}</span>
                        <div className="flex-1">
                          <div className="flex items-center space-x-1 mb-1">
                            <p className="text-white text-sm font-medium">{slot.item.name}</p>
                            <span className={`text-xs px-1 py-0.5 rounded capitalize ${getRarityColor(slot.item.rarity)}`}>
                              {slot.item.rarity}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400">Qty: {slot.quantity}</p>
                        </div>
                      </div>
                      
                      <div className="flex space-x-1">
                        {canEquipItem(slot.item, 'weapon') && (
                          <button
                            onClick={async () => {
                              try {
                                await equipItem(member.id, slot.item!.id, 'weapon');
                                setForceUpdate(prev => prev + 1);
                                toast({
                                  title: "Weapon Equipped",
                                  description: `${slot.item!.name} equipped to ${member.name}`,
                                });
                              } catch (error) {
                                toast({
                                  title: "Equipment Failed",
                                  description: "Item may already be equipped by another squad member",
                                  variant: "destructive",
                                });
                              }
                              }}
                              className="text-xs bg-red-600 hover:bg-red-500 px-2 py-1 rounded text-white transition-all"
                            >
                            Equip
                          </button>
                        )}
                        {canEquipItem(slot.item, 'armor') && (
                          <button
                            onClick={async () => {
                              try {
                                await equipItem(member.id, slot.item!.id, 'armor');
                                setForceUpdate(prev => prev + 1);
                                toast({
                                  title: "Armor Equipped",
                                  description: `${slot.item!.name} equipped to ${member.name}`,
                                });
                              } catch (error) {
                                toast({
                                  title: "Equipment Failed",
                                  description: "Item may already be equipped by another squad member",
                                  variant: "destructive",
                                });
                              }
                              }}
                              className="text-xs bg-blue-600 hover:bg-blue-500 px-2 py-1 rounded text-white transition-all"
                            >
                            Equip
                          </button>
                        )}
                        {canEquipItem(slot.item, 'accessory') && (
                          <button
                            onClick={async () => {
                              try {
                                await equipItem(member.id, slot.item!.id, 'accessory');
                                setForceUpdate(prev => prev + 1);
                                toast({
                                  title: "Accessory Equipped",
                                  description: `${slot.item!.name} equipped to ${member.name}`,
                                });
                              } catch (error) {
                                toast({
                                  title: "Equipment Failed",
                                  description: "Item may already be equipped by another squad member",
                                  variant: "destructive",
                                });
                              }
                            }}
                            disabled={isItemEquippedByAnyone(slot.item.id)}
                            className="text-xs bg-purple-600 hover:bg-purple-500 disabled:bg-gray-600 disabled:cursor-not-allowed px-2 py-1 rounded text-white transition-all"
                          >
                            Equip
                          </button>
                        )}
                        <button
                          onClick={() => handleTransferFromSquad(index)}
                          disabled={isItemEquippedByAnyone(slot.item.id)}
                          className="text-xs bg-green-600 hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed px-2 py-1 rounded text-white transition-all flex items-center space-x-1"
                        >
                          <ArrowLeft size={10} />
                          <span>Vault</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-800/20 p-3 rounded-lg border-2 border-dashed border-gray-500/30 text-center h-full flex items-center justify-center">
                      <p className="text-gray-400 text-xs">Empty Slot</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Vault Items Tab */}
        {activeTab === 'vault' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-purple-400">Vault Items</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {gameState.inventory.filter(item => item.quantity > 0).map(item => {
                const isEquipped = isItemEquippedByAnyone(item.id);
                const emptySlots = member.inventory.filter(slot => slot.item === null).length;
                
                return (
                  <div key={item.id} className={`p-3 rounded-lg border-2 ${getRarityColor(item.rarity)}`}>
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-xl">{item.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center space-x-1 mb-1">
                          <p className="text-white text-sm font-medium">{item.name}</p>
                          <span className={`text-xs px-1 py-0.5 rounded capitalize ${getRarityColor(item.rarity)}`}>
                            {item.rarity}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400">
                          Qty: {item.quantity}
                          {isEquipped && <span className="text-green-400 ml-2">(Equipped)</span>}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex space-x-1">
                      {canEquipItem(item, 'weapon') && (
                        <button
                          onClick={() => handleEquipFromVault(item.id, 'weapon')}
                          disabled={isEquipped}
                          className="text-xs bg-red-600 hover:bg-red-500 disabled:bg-gray-600 disabled:cursor-not-allowed px-2 py-1 rounded text-white transition-all"
                        >
                          Equip
                        </button>
                      )}
                      {canEquipItem(item, 'armor') && (
                        <button
                          onClick={() => handleEquipFromVault(item.id, 'armor')}
                          disabled={isEquipped}
                          className="text-xs bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed px-2 py-1 rounded text-white transition-all"
                        >
                          Equip
                        </button>
                      )}
                      {canEquipItem(item, 'accessory') && (
                        <button
                          onClick={() => handleEquipFromVault(item.id, 'accessory')}
                          disabled={isEquipped}
                          className="text-xs bg-purple-600 hover:bg-purple-500 disabled:bg-gray-600 disabled:cursor-not-allowed px-2 py-1 rounded text-white transition-all"
                        >
                          Equip
                        </button>
                      )}
                      <button
                        onClick={() => handleTransferToSquad(item.id)}
                        disabled={emptySlots === 0 || isEquipped}
                        className="text-xs bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed px-2 py-1 rounded text-white transition-all flex items-center space-x-1"
                      >
                        <ArrowRight size={10} />
                        <span>Take</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
