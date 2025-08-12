import { SquadMember, Mission } from '@/types/GameTypes';
import { PlayerCharacter } from '@/types/PlayerTypes';
import { calculateEnhancedCombatStats, EnhancedCombatStats, DetailedCombatResult } from '@/utils/EnhancedCombatSystem';
import { TERRAIN_TYPES, getTerrainByLocation } from '@/data/TerrainTypes';
import { GAME_ITEMS } from '@/data/GameItems';
import { pickWeatherForTerrain, getWeatherModifiers } from '@/data/WeatherEvents';
import { applyPerksToStats } from '@/utils/PerkSystem';

// 20+ Combat Actions Enum
export enum CombatActionType {
  // Offensive Actions (8)
  ATTACK = 'attack',
  SNIPE = 'snipe',
  RUSH = 'rush',
  FLANK = 'flank',
  AMBUSH = 'ambush',
  BREACH = 'breach',
  GRENADE_THROW = 'grenade-throw',
  EXECUTE = 'execute',

  // Defensive Actions (6)
  DODGE = 'dodge',
  DUCK = 'duck',
  TAKE_COVER = 'take-cover',
  DIVE_COVER = 'dive-cover',
  BLOCK = 'block',
  RETREAT = 'retreat',

  // Tactical Actions (8)
  OVERWATCH = 'overwatch',
  STEALTH_MOVE = 'stealth-move',
  SMOKE_DEPLOY = 'smoke-deploy',
  RALLY = 'rally',
  HEAL_TEAMMATE = 'heal-teammate',
  REPOSITION = 'reposition',
  COORDINATE = 'coordinate',
  OBSERVE = 'observe',

  // Advanced Actions (3)
  COUNTER_ATTACK = 'counter-attack',
  SUPPRESS = 'suppress',
  INTIMIDATE = 'intimidate'
}

export interface CombatAction {
  type: CombatActionType;
  name: string;
  description: string;
  requirements: {
    minIntelligence?: number;
    minCombat?: number;
    minStealth?: number;
    equipmentType?: string[];
    terrain?: string[];
    minHealth?: number;
  };
  effects: {
    damage?: number;
    accuracy?: number;
    defense?: number;
    stealth?: number;
    morale?: number;
    duration?: number;
  };
  cooldown: number;
  energyCost: number;
}

