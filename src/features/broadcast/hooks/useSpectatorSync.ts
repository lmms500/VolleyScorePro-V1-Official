import { useEffect, useState, useRef, useCallback } from 'react';
import { GameState } from '@types';
import { SyncEngine } from '@features/broadcast/services/SyncEngine';

interface UseSpectatorSyncProps {
    sessionId: string;
    userId: string | undefined;
    onStateUpdate: (state: GameState) => void;
    onSessionEnded?: () => void;
    enabled?: boolean;
}

interface SpectatorSyncStatus {
    isConnected: boolean;
    isReconnecting: boolean;
    reconnectAttempt: number;
    latencyMs: number;
    error: string | null;
}

export const useSpectatorSync = ({
    sessionId,
    userId,
    onStateUpdate,
    onSessionEnded,
    enabled = true
}: UseSpectatorSyncProps) => {
    const [status, setStatus] = useState<SpectatorSyncStatus>({
        isConnected: false,
        isReconnecting: false,
        reconnectAttempt: 0,
        latencyMs: 0,
        error: null
    });

    const unsubscribeRef = useRef<(() => void) | null>(null);
    const lastUpdateTimeRef = useRef<number>(Date.now());
    const currentSessionRef = useRef<string | null>(null);

    const handleReconnecting = useCallback((attempt: number) => {
        setStatus(prev => ({
            ...prev,
            isReconnecting: true,
            reconnectAttempt: attempt
        }));
    }, []);

    const handleError = useCallback((error: Error) => {
        setStatus(prev => ({
            ...prev,
            isConnected: false,
            error: error.message
        }));
    }, []);

    const handleSessionEnded = useCallback(() => {
        setStatus(prev => ({
            ...prev,
            isConnected: false,
            error: null
        }));
        
        if (onSessionEnded) {
            onSessionEnded();
        }
    }, [onSessionEnded]);

    useEffect(() => {
        if (!enabled || !sessionId) return;

        const syncEngine = SyncEngine.getInstance();
        lastUpdateTimeRef.current = Date.now();

        const handleStateUpdate = (state: GameState) => {
            const now = Date.now();
            const latency = now - lastUpdateTimeRef.current;
            lastUpdateTimeRef.current = now;

            setStatus(prev => ({
                ...prev,
                isConnected: true,
                isReconnecting: false,
                latencyMs: latency,
                error: null
            }));

            onStateUpdate(state);
        };

        currentSessionRef.current = sessionId;

        if (userId) {
            syncEngine.joinAsSpectator(sessionId, userId);
        }

        unsubscribeRef.current = syncEngine.subscribeToMatch(
            sessionId,
            handleStateUpdate,
            handleError,
            handleReconnecting,
            handleSessionEnded
        );

        return () => {
            if (unsubscribeRef.current) {
                unsubscribeRef.current();
                unsubscribeRef.current = null;
            }
            
            if (userId && currentSessionRef.current === sessionId) {
                syncEngine.leaveSpectator(sessionId, userId);
            }
            
            currentSessionRef.current = null;
        };
    }, [sessionId, userId, enabled, onStateUpdate, handleReconnecting, handleError, handleSessionEnded]);

    return status;
};
