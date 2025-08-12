export interface GameItem {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'consumable' | 'material' | 'chem' | 'fuel' | 'special' | 'accessory';
  rarity: 'uncommon' | 'common' | 'rare' | 'relic';
  description: string;
  value: number;
  weight: number;
  icon: string;
  function?: string;
  stats?: { [key: string]: number };
  effects?: { [key: string]: number };
}

export const GAME_ITEMS: GameItem[] = [
  // WEAPONS (Shatterhold Conversion - stats, ids, rarity unchanged)
  {
    id: 'makeshift-rifle',
    name: 'Sovereign Arms Spitfire SCR',
    type: 'weapon',
    rarity: 'uncommon',
    description: 'Sovereign Arms, 2043. Infamous for its raw and unrefined power, made for the company militias defending collapsed city-states. The Spitfire was a weapon for those who held the line, no matter the cost.',
    value: 25,
    weight: 4,
    icon: '🔫',
    function: 'Sovereign Arms • Militia Rifle: Basic city-state defense.',
    stats: { damage: 12, accuracy: 50, fireRate: 1 }
  },
  {
    id: 'broken-laser-pistol',
    name: 'Lionheart Tacticals ArcFlash Pistol',
    type: 'weapon',
    rarity: 'uncommon',
    description: 'Lionheart Tactical, 2044. Originally designed for riot control and security, this battered piece of Lionheart tech is as unpredictable as the city factions it once served.',
    value: 30,
    weight: 2,
    icon: '⚡',
    function: 'Lionheart Tactical • Riot Control Pistol: Occasional spark still flies.',
    stats: { damage: 10, accuracy: 55, fireRate: 2 }
  },
  {
    id: 'scrap-shotgun',
    name: 'Albion Defense Breachmaster',
    type: 'weapon',
    rarity: 'uncommon',
    description: 'Albion Defense Works, 2041. Designed for forced-entry squads—where negotiations failed, the Breachmaster spoke next.',
    value: 35,
    weight: 5,
    icon: '💥',
    function: 'Albion Defense Works • Breaching Shotgun: Opens doors... or closes arguments.',
    stats: { damage: 18, accuracy: 40, fireRate: 0.8 }
  },
  {
    id: 'improvised-smg',
    name: 'Lionheart Tacticals Reaver SMG',
    type: 'weapon',
    rarity: 'uncommon',
    description: 'Lionheart Tactical, 2047. A cheap, mass-produced submachine gun for urban skirmishers and street factions.',
    value: 40,
    weight: 3,
    icon: '🔫',
    function: 'Lionheart Tactical • Urban SMG: Floods the field with fire.',
    stats: { damage: 6, accuracy: 45, fireRate: 4 }
  },
  {
    id: 'bent-combat-knife',
    name: 'SafeShelter Nightstar Blade',
    type: 'weapon',
    rarity: 'uncommon',
    description: 'Issued to SafeShelter extraction teams, 2045. A tool, a weapon, and a last-ditch guardian of secrets.',
    value: 12,
    weight: 1,
    icon: '🔪',
    function: 'SafeShelter Arms • Emergency Blade: Last line of defense and dignity.',
    stats: { damage: 8, accuracy: 70, fireRate: 3 }
  },
  {
    id: 'crude-sledgehammer',
    name: 'Albion Defense Rumbler',
    type: 'weapon',
    rarity: 'uncommon',
    description: 'A heavy tool repurposed from Albion Defense Works, 2043. Used by militarized construction units to clear paths—and opposition.',
    value: 20,
    weight: 8,
    icon: '🔨',
    function: 'Albion Defense Works • Demolition Hammer: Not subtle, but effective.',
    stats: { damage: 15, accuracy: 50, fireRate: 0.5 }
  },
  {
    id: 'worn-hunting-rifle',
    name: 'Sovereign Arms Longwatcher',
    type: 'weapon',
    rarity: 'uncommon',
    description: 'Sovereign Arms, 2045. Standard issue for perimeter scouts and city-state lookouts, renowned for reliability over distance.',
    value: 45,
    weight: 4,
    icon: '🎯',
    function: 'Sovereign Arms • Recon Rifle: Keeps threats at a respectful distance.',
    stats: { damage: 14, accuracy: 60, fireRate: 1.2 }
  },
  {
    id: 'damaged-32-pistol',
    name: 'Lionheart Tacticals Streetling .32',
    type: 'weapon',
    rarity: 'uncommon',
    description: 'A budget option for city survivalists, Lionheart Tactical, 2046. Cheap, quick, and disposable.',
    value: 18,
    weight: 1,
    icon: '🔫',
    function: 'Lionheart Tactical • Personal Sidearm: For those unpredictable alleys.',
    stats: { damage: 9, accuracy: 55, fireRate: 2.5 }
  },
  {
    id: 'rusty-machete',
    name: 'Albion Defense Junglecut',
    type: 'weapon',
    rarity: 'uncommon',
    description: 'Albion Defense Works, 2046. Designed for terrain clearance. Equally adaptable against brush and uninvited guests.',
    value: 22,
    weight: 2,
    icon: '🗡️',
    function: 'Albion Defense Works • Utility Machete: Bushwhacker and bodyguard.',
    stats: { damage: 10, accuracy: 65, fireRate: 2.8 }
  },

  // COMMON WEAPONS (10)
  {
    id: '10mm-pistol',
    name: 'SafeShelter Bastion 10mm',
    type: 'weapon',
    rarity: 'common',
    description: 'SafeShelter Arms, 2044. Once considered the gold standard for settlers and corporate execs alike; holds its own even after decades of neglect.',
    value: 65,
    weight: 3,
    icon: '🔫',
    function: 'SafeShelter Arms • Settler Pistol: Defense and dignity for post-collapse survivors.',
    stats: { damage: 16, accuracy: 75, fireRate: 3 }
  },
  {
    id: 'pipe-rifle',
    name: 'Albion Defense Pipecaster',
    type: 'weapon',
    rarity: 'common',
    description: 'Albion Defense Works, 2043. Built in the harshest post-collapse forges. Practical, reliable, and completely unremarkable.',
    value: 75,
    weight: 6,
    icon: '🔫',
    function: 'Albion Defense Works • Survival Rifle: Keeps families fed (and whole).',
    stats: { damage: 18, accuracy: 65, fireRate: 2 }
  },
  {
    id: 'combat-knife',
    name: 'Sovereign Arms Warden Blade',
    type: 'weapon',
    rarity: 'common',
    description: 'Sovereign Arms, 2044. Favored by city guards for its brutal simplicity; the edge never seemed to dull.',
    value: 25,
    weight: 1,
    icon: '🔪',
    function: 'Sovereign Arms • City Guard Knife: Authority, up close.',
    stats: { damage: 12, accuracy: 85, fireRate: 4 }
  },
  {
    id: 'hunting-rifle',
    name: 'SafeShelter Outbound .308',
    type: 'weapon',
    rarity: 'common',
    description: 'A pre-event design from SafeShelter, 2045. Provided to trusted perimeter agents and scouts across the region.',
    value: 120,
    weight: 5,
    icon: '🎯',
    function: 'SafeShelter Arms • Perimeter Rifle: Trust in the old world’s reach.',
    stats: { damage: 28, accuracy: 82, fireRate: 1.5 }
  },
  {
    id: 'laser-pistol',
    name: 'Lionheart Tacticals Sparkbeam',
    type: 'weapon',
    rarity: 'common',
    description: 'Lionheart Tactical, 2047. A civilian-market curiosity that proved a godsend during the fall; reliable at modest range.',
    value: 95,
    weight: 2,
    icon: '⚡',
    function: 'Lionheart Tactical • Civilian Laser: Brighter than most trespassers expect.',
    stats: { damage: 20, accuracy: 78, fireRate: 2.5 }
  },
  {
    id: 'sawed-off-shotgun',
    name: 'Albion Defense Chasm Cleaver',
    type: 'weapon',
    rarity: 'common',
    description: 'Albion Defense Works, 2046. Compact, brutal, and wholly unconcerned with subtlety.',
    value: 95,
    weight: 4,
    icon: '💥',
    function: 'Albion Defense Works • Compact Shotgun: Handy for close corridors and hasty retreats.',
    stats: { damage: 35, accuracy: 55, fireRate: 2 }
  },
  {
    id: 'baseball-bat',
    name: 'Sovereign Arms Upriser Bat',
    type: 'weapon',
    rarity: 'common',
    description: 'Sovereign Arms, 2042. Used in protest, sport, and war—the great democratizer of close combat.',
    value: 15,
    weight: 2,
    icon: '🏏',
    function: 'Sovereign Arms • Uprising Tool: For principle, or just survival.',
    stats: { damage: 15, accuracy: 75, fireRate: 3 }
  },
  {
    id: 'assault-rifle',
    name: 'Lionheart Tacticals Sable AR',
    type: 'weapon',
    rarity: 'common',
    description: 'Lionheart Tactical, 2048. Rapidly deployed as civil order collapsed, the Sable AR is a favorite among control-hungry factions.',
    value: 200,
    weight: 7,
    icon: '🔫',
    function: 'Lionheart Tactical • Assault Rifle: Enough said.',
    stats: { damage: 25, accuracy: 70, fireRate: 6 }
  },
  {
    id: 'blackhawk',
    name: 'SafeShelter IronVow .44',
    type: 'weapon',
    rarity: 'common',
    description: 'SafeShelter Arms, 2046. The IronVow stands as a symbol of uncompromising justice—even among the ruins.',
    value: 140,
    weight: 4,
    icon: '🔫',
    function: 'SafeShelter Arms • Authority Revolver: The lawkeeper’s legacy.',
    stats: { damage: 32, accuracy: 80, fireRate: 1.5 }
  },
  {
    id: 'chinese-pistol',
    name: 'Albion Defense Redline Pistol',
    type: 'weapon',
    rarity: 'common',
    description: 'Albion Defense Works, 2047. A sturdy design, produced in such volume that it’s as common as dust across settlements.',
    value: 55,
    weight: 2,
    icon: '🔫',
    function: 'Albion Defense Works • Settlement Pistol: Never hard to find.',
    stats: { damage: 14, accuracy: 72, fireRate: 3 }
  },

  // RARE WEAPONS (10)
  {
    id: 'laser-rifle',
    name: 'SafeShelter Reliant Beam Rifle',
    type: 'weapon',
    rarity: 'rare',
    description: 'SafeShelter Arms, 2050. A marvel of production, issued only to elite enclave units; its power is a beacon and a threat.',
    value: 450,
    weight: 8,
    icon: '⚡',
    function: 'SafeShelter Arms • Elite Laser Rifle: Light pierces the fog.',
    stats: { damage: 35, accuracy: 80, fireRate: 3 }
  },
  {
    id: 'plasma-rifle',
    name: 'Sovereign Arms Stormpulse Rifle',
    type: 'weapon',
    rarity: 'rare',
    description: 'Sovereign Arms, 2051. Stolen designs, illicit upgrades, and pure ambition—a favorite among warlords.',
    value: 520,
    weight: 9,
    icon: '⚡',
    function: 'Sovereign Arms • Warlord’s Plasma: Tampered. Deadly.',
    stats: { damage: 42, accuracy: 78, fireRate: 2 }
  },
  {
    id: 'sniper-rifle',
    name: 'Albion Defense Whisperstrike',
    type: 'weapon',
    rarity: 'rare',
    description: 'Albion Defense Works, 2049. A weapon for those whose home front knows no boundaries.',
    value: 350,
    weight: 9,
    icon: '🎯',
    function: 'Albion Defense Works • Suppression Sniper: See enemies before they see you.',
    stats: { damage: 45, accuracy: 95, fireRate: 1 }
  },
  {
    id: 'combat-shotgun',
    name: 'Lionheart Tacticals Urban Judge',
    type: 'weapon',
    rarity: 'rare',
    description: 'Lionheart Tactical, 2050. Street sweeper and justice dealer, fielded by city militias and outcasts alike.',
    value: 280,
    weight: 8,
    icon: '💥',
    function: 'Lionheart Tactical • City Militia Shotgun: Judgment in every shell.',
    stats: { damage: 40, accuracy: 60, fireRate: 2 }
  },
  {
    id: 'chinese-assault-rifle',
    name: 'Albion Defense Sovereign M2',
    type: 'weapon',
    rarity: 'rare',
    description: 'Albion Defense Works, 2051. Trusted by peacekeepers until the lines blurred between order and oppression.',
    value: 320,
    weight: 8,
    icon: '🔫',
    function: 'Albion Defense Works • Peacekeeper Rifle: End the chaos, or enforce it.',
    stats: { damage: 26, accuracy: 72, fireRate: 5 }
  },
  {
    id: 'deathclaw-gauntlet',
    name: 'Sovereign Arms Ravager Gauntlet',
    type: 'weapon',
    rarity: 'rare',
    description: 'Sovereign Arms, 2048. An improvised legend—part factory, part myth, all danger.',
    value: 420,
    weight: 8,
    icon: '🦅',
    function: 'Sovereign Arms • Raider’s Gauntlet: Turn the world to claws.',
    stats: { damage: 48, accuracy: 75, fireRate: 4 }
  },
  {
    id: 'super-sledge',
    name: 'SafeShelter Bulwark Sledge',
    type: 'weapon',
    rarity: 'rare',
    description: 'SafeShelter Arms, 2047. The final say in negotiations—whether with barricades or beasts.',
    value: 480,
    weight: 20,
    icon: '🔨',
    function: 'SafeShelter Arms • Heavy Sledge: Compromise is optional.',
    stats: { damage: 55, accuracy: 60, fireRate: 1 }
  },
  {
    id: 'railway-rifle',
    name: 'Lionheart Tacticals Railgunner',
    type: 'weapon',
    rarity: 'rare',
    description: 'Lionheart Tactical, 2051. An engineering marvel, cobbled together from trainyards and tech-labs.',
    value: 410,
    weight: 11,
    icon: '🚂',
    function: 'Lionheart Tactical • Improvised Rail Launcher: Velocity beats mass.',
    stats: { damage: 38, accuracy: 82, fireRate: 1.5 }
  },
  {
    id: 'lever-action-rifle',
    name: 'Albion Defense Valiant',
    type: 'weapon',
    rarity: 'rare',
    description: 'Albion Defense Works, 2048. An old-west design, refitted for the new frontier.',
    value: 260,
    weight: 6,
    icon: '🎯',
    function: 'Albion Defense Works • Lever Rifle: Nostalgia with a bite.',
    stats: { damage: 30, accuracy: 82, fireRate: 2 }
  },
  {
    id: 'ripper',
    name: 'Lionheart Tacticals Ripsaw',
    type: 'weapon',
    rarity: 'rare',
    description: 'Lionheart Tactical, 2052. From the foundries beneath the city, a tool turned instrument of terror.',
    value: 350,
    weight: 6,
    icon: '🪚',
    function: 'Lionheart Tactical • Foundry Blade: It hungers for more.',
    stats: { damage: 28, accuracy: 70, fireRate: 8 }
  },

  // RELIC WEAPONS (5)
  {
    id: 'gauss-rifle',
    name: 'SafeShelter Brimforce XII',
    type: 'weapon',
    rarity: 'relic',
    description: 'SafeShelter Arms, 2053. A technological magnum opus—rumored to have been fielded by only the highest echelon of SafeShelter Security in the final hours.',
    value: 2500,
    weight: 12,
    icon: '⚡',
    function: 'SafeShelter Arms • Relic Coil Rifle: The end of the old empire, in your hands.',
    stats: { damage: 65, accuracy: 90, fireRate: 1 }
  },
  {
    id: 'alien-blaster',
    name: 'SafeShelter IronVow LMG',
    type: 'weapon',
    rarity: 'relic',
    description: 'SafeShelter Arms, 2052. Ultra-advanced squad support weapon. Its destructive capacity turned the tide at many a blockade.',
    value: 3000,
    weight: 2,
    icon: '👽',
    function: 'SafeShelter Arms • Relic LMG: Authority reimagined for the wasteland.',
    stats: { damage: 75, accuracy: 95, fireRate: 2 }
  },
  {
    id: 'fatman',
    name: 'SafeShelter Bulwark XI',
    type: 'weapon',
    rarity: 'relic',
    description: 'SafeShelter Arms, 2051. A battlefield equalizer, so potent it was restricted by every would-be government.',
    value: 5000,
    weight: 30,
    icon: '☢️',
    function: 'SafeShelter Arms • Relic Catapult: Absolute insurance.',
    stats: { damage: 200, accuracy: 40, fireRate: 0.5 }
  },
  {
    id: 'tesla-cannon',
    name: 'Sovereign Arms Tempest Cannon',
    type: 'weapon',
    rarity: 'relic',
    description: 'Sovereign Arms, 2052. Reverse-engineered from classified blueprints, the Tempest is synonymous with final victory.',
    value: 4000,
    weight: 18,
    icon: '⚡',
    function: 'Sovereign Arms • Relic Discharge: Storms made manifest.',
    stats: { damage: 45, accuracy: 75, fireRate: 1 }
  },
  {
    id: 'experimental-mirv',
    name: 'Sovereign Arms Decimator MIRV',
    type: 'weapon',
    rarity: 'relic',
    description: 'Sovereign Arms, 2053. Built in the last days, splitting devastation across wide swathes. Stockpiles claimed and lost countless times.',
    value: 8000,
    weight: 35,
    icon: '☢️',
    function: 'Sovereign Arms • Relic MIRV: Too much power for any single hand.',
    stats: { damage: 300, accuracy: 30, fireRate: 0.3 }
  },

  // ARMOR - Following same rarity system
  {
    id: 'leather-armor',
    name: 'Leather Armor',
    type: 'armor',
    rarity: 'common',
    description: 'Basic protection made from tanned animal hide.',
    value: 50,
    weight: 8,
    icon: '🦺',
    function: 'Provides basic protection against physical damage',
    stats: { defense: 15, durability: 100 }
  },
  {
    id: 'metal-armor',
    name: 'Metal Armor',
    type: 'armor',
    rarity: 'uncommon',
    description: 'Scavenged metal plates welded together for protection.',
    value: 85,
    weight: 12,
    icon: '🛡️',
    function: 'Good protection but heavy',
    stats: { defense: 25, durability: 120 }
  },
  {
    id: 'combat-armor',
    name: 'Combat Armor',
    type: 'armor',
    rarity: 'rare',
    description: 'Military-grade protective gear designed for combat situations.',
    value: 400,
    weight: 15,
    icon: '🛡️',
    function: 'Advanced protection with radiation resistance',
    stats: { defense: 35, durability: 150, radResist: 15 }
  },
  {
    id: 'power-armor',
    name: 'T-45d Power Armor',
    type: 'armor',
    rarity: 'relic',
    description: 'Pre-war powered exoskeleton providing ultimate protection.',
    value: 5000,
    weight: 50,
    icon: '🤖',
    function: 'Ultimate protection with strength enhancement',
    stats: { defense: 100, durability: 500, strength: 10, health: 50 }
  },

  // ACCESSORIES
  {
    id: 'tactical-scope',
    name: 'Tactical Scope',
    type: 'accessory',
    rarity: 'rare',
    description: 'Pre-war optical scope that enhances accuracy.',
    value: 200,
    weight: 1,
    icon: '🔍',
    function: 'Increases accuracy and tech stats',
    stats: { tech: 5, accuracy: 10 }
  },

  // Consumables
  {
    id: 'stimpak',
    name: 'Stimpak',
    type: 'consumable',
    rarity: 'common',
    description: 'Auto-injector containing healing compounds.',
    value: 25,
    weight: 0.5,
    icon: '💉',
    function: 'Instantly restores 50 health points',
    effects: { health: 50 }
  },
  {
    id: 'rad-away',
    name: 'Rad-Away',
    type: 'consumable',
    rarity: 'uncommon',
    description: 'Intravenous radiation treatment.',
    value: 40,
    weight: 0.5,
    icon: '🧪',
    function: 'Removes radiation poisoning from the body',
    effects: { radiation: -100 }
  },
  {
    id: 'nuka-cola',
    name: 'Nuka-Cola',
    type: 'consumable',
    rarity: 'common',
    description: 'The beverage that won the west! Restores thirst.',
    value: 15,
    weight: 1,
    icon: '🥤',
    function: 'Restores thirst and provides small health boost',
    effects: { thirst: 25, health: 5 }
  },
  {
    id: 'canned-food',
    name: 'Canned Food',
    type: 'consumable',
    rarity: 'common',
    description: 'Pre-war canned food, still edible.',
    value: 8,
    weight: 0.5,
    icon: '🥫',
    function: 'Restores hunger',
    effects: { hunger: 40 }
  },
  {
    id: 'purified-water',
    name: 'Purified Water',
    type: 'consumable',
    rarity: 'uncommon',
    description: 'Highly purified water with enhanced hydration.',
    value: 12,
    weight: 1,
    icon: '💎',
    function: 'Restores more thirst than regular water',
    effects: { thirst: 40 }
  },
  {
    id: 'water',
    name: 'Water',
    type: 'consumable',
    rarity: 'common',
    description: 'Clean drinking water.',
    value: 5,
    weight: 1,
    icon: '💧',
    function: 'Restores thirst',
    effects: { thirst: 25 }
  },
  {
    id: 'food',
    name: 'Food',
    type: 'consumable',
    rarity: 'common',
    description: 'Basic food ration.',
    value: 6,
    weight: 0.5,
    icon: '🍞',
    function: 'Restores hunger',
    effects: { hunger: 30 }
  },

  // Chems - Enhanced for combat use
  {
    id: 'psycho',
    name: 'Psycho',
    type: 'chem',
    rarity: 'uncommon',
    description: 'Military combat drug that enhances damage resistance.',
    value: 75,
    weight: 0.1,
    icon: '💊',
    function: 'Increases damage and defense temporarily, but reduces accuracy and charisma',
    effects: { damage: 25, defense: 15, combat: 5, accuracy: -5, charisma: -2 }
  },
  {
    id: 'jet',
    name: 'Jet',
    type: 'chem',
    rarity: 'common',
    description: 'Highly addictive stimulant that slows time perception.',
    value: 50,
    weight: 0.1,
    icon: '🌪️',
    function: 'Increases stealth and accuracy temporarily, but reduces defense',
    effects: { stealth: 3, accuracy: 12, defense: -5, combat: -2 }
  },
  {
    id: 'mentats',
    name: 'Mentats',
    type: 'chem',
    rarity: 'uncommon',
    description: 'Nootropic drug that enhances cognitive function.',
    value: 60,
    weight: 0.1,
    icon: '🧠',
    function: 'Increases tech and charisma, but reduces combat effectiveness',
    effects: { tech: 3, charisma: 2, combat: -3, accuracy: -3 }
  },
  {
    id: 'buffout',
    name: 'Buffout',
    type: 'chem',
    rarity: 'uncommon',
    description: 'Anabolic steroid that enhances physical performance.',
    value: 70,
    weight: 0.1,
    icon: '💪',
    function: 'Increases combat effectiveness and health, but reduces accuracy',
    effects: { combat: 4, health: 25, accuracy: -3, stealth: -2 }
  },
  {
    id: 'med-x',
    name: 'Med-X',
    type: 'chem',
    rarity: 'uncommon',
    description: 'Powerful painkiller that reduces damage taken.',
    value: 80,
    weight: 0.1,
    icon: '💉',
    function: 'Increases defense and reduces pain, but slows reactions',
    effects: { defense: 20, health: 15, accuracy: -8, movement: -5 }
  },
  {
    id: 'fury',
    name: 'Fury',
    type: 'chem',
    rarity: 'rare',
    description: 'Experimental combat enhancer that boosts damage output.',
    value: 120,
    weight: 0.1,
    icon: '🔥',
    function: 'Massive damage increase, but reduces accuracy and defense',
    effects: { damage: 40, combat: 8, accuracy: -15, defense: -10 }
  },
  {
    id: 'ultrajet',
    name: 'Ultrajet',
    type: 'chem',
    rarity: 'rare',
    description: 'Enhanced version of Jet with stronger effects.',
    value: 100,
    weight: 0.1,
    icon: '🌀',
    function: 'Major stealth and accuracy boost, but significant defense penalty',
    effects: { stealth: 8, accuracy: 20, defense: -12, combat: -5 }
  },

  // Materials
  {
    id: 'steel',
    name: 'Steel',
    type: 'material',
    rarity: 'common',
    description: 'Salvaged steel from pre-war structures.',
    value: 3,
    weight: 1,
    icon: '🔩',
    function: 'Essential crafting material for weapons and structures'
  },
  {
    id: 'circuitry',
    name: 'Circuitry',
    type: 'material',
    rarity: 'uncommon',
    description: 'Complex electronic components from old world tech.',
    value: 15,
    weight: 0.5,
    icon: '🔌',
    function: 'Required for advanced electronic devices and upgrades'
  },
  {
    id: 'rare-component',
    name: 'Rare Component',
    type: 'material',
    rarity: 'rare',
    description: 'Highly advanced pre-war technology component.',
    value: 100,
    weight: 0.5,
    icon: '⚙️',
    function: 'Used in high-tier equipment upgrades and power systems'
  },

  // Fuel
  {
    id: 'fusion-core',
    name: 'Fusion Core',
    type: 'fuel',
    rarity: 'rare',
    description: 'Pre-war fusion battery providing massive energy output.',
    value: 300,
    weight: 3,
    icon: '🔋',
    function: 'Powers fusion reactors and heavy equipment for extended periods'
  },
  {
    id: 'energy-cell',
    name: 'Energy Cell',
    type: 'fuel',
    rarity: 'common',
    description: 'Small battery for energy weapons.',
    value: 8,
    weight: 0.1,
    icon: '🔋',
    function: 'Ammunition for laser and plasma weapons'
  },

  // Special Items
  {
    id: 'holotape',
    name: 'Holotape',
    type: 'special',
    rarity: 'uncommon',
    description: 'Data storage device containing valuable information.',
    value: 25,
    weight: 0.1,
    icon: '💾',
    function: 'Contains quest information, terminal access codes, or valuable data'
  },
  {
    id: 'pre-war-money',
    name: 'Pre-War Money',
    type: 'special',
    rarity: 'common',
    description: 'Currency from before the Great War, now mostly worthless.',
    value: 1,
    weight: 0.1,
    icon: '💵',
    function: 'Can be used as cloth material or traded to collectors'
  }
];
