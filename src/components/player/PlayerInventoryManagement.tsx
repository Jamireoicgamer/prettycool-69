import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PlayerCharacter } from '@/types/PlayerTypes';
import { InventoryItem } from '@/types/GameTypes';
import { Package, Sword, Shield, Gem, Pill, Utensils, Droplets } from 'lucide-react';

interface PlayerInventoryManagementProps {
  player: PlayerCharacter;
  vaultInventory: InventoryItem[];
  onEquipItem: (slot: string, itemId: string) => void;
  onUnequipItem: (slot: string) => void;
  onTransferToPlayer: (itemId: string, quantity: number) => void;
  onTransferToVault: (itemId: string, quantity: number) => void;
  onUseConsumable: (itemId: string) => void;
}

export const PlayerInventoryManagement: React.FC<PlayerInventoryManagementProps> = ({
  player,
  vaultInventory,
  onEquipItem,
  onUnequipItem,
  onTransferToPlayer,
  onTransferToVault,
  onUseConsumable
}) => {
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  const getEquippableItems = () => {
    return vaultInventory.filter(item => 
      ['weapon', 'armor', 'accessory'].includes(item.type) && item.quantity > 0
    );
  };

  const getConsumableItems = () => {
    return vaultInventory.filter(item => 
      ['consumable', 'chem'].includes(item.type) && item.quantity > 0
    );
  };

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'weapon': return <Sword className="w-4 h-4" />;
      case 'armor': return <Shield className="w-4 h-4" />;
      case 'accessory': return <Gem className="w-4 h-4" />;
      case 'consumable': return <Utensils className="w-4 h-4" />;
      case 'chem': return <Pill className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'text-orange-400 border-orange-400';
      case 'rare': return 'text-purple-400 border-purple-400';
      case 'uncommon': return 'text-blue-400 border-blue-400';
      default: return 'text-gray-400 border-gray-400';
    }
  };

  const canEquipItem = (item: InventoryItem, slot: string) => {
    const validSlots: { [key: string]: string[] } = {
      weapon: ['weapon'],
      armor: ['armor'],
      accessory: ['accessory']
    };
    return validSlots[slot]?.includes(item.type);
  };

  const renderEquipmentSlot = (slot: keyof typeof player.equipment, slotName: string) => {
    const equippedItemId = player.equipment[slot];
    const equippedItem = equippedItemId ? vaultInventory.find(item => item.id === equippedItemId) : null;

    return (
      <Card key={slot}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">{slotName}</CardTitle>
        </CardHeader>
        <CardContent>
          {equippedItem ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {getItemIcon(equippedItem.type)}
                <span className="text-sm font-medium">{equippedItem.name}</span>
              </div>
              <Badge variant="outline" className={getRarityColor(equippedItem.rarity)}>
                {equippedItem.rarity}
              </Badge>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => onUnequipItem(slot)}
                className="w-full"
              >
                Unequip
              </Button>
            </div>
          ) : (
            <div className="text-center py-4">
              <div className="w-12 h-12 bg-muted rounded-lg mx-auto mb-2 flex items-center justify-center">
                {getItemIcon(slot)}
              </div>
              <p className="text-xs text-muted-foreground">Empty</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderInventoryItem = (item: InventoryItem, onAction: (item: InventoryItem) => void, actionLabel: string) => (
    <Card key={item.id} className="cursor-pointer hover:bg-muted/50 transition-colors">
      <CardContent className="p-3" onClick={() => setSelectedItem(item)}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {getItemIcon(item.type)}
            <span className="text-sm font-medium">{item.name}</span>
          </div>
          <Badge variant="outline" className={getRarityColor(item.rarity)}>
            {item.quantity}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
          {item.description}
        </p>
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="text-xs">
            {item.type}
          </Badge>
          <Button 
            size="sm" 
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              onAction(item);
            }}
            className="text-xs h-6"
          >
            {actionLabel}
          </Button>
        </div>
        {item.stats && (
          <div className="mt-2 text-xs text-muted-foreground">
            {Object.entries(item.stats).map(([stat, value]) => (
              <span key={stat} className="mr-2">
                {stat}: +{value}
              </span>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Equipment Slots */}
      <Card>
        <CardHeader>
          <CardTitle>Equipment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {renderEquipmentSlot('weapon', 'Weapon')}
            {renderEquipmentSlot('armor', 'Armor')}
            {renderEquipmentSlot('accessory', 'Accessory')}
          </div>
        </CardContent>
      </Card>

      {/* Inventory Management */}
      <Card>
        <CardHeader>
          <CardTitle>Inventory Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="equipment">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="equipment">Equipment</TabsTrigger>
              <TabsTrigger value="consumables">Consumables</TabsTrigger>
            </TabsList>

            <TabsContent value="equipment" className="mt-4">
              <ScrollArea className="h-64">
                <div className="grid gap-2">
                  {getEquippableItems().map(item => 
                    renderInventoryItem(
                      item, 
                      (item) => {
                        // Determine which slot this item can go in
                        const slot = item.type === 'weapon' ? 'weapon' : 
                                   item.type === 'armor' ? 'armor' : 'accessory';
                        onEquipItem(slot, item.id);
                      },
                      'Equip'
                    )
                  )}
                  {getEquippableItems().length === 0 && (
                    <p className="text-center text-muted-foreground py-4">
                      No equippable items in vault
                    </p>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="consumables" className="mt-4">
              <ScrollArea className="h-64">
                <div className="grid gap-2">
                  {getConsumableItems().map(item => 
                    renderInventoryItem(
                      item,
                      (item) => onUseConsumable(item.id),
                      'Use'
                    )
                  )}
                  {getConsumableItems().length === 0 && (
                    <p className="text-center text-muted-foreground py-4">
                      No consumables in vault
                    </p>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Item Details Modal */}
      {selectedItem && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedItem(null)}
        >
          <Card className="max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getItemIcon(selectedItem.type)}
                {selectedItem.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={getRarityColor(selectedItem.rarity)}>
                  {selectedItem.rarity}
                </Badge>
                <Badge variant="secondary">{selectedItem.type}</Badge>
              </div>
              
              <p className="text-sm text-muted-foreground">
                {selectedItem.description}
              </p>

              {selectedItem.stats && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Stats:</h4>
                  {Object.entries(selectedItem.stats).map(([stat, value]) => (
                    <div key={stat} className="flex justify-between text-sm">
                      <span>{stat}:</span>
                      <span className="text-green-400">+{value}</span>
                    </div>
                  ))}
                </div>
              )}

              {selectedItem.effects && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Effects:</h4>
                  {Object.entries(selectedItem.effects).map(([effect, value]) => (
                    <div key={effect} className="flex justify-between text-sm">
                      <span>{effect}:</span>
                      <span className="text-blue-400">+{value}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedItem(null)}
                  className="flex-1"
                >
                  Close
                </Button>
                {['weapon', 'armor', 'accessory'].includes(selectedItem.type) && (
                  <Button 
                    onClick={() => {
                      const slot = selectedItem.type === 'weapon' ? 'weapon' : 
                                 selectedItem.type === 'armor' ? 'armor' : 'accessory';
                      onEquipItem(slot, selectedItem.id);
                      setSelectedItem(null);
                    }}
                    className="flex-1"
                  >
                    Equip
                  </Button>
                )}
                {['consumable', 'chem'].includes(selectedItem.type) && (
                  <Button 
                    onClick={() => {
                      onUseConsumable(selectedItem.id);
                      setSelectedItem(null);
                    }}
                    className="flex-1"
                  >
                    Use
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};