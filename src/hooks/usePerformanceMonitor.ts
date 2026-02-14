
import { useEffect, useRef, useState } from 'react';

interface PerformanceMonitorProps {
  onDowngrade: () => void;
  isEnabled: boolean;
}

export const usePerformanceMonitor = ({ onDowngrade, isEnabled }: PerformanceMonitorProps) => {
  const dropCount = useRef(0);
  const [isMonitoring, setIsMonitoring] = useState(true);

  useEffect(() => {
    if (!isEnabled || !isMonitoring) return;

    let observer: PerformanceObserver | null = null;
    let active = false;

    // Grace period: ignore the first 3s of startup where long tasks are expected
    const startDelay = setTimeout(() => {
      active = true;
      dropCount.current = 0;
    }, 3000);

    try {
      observer = new PerformanceObserver((list) => {
        if (!active) return;

        for (const entry of list.getEntries()) {
          // Only count truly severe jank (>150ms)
          if (entry.duration > 150) {
            dropCount.current += 2;
          } else if (entry.duration > 80) {
            dropCount.current += 1;
          }
        }

        if (dropCount.current >= 15) {
          console.warn(`[PerfMonitor] Excessive long tasks detected. Triggering Graceful Degradation.`);
          onDowngrade();
          setIsMonitoring(false);
        }
      });
      observer.observe({ entryTypes: ['longtask'] });
    } catch {
      setIsMonitoring(false);
      return;
    }

    // Stop monitoring after 15 seconds (3s grace + 12s active)
    const timeoutId = setTimeout(() => {
      setIsMonitoring(false);
    }, 15000);

    return () => {
      observer?.disconnect();
      clearTimeout(startDelay);
      clearTimeout(timeoutId);
    };
  }, [isEnabled, isMonitoring, onDowngrade]);
};
