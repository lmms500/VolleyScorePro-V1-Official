import React from 'react';
import { SkillDistribution as SkillDistType, TeamStat } from '../utils/statsAggregator';
import { Match } from '../store/historyStore';
import { resolveTheme, getHexFromColor } from '@lib/utils/colors';
import { PieChart, Swords, Shield, Target, AlertTriangle } from 'lucide-react';

interface SkillDistributionProps {
    match: Match;
    teamStats: { A: TeamStat; B: TeamStat };
    distribution: SkillDistType;
}

export const SkillDistribution: React.FC<SkillDistributionProps> = ({ match, teamStats, distribution }) => {
    const themeA = resolveTheme(match.teamARoster?.color || 'indigo');
    const themeB = resolveTheme(match.teamBRoster?.color || 'rose');
    const hexA = getHexFromColor(match.teamARoster?.color || 'indigo');
    const hexB = getHexFromColor(match.teamBRoster?.color || 'rose');

    const totalA = teamStats.A.total;
    const totalB = teamStats.B.total;

    const createPiePath = (stats: TeamStat, startAngle: number = -90): { path: string; segments: { skill: string; percent: number; color: string; startAngle: number; endAngle: number }[] } => {
        const total = stats.attack + stats.block + stats.ace + stats.opponent_error;
        if (total === 0) return { path: '', segments: [] };

        const segments: { skill: string; percent: number; color: string; startAngle: number; endAngle: number }[] = [];
        const skills = [
            { key: 'attack', value: stats.attack, color: '#6366f1' },
            { key: 'block', value: stats.block, color: '#8b5cf6' },
            { key: 'ace', value: stats.ace, color: '#f59e0b' },
            { key: 'opponent_error', value: stats.opponent_error, color: '#94a3b8' }
        ];

        let currentAngle = startAngle;
        let pathD = '';
        const radius = 40;
        const cx = 50;
        const cy = 50;

        skills.forEach(skill => {
            if (skill.value === 0) return;

            const percent = skill.value / total;
            const angle = percent * 360;
            const endAngle = currentAngle + angle;

            const startRad = (currentAngle * Math.PI) / 180;
            const endRad = (endAngle * Math.PI) / 180;

            const x1 = cx + radius * Math.cos(startRad);
            const y1 = cy + radius * Math.sin(startRad);
            const x2 = cx + radius * Math.cos(endRad);
            const y2 = cy + radius * Math.sin(endRad);

            const largeArc = angle > 180 ? 1 : 0;

            pathD += `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z `;

            segments.push({
                skill: skill.key,
                percent: Math.round(percent * 100),
                color: skill.color,
                startAngle: currentAngle,
                endAngle: endAngle
            });

            currentAngle = endAngle;
        });

        return { path: pathD, segments };
    };

    const pieA = createPiePath(teamStats.A);
    const pieB = createPiePath(teamStats.B);

    if (totalA === 0 && totalB === 0) return null;

    const LegendItem = ({ label, color, icon: Icon }: { label: string; color: string; icon: any }) => (
        <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: color }} />
            <Icon size={10} className="text-slate-400" />
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">{label}</span>
        </div>
    );

    return (
        <div className="bg-white/60 dark:bg-white/5 backdrop-blur-sm rounded-3xl p-5 border border-white/60 dark:border-white/10 ring-1 ring-inset ring-white/10 shadow-[0_1px_3px_rgba(0,0,0,0.04),inset_0_1px_0_0_rgba(255,255,255,0.15)]">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-black/5 dark:border-white/5">
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-sm shadow-violet-500/30">
                    <PieChart size={14} />
                </div>
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Distribuição</h3>
            </div>

            <div className="flex items-center justify-around gap-4">
                <div className="flex flex-col items-center gap-2">
                    <svg viewBox="0 0 100 100" className="w-24 h-24">
                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="currentColor" strokeWidth="8" className="text-slate-100 dark:text-white/5" />
                        {pieA.path && (
                            <path d={pieA.path} fill={hexA} fillOpacity="0.6" stroke={hexA} strokeWidth="1" />
                        )}
                        <text x="50" y="50" textAnchor="middle" dominantBaseline="middle" className="text-lg font-black fill-slate-700 dark:fill-slate-200">
                            {totalA}
                        </text>
                    </svg>
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${themeA.text}`}>{match.teamAName}</span>
                </div>

                <div className="flex flex-col gap-2">
                    <div className="text-center mb-1">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">%</span>
                    </div>
                    <LegendItem label="Ataque" color="#6366f1" icon={Swords} />
                    <LegendItem label="Bloqueio" color="#8b5cf6" icon={Shield} />
                    <LegendItem label="Ace" color="#f59e0b" icon={Target} />
                    <LegendItem label="Erro" color="#94a3b8" icon={AlertTriangle} />
                </div>

                <div className="flex flex-col items-center gap-2">
                    <svg viewBox="0 0 100 100" className="w-24 h-24">
                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="currentColor" strokeWidth="8" className="text-slate-100 dark:text-white/5" />
                        {pieB.path && (
                            <path d={pieB.path} fill={hexB} fillOpacity="0.6" stroke={hexB} strokeWidth="1" />
                        )}
                        <text x="50" y="50" textAnchor="middle" dominantBaseline="middle" className="text-lg font-black fill-slate-700 dark:fill-slate-200">
                            {totalB}
                        </text>
                    </svg>
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${themeB.text}`}>{match.teamBName}</span>
                </div>
            </div>

            <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/5 grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-bold text-slate-400 uppercase text-center">Ataque</span>
                    <div className="flex items-center justify-center gap-2">
                        <span className={`text-sm font-black ${themeA.text}`}>{distribution.teamA.attack}%</span>
                        <span className="text-[9px] text-slate-300">vs</span>
                        <span className={`text-sm font-black ${themeB.text}`}>{distribution.teamB.attack}%</span>
                    </div>
                </div>
                <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-bold text-slate-400 uppercase text-center">Bloqueio</span>
                    <div className="flex items-center justify-center gap-2">
                        <span className={`text-sm font-black ${themeA.text}`}>{distribution.teamA.block}%</span>
                        <span className="text-[9px] text-slate-300">vs</span>
                        <span className={`text-sm font-black ${themeB.text}`}>{distribution.teamB.block}%</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
