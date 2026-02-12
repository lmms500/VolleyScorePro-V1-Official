import { useCallback, useRef, useState } from 'react';
import { useMotionValue, animate, type MotionValue, type PanInfo } from 'framer-motion';

const PAGE_SNAP_SPRING = {
    type: "spring" as const,
    stiffness: 200,
    damping: 28,
    mass: 1.0
};

const SWIPE_VELOCITY_THRESHOLD = 500; // px/s
const SWIPE_DISPLACEMENT_RATIO = 0.2; // 20% da largura do container
const SAFETY_UNLOCK_MS = 3000;

function rubberBand(value: number, min: number, max: number): number {
    if (value > max) {
        const over = value - max;
        return max + over * 0.3;
    }
    if (value < min) {
        const over = min - value;
        return min - over * 0.3;
    }
    return value;
}

interface UseHorizontalPagesOptions {
    totalPages: number;
    containerWidth: number;
}

interface UseHorizontalPagesReturn {
    pageIndex: number;
    goToPage: (index: number) => void;
    offsetX: MotionValue<number>;
    handlePanStart: () => void;
    handlePan: (event: any, info: PanInfo) => void;
    handlePanEnd: (event: any, info: PanInfo) => void;
    lockSwipe: () => void;
    unlockSwipe: () => void;
    isSwipeLocked: boolean;
    totalPages: number;
}

export function useHorizontalPages({
    totalPages,
    containerWidth
}: UseHorizontalPagesOptions): UseHorizontalPagesReturn {
    const [pageIndex, setPageIndex] = useState(0);
    const offsetX = useMotionValue(0);
    const isLockedRef = useRef(false);
    const safetyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const baseXRef = useRef(0);
    const pageRef = useRef(0);

    const snapToPage = useCallback((index: number) => {
        if (containerWidth <= 0) return; // Prevent animation with invalid width
        const clamped = Math.max(0, Math.min(index, totalPages - 1));
        const targetX = -clamped * containerWidth;
        pageRef.current = clamped;
        setPageIndex(clamped);
        animate(offsetX, targetX, PAGE_SNAP_SPRING);
    }, [containerWidth, totalPages, offsetX]);

    const goToPage = useCallback((index: number) => {
        snapToPage(index);
    }, [snapToPage]);

    const handlePanStart = useCallback(() => {
        if (isLockedRef.current) return;
        baseXRef.current = offsetX.get();
    }, [offsetX]);

    const handlePan = useCallback((_event: any, info: PanInfo) => {
        if (isLockedRef.current || containerWidth <= 0) return;

        // Requer dominância horizontal
        if (Math.abs(info.offset.x) < Math.abs(info.offset.y) * 1.2) return;

        const proposedX = baseXRef.current + info.offset.x;
        const minX = -(totalPages - 1) * containerWidth;
        const clampedX = rubberBand(proposedX, minX, 0);
        offsetX.set(clampedX);
    }, [containerWidth, totalPages, offsetX]);

    const handlePanEnd = useCallback((_event: any, info: PanInfo) => {
        if (isLockedRef.current || containerWidth <= 0) return;

        const currentPage = pageRef.current;
        const displacement = info.offset.x;
        const velocity = info.velocity.x;

        let targetPage = currentPage;

        if (
            Math.abs(velocity) > SWIPE_VELOCITY_THRESHOLD ||
            Math.abs(displacement) > containerWidth * SWIPE_DISPLACEMENT_RATIO
        ) {
            if (displacement < 0 || velocity < -SWIPE_VELOCITY_THRESHOLD) {
                targetPage = currentPage + 1;
            } else if (displacement > 0 || velocity > SWIPE_VELOCITY_THRESHOLD) {
                targetPage = currentPage - 1;
            }
        }

        snapToPage(targetPage);
    }, [containerWidth, snapToPage]);

    const lockSwipe = useCallback(() => {
        isLockedRef.current = true;

        // Safety timeout para evitar estado travado
        if (safetyTimerRef.current) clearTimeout(safetyTimerRef.current);
        safetyTimerRef.current = setTimeout(() => {
            isLockedRef.current = false;
        }, SAFETY_UNLOCK_MS);
    }, []);

    const unlockSwipe = useCallback(() => {
        isLockedRef.current = false;
        if (safetyTimerRef.current) {
            clearTimeout(safetyTimerRef.current);
            safetyTimerRef.current = null;
        }
    }, []);

    return {
        pageIndex,
        goToPage,
        offsetX,
        handlePanStart,
        handlePan,
        handlePanEnd,
        lockSwipe,
        unlockSwipe,
        isSwipeLocked: isLockedRef.current,
        totalPages
    };
}
