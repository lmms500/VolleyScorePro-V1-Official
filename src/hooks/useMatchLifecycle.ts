/**
 * src/hooks/useMatchLifecycle.ts
 *
 * Hook para gerenciar eventos de ciclo de vida da partida.
 * Side-effect puro que consome contexts internamente.
 */

import { useEffect } from 'react';
import { useScore, useRoster } from '../contexts/GameContext';
import { useModals } from '../contexts/ModalContext';
import { setGlobalReducedMotion } from '../utils/animations';

/**
 * Responsável por:
 * - Fechar todos os modais quando a partida termina (isMatchOver)
 * - Sincronizar config.reducedMotion com utilitário global de animações
 */
export function useMatchLifecycle(): void {
    const { isMatchOver } = useScore();
    const { config } = useRoster();
    const { closeAll } = useModals();

    // Effect #5: Fecha modais quando match over
    useEffect(() => {
        if (isMatchOver) {
            closeAll();
        }
    }, [isMatchOver, closeAll]);

    // Effect #8: Sincroniza reducedMotion global
    useEffect(() => {
        setGlobalReducedMotion(config.reducedMotion);
    }, [config.reducedMotion]);
}
