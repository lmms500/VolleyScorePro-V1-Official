import React, { useState, memo, useMemo, useRef, useCallback } from 'react';
import { TeamId, Team, SkillType, GameConfig, TeamColor } from '../types';
import { useScoreGestures } from '../hooks/useScoreGestures';
import { ScoreTicker } from './ui/ScoreTicker';
import { motion, AnimatePresence } from 'framer-motion';
import { pulseHeartbeat } from '../utils/animations';
import { useGameAudio } from '../hooks/useGameAudio';
import { useHaptics } from '../hooks/useHaptics';
import { ScoutModal } from './modals/ScoutModal';
import { useCollider } from '../hooks/useCollider';
import { HaloBackground, HaloMode } from './ui/HaloBackground';

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
    const [isPressed, setIsPressed] = useState(false);
    const [showScout, setShowScout] = useState(false);
    const [isInteractionLocked, setIsInteractionLocked] = useState(false);
    const [ripple, setRipple] = useState<{ x: number, y: number, id: number } | null>(null);

    const containerRef = useRef<HTMLDivElement>(null);
    const numberRef = useRef<HTMLDivElement>(null);

    const colliderRef = useCollider(`sc-fs-${teamId}`);

    const audio = useGameAudio(config);
    const haptics = useHaptics(true);

    const handleStart = useCallback((e: React.PointerEvent) => {
        setIsPressed(true);
        onInteractionStart?.();

        if (containerRef.current && !config.lowGraphics) {
            const rect = containerRef.current.getBoundingClientRect();
            setRipple({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
                id: Date.now()
            });
        }
    }, [onInteractionStart, config.lowGraphics]);

    const handleEnd = useCallback(() => {
        setIsPressed(false);
        onInteractionEnd?.();
    }, [onInteractionEnd]);

    const handleScoutClose = useCallback(() => {
        setShowScout(false);
        setIsInteractionLocked(true);
        const t = setTimeout(() => setIsInteractionLocked(false), 300);
        return () => clearTimeout(t);
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

    const handleScoutConfirm = useCallback((pid: string, skill: SkillType) => {
        onAdd(teamId, pid, skill);
    }, [onAdd, teamId]);

    const handleSubtractWrapper = useCallback(() => {
        onSubtract();
    }, [onSubtract]);

    const gestureHandlers = useScoreGestures({
        onAdd: handleAddWrapper,
        onSubtract: handleSubtractWrapper,
        isLocked: isLocked || isInteractionLocked,
        onInteractionStart: handleStart,
        onInteractionEnd: handleEnd
    });

    const resolvedColor = colorTheme || team.color || 'slate';

    const isCritical = isMatchPoint || isSetPoint;

    // Determine halo mode based on game state (memoized for performance)
    const haloMode: HaloMode = useMemo(() => {
        if (isCritical) return 'critical';
        if (isLastScorer) return 'lastScorer';
        if (isServing) return 'serving';
        return 'idle';
    }, [isCritical, isLastScorer, isServing]);

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
