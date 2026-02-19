import React from 'react';
import { Match } from '../store/historyStore';
import { resolveTheme } from '@lib/utils/colors';
import { Calendar, Clock, Trophy } from 'lucide-react';
import { formatDuration } from '../utils/statsAggregator';

interface MatchInfoProps {
    match: Match;
}

export const MatchInfo: React.FC<MatchInfoProps> = ({ match }) => {
    const themeA = resolveTheme(match.teamARoster?.color || 'indigo');
    const themeB = resolveTheme(match.teamBRoster?.color || 'rose');
    const isWinnerA = match.winner === 'A';

    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const totalPointsA = match.sets.reduce((sum, s) => sum + s.scoreA, 0);
    const totalPointsB = match.sets.reduce((sum, s) => sum + s.scoreB, 0);

    return (
        <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/60 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-3 border border-white/60 dark:border-white/10 ring-1 ring-inset ring-white/10 shadow-[0_1px_3px_rgba(0,0,0,0.04),inset_0_1px_0_0_rgba(255,255,255,0.15)] flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-slate-400 to-slate-500 text-white shadow-sm">
                        <Calendar size={16} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Data</span>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{formatDate(match.timestamp)}</span>
                    </div>
                </div>

                <div className="bg-white/60 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-3 border border-white/60 dark:border-white/10 ring-1 ring-inset ring-white/10 shadow-[0_1px_3px_rgba(0,0,0,0.04),inset_0_1px_0_0_rgba(255,255,255,0.15)] flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 text-white shadow-sm">
                        <Clock size={16} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Duração</span>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{formatDuration(match.durationSeconds)}</span>
                    </div>
                </div>
            </div>

            <div className="bg-white/60 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/60 dark:border-white/10 ring-1 ring-inset ring-white/10 shadow-[0_1px_3px_rgba(0,0,0,0.04),inset_0_1px_0_0_rgba(255,255,255,0.15)]">
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-black/5 dark:border-white/5">
                    <div className="p-1.5 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-sm shadow-indigo-500/30">
                        <Trophy size={14} />
                    </div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Sets</h3>
                </div>

                <div className="flex items-center justify-between gap-2">
                    <span className={`text-sm font-black truncate max-w-[100px] ${isWinnerA ? `${themeA.text} ${themeA.textDark}` : 'text-slate-500'}`}>
                        {match.teamAName}
                    </span>
                    <div className="flex items-center gap-1.5 flex-1 justify-center">
                        {match.sets.map((set, idx) => {
                            const setWinnerA = set.scoreA > set.scoreB;
                            return (
                                <div
                                    key={idx}
                                    className="flex flex-col items-center min-w-[44px] p-2 rounded-xl bg-slate-50 dark:bg-white/5"
                                >
                                    <span className="text-[9px] font-bold text-slate-400 mb-1">S{set.setNumber}</span>
                                    <span className={`text-sm font-black tabular-nums ${setWinnerA ? themeA.text : themeB.text}`}>
                                        {set.scoreA}-{set.scoreB}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                    <span className={`text-sm font-black truncate max-w-[100px] text-right ${!isWinnerA ? `${themeB.text} ${themeB.textDark}` : 'text-slate-500'}`}>
                        {match.teamBName}
                    </span>
                </div>

                <div className="mt-3 pt-2 border-t border-black/5 dark:border-white/5 flex items-center justify-center gap-4">
                    <span className={`text-lg font-black tabular-nums ${isWinnerA ? themeA.text : 'text-slate-400'}`}>{totalPointsA}</span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Pontos Totais</span>
                    <span className={`text-lg font-black tabular-nums ${!isWinnerA ? themeB.text : 'text-slate-400'}`}>{totalPointsB}</span>
                </div>
            </div>
        </div>
    );
};
