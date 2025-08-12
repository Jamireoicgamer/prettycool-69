/**
 * FALLOUT WASTELAND COMBAT FORMULA DOCUMENTATION
 * ================================================
 * 
 * This document outlines the complete combat calculation system used in the game.
 * Duration: 3 minutes to 3 hours based on squad stats, equipment, and difficulty.
 */

export interface CombatFormulaResult {
  estimatedDuration: number; // in seconds
  powerRatio: number;
  squadPower: number;
  enemyPower: number;
  difficultyModifier: number;
  travelModifier: number;
}

/**
 * CORE COMBAT FORMULA
 * ===================
 * 
 * 1. SQUAD POWER CALCULATION:
 *    - For each squad member:
 *      a) Weapon Score = Damage × Fire Rate × (Accuracy / 100)
 *      b) Survivability = Health + Defense
 *      c) Member Power = Weapon Score + (Survivability × 0.1)
 *    - Total Squad Power = Sum of all member powers
 * 
 * 2. ENEMY POWER CALCULATION:
 *    - For each enemy:
 *      a) Enemy Firepower = Damage × Fire Rate × (Accuracy / 100)
 *      b) Enemy Survivability = Health
 *      c) Enemy Power = Firepower + (Survivability × 0.15)
 *    - Total Enemy Power = Sum of all enemy powers
 * 
 * 3. POWER RATIO:
 *    - Power Ratio = Squad Power / Enemy Power
 *    - This determines combat balance and duration modifiers
 * 
 * 4. BASE COMBAT TIME:
 *    - Average Enemy Health = Sum(Enemy Health) / Enemy Count
 *    - Average Squad DPS = Squad Power / Squad Size
 *    - Base Time = (Avg Enemy Health × Enemy Count) / Avg Squad DPS
 * 
 * 5. DIFFICULTY MODIFIER:
 *    - Difficulty Multiplier = Difficulty Level ^ 1.5
 *    - Applied to base combat time
 * 
 * 6. POWER BALANCE MODIFIERS:
 *    - If Power Ratio > 2.0: Duration × 0.6 (Overpowered)
 *    - If Power Ratio < 0.5: Duration × 2.5 (Underpowered)
 *    - Else: Duration × 1.2 (Balanced fight)
 * 
 * 7. TRAVEL TIME:
 *    - Junction locations: +30% total time
 *    - Complex locations: +25% total time
 *    - Valley locations: +20% total time
 *    - Other locations: +15% total time
 * 
 * 8. FINAL CLAMPING:
 *    - Minimum: 3 minutes (180 seconds)
 *    - Maximum: 3 hours (10,800 seconds)
 * 
 * EXAMPLE CALCULATION:
 * ===================
 * 
 * Squad: 3 members with pipe pistols (Damage: 8, Accuracy: 45, Fire Rate: 1.5)
 * - Member 1: Weapon Score = 8 × 1.5 × 0.45 = 5.4, Health = 100, Power = 5.4 + 10 = 15.4
 * - Total Squad Power = 15.4 × 3 = 46.2
 * 
 * Enemies: 2 raiders (Damage: 10, Health: 30, Accuracy: 50, Fire Rate: 2)
 * - Enemy Power = (10 × 2 × 0.5) + (30 × 0.15) = 10 + 4.5 = 14.5
 * - Total Enemy Power = 14.5 × 2 = 29
 * 
 * Power Ratio = 46.2 / 29 = 1.59 (Balanced)
 * Base Combat Time = (30 × 2) / (46.2 / 3) = 60 / 15.4 = 3.9 seconds
 * Difficulty 2: 3.9 × (2^1.5) = 3.9 × 2.83 = 11 seconds
 * Balance Modifier: 11 × 1.2 = 13.2 seconds
 * Travel (Valley): 13.2 × 1.2 = 15.8 seconds
 * Final (clamped): 180 seconds (3 minutes minimum)
 * 
 * EQUIPMENT IMPACT:
 * ================
 * 
 * No Equipment:
 * - Base damage: 5, accuracy: 30, fire rate: 1
 * - Very low combat effectiveness
 * - Fights last maximum duration (3 hours)
 * 
 * Basic Equipment (Pipe Weapons):
 * - Damage: 8-12, accuracy: 45-70, fire rate: 1-2
 * - Moderate effectiveness
 * - Fights last 1-2 hours typically
 * 
 * Advanced Equipment (Military Grade):
 * - Damage: 25+, accuracy: 80+, fire rate: 3+
 * - High effectiveness
 * - Fights last 10-30 minutes
 * 
 * Legendary Equipment:
 * - Damage: 40+, accuracy: 90+, fire rate: 4+
 * - Overwhelming power
 * - Fights last 3-10 minutes
 * 
 * ARMOR IMPACT:
 * =============
 * 
 * - Defense directly reduces incoming damage
 * - Health bonuses increase survivability
 * - Better armor = longer squad survival = easier victories
 * 
 * DIFFICULTY SCALING:
 * ==================
 * 
 * Difficulty 1: 1.0× modifier (3-30 minutes typical)
 * Difficulty 2: 2.8× modifier (8-84 minutes typical)
 * Difficulty 3: 5.2× modifier (15-156 minutes typical)
 * Difficulty 4: 8.0× modifier (24-240 minutes typical)
 * Difficulty 5: 11.2× modifier (33-336 minutes typical, capped at 180 minutes)
 * 
 * TACTICAL CONSIDERATIONS:
 * =======================
 * 
 * - Fire Rate is crucial for sustained damage
 * - Accuracy determines hit percentage
 * - Squad size provides redundancy and firepower
 * - Enemy count dramatically increases difficulty
 * - Location affects total mission time through travel
 * 
 * This formula ensures that:
 * 1. Well-equipped squads finish faster
 * 2. Higher difficulties take proportionally longer
 * 3. Poor equipment leads to very long, difficult fights
 * 4. No combat is shorter than 3 minutes (realism)
 * 5. No combat exceeds 3 hours (playability)
 */

