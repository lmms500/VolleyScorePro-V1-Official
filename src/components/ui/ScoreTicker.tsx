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
  // Calculate direction synchronously to avoid layout thrashing on first render
  const direction = value > prevValue.current ? 1 : (value < prevValue.current ? -1 : 0);

  // Update ref after render (safe for this use case as we want the direction for *this* render)
  if (value !== prevValue.current) {
    prevValue.current = value;
  }

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
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden'
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
          className="text-center leading-none origin-center absolute inset-0 flex items-center justify-center"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            height: '100%',
            width: '100%',
            willChange: 'transform, opacity',
            transformStyle: 'preserve-3d',
          }}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </div>
  );
});