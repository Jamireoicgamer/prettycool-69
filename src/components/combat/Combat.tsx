import React, { useState, useEffect } from 'react';
import { useGame } from '@/context/GameContext';
import { Sword, Users, Target, Clock, Trophy, AlertTriangle, Star, Zap } from 'lucide-react';
import { COMBAT_TARGETS, CombatTarget } from './CombatTargets';
import { calculateCombatStats, simulateCombat } from '@/utils/CombatCalculations';
import { getTerrainByLocation, TERRAIN_TYPES } from '@/data/TerrainTypes';
import { calculateUniversalCombatDuration } from '@/utils/combat/UniversalCombatFormula';
import combatSound from '@/assets/Combat-and-operations-sound.mp3';


export const Combat = () => {
  const { gameState, startMission, addCurrency, addExperience, addItem, useChem, addNotification } = useGame();
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const [selectedSquad, setSelectedSquad] = useState<string[]>([]);
  const [appliedChems, setAppliedChems] = useState<{ [squadId: string]: string[] }>({});

  const availableSquad = gameState.squad.filter(member => member.status === 'available');
  const availableTargets = COMBAT_TARGETS.filter(target => gameState.commanderLevel >= target.unlockLevel);

  // Enhanced combat targets with improved rewards and loot pools
const enhancedCombatTargets = [
    {
      id: 'raider-camp-alpha',
      name: 'Raider Camp Alpha',
      difficulty: 1,
      location: 'Northern Wastes',
      terrain: 'wasteland',
      description: 'A small raider settlement terrorizing local trade routes.',
      faction: 'raiders',
      type: 'common',
      minLevel: 1,
      minSquadSize: 2,
      unlockLevel: 1,
      subTerrain: 'ruins alleys',
      enemies: [
        { name: 'Raider Thug', health: 30, damage: 8, accuracy: 50, fireRate: 2, weapon: 'damaged-32-pistol' },
        { name: 'Raider Scout', health: 25, damage: 6, accuracy: 60, fireRate: 3, weapon: 'pipe-rifle' }
      ],
      rewards: { 
        caps: 120, 
        experience: 100, 
        scrip: 5,
        lootPool: ['steel', 'aluminum', 'gun-powder', 'leather', 'cloth', '10mm-pistol', 'stimpak']
      }
    },
    {
      id: 'super-mutant-outpost',
      name: 'Super Mutant Outpost',
      difficulty: 2,
      location: 'Irradiated Valley',
      terrain: 'swamp',
      description: 'A fortified super mutant position blocking supply routes.',
      faction: 'super-mutants',
      type: 'common',
      minLevel: 3,
      minSquadSize: 3,
      unlockLevel: 3,
      subTerrain: 'canyon pass',
      enemies: [
        { name: 'Super Mutant Brute', health: 60, damage: 15, accuracy: 40, fireRate: 1, weapon: 'super-sledge' },
        { name: 'Super Mutant', health: 50, damage: 12, accuracy: 45, fireRate: 2, weapon: 'hunting-rifle' }
      ],
      rewards: { 
        caps: 300, 
        experience: 150, 
        scrip: 10,
        lootPool: ['steel', 'nuclear-material', 'super-sledge', 'hunting-rifle', 'rad-away', 'buffout']
      }
    },
    {
      id: 'feral-ghoul-den',
      name: 'Feral Ghoul Den',
      difficulty: 1,
      location: 'Ruined Suburbs',
      description: 'An infested building full of feral ghouls.',
      faction: 'ghouls',
      type: 'common',
      minLevel: 2,
      minSquadSize: 2,
      unlockLevel: 2,
      enemies: [
        { name: 'Feral Ghoul', health: 35, damage: 10, accuracy: 30, fireRate: 2, weapon: 'claws' },
        { name: 'Glowing One', health: 45, damage: 12, accuracy: 35, fireRate: 1, weapon: 'radiation' }
      ],
      rewards: { 
        caps: 150, 
        experience: 80, 
        scrip: 3,
        lootPool: ['rad-away', 'stimpack', 'cloth', 'leather', 'nuclear-material', 'pre-war-money']
      }
    },
    {
      id: 'deathclaw-nest',
      name: 'Deathclaw Nest',
      difficulty: 5,
      location: 'Quarry Junction',
      description: 'A family of deathclaws has made their home in an abandoned quarry.',
      faction: 'creatures',
      type: 'legendary',
      minLevel: 8,
      minSquadSize: 4,
      unlockLevel: 8,
      enemies: [
        { name: 'Young Deathclaw', health: 120, damage: 25, accuracy: 70, fireRate: 2, weapon: 'claws' },
        { name: 'Deathclaw Alpha', health: 200, damage: 40, accuracy: 80, fireRate: 1, weapon: 'claws' }
      ],
      rewards: { 
        caps: 800, 
        experience: 400, 
        scrip: 30,
        lootPool: ['deathclaw-hide', 'nuclear-material', 'legendary-weapon', 'psycho', 'mentats', 'fusion-core']
      }
    },
    {
      id: 'robot-factory',
      name: 'Rogue Robot Factory',
      difficulty: 4,
      location: 'Industrial Complex',
      description: 'An automated factory continues producing hostile robots.',
      faction: 'robots',
      type: 'rare',
      minLevel: 6,
      minSquadSize: 3,
      unlockLevel: 6,
      enemies: [
        { name: 'Protectron', health: 80, damage: 18, accuracy: 85, fireRate: 3, weapon: 'laser-pistol' },
        { name: 'Sentry Bot', health: 150, damage: 30, accuracy: 90, fireRate: 2, weapon: 'minigun' }
      ],
      rewards: { 
        caps: 600, 
        experience: 300, 
        scrip: 25,
        techFrags: 15,
        lootPool: ['tech-frags', 'circuitry', 'nuclear-material', 'fusion-cell', 'laser-rifle', 'robot-parts']
      }
    }
  ];

  // Enemy balancing and sorted targets by difficulty
  const scaleEnemiesByDifficulty = (enemies: any[] = [], diff: number) => {
    const d = Math.max(1, diff || 1);
    const dmgMult = Math.min(2.0, 0.8 + d * 0.10);
    const hpMult = Math.min(2.5, 0.9 + d * 0.12);
    return enemies.map(e => ({
      ...e,
      damage: Math.max(2, Math.round((e.damage ?? 6) * dmgMult)),
      health: Math.max(20, Math.round((e.health ?? 40) * hpMult)),
      accuracy: Math.max(35, Math.min(95, Math.round((e.accuracy ?? 60) + (d - 3) * 2)))
    }));
  };

  const getBalancedTargetById = (id: string | null) => {
    if (!id) return null;
    const raw = enhancedCombatTargets.find(t => t.id === id);
    return raw ? { ...raw, enemies: scaleEnemiesByDifficulty(raw.enemies, raw.difficulty) } : null;
  };

  const sortedTargets = enhancedCombatTargets
    .slice()
    .sort((a, b) => a.difficulty - b.difficulty)
    .map(t => ({ ...t, enemies: scaleEnemiesByDifficulty(t.enemies, t.difficulty) }));

  const ongoingCombatMissions = gameState.activeMissions.filter(mission => 
    mission.type === 'combat' || mission.id.startsWith('combat-')
  );

  const calculateWinChance = () => {
    if (!selectedTarget || selectedSquad.length === 0) return 0;
    
    const target = getBalancedTargetById(selectedTarget);
    if (!target) return 0;

    const squadMembers = gameState.squad.filter(member => selectedSquad.includes(member.id));
    let totalCombatPower = 0;
    
    console.log('Calculating win chance with enhanced stats:');
    squadMembers.forEach(member => {
      const combatStats = calculateCombatStats(member);
      const memberPower = combatStats.damage + (combatStats.health / 5) + (combatStats.accuracy / 2);
      totalCombatPower += memberPower;
      console.log(`${member.name}: Damage=${combatStats.damage}, Health=${combatStats.health}, Accuracy=${combatStats.accuracy}, Power=${memberPower}`);
    });
    
    const enemyPower = target.enemies.reduce((sum, enemy) => 
      sum + (enemy.damage * 10) + enemy.health + ((enemy.accuracy || 50) * 0.3), 0
    );
    
    const baseChance = Math.min(95, Math.max(5, (totalCombatPower / enemyPower) * 50 + 25));
    
    console.log(`Total squad power: ${totalCombatPower}, Enemy power: ${enemyPower}, Win chance: ${baseChance}%`);
    return Math.round(baseChance);
  };

  // Strict formula-based duration (no caps), using new UniversalCombatFormula
  const calculateEstimatedDuration = () => {
    if (!selectedTarget || selectedSquad.length === 0) return 0;
    const target = getBalancedTargetById(selectedTarget);
    if (!target) return 0;

    const squadMembers = gameState.squad.filter(member => selectedSquad.includes(member.id));
    const enemies = target.enemies || [];

    const result = calculateUniversalCombatDuration(
      squadMembers as any[],
      enemies as any[],
      target.difficulty,
      target.location,
      (target as any).subTerrain
    );

    return result.estimatedDuration; // seconds
  };
  const canStartCombat = () => {
    if (!selectedTarget || selectedSquad.length === 0) return false;
    const target = getBalancedTargetById(selectedTarget);
    if (!target) return false;
    
    const combatCooldown = gameState.combatCooldowns?.[selectedTarget] || 0;
    const canFight = combatCooldown < Date.now();
    
    return gameState.commanderLevel >= target.minLevel && 
           selectedSquad.length >= target.minSquadSize &&
           canFight;
  };

  const startCombat = () => {
    if (!canStartCombat()) {
      const target = enhancedCombatTargets.find(t => t.id === selectedTarget);
      if (!target) {
        addNotification({
          id: `combat-error-${Date.now()}`,
          type: 'error',
          title: 'Combat Failed',
          message: 'Invalid target selected',
          priority: 'high'
        });
        return;
      }

      let reason = '';
      if (gameState.commanderLevel < target.minLevel) {
        reason = `Commander level ${target.minLevel} required (current: ${gameState.commanderLevel})`;
      } else if (selectedSquad.length < target.minSquadSize) {
        reason = `Minimum ${target.minSquadSize} squad members required (selected: ${selectedSquad.length})`;
      } else {
        const combatCooldown = gameState.combatCooldowns?.[selectedTarget] || 0;
        if (combatCooldown >= Date.now()) {
          const timeLeft = Math.ceil((combatCooldown - Date.now()) / 60000);
          reason = `Combat on cooldown for ${timeLeft} more minutes`;
        }
      }

      addNotification({
        id: `combat-error-${Date.now()}`,
        type: 'error',
        title: 'Combat Requirements Not Met',
        message: reason,
        priority: 'high'
      });
      return;
    }

    const target = getBalancedTargetById(selectedTarget);
    if (!target) return;

    const combatMissionId = `combat-${target.id}-${Date.now()}`;
    
    // Calculate dynamic duration based on actual combat simulation
    const estimatedDuration = Math.ceil(calculateEstimatedDuration() / 60); // Convert to minutes
    
    // Pass the actual target data to the mission with dynamic duration
    const missionData = {
      title: `Combat: ${target.name}`,
      type: 'combat',
      difficulty: target.difficulty,
      duration: estimatedDuration, // Use calculated duration instead of fixed
      location: target.location,
      terrain: (target as any).terrain,
      description: target.description,
      targetId: target.id,
      enemies: target.enemies, // already balanced
      rewards: target.rewards
    };
    
    const missionStarted = startMission(combatMissionId, selectedSquad, missionData);
    
    if (missionStarted) {
      try {
        const audio = new Audio(combatSound);
        audio.volume = 0.6;
        void audio.play();
      } catch (e) {
        // ignore autoplay restrictions
      }
      
      // Auto-use chems if enabled
      if (gameState.uiSettings.autoUseChems) {
        selectedSquad.forEach(memberId => {
          const member = gameState.squad.find(m => m.id === memberId);
          if (member) {
            // Find suitable chem based on specialization
            let suitableChem = null;
            if (member.specialization === 'combat') {
              suitableChem = gameState.inventory.find(item => item.id === 'psycho' && item.quantity > 0);
            } else if (member.specialization === 'stealth') {
              suitableChem = gameState.inventory.find(item => item.id === 'jet' && item.quantity > 0);
            } else if (member.specialization === 'tech') {
              suitableChem = gameState.inventory.find(item => item.id === 'mentats' && item.quantity > 0);
            }
            
            if (suitableChem) {
              useChem(suitableChem.id, member.id);
            }
          }
        });
      }
      
      addNotification({
        id: `combat-start-${Date.now()}`,
        type: 'success',
        title: 'Combat Mission Started',
        message: `Squad deployed to ${target.location} to engage ${target.name}. Estimated duration: ${estimatedDuration}m`,
        priority: 'medium'
      });

      setSelectedTarget(null);
      setSelectedSquad([]);
      setAppliedChems({});
    }
  };

  const formatTime = (timestamp: number) => {
    const timeLeft = Math.max(0, timestamp - Date.now());
    const minutes = Math.floor(timeLeft / 60000);
    const seconds = Math.floor((timeLeft % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const renderActiveCombatMissions = () => {
    if (ongoingCombatMissions.length === 0) return null;

    return (
      <div className="space-y-3 animate-fade-in">
        <h3 className="text-lg font-semibold text-red-400 flex items-center">
          ⚔️ Active Combat Operations
        </h3>
        {ongoingCombatMissions.map((mission) => {
          const timeLeft = Math.max(0, mission.duration * 60000 - (Date.now() - mission.startTime));
          const progress = Math.min(100, ((Date.now() - mission.startTime) / (mission.duration * 60000)) * 100);
          const target = enhancedCombatTargets.find(t => t.id === mission.targetId);
          
          return (
            <div key={mission.id} className="bg-red-900/20 backdrop-blur-sm rounded-xl p-4 border border-red-500/30 animate-scale-in">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-white font-semibold flex items-center">
                  <Sword className="mr-2 text-red-400 animate-pulse" size={16} />
                  {mission.title}
                </h4>
                <span className="text-red-400 text-sm animate-pulse">
                  {Math.ceil(timeLeft / 60000)}m remaining
                </span>
              </div>
              
              <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                <div 
                  className="bg-red-500 h-2 rounded-full transition-all animate-pulse"
                  style={{ width: `${progress}%` }}
                />
              </div>
              
              <div className="space-y-1 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Location:</span>
                  <span className="text-yellow-400">{mission.location}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Squad:</span>
                  <span className="text-blue-400">{mission.assignedSquad.length} operatives</span>
                </div>
                {target && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Enemies:</span>
                    <span className="text-red-400">{target.enemies.length} hostiles</span>
                  </div>
                )}
                <div className="text-xs text-gray-500 mt-2">
                  Squad Status: Engaging hostile forces in {mission.location}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="p-4 space-y-4 animate-fade-in">
      {/* Header with enhanced animations */}
      <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-red-500/20 animate-fade-in">
        <h2 className="text-xl font-bold text-red-400 mb-2 flex items-center">
          <Sword className="mr-2 animate-pulse" />
          Combat Operations
        </h2>
        <p className="text-gray-400 text-sm">Deploy your squad against hostile factions across the wasteland</p>
        <div className="mt-2 flex items-center space-x-4 text-sm">
          <span className="text-amber-400 flex items-center">
            <Target className="mr-1" size={12} />
            Available Targets: {sortedTargets.length}
          </span>
          <span className="text-blue-400 flex items-center">
            <Users className="mr-1" size={12} />
            Squad Ready: {availableSquad.length}
          </span>
          <span className="text-purple-400 flex items-center">
            <Zap className="mr-1" size={12} />
            Active Combat: {ongoingCombatMissions.length}
          </span>
        </div>
      </div>

      {/* Active Combat Missions */}
      {renderActiveCombatMissions()}

      {/* Target Selection with improved animations */}
      <div className="space-y-3 animate-fade-in">
        <h3 className="text-lg font-semibold text-amber-400 flex items-center">
          <Target className="mr-2" size={20} />
          Combat Targets ({sortedTargets.length} Available)
        </h3>
        
        <div className="grid gap-3">
          {sortedTargets.map((target, index) => {
            const isOnCooldown = (gameState.combatCooldowns?.[target.id] || 0) > Date.now();
            const cooldownTime = gameState.combatCooldowns?.[target.id] || 0;
            
            return (
              <div
                key={target.id}
                onClick={() => !isOnCooldown && setSelectedTarget(target.id)}
                className={`bg-black/40 backdrop-blur-sm rounded-xl p-4 border-2 transition-all hover-scale animate-fade-in ${
                  isOnCooldown 
                    ? 'border-gray-500/20 opacity-50 cursor-not-allowed'
                    : selectedTarget === target.id 
                      ? 'border-red-500 bg-red-500/10 cursor-pointer animate-pulse' 
                      : 'border-gray-500/20 hover:border-gray-400 cursor-pointer'
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl animate-bounce">
                      {target.faction === 'raiders' ? '🏴‍☠️' : 
                       target.faction === 'super-mutants' ? '🧟' :
                       target.faction === 'ghouls' ? '☢️' :
                       target.faction === 'robots' ? '🤖' : '💀'}
                    </span>
                      <div>
                        <h4 className="text-white font-semibold">{target.name}</h4>
                        <p className="text-xs text-gray-400">{target.faction} • {target.location}</p>
                        {target.terrain && (
                          <p className="text-xs text-purple-400 mt-0.5">Terrain: {String(target.terrain)}</p>
                        )}
                      </div>
                  </div>
                  
                  <div className="flex flex-col items-end space-y-1">
                    <span className={`text-xs px-2 py-1 rounded-full animate-pulse ${
                      target.difficulty <= 2 ? 'text-green-400 bg-green-400/20' :
                      target.difficulty <= 4 ? 'text-yellow-400 bg-yellow-400/20' :
                      'text-red-400 bg-red-400/20'
                    }`}>
                      Difficulty {target.difficulty}
                    </span>
                    {target.type === 'legendary' && (
                      <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full flex items-center animate-pulse">
                        <Star size={12} className="mr-1" />
                        Legendary
                      </span>
                    )}
                  </div>
                </div>
                
                {isOnCooldown && (
                  <div className="text-red-400 text-sm mb-2 flex items-center animate-pulse">
                    <Clock size={16} className="mr-1" />
                    Cooldown: {formatTime(cooldownTime)}
                  </div>
                )}
                
                <p className="text-gray-400 text-sm mb-3">{target.description}</p>
                
                {/* Enemy count */}
                <div className="mb-3 p-2 bg-black/20 rounded-lg">
                  <h5 className="text-xs text-gray-400 mb-1">Enemy Forces:</h5>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white">{target.enemies.length} Hostiles</span>
                    <span className="text-red-400">⚠️ Combat Stats Hidden</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400 text-xs">Requirements</p>
                    <p className="text-white">Level {target.minLevel} • {target.minSquadSize} Squad</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Rewards</p>
                    <div className="flex space-x-2">
                      <span className="text-yellow-400 animate-pulse">{target.rewards.caps}💰</span>
                      {target.rewards.scrip && <span className="text-blue-400 animate-pulse">{target.rewards.scrip}🔧</span>}
                      <span className="text-purple-400 animate-pulse">{target.rewards.experience}XP</span>
                    </div>
                    {target.rewards.lootPool && (
                      <p className="text-xs text-green-400 mt-1">+ Random Loot</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Enhanced Squad Selection with better equipment display */}
      {selectedTarget && (
        <div className="space-y-3 animate-fade-in">
          <h3 className="text-lg font-semibold text-amber-400 flex items-center">
            <Users className="mr-2" size={20} />
            Select Squad Members
          </h3>
          
          {availableSquad.map((member) => {
            const combatStats = calculateCombatStats(member);
            
            return (
              <div
                key={member.id}
                className={`bg-black/40 backdrop-blur-sm rounded-xl p-4 border-2 transition-all hover-scale ${
                  selectedSquad.includes(member.id)
                    ? 'border-green-500 bg-green-500/10 animate-pulse'
                    : 'border-gray-500/20 hover:border-gray-400'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setSelectedSquad(prev => 
                        prev.includes(member.id) 
                          ? prev.filter(id => id !== member.id)
                          : [...prev, member.id]
                      )}
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        selectedSquad.includes(member.id)
                          ? 'border-green-500 bg-green-500 animate-pulse'
                          : 'border-gray-500 hover:border-green-400'
                      }`}
                    >
                      {selectedSquad.includes(member.id) && <span className="text-white text-xs">✓</span>}
                    </button>
                    
                    <div>
                      <h4 className="text-white font-medium">{member.name}</h4>
                      <p className="text-sm text-gray-400">
                        Lv.{member.level} • {member.specialization}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className={`w-2 h-2 rounded-full ${
                          member.stats.health > 80 ? 'bg-green-500' :
                          member.stats.health > 40 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}></div>
                        <span className="text-xs text-gray-400">
                          {member.stats.health}/{member.stats.maxHealth} HP
                        </span>
                        {/* Active Chems Display */}
                        {member.activeChems && member.activeChems.length > 0 && (
                          <div className="flex space-x-1">
                            {member.activeChems.map(chem => {
                              const timeLeft = Math.max(0, (chem.appliedAt + chem.duration) - Date.now());
                              const minutes = Math.floor(timeLeft / 60000);
                              const seconds = Math.floor((timeLeft % 60000) / 1000);
                              return (
                                <span key={chem.id} className="text-xs bg-purple-500/20 text-purple-400 px-1 py-0.5 rounded">
                                  {chem.name} ({minutes}:{seconds.toString().padStart(2, '0')})
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enhanced Combat Stats Display with Equipment Info */}
                <div className="grid grid-cols-3 gap-4 mb-3 p-3 bg-black/20 rounded-lg">
                  <div>
                    <h5 className="text-xs text-gray-400 mb-2">Combat Stats</h5>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Damage:</span>
                        <span className="text-red-400 font-bold">{combatStats.damage}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Accuracy:</span>
                        <span className="text-yellow-400">{combatStats.accuracy}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Health:</span>
                        <span className="text-green-400">{combatStats.health}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Defense:</span>
                        <span className="text-blue-400">{combatStats.defense}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h5 className="text-xs text-gray-400 mb-2">Equipment</h5>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Weapon:</span>
                        <span className={member.equipment?.weapon ? "text-green-400" : "text-red-400"}>
                          {member.equipment?.weapon ? '✓ Armed' : '✗ Unarmed'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Armor:</span>
                        <span className={member.equipment?.armor ? "text-green-400" : "text-red-400"}>
                          {member.equipment?.armor ? '✓ Protected' : '✗ Exposed'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Accessory:</span>
                        <span className={member.equipment?.accessory ? "text-green-400" : "text-gray-500"}>
                          {member.equipment?.accessory ? '✓ Equipped' : '✗ None'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h5 className="text-xs text-gray-400 mb-2">Combat Power</h5>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Overall:</span>
                        <span className="text-cyan-400 font-bold">{Math.round(combatStats.overallStat)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Fire Rate:</span>
                        <span className="text-purple-400">{combatStats.fireRate || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Attack Speed:</span>
                        <span className="text-orange-400">{combatStats.attackInterval}s</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Chem Application */}
                {selectedSquad.includes(member.id) && (
                  <div className="border-t border-gray-500/20 pt-3 animate-fade-in">
                    <p className="text-sm text-gray-400 mb-2">Apply Chems:</p>
                    <div className="flex flex-wrap gap-2">
                      {gameState.inventory
                        .filter(item => item.type === 'chem' && item.quantity > 0)
                        .map(chem => (
                          <button
                            key={chem.id}
                            onClick={() => {
                              setAppliedChems(prev => ({
                                ...prev,
                                [member.id]: [...(prev[member.id] || []), chem.id]
                              }));
                              useChem(chem.id, member.id);
                            }}
                            disabled={appliedChems[member.id]?.includes(chem.id)}
                            className="text-xs bg-purple-600 hover:bg-purple-500 disabled:bg-gray-600 disabled:cursor-not-allowed px-2 py-1 rounded text-white transition-all hover-scale"
                            title={chem.function}
                          >
                            {chem.icon} {chem.name}
                          </button>
                        ))
                      }
                    </div>
                    
                    {appliedChems[member.id]?.length > 0 && (
                      <div className="mt-2 text-xs text-purple-400 animate-pulse">
                        Active: {appliedChems[member.id].map(chemId => {
                          const chem = gameState.inventory.find(item => item.id === chemId);
                          return chem?.name;
                        }).join(', ')}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Combat Initiation with Enhanced Info */}
      {selectedTarget && selectedSquad.length > 0 && (
        <div className="bg-black/20 rounded-xl p-4 animate-scale-in">
          <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Win Probability:</span>
                <span className={`font-bold text-lg ${
                  calculateWinChance() >= 70 ? 'text-green-400' : 
                  calculateWinChance() >= 40 ? 'text-yellow-400' : 'text-red-400'
                } animate-pulse`}>
                  {calculateWinChance()}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Squad Damage:</span>
                <span className="text-red-400 font-semibold">
                  {gameState.squad
                    .filter(member => selectedSquad.includes(member.id))
                    .reduce((sum, member) => sum + calculateCombatStats(member).damage, 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Squad Accuracy:</span>
                <span className="text-yellow-400 font-semibold">
                  {Math.round(gameState.squad
                    .filter(member => selectedSquad.includes(member.id))
                    .reduce((sum, member) => sum + calculateCombatStats(member).accuracy, 0) / selectedSquad.length)}%
                </span>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Estimated Duration:</span>
                <span className="text-white font-semibold">
                  {Math.floor(calculateEstimatedDuration() / 60)}m {calculateEstimatedDuration() % 60}s
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Total Health:</span>
                <span className="text-green-400 font-semibold">
                  {gameState.squad
                    .filter(member => selectedSquad.includes(member.id))
                    .reduce((sum, member) => sum + calculateCombatStats(member).health, 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Armed Members:</span>
                <span className="text-blue-400 font-semibold">
                  {gameState.squad
                    .filter(member => selectedSquad.includes(member.id) && member.equipment?.weapon)
                    .length}/{selectedSquad.length}
                </span>
              </div>
            </div>
          </div>
          
          <button
            onClick={startCombat}
            disabled={!canStartCombat()}
            className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed p-4 rounded-lg text-white font-bold transition-all flex items-center justify-center space-x-2 hover-scale"
          >
            <Sword size={20} className="animate-pulse" />
            <span>{canStartCombat() ? 'Engage in Combat' : 'Cannot Start Combat'}</span>
          </button>
        </div>
      )}
    </div>
  );
};
