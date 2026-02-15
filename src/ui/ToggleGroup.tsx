import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useGameAudio } from '@features/game/hooks/useGameAudio';
import { useHaptics } from '@lib/haptics/useHaptics';
import { DEFAULT_CONFIG } from '@config/constants';

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
    const audioConfig = useMemo(() => ({ ...DEFAULT_CONFIG, enableSound: true }), []);
    const audio = useGameAudio(audioConfig);
    const haptics = useHaptics();

    const handleChange = (newValue: T) => {
        if (newValue !== value) {
            audio.playTap();
            haptics.impact('light');
            onChange(newValue);
        }
    };

    // Container classes por variante
    const containerClasses = {
        pills: "bg-slate-100 dark:bg-slate-800/50 rounded-xl p-1 flex gap-1",
        tabs: "border-b border-slate-200 dark:border-white/10 flex gap-4",
        chips: "flex gap-2 flex-wrap"
    };

    // Item base classes por variante
    const itemBaseClasses = {
        pills: "py-2 px-2 rounded-xl font-black uppercase tracking-wider transition-all text-slate-500 dark:text-slate-400",
        tabs: "py-2 px-4 font-bold uppercase tracking-wider transition-all relative text-slate-500 dark:text-slate-400",
        chips: "px-3 py-2 rounded-full font-bold uppercase tracking-wider border transition-all border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 bg-transparent"
    };

    // Item active classes por variante
    const itemActiveClasses = {
        pills: "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm",
        tabs: "text-indigo-600 dark:text-indigo-400 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-indigo-600 dark:after:bg-indigo-400",
        chips: "bg-indigo-600 dark:bg-indigo-500 text-white border-indigo-600 dark:border-indigo-500 shadow-md"
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
