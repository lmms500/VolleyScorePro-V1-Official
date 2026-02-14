import React, { useCallback, useEffect } from 'react';
import { motion, type MotionValue, type PanInfo } from 'framer-motion';
import { useElementSize } from '../../hooks/useElementSize';

interface HorizontalPagesContainerProps {
    children: React.ReactNode[];
    offsetX: MotionValue<number>;
    onDragEnd: (event: any, info: PanInfo) => void;
    dragConstraints: { left: number; right: number };
    isSwipeLocked: boolean;
    className?: string;
    onWidthChange?: (width: number) => void;
}

export const HorizontalPagesContainer: React.FC<HorizontalPagesContainerProps> = ({
    children,
    offsetX,
    onDragEnd,
    dragConstraints,
    isSwipeLocked,
    className = '',
    onWidthChange
}) => {
    const { ref, width: rawWidth } = useElementSize();
    // Arredonda para evitar variações de sub-pixel do ResizeObserver
    // que causariam resets espúrios do offsetX durante o pan
    const width = Math.round(rawWidth);
    const [isInternalDrag, setIsInternalDrag] = React.useState(false);

    // Notify parent of width changes
    useEffect(() => {
        if (width > 0) {
            onWidthChange?.(width);
        }
    }, [width, onWidthChange]);

    // Captura pointerdown antes de qualquer handler para detectar elementos draggable (dnd-kit).
    // Se o toque iniciou em um player token, bloqueia o pan para não interferir com o drag-and-drop.
    const handlePointerDownCapture = useCallback((e: React.PointerEvent) => {
        const target = e.target as HTMLElement;
        const isDraggable = !!target.closest?.('[data-draggable]');

        if (isDraggable) {
            setIsInternalDrag(true);
        }
    }, []);

    // Reset quando o pointer sobe ou cancela
    const handlePointerUpCapture = useCallback(() => {
        setIsInternalDrag(false);
    }, []);

    return (
        <div
            ref={ref}
            className={`flex-1 overflow-hidden relative min-h-0 ${className}`}
            onPointerDownCapture={handlePointerDownCapture}
            onPointerUpCapture={handlePointerUpCapture}
            onPointerCancelCapture={handlePointerUpCapture}
        >
            <motion.div
                className="flex h-full"
                style={{ x: offsetX }}
                drag={isSwipeLocked || isInternalDrag ? false : "x"}
                dragConstraints={dragConstraints}
                dragElastic={0.2}
                dragMomentum={false} // Disable momentum so we control the snap manually
                onDragEnd={onDragEnd}
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
