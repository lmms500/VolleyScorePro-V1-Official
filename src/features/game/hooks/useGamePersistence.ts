import { useEffect, useRef, Dispatch } from 'react';
import { GameState, GameAction } from '@types';
import { SecureStorage } from '@lib/storage/SecureStorage';
import { DEFAULT_CONFIG } from '@config/constants';

// KEYS FOR SPLIT STORAGE
export const LEGACY_STORAGE_KEY = 'action_log';
export const KEY_CORE = 'vsp_state_core';
export const KEY_LOGS = 'vsp_state_logs';

interface UseGamePersistenceOptions {
  state: GameState;
  dispatch: Dispatch<GameAction>;
  initialState: GameState;
  onLoaded: () => void;
}

/**
 * Hook responsible for loading and saving game state to SecureStorage.
 * Uses split-state strategy: core state saves frequently, logs save only when changed.
 */
export const useGamePersistence = ({
  state,
  dispatch,
  initialState,
  onLoaded
}: UseGamePersistenceOptions) => {
  // Refs for debouncing and change detection
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastLogLength = useRef(0);
  const hasLoadedRef = useRef(false);

  // --- OPTIMIZED LOADING STRATEGY ---
  useEffect(() => {
    if (hasLoadedRef.current) return;

    const load = async () => {
      try {
        // 1. Try Load Split State (New Format)
        const core = await SecureStorage.load<Partial<GameState>>(KEY_CORE);
        const logs = await SecureStorage.load<{ actionLog: any[], matchLog: any[] }>(KEY_LOGS);

        let finalState: GameState | null = null;

        if (core) {
          // Reconstruct from split
          // Defensively ensure arrays
          finalState = {
            ...initialState,
            ...core,
            actionLog: Array.isArray(logs?.actionLog) ? logs!.actionLog : [],
            matchLog: Array.isArray(logs?.matchLog) ? logs!.matchLog : [],
            config: { ...DEFAULT_CONFIG, ...core.config }
          };
        } else {
          // 2. Fallback: Try Load Legacy State
          const legacy = await SecureStorage.load<GameState>(LEGACY_STORAGE_KEY);
          if (legacy) {
            finalState = {
              ...initialState,
              ...legacy,
              // Defensively ensure arrays even for legacy
              actionLog: Array.isArray(legacy.actionLog) ? legacy.actionLog : [],
              matchLog: Array.isArray(legacy.matchLog) ? legacy.matchLog : [],
              config: { ...DEFAULT_CONFIG, ...legacy.config }
            };
          }
        }

        if (finalState) {
          dispatch({
            type: 'LOAD_STATE',
            payload: { ...finalState, syncRole: 'local' }
          });
          lastLogLength.current = (finalState.actionLog?.length || 0) + (finalState.matchLog?.length || 0);
          // [FIX] Sanitiza IDs que possam estar vazios no state carregado
          setTimeout(() => dispatch({ type: 'ROSTER_ENSURE_TEAM_IDS' }), 0);
        } else {
          dispatch({ type: 'ROSTER_ENSURE_TEAM_IDS' });
        }
      } catch (e) {
        console.error("Failed to load game state", e);
      }
      hasLoadedRef.current = true;
      onLoaded();
    };
    load();
  }, [dispatch, initialState, onLoaded]);

  // --- OPTIMIZED PERSISTENCE STRATEGY (Split-State) ---
  useEffect(() => {
    if (!hasLoadedRef.current) return;
    if (state.syncRole !== 'local') return;

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(() => {
      // 1. Prepare Core State (Lightweight) - Saves every time
      // We strip heavy arrays to make this JSON.stringify fast
      const { actionLog, matchLog, ...coreState } = state;
      SecureStorage.save(KEY_CORE, coreState);

      // 2. Check Logs (Heavy) - Save ONLY if changed
      const currentLogLength = (actionLog ? actionLog.length : 0) + (matchLog ? matchLog.length : 0);
      if (currentLogLength !== lastLogLength.current) {
        SecureStorage.save(KEY_LOGS, {
          actionLog: actionLog || [],
          matchLog: matchLog || []
        });
        lastLogLength.current = currentLogLength;

        // Clean legacy key if we have successfully saved split state
        SecureStorage.remove(LEGACY_STORAGE_KEY);
      }
    }, 1000);
  }, [state]);

  return {
    isLoaded: hasLoadedRef.current
  };
};
