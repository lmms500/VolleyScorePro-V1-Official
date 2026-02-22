/**
 * WelcomeHeroScene - Premium Welcome Animation
 * Apple/Google-quality entrance with sophisticated motion design
 * Features: Particle system, gradient morphing, logo reveal with spring physics
 */

import React from 'react';
import { motion } from 'framer-motion';
import { AppLogoSVG } from '../visuals/AppScenes';

const ParticleField = ({ isPaused }: { isPaused: boolean }) => {
  const particles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    size: 4 + Math.random() * 8,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: 3 + Math.random() * 4,
    delay: Math.random() * 2
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-gradient-to-br from-indigo-400/40 to-rose-400/40"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`
          }}
          animate={isPaused ? {} : {
            y: [0, -30, 0],
            x: [0, (Math.random() - 0.5) * 40, 0],
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
};

const GradientOrb = ({ isPaused, delay, gradient }: { isPaused: boolean; delay: number; gradient: string }) => (
  <motion.div
    className={`absolute rounded-full blur-3xl ${gradient}`}
    style={{ width: 200, height: 200 }}
    initial={{ scale: 0, opacity: 0 }}
    animate={isPaused ? { scale: 1, opacity: 0.3 } : {
      scale: [0.8, 1.2, 0.9, 1.1, 0.8],
      opacity: [0.2, 0.5, 0.3, 0.4, 0.2],
      x: [0, 20, -10, 15, 0],
      y: [0, -15, 10, -5, 0]
    }}
    transition={{
      duration: 6,
      repeat: Infinity,
      delay,
      ease: "easeInOut"
    }}
  />
);

export const WelcomeHeroScene: React.FC<{ isPaused: boolean }> = ({ isPaused }) => {
  return (
    <div className="w-full h-full flex items-center justify-center bg-slate-50 dark:bg-white/5 relative overflow-hidden">
      <ParticleField isPaused={isPaused} />
      
      <GradientOrb isPaused={isPaused} delay={0} gradient="bg-indigo-500/30" />
      <GradientOrb isPaused={isPaused} delay={0.5} gradient="bg-rose-500/20" />
      <GradientOrb isPaused={isPaused} delay={1} gradient="bg-violet-500/25" />

      <div className="relative z-10 flex flex-col items-center">
        <motion.div
          className="relative"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ 
            type: "spring", 
            stiffness: 200, 
            damping: 15,
            delay: 0.2
          }}
        >
          <motion.div
            className="absolute inset-0 rounded-3xl bg-gradient-to-br from-indigo-500 to-rose-500 blur-2xl opacity-40"
            animate={isPaused ? {} : {
              scale: [1, 1.15, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          />
          
          <motion.div
            className="relative w-28 h-28 drop-shadow-2xl"
            animate={isPaused ? {} : {
              y: [0, -8, 0],
              rotateZ: [0, 2, -2, 0]
            }}
            transition={{
              y: { duration: 3, repeat: Infinity, ease: "easeInOut" },
              rotateZ: { duration: 4, repeat: Infinity, ease: "easeInOut" }
            }}
          >
            <AppLogoSVG className="w-full h-full" />
          </motion.div>
        </motion.div>

        <motion.div
          className="mt-6 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <motion.h1 
            className="text-2xl font-black bg-gradient-to-r from-indigo-600 via-violet-600 to-rose-600 bg-clip-text text-transparent"
            animate={isPaused ? {} : {
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            style={{ backgroundSize: "200% auto" }}
          >
            VolleyScore
          </motion.h1>
          <motion.p 
            className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500 mt-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            Pro Edition
          </motion.p>
        </motion.div>

        <motion.div
          className="flex gap-1.5 mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
        >
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-rose-500"
              animate={isPaused ? {} : {
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.15,
                ease: "easeInOut"
              }}
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
};
