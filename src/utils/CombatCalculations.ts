import { SquadMember } from '@/context/GameContext';
import { GAME_ITEMS } from '@/data/GameItems';
import { applySquadPerksToStats } from '@/utils/SquadPerkApplication';

export interface CombatStats {
  damage: number;
  accuracy: number;
  fireRate: number;
  attackInterval: number;
  overallStat: number;
  health: number;
  defense: number;
}

export interface Combatant {
  id: string;
  health: number;
  maxHealth: number;
  weapon?: {
    damage: number;
    accuracy: number;
    fireRate: number;
  } | null;
}

export const calculateCombatStats = (member: SquadMember): CombatStats => {
  console.log(`Calculating combat stats for ${member.name}`, { equipment: member.equipment });
  
  let weaponDamage = 0;
  let weaponAccuracy = 50; // base accuracy
  let weaponFireRate = 0;
  let armorDefense = 0;
  let armorHealthBonus = 0;
  let accessoryBonus = { combat: 0, stealth: 0, tech: 0, charisma: 0, health: 0 };

  // Ensure equipment exists, if not initialize it
  const equipment = member.equipment || { weapon: null, armor: null, accessory: null };

  // Get equipped weapon stats with enhanced damage calculation
  const weaponId = equipment.weapon;
  if (weaponId) {
    const weapon = GAME_ITEMS.find(item => item.id === weaponId);
    
    if (weapon && weapon.stats) {
      weaponDamage = weapon.stats.damage || 0;
      weaponAccuracy = Math.min(100, weapon.stats.accuracy || 50);
      weaponFireRate = weapon.stats.fireRate || 1;
      
      console.log(`${member.name} equipped weapon: ${weapon.name}`, {
        damage: weaponDamage,
        accuracy: weaponAccuracy,
        fireRate: weaponFireRate
      });
    }
  } else {
    console.log(`${member.name} has no weapon equipped`);
  }

  // Get equipped armor stats
  const armorId = equipment.armor;
  if (armorId) {
    const armor = GAME_ITEMS.find(item => item.id === armorId);
    
    if (armor && armor.stats) {
      armorDefense = armor.stats.defense || 0;
      armorHealthBonus = armor.stats.health || 0;
      
      if (armor.stats.durability) {
        armorDefense = Math.floor(armorDefense * (armor.stats.durability / 100));
      }
      
      console.log(`${member.name} equipped armor: ${armor.name}`, {
        defense: armorDefense,
        healthBonus: armorHealthBonus
      });
    }
  }

  // Get equipped accessory stats
  const accessoryId = equipment.accessory;
  if (accessoryId) {
    const accessory = GAME_ITEMS.find(item => item.id === accessoryId);
    
    if (accessory && accessory.stats) {
      accessoryBonus.combat = accessory.stats.combat || 0;
      accessoryBonus.stealth = accessory.stats.stealth || 0;
      accessoryBonus.tech = accessory.stats.tech || 0;
      accessoryBonus.charisma = accessory.stats.charisma || 0;
      accessoryBonus.health = accessory.stats.health || 0;
    }
  }

  // Apply active chem bonuses
  let combatBonus = 0;
  let stealthBonus = 0;
  let accuracyBonus = 0;
  let damageBonus = 0;
  let techBonus = 0;
  let charismaBonus = 0;
  let healthBonus = 0;

  if (member.activeChems) {
    member.activeChems.forEach(chem => {
      if (chem.effects) {
        combatBonus += chem.effects.combat || 0;
        stealthBonus += chem.effects.stealth || 0;
        accuracyBonus += chem.effects.accuracy || 0;
        damageBonus += chem.effects.damage || 0;
        techBonus += chem.effects.tech || 0;
        charismaBonus += chem.effects.charisma || 0;
        healthBonus += chem.effects.health || 0;
      }
    });
  }

  // Ensure stats exist, if not use defaults
  const stats = member.stats || {
    combat: 40,
    stealth: 40,
    tech: 40,
    charisma: 40,
    intelligence: 50,
    health: 100,
    maxHealth: 100,
    hunger: 100,
    thirst: 100
  };

  // Calculate effective stats with equipment and chem bonuses
  const effectiveCombat = Math.min(60, Math.max(40, stats.combat + combatBonus + accessoryBonus.combat));
  const effectiveStealth = Math.min(60, Math.max(40, stats.stealth + stealthBonus + accessoryBonus.stealth));
  const effectiveTech = Math.min(60, Math.max(40, stats.tech + techBonus + accessoryBonus.tech));
  const effectiveCharisma = Math.min(60, Math.max(40, stats.charisma + charismaBonus + accessoryBonus.charisma));

  // Enhanced combat effectiveness calculation with proper weapon weighting
  const finalAccuracy = Math.min(100, weaponAccuracy + accuracyBonus);
  
  // Significantly increase weapon damage contribution
  const baseDamage = weaponDamage > 0 ? weaponDamage : 1; // Strong penalty if unarmed
  const totalDamage = baseDamage + damageBonus + (effectiveCombat * 0.8); // Increased combat stat contribution
  
  // Calculate weapon-specific attack interval (longer for tactical combat)
  let attackInterval: number;
  if (weaponFireRate > 0) {
    // Base cooldown from weapon fire rate + weapon-specific modifiers
    const baseInterval = Math.max(5, 30 / weaponFireRate); // Slower base rate
    
    // Weapon-specific cooldown adjustments based on actual weapon stats
    let weaponModifier = 1.0;
    if (weaponDamage >= 50) weaponModifier = 2.5; // Heavy weapons
    else if (weaponDamage >= 30) weaponModifier = 2.0; // High damage weapons
    else if (weaponDamage >= 20) weaponModifier = 1.5; // Medium weapons
    else if (weaponDamage >= 10) weaponModifier = 1.2; // Light weapons
    
    attackInterval = Math.floor(baseInterval * weaponModifier);
  } else {
    attackInterval = 15; // Longer unarmed combat interval
  }

  // Enhanced overall stat calculation with weapon emphasis
  const weaponMultiplier = weaponDamage > 0 ? 1.5 : 0.5; // Severe penalty if unarmed
  const baseOverallStat = ((effectiveCombat * 3) + 
                          (effectiveStealth * 1) + 
                          (effectiveTech * 0.5) + 
                          (effectiveCharisma * 1)) * weaponMultiplier;

  // Add weapon damage directly to overall combat power
  const weaponBonusToOverall = weaponDamage * 2; // Each weapon damage point adds 2 to overall

  // Total health including armor and accessory bonuses
  const totalHealth = stats.maxHealth + armorHealthBonus + accessoryBonus.health + healthBonus;

  let finalStats = {
    damage: Math.floor(totalDamage),
    accuracy: finalAccuracy,
    fireRate: weaponFireRate,
    attackInterval,
    overallStat: baseOverallStat + weaponBonusToOverall,
    health: totalHealth,
    defense: armorDefense,
    // Fill required enhanced fields with sensible defaults
    stealth: stats.stealth || 0,
    movement: 100,
    morale: 60,
    intelligence: stats.intelligence || stats.tech || 50,
    terrainEffects: {},
    traitBonuses: {}
  } as any;

  // Apply squad perks if member has any
  if (member.perks && member.perks.length > 0) {
    finalStats = applySquadPerksToStats(finalStats, member.perks);
    console.log(`Applied ${member.perks.length} perks to ${member.name}:`, member.perks);
  }

  console.log(`Final combat stats for ${member.name}:`, finalStats);
  
  return finalStats;
};

