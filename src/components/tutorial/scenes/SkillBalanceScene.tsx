/**
 * SCENE: Skill Balance - Comparison of unbalanced vs balanced teams
 * Unique: Shows before (red) → balancing process → after (green)
 */

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRightLeft, Scale } from 'lucide-react';
import { MotionSceneProps } from './types';

export const SkillBalanceScene: React.FC<MotionSceneProps> = ({ color, isPaused }) => {
  const beforeTeam = [
    { label: 'Equipe A', skills: [90, 95, 85], balance: 'Desbalanceada' },
    { label: 'Equipe B', skills: [45, 40, 50], balance: 'Fraca' }
  ];

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 dark:bg-white/5 relative overflow-hidden px-4 py-6 gap-4">
      {/* TITLE */}
      <motion.div
        className="text-xs font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300"
        animate={isPaused ? { opacity: 0.5 } : { opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        Balanceamento de Habilidades
      </motion.div>

      {/* BEFORE → AFTER COMPARISON */}
      <div className="flex items-center justify-center gap-4 w-full max-w-sm">
        {/* BEFORE (UNBALANCED) */}
        <motion.div
          className="flex-1 p-4 rounded-xl bg-slate-100 dark:bg-white/5 border-2 border-red-500/50"
          animate={isPaused ? { opacity: 1 } : {
            opacity: [1, 1, 0.5, 1],
            scale: [1, 1, 0.95, 1]
          }}
          transition={{ duration: 3.2, repeat: Infinity, times: [0, 0.4, 0.6, 1] }}
        >
          <div className="text-xs font-bold text-red-600 dark:text-red-400 mb-3 uppercase">Antes</div>

          {beforeTeam.map((team, idx) => (
            <div key={team.label} className="mb-3 last:mb-0">
              <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{team.label}</div>
              <div className="flex gap-1">
                {team.skills.map((skill, skillIdx) => (
                  <motion.div
                    key={skillIdx}
                    className="flex-1 h-6 rounded-sm bg-red-500/40 border border-red-600 flex items-center justify-center"
                    animate={isPaused ? {} : {
                      opacity: [0.6, 1, 0.6]
                    }}
                    transition={{
                      duration: 3.2,
                      repeat: Infinity,
                      delay: skillIdx * 0.1,
                      times: [0, 0.4, 1]
                    }}
                  >
                    <span className="text-xs font-bold text-red-700 dark:text-red-300">{skill}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}

          <motion.div
            className="text-xs text-red-600 dark:text-red-400 font-semibold mt-2"
            animate={isPaused ? { opacity: 0.5 } : { opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 3.2, repeat: Infinity }}
          >
            ❌ Desbalanceado
          </motion.div>
        </motion.div>

        {/* TRANSFORMATION ARROW */}
        <motion.div
          className="flex flex-col items-center gap-1"
          animate={isPaused ? { opacity: 0 } : { opacity: [0, 0, 1, 1, 0] }}
          transition={{ duration: 3.2, repeat: Infinity, times: [0, 0.4, 0.5, 0.75, 1] }}
        >
          <ArrowRightLeft size={20} className="text-amber-500" strokeWidth={2.5} />
          <span className="text-xs font-bold text-amber-600 dark:text-amber-400 whitespace-nowrap">Balanceia</span>
        </motion.div>

        {/* AFTER (BALANCED) */}
        <motion.div
          className="flex-1 p-4 rounded-xl bg-slate-100 dark:bg-white/5 border-2 border-emerald-500/50"
          animate={isPaused ? { opacity: 1 } : {
            opacity: [0.5, 0.5, 1, 1],
            scale: [1, 1, 1.05, 1]
          }}
          transition={{ duration: 3.2, repeat: Infinity, times: [0, 0.4, 0.6, 1] }}
        >
          <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-3 uppercase">Depois</div>

          {beforeTeam.map((team, idx) => (
            <div key={team.label} className="mb-3 last:mb-0">
              <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{team.label}</div>
              <div className="flex gap-1">
                {[70, 72, 68].map((skill, skillIdx) => (
                  <motion.div
                    key={skillIdx}
                    className="flex-1 h-6 rounded-sm bg-emerald-500/40 border border-emerald-600 flex items-center justify-center"
                    animate={isPaused ? {} : {
                      opacity: [0.6, 1, 0.6]
                    }}
                    transition={{
                      duration: 3.2,
                      repeat: Infinity,
                      delay: skillIdx * 0.1,
                      times: [0.4, 0.6, 1]
                    }}
                  >
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">{skill}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}

          <motion.div
            className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-2"
            animate={isPaused ? { opacity: 0.5 } : { opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 3.2, repeat: Infinity, delay: 0.5 }}
          >
            ✓ Balanceado
          </motion.div>
        </motion.div>
      </div>

      {/* BALANCE SCORE INDICATOR */}
      <motion.div
        className="flex items-center gap-2 text-xs"
        animate={isPaused ? { opacity: 0.5 } : { opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2.4, repeat: Infinity, delay: 0.8 }}
      >
        <Scale size={16} className="text-emerald-500" />
        <span className="font-semibold text-slate-600 dark:text-slate-300">Índice de Balanceamento: 92%</span>
      </motion.div>
    </div>
  );
};
