
import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { Battery, Plus, Minus, Power, Zap, AlertTriangle, TrendingUp, Settings, Activity } from 'lucide-react';

export const PowerManagement = () => {
  const { gameState, manageFusionCores, spendCurrency, addNotification } = useGame();
  const [showAddCore, setShowAddCore] = useState(false);

  // ============ POWER CALCULATIONS ============
  // Each fusion core produces 100 power units when active and charged
  const totalPowerGeneration = gameState.fusionCores
    .filter(core => core.isActive && core.currentCharge > 0)
    .reduce((sum, core) => sum + 100, 0);

  const totalPowerConsumption = gameState.baseModules
    .filter(module => module.isActive)
    .reduce((sum, module) => sum + (module.energyCost || 0), 0);

  const netPower = totalPowerGeneration - totalPowerConsumption;
  const powerEfficiency = totalPowerConsumption > 0 
    ? Math.min(100, (totalPowerGeneration / totalPowerConsumption) * 100)
    : 100;

  // ============ CORE MANAGEMENT FUNCTIONS ============
  const addFusionCore = () => {
    const cost = 200 + (gameState.fusionCores.length * 50);
    if (gameState.caps < cost) {
      addNotification({
        id: `power-error-${Date.now()}`,
        type: 'error',
        title: 'Insufficient Funds',
        message: `Need ${cost} caps to purchase fusion core`,
        priority: 'medium'
      });
      return;
    }
    
    if (spendCurrency('caps', cost)) {
      manageFusionCores('add');
      addNotification({
        id: `power-success-${Date.now()}`,
        type: 'success',
        title: 'Fusion Core Added',
        message: 'New fusion core installed successfully',
        priority: 'low'
      });
      setShowAddCore(false);
    }
  };

  const buyCoreFromInventory = () => {
    const fusionCoreItem = gameState.inventory.find(item => item.id === 'fusion-core');
    if (!fusionCoreItem || fusionCoreItem.quantity <= 0) {
      addNotification({
        id: `power-error-${Date.now()}`,
        type: 'error',
        title: 'No Cores Available',
        message: 'No fusion cores in inventory',
        priority: 'medium'
      });
      return;
    }
    
    manageFusionCores('add');
    addNotification({
      id: `power-success-${Date.now()}`,
      type: 'success',
      title: 'Fusion Core Installed',
      message: 'Fusion core from inventory installed',
      priority: 'low'
    });
    setShowAddCore(false);
  };

  // ============ UI HELPER FUNCTIONS ============
  const getPowerStatusColor = () => {
    if (powerEfficiency >= 80) return 'from-green-500 to-emerald-400';
    if (powerEfficiency >= 50) return 'from-yellow-500 to-amber-400';
    return 'from-red-500 to-rose-400';
  };

  const getCoreStatusColor = (core: any) => {
    if (!core.isActive) return 'from-gray-600 to-gray-700';
    if (core.currentCharge > core.maxCharge * 0.5) return 'from-green-600 to-green-500';
    if (core.currentCharge > core.maxCharge * 0.2) return 'from-yellow-600 to-yellow-500';
    return 'from-red-600 to-red-500';
  };

  return (
    <div className="space-y-6 p-4">
      {/* ============ MAIN POWER OVERVIEW ============ */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl rounded-3xl p-8 border border-yellow-500/30 shadow-2xl">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 animate-pulse"></div>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-3xl font-bold text-yellow-400 flex items-center">
              <Power className="mr-4 animate-pulse" size={32} />
              Power Grid Status
            </h3>
            <div className="flex items-center space-x-3 text-sm">
              <div className={`w-4 h-4 rounded-full ${netPower > 0 ? 'bg-green-400 animate-pulse' : 'bg-red-400 animate-bounce'}`}></div>
              <span className="text-gray-300 font-medium">
                {netPower > 0 ? 'ONLINE' : 'CRITICAL'}
              </span>
            </div>
          </div>

          {/* ============ POWER METRICS GRID ============ */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Generation Metric */}
            <div className="group bg-gradient-to-br from-green-900/40 to-green-800/40 rounded-2xl p-6 border border-green-500/30 hover:border-green-400/50 transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between mb-4">
                <span className="text-green-300 text-sm font-medium">GENERATION</span>
                <TrendingUp className="text-green-400 group-hover:animate-bounce" size={20} />
              </div>
              <div className="text-4xl font-bold text-green-400 mb-2 animate-fade-in">
                {totalPowerGeneration}
              </div>
              <div className="text-xs text-green-500/80 uppercase tracking-wide">Power Units</div>
            </div>
            
            {/* Consumption Metric */}
            <div className="group bg-gradient-to-br from-red-900/40 to-red-800/40 rounded-2xl p-6 border border-red-500/30 hover:border-red-400/50 transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between mb-4">
                <span className="text-red-300 text-sm font-medium">CONSUMPTION</span>
                <Settings className="text-red-400 group-hover:animate-spin" size={20} />
              </div>
              <div className="text-4xl font-bold text-red-400 mb-2 animate-fade-in">
                {totalPowerConsumption}
              </div>
              <div className="text-xs text-red-500/80 uppercase tracking-wide">Power Units</div>
            </div>

            {/* Net Power Metric */}
            <div className={`group bg-gradient-to-br ${netPower > 0 ? 'from-blue-900/40 to-blue-800/40' : 'from-orange-900/40 to-orange-800/40'} rounded-2xl p-6 border ${netPower > 0 ? 'border-blue-500/30 hover:border-blue-400/50' : 'border-orange-500/30 hover:border-orange-400/50'} transition-all duration-300 hover:scale-105`}>
              <div className="flex items-center justify-between mb-4">
                <span className={`text-sm font-medium ${netPower > 0 ? 'text-blue-300' : 'text-orange-300'}`}>NET POWER</span>
                <Activity className={`${netPower > 0 ? 'text-blue-400' : 'text-orange-400'} group-hover:animate-pulse`} size={20} />
              </div>
              <div className={`text-4xl font-bold mb-2 animate-fade-in ${netPower > 0 ? 'text-blue-400' : 'text-orange-400'}`}>
                {netPower > 0 ? '+' : ''}{netPower}
              </div>
              <div className={`text-xs uppercase tracking-wide ${netPower > 0 ? 'text-blue-500/80' : 'text-orange-500/80'}`}>
                Power Units
              </div>
            </div>
          </div>

          {/* ============ ENHANCED EFFICIENCY BAR ============ */}
          <div className="mb-8">
            <div className="flex items-center justify-between text-sm mb-4">
              <span className="text-gray-300 font-medium">System Efficiency</span>
              <span className={`font-bold text-2xl ${
                powerEfficiency >= 80 ? 'text-green-400' : 
                powerEfficiency >= 50 ? 'text-yellow-400' : 'text-red-400'
              } animate-pulse`}>
                {powerEfficiency.toFixed(1)}%
              </span>
            </div>
            <div className="relative w-full bg-gray-800/50 rounded-full h-6 overflow-hidden border border-gray-600/30">
              <div className="absolute inset-0 bg-gradient-to-r from-gray-700 to-gray-600"></div>
              <div 
                className={`relative h-full rounded-full transition-all duration-1000 ease-out bg-gradient-to-r ${getPowerStatusColor()} shadow-lg animate-fade-in`}
                style={{ width: `${Math.min(100, powerEfficiency)}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                  <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                </div>
              </div>
            </div>
          </div>

          {/* ============ CRITICAL WARNING ============ */}
          {powerEfficiency < 50 && (
            <div className="bg-gradient-to-r from-red-900/60 to-orange-900/60 border-2 border-red-500/50 rounded-2xl p-6 mb-6 animate-pulse">
              <div className="flex items-center space-x-4">
                <AlertTriangle className="text-red-400 animate-bounce" size={28} />
                <div>
                  <p className="text-red-300 font-bold text-lg">⚠️ POWER GRID CRITICAL</p>
                  <p className="text-red-400 text-sm mt-2">
                    Multiple systems failing. Install fusion cores immediately or risk total system shutdown.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ============ FUSION CORE MANAGEMENT ============ */}
      <div className="bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl rounded-3xl p-8 border border-blue-500/30 shadow-2xl">
        <div className="flex items-center justify-between mb-8">
          <h4 className="text-2xl font-bold text-blue-400 flex items-center">
            <Battery className="mr-4 animate-pulse" size={28} />
            Fusion Core Management
            <span className="ml-3 text-lg text-gray-400">({gameState.fusionCores.length} Installed)</span>
          </h4>
          <button
            onClick={() => setShowAddCore(true)}
            className="group bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 p-4 rounded-2xl text-white transition-all shadow-lg hover:shadow-blue-500/25 hover:scale-105"
          >
            <Plus size={20} className="group-hover:animate-spin" />
          </button>
        </div>

        {/* ============ CORE GRID ============ */}
        <div className="grid gap-6">
          {gameState.fusionCores.map((core, index) => (
            <div
              key={core.id}
              className={`relative overflow-hidden p-6 rounded-2xl border-2 transition-all duration-500 hover:scale-102 ${
                core.isActive 
                  ? 'border-green-500/50 bg-gradient-to-r from-green-900/20 to-blue-900/20 shadow-green-500/20' 
                  : 'border-gray-500/30 bg-gradient-to-r from-gray-900/20 to-gray-800/20'
              }`}
            >
              {/* Core Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className={`relative w-4 h-4 rounded-full ${core.isActive ? 'bg-green-400' : 'bg-gray-500'}`}>
                    {core.isActive && (
                      <div className="absolute inset-0 bg-green-400 rounded-full animate-ping"></div>
                    )}
                  </div>
                  <span className="text-white font-bold text-lg">
                    Fusion Core #{index + 1}
                  </span>
                  {core.isActive && (
                    <span className="bg-green-500/20 text-green-400 text-xs px-3 py-1 rounded-full font-medium animate-pulse">
                      ACTIVE
                    </span>
                  )}
                </div>
                
                {/* Core Control Buttons */}
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => {
                      manageFusionCores(core.isActive ? 'deactivate' : 'activate', core.id);
                      addNotification({
                        id: `core-toggle-${Date.now()}`,
                        type: 'success',
                        title: 'Core Status Changed',
                        message: `Core ${index + 1} ${core.isActive ? 'deactivated' : 'activated'}`,
                        priority: 'low'
                      });
                    }}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105 ${
                      core.isActive 
                        ? 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white shadow-red-500/25' 
                        : 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white shadow-green-500/25'
                    }`}
                  >
                    {core.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => {
                      manageFusionCores('remove', core.id);
                      addNotification({
                        id: `core-remove-${Date.now()}`,
                        type: 'success',
                        title: 'Core Removed',
                        message: `Fusion core ${index + 1} safely removed`,
                        priority: 'low'
                      });
                    }}
                    className="bg-gradient-to-r from-gray-600 to-gray-500 hover:from-gray-500 hover:to-gray-400 p-3 rounded-xl text-white transition-all hover:scale-105 shadow-gray-500/25"
                  >
                    <Minus size={16} />
                  </button>
                </div>
              </div>

              {/* ============ ENHANCED CORE STATS ============ */}
              <div className="grid grid-cols-3 gap-6 mb-6">
                <div className="text-center bg-black/20 rounded-xl p-4">
                  <p className="text-xs text-gray-400 mb-2">CHARGE LEVEL</p>
                  <p className="text-blue-400 font-bold text-lg">
                    {Math.floor(core.currentCharge)}/{core.maxCharge}
                  </p>
                  <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-cyan-400 h-2 rounded-full transition-all duration-1000 animate-fade-in"
                      style={{ width: `${(core.currentCharge / core.maxCharge) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="text-center bg-black/20 rounded-xl p-4">
                  <p className="text-xs text-gray-400 mb-2">EFFICIENCY</p>
                  <p className="text-green-400 font-bold text-lg">{core.efficiency}%</p>
                  <div className="flex justify-center mt-2">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  </div>
                </div>
                <div className="text-center bg-black/20 rounded-xl p-4">
                  <p className="text-xs text-gray-400 mb-2">OUTPUT</p>
                  <p className="text-yellow-400 font-bold text-lg">100</p>
                  <p className="text-xs text-yellow-500 mt-1">Power Units</p>
                </div>
              </div>

              {/* ============ ENHANCED CHARGE BAR ============ */}
              <div className="relative w-full bg-gray-800 rounded-full h-4 overflow-hidden mb-4">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ease-out bg-gradient-to-r ${
                    core.currentCharge > core.maxCharge * 0.5 ? 'from-blue-500 to-cyan-400' :
                    core.currentCharge > core.maxCharge * 0.2 ? 'from-yellow-500 to-orange-400' : 
                    'from-red-500 to-red-400'
                  } shadow-lg animate-fade-in`}
                  style={{ width: `${(core.currentCharge / core.maxCharge) * 100}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                </div>
              </div>

              {/* Runtime Estimate */}
              {core.isActive && core.currentCharge > 0 && (
                <div className="text-xs text-gray-400 flex items-center justify-center bg-black/20 rounded-lg p-2">
                  <Zap size={14} className="mr-2 text-yellow-400 animate-pulse" />
                  Estimated Runtime: {Math.floor(core.currentCharge / Math.max(1, totalPowerConsumption / 60))} minutes
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ============ NO CORES MESSAGE ============ */}
        {gameState.fusionCores.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <Battery size={80} className="mx-auto mb-6 opacity-30 animate-pulse" />
            <p className="text-xl font-medium mb-2">No Fusion Cores Installed</p>
            <p className="text-sm">Install cores to power your base systems</p>
          </div>
        )}
      </div>

      {/* ============ ENHANCED ADD CORE MODAL ============ */}
      {showAddCore && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-blue-500/40 rounded-3xl p-8 max-w-md w-full shadow-2xl animate-scale-in">
            <h3 className="text-blue-400 font-bold text-3xl mb-8 text-center">Add Fusion Core</h3>
            
            <div className="space-y-6">
              {/* Purchase New Core */}
              <div className="bg-gradient-to-br from-black/40 to-black/20 p-6 rounded-2xl border border-gray-500/30">
                <h4 className="text-white font-semibold mb-4 flex items-center">
                  <Plus className="mr-3 text-blue-400" size={20} />
                  Purchase New Core
                </h4>
                <p className="text-gray-400 text-sm mb-4">
                  Cost: <span className="text-yellow-400 font-bold text-lg">{200 + (gameState.fusionCores.length * 50)} caps</span>
                </p>
                <button
                  onClick={addFusionCore}
                  disabled={gameState.caps < (200 + (gameState.fusionCores.length * 50))}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed p-4 rounded-2xl text-white font-semibold transition-all shadow-lg hover:scale-105"
                >
                  Purchase Core
                </button>
              </div>

              {/* Use Inventory Core */}
              {gameState.inventory.find(item => item.id === 'fusion-core')?.quantity > 0 && (
                <div className="bg-gradient-to-br from-green-900/30 to-green-800/20 p-6 rounded-2xl border border-green-500/40">
                  <h4 className="text-white font-semibold mb-4 flex items-center">
                    <Battery className="mr-3 text-green-400" size={20} />
                    Use Inventory Core
                  </h4>
                  <p className="text-gray-400 text-sm mb-4">
                    Available: <span className="text-green-400 font-bold text-lg">{gameState.inventory.find(item => item.id === 'fusion-core')?.quantity} cores</span>
                  </p>
                  <button
                    onClick={buyCoreFromInventory}
                    className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 p-4 rounded-2xl text-white font-semibold transition-all shadow-lg hover:scale-105"
                  >
                    Install Core
                  </button>
                </div>
              )}
            </div>
            
            <button
              onClick={() => setShowAddCore(false)}
              className="w-full mt-8 bg-gradient-to-r from-gray-600 to-gray-500 hover:from-gray-500 hover:to-gray-400 p-4 rounded-2xl text-white font-semibold transition-all hover:scale-105"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
