import React, { memo, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export type HaloMode = 'idle' | 'serving' | 'scoring' | 'critical';

interface HaloBackgroundProps {
    mode: HaloMode;
    colorTheme: string; // ex: 'indigo', 'rose', 'amber'
    lowGraphics?: boolean;
    className?: string;
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

// Variants for different modes
const variants = {
    idle: {
        opacity: 0,
        scale: 0.8,
        transition: { duration: 0.3 }
    },
    serving: {
        opacity: 0.4,
        scale: 1,
        transition: { duration: 0.5, ease: "easeOut" }
    },
    critical: {
        opacity: [0.5, 0.8, 0.5],
        scale: [1, 1.15, 1],
        transition: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
        }
    },
    scoring: {
        opacity: [0, 0.7, 0],
        scale: [0.9, 1.4, 1.2],
        transition: {
            duration: 0.8,
            ease: "easeOut"
        }
    }
};

export const HaloBackground: React.FC<HaloBackgroundProps> = memo(({
    mode,
    colorTheme,
    lowGraphics = false,
    className = ""
}) => {
    // Force re-trigger of scoring animation by using a key
    const [animationKey, setAnimationKey] = useState(0);

    // Reset animation key when mode changes to 'scoring'
    useEffect(() => {
        if (mode === 'scoring') {
            setAnimationKey(prev => prev + 1);
        }
    }, [mode]);

    if (lowGraphics) return null;

    // For critical mode, force amber color
    const finalColorClass = mode === 'critical'
        ? 'bg-amber-500'
        : (colorMap[colorTheme] || 'bg-indigo-500');

    return (
        <motion.div
            key={mode === 'scoring' ? `halo-${animationKey}` : 'halo-static'}
            className={`
                absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                w-[140%] h-[140%] rounded-full -z-10
                mix-blend-screen pointer-events-none
                ${finalColorClass}
                ${className}
            `}
            initial="idle"
            animate={mode}
            variants={variants}
            style={{
                willChange: 'transform, opacity',
                filter: 'blur(80px)',
                transform: 'translateZ(0)', // Force GPU layer
            }}
        />
    );
});

HaloBackground.displayName = 'HaloBackground';
