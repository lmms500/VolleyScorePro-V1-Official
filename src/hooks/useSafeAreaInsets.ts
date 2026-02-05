import { useState, useEffect } from 'react';

export interface SafeAreaInsets {
    top: number;
    bottom: number;
    left: number;
    right: number;
}

/**
 * Hook para ler Safe Area Insets do CSS env()
 * Atualiza dinamicamente em mudanças de orientação
 */
export const useSafeAreaInsets = (): SafeAreaInsets => {
    const [insets, setInsets] = useState<SafeAreaInsets>({
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
    });

    useEffect(() => {
        const updateInsets = () => {
            const root = document.documentElement;
            const computedStyle = getComputedStyle(root);

            const top = parseInt(computedStyle.getPropertyValue('--sat').replace('px', '')) || 0;
            let bottom = parseInt(computedStyle.getPropertyValue('--sab').replace('px', '')) || 0;
            const left = parseInt(computedStyle.getPropertyValue('--sal').replace('px', '')) || 0;
            const right = parseInt(computedStyle.getPropertyValue('--sar').replace('px', '')) || 0;

            // CRITICAL: Limitar bottom a 24px (evitar áreas mortas excessivas)
            bottom = Math.min(bottom, 24);

            setInsets({ top, bottom, left, right });
        };

        updateInsets();

        // Atualizar em resize (mudança de orientação)
        window.addEventListener('resize', updateInsets);
        window.addEventListener('orientationchange', updateInsets);

        return () => {
            window.removeEventListener('resize', updateInsets);
            window.removeEventListener('orientationchange', updateInsets);
        };
    }, []);

    return insets;
};
