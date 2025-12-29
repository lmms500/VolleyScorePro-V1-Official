
import { useEffect, useRef, useState } from 'react';
import { Capacitor } from '@capacitor/core';

interface PerformanceMonitorProps {
  onDowngrade: () => void;
  isEnabled: boolean;
}

export const usePerformanceMonitor = ({ onDowngrade, isEnabled }: PerformanceMonitorProps) => {
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  const dropCount = useRef(0);
  const [isMonitoring, setIsMonitoring] = useState(true);

  useEffect(() => {
    // Skip if disabled, native (native usually handles better, but can enable if needed), or arguably generic web
    // We prioritize checking mostly on Android Web/Native where GPU variety is huge.
    if (!isEnabled || !isMonitoring) return;

    const checkPerformance = () => {
      const now = performance.now();
      const delta = now - lastTime.current;
      
      frameCount.current++;

      if (delta >= 1000) {
        const fps = (frameCount.current / delta) * 1000;
        
        // Threshold: Consistent drops below 35 FPS
        if (fps < 35) {
          dropCount.current++;
        } else {
          dropCount.current = Math.max(0, dropCount.current - 1); // Recover heuristic
        }

        // If we have 3 consecutive bad seconds, trigger downgrade
        if (dropCount.current >= 3) {
          console.warn(`[PerfMonitor] Low FPS detected (${fps.toFixed(1)}). Triggering Graceful Degradation.`);
          onDowngrade();
          setIsMonitoring(false); // Stop monitoring after downgrade
        }

        frameCount.current = 0;
        lastTime.current = now;
      }

      if (isMonitoring) {
        requestAnimationFrame(checkPerformance);
      }
    };

    const rafId = requestAnimationFrame(checkPerformance);

    // Stop monitoring after 15 seconds to save battery
    const timeoutId = setTimeout(() => {
      setIsMonitoring(false);
    }, 15000);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timeoutId);
    };
  }, [isEnabled, isMonitoring, onDowngrade]);
};
