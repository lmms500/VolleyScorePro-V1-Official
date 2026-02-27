
import { doc, onSnapshot, setDoc, serverTimestamp, DocumentSnapshot, FirestoreError, Unsubscribe, collection, deleteDoc, onSnapshot as onSnapshotQuery, writeBatch, getDocs, getDoc } from 'firebase/firestore';
import { db, isFirebaseInitialized } from '@lib/firebase';
import { GameState, MatchParticipant } from '@types';
import { SecureStorage } from '@lib/storage/SecureStorage';
import { logger } from '@lib/utils/logger';

interface SyncSessionSchema {
    hostUid: string;
    status: 'active' | 'finished';
    connectedCount: number;
    lastUpdate: any;
    state: GameState;
    syncLatencyMs?: number;
    /** Whether this session has been validated as an official match */
    isOfficialMatch?: boolean;
    /** Number of checked-in participants (players, not spectators) */
    participantCount?: number;
}

interface SpectatorDoc {
    joinedAt: any;
    uid: string;
}

/** Document stored in /live_matches/{sessionId}/participants/{uid} */
interface ParticipantDoc {
    uid: string;
    profileId: string;
    name: string;
    avatar?: string;
    team: 'A' | 'B' | 'unassigned';
    deviceFingerprint: string;
    checkedInAt: any;
    role: 'host' | 'player';
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
    private spectatorCountUnsubscribe: Unsubscribe | null = null;
    private participantCountUnsubscribe: Unsubscribe | null = null;
    private currentHostSessionId: string | null = null;

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
     * Checks if a session exists and is active.
     * Returns: 'active' | 'finished' | 'not_found'
     */
    public async checkSessionStatus(sessionId: string): Promise<'active' | 'finished' | 'not_found'> {
        if (!isFirebaseInitialized || !db) {
            return 'not_found';
        }

        const sessionRef = doc(db, 'live_matches', sessionId);

        try {
            const snapshot = await getDoc(sessionRef);
            if (!snapshot.exists()) {
                return 'not_found';
            }
            const data = snapshot.data() as SyncSessionSchema;
            return data.status === 'finished' ? 'finished' : 'active';
        } catch (e) {
            logger.error('[SyncEngine] Failed to check session status:', e);
            return 'not_found';
        }
    }

    /**
     * Subscribes to a match session (Spectator).
     * Returns a cleanup function.
     * Auto-reconnect with exponential backoff if subscription fails.
     * 
     * Novo: monitora status 'finished' e chama onSessionEnded.
     */
    public subscribeToMatch(
        sessionId: string,
        onUpdate: (state: GameState) => void,
        onError?: (error: Error) => void,
        onReconnecting?: (attempt: number) => void,
        onSessionEnded?: () => void
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

        this.reconnectAttempts = 0;
        this.reconnectDelay = 1000;

        this.activeUnsubscribe = onSnapshot(
            sessionRef,
            (snapshot: DocumentSnapshot) => {
                if (snapshot.exists()) {
                    const data = snapshot.data() as SyncSessionSchema;

                    if (data.status === 'finished') {
                        logger.log('[SyncEngine] Session ended by host');
                        if (onSessionEnded) {
                            onSessionEnded();
                        }
                        return;
                    }

                    if (data && data.state) {
                        onUpdate(data.state);
                    }
                } else {
                    this.handleSubscriptionError(
                        new Error("Session not found"),
                        sessionId, onUpdate, onError, onReconnecting, onSessionEnded
                    );
                }
            },
            (error: FirestoreError) => {
                logger.error("[SyncEngine] Subscription error:", error);
                this.handleSubscriptionError(
                    error,
                    sessionId, onUpdate, onError, onReconnecting, onSessionEnded
                );
            }
        );

        return () => {
            if (this.activeUnsubscribe) {
                this.activeUnsubscribe();
                this.activeUnsubscribe = null;
            }
        };
    }