export const calculateDamagePerHit = (attacker: any, defender: any): number => {
  const attackerOverall = calculateOverallStat(attacker);
  const defenderOverall = calculateOverallStat(defender);
  
  // Higher health = more damage dealt
  const healthAdvantage = Math.max(attacker.health || attacker.stats?.health || 100, 1);
  const baseOverallAdvantage = Math.max(0, attackerOverall - defenderOverall);
  
  // Factor in defender's armor/defense if available
  let defenseReduction = 0;
  if (defender.stats && defender.id) {
    // This is a squad member, calculate their defense
    const defenderStats = calculateCombatStats(defender);
    defenseReduction = defenderStats.defense * 0.1; // 10% damage reduction per defense point
  }
  
  // Enhanced damage calculation with weapon stats
  let weaponDamage = 0;
  if (attacker.equipment && attacker.equipment.weapon) {
    const weapon = GAME_ITEMS.find(item => item.id === attacker.equipment.weapon);
    weaponDamage = weapon?.stats?.damage || 0;
  }
  
  // Damage = weapon damage + stat advantage + health advantage, minimum 1 damage
  const baseDamage = weaponDamage + (baseOverallAdvantage / 10) + (healthAdvantage / 20);
  const finalDamage = Math.max(1, baseDamage - defenseReduction);
  
  return Math.floor(finalDamage);
};

