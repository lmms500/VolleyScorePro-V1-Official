import React from 'react';
import { motion } from 'framer-motion';
import { Player, TeamId, GameState } from '@types';
import { getHexFromColor } from '@lib/utils/colors';
import { LowerThird, LowerThirdHeader, LowerThirdBody } from './LowerThird';
import { PlayerStatsResult } from '../../utils/statsCalculator';
import { Zap, Shield, Target } from 'lucide-react';

interface PointScorerGraphicProps {
  show: boolean;
  player: Player;
  teamId: TeamId;
  state: GameState;
  stats?: PlayerStatsResult;
  skill?: 'attack' | 'block' | 'ace' | 'opponent_error' | 'generic';
}

const skillIcons = {
  attack: Zap,
  block: Shield,
  ace: Target,
  opponent_error: Target,
  generic: Target,
};

const skillLabels = {
  attack: 'ATAQUE!',
  block: 'BLOQUEIO!',
  ace: 'ACE!',
  opponent_error: 'ERRO ADVERSÁRIO',
  generic: 'PONTO!',
};

const skillColors = {
  attack: '#f97316',
  block: '#8b5cf6',
  ace: '#06b6d4',
  opponent_error: '#64748b',
  generic: '#10b981',
};

export const PointScorerGraphic: React.FC<PointScorerGraphicProps> = ({
  show,
  player,
  teamId,
  state,
  stats,
  skill = 'generic',
}) => {
  const teamColor = teamId === 'A'
    ? getHexFromColor(state.teamARoster.color || 'indigo')
    : getHexFromColor(state.teamBRoster.color || 'rose');

  const SkillIcon = skillIcons[skill];
  const skillLabel = skillLabels[skill];
  const skillColor = skillColors[skill];

  return (
    <LowerThird show={show} position="left">
      <LowerThirdHeader 
        title={skillLabel} 
        subtitle={teamId === 'A' ? state.teamAName : state.teamBName}
        color={skillColor}
      />
      <LowerThirdBody>
        <div className="flex items-center gap-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-black text-white"
            style={{ 
              backgroundColor: `${teamColor}cc`,
              boxShadow: `0 0 20px ${teamColor}60`
            }}
          >
            {player.number || '#'}
          </motion.div>
          
          <div className="flex flex-col gap-1">
            <motion.span
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-xl font-black text-white uppercase tracking-tight"
            >
              {player.name}
            </motion.span>
            
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="flex items-center gap-2"
            >
              <SkillIcon size={14} style={{ color: skillColor }} />
              <span className="text-sm font-medium text-white/60">
                {stats ? `${stats.totalPoints} pontos na partida` : 'Pontuador'}
              </span>
            </motion.div>
          </div>

          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="ml-auto flex items-center gap-1"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <SkillIcon size={24} style={{ color: skillColor }} />
            </motion.div>
          </motion.div>
        </div>

        {stats && (stats.attacks > 0 || stats.blocks > 0 || stats.aces > 0) && (
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="flex gap-4 mt-3 pt-3 border-t border-white/10"
          >
            {stats.attacks > 0 && (
              <div className="flex items-center gap-1.5">
                <Zap size={12} className="text-orange-400" />
                <span className="text-xs font-bold text-white/80">{stats.attacks}</span>
              </div>
            )}
            {stats.blocks > 0 && (
              <div className="flex items-center gap-1.5">
                <Shield size={12} className="text-purple-400" />
                <span className="text-xs font-bold text-white/80">{stats.blocks}</span>
              </div>
            )}
            {stats.aces > 0 && (
              <div className="flex items-center gap-1.5">
                <Target size={12} className="text-cyan-400" />
                <span className="text-xs font-bold text-white/80">{stats.aces}</span>
              </div>
            )}
          </motion.div>
        )}
      </LowerThirdBody>
    </LowerThird>
  );
};
