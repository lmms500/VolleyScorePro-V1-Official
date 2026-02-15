import { GameState, GameAction } from '@types';
import { scoringReducer } from './scoring';
import { rosterReducer } from './roster';
import { metaReducer } from './meta';

// Registry of which reducer handles which action type
// This isn't strictly necessary for execution but helps with code organization/splitting
const SCORING_ACTIONS = new Set(['POINT', 'SUBTRACT_POINT', 'TIMEOUT', 'TOGGLE_SIDES', 'SET_SERVER']);
const META_ACTIONS = new Set(['LOAD_STATE', 'APPLY_SETTINGS', 'RESET_MATCH', 'RESET_TIMER', 'TOGGLE_TIMER', 'SET_SYNC_ROLE', 'DISCONNECT_SYNC', 'SET_MATCH_DURATION', 'UNDO']);

export const gameReducer = (state: GameState, action: GameAction): GameState => {
    // 1. High-Frequency Scoring Logic
    if (SCORING_ACTIONS.has(action.type)) {
        return scoringReducer(state, action);
    }

    // 2. Meta/System Logic (Time, Settings, Sync)
    if (META_ACTIONS.has(action.type)) {
        return metaReducer(state, action);
    }

    // 3. Roster Management (Everything else defaults to Roster as it has the most actions)
    // Optimization: Check for prefix to avoid unnecessary function calls if possible, 
    // but rosterReducer handles the switch safely.
    if (action.type.startsWith('ROSTER_') || action.type === 'ROTATE_TEAMS' || action.type === 'MANUAL_ROTATION') {
        return rosterReducer(state, action);
    }

    // Fallback: If no sub-reducer handled it, return state as is (or handle default case inside roster if actions overlap)
    // In our case, rosterReducer has a default return, so we can try it as last resort
    // or just return state if we want to be strict.
    return state;
};