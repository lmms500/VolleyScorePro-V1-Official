import { useState, useEffect, useCallback } from 'react';
import { FEATURE_FLAGS } from '../constants';
import { SyncEngine } from '../services/SyncEngine';
import { useTimeoutSync } from './useTimeoutSync';
import { useRemoteTimeoutSync } from './useRemoteTimeoutSync';
import { GameState, TeamId } from '../types';

interface SyncManagerDeps {
    combinedState: GameState;
    setState: (action: { type: string; payload?: unknown; role?: string; sessionId?: string; duration?: number }) => void;
    syncRole: 'host' | 'spectator' | null;
    sessionId: string | null;
    user: { uid: string } | null;
    t: (key: string, params?: Record<string, unknown>) => string;
    showNotification: (opts: { mainText: string; type: string; subText?: string; systemIcon?: string }) => void;
    // Timeout controls for remote sync
    activeTimeoutTeam: TeamId | null;
    timeoutSeconds: number;
    isTimeoutMinimized: boolean;
    startTimeout: (team: TeamId, initialSeconds?: number) => void;
    stopTimeout: () => void;
    minimizeTimeout: () => void;
    maximizeTimeout: () => void;
    // Modal state for spectator auto-open
    isMatchOver: boolean;
    activeModal: string;
    openModal: (modal: string) => void;
}

interface SyncManagerReturn {
    isBroadcastMode: boolean;
    isHost: boolean;
    isSpectator: boolean;
    handleHostSession: (code: string) => Promise<void>;
    handleJoinSession: (code: string) => void;
    handleStopBroadcast: () => Promise<void>;
    handleLeaveSession: () => void;
}

/**
 * useSyncManager - Encapsula toda lógica de VolleyLink Live Sync
 *
 * Responsabilidades:
 * - Detecta modo broadcast via URL params
 * - Gerencia host/spectator sessions
 * - Broadcast state para spectators
 * - Sync timeout state com host/spectators
 * - Auto-open match over modal para spectators
 */
export function useSyncManager(deps: SyncManagerDeps): SyncManagerReturn {
    const {
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
    } = deps;

    const [isBroadcastMode, setIsBroadcastMode] = useState(false);

    const isHost = syncRole === 'host';
    const isSpectator = syncRole === 'spectator';

    // Detect broadcast mode from URL params
    useEffect(() => {
        if (!FEATURE_FLAGS.ENABLE_LIVE_SYNC) return;

        const params = new URLSearchParams(window.location.search);
        if (params.get('mode') === 'broadcast') {
            setIsBroadcastMode(true);
            const sessionCode = params.get('code');
            if (sessionCode) {
                SyncEngine.getInstance().subscribeToMatch(sessionCode, (remoteState) => {
                    setState({ type: 'LOAD_STATE', payload: { ...remoteState, syncRole: 'spectator', sessionId: sessionCode } });
                });
            }
        }
    }, [setState]);

    // Host: Start broadcasting a match
    const handleHostSession = useCallback(async (code: string) => {
        if (!FEATURE_FLAGS.ENABLE_LIVE_SYNC || !user) return;

        await SyncEngine.getInstance().hostMatch(code, user.uid, combinedState);
        setState({ type: 'SET_SYNC_ROLE', role: 'host', sessionId: code });
        showNotification({ mainText: t('liveSync.hosting', { code }), type: 'success', subText: t('liveSync.hostingSub'), systemIcon: 'mic' });
    }, [user, combinedState, setState, t, showNotification]);

    // Spectator: Join an existing session
    const handleJoinSession = useCallback((code: string) => {
        if (!FEATURE_FLAGS.ENABLE_LIVE_SYNC) return;

        setState({ type: 'SET_SYNC_ROLE', role: 'spectator', sessionId: code });
        SyncEngine.getInstance().subscribeToMatch(code, (remoteState) => {
            setState({ type: 'LOAD_STATE', payload: { ...remoteState, syncRole: 'spectator', sessionId: code } });
        });
        showNotification({ mainText: t('liveSync.connected', { code }), type: 'info', subText: t('liveSync.watchTitle'), systemIcon: 'mic' });
    }, [setState, t, showNotification]);

    // Host: Stop broadcasting
    const handleStopBroadcast = useCallback(async () => {
        if (!FEATURE_FLAGS.ENABLE_LIVE_SYNC || !sessionId) return;
        try {
            await SyncEngine.getInstance().endSession(sessionId);
            setState({ type: 'DISCONNECT_SYNC' });
            showNotification({ mainText: t('liveSync.broadcastStopped'), type: 'success', subText: t('liveSync.nowLocal'), systemIcon: 'mic' });
        } catch (e) {
            console.error('[SyncManager] Failed to stop broadcast:', e);
            showNotification({ mainText: 'Erro ao encerrar transmissão', type: 'error', subText: String(e), systemIcon: 'mic' });
        }
    }, [sessionId, setState, t, showNotification]);

    // Spectator: Leave session
    const handleLeaveSession = useCallback(() => {
        if (!FEATURE_FLAGS.ENABLE_LIVE_SYNC) return;
        setState({ type: 'DISCONNECT_SYNC' });
        showNotification({ mainText: t('liveSync.sessionLeft'), type: 'info', subText: t('liveSync.nowLocal'), systemIcon: 'mic' });
    }, [setState, t, showNotification]);

    // Host: Broadcast state changes to spectators
    useEffect(() => {
        if (!FEATURE_FLAGS.ENABLE_LIVE_SYNC || !isHost || !sessionId) return;
        SyncEngine.getInstance().broadcastState(sessionId, combinedState);
    }, [isHost, sessionId, combinedState]);

    // Sync timeout state (debounced to avoid Firestore queue overflow)
    if (FEATURE_FLAGS.ENABLE_LIVE_SYNC) {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useTimeoutSync(sessionId, activeTimeoutTeam, timeoutSeconds, isTimeoutMinimized, isHost);
    }

    // Spectators: Listen for remote timeout changes
    if (FEATURE_FLAGS.ENABLE_LIVE_SYNC) {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useRemoteTimeoutSync(sessionId, (remoteState) => {
            if (isSpectator) {
                if (remoteState.activeTeam && remoteState.activeTeam !== activeTimeoutTeam) {
                    startTimeout(remoteState.activeTeam, remoteState.secondsLeft ?? 30);
                    if (remoteState.isMinimized) {
                        minimizeTimeout();
                    }
                } else if (!remoteState.activeTeam && activeTimeoutTeam) {
                    stopTimeout();
                } else if (activeTimeoutTeam && remoteState.isMinimized !== isTimeoutMinimized) {
                    if (remoteState.isMinimized) minimizeTimeout();
                    else maximizeTimeout();
                }
            }
        });
    }

    // Spectators: Auto-open match over modal when host finishes
    useEffect(() => {
        if (isSpectator && isMatchOver && activeModal === 'none') {
            openModal('match_over');
        }
    }, [isSpectator, isMatchOver, activeModal, openModal]);

    return {
        isBroadcastMode,
        isHost,
        isSpectator,
        handleHostSession,
        handleJoinSession,
        handleStopBroadcast,
        handleLeaveSession
    };
}
