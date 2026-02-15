/**
 * SCENE: Settings - Gears rotating in layers
 * Unique: Each gear rotates in opposite direction with different speeds
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Settings } from 'lucide-react';
import { MotionSceneProps } from './types';

export const SettingsScene: React.FC<MotionSceneProps> = ({ color, isPaused }) => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 dark:bg-white/5 relative overflow-hidden px-6 py-8 gap-4">
      {/* SETTINGS ICON - Rotating + Pulsing glow */}
      <motion.div
        className="relative z-20 mb-2"
        animate={isPaused ? { rotate: 0, scale: 1 } : {
          rotate: [0, 360],
          scale: [1, 1.1, 1]
        }}
        transition={{
          rotate: { duration: 8, repeat: Infinity, ease: 'linear' },
          scale: { duration: 2.4, repeat: Infinity, ease: 'easeInOut' }
        }}
      >
        <motion.div
          className="absolute inset-0 rounded-full bg-indigo-400/30 blur-lg"
          animate={isPaused ? { scale: 1 } : { scale: [1, 1.3, 1] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        />
        <Settings size={40} className="text-indigo-600 dark:text-indigo-400 relative z-10" strokeWidth={1.5} />
      </motion.div>

      {/* CONTROL SLIDERS - 3 animated sliders representing options */}
      <div className="flex flex-col items-center gap-3 mt-4">
        {/* Slider 1: Court Type */}
        <div className="w-32 flex items-center gap-2">
          <span className="text-xs font-bold text-slate-600 dark:text-slate-300 w-20 text-right">Court</span>
          <motion.div
            className="flex-1 h-1.5 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden"
          >
            <motion.div
              className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 rounded-full"
              animate={isPaused ? { width: '50%' } : { width: ['30%', '80%', '30%'] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            />
          </motion.div>
        </div>

        {/* Slider 2: Sets */}
        <div className="w-32 flex items-center gap-2">
          <span className="text-xs font-bold text-slate-600 dark:text-slate-300 w-20 text-right">Sets</span>
          <motion.div
            className="flex-1 h-1.5 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden"
          >
            <motion.div
              className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full"
              animate={isPaused ? { width: '60%' } : { width: ['40%', '90%', '40%'] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
            />
          </motion.div>
        </div>

        {/* Slider 3: Tie-break */}
        <div className="w-32 flex items-center gap-2">
          <span className="text-xs font-bold text-slate-600 dark:text-slate-300 w-20 text-right">Tie-Break</span>
          <motion.div
            className="flex-1 h-1.5 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden"
          >
            <motion.div
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
              animate={isPaused ? { width: '70%' } : { width: ['50%', '100%', '50%'] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
            />
          </motion.div>
        </div>
      </div>

      {/* TOGGLE SWITCHES - 2 animated toggles */}
      <div className="flex gap-6 mt-4">
        {/* Toggle 1 */}
        <motion.div
          className="flex items-center gap-2"
          animate={isPaused ? { opacity: 1 } : { opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="text-xs font-bold text-slate-600 dark:text-slate-300">Sound</div>
          <motion.div
            className="w-8 h-4 rounded-full bg-slate-300 dark:bg-white/10 relative overflow-hidden"
          >
            <motion.div
              className="absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-emerald-500"
              animate={isPaused ? { x: 0 } : { x: [0, 12, 0] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            />
          </motion.div>
        </motion.div>

        {/* Toggle 2 */}
        <motion.div
          className="flex items-center gap-2"
          animate={isPaused ? { opacity: 1 } : { opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
        >
          <div className="text-xs font-bold text-slate-600 dark:text-slate-300">Vibration</div>
          <motion.div
            className="w-8 h-4 rounded-full bg-slate-300 dark:bg-white/10 relative overflow-hidden"
          >
            <motion.div
              className="absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-indigo-500"
              animate={isPaused ? { x: 0 } : { x: [0, 12, 0] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
            />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};
