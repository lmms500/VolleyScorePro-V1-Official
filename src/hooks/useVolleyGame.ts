import { useState, useRef, useLayoutEffect, useMemo, useCallback } from 'react';
import { usePlayerProfiles } from './usePlayerProfiles';
import { useGameState, INITIAL_STATE } from './useGameState';
import { useGamePersistence } from './useGamePersistence';
import { useGameActions } from './useGameActions';
import { useTeamGenerator } from './useTeamGenerator';
import { SETS_TO_WIN_MATCH } from '../constants';

/**
 * Main hook for volleyball game logic.
 * This is a FACADE that composes smaller, focused hooks:
 * - useGameState: Core reducer and state ref
 * - useGamePersistence: Load/save to SecureStorage
 * - useGameActions: All wrapped action dispatchers
 * - useTeamGenerator: Team generation and balancing
 *
 * Maintains full backward compatibility with the original interface.
 */
export const useVolleyGame = () => {
  // Player profiles (external hook)
  const {
    profiles,
    isReady: profilesReady,
    upsertProfile,
    deleteProfile,
    batchUpdateStats,
    mergeProfiles
  } = usePlayerProfiles();

  // Core game state
  const { state, dispatch, stateRef } = useGameState();

  // Loading state
  const [isLoaded, setIsLoaded] = useState(false);

  // --- REFS FOR STABLE CALLBACKS ---
  // These refs ensure external functions can be called from stable callbacks
  const upsertProfileRef = useRef(upsertProfile);
  const deleteProfileRef = useRef(deleteProfile);
  const profilesRef = useRef(profiles);

  useLayoutEffect(() => {
    upsertProfileRef.current = upsertProfile;
    deleteProfileRef.current = deleteProfile;
    profilesRef.current = profiles;
  }); // Updates synchronously after every render

  // Persistence (load/save)
  useGamePersistence({
    state,
    dispatch,
    initialState: INITIAL_STATE,
    onLoaded: useCallback(() => setIsLoaded(true), [])
  });

  // Team generation
  const { generateTeams, balanceTeams } = useTeamGenerator({
    stateRef,
    dispatch
  });

  // All game actions
  const {
    actions: baseActions,
    ...individualActions
  } = useGameActions({
    stateRef,
    dispatch,
    upsertProfileRef,
    deleteProfileRef,
    batchUpdateStats,
    mergeProfiles
  });

  // Combine actions with team generator functions
  const actions = useMemo(() => ({
    ...baseActions,
    generateTeams,
    balanceTeams
  }), [baseActions, generateTeams, balanceTeams]);

  // --- COMPUTED VALUES ---
  const setsNeededToWin = SETS_TO_WIN_MATCH(state.config.maxSets);
  const isTieBreak = state.config.hasTieBreak && state.currentSet === state.config.maxSets;
  const target = isTieBreak ? state.config.tieBreakPoints : state.config.pointsPerSet;
  const isDeuce = !state.inSuddenDeath && state.scoreA === state.scoreB && state.scoreA >= (target - 1);
  const isSetPointA = !isDeuce && state.scoreA >= (target - 1) && state.scoreA > state.scoreB;
  const isSetPointB = !isDeuce && state.scoreB >= (target - 1) && state.scoreB > state.scoreA;
  const isMatchPointA = isSetPointA && (state.setsA === setsNeededToWin - 1);
  const isMatchPointB = isSetPointB && (state.setsB === setsNeededToWin - 1);

  return {
    // State
    state,
    isLoaded: isLoaded && profilesReady,
    profiles,

    // Actions object (for contexts)
    actions,

    // Spread individual actions for direct access (backward compatibility)
    ...individualActions,
    generateTeams,
    balanceTeams,
    batchUpdateStats,
    mergeProfiles,

    // Computed values
    canUndo: state.actionLog.length > 0,
    hasDeletedPlayers: state.deletedPlayerHistory.length > 0,
    deletedCount: state.deletedPlayerHistory.length,
    rotationMode: state.rotationMode,
    isMatchActive: state.scoreA > 0 || state.scoreB > 0 || state.setsA > 0 || state.setsB > 0,
    isMatchPointA,
    isMatchPointB,
    isSetPointA,
    isSetPointB,
    isDeuce,
    isTieBreak,
    setsNeededToWin
  };
};

// Re-export INITIAL_STATE for external use
export { INITIAL_STATE } from './useGameState';
