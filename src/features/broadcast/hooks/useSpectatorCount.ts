import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db, isFirebaseInitialized } from '@lib/firebase';

/**
 * Hook para rastrear número de espectadores conectados a uma sessão
 * Atualiza em tempo real quando novos espectadores entram/saem
 */
export const useSpectatorCount = (sessionId: string | undefined): number => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!sessionId || !isFirebaseInitialized || !db) {
            setCount(0);
            return;
        }

        // Subscrever a atualizações da sessão
        const sessionRef = doc(db, 'live_matches', sessionId);
        
        const unsubscribe = onSnapshot(
            sessionRef,
            (snapshot) => {
                if (snapshot.exists()) {
                    const data = snapshot.data();
                    const connectedCount = data?.connectedCount || 0;
                    setCount(Math.max(0, connectedCount - 1)); // -1 porque host é contado mas não é "spectador"
                } else {
                    setCount(0);
                }
            },
            (error) => {
                console.error('[useSpectatorCount] Error:', error);
                setCount(0);
            }
        );

        return () => unsubscribe();
    }, [sessionId]);

    return count;
};
