
import React, { createContext, useContext, useMemo } from 'react';
import { useVolleyGame } from '../hooks/useVolleyGame';
import { GlobalLoader } from '../components/ui/GlobalLoader';
import { GameState, Team, Player, GameConfig, TeamId, SkillType, PlayerProfile, ActionLog, RotationReport, SyncRole, SetHistory } from '../types';

// --- 1. ACTION CONTEXT (Stable - Never triggers re-renders) ---
interface GameActions {
    addPoint: (team: TeamId, metadata?: { playerId: string, skill: SkillType }) => void;
    subtractPoint: (team: TeamId) => void;
    setServer: (team: TeamId) => void;
    useTimeout: (team: TeamId) => void;
    undo: () => void;
    toggleSides: () => void;
    applySettings: (config: GameConfig, shouldReset: boolean) => void;
    resetMatch: () => void;
    generateTeams: (rawInputs: string[]) => void;
    togglePlayerFixed: (id: string) => void;
    removePlayer: (id: string) => void;
    movePlayer: (id: string, from: string, to: string, index?: number) => void;
    swapPositions: (teamId: string, indexA: number, indexB: number) => void;
    updateTeamName: (id: string, name: string) => void;
    updateTeamColor: (id: string, color: any) => void;
    updateTeamLogo: (id: string, logo: string) => void;
    updatePlayer: (id: string, updates: Partial<Player>) => { success: boolean; error?: string; errorKey?: string; errorParams?: any } | void;
    addPlayer: (name: string, target: string, number?: string, skill?: number, profileId?: string) => { success: boolean; errorKey?: string; errorParams?: any; error?: string };
    undoRemovePlayer: () => void;
    commitDeletions: () => void;
    rotateTeams: () => void;
    setRotationMode: (mode: any) => void;
    balanceTeams: () => void;
    savePlayerToProfile: (playerId: string, data: any) => { success: boolean; error?: string; errorKey?: string };
    revertPlayerChanges: (playerId: string) => void;
    upsertProfile: (name: string, skill: number, id?: string, extras?: { number?: string, avatar?: string, role?: any }) => PlayerProfile;
    deleteProfile: (id: string) => PlayerProfile | undefined;
    sortTeam: (teamId: string, criteria: any) => void;
    toggleTeamBench: (teamId: string) => void;
    substitutePlayers: (teamId: string, pIn: string, pOut: string) => void;
    deletePlayer: (id: string) => void;
    reorderQueue: (from: number, to: number) => void;
    disbandTeam: (id: string) => void;
    restoreTeam: (team: Team, index: number) => void;
    onRestorePlayer: (p: Player, t: string, i?: number) => void;
    resetRosters: () => void;
    relinkProfile: (profile: PlayerProfile) => void;
    manualRotate: (teamId: string, direction: 'clockwise' | 'counter') => void;
    batchUpdateStats: (updates: any) => void;
    setState: (action: any) => void;
    loadStateFromFile: (state: GameState) => void;
    mergeProfiles: (remoteProfiles: PlayerProfile[]) => void;
}

// --- 2. SCORE CONTEXT (Hot Path - Updates frequently, NO logs) ---
interface ScoreContextState {
    scoreA: number;
    scoreB: number;
    setsA: number;
    setsB: number;
    currentSet: number;
    servingTeam: TeamId | null;
    isMatchOver: boolean;
    matchWinner: TeamId | null;
    timeoutsA: number;
    timeoutsB: number;
    inSuddenDeath: boolean;
    pendingSideSwitch: boolean;
    matchDurationSeconds: number;
    isTimerRunning: boolean;
    swappedSides: boolean;

    // Computed
    isMatchActive: boolean;
    isMatchPointA: boolean;
    isMatchPointB: boolean;
    isSetPointA: boolean;
    isSetPointB: boolean;
    isDeuce: boolean;
    isTieBreak: boolean;
    setsNeededToWin: number;
    lastScorerTeam: TeamId | null;
}

// --- 3. LOG CONTEXT (Updates on actions - isolated from score renders) ---
interface LogContextState {
    history: SetHistory[];
    matchLog: ActionLog[];
    actionLog: ActionLog[];
}

// --- 4. ROSTER CONTEXT (Warm Path - Updates on config/roster change) ---
interface RosterContextState {
    teamARoster: Team;
    teamBRoster: Team;
    queue: Team[];
    teamAName: string;
    teamBName: string;
    config: GameConfig;
    profiles: Map<string, PlayerProfile>;
    rotationReport: RotationReport | null;
    deletedPlayerHistory: any[];
    rotationMode: any;
    syncRole: SyncRole;
    sessionId?: string;
    gameId?: string;
    gameCreatedAt?: number;
    connectedSpectators?: number;

    // Meta
    isLoaded: boolean;
    canUndo: boolean;
    hasDeletedPlayers: boolean;
    deletedCount: number;
}

