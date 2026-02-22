import React from 'react';
import { motion } from 'framer-motion';
import { buttonTap } from '@lib/utils/animations';
import { audioService } from '@lib/audio/AudioService';
import { useHaptics } from '@lib/haptics/useHaptics';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'icon' | 'success' | 'outline';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  hapticStyle?: 'light' | 'medium' | 'heavy';
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  leftIcon,
  rightIcon,
  className = '',
  children,
  onClick,
  hapticStyle = 'light',
  ...props
}) => {
  audioService.init();
  const haptics = useHaptics();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    audioService.playTap();
    haptics.impact(hapticStyle);
    if (onClick) onClick(e);
  };

  const base = "font-inter font-bold rounded-2xl flex items-center justify-center gap-2.5 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 select-none relative overflow-hidden disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 group isolate active:scale-[0.98]";

  const variantStyles = {
    primary: "bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/20 border border-indigo-400/20 hover:from-indigo-400 hover:to-indigo-500 ring-1 ring-inset ring-white/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2)]",
    secondary: "bg-gradient-to-br from-white/15 to-white/5 dark:from-white/15 dark:to-white/5 text-slate-700 dark:text-slate-200 border border-slate-200/50 dark:border-white/10 backdrop-blur-md hover:from-white/20 hover:to-white/10 ring-1 ring-inset ring-white/10 dark:ring-white/5",
    danger: "bg-gradient-to-br from-rose-500/20 to-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 hover:from-rose-500/30 hover:to-rose-500/20 shadow-sm ring-1 ring-inset ring-rose-500/10",
    ghost: "bg-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5",
    icon: "p-3 rounded-2xl text-slate-500 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/5 border border-transparent transition-colors",
    success: "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/20 border border-emerald-400/20 hover:from-emerald-400 hover:to-emerald-500 ring-1 ring-inset ring-white/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2)]",
    outline: "bg-transparent text-indigo-600 dark:text-indigo-400 border-2 border-indigo-500/50 dark:border-indigo-400/50 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:border-indigo-600 dark:hover:border-indigo-400"
  };

  const sizes = {
    xs: "px-3 py-1.5 text-[9px] uppercase tracking-wider min-h-[32px]",
    sm: "px-4 py-2 text-[10px] uppercase tracking-widest min-h-[40px]",
    md: "px-6 py-3 text-xs uppercase tracking-wider min-h-[48px]",
    lg: "px-8 py-4 text-xs font-black uppercase tracking-widest min-h-[56px]",
    xl: "px-10 py-5 text-sm font-black tracking-widest min-h-[64px]"
  };

  const appliedSize = variant === 'icon' ? '' : sizes[size];
  const fullWidthClass = fullWidth ? 'w-full' : '';

  const ariaLabel = props['aria-label'] || props.title || (typeof children === 'string' ? children : 'button');

  return (
    <motion.button
      className={`${base} ${variantStyles[variant]} ${appliedSize} ${fullWidthClass} ${className}`}
      variants={buttonTap}
      initial="idle"
      whileTap="tap"
      whileHover="hover"
      onClick={handleClick}
      aria-label={ariaLabel}
      {...props as any}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 pointer-events-none z-0"
        initial={{ x: '-100%', skewX: -25 }}
        whileHover={{ x: '100%', transition: { duration: 0.6, ease: "easeInOut" } }}
      />

      <div className="relative z-10 flex items-center justify-center gap-2 max-w-full text-center">
        {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
        {children}
        {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
      </div>
    </motion.button>
  );
};
