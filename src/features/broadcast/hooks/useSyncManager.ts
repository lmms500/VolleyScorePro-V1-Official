/**
 * src/hooks/useSyncManager.ts (REFATORADO)
 *
 * Hook para gerenciar VolleyLink Live Sync.
 * AGORA CONSOME CONTEXTS INTERNAMENTE - sem parâmetros.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { FEATURE_FLAGS } from '@config/constants';
import { SyncEngine } from '@features/broadcast/services/SyncEngine';
import { useTimeoutSync } from './useTimeoutSync';
import { useRemoteTimeoutSync } from './useRemoteTimeoutSync';
import { useActions, useScore, useRoster } from '@contexts/GameContext';
import { useAuth } from '@contexts/AuthContext';
import { useTranslation } from '@contexts/LanguageContext';
import { useNotification } from '@contexts/NotificationContext';
import { useModals } from '@contexts/ModalContext';
import { useTimeoutContext } from '@contexts/TimeoutContext';
import { useCombinedGameStateWithTimer } from '@features/game/hooks/useCombinedGameStateWithTimer';

export interface SyncManagerReturn {
    isBroadcastMode: boolean;
    isHost: boolean;
    isSpectator: boolean;
    handleHostSession: (code: string) => Promise<void>;
    handleJoinSession: (code: string) => void;
    handleStopBroadcast: () => Promise<void>;
    handleLeaveSession: () => void;
}

export function useSyncManager(): SyncManagerReturn {
    const combinedState = useCombinedGameStateWithTimer();
    const { setState } = useActions();
    const { isMatchOver } = useScore();
    const { syncRole, sessionId } = useRoster();
    const { user } = useAuth();
    const { t } = useTranslation();
    const { showNotification } = useNotification();
    const { activeModal, openModal } = useModals();

    const {
        activeTimeoutTeam,
        timeoutSeconds,
        isTimeoutMinimized,
        startTimeout,
        stopTimeout,
        minimizeTimeout,
        maximizeTimeout
    } = useTimeoutContext();

    const [isBroadcastMode, setIsBroadcastMode] = useState(false);
    const currentSessionRef = useRef<string | null>(null);
    const unsubscribeRef = useRef<(() => void) | null>(null);

    const isHost = syncRole === 'host';
    const isSpectator = syncRole === 'spectator';

    const handleSessionEnded = useCallback(() => {
        if (unsubscribeRef.current) {
            unsubscribeRef.current();
            unsubscribeRef.current = null;
        }
        
        setState({ type: 'RESET_MATCH', gameId: Date.now().toString() });
        setState({ type: 'DISCONNECT_SYNC' });
        
        showNotification({
            mainText: t('liveSync.sessionEnded'),
            type: 'info',
            subText: t('liveSync.sessionEndedSub'),
            systemIcon: 'mic'
        });
    }, [setState, showNotification, t]);

    useEffect(() => {
        if (!FEATURE_FLAGS.ENABLE_LIVE_SYNC) return;

        const params = new URLSearchParams(window.location.search);
        if (params.get('mode') === 'broadcast') {
            setIsBroadcastMode(true);
            const sessionCode = params.get('code');
            if (sessionCode && user?.uid) {
                currentSessionRef.current = sessionCode;
                const syncEngine = SyncEngine.getInstance();
                
                syncEngine.joinAsSpectator(sessionCode, user.uid);
                
                unsubscribeRef.current = syncEngine.subscribeToMatch(
                    sessionCode,
                    (remoteState) => {
                        setState({
                            type: 'LOAD_STATE',
                            payload: { ...remoteState, syncRole: 'spectator', sessionId: sessionCode }
                        });
                    },
                    undefined,
                    undefined,
                    handleSessionEnded
                );
            }
        }
        
        return () => {
            if (unsubscribeRef.current) {
                unsubscribeRef.current();
            }
            if (currentSessionRef.current && user?.uid) {
                SyncEngine.getInstance().leaveSpectator(currentSessionRef.current, user.uid);
            }
        };
    }, [setState, user?.uid, handleSessionEnded]);

    const handleHostSession = useCallback(async (code: string) => {
        if (!FEATURE_FLAGS.ENABLE_LIVE_SYNC || !user) return;

        const syncEngine = SyncEngine.getInstance();
        await syncEngine.hostMatch(code, user.uid, combinedState);
        
        syncEngine.subscribeHostToSpectatorCount(code);
        
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
        
        if (!user?.uid) {
            showNotification({
                mainText: t('liveSync.authRequired'),
                type: 'error',
                subText: t('liveSync.authRequiredSub'),
                systemIcon: 'mic'
            });
            return;
        }

        currentSessionRef.current = code;
        const syncEngine = SyncEngine.getInstance();

        syncEngine.checkSessionStatus(code).then((status) => {
            if (status === 'finished') {
                showNotification({
                    mainText: t('liveSync.sessionEnded'),
                    type: 'info',
                    subText: t('liveSync.sessionEndedSub'),
                    systemIcon: 'mic'
                });
                return;
            }

            if (status === 'not_found') {
                showNotification({
                    mainText: t('liveSync.sessionNotFound'),
                    type: 'error',
                    subText: t('liveSync.sessionNotFoundSub'),
                    systemIcon: 'mic'
                });
                return;
            }

            syncEngine.joinAsSpectator(code, user!.uid);

            unsubscribeRef.current = syncEngine.subscribeToMatch(
                code,
                (remoteState) => {
                    setState({
                        type: 'LOAD_STATE',
                        payload: { ...remoteState, syncRole: 'spectator', sessionId: code }
                    });
                },
                undefined,
                undefined,
                handleSessionEnded
            );

            setState({ type: 'SET_SYNC_ROLE', role: 'spectator', sessionId: code });
            
            showNotification({
                mainText: t('liveSync.joined', { code }),
                type: 'success',
                subText: t('liveSync.joinedSub'),
                systemIcon: 'mic'
            });
        });
    }, [user?.uid, setState, showNotification, t, handleSessionEnded]);

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
        if (currentSessionRef.current && user?.uid) {
            SyncEngine.getInstance().leaveSpectator(currentSessionRef.current, user.uid);
        }
        
        if (unsubscribeRef.current) {
            unsubscribeRef.current();
            unsubscribeRef.current = null;
        }
        
        currentSessionRef.current = null;
        setState({ type: 'DISCONNECT_SYNC' });
        showNotification({
            mainText: t('liveSync.left'),
            type: 'info',
            systemIcon: 'mic'
        });
    }, [user?.uid, setState, showNotification, t]);

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

    useEffect(() => {
        if (isSpectator && isMatchOver && activeModal === 'none') {
            openModal('match_over');
        }
    }, [isSpectator, isMatchOver, activeModal, openModal]);

    useEffect(() => {
        if (isHost && sessionId) {
            SyncEngine.getInstance().broadcastState(sessionId, combinedState);
        }
    }, [isHost, sessionId, combinedState]);

    useEffect(() => {
        const syncEngine = SyncEngine.getInstance();
        
        if (isHost && sessionId) {
            syncEngine.subscribeHostToSpectatorCount(sessionId);
        }
        
        return () => {
            if (isHost) {
                syncEngine.unsubscribeHostFromSpectatorCount();
            }
        };
    }, [isHost, sessionId]);

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
