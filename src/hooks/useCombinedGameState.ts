/**
 * src/hooks/useCombinedGameState.ts
 *
 * Hook utilitário para reconstruir o objeto GameState completo
 * a partir dos contextos split (ScoreContext + RosterContext).
 *
 * IMPORTANTE: Mapeamento explícito para garantir type safety.
 * Qualquer mudança no tipo GameState causará erro de compilação.
 */

import { useMemo } from 'react';
import { useScore, useRoster } from '../contexts/GameContext';
import { GameState } from '../types';

/**
 * Reconstrói o objeto GameState completo com type safety garantido.
 * Usa mapeamento explícito campo-a-campo ao invés de spread (...).
 *
 * @returns {GameState} - Estado completo do jogo com todos os 35 campos
 */
export function useCombinedGameState(): GameState {
    const scoreState = useScore();
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

        // --- SCORE ---
        scoreA: scoreState.scoreA,
        scoreB: scoreState.scoreB,
        setsA: scoreState.setsA,
        setsB: scoreState.setsB,
        currentSet: scoreState.currentSet,
        history: scoreState.history,

        // --- LOGS ---
        actionLog: scoreState.actionLog,
        matchLog: scoreState.matchLog,
        lastSnapshot: undefined, // Não armazenado nos contexts (runtime only)

        // --- MATCH STATUS ---
        isMatchOver: scoreState.isMatchOver,
        matchWinner: scoreState.matchWinner,
        servingTeam: scoreState.servingTeam,
        swappedSides: scoreState.swappedSides,
        inSuddenDeath: scoreState.inSuddenDeath,
        pendingSideSwitch: scoreState.pendingSideSwitch,

        // --- TIMEOUTS ---
        timeoutsA: scoreState.timeoutsA,
        timeoutsB: scoreState.timeoutsB,

        // --- TIMER ---
        matchDurationSeconds: scoreState.matchDurationSeconds,
        isTimerRunning: scoreState.isTimerRunning,

        // --- CONFIG ---
        config: rosterState.config,

        // --- ROTATION ---
        rotationMode: rosterState.rotationMode,
        rotationReport: rosterState.rotationReport,
        deletedPlayerHistory: rosterState.deletedPlayerHistory,

        // --- SYNC ---
        syncRole: rosterState.syncRole,
        sessionId: rosterState.sessionId,
        connectedSpectators: rosterState.connectedSpectators
    }), [scoreState, rosterState]);
}
