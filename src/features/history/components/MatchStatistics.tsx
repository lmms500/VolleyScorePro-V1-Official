import React, { useMemo } from 'react';
import { Match } from '../store/historyStore';
import { resolveTheme } from '@lib/utils/colors';
import {
    Swords, Shield, Target, AlertTriangle,
    Trophy, BarChart2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { calculateMatchStats, PlayerStat } from '../utils/statsAggregator';

interface MatchStatisticsProps {
    match: Match;
}

export const MatchStatistics: React.FC<MatchStatisticsProps> = ({ match }) => {
    const themeA = resolveTheme(match.teamARoster?.color || 'indigo');
    const themeB = resolveTheme(match.teamBRoster?.color || 'rose');

    // --- AGGREGATION LOGIC ---
    const stats = useMemo(() => calculateMatchStats(match), [match]);

    // --- COMPONENT: STAT BAR ---
    const StatBar = ({ label, valueA, valueB, icon: Icon }: { label: string, valueA: number, valueB: number, icon: any }) => {
        const total = (valueA + valueB) || 1;
        const percentA = Math.round((valueA / total) * 100);
        const percentB = Math.round((valueB / total) * 100);

        return (
            <div className="flex flex-col gap-1.5 w-full mb-4 last:mb-0">
                <div className="flex items-center justify-between px-0 w-full text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                    <span className={`tabular-nums ${valueA > valueB ? `${themeA.text} ${themeA.textDark}` : ''}`}>{valueA}</span>
                    <div className="flex items-center gap-1.5 opacity-80">
                        {Icon && <Icon size={12} />}
                        <span>{label}</span>
                    </div>
                    <span className={`tabular-nums ${valueB > valueA ? `${themeB.text} ${themeB.textDark}` : ''}`}>{valueB}</span>
                </div>

                <div className="flex h-2 w-full rounded-full overflow-hidden bg-slate-100 dark:bg-white/5">
                    <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${percentA}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className={`h-full ${themeA.bg} relative z-10`}
                    />
                    <div className="w-0.5 bg-transparent" />
                    <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${percentB}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className={`h-full ${themeB.bg} relative z-10`}
                    />
                </div>
            </div>
        );
    };

    // --- COMPONENT: HIGHLIGHT CARD ---
    const HighlightCard = ({ title, player, icon: Icon, valueStr }: { title: string, player?: PlayerStat, icon: any, valueStr?: string }) => {
        if (!player || player.points === 0) return null;
        return (
            <div className="bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-white/60 dark:border-white/10 ring-1 ring-inset ring-white/10 shadow-[0_1px_3px_rgba(0,0,0,0.04),inset_0_1px_0_0_rgba(255,255,255,0.15)] rounded-2xl p-3 flex items-center gap-3 min-w-[140px] flex-1">
                <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-sm shadow-indigo-500/30">
                    <Icon size={16} />
                </div>
                <div className="flex flex-col">
                    <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">{title}</span>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate max-w-[100px]">{player.name}</span>
                    <span className="text-[10px] font-mono text-indigo-500 dark:text-indigo-400">{valueStr}</span>
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col gap-6">

            {/* HIGHLIGHTS SECTION */}
            <div className="flex flex-wrap gap-2">
                <HighlightCard
                    title="Best Scorer"
                    player={stats.topScorer}
                    icon={Trophy}
                    valueStr={`${stats.topScorer?.points} pts`}
                />
                <HighlightCard
                    title="Best Attack"
                    player={stats.topAttacker}
                    icon={Swords}
                    valueStr={`${stats.topAttacker?.skills.attack} kills`}
                />
                <HighlightCard
                    title="Best Blocker"
                    player={stats.topBlocker}
                    icon={Shield}
                    valueStr={`${stats.topBlocker?.skills.block} blocks`}
                />
                <HighlightCard
                    title="Best Server"
                    player={stats.topServer}
                    icon={Target}
                    valueStr={`${stats.topServer?.skills.ace} aces`}
                />
            </div>

            {/* FUNDAMENTALS BREAKDOWN */}
            <div className="bg-white/60 dark:bg-white/5 backdrop-blur-sm rounded-3xl p-5 border border-white/60 dark:border-white/10 ring-1 ring-inset ring-white/10 shadow-[0_1px_3px_rgba(0,0,0,0.04),inset_0_1px_0_0_rgba(255,255,255,0.15)]">
                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-black/5 dark:border-white/5">
                    <div className="p-1.5 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-sm shadow-indigo-500/30"><BarChart2 size={14} /></div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Match Fundamentals</h3>
                </div>

                <StatBar
                    label="Attack Points"
                    valueA={stats.teamStats.A.attack}
                    valueB={stats.teamStats.B.attack}
                    icon={Swords}
                />
                <StatBar
                    label="Block Points"
                    valueA={stats.teamStats.A.block}
                    valueB={stats.teamStats.B.block}
                    icon={Shield}
                />
                <StatBar
                    label="Ace Points"
                    valueA={stats.teamStats.A.ace}
                    valueB={stats.teamStats.B.ace}
                    icon={Target}
                />
                <StatBar
                    label="Opponent Errors"
                    valueA={stats.teamStats.A.opponent_error}
                    valueB={stats.teamStats.B.opponent_error}
                    icon={AlertTriangle}
                />
            </div>

        </div>
    );
};
