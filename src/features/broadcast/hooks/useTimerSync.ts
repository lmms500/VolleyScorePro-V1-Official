/**
 * src/hooks/useTimerSync.ts
 *
 * Hook para sincronizar estado do timer (TimerContext) com estado do jogo (GameContext).
 *
 * IMPORTANTE: Não atualiza GameState a cada tick do timer (eliminado para performance).
 * Timer state é gerenciado exclusivamente pelo TimerContext.
 *
 * Sincronização bidirecional:
 * - Game start → Timer start
 * - Game reset → Timer reset
 */

import { useEffect } from 'react';
import { useScore, useLog } from '@contexts/GameContext';
import { useTimerControls } from '@contexts/TimerContext';

/**
 * Sincroniza controles de timer com eventos do jogo:
 * - Effect #1: Inicia timer quando primeiro ponto é marcado
 * - Effect #2: Reseta timer quando jogo é resetado
 *
 * REMOVIDO: Sync de matchDurationSeconds para evitar re-renders a cada segundo.
 * Componentes que precisam exibir timer devem usar useTimerValue() diretamente.
 */
export function useTimerSync(): void {
    const { scoreA, scoreB, setsA, setsB, isMatchOver } = useScore();
    const { history } = useLog();
    const timer = useTimerControls();

    // Effect #1: Start timer on first scoring event
    useEffect(() => {
        const isMatchActive = scoreA + scoreB + setsA + setsB > 0 || history.length > 0;
        if (isMatchActive && !timer.isRunning && !isMatchOver) {
            timer.start();
        } else if (isMatchOver && timer.isRunning) {
            timer.stop();
        }
    }, [scoreA, scoreB, setsA, setsB, history.length, isMatchOver, timer]);

    // Effect #2: Reset timer quando jogo é resetado (todas as contagens zeradas)
    useEffect(() => {
        if (scoreA === 0 && scoreB === 0 && setsA === 0 && setsB === 0 && history.length === 0) {
            timer.reset();
        }
    }, [scoreA, scoreB, setsA, setsB, history.length, timer]);
}
