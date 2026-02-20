import { useMemo } from 'react';
import { useScore, useLog, useRoster } from '@contexts/GameContext';
import { useTimerValue, useTimerControls } from '@contexts/TimerContext';
import { GameState } from '@types';

export function useCombinedGameStateWithTimer(): GameState {
  const scoreState = useScore();
  const logState = useLog();
  const rosterState = useRoster();
  const timerValue = useTimerValue();
  const timerControls = useTimerControls();

  return useMemo((): GameState => ({
    gameId: rosterState.gameId ?? '',
    gameCreatedAt: rosterState.gameCreatedAt ?? Date.now(),

    teamAName: rosterState.teamAName,
    teamBName: rosterState.teamBName,
    teamARoster: rosterState.teamARoster,
    teamBRoster: rosterState.teamBRoster,
    queue: rosterState.queue,

    scoreA: scoreState.scoreA,
    scoreB: scoreState.scoreB,
    setsA: scoreState.setsA,
    setsB: scoreState.setsB,
    currentSet: scoreState.currentSet,
    history: logState.history,
    actionLog: logState.actionLog,
    matchLog: logState.matchLog,
    lastScorerTeam: scoreState.lastScorerTeam,

    servingTeam: scoreState.servingTeam,
    matchWinner: scoreState.matchWinner,
    isMatchOver: scoreState.isMatchOver,
    inSuddenDeath: scoreState.inSuddenDeath,
    pendingSideSwitch: scoreState.pendingSideSwitch,
    swappedSides: scoreState.swappedSides,
    timeoutsA: scoreState.timeoutsA,
    timeoutsB: scoreState.timeoutsB,

    matchDurationSeconds: timerValue.seconds,
    isTimerRunning: timerControls.isRunning,

    config: rosterState.config,
    connectedSpectators: 0,

    rotationMode: rosterState.rotationMode,
    rotationReport: rosterState.rotationReport,
    deletedPlayerHistory: rosterState.deletedPlayerHistory,

    syncRole: rosterState.syncRole,
    sessionId: rosterState.sessionId,
    lastSnapshot: undefined,
  }), [scoreState, logState, rosterState, timerValue.seconds, timerControls.isRunning]);
}
