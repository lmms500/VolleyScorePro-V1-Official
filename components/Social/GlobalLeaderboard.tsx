
import React, { useEffect, useState } from 'react';
import { SocialService } from '../../services/SocialService';
import { PlayerProfile } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Medal, Users, Crown, Search, Globe, Radio, PlayCircle, UserCheck } from 'lucide-react';
import { staggerContainer, staggerItem } from '../../utils/animations';

interface GlobalLeaderboardProps {
    onJoinMatch?: (code: string) => void;
}

export const GlobalLeaderboard: React.FC<GlobalLeaderboardProps> = ({ onJoinMatch }) => {
    const [subTab, setSubTab] = useState<'ranking' | 'live'>('ranking');
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
        return <span className="text-[10px] font-black text-slate-500">#{index + 1}</span>;
    };

    return (
        <div className="flex flex-col gap-4">
            {/* SUB-TABS SELECTOR */}
            <div className="flex gap-2 p-1 bg-slate-200 dark:bg-black/40 rounded-xl mx-1">
                <button 
                    onClick={() => setSubTab('ranking')}
                    className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2 ${subTab === 'ranking' ? 'bg-white dark:bg-slate-800 text-indigo-500 shadow-sm' : 'text-slate-500'}`}
                >
                    <Trophy size={14} /> Ranking
                </button>
                <button 
                    onClick={() => setSubTab('live')}
                    className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2 ${subTab === 'live' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500'}`}
                >
                    <Radio size={14} className={subTab === 'live' ? 'animate-pulse' : ''} /> Live Feed
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
                            className="w-full bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
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
                        {players.map((player, idx) => (
                            <motion.div 
                                key={player.id} variants={staggerItem}
                                className={`flex items-center justify-between p-4 rounded-2xl border bg-white dark:bg-white/[0.03] border-black/5 dark:border-white/5 transition-all ${idx === 0 ? 'ring-2 ring-amber-500/30 bg-amber-500/[0.02]' : ''}`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-8 flex items-center justify-center">{getRankBadge(idx)}</div>
                                    <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-white/10 flex items-center justify-center text-2xl shadow-inner border border-black/5 dark:border-white/10">
                                        {player.avatar || '👤'}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-black uppercase text-slate-800 dark:text-white truncate max-w-[120px]">{player.name}</span>
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-[9px] font-bold text-slate-400 uppercase">{player.role || 'Pro'}</span>
                                            <div className="w-1 h-1 rounded-full bg-slate-300" />
                                            <span className="text-[9px] font-bold text-indigo-500 uppercase">{player.stats?.matchesWon || 0} Wins</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400">
                                        <Star size={12} fill="currentColor" />
                                        <span className="text-lg font-black tabular-nums">{(player as any).impactScore || 0}</span>
                                    </div>
                                    <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Impact</span>
                                </div>
                            </motion.div>
                        ))}
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
                                    className="p-4 rounded-2xl bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 shadow-sm"
                                >
                                    <div className="flex justify-between items-center mb-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                            <span className="text-[10px] font-black uppercase text-red-500 tracking-widest">Live Now</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-100 dark:bg-white/10 rounded-lg text-[9px] font-bold text-slate-500">
                                            <Users size={10} /> {match.connectedCount || 1}
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center justify-between gap-4 mb-4">
                                        <div className="flex-1 text-right truncate font-black uppercase text-xs text-slate-700 dark:text-slate-200">{match.state.teamAName}</div>
                                        <div className="flex items-center gap-2 px-3 py-1 bg-slate-900 rounded-lg text-white font-black text-sm tabular-nums shadow-lg">
                                            {match.state.scoreA} : {match.state.scoreB}
                                        </div>
                                        <div className="flex-1 text-left truncate font-black uppercase text-xs text-slate-700 dark:text-slate-200">{match.state.teamBName}</div>
                                    </div>

                                    <button 
                                        onClick={() => onJoinMatch?.(match.id)}
                                        className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 active:scale-95"
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