export const calculateOverallStat = (character: any): number => {
  // For squad members
  if (character.stats && character.stats.combat !== undefined) {
    let combatBonus = 0;
    let stealthBonus = 0;
    let techBonus = 0;
    let charismaBonus = 0;
    
    // Apply chem bonuses
    if (character.activeChems) {
      character.activeChems.forEach((chem: any) => {
        if (chem.effects) {
          combatBonus += chem.effects.combat || 0;
          stealthBonus += chem.effects.stealth || 0;
          techBonus += chem.effects.tech || 0;
          charismaBonus += chem.effects.charisma || 0;
        }
      });
    }
    
    const baseOverall = ((character.stats.combat + combatBonus) * 3) + 
                       ((character.stats.stealth + stealthBonus) * 1) + 
                       ((character.stats.tech + techBonus) * 0.5) + 
                       ((character.stats.charisma + charismaBonus) * 1);
    
    // Add weapon bonus to overall stat
    let weaponBonus = 0;
    if (character.equipment && character.equipment.weapon) {
      const weapon = GAME_ITEMS.find(item => item.id === character.equipment.weapon);
      weaponBonus = (weapon?.stats?.damage || 0) * 2;
    }
    
    return baseOverall + weaponBonus;
  }
  
  // For enemies (they might have different stat structure)
  if (character.combat !== undefined) {
    return (character.combat * 3) + 
           ((character.stealth || 0) * 1) + 
           ((character.tech || 0) * 0.5) + 
           ((character.charisma || 0) * 1);
  }
  
  return 0;
};

export const getWeaponEffects = (weaponId: string) => {
  const weapon = GAME_ITEMS.find(item => item.id === weaponId);
  if (!weapon || !weapon.stats) return null;

  return {
    damage: weapon.stats.damage || 0,
    accuracy: weapon.stats.accuracy || 0,
    fireRate: weapon.stats.fireRate || 0,
    description: `+${weapon.stats.damage || 0} damage, ${weapon.stats.accuracy || 0}% accuracy, ${weapon.stats.fireRate || 0} fire rate`
  };
};

export const getArmorEffects = (armorId: string) => {
  const armor = GAME_ITEMS.find(item => item.id === armorId);
  if (!armor || !armor.stats) return null;

  return {
    defense: armor.stats.defense || 0,
    health: armor.stats.health || 0,
    durability: armor.stats.durability || 0,
    description: `+${armor.stats.defense || 0} defense, +${armor.stats.health || 0} health, ${armor.stats.durability || 0} durability`
  };
};

