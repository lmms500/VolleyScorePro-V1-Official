
import React, { memo, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePerformanceSafe } from '@contexts/PerformanceContext';
import { getAnimationConfig } from '@lib/platform/animationConfig';

interface SuddenDeathOverlayProps {
  active: boolean;
  /** @deprecated Prefer PerformanceContext. Kept for backward compat. */
  lowGraphics?: boolean;
}

/**
 * Global animated overlay for Sudden Death scenarios.
 * Creates a "breathing" intense red vignette around the screen edges.
 * Updated v4.0: Adaptive performance via PerformanceContext.
 */
export const SuddenDeathOverlay: React.FC<SuddenDeathOverlayProps> = memo(({ active, lowGraphics: lowGraphicsProp }) => {
  const { config: perf, isLowGraphics } = usePerformanceSafe();
  const animConfig = useMemo(() => getAnimationConfig(), []);

  const isLow = lowGraphicsProp ?? isLowGraphics;
  const animationsEnabled = perf.animations.enabled;

  const overlayStyle = isLow
    ? {
      background: 'radial-gradient(circle, transparent 50%, rgba(220, 38, 38, 0.3) 100%)',
      opacity: 0.6
    }
    : {
      background: 'radial-gradient(circle, transparent 40%, rgba(153, 27, 27, 0.1) 70%, rgba(220, 38, 38, 0.4) 100%)',
      boxShadow: perf.visual.boxShadows !== 'none' ? 'inset 0 0 120px 20px rgba(185, 28, 28, 0.3)' : undefined,
      filter: perf.visual.gradients ? 'contrast(1.1) saturate(1.2)' : undefined,
      ...(animConfig.useWillChange ? { willChange: 'opacity' as const } : {}),
      ...(animConfig.useContain ? { contain: animConfig.containValue } : {}),
    };

  const pulseDuration = !animationsEnabled ? 0 : (isLow ? 0.3 : 4);

  if (!active) return null;

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          key="sudden-death-overlay"
          className="fixed inset-0 z-[5] pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{
            opacity: !animationsEnabled ? 0.6 : (isLow ? 0.6 : [0.5, 0.75, 0.5])
          }}
          exit={{
            opacity: 0,
            transition: { duration: 0.3 }
          }}
          transition={{
            duration: pulseDuration,
            repeat: !animationsEnabled ? 0 : (isLow ? 0 : Infinity),
            ease: "easeInOut",
            repeatType: "reverse"
          }}
          style={overlayStyle}
        />
      )}
    </AnimatePresence>
  );
});

SuddenDeathOverlay.displayName = 'SuddenDeathOverlay';
