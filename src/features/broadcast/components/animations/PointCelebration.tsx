import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TeamId } from '@types';
import { getHexFromColor } from '@lib/utils/colors';
import { GameState } from '@types';

interface PointCelebrationProps {
  trigger: boolean;
  teamId: TeamId | null;
  state: GameState;
  onComplete?: () => void;
  duration?: number;
}

export const PointCelebration: React.FC<PointCelebrationProps> = ({
  trigger,
  teamId,
  state,
  onComplete,
  duration = 600,
}) => {
  const [show, setShow] = useState(false);
  const prevTrigger = React.useRef(trigger);

  useEffect(() => {
    if (trigger && !prevTrigger.current && teamId) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        onComplete?.();
      }, duration);
      prevTrigger.current = true;
      return () => clearTimeout(timer);
    }
    if (!trigger) {
      prevTrigger.current = false;
    }
  }, [trigger, teamId, duration, onComplete]);

  if (!teamId) return null;

  const teamColor = teamId === 'A' 
    ? getHexFromColor(state.teamARoster.color || 'indigo')
    : getHexFromColor(state.teamBRoster.color || 'rose');

  return (
    <AnimatePresence>
      {show && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 pointer-events-none z-30"
            style={{
              background: `radial-gradient(ellipse at 50% 30%, ${teamColor}50, transparent 50%)`,
            }}
          />

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1.5, opacity: [0, 0.6, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: duration / 1000, ease: "easeOut" }}
            className="fixed top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full pointer-events-none z-30"
            style={{
              background: `radial-gradient(ellipse, ${teamColor}40, transparent 70%)`,
              filter: 'blur(20px)',
            }}
          />

          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.2, 1], opacity: [0, 0.3, 0] }}
            transition={{ duration: duration / 1000, ease: "easeOut" }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full pointer-events-none z-30"
            style={{
              background: `radial-gradient(circle, ${teamColor}60, transparent 70%)`,
            }}
          />
        </>
      )}
    </AnimatePresence>
  );
};
