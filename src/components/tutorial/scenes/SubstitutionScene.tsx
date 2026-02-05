/**
 * SCENE: Substitution/Swap - Two cards exchanging positions with rotation
 * Unique: Cards swap with opposite rotations, creating a dance pattern
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Users, ArrowRightLeft } from 'lucide-react';
import { MotionSceneProps } from './types';

export const SubstitutionScene: React.FC<MotionSceneProps> = ({ color, isPaused }) => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 dark:bg-white/5 relative overflow-hidden px-4 py-6 gap-4">
      {/* TITLE */}
      <motion.div
        className="text-xs font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300"
        animate={isPaused ? { opacity: 0.5 } : { opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        Substituição de Jogador
      </motion.div>

      {/* PLAYER SWAP VISUALIZATION */}
      <div className="flex items-center justify-center gap-6 w-full">
        {/* OUTGOING PLAYER - Left side */}
        <motion.div
          className="flex flex-col items-center gap-2"
          animate={isPaused ? { x: 0, opacity: 1 } : {
            x: [0, -20, -40, 20, 0],
            opacity: [1, 1, 0.3, 1, 1],
            scale: [1, 1.05, 0.9, 1.1, 1]
          }}
          transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', times: [0, 0.25, 0.5, 0.75, 1] }}
        >
          <motion.div
            className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center border-3 border-red-700 shadow-lg"
            animate={isPaused ? { scale: 1 } : { scale: [1, 1.08, 1] }}
            transition={{ duration: 2.8, repeat: Infinity }}
          >
            <Users size={32} className="text-white" />
          </motion.div>
          <div className="text-center">
            <div className="text-xs font-bold text-red-600 dark:text-red-400">SAI</div>
            <div className="text-2xl font-bold text-slate-800 dark:text-slate-200 tabular-nums">#7</div>
          </div>
        </motion.div>

        {/* SWAP ANIMATION - Center */}
        <motion.div
          className="flex flex-col items-center gap-1"
          animate={isPaused ? { opacity: 0 } : { opacity: [0, 0, 1, 1, 0] }}
          transition={{ duration: 2.8, repeat: Infinity, times: [0, 0.4, 0.5, 0.75, 1] }}
        >
          <motion.div
            animate={isPaused ? { x: 0 } : { x: [-4, 4, -4] }}
            transition={{ duration: 0.4, repeat: Infinity }}
          >
            <ArrowRightLeft size={32} className="text-emerald-500" strokeWidth={2.5} />
          </motion.div>
          <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Swap</div>
        </motion.div>

        {/* INCOMING PLAYER - Right side */}
        <motion.div
          className="flex flex-col items-center gap-2"
          animate={isPaused ? { x: 0, opacity: 1 } : {
            x: [0, 20, 40, -20, 0],
            opacity: [1, 1, 0.3, 1, 1],
            scale: [1, 1.05, 0.9, 1.1, 1]
          }}
          transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', times: [0, 0.25, 0.5, 0.75, 1] }}
        >
          <motion.div
            className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center border-3 border-emerald-700 shadow-lg"
            animate={isPaused ? { scale: 1 } : { scale: [1, 1.08, 1] }}
            transition={{ duration: 2.8, repeat: Infinity }}
          >
            <Users size={32} className="text-white" />
          </motion.div>
          <div className="text-center">
            <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">ENTRA</div>
            <div className="text-2xl font-bold text-slate-800 dark:text-slate-200 tabular-nums">#14</div>
          </div>
        </motion.div>
      </div>

      {/* SUCCESS INDICATOR */}
      <motion.div
        className="flex items-center gap-2"
        animate={isPaused ? { opacity: 0 } : { opacity: [0, 0, 0, 1, 1, 0] }}
        transition={{ duration: 2.8, repeat: Infinity, times: [0, 0.5, 0.65, 0.75, 0.95, 1] }}
      >
        <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
          <div className="text-white text-sm font-bold">✓</div>
        </div>
        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Substituição efetiva</span>
      </motion.div>
    </div>
  );
};
