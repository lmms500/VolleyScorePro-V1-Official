/**
 * DragDropScene - Premium Drag Animation
 * Compact layout without overflow issues
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Users, Grip, Check, ArrowRight } from 'lucide-react';
import { MotionSceneProps } from './types';

export const DragDropScene: React.FC<MotionSceneProps> = ({ color, isPaused }) => {
  const bgClass = color.replace('text-', 'bg-');

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 gap-4">
      {/* Title */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <span className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
          Arrastar e Soltar
        </span>
        <p className="text-[10px] text-slate-400 mt-1">Mova jogadores entre áreas</p>
      </motion.div>

      {/* Drag visualization */}
      <div className="flex items-center justify-center gap-3 w-full max-w-[260px]">
        {/* Source slot */}
        <motion.div
          className="flex flex-col items-center gap-1"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <motion.div
            className="w-14 h-14 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center bg-slate-50 dark:bg-slate-800/50"
            animate={isPaused ? {} : {
              borderColor: ['#cbd5e1', '#94a3b8', '#cbd5e1']
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Grip size={20} className="text-slate-400" />
          </motion.div>
          <span className="text-[9px] font-bold text-slate-400 uppercase">Origem</span>
        </motion.div>

        {/* Arrow */}
        <motion.div
          className="flex items-center"
          animate={isPaused ? {} : { x: [0, 5, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <ArrowRight size={20} className={color} />
        </motion.div>

        {/* Draggable card */}
        <motion.div
          className="relative"
          animate={isPaused ? { x: 0 } : {
            x: [0, 40, 40, 0],
            scale: [1, 1.1, 1, 1]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            times: [0, 0.3, 0.7, 1]
          }}
        >
          <motion.div
            className={`w-14 h-14 rounded-xl ${bgClass} shadow-lg flex items-center justify-center`}
            animate={isPaused ? {} : {
              boxShadow: [
                '0 4px 15px -3px rgba(0,0,0,0.1)',
                '0 10px 25px -5px rgba(0,0,0,0.2)',
                '0 4px 15px -3px rgba(0,0,0,0.1)'
              ]
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Users size={24} className="text-white" strokeWidth={1.5} />
          </motion.div>
        </motion.div>

        {/* Arrow */}
        <motion.div
          className="flex items-center"
          animate={isPaused ? {} : { x: [0, -5, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
        >
          <ArrowRight size={20} className={color} />
        </motion.div>

        {/* Target slot */}
        <motion.div
          className="flex flex-col items-center gap-1"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <motion.div
            className="w-14 h-14 rounded-xl border-2 border-dashed border-indigo-300 dark:border-indigo-600 flex items-center justify-center bg-indigo-50 dark:bg-indigo-900/30"
            animate={isPaused ? {} : {
              borderColor: ['#93c5fd', '#6366f1', '#93c5fd'],
              scale: [1, 1.05, 1]
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            {/* Success check */}
            <motion.div
              className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center"
              initial={{ scale: 0 }}
              animate={isPaused ? { scale: 0 } : {
                scale: [0, 0, 1.2, 1, 0],
                opacity: [0, 0, 1, 1, 0]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                times: [0, 0.5, 0.6, 0.8, 1]
              }}
            >
              <Check size={14} className="text-white" strokeWidth={3} />
            </motion.div>
          </motion.div>
          <span className="text-[9px] font-bold text-indigo-500 uppercase">Destino</span>
        </motion.div>
      </div>

      {/* Flow indicator */}
      <motion.div
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <motion.div
          className="w-1.5 h-1.5 rounded-full bg-emerald-500"
          animate={isPaused ? {} : { scale: [1, 1.3, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
        <span className="text-[9px] font-bold text-slate-500">
          Solte para fixar o jogador
        </span>
      </motion.div>
    </div>
  );
};
