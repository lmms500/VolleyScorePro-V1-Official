
import React, { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, useAnimation, PanInfo, useMotionValue } from 'framer-motion';
import { TeamColor } from '@types';
import { resolveTheme } from '@lib/utils/colors';

interface FloatingTimeoutProps {
  secondsLeft: number;
  color: TeamColor;
  onMaximize: () => void;
}

const BUBBLE_SIZE = 72; // Slightly smaller for better mobile fit
const MARGIN = 16; // Safe margin from edges

export const FloatingTimeout: React.FC<FloatingTimeoutProps> = ({ secondsLeft, color, onMaximize }) => {
  const theme = resolveTheme(color);
  const controls = useAnimation();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  // Ref to track if we are dragging or tapping
  const isDragging = useRef(false);
  const hasMoved = useRef(false);

  // Default position (bottom rightish)
  useEffect(() => {
      // Initial positioning animation to enter smoothly
      const startX = window.innerWidth - BUBBLE_SIZE - MARGIN;
      const startY = window.innerHeight - 150; // Above bottom nav
      x.set(startX);
      y.set(startY);
      controls.start({ scale: 1, opacity: 1 });
  }, []);

  // Handle Resize / Orientation Change
  useEffect(() => {
      const handleResize = () => {
          const screenW = window.innerWidth;
          const screenH = window.innerHeight;
          
          // Get current motion values
          const currentX = x.get();
          const currentY = y.get();

          // Define Safe Zones
          const topLimit = 60; // Below header
          const bottomLimit = screenH - BUBBLE_SIZE - 40; // Above footer
          
          // 1. Clamp Y to be visible
          let newY = Math.min(Math.max(currentY, topLimit), bottomLimit);
          
          // 2. Snap X to nearest edge (Magnetic)
          // We calculate distance to left vs right edge
          const distLeft = currentX;
          const distRight = screenW - (currentX + BUBBLE_SIZE);
          
          let newX = MARGIN;
          if (distRight < distLeft) {
              newX = screenW - BUBBLE_SIZE - MARGIN;
          } else {
              newX = MARGIN;
          }

          // Apply immediate correction
          controls.start({ 
              x: newX, 
              y: newY,
              transition: { type: "spring", stiffness: 400, damping: 25 }
          });
      };

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
  }, [controls, x, y]);

  // Circle Progress Math
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (secondsLeft / 30) * circumference;

  // Reset flags on interaction start
  const handlePointerDown = () => {
      isDragging.current = false;
      hasMoved.current = false;
  };

  const handleDragStart = () => {
      isDragging.current = true;
  };

  const handleDrag = (_: any, info: PanInfo) => {
      // Only consider it a "move" if we exceeded a tiny threshold
      // to avoid jittery clicks being interpreted as drags
      if (Math.abs(info.offset.x) > 2 || Math.abs(info.offset.y) > 2) {
          hasMoved.current = true;
      }
  };

  const handleDragEnd = (event: any, info: PanInfo) => {
      // Calculate boundaries
      const screenW = window.innerWidth;
      const screenH = window.innerHeight;
      
      // Determine target X (Snap to side)
      // We look at the CENTER of the bubble for snapping logic
      const currentAbsX = x.get(); // Motion value contains current transform X
      const centerX = currentAbsX + (BUBBLE_SIZE / 2);
      
      let targetX = MARGIN;
      if (centerX > screenW / 2) {
          targetX = screenW - BUBBLE_SIZE - MARGIN;
      }

      // Determine target Y (Clamp to vertical safe area)
      const topLimit = 60; // Below header
      const bottomLimit = screenH - BUBBLE_SIZE - 40; // Above footer
      const currentY = y.get();
      
      const targetY = Math.min(Math.max(currentY, topLimit), bottomLimit);
      
      controls.start({
          x: targetX,
          y: targetY,
          transition: { type: "spring", stiffness: 400, damping: 25 }
      });
  };

  const handleClick = (e: React.MouseEvent) => {
      // Logic: If we haven't moved significantly, it's a click.
      if (!hasMoved.current) {
          onMaximize();
      }
  };

  return createPortal(
    <>
        <motion.div
            drag
            dragMomentum={false} // Disable momentum to have full control over snap
            dragElastic={0.1} // Resistance feeling
            initial={{ scale: 0, opacity: 0 }}
            animate={controls}
            
            // Event Handlers
            onPointerDown={handlePointerDown}
            onDragStart={handleDragStart}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
            onClick={handleClick}
            
            className={`
                fixed top-0 left-0 z-[9999]
                rounded-full 
                bg-slate-900/90 backdrop-blur-xl 
                border-2 ${theme.border}
                shadow-2xl shadow-black/50
                flex items-center justify-center
                cursor-grab active:cursor-grabbing touch-none
                group
            `}
            // Explicit dimensions and motion values binding
            style={{ 
                width: BUBBLE_SIZE, 
                height: BUBBLE_SIZE,
                x, y, // Motion values
                touchAction: 'none'
            }}
        >
            {/* SVG Timer Ring */}
            <svg className="absolute inset-0 w-full h-full -rotate-90 p-1 pointer-events-none">
                <circle
                    cx="50%" cy="50%" r={radius}
                    stroke="currentColor" strokeWidth="3"
                    fill="transparent"
                    className="text-white/10"
                />
                <motion.circle
                    cx="50%" cy="50%" r={radius}
                    stroke="currentColor" strokeWidth="3"
                    fill="transparent"
                    className={theme.text}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1, ease: "linear" }}
                />
            </svg>

            <div className="flex flex-col items-center justify-center relative z-10 pointer-events-none select-none">
                <span className={`text-xl font-black tabular-nums leading-none ${theme.text}`}>
                    {secondsLeft}
                </span>
            </div>
        </motion.div>
    </>,
    document.body
  );
};
