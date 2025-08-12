import { SquadMember, Mission } from '@/types/GameTypes';
import { PlayerCharacter } from '@/types/PlayerTypes';
import { calculateEnhancedCombatStats, EnhancedCombatStats, DetailedCombatResult } from '@/utils/EnhancedCombatSystem';
import { TERRAIN_TYPES, getTerrainByLocation } from '@/data/TerrainTypes';
import { EnhancedRealCombatAI } from '@/utils/EnhancedRealCombatAI';

export interface RealCombatEvent {
  id: string;
  timestamp: number;
  type: 'attack' | 'miss' | 'cover' | 'flank' | 'terrain' | 'tactical' | 'injury' | 'equipment' | 'status' | 'critical' | 'victory' | 'defeat' | 'heal';
  actor: string;
  target?: string;
  damage?: number;
  description: string;
  details?: any;
}

export interface RealCombatState {
  isActive: boolean;
  startTime: number;
  duration: number;
  combatants: RealCombatParticipant[];
  enemies: RealCombatEnemy[];
  events: RealCombatEvent[];
  currentRound: number;
  terrain: string;
  weather: string;
  victory: boolean | null;
  missionId: string;
}

export interface RealCombatParticipant {
  id: string;
  name: string;
  type: 'player' | 'squad';
  health: number;
  maxHealth: number;
  stats: EnhancedCombatStats;
  status: 'fighting' | 'knocked-out' | 'dead' | 'healing';
  position: { x: number; y: number };
  cover: number;
  morale: number;
  fatigue: number;
  lastAction: number;
}

export interface RealCombatEnemy {
  id: string;
  name: string;
  type: string;
  health: number;
  maxHealth: number;
  damage: number;
  accuracy: number;
  defense: number;
  intelligence: number;
  position: { x: number; y: number };
  status: 'alive' | 'dead';
  behavior: 'aggressive' | 'defensive' | 'tactical' | 'fleeing';
}

export class RealCombatAI {
  private combatState: RealCombatState | null = null;
  private eventCallbacks: ((event: RealCombatEvent) => void)[] = [];
  private updateCallbacks: ((state: RealCombatState) => void)[] = [];

  // Subscribe to combat events
  onEvent(callback: (event: RealCombatEvent) => void) {
    this.eventCallbacks.push(callback);
  }

  onUpdate(callback: (state: RealCombatState) => void) {
    this.updateCallbacks.push(callback);
  }

  // Initialize real-time combat
  startCombat(
    squad: (SquadMember | PlayerCharacter)[],
    enemies: any[],
    mission: Mission
  ): string {
    const combatId = `combat-${Date.now()}`;
    const terrain = mission.terrain || getTerrainByLocation(mission.location).id;
    const weather = this.generateWeather();

    // Initialize combatants
    const combatants: RealCombatParticipant[] = squad.map((member, index) => {
      const stats = calculateEnhancedCombatStats(member, terrain, weather);
      return {
        id: member.id,
        name: member.name,
        type: 'special' in member ? 'player' : 'squad',
        health: stats.health,
        maxHealth: stats.health,
        stats,
        status: 'fighting',
        position: { x: Math.random() * 100, y: Math.random() * 100 },
        cover: 0,
        morale: stats.morale,
        fatigue: 0,
        lastAction: 0
      };
    });

    // Initialize enemies
    const combatEnemies: RealCombatEnemy[] = enemies.map((enemy, index) => ({
      id: `enemy-${index}`,
      name: enemy.name,
      type: enemy.type || 'hostile',
      health: enemy.health || 50,
      maxHealth: enemy.health || 50,
      damage: enemy.damage || 15,
      accuracy: enemy.accuracy || 60,
      defense: enemy.defense || 5,
      intelligence: enemy.intelligence || 40,
      position: { x: Math.random() * 100, y: Math.random() * 100 },
      status: 'alive',
      behavior: this.determineEnemyBehavior(enemy)
    }));

    this.combatState = {
      isActive: true,
      startTime: Date.now(),
      duration: 0,
      combatants,
      enemies: combatEnemies,
      events: [],
      currentRound: 1,
      terrain,
      weather,
      victory: null,
      missionId: mission.id
    };

    // Start the combat simulation loop
    this.runCombatLoop();

    this.emitEvent({
      id: this.generateEventId(),
      timestamp: Date.now(),
      type: 'status',
      actor: 'System',
      description: `Combat initiated: ${squad.length} vs ${enemies.length} in ${terrain} terrain`,
      details: { terrain, weather, mission: mission.title }
    });

    return combatId;
  }

