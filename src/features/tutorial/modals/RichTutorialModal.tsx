

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { X, ChevronRight, Check, ChevronLeft, Pause, Play, Download } from 'lucide-react';
import { useTranslation } from '@contexts/LanguageContext';
import { TutorialKey } from '../hooks/useTutorial';
import { TUTORIAL_SCENARIOS } from '../data/tutorialContent';
import { resolveTheme } from '@lib/utils/colors';
import { TutorialVisual } from '../components/TutorialVisuals';

interface RichTutorialModalProps {
  isOpen: boolean;
  tutorialKey: TutorialKey;
  onClose: (key: TutorialKey) => void;
  canInstall?: boolean;
  onInstall?: () => void;
  isStandalone?: boolean;
  isIOS?: boolean;
}

const WELCOME_LOCK_DURATION = 3;

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 }
};

const modalVariants: Variants = {
  hidden: { scale: 0.95, opacity: 0, y: 20 },
  visible: { 
    scale: 1, 
    opacity: 1, 
    y: 0,
    transition: { type: "spring" as const, stiffness: 350, damping: 30 }
  },
  exit: { scale: 0.95, opacity: 0, y: 10 }
};

const contentVariants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 50 : -50,
    opacity: 0,
    scale: 0.95
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, type: "spring" as const, bounce: 0, stiffness: 300, damping: 30 }
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 50 : -50,
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.2 }
  })
};

export const RichTutorialModal: React.FC<RichTutorialModalProps> = ({ 
  isOpen, tutorialKey, onClose, canInstall, onInstall, isStandalone, isIOS
}) => {
  const { t } = useTranslation();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [welcomeLockCountdown, setWelcomeLockCountdown] = useState(WELCOME_LOCK_DURATION);

  const steps = useMemo(() => {
      const rawSteps = TUTORIAL_SCENARIOS[tutorialKey] || [];
      if (tutorialKey === 'main' && isStandalone) {
          return rawSteps.filter(s => s.id !== 'install');
      }
      return rawSteps;
  }, [tutorialKey, isStandalone]);

  const currentStep = steps[currentStepIndex];

  useEffect(() => {
    if (isOpen) {
      setCurrentStepIndex(0);
      setDirection(0);
      setIsPaused(false);
      setIsReady(false);
      setCompletedSteps(new Set());
      setWelcomeLockCountdown(WELCOME_LOCK_DURATION);
    }
  }, [isOpen, tutorialKey]);

  useEffect(() => {
      setIsReady(false);
      const timer = setTimeout(() => {
          setIsReady(true);
      }, 500); 
      return () => clearTimeout(timer);
  }, [currentStepIndex]);

  useEffect(() => {
    const isWelcomeStep = currentStep?.id === 'welcome' && currentStepIndex === 0;
    
    if (isWelcomeStep && welcomeLockCountdown > 0) {
      const timer = setTimeout(() => {
        setWelcomeLockCountdown(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentStep?.id, currentStepIndex, welcomeLockCountdown]);

  const isWelcomeLocked = currentStep?.id === 'welcome' && currentStepIndex === 0 && welcomeLockCountdown > 0;

  if (!isOpen || !currentStep) return null;

  const isInstallStep = currentStep.id === 'install';

  // Determine if current step is interactive and whether it's been completed
  const isStepInteractive = currentStep.isInteractive === true;
  const isStepCompleted = completedSteps.has(currentStep.id);
  const isNextButtonDisabled = isStepInteractive && !isStepCompleted;

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setDirection(1);
      setCurrentStepIndex(prev => prev + 1);
    } else if (isInstallStep && canInstall && onInstall) {
      // Install step with installation capability
      onInstall();
      // We close immediately to show the browser prompt
      onClose(tutorialKey);
    } else {
      // Last step - just close
      onClose(tutorialKey);
    }
  };

  const handleStepComplete = () => {
    // Mark current step as completed
    const updated = new Set(completedSteps);
    updated.add(currentStep.id);
    setCompletedSteps(updated);
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setDirection(-1);
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    onClose(tutorialKey);
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  const colorTheme = resolveTheme(currentStep.color);
  const effectiveIsPaused = isPaused || !isReady;

  // Determine button text for Install Step
  const getInstallButtonContent = () => {
      if (canInstall) {
          return <>{t('install.installNow')} <Download size={18} strokeWidth={3} /></>;
      }
      if (isIOS) {
          return <>{t('common.done')} <Check size={18} strokeWidth={3} /></>;
      }
      return <>{t('common.done')} <Check size={18} strokeWidth={3} /></>;
  };

  // Determine description text override for Install Step (iOS instructions vs Android/Generic)
  const getDescriptionKey = () => {
      if (isInstallStep && isIOS) {
          return 'tutorial.install.descIOSShort'; // Or a dedicated full string for iOS instructions
      }
      return currentStep.descKey;
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 isolate">
          
          <motion.div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={isWelcomeLocked ? undefined : handleSkip}
          />

          <motion.div
            className="
                relative w-full 
                max-w-[360px] landscape:max-w-3xl landscape:h-[85vh]
                bg-white/70 dark:bg-[#0f172a]/70 backdrop-blur-xl
                rounded-2xl shadow-2xl 
                overflow-hidden flex flex-col landscape:flex-row
                ring-1 ring-white/20 dark:ring-white/10
            "
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            
            {/* Controls Layer - Repositioned for Landscape */}
            <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
               <button 
                onClick={togglePause}
                className="p-2.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white bg-white/20 hover:bg-white/40 backdrop-blur-sm transition-colors"
                title={isPaused ? "Play Animation" : "Pause Animation"}
              >
                {isPaused ? <Play size={18} fill="currentColor" /> : <Pause size={18} fill="currentColor" />}
              </button>

              <button 
                onClick={handleSkip}
                disabled={isWelcomeLocked}
                className={`p-2.5 rounded-full backdrop-blur-sm transition-all ${
                  isWelcomeLocked 
                    ? 'text-slate-300 dark:text-slate-600 bg-white/10 cursor-not-allowed' 
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-white bg-white/20 hover:bg-white/40'
                }`}
              >
                <X size={18} />
              </button>
            </div>

            {/* SPLIT LAYOUT CONTAINER */}
            <div className="flex flex-col landscape:flex-row w-full h-full">
                
                {/* 1. HERO VISUAL AREA (Left in Landscape) */}
                <div className="h-[440px] sm:h-[520px] landscape:h-full landscape:w-1/2 w-full relative bg-slate-50/50 dark:bg-white/5 border-b landscape:border-b-0 landscape:border-r border-black/5 dark:border-white/5 flex items-center justify-center overflow-hidden" style={{ touchAction: 'none' }}>
                    <AnimatePresence initial={false} custom={direction} mode="wait">
                        <motion.div
                            key={`vis-${currentStep.id}`}
                            custom={direction}
                            variants={contentVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            className="w-full h-full absolute inset-0"
                        >
                            <TutorialVisual 
                                visualId={currentStep.visualId || 'app_logo'} 
                                colorTheme={colorTheme} 
                                isPaused={effectiveIsPaused}
                                onComplete={handleStepComplete}
                            />
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* 2. TEXT & NAVIGATION AREA (Right in Landscape) */}
                <div className="landscape:w-1/2 flex flex-col h-full bg-transparent relative z-20">
                    
                    <div className="flex-1 flex flex-col items-center justify-center text-center px-6 sm:px-8 pt-6 sm:pt-8 pb-4 landscape:pt-12 overflow-y-auto custom-scrollbar">
                        <AnimatePresence initial={false} custom={direction} mode="wait">
                            <motion.div
                                key={`txt-${currentStep.id}`}
                                custom={direction}
                                variants={contentVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                className="flex flex-col items-center"
                            >
                                {/* Progress Dots */}
                                <div className="flex justify-center gap-2 mb-6 landscape:mb-4 opacity-80">
                                    {steps.map((_, idx) => (
                                    <div 
                                        key={idx}
                                        className={`
                                        h-1.5 rounded-full transition-all duration-300
                                        ${idx === currentStepIndex 
                                            ? `w-8 ${colorTheme.halo}` 
                                            : 'w-1.5 bg-slate-200 dark:bg-white/10'}
                                        `}
                                    />
                                    ))}
                                </div>

                                <h2 className="text-2xl sm:text-3xl landscape:text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tight mb-3 sm:mb-4 leading-none">
                                {t(currentStep.titleKey)}
                                </h2>
                                
                                <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs landscape:max-w-sm">
                                    {t(getDescriptionKey())}
                                </p>
                                
                                {currentStep.id === 'welcome' && (
                                    <p className="mt-3 sm:mt-4 text-[9px] sm:text-[10px] text-slate-400 dark:text-slate-600 italic">
                                        {t('tutorial.welcome.optIn')}
                                    </p>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Footer Navigation (Fixed at bottom of right column) */}
                        <div className="px-8 pb-8 pt-4 z-10 shrink-0 w-full mt-auto">
                        <div className="flex gap-4">
                            {currentStepIndex > 0 ? (
                                <button 
                                    onClick={handleBack}
                                    className="p-4 rounded-2xl font-bold text-slate-400 hover:text-slate-600 dark:hover:text-white bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
                                >
                                    <ChevronLeft size={20} strokeWidth={3} />
                                </button>
                            ) : (
                                <button 
                                    onClick={handleSkip}
                                    disabled={isWelcomeLocked}
                                    className={`p-4 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all ${
                                      isWelcomeLocked
                                        ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
                                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-white'
                                    }`}
                                >
                                    {isWelcomeLocked ? welcomeLockCountdown : t('tutorial.skip')}
                                </button>
                            )}

                            <button 
                                onClick={handleNext}
                                disabled={isNextButtonDisabled || isWelcomeLocked}
                                className={`
                                    flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-white shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95
                                    ${(isNextButtonDisabled || isWelcomeLocked)
                                      ? 'opacity-50 cursor-not-allowed bg-slate-300 dark:bg-slate-700'
                                      : `${colorTheme.halo.replace('bg-', 'bg-')} ${isStepCompleted ? 'animate-pulse' : ''}`
                                    }
                                `}
                            >
                                {isWelcomeLocked ? (
                                    <>
                                      <span className="text-base font-black">{welcomeLockCountdown}</span>
                                      <span className="text-[10px] normal-case font-medium">seg</span>
                                    </>
                                ) : currentStepIndex < steps.length - 1 ? (
                                    <>{t('tutorial.next')} <ChevronRight size={18} strokeWidth={3} /></>
                                ) : (
                                    isInstallStep ? getInstallButtonContent() : <>{t('common.done')} <Check size={18} strokeWidth={3} /></>
                                )}
                            </button>
                        </div>
                        
                        {isWelcomeLocked && (
                          <motion.p 
                            className="text-center text-[10px] text-slate-400 dark:text-slate-500 mt-3"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                          >
                            {t('tutorial.welcome.waitMessage')}
                          </motion.p>
                        )}
                    </div>
                </div>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};