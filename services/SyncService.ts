
import { doc, setDoc, getDocs, collection, query, where, writeBatch } from 'firebase/firestore';
import { db, isFirebaseInitialized } from './firebase';
import { Match } from '../stores/historyStore';
import { PlayerProfile } from '../types';

/**
 * SyncService
 * Handles data synchronization between Local Store and Firebase Firestore.
 * Strategy: Local-First (Optimistic UI). Background Sync.
 */
export const SyncService = {
    
    /**
     * Uploads a single match to the user's private collection.
     */
    async pushMatch(userId: string, match: Match): Promise<boolean> {
        if (!isFirebaseInitialized || !db || !userId || !match.id) return false;
        
        try {
            // Path: users/{uid}/matches/{matchId}
            const matchRef = doc(db, 'users', userId, 'matches', match.id);
            // Sanitize undefined values (Firestore doesn't like them)
            const cleanMatch = JSON.parse(JSON.stringify(match));
            await setDoc(matchRef, cleanMatch, { merge: true });
            return true;
        } catch (e) {
            console.error('[Sync] Push Match failed', e);
            return false;
        }
    },

    /**
     * Uploads/Updates profiles to the user's private collection.
     * Uses Batch writes for efficiency.
     */
    async pushProfiles(userId: string, profiles: PlayerProfile[]): Promise<boolean> {
        if (!isFirebaseInitialized || !db || !userId || profiles.length === 0) return false;
        
        try {
            const batch = writeBatch(db);
            profiles.forEach(profile => {
                const ref = doc(db, 'users', userId, 'profiles', profile.id);
                const cleanProfile = JSON.parse(JSON.stringify(profile));
                batch.set(ref, cleanProfile, { merge: true });
            });
            await batch.commit();
            return true;
        } catch (e) {
            console.error('[Sync] Push Profiles failed', e);
            return false;
        }
    },

    /**
     * Pulls all matches for the user from Cloud.
     */
    async pullMatches(userId: string): Promise<Match[]> {
        if (!isFirebaseInitialized || !db || !userId) return [];
        
        try {
            const q = collection(db, 'users', userId, 'matches');
            const snapshot = await getDocs(q);
            const matches: Match[] = [];
            snapshot.forEach(doc => {
                matches.push(doc.data() as Match);
            });
            return matches;
        } catch (e) {
            console.error('[Sync] Pull Matches failed', e);
            return [];
        }
    },

    /**
     * Pulls all profiles for the user from Cloud.
     */
    async pullProfiles(userId: string): Promise<PlayerProfile[]> {
        if (!isFirebaseInitialized || !db || !userId) return [];
        
        try {
            const q = collection(db, 'users', userId, 'profiles');
            const snapshot = await getDocs(q);
            const profiles: PlayerProfile[] = [];
            snapshot.forEach(doc => {
                profiles.push(doc.data() as PlayerProfile);
            });
            return profiles;
        } catch (e) {
            console.error('[Sync] Pull Profiles failed', e);
            return [];
        }
    }
};
