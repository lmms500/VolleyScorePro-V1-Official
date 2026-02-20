import { useCallback, useMemo, MutableRefObject, Dispatch } from 'react';
import { GameState, GameAction, GameConfig, TeamId, Player, PlayerProfile, SkillType, RotationMode, PlayerRole, Team } from '@types';
import { createPlayer } from '@features/teams/utils/rosterLogic';
import { StatsDelta } from '@features/history/utils/statsEngine';

interface UseGameActionsOptions {
  stateRef: MutableRefObject<GameState>;
  dispatch: Dispatch<GameAction>;
  upsertProfileRef: MutableRefObject<(name: string, skill?: number, sourceId?: string, extra?: { number?: string; avatar?: string; role?: PlayerRole }) => PlayerProfile>;
  deleteProfileRef: MutableRefObject<(id: string) => PlayerProfile | undefined>;
  batchUpdateStats: (updates: Map<string, StatsDelta>) => void;
  mergeProfiles: (remoteProfiles: PlayerProfile[]) => void;
}

/**
 * Hook containing all game actions wrapped with useCallback for stability.
 * Uses refs to access state without breaking callback stability.
 */
export const useGameActions = ({
  stateRef,
  dispatch,
  upsertProfileRef,
  deleteProfileRef,
  batchUpdateStats,
  mergeProfiles
}: UseGameActionsOptions) => {

  // ==================== SCORING ACTIONS ====================
  const loadStateFromFile = useCallback((newState: GameState) => {
    dispatch({ type: 'LOAD_STATE', payload: newState });
  }, [dispatch]);

  const addPoint = useCallback((team: TeamId, metadata?: { playerId?: string, skill: SkillType }) => {
    const s = stateRef.current;
    if (s.isMatchOver || s.syncRole === 'spectator') return;
    dispatch({ type: 'POINT', team, metadata });
  }, [stateRef, dispatch]);

  const subtractPoint = useCallback((team: TeamId) => {
    const s = stateRef.current;
    if (s.isMatchOver || s.syncRole === 'spectator') return;
    dispatch({ type: 'SUBTRACT_POINT', team });
  }, [stateRef, dispatch]);

  const setServer = useCallback((team: TeamId) => {
    const s = stateRef.current;
    if (s.syncRole === 'spectator') return;
    dispatch({ type: 'SET_SERVER', team });
  }, [stateRef, dispatch]);

  const useTimeout = useCallback((team: TeamId) => {
    const s = stateRef.current;
    if (s.syncRole === 'spectator') return;
    dispatch({ type: 'TIMEOUT', team });
  }, [stateRef, dispatch]);

  const undo = useCallback(() => {
    const s = stateRef.current;
    if (s.syncRole === 'spectator') return;
    dispatch({ type: 'UNDO' });
  }, [stateRef, dispatch]);

  const toggleSides = useCallback((config?: GameConfig) => {
    const s = stateRef.current;
    if (s.syncRole === 'spectator') return;
    dispatch({ type: 'TOGGLE_SIDES' });
  }, [stateRef, dispatch]);

  // ==================== SETTINGS ACTIONS ====================
  const applySettings = useCallback((config: GameConfig, shouldReset: boolean) => {
    dispatch({ type: 'APPLY_SETTINGS', config, shouldReset });
  }, [dispatch]);

  const resetMatch = useCallback(() => {
    dispatch({ type: 'RESET_MATCH' });
  }, [dispatch]);

  // ==================== ROSTER ACTIONS ====================
  const togglePlayerFixed = useCallback((id: string) => {
    dispatch({ type: 'ROSTER_TOGGLE_FIXED', playerId: id });
  }, [dispatch]);

  const removePlayer = useCallback((id: string) => {
    dispatch({ type: 'ROSTER_REMOVE_PLAYER', playerId: id });
  }, [dispatch]);

  const movePlayer = useCallback((id: string, from: string, to: string, index?: number) => {
    dispatch({ type: 'ROSTER_MOVE_PLAYER', playerId: id, fromId: from, toId: to, newIndex: index });
  }, [dispatch]);

  const swapPositions = useCallback((teamId: string, indexA: number, indexB: number) => {
    dispatch({ type: 'ROSTER_SWAP_POSITIONS', teamId, indexA, indexB });
  }, [dispatch]);

  const updateTeamName = useCallback((id: string, name: string) => {
    dispatch({ type: 'ROSTER_UPDATE_TEAM_NAME', teamId: id, name });
  }, [dispatch]);

  const updateTeamColor = useCallback((id: string, color: any) => {
    dispatch({ type: 'ROSTER_UPDATE_TEAM_COLOR', teamId: id, color });
  }, [dispatch]);

  const updateTeamLogo = useCallback((id: string, logo: string) => {
    dispatch({ type: 'ROSTER_UPDATE_TEAM_LOGO', teamId: id, logo });
  }, [dispatch]);

  const updatePlayer = useCallback((id: string, updates: Partial<Player>) => {
    dispatch({ type: 'ROSTER_UPDATE_PLAYER', playerId: id, updates });
    return { success: true };
  }, [dispatch]);

  const addPlayer = useCallback((name: string, target: string, number?: string, skill?: number, profileId?: string) => {
    const p = createPlayer(name, 999, profileId, skill, number);
    dispatch({ type: 'ROSTER_ADD_PLAYER', player: p, targetId: target });
    return { success: true };
  }, [dispatch]);

  const undoRemovePlayer = useCallback(() => {
    dispatch({ type: 'ROSTER_UNDO_REMOVE' });
  }, [dispatch]);

  const commitDeletions = useCallback(() => {
    dispatch({ type: 'ROSTER_COMMIT_DELETIONS' });
  }, [dispatch]);

  const rotateTeams = useCallback(() => {
    dispatch({ type: 'ROTATE_TEAMS' });
  }, [dispatch]);

  const setRotationMode = useCallback((mode: RotationMode) => {
    dispatch({ type: 'ROSTER_SET_MODE', mode });
  }, [dispatch]);

  const savePlayerToProfile = useCallback((playerId: string, data: { name: string, number: string, avatar: string, skill: number, role: PlayerRole }) => {
    const { name, number, avatar, skill, role } = data;
    // Use Ref here instead of dependency
    const p = upsertProfileRef.current(name, skill, undefined, { number, avatar, role });
    dispatch({ type: 'ROSTER_UPDATE_PLAYER', playerId, updates: { name: p.name, number: p.number, skillLevel: p.skillLevel, profileId: p.id, role: p.role } });
    return { success: true };
  }, [upsertProfileRef, dispatch]);

  const revertPlayerChanges = useCallback((playerId: string) => {
    // Placeholder - não implementado no original
  }, []);

  const sortTeam = useCallback((teamId: string, criteria: any) => {
    dispatch({ type: 'ROSTER_SORT', teamId, criteria });
  }, [dispatch]);

  const toggleTeamBench = useCallback((teamId: string) => {
    dispatch({ type: 'ROSTER_TOGGLE_BENCH', teamId });
  }, [dispatch]);

  const substitutePlayers = useCallback((teamId: string, pIn: string, pOut: string) => {
    dispatch({ type: 'ROSTER_SUBSTITUTE', teamId, playerInId: pIn, playerOutId: pOut });
  }, [dispatch]);

  const deletePlayer = useCallback((id: string) => {
    dispatch({ type: 'ROSTER_DELETE_PLAYER', playerId: id });
  }, [dispatch]);

  const reorderQueue = useCallback((from: number, to: number) => {
    dispatch({ type: 'ROSTER_QUEUE_REORDER', fromIndex: from, toIndex: to });
  }, [dispatch]);

  const disbandTeam = useCallback((id: string) => {
    dispatch({ type: 'ROSTER_DISBAND_TEAM', teamId: id });
  }, [dispatch]);

  const restoreTeam = useCallback((team: Team, index: number) => {
    dispatch({ type: 'ROSTER_RESTORE_TEAM', team, index });
  }, [dispatch]);

  const onRestorePlayer = useCallback((p: Player, t: string, i?: number) => {
    dispatch({ type: 'ROSTER_RESTORE_PLAYER', player: p, targetId: t, index: i });
  }, [dispatch]);

  const resetRosters = useCallback(() => {
    dispatch({ type: 'ROSTER_RESET_ALL' });
  }, [dispatch]);

  const relinkProfile = useCallback((profile: PlayerProfile) => {
    // Placeholder - não implementado no original
  }, []);

  const manualRotate = useCallback((teamId: string, direction: 'clockwise' | 'counter') => {
    dispatch({ type: 'MANUAL_ROTATION', teamId, direction });
  }, [dispatch]);

  const setState = useCallback((action: any) => {
    dispatch(action);
  }, [dispatch]);

  // Stable wrappers for profile functions
  const upsertProfileStable = useCallback((...args: Parameters<typeof upsertProfileRef.current>) => {
    return upsertProfileRef.current(...args);
  }, [upsertProfileRef]);

  const deleteProfileStable = useCallback((...args: Parameters<typeof deleteProfileRef.current>) => {
    return deleteProfileRef.current(...args);
  }, [deleteProfileRef]);

  // ==================== ACTIONS OBJECT ====================
  const actions = useMemo(() => ({
    // Scoring
    addPoint,
    subtractPoint,
    setServer,
    useTimeout,
    undo,
    toggleSides,
    applySettings,
    resetMatch,
    loadStateFromFile,
    // Roster
    togglePlayerFixed,
    removePlayer,
    movePlayer,
    swapPositions,
    updateTeamName,
    updateTeamColor,
    updateTeamLogo,
    updatePlayer,
    addPlayer,
    undoRemovePlayer,
    commitDeletions,
    rotateTeams,
    setRotationMode,
    savePlayerToProfile,
    revertPlayerChanges,
    sortTeam,
    toggleTeamBench,
    substitutePlayers,
    deletePlayer,
    reorderQueue,
    disbandTeam,
    restoreTeam,
    onRestorePlayer,
    resetRosters,
    relinkProfile,
    manualRotate,
    setState,
    // Profile wrappers
    upsertProfile: upsertProfileStable,
    deleteProfile: deleteProfileStable,
    batchUpdateStats,
    mergeProfiles
  }), [
    addPoint, subtractPoint, setServer, useTimeout, undo, toggleSides, applySettings, resetMatch, loadStateFromFile,
    togglePlayerFixed, removePlayer, movePlayer, swapPositions, updateTeamName, updateTeamColor, updateTeamLogo,
    updatePlayer, addPlayer, undoRemovePlayer, commitDeletions, rotateTeams, setRotationMode, savePlayerToProfile,
    revertPlayerChanges, sortTeam, toggleTeamBench, substitutePlayers, deletePlayer, reorderQueue, disbandTeam,
    restoreTeam, onRestorePlayer, resetRosters, relinkProfile, manualRotate, setState,
    upsertProfileStable, deleteProfileStable, batchUpdateStats, mergeProfiles
  ]);

  return {
    actions,
    // Also export individual actions for convenience
    addPoint,
    subtractPoint,
    setServer,
    useTimeout,
    undo,
    toggleSides,
    applySettings,
    resetMatch,
    loadStateFromFile,
    togglePlayerFixed,
    removePlayer,
    movePlayer,
    swapPositions,
    updateTeamName,
    updateTeamColor,
    updateTeamLogo,
    updatePlayer,
    addPlayer,
    undoRemovePlayer,
    commitDeletions,
    rotateTeams,
    setRotationMode,
    savePlayerToProfile,
    revertPlayerChanges,
    sortTeam,
    toggleTeamBench,
    substitutePlayers,
    deletePlayer,
    reorderQueue,
    disbandTeam,
    restoreTeam,
    onRestorePlayer,
    resetRosters,
    relinkProfile,
    manualRotate,
    setState,
    upsertProfile: upsertProfileStable,
    deleteProfile: deleteProfileStable
  };
};
