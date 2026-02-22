import React from 'react';
import { motion } from 'framer-motion';
import { Share2, FileSpreadsheet, Image, FileJson, History, TrendingUp, Clock, ChevronRight } from 'lucide-react';
import { VisualProps } from './types';

export const SceneHistorySummary = ({ color, isPaused }: VisualProps) => {
  const matches = [
    { teamA: 'Time A', scoreA: 3, teamB: 'Time B', scoreB: 1, date: 'Hoje' },
    { teamA: 'Vermelho', scoreA: 2, teamB: 'Azul', scoreB: 3, date: 'Ontem' },
    { teamA: 'Alfa', scoreA: 3, teamB: 'Beta', scoreB: 0, date: '2 dias' },
  ];

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 gap-3">
      {/* Title */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-center gap-2 mb-1">
          <History size={16} className={color} />
          <span className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
            Histórico de Partidas
          </span>
        </div>
        <p className="text-[10px] text-slate-400">Toque para ver análise completa</p>
      </motion.div>

      {/* Match list */}
      <div className="w-full max-w-[240px] space-y-2">
        {matches.map((match, idx) => (
          <motion.div
            key={idx}
            className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ scale: 1.02 }}
          >
            {/* Score */}
            <div className="flex items-center gap-2 flex-1">
              <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 truncate w-14">
                {match.teamA}
              </span>
              <div className="flex items-center gap-1">
                <span className={`text-lg font-black ${match.scoreA > match.scoreB ? 'text-emerald-500' : 'text-slate-400'}`}>
                  {match.scoreA}
                </span>
                <span className="text-[10px] text-slate-400">×</span>
                <span className={`text-lg font-black ${match.scoreB > match.scoreA ? 'text-emerald-500' : 'text-slate-400'}`}>
                  {match.scoreB}
                </span>
              </div>
              <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 truncate w-14 text-right">
                {match.teamB}
              </span>
            </div>
            
            {/* Date */}
            <span className="text-[9px] text-slate-400">{match.date}</span>
            
            {/* Arrow */}
            <ChevronRight size={14} className="text-slate-300" />
          </motion.div>
        ))}
      </div>

      {/* Stats summary */}
      <motion.div
        className="flex items-center gap-4 text-[9px] text-slate-500"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center gap-1">
          <TrendingUp size={10} />
          <span>Gráfico de Momentum</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock size={10} />
          <span>Duração e Sets</span>
        </div>
      </motion.div>
    </div>
  );
};

export const SceneMomentum = ({ color, isPaused }: VisualProps) => {
  return (
    <div className="w-full h-full flex items-center justify-center bg-slate-50 dark:bg-white/5 relative overflow-hidden">
      <svg viewBox="0 0 200 100" className="w-40 h-20">
        <defs>
          <linearGradient id="momentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#f43f5e" />
          </linearGradient>
        </defs>
        <line x1="0" y1="50" x2="200" y2="50" stroke="#e2e8f0" strokeWidth="0.5" strokeDasharray="4 4" />
        <motion.path
          d="M 0 50 Q 50 10, 100 50 T 200 50"
          fill="none"
          stroke="url(#momentGrad)"
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={isPaused ? {} : { pathLength: [0, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
      </svg>
    </div>
  );
};

export const SceneScout = ({ color, isPaused }: VisualProps) => {
  const items = ["ATK", "BLK", "ACE"];

  return (
    <div className="w-full h-full flex items-center justify-center bg-slate-50 dark:bg-white/5 relative overflow-hidden">
      <div className="w-12 h-12 rounded-full bg-white dark:bg-slate-800 shadow-md flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-slate-200 dark:border-slate-600" />
      </div>
      {items.map((label, i) => {
        const angle = (i * 120 - 90) * (Math.PI / 180);
        return (
          <motion.div
            key={i}
            className="absolute w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center text-[8px] font-bold shadow-md"
            initial={{ x: 0, y: 0 }}
            animate={isPaused ? {} : {
              x: Math.cos(angle) * 50,
              y: Math.sin(angle) * 50
            }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
          >
            {label}
          </motion.div>
        );
      })}
    </div>
  );
};

export const SceneExport = ({ color, isPaused }: VisualProps) => {
  return (
    <div className="w-full h-full flex items-center justify-center bg-slate-50 dark:bg-white/5 relative overflow-hidden">
      <motion.div
        className="w-14 h-14 rounded-xl bg-white dark:bg-slate-800 shadow-lg flex items-center justify-center"
        animate={isPaused ? {} : { scale: [1, 0.9, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <Share2 size={20} className={color} />
      </motion.div>
      {['JSON', 'CSV', 'IMG'].map((fmt, i) => {
        const angle = (i * 120 - 90) * (Math.PI / 180);
        return (
          <motion.div
            key={i}
            className="absolute w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-[8px] font-bold text-slate-600 dark:text-slate-300"
            animate={isPaused ? { x: 0, y: 0, opacity: 0 } : {
              x: [0, Math.cos(angle) * 50],
              y: [0, Math.sin(angle) * 50],
              opacity: [0, 1, 0]
            }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.3 + i * 0.1 }}
          >
            {fmt}
          </motion.div>
        );
      })}
    </div>
  );
};