// Define all 25 combat actions
export const COMBAT_ACTIONS: { [key in CombatActionType]: CombatAction } = {
  [CombatActionType.ATTACK]: {
    type: CombatActionType.ATTACK,
    name: 'Standard Attack',
    description: 'Basic attack with equipped weapon',
    requirements: {},
    effects: { damage: 1.0 },
    cooldown: 0,
    energyCost: 5
  },
  [CombatActionType.SNIPE]: {
    type: CombatActionType.SNIPE,
    name: 'Precision Shot',
    description: 'Aimed shot with increased accuracy and damage',
    requirements: { minCombat: 60, equipmentType: ['sniper-rifle', 'hunting-rifle'] },
    effects: { damage: 2.0, accuracy: 30 },
    cooldown: 3,
    energyCost: 15
  },
  [CombatActionType.RUSH]: {
    type: CombatActionType.RUSH,
    name: 'Aggressive Rush',
    description: 'Fast aggressive attack with reduced accuracy but increased damage',
    requirements: { minCombat: 50, equipmentType: ['shotgun', 'melee'] },
    effects: { damage: 1.8, accuracy: -20 },
    cooldown: 2,
    energyCost: 20
  },
  [CombatActionType.FLANK]: {
    type: CombatActionType.FLANK,
    name: 'Flanking Maneuver',
    description: 'Circle around enemy for surprise attack',
    requirements: { minStealth: 40, minIntelligence: 50 },
    effects: { damage: 1.5, accuracy: 15, stealth: -10 },
    cooldown: 4,
    energyCost: 25
  },
  [CombatActionType.AMBUSH]: {
    type: CombatActionType.AMBUSH,
    name: 'Stealth Ambush',
    description: 'Hidden attack from concealment',
    requirements: { minStealth: 70, terrain: ['forest', 'urban'] },
    effects: { damage: 2.5, accuracy: 20, stealth: -30 },
    cooldown: 5,
    energyCost: 30
  },
  [CombatActionType.BREACH]: {
    type: CombatActionType.BREACH,
    name: 'Breach & Clear',
    description: 'Force entry into enemy position',
    requirements: { minCombat: 70, terrain: ['urban', 'vault'] },
    effects: { damage: 1.6, accuracy: 10, morale: 15 },
    cooldown: 4,
    energyCost: 35
  },
  [CombatActionType.GRENADE_THROW]: {
    type: CombatActionType.GRENADE_THROW,
    name: 'Grenade Throw',
    description: 'Explosive area attack',
    requirements: { equipmentType: ['frag-grenade', 'plasma-grenade'] },
    effects: { damage: 3.0, accuracy: -10 },
    cooldown: 6,
    energyCost: 40
  },
  [CombatActionType.EXECUTE]: {
    type: CombatActionType.EXECUTE,
    name: 'Execution Shot',
    description: 'Attempt to finish off weakened enemy',
    requirements: { minCombat: 80 },
    effects: { damage: 4.0, accuracy: -20 },
    cooldown: 8,
    energyCost: 50
  },
  [CombatActionType.DODGE]: {
    type: CombatActionType.DODGE,
    name: 'Evasive Dodge',
    description: 'Quick movement to avoid incoming attacks',
    requirements: { minStealth: 30 },
    effects: { defense: 25, accuracy: -5 },
    cooldown: 1,
    energyCost: 10
  },
  [CombatActionType.DUCK]: {
    type: CombatActionType.DUCK,
    name: 'Duck & Weave',
    description: 'Low profile evasion',
    requirements: {},
    effects: { defense: 15, stealth: 10 },
    cooldown: 1,
    energyCost: 5
  },
  [CombatActionType.TAKE_COVER]: {
    type: CombatActionType.TAKE_COVER,
    name: 'Take Cover',
    description: 'Find defensive position',
    requirements: {},
    effects: { defense: 20, accuracy: 5 },
    cooldown: 0,
    energyCost: 8
  },
  [CombatActionType.DIVE_COVER]: {
    type: CombatActionType.DIVE_COVER,
    name: 'Dive for Cover',
    description: 'Emergency defensive maneuver',
    requirements: {},
    effects: { defense: 35, accuracy: -15 },
    cooldown: 3,
    energyCost: 15
  },
  [CombatActionType.BLOCK]: {
    type: CombatActionType.BLOCK,
    name: 'Block Attack',
    description: 'Defensive stance with weapon or shield',
    requirements: { equipmentType: ['melee', 'shield'] },
    effects: { defense: 30, damage: -0.3 },
    cooldown: 1,
    energyCost: 12
  },
  [CombatActionType.RETREAT]: {
    type: CombatActionType.RETREAT,
    name: 'Tactical Retreat',
    description: 'Fall back to better position',
    requirements: { minIntelligence: 40 },
    effects: { defense: 15, stealth: 20, morale: -10 },
    cooldown: 2,
    energyCost: 20
  },
  [CombatActionType.OVERWATCH]: {
    type: CombatActionType.OVERWATCH,
    name: 'Overwatch Position',
    description: 'Prepare to interrupt enemy actions',
    requirements: { minIntelligence: 60, equipmentType: ['rifle', 'sniper-rifle'] },
    effects: { accuracy: 20, defense: 10 },
    cooldown: 3,
    energyCost: 25
  },
  [CombatActionType.STEALTH_MOVE]: {
    type: CombatActionType.STEALTH_MOVE,
    name: 'Silent Movement',
    description: 'Move without being detected',
    requirements: { minStealth: 50 },
    effects: { stealth: 30, accuracy: 10 },
    cooldown: 2,
    energyCost: 18
  },
  [CombatActionType.SMOKE_DEPLOY]: {
    type: CombatActionType.SMOKE_DEPLOY,
    name: 'Deploy Smoke',
    description: 'Create concealment for team',
    requirements: { equipmentType: ['smoke-grenade'] },
    effects: { stealth: 25, defense: 15 },
    cooldown: 5,
    energyCost: 30
  },
  [CombatActionType.RALLY]: {
    type: CombatActionType.RALLY,
    name: 'Rally Team',
    description: 'Boost team morale and coordination',
    requirements: { minIntelligence: 50 },
    effects: { morale: 20, accuracy: 10 },
    cooldown: 4,
    energyCost: 35
  },
  [CombatActionType.HEAL_TEAMMATE]: {
    type: CombatActionType.HEAL_TEAMMATE,
    name: 'Field Medicine',
    description: 'Provide medical aid to injured ally',
    requirements: { minIntelligence: 40, equipmentType: ['stimpak', 'medical-kit'] },
    effects: { morale: 15 },
    cooldown: 3,
    energyCost: 25
  },
  [CombatActionType.REPOSITION]: {
    type: CombatActionType.REPOSITION,
    name: 'Tactical Reposition',
    description: 'Move to advantageous position',
    requirements: { minIntelligence: 45 },
    effects: { accuracy: 15, stealth: 10 },
    cooldown: 2,
    energyCost: 20
  },
  [CombatActionType.COORDINATE]: {
    type: CombatActionType.COORDINATE,
    name: 'Coordinate Attack',
    description: 'Organize team assault',
    requirements: { minIntelligence: 70 },
    effects: { accuracy: 25, damage: 1.3 },
    cooldown: 5,
    energyCost: 40
  },
  [CombatActionType.OBSERVE]: {
    type: CombatActionType.OBSERVE,
    name: 'Observe Enemy',
    description: 'Study enemy patterns and weaknesses',
    requirements: { minIntelligence: 40 },
    effects: { accuracy: 15, stealth: 5 },
    cooldown: 1,
    energyCost: 10
  },
  [CombatActionType.COUNTER_ATTACK]: {
    type: CombatActionType.COUNTER_ATTACK,
    name: 'Counter Attack',
    description: 'Respond to enemy action with immediate strike',
    requirements: { minCombat: 60, minIntelligence: 50 },
    effects: { damage: 1.8, accuracy: 10 },
    cooldown: 3,
    energyCost: 30
  },
  [CombatActionType.SUPPRESS]: {
    type: CombatActionType.SUPPRESS,
    name: 'Suppressive Fire',
    description: 'Pin down enemies with sustained fire',
    requirements: { equipmentType: ['automatic', 'heavy-weapon'] },
    effects: { accuracy: -10, morale: -15 },
    cooldown: 4,
    energyCost: 35
  },
  [CombatActionType.INTIMIDATE]: {
    type: CombatActionType.INTIMIDATE,
    name: 'Intimidate Enemies',
    description: 'Psychological warfare to break enemy morale',
    requirements: { minIntelligence: 50 },
    effects: { morale: -20, accuracy: 10 },
    cooldown: 3,
    energyCost: 20
  }
};

export interface RealCombatEvent {
  id: string;
  timestamp: number;
  type: 'action' | 'damage' | 'status' | 'environmental' | 'victory' | 'defeat';
  actor: string;
  target?: string;
  action: CombatActionType;
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
  energy: number;
  maxEnergy: number;
  lastAction: number;
  actionCooldowns: { [key in CombatActionType]?: number };
  activeEffects: Array<{
    type: string;
    duration: number;
    effects: any;
  }>;
  availableChems?: string[];
  usedChems?: string[];
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
  weapon?: string;
  availableActions: CombatActionType[];
  actionCooldowns: { [key in CombatActionType]?: number };
  availableChems?: string[];
  usedChems?: string[];
  activeEffects?: Array<{ type: string; duration: number; effects: any }>;
  perks?: string[];
}

export class EnhancedRealCombatAI {
  private combatState: RealCombatState | null = null;
  private eventCallbacks: ((event: RealCombatEvent) => void)[] = [];
  private updateCallbacks: ((state: RealCombatState) => void)[] = [];
  private damagePace: number = 1.0; // scales all outgoing damage (1.0 = normal, 0.25 = slower, longer fights)

  // Subscribe to combat events
  onEvent(callback: (event: RealCombatEvent) => void) {
    this.eventCallbacks.push(callback);
  }

