import React from 'react';
import { X, ChevronLeft, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSafeAreaInsets } from '../../hooks/useSafeAreaInsets';
import { normalize } from '../../utils/responsive';
import { resolveTheme } from '../../utils/colors';

export interface ModalHeaderTab {
    id: string;
    label: string;
    icon?: React.ReactNode;
}

export interface ModalHeaderProps {
    title: string;
    subtitle?: string;
    onClose: () => void;
    variant?: 'standard' | 'large' | 'tabbed' | 'complex';

    // Feature props
    tabs?: ModalHeaderTab[];
    activeTab?: string;
    onTabChange?: (tabId: string) => void;

    // Search/Filter props for 'complex' variant
    searchProps?: {
        value: string;
        onChange: (value: string) => void;
        placeholder?: string;
    };
    bottomContent?: React.ReactNode;

    rightContent?: React.ReactNode;
    centerContent?: React.ReactNode;

    showDivider?: boolean;
    scrolled?: boolean;
    onBack?: () => void;

    className?: string;
}

export const ModalHeader: React.FC<ModalHeaderProps> = ({
    title,
    subtitle,
    onClose,
    variant = 'standard',
    tabs,
    activeTab,
    onTabChange,
    searchProps,
    bottomContent,
    rightContent,
    centerContent,
    showDivider = true,
    scrolled = false,
    onBack,
    className = ''
}) => {
    const { top } = useSafeAreaInsets();

    // Dynamic height calculation based on content
    // Base is usually around 56-60px + safe area
    // Tabbed/Complex adds more height

    return (
        <motion.header
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={`
                sticky top-0 z-50 w-full
                bg-slate-50/80 dark:bg-[#020617]/80
                backdrop-blur-3xl
                transition-all duration-300
                ${showDivider && !scrolled ? 'border-b border-black/5 dark:border-white/5' : ''}
                ${scrolled ? 'shadow-lg shadow-black/5 dark:shadow-black/20 border-b border-black/5 dark:border-white/5' : ''}
                ${className}
            `}
            style={{ paddingTop: `${top}px` }}
        >
            <div className="flex flex-col w-full">
                {/* TOP ROW: Title, Close, Actions */}
                <div className={`flex items-center justify-between px-4 w-full ${variant === 'tabbed' ? 'pb-2' : 'h-14'}`}>

                    {/* LEFT SECTION */}
                    <div className="flex items-center gap-2">
                        {onBack && (
                            <button
                                onClick={onBack}
                                className="
                                    p-2 -ml-2 rounded-full
                                    text-slate-500 dark:text-slate-400
                                    hover:bg-black/5 dark:hover:bg-white/10
                                    active:scale-95 transition-all
                                "
                            >
                                <ChevronLeft size={24} />
                            </button>
                        )}

                        {variant !== 'standard' ? (
                            <div className="flex flex-col">
                                <h2 className="text-lg font-bold text-slate-800 dark:text-white leading-tight">
                                    {title}
                                </h2>
                                {subtitle && (
                                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                        {subtitle}
                                    </p>
                                )}
                            </div>
                        ) : (
                            // Close button on left for standard variant if no back button? 
                            // Standard usually has close on right, empty left or back.
                            // Let's keep close on right for all.
                            <div />
                        )}
                    </div>

                    {/* CENTER SECTION (Standard Only usually) */}
                    {variant === 'standard' && (
                        <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center text-center max-w-[60%]">
                            {centerContent ? centerContent : (
                                <>
                                    <h2 className="text-sm font-bold uppercase tracking-widest text-slate-800 dark:text-white truncate w-full">
                                        {title}
                                    </h2>
                                    {subtitle && (
                                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                                            {subtitle}
                                        </span>
                                    )}
                                </>
                            )}
                        </div>
                    )}

                    {/* RIGHT SECTION */}
                    <div className="flex items-center gap-2">
                        {rightContent}
                        <button
                            onClick={onClose}
                            className={`
                                p-2 rounded-full
                                text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-white
                                hover:bg-black/5 dark:hover:bg-white/10 
                                active:bg-black/10 dark:active:bg-white/20
                                transition-all active:scale-95
                                ${variant === 'standard' ? '-mr-2' : ''}
                            `}
                            aria-label="Close"
                        >
                            <X size={22} strokeWidth={2} />
                        </button>
                    </div>
                </div>

                {/* MIDDLE ROW: Search (Complex Variant) */}
                {variant === 'complex' && searchProps && (
                    <div className="px-4 pb-3">
                        <div className="relative group">
                            <div className="absolute inset-0 bg-slate-200/50 dark:bg-white/5 rounded-xl transition-all group-focus-within:bg-white dark:group-focus-within:bg-white/10 group-focus-within:ring-2 group-focus-within:ring-indigo-500/20" />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                value={searchProps.value}
                                onChange={(e) => searchProps.onChange(e.target.value)}
                                placeholder={searchProps.placeholder || "Search..."}
                                className="
                                    relative w-full bg-transparent border-none 
                                    pl-10 pr-4 py-2.5 
                                    text-sm font-medium text-slate-800 dark:text-white 
                                    placeholder:text-slate-400 
                                    focus:outline-none
                                "
                            />
                        </div>
                    </div>
                )}

                {/* BOTTOM ROW: Tabs or Custom Content */}
                {(variant === 'tabbed' && tabs) && (
                    <div className="px-4 pb-3">
                        <div className="flex p-1 bg-slate-200/50 dark:bg-black/20 rounded-xl">
                            {tabs.map((tab) => {
                                const isActive = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => onTabChange?.(tab.id)}
                                        className={`
                                            flex-1 flex items-center justify-center gap-2 
                                            py-2 px-3 rounded-lg text-xs font-bold uppercase tracking-wider
                                            transition-all duration-200
                                            ${isActive
                                                ? 'bg-white dark:bg-white/10 text-slate-800 dark:text-white shadow-sm'
                                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                                            }
                                        `}
                                    >
                                        {tab.icon}
                                        <span>{tab.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {(variant === 'complex' || bottomContent) && bottomContent && (
                    <div className="px-4 pb-3">
                        {bottomContent}
                    </div>
                )}
            </div>
        </motion.header>
    );
};
