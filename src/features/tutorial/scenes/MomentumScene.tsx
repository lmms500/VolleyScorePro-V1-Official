/**
 * SCENE: Momentum - SVG line drawing in real-time, representing growth
 * Unique: Path animates from zero to full, then resets
 */

import React from 'react';
import { motion } from 'framer-motion';
import { MotionSceneProps } from './types';

export const MomentumScene: React.FC<MotionSceneProps> = ({ color, isPaused }) => {
  // Critical match moments
  const criticalMoments = [
    { x: 60, label: 'MP', color: '#dc2626', type: 'match-point' },
    { x: 140, label: 'SP', color: '#f59e0b', type: 'set-point' },
    { x: 240, label: 'TB', color: '#eab308', type: 'tiebreak' }
  ];

  return (
    <div className="w-full h-full flex items-center justify-center bg-slate-50 dark:bg-white/5 relative overflow-hidden">
      <svg viewBox="0 0 300 200" className="w-64 h-40">
        {/* GRID ANIMATION - Fade in sequentially */}
        <motion.g stroke="#cbd5e1" strokeWidth="0.5" opacity="0.4">
          {/* Vertical grid lines */}
          {[0, 50, 100, 150, 200, 250, 300].map((x) => (
            <motion.line
              key={`v${x}`}
              x1={x}
              y1="0"
              x2={x}
              y2="200"
              initial={{ opacity: 0 }}
              animate={isPaused ? { opacity: 0.4 } : { opacity: [0, 0.4, 0.4] }}
              transition={{ delay: 0, duration: 0.5, ease: 'easeOut' }}
            />
          ))}
          {/* Horizontal grid lines */}
          {[0, 50, 100, 150, 200].map((y) => (
            <motion.line
              key={`h${y}`}
              x1="0"
              y1={y}
              x2="300"
              y2={y}
              initial={{ opacity: 0 }}
              animate={isPaused ? { opacity: 0.4 } : { opacity: [0, 0.4, 0.4] }}
              transition={{ delay: 0.05, duration: 0.5, ease: 'easeOut' }}
            />
          ))}
        </motion.g>

        {/* GROWTH CURVE - Smooth drawing */}
        <motion.polyline
          points="0,150 40,120 80,100 120,70 160,50 200,40 240,35 300,30"
          fill="none"
          stroke="#6366f1"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="400"
          animate={isPaused ? { strokeDashoffset: 400 } : {
            strokeDashoffset: [400, 0]
          }}
          transition={{
            duration: 2.0,
            ease: 'easeInOut'
          }}
        />

        {/* AREA UNDER CURVE - Momentum visualization */}
        <motion.path
          d="M 0,150 L 40,120 L 80,100 L 120,70 L 160,50 L 200,40 L 240,35 L 300,30 L 300,200 L 0,200 Z"
          fill="url(#momentumGradient)"
          initial={{ opacity: 0 }}
          animate={isPaused ? { opacity: 0 } : { opacity: [0, 0.15, 0.15] }}
          transition={{ delay: 0.5, duration: 1.5, ease: 'easeOut' }}
        />

        {/* Gradient definition */}
        <defs>
          <linearGradient id="momentumGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* CRITICAL EVENT MARKERS - Pulsing dots */}
        {criticalMoments.map((moment, idx) => (
          <g key={`event-${idx}`}>
            {/* Event dot */}
            <motion.circle
              cx={moment.x}
              cy={moment.type === 'match-point' ? 105 : moment.type === 'set-point' ? 70 : 45}
              r="5"
              fill={moment.color}
              animate={isPaused ? { opacity: 0, scale: 0 } : {
                opacity: [0, 1, 1, 1, 0],
                scale: [0, 1.2, 1, 1, 0]
              }}
              transition={{
                duration: 3.5,
                repeat: Infinity,
                delay: 0.6 + idx * 0.4,
                times: [0, 0.1, 0.3, 0.7, 1],
                ease: 'easeOut'
              }}
            />
            {/* Event label */}
            <motion.text
              x={moment.x}
              y={moment.type === 'match-point' ? 95 : moment.type === 'set-point' ? 60 : 35}
              textAnchor="middle"
              fontSize="10"
              fontWeight="bold"
              fill={moment.color}
              animate={isPaused ? { opacity: 0 } : {
                opacity: [0, 1, 1, 1, 0]
              }}
              transition={{
                duration: 3.5,
                repeat: Infinity,
                delay: 0.6 + idx * 0.4,
                times: [0, 0.1, 0.3, 0.7, 1],
                ease: 'easeOut'
              }}
            >
              {moment.label}
            </motion.text>
          </g>
        ))}

        {/* DATA POINTS - Sequential appearance */}
        {[0, 40, 80, 120, 160, 200, 240, 300].map((x, idx) => {
          const points = [150, 120, 100, 70, 50, 40, 35, 30];
          return (
            <motion.circle
              key={`point-${idx}`}
              cx={x}
              cy={points[idx]}
              r="3.5"
              fill="#6366f1"
              animate={isPaused ? { opacity: 0, scale: 0 } : {
                opacity: [0, 1, 1, 0.5],
                scale: [0, 1.3, 1, 1]
              }}
              transition={{
                duration: 3.5,
                repeat: Infinity,
                delay: 0.5 + idx * 0.08,
                times: [0, 0.05, 0.65, 0.8],
                ease: 'easeOut'
              }}
            />
          );
        })}
      </svg>
    </div>
  );
};
