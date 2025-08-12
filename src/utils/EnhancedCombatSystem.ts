import { SquadMember, Mission } from '@/types/GameTypes';
import { PlayerCharacter } from '@/types/PlayerTypes';
import { GAME_ITEMS } from '@/data/GameItems';
import { TERRAIN_TYPES, getTerrainByLocation } from '@/data/TerrainTypes';
import { SQUAD_TRAITS, getTraitById } from '@/data/SquadTraits';
import { normalizeWeaponFromItem } from '@/utils/combat/WeaponNormalizer';
import { mapCoreStats10 } from '@/utils/combat/CoreStatMapper';
import { getWeatherModifiers } from '@/data/WeatherEvents';
import { applySquadPerksToStats } from '@/utils/SquadPerkApplication';
import { applyPerksToStats } from '@/utils/PerkSystem';

export interface EnhancedCombatStats {
  damage: number;
  accuracy: number;
  fireRate: number;
  attackInterval: number;
  overallStat: number;
  health: number;
  defense: number;
  stealth: number;
  movement: number;
  morale: number;
  intelligence: number;
  terrainEffects: { [key: string]: number };
  traitBonuses: { [key: string]: number };
}

export interface CombatAI {
  takeCover: boolean;
  flankAttempt: boolean;
  useTerrainAdvantage: boolean;
  targetPriority: 'weakest' | 'strongest' | 'closest' | 'random';
  tacticalDecision: string;
  intelligenceRoll: number;
}

export interface CombatEvent {
  timestamp: number;
  type: 'attack' | 'miss' | 'cover' | 'flank' | 'terrain' | 'tactical' | 'injury' | 'equipment';
  actor: string;
  target?: string;
  description: string;
  damage?: number;
  terrainEffect?: string;
  tacticalNote?: string;
}

export interface DetailedCombatResult {
  squadHealthLoss: { [memberId: string]: number };
  victory: boolean;
  duration: number;
  squadDamageDealt: number;
  enemyDamageDealt: number;
  combatLog: string[];
  combatEvents: CombatEvent[];
  terrainEffects: string[];
  tacticalAnalysis: string[];
  casualties: string[];
  injuries: { [memberId: string]: string };
  equipmentDamage: { [memberId: string]: string[] };
  experienceGained: { [memberId: string]: number };
  moraleChanges: { [memberId: string]: number };
}

