
import React, { useState, useEffect, useRef, memo, useCallback } from 'react';
import { Modal } from '../ui/Modal';
import { GameConfig } from '../../types';
import { Check, Trophy, AlertTriangle, Layers, Cpu, X } from 'lucide-react';
import { useTranslation } from '../../contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { MatchTab } from '../Settings/MatchTab';
import { AppTab } from '../Settings/AppTab';
import { SystemTab } from '../Settings/SystemTab';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: GameConfig;
  onSave: (config: GameConfig, reset: boolean) => void;
  isMatchActive: boolean;
  zIndex?: string; 
}

type SettingsTab = 'match' | 'app' | 'system';

export const SettingsModal: React.FC<SettingsModalProps> = memo(({ 
    isOpen, onClose, config, onSave, isMatchActive, zIndex
}) => {
  const [localConfig, setLocalConfig] = useState<GameConfig>(config);
  const [activeTab, setActiveTab] = useState<SettingsTab>('match');
  const [pendingRestart, setPendingRestart] = useState(false);
  
  // SCROLL HEADER LOGIC
  const [showHeader, setShowHeader] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);

  const { t } = useTranslation();

  const onScroll = useCallback(() => {
      if (!scrollRef.current) return;
      const currentY = scrollRef.current.scrollTop;
      const diff = currentY - lastScrollY.current;

      // Bounce protection (iOS)
      if (currentY < 0) return;

      if (diff > 10 && showHeader && currentY > 50) { // Scroll Down & not at top
          setShowHeader(false);
      } else if (diff < -5 && !showHeader) { // Scroll Up
          setShowHeader(true);
      }
      lastScrollY.current = currentY;
  }, [showHeader]);
  
  useEffect(() => {
    if (isOpen) {
      setLocalConfig(config);
      setPendingRestart(false);
    }
  }, [isOpen, config]);

  const handleRestart = () => window.location.reload();

  const handleSave = () => { 
      if (pendingRestart) { handleRestart(); return; } 
      
      const structuralKeys: (keyof GameConfig)[] = ['maxSets', 'pointsPerSet', 'hasTieBreak', 'tieBreakPoints', 'deuceType', 'mode'];
      const requiresReset = isMatchActive && structuralKeys.some(key => localConfig[key] !== config[key]);
      
      onSave(localConfig, requiresReset); 
      onClose(); 
  };

  const structuralKeys: (keyof GameConfig)[] = ['maxSets', 'pointsPerSet', 'hasTieBreak', 'tieBreakPoints', 'deuceType', 'mode'];
  const requiresReset = isMatchActive && structuralKeys.some(key => localConfig[key] !== config[key]);

  const handleTabSwitch = (tab: SettingsTab) => {
      if (typeof React.startTransition === 'function') React.startTransition(() => setActiveTab(tab));
      else setActiveTab(tab);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" showCloseButton={false} variant="fullscreen" zIndex={zIndex}>
      <div ref={scrollRef} onScroll={onScroll} className="flex flex-col h-full render-crisp relative overflow-y-auto custom-scrollbar">
        
        {/* SMART NAVIGATION BAR (Collapsible) */}
        <div className="sticky top-0 z-50 pt-safe-top pb-2 px-1 mb-1 pointer-events-none">
            <motion.div 
                initial={{ y: 0 }}
                animate={{ y: showHeader ? 0 : -100, opacity: showHeader ? 1 : 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="bg-slate-50/70 dark:bg-[#020617]/70 backdrop-blur-xl border-b border-white/20 dark:border-white/10 shadow-sm rounded-b-2xl pb-2 pt-2 px-2 pointer-events-auto"
            >
                <div className="flex gap-2">
                    <div className="flex flex-1 bg-slate-100 dark:bg-black/20 rounded-[1.2rem] p-1 gap-1 border border-black/5 dark:border-white/5 shadow-sm">
                        {(['match', 'app', 'system'] as const).map(tab => (
                            <button key={tab} onClick={() => handleTabSwitch(tab)} disabled={pendingRestart && tab !== 'system'} className={`flex-1 px-2 py-2.5 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all relative z-10 ${activeTab === tab ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-md ring-1 ring-black/5 dark:ring-white/10' : 'text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5'} ${pendingRestart && tab !== 'system' ? 'opacity-30 cursor-not-allowed' : ''}`}>
                                {tab === 'match' && <Trophy size={14} className="flex-shrink-0" strokeWidth={2.5} />}
                                {tab === 'app' && <Layers size={14} className="flex-shrink-0" strokeWidth={2.5} />}
                                {tab === 'system' && <Cpu size={14} className="flex-shrink-0" strokeWidth={2.5} />}
                                <span className="truncate hidden sm:inline">{tab === 'match' ? t('settings.rules.title') : tab === 'app' ? t('settings.appearance.title') : t('settings.sections.install')}</span>
                                <span className="truncate inline sm:hidden">{tab === 'match' ? t('settings.rules.title') : tab === 'app' ? t('settings.appearance.title') : t('settings.sections.install')}</span>
                            </button>
                        ))}
                    </div>
                    
                    {/* INTEGRATED CLOSE BUTTON */}
                    <button 
                        onClick={onClose}
                        className="w-12 flex items-center justify-center bg-slate-100 dark:bg-black/20 hover:bg-slate-200 dark:hover:bg-white/10 rounded-[1.2rem] text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors active:scale-90 border border-black/5 dark:border-white/5 shadow-sm"
                    >
                        <X size={20} strokeWidth={2.5} />
                    </button>
                </div>
            </motion.div>
        </div>

        {/* CONTENT */}
        <div className="flex-1 px-1 pb-32 pt-2">
            <AnimatePresence mode="wait">
                {activeTab === 'match' && (
                    <motion.div key="match" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.2 }}>
                        <MatchTab localConfig={localConfig} setLocalConfig={setLocalConfig} onClose={onClose} setPendingRestart={setPendingRestart} />
                    </motion.div>
                )}

                {activeTab === 'app' && (
                    <motion.div key="app" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.2 }}>
                        <AppTab localConfig={localConfig} setLocalConfig={setLocalConfig} />
                    </motion.div>
                )}

                {activeTab === 'system' && (
                    <motion.div key="system" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.2 }}>
                        <SystemTab localConfig={localConfig} setLocalConfig={setLocalConfig} setPendingRestart={setPendingRestart} pendingRestart={pendingRestart} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>

        {/* FOOTER */}
        <div className="fixed bottom-0 left-0 right-0 z-30 flex justify-center pointer-events-none pb-safe-bottom">
            <div className="absolute bottom-0 w-full h-20 bg-gradient-to-t from-white dark:from-[#020617] to-transparent pointer-events-none" />
            <div className="mb-4 relative z-40">
                {requiresReset && !pendingRestart && (
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900/80 text-white px-3 py-1 rounded-full flex items-center gap-2 mb-3 animate-pulse pointer-events-auto whitespace-nowrap"><AlertTriangle size={12} className="text-rose-400" /><span className="text-[10px] font-bold uppercase tracking-wide">{t('settings.resetWarning')}</span></div>
                )}
                <button onClick={handleSave} disabled={pendingRestart} className={`pointer-events-auto flex items-center gap-2 px-6 py-3 rounded-full shadow-2xl transition-all active:scale-95 ${pendingRestart ? 'bg-slate-300 dark:bg-slate-700 text-slate-500 cursor-not-allowed' : (requiresReset ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-500/30' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/30')}`}>
                    <Check size={14} strokeWidth={3} />
                    <span className="text-xs font-black uppercase tracking-widest">{pendingRestart ? t('settings.backup.restartBtn') : (requiresReset ? t('settings.applyAndReset') : t('settings.applyChanges'))}</span>
                </button>
            </div>
        </div>
      </div>
    </Modal>
  );
});
