import React, { useEffect, useState, useRef } from 'react';
import { X, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSafeAreaInsets } from '@lib/platform/useSafeAreaInsets';

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
            initial={false}
            animate={{
                y: isVisible ? 0 : -100,
            }}
            transition={{ 
                type: "tween", 
                duration: 0.25, 
                ease: [0.25, 1, 0.5, 1] 
            }}
            className={`
                sticky top-0 z-50 w-full
                bg-transparent
                ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}
                transition-opacity duration-200
                ${className}
            `}
            style={{ 
                paddingTop: `${top}px`,
                transform: 'translateZ(0)',
                willChange: 'transform'
            }}
        >
            <div className="flex flex-col w-full">
                {/* PRIMARY ROW */}
                <div className="flex items-center justify-between px-2 pt-2 pb-2 min-h-[56px] gap-2">

                    {/* LEFT SECTION */}
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                        {leftAction ? leftAction : (
                            <div className="flex items-center gap-2">
                                {onBack && (
                                    <button onClick={onBack} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/50 dark:bg-white/5 hover:bg-white/70 dark:hover:bg-white/10 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-all active:scale-90 border border-white/50 dark:border-white/10 ring-1 ring-inset ring-white/10 dark:ring-white/5 shadow-sm">
                                        <ChevronLeft size={20} strokeWidth={2.5} />
                                    </button>
                                )}
                                <div className="flex flex-col min-w-0">
                                    <h2 className="text-sm font-black text-slate-800 dark:text-white leading-tight truncate uppercase tracking-[0.2em]">
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
                            className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 active:scale-95 transition-all shadow-xl shadow-red-500/30 group/close"
                        >
                            <X size={18} strokeWidth={3} className="group-hover/close:rotate-90 transition-transform duration-300" />
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
