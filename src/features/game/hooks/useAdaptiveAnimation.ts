/**
 * useAdaptiveAnimation.ts - Adaptive Animation Hooks
 *
 * Provides performance-aware animation utilities.
 * Components use these hooks to get transitions and visual classes
 * that automatically adapt to the current performance mode.
 */

import { useMemo } from 'react';
import { usePerformanceSafe } from '@contexts/PerformanceContext';
import type { Transition } from 'framer-motion';

/**
 * Returns an adaptive Framer Motion transition.
 * - NORMAL: Uses the provided spring/standard transition
 * - ECONOMICO: Converts to simple tween with reduced duration
 * - REDUZIR_MOVIMENTO: Instant (duration: 0)
 */
export const useAdaptiveTransition = (standard: Transition): Transition => {
    const { config } = usePerformanceSafe();

    return useMemo(() => {
        if (!config.animations.enabled) {
            return { duration: 0 };
        }
        if (!config.animations.springPhysics) {
            return {
                type: 'tween' as const,
                duration: config.animations.durationMs / 1000,
                ease: 'easeOut' as const,
            };
        }
        return standard;
    }, [config.animations.enabled, config.animations.springPhysics, config.animations.durationMs, standard]);
};

/**
 * Returns the appropriate backdrop-blur Tailwind class for the current mode.
 * - NORMAL: backdrop-blur-xl
 * - ECONOMICO: backdrop-blur-sm
 * - REDUZIR_MOVIMENTO: '' (no blur)
 */
export const useAdaptiveBlur = (
    /** Override: specific blur level for this component */
    intensityOverride?: 'xl' | 'sm' | 'none'
): string => {
    const { config } = usePerformanceSafe();
    const blur = intensityOverride ?? config.visual.backdropBlur;

    switch (blur) {
        case 'xl': return 'backdrop-blur-xl';
        case 'sm': return 'backdrop-blur-sm';
        case 'none': return '';
    }
};

/**
 * Returns the appropriate box-shadow Tailwind classes for the current mode.
 */
export const useAdaptiveShadow = (): string => {
    const { config } = usePerformanceSafe();

    switch (config.visual.boxShadows) {
        case 'full': return 'shadow-xl shadow-black/10';
        case 'simple': return 'shadow-md';
        case 'none': return '';
    }
};
