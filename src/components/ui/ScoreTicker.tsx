import React, { useEffect, useRef, useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { tickerVariants } from '../../utils/animations';

interface ScoreTickerProps {
  value: number;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * ScoreTicker v6.2 (Optimized Height Edition)
 * - Synthetic Motion Blur: Aplica blur direcional baseado na transição.
 * - Reduced box height to prevent overlap with nearby UI elements.
 */
export const ScoreTicker: React.FC<ScoreTickerProps> = memo(({ value, className, style }) => {
  const prevValue = useRef(value);
  const [direction, setDirection] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (value !== prevValue.current) {
      setDirection(value > prevValue.current ? 1 : -1);
      prevValue.current = value;
    }
  }, [value]);

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
        willChange: 'transform',
        contain: 'layout size',
        transform: 'translateZ(0)'
      }}
    >
      <AnimatePresence mode="popLayout" custom={direction} initial={false}>
        <motion.span
          key={`score-tick-${value}`}
          custom={direction}
          variants={tickerVariants}
          initial="enter"
          animate="center"
          exit="exit"
          data-testid="score-value"
          onAnimationStart={() => setIsAnimating(true)}
          onAnimationComplete={() => setIsAnimating(false)}
          className="block text-center leading-none origin-center absolute inset-0 flex items-center justify-center"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            height: '100%',
            width: '100%',
            willChange: 'transform, opacity, filter',
            transformStyle: 'preserve-3d',
            filter: isAnimating ? 'blur(2px)' : 'none',
          }}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </div>
  );
});