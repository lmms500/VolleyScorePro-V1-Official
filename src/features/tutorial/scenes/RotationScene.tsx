/**
 * RotationScene - Team Rotation & Player Loan System
 * Compact layout showing queue and loan system
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Users, ArrowDown, ArrowRight, Sparkles } from 'lucide-react';
import { MotionSceneProps } from './types';

export const RotationScene: React.FC<MotionSceneProps> = ({ color, isPaused }) => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 gap-3">
      {/* Title */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <span className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
          Rotação de Times
        </span>
        <p className="text-[10px] text-slate-400 mt-1">Sistema de empréstimo entre times</p>
      </motion.div>

      {/* Queue visualization */}
      <div className="w-full max-w-[240px] space-y-2">
        {/* Current team */}
        <motion.div
          className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center">
              <Users size={10} className="text-white" />
            </div>
            <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300">Time A - Em Quadra</span>
          </div>
          <div className="flex gap-1.5">
            {[1,2,3,4].map(n => (
              <div key={n} className="w-6 h-6 rounded-full bg-indigo-400 flex items-center justify-center text-[10px] font-bold text-white">
                {n}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Arrow */}
        <motion.div 
          className="flex items-center justify-center gap-2 py-1"
          animate={isPaused ? {} : { opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <ArrowDown size={16} className="text-violet-500" />
          <span className="text-[9px] font-bold text-violet-500">Venceu, sai</span>
        </motion.div>

        {/* Incoming team */}
        <motion.div
          className="p-3 rounded-xl bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-5 h-5 rounded-full bg-violet-500 flex items-center justify-center">
              <Users size={10} className="text-white" />
            </div>
            <span className="text-[10px] font-bold text-violet-700 dark:text-violet-300">Time B - Precisa de 2</span>
          </div>
          <div className="flex gap-1.5">
            {[5,6].map(n => (
              <div key={n} className="w-6 h-6 rounded-full bg-violet-400 flex items-center justify-center text-[10px] font-bold text-white">
                {n}
              </div>
            ))}
            <div className="w-6 h-6 rounded-full border-2 border-dashed border-violet-300 flex items-center justify-center">
              <span className="text-[8px] text-violet-400">?</span>
            </div>
            <div className="w-6 h-6 rounded-full border-2 border-dashed border-violet-300 flex items-center justify-center">
              <span className="text-[8px] text-violet-400">?</span>
            </div>
          </div>
        </motion.div>

        {/* Loan indicator */}
        <motion.div 
          className="flex items-center justify-center gap-2 py-1"
          animate={isPaused ? {} : { x: [0, 3, 0] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          <Sparkles size={14} className="text-amber-500" />
          <ArrowRight size={14} className="text-amber-500" />
          <span className="text-[9px] font-bold text-amber-600">Empresta jogadores</span>
        </motion.div>

        {/* Queue team */}
        <motion.div
          className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
              <Users size={10} className="text-white" />
            </div>
            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300">Time C - Na Fila</span>
          </div>
          <div className="flex gap-1.5">
            {[7,8,9,10].map(n => (
              <motion.div 
                key={n} 
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${n <= 8 ? 'bg-amber-400' : 'bg-emerald-400'} text-white`}
                animate={n <= 8 && !isPaused ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 1, repeat: Infinity, delay: n * 0.1 }}
              >
                {n}
              </motion.div>
            ))}
          </div>
          <p className="text-[8px] text-amber-600 mt-2">Jogadores 7 e 8 serão emprestados</p>
        </motion.div>
      </div>

      {/* Mode indicator */}
      <motion.div
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <span className="text-[9px] font-bold text-slate-600 dark:text-slate-300">
          Modo Balanceado: IA escolhe jogadores para equilibrar níveis
        </span>
      </motion.div>
    </div>
  );
};
