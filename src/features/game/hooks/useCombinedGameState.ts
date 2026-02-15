/**
 * src/hooks/useCombinedGameState.ts
 *
 * Hook utilitário para reconstruir o objeto GameState completo
 * a partir dos contextos split (ScoreContext + RosterContext).
 *
 * IMPORTANTE: NÃO subscreve ao TimerContext para evitar re-renders a cada segundo.
 * Timer fields (matchDurationSeconds, isTimerRunning) são preenchidos com placeholders.
 * Componentes que precisam de timer real devem usar useTimerValue() diretamente
 * e fazer merge com o estado combinado.
 */

import { useMemo } from 'react';
import { useScore, useLog, useRoster } from '@contexts/GameContext';
import { GameState } from '@types';

/**
 * Reconstrói o objeto GameState completo SEM subscrever ao TimerContext.
 * Isso previne re-renders a cada segundo em todos os consumidores.
 *
 * Timer fields são 0/false — componentes que exibem timer devem usar
 * useTimerValue() diretamente ou usar useCombinedGameStateWithTimer().
 *
 * @returns {GameState} - Estado completo do jogo (timer fields = placeholder)
 */
export function useCombinedGameState(): GameState {
    const scoreState = useScore();
    const logState = useLog();
    const rosterState = useRoster();

    return useMemo((): GameState => ({
        // --- METADATA ---
        gameId: rosterState.gameId ?? '',
        gameCreatedAt: rosterState.gameCreatedAt ?? Date.now(),

        // --- TEAMS ---
        teamAName: rosterState.teamAName,
        teamBName: rosterState.teamBName,
        teamARoster: rosterState.teamARoster,
        teamBRoster: rosterState.teamBRoster,
        queue: rosterState.queue,

        // --- SCORES ---
        scoreA: scoreState.scoreA,
        scoreB: scoreState.scoreB,
        setsA: scoreState.setsA,
        setsB: scoreState.setsB,
        currentSet: scoreState.currentSet,
        history: logState.history,
        actionLog: logState.actionLog,
        matchLog: logState.matchLog,
        lastScorerTeam: scoreState.lastScorerTeam,

        // --- MATCH STATUS ---
        servingTeam: scoreState.servingTeam,
        matchWinner: scoreState.matchWinner,
        isMatchOver: scoreState.isMatchOver,
        inSuddenDeath: scoreState.inSuddenDeath,
        pendingSideSwitch: scoreState.pendingSideSwitch,
        swappedSides: scoreState.swappedSides,
        timeoutsA: scoreState.timeoutsA,
        timeoutsB: scoreState.timeoutsB,

        // --- TIMER (PLACEHOLDER — não subscreve ao TimerContext) ---
        // Componentes que precisam do timer real devem usar useTimerValue()
        matchDurationSeconds: 0,
        isTimerRunning: false,

        // --- CONFIG ---
        config: rosterState.config,
        connectedSpectators: 0,

        // --- ROTATION ---
        rotationMode: rosterState.rotationMode,
        rotationReport: rosterState.rotationReport,
        deletedPlayerHistory: rosterState.deletedPlayerHistory,

        // --- SYNC ---
        syncRole: rosterState.syncRole,
        sessionId: rosterState.sessionId,
    }), [scoreState, logState, rosterState]);
}
