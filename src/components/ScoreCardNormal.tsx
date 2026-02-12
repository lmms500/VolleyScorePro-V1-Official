
import React, { memo } from 'react';
import { Team, TeamId, SkillType, GameConfig, TeamColor } from '../types';
import { Volleyball, Zap, Timer, Skull, TrendingUp, Trophy } from 'lucide-react';
import { useTranslation } from '../contexts/LanguageContext';
import { ScoreTicker } from './ui/ScoreTicker';
import { GlassSurface } from './ui/GlassSurface';
import { GestureHint } from './ui/GestureHint';
import { motion, AnimatePresence } from 'framer-motion';
import { stampVariants } from '../utils/animations';
import { ScoutModal } from './modals/ScoutModal';
import { resolveTheme } from '../utils/colors';
import { TeamLogo } from './ui/TeamLogo';
import { normalize, hp } from '../utils/responsive';
import { useResponsive } from '../contexts/ResponsiveContext';
import { HaloBackground } from './ui/HaloBackground';
import { useScoreCardLogic } from '../hooks/useScoreCardLogic';

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
    const { resizeKey } = useResponsive();

    const {
        showScout,
        isPressed: isTouching,
        ripple,
        haloMode,
        isCritical,
        resolvedColor,
        containerRef,
        handleScoutClose,
        gestureHandlers,
        handlePointerCancel: handleTouchCancel,
        haptics,
    } = useScoreCardLogic({
        teamId, team, onAdd, onSubtract, config, isLocked,
        isMatchPoint, isSetPoint, isServing, isLastScorer,
        onInteractionStart, onInteractionEnd, colorTheme,
    });

    const theme = resolveTheme(resolvedColor);

    // Calculate order for swap animation
    const order = swappedSides
        ? (teamId === 'A' ? 2 : 1)
        : (teamId === 'A' ? 1 : 2);

    const timeoutsExhausted = timeouts >= 2;

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
                            <div style={{ width: normalize(56), height: normalize(56) }} className="flex-shrink-0 flex items-center justify-center">
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
                        {/* 1. Halo Layer: Absolute Centered Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <HaloBackground
                                mode={haloMode}
                                colorTheme={resolvedColor}
                                score={score}
                                lowGraphics={config.lowGraphics}
                                className=""
                                size="min(30vw, 20vh)"
                            />
                        </div>

                        {/* 2. Number Layer: Relative Content (z-10 para ficar na frente) */}
                        <div className="relative z-10 flex items-center justify-center leading-none overflow-visible">
                            <ScoreTicker
                                key={`ticker-${resizeKey}`}
                                value={score}
                                style={{ fontSize: hp(18) }}
                                className={`
                                    font-black tracking-tighter leading-none select-none
                                    text-slate-900 dark:text-white
                                    ${isCritical ? (isMatchPoint ? 'drop-shadow-[0_0_40px_rgba(251,191,36,0.5)]' : 'drop-shadow-[0_0_20px_rgba(255,255,255,0.15)]') : ''}
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
                            if (!timeoutsExhausted) {
                                onTimeout();
                                haptics.impact('light');
                            }
                        }}
                        disabled={timeoutsExhausted}
                        className={`
                flex items-center justify-center gap-3 px-6 h-12 rounded-full transition-all
                bg-gradient-to-br from-white/10 to-transparent border border-white/10 backdrop-blur-md shadow-lg
                ${timeoutsExhausted ? 'opacity-40 grayscale cursor-not-allowed' : 'active:scale-95 hover:from-white/20 hover:to-white/5 hover:border-white/20 hover:shadow-xl'}
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
