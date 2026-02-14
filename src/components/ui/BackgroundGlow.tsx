
import React, { memo } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { TeamColor } from '../../types';
import { getHexFromColor } from '../../utils/colors';
import { usePerformanceSafe } from '../../contexts/PerformanceContext';

interface BackgroundGlowProps {
  isSwapped: boolean;
  isFullscreen: boolean;
  colorA?: TeamColor;
  colorB?: TeamColor;
  /** @deprecated Prefer PerformanceContext. Kept for backward compat. */
  lowPowerMode?: boolean;
}

export const BackgroundGlow: React.FC<BackgroundGlowProps> = memo(({ isSwapped, isFullscreen, colorA = 'indigo', colorB = 'rose', lowPowerMode: lowPowerModeProp }) => {
  const { config: perf } = usePerformanceSafe();

  const hexA = getHexFromColor(colorA);
  const hexB = getHexFromColor(colorB);

  // Determinamos a cor ativa para cada "Lado Físico" da tela
  const activeLeftColor = isSwapped ? hexB : hexA;
  const activeRightColor = isSwapped ? hexA : hexB;

  // Resolve glow mode: prop override or from performance context
  const glowMode = lowPowerModeProp === true ? 'static' : perf.visual.backgroundGlow;

  // --- GRADIENT MODE (REDUZIR_MOVIMENTO) ---
  if (glowMode === 'gradient') {
    return (
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background: `linear-gradient(to bottom right, ${activeLeftColor}10, ${activeRightColor}10)`,
          backgroundSize: '100% 100%'
        }}
        aria-hidden="true"
      />
    );
  }

  // --- STATIC MODE (ECONOMICO / lowPowerMode) ---
  if (glowMode === 'static') {
    return (
      <div
        className="fixed inset-0 z-0 pointer-events-none transition-all duration-700 ease-in-out"
        style={{
          background: `linear-gradient(to bottom right, ${activeLeftColor}15, ${activeRightColor}15)`,
          backgroundSize: '100% 100%'
        }}
        aria-hidden="true"
      />
    );
  }

  // --- ANIMATED MODE (NORMAL - GPU COMPOSITED) ---
  return createPortal(
    <div
      className="fixed z-[-1] pointer-events-none select-none bg-transparent"
      aria-hidden="true"
      style={{ inset: -150 }}
    >
      {/* SPOTLIGHT ESQUERDO (Top-Left) */}
      <motion.div
        initial={false}
        animate={{ backgroundColor: activeLeftColor }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
        className={`absolute -top-[10%] -left-[10%] w-[70vmax] h-[70vmax] rounded-full will-change-[background-color] mix-blend-multiply dark:mix-blend-screen saturate-150 blur-[90px] ${isFullscreen ? 'opacity-80 dark:opacity-60' : 'opacity-40 dark:opacity-25'
          }`}
        style={{
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden'
        }}
      />

      {/* SPOTLIGHT DIREITO (Bottom-Right) */}
      <motion.div
        initial={false}
        animate={{ backgroundColor: activeRightColor }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
        className={`absolute -bottom-[10%] -right-[10%] w-[70vmax] h-[70vmax] rounded-full will-change-[background-color] mix-blend-multiply dark:mix-blend-screen saturate-150 blur-[90px] ${isFullscreen ? 'opacity-80 dark:opacity-60' : 'opacity-40 dark:opacity-25'
          }`}
        style={{
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden'
        }}
      />
    </div>,
    document.body
  );
});
