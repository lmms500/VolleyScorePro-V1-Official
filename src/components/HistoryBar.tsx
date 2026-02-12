
import React, { memo, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { SetHistory, TeamColor } from '../types';
import { Clock, PartyPopper } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { listItemVariants } from '../utils/animations';
import { resolveTheme } from '../utils/colors';
import { useTimerValue } from '../contexts/TimerContext';
import { useHaptics } from '../hooks/useHaptics';
import { useGameAudio } from '../hooks/useGameAudio';
import { Confetti } from './ui/Confetti';
import { DEFAULT_CONFIG } from '../constants';
import { useTranslation } from '../contexts/LanguageContext';
import { useNotification } from '../contexts/NotificationContext';
import { useCollider } from '../hooks/useCollider';
import { useRoster } from '../contexts/GameContext';

interface HistoryBarProps {
  history: SetHistory[];
  setsA: number;
  setsB: number;
  colorA: TeamColor;
  colorB: TeamColor;
}

const AppLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect width="512" height="512" rx="128" fill="#0f172a" />
    <circle cx="256" cy="256" r="160" stroke="url(#paint0_linear_logo)" strokeWidth="32" />
    <path d="M256 96C256 96 320 180 380 180" stroke="url(#paint1_linear_logo)" strokeWidth="32" strokeLinecap="round" />
    <path d="M256 416C256 416 192 332 132 332" stroke="url(#paint2_linear_logo)" strokeWidth="32" strokeLinecap="round" />
    <path d="M116 200C116 200 180 220 256 256" stroke="url(#paint3_linear_logo)" strokeWidth="32" strokeLinecap="round" />
    <path d="M396 312C396 312 332 292 256 256" stroke="url(#paint4_linear_logo)" strokeWidth="32" strokeLinecap="round" />
    <defs>
      <linearGradient id="paint0_linear_logo" x1="96" y1="96" x2="416" y2="416" gradientUnits="userSpaceOnUse">
        <stop stopColor="#6366f1" /><stop offset="1" stopColor="#f43f5e" />
      </linearGradient>
      <linearGradient id="paint1_linear_logo" x1="256" y1="96" x2="380" y2="180" gradientUnits="userSpaceOnUse">
        <stop stopColor="#6366f1" /><stop offset="1" stopColor="#818cf8" />
      </linearGradient>
      <linearGradient id="paint2_linear_logo" x1="256" y1="416" x2="132" y2="332" gradientUnits="userSpaceOnUse">
        <stop stopColor="#f43f5e" /><stop offset="1" stopColor="#fb7185" />
      </linearGradient>
      <linearGradient id="paint3_linear_logo" x1="116" y1="200" x2="256" y2="256" gradientUnits="userSpaceOnUse">
        <stop stopColor="#6366f1" /><stop offset="1" stopColor="#f43f5e" />
      </linearGradient>
      <linearGradient id="paint4_linear_logo" x1="396" y1="312" x2="256" y2="256" gradientUnits="userSpaceOnUse">
        <stop stopColor="#f43f5e" /><stop offset="1" stopColor="#6366f1" />
      </linearGradient>
    </defs>
  </svg>
);

const GameTimer = memo(() => {
  const { seconds } = useTimerValue();
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  const formattedTime = h > 0
    ? `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    : `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;

  return (
    <span className="text-[10px] font-mono font-extrabold text-slate-500 dark:text-slate-400 tabular-nums tracking-wider">
      {formattedTime}
    </span>
  );
});

const CollidableSetItem: React.FC<{ set: SetHistory, themeA: any, themeB: any }> = memo(({ set, themeA, themeB }) => {
  const isA = set.winner === 'A';
  const itemRef = useCollider(`hist-set-${set.setNumber}`);

  return (
    <motion.div
      ref={itemRef}
      variants={listItemVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      layout
      className={`
                flex-shrink-0 flex items-center justify-center h-6 px-2.5 rounded-lg
                bg-gradient-to-br from-white/80 to-white/40 dark:from-white/10 dark:to-white/5
                border border-white/40 dark:border-white/10
                ring-1 ring-inset ring-black/5 dark:ring-white/5
                shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_1px_3px_rgba(255,255,255,0.1)]
                backdrop-blur-sm
            `}
    >
      <div className="flex items-center text-[10px] font-extrabold leading-none gap-1">
        <span className={isA ? `${themeA.text} ${themeA.textDark}` : 'text-slate-400/80'}>{set.scoreA}</span>
        <span className='opacity-30 text-slate-500'>:</span>
        <span className={!isA ? `${themeB.text} ${themeB.textDark}` : 'text-slate-400/80'}>{set.scoreB}</span>
      </div>
    </motion.div>
  );
});

const SetHistoryList = memo(({ history, colorA, colorB }: { history: SetHistory[], colorA: TeamColor, colorB: TeamColor }) => {
  const themeA = resolveTheme(colorA);
  const themeB = resolveTheme(colorB);

  return (
    <div className="flex items-center gap-1 overflow-x-auto no-scrollbar mask-linear-fade-right w-full h-full pr-10">
      <AnimatePresence mode="popLayout">
        {history.map((set, idx) => (
          <CollidableSetItem key={`${set.setNumber}-${idx}`} set={set} themeA={themeA} themeB={themeB} />
        ))}
      </AnimatePresence>
      <div className="w-2 flex-shrink-0 h-1"></div>
    </div>
  );
}, (prev, next) => prev.history === next.history && prev.colorA === next.colorA && prev.colorB === next.colorB);

const ScoreTickerSimple = memo(({ value, color }: { value: number, color: TeamColor }) => {
  const theme = resolveTheme(color);
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.span
        key={value}
        initial={{ y: 5, opacity: 0, filter: 'blur(2px)' }}
        animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
        exit={{ y: -5, opacity: 0, filter: 'blur(2px)' }}
        className={`${theme.text} ${theme.textDark} transition-colors duration-300`}
      >
        {value}
      </motion.span>
    </AnimatePresence>
  );
});

