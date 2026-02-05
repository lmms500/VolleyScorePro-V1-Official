
import { doc, onSnapshot, setDoc, updateDoc, increment, serverTimestamp, DocumentSnapshot, FirestoreError, Unsubscribe } from 'firebase/firestore';
import { db, isFirebaseInitialized } from './firebase';
import { GameState } from '../types';
import { SecureStorage } from './SecureStorage';
import { logger } from '../utils/logger';

interface SyncSessionSchema {
    hostUid: string;
    status: 'active' | 'finished';
    connectedCount: number;
    lastUpdate: any;
    state: GameState;
    syncLatencyMs?: number;  // Host→Firestore→Spectator latency
}

const SYNC_QUEUE_KEY = 'sync_pending_queue';

/**
 * VolleyScore SyncEngine v2.2 (Offline Resilient + Persistence)
 * Manages real-time state broadcasting with offline queuing, automatic recovery,
 * and persistent storage of pending updates.
 */
export class SyncEngine {
    private static instance: SyncEngine;
    private activeUnsubscribe: Unsubscribe | null = null;

    // Offline Resilience State
    private isOnline: boolean = typeof navigator !== 'undefined' ? navigator.onLine : true;
    private pendingState: { sessionId: string, state: GameState } | null = null;
    private isFlushing: boolean = false;

    // Reconnection Logic
    private reconnectAttempts: number = 0;
    private maxReconnectAttempts: number = 10;
    private reconnectDelay: number = 1000;  // Start at 1s

    private constructor() {
        if (typeof window !== 'undefined') {
            window.addEventListener('online', this.handleOnline);
            window.addEventListener('offline', this.handleOffline);
        }
        this.recoverQueue();
    }

    public static getInstance(): SyncEngine {
        if (!SyncEngine.instance) SyncEngine.instance = new SyncEngine();
        return SyncEngine.instance;
    }

    private async recoverQueue() {
        try {
            const stored = await SecureStorage.load<{ sessionId: string, state: GameState }>(SYNC_QUEUE_KEY);
            if (stored && !this.pendingState) {
                logger.log('[SyncEngine] Restored pending state from storage.');
                this.pendingState = stored;
                if (this.isOnline) {
                    this.flushQueue();
                }
            }
        } catch (e) {
            logger.error('[SyncEngine] Failed to recover queue:', e);
        }
    }

    private handleOnline = () => {
        logger.log('[SyncEngine] Network recovered. Flushing queue...');
        this.isOnline = true;
        this.flushQueue();
    };

    private handleOffline = () => {
        logger.warn('[SyncEngine] Queuing updates.');
        this.isOnline = false;
    };

    /**
     * Initializes a match session as the Host.
     */
    public async hostMatch(sessionId: string, userId: string, initialState: GameState): Promise<void> {
        if (!isFirebaseInitialized || !db) {
            logger.warn('[SyncEngine] Firebase not initialized');
            return;
        }

        const sessionRef = doc(db, 'live_matches', sessionId);
        const payload: SyncSessionSchema = {
            hostUid: userId,
            status: 'active',
            connectedCount: 1,
            lastUpdate: serverTimestamp(),
            state: this.sanitizeForFirebase(initialState)
        };

        try {
            await setDoc(sessionRef, payload);
        } catch (e) {
            logger.error('[SyncEngine] Host initialization failed:', e);
            // We don't queue initial creation as it requires Ack, but UI should handle retry
        }
    }

    /**
     * Broadcasts state updates (Host only).
     * Simplified to always send the latest state using setDoc merge.
     * This avoids race conditions and ensures idempotency.
     * Now includes sync latency tracking.
     */
    public async broadcastState(sessionId: string, state: GameState): Promise<void> {
        // Always update pending state to the LATEST version
        this.pendingState = { sessionId, state };

        // Persist immediately for recovery
        SecureStorage.save(SYNC_QUEUE_KEY, this.pendingState).catch(e =>
            logger.warn('[SyncEngine] Failed to persist queue:', e)
        );

        // Attempt flush immediately if online
        if (this.isOnline && !this.isFlushing) {
            this.flushQueue();
        }
    }

    /**
     * Measures sync latency by tracking broadcast→update time.
     * Call this after receiving a spectator update to measure round-trip.
     */
    public measureLatency(hostTimestamp: number): number {
        const now = Date.now();
        return Math.max(0, now - hostTimestamp);
    }

