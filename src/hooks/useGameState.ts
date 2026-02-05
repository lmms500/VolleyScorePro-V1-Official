import { useReducer, useRef, useLayoutEffect, MutableRefObject } from 'react';
import { gameReducer } from '../reducers/gameReducer';
import { GameState } from '../types';
import { DEFAULT_CONFIG } from '../constants';

/**
 * Initial state for a new volleyball game.
 * Used as the starting point for the reducer and for resetting matches.
 */
export const INITIAL_STATE: GameState = {
  teamAName: 'Team A',
  teamBName: 'Team B',
  scoreA: 0,
  scoreB: 0,
  setsA: 0,
  setsB: 0,
  currentSet: 1,
  history: [],
  actionLog: [],
  matchLog: [],
  isMatchOver: false,
  matchWinner: null,
  servingTeam: null,
  swappedSides: false,
  config: DEFAULT_CONFIG,
  timeoutsA: 0,
  timeoutsB: 0,
  inSuddenDeath: false,
  pendingSideSwitch: false,
  matchDurationSeconds: 0,
  isTimerRunning: false,
  teamARoster: { id: 'A', name: 'Team A', players: [], reserves: [], color: 'indigo', tacticalOffset: 0 },
  teamBRoster: { id: 'B', name: 'Team B', players: [], reserves: [], color: 'rose', tacticalOffset: 0 },
  queue: [],
  rotationReport: null,
  deletedPlayerHistory: [],
  rotationMode: 'standard',
  syncRole: 'local'
};

interface UseGameStateReturn {
  state: GameState;
  dispatch: React.Dispatch<any>;
  stateRef: MutableRefObject<GameState>;
}

/**
 * Core hook for game state management.
 * Provides the reducer and a ref that always holds the current state.
 * The stateRef is essential for stable callbacks that need to read state.
 */
export const useGameState = (): UseGameStateReturn => {
  const [state, dispatch] = useReducer(gameReducer, INITIAL_STATE);

  // --- ARCHITECTURAL FIX FOR ERROR #185 ---
  // Create ref that always holds the current state.
  // This allows us to read state inside callbacks WITHOUT adding them to the dependency array.
  // This ensures 'actions' object reference remains stable, preventing massive context re-renders.
  const stateRef = useRef(state);

  useLayoutEffect(() => {
    stateRef.current = state;
  }); // Updates synchronously after every render

  return {
    state,
    dispatch,
    stateRef
  };
};