  onUpdate(callback: (state: RealCombatState) => void) {
    this.updateCallbacks.push(callback);
  }

  // Initialize enhanced real-time combat
  startCombat(
    squad: (SquadMember | PlayerCharacter)[],
    enemies: any[],
    mission: Mission
  ): string {
    const combatId = `enhanced-combat-${Date.now()}`;
    const terrain = mission.terrain || getTerrainByLocation(mission.location).id;
    const weather = mission.weather || pickWeatherForTerrain(terrain).id;

    // Initialize combatants with enhanced stats and equipment
    const combatants: RealCombatParticipant[] = squad.map((member, index) => {
      const stats = calculateEnhancedCombatStats(member, terrain, weather);
      const currentHealth = (member as any).stats?.health ?? (member as any).health ?? stats.health;
      const maxHealth = stats.health;
      return {
        id: member.id,
        name: member.name,
        type: 'special' in member ? 'player' : 'squad',
        health: Math.min(maxHealth, Math.max(0, currentHealth)),
        maxHealth,
        stats,
        status: 'fighting',
        position: { x: Math.random() * 100, y: Math.random() * 100 },
        cover: 0,
        morale: stats.morale,
        fatigue: 0,
        energy: 100,
        maxEnergy: 100,
        lastAction: 0,
        actionCooldowns: {},
        activeEffects: []
      };
    });

    // Initialize enemies using their provided stats without artificial buffs
    const combatEnemies: RealCombatEnemy[] = enemies.map((enemy, index) => {
      let baseHealth = enemy.health ?? 50;
      let baseDamage = enemy.damage ?? 15;
      let baseAccuracy = Math.min(95, Math.max(30, enemy.accuracy ?? 60));
      const baseDefense = enemy.defense ?? 5;

      // No artificial buffs/chems for enemies per design
      const availableChems: string[] = [];

      return {
        id: `enemy-${index}`,
        name: enemy.name,
        type: enemy.type || 'hostile',
        health: baseHealth,
        maxHealth: baseHealth,
        damage: baseDamage,
        accuracy: baseAccuracy,
        defense: baseDefense,
        intelligence: enemy.intelligence || 40,
        position: { x: Math.random() * 100, y: Math.random() * 100 },
        status: 'alive',
        behavior: this.determineEnemyBehavior(enemy),
        weapon: enemy.weapon || this.assignEnemyWeapon(enemy.type),
        availableActions: this.getEnemyActions(enemy.type),
        actionCooldowns: {},
        availableChems,
        usedChems: [],
        activeEffects: [],
        perks: enemy.perks || []
      };
    });

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
    
    // Pace: slow down combat to simulate longer, more tactical engagements
    this.damagePace = 1.0; // normal pacing so damage is visible and fights resolve

    // Start the enhanced combat simulation loop
    this.runEnhancedCombatLoop();

    this.emitEvent({
      id: this.generateEventId(),
      timestamp: Date.now(),
      type: 'status',
      actor: 'System',
      action: CombatActionType.OBSERVE,
      description: `🚨 Enhanced combat initiated: ${squad.length} operatives vs ${enemies.length} hostiles in ${terrain} terrain. Weather: ${weather}.`,
      details: { terrain, weather, mission: mission.title }
    });

    return combatId;
  }

  // Calculate squad weapon score for enemy scaling
  private calculateSquadWeaponScore(squad: (SquadMember | PlayerCharacter)[]): number {
    let totalScore = 0;
    
    squad.forEach(member => {
      const equipment = member.equipment || { weapon: null, armor: null, accessory: null };
      
      if (equipment.weapon) {
        const weapon = GAME_ITEMS.find(item => item.id === equipment.weapon);
        if (weapon && weapon.stats) {
          totalScore += (weapon.stats.damage || 0) * 2;
          totalScore += (weapon.stats.accuracy || 0) * 0.5;
          totalScore += (weapon.stats.fireRate || 0) * 1.5;
        }
      } else {
        // No weapon equipped, very low score
        totalScore += 5;
      }
      
      if (equipment.armor) {
        const armor = GAME_ITEMS.find(item => item.id === equipment.armor);
        if (armor && armor.stats) {
          totalScore += (armor.stats.defense || 0) * 3;
        }
      }
    });
    
    return totalScore;
  }

  // Enhanced combat loop with sophisticated AI
  private runEnhancedCombatLoop() {
    if (!this.combatState || !this.combatState.isActive) return;

    // Dynamic interval based on combat intensity (1-3 seconds)
    const baseInterval = 1500;
    const combatIntensity = this.combatState.combatants.length + this.combatState.enemies.length;
    const dynamicInterval = Math.max(1000, Math.min(3000, baseInterval + (combatIntensity * 100)));

    const interval = setInterval(() => {
      if (!this.combatState || !this.combatState.isActive) {
        clearInterval(interval);
        return;
      }

      this.processEnhancedCombatRound();
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

      // Safety timeout (4 hours max for longest missions)
      if (Date.now() - this.combatState.startTime > 4 * 60 * 60 * 1000) {
        this.endCombat(aliveCombatants.length > aliveEnemies.length);
        clearInterval(interval);
      }
    }, dynamicInterval); // Dynamic interval based on combat complexity
  }

  // Process enhanced combat round with 25 actions
  private processEnhancedCombatRound() {
    if (!this.combatState) return;

    this.combatState.currentRound++;
    this.combatState.duration = Date.now() - this.combatState.startTime;

    // Process combatant actions with enhanced AI
    this.combatState.combatants
      .filter(c => c.status === 'fighting')
      .forEach(combatant => {
        this.processEnhancedCombatantAction(combatant);
      });

    // Process enemy actions with sophisticated AI
    this.combatState.enemies
      .filter(e => e.status === 'alive')
      .forEach(enemy => {
        this.processEnhancedEnemyAction(enemy);
      });

    // Update conditions and effects
    this.updateEnhancedCombatantConditions();
    this.processActiveEffects();
    this.updateActionCooldowns();
  }

