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

    /** 
     * Calculates position using getBoundingClientRect which includes all CSS transforms.
     * This ensures Halo follows the anchor correctly during horizontal swipe animations.
     */
    const getLayoutPosition = useCallback(() => {
        const anchor = anchorRef.current;

        if (!anchor) return null;

        // getBoundingClientRect returns the visual position including all transforms
        // (like translateX from horizontal page swipe)
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

        // Lower threshold for smoother tracking
        if (dx > 0.1 || dy > 0.1) {
            lastPosRef.current = pos;
            setPosition({ top: pos.y, left: pos.x });
            return true;
        }
        return false;
    }, [getLayoutPosition]);

    // Continuous RAF loop - always running while mounted
    // This ensures Halo follows anchor during any animation (swipe, swap, etc.)
    useEffect(() => {
        const el = anchorRef.current;
        if (!el) return;

        // Initial measurement
        measure();

        // Continuous RAF loop for tracking position during animations
        const loop = () => {
            measure();
            rafRef.current = requestAnimationFrame(loop);
        };
        rafRef.current = requestAnimationFrame(loop);

        // Window resize/orientation
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
