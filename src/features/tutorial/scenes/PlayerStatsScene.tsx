/**
 * SCENE: Player Stats - Card showing player career statistics
 * Unique: Stats bars animate with glowing effect
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import { MotionSceneProps } from './types';

export const PlayerStatsScene: React.FC<MotionSceneProps> = ({ color, isPaused }) => {
  const stats = [
    { label: 'Ataque', value: 85, icon: '⚡', color: 'from-orange-500 to-red-500' },
    { label: 'Defesa', value: 72, icon: '🛡️', color: 'from-blue-500 to-cyan-500' },
    { label: 'Levantamento', value: 68, icon: '🔄', color: 'from-purple-500 to-pink-500' }
  ];

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 dark:bg-white/5 relative overflow-hidden px-6 py-8">
      {/* PLAYER HEADER CARD */}
      <motion.div
        className="w-full max-w-sm p-6 rounded-2xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-white/10 shadow-lg mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={isPaused ? { opacity: 1, y: 0 } : {
          opacity: 1,
          y: 0,
          boxShadow: [
            '0 10px 25px -5px rgba(0,0,0,0.1)',
            '0 20px 30px -5px rgba(0,0,0,0.15)',
            '0 10px 25px -5px rgba(0,0,0,0.1)'
          ]
        }}
        transition={{
          opacity: { duration: 0.5 },
          y: { duration: 0.5 },
          boxShadow: { duration: 3, repeat: Infinity, ease: 'easeInOut' }
        }}
      >
        <div className="flex items-center gap-4 mb-4">
          {/* AVATAR WITH GLOW */}
          <motion.div
            className="relative flex-shrink-0"
            animate={isPaused ? { scale: 1 } : { scale: [1, 1.08, 1] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <motion.div
              className="absolute inset-0 rounded-full bg-violet-400/30 blur-lg"
              animate={isPaused ? { scale: 1 } : { scale: [1, 1.3, 1] }}
              transition={{ duration: 2.4, repeat: Infinity }}
            />
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center relative z-10 shadow-lg border-2 border-violet-700">
              <Users size={28} className="text-white" />
            </div>
          </motion.div>

          <div className="flex-1">
            <div className="font-bold text-slate-800 dark:text-white text-sm">João Silva</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Ponteiro #1</div>
            <motion.div
              className="text-xs font-semibold text-violet-600 dark:text-violet-400 mt-1"
              animate={isPaused ? { opacity: 0.6 } : { opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2.4, repeat: Infinity }}
            >
              Habilidade Geral: 75%
            </motion.div>
          </div>
        </div>

        {/* SKILL BARS - 3 attributes */}
        <div className="space-y-4">
          {stats.map((stat, idx) => (
            <motion.div
              key={stat.label}
              className="space-y-1.5"
              initial={{ opacity: 0, x: -10 }}
              animate={isPaused ? { opacity: 1, x: 0 } : { opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.2 }}
            >
              {/* LABEL + VALUE */}
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <span>{stat.icon}</span>
                  {stat.label}
                </span>
                <motion.span
                  className="font-bold text-slate-800 dark:text-white text-sm tabular-nums"
                  animate={isPaused ? { scale: 1 } : {
                    scale: [0.8, 1.2, 1],
                  }}
                  transition={{
                    duration: 1.0,
                    repeat: Infinity,
                    delay: 0.5 + idx * 0.3,
                    times: [0, 0.4, 0.5],
                    ease: 'easeOut'
                  }}
                >
                  {stat.value}%
                </motion.span>
              </div>

              {/* STAT BAR CONTAINER */}
              <div className="w-full h-2.5 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden relative">
                <motion.div
                  className={`h-full bg-gradient-to-r ${stat.color} rounded-full shadow-md`}
                  initial={{ width: '0%' }}
                  animate={isPaused ? { width: `${stat.value}%` } : {
                    width: ['0%', `${stat.value}%`, `${stat.value}%`]
                  }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    delay: 0.5 + idx * 0.3,
                    times: [0, 0.35, 0.65],
                    ease: 'easeOut'
                  }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* STATUS BADGE */}
      <motion.div
        className="flex items-center gap-2 text-xs"
        animate={isPaused ? { opacity: 0.5 } : { opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2.4, repeat: Infinity }}
      >
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="font-semibold text-slate-600 dark:text-slate-300">Jogador Ativo</span>
      </motion.div>
    </div>
  );
};
