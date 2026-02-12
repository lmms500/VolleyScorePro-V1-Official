import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { HaloBackground, HaloBackgroundProps } from './HaloBackground';

interface HaloPortalProps extends HaloBackgroundProps {
    anchorRef: React.RefObject<HTMLElement>;
}

export const HaloPortal: React.FC<HaloPortalProps> = ({ anchorRef, ...props }) => {
    const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
    const frameRef = useRef<number | null>(null);

    useEffect(() => {
        const updatePosition = () => {
            if (anchorRef.current) {
                const rect = anchorRef.current.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;

                setPosition({ top: centerY, left: centerX });
            }
            frameRef.current = requestAnimationFrame(updatePosition);
        };

        // Inicia o loop de atualização
        frameRef.current = requestAnimationFrame(updatePosition);

        return () => {
            if (frameRef.current) cancelAnimationFrame(frameRef.current);
        };
    }, [anchorRef]);

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
