/**
 * SettingsScene - Premium Configuration Animation
 * Apple-quality gear animations with smooth micro-interactions
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Settings, Sliders, ToggleLeft, ToggleRight, Gauge } from 'lucide-react';
import { MotionSceneProps } from './types';

const AnimatedGear = ({ 
  size, 
  color, 
  delay, 
  direction, 
  isPaused,
  x = 0,
  y = 0
}: { 
  size: number; 
  color: string; 
  delay: number; 
  direction: number;
  isPaused: boolean;
  x?: number;
  y?: number;
}) => (
  <motion.div
    className={`absolute ${color}`}
    style={{ left: `calc(50% + ${x}px)`, top: `calc(50% + ${y}px)` }}
    initial={{ scale: 0, opacity: 0 }}
    animate={isPaused ? { scale: 1, opacity: 0.6, rotate: 0 } : {
      scale: [0, 1.1, 1],
      opacity: [0, 0.8, 0.6],
      rotate: direction > 0 ? [0, 360] : [0, -360]
    }}
    transition={{
      scale: { duration: 0.6, delay },
      opacity: { duration: 0.6, delay },
      rotate: { duration: 8 + size / 10, repeat: Infinity, ease: "linear", delay }
    }}
  >
    <Settings size={size} strokeWidth={1.2} />
  </motion.div>
);

export const SettingsScene: React.FC<MotionSceneProps> = ({ color, isPaused }) => {
  const bgClass = color.replace('text-', 'bg-');
  
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 dark:bg-white/5 relative overflow-hidden px-6 py-8">
      {/* Ambient gradient */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-amber-500/5"
        animate={isPaused ? {} : { opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Gear system */}
      <div className="relative w-40 h-40 mb-6">
        <AnimatedGear size={80} color="text-slate-200 dark:text-slate-700" delay={0} direction={1} isPaused={isPaused} x={20} y={-20} />
        <AnimatedGear size={56} color={color} delay={0.1} direction={-1} isPaused={isPaused} x={-30} y={25} />
        <AnimatedGear size={40} color="text-slate-300 dark:text-slate-600" delay={0.2} direction={1} isPaused={isPaused} x={35} y={30} />

        {/* Central gauge */}
        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
        >
          <motion.div
            className={`w-16 h-16 rounded-full ${bgClass}/20 flex items-center justify-center`}
            animate={isPaused ? {} : {
              boxShadow: [
                `0 0 0 0 ${color.replace('text-', 'rgba(var(--')}/0)`,
                `0 0 0 15px ${color.replace('text-', 'rgba(var(--')}/0.1)`,
                `0 0 0 0 ${color.replace('text-', 'rgba(var(--')}/0)`
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Gauge size={28} className={color} />
          </motion.div>
        </motion.div>
      </div>

      {/* Sliders */}
      <div className="w-full max-w-xs space-y-3">
        {[
          { label: 'Sets', value: 60, gradient: 'from-indigo-500 to-indigo-400' },
          { label: 'Points', value: 80, gradient: 'from-amber-500 to-amber-400' },
          { label: 'Players', value: 45, gradient: 'from-emerald-500 to-emerald-400' }
        ].map((slider, i) => (
          <motion.div
            key={slider.label}
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + i * 0.1 }}
          >
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 w-16 text-right uppercase tracking-wider">
              {slider.label}
            </span>
            <div className="flex-1 h-2 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden relative">
              <motion.div
                className={`h-full bg-gradient-to-r ${slider.gradient} rounded-full`}
                initial={{ width: 0 }}
                animate={isPaused ? { width: `${slider.value}%` } : {
                  width: [`${slider.value * 0.5}%`, `${slider.value}%`, `${slider.value * 0.7}%`, `${slider.value}%`]
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.2
                }}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Toggle switches */}
      <motion.div
        className="flex gap-6 mt-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        {['Sound', 'Vibrate'].map((label, i) => (
          <motion.div
            key={label}
            className="flex items-center gap-2"
            animate={isPaused ? {} : { opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {label}
            </span>
            <motion.div
              className={`w-10 h-5 rounded-full relative ${i === 0 ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-white/10'}`}
              animate={isPaused ? {} : { backgroundColor: i === 0 ? ['#10b981', '#34d399', '#10b981'] : undefined }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <motion.div
                className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-md"
                animate={isPaused ? { left: i === 0 ? 22 : 2 } : { left: [i === 0 ? 22 : 2, i === 0 ? 22 : 2] }}
              />
            </motion.div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};
