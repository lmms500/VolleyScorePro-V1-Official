
import React, { useRef } from 'react';

interface UseScoreGesturesProps {
  onAdd: () => void;
  onSubtract: () => void;
  isLocked: boolean;
  onInteractionStart?: (e: React.PointerEvent) => void;
  onInteractionEnd?: () => void;
}

/**
 * VolleyScore Pro - High-Performance Gesture Engine v2.5 (High-Refresh Edition)
 */
const SWIPE_THRESHOLD = 38; // Reduzido para maior agilidade em telas 120Hz
const TAP_MAX_DURATION_MS = 350; // Janela menor para prevenir atraso no feedback visual
const TAP_MAX_MOVE = 8; // Menor tolerância para evitar confundir micro-swipes com taps

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
  const lastInteractionTime = useRef<number>(0);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (isLocked) return;
    if (!e.isPrimary) return;
    
    // Cooldown de 100ms para evitar bounce mecânico de dedos rápidos
    const now = Date.now();
    if (now - lastInteractionTime.current < 100) return;

    if (onInteractionStart) onInteractionStart(e);
    
    startX.current = e.clientX;
    startY.current = e.clientY;
    startTime.current = now;
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

    // Prioridade para o feedback visual imediato
    lastInteractionTime.current = Date.now();

    // LÓGICA DE TAP (Curto e parado)
    if (deltaTime < TAP_MAX_DURATION_MS && absDeltaX < TAP_MAX_MOVE && absDeltaY < TAP_MAX_MOVE) {
      onAdd();
    } 
    // LÓGICA DE SWIPE VERTICAL (Dominância)
    else if (absDeltaY > SWIPE_THRESHOLD && absDeltaY > absDeltaX) {
        if (deltaY < 0) onAdd(); 
        else onSubtract(); 
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

  return {
    onPointerDown: handlePointerDown,
    onPointerUp: handlePointerUp,
    onPointerCancel: handlePointerCancel
  };
};
