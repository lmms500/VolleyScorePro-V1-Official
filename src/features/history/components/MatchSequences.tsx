import React from 'react';
import { SequenceStats } from '../utils/statsAggregator';
import { Match } from '../store/historyStore';
import { resolveTheme } from '@lib/utils/colors';
import { Flame, Zap, TrendingUp } from 'lucide-react';

interface MatchSequencesProps {
    match: Match;
    sequences: SequenceStats;
}

export const MatchSequences: React.FC<MatchSequencesProps> = ({ match, sequences }) => {
    const themeA = resolveTheme(match.teamARoster?.color || 'indigo');
    const themeB = resolveTheme(match.teamBRoster?.color || 'rose');

    const maxStreakA = sequences.teamA.longestStreak;
    const maxStreakB = sequences.teamB.longestStreak;
    const maxStreakOverall = Math.max(maxStreakA, maxStreakB, 1);

    return (
        <div className="bg-white/60 dark:bg-white/5 backdrop-blur-sm rounded-3xl p-5 border border-white/60 dark:border-white/10 ring-1 ring-inset ring-white/10 shadow-[0_1px_3px_rgba(0,0,0,0.04),inset_0_1px_0_0_rgba(255,255,255,0.15)]">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-black/5 dark:border-white/5">
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-sm shadow-orange-500/30">
                    <Flame size={14} />
                </div>
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Sequências</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${themeA.text}`}>{match.teamAName}</span>

                    <div className="flex items-center gap-2 bg-slate-50 dark:bg-white/5 rounded-xl p-2.5">
                        <Zap size={14} className={themeA.text} />
                        <div className="flex flex-col">
                            <span className="text-[9px] font-bold text-slate-400 uppercase">Maior Sequência</span>
                            <span className={`text-lg font-black tabular-nums ${themeA.text}`}>
                                {maxStreakA} pts
                            </span>
                        </div>
                    </div>

                    <div className="h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                        <div
                            className={`h-full ${themeA.bg} transition-all duration-500`}
                            style={{ width: `${(maxStreakA / maxStreakOverall) * 100}%` }}
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider text-right ${themeB.text}`}>{match.teamBName}</span>

                    <div className="flex items-center gap-2 bg-slate-50 dark:bg-white/5 rounded-xl p-2.5">
                        <Zap size={14} className={themeB.text} />
                        <div className="flex flex-col">
                            <span className="text-[9px] font-bold text-slate-400 uppercase">Maior Sequência</span>
                            <span className={`text-lg font-black tabular-nums ${themeB.text}`}>
                                {maxStreakB} pts
                            </span>
                        </div>
                    </div>

                    <div className="h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                        <div
                            className={`h-full ${themeB.bg} transition-all duration-500 ml-auto`}
                            style={{ width: `${(maxStreakB / maxStreakOverall) * 100}%` }}
                        />
                    </div>
                </div>
            </div>

            <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/5 flex items-center justify-center gap-6">
                <div className="flex items-center gap-2">
                    <TrendingUp size={14} className="text-slate-400" />
                    <span className="text-[10px] text-slate-500 font-medium">
                        Rallies: <span className={`font-bold ${themeA.text}`}>{sequences.teamA.totalRallies}</span>
                        <span className="mx-1">vs</span>
                        <span className={`font-bold ${themeB.text}`}>{sequences.teamB.totalRallies}</span>
                    </span>
                </div>
            </div>
        </div>
    );
};
