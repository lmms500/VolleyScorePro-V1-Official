import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { scoutSpring, scoutSpringBouncy } from './designTokens';

const Particle = ({ delay, x, y, size }: { delay: number; x: string; y: string; size: number }) => (
  <motion.div
    className="absolute rounded-full bg-indigo-400/40"
    style={{ width: size, height: size, left: x, top: y }}
    initial={{ scale: 0, opacity: 0 }}
    animate={{ 
      scale: [0, 1, 0],
      opacity: [0, 0.8, 0],
      y: [0, -30, -60]
    }}
    transition={{ 
      duration: 2,
      delay,
      repeat: Infinity,
      repeatDelay: 1
    }}
  />
);

const LoadingDots = () => {
  return (
    <div className="flex gap-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-indigo-400"
          initial={{ y: 0 }}
          animate={{ y: -4 }}
          transition={{
            duration: 0.4,
            repeat: Infinity,
            repeatType: "reverse",
            delay: i * 0.15
          }}
        />
      ))}
    </div>
  );
};

export const GlobalLoader = () => {
  const [progress, setProgress] = useState(0);
  const [showText, setShowText] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowText(true), 500);
    const progressTimer = setInterval(() => {
      setProgress(p => {
        if (p >= 90) return p;
        return p + Math.random() * 15;
      });
    }, 200);
    
    return () => {
      clearTimeout(timer);
      clearInterval(progressTimer);
    };
  }, []);

  const particles = Array.from({ length: 8 }, (_, i) => ({
    delay: i * 0.2,
    x: `${20 + Math.random() * 60}%`,
    y: `${30 + Math.random() * 40}%`,
    size: 3 + Math.random() * 4
  }));

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden">
        <motion.div 
          className="absolute inset-0 bg-gradient-to-br from-slate-100 via-slate-50 to-indigo-50 dark:from-[#020617] dark:via-[#0f172a] dark:to-indigo-950/30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        />
        
        <motion.div
          className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-indigo-400/20 dark:bg-indigo-500/10 blur-[100px]"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full bg-purple-400/20 dark:bg-purple-500/10 blur-[80px]"
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.2, 0.4]
          }}
          transition={{ duration: 3, repeat: Infinity }}
        />

        {particles.map((p, i) => (
          <Particle key={i} {...p} />
        ))}

        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: -20 }}
          transition={scoutSpring}
          className="relative flex flex-col items-center gap-6 px-10 py-8"
        >
          <motion.div
            className="relative"
            animate={{ 
              y: [0, -6, 0],
            }}
            transition={{ 
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <div className="absolute inset-0 bg-indigo-500/40 blur-2xl rounded-full scale-150" />
            <motion.img
              src="/icon.png"
              alt="VolleyScore Pro"
              className="w-16 h-16 md:w-20 md:h-20 relative z-10"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ ...scoutSpringBouncy, delay: 0.1 }}
            />
          </motion.div>

          <motion.div
            className="flex flex-col items-center gap-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <motion.h1
              className="text-2xl md:text-3xl font-black tracking-tight"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <span className="bg-gradient-to-r from-indigo-600 via-purple-500 to-indigo-600 dark:from-indigo-400 dark:via-purple-400 dark:to-indigo-400 bg-clip-text text-transparent">
                VolleyScore
              </span>
              <span className="text-slate-700 dark:text-slate-200"> Pro</span>
            </motion.h1>

            <div className="w-48 h-1 bg-slate-200/50 dark:bg-slate-700/50 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(progress, 95)}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            <AnimatePresence>
              {showText && (
                <motion.div
                  className="flex items-center gap-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <span className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                    Carregando
                  </span>
                  <LoadingDots />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>

        <motion.div
          className="absolute bottom-8 text-[10px] font-medium text-slate-400 dark:text-slate-500 tracking-wider"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          Feito para atletas
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
