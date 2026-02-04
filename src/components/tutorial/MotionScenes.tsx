/**
 * MotionScenes - Micro-Experiências Visuais Animadas
 * 
 * Cada cena representa uma parte do aplicativo com animações únicas e loops perfeitos.
 * Sem repetição de padrões - cada parte tem sua própria animação.
 */

import React from 'react';
import { motion } from 'framer-motion';
import {
  Users, ArrowRightLeft, RefreshCw, Scale, List, 
  BarChart3, Zap, Download, Mic, Settings, Layout
} from 'lucide-react';

interface MotionSceneProps {
  color: string;
  isPaused: boolean;
}

// ============================================================================
// TEAM MANAGER SCENES
// ============================================================================

/**
 * SCENE: Team Composition - Shows how court, bench and queue work
 * Unique: 3 group boxes highlight sequentially (Court→Bench→Queue) with player animations
 */
export const TeamCompositionScene: React.FC<MotionSceneProps> = ({ color, isPaused }) => {
  const groups = [
    { label: 'Quadra Ativa', count: 6, color: 'blue', start: 1, timing: [0, 0.2, 0.28] },
    { label: 'Banco de Reservas', count: 4, color: 'amber', start: 7, timing: [0.3, 0.5, 0.58] },
    { label: 'Fila', count: 3, color: 'slate', start: 11, timing: [0.6, 0.8, 0.88] }
  ];

  return (
    <div className="w-full h-full flex items-center justify-center bg-slate-50 dark:bg-white/5 relative overflow-hidden">
      <div className="space-y-4 w-full max-w-xs px-4">
        {groups.map((group, groupIdx) => {
          const bgClass = `bg-${group.color}-50 dark:bg-${group.color}-500/10`;
          const borderClass = `border-${group.color}-400`;
          const dotClass = `bg-${group.color}-500`;
          const playerClass = `bg-${group.color}-400`;
          const textClass = `text-${group.color}-700 dark:text-${group.color}-300`;
          const glowColor = group.color === 'blue' ? 'rgba(59,130,246,' : group.color === 'amber' ? 'rgba(251,146,60,' : 'rgba(148,163,184,';

          return (
            <motion.div
              key={group.label}
              className={`p-4 rounded-xl border-2 ${borderClass} ${bgClass}`}
              animate={isPaused ? { scale: 1 } : {
                boxShadow: [
                  `0 0 0px ${glowColor}0)`,
                  `0 0 20px ${glowColor}0.6)`,
                  `0 0 0px ${glowColor}0)`,
                  `0 0 0px ${glowColor}0)`,
                  `0 0 0px ${glowColor}0)`
                ],
                scale: [1, 1.02, 1.02, 1, 1]
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity, 
                times: group.timing,
                ease: 'easeInOut'
              }}
            >
              {/* GROUP HEADER */}
              <div className="flex items-center gap-2 mb-3">
                <motion.div
                  className={`w-4 h-4 rounded-full ${dotClass}`}
                  animate={isPaused ? { scale: 1 } : {
                    scale: [1, 1.3, 1]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    times: group.timing,
                    ease: 'easeOut'
                  }}
                />
                <span className={`text-xs font-bold ${textClass} uppercase tracking-wider`}>{group.label}</span>
              </div>

              {/* PLAYER NUMBERS - Staggered entrance */}
              <div className="flex flex-wrap gap-2">
                {[...Array(group.count)].map((_, i) => (
                  <motion.div
                    key={i}
                    className={`w-8 h-8 rounded-full ${playerClass} flex items-center justify-center text-white text-xs font-bold shadow-md`}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={isPaused ? { scale: 1, opacity: 1 } : {
                      scale: [0, 1.15, 1],
                      opacity: [0, 1, 1],
                      rotate: [180, 0, 0]
                    }}
                    transition={{
                      duration: 0.5,
                      delay: group.timing[0] * 4 + i * 0.08,
                      ease: 'easeOut'
                    }}
                  >
                    {group.start + i}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

/**
 * SCENE: Player Stats - Card showing player career statistics
 * Unique: Stats bars animate with glowing effect
 */
export const PlayerStatsScene: React.FC<MotionSceneProps> = ({ color, isPaused }) => {
  const stats = [
    { label: 'Ataque', value: 85, icon: '⚡', color: 'from-orange-500 to-red-500' },
    { label: 'Defesa', value: 72, icon: '🛡️', color: 'from-blue-500 to-cyan-500' },
    { label: 'Levantamento', value: 68, icon: '🔄', color: 'from-purple-500 to-pink-500' }
  ];

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 dark:bg-white/5 relative overflow-hidden px-6 py-8">
      {/* PLAYER HEADER CARD */}
      <motion.div
        className="w-full max-w-sm p-6 rounded-2xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-white/10 shadow-lg mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={isPaused ? { opacity: 1, y: 0 } : {
          opacity: 1,
          y: 0,
          boxShadow: [
            '0 10px 25px -5px rgba(0,0,0,0.1)',
            '0 20px 30px -5px rgba(0,0,0,0.15)',
            '0 10px 25px -5px rgba(0,0,0,0.1)'
          ]
        }}
        transition={{ 
          opacity: { duration: 0.5 },
          y: { duration: 0.5 },
          boxShadow: { duration: 3, repeat: Infinity, ease: 'easeInOut' }
        }}
      >
        <div className="flex items-center gap-4 mb-4">
          {/* AVATAR WITH GLOW */}
          <motion.div
            className="relative flex-shrink-0"
            animate={isPaused ? { scale: 1 } : { scale: [1, 1.08, 1] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <motion.div
              className="absolute inset-0 rounded-full bg-violet-400/30 blur-lg"
              animate={isPaused ? { scale: 1 } : { scale: [1, 1.3, 1] }}
              transition={{ duration: 2.4, repeat: Infinity }}
            />
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center relative z-10 shadow-lg border-2 border-violet-700">
              <Users size={28} className="text-white" />
            </div>
          </motion.div>

          <div className="flex-1">
            <div className="font-bold text-slate-800 dark:text-white text-sm">João Silva</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Ponteiro #1</div>
            <motion.div
              className="text-xs font-semibold text-violet-600 dark:text-violet-400 mt-1"
              animate={isPaused ? { opacity: 0.6 } : { opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2.4, repeat: Infinity }}
            >
              Habilidade Geral: 75%
            </motion.div>
          </div>
        </div>

        {/* SKILL BARS - 3 attributes */}
        <div className="space-y-4">
          {stats.map((stat, idx) => (
            <motion.div 
              key={stat.label} 
              className="space-y-1.5"
              initial={{ opacity: 0, x: -10 }}
              animate={isPaused ? { opacity: 1, x: 0 } : { opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.2 }}
            >
              {/* LABEL + VALUE */}
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <span>{stat.icon}</span>
                  {stat.label}
                </span>
                <motion.span
                  className="font-bold text-slate-800 dark:text-white text-sm tabular-nums"
                  animate={isPaused ? { scale: 1 } : {
                    scale: [0.8, 1.2, 1],
                  }}
                  transition={{
                    duration: 1.0,
                    repeat: Infinity,
                    delay: 0.5 + idx * 0.3,
                    times: [0, 0.4, 0.5],
                    ease: 'easeOut'
                  }}
                >
                  {stat.value}%
                </motion.span>
              </div>

              {/* STAT BAR CONTAINER */}
              <div className="w-full h-2.5 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden relative">
                <motion.div
                  className={`h-full bg-gradient-to-r ${stat.color} rounded-full shadow-md`}
                  initial={{ width: '0%' }}
                  animate={isPaused ? { width: `${stat.value}%` } : {
                    width: ['0%', `${stat.value}%`, `${stat.value}%`]
                  }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    delay: 0.5 + idx * 0.3,
                    times: [0, 0.35, 0.65],
                    ease: 'easeOut'
                  }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* STATUS BADGE */}
      <motion.div
        className="flex items-center gap-2 text-xs"
        animate={isPaused ? { opacity: 0.5 } : { opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2.4, repeat: Infinity }}
      >
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="font-semibold text-slate-600 dark:text-slate-300">Jogador Ativo</span>
      </motion.div>
    </div>
  );
};

/**
 * SCENE: Drag & Drop - Card sliding into a slot with magnetic snap
 * Unique loop: No repeated patterns, just one perfect drag cycle
 */
export const DragDropScene: React.FC<MotionSceneProps> = ({ color, isPaused }) => {
  const bgClass = color.replace('text-', 'bg-');
  
  return (
    <div className="w-full h-full flex items-center justify-center bg-slate-50 dark:bg-white/5 relative overflow-hidden">
      {/* TARGET SLOT - Clean feedback, sem overlapping */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        {/* Main slot */}
        <motion.div
          className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-300 dark:border-white/20 flex items-center justify-center relative z-10 bg-white/5 dark:bg-white/5"
          animate={isPaused ? { scale: 1 } : { 
            scale: [1, 1.06, 1.06, 1],
            borderColor: ['#cbd5e1', '#6366f1', '#6366f1', '#cbd5e1'],
            boxShadow: [
              '0 0 0px rgba(99,102,241,0)',
              '0 0 24px rgba(99,102,241,0.5)',
              '0 0 24px rgba(99,102,241,0.3)',
              '0 0 0px rgba(99,102,241,0)'
            ]
          }}
          transition={{ 
            duration: 4.8,
            repeat: Infinity, 
            ease: 'easeInOut',
            times: [0, 0.3, 0.55, 1]
          }}
        >
          <Zap size={24} className="text-slate-400 dark:text-white/30" />
        </motion.div>
      </div>

      {/* DRAGGABLE CARD - Clean approach + snap */}
      <motion.div
        className={`absolute w-20 h-20 rounded-xl ${bgClass} shadow-lg flex items-center justify-center cursor-grab active:cursor-grabbing z-20`}
        initial={{ x: -120, opacity: 0, rotate: 0 }}
        animate={isPaused ? { x: -120, opacity: 0, rotate: 0 } : {
          x: [-120, -40, 0, 0, -120],
          opacity: [0, 1, 1, 1, 0],
          scale: [0.8, 0.95, 1.05, 1, 0.8],
          rotate: [20, 8, -3, 0, 20]
        }}
        transition={{
          duration: 4.8,
          repeat: Infinity,
          ease: 'easeInOut',
          times: [0, 0.25, 0.35, 0.6, 1]
        }}
      >
        <Users size={28} className="text-white" />
      </motion.div>

      {/* SNAP FEEDBACK - Checkmark appears on completion */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        initial={{ scale: 0, opacity: 0 }}
        animate={isPaused ? { scale: 0, opacity: 0 } : {
          scale: [0, 1.3, 1, 1, 0],
          opacity: [0, 1, 1, 1, 0]
        }}
        transition={{
          duration: 4.8,
          repeat: Infinity,
          times: [0, 0.55, 0.65, 0.8, 1],
          ease: 'easeOut'
        }}
      >
        <div className="flex items-center justify-center w-8 h-8 bg-emerald-500 rounded-full">
          <div className="text-white text-sm font-bold">✓</div>
        </div>
      </motion.div>
    </div>
  );
};

/**
 * SCENE: Substitution/Swap - Two cards exchanging positions with rotation
 * Unique: Cards swap with opposite rotations, creating a dance pattern
 */
export const SubstitutionScene: React.FC<MotionSceneProps> = ({ color, isPaused }) => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 dark:bg-white/5 relative overflow-hidden px-4 py-6 gap-4">
      {/* TITLE */}
      <motion.div
        className="text-xs font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300"
        animate={isPaused ? { opacity: 0.5 } : { opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        Substituição de Jogador
      </motion.div>

      {/* PLAYER SWAP VISUALIZATION */}
      <div className="flex items-center justify-center gap-6 w-full">
        {/* OUTGOING PLAYER - Left side */}
        <motion.div
          className="flex flex-col items-center gap-2"
          animate={isPaused ? { x: 0, opacity: 1 } : {
            x: [0, -20, -40, 20, 0],
            opacity: [1, 1, 0.3, 1, 1],
            scale: [1, 1.05, 0.9, 1.1, 1]
          }}
          transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', times: [0, 0.25, 0.5, 0.75, 1] }}
        >
          <motion.div
            className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center border-3 border-red-700 shadow-lg"
            animate={isPaused ? { scale: 1 } : { scale: [1, 1.08, 1] }}
            transition={{ duration: 2.8, repeat: Infinity }}
          >
            <Users size={32} className="text-white" />
          </motion.div>
          <div className="text-center">
            <div className="text-xs font-bold text-red-600 dark:text-red-400">SAI</div>
            <div className="text-2xl font-bold text-slate-800 dark:text-slate-200 tabular-nums">#7</div>
          </div>
        </motion.div>

        {/* SWAP ANIMATION - Center */}
        <motion.div
          className="flex flex-col items-center gap-1"
          animate={isPaused ? { opacity: 0 } : { opacity: [0, 0, 1, 1, 0] }}
          transition={{ duration: 2.8, repeat: Infinity, times: [0, 0.4, 0.5, 0.75, 1] }}
        >
          <motion.div
            animate={isPaused ? { x: 0 } : { x: [-4, 4, -4] }}
            transition={{ duration: 0.4, repeat: Infinity }}
          >
            <ArrowRightLeft size={32} className="text-emerald-500" strokeWidth={2.5} />
          </motion.div>
          <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Swap</div>
        </motion.div>

        {/* INCOMING PLAYER - Right side */}
        <motion.div
          className="flex flex-col items-center gap-2"
          animate={isPaused ? { x: 0, opacity: 1 } : {
            x: [0, 20, 40, -20, 0],
            opacity: [1, 1, 0.3, 1, 1],
            scale: [1, 1.05, 0.9, 1.1, 1]
          }}
          transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', times: [0, 0.25, 0.5, 0.75, 1] }}
        >
          <motion.div
            className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center border-3 border-emerald-700 shadow-lg"
            animate={isPaused ? { scale: 1 } : { scale: [1, 1.08, 1] }}
            transition={{ duration: 2.8, repeat: Infinity }}
          >
            <Users size={32} className="text-white" />
          </motion.div>
          <div className="text-center">
            <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">ENTRA</div>
            <div className="text-2xl font-bold text-slate-800 dark:text-slate-200 tabular-nums">#14</div>
          </div>
        </motion.div>
      </div>

      {/* SUCCESS INDICATOR */}
      <motion.div
        className="flex items-center gap-2"
        animate={isPaused ? { opacity: 0 } : { opacity: [0, 0, 0, 1, 1, 0] }}
        transition={{ duration: 2.8, repeat: Infinity, times: [0, 0.5, 0.65, 0.75, 0.95, 1] }}
      >
        <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
          <div className="text-white text-sm font-bold">✓</div>
        </div>
        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Substituição efetiva</span>
      </motion.div>
    </div>
  );
};

/**
 * SCENE: Rotation - Players orbiting in a circle carousel
 * Unique: Each player appears at different angles in smooth circle
 */
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

/**
 * SCENE: Skill Balance - Comparison of unbalanced vs balanced teams
 * Unique: Shows before (red) → balancing process → after (green)
 */
export const SkillBalanceScene: React.FC<MotionSceneProps> = ({ color, isPaused }) => {
  const beforeTeam = [
    { label: 'Equipe A', skills: [90, 95, 85], balance: 'Desbalanceada' },
    { label: 'Equipe B', skills: [45, 40, 50], balance: 'Fraca' }
  ];

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 dark:bg-white/5 relative overflow-hidden px-4 py-6 gap-4">
      {/* TITLE */}
      <motion.div
        className="text-xs font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300"
        animate={isPaused ? { opacity: 0.5 } : { opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        Balanceamento de Habilidades
      </motion.div>

      {/* BEFORE → AFTER COMPARISON */}
      <div className="flex items-center justify-center gap-4 w-full max-w-sm">
        {/* BEFORE (UNBALANCED) */}
        <motion.div
          className="flex-1 p-4 rounded-xl bg-slate-100 dark:bg-white/5 border-2 border-red-500/50"
          animate={isPaused ? { opacity: 1 } : {
            opacity: [1, 1, 0.5, 1],
            scale: [1, 1, 0.95, 1]
          }}
          transition={{ duration: 3.2, repeat: Infinity, times: [0, 0.4, 0.6, 1] }}
        >
          <div className="text-xs font-bold text-red-600 dark:text-red-400 mb-3 uppercase">Antes</div>
          
          {beforeTeam.map((team, idx) => (
            <div key={team.label} className="mb-3 last:mb-0">
              <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{team.label}</div>
              <div className="flex gap-1">
                {team.skills.map((skill, skillIdx) => (
                  <motion.div
                    key={skillIdx}
                    className="flex-1 h-6 rounded-sm bg-red-500/40 border border-red-600 flex items-center justify-center"
                    animate={isPaused ? {} : {
                      opacity: [0.6, 1, 0.6]
                    }}
                    transition={{
                      duration: 3.2,
                      repeat: Infinity,
                      delay: skillIdx * 0.1,
                      times: [0, 0.4, 1]
                    }}
                  >
                    <span className="text-xs font-bold text-red-700 dark:text-red-300">{skill}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}

          <motion.div
            className="text-xs text-red-600 dark:text-red-400 font-semibold mt-2"
            animate={isPaused ? { opacity: 0.5 } : { opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 3.2, repeat: Infinity }}
          >
            ❌ Desbalanceado
          </motion.div>
        </motion.div>

        {/* TRANSFORMATION ARROW */}
        <motion.div
          className="flex flex-col items-center gap-1"
          animate={isPaused ? { opacity: 0 } : { opacity: [0, 0, 1, 1, 0] }}
          transition={{ duration: 3.2, repeat: Infinity, times: [0, 0.4, 0.5, 0.75, 1] }}
        >
          <ArrowRightLeft size={20} className="text-amber-500" strokeWidth={2.5} />
          <span className="text-xs font-bold text-amber-600 dark:text-amber-400 whitespace-nowrap">Balanceia</span>
        </motion.div>

        {/* AFTER (BALANCED) */}
        <motion.div
          className="flex-1 p-4 rounded-xl bg-slate-100 dark:bg-white/5 border-2 border-emerald-500/50"
          animate={isPaused ? { opacity: 1 } : {
            opacity: [0.5, 0.5, 1, 1],
            scale: [1, 1, 1.05, 1]
          }}
          transition={{ duration: 3.2, repeat: Infinity, times: [0, 0.4, 0.6, 1] }}
        >
          <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-3 uppercase">Depois</div>
          
          {beforeTeam.map((team, idx) => (
            <div key={team.label} className="mb-3 last:mb-0">
              <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{team.label}</div>
              <div className="flex gap-1">
                {[70, 72, 68].map((skill, skillIdx) => (
                  <motion.div
                    key={skillIdx}
                    className="flex-1 h-6 rounded-sm bg-emerald-500/40 border border-emerald-600 flex items-center justify-center"
                    animate={isPaused ? {} : {
                      opacity: [0.6, 1, 0.6]
                    }}
                    transition={{
                      duration: 3.2,
                      repeat: Infinity,
                      delay: skillIdx * 0.1,
                      times: [0.4, 0.6, 1]
                    }}
                  >
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">{skill}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}

          <motion.div
            className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-2"
            animate={isPaused ? { opacity: 0.5 } : { opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 3.2, repeat: Infinity, delay: 0.5 }}
          >
            ✓ Balanceado
          </motion.div>
        </motion.div>
      </div>

      {/* BALANCE SCORE INDICATOR */}
      <motion.div
        className="flex items-center gap-2 text-xs"
        animate={isPaused ? { opacity: 0.5 } : { opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2.4, repeat: Infinity, delay: 0.8 }}
      >
        <Scale size={16} className="text-emerald-500" />
        <span className="font-semibold text-slate-600 dark:text-slate-300">Índice de Balanceamento: 92%</span>
      </motion.div>
    </div>
  );
};

/**
 * SCENE: Batch Input - Text lines transforming into player avatars
 * Unique: Each line transforms sequentially with staggered timing
 */
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

// ============================================================================
// HISTORY & ANALYTICS SCENES
// ============================================================================

/**
 * SCENE: Momentum - SVG line drawing in real-time, representing growth
 * Unique: Path animates from zero to full, then resets
 */
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

/**
 * SCENE: Scout Mode - Central player with orbital stat icons
 * Unique: Icons orbit in smooth circle, each with slight bounce
 */
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

/**
 * SCENE: Export - Central file explodes into multiple format icons
 * Unique: Burst pattern with staggered returns
 */
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

// ============================================================================
// CONFIGURATION & SYSTEM SCENES
// ============================================================================

/**
 * SCENE: Voice Control - Sound waves emanating from microphone
 * Unique: Multiple rings expanding outward with decreasing opacity
 */
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

/**
 * SCENE: Settings - Gears rotating in layers
 * Unique: Each gear rotates in opposite direction with different speeds
 */
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
