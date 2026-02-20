
import React, { memo } from 'react';
import { Timer, Crown, Zap, TrendingUp, Skull, Plus, Minus, Volleyball } from 'lucide-react';
import { Team, TeamId } from '@types';
import { resolveTheme, getHexFromColor } from '@lib/utils/colors';
import { useTranslation } from '@contexts/LanguageContext';
import { useTimerValue } from '@contexts/TimerContext';
import { TeamLogo } from '@ui/TeamLogo';

interface CourtHeaderProps {
    teamA: Team;
    teamB: Team;
    scoreA: number;
    scoreB: number;
    setsA: number;
    setsB: number;
    currentSet: number;
    servingTeam: TeamId | null;
    timeoutsA: number;
    timeoutsB: number;
    onScore: (teamId: TeamId, delta: number) => void;
    onTimeoutA?: () => void;
    onTimeoutB?: () => void;
    isMatchPointA: boolean;
    isMatchPointB: boolean;
    isSetPointA: boolean;
    isSetPointB: boolean;
    isDeuce: boolean;
    inSuddenDeath: boolean;
    compact?: boolean;
}

const MiniBadge = memo(({ icon: Icon, colorClass, text }: any) => (
    <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider ${colorClass} shadow-lg border border-white/20 backdrop-blur-sm`}>
        <Icon size={9} fill="currentColor" />
        <span>{text}</span>
    </div>
));

const TimeoutControl = memo(({ onTimeout, count = 0, theme, color }: { onTimeout?: () => void, count?: number, theme: any, color?: string }) => {
    if (!onTimeout) return null;
    const isExhausted = count >= 2;
    const hexColor = getHexFromColor(color);

    return (
        <button
            onClick={() => { if (!isExhausted) onTimeout(); }}
            disabled={isExhausted}
            className={`
                flex flex-col items-center justify-center gap-1 p-1.5 rounded-xl border transition-all active:scale-95 h-10 w-10
                ${isExhausted
                    ? 'bg-slate-100/50 dark:bg-white/5 border-transparent opacity-40 cursor-not-allowed'
                    : 'bg-white/50 dark:bg-black/20 backdrop-blur-md border-white/40 dark:border-white/10 hover:border-white/70 dark:hover:border-white/20 shadow-[0_4px_12px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.4)] ring-1 ring-inset ring-white/20'}
            `}
        >
            <Timer size={14} className={isExhausted ? "text-slate-400" : theme.text} strokeWidth={2.5} />
            <div className="flex gap-0.5">
                <div
                    className={`w-1.5 h-1.5 rounded-full transition-all ${count >= 1 ? 'bg-slate-400 dark:bg-slate-500 opacity-40' : 'ring-2 ring-white/30'}`}
                    style={count < 1 ? { backgroundColor: hexColor, boxShadow: `0 0 6px rgba(255,255,255,0.5), 0 0 8px ${hexColor}80` } : {}}
                />
                <div
                    className={`w-1.5 h-1.5 rounded-full transition-all ${count >= 2 ? 'bg-slate-400 dark:bg-slate-500 opacity-40' : 'ring-2 ring-white/30'}`}
                    style={count < 2 ? { backgroundColor: hexColor, boxShadow: `0 0 6px rgba(255,255,255,0.5), 0 0 8px ${hexColor}80` } : {}}
                />
            </div>
        </button>
    );
});

const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
};

export const CourtHeader: React.FC<CourtHeaderProps> = memo(({
    teamA, teamB, scoreA, scoreB, setsA, setsB, currentSet, servingTeam,
    timeoutsA, timeoutsB, onScore, onTimeoutA, onTimeoutB,
    isMatchPointA, isMatchPointB, isSetPointA, isSetPointB, isDeuce, inSuddenDeath,
    compact
}) => {
    const { t } = useTranslation();
    const { seconds } = useTimerValue();
    const themeA = resolveTheme(teamA.color);
    const themeB = resolveTheme(teamB.color);

    return (
        <div className={`relative z-50 pt-safe-top pb-1 flex flex-col gap-1 shrink-0 min-h-fit bg-transparent pointer-events-none landscape:mt-2 ${compact ? 'px-2 overflow-x-hidden landscape:px-6' : 'px-4 landscape:px-8'}`}>
            <div className="flex items-center justify-center gap-3 pointer-events-auto">
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/40 dark:bg-white/10 backdrop-blur-md border border-white/30 dark:border-white/10 shadow-sm">
                    <Timer size={10} className="text-slate-500 dark:text-slate-400" />
                    <span className="text-[10px] font-mono font-bold text-slate-600 dark:text-slate-300">{formatTime(seconds)}</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/40 dark:bg-white/10 backdrop-blur-md border border-white/30 dark:border-white/10 shadow-sm">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Set</span>
                    <span className="text-[10px] font-black text-slate-700 dark:text-white">{currentSet}</span>
                </div>
            </div>

            <div className={`flex items-center justify-between mx-auto pointer-events-auto ${compact ? 'w-full gap-1' : 'max-w-md w-full'}`}>
                {/* TEAM A SCORE */}
                <div className={`flex items-center ${compact ? 'flex-1 min-w-0 gap-1' : 'gap-3'}`}>
                    <div className="flex flex-col items-end min-w-0">
                        <div className={`flex items-center mb-0.5 ${compact ? 'gap-1' : 'gap-1.5'}`}>
                            {isMatchPointA && <Crown size={compact ? 8 : 10} className="text-amber-500 dark:text-amber-400 flex-shrink-0" fill="currentColor" />}
                            {isSetPointA && <Zap size={compact ? 8 : 10} className={`${themeA.text} ${themeA.textDark} flex-shrink-0`} fill="currentColor" />}

                            {teamA.logo && (
                                <div className={`flex-shrink-0 ${compact ? 'w-5 h-5' : 'w-6 h-6'}`}>
                                    <TeamLogo src={teamA.logo} alt={teamA.name} className="w-full h-full object-contain drop-shadow-sm" />
                                </div>
                            )}

                            <span className={`text-[10px] font-black uppercase tracking-wider ${themeA.text} ${themeA.textDark} truncate ${compact ? 'max-w-[50px]' : 'max-w-[80px]'}`}>{teamA.name}</span>
                            {servingTeam === 'A' && (
                                <div
                                    className={`bg-white dark:bg-slate-900 rounded-full p-0.5 shadow-sm border ${themeA.border} flex items-center justify-center flex-shrink-0 animate-pulse`}
                                    style={{ filter: `drop-shadow(0 0 6px ${getHexFromColor(teamA.color)}99)` }}
                                >
                                    <Volleyball size={compact ? 10 : 12} className={themeA.text} fill="currentColor" fillOpacity={0.2} />
                                </div>
                            )}
                        </div>
                        <div className={`flex items-center ${compact ? 'gap-1' : 'gap-2'}`}>
                            <div className={`flex items-center bg-white/50 dark:bg-slate-800/40 rounded-xl p-1 border border-white/40 dark:border-white/10 backdrop-blur-md shadow-[0_4px_16px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.4)] ring-1 ring-inset ring-white/20 ${compact ? 'gap-1' : 'gap-2'}`}>
                                <button onClick={() => onScore('A', -1)} className={`${compact ? 'w-7 h-7' : 'w-8 h-8'} rounded-lg bg-slate-100/80 dark:bg-white/5 hover:bg-slate-200/80 dark:hover:bg-white/10 flex items-center justify-center text-slate-400 transition-colors`}><Minus size={compact ? 10 : 12} strokeWidth={3} /></button>
                                <span className={`${compact ? 'text-2xl min-w-[24px]' : 'text-3xl min-w-[32px]'} font-black tabular-nums leading-none text-center bg-gradient-to-br from-slate-800 to-slate-600 dark:from-white dark:to-slate-200 bg-clip-text text-transparent`}>{scoreA}</span>
                                <button onClick={() => onScore('A', 1)} className={`${compact ? 'w-7 h-7' : 'w-8 h-8'} rounded-lg ${themeA.bg} hover:${themeA.bg.replace('/20', '/35')} flex items-center justify-center ${themeA.text} ${themeA.textDark} border border-white/10 shadow-sm`}><Plus size={compact ? 10 : 12} strokeWidth={3} /></button>
                            </div>
                            <TimeoutControl onTimeout={onTimeoutA} count={timeoutsA} theme={themeA} color={teamA.color} />
                        </div>
                    </div>
                </div>

                {/* SETS */}
                <div className={`flex flex-col items-center justify-center flex-shrink-0 ${compact ? 'px-1' : 'px-3'}`}>
                    <div className={`flex flex-col items-center justify-center rounded-xl ${compact ? 'px-2 py-1' : 'px-3 py-1.5'} bg-white/40 dark:bg-white/10 backdrop-blur-md border border-white/30 dark:border-white/10 shadow-sm`}>
                        <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Sets</span>
                        <div className={`flex items-center font-black ${compact ? 'gap-1 text-base' : 'gap-2 text-lg'}`}>
                            <span className={`transition-colors ${setsA > setsB ? `${themeA.text} ${themeA.textDark}` : 'text-slate-400 dark:text-slate-500'}`}>{setsA}</span>
                            <span className="opacity-30 text-sm text-slate-400 dark:text-slate-500">:</span>
                            <span className={`transition-colors ${setsB > setsA ? `${themeB.text} ${themeB.textDark}` : 'text-slate-400 dark:text-slate-500'}`}>{setsB}</span>
                        </div>
                    </div>
                </div>

                {/* TEAM B SCORE */}
                {/* TEAM B SCORE */}
                <div className={`flex items-center flex-row-reverse ${compact ? 'flex-1 min-w-0 gap-1' : 'gap-3'}`}>
                    <div className="flex flex-col items-start min-w-0">
                        <div className={`flex items-center mb-0.5 flex-row-reverse ${compact ? 'gap-1' : 'gap-1.5'}`}>
                            {isMatchPointB && <Crown size={compact ? 8 : 10} className="text-amber-500 dark:text-amber-400 flex-shrink-0" fill="currentColor" />}
                            {isSetPointB && <Zap size={compact ? 8 : 10} className={`${themeB.text} ${themeB.textDark} flex-shrink-0`} fill="currentColor" />}

                            {teamB.logo && (
                                <div className={`flex-shrink-0 ${compact ? 'w-5 h-5' : 'w-6 h-6'}`}>
                                    <TeamLogo src={teamB.logo} alt={teamB.name} className="w-full h-full object-contain drop-shadow-sm" />
                                </div>
                            )}

                            <span className={`text-[10px] font-black uppercase tracking-wider ${themeB.text} ${themeB.textDark} truncate ${compact ? 'max-w-[50px]' : 'max-w-[80px]'}`}>{teamB.name}</span>
                            {servingTeam === 'B' && (
                                <div
                                    className={`bg-white dark:bg-slate-900 rounded-full p-0.5 shadow-sm border ${themeB.border} flex items-center justify-center flex-shrink-0 animate-pulse`}
                                    style={{ filter: `drop-shadow(0 0 6px ${getHexFromColor(teamB.color)}99)` }}
                                >
                                    <Volleyball size={compact ? 10 : 12} className={themeB.text} fill="currentColor" fillOpacity={0.2} />
                                </div>
                            )}
                        </div>
                        <div className={`flex items-center flex-row-reverse ${compact ? 'gap-1' : 'gap-2'}`}>
                            <div className={`flex items-center bg-white/50 dark:bg-slate-800/40 rounded-xl p-1 border border-white/40 dark:border-white/10 flex-row-reverse backdrop-blur-md shadow-[0_4px_16px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.4)] ring-1 ring-inset ring-white/20 ${compact ? 'gap-1' : 'gap-2'}`}>
                                <button onClick={() => onScore('B', -1)} className={`${compact ? 'w-7 h-7' : 'w-8 h-8'} rounded-lg bg-slate-100/80 dark:bg-white/5 hover:bg-slate-200/80 dark:hover:bg-white/10 flex items-center justify-center text-slate-400 transition-colors`}><Minus size={compact ? 10 : 12} strokeWidth={3} /></button>
                                <span className={`${compact ? 'text-2xl min-w-[24px]' : 'text-3xl min-w-[32px]'} font-black tabular-nums leading-none text-center bg-gradient-to-br from-slate-800 to-slate-600 dark:from-white dark:to-slate-200 bg-clip-text text-transparent`}>{scoreB}</span>
                                <button onClick={() => onScore('B', 1)} className={`${compact ? 'w-7 h-7' : 'w-8 h-8'} rounded-lg ${themeB.bg} hover:${themeB.bg.replace('/20', '/35')} flex items-center justify-center ${themeB.text} ${themeB.textDark} border border-white/10 shadow-sm`}><Plus size={compact ? 10 : 12} strokeWidth={3} /></button>
                            </div>
                            <TimeoutControl onTimeout={onTimeoutB} count={timeoutsB} theme={themeB} color={teamB.color} />
                        </div>
                    </div>
                </div>
            </div>

            {(inSuddenDeath || isDeuce || isMatchPointA || isMatchPointB) && (
                <div className="flex justify-center gap-2 mt-1 pointer-events-auto">
                    {inSuddenDeath && <MiniBadge icon={Skull} text={t('status.sudden_death')} colorClass="bg-gradient-to-br from-red-500 to-red-600 text-white" />}
                    {isDeuce && <MiniBadge icon={TrendingUp} text="DEUCE" colorClass="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white" />}
                    {(isMatchPointA || isMatchPointB) && <MiniBadge icon={Crown} text="MATCH POINT" colorClass="bg-gradient-to-br from-amber-400 to-amber-500 text-white" />}
                </div>
            )}
        </div>
    );
});
