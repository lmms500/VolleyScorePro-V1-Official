
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
    transition: { duration: 0.2, ease: "easeIn" }
  },
  visible: { 
    y: "0%",
    opacity: 1,
    transition: { type: "spring", damping: 30, stiffness: 300, mass: 1 }
  },
  exit: { 
    y: "100%",
    opacity: 0, 
    transition: { duration: 0.3, ease: "easeInOut" }
  }
};

const floatingVariants: Variants = {
  hidden: { 
    opacity: 0,
    scale: 0.95,
    y: 20,
    filter: "blur(4px)",
    transition: { duration: 0.2 }
  },
  visible: { 
    opacity: 1,
    scale: 1,
    y: 0,
    filter: "none", 
    transition: springSnappy
  },
  exit: { 
    opacity: 0, 
    scale: 0.95,
    y: 10,
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
  backdropClassName = "bg-black/40 backdrop-blur-sm", 
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

  // --- BACKGROUND STYLES (Neo-Glass Mobile Premium) ---
  // Updated: Increased transparency to /70 (was /90) for stronger glass effect
  const bgClasses = `bg-slate-50/70 dark:bg-[#020617]/70 backdrop-blur-xl`;
  
  const gradientOverlay = (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden rounded-inherit">
        {/* Updated Gradients to start with some alpha to allow glass effect to shine through */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,_rgba(226,232,240,0.4)_0%,_rgba(241,245,249,0.6)_90%)] dark:bg-[radial-gradient(circle_at_50%_40%,_rgba(30,41,59,0.4)_0%,_rgba(2,6,23,0.6)_90%)] opacity-100" />
        <div className="absolute inset-0 noise-overlay opacity-50" />
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
      borderClasses = "";
      roundedClasses = "";
      shadowClasses = "";
  } else if (isFullscreen) {
      containerClasses = `fixed inset-0 ${zIndex} flex flex-col isolate`;
      contentLayoutClasses = `relative w-full h-full flex flex-col pb-safe-bottom render-crisp ${bgClasses}`;
      borderClasses = "";
      roundedClasses = "";
      shadowClasses = "";
  } else {
      // Floating
      containerClasses = `fixed inset-0 ${zIndex} flex items-center justify-center p-4 landscape:p-2 isolate`;
      contentLayoutClasses = `
        relative w-full ${maxWidth} 
        flex flex-col max-h-[85vh] landscape:max-h-[95vh] overflow-hidden
        render-crisp
        ${bgClasses}
      `;
      borderClasses = "border border-white/40 dark:border-white/10 ring-1 ring-white/50 dark:ring-white/5";
      roundedClasses = "rounded-[2rem] landscape:rounded-2xl";
      shadowClasses = "shadow-2xl shadow-black/20";
  }

  // Choose animation variants
  const activeVariants = (isImmersive || isFullscreen) ? fullscreenVariants : floatingVariants;

  // Logic to determine if header should be rendered at all
  // If no title AND no close button, we remove the container to save space
  const shouldRenderHeader = !isImmersive && (title || showCloseButton);

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className={containerClasses}>
          {/* Backdrop (Only for floating, immersive usually covers everything) */}
          {!isImmersive && (
            <motion.div 
                className={`absolute inset-0 ${backdropClassName} ${isFullscreen ? 'bg-black/20 backdrop-blur-none' : ''}`}
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={overlayVariants}
                onClick={handleBackdropClick}
            />
          )}
          
          {/* Main Content */}
          <motion.div 
            key="modal-content"
            className={`${contentLayoutClasses} ${borderClasses} ${roundedClasses} ${shadowClasses}`}
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={activeVariants}
          >
            {/* Global Tactical Background Layer */}
            {gradientOverlay}

            {/* Header (Skipped for Immersive OR if empty title/no close button) */}
            {shouldRenderHeader && (
                <div className={`
                flex justify-between items-center z-10 shrink-0 relative
                ${isFullscreen ? 'pt-safe-top px-6 pb-2 border-b border-black/5 dark:border-white/5 h-auto min-h-[60px] bg-transparent' : 'px-6 pt-5 pb-3 landscape:py-3 landscape:px-5 bg-transparent'}
                `}>
                <h2 className={`
                    font-black text-slate-800 dark:text-white uppercase tracking-[0.2em] opacity-90 pl-1 drop-shadow-sm
                    ${isFullscreen ? 'text-sm mt-2' : 'text-xs'}
                `}>
                    {title}
                </h2>
                {showCloseButton && (
                    <button 
                    onClick={onClose} 
                    className={`
                        p-2 rounded-full 
                        bg-slate-100/50 dark:bg-white/5 
                        hover:bg-slate-200 dark:hover:bg-white/10 
                        text-slate-400 hover:text-slate-900 dark:hover:text-white 
                        transition-all active:scale-95 border border-transparent hover:border-slate-200 dark:hover:border-white/10
                        ${isFullscreen ? 'mt-2' : ''}
                    `}
                    >
                    <X size={18} strokeWidth={2.5} />
                    </button>
                )}
                </div>
            )}
            
            {/* Body */}
            {/* If header is removed in fullscreen, add top padding to body for safe area */}
            <div className={`
              relative z-10
              ${isImmersive ? 'w-full h-full' : 'overflow-y-auto custom-scrollbar text-slate-600 dark:text-slate-300 leading-relaxed flex-1 flex flex-col'}
              ${!isImmersive && (isFullscreen ? `px-4 pb-4 ${!shouldRenderHeader ? 'pt-0' : ''}` : 'px-6 pb-6 landscape:px-5 landscape:pb-4')}
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
