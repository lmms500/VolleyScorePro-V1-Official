
import { GameState, GameAction, ActionLog, SetHistory, RotationReport } from '../types';
import { SETS_TO_WIN_MATCH, getPlayersOnCourt } from '../constants';
import { calculateWinner, hasTeamServedInSet, rotateClockwise } from '../utils/gameLogic';
import { isValidTimeoutRequest } from '../utils/security';
import { handleRotate } from '../utils/rosterLogic';

export const scoringReducer = (state: GameState, action: GameAction): GameState => {
    const courtLimit = getPlayersOnCourt(state.config.mode);

    switch (action.type) {
        case 'POINT': {
            if (state.isMatchOver) return state;
            const team = action.team;
            let newScoreA = team === 'A' ? state.scoreA + 1 : state.scoreA;
            let newScoreB = team === 'B' ? state.scoreB + 1 : state.scoreB;
            let triggerSideSwitch = false;
            const totalPoints = newScoreA + newScoreB;
            
            // AUTO SIDE SWITCH LOGIC (Beach Mode)
            if (state.config.mode === 'beach' && state.config.autoSwapSides) {
               const isFinalSet = state.config.hasTieBreak && state.currentSet === state.config.maxSets;
               const switchInterval = isFinalSet ? 5 : 7;
               if (totalPoints > 0 && totalPoints % switchInterval === 0) {
                   triggerSideSwitch = true;
               }
            }
      
            const isTieBreak = state.config.hasTieBreak && state.currentSet === state.config.maxSets;
            const target = isTieBreak ? state.config.tieBreakPoints : state.config.pointsPerSet;
            let enteringSuddenDeath = false;
            if (state.config.deuceType === 'sudden_death_3pt' && !state.inSuddenDeath) {
               if (newScoreA === target - 1 && newScoreB === target - 1) {
                   newScoreA = 0; newScoreB = 0; enteringSuddenDeath = true;
               }
            }
            const setWinner = calculateWinner(newScoreA, newScoreB, target, state.inSuddenDeath || enteringSuddenDeath);
            
            let autoRotated = false;
            let nextTeamA = state.teamARoster;
            let nextTeamB = state.teamBRoster;
            
            const currentServer = state.servingTeam;
      
            if (!setWinner && currentServer && currentServer !== team) {
                const alreadyServed = hasTeamServedInSet(state.actionLog, team);
                if (alreadyServed) {
                    autoRotated = true;
                    if (team === 'A') { 
                        nextTeamA = { ...state.teamARoster, players: rotateClockwise(state.teamARoster.players), tacticalOffset: 0 }; 
                    } 
                    else { 
                        nextTeamB = { ...state.teamBRoster, players: rotateClockwise(state.teamBRoster.players), tacticalOffset: 0 }; 
                    }
                }
            }
      
            const newAction: ActionLog = { 
                type: 'POINT', team, 
                prevScoreA: state.scoreA, 
                prevScoreB: state.scoreB, 
                prevServingTeam: state.servingTeam, 
                prevInSuddenDeath: state.inSuddenDeath,
                prevSwappedSides: state.swappedSides,
                timestamp: Date.now(), 
                autoRotated: autoRotated, 
                ...(action.metadata || {}) 
            };
      
            if (setWinner) {
                const newSetsA = setWinner === 'A' ? state.setsA + 1 : state.setsA;
                const newSetsB = setWinner === 'B' ? state.setsB + 1 : state.setsB;
                const historyEntry: SetHistory = { setNumber: state.currentSet, scoreA: newScoreA, scoreB: newScoreB, winner: setWinner };
                const setsNeeded = SETS_TO_WIN_MATCH(state.config.maxSets);
                const matchWinner = newSetsA === setsNeeded ? 'A' : (newSetsB === setsNeeded ? 'B' : null);
                const snapshotState = { ...state };
                let rotReport: RotationReport | null = null;
                if (state.queue.length > 0) {
                    const simResult = handleRotate(state.teamARoster, state.teamBRoster, state.queue, setWinner, state.rotationMode, courtLimit);
                    rotReport = simResult.report;
                }
                return { ...state, scoreA: matchWinner ? newScoreA : 0, scoreB: matchWinner ? newScoreB : 0, setsA: newSetsA, setsB: newSetsB, history: [...state.history, historyEntry], currentSet: matchWinner ? state.currentSet : state.currentSet + 1, matchWinner: matchWinner, isMatchOver: !!matchWinner, servingTeam: null, isTimerRunning: !matchWinner, timeoutsA: 0, timeoutsB: 0, inSuddenDeath: false, pendingSideSwitch: false, actionLog: [], matchLog: [...state.matchLog, newAction], lastSnapshot: snapshotState, rotationReport: rotReport };
            }
            
            return { 
                ...state, 
                scoreA: newScoreA, 
                scoreB: newScoreB, 
                teamARoster: nextTeamA, 
                teamBRoster: nextTeamB, 
                servingTeam: team, 
                isTimerRunning: true, 
                inSuddenDeath: state.inSuddenDeath || enteringSuddenDeath, 
                pendingSideSwitch: triggerSideSwitch, 
                swappedSides: triggerSideSwitch ? !state.swappedSides : state.swappedSides,
                actionLog: [...state.actionLog, newAction], 
                matchLog: [...state.matchLog, newAction] 
            };
        }

        case 'SUBTRACT_POINT': {
            if (state.isMatchOver) return state;
            const team = action.team;
            if ((team === 'A' ? state.scoreA : state.scoreB) <= 0) return state;
            return { ...state, scoreA: team === 'A' ? Math.max(0, state.scoreA - 1) : state.scoreA, scoreB: team === 'B' ? Math.max(0, state.scoreB - 1) : state.scoreB, pendingSideSwitch: false };
        }
    
        case 'TIMEOUT': {
            const team = action.team;
            if (!isValidTimeoutRequest(team === 'A' ? state.timeoutsA : state.timeoutsB)) return state;
            const newAction: ActionLog = { type: 'TIMEOUT', team, prevTimeoutsA: state.timeoutsA, prevTimeoutsB: state.timeoutsB, timestamp: Date.now() };
            return { ...state, timeoutsA: team === 'A' ? state.timeoutsA + 1 : state.timeoutsA, timeoutsB: team === 'B' ? state.timeoutsB + 1 : state.timeoutsB, actionLog: [...state.actionLog, newAction], matchLog: [...state.matchLog, newAction] };
        }

        case 'TOGGLE_SIDES':
            return { ...state, swappedSides: !state.swappedSides, pendingSideSwitch: false };
    
        case 'SET_SERVER':
            return { ...state, servingTeam: action.team };

        default:
            return state;
    }
};
