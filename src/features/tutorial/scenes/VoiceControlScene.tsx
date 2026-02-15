/**
 * SCENE: Voice Control - Sound waves emanating from microphone
 * Unique: Multiple rings expanding outward with decreasing opacity
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Mic } from 'lucide-react';
import { MotionSceneProps } from './types';

export const VoiceControlScene: React.FC<MotionSceneProps> = ({ color, isPaused }) => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 dark:bg-white/5 relative overflow-hidden px-4 py-6">
      {/* MICROPHONE ICON - Pulsing center */}
      <motion.div
        className="relative z-30 mb-6"
        animate={isPaused ? { scale: 1 } : { scale: [1, 1.15, 1] }}
        transition={{ duration: 0.3, repeat: Infinity, ease: "easeOut", times: [0, 0.5, 1] }}
      >
        <div className="relative">
          <motion.div
            className="absolute inset-0 rounded-full bg-sky-400/20 blur-md"
            animate={isPaused ? { scale: 1 } : { scale: [1, 1.4, 1] }}
            transition={{ duration: 0.3, repeat: Infinity, ease: "easeOut" }}
          />
          <Mic size={36} className="text-sky-600 dark:text-sky-400 relative z-10 drop-shadow-lg" />
        </div>
      </motion.div>

      {/* SOUND WAVE RINGS - Expanding concentric circles */}
      <div className="relative flex items-center justify-center my-6" style={{ width: 130, height: 130 }}>
        {[0, 1, 2, 3].map((ring) => (
          <motion.div
            key={`wave-${ring}`}
            className="absolute rounded-full border border-sky-400"
            animate={isPaused ? { width: 20, height: 20, opacity: 0 } : {
              width: [20, 110],
              height: [20, 110],
              opacity: [0.8, 0],
              borderColor: ['rgba(14, 165, 233, 0.8)', 'rgba(14, 165, 233, 0)']
            }}
            transition={{
              duration: 1.4,
              repeat: Infinity,
              delay: ring * 0.35,
              ease: 'easeOut',
              times: [0, 1]
            }}
          />
        ))}
      </div>

      {/* FREQUENCY BARS - Animated equalizer bars */}
      <div className="flex items-end justify-center gap-1 z-10 mt-2 h-24">
        {[0, 1, 2, 3, 4, 5, 6].map((bar) => (
          <motion.div
            key={`bar-${bar}`}
            className="w-1.5 bg-gradient-to-t from-sky-500 via-sky-400 to-sky-300 rounded-full shadow-lg"
            animate={isPaused ? { height: 12 } : {
              height: [8, 20 + Math.sin(bar) * 6, 12, 20 + Math.cos(bar) * 6, 8],
              opacity: [0.6, 1, 0.8, 1, 0.6]
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: bar * 0.08,
              ease: "easeInOut",
              times: [0, 0.25, 0.5, 0.75, 1]
            }}
          />
        ))}
      </div>

      {/* LABEL */}
      <motion.div
        className="mt-4 text-xs font-bold uppercase tracking-widest text-sky-600 dark:text-sky-300"
        animate={isPaused ? { opacity: 0.5 } : { opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        Listening...
      </motion.div>
    </div>
  );
};
