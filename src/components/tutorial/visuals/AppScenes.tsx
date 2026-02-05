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

// --- APP LOGO VISUAL (Animated) ---
export const AppLogoVisual = ({ isPaused }: { isPaused: boolean }) => (
  <div className="w-full h-full flex items-center justify-center bg-slate-50 dark:bg-white/5 relative overflow-hidden">
    {/* ENTRANCE & PULSING GLOW - Synchronized */}
    <motion.div
      className="absolute rounded-full bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-indigo-500/20 blur-3xl"
      initial={{ scale: 0, opacity: 0 }}
      animate={isPaused ? { scale: 1, opacity: 0.4 } : { scale: [0.6, 1, 0.8, 1, 0.7], opacity: [0.2, 0.5, 0.3, 0.6, 0.25] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      style={{ width: 200, height: 200 }}
    />

    {/* CONCENTRIC RINGS - Emanating from center */}
    {[0, 1, 2].map((ring) => (
      <motion.div
        key={`ring-${ring}`}
        className="absolute rounded-full border border-indigo-400/30 dark:border-indigo-500/20"
        style={{ width: 120 + ring * 60, height: 120 + ring * 60 }}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={isPaused ? { opacity: 0 } : { opacity: [0, 0.5, 0], scale: [0.5, 1.5, 0.5] }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          delay: ring * 0.5,
          ease: "easeOut"
        }}
      />
    ))}

    {/* LOGO CONTAINER - Entrance spring, Loop rotation */}
    <motion.div
      className="relative z-10"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.6, type: "spring", bounce: 0.6, damping: 8 }}
    >
      {/* SUBTLE CONTINUOUS ROTATION + BOB */}
      <motion.div
        className="w-32 h-32 drop-shadow-2xl"
        animate={isPaused ? { y: 0, rotate: 0 } : {
          y: [0, -12, 0],
          rotate: [0, 360]
        }}
        transition={{
          y: { duration: 3.5, repeat: Infinity, ease: "easeInOut" },
          rotate: { duration: 12, repeat: Infinity, ease: "linear" }
        }}
      >
        <AppLogoSVG className="w-full h-full" />
      </motion.div>
    </motion.div>
  </div>
);
