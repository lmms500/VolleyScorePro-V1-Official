/**
 * PlayerStatsScene - Player Statistics Animation
 * Compact player card with animated stats
 */

import React from 'react';
import { motion } from 'framer-motion';
import { User, Zap, Shield, Target, Award } from 'lucide-react';
import { MotionSceneProps } from './types';

interface StatBarProps {
  icon: React.ElementType;
  label: string;
  value: number;
  color: string;
  delay: number;
  isPaused: boolean;
}

const StatBar: React.FC<StatBarProps> = ({ icon: Icon, label, value, color, delay, isPaused }) => (
  <div className="flex items-center gap-2">
    <div className={`w-6 h-6 rounded-lg ${color} flex items-center justify-center`}>
      <Icon size={12} className="text-white" />
    </div>
    <div className="flex-1">
      <div className="flex justify-between mb-0.5">
        <span className="text-[9px] font-bold text-slate-500">{label}</span>
        <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{value}%</span>
      </div>
      <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <motion.div
          className={`h-full ${color} rounded-full`}
          initial={{ width: 0 }}
          animate={isPaused ? { width: `${value}%` } : { width: [`${value * 0.3}%`, `${value}%`] }}
          transition={{ duration: 1.5, delay, ease: "easeOut" }}
        />
      </div>
    </div>
  </div>
);

export const PlayerStatsScene: React.FC<MotionSceneProps> = ({ color, isPaused }) => {
  const stats = [
    { icon: Zap, label: 'Ataque', value: 85, color: 'bg-gradient-to-r from-orange-400 to-red-500' },
    { icon: Shield, label: 'Defesa', value: 72, color: 'bg-gradient-to-r from-blue-400 to-cyan-500' },
    { icon: Target, label: 'Levant.', value: 68, color: 'bg-gradient-to-r from-violet-400 to-purple-500' }
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
          <Award size={16} className={color} />
          <span className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
            Perfil do Jogador
          </span>
        </div>
        <p className="text-[10px] text-slate-400">Acompanhe estatísticas de carreira</p>
      </motion.div>

      {/* Player card */}
      <motion.div
        className="w-full max-w-[220px] bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg overflow-hidden"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-500 to-rose-500 p-3 flex items-center gap-3">
          <motion.div
            className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center"
            animate={isPaused ? {} : { scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <User size={20} className="text-white" />
          </motion.div>
          <div>
            <span className="text-sm font-bold text-white block">João Silva</span>
            <span className="text-[10px] text-white/70">Ponteiro #10</span>
          </div>
        </div>

        {/* Stats */}
        <div className="p-3 space-y-2">
          {stats.map((stat, idx) => (
            <StatBar
              key={stat.label}
              icon={stat.icon}
              label={stat.label}
              value={stat.value}
              color={stat.color}
              delay={0.2 + idx * 0.1}
              isPaused={isPaused}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="px-3 pb-3">
          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-700/50">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-bold text-slate-500">Jogador Ativo</span>
            </div>
            <span className="text-[10px] font-bold text-violet-600 dark:text-violet-400">12 Partidas</span>
          </div>
        </div>
      </motion.div>

      {/* Hint */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <p className="text-[9px] text-slate-400">
          Vincule perfis aos jogadores para acumular estatísticas
        </p>
      </motion.div>
    </div>
  );
};