export const calculateCombatDuration = (
  squadMembers: any[],
  enemies: any[],
  difficulty: number,
  location: string
): CombatFormulaResult => {
  // Calculate squad power
  let totalSquadPower = 0;
  squadMembers.forEach(member => {
    const weapon = member.equipment?.weapon;
    const weaponStats = weapon ? {
      damage: weapon.damage || 5,
      accuracy: weapon.accuracy || 30,
      fireRate: weapon.fireRate || 1
    } : { damage: 5, accuracy: 30, fireRate: 1 };
    
    const weaponScore = weaponStats.damage * weaponStats.fireRate * (weaponStats.accuracy / 100);
    const survivability = (member.stats?.health || 100) + (member.stats?.defense || 0);
    totalSquadPower += weaponScore + (survivability * 0.1);
  });
  
  // Calculate enemy power
  const enemyPower = enemies.reduce((sum, enemy) => {
    const firepower = (enemy.damage || 10) * (enemy.fireRate || 1) * ((enemy.accuracy || 50) / 100);
    const survivability = enemy.health || 40;
    return sum + firepower + (survivability * 0.15);
  }, 0);
  
  // Calculate power ratio (apply global power scaling per request)
  const totalSquadPowerScaled = totalSquadPower * 0.5; // halve squad power to prolong fights
  const enemyPowerScaled = enemyPower * 0.5; // halve enemy power to keep balance
  const powerRatio = totalSquadPowerScaled / Math.max(enemyPowerScaled, 1);
  
  // Base combat time calculation with slower combat pace (divide combat DPS by 4)
  const avgEnemyHealth = enemies.reduce((sum, e) => sum + (e.health || 40), 0) / enemies.length;
  const avgSquadDPS = totalSquadPowerScaled / Math.max(squadMembers.length, 1);
  const pacedSquadDPS = avgSquadDPS / 4; // divide combat itself by 4 (slower damage throughput)
  const baseCombatTime = (avgEnemyHealth * enemies.length) / Math.max(pacedSquadDPS, 1);
  
  // Apply difficulty modifier
  const difficultyMultiplier = Math.pow(difficulty, 1.5);
  let estimatedCombatSeconds = baseCombatTime * difficultyMultiplier;
  
  // Apply power balance modifier
  if (powerRatio > 2) {
    estimatedCombatSeconds *= 0.6; // Overpowered
  } else if (powerRatio < 0.5) {
    estimatedCombatSeconds *= 2.5; // Underpowered
  } else {
    estimatedCombatSeconds *= 1.2; // Balanced
  }
  
  // Travel time modifier
  const travelMultiplier = location.includes('Junction') ? 1.3 :
                          location.includes('Complex') ? 1.25 : 
                          location.includes('Valley') ? 1.2 : 1.15;
  
  const totalMissionSeconds = estimatedCombatSeconds * travelMultiplier;
  
  // No min/max cap; use computed duration directly as per simulation rules
  const finalDuration = totalMissionSeconds;
  
  return {
    estimatedDuration: finalDuration,
    powerRatio,
    squadPower: totalSquadPowerScaled,
    enemyPower: enemyPowerScaled,
    difficultyModifier: difficultyMultiplier,
    travelModifier: travelMultiplier
  };
}