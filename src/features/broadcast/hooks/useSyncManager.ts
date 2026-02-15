/**
 * src/hooks/useSyncManager.ts (REFATORADO)
 *
 * Hook para gerenciar VolleyLink Live Sync.
 * AGORA CONSOME CONTEXTS INTERNAMENTE - sem parâmetros.
 */

import { useState, useEffect, useCallback } from 'react';
import { FEATURE_FLAGS } from '@config/constants';
import { SyncEngine } from '@features/broadcast/services/SyncEngine';
import { useTimeoutSync } from './useTimeoutSync';
import { useRemoteTimeoutSync } from './useRemoteTimeoutSync';
import { useActions, useScore, useRoster } from '@contexts/GameContext';
import { useAuth } from '@contexts/AuthContext';
import { useTranslation } from '@contexts/LanguageContext';
import { useNotification } from '@contexts/NotificationContext';
import { useModals } from '@contexts/ModalContext';
import { useTimeoutContext } from '@contexts/TimeoutContext'; // NOVO
import { useCombinedGameState } from '@features/game/hooks/useCombinedGameState'; // NOVO

export interface SyncManagerReturn {
    isBroadcastMode: boolean;
    isHost: boolean;
    isSpectator: boolean;
    handleHostSession: (code: string) => Promise<void>;
    handleJoinSession: (code: string) => void;
    handleStopBroadcast: () => Promise<void>;
    handleLeaveSession: () => void;
}

/**
 * useSyncManager - Encapsula toda lógica de VolleyLink Live Sync.
 *
 * Mudanças na refatoração:
 * - Consome 9 contexts internamente
 * - Usa useCombinedGameState() para type safety
 * - Usa useTimeout() para estado de timeout (evita dependência circular)
 * - Removida interface SyncManagerDeps (sem parâmetros)
 */
export function useSyncManager(): SyncManagerReturn {
    // --- CONTEXT CONSUMPTION (NOVO) ---
    const combinedState = useCombinedGameState();
    const { setState } = useActions();
    const { isMatchOver } = useScore();
    const { syncRole, sessionId } = useRoster();
    const { user } = useAuth();
    const { t } = useTranslation();
    const { showNotification } = useNotification();
    const { activeModal, openModal } = useModals();

    // Timeout state via novo TimeoutContext
    const {
        activeTimeoutTeam,
        timeoutSeconds,
        isTimeoutMinimized,
        startTimeout,
        stopTimeout,
        minimizeTimeout,
        maximizeTimeout
    } = useTimeoutContext();

    // --- STATE (INALTERADO) ---
    const [isBroadcastMode, setIsBroadcastMode] = useState(false);

    const isHost = syncRole === 'host';
    const isSpectator = syncRole === 'spectator';

    // --- URL DETECTION (INALTERADO) ---
    useEffect(() => {
        if (!FEATURE_FLAGS.ENABLE_LIVE_SYNC) return;

        const params = new URLSearchParams(window.location.search);
        if (params.get('mode') === 'broadcast') {
            setIsBroadcastMode(true);
            const sessionCode = params.get('code');
            if (sessionCode) {
                SyncEngine.getInstance().subscribeToMatch(sessionCode, (remoteState) => {
                    setState({
                        type: 'LOAD_STATE',
                        payload: { ...remoteState, syncRole: 'spectator', sessionId: sessionCode }
                    });
                });
            }
        }
    }, [setState]);

    // --- HANDLERS (INALTERADOS, apenas removem params externos) ---
    const handleHostSession = useCallback(async (code: string) => {
        if (!FEATURE_FLAGS.ENABLE_LIVE_SYNC || !user) return;

        await SyncEngine.getInstance().hostMatch(code, user.uid, combinedState);
        setState({ type: 'SET_SYNC_ROLE', role: 'host', sessionId: code });
        showNotification({
            mainText: t('liveSync.hosting', { code }),
            type: 'success',
            subText: t('liveSync.hostingSub'),
            systemIcon: 'mic'
        });
    }, [user, combinedState, setState, showNotification, t]);

    const handleJoinSession = useCallback((code: string) => {
        if (!FEATURE_FLAGS.ENABLE_LIVE_SYNC) return;

        SyncEngine.getInstance().subscribeToMatch(code, (remoteState) => {
            setState({
                type: 'LOAD_STATE',
                payload: { ...remoteState, syncRole: 'spectator', sessionId: code }
            });
        });

        showNotification({
            mainText: t('liveSync.joined', { code }),
            type: 'success',
            subText: t('liveSync.joinedSub'),
            systemIcon: 'mic'
        });
    }, [setState, showNotification, t]);

    const handleStopBroadcast = useCallback(async () => {
        if (!sessionId) return;
        try {
            await SyncEngine.getInstance().endSession(sessionId);
            setState({ type: 'DISCONNECT_SYNC' });
            showNotification({
                mainText: t('liveSync.stopped'),
                type: 'info',
                systemIcon: 'mic'
            });
        } catch (e) {
            console.error('[SyncManager] Failed to stop broadcast:', e);
        }
    }, [sessionId, setState, showNotification, t]);

    const handleLeaveSession = useCallback(() => {
        setState({ type: 'DISCONNECT_SYNC' });
        showNotification({
            mainText: t('liveSync.left'),
            type: 'info',
            systemIcon: 'mic'
        });
    }, [setState, showNotification, t]);

    // --- TIMEOUT SYNC HOOKS (INALTERADOS) ---
    useTimeoutSync(
        sessionId,
        activeTimeoutTeam,
        timeoutSeconds,
        isTimeoutMinimized,
        isHost
    );

    useRemoteTimeoutSync(
        sessionId,
        (remoteState) => {
            if (isSpectator) {
                if (remoteState.activeTeam && remoteState.activeTeam !== activeTimeoutTeam) {
                    startTimeout(remoteState.activeTeam, remoteState.secondsLeft);
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
        }
    );

    // --- SPECTATOR AUTO-OPEN MATCH OVER (INALTERADO) ---
    useEffect(() => {
        if (isSpectator && isMatchOver && activeModal === 'none') {
            openModal('match_over');
        }
    }, [isSpectator, isMatchOver, activeModal, openModal]);

    // --- BROADCAST STATE SYNC (INALTERADO) ---
    useEffect(() => {
        if (isHost && sessionId) {
            SyncEngine.getInstance().broadcastState(sessionId, combinedState);
        }
    }, [isHost, sessionId, combinedState]);

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
