/**
 * performanceModes.ts - Adaptive Performance Configuration
 *
 * Defines the 3 performance tiers and their visual/animation settings.
 * Used by PerformanceContext to control component behavior.
 */

import type { PerformanceMode } from '../utils/deviceDetection';

export interface PerformanceModeConfig {
    animations: {
        /** Master switch: if false, all animations are instant (duration: 0) */
        enabled: boolean;
        /** Use spring physics (true) or simple tween (false) */
        springPhysics: boolean;
        /** Default animation duration in ms (for tween mode) */
        durationMs: number;
        /** Allow complex transitions (scale+blur+opacity combos) */
        complexTransitions: boolean;
        /** Allow Framer Motion layout animations */
        layoutAnimations: boolean;
    };
    visual: {
        /** Backdrop blur level for glass surfaces */
        backdropBlur: 'xl' | 'sm' | 'none';
        /** Box shadow complexity */
        boxShadows: 'full' | 'simple' | 'none';
        /** Enable gradient backgrounds */
        gradients: boolean;
        /** Enable particle systems (confetti physics) */
        particles: boolean;
        /** Enable confetti on match/set win */
        confetti: boolean;
        /** Enable halo glow effects around scores */
        haloEffects: boolean;
        /** Enable noise texture overlay on glass surfaces */
        noiseTexture: boolean;
        /** Background glow mode */
        backgroundGlow: 'animated' | 'static' | 'gradient';
        /** Enable ripple effect on touch */
        rippleEffects: boolean;
        /** Enable drop-shadow on critical score */
        criticalGlow: boolean;
    };
    gpu: {
        /** Allow will-change hints on animating elements */
        willChange: boolean;
        /** Force GPU layer promotion (translateZ, backfaceVisibility) */
        forceGPULayers: boolean;
    };
}

export const PERFORMANCE_CONFIGS: Record<PerformanceMode, PerformanceModeConfig> = {
    /**
     * NORMAL - Full visual experience
     * For high-end devices (8+ cores, 6+ GB RAM, fast GPU)
     */
    NORMAL: {
        animations: {
            enabled: true,
            springPhysics: true,
            durationMs: 300,
            complexTransitions: true,
            layoutAnimations: true,
        },
        visual: {
            backdropBlur: 'xl',
            boxShadows: 'full',
            gradients: true,
            particles: true,
            confetti: true,
            haloEffects: true,
            noiseTexture: true,
            backgroundGlow: 'animated',
            rippleEffects: true,
            criticalGlow: true,
        },
        gpu: {
            willChange: true,
            forceGPULayers: true,
        },
    },

    /**
     * ECONOMICO - Reduced visuals, still beautiful
     * For mid-range devices (4-6 cores, 3-4 GB RAM)
     * Visually similar to NORMAL but lighter on GPU:
     * - Simplified blur (sm instead of xl)
     * - Static background glow (no motion)
     * - No confetti, no particles
     * - Tween animations (no spring physics)
     */
    ECONOMICO: {
        animations: {
            enabled: true,
            springPhysics: false,
            durationMs: 200,
            complexTransitions: false,
            layoutAnimations: false,
        },
        visual: {
            backdropBlur: 'sm',
            boxShadows: 'simple',
            gradients: true,
            particles: false,
            confetti: false,
            haloEffects: true,
            noiseTexture: false,
            backgroundGlow: 'static',
            rippleEffects: true,
            criticalGlow: true,
        },
        gpu: {
            willChange: false,
            forceGPULayers: false,
        },
    },

    /**
     * REDUZIR_MOVIMENTO - Minimal animations, accessibility-first
     * For low-end devices or users with prefers-reduced-motion
     * All visual effects disabled. Instant transitions.
     * Colors and layout preserved, just no motion/blur/effects.
     */
    REDUZIR_MOVIMENTO: {
        animations: {
            enabled: false,
            springPhysics: false,
            durationMs: 0,
            complexTransitions: false,
            layoutAnimations: false,
        },
        visual: {
            backdropBlur: 'none',
            boxShadows: 'none',
            gradients: false,
            particles: false,
            confetti: false,
            haloEffects: false,
            noiseTexture: false,
            backgroundGlow: 'gradient',
            rippleEffects: false,
            criticalGlow: false,
        },
        gpu: {
            willChange: false,
            forceGPULayers: false,
        },
    },
};
