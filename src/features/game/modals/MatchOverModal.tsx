import React, { useState, useMemo, useEffect, Suspense, lazy } from 'react';
import { createPortal } from 'react-dom';
import { Modal } from '@ui/Modal';
import { Button } from '@ui/Button';
import { GameState } from '@types';
import {
    Trophy, LogOut, LogIn, MoveRight, Undo, RotateCcw,
    Share2, Download, X, Loader2, Users
} from 'lucide-react';
import { useTranslation } from '@contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ResultCard } from '@features/social/components/ResultCard';
import { useSocialShare } from '@features/social/hooks/useSocialShare';
import { resolveTheme } from '@lib/utils/colors';
import { Confetti } from '@ui/Confetti';
import { useHaptics } from '@lib/haptics/useHaptics';
import { useHistoryStore, Match } from '@features/history/store/historyStore';
import { useNotification } from '@contexts/NotificationContext';

// Lazy load ProAnalysis para performance
const ProAnalysis = lazy(() => import('@features/history/components/ProAnalysis').then(m => ({ default: m.ProAnalysis })));

interface MatchOverModalProps {
    isOpen: boolean;
    state: GameState;
    onRotate: () => void;
    onReset: () => void;
    onUndo: () => void;
    savedMatchId: string | null;
    isSpectator?: boolean;
}

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { type: 'spring', stiffness: 300, damping: 24 }
    }
};

