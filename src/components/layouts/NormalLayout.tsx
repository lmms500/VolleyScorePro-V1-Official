import React, { useState, useCallback, useEffect, lazy, Suspense } from 'react';
import { LayoutGroup } from 'framer-motion';
import { useScore, useLog, useRoster } from '../../contexts/GameContext';
import { useModals } from '../../contexts/ModalContext';
import { ScoreCardContainer } from '../containers/ScoreCardContainer';
import { HistoryBar } from '../HistoryBar';
import { Controls } from '../Controls';
import { FEATURE_FLAGS } from '../../constants';
import { TeamId } from '../../types';
import type { GameHandlers } from '../../hooks/useGameHandlers';
import { useHorizontalPages } from '../../hooks/useHorizontalPages';
import { HorizontalPagesContainer } from './HorizontalPagesContainer';
import { PageIndicator } from '../ui/PageIndicator';

// Lazy load CourtPage and @dnd-kit (~30KB saved from initial bundle)
const CourtPage = lazy(() => import('./CourtPage').then(m => ({ default: m.CourtPage })));

interface VoiceState {
    isListening: boolean;
    toggleListening: () => void;
}

interface NormalLayoutProps {
    /** Handlers de interação do jogo (add/sub/undo/swap/reset) */
    handlers: GameHandlers;
    /** Estado de saída do voice control */
    voiceState: VoiceState;
    /** Callback para entrar no modo fullscreen */
    onToggleFullscreen: () => void;
}

/**
 * NormalLayout - Layout padrão do jogo (modo não-fullscreen).
 *
 * Consome contextos internamente:
 * - useScore() → history, setsA, setsB, swappedSides
 * - useRoster() → teamARoster, teamBRoster, canUndo, syncRole, config
 * - useModals() → openModal
 *
 * Estado local:
 * - interactingTeam: previne interação simultânea em ambos os cards
 * - containerWidth: largura medida do container de páginas
 * - courtMounted: lazy-mount da página da quadra
 */
export const NormalLayout: React.FC<NormalLayoutProps> = ({
    handlers,
    voiceState,
    onToggleFullscreen
}) => {
    // --- LOCAL STATE ---
    const [interactingTeam, setInteractingTeam] = useState<TeamId | null>(null);
    const [containerWidth, setContainerWidth] = useState(0);
    const [courtMounted, setCourtMounted] = useState(false);

    // --- CONTEXT CONSUMPTION ---
    const { setsA, setsB, swappedSides } = useScore();
    const { history } = useLog();
    const { teamARoster, teamBRoster, canUndo, syncRole, config } = useRoster();
    const { openModal } = useModals();

    // --- DERIVED STATE ---
    const isSpectator = syncRole === 'spectator';
    const isHost = syncRole === 'host';

    // --- HORIZONTAL PAGES ---
    const {
        pageIndex,
        goToPage,
        offsetX,
        onDragEnd,
        dragConstraints,
        isSwipeLocked,
        lockSwipe,
        unlockSwipe,
        totalPages
    } = useHorizontalPages({ totalPages: 2, containerWidth });

    // Lazy-mount court page on first visit
    useEffect(() => {
        if (pageIndex === 1 && !courtMounted) {
            setCourtMounted(true);
        }
    }, [pageIndex, courtMounted]);

    const handleDragActiveChange = useCallback((isDragging: boolean) => {
        if (isDragging) lockSwipe();
        else unlockSwipe();
    }, [lockSwipe, unlockSwipe]);

    // --- STABLE CALLBACKS (prevent Controls re-renders) ---
    const handleOpenSettings = useCallback(() => openModal('settings'), [openModal]);
    const handleOpenRoster = useCallback(() => openModal('manager'), [openModal]);
    const handleOpenHistory = useCallback(() => openModal('history'), [openModal]);
    const handleOpenReset = useCallback(() => openModal('resetConfirm'), [openModal]);
    const handleOpenLiveSync = useCallback(() => openModal('liveSync'), [openModal]);

    return (
        <div className="relative w-full flex-1 flex flex-col min-h-0 p-2 sm:p-4">
            {/* History Bar */}
            <HistoryBar
                history={history}
                setsA={setsA}
                setsB={setsB}
                colorA={teamARoster.color || 'indigo'}
                colorB={teamBRoster.color || 'rose'}
            />

            {/* Horizontal Pages (Score Cards + Court) */}
            <HorizontalPagesContainer
                offsetX={offsetX}
                onDragEnd={onDragEnd}
                dragConstraints={dragConstraints}
                isSwipeLocked={isSwipeLocked}
                onWidthChange={setContainerWidth}
            >
                {/* Page 0: Score Cards */}
                <LayoutGroup>
                    <div className="flex-1 flex flex-col landscape:flex-row gap-2 sm:gap-4 min-h-0 my-2 sm:my-4 justify-between h-full">
                        <ScoreCardContainer
                            key="card-A"
                            teamId="A"
                            isLocked={interactingTeam === 'B'}
                            swappedSides={swappedSides}
                        />
                        <ScoreCardContainer
                            key="card-B"
                            teamId="B"
                            isLocked={interactingTeam === 'A'}
                            swappedSides={swappedSides}
                        />
                    </div>
                </LayoutGroup>

                {/* Page 1: Tactical Court */}
                {courtMounted ? (
                    <Suspense fallback={<div className="flex items-center justify-center h-full"><div className="text-slate-400 text-sm">Loading court...</div></div>}>
                        <CourtPage onDragActiveChange={handleDragActiveChange} />
                    </Suspense>
                ) : (
                    <div />
                )}
            </HorizontalPagesContainer>

            {/* Page Indicator */}
            <PageIndicator
                totalPages={totalPages}
                currentPage={pageIndex}
                onPageTap={goToPage}
            />

            {/* Controls */}
            <Controls
                onUndo={handlers.handleUndo}
                canUndo={canUndo && !isSpectator}
                onSwap={handlers.handleToggleSides}
                onSettings={handleOpenSettings}
                onRoster={handleOpenRoster}
                onHistory={handleOpenHistory}
                onReset={handleOpenReset}
                onToggleFullscreen={onToggleFullscreen}
                voiceEnabled={config.voiceControlEnabled && !isSpectator}
                isListening={voiceState.isListening}
                onToggleListening={voiceState.toggleListening}
                onLiveSync={
                    FEATURE_FLAGS.ENABLE_LIVE_SYNC
                        ? handleOpenLiveSync
                        : undefined
                }
                syncActive={FEATURE_FLAGS.ENABLE_LIVE_SYNC && (isHost || isSpectator)}
            />
        </div>
    );
};
