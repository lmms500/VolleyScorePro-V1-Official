/**
 * TeamCompositionScene - Team Structure Animation
 * Compact layout showing court/bench/queue
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Users, UserPlus, Clock, Crown } from 'lucide-react';
import { MotionSceneProps } from './types';

interface GroupConfig {
  label: string;
  sublabel: string;
  count: number;
  startNum: number;
  colors: {
    bg: string;
    border: string;
    dot: string;
    player: string;
    text: string;
  };
  icon: React.ElementType;
}

const PlayerDot: React.FC<{
  number: number;
  delay: number;
  playerClass: string;
  isPaused: boolean;
}> = ({ number, delay, playerClass, isPaused }) => (
  <motion.div
    className={`w-6 h-6 rounded-full ${playerClass} flex items-center justify-center text-white text-[10px] font-bold shadow-sm`}
    initial={{ scale: 0, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ delay, duration: 0.3, ease: "easeOut" }}
  >
    {number}
  </motion.div>
);

const GroupCard: React.FC<{
  group: GroupConfig;
  delay: number;
  isPaused: boolean;
}> = ({ group, delay, isPaused }) => {
  const Icon = group.icon;

  return (
    <motion.div
      className={`p-3 rounded-xl ${group.colors.bg} border ${group.colors.border}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-5 h-5 rounded-lg ${group.colors.dot} flex items-center justify-center`}>
          <Icon size={10} className="text-white" />
        </div>
        <div>
          <span className={`text-[10px] font-bold ${group.colors.text} uppercase block`}>
            {group.label}
          </span>
          <span className="text-[8px] text-slate-400">{group.sublabel}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {[...Array(group.count)].map((_, i) => (
          <PlayerDot
            key={i}
            number={group.startNum + i}
            delay={delay + 0.1 + i * 0.05}
            playerClass={group.colors.player}
            isPaused={isPaused}
          />
        ))}
      </div>
    </motion.div>
  );
};

export const TeamCompositionScene: React.FC<MotionSceneProps> = ({ color, isPaused }) => {
  const groups: GroupConfig[] = [
    {
      label: 'Quadra',
      sublabel: 'Jogadores ativos',
      count: 6,
      startNum: 1,
      colors: {
        bg: 'bg-blue-50 dark:bg-blue-950/30',
        border: 'border-blue-200 dark:border-blue-800/50',
        dot: 'bg-blue-500',
        player: 'bg-gradient-to-br from-blue-400 to-blue-600',
        text: 'text-blue-700 dark:text-blue-300'
      },
      icon: Crown
    },
    {
      label: 'Banco',
      sublabel: 'Reservas',
      count: 4,
      startNum: 7,
      colors: {
        bg: 'bg-amber-50 dark:bg-amber-950/30',
        border: 'border-amber-200 dark:border-amber-800/50',
        dot: 'bg-amber-500',
        player: 'bg-gradient-to-br from-amber-400 to-amber-600',
        text: 'text-amber-700 dark:text-amber-300'
      },
      icon: UserPlus
    },
    {
      label: 'Fila',
      sublabel: 'Aguardando',
      count: 3,
      startNum: 11,
      colors: {
        bg: 'bg-slate-50 dark:bg-slate-800/50',
        border: 'border-slate-200 dark:border-slate-700/50',
        dot: 'bg-slate-500',
        player: 'bg-gradient-to-br from-slate-400 to-slate-600',
        text: 'text-slate-700 dark:text-slate-300'
      },
      icon: Clock
    }
  ];

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 gap-3">
      {/* Title */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-center gap-2 mb-1">
          <Users size={16} className={color} />
          <span className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
            Estrutura do Time
          </span>
        </div>
        <p className="text-[10px] text-slate-400">Organize jogadores em três áreas</p>
      </motion.div>

      {/* Groups */}
      <div className="w-full max-w-[220px] space-y-2">
        {groups.map((group, idx) => (
          <GroupCard
            key={group.label}
            group={group}
            delay={0.1 + idx * 0.15}
            isPaused={isPaused}
          />
        ))}
      </div>

      {/* Legend */}
      <motion.div
        className="flex items-center gap-3 text-[9px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-blue-500" />
          <span className="text-slate-500">Ativos</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-amber-500" />
          <span className="text-slate-500">Reservas</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-slate-400" />
          <span className="text-slate-500">Fila</span>
        </div>
      </motion.div>

      {/* Hint */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <p className="text-[9px] text-slate-400">
          Arraste jogadores entre as áreas para reorganizar
        </p>
      </motion.div>
    </div>
  );
};
