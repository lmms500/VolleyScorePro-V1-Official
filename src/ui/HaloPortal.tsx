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
    const isAnimatingRef = useRef(false);

    const getLayoutPosition = useCallback(() => {
        const anchor = anchorRef.current;
        if (!anchor) return null;

        const anchorRect = anchor.getBoundingClientRect();
        const centerX = anchorRect.left + anchorRect.width / 2;
        const centerY = anchorRect.top + anchorRect.height / 2;

        return { x: centerX, y: centerY };
    }, [anchorRef]);

    /** Read position and update state only if it actually moved */
    const measure = useCallback(() => {
        const pos = getLayoutPosition();
        if (!pos) return false;

        const dx = Math.abs(pos.x - lastPosRef.current.x);
        const dy = Math.abs(pos.y - lastPosRef.current.y);

        // Increased threshold to reduce unnecessary state updates
        if (dx > 1 || dy > 1) {
            lastPosRef.current = pos;
            setPosition({ top: pos.y, left: pos.x });
            return true;
        }
        return false;
    }, [getLayoutPosition]);

    // Throttled RAF loop — only runs during active animations, not permanently
    useEffect(() => {
        const el = anchorRef.current;
        if (!el) return;

        // Initial measurement
        measure();

        // Throttled loop: only run at ~30fps to reduce CPU usage
        let lastFrameTime = 0;
        const FRAME_INTERVAL = 1000 / 30; // 30fps cap

        const loop = (timestamp: number) => {
            if (timestamp - lastFrameTime >= FRAME_INTERVAL) {
                const moved = measure();
                lastFrameTime = timestamp;

                // If nothing moved for this frame, slow down polling
                if (!moved && !isAnimatingRef.current) {
                    // Re-check after a longer delay when idle
                    rafRef.current = requestAnimationFrame((t) => {
                        rafRef.current = requestAnimationFrame(loop);
                    });
                    return;
                }
            }
            rafRef.current = requestAnimationFrame(loop);
        };
        rafRef.current = requestAnimationFrame(loop);

        const onResize = () => measure();
        window.addEventListener('resize', onResize);

        return () => {
            if (rafRef.current !== null) {
                cancelAnimationFrame(rafRef.current);
                rafRef.current = null;
            }
            window.removeEventListener('resize', onResize);
        };
    }, [anchorRef, measure]);

    // Track swap animations to enable high-frequency polling during transitions
    useEffect(() => {
        isAnimatingRef.current = true;
        const timer = setTimeout(() => {
            isAnimatingRef.current = false;
        }, 500); // Assume swap animation completes within 500ms
        return () => clearTimeout(timer);
    }, [swapTrigger]);

    if (!position) return null;

    return createPortal(
        <div
            className="fixed pointer-events-none z-0"
            style={{
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                overflow: 'visible',
                contain: 'strict',
            }}
        >
            <motion.div
                className="absolute"
                animate={{
                    top: position.top,
                    left: position.left
                }}
                transition={{ duration: 0.08, ease: "easeOut" }}
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
