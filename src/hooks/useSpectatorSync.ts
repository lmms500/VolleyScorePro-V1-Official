import { useEffect, useState, useRef, useCallback } from 'react';
import { GameState } from '../types';
import { SyncEngine } from '../services/SyncEngine';

interface UseSpectatorSyncProps {
    sessionId: string;
    onStateUpdate: (state: GameState) => void;
    enabled?: boolean;
}

interface SpectatorSyncStatus {
    isConnected: boolean;
    isReconnecting: boolean;
    reconnectAttempt: number;
    latencyMs: number;
    error: string | null;
}

/**
 * Hook para gerenciar sincronização de espectador com reconexão automática.
 * Monitora latência e status da conexão em tempo real.
 */
export const useSpectatorSync = ({
    sessionId,
    onStateUpdate,
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

        unsubscribeRef.current = syncEngine.subscribeToMatch(
            sessionId,
            handleStateUpdate,
            handleError,
            handleReconnecting
        );

        return () => {
            if (unsubscribeRef.current) {
                unsubscribeRef.current();
            }
        };
    }, [sessionId, enabled, onStateUpdate]);

    return status;
};