const ActionContext = createContext<GameActions | undefined>(undefined);
const ScoreContext = createContext<ScoreContextState | undefined>(undefined);
const LogContext = createContext<LogContextState | undefined>(undefined);
const RosterContext = createContext<RosterContextState | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const game = useVolleyGame();

  // 1. Actions Memo - STABLE.
  // We use game.actions (which is memoized in the hook) to avoid re-creating this context on every tick.
  const actions = game.actions;

  // 2. Score Memo - Updates on points/timer. NO log arrays in deps.
  const scoreState = useMemo((): ScoreContextState => ({
      scoreA: game.state.scoreA,
      scoreB: game.state.scoreB,
      setsA: game.state.setsA,
      setsB: game.state.setsB,
      currentSet: game.state.currentSet,
      servingTeam: game.state.servingTeam,
      isMatchOver: game.state.isMatchOver,
      matchWinner: game.state.matchWinner,
      timeoutsA: game.state.timeoutsA,
      timeoutsB: game.state.timeoutsB,
      inSuddenDeath: game.state.inSuddenDeath,
      pendingSideSwitch: game.state.pendingSideSwitch,
      matchDurationSeconds: game.state.matchDurationSeconds,
      isTimerRunning: game.state.isTimerRunning,
      swappedSides: game.state.swappedSides,
      // Computed
      isMatchActive: game.isMatchActive,
      isMatchPointA: game.isMatchPointA,
      isMatchPointB: game.isMatchPointB,
      isSetPointA: game.isSetPointA,
      isSetPointB: game.isSetPointB,
      isDeuce: game.isDeuce,
      isTieBreak: game.isTieBreak,
      setsNeededToWin: game.setsNeededToWin,
      lastScorerTeam: game.state.lastScorerTeam  // O(1) from reducer
  }), [
      game.state.scoreA, game.state.scoreB, game.state.setsA, game.state.setsB,
      game.state.currentSet, game.state.servingTeam, game.state.isMatchOver,
      game.state.matchWinner, game.state.timeoutsA, game.state.timeoutsB,
      game.state.inSuddenDeath, game.state.pendingSideSwitch,
      game.state.matchDurationSeconds, game.state.isTimerRunning,
      game.state.swappedSides, game.state.lastScorerTeam,
      game.isMatchActive, game.isMatchPointA, game.isMatchPointB,
      game.isSetPointA, game.isSetPointB, game.isDeuce, game.isTieBreak, game.setsNeededToWin
  ]);

  // 3. Log Memo - Isolated from score context. Updates only when logs/history change.
  const logState = useMemo((): LogContextState => ({
      history: game.state.history,
      matchLog: game.state.matchLog,
      actionLog: game.state.actionLog
  }), [game.state.history, game.state.matchLog, game.state.actionLog]);

  // 4. Roster Memo - Updates on team changes/config
  const rosterState = useMemo((): RosterContextState => ({
      teamARoster: game.state.teamARoster,
      teamBRoster: game.state.teamBRoster,
      queue: game.state.queue,
      teamAName: game.state.teamAName,
      teamBName: game.state.teamBName,
      config: game.state.config,
      profiles: game.profiles,
      rotationReport: game.state.rotationReport,
      deletedPlayerHistory: game.state.deletedPlayerHistory,
      rotationMode: game.state.rotationMode,
      syncRole: game.state.syncRole,
      sessionId: game.state.sessionId,
      gameId: game.state.gameId,
      gameCreatedAt: game.state.gameCreatedAt,
      connectedSpectators: game.state.connectedSpectators,
      isLoaded: game.isLoaded,
      canUndo: game.canUndo,
      hasDeletedPlayers: game.hasDeletedPlayers,
      deletedCount: game.deletedCount
  }), [
      game.state.teamARoster, game.state.teamBRoster, game.state.queue,
      game.state.teamAName, game.state.teamBName, game.state.config,
      game.profiles, game.state.rotationReport, game.state.deletedPlayerHistory,
      game.state.rotationMode, game.state.syncRole, game.state.sessionId,
      game.state.gameId, game.state.gameCreatedAt, game.state.connectedSpectators,
      game.isLoaded, game.canUndo, game.hasDeletedPlayers, game.deletedCount
  ]);

  if (!game.isLoaded) {
      return <GlobalLoader />;
  }

  return (
    <ActionContext.Provider value={actions}>
      <RosterContext.Provider value={rosterState}>
        <LogContext.Provider value={logState}>
          <ScoreContext.Provider value={scoreState}>
            {children}
          </ScoreContext.Provider>
        </LogContext.Provider>
      </RosterContext.Provider>
    </ActionContext.Provider>
  );
};

// --- HOOKS ---

export const useActions = () => {
    const context = useContext(ActionContext);
    if (!context) throw new Error('useActions must be used within GameProvider');
    return context;
};

export const useScore = () => {
    const context = useContext(ScoreContext);
    if (!context) throw new Error('useScore must be used within GameProvider');
    return context;
};

export const useLog = () => {
    const context = useContext(LogContext);
    if (!context) throw new Error('useLog must be used within GameProvider');
    return context;
};

export const useRoster = () => {
    const context = useContext(RosterContext);
    if (!context) throw new Error('useRoster must be used within GameProvider');
    return context;
};

/**
 * Legacy Facade Hook
 * Combines all contexts to maintain backward compatibility with existing components
 * while enabling progressive migration to specialized hooks.
 */
export const useGame = () => {
  const actions = useActions();
  const score = useScore();
  const log = useLog();
  const roster = useRoster();

  // Reconstruct the "God Object" shape expected by App.tsx and legacy consumers
  // IMPORTANT: This object will change identity on ANY context change, so it mimics
  // the original behavior (re-render everything).
  const combinedState: GameState = useMemo(() => ({
      ...score, // scoreA, scoreB...
      ...log,   // history, matchLog, actionLog
      ...roster, // teamARoster...
  } as unknown as GameState), [score, log, roster]);

  return useMemo(() => ({
      ...actions,
      ...score, // Exposed computed props like isMatchPointA
      ...log,   // Exposed log data
      ...roster, // Exposed meta props like isLoaded
      state: combinedState
  }), [actions, score, log, roster, combinedState]);
};
