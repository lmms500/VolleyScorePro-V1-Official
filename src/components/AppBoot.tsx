import React, { useState, useEffect, useCallback } from 'react';
import { SplashScreen } from '@ui/SplashScreen';
import { motion, AnimatePresence } from 'framer-motion';

interface AppBootProps {
  children: React.ReactNode;
}

export const AppBoot: React.FC<AppBootProps> = ({ children }) => {
  const [showSplash, setShowSplash] = useState(true);
  const [isAppReady, setIsAppReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAppReady(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const handleSplashComplete = useCallback(() => {
    setShowSplash(false);
  }, []);

  return (
    <>
      <AnimatePresence mode="wait">
        {showSplash && (
          <SplashScreen
            key="splash"
            minDuration={2000}
            onComplete={handleSplashComplete}
          />
        )}
      </AnimatePresence>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isAppReady && !showSplash ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
    </>
  );
};
