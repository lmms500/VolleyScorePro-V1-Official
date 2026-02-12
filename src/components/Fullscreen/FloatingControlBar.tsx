

import React, { useEffect, useState, memo, useCallback } from 'react';
import { Undo2, ArrowLeftRight, RotateCcw, Menu, ChevronDown, ChevronUp, Mic, MicOff, Grid } from 'lucide-react';
import { useTranslation } from '../../contexts/LanguageContext';
import { useLayoutManager } from '../../contexts/LayoutContext';
import { useElementSize } from '../../hooks/useElementSize';
import { motion, AnimatePresence } from 'framer-motion';
import { springSnappy } from '../../utils/animations';
import { IconButton } from '../ui/IconButton';

interface FloatingControlBarProps {
  onUndo: () => void;
  canUndo: boolean;
  onSwap: () => void;
  onReset: () => void;
  onMenu: () => void;
  onCourt: () => void; // New Prop
  voiceEnabled: boolean;
  isListening: boolean;
  onToggleListening: () => void;
}

export const FloatingControlBar: React.FC<FloatingControlBarProps> = memo(({
  onUndo, canUndo, onSwap, onReset, onMenu, onCourt, voiceEnabled, isListening, onToggleListening
}) => {
  const { t } = useTranslation();
  const [isMinimized, setIsMinimized] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const { scale, registerElement } = useLayoutManager();

  const handleInteraction = useCallback(() => {
    setIsMinimized(false);
    // Force a re-render of the effect by briefly setting isHovering to true then back
    // This is a bit hacky, better approach below
  }, []);

  const handleMinimize = useCallback(() => setIsMinimized(prev => !prev), []);
  const handleUndo = useCallback(() => { onUndo(); setIsHovering(false); }, [onUndo]);
  const handleSwap = useCallback(() => { onSwap(); setIsHovering(false); }, [onSwap]);
  const handleReset = useCallback(() => { onReset(); setIsHovering(false); }, [onReset]);
  const handleMenu = useCallback(() => { onMenu(); setIsHovering(false); }, [onMenu]);
  const handleCourt = useCallback(() => { onCourt(); setIsHovering(false); }, [onCourt]);
  const handleToggleListening = useCallback(() => { onToggleListening(); setIsHovering(false); }, [onToggleListening]);
  const { ref, width, height } = useElementSize<HTMLDivElement>();

  // Reset timer on any click
  const handleUserActivity = useCallback(() => {
    setIsMinimized(false);
    // We need to clear and restart the timer. The effect depends on isMinimized/isHovering.
    // We can introduce a 'lastActivity' state to trigger effect re-run
    setLastActivity(Date.now());
  }, []);

  const [lastActivity, setLastActivity] = useState(Date.now());

  useEffect(() => {
    registerElement('controls', width, height);
  }, [width, height, registerElement]);

  useEffect(() => {
    if (isMinimized || isHovering) return;
    const timer = setTimeout(() => setIsMinimized(true), 4000);
    return () => clearTimeout(timer);
  }, [isMinimized, isHovering, lastActivity]);

  const glassContainer = "bg-white/90 dark:bg-slate-900/80 backdrop-blur-2xl border border-white/20 dark:border-white/10 shadow-2xl shadow-black/20 dark:shadow-black/40 ring-1 ring-black/5 dark:ring-white/10";
  // const buttonBase = "rounded-full transition-all duration-300 active:scale-90 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-transparent hover:bg-black/5 dark:hover:bg-white/10";
  // const pClass = 'p-3';
  const iconSize = 20;

  return (
    <div
      ref={ref}
      style={{ transform: `translateX(-50%) scale(${scale})` }}
      className="fixed bottom-[calc(env(safe-area-inset-bottom)+1.5rem)] left-1/2 z-50 origin-bottom flex flex-col items-center"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <AnimatePresence mode="wait" initial={false}>
        {!isMinimized ? (
          <motion.div
            key="expanded"
            initial={{ y: 40, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.9 }}
            transition={springSnappy}
            className={`flex items-center gap-2 p-1.5 rounded-2xl ${glassContainer}`}
          >
            <IconButton
              icon={<Undo2 size={iconSize} strokeWidth={1.5} />}
              onClick={() => { handleUndo(); handleUserActivity(); }}
              disabled={!canUndo}
              variant="ghost"
              size="lg"
              aria-label={t('controls.undo')}
              title={t('controls.undo')}
            />

            <IconButton
              icon={<ArrowLeftRight size={iconSize} strokeWidth={1.5} />}
              onClick={() => { handleSwap(); handleUserActivity(); }}
              variant="ghost"
              size="lg"
              aria-label={t('controls.swap')}
              title={t('controls.swap')}
            />

            {voiceEnabled && (
              <IconButton
                icon={isListening ? <Mic size={iconSize} strokeWidth={1.5} /> : <MicOff size={iconSize} strokeWidth={1.5} />}
                onClick={() => { handleToggleListening(); handleUserActivity(); }}
                variant={isListening ? "filled" : "ghost"}
                size="lg"
                isActive={isListening}
                activeClassName="bg-rose-500 dark:bg-rose-600 text-white shadow-lg shadow-rose-500/30 animate-pulse hover:bg-rose-600"
                aria-label="Voice Control"
                title="Voice Control"
              />
            )}

            <div className="w-px h-5 bg-black/10 dark:bg-white/10 mx-0.5"></div>

            <IconButton
              icon={<Grid size={iconSize} strokeWidth={1.5} />}
              onClick={() => { handleCourt(); handleUserActivity(); }}
              variant="success"
              size="lg"
              aria-label={t('court.title') || 'Court'}
              title={t('court.title') || 'Court'}
            />

            <IconButton
              icon={<RotateCcw size={iconSize} strokeWidth={1.5} />}
              onClick={() => { handleReset(); handleUserActivity(); }}
              variant="danger"
              size="lg"
              aria-label={t('controls.reset')}
              title={t('controls.reset')}
            />

            <IconButton
              icon={<Menu size={iconSize} strokeWidth={1.5} />}
              onClick={() => { handleMenu(); handleUserActivity(); }}
              variant="filled"
              size="lg"
              aria-label={t('game.menu')}
              title={t('game.menu')}
            />

            <div className="w-px h-5 bg-black/10 dark:bg-white/10 mx-0.5"></div>

            <IconButton
              icon={<ChevronDown size={18} />}
              onClick={() => { setIsMinimized(true); }}
              variant="ghost"
              size="md"
              aria-label="Minimize"
              title="Minimize"
            />

          </motion.div>
        ) : (
          <motion.button
            key="collapsed"
            onClick={() => setIsMinimized(false)}
            initial={{ y: 40, opacity: 0, scale: 0.5 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.5 }}
            transition={springSnappy}
            className={`
               h-10 px-6 rounded-full flex items-center justify-center gap-2
               ${glassContainer} hover:bg-white dark:hover:bg-black transition-colors
               text-slate-400 hover:text-indigo-500 group
            `}
          >
            <div className="w-8 h-1 rounded-full bg-slate-300 dark:bg-white/20 group-hover:bg-indigo-400 transition-colors"></div>
            <ChevronUp size={16} className="absolute -top-6 opacity-0 group-hover:opacity-100 group-hover:-top-3 transition-all duration-300" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
});