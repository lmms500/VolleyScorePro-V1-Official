
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { buttonTap } from '../../utils/animations';
import { useGameAudio } from '../../hooks/useGameAudio';
import { useHaptics } from '../../hooks/useHaptics';
import { DEFAULT_CONFIG } from '../../constants';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'icon';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  hapticStyle?: 'light' | 'medium' | 'heavy';
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  onClick,
  hapticStyle = 'light',
  ...props
}) => {
  // Force sound enabled for UI interactions unless globally muted at system level
  // Memoize config to ensure stable reference for the hook dependency array
  const audioConfig = useMemo(() => ({ ...DEFAULT_CONFIG, enableSound: true }), []);
  const audio = useGameAudio(audioConfig);
  const haptics = useHaptics();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Centralized Sensory Feedback
    audio.playTap();
    haptics.impact(hapticStyle);

    if (onClick) onClick(e);
  };

  const base = "font-inter font-bold rounded-2xl flex items-center justify-center gap-2.5 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 select-none relative overflow-hidden disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 group isolate active:scale-[0.98]";

  const variants = {
    // Primary: Indigo Gradient + Physical Top Highlight
    primary: "bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/20 border border-indigo-400/20 hover:from-indigo-400 hover:to-indigo-500 ring-1 ring-inset ring-white/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2)]",

    // Secondary: Glass Gradient
    secondary: "bg-gradient-to-br from-white/15 to-white/5 dark:from-white/15 dark:to-white/5 text-slate-700 dark:text-slate-200 border border-slate-200/50 dark:border-white/10 backdrop-blur-md hover:from-white/20 hover:to-white/10 ring-1 ring-inset ring-white/10 dark:ring-white/5",

    // Danger: Rose Gradient
    danger: "bg-gradient-to-br from-rose-500/20 to-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 hover:from-rose-500/30 hover:to-rose-500/20 shadow-sm ring-1 ring-inset ring-rose-500/10",

    // Ghost: Transparent Interaction
    ghost: "bg-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5",

    // Icon: Simple Round Target
    icon: "p-3 rounded-2xl text-slate-500 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/5 border border-transparent transition-colors"
  };

  const sizes = {
    sm: "px-4 py-2 text-[10px] uppercase tracking-widest min-h-[40px]",
    md: "px-6 py-3 text-xs uppercase tracking-wider min-h-[48px]",
    lg: "px-8 py-4 text-xs font-black uppercase tracking-widest min-h-[56px]",
    xl: "px-10 py-5 text-sm font-black tracking-widest min-h-[64px]"
  };

  const appliedSize = variant === 'icon' ? '' : sizes[size];

  // Robust ARIA Label Resolution: Prop > Title > String Children > Default
  const ariaLabel = props['aria-label'] || props.title || (typeof children === 'string' ? children : 'button');

  return (
    <motion.button
      className={`${base} ${variants[variant]} ${appliedSize} ${className}`}
      variants={buttonTap}
      initial="idle"
      whileTap="tap"
      whileHover="hover"
      onClick={handleClick}
      aria-label={ariaLabel}
      {...props as any}
    >
      {/* Glare Effect Layer - Reacts to hover/tap */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 pointer-events-none z-0"
        initial={{ x: '-100%', skewX: -25 }}
        whileHover={{ x: '100%', transition: { duration: 0.6, ease: "easeInOut" } }}
      />

      {/* Content Container */}
      <div className="relative z-10 flex items-center justify-center gap-2 max-w-full text-center">
        {children}
      </div>
    </motion.button>
  );
};
