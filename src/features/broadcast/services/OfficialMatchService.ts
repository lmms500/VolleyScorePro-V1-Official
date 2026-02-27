/**
 * OfficialMatchService — Handles submission of validated matches to the global history.
 * 
 * Only matches that passed validation (enough checked-in participants)
 * are eligible for submission to the global match history and ranking.
 */

import {
    collection, doc, setDoc, getDocs, query, orderBy, limit,
    serverTimestamp, where
} from 'firebase/firestore';
import { db, isFirebaseInitialized } from '@lib/firebase';
import { logger } from '@lib/utils/logger';
import { Match } from '@features/history/store/historyStore';

/** Shape of a global match document in Firestore */
interface GlobalMatchDoc {
    matchId: string;
    date: string;
    timestamp: number;
    durationSeconds: number;
    teamAName: string;
    teamBName: string;
    setsA: number;
    setsB: number;
    winner: 'A' | 'B' | null;
    gameMode: string;
    participantUids: string[];
    participantCount: number;
    submittedBy: string;
    sessionId: string;
    submittedAt: any;
}

export class OfficialMatchService {
    private static instance: OfficialMatchService;

    private constructor() { }

    public static getInstance(): OfficialMatchService {
        if (!OfficialMatchService.instance) {
            OfficialMatchService.instance = new OfficialMatchService();
        }
        return OfficialMatchService.instance;
    }

    /**
     * Submits a validated match to the global match history.
     * Only call this for matches where isOfficialMatch === true.
     * 
     * @returns true if submission succeeded
     */
    public async submitOfficialMatch(
        match: Match,
        hostUid: string,
        sessionId: string,
        participantUids: string[]
    ): Promise<boolean> {
        if (!isFirebaseInitialized || !db) {
            logger.warn('[OfficialMatchService] Firebase not initialized');
            return false;
        }

        if (!match.isOfficialMatch) {
            logger.warn('[OfficialMatchService] Attempted to submit non-official match');
            return false;
        }

        const globalMatchRef = doc(db, 'global_matches', match.id);

        const globalDoc: GlobalMatchDoc = {
            matchId: match.id,
            date: match.date,
            timestamp: match.timestamp,
            durationSeconds: match.durationSeconds,
            teamAName: match.teamAName,
            teamBName: match.teamBName,
            setsA: match.setsA,
            setsB: match.setsB,
            winner: match.winner,
            gameMode: match.config?.mode || 'indoor',
            participantUids,
            participantCount: participantUids.length,
            submittedBy: hostUid,
            sessionId,
            submittedAt: serverTimestamp(),
        };

        try {
            await setDoc(globalMatchRef, globalDoc);
            logger.log('[OfficialMatchService] 🟢 Official match submitted:', match.id);
            return true;
        } catch (e) {
            logger.error('[OfficialMatchService] Failed to submit official match:', e);
            return false;
        }
    }

    /**
     * Fetches the global match history (recent official matches).
     */
    public async getGlobalMatchHistory(maxResults: number = 20): Promise<GlobalMatchDoc[]> {
        if (!isFirebaseInitialized || !db) return [];

        try {
            const matchesRef = collection(db, 'global_matches');
            const q = query(
                matchesRef,
                orderBy('timestamp', 'desc'),
                limit(maxResults)
            );

            const snapshot = await getDocs(q);

            return snapshot.docs.map(d => ({
                ...d.data() as GlobalMatchDoc,
            }));
        } catch (e) {
            logger.error('[OfficialMatchService] Failed to fetch global history:', e);
            return [];
        }
    }

    /**
     * Fetches official matches that a specific player participated in.
     */
    public async getPlayerOfficialMatches(
        uid: string,
        maxResults: number = 20
    ): Promise<GlobalMatchDoc[]> {
        if (!isFirebaseInitialized || !db) return [];

        try {
            const matchesRef = collection(db, 'global_matches');
            const q = query(
                matchesRef,
                where('participantUids', 'array-contains', uid),
                orderBy('timestamp', 'desc'),
                limit(maxResults)
            );

            const snapshot = await getDocs(q);

            return snapshot.docs.map(d => ({
                ...d.data() as GlobalMatchDoc,
            }));
        } catch (e) {
            logger.error('[OfficialMatchService] Failed to fetch player matches:', e);
            return [];
        }
    }
}
