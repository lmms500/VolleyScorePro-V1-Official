import React, { memo, useMemo, useRef } from 'react';
import { TeamId, Team, SkillType, GameConfig, TeamColor } from '../types';
import { ScoreTicker } from './ui/ScoreTicker';
import { motion, AnimatePresence } from 'framer-motion';
import { pulseHeartbeat } from '../utils/animations';
import { ScoutModal } from './modals/ScoutModal';
import { useCollider } from '../hooks/useCollider';
import { HaloBackground, HaloMode } from './ui/HaloBackground';
import { useScoreCardLogic } from '../hooks/useScoreCardLogic';

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
    scoreRefCallback?: (node: HTMLElement | null) => void;
    isServing?: boolean;
    isLastScorer?: boolean;
    config: GameConfig;
}

const ScoreNumberDisplay = memo(({
    score,
    textEffectClass,
    isPressed,
    scoreRefCallback,
    numberRef,
    isCritical,
    colliderRef,
    lowGraphics,
    haloMode,
    colorTheme
}: {
    score: number;
    textEffectClass: string;
    isPressed: boolean;
    scoreRefCallback?: (node: HTMLElement | null) => void;
    numberRef: React.Ref<HTMLDivElement>;
    isCritical: boolean;
    colliderRef: React.Ref<HTMLDivElement>;
    lowGraphics: boolean;
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
                    lowGraphics={lowGraphics}
                    className=""
                    size="min(45vw, 45vh)"
                />
            </div>

            {/* 2. Number Layer: Relative Content (z-10 para ficar na frente) */}
            <motion.div
                ref={numberRef}
                className="relative z-10 flex flex-col items-center justify-center will-change-transform overflow-visible"
                variants={pulseHeartbeat}
                animate={isCritical ? "pulse" : "idle"}
            >
                <div ref={scoreRefCallback} className="overflow-visible">
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
    scoreRefCallback, isServing, isLastScorer = false, config, colorTheme
}) => {
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
        if (config.lowGraphics) return '';
        if (isMatchPoint) return 'drop-shadow-[0_0_60px_rgba(251,191,36,0.9)]';
        if (isSetPoint) return 'drop-shadow-[0_0_40px_rgba(255,255,255,0.15)]';
        return '';
    }, [isMatchPoint, isSetPoint, config.lowGraphics]);

    const isLeftSide = reverseLayout ? teamId === 'B' : teamId === 'A';

    const containerClasses = isLeftSide
        ? 'left-0 top-0 w-full h-[50dvh] landscape:w-[50vw] landscape:h-[100dvh]'
        : 'left-0 top-[50dvh] w-full h-[50dvh] landscape:left-[50vw] landscape:top-0 landscape:w-[50vw] landscape:h-[100dvh]';

    const offsetClass = isLeftSide
        ? 'landscape:-translate-x-[6vw]'
        : 'landscape:translate-x-[6vw]';

    return (
        <>
            <ScoutModal
                isOpen={showScout}
                onClose={handleScoutClose}
                team={team}
                onConfirm={handleScoutConfirm}
                colorTheme={team.color || 'indigo'}
            />

            <motion.div
                ref={containerRef}
                layout
                layoutId={`score-card-fs-${teamId}`}
                transition={{ type: "spring", stiffness: 280, damping: 28, mass: 1.2 }}
                className={`
                fixed z-10 flex flex-col justify-center items-center select-none overflow-visible isolate
                ${containerClasses}
            `}
                style={{
                    touchAction: 'none',
                    WebkitUserSelect: 'none',
                    userSelect: 'none'
                }}
                {...gestureHandlers}
            >
                <AnimatePresence>
                    {ripple && !config.lowGraphics && (
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
                    <div className={`transform transition-transform duration-500 w-full flex justify-center overflow-visible ${offsetClass}`}>
                        <ScoreNumberDisplay
                            score={score}
                            textEffectClass={textEffectClass}
                            isPressed={isPressed}
                            scoreRefCallback={scoreRefCallback}
                            numberRef={numberRef}
                            isCritical={isCritical}
                            colliderRef={colliderRef}
                            lowGraphics={config.lowGraphics}
                            haloMode={haloMode}
                            colorTheme={resolvedColor}
                        />
                    </div>
                </div>
            </motion.div>
        </>
    );
});

ScoreCardFullscreen.displayName = 'ScoreCardFullscreen';
