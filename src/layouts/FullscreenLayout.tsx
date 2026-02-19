import React, { useState, useCallback } from 'react';
import { LayoutGroup, motion } from 'framer-motion';
import { Minimize2 } from 'lucide-react';
import { useScore, useRoster, useActions } from '@contexts/GameContext';
import { useTimerControls } from '@contexts/TimerContext';
import { useModals } from '@contexts/ModalContext';
import { useHudMeasure } from '@features/game/hooks/useHudMeasure';
import { MeasuredFullscreenHUD } from '@features/game/components/MeasuredFullscreenHUD';
import { FloatingTopBar } from '@features/game/components/FloatingTopBar';
import { FloatingControlBar } from '@features/game/components/FloatingControlBar';
import { FullscreenMenuDrawer } from '@features/game/components/FullscreenMenuDrawer';
import { ScoreCardFullscreen } from '@features/game/components/ScoreCardFullscreen';
import { TeamId } from '@types';
import type { GameHandlers } from '@features/game/hooks/useGameHandlers';

interface VoiceState {
    isListening: boolean;
    toggleListening: () => void;
    startListening?: () => void;
    stopListening?: () => void;
    isPushToTalkMode?: boolean;
}

interface FullscreenLayoutProps {
    /** Handlers de interação do jogo (add/sub/undo/swap/reset) */
    handlers: GameHandlers;
    /** Estado de saída do voice control */
    voiceState: VoiceState;
    /** Callback para sair do modo fullscreen */
    onExitFullscreen: () => void;
}

/**
 * FullscreenLayout - Layout fullscreen do jogo.
 *
 * Consome contextos internamente:
 * - useScore() → scoreA, scoreB, setsA, setsB, currentSet, servingTeam,
 *                isMatchPointA/B, isSetPointA/B, isDeuce, inSuddenDeath,
 *                isTieBreak, swappedSides, timeoutsA/B, lastScorerTeam
 * - useRoster() → teamARoster, teamBRoster, teamAName, teamBName, config,
 *                 canUndo, syncRole
 * - useActions() → setState, setServer, useTimeout
 * - useModals() → activeModal, closeModal, openModal
 *
 * Estado local:
 * - interactingTeam: previne interação simultânea em ambos os cards
 * - scoreElA/B: refs para medição do HUD
 *
 * Hooks internos:
 * - useHudMeasure({ leftScoreEl, rightScoreEl, enabled, maxSets })
 */
