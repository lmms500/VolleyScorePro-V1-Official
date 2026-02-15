/**
 * SCENE: Batch Input - Text lines transforming into player avatars
 * Unique: Each line transforms sequentially with staggered timing
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import { MotionSceneProps } from './types';

export const BatchInputScene: React.FC<MotionSceneProps> = ({ color, isPaused }) => {
  const bgClass = color.replace('text-', 'bg-');

  return (
    <div className="w-full h-full flex items-center justify-center bg-slate-50 dark:bg-white/5 relative">
      <div className="space-y-3">
        {[0, 1, 2].map((idx) => (
          <motion.div
            key={idx}
            className="flex items-center gap-3"
            initial={{ opacity: 1 }}
            animate={isPaused ? { opacity: 1 } : {
              opacity: [1, 1, 0],
              x: [0, 0, 40]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: idx * 0.4,
              times: [0, 0.6, 1],
              ease: 'easeInOut'
            }}
          >
            {/* Input field representation */}
            <div className="w-32 h-8 bg-slate-200 dark:bg-white/10 rounded-lg flex items-center px-3">
              <div className="text-xs text-slate-400">Player {idx + 1}...</div>
            </div>

            {/* Arrow */}
            <motion.div
              animate={isPaused ? {} : { opacity: [0, 1, 0] }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: idx * 0.4,
                times: [0, 0.3, 0.6]
              }}
            >
              <Zap size={16} className={color} />
            </motion.div>
          </motion.div>
        ))}

        {/* Output avatars */}
        <motion.div
          className="mt-6 flex gap-2 justify-center"
          initial={{ opacity: 0 }}
          animate={isPaused ? { opacity: 0 } : {
            opacity: [0, 1, 1],
            scale: [0.8, 1, 1]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            times: [0, 0.65, 1],
            ease: 'easeInOut'
          }}
        >
          {[0, 1, 2].map((idx) => (
            <motion.div
              key={idx}
              className={`w-10 h-10 rounded-full ${bgClass} shadow-md flex items-center justify-center`}
              animate={isPaused ? {} : {
                scale: [0.8, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: idx * 0.1,
                repeatDelay: 2.4
              }}
            >
              <div className="w-2 h-2 bg-white rounded-full" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};