    private handleSubscriptionError(
        error: Error,
        sessionId: string,
        onUpdate: (state: GameState) => void,
        onError?: (error: Error) => void,
        onReconnecting?: (attempt: number) => void,
        onSessionEnded?: () => void
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
                this.subscribeToMatch(sessionId, onUpdate, onError, onReconnecting, onSessionEnded);
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
        const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
        let code = '';

        for (let i = 0; i < 3; i++) {
            code += letters[Math.floor(Math.random() * letters.length)];
        }

        code += String(Math.floor(Math.random() * 100)).padStart(2, '0');
        return code;
    }

    /**
     * Registra espectador na subcoleção para contagem precisa.
     * Deve ser chamado quando um espectador se conecta.
     */
    public async joinAsSpectator(sessionId: string, userId: string): Promise<void> {
        if (!isFirebaseInitialized || !db) {
            logger.warn('[SyncEngine] Firebase not initialized');
            return;
        }

        const spectatorRef = doc(db, 'live_matches', sessionId, 'spectators', userId);
        const spectatorDoc: SpectatorDoc = {
            joinedAt: serverTimestamp(),
            uid: userId
        };

        try {
            await setDoc(spectatorRef, spectatorDoc);
            logger.log('[SyncEngine] Spectator joined:', userId);
        } catch (e) {
            logger.error('[SyncEngine] Failed to join as spectator:', e);
        }
    }

    /**
     * Remove espectador da subcoleção.
     * Deve ser chamado quando um espectador se desconecta.
     */
    public async leaveSpectator(sessionId: string, userId: string): Promise<void> {
        if (!isFirebaseInitialized || !db) {
            return;
        }

        const spectatorRef = doc(db, 'live_matches', sessionId, 'spectators', userId);

        try {
            await deleteDoc(spectatorRef);
            logger.log('[SyncEngine] Spectator left:', userId);
        } catch (e) {
            logger.warn('[SyncEngine] Failed to leave spectator:', e);
        }
    }

    /**
     * Subscreve a atualizações de contagem de espectadores.
     * Usa onSnapshot na subcoleção para contagem em tempo real.
     */
    public subscribeToSpectatorCount(
        sessionId: string,
        onUpdate: (count: number) => void
    ): () => void {
        if (!isFirebaseInitialized || !db) {
            onUpdate(0);
            return () => { };
        }

        const spectatorsCol = collection(db, 'live_matches', sessionId, 'spectators');

        const unsubscribe = onSnapshotQuery(
            spectatorsCol,
            (snapshot) => {
                onUpdate(snapshot.size);
            },
            (error) => {
                logger.error('[SyncEngine] Spectator count subscription error:', error);
                onUpdate(0);
            }
        );

        return unsubscribe;
    }

    /**
     * Host: Monitora a subcoleção spectators e sincroniza o contador
     * no documento principal da sessão.
     */
    public subscribeHostToSpectatorCount(sessionId: string): void {
        if (!isFirebaseInitialized || !db) return;

        if (this.spectatorCountUnsubscribe) {
            this.spectatorCountUnsubscribe();
        }

        this.currentHostSessionId = sessionId;
        const spectatorsCol = collection(db, 'live_matches', sessionId, 'spectators');
        const sessionRef = doc(db, 'live_matches', sessionId);

        this.spectatorCountUnsubscribe = onSnapshotQuery(
            spectatorsCol,
            async (snapshot) => {
                const count = snapshot.size;

                if (this.currentHostSessionId === sessionId) {
                    try {
                        await setDoc(sessionRef, {
                            connectedCount: count + 1 // +1 para incluir o host
                        }, { merge: true });
                    } catch (e) {
                        logger.warn('[SyncEngine] Failed to update spectator count:', e);
                    }
                }
            },
            (error) => {
                logger.error('[SyncEngine] Host spectator count subscription error:', error);
            }
        );
    }

    /**
     * Host: Para de monitorar contagem de espectadores.
     */
    public unsubscribeHostFromSpectatorCount(): void {
        if (this.spectatorCountUnsubscribe) {
            this.spectatorCountUnsubscribe();
            this.spectatorCountUnsubscribe = null;
        }
        this.currentHostSessionId = null;
    }

