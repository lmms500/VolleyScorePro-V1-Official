/**
 * VoiceControlScene - Premium Voice Animation
 * Apple-quality microphone visualization with elegant sound waves
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Mic, Volume2 } from 'lucide-react';
import { MotionSceneProps } from './types';

const PulseRing = ({ delay, isPaused, color }: { delay: number; isPaused: boolean; color: string }) => (
  <motion.div
    className={`absolute rounded-full border-2 ${color}`}
    animate={isPaused ? { scale: 0.3, opacity: 0 } : {
      scale: [0.3, 1.5],
      opacity: [0.8, 0]
    }}
    transition={{
      duration: 1.8,
      repeat: Infinity,
      delay,
      ease: "easeOut"
    }}
    style={{ width: 60, height: 60 }}
  />
);

export const VoiceControlScene: React.FC<MotionSceneProps> = ({ color, isPaused }) => {
  const bgClass = color.replace('text-', 'bg-');
  const borderClass = color.replace('text-', 'border-');

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-sky-50 via-white to-indigo-50 dark:from-sky-950/20 dark:via-slate-900 dark:to-indigo-950/20 relative overflow-hidden px-4 py-6">
      {/* Ambient particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={`particle-${i}`}
          className="absolute w-1 h-1 rounded-full bg-sky-400/40"
          style={{
            left: `${15 + Math.random() * 70}%`,
            top: `${15 + Math.random() * 70}%`
          }}
          animate={isPaused ? {} : {
            y: [0, -30, 0],
            x: [0, (Math.random() - 0.5) * 20, 0],
            scale: [0.5, 1, 0.5],
            opacity: [0.2, 0.6, 0.2]
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: i * 0.4,
            ease: "easeInOut"
          }}
        />
      ))}

      {/* Central microphone area */}
      <div className="relative flex items-center justify-center mb-8">
        {/* Expanding rings */}
        <PulseRing delay={0} isPaused={isPaused} color={borderClass} />
        <PulseRing delay={0.4} isPaused={isPaused} color={borderClass} />
        <PulseRing delay={0.8} isPaused={isPaused} color={borderClass} />

        {/* Mic button */}
        <motion.div
          className={`relative w-20 h-20 rounded-full ${bgClass} flex items-center justify-center shadow-xl z-10`}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <motion.div
            className="absolute inset-0 rounded-full bg-white/20"
            animate={isPaused ? {} : { scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <Mic size={32} className="text-white" strokeWidth={2} />
        </motion.div>
      </div>

      {/* Frequency visualizer */}
      <div className="flex items-end justify-center gap-1 h-16 mb-6">
        {[...Array(9)].map((_, i) => (
          <motion.div
            key={i}
            className={`w-2 rounded-full ${bgClass}`}
            animate={isPaused ? { height: 8 } : {
              height: [
                8 + Math.random() * 8,
                24 + Math.sin(i * 0.8) * 16,
                12 + Math.cos(i * 0.5) * 12,
                20 + Math.sin(i * 0.3) * 14,
                8 + Math.random() * 8
              ]
            }}
            transition={{
              duration: 1.2 + Math.random() * 0.4,
              repeat: Infinity,
              delay: i * 0.05,
              ease: "easeInOut"
            }}
            style={{ minHeight: 8 }}
          />
        ))}
      </div>

      {/* Command examples */}
      <motion.div
        className="flex flex-wrap justify-center gap-2 max-w-[280px]"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {['"Ponto A"', '"Tempo"', '"Troca"'].map((cmd, i) => (
          <motion.div
            key={cmd}
            className="px-3 py-1.5 rounded-full bg-white/60 dark:bg-white/10 backdrop-blur-sm border border-sky-200 dark:border-sky-800/30"
            animate={isPaused ? {} : {
              scale: [1, 1.05, 1],
              opacity: [0.7, 1, 0.7]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.3
            }}
          >
            <span className="text-xs font-bold text-sky-700 dark:text-sky-300">{cmd}</span>
          </motion.div>
        ))}
      </motion.div>

      {/* Status */}
      <motion.div
        className="flex items-center gap-2 mt-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <motion.div
          className="w-2 h-2 rounded-full bg-emerald-500"
          animate={isPaused ? {} : { scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Comando de Voz
        </span>
      </motion.div>
    </div>
  );
};
