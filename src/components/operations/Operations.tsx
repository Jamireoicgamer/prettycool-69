
import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { Radio, Clock, MapPin, Users, Star, ChevronRight, AlertTriangle, Target, Crosshair } from 'lucide-react';
import { SANDY_SHORES_QUESTLINE } from '@/data/SandyShoresQuests';

export const Operations = () => {
  const { gameState, startMission, handleEventChoice, addNotification } = useGame();
  const [selectedMission, setSelectedMission] = useState<string | null>(null);
  const [selectedSquad, setSelectedSquad] = useState<string[]>([]);

  const randomEvents = gameState.activeEvents || [];
  const activeMissions = gameState.activeMissions || [];
  const availableSquad = gameState.squad.filter(member => member.status === 'available');

  // Filter available missions based on completion status and requirements
  const availableMissions = SANDY_SHORES_QUESTLINE.filter((mission, index) => {
    const isCompleted = gameState.completedMissions.some(completed => completed.id === mission.id);
    const isUnlocked = index === 0 || gameState.completedMissions.some(completed => completed.id === SANDY_SHORES_QUESTLINE[index - 1].id);
    const meetsRequirements = gameState.commanderLevel >= mission.requirements.level;
    
    return !isCompleted && isUnlocked && meetsRequirements;
  });

  // State for player character inclusion
  const [includePlayer, setIncludePlayer] = useState(false);

  // ============ MISSION MANAGEMENT FUNCTIONS ============
  const startSelectedMission = () => {
    if (!selectedMission || selectedSquad.length === 0) return;

    const mission = SANDY_SHORES_QUESTLINE.find(m => m.id === selectedMission);
    if (!mission) return;

    // Check requirements
    const foodNeeded = selectedSquad.length * 2;
    const waterNeeded = selectedSquad.length * 3;

    if (gameState.food < foodNeeded || gameState.water < waterNeeded) {
      addNotification({
        id: `mission-supplies-${Date.now()}`,
        type: 'error',
        title: 'Insufficient Supplies',
        message: `Need ${foodNeeded} food and ${waterNeeded} water to start mission`,
        priority: 'high'
      });
      return;
    }

    if (gameState.commanderLevel < mission.requirements.level) {
      addNotification({
        id: `mission-level-${Date.now()}`,
        type: 'error',
        title: 'Level Requirements Not Met',
        message: `Commander level ${mission.requirements.level} required`,
        priority: 'medium'
      });
      return;
    }

    if (selectedSquad.length < mission.requirements.squadSize) {
      addNotification({
        id: `mission-squad-${Date.now()}`,
        type: 'error',
        title: 'Squad Size Requirements Not Met',
        message: `Minimum ${mission.requirements.squadSize} squad members required`,
        priority: 'medium'
      });
      return;
    }

    // Create proper mission data with weaker enemies for difficulty 1-2
    const adjustedEnemies = mission.enemies?.map(enemy => {
      if (mission.difficulty <= 2) {
        return {
          ...enemy,
          health: Math.floor(enemy.health * 0.6),
          damage: Math.floor(enemy.damage * 0.7),
          accuracy: Math.max(30, enemy.accuracy - 20)
        };
      }
      return enemy;
    });

    const missionData = {
      title: mission.title,
      type: mission.type,
      difficulty: mission.difficulty,
      duration: mission.duration,
      location: mission.location,
      description: mission.description,
      rewards: mission.rewards,
      enemies: adjustedEnemies || [],
      lore: mission.lore,
      includePlayer: includePlayer
    };

    // Start mission with proper data
    const missionStarted = startMission(selectedMission, selectedSquad, missionData);
    
    if (missionStarted) {
      addNotification({
        id: `mission-start-${Date.now()}`,
        type: 'success',
        title: 'Mission Started',
        message: `Squad deployed to ${mission.location}`,
        priority: 'medium'
      });

      setSelectedMission(null);
      setSelectedSquad([]);
    }
  };

  const toggleSquadMember = (memberId: string) => {
    setSelectedSquad(prev => 
      prev.includes(memberId) 
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const formatTime = (timestamp: number) => {
    const timeLeft = Math.max(0, timestamp - Date.now());
    const minutes = Math.floor(timeLeft / 60000);
    const seconds = Math.floor((timeLeft % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-4 space-y-4">
      {/* ============ HEADER ============ */}
      <div className="bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-amber-500/20">
        <h2 className="text-xl font-bold text-amber-400 mb-2">Operations Command</h2>
        <p className="text-gray-400 text-sm">Sandy Shores Campaign missions and special operations</p>
      </div>

      {/* ============ RANDOM EVENTS ============ */}
      {randomEvents.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-red-400">⚠️ Active Events</h3>
          {randomEvents.map((event, index) => (
            <div key={event.id} className="bg-red-900/20 backdrop-blur-sm rounded-xl p-4 border border-red-500/30">
              <h4 className="text-white font-semibold mb-2">{event.title}</h4>
              <p className="text-gray-300 text-sm mb-3">{event.description}</p>
              <div className="space-y-2">
                {event.choices.map((choice, choiceIndex) => (
                  <button
                    key={choiceIndex}
                    onClick={() => handleEventChoice(event.id, choiceIndex)}
                    className="w-full bg-red-600 hover:bg-red-500 p-2 rounded-lg text-white text-sm font-medium transition-all text-left"
                  >
                    {choice.text}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ============ ACTIVE MISSIONS STATUS ============ */}
      {activeMissions.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-blue-400">🎯 Active Operations</h3>
          {activeMissions.map((mission) => {
            const timeLeft = Math.max(0, mission.duration * 60000 - (Date.now() - mission.startTime));
            const progress = Math.min(100, ((Date.now() - mission.startTime) / (mission.duration * 60000)) * 100);
            
            return (
              <div key={mission.id} className="bg-blue-900/20 backdrop-blur-sm rounded-xl p-4 border border-blue-500/30">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-white font-semibold">{mission.title}</h4>
                  <span className="text-blue-400 text-sm">
                    {Math.ceil(timeLeft / 60000)}m remaining
                  </span>
                </div>
                
                <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all animate-pulse"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Squad: {mission.assignedSquad.length} operatives</span>
                  <span className="text-gray-400">{mission.location}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ============ SANDY SHORES MAIN QUEST LINE ============ */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-amber-400">📖 Sandy Shores Campaign</h3>
        <p className="text-gray-400 text-sm">Available missions in the Sandy Shores storyline</p>
        {availableMissions.length === 0 ? (
          <div className="bg-gray-900/20 backdrop-blur-sm rounded-xl p-4 border border-gray-500/30">
            <p className="text-gray-400 text-center">No missions currently available. Complete more operations or level up to unlock new missions.</p>
          </div>
        ) : (
          availableMissions.map((mission) => (
            <div
              key={mission.id}
              onClick={() => setSelectedMission(mission.id)}
              className={`bg-black/40 backdrop-blur-sm rounded-xl p-4 border-2 transition-all cursor-pointer ${
                selectedMission === mission.id
                  ? 'border-amber-500 bg-amber-500/10'
                  : 'border-gray-500/20 hover:border-gray-400'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-white font-semibold flex items-center">
                  <span className="text-xs bg-gray-600 text-gray-300 px-2 py-1 rounded mr-2">
                    #{mission.questIndex}
                  </span>
                  {mission.title}
                </h4>
                <div className="flex items-center space-x-2">
                  <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-1 rounded-full">
                    Level {mission.requirements.level}
                  </span>
                  <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">
                    {mission.duration}m
                  </span>
                  <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full">
                    {mission.type}
                  </span>
                </div>
              </div>
              
              <p className="text-gray-400 text-sm mb-2">{mission.description}</p>
              
              {/* Mission Enemy Info */}
              {mission.enemies && mission.enemies.length > 0 && (
                <div className="bg-red-900/20 rounded-lg p-2 mb-2">
                  <p className="text-red-400 text-xs font-medium mb-1">Expected Enemies:</p>
                  <div className="flex flex-wrap gap-1">
                    {mission.enemies.map((enemy, enemyIndex) => (
                      <span key={enemyIndex} className="text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded">
                        {enemy.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex items-center justify-between text-sm mb-2">
                <div className="flex items-center space-x-3">
                  <span className="text-yellow-400">{mission.rewards.caps} 💰</span>
                  {mission.rewards.scrip && <span className="text-blue-400">{mission.rewards.scrip} 🔧</span>}
                  {mission.rewards.techFrags && <span className="text-purple-400">{mission.rewards.techFrags} ⚙️</span>}
                  <span className="text-green-400">{mission.rewards.experience} XP</span>
                </div>
                <span className="text-gray-400">{mission.location}</span>
              </div>

              {/* Reward Items */}
              {mission.rewards.items && mission.rewards.items.length > 0 && (
                <div className="bg-green-900/20 rounded-lg p-2 mb-2">
                  <p className="text-green-400 text-xs font-medium mb-1">Reward Items:</p>
                  <div className="flex flex-wrap gap-1">
                    {mission.rewards.items.map((item, itemIndex) => (
                      <span key={itemIndex} className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Lore Section */}
              {selectedMission === mission.id && (
                <div className="bg-blue-900/20 rounded-lg p-3 mb-2 animate-fade-in">
                  <p className="text-blue-400 text-xs font-medium mb-1">Mission Lore:</p>
                  <p className="text-blue-300 text-xs leading-relaxed">{mission.lore}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* ============ SQUAD SELECTION FOR SELECTED MISSION ============ */}
      {selectedMission && (
        <div className="space-y-3 animate-fade-in">
          <h3 className="text-lg font-semibold text-amber-400">Select Squad</h3>
          
          {/* Player Character Option */}
          {gameState.playerCharacter && (
            <div className="bg-blue-900/20 backdrop-blur-sm rounded-xl p-3 border-2 border-blue-500/30 mb-4">
              <div
                onClick={() => setIncludePlayer(!includePlayer)}
                className={`cursor-pointer transition-all ${
                  includePlayer ? 'opacity-100' : 'opacity-60 hover:opacity-80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-blue-300 font-bold flex items-center">
                      {gameState.playerCharacter.name} (YOU) 
                      <span className="ml-2 text-xs bg-blue-500/30 px-2 py-1 rounded">COMMANDER</span>
                    </h4>
                    <p className="text-sm text-blue-400">Level {gameState.playerCharacter.level} • Player Character</p>
                    <div className="flex items-center space-x-2 text-xs text-blue-300 mt-1">
                      <span>🍞 {Math.floor(gameState.playerCharacter.needs.hunger)}%</span>
                      <span>💧 {Math.floor(gameState.playerCharacter.needs.thirst)}%</span>
                      <span>❤️ {Math.floor(gameState.playerCharacter.health)}/{gameState.playerCharacter.maxHealth}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-1">
                      <div className={`w-3 h-3 rounded-full ${includePlayer ? 'bg-blue-500' : 'bg-gray-500'}`}></div>
                      <span className={`text-xs ${includePlayer ? 'text-blue-300' : 'text-gray-400'}`}>
                        {includePlayer ? 'Included' : 'Not Included'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {availableSquad.map((member) => (
            <div
              key={member.id}
              onClick={() => toggleSquadMember(member.id)}
              className={`bg-black/40 backdrop-blur-sm rounded-xl p-3 border-2 cursor-pointer transition-all ${
                selectedSquad.includes(member.id)
                  ? 'border-green-500 bg-green-500/10'
                  : 'border-gray-500/20 hover:border-gray-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-white font-medium">{member.name}</h4>
                  <p className="text-sm text-gray-400">Level {member.level} • {member.specialization}</p>
                  <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                    <span>🍞 {Math.floor(member.stats.hunger)}%</span>
                    <span>💧 {Math.floor(member.stats.thirst)}%</span>
                    <span>❤️ {Math.floor(member.stats.health)}/{member.stats.maxHealth}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-green-400">Available</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {selectedSquad.length > 0 && (
            <div className="bg-black/20 rounded-xl p-4">
              <div className="mb-3">
                <p className="text-gray-400 text-sm">Resource Requirements:</p>
                <div className="flex space-x-4 text-sm">
                  <span className={`${gameState.food >= (selectedSquad.length + (includePlayer ? 1 : 0)) * 2 ? 'text-green-400' : 'text-red-400'}`}>
                    Food: {(selectedSquad.length + (includePlayer ? 1 : 0)) * 2} (Have: {gameState.food})
                  </span>
                  <span className={`${gameState.water >= (selectedSquad.length + (includePlayer ? 1 : 0)) * 3 ? 'text-green-400' : 'text-red-400'}`}>
                    Water: {(selectedSquad.length + (includePlayer ? 1 : 0)) * 3} (Have: {gameState.water})
                  </span>
                </div>
                {includePlayer && (
                  <p className="text-blue-400 text-xs mt-1">
                    ✓ Commander {gameState.playerCharacter?.name} will join this mission
                  </p>
                )}
              </div>
              
              <button
                onClick={startSelectedMission}
                disabled={gameState.food < (selectedSquad.length + (includePlayer ? 1 : 0)) * 2 || gameState.water < (selectedSquad.length + (includePlayer ? 1 : 0)) * 3}
                className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed p-3 rounded-lg text-white font-bold transition-all"
              >
                {includePlayer ? 'Deploy Squad + Commander' : 'Deploy Squad'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
