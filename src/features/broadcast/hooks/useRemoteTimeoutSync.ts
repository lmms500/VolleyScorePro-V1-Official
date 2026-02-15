import { useEffect } from 'react';
import { TeamId } from '@types';
import { db } from '@lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

interface TimeoutRemoteState {
  activeTeam: TeamId | null;
  secondsLeft: number;
  isMinimized: boolean;
  syncedAt: number;
}

/**
 * Hook para espectadores escutarem mudanças de timeout do host.
 * Aplica automaticamente o estado recebido.
 */
export function useRemoteTimeoutSync(
  sessionId: string | undefined,
  onTimeoutUpdate: (state: TimeoutRemoteState) => void
) {
  useEffect(() => {
    if (!sessionId) return;

    const unsubscribe = onSnapshot(
      doc(db, 'live_matches', sessionId),
      (snapshot) => {
        if (!snapshot.exists()) return;

        const data = snapshot.data();
        if (data?.timeout) {
          onTimeoutUpdate({
            activeTeam: data.timeout.activeTeam || null,
            secondsLeft: data.timeout.secondsLeft || 0,
            isMinimized: data.timeout.isMinimized || false,
            syncedAt: data.timeout.syncedAt || Date.now(),
          });
        }
      },
      (error) => {
        console.error('[useRemoteTimeoutSync] Firestore listener error:', error);
      }
    );

    return () => unsubscribe();
  }, [sessionId, onTimeoutUpdate]);
}
