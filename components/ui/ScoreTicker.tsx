
import React, { useEffect, useRef, useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { tickerVariants } from '../../utils/animations';

interface ScoreTickerProps {
  value: number;
  className?: string;
  style?: React.CSSProperties;
}

const ScoreTickerComponent: React.FC<ScoreTickerProps> = ({ value, className, style }) => {
  const prevValue = useRef(value);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    if (value !== prevValue.current) {
      setDirection(value > prevValue.current ? 1 : -1);
      prevValue.current = value;
    }
  }, [value]);

  return (
    <div 
      className={`relative inline-flex justify-center items-center tabular-nums hardware-accelerated ${className}`} 
      style={{ 
        ...style,
        height: '2.5em', 
        minWidth: '1.2em', 
        padding: '0.8em',
        margin: '-0.8em',
        isolation: 'isolate',
        maskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
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
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
          }} 
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </div>
  );
};

//arePropsEqual personalizada para evitar qualquer re-render que não seja mudança de valor
export const ScoreTicker = memo(ScoreTickerComponent, (prev, next) => {
    return prev.value === next.value && prev.className === next.className;
});