// Enhanced combat simulation with weapon-specific mechanics and variable duration
export const simulateCombat = (squad: SquadMember[], enemies: any[]): { 
  squadHealthLoss: { [memberId: string]: number },
  victory: boolean,
  duration: number,
  squadDamageDealt: number,
  enemyDamageDealt: number,
  combatLog: string[],
  phase: 'setup' | 'combat' | 'cleanup'
} => {
  const squadHealthLoss: { [memberId: string]: number } = {};
  const combatLog: string[] = [];
  let combatTime = 0;
  let totalSquadDamage = 0;
  let totalEnemyDamage = 0;
  let currentPhase: 'setup' | 'combat' | 'cleanup' = 'setup';
  
  console.log('Starting combat simulation with enhanced weapon calculations');
  
  // Initialize health tracking with proper combat stats
  const squadHealth = squad.map(member => {
    const stats = calculateCombatStats(member);
    console.log(`${member.name} entering combat with stats:`, stats);
    return { 
      id: member.id, 
      name: member.name,
      health: stats.health,
      maxHealth: stats.health,
      stats,
      member // Keep reference to original member for equipment access
    };
  });
  
  // Balanced enemy scaling for fair combat duration
  const enemyHealth = enemies.map((enemy, index) => {
    // Normalize enemy weapon whether it's an id string or inline object
    let normalizedWeapon: { damage?: number; fireRate?: number; accuracy?: number; name?: string } | null = null;
    if (typeof enemy.weapon === 'string') {
      const w = GAME_ITEMS.find(item => item.id === enemy.weapon);
      if (w && w.stats) {
        normalizedWeapon = {
          damage: w.stats.damage || 10,
          fireRate: w.stats.fireRate || 1,
          accuracy: w.stats.accuracy || 50,
          name: w.name
        };
      }
    } else if (enemy.weapon && typeof enemy.weapon === 'object') {
      normalizedWeapon = {
        damage: enemy.weapon.damage || 10,
        fireRate: enemy.weapon.fireRate || 1,
        accuracy: enemy.weapon.accuracy || enemy.accuracy || 50,
        name: enemy.weapon.name
      };
    }

    // Calculate a modest difficulty multiplier
    const baseDifficulty = Math.max(1, enemies.length);
    const enemyTier = (enemy.health || 50) > 100 ? 3 : (enemy.health || 50) > 60 ? 2 : 1;

    // Health scaling: gently increase with enemy count and tier
    let healthMultiplier = 1 + (baseDifficulty - 1) * 0.2; // up to ~2x for large groups
    const tierMultiplier = 1 + (enemyTier - 1) * 0.25; // +25% per tier above 1
    healthMultiplier *= tierMultiplier;

    const scaledHealth = Math.max(enemy.health || 50, Math.floor((enemy.health || 50) * healthMultiplier));
    const baseDamage = enemy.damage || 10;
    const weaponDamageBonus = normalizedWeapon?.damage ? Math.floor(normalizedWeapon.damage * 0.5) : 0;
    const scaledDamage = Math.floor((baseDamage + weaponDamageBonus) * (1 + baseDifficulty * 0.1));

    // Weapon-specific attack intervals for enemies (use normalized weapon when available)
    const fireRate = normalizedWeapon?.fireRate || enemy.fireRate || 1;
    let enemyAttackInterval = Math.max(10, Math.floor(40 / fireRate));

    return {
      id: `enemy-${index}`,
      name: enemy.name,
      health: scaledHealth,
      maxHealth: scaledHealth,
      combat: enemy.combat || 5,
      damage: scaledDamage,
      weapon: normalizedWeapon,
      attackInterval: enemyAttackInterval,
      accuracy: Math.min(95, Math.max(35, (normalizedWeapon?.accuracy || enemy.accuracy || 50) + Math.floor(baseDifficulty * 3))),
      armor: Math.floor(baseDifficulty), // light armor scaling
      reloadTime: 0,
      lastReload: 0,
      ammoCount: Math.max(0, Math.floor(fireRate * 10))
    };
  });

  combatLog.push(`Mission initiated: ${squad.length} squad members vs ${enemies.length} enemies`);

  // Extended combat simulation with proper weapon-based timing
  const totalEnemyHealth = enemyHealth.reduce((sum, enemy) => sum + enemy.maxHealth, 0);
  const maxCombatTime = Math.max(300, Math.floor(totalEnemyHealth / 50) + enemies.length * 120); // Minimum 5 minutes, scales with total enemy health
  
  while (true) {
    combatTime += 1;
    
    // Phase transitions
    if (combatTime <= 30) {
      currentPhase = 'setup';
    } else if (combatTime <= maxCombatTime - 30) {
      currentPhase = 'combat';
    } else {
      currentPhase = 'cleanup';
    }
    
    const aliveSquad = squadHealth.filter(s => s.health > 0);
    const aliveEnemies = enemyHealth.filter(e => e.health > 0);

    if (aliveSquad.length === 0 || aliveEnemies.length === 0) {
      break;
    }

    if (combatTime > maxCombatTime) {
      combatLog.push(`Combat concluded after ${Math.floor(maxCombatTime / 60)}m ${maxCombatTime % 60}s - tactical withdrawal`);
      break;
    }

    // Phase-specific squad actions
    if (currentPhase === 'setup' && combatTime % 10 === 0) {
      const member = aliveSquad[Math.floor(Math.random() * aliveSquad.length)];
      combatLog.push(`${member.name} checking equipment and taking position`);
    } else if (currentPhase === 'combat') {
      // Advanced weapon-specific combat with reloading and complexity
      aliveSquad.forEach(squadMember => {
        if (combatTime % squadMember.stats.attackInterval === 0) {
          const target = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)];
          if (target) {
            // Get weapon details for combat mechanics
            const weaponId = squadMember.member?.equipment?.weapon;
            const weapon = weaponId ? GAME_ITEMS.find(item => item.id === weaponId) : null;
            const weaponName = weapon?.name || 'fists';
            
            // Weapon jam chance (higher fire rate = higher jam chance)
            const jamChance = weapon?.stats?.fireRate ? (weapon.stats.fireRate * 2) : 0;
            if (Math.random() * 100 < jamChance) {
              combatLog.push(`${squadMember.name}'s ${weaponName} jams, clearing the malfunction`);
              return;
            }
            
            // Accuracy calculation with environmental factors
            let finalAccuracy = squadMember.stats.accuracy;
            if (currentPhase === 'cleanup') finalAccuracy -= 15; // Harder to hit during chaos
            if (weapon?.stats?.accuracy) finalAccuracy = Math.min(95, finalAccuracy + (weapon.stats.accuracy - 50) * 0.5);
            
            const hitChance = Math.random() * 100;
            
            if (hitChance <= finalAccuracy) {
              // Enhanced damage with armor penetration
              const baseDamage = squadMember.stats.damage;
              const weaponVariance = weapon ? Math.floor(Math.random() * Math.max(1, (weapon.stats?.damage || 5) * 0.3)) : Math.floor(Math.random() * 3);
              const armorPenetration = weapon?.stats?.damage ? Math.floor(weapon.stats.damage * 0.2) : 0;
              
              let totalDamage = baseDamage + weaponVariance;
              
              // Apply target armor reduction
              if (target.armor) {
                const effectiveArmor = Math.max(0, target.armor - armorPenetration);
                totalDamage = Math.max(1, totalDamage - effectiveArmor);
              }
              
              target.health = Math.max(0, target.health - totalDamage);
              totalSquadDamage += totalDamage;
              
              // Weapon-specific combat descriptions with more variety
              let actionDescription = '';
              if (weapon) {
                if (weapon.type === 'weapon' && weapon.stats?.fireRate && weapon.stats.fireRate >= 4) {
                  const burstActions = ['unleashes rapid fire', 'sprays bullets', 'fires full auto burst'];
                  actionDescription = `${burstActions[Math.floor(Math.random() * burstActions.length)]} with ${weaponName}`;
                } else if (weapon.stats?.damage && weapon.stats.damage >= 35) {
                  const heavyActions = ['delivers crushing blow', 'strikes with devastating force', 'unleashes powerful attack'];
                  actionDescription = `${heavyActions[Math.floor(Math.random() * heavyActions.length)]} using ${weaponName}`;
                } else if (weaponName.includes('Laser') || weaponName.includes('Plasma')) {
                  const energyActions = ['fires searing beam', 'discharges energy burst', 'lances target'];
                  actionDescription = `${energyActions[Math.floor(Math.random() * energyActions.length)]} from ${weaponName}`;
                } else if (weapon.stats?.accuracy && weapon.stats.accuracy >= 80) {
                  const precisionActions = ['takes precise shot', 'fires with deadly accuracy', 'delivers pinpoint strike'];
                  actionDescription = `${precisionActions[Math.floor(Math.random() * precisionActions.length)]} with ${weaponName}`;
                } else {
                  const genericActions = ['attacks', 'strikes', 'engages', 'fires'];
                  actionDescription = `${genericActions[Math.floor(Math.random() * genericActions.length)]} with ${weaponName}`;
                }
              } else {
                const unarmedActions = ['delivers powerful punch', 'strikes with fists', 'grapples and strikes'];
                actionDescription = unarmedActions[Math.floor(Math.random() * unarmedActions.length)];
              }
              
              if (target.health <= 0) {
                combatLog.push(`${squadMember.name} ${actionDescription}, eliminating ${target.name} (${totalDamage} damage)`);
              } else {
                const healthPercent = Math.floor((target.health / target.maxHealth) * 100);
                combatLog.push(`${squadMember.name} ${actionDescription} against ${target.name} (${totalDamage} damage, ${healthPercent}% health)`);
              }
            } else {
              const missReasons = ['target takes cover', 'shot deflected by armor', 'target dodges', 'shot goes wide', 'weapon recoil throws off aim'];
              const missReason = missReasons[Math.floor(Math.random() * missReasons.length)];
              combatLog.push(`${squadMember.name} attacks ${target.name} with ${weaponName} but ${missReason}`);
            }
          }
        }
      });
    } else if (currentPhase === 'cleanup' && combatTime % 15 === 0) {
      const member = aliveSquad[Math.floor(Math.random() * aliveSquad.length)];
      combatLog.push(`${member.name} securing area and treating wounded`);
    }

    // Advanced enemy attacks with tactical complexity
    if (currentPhase === 'combat') {
      aliveEnemies.forEach(enemy => {
        if (combatTime % enemy.attackInterval === 0) {
          const target = aliveSquad[Math.floor(Math.random() * aliveSquad.length)];
          if (target) {
            // Enemy reload mechanics
            if (enemy.weapon && enemy.ammoCount <= 0) {
              if (enemy.reloadTime <= 0) {
                enemy.reloadTime = Math.floor(Math.random() * 8) + 5; // 5-12 seconds reload
                combatLog.push(`${enemy.name} reloading ${enemy.weapon.name || 'weapon'}`);
              } else {
                enemy.reloadTime--;
                if (enemy.reloadTime === 0) {
                  enemy.ammoCount = enemy.weapon.fireRate * 8;
                  combatLog.push(`${enemy.name} finished reloading`);
                }
              }
              return;
            }
            
            // Advanced accuracy calculation
            let finalAccuracy = enemy.accuracy;
            if (target.stats.defense > 10) finalAccuracy -= 10; // Harder to hit armored targets
            if (currentPhase === 'cleanup') finalAccuracy += 10; // Easier during chaos
            
            const hitChance = Math.random() * 100;
            if (hitChance <= finalAccuracy) {
              // Enhanced damage calculation with weapon scaling
              let baseDamage = enemy.damage + Math.floor(Math.random() * 8);
              if (enemy.weapon) {
                baseDamage += Math.floor((enemy.weapon.damage || 0) * 0.5);
                enemy.ammoCount = Math.max(0, enemy.ammoCount - 1);
              }
              
              // Advanced armor calculation
              const armorReduction = target.stats.defense * 0.2; // 20% damage reduction per defense
              const finalDamage = Math.max(2, baseDamage - armorReduction);
              
              // Knock-out threshold at 8% of max health (more realistic)
              const minHealth = Math.ceil(target.maxHealth * 0.08);
              const newHealth = Math.max(minHealth, target.health - finalDamage);

              // Diverse enemy attack descriptions
              const attackTypes = [
                'launches coordinated assault on',
                'flanks and attacks',
                'opens suppressing fire on',
                'charges aggressively at',
                'takes calculated shot at',
                'unleashes barrage against',
                'moves to flank',
                'concentrates fire on'
              ];
              const attackType = attackTypes[Math.floor(Math.random() * attackTypes.length)];

              if (target.health > minHealth && newHealth === minHealth) {
                combatLog.push(`${enemy.name} ${attackType} ${target.name}, overwhelming them (${finalDamage} damage - knocked out)`);
              } else if (newHealth > minHealth) {
                const armorBlocked = Math.floor(baseDamage - finalDamage);
                if (armorBlocked > 0) {
                  combatLog.push(`${enemy.name} ${attackType} ${target.name} (${finalDamage} damage, ${armorBlocked} blocked by armor)`);
                } else {
                  combatLog.push(`${enemy.name} ${attackType} ${target.name} (${finalDamage} damage)`);
                }
              }

              target.health = newHealth;
              totalEnemyDamage += finalDamage;
            } else {
              const missReasons = [
                'target dives for cover',
                'shot deflected by armor plating', 
                'target rolls away from attack',
                'shot goes wide due to suppression',
                'weapon malfunction',
                'target uses environment as shield'
              ];
              const missReason = missReasons[Math.floor(Math.random() * missReasons.length)];
              combatLog.push(`${enemy.name} attacks ${target.name} but ${missReason}`);
            }
          }
        }
      });
    }
  }

  // Calculate health loss for each squad member
  squadHealth.forEach(member => {
    const original = squad.find(s => s.id === member.id);
    if (original) {
      // Health loss = original maxHealth (from stats), minus the final simulated value
      squadHealthLoss[member.id] = Math.max(
        0,
        (calculateCombatStats(original).health) - member.health
      );
    }
  });

  const victory = enemyHealth.every(e => e.health <= 0);
  const missionMinutes = Math.floor(combatTime / 60);
  const missionSeconds = combatTime % 60;
  
  combatLog.push(`Mission ${victory ? 'completed successfully' : 'ended'}: ${missionMinutes}m ${missionSeconds}s duration`);
  combatLog.push(`Damage dealt: ${totalSquadDamage} | Damage taken: ${totalEnemyDamage}`);
  
  console.log('Enhanced combat simulation completed', {
    phase: currentPhase,
    victory,
    squadDamage: totalSquadDamage,
    enemyDamage: totalEnemyDamage,
    duration: combatTime,
    healthLoss: squadHealthLoss
  });
  
  return {
    squadHealthLoss,
    victory,
    duration: combatTime,
    squadDamageDealt: totalSquadDamage,
    enemyDamageDealt: totalEnemyDamage,
    combatLog,
    phase: currentPhase
  };
};
