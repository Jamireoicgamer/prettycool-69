
import { InventoryItem } from '@/types/GameTypes';
import { GAME_ITEMS } from '@/data/GameItems';

export interface Trader {
  id: string;
  name: string;
  description: string;
  specialization: string[];
  avatar: string;
}

export const TRADERS: Trader[] = [
  {
    id: 'marcus-gunrunner',
    name: 'Marcus "Gunrunner"',
    description: 'Former Brotherhood of Steel member who specializes in weapons and ammunition.',
    specialization: ['weapon'],
    avatar: '🔫'
  },
  {
    id: 'sarah-scrap-queen',
    name: 'Sarah "Scrap Queen"',
    description: 'Expert salvager who trades in materials and components.',
    specialization: ['material'],
    avatar: '🔧'
  },
  {
    id: 'doc-mitchell',
    name: 'Doc Mitchell',
    description: 'Wasteland medic who deals in medical supplies and chems.',
    specialization: ['consumable', 'chem'],
    avatar: '💉'
  },
  {
    id: 'trader-joe',
    name: 'Trader Joe',
    description: 'General merchant with a variety of common goods.',
    specialization: ['consumable', 'material'],
    avatar: '🎒'
  },
  {
    id: 'tech-head-willis',
    name: 'Tech-Head Willis',
    description: 'Technology specialist dealing in energy weapons and advanced tech.',
    specialization: ['weapon', 'accessory'],
    avatar: '⚡'
  },
  {
    id: 'armor-king-valdez',
    name: 'Armor King Valdez',
    description: 'Protection specialist with the best armor in the wasteland.',
    specialization: ['armor'],
    avatar: '🛡️'
  },
  {
    id: 'chem-dealer-pike',
    name: 'Chem Dealer Pike',
    description: 'Shady character who deals in rare chems and drugs.',
    specialization: ['chem'],
    avatar: '💊'
  },
  {
    id: 'wasteland-wanderer',
    name: 'Wasteland Wanderer',
    description: 'Mysterious trader with rare and unusual finds.',
    specialization: ['special', 'weapon', 'armor'],
    avatar: '🌟'
  },
  {
    id: 'raider-boss-rex',
    name: 'Raider Boss Rex',
    description: 'Ex-raider who trades combat gear and weapons.',
    specialization: ['weapon', 'armor'],
    avatar: '💀'
  },
  {
    id: 'pre-war-collector',
    name: 'Pre-War Collector',
    description: 'Collector of rare pre-war artifacts and technology.',
    specialization: ['special', 'accessory'],
    avatar: '🏛️'
  }
];

export const generateTraderInventory = (trader: Trader): InventoryItem[] => {
  const inventory: InventoryItem[] = [];
  const itemCount = Math.floor(Math.random() * 3) + 8; // 8-10 items

  // Filter items based on trader specialization and rarity (no relic weapons in trade)
  const availableItems = GAME_ITEMS.filter(item => 
    trader.specialization.includes(item.type) && 
    item.rarity !== 'relic'
  );

  // Weight rarity distribution based on trader type
  const rarityWeights = {
    uncommon: trader.id === 'sarah-scrap-queen' || trader.id === 'trader-joe' ? 0.5 : 0.3,
    common: 0.4,
    rare: trader.id === 'wasteland-wanderer' || trader.id === 'pre-war-collector' ? 0.3 : 0.1
  };

  for (let i = 0; i < itemCount; i++) {
    if (availableItems.length === 0) break;

    // Select rarity based on weights
    const rand = Math.random();
    let selectedRarity: 'uncommon' | 'common' | 'rare';
    
    if (rand < rarityWeights.uncommon) {
      selectedRarity = 'uncommon';
    } else if (rand < rarityWeights.uncommon + rarityWeights.common) {
      selectedRarity = 'common';
    } else {
      selectedRarity = 'rare';
    }

    // Get items of selected rarity
    const rarityItems = availableItems.filter(item => item.rarity === selectedRarity);
    if (rarityItems.length === 0) continue;

    const selectedItem = rarityItems[Math.floor(Math.random() * rarityItems.length)];
    
    // Calculate price based on rarity and trader
    let priceMultiplier = 1;
    switch (selectedItem.rarity) {
      case 'uncommon': priceMultiplier = 0.8; break;
      case 'common': priceMultiplier = 1; break;
      case 'rare': priceMultiplier = 1.5; break;
    }

    // Some traders have markup/discount
    if (trader.id === 'marcus-gunrunner' && selectedItem.type === 'weapon') {
      priceMultiplier *= 1.2; // Premium weapon prices
    }
    if (trader.id === 'doc-mitchell' && (selectedItem.type === 'consumable' || selectedItem.type === 'chem')) {
      priceMultiplier *= 0.9; // Slight medical discount
    }

    const stock = Math.floor(Math.random() * 4) + 1; // 1-5 stock

    inventory.push({
      ...selectedItem,
      quantity: stock,
      stock: stock,
      price: Math.floor(selectedItem.value * priceMultiplier),
      currency: selectedItem.rarity === 'rare' && Math.random() < 0.3 ? 'scrip' : 'caps'
    });
  }

  return inventory;
};

export const getCurrentTrader = (currentTime: number): Trader => {
  const traderRotationInterval = 20 * 60 * 1000; // 20 minutes in milliseconds
  const traderIndex = Math.floor(currentTime / traderRotationInterval) % TRADERS.length;
  return TRADERS[traderIndex];
};
