
import React, { useRef } from 'react';

interface UseScoreGesturesProps {
  onAdd: () => void;
  onSubtract: () => void;
  isLocked: boolean;
  onInteractionStart?: (e: React.PointerEvent) => void;
  onInteractionEnd?: () => void;
}

// Constants for gesture detection - Tuned for single-handed mobile use
// Increased threshold to 35px to prevent accidental swipes when tapping vigorously
const SWIPE_THRESHOLD = 35; 
const TAP_MAX_DURATION_MS = 600; // Slightly tighter tap window
const TAP_MAX_MOVE = 15; // Reduced move tolerance for taps to distinguish from drags

export const useScoreGestures = ({ 
  onAdd, 
  onSubtract,
  isLocked, 
  onInteractionStart, 
  onInteractionEnd,
}: UseScoreGesturesProps) => {
  
  const startX = useRef<number | null>(null);
  const startY = useRef<number | null>(null);
  const startTime = useRef<number | null>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (isLocked) return;
    if (!e.isPrimary) return;
    
    // Pass event so parent can track coordinates
    if (onInteractionStart) onInteractionStart(e);
    
    startX.current = e.clientX;
    startY.current = e.clientY;
    startTime.current = Date.now();
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (onInteractionEnd) onInteractionEnd();
    if (!e.isPrimary) return;
    if (startX.current === null || startY.current === null || startTime.current === null) return;
    
    const endX = e.clientX;
    const endY = e.clientY;
    const deltaTime = Date.now() - startTime.current;
    
    const deltaX = endX - startX.current;
    const deltaY = endY - startY.current; 
    
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    // TAP LOGIC
    if (deltaTime < TAP_MAX_DURATION_MS && absDeltaX < TAP_MAX_MOVE && absDeltaY < TAP_MAX_MOVE) {
      if (e.cancelable) e.preventDefault(); 
      onAdd();
    } 
    // SWIPE LOGIC
    else if (absDeltaY > SWIPE_THRESHOLD && absDeltaY > (absDeltaX * 1.5)) {
        // Vertical swipe dominance check (must be mostly vertical)
        if (e.cancelable) e.preventDefault();
        
        if (deltaY < 0) {
            // Swipe UP -> Treat as Add (Natural scrolling direction) or ignore? 
            // V1 logic: Up was Add. Keeping consistent.
            onAdd(); 
        } else {
            // Swipe DOWN -> Subtract
            onSubtract(); 
        }
    }
    
    startX.current = null;
    startY.current = null;
    startTime.current = null;
  };

  const handlePointerCancel = (e: React.PointerEvent) => {
    if (onInteractionEnd) onInteractionEnd();
    startX.current = null;
    startY.current = null;
    startTime.current = null;
  };

  const handleClick = (e: React.MouseEvent) => {
      e.stopPropagation();
  };

  return {
    onPointerDown: handlePointerDown,
    onPointerUp: handlePointerUp,
    onPointerCancel: handlePointerCancel,
    onClick: handleClick
  };
};
