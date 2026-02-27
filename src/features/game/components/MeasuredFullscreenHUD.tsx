
import React, { memo } from 'react';
import { HudPlacement } from '@features/game/hooks/useHudMeasure';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { TeamColor } from '@types';
import { resolveTheme } from '@lib/utils/colors';
import { getAnimationConfig } from '@lib/platform/animationConfig';

interface MeasuredFullscreenHUDProps {
  placement: HudPlacement;
  setsLeft: number;
  setsRight: number;
  colorLeft: TeamColor;
  colorRight: TeamColor;
}

const animConfig = getAnimationConfig();

// Use 2D transitions on Android/low-end instead of 3D rotateY (causes GPU texture thrashing)
const flipVariants: Variants = animConfig.isAndroid || animConfig.isLowEnd
  ? {
    initial: { opacity: 0, scale: 0.85, y: 10 },
    animate: {
      opacity: 1, scale: 1, y: 0,
      transition: { duration: 0.25, ease: [0.25, 1, 0.5, 1] }
    },
    exit: {
      opacity: 0, scale: 0.85, y: -10,
      transition: { duration: 0.2, ease: [0.32, 0, 0.67, 0] }
    }
  }
  : {
    initial: (direction: number) => ({
      rotateY: direction > 0 ? -90 : 90,
      z: -100,
      opacity: 0,
      scale: 0.9
    }),
    animate: {
      rotateY: 0, z: 0, opacity: 1, scale: 1,
      transition: { type: "spring", stiffness: 200, damping: 25, mass: 0.8 }
    },
    exit: (direction: number) => ({
      rotateY: direction > 0 ? 90 : -90,
      z: -100,
      opacity: 0, scale: 0.9,
      transition: { duration: 0.3, ease: "easeInOut" }
    })
  };

const SetNumber = memo(({ value, color }: { value: number, color: TeamColor }) => {
    const theme = resolveTheme(color);
    return (
        <div className="w-[50px] flex flex-col justify-center items-center relative">
            <motion.span
                key={value} 
                initial={{ scale: 0.8, opacity: 0, y: 10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }} 
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className={`font-black text-4xl leading-none tabular-nums tracking-tighter ${theme.text} ${theme.textDark} drop-shadow-[0_4px_8px_rgba(0,0,0,0.3)]`}
            >
                {value}
            </motion.span>
        </div>
    );
});

export const MeasuredFullscreenHUD: React.FC<MeasuredFullscreenHUDProps> = memo(({
  placement,
  setsLeft, setsRight, 
  colorLeft, colorRight
}) => {
  if (!placement.visible) return null;
  const layoutKey = `hud-${colorLeft}-${colorRight}`;

  return (
    <div 
        style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: `translate(-50%, -50%) scale(${placement.scale})`,
            zIndex: 40,
            pointerEvents: 'none',
            perspective: animConfig.isAndroid || animConfig.isLowEnd ? undefined : '1200px'
        }}
        className="flex items-center justify-center origin-center"
    >
        <AnimatePresence mode="wait" initial={false}>
            <motion.div
                key={layoutKey}
                variants={flipVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="relative"
                style={animConfig.isAndroid || animConfig.isLowEnd ? undefined : { transformStyle: 'preserve-3d' }}
            >
                <div className="relative flex items-center justify-center gap-0 px-6 py-2 rounded-[2rem] bg-slate-900/40 dark:bg-black/60 backdrop-blur-3xl border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_0_1px_0_0_rgba(255,255,255,0.1)] ring-1 ring-inset ring-white/10">
                    <SetNumber value={setsLeft} color={colorLeft} />
                    <div className="w-1.5 h-1.5 rounded-full bg-white/20 mx-1 shadow-inner" />
                    <SetNumber value={setsRight} color={colorRight} />
                </div>
                {/* Glow Effect Layer */}
                <div className="absolute inset-0 blur-3xl opacity-20 -z-10 bg-gradient-to-r from-indigo-500 to-rose-500 rounded-full" />
            </motion.div>
        </AnimatePresence>
    </div>
  );
});
