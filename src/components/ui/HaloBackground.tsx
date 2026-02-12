import React, { memo, useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type HaloMode = 'idle' | 'serving' | 'lastScorer' | 'critical';

export interface HaloBackgroundProps {
    mode: HaloMode;
    colorTheme: string; // ex: 'indigo', 'rose', 'amber'
    lowGraphics?: boolean;
    className?: string;
    /** Tamanho base do halo em unidades CSS (default: 1.5em relativo ao font-size do número) */
    score: number;
    size?: string;
}

// Map color theme to Tailwind classes
const colorMap: Record<string, string> = {
    indigo: 'bg-indigo-500',
    violet: 'bg-violet-500',
    purple: 'bg-purple-500',
    rose: 'bg-rose-500',
    pink: 'bg-pink-500',
    red: 'bg-red-500',
    orange: 'bg-orange-500',
    amber: 'bg-amber-500',
    yellow: 'bg-yellow-500',
    lime: 'bg-lime-500',
    green: 'bg-green-500',
    emerald: 'bg-emerald-500',
    teal: 'bg-teal-500',
    cyan: 'bg-cyan-500',
    sky: 'bg-sky-500',
    blue: 'bg-blue-500',
    slate: 'bg-slate-500',
};

// Variants for the permanent glow layer
const glowVariants = {
    idle: {
        opacity: 0,
        scale: 0.8,
        transition: { duration: 0.3 }
    },
    serving: {
        opacity: 0.8, // increased from 0.35
        scale: 1.2, // increased from 1
        transition: { duration: 0.5, ease: "easeOut" }
    },
    lastScorer: {
        opacity: 0.9, // increased from 0.45
        scale: 1.2, // increased from 1
        transition: { duration: 0.5, ease: "easeOut" }
    },
    critical: {
        opacity: [0.8, 1, 0.8], // increased from 0.5-0.8
        scale: [1.1, 1.3, 1.1], // increased from 1-1.15
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
    lowGraphics = false,
    className = "",
    size
}) => {
    // Track flash trigger - fires when score INCREASES
    const [showFlash, setShowFlash] = useState(false);
    const prevScoreRef = useRef<number>(score);

    useEffect(() => {
        // Trigger flash when score increases
        if (score > prevScoreRef.current) {
            setShowFlash(true);
            const timer = setTimeout(() => setShowFlash(false), 700);
            return () => clearTimeout(timer);
        }
        prevScoreRef.current = score;
    }, [score]);

    if (lowGraphics) return null;

    // For critical mode, force amber color
    const finalColorClass = mode === 'critical'
        ? 'bg-amber-500'
        : (colorMap[colorTheme] || 'bg-indigo-500');

    // Classes base para as layers de brilho
    const layerClasses = `
        absolute rounded-full -z-10
        mix-blend-screen pointer-events-none
        ${finalColorClass}
    `;

    // Tamanho base do halo
    const haloSize = size || 'min(35vw, 35vh)';
    // Tamanho do flash (40% maior)
    const flashSize = size ? `calc(${size} * 1.4)` : 'min(50vw, 50vh)';

    return (
        // Wrapper ponto-zero: tamanho 0, centralizado pelo grid
        // As layers se expandem a partir do centro via translate(-50%, -50%)
        <div
            className={`relative overflow-visible ${className}`}
            style={{
                width: 0,
                height: 0,
            }}
        >
            {/* Layer 1: Permanent Glow (serving, lastScorer, critical) */}
            <motion.div
                className={layerClasses}
                initial="idle"
                animate={mode}
                variants={glowVariants}
                style={{
                    width: haloSize,
                    height: haloSize,
                    top: '50%',
                    left: '50%',
                    x: '-50%',
                    y: '-50%',
                    z: 0,
                    willChange: 'transform, opacity',
                    filter: 'blur(80px)',
                }}
            />

            {/* Layer 2: Flash Effect (one-shot on score) */}
            <AnimatePresence>
                {showFlash && (
                    <motion.div
                        key="flash"
                        className={layerClasses}
                        variants={flashVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        style={{
                            width: flashSize,
                            height: flashSize,
                            top: '50%',
                            left: '50%',
                            x: '-50%',
                            y: '-50%',
                            z: 0,
                            willChange: 'transform, opacity',
                            filter: 'blur(60px)',
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
});

HaloBackground.displayName = 'HaloBackground';
