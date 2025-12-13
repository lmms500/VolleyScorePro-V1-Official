
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Team, SkillType, TeamColor } from '../../types';
import { Swords, Shield, Target, AlertTriangle, X, ChevronLeft, HelpCircle, User } from 'lucide-react';
import { motion, AnimatePresence, PanInfo, useDragControls, Transition } from 'framer-motion';
import { resolveTheme } from '../../utils/colors';
import { useTranslation } from '../../contexts/LanguageContext';
import { useHaptics } from '../../hooks/useHaptics';

interface ScoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  team: Team;
  onConfirm: (playerId: string, skill: SkillType) => void;
  colorTheme: TeamColor;
}

// --- ANIMATION CONFIG ---
const springTransition: Transition = {
    type: "spring",
    damping: 25,
    stiffness: 300,
    mass: 0.8
};

const slideVariants = {
    enter: (direction: number) => ({
        x: direction > 0 ? "100%" : "-100%",
        opacity: 0,
        scale: 0.95
    }),
    center: {
        x: 0,
        opacity: 1,
        scale: 1,
        transition: { ...springTransition, delay: 0.1 } // Slight delay for stagger feel
    },
    exit: (direction: number) => ({
        x: direction < 0 ? "100%" : "-100%",
        opacity: 0,
        scale: 0.95,
        transition: { duration: 0.2, ease: "easeIn" }
    })
};

