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

import React, { useState } from 'react';
import { AnimatePresence, motion, LayoutGroup } from 'framer-motion';
import { useActions, useScore, useRoster } from '../contexts/GameContext';
import { useNativeIntegration } from '../hooks/useNativeIntegration';
import { useImmersiveMode } from '../hooks/useImmersiveMode';
import { useVoiceControl } from '../hooks/useVoiceControl';
import { useKeepAwake } from '../hooks/useKeepAwake';
import { usePerformanceMonitor } from '../hooks/usePerformanceMonitor';
import { FEATURE_FLAGS } from '../constants';

// Hooks from refactoring (Part 1)
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { useAdLifecycle } from '../hooks/useAdLifecycle';
import { useMatchLifecycle } from '../hooks/useMatchLifecycle';
import { useTimerSync } from '../hooks/useTimerSync';
import { useGameHandlers } from '../hooks/useGameHandlers';
import { useCombinedGameState } from '../hooks/useCombinedGameState';
import { useTimeoutContext } from '../contexts/TimeoutContext';

// Layout components (Part 2)
import { GameOverlays } from '../components/layouts/GameOverlays';
import { NormalLayout } from '../components/layouts/NormalLayout';
import { FullscreenLayout } from '../components/layouts/FullscreenLayout';

// UI components
import { SuddenDeathOverlay } from '../components/ui/CriticalPointAnimation';
import { BackgroundGlow } from '../components/ui/BackgroundGlow';
import { NotificationToast } from '../components/ui/NotificationToast';
import { SmartBanner } from '../components/Ads/SmartBanner';

// Contexts
import { useTranslation } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useModals } from '../contexts/ModalContext';
import { useNotification } from '../contexts/NotificationContext';

// Other hooks
import { useScoreAnnouncer } from '../hooks/useScoreAnnouncer';
import { useSensoryFX } from '../hooks/useSensoryFX';
import { useAdFlow } from '../hooks/useAdFlow';
import { useSyncManager } from '../hooks/useSyncManager';

// Modals
import { ModalManager } from '../components/modals/ModalManager';

// Broadcast screen
import { BroadcastScreen } from './BroadcastScreen';

export const GameScreen: React.FC = () => {
    // --- CONTEXT CONSUMPTION ---
    const actions = useActions();
    const scoreState = useScore();
    const rosterState = useRoster();

    const { subtractPoint, setServer, useTimeout, applySettings } = actions;
    const { isMatchActive, inSuddenDeath, isMatchOver, swappedSides } = scoreState;
    const { teamARoster, teamBRoster, config, syncRole } = rosterState;

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

    // Performance Monitoring
    usePerformanceMonitor({
        isEnabled: !config.lowGraphics,
        onDowngrade: () => {
            applySettings({ ...config, lowGraphics: true }, false);
            showNotification({
                mainText: 'Performance Optimized',
                subText: 'Low Graphics enabled automatically.',
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
    const { isListening, toggleListening } = useVoiceControl({
        enabled: config.voiceControlEnabled && !isSpectator,
        enablePlayerStats: config.enablePlayerStats,
        onAddPoint: handleAddPointGeneric,
        onSubtractPoint: (team) => {
            if (isSpectator) return;
            subtractPoint(team);
        },
        onUndo: handlers.handleUndo,
        onThinkingState: (thinking) =>
            thinking
                ? showNotification({
                    mainText: t('notifications.thinking'),
                    type: 'info',
                    subText: t('notifications.aiProcessing'),
                    systemIcon: 'mic'
                })
                : hideNotification(),
        onTimeout: (team) => useTimeout(team),
        onSetServer: (team) => setServer(team),
        language,
        teamAName: rosterState.teamAName,
        teamBName: rosterState.teamBName,
        playersA: teamARoster.players,
        playersB: teamBRoster.players,
        servingTeam: scoreState.servingTeam
    });

    // Voice state object (passed to layouts)
    const voiceState = { isListening, toggleListening };

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
                    lowPowerMode={config.lowGraphics}
                />
                <SuddenDeathOverlay
                    active={inSuddenDeath && !isMatchOver}
                    lowGraphics={config.lowGraphics}
                />

                {/* Overlays (offline, timeout, live sync) */}
                <GameOverlays isOnline={isOnline} isFullscreen={isFullscreen} />

                {/* Layout Switch */}
                {/* Layout Switch - SIMPLIFIED FOR DEBUGGING */}
                {isFullscreen ? (
                    <div className="absolute inset-0 w-full h-full z-50 bg-black/50">
                        <FullscreenLayout
                            handlers={handlers}
                            voiceState={voiceState}
                            onExitFullscreen={() => setIsFullscreen(false)}
                        />
                    </div>
                ) : (
                    <div className="absolute inset-0 w-full h-full flex flex-col z-0">
                        <NormalLayout
                            handlers={handlers}
                            voiceState={voiceState}
                            onToggleFullscreen={() => setIsFullscreen(true)}
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
