
import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { Search, Filter, Package, Info, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const Inventory = () => {
  const { gameState, useConsumable, removeItem, transferItemToSquad } = useGame();
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [showEquipModal, setShowEquipModal] = useState(false);
  const { toast } = useToast();

  const filteredItems = gameState.inventory.filter(item => {
    const matchesFilter = filter === 'all' || item.type === filter;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch && item.quantity > 0;
  });

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-400 bg-gray-500/10';
      case 'uncommon': return 'border-green-400 bg-green-500/10';
      case 'rare': return 'border-blue-400 bg-blue-500/10';
      case 'relic': return 'border-amber-400 bg-amber-500/10';
      default: return 'border-gray-400 bg-gray-500/10';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'weapon': return '⚔️';
      case 'armor': return '🛡️';
      case 'consumable': return '💊';
      case 'material': return '🔧';
      default: return '📦';
    }
  };

  const isEquipped = (itemId: string) => {
    return gameState.squad.some(member => 
      member.equipment.weapon === itemId || 
      member.equipment.armor === itemId ||
      member.equipment.accessory === itemId
    );
  };

  const getEquippedBy = (itemId: string) => {
    return gameState.squad.find(member => 
      member.equipment.weapon === itemId || 
      member.equipment.armor === itemId ||
      member.equipment.accessory === itemId
    );
  };

  const handleUseConsumable = (itemId: string) => {
    try {
      useConsumable(itemId);
      toast({
        title: "Item Used",
        description: "Consumable used successfully",
      });
    } catch (error) {
      toast({
        title: "Use Failed",
        description: "Could not use consumable",
        variant: "destructive",
      });
    }
  };

  const handleRemoveItem = (itemId: string, quantity: number) => {
    if (isEquipped(itemId)) {
      toast({
        title: "Cannot Drop",
        description: "Item is currently equipped by a squad member",
        variant: "destructive",
      });
      return;
    }
    
    try {
      removeItem(itemId, quantity);
      toast({
        title: "Item Dropped",
        description: "Item removed from inventory",
      });
    } catch (error) {
      toast({
        title: "Drop Failed",
        description: "Could not remove item",
        variant: "destructive",
      });
    }
  };

  const handleTransferToSquad = (itemId: string, memberId: string) => {
    const member = gameState.squad.find(m => m.id === memberId);
    if (!member) return;
    
    const emptySlots = member.inventory.filter(slot => slot.item === null).length;
    if (emptySlots === 0) {
      toast({
        title: "Transfer Failed",
        description: `${member.name}'s inventory is full`,
        variant: "destructive",
      });
      return;
    }
    
    try {
      transferItemToSquad(itemId, memberId, 1);
      toast({
        title: "Item Transferred",
        description: `Item transferred to ${member.name}`,
      });
      setSelectedItem(null);
      setShowEquipModal(false);
    } catch (error) {
      toast({
        title: "Transfer Failed",
        description: "Could not transfer item",
        variant: "destructive",
      });
    }
  };

  const selectedItemData = selectedItem ? gameState.inventory.find(item => item.id === selectedItem) : null;

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-amber-500/20">
        <h2 className="text-xl font-bold text-amber-400 mb-3">Inventory</h2>
        
        {/* Search and Filter */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-black/40 border border-gray-500/30 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:border-amber-500/50 focus:outline-none"
            />
          </div>
          
          <div className="flex space-x-2">
            {['all', 'weapon', 'armor', 'consumable', 'material'].map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-all capitalize ${
                  filter === type
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-black/40 text-gray-400 border border-gray-500/30 hover:text-white'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Inventory Summary */}
      <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-gray-500/20">
        <h3 className="text-white font-semibold mb-2">Inventory Summary</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-amber-400">{gameState.inventory.reduce((sum, item) => sum + item.quantity, 0)}</p>
            <p className="text-sm text-gray-400">Total Items</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-400">{gameState.inventory.reduce((sum, item) => sum + (item.value * item.quantity), 0)}</p>
            <p className="text-sm text-gray-400">Total Value</p>
          </div>
        </div>
      </div>

      {/* Inventory Items */}
      <div className="space-y-3">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className={`rounded-xl p-4 border-2 ${getRarityColor(item.rarity)} transition-all hover:scale-[1.02]`}
          >
            <div className="flex items-start space-x-3">
              <div className="text-2xl">{item.icon || getTypeIcon(item.type)}</div>
              
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h4 className="text-white font-semibold">{item.name}</h4>
                  {isEquipped(item.id) && (
                    <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full">
                      Equipped by {getEquippedBy(item.id)?.name}
                    </span>
                  )}
                  <span className="text-gray-400 text-sm">x{item.quantity}</span>
                </div>
                
                <p className="text-gray-400 text-sm mb-2">{item.description}</p>
                
                {/* Item Function */}
                {item.function && (
                  <p className="text-blue-400 text-xs mb-2 italic">📋 {item.function}</p>
                )}
                
                {item.stats && (
                  <div className="flex space-x-4 mb-2">
                    {Object.entries(item.stats).map(([stat, value]) => (
                      <div key={stat} className="text-xs">
                        <span className="text-gray-400 capitalize">{stat}: </span>
                        <span className="text-amber-400 font-bold">{value}</span>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setSelectedItem(item.id)}
                      className="bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded-lg text-white text-sm font-medium transition-all flex items-center space-x-1"
                    >
                      <Info size={12} />
                      <span>Details</span>
                    </button>
                    
                    {(item.type === 'weapon' || item.type === 'armor' || item.type === 'accessory') && (
                      <button
                        onClick={() => {
                          setSelectedItem(item.id);
                          setShowEquipModal(true);
                        }}
                        className="bg-purple-600 hover:bg-purple-500 px-3 py-1 rounded-lg text-white text-sm font-medium transition-all flex items-center space-x-1"
                      >
                        <Users size={12} />
                        <span>Assign</span>
                      </button>
                    )}
                    
                    {item.type === 'consumable' && (
                      <button 
                        onClick={() => handleUseConsumable(item.id)}
                        disabled={item.quantity === 0}
                        className="bg-green-600 hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed px-3 py-1 rounded-lg text-white text-sm font-medium transition-all"
                      >
                        Use
                      </button>
                    )}
                    
                    <button 
                      onClick={() => handleRemoveItem(item.id, 1)}
                      disabled={item.quantity === 0 || isEquipped(item.id)}
                      className="bg-red-600 hover:bg-red-500 disabled:bg-gray-600 disabled:cursor-not-allowed px-3 py-1 rounded-lg text-white text-sm font-medium transition-all"
                    >
                      Drop
                    </button>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Value</p>
                    <p className="text-amber-400 font-bold">{item.value * item.quantity} caps</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Item Details Modal */}
      {selectedItem && selectedItemData && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-black/90 border border-amber-500/30 rounded-xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-amber-400 font-bold text-lg flex items-center space-x-2">
                <span className="text-2xl">{selectedItemData.icon || getTypeIcon(selectedItemData.type)}</span>
                <span>{selectedItemData.name}</span>
              </h3>
              <button
                onClick={() => {
                  setSelectedItem(null);
                  setShowEquipModal(false);
                }}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-3">
              <div>
                <p className="text-gray-300">{selectedItemData.description}</p>
              </div>
              
              {selectedItemData.function && (
                <div className="bg-blue-900/20 p-3 rounded-lg border border-blue-500/30">
                  <h4 className="text-blue-400 font-medium mb-1">Function</h4>
                  <p className="text-blue-300 text-sm">{selectedItemData.function}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-black/40 p-3 rounded-lg">
                  <p className="text-gray-400 text-xs">Type</p>
                  <p className="text-white capitalize">{selectedItemData.type}</p>
                </div>
                <div className="bg-black/40 p-3 rounded-lg">
                  <p className="text-gray-400 text-xs">Rarity</p>
                  <p className="text-white capitalize">{selectedItemData.rarity}</p>
                </div>
                <div className="bg-black/40 p-3 rounded-lg">
                  <p className="text-gray-400 text-xs">Value</p>
                  <p className="text-amber-400 font-bold">{selectedItemData.value} caps</p>
                </div>
                <div className="bg-black/40 p-3 rounded-lg">
                  <p className="text-gray-400 text-xs">Weight</p>
                  <p className="text-white">{selectedItemData.weight} lbs</p>
                </div>
              </div>

              {selectedItemData.stats && (
                <div className="bg-black/40 p-3 rounded-lg">
                  <h4 className="text-amber-400 font-medium mb-2">Statistics</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(selectedItemData.stats).map(([stat, value]) => (
                      <div key={stat} className="flex justify-between">
                        <span className="text-gray-400 capitalize">{stat}:</span>
                        <span className="text-white font-bold">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedItemData.effects && (
                <div className="bg-green-900/20 p-3 rounded-lg border border-green-500/30">
                  <h4 className="text-green-400 font-medium mb-2">Effects</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(selectedItemData.effects).map(([effect, value]) => (
                      <div key={effect} className="flex justify-between">
                        <span className="text-gray-400 capitalize">{effect}:</span>
                        <span className="text-green-400 font-bold">+{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Squad Assignment */}
              {showEquipModal && (
                <div className="bg-purple-900/20 p-3 rounded-lg border border-purple-500/30">
                  <h4 className="text-purple-400 font-medium mb-2">Assign to Squad Member</h4>
                  <div className="space-y-2">
                    {gameState.squad.map(member => {
                      const emptySlots = member.inventory.filter(slot => slot.item === null).length;
                      return (
                        <button
                          key={member.id}
                          onClick={() => handleTransferToSquad(selectedItemData.id, member.id)}
                          disabled={emptySlots === 0}
                          className="w-full bg-purple-600 hover:bg-purple-500 disabled:bg-gray-600 disabled:cursor-not-allowed p-2 rounded-lg text-white text-sm transition-all text-left"
                        >
                          {member.name} - {member.specialization} {emptySlots === 0 && '(Full)'}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {filteredItems.length === 0 && (
        <div className="text-center py-8">
          <Package className="mx-auto text-gray-400 mb-2" size={48} />
          <p className="text-gray-400">No items found</p>
        </div>
      )}
    </div>
  );
};
