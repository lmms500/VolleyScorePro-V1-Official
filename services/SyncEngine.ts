
import { doc, onSnapshot, setDoc, updateDoc, increment, serverTimestamp, DocumentSnapshot, FirestoreError, Unsubscribe } from 'firebase/firestore';
import { db, isFirebaseInitialized } from './firebase';
import { GameState } from '../types';
import { SecureStorage } from './SecureStorage';

interface SyncSessionSchema {
    hostUid: string;
    status: 'active' | 'finished';
    connectedCount: number;
    lastUpdate: any;
    state: GameState;
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
                console.log('[SyncEngine] Restored pending state from storage.');
                this.pendingState = stored;
                if (this.isOnline) {
                    this.flushQueue();
                }
            }
        } catch (e) {
            console.error('[SyncEngine] Failed to recover queue:', e);
        }
    }

    private handleOnline = () => {
        console.log('[SyncEngine] Network recovered. Flushing queue...');
        this.isOnline = true;
        this.flushQueue();
    };

    private handleOffline = () => {
        console.warn('[SyncEngine] Network lost. Queuing updates.');
        this.isOnline = false;
    };

    /**
     * Initializes a match session as the Host.
     */
    public async hostMatch(sessionId: string, userId: string, initialState: GameState): Promise<void> {
        if (!isFirebaseInitialized || !db) {
            console.warn('[SyncEngine] Firebase not initialized');
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
            console.error('[SyncEngine] Host initialization failed:', e);
            // We don't queue initial creation as it requires Ack, but UI should handle retry
        }
    }

    /**
     * Broadcasts state updates (Host only).
     * Uses a Debounced Store-and-Forward mechanism with Persistence.
     */
    public async broadcastState(sessionId: string, state: GameState): Promise<void> {
        // Always update the pending state to the LATEST version
        this.pendingState = { sessionId, state };
        
        // Persist immediately to survive app restart/crash
        SecureStorage.save(SYNC_QUEUE_KEY, this.pendingState).catch(e => 
            console.warn('[SyncEngine] Failed to persist queue:', e)
        );
        
        // Attempt to flush immediately if online and not busy
        if (this.isOnline && !this.isFlushing) {
            this.flushQueue();
        }
    }

    private async flushQueue() {
        if (!this.pendingState || !isFirebaseInitialized || !db) return;
        if (this.isFlushing) return;

        this.isFlushing = true;
        
        // Grab the state to send
        const { sessionId, state } = this.pendingState;
        
        const sessionRef = doc(db, 'live_matches', sessionId);

        try {
            await updateDoc(sessionRef, {
                state: this.sanitizeForFirebase(state),
                lastUpdate: serverTimestamp()
            });
            
            // If the pending state hasn't changed since we started, we are clear.
            if (this.pendingState && this.pendingState.state === state) {
                this.pendingState = null;
                // Clear persistence
                await SecureStorage.remove(SYNC_QUEUE_KEY);
            } else if (this.pendingState) {
                // There is a newer state waiting, flush again
                this.isFlushing = false;
                this.flushQueue();
                return;
            }
        } catch (e) {
            console.error("[SyncEngine] Broadcast failed (will retry):", e);
            // Keep pendingState populated so it retries next flush/online event
        } finally {
            this.isFlushing = false;
        }
    }

    /**
     * Subscribes to a match session (Spectator).
     * Returns a cleanup function.
     */
    public subscribeToMatch(
        sessionId: string, 
        onUpdate: (state: GameState) => void,
        onError?: (error: Error) => void
    ): () => void {
        if (!isFirebaseInitialized || !db) {
            if (onError) onError(new Error("Firebase not initialized"));
            return () => {};
        }
        
        if (this.activeUnsubscribe) {
            this.activeUnsubscribe();
            this.activeUnsubscribe = null;
        }

        const sessionRef = doc(db, 'live_matches', sessionId);
        
        updateDoc(sessionRef, { connectedCount: increment(1) }).catch(e => console.warn("Failed to inc stats", e));

        this.activeUnsubscribe = onSnapshot(
            sessionRef, 
            (snapshot: DocumentSnapshot) => {
                if (snapshot.exists()) {
                    const data = snapshot.data() as SyncSessionSchema;
                    if (data && data.state) {
                        onUpdate(data.state);
                    }
                } else {
                    if (onError) onError(new Error("Session not found"));
                }
            },
            (error: FirestoreError) => {
                console.error("[SyncEngine] Subscription error:", error);
                if (onError) onError(error);
            }
        );

        return () => {
            if (this.activeUnsubscribe) {
                this.activeUnsubscribe();
                this.activeUnsubscribe = null;
            }
            updateDoc(sessionRef, { connectedCount: increment(-1) }).catch(() => {});
        };
    }

    private sanitizeForFirebase(state: GameState): GameState {
        const { lastSnapshot, ...cleanState } = state;
        return JSON.parse(JSON.stringify(cleanState, (key, value) => {
            if (value === undefined) return null;
            return value;
        }));
    }

    public generateCode(): string {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
}
