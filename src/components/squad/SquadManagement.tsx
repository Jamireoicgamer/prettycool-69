import React, { useState, useEffect } from 'react';
import { useGame } from '@/context/GameContext';
import { Radio, Users, Droplets, Zap, TrendingUp, Activity, Heart, Shield, Sword, Eye, Package, Clock, Plus, Minus } from 'lucide-react';
import { calculateCombatStats } from '@/utils/CombatCalculations';
import { SquadInventory } from './SquadInventory';
import { mapCoreStats10 } from '@/utils/combat/CoreStatMapper';
import { normalizeWeaponFromItem } from '@/utils/combat/WeaponNormalizer';
import { ConsumablePicker } from './ConsumablePicker';
import { SquadPerkTree } from './SquadPerkTree';
import { GAME_ITEMS } from '@/data/GameItems';

export const SquadManagement = () => {
  const { 
    gameState, 
    equipItem, 
    unequipItem,
    useConsumable, 
    startRecruitment,
    startWorkerRecruitment,
    getModuleDetails, 
    transferItemToSquad,
    transferItemFromSquad,
    giveSquadMemberFood,
    giveSquadMemberWater,
    giveWorkerFood,
    giveWorkerWater,
    assignWorkerToModule,
    unassignWorker,
    supplyMedicalFacility,
    assignWorkerToMedical,
    recoverKnockedOutMember
  } = useGame();
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [selectedWorker, setSelectedWorker] = useState<string | null>(null);
  const [recruitmentType, setRecruitmentType] = useState<'squad' | 'worker'>('squad');
  const [showInventory, setShowInventory] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [picker, setPicker] = useState<{ type: 'food' | 'water'; memberId: string } | null>(null);
  const [perkTreeFor, setPerkTreeFor] = useState<string | null>(null);
  const [expandedMemberId, setExpandedMemberId] = useState<string | null>(null);

  // Update current time every second for live countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    (window as any).openPerkTree = (id: string) => setPerkTreeFor(id);
    return () => { delete (window as any).openPerkTree; };
  }, []);

  const recruitmentModule = getModuleDetails('recruitment-radio');
  const medicalModule = getModuleDetails('medical-facility');
  const canRecruit = recruitmentModule?.isActive && gameState.recruitmentCooldown <= currentTime;
  const isOnCooldown = gameState.recruitmentCooldown > currentTime;
  
  const formatTime = (timestamp: number) => {
    const timeLeft = Math.max(0, timestamp - currentTime);
    const minutes = Math.floor(timeLeft / 60000);
    const seconds = Math.floor((timeLeft % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getNeedsColor = (value: number) => {
    if (value >= 70) return 'text-green-400';
    if (value >= 30) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getNeedsBarColor = (value: number) => {
    if (value >= 70) return 'bg-green-500';
    if (value >= 30) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'text-green-400';
      case 'mission': return 'text-blue-400';
      case 'knocked-out': return 'text-red-400';
      default: return 'text-yellow-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-500 animate-pulse';
      case 'mission': return 'bg-blue-500';
      case 'knocked-out': return 'bg-red-500 animate-pulse';
      default: return 'bg-yellow-500';
    }
  };

  const handleRecruit = () => {
    if (!canRecruit) return;
    
    if (recruitmentType === 'squad') {
      startRecruitment();
    } else {
      startWorkerRecruitment();
    }
  };

  const giveStimpak = (memberId: string) => {
    const stimpak = gameState.inventory.find(item => item.id === 'stimpak' && item.quantity > 0);
    if (stimpak) {
      useConsumable('stimpak', memberId);
    }
  };

  const getWorkerStatIcon = (stat: string) => {
    switch (stat) {
      case 'precipitation': return <Droplets size={16} className="text-blue-400" />;
      case 'strength': return <Zap size={16} className="text-yellow-400" />;
      case 'agility': return <TrendingUp size={16} className="text-green-400" />;
      default: return <Activity size={16} className="text-gray-400" />;
    }
  };

  const calculateOverallStat = (member: any) => {
    return (member.stats.combat * 3) + 
           (member.stats.stealth * 1) + 
           (member.stats.tech * 0.5) + 
           (member.stats.charisma * 1);
  };

  const getMedicalFacilityStatus = () => {
    if (!medicalModule || !medicalModule.isActive) return null;
    
    const baseHealRate = 10; // HP per minute
    const levelMultiplier = 1 + ((medicalModule.level - 1) * 0.25); // 25% increase per level
    const workerBonus = medicalModule.assignedWorker ? 1.2 : 0.8; // 20% bonus with worker, 20% penalty without
    const currentHealRate = baseHealRate * levelMultiplier * workerBonus;
    
    return {
      isActive: true,
      level: medicalModule.level,
      healRate: currentHealRate,
      hasWorker: !!medicalModule.assignedWorker,
      efficiency: medicalModule.efficiency || 50,
      storedFood: medicalModule.storedFood || 0,
      storedWater: medicalModule.storedWater || 0,
      maxStorage: 20 // Max storage per resource
    };
  };

  const medicalStatus = getMedicalFacilityStatus();

  const supplyFood = (amount: number) => {
    const availableFood = gameState.inventory
      .filter(item => (item.id === 'food' || item.id === 'canned-food') && item.quantity > 0)
      .reduce((sum, item) => sum + item.quantity, 0);
    
    if (availableFood >= amount && medicalStatus && medicalStatus.storedFood + amount <= medicalStatus.maxStorage) {
      supplyMedicalFacility('food', amount);
    }
  };

  const supplyWater = (amount: number) => {
    const availableWater = gameState.inventory
      .filter(item => (item.id === 'water' || item.id === 'purified-water') && item.quantity > 0)
      .reduce((sum, item) => sum + item.quantity, 0);
    
    if (availableWater >= amount && medicalStatus && medicalStatus.storedWater + amount <= medicalStatus.maxStorage) {
      supplyMedicalFacility('water', amount);
    }
  };

  // Get available food and water from inventory
  const availableFood = gameState.inventory
    .filter(item => (item.id === 'food' || item.id === 'canned-food') && item.quantity > 0)
    .reduce((sum, item) => sum + item.quantity, 0);
  
  const availableWater = gameState.inventory
    .filter(item => (item.id === 'water' || item.id === 'purified-water') && item.quantity > 0)
    .reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="p-4 space-y-4 animate-fade-in">
      {/* Header */}
      <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-blue-500/20 animate-scale-in transform hover:scale-[1.02] transition-all duration-300">
        <h2 className="text-xl font-bold text-blue-400 mb-2">Personnel Management</h2>
        <p className="text-gray-400 text-sm">Manage your operatives and workers</p>
        <div className="mt-3 grid grid-cols-2 gap-4 text-center">
          <div className="bg-blue-900/20 rounded-lg p-2 animate-pulse">
            <p className="text-blue-400 text-sm">Available Food</p>
            <p className="text-blue-300 text-lg font-bold">{gameState.food}</p>
          </div>
          <div className="bg-cyan-900/20 rounded-lg p-2 animate-pulse">
            <p className="text-cyan-400 text-sm">Available Water</p>
            <p className="text-cyan-300 text-lg font-bold">{gameState.water}</p>
          </div>
        </div>
      </div>

      {/* Enhanced Medical Facility Status */}
      {medicalStatus && (
        <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-green-500/20 animate-fade-in transform hover:scale-[1.01] transition-all duration-300">
          <h3 className="text-lg font-semibold text-green-400 mb-3 flex items-center">
            <Heart className="mr-2 animate-pulse" size={20} />
            Medical Facility Control Center
          </h3>
          
          {/* Healing Rate and Worker Status */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-green-900/20 rounded-lg p-3 animate-fade-in">
              <p className="text-green-400 text-sm font-medium">Healing Rate</p>
              <p className="text-green-300 text-lg font-bold">{medicalStatus.healRate.toFixed(1)} HP/min</p>
              <p className="text-gray-400 text-xs">Level {medicalStatus.level} facility</p>
            </div>
            <div className="bg-blue-900/20 rounded-lg p-3 animate-fade-in">
              <p className="text-blue-400 text-sm font-medium">Worker Status</p>
              <p className="text-blue-300 text-sm">
                {medicalStatus.hasWorker ? '✓ Worker Assigned (+20%)' : '⚠️ No Worker (-20%)'}
              </p>
              <p className="text-gray-400 text-xs">Efficiency: {medicalStatus.efficiency}%</p>
            </div>
          </div>

          {/* Resource Storage Bars */}
          <div className="space-y-3 mb-4">
            <div className="animate-slide-in-right">
              <div className="flex items-center justify-between mb-2">
                <span className="text-orange-400 font-medium flex items-center">
                  🍞 Food Storage
                </span>
                <span className="text-orange-300">{medicalStatus.storedFood}/{medicalStatus.maxStorage}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3 mb-2">
                <div 
                  className="bg-gradient-to-r from-orange-600 to-orange-400 h-3 rounded-full transition-all duration-500 animate-pulse"
                  style={{ width: `${(medicalStatus.storedFood / medicalStatus.maxStorage) * 100}%` }}
                />
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => supplyFood(1)}
                  disabled={availableFood < 1 || medicalStatus.storedFood >= medicalStatus.maxStorage}
                  className="flex-1 bg-orange-600 hover:bg-orange-500 disabled:bg-gray-600 disabled:cursor-not-allowed px-3 py-1 rounded text-white text-sm font-medium transition-all hover:scale-105 animate-scale-in"
                >
                  <Plus size={12} className="inline mr-1" />
                  Supply 1
                </button>
                <button
                  onClick={() => supplyFood(5)}
                  disabled={availableFood < 5 || medicalStatus.storedFood + 5 > medicalStatus.maxStorage}
                  className="flex-1 bg-orange-600 hover:bg-orange-500 disabled:bg-gray-600 disabled:cursor-not-allowed px-3 py-1 rounded text-white text-sm font-medium transition-all hover:scale-105 animate-scale-in"
                >
                  Supply 5
                </button>
              </div>
            </div>

            <div className="animate-slide-in-right" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-cyan-400 font-medium flex items-center">
                  💧 Water Storage
                </span>
                <span className="text-cyan-300">{medicalStatus.storedWater}/{medicalStatus.maxStorage}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3 mb-2">
                <div 
                  className="bg-gradient-to-r from-cyan-600 to-cyan-400 h-3 rounded-full transition-all duration-500 animate-pulse"
                  style={{ width: `${(medicalStatus.storedWater / medicalStatus.maxStorage) * 100}%` }}
                />
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => supplyWater(1)}
                  disabled={availableWater < 1 || medicalStatus.storedWater >= medicalStatus.maxStorage}
                  className="flex-1 bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-600 disabled:cursor-not-allowed px-3 py-1 rounded text-white text-sm font-medium transition-all hover:scale-105 animate-scale-in"
                >
                  <Plus size={12} className="inline mr-1" />
                  Supply 1
                </button>
                <button
                  onClick={() => supplyWater(5)}
                  disabled={availableWater < 5 || medicalStatus.storedWater + 5 > medicalStatus.maxStorage}
                  className="flex-1 bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-600 disabled:cursor-not-allowed px-3 py-1 rounded text-white text-sm font-medium transition-all hover:scale-105 animate-scale-in"
                >
                  Supply 5
                </button>
              </div>
            </div>
          </div>

          {/* Worker Assignment */}
          <div className="bg-black/20 rounded-lg p-3 animate-fade-in">
            <h4 className="text-white font-medium mb-2">Worker Assignment</h4>
            {medicalStatus.hasWorker ? (
              <div className="flex items-center justify-between">
                <span className="text-green-400 text-sm">✓ Worker assigned to medical facility</span>
                <button
                  onClick={() => {
                    const assignedWorker = gameState.workers.find(w => w.assignedModule === 'medical-facility');
                    if (assignedWorker) unassignWorker(assignedWorker.id);
                  }}
                  className="bg-red-600 hover:bg-red-500 px-2 py-1 rounded text-white text-xs transition-all hover:scale-105"
                >
                  Unassign
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-yellow-400 text-sm">⚠️ No worker assigned (-20% efficiency)</p>
                {gameState.workers.filter(w => w.status === 'available').length > 0 ? (
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        assignWorkerToMedical(e.target.value);
                      }
                    }}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                  >
                    <option value="">Select worker to assign...</option>
                    {gameState.workers
                      .filter(w => w.status === 'available')
                      .map(worker => (
                        <option key={worker.id} value={worker.id}>
                          {worker.name} (Level {worker.level})
                        </option>
                      ))
                    }
                  </select>
                ) : (
                  <p className="text-gray-400 text-xs">No available workers</p>
                )}
              </div>
            )}
          </div>

          <div className="mt-3 text-xs text-gray-400 animate-fade-in">
            <p>• Consumes 1 food and 1 water per hour from storage (2 without worker)</p>
            <p>• Automatically heals all personnel when resources are available</p>
            <p>• Higher level facilities heal faster</p>
          </div>
        </div>
      )}

      {/* Recruitment Section */}
      <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-amber-500/20 animate-fade-in transform hover:scale-[1.01] transition-all duration-300">
        <h3 className="text-lg font-semibold text-amber-400 mb-3 flex items-center">
          <Radio className="mr-2 animate-pulse" size={20} />
          Recruitment Radio
        </h3>
        
        {!recruitmentModule?.isActive ? (
          <p className="text-red-400 text-sm">Recruitment Radio module is not active</p>
        ) : (
          <div className="space-y-3">
            {/* Recruitment Type Selection */}
            <div className="flex space-x-2 mb-3">
              <button
                onClick={() => setRecruitmentType('squad')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                  recruitmentType === 'squad' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                }`}
              >
                Squad Members ({gameState.squad.length}/{gameState.maxSquadSize})
              </button>
              <button
                onClick={() => setRecruitmentType('worker')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                  recruitmentType === 'worker' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                }`}
              >
                Workers ({gameState.workers.length}/{gameState.maxWorkers})
              </button>
            </div>

            {isOnCooldown ? (
              <div className="text-yellow-400">
                <p className="text-sm mb-2">Recruitment on cooldown</p>
                <div className="w-full bg-gray-700 rounded-full h-3 mb-2">
                  <div 
                    className="bg-gradient-to-r from-yellow-600 to-yellow-400 h-3 rounded-full transition-all duration-1000"
                    style={{ 
                      width: `${Math.max(0, 100 - ((currentTime - (gameState.recruitmentCooldown - 300000)) / 300000) * 100)}%` 
                    }}
                  />
                </div>
                <p className="text-xs">Time remaining: {formatTime(gameState.recruitmentCooldown)}</p>
              </div>
            ) : (
              <div className="animate-fade-in">
                <p className="text-gray-400 text-sm mb-3">
                  {recruitmentType === 'squad' 
                    ? `Recruit a new squad member. Cost: ${gameState.squad.length === 0 ? 600 : 4000} caps`
                    : `Recruit a new worker. Cost: ${200 + (gameState.workers.length * 75)} caps`
                  }
                </p>
                <button
                  onClick={handleRecruit}
                  disabled={!canRecruit || 
                    gameState.caps < (recruitmentType === 'squad' ? (gameState.squad.length === 0 ? 600 : 4000) : 200 + (gameState.workers.length * 75)) ||
                    (recruitmentType === 'squad' ? gameState.squad.length >= gameState.maxSquadSize : gameState.workers.length >= gameState.maxWorkers)
                  }
                  className="bg-amber-600 hover:bg-amber-500 disabled:bg-gray-600 disabled:cursor-not-allowed px-4 py-2 rounded-lg text-white font-medium transition-all duration-300 transform hover:scale-105 animate-scale-in"
                >
                  Recruit {recruitmentType === 'squad' ? 'Squad Member' : 'Worker'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Squad Overview */}
      <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-gray-500/20 animate-fade-in transform hover:scale-[1.01] transition-all duration-300">
        <h3 className="text-white font-semibold mb-3">Personnel Overview</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center animate-scale-in transform hover:scale-110 transition-all duration-300">
            <p className="text-2xl font-bold text-blue-400">{gameState.squad.length}</p>
            <p className="text-sm text-gray-400">Squad Members</p>
          </div>
          <div className="text-center animate-scale-in transform hover:scale-110 transition-all duration-300">
            <p className="text-2xl font-bold text-green-400">{gameState.workers.length}</p>
            <p className="text-sm text-gray-400">Workers</p>
          </div>
        </div>
      </div>

      {/* Squad Members Section */}
      <div className="space-y-3 animate-fade-in">
        <h3 className="text-lg font-semibold text-blue-400">⚔️ Squad Members</h3>
        {gameState.squad.map((member, index) => {
          const combatStats = calculateCombatStats(member);
          const overallStat = combatStats.overallStat;
          const coreStats = mapCoreStats10(member);
          const isKnockedOut = member.status === 'knocked-out' && member.knockedOutUntil && member.knockedOutUntil > Date.now();
          const hasStimpak = gameState.inventory.find(item => item.id === 'stimpak' && item.quantity > 0);
          const canRecover = isKnockedOut && medicalModule?.isActive;
          const normalizedWeapon = normalizeWeaponFromItem(member.equipment?.weapon);
          const isGun = normalizedWeapon?.category === 'gun';
          const experiencePercent = ((member.experience || 0) / Math.max(1, member.nextLevelExp || 100)) * 100;
          const isExpanded = expandedMemberId === member.id;
          
          // Get equipped items for display
          const equippedWeapon = member.equipment?.weapon ? GAME_ITEMS.find(item => item.id === member.equipment.weapon) : null;
          const equippedArmor = member.equipment?.armor ? GAME_ITEMS.find(item => item.id === member.equipment.armor) : null;
          const equippedAccessory = member.equipment?.accessory ? GAME_ITEMS.find(item => item.id === member.equipment.accessory) : null;
          
          return (
            <div
              key={member.id}
              onClick={() => setExpandedMemberId(isExpanded ? null : member.id)}
              className={`bg-black/40 backdrop-blur-sm rounded-xl p-4 border-2 cursor-pointer transition-all duration-300 transform hover:scale-[1.02] animate-fade-in ${
                isExpanded
                  ? 'border-blue-500 bg-blue-500/10 animate-pulse shadow-lg shadow-blue-500/20'
                  : 'border-gray-500/20 hover:border-gray-400 hover:shadow-lg'
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="text-white font-semibold">{member.name}</h4>
                    <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">
                      Lv.{member.level}
                    </span>
                    {(member.perkPoints || 0) > 0 && (
                      <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full animate-pulse">
                        {member.perkPoints} Perk Points
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 mb-1">
                    <p className="text-sm text-gray-400">{member.specialization}</p>
                    <span className="text-purple-400 text-sm font-bold">
                      Overall Combat Rating: {overallStat.toFixed(1)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 mb-1">
                    <div className="flex-1">
                      <div className="w-full bg-gray-700 rounded-full h-1.5">
                        <div 
                          className="bg-gradient-to-r from-amber-500 to-yellow-400 h-1.5 rounded-full transition-all duration-500" 
                          style={{ width: `${experiencePercent}%` }} 
                        />
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">
                      {member.experience || 0}/{member.nextLevelExp || 100}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`flex items-center space-x-1 ${getStatusColor(member.status)}`}>
                    <div className={`w-2 h-2 rounded-full ${getStatusIcon(member.status)}`}></div>
                    <span className="text-xs capitalize">{member.status}</span>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); setPerkTreeFor(member.id); }}
                    className="mt-2 text-xs bg-blue-600 hover:bg-blue-500 px-2 py-1 rounded text-white"
                  >
                    Perks ({member.perkPoints || 0})
                  </button>
                </div>
              </div>

              {/* Health and Needs */}
              <div className="mb-3">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-400 flex items-center">
                    <Heart size={12} className="mr-1" />
                    Health
                  </span>
                  <span className="text-red-400">{member.stats.health.toFixed(0)}/{member.stats.maxHealth}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                  <div 
                    className="bg-gradient-to-r from-red-600 to-red-400 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(member.stats.health / member.stats.maxHealth) * 100}%` }}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-400">🍞 Hunger</span>
                      <span className={getNeedsColor(member.stats.hunger)}>{Math.floor(member.stats.hunger)}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-1">
                      <div 
                        className={`${getNeedsBarColor(member.stats.hunger)} h-1 rounded-full transition-all duration-500`}
                        style={{ width: `${member.stats.hunger}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-400">💧 Thirst</span>
                      <span className={getNeedsColor(member.stats.thirst)}>{Math.floor(member.stats.thirst)}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-1">
                      <div 
                        className={`${getNeedsBarColor(member.stats.thirst)} h-1 rounded-full transition-all duration-500`}
                        style={{ width: `${member.stats.thirst}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Active Chems Display */}
              {member.activeChems && member.activeChems.length > 0 && (
                <div className="mb-3">
                  <div className="flex flex-wrap gap-1">
                    {member.activeChems.map(chem => {
                      const timeLeft = Math.max(0, (chem.appliedAt + chem.duration) - currentTime);
                      const minutes = Math.floor(timeLeft / 60000);
                      const seconds = Math.floor((timeLeft % 60000) / 1000);
                      return (
                        <span key={chem.id} className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full animate-pulse">
                          {chem.name} ({minutes}:{seconds.toString().padStart(2, '0')})
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Expanded Details Section */}
              {isExpanded && (
                <div className="mt-6 pt-6 border-t border-blue-400/30 space-y-4 animate-fade-in">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Core Stats */}
                    <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-gray-500/30">
                      <h4 className="text-white font-bold mb-3 drop-shadow-sm">Core Stats</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400 flex items-center">
                            <Sword size={12} className="mr-1" />
                            Combat Lv:
                          </span>
                          <span className="text-red-400 font-bold">{coreStats.combatLevel}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400 flex items-center">
                            <Shield size={12} className="mr-1" />
                            Survival:
                          </span>
                          <span className="text-green-400 font-bold">{coreStats.survival}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400 flex items-center">
                            <Eye size={12} className="mr-1" />
                            Intelligence:
                          </span>
                          <span className="text-blue-400 font-bold">{coreStats.intelligence}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400 flex items-center">
                            <Users size={12} className="mr-1" />
                            Charisma:
                          </span>
                          <span className="text-purple-400 font-bold">{coreStats.charisma}</span>
                        </div>
                      </div>
                    </div>

                    {/* Combat Stats */}
                    <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-gray-500/30">
                      <h4 className="text-white font-bold mb-3 drop-shadow-sm">Combat Stats</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Damage:</span>
                          <span className="text-red-400 font-bold">{combatStats.damage}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Accuracy:</span>
                          <span className="text-yellow-400 font-bold">{combatStats.accuracy}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Fire Rate:</span>
                          <span className="text-orange-400 font-bold">{combatStats.fireRate || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Reliability:</span>
                          <span className="text-green-400 font-bold">
                            {normalizedWeapon ? `${normalizedWeapon.reliability}%` : '60%'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Equipment Details */}
                  <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-gray-500/30">
                    <h4 className="text-white font-bold mb-3 drop-shadow-sm">Equipment</h4>
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-gray-400">Weapon:</span>
                          <span className={equippedWeapon ? "text-green-400" : "text-red-400"}>
                            {equippedWeapon ? '✓' : '✗'}
                          </span>
                        </div>
                        {equippedWeapon && (
                          <p className="text-xs text-green-300">{equippedWeapon.name}</p>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-gray-400">Armor:</span>
                          <span className={equippedArmor ? "text-green-400" : "text-red-400"}>
                            {equippedArmor ? '✓' : '✗'}
                          </span>
                        </div>
                        {equippedArmor && (
                          <p className="text-xs text-green-300">{equippedArmor.name}</p>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-gray-400">Items:</span>
                          <span className="text-blue-400">{member.inventory.filter(slot => slot.item !== null).length}/7</span>
                        </div>
                        {equippedAccessory && (
                          <p className="text-xs text-blue-300">{equippedAccessory.name}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Active Perks */}
                  {member.perks && member.perks.length > 0 && (
                    <div className="bg-purple-900/20 rounded-lg p-3 border border-purple-500/30">
                      <h4 className="text-purple-400 font-medium mb-2">Active Perks</h4>
                      <div className="flex flex-wrap gap-1">
                        {member.perks.map(perkId => (
                          <span key={perkId} className="text-xs bg-purple-500/30 text-purple-300 px-2 py-1 rounded">
                            {perkId}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="border-t border-gray-500/20 pt-3 animate-fade-in">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowInventory(member.id);
                    }}
                    disabled={member.status === 'mission'}
                    className="text-xs bg-purple-600 hover:bg-purple-500 px-2 py-1 rounded text-white transition-all duration-300 transform hover:scale-110 flex items-center space-x-1 animate-scale-in"
                  >
                    <Package size={12} />
                    <span>Inventory</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setPicker({ type: 'food', memberId: member.id });
                    }}
                    disabled={member.status === 'mission' || !gameState.inventory.find(item => (item.id === 'food' || item.id === 'canned-food') && item.quantity > 0)}
                    className="text-xs bg-green-600 hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed px-2 py-1 rounded text-white transition-all duration-300 transform hover:scale-110 animate-scale-in"
                  >
                    Give Food
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setPicker({ type: 'water', memberId: member.id });
                    }}
                    disabled={member.status === 'mission' || !gameState.inventory.find(item => (item.id === 'water' || item.id === 'purified-water' || item.id === 'nuka-cola') && item.quantity > 0)}
                    className="text-xs bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed px-2 py-1 rounded text-white transition-all duration-300 transform hover:scale-110 animate-scale-in"
                  >
                    Give Water
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      giveStimpak(member.id);
                    }}
                    disabled={member.status === 'mission' || !hasStimpak}
                    className="text-xs bg-red-600 hover:bg-red-500 disabled:bg-gray-600 disabled:cursor-not-allowed px-2 py-1 rounded text-white transition-all duration-300 transform hover:scale-110 flex items-center space-x-1 animate-scale-in"
                  >
                    <Plus size={12} />
                    <span>Stimpak</span>
                  </button>
                  {canRecover && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        recoverKnockedOutMember(member.id);
                      }}
                      className="text-xs bg-emerald-600 hover:bg-emerald-500 px-2 py-1 rounded text-white transition-all duration-300 transform hover:scale-110 flex items-center space-x-1 animate-pulse"
                    >
                      <Heart size={12} />
                      <span>Medical Recovery</span>
                    </button>
                  )}
                  {/* Manual Chem Use */}
                  {gameState.inventory.filter(item => item.type === 'chem' && item.quantity > 0).map(chem => (
                    <button
                      key={chem.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        useConsumable(chem.id, member.id);
                      }}
                      className="text-xs bg-purple-600 hover:bg-purple-500 px-2 py-1 rounded text-white transition-all duration-300 transform hover:scale-110"
                      title={chem.function}
                    >
                      {chem.icon} {chem.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Workers Section */}
      <div className="space-y-3 animate-fade-in">
        <h3 className="text-lg font-semibold text-green-400">🔧 Workers</h3>
        {gameState.workers.map((worker, index) => (
          <div
            key={worker.id}
            onClick={() => setSelectedWorker(selectedWorker === worker.id ? null : worker.id)}
            className={`bg-black/40 backdrop-blur-sm rounded-xl p-4 border-2 cursor-pointer transition-all duration-300 transform hover:scale-[1.02] animate-fade-in ${
              selectedWorker === worker.id
                ? 'border-green-500 bg-green-500/10 animate-pulse shadow-lg shadow-green-500/20'
                : 'border-gray-500/20 hover:border-gray-400 hover:shadow-lg'
            }`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-white font-semibold">{worker.name}</h4>
                <p className="text-sm text-gray-400">
                  Level {worker.level} • {worker.status} {worker.assignedModule && `• Assigned to ${worker.assignedModule}`}
                </p>
              </div>
              <div className="text-right">
                <div className={`flex items-center space-x-1 ${
                  worker.status === 'available' ? 'text-green-400' : 
                  worker.status === 'assigned' ? 'text-blue-400' : 'text-red-400'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    worker.status === 'available' ? 'bg-green-500 animate-pulse' :
                    worker.status === 'assigned' ? 'bg-blue-500' : 'bg-red-500'
                  }`}></div>
                  <span className="text-xs capitalize">{worker.status}</span>
                </div>
              </div>
            </div>

            {/* Health and Needs */}
            <div className="mb-3">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-400">Health</span>
                <span className="text-red-400">{worker.stats.health.toFixed(0)}/{worker.stats.maxHealth}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                <div 
                  className="bg-gradient-to-r from-red-600 to-red-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(worker.stats.health / worker.stats.maxHealth) * 100}%` }}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-400">🍞 Hunger</span>
                    <span className={getNeedsColor(worker.stats.hunger)}>{Math.floor(worker.stats.hunger)}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-1">
                    <div 
                      className={`${getNeedsBarColor(worker.stats.hunger)} h-1 rounded-full transition-all duration-500`}
                      style={{ width: `${worker.stats.hunger}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-400">💧 Thirst</span>
                    <span className={getNeedsColor(worker.stats.thirst)}>{Math.floor(worker.stats.thirst)}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-1">
                    <div 
                      className={`${getNeedsBarColor(worker.stats.thirst)} h-1 rounded-full transition-all duration-500`}
                      style={{ width: `${worker.stats.thirst}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Worker Stats */}
            <div className="grid grid-cols-3 gap-2 mb-3 p-2 bg-black/20 rounded-lg">
              <div className="text-center transform hover:scale-110 transition-all duration-300">
                <div className="flex items-center justify-center mb-1">
                  {getWorkerStatIcon('precipitation')}
                </div>
                <span className="text-xs text-gray-400">Precipitation</span>
                <p className="text-blue-400 font-semibold">{worker.stats.precipitation}</p>
              </div>
              <div className="text-center transform hover:scale-110 transition-all duration-300">
                <div className="flex items-center justify-center mb-1">
                  {getWorkerStatIcon('strength')}
                </div>
                <span className="text-xs text-gray-400">Strength</span>
                <p className="text-yellow-400 font-semibold">{worker.stats.strength}</p>
              </div>
              <div className="text-center transform hover:scale-110 transition-all duration-300">
                <div className="flex items-center justify-center mb-1">
                  {getWorkerStatIcon('agility')}
                </div>
                <span className="text-xs text-gray-400">Agility</span>
                <p className="text-green-400 font-semibold">{worker.stats.agility}</p>
              </div>
            </div>

            {/* Action Buttons */}
            {selectedWorker === worker.id && (
              <div className="border-t border-gray-500/20 pt-3 animate-fade-in">
                <div className="flex space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      giveWorkerFood(worker.id);
                    }}
                    disabled={!gameState.inventory.find(item => (item.id === 'food' || item.id === 'canned-food') && item.quantity > 0)}
                    className="text-xs bg-green-600 hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed px-2 py-1 rounded text-white transition-all duration-300 transform hover:scale-110 animate-scale-in"
                  >
                    Give Food
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      giveWorkerWater(worker.id);
                    }}
                    disabled={!gameState.inventory.find(item => (item.id === 'water' || item.id === 'purified-water' || item.id === 'nuka-cola') && item.quantity > 0)}
                    className="text-xs bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed px-2 py-1 rounded text-white transition-all duration-300 transform hover:scale-110 animate-scale-in"
                  >
                    Give Water
                  </button>
                  {worker.status === 'assigned' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        unassignWorker(worker.id);
                      }}
                      className="text-xs bg-red-600 hover:bg-red-500 px-2 py-1 rounded text-white transition-all duration-300 transform hover:scale-110 animate-scale-in"
                    >
                      Unassign
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* No Personnel */}
      {gameState.squad.length === 0 && gameState.workers.length === 0 && (
        <div className="text-center py-8 animate-fade-in">
          <Users className="mx-auto text-gray-400 mb-2 animate-pulse" size={48} />
          <p className="text-gray-400">No personnel assigned</p>
          <p className="text-gray-500 text-sm">Use the recruitment radio to find people</p>
        </div>
      )}

      {/* Squad Inventory Modal */}
      {showInventory && (
        <SquadInventory
          member={gameState.squad.find(m => m.id === showInventory)!}
          onClose={() => setShowInventory(null)}
        />
      )}

      {/* Consumable Picker Modal for Squad Members */}
      {picker && (
        <ConsumablePicker
          type={picker.type}
          onSelect={(itemId) => {
            if (picker.type === 'food') {
              giveSquadMemberFood(picker.memberId);
            } else {
              giveSquadMemberWater(picker.memberId);
            }
            setPicker(null);
          }}
          onClose={() => setPicker(null)}
        />
      )}

      {/* Squad Perk Tree Modal */}
      {perkTreeFor && (
        <SquadPerkTree memberId={perkTreeFor} onClose={() => setPerkTreeFor(null)} />
      )}
    </div>
  );
};