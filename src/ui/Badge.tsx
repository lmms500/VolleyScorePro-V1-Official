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

    // Cores (Light/Dark mode) - Premium gradients with colored shadows
    const colorClasses = {
        neutral: "bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 text-slate-700 dark:text-slate-200 border-slate-200/50 dark:border-white/10 ring-1 ring-inset ring-white/10 dark:ring-white/5",
        indigo: "bg-gradient-to-br from-indigo-500 to-indigo-600 text-white border-indigo-400/20 shadow-lg shadow-indigo-500/20 ring-1 ring-inset ring-white/10",
        rose: "bg-gradient-to-br from-rose-500 to-rose-600 text-white border-rose-400/20 shadow-lg shadow-rose-500/20 ring-1 ring-inset ring-white/10",
        emerald: "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-emerald-400/20 shadow-lg shadow-emerald-500/20 ring-1 ring-inset ring-white/10",
        amber: "bg-gradient-to-br from-amber-500 to-amber-600 text-white border-amber-400/20 shadow-lg shadow-amber-500/20 ring-1 ring-inset ring-white/10",
        red: "bg-gradient-to-br from-red-500 to-red-600 text-white border-red-400/20 shadow-lg shadow-red-500/20 ring-1 ring-inset ring-white/10",
        slate: "bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-600 dark:to-slate-700 text-slate-600 dark:text-slate-300 border-slate-200/50 dark:border-white/10 ring-1 ring-inset ring-white/10 dark:ring-white/5"
    };

    const dotColorClasses = {
        neutral: "bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-400 dark:to-slate-500 border-white/40 ring-2 ring-white/30 shadow-[0_0_6px_rgba(255,255,255,0.4)]",
        indigo: "bg-gradient-to-br from-indigo-300 to-indigo-400 dark:from-indigo-400 dark:to-indigo-500 border-indigo-200/40 ring-2 ring-white/30 shadow-[0_0_6px_rgba(255,255,255,0.5),0_0_8px_rgba(129,140,248,0.5)]",
        rose: "bg-gradient-to-br from-rose-300 to-rose-400 dark:from-rose-400 dark:to-rose-500 border-rose-200/40 ring-2 ring-white/30 shadow-[0_0_6px_rgba(255,255,255,0.5),0_0_8px_rgba(251,113,133,0.5)]",
        emerald: "bg-gradient-to-br from-emerald-300 to-emerald-400 dark:from-emerald-400 dark:to-emerald-500 border-emerald-200/40 ring-2 ring-white/30 shadow-[0_0_6px_rgba(255,255,255,0.5),0_0_8px_rgba(52,211,153,0.5)]",
        amber: "bg-gradient-to-br from-amber-300 to-amber-400 dark:from-amber-400 dark:to-amber-500 border-amber-200/40 ring-2 ring-white/30 shadow-[0_0_6px_rgba(255,255,255,0.5),0_0_8px_rgba(251,191,36,0.5)]",
        red: "bg-gradient-to-br from-red-300 to-red-400 dark:from-red-400 dark:to-red-500 border-red-200/40 ring-2 ring-white/30 shadow-[0_0_6px_rgba(255,255,255,0.5),0_0_8px_rgba(248,113,113,0.5)]",
        slate: "bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-400 dark:to-slate-500 border-white/40 ring-2 ring-white/30 shadow-[0_0_6px_rgba(255,255,255,0.4)]"
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
    const glassClass = glass ? "backdrop-blur-xl bg-opacity-80 dark:bg-opacity-80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15)]" : "";

    const Component = pulse ? motion.div : 'div';
    const animationProps = pulse ? {
        animate: { scale: [1, 1.05, 1] },
        transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
    } : {};

    const activeColorClasses = variant === 'dot' ? dotColorClasses[color] : colorClasses[color];

    return (
        <Component
            className={`${variantClasses[variant]} ${activeColorClasses} ${sizeClasses[size]} ${pulseClass} ${glowClass} ${glassClass} ${className}`}
            {...animationProps}
        >
            {children}
        </Component>
    );
};