  // Enhanced combatant action processing with 25 actions
  private processEnhancedCombatantAction(combatant: RealCombatParticipant) {
    if (!this.combatState) return;

    const aliveEnemies = this.combatState.enemies.filter(e => e.status === 'alive');
    if (aliveEnemies.length === 0) return;

    // AI decision making based on comprehensive factors
    const chosenAction = this.decideEnhancedCombatantAction(combatant, aliveEnemies);
    
    // Check if action is available (not on cooldown and has energy)
    if (this.canPerformAction(combatant, chosenAction)) {
      this.executeEnhancedAction(combatant, chosenAction, aliveEnemies);
      combatant.lastAction = Date.now();
    }
  }

  // Sophisticated AI decision making for combatants
  private decideEnhancedCombatantAction(
    combatant: RealCombatParticipant,
    enemies: RealCombatEnemy[]
  ): CombatActionType {
    const intelligence = combatant.stats.intelligence;
    const health = combatant.health / combatant.maxHealth;
    const morale = combatant.morale;
    const fatigue = combatant.fatigue;
    const terrain = this.combatState?.terrain || '';

    // Critical health situations
    if (health < 0.25) {
      if (Math.random() < 0.8) {
        return Math.random() < 0.6 ? CombatActionType.DIVE_COVER : CombatActionType.RETREAT;
      }
    }

    // Low health - defensive actions
    if (health < 0.5 && Math.random() < 0.6) {
      const defensiveActions = [
        CombatActionType.TAKE_COVER,
        CombatActionType.DODGE,
        CombatActionType.HEAL_TEAMMATE
      ];
      return defensiveActions[Math.floor(Math.random() * defensiveActions.length)];
    }

    // High intelligence - tactical actions
    if (intelligence > 70 && Math.random() < 0.5) {
      const tacticalActions = [
        CombatActionType.COORDINATE,
        CombatActionType.OVERWATCH,
        CombatActionType.FLANK,
        CombatActionType.OBSERVE,
        CombatActionType.RALLY
      ];
      return tacticalActions[Math.floor(Math.random() * tacticalActions.length)];
    }

    // Stealth specialist actions
    if (combatant.stats.stealth > 60 && Math.random() < 0.4) {
      const stealthActions = [
        CombatActionType.AMBUSH,
        CombatActionType.STEALTH_MOVE,
        CombatActionType.FLANK
      ];
      return stealthActions[Math.floor(Math.random() * stealthActions.length)];
    }

    // High combat skill - aggressive actions
    if (combatant.stats.damage > 20 && Math.random() < 0.6) {
      const aggressiveActions = [
        CombatActionType.RUSH,
        CombatActionType.SNIPE,
        CombatActionType.EXECUTE,
        CombatActionType.BREACH
      ];
      return aggressiveActions[Math.floor(Math.random() * aggressiveActions.length)];
    }

    // Default action based on situation
    return Math.random() < 0.7 ? CombatActionType.ATTACK : CombatActionType.TAKE_COVER;
  }

  // Check if combatant can perform action
  private canPerformAction(combatant: RealCombatParticipant, action: CombatActionType): boolean {
    const actionData = COMBAT_ACTIONS[action];
    
    // Check cooldown
    if (combatant.actionCooldowns[action] && combatant.actionCooldowns[action]! > 0) {
      return false;
    }
    
    // Check energy
    if (combatant.energy < actionData.energyCost) {
      return false;
    }
    
    // Check requirements
    if (actionData.requirements.minIntelligence && combatant.stats.intelligence < actionData.requirements.minIntelligence) {
      return false;
    }
    
    if (actionData.requirements.minCombat && combatant.stats.damage < actionData.requirements.minCombat) {
      return false;
    }
    
    if (actionData.requirements.minStealth && combatant.stats.stealth < actionData.requirements.minStealth) {
      return false;
    }
    
    return true;
  }

  // Execute enhanced action with detailed effects
  private executeEnhancedAction(
    combatant: RealCombatParticipant,
    action: CombatActionType,
    enemies: RealCombatEnemy[]
  ) {
    const actionData = COMBAT_ACTIONS[action];
    
    // Consume energy and set cooldown
    combatant.energy -= actionData.energyCost;
    combatant.actionCooldowns[action] = actionData.cooldown;
    
    // Execute action based on type
    switch (action) {
      case CombatActionType.ATTACK:
      case CombatActionType.SNIPE:
      case CombatActionType.RUSH:
      case CombatActionType.FLANK:
      case CombatActionType.AMBUSH:
      case CombatActionType.BREACH:
      case CombatActionType.EXECUTE:
        this.executeOffensiveAction(combatant, action, enemies);
        break;
        
      case CombatActionType.DODGE:
      case CombatActionType.DUCK:
      case CombatActionType.TAKE_COVER:
      case CombatActionType.DIVE_COVER:
      case CombatActionType.BLOCK:
      case CombatActionType.RETREAT:
        this.executeDefensiveAction(combatant, action);
        break;
        
      case CombatActionType.OVERWATCH:
      case CombatActionType.STEALTH_MOVE:
      case CombatActionType.RALLY:
      case CombatActionType.REPOSITION:
      case CombatActionType.COORDINATE:
      case CombatActionType.OBSERVE:
        this.executeTacticalAction(combatant, action);
        break;
        
      default:
        this.executeSpecialAction(combatant, action, enemies);
        break;
    }
  }

