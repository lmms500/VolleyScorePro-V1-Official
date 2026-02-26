
import React, { useEffect, useState } from 'react';
import { SocialService } from '../services/SocialService';
import { PlayerProfile } from '@types';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Medal, Users, Crown, Search, Globe, Radio, PlayCircle, UserCheck, UserPlus, Zap } from 'lucide-react';
import { staggerContainer, staggerItem } from '@lib/utils/animations';
import { usePlayerProfiles } from '@features/teams/hooks/usePlayerProfiles';
import { useAuth } from '@contexts/AuthContext';

interface GlobalLeaderboardProps {
    onJoinMatch?: (code: string) => void;
}

export const GlobalLeaderboard: React.FC<GlobalLeaderboardProps> = ({ onJoinMatch }) => {
    const [subTab, setSubTab] = useState<'ranking' | 'friends' | 'live'>('ranking');
    const { profiles, upsertProfile } = usePlayerProfiles();
    const { user } = useAuth();
    const [players, setPlayers] = useState<PlayerProfile[]>([]);
    const [liveMatches, setLiveMatches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchData = async () => {
        setLoading(true);
        const social = SocialService.getInstance();
        if (subTab === 'ranking') {
            const data = await social.getGlobalRanking(searchTerm);
            setPlayers(data);
        } else if (subTab === 'friends') {
            const myProfile = Array.from(profiles.values()).find(p => p.firebaseUid === user?.uid);
            const friendsUids = myProfile?.friends || [];
            const data = await social.getFriendsRanking(friendsUids);
            setPlayers(data);
        } else {
            const matches = await social.getPublicLiveMatches();
            setLiveMatches(matches);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, [subTab]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchData();
    };

    const getRankBadge = (index: number) => {
        if (index === 0) return <Crown className="text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" size={20} />;
        if (index === 1) return <Medal className="text-slate-300" size={18} />;
        if (index === 2) return <Medal className="text-orange-400" size={18} />;
        return <span className="text-[10px] font-black text-slate-400 dark:text-slate-500">#{index + 1}</span>;
    };

    const handleToggleFollow = async (targetUid: string) => {
        const myProfile = Array.from(profiles.values()).find(p => p.firebaseUid === user?.uid);
        if (!myProfile) return;

        const currentFriends = myProfile.friends || [];
        const isFollowing = currentFriends.includes(targetUid);

        const newFriends = isFollowing
            ? currentFriends.filter(uid => uid !== targetUid)
            : [...currentFriends, targetUid];

        upsertProfile(myProfile.name, myProfile.skillLevel, myProfile.id, {
            ...myProfile,
            friends: newFriends
        });

        // Opcional: Notificar o SocialService para persistir a relação no global
        await SocialService.getInstance().toggleFollow(myProfile.id, targetUid);
    };

    return (
        <div className="flex flex-col gap-4">
            {/* SUB-TABS SELECTOR */}
            <div className="flex gap-1 p-1 bg-slate-200 dark:bg-black/40 rounded-xl mx-1 shadow-inner ring-1 ring-inset ring-black/5 dark:ring-white/5">
                <button
                    onClick={() => setSubTab('ranking')}
                    className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase transition-all flex items-center justify-center gap-1.5 ${subTab === 'ranking' ? 'bg-white dark:bg-slate-800 text-indigo-500 shadow-sm ring-1 ring-inset ring-black/5 dark:ring-white/10' : 'text-slate-500'}`}
                >
                    <Globe size={14} /> Global
                </button>
                <button
                    onClick={() => setSubTab('friends')}
                    className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase transition-all flex items-center justify-center gap-1.5 ${subTab === 'friends' ? 'bg-white dark:bg-slate-800 text-indigo-500 shadow-sm ring-1 ring-inset ring-black/5 dark:ring-white/10' : 'text-slate-500'}`}
                >
                    <Star size={14} /> Amigos
                </button>
                <button
                    onClick={() => setSubTab('live')}
                    className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase transition-all flex items-center justify-center gap-1.5 ${subTab === 'live' ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'text-slate-500'}`}
                >
                    <Radio size={14} className={subTab === 'live' ? 'animate-pulse' : ''} /> Ao Vivo
                </button>
            </div>

            {/* SEARCH BAR (Only for ranking) */}
            {subTab === 'ranking' && (
                <form onSubmit={handleSearch} className="px-1">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                        <input
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Buscar jogador..."
                            className="w-full bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-black/5 dark:border-white/10 ring-1 ring-inset ring-white/10 dark:ring-white/5 rounded-xl pl-9 pr-4 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/30 shadow-sm transition-all"
                        />
                    </div>
                </form>
            )}

            <AnimatePresence mode="wait">
                {loading ? (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center py-20 gap-4"
                    >
                        <Globe className="text-indigo-500 animate-spin" size={32} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Syncing Global Data...</span>
                    </motion.div>
                ) : subTab === 'ranking' ? (
                    <motion.div
                        key="ranking-list"
                        variants={staggerContainer} initial="hidden" animate="visible"
                        className="flex flex-col gap-2 px-1 pb-20"
                    >
                        {players.map((player, idx) => {
                            const isMe = player.firebaseUid === user?.uid;
                            const myProfile = Array.from(profiles.values()).find(p => p.firebaseUid === user?.uid);
                            const isFollowing = myProfile?.friends?.includes(player.firebaseUid || '');
                            const experience = (player as any).experience || player.stats?.experience || 0;
                            const level = (player as any).level || player.stats?.level || 1;

                            return (
                                <motion.div
                                    key={player.id} variants={staggerItem}
                                    className={`flex items-center justify-between p-4 rounded-2xl border bg-white/80 dark:bg-white/[0.03] backdrop-blur-sm border-black/5 dark:border-white/5 shadow-sm hover:shadow-md transition-all ${idx === 0 && (subTab as string) === 'ranking' ? 'ring-2 ring-inset ring-amber-500/30 bg-amber-500/[0.02]' : 'ring-1 ring-inset ring-white/10 dark:ring-white/5'}`}
                                >
                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                        <div className="w-6 flex items-center justify-center flex-shrink-0">{getRankBadge(idx)}</div>
                                        <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-white/10 flex items-center justify-center text-2xl shadow-inner border border-black/5 dark:border-white/10 overflow-hidden flex-shrink-0">
                                            {player.avatar ? (
                                                player.avatar.startsWith('http') || player.avatar.length > 30 ? (
                                                    <img src={player.avatar} alt={player.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    player.avatar
                                                )
                                            ) : (
                                                '👤'
                                            )}
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-sm font-black uppercase text-slate-800 dark:text-white truncate">{player.name}</span>
                                                {isMe && <span className="text-[8px] font-black bg-indigo-500 text-white px-1 rounded-sm uppercase tracking-tighter">VOCÊ</span>}
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <div className="flex items-center gap-0.5 px-1.5 py-0.5 bg-amber-500/10 rounded text-amber-600 dark:text-amber-400 text-[8px] font-black uppercase">
                                                    <Zap size={8} fill="currentColor" /> LVL {level}
                                                </div>
                                                <div className="w-1 h-1 rounded-full bg-slate-300" />
                                                <span className="text-[9px] font-bold text-slate-400 uppercase truncate">{player.role || 'Player'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 ml-2">
                                        <div className="text-right flex-shrink-0">
                                            <span className="block text-sm font-black text-indigo-600 dark:text-indigo-400 tabular-nums">
                                                {experience.toLocaleString()}
                                            </span>
                                            <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest">XP</span>
                                        </div>

                                        {!isMe && player.firebaseUid && (
                                            <button
                                                onClick={() => handleToggleFollow(player.firebaseUid!)}
                                                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${isFollowing ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20' : 'bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-indigo-500 hover:bg-white dark:hover:bg-white/10 border border-black/5 dark:border-white/10'}`}
                                                title={isFollowing ? "Deixar de seguir" : "Seguir jogador"}
                                            >
                                                {isFollowing ? <UserCheck size={18} /> : <UserPlus size={18} />}
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                ) : (
                    <motion.div
                        key="live-matches"
                        variants={staggerContainer} initial="hidden" animate="visible"
                        className="flex flex-col gap-3 px-1 pb-20"
                    >
                        {liveMatches.length === 0 ? (
                            <div className="py-20 text-center flex flex-col items-center gap-3 opacity-40">
                                <Radio size={32} className="text-slate-400" />
                                <span className="text-xs font-bold uppercase tracking-widest">Nenhuma partida pública agora</span>
                            </div>
                        ) : (
                            liveMatches.map((match) => (
                                <motion.div
                                    key={match.id} variants={staggerItem}
                                    className="p-4 rounded-2xl bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-black/5 dark:border-white/10 ring-1 ring-inset ring-white/5 shadow-sm"
                                >
                                    <div className="flex justify-between items-center mb-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                            <span className="text-[10px] font-black uppercase text-red-500 tracking-widest">Live Now</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-100 dark:bg-white/10 rounded-lg text-[9px] font-bold text-slate-500 ring-1 ring-inset ring-black/5 dark:ring-white/5">
                                            <Users size={10} /> {match.connectedCount || 1}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between gap-4 mb-4">
                                        <div className="flex-1 text-right truncate font-black uppercase text-xs text-slate-700 dark:text-slate-200">{match.state.teamAName}</div>
                                        <div className="flex items-center gap-2 px-3 py-1 bg-slate-900 rounded-lg text-white font-black text-sm tabular-nums shadow-lg ring-1 ring-inset ring-white/5">
                                            {match.state.scoreA} : {match.state.scoreB}
                                        </div>
                                        <div className="flex-1 text-left truncate font-black uppercase text-xs text-slate-700 dark:text-slate-200">{match.state.teamBName}</div>
                                    </div>

                                    <button
                                        onClick={() => onJoinMatch?.(match.id)}
                                        className="w-full py-3 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-indigo-500/30 ring-1 ring-inset ring-white/10 transition-all flex items-center justify-center gap-2 active:scale-95"
                                    >
                                        <PlayCircle size={16} /> Assistir Partida
                                    </button>
                                </motion.div>
                            ))
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
