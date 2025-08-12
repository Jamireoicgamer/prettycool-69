import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PlayerCharacter } from '@/types/PlayerTypes';
import { InventoryItem } from '@/types/GameTypes';
import { PLAYER_BACKGROUNDS } from '@/data/PlayerBackgrounds';
import { PlayerInventoryManagement } from './PlayerInventoryManagement';
import { 
  User, 
  Heart, 
  Zap, 
  Weight, 
  Utensils, 
  Droplets, 
  Moon, 
  Radiation,
  Sword,
  Shield,
  Eye,
  Lightbulb,
  MessageSquare,
  Gauge,
  Clover
} from 'lucide-react';

interface PlayerManagementProps {
  player: PlayerCharacter;
  vaultInventory: InventoryItem[];
  onFeedPlayer: () => void;
  onGiveWater: () => void;
  onRestPlayer: () => void;
  onUseRadAway: () => void;
  onEquipItem: (slot: string, itemId: string) => void;
  onUnequipItem: (slot: string) => void;
  onUseConsumable: (itemId: string) => void;
}

export const PlayerManagement: React.FC<PlayerManagementProps> = ({
  player,
  vaultInventory,
  onFeedPlayer,
  onGiveWater,
  onRestPlayer,
  onUseRadAway,
  onEquipItem,
  onUnequipItem,
  onUseConsumable
}) => {
  const [activeTab, setActiveTab] = useState('overview');

  const background = PLAYER_BACKGROUNDS.find(bg => bg.id === player.background);
  
  const getStatIcon = (stat: string) => {
    const icons = {
      strength: Sword,
      perception: Eye,
      endurance: Heart,
      charisma: MessageSquare,
      intelligence: Lightbulb,
      agility: Gauge,
      luck: Clover
    };
    return icons[stat as keyof typeof icons] || User;
  };

  const getStatColor = (value: number) => {
    if (value >= 8) return 'text-green-400';
    if (value >= 6) return 'text-yellow-400';
    if (value >= 4) return 'text-orange-400';
    return 'text-red-400';
  };

  const getNeedColor = (value: number) => {
    if (value >= 80) return 'text-green-400';
    if (value >= 60) return 'text-yellow-400';
    if (value >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Character Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="text-3xl">{background?.icon || '👤'}</div>
            <div>
              <CardTitle>{player.name}</CardTitle>
              <CardDescription>
                Level {player.level} {background?.name || 'Wanderer'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Heart className="h-4 w-4 text-red-400" />
                <span className="text-sm font-medium">Health</span>
              </div>
              <Progress value={(player.health / player.maxHealth) * 100} className="mb-1" />
              <p className="text-xs text-muted-foreground">
                {player.health}/{player.maxHealth} HP
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-blue-400" />
                <span className="text-sm font-medium">Action Points</span>
              </div>
              <Progress value={(player.actionPoints / player.maxActionPoints) * 100} className="mb-1" />
              <p className="text-xs text-muted-foreground">
                {player.actionPoints}/{player.maxActionPoints} AP
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Weight className="h-4 w-4 text-yellow-400" />
                <span className="text-sm font-medium">Carry Weight</span>
              </div>
              <Progress value={(player.carryWeight / player.maxCarryWeight) * 100} className="mb-1" />
              <p className="text-xs text-muted-foreground">
                {player.carryWeight}/{player.maxCarryWeight} lbs
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <User className="h-4 w-4 text-purple-400" />
                <span className="text-sm font-medium">Experience</span>
              </div>
              <Progress value={(player.experience / player.experienceToNext) * 100} className="mb-1" />
              <p className="text-xs text-muted-foreground">
                {player.experience}/{player.experienceToNext} XP
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Needs Management */}
      <Card>
        <CardHeader>
          <CardTitle>Survival Needs</CardTitle>
          <CardDescription>Monitor and maintain your character's basic needs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Utensils className="h-4 w-4 text-orange-400" />
                  <span className="text-sm font-medium">Hunger</span>
                </div>
                <span className={`text-sm font-mono ${getNeedColor(player.needs.hunger)}`}>
                  {player.needs.hunger}%
                </span>
              </div>
              <Progress value={player.needs.hunger} className="mb-2" />
              <Button size="sm" onClick={onFeedPlayer} variant="outline" className="w-full">
                Feed
              </Button>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Droplets className="h-4 w-4 text-blue-400" />
                  <span className="text-sm font-medium">Thirst</span>
                </div>
                <span className={`text-sm font-mono ${getNeedColor(player.needs.thirst)}`}>
                  {player.needs.thirst}%
                </span>
              </div>
              <Progress value={player.needs.thirst} className="mb-2" />
              <Button size="sm" onClick={onGiveWater} variant="outline" className="w-full">
                Drink
              </Button>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Moon className="h-4 w-4 text-purple-400" />
                  <span className="text-sm font-medium">Sleep</span>
                </div>
                <span className={`text-sm font-mono ${getNeedColor(player.needs.sleep)}`}>
                  {player.needs.sleep}%
                </span>
              </div>
              <Progress value={player.needs.sleep} className="mb-2" />
              <Button size="sm" onClick={onRestPlayer} variant="outline" className="w-full">
                Rest
              </Button>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Radiation className="h-4 w-4 text-green-400" />
                  <span className="text-sm font-medium">Radiation</span>
                </div>
                <span className={`text-sm font-mono ${player.needs.radiation > 200 ? 'text-red-400' : 'text-green-400'}`}>
                  {player.needs.radiation} rads
                </span>
              </div>
              <Progress value={(player.needs.radiation / 1000) * 100} className="mb-2" />
              <Button 
                size="sm" 
                onClick={onUseRadAway} 
                variant="outline" 
                className="w-full"
                disabled={player.needs.radiation < 50}
              >
                Use Rad-Away
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderStats = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>S.P.E.C.I.A.L. Stats</CardTitle>
          <CardDescription>Your character's core attributes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4">
            {Object.entries(player.special).map(([stat, value]) => {
              const StatIcon = getStatIcon(stat);
              const statName = stat.charAt(0).toUpperCase() + stat.slice(1);
              
              return (
                <div key={stat} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-3">
                    <StatIcon className={`h-5 w-5 ${getStatColor(value)}`} />
                    <span className="font-medium">{statName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={(value / 10) * 100} className="w-20" />
                    <Badge variant="secondary" className={getStatColor(value)}>
                      {value}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Derived Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Derived Statistics</CardTitle>
          <CardDescription>Stats calculated from your S.P.E.C.I.A.L. attributes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Hit Points:</span>
                <span className="text-sm font-mono">{player.maxHealth}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Action Points:</span>
                <span className="text-sm font-mono">{player.maxActionPoints}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Carry Weight:</span>
                <span className="text-sm font-mono">{player.maxCarryWeight} lbs</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Melee Damage:</span>
                <span className="text-sm font-mono">+{player.special.strength}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Accuracy Bonus:</span>
                <span className="text-sm font-mono">+{player.special.perception}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Crit Chance:</span>
                <span className="text-sm font-mono">{player.special.luck}%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderEquipment = () => (
    <PlayerInventoryManagement
      player={player}
      vaultInventory={vaultInventory}
      onEquipItem={onEquipItem}
      onUnequipItem={onUnequipItem}
      onTransferToPlayer={() => {}} // Not implemented yet
      onTransferToVault={() => {}} // Not implemented yet
      onUseConsumable={onUseConsumable}
    />
  );

  const renderPerks = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Perks & Traits</CardTitle>
          <CardDescription>Your character's special abilities and bonuses</CardDescription>
        </CardHeader>
        <CardContent>
          {player.perks.length > 0 ? (
            <div className="grid gap-3">
              {player.perks.map((perk, index) => (
                <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="text-2xl">{perk.icon}</div>
                  <div className="flex-1">
                    <h3 className="font-medium">{perk.name}</h3>
                    <p className="text-sm text-muted-foreground">{perk.description}</p>
                    {Object.keys(perk.effects).length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {Object.entries(perk.effects).map(([effect, value]) => (
                          <Badge key={effect} variant="outline" className="text-xs">
                            {effect}: +{value}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <Badge variant="secondary">
                    Rank {perk.level}/{perk.maxLevel}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <User className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No perks unlocked yet</p>
              <p className="text-sm">Level up to unlock perks!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status Effects */}
      {player.statusEffects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Active Effects</CardTitle>
            <CardDescription>Temporary bonuses and penalties</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {player.statusEffects.map((effect, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{effect.icon}</span>
                    <div>
                      <span className="text-sm font-medium">{effect.name}</span>
                      <p className="text-xs text-muted-foreground">{effect.description}</p>
                    </div>
                  </div>
                  <Badge variant={effect.type === 'buff' ? 'default' : 'destructive'}>
                    {Math.ceil((effect.duration - (Date.now() - effect.appliedAt)) / 1000)}s
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <User className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Player Character</h1>
          <p className="text-muted-foreground">Manage your wasteland survivor</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="stats">Stats</TabsTrigger>
          <TabsTrigger value="equipment">Inventory</TabsTrigger>
          <TabsTrigger value="perks">Perks</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          {renderOverview()}
        </TabsContent>

        <TabsContent value="stats" className="mt-6">
          {renderStats()}
        </TabsContent>

        <TabsContent value="equipment" className="mt-6">
          {renderEquipment()}
        </TabsContent>

        <TabsContent value="perks" className="mt-6">
          {renderPerks()}
        </TabsContent>
      </Tabs>
    </div>
  );
};