
import { 
    collection, query, orderBy, limit, getDocs, 
    where, doc, setDoc, serverTimestamp 
} from 'firebase/firestore';
import { db, isFirebaseInitialized } from '@lib/firebase';
import { PlayerProfile, GameState } from '@types';

export class SocialService {
    private static instance: SocialService;

    private constructor() {}

    public static getInstance() {
        if (!SocialService.instance) SocialService.instance = new SocialService();
        return SocialService.instance;
    }

    public async getGlobalRanking(searchTerm?: string): Promise<PlayerProfile[]> {
        if (!isFirebaseInitialized || !db) return [];

        try {
            const rankingRef = collection(db, 'global_leaderboard');
            let q = query(rankingRef, orderBy('impactScore', 'desc'), limit(50));
            
            // Nota: Firestore exige índices complexos para busca por texto + ordenação.
            // Para simplicidade Pro, filtramos localmente se houver busca, ou usamos prefixo.
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

    public async publishToLeaderboard(profile: PlayerProfile) {
        if (!isFirebaseInitialized || !db || !profile.isPublic || !profile.stats) return;

        const score = (profile.stats.matchesWon * 10) + profile.stats.totalPoints;
        const ref = doc(db, 'global_leaderboard', profile.id);

        await setDoc(ref, {
            name: profile.name,
            avatar: profile.avatar,
            skillLevel: profile.skillLevel,
            role: profile.role,
            impactScore: score,
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
}