  // Main combat simulation loop
  private runCombatLoop() {
    if (!this.combatState || !this.combatState.isActive) return;

    const interval = setInterval(() => {
      if (!this.combatState || !this.combatState.isActive) {
        clearInterval(interval);
        return;
      }

      this.processCombatRound();
      this.updateCombatState();

      // Check win/lose conditions
      const aliveCombatants = this.combatState.combatants.filter(c => c.status === 'fighting');
      const aliveEnemies = this.combatState.enemies.filter(e => e.status === 'alive');

      if (aliveCombatants.length === 0) {
        this.endCombat(false);
        clearInterval(interval);
      } else if (aliveEnemies.length === 0) {
        this.endCombat(true);
        clearInterval(interval);
      }

      // Safety timeout (30 minutes max)
      if (Date.now() - this.combatState.startTime > 30 * 60 * 1000) {
        this.endCombat(aliveCombatants.length > aliveEnemies.length);
        clearInterval(interval);
      }
    }, 2000); // Process every 2 seconds for real-time feel
  }

  // Process a single combat round
  private processCombatRound() {
    if (!this.combatState) return;

    this.combatState.currentRound++;
    this.combatState.duration = Date.now() - this.combatState.startTime;

    // Process combatant actions
    this.combatState.combatants
      .filter(c => c.status === 'fighting')
      .forEach(combatant => {
        this.processCombatantAction(combatant);
      });

    // Process enemy actions
    this.combatState.enemies
      .filter(e => e.status === 'alive')
      .forEach(enemy => {
        this.processEnemyAction(enemy);
      });

    // Update fatigue and morale
    this.updateCombatantConditions();
  }

  // Process individual combatant action
  private processCombatantAction(combatant: RealCombatParticipant) {
    if (!this.combatState) return;

    const aliveEnemies = this.combatState.enemies.filter(e => e.status === 'alive');
    if (aliveEnemies.length === 0) return;

    // AI decision making based on combatant intelligence
    const action = this.decideCombatantAction(combatant, aliveEnemies);
    
    switch (action.type) {
      case 'attack':
        this.executeAttack(combatant, action.target);
        break;
      case 'take-cover':
        this.executeTakeCover(combatant);
        break;
      case 'heal':
        this.executeHeal(combatant);
        break;
      case 'tactical-move':
        this.executeTacticalMove(combatant);
        break;
    }

    combatant.lastAction = Date.now();
  }

  // Process enemy action
  private processEnemyAction(enemy: RealCombatEnemy) {
    if (!this.combatState) return;

    const aliveCombatants = this.combatState.combatants.filter(c => c.status === 'fighting');
    if (aliveCombatants.length === 0) return;

    const target = this.selectEnemyTarget(enemy, aliveCombatants);
    if (target) {
      this.executeEnemyAttack(enemy, target);
    }
  }

  // Execute attack action
  private executeAttack(attacker: RealCombatParticipant, target: RealCombatEnemy) {
    const hitChance = Math.random() * 100;
    const effectiveAccuracy = attacker.stats.accuracy - target.defense + attacker.cover;

    if (hitChance <= effectiveAccuracy) {
      let damage = attacker.stats.damage + Math.floor(Math.random() * 10) - 5;
      
      // Critical hit chance
      if (Math.random() < 0.15) {
        damage = Math.floor(damage * 2);
        this.emitEvent({
          id: this.generateEventId(),
          timestamp: Date.now(),
          type: 'critical',
          actor: attacker.name,
          target: target.name,
          damage,
          description: `💥 CRITICAL HIT! ${attacker.name} deals massive damage to ${target.name}!`
        });
      } else {
        this.emitEvent({
          id: this.generateEventId(),
          timestamp: Date.now(),
          type: 'attack',
          actor: attacker.name,
          target: target.name,
          damage,
          description: `${attacker.name} hits ${target.name} for ${damage} damage`
        });
      }

      target.health = Math.max(0, target.health - damage);
      
      if (target.health <= 0) {
        target.status = 'dead';
        this.emitEvent({
          id: this.generateEventId(),
          timestamp: Date.now(),
          type: 'victory',
          actor: attacker.name,
          target: target.name,
          description: `${attacker.name} eliminated ${target.name}!`
        });
      }
    } else {
      this.emitEvent({
        id: this.generateEventId(),
        timestamp: Date.now(),
        type: 'miss',
        actor: attacker.name,
        target: target.name,
        description: `${attacker.name} misses ${target.name}`
      });
    }
  }

  // Execute enemy attack
  private executeEnemyAttack(enemy: RealCombatEnemy, target: RealCombatParticipant) {
    const hitChance = Math.random() * 100;
    
    if (hitChance <= enemy.accuracy) {
      let damage = enemy.damage + Math.floor(Math.random() * 5);
      damage = Math.max(1, damage - target.stats.defense);

      // Apply damage but don't kill, only knock out
      const newHealth = Math.max(0, target.health - damage);
      
      if (newHealth === 0) {
        target.status = 'knocked-out';
        this.emitEvent({
          id: this.generateEventId(),
          timestamp: Date.now(),
          type: 'status',
          actor: enemy.name,
          target: target.name,
          damage,
          description: `${target.name} was knocked unconscious by ${enemy.name}!`
        });
      } else {
        this.emitEvent({
          id: this.generateEventId(),
          timestamp: Date.now(),
          type: 'attack',
          actor: enemy.name,
          target: target.name,
          damage,
          description: `${enemy.name} hits ${target.name} for ${damage} damage`
        });
      }

      target.health = newHealth;
    } else {
      this.emitEvent({
        id: this.generateEventId(),
        timestamp: Date.now(),
        type: 'miss',
        actor: enemy.name,
        target: target.name,
        description: `${enemy.name} misses ${target.name}`
      });
    }
  }

  // AI decision making for combatants
  private decideCombatantAction(combatant: RealCombatParticipant, enemies: RealCombatEnemy[]) {
    const intelligence = combatant.stats.intelligence;
    const health = combatant.health / combatant.maxHealth;

    // Low health - try to heal or take cover
    if (health < 0.3 && Math.random() < 0.7) {
      return Math.random() < 0.6 ? { type: 'heal' } : { type: 'take-cover' };
    }

    // High intelligence - tactical moves
    if (intelligence > 70 && Math.random() < 0.4) {
      return { type: 'tactical-move' };
    }

    // Default - attack nearest enemy
    const target = enemies[Math.floor(Math.random() * enemies.length)];
    return { type: 'attack', target };
  }

  // Select target for enemy
  private selectEnemyTarget(enemy: RealCombatEnemy, combatants: RealCombatParticipant[]) {
    switch (enemy.behavior) {
      case 'aggressive':
        // Target strongest
        return combatants.reduce((strongest, current) => 
          current.health > strongest.health ? current : strongest
        );
      case 'tactical':
        // Target weakest
        return combatants.reduce((weakest, current) => 
          current.health < weakest.health ? current : weakest
        );
      default:
        // Random target
        return combatants[Math.floor(Math.random() * combatants.length)];
    }
  }

  // Execute support actions
  private executeTakeCover(combatant: RealCombatParticipant) {
    combatant.cover = Math.min(25, combatant.cover + 15);
    this.emitEvent({
      id: this.generateEventId(),
      timestamp: Date.now(),
      type: 'status',
      actor: combatant.name,
      description: `${combatant.name} takes cover (+15 defense)`
    });
  }

