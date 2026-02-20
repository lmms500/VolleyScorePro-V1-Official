/**
 * GameScreen - Main game interface
 *
 * Compositor puro que orquestra contextos e delega rendering para layouts especializados.
 * Reduzido de 431 linhas (original) → ~100 linhas.
 *
 * Responsabilidades:
 * - Consumir todos os contextos necessários
 * - Invocar hooks de side-effects (timer sync, match lifecycle, etc.)
 * - Gerenciar estado de fullscreen (único estado local)
 * - Renderizar backgrounds, overlays e layout switch
 * - Renderizar modais e notificações (gerenciados por contexts)
 */

import React, { useState, useMemo, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useActions, useScore, useRoster } from '@contexts/GameContext';
import { usePerformance } from '@contexts/PerformanceContext';
import { useNativeIntegration } from '@lib/platform/useNativeIntegration';
import { useImmersiveMode } from '@lib/platform/useImmersiveMode';
import { useVoiceControl } from '@features/voice/hooks/useVoiceControl';
import { useKeepAwake } from '@lib/platform/useKeepAwake';
import { usePerformanceMonitor } from '@hooks/usePerformanceMonitor';
import { FEATURE_FLAGS } from '@config/constants';

// Hooks from refactoring (Part 1)
import { useOnlineStatus } from '@lib/pwa/useOnlineStatus';
import { useAdLifecycle } from '@lib/ads/useAdLifecycle';
import { useMatchLifecycle } from '@features/game/hooks/useMatchLifecycle';
import { useTimerSync } from '@features/broadcast/hooks/useTimerSync';
import { useGameHandlers } from '@features/game/hooks/useGameHandlers';
import { useCombinedGameState } from '@features/game/hooks/useCombinedGameState';
import { useTimeoutContext } from '@contexts/TimeoutContext';

// Layout components (Part 2)
import { GameOverlays } from '@layouts/GameOverlays';
import { NormalLayout } from '@layouts/NormalLayout';
import { FullscreenLayout } from '@layouts/FullscreenLayout';

// UI components
import { SuddenDeathOverlay } from '@ui/CriticalPointAnimation';
import { BackgroundGlow } from '@ui/BackgroundGlow';
import { NotificationToast } from '@ui/NotificationToast';
import { SmartBanner } from '@features/ads/components/SmartBanner';

// Contexts
import { useTranslation } from '@contexts/LanguageContext';
import { useAuth } from '@contexts/AuthContext';
import { useModals } from '@contexts/ModalContext';
import { useNotification } from '@contexts/NotificationContext';

// Other hooks
import { useScoreAnnouncer } from '@features/game/hooks/useScoreAnnouncer';
import { useSensoryFX } from '@features/game/hooks/useSensoryFX';
import { useAdFlow } from '@lib/ads/useAdFlow';
import { useSyncManager } from '@features/broadcast/hooks/useSyncManager';

// Modals
import { ModalManager } from '@features/game/modals/ModalManager';

// Broadcast screen
import { BroadcastScreen } from '@features/broadcast/screens/BroadcastScreen';

