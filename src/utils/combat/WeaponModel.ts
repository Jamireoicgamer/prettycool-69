// Weapon modeling and normalization types for the universal combat system
// Focused, reusable types (kept minimal to avoid UI/business logic changes)

export type WeaponCategory = 'gun' | 'melee';

export type GunType =
  | 'pistol'
  | 'rifle'
  | 'shotgun'
  | 'smg'
  | 'sniper'
  | 'energy'
  | 'heavy';

export type MeleeType =
  | 'knife'
  | 'machete'
  | 'bat'
  | 'hammer'
  | 'gauntlet'
  | 'chainsaw'
  | 'claws'
  | 'generic';

export interface GunProfile {
  category: 'gun';
  type: GunType;
  damage: number;          // per shot (capped)
  rpm: number;             // rounds per minute (capped)
  accuracy: number;        // 0-100 (soft-capped to 95 to allow ~5% miss)
  reliability: number;     // 0-100
}

export interface MeleeProfile {
  category: 'melee';
  type: MeleeType;
  damage: number;          // per swing (capped)
  swingSpeed: number;      // swings per minute (cap ~60)
  accuracy: number;        // 0-100
  reliability: number;     // 0-100 (represents grip/weight/fatigue mishaps)
  size: 'small' | 'medium' | 'large';
  durability: number;      // 0-100
}

export type WeaponProfile = GunProfile | MeleeProfile;

export const WEAPON_CAPS = {
  MAX_GUN_RPM: 90,
  MAX_DAMAGE: 70,
  MAX_MELEE_SWINGS: 60,
  MAX_ACCURACY_SOFT: 95, // even 100% accurate weapons can miss ~5%
};
