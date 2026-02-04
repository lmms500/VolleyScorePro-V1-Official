
import React, { createContext, useContext, useState, useRef, useEffect, useCallback, useMemo } from 'react';

// --- Split Context Architecture ---

// 1. Controls Context (Stable)
// Components using this will NOT re-render every second.
interface TimerControls {
  isRunning: boolean;
  start: () => void;
  stop: () => void;
  reset: () => void;
  setSeconds: (s: number) => void;
  getTime: () => number; // Non-reactive getter
}

// 2. Value Context (Volatile)
// Components using this WILL re-render every second.
interface TimerValue {
  seconds: number;
}

const TimerControlsContext = createContext<TimerControls | undefined>(undefined);
const TimerValueContext = createContext<TimerValue | undefined>(undefined);

export const TimerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [seconds, setSecondsState] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<any>(null);
  const secondsRef = useRef(0);

  // Sync ref with state for non-reactive access
  useEffect(() => {
    secondsRef.current = seconds;
  }, [seconds]);

  const tick = useCallback(() => {
    setSecondsState(prev => prev + 1);
  }, []);

  const start = useCallback(() => {
    if (intervalRef.current) return;
    setIsRunning(true);
    intervalRef.current = setInterval(tick, 1000);
  }, [tick]);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    stop();
    setSecondsState(0);
    secondsRef.current = 0;
  }, [stop]);

  const setSeconds = useCallback((s: number) => {
    setSecondsState(s);
    secondsRef.current = s;
  }, []);

  const getTime = useCallback(() => secondsRef.current, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Optimization: Memoize controls to ensure stability
  const controls = useMemo(() => ({
    isRunning,
    start,
    stop,
    reset,
    setSeconds,
    getTime
  }), [isRunning, start, stop, reset, setSeconds, getTime]);

  // Value object changes every second
  const values = useMemo(() => ({ seconds }), [seconds]);

  return (
    <TimerControlsContext.Provider value={controls}>
      <TimerValueContext.Provider value={values}>
        {children}
      </TimerValueContext.Provider>
    </TimerControlsContext.Provider>
  );
};

// --- HOOKS ---

/**
 * Use this for Start/Stop buttons or logic.
 * Will NOT re-render on every tick.
 */
export const useTimerControls = () => {
  const context = useContext(TimerControlsContext);
  if (!context) throw new Error('useTimerControls must be used within a TimerProvider');
  return context;
};

/**
 * Use this ONLY for displaying the time (e.g. 12:00).
 * Will re-render every second.
 */
export const useTimerValue = () => {
  const context = useContext(TimerValueContext);
  if (!context) throw new Error('useTimerValue must be used within a TimerProvider');
  return context;
};

/**
 * @deprecated Use useTimerControls or useTimerValue for better performance.
 * Legacy wrapper for backward compatibility.
 */
export const useTimer = () => {
  const controls = useTimerControls();
  const value = useTimerValue();
  return { ...controls, ...value };
};
