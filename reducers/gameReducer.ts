import { GameState, TeamId, SetHistory, ActionLog, Team, Player, SkillType, GameAction, RotationReport } from '../types';
import { SETS_TO_WIN_MATCH, MIN_LEAD_TO_WIN } from '../constants';
import { isValidTimeoutRequest, sanitizeInput } from '../utils/security';
import { handleAddPlayer, handleRemovePlayer, handleDeletePlayer, handleRotate, createPlayer } from '../utils/rosterLogic';
import { balanceTeamsSnake, distributeStandard } from '../utils/balanceUtils';
import { v4 as uuidv4 } from 'uuid';

// --- HELPERS ---
const calculateWinner = (scoreA: number, scoreB: number, target: number, inSuddenDeath: boolean): TeamId | null => {
    if (inSuddenDeath) {
        if (scoreA >= 3 && scoreA > scoreB) return 'A';
        if (scoreB >= 3 && scoreB > scoreA) return 'B';
    } else {
        if (scoreA >= target && scoreA >= scoreB + MIN_LEAD_TO_WIN) return 'A';
        if (scoreB >= target && scoreB >= scoreA + MIN_LEAD_TO_WIN) return 'B';
    }
    return null;
};

// Rotates array: [1,2,3,4,5,6] -> [6,1,2,3,4,5] (Clockwise visual rotation)
const rotateClockwise = (players: Player[]): Player[] => {
    if (players.length < 2) return players;
    const copy = [...players];
    const last = copy.pop(); // Remove 6
    if (last) copy.unshift(last); // Add 6 to start
    return copy;
};

// Undo rotation: [6,1,2,3,4,5] -> [1,2,3,4,5,6]
const rotateCounterClockwise = (players: Player[]): Player[] => {
    if (players.length < 2) return players;
    const copy = [...players];
    const first = copy.shift(); // Remove 6
    if (first) copy.push(first); // Add 6 to end
    return copy;
};

