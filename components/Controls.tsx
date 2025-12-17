
import React, { memo, useCallback } from 'react';
import { 
    RotateCcw, 
    ArrowLeftRight, 
    Settings, 
    Users, 
    Undo2, 
    Maximize2, 
    History, 
    Mic, 
    MicOff 
} from 'lucide-react';
import { useTranslation } from '../contexts/LanguageContext';
import { motion } from 'framer-motion';
import { useCollider } from '../hooks/useCollider';
import { liquidSpring } from '../utils/animations';

interface ControlsProps {
  onUndo: () => void;
  canUndo: boolean;
  onSwap: () => void;
  onSettings: () => void;
  onRoster: () => void;
  onHistory: () => void;
  onReset: () => void;
  onToggleFullscreen: () => void;
  voiceEnabled: boolean;
  isListening: boolean;
  onToggleListening: () => void;
}

const ControlButton = memo(({ onClick, disabled, icon: Icon, active, className, activeColor, title }: any) => (
    <motion.button 
        whileTap={{ scale: 0.92 }}
        onClick={onClick} 
        disabled={disabled}
        title={title}
        className={`
            relative group 
            p-2 sm:p-3 
            rounded-lg sm:rounded-xl
            flex items-center justify-center 
            transition-all duration-300 flex-shrink-0
            ${disabled ? 'opacity-30 cursor-not-allowed grayscale' : 'cursor-pointer'}
            ${active 
                ? (activeColor || 'bg-indigo-500 text-white shadow-lg') 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10'}
            ${className}
        `}
    >
        <Icon className="w-5 h-5 sm:w-[22px] sm:h-[22px]" strokeWidth={1.5} />
    </motion.button>
));

const Divider = memo(() => (
    <div className="w-px h-4 sm:h-6 bg-black/5 dark:bg-white/10 mx-0.5 sm:mx-2 flex-shrink-0 rounded-full"></div>
));

export const Controls: React.FC<ControlsProps> = memo(({ 
    onUndo, canUndo, onSwap, onSettings, onRoster, onHistory, onReset, onToggleFullscreen,
    voiceEnabled, isListening, onToggleListening 
}) => {
  const { t } = useTranslation();
  const controlsRef = useCollider('controls-bar'); 

  return (
    <motion.div 
        className="w-full flex justify-center px-2 sm:px-4 pb-safe hardware-accelerated"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, ...liquidSpring }}
    >
      <div 
        ref={controlsRef}
        className="
        relative
        w-auto max-w-full
        bg-white/60 dark:bg-[#0f172a]/60 backdrop-blur-xl 
        border border-white/40 dark:border-white/10 
        rounded-2xl sm:rounded-3xl shadow-xl shadow-black/5
        py-1 sm:py-1.5 px-1
      ">
        <div className="overflow-x-auto no-scrollbar flex items-center justify-start md:justify-center gap-1 sm:gap-1.5 px-1 sm:px-3 py-1 sm:py-2 mask-linear-fade-sides">
            
            <ControlButton onClick={onUndo} disabled={!canUndo} icon={Undo2} title={t('controls.undo')} />
            <ControlButton onClick={onSwap} icon={ArrowLeftRight} title={t('controls.swap')} />

            <Divider />

            {voiceEnabled && (
                <>
                    <ControlButton 
                        onClick={onToggleListening} 
                        icon={isListening ? Mic : MicOff} 
                        active={isListening}
                        activeColor="bg-rose-500 text-white"
                        title={t('controls.voiceControl')}
                    />
                    <Divider />
                </>
            )}

            <ControlButton onClick={onRoster} icon={Users} className="text-cyan-600 dark:text-cyan-400" title={t('controls.teams')} />
            <ControlButton onClick={onHistory} icon={History} className="text-amber-600 dark:text-amber-400" title={t('controls.history')} />

            <Divider />

            <ControlButton onClick={onSettings} icon={Settings} title={t('controls.settings')} />
            <ControlButton onClick={onToggleFullscreen} icon={Maximize2} title={t('controls.fullscreen')} />
            <ControlButton onClick={onReset} icon={RotateCcw} className="text-rose-500 dark:text-rose-400" title={t('controls.reset')} />

        </div>
      </div>
    </motion.div>
  );
});
