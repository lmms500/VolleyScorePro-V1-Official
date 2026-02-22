/**
 * IndieDevScene - Developer Message Scene
 * Personal, warm message about indie development
 * Features: Floating elements, heart animation, typewriter effect simulation
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Code2, Coffee, Sparkles } from 'lucide-react';

const FloatingElement = ({ 
  Icon, 
  delay, 
  x, 
  y, 
  color,
  isPaused 
}: { 
  Icon: React.ElementType; 
  delay: number; 
  x: string; 
  y: string; 
  color: string;
  isPaused: boolean;
}) => (
  <motion.div
    className={`absolute ${color}`}
    style={{ left: x, top: y }}
    initial={{ scale: 0, opacity: 0 }}
    animate={isPaused ? { scale: 1, opacity: 0.6 } : {
      scale: [0, 1, 0.8, 1],
      opacity: [0, 0.7, 0.5, 0.6],
      y: [0, -15, -5, -10]
    }}
    transition={{
      duration: 3,
      repeat: Infinity,
      delay,
      ease: "easeInOut"
    }}
  >
    <Icon size={20} strokeWidth={1.5} />
  </motion.div>
);

export const IndieDevScene: React.FC<{ isPaused: boolean }> = ({ isPaused }) => {
  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-rose-50 via-white to-amber-50 dark:from-rose-950/20 dark:via-slate-900 dark:to-amber-950/20 relative overflow-hidden">
      <FloatingElement Icon={Code2} delay={0} x="15%" y="20%" color="text-indigo-400" isPaused={isPaused} />
      <FloatingElement Icon={Coffee} delay={0.5} x="80%" y="25%" color="text-amber-500" isPaused={isPaused} />
      <FloatingElement Icon={Sparkles} delay={1} x="20%" y="75%" color="text-violet-400" isPaused={isPaused} />
      <FloatingElement Icon={Code2} delay={1.5} x="75%" y="70%" color="text-emerald-400" isPaused={isPaused} />

      <motion.div
        className="absolute inset-0 bg-gradient-to-t from-rose-500/5 to-transparent"
        animate={isPaused ? {} : { opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative z-10 flex flex-col items-center text-center px-8">
        <motion.div
          className="relative mb-6"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.2 }}
        >
          <motion.div
            className="w-20 h-20 rounded-full bg-gradient-to-br from-rose-400 to-amber-400 flex items-center justify-center shadow-lg"
            animate={isPaused ? {} : {
              boxShadow: [
                "0 0 0 0 rgba(251, 113, 133, 0.4)",
                "0 0 0 20px rgba(251, 113, 133, 0)",
                "0 0 0 0 rgba(251, 113, 133, 0)"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <motion.div
              animate={isPaused ? {} : { scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <Heart size={32} className="text-white" fill="white" />
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.div
          className="space-y-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <h3 className="text-lg font-black text-slate-800 dark:text-white">
            Feito com amor
          </h3>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300 max-w-[280px] leading-relaxed">
            Este app é desenvolvido por <span className="font-bold text-rose-500">uma única pessoa</span>, com paixão por vôlei e tecnologia.
          </p>
        </motion.div>

        <motion.div
          className="mt-6 px-4 py-3 rounded-2xl bg-white/60 dark:bg-white/10 backdrop-blur-sm border border-white/50 dark:border-white/10"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
            Se encontrar bugs ou tiver sugestões, por favor envie seu feedback antes de avaliar negativamente. 
            <span className="text-rose-500 font-bold"> Sua ajuda faz toda diferença!</span>
          </p>
        </motion.div>

        <motion.div
          className="flex items-center gap-2 mt-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <div className="flex -space-x-1">
            {['bg-rose-400', 'bg-amber-400', 'bg-emerald-400', 'bg-violet-400'].map((bg, i) => (
              <motion.div
                key={i}
                className={`w-3 h-3 rounded-full ${bg}`}
                animate={isPaused ? {} : { scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
              />
            ))}
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Obrigado pelo apoio!
          </span>
        </motion.div>
      </div>
    </div>
  );
};
