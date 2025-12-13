
import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useTranslation } from '../../contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, Hand, ChevronRight, Check, Activity, BarChart2, Zap
} from 'lucide-react';
import { usePlatform } from '../../hooks/usePlatform';
import { TutorialKey } from '../../hooks/useTutorial';

export interface TutorialStep {
    id: string;
    title: string;
    desc: string;
    icon: any;
    color: string;
    content?: React.ReactNode;
}

interface TutorialModalProps {
  isOpen: boolean;
  tutorialKey: TutorialKey;
  onClose: (key: TutorialKey) => void;
  onDismiss?: () => void;
  onInstall?: () => void;
  canInstall?: boolean;
  isIOS?: boolean;
  isStandalone?: boolean;
}

const Slide = ({ title, desc, icon: Icon, color, children }: any) => (
  <div className="flex flex-col items-center text-center w-full px-2">
    {/* Minimalist Icon Header */}
    <div className={`
        p-4 rounded-2xl mb-4 
        ${color.replace('bg-', 'bg-opacity-10 bg-')} 
        ${color.replace('bg-', 'text-')}
        ring-1 ring-current ring-opacity-20
    `}>
      <Icon size={32} strokeWidth={2} />
    </div>

    {/* Content */}
    <h3 className="text-lg font-black uppercase tracking-tight text-slate-800 dark:text-white mb-2 leading-none">
        {title}
    </h3>
    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-[260px]">
        {desc}
    </p>

    {/* Dynamic Visual Content */}
    <div className="mt-6 w-full flex justify-center min-h-[80px]">
        {children}
    </div>
  </div>
);

// Visual Component for Gestures
const GestureDemo = () => (
    <div className="flex gap-6">
        <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-16 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center relative overflow-hidden">
                <div className="absolute w-8 h-8 rounded-full bg-indigo-500/20 animate-ping" />
                <div className="w-3 h-3 rounded-full bg-indigo-500" />
            </div>
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Tap +1</span>
        </div>
        <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-16 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center relative">
                <div className="w-3 h-3 rounded-full bg-rose-500 absolute top-3 animate-[bounce_1.5s_infinite]" />
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/5 to-transparent" />
            </div>
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Swipe -1</span>
        </div>
    </div>
);

// Visual Component for Scout Feedback
const StatsFeedbackDemo = () => (
    <div className="flex flex-col items-center gap-2 w-full max-w-[200px]">
        {/* Mock Toast */}
        <motion.div 
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ repeat: Infinity, repeatDelay: 2, duration: 0.5 }}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 w-full"
        >
            <div className="p-1 rounded-full bg-emerald-500 text-white">
                <Zap size={10} fill="currentColor" />
            </div>
            <div className="flex flex-col text-left">
                <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 leading-none">ATTACK POINT</span>
                <span className="text-[8px] font-medium text-slate-400">Player Name (+1)</span>
            </div>
        </motion.div>
    </div>
);

