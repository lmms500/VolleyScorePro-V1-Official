/**
 * MomentumScene - Match Flow Animation
 * Compact momentum graph visualization
 */

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Flame } from 'lucide-react';
import { MotionSceneProps } from './types';

export const MomentumScene: React.FC<MotionSceneProps> = ({ color, isPaused }) => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 gap-3">
      {/* Title */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-center gap-2 mb-1">
          <TrendingUp size={16} className={color} />
          <span className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
            Fluxo da Partida
          </span>
        </div>
        <p className="text-[10px] text-slate-400">Visualize o momentum e momentos decisivos</p>
      </motion.div>

      {/* Graph container */}
      <motion.div
        className="w-full max-w-[260px] bg-white/80 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg p-3"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <svg viewBox="0 0 240 100" className="w-full h-20">
          <defs>
            <linearGradient id="momentumAreaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="momentumLineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#f43f5e" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <g stroke="#e2e8f0" strokeWidth="0.5" opacity="0.5">
            <line x1="20" y1="25" x2="220" y2="25" strokeDasharray="3 3" />
            <line x1="20" y1="50" x2="220" y2="50" strokeDasharray="3 3" />
            <line x1="20" y1="75" x2="220" y2="75" strokeDasharray="3 3" />
          </g>

          {/* Area under curve */}
          <motion.path
            d="M 20,80 L 50,70 L 80,55 L 120,45 L 160,35 L 200,25 L 220,20 L 220,90 L 20,90 Z"
            fill="url(#momentumAreaGrad)"
            initial={{ opacity: 0 }}
            animate={{ opacity: isPaused ? 0.5 : [0, 0.5, 0.5] }}
            transition={{ duration: 1.5 }}
          />

          {/* Main line */}
          <motion.path
            d="M 20,80 L 50,70 L 80,55 L 120,45 L 160,35 L 200,25 L 220,20"
            fill="none"
            stroke="url(#momentumLineGrad)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: isPaused ? 1 : [0, 1] }}
            transition={{ duration: 2, ease: "easeInOut" }}
          />

          {/* Data points */}
          {[
            { x: 20, y: 80 },
            { x: 50, y: 70 },
            { x: 80, y: 55 },
            { x: 120, y: 45 },
            { x: 160, y: 35 },
            { x: 200, y: 25 },
            { x: 220, y: 20 }
          ].map((point, idx) => (
            <motion.circle
              key={idx}
              cx={point.x}
              cy={point.y}
              r={idx === 6 ? 5 : 3}
              fill={idx === 6 ? '#f43f5e' : '#6366f1'}
              initial={{ scale: 0 }}
              animate={{ scale: 1, opacity: idx === 6 ? 1 : 0.7 }}
              transition={{ delay: 0.3 + idx * 0.08 }}
            />
          ))}

          {/* Match Point marker */}
          <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
          >
            <line
              x1="200"
              y1="25"
              x2="200"
              y2="90"
              stroke="#f43f5e"
              strokeWidth="1"
              strokeDasharray="3 2"
            />
            <text
              x="200"
              y="15"
              textAnchor="middle"
              fontSize="7"
              fontWeight="bold"
              fill="#f43f5e"
            >
              MP
            </text>
          </motion.g>
        </svg>

        {/* Labels */}
        <div className="flex justify-between px-1 mt-1">
          <span className="text-[9px] font-bold text-slate-400">Início</span>
          <span className="text-[9px] font-bold text-rose-500">Match Point</span>
        </div>
      </motion.div>

      {/* Legend */}
      <motion.div
        className="flex items-center gap-4 text-[9px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-rose-500" />
          <span className="text-slate-500 font-medium">Momentum</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Flame size={10} className="text-rose-500" />
          <span className="text-slate-500 font-medium">Momentos decisivos</span>
        </div>
      </motion.div>

      {/* Description */}
      <motion.div
        className="text-center max-w-[240px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <p className="text-[9px] text-slate-400">
          O gráfico mostra quando o jogo virou e os pontos críticos da partida
        </p>
      </motion.div>
    </div>
  );
};
