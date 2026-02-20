import { useState, useEffect, useCallback } from 'react';

export interface Position {
  x: number;
  y: number;
}

export interface OverlayPositions {
  teamStats: Position;
  topPlayer: Position;
  rotationA: Position;
  rotationB: Position;
}

const DEFAULT_POSITIONS: OverlayPositions = {
  teamStats: { x: 0, y: 0 },
  topPlayer: { x: 0, y: 0 },
  rotationA: { x: 0, y: 0 },
  rotationB: { x: 0, y: 0 },
};

const STORAGE_KEY = 'volleyscore_overlay_positions';

export function useDraggableOverlay() {
  const [positions, setPositions] = useState<OverlayPositions>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_POSITIONS, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.warn('[useDraggableOverlay] Failed to load positions:', e);
    }
    return DEFAULT_POSITIONS;
  });

  const [isEditMode, setIsEditMode] = useState(false);

  const updatePosition = useCallback((key: keyof OverlayPositions, position: Position) => {
    setPositions((prev) => {
      const updated = { ...prev, [key]: position };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('[useDraggableOverlay] Failed to save positions:', e);
      }
      return updated;
    });
  }, []);

  const resetPositions = useCallback(() => {
    setPositions(DEFAULT_POSITIONS);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn('[useDraggableOverlay] Failed to reset positions:', e);
    }
  }, []);

  const toggleEditMode = useCallback(() => {
    setIsEditMode((prev) => !prev);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'e') {
        toggleEditMode();
      } else if (e.key.toLowerCase() === 'r' && isEditMode) {
        resetPositions();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleEditMode, resetPositions, isEditMode]);

  return {
    positions,
    isEditMode,
    updatePosition,
    resetPositions,
    toggleEditMode,
  };
}
