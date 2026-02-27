import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';

type LayoutMode = 'normal' | 'compact' | 'ultra';

export interface ColliderRect {
  id: string;
  rect: DOMRect;
}

interface LayoutState {
  mode: LayoutMode;
  scale: number;
  safeAreaTop: number;
  safeAreaBottom: number;
  isLandscape: boolean;
  scoreCenterOffset: number;
}

interface LayoutContextType extends LayoutState {
  registerElement: (id: string, width: number, height: number) => void;
  registerCollider: (id: string, element: HTMLElement | null) => void;
  getColliders: () => ColliderRect[];
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export const LayoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [measurements, setMeasurements] = useState<Record<string, { w: number; h: number }>>({});
  const [windowSize, setWindowSize] = useState({ w: window.innerWidth, h: window.innerHeight });
  // Store colliders in a ref — mutations don't trigger re-renders
  const collidersRef = useRef<ColliderRect[]>([]);

  // Update window size on resize
  useEffect(() => {
    const handleResize = () => {
        setWindowSize({ w: window.innerWidth, h: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const registerElement = useCallback((id: string, width: number, height: number) => {
    setMeasurements(prev => {
      if (prev[id]?.w === width && prev[id]?.h === height) return prev;
      return { ...prev, [id]: { w: width, h: height } };
    });
  }, []);

  const registerCollider = useCallback((id: string, element: HTMLElement | null) => {
      if (!element) {
          collidersRef.current = collidersRef.current.filter(c => c.id !== id);
          return;
      }

      const rect = element.getBoundingClientRect();
      const idx = collidersRef.current.findIndex(c => c.id === id);
      if (idx !== -1) {
          collidersRef.current[idx] = { id, rect };
      } else {
          collidersRef.current = [...collidersRef.current, { id, rect }];
      }
  }, []);

  const getColliders = useCallback(() => collidersRef.current, []);

  const layoutState = useMemo((): LayoutState => {
    const { w: winW, h: winH } = windowSize;
    const isLandscape = winW > winH;

    const safeTop = isLandscape ? 20 : 40;
    const safeBottom = isLandscape ? 20 : 40;

    const topBarH = measurements['topbar']?.h || 60;
    const controlsH = measurements['controls']?.h || 80;
    const nameH = Math.max(measurements['nameA']?.h || 0, measurements['nameB']?.h || 0);
    const scoreH = Math.max(measurements['scoreA']?.h || 0, measurements['scoreB']?.h || 0);

    const centerToTop = winH / 2;
    const centerToBottom = winH / 2;

    const requiredTop = (scoreH / 2) + nameH + topBarH + (isLandscape ? 20 : 40);
    const requiredBottom = (scoreH / 2) + controlsH + (isLandscape ? 20 : 40);

    let mode: LayoutMode = 'normal';
    let scale = 1;

    if (requiredTop > centerToTop || requiredBottom > centerToBottom) {
        mode = 'compact';
        const compactFactor = 0.85;
        if ((requiredTop * compactFactor) > centerToTop || (requiredBottom * compactFactor) > centerToBottom) {
             mode = 'ultra';
             const overflowRatioTop = centerToTop / (requiredTop * 0.75);
             const overflowRatioBottom = centerToBottom / (requiredBottom * 0.75);
             const worstCase = Math.min(overflowRatioTop, overflowRatioBottom);
             if (worstCase < 1) {
                 scale = Math.max(0.6, worstCase - 0.05);
             }
        }
    }

    return {
        mode,
        scale,
        safeAreaTop: safeTop,
        safeAreaBottom: safeBottom,
        isLandscape,
        scoreCenterOffset: 0,
    };

  }, [measurements, windowSize]);

  const value = useMemo(() => ({
    ...layoutState,
    registerElement,
    registerCollider,
    getColliders,
  }), [layoutState, registerElement, registerCollider, getColliders]);

  return (
    <LayoutContext.Provider value={value}>
      {children}
    </LayoutContext.Provider>
  );
};

export const useLayoutManager = () => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayoutManager must be used within LayoutProvider');
  }
  return context;
};
