
import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { GameState, TeamId } from '../../types';
import { Trophy, RefreshCw, UserPlus, Undo2, Share2, Loader2, Download, RotateCcw, ChevronUp, ChevronDown, X, Hash } from 'lucide-react';
import { useTranslation } from '../../contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ResultCard } from '../Share/ResultCard';
import { useSocialShare } from '../../hooks/useSocialShare';
import { resolveTheme } from '../../utils/colors';
import { Confetti } from '../ui/Confetti';
import { useHaptics } from '../../hooks/useHaptics';

interface MatchOverModalProps {
  isOpen: boolean;
  state: GameState;
  onRotate: () => void;
  onReset: () => void;
  onUndo: () => void;
}

export const MatchOverModal: React.FC<MatchOverModalProps> = ({ isOpen, state, onRotate, onReset, onUndo }) => {
  const { t } = useTranslation();
  const [showLogs, setShowLogs] = useState(false);
  const [renderShareCard, setRenderShareCard] = useState(false);
  const [canInteract, setCanInteract] = useState(false); 
  const { isSharing, shareMatch, downloadMatch } = useSocialShare();
  const haptics = useHaptics();

  const winnerName = state.matchWinner === 'A' ? state.teamAName : state.teamBName;
  const isA = state.matchWinner === 'A';
  const report = state.rotationReport;

  const colorA = state.teamARoster.color || 'indigo';
  const colorB = state.teamBRoster.color || 'rose';
  
  const winnerColorKey = isA ? colorA : colorB;
  const winnerTheme = resolveTheme(winnerColorKey);
  
  const getBgColor = (c: string) => {
      if (c.startsWith('#')) return `bg-[${c}]`;
      const mapping: any = {
        indigo: 'bg-indigo-500', rose: 'bg-rose-500', emerald: 'bg-emerald-500', amber: 'bg-amber-500', 
        sky: 'bg-sky-500', violet: 'bg-violet-500', slate: 'bg-slate-500', fuchsia: 'bg-fuchsia-500'
      };
      return mapping[c] || 'bg-indigo-500';
  };
  const winnerBgColor = getBgColor(winnerColorKey);

  const stolenIds = new Set(report?.stolenPlayers.map(p => p.id) || []);
  const coreSquad = report?.incomingTeam.players.filter(p => !stolenIds.has(p.id)) || [];
  const reinforcements = report?.stolenPlayers || [];
  const logs = report?.logs || [];

  useEffect(() => {
    if (isOpen) {
        setCanInteract(false);
        const timer = setTimeout(() => setCanInteract(true), 1200); 
        return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const mvpData = useMemo(() => {
     if (!state.matchLog || state.matchLog.length === 0) return null;
     return null; 
  }, [state.matchLog]);

  const handleShareAction = (action: 'share' | 'download') => {
      setRenderShareCard(true);
      haptics.impact('light');
      setTimeout(() => {
          if (action === 'share') shareMatch();
          else downloadMatch();
      }, 500);
  };

  const getOriginTeamName = (playerId: string) => {
      // Check active rosters first (one of them is likely the loser source)
      if (state.teamARoster.players.some(p => p.id === playerId)) return state.teamARoster.name;
      if (state.teamBRoster.players.some(p => p.id === playerId)) return state.teamBRoster.name;
      
      // Check reserves
      if (state.teamARoster.reserves?.some(p => p.id === playerId)) return state.teamARoster.name;
      if (state.teamBRoster.reserves?.some(p => p.id === playerId)) return state.teamBRoster.name;

      // Check queue
      for (const t of state.queue) {
          if (t.players.some(p => p.id === playerId) || t.reserves?.some(p => p.id === playerId)) return t.name;
      }
      return null;
  };

  if (!isOpen && renderShareCard) {
      setRenderShareCard(false);
  }

  // --- IMMERSIVE LAYOUT ---
  return (
    <>
      {renderShareCard && createPortal(
          <ResultCard 
             teamAName={state.teamAName}
             teamBName={state.teamBName}
             setsA={state.setsA}
             setsB={state.setsB}
             winner={state.matchWinner}
             setsHistory={state.history}
             durationSeconds={state.matchDurationSeconds}
             date={new Date().toLocaleDateString()}
             mvp={mvpData}
             colorA={colorA}
             colorB={colorB}
          />,
          document.body
      )}

      <Modal 
        isOpen={isOpen} 
        onClose={() => {}} 
        title=""
        showCloseButton={false}
        persistent={true}
        variant="immersive"
      >
        {/* Full Screen Background Gradient - Lighter/Brighter */}
        <div className={`absolute inset-0 bg-gradient-to-b ${winnerTheme.gradient.replace('/15', '/20')} to-slate-50 dark:to-[#0f172a] pointer-events-none z-0 glass-hardware-accelerated`} />
        
        {/* Confetti - Ambient Mode (No Collision, Leaf-like physics) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-60">
            <Confetti colors={[winnerColorKey, winnerColorKey]} intensity="high" physicsVariant="ambient" />
        </div>

        {/* Content Container (Safe Area Aware) */}
        {/* Increased base padding to ensure nothing touches edges roughly */}
        <div className="relative z-10 flex flex-col h-full w-full pt-safe-top pb-safe-bottom glass-hardware-accelerated">
            
            {/* Minimal Safe-Exit Button (Top Right) */}
            <div className="absolute top-safe-top right-4 z-50 mt-4">
                <button 
                    onClick={onRotate} // Usually 'Next Game' logic, but acts as close here if needed
                    className="p-2 rounded-full bg-white/20 dark:bg-black/20 hover:bg-white/40 dark:hover:bg-black/40 text-slate-600 dark:text-slate-300 transition-colors backdrop-blur-md border border-white/20"
                >
                    <X size={20} />
                </button>
            </div>

            {/* MAIN GRID LAYOUT - FIXED FOR PORTRAIT SPLIT */}
            <div className="flex-1 grid grid-rows-[minmax(0,40%)_minmax(0,60%)] landscape:grid-rows-none landscape:grid-cols-2 landscape:gap-8 h-full overflow-hidden">
                
                {/* 1. HERO SECTION (Winner & Score) - Scrolls in Portrait, Fixed in Landscape */}
                <div className="flex flex-col items-center justify-center text-center space-y-6 p-6 overflow-y-auto landscape:overflow-visible landscape:h-full">
                    <div className="relative group">
                        {/* Glow behind trophy */}
                        <div className={`absolute inset-0 blur-[80px] rounded-full opacity-40 ${winnerBgColor}`}></div>
                        
                        <div className="relative flex flex-col items-center z-20">
                            <motion.div
                                initial={{ scale: 0, rotate: -20, y: 50 }}
                                animate={{ scale: 1, rotate: 0, y: 0 }}
                                transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
                            >
                                <Trophy size={96} className={`${winnerTheme.text} ${winnerTheme.textDark} drop-shadow-2xl`} strokeWidth={1.5} />
                            </motion.div>
                            
                            <motion.h2 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white mt-6 uppercase tracking-tighter drop-shadow-sm leading-none"
                            >
                                {winnerName}
                            </motion.h2>
                            
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.8 }}
                                transition={{ delay: 0.6 }}
                                className="flex items-center gap-3 mt-3"
                            >
                                <div className="h-px w-10 bg-slate-400 dark:bg-slate-500"></div>
                                <span className="text-[10px] font-black tracking-[0.3em] text-slate-500 dark:text-slate-400 uppercase">{t('matchOver.wins')}</span>
                                <div className="h-px w-10 bg-slate-400 dark:bg-slate-500"></div>
                            </motion.div>
                        </div>
                    </div>

                    {/* Final Score - Floating */}
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.5, type: 'spring' }}
                        className="flex items-center gap-8 text-6xl font-black font-inter z-20 mt-4"
                    >
                        <span className={isA ? `${winnerTheme.text} ${winnerTheme.textDark} drop-shadow-lg` : 'text-slate-300 dark:text-slate-600 opacity-50'}>{state.setsA}</span>
                        <div className="h-12 w-[4px] bg-slate-200 dark:bg-white/10 rounded-full rotate-12"></div>
                        <span className={!isA ? `${winnerTheme.text} ${winnerTheme.textDark} drop-shadow-lg` : 'text-slate-300 dark:text-slate-600 opacity-50'}>{state.setsB}</span>
                    </motion.div>
                </div>

                {/* 2. ROTATION & ACTIONS SECTION */}
                <div className="flex flex-col h-full w-full max-w-md mx-auto landscape:max-w-none landscape:pr-8 landscape:pb-8 p-6 pt-0 landscape:pt-8 portrait:overflow-hidden landscape:overflow-y-auto landscape:scroll-smooth">
                    
                    {/* ROTATION REPORT */}
                    {/* Portrait: Scroll internally. Landscape: Part of main flow. */}
                    <div 
                        className="portrait:flex-1 portrait:overflow-y-auto custom-scrollbar portrait:min-h-0 landscape:flex-none landscape:overflow-visible pb-4"
                        style={{
                            // Mask only needed in portrait where it scrolls internally
                            maskImage: 'linear-gradient(to bottom, transparent 0%, black 15px, black calc(100% - 15px), transparent 100%)',
                            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 15px, black calc(100% - 15px), transparent 100%)'
                        }}
                    >
                        {report && (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.7 }}
                                className="w-full bg-white/60 dark:bg-slate-900/60 rounded-3xl p-5 text-left border border-white/40 dark:border-white/10 space-y-4 backdrop-blur-xl shadow-xl z-20"
                            >
                                <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-500">
                                            <RefreshCw size={16} />
                                        </div>
                                        <div className="flex flex-col">
                                            <h3 className="font-black text-slate-400 dark:text-slate-500 uppercase text-[9px] tracking-widest">{t('matchOver.rotationReport.title')}</h3>
                                            <span className="text-sm text-slate-800 dark:text-white font-bold">{t('matchOver.rotationReport.entering', { teamName: '' })} <span className="text-indigo-600 dark:text-indigo-400">{report.incomingTeam.name}</span></span>
                                        </div>
                                    </div>
                                    <div className="px-2.5 py-1 bg-slate-100 dark:bg-white/10 rounded-lg text-[10px] font-bold text-slate-500">
                                        {coreSquad.length + reinforcements.length} Players
                                    </div>
                                </div>
                                
                                <div className="space-y-3">
                                    {/* Core Squad */}
                                    {coreSquad.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {coreSquad.map(p => (
                                                <div key={p.id} className="text-[10px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-white/5 px-3 py-1.5 rounded-lg border border-transparent flex items-center gap-1.5">
                                                    {p.number && <span className="font-mono text-slate-400 dark:text-slate-500 font-normal border-r border-black/5 dark:border-white/5 pr-1.5 mr-0.5">#{p.number}</span>}
                                                    {p.name}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Reinforcements (Highlights) */}
                                    {reinforcements.length > 0 && (
                                        <div className="relative pl-3 border-l-2 border-amber-500/30">
                                            <span className="text-[9px] font-bold text-amber-500 uppercase tracking-wider block mb-2">{t('matchOver.rotationReport.reinforcements')}</span>
                                            <div className="flex flex-wrap gap-2">
                                                {reinforcements.map(p => {
                                                    const origin = getOriginTeamName(p.id);
                                                    return (
                                                        <div key={p.id} className="flex flex-col bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20 shadow-sm min-w-[80px]">
                                                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-700 dark:text-amber-300">
                                                                <UserPlus size={10} strokeWidth={3} className="opacity-70" /> 
                                                                {p.number && <span className="font-mono opacity-80">#{p.number}</span>}
                                                                <span className="truncate">{p.name}</span>
                                                            </div>
                                                            {origin && (
                                                                <span className="text-[8px] font-medium text-amber-600/60 dark:text-amber-400/60 uppercase tracking-tight ml-4">
                                                                    from {origin}
                                                                </span>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Logs Toggle (Compact) */}
                                {logs.length > 0 && (
                                    <div className="pt-1">
                                        <button 
                                            onClick={() => setShowLogs(!showLogs)} 
                                            className="w-full flex items-center justify-center gap-2 py-1 text-[9px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                                        >
                                            {t('matchOver.debugLogs')} {showLogs ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                                        </button>
                                        <AnimatePresence>
                                            {showLogs && (
                                                <motion.div 
                                                    initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="mt-2 bg-slate-950/50 text-slate-400 p-2 rounded-lg font-mono text-[8px] leading-relaxed max-h-24 overflow-y-auto custom-scrollbar border border-white/5">
                                                        {logs.map((log, idx) => <div key={idx} className="mb-0.5">{log}</div>)}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </div>

                    {/* ACTION BUTTONS FOOTER */}
                    {/* Adjusted padding to prevent cut-off in portrait mode */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0, pointerEvents: canInteract ? 'auto' : 'none' }}
                        transition={{ delay: 0.9 }}
                        className={`flex flex-col gap-3 shrink-0 portrait:mt-auto landscape:mt-6 pt-4 portrait:pb-6 landscape:pb-10 ${!canInteract ? 'opacity-50 grayscale' : ''}`}
                    >
                        <Button 
                            onClick={onRotate} 
                            disabled={!canInteract} 
                            size="lg" 
                            className="w-full shadow-2xl shadow-emerald-500/40 bg-emerald-600 hover:bg-emerald-500 border-t border-white/20 text-white font-black tracking-widest text-sm h-16 rounded-2xl"
                        >
                            <RefreshCw size={20} className="mr-2" strokeWidth={2.5} />
                            {t('matchOver.nextGameButton')}
                        </Button>

                        <div className="flex gap-2 h-14">
                            <Button 
                                onClick={() => handleShareAction('share')} 
                                disabled={isSharing || !canInteract}
                                variant="secondary"
                                className="flex-1 bg-white/80 dark:bg-white/10 text-indigo-600 dark:text-indigo-300 border-indigo-200 dark:border-white/10 hover:bg-indigo-50 dark:hover:bg-white/20 backdrop-blur-md rounded-2xl"
                            >
                                {isSharing ? <Loader2 size={18} className="animate-spin" /> : <Share2 size={18} />}
                                <span className="ml-2 text-xs font-bold">{t('matchOver.share')}</span>
                            </Button>

                            <Button 
                                onClick={() => handleShareAction('download')} 
                                disabled={isSharing || !canInteract}
                                variant="secondary"
                                className="aspect-square p-0 flex items-center justify-center bg-white/80 dark:bg-white/10 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/10 backdrop-blur-md rounded-2xl"
                            >
                                <Download size={20} />
                            </Button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 pt-2">
                            {/* High Contrast Undo/Reset Buttons */}
                            <button 
                                onClick={onUndo} 
                                disabled={!canInteract} 
                                className="flex items-center justify-center gap-2 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 bg-white/80 dark:bg-white/10 hover:bg-white dark:hover:bg-white/20 transition-all border border-slate-200 dark:border-white/5 shadow-sm active:scale-95 backdrop-blur-sm"
                            >
                                <Undo2 size={16} strokeWidth={2} /> {t('controls.undo')}
                            </button>
                            <button 
                                onClick={onReset} 
                                disabled={!canInteract} 
                                className="flex items-center justify-center gap-2 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 bg-white/80 dark:bg-white/10 hover:bg-rose-50 dark:hover:bg-rose-500/20 transition-all border border-rose-200 dark:border-rose-500/20 shadow-sm active:scale-95 backdrop-blur-sm"
                            >
                                <RotateCcw size={16} strokeWidth={2} /> {t('controls.reset')}
                            </button>
                        </div>
                    </motion.div>
                </div>

            </div>
        </div>
      </Modal>
    </>
  );
};
