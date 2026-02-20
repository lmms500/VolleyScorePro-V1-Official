import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameState, TeamId } from '@types';
import { getHexFromColor } from '@lib/utils/colors';
import { getTopScorer, PlayerStatsResult } from '../../utils/statsCalculator';
import { Crown, Zap, Shield, Target } from 'lucide-react';

interface TopPlayerOverlayProps {
  show: boolean;
  state: GameState;
  position?: 'left' | 'right';
}

export const TopPlayerOverlay: React.FC<TopPlayerOverlayProps> = ({
  show,
  state,
  position = 'right',
}) => {
  const topScorer = getTopScorer(
    state.matchLog,
    state.teamARoster,
    state.teamBRoster
  );

  if (!topScorer || !show) return null;

  const teamColor = topScorer.teamId === 'A'
    ? getHexFromColor(state.teamARoster.color || 'indigo')
    : getHexFromColor(state.teamBRoster.color || 'rose');

  const teamName = topScorer.teamId === 'A' ? state.teamAName : state.teamBName;

  const positionClasses = position === 'left' 
    ? 'left-8 bottom-48' 
    : 'right-8 bottom-48';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: position === 'left' ? -50 : 50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: position === 'left' ? -50 : 50, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={`fixed ${positionClasses} pointer-events-none z-40`}
      >
        <div className="bg-black/80 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl overflow-hidden min-w-[180px]">
          <div 
            className="px-3 py-1.5 flex items-center gap-2"
            style={{ backgroundColor: `${teamColor}cc` }}
          >
            <Crown size={12} className="text-amber-300" />
            <span className="text-[10px] font-black text-white uppercase tracking-widest">
              Destaque
            </span>
          </div>

          <div className="p-3">
            <div className="flex items-center gap-3">
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center text-xl font-black text-white"
                style={{ 
                  backgroundColor: `${teamColor}40`,
                  border: `2px solid ${teamColor}`
                }}
              >
                {topScorer.playerNumber || '#'}
              </div>
              
              <div className="flex flex-col">
                <span className="text-sm font-black text-white uppercase tracking-tight truncate max-w-[100px]">
                  {topScorer.playerName}
                </span>
                <span className="text-[10px] font-medium text-white/50 uppercase">
                  {teamName}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/10">
              <div className="text-center">
                <span className="text-2xl font-black" style={{ color: teamColor }}>
                  {topScorer.totalPoints}
                </span>
                <span className="text-[10px] font-bold text-white/40 uppercase block">
                  Pontos
                </span>
              </div>

              <div className="flex gap-2">
                {topScorer.attacks > 0 && (
                  <div className="flex items-center gap-1">
                    <Zap size={10} className="text-orange-400" />
                    <span className="text-xs font-bold text-white/70">{topScorer.attacks}</span>
                  </div>
                )}
                {topScorer.blocks > 0 && (
                  <div className="flex items-center gap-1">
                    <Shield size={10} className="text-purple-400" />
                    <span className="text-xs font-bold text-white/70">{topScorer.blocks}</span>
                  </div>
                )}
                {topScorer.aces > 0 && (
                  <div className="flex items-center gap-1">
                    <Target size={10} className="text-cyan-400" />
                    <span className="text-xs font-bold text-white/70">{topScorer.aces}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
