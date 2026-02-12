/**
 * src/hooks/useTimerSync.ts
 *
 * Hook para sincronizar estado do timer (TimerContext) com estado do jogo (GameContext).
 * Bidirecional: game state → timer controls E timer value → game state.
 */

import { useEffect } from 'react';
import { useScore, useActions } from '../contexts/GameContext';
import { useTimerControls, useTimerValue } from '../contexts/TimerContext';

/**
 * Sincroniza timer context com game state:
 * - Effect #2: Se game.isTimerRunning muda, sincroniza com timer.start()/stop()
 * - Effect #3: Se timer.seconds muda, atualiza game.matchDurationSeconds
 * - Effect #4: Se jogo é resetado (scores = 0, sets = 0), reseta o timer
 */
export function useTimerSync(): void {
    const { isTimerRunning, matchDurationSeconds, scoreA, scoreB, setsA, setsB, history } = useScore();
    const { setState } = useActions();
    const timer = useTimerControls();
    const timerValue = useTimerValue();

    // Effect #2: Sincroniza isTimerRunning → timer.start/stop
    useEffect(() => {
        if (isTimerRunning && !timer.isRunning) {
            timer.start();
        } else if (!isTimerRunning && timer.isRunning) {
            timer.stop();
        }
    }, [isTimerRunning, timer]);

    // Effect #3: Sincroniza timer.seconds → matchDurationSeconds
    // Apenas atualiza se o jogo está ativo E o valor mudou
    useEffect(() => {
        const isMatchActive = scoreA + scoreB + setsA + setsB > 0 || history.length > 0;
        if (isMatchActive && timerValue.seconds !== matchDurationSeconds) {
            setState({ type: 'SET_MATCH_DURATION', duration: timerValue.seconds });
        }
    }, [timerValue.seconds, matchDurationSeconds, scoreA, scoreB, setsA, setsB, history.length, setState]);

    // Effect #4: Reseta timer quando jogo é resetado
    useEffect(() => {
        if (scoreA === 0 && scoreB === 0 && setsA === 0 && setsB === 0 && history.length === 0) {
            timer.reset();
        }
    }, [scoreA, scoreB, setsA, setsB, history.length, timer]);
}