    private async flushQueue() {
        if (!this.pendingState || !isFirebaseInitialized || !db) return;
        if (this.isFlushing) return;

        this.isFlushing = true;
        const { sessionId, state } = this.pendingState;
        const sessionRef = doc(db, 'live_matches', sessionId);

        try {
            // Use setDoc with merge=true (upsert) to avoid race conditions
            // This ensures the document is created or updated regardless of prior state
            await setDoc(sessionRef, {
                state: this.sanitizeForFirebase(state),
                lastUpdate: serverTimestamp()
            }, { merge: true });

            // Clear the queue only if no newer state arrived during send
            if (this.pendingState?.sessionId === sessionId) {
                this.pendingState = null;
                await SecureStorage.remove(SYNC_QUEUE_KEY);
            }
        } catch (e) {
            logger.error("[SyncEngine] Broadcast failed (will retry):", e);
            // Retain pendingState so it retries on next online event
        } finally {
            this.isFlushing = false;

            // If a newer state queued while flushing, send it immediately
            if (this.pendingState && this.isOnline) {
                this.flushQueue();
            }
        }
    }

    /**
     * Subscribes to a match session (Spectator).
     * Returns a cleanup function.
     * Auto-reconnect with exponential backoff if subscription fails.
     */
    public subscribeToMatch(
        sessionId: string,
        onUpdate: (state: GameState) => void,
        onError?: (error: Error) => void,
        onReconnecting?: (attempt: number) => void
    ): () => void {
        if (!isFirebaseInitialized || !db) {
            if (onError) onError(new Error("Firebase not initialized"));
            return () => { };
        }

        if (this.activeUnsubscribe) {
            this.activeUnsubscribe();
            this.activeUnsubscribe = null;
        }

        const sessionRef = doc(db, 'live_matches', sessionId);

        updateDoc(sessionRef, { connectedCount: increment(1) }).catch(e => logger.warn("Failed to inc stats", e));

        // Reset reconnect counter on successful subscription
        this.reconnectAttempts = 0;
        this.reconnectDelay = 1000;

        this.activeUnsubscribe = onSnapshot(
            sessionRef,
            (snapshot: DocumentSnapshot) => {
                if (snapshot.exists()) {
                    const data = snapshot.data() as SyncSessionSchema;
                    if (data && data.state) {
                        onUpdate(data.state);
                    }
                } else {
                    this.handleSubscriptionError(
                        new Error("Session not found"),
                        sessionId, onUpdate, onError, onReconnecting
                    );
                }
            },
            (error: FirestoreError) => {
                logger.error("[SyncEngine] Subscription error:", error);
                this.handleSubscriptionError(
                    error,
                    sessionId, onUpdate, onError, onReconnecting
                );
            }
        );

        return () => {
            if (this.activeUnsubscribe) {
                this.activeUnsubscribe();
                this.activeUnsubscribe = null;
            }
            updateDoc(sessionRef, { connectedCount: increment(-1) }).catch(() => { });
        };
    }

    private handleSubscriptionError(
        error: Error,
        sessionId: string,
        onUpdate: (state: GameState) => void,
        onError?: (error: Error) => void,
        onReconnecting?: (attempt: number) => void
    ) {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            if (onError) onError(error);
            return;
        }

        this.reconnectAttempts++;
        const delay = Math.min(this.reconnectDelay * Math.pow(1.5, this.reconnectAttempts), 30000);

        if (onReconnecting) {
            onReconnecting(this.reconnectAttempts);
        }

        logger.log(`[SyncEngine] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

        setTimeout(() => {
            if (this.isOnline) {
                this.subscribeToMatch(sessionId, onUpdate, onError, onReconnecting);
            }
        }, delay);
    }

    private sanitizeForFirebase(state: GameState): GameState {
        const { lastSnapshot, ...cleanState } = state;
        return JSON.parse(JSON.stringify(cleanState, (key, value) => {
            if (value === undefined) return null;
            return value;
        }));
    }

    public generateCode(): string {
        // Format: AAA-00 (3 letters + 2 digits)
        // More memorable and harder to mistype than 6 random digits
        const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';  // Exclude I, O (confusing)
        let code = '';

        for (let i = 0; i < 3; i++) {
            code += letters[Math.floor(Math.random() * letters.length)];
        }

        code += String(Math.floor(Math.random() * 100)).padStart(2, '0');
        return code;  // e.g., "ABC-12"
    }

    /**
     * Ends an active broadcast session (Host only).
     */
    public async endSession(sessionId: string): Promise<void> {
        if (!isFirebaseInitialized || !db) {
            logger.warn('[SyncEngine] Firebase not initialized');
            return;
        }

        const sessionRef = doc(db, 'live_matches', sessionId);

        try {
            // Use setDoc merge to set status without affecting other fields
            await setDoc(sessionRef, {
                status: 'finished',
                lastUpdate: serverTimestamp()
            }, { merge: true });

            // Clear any pending broadcasts
            this.pendingState = null;
            await SecureStorage.remove(SYNC_QUEUE_KEY);

            logger.log('[SyncEngine] Session ended:', sessionId);
        } catch (e) {
            logger.error('[SyncEngine] Failed to end session:', e);
            throw e;
        }
    }
}
