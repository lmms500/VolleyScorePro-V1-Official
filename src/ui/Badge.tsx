import React from 'react';
import { motion } from 'framer-motion';

interface BadgeProps {
    children?: React.ReactNode;
    variant?: 'status' | 'score' | 'label' | 'dot';
    color?: 'neutral' | 'indigo' | 'rose' | 'emerald' | 'amber' | 'red' | 'slate';
    size?: 'xs' | 'sm' | 'md';
    pulse?: boolean;
    glow?: boolean;
    glass?: boolean;
    className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
    children,
    variant = 'label',
    color = 'neutral',
    size = 'sm',
    pulse = false,
    glow = false,
    glass = false,
    className = ''
}) => {
    // Base classes por variante
    const variantClasses = {
        status: "px-2 py-0.5 rounded-full font-black uppercase tracking-widest shadow-md inline-flex items-center justify-center",
        score: "px-2.5 rounded-lg bg-gradient-to-br border inline-flex items-center justify-center",
        label: "px-3 py-1 rounded-full flex items-center gap-2 font-bold uppercase tracking-wider",
        dot: "w-2 h-2 rounded-full shadow-sm border"
    };

    // Cores (Light/Dark mode)
    const colorClasses = {
        neutral: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700",
        indigo: "bg-indigo-500 dark:bg-indigo-600 text-white border-indigo-400 dark:border-indigo-500",
        rose: "bg-rose-500 dark:bg-rose-600 text-white border-rose-400 dark:border-rose-500",
        emerald: "bg-emerald-500 dark:bg-emerald-600 text-white border-emerald-400 dark:border-emerald-500",
        amber: "bg-amber-500 dark:bg-amber-600 text-white border-amber-400 dark:border-amber-500",
        red: "bg-red-600 dark:bg-red-700 text-white border-red-500 dark:border-red-600",
        slate: "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600"
    };

    // Tamanhos (apenas para variantes que não sejam 'dot')
    const sizeClasses = variant !== 'dot' ? {
        xs: "text-[8px] px-1.5 py-0.5 border",
        sm: "text-[9px] px-2 py-0.5 border",
        md: "text-[10px] px-3 py-1 border-2"
    } : { xs: '', sm: '', md: '' };

    // Efeitos opcionais
    const pulseClass = pulse ? "animate-pulse" : "";
    const glowClass = glow ? "shadow-lg shadow-current/50" : "";
    const glassClass = glass ? "backdrop-blur-md bg-opacity-90 dark:bg-opacity-90" : "";

    const Component = pulse ? motion.div : 'div';
    const animationProps = pulse ? {
        animate: { scale: [1, 1.05, 1] },
        transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
    } : {};

    return (
        <Component
            className={`${variantClasses[variant]} ${colorClasses[color]} ${sizeClasses[size]} ${pulseClass} ${glowClass} ${glassClass} ${className}`}
            {...animationProps}
        >
            {children}
        </Component>
    );
};
