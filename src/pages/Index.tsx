
import React, { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { BaseHub } from '@/components/base/BaseHub';
import { TradingPost } from '@/components/trading/TradingPost';
import { Inventory } from '@/components/inventory/Inventory';
import { Combat } from '@/components/combat/Combat';
import { Operations } from '@/components/operations/Operations';
import { Settings } from '@/components/settings/Settings';
import { SquadManagement } from '@/components/squad/SquadManagement';
import { Status } from '@/components/status/Status';
import { Terminal } from '@/components/terminal/Terminal';
import { CharacterSheet } from '@/components/player/CharacterSheet';
import { NotificationSystem } from '@/components/notifications/NotificationSystem';
import { PowerManagement } from '@/components/base/PowerManagement';
import { LoginScreen } from '@/components/auth/LoginScreen';
import { PlayerCharacterPage } from '@/components/player/PlayerCharacterPage';
import { useGame } from '@/context/GameContext';
import { Shield, Flame, Coins, Droplets, Soup, Atom, Wrench, Zap, Settings as SettingsIcon } from 'lucide-react';

const GameContent = () => {
  const [activeSection, setActiveSection] = useState('base');
  const [showPowerManagement, setShowPowerManagement] = useState(false);
  const { gameState } = useGame();

  // ============ REAL-TIME POWER CALCULATION ============
  const [realTimePower, setRealTimePower] = useState({
    generation: 0,
    consumption: 0,
    efficiency: 100
  });

  useEffect(() => {
    const calculateRealTimePower = () => {
      const totalGeneration = gameState.fusionCores
        .filter(core => core.isActive && core.currentCharge > 0)
        .reduce((sum, core) => sum + 100, 0); // Each core produces 100 units

      const totalConsumption = gameState.baseModules
        .filter(module => module.isActive)
        .reduce((sum, module) => sum + (module.energyCost || 0), 0);

      const efficiency = totalConsumption > 0 
        ? Math.min(100, (totalGeneration / totalConsumption) * 100)
        : 100;

      setRealTimePower({
        generation: totalGeneration,
        consumption: totalConsumption,
        efficiency: efficiency
      });
    };

    calculateRealTimePower();
    const interval = setInterval(calculateRealTimePower, 1000);
    return () => clearInterval(interval);
  }, [gameState.fusionCores, gameState.baseModules]);

  // ============ SECTION RENDERING ============
  const renderActiveSection = () => {
    switch (activeSection) {
      case 'base':
        return <BaseHub />;
      case 'character':
        return <CharacterSheet />;
      case 'trading':
        return <TradingPost />;
      case 'inventory':
        return <Inventory />;
      case 'combat':
        return <Combat />;
      case 'operations':
        return <Operations />;
      case 'squad':
        return <SquadManagement />;
      case 'status':
        return <Status />;
      case 'terminal':
        return <Terminal />;
      case 'settings':
        return <Settings />;
      default:
        return <BaseHub />;
    }
  };

  const getContentPadding = () => {
    if (gameState.uiSettings.buttonPosition === 'bottom') {
      return 'pb-24';
    }
    return '';
  };

  // ============ UI HELPER FUNCTIONS ============
  const getPowerEfficiencyColor = () => {
    if (realTimePower.efficiency >= 80) return 'bg-green-500';
    if (realTimePower.efficiency >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getPowerStatusText = () => {
    if (realTimePower.generation > realTimePower.consumption) return 'ONLINE';
    if (realTimePower.generation === realTimePower.consumption) return 'BALANCED';
    return 'CRITICAL';
  };

  const getPowerStatusColor = () => {
    if (realTimePower.generation > realTimePower.consumption) return 'text-green-400';
    if (realTimePower.generation === realTimePower.consumption) return 'text-yellow-400';
    return 'text-red-400';
  };

  const activeCores = gameState.fusionCores.filter(core => core.isActive && core.currentCharge > 0);

  // ============ MODERNIZED GAME HEADER SECTION ============
  return (
    <div 
      className="min-h-screen text-white relative overflow-hidden"
    >
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="fixed top-0 left-0 w-full h-full object-cover z-0 opacity-20"
        onError={(e) => {
          console.error('Video failed to load:', e);
          // Hide the video element on error
          e.currentTarget.style.display = 'none';
        }}
        onLoadStart={() => console.log('Video started loading')}
        onCanPlay={() => console.log('Video can play')}
      >
        <source src="https://assets.fallout.tv/fallout-bg-video.mp4" type="video/mp4" />
      </video>
      
      {/* Fallback background image if video fails */}
      <div 
        className="fixed top-0 left-0 w-full h-full z-0 opacity-30"
        style={{
          backgroundImage: 'url("/lovable-uploads/8ee0e910-ff57-43a3-aa8e-968fc6da5e01.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />
      
      {/* Enhanced dark overlay for better text readability */}
      <div className="fixed top-0 left-0 w-full h-full bg-black/70 z-10"></div>

      <div className="max-w-md mx-auto min-h-screen flex flex-col relative z-20">
        {/* ============ NAVIGATION ============ */}
        {gameState.uiSettings.buttonPosition !== 'bottom' && (
          <Navigation activeSection={activeSection} setActiveSection={setActiveSection} />
        )}

        {/* === ENHANCED FALLOUT SCRAPLINE HEADER === */}
        <div className="relative mb-3 mt-3">
          <div className="absolute inset-0 z-0 pointer-events-none">
            <div className="w-full h-full bg-black/80 backdrop-blur-xl rounded-2xl border-2 border-amber-500/50 shadow-2xl"></div>
          </div>
          
          <div className="relative z-10 p-4 rounded-2xl">
            {/* Enhanced logo section */}
            <div className="flex items-center gap-4 mb-4">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-2xl border-2 border-amber-300/70 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent"></div>
                  <Shield className="w-8 h-8 text-black/90 relative z-10 drop-shadow-xl" />
                  <div className="absolute top-2 right-2 w-2.5 h-2.5 bg-amber-200 rounded-full animate-pulse shadow-xl"></div>
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                </div>
              </div>
              
              <div className="flex-1">
                <h1 className="text-2xl font-black text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)] tracking-tight leading-tight mb-1">
                  <span className="bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300 bg-clip-text text-transparent filter drop-shadow-lg">
                    FALLOUT: SCRAPLINE
                  </span>
                </h1>
                <p className="text-xs text-amber-300 font-black tracking-widest uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] opacity-90">
                  WASTELAND COMMAND CENTER
                </p>
              </div>
              
              <div className="flex gap-2 text-xs">
                <span className="bg-amber-500/40 border-2 border-amber-400/60 rounded-xl px-3 py-1.5 text-amber-100 font-bold backdrop-blur-sm shadow-xl">
                  {gameState.username}
                </span>
                <span className="bg-orange-500/40 border-2 border-orange-400/60 rounded-xl px-3 py-1.5 text-orange-100 font-bold backdrop-blur-sm shadow-xl">
                  Lv.{gameState.commanderLevel}
                </span>
              </div>
            </div>
            
            {/* Enhanced resource grid with better spacing and effects */}
            <div className="grid grid-cols-6 gap-2">
              <div className="bg-black/50 backdrop-blur-sm border-2 border-amber-500/40 rounded-xl p-2.5 text-center group hover:bg-black/70 hover:border-amber-400/60 transition-all duration-300 shadow-xl">
                <Coins className="w-4 h-4 text-amber-400 mx-auto mb-1 drop-shadow-lg group-hover:scale-110 transition-transform" />
                <div className="text-amber-200 font-black text-sm drop-shadow-lg">{gameState.caps}</div>
                <div className="text-amber-200/90 text-[9px] font-bold tracking-wide">CAPS</div>
              </div>
              
              <div className="bg-black/50 backdrop-blur-sm border-2 border-blue-500/40 rounded-xl p-2.5 text-center group hover:bg-black/70 hover:border-blue-400/60 transition-all duration-300 shadow-xl">
                <Wrench className="w-4 h-4 text-blue-400 mx-auto mb-1 drop-shadow-lg group-hover:scale-110 transition-transform" />
                <div className="text-blue-200 font-black text-sm drop-shadow-lg">{gameState.scrip}</div>
                <div className="text-blue-200/90 text-[9px] font-bold tracking-wide">SCRIP</div>
              </div>
              
              <div className="bg-black/50 backdrop-blur-sm border-2 border-purple-500/40 rounded-xl p-2.5 text-center group hover:bg-black/70 hover:border-purple-400/60 transition-all duration-300 shadow-xl">
                <Atom className="w-4 h-4 text-purple-400 mx-auto mb-1 drop-shadow-lg group-hover:scale-110 transition-transform" />
                <div className="text-purple-200 font-black text-sm drop-shadow-lg">{gameState.nuclearFuel}</div>
                <div className="text-purple-200/90 text-[9px] font-bold tracking-wide">FUEL</div>
              </div>
              
              <div className="bg-black/50 backdrop-blur-sm border-2 border-green-500/40 rounded-xl p-2.5 text-center group hover:bg-black/70 hover:border-green-400/60 transition-all duration-300 shadow-xl">
                <Soup className="w-4 h-4 text-green-400 mx-auto mb-1 drop-shadow-lg group-hover:scale-110 transition-transform" />
                <div className="text-green-200 font-black text-sm drop-shadow-lg">{gameState.food}</div>
                <div className="text-green-200/90 text-[9px] font-bold tracking-wide">FOOD</div>
              </div>
              
              <div className="bg-black/50 backdrop-blur-sm border-2 border-cyan-500/40 rounded-xl p-2.5 text-center group hover:bg-black/70 hover:border-cyan-400/60 transition-all duration-300 shadow-xl">
                <Droplets className="w-4 h-4 text-cyan-400 mx-auto mb-1 drop-shadow-lg group-hover:scale-110 transition-transform" />
                <div className="text-cyan-200 font-black text-sm drop-shadow-lg">{gameState.water}</div>
                <div className="text-cyan-200/90 text-[9px] font-bold tracking-wide">WATER</div>
              </div>
              
              <div className="bg-black/50 backdrop-blur-sm border-2 border-orange-500/40 rounded-xl p-2.5 text-center group hover:bg-black/70 hover:border-orange-400/60 transition-all duration-300 shadow-xl">
                <Flame className="w-4 h-4 text-orange-400 mx-auto mb-1 drop-shadow-lg group-hover:scale-110 transition-transform" />
                <div className="text-orange-200 font-black text-sm drop-shadow-lg">{gameState.techFrags}</div>
                <div className="text-orange-200/90 text-[9px] font-bold tracking-wide">TECH</div>
              </div>
            </div>
          </div>
        </div>

        {/* ============ ENHANCED BASE POWER SECTION - Only show on base tab ============ */}
        {activeSection === 'base' && (
          <div className="relative mb-3">
            <div className="absolute inset-0 z-0 pointer-events-none">
              <div className="w-full h-full bg-black/80 backdrop-blur-xl rounded-2xl border-2 border-yellow-500/50 shadow-2xl"></div>
            </div>

            <div className="relative z-10 p-4 rounded-2xl">
            {/* Enhanced power header with integrated management button */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-2xl border-2 border-yellow-300/70 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent"></div>
                  <Zap className="w-6 h-6 text-black/90 drop-shadow-xl relative z-10" />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                </div>
                <div>
                  <h2 className="text-lg text-white font-black drop-shadow-[0_3px_6px_rgba(0,0,0,0.9)] tracking-wide">
                    BASE POWER GRID
                  </h2>
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full shadow-lg ${
                      realTimePower.generation > realTimePower.consumption ? 'bg-green-400 animate-pulse' : 
                      realTimePower.generation === realTimePower.consumption ? 'bg-yellow-400' : 'bg-red-400 animate-bounce'
                    }`}></div>
                    <span className={`text-sm font-black tracking-wider drop-shadow-lg ${getPowerStatusColor()}`}>
                      {getPowerStatusText()}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-yellow-200 font-mono text-sm font-bold drop-shadow-lg">
                    {realTimePower.generation}/{realTimePower.consumption}
                  </div>
                  <div className="text-yellow-300/80 text-xs font-bold">
                    UNITS
                  </div>
                </div>
                <button
                  onClick={() => setShowPowerManagement(true)}
                  className="bg-yellow-600/80 hover:bg-yellow-500 border-2 border-yellow-400/50 hover:border-yellow-300/70 p-2.5 rounded-xl text-white transition-all backdrop-blur-sm shadow-xl hover:shadow-2xl group"
                >
                  <SettingsIcon size={16} className="group-hover:rotate-90 transition-transform duration-300" />
                </button>
              </div>
            </div>

            {/* Enhanced power efficiency bar */}
            <div className="relative w-full bg-black/60 rounded-full h-4 overflow-hidden border-2 border-gray-500/50 mb-4 shadow-inner">
              <div className="absolute inset-0 bg-gradient-to-r from-gray-800 to-gray-700"></div>
              <div 
                className={`relative h-full rounded-full transition-all duration-1000 shadow-lg ${
                  realTimePower.efficiency >= 80 ? 'bg-gradient-to-r from-green-400 via-emerald-400 to-green-500' :
                  realTimePower.efficiency >= 50 ? 'bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-500' :
                  'bg-gradient-to-r from-red-400 via-orange-400 to-red-500'
                }`}
                style={{ width: `${realTimePower.efficiency}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/30 via-white/10 to-white/30 rounded-full"></div>
                {realTimePower.efficiency >= 80 && (
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                    <div className="w-1.5 h-1.5 bg-white/90 rounded-full animate-ping"></div>
                  </div>
                )}
              </div>
            </div>

            {/* Enhanced power statistics grid */}
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="text-center bg-black/50 rounded-xl p-3 border-2 border-gray-500/40 hover:border-gray-400/60 transition-all shadow-lg">
                <p className="text-gray-300 font-bold tracking-wide mb-1">FUSION CORES</p>
                <p className="text-green-400 font-black text-base drop-shadow-lg">
                  {activeCores.length}/{gameState.fusionCores.length}
                </p>
                <p className="text-gray-400 text-[10px] font-medium">ACTIVE</p>
              </div>
              <div className="text-center bg-black/50 rounded-xl p-3 border-2 border-gray-500/40 hover:border-gray-400/60 transition-all shadow-lg">
                <p className="text-gray-300 font-bold tracking-wide mb-1">EFFICIENCY</p>
                <p className={`font-black text-base drop-shadow-lg ${
                  realTimePower.efficiency >= 80 ? 'text-green-400' : 
                  realTimePower.efficiency >= 50 ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {realTimePower.efficiency.toFixed(0)}%
                </p>
                <p className="text-gray-400 text-[10px] font-medium">OPTIMAL</p>
              </div>
              <div className="text-center bg-black/50 rounded-xl p-3 border-2 border-gray-500/40 hover:border-gray-400/60 transition-all shadow-lg">
                <p className="text-gray-300 font-bold tracking-wide mb-1">NET POWER</p>
                <p className={`font-black text-base drop-shadow-lg ${
                  realTimePower.generation > realTimePower.consumption ? 'text-green-400' : 
                  realTimePower.generation === realTimePower.consumption ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {realTimePower.generation > realTimePower.consumption ? '+' : ''}
                  {realTimePower.generation - realTimePower.consumption}
                </p>
                <p className="text-gray-400 text-[10px] font-medium">SURPLUS</p>
              </div>
            </div>
          </div>
        </div>
        )}

        {/* ============ MAIN CONTENT ============ */}
        <div className={`flex-1 overflow-y-auto ${getContentPadding()}`}>
          {renderActiveSection()}
        </div>

        {/* ============ BOTTOM NAVIGATION ============ */}
        {gameState.uiSettings.buttonPosition === 'bottom' && (
          <Navigation activeSection={activeSection} setActiveSection={setActiveSection} />
        )}
      </div>

      {/* ============ NOTIFICATION SYSTEM ============ */}
      <NotificationSystem />

      {/* ============ POWER MANAGEMENT MODAL ============ */}
      {showPowerManagement && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-black/95 border-2 border-yellow-500/50 rounded-3xl max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-yellow-400/30">
              <h3 className="text-yellow-300 font-black text-2xl">Power Grid Management</h3>
              <button
                onClick={() => setShowPowerManagement(false)}
                className="text-gray-400 hover:text-white text-2xl font-bold"
              >
                ✕
              </button>
            </div>
            <PowerManagement />
          </div>
        </div>
      )}
    </div>
  );
};

const Index = () => {
  return (
    <GameWrapper />
  );
};

const GameWrapper = () => {
  const { gameState } = useGame();

  if (!gameState.isLoggedIn) {
    return <LoginScreen />;
  }

  // Force character creation if no character exists
  if (!gameState.playerCharacter) {
    return <PlayerCharacterPage />;
  }

  return <GameContent />;
};

export default Index;
