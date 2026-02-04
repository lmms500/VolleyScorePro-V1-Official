

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Team, SkillType, TeamColor } from '../../types';
import { Swords, Shield, Target, AlertTriangle, X, ChevronLeft, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence, PanInfo, useDragControls, Transition, Variants } from 'framer-motion';
import { resolveTheme } from '../../utils/colors';
import { useTranslation } from '../../contexts/LanguageContext';
import { useHaptics } from '../../hooks/useHaptics';

interface ScoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  team: Team;
  onConfirm: (playerId: string, skill: SkillType) => void;
  colorTheme: TeamColor;
  initialPlayerId?: string | null; 
}

// --- ANIMATION CONFIG ---
const springTransition: Transition = {
    type: "spring",
    damping: 25,
    stiffness: 300,
    mass: 0.8
};

// Added explicit Variants type to slideVariants
const slideVariants: Variants = {
    enter: (direction: number) => ({
        x: direction > 0 ? "20%" : "-20%",
        opacity: 0,
        scale: 0.98
    }),
    center: {
        x: 0,
        opacity: 1,
        scale: 1,
        transition: { ...springTransition, delay: 0.05 } 
    },
    exit: (direction: number) => ({
        x: direction < 0 ? "20%" : "-20%",
        opacity: 0,
        scale: 0.98,
        transition: { duration: 0.15, ease: "easeIn" as const } // Added as const for literal string
    })
};

export const ScoutModal: React.FC<ScoutModalProps> = ({ 
    isOpen, 
    onClose, 
    team, 
    onConfirm,
    colorTheme,
    initialPlayerId
}) => {
    const { t } = useTranslation();
    const haptics = useHaptics();
    
    // Navigation State
    const [step, setStep] = useState<1 | 2>(1);
    const [direction, setDirection] = useState(0);
    const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
    
    // Safety
    const [isReadyToClose, setIsReadyToClose] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const dragControls = useDragControls();

    useEffect(() => {
        if (isOpen) {
            if (initialPlayerId) {
                setSelectedPlayerId(initialPlayerId);
                setStep(2);
                setDirection(1);
            } else {
                setStep(1);
                setDirection(0);
                setSelectedPlayerId(null);
            }
            
            const timer = setTimeout(() => setIsReadyToClose(true), 300);
            return () => {
                clearTimeout(timer);
                setIsReadyToClose(false);
            };
        }
    }, [isOpen, initialPlayerId]);

    const goToStep2 = (pid: string) => {
        haptics.impact('light');
        setSelectedPlayerId(pid);
        setDirection(1);
        setStep(2);
    };

    const goToStep1 = () => {
        haptics.impact('light');
        setDirection(-1);
        setStep(1);
        setTimeout(() => setSelectedPlayerId(null), 200);
    };

    const handleOpponentError = () => {
        haptics.notification('success');
        onConfirm('', 'opponent_error'); 
        onClose();
    };

    const handleBackdropClick = () => {
        if (isReadyToClose) onClose();
    };

    const handleSkillSelect = (skill: SkillType) => {
        if (selectedPlayerId) {
            haptics.notification('success');
            onConfirm(selectedPlayerId, skill);
            onClose();
        }
    };

    const handleDragEnd = (_: any, info: PanInfo) => {
        if (window.innerHeight > window.innerWidth) {
            if (info.offset.y > 100 || info.velocity.y > 300) onClose();
        }
    };

    // --- DATA PREP ---
    const theme = resolveTheme(colorTheme);

    const sortedPlayers = useMemo(() => {
        return [...team.players]
            .slice(0, 6) 
            .sort((a, b) => {
                if (a.isFixed !== b.isFixed) return a.isFixed ? -1 : 1;
                const numA = parseInt(a.number || '999');
                const numB = parseInt(b.number || '999');
                return numA - numB;
            });
    }, [team.players]);

    const selectedPlayer = selectedPlayerId 
        ? (selectedPlayerId === 'unknown' ? { name: t('scout.unknownPlayer'), number: '?' } : team.players.find(p => p.id === selectedPlayerId))
        : null;

    const skills: { id: SkillType, label: string, icon: any, colorClass: string, bgClass: string }[] = [
        { id: 'attack', label: t('scout.skills.attack'), icon: Swords, colorClass: 'text-rose-500', bgClass: 'bg-rose-500/10 active:bg-rose-500/20' },
        { id: 'block', label: t('scout.skills.block'), icon: Shield, colorClass: 'text-indigo-500', bgClass: 'bg-indigo-500/10 active:bg-indigo-500/20' },
        { id: 'ace', label: t('scout.skills.ace'), icon: Target, colorClass: 'text-emerald-500', bgClass: 'bg-emerald-500/10 active:bg-emerald-500/20' },
    ];

    // --- RENDER ---
    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex flex-col justify-end items-center isolate landscape:justify-center">
                    
                    {/* Backdrop - Significantly lighter opacity and less blur for visibility */}
                    <motion.div 
                        className="absolute inset-0 bg-black/20 dark:bg-black/50 backdrop-blur-sm z-0"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={handleBackdropClick}
                    />
                    
                    {/* Modal Sheet - Glassmorphism enabled */}
                    <motion.div 
                        ref={containerRef}
                        className="
                            relative z-10 w-full max-w-[500px]
                            bg-white/90 dark:bg-[#0f172a]/85 backdrop-blur-2xl
                            rounded-t-3xl sm:rounded-3xl
                            shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.3)]
                            flex flex-col overflow-hidden
                            ring-1 ring-white/20 dark:ring-white/10
                            h-[60vh] landscape:w-[85%] landscape:h-[85%] landscape:max-w-4xl landscape:rounded-3xl landscape:shadow-2xl
                        "
                        initial={{ y: "100%" }} 
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={springTransition}
                        drag="y"
                        dragControls={dragControls}
                        dragListener={false} 
                        dragConstraints={{ top: 0, bottom: 0 }}
                        dragElastic={{ top: 0.05, bottom: 0.5 }}
                        dragSnapToOrigin
                        onDragEnd={handleDragEnd}
                    >
                        {/* Drag Handle (Portrait Only) */}
                        <div 
                            className="w-full flex justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing touch-none z-20 landscape:hidden shrink-0"
                            onPointerDown={(e) => dragControls.start(e)}
                        >
                            <div className="w-12 h-1.5 rounded-full bg-slate-200 dark:bg-white/10" />
                        </div>

                        {/* PERSISTENT CLOSE BUTTON (Top Right) */}
                        <button 
                            onClick={onClose} 
                            className="absolute top-3 right-3 z-50 p-2.5 rounded-full bg-slate-100/50 dark:bg-white/10 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors shadow-sm backdrop-blur-sm"
                        >
                            <X size={20} strokeWidth={2.5} />
                        </button>

                        {/* CONTENT VIEWPORT */}
                        <div className="relative w-full flex-1 min-h-0">
                            <AnimatePresence initial={false} custom={direction} mode="wait">
                                
                                {/* STEP 1: SELECT PLAYER (Grid View) */}
                                {step === 1 ? (
                                    <motion.div 
                                        key="step1"
                                        custom={direction}
                                        variants={slideVariants}
                                        initial="enter"
                                        animate="center"
                                        exit="exit"
                                        className="absolute inset-0 flex flex-col p-4 pb-safe-bottom"
                                    >
                                        {/* UNIFIED GRID: Players + Actions */}
                                        <div className="grid grid-cols-4 gap-2 h-full content-center landscape:grid-cols-4 landscape:gap-3">
                                            
                                            {/* Special Actions (First 2 Slots) */}
                                            <button onClick={handleOpponentError} className="flex flex-col items-center justify-center p-2 rounded-2xl bg-amber-500/10 active:bg-amber-500/20 border-2 border-amber-500/20 hover:border-amber-500/40 text-amber-600 dark:text-amber-500 transition-all active:scale-95 aspect-square">
                                                <AlertTriangle size={24} strokeWidth={2.5} className="mb-1" />
                                                <span className="text-[9px] font-black uppercase tracking-tight leading-none text-center">{t('scout.skills.opponent_error')}</span>
                                            </button>
                                            
                                            <button onClick={() => goToStep2('unknown')} className="flex flex-col items-center justify-center p-2 rounded-2xl bg-slate-100 dark:bg-white/5 active:bg-slate-200 dark:active:bg-white/10 border-2 border-dashed border-slate-300 dark:border-white/10 text-slate-500 dark:text-slate-400 transition-all active:scale-95 aspect-square">
                                                <HelpCircle size={24} strokeWidth={2.5} className="mb-1" />
                                                <span className="text-[9px] font-black uppercase tracking-tight leading-none text-center">{t('scout.unknownPlayer')}</span>
                                            </button>

                                            {/* Player Slots (Remaining) */}
                                            {sortedPlayers.map(p => (
                                                <button key={p.id} onClick={() => goToStep2(p.id)} className="relative flex flex-col items-center justify-center p-2 rounded-2xl bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/5 active:scale-95 transition-all duration-150 shadow-sm hover:border-indigo-500/30 hover:shadow-md aspect-square overflow-hidden group">
                                                    <div className={`flex items-center justify-center text-3xl font-black ${theme.text} ${theme.textDark} drop-shadow-sm mb-1`}>{p.number || "#"}</div>
                                                    <div className="w-full text-center px-1"><span className="block text-[10px] font-bold text-slate-600 dark:text-slate-300 truncate leading-tight group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">{p.name}</span></div>
                                                </button>
                                            ))}
                                            
                                            {/* Fillers for alignment if < 6 players */}
                                            {[...Array(Math.max(0, 6 - sortedPlayers.length))].map((_, i) => (
                                                <div key={`filler-${i}`} className="rounded-2xl border border-dashed border-slate-200/50 dark:border-white/5 bg-transparent aspect-square opacity-50" />
                                            ))}
                                        </div>
                                    </motion.div>
                                ) : (
                                    /* STEP 2: SELECT ACTION (Split View) */
                                    <motion.div 
                                        key="step2"
                                        custom={direction}
                                        variants={slideVariants}
                                        initial="enter"
                                        animate="center"
                                        exit="exit"
                                        className="absolute inset-0 flex flex-col p-4 pb-safe-bottom landscape:flex-row landscape:gap-6 landscape:items-center"
                                    >
                                        {/* Left: Player ID */}
                                        <div className="flex flex-row items-center gap-4 mb-4 landscape:mb-0 landscape:flex-col landscape:items-start landscape:justify-center landscape:w-1/3 shrink-0">
                                            <button onClick={goToStep1} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors active:scale-95 shadow-sm">
                                                <ChevronLeft size={24} strokeWidth={3} />
                                            </button>
                                            
                                            <div className="flex items-center gap-4 landscape:flex-col landscape:items-start landscape:gap-2">
                                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-black ${theme.bg} ${theme.text} ${theme.textDark} border ${theme.border} shadow-lg landscape:w-20 landscape:h-20`}>
                                                    {selectedPlayer?.number || "?"}
                                                </div>
                                                <div className="flex flex-col justify-center">
                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-0.5">{t('scout.whoScored')}</span>
                                                    <h3 className="text-xl font-black text-slate-800 dark:text-white leading-none tracking-tight line-clamp-2 landscape:text-2xl">{selectedPlayer?.name}</h3>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right: Actions */}
                                        <div className="flex-1 grid grid-cols-1 gap-3 h-full content-center landscape:grid-cols-3 landscape:h-auto">
                                            {skills.map(s => (
                                                <button key={s.id} onClick={() => handleSkillSelect(s.id)} className={`relative flex items-center justify-start gap-4 px-6 py-5 rounded-3xl transition-all duration-200 active:scale-95 ${s.bgClass} border border-transparent hover:border-current shadow-sm hover:shadow-md landscape:flex-col landscape:justify-center landscape:items-center landscape:text-center landscape:gap-2 landscape:py-6 landscape:aspect-[4/3]`}>
                                                    <div className={`p-2 rounded-full bg-white/20 dark:bg-black/10`}>
                                                        <s.icon size={28} className={s.colorClass} strokeWidth={2.5} />
                                                    </div>
                                                    <span className={`text-base font-black uppercase tracking-wider ${s.colorClass}`}>{s.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
};