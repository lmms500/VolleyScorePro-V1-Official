import React, { useEffect, useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { HaloBackground, HaloBackgroundProps } from './HaloBackground';

interface HaloPortalProps extends HaloBackgroundProps {
    anchorRef: React.RefObject<HTMLElement>;
}

export const HaloPortal: React.FC<HaloPortalProps> = ({ anchorRef, ...props }) => {
    const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
    const lastPosRef = useRef({ x: 0, y: 0 });
    const rafRef = useRef<number | null>(null);
    const rafStopRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    /** Read position and update state only if it actually moved */
    const measure = useCallback(() => {
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
    }, [anchorRef]);

    /** Start RAF tracking for smooth animation following (auto-stops after 1.5s) */
    const startSmooth = useCallback(() => {
        if (rafRef.current !== null) return; // already running

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

        // Low-frequency poll (5x/s) detects movement from swaps, layout shifts, etc.
        // Cost: one getBoundingClientRect per 200ms = negligible
        const pollId = setInterval(() => {
            const moved = measure();
            if (moved) {
                // Movement detected — switch to RAF for smooth tracking
                startSmooth();
            }
        }, 200);

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
            clearInterval(pollId);
            if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
            if (rafStopRef.current) clearTimeout(rafStopRef.current);
            ro.disconnect();
            window.removeEventListener('resize', onResize);
        };
    }, [anchorRef, measure, startSmooth]);

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
            <div
                className="absolute"
                style={{
                    top: position.top,
                    left: position.left,
                    transform: 'translate(-50%, -50%)',
                    width: 0,
                    height: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <HaloBackground {...props} />
            </div>
        </div>,
        document.body
    );
};
