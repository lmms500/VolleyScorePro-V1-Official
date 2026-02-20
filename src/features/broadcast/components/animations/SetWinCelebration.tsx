import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TeamId, GameState, SetHistory } from '@types';
import { getHexFromColor } from '@lib/utils/colors';

interface SetWinCelebrationProps {
  trigger: boolean;
  teamId: TeamId | null;
  state: GameState;
  setNumber: number;
  setScoreA?: number;
  setScoreB?: number;
  onComplete?: () => void;
  duration?: number;
  onDismiss?: () => void;
}

export const SetWinCelebration: React.FC<SetWinCelebrationProps> = ({
  trigger,
  teamId,
  state,
  setNumber,
  setScoreA,
  setScoreB,
  onComplete,
  duration = 5000,
  onDismiss,
}) => {
  const [show, setShow] = useState(false);
  const dismissed = React.useRef(false);

  const handleDismiss = useCallback(() => {
    if (show && !dismissed.current) {
      dismissed.current = true;
      setShow(false);
      onDismiss?.();
      onComplete?.();
    }
  }, [show, onDismiss, onComplete]);

  useEffect(() => {
    if (trigger && teamId) {
      setShow(true);
      dismissed.current = false;

      const timer = setTimeout(() => {
        handleDismiss();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [trigger, teamId, duration, handleDismiss]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && show) {
        handleDismiss();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [show, handleDismiss]);

  if (!teamId) return null;

  const teamColor = teamId === 'A' 
    ? getHexFromColor(state.teamARoster.color || 'indigo')
    : getHexFromColor(state.teamBRoster.color || 'rose');
  
  const teamName = teamId === 'A' ? state.teamAName : state.teamBName;
  const setsWon = teamId === 'A' ? state.setsA : state.setsB;
  const opponentSetsWon = teamId === 'A' ? state.setsB : state.setsA;

  const finalScoreA = setScoreA ?? state.scoreA;
  const finalScoreB = setScoreB ?? state.scoreB;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 pointer-events-none flex items-center justify-center z-50"
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          <motion.div
            initial={{ scale: 0.8, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: -30, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="relative flex flex-col items-center gap-6"
          >
            <motion.div
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 300 }}
              className="text-6xl font-black text-white tracking-tighter"
              style={{ textShadow: '0 0 40px rgba(255,255,255,0.3)' }}
            >
              SET {setNumber}
            </motion.div>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 400, damping: 15 }}
              className="flex items-center gap-4"
            >
              <motion.div
                animate={{ 
                  boxShadow: [`0 0 20px ${teamColor}60`, `0 0 40px ${teamColor}`, `0 0 20px ${teamColor}60`]
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-4xl font-black text-white px-8 py-3 rounded-xl"
                style={{ backgroundColor: `${teamColor}cc` }}
              >
                {teamName}
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-8 bg-white/5 backdrop-blur-sm rounded-2xl px-8 py-4 border border-white/10"
            >
              <div className="flex flex-col items-center">
                <span className="text-5xl font-black text-white">{finalScoreA}</span>
                <span className="text-sm font-bold text-white/50 mt-1 truncate max-w-[120px]">
                  {state.teamAName}
                </span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-px h-12 bg-white/20" />
              </div>
              <div className="flex flex-col items-center">
                <span className="text-5xl font-black text-white">{finalScoreB}</span>
                <span className="text-sm font-bold text-white/50 mt-1 truncate max-w-[120px]">
                  {state.teamBName}
                </span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex items-center gap-3"
            >
              <span className="text-xl font-bold text-white/60">SETS</span>
              <div className="flex gap-2">
                {[...Array(Math.ceil(state.config.maxSets / 2))].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5 + i * 0.08, type: "spring" }}
                    className={`w-4 h-4 rounded-full ${
                      i < setsWon 
                        ? 'shadow-[0_0_12px_currentColor]' 
                        : i < (setsWon + opponentSetsWon)
                        ? 'bg-white/30'
                        : 'bg-white/10'
                    }`}
                    style={{ 
                      backgroundColor: i < setsWon ? teamColor : undefined,
                    }}
                  />
                ))}
              </div>
              <span className="text-2xl font-black" style={{ color: teamColor }}>
                {setsWon} - {opponentSetsWon}
              </span>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ delay: 0.2, duration: 0.6, ease: "easeInOut" }}
            className="absolute top-1/2 left-0 h-1 w-full"
            style={{ background: `linear-gradient(90deg, transparent, ${teamColor}, transparent)` }}
          />

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 text-xs font-medium text-white/40"
          >
            Pressione ESC para continuar
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
