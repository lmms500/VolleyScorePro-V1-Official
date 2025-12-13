
import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, Check } from 'lucide-react';
import { useTranslation } from '../../contexts/LanguageContext';
import { TutorialKey } from '../../hooks/useTutorial';
import { TUTORIAL_SCENARIOS } from '../../data/tutorialContent';
import { resolveTheme } from '../../utils/colors';
import { TutorialVisual } from '../tutorial/TutorialVisuals';

interface RichTutorialModalProps {
  isOpen: boolean;
  tutorialKey: TutorialKey;
  onClose: (key: TutorialKey) => void;
}

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 }
};

const modalVariants = {
  hidden: { scale: 0.95, opacity: 0, y: 20 },
  visible: { 
    scale: 1, 
    opacity: 1, 
    y: 0,
    transition: { type: "spring", stiffness: 350, damping: 30 }
  },
  exit: { scale: 0.95, opacity: 0, y: 10 }
};

const contentVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 30 : -30,
    opacity: 0,
    scale: 0.98
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3, type: "spring", bounce: 0, stiffness: 300, damping: 30 }
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 30 : -30,
    opacity: 0,
    scale: 0.98,
    transition: { duration: 0.2 }
  })
};

export const RichTutorialModal: React.FC<RichTutorialModalProps> = ({ 
  isOpen, tutorialKey, onClose 
}) => {
  const { t } = useTranslation();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const steps = useMemo(() => TUTORIAL_SCENARIOS[tutorialKey] || [], [tutorialKey]);
  const currentStep = steps[currentStepIndex];

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setCurrentStepIndex(0);
      setDirection(0);
    }
  }, [isOpen, tutorialKey]);

  if (!isOpen || !currentStep) return null;

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setDirection(1);
      setCurrentStepIndex(prev => prev + 1);
    } else {
      onClose(tutorialKey);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setDirection(-1);
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    onClose(tutorialKey);
  };

  // Resolve color for current step to build dynamic classes
  const colorTheme = resolveTheme(currentStep.color);
  
  // Dynamic Background Gradient for Header
  const headerGradientStyle = {
    background: `linear-gradient(135deg, ${currentStep.color === 'slate' ? '#64748b' : colorTheme.halo.replace('bg-[', '').replace(']', '')}20 0%, ${currentStep.color === 'slate' ? '#64748b' : colorTheme.halo.replace('bg-[', '').replace(']', '')}05 100%)`
  };

  const IconComponent = currentStep.icon;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 isolate">
          
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={handleSkip}
          />

          {/* Main Card */}
          <motion.div
            className="relative w-full max-w-[340px] bg-white dark:bg-[#0f172a] rounded-[2rem] shadow-2xl overflow-hidden flex flex-col ring-1 ring-white/20"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            
            {/* Top Close Button (Subtle) */}
            <button 
              onClick={handleSkip}
              className="absolute top-3 right-3 z-20 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            >
              <X size={18} />
            </button>

            {/* Dynamic Content Container */}
            <div className="flex-1 flex flex-col relative min-h-[360px]">
              <AnimatePresence initial={false} custom={direction} mode="wait">
                <motion.div
                  key={currentStepIndex}
                  custom={direction}
                  variants={contentVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="absolute inset-0 flex flex-col"
                >
                  
                  {/* 1. HERO VISUAL AREA (40% Height - Reduced) */}
                  {currentStep.visualId ? (
                      <div className="h-[42%] w-full relative overflow-hidden bg-slate-50 dark:bg-white/5 border-b border-black/5 dark:border-white/5">
                          <TutorialVisual visualId={currentStep.visualId} colorTheme={colorTheme} />
                      </div>
                  ) : (
                      <div 
                        className="h-[42%] w-full flex items-center justify-center relative overflow-hidden"
                        style={headerGradientStyle}
                      >
                        {/* Floating Decorative Blobs */}
                        <div className={`absolute top-[-20%] left-[-20%] w-32 h-32 rounded-full opacity-30 blur-2xl ${colorTheme.bg}`} />
                        <div className={`absolute bottom-[-10%] right-[-10%] w-40 h-40 rounded-full opacity-20 blur-3xl ${colorTheme.halo}`} />

                        {/* Main Icon */}
                        <motion.div 
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                          className={`
                            relative z-10 w-20 h-20 rounded-3xl flex items-center justify-center 
                            bg-white dark:bg-white/10 shadow-xl
                            ${colorTheme.text} dark:text-white
                            ring-1 ring-black/5 dark:ring-white/10
                          `}
                        >
                          <IconComponent size={40} strokeWidth={1.5} />
                        </motion.div>
                      </div>
                  )}

                  {/* 2. Text Content Area (Compact) */}
                  <div className="flex-1 px-6 pt-4 pb-2 flex flex-col items-center text-center">
                    
                    {/* Progress Dots integrated into content area top */}
                    <div className="flex justify-center gap-1.5 mb-3 opacity-80">
                        {steps.map((_, idx) => (
                        <div 
                            key={idx}
                            className={`
                            h-1 rounded-full transition-all duration-300
                            ${idx === currentStepIndex 
                                ? `w-4 ${colorTheme.halo}` 
                                : 'w-1 bg-slate-200 dark:bg-white/10'}
                            `}
                        />
                        ))}
                    </div>

                    <h2 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tight mb-2 leading-tight">
                      {t(currentStep.titleKey)}
                    </h2>
                    
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed max-w-[260px] mx-auto">
                        {t(currentStep.descKey)}
                      </p>
                      
                      {/* Special Case: Welcome Slide Opt-In Text - Subtle now */}
                      {currentStep.id === 'welcome' && (
                          <p className="mt-3 text-[10px] text-slate-400 dark:text-slate-500 italic">
                              {t('tutorial.welcome.optIn')}
                          </p>
                      )}

                      {/* Optional Custom Component Injection */}
                      {currentStep.CustomComponent && (
                        <div className="mt-3 w-full flex justify-center scale-90">
                          {currentStep.CustomComponent}
                        </div>
                      )}
                    </div>
                  </div>

                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer Navigation (Compact) */}
            <div className="px-6 pb-6 pt-2 bg-white dark:bg-[#0f172a] z-10 relative">
              
              {/* Action Buttons */}
              <div className="flex gap-3 mt-1">
                {currentStepIndex > 0 ? (
                  <button 
                    onClick={handlePrev}
                    className="flex-1 py-3 rounded-xl font-bold text-[11px] uppercase tracking-widest text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  >
                    {t('common.back')}
                  </button>
                ) : (
                  <button 
                    onClick={handleSkip}
                    className="flex-1 py-3 rounded-xl font-bold text-[11px] uppercase tracking-widest text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  >
                    {t('tutorial.skip')}
                  </button>
                )}

                <button 
                  onClick={handleNext}
                  className={`
                    flex-[2] py-3 rounded-xl font-black text-[11px] uppercase tracking-widest text-white shadow-md flex items-center justify-center gap-2 transition-transform active:scale-95
                    ${colorTheme.halo.replace('bg-', 'bg-')}
                  `}
                >
                  {currentStepIndex < steps.length - 1 ? (
                    <>{t('tutorial.next')} <ChevronRight size={14} /></>
                  ) : (
                    <>{t('common.done')} <Check size={14} /></>
                  )}
                </button>
              </div>

            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};
