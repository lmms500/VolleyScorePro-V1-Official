/**
 * src/hooks/useMatchLifecycle.ts
 *
 * Hook para gerenciar eventos de ciclo de vida da partida.
 * Side-effect puro que consome contexts internamente.
 */

import { useEffect } from 'react';
import { useScore } from '@contexts/GameContext';
import { useModals } from '@contexts/ModalContext';
import { usePerformanceSafe } from '@contexts/PerformanceContext';
import { setGlobalReducedMotion } from '@lib/utils/animations';

/**
 * Responsável por:
 * - Fechar todos os modais quando a partida termina (isMatchOver)
 * - Sincronizar PerformanceContext.isReducedMotion com utilitário global de animações
 */
export function useMatchLifecycle(): void {
    const { isMatchOver } = useScore();
    const { closeAll } = useModals();
    const { isReducedMotion } = usePerformanceSafe();

    // Effect #5: Fecha modais quando match over
    useEffect(() => {
        if (isMatchOver) {
            closeAll();
        }
    }, [isMatchOver, closeAll]);

    // Effect #8: Sincroniza reducedMotion global (animations.ts)
    useEffect(() => {
        setGlobalReducedMotion(isReducedMotion);
    }, [isReducedMotion]);
}
