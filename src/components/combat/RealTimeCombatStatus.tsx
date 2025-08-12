import React, { useState, useEffect, useMemo } from 'react';
import { Sword, Shield, Eye, Map, Clock, Target, Activity } from 'lucide-react';
import { useGame } from '@/context/GameContext';
import { TERRAIN_TYPES } from '@/data/TerrainTypes';
import { EnhancedRealCombatAI } from '@/utils/EnhancedRealCombatAI';
import { CombatSynchronizer } from '@/utils/CombatSynchronizer';
import { getWeatherModifiers } from '@/data/WeatherEvents';

export const RealTimeCombatStatus: React.FC = () => {
  const { gameState } = useGame();
  const [combatActions, setCombatActions] = useState<string[]>([]);
  const [squadHealths, setSquadHealths] = useState<{ [id: string]: number }>({});
  const [missionPhase, setMissionPhase] = useState<'travel' | 'setup' | 'combat' | 'return'>('travel');
  const [combatComplete, setCombatComplete] = useState(false);
  const [actualCombatDuration, setActualCombatDuration] = useState<number | null>(null);
  const [tick, setTick] = useState(0);
  const [lastMemberActions, setLastMemberActions] = useState<{ [memberId: string]: string }>({});
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  // Memoize ongoing combat missions to prevent infinite re-renders
  const ongoingCombatMissions = useMemo(() => 
    gameState.activeMissions.filter(mission => 
      mission.type === 'combat' || mission.id.startsWith('combat-')
    ), [gameState.activeMissions]
  );

  // Derive active mission and safe computed values BEFORE any conditional return.
  const activeMission = ongoingCombatMissions[0];
  const combatSynchronizer = CombatSynchronizer.getInstance();
  const isCombatActive = activeMission ? combatSynchronizer.isCombatActive(activeMission.id) : false;

  const missionStartTime = activeMission?.startTime ?? 0;
  const missionDurationMs = activeMission ? activeMission.duration * 60000 : 0;
  const elapsed = activeMission ? Date.now() - missionStartTime : 0;
  const elapsedMinutes = elapsed / 60000;

  // Terrain-aware travel/setup windows (fractions of mission duration)
  const travelPhaseFraction = activeMission ? (
    activeMission.location.includes('Junction') ? 0.3 :
    activeMission.location.includes('Complex') ? 0.25 :
    activeMission.location.includes('Valley') ? 0.2 : 0.15
  ) : 0;
  const setupPhaseFraction = activeMission ? 0.1 : 0;
  const missionDurationMinutes = activeMission ? activeMission.duration : 0;
  const travelMinutes = missionDurationMinutes * travelPhaseFraction;
  const setupMinutes = missionDurationMinutes * setupPhaseFraction;
  const combatStartMinuteThreshold = travelMinutes + setupMinutes;

  // Phase progression based on actual time and combat state
  useEffect(() => {
    if (!activeMission) {
      // Reset to default when no mission is active
      setMissionPhase('travel');
      setCombatComplete(false);
      setActualCombatDuration(null);
      return;
    }

    if (elapsedMinutes < travelMinutes) {
      setMissionPhase('travel');
    } else if (elapsedMinutes < combatStartMinuteThreshold) {
      setMissionPhase('setup');
    } else if (isCombatActive && !combatComplete) {
      setMissionPhase('combat');
    } else {
      setMissionPhase('return');
    }
  }, [activeMission?.id, elapsedMinutes, isCombatActive, combatComplete]);

  // Initialize listeners and event streaming (do not auto-start combat here)
  useEffect(() => {
    if (!activeMission) {
      setCombatActions([]);
      setSquadHealths({});
      setCombatComplete(false);
      setActualCombatDuration(null);
      return;
    }

    const missionId = activeMission.id;
    const synchronizer = CombatSynchronizer.getInstance();

    // Listen for combat completion
    synchronizer.onCombatComplete(missionId, (victory: boolean, duration: number) => {
      setCombatComplete(true);
      setActualCombatDuration(duration);
      // Snapshot final healths so return phase reflects post-battle state
      const results = synchronizer.getCombatResults(missionId);
      if (results?.finalHealths) {
        setSquadHealths(results.finalHealths);
      }
      setCombatActions(prev => [
        `Combat concluded: ${victory ? 'Tactical Victory' : 'Mission Failed'} (${Math.floor(duration)}s)`,
        ...prev.slice(0, 9)
      ]);
    });

    // Stream latest combat events for UI
    const seenIds = new Set<string>();
    const updateCombatEvents = () => {
      const combatState = synchronizer.getCombatState(missionId);
      if (combatState && combatState.events.length > 0) {
        // Append any new events we haven't shown yet (by id)
        const newEvents = combatState.events.slice(-20);
        setCombatActions(prev => {
          const updated = [...prev];
          newEvents.forEach(evt => {
            if (!seenIds.has(evt.id) && evt.description) {
              seenIds.add(evt.id);
              updated.unshift(evt.description);
            }
          });
          return updated.slice(0, 20);
        });

        // Update per-member last actions from events
        const memberNames = new Set([
          ...gameState.squad.map(m => m.name),
          ...(gameState.playerCharacter ? [gameState.playerCharacter.name] : [])
        ]);
        const latestByActor: { [name: string]: string } = {} as any;
        newEvents.forEach(evt => {
          if (evt.actor && memberNames.has(evt.actor) && evt.description) {
            latestByActor[evt.actor] = evt.description;
          }
        });
        if (Object.keys(latestByActor).length > 0) {
          setLastMemberActions(prev => ({ ...prev, ...latestByActor }));
        }

        // Update health if damage was dealt to a named squad member
        const latestDamage = [...newEvents].reverse().find(e => e.damage && e.target);
        if (latestDamage && latestDamage.damage && latestDamage.target) {
          setSquadHealths(prev => {
            const squadMember = gameState.squad.find(m => m.name === latestDamage.target);
            const playerHit = gameState.playerCharacter && gameState.playerCharacter.name === latestDamage.target;
            const targetId = squadMember?.id || (playerHit ? gameState.playerCharacter!.id : null);
            if (targetId) {
              const current = prev[targetId] ?? (squadMember ? squadMember.stats.health : 100);
              return {
                ...prev,
                [targetId]: Math.max(0, current - latestDamage.damage!)
              };
            }
            return prev;
          });
        }
      }
    };

    const eventInterval = setInterval(updateCombatEvents, 1000);
    return () => clearInterval(eventInterval);
  }, [activeMission?.id, gameState.squad, gameState.playerCharacter]);

  // Auto-withdraw if all operatives are incapacitated
  useEffect(() => {
    if (!activeMission) return;
    const state = combatSynchronizer.getCombatState(activeMission.id);
    if (state && state.isActive) {
      const alive = state.combatants.filter(c => (c.health > 0 && c.status === 'fighting')).length;
      if (alive === 0) {
        combatSynchronizer.forceCombatEnd(activeMission.id);
        setMissionPhase('return');
        setCombatActions(prev => [
          'Forced Withdrawal: All operatives incapacitated. Extracting...',
          ...prev
        ]);
      }
    }
  }, [tick, activeMission?.id]);

  // Start synchronized combat only after travel+setup threshold is reached
  useEffect(() => {
    if (!activeMission) return;
    const synchronizer = CombatSynchronizer.getInstance();

    // Wait until after travel and setup phases
    if (elapsedMinutes < combatStartMinuteThreshold) return;
    // Do not restart if results already exist or combat is active
    if (synchronizer.getCombatResults(activeMission.id)) return;
    if (synchronizer.isCombatActive(activeMission.id)) return; // Already started

    // Build participants
    const squadMembers = activeMission.assignedSquad
      .map(id => gameState.squad.find(member => member.id === id))
      .filter(Boolean) as any[];

    const combatParticipants = [...squadMembers];
    if (activeMission.includePlayer && gameState.playerCharacter) {
      combatParticipants.push({
        id: gameState.playerCharacter.id,
        name: gameState.playerCharacter.name,
        level: gameState.playerCharacter.level,
        specialization: 'combat' as const,
        status: 'available' as const,
        stats: {
          health: gameState.playerCharacter.health,
          maxHealth: gameState.playerCharacter.maxHealth,
          combat: gameState.playerCharacter.special.strength + gameState.playerCharacter.special.perception,
          stealth: gameState.playerCharacter.special.agility,
          tech: gameState.playerCharacter.special.intelligence,
          charisma: gameState.playerCharacter.special.charisma,
          intelligence: gameState.playerCharacter.special.intelligence,
          hunger: gameState.playerCharacter.needs.hunger,
          thirst: gameState.playerCharacter.needs.thirst
        },
        equipment: gameState.playerCharacter.equipment,
        inventory: [],
        traits: gameState.playerCharacter.traits || []
      });
    }

    // Initialize squad healths from participants
    const initialHealths: { [id: string]: number } = {};
    combatParticipants.forEach(member => {
      initialHealths[member.id] = member.stats?.health || 100;
    });
    setSquadHealths(initialHealths);

    // Use mission-provided enemies with equipment when available
    const enemies = (activeMission as any).enemies && (activeMission as any).enemies.length
      ? (activeMission as any).enemies.map((e: any, i: number) => ({
          name: e.name || `Hostile ${i + 1}`,
          type: e.type || 'raider',
          health: e.health ?? 50,
          damage: e.damage ?? 12,
          accuracy: e.accuracy ?? 60,
          fireRate: e.fireRate ?? 1,
          defense: e.defense ?? 5,
          intelligence: e.intelligence ?? 40,
          weapon: e.weapon
        }))
      : Array.from({ length: activeMission.difficulty || 3 }, (_, i) => ({
          name: `Hostile ${i + 1}`,
          type: 'raider',
          health: 40 + (activeMission.difficulty * 10),
          damage: 10 + (activeMission.difficulty * 2),
          accuracy: 60 + (activeMission.difficulty * 5),
          fireRate: 1 + Math.max(0, activeMission.difficulty - 1),
          defense: 3 + activeMission.difficulty,
          intelligence: 30 + (activeMission.difficulty * 10)
        }));

    synchronizer.startSynchronizedCombat(activeMission.id, combatParticipants, enemies, activeMission as any);
  }, [activeMission?.id, elapsedMinutes, combatStartMinuteThreshold, gameState.squad, gameState.playerCharacter]);

  // If there is no mission, render the empty state AFTER all hooks are declared
  if (!activeMission) {
    return (
      <div className="bg-gray-900/20 backdrop-blur-sm rounded-xl p-4 border border-gray-500/30">
        <h3 className="text-lg font-semibold text-gray-400 mb-2 flex items-center">
          <Activity className="mr-2" size={20} />
          Live View
        </h3>
        <p className="text-gray-500 text-center">No active combat operations</p>
      </div>
    );
  }

  const timeLeft = Math.max(0, activeMission.duration * 60000 - (Date.now() - activeMission.startTime));
  const progress = Math.min(100, ((Date.now() - activeMission.startTime) / (activeMission.duration * 60000)) * 100);

  // Calculate mission phases based on actual combat state and time
  // (Phase effect was moved above; keep computed values for UI only)

  const terrain = activeMission.terrain ? 
    TERRAIN_TYPES.find(t => t.id === activeMission.terrain) : 
    null;

  // Weather info (from real-time combat if available)
  const weatherId = combatSynchronizer.getCombatState(activeMission.id)?.weather || 'clear';
  const weatherNameMap: Record<string, string> = {
    'clear': 'Clear Skies',
    'overcast': 'Overcast',
    'light-rain': 'Light Rain',
    'fog': 'Fog',
    'dust-storm': 'Dust Storm',
    'radiation-storm': 'Radiation Storm'
  };
  const weatherNotesMap: Record<string, string[]> = {
    'clear': ['No significant effects'],
    'overcast': ['Slight accuracy reduction (-2%)'],
    'light-rain': ['Reduced accuracy (-10%)'],
    'fog': ['Visibility severely reduced (-20% accuracy)'],
    'dust-storm': ['Reduced accuracy (-15%)', 'Slight damage reduction'],
    'radiation-storm': ['Reduced accuracy (-10%)', 'Minor damage reduction']
  };
  const weatherName = weatherNameMap[weatherId] || weatherId;
  const weatherNotes = weatherNotesMap[weatherId] || ['No significant effects'];

  return (
    <div className="bg-red-900/20 backdrop-blur-sm rounded-xl p-4 border border-red-500/30">
      <h3 className="text-lg font-semibold text-red-400 mb-3 flex items-center justify-between cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        <span className="flex items-center"><Sword className="mr-2 animate-pulse" size={20} />Live View</span>
        <span className="text-xs text-gray-400">{isOpen ? 'Hide' : 'Show'}</span>
      </h3>

        <div className="animate-enter animate-fade-in animate-scale-in origin-top">
          {/* Phase Title */}
          <div className="text-sm text-gray-300 mb-2">
            {missionPhase === 'travel' && `En Route: ${activeMission.title}`}
            {missionPhase === 'setup' && `Deploying: ${activeMission.title}`}
            {missionPhase === 'combat' && `Active Combat: ${activeMission.title}`}
            {missionPhase === 'return' && `Returning: ${activeMission.title}`}
          </div>

          {/* Mission Info */}
          <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Location:</span>
                <span className="text-yellow-400">{activeMission.location}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Squad Size:</span>
                <span className="text-blue-400">{activeMission.assignedSquad.length} operatives</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Phase:</span>
                <span className={`font-semibold ${
                  missionPhase === 'travel' ? 'text-yellow-400' :
                  missionPhase === 'setup' ? 'text-blue-400' :
                  missionPhase === 'combat' ? 'text-red-400' : 'text-green-400'
                }`}>
                  {missionPhase.toUpperCase()}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Time Left:</span>
                <span className="text-green-400">{Math.ceil(timeLeft / 60000)}m</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Difficulty:</span>
                <span className="text-orange-400">Level {activeMission.difficulty || 1}</span>
              </div>
              {terrain && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Terrain:</span>
                  <span className="text-purple-400 flex items-center">
                    <Map className="mr-1" size={12} />
                    {terrain.name}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-700 rounded-full h-3 mb-4">
            <div 
              className="bg-gradient-to-r from-red-600 to-orange-500 h-3 rounded-full transition-all animate-pulse"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Weather Effects */}
          <div className="bg-cyan-900/20 rounded-lg p-3 mb-4">
            <h4 className="text-cyan-400 font-medium mb-2 flex items-center">
              <Map className="mr-1" size={16} />
              Weather: {weatherName}
            </h4>
            <ul className="text-cyan-300 text-xs list-disc pl-4 space-y-1">
              {weatherNotes.map((n, i) => (
                <li key={i}>{n}</li>
              ))}
            </ul>
            {/* Squad Active Chems */}
            {activeMission.assignedSquad.some(memberId => {
              const member = gameState.squad.find(m => m.id === memberId);
              return member?.activeChems && member.activeChems.length > 0;
            }) && (
              <div className="mt-3 pt-2 border-t border-cyan-500/30">
                <p className="text-cyan-400 text-xs font-medium mb-1">Active Squad Buffs:</p>
                {activeMission.assignedSquad.map(memberId => {
                  const member = gameState.squad.find(m => m.id === memberId);
                  if (!member?.activeChems || member.activeChems.length === 0) return null;
                  return (
                    <div key={memberId} className="text-xs text-purple-300">
                      <span className="font-medium">{member.name}:</span>
                      {member.activeChems.map(chem => {
                        const timeLeft = Math.max(0, (chem.appliedAt + chem.duration) - Date.now());
                        const minutes = Math.floor(timeLeft / 60000);
                        const seconds = Math.floor((timeLeft % 60000) / 1000);
                        return (
                          <span key={chem.id} className="ml-1">
                            {chem.name} ({minutes}:{seconds.toString().padStart(2, '0')})
                          </span>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Live View Log */}
          <div className="bg-black/40 rounded-lg p-3">
            <h4 className="text-white font-medium mb-2 flex items-center">
              <Target className="mr-1" size={16} />
              {missionPhase === 'travel' && 'Live View'}
              {missionPhase === 'setup' && 'Live View'}
              {missionPhase === 'combat' && 'Live View'}
              {missionPhase === 'return' && 'Live View'}
            </h4>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {combatActions.length === 0 ? (
                <div className="text-gray-500 text-xs">
                  {missionPhase === 'travel' && 'Squad moving to target location...'}
                  {missionPhase === 'setup' && 'Squad establishing positions...'}
                  {missionPhase === 'combat' && 'Monitoring squad communications...'}
                  {missionPhase === 'return' && 'Squad returning to base...'}
                </div>
              ) : (
                combatActions.map((action, index) => (
                  <div 
                    key={index} 
                    className={`text-xs flex items-center space-x-2 ${
                      index === 0 ? 'text-yellow-300 animate-pulse' : 
                      index < 3 ? 'text-gray-300' : 'text-gray-500'
                    }`}
                  >
                    <Clock size={10} />
                    <span>{action}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Squad Member Status */}
          <div className="mt-4 grid grid-cols-1 gap-2">
            <h4 className="text-white font-medium flex items-center">
              <Shield className="mr-1" size={16} />
              Squad Status
            </h4>
            {activeMission.assignedSquad.map(memberId => {
              const member = gameState.squad.find(m => m.id === memberId);
              if (!member) return null;
              const currentHealth = squadHealths[memberId] !== undefined ? squadHealths[memberId] : member.stats.health;
              let currentAction = '';
              let actionColor = '';
              if (currentHealth <= 0) {
                currentAction = 'KNOCKED OUT';
                actionColor = 'text-red-400';
              } else if (missionPhase === 'travel') {
                const travelSteps = ['Departed base', 'Crossing backroads', 'Scouting route', 'Approaching objective'];
                const stepIndex = travelMinutes > 0 
                  ? Math.min(travelSteps.length - 1, Math.floor((elapsedMinutes / Math.max(travelMinutes, 0.01)) * travelSteps.length))
                  : 0;
                currentAction = travelSteps[stepIndex];
                actionColor = 'text-yellow-400';
              } else if (missionPhase === 'setup') {
                const setupSteps = ['Forming perimeter', 'Synchronizing comms', 'Final weapon checks', 'Marking fields of fire'];
                const setupProgress = Math.max(0, Math.min(1, (elapsedMinutes - Math.max(0, travelMinutes)) / Math.max(0.01, setupMinutes)));
                const stepIndex = Math.min(setupSteps.length - 1, Math.floor(setupProgress * setupSteps.length));
                currentAction = setupSteps[stepIndex];
                actionColor = 'text-blue-400';
              } else if (missionPhase === 'combat') {
                const weapon = member.equipment?.weapon;
                const combatFallbackActions = weapon 
                  ? [`Firing ${weapon}`, 'Reloading', 'Taking aim', 'Finding cover', 'Flanking enemy']
                  : ['Melee combat', 'Taking cover', 'Flanking enemy', 'Defending position'];
                currentAction = lastMemberActions[member.name] || combatFallbackActions[Math.floor(((tick/12)|0) % combatFallbackActions.length)];
                actionColor = currentAction.toLowerCase().includes('hit') || currentAction.toLowerCase().includes('firing') || currentAction.toLowerCase().includes('attack') ? 'text-red-400' : 
                  currentAction.toLowerCase().includes('cover') || currentAction.toLowerCase().includes('defend') ? 'text-blue-400' : 'text-orange-400';
              } else {
                const returnSteps = ['Securing site', 'Packaging intel', 'Extracting safely', 'Reporting in'];
                const returnProgress = Math.max(0, Math.min(1, (elapsedMinutes - combatStartMinuteThreshold) / Math.max(0.01, missionDurationMinutes - combatStartMinuteThreshold)));
                const stepIndex = Math.min(returnSteps.length - 1, Math.floor(returnProgress * returnSteps.length));
                currentAction = returnSteps[stepIndex];
                actionColor = 'text-green-400';
              }

              const healthPercent = (currentHealth / member.stats.maxHealth) * 100;
              const healthColor = healthPercent > 75 ? 'text-green-400' : 
                                  healthPercent > 50 ? 'text-yellow-400' : 
                                  healthPercent > 25 ? 'text-orange-400' : 'text-red-400';

              return (
                <div key={memberId} className="flex items-center justify-between text-xs bg-black/20 rounded p-2">
                  <span className="text-white">{member.name}</span>
                  <div className="flex items-center space-x-2">
                    <span className={`${actionColor} flex items-center`}>
                      {currentAction}
                    </span>
                    <span className={healthColor}>HP: {Math.floor(currentHealth)}</span>
                  </div>
                </div>
              );
            })}

            {/* Show player character if included in mission */}
            {activeMission.includePlayer && gameState.playerCharacter && (
              <div className="flex items-center justify-between text-xs bg-black/20 rounded p-2 border border-blue-500/30">
                <span className="text-blue-300 font-semibold">{gameState.playerCharacter.name} (YOU)</span>
                <div className="flex items-center space-x-2">
                  <span className="text-blue-400 flex items-center">Leading</span>
                  <span className="text-green-400">
                    HP: {Math.floor(squadHealths[gameState.playerCharacter.id] || gameState.playerCharacter.health || 100)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
    </div>
  );
};
