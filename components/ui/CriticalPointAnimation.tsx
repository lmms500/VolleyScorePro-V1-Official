
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { vignettePulse } from '../../utils/animations';

interface SuddenDeathOverlayProps {
  active: boolean;
}

/**
 * Global animated overlay for Sudden Death scenarios.
 * Creates a "breathing" intense red vignette around the screen edges.
 * Updated v2.1: Smoother ease-in-out and scale modulation.
 */
export const SuddenDeathOverlay: React.FC<SuddenDeathOverlayProps> = ({ active }) => {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          className="fixed inset-0 z-[5] pointer-events-none"
          initial="hidden"
          animate="pulse"
          exit="hidden"
          variants={vignettePulse}
          style={{
            background: 'radial-gradient(circle, transparent 40%, rgba(153, 27, 27, 0.1) 70%, rgba(220, 38, 38, 0.4) 100%)',
            boxShadow: 'inset 0 0 120px 20px rgba(185, 28, 28, 0.3)',
            filter: 'contrast(1.1) saturate(1.2)'
          }}
        >
            {/* Pulsing inner ring */}
            <motion.div 
                className="absolute inset-0 border-[20px] border-red-600/10 blur-2xl"
                animate={{ 
                    opacity: [0.2, 0.5, 0.2],
                    scale: [1, 1.02, 1] 
                }}
                transition={{ duration: 2, repeat: Infinity }}
            />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
