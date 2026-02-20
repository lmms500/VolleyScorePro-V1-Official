import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LowerThirdProps {
  show: boolean;
  children: React.ReactNode;
  position?: 'left' | 'right' | 'center';
  duration?: number;
  onHide?: () => void;
}

export const LowerThird: React.FC<LowerThirdProps> = ({
  show,
  children,
  position = 'left',
  onHide,
}) => {
  const positionClasses = {
    left: 'left-8 bottom-24',
    right: 'right-8 bottom-24',
    center: 'left-1/2 -translate-x-1/2 bottom-24',
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ x: position === 'right' ? 100 : position === 'left' ? -100 : 0, opacity: 0, y: 20 }}
          animate={{ x: 0, opacity: 1, y: 0 }}
          exit={{ x: position === 'right' ? 100 : position === 'left' ? -100 : 0, opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className={`fixed ${positionClasses[position]} pointer-events-none z-40`}
        >
          <div className="relative">
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent backdrop-blur-xl rounded-lg origin-left"
            />
            <div className="relative overflow-hidden rounded-lg border border-white/10 shadow-2xl">
              {children}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

interface LowerThirdHeaderProps {
  title: string;
  subtitle?: string;
  color?: string;
}

export const LowerThirdHeader: React.FC<LowerThirdHeaderProps> = ({
  title,
  subtitle,
  color,
}) => (
  <div 
    className="px-4 py-2 flex items-center gap-3"
    style={{ backgroundColor: color ? `${color}cc` : 'rgba(0,0,0,0.8)' }}
  >
    <motion.div
      initial={{ width: 0 }}
      animate={{ width: 4 }}
      className="h-8 bg-white rounded-full"
    />
    <div className="flex flex-col">
      <span className="text-lg font-black text-white uppercase tracking-tight">
        {title}
      </span>
      {subtitle && (
        <span className="text-xs font-medium text-white/60 uppercase tracking-wider">
          {subtitle}
        </span>
      )}
    </div>
  </div>
);

interface LowerThirdBodyProps {
  children: React.ReactNode;
}

export const LowerThirdBody: React.FC<LowerThirdBodyProps> = ({ children }) => (
  <div className="px-4 py-3 bg-black/80 backdrop-blur-sm">
    {children}
  </div>
);
