import React, { useEffect, useRef, useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAnimationConfig } from '@lib/platform/animationConfig';


interface ScoreTickerProps {
  value: number;
  className?: string;
  style?: React.CSSProperties;
}

export const ScoreTicker: React.FC<ScoreTickerProps> = memo(({ value, className, style }) => {
  const prevValue = useRef(value);
  const config = getAnimationConfig();
  
  const direction = value > prevValue.current ? 1 : (value < prevValue.current ? -1 : 0);

  if (value !== prevValue.current) {
    prevValue.current = value;
  }

  const transitionDuration = Math.max(0.1, config.modalDuration / 1000 * 0.6);

  return (
    <div
      className={`
        relative inline-flex justify-center items-center tabular-nums 
        transition-[font-size,transform] duration-200 ease-out 
        ${className}
      `}
      style={{
        ...style,
        height: '1.2em',
        minWidth: '1.1em',
        padding: '0 0.1em',
        isolation: 'isolate',
        overflow: 'visible',
        willChange: config.useWillChange ? 'transform' : undefined,
        transform: config.useGPUTransform ? 'translateZ(0)' : undefined,
        backfaceVisibility: config.useGPUTransform ? 'hidden' : undefined,
        WebkitBackfaceVisibility: config.useGPUTransform ? 'hidden' : undefined
      }}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={value}
          initial={{
            opacity: 0,
            scale: 0.5,
            y: direction * 20
          }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85 }}
          transition={config.isAndroid || config.isLowEnd
            ? { duration: transitionDuration, ease: [0.25, 1, 0.5, 1] }
            : { type: "spring", stiffness: 300, damping: 24, mass: 0.5 }
          }
          data-testid="score-value"
          className="text-center leading-none origin-center absolute inset-0 flex items-center justify-center"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            height: '100%',
            width: '100%',
          }}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </div>
  );
});
