import { useState, useEffect, useCallback } from 'react';

export interface SafeAreaInsets {
    top: number;
    bottom: number;
    left: number;
    right: number;
}

/**
 * Mede o valor real de env() criando um elemento temporário
 */
const measureEnvValue = (envVar: string): number => {
    const el = document.createElement('div');
    el.style.position = 'fixed';
    el.style.top = `env(${envVar}, 0px)`;
    el.style.visibility = 'hidden';
    el.style.pointerEvents = 'none';
    document.body.appendChild(el);
    const value = Number.parseFloat(getComputedStyle(el).top) || 0;
    el.remove();
    return value;
};

export const useSafeAreaInsets = (): SafeAreaInsets => {
    const [insets, setInsets] = useState<SafeAreaInsets>({
        top: 0, bottom: 0, left: 0, right: 0,
    });

    const updateInsets = useCallback(() => {
        const root = document.documentElement;
        const computedStyle = getComputedStyle(root);

        // 1. Tentar ler das variáveis CSS primeiro (mais rápido)
        let top = Number.parseInt(computedStyle.getPropertyValue('--sat').replace('px', '')) || 0;
        let bottom = Number.parseInt(computedStyle.getPropertyValue('--sab').replace('px', '')) || 0;
        let left = Number.parseInt(computedStyle.getPropertyValue('--sal').replace('px', '')) || 0;
        let right = Number.parseInt(computedStyle.getPropertyValue('--sar').replace('px', '')) || 0;

        // 2. Se variáveis forem 0, medir diretamente do env() (fallback robusto)
        if (top === 0 && bottom === 0) {
            top = measureEnvValue('safe-area-inset-top');
            bottom = measureEnvValue('safe-area-inset-bottom');
            left = measureEnvValue('safe-area-inset-left');
            right = measureEnvValue('safe-area-inset-right');

            // Atualizar CSS variables para outros componentes usarem
            if (top > 0 || bottom > 0) {
                root.style.setProperty('--sat', `${top}px`);
                root.style.setProperty('--sab', `${bottom}px`);
                root.style.setProperty('--sal', `${left}px`);
                root.style.setProperty('--sar', `${right}px`);
            }
        }

        setInsets({ top, bottom, left, right });
    }, []);

    useEffect(() => {
        // Atualização imediata
        updateInsets();

        // Delay para garantir que StatusBar tenha injetado os valores
        const timeoutId = setTimeout(updateInsets, 100);

        // Segunda verificação após animações de inicialização
        const timeoutId2 = setTimeout(updateInsets, 500);

        // Event listeners para mudanças de layout
        window.addEventListener('resize', updateInsets);
        window.addEventListener('orientationchange', updateInsets);

        // Listener para visualViewport (melhor suporte a teclado virtual)
        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', updateInsets);
        }

        return () => {
            clearTimeout(timeoutId);
            clearTimeout(timeoutId2);
            window.removeEventListener('resize', updateInsets);
            window.removeEventListener('orientationchange', updateInsets);
            if (window.visualViewport) {
                window.visualViewport.removeEventListener('resize', updateInsets);
            }
        };
    }, [updateInsets]);

    return insets;
};

/**
 * Hook para obter altura segura da tela (excluindo safe areas)
 */
export const useSafeHeight = (): number => {
    const insets = useSafeAreaInsets();
    const [height, setHeight] = useState(window.innerHeight);

    useEffect(() => {
        const updateHeight = () => {
            setHeight(window.innerHeight - insets.top - insets.bottom);
        };
        updateHeight();
        window.addEventListener('resize', updateHeight);
        return () => window.removeEventListener('resize', updateHeight);
    }, [insets.top, insets.bottom]);

    return height;
};
