/**
 * BatchInputScene - Batch Import Animation
 * Compact layout showing text-to-player transformation
 */

import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Users, ArrowRight, Check } from 'lucide-react';
import { MotionSceneProps } from './types';

export const BatchInputScene: React.FC<MotionSceneProps> = ({ color, isPaused }) => {
  const bgClass = color.replace('text-', 'bg-');
  const playerLines = ['João 8', 'Maria 9', 'Pedro 7'];

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 gap-3">
      {/* Title */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-center gap-2 mb-1">
          <FileText size={16} className={color} />
          <span className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
            Importação em Lote
          </span>
        </div>
        <p className="text-[10px] text-slate-400">Cole uma lista para criar jogadores</p>
      </motion.div>

      {/* Import visualization */}
      <div className="flex items-center justify-center gap-2 w-full max-w-[260px]">
        {/* Input area */}
        <motion.div
          className="flex-1 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-2"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="text-[8px] font-bold text-slate-400 mb-1.5">COLE AQUI:</div>
          <div className="space-y-1">
            {playerLines.map((line, idx) => (
              <motion.div
                key={idx}
                className="h-5 rounded bg-slate-100 dark:bg-slate-700 flex items-center px-2"
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ delay: 0.2 + idx * 0.1 }}
              >
                <span className="text-[9px] text-slate-500 truncate">{line}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Arrow */}
        <motion.div
          className="flex flex-col items-center"
          animate={isPaused ? {} : { x: [0, 3, 0] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          <ArrowRight size={18} className={color} />
        </motion.div>

        {/* Output players */}
        <motion.div
          className="flex-1"
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="text-[8px] font-bold text-slate-400 mb-1.5">JOGADORES:</div>
          <div className="flex flex-wrap gap-1.5">
            {['#8', '#9', '#7'].map((num, idx) => (
              <motion.div
                key={idx}
                className={`w-8 h-8 rounded-lg ${bgClass} flex items-center justify-center shadow-sm`}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.5 + idx * 0.1, type: "spring" }}
              >
                <span className="text-[10px] font-bold text-white">{num}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Format hint */}
      <motion.div
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Check size={12} className="text-indigo-500" />
        <span className="text-[9px] text-indigo-600 dark:text-indigo-300 font-medium">
          Formato: "Nome 8" ou "10 Nome 8" (número + skill)
        </span>
      </motion.div>

      {/* Description */}
      <motion.div
        className="text-center max-w-[220px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <p className="text-[9px] text-slate-400">
          O sistema detecta automaticamente nome, número e nível de habilidade
        </p>
      </motion.div>
    </div>
  );
};
