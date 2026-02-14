import React, { memo, useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePerformanceSafe } from '../../contexts/PerformanceContext';

export type HaloMode = 'idle' | 'serving' | 'lastScorer' | 'critical';

export interface HaloBackgroundProps {
    mode: HaloMode;
    colorTheme: string; // ex: 'indigo', 'rose', 'amber'
    /** @deprecated Prefer PerformanceContext. Kept for backward compat. */
    lowGraphics?: boolean;
    className?: string;
    /** Tamanho base do halo em unidades CSS (default: 1.5em relativo ao font-size do número) */
    score: number;
    size?: string;
}

// Hex color map for box-shadow based glow (GPU-friendly, no filter: blur needed)
const hexColorMap: Record<string, string> = {
    indigo: '#6366f1',
    violet: '#8b5cf6',
    purple: '#a855f7',
    rose: '#f43f5e',
    pink: '#ec4899',
    red: '#ef4444',
    orange: '#f97316',
    amber: '#f59e0b',
    yellow: '#eab308',
    lime: '#84cc16',
    green: '#22c55e',
    emerald: '#10b981',
    teal: '#14b8a6',
    cyan: '#06b6d4',
    sky: '#0ea5e9',
    blue: '#3b82f6',
    slate: '#64748b',
};

// Variants for the permanent glow layer
const glowVariants = {
    idle: {
        opacity: 0,
        scale: 0.8,
        transition: { duration: 0.3 }
    },
    serving: {
        opacity: 0.8,
        scale: 1.2,
        transition: { duration: 0.5, ease: "easeOut" }
    },
    lastScorer: {
        opacity: 0.9,
        scale: 1.2,
        transition: { duration: 0.5, ease: "easeOut" }
    },
    critical: {
        opacity: [0.8, 1, 0.8],
        scale: [1.1, 1.3, 1.1],
        transition: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
        }
    }
};

// Flash animation (one-shot)
const flashVariants = {
    initial: { opacity: 0, scale: 0.8 },
    animate: {
        opacity: [0, 0.8, 0],
        scale: [0.9, 1.5, 1.3],
        transition: {
            duration: 0.6,
            ease: "easeOut"
        }
    },
    exit: { opacity: 0 }
};

export const HaloBackground: React.FC<HaloBackgroundProps> = memo(({
    mode,
    colorTheme,
    score,
    lowGraphics: lowGraphicsProp,
    className = "",
    size
}) => {
    const { config: perf } = usePerformanceSafe();

    // Track flash trigger - fires when score INCREASES
    const [showFlash, setShowFlash] = useState(false);
    const prevScoreRef = useRef<number>(score);

    useEffect(() => {
        // Trigger flash ONLY when score increases
        // Strict check to avoid unwanted flashes on mount or re-renders
        if (score > prevScoreRef.current) {
            setShowFlash(true);
            const timer = setTimeout(() => setShowFlash(false), 700);
            return () => clearTimeout(timer);
        }
    }, [score]);

    // Update ref separately to ensure it doesn't block the effect check
    useEffect(() => {
        prevScoreRef.current = score;
    }, [score]);

    // Adaptive: disable halos when performance mode says so, or when lowGraphics prop is true
    const haloDisabled = lowGraphicsProp === true || !perf.visual.haloEffects;
    if (haloDisabled) return null;

    // Resolve hex color for box-shadow glow (GPU-friendly alternative to filter: blur)
    const glowHex = mode === 'critical'
        ? hexColorMap['amber']
        : (hexColorMap[colorTheme] || hexColorMap['indigo']);

    // Glow size via box-shadow spread (element itself is invisible 0x0)
    // Glow size and Flash size are now calculated inline using em units relative to the container font-size

    return (
        <div
            className={`relative overflow-visible ${className}`}
            style={{ width: 0, height: 0 }}
        >
            {/* Layer 1: Permanent Glow - 0x0 element, only box-shadow is visible */}
            <motion.div
                className="absolute pointer-events-none"
                initial="idle"
                animate={mode}
                variants={glowVariants}
                style={{
                    width: 0,
                    height: 0,
                    fontSize: size || '1em', // Uses size prop to scale em units
                    top: '50%',
                    left: '50%',
                    x: '-50%',
                    y: '-50%',
                    // Using em units allows the glow to scale with the fontSize set above
                    boxShadow: `0 0 0.5em 0.4em ${glowHex}, 0 0 1em 0.8em ${glowHex}66`,
                }}
            />

            {/* Layer 2: Flash Effect (one-shot on score) - skip in ECONOMICO for perf */}
            {perf.animations.complexTransitions && (
                <AnimatePresence>
                    {showFlash && (
                        <motion.div
                            key="flash"
                            className="absolute pointer-events-none"
                            variants={flashVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            style={{
                                width: 0,
                                height: 0,
                                fontSize: size || '1em',
                                top: '50%',
                                left: '50%',
                                x: '-50%',
                                y: '-50%',
                                boxShadow: `0 0 0.8em 0.6em ${glowHex}, 0 0 1.5em 1em ${glowHex}44`,
                            }}
                        />
                    )}
                </AnimatePresence>
            )}
        </div>
    );
});

HaloBackground.displayName = 'HaloBackground';
