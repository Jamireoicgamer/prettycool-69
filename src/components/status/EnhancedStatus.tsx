import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useGame } from '@/context/GameContext';
import { simulateEnhancedCombat, DetailedCombatResult } from '@/utils/EnhancedCombatSystem';
import { TERRAIN_TYPES, getTerrainByLocation } from '@/data/TerrainTypes';
import { 
  Target, 
  Users, 
  MapPin, 
  Clock, 
  Zap, 
  Heart, 
  Shield, 
  Eye,
  Gauge,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  User
} from 'lucide-react';

export const EnhancedStatus: React.FC = () => {
  const { gameState } = useGame();
  const [activeTab, setActiveTab] = useState('overview');
  const [combatSimulation, setCombatSimulation] = useState<DetailedCombatResult | null>(null);
  const [selectedMission, setSelectedMission] = useState<string | null>(null);

  const activeMission = gameState.activeMissions.find(m => m.id === selectedMission) || gameState.activeMissions[0];
  const terrain = activeMission ? getTerrainByLocation(activeMission.location) : null;

  // Simulate combat for active mission
  const runCombatSimulation = () => {
    if (!activeMission || !activeMission.enemies) return;
    
    const assignedMembers = gameState.squad.filter(member => 
      activeMission.assignedSquad.includes(member.id)
    );
    
    if (assignedMembers.length === 0) return;

    const result = simulateEnhancedCombat(assignedMembers, activeMission.enemies, activeMission);
    setCombatSimulation(result);
  };

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

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Current Operations Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            <CardTitle>Current Operations</CardTitle>
          </div>
          <CardDescription>Real-time status of active missions and squad deployment</CardDescription>
        </CardHeader>
        <CardContent>
          {gameState.activeMissions.length > 0 ? (
            <div className="space-y-4">
              {gameState.activeMissions.map((mission) => {
                const timeElapsed = Date.now() - mission.startTime;
                const totalTime = mission.duration * 60000;
                const progress = Math.min(100, (timeElapsed / totalTime) * 100);
                const remainingTime = Math.max(0, totalTime - timeElapsed);
                const remainingMinutes = Math.floor(remainingTime / 60000);
                
                return (
                  <div key={mission.id} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-blue-400" />
                        <span className="font-medium">{mission.title}</span>
                        <Badge variant="outline">{mission.type}</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{mission.location}</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs">Progress</span>
                        </div>
                        <Progress value={progress} className="mb-1" />
                        <span className="text-xs text-muted-foreground">
                          {remainingMinutes}m remaining
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Users className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs">Squad ({mission.assignedSquad.length})</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {mission.assignedSquad.map(memberId => {
                            const member = gameState.squad.find(m => m.id === memberId);
                            return member ? (
                              <Badge key={memberId} variant="secondary" className="text-xs">
                                {member.name}
                              </Badge>
                            ) : null;
                          })}
                        </div>
                      </div>
                    </div>
                    
                    {mission.terrain && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">Terrain:</span>
                        <Badge variant="outline">
                          {TERRAIN_TYPES.find(t => t.id === mission.terrain)?.name || mission.terrain}
                        </Badge>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No active missions</p>
              <p className="text-sm">Deploy your squad from Operations</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Squad Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <CardTitle>Squad Status</CardTitle>
          </div>
          <CardDescription>Current status and readiness of all squad members</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {gameState.squad.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className={`w-3 h-3 rounded-full ${
                      member.status === 'available' ? 'bg-green-400' :
                      member.status === 'mission' ? 'bg-blue-400' :
                      member.status === 'injured' ? 'bg-red-400' :
                      'bg-yellow-400'
                    }`} />
                  </div>
                  <div>
                    <span className="font-medium">{member.name}</span>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>Lv.{member.level}</span>
                      <span>•</span>
                      <span className="capitalize">{member.specialization}</span>
                      <span>•</span>
                      <span className="capitalize">{member.status}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Heart className="h-3 w-3 text-red-400" />
                    <span className={`text-xs ${getStatusColor(member.stats.health, member.stats.maxHealth)}`}>
                      {member.stats.health}/{member.stats.maxHealth}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Activity className="h-3 w-3 text-blue-400" />
                    <span className={`text-xs ${getStatusColor(member.stats.hunger, 100)}`}>
                      {member.stats.hunger}%
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Gauge className="h-3 w-3 text-green-400" />
                    <span className="text-xs text-muted-foreground">
                      {member.stats.combat}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Player Character Status */}
      {gameState.playerCharacter && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              <CardTitle>Commander Status</CardTitle>
            </div>
            <CardDescription>Your personal status and readiness</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Health</span>
                  <span className={`text-sm ${getStatusColor(gameState.playerCharacter.health, gameState.playerCharacter.maxHealth)}`}>
                    {gameState.playerCharacter.health}/{gameState.playerCharacter.maxHealth}
                  </span>
                </div>
                <Progress value={(gameState.playerCharacter.health / gameState.playerCharacter.maxHealth) * 100} />
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Hunger</span>
                  <span className={`text-sm ${getStatusColor(gameState.playerCharacter.needs.hunger, 100)}`}>
                    {gameState.playerCharacter.needs.hunger}%
                  </span>
                </div>
                <Progress value={gameState.playerCharacter.needs.hunger} />
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Thirst</span>
                  <span className={`text-sm ${getStatusColor(gameState.playerCharacter.needs.thirst, 100)}`}>
                    {gameState.playerCharacter.needs.thirst}%
                  </span>
                </div>
                <Progress value={gameState.playerCharacter.needs.thirst} />
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Radiation</span>
                  <span className={`text-sm ${getStatusColor(gameState.playerCharacter.needs.radiation, 1000, true)}`}>
                    {gameState.playerCharacter.needs.radiation} rads
                  </span>
                </div>
                <Progress value={(gameState.playerCharacter.needs.radiation / 1000) * 100} />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderTactical = () => (
    <div className="space-y-6">
      {/* Mission Terrain Analysis */}
      {activeMission && terrain && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              <CardTitle>Terrain Analysis: {terrain.name}</CardTitle>
            </div>
            <CardDescription>{terrain.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  Squad Advantages
                </h4>
                <div className="space-y-1">
                  {Object.entries(terrain.playerEffects).map(([effect, value]) => (
                    value > 0 && (
                      <div key={effect} className="flex justify-between text-sm">
                        <span className="capitalize">{effect.replace(/([A-Z])/g, ' $1')}</span>
                        <span className="text-green-400">+{value}</span>
                      </div>
                    )
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-400" />
                  Disadvantages
                </h4>
                <div className="space-y-1">
                  {Object.entries(terrain.playerEffects).map(([effect, value]) => (
                    value < 0 && (
                      <div key={effect} className="flex justify-between text-sm">
                        <span className="capitalize">{effect.replace(/([A-Z])/g, ' $1')}</span>
                        <span className="text-red-400">{value}</span>
                      </div>
                    )
                  ))}
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <h4 className="font-medium mb-2">Tactical Considerations</h4>
              <div className="space-y-1">
                {terrain.tacticalAdvantages.map((advantage, index) => (
                  <div key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>{advantage}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <h4 className="font-medium mb-2">Environmental Hazards</h4>
              <div className="space-y-1">
                {terrain.environmentalHazards.map((hazard, index) => (
                  <div key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                    <AlertTriangle className="h-3 w-3 text-orange-400 mt-0.5" />
                    <span>{hazard}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Combat Effectiveness */}
      {activeMission && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Combat Simulation</CardTitle>
                <CardDescription>Analyze potential combat outcomes</CardDescription>
              </div>
              <Button onClick={runCombatSimulation} variant="outline">
                Run Simulation
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {combatSimulation ? (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${combatSimulation.victory ? 'text-green-400' : 'text-red-400'}`}>
                      {combatSimulation.victory ? '🎉' : '💀'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {combatSimulation.victory ? 'Victory Predicted' : 'Defeat Predicted'}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">
                      {Math.floor(combatSimulation.duration / 60)}m
                    </div>
                    <div className="text-sm text-muted-foreground">Estimated Duration</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">
                      {Object.keys(combatSimulation.injuries).length}
                    </div>
                    <div className="text-sm text-muted-foreground">Predicted Injuries</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Tactical Analysis</h4>
                  <ScrollArea className="h-32">
                    <div className="space-y-1">
                      {combatSimulation.tacticalAnalysis.map((analysis, index) => (
                        <div key={index} className="text-sm text-muted-foreground">
                          {analysis}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Combat Events Preview</h4>
                  <ScrollArea className="h-40">
                    <div className="space-y-1">
                      {combatSimulation.combatEvents.slice(0, 10).map((event, index) => (
                        <div key={index} className="text-sm p-2 border rounded">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {event.type}
                            </Badge>
                            <span>{event.description}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Click "Run Simulation" to analyze combat effectiveness</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Activity className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Enhanced Status</h1>
          <p className="text-muted-foreground">Real-time operational intelligence and tactical analysis</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tactical">Tactical Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          {renderOverview()}
        </TabsContent>

        <TabsContent value="tactical" className="mt-6">
          {renderTactical()}
        </TabsContent>
      </Tabs>
    </div>
  );
};