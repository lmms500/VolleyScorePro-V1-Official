/**
 * SkillBalanceScene - Team Balancing Animation
 * Shows skill levels balancing between teams with animated values
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scale, TrendingUp, Sparkles } from 'lucide-react';
import { MotionSceneProps } from './types';

export const SkillBalanceScene: React.FC<MotionSceneProps> = ({ color, isPaused }) => {
  const [phase, setPhase] = useState<'before' | 'balancing' | 'after'>('before');
  
  const beforeTeamA = [90, 95, 85];
  const beforeTeamB = [40, 45, 50];
  const afterTeamA = [70, 72, 68];
  const afterTeamB = [69, 71, 70];
  
  const beforeAvgA = Math.round(beforeTeamA.reduce((a,b) => a+b, 0) / 3);
  const beforeAvgB = Math.round(beforeTeamB.reduce((a,b) => a+b, 0) / 3);
  const afterAvgA = Math.round(afterTeamA.reduce((a,b) => a+b, 0) / 3);
  const afterAvgB = Math.round(afterTeamB.reduce((a,b) => a+b, 0) / 3);

  useEffect(() => {
    if (isPaused) return;
    
    const timer1 = setTimeout(() => setPhase('balancing'), 2000);
    const timer2 = setTimeout(() => setPhase('after'), 3500);
    const timer3 = setTimeout(() => setPhase('before'), 6000);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [phase, isPaused]);

  const TeamCard = ({ 
    skills, 
    avg, 
    label, 
    color, 
    delay 
  }: { 
    skills: number[]; 
    avg: number; 
    label: string; 
    color: string;
    delay: number;
  }) => (
    <motion.div
      className="flex-1 p-3 rounded-xl border"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className={`text-[10px] font-bold ${color}`}>{label}</span>
        <motion.span
          className={`text-lg font-black ${color}`}
          key={avg}
          initial={{ scale: 1.3 }}
          animate={{ scale: 1 }}
        >
          {avg}
        </motion.span>
      </div>
      <div className="flex gap-1">
        {skills.map((skill, i) => (
          <motion.div
            key={i}
            className={`flex-1 h-8 rounded-md ${color.replace('text-', 'bg-')}/40 flex items-center justify-center`}
            initial={{ height: 0 }}
            animate={{ height: 32 }}
            transition={{ delay: delay + i * 0.05 }}
          >
            <span className="text-[10px] font-bold">{skill}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 gap-3">
      {/* Title */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-center gap-2 mb-1">
          <Scale size={16} className={color} />
          <span className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
            Balanceamento por Skill
          </span>
        </div>
        <p className="text-[10px] text-slate-400">A IA equaliza os times automaticamente</p>
      </motion.div>

      {/* Teams comparison */}
      <div className="w-full max-w-[260px]">
        <AnimatePresence mode="wait">
          {phase === 'before' && (
            <motion.div
              key="before"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-2"
            >
              <div className="flex gap-2">
                <TeamCard 
                  skills={beforeTeamA} 
                  avg={beforeAvgA} 
                  label="Time A" 
                  color="text-rose-500"
                  delay={0}
                />
                <TeamCard 
                  skills={beforeTeamB} 
                  avg={beforeAvgB} 
                  label="Time B" 
                  color="text-slate-400"
                  delay={0.1}
                />
              </div>
              <div className="flex items-center justify-center gap-2 py-2">
                <span className="text-[9px] font-bold text-rose-500">❌ Desbalanceado</span>
                <span className="text-[9px] text-slate-400">Diferença: {beforeAvgA - beforeAvgB} pontos</span>
              </div>
            </motion.div>
          )}

          {phase === 'balancing' && (
            <motion.div
              key="balancing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center py-6"
            >
              <motion.div
                className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg"
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles size={24} className="text-white" />
              </motion.div>
              <span className="text-[10px] font-bold text-amber-600 mt-3">Balanceando times...</span>
            </motion.div>
          )}

          {phase === 'after' && (
            <motion.div
              key="after"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-2"
            >
              <div className="flex gap-2">
                <TeamCard 
                  skills={afterTeamA} 
                  avg={afterAvgA} 
                  label="Time A" 
                  color="text-emerald-500"
                  delay={0}
                />
                <TeamCard 
                  skills={afterTeamB} 
                  avg={afterAvgB} 
                  label="Time B" 
                  color="text-emerald-500"
                  delay={0.1}
                />
              </div>
              <div className="flex items-center justify-center gap-2 py-2">
                <span className="text-[9px] font-bold text-emerald-500">✓ Balanceado</span>
                <span className="text-[9px] text-slate-400">Diferença: {Math.abs(afterAvgA - afterAvgB)} pontos</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Balance meter */}
      <motion.div
        className="w-full max-w-[200px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex justify-between text-[9px] text-slate-400 mb-1">
          <span>Índice de Equilíbrio</span>
          <motion.span
            className="font-bold text-emerald-500"
            key={phase === 'after' ? '100%' : '35%'}
          >
            {phase === 'after' ? '92%' : '35%'}
          </motion.span>
        </div>
        <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full"
            animate={{ width: phase === 'after' ? '92%' : '35%' }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </motion.div>
    </div>
  );
};