  // Execute offensive actions with dynamic descriptions
  private executeOffensiveAction(
    attacker: RealCombatParticipant,
    action: CombatActionType,
    enemies: RealCombatEnemy[]
  ) {
    const actionData = COMBAT_ACTIONS[action];
    const target = this.selectTarget(attacker, enemies);
    
    if (!target) return;
    
    const hitChance = Math.random() * 100;
    const weatherAccPenalty = this.getWeatherAccuracyPenalty();
    const effectiveAccuracy = attacker.stats.accuracy + (actionData.effects.accuracy || 0) + attacker.cover + weatherAccPenalty;
    
    if (hitChance <= effectiveAccuracy) {
      let damage = Math.floor(attacker.stats.damage * (actionData.effects.damage || 1.0));
      damage += Math.floor(Math.random() * 10) - 5; // Variance
      
      // Apply terrain, weather and situational modifiers
      damage = this.applyDamageModifiers(damage, attacker, target, action);
      
      // Global pacing: slow down damage throughput
      damage = Math.max(1, Math.floor(damage * this.damagePace));
      
      target.health = Math.max(0, target.health - damage);
      
      // Generate dynamic description based on action
      const description = this.generateActionDescription(attacker, target, action, damage, true);
      
      this.emitEvent({
        id: this.generateEventId(),
        timestamp: Date.now(),
        type: 'damage',
        actor: attacker.name,
        action,
        target: target.name,
        damage,
        description
      });
      
      if (target.health <= 0) {
        target.status = 'dead';
        this.emitEvent({
          id: this.generateEventId(),
          timestamp: Date.now(),
          type: 'victory',
          actor: attacker.name,
          action,
          target: target.name,
          description: `🎯 ${attacker.name} eliminated ${target.name} with ${actionData.name}!`
        });
      }
    } else {
      const description = this.generateActionDescription(attacker, target, action, 0, false);
      this.emitEvent({
        id: this.generateEventId(),
        timestamp: Date.now(),
        type: 'action',
        actor: attacker.name,
        action,
        target: target.name,
        description
      });
    }
  }

  // Execute defensive actions
  private executeDefensiveAction(combatant: RealCombatParticipant, action: CombatActionType) {
    const actionData = COMBAT_ACTIONS[action];
    
    // Apply defensive effects
    if (actionData.effects.defense) {
      combatant.cover += actionData.effects.defense;
    }
    
    if (actionData.effects.stealth) {
      // Apply stealth bonus temporarily
      combatant.activeEffects.push({
        type: 'stealth_bonus',
        duration: 3,
        effects: { stealth: actionData.effects.stealth }
      });
    }
    
    const description = this.generateDefensiveDescription(combatant, action);
    this.emitEvent({
      id: this.generateEventId(),
      timestamp: Date.now(),
      type: 'action',
      actor: combatant.name,
      action,
      description
    });
  }

  // Execute tactical actions
  private executeTacticalAction(combatant: RealCombatParticipant, action: CombatActionType) {
    const actionData = COMBAT_ACTIONS[action];
    
    // Apply tactical effects to self or team
    if (action === CombatActionType.RALLY && this.combatState) {
      // Rally affects all team members
      this.combatState.combatants.forEach(member => {
        member.morale += actionData.effects.morale || 0;
      });
    }
    
    const description = this.generateTacticalDescription(combatant, action);
    this.emitEvent({
      id: this.generateEventId(),
      timestamp: Date.now(),
      type: 'action',
      actor: combatant.name,
      action,
      description
    });
  }

  // Execute special actions
  private executeSpecialAction(
    combatant: RealCombatParticipant,
    action: CombatActionType,
    enemies: RealCombatEnemy[]
  ) {
    const description = this.generateSpecialDescription(combatant, action);
    this.emitEvent({
      id: this.generateEventId(),
      timestamp: Date.now(),
      type: 'action',
      actor: combatant.name,
      action,
      description
    });
  }

  // Generate dynamic action descriptions
  private generateActionDescription(
    attacker: RealCombatParticipant,
    target: RealCombatEnemy,
    action: CombatActionType,
    damage: number,
    hit: boolean
  ): string {
    const actionData = COMBAT_ACTIONS[action];
    const terrain = this.combatState?.terrain || '';
    
    if (!hit) {
      const missDescriptions = {
        [CombatActionType.SNIPE]: `${attacker.name}'s precision shot narrowly misses ${target.name}'s head`,
        [CombatActionType.RUSH]: `${attacker.name} charges at ${target.name} but stumbles, missing the attack`,
        [CombatActionType.FLANK]: `${target.name} spots ${attacker.name}'s flanking attempt and evades`,
        [CombatActionType.AMBUSH]: `${target.name} senses danger and avoids ${attacker.name}'s ambush`,
        [CombatActionType.ATTACK]: `${attacker.name} swings at ${target.name} but hits empty air`
      };
      return missDescriptions[action] || `${attacker.name} failed to connect with ${actionData.name}`;
    }
    
    const hitDescriptions = {
      [CombatActionType.SNIPE]: `🎯 ${attacker.name} lines up a perfect shot, drilling ${target.name} for ${damage} damage`,
      [CombatActionType.RUSH]: `💥 ${attacker.name} charges forward with fury, smashing into ${target.name} for ${damage} damage`,
      [CombatActionType.FLANK]: `🔄 ${attacker.name} outmaneuvers ${target.name}, striking from the side for ${damage} damage`,
      [CombatActionType.AMBUSH]: `👻 ${attacker.name} emerges from concealment, ambushing ${target.name} for ${damage} damage`,
      [CombatActionType.BREACH]: `🚪 ${attacker.name} breaches ${target.name}'s position, dealing ${damage} damage`,
      [CombatActionType.EXECUTE]: `☠️ ${attacker.name} attempts an execution on ${target.name}, dealing ${damage} damage`,
      [CombatActionType.ATTACK]: `⚔️ ${attacker.name} strikes ${target.name} for ${damage} damage`
    };
    
    return hitDescriptions[action] || `${attacker.name} uses ${actionData.name} on ${target.name} for ${damage} damage`;
  }

  // Generate defensive action descriptions
  private generateDefensiveDescription(combatant: RealCombatParticipant, action: CombatActionType): string {
    const descriptions = {
      [CombatActionType.DODGE]: `🏃 ${combatant.name} weaves through incoming fire with agile footwork`,
      [CombatActionType.DUCK]: `⬇️ ${combatant.name} drops low, avoiding the worst of the enemy fire`,
      [CombatActionType.TAKE_COVER]: `🛡️ ${combatant.name} finds solid cover behind nearby debris`,
      [CombatActionType.DIVE_COVER]: `🤿 ${combatant.name} dives desperately for cover as bullets fly overhead`,
      [CombatActionType.BLOCK]: `🛡️ ${combatant.name} raises their weapon defensively, ready to parry attacks`,
      [CombatActionType.RETREAT]: `⬅️ ${combatant.name} falls back to a more defensible position`
    };
    
    return descriptions[action] || `${combatant.name} takes defensive action`;
  }

