export interface Perk {
  id: string;
  name: string;
  description: string;
  // Effects are additive/multiplicative hints applied to combat/needs
  effects: Partial<{
    damageMult: number; // multiply outgoing damage
    accuracyAdd: number; // add to accuracy
    defenseAdd: number; // add to defense
    healthAdd: number; // add to base/max health
    moraleAdd: number; // add to morale
    intelligenceAdd: number; // add to intelligence
    fireRateMult: number; // multiply fire rate
    coverBonus: number; // additional cover effectiveness
    critChanceAdd: number; // not fully modeled, map to accuracy
    hungerDrainMult: number; // multiply hunger drain (e.g., 0.8 = drains slower)
    thirstDrainMult: number; // multiply thirst drain
  }>;
  rarity?: 'common' | 'rare' | 'legendary';
}

export const PERKS: Perk[] = [
  { id: 'toughness', name: 'Toughness', description: 'Flat defense increase.', effects: { defenseAdd: 8 } },
  { id: 'ironclad', name: 'Ironclad', description: 'Large defense increase.', effects: { defenseAdd: 15 }, rarity: 'rare' },
  { id: 'resilient', name: 'Resilient', description: 'Bonus health.', effects: { healthAdd: 20 } },
  { id: 'berserker', name: 'Berserker', description: 'Higher damage output.', effects: { damageMult: 1.15 } },
  { id: 'deadeye', name: 'Deadeye', description: 'Greatly improved accuracy.', effects: { accuracyAdd: 12 } },
  { id: 'marksman', name: 'Marksman', description: 'Improved accuracy.', effects: { accuracyAdd: 7 } },
  { id: 'swift', name: 'Swift', description: 'Faster attack cadence.', effects: { fireRateMult: 1.1 } },
  { id: 'adrenaline', name: 'Adrenaline', description: 'Damage and morale boost.', effects: { damageMult: 1.08, moraleAdd: 5 } },
  { id: 'cover-specialist', name: 'Cover Specialist', description: 'Better use of cover.', effects: { defenseAdd: 5, coverBonus: 10 } },
  { id: 'battle-hardened', name: 'Battle Hardened', description: 'Defense and health.', effects: { defenseAdd: 5, healthAdd: 10 } },
  { id: 'tactician', name: 'Tactician', description: 'Smarter decisions.', effects: { intelligenceAdd: 8, accuracyAdd: 3 } },
  { id: 'commander', name: 'Commander', description: 'Morale and accuracy boost.', effects: { moraleAdd: 8, accuracyAdd: 4 } },
  { id: 'survivalist', name: 'Survivalist', description: 'Needs drain slower.', effects: { hungerDrainMult: 0.8, thirstDrainMult: 0.8 } },
  { id: 'desert-adapt', name: 'Desert Adaptation', description: 'Thirst drain slower.', effects: { thirstDrainMult: 0.75 } },
  { id: 'frugal', name: 'Frugal', description: 'Hunger drain slower.', effects: { hungerDrainMult: 0.75 } },
  { id: 'precision', name: 'Precision', description: 'Accuracy and crit chance.', effects: { accuracyAdd: 6, critChanceAdd: 5 } },
  { id: 'bulwark', name: 'Bulwark', description: 'Big defense and morale.', effects: { defenseAdd: 10, moraleAdd: 5 }, rarity: 'rare' },
  { id: 'juggernaut', name: 'Juggernaut', description: 'Huge health boost.', effects: { healthAdd: 35 }, rarity: 'rare' },
  { id: 'veteran', name: 'Veteran', description: 'All-round small boosts.', effects: { accuracyAdd: 3, defenseAdd: 3, moraleAdd: 3 } },
  { id: 'skirmisher', name: 'Skirmisher', description: 'Fire rate and accuracy.', effects: { fireRateMult: 1.08, accuracyAdd: 4 } },
  { id: 'assailant', name: 'Assailant', description: 'Higher burst damage.', effects: { damageMult: 1.12 } },
  { id: 'shieldwall', name: 'Shield Wall', description: 'Massive defense.', effects: { defenseAdd: 18 }, rarity: 'legendary' },
  { id: 'eagle-eye', name: 'Eagle Eye', description: 'Extreme accuracy.', effects: { accuracyAdd: 18 }, rarity: 'legendary' },
  { id: 'warlord', name: 'Warlord', description: 'Damage and morale powerhouse.', effects: { damageMult: 1.2, moraleAdd: 10 }, rarity: 'legendary' },
  { id: 'stoic', name: 'Stoic', description: 'Ignore pain, more defense.', effects: { defenseAdd: 6 } },
  { id: 'hardened-scav', name: 'Hardened Scav', description: 'Tough in scrapes.', effects: { defenseAdd: 4, damageMult: 1.05 } },
  { id: 'sharp-mind', name: 'Sharp Mind', description: 'Smarter choices.', effects: { intelligenceAdd: 6 } },
  { id: 'steady-hand', name: 'Steady Hand', description: 'Reliable aim.', effects: { accuracyAdd: 5 } },
  { id: 'bulldozer', name: 'Bulldozer', description: 'Reliably higher damage.', effects: { damageMult: 1.1 } },
  { id: 'unyielding', name: 'Unyielding', description: 'Health and morale.', effects: { healthAdd: 15, moraleAdd: 5 } },
  { id: 'field-medic', name: 'Field Medic', description: 'Improved survivability.', effects: { healthAdd: 10, defenseAdd: 4 } },
  { id: 'desperado', name: 'Desperado', description: 'More damage under pressure.', effects: { damageMult: 1.07 } },
  { id: 'linebreaker', name: 'Linebreaker', description: 'Defense and damage.', effects: { defenseAdd: 7, damageMult: 1.06 } },
  { id: 'pathfinder', name: 'Pathfinder', description: 'Less needs drain, more intel.', effects: { hungerDrainMult: 0.9, thirstDrainMult: 0.9, intelligenceAdd: 3 } },
];

export const getPerkById = (id: string) => PERKS.find(p => p.id === id);
