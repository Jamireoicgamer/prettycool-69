import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RealCombatAI, RealCombatEvent, RealCombatState } from '@/utils/RealCombatAI';
import { Shield, Sword, User, Users } from 'lucide-react';

export const RealTimeCombatDisplay: React.FC = () => {
  const [combatState, setCombatState] = useState<RealCombatState | null>(null);
  const [events, setEvents] = useState<RealCombatEvent[]>([]);

  useEffect(() => {
    // This component would be used in a future version with global combat AI
    // For now, it's a placeholder that shows no active combat
    setCombatState(null);
    setEvents([]);
  }, []);

  if (!combatState || !combatState.isActive) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Combat Status</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No active combat</p>
        </CardContent>
      </Card>
    );
  }

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  const getHealthPercentage = (current: number, max: number) => (current / max) * 100;

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'attack': return '⚔️';
      case 'critical': return '💥';
      case 'miss': return '❌';
      case 'heal': return '💚';
      case 'status': return 'ℹ️';
      case 'victory': return '🏆';
      case 'defeat': return '💀';
      default: return '•';
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'attack': return 'text-red-400';
      case 'critical': return 'text-orange-400';
      case 'miss': return 'text-gray-400';
      case 'heal': return 'text-green-400';
      case 'status': return 'text-blue-400';
      case 'victory': return 'text-green-500';
      case 'defeat': return 'text-red-500';
      default: return 'text-foreground';
    }
  };

  return (
    <div className="space-y-4">
      {/* Combat Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sword className="w-5 h-5" />
            Active Combat - Round {combatState.currentRound}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-muted-foreground">Duration</p>
              <p className="text-lg font-bold">{formatDuration(combatState.duration)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Terrain</p>
              <Badge variant="outline">{combatState.terrain}</Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Weather</p>
              <Badge variant="outline">{combatState.weather}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Combatant Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Player Squad */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Squad Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {combatState.combatants.map((combatant) => (
              <div key={combatant.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{combatant.name}</span>
                  <div className="flex gap-2">
                    <Badge variant={combatant.type === 'player' ? 'default' : 'secondary'}>
                      {combatant.type === 'player' ? <User className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                    </Badge>
                    <Badge variant={
                      combatant.status === 'fighting' ? 'default' :
                      combatant.status === 'knocked-out' ? 'destructive' : 'secondary'
                    }>
                      {combatant.status}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span>Health</span>
                    <span>{combatant.health}/{combatant.maxHealth}</span>
                  </div>
                  <Progress value={getHealthPercentage(combatant.health, combatant.maxHealth)} />
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground">Morale:</span> {combatant.morale}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Cover:</span> +{combatant.cover}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Fatigue:</span> {combatant.fatigue}%
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Enemy Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sword className="w-5 h-5" />
              Enemy Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {combatState.enemies.map((enemy) => (
              <div key={enemy.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{enemy.name}</span>
                  <div className="flex gap-2">
                    <Badge variant="outline">{enemy.type}</Badge>
                    <Badge variant={enemy.status === 'alive' ? 'destructive' : 'secondary'}>
                      {enemy.status}
                    </Badge>
                  </div>
                </div>
                {enemy.status === 'alive' && (
                  <>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span>Health</span>
                        <span>{enemy.health}/{enemy.maxHealth}</span>
                      </div>
                      <Progress value={getHealthPercentage(enemy.health, enemy.maxHealth)} />
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <span className="text-muted-foreground">Damage:</span> {enemy.damage}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Accuracy:</span> {enemy.accuracy}%
                      </div>
                      <div>
                        <span className="text-muted-foreground">Behavior:</span> {enemy.behavior}
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Live Combat Feed */}
      <Card>
        <CardHeader>
          <CardTitle>Live Combat Feed</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-64">
            <div className="space-y-2">
              {events.map((event) => (
                <div 
                  key={event.id}
                  className={`flex items-start gap-2 p-2 rounded text-sm ${getEventColor(event.type)}`}
                >
                  <span className="text-lg">{getEventIcon(event.type)}</span>
                  <div className="flex-1">
                    <p>{event.description}</p>
                    {event.damage && (
                      <p className="text-xs text-muted-foreground">Damage: {event.damage}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};