import { useEffect, useRef } from 'react';
import { TeamId } from '../types';
import TimeoutSyncService from '../services/TimeoutSyncService';

/**
 * Hook para sincronizar estado do timeout com o host.
 * Debounced automaticamente para evitar sobrecarga do Firestore.
 */
export function useTimeoutSync(
  sessionId: string | undefined,
  activeTeam: TeamId | null,
  secondsLeft: number,
  isMinimized: boolean,
  shouldSync: boolean
) {
  const syncServiceRef = useRef(TimeoutSyncService.getInstance());

  useEffect(() => {
    if (shouldSync && sessionId) {
      syncServiceRef.current.syncTimeout(sessionId, activeTeam, secondsLeft, isMinimized);
    }
  }, [shouldSync, sessionId, activeTeam, secondsLeft, isMinimized]);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      syncServiceRef.current.destroy();
    };
  }, []);
}
