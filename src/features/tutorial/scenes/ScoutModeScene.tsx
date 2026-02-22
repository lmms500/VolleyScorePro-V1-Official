/**
 * ScoutModeScene - Stats Tracking Animation
 * Ultra-compact layout without overflow
 */

import React from 'react';
import { motion } from 'framer-motion';
import { User, Zap, Shield, Sparkles, Target } from 'lucide-react';
import { MotionSceneProps } from './types';

export const ScoutModeScene: React.FC<MotionSceneProps> = ({ color, isPaused }) => {
  const stats = [
    { icon: Zap, label: 'Ataque', value: '12', color: 'bg-orange-500' },
    { icon: Shield, label: 'Bloqueio', value: '5', color: 'bg-blue-500' },
    { icon: Sparkles, label: 'Ace', value: '3', color: 'bg-violet-500' },
    { icon: Target, label: 'Defesa', value: '8', color: 'bg-emerald-500' }
  ];

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 gap-2">
      {/* Title */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <span className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
          Modo Scout
        </span>
        <p className="text-[10px] text-slate-400">Toque ao pontuar para registrar</p>
      </motion.div>

      {/* Player card */}
      <motion.div
        className="w-full max-w-[200px] bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow overflow-hidden"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-violet-600 px-3 py-2 flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <User size={16} className="text-white" />
          </div>
          <div>
            <span className="text-xs font-bold text-white block">João Silva</span>
            <span className="text-[9px] text-white/70">#10 Ponteiro</span>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-1.5 p-2">
          {stats.map((stat, idx) => (
            <motion.div
              key={stat.label}
              className="flex items-center gap-1.5 p-2 rounded-lg bg-slate-50 dark:bg-slate-700/50"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
            >
              <div className={`w-6 h-6 rounded ${stat.color} flex items-center justify-center`}>
                <stat.icon size={12} className="text-white" />
              </div>
              <div>
                <span className="text-[8px] text-slate-500 block">{stat.label}</span>
                <span className="text-xs font-black text-slate-800 dark:text-white">{stat.value}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Hint */}
      <motion.div
        className="flex items-center gap-2 text-[9px] text-slate-500"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <span>Após cada ponto</span>
        <span className="text-indigo-500 font-bold">→</span>
        <span className="text-indigo-600 dark:text-indigo-400 font-medium">Selecione jogador + ação</span>
      </motion.div>
    </div>
  );
};
