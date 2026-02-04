import { useReducer, useEffect, useCallback, useState, useRef, useMemo, useLayoutEffect } from 'react';
import { gameReducer } from '../reducers/gameReducer';
import { GameState, GameConfig, TeamId, Player, PlayerProfile, SkillType, RotationMode, PlayerRole, Team } from '../types';
import { DEFAULT_CONFIG, SETS_TO_WIN_MATCH, getPlayersOnCourt } from '../constants';
import { SecureStorage } from '../services/SecureStorage';
import { usePlayerProfiles } from './usePlayerProfiles';
import { createPlayer, validateUniqueNumber } from '../utils/rosterLogic';
import { distributeStandard, balanceTeamsSnake } from '../utils/balanceUtils';

// KEYS FOR SPLIT STORAGE
const LEGACY_STORAGE_KEY = 'action_log';
const KEY_CORE = 'vsp_state_core';
const KEY_LOGS = 'vsp_state_logs';

const INITIAL_STATE: GameState = {
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

export const useVolleyGame = () => {
  const [state, dispatch] = useReducer(gameReducer, INITIAL_STATE);
  const { profiles, findProfileByName, isReady: profilesReady, upsertProfile, deleteProfile, batchUpdateStats, mergeProfiles } = usePlayerProfiles();
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Refs for debouncing and change detection
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastLogLength = useRef(0);

  // --- ARCHITECTURAL FIX FOR ERROR #185 ---
  // Create refs that always hold the current state and external functions.
  // This allows us to read state inside callbacks WITHOUT adding them to the dependency array.
  // This ensures 'actions' object reference remains stable, preventing massive context re-renders.
  
  const stateRef = useRef(state);
  const upsertProfileRef = useRef(upsertProfile);
  const deleteProfileRef = useRef(deleteProfile);
  const profilesRef = useRef(profiles);

  useLayoutEffect(() => {
      stateRef.current = state;
      upsertProfileRef.current = upsertProfile;
      deleteProfileRef.current = deleteProfile;
      profilesRef.current = profiles;
  }); // Updates synchronously after every render

  // --- OPTIMIZED LOADING STRATEGY ---
  useEffect(() => {
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
                ...INITIAL_STATE,
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
                    ...INITIAL_STATE, 
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
        } else {
          dispatch({ type: 'ROSTER_ENSURE_TEAM_IDS' });
        }
      } catch (e) {
        console.error("Failed to load game state", e);
      }
      setIsLoaded(true);
    };
    load();
  }, []);

  // --- OPTIMIZED PERSISTENCE STRATEGY (Split-State) ---
  useEffect(() => {
    if (isLoaded && state.syncRole === 'local') {
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
    }
  }, [state, isLoaded]);

  // WRAPPED ACTIONS (Stable Dispatchers via stateRef)
  const loadStateFromFile = useCallback((newState: GameState) => dispatch({ type: 'LOAD_STATE', payload: newState }), []);
  
  const addPoint = useCallback((team: TeamId, metadata?: { playerId: string, skill: SkillType }) => {
      const s = stateRef.current;
      if (s.isMatchOver || s.syncRole === 'spectator') return;
      dispatch({ type: 'POINT', team, metadata });
  }, []);

  const subtractPoint = useCallback((team: TeamId) => {
      const s = stateRef.current;
      if (s.isMatchOver || s.syncRole === 'spectator') return;
      dispatch({ type: 'SUBTRACT_POINT', team });
  }, []);

  const setServer = useCallback((team: TeamId) => {
      const s = stateRef.current;
      if (s.syncRole === 'spectator') return;
      dispatch({ type: 'SET_SERVER', team });
  }, []);

  const useTimeout = useCallback((team: TeamId) => {
      const s = stateRef.current;
      if (s.syncRole === 'spectator') return;
      dispatch({ type: 'TIMEOUT', team });
  }, []);

  const undo = useCallback(() => {
      const s = stateRef.current;
      if (s.syncRole === 'spectator') return;
      dispatch({ type: 'UNDO' });
  }, []);

  const toggleSides = useCallback((config?: GameConfig) => {
      const s = stateRef.current;
      if (s.syncRole === 'spectator') return;
      dispatch({ type: 'TOGGLE_SIDES' });
  }, []);

  const applySettings = useCallback((config: GameConfig, shouldReset: boolean) => dispatch({ type: 'APPLY_SETTINGS', config, shouldReset }), []);
  const resetMatch = useCallback(() => dispatch({ type: 'RESET_MATCH' }), []);
  const togglePlayerFixed = useCallback((id: string) => dispatch({ type: 'ROSTER_TOGGLE_FIXED', playerId: id }), []);
  const removePlayer = useCallback((id: string) => dispatch({ type: 'ROSTER_REMOVE_PLAYER', playerId: id }), []);
  const movePlayer = useCallback((id: string, from: string, to: string, index?: number) => dispatch({ type: 'ROSTER_MOVE_PLAYER', playerId: id, fromId: from, toId: to, newIndex: index }), []);
  const swapPositions = useCallback((teamId: string, indexA: number, indexB: number) => dispatch({ type: 'ROSTER_SWAP_POSITIONS', teamId, indexA, indexB }), []);
  const updateTeamName = useCallback((id: string, name: string) => dispatch({ type: 'ROSTER_UPDATE_TEAM_NAME', teamId: id, name }), []);
  const updateTeamColor = useCallback((id: string, color: any) => dispatch({ type: 'ROSTER_UPDATE_TEAM_COLOR', teamId: id, color }), []);
  const updateTeamLogo = useCallback((id: string, logo: string) => dispatch({ type: 'ROSTER_UPDATE_TEAM_LOGO', teamId: id, logo }), []);
  
  const updatePlayer = useCallback((id: string, updates: Partial<Player>) => {
      dispatch({ type: 'ROSTER_UPDATE_PLAYER', playerId: id, updates });
      return { success: true };
  }, []);
  
  const addPlayer = useCallback((name: string, target: string, number?: string, skill?: number, profileId?: string) => {
      const p = createPlayer(name, 999, profileId, skill, number);
      dispatch({ type: 'ROSTER_ADD_PLAYER', player: p, targetId: target });
      return { success: true };
  }, []);
  
  const undoRemovePlayer = useCallback(() => dispatch({ type: 'ROSTER_UNDO_REMOVE' }), []);
  const commitDeletions = useCallback(() => dispatch({ type: 'ROSTER_COMMIT_DELETIONS' }), []);
  const rotateTeams = useCallback(() => dispatch({ type: 'ROTATE_TEAMS' }), []);
  const setRotationMode = useCallback((mode: RotationMode) => dispatch({ type: 'ROSTER_SET_MODE', mode }), []);
  
  // Stable wrapper using Ref to avoid breaking 'actions' stability
  const savePlayerToProfile = useCallback((playerId: string, data: { name: string, number: string, avatar: string, skill: number, role: PlayerRole }) => {
      const { name, number, avatar, skill, role } = data;
      // Use Ref here instead of dependency
      const p = upsertProfileRef.current(name, skill, undefined, { number, avatar, role });
      dispatch({ type: 'ROSTER_UPDATE_PLAYER', playerId, updates: { name: p.name, number: p.number, skillLevel: p.skillLevel, profileId: p.id, role: p.role }});
      return { success: true };
  }, []);
  
  const revertPlayerChanges = useCallback((playerId: string) => {}, []);
  const sortTeam = useCallback((teamId: string, criteria: any) => dispatch({ type: 'ROSTER_SORT', teamId, criteria }), []);
  const toggleTeamBench = useCallback((teamId: string) => dispatch({ type: 'ROSTER_TOGGLE_BENCH', teamId }), []);
  const substitutePlayers = useCallback((teamId: string, pIn: string, pOut: string) => dispatch({ type: 'ROSTER_SUBSTITUTE', teamId, playerInId: pIn, playerOutId: pOut }), []);
  const deletePlayer = useCallback((id: string) => dispatch({ type: 'ROSTER_DELETE_PLAYER', playerId: id }), []);
  const reorderQueue = useCallback((from: number, to: number) => dispatch({ type: 'ROSTER_QUEUE_REORDER', fromIndex: from, toIndex: to }), []);
  const disbandTeam = useCallback((id: string) => dispatch({ type: 'ROSTER_DISBAND_TEAM', teamId: id }), []);
  const restoreTeam = useCallback((team: Team, index: number) => dispatch({ type: 'ROSTER_RESTORE_TEAM', team, index }), []);
  const onRestorePlayer = useCallback((p: Player, t: string, i?: number) => dispatch({ type: 'ROSTER_RESTORE_PLAYER', player: p, targetId: t, index: i }), []);
  const resetRosters = useCallback(() => dispatch({ type: 'ROSTER_RESET_ALL' }), []);
  const relinkProfile = useCallback((profile: PlayerProfile) => {}, []);
  const manualRotate = useCallback((teamId: string, direction: 'clockwise' | 'counter') => dispatch({ type: 'MANUAL_ROTATION', teamId, direction }), []);
  const setState = useCallback((action: any) => dispatch(action), []);
  
  // HEAVY LOGIC MOVED OUT OF REDUCER
  // Using stateRef to access config/rosters without breaking stability
  const generateTeams = useCallback((rawInputs: string[]) => {
      const s = stateRef.current;
      const courtLimit = getPlayersOnCourt(s.config.mode);
      const players = rawInputs.map((raw, index) => {
          const tokens = raw.trim().split(/\s+/);
          let pName = raw;
          let pNum: string | undefined;
          let pSkill = 5;

          if (tokens.length > 1) {
              const first = tokens[0];
              const last = tokens[tokens.length - 1];
              const firstIsNum = /^\d+$/.test(first);
              const lastIsNum = /^\d+$/.test(last);

              if (firstIsNum && lastIsNum && tokens.length > 2) {
                  pNum = first;
                  pSkill = Math.min(10, Math.max(1, parseInt(last)));
                  pName = tokens.slice(1, -1).join(' ');
              } else if (firstIsNum) {
                  pNum = first;
                  pName = tokens.slice(1).join(' ');
              } else if (lastIsNum) {
                  const val = parseInt(last);
                  if (val <= 10) {
                      pSkill = val;
                      pName = tokens.slice(0, -1).join(' ');
                  } else {
                      pNum = last;
                      pName = tokens.slice(0, -1).join(' ');
                  }
              }
          }

          return createPlayer(pName, index, undefined, pSkill, pNum);
      });

      const result = distributeStandard(players, { ...s.teamARoster, players: [], tacticalOffset: 0 }, { ...s.teamBRoster, players: [], tacticalOffset: 0 }, [], courtLimit);
      
      dispatch({ 
          type: 'ROSTER_GENERATE', 
          courtA: result.courtA, 
          courtB: result.courtB, 
          queue: result.queue 
      });
  }, []);

  const balanceTeams = useCallback(() => {
      const s = stateRef.current;
      const courtLimit = getPlayersOnCourt(s.config.mode);
      const allPlayers = [...s.teamARoster.players, ...s.teamBRoster.players, ...s.queue.flatMap(t => t.players)];
      
      let result;
      if (s.rotationMode === 'balanced') {
          result = balanceTeamsSnake(allPlayers, s.teamARoster, s.teamBRoster, s.queue, courtLimit);
      } else {
          result = distributeStandard(allPlayers, s.teamARoster, s.teamBRoster, s.queue, courtLimit);
      }

      dispatch({ 
          type: 'ROSTER_BALANCE', 
          courtA: result.courtA, 
          courtB: result.courtB, 
          queue: result.queue 
      });
  }, []);

  // WRAP external helpers using refs to keep actions stable
  const upsertProfileStable = useCallback((...args: Parameters<typeof upsertProfile>) => {
      return upsertProfileRef.current(...args);
  }, []);

  const deleteProfileStable = useCallback((...args: Parameters<typeof deleteProfile>) => {
      return deleteProfileRef.current(...args);
  }, []);

  const actions = useMemo(() => ({
      addPoint, subtractPoint, setServer, useTimeout, undo, toggleSides, applySettings, resetMatch,
      generateTeams, togglePlayerFixed, removePlayer, movePlayer, swapPositions, updateTeamName, updateTeamColor, updateTeamLogo, updatePlayer, addPlayer,
      undoRemovePlayer, commitDeletions, rotateTeams, setRotationMode, balanceTeams, savePlayerToProfile, revertPlayerChanges,
      upsertProfile: upsertProfileStable, deleteProfile: deleteProfileStable, 
      sortTeam, toggleTeamBench, substitutePlayers, deletePlayer, reorderQueue, disbandTeam,
      batchUpdateStats, restoreTeam, onRestorePlayer, resetRosters, relinkProfile, setState,
      manualRotate, loadStateFromFile, mergeProfiles
  }), [
      // Only included dependencies that are themselves stable (created via useCallback with [])
      addPoint, subtractPoint, setServer, useTimeout, undo, toggleSides, applySettings, resetMatch,
      generateTeams, togglePlayerFixed, removePlayer, movePlayer, swapPositions, updateTeamName, updateTeamColor, updateTeamLogo, updatePlayer, addPlayer,
      undoRemovePlayer, commitDeletions, rotateTeams, setRotationMode, balanceTeams, savePlayerToProfile, revertPlayerChanges,
      upsertProfileStable, deleteProfileStable, sortTeam, toggleTeamBench, substitutePlayers, deletePlayer, reorderQueue, disbandTeam,
      batchUpdateStats, restoreTeam, onRestorePlayer, resetRosters, relinkProfile, setState,
      manualRotate, loadStateFromFile, mergeProfiles
  ]);

  const setsNeededToWin = SETS_TO_WIN_MATCH(state.config.maxSets);
  const isTieBreak = state.config.hasTieBreak && state.currentSet === state.config.maxSets;
  const target = isTieBreak ? state.config.tieBreakPoints : state.config.pointsPerSet;
  const isDeuce = !state.inSuddenDeath && state.scoreA === state.scoreB && state.scoreA >= (target - 1);
  const isSetPointA = !isDeuce && state.scoreA >= (target - 1) && state.scoreA > state.scoreB;
  const isSetPointB = !isDeuce && state.scoreB >= (target - 1) && state.scoreB > state.scoreA;
  const isMatchPointA = isSetPointA && (state.setsA === setsNeededToWin - 1);
  const isMatchPointB = isSetPointB && (state.setsB === setsNeededToWin - 1);
  
  return {
      state, isLoaded: isLoaded && profilesReady, profiles,
      actions, 
      ...actions, 
      canUndo: state.actionLog.length > 0,
      hasDeletedPlayers: state.deletedPlayerHistory.length > 0,
      deletedCount: state.deletedPlayerHistory.length,
      rotationMode: state.rotationMode,
      isMatchActive: state.scoreA > 0 || state.scoreB > 0 || state.setsA > 0 || state.setsB > 0,
      isMatchPointA, isMatchPointB, isSetPointA, isSetPointB,
      isDeuce, isTieBreak, setsNeededToWin
  };
};