
import React from 'react';
import { usePerformanceSafe } from '@contexts/PerformanceContext';

interface ShimmerEffectProps {
    className?: string;
    /** Duration of the shimmer sweep in ms */
    duration?: 500 | 700 | 1000;
    /** Intensity of the shimmer glow */
    intensity?: 'subtle' | 'normal' | 'strong';
    /** Whether the shimmer is on a rounded container */
    rounded?: string;
}

/**
 * Premium shimmer sweep effect.
 * Automatically disabled in ECONOMICO/REDUZIR_MOVIMENTO performance modes.
 * Must be inside a `group` + `relative overflow-hidden` parent.
 */
export const ShimmerEffect: React.FC<ShimmerEffectProps> = ({
    className = '',
    duration = 700,
    intensity = 'normal',
    rounded = 'rounded-inherit'
}) => {
    const { isLowGraphics } = usePerformanceSafe();

    // Disabled in low performance modes
    if (isLowGraphics) return null;

    const intensityMap = {
        subtle: 'via-white/15',
        normal: 'via-white/25',
        strong: 'via-white/40'
    };

    const durationMap = {
        500: 'duration-500',
        700: 'duration-700',
        1000: 'duration-1000'
    };

    return (
        <div
            className={`
                absolute inset-0
                bg-gradient-to-tr from-transparent ${intensityMap[intensity]} to-transparent
                translate-x-[-200%] group-hover:translate-x-[200%]
                transition-transform ${durationMap[duration]}
                skew-x-12
                pointer-events-none
                ${rounded}
                ${className}
            `}
            aria-hidden="true"
        />
    );
};

interface BackgroundOrbProps {
    color: string;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
}

/**
 * Animated background orb that appears on hover.
 * Must be inside a `group` + `relative` parent.
 * Automatically disabled in low performance modes.
 */
export const BackgroundOrb: React.FC<BackgroundOrbProps> = ({
    color,
    className = '',
    size = 'md'
}) => {
    const { isLowGraphics } = usePerformanceSafe();

    if (isLowGraphics) return null;

    const sizeMap = {
        sm: 'w-20 h-20',
        md: 'w-32 h-32',
        lg: 'w-48 h-48'
    };

    return (
        <div
            className={`
                absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                ${sizeMap[size]} rounded-full blur-3xl
                ${color}
                opacity-0 group-hover:opacity-100
                transition-all duration-700
                group-hover:scale-150
                pointer-events-none
                ${className}
            `}
            aria-hidden="true"
        />
    );
};
