/**
 * ExportScene - Premium Data Export Animation
 * Apple-quality export visualization with format burst
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Download, FileJson, FileSpreadsheet, Image, Share2, Check } from 'lucide-react';
import { MotionSceneProps } from './types';

const FormatCard = ({ 
  icon: Icon, 
  label, 
  color, 
  bgGradient, 
  angle, 
  delay,
  isPaused 
}: { 
  icon: React.ElementType; 
  label: string; 
  color: string; 
  bgGradient: string; 
  angle: number; 
  delay: number;
  isPaused: boolean;
}) => {
  const radius = 90;
  const rad = (angle * Math.PI) / 180;
  const x = Math.cos(rad) * radius;
  const y = Math.sin(rad) * radius;

  return (
    <motion.div
      className="absolute left-1/2 top-1/2"
      initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
      animate={isPaused ? { x: 0, y: 0, scale: 0, opacity: 0 } : {
        x: [0, x * 0.3, x, x * 0.8, 0],
        y: [0, y * 0.3, y, y * 0.8, 0],
        scale: [0, 1.1, 1, 0.9, 0],
        opacity: [0, 1, 1, 1, 0]
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        delay,
        ease: "easeInOut"
      }}
    >
      <motion.div
        className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${bgGradient} shadow-xl flex flex-col items-center justify-center gap-1 -translate-x-1/2 -translate-y-1/2`}
        animate={isPaused ? {} : {
          boxShadow: [
            '0 4px 15px -3px rgba(0,0,0,0.2)',
            '0 10px 30px -5px rgba(0,0,0,0.3)',
            '0 4px 15px -3px rgba(0,0,0,0.2)'
          ]
        }}
        transition={{ duration: 2, repeat: Infinity, delay }}
      >
        <Icon size={18} className={color} />
        <span className={`text-[8px] font-bold ${color} uppercase`}>{label}</span>
      </motion.div>
    </motion.div>
  );
};

export const ExportScene: React.FC<MotionSceneProps> = ({ color, isPaused }) => {
  const formats = [
    { icon: FileJson, label: 'JSON', color: 'text-amber-600', bgGradient: 'from-amber-100 to-amber-200 dark:from-amber-900/50 dark:to-amber-800/50', angle: -90 },
    { icon: FileSpreadsheet, label: 'CSV', color: 'text-emerald-600', bgGradient: 'from-emerald-100 to-emerald-200 dark:from-emerald-900/50 dark:to-emerald-800/50', angle: -18 },
    { icon: Image, label: 'IMG', color: 'text-violet-600', bgGradient: 'from-violet-100 to-violet-200 dark:from-violet-900/50 dark:to-violet-800/50', angle: 54 },
    { icon: Share2, label: 'Share', color: 'text-blue-600', bgGradient: 'from-blue-100 to-blue-200 dark:from-blue-900/50 dark:to-blue-800/50', angle: 126 },
    { icon: Download, label: 'Save', color: 'text-rose-600', bgGradient: 'from-rose-100 to-rose-200 dark:from-rose-900/50 dark:to-rose-800/50', angle: 198 }
  ];

  const bgClass = color.replace('text-', 'bg-');

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-emerald-50/20 via-white to-blue-50/20 dark:from-emerald-950/10 dark:via-slate-900 dark:to-blue-950/10 relative overflow-hidden px-6 py-6">
      {/* Title */}
      <motion.div
        className="flex items-center gap-2 mb-6"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Download size={18} className={color} />
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
          Exportar Dados
        </span>
      </motion.div>

      {/* Export visualization */}
      <div className="relative" style={{ width: 240, height: 240 }}>
        {/* Background glow */}
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-500/10 to-blue-500/10 blur-3xl"
          animate={isPaused ? {} : { scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 3, repeat: Infinity }}
        />

        {/* Central export button */}
        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
          animate={isPaused ? {} : {
            scale: [1, 0.9, 1.1, 1]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <motion.div
            className={`w-20 h-20 rounded-2xl ${bgClass} shadow-2xl flex items-center justify-center`}
            animate={isPaused ? {} : {
              boxShadow: [
                '0 10px 40px -10px rgba(16, 185, 129, 0.3)',
                '0 20px 50px -10px rgba(16, 185, 129, 0.4)',
                '0 10px 40px -10px rgba(16, 185, 129, 0.3)'
              ]
            }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <Download size={32} className="text-white" />
          </motion.div>
          
          {/* Success check */}
          <motion.div
            className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center shadow-lg"
            animate={isPaused ? { scale: 0 } : { scale: [0, 0, 1.2, 1, 0] }}
            transition={{ duration: 4, repeat: Infinity, times: [0, 0.6, 0.7, 0.85, 1] }}
          >
            <Check size={16} className="text-emerald-500" strokeWidth={3} />
          </motion.div>
        </motion.div>

        {/* Burst formats */}
        {formats.map((format, idx) => (
          <FormatCard
            key={format.label}
            icon={format.icon}
            label={format.label}
            color={format.color}
            bgGradient={format.bgGradient}
            angle={format.angle}
            delay={0.2 + idx * 0.1}
            isPaused={isPaused}
          />
        ))}

        {/* Trail particles */}
        {[...Array(12)].map((_, i) => {
          const angle = i * 30;
          const rad = (angle * Math.PI) / 180;
          
          return (
            <motion.div
              key={i}
              className="absolute left-1/2 top-1/2 w-1.5 h-1.5 rounded-full bg-gradient-to-br from-emerald-400/50 to-blue-400/50"
              animate={isPaused ? { opacity: 0, scale: 0 } : {
                x: [0, Math.cos(rad) * 120],
                y: [0, Math.sin(rad) * 120],
                opacity: [0, 0.8, 0],
                scale: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                delay: 0.3 + i * 0.05,
                ease: "easeOut"
              }}
            />
          );
        })}
      </div>

      {/* Legend */}
      <motion.div
        className="flex items-center gap-4 mt-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {formats.slice(0, 3).map((format) => (
          <div key={format.label} className="flex items-center gap-1.5">
            <format.icon size={12} className={format.color} />
            <span className="text-[10px] font-bold text-slate-500 uppercase">{format.label}</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
};
