
import React, { memo } from 'react';
import { HudPlacement } from '../hooks/useHudMeasure';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { TeamColor } from '../types';
import { resolveTheme } from '../utils/colors';

interface MeasuredFullscreenHUDProps {
  placement: HudPlacement;
  setsLeft: number;
  setsRight: number;
  colorLeft: TeamColor;
  colorRight: TeamColor;
}

// 3D Flip Variants
const flipVariants: Variants = {
  initial: (direction: number) => ({ 
    rotateY: direction > 0 ? -180 : 180, 
    opacity: 0,
    scale: 0.8
  }),
  animate: { 
    rotateY: 0, 
    opacity: 1, 
    scale: 1,
    transition: { 
      type: "spring", 
      stiffness: 260, 
      damping: 20,
      mass: 1
    } 
  },
  exit: (direction: number) => ({ 
    rotateY: direction > 0 ? 180 : -180, 
    opacity: 0, 
    scale: 0.8,
    transition: { duration: 0.3 } 
  })
};

const SetNumber = memo(({ value, color }: { value: number, color: TeamColor }) => {
    const theme = resolveTheme(color);
    
    // Updated: Use team color in both light (theme.text) and dark (theme.textDark) modes
    // This aligns the set score visual with the team identity in full screen
    const textColor = `${theme.text} ${theme.textDark} dark:drop-shadow-[0_0_15px_currentColor]`;

    return (
        <div className="w-[45px] flex flex-col justify-center items-center relative">
            <motion.span
                key={value} 
                initial={{ scale: 0.8, opacity: 0, filter: 'blur(8px)' }}
                animate={{ 
                    scale: [1.2, 1], 
                    opacity: 1, 
                    filter: 'blur(0px)',
                }} 
                transition={{ 
                    duration: 0.4, 
                    ease: "backOut"
                }}
                className={`font-black text-4xl leading-none tabular-nums tracking-tighter ${textColor}`}
                style={{ 
                    display: 'inline-block'
                }}
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

  // Key to trigger animation when the visual arrangement changes (side swap)
  // We use colorLeft as a proxy for the team on the left
  const layoutKey = `hud-${colorLeft}`;

  return (
    <div 
        style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: `translate(-50%, -50%) scale(${placement.scale})`,
            zIndex: 40,
            pointerEvents: 'none',
            perspective: '1000px', // Perspective is crucial for 3D effect
            width: 'max-content',
            height: 'max-content'
        }} 
        className="flex items-center justify-center origin-center"
    >
        <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
                key={layoutKey}
                variants={flipVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                style={{ 
                    transformStyle: 'preserve-3d', 
                    backfaceVisibility: 'hidden',
                    transformOrigin: 'center center'
                }}
                className="relative"
            >
                {/* Neo-Glass Container - Slightly reduced size for better margin */}
                <div className={`
                    relative flex items-center justify-center gap-0 
                    px-5 py-1.5 rounded-full
                    bg-white/80 dark:bg-black/40 
                    backdrop-blur-xl border border-white/40 dark:border-white/10 
                    shadow-[0_8px_32px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)]
                    overflow-hidden
                    min-w-[140px] min-h-[50px]
                    flex-shrink-0
                    ring-1 ring-white/20 dark:ring-white/10
                `}>
                    {/* Content Layer */}
                    <div className="relative z-10 flex items-center justify-center gap-1">
                        <SetNumber value={setsLeft} color={colorLeft} />

                        {/* Divider - Smaller Dot */}
                        <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-white/20 mx-0.5" />

                        <SetNumber value={setsRight} color={colorRight} />
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    </div>
  );
});
