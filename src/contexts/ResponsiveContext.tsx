import React, { createContext, useContext, useEffect, useCallback, useMemo } from 'react';
import { spacing, normalize } from '@lib/utils/responsive';

interface ResponsiveContextData {
    updateStyles: () => void;
}

const ResponsiveContext = createContext<ResponsiveContextData>({} as ResponsiveContextData);

export const ResponsiveProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const updateStyles = useCallback(() => {
        const root = document.documentElement;
        const style = root.style;

        // 1. Spacing Scale (4px a 96px base)
        const multipliers = [0.5, 1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24];
        multipliers.forEach(m => {
            style.setProperty(`--space-${m}`, `${spacing(m)}px`);
        });

        // 2. Typography Scale
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

    const value = useMemo(() => ({ updateStyles }), [updateStyles]);

    return (
        <ResponsiveContext.Provider value={value}>
            {children}
        </ResponsiveContext.Provider>
    );
};

export const useResponsive = () => useContext(ResponsiveContext);
