import { SquadMember, InventoryItem } from '@/types/GameTypes';
import { PlayerCharacter } from '@/types/PlayerTypes';

export interface CoreStats10 {
  intelligence: number; // 0-10
  survival: number;     // 0-10
  combatLevel: number;  // 0-10
  charisma: number;     // 0-10
  combatDamageMultiplier: number; // 1 + 0.25 per level
}

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

export const mapCoreStats10 = (member: SquadMember | PlayerCharacter): CoreStats10 => {
  // Derive from existing structures without mutating state
  let base = {
    combat: 10,
    stealth: 10,
    tech: 10,
    charisma: 10,
    intelligence: 10
  };

  if ('special' in member) {
    // Player: SPECIAL -> approximate translation to our 0-10 model
    const s = member.special;
    base = {
      combat: clamp(Math.round((s.strength * 0.6 + s.perception * 0.4)), 1, 20),
      stealth: clamp(Math.round((s.agility * 0.8 + s.perception * 0.2)), 1, 20),
      tech: clamp(Math.round((s.intelligence * 1.0)), 1, 20),
      charisma: clamp(Math.round((s.charisma * 1.0)), 1, 20),
      intelligence: clamp(Math.round((s.intelligence * 1.0)), 1, 20)
    };
  } else {
    // Squad member
    base = {
      combat: clamp(member.stats.combat ?? 10, 1, 20),
      stealth: clamp(member.stats.stealth ?? 10, 1, 20),
      tech: clamp(member.stats.tech ?? 10, 1, 20),
      charisma: clamp(member.stats.charisma ?? 10, 1, 20),
      intelligence: clamp((member.stats.intelligence ?? member.stats.tech ?? 10), 1, 20)
    };
  }

  const combatLevel = clamp(Math.round(base.combat / 2), 0, 10); // map ~1-20 -> 0-10
  const survival = clamp(Math.round((base.stealth + base.tech) / 4), 0, 10); // avg -> 0-10
  const intelligence = clamp(Math.round(base.intelligence / 2), 0, 10);
  const charisma = clamp(Math.round(base.charisma / 2), 0, 10);

  const combatDamageMultiplier = 1 + 0.25 * combatLevel; // key new rule

  return { intelligence, survival, combatLevel, charisma, combatDamageMultiplier };
};
