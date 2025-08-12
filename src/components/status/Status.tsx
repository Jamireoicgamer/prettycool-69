
import React from 'react';
import { useGame } from '@/context/GameContext';
import { Clock, Wrench, Swords, Radio, CheckCircle, AlertCircle, X, MessageSquare, Users, MapPin, Target, TrendingUp, TrendingDown } from 'lucide-react';
import { COMBAT_TARGETS } from '@/components/combat/CombatTargets';
import { calculateCombatStats } from '@/utils/CombatCalculations';
import { RealTimeCombatStatus } from '../combat/RealTimeCombatStatus';

export const Status = () => {
  const { gameState, abortMission, respondToEncounter } = useGame();
  const activeMissions = gameState.activeMissions || [];
  const activeUpgrades = gameState.baseModules.filter(m => m.recruitmentActive);
  const combatOngoing = Object.keys(gameState.combatCooldowns).filter(key => gameState.combatCooldowns[key] > Date.now());
  const missedEncounters = gameState.encounterHistory.filter(e => !e.responded);

  const getTimeRemaining = (startTime: number, duration: number) => {
    const elapsed = Date.now() - startTime;
    const remaining = Math.max(0, (duration * 60 * 1000) - elapsed);
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getProgress = (startTime: number, duration: number) => {
    const elapsed = Date.now() - startTime;
    return Math.min(100, (elapsed / (duration * 60 * 1000)) * 100);
  };

  const getMissionPhase = (progress: number) => {
    if (progress < 25) return { phase: 'Approaching target location', icon: '🚶‍♂️' };
    if (progress < 50) return { phase: 'Engaging hostile forces', icon: '⚔️' };
    if (progress < 75) return { phase: 'Securing the area', icon: '🛡️' };
    return { phase: 'Returning to base', icon: '🏠' };
  };

  const calculateWinChance = (mission: any) => {
    if (!mission.targetId) return 50;
    
    const target = COMBAT_TARGETS.find(t => t.id === mission.targetId);
    if (!target) return 50;

    const squadMembers = gameState.squad.filter(member => mission.assignedSquad.includes(member.id));
    let totalCombatPower = 0;
    
    squadMembers.forEach(member => {
      const combatStats = calculateCombatStats(member);
      totalCombatPower += combatStats.damage;
    });
    
    const enemyPower = target.enemies.reduce((sum, enemy) => sum + enemy.damage + enemy.health/10, 0);
    const baseChance = Math.min(95, Math.max(5, (totalCombatPower / enemyPower) * 50 + 25));
    
    return Math.round(baseChance);
  };

  return (
    <div className="p-4 space-y-4 animate-fade-in">
      {/* Real-Time Combat Status */}
      <RealTimeCombatStatus />
      
      {/* Header */}
      <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-amber-500/20 animate-scale-in">
        <h2 className="text-xl font-bold text-amber-400 mb-2">Live Operations Status</h2>
        <p className="text-gray-400 text-sm">Real-time monitoring of all active operations</p>
      </div>

      {/* Active Missions with Live Details */}
      {activeMissions.length > 0 && (
        <div className="space-y-3 animate-fade-in">
          <h3 className="text-lg font-semibold text-blue-400">🎯 Active Operations</h3>
          {activeMissions.map((mission) => {
            const progress = getProgress(mission.startTime, mission.duration);
            const timeLeft = getTimeRemaining(mission.startTime, mission.duration);
            const missionPhase = getMissionPhase(progress);
            const winChance = calculateWinChance(mission);
            const target = COMBAT_TARGETS.find(t => t.id === mission.targetId);
            
            return (
              <div key={mission.id} className="bg-blue-900/20 backdrop-blur-sm rounded-xl p-4 border border-blue-500/30 animate-scale-in">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-white font-semibold flex items-center">
                    <Radio className="mr-2 text-blue-400 animate-pulse" size={16} />
                    {mission.title}
                  </h4>
                  <span className="text-blue-400 text-sm font-mono animate-pulse">{timeLeft}</span>
                </div>
                
                {/* Live Location and Phase */}
                <div className="mb-3 p-2 bg-black/20 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <MapPin className="text-yellow-400 animate-pulse" size={14} />
                      <span className="text-white text-sm font-medium">{mission.location}</span>
                    </div>
                    <span className="text-xs text-gray-400">{Math.round(progress)}% Complete</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-lg animate-bounce">{missionPhase.icon}</span>
                    <span className="text-green-400 text-sm animate-pulse">{missionPhase.phase}</span>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-700 rounded-full h-3 mb-3 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-1000 animate-pulse"
                    style={{ width: `${progress}%` }}
                  >
                    <div className="w-full h-full bg-white/20 animate-pulse"></div>
                  </div>
                </div>
                
                {/* Squad Status */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="bg-black/20 p-2 rounded-lg">
                    <div className="flex items-center space-x-1 mb-1">
                      <Users className="text-blue-400" size={12} />
                      <span className="text-gray-400 text-xs">Squad Status</span>
                    </div>
                    <p className="text-white text-sm">{mission.assignedSquad.length} operatives deployed</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {mission.assignedSquad.map(memberId => {
                        const member = gameState.squad.find(m => m.id === memberId);
                        return member ? (
                          <span key={memberId} className="text-xs bg-blue-500/20 text-blue-400 px-1 py-0.5 rounded">
                            {member.name}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                  
                  {/* Combat Analysis for Combat Missions */}
                  {(mission.type === 'combat' || mission.id.startsWith('combat-')) && target && (
                    <div className="bg-black/20 p-2 rounded-lg">
                      <div className="flex items-center space-x-1 mb-1">
                        <Target className="text-red-400" size={12} />
                        <span className="text-gray-400 text-xs">Combat Status</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white text-sm">vs {target.name}</span>
                        <div className="flex items-center space-x-1">
                          {winChance >= 60 ? (
                            <TrendingUp className="text-green-400 animate-pulse" size={12} />
                          ) : (
                            <TrendingDown className="text-red-400 animate-pulse" size={12} />
                          )}
                          <span className={`text-xs font-bold ${
                            winChance >= 60 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {winChance >= 60 ? 'Winning' : 'Struggling'}
                          </span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        Win Chance: {winChance}%
                      </div>
                    </div>
                  )}
                </div>

                {/* Live Mission Updates */}
                <div className="bg-green-900/20 p-2 rounded-lg mb-3 border border-green-500/30">
                  <div className="flex items-center space-x-2 mb-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
                    <span className="text-green-400 text-xs font-medium">LIVE UPDATE</span>
                  </div>
                  <p className="text-green-300 text-xs">
                    {progress < 25 && "Squad moving through wasteland terrain..."}
                    {progress >= 25 && progress < 50 && target && `Engaging ${target.enemies.length} hostile${target.enemies.length > 1 ? 's' : ''} at ${mission.location}...`}
                    {progress >= 50 && progress < 75 && "Securing perimeter and searching for loot..."}
                    {progress >= 75 && "Mission objectives complete, returning to base..."}
                  </p>
                </div>

                {/* Mission Actions */}
                <div className="flex space-x-2">
                  <button 
                    onClick={() => abortMission(mission.id)}
                    className="bg-red-600 hover:bg-red-500 px-3 py-1 rounded-lg text-white text-sm transition-all flex items-center space-x-1 hover-scale"
                  >
                    <X size={14} />
                    <span>Abort Mission</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Missed Encounters & Events */}
      {missedEncounters.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-orange-400">⚠️ Missed Encounters ({missedEncounters.length})</h3>
          {missedEncounters.map((encounter) => (
            <div key={encounter.id} className="bg-orange-900/20 backdrop-blur-sm rounded-xl p-4 border border-orange-500/30">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-white font-semibold flex items-center">
                  <MessageSquare className="mr-2 text-orange-400" size={16} />
                  {encounter.title}
                </h4>
                <span className="text-orange-400 text-xs">
                  {new Date(encounter.timestamp).toLocaleTimeString()}
                </span>
              </div>
              
              <p className="text-gray-300 text-sm mb-3">{encounter.message}</p>
              
              <div className="flex items-center space-x-2 mb-3">
                <Users className="text-gray-400" size={16} />
                <span className="text-gray-400 text-sm">
                  {encounter.character.name} ({encounter.character.faction})
                </span>
              </div>

              {encounter.dialogueOptions && (
                <div className="space-y-2">
                  <p className="text-gray-400 text-xs">Choose your response:</p>
                  {encounter.dialogueOptions.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => respondToEncounter(encounter.id, index)}
                      disabled={option.requirement && gameState.squad.some(m => 
                        m.stats.charisma < (option.requirement?.charisma || 0)
                      )}
                      className="w-full bg-orange-600 hover:bg-orange-500 disabled:bg-gray-600 disabled:cursor-not-allowed p-2 rounded-lg text-white text-sm transition-all text-left"
                    >
                      {option.text}
                      {option.requirement && (
                        <span className="text-orange-300 text-xs ml-2">
                          (Requires Charisma {option.requirement.charisma})
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Encounter History */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-purple-400">📚 Encounter History</h3>
        <div className="bg-purple-900/20 backdrop-blur-sm rounded-xl p-4 border border-purple-500/30 max-h-60 overflow-y-auto">
          {gameState.encounterHistory.length === 0 ? (
            <p className="text-gray-400 text-sm">No encounters yet</p>
          ) : (
            <div className="space-y-2">
              {gameState.encounterHistory.slice(0, 10).map((encounter) => (
                <div key={encounter.id} className="bg-black/20 p-2 rounded-lg">
                  <div className="flex items-center justify-between">
                    <h5 className="text-white text-sm font-medium">{encounter.title}</h5>
                    <span className="text-gray-400 text-xs">
                      {new Date(encounter.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-400 text-xs">{encounter.character.name} - {encounter.character.faction}</p>
                  {encounter.outcome && (
                    <p className="text-green-400 text-xs mt-1">
                      Outcome: {encounter.outcome}
                    </p>
                  )}
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    encounter.responded ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {encounter.responded ? 'Responded' : 'Missed'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Base Upgrades & Activities */}
      {activeUpgrades.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-green-400">🔧 Base Activities</h3>
          {activeUpgrades.map((module) => (
            <div key={module.id} className="bg-green-900/20 backdrop-blur-sm rounded-xl p-4 border border-green-500/30">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-white font-semibold flex items-center">
                  <Wrench className="mr-2 text-green-400" size={16} />
                  {module.name}
                </h4>
                <span className="text-green-400 text-sm">Active</span>
              </div>
              <p className="text-gray-400 text-sm">{module.description}</p>
              
              {module.type === 'recruitment' && (
                <div className="mt-2">
                  <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                    <div className="bg-green-500 h-2 rounded-full animate-pulse" style={{ width: '60%' }} />
                  </div>
                  <p className="text-green-400 text-xs">Broadcasting recruitment signal...</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Combat Cooldowns */}
      {combatOngoing.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-red-400">⚔️ Combat Status</h3>
          {combatOngoing.map((targetId) => {
            const cooldownEnd = gameState.combatCooldowns[targetId];
            const timeLeft = Math.max(0, cooldownEnd - Date.now());
            const minutes = Math.floor(timeLeft / 60000);
            
            return (
              <div key={targetId} className="bg-red-900/20 backdrop-blur-sm rounded-xl p-4 border border-red-500/30">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-white font-semibold flex items-center">
                    <Swords className="mr-2 text-red-400" size={16} />
                    Combat Recovery
                  </h4>
                  <span className="text-red-400 text-sm">{minutes}m left</span>
                </div>
                <p className="text-gray-400 text-sm">Squad recovering from recent combat</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Completed Activities Today */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-400">✅ Recent Completions</h3>
        <div className="bg-gray-900/20 backdrop-blur-sm rounded-xl p-4 border border-gray-500/30">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-white font-semibold flex items-center">
              <CheckCircle className="mr-2 text-gray-400" size={16} />
              Missions Completed Today
            </h4>
            <span className="text-gray-400 text-sm">{gameState.completedMissions.length}</span>
          </div>
          <p className="text-gray-400 text-sm">View your recent achievements and rewards</p>
        </div>
      </div>

      {/* No Active Operations */}
      {activeMissions.length === 0 && activeUpgrades.length === 0 && combatOngoing.length === 0 && missedEncounters.length === 0 && (
        <div className="text-center py-8 animate-fade-in">
          <AlertCircle className="mx-auto text-gray-400 mb-2 animate-pulse" size={48} />
          <p className="text-gray-400 mb-2">No active operations</p>
          <p className="text-gray-500 text-sm">Deploy squads on missions or start base activities</p>
        </div>
      )}
    </div>
  );
};
