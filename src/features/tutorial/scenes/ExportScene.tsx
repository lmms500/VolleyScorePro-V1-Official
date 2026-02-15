/**
 * SCENE: Export - Central file explodes into multiple format icons
 * Unique: Burst pattern with staggered returns
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Download } from 'lucide-react';
import { MotionSceneProps } from './types';

export const ExportScene: React.FC<MotionSceneProps> = ({ color, isPaused }) => {
  const formats = [
    { angle: 0, icon: 'JSON', color: 'text-yellow-500' },
    { angle: 72, icon: 'PDF', color: 'text-red-500' },
    { angle: 144, icon: 'CSV', color: 'text-green-500' },
    { angle: 216, icon: 'XLSX', color: 'text-blue-500' },
    { angle: 288, icon: 'IMG', color: 'text-purple-500' }
  ];

  return (
    <div className="w-full h-full flex items-center justify-center bg-slate-50 dark:bg-white/5 relative overflow-hidden">
      {/* Central file */}
      <motion.div
        className="w-12 h-12 rounded-lg bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-white/20 shadow-lg flex items-center justify-center z-10"
        animate={isPaused ? {} : {
          scale: [1, 0.9, 1],
          boxShadow: [
            '0 0 0px rgba(0,0,0,0.1)',
            '0 0 20px rgba(0,0,0,0.3)',
            '0 0 0px rgba(0,0,0,0.1)'
          ]
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      >
        <Download size={24} className="text-slate-600 dark:text-slate-300" />
      </motion.div>

      {/* Exploding formats */}
      {formats.map((fmt, idx) => {
        const rad = (fmt.angle * Math.PI) / 180;
        const x = Math.cos(rad) * 100;
        const y = Math.sin(rad) * 100;

        return (
          <motion.div
            key={idx}
            className={`absolute w-10 h-10 rounded-lg bg-slate-100 dark:bg-white/10 flex items-center justify-center text-xs font-bold ${fmt.color}`}
            animate={isPaused ? { x: 0, y: 0, opacity: 0 } : {
              x: [0, x, x * 0.8, 0],
              y: [0, y, y * 0.8, 0],
              opacity: [0, 1, 1, 0],
              scale: [0.6, 1, 1, 0.6]
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: idx * 0.1
            }}
          >
            {fmt.icon}
          </motion.div>
        );
      })}
    </div>
  );
};
