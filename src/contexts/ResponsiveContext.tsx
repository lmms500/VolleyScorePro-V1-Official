import React, { createContext, useContext, useEffect, useCallback } from 'react';
import { spacing, normalize } from '@lib/utils/responsive';

interface ResponsiveContextData {
    updateStyles: () => void;
    resizeKey: number;
}

const ResponsiveContext = createContext<ResponsiveContextData>({} as ResponsiveContextData);

export const ResponsiveProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // State para forçar re-renders
    const [resizeKey, setResizeKey] = React.useState(Date.now());

    const updateStyles = useCallback(() => {
        const root = document.documentElement;
        const style = root.style;

        // 1. Spacing Scale (4px a 96px base)
        // Gera vars: --space-1, --space-2 ... --space-24
        const multipliers = [0.5, 1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24];
        multipliers.forEach(m => {
            style.setProperty(`--space-${m}`, `${spacing(m)}px`);
        });

        // 2. Typography Scale (Baseado em tamanhos comuns)
        style.setProperty('--text-xs', `${normalize(12)}px`);
        style.setProperty('--text-sm', `${normalize(14)}px`);
        style.setProperty('--text-base', `${normalize(16)}px`);
        style.setProperty('--text-lg', `${normalize(18)}px`);
        style.setProperty('--text-xl', `${normalize(20)}px`);
        style.setProperty('--text-2xl', `${normalize(24)}px`);
        style.setProperty('--text-3xl', `${normalize(30)}px`);
        style.setProperty('--text-4xl', `${normalize(36)}px`);

        // 3. Viewport Units (para fallback)
        style.setProperty('--vw', `${window.innerWidth}px`);
        style.setProperty('--vh', `${window.innerHeight}px`);

        // Atualiza a key para notificar consumidores
        setResizeKey(Date.now());

        // Log para debug (remover em prod ou usar logger)
        // console.log('[Responsive] Styles updated. Scale:', spacing(1)/4);
    }, []);

    useEffect(() => {
        // Inicializa
        updateStyles();

        let timeoutId: NodeJS.Timeout;

        const handleResize = () => {
            clearTimeout(timeoutId);
            // Debounce de 100ms para performance
            timeoutId = setTimeout(() => {
                updateStyles();
            }, 100);
        };

        window.addEventListener('resize', handleResize);
        window.addEventListener('orientationchange', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('orientationchange', handleResize);
            clearTimeout(timeoutId);
        };
    }, [updateStyles]);

    return (
        <ResponsiveContext.Provider value={{ updateStyles, resizeKey }}>
            {children}
        </ResponsiveContext.Provider>
    );
};

export const useResponsive = () => useContext(ResponsiveContext);
