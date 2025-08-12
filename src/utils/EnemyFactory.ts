import { GAME_ITEMS } from '@/data/GameItems';
import { Mission, SquadMember } from '@/types/GameTypes';
import { PlayerCharacter } from '@/types/PlayerTypes';
import { normalizeWeaponFromItem } from '@/utils/combat/WeaponNormalizer';

export interface GeneratedEnemy {
  name: string;
  type: string;
  level: number;
  perks: string[];
  // Flat fields used by EnhancedRealCombatAI today
  health: number;
  damage: number;
  accuracy: number;
  defense: number;
  intelligence: number;
  weapon?: string;
}

const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const pickCommonOrUncommonGun = (): string | undefined => {
  const guns = GAME_ITEMS.filter(
    (i) => i.type === 'weapon' && (i.rarity === 'common' || i.rarity === 'uncommon')
  ).filter((i) => {
    const w = normalizeWeaponFromItem(i.id);
    return w && w.category === 'gun';
  });
  if (guns.length === 0) return undefined;
  return guns[Math.floor(Math.random() * guns.length)].id;
};

const computeEnemyFromStats = (stats: { combat: number; stealth: number; tech: number; charisma: number; intelligence: number }, weaponId?: string) => {
  const w = normalizeWeaponFromItem(weaponId || null);
  // Base health scales modestly by combat + tech
  const baseHealth = 40 + (stats.combat + stats.tech) * 5;
  let damage = 6 + stats.combat * 2;
  let accuracy = 45 + Math.floor(stats.intelligence * 3);
  let defense = Math.floor((stats.tech + stats.combat) * 1.5);

  if (w) {
    if (w.category === 'gun') {
      damage = Math.max(4, Math.floor(w.damage * 1.0 + stats.combat));
      accuracy = Math.min(95, Math.max(35, Math.floor(w.accuracy + stats.intelligence)));
    } else {
      damage = Math.max(3, Math.floor(w.damage * 1.0 + stats.combat));
      accuracy = Math.min(90, Math.max(30, Math.floor(w.accuracy + stats.intelligence * 0.5)));
    }
  }

  return { health: baseHealth, damage, accuracy, defense };
};

export const generateCombatEnemies = (
  mission: Mission,
  squad: (SquadMember | PlayerCharacter)[],
  baseList?: Array<{ name?: string; type?: string }>
): GeneratedEnemy[] => {
  const avgLevel = Math.max(1, Math.round(
    squad.length ? squad.reduce((s, m: any) => s + (m.level || 1), 0) / squad.length : 1
  ));

  const diff = Math.max(1, mission.difficulty || 1);
  const statMin = diff; // difficulty 1 => 1
  const statMax = diff + 1; // difficulty 1 => 2

  const count = baseList?.length || Math.max(2, diff + 1);

  const enemies: GeneratedEnemy[] = Array.from({ length: count }).map((_, idx) => {
    const name = baseList?.[idx]?.name || `Hostile ${idx + 1}`;
    const type = baseList?.[idx]?.type || 'raider';

    const stats = {
      combat: randInt(statMin, statMax),
      stealth: randInt(statMin, statMax),
      tech: randInt(statMin, statMax),
      charisma: randInt(statMin, statMax),
      intelligence: randInt(statMin, statMax),
    };

    const weapon = pickCommonOrUncommonGun();
    const derived = computeEnemyFromStats(stats, weapon);

    // Per request: match squad average level and give 2 perks at level 2 (cap 2 perks generally)
    const perkCount = Math.min(2, avgLevel >= 2 ? 2 : 0);

    return {
      name,
      type,
      level: avgLevel,
      perks: Array.from({ length: perkCount }).map((__, i) => `enemy-perk-${i + 1}`),
      health: derived.health,
      damage: derived.damage,
      accuracy: derived.accuracy,
      defense: derived.defense,
      intelligence: stats.intelligence * 10, // map 1-? to ~10-100 scale used elsewhere
      weapon,
    };
  });

  return enemies;
};