export const TutorialModal: React.FC<TutorialModalProps> = ({ 
  isOpen, tutorialKey, onClose, onDismiss 
}) => {
  const { t } = useTranslation();
  const [step, setStep] = useState(0);
  const { isNative } = usePlatform();

  useEffect(() => {
      if (isOpen) setStep(0);
  }, [isOpen]);

  // --- STEPS CONFIGURATION ---
  
  const getMainSteps = (): TutorialStep[] => [
      { 
          id: 'gestures', 
          title: t('tutorial.gestures.title'), 
          desc: t('tutorial.gestures.desc'), 
          icon: Hand, 
          color: 'bg-indigo-500', 
          content: <GestureDemo /> 
      },
      { 
          id: 'stats', 
          title: t('tutorial.history.stats'), // Reuse for Main tour to explain feedback
          desc: t('tutorial.history.statsFeedback'), // Assertive feedback desc
          icon: Activity, 
          color: 'bg-emerald-500',
          content: <StatsFeedbackDemo />
      }
  ];

  const getManagerSteps = (): TutorialStep[] => [
      { id: 'roster', title: t('tutorial.manager.roster'), desc: t('tutorial.manager.rosterDesc'), icon: Trophy, color: 'bg-indigo-500' },
      { id: 'rotation', title: t('tutorial.manager.rotation'), desc: t('tutorial.manager.rotationDesc'), icon: Activity, color: 'bg-rose-500' }
  ];

  const getHistorySteps = (): TutorialStep[] => [
      { id: 'stats', title: t('tutorial.history.stats'), desc: t('tutorial.history.statsDesc'), icon: BarChart2, color: 'bg-violet-500' },
      { id: 'feedback', title: t('tutorial.history.feedback'), desc: t('tutorial.history.statsFeedback'), icon: Check, color: 'bg-emerald-500', content: <StatsFeedbackDemo /> }
  ];

  let currentSteps: TutorialStep[] = [];
  let welcomeTitle = "";
  let welcomeDesc = "";

  if (tutorialKey === 'manager') {
      currentSteps = getManagerSteps();
      welcomeTitle = t('tutorial.manager.welcome');
      welcomeDesc = t('tutorial.manager.welcomeDesc');
  } else if (tutorialKey === 'history') {
      currentSteps = getHistorySteps();
      welcomeTitle = t('tutorial.history.welcome');
      welcomeDesc = t('tutorial.history.welcomeDesc');
  } else {
      currentSteps = getMainSteps();
      welcomeTitle = t('tutorial.welcome.title');
      welcomeDesc = t('tutorial.welcome.desc');
  }

  const handleNext = () => {
    const max = currentSteps.length; 
    if (step < max) {
      setStep(step + 1);
    } else {
      onClose(tutorialKey);
    }
  };

  const isWelcome = step === 0;
  const activeStepData = !isWelcome ? currentSteps[step - 1] : null;

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={() => onClose(tutorialKey)} 
      title="" // Minimalist: No top title
      showCloseButton={false} // Minimalist: Use bottom buttons
      persistent={true}
      maxWidth="max-w-sm"
    >
      <div className="flex flex-col min-h-[320px]">
        
        {/* Progress Bar (Minimal Top) */}
        <div className="flex gap-1 mb-6 px-4">
            <div className={`h-1 rounded-full flex-1 transition-colors ${step === 0 ? 'bg-indigo-500' : 'bg-slate-200 dark:bg-white/10'}`} />
            {currentSteps.map((_, idx) => (
                <div key={idx} className={`h-1 rounded-full flex-1 transition-colors ${step === idx + 1 ? 'bg-indigo-500' : 'bg-slate-200 dark:bg-white/10'}`} />
            ))}
        </div>

        {/* Slide Content */}
        <div className="flex-1 flex items-center justify-center w-full">
            <AnimatePresence mode="wait">
                <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="w-full"
                >
                    {isWelcome ? (
                        <Slide 
                            title={welcomeTitle}
                            desc={welcomeDesc}
                            icon={Trophy}
                            color="bg-slate-800"
                        >
                            <div className="text-[10px] text-indigo-500 font-bold uppercase tracking-widest bg-indigo-50 dark:bg-indigo-500/10 px-4 py-2 rounded-lg">
                                {t('tutorial.welcome.optIn')}
                            </div>
                        </Slide>
                    ) : (
                        activeStepData && (
                            <Slide 
                                title={activeStepData.title}
                                desc={activeStepData.desc}
                                icon={activeStepData.icon}
                                color={activeStepData.color}
                            >
                                {activeStepData.content}
                            </Slide>
                        )
                    )}
                </motion.div>
            </AnimatePresence>
        </div>

        {/* Footer Actions */}
        <div className="mt-4 pt-4 border-t border-black/5 dark:border-white/5 flex gap-3 px-2">
             <Button onClick={() => onClose(tutorialKey)} variant="ghost" size="md" className="flex-1 text-slate-400 hover:text-slate-600 dark:text-slate-500">
                 {t('tutorial.skip')}
             </Button>
             <Button onClick={handleNext} variant="primary" size="md" className="flex-[2] shadow-lg shadow-indigo-500/20">
                 {step <= currentSteps.length - 1 ? (
                     <>{t('tutorial.next')} <ChevronRight size={16} /></>
                 ) : (
                     <>{t('common.done')} <Check size={16} /></>
                 )}
             </Button>
        </div>

      </div>
    </Modal>
  );
};
