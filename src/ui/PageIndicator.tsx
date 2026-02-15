import React, { memo } from 'react';
import { motion } from 'framer-motion';

interface PageIndicatorProps {
    totalPages: number;
    currentPage: number;
    onPageTap: (index: number) => void;
}

export const PageIndicator: React.FC<PageIndicatorProps> = memo(({
    totalPages,
    currentPage,
    onPageTap
}) => {
    return (
        <div className="flex items-center justify-center gap-2 py-1.5 shrink-0">
            {Array.from({ length: totalPages }).map((_, i) => (
                <button
                    key={i}
                    onClick={() => onPageTap(i)}
                    className="relative p-1 touch-manipulation"
                    aria-label={`Page ${i + 1}`}
                >
                    <motion.div
                        className="rounded-full"
                        animate={{
                            width: currentPage === i ? 24 : 8,
                            height: 8,
                            backgroundColor: currentPage === i
                                ? 'rgba(255, 255, 255, 0.6)'
                                : 'rgba(255, 255, 255, 0.2)',
                        }}
                        transition={{
                            type: 'spring',
                            stiffness: 400,
                            damping: 30,
                        }}
                    />
                </button>
            ))}
        </div>
    );
});