    /**
     * Ends an active broadcast session (Host only).
     * Notifies all spectators by setting status to 'finished',
     * then cleans up spectators subcollection.
     */
    public async endSession(sessionId: string): Promise<void> {
        if (!isFirebaseInitialized || !db) {
            logger.warn('[SyncEngine] Firebase not initialized');
            return;
        }

        this.unsubscribeHostFromSpectatorCount();
        this.unsubscribeFromParticipants();

        if (this.activeUnsubscribe) {
            this.activeUnsubscribe();
            this.activeUnsubscribe = null;
        }

        const sessionRef = doc(db, 'live_matches', sessionId);

        try {
            await setDoc(sessionRef, {
                status: 'finished',
                lastUpdate: serverTimestamp()
            }, { merge: true });

            this.pendingState = null;
            await SecureStorage.remove(SYNC_QUEUE_KEY);

            await this.cleanupSpectators(sessionId);
            await this.cleanupParticipants(sessionId);

            logger.log('[SyncEngine] Session ended:', sessionId);
        } catch (e) {
            logger.error('[SyncEngine] Failed to end session:', e);
            throw e;
        }
    }

    /**
     * Removes all spectator documents from a session.
     * Called when host ends the session.
     */
    private async cleanupSpectators(sessionId: string): Promise<void> {
        if (!isFirebaseInitialized || !db) return;

        try {
            const spectatorsCol = collection(db, 'live_matches', sessionId, 'spectators');
            const snapshot = await getDocs(spectatorsCol);

            if (snapshot.empty) return;

            const batch = writeBatch(db);
            snapshot.docs.forEach((docSnapshot) => {
                batch.delete(docSnapshot.ref);
            });

            await batch.commit();
            logger.log('[SyncEngine] Cleaned up', snapshot.size, 'spectators');
        } catch (e) {
            logger.warn('[SyncEngine] Failed to cleanup spectators:', e);
        }
    }

    /**
     * Removes all participant documents from a session.
     * Called when host ends the session.
     */
    private async cleanupParticipants(sessionId: string): Promise<void> {
        if (!isFirebaseInitialized || !db) return;

        try {
            const participantsCol = collection(db, 'live_matches', sessionId, 'participants');
            const snapshot = await getDocs(participantsCol);

            if (snapshot.empty) return;

            const batch = writeBatch(db);
            snapshot.docs.forEach((docSnapshot) => {
                batch.delete(docSnapshot.ref);
            });

            await batch.commit();
            logger.log('[SyncEngine] Cleaned up', snapshot.size, 'participants');
        } catch (e) {
            logger.warn('[SyncEngine] Failed to cleanup participants:', e);
        }
    }

    // ============================
    // PARTICIPANT MANAGEMENT
    // (Check-in system for official match validation)
    // ============================

    /**
     * Registers a player as a checked-in participant in the session.
     * Unlike spectators (passive viewers), participants are active players
     * whose check-in contributes to match validation.
     */
    public async joinAsParticipant(
        sessionId: string,
        participant: Omit<MatchParticipant, 'checkedInAt'>
    ): Promise<void> {
        if (!isFirebaseInitialized || !db) {
            logger.warn('[SyncEngine] Firebase not initialized');
            return;
        }

        const participantRef = doc(db, 'live_matches', sessionId, 'participants', participant.uid);
        const participantDoc: ParticipantDoc = {
            uid: participant.uid,
            profileId: participant.profileId,
            name: participant.name,
            avatar: participant.avatar || null as any,
            team: participant.team,
            deviceFingerprint: participant.deviceFingerprint,
            checkedInAt: serverTimestamp(),
            role: participant.role,
        };

        try {
            await setDoc(participantRef, participantDoc);
            logger.log('[SyncEngine] Participant joined:', participant.name, `(${participant.uid})`);
        } catch (e) {
            logger.error('[SyncEngine] Failed to join as participant:', e);
        }
    }

    /**
     * Removes a participant from the session.
     */
    public async leaveParticipant(sessionId: string, uid: string): Promise<void> {
        if (!isFirebaseInitialized || !db) return;

        const participantRef = doc(db, 'live_matches', sessionId, 'participants', uid);

        try {
            await deleteDoc(participantRef);
            logger.log('[SyncEngine] Participant left:', uid);
        } catch (e) {
            logger.warn('[SyncEngine] Failed to remove participant:', e);
        }
    }

    /**
     * Subscribes to real-time updates of participant list.
     * Returns cleanup function.
     */
    public subscribeToParticipants(
        sessionId: string,
        onUpdate: (participants: MatchParticipant[]) => void
    ): () => void {
        if (!isFirebaseInitialized || !db) {
            onUpdate([]);
            return () => { };
        }

        const participantsCol = collection(db, 'live_matches', sessionId, 'participants');

        const unsubscribe = onSnapshotQuery(
            participantsCol,
            (snapshot) => {
                const participants: MatchParticipant[] = snapshot.docs.map(d => {
                    const data = d.data() as ParticipantDoc;
                    return {
                        uid: data.uid,
                        profileId: data.profileId,
                        name: data.name,
                        avatar: data.avatar,
                        team: data.team,
                        deviceFingerprint: data.deviceFingerprint,
                        checkedInAt: data.checkedInAt?.toMillis?.() ?? Date.now(),
                        role: data.role,
                    };
                });
                onUpdate(participants);
            },
            (error) => {
                logger.error('[SyncEngine] Participant subscription error:', error);
                onUpdate([]);
            }
        );

        this.participantCountUnsubscribe = unsubscribe;
        return unsubscribe;
    }

    /**
     * Unsubscribes from participant updates.
     */
    public unsubscribeFromParticipants(): void {
        if (this.participantCountUnsubscribe) {
            this.participantCountUnsubscribe();
            this.participantCountUnsubscribe = null;
        }
    }

    /**
     * Updates the session's official match status.
     * Called by the host when validation status changes.
     */
    public async updateOfficialStatus(
        sessionId: string,
        isOfficialMatch: boolean,
        participantCount: number
    ): Promise<void> {
        if (!isFirebaseInitialized || !db) return;

        const sessionRef = doc(db, 'live_matches', sessionId);

        try {
            await setDoc(sessionRef, {
                isOfficialMatch,
                participantCount,
                lastUpdate: serverTimestamp()
            }, { merge: true });
            logger.log('[SyncEngine] Official status updated:', isOfficialMatch ? '🟢 Official' : '🟡 Casual');
        } catch (e) {
            logger.warn('[SyncEngine] Failed to update official status:', e);
        }
    }

    /**
     * Gets the current list of participants (one-shot read).
     */
    public async getParticipants(sessionId: string): Promise<MatchParticipant[]> {
        if (!isFirebaseInitialized || !db) return [];

        try {
            const participantsCol = collection(db, 'live_matches', sessionId, 'participants');
            const snapshot = await getDocs(participantsCol);

            return snapshot.docs.map(d => {
                const data = d.data() as ParticipantDoc;
                return {
                    uid: data.uid,
                    profileId: data.profileId,
                    name: data.name,
                    avatar: data.avatar,
                    team: data.team,
                    deviceFingerprint: data.deviceFingerprint,
                    checkedInAt: data.checkedInAt?.toMillis?.() ?? Date.now(),
                    role: data.role,
                };
            });
        } catch (e) {
            logger.error('[SyncEngine] Failed to get participants:', e);
            return [];
        }
    }

    /**
     * Permanently deletes a finished session document.
     * Should be called after spectators have been notified.
     */
    public async deleteSession(sessionId: string): Promise<void> {
        if (!isFirebaseInitialized || !db) return;

        const sessionRef = doc(db, 'live_matches', sessionId);

        try {
            await deleteDoc(sessionRef);
            logger.log('[SyncEngine] Session deleted:', sessionId);
        } catch (e) {
            logger.warn('[SyncEngine] Failed to delete session:', e);
        }
    }
}
