import { EnhancedCombatStats } from '@/utils/EnhancedCombatSystem';
import { getPerkById, PERKS } from '@/data/Perks';

export const applyPerksToStats = (stats: EnhancedCombatStats, perkIds: string[] | undefined): EnhancedCombatStats => {
  if (!perkIds || perkIds.length === 0) return stats;
  const out = { ...stats };
  let damageMult = 1;
  let fireRateMult = 1;
  let hungerMultAcc = 1;
  let thirstMultAcc = 1;

  perkIds.forEach(id => {
    const perk = getPerkById(id);
    if (!perk) return;
    const e = perk.effects;
    if (e.damageMult) damageMult *= e.damageMult;
    if (typeof e.accuracyAdd === 'number') out.accuracy += e.accuracyAdd;
    if (typeof e.defenseAdd === 'number') out.defense += e.defenseAdd;
    if (typeof e.healthAdd === 'number') {
      out.health += e.healthAdd;
    }
    if (typeof e.moraleAdd === 'number') out.morale += e.moraleAdd;
    if (typeof e.intelligenceAdd === 'number') out.intelligence += e.intelligenceAdd;
    if (e.fireRateMult) fireRateMult *= e.fireRateMult;
    if (typeof e.critChanceAdd === 'number') out.accuracy += Math.floor(e.critChanceAdd / 2); // map crit into aim
    if (typeof e.coverBonus === 'number') out.defense += Math.floor(e.coverBonus / 5);
    if (typeof e.hungerDrainMult === 'number') hungerMultAcc *= e.hungerDrainMult;
    if (typeof e.thirstDrainMult === 'number') thirstMultAcc *= e.thirstDrainMult;
  });

  out.damage = Math.max(1, Math.floor(out.damage * damageMult));
  out.fireRate = out.fireRate * fireRateMult;

  return out;
};

// Basic enemy perk selection to align near squad average level
export const chooseEnemyPerks = (avgLevel: number): string[] => {
  const picks: string[] = [];
  if (avgLevel >= 2) picks.push('toughness');
  if (avgLevel >= 3) picks.push('marksman');
  if (avgLevel >= 4) picks.push('resilient');
  if (avgLevel >= 5) picks.push('adrenaline');
  if (avgLevel >= 6) picks.push('bulwark');
  // cap to 4 perks for enemies for balance
  return picks.slice(0, 4);
};

// New: pick a fixed count of perks for balance (enemy gets one fewer than strongest squadmate)
export const chooseEnemyPerksForBalance = (level: number, count: number): string[] => {
  const base = chooseEnemyPerks(level);
  if (count <= 0) return [];
  if (base.length >= count) return base.slice(0, count);
  // If we need more, fill from common PERKS pool deterministically
  const pool = PERKS.map(p => p.id).filter(id => !base.includes(id));
  const out = [...base];
  for (let i = 0; i < count - base.length && i < pool.length; i++) {
    out.push(pool[i]);
  }
  return out.slice(0, count);
};