export const calculateEnhancedCombatStats = (
  member: SquadMember | PlayerCharacter, 
  terrain?: string,
  weather?: string
): EnhancedCombatStats => {
  console.log(`Calculating enhanced combat stats for ${member.name}`, { terrain, weather });
  
  let weaponDamage = 0;
  let weaponAccuracy = 50;
  let weaponFireRate = 0;
  let armorDefense = 0;
  let armorHealthBonus = 0;
  let accessoryBonus = { combat: 0, stealth: 0, tech: 0, charisma: 0, health: 0 };

  // Get equipment stats (works for both squad members and player)
  const equipment = member.equipment || { weapon: null, armor: null, accessory: null };

  // Weapon calculations
  if (equipment.weapon) {
    const weapon = GAME_ITEMS.find(item => item.id === equipment.weapon);
    if (weapon && weapon.stats) {
      weaponDamage = weapon.stats.damage || 0;
      weaponAccuracy = Math.min(100, weapon.stats.accuracy || 50);
      weaponFireRate = weapon.stats.fireRate || 1;
    }
  }

  // Armor calculations
  if (equipment.armor) {
    const armor = GAME_ITEMS.find(item => item.id === equipment.armor);
    if (armor && armor.stats) {
      armorDefense = armor.stats.defense || 0;
      armorHealthBonus = armor.stats.health || 0;
    }
  }

  // Accessory calculations
  if (equipment.accessory) {
    const accessory = GAME_ITEMS.find(item => item.id === equipment.accessory);
    if (accessory && accessory.stats) {
      accessoryBonus.combat = accessory.stats.combat || 0;
      accessoryBonus.stealth = accessory.stats.stealth || 0;
      accessoryBonus.tech = accessory.stats.tech || 0;
      accessoryBonus.charisma = accessory.stats.charisma || 0;
      accessoryBonus.health = accessory.stats.health || 0;
    }
  }

  // Get base stats (different structure for player vs squad)
  let baseStats;
  if ('special' in member) {
    // Player character - convert SPECIAL to combat stats
    baseStats = {
      combat: member.special.strength * 4 + member.special.perception * 2,
      stealth: member.special.agility * 4 + member.special.perception * 2,
      tech: member.special.intelligence * 4 + member.special.perception,
      charisma: member.special.charisma * 4,
      intelligence: member.special.intelligence * 4,
      health: member.health,
      maxHealth: member.maxHealth
    };
  } else {
    // Squad member
    baseStats = member.stats;
  }

  // Apply chem bonuses
  let combatBonus = 0;
  let stealthBonus = 0;
  let accuracyBonus = 0;
  let damageBonus = 0;
  let techBonus = 0;
  let charismaBonus = 0;
  let healthBonus = 0;
  let defenseBonus = 0;

  if ('activeChems' in member && member.activeChems) {
    member.activeChems.forEach(chem => {
      if (chem.effects) {
        combatBonus += chem.effects.combat || 0;
        stealthBonus += chem.effects.stealth || 0;
        accuracyBonus += chem.effects.accuracy || 0;
        damageBonus += chem.effects.damage || 0;
        techBonus += chem.effects.tech || 0;
        charismaBonus += chem.effects.charisma || 0;
        healthBonus += chem.effects.health || 0;
        defenseBonus += chem.effects.defense || 0;
      }
    });
  }

  // Calculate effective stats
  const effectiveCombat = Math.min(100, Math.max(1, baseStats.combat + combatBonus + accessoryBonus.combat));
  const effectiveStealth = Math.min(100, Math.max(1, baseStats.stealth + stealthBonus + accessoryBonus.stealth));
  const effectiveTech = Math.min(100, Math.max(1, baseStats.tech + techBonus + accessoryBonus.tech));
  const effectiveCharisma = Math.min(100, Math.max(1, baseStats.charisma + charismaBonus + accessoryBonus.charisma));
  const effectiveIntelligence = Math.min(100, Math.max(1, baseStats.intelligence || effectiveTech));

  // Apply terrain effects
  let terrainEffects: { [key: string]: number } = {};
  if (terrain) {
    const terrainData = TERRAIN_TYPES.find(t => t.id === terrain);
    if (terrainData) {
      terrainEffects = { ...terrainData.playerEffects };
    }
  }

  // Apply trait bonuses
  let traitBonuses: { [key: string]: number } = {};
  if (member.traits) {
    member.traits.forEach(traitName => {
      const trait = getTraitById(traitName.toLowerCase().replace(/\s+/g, '-'));
      if (trait) {
        Object.entries(trait.effects).forEach(([effect, value]) => {
          traitBonuses[effect] = (traitBonuses[effect] || 0) + value;
        });
        
        // Apply terrain-specific bonuses
        if (terrain && trait.terrainBonuses && trait.terrainBonuses[terrain]) {
          Object.entries(trait.terrainBonuses[terrain]).forEach(([effect, value]) => {
            traitBonuses[effect] = (traitBonuses[effect] || 0) + (value as number);
          });
        }
      }
    });
  }

  // Weather effects via centralized modifiers
  const mods = getWeatherModifiers(weather);
  const accMod = mods?.accuracy ?? 0;
  const dmgMod = mods?.damage ?? 0;
  const defMod = mods?.defense ?? 0;
  const stealthMod = mods?.stealth ?? 0;
  const moveMod = mods?.movement ?? 0;
  const moraleMod = mods?.morale ?? 0;
  const fireRateMult = mods?.fireRatePct ? 1 + (mods.fireRatePct / 100) : 1;

  // Calculate final combat stats with all modifiers (terrain + traits + weather)
  const finalAccuracy = Math.min(100, Math.max(10,
    weaponAccuracy + accuracyBonus + (terrainEffects.accuracy || 0) + (traitBonuses.accuracy || 0) + accMod
  ));
  const finalDamage = Math.max(1,
    weaponDamage + damageBonus + (effectiveCombat * 0.5) + (terrainEffects.damage || 0) + (traitBonuses.damage || 0) + dmgMod
  );
  const finalDefense = Math.max(0,
    armorDefense + (terrainEffects.defense || 0) + (traitBonuses.defense || 0) + defMod
  );
  const finalStealth = Math.max(0,
    effectiveStealth + (terrainEffects.stealth || 0) + (traitBonuses.stealth || 0) + stealthMod
  );
  const finalMovement = Math.max(10,
    100 + (terrainEffects.movement || 0) + (traitBonuses.movement || 0) + moveMod
  );

  // Calculate attack interval using weather-adjusted fire rate
  const effectiveFireRate = Math.max(0.1, (weaponFireRate || 0) * fireRateMult);
  let attackInterval: number;
  if (effectiveFireRate > 0) {
    attackInterval = Math.max(1, Math.floor(60 / effectiveFireRate));
  } else {
    attackInterval = 15; // Unarmed default
  }

  // Calculate overall combat effectiveness
  const weaponMultiplier = weaponDamage > 0 ? 1.3 : 1.0;
  const terrainMultiplier = Object.values(terrainEffects).reduce((sum, effect) => sum + (effect > 0 ? effect * 0.01 : 0), 1);
  const baseOverallStat = ((effectiveCombat * 3) + 
                          (effectiveStealth * 1.5) + 
                          (effectiveTech * 0.8) + 
                          (effectiveCharisma * 0.7)) * weaponMultiplier * terrainMultiplier;

  const totalHealth = baseStats.maxHealth + armorHealthBonus + accessoryBonus.health + healthBonus;
  const morale = Math.min(100, Math.max(10, 75 + (effectiveCharisma * 0.3) + (traitBonuses.morale || 0) + (moraleMod || 0)));

  const finalStats: EnhancedCombatStats = {
    damage: Math.floor(finalDamage),
    accuracy: finalAccuracy,
    fireRate: effectiveFireRate,
    attackInterval,
    overallStat: baseOverallStat + (weaponDamage * 2),
    health: totalHealth,
    defense: finalDefense,
    stealth: finalStealth,
    movement: finalMovement,
    morale,
    intelligence: effectiveIntelligence,
    terrainEffects,
    traitBonuses
  };

  // Apply squad perks if applicable
  const withPerks = ('special' in member) ? finalStats : applySquadPerksToStats(finalStats, (member as any).perks);

  console.log(`Enhanced combat stats for ${member.name}:`, withPerks);
  return withPerks;
};