export const HistoryBar: React.FC<HistoryBarProps> = memo(({ history, setsA, setsB, colorA, colorB }) => {
  const [tapCount, setTapCount] = useState(0);
  const [isPartyTime, setIsPartyTime] = useState(false);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const haptics = useHaptics();
  const audio = useGameAudio(DEFAULT_CONFIG);
  const { t } = useTranslation();
  const { showNotification } = useNotification();
  const { config } = useRoster(); // Access global config to check lowGraphics

  const logoRef = useCollider('hist-logo');
  const setsScoreRef = useCollider('hist-score');
  const timerRef = useCollider('hist-timer');

  const handleLogoTap = () => {
    haptics.impact('light');
    setTapCount(prev => {
      const newCount = prev + 1;
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
      resetTimerRef.current = setTimeout(() => setTapCount(0), 2000);
      if (newCount === 5) {
        triggerEasterEgg();
        return 0;
      }
      return newCount;
    });
  };

  const triggerEasterEgg = () => {
    setIsPartyTime(true);
    showNotification({
      type: 'success',
      mainText: t('easterEgg.title'),
      subText: t('easterEgg.subtitle'),
      systemIcon: 'party'
    });
    haptics.notification('success');
    audio.playUnlock();
    setTimeout(() => setIsPartyTime(false), 5000);
  };

  return (
    <>
      {isPartyTime && createPortal(
        <div className="fixed inset-0 z-[100] pointer-events-none">
          <Confetti
            colors={[colorA, colorB]}
            intensity="high"
            physicsVariant="interactive"
            enabled={!config.lowGraphics}
          />
        </div>,
        document.body
      )}

      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="max-w-3xl mx-auto h-10 flex items-center justify-between px-3 w-full gap-2 relative z-10"
      >
        <motion.div
          ref={logoRef}
          className="flex-shrink-0 cursor-pointer active:scale-90 transition-transform"
          onClick={handleLogoTap}
          animate={isPartyTime ? { rotate: [0, 360, 720, 1080], scale: [1, 1.2, 1] } : { rotate: 0, scale: 1 }}
        >
          <AppLogo className="w-8 h-8 rounded-full border border-black/10 dark:border-white/20 shadow-sm" />
        </motion.div>

        <div ref={setsScoreRef} className="flex-shrink-0 flex items-center gap-2 px-3 h-8 rounded-full bg-white/70 dark:bg-white/[0.05] border border-white/40 dark:border-white/5 ring-1 ring-inset ring-black/5 dark:ring-white/10 backdrop-blur-md shadow-sm shadow-black/5">
          <div className="flex items-center gap-1.5 text-sm font-black tracking-tight leading-none">
            <ScoreTickerSimple value={setsA} color={colorA} />
            <span className="text-slate-300 dark:text-slate-600 text-[10px] font-medium">-</span>
            <ScoreTickerSimple value={setsB} color={colorB} />
          </div>
        </div>

        <div className="flex-1 mx-1 overflow-hidden h-full flex items-center">
          <SetHistoryList history={history} colorA={colorA} colorB={colorB} />
        </div>

        <div ref={timerRef} className="flex-shrink-0 flex items-center gap-1.5 px-3 h-8 rounded-full bg-slate-100/60 dark:bg-black/40 border border-black/5 dark:border-white/5 ring-1 ring-inset ring-black/5 dark:ring-white/10 backdrop-blur-md">
          <Clock size={10} className="text-slate-400" strokeWidth={2.5} />
          <GameTimer />
        </div>
      </motion.div>
    </>
  );
});