  // Generate tactical action descriptions
  private generateTacticalDescription(combatant: RealCombatParticipant, action: CombatActionType): string {
    const descriptions = {
      [CombatActionType.OVERWATCH]: `👁️ ${combatant.name} sets up overwatch, covering potential enemy movements`,
      [CombatActionType.STEALTH_MOVE]: `👤 ${combatant.name} moves silently through the shadows`,
      [CombatActionType.RALLY]: `📣 ${combatant.name} rallies the team with inspiring words and tactical direction`,
      [CombatActionType.REPOSITION]: `🔄 ${combatant.name} repositions to gain tactical advantage`,
      [CombatActionType.COORDINATE]: `🎯 ${combatant.name} coordinates a team assault with precise timing`,
      [CombatActionType.OBSERVE]: `🔍 ${combatant.name} carefully studies enemy positions and weaknesses`
    };
    
    return descriptions[action] || `${combatant.name} performs tactical maneuver`;
  }

  // Generate special action descriptions
  private generateSpecialDescription(combatant: RealCombatParticipant, action: CombatActionType): string {
    const descriptions = {
      [CombatActionType.SUPPRESS]: `🔥 ${combatant.name} lays down suppressive fire, pinning enemies in place`,
      [CombatActionType.INTIMIDATE]: `😤 ${combatant.name} shouts intimidating threats, shaking enemy resolve`,
      [CombatActionType.COUNTER_ATTACK]: `↩️ ${combatant.name} waits for the perfect moment to counter-attack`
    };
    
    return descriptions[action] || `${combatant.name} performs special action`;
  }

  // Enhanced enemy action processing
  private processEnhancedEnemyAction(enemy: RealCombatEnemy) {
    if (!this.combatState) return;

    const aliveCombatants = this.combatState.combatants.filter(c => c.status === 'fighting');
    if (aliveCombatants.length === 0) return;

    // Enemies do not use chems or temporary buffs (disabled for fairness)
    // Intentionally no-op here to keep enemy stats consistent during combat

    const chosenAction = this.decideEnemyAction(enemy, aliveCombatants);
    
    if (this.canEnemyPerformAction(enemy, chosenAction)) {
      this.executeEnemyAction(enemy, chosenAction, aliveCombatants);
    }
  }

  // Decide enemy action based on behavior and intelligence
  private decideEnemyAction(enemy: RealCombatEnemy, combatants: RealCombatParticipant[]): CombatActionType {
    const availableActions = enemy.availableActions.filter(action => 
      this.canEnemyPerformAction(enemy, action)
    );
    
    if (availableActions.length === 0) return CombatActionType.ATTACK;
    
    // Behavior-based action selection
    switch (enemy.behavior) {
      case 'aggressive':
        const aggressiveActions = availableActions.filter(action => 
          [CombatActionType.ATTACK, CombatActionType.RUSH, CombatActionType.EXECUTE].includes(action)
        );
        if (aggressiveActions.length > 0) {
          return aggressiveActions[Math.floor(Math.random() * aggressiveActions.length)];
        }
        break;
        
      case 'tactical':
        const tacticalActions = availableActions.filter(action => 
          [CombatActionType.FLANK, CombatActionType.OVERWATCH, CombatActionType.COORDINATE].includes(action)
        );
        if (tacticalActions.length > 0) {
          return tacticalActions[Math.floor(Math.random() * tacticalActions.length)];
        }
        break;
        
      case 'defensive':
        const defensiveActions = availableActions.filter(action => 
          [CombatActionType.TAKE_COVER, CombatActionType.DODGE, CombatActionType.RETREAT].includes(action)
        );
        if (defensiveActions.length > 0 && enemy.health < enemy.maxHealth * 0.5) {
          return defensiveActions[Math.floor(Math.random() * defensiveActions.length)];
        }
        break;
    }
    
    return availableActions[Math.floor(Math.random() * availableActions.length)];
  }

  // Check if enemy can perform action
  private canEnemyPerformAction(enemy: RealCombatEnemy, action: CombatActionType): boolean {
    return !enemy.actionCooldowns[action] || enemy.actionCooldowns[action]! <= 0;
  }

  // Execute enemy action
  private executeEnemyAction(
    enemy: RealCombatEnemy,
    action: CombatActionType,
    combatants: RealCombatParticipant[]
  ) {
    const target = this.selectEnemyTarget(enemy, combatants);
    if (!target) return;
    
    const actionData = COMBAT_ACTIONS[action];
    enemy.actionCooldowns[action] = actionData.cooldown;
    
    // Execute based on action type
    if ([CombatActionType.ATTACK, CombatActionType.RUSH, CombatActionType.SNIPE].includes(action)) {
      this.executeEnemyAttack(enemy, target, action);
    } else {
      // Non-attack actions
      const description = `${enemy.name} performs ${actionData.name}`;
      this.emitEvent({
        id: this.generateEventId(),
        timestamp: Date.now(),
        type: 'action',
        actor: enemy.name,
        action,
        description
      });
    }
  }

