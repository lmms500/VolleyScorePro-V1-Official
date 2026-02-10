
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { overlayVariants, springSnappy } from '../../utils/animations';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
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
    transition: { duration: 0.3, ease: [0.32, 0, 0.67, 0] }
  },
  visible: {
    y: "0%",
    opacity: 1,
    transition: { type: "spring", damping: 35, stiffness: 300, mass: 1, restDelta: 0.001 }
  },
  exit: {
    y: "100%",
    opacity: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
  }
};

const floatingVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.9,
    y: 30,
    filter: "blur(10px)",
    transition: { duration: 0.2 }
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    filter: "none",
    transition: { type: "spring", damping: 25, stiffness: 400 }
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    filter: "blur(4px)",
    transition: { duration: 0.2, ease: "easeIn" }
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
  backdropClassName = "bg-slate-950/40 backdrop-blur-md",
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

  const bgClasses = `bg-gradient-to-b from-slate-900/90 to-slate-950/95 backdrop-blur-3xl`;

  const gradientOverlay = (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden rounded-inherit">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,_rgba(226,232,240,0.3)_0%,_rgba(241,245,249,0.1)_90%)] dark:bg-[radial-gradient(circle_at_50%_40%,_rgba(30,41,59,0.2)_0%,_rgba(2,6,23,0.3)_90%)] opacity-100" />
    </div>
  );

  let containerClasses = "";
  let contentLayoutClasses = "";
  let borderClasses = "";
  let roundedClasses = "";
  let shadowClasses = "";

  if (isImmersive) {
    containerClasses = `fixed inset-0 ${zIndex} isolate`;
    contentLayoutClasses = `relative w-full h-full overflow-hidden flex flex-col render-crisp ${bgClasses}`;
  } else if (isFullscreen) {
    containerClasses = `fixed inset-0 ${zIndex} flex flex-col isolate`;
    contentLayoutClasses = `relative w-full h-full flex flex-col pb-safe-bottom render-crisp ${bgClasses}`;
    borderClasses = "border-t border-white/20 dark:border-white/10";
  } else {
    containerClasses = `fixed inset-0 ${zIndex} flex items-center justify-center p-4 landscape:p-2 isolate`;
    contentLayoutClasses = `relative w-full ${maxWidth} flex flex-col max-h-[85vh] landscape:max-h-[95vh] overflow-hidden render-crisp ${bgClasses}`;
    borderClasses = "border border-white/40 dark:border-white/10 ring-1 ring-inset ring-black/5 dark:ring-white/10";
    roundedClasses = "rounded-[2.5rem] landscape:rounded-2xl";
    shadowClasses = "shadow-2xl shadow-black/40";
  }

  const activeVariants = (isImmersive || isFullscreen) ? fullscreenVariants : floatingVariants;
  const shouldRenderHeader = !isImmersive && (title || showCloseButton);

  return createPortal(
    <AnimatePresence mode="wait">
      {isOpen && (
        <div className={containerClasses}>
          {!isImmersive && (
            <motion.div
              className={`absolute inset-0 ${backdropClassName} ${isFullscreen ? 'bg-black/40 backdrop-blur-sm' : ''}`}
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={overlayVariants}
              onClick={handleBackdropClick}
            />
          )}

          <motion.div
            key="modal-content"
            className={`${contentLayoutClasses} ${borderClasses} ${roundedClasses} ${shadowClasses} will-change-transform`}
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={activeVariants}
          >
            {gradientOverlay}

            {shouldRenderHeader && (
              <div className={`
                flex justify-between items-center z-10 shrink-0 relative
                ${isFullscreen ? 'pt-safe-top px-6 pb-2 border-b border-black/5 dark:border-white/5 h-auto min-h-[60px]' : 'px-6 pt-6 pb-3 landscape:py-3'}
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
                        bg-gradient-to-br from-white/15 to-white/5
                        text-slate-500 dark:text-slate-400
                        hover:from-white/20 hover:to-white/10
                        active:scale-95 transition-all
                        border border-white/10 
                        ring-1 ring-inset ring-white/5
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
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};