export const generateCombatAI = (
  combatStats: EnhancedCombatStats,
  enemies: any[],
  allies: any[],
  terrain?: string
): CombatAI => {
  const intelligenceRoll = Math.random() * combatStats.intelligence;
  
  // AI decision making based on intelligence and terrain
  let takeCover = false;
  let flankAttempt = false;
  let useTerrainAdvantage = false;
  let targetPriority: 'weakest' | 'strongest' | 'closest' | 'random' = 'random';
  let tacticalDecision = 'Standard attack';

  // Intelligence-based tactical decisions
  if (intelligenceRoll > 60) {
    takeCover = Math.random() < 0.8;
    flankAttempt = Math.random() < 0.6;
    useTerrainAdvantage = true;
    targetPriority = enemies.length > 2 ? 'weakest' : 'strongest';
    tacticalDecision = 'Advanced tactical maneuver';
  } else if (intelligenceRoll > 40) {
    takeCover = Math.random() < 0.5;
    flankAttempt = Math.random() < 0.3;
    useTerrainAdvantage = Math.random() < 0.7;
    targetPriority = 'closest';
    tacticalDecision = 'Basic tactical approach';
  } else {
    takeCover = Math.random() < 0.2;
    flankAttempt = false;
    useTerrainAdvantage = Math.random() < 0.3;
    targetPriority = 'random';
    tacticalDecision = 'Aggressive assault';
  }

  // Terrain-specific adjustments
  if (terrain) {
    const terrainData = TERRAIN_TYPES.find(t => t.id === terrain);
    if (terrainData) {
      if (terrain === 'forest' || terrain === 'urban') {
        takeCover = true;
        flankAttempt = intelligenceRoll > 50;
      } else if (terrain === 'wasteland' || terrain === 'desert') {
        takeCover = false;
        useTerrainAdvantage = false;
      } else if (terrain === 'underground' || terrain === 'vault') {
        flankAttempt = false;
        takeCover = true;
      }
    }
  }

  return {
    takeCover,
    flankAttempt,
    useTerrainAdvantage,
    targetPriority,
    tacticalDecision,
    intelligenceRoll
  };
};