  // Execute enemy attack with enhanced damage scaling
  private executeEnemyAttack(
    enemy: RealCombatEnemy,
    target: RealCombatParticipant,
    action: CombatActionType
  ) {
    const actionData = COMBAT_ACTIONS[action];
    const hitChance = Math.random() * 100;
    const weatherAccPenalty = this.getWeatherAccuracyPenalty();
    const effectiveEnemyAcc = Math.max(5, Math.min(95, enemy.accuracy + weatherAccPenalty));
    
    if (hitChance <= effectiveEnemyAcc) {
      let damage = Math.floor(enemy.damage * (actionData.effects.damage || 1.0));
      damage = Math.max(1, damage - (target.stats.defense * 0.1));
      
      // Apply enemy perks to damage calculation
      if (enemy.perks && enemy.perks.length > 0) {
        const enemyStats = {
          damage,
          accuracy: enemy.accuracy,
          defense: enemy.defense,
          health: enemy.health,
          fireRate: 1,
          attackInterval: 20,
          overallStat: 0,
          stealth: 0,
          movement: 0,
          morale: 60,
          intelligence: enemy.intelligence,
          terrainEffects: {},
          traitBonuses: {}
        };
        const enhancedStats = applyPerksToStats(enemyStats, enemy.perks);
        damage = enhancedStats.damage;
      }
      
      // Apply damage - can reduce to 0 HP for defeat
      const newHealth = Math.max(0, target.health - damage);
      
      if (newHealth === 0) {
        target.status = 'knocked-out';
        this.emitEvent({
          id: this.generateEventId(),
          timestamp: Date.now(),
          type: 'status',
          actor: enemy.name,
          action,
          target: target.name,
          damage,
          description: `💀 ${target.name} was defeated by ${enemy.name}'s ${actionData.name}!`
        });
      } else if (newHealth <= 10 && target.health > 10) {
        this.emitEvent({
          id: this.generateEventId(),
          timestamp: Date.now(),
          type: 'status',
          actor: enemy.name,
          action,
          target: target.name,
          damage,
          description: `🤕 ${target.name} is critically wounded by ${enemy.name}'s ${actionData.name}!`
        });
      } else if (newHealth > 0) {
        this.emitEvent({
          id: this.generateEventId(),
          timestamp: Date.now(),
          type: 'damage',
          actor: enemy.name,
          action,
          target: target.name,
          damage,
          description: `${enemy.name} ${this.getEnemyAttackDescription(action)} ${target.name} for ${damage} damage`
        });
      }
      
      target.health = newHealth;
    } else {
      this.emitEvent({
        id: this.generateEventId(),
        timestamp: Date.now(),
        type: 'action',
        actor: enemy.name,
        action,
        target: target.name,
        description: `${enemy.name} misses ${target.name} with ${actionData.name}`
      });
    }
  }

  // Get enemy attack description
  private getEnemyAttackDescription(action: CombatActionType): string {
    const descriptions = {
      [CombatActionType.ATTACK]: 'strikes',
      [CombatActionType.RUSH]: 'charges and hits',
      [CombatActionType.SNIPE]: 'snipes',
      [CombatActionType.FLANK]: 'flanks and attacks'
    };
    return descriptions[action] || 'attacks';
  }

  // Enhanced target selection
  private selectTarget(attacker: RealCombatParticipant, enemies: RealCombatEnemy[]): RealCombatEnemy | null {
    if (enemies.length === 0) return null;
    
    // Intelligent targeting based on attacker stats
    if (attacker.stats.intelligence > 70) {
      // Target weakest enemy
      return enemies.reduce((weakest, current) => 
        current.health < weakest.health ? current : weakest
      );
    } else if (attacker.stats.intelligence > 50) {
      // Target closest enemy (simulate positioning)
      return enemies[0]; // Simplified
    } else {
      // Random target
      return enemies[Math.floor(Math.random() * enemies.length)];
    }
  }

  // Select enemy target
  private selectEnemyTarget(enemy: RealCombatEnemy, combatants: RealCombatParticipant[]): RealCombatParticipant | null {
    if (combatants.length === 0) return null;
    // Distribute damage more evenly: pick a random alive combatant
    return combatants[Math.floor(Math.random() * combatants.length)];
  }

  // Update combat conditions
  private updateEnhancedCombatantConditions() {
    if (!this.combatState) return;
    
    this.combatState.combatants.forEach(combatant => {
      // Check for knocked-out status based on health
      if (combatant.health <= 0 && combatant.status === 'fighting') {
        combatant.status = 'knocked-out';
        this.emitEvent({
          id: this.generateEventId(),
          timestamp: Date.now(),
          type: 'status',
          actor: combatant.name,
          action: CombatActionType.RETREAT,
          description: `💀 ${combatant.name} has been defeated and cannot continue fighting!`
        });
      }

      // Regenerate energy
      combatant.energy = Math.min(combatant.maxEnergy, combatant.energy + 5);
      
      // Increase fatigue
      combatant.fatigue = Math.min(100, combatant.fatigue + 1);
      
      // Morale effects (weather and health)
      const weather = this.combatState?.weather;
      if (weather === 'radiation-storm') {
        combatant.morale = Math.max(5, combatant.morale - 1);
      }
      if (combatant.health < combatant.maxHealth * 0.3) {
        combatant.morale = Math.max(10, combatant.morale - 1);
      }
      
      // Cover degrades over time
      combatant.cover = Math.max(0, combatant.cover - 2);
    });

    // Update enemy status
    this.combatState.enemies.forEach(enemy => {
      if (enemy.health <= 0 && enemy.status === 'alive') {
        enemy.status = 'dead';
      }
    });
  }

  // Process active effects
  private processActiveEffects() {
    if (!this.combatState) return;
    
    this.combatState.combatants.forEach(combatant => {
      combatant.activeEffects = combatant.activeEffects.filter(effect => {
        effect.duration--;
        return effect.duration > 0;
      });
    });

    // Enemy active effects not used as chems are disabled; keep array clean
    this.combatState.enemies.forEach(enemy => {
      enemy.activeEffects = (enemy.activeEffects || []).filter(() => false);
    });
  }

  // Update action cooldowns
  private updateActionCooldowns() {
    if (!this.combatState) return;
    
    this.combatState.combatants.forEach(combatant => {
      Object.keys(combatant.actionCooldowns).forEach(actionKey => {
        const action = actionKey as CombatActionType;
        if (combatant.actionCooldowns[action]! > 0) {
          combatant.actionCooldowns[action]!--;
        }
      });
    });
    
    this.combatState.enemies.forEach(enemy => {
      Object.keys(enemy.actionCooldowns).forEach(actionKey => {
        const action = actionKey as CombatActionType;
        if (enemy.actionCooldowns[action]! > 0) {
          enemy.actionCooldowns[action]!--;
        }
      });
    });
  }

  // Assign enemy weapons and actions
  private assignEnemyWeapon(enemyType: string): string {
    const weaponAssignments = {
      'raider': 'damaged-32-pistol',
      'super-mutant': 'hunting-rifle',
      'ghoul': 'none',
      'robot': 'laser-rifle',
      'deathclaw': 'claws'
    };
    return weaponAssignments[enemyType as keyof typeof weaponAssignments] || 'damaged-32-pistol';
  }

