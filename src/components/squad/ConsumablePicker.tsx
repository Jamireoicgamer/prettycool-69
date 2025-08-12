import React from 'react';
import { useGame } from '@/context/GameContext';
import { InventoryItem } from '@/types/GameTypes';
import { X } from 'lucide-react';

interface ConsumablePickerProps {
  type: 'food' | 'water';
  onSelect: (itemId: string) => void;
  onClose: () => void;
}

export const ConsumablePicker: React.FC<ConsumablePickerProps> = ({ type, onSelect, onClose }) => {
  const { gameState } = useGame();

  const isDrink = type === 'water';
  const allowedIds = isDrink
    ? new Set(['water', 'purified-water', 'nuka-cola'])
    : new Set(['food', 'canned-food']);

  const items: InventoryItem[] = gameState.inventory
    .filter((i) => i.type === 'consumable' && allowedIds.has(i.id) && i.quantity > 0)
    .sort((a, b) => (b.rarity > a.rarity ? 1 : -1));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-black/90 border border-blue-500/30 rounded-xl p-4 w-full max-w-md z-50 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-blue-400">
            {isDrink ? 'Select a drink' : 'Select a food'}
          </h3>
          <button onClick={onClose} className="p-1 rounded bg-red-600 hover:bg-red-500 text-white">
            <X size={16} />
          </button>
        </div>

        {items.length === 0 ? (
          <p className="text-gray-400 text-sm">No {isDrink ? 'drinks' : 'foods'} available.</p>
        ) : (
          <ul className="space-y-2 max-h-80 overflow-y-auto">
            {items.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => onSelect(item.id)}
                  className="w-full text-left bg-gray-800/40 hover:bg-gray-700/40 border border-gray-600/40 rounded-lg p-3 transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{item.icon}</span>
                      <div>
                        <p className="text-white text-sm font-medium">{item.name}</p>
                        <p className="text-xs text-gray-400">{item.description}</p>
                        {item.effects && (
                          <p className="text-xs text-green-400 mt-1">
                            {Object.entries(item.effects)
                              .map(([k, v]) => `${k}+${v}`)
                              .join(' • ')}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-amber-400 text-sm font-bold">x{item.quantity}</p>
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
