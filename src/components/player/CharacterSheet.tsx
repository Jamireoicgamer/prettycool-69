import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useGame } from '@/context/GameContext';
import { GAME_ITEMS } from '@/data/GameItems';
import { 
  User, 
  Heart, 
  Zap, 
  Shield, 
  Target, 
  Eye, 
  Brain, 
  Users,
  Activity,
  Droplets,
  Soup,
  Moon,
  Atom,
  Package,
  Shirt,
  Crown,
  Watch,
  Star,
  Award,
  BarChart3,
  TrendingUp,
  ArrowUp
} from 'lucide-react';

export const CharacterSheet: React.FC = () => {
  const { gameState, useConsumable, equipItem, unequipItem } = useGame();
  const [activeTab, setActiveTab] = useState('stats');

  if (!gameState.playerCharacter) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <User className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground">No character created</p>
        </div>
      </div>
    );
  }

  const player = gameState.playerCharacter;

  // Calculate derived stats
  const healthPercentage = (player.health / player.maxHealth) * 100;
  const actionPointsPercentage = (player.actionPoints / player.maxActionPoints) * 100;
  const carryWeightPercentage = (player.carryWeight / player.maxCarryWeight) * 100;
  const experiencePercentage = (player.experience / player.experienceToNext) * 100;

  const getStatusColor = (value: number, max: number, inverted = false) => {
    const percentage = (value / max) * 100;
    if (inverted) {
      if (percentage > 80) return 'text-red-400';
      if (percentage > 60) return 'text-orange-400';
      if (percentage > 40) return 'text-yellow-400';
      return 'text-green-400';
    } else {
      if (percentage > 80) return 'text-green-400';
      if (percentage > 60) return 'text-yellow-400';
      if (percentage > 40) return 'text-orange-400';
      return 'text-red-400';
    }
  };

  const getProgressColor = (value: number, max: number, inverted = false) => {
    const percentage = (value / max) * 100;
    if (inverted) {
      if (percentage > 80) return 'bg-red-500';
      if (percentage > 60) return 'bg-orange-500';
      if (percentage > 40) return 'bg-yellow-500';
      return 'bg-green-500';
    } else {
      if (percentage > 80) return 'bg-green-500';
      if (percentage > 60) return 'bg-yellow-500';
      if (percentage > 40) return 'bg-orange-500';
      return 'bg-red-500';
    }
  };

  const handleUseConsumable = (itemId: string) => {
    useConsumable(itemId, player.id);
  };

  const handleEquipItem = (slot: string, itemId: string) => {
    equipItem(player.id, itemId, slot);
  };

  const handleUnequipItem = (slot: string) => {
    unequipItem(player.id, slot);
  };

  const renderStats = () => (
    <div className="space-y-6">
      {/* Character Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">{player.name}</CardTitle>
              <CardDescription>
                Level {player.level} • {player.background}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Experience</span>
                <span className="text-sm font-medium">
                  {player.experience}/{player.experienceToNext}
                </span>
              </div>
              <Progress value={experiencePercentage} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Created</span>
                <span className="text-sm text-muted-foreground">
                  {new Date(player.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SPECIAL Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            S.P.E.C.I.A.L. Attributes
          </CardTitle>
          <CardDescription>Your core character attributes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {[
              { key: 'strength', label: 'Strength', icon: Shield, desc: 'Physical power and carrying capacity' },
              { key: 'perception', label: 'Perception', icon: Eye, desc: 'Awareness and accuracy' },
              { key: 'endurance', label: 'Endurance', icon: Heart, desc: 'Health and stamina' },
              { key: 'charisma', label: 'Charisma', icon: Users, desc: 'Social skills and leadership' },
              { key: 'intelligence', label: 'Intelligence', icon: Brain, desc: 'Knowledge and problem solving' },
              { key: 'agility', label: 'Agility', icon: Zap, desc: 'Speed and dexterity' },
              { key: 'luck', label: 'Luck', icon: Star, desc: 'Fortune and critical hits' }
            ].map(({ key, label, icon: Icon, desc }) => (
              <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-medium">{label}</div>
                    <div className="text-sm text-muted-foreground">{desc}</div>
                  </div>
                </div>
                <div className="text-2xl font-bold text-primary">
                  {player.special[key as keyof typeof player.special]}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Health & Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Health & Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-red-400" />
                    <span className="text-sm">Health</span>
                  </div>
                  <span className={`text-sm font-medium ${getStatusColor(player.health, player.maxHealth)}`}>
                    {player.health}/{player.maxHealth}
                  </span>
                </div>
                <Progress value={healthPercentage} className="h-2" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-blue-400" />
                    <span className="text-sm">Action Points</span>
                  </div>
                  <span className={`text-sm font-medium ${getStatusColor(player.actionPoints, player.maxActionPoints)}`}>
                    {player.actionPoints}/{player.maxActionPoints}
                  </span>
                </div>
                <Progress value={actionPointsPercentage} className="h-2" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-purple-400" />
                    <span className="text-sm">Carry Weight</span>
                  </div>
                  <span className={`text-sm font-medium ${getStatusColor(player.carryWeight, player.maxCarryWeight, true)}`}>
                    {player.carryWeight}/{player.maxCarryWeight}
                  </span>
                </div>
                <Progress value={carryWeightPercentage} className="h-2" />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Soup className="h-4 w-4 text-green-400" />
                    <span className="text-sm">Hunger</span>
                  </div>
                  <span className={`text-sm font-medium ${getStatusColor(player.needs.hunger, 100)}`}>
                    {player.needs.hunger}%
                  </span>
                </div>
                <Progress value={player.needs.hunger} className="h-2" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Droplets className="h-4 w-4 text-cyan-400" />
                    <span className="text-sm">Thirst</span>
                  </div>
                  <span className={`text-sm font-medium ${getStatusColor(player.needs.thirst, 100)}`}>
                    {player.needs.thirst}%
                  </span>
                </div>
                <Progress value={player.needs.thirst} className="h-2" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Moon className="h-4 w-4 text-indigo-400" />
                    <span className="text-sm">Sleep</span>
                  </div>
                  <span className={`text-sm font-medium ${getStatusColor(player.needs.sleep, 100)}`}>
                    {player.needs.sleep}%
                  </span>
                </div>
                <Progress value={player.needs.sleep} className="h-2" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Atom className="h-4 w-4 text-orange-400" />
                    <span className="text-sm">Radiation</span>
                  </div>
                  <span className={`text-sm font-medium ${getStatusColor(player.needs.radiation, 1000, true)}`}>
                    {player.needs.radiation} rads
                  </span>
                </div>
                <Progress value={(player.needs.radiation / 1000) * 100} className="h-2" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderEquipment = () => (
    <div className="space-y-6">
      {/* Equipment Slots */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shirt className="h-5 w-5 text-primary" />
            Equipment
          </CardTitle>
          <CardDescription>Currently equipped items</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {[
              { slot: 'weapon', label: 'Weapon', icon: Target },
              { slot: 'armor', label: 'Armor', icon: Shield },
              { slot: 'helmet', label: 'Helmet', icon: Crown },
              { slot: 'accessory', label: 'Accessory', icon: Watch },
              { slot: 'outfit', label: 'Outfit', icon: Shirt }
            ].map(({ slot, label, icon: Icon }) => {
              const equippedItemId = player.equipment[slot as keyof typeof player.equipment];
              const equippedItem = equippedItemId ? 
                GAME_ITEMS.find(item => item.id === equippedItemId) || 
                gameState.inventory.find(item => item.id === equippedItemId) : null;

              return (
                <div key={slot} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{label}</div>
                      {equippedItem ? (
                        <div className="text-sm text-muted-foreground">
                          {equippedItem.name}
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground">Empty</div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {equippedItem && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUnequipItem(slot)}
                      >
                        Unequip
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Available Equipment */}
      <Card>
        <CardHeader>
          <CardTitle>Available Equipment</CardTitle>
          <CardDescription>Items you can equip</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-64">
            <div className="space-y-2">
              {gameState.inventory
                .filter(item => ['weapon', 'armor', 'accessory'].includes(item.type))
                .map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{item.icon}</span>
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-muted-foreground">{item.type}</div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEquipItem(item.type, item.id)}
                    >
                      Equip
                    </Button>
                  </div>
                ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );

  const renderInventory = () => (
    <div className="space-y-6">
      {/* Personal Inventory */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Personal Inventory
          </CardTitle>
          <CardDescription>Items carried by your character</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-2 mb-4">
            {player.inventory.map((slot, index) => (
              <div
                key={slot.id}
                className="aspect-square border-2 border-dashed border-muted-foreground/30 rounded-lg flex items-center justify-center relative"
              >
                {slot.item ? (
                  <div className="text-center">
                    <div className="text-lg">{slot.item.icon}</div>
                    <div className="text-xs">{slot.quantity}</div>
                  </div>
                ) : (
                  <Package className="h-4 w-4 text-muted-foreground/50" />
                )}
              </div>
            ))}
          </div>
          
          {/* Consumables */}
          <div className="space-y-2">
            <h4 className="font-medium">Consumables</h4>
            <div className="grid gap-2">
              {gameState.inventory
                .filter(item => item.type === 'consumable' || item.type === 'chem')
                .map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{item.icon}</span>
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-muted-foreground">Qty: {item.quantity}</div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUseConsumable(item.id)}
                      disabled={item.quantity === 0}
                    >
                      Use
                    </Button>
                  </div>
                ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderPerks = () => (
    <div className="space-y-6">
      {/* Active Perks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Active Perks
          </CardTitle>
          <CardDescription>Your character's special abilities</CardDescription>
        </CardHeader>
        <CardContent>
          {player.perks.length > 0 ? (
            <div className="grid gap-3">
              {player.perks.map((perk) => (
                <div key={perk.id} className="p-4 border rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-lg">{perk.icon}</span>
                    <div>
                      <div className="font-medium">{perk.name}</div>
                      <div className="text-sm text-muted-foreground">
                        Level {perk.level}/{perk.maxLevel}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{perk.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(perk.effects).map(([effect, value]) => (
                      <Badge key={effect} variant="secondary" className="text-xs">
                        {effect}: +{value}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Award className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No perks learned yet</p>
              <p className="text-sm">Gain experience to unlock perks</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Traits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-primary" />
            Character Traits
          </CardTitle>
          <CardDescription>Permanent character traits</CardDescription>
        </CardHeader>
        <CardContent>
          {player.traits.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {player.traits.map((trait) => (
                <Badge key={trait} variant="outline">
                  {trait}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No traits</p>
          )}
        </CardContent>
      </Card>

      {/* Status Effects */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Active Effects
          </CardTitle>
          <CardDescription>Temporary status effects</CardDescription>
        </CardHeader>
        <CardContent>
          {player.statusEffects.length > 0 ? (
            <div className="space-y-2">
              {player.statusEffects.map((effect) => {
                const remainingTime = Math.max(0, effect.duration - (Date.now() - effect.appliedAt));
                const remainingMinutes = Math.floor(remainingTime / 60000);
                
                return (
                  <div key={effect.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{effect.icon}</span>
                      <div>
                        <div className="font-medium">{effect.name}</div>
                        <div className="text-sm text-muted-foreground">{effect.description}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={effect.type === 'buff' ? 'default' : effect.type === 'debuff' ? 'destructive' : 'secondary'}>
                        {effect.type}
                      </Badge>
                      <div className="text-xs text-muted-foreground mt-1">
                        {remainingMinutes}m left
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No active effects</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <User className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">{player.name}</h1>
          <p className="text-muted-foreground">Level {player.level} {player.background}</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="stats">Stats</TabsTrigger>
          <TabsTrigger value="equipment">Equipment</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="perks">Perks & Traits</TabsTrigger>
        </TabsList>

        <TabsContent value="stats" className="mt-6">
          {renderStats()}
        </TabsContent>

        <TabsContent value="equipment" className="mt-6">
          {renderEquipment()}
        </TabsContent>

        <TabsContent value="inventory" className="mt-6">
          {renderInventory()}
        </TabsContent>

        <TabsContent value="perks" className="mt-6">
          {renderPerks()}
        </TabsContent>
      </Tabs>
    </div>
  );
};