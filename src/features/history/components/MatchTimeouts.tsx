import React from 'react';
import { TimeoutStats } from '../utils/statsAggregator';
import { Match } from '../store/historyStore';
import { resolveTheme } from '@lib/utils/colors';
import { Timer, Clock } from 'lucide-react';

interface MatchTimeoutsProps {
    match: Match;
    timeouts: TimeoutStats;
}

export const MatchTimeouts: React.FC<MatchTimeoutsProps> = ({ match, timeouts }) => {
    const themeA = resolveTheme(match.teamARoster?.color || 'indigo');
    const themeB = resolveTheme(match.teamBRoster?.color || 'rose');

    const totalTimeouts = timeouts.teamA.total + timeouts.teamB.total;

    if (totalTimeouts === 0) {
        return null;
    }

    return (
        <div className="bg-white/60 dark:bg-white/5 backdrop-blur-sm rounded-3xl p-5 border border-white/60 dark:border-white/10 ring-1 ring-inset ring-white/10 shadow-[0_1px_3px_rgba(0,0,0,0.04),inset_0_1px_0_0_rgba(255,255,255,0.15)]">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-black/5 dark:border-white/5">
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 text-white shadow-sm shadow-cyan-500/30">
                    <Timer size={14} />
                </div>
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Timeouts</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${themeA.text}`}>{match.teamAName}</span>
                        <span className={`text-lg font-black tabular-nums ${themeA.text}`}>{timeouts.teamA.total}</span>
                    </div>

                    {timeouts.teamA.moments.length > 0 && (
                        <div className="flex flex-col gap-1">
                            {timeouts.teamA.moments.map((moment, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-[10px] text-slate-500 bg-slate-50 dark:bg-white/5 rounded-lg px-2 py-1">
                                    <Clock size={10} className="text-slate-400" />
                                    <span>S{moment.setNumber}</span>
                                    <span className="font-mono font-bold text-slate-600 dark:text-slate-300">
                                        {moment.scoreA}-{moment.scoreB}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}

                    {timeouts.teamA.total === 0 && (
                        <span className="text-[10px] text-slate-400 italic">Nenhum timeout</span>
                    )}
                </div>

                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-bold uppercase tracking-wider text-right ${themeB.text}`}>{match.teamBName}</span>
                        <span className={`text-lg font-black tabular-nums ${themeB.text}`}>{timeouts.teamB.total}</span>
                    </div>

                    {timeouts.teamB.moments.length > 0 && (
                        <div className="flex flex-col gap-1">
                            {timeouts.teamB.moments.map((moment, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-[10px] text-slate-500 bg-slate-50 dark:bg-white/5 rounded-lg px-2 py-1">
                                    <Clock size={10} className="text-slate-400" />
                                    <span>S{moment.setNumber}</span>
                                    <span className="font-mono font-bold text-slate-600 dark:text-slate-300">
                                        {moment.scoreA}-{moment.scoreB}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}

                    {timeouts.teamB.total === 0 && (
                        <span className="text-[10px] text-slate-400 italic text-right">Nenhum timeout</span>
                    )}
                </div>
            </div>
        </div>
    );
};
