
import React, { memo, useState, useCallback } from 'react';
import { Team, TeamId, SkillType, GameConfig, TeamColor } from '../types';
import { Volleyball, Zap, Timer, Skull, TrendingUp, Trophy } from 'lucide-react';
import { useScoreGestures } from '../hooks/useScoreGestures';
import { useTranslation } from '../contexts/LanguageContext';
import { useGameAudio } from '../hooks/useGameAudio';
import { useHaptics } from '../hooks/useHaptics';
import { ScoreTicker } from './ui/ScoreTicker';
import { GlassSurface } from './ui/GlassSurface';
import { GestureHint } from './ui/GestureHint';
import { motion, AnimatePresence } from 'framer-motion';
import { stampVariants } from '../utils/animations';
import { ScoutModal } from './modals/ScoutModal';
import { resolveTheme } from '../utils/colors';
import { TeamLogo } from './ui/TeamLogo';

interface ScoreCardNormalProps {
  teamId: TeamId;
  team: Team;
  score: number;
  setsWon: number;
  isServing: boolean;
  onAdd: (teamId: TeamId, playerId?: string, skill?: SkillType) => void;
  onSubtract: () => void;
  onSetServer: () => void;
  timeouts: number;
  onTimeout: () => void;
  isMatchPoint: boolean;
  isSetPoint: boolean;
  isLastScorer: boolean;
  isDeuce?: boolean;
  inSuddenDeath?: boolean;
  setsNeededToWin: number;
  colorTheme?: TeamColor;
  isLocked?: boolean;
  onInteractionStart?: () => void;
  onInteractionEnd?: () => void;
  config: GameConfig;
  swappedSides?: boolean;
}