  private getEnemyActions(enemyType: string): CombatActionType[] {
    const baseActions = [
      CombatActionType.ATTACK,
      CombatActionType.TAKE_COVER,
      CombatActionType.DODGE
    ];
    
    const typeSpecificActions = {
      'raider': [CombatActionType.RUSH, CombatActionType.INTIMIDATE],
      'super-mutant': [CombatActionType.SUPPRESS, CombatActionType.EXECUTE],
      'ghoul': [CombatActionType.AMBUSH, CombatActionType.STEALTH_MOVE],
      'robot': [CombatActionType.OVERWATCH, CombatActionType.COORDINATE],
      'deathclaw': [CombatActionType.RUSH, CombatActionType.EXECUTE, CombatActionType.INTIMIDATE]
    };
    
    return [...baseActions, ...(typeSpecificActions[enemyType as keyof typeof typeSpecificActions] || [])];
  }

  // Helper methods
  private applyDamageModifiers(
    damage: number,
    attacker: RealCombatParticipant,
    target: RealCombatEnemy,
    action: CombatActionType
  ): number {
    let modifiedDamage = damage;
    
    // Terrain modifiers
    const terrain = this.combatState?.terrain;
    if (terrain === 'urban' && action === CombatActionType.BREACH) {
      modifiedDamage = Math.floor(modifiedDamage * 1.3);
    }
    if (terrain === 'forest' && action === CombatActionType.AMBUSH) {
      modifiedDamage = Math.floor(modifiedDamage * 1.5);
    }

    // Weather modifiers (affect damage throughput)
    const weather = this.combatState?.weather;
    if (weather === 'fog') modifiedDamage = Math.floor(modifiedDamage * 0.9);
    if (weather === 'light-rain') modifiedDamage = Math.floor(modifiedDamage * 0.95);
    if (weather === 'dust-storm') modifiedDamage = Math.floor(modifiedDamage * 0.85);
    if (weather === 'radiation-storm') modifiedDamage = Math.floor(modifiedDamage * 0.9);
    
    return Math.max(1, modifiedDamage);
  }

  private generateWeather(): string {
    const weathers = ['clear', 'overcast', 'light-rain', 'fog', 'dust-storm', 'radiation-storm'];
    return weathers[Math.floor(Math.random() * weathers.length)];
  }

  private getWeatherAccuracyPenalty(): number {
    const weather = this.combatState?.weather;
    switch (weather) {
      case 'fog': return -20;
      case 'light-rain': return -10;
      case 'dust-storm': return -15;
      case 'radiation-storm': return -10;
      case 'overcast': return -2;
      default: return 0;
    }
  }

  private determineEnemyBehavior(enemy: any): 'aggressive' | 'defensive' | 'tactical' | 'fleeing' {
    const intel = enemy.intelligence || 40;
    if (intel > 70) return 'tactical';
    if (intel > 50) return 'defensive';
    return 'aggressive';
  }

  private generateEventId(): string {
    return `enhanced-event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
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

  private endCombat(victory: boolean) {
    if (!this.combatState) return;

    this.combatState.isActive = false;
    this.combatState.victory = victory;

    this.emitEvent({
      id: this.generateEventId(),
      timestamp: Date.now(),
      type: victory ? 'victory' : 'defeat',
      actor: 'System',
      action: CombatActionType.OBSERVE,
      description: `🏁 Enhanced combat concluded: ${victory ? 'TACTICAL VICTORY!' : 'MISSION FAILED!'} - Duration: ${Math.floor(this.combatState.duration / 60000)}m ${Math.floor((this.combatState.duration % 60000) / 1000)}s`
    });

    // Calculate enhanced combat results
    const result = this.calculateEnhancedCombatResults();
    
    // Notify subscribers
    this.updateCallbacks.forEach(callback => {
      if (this.combatState) callback(this.combatState);
    });
  }

  // Calculate enhanced combat results
  private calculateEnhancedCombatResults(): DetailedCombatResult {
    if (!this.combatState) throw new Error('No combat state');

    const squadHealthLoss: { [memberId: string]: number } = {};
    
    this.combatState.combatants.forEach(combatant => {
      squadHealthLoss[combatant.id] = combatant.maxHealth - combatant.health;
    });

    return {
      squadHealthLoss,
      victory: this.combatState.victory || false,
      duration: Math.floor(this.combatState.duration / 1000),
      squadDamageDealt: this.calculateTotalDamageDealt(),
      enemyDamageDealt: this.calculateTotalDamageReceived(),
      combatLog: this.combatState.events.map(e => e.description),
      combatEvents: this.combatState.events.map(e => ({
        timestamp: e.timestamp,
        type: e.type === 'action' || e.type === 'status' ? 'tactical' : 
              e.type === 'damage' ? 'attack' : 
              e.type === 'environmental' ? 'terrain' : 'tactical',
        actor: e.actor,
        target: e.target,
        damage: e.damage,
        description: e.description
      })),
      terrainEffects: [`Enhanced terrain: ${this.combatState.terrain}`, `Weather: ${this.combatState.weather}`],
      tacticalAnalysis: [
        `Combat actions executed: ${this.combatState.events.length}`,
        `Rounds completed: ${this.combatState.currentRound}`,
        `Advanced AI decisions made`
      ],
      casualties: this.combatState.enemies.filter(e => e.status === 'dead').map(e => e.name),
      injuries: {},
      equipmentDamage: {},
      experienceGained: {},
      moraleChanges: {}
    };
  }

  private calculateTotalDamageDealt(): number {
    return this.combatState?.events
      .filter(e => e.type === 'damage' && e.damage)
      .reduce((total, e) => total + (e.damage || 0), 0) || 0;
  }

  private calculateTotalDamageReceived(): number {
    return this.combatState?.events
      .filter(e => e.type === 'damage' && e.target && !e.actor.includes('enemy'))
      .reduce((total, e) => total + (e.damage || 0), 0) || 0;
  }

  // Get current combat state
  getCombatState(): RealCombatState | null {
    return this.combatState;
  }
}