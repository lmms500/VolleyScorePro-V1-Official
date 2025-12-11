
import React, { useEffect, useRef, useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { tickerVariants } from '../../utils/animations';

interface ScoreTickerProps {
  value: number;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * ScoreTicker 2.4 (Glow-Safe Container)
 * 
 * CRITICAL UPDATE:
 * Significantly increased vertical height and padding to ensure that when
 * text-shadow/drop-shadow is applied (Match Point Glow), it is NOT clipped
 * by the `mask-image` used for the scrolling effect.
 * 
 * The mask gradient now starts/ends much further out to allow the glow to fade naturally.
 */
export const ScoreTicker: React.FC<ScoreTickerProps> = memo(({ value, className, style }) => {
  const prevValue = useRef(value);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    if (value !== prevValue.current) {
      if (value > prevValue.current) {
        setDirection(1); 
      } else {
        setDirection(-1); 
      }
      prevValue.current = value;
    }
  }, [value]);

  return (
    <div 
        className={`relative inline-flex justify-center items-center ${className}`} 
        style={{ 
            ...style,
            // Expanded height (~2.5x font size) to allow huge shadow bloom without clipping
            height: '2.5em', 
            // Min width prevents layout shift on narrow numbers
            minWidth: '1.2em', 
            // CRITICAL: Large padding ensures the drop-shadow (glow) fits inside the mask area
            padding: '0.8em',
            // Negative margin to counteract the padding for correct layout flow in parent
            margin: '-0.8em',
            isolation: 'isolate',
            // Relaxed Mask: Fades out only at the very edges (top/bottom 15%)
            maskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
            overflow: 'visible' // Explicitly allow overflow logic where supported
        }}
    >
      <AnimatePresence mode="popLayout" custom={direction} initial={false}>
        <motion.span
          key={value}
          custom={direction}
          variants={tickerVariants}
          initial="enter"
          animate="center"
          exit="exit"
          className="block text-center leading-none origin-center absolute inset-0 flex items-center justify-center"
          style={{ 
              willChange: "transform, opacity, filter", 
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden"
          }} 
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </div>
  );
});
