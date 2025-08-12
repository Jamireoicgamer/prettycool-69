export interface SquadPerk {
  id: string;
  name: string;
  description: string;
  effects: Partial<{
    damageMult: number;
    accuracyAdd: number;
    defenseAdd: number;
    healthAdd: number;
    moraleAdd: number;
    intelligenceAdd: number;
    fireRateMult: number;
    stealthAdd: number;
  }>;
  requires?: { level?: number; perks?: string[] };
  path?: 'assault' | 'marksman' | 'defender' | 'scout' | 'support';
  rarity?: 'common' | 'rare' | 'legendary';
}

export const SQUAD_PERKS: SquadPerk[] = [
  { id: 'steady-aim', name: 'Steady Aim', description: 'Improve baseline accuracy.', effects: { accuracyAdd: 5 }, path: 'marksman' },
  { id: 'eagle-focus', name: 'Eagle Focus', description: 'Significant accuracy boost.', effects: { accuracyAdd: 10 }, requires: { level: 3 }, path: 'marksman', rarity: 'rare' },
  { id: 'deadly-precision', name: 'Deadly Precision', description: 'Accuracy and slight damage.', effects: { accuracyAdd: 8, damageMult: 1.05 }, requires: { level: 4 }, path: 'marksman' },
  { id: 'hardened', name: 'Hardened', description: 'More defense under fire.', effects: { defenseAdd: 6 }, path: 'defender' },
  { id: 'bulwark-i', name: 'Bulwark I', description: 'Strong defense bonus.', effects: { defenseAdd: 10 }, requires: { level: 3 }, path: 'defender', rarity: 'rare' },
  { id: 'resilience', name: 'Resilience', description: 'Extra health reserves.', effects: { healthAdd: 15 }, path: 'defender' },
  { id: 'combat-drills', name: 'Combat Drills', description: 'Consistent damage output.', effects: { damageMult: 1.08 }, path: 'assault' },
  { id: 'adrenal-surge', name: 'Adrenal Surge', description: 'Higher fire rate.', effects: { fireRateMult: 1.08 }, path: 'assault' },
  { id: 'relentless', name: 'Relentless', description: 'Damage and morale.', effects: { damageMult: 1.1, moraleAdd: 4 }, requires: { level: 4 }, path: 'assault' },
  { id: 'field-medic-i', name: 'Field Medic I', description: 'Sharpen support instincts.', effects: { intelligenceAdd: 4, defenseAdd: 2 }, path: 'support' },
  { id: 'field-medic-ii', name: 'Field Medic II', description: 'Bolster allies and self.', effects: { intelligenceAdd: 4, healthAdd: 10 }, requires: { level: 4, perks: ['field-medic-i'] }, path: 'support' },
  { id: 'trail-ghost', name: 'Trail Ghost', description: 'Move unseen.', effects: { stealthAdd: 8, accuracyAdd: 3 }, path: 'scout' },
  { id: 'stalker', name: 'Stalker', description: 'Even stealthier operations.', effects: { stealthAdd: 12, accuracyAdd: 5 }, requires: { level: 4 }, path: 'scout', rarity: 'rare' },
  { id: 'sharpshooter', name: 'Sharpshooter', description: 'Big accuracy gains.', effects: { accuracyAdd: 12 }, requires: { level: 5 }, path: 'marksman', rarity: 'legendary' },
  { id: 'iron-will', name: 'Iron Will', description: 'Morale and defense.', effects: { moraleAdd: 6, defenseAdd: 4 }, path: 'defender' },
  { id: 'tactical-mind', name: 'Tactical Mind', description: 'Smarter choices in battle.', effects: { intelligenceAdd: 6, accuracyAdd: 2 }, path: 'support' },
  { id: 'frontliner', name: 'Frontliner', description: 'Pressure fighting improves damage.', effects: { damageMult: 1.06, defenseAdd: 2 }, path: 'assault' },
  { id: 'guardian', name: 'Guardian', description: 'Protective stance.', effects: { defenseAdd: 12 }, requires: { level: 5 }, path: 'defender', rarity: 'legendary' },
  { id: 'battle-hardened', name: 'Battle Hardened', description: 'Across-the-board minor boosts.', effects: { accuracyAdd: 3, defenseAdd: 3, moraleAdd: 3 }, path: 'assault' },
  { id: 'survivor', name: 'Survivor', description: 'Health and morale together.', effects: { healthAdd: 10, moraleAdd: 4 }, path: 'support' },
  { id: 'quickdraw', name: 'Quickdraw', description: 'Higher fire cadence.', effects: { fireRateMult: 1.06 }, path: 'assault' },
  { id: 'evasive', name: 'Evasive', description: 'Harder to hit.', effects: { defenseAdd: 5, stealthAdd: 5 }, path: 'scout' },
  { id: 'keen-eye', name: 'Keen Eye', description: 'Accuracy and intelligence.', effects: { accuracyAdd: 5, intelligenceAdd: 3 }, path: 'marksman' },
  { id: 'juggernaut-lite', name: 'Juggernaut (Lite)', description: 'Bigger health pool.', effects: { healthAdd: 20 }, requires: { level: 5 }, path: 'defender' },
  { id: 'assailant-lite', name: 'Assailant (Lite)', description: 'Slightly higher damage.', effects: { damageMult: 1.05 }, path: 'assault' },
  { id: 'ranger', name: 'Ranger', description: 'Stealth, accuracy synergy.', effects: { stealthAdd: 6, accuracyAdd: 4 }, path: 'scout' },
  { id: 'coordinator', name: 'Coordinator', description: 'Morale and accuracy for the team.', effects: { moraleAdd: 5, accuracyAdd: 3 }, path: 'support' },
  { id: 'vigilant', name: 'Vigilant', description: 'Accuracy maintained under stress.', effects: { accuracyAdd: 6, defenseAdd: 2 }, path: 'marksman' },
  { id: 'skirmisher-lite', name: 'Skirmisher (Lite)', description: 'Fire rate and accuracy.', effects: { fireRateMult: 1.05, accuracyAdd: 3 }, path: 'assault' },
  { id: 'stonewall-lite', name: 'Stonewall (Lite)', description: 'Defense and morale.', effects: { defenseAdd: 8, moraleAdd: 3 }, path: 'defender' },
];

export const getSquadPerkById = (id: string) => SQUAD_PERKS.find(p => p.id === id);