export const FullscreenLayout: React.FC<FullscreenLayoutProps> = ({
    handlers,
    voiceState,
    onExitFullscreen
}) => {
    // --- LOCAL STATE ---
    const [interactingTeam, setInteractingTeam] = useState<TeamId | null>(null);
    // --- CONTEXT CONSUMPTION ---
    const {
        scoreA,
        scoreB,
        setsA,
        setsB,
        currentSet,
        servingTeam,
        isMatchPointA,
        isMatchPointB,
        isSetPointA,
        isSetPointB,
        isDeuce,
        inSuddenDeath,
        isTieBreak,
        swappedSides,
        timeoutsA,
        timeoutsB,
        lastScorerTeam
    } = useScore();

    const {
        teamARoster,
        teamBRoster,
        teamAName,
        teamBName,
        config,
        canUndo,
        syncRole
    } = useRoster();

    const { setState, setServer, useTimeout } = useActions();
    const { activeModal, closeModal, openModal } = useModals();

    // --- DERIVED STATE ---
    const isSpectator = syncRole === 'spectator';
    const isLastScorerA = lastScorerTeam === 'A';
    const isLastScorerB = lastScorerTeam === 'B';

    // --- STABLE CALLBACKS (prevent ScoreCardFullscreen re-renders) ---
    const handleInteractionStartA = useCallback(() => setInteractingTeam('A'), []);
    const handleInteractionStartB = useCallback(() => setInteractingTeam('B'), []);
    const handleInteractionEnd = useCallback(() => setInteractingTeam(null), []);
    const handleOpenReset = useCallback(() => openModal('resetConfirm'), [openModal]);
    const handleOpenMenu = useCallback(() => openModal('fsMenu'), [openModal]);
    const handleOpenCourt = useCallback(() => openModal('court'), [openModal]);
    const handleOpenSettings = useCallback(() => openModal('settings'), [openModal]);
    const handleOpenRoster = useCallback(() => openModal('manager'), [openModal]);
    const handleOpenHistory = useCallback(() => openModal('history'), [openModal]);

    // --- HUD MEASUREMENT (anteriormente no GameScreen) ---
    // enabled: não precisa checar isFullscreen (sempre true neste layout)
    const hudPlacement = useHudMeasure({
        enabled: !config.voiceControlEnabled,
        maxSets: config.maxSets
    });

    return (
        <div className="relative z-10 w-full h-full flex flex-col">
            {/* Floating HUD + Controls */}
            <MeasuredFullscreenHUD
                placement={hudPlacement}
                setsLeft={swappedSides ? setsB : setsA}
                setsRight={swappedSides ? setsA : setsB}
                colorLeft={
                    swappedSides
                        ? teamBRoster.color || 'rose'
                        : teamARoster.color || 'indigo'
                }
                colorRight={
                    swappedSides
                        ? teamARoster.color || 'indigo'
                        : teamBRoster.color || 'rose'
                }
            />

            <FloatingTopBar />

            <FloatingControlBar
                onUndo={handlers.handleUndo}
                canUndo={canUndo && !isSpectator}
                onSwap={handlers.handleToggleSides}
                onReset={handleOpenReset}
                onMenu={handleOpenMenu}
                onCourt={handleOpenCourt}
                voiceEnabled={config.voiceControlEnabled && !isSpectator}
                isListening={voiceState.isListening}
                onToggleListening={voiceState.toggleListening}
                onStartListening={voiceState.startListening}
                onStopListening={voiceState.stopListening}
                isPushToTalkMode={voiceState.isPushToTalkMode}
            />

            {/* Exit Button (only visible when menu is closed) */}
            {activeModal !== 'fsMenu' && (
                <button
                    onClick={onExitFullscreen}
                    style={{ touchAction: 'manipulation' }}
                    className="absolute top-4 right-4 z-[80] p-2 rounded-full bg-black/20 dark:bg-white/10 hover:bg-black/40 dark:hover:bg-white/20 backdrop-blur-md text-slate-300 dark:text-slate-400 hover:text-white transition-all active:scale-95 border border-white/10 ring-1 ring-inset ring-white/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]"
                >
                    <Minimize2 size={18} strokeWidth={2} />
                </button>
            )}

            {/* Fullscreen Menu Drawer */}
            <FullscreenMenuDrawer
                isOpen={activeModal === 'fsMenu'}
                onClose={closeModal}
                onOpenSettings={handleOpenSettings}
                onOpenRoster={handleOpenRoster}
                onOpenHistory={handleOpenHistory}
                onExitFullscreen={onExitFullscreen}
            />

            {/* Score Cards */}
            <div className="relative w-full flex-1 flex flex-col justify-center min-h-0 p-0">
                <LayoutGroup>
                    <div className="flex-1 flex flex-col landscape:flex-row gap-2 sm:gap-4 min-h-0 my-2 sm:my-4 items-center justify-center">
                        <motion.div
                            layout
                            transition={{ type: "spring", stiffness: 200, damping: 26, mass: 0.9 }}
                            className="flex-1 min-h-0"
                            style={{ order: swappedSides ? 2 : 1 }}
                        >
                            <ScoreCardFullscreen
                                teamId="A"
                                team={teamARoster}
                                score={scoreA}
                                onAdd={handlers.handleAddA}
                                onSubtract={handlers.handleSubA}
                                isMatchPoint={isMatchPointA}
                                isSetPoint={isSetPointA}
                                colorTheme={teamARoster.color}
                                isLocked={isSpectator || interactingTeam === 'B'}
                                onInteractionStart={handleInteractionStartA}
                                onInteractionEnd={handleInteractionEnd}
                                reverseLayout={swappedSides}

                                isServing={servingTeam === 'A'}
                                isLastScorer={isLastScorerA}
                                config={config}
                            />
                        </motion.div>
                        <motion.div
                            layout
                            transition={{ type: "spring", stiffness: 200, damping: 26, mass: 0.9 }}
                            className="flex-1 min-h-0"
                            style={{ order: swappedSides ? 1 : 2 }}
                        >
                            <ScoreCardFullscreen
                                teamId="B"
                                team={teamBRoster}
                                score={scoreB}
                                onAdd={handlers.handleAddB}
                                onSubtract={handlers.handleSubB}
                                isMatchPoint={isMatchPointB}
                                isSetPoint={isSetPointB}
                                colorTheme={teamBRoster.color}
                                isLocked={isSpectator || interactingTeam === 'A'}
                                onInteractionStart={handleInteractionStartB}
                                onInteractionEnd={handleInteractionEnd}
                                reverseLayout={swappedSides}

                                isServing={servingTeam === 'B'}
                                isLastScorer={isLastScorerB}
                                config={config}
                            />
                        </motion.div>
                    </div>
                </LayoutGroup>
            </div>
        </div>
    );
};
