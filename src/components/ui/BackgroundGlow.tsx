
import React, { memo } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { TeamColor } from '../../types';
import { getHexFromColor } from '../../utils/colors';

interface BackgroundGlowProps {
  isSwapped: boolean;
  isFullscreen: boolean;
  colorA?: TeamColor;
  colorB?: TeamColor;
  lowPowerMode?: boolean;
}

export const BackgroundGlow: React.FC<BackgroundGlowProps> = memo(({ isSwapped, isFullscreen, colorA = 'indigo', colorB = 'rose', lowPowerMode = false }) => {

  const hexA = getHexFromColor(colorA);
  const hexB = getHexFromColor(colorB);

  // Determinamos a cor ativa para cada "Lado Físico" da tela
  // Lado Esquerdo (Top-Left): Se trocado, mostra cor do Time B. Se normal, Time A.
  const activeLeftColor = isSwapped ? hexB : hexA;

  // Lado Direito (Bottom-Right): Se trocado, mostra cor do Time A. Se normal, Time B.
  const activeRightColor = isSwapped ? hexA : hexB;

  // --- LOW POWER MODE (STATIC CSS GRADIENT) ---
  if (lowPowerMode) {
    return (
      <div
        className="fixed inset-0 z-0 pointer-events-none transition-all duration-700 ease-in-out"
        style={{
          // Gradiente diagonal fixo: Top-Left (Left Color) -> Bottom-Right (Right Color)
          background: `linear-gradient(to bottom right, ${activeLeftColor}15, ${activeRightColor}15)`,
          backgroundSize: '100% 100%'
        }}
        aria-hidden="true"
      />
    );
  }

  // --- HIGH PERFORMANCE MODE (GPU COMPOSITED) ---
  return createPortal(
    <div
      className="fixed z-[-1] pointer-events-none select-none bg-transparent"
      aria-hidden="true"
      style={{ inset: -150 }} // Expand container to prevent blur clipping at edges
    >

      {/* SPOTLIGHT ESQUERDO (Top-Left) */}
      <motion.div
        initial={false}
        animate={{ backgroundColor: activeLeftColor }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
        className="absolute -top-[10%] -left-[10%] w-[70vmax] h-[70vmax] rounded-full will-change-[background-color] mix-blend-multiply dark:mix-blend-screen saturate-150 opacity-40 dark:opacity-25 blur-[90px]"
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
        className="absolute -bottom-[10%] -right-[10%] w-[70vmax] h-[70vmax] rounded-full will-change-[background-color] mix-blend-multiply dark:mix-blend-screen saturate-150 opacity-40 dark:opacity-25 blur-[90px]"
        style={{
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden'
        }}
      />
    </div>,
    document.body
  );
});
