import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { scoutSpring, scoutSpringBouncy } from './designTokens';
import { getAnimationConfig } from '@lib/platform/animationConfig';

interface SplashScreenProps {
  onComplete?: () => void;
  minDuration?: number;
}

const ShimmerText = ({ children, delay = 0, skipAnimation = false }: { children: React.ReactNode; delay?: number; skipAnimation?: boolean }) => (
  <motion.span
    className="relative inline-block"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ ...scoutSpring, delay }}
  >
    <span className="relative z-10">{children}</span>
    {!skipAnimation && (
      <motion.span
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent bg-[length:200%_100%] -skew-x-12"
        animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
        transition={{ duration: 2, delay: delay + 0.5, repeat: Infinity, repeatDelay: 3 }}
      />
    )}
  </motion.span>
);

export const SplashScreen: React.FC<SplashScreenProps> = ({ 
  onComplete, 
  minDuration = 2000 
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const config = useMemo(() => getAnimationConfig(), []);

  useEffect(() => {
    const readyTimer = setTimeout(() => setIsReady(true), minDuration);
    return () => clearTimeout(readyTimer);
  }, [minDuration]);

  useEffect(() => {
    if (isReady && isVisible) {
      const hideTimer = setTimeout(() => {
        setIsVisible(false);
        onComplete?.();
      }, 500);
      return () => clearTimeout(hideTimer);
    }
  }, [isReady, isVisible, onComplete]);

  const showBackgroundOrbs = !config.isAndroid && !config.isLowEnd;
  const showFloatingParticles = !config.isAndroid && !config.isLowEnd;
  const showIconFloat = !config.isLowEnd;
  const backgroundBlur = config.isAndroid ? 60 : 120;

  return (
    <AnimatePresence onExitComplete={() => {}}>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden"
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0,
            scale: 1.05,
            transition: { duration: 0.4, ease: "easeInOut" }
          }}
          style={config.useContain ? { contain: 'content' } : undefined}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-white to-indigo-50 dark:from-[#020617] dark:via-[#0f172a] dark:to-indigo-950" />

          <motion.div
            className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500"
            initial={{ scaleX: 0, originX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: minDuration / 1000, ease: "easeInOut" }}
          />

          {showBackgroundOrbs && (
            <>
              <motion.div
                className="absolute top-1/3 -left-32 w-96 h-96 bg-indigo-400/30 dark:bg-indigo-500/20 rounded-full"
                style={{ filter: `blur(${backgroundBlur}px)` }}
                animate={{ 
                  x: [0, 50, 0],
                  scale: [1, 1.2, 1]
                }}
                transition={{ duration: 6, repeat: Infinity }}
              />
              
              <motion.div
                className="absolute bottom-1/3 -right-32 w-80 h-80 bg-purple-400/30 dark:bg-purple-500/20 rounded-full"
                style={{ filter: `blur(${backgroundBlur}px)` }}
                animate={{ 
                  x: [0, -40, 0],
                  scale: [1.1, 1, 1.1]
                }}
                transition={{ duration: 5, repeat: Infinity }}
              />
            </>
          )}

          {showFloatingParticles && (
            <>
              <motion.div
                className="absolute top-20 right-20 w-4 h-4 bg-indigo-400 rounded-full"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: [0, 1, 0],
                  opacity: [0, 0.8, 0],
                  y: [0, -100, -200]
                }}
                transition={{ duration: 3, delay: 0.2, repeat: Infinity }}
              />
              
              <motion.div
                className="absolute bottom-32 left-24 w-3 h-3 bg-purple-400 rounded-full"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: [0, 1, 0],
                  opacity: [0, 0.6, 0],
                  y: [0, -80, -160]
                }}
                transition={{ duration: 2.5, delay: 0.8, repeat: Infinity }}
              />
            </>
          )}

          <motion.div
            className="flex flex-col items-center gap-8 relative z-10"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={scoutSpring}
          >
            <motion.div
              className="relative"
              animate={showIconFloat ? { 
                y: [0, -8, 0],
              } : {}}
              transition={{ 
                duration: 3,
                repeat: showIconFloat ? Infinity : 0,
                ease: "easeInOut"
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 blur-3xl opacity-40 rounded-full scale-[1.5]" />
              <motion.img
                src="/icon.png"
                alt="VolleyScore Pro"
                className="w-24 h-24 md:w-32 md:h-32 relative z-10"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ ...scoutSpringBouncy, delay: 0.2 }}
              />
            </motion.div>

            <motion.div 
              className="flex flex-col items-center gap-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <h1 className="text-3xl md:text-4xl font-black tracking-tight">
                <ShimmerText delay={0.8} skipAnimation={config.isAndroid}>
                  <span className="bg-gradient-to-r from-indigo-600 via-purple-500 to-indigo-600 dark:from-indigo-400 dark:via-purple-400 dark:to-indigo-400 bg-clip-text text-transparent">
                    VolleyScore
                  </span>
                </ShimmerText>
                <ShimmerText delay={0.9} skipAnimation={config.isAndroid}>
                  <span className="text-slate-800 dark:text-slate-100 ml-1">Pro</span>
                </ShimmerText>
              </h1>
              
              <motion.p
                className="text-xs font-medium uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                Placar Profissional
              </motion.p>
            </motion.div>
          </motion.div>

          <motion.div
            className="absolute bottom-10 flex flex-col items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            <motion.div className="flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 rounded-full bg-indigo-400 dark:bg-indigo-500"
                  animate={{ 
                    scale: [1, 1.3, 1],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{ 
                    duration: 1,
                    delay: i * 0.2,
                    repeat: Infinity 
                  }}
                />
              ))}
            </motion.div>
            
            <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 tracking-wider">
              Carregando...
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
