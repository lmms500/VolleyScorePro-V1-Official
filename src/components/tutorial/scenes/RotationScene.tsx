/**
 * SCENE: Rotation - Players orbiting in a circle carousel
 * Unique: Each player appears at different angles in smooth circle
 */

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRightLeft, Layout } from 'lucide-react';
import { MotionSceneProps } from './types';

export const RotationScene: React.FC<MotionSceneProps> = ({ color, isPaused }) => {
  const positions = [0, 60, 120, 180, 240, 300];

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 dark:bg-white/5 relative overflow-hidden px-4 py-8">
      {/* TITLE */}
      <motion.div
        className="text-xs font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300 mb-4"
        animate={isPaused ? { opacity: 0.5 } : { opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        Rotação de Posições
      </motion.div>

      {/* CENTRAL ROTATION DIAGRAM */}
      <div className="relative flex items-center justify-center" style={{ width: 240, height: 240 }}>
        {/* ORBIT CIRCLE - Clean rotation */}
        <motion.div
          className="absolute w-48 h-48 rounded-full border-2 border-dashed border-slate-300 dark:border-white/10"
          animate={isPaused ? { rotate: 0, opacity: 0.3 } : { rotate: 360, opacity: 0.4 }}
          transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
        />

        {/* CENTER COURT ICON */}
        <motion.div
          className="absolute w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center z-20 shadow-lg"
          animate={isPaused ? { scale: 1 } : { scale: [1, 1.1, 1] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Layout size={20} className="text-white" />
        </motion.div>

        {/* BACKGROUND GLOW */}
        <motion.div
          className="absolute rounded-full bg-indigo-500/4 blur-3xl"
          animate={isPaused ? { scale: 1 } : { scale: [0.95, 1.1, 0.95] }}
          transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
          style={{ width: 240, height: 240 }}
        />

        {/* PLAYERS ON ORBIT - Smooth circular motion with position labels */}
        {positions.map((angle, idx) => {
          const radius = 90;
          const x = Math.cos((angle * Math.PI) / 180) * radius;
          const y = Math.sin((angle * Math.PI) / 180) * radius;
          const positionLabels = ['Levantador', 'Ponteiro', 'Central', 'Oposto', 'Levantador', 'Libero'];

          return (
            <motion.div
              key={`player-${idx}`}
              className="absolute flex flex-col items-center gap-1"
              animate={isPaused ? {
                x: x,
                y: y,
                scale: 1
              } : {
                x: x,
                y: y,
                scale: [1, 1, 1.2, 1, 1]
              }}
              transition={{
                scale: {
                  duration: 3.6,
                  repeat: Infinity,
                  delay: (angle / 360) * 3.6,
                  times: [0, 0.7, 0.8, 0.9, 1]
                }
              }}
            >
              {/* PLAYER CIRCLE */}
              <motion.div
                className="w-11 h-11 rounded-full bg-gradient-to-br from-sky-500 to-sky-600 flex items-center justify-center z-10 font-bold text-white text-sm shadow-md border-2 border-sky-700"
                animate={isPaused ? {} : {
                  boxShadow: [
                    '0 0 0px rgba(14, 165, 233, 0)',
                    '0 0 0px rgba(14, 165, 233, 0)',
                    '0 0 12px rgba(14, 165, 233, 0.6)',
                    '0 0 0px rgba(14, 165, 233, 0)',
                    '0 0 0px rgba(14, 165, 233, 0)'
                  ]
                }}
                transition={{
                  duration: 3.6,
                  repeat: Infinity,
                  delay: (angle / 360) * 3.6,
                  times: [0, 0.7, 0.8, 0.9, 1]
                }}
              >
                {idx + 1}
              </motion.div>

              {/* POSITION LABEL */}
              <motion.div
                className="text-xs font-semibold text-slate-600 dark:text-slate-300 text-center whitespace-nowrap"
                animate={isPaused ? { opacity: 0.5 } : {
                  opacity: [0.5, 0.5, 1, 0.5, 0.5]
                }}
                transition={{
                  duration: 3.6,
                  repeat: Infinity,
                  delay: (angle / 360) * 3.6,
                  times: [0, 0.7, 0.8, 0.9, 1]
                }}
              >
                {positionLabels[idx]}
              </motion.div>
            </motion.div>
          );
        })}

        {/* ROTATION ARROW - Top */}
        <motion.div
          className="absolute top-0 z-15"
          animate={isPaused ? { opacity: 0 } : { opacity: [0, 0, 1, 1, 0] }}
          transition={{ duration: 3.6, repeat: Infinity, times: [0, 0.7, 0.8, 0.95, 1] }}
        >
          <div className="flex flex-col items-center gap-1">
            <ArrowRightLeft size={16} className="text-emerald-500 rotate-90" strokeWidth={2.5} />
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Rotaciona</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