export const GameScreen: React.FC = () => {
    // --- CONTEXT CONSUMPTION ---
    const actions = useActions();
    const scoreState = useScore();
    const rosterState = useRoster();

    const { subtractPoint, setServer, useTimeout, toggleSides } = actions;
    const { isMatchActive, inSuddenDeath, isMatchOver, swappedSides } = scoreState;
    const { teamARoster, teamBRoster, config, syncRole } = rosterState;

    // --- ADAPTIVE PERFORMANCE ---
    const { mode: perfMode, downgrade: perfDowngrade } = usePerformance();

    const { t, language } = useTranslation();
    const { user } = useAuth();
    const { openModal, closeModal, activeModal } = useModals();
    const { showNotification, hideNotification } = useNotification();
    const { triggerSupportAd, showAdConfirm, confirmWatchAd, cancelWatchAd, isAdLoading } = useAdFlow();
    const { activeTimeoutTeam } = useTimeoutContext();

    // --- FULLSCREEN STATE (único estado local) ---
    // Moved up to fix TS2448 (used in useAdLifecycle)
    const [isFullscreen, setIsFullscreen] = useState(false);

    // --- COMBINED STATE ---
    const combinedState = useCombinedGameState();

    // --- SIDE-EFFECT HOOKS ---
    const { isOnline } = useOnlineStatus();
    useTimerSync();
    useMatchLifecycle();
    useAdLifecycle(isFullscreen);
    useSensoryFX(combinedState);
    useKeepAwake(isMatchActive);
    useScoreAnnouncer({ state: combinedState, enabled: config.announceScore });

    // Performance Monitoring: triggers adaptive downgrade via PerformanceContext
    usePerformanceMonitor({
        isEnabled: perfMode === 'NORMAL',
        onDowngrade: () => {
            perfDowngrade();
            showNotification({
                mainText: 'Performance Optimized',
                subText: 'Visual quality reduced automatically.',
                type: 'info',
                systemIcon: 'save'
            });
        }
    });

    // Native integration
    const anyModalOpen = activeModal !== 'none' || !!activeTimeoutTeam;
    useNativeIntegration(isMatchActive, isFullscreen, closeModal, anyModalOpen);

    // Immersive Mode Control
    const shouldBeImmersive = isFullscreen || activeModal === 'court';
    useImmersiveMode(shouldBeImmersive);

    // --- GAME HANDLERS ---
    const handlers = useGameHandlers(triggerSupportAd);
    const {
        handleAddPoint: handleAddPointGeneric,
        handleResetWithAd,
        handleNextGame
    } = handlers;

    // --- SYNC MANAGER ---
    const {
        isBroadcastMode,
        isHost,
        isSpectator
    } = useSyncManager();

    // --- VOICE CONTROL ---
    const {
        isListening,
        toggleListening,
        startListening,
        stopListening,
        pendingIntent,
        confirmPendingIntent,
        cancelPendingIntent,
        domainConflict,
        resolveDomainConflict,
        cancelDomainConflict,
        visualFeedback,
        commandHistory,
    } = useVoiceControl({
        enabled: config.voiceControlEnabled && !isSpectator,
        pushToTalkMode: config.pushToTalkMode ?? false,
        enablePlayerStats: config.enablePlayerStats,
        onAddPoint: handleAddPointGeneric,
        onSubtractPoint: (team) => {
            if (isSpectator) return;
            subtractPoint(team);
        },
        onUndo: handlers.handleUndo,
        onThinkingState: () => { },
        onTimeout: (team) => useTimeout(team),
        onSetServer: (team) => setServer(team),
        onSwapSides: () => toggleSides(),
        language,
        teamAName: rosterState.teamAName,
        teamBName: rosterState.teamBName,
        playersA: teamARoster.players,
        playersB: teamBRoster.players,
        servingTeam: scoreState.servingTeam,
        lastScorerTeam: scoreState.lastScorerTeam,
        scoreA: scoreState.scoreA,
        scoreB: scoreState.scoreB,
        currentSet: scoreState.currentSet,
        isMatchOver: scoreState.isMatchOver,
        showNotification,
        hideNotification,
        colorA: teamARoster.color || 'indigo',
        colorB: teamBRoster.color || 'rose',
    });

    // Stable callbacks for fullscreen toggle (prevent layout re-renders)
    const handleExitFullscreen = useCallback(() => setIsFullscreen(false), []);
    const handleEnterFullscreen = useCallback(() => setIsFullscreen(true), []);

    // Voice state object (passed to layouts) - MEMOIZED to prevent re-renders
    const voiceState = useMemo(() => ({
        isListening,
        toggleListening,
        startListening,
        stopListening,
        pendingIntent,
        confirmPendingIntent,
        cancelPendingIntent,
        domainConflict,
        resolveDomainConflict,
        cancelDomainConflict,
        visualFeedback,
        commandHistory,
        isPushToTalkMode: config.pushToTalkMode ?? false,
    }), [
        isListening, toggleListening, startListening, stopListening,
        pendingIntent, confirmPendingIntent, cancelPendingIntent,
        domainConflict, resolveDomainConflict, cancelDomainConflict,
        visualFeedback, commandHistory, config.pushToTalkMode,
    ]);

    // --- EARLY RETURN: Broadcast Mode ---
    if (isBroadcastMode) {
        return <BroadcastScreen state={combinedState} />;
    }

    // --- RENDER ---
    return (
        <div
            className={`relative w-full h-[100dvh] bg-transparent overflow-hidden select-none touch-none flex flex-col ${isFullscreen
                ? ''
                : 'pt-safe-top pb-safe-bottom pl-safe-left pr-safe-right'
                }`}
        >
            {/* Content Wrapper - Takes remaining space and pushes banner down */}
            <div className="relative flex-1 w-full min-h-0">
                {/* Background Effects */}
                <BackgroundGlow
                    isSwapped={swappedSides}
                    isFullscreen={isFullscreen}
                    colorA={teamARoster.color}
                    colorB={teamBRoster.color}
                />
                <SuddenDeathOverlay
                    active={inSuddenDeath && !isMatchOver}
                />

                {/* Overlays (offline, timeout, live sync) */}
                <GameOverlays isOnline={isOnline} isFullscreen={isFullscreen} />

                {/* Layout Switch — Direct conditional render (NO AnimatePresence).
                    AnimatePresence mode="wait" was causing phantom fullscreen:
                    re-renders during the 200ms exit animation could restart the cycle,
                    trapping the content at opacity:0 while BackgroundGlow (portal) stayed visible.
                    Simple conditional is robust and instant. */}
                {isFullscreen ? (
                    <div className="absolute inset-0 w-full h-full flex flex-col z-[1]">
                        <FullscreenLayout
                            handlers={handlers}
                            voiceState={voiceState}
                            onExitFullscreen={handleExitFullscreen}
                        />
                    </div>
                ) : (
                    <div className="absolute inset-0 w-full h-full flex flex-col z-[1]">
                        <NormalLayout
                            handlers={handlers}
                            voiceState={voiceState}
                            onToggleFullscreen={handleEnterFullscreen}
                        />
                    </div>
                )}

                {/* Modal Manager - Inside Content Wrapper so it covers content but potentially not ads? 
                    Actually, modals usually cover EVERYTHING. Let's keep it here for now as z-index should handle it.
                 */}
                <ModalManager
                    handleNextGame={handleNextGame}
                    handleResetGame={handleResetWithAd}
                    showAdConfirm={showAdConfirm}
                    confirmWatchAd={confirmWatchAd}
                    cancelWatchAd={cancelWatchAd}
                    isAdLoading={isAdLoading}
                />

                {/* Notification Toast */}
                <NotificationToast
                    isFullscreen={isFullscreen}
                />
            </div>

            {/* Smart Banner - Fixed at bottom, outside content wrapper */}
            {/* It will naturally sit at the bottom of the flex-col container */}
            <SmartBanner isVisible={!isFullscreen && !config.adsRemoved} />
        </div>
    );
};
