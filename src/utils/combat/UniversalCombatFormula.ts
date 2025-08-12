import { normalizeWeaponFromItem } from './WeaponNormalizer';
import { mapCoreStats10 } from './CoreStatMapper';
import { GAME_ITEMS } from '@/data/GameItems';

export interface UniversalCombatResult {
  estimatedDuration: number; // seconds
  powerRatio: number;
  squadDps: number;
  enemyDps: number;
  totalEnemyHealth: number;
  difficultyModifier: number;
  travelMinutes: number;
}

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

const computeMemberDps = (member: any): number => {
  const core = mapCoreStats10(member);
  const w = normalizeWeaponFromItem(member?.equipment?.weapon);

  if (!w) {
    // Unarmed scales with combat level so they still contribute
    const baseDps = 0.2 + core.combatLevel * 0.25; // 0.2–2.7 DPS baseline
    return baseDps * core.combatDamageMultiplier;
  }

  if (w.category === 'gun') {
    const shotsPerSec = w.rpm / 60;
    const acc = w.accuracy / 100;
    const rel = w.reliability / 100;
    return w.damage * shotsPerSec * acc * rel * core.combatDamageMultiplier;
  } else {
    const swingsPerSec = w.swingSpeed / 60;
    const acc = w.accuracy / 100;
    const rel = w.reliability / 100;
    return w.damage * swingsPerSec * acc * rel * core.combatDamageMultiplier;
  }
};

const computeEnemyDps = (enemy: any): number => {
  // Enemy can have either weapon id or inline weapon
  let acc = (enemy.accuracy ?? 60) / 100;
  let rpm = 30; // default
  let dmg = enemy.damage ?? 10;
  let rel = 0.75;

  if (typeof enemy.weapon === 'string') {
    const w = normalizeWeaponFromItem(enemy.weapon);
    if (w && w.category === 'gun') {
      rpm = w.rpm;
      dmg = w.damage;
      acc = w.accuracy / 100;
      rel = w.reliability / 100;
    } else if (w && w.category === 'melee') {
      rpm = w.swingSpeed; // swings per minute
      dmg = w.damage;
      acc = w.accuracy / 100;
      rel = w.reliability / 100;
    }
  } else if (enemy.weapon && typeof enemy.weapon === 'object') {
    // Inline weapon stats
    rpm = (enemy.weapon.fireRate ?? 1) * 20;
    dmg = enemy.weapon.damage ?? dmg;
  }

  const perSec = (rpm / 60) * acc * rel;
  return Math.max(0.5, dmg * perSec);
};

export const calculateUniversalCombatDuration = (
  squadMembers: any[],
  enemies: any[],
  difficulty: number,
  location: string,
  subTerrain?: string
): UniversalCombatResult => {
  // Squad DPS
  const squadDps = Math.max(0.5, squadMembers.reduce((s, m) => s + computeMemberDps(m), 0));

  // Enemy DPS & Health (scaled by 30x)
  const enemyDps = Math.max(0.5, enemies.reduce((s, e) => s + computeEnemyDps(e), 0));
  const totalEnemyHealth = enemies.reduce((s, e) => s + ((e.health ?? 40) * 30), 0);

  // Base combat time in seconds (health pool / dps)
  const baseCombatSeconds = totalEnemyHealth / squadDps;

  // Difficulty modifier
  const difficultyMultiplier = Math.pow(Math.max(1, difficulty || 1), 1.5);

  // Power ratio adjustments
  const powerRatio = (squadDps) / Math.max(enemyDps, 0.5);
  let adjustedCombat = baseCombatSeconds * difficultyMultiplier;
  if (powerRatio > 2) adjustedCombat *= 0.6;
  else if (powerRatio < 0.5) adjustedCombat *= 2.5;
  else adjustedCombat *= 1.2;

  // Travel time (minutes) with terrain heuristics and squad core stats
  const avgCore = squadMembers.length
    ? squadMembers.map(mapCoreStats10).reduce((a, c) => ({
        intelligence: a.intelligence + c.intelligence,
        survival: a.survival + c.survival
      }), { intelligence: 0, survival: 0 })
    : { intelligence: 5, survival: 5 };
  const denom = Math.max(1, squadMembers.length);
  const avgInt = avgCore.intelligence / denom;
  const avgSurv = avgCore.survival / denom;

  const baseTravel = 30 + (difficulty * 10); // base minutes
  const loc = (location || '').toLowerCase();
  const terrainFactor = loc.includes('junction') ? 1.6
    : loc.includes('complex') ? 1.5
    : loc.includes('valley') ? 1.4
    : 1.3;
  const st = (subTerrain || '').toLowerCase();
  const subFactor = st.includes('alleys') ? 1.2
    : st.includes('tunnel') ? 1.4
    : st.includes('canyon') ? 1.3
    : st.includes('dunes') ? 1.25
    : st.includes('salt') ? 0.9
    : st.includes('marsh') ? 1.25
    : st.includes('ruins') ? 1.15
    : 1.0;
  const reduction = 1 - (avgInt / 10) * 0.2 - (avgSurv / 10) * 0.2; // up to -40%
  const travelMinutes = clamp(Math.round(baseTravel * terrainFactor * subFactor * Math.max(0.6, reduction)), 9, 600);

  const totalSeconds = adjustedCombat + travelMinutes * 60;

  return {
    estimatedDuration: totalSeconds,
    powerRatio,
    squadDps,
    enemyDps,
    totalEnemyHealth,
    difficultyModifier: difficultyMultiplier,
    travelMinutes
  };
};
