import { useEffect, useState } from 'react';
import { SyncEngine } from '@features/broadcast/services/SyncEngine';

/**
 * Hook para rastrear número de espectadores conectados a uma sessão.
 * Usa subcoleção spectators para contagem precisa em tempo real.
 */
export const useSpectatorCount = (sessionId: string | undefined): number => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!sessionId) {
            setCount(0);
            return;
        }

        const syncEngine = SyncEngine.getInstance();
        
        const unsubscribe = syncEngine.subscribeToSpectatorCount(
            sessionId,
            (spectatorCount) => {
                setCount(spectatorCount);
            }
        );

        return () => unsubscribe();
    }, [sessionId]);

    return count;
};