export const ScoreCardNormal: React.FC<ScoreCardNormalProps> = memo(({
  teamId, team, score, setsWon, isServing, onAdd, onSubtract, onSetServer, timeouts, onTimeout,
  isMatchPoint, isSetPoint, isLastScorer, isDeuce, inSuddenDeath, setsNeededToWin,
  isLocked = false, onInteractionStart, onInteractionEnd, config, colorTheme, swappedSides = false
}) => {
  const { t } = useTranslation();
  const audio = useGameAudio(config);
  const haptics = useHaptics(true);
  
  const [showScout, setShowScout] = useState(false);
  const [isInteractionLocked, setIsInteractionLocked] = useState(false);
  const [isTouching, setIsTouching] = useState(false);
  const [ripple, setRipple] = useState<{ x: number, y: number, id: number } | null>(null);
  
  const containerRef = React.useRef<HTMLDivElement>(null);

  const handleScoutClose = useCallback(() => {
     setShowScout(false);
     setIsInteractionLocked(true);
     setTimeout(() => setIsInteractionLocked(false), 300);
  }, []);

  const handleAddWrapper = useCallback(() => {
    if (isInteractionLocked) return;
    audio.playTap();
    if (config.enablePlayerStats) {
        haptics.impact('light');
        setShowScout(true);
    } else {
        onAdd(teamId);
    }
  }, [config.enablePlayerStats, onAdd, teamId, audio, haptics, isInteractionLocked]);

  const handleSubtractWrapper = useCallback(() => {
      onSubtract();
  }, [onSubtract]);

  const handleTouchStart = useCallback((e: React.PointerEvent) => {
      if (isLocked) return;
      setIsTouching(true);
      onInteractionStart?.();

      if (containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          setRipple({
              x: e.clientX - rect.left,
              y: e.clientY - rect.top,
              id: Date.now()
          });
      }
  }, [onInteractionStart, isLocked]);

  const handleTouchEnd = useCallback(() => {
      setIsTouching(false);
      onInteractionEnd?.();
  }, [onInteractionEnd]);

  const handleTouchCancel = useCallback(() => {
      setIsTouching(false);
      onInteractionEnd?.();
  }, [onInteractionEnd]);

  const gestureHandlers = useScoreGestures({
    onAdd: handleAddWrapper, 
    onSubtract: handleSubtractWrapper, 
    isLocked: isLocked || isInteractionLocked, 
    onInteractionStart: handleTouchStart, 
    onInteractionEnd: handleTouchEnd
  });

  const resolvedColor = colorTheme || team.color || 'slate';
  const theme = resolveTheme(resolvedColor);

  // Calculate order for swap animation
  const order = swappedSides
    ? (teamId === 'A' ? 2 : 1)
    : (teamId === 'A' ? 1 : 2);

  const timeoutsExhausted = timeouts >= 2;
  const isCritical = isMatchPoint || isSetPoint;

  let badgeConfig = null;
  if (inSuddenDeath) {
      badgeConfig = { icon: Skull, text: t('status.sudden_death'), className: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20' };
  } else if (isMatchPoint) {
      badgeConfig = { icon: Trophy, text: t('status.match_point'), className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 shadow-amber-500/10' };
  } else if (isSetPoint) {
      badgeConfig = { icon: Zap, text: t('status.set_point'), className: `${theme.bg} ${theme.text} ${theme.textDark} ${theme.border}` };
  } else if (isDeuce) {
      badgeConfig = { icon: TrendingUp, text: t('status.deuce_advantage'), className: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border-indigo-500/20' };
  }

  // Brilho: Sólido para o último pontuador ou pontos críticos
  const showShine = isCritical || isLastScorer;
  const haloColorClass = isMatchPoint ? 'bg-amber-500 saturate-150' : theme.halo;

  return (
    <GlassSurface
        layout
        layoutId={`score-card-normal-${teamId}`}
        transition={{ type: "spring", stiffness: 280, damping: 28, mass: 1.2 }}
        intensity="transparent"
        className={`
            flex flex-col flex-1 relative h-full select-none
            rounded-3xl min-h-0 py-2
            !bg-transparent !border-none !shadow-none !ring-0
            transition-[opacity,filter] duration-300
            ${isLocked ? 'opacity-40 grayscale' : ''}
            overflow-visible
        `}
        style={{ order }}
        lowGraphics={config.lowGraphics}
    >
      <ScoutModal isOpen={showScout} onClose={handleScoutClose} team={team} onConfirm={(pid, skill) => onAdd(teamId, pid, skill)} colorTheme={team.color || 'indigo'} />
      
      <div className="flex flex-col h-full w-full relative z-10 justify-between items-center overflow-visible gap-2 px-4">
        
        {/* HEADER: Identidade e Sets */}
        <div className="w-full flex flex-col items-center shrink-0 space-y-2 pt-2">
            <div className="flex gap-2 mb-1">
                {[...Array(setsNeededToWin)].map((_, i) => (
                    <motion.div 
                        key={i} 
                        initial={false}
                        animate={{ 
                            scale: i < setsWon ? 1.1 : 1,
                            backgroundColor: i < setsWon ? 'var(--theme-color)' : 'transparent',
                        }}
                        className={`
                            w-2 h-2 rounded-full border transition-all duration-500
                            ${i < setsWon ? `${theme.halo} shadow-[0_0_8px_currentColor]` : 'border-slate-300 dark:border-slate-700 opacity-20'}
                        `} 
                    />
                ))}
            </div>

            <motion.div 
                layout 
                className="flex items-center justify-center gap-3 cursor-pointer px-4 py-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors max-w-full"
                onClick={(e) => { e.stopPropagation(); onSetServer(); haptics.impact('light'); }}
            >
                {team.logo && (
                    <div className="w-14 h-14 flex-shrink-0 flex items-center justify-center">
                        <TeamLogo src={team.logo} alt="" className="w-full h-full object-contain drop-shadow-md" />
                    </div>
                )}
                <div className="flex items-center gap-2 min-w-0">
                    <h2 className="font-black uppercase text-center text-xl md:text-2xl text-slate-900 dark:text-white tracking-tighter truncate leading-none">
                        {team?.name || ''}
                    </h2>
                    {isServing && (
                        <motion.div
                          layout="position"
                          initial={{ scale: 0, rotate: -90 }}
                          animate={{ scale: 1, rotate: 0 }}
                          className="text-amber-500 dark:text-amber-400 shrink-0"
                        >
                            <Volleyball size={18} strokeWidth={2.5} fill="currentColor" fillOpacity={0.1} />
                        </motion.div>
                    )}
                </div>
            </motion.div>

            <div className="h-8 w-full flex items-center justify-center">
                <AnimatePresence mode="wait">
                    {badgeConfig && (
                        <motion.div 
                            variants={stampVariants}
                            initial="hidden" animate="visible" exit="exit"
                            className={`px-3 py-1 rounded-full border backdrop-blur-md font-black uppercase tracking-widest text-[8px] flex items-center gap-1.5 shadow-md ${badgeConfig.className}`}
                        >
                            <badgeConfig.icon size={10} strokeWidth={3} />
                            {badgeConfig.text}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>

        {/* CENTER: Placar Centralizado */}
        <div 
            ref={containerRef}
            className="relative flex-1 w-full min-h-0 flex items-center justify-center cursor-pointer overflow-visible isolate my-2"
            style={{ touchAction: 'none' }}
            {...gestureHandlers}
            onPointerCancel={handleTouchCancel}
            onPointerLeave={handleTouchCancel}
        >
            <GestureHint isVisible={isTouching} />

            <AnimatePresence>
                {ripple && (
                    <motion.div
                        key={ripple.id}
                        initial={{ scale: 0, opacity: 0.3 }}
                        animate={{ scale: 1.5, opacity: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="absolute w-12 h-12 rounded-full bg-white pointer-events-none z-0 mix-blend-overlay"
                        style={{ left: ripple.x, top: ripple.y, x: '-50%', y: '-50%' }}
                    />
                )}
            </AnimatePresence>

            <div className="relative w-full h-full flex items-center justify-center pointer-events-none overflow-visible">
                {/* Visual Halo: Brilho SÓLIDO (estático) para último pontuador ou pontos críticos */}
                <motion.div 
                    initial={false}
                    animate={{ 
                        opacity: showShine ? (isCritical ? 0.5 : 0.35) : 0,
                        scale: showShine ? 1 : 0.8,
                    }}
                    transition={{ duration: 0.5 }}
                    className={`
                        absolute rounded-full aspect-square pointer-events-none z-0
                        ${haloColorClass}
                        ${config.lowGraphics ? 'blur-[40px]' : 'blur-[100px] mix-blend-multiply dark:mix-blend-screen'}
                    `}
                    style={{ width: '85%', height: 'auto', maxHeight: '180px' }}
                />
                
                {/* Score Number: Mais espaço para evitar cortes */}
                <div className="relative z-10 flex items-center justify-center leading-none p-6 w-full overflow-visible">
                    <ScoreTicker 
                        value={score}
                        className={`
                            font-black tracking-tighter leading-none select-none
                            text-[26vw] sm:text-[22vw] md:text-[200px] landscape:text-[22vh] landscape:lg:text-[25vh]
                            text-slate-900 dark:text-white
                            ${isMatchPoint ? 'drop-shadow-[0_0_40px_rgba(251,191,36,0.5)]' : ''}
                            ${isSetPoint ? 'drop-shadow-[0_0_20px_rgba(255,255,255,0.15)]' : ''}
                        `}
                    />
                </div>
            </div>
        </div>

        {/* FOOTER: Botão de Timeout 48px Flutuante (Transparente) */}
        <div className="w-full flex justify-center shrink-0 pt-2 pb-safe-bottom">
           <button 
             type="button"
             onClick={(e) => { 
                 e.stopPropagation(); 
                 if(!timeoutsExhausted) {
                     onTimeout();
                     haptics.impact('light');
                 }
             }}
             disabled={timeoutsExhausted}
             className={`
                flex items-center justify-center gap-3 px-6 h-12 rounded-2xl transition-all border border-transparent bg-transparent
                ${timeoutsExhausted ? 'opacity-20 grayscale cursor-not-allowed' : 'active:scale-95 hover:bg-black/5 dark:hover:bg-white/5'}
             `}
           >
              <Timer size={18} className="text-slate-400 dark:text-slate-500" strokeWidth={2.5} />
              <div className="flex gap-1.5">
                {[1, 2].map(t => (
                    <div 
                      key={t} 
                      className={`
                        w-4 h-1 rounded-full transition-all duration-300
                        ${t > timeouts 
                            ? `${theme.halo} shadow-[0_0_5px_currentColor]` 
                            : 'bg-slate-300 dark:bg-slate-700'
                        }
                      `} 
                    />
                ))}
              </div>
           </button>
        </div>

      </div>
    </GlassSurface>
  );
});
