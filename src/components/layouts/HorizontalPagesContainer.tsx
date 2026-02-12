import React, { useRef } from 'react';
import { motion, type MotionValue, type PanInfo } from 'framer-motion';
import { useElementSize } from '../../hooks/useElementSize';

interface HorizontalPagesContainerProps {
    children: React.ReactNode[];
    offsetX: MotionValue<number>;
    onPanStart: () => void;
    onPan: (event: any, info: PanInfo) => void;
    onPanEnd: (event: any, info: PanInfo) => void;
    className?: string;
    onWidthChange?: (width: number) => void;
}

export const HorizontalPagesContainer: React.FC<HorizontalPagesContainerProps> = ({
    children,
    offsetX,
    onPanStart,
    onPan,
    onPanEnd,
    className = '',
    onWidthChange
}) => {
    const { ref, width } = useElementSize();
    const lastWidthRef = useRef(0);

    // Notify parent of width changes
    if (width > 0 && width !== lastWidthRef.current) {
        lastWidthRef.current = width;
        onWidthChange?.(width);
    }

    return (
        <div
            ref={ref}
            className={`flex-1 overflow-hidden relative min-h-0 ${className}`}
        >
            <motion.div
                className="flex h-full"
                style={{ x: offsetX }}
                onPanStart={onPanStart}
                onPan={onPan}
                onPanEnd={onPanEnd}
            >
                {children.map((child, i) => (
                    <div
                        key={i}
                        className="h-full shrink-0"
                        style={{ width: width > 0 ? width : '100%', minWidth: width > 0 ? width : '100%' }}
                    >
                        {child}
                    </div>
                ))}
            </motion.div>
        </div>
    );
};
