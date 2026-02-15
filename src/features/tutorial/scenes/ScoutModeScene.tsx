/**
 * SCENE: Scout Mode - Central player with orbital stat icons
 * Unique: Icons orbit in smooth circle, each with slight bounce
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import { MotionSceneProps } from './types';

export const ScoutModeScene: React.FC<MotionSceneProps> = ({ color, isPaused }) => {
  const statIcons = [
    { icon: '⚡', label: 'ATK', angle: 0, bounce: 'top' },
    { icon: '🛡️', label: 'BLK', angle: 90, bounce: 'right' },
    { icon: '✨', label: 'ACE', angle: 180, bounce: 'bottom' },
    { icon: '🔄', label: 'REC', angle: 270, bounce: 'left' }
  ];

  return (
    <div className="w-full h-full flex items-center justify-center bg-slate-50 dark:bg-white/5 relative overflow-hidden">
      {/* ORBIT CIRCLE - Animated dash */}
      <motion.div
        className="absolute w-40 h-40 rounded-full border-2 border-dashed border-slate-200 dark:border-white/10"
        animate={isPaused ? { rotate: 0, opacity: 0.3 } : { rotate: 360, opacity: [0.3, 0.6, 0.3] }}
        transition={{
          rotate: { duration: 12, repeat: Infinity, ease: 'linear' },
          opacity: { duration: 4, repeat: Infinity, ease: 'easeInOut' }
        }}
      />

      {/* STAT ICONS ORBITING - With unique bounce patterns */}
      {statIcons.map((stat, idx) => {
        const radius = 80;
        const x = Math.cos((stat.angle * Math.PI) / 180) * radius;
        const y = Math.sin((stat.angle * Math.PI) / 180) * radius;

        return (
          <motion.div
            key={`stat-${idx}`}
            className="absolute w-10 h-10 rounded-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-white/20 flex items-center justify-center text-sm font-bold shadow-md z-10 hover:scale-110 transition-transform"
            animate={isPaused ? {
              x: x,
              y: y,
              scale: 1,
              opacity: 1
            } : {
              // Orbital motion
              x: [x, x, x],
              y: [y, y, y],
              // Individual bounce on pass
              scale: [1, 1.3, 1],
              opacity: [0.7, 1, 0.7],
              filter: ['brightness(1)', 'brightness(1.3)', 'brightness(1)']
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              delay: stat.angle / 360 * 12,
              times: [0, 0.25 + idx * 0.08, 0.35 + idx * 0.08],
              ease: 'linear'
            }}
            style={{
              x: x,
              y: y
            }}
          >
            {stat.icon}
          </motion.div>
        );
      })}

      {/* CENTRAL PLAYER - Continuous pulsing with glow */}
      <motion.div
        className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 shadow-lg flex items-center justify-center z-20"
        animate={isPaused ? { scale: 1 } : {
          scale: [1, 1.12, 1],
          boxShadow: [
            '0 0 0px rgba(99,102,241,0)',
            '0 0 25px rgba(99,102,241,0.5)',
            '0 0 0px rgba(99,102,241,0)'
          ]
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      >
        <Users size={24} className="text-white" />
      </motion.div>

      {/* STAT LABELS - Show on hover or loop */}
      {statIcons.map((stat, idx) => {
        const radius = 80;
        const x = Math.cos((stat.angle * Math.PI) / 180) * radius;
        const y = Math.sin((stat.angle * Math.PI) / 180) * radius;
        const offset = stat.angle === 0 ? -30 : stat.angle === 90 ? 30 : stat.angle === 180 ? 30 : -30;

        return (
          <motion.div
            key={`label-${idx}`}
            className="absolute text-xs font-bold text-slate-600 dark:text-slate-300 pointer-events-none"
            animate={isPaused ? { opacity: 0 } : {
              opacity: [0, 0, 1, 1, 0]
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              delay: stat.angle / 360 * 12 + 0.2,
              times: [0, 0.2, 0.3, 0.7, 1]
            }}
            style={{
              left: `calc(50% + ${x + (stat.angle === 0 ? 0 : stat.angle === 90 ? 20 : stat.angle === 180 ? 0 : -20)}px)`,
              top: `calc(50% + ${y + offset}px)`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            {stat.label}
          </motion.div>
        );
      })}
    </div>
  );
};
