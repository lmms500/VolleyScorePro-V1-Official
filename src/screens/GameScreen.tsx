/**
 * GameScreen - Main game interface
 *
 * Extracted from App.tsx to simplify the root component.
 * Contains all game UI logic, state consumption, and rendering.
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useActions, useScore, useRoster } from '../contexts/GameContext';
import { useNativeIntegration } from '../hooks/useNativeIntegration';
import { useVoiceControl } from '../hooks/useVoiceControl';
import { useKeepAwake } from '../hooks/useKeepAwake';
import { usePerformanceMonitor } from '../hooks/usePerformanceMonitor';
import { FEATURE_FLAGS } from '../constants';

import { ScoreCardContainer } from '../components/containers/ScoreCardContainer';
import { ScoreCardFullscreen } from '../components/ScoreCardFullscreen';
import { HistoryBar } from '../components/HistoryBar';
import { Controls } from '../components/Controls';
import { MeasuredFullscreenHUD } from '../components/MeasuredFullscreenHUD';
import { FloatingControlBar } from '../components/Fullscreen/FloatingControlBar';
import { FloatingTopBar } from '../components/Fullscreen/FloatingTopBar';
import { FullscreenMenuDrawer } from '../components/Fullscreen/FullscreenMenuDrawer';
import { SuddenDeathOverlay } from '../components/ui/CriticalPointAnimation';
import { BackgroundGlow } from '../components/ui/BackgroundGlow';
import { NotificationToast } from '../components/ui/NotificationToast';
import { useTranslation } from '../contexts/LanguageContext';
import { useHudMeasure } from '../hooks/useHudMeasure';
import { useGameAudio } from '../hooks/useGameAudio';
import { useHaptics } from '../hooks/useHaptics';
import { useScoreAnnouncer } from '../hooks/useScoreAnnouncer';
import { TeamId, SkillType, GameState } from '../types';
import { Minimize2, Radio, WifiOff } from 'lucide-react';
import { useTimerControls, useTimerValue } from '../contexts/TimerContext';
import { useAuth } from '../contexts/AuthContext';
import { LayoutGroup, motion, AnimatePresence } from 'framer-motion';
import { useSensoryFX } from '../hooks/useSensoryFX';
import { setGlobalReducedMotion } from '../utils/animations';
import { BroadcastScreen } from './BroadcastScreen';
import { TimeoutOverlay } from '../components/Fullscreen/TimeoutOverlay';
import { FloatingTimeout } from '../components/ui/FloatingTimeout';

import { adService } from '../services/AdService';
import { SmartBanner } from '../components/Ads/SmartBanner';
import { useAdFlow } from '../hooks/useAdFlow';

import { useModals } from '../contexts/ModalContext';
import { useNotification } from '../contexts/NotificationContext';
import { ModalManager } from '../components/modals/ModalManager';
import { useTimeoutManager } from '../hooks/useTimeoutManager';
import { useSyncManager } from '../hooks/useSyncManager';

export const GameScreen: React.FC = () => {
    // --- SPLIT CONTEXT CONSUMPTION ---
    const actions = useActions();
    const scoreState = useScore();
    const rosterState = useRoster();

    // Destructure actions
    const { addPoint, subtractPoint, setServer, useTimeout, undo, toggleSides, rotateTeams, resetMatch, setState, substitutePlayers, applySettings } = actions;

    // Destructure score state
    const { scoreA, scoreB, setsA, setsB, currentSet, servingTeam, isMatchOver, timeoutsA, timeoutsB, inSuddenDeath, isTimerRunning, swappedSides, history, isMatchActive, isMatchPointA, isMatchPointB, isSetPointA, isSetPointB, isDeuce, isTieBreak, matchLog, matchDurationSeconds } = scoreState;

    // Destructure roster state
    const { teamARoster, teamBRoster, teamAName, teamBName, config, syncRole, sessionId, canUndo } = rosterState;

    // Combined state for hooks that expect full GameState
    const combinedState = useMemo(() => ({
        ...scoreState,
        ...rosterState
    } as unknown as GameState), [scoreState, rosterState]);

    const { t, language } = useTranslation();
    const timer = useTimerControls();
    const { user } = useAuth();
    const { openModal, closeModal, closeAll, activeModal } = useModals();
    const { showNotification, state: notifyState, hideNotification } = useNotification();
    const { triggerSupportAd, showAdConfirm, confirmWatchAd, cancelWatchAd, isAdLoading } = useAdFlow();

    // Performance Monitoring
    usePerformanceMonitor({
        isEnabled: !config.lowGraphics,
        onDowngrade: () => {
            applySettings({ ...config, lowGraphics: true }, false);
            showNotification({
                mainText: "Performance Optimized",
                subText: "Low Graphics enabled automatically.",
                type: 'info',
                systemIcon: 'save'
            });
        }
    });

    // Timeout Manager
    const {
        activeTimeoutTeam,
        timeoutSeconds,
        isTimeoutMinimized,
        startTimeout,
        stopTimeout,
        minimizeTimeout,
        maximizeTimeout,
        handleTimeoutUndo,
        handleTacticalBoard
    } = useTimeoutManager({
        timeoutsA,
        timeoutsB,
        activeModal,
        undo,
        t,
        showNotification,
        openModal
    });

    // Online status
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    useEffect(() => {
        const hOnline = () => setIsOnline(true);
        const hOffline = () => setIsOnline(false);
        window.addEventListener('online', hOnline);
        window.addEventListener('offline', hOffline);
        return () => {
            window.removeEventListener('online', hOnline);
            window.removeEventListener('offline', hOffline);
        };
    }, []);

    // Sync Manager
    const {
        isBroadcastMode,
        isHost,
        isSpectator,
        handleHostSession,
        handleJoinSession,
        handleStopBroadcast,
        handleLeaveSession
    } = useSyncManager({
        combinedState,
        setState,
        syncRole,
        sessionId,
        user,
        t,
        showNotification,
        activeTimeoutTeam,
        timeoutSeconds,
        isTimeoutMinimized,
        startTimeout,
        stopTimeout,
        minimizeTimeout,
        maximizeTimeout,
        isMatchOver,
        activeModal,
        openModal
    });

    // UI State
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [interactingTeam, setInteractingTeam] = useState<TeamId | null>(null);
    const [scoreElA, setScoreElA] = useState<HTMLElement | null>(null);
    const [scoreElB, setScoreElB] = useState<HTMLElement | null>(null);

    const audio = useGameAudio(config);
    const haptics = useHaptics(true);

    const anyModalOpen = activeModal !== 'none' || !!activeTimeoutTeam;
    useNativeIntegration(isMatchActive, isFullscreen, closeModal, anyModalOpen);

    // Timer sync effects
    useEffect(() => {
        if (isTimerRunning && !timer.isRunning) timer.start();
        else if (!isTimerRunning && timer.isRunning) timer.stop();
    }, [isTimerRunning, timer]);

    const timerValue = useTimerValue();
    useEffect(() => {
        if (isMatchActive && timerValue.seconds !== matchDurationSeconds) {
            setState({ type: 'SET_MATCH_DURATION', duration: timerValue.seconds });
        }
    }, [timerValue.seconds, isMatchActive, matchDurationSeconds]);

    useEffect(() => {
        if (scoreA === 0 && scoreB === 0 && setsA === 0 && setsB === 0 && history.length === 0) {
            timer.reset();
        }
    }, [scoreA, scoreB, setsA, setsB, history.length, timer]);

    useEffect(() => {
        if (isMatchOver) closeAll();
    }, [isMatchOver, closeAll]);

    // Effects
    useSensoryFX(combinedState);
    useKeepAwake(isMatchActive);

    useEffect(() => {
        adService.initialize();
    }, []);

    useEffect(() => {
        if (!isFullscreen && !config.adsRemoved) adService.showBanner();
        else adService.hideBanner();
    }, [isFullscreen, config.adsRemoved]);

    useEffect(() => {
        setGlobalReducedMotion(config.reducedMotion);
    }, [config.reducedMotion]);

    useScoreAnnouncer({ state: combinedState, enabled: config.announceScore });

    // Handlers
    const handleAddPointGeneric = useCallback((teamId: TeamId, playerId?: string, skill?: SkillType) => {
        if (isSpectator) return;
        const metadata = (playerId && playerId !== 'unknown') ? { playerId, skill: skill || 'generic' } : undefined;
        audio.playTap();
        addPoint(teamId, metadata);
        const team = teamId === 'A' ? teamARoster : teamBRoster;
        const color = team.color || (teamId === 'A' ? 'indigo' : 'rose');
        let mainText = team.name;
        if (skill === 'opponent_error') mainText = t('scout.skills.opponent_error');
        else if (playerId && playerId !== 'unknown') {
            const player = team.players.find(p => p.id === playerId) || team.reserves?.find(p => p.id === playerId);
            if (player) mainText = player.name;
        }
        showNotification({ type: 'success', mainText, subText: t('notifications.forTeam', { teamName: team.name }), skill, color });
    }, [addPoint, audio, teamARoster, teamBRoster, t, isSpectator, showNotification]);

    // Stable handlers for ScoreCardFullscreen to avoid re-renders
    const handleAddA = useCallback((_tid: TeamId, pid?: string, sk?: SkillType) => {
        handleAddPointGeneric('A', pid, sk);
    }, [handleAddPointGeneric]);

    const handleAddB = useCallback((_tid: TeamId, pid?: string, sk?: SkillType) => {
        handleAddPointGeneric('B', pid, sk);
    }, [handleAddPointGeneric]);

    const handleSubA = useCallback(() => {
        subtractPoint('A');
    }, [subtractPoint]);

    const handleSubB = useCallback(() => {
        subtractPoint('B');
    }, [subtractPoint]);

    const handleUndo = useCallback(() => {
        if (isSpectator) return;
        undo();
        audio.playUndo(); haptics.impact('medium');
        showNotification({ type: 'info', mainText: t('notifications.actionUndone'), subText: t('notifications.actionUndoneSub'), systemIcon: 'undo' });
    }, [undo, audio, haptics, t, isSpectator, showNotification]);

    const handleToggleSides = useCallback(() => {
        if (isSpectator) return;
        toggleSides();
        showNotification({ type: 'info', mainText: t('notifications.sidesSwapped'), subText: t('notifications.sidesSwappedSub'), systemIcon: 'transfer' });
    }, [toggleSides, t, isSpectator, showNotification]);

    const performReset = useCallback(() => {
        resetMatch();
    }, [resetMatch]);

    const handleResetWithAd = useCallback(() => {
        if (config.adsRemoved) {
            performReset();
        } else {
            triggerSupportAd(performReset);
        }
    }, [config.adsRemoved, triggerSupportAd, performReset]);

    const handleNextGame = useCallback(() => {
        if (config.adsRemoved) rotateTeams();
        else triggerSupportAd(() => rotateTeams());
    }, [config.adsRemoved, triggerSupportAd, rotateTeams]);

    const { isListening, toggleListening } = useVoiceControl({
        enabled: config.voiceControlEnabled && !isSpectator,
        enablePlayerStats: config.enablePlayerStats,
        onAddPoint: handleAddPointGeneric,
        onSubtractPoint: (team: TeamId) => { if (isSpectator) return; subtractPoint(team); },
        onUndo: handleUndo,
        onThinkingState: (thinking) => thinking ? showNotification({ mainText: t('notifications.thinking'), type: 'info', subText: t('notifications.aiProcessing'), systemIcon: 'mic' }) : hideNotification(),
        onTimeout: (team: TeamId) => useTimeout(team),
        onSetServer: (team: TeamId) => setServer(team),
        language, teamAName, teamBName, playersA: teamARoster.players, playersB: teamBRoster.players, servingTeam
    });

    const hudPlacement = useHudMeasure({ leftScoreEl: scoreElA, rightScoreEl: scoreElB, enabled: isFullscreen && !config.voiceControlEnabled, maxSets: config.maxSets });

    // Broadcast mode
    if (isBroadcastMode) {
        return <BroadcastScreen state={combinedState} />;
    }

    // Normal mode cards - always same order, swap handled via CSS order
    const normalCards = (
        <>
            <ScoreCardContainer key="card-A" teamId="A" isLocked={interactingTeam === 'B'} swappedSides={swappedSides} />
            <ScoreCardContainer key="card-B" teamId="B" isLocked={interactingTeam === 'A'} swappedSides={swappedSides} />
        </>
    );

    return (
        <div className={`relative w-full h-[100dvh] bg-slate-50 dark:bg-[#020617] overflow-hidden select-none touch-none flex flex-col ${isFullscreen ? '' : 'pt-safe-top pb-safe-bottom pl-safe-left pr-safe-right'}`}>
            <BackgroundGlow isSwapped={swappedSides} isFullscreen={isFullscreen} colorA={teamARoster.color} colorB={teamBRoster.color} lowPowerMode={config.lowGraphics} />
            <SuddenDeathOverlay active={inSuddenDeath} />

            {/* Offline indicator */}
            <AnimatePresence>
                {!isOnline && (
                    <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -50, opacity: 0 }} className="fixed top-2 left-1/2 -translate-x-1/2 z-[110] px-4 py-1.5 bg-rose-600 text-white rounded-full flex items-center gap-2 shadow-2xl border border-white/20 backdrop-blur-md">
                        <WifiOff size={14} strokeWidth={3} /><span className="text-[10px] font-black uppercase tracking-widest">{t('status.offline')}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Timeout overlay */}
            <AnimatePresence>
                {activeTimeoutTeam && !isTimeoutMinimized && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100]"
                    >
                        <TimeoutOverlay
                            team={activeTimeoutTeam === 'A' ? teamARoster : teamBRoster}
                            teamId={activeTimeoutTeam}
                            secondsLeft={timeoutSeconds}
                            onResume={stopTimeout}
                            onUndo={handleTimeoutUndo}
                            onTactical={handleTacticalBoard}
                            onMinimize={minimizeTimeout}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Minimized timeout */}
            <AnimatePresence>
                {isTimeoutMinimized && activeTimeoutTeam && (
                    <FloatingTimeout
                        secondsLeft={timeoutSeconds}
                        color={activeTimeoutTeam === 'A' ? teamARoster.color || 'indigo' : teamBRoster.color || 'rose'}
                        onMaximize={maximizeTimeout}
                    />
                )}
            </AnimatePresence>

            {/* Live sync indicator */}
            {FEATURE_FLAGS.ENABLE_LIVE_SYNC && (isHost || isSpectator) && (
                <button
                    onClick={() => openModal('liveSync')}
                    className="fixed top-2 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-1 pointer-events-auto"
                >
                    <div className={`px-3 py-1 rounded-full flex items-center gap-2 backdrop-blur-md border transition-all hover:scale-105 active:scale-95 ${isHost ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-500 hover:bg-indigo-500/20 hover:border-indigo-500/40' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500 shadow-lg shadow-emerald-500/10 hover:bg-emerald-500/20 hover:border-emerald-500/40'}`}>
                        <Radio size={12} className="animate-pulse" /><span className="text-[10px] font-black uppercase tracking-[0.2em]">{isHost ? `${t('status.broadcasting')}: ${sessionId}` : `${t('status.live')}: ${sessionId}`}</span>
                    </div>
                </button>
            )}

            {/* Fullscreen HUD */}
            {isFullscreen && (
                <>
                    <MeasuredFullscreenHUD placement={hudPlacement} setsLeft={swappedSides ? setsB : setsA} setsRight={swappedSides ? setsA : setsB} colorLeft={swappedSides ? teamBRoster.color : teamARoster.color || 'indigo'} colorRight={swappedSides ? teamARoster.color : teamBRoster.color || 'rose'} />
                    <FloatingTopBar currentSet={currentSet} isTieBreak={isTieBreak} onToggleTimer={() => setState({ type: 'TOGGLE_TIMER' })} onResetTimer={() => setState({ type: 'RESET_TIMER' })} isTimerRunning={isTimerRunning} teamNameA={teamAName} teamNameB={teamBName} teamLogoA={teamARoster.logo} teamLogoB={teamBRoster.logo} colorA={teamARoster.color || 'indigo'} colorB={teamBRoster.color || 'rose'} isServingLeft={servingTeam === (swappedSides ? 'B' : 'A')} isServingRight={servingTeam === (swappedSides ? 'A' : 'B')} onSetServerA={() => setServer('A')} onSetServerB={() => setServer('B')} timeoutsA={timeoutsA} timeoutsB={timeoutsB} onTimeoutA={() => useTimeout('A')} onTimeoutB={() => useTimeout('B')} isMatchPointA={isMatchPointA} isSetPointA={isSetPointA} isMatchPointB={isMatchPointB} isSetPointB={isSetPointB} isDeuce={isDeuce} inSuddenDeath={inSuddenDeath} reverseLayout={swappedSides} />
                    <FloatingControlBar onUndo={handleUndo} canUndo={canUndo && !isSpectator} onSwap={handleToggleSides} onReset={() => openModal('resetConfirm')} onMenu={() => openModal('fsMenu')} onCourt={() => openModal('court')} voiceEnabled={config.voiceControlEnabled && !isSpectator} isListening={isListening} onToggleListening={toggleListening} />
                    <button onClick={() => setIsFullscreen(false)} className="absolute top-4 right-4 z-[60] p-2 rounded-full bg-black/20 dark:bg-white/10 hover:bg-black/40 dark:hover:bg-white/20 backdrop-blur-md text-slate-300 dark:text-slate-400 hover:white transition-all active:scale-95 border border-white/5"><Minimize2 size={18} strokeWidth={2} /></button>
                    <FullscreenMenuDrawer
                        isOpen={activeModal === 'fsMenu'}
                        onClose={closeModal}
                        onOpenSettings={() => openModal('settings')}
                        onOpenRoster={() => openModal('manager')}
                        onOpenHistory={() => openModal('history')}
                        onExitFullscreen={() => setIsFullscreen(false)}
                    />
                </>
            )}

            {/* Main content */}
            <div className={`relative w-full flex-1 flex flex-col min-h-0 ${isFullscreen ? 'p-0' : 'p-2 sm:p-4'}`}>
                {!isFullscreen && <HistoryBar history={history} setsA={setsA} setsB={setsB} colorA={teamARoster.color || 'indigo'} colorB={teamBRoster.color || 'rose'} />}
                <LayoutGroup>
                    <div className={`flex-1 flex flex-col landscape:flex-row gap-2 sm:gap-4 min-h-0 my-2 sm:my-4 justify-between`}>
                        {isFullscreen ? (
                            <>
                                <ScoreCardFullscreen teamId="A" team={teamARoster} score={scoreA} onAdd={handleAddA} onSubtract={handleSubA} isMatchPoint={isMatchPointA} isSetPoint={isSetPointA} isDeuce={isDeuce} inSuddenDeath={inSuddenDeath} colorTheme={teamARoster.color} isLocked={isSpectator || interactingTeam === 'B'} onInteractionStart={() => setInteractingTeam('A')} onInteractionEnd={() => setInteractingTeam(null)} reverseLayout={swappedSides} scoreRefCallback={setScoreElA} isServing={servingTeam === 'A'} config={config} />
                                <ScoreCardFullscreen teamId="B" team={teamBRoster} score={scoreB} onAdd={handleAddB} onSubtract={handleSubB} isMatchPoint={isMatchPointB} isSetPoint={isSetPointB} isDeuce={isDeuce} inSuddenDeath={inSuddenDeath} colorTheme={teamBRoster.color} isLocked={isSpectator || interactingTeam === 'A'} onInteractionStart={() => setInteractingTeam('B')} onInteractionEnd={() => setInteractingTeam(null)} reverseLayout={swappedSides} scoreRefCallback={setScoreElB} isServing={servingTeam === 'B'} config={config} />
                            </>
                        ) : (normalCards)}
                    </div>
                </LayoutGroup>
                {!isFullscreen && <Controls onUndo={handleUndo} canUndo={canUndo && !isSpectator} onSwap={handleToggleSides} onSettings={() => openModal('settings')} onRoster={() => openModal('manager')} onHistory={() => openModal('history')} onReset={() => openModal('resetConfirm')} onToggleFullscreen={() => setIsFullscreen(!isFullscreen)} voiceEnabled={config.voiceControlEnabled && !isSpectator} isListening={isListening} onToggleListening={toggleListening} onLiveSync={FEATURE_FLAGS.ENABLE_LIVE_SYNC ? () => openModal('liveSync') : undefined} syncActive={FEATURE_FLAGS.ENABLE_LIVE_SYNC && (isHost || isSpectator)} />}
            </div>

            <SmartBanner isVisible={!isFullscreen && !config.adsRemoved} />

            <ModalManager
                handleNextGame={handleNextGame}
                handleResetGame={handleResetWithAd}
                handleHostSession={handleHostSession}
                handleJoinSession={handleJoinSession}
                handleStopBroadcast={handleStopBroadcast}
                handleLeaveSession={handleLeaveSession}
                handleSubstitution={substitutePlayers}
                handleShowToast={showNotification}
                showAdConfirm={showAdConfirm}
                confirmWatchAd={confirmWatchAd}
                cancelWatchAd={cancelWatchAd}
                isAdLoading={isAdLoading}
            />

            <NotificationToast key={notifyState.timestamp} visible={notifyState.visible} type={notifyState.type} mainText={notifyState.mainText} subText={notifyState.subText} teamColor={notifyState.color} skill={notifyState.skill} onClose={hideNotification} isFullscreen={isFullscreen} systemIcon={notifyState.systemIcon} onUndo={notifyState.onUndo} />
        </div>
    );
};