  private executeHeal(combatant: RealCombatParticipant) {
    const healAmount = Math.floor(combatant.maxHealth * 0.2);
    combatant.health = Math.min(combatant.maxHealth, combatant.health + healAmount);
    this.emitEvent({
      id: this.generateEventId(),
      timestamp: Date.now(),
      type: 'heal',
      actor: combatant.name,
      description: `${combatant.name} heals for ${healAmount} health`
    });
  }

  private executeTacticalMove(combatant: RealCombatParticipant) {
    combatant.position = { 
      x: Math.random() * 100, 
      y: Math.random() * 100 
    };
    this.emitEvent({
      id: this.generateEventId(),
      timestamp: Date.now(),
      type: 'status',
      actor: combatant.name,
      description: `${combatant.name} repositions tactically`
    });
  }

  // Update combat conditions
  private updateCombatantConditions() {
    if (!this.combatState) return;

    this.combatState.combatants.forEach(combatant => {
      combatant.fatigue = Math.min(100, combatant.fatigue + 1);
      
      // Morale effects
      if (combatant.health < combatant.maxHealth * 0.3) {
        combatant.morale = Math.max(10, combatant.morale - 2);
      }
    });
  }

  // End combat and calculate results
  private endCombat(victory: boolean) {
    if (!this.combatState) return;

    this.combatState.isActive = false;
    this.combatState.victory = victory;

    this.emitEvent({
      id: this.generateEventId(),
      timestamp: Date.now(),
      type: victory ? 'victory' : 'defeat',
      actor: 'System',
      description: `Combat ended: ${victory ? 'VICTORY!' : 'DEFEAT!'}`
    });

    // Calculate final results
    const result = this.calculateCombatResults();
    
    // Notify subscribers
    this.updateCallbacks.forEach(callback => {
      if (this.combatState) callback(this.combatState);
    });
  }

  // Calculate combat results for game state
  private calculateCombatResults(): DetailedCombatResult {
    if (!this.combatState) throw new Error('No combat state');

    const squadHealthLoss: { [memberId: string]: number } = {};
    
    this.combatState.combatants.forEach(combatant => {
      squadHealthLoss[combatant.id] = combatant.maxHealth - combatant.health;
    });

    return {
      squadHealthLoss,
      victory: this.combatState.victory || false,
      duration: Math.floor(this.combatState.duration / 1000),
      squadDamageDealt: 0, // Calculate from events
      enemyDamageDealt: 0, // Calculate from events
      combatLog: this.combatState.events.map(e => e.description),
      combatEvents: this.combatState.events.map(e => ({
        timestamp: e.timestamp,
        type: e.type === 'status' || e.type === 'critical' || e.type === 'victory' || e.type === 'defeat' || e.type === 'heal' ? 'tactical' : e.type,
        actor: e.actor,
        target: e.target,
        damage: e.damage,
        description: e.description
      })),
      terrainEffects: [`Terrain: ${this.combatState.terrain}`],
      tacticalAnalysis: [`Round ${this.combatState.currentRound} completed`],
      casualties: this.combatState.enemies.filter(e => e.status === 'dead').map(e => e.name),
      injuries: {},
      equipmentDamage: {},
      experienceGained: {},
      moraleChanges: {}
    };
  }

  // Helper methods
  private generateEventId(): string {
    return `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateWeather(): string {
    const weathers = ['clear', 'overcast', 'rain', 'fog', 'storm'];
    return weathers[Math.floor(Math.random() * weathers.length)];
  }

  private determineEnemyBehavior(enemy: any): 'aggressive' | 'defensive' | 'tactical' | 'fleeing' {
    const intel = enemy.intelligence || 40;
    if (intel > 70) return 'tactical';
    if (intel > 50) return 'defensive';
    return 'aggressive';
  }

  private emitEvent(event: RealCombatEvent) {
    if (this.combatState) {
      this.combatState.events.push(event);
    }
    this.eventCallbacks.forEach(callback => callback(event));
  }

  private updateCombatState() {
    if (this.combatState) {
      this.updateCallbacks.forEach(callback => callback(this.combatState!));
    }
  }
}