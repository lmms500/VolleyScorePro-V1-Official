import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TeamId, GameState } from '@types';
import { getHexFromColor } from '@lib/utils/colors';
import { Trophy, Crown, Sparkles } from 'lucide-react';

interface MatchWinCelebrationProps {
  trigger: boolean;
  teamId: TeamId | null;
  state: GameState;
  onComplete?: () => void;
  onDismiss?: () => void;
  duration?: number;
}

const ConfettiPiece: React.FC<{ delay: number; color: string; left: string }> = ({ 
  delay, 
  color, 
  left 
}) => (
  <motion.div
    initial={{ y: -20, x: 0, rotate: 0, opacity: 1 }}
    animate={{ 
      y: '100vh', 
      x: [0, 50, -50, 30, -30, 0],
      rotate: [0, 180, 360, 540, 720],
      opacity: [1, 1, 1, 0.5, 0]
    }}
    transition={{ 
      delay, 
      duration: 3 + Math.random() * 2,
      ease: "easeOut"
    }}
    className="fixed top-0 w-3 h-3 pointer-events-none rounded-sm"
    style={{ left, backgroundColor: color }}
  />
);

export const MatchWinCelebration: React.FC<MatchWinCelebrationProps> = ({
  trigger,
  teamId,
  state,
  onComplete,
  onDismiss,
  duration = 5000,
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
  const setsLost = teamId === 'A' ? state.setsB : state.setsA;

  const confettiColors = [teamColor, '#fbbf24', '#f97316', '#06b6d4', '#a855f7'];

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 pointer-events-none flex items-center justify-center z-50 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black/90" />

          {[...Array(50)].map((_, i) => (
            <ConfettiPiece
              key={i}
              delay={0.1 + Math.random() * 0.5}
              color={confettiColors[i % confettiColors.length]}
              left={`${Math.random() * 100}%`}
            />
          ))}

          <motion.div
            initial={{ scale: 0.8, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: -30, opacity: 0 }}
            transition={{ type: "spring", stiffness: 150, damping: 20 }}
            className="relative flex flex-col items-center gap-8"
          >
            <motion.div
              initial={{ y: -100, scale: 0, rotate: -180 }}
              animate={{ y: 0, scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="relative"
            >
              <motion.div
                animate={{ 
                  rotate: [0, -5, 5, -5, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Trophy 
                  size={100} 
                  className="drop-shadow-2xl"
                  style={{ color: '#fbbf24', filter: 'drop-shadow(0 0 30px rgba(251, 191, 36, 0.5))' }}
                />
              </motion.div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="absolute -top-2 -right-2"
              >
                <Sparkles size={32} className="text-amber-400" />
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-center"
            >
              <div className="text-sm font-bold text-white/50 uppercase tracking-[0.3em] mb-2">
                VENCEDOR
              </div>
              <motion.div
                animate={{ 
                  textShadow: [
                    `0 0 20px ${teamColor}60`,
                    `0 0 40px ${teamColor}`,
                    `0 0 20px ${teamColor}60`
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-6xl font-black tracking-tight"
                style={{ color: teamColor }}
              >
                {teamName}
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
              className="flex items-center gap-6 bg-white/5 backdrop-blur-md rounded-2xl px-8 py-4 border border-white/10"
            >
              <div className="flex flex-col items-center">
                <span className="text-4xl font-black text-white">{setsWon}</span>
                <span className="text-xs font-bold text-white/40 uppercase">Sets</span>
              </div>
              <div className="w-px h-12 bg-white/20" />
              <div className="flex flex-col items-center">
                <span className="text-4xl font-black text-white/40">{setsLost}</span>
                <span className="text-xs font-bold text-white/40 uppercase">Sets</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="flex items-center gap-2 text-white/60"
            >
              <Crown size={16} className="text-amber-400" />
              <span className="text-sm font-medium uppercase tracking-wider">
                Partida Finalizada
              </span>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.5, 0] }}
            transition={{ delay: 0.3, duration: 1 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full pointer-events-none"
            style={{
              background: `radial-gradient(circle, ${teamColor}30, transparent 70%)`,
            }}
          />

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 text-xs font-medium text-white/40"
          >
            Pressione ESC para fechar
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
