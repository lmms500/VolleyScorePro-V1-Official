
import { GameState, GameAction } from '../types';
import { distributeStandard } from '../utils/balanceUtils';
import { getPlayersOnCourt } from '../constants';
import { rotateClockwise, rotateCounterClockwise } from '../utils/gameLogic';

export const metaReducer = (state: GameState, action: GameAction): GameState => {
    switch (action.type) {
        case 'LOAD_STATE':
            return { ...action.payload };

        case 'APPLY_SETTINGS': {
            const modeChanged = action.config.mode !== state.config.mode;
            let newState = { ...state, config: action.config };
            if (action.shouldReset) {
                newState = { ...newState, scoreA: 0, scoreB: 0, setsA: 0, setsB: 0, currentSet: 1, history: [], actionLog: [], matchLog: [], isMatchOver: false, matchWinner: null, servingTeam: null, timeoutsA: 0, timeoutsB: 0, inSuddenDeath: false, pendingSideSwitch: false, lastSnapshot: undefined, teamARoster: { ...state.teamARoster, tacticalOffset: 0 }, teamBRoster: { ...state.teamBRoster, tacticalOffset: 0 } };
            }
            if (modeChanged) {
                const newLimit = getPlayersOnCourt(action.config.mode);
                const allPlayers = [...state.teamARoster.players, ...state.teamBRoster.players, ...state.queue.flatMap(t => t.players)];
                const distResult = distributeStandard(allPlayers, { ...state.teamARoster, players: [] }, { ...state.teamBRoster, players: [] }, [], newLimit);
                newState = { ...newState, teamARoster: { ...distResult.courtA, reserves: state.teamARoster.reserves, hasActiveBench: state.teamARoster.hasActiveBench, tacticalOffset: 0 }, teamBRoster: { ...distResult.courtB, reserves: state.teamBRoster.reserves, hasActiveBench: state.teamBRoster.hasActiveBench, tacticalOffset: 0 }, queue: distResult.queue, teamAName: distResult.courtA.name, teamBName: distResult.courtB.name };
            }
            return newState;
        }

        case 'RESET_MATCH':
            return { ...state, scoreA: 0, scoreB: 0, setsA: 0, setsB: 0, currentSet: 1, history: [], actionLog: [], matchLog: [], isMatchOver: false, matchWinner: null, servingTeam: null, swappedSides: false, timeoutsA: 0, timeoutsB: 0, inSuddenDeath: false, pendingSideSwitch: false, matchDurationSeconds: 0, isTimerRunning: false, lastSnapshot: undefined, teamARoster: { ...state.teamARoster, tacticalOffset: 0 }, teamBRoster: { ...state.teamBRoster, tacticalOffset: 0 } };

        case 'RESET_TIMER': 
            return { ...state, matchDurationSeconds: 0, isTimerRunning: false };
        
        case 'TOGGLE_TIMER': 
            return { ...state, isTimerRunning: !state.isTimerRunning };

        case 'SET_SYNC_ROLE':
            return { ...state, syncRole: action.role, sessionId: action.sessionId };

        case 'UNDO': {
            if (state.lastSnapshot) return { ...state.lastSnapshot };
            if (state.isMatchOver || state.actionLog.length === 0) return state;
            const newLog = [...state.actionLog];
            const lastAction = newLog.pop()!;
            const newMatchLog = [...state.matchLog];
            if (newMatchLog.length > 0 && newMatchLog[newMatchLog.length - 1].type === lastAction.type) newMatchLog.pop();
            if (lastAction.type === 'TIMEOUT') return { ...state, actionLog: newLog, matchLog: newMatchLog, timeoutsA: lastAction.prevTimeoutsA, timeoutsB: lastAction.prevTimeoutsB };
            if (lastAction.type === 'ROTATION') return { ...state, actionLog: newLog, matchLog: newMatchLog, ...lastAction.snapshot };
            if (lastAction.type === 'MANUAL_ROTATION') {
                const { teamId, direction } = lastAction;
                let teamA = { ...state.teamARoster }, teamB = { ...state.teamBRoster };
                if (teamId === 'A') teamA.players = direction === 'clockwise' ? rotateCounterClockwise(teamA.players) : rotateClockwise(teamA.players);
                else if (teamId === 'B') teamB.players = direction === 'clockwise' ? rotateCounterClockwise(teamB.players) : rotateClockwise(teamB.players);
                return { ...state, actionLog: newLog, matchLog: newMatchLog, teamARoster: teamA, teamBRoster: teamB };
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
