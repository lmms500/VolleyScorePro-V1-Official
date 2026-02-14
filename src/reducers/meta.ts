
import { GameState, GameAction } from '../types';
import { distributeStandard } from '../utils/balanceUtils';
import { getCourtLayoutFromConfig, getGameModeConfig, GAME_MODE_PRESETS } from '../config/gameModes';
import { rotateClockwise, rotateCounterClockwise } from '../utils/gameLogic';

export const metaReducer = (state: GameState, action: GameAction): GameState => {
    switch (action.type) {
        case 'LOAD_STATE': {
            const loadedState = { ...action.payload };

            // Migration: Ensure modeConfig exists for backwards compatibility
            if (!loadedState.config.modeConfig) {
                // Detect players on court to determine the correct preset
                const playersOnCourt = loadedState.teamARoster?.players?.length ||
                                       loadedState.teamBRoster?.players?.length ||
                                       (loadedState.config.mode === 'beach' ? 4 : 6);
                loadedState.config = {
                    ...loadedState.config,
                    modeConfig: getGameModeConfig(loadedState.config.mode, playersOnCourt)
                };
            } else {
                // Migration v2: Always refresh courtLayout from GAME_MODE_PRESETS
                // This ensures layout changes (like 5v5 gridRows: 2) are applied to existing saved states
                const presetName = loadedState.config.modeConfig.preset;
                const freshPreset = GAME_MODE_PRESETS[presetName];
                if (freshPreset) {
                    loadedState.config = {
                        ...loadedState.config,
                        modeConfig: {
                            ...loadedState.config.modeConfig,
                            courtLayout: freshPreset.courtLayout
                        }
                    };
                }
            }

            // Migration v3: Ensure lastScorerTeam exists for backwards compatibility
            if (loadedState.lastScorerTeam === undefined) {
                const logs = loadedState.matchLog || [];
                for (let i = logs.length - 1; i >= 0; i--) {
                    if (logs[i].type === 'POINT') {
                        loadedState.lastScorerTeam = (logs[i] as { team: 'A' | 'B' }).team;
                        break;
                    }
                }
                if (loadedState.lastScorerTeam === undefined) loadedState.lastScorerTeam = null;
            }

            return loadedState;
        }

        case 'APPLY_SETTINGS': {
            const layoutChanged = action.config.mode !== state.config.mode ||
                                  action.config.modeConfig?.preset !== state.config.modeConfig?.preset;

            let newState = { ...state, config: action.config };
            if (action.shouldReset) {
                newState = {
                    ...newState,
                    scoreA: 0, scoreB: 0, setsA: 0, setsB: 0, currentSet: 1,
                    history: [], actionLog: [], matchLog: [],
                    lastScorerTeam: null,
                    isMatchOver: false, matchWinner: null, servingTeam: null,
                    timeoutsA: 0, timeoutsB: 0,
                    inSuddenDeath: false, pendingSideSwitch: false,
                    lastSnapshot: undefined,
                    teamARoster: { ...state.teamARoster, tacticalOffset: 0 },
                    teamBRoster: { ...state.teamBRoster, tacticalOffset: 0 }
                };
            }
            if (layoutChanged) {
                const newLayout = getCourtLayoutFromConfig(action.config);
                const newLimit = newLayout.playersOnCourt;
                // Collect ALL players (Court A + Court B + Queue + Reserves)
                // We flatten everything to redistribute cleanly based on new limits
                const allPlayers = [
                    ...state.teamARoster.players,
                    ...(state.teamARoster.reserves || []),
                    ...state.teamBRoster.players,
                    ...(state.teamBRoster.reserves || []),
                    ...state.queue.flatMap(t => [...t.players, ...(t.reserves || [])])
                ];
                // Remove duplicates if any (just safety) and filter valid
                const uniquePlayers = Array.from(new Map(allPlayers.map(p => [p.id, p])).values());
                // Redistribute using Standard logic (respects isFixed)
                // We pass empty teams as "current" to force a full re-balance into the new slots
                const distResult = distributeStandard(
                    uniquePlayers,
                    { ...state.teamARoster, players: [], reserves: [] },
                    { ...state.teamBRoster, players: [], reserves: [] },
                    [],
                    newLimit
                );
                newState = {
                    ...newState,
                    teamARoster: {
                        ...distResult.courtA,
                        // Ensure we keep team identity if possible, but bucket logic handles players
                        tacticalOffset: 0,
                        hasActiveBench: (distResult.courtA.reserves?.length || 0) > 0
                    },
                    teamBRoster: {
                        ...distResult.courtB,
                        tacticalOffset: 0,
                        hasActiveBench: (distResult.courtB.reserves?.length || 0) > 0
                    },
                    queue: distResult.queue,
                    teamAName: distResult.courtA.name,
                    teamBName: distResult.courtB.name
                };
            }
            return newState;
        }

        case 'RESET_MATCH':
            return {
                ...state,
                // [NEW] Identidade da Sessão - Fix para Bug de Undo
                gameId: action.gameId || Date.now().toString(),
                gameCreatedAt: Date.now(),
                // [CRÍTICO] Reset de Estado de Score
                scoreA: 0,
                scoreB: 0,
                setsA: 0,
                setsB: 0,
                currentSet: 1,
                // [CRÍTICO] Limpeza de Histórico (Correção do Bug de Undo)
                history: [],
                actionLog: [],
                matchLog: [],
                lastScorerTeam: null,
                lastSnapshot: undefined,
                // Reset de estado da partida
                isMatchOver: false,
                matchWinner: null,
                servingTeam: null,
                swappedSides: false,
                timeoutsA: 0,
                timeoutsB: 0,
                inSuddenDeath: false,
                pendingSideSwitch: false,
                matchDurationSeconds: 0,
                isTimerRunning: false,
                teamARoster: { ...state.teamARoster, tacticalOffset: 0 },
                teamBRoster: { ...state.teamBRoster, tacticalOffset: 0 }
            };

        case 'RESET_TIMER':
            return { ...state, matchDurationSeconds: 0, isTimerRunning: false };

        case 'TOGGLE_TIMER':
            return { ...state, isTimerRunning: !state.isTimerRunning };

        case 'SET_SYNC_ROLE':
            return { ...state, syncRole: action.role, sessionId: action.sessionId };

        case 'DISCONNECT_SYNC':
            return { ...state, syncRole: 'local', sessionId: undefined };

        case 'SET_MATCH_DURATION':
            return { ...state, matchDurationSeconds: action.duration };

        case 'UNDO': {
            if (state.lastSnapshot) {
                const snap = { ...state.lastSnapshot };
                // Migration: compute lastScorerTeam if missing from old snapshots
                if (snap.lastScorerTeam === undefined) {
                    snap.lastScorerTeam = null;
                    const logs = snap.matchLog || [];
                    for (let i = logs.length - 1; i >= 0; i--) {
                        if (logs[i].type === 'POINT') { snap.lastScorerTeam = (logs[i] as { team: any }).team; break; }
                    }
                }
                return snap;
            }
            if (state.isMatchOver || state.actionLog.length === 0) return state;
            const newLog = [...state.actionLog];
            const lastAction = newLog.pop()!;
            const newMatchLog = [...state.matchLog];
            if (newMatchLog.length > 0 && newMatchLog[newMatchLog.length - 1].type === lastAction.type) newMatchLog.pop();

            // Compute lastScorerTeam from remaining matchLog (O(n) but UNDO is infrequent)
            let undoLastScorer: typeof state.lastScorerTeam = null;
            for (let i = newMatchLog.length - 1; i >= 0; i--) {
                if (newMatchLog[i].type === 'POINT') { undoLastScorer = (newMatchLog[i] as { team: any }).team; break; }
            }

            if (lastAction.type === 'TIMEOUT') return { ...state, actionLog: newLog, matchLog: newMatchLog, lastScorerTeam: undoLastScorer, timeoutsA: lastAction.prevTimeoutsA, timeoutsB: lastAction.prevTimeoutsB };
            if (lastAction.type === 'ROTATION') return { ...state, actionLog: newLog, matchLog: newMatchLog, lastScorerTeam: undoLastScorer, ...lastAction.snapshot };
            if (lastAction.type === 'MANUAL_ROTATION') {
                const { teamId, direction } = lastAction;
                let teamA = { ...state.teamARoster }, teamB = { ...state.teamBRoster };
                if (teamId === 'A') teamA.players = direction === 'clockwise' ? rotateCounterClockwise(teamA.players) : rotateClockwise(teamA.players);
                else if (teamId === 'B') teamB.players = direction === 'clockwise' ? rotateCounterClockwise(teamB.players) : rotateClockwise(teamB.players);
                return { ...state, actionLog: newLog, matchLog: newMatchLog, lastScorerTeam: undoLastScorer, teamARoster: teamA, teamBRoster: teamB };
            }
            if (lastAction.type === 'POINT') {
                let teamA = state.teamARoster;
                let teamB = state.teamBRoster;

                if (lastAction.autoRotated) {
                    if (lastAction.team === 'A') teamA = { ...teamA, players: rotateCounterClockwise(teamA.players) };
                    else teamB = { ...teamB, players: rotateCounterClockwise(teamB.players) };
                }
                return {
                    ...state,
                    actionLog: newLog,
                    matchLog: newMatchLog,
                    lastScorerTeam: undoLastScorer,
                    scoreA: lastAction.prevScoreA,
                    scoreB: lastAction.prevScoreB,
                    servingTeam: lastAction.prevServingTeam,
                    inSuddenDeath: lastAction.prevInSuddenDeath ?? false,
                    swappedSides: lastAction.prevSwappedSides,
                    pendingSideSwitch: false,
                    teamARoster: teamA,
                    teamBRoster: teamB
                };
            }
            return state;
        }

        default:
            return state;
    }
};
