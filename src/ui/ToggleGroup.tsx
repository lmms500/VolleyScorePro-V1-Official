import React from 'react';
import { motion } from 'framer-motion';
import { audioService } from '@lib/audio/AudioService';
import { useHaptics } from '@lib/haptics/useHaptics';

interface ToggleOption<T extends string> {
    value: T;
    label: string;
    icon?: React.ReactNode;
}

interface ToggleGroupProps<T extends string> {
    options: ToggleOption<T>[];
    value: T;
    onChange: (value: T) => void;
    variant?: 'pills' | 'tabs' | 'chips';
    size?: 'sm' | 'md';
    fullWidth?: boolean;
    className?: string;
}

export function ToggleGroup<T extends string>({
    options,
    value,
    onChange,
    variant = 'pills',
    size = 'md',
    fullWidth = false,
    className = ''
}: ToggleGroupProps<T>) {
    audioService.init();
    const haptics = useHaptics();

    const handleChange = (newValue: T) => {
        if (newValue !== value) {
            audioService.playTap();
            haptics.impact('light');
            onChange(newValue);
        }
    };

    // Container classes por variante - Premium glass surfaces
    const containerClasses = {
        pills: "bg-white/40 dark:bg-white/5 backdrop-blur-xl rounded-2xl p-1.5 flex gap-1 border border-white/50 dark:border-white/5 ring-1 ring-inset ring-white/10 dark:ring-white/5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15)] shadow-sm",
        tabs: "border-b border-white/20 dark:border-white/5 flex gap-4",
        chips: "flex gap-2 flex-wrap"
    };

    // Item base classes por variante
    const itemBaseClasses = {
        pills: "py-2 px-3 rounded-xl font-black uppercase tracking-wider transition-all text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200",
        tabs: "py-2 px-4 font-bold uppercase tracking-wider transition-all relative text-slate-500 dark:text-slate-400",
        chips: "px-3 py-2 rounded-full font-bold uppercase tracking-wider border transition-all border-white/30 dark:border-white/10 text-slate-600 dark:text-slate-400 bg-white/30 dark:bg-white/5 backdrop-blur-md hover:bg-white/50 dark:hover:bg-white/10"
    };

    // Item active classes por variante - Premium gradient active states
    const itemActiveClasses = {
        pills: "bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/30 ring-1 ring-inset ring-white/10",
        tabs: "text-indigo-600 dark:text-indigo-400 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-gradient-to-r after:from-indigo-500 after:to-purple-500 dark:after:from-indigo-400 dark:after:to-purple-400",
        chips: "bg-gradient-to-br from-indigo-500 to-indigo-600 text-white border-indigo-400/20 shadow-lg shadow-indigo-500/30 ring-1 ring-inset ring-white/10"
    };

    // Size classes
    const sizeClasses = {
        sm: "text-[9px] min-h-[32px]",
        md: "text-[10px] min-h-[36px]"
    };

    const fullWidthClass = fullWidth ? 'w-full' : '';
    const itemFlexClass = fullWidth && variant === 'pills' ? 'flex-1' : '';

    return (
        <div className={`${containerClasses[variant]} ${fullWidthClass} ${className}`}>
            {options.map((option) => {
                const isActive = option.value === value;

                return (
                    <motion.button
                        key={option.value}
                        onClick={() => handleChange(option.value)}
                        className={`
              ${itemBaseClasses[variant]}
              ${isActive ? itemActiveClasses[variant] : ''}
              ${sizeClasses[size]}
              ${itemFlexClass}
              flex items-center justify-center gap-1.5
            `}
                        whileTap={{ scale: 0.97 }}
                        type="button"
                        aria-pressed={isActive}
                    >
                        {option.icon && <span className="flex-shrink-0">{option.icon}</span>}
                        {option.label}
                    </motion.button>
                );
            })}
        </div>
    );
}
