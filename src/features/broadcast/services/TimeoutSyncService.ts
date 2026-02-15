import { TeamId } from '@types';
import { db } from '@lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

interface TimeoutSyncState {
  activeTeam: TeamId | null;
  secondsLeft: number;
  isMinimized: boolean;
  timestamp: number;
}

class TimeoutSyncService {
  private static instance: TimeoutSyncService;
  private pendingTimeout: TimeoutSyncState | null = null;
  private debounceTimer: NodeJS.Timeout | null = null;
  private lastSyncTime = 0;
  private readonly DEBOUNCE_MS = 500; // Max 2 syncs per second

  private constructor() {}

  static getInstance(): TimeoutSyncService {
    if (!TimeoutSyncService.instance) {
      TimeoutSyncService.instance = new TimeoutSyncService();
    }
    return TimeoutSyncService.instance;
  }

  /**
   * Queue timeout state change for sync.
   * Multiple rapid calls are debounced into a single Firestore write.
   */
  syncTimeout(
    sessionId: string | undefined,
    activeTeam: TeamId | null,
    secondsLeft: number,
    isMinimized: boolean
  ): void {
    if (!sessionId) return;

    // Store pending state
    this.pendingTimeout = {
      activeTeam,
      secondsLeft,
      isMinimized,
      timestamp: Date.now(),
    };

    // Clear existing debounce timer
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    // Schedule new sync after debounce period
    this.debounceTimer = setTimeout(() => {
      this.flushTimeoutSync(sessionId);
    }, this.DEBOUNCE_MS);
  }

  /**
   * Immediately flush pending timeout sync to Firestore.
   */
  private async flushTimeoutSync(sessionId: string): Promise<void> {
    if (!this.pendingTimeout) return;

    const now = Date.now();
    const timeSinceLastSync = now - this.lastSyncTime;

    // Safety check: don't sync more than once per 500ms
    if (timeSinceLastSync < this.DEBOUNCE_MS) {
      this.debounceTimer = setTimeout(
        () => this.flushTimeoutSync(sessionId),
        this.DEBOUNCE_MS - timeSinceLastSync
      );
      return;
    }

    try {
      const state = this.pendingTimeout;
      const docRef = doc(db, 'live_matches', sessionId);

      // Only write if state actually changed
      await setDoc(
        docRef,
        {
          timeout: {
            activeTeam: state.activeTeam,
            secondsLeft: state.secondsLeft,
            isMinimized: state.isMinimized,
            syncedAt: Date.now(),
          },
        },
        { merge: true }
      );

      this.lastSyncTime = Date.now();
      this.pendingTimeout = null;
    } catch (error) {
      console.error('[TimeoutSyncService] Sync failed:', error);
      // Retry on next sync call
    }
  }

  /**
   * Clean up pending operations
   */
  destroy(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
    this.pendingTimeout = null;
  }
}

export default TimeoutSyncService;
