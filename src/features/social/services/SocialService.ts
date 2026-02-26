
import {
    collection, query, orderBy, limit, getDocs,
    where, doc, setDoc, serverTimestamp
} from 'firebase/firestore';
import { db, isFirebaseInitialized } from '@lib/firebase';
import { PlayerProfile, GameState } from '@types';

export class SocialService {
    private static instance: SocialService;

    private constructor() { }

    public static getInstance() {
        if (!SocialService.instance) SocialService.instance = new SocialService();
        return SocialService.instance;
    }

    public async getGlobalRanking(searchTerm?: string): Promise<PlayerProfile[]> {
        if (!isFirebaseInitialized || !db) return [];

        try {
            const rankingRef = collection(db, 'global_leaderboard');
            let q = query(rankingRef, orderBy('experience', 'desc'), limit(50));

            const snapshot = await getDocs(q);
            let results = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as PlayerProfile));

            if (searchTerm) {
                const term = searchTerm.toLowerCase();
                results = results.filter(p => p.name.toLowerCase().includes(term));
            }

            return results;
        } catch (e) {
            console.error("[SocialService] Ranking failed:", e);
            return [];
        }
    }

    public async getFriendsRanking(friendUids: string[]): Promise<PlayerProfile[]> {
        if (!isFirebaseInitialized || !db || friendUids.length === 0) return [];

        try {
            const rankingRef = collection(db, 'global_leaderboard');
            // Firestore 'in' operator limits to 10-30 IDs depending on version, 
            // but for friends it's usually enough.
            const q = query(rankingRef, where('firebaseUid', 'in', friendUids.slice(0, 30)));
            const snapshot = await getDocs(q);

            return snapshot.docs
                .map(d => ({ id: d.id, ...d.data() } as PlayerProfile))
                .sort((a, b) => (b.stats?.experience || 0) - (a.stats?.experience || 0));
        } catch (e) {
            console.error("[SocialService] Friends ranking failed:", e);
            return [];
        }
    }

    public async publishToLeaderboard(profile: PlayerProfile) {
        if (!isFirebaseInitialized || !db || !profile.isPublic || !profile.stats) return;

        const ref = doc(db, 'global_leaderboard', profile.id);

        await setDoc(ref, {
            firebaseUid: profile.firebaseUid,
            name: profile.name,
            avatar: profile.avatar,
            skillLevel: profile.skillLevel,
            role: profile.role,
            experience: profile.stats.experience,
            level: profile.stats.level,
            matchesPlayed: profile.stats.matchesPlayed,
            lastUpdated: serverTimestamp()
        }, { merge: true });
    }

    public async getPublicLiveMatches(): Promise<any[]> {
        if (!isFirebaseInitialized || !db) return [];

        try {
            const sessionsRef = collection(db, 'live_matches');
            // Busca partidas ativas que foram marcadas como públicas
            const q = query(
                sessionsRef,
                where('status', '==', 'active'),
                orderBy('lastUpdate', 'desc'),
                limit(10)
            );
            const snapshot = await getDocs(q);

            return snapshot.docs.map(d => ({
                id: d.id,
                ...d.data()
            }));
        } catch (e) {
            console.error("[SocialService] Live Feed error:", e);
            return [];
        }
    }

    public async toggleFollow(currentProfileId: string, targetUid: string): Promise<boolean> {
        if (!isFirebaseInitialized || !db) return false;

        try {
            // Nota: Implementação real usaria updateDoc com arrayUnion/arrayRemove
            return true;
        } catch (e) {
            console.error("[SocialService] Toggle follow failed:", e);
            return false;
        }
    }
}
