import { EnhancedRealCombatAI, RealCombatState, RealCombatEvent } from './EnhancedRealCombatAI';
import { Mission } from '@/types/GameTypes';

/**
 * Combat Synchronizer
 * 
 * This system bridges the gap between mission duration and actual combat AI,
 * ensuring that victory status only appears when combat actually ends, not
 * when the mission timer expires.
 */

export class CombatSynchronizer {
  private static instance: CombatSynchronizer;
  private activeCombats = new Map<string, {
    combatAI: EnhancedRealCombatAI;
    mission: Mission;
    isComplete: boolean;
    actualDuration: number;
  }>();
  private completedCombats = new Set<string>();
  private finalResults = new Map<string, { victory: boolean; actualDuration: number; finalHealths: Record<string, number> }>();
  
  private missionCompletionCallbacks = new Map<string, ((victory: boolean, actualDuration: number) => void)[]>();

  static getInstance(): CombatSynchronizer {
    if (!CombatSynchronizer.instance) {
      CombatSynchronizer.instance = new CombatSynchronizer();
    }
    return CombatSynchronizer.instance;
  }

  /**
   * Start synchronized combat for a mission
   */
  startSynchronizedCombat(
    missionId: string,
    squad: any[],
    enemies: any[],
    mission: Mission
  ): void {
    // Prevent duplicate or restarted combats for the same mission
    if (this.completedCombats.has(missionId)) {
      return; // Already ran once for this mission
    }
    const existing = this.activeCombats.get(missionId);
    if (existing && !existing.isComplete) {
      return; // Already running
    }

    const combatAI = new EnhancedRealCombatAI();
    
    // Listen for combat completion
    combatAI.onUpdate((state: RealCombatState) => {
      const combatData = this.activeCombats.get(missionId);
      if (combatData && state.victory !== null) {
        // Combat has ended
        const actualDuration = (Date.now() - state.startTime) / 1000;
        combatData.isComplete = true;
        combatData.actualDuration = actualDuration;
        
        // Collect final healths for persistence/UI
        const finalHealths: Record<string, number> = {};
        state.combatants.forEach(c => {
          finalHealths[c.id] = c.health;
        });

        // Store final results
        this.finalResults.set(missionId, {
          victory: state.victory!,
          actualDuration,
          finalHealths
        });
        
        // Notify all listeners
        const callbacks = this.missionCompletionCallbacks.get(missionId) || [];
        callbacks.forEach(callback => callback(state.victory, actualDuration));
        
        // Clean up
        this.activeCombats.delete(missionId);
        this.missionCompletionCallbacks.delete(missionId);
        this.completedCombats.add(missionId);
        
        console.log(`Combat for mission ${missionId} completed: ${state.victory ? 'Victory' : 'Defeat'} after ${actualDuration}s`);
      }
    });

    // Start the combat
    combatAI.startCombat(squad, enemies, mission);
    
    // Store combat data
    this.activeCombats.set(missionId, {
      combatAI,
      mission,
      isComplete: false,
      actualDuration: 0
    });
  }

  /**
   * Check if combat is still ongoing for a mission
   */
  isCombatActive(missionId: string): boolean {
    const combatData = this.activeCombats.get(missionId);
    return combatData ? !combatData.isComplete : false;
  }

  /**
   * Register callback for when combat completes
   */
  onCombatComplete(
    missionId: string, 
    callback: (victory: boolean, actualDuration: number) => void
  ): void {
    const callbacks = this.missionCompletionCallbacks.get(missionId) || [];
    callbacks.push(callback);
    this.missionCompletionCallbacks.set(missionId, callbacks);
  }

  /**
   * Get actual combat duration if available
   */
  getActualCombatDuration(missionId: string): number | null {
    const combatData = this.activeCombats.get(missionId);
    return combatData && combatData.isComplete ? combatData.actualDuration : null;
  }

  /**
   * Force end combat (for mission aborts, etc.)
   */
  forceCombatEnd(missionId: string): void {
    const combatData = this.activeCombats.get(missionId);
    if (combatData && !combatData.isComplete) {
      // Force the combat to end
      combatData.isComplete = true;
      combatData.actualDuration = (Date.now() - combatData.combatAI['combatState']?.startTime || Date.now()) / 1000;

      // Store final results snapshot on forced end
      const endState = combatData.combatAI['combatState'] as any;
      const finalHealths: Record<string, number> = {};
      if (endState?.combatants) {
        endState.combatants.forEach((c: any) => {
          finalHealths[c.id] = c.health;
        });
      }
      this.finalResults.set(missionId, {
        victory: false,
        actualDuration: combatData.actualDuration,
        finalHealths
      });
      
      // Clean up
      this.activeCombats.delete(missionId);
      this.missionCompletionCallbacks.delete(missionId);
      this.completedCombats.add(missionId);
      
      console.log(`Forced combat end for mission ${missionId}`);
    }
  }

  /**
   * Get real-time combat state for UI
   */
  getCombatState(missionId: string): RealCombatState | null {
    const combatData = this.activeCombats.get(missionId);
    return combatData ? combatData.combatAI['combatState'] : null;
  }

  /**
   * Get final combat results if available
   */
  getCombatResults(missionId: string): { victory: boolean; actualDuration: number; finalHealths: Record<string, number> } | null {
    return this.finalResults.get(missionId) || null;
  }

  /**
   * Get all active combat mission IDs
   */
  getActiveCombatMissions(): string[] {
    return Array.from(this.activeCombats.keys()).filter(missionId => 
      !this.activeCombats.get(missionId)?.isComplete
    );
  }
}