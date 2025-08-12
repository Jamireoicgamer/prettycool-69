import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlayerCharacter } from '@/types/PlayerTypes';
import { useGame } from '@/context/GameContext';
import { Shield, Sword, Plus, Minus, Star } from 'lucide-react';
import { getAvatarById } from '@/components/character/CharacterAvatars';
import { toast } from '@/hooks/use-toast';

interface PlayerCharacterManagementProps {
  player: PlayerCharacter;
}

export const PlayerCharacterManagement: React.FC<PlayerCharacterManagementProps> = ({ player }) => {
  const { feedPlayer, givePlayerWater, restPlayer, useRadAway, equipPlayerItem, unequipPlayerItem, gameState, spendCurrency, addExperience } = useGame();
  const [selectedTab, setSelectedTab] = useState('overview');
  const [showLevelUp, setShowLevelUp] = useState(false);

  const avatar = getAvatarById(player.avatar);
  const canLevelUp = player.experience >= player.experienceToNext;

  const handleLevelUp = () => {
    if (canLevelUp) {
      setShowLevelUp(true);
    }
  };

  const handleStatUpgrade = (stat: keyof typeof player.special, cost: number) => {
    if (gameState.caps >= cost && player.special[stat] < 10) {
      spendCurrency('caps', cost);
      // This would need to be implemented in the game reducer
      toast({
        title: "Stat Upgraded!",
        description: `${stat.charAt(0).toUpperCase() + stat.slice(1)} increased by 1`,
      });
    }
  };

  const handleTraitSelection = (traitId: string) => {
    // Add trait selection logic
    toast({
      title: "Trait Learned!",
      description: `You've learned a new trait: ${traitId}`,
    });
  };

  const getHealthPercentage = () => (player.health / player.maxHealth) * 100;
  const getNeedPercentage = (need: number) => need;
  const getRadiationLevel = () => (player.needs.radiation / 1000) * 100;

  const getStatUpgradeCost = (currentValue: number) => {
    return Math.floor(100 * Math.pow(1.5, currentValue - 5));
  };

  return (
    <div className="p-4 space-y-4">
      {/* Character Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            {avatar && (
              <div className="w-20 h-20 rounded-lg overflow-hidden border-2 border-primary/50">
                <img 
                  src={avatar.src} 
                  alt={avatar.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-2xl font-bold text-primary">{player.name}</h2>
                <Badge variant="secondary">Level {player.level}</Badge>
                {canLevelUp && (
                  <Button size="sm" onClick={handleLevelUp} className="bg-green-600 hover:bg-green-500">
                    <Star className="w-4 h-4 mr-1" />
                    Level Up!
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Experience</p>
                  <div className="flex items-center gap-2">
                    <Progress value={(player.experience / player.experienceToNext) * 100} className="flex-1" />
                    <span className="text-xs">{player.experience}/{player.experienceToNext}</span>
                  </div>
                </div>
                <div>
                  <p className="text-muted-foreground">Health</p>
                  <div className="flex items-center gap-2">
                    <Progress value={getHealthPercentage()} className="flex-1" />
                    <span className="text-xs">{player.health}/{player.maxHealth}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="special">S.P.E.C.I.A.L.</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="traits">Traits & Perks</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Health & Needs */}
          <Card>
            <CardHeader>
              <CardTitle>Health & Needs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">Hunger</span>
                    <span className="text-sm">{player.needs.hunger}%</span>
                  </div>
                  <Progress value={getNeedPercentage(player.needs.hunger)} />
                  <Button 
                    size="sm" 
                    className="mt-2 w-full" 
                    onClick={feedPlayer}
                    disabled={gameState.food <= 0}
                  >
                    Feed ({gameState.food} food)
                  </Button>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">Thirst</span>
                    <span className="text-sm">{player.needs.thirst}%</span>
                  </div>
                  <Progress value={getNeedPercentage(player.needs.thirst)} />
                  <Button 
                    size="sm" 
                    className="mt-2 w-full" 
                    onClick={givePlayerWater}
                    disabled={gameState.water <= 0}
                  >
                    Drink ({gameState.water} water)
                  </Button>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">Sleep</span>
                    <span className="text-sm">{player.needs.sleep}%</span>
                  </div>
                  <Progress value={getNeedPercentage(player.needs.sleep)} />
                  <Button 
                    size="sm" 
                    className="mt-2 w-full" 
                    onClick={restPlayer}
                  >
                    Rest
                  </Button>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">Radiation</span>
                    <span className="text-sm">{player.needs.radiation} rads</span>
                  </div>
                  <Progress value={getRadiationLevel()} className="bg-red-900" />
                  <Button 
                    size="sm" 
                    className="mt-2 w-full" 
                    onClick={useRadAway}
                    disabled={!gameState.inventory.find(item => item.id === 'radaway' && item.quantity > 0)}
                  >
                    Use RadAway
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Equipment */}
          <Card>
            <CardHeader>
              <CardTitle>Equipment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(player.equipment).map(([slot, itemId]) => (
                  <div key={slot} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium capitalize">{slot}</span>
                      {itemId && (
                        <Button size="sm" variant="outline" onClick={() => unequipPlayerItem(slot)}>
                          Unequip
                        </Button>
                      )}
                    </div>
                    {itemId ? (
                      <div className="text-sm text-muted-foreground">
                        {gameState.inventory.find(item => item.id === itemId)?.name || itemId}
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground">No {slot} equipped</div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="special" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>S.P.E.C.I.A.L. Attributes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(player.special).map(([stat, value]) => {
                const cost = getStatUpgradeCost(value);
                const canUpgrade = value < 10 && gameState.caps >= cost;
                
                return (
                  <div key={stat} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium capitalize">{stat}</span>
                        <Badge variant="secondary">{value}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {stat === 'strength' && 'Raw physical power. Affects melee damage and carry weight.'}
                        {stat === 'perception' && 'Environmental awareness. Affects accuracy and detection.'}
                        {stat === 'endurance' && 'Fitness and health. Affects HP and radiation resistance.'}
                        {stat === 'charisma' && 'Charm and leadership. Affects prices and dialogue.'}
                        {stat === 'intelligence' && 'Reasoning and logic. Affects skill points and hacking.'}
                        {stat === 'agility' && 'Coordination and speed. Affects action points and stealth.'}
                        {stat === 'luck' && 'Fate and fortune. Affects critical chance and random events.'}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleStatUpgrade(stat as keyof typeof player.special, cost)}
                      disabled={!canUpgrade}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      {cost} caps
                    </Button>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Personal Inventory</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-2">
                {player.inventory.map((slot, index) => (
                  <div key={slot.id} className="aspect-square border rounded-lg p-2 flex flex-col items-center justify-center">
                    {slot.item ? (
                      <>
                        <div className="text-2xl mb-1">{slot.item.icon}</div>
                        <div className="text-xs text-center">{slot.item.name}</div>
                        <div className="text-xs text-muted-foreground">{slot.quantity}</div>
                      </>
                    ) : (
                      <div className="text-muted-foreground text-xs">Empty</div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="traits" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Traits & Perks</CardTitle>
            </CardHeader>
            <CardContent>
              {player.traits.length > 0 ? (
                <div className="space-y-2">
                  {player.traits.map((trait, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <span className="font-medium">{trait}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No traits learned yet.</p>
              )}
              
              <div className="mt-4">
                <h4 className="font-medium mb-2">Perks</h4>
                {player.perks.length > 0 ? (
                  <div className="space-y-2">
                    {player.perks.map((perk, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex items-center gap-2">
                          <span>{perk.icon}</span>
                          <span className="font-medium">{perk.name}</span>
                          <Badge variant="outline">Level {perk.level}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{perk.description}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No perks acquired yet.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};