/**
 * SCENE: Drag & Drop - Card sliding into a slot with magnetic snap
 * Unique loop: No repeated patterns, just one perfect drag cycle
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Users, Zap } from 'lucide-react';
import { MotionSceneProps } from './types';

export const DragDropScene: React.FC<MotionSceneProps> = ({ color, isPaused }) => {
  const bgClass = color.replace('text-', 'bg-');

  return (
    <div className="w-full h-full flex items-center justify-center bg-slate-50 dark:bg-white/5 relative overflow-hidden">
      {/* TARGET SLOT - Clean feedback, sem overlapping */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        {/* Main slot */}
        <motion.div
          className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-300 dark:border-white/20 flex items-center justify-center relative z-10 bg-white/5 dark:bg-white/5"
          animate={isPaused ? { scale: 1 } : {
            scale: [1, 1.06, 1.06, 1],
            borderColor: ['#cbd5e1', '#6366f1', '#6366f1', '#cbd5e1'],
            boxShadow: [
              '0 0 0px rgba(99,102,241,0)',
              '0 0 24px rgba(99,102,241,0.5)',
              '0 0 24px rgba(99,102,241,0.3)',
              '0 0 0px rgba(99,102,241,0)'
            ]
          }}
          transition={{
            duration: 4.8,
            repeat: Infinity,
            ease: 'easeInOut',
            times: [0, 0.3, 0.55, 1]
          }}
        >
          <Zap size={24} className="text-slate-400 dark:text-white/30" />
        </motion.div>
      </div>

      {/* DRAGGABLE CARD - Clean approach + snap */}
      <motion.div
        className={`absolute w-20 h-20 rounded-xl ${bgClass} shadow-lg flex items-center justify-center cursor-grab active:cursor-grabbing z-20`}
        initial={{ x: -120, opacity: 0, rotate: 0 }}
        animate={isPaused ? { x: -120, opacity: 0, rotate: 0 } : {
          x: [-120, -40, 0, 0, -120],
          opacity: [0, 1, 1, 1, 0],
          scale: [0.8, 0.95, 1.05, 1, 0.8],
          rotate: [20, 8, -3, 0, 20]
        }}
        transition={{
          duration: 4.8,
          repeat: Infinity,
          ease: 'easeInOut',
          times: [0, 0.25, 0.35, 0.6, 1]
        }}
      >
        <Users size={28} className="text-white" />
      </motion.div>

      {/* SNAP FEEDBACK - Checkmark appears on completion */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        initial={{ scale: 0, opacity: 0 }}
        animate={isPaused ? { scale: 0, opacity: 0 } : {
          scale: [0, 1.3, 1, 1, 0],
          opacity: [0, 1, 1, 1, 0]
        }}
        transition={{
          duration: 4.8,
          repeat: Infinity,
          times: [0, 0.55, 0.65, 0.8, 1],
          ease: 'easeOut'
        }}
      >
        <div className="flex items-center justify-center w-8 h-8 bg-emerald-500 rounded-full">
          <div className="text-white text-sm font-bold">✓</div>
        </div>
      </motion.div>
    </div>
  );
};
