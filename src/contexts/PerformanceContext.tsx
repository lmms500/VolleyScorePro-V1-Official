/**
 * PerformanceContext - Adaptive Performance System
 *
 * Provides device-aware performance configuration to all components.
 * Auto-detects optimal mode on mount, respects system preferences,
 * and allows manual override via Settings.
 *
 * Placement: App.tsx, wrapping all other providers (no dependencies).
 */

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { detectPerformanceMode, persistPerformanceMode, PerformanceMode } from '../utils/deviceDetection';
import { PERFORMANCE_CONFIGS, PerformanceModeConfig } from '../config/performanceModes';

interface PerformanceContextType {
    /** Current performance mode */
    mode: PerformanceMode;
    /** Full configuration for current mode */
    config: PerformanceModeConfig;
    /** Manually set performance mode (persists to localStorage) */
    setMode: (mode: PerformanceMode) => void;
    /** Downgrade one step: NORMAL → ECONOMICO → REDUZIR_MOVIMENTO */
    downgrade: () => void;
    /** Whether the current mode is low-end equivalent (for backward compat) */
    isLowGraphics: boolean;
    /** Whether animations should be completely disabled */
    isReducedMotion: boolean;
}

const PerformanceContext = createContext<PerformanceContextType | undefined>(undefined);

export const PerformanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [mode, setModeState] = useState<PerformanceMode>(() => detectPerformanceMode());

    // Listen for system preference changes (prefers-reduced-motion)
    useEffect(() => {
        const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
        const handler = (e: MediaQueryListEvent) => {
            if (e.matches) {
                setModeState('REDUZIR_MOVIMENTO');
                persistPerformanceMode('REDUZIR_MOVIMENTO');
            }
        };
        mql.addEventListener('change', handler);
        return () => mql.removeEventListener('change', handler);
    }, []);

    const setMode = useCallback((newMode: PerformanceMode) => {
        setModeState(newMode);
        persistPerformanceMode(newMode);
    }, []);

    const downgrade = useCallback(() => {
        setModeState(prev => {
            const next: PerformanceMode =
                prev === 'NORMAL' ? 'ECONOMICO' :
                prev === 'ECONOMICO' ? 'REDUZIR_MOVIMENTO' :
                'REDUZIR_MOVIMENTO'; // Already at lowest
            persistPerformanceMode(next);
            return next;
        });
    }, []);

    const value = useMemo((): PerformanceContextType => ({
        mode,
        config: PERFORMANCE_CONFIGS[mode],
        setMode,
        downgrade,
        isLowGraphics: mode !== 'NORMAL',
        isReducedMotion: mode === 'REDUZIR_MOVIMENTO',
    }), [mode, setMode, downgrade]);

    return (
        <PerformanceContext.Provider value={value}>
            {children}
        </PerformanceContext.Provider>
    );
};

/**
 * Hook to consume performance configuration.
 * Throws if used outside PerformanceProvider.
 */
export const usePerformance = (): PerformanceContextType => {
    const ctx = useContext(PerformanceContext);
    if (!ctx) throw new Error('usePerformance must be used within PerformanceProvider');
    return ctx;
};

/**
 * Safe hook variant that returns default NORMAL config if no provider exists.
 * Useful for truly reusable components that may render outside the app tree.
 */
export const usePerformanceSafe = (): PerformanceContextType => {
    const ctx = useContext(PerformanceContext);
    if (ctx) return ctx;

    // Fallback: full NORMAL mode (no-op setters)
    return {
        mode: 'NORMAL',
        config: PERFORMANCE_CONFIGS['NORMAL'],
        setMode: () => {},
        downgrade: () => {},
        isLowGraphics: false,
        isReducedMotion: false,
    };
};