export const simulateEnhancedCombat = (
  squad: (SquadMember | PlayerCharacter)[],
  enemies: any[],
  mission: Mission
): DetailedCombatResult => {
  const combatEvents: CombatEvent[] = [];
  const terrainEffects: string[] = [];
  const tacticalAnalysis: string[] = [];
  const casualties: string[] = [];
  const injuries: { [memberId: string]: string } = {};
  const equipmentDamage: { [memberId: string]: string[] } = {};
  const experienceGained: { [memberId: string]: number } = {};
  const moraleChanges: { [memberId: string]: number } = {};
  const squadHealthLoss: { [memberId: string]: number } = {};
  
  const combatLog: string[] = [];
  let combatTime = 0;
  let totalSquadDamage = 0;
  let totalEnemyDamage = 0;

  // Get terrain for this mission
  const terrain = mission.terrain || getTerrainByLocation(mission.location).id;
  const terrainData = TERRAIN_TYPES.find(t => t.id === terrain);
  
  console.log('Starting enhanced combat simulation', { terrain, mission: mission.title });
  
  combatLog.push(`🎯 Combat initiated: ${mission.title}`);
  combatLog.push(`🗺️ Terrain: ${terrainData?.name || 'Unknown'} - ${terrainData?.description || ''}`);
  
  if (terrainData) {
    terrainEffects.push(`Terrain: ${terrainData.name}`);
    terrainEffects.push(...terrainData.specialRules);
    terrainEffects.push(...terrainData.tacticalAdvantages);
  }

  // Initialize combat participants with enhanced stats
  const squadCombat = squad.map(member => {
    const stats = calculateEnhancedCombatStats(member, terrain);
    const ai = generateCombatAI(stats, enemies, squad, terrain);
    
    experienceGained[member.id] = 0;
    moraleChanges[member.id] = 0;
    equipmentDamage[member.id] = [];
    
    combatLog.push(`⚔️ ${member.name} enters combat: ${stats.damage} dmg, ${stats.accuracy}% acc, ${ai.tacticalDecision}`);
    
    return {
      id: member.id,
      name: member.name,
      health: stats.health,
      maxHealth: stats.health,
      stats,
      ai,
      member,
      morale: stats.morale,
      coverBonus: 0,
      terrainAdvantage: 0
    };
  });

  const enemyCombat = enemies.map((enemy, index) => ({
    id: `enemy-${index}`,
    name: enemy.name,
    health: enemy.health,
    maxHealth: enemy.health,
    damage: enemy.damage || 10,
    accuracy: enemy.accuracy || 50,
    combat: enemy.combat || 5,
    weapon: enemy.weapon || null,
    attackInterval: enemy.weapon ? Math.max(1, 60 / (enemy.weapon.fireRate || 1)) : 20,
    intelligence: enemy.intelligence || 30,
    level: enemy.level || 1,
    perks: enemy.perks || [],
    ai: generateCombatAI(
      { intelligence: enemy.intelligence || 30, morale: 60 } as any,
      squad,
      enemies,
      terrain
    ),
    // Add missing fields for TS
    armor: enemy.defense || 0,
    ammoCount: enemy.weapon ? Math.max(0, Math.floor((enemy.weapon.fireRate || 1) * 10)) : 0
  }));

  tacticalAnalysis.push(`Squad formation: ${squad.length} members vs ${enemies.length} enemies`);
  tacticalAnalysis.push(`Average squad intelligence: ${Math.round(squadCombat.reduce((sum, s) => sum + s.stats.intelligence, 0) / squadCombat.length)}`);

  // Enhanced combat loop with AI and terrain
  while (true) {
    combatTime += 1;
    const aliveSquad = squadCombat.filter(s => s.health > 0);
    const aliveEnemies = enemyCombat.filter(e => e.health > 0);

    if (aliveSquad.length === 0 || aliveEnemies.length === 0) {
      break;
    }

    if (combatTime > 3600) { // 60 minute max
      combatLog.push(`⏰ Combat timed out - tactical withdrawal initiated`);
      break;
    }

    // Squad combat phase with enhanced AI
    aliveSquad.forEach(squadMember => {
      if (combatTime % squadMember.stats.attackInterval === 0) {
        // AI decision making
        if (squadMember.ai.takeCover && Math.random() < 0.3) {
          squadMember.coverBonus = 15;
          combatEvents.push({
            timestamp: combatTime,
            type: 'cover',
            actor: squadMember.name,
            description: `${squadMember.name} takes cover (+15 defense)`,
            terrainEffect: terrainData?.name
          });
        }

        if (squadMember.ai.useTerrainAdvantage && Math.random() < 0.4) {
          squadMember.terrainAdvantage = 10;
          combatEvents.push({
            timestamp: combatTime,
            type: 'terrain',
            actor: squadMember.name,
            description: `${squadMember.name} uses terrain advantage (+10 accuracy)`,
            terrainEffect: terrainData?.name
          });
        }

        // Target selection based on AI
        let target;
        if (squadMember.ai.targetPriority === 'weakest') {
          target = aliveEnemies.reduce((weakest, enemy) => 
            enemy.health < weakest.health ? enemy : weakest
          );
        } else if (squadMember.ai.targetPriority === 'strongest') {
          target = aliveEnemies.reduce((strongest, enemy) => 
            enemy.health > strongest.health ? enemy : strongest
          );
        } else {
          target = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)];
        }

        if (target) {
          const hitChance = Math.random() * 100;
          const effectiveAccuracy = squadMember.stats.accuracy + squadMember.terrainAdvantage;
          
          if (hitChance <= effectiveAccuracy) {
            let damage = squadMember.stats.damage + Math.floor(Math.random() * 8) - 4; // ±4 variance
            
            // Apply flanking bonus
            if (squadMember.ai.flankAttempt && Math.random() < 0.3) {
              damage = Math.floor(damage * 1.5);
              combatEvents.push({
                timestamp: combatTime,
                type: 'flank',
                actor: squadMember.name,
                target: target.name,
                description: `${squadMember.name} successfully flanks ${target.name} (+50% damage)`,
                damage
              });
            }

            // Critical hit chance
            if (Math.random() < 0.1) {
              damage = Math.floor(damage * 2);
              combatEvents.push({
                timestamp: combatTime,
                type: 'attack',
                actor: squadMember.name,
                target: target.name,
                description: `💥 CRITICAL HIT! ${squadMember.name} deals massive damage to ${target.name}`,
                damage
              });
            }

            target.health = Math.max(0, target.health - damage);
            totalSquadDamage += damage;
            experienceGained[squadMember.id] += Math.floor(damage / 5);

            if (target.health <= 0) {
              combatLog.push(`💀 ${squadMember.name} eliminated ${target.name} with ${damage} damage`);
              casualties.push(target.name);
              experienceGained[squadMember.id] += 50;
              moraleChanges[squadMember.id] += 10;
            } else {
              combatLog.push(`🎯 ${squadMember.name} hit ${target.name} for ${damage} damage (${target.health}/${target.maxHealth} HP remaining)`);
            }
          } else {
            combatLog.push(`❌ ${squadMember.name} missed ${target.name}`);
            combatEvents.push({
              timestamp: combatTime,
              type: 'miss',
              actor: squadMember.name,
              target: target.name,
              description: `${squadMember.name} missed ${target.name}`
            });
            
            // Morale penalty for missing
            moraleChanges[squadMember.id] -= 2;
          }
        }

        // Reset temporary bonuses
        squadMember.coverBonus = 0;
        squadMember.terrainAdvantage = 0;
      }
    });

    // Enemy combat phase with enhanced AI
    aliveEnemies.forEach(enemy => {
      if (combatTime % enemy.attackInterval === 0) {
        const target = aliveSquad[Math.floor(Math.random() * aliveSquad.length)];
        if (target) {
          // Apply terrain effects to enemy
          let enemyAccuracy = enemy.accuracy + (terrainData?.enemyEffects.accuracy || 0);
          let enemyDamage = enemy.damage + (terrainData?.enemyEffects.damage || 0);

          const hitChance = Math.random() * 100;
          if (hitChance <= enemyAccuracy) {
            // Enhanced damage calculation with weapon scaling
            let baseDamage = enemy.damage + Math.floor(Math.random() * 8);
            if (enemy.weapon) {
              baseDamage += Math.floor((enemy.weapon.damage || 0) * 0.5);
              enemy.ammoCount = Math.max(0, enemy.ammoCount - 1);
            }
            
            // Apply enemy perks to damage
            if (enemy.perks && enemy.perks.length > 0) {
              const enemyStats = {
                damage: baseDamage,
                accuracy: enemy.accuracy,
                defense: enemy.armor || 0,
                health: enemy.health,
                fireRate: enemy.weapon?.fireRate || 1,
                attackInterval: enemy.attackInterval,
                overallStat: 0,
                stealth: 0,
                movement: 0,
                morale: 60,
                intelligence: enemy.intelligence || 30,
                terrainEffects: {},
                traitBonuses: {}
              };
              const enhancedStats = applyPerksToStats(enemyStats, enemy.perks);
              baseDamage = enhancedStats.damage;
            }
            
            // Advanced armor calculation
            const armorReduction = target.stats.defense * 0.2; // 20% damage reduction per defense
            const finalDamage = Math.max(2, baseDamage - armorReduction);

            const adjustedDamage = Math.max(1, finalDamage - (target.stats.defense + target.coverBonus) * 0.15);
            const newHealth = Math.max(0, target.health - adjustedDamage);

            // Equipment damage chance
            if (Math.random() < 0.1 && adjustedDamage > target.stats.defense) {
              const equipSlots = ['weapon', 'armor', 'accessory'];
              const damagedSlot = equipSlots[Math.floor(Math.random() * equipSlots.length)];
              equipmentDamage[target.id].push(`${damagedSlot} damaged by ${enemy.name}`);
              combatEvents.push({
                timestamp: combatTime,
                type: 'equipment',
                actor: enemy.name,
                target: target.name,
                description: `${target.name}'s ${damagedSlot} was damaged!`
              });
            }

            // Injury system
            if (newHealth === 0) {
              const injuryTypes = ['concussion', 'broken rib', 'sprained ankle', 'cuts and bruises', 'exhaustion'];
              const injury = injuryTypes[Math.floor(Math.random() * injuryTypes.length)];
              injuries[target.id] = injury;
              combatLog.push(`🤕 ${target.name} was knocked out by ${enemy.name} and suffered ${injury}`);
              moraleChanges[target.id] -= 20;
              
              // Squad morale effect
              Object.keys(moraleChanges).forEach(memberId => {
                if (memberId !== target.id) {
                  moraleChanges[memberId] -= 5;
                }
              });
            } else if (newHealth > 0) {
              combatLog.push(`🎯 ${enemy.name} hit ${target.name} for ${adjustedDamage} damage`);
              moraleChanges[target.id] -= 3;
            }

            target.health = newHealth;
            totalEnemyDamage += adjustedDamage;
          } else {
            combatLog.push(`❌ ${enemy.name} missed ${target.name}`);
          }
        }
      }
    });

    // Morale effects on combat
    squadCombat.forEach(member => {
      if (member.morale < 30) {
        member.stats.accuracy = Math.max(10, member.stats.accuracy * 0.8);
        member.stats.damage = Math.max(1, member.stats.damage * 0.8);
      } else if (member.morale > 80) {
        member.stats.accuracy = Math.min(100, member.stats.accuracy * 1.1);
        member.stats.damage = Math.floor(member.stats.damage * 1.1);
      }
    });
  }

  // Calculate final health losses
  squadCombat.forEach(member => {
    const original = squad.find(s => s.id === member.id);
    if (original) {
      squadHealthLoss[member.id] = Math.max(0, member.maxHealth - member.health);
    }
  });

  const victory = enemyCombat.every(e => e.health <= 0);
  const duration = combatTime;
  
  // Final analysis
  tacticalAnalysis.push(`Combat duration: ${Math.floor(duration / 60)} minutes`);
  tacticalAnalysis.push(`Total damage dealt by squad: ${totalSquadDamage}`);
  tacticalAnalysis.push(`Total damage received: ${totalEnemyDamage}`);
  tacticalAnalysis.push(`Casualties inflicted: ${casualties.length}`);
  tacticalAnalysis.push(`Squad members injured: ${Object.keys(injuries).length}`);
  
  if (terrainData) {
    tacticalAnalysis.push(`Terrain effect: ${terrainData.tacticalAdvantages[0] || 'Standard engagement'}`);
  }

  combatLog.push(`🏁 Combat ended: ${victory ? '🎉 VICTORY' : '💀 DEFEAT'} after ${Math.floor(duration / 60)}m ${duration % 60}s`);
  
  console.log('Enhanced combat simulation completed', {
    victory,
    squadDamage: totalSquadDamage,
    enemyDamage: totalEnemyDamage,
    duration,
    terrain
  });

  return {
    squadHealthLoss,
    victory,
    duration,
    squadDamageDealt: totalSquadDamage,
    enemyDamageDealt: totalEnemyDamage,
    combatLog,
    combatEvents,
    terrainEffects,
    tacticalAnalysis,
    casualties,
    injuries,
    equipmentDamage,
    experienceGained,
    moraleChanges
  };
};