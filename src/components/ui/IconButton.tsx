import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { buttonTap } from '../../utils/animations';
import { useGameAudio } from '../../hooks/useGameAudio';
import { useHaptics } from '../../hooks/useHaptics';
import { DEFAULT_CONFIG } from '../../constants';

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
  const audioConfig = useMemo(() => ({ ...DEFAULT_CONFIG, enableSound: true }), []);
  const audio = useGameAudio(audioConfig);
  const haptics = useHaptics();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    audio.playTap();
    haptics.impact(hapticStyle);
    if (onClick) onClick(e);
  };

  // Base classes (comuns a todos)
  const base = "flex items-center justify-center transition-all duration-200 active:scale-95 backdrop-blur-md disabled:opacity-40 disabled:cursor-not-allowed outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 select-none";

  // Variantes
  const variants = {
    default: "bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:bg-white/70 dark:hover:bg-white/10 hover:text-slate-700 dark:hover:text-slate-200 shadow-sm",
    ghost: "bg-transparent text-slate-500 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/5 hover:text-slate-700 dark:hover:text-slate-200",
    filled: "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 shadow-sm shadow-indigo-500/10",
    danger: "bg-rose-50 dark:bg-rose-500/10 text-rose-500 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 hover:bg-rose-100 dark:hover:bg-rose-500/20 shadow-sm shadow-rose-500/10",
    success: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 shadow-sm shadow-emerald-500/10"
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
