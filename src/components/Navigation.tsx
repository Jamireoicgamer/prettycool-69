
import React, { useState } from 'react';
import { Home, ShoppingCart, Package, Sword, Radio, Settings, Users, Activity, Monitor, ChevronDown, User } from 'lucide-react';
import { useGame } from '@/context/GameContext';

interface NavigationProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeSection, setActiveSection }) => {
  const { gameState, updateUISettings } = useGame();
  const [showSettings, setShowSettings] = useState(false);

  const navItems = [
    { id: 'base', icon: Home, label: 'Base' },
    { id: 'character', icon: User, label: 'Character' },
    { id: 'squad', icon: Users, label: 'Squad' },
    { id: 'trading', icon: ShoppingCart, label: 'Trade' },
    { id: 'inventory', icon: Package, label: 'Items' },
    { id: 'combat', icon: Sword, label: 'Combat' },
    { id: 'operations', icon: Radio, label: 'Ops' },
    { id: 'status', icon: Activity, label: 'Status' },
    { id: 'terminal', icon: Monitor, label: 'Terminal' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  const getButtonStyle = () => {
    const baseStyle = "flex flex-col items-center space-y-1 p-3 rounded-xl transition-all min-w-[70px] font-medium";
    
    // Handle button position settings
    if (gameState.uiSettings.buttonPosition === 'bottom') {
      return `${baseStyle} min-h-[60px] text-xs`;
    }
    
    return `${baseStyle} min-h-[65px] text-sm`; // Default for top
  };

  const containerStyle = gameState.uiSettings.buttonPosition === 'bottom' 
    ? "fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm border-t border-amber-500/30 p-3 z-50"
    : "bg-black/60 backdrop-blur-sm border-b border-amber-500/30 p-2";

  return (
    <>
      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-black/90 border border-amber-500/30 rounded-xl p-6 max-w-sm w-full">
            <h3 className="text-amber-400 font-bold text-lg mb-4">Navigation Settings</h3>
            
            <div className="space-y-3">
              <label className="text-white text-sm font-medium">Button Position</label>
              <div className="space-y-2">
                {[
                  { value: 'top', label: 'Top (Default)' },
                  { value: 'bottom', label: 'Bottom (Mobile Friendly)' }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => updateUISettings({ buttonPosition: option.value as 'top' | 'bottom' })}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      gameState.uiSettings.buttonPosition === option.value
                        ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                        : 'border-gray-500/30 bg-black/40 text-gray-400 hover:border-gray-400'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            
            <button
              onClick={() => setShowSettings(false)}
              className="w-full mt-6 bg-amber-600 hover:bg-amber-500 p-3 rounded-lg text-white font-medium transition-all"
            >
              Apply Settings
            </button>
          </div>
        </div>
      )}

      <div className={containerStyle}>
        <div className="flex justify-around overflow-x-auto gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'settings') {
                    setShowSettings(true);
                  } else {
                    setActiveSection(item.id);
                  }
                }}
                className={`${getButtonStyle()} ${
                  isActive 
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                    : 'text-gray-400 hover:text-white hover:bg-white/10 border border-transparent'
                }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Add bottom padding when nav is at bottom */}
      {gameState.uiSettings.buttonPosition === 'bottom' && (
        <div className="h-20"></div>
      )}
    </>
  );
};
