import { GAME_ITEMS, GameItem } from '@/data/GameItems';
import { WeaponProfile, WEAPON_CAPS, GunType, MeleeType } from './WeaponModel';

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

const inferGunType = (item: GameItem): GunType => {
  const n = `${item.id} ${item.name}`.toLowerCase();
  if (n.includes('sniper') || n.includes('longwatcher')) return 'sniper';
  if (n.includes('assault') || n.includes('ar')) return 'rifle';
  if (n.includes('rifle') || n.includes('rail')) return 'rifle';
  if (n.includes('shotgun')) return 'shotgun';
  if (n.includes('smg') || n.includes('submachine')) return 'smg';
  if (n.includes('laser') || n.includes('plasma') || n.includes('gauss') || n.includes('tesla')) return 'energy';
  if (n.includes('minigun') || n.includes('lmg') || n.includes('fatman') || n.includes('mirv') || n.includes('cannon')) return 'heavy';
  return 'pistol';
};

const inferMeleeType = (item: GameItem): MeleeType => {
  const n = `${item.id} ${item.name}`.toLowerCase();
  if (n.includes('knife')) return 'knife';
  if (n.includes('machete')) return 'machete';
  if (n.includes('bat')) return 'bat';
  if (n.includes('hammer') || n.includes('sledge')) return 'hammer';
  if (n.includes('gauntlet') || n.includes('claw')) return 'gauntlet';
  if (n.includes('ripper') || n.includes('saw')) return 'chainsaw';
  if (n.includes('claws')) return 'claws';
  return 'generic';
};

const isLikelyMelee = (item: GameItem): boolean => {
  const n = `${item.id} ${item.name}`.toLowerCase();
  const meleeHints = ['knife', 'machete', 'bat', 'hammer', 'sledge', 'gauntlet', 'ripper', 'saw', 'claw'];
  return meleeHints.some(h => n.includes(h));
};

const reliabilityFromRarity = (rarity: GameItem['rarity']): number => {
  switch (rarity) {
    case 'relic': return 95;
    case 'rare': return 85;
    case 'common': return 70;
    default: return 60; // uncommon
  }
};

export const normalizeWeaponFromItem = (itemId: string | null | undefined): WeaponProfile | null => {
  if (!itemId) return null;
  const item = GAME_ITEMS.find(i => i.id === itemId);
  if (!item || item.type !== 'weapon') return null;

  const raw = item.stats || {} as any;
  const baseDamage = clamp(raw.damage ?? 5, 1, WEAPON_CAPS.MAX_DAMAGE);
  const baseAcc = clamp(raw.accuracy ?? 50, 10, WEAPON_CAPS.MAX_ACCURACY_SOFT);
  const relBase = reliabilityFromRarity(item.rarity);

  if (isLikelyMelee(item)) {
    const swingSpeed = clamp(Math.round((raw.fireRate ?? 1) * 30), 20, WEAPON_CAPS.MAX_MELEE_SWINGS);
    const size = (item.weight || 2) >= 8 ? 'large' : (item.weight || 2) >= 3 ? 'medium' : 'small';
    const durability = clamp(raw.durability ?? 100, 10, 200);
    return {
      category: 'melee',
      type: inferMeleeType(item),
      damage: baseDamage,
      swingSpeed,
      accuracy: baseAcc,
      reliability: relBase,
      size,
      durability
    };
  }

  // Gun normalization
  const rpmHeuristic = Math.round((raw.fireRate ?? 1) * 20); // maps existing numbers roughly to RPM
  let rpm = clamp(rpmHeuristic, 10, WEAPON_CAPS.MAX_GUN_RPM);

  // Energy weapons tend to be more reliable, heavy less so
  const gType = inferGunType(item);
  let reliability = relBase;
  if (gType === 'energy') reliability = Math.min(100, reliability + 5);
  if (gType === 'heavy') reliability = Math.max(40, reliability - 10);

  return {
    category: 'gun',
    type: gType,
    damage: baseDamage,
    rpm,
    accuracy: baseAcc,
    reliability
  };
};
