export type WeatherEffect = {
  id: string;
  name: string;
  description: string;
  icon?: string;
  // Negative numbers are debuffs; positive are buffs. Most events should be neutral/debuff overall.
  modifiers: {
    accuracy?: number; // +/- percentage points to hit
    damage?: number;   // +/- flat damage applied post calc (small)
    defense?: number;  // +/- flat defense
    fireRatePct?: number; // +/- percent on fire rate (e.g., -10 = 10% slower)
    stealth?: number;
    movement?: number; // +/- movement points
    morale?: number;
    visibility?: number; // affects accuracy weighting
  };
  terrains?: Record<string, number>; // weights per terrain id
};

// 34 weather events, mostly neutral/debuff leaning
export const WEATHER_EVENTS: WeatherEffect[] = [
  { id: 'clear', name: 'Clear Skies', description: 'No significant effects.', modifiers: {} },
  { id: 'overcast', name: 'Overcast', description: 'Slight gloom dulls senses.', modifiers: { accuracy: -2 } },
  { id: 'light-rain', name: 'Light Rain', description: 'Wet ground and drizzle.', modifiers: { accuracy: -8, defense: 2, movement: -3 } },
  { id: 'fog', name: 'Fog', description: 'Visibility severely reduced.', modifiers: { accuracy: -22, visibility: -35, stealth: 10, movement: -5 } },
  { id: 'dust-storm', name: 'Dust Storm', description: 'Stinging sand and poor sight.', modifiers: { accuracy: -20, damage: -4, movement: -10 } },
  { id: 'radiation-storm', name: 'Radiation Storm', description: 'Irradiated squalls rattle nerves.', modifiers: { accuracy: -10, damage: -3, morale: -8 } },
  { id: 'rain', name: 'Rain', description: 'Steady rainfall hampers vision.', modifiers: { accuracy: -12, defense: 3, movement: -5 } },
  { id: 'heavy-rain', name: 'Heavy Rain', description: 'Sheets of water reduce visibility.', modifiers: { accuracy: -18, defense: 4, movement: -8, visibility: -20 } },
  { id: 'thunderstorm', name: 'Thunderstorm', description: 'Loud thunder shakes morale.', modifiers: { accuracy: -15, morale: -5, movement: -6 } },
  { id: 'dense-fog', name: 'Dense Fog', description: 'You can barely see ahead.', modifiers: { accuracy: -28, visibility: -45, stealth: 12, movement: -8 } },
  { id: 'mist', name: 'Morning Mist', description: 'Light haze over ground.', modifiers: { accuracy: -6, stealth: 6 } },
  { id: 'dust', name: 'Dust', description: 'Fine dust in the air.', modifiers: { accuracy: -8, damage: -2 } },
  { id: 'sandstorm', name: 'Sandstorm', description: 'Harsh desert winds, abrasive sand.', modifiers: { accuracy: -25, damage: -5, movement: -12, morale: -4 } },
  { id: 'heatwave', name: 'Heatwave', description: 'Oppressive heat saps strength.', modifiers: { accuracy: -5, damage: -2, morale: -6, movement: -6 } },
  { id: 'scorching', name: 'Scorching Sun', description: 'Blistering sun dehydrates quickly.', modifiers: { accuracy: -6, morale: -8, movement: -8 } },
  { id: 'cold-snap', name: 'Cold Snap', description: 'Numbing chill stiffens muscles.', modifiers: { accuracy: -6, movement: -6, morale: -3 } },
  { id: 'freezing', name: 'Freezing Temperatures', description: 'Gears seize, fingers numb.', modifiers: { accuracy: -10, fireRatePct: -10, movement: -8 } },
  { id: 'snow', name: 'Snow', description: 'Snowfall muffles sound and slows movement.', modifiers: { accuracy: -8, movement: -10, stealth: 6 } },
  { id: 'blizzard', name: 'Blizzard', description: 'Whiteout conditions and biting cold.', modifiers: { accuracy: -24, movement: -15, fireRatePct: -10, morale: -6 } },
  { id: 'hail', name: 'Hail', description: 'Pelting hailstones disrupt aim.', modifiers: { accuracy: -12, morale: -2 } },
  { id: 'windy', name: 'Gusty Winds', description: 'Shots drift and footing is unsure.', modifiers: { accuracy: -7, movement: -4 } },
  { id: 'gale', name: 'Gale Winds', description: 'Strong, sustained winds.', modifiers: { accuracy: -12, movement: -8 } },
  { id: 'smoke', name: 'Smoke Plume', description: 'Lingering smoke obscures targets.', modifiers: { accuracy: -14, stealth: 8, visibility: -25 } },
  { id: 'ashfall', name: 'Ashfall', description: 'Ash reduces breathing and visibility.', modifiers: { accuracy: -12, movement: -6, morale: -3 } },
  { id: 'acid-rain', name: 'Acid Rain', description: 'Caustic drizzle forces caution.', modifiers: { accuracy: -10, movement: -10, morale: -5 } },
  { id: 'electrical-storm', name: 'Electrical Storm', description: 'Static discharges disrupt electronics.', modifiers: { accuracy: -8, fireRatePct: -8 } },
  { id: 'humid', name: 'Humid Air', description: 'Oppressive humidity reduces stamina.', modifiers: { accuracy: -3, movement: -3 } },
  { id: 'dry', name: 'Dry Air', description: 'Parched, brittle air offers little relief.', modifiers: { accuracy: -2 } },
  { id: 'night-clear', name: 'Night (Clear)', description: 'Darkness aids concealment.', modifiers: { accuracy: -10, stealth: 10, visibility: -20 } },
  { id: 'night-overcast', name: 'Night (Overcast)', description: 'Pitch dark; very hard to aim.', modifiers: { accuracy: -14, stealth: 12, visibility: -28 } },
  { id: 'radiant-aurora', name: 'Radiant Aurora', description: 'Strange lights bolster resolve a bit.', modifiers: { morale: 3 } },
  { id: 'light-breeze', name: 'Light Breeze', description: 'Barely noticeable wind.', modifiers: { } },
  { id: 'drizzle', name: 'Drizzle', description: 'Fine rain dampens focus.', modifiers: { accuracy: -5 } },
  { id: 'sleet', name: 'Sleet', description: 'Slushy precipitation impedes movement.', modifiers: { movement: -9, accuracy: -6 } },
  { id: 'toxic-fog', name: 'Toxic Fog', description: 'Poisonous vapors reduce effectiveness.', modifiers: { accuracy: -15, damage: -3, morale: -5 } },
  { id: 'solar-flare', name: 'Solar Flare', description: 'Electromagnetic interference disrupts equipment.', modifiers: { accuracy: -12, fireRatePct: -15 } },
  { id: 'meteor-shower', name: 'Meteor Shower', description: 'Falling debris creates chaos.', modifiers: { accuracy: -10, movement: -8, morale: -3 } },
  { id: 'plasma-storm', name: 'Plasma Storm', description: 'Ionized particles interfere with targeting.', modifiers: { accuracy: -16, fireRatePct: -12 } },
  { id: 'magnetic-anomaly', name: 'Magnetic Anomaly', description: 'Compass spins wildly, metal equipment malfunctions.', modifiers: { accuracy: -18, fireRatePct: -20 } },
  { id: 'temporal-distortion', name: 'Temporal Distortion', description: 'Time flows strangely, reactions delayed.', modifiers: { fireRatePct: -25, movement: -15 } },
  { id: 'psychic-storm', name: 'Psychic Storm', description: 'Mental interference clouds judgment.', modifiers: { accuracy: -20, morale: -10 } },
  { id: 'gravity-flux', name: 'Gravity Flux', description: 'Unstable gravity affects movement and aim.', modifiers: { accuracy: -15, movement: -20 } },
  { id: 'energy-cascade', name: 'Energy Cascade', description: 'Wild energy discharges everywhere.', modifiers: { accuracy: -10, damage: -5, fireRatePct: -8 } },
  { id: 'void-whispers', name: 'Void Whispers', description: 'Unsettling sounds from nowhere.', modifiers: { morale: -12, accuracy: -8 } },
  { id: 'crimson-mist', name: 'Crimson Mist', description: 'Blood-red fog of unknown origin.', modifiers: { accuracy: -18, morale: -8, stealth: 8 } },
  { id: 'static-field', name: 'Static Field', description: 'Electrical charges build up on everything.', modifiers: { accuracy: -12, fireRatePct: -15 } },
  { id: 'mirage-effect', name: 'Mirage Effect', description: 'Heat distortions create false targets.', modifiers: { accuracy: -20, movement: -5 } },
  { id: 'quantum-interference', name: 'Quantum Interference', description: 'Reality seems unstable.', modifiers: { accuracy: -25, morale: -15 } },
  { id: 'nuclear-wind', name: 'Nuclear Wind', description: 'Radioactive particles carried by wind.', modifiers: { accuracy: -8, damage: -2, morale: -6 } },
  { id: 'emp-burst', name: 'EMP Burst', description: 'Electromagnetic pulse disrupts electronics.', modifiers: { fireRatePct: -30, accuracy: -15 } },
  { id: 'crystal-rain', name: 'Crystal Rain', description: 'Sharp crystalline precipitation.', modifiers: { accuracy: -10, movement: -12, damage: -3 } },
  { id: 'shadow-veil', name: 'Shadow Veil', description: 'Unnatural darkness spreads.', modifiers: { accuracy: -20, stealth: 15, morale: -5 } },
  { id: 'sonic-boom', name: 'Sonic Boom', description: 'Deafening sound waves disorient.', modifiers: { accuracy: -15, morale: -8 } },
  { id: 'pollen-storm', name: 'Pollen Storm', description: 'Thick plant spores reduce visibility.', modifiers: { accuracy: -12, movement: -6 } },
  { id: 'aurora-burst', name: 'Aurora Burst', description: 'Brilliant lights boost morale slightly.', modifiers: { morale: 5, accuracy: -3 } },
  { id: 'zero-gravity', name: 'Zero Gravity', description: 'Weightlessness affects all movement.', modifiers: { movement: -30, accuracy: -20 } },
  { id: 'time-dilation', name: 'Time Dilation', description: 'Time moves differently here.', modifiers: { fireRatePct: -20, movement: -10 } },
  { id: 'reality-storm', name: 'Reality Storm', description: 'The laws of physics seem negotiable.', modifiers: { accuracy: -30, morale: -20 } }
];

export const WEATHER_NOTES = (w: WeatherEffect): string[] => {
  const notes: string[] = [];
  const m = w.modifiers;
  if (!m || Object.keys(m).length === 0) return ['No significant effects'];
  if (m.accuracy) notes.push(`${m.accuracy > 0 ? '+' : ''}${m.accuracy}% accuracy`);
  if (typeof m.damage === 'number') notes.push(`${m.damage > 0 ? '+' : ''}${m.damage} damage`);
  if (typeof m.defense === 'number') notes.push(`${m.defense > 0 ? '+' : ''}${m.defense} defense`);
  if (typeof m.fireRatePct === 'number') notes.push(`${m.fireRatePct > 0 ? '+' : ''}${m.fireRatePct}% fire rate`);
  if (typeof m.stealth === 'number') notes.push(`${m.stealth > 0 ? '+' : ''}${m.stealth} stealth`);
  if (typeof m.movement === 'number') notes.push(`${m.movement > 0 ? '+' : ''}${m.movement} movement`);
  if (typeof m.morale === 'number') notes.push(`${m.morale > 0 ? '+' : ''}${m.morale} morale`);
  if (typeof m.visibility === 'number') notes.push(`${m.visibility > 0 ? '+' : ''}${m.visibility}% visibility`);
  return notes;
};

