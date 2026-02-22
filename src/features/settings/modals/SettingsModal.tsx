
import React, { useState, useEffect, useRef, memo, useCallback } from 'react';
import { Modal } from '@ui/Modal';
import { GameConfig } from '@types';
import { Check, Trophy, AlertTriangle, Layers, Cpu, X, Volume2 } from 'lucide-react';
import { useTranslation } from '@contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { MatchTab } from '../components/MatchTab';
import { AppTab } from '../components/AppTab';
import { AudioTab } from '../components/AudioTab';
import { SystemTab } from '../components/SystemTab';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    config: GameConfig;
    onSave: (config: GameConfig, reset: boolean) => void;
    isMatchActive: boolean;
    zIndex?: string;
}

type SettingsTab = 'match' | 'app' | 'audio' | 'system';

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

        if (diff > 10 && showHeader && currentY > 50) {
            setShowHeader(false);
        } else if (diff < -5 && !showHeader) {
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

    const tabConfig = [
        { id: 'match' as SettingsTab, icon: Trophy, label: t('settings.rules.title'), from: 'from-amber-500', to: 'to-amber-600', shadow: 'shadow-amber-500/30' },
        { id: 'app' as SettingsTab, icon: Layers, label: t('settings.appearance.title'), from: 'from-indigo-500', to: 'to-indigo-600', shadow: 'shadow-indigo-500/30' },
        { id: 'audio' as SettingsTab, icon: Volume2, label: t('settings.sections.audio'), from: 'from-rose-500', to: 'to-rose-600', shadow: 'shadow-rose-500/30' },
        { id: 'system' as SettingsTab, icon: Cpu, label: t('settings.sections.install'), from: 'from-emerald-500', to: 'to-emerald-600', shadow: 'shadow-emerald-500/30' },
    ];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="" showCloseButton={false} variant="immersive" zIndex={zIndex}>
            <div ref={scrollRef} onScroll={onScroll} className="flex flex-col h-full render-crisp relative overflow-y-auto overflow-x-hidden custom-scrollbar">

                {/* SMART NAVIGATION BAR (Collapsible) */}
                <div className="sticky top-0 z-50 pt-safe-top px-2 pointer-events-none">
                    <motion.div
                        initial={false}
                        animate={{ y: showHeader ? 0 : -100 }}
                        transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
                        style={{ transform: 'translateZ(0)', willChange: 'transform' }}
                        className={`bg-transparent pb-2 pt-2 px-2 pointer-events-auto relative z-50 transition-opacity duration-200 ${showHeader ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                    >
                        <div className="flex gap-2">
                            {/* PREMIUM GLASS TAB CONTAINER */}
                            <div className="relative flex-1 min-w-0 flex">
                                {/* Edge Fading for clear scroll indication - CSS Mask approach is cleaner over transparent backgrounds */}
                                <div
                                    className="flex w-full overflow-x-auto hide-scrollbar snap-x snap-mandatory bg-white/40 dark:bg-white/5 backdrop-blur-xl rounded-2xl p-1 gap-1 border border-white/50 dark:border-white/5 ring-1 ring-inset ring-white/10 dark:ring-white/5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15)]"
                                    style={{ maskImage: 'linear-gradient(to right, transparent, black 16px, black calc(100% - 16px), transparent)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 16px, black calc(100% - 16px), transparent)' }}
                                >
                                    {tabConfig.map(tab => (
                                        <button
                                            key={tab.id}
                                            onClick={() => handleTabSwitch(tab.id)}
                                            disabled={pendingRestart && tab.id !== 'system'}
                                            className={`
                                                flex-1 md:flex-none flex-shrink-0 min-w-fit px-4 py-2.5 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider
                                                flex items-center justify-center gap-2 transition-all relative overflow-hidden group snap-center
                                                ${activeTab === tab.id
                                                    ? `bg-gradient-to-br ${tab.from} ${tab.to} text-white shadow-lg ${tab.shadow} ring-1 ring-inset ring-white/10`
                                                    : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 hover:bg-white/40 dark:hover:bg-white/5'
                                                }
                                                ${pendingRestart && tab.id !== 'system' ? 'opacity-30 cursor-not-allowed' : ''}
                                            `}
                                        >
                                            {/* Icon box for active tab */}
                                            {activeTab === tab.id ? (
                                                <div className="w-5 h-5 rounded-md bg-white/20 flex items-center justify-center flex-shrink-0">
                                                    <tab.icon size={12} strokeWidth={2.5} />
                                                </div>
                                            ) : (
                                                <tab.icon size={14} className="flex-shrink-0" strokeWidth={2.5} />
                                            )}
                                            <span className="truncate whitespace-nowrap">{tab.label}</span>
                                            {/* Shimmer on active */}
                                            {activeTab === tab.id && (
                                                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700 skew-x-12 pointer-events-none" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* SCOUT MODAL CLOSE BUTTON */}
                            <button
                                onClick={onClose}
                                className="w-12 flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-2xl transition-all active:scale-95 shadow-xl shadow-red-500/30 ring-1 ring-inset ring-white/10 group/close"
                            >
                                <X size={18} strokeWidth={3} className="group-hover/close:rotate-90 transition-transform duration-300" />
                            </button>
                        </div>
                    </motion.div>
                </div>

                {/* CONTENT */}
                <div className="flex-1 px-1 pb-32 pt-1">
                    <AnimatePresence mode="wait">
                        {activeTab === 'match' && (
                            <motion.div
                                key="match"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                transition={{ duration: 0.2, ease: [0.25, 1, 0.5, 1] }}
                                style={{ transform: 'translateZ(0)' }}
                            >
                                <MatchTab localConfig={localConfig} setLocalConfig={setLocalConfig} onClose={onClose} setPendingRestart={setPendingRestart} />
                            </motion.div>
                        )}

                        {activeTab === 'app' && (
                            <motion.div
                                key="app"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                transition={{ duration: 0.2, ease: [0.25, 1, 0.5, 1] }}
                                style={{ transform: 'translateZ(0)' }}
                            >
                                <AppTab localConfig={localConfig} setLocalConfig={setLocalConfig} />
                            </motion.div>
                        )}

                        {activeTab === 'audio' && (
                            <motion.div
                                key="audio"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                transition={{ duration: 0.2, ease: [0.25, 1, 0.5, 1] }}
                                style={{ transform: 'translateZ(0)' }}
                            >
                                <AudioTab localConfig={localConfig} setLocalConfig={setLocalConfig} />
                            </motion.div>
                        )}

                        {activeTab === 'system' && (
                            <motion.div
                                key="system"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                transition={{ duration: 0.2, ease: [0.25, 1, 0.5, 1] }}
                                style={{ transform: 'translateZ(0)' }}
                            >
                                <SystemTab localConfig={localConfig} setLocalConfig={setLocalConfig} setPendingRestart={setPendingRestart} pendingRestart={pendingRestart} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* FOOTER */}
                <div className="fixed bottom-0 left-0 right-0 z-30 flex justify-center pointer-events-none pb-safe-bottom">
                    <div className="absolute bottom-0 w-full h-24 bg-gradient-to-t from-white dark:from-[#020617] to-transparent pointer-events-none" />
                    <div className="mb-4 relative z-40">
                        {requiresReset && !pendingRestart && (
                            <motion.div
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="absolute -top-12 left-1/2 -translate-x-1/2 bg-rose-600 text-white px-4 py-1.5 rounded-full flex items-center gap-2 mb-3 shadow-lg shadow-rose-500/30 ring-1 ring-inset ring-white/10 pointer-events-auto whitespace-nowrap"
                            >
                                <AlertTriangle size={12} className="text-rose-200 animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-wide">{t('settings.resetWarning')}</span>
                            </motion.div>
                        )}
                        <button
                            onClick={handleSave}
                            disabled={pendingRestart}
                            className={`
                                pointer-events-auto relative overflow-hidden flex items-center gap-2.5 px-8 py-3.5 rounded-full
                                shadow-2xl transition-all active:scale-95 font-black text-xs uppercase tracking-widest
                                ring-1 ring-inset ring-white/10 group
                                ${pendingRestart
                                    ? 'bg-slate-300 dark:bg-slate-700 text-slate-500 cursor-not-allowed'
                                    : requiresReset
                                        ? 'bg-gradient-to-br from-rose-500 to-rose-600 text-white shadow-rose-500/30 hover:from-rose-400 hover:to-rose-500'
                                        : 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-indigo-500/30 hover:from-indigo-400 hover:to-indigo-500'
                                }
                            `}
                        >
                            <Check size={14} strokeWidth={3} />
                            <span>{pendingRestart ? t('settings.backup.restartBtn') : (requiresReset ? t('settings.applyAndReset') : t('settings.applyChanges'))}</span>
                            {/* Shimmer sweep */}
                            {!pendingRestart && (
                                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700 skew-x-12 pointer-events-none" />
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </Modal>
    );
});
