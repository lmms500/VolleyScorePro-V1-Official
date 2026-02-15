import React, { useEffect, useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { HaloBackground, HaloBackgroundProps } from './HaloBackground';

interface HaloPortalProps extends HaloBackgroundProps {
    anchorRef: React.RefObject<HTMLElement>;
    swapTrigger?: boolean;
    layoutContainerRef?: React.RefObject<HTMLElement>;
}

export const HaloPortal: React.FC<HaloPortalProps> = ({ anchorRef, swapTrigger, layoutContainerRef, ...props }) => {
    const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
    const lastPosRef = useRef({ x: 0, y: 0 });
    const rafRef = useRef<number | null>(null);
    const rafStopRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    /** 
     * Calculates position based on layout offsets relative to a container, 
     * bypassing transform animations on the anchor itself.
     */
    const getLayoutPosition = useCallback(() => {
        const anchor = anchorRef.current;
        const container = layoutContainerRef?.current;

        if (!anchor || !container) return null;

        // 1. Get container's global position (including Swipe transform, but stable during Swap)
        const containerRect = container.getBoundingClientRect();

        // 2. Sum offsets from anchor up to container
        let x = 0;
        let y = 0;
        let curr = anchor as HTMLElement | null;

        // Safety break counter
        let depth = 0;
        while (curr && curr !== container && depth < 50) {
            x += curr.offsetLeft;
            y += curr.offsetTop;
            curr = curr.offsetParent as HTMLElement;
            depth++;
        }

        // If we didn't find the container in offsetParent chain, fallback to getBoundingClientRect
        if (curr !== container) return null;

        // 3. Add anchor center
        const centerX = containerRect.left + x + anchor.offsetWidth / 2;
        const centerY = containerRect.top + y + anchor.offsetHeight / 2;

        return { x: centerX, y: centerY };
    }, [anchorRef, layoutContainerRef]);

    /** Read position and update state only if it actually moved */
    const measure = useCallback(() => {
        // Try layout position first if container ref is provided (SYNC FIX)
        if (layoutContainerRef?.current) {
            const layoutPos = getLayoutPosition();
            if (layoutPos) {
                const dx = Math.abs(layoutPos.x - lastPosRef.current.x);
                const dy = Math.abs(layoutPos.y - lastPosRef.current.y);

                if (dx > 0.5 || dy > 0.5) {
                    lastPosRef.current = layoutPos;
                    setPosition({ top: layoutPos.y, left: layoutPos.x });
                    return true;
                }
                return false;
            }
        }

        // Fallback to visual position (getBoundingClientRect)
        const el = anchorRef.current;
        if (!el) return false;
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = Math.abs(cx - lastPosRef.current.x);
        const dy = Math.abs(cy - lastPosRef.current.y);

        if (dx > 0.5 || dy > 0.5) {
            lastPosRef.current = { x: cx, y: cy };
            setPosition({ top: cy, left: cx });
            return true; // moved
        }
        return false;
    }, [anchorRef, layoutContainerRef, getLayoutPosition]);

    /** Start (or restart) RAF tracking for smooth animation following (auto-stops after 1.5s) */
    const startSmooth = useCallback(() => {
        // Always restart fresh — the old early-return guard caused the halo to
        // keep reading stale positions when a new swap/score trigger arrived
        // while a previous RAF loop was still winding down.
        if (rafRef.current !== null) {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
        }

        const loop = () => {
            measure();
            rafRef.current = requestAnimationFrame(loop);
        };
        rafRef.current = requestAnimationFrame(loop);

        // Auto-stop after 1.5s (swap animation is ~800ms)
        if (rafStopRef.current) clearTimeout(rafStopRef.current);
        rafStopRef.current = setTimeout(() => {
            if (rafRef.current !== null) {
                cancelAnimationFrame(rafRef.current);
                rafRef.current = null;
            }
        }, 1500);
    }, [measure]);

    useEffect(() => {
        const el = anchorRef.current;
        if (!el) return;

        // Initial measurement
        measure();

        // Trigger smooth tracking on swap OR score change (which might shift layout)
        if (swapTrigger !== undefined || props.score !== undefined) {
            startSmooth();
        }

        // REMOVED: Low-frequency polling (was causing 5 getBoundingClientRect/s per card)
        // Now relying exclusively on ResizeObserver + window resize events

        // ResizeObserver for size changes
        const ro = new ResizeObserver(() => {
            measure();
            startSmooth();
        });
        ro.observe(el);

        // Window resize/orientation
        const onResize = () => {
            measure();
            startSmooth();
        };
        window.addEventListener('resize', onResize);

        return () => {
            if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
            if (rafStopRef.current) clearTimeout(rafStopRef.current);
            ro.disconnect();
            window.removeEventListener('resize', onResize);
        };
    }, [anchorRef, measure, startSmooth, swapTrigger, props.score]);

    if (!position) return null;

    return createPortal(
        <div
            className="fixed pointer-events-none z-0"
            style={{
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                overflow: 'visible'
            }}
        >
            <motion.div
                className="absolute"
                animate={{
                    top: position.top,
                    left: position.left
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                style={{
                    transform: 'translate(-50%, -50%)',
                    width: 0,
                    height: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <HaloBackground {...props} />
            </motion.div>
        </div>,
        document.body
    );
};
