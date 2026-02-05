import React from 'react';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSafeAreaInsets } from '../../hooks/useSafeAreaInsets';

export interface ModalHeaderProps {
    title: string;
    subtitle?: string;
    onClose: () => void;
    rightContent?: React.ReactNode;
    centerContent?: React.ReactNode;
    showDivider?: boolean;
    scrolled?: boolean;  // Usado para adicionar shadow quando modal scrollou
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

    return (
        <motion.header
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={`
        sticky top-0 z-50 w-full
        bg-slate-900/95 dark:bg-slate-950/95
        backdrop-blur-xl
        transition-all duration-300
        ${scrolled ? 'shadow-lg shadow-black/20' : ''}
        ${showDivider ? 'border-b border-white/5' : ''}
      `}
            style={{ paddingTop: `${top + 8}px` }}
        >
            <div className="flex items-center justify-between px-4 pb-3">
                {/* Left: Close Button */}
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

                {/* Center: Title or Custom Content */}
                {centerContent ? (
                    <div className="flex-1 flex justify-center">{centerContent}</div>
                ) : (
                    <div className="flex-1 flex flex-col items-center text-center px-4">
                        <h2 className="text-base font-bold text-white tracking-tight">
                            {title}
                        </h2>
                        {subtitle && (
                            <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
                        )}
                    </div>
                )}

                {/* Right: Custom Actions */}
                <div className="w-9">
                    {rightContent}
                </div>
            </div>
        </motion.header>
    );
};
