
import React, { memo, useRef } from 'react';
import { Volleyball, Timer, Skull, TrendingUp, Zap, Crown } from 'lucide-react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { useTranslation } from '../../contexts/LanguageContext';
import { resolveTheme } from '../../utils/colors';
import { TeamColor } from '../../types';
import { useTimerValue } from '../../contexts/TimerContext';
import { TeamLogo } from '../ui/TeamLogo';

interface FloatingTopBarProps {
  currentSet: number;
  isTieBreak: boolean;
  onToggleTimer: () => void;
  onResetTimer: () => void;
  isTimerRunning: boolean;
  teamNameA: string;
  teamNameB: string;
  teamLogoA?: string;
  teamLogoB?: string;
  colorA: TeamColor;
  colorB: TeamColor;
  isServingLeft: boolean;
  isServingRight: boolean;
  onSetServerA: () => void;
  onSetServerB: () => void;
  timeoutsA: number;
  timeoutsB: number;
  onTimeoutA: () => void;
  onTimeoutB: () => void;
  isMatchPointA: boolean;
  isSetPointA: boolean;
  isMatchPointB: boolean;
  isSetPointB: boolean;
  isDeuce: boolean;
  inSuddenDeath: boolean;
  reverseLayout: boolean;
}

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

// Updated Style: Shadows only in dark mode to prevent muddy text in light mode
const hudText = "dark:drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]";
const hudContainer = "hover:bg-black/5 dark:hover:bg-white/10 transition-colors rounded-xl";

// --- SUB-COMPONENTS ---

const TimeoutDots = memo<{ count: number; colorTheme: any }>(({ count, colorTheme }) => (
  <div className="flex gap-1.5 justify-center">
    {[1, 2].map(i => {
      const isAvailable = i > count;
      return (
        <motion.div
          key={i}
          layout
          initial={false}
          animate={{
            scale: isAvailable ? 1 : 0.8,
            opacity: isAvailable ? 1 : 0.3
          }}
          className={`
            w-2 h-2 rounded-full shadow-sm border border-black/10 dark:border-white/10
            ${isAvailable 
                ? `${colorTheme.bg.replace('/10', '')} ${colorTheme.text} dark:${colorTheme.halo}` 
                : 'bg-slate-300 dark:bg-slate-600'}
          `}
        />
      );
    })}
  </div>
));

const TimeoutButton = memo<{
  timeouts: number;
  onTimeout: () => void;
  color: TeamColor;
  id: string;
}>(({ timeouts, onTimeout, color, id }) => {
    const theme = resolveTheme(color);
    return (
      <motion.button
        layout
        layoutId={`timeout-btn-${id}`} 
        transition={{ type: "spring", stiffness: 350, damping: 30 }}
        whileTap={{ scale: 0.92 }}
        onClick={(e) => { e.stopPropagation(); onTimeout(); }}
        className={`
           flex flex-col items-center justify-center p-1
           ${hudContainer}
           ${timeouts >= 2 ? 'opacity-40 grayscale cursor-not-allowed' : 'opacity-100 cursor-pointer'}
           w-10 h-full flex-shrink-0 gap-1 min-h-[44px]
        `}
      >
        <div className={`p-1 rounded-full bg-gradient-to-b from-slate-100 to-slate-200 dark:from-white/10 dark:to-white/5 border border-white/30 dark:border-white/10 shadow-inner ${hudText}`}>
          <Timer size={12} className="text-slate-600 dark:text-white" strokeWidth={3} />
        </div>
        <TimeoutDots count={timeouts} colorTheme={theme} />
      </motion.button>
    );
});

