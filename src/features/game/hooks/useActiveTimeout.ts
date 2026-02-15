
import { useState, useEffect, useRef, useCallback } from 'react';
import { TeamId } from '@types';

export const useActiveTimeout = () => {
  const [activeTeam, setActiveTeam] = useState<TeamId | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startTimeout = useCallback((teamId: TeamId, duration: number = 30) => {
    setActiveTeam(teamId);
    setSecondsLeft(duration);
    setIsMinimized(false);
    
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setActiveTeam(null); // Auto-close
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const stopTimeout = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setActiveTeam(null);
    setSecondsLeft(0);
    setIsMinimized(false);
  }, []);

  const minimize = useCallback(() => {
    if (activeTeam) setIsMinimized(true);
  }, [activeTeam]);

  const maximize = useCallback(() => {
    if (activeTeam) setIsMinimized(false);
  }, [activeTeam]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return {
    activeTeam,
    secondsLeft,
    isMinimized,
    startTimeout,
    stopTimeout,
    minimize,
    maximize
  };
};
