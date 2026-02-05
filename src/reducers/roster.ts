
import { GameState, GameAction, Team, Player, ActionLog } from '../types';
import { getPlayersOnCourt } from '../constants';
import { handleAddPlayer, handleRemovePlayer, handleDeletePlayer, handleRotate } from '../utils/rosterLogic';
import { sanitizeInput } from '../utils/security';
import { rotateClockwise, rotateCounterClockwise } from '../utils/gameLogic';
import { v4 as uuidv4 } from 'uuid';

export const rosterReducer = (state: GameState, action: GameAction): GameState => {
    const courtLimit = getPlayersOnCourt(state.config.mode);

    switch (action.type) {
        case 'ROSTER_ADD_PLAYER': {
            const { courtA, courtB, queue } = handleAddPlayer(state.teamARoster, state.teamBRoster, state.queue, action.player, action.targetId, courtLimit);
            return { ...state, teamARoster: courtA, teamBRoster: courtB, queue };
        }

        case 'ROSTER_RESTORE_PLAYER': {
            const { player, targetId, index } = action;
            let newA = { ...state.teamARoster }, newB = { ...state.teamBRoster }, newQ = [...state.queue];
            const insert = (list: Player[]) => {
                const copy = [...list];
                if (index !== undefined && index >= 0 && index <= copy.length) copy.splice(index, 0, player);
                else copy.push(player);
                return copy;
            };
            if (targetId === 'A' || targetId === state.teamARoster.id) newA.players = insert(newA.players);
            else if (targetId === 'A_Reserves') newA.reserves = insert(newA.reserves || []);
            else if (targetId === 'B' || targetId === state.teamBRoster.id) newB.players = insert(newB.players);
            else if (targetId === 'B_Reserves') newB.reserves = insert(newB.reserves || []);
            else {
                const qIdx = newQ.findIndex(t => t.id === (targetId.includes('_Reserves') ? targetId.split('_Reserves')[0] : targetId));
                if (qIdx !== -1) {
                    const team = { ...newQ[qIdx] };
                    if (targetId.includes('_Reserves')) team.reserves = insert(team.reserves || []);
                    else team.players = insert(team.players);
                    newQ[qIdx] = team;
                } else if (targetId === 'Queue') { const res = handleAddPlayer(newA, newB, newQ, player, 'Queue', courtLimit); return { ...state, ...res }; }
            }
            return { ...state, teamARoster: newA, teamBRoster: newB, queue: newQ };
        }

        case 'ROSTER_REMOVE_PLAYER': { const { courtA, courtB, queue } = handleRemovePlayer(state.teamARoster, state.teamBRoster, state.queue, action.playerId, courtLimit); return { ...state, teamARoster: courtA, teamBRoster: courtB, queue }; }

        case 'ROSTER_DELETE_PLAYER': { const { courtA, courtB, queue, record } = handleDeletePlayer(state.teamARoster, state.teamBRoster, state.queue, action.playerId); return { ...state, teamARoster: courtA, teamBRoster: courtB, queue, deletedPlayerHistory: record ? [...state.deletedPlayerHistory, record] : state.deletedPlayerHistory }; }

        case 'ROSTER_MOVE_PLAYER': {
            const { playerId, fromId, toId, newIndex } = action;
            let newA = { ...state.teamARoster, players: [...state.teamARoster.players], reserves: [...(state.teamARoster.reserves || [])] };
            let newB = { ...state.teamBRoster, players: [...state.teamBRoster.players,], reserves: [...(state.teamBRoster.reserves || [])] };
            let newQueue = state.queue.map(t => ({ ...t, players: [...t.players], reserves: [...(t.reserves || [])] }));
            let player: Player | undefined;
            const extract = (team: Team, type: 'players' | 'reserves') => {
                const list = team[type]; if (!list) return false;
                const idx = list.findIndex(p => p.id === playerId);
                if (idx !== -1) { [player] = list.splice(idx, 1); return true; }
                return false;
            };
            if (fromId === 'A' || fromId === newA.id) extract(newA, 'players');
            else if (fromId === 'A_Reserves' || fromId === `${newA.id}_Reserves`) extract(newA, 'reserves');
            else if (fromId === 'B' || fromId === newB.id) extract(newB, 'players');
            else if (fromId === 'B_Reserves' || fromId === `${newB.id}_Reserves`) extract(newB, 'reserves');
            else { for (let t of newQueue) { if (fromId === t.id && extract(t, 'players')) break; if (fromId === `${t.id}_Reserves` && extract(t, 'reserves')) break; } }
            if (!player) return state;
            const add = (list: Player[], p: Player, idx?: number) => { const sIdx = (idx !== undefined && idx >= 0 && idx <= list.length) ? idx : list.length; list.splice(sIdx, 0, p); list.forEach((pl, i) => pl.displayOrder = i); };
            if (toId === 'A' || toId === newA.id) { add(newA.players, player, newIndex); newA.tacticalOffset = 0; }
            else if (toId === 'A_Reserves' || toId === `${newA.id}_Reserves`) { add(newA.reserves, player, newIndex); newA.hasActiveBench = true; }
            else if (toId === 'B' || toId === newB.id) { add(newB.players, player, newIndex); newB.tacticalOffset = 0; }
            else if (toId === 'B_Reserves' || toId === `${newB.id}_Reserves`) { add(newB.reserves, player, newIndex); newB.hasActiveBench = true; }
            else { for (let t of newQueue) { if (toId === t.id) { add(t.players, player, newIndex); break; } if (toId === `${t.id}_Reserves`) { add(t.reserves, player, newIndex); t.hasActiveBench = true; break; } } }
            return { ...state, teamARoster: newA, teamBRoster: newB, queue: newQueue };
        }

        case 'ROSTER_UPDATE_PLAYER': {
            const up = (list: Player[]) => list.map(p => p.id === action.playerId ? { ...p, ...action.updates } : p);
            const ut = (t: Team) => ({ ...t, players: up(t.players), reserves: up(t.reserves || []) });
            return { ...state, teamARoster: ut(state.teamARoster), teamBRoster: ut(state.teamBRoster), queue: state.queue.map(ut) };
        }

        case 'ROSTER_UPDATE_TEAM_NAME': {
            const { teamId, name } = action; const safe = sanitizeInput(name);
            let newA = state.teamARoster, newB = state.teamBRoster, newQ = state.queue;
            if (teamId === 'A' || teamId === state.teamARoster.id) newA = { ...state.teamARoster, name: safe };
            else if (teamId === 'B' || teamId === state.teamBRoster.id) newB = { ...state.teamBRoster, name: safe };
            else newQ = state.queue.map(t => t.id === teamId ? { ...t, name: safe } : t);
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
            const tf = (list: Player[]) => list.map(p => p.id === action.playerId ? { ...p, isFixed: !p.isFixed } : p);
            const tt = (t: Team) => ({ ...t, players: tf(t.players), reserves: tf(t.reserves || []) });
            return { ...state, teamARoster: tt(state.teamARoster), teamBRoster: tt(state.teamBRoster), queue: state.queue.map(tt) };
        }

        case 'ROSTER_TOGGLE_BENCH': {
            const { teamId } = action;
            let newA = state.teamARoster, newB = state.teamBRoster, newQ = state.queue;
            if (teamId === 'A' || teamId === state.teamARoster.id) newA = { ...state.teamARoster, hasActiveBench: !state.teamARoster.hasActiveBench };
            else if (teamId === 'B' || teamId === state.teamBRoster.id) newB = { ...state.teamBRoster, hasActiveBench: !state.teamBRoster.hasActiveBench };
            else newQ = state.queue.map(t => t.id === teamId ? { ...t, hasActiveBench: !t.hasActiveBench } : t);
            return { ...state, teamARoster: newA, teamBRoster: newB, queue: newQ };
        }

        // OPTIMIZED: Receives pre-calculated state to avoid main-thread blocking during render
        case 'ROSTER_GENERATE': {
            return {
                ...state,
                teamARoster: { ...action.courtA, reserves: state.teamARoster.reserves, hasActiveBench: state.teamARoster.hasActiveBench },
                teamBRoster: { ...action.courtB, reserves: state.teamBRoster.reserves, hasActiveBench: state.teamBRoster.hasActiveBench },
                queue: action.queue,
                teamAName: action.courtA.name,
                teamBName: action.courtB.name
            };
        }

        case 'ROSTER_SET_MODE': return { ...state, rotationMode: action.mode };

        // OPTIMIZED: Receives pre-calculated state
        case 'ROSTER_BALANCE': {
            return {
                ...state,
                teamARoster: { ...action.courtA, reserves: state.teamARoster.reserves, hasActiveBench: state.teamARoster.hasActiveBench, tacticalOffset: 0 },
                teamBRoster: { ...action.courtB, reserves: state.teamBRoster.reserves, hasActiveBench: state.teamBRoster.hasActiveBench, tacticalOffset: 0 },
                queue: action.queue.map(t => ({ ...t, hasActiveBench: state.queue.find(old => old.id === t.id)?.hasActiveBench ?? false }))
            };
        }

        case 'ROSTER_SUBSTITUTE': {
            const { teamId, playerOutId, playerInId } = action;
            const sub = (t: Team) => {
                if (t.id !== teamId && (teamId !== 'A' || t.id !== state.teamARoster.id) && (teamId !== 'B' || t.id !== state.teamBRoster.id)) return t;
                const p = [...t.players], r = [...(t.reserves || [])];
                const oIdx = p.findIndex(pl => pl.id === playerOutId), iIdx = r.findIndex(pl => pl.id === playerInId);
                if (oIdx !== -1 && iIdx !== -1) { const out = p[oIdx], inn = r[iIdx]; p[oIdx] = inn; r[iIdx] = out; return { ...t, players: p, reserves: r }; }
                return t;
            };
            return { ...state, teamARoster: sub(state.teamARoster), teamBRoster: sub(state.teamBRoster), queue: state.queue.map(sub) };
        }

        case 'ROSTER_SYNC_PROFILES': {
            const profs = action.profiles;
            let changed = false;
            const syncList = (list: Player[]): Player[] => list.map((p): Player => {
                const m = p.profileId ? profs.get(p.profileId) : Array.from(profs.values()).find(pr => pr.name.trim().toLowerCase() === p.name.trim().toLowerCase());
                if (!m) { if (p.profileId) changed = true; return { ...p, profileId: undefined }; }
                const roleMatch = (m.role || 'none') === (p.role || 'none');
                const needsUpdate = p.profileId !== m.id || m.name !== p.name || m.skillLevel !== m.skillLevel || (m.number && m.number !== p.number) || !roleMatch;
                if (needsUpdate) { changed = true; return { ...p, profileId: m.id, name: m.name, skillLevel: m.skillLevel, number: m.number || p.number, role: m.role }; }
                return p;
            });
            if (!changed) return state;
            return { ...state, teamARoster: { ...state.teamARoster, players: syncList(state.teamARoster.players), reserves: syncList(state.teamARoster.reserves || []) }, teamBRoster: { ...state.teamBRoster, players: syncList(state.teamBRoster.players), reserves: syncList(state.teamBRoster.reserves || []) }, queue: state.queue.map(t => ({ ...t, players: syncList(t.players), reserves: syncList(t.reserves || []) })) };
        }

        case 'ROSTER_UNLINK_PROFILE': {
            const unlink = (list: Player[]): Player[] => list.map((p): Player => p.profileId === action.profileId ? { ...p, profileId: undefined, role: 'none' } : p);
            return { ...state, teamARoster: { ...state.teamARoster, players: unlink(state.teamARoster.players), reserves: unlink(state.teamARoster.reserves || []) }, teamBRoster: { ...state.teamBRoster, players: unlink(state.teamBRoster.players), reserves: unlink(state.teamBRoster.reserves || []) }, queue: state.queue.map(t => ({ ...t, players: unlink(t.players), reserves: unlink(t.reserves || []) })) };
        }

        case 'ROSTER_QUEUE_REORDER': {
            const { fromIndex, toIndex } = action;
            if (fromIndex < 0 || fromIndex >= state.queue.length || toIndex < 0 || toIndex >= state.queue.length) return state;
            const nq = [...state.queue], [mov] = nq.splice(fromIndex, 1); nq.splice(toIndex, 0, mov); return { ...state, queue: nq };
        }

        case 'ROSTER_DISBAND_TEAM': return { ...state, queue: state.queue.filter(t => t.id !== action.teamId) };

        case 'ROSTER_RESTORE_TEAM': { const nq = [...state.queue], si = Math.min(Math.max(0, action.index), nq.length); nq.splice(si, 0, action.team); return { ...state, queue: nq }; }

        case 'ROSTER_RESET_ALL': return { ...state, teamARoster: { ...state.teamARoster, players: [], reserves: [], tacticalOffset: 0 }, teamBRoster: { ...state.teamBRoster, players: [], reserves: [], tacticalOffset: 0 }, queue: [] };

        case 'ROSTER_ENSURE_TEAM_IDS': {
            let c = false, na = state.teamARoster, nb = state.teamBRoster;
            if (state.teamARoster.id === 'A') { na = { ...state.teamARoster, id: uuidv4() }; c = true; }
            if (state.teamBRoster.id === 'B') { nb = { ...state.teamBRoster, id: uuidv4() }; c = true; }
            return c ? { ...state, teamARoster: na, teamBRoster: nb } : state;
        }

        case 'ROSTER_SWAP_POSITIONS': {
            const { teamId, indexA, indexB } = action;
            let newA = state.teamARoster;
            let newB = state.teamBRoster;
            let swapped = false;

            const swapInList = (list: Player[]) => {
                const copy = [...list];
                if (indexA >= 0 && indexA < copy.length && indexB >= 0 && indexB < copy.length) {
                    const temp = copy[indexA]; copy[indexA] = copy[indexB]; copy[indexB] = temp; swapped = true;
                }
                return copy;
            };

            if (teamId === 'A' || teamId === state.teamARoster.id) {
                const newPlayers = swapInList(state.teamARoster.players);
                if (swapped) newA = { ...state.teamARoster, players: newPlayers, tacticalOffset: 0 };
            }
            else if (teamId === 'B' || teamId === state.teamBRoster.id) {
                const newPlayers = swapInList(state.teamBRoster.players);
                if (swapped) newB = { ...state.teamBRoster, players: newPlayers, tacticalOffset: 0 };
            }

            if (!swapped) return state;
            return { ...state, teamARoster: newA, teamBRoster: newB };
        }

        case 'ROTATE_TEAMS': {
            if (!state.matchWinner) return state;
            // [FIX] Generate new gameId for session identity
            const newGameId = action.gameId || Date.now().toString();
            const baseReset = {
                gameId: newGameId,
                gameCreatedAt: Date.now(),
                scoreA: 0,
                scoreB: 0,
                setsA: 0,
                setsB: 0,
                currentSet: 1,
                history: [],
                actionLog: [] as ActionLog[],
                matchLog: [] as ActionLog[],
                lastSnapshot: undefined, // [CRÍTICO] Limpa snapshot para evitar Bug de Undo
                isMatchOver: false,
                matchWinner: null,
                servingTeam: null,
                timeoutsA: 0,
                timeoutsB: 0,
                inSuddenDeath: false,
                matchDurationSeconds: 0,
                isTimerRunning: false,
                rotationReport: null
            };

            if (state.queue.length === 0) {
                return {
                    ...state,
                    ...baseReset,
                    teamARoster: { ...state.teamARoster, tacticalOffset: 0 },
                    teamBRoster: { ...state.teamBRoster, tacticalOffset: 0 }
                };
            }

            const rosterSnapshot = { teamARoster: { ...state.teamARoster, players: [...state.teamARoster.players], reserves: [...(state.teamARoster.reserves || [])] }, teamBRoster: { ...state.teamBRoster, players: [...state.teamBRoster.players], reserves: [...(state.teamBRoster.reserves || [])] }, queue: state.queue.map(t => ({ ...t, players: [...t.players], reserves: [...(t.reserves || [])] })), rotationReport: state.rotationReport };
            const res = handleRotate(state.teamARoster, state.teamBRoster, state.queue, state.matchWinner, state.rotationMode, courtLimit);
            const rotationAction: ActionLog = { type: 'ROTATION', snapshot: rosterSnapshot, timestamp: Date.now() };
            return {
                ...state,
                ...baseReset,
                actionLog: [rotationAction],
                matchLog: [rotationAction],
                teamARoster: { ...res.courtA, tacticalOffset: 0 },
                teamBRoster: { ...res.courtB, tacticalOffset: 0 },
                queue: res.queue,
                teamAName: res.courtA.name,
                teamBName: res.courtB.name
            };
        }

        case 'MANUAL_ROTATION': {
            const { teamId, direction } = action;
            let na = { ...state.teamARoster }, nb = { ...state.teamBRoster };
            if (teamId === 'A' || teamId === state.teamARoster.id) { na.players = direction === 'clockwise' ? rotateClockwise(na.players) : rotateCounterClockwise(na.players); na.tacticalOffset = 0; }
            else if (teamId === 'B' || teamId === state.teamBRoster.id) { nb.players = direction === 'clockwise' ? rotateClockwise(nb.players) : rotateCounterClockwise(nb.players); nb.tacticalOffset = 0; }
            const log: ActionLog = { type: 'MANUAL_ROTATION', teamId, direction, timestamp: Date.now() };
            return { ...state, teamARoster: na, teamBRoster: nb, actionLog: [...state.actionLog, log], matchLog: [...state.matchLog, log] };
        }

        default: return state;
    }
};