export const getWeatherById = (id: string | undefined): WeatherEffect | undefined => WEATHER_EVENTS.find(w => w.id === (id || ''));

export const pickWeatherForTerrain = (terrainId?: string): WeatherEffect => {
  // Simple weighting by terrain
  const weights: Array<{ w: WeatherEffect; weight: number }> = WEATHER_EVENTS.map(w => ({ w, weight: 1 }));
  if (terrainId) {
    weights.forEach(item => {
      const tWeight = item.w.terrains?.[terrainId];
      if (typeof tWeight === 'number') item.weight = Math.max(0, tWeight);
    });
  }
  // Bias towards neutral/debuff common cases
  weights.forEach(item => {
    if (['clear','light-breeze','mist','overcast','drizzle','light-rain'].includes(item.w.id)) item.weight += 2;
    if (['dust-storm','fog','rain','heavy-rain','windy','humid','dry'].includes(item.w.id)) item.weight += 1;
  });
  const total = weights.reduce((s, x) => s + x.weight, 0);
  let r = Math.random() * total;
  for (const it of weights) {
    if ((r -= it.weight) <= 0) return it.w;
  }
  return WEATHER_EVENTS[0];
};

export const getWeatherModifiers = (id?: string) => {
  const w = getWeatherById(id || 'clear') || WEATHER_EVENTS[0];
  return w.modifiers;
};