// --- REDUCER ---
export const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'LOAD_STATE':
      return { ...action.payload };

    // --- GAMEPLAY ACTIONS ---
    case 'POINT': {
      if (state.isMatchOver) return state;
      if (state.scoreA >= 999 || state.scoreB >= 999) return state;

      const team = action.team;
      let newScoreA = team === 'A' ? state.scoreA + 1 : state.scoreA;
      let newScoreB = team === 'B' ? state.scoreB + 1 : state.scoreB;
      
      let triggerSideSwitch = false;
      const totalPoints = newScoreA + newScoreB;
      
      if (state.config.mode === 'beach') {
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
             newScoreA = 0;
             newScoreB = 0;
             enteringSuddenDeath = true;
         }
      }

      const setWinner = calculateWinner(newScoreA, newScoreB, target, state.inSuddenDeath || enteringSuddenDeath);

      // --- AUTO ROTATION LOGIC (Side-Out) ---
      let autoRotated = false;
      let nextTeamA = { ...state.teamARoster };
      let nextTeamB = { ...state.teamBRoster };

      const currentServer = state.servingTeam;
      
      if (setWinner) {
          // If set ends, we don't rotate now, next set setup handles it or user manually sets server.
      } else {
          // Point scored, game continues.
          if (currentServer && currentServer !== team) {
              // SIDE OUT! The team that scored ('team') was NOT serving.
              // They win the serve. They must rotate.
              autoRotated = true;
              if (team === 'A') {
                  nextTeamA.players = rotateClockwise(nextTeamA.players);
                  // Reset Visual Offset on real rotation to sync reality
                  nextTeamA.tacticalOffset = 0;
              } else {
                  nextTeamB.players = rotateClockwise(nextTeamB.players);
                  // Reset Visual Offset on real rotation to sync reality
                  nextTeamB.tacticalOffset = 0;
              }
          }
      }

      const newAction: ActionLog = { 
        type: 'POINT', 
        team,
        prevScoreA: state.scoreA,
        prevScoreB: state.scoreB,
        prevServingTeam: state.servingTeam,
        prevInSuddenDeath: state.inSuddenDeath,
        timestamp: Date.now(),
        autoRotated: autoRotated, // Store for undo
        ...(action.metadata || {})   
      };

      if (setWinner) {
          const newSetsA = setWinner === 'A' ? state.setsA + 1 : state.setsA;
          const newSetsB = setWinner === 'B' ? state.setsB + 1 : state.setsB;
          const historyEntry: SetHistory = { setNumber: state.currentSet, scoreA: newScoreA, scoreB: newScoreB, winner: setWinner };
          
          const setsNeeded = SETS_TO_WIN_MATCH(state.config.maxSets);
          const matchWinner = newSetsA === setsNeeded ? 'A' : (newSetsB === setsNeeded ? 'B' : null);
          
          const snapshotState = { ...state };
          
          // PRE-CALCULATE ROTATION REPORT (But do NOT apply to rosters yet)
          // This allows the MatchOverModal to show "Next: Team X" correctly without mutating the state early.
          let rotReport: RotationReport | null = null;

          if (state.queue.length > 0) {
              const simResult = handleRotate(state.teamARoster, state.teamBRoster, state.queue, setWinner, state.rotationMode);
              rotReport = simResult.report;
          }

          return {
              ...state, 
              scoreA: matchWinner ? newScoreA : 0, 
              scoreB: matchWinner ? newScoreB : 0, 
              setsA: newSetsA, 
              setsB: newSetsB,
              history: [...state.history, historyEntry], 
              currentSet: matchWinner ? state.currentSet : state.currentSet + 1, 
              matchWinner: matchWinner, 
              isMatchOver: !!matchWinner, 
              servingTeam: null, 
              isTimerRunning: matchWinner ? false : true, 
              timeoutsA: 0, 
              timeoutsB: 0, 
              inSuddenDeath: false, 
              pendingSideSwitch: false, 
              actionLog: [], 
              matchLog: [...state.matchLog, newAction], 
              lastSnapshot: snapshotState,
              rotationReport: rotReport, 
              // IMPORTANT: Do NOT update rosters/queue here. Wait for ROTATE_TEAMS action.
          };
      }

      return {
          ...state,
          scoreA: newScoreA,
          scoreB: newScoreB,
          teamARoster: nextTeamA,
          teamBRoster: nextTeamB,
          servingTeam: team, // Scorer becomes server
          isTimerRunning: true,
          inSuddenDeath: state.inSuddenDeath || enteringSuddenDeath,
          pendingSideSwitch: triggerSideSwitch,
          actionLog: [...state.actionLog, newAction],
          matchLog: [...state.matchLog, newAction],
          lastSnapshot: undefined
      };
    }

    case 'SUBTRACT_POINT': {
        if (state.isMatchOver) return state;
        const team = action.team;
        const currentScore = team === 'A' ? state.scoreA : state.scoreB;
        if (currentScore <= 0) return state;
        
        return { 
            ...state, 
            scoreA: team === 'A' ? Math.max(0, state.scoreA - 1) : state.scoreA, 
            scoreB: team === 'B' ? Math.max(0, state.scoreB - 1) : state.scoreB,
            pendingSideSwitch: false 
        };
    }

    case 'TIMEOUT': {
        const team = action.team;
        if (team === 'A' && !isValidTimeoutRequest(state.timeoutsA)) return state;
        if (team === 'B' && !isValidTimeoutRequest(state.timeoutsB)) return state;

        const newAction: ActionLog = { 
            type: 'TIMEOUT', 
            team,
            prevTimeoutsA: state.timeoutsA,
            prevTimeoutsB: state.timeoutsB,
            timestamp: Date.now()
        };

        return {
            ...state,
            timeoutsA: team === 'A' ? state.timeoutsA + 1 : state.timeoutsA,
            timeoutsB: team === 'B' ? state.timeoutsB + 1 : state.timeoutsB,
            actionLog: [...state.actionLog, newAction],
            matchLog: [...state.matchLog, newAction],
            lastSnapshot: undefined
        };
    }

    case 'UNDO': {
        if (state.lastSnapshot) {
            return { ...state.lastSnapshot };
        }
        if (state.isMatchOver) return state;
        if (state.actionLog.length === 0) return state;

        const newLog = [...state.actionLog];
        const lastAction = newLog.pop()!;
        
        const newMatchLog = [...state.matchLog];
        if (newMatchLog.length > 0 && newMatchLog[newMatchLog.length - 1].type === lastAction.type) {
            newMatchLog.pop();
        }

        if (lastAction.type === 'TIMEOUT') {
            return {
                ...state,
                actionLog: newLog,
                matchLog: newMatchLog,
                timeoutsA: lastAction.prevTimeoutsA,
                timeoutsB: lastAction.prevTimeoutsB,
                lastSnapshot: undefined
            };
        }

        if (lastAction.type === 'ROTATION') {
            const snap = lastAction.snapshot;
            return {
                ...state,
                actionLog: newLog,
                matchLog: newMatchLog,
                teamARoster: snap.teamARoster,
                teamBRoster: snap.teamBRoster,
                queue: snap.queue,
                rotationReport: snap.rotationReport,
                teamAName: snap.teamARoster.name,
                teamBName: snap.teamBRoster.name
            };
        }

        if (lastAction.type === 'MANUAL_ROTATION') {
            // Revert rotation (Update Offset)
            const teamId = lastAction.teamId;
            const direction = lastAction.direction; 
            let teamA = { ...state.teamARoster };
            let teamB = { ...state.teamBRoster };

            // Reverse logic: Clockwise undo is Counter-Clockwise (Offset - 1)
            const delta = direction === 'clockwise' ? -1 : 1;

            if (teamId === 'A') {
                const current = teamA.tacticalOffset || 0;
                teamA.tacticalOffset = (current + delta + 6) % 6;
            } else if (teamId === 'B') {
                const current = teamB.tacticalOffset || 0;
                teamB.tacticalOffset = (current + delta + 6) % 6;
            }

            return {
                ...state,
                actionLog: newLog,
                matchLog: newMatchLog, // Remove from logs
                teamARoster: teamA,
                teamBRoster: teamB
            };
        }

        if (lastAction.type === 'POINT') {
            let teamA = { ...state.teamARoster };
            let teamB = { ...state.teamBRoster };

            // Revert Auto-Rotation if it happened
            if (lastAction.autoRotated) {
                if (lastAction.team === 'A') {
                    teamA.players = rotateCounterClockwise(teamA.players);
                } else {
                    teamB.players = rotateCounterClockwise(teamB.players);
                }
            }

            return {
                ...state,
                actionLog: newLog,
                matchLog: newMatchLog,
                scoreA: lastAction.prevScoreA,
                scoreB: lastAction.prevScoreB,
                servingTeam: lastAction.prevServingTeam,
                inSuddenDeath: lastAction.prevInSuddenDeath ?? false,
                pendingSideSwitch: false,
                teamARoster: teamA,
                teamBRoster: teamB,
                lastSnapshot: undefined
            };
        }
        return state;
    }

    case 'RESET_MATCH':
        return {
            ...state,
            scoreA: 0, scoreB: 0, setsA: 0, setsB: 0, currentSet: 1, history: [],
            actionLog: [], matchLog: [], isMatchOver: false, matchWinner: null,
            servingTeam: null, swappedSides: false, timeoutsA: 0, timeoutsB: 0,
            inSuddenDeath: false, pendingSideSwitch: false, matchDurationSeconds: 0,
            isTimerRunning: false, lastSnapshot: undefined,
            // Reset tactical offsets
            teamARoster: { ...state.teamARoster, tacticalOffset: 0 },
            teamBRoster: { ...state.teamBRoster, tacticalOffset: 0 }
        };

    case 'TOGGLE_SIDES':
        return { ...state, swappedSides: !state.swappedSides, pendingSideSwitch: false };

    case 'SET_SERVER':
        return { ...state, servingTeam: action.team };

    case 'APPLY_SETTINGS':
        if (action.shouldReset) {
            return {
                ...state,
                scoreA: 0, scoreB: 0, setsA: 0, setsB: 0, currentSet: 1, history: [],
                actionLog: [], matchLog: [], isMatchOver: false, matchWinner: null,
                servingTeam: null, timeoutsA: 0, timeoutsB: 0, inSuddenDeath: false,
                pendingSideSwitch: false, lastSnapshot: undefined,
                config: action.config,
                teamARoster: { ...state.teamARoster, tacticalOffset: 0 },
                teamBRoster: { ...state.teamBRoster, tacticalOffset: 0 }
            };
        }
        return { ...state, config: action.config };

    case 'ROTATE_TEAMS': {
        // Triggered by "Next Game" button. Now applies the rotation.
        if (!state.matchWinner) return state;
        if (state.queue.length === 0) {
            // No rotation needed, just reset scores for next game
             return {
                ...state,
                scoreA: 0, scoreB: 0, setsA: 0, setsB: 0, currentSet: 1, history: [],
                actionLog: [], 
                matchLog: [], 
                isMatchOver: false, matchWinner: null, servingTeam: null, 
                timeoutsA: 0, timeoutsB: 0, inSuddenDeath: false, 
                matchDurationSeconds: 0, isTimerRunning: false,
                rotationReport: null,
                teamARoster: { ...state.teamARoster, tacticalOffset: 0 },
                teamBRoster: { ...state.teamBRoster, tacticalOffset: 0 }
            };
        }
        
        const rosterSnapshot = {
            teamARoster: { ...state.teamARoster, players: [...state.teamARoster.players], reserves: [...(state.teamARoster.reserves||[])] },
            teamBRoster: { ...state.teamBRoster, players: [...state.teamBRoster.players], reserves: [...(state.teamBRoster.reserves||[])] },
            queue: state.queue.map(t => ({ ...t, players: [...t.players], reserves: [...(t.reserves||[])] })),
            rotationReport: state.rotationReport
        };

        // Perform the actual rotation now
        const res = handleRotate(state.teamARoster, state.teamBRoster, state.queue, state.matchWinner, state.rotationMode);
        
        const rotationAction: ActionLog = {
            type: 'ROTATION',
            snapshot: rosterSnapshot,
            timestamp: Date.now()
        };

        return {
            ...state,
            scoreA: 0, scoreB: 0, setsA: 0, setsB: 0, currentSet: 1, history: [],
            actionLog: [rotationAction], 
            matchLog: [rotationAction], 
            isMatchOver: false, matchWinner: null, servingTeam: null, 
            timeoutsA: 0, timeoutsB: 0, inSuddenDeath: false, 
            matchDurationSeconds: 0, isTimerRunning: false,
            rotationReport: null,
            teamARoster: { ...res.courtA, tacticalOffset: 0 },
            teamBRoster: { ...res.courtB, tacticalOffset: 0 },
            queue: res.queue,
            teamAName: res.courtA.name,
            teamBName: res.courtB.name
        };
    }
    
    case 'RESET_TIMER':
        return { ...state, matchDurationSeconds: 0, isTimerRunning: false };
    
    case 'TOGGLE_TIMER':
        return { ...state, isTimerRunning: !state.isTimerRunning };

    case 'ROSTER_ADD_PLAYER': {
        const { courtA, courtB, queue } = handleAddPlayer(state.teamARoster, state.teamBRoster, state.queue, action.player, action.targetId);
        return { ...state, teamARoster: courtA, teamBRoster: courtB, queue };
    }

    case 'ROSTER_RESTORE_PLAYER': {
        const { player, targetId, index } = action;
        let newA = { ...state.teamARoster }, newB = { ...state.teamBRoster }, newQ = [...state.queue];
        
        const insert = (list: Player[]) => {
            const copy = [...list];
            if (index !== undefined && index >= 0 && index <= copy.length) {
                copy.splice(index, 0, player);
            } else {
                copy.push(player);
            }
            return copy;
        };

        if (targetId === 'A' || targetId === state.teamARoster.id) {
            newA.players = insert(newA.players);
        } else if (targetId === 'A_Reserves') {
            newA.reserves = insert(newA.reserves || []);
        } else if (targetId === 'B' || targetId === state.teamBRoster.id) {
            newB.players = insert(newB.players);
        } else if (targetId === 'B_Reserves') {
            newB.reserves = insert(newB.reserves || []);
        } else {
            const qId = targetId.includes('_Reserves') ? targetId.split('_Reserves')[0] : targetId;
            const qIdx = newQ.findIndex(t => t.id === qId);
            if (qIdx !== -1) {
                const team = { ...newQ[qIdx] };
                if (targetId.includes('_Reserves')) {
                    team.reserves = insert(team.reserves || []);
                } else {
                    team.players = insert(team.players);
                }
                newQ[qIdx] = team;
            } else if (targetId === 'Queue') {
                const res = handleAddPlayer(newA, newB, newQ, player, 'Queue');
                return { ...state, ...res };
            }
        }
        return { ...state, teamARoster: newA, teamBRoster: newB, queue: newQ };
    }

    case 'ROSTER_REMOVE_PLAYER': {
        const { courtA, courtB, queue } = handleRemovePlayer(state.teamARoster, state.teamBRoster, state.queue, action.playerId);
        return { ...state, teamARoster: courtA, teamBRoster: courtB, queue };
    }

    case 'ROSTER_DELETE_PLAYER': {
        const { courtA, courtB, queue, record } = handleDeletePlayer(state.teamARoster, state.teamBRoster, state.queue, action.playerId);
        const newHistory = record ? [...state.deletedPlayerHistory, record] : state.deletedPlayerHistory;
        return { ...state, teamARoster: courtA, teamBRoster: courtB, queue, deletedPlayerHistory: newHistory };
    }

    case 'ROSTER_MOVE_PLAYER': {
        const { playerId, fromId, toId, newIndex } = action;

        // Create copies to mutate safely
        let newA = { ...state.teamARoster, players: [...state.teamARoster.players], reserves: [...(state.teamARoster.reserves || [])] };
        let newB = { ...state.teamBRoster, players: [...state.teamBRoster.players], reserves: [...(state.teamBRoster.reserves || [])] };
        let newQueue = state.queue.map(t => ({ ...t, players: [...t.players], reserves: [...(t.reserves || [])] }));

        // 1. Find and Extract the player
        let player: Player | undefined;

        const findAndExtract = (team: Team, listType: 'players' | 'reserves'): boolean => {
            const list = team[listType];
            if (!list) return false;
            const pIndex = list.findIndex(p => p.id === playerId);
            if (pIndex !== -1) {
                [player] = list.splice(pIndex, 1);
                return true;
            }
            return false;
        };

        if (fromId === 'A' || fromId === newA.id) findAndExtract(newA, 'players');
        else if (fromId === 'A_Reserves' || fromId === `${newA.id}_Reserves`) findAndExtract(newA, 'reserves');
        else if (fromId === 'B' || fromId === newB.id) findAndExtract(newB, 'players');
        else if (fromId === 'B_Reserves' || fromId === `${newB.id}_Reserves`) findAndExtract(newB, 'reserves');
        else {
            for (let team of newQueue) {
                if (fromId === team.id) { if (findAndExtract(team, 'players')) break; }
                else if (fromId === `${team.id}_Reserves`) { if (findAndExtract(team, 'reserves')) break; }
            }
        }
        
        if (!player) {
            console.warn(`[MovePlayer] Player ${playerId} not found in fromId ${fromId}`);
            return state; // Player not found, abort
        }

        // 2. Add player to destination
        const addToList = (list: Player[], p: Player, idx?: number) => {
            const safeIdx = (idx !== undefined && idx >= 0 && idx <= list.length) ? idx : list.length;
            list.splice(safeIdx, 0, p);
        };

        if (toId === 'A' || toId === newA.id) addToList(newA.players, player, newIndex);
        else if (toId === 'A_Reserves' || toId === `${newA.id}_Reserves`) { addToList(newA.reserves, player, newIndex); newA.hasActiveBench = true; }
        else if (toId === 'B' || toId === newB.id) addToList(newB.players, player, newIndex);
        else if (toId === 'B_Reserves' || toId === `${newB.id}_Reserves`) { addToList(newB.reserves, player, newIndex); newB.hasActiveBench = true; }
        else {
            for (let team of newQueue) {
                if (toId === team.id) { addToList(team.players, player, newIndex); break; }
                if (toId === `${team.id}_Reserves`) { addToList(team.reserves, player, newIndex); team.hasActiveBench = true; break; }
            }
        }
        
        return { ...state, teamARoster: newA, teamBRoster: newB, queue: newQueue };
    }

    case 'ROSTER_SWAP_POSITIONS': {
        const { teamId, indexA, indexB } = action;
        let newA = { ...state.teamARoster };
        let newB = { ...state.teamBRoster };
        let swapped = false;

        const swapInList = (list: Player[]) => {
            const copy = [...list];
            if (indexA >= 0 && indexA < copy.length && indexB >= 0 && indexB < copy.length) {
                [copy[indexA], copy[indexB]] = [copy[indexB], copy[indexA]];
                swapped = true;
            }
            return copy;
        };

        if (teamId === state.teamARoster.id) {
            newA.players = swapInList(newA.players);
        } else if (teamId === state.teamBRoster.id) {
            newB.players = swapInList(newB.players);
        }

        if (!swapped) return state;

        return { ...state, teamARoster: newA, teamBRoster: newB };
    }

    case 'ROSTER_UPDATE_PLAYER': {
        const updateList = (list: Player[]) => list.map(p => p.id === action.playerId ? { ...p, ...action.updates } : p);
        const updateTeam = (t: Team) => ({ ...t, players: updateList(t.players), reserves: updateList(t.reserves || []) });
        return {
            ...state,
            teamARoster: updateTeam(state.teamARoster),
            teamBRoster: updateTeam(state.teamBRoster),
            queue: state.queue.map(updateTeam)
        };
    }

    case 'ROSTER_UPDATE_TEAM_NAME': {
        const { teamId, name } = action;
        const safeName = sanitizeInput(name);
        let newA = state.teamARoster, newB = state.teamBRoster, newQ = state.queue;
        if (teamId === 'A' || teamId === state.teamARoster.id) newA = { ...state.teamARoster, name: safeName };
        else if (teamId === 'B' || teamId === state.teamBRoster.id) newB = { ...state.teamBRoster, name: safeName };
        else newQ = state.queue.map(t => t.id === teamId ? { ...t, name: safeName } : t);
        return { ...state, teamARoster: newA, teamBRoster: newB, queue: newQ, teamAName: newA.name, teamBName: newB.name };
    }

    case 'ROSTER_UPDATE_TEAM_COLOR': {
        const { teamId, color } = action;
        let newA = state.teamARoster, newB = state.teamBRoster, newQ = state.queue;
        if (teamId === 'A' || teamId === state.teamARoster.id) newA = { ...state.teamARoster, color };
        else if (teamId === 'B' || teamId === state.teamBRoster.id) newB = { ...state.teamBRoster, color };
        else newQ = state.queue.map(t => t.id === teamId ? { ...t, color } : t);
        return { ...state, teamARoster: newA, teamBRoster: newB, queue: newQ };
    }

    case 'ROSTER_UPDATE_TEAM_LOGO': {
        const { teamId, logo } = action;
        let newA = state.teamARoster, newB = state.teamBRoster, newQ = state.queue;
        if (teamId === 'A' || teamId === state.teamARoster.id) newA = { ...state.teamARoster, logo };
        else if (teamId === 'B' || teamId === state.teamBRoster.id) newB = { ...state.teamBRoster, logo };
        else newQ = state.queue.map(t => t.id === teamId ? { ...t, logo } : t);
        return { ...state, teamARoster: newA, teamBRoster: newB, queue: newQ };
    }

    case 'ROSTER_TOGGLE_FIXED': {
        const toggle = (list: Player[]) => list.map(p => p.id === action.playerId ? { ...p, isFixed: !p.isFixed } : p);
        const toggleTeam = (t: Team) => ({ ...t, players: toggle(t.players), reserves: toggle(t.reserves || []) });
        return {
            ...state,
            teamARoster: toggleTeam(state.teamARoster),
            teamBRoster: toggleTeam(state.teamBRoster),
            queue: state.queue.map(toggleTeam)
        };
    }

    case 'ROSTER_TOGGLE_BENCH': {
        const { teamId } = action;
        let newA = state.teamARoster, newB = state.teamBRoster, newQ = state.queue;
        if (teamId === 'A' || teamId === state.teamARoster.id) newA = { ...state.teamARoster, hasActiveBench: !state.teamARoster.hasActiveBench };
        else if (teamId === 'B' || teamId === state.teamBRoster.id) newB = { ...state.teamBRoster, hasActiveBench: !state.teamBRoster.hasActiveBench };
        else newQ = state.queue.map(t => t.id === teamId ? { ...t, hasActiveBench: !t.hasActiveBench } : t);
        return { ...state, teamARoster: newA, teamBRoster: newB, queue: newQ };
    }

    case 'ROSTER_GENERATE': {
        const players = action.players;
        const cleanA = { ...state.teamARoster, players: [], tacticalOffset: 0 };
        const cleanB = { ...state.teamBRoster, players: [], tacticalOffset: 0 };
        const result = distributeStandard(players, cleanA, cleanB, []);
        return { 
            ...state, 
            teamARoster: { ...result.courtA, reserves: state.teamARoster.reserves, hasActiveBench: state.teamARoster.hasActiveBench },
            teamBRoster: { ...result.courtB, reserves: state.teamBRoster.reserves, hasActiveBench: state.teamBRoster.hasActiveBench },
            queue: result.queue,
            teamAName: result.courtA.name,
            teamBName: result.courtB.name
        };
    }

    case 'ROSTER_SET_MODE':
        return { ...state, rotationMode: action.mode };

    case 'ROSTER_BALANCE': {
        const allPlayers = [ ...state.teamARoster.players, ...state.teamBRoster.players, ...state.queue.flatMap(t => t.players) ];
        let result;
        if (state.rotationMode === 'balanced') result = balanceTeamsSnake(allPlayers, state.teamARoster, state.teamBRoster, state.queue);
        else result = distributeStandard(allPlayers, state.teamARoster, state.teamBRoster, state.queue);
        return {
            ...state,
            teamARoster: { ...result.courtA, reserves: state.teamARoster.reserves, hasActiveBench: state.teamARoster.hasActiveBench, tacticalOffset: 0 },
            teamBRoster: { ...result.courtB, reserves: state.teamBRoster.reserves, hasActiveBench: state.teamBRoster.hasActiveBench, tacticalOffset: 0 },
            queue: result.queue.map((t, i) => {
                const oldTeam = state.queue.find(old => old.id === t.id); 
                return { ...t, hasActiveBench: oldTeam ? oldTeam.hasActiveBench : false };
            }),
        };
    }

    case 'ROSTER_SUBSTITUTE': {
        const { teamId, playerOutId, playerInId } = action;
        const doSubstitute = (team: Team): Team => {
            const isTarget = team.id === teamId || (teamId === 'A' && team.id === state.teamARoster.id) || (teamId === 'B' && team.id === state.teamBRoster.id);
            if (!isTarget) return team;
            const players = [...team.players];
            const reserves = [...(team.reserves || [])];
            const outIndex = players.findIndex(p => p.id === playerOutId);
            const inIndex = reserves.findIndex(p => p.id === playerInId);
            if (outIndex !== -1 && inIndex !== -1) {
                const outPlayer = players[outIndex];
                const inPlayer = reserves[inIndex];
                players[outIndex] = inPlayer;
                reserves[inIndex] = outPlayer;
                return { ...team, players, reserves };
            }
            return team;
        };
        return { ...state, teamARoster: doSubstitute(state.teamARoster), teamBRoster: doSubstitute(state.teamBRoster), queue: state.queue.map(doSubstitute) };
    }

    case 'ROSTER_UNDO_REMOVE': {
        if (state.deletedPlayerHistory.length === 0) return state;
        const history = [...state.deletedPlayerHistory];
        const record = history.pop()!;
        const { player, originId } = record;
        const addTo = (list: Player[]) => [...list, player];
        let newA = state.teamARoster, newB = state.teamBRoster, newQ = state.queue;
        if (originId === 'A') newA = { ...newA, players: addTo(newA.players) };
        else if (originId === 'A_Reserves') newA = { ...newA, reserves: addTo(newA.reserves || []) };
        else if (originId === 'B') newB = { ...newB, players: addTo(newB.players) };
        else if (originId === 'B_Reserves') newB = { ...newB, reserves: addTo(newB.reserves || []) };
        else {
             let found = false;
             newQ = newQ.map(t => {
                 if (t.id === originId) { found = true; return { ...t, players: addTo(t.players) }; }
                 if (`${t.id}_Reserves` === originId) { found = true; return { ...t, reserves: addTo(t.reserves || []) }; }
                 return t;
             });
             if (!found) {
                 if (newQ.length > 0) newQ[newQ.length - 1] = { ...newQ[newQ.length - 1], players: [...newQ[newQ.length - 1].players, player] };
             }
        }
        return { ...state, teamARoster: newA, teamBRoster: newB, queue: newQ, deletedPlayerHistory: history };
    }

    case 'ROSTER_COMMIT_DELETIONS': return { ...state, deletedPlayerHistory: [] };

    case 'ROSTER_SYNC_PROFILES': {
        const profiles = action.profiles;
        let hasChanges = false;
        
        const syncList = (list: Player[]): Player[] => {
            return list.map(p => {
                let master = null;
                
                if (p.profileId) {
                    master = profiles.get(p.profileId);
                } else {
                    // Tenta encontrar por nome (case-insensitive) para restauração de vínculo
                    for (const profile of profiles.values()) {
                        if (profile.name.trim().toLowerCase() === p.name.trim().toLowerCase()) {
                            master = profile;
                            break;
                        }
                    }
                }

                if (!master) { 
                    // Se o jogador tinha um profileId mas o perfil não existe mais, desvincula
                    if (p.profileId) { hasChanges = true; return { ...p, profileId: undefined }; }
                    return p; 
                }

                let changed = false;
                if (p.profileId !== master.id) changed = true;
                if (master.name !== p.name) changed = true;
                if (master.skillLevel !== p.skillLevel) changed = true;
                if (master.number && master.number !== p.number) changed = true;
                if ((master.role || 'none') !== (p.role || 'none')) changed = true;
                
                if (changed) {
                    hasChanges = true;
                    return { 
                        ...p, 
                        profileId: master.id, // Garante que o ID está correto
                        name: master.name, 
                        skillLevel: master.skillLevel, 
                        number: master.number || p.number, // Prefere o número do perfil, mas mantém o atual como fallback
                        role: master.role 
                    };
                }
                return p;
            });
        };

        const newCourtA = { ...state.teamARoster, players: syncList(state.teamARoster.players), reserves: syncList(state.teamARoster.reserves || []) };
        const newCourtB = { ...state.teamBRoster, players: syncList(state.teamBRoster.players), reserves: syncList(state.teamBRoster.reserves || []) };
        const newQueue = state.queue.map(t => ({ ...t, players: syncList(t.players), reserves: syncList(t.reserves || []) }));
        
        if (!hasChanges) return state;
        return { ...state, teamARoster: newCourtA, teamBRoster: newCourtB, queue: newQueue };
    }

    case 'ROSTER_UNLINK_PROFILE': {
        const targetId = action.profileId;
        const unlinkList = (list: Player[]): Player[] => list.map(p => {
            if (p.profileId === targetId) return { ...p, profileId: undefined, role: 'none' };
            return p;
        });
        const newCourtA = { ...state.teamARoster, players: unlinkList(state.teamARoster.players), reserves: unlinkList(state.teamARoster.reserves || []) };
        const newCourtB = { ...state.teamBRoster, players: unlinkList(state.teamBRoster.players), reserves: unlinkList(state.teamBRoster.reserves || []) };
        const newQueue = state.queue.map(t => ({ ...t, players: unlinkList(t.players), reserves: unlinkList(t.reserves || []) }));
        return { ...state, teamARoster: newCourtA, teamBRoster: newCourtB, queue: newQueue };
    }

    case 'ROSTER_QUEUE_REORDER': {
        const { fromIndex, toIndex } = action;
        if (fromIndex < 0 || fromIndex >= state.queue.length || toIndex < 0 || toIndex >= state.queue.length) return state;
        const newQueue = [...state.queue];
        const [moved] = newQueue.splice(fromIndex, 1);
        newQueue.splice(toIndex, 0, moved);
        return { ...state, queue: newQueue };
    }

    case 'ROSTER_DISBAND_TEAM': {
        const newQueue = state.queue.filter(t => t.id !== action.teamId);
        return { ...state, queue: newQueue };
    }

    case 'ROSTER_RESTORE_TEAM': {
        const { team, index } = action;
        const newQueue = [...state.queue];
        const safeIndex = Math.min(Math.max(0, index), newQueue.length);
        newQueue.splice(safeIndex, 0, team);
        return { ...state, queue: newQueue };
    }

    case 'ROSTER_RESET_ALL': {
        return { ...state, teamARoster: { ...state.teamARoster, players: [], reserves: [], tacticalOffset: 0 }, teamBRoster: { ...state.teamBRoster, players: [], reserves: [], tacticalOffset: 0 }, queue: [] };
    }

    case 'ROSTER_ENSURE_TEAM_IDS': {
        let changed = false;
        let newA = state.teamARoster;
        let newB = state.teamBRoster;
        if (state.teamARoster.id === 'A') { newA = { ...state.teamARoster, id: uuidv4() }; changed = true; }
        if (state.teamBRoster.id === 'B') { newB = { ...state.teamBRoster, id: uuidv4() }; changed = true; }
        if (!changed) return state;
        return { ...state, teamARoster: newA, teamBRoster: newB };
    }

    case 'MANUAL_ROTATION': {
        const { teamId, direction } = action;
        let newA = { ...state.teamARoster };
        let newB = { ...state.teamBRoster };
        let log: ActionLog = { type: 'MANUAL_ROTATION', teamId, direction, timestamp: Date.now() };

        // VISUAL ROTATION ONLY: Do NOT mutate players array.
        // Update tacticalOffset.
        const delta = direction === 'clockwise' ? 1 : -1;

        if (teamId === 'A') {
            const current = newA.tacticalOffset || 0;
            // Modulo arithmetic to handle negative wrap around properly
            newA.tacticalOffset = (current + delta + 6) % 6;
        } else if (teamId === 'B') {
            const current = newB.tacticalOffset || 0;
            newB.tacticalOffset = (current + delta + 6) % 6;
        }

        return {
            ...state,
            teamARoster: newA,
            teamBRoster: newB,
            actionLog: [...state.actionLog, log],
            matchLog: [...state.matchLog, log]
        };
    }

    default:
        return state;
  }
};