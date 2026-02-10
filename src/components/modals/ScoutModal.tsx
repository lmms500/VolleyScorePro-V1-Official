
import React, { useState, useEffect, useMemo } from 'react';
import { Modal } from '../ui/Modal';
import { ModalHeader } from '../ui/ModalHeader';
import { Team, SkillType, TeamColor } from '../../types';
import { Swords, Shield, Target, AlertTriangle, ChevronLeft, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence, Transition, Variants } from 'framer-motion';
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
    zIndex?: string;
}

// --- ANIMATION CONFIG ---
const springTransition: Transition = {
    type: "spring",
    damping: 25,
    stiffness: 300,
    mass: 0.8
};

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
        transition: { duration: 0.15, ease: "easeIn" as const }
    })
};

export const ScoutModal: React.FC<ScoutModalProps> = ({
    isOpen,
    onClose,
    team,
    onConfirm,
    colorTheme,
    initialPlayerId,
    zIndex = "z-[60]"
}) => {
    const { t } = useTranslation();
    const haptics = useHaptics();

    // Navigation State
    const [step, setStep] = useState<1 | 2>(1);
    const [direction, setDirection] = useState(0);
    const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);

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

    const handleSkillSelect = (skill: SkillType) => {
        if (selectedPlayerId) {
            haptics.notification('success');
            onConfirm(selectedPlayerId, skill);
            onClose();
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

    // Dynamic title based on step
    const headerTitle = step === 1
        ? t('scout.selectPlayer')
        : selectedPlayer?.name || t('scout.selectPlayer');

    // --- RENDER ---
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            variant="fullscreen"
            title=""
            showCloseButton={false}
            zIndex={zIndex}
        >
            {/* ModalHeader with dynamic title */}
            <ModalHeader
                title={headerTitle}
                onClose={onClose}
            />

            {/* CONTENT VIEWPORT */}
            <div className="flex-1 w-full relative overflow-hidden bg-slate-50 dark:bg-slate-900 h-[60dvh] max-h-[60dvh] pb-safe-bottom landscape:h-auto landscape:max-h-[88dvh] landscape:w-[92%] landscape:max-w-5xl landscape:self-center landscape:rounded-3xl landscape:shadow-2xl landscape:pb-4">
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
                            <div className="grid grid-cols-4 gap-2 h-full content-center landscape:grid-cols-8 landscape:gap-3 overflow-y-auto overscroll-contain">

                                {/* Special Actions (First 2 Slots) */}
                                <button onClick={handleOpponentError} className="flex flex-col items-center justify-center p-2 rounded-2xl bg-amber-500/10 active:bg-amber-500/20 border-2 border-amber-500/20 hover:border-amber-500/40 text-amber-600 dark:text-amber-500 transition-all active:scale-95 aspect-square landscape:aspect-[4/3] landscape:min-h-[64px]">
                                    <AlertTriangle size={24} strokeWidth={2.5} className="mb-1" />
                                    <span className="text-[9px] font-black uppercase tracking-tight leading-none text-center">{t('scout.skills.opponent_error')}</span>
                                </button>

                                <button onClick={() => goToStep2('unknown')} className="flex flex-col items-center justify-center p-2 rounded-2xl bg-slate-100 dark:bg-white/5 active:bg-slate-200 dark:active:bg-white/10 border-2 border-dashed border-slate-300 dark:border-white/10 text-slate-500 dark:text-slate-400 transition-all active:scale-95 aspect-square landscape:aspect-[4/3] landscape:min-h-[64px]">
                                    <HelpCircle size={24} strokeWidth={2.5} className="mb-1" />
                                    <span className="text-[9px] font-black uppercase tracking-tight leading-none text-center">{t('scout.unknownPlayer')}</span>
                                </button>

                                {/* Player Slots (Remaining) */}
                                {sortedPlayers.map(p => (
                                    <button key={p.id} onClick={() => goToStep2(p.id)} className="relative flex flex-col items-center justify-center p-2 rounded-2xl bg-gradient-to-b from-white/10 to-transparent dark:from-white/5 dark:to-transparent border border-white/10 dark:border-white/5 active:scale-95 transition-all duration-200 shadow-sm hover:shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:border-indigo-500/50 aspect-square landscape:aspect-[4/3] landscape:min-h-[64px] overflow-hidden group">
                                        <div className={`flex items-center justify-center text-3xl font-black ${theme.text} ${theme.textDark} drop-shadow-sm mb-1`}>{p.number || "#"}</div>
                                        <div className="w-full text-center px-1"><span className="block text-[10px] font-bold text-slate-600 dark:text-slate-300 truncate leading-tight group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">{p.name}</span></div>
                                    </button>
                                ))}

                                {/* Fillers for alignment if < 6 players */}
                                {[...Array(Math.max(0, 6 - sortedPlayers.length))].map((_, i) => (
                                    <div key={`filler-${i}`} className="rounded-2xl border border-dashed border-slate-200/50 dark:border-white/5 bg-transparent aspect-square landscape:aspect-[4/3] landscape:min-h-[64px] opacity-50" />
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
                            <div className="flex-1 grid grid-cols-1 gap-3 h-full content-center landscape:grid-cols-3 landscape:h-auto overflow-y-auto overscroll-contain">
                                {skills.map(s => (
                                    <button key={s.id} onClick={() => handleSkillSelect(s.id)}
                                        className={`
                                            relative flex items-center justify-start gap-4 px-5 py-4 rounded-3xl 
                                            transition-all duration-200 active:scale-95 
                                            bg-white/5 dark:bg-white/[0.02] border border-white/10 hover:border-white/20
                                            landscape:flex-col landscape:justify-center landscape:items-center landscape:text-center landscape:gap-3 landscape:py-6 landscape:aspect-[4/3]
                                            group overflow-hidden
                                        `}
                                    >
                                        {/* Circular Icon Container */}
                                        <div className={`
                                            relative w-14 h-14 rounded-full flex items-center justify-center 
                                            ${s.bgClass} shadow-inner ring-1 ring-inset ring-black/5 dark:ring-white/5
                                            group-hover:scale-110 transition-transform duration-300
                                        `}>
                                            <s.icon size={26} className={s.colorClass} strokeWidth={2.5} />
                                        </div>

                                        {/* Label */}
                                        <span className={`text-sm font-black uppercase tracking-widest ${s.colorClass} opacity-80 group-hover:opacity-100`}>
                                            {s.label}
                                        </span>

                                        {/* Hover Glow Effect */}
                                        <div className={`absolute inset-0 bg-gradient-to-r ${s.bgClass.replace('bg-', 'from-')} to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-500`} />
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </Modal>
    );
};