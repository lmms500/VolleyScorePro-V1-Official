
import React, { useState, useEffect, useMemo } from 'react';
import { Modal } from '@ui/Modal';
import { Team, SkillType, TeamColor } from '@types';
import { Swords, Shield, Target, AlertTriangle, ChevronLeft, HelpCircle, X } from 'lucide-react';
import { motion, AnimatePresence, Transition, Variants } from 'framer-motion';
import { resolveTheme } from '@lib/utils/colors';
import { useTranslation } from '@contexts/LanguageContext';
import { useHaptics } from '@lib/haptics/useHaptics';

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

    const selectedPlayer = useMemo(() => {
        if (!selectedPlayerId) return null;
        if (selectedPlayerId === 'unknown') {
            return { name: t('scout.unknownPlayer'), number: '?' };
        }
        return team.players.find(p => p.id === selectedPlayerId);
    }, [selectedPlayerId, team.players, t]);

    const skills: { id: SkillType, label: string, icon: any, colorClass: string, bgClass: string }[] = [
        { id: 'attack', label: t('scout.skills.attack'), icon: Swords, colorClass: 'text-rose-500', bgClass: 'bg-rose-500/10 active:bg-rose-500/20' },
        { id: 'block', label: t('scout.skills.block'), icon: Shield, colorClass: 'text-indigo-500', bgClass: 'bg-indigo-500/10 active:bg-indigo-500/20' },
        { id: 'ace', label: t('scout.skills.ace'), icon: Target, colorClass: 'text-emerald-500', bgClass: 'bg-emerald-500/10 active:bg-emerald-500/20' },
    ];

    // --- RENDER ---
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            variant="floating"
            title=""
            showCloseButton={false}
            maxWidth="max-w-6xl"
            zIndex={zIndex}
        >
            {/* Close Button - Fixed Inside */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white hover:from-red-600 hover:to-red-700 active:scale-95 transition-all shadow-xl shadow-red-500/30 group"
            >
                <X size={18} strokeWidth={3} className="group-hover:rotate-90 transition-transform duration-300" />
            </button>

            {/* CONTENT VIEWPORT */}
            <div className="w-full relative overflow-y-auto min-h-0 max-h-[82vh] landscape:max-h-[88vh]">
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
                            className="w-full h-full flex flex-col landscape:flex-row p-2 landscape:p-6 gap-2 landscape:gap-6 overflow-hidden"
                        >
                            {/* LEFT SIDE: Header (Landscape) / Top (Portrait) */}
                            <div className="flex-shrink-0 landscape:w-1/3 landscape:flex landscape:flex-col landscape:justify-center">
                                <div className="text-center landscape:text-left">
                                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-xl shadow-indigo-500/30 mb-2 landscape:mx-0">
                                        <Target size={24} className="text-white" strokeWidth={2.5} />
                                    </div>
                                    <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight mb-1 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                                        {t('scout.selectPlayer')}
                                    </h2>
                                    <p className="text-xs text-slate-600 dark:text-slate-300 font-semibold tracking-wide">
                                        {t('scout.whoScored')}
                                    </p>
                                </div>
                            </div>

                            {/* RIGHT SIDE: Grid (Landscape) / Bottom (Portrait) */}
                            <div className="flex-1 landscape:h-full landscape:overflow-y-auto landscape:flex landscape:items-center">
                                {/* UNIFIED GRID: Players + Actions */}
                                {/* Portrait: grid-cols-6 (2 special items = col-span-3 each, 3 players = col-span-2 each) */}
                                <div className="w-full grid grid-cols-6 gap-2">

                                    {/* Special Actions (First 2 Slots - col-span-3) */}
                                    <button
                                        onClick={handleOpponentError}
                                        className="col-span-3 relative flex flex-col items-center justify-center p-2 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg hover:shadow-amber-500/50 hover:scale-105 active:scale-100 transition-all duration-300 min-h-[80px] landscape:min-h-[90px] group overflow-hidden"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                                        <AlertTriangle size={24} strokeWidth={2.5} className="mb-1 relative z-10 group-hover:scale-110 transition-transform" />
                                        <span className="text-[10px] font-black uppercase tracking-tight leading-tight text-center px-1 relative z-10">{t('scout.skills.opponent_error')}</span>
                                        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    </button>

                                    <button
                                        onClick={() => goToStep2('unknown')}
                                        className="col-span-3 relative flex flex-col items-center justify-center p-2 rounded-xl bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 text-slate-700 dark:text-slate-200 shadow-lg hover:shadow-slate-400/50 dark:hover:shadow-slate-600/50 hover:scale-105 active:scale-100 transition-all duration-300 min-h-[80px] landscape:min-h-[90px] group overflow-hidden border-2 border-dashed border-slate-400 dark:border-slate-500"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent dark:from-white/5" />
                                        <HelpCircle size={24} strokeWidth={2.5} className="mb-1 relative z-10 group-hover:scale-110 transition-transform" />
                                        <span className="text-[10px] font-black uppercase tracking-tight leading-tight text-center px-1 relative z-10">{t('scout.unknownPlayer')}</span>
                                        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    </button>

                                    {/* Player Slots (Remaining - col-span-2) */}
                                    {sortedPlayers.map(p => (
                                        <button
                                            key={p.id}
                                            onClick={() => goToStep2(p.id)}
                                            className={`
                                            col-span-2
                                            relative flex flex-col items-center justify-center p-1.5 rounded-xl
                                            bg-gradient-to-br ${theme.bg} ${theme.bgDark}
                                            shadow-lg hover:shadow-xl
                                            hover:scale-105 active:scale-100
                                            transition-all duration-300
                                            min-h-[100px] landscape:min-h-[80px]
                                            group overflow-hidden
                                            border-2 border-white/20 dark:border-white/10
                                            hover:border-white/40 dark:hover:border-white/30
                                        `}
                                        >
                                            {/* Animated background gradient */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent dark:from-black/40" />
                                            <div className={`absolute inset-0 bg-gradient-to-br ${theme.bg} opacity-0 group-hover:opacity-30 transition-opacity duration-500`} />

                                            {/* Number */}
                                            <div className={`
                                            flex items-center justify-center text-3xl font-black
                                            ${theme.text} ${theme.textDark}
                                            drop-shadow-lg mb-1 relative z-10
                                            group-hover:scale-110 group-hover:-rotate-6
                                            transition-all duration-300
                                        `}>
                                                {p.number || "#"}
                                            </div>

                                            {/* Name */}
                                            <div className="w-full text-center px-0.5 relative z-10">
                                                <span className="block text-[10px] font-black uppercase tracking-tight text-white dark:text-white leading-tight drop-shadow-md line-clamp-2">
                                                    {p.name}
                                                </span>
                                            </div>

                                            {/* Shine effect */}
                                            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12" />
                                        </button>
                                    ))}

                                    {/* Fillers for alignment if < 6 players */}
                                    {[...Array(Math.max(0, 6 - sortedPlayers.length))].map((_, i) => (
                                        <div key={`filler-${i}`} className="col-span-2 rounded-xl border border-dashed border-slate-200/50 dark:border-white/5 bg-transparent min-h-[100px] landscape:min-h-[80px] opacity-30" />
                                    ))}
                                </div>
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
                            className="w-full h-full flex flex-col landscape:flex-row p-6 landscape:p-8 gap-4 landscape:gap-8 overflow-hidden"
                        >
                            {/* LEFT SIDE: Info (Landscape) / Top (Portrait) */}
                            <div className="flex-shrink-0 landscape:w-1/3 landscape:flex landscape:flex-col landscape:justify-center">
                                {/* Back Button */}
                                <button
                                    onClick={goToStep1}
                                    className="self-start mb-4 flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95 shadow-lg group"
                                >
                                    <ChevronLeft size={20} strokeWidth={3} className="group-hover:-translate-x-1 transition-transform" />
                                    <span className="text-sm font-bold">{t('common.back')}</span>
                                </button>

                                {/* Player Info Card - Compact */}
                                <div className="flex items-center gap-4 p-4 rounded-3xl bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900 shadow-xl border-2 border-slate-200 dark:border-slate-700 mb-6 landscape:mb-0 landscape:w-full">
                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-black ${theme.bg} ${theme.text} ${theme.textDark} shadow-2xl ring-1 ring-inset ring-white/10`}>
                                        {selectedPlayer?.number || "?"}
                                    </div>
                                    <div className="flex-1">
                                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 block mb-1">
                                            {t('scout.whoScored')}
                                        </span>
                                        <h3 className="text-xl font-black text-slate-800 dark:text-white leading-tight tracking-tight line-clamp-2">
                                            {selectedPlayer?.name}
                                        </h3>
                                    </div>
                                </div>

                                {/* Skills Title (Hidden in Landscape to save space, or kept small) */}
                                <h4 className="text-center text-base font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-4 landscape:hidden">
                                    {t('scout.selectAction')}
                                </h4>
                            </div>

                            {/* RIGHT SIDE: Skills (Landscape) / Bottom (Portrait) */}
                            <div className="flex-1 landscape:h-full landscape:flex landscape:items-center">
                                <div className="grid grid-cols-1 gap-3 landscape:grid-cols-3 landscape:gap-4 w-full">
                                    {skills.map(s => (
                                        <button
                                            key={s.id}
                                            onClick={() => handleSkillSelect(s.id)}
                                            className={`
                                            relative flex flex-col items-center justify-center gap-2 p-3 rounded-2xl
                                            transition-all duration-300
                                            bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900
                                            border-2 border-slate-200 dark:border-slate-700
                                            hover:border-${s.colorClass.split('-')[1]}-400 dark:hover:border-${s.colorClass.split('-')[1]}-500
                                            hover:shadow-xl hover:shadow-${s.colorClass.split('-')[1]}-500/30
                                            hover:scale-105 active:scale-100
                                            min-h-[90px] landscape:min-h-[140px]
                                            group overflow-hidden
                                        `}
                                        >
                                            {/* Animated Background Orb */}
                                            <div className={`
                                            absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                                            w-32 h-32 rounded-full blur-3xl
                                            ${s.bgClass.replace('bg-', 'bg-').replace('/10', '/20')}
                                            opacity-0 group-hover:opacity-100 transition-opacity duration-700
                                            group-hover:scale-150
                                        `} />

                                            {/* Icon with Glow */}
                                            <div className={`
                                            relative z-10 w-12 h-12 landscape:w-16 landscape:h-16 rounded-2xl flex items-center justify-center
                                            bg-gradient-to-br ${s.bgClass.replace('bg-', 'from-').replace('/10', '/10')} to-transparent
                                            shadow-lg ring-2 ring-white dark:ring-slate-900
                                            group-hover:scale-110 group-hover:rotate-12
                                            transition-all duration-500
                                        `}>
                                                <div className={`absolute inset-0 rounded-2xl ${s.bgClass.replace('/10', '/30')} blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                                                <s.icon size={24} className={`${s.colorClass} relative z-10 landscape:w-8 landscape:h-8`} strokeWidth={2.5} />
                                            </div>

                                            {/* Label with gradient text */}
                                            <div className="relative z-10 flex flex-col items-center gap-0.5">
                                                <span className={`
                                                text-sm landscape:text-lg font-black uppercase tracking-wider
                                                bg-gradient-to-r ${s.colorClass.replace('text-', 'from-')} to-${s.colorClass.split('-')[1]}-700
                                                dark:from-${s.colorClass.split('-')[1]}-400 dark:to-${s.colorClass.split('-')[1]}-500
                                                bg-clip-text text-transparent
                                                group-hover:scale-110 transition-transform duration-300
                                            `}>
                                                    {s.label}
                                                </span>
                                            </div>

                                            {/* Shimmer Effect */}
                                            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000 skew-x-12 rounded-2xl" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </Modal>
    );
};