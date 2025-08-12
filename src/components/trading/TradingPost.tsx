
import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { RefreshCw, ShoppingCart, DollarSign, Package } from 'lucide-react';
import { getCurrentTrader } from '@/utils/TraderSystem';

export const TradingPost = () => {
  const { gameState, buyItem, sellItem, refreshTrading } = useGame();
  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy');

  const canRefresh = Date.now() - gameState.lastTradingRefresh >= 20 * 60 * 1000;
  const timeUntilRefresh = Math.max(0, (20 * 60 * 1000) - (Date.now() - gameState.lastTradingRefresh));
  const minutesLeft = Math.floor(timeUntilRefresh / 60000);
  const secondsLeft = Math.floor((timeUntilRefresh % 60000) / 1000);

  const currentTrader = getCurrentTrader(Date.now());

  const sellableItems = gameState.inventory.filter(item => 
    item.quantity > 0 && 
    !gameState.squad.some(member => 
      member.equipment.weapon === item.id || member.equipment.armor === item.id || member.equipment.accessory === item.id
    )
  );

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'uncommon': return 'border-gray-400 bg-gray-500/10';
      case 'common': return 'border-green-400 bg-green-500/10';
      case 'rare': return 'border-blue-400 bg-blue-500/10';
      case 'relic': return 'border-purple-400 bg-purple-500/10';
      default: return 'border-gray-400 bg-gray-500/10';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'weapon': return '⚔️';
      case 'armor': return '🛡️';
      case 'consumable': return '💊';
      case 'material': return '🔧';
      case 'accessory': return '✨';
      default: return '📦';
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* Header with Current Trader */}
      <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-amber-500/20">
        <h2 className="text-xl font-bold text-amber-400 mb-2">Trading Post</h2>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{currentTrader.avatar}</span>
            <div>
              <p className="text-white font-medium">{currentTrader.name}</p>
              <p className="text-gray-400 text-sm">{currentTrader.description}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">Vendor Caps</p>
            <p className="text-amber-400 font-bold">{gameState.vendorCaps}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2">
        <button
          onClick={() => setActiveTab('buy')}
          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
            activeTab === 'buy'
              ? 'bg-green-600 text-white'
              : 'bg-black/40 text-gray-400 hover:text-white'
          }`}
        >
          <ShoppingCart className="inline mr-2" size={16} />
          Buy Items
        </button>
        <button
          onClick={() => setActiveTab('sell')}
          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
            activeTab === 'sell'
              ? 'bg-red-600 text-white'
              : 'bg-black/40 text-gray-400 hover:text-white'
          }`}
        >
          <DollarSign className="inline mr-2" size={16} />
          Sell Items
        </button>
      </div>

      {/* Buy Tab */}
      {activeTab === 'buy' && (
        <>
          {/* Refresh Button */}
          <div className="flex justify-between items-center">
            <p className="text-gray-400 text-sm">
              {canRefresh ? 'Trader rotates every 20 minutes' : `Next trader in ${minutesLeft}:${secondsLeft.toString().padStart(2, '0')}`}
            </p>
            <button
              onClick={refreshTrading}
              disabled={!canRefresh}
              className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed p-2 rounded-lg text-white transition-all"
            >
              <RefreshCw size={16} />
            </button>
          </div>

          {/* Items for Sale */}
          <div className="space-y-3">
            {gameState.tradingInventory.map((item) => (
              <div
                key={item.id}
                className={`rounded-xl p-4 border-2 ${getRarityColor(item.rarity)} transition-all hover:scale-[1.02]`}
              >
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">{item.icon || getTypeIcon(item.type)}</div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="text-white font-semibold">{item.name}</h4>
                      <span className={`text-xs px-2 py-1 rounded capitalize ${getRarityColor(item.rarity)}`}>
                        {item.rarity}
                      </span>
                      <span className="text-gray-400 text-sm">Stock: {item.stock || item.quantity}</span>
                    </div>
                    
                    <p className="text-gray-400 text-sm mb-2">{item.description}</p>
                    
                    {item.stats && (
                      <div className="flex space-x-4 mb-2">
                        {Object.entries(item.stats).map(([stat, value]) => (
                          <div key={stat} className="text-xs">
                            <span className="text-gray-400 capitalize">{stat}: </span>
                            <span className="text-amber-400 font-bold">{value}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="text-right">
                        <p className="text-lg font-bold text-amber-400">
                          {item.price || item.value} {item.currency === 'caps' ? '💰' : '🔧'}
                        </p>
                      </div>
                      
                      <button 
                        onClick={() => buyItem(item)}
                        disabled={gameState[item.currency || 'caps'] < (item.price || item.value)}
                        className="bg-green-600 hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed px-4 py-2 rounded-lg text-white font-medium transition-all"
                      >
                        Buy
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Sell Tab */}
      {activeTab === 'sell' && (
        <div className="space-y-3">
          {sellableItems.length === 0 ? (
            <div className="text-center py-8">
              <Package className="mx-auto text-gray-400 mb-2" size={48} />
              <p className="text-gray-400">No items to sell</p>
            </div>
          ) : (
            sellableItems.map((item) => (
              <div
                key={item.id}
                className={`rounded-xl p-4 border-2 ${getRarityColor(item.rarity)} transition-all hover:scale-[1.02]`}
              >
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">{getTypeIcon(item.type)}</div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="text-white font-semibold">{item.name}</h4>
                      <span className={`text-xs px-2 py-1 rounded capitalize ${getRarityColor(item.rarity)}`}>
                        {item.rarity}
                      </span>
                      <span className="text-gray-400 text-sm">x{item.quantity}</span>
                    </div>
                    
                    <p className="text-gray-400 text-sm mb-2">{item.description}</p>
                    
                    {item.stats && (
                      <div className="flex space-x-4 mb-2">
                        {Object.entries(item.stats).map(([stat, value]) => (
                          <div key={stat} className="text-xs">
                            <span className="text-gray-400 capitalize">{stat}: </span>
                            <span className="text-amber-400 font-bold">{value}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="text-right">
                        <p className="text-lg font-bold text-amber-400">
                          {Math.floor(item.value * 0.5)} 💰
                        </p>
                        <p className="text-xs text-gray-400">50% of value</p>
                      </div>
                      
                      <button 
                        onClick={() => sellItem(item.id, 1)}
                        disabled={gameState.vendorCaps < Math.floor(item.value * 0.5)}
                        className="bg-red-600 hover:bg-red-500 disabled:bg-gray-600 disabled:cursor-not-allowed px-4 py-2 rounded-lg text-white font-medium transition-all"
                      >
                        Sell
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {gameState.tradingInventory.length === 0 && activeTab === 'buy' && (
        <div className="text-center py-8">
          <Package className="mx-auto text-gray-400 mb-2" size={48} />
          <p className="text-gray-400">No items available</p>
          <p className="text-gray-500 text-sm">Wait for trader rotation</p>
        </div>
      )}
    </div>
  );
};
