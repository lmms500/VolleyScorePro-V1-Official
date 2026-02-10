import React from 'react';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSafeAreaInsets } from '../../hooks/useSafeAreaInsets';

import { normalize } from '../../utils/responsive';

export interface ModalHeaderProps {
    title: string;
    subtitle?: string;
    onClose: () => void;
    rightContent?: React.ReactNode;
    centerContent?: React.ReactNode;
    showDivider?: boolean;
    scrolled?: boolean;
}

export const ModalHeader: React.FC<ModalHeaderProps> = ({
    title,
    subtitle,
    onClose,
    rightContent,
    centerContent,
    showDivider = true,
    scrolled = false,
}) => {
    const { top } = useSafeAreaInsets();

    // Altura base do conteúdo (excluindo notch)
    const CONTENT_HEIGHT = normalize(56);

    return (
        <motion.header
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={`
                sticky top-0 z-50 w-full
                bg-slate-50/80 dark:bg-[#020617]/80
                backdrop-blur-3xl
                shadow-sm
                transition-all duration-300
                ${showDivider ? 'border-b border-white/20 dark:border-white/10' : ''}
                ${scrolled ? 'shadow-lg shadow-black/20' : ''}
            `}
            // O Header cresce para acomodar o notch
            style={{
                paddingTop: `${top}px`,
                height: `${top + CONTENT_HEIGHT}px`
            }}
        >
            <div
                className="flex items-center justify-between px-4 w-full h-full"
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="
                        p-2 -ml-2
                        text-slate-400 hover:text-white
                        hover:bg-white/5 active:bg-white/10
                        rounded-full transition-all
                        active:scale-95
                    "
                    aria-label="Fechar"
                >
                    <X size={20} strokeWidth={2.5} />
                </button>

                {/* Title Area */}
                <div className="flex-1 flex justify-center mx-2 overflow-hidden">
                    {centerContent ? centerContent : (
                        <div className="flex flex-col items-center text-center truncate">
                            <h2 className="text-base font-semibold text-white tracking-wide truncate w-full">
                                {title}
                            </h2>
                            {subtitle && (
                                <p className="text-xs text-slate-400 mt-0.5 truncate w-full">
                                    {subtitle}
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* Right Actions */}
                <div className="w-9 flex justify-end">
                    {rightContent}
                </div>
            </div>
        </motion.header>
    );
};
