import React from 'react';
import { motion } from 'framer-motion';

// --- APP LOGO SVG ---
export const AppLogoSVG = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect width="512" height="512" rx="128" fill="#0f172a"/>
    <circle cx="256" cy="256" r="160" stroke="url(#paint0_linear_logo_tut)" strokeWidth="32"/>
    <path d="M256 96C256 96 320 180 380 180" stroke="url(#paint1_linear_logo_tut)" strokeWidth="32" strokeLinecap="round"/>
    <path d="M256 416C256 416 192 332 132 332" stroke="url(#paint2_linear_logo_tut)" strokeWidth="32" strokeLinecap="round"/>
    <path d="M116 200C116 200 180 220 256 256" stroke="url(#paint3_linear_logo_tut)" strokeWidth="32" strokeLinecap="round"/>
    <path d="M396 312C396 312 332 292 256 256" stroke="url(#paint4_linear_logo_tut)" strokeWidth="32" strokeLinecap="round"/>
    <defs>
      <linearGradient id="paint0_linear_logo_tut" x1="96" y1="96" x2="416" y2="416" gradientUnits="userSpaceOnUse">
        <stop stopColor="#6366f1"/>
        <stop offset="1" stopColor="#f43f5e"/>
      </linearGradient>
      <linearGradient id="paint1_linear_logo_tut" x1="256" y1="96" x2="380" y2="180" gradientUnits="userSpaceOnUse">
        <stop stopColor="#6366f1"/>
        <stop offset="1" stopColor="#818cf8"/>
      </linearGradient>
      <linearGradient id="paint2_linear_logo_tut" x1="256" y1="416" x2="132" y2="332" gradientUnits="userSpaceOnUse">
        <stop stopColor="#f43f5e"/>
        <stop offset="1" stopColor="#fb7185"/>
      </linearGradient>
      <linearGradient id="paint3_linear_logo_tut" x1="116" y1="200" x2="256" y2="256" gradientUnits="userSpaceOnUse">
        <stop stopColor="#6366f1"/>
        <stop offset="1" stopColor="#f43f5e"/>
      </linearGradient>
      <linearGradient id="paint4_linear_logo_tut" x1="396" y1="312" x2="256" y2="256" gradientUnits="userSpaceOnUse">
        <stop stopColor="#f43f5e"/>
        <stop offset="1" stopColor="#6366f1"/>
      </linearGradient>
    </defs>
  </svg>
);

// --- PREMIUM APP LOGO VISUAL ---
export const AppLogoVisual = ({ isPaused }: { isPaused: boolean }) => (
  <div className="w-full h-full flex items-center justify-center bg-slate-50 dark:bg-white/5 relative overflow-hidden">
    {/* Ambient glow orbs */}
    <motion.div
      className="absolute rounded-full bg-gradient-to-r from-indigo-500/30 via-violet-500/20 to-rose-500/30 blur-3xl"
      initial={{ scale: 0, opacity: 0 }}
      animate={isPaused ? { scale: 1, opacity: 0.3 } : { 
        scale: [0.6, 1.2, 0.8, 1, 0.6], 
        opacity: [0.2, 0.5, 0.3, 0.4, 0.2],
        rotate: [0, 180, 360]
      }}
      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      style={{ width: 240, height: 240 }}
    />
    
    <motion.div
      className="absolute rounded-full bg-gradient-to-r from-rose-500/20 via-amber-500/10 to-indigo-500/20 blur-3xl"
      initial={{ scale: 0, opacity: 0 }}
      animate={isPaused ? { scale: 1, opacity: 0.2 } : { 
        scale: [1, 0.7, 1.1, 0.9, 1], 
        opacity: [0.15, 0.35, 0.2, 0.3, 0.15],
        rotate: [360, 180, 0]
      }}
      transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      style={{ width: 200, height: 200 }}
    />

    {/* Particle field */}
    {[...Array(8)].map((_, i) => (
      <motion.div
        key={`particle-${i}`}
        className="absolute w-1.5 h-1.5 rounded-full bg-gradient-to-r from-indigo-400/60 to-rose-400/60"
        style={{
          left: `${20 + Math.random() * 60}%`,
          top: `${20 + Math.random() * 60}%`
        }}
        animate={isPaused ? {} : {
          y: [0, -20 - Math.random() * 20, 0],
          x: [0, (Math.random() - 0.5) * 30, 0],
          scale: [0.5, 1, 0.5],
          opacity: [0.3, 0.7, 0.3]
        }}
        transition={{
          duration: 3 + Math.random() * 2,
          repeat: Infinity,
          delay: i * 0.3,
          ease: "easeInOut"
        }}
      />
    ))}

    {/* LOGO CONTAINER */}
    <motion.div
      className="relative z-10"
      initial={{ scale: 0, opacity: 0, rotate: -180 }}
      animate={{ scale: 1, opacity: 1, rotate: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 15 }}
    >
      {/* Shadow ring */}
      <motion.div
        className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500/20 to-rose-500/20 blur-xl"
        animate={isPaused ? {} : {
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.6, 0.3]
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        style={{ width: 140, height: 140, left: -6, top: -6 }}
      />
      
      {/* Logo with subtle float */}
      <motion.div
        className="w-28 h-28 drop-shadow-2xl"
        animate={isPaused ? {} : {
          y: [0, -10, 0],
          rotate: [0, 360]
        }}
        transition={{
          y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
          rotate: { duration: 20, repeat: Infinity, ease: "linear" }
        }}
      >
        <AppLogoSVG className="w-full h-full" />
      </motion.div>
    </motion.div>

    {/* Tagline */}
    <motion.div
      className="absolute bottom-16 flex flex-col items-center gap-2"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
    >
      <motion.div
        className="flex gap-1"
        animate={isPaused ? {} : {}}
      >
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            className="w-1 h-1 rounded-full bg-gradient-to-r from-indigo-400 to-rose-400"
            animate={isPaused ? {} : {
              scale: [1, 1.5, 1],
              opacity: [0.4, 1, 0.4]
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
      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
        Professional Scoring
      </span>
    </motion.div>
  </div>
);
