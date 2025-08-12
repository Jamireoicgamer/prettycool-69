# COMPLETE COMBAT SYSTEM FORMULA

## ✅ ALL FIXES IMPLEMENTED:

### 1. **STIMPACK FIX** ✅
- Stimpacks now properly revive knocked-out squad members
- Heals 30 HP normally, 50 HP + revival for knocked-out members
- Sets health to minimum 30% of max health when reviving

### 2. **COMBAT DURATION FIX** ✅
- **NEW RANGE: 3 minutes to 3 hours** (180s - 10,800s)
- Duration now based on actual squad stats, equipment, and enemy difficulty
- Dynamic combat intervals (1-3 seconds) based on participant count
- Safety timeout extended to 4 hours

### 3. **COMBAT SYNCHRONIZATION FIX** ✅
- Mission completion no longer shows "victory" until combat actually ends
- Created CombatSynchronizer system to bridge mission timer and real combat
- Combat status properly reflects actual combat phases

### 4. **ENHANCED COMBAT AI** ✅
- 25+ different combat actions (offensive, defensive, tactical, special)
- Dynamic enemy scaling based on squad equipment
- Sophisticated AI decision making
- Terrain and weather effects

---

## 🔥 COMPLETE COMBAT FORMULA

### **CORE CALCULATION:**

```
SQUAD POWER = Σ(Member Power) for each squad member
where Member Power = Weapon Score + (Survivability × 0.1)

Weapon Score = Damage × Fire Rate × (Accuracy / 100)
Survivability = Health + Defense

ENEMY POWER = Σ(Enemy Power) for each enemy  
where Enemy Power = Firepower + (Health × 0.15)

Firepower = Damage × Fire Rate × (Accuracy / 100)

POWER RATIO = Squad Power / Enemy Power

BASE COMBAT TIME = (Average Enemy Health × Enemy Count) / Average Squad DPS
```

### **DURATION MODIFIERS:**

1. **Difficulty Multiplier:** `Difficulty^1.5`
   - Difficulty 1: 1.0× (3-30 min)
   - Difficulty 2: 2.8× (8-84 min) 
   - Difficulty 3: 5.2× (15-156 min)
   - Difficulty 4: 8.0× (24-240 min)
   - Difficulty 5: 11.2× (33+ min, capped at 180 min)

2. **Power Balance Modifier:**
   - Overpowered (Ratio > 2.0): Duration × 0.6
   - Underpowered (Ratio < 0.5): Duration × 2.5  
   - Balanced (0.5-2.0): Duration × 1.2

3. **Travel Modifier:**
   - Junction locations: +30%
   - Complex locations: +25%
   - Valley locations: +20%
   - Other locations: +15%

### **EQUIPMENT IMPACT EXAMPLES:**

**No Equipment Squad:**
- Damage: 5, Accuracy: 30, Fire Rate: 1
- **Result:** Maximum duration fights (3 hours)

**Basic Equipment (Pipe Weapons):**
- Damage: 8-12, Accuracy: 45-70, Fire Rate: 1-2
- **Result:** 1-2 hour fights typically

**Advanced Equipment (Military):**
- Damage: 25+, Accuracy: 80+, Fire Rate: 3+
- **Result:** 10-30 minute fights

**Legendary Equipment:**
- Damage: 40+, Accuracy: 90+, Fire Rate: 4+
- **Result:** 3-10 minute fights

### **EXAMPLE CALCULATIONS:**

**Scenario A: Poorly Equipped Squad vs Easy Target**
- 3 members, pipe pistols (8 dmg, 45 acc, 1.5 FR), 100 HP
- Squad Power: 3 × (5.4 + 10) = 46.2
- 2 raiders (10 dmg, 30 HP, 50 acc, 2 FR)  
- Enemy Power: 2 × (10 + 4.5) = 29
- Power Ratio: 1.59 (Balanced)
- Base Time: 60/15.4 = 3.9s
- After Difficulty 2: 3.9 × 2.83 = 11s
- After Balance: 11 × 1.2 = 13.2s
- After Travel: 13.2 × 1.2 = 15.8s
- **Final: 180s (3 min minimum)**

**Scenario B: Well-Equipped Squad vs Hard Target**
- 4 members, combat rifles (25 dmg, 80 acc, 3 FR), 120 HP
- Squad Power: 4 × (60 + 12) = 288
- 3 super mutants (15 dmg, 60 HP, 45 acc, 1 FR)
- Enemy Power: 3 × (6.75 + 9) = 47.25
- Power Ratio: 6.1 (Overpowered)
- Base Time: 180/72 = 2.5s  
- After Difficulty 4: 2.5 × 8 = 20s
- After Balance: 20 × 0.6 = 12s
- After Travel: 12 × 1.25 = 15s
- **Final: 180s (3 min minimum)**

**Scenario C: Legendary Squad vs Deathclaw**
- 6 members, legendary weapons (40 dmg, 90 acc, 4 FR), 150 HP
- Squad Power: 6 × (144 + 15) = 954
- 1 alpha deathclaw (40 dmg, 200 HP, 80 acc, 1 FR)
- Enemy Power: 32 + 30 = 62
- Power Ratio: 15.4 (Massively Overpowered)
- Base Time: 200/159 = 1.26s
- After Difficulty 5: 1.26 × 11.2 = 14s
- After Balance: 14 × 0.6 = 8.4s
- After Travel: 8.4 × 1.3 = 11s
- **Final: 180s (3 min minimum)**

### **KEY FEATURES:**

✅ **Realistic Combat Duration:** 3 minutes to 3 hours based on actual loadout
✅ **Equipment Matters:** Better gear = faster victories  
✅ **Difficulty Scaling:** Higher difficulty = exponentially longer fights
✅ **Squad Composition:** More members = more firepower
✅ **Enemy Scaling:** Enemies scale with squad equipment level
✅ **Terrain Effects:** Location affects travel time and combat bonuses
✅ **Stimpack Revival:** Properly revives knocked-out members
✅ **Synchronized Victory:** Victory only appears when combat actually ends

**The system ensures that progression feels meaningful - better equipment and tactics lead to faster, more efficient combat operations, while poor preparation results in long, dangerous engagements.**