import React from 'react';
import { motion } from 'framer-motion';
import { buttonTap } from '@lib/utils/animations';
import { audioService } from '@lib/audio/AudioService';
import { useHaptics } from '@lib/haptics/useHaptics';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  variant?: 'default' | 'ghost' | 'filled' | 'danger' | 'success';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  isActive?: boolean;
  activeClassName?: string;
  hapticStyle?: 'light' | 'medium' | 'heavy';
  'aria-label': string; // Obrigatório para acessibilidade
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  variant = 'default',
  size = 'md',
  isActive = false,
  activeClassName = '',
  className = '',
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

  // Base classes (comuns a todos)
  const base = "flex items-center justify-center transition-all duration-200 active:scale-95 backdrop-blur-md disabled:opacity-40 disabled:cursor-not-allowed outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 select-none";

  // Variantes
  const variants = {
    default: "bg-white/50 dark:bg-white/5 border border-white/50 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:bg-white/70 dark:hover:bg-white/10 hover:text-slate-700 dark:hover:text-slate-200 shadow-sm ring-1 ring-inset ring-white/10 dark:ring-white/5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15)] hover:shadow-md",
    ghost: "bg-transparent text-slate-500 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/5 hover:text-slate-700 dark:hover:text-slate-200",
    filled: "bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/30 ring-1 ring-inset ring-white/10 border border-indigo-400/20 hover:from-indigo-400 hover:to-indigo-500 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2)]",
    danger: "bg-gradient-to-br from-rose-500 to-rose-600 text-white shadow-lg shadow-rose-500/30 ring-1 ring-inset ring-white/10 border border-rose-400/20 hover:from-rose-400 hover:to-rose-500 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2)]",
    success: "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/30 ring-1 ring-inset ring-white/10 border border-emerald-400/20 hover:from-emerald-400 hover:to-emerald-500 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2)]"
  };

  // Tamanhos
  const sizes = {
    xs: "w-7 h-7 text-sm rounded-lg",
    sm: "w-8 h-8 text-base rounded-xl",
    md: "w-10 h-10 text-lg rounded-xl",
    lg: "w-12 h-12 text-xl rounded-2xl"
  };

  // Active state override
  const activeClass = isActive && activeClassName ? activeClassName : '';

  return (
    <motion.button
      className={`${base} ${variants[variant]} ${sizes[size]} ${activeClass} ${className}`}
      variants={buttonTap}
      initial="idle"
      whileTap="tap"
      whileHover="hover"
      onClick={handleClick}
      {...props as any}
    >
      {icon}
    </motion.button>
  );
};
