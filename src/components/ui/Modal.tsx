
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { overlayVariants } from '../../utils/animations';
import { GlassSurface } from './GlassSurface';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: string;
  showCloseButton?: boolean;
  persistent?: boolean;
  backdropClassName?: string;
  zIndex?: string;
  variant?: 'floating' | 'fullscreen' | 'immersive';
}

const fullscreenVariants: Variants = {
  hidden: {
    y: "100%",
    opacity: 0,
    scale: 0.98,
    transition: { duration: 0.25, ease: [0.32, 0, 0.67, 0] }
  },
  visible: {
    y: "0%",
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      damping: 30,
      stiffness: 300,
      mass: 0.8,
      restDelta: 0.001
    }
  },
  exit: {
    y: "100%",
    opacity: 0,
    scale: 0.98,
    transition: { duration: 0.2, ease: [0.32, 0, 0.67, 0] }
  }
};

const floatingVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    filter: "blur(4px)",
    transition: { duration: 0.2 }
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      type: "spring",
      damping: 25,
      stiffness: 350,
      mass: 0.5
    }
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    filter: "blur(4px)",
    transition: { duration: 0.15 }
  }
};

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'max-w-md',
  showCloseButton = true,
  persistent = false,
  backdropClassName = "bg-slate-950/60 backdrop-blur-sm",
  zIndex = "z-[60]",
  variant = 'floating'
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const handleBackdropClick = () => {
    if (!persistent && variant === 'floating') {
      onClose();
    }
  };

  if (!mounted) return null;

  const isImmersive = variant === 'immersive';
  const isFullscreen = variant === 'fullscreen';

  let containerClasses = "";
  let contentLayoutClasses = "";
  let roundedClasses = "";
  let intensity: 'high' | 'medium' | 'low' = 'high';

  if (isImmersive) {
    containerClasses = `fixed inset-0 ${zIndex} isolate`;
    contentLayoutClasses = `relative w-full h-full overflow-hidden flex flex-col render-crisp`;
    intensity = 'high';
  } else if (isFullscreen) {
    containerClasses = `fixed inset-0 ${zIndex} flex flex-col isolate`;
    contentLayoutClasses = `relative w-full h-full flex flex-col pb-safe-bottom render-crisp`;
    intensity = 'high';
  } else {
    containerClasses = `fixed inset-0 ${zIndex} flex items-center justify-center p-4 landscape:p-2 isolate`;
    contentLayoutClasses = `relative w-full ${maxWidth} flex flex-col max-h-[85vh] landscape:max-h-[95vh] overflow-hidden render-crisp`;
    roundedClasses = "rounded-[2.5rem] landscape:rounded-2xl";
    intensity = 'high';
  }

  const activeVariants = (isImmersive || isFullscreen) ? fullscreenVariants : floatingVariants;
  const shouldRenderHeader = !isImmersive && (title || showCloseButton);

  return createPortal(
    <AnimatePresence mode="wait">
      {isOpen && (
        <div className={containerClasses}>
          {!isImmersive && (
            <motion.div
              className={`absolute inset-0 ${backdropClassName}`}
              style={{ transform: 'translateZ(0)' }}
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={overlayVariants}
              onClick={handleBackdropClick}
            />
          )}

          <GlassSurface
            key="modal-content"
            intensity={intensity}
            className={`${contentLayoutClasses} ${roundedClasses}`}
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={activeVariants}
          >
            {shouldRenderHeader && (
              <div className={`
                flex justify-between items-center z-10 shrink-0 relative
                ${isFullscreen ? 'pt-safe-top px-6 pb-2 min-h-[60px]' : 'px-6 pt-6 pb-3 landscape:py-3'}
                `}>
                <h2 className={`
                    font-extrabold text-slate-800 dark:text-white uppercase tracking-[0.2em] opacity-90 pl-1 drop-shadow-sm
                    ${isFullscreen ? 'text-sm mt-2' : 'text-xs'}
                `}>
                  {title}
                </h2>
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className={`
                        p-2.5 rounded-full 
                        bg-black/5 dark:bg-white/5
                        text-slate-500 dark:text-slate-400
                        hover:bg-black/10 dark:hover:bg-white/10
                        active:scale-95 transition-all
                        border border-black/5 dark:border-white/10 
                        ring-1 ring-inset ring-black/5 dark:ring-white/5
                        ${isFullscreen ? 'mt-2' : ''}
                    `}
                  >
                    <X size={18} strokeWidth={2.5} />
                  </button>
                )}
              </div>
            )}

            <div className={`
              relative z-10
              ${isImmersive ? 'w-full h-full' : 'overflow-y-auto custom-scrollbar flex-1 flex flex-col'}
              ${!isImmersive && (isFullscreen ? `px-4 pb-4 ${!shouldRenderHeader ? 'pt-0' : ''}` : 'px-6 pb-6 landscape:px-5')}
            `}>
              {children}
            </div>
          </GlassSurface>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};