export const MatchOverModal: React.FC<MatchOverModalProps> = ({ isOpen, state, onRotate, onReset, onUndo, savedMatchId, isSpectator = false }) => {
    const { t } = useTranslation();
    const [view, setView] = useState<'summary' | 'analysis'>('summary');
    const [renderShareCard, setRenderShareCard] = useState(false);
    const [canInteract, setCanInteract] = useState(false);
    const [generatingAction, setGeneratingAction] = useState<'share' | 'download' | null>(null);
    const { showNotification } = useNotification();
    const { isSharing, shareMatch, downloadMatch } = useSocialShare();
    const haptics = useHaptics();
    const { matches } = useHistoryStore();

    const winnerName = state.matchWinner === 'A' ? state.teamAName : state.teamBName;
    const isA = state.matchWinner === 'A';
    const report = state.rotationReport;

    const colorA = state.teamARoster.color || 'indigo';
    const colorB = state.teamBRoster.color || 'rose';

    const winnerColorKey = isA ? colorA : colorB;
    // const winnerTheme = resolveTheme(winnerColorKey); // Removed as unused in SPEC, but kept theme logic implicitly via color keys

    // [LOTE 2] Premium Rotation Logic
    const transferAnalysis = useMemo(() => {
        if (!report) return null;
        const leaving = report.outgoingTeam.players.filter(p =>
            !report.retainedPlayers.some(rp => rp.id === p.id)
        );
        return { leaving, incoming: report.incomingTeam.players };
    }, [report]);

    // Tentar encontrar a partida real no histórico para persistir a análise
    const matchToAnalyze = useMemo(() => {
        const foundInStore = matches.find(m => m.id === savedMatchId);
        if (foundInStore) return foundInStore;

        // Fallback para objeto temporário se não encontrado (não deve acontecer)
        return {
            id: savedMatchId || 'temp-match',
            date: new Date().toISOString(),
            timestamp: Date.now(),
            durationSeconds: state.matchDurationSeconds,
            teamAName: state.teamAName,
            teamBName: state.teamBName,
            setsA: state.setsA,
            setsB: state.setsB,
            winner: state.matchWinner,
            sets: state.history,
            actionLog: state.matchLog,
            config: state.config,
            teamARoster: state.teamARoster,
            teamBRoster: state.teamBRoster
        } as Match;
    }, [savedMatchId, matches, state]);

    useEffect(() => {
        if (isOpen) {
            console.log('[MatchOver] OPENED. isOpen:', isOpen, 'isSpectator:', isSpectator);
            console.log('[MatchOver] Props Check:', { onRotate: !!onRotate, onReset: !!onReset });
            setCanInteract(false);
            setView('summary');
            const timer = setTimeout(() => {
                console.log('[MatchOver] Timer fired. Setting canInteract = TRUE');
                setCanInteract(true);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const handleShareAction = async (action: 'share' | 'download') => {
        if (generatingAction || isSharing) return;

        setGeneratingAction(action);
        setRenderShareCard(true);
        haptics.impact('light');

        // Delay to ensure render
        setTimeout(async () => {
            try {
                if (action === 'share') {
                    await shareMatch();
                } else {
                    await downloadMatch();
                    showNotification({
                        type: 'success',
                        mainText: t('export.successTitle') || 'Saved!',
                        subText: t('export.successMsg') || 'Image saved to gallery',
                        systemIcon: 'save'
                    });
                }
            } catch (error) {
                console.error(error);
                showNotification({
                    type: 'error',
                    mainText: t('export.errorTitle') || 'Error',
                    subText: t('export.errorMsg') || 'Failed to export image',
                    systemIcon: 'alert'
                });
            } finally {
                setGeneratingAction(null);
                setRenderShareCard(false);
            }
        }, 500);
    };

    const handleRotateWrapper = () => {
        console.log('[MatchOver] Next Game Clicked.');
        console.log('  State -> canInteract:', canInteract, 'isSpectator:', isSpectator);
        if (!canInteract) console.warn('[MatchOver] Blocked: Interaction not allowed yet');
        if (isSpectator) console.warn('[MatchOver] Blocked: Spectator mode');

        if (canInteract && !isSpectator) {
            console.log('[MatchOver] Executing onRotate()');
            onRotate();
        }
    };

    const handleResetWrapper = () => {
        console.log('[MatchOver] Reset Clicked.');
        console.log('  State -> canInteract:', canInteract, 'isSpectator:', isSpectator);
        if (!canInteract) console.warn('[MatchOver] Blocked: Interaction not allowed yet');
        if (isSpectator) console.warn('[MatchOver] Blocked: Spectator mode');

        if (canInteract && !isSpectator) {
            console.log('[MatchOver] Executing onReset()');
            onReset();
        }
    };

    return (
        <>
            {renderShareCard && createPortal(
                <ResultCard
                    teamAName={state.teamAName} teamBName={state.teamBName}
                    setsA={state.setsA} setsB={state.setsB}
                    winner={state.matchWinner} setsHistory={state.history}
                    durationSeconds={state.matchDurationSeconds} date={new Date().toLocaleDateString()}
                    colorA={colorA} colorB={colorB}
                />,
                document.body
            )}

            <Modal isOpen={isOpen} onClose={() => { }} title="" showCloseButton={false} persistent={true} variant="immersive" zIndex="z-[100]">
                {/* Background Dinâmico - Darker for contrast */}
                <div className="fixed inset-0 bg-[#0f1025] pointer-events-none z-0">
                    <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/10 to-[#0b0c15] opacity-80" />
                </div>

                {/* CONFETTI - Disabled in Low Graphics */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-40">
                    <Confetti
                        colors={[winnerColorKey, winnerColorKey]}
                        intensity="high"
                        physicsVariant="ambient"
                        enabled
                    />
                </div>

                <div className="relative z-10 flex flex-col h-full w-full pt-safe-top pb-safe-bottom">



                    <AnimatePresence mode="wait">
                        {view === 'summary' ? (
                            <motion.div
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                exit="hidden"
                                className="flex-1 flex flex-col h-full overflow-hidden"
                            >
                                {/* 1. HEADER SECTION */}
                                <motion.div variants={itemVariants} className="flex flex-col items-center justify-center p-6 shrink-0 relative">
                                    {/* Glow effect atrás do troféu */}
                                    <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-${winnerColorKey}-500/20 blur-[50px] rounded-full`} />

                                    <Trophy
                                        size={64}
                                        className="text-white drop-shadow-2xl relative z-10"
                                        strokeWidth={1.5}
                                    />

                                    <h2 className="text-3xl font-black text-white mt-6 uppercase tracking-tighter leading-none text-center relative z-10">
                                        {winnerName}
                                    </h2>

                                    <div className="flex items-center gap-4 text-6xl font-black mt-2 relative z-10">
                                        <span className={`text-${isA ? colorA : 'slate'}-400 drop-shadow-lg`}>{state.setsA}</span>
                                        <span className="text-white/10 font-thin text-4xl">/</span>
                                        <span className={`text-${!isA ? colorB : 'slate'}-400 drop-shadow-lg`}>{state.setsB}</span>
                                    </div>
                                </motion.div>

                                {/* SCROLLABLE CONTENT AREA */}
                                <div className="flex-1 overflow-y-auto custom-scrollbar px-4 pb-4 space-y-6">

                                    {/* 2. NEXT ROTATION SECTION */}
                                    <motion.div variants={itemVariants}>
                                        {/* Divider Title */}
                                        <div className="flex items-center gap-4 mb-2">
                                            <div className="flex-1 h-px bg-white/10" />
                                            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/30">
                                                {t('matchOver.rotationReport.nextRotation')}
                                            </span>
                                            <div className="flex-1 h-px bg-white/10" />
                                        </div>

                                        {transferAnalysis ? (
                                            <div className="flex items-center gap-1.5 px-1">
                                                {/* LEAVING CARD (Ultra Compact) */}
                                                <div className="flex-1 bg-white/[0.07] backdrop-blur-sm border border-white/15 rounded-xl p-2 flex flex-col items-center text-center relative overflow-hidden group ring-1 ring-inset ring-white/5 shadow-sm">
                                                    <div className="absolute inset-0 bg-gradient-to-b from-rose-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    <div className="mb-0.5 p-1 rounded-full bg-gradient-to-br from-rose-500 to-rose-600 text-white shadow-sm shadow-rose-500/30">
                                                        <LogOut size={12} />
                                                    </div>
                                                    <span className="text-[8px] font-bold text-rose-400 uppercase tracking-wider mb-0.5 leading-none">
                                                        {(() => {
                                                            const val = t('matchOver.rotationReport.leavingCard');
                                                            return val.includes('matchOver.') ? 'SAI' : val;
                                                        })()}
                                                    </span>
                                                    <span className="text-[10px] font-black text-white leading-tight truncate w-full max-w-[90px]">
                                                        {report?.outgoingTeam.name}
                                                    </span>
                                                    <span className="text-[8px] text-white/40 font-medium mt-0.5 leading-none">
                                                        {transferAnalysis.leaving.length} {t('common.players')}
                                                    </span>
                                                </div>

                                                {/* CONNECTOR */}
                                                <div className="shrink-0 flex items-center justify-center -mx-1 z-10">
                                                    <div className="w-5 h-5 rounded-full bg-[#0b0c15] border border-white/10 flex items-center justify-center text-white/30 shadow-lg">
                                                        <MoveRight size={10} />
                                                    </div>
                                                </div>

                                                {/* ENTERING CARD (Ultra Compact) */}
                                                <div className="flex-1 bg-white/[0.07] backdrop-blur-sm border border-white/15 rounded-xl p-2 flex flex-col items-center text-center relative overflow-hidden group ring-1 ring-inset ring-white/5 shadow-sm">
                                                    <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    <div className="mb-0.5 p-1 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-sm shadow-emerald-500/30">
                                                        <LogIn size={12} />
                                                    </div>
                                                    <span className="text-[8px] font-bold text-emerald-400 uppercase tracking-wider mb-0.5 leading-none">
                                                        {(() => {
                                                            const val = t('matchOver.rotationReport.incomingCard');
                                                            return val.includes('matchOver.') ? 'ENTRA' : val;
                                                        })()}
                                                    </span>
                                                    <span className="text-[10px] font-black text-white leading-tight truncate w-full max-w-[90px]">
                                                        {report?.incomingTeam.name}
                                                    </span>
                                                    <span className="text-[8px] text-white/40 font-medium mt-0.5 leading-none">
                                                        {transferAnalysis.incoming.length} {t('common.players')}
                                                    </span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-8 border border-dashed border-white/15 rounded-2xl bg-white/[0.05] backdrop-blur-sm mx-2 ring-1 ring-inset ring-white/5">
                                                <RotateCcw size={24} className="text-white/20 mb-2" />
                                                <span className="text-xs font-bold text-white/40 uppercase tracking-wider">{t('matchOver.rotationReport.noData')}</span>
                                                <p className="text-[9px] text-white/30 text-center px-4 mt-1">
                                                    {t('teamManager.queueHint') || 'Add teams to queue to see rotation reports'}
                                                </p>
                                            </div>
                                        )}
                                    </motion.div>

                                    {/* 3. PLAYERS LISTS */}
                                    {transferAnalysis && transferAnalysis.incoming.length > 0 && (
                                        <motion.div variants={itemVariants} className="space-y-3">
                                            <div className="flex items-center gap-2">
                                                <Users size={12} className="text-emerald-500" />
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-white/50">
                                                    {t('matchOver.rotationReport.enteringCourt')}
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {transferAnalysis.incoming.map(p => {
                                                    const isBorrowed = report?.stolenPlayers.some(sp => sp.id === p.id);
                                                    return (
                                                        <div key={p.id} className={`flex items-center border rounded-lg pl-1.5 pr-3 py-1.5 backdrop-blur-sm ${isBorrowed
                                                            ? 'bg-amber-500/10 border-amber-500/20 text-amber-200'
                                                            : 'bg-white/5 border-white/10 text-slate-200'
                                                            }`}>
                                                            {p.number && (
                                                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded mr-2 min-w-[20px] text-center ${isBorrowed
                                                                    ? 'bg-amber-500/20 text-amber-100'
                                                                    : 'bg-white/10 text-white/70'
                                                                    }`}>
                                                                    {p.number}
                                                                </span>
                                                            )}
                                                            <span className="text-[11px] font-bold">{p.name}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* BORROWED PLAYERS */}
                                    {report?.stolenPlayers && report.stolenPlayers.length > 0 && (
                                        <motion.div variants={itemVariants} className="space-y-3 pt-2">
                                            <div className="flex items-center gap-2">
                                                <Users size={12} className="text-amber-500" />
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500/70">
                                                    {t('matchOver.rotationReport.borrowedPlayers')}
                                                </span>
                                            </div>
                                            <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-3">
                                                <div className="flex flex-wrap gap-2 mb-2">
                                                    {report.stolenPlayers.map(p => (
                                                        <div key={p.id} className="flex items-center bg-amber-500/10 border border-amber-500/20 rounded-lg pl-1.5 pr-3 py-1.5 text-amber-200">
                                                            {p.number && (
                                                                <span className="bg-amber-500/20 text-amber-100 text-[9px] font-bold px-1.5 py-0.5 rounded mr-2">
                                                                    {p.number}
                                                                </span>
                                                            )}
                                                            <span className="text-[11px] font-bold">{p.name}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                                <p className="text-[9px] text-amber-500/50 italic leading-relaxed">
                                                    {t('matchOver.rotationReport.borrowedDisclaimer')}
                                                </p>
                                            </div>
                                        </motion.div>
                                    )}
                                </div>

                                {/* 4. FOOTER ACTIONS (3 LEVELS) */}
                                <motion.div variants={itemVariants} className="p-6 pt-4 bg-gradient-to-t from-[#020617] via-[#020617] to-transparent space-y-4 relative z-50 pointer-events-auto">

                                    {/* Level 1: Primary Action */}
                                    <Button
                                        onClick={handleRotateWrapper}
                                        disabled={!canInteract || isSpectator}
                                        className="w-full h-16 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-lg uppercase tracking-widest shadow-xl shadow-indigo-500/30 border-0 flex items-center justify-center gap-3 relative overflow-hidden group ring-1 ring-inset ring-white/10"
                                    >
                                        <span>{t('matchOver.nextGameButton')}</span>
                                        <MoveRight size={20} className="stroke-[3]" />
                                    </Button>

                                    {/* Level 2: Secondary Actions (Grid 2x2 for better touch targets) */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <Button
                                            onClick={() => handleShareAction('share')}
                                            disabled={isSharing || !!generatingAction || !canInteract}
                                            className="h-12 rounded-xl bg-white/10 hover:bg-white/15 active:bg-white/20 text-white/80 hover:text-white font-bold uppercase tracking-wider text-[10px] border border-white/15 backdrop-blur-md flex items-center justify-center gap-2 transition-all ring-1 ring-inset ring-white/10 shadow-sm"
                                        >
                                            {(isSharing || generatingAction === 'share') ? <Loader2 size={16} className="animate-spin" /> : <Share2 size={16} />}
                                            {t('matchOver.share')}
                                        </Button>

                                        <Button
                                            onClick={() => handleShareAction('download')}
                                            disabled={isSharing || !!generatingAction || !canInteract}
                                            className="h-12 rounded-xl bg-white/10 hover:bg-white/15 active:bg-white/20 text-white/80 hover:text-white font-bold uppercase tracking-wider text-[10px] border border-white/15 backdrop-blur-md flex items-center justify-center gap-2 transition-all ring-1 ring-inset ring-white/10 shadow-sm"
                                        >
                                            {generatingAction === 'download' ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                                            {t('matchOver.download')}
                                        </Button>

                                        <Button
                                            onClick={onUndo}
                                            variant="ghost"
                                            disabled={!canInteract || isSpectator}
                                            className="h-12 rounded-xl text-slate-500 hover:text-indigo-300 hover:bg-indigo-500/10 font-bold uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 transition-colors border border-transparent hover:border-indigo-500/20"
                                        >
                                            <Undo size={16} /> {t('controls.undo')}
                                        </Button>

                                        <Button
                                            onClick={handleResetWrapper}
                                            variant="ghost"
                                            disabled={!canInteract || isSpectator}
                                            className="h-12 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 font-bold uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 transition-colors border border-transparent hover:border-rose-500/20"
                                        >
                                            <RotateCcw size={16} /> {t('controls.reset')}
                                        </Button>
                                    </div>

                                </motion.div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="analysis-view"
                                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                                className="flex-1 overflow-y-auto custom-scrollbar px-6"
                            >
                                <Suspense fallback={
                                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                                        <Loader2 className="animate-spin text-indigo-500" size={32} />
                                        <span className="text-[10px] font-black uppercase text-slate-400">{t('analysis.processing')}</span>
                                    </div>
                                }>
                                    <ProAnalysis match={matchToAnalyze} />
                                </Suspense>

                                <div className="pb-20">
                                    <Button onClick={() => setView('summary')} className="w-full bg-white/10 backdrop-blur-sm text-white/70 hover:text-white rounded-2xl h-14 font-black uppercase text-xs tracking-widest border border-white/15 ring-1 ring-inset ring-white/10 shadow-sm">
                                        {t('common.back')}
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence >
                </div >
            </Modal >
        </>
    );
};
