
import React, { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SuddenDeathOverlayProps {
  active: boolean;
  lowGraphics?: boolean;
}

/**
 * Global animated overlay for Sudden Death scenarios.
 * Creates a "breathing" intense red vignette around the screen edges.
 * Updated v3.0: Single unified animation to eliminate flicker.
 */
export const SuddenDeathOverlay: React.FC<SuddenDeathOverlayProps> = memo(({ active, lowGraphics = false }) => {

  // Debug log (remover após teste)
  if (globalThis.window !== undefined && active) {
    console.log('🔴 SuddenDeathOverlay ACTIVE:', active);
  }

  const overlayStyle = lowGraphics
    ? {
      // Lightweight version (static)
      background: 'radial-gradient(circle, transparent 50%, rgba(220, 38, 38, 0.3) 100%)',
      opacity: 0.6
    }
    : {
      // High-end version base
      background: 'radial-gradient(circle, transparent 40%, rgba(153, 27, 27, 0.1) 70%, rgba(220, 38, 38, 0.4) 100%)',
      boxShadow: 'inset 0 0 120px 20px rgba(185, 28, 28, 0.3)',
      filter: 'contrast(1.1) saturate(1.2)',
      willChange: 'opacity'
    };

  // Força esconder se não estiver ativo
  if (!active) return null;

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          key="sudden-death-overlay"
          className="fixed inset-0 z-[5] pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{
            opacity: lowGraphics ? 0.6 : [0.5, 0.75, 0.5]
          }}
          exit={{
            opacity: 0,
            transition: { duration: 0.3 }
          }}
          transition={{
            duration: lowGraphics ? 0.3 : 4,
            repeat: lowGraphics ? 0 : Infinity,
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
