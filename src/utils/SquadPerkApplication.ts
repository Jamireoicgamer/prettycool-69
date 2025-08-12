import { EnhancedCombatStats } from '@/utils/EnhancedCombatSystem';
import { getSquadPerkById } from '@/data/SquadPerks';

export const applySquadPerksToStats = (stats: EnhancedCombatStats, perkIds: string[] | undefined): EnhancedCombatStats => {
  if (!perkIds || perkIds.length === 0) return stats;
  const out = { ...stats };
  let damageMult = 1;
  let fireRateMult = 1;

  perkIds.forEach(id => {
    const perk = getSquadPerkById(id);
    if (!perk) return;
    const e = perk.effects;
    if (e.damageMult) damageMult *= e.damageMult;
    if (typeof e.accuracyAdd === 'number') out.accuracy = Math.min(100, out.accuracy + e.accuracyAdd);
    if (typeof e.defenseAdd === 'number') out.defense += e.defenseAdd;
    if (typeof e.healthAdd === 'number') out.health += e.healthAdd;
    if (typeof e.moraleAdd === 'number') out.morale += e.moraleAdd;
    if (typeof e.intelligenceAdd === 'number') out.intelligence += e.intelligenceAdd;
    if (typeof e.stealthAdd === 'number') out.stealth += e.stealthAdd;
    if (e.fireRateMult) fireRateMult *= e.fireRateMult;
  });

  out.damage = Math.max(1, Math.floor(out.damage * damageMult));
  out.fireRate = out.fireRate * fireRateMult;
  return out;
};
