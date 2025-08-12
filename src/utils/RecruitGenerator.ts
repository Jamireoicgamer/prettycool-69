export interface GeneratedRecruit {
  id: string;
  name: string;
  level: number;
  specialization: 'combat' | 'stealth' | 'tech' | 'charisma';
  stats: {
    health: number;
    maxHealth: number;
    combat: number;
    stealth: number;
    tech: number;
    charisma: number;
    intelligence: number;
    hunger: number;
    thirst: number;
  };
  traits: string[];
}

export interface GeneratedWorker {
  id: string;
  name: string;
  level: number;
  stats: {
    health: number;
    maxHealth: number;
    hunger: number;
    thirst: number;
    precipitation: number;
    strength: number;
    agility: number;
  };
  traits: string[];
}

const FIRST_NAMES = [
  'Alex', 'Jordan', 'Casey', 'Morgan', 'Riley', 'Avery', 'Quinn', 'Sage', 'River', 'Phoenix',
  'Marcus', 'Sarah', 'David', 'Lisa', 'Michael', 'Emily', 'James', 'Jessica', 'Robert', 'Ashley',
  'John', 'Amanda', 'William', 'Stephanie', 'Richard', 'Melissa', 'Joseph', 'Nicole', 'Thomas', 'Kimberly',
  'Christopher', 'Donna', 'Charles', 'Nancy', 'Daniel', 'Carol', 'Matthew', 'Sandra', 'Anthony', 'Ruth',
  'Mark', 'Sharon', 'Donald', 'Michelle', 'Steven', 'Laura', 'Paul', 'Sarah', 'Andrew', 'Kathy'
];

const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
  'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
  'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
  'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
  'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts'
];

const SPECIALIZATIONS: ('combat' | 'stealth' | 'tech' | 'charisma')[] = ['combat', 'stealth', 'tech', 'charisma'];

const SQUAD_TRAITS = [
  'Marksman', 'Brave', 'Silent Step', 'Observant', 'Tech Savvy', 'Charismatic', 'Tough', 'Quick',
  'Lucky', 'Sharp Shooter', 'Sneaky', 'Hacker', 'Leader', 'Survivor', 'Medic', 'Engineer',
  'Scout', 'Veteran', 'Fearless', 'Precise', 'Agile', 'Strong', 'Smart', 'Persuasive'
];

const WORKER_TRAITS = [
  'Hardworker', 'Efficient', 'Dedicated', 'Reliable', 'Skilled', 'Fast', 'Strong', 'Careful',
  'Experienced', 'Motivated', 'Focused', 'Persistent', 'Methodical', 'Thorough', 'Quick Learner'
];

const getRandomElement = <T>(array: readonly T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

const generateRandomStat = (min: number = 1, max: number = 3): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Worker stats also use 1-3 range
const generateRandomWorkerStat = (min: number = 1, max: number = 3): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const generateSquadRecruit = (): GeneratedRecruit => {
  const firstName = getRandomElement(FIRST_NAMES);
  const lastName = getRandomElement(LAST_NAMES);
  const specialization = getRandomElement(SPECIALIZATIONS);
  
  // Generate base stats 1-3
  let combat = generateRandomStat();
  let stealth = generateRandomStat();
  let tech = generateRandomStat();
  let charisma = generateRandomStat();
  let intelligence = generateRandomStat();

  // Boost one random stat up to 6
  const keys = ['combat', 'stealth', 'tech', 'charisma', 'intelligence'] as const;
  const boostKey = getRandomElement(keys);
  const boosted = Math.floor(Math.random() * 6) + 1;
  if (boostKey === 'combat') combat = Math.max(combat, boosted);
  if (boostKey === 'stealth') stealth = Math.max(stealth, boosted);
  if (boostKey === 'tech') tech = Math.max(tech, boosted);
  if (boostKey === 'charisma') charisma = Math.max(charisma, boosted);
  if (boostKey === 'intelligence') intelligence = Math.max(intelligence, boosted);
  
  const traits = [
    getRandomElement(SQUAD_TRAITS),
    getRandomElement(SQUAD_TRAITS.filter(t => t !== getRandomElement(SQUAD_TRAITS)))
  ];
  
  return {
    id: `member-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: `${firstName} ${lastName}`,
    level: 1,
    specialization,
    stats: {
      health: 100,
      maxHealth: 100,
      combat,
      stealth,
      tech,
      charisma,
      intelligence,
      hunger: 100,
      thirst: 100
    },
    traits
  };
};

export const generateWorkerRecruit = (): GeneratedWorker => {
  const firstName = getRandomElement(FIRST_NAMES);
  const lastName = getRandomElement(LAST_NAMES);
  
  const traits = [getRandomElement(WORKER_TRAITS)];
  
  return {
    id: `worker-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: `${firstName} ${lastName}`,
    level: 1,
    stats: {
      health: 100,
      maxHealth: 100,
      hunger: 100,
      thirst: 100,
      precipitation: generateRandomWorkerStat(),
      strength: generateRandomWorkerStat(),
      agility: generateRandomWorkerStat()
    },
    traits
  };
};
