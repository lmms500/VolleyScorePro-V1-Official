import React, { useCallback, useRef, useState } from 'react';
import { useMotionValue, animate, type MotionValue, type PanInfo } from 'framer-motion';

const PAGE_SNAP_TWEEN = {
    type: "tween" as const,
    duration: 0.25,
    ease: [0.25, 1, 0.5, 1] as const
};

const SWIPE_VELOCITY_THRESHOLD = 500; // px/s
const SWIPE_DISPLACEMENT_RATIO = 0.2; // 20% width
const SAFETY_UNLOCK_MS = 200;

interface UseHorizontalPagesOptions {
    totalPages: number;
    containerWidth: number;
}

interface UseHorizontalPagesReturn {
    pageIndex: number;
    goToPage: (index: number) => void;
    offsetX: MotionValue<number>;
    onDragEnd: (event: any, info: PanInfo) => void;
    dragConstraints: { left: number; right: number };
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
    const pageRef = useRef(0);
    const isAnimatingRef = useRef(false);

    const snapToPage = useCallback((index: number) => {
        if (containerWidth <= 0) return;

        const clamped = Math.max(0, Math.min(index, totalPages - 1));
        const targetX = -clamped * containerWidth;
        pageRef.current = clamped;
        setPageIndex(clamped);

        isAnimatingRef.current = true;
        animate(offsetX, targetX, {
            ...PAGE_SNAP_TWEEN,
            onComplete: () => {
                isAnimatingRef.current = false;
            }
        });
    }, [containerWidth, totalPages, offsetX]);

    // Recalculate position on resize
    React.useEffect(() => {
        if (containerWidth > 0 && !isAnimatingRef.current) {
            const targetX = -pageRef.current * containerWidth;
            offsetX.set(targetX);
        }
    }, [containerWidth, offsetX]);

    const goToPage = useCallback((index: number) => {
        snapToPage(index);
    }, [snapToPage]);

    const onDragEnd = useCallback((_event: any, info: PanInfo) => {
        if (containerWidth <= 0) return;

        const dragOffset = info.offset.x;
        const velocity = info.velocity.x;
        const currentPage = pageRef.current;

        // Determine direction based on velocity or displacement
        let targetPage = currentPage;

        const isFlick = Math.abs(velocity) > SWIPE_VELOCITY_THRESHOLD;
        const isBigDrag = Math.abs(dragOffset) > containerWidth * SWIPE_DISPLACEMENT_RATIO;

        if (isFlick) {
            // Flick logic: If flicking left (negative velocity) -> next page.
            targetPage = velocity < 0 ? currentPage + 1 : currentPage - 1;
        } else if (isBigDrag) {
            // Drag logic: If dragged left (negative offset) -> next page.
            targetPage = dragOffset < 0 ? currentPage + 1 : currentPage - 1;
        }

        snapToPage(targetPage);
    }, [containerWidth, snapToPage]);

    const lockSwipe = useCallback(() => {
        isLockedRef.current = true;
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

    const dragConstraints = React.useMemo(() => ({
        left: -((totalPages - 1) * containerWidth),
        right: 0
    }), [totalPages, containerWidth]);

    return {
        pageIndex,
        goToPage,
        offsetX,
        onDragEnd,
        dragConstraints,
        lockSwipe,
        unlockSwipe,
        isSwipeLocked: isLockedRef.current,
        totalPages
    };
}
