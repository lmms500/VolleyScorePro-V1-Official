import React, { useEffect, useState, useRef } from 'react';
import { X, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSafeAreaInsets } from '../../hooks/useSafeAreaInsets';

export interface ModalHeaderProps {
    title: string;
    subtitle?: string;
    onClose: () => void;
    behavior?: 'fixed' | 'sticky' | 'scroll-aware';
    scrollContainerRef?: React.RefObject<HTMLElement>;

    // Slots
    leftAction?: React.ReactNode;
    centerContent?: React.ReactNode;
    rightAction?: React.ReactNode;
    bottomContent?: React.ReactNode;

    // Legacy/Convenience props
    onBack?: () => void;
    showDivider?: boolean;
    className?: string;
}

export const ModalHeader: React.FC<ModalHeaderProps> = ({
    title,
    subtitle,
    onClose,
    behavior = 'fixed',
    scrollContainerRef,
    leftAction,
    centerContent,
    rightAction,
    bottomContent,
    onBack,
    showDivider = true,
    className = ''
}) => {
    const { top } = useSafeAreaInsets();
    const [isVisible, setIsVisible] = useState(true);
    const lastScrollY = useRef(0);

    // Scroll Aware Logic
    useEffect(() => {
        if (behavior !== 'scroll-aware' || !scrollContainerRef?.current) return;

        const handleScroll = () => {
            const currentY = scrollContainerRef.current?.scrollTop || 0;
            const diff = currentY - lastScrollY.current;

            // Bounce protection
            if (currentY < 0) return;

            if (diff > 10 && currentY > 50 && isVisible) {
                setIsVisible(false);
            } else if (diff < -5 && !isVisible) {
                setIsVisible(true);
            }
            lastScrollY.current = currentY;
        };

        const el = scrollContainerRef.current;
        el.addEventListener('scroll', handleScroll, { passive: true });
        return () => el.removeEventListener('scroll', handleScroll);
    }, [behavior, scrollContainerRef, isVisible]);

    return (
        <motion.header
            initial={{ y: 0 }}
            animate={{
                y: isVisible ? 0 : -100,
                opacity: isVisible ? 1 : 0
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`
                sticky top-0 z-50 w-full
                bg-slate-50/70 dark:bg-[#020617]/70
                backdrop-blur-xl
                transition-all duration-300
                ${showDivider ? 'border-b border-black/5 dark:border-white/5' : ''}
                ${className}
            `}
            style={{ paddingTop: `${top}px` }}
        >
            <div className="flex flex-col w-full">
                {/* PRIMARY ROW */}
                <div className="flex items-center justify-between px-2 pt-2 pb-2 min-h-[56px] gap-2">

                    {/* LEFT SECTION */}
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                        {leftAction ? leftAction : (
                            <div className="flex items-center gap-2">
                                {onBack && (
                                    <button onClick={onBack} className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors active:scale-90">
                                        <ChevronLeft size={20} strokeWidth={2.5} />
                                    </button>
                                )}
                                <div className="flex flex-col min-w-0">
                                    <h2 className="text-sm font-bold text-slate-800 dark:text-white leading-tight truncate uppercase tracking-wider">
                                        {title}
                                    </h2>
                                    {subtitle && (
                                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 truncate uppercase tracking-wide">
                                            {subtitle}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* CENTER SECTION */}
                    {centerContent && (
                        <div className="flex-shrink-0">
                            {centerContent}
                        </div>
                    )}

                    {/* RIGHT SECTION */}
                    <div className="flex items-center gap-2 flex-1 justify-end min-w-0">
                        {rightAction}
                        <button
                            onClick={onClose}
                            className="w-10 h-10 flex items-center justify-center bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors active:scale-90 border border-black/5 dark:border-white/5"
                        >
                            <X size={20} strokeWidth={2.5} />
                        </button>
                    </div>
                </div>

                {/* BOTTOM ROW (Tabs, Search, etc) */}
                {bottomContent && (
                    <div className="px-2 pb-2">
                        {bottomContent}
                    </div>
                )}
            </div>
        </motion.header>
    );
};