const TeamInfoSmart = memo<{
  name: string;
  logo?: string;
  color: TeamColor;
  isServing: boolean;
  onSetServer: () => void;
  align: 'left' | 'right';
  isMatchPoint: boolean;
  isSetPoint: boolean;
  id: string; 
}>(({ name, logo, color, isServing, onSetServer, align, isMatchPoint, isSetPoint, id }) => {
  const { t } = useTranslation();
  const theme = resolveTheme(color);
  
  const isCritical = isMatchPoint || isSetPoint;
  
  // Badge needs background to be legible as alert
  const badgeClass = isMatchPoint 
    ? 'bg-amber-500 text-white shadow-amber-500/50' 
    : `${theme.bg.replace('/20', '')} text-white shadow-lg`;

  return (
    <motion.div 
      layout
      layoutId={`team-info-${id}`}
      transition={{ type: "spring", stiffness: 350, damping: 30 }}
      className={`
        flex flex-col items-center justify-center relative min-w-0 flex-1 h-full py-1 px-1
        ${hudContainer}
        min-h-[50px]
      `}
    >
      <div 
        className={`flex items-center gap-3 cursor-pointer group h-full w-full relative overflow-visible ${align === 'right' ? 'flex-row-reverse' : ''}`}
        onClick={(e) => { e.stopPropagation(); onSetServer(); }}
      >
        
        {/* Name & Badge Container */}
        <div className={`flex flex-col ${align === 'right' ? 'items-start' : 'items-end'} min-w-0 flex-1`}>
            <div className={`flex items-center gap-2 ${align === 'right' ? 'flex-row-reverse' : ''}`}>
                <span className={`text-lg sm:text-xl font-black uppercase tracking-tighter transition-colors truncate block leading-none ${theme.text} dark:text-white ${hudText}`}>
                    {name}
                </span>
                {logo && (
                    <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center">
                        <TeamLogo src={logo} alt="" className="w-full h-full object-contain drop-shadow-md" />
                    </div>
                )}
            </div>
            
            <AnimatePresence>
                {isCritical && (
                    <motion.div
                        initial={{ opacity: 0, height: 0, scale: 0.8 }}
                        animate={{ opacity: 1, height: 'auto', scale: 1 }}
                        exit={{ opacity: 0, height: 0, scale: 0.8 }}
                        className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest mt-1 shadow-md ${badgeClass}`}
                    >
                        {isMatchPoint ? <Crown size={10} fill="currentColor" /> : <Zap size={10} fill="currentColor" />}
                        <span>{isMatchPoint ? t('status.match_point') : t('status.set_point')}</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>

        {/* Serving Indicator - Floating Ball - Improved Centering */}
        <div className="relative w-8 h-full flex items-center justify-center flex-shrink-0">
             {!isServing && <div className={`w-1.5 h-1.5 rounded-full opacity-30 bg-slate-300 dark:bg-white/30`} />}
             
             <AnimatePresence>
                {isServing && (
                    <motion.div
                        key="serve-ball"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: 180 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="absolute inset-0 flex items-center justify-center text-amber-500 dark:text-amber-400 drop-shadow-md"
                    >
                        <div className="bg-white dark:bg-slate-900 rounded-full p-0.5 shadow-lg border border-black/5 dark:border-white/10 flex items-center justify-center">
                          <Volleyball size={18} className="text-amber-500 dark:text-amber-400" fill="currentColor" fillOpacity={0.2} />
                        </div>
                    </motion.div>
                )}
             </AnimatePresence>
        </div>

      </div>
    </motion.div>
  );
});

const CenterDisplayStealth = memo<{
  isTimerRunning: boolean;
  onToggleTimer: () => void;
  onResetTimer: () => void;
  currentSet: number;
  isTieBreak: boolean;
  inSuddenDeath: boolean;
  isDeuce: boolean;
}>(({ isTimerRunning, onToggleTimer, onResetTimer, currentSet, isTieBreak, inSuddenDeath, isDeuce }) => {
  const { t } = useTranslation();
  // Use specialized hook
  const { seconds } = useTimerValue();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  let key = 'timer';
  let content = null;

  const StatusPill = ({ icon: Icon, text, colorClass, animateIcon }: any) => (
      <div className={`flex flex-col items-center justify-center gap-0.5 w-full h-full`}>
           <motion.div 
             animate={animateIcon}
             transition={{ duration: 1.5, repeat: Infinity }}
             className={`flex-shrink-0 p-1.5 bg-white dark:bg-white/10 backdrop-blur-md rounded-full ${colorClass} shadow-lg ring-1 ring-black/5 dark:ring-white/10`}
           >
              <Icon size={16} strokeWidth={3} />
           </motion.div>
           <span className={`text-[9px] font-black uppercase tracking-wider leading-none text-slate-700 dark:text-white ${hudText} mt-1`}>
             {text}
           </span>
      </div>
  );

  const handlePointerDown = (e: React.PointerEvent) => {
      e.preventDefault();
      timerRef.current = setTimeout(() => {
          onResetTimer();
      }, 800);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
      if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
          onToggleTimer();
      }
  };

  const handlePointerLeave = () => {
      if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
      }
  };

  if (inSuddenDeath) {
    key = 'sudden-death';
    content = <StatusPill icon={Skull} text={t('status.sudden_death')} colorClass="text-red-500" animateIcon={{ scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] }} />;
  } else if (isDeuce) {
    key = 'deuce';
    content = <StatusPill 
        icon={TrendingUp} 
        text="DEUCE" 
        colorClass="text-cyan-500 dark:text-cyan-400" 
        animateIcon={{ y: [-2, 2, -2] }} 
    />;
  } else {
    content = (
      <button 
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        className="flex flex-col items-center justify-center group w-full h-full gap-0.5 touch-none active:scale-95 transition-transform"
      >
        <motion.span 
            layout
            className={`
                font-mono text-2xl font-black tabular-nums leading-none tracking-tight 
                transition-all duration-300 text-slate-800 dark:text-white ${hudText}
                ${isTimerRunning ? 'opacity-100' : 'opacity-60 dark:opacity-70'}
            `}
        >
            {formatTime(seconds)}
        </motion.span>
        <motion.span 
            layout
            className={`text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-1 ${isTieBreak ? 'text-amber-500 dark:text-amber-400' : 'text-slate-400 dark:text-slate-300'} ${hudText}`}
        >
            {isTieBreak ? 'TIE BREAK' : `SET ${currentSet}`}
        </motion.span>
      </button>
    );
  }

  return (
    <div className="flex items-center justify-center h-full w-full relative">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={key}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.25, ease: "backOut" }}
          className="w-full flex justify-center h-full"
        >
          {content}
        </motion.div>
      </AnimatePresence>
    </div>
  );
});

// --- MAIN COMPONENT ---

export const FloatingTopBar: React.FC<FloatingTopBarProps> = memo((props) => {
  return (
    <div className="fixed top-6 left-0 w-full z-[55] flex justify-center pointer-events-none px-4">
        <LayoutGroup>
            <motion.div 
                layout
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
                className={`
                    pointer-events-auto
                    w-full max-w-2xl
                    flex items-center justify-between gap-1
                    min-h-[60px]
                    relative
                    overflow-visible
                `}
            >
                <TeamInfoSmart 
                    id={props.reverseLayout ? "B" : "A"} 
                    name={props.reverseLayout ? props.teamNameB : props.teamNameA} 
                    logo={props.reverseLayout ? props.teamLogoB : props.teamLogoA}
                    color={props.reverseLayout ? props.colorB : props.colorA} 
                    isServing={props.isServingLeft} 
                    onSetServer={props.reverseLayout ? props.onSetServerB : props.onSetServerA} 
                    align="left"
                    isMatchPoint={props.reverseLayout ? props.isMatchPointB : props.isMatchPointA}
                    isSetPoint={props.reverseLayout ? props.isSetPointB : props.isSetPointA}
                />
                
                <div className="flex items-center shrink-0">
                    <TimeoutButton 
                        id={props.reverseLayout ? "B" : "A"}
                        timeouts={props.reverseLayout ? props.timeoutsB : props.timeoutsA} 
                        onTimeout={props.reverseLayout ? props.onTimeoutB : props.onTimeoutA} 
                        color={props.reverseLayout ? props.colorB : props.colorA}
                    />
                </div>

                {/* Center Divider / Timer */}
                <div className="shrink-0 z-10 flex items-center mx-1">
                    <div className={`w-[90px] h-full flex justify-center items-center min-h-[50px] ${hudContainer}`}>
                        <CenterDisplayStealth 
                            isTimerRunning={props.isTimerRunning}
                            onToggleTimer={props.onToggleTimer}
                            onResetTimer={props.onResetTimer}
                            currentSet={props.currentSet}
                            isTieBreak={props.isTieBreak}
                            isDeuce={props.isDeuce}
                            inSuddenDeath={props.inSuddenDeath}
                        />
                    </div>
                </div>

                <div className="flex items-center shrink-0">
                    <TimeoutButton 
                        id={props.reverseLayout ? "A" : "B"}
                        timeouts={props.reverseLayout ? props.timeoutsA : props.timeoutsB} 
                        onTimeout={props.reverseLayout ? props.onTimeoutA : props.onTimeoutB} 
                        color={props.reverseLayout ? props.colorA : props.colorB}
                    />
                </div>

                <TeamInfoSmart 
                    id={props.reverseLayout ? "A" : "B"} 
                    name={props.reverseLayout ? props.teamNameA : props.teamNameB} 
                    logo={props.reverseLayout ? props.teamLogoA : props.teamLogoB}
                    color={props.reverseLayout ? props.colorA : props.colorB} 
                    isServing={props.isServingRight} 
                    onSetServer={props.reverseLayout ? props.onSetServerA : props.onSetServerB} 
                    align="right"
                    isMatchPoint={props.reverseLayout ? props.isMatchPointA : props.isMatchPointB}
                    isSetPoint={props.reverseLayout ? props.isSetPointA : props.isSetPointB}
                />

            </motion.div>
        </LayoutGroup>
    </div>
  );
});
