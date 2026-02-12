/**
 * src/hooks/useAdLifecycle.ts
 *
 * Hook para gerenciar ciclo de vida de anúncios (inicialização e visibilidade do banner).
 * Side-effect puro que consome context internamente.
 */

import { useEffect } from 'react';
import { useRoster } from '../contexts/GameContext';
import { adService } from '../services/AdService';

/**
 * Gerencia a inicialização do AdService e controla visibilidade do banner
 * conforme o modo fullscreen e flag de ads removidos.
 *
 * @param {boolean} isFullscreen - Se o app está em modo fullscreen
 */
export function useAdLifecycle(isFullscreen: boolean): void {
    const { config } = useRoster();

    // Effect #6: Inicializa adService no mount
    useEffect(() => {
        adService.initialize();
    }, []);

    // Effect #7: Mostra/oculta banner conforme estado
    useEffect(() => {
        if (!isFullscreen && !config.adsRemoved) {
            adService.showBanner();
        } else {
            adService.hideBanner();
        }
    }, [isFullscreen, config.adsRemoved]);
}
