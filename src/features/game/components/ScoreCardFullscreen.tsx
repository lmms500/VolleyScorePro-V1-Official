import React, { memo, useMemo, useRef } from 'react';
import { TeamId, Team, SkillType, GameConfig, TeamColor } from '@types';
import { ScoreTicker } from '@ui/ScoreTicker';
import { motion, AnimatePresence } from 'framer-motion';
import { pulseHeartbeat } from '@lib/utils/animations';
import { ScoutModal } from '@features/game/modals/ScoutModal';
import { useCollider } from '@features/game/hooks/useCollider';
import { HaloBackground, HaloMode } from '@ui/HaloBackground';
import { useScoreCardLogic } from '@features/game/hooks/useScoreCardLogic';
import { usePerformanceSafe } from '@contexts/PerformanceContext';

interface ScoreCardFullscreenProps {
    teamId: TeamId;
    team: Team;
    score: number;
    onAdd: (teamId: TeamId, playerId?: string, skill?: SkillType) => void;
    onSubtract: () => void;
    isMatchPoint: boolean;
    isSetPoint: boolean;
    isDeuce?: boolean;
    inSuddenDeath?: boolean;
    colorTheme?: TeamColor;
    isLocked?: boolean;
    onInteractionStart?: () => void;
    onInteractionEnd?: () => void;
    reverseLayout?: boolean;

    isServing?: boolean;
    isLastScorer?: boolean;
    config: GameConfig;
}

const ScoreNumberDisplay = memo(({
    score,
    textEffectClass,
    isPressed,
    numberRef,
    isCritical,
    colliderRef,
    haloMode,
    colorTheme,
}: {
    score: number;
    textEffectClass: string;
    isPressed: boolean;
    numberRef: React.Ref<HTMLDivElement>;
    isCritical: boolean;
    colliderRef: React.Ref<HTMLDivElement>;
    haloMode: HaloMode;
    colorTheme: string;
}) => {

    return (
        <div className="relative flex items-center justify-center w-full pointer-events-none overflow-visible isolate" style={{ lineHeight: 1 }}>

            {/* 1. Halo Layer: Absolute Centered Overlay */}
            <div className="absolute inset-0 flex items-center justify-center z-0">
                <HaloBackground
                    mode={haloMode}
                    colorTheme={colorTheme}
                    score={score}
                    className=""
                    size="1em"
                />
            </div>

            <motion.div
                ref={numberRef}
                className="relative z-10 flex flex-col items-center justify-center overflow-visible"
                variants={pulseHeartbeat}
                animate={isCritical ? "pulse" : "idle"}
            >
                <div className="overflow-visible">
                    <div ref={colliderRef} className="overflow-visible">
                        <ScoreTicker
                            value={score}
                            className={`
                                font-black leading-none tracking-tighter transition-all duration-300
                                text-slate-900 dark:text-white
                                ${textEffectClass}
                                ${isPressed ? 'scale-95 opacity-90' : ''}
                            `}
                        />
                    </div>
                </div>
            </motion.div>
        </div>
    );
});

ScoreNumberDisplay.displayName = 'ScoreNumberDisplay';

export const ScoreCardFullscreen: React.FC<ScoreCardFullscreenProps> = memo(({
    teamId, team, score, onAdd, onSubtract,
    isMatchPoint, isSetPoint,
    isLocked = false, onInteractionStart, onInteractionEnd, reverseLayout,
    isServing, isLastScorer = false, config, colorTheme
}) => {
    const { config: perf } = usePerformanceSafe();
    const numberRef = useRef<HTMLDivElement>(null);
    const colliderRef = useCollider(`sc-fs-${teamId}`);

    const {
        showScout,
        isPressed,
        ripple,
        haloMode,
        isCritical,
        resolvedColor,
        containerRef,
        handleScoutClose,
        handleScoutConfirm,
        gestureHandlers,
    } = useScoreCardLogic({
        teamId, team, onAdd, onSubtract, config, isLocked,
        isMatchPoint, isSetPoint,
        isServing: isServing ?? false,
        isLastScorer: isLastScorer ?? false,
        onInteractionStart, onInteractionEnd, colorTheme,
    });

    const textEffectClass = useMemo(() => {
        if (!perf.visual.criticalGlow) return '';
        if (isMatchPoint) return 'drop-shadow-[0_0_60px_rgba(251,191,36,0.9)]';
        if (isSetPoint) return 'drop-shadow-[0_0_40px_rgba(255,255,255,0.15)]';
        return '';
    }, [isMatchPoint, isSetPoint, perf.visual.criticalGlow]);

    const isLeftSide = reverseLayout ? teamId === 'B' : teamId === 'A';

    // Dynamic padding logic:
    // Outer side (away from center): Safe Area + 2rem base
    // Inner side (towards center): HUD Space (approx 5rem/80px)
    const containerStyle: React.CSSProperties = {
        paddingLeft: isLeftSide ? 'max(env(safe-area-inset-left), 2rem)' : '5rem',
        paddingRight: isLeftSide ? '5rem' : 'max(env(safe-area-inset-right), 2rem)',
        touchAction: 'none',
        WebkitUserSelect: 'none',
        userSelect: 'none'
    };

    // Simplified container classes: purely relative flex item now
    const containerClasses = 'relative w-full flex-1 flex flex-col justify-center items-center select-none';

    return (
        <>
            <ScoutModal
                isOpen={showScout}
                onClose={handleScoutClose}
                team={team}
                onConfirm={handleScoutConfirm}
                colorTheme={team.color || 'indigo'}
            />

            <div
                ref={containerRef}
                className={containerClasses}
                style={containerStyle}
                {...gestureHandlers}
            >
                <AnimatePresence mode="wait">
                    {ripple && perf.visual.rippleEffects && (
                        <motion.div
                            key={ripple.id}
                            initial={{ scale: 0, opacity: 0.3 }}
                            animate={{ scale: 1.5, opacity: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                            className="absolute w-12 h-12 rounded-full bg-white pointer-events-none z-0 mix-blend-overlay"
                            style={{ left: ripple.x, top: ripple.y, x: '-50%', y: '-50%' }}
                        />
                    )}
                </AnimatePresence>

                <div
                    className={`
                    flex items-center justify-center w-full h-full
                    transition-transform duration-150
                    ${isPressed ? 'scale-95' : 'scale-100'}
                    will-change-transform overflow-visible
                `}
                    style={{ fontSize: 'clamp(5rem, 28vmax, 22rem)', lineHeight: 1 }}
                >
                    <div className="w-full flex justify-center overflow-visible">
                        <ScoreNumberDisplay
                            score={score}
                            textEffectClass={textEffectClass}
                            isPressed={isPressed}
                            numberRef={numberRef}
                            isCritical={isCritical}
                            colliderRef={colliderRef}
                            haloMode={haloMode}
                            colorTheme={resolvedColor}
                        />
                    </div>
                </div>
            </div>
        </>
    );
});

ScoreCardFullscreen.displayName = 'ScoreCardFullscreen';
