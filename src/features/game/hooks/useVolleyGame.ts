import { useState, useRef, useLayoutEffect, useMemo, useCallback } from 'react';
import { usePlayerProfiles } from '@features/teams/hooks/usePlayerProfiles';
import { useGameState, INITIAL_STATE } from './useGameState';
import { useGamePersistence } from './useGamePersistence';
import { useGameActions } from './useGameActions';
import { useTeamGenerator } from '@features/teams/hooks/useTeamGenerator';
import { SETS_TO_WIN_MATCH } from '@config/constants';

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
    findProfileByName,
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
  const findProfileByNameRef = useRef(findProfileByName);
  const profilesRef = useRef(profiles);

  // [NEW] Ref para rastrear o ID da Sessão Ativa (Independente de Render cycle)
  // Isso é fundamental para a correção do Bug de Undo
  const currentGameIdRef = useRef(state.gameId);

  useLayoutEffect(() => {
    upsertProfileRef.current = upsertProfile;
    deleteProfileRef.current = deleteProfile;
    findProfileByNameRef.current = findProfileByName;
    profilesRef.current = profiles;
  }); // Updates synchronously after every render

  // [FIX] Sincronização do ID apenas no carregamento inicial
  // NÃO sincronizar em toda mudança de gameId - isso anularia a proteção!
  // O ref só deve ser atualizado:
  // 1. No carregamento inicial (quando um jogo salvo é carregado)
  // 2. Explicitamente em startNewGame
  const hasInitializedGameIdRef = useRef(false);
  useLayoutEffect(() => {
    if (isLoaded && !hasInitializedGameIdRef.current && state.gameId) {
      currentGameIdRef.current = state.gameId;
      hasInitializedGameIdRef.current = true;
    }
  }, [isLoaded, state.gameId]);

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
    dispatch,
    findProfileByNameRef
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
    findProfileByNameRef,
    batchUpdateStats,
    mergeProfiles
  });

  // [NEW] Interceptador de Undo - Correção do Bug
  const safeUndo = useCallback(() => {
    // 1. Verificação básica
    if (!stateRef.current.actionLog.length && !stateRef.current.lastSnapshot) return;

    // 2. Validação de Sessão (Correção do Bug)
    // Se o estado atual tem um ID diferente do que a sessão / ref "sabe",
    // significa que estamos num estado inconsistente ou obsoleto.
    if (stateRef.current.gameId !== currentGameIdRef.current) {
      console.warn('[VolleyGame] UNDO BLOCKED: State GameID mismatch. Ignoring safeUndo to prevent restoration of stale state.');
      return;
    }

    // 3. Executa o undo real se passou nas verificações
    dispatch({ type: 'UNDO' });
  }, [dispatch, stateRef]);

  // [NEW] Função de Start New Game com ID seguro
  const startNewGame = useCallback(() => {
    const newGameId = Date.now().toString();

    // 1. Atualiza a referência IMEDIATAMENTE antes do dispatch
    currentGameIdRef.current = newGameId;

    // 2. Despacha Reset com o novo ID
    dispatch({
      type: 'RESET_MATCH',
      gameId: newGameId
    });

  }, [dispatch]);

  // [NEW] Função de Rotate Teams com ID seguro (para botão "Próximo")
  const safeRotateTeams = useCallback(() => {
    const newGameId = Date.now().toString();

    // 1. Atualiza a referência IMEDIATAMENTE antes do dispatch
    currentGameIdRef.current = newGameId;

    // 2. Despacha Rotate com o novo ID
    dispatch({
      type: 'ROTATE_TEAMS',
      gameId: newGameId
    });

  }, [dispatch]);

  // [MODIFIED] Compor objeto de actions final com overrides seguros
  const actions = useMemo(() => ({
    ...baseActions,
    generateTeams,
    balanceTeams,
    undo: safeUndo,              // Override com versão segura
    resetMatch: startNewGame,    // Override com versão segura
    rotateTeams: safeRotateTeams // Override com versão segura (botão "Próximo")
  }), [baseActions, generateTeams, balanceTeams, safeUndo, startNewGame, safeRotateTeams]);

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

    // [NEW] Expose explicitly for direct access
    startNewGame,

    // Computed values
    canUndo: state.actionLog.length > 0 || !!state.lastSnapshot,
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