export const ScoutModal: React.FC<ScoutModalProps> = ({ 
    isOpen, 
    onClose, 
    team, 
    onConfirm,
    colorTheme 
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
            setStep(1);
            setDirection(0);
            setSelectedPlayerId(null);
            // Prevent accidental backdrop clicks immediately after opening
            const timer = setTimeout(() => setIsReadyToClose(true), 300);
            return () => {
                clearTimeout(timer);
                setIsReadyToClose(false);
            };
        }
    }, [isOpen]);

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
        // Small delay to clear selection after animation starts looks cleaner
        setTimeout(() => setSelectedPlayerId(null), 200);
    };

    const handleOpponentError = () => {
        haptics.notification('success');
        // We use a special ID or null for opponent error that allows the stats engine to attribute it correctly
        // The parent onConfirm expects string, so we pass 'opponent_error_placeholder' which App.tsx/reducer handles
        // Actually, based on previous logic, we can pass 'unknown' and skill 'opponent_error', 
        // OR better: handle it as a direct point without player attribution.
        // Let's pass a specific flag ID that the parent can strip out or handle.
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
        if (info.offset.y > 100 || info.velocity.y > 300) onClose();
    };

    // --- DATA PREP ---
    const theme = resolveTheme(colorTheme);

    const sortedPlayers = useMemo(() => {
        // Filter to only get Court players (exclude reserves if possible, though team.players usually implies court)
        // If team structure separates players vs reserves, we use team.players.
        // Limit to 6 for the grid layout visually.
        return [...team.players]
            .slice(0, 6) 
            .sort((a, b) => {
                // Sort by Fixed (Anchors) first, then Number, then Name
                if (a.isFixed !== b.isFixed) return a.isFixed ? -1 : 1;
                const numA = parseInt(a.number || '999');
                const numB = parseInt(b.number || '999');
                return numA - numB;
            });
    }, [team.players]);

    const selectedPlayer = selectedPlayerId 
        ? (selectedPlayerId === 'unknown' ? { name: t('scout.unknownPlayer'), number: '?' } : team.players.find(p => p.id === selectedPlayerId))
        : null;

    // Filtered Skills for Step 2 (Removed Opponent Error)
    const skills: { id: SkillType, label: string, icon: any, colorClass: string, bgClass: string }[] = [
        { id: 'attack', label: t('scout.skills.attack'), icon: Swords, colorClass: 'text-rose-500', bgClass: 'bg-rose-500/10 active:bg-rose-500/20' },
        { id: 'block', label: t('scout.skills.block'), icon: Shield, colorClass: 'text-indigo-500', bgClass: 'bg-indigo-500/10 active:bg-indigo-500/20' },
        { id: 'ace', label: t('scout.skills.ace'), icon: Target, colorClass: 'text-emerald-500', bgClass: 'bg-emerald-500/10 active:bg-emerald-500/20' },
    ];

    // --- RENDER ---
    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex flex-col justify-end items-center isolate">
                    
                    {/* Backdrop */}
                    <motion.div 
                        className="absolute inset-0 bg-slate-900/40 dark:bg-black/80 backdrop-blur-md z-0"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        onClick={handleBackdropClick}
                    />
                    
                    {/* Floating Modal Sheet */}
                    <motion.div 
                        ref={containerRef}
                        className="
                            relative z-10 w-full max-w-[500px]
                            bg-[#f8fafc] dark:bg-[#0f172a]
                            rounded-t-[32px] sm:rounded-[32px]
                            shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.3)]
                            flex flex-col overflow-hidden
                            ring-1 ring-white/20 dark:ring-white/5
                            sm:mb-4
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
                        {/* Drag Handle Area */}
                        <div 
                            className="w-full flex justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing touch-none z-20"
                            onPointerDown={(e) => dragControls.start(e)}
                        >
                            <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-white/20" />
                        </div>

                        {/* Viewport */}
                        <div className="relative w-full overflow-hidden" style={{ minHeight: '400px' }}>
                            <AnimatePresence initial={false} custom={direction} mode="wait">
                                
                                {/* STEP 1: SELECT PLAYER or OPPONENT ERROR */}
                                {step === 1 ? (
                                    <motion.div 
                                        key="step1"
                                        custom={direction}
                                        variants={slideVariants}
                                        initial="enter"
                                        animate="center"
                                        exit="exit"
                                        className="absolute inset-0 flex flex-col p-6 pt-2 pb-safe-bottom"
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                                    {t('scout.step1')}
                                                </span>
                                                <h3 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">
                                                    {t('scout.whoScored')}
                                                </h3>
                                            </div>
                                            <button 
                                                onClick={onClose}
                                                className="p-2 rounded-full bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                                            >
                                                <X size={20} />
                                            </button>
                                        </div>

                                        <div className="flex-1 overflow-y-auto custom-scrollbar -mx-2 px-2 flex flex-col gap-3">
                                            
                                            {/* Top Actions: Opponent Error & Unknown */}
                                            <div className="grid grid-cols-2 gap-3">
                                                <button 
                                                    onClick={handleOpponentError}
                                                    className="
                                                        flex flex-col items-center justify-center gap-2 p-3 rounded-2xl
                                                        bg-amber-500/10 active:bg-amber-500/20
                                                        border border-amber-500/20 hover:border-amber-500/40
                                                        text-amber-600 dark:text-amber-500
                                                        transition-all active:scale-95 shadow-sm
                                                    "
                                                >
                                                    <AlertTriangle size={24} strokeWidth={2} />
                                                    <span className="text-[10px] font-black uppercase tracking-wider leading-tight text-center">
                                                        {t('scout.skills.opponent_error')}
                                                    </span>
                                                </button>

                                                <button 
                                                    onClick={() => goToStep2('unknown')}
                                                    className="
                                                        flex flex-col items-center justify-center gap-2 p-3 rounded-2xl
                                                        bg-slate-100 dark:bg-white/5 active:bg-slate-200 dark:active:bg-white/10
                                                        border border-black/5 dark:border-white/5
                                                        text-slate-500 dark:text-slate-400
                                                        transition-all active:scale-95 shadow-sm
                                                    "
                                                >
                                                    <HelpCircle size={24} strokeWidth={2} />
                                                    <span className="text-[10px] font-black uppercase tracking-wider leading-tight text-center">
                                                        {t('scout.unknownPlayer')}
                                                    </span>
                                                </button>
                                            </div>

                                            {/* Players Grid (Auto 2x3 layout ideally) */}
                                            <div className="grid grid-cols-3 gap-2 mt-1">
                                                {sortedPlayers.map(p => (
                                                    <button 
                                                        key={p.id}
                                                        onClick={() => goToStep2(p.id)}
                                                        className="
                                                            relative flex flex-col items-center justify-between p-2 rounded-2xl
                                                            bg-white dark:bg-white/5 
                                                            border border-black/5 dark:border-white/5
                                                            active:scale-95 transition-all duration-200
                                                            aspect-[3/4] shadow-sm hover:border-indigo-500/30
                                                        "
                                                    >
                                                        {/* Number is Hero */}
                                                        <div className={`
                                                            flex-1 flex items-center justify-center 
                                                            text-4xl font-black ${theme.text} ${theme.textDark}
                                                            drop-shadow-sm
                                                        `}>
                                                            {p.number || "#"}
                                                        </div>
                                                        
                                                        {/* Name is Footer */}
                                                        <div className="w-full text-center">
                                                            <span className="block text-[10px] font-bold text-slate-600 dark:text-slate-300 truncate leading-tight">
                                                                {p.name}
                                                            </span>
                                                        </div>
                                                    </button>
                                                ))}
                                                
                                                {/* Fillers to maintain grid shape if < 6 players */}
                                                {[...Array(Math.max(0, 6 - sortedPlayers.length))].map((_, i) => (
                                                    <div 
                                                        key={`filler-${i}`} 
                                                        className="rounded-2xl border border-dashed border-slate-200 dark:border-white/5 bg-transparent aspect-[3/4]"
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </motion.div>
                                ) : (
                                    
                                    /* STEP 2: SELECT ACTION (Reduced Options) */
                                    <motion.div 
                                        key="step2"
                                        custom={direction}
                                        variants={slideVariants}
                                        initial="enter"
                                        animate="center"
                                        exit="exit"
                                        className="absolute inset-0 flex flex-col p-6 pt-2 pb-safe-bottom"
                                    >
                                        <div className="flex flex-col gap-4 mb-6">
                                            {/* Header Navigation */}
                                            <button 
                                                onClick={goToStep1}
                                                className="self-start flex items-center gap-1 pl-1 pr-3 py-1.5 rounded-full bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors text-xs font-bold"
                                            >
                                                <ChevronLeft size={14} /> {t('common.back')}
                                            </button>
                                            
                                            {/* Context: Selected Player */}
                                            <div className="flex items-center gap-4">
                                                <div className={`
                                                    w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black
                                                    ${theme.bg} ${theme.text} ${theme.textDark} border ${theme.border}
                                                `}>
                                                    {selectedPlayer?.number || "?"}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                                        {t('scout.step2')}
                                                    </span>
                                                    <h3 className="text-2xl font-black text-slate-800 dark:text-white leading-none tracking-tight">
                                                        {selectedPlayer?.name}
                                                    </h3>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions Grid - 3 Items */}
                                        <div className="grid grid-cols-1 gap-3 flex-1 h-full">
                                            {skills.map(s => (
                                                <button 
                                                    key={s.id}
                                                    onClick={() => handleSkillSelect(s.id)}
                                                    className={`
                                                        relative flex items-center justify-start gap-4 px-6 py-4 rounded-[20px]
                                                        transition-all duration-200 active:scale-95
                                                        ${s.bgClass} border border-transparent hover:border-current
                                                    `}
                                                >
                                                    <s.icon size={28} className={s.colorClass} strokeWidth={2} />
                                                    <span className={`text-sm font-black uppercase tracking-wider ${s.colorClass}`}>
                                                        {s.label}
                                                    </span>
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
