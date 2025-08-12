import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { Zap, Shield, Wrench, Radio, Brain, Users, ArrowUp, Heart, Package, Wifi, Settings } from 'lucide-react';
import { PowerManagement } from './PowerManagement';

export const BaseHub = () => {
  const { gameState, toggleModule, upgradeModule, startRecruitment, startWorkerRecruitment, assignWorkerToModule, unassignWorker } = useGame();
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [showPowerManagement, setShowPowerManagement] = useState(false);

  const getModuleIcon = (type: string) => {
    switch (type) {
      case 'power': return Zap;
      case 'workshop': return Wrench;
      case 'recruitment': return Wifi;
      case 'research': return Brain;
      case 'food-production': return Package;
      case 'water-purification': return Shield;
      case 'barracks': return Users;
      default: return Zap;
    }
  };

  const getModuleColor = (type: string) => {
    switch (type) {
      case 'power': return 'from-yellow-500 to-orange-500';
      case 'workshop': return 'from-blue-500 to-cyan-500';
      case 'recruitment': return 'from-emerald-500 to-teal-500';
      case 'research': return 'from-purple-500 to-pink-500';
      case 'food-production': return 'from-green-500 to-emerald-500';
      case 'water-purification': return 'from-cyan-500 to-blue-500';
      case 'barracks': return 'from-orange-500 to-red-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getAssignedWorker = (moduleId: string) => {
    return gameState.workers.find(worker => worker.assignedModule === moduleId);
  };

  const getAvailableWorkers = () => {
    return gameState.workers.filter(worker => worker.status === 'available');
  };

  // Calculate power efficiency properly
  const activeCores = gameState.fusionCores.filter(core => core.isActive && core.currentCharge > 0);
  const fusionGeneratorLevel = gameState.baseModules.find(m => m.id === 'fusion-generator')?.level || 1;
  const powerPerCore = 100 + (fusionGeneratorLevel - 1) * 25; // Base 100 + 25 per level
  const totalPowerGeneration = activeCores.length * powerPerCore;
  
  const totalPowerConsumption = gameState.baseModules
    .filter(module => module.isActive)
    .reduce((sum, module) => sum + module.energyCost, 0);
  
  const powerEfficiency = totalPowerConsumption > 0 
    ? Math.min(100, (totalPowerGeneration / totalPowerConsumption) * 100)
    : 100;

  const getModuleEfficiency = (module: any) => {
    if (!module.isActive) return 0;
    
    // Power efficiency affects all modules
    let efficiency = powerEfficiency / 100;
    
    // Production modules need workers for full efficiency
    if (module.type === 'food-production' || module.type === 'water-purification') {
      const assignedWorker = getAssignedWorker(module.id);
      let workerBonus = assignedWorker ? 1.0 : 0.5; // 50% without worker
      
      if (assignedWorker) {
        if (module.type === 'food-production') {
          workerBonus += (assignedWorker.stats.agility * 0.05); // 5% per agility point
        } else if (module.type === 'water-purification') {
          workerBonus += (assignedWorker.stats.precipitation * 0.05); // 5% per precipitation point
        }
      }
      
      efficiency *= workerBonus;
      efficiency *= (1 + (module.level - 1) * 0.2); // 20% per level
    }
    
    return Math.min(100, efficiency * 100);
  };

  const getModuleProductionRate = (module: any) => {
    const efficiency = getModuleEfficiency(module) / 100;
    const baseRate = 1; // 1 per hour base
    return (baseRate * efficiency).toFixed(2);
  };

  const getProductionProgress = (module: any) => {
    if (!module.lastProduction || !module.isActive) return 0;
    const timeSinceLastProduction = Date.now() - module.lastProduction;
    const productionInterval = 3600000; // 1 hour in milliseconds
    const efficiency = getModuleEfficiency(module) / 100;
    const adjustedInterval = productionInterval / Math.max(0.1, efficiency);
    return Math.min(100, (timeSinceLastProduction / adjustedInterval) * 100);
  };

  const getUpgradeCost = (module: any) => {
    const baseCost = module.upgradeRequirements;
    const multiplier = Math.pow(1.5, module.level - 1);
    return {
      caps: Math.floor(baseCost.caps * multiplier),
      techFrags: Math.floor(baseCost.techFrags * multiplier),
      materials: baseCost.materials
    };
  };

  const canUpgradeModule = (module: any) => {
    if (module.level >= module.maxLevel) return false;
    const upgradeCost = getUpgradeCost(module);
    return gameState.caps >= upgradeCost.caps && gameState.techFrags >= upgradeCost.techFrags;
  };

  return (
    <div className="p-4 space-y-4">
      {/* Enhanced Base Modules */}
      <div className="space-y-4">
        {gameState.baseModules.map((module) => {
          const Icon = getModuleIcon(module.type);
          const isSelected = selectedModule === module.id;
          const moduleEfficiency = getModuleEfficiency(module);
          const hasGoodPower = powerEfficiency >= 80;
          const assignedWorker = getAssignedWorker(module.id);
          const availableWorkers = getAvailableWorkers();
          const isProductionModule = module.type === 'food-production' || module.type === 'water-purification';
          const upgradeCost = getUpgradeCost(module);
          
          return (
            <div key={module.id} className="relative overflow-hidden">
              {/* Strong background for better visibility */}
              <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="w-full h-full bg-black/60 backdrop-blur-md rounded-2xl border border-amber-400/40"></div>
              </div>
              
              <div
                onClick={() => setSelectedModule(isSelected ? null : module.id)}
                className={`relative z-10 bg-black/80 backdrop-blur-xl rounded-2xl p-6 border-2 cursor-pointer transition-all duration-300 hover:scale-102 shadow-2xl ${
                  isSelected ? 'border-amber-500/70 bg-amber-500/10' : 'border-amber-500/30 hover:border-amber-500/50'
                } ${!hasGoodPower && module.isActive ? 'opacity-75 border-red-500/40' : ''}`}
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${getModuleColor(module.type)} flex items-center justify-center shadow-xl border-2 border-white/20 ${
                    module.isActive && hasGoodPower ? 'animate-pulse' : 'opacity-60'
                  }`}>
                    <Icon className="text-white drop-shadow-lg" size={28} />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-white font-bold text-lg drop-shadow-sm">{module.name}</h3>
                      <div className="flex items-center space-x-3">
                        <span className="text-sm bg-amber-500/30 text-amber-200 px-3 py-1 rounded-full font-bold border border-amber-400/30">
                          Lv.{module.level}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleModule(module.id);
                          }}
                          className={`text-sm px-3 py-1 rounded-full transition-all font-bold border shadow-lg ${
                            module.isActive
                              ? hasGoodPower 
                                ? 'bg-green-500/30 text-green-300 border-green-400/30'
                                : 'bg-orange-500/30 text-orange-300 border-orange-400/30'
                              : 'bg-red-500/30 text-red-300 border-red-400/30'
                          }`}
                        >
                          {module.isActive 
                            ? hasGoodPower ? 'Online' : 'Low Power'
                            : 'Offline'
                          }
                        </button>
                      </div>
                    </div>
                    
                    <p className="text-gray-300 text-sm mb-3 drop-shadow-sm">{module.description}</p>
                    
                    {/* Production Info for Production Modules */}
                    {isProductionModule && module.isActive && (
                      <div className="mb-2">
                        <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                          <span>Production: {getModuleProductionRate(module)}/hour</span>
                          <span>Efficiency: {moduleEfficiency.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className="h-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-1000"
                            style={{ width: `${getProductionProgress(module)}%` }}
                          />
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {assignedWorker ? `Worker: ${assignedWorker.name}` : 'No Worker (-50% efficiency)'}
                        </div>
                      </div>
                    )}
                    
                    {/* Special info for other modules */}
                    {module.type === 'barracks' && (
                      <div className="mb-2">
                        <div className="text-xs text-gray-400">
                          Squad Capacity: {6 + (module.level - 1) * 2} slots
                        </div>
                      </div>
                    )}
                    
                    {module.type === 'power' && (
                      <div className="mb-2">
                        <div className="text-xs text-gray-400">
                          Power per Core: {powerPerCore} units
                        </div>
                      </div>
                    )}
                    
                    {!hasGoodPower && module.isActive && (
                      <p className="text-orange-300 text-sm mb-3 font-bold drop-shadow-sm">⚠️ Insufficient power - reduced efficiency</p>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-yellow-300 font-bold drop-shadow-sm">
                          Energy: {module.energyCost} Units
                        </span>
                        {module.recruitmentActive && (
                          <span className="text-sm text-blue-300 animate-pulse font-bold drop-shadow-sm">
                            🔊 Broadcasting...
                          </span>
                        )}
                      </div>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          upgradeModule(module.id);
                        }}
                        disabled={!canUpgradeModule(module)}
                        className="flex items-center space-x-2 bg-blue-600/80 hover:bg-blue-500 disabled:bg-gray-600/50 disabled:cursor-not-allowed px-4 py-2 rounded-xl text-white text-sm font-bold transition-all shadow-lg border border-blue-400/30 backdrop-blur-sm"
                      >
                        <ArrowUp size={14} />
                        <span>{module.level >= module.maxLevel ? 'Max' : 'Upgrade'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Enhanced Expanded Module Details */}
                {isSelected && (
                  <div className="mt-6 pt-6 border-t border-amber-400/30 space-y-4 animate-fade-in">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-gray-500/30">
                        <h4 className="text-white font-bold mb-3 drop-shadow-sm">
                          {module.level >= module.maxLevel ? 'Max Level Reached' : 'Upgrade Cost'}
                        </h4>
                        {module.level < module.maxLevel ? (
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Caps:</span>
                              <span className="text-yellow-400">{upgradeCost.caps}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Tech Frags:</span>
                              <span className="text-blue-400">{upgradeCost.techFrags}</span>
                            </div>
                          </div>
                        ) : (
                          <p className="text-green-400 text-sm">This module is fully upgraded!</p>
                        )}
                      </div>

                      <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-gray-500/30">
                        <h4 className="text-white font-bold mb-3 drop-shadow-sm">Module Status</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Power Draw:</span>
                            <span className={module.isActive ? 'text-red-400' : 'text-gray-500'}>
                              {module.isActive ? module.energyCost : 0} Units
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Efficiency:</span>
                            <span className={moduleEfficiency >= 80 ? 'text-green-400' : moduleEfficiency >= 50 ? 'text-yellow-400' : 'text-red-400'}>
                              {moduleEfficiency.toFixed(1)}%
                            </span>
                          </div>
                          {assignedWorker && (
                            <div className="flex justify-between">
                              <span className="text-gray-400">Worker:</span>
                              <span className="text-green-400">{assignedWorker.name}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Worker Assignment for Production Modules */}
                    {isProductionModule && (
                      <div className="bg-purple-900/20 rounded-lg p-3">
                        <h4 className="text-purple-400 font-medium mb-2">Worker Assignment</h4>
                        {assignedWorker ? (
                          <div className="flex items-center justify-between">
                            <div className="text-sm">
                              <p className="text-gray-300">Assigned: {assignedWorker.name}</p>
                              <p className="text-gray-400">
                                {module.type === 'food-production' 
                                  ? `Agility: ${assignedWorker.stats.agility} (+${(assignedWorker.stats.agility * 5).toFixed(0)}% efficiency)`
                                  : `Precipitation: ${assignedWorker.stats.precipitation} (+${(assignedWorker.stats.precipitation * 5).toFixed(0)}% efficiency)`
                                }
                              </p>
                            </div>
                            <button
                              onClick={() => unassignWorker(assignedWorker.id)}
                              className="bg-red-600 hover:bg-red-500 px-3 py-1 rounded text-white text-xs transition-all"
                            >
                              Unassign
                            </button>
                          </div>
                        ) : (
                          <div>
                            <p className="text-red-400 text-sm mb-2">
                              ⚠️ No worker assigned. Production efficiency: 50%
                            </p>
                            {availableWorkers.length > 0 ? (
                              <div className="space-y-2">
                                <p className="text-white text-sm">Available Workers:</p>
                                {availableWorkers.map(worker => (
                                  <div key={worker.id} className="flex items-center justify-between bg-black/30 p-2 rounded">
                                    <div className="text-sm">
                                      <span className="text-gray-300">{worker.name}</span>
                                      <span className="text-gray-400 ml-2">
                                        {module.type === 'food-production' 
                                          ? `Agility: ${worker.stats.agility}`
                                          : `Precipitation: ${worker.stats.precipitation}`
                                        }
                                      </span>
                                    </div>
                                    <button
                                      onClick={() => assignWorkerToModule(worker.id, module.id)}
                                      className="bg-green-600 hover:bg-green-500 px-2 py-1 rounded text-white text-xs transition-all"
                                    >
                                      Assign
                                    </button>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-red-400 text-sm">No available workers</p>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Recruitment Center */}
                    {module.id === 'recruitment-radio' && module.isActive && hasGoodPower && (
                      <div className="bg-green-900/20 rounded-lg p-3">
                        <h4 className="text-green-400 font-medium mb-2">Recruitment Center</h4>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="text-sm">
                              <p className="text-gray-300">Squad Member</p>
                              <p className="text-gray-400">Cost: {150 + (gameState.squad.length * 50)} caps</p>
                            </div>
                            <button
                              onClick={startRecruitment}
                              disabled={gameState.caps < (150 + (gameState.squad.length * 50))}
                              className="bg-green-600 hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed px-4 py-2 rounded-lg text-white font-medium transition-all"
                            >
                              Recruit
                            </button>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="text-sm">
                              <p className="text-gray-300">Worker</p>
                              <p className="text-gray-400">Cost: {200 + (gameState.workers.length * 75)} caps</p>
                            </div>
                            <button
                              onClick={startWorkerRecruitment}
                              disabled={
                                gameState.caps < (200 + (gameState.workers.length * 75)) ||
                                gameState.workers.length >= gameState.maxWorkers
                              }
                              className="bg-purple-600 hover:bg-purple-500 disabled:bg-gray-600 disabled:cursor-not-allowed px-4 py-2 rounded-lg text-white font-medium transition-all"
                            >
                              Recruit Worker
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Enhanced Power Management Modal */}
      {showPowerManagement && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-black/95 border-2 border-yellow-500/50 rounded-3xl max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between p-6 border-b border-yellow-400/30">
              <h3 className="text-yellow-300 font-black text-2xl drop-shadow-lg">Power Management</h3>
              <button
                onClick={() => setShowPowerManagement(false)}
                className="text-gray-400 hover:text-white text-2xl font-bold transition-all"
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
