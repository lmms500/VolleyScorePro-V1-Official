
import React, { useState, useMemo, useEffect, Suspense, lazy } from 'react';
import { createPortal } from 'react-dom';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { GameState, TeamId } from '../../types';
import { Trophy, RefreshCw, Undo2, Share2, Loader2, Download, RotateCcw, X, BrainCircuit, Sparkles, ArrowLeft } from 'lucide-react';
import { useTranslation } from '../../contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ResultCard } from '../Share/ResultCard';
import { useSocialShare } from '../../hooks/useSocialShare';
import { resolveTheme } from '../../utils/colors';
import { Confetti } from '../ui/Confetti';
import { useHaptics } from '../../hooks/useHaptics';
import { useHistoryStore, Match } from '../../stores/historyStore';

// Lazy load ProAnalysis para performance
const ProAnalysis = lazy(() => import('../History/ProAnalysis').then(m => ({ default: m.ProAnalysis })));

interface MatchOverModalProps {
  isOpen: boolean;
  state: GameState;
  onRotate: () => void;
  onReset: () => void;
  onUndo: () => void;
  savedMatchId: string | null;
  isSpectator?: boolean;
}

export const MatchOverModal: React.FC<MatchOverModalProps> = ({ isOpen, state, onRotate, onReset, onUndo, savedMatchId, isSpectator = false }) => {
  const { t } = useTranslation();
  const [view, setView] = useState<'summary' | 'analysis'>('summary');
  const [renderShareCard, setRenderShareCard] = useState(false);
  const [canInteract, setCanInteract] = useState(false); 
  const { isSharing, shareMatch, downloadMatch } = useSocialShare();
  const haptics = useHaptics();
  const { matches } = useHistoryStore();

  const winnerName = state.matchWinner === 'A' ? state.teamAName : state.teamBName;
  const isA = state.matchWinner === 'A';
  const report = state.rotationReport;

  const colorA = state.teamARoster.color || 'indigo';
  const colorB = state.teamBRoster.color || 'rose';
  
  const winnerColorKey = isA ? colorA : colorB;
  const winnerTheme = resolveTheme(winnerColorKey);

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
        setCanInteract(false);
        setView('summary');
        const timer = setTimeout(() => setCanInteract(true), 1000); 
        return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleShareAction = (action: 'share' | 'download') => {
      setRenderShareCard(true);
      haptics.impact('light');
      setTimeout(() => {
          if (action === 'share') shareMatch();
          else downloadMatch();
      }, 500);
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

      <Modal isOpen={isOpen} onClose={() => {}} title="" showCloseButton={false} persistent={true} variant="immersive">
        {/* Background Dinâmico */}
        <div className={`absolute inset-0 bg-gradient-to-b ${winnerTheme.gradient.replace('/15', '/20')} to-slate-50 dark:to-[#0f172a] pointer-events-none z-0`} />
        
        {/* CONFETTI - Disabled in Low Graphics */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-60">
            <Confetti 
                colors={[winnerColorKey, winnerColorKey]} 
                intensity="high" 
                physicsVariant="ambient" 
                enabled={!state.config.lowGraphics} 
            />
        </div>

        <div className="relative z-10 flex flex-col h-full w-full pt-safe-top pb-safe-bottom">
            
            {/* Header / Botão Voltar da Análise */}
            <div className="flex justify-between items-center px-6 py-4 mt-2">
                <AnimatePresence mode="wait">
                    {view === 'analysis' ? (
                        <motion.button 
                            key="btn-back"
                            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                            onClick={() => setView('summary')}
                            className="p-2 rounded-full bg-white/20 dark:bg-black/20 text-slate-600 dark:text-slate-300 backdrop-blur-md border border-white/20 flex items-center gap-2 pr-4"
                        >
                            <ArrowLeft size={20} />
                            <span className="text-[10px] font-black uppercase tracking-widest">{t('common.summary')}</span>
                        </motion.button>
                    ) : (
                        <div /> // Spacer
                    )}
                </AnimatePresence>
                
                <button onClick={onRotate} className="p-2 rounded-full bg-white/20 dark:bg-black/20 text-slate-500 dark:text-slate-400 backdrop-blur-md border border-white/20 active:scale-90 transition-transform">
                    <X size={20} />
                </button>
            </div>

            <AnimatePresence mode="wait">
                {view === 'summary' ? (
                    <motion.div 
                        key="summary"
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                        className="flex-1 grid grid-rows-[35%_65%] landscape:grid-rows-none landscape:grid-cols-2 h-full overflow-hidden"
                    >
                        <div className="flex flex-col items-center justify-center text-center p-6">
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}>
                                <Trophy size={84} className={`${winnerTheme.text} ${winnerTheme.textDark} drop-shadow-2xl`} strokeWidth={1.5} />
                            </motion.div>
                            <h2 className="text-3xl font-black text-slate-900 dark:text-white mt-4 uppercase tracking-tighter leading-none">{winnerName}</h2>
                            <div className="flex items-center gap-6 text-5xl font-black mt-4">
                                <span className={isA ? winnerTheme.text : 'opacity-30'}>{state.setsA}</span>
                                <div className="h-10 w-[3px] bg-slate-200 dark:bg-white/10 rounded-full rotate-12"></div>
                                <span className={!isA ? winnerTheme.text : 'opacity-30'}>{state.setsB}</span>
                            </div>
                        </div>

                        <div className="flex flex-col h-full p-6 pt-0 landscape:pt-8 overflow-y-auto custom-scrollbar">
                            {/* AVISO PARA ESPECTADORES */}
                            {isSpectator && (
                                <motion.div 
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="w-full mb-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400"
                                >
                                    <p className="text-[11px] font-bold uppercase tracking-widest">👀 {t('liveSync.spectatorMode') || 'Spectator Mode'}</p>
                                    <p className="text-[9px] font-medium opacity-80 mt-1">{t('matchOver.waitingForHost') || 'Waiting for host to start next match...'}</p>
                                </motion.div>
                            )}

                            {/* BOTÃO MÁGICO IA */}
                            <motion.button 
                                whileTap={{ scale: 0.95 }}
                                className="w-full mb-5 p-4 rounded-3xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 flex items-center justify-between shadow-2xl group border border-white/10 relative overflow-hidden"
                                onClick={() => { haptics.impact('heavy'); setView('analysis'); }}
                            >
                                <div className="flex items-center gap-4 relative z-10">
                                    <div className="p-2 bg-indigo-500 rounded-xl text-white shadow-lg">
                                        <BrainCircuit size={24} />
                                    </div>
                                    <div className="text-left">
                                        <span className="block text-xs font-black uppercase tracking-widest">{t('analysis.aiCoach')}</span>
                                        <span className="block text-[9px] font-bold opacity-60 uppercase">{t('analysis.processing')}</span>
                                    </div>
                                </div>
                                <Sparkles size={20} className="text-amber-400 group-hover:rotate-12 transition-transform relative z-10" />
                                <div className="absolute inset-0 bg-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </motion.button>

                            {report && (
                                <div className="bg-white/60 dark:bg-slate-900/60 rounded-3xl p-5 border border-white/40 dark:border-white/10 backdrop-blur-xl shadow-xl mb-6">
                                    <h3 className="font-black text-slate-400 uppercase text-[9px] tracking-widest mb-4">{t('matchOver.rotationReport.title')}</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {report.incomingTeam.players.map(p => (
                                            <div key={p.id} className="text-[10px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-white/5 px-3 py-1.5 rounded-lg">
                                                {p.number && <span className="opacity-50 mr-1">#{p.number}</span>} {p.name}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* AÇÕES PRINCIPAIS */}
                            <div className="flex flex-col gap-3 mt-auto pt-4 pb-8">
                                <Button onClick={onRotate} disabled={!canInteract || isSpectator} size="lg" className="w-full shadow-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black h-16 rounded-2xl uppercase tracking-widest" title={isSpectator ? 'Only host can start next game' : ''}>
                                    {t('matchOver.nextGameButton')}
                                </Button>
                                
                                <div className="grid grid-cols-2 gap-2">
                                    <Button onClick={() => handleShareAction('share')} disabled={isSharing || !canInteract} variant="secondary" className="bg-white/80 dark:bg-white/10 text-indigo-600 dark:text-indigo-400 rounded-2xl font-bold h-14">
                                        {isSharing ? <Loader2 size={18} className="animate-spin" /> : <Share2 size={18} />} <span className="ml-2">{t('matchOver.share')}</span>
                                    </Button>
                                    <Button onClick={() => handleShareAction('download')} disabled={isSharing || !canInteract} variant="secondary" className="bg-white/80 dark:bg-white/10 text-slate-500 dark:text-slate-400 rounded-2xl h-14">
                                        <Download size={20} />
                                    </Button>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <Button onClick={onUndo} disabled={!canInteract || isSpectator} variant="ghost" className="bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 rounded-2xl h-12 text-[10px] font-black uppercase tracking-widest" title={isSpectator ? 'Only host can undo' : ''}>
                                        <Undo2 size={16} className="mr-2" /> {t('controls.undo')}
                                    </Button>
                                    <Button onClick={onReset} disabled={!canInteract || isSpectator} variant="ghost" className="bg-rose-500/10 text-rose-500 rounded-2xl h-12 text-[10px] font-black uppercase tracking-widest border border-rose-500/10" title={isSpectator ? 'Only host can reset' : ''}>
                                        <RotateCcw size={16} className="mr-2" /> {t('controls.reset')}
                                    </Button>
                                </div>
                            </div>
                        </div>
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
                            <Button onClick={() => setView('summary')} className="w-full bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-white rounded-2xl h-14 font-black uppercase text-xs tracking-widest">
                                {t('common.back')}
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
      </Modal>
    </>
  );
};
