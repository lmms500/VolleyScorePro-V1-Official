
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from '../../contexts/LanguageContext';
import { useRoster, useActions } from '../../contexts/GameContext';
import { useRosterStore } from '../../stores/rosterStore';
import { useNotification } from '../../contexts/NotificationContext';
import { useHaptics } from '../../hooks/useHaptics';
import { motion, AnimatePresence } from 'framer-motion';
import { staggerContainer, staggerItem } from '../../utils/animations';
import { RosterColumn } from './RosterColumn';
import { Layers, Search, X, List, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useDndMonitor } from '@dnd-kit/core';
import { Team } from '../../types';
import { createTeam } from '../../utils/rosterLogic';

interface RosterBoardProps {
  courtLimit: number;
  benchLimit: number;
}

const SCROLL_EVENT = 'team-manager-scroll';
const dispatchScrollEvent = () => { if (typeof window !== 'undefined') window.dispatchEvent(new Event(SCROLL_EVENT)); };

export const RosterBoard: React.FC<RosterBoardProps> = ({ courtLimit, benchLimit }) => {
  const { t } = useTranslation();
  const { teamARoster: courtA, teamBRoster: courtB, queue } = useRoster();
  const { reorderQueue, disbandTeam, restoreTeam } = useActions();
  const { showNotification } = useNotification();
  const haptics = useHaptics();

  const dragOverContainerId = useRosterStore(s => s.dragOverContainerId);

  const [queueSearchTerm, setQueueSearchTerm] = useState('');
  const queueScrollRef = useRef<HTMLDivElement>(null);
  const [highlightedTeamId, setHighlightedTeamId] = useState<string | null>(null);
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const autoScrollDirection = useRef<'left' | 'right' | null>(null);
  const [queuePage, setQueuePage] = useState(1);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const lastMovedTeamId = useRef<string | null>(null);
  const prevQueueLen = useRef(queue.length);
  const pendingScrollToIndex = useRef<number | null>(null);
  const skipJiggle = useRef(false); // Flag to skip jiggle when intentionally scrolling

  const handleReorderLocal = useCallback((from: number, to: number) => {
    const team = queue[from];
    if (team) { lastMovedTeamId.current = team.id; }
    reorderQueue(from, to);
    pendingScrollToIndex.current = to;
  }, [reorderQueue, queue]);

  const wrappedDisband = useCallback((id: string) => {
    const team = queue.find(t => t.id === id);
    haptics.impact('medium');
    disbandTeam(id);
    if (team) {
      showNotification({ mainText: t('teamManager.playerRemoved'), type: 'info', subText: team.name });
    }
  }, [disbandTeam, queue, t, haptics, showNotification]);

  useEffect(() => {
    if (!queueSearchTerm.trim()) { setHighlightedTeamId(null); return; }
    const searchTerm = queueSearchTerm.toLowerCase();
    const matchIndex = queue.findIndex((t: Team) => t.name.toLowerCase().includes(searchTerm));
    if (matchIndex !== -1) {
      const teamId = queue[matchIndex].id;
      setHighlightedTeamId(teamId);
      if (queueScrollRef.current) {
        const cardWidth = queueScrollRef.current.firstElementChild?.clientWidth || 300;
        const scrollPos = matchIndex * (cardWidth + 16);
        queueScrollRef.current.scrollTo({ left: scrollPos, behavior: 'smooth' });
      }
    } else { setHighlightedTeamId(null); }
  }, [queueSearchTerm, queue]);

  const checkScroll = useCallback(() => {
    if (!queueScrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = queueScrollRef.current;
    setCanScrollLeft(scrollLeft > 20);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 20);
    const width = clientWidth;
    const estimatedCardWidth = 320;
    if (width > 0) {
      const page = Math.round(scrollLeft / estimatedCardWidth) + 1;
      setQueuePage(page);
    }
    dispatchScrollEvent();
  }, []);

  const onQueueScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => { checkScroll(); }, [checkScroll]);

  useEffect(() => {
    checkScroll();
    // Skip jiggle animation if we just added a team (skipJiggle is true)
    if (skipJiggle.current) {
      skipJiggle.current = false;
      return;
    }
    if (queue.length > 1 && queueScrollRef.current) {
      setTimeout(() => {
        if (queueScrollRef.current) {
          queueScrollRef.current.scrollTo({ left: 60, behavior: 'smooth' });
          setTimeout(() => { if (queueScrollRef.current) { queueScrollRef.current.scrollTo({ left: 0, behavior: 'smooth' }); } }, 400);
        }
      }, 600);
    }
  }, [queue.length, checkScroll]);

  const scrollContainer = (direction: 'left' | 'right') => {
    if (queueScrollRef.current) {
      const width = 320;
      const scrollAmount = direction === 'left' ? -width : width;
      queueScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  useDndMonitor({
    onDragStart: () => setIsAutoScrolling(true),
    onDragEnd: () => { setIsAutoScrolling(false); autoScrollDirection.current = null; },
    onDragCancel: () => { setIsAutoScrolling(false); autoScrollDirection.current = null; }
  });

  useEffect(() => {
    if (!isAutoScrolling) return;
    const handleMouseMove = (e: MouseEvent | TouchEvent) => {
      if (!queueScrollRef.current) return;
      const rect = queueScrollRef.current.getBoundingClientRect();
      const x = (e as MouseEvent).clientX || (e as TouchEvent).touches?.[0]?.clientX || 0;
      const EDGE_SIZE = 50;
      const y = (e as MouseEvent).clientY || (e as TouchEvent).touches?.[0]?.clientY || 0;
      if (y < rect.top || y > rect.bottom) { autoScrollDirection.current = null; return; }
      if (x < rect.left + EDGE_SIZE) { autoScrollDirection.current = 'left'; }
      else if (x > rect.right - EDGE_SIZE) { autoScrollDirection.current = 'right'; }
      else { autoScrollDirection.current = null; }
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleMouseMove);
    const interval = setInterval(() => {
      if (autoScrollDirection.current && queueScrollRef.current) {
        const scrollAmount = 10;
        queueScrollRef.current.scrollBy({ left: autoScrollDirection.current === 'left' ? -scrollAmount : scrollAmount, behavior: 'auto' });
      }
    }, 16);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleMouseMove);
      clearInterval(interval);
    };
  }, [isAutoScrolling]);

  useEffect(() => {
    if (lastMovedTeamId.current) {
      const el = document.getElementById(`queue-card-${lastMovedTeamId.current}`);
      if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' }); lastMovedTeamId.current = null; pendingScrollToIndex.current = null; }
    }
    if (pendingScrollToIndex.current !== null && queueScrollRef.current && !lastMovedTeamId.current) {
      const targetIndex = pendingScrollToIndex.current;
      const width = 384;
      requestAnimationFrame(() => {
        queueScrollRef.current?.scrollTo({ left: targetIndex * width, behavior: 'smooth' });
        setQueuePage(targetIndex + 1);
        pendingScrollToIndex.current = null;
      });
    } else if (queue.length > prevQueueLen.current) {
      requestAnimationFrame(() => {
        setTimeout(() => { if (queueScrollRef.current) { const scrollLeft = queueScrollRef.current.scrollWidth - queueScrollRef.current.clientWidth; queueScrollRef.current.scrollTo({ left: scrollLeft > 0 ? scrollLeft : 0, behavior: 'smooth' }); checkScroll(); } }, 150);
      });
    }
    prevQueueLen.current = queue.length;
  }, [queue.length, queue, checkScroll]);

  const usedColors = useMemo(() => {
    const set = new Set<string>();
    if (courtA.color) set.add(courtA.color);
    if (courtB.color) set.add(courtB.color);
    queue.forEach(t => { if (t.color) set.add(t.color); });
    return set;
  }, [courtA.color, courtB.color, queue]);

  const RENDER_WINDOW = 3;

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="flex flex-col gap-6 landscape:gap-4 pb-24 landscape:pb-8 px-0 w-full pt-2">
      <div className="flex flex-col gap-6 md:gap-4 w-full landscape:grid landscape:grid-cols-2 landscape:gap-4 landscape:overflow-visible flex-shrink-0">
        <motion.div variants={staggerItem} className="w-full flex-1">
          <RosterColumn id={courtA.id} team={courtA} usedColors={usedColors} isDragOver={dragOverContainerId === courtA.id || dragOverContainerId === `${courtA.id}_Reserves`} maxPlayers={courtLimit} maxBench={benchLimit} />
        </motion.div>
        <motion.div variants={staggerItem} className="w-full flex-1">
          <RosterColumn id={courtB.id} team={courtB} usedColors={usedColors} isDragOver={dragOverContainerId === courtB.id || dragOverContainerId === `${courtB.id}_Reserves`} maxPlayers={courtLimit} maxBench={benchLimit} />
        </motion.div>
      </div>

      <motion.div variants={staggerItem} className={`w-full flex flex-col mt-4 relative ${queue.length === 0 ? 'min-h-[200px]' : ''}`}>
        <div className="flex items-center justify-between px-2 mb-3">
          <div className="flex items-center gap-2">
            <div className="px-3 py-1 bg-slate-200 dark:bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 flex items-center gap-2"><Layers size={12} /><span>{t('teamManager.queue')}</span><span className="bg-white dark:bg-black/20 px-1.5 rounded text-slate-600 dark:text-slate-300">{queue.length}</span></div>
            {queue.length > 1 && (<div className="px-3 py-1 rounded-full bg-transparent text-[9px] font-bold text-slate-400 border border-slate-200 dark:border-white/10">{t('common.step', { number: `${queuePage} / ${queue.length}` })}</div>)}
            <button
              onClick={() => {
                const newTeam = createTeam(`Team ${queue.length + 3}`, [], 'slate');
                skipJiggle.current = true; // Prevent bounce-back after adding
                restoreTeam(newTeam, queue.length);
                haptics.impact('light');
                showNotification({ mainText: t('teamManager.teamAdded') || 'Team Added', type: 'info' });
                // Scroll to the new team after a short delay to allow render
                setTimeout(() => {
                  if (queueScrollRef.current) {
                    const cardWidth = queueScrollRef.current.firstElementChild?.clientWidth || 320;
                    const newIndex = queue.length; // The new team will be at this index
                    const scrollPos = newIndex * (cardWidth + 24); // 24 = gap-6
                    queueScrollRef.current.scrollTo({ left: scrollPos, behavior: 'smooth' });
                  }
                }, 150);
              }}
              className="px-3 py-1.5 rounded-full bg-indigo-500 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-indigo-500/20 hover:bg-indigo-600 active:scale-95 transition-all"
            >
              <Plus size={12} strokeWidth={3} /> {t('teamManager.newTeam') || 'Novo Time'}
            </button>
          </div>
          <div className="relative group w-32"><Search className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" size={14} /><input value={queueSearchTerm} onChange={(e) => setQueueSearchTerm(e.target.value)} placeholder={t('teamManager.searchQueue')} className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-xl pl-8 pr-6 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-slate-400" />{queueSearchTerm && (<button onClick={() => setQueueSearchTerm('')} className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 active:scale-90 transition-transform"><X size={12} strokeWidth={3} /></button>)}</div>
        </div>

        <div className="relative group/queue flex-1 min-h-0">
          <div ref={queueScrollRef} onScroll={onQueueScroll} className="w-full overflow-x-auto snap-x snap-mandatory no-scrollbar flex items-stretch pb-2 gap-6 p-6 mask-linear-fade-sides" style={{ maskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)' }}>
            {queue.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center h-full text-slate-400 italic gap-3 min-h-[160px] w-full border border-dashed border-slate-200 dark:border-white/10 rounded-2xl bg-slate-50/50 dark:bg-white/[0.01]"><div className="p-3 bg-slate-100 dark:bg-white/5 rounded-full"><List size={24} className="opacity-30" /></div><div className="flex flex-col items-center gap-1"><span className="text-xs font-bold uppercase tracking-widest">{t('teamManager.queueEmpty')}</span><span className="text-[10px] opacity-40">Add teams to rotation</span></div></div>
            ) : (
              <AnimatePresence initial={false} mode="popLayout">
                {queue.map((team: Team, idx: number) => {
                  const isVisible = idx >= (queuePage - 1 - RENDER_WINDOW) && idx <= (queuePage - 1 + RENDER_WINDOW);
                  if (!isVisible) return <div key={team.id} className="snap-center w-[calc(100vw-3rem)] sm:w-96 landscape:w-[calc(50vw-2rem)] flex-shrink-0 h-full" />;

                  return (
                    <motion.div id={`queue-card-${team.id}`} key={team.id} layout="position" layoutId={`queue-card-${team.id}`} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }} transition={{ type: "spring", stiffness: 60, damping: 15, mass: 1 }} className="snap-center w-[calc(100vw-3rem)] sm:w-96 landscape:w-[calc(50vw-2rem)] flex-shrink-0 h-full flex flex-col">
                      <RosterColumn id={team.id} team={team} usedColors={usedColors} isQueue={true} isNext={idx === 0} onDisband={wrappedDisband} onReorder={handleReorderLocal} queueIndex={idx} queueSize={queue.length} isDragOver={dragOverContainerId === team.id || dragOverContainerId === `${team.id}_Reserves`} highlighted={highlightedTeamId === team.id} maxPlayers={courtLimit} maxBench={benchLimit} />
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>
          <AnimatePresence>{canScrollLeft && (<motion.button initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} onClick={() => scrollContainer('left')} className="absolute left-2 top-1/2 -translate-y-1/2 z-40 w-9 h-9 flex items-center justify-center rounded-full bg-black/20 dark:bg-white/10 backdrop-blur-md shadow-lg border border-white/10 text-white hover:bg-black/40 dark:hover:bg-white/20 hover:scale-110 transition-transform active:scale-90"><ChevronLeft size={18} strokeWidth={2.5} /></motion.button>)}{canScrollRight && (<motion.button initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} onClick={() => scrollContainer('right')} className="absolute right-2 top-1/2 -translate-y-1/2 z-40 w-9 h-9 flex items-center justify-center rounded-full bg-black/20 dark:bg-white/10 backdrop-blur-md shadow-lg border border-white/10 text-white hover:bg-black/40 dark:hover:bg-white/20 hover:scale-110 transition-transform active:scale-90"><ChevronRight size={18} strokeWidth={2.5} /></motion.button>)}</AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};
