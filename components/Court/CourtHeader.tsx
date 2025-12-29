
import React, { memo } from 'react';
import { Timer, Crown, Zap, TrendingUp, Skull, Plus, Minus } from 'lucide-react';
import { Team, TeamId } from '../../types';
import { resolveTheme } from '../../utils/colors';
import { useTranslation } from '../../contexts/LanguageContext';
import { useTimerValue } from '../../contexts/TimerContext';
import { TeamLogo } from '../ui/TeamLogo';

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
}

const MiniBadge = memo(({ icon: Icon, colorClass, text }: any) => (
    <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider ${colorClass} shadow-sm border border-white/10`}>
        <Icon size={8} fill="currentColor" />
        <span>{text}</span>
    </div>
));

const TimeoutControl = memo(({ onTimeout, count = 0, theme }: { onTimeout?: () => void, count?: number, theme: any }) => {
    if (!onTimeout) return null;
    const isExhausted = count >= 2;
    
    return (
        <button 
            onClick={() => { if(!isExhausted) onTimeout(); }}
            disabled={isExhausted}
            className={`
                flex flex-col items-center justify-center gap-1 p-1.5 rounded-xl border transition-all active:scale-95 h-10 w-10
                ${isExhausted 
                    ? 'bg-slate-100 dark:bg-white/5 border-transparent opacity-50 cursor-not-allowed' 
                    : 'bg-white dark:bg-black/20 border-slate-200 dark:border-white/10 hover:border-indigo-500/50 shadow-sm'}
            `}
        >
            <Timer size={14} className={isExhausted ? "text-slate-400" : theme.text} />
            <div className="flex gap-0.5">
                <div className={`w-1.5 h-1.5 rounded-full ${count >= 1 ? 'bg-slate-300 dark:bg-slate-600' : theme.bg.replace('/20','')}`} />
                <div className={`w-1.5 h-1.5 rounded-full ${count >= 2 ? 'bg-slate-300 dark:bg-slate-600' : theme.bg.replace('/20','')}`} />
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
    isMatchPointA, isMatchPointB, isSetPointA, isSetPointB, isDeuce, inSuddenDeath
}) => {
    const { t } = useTranslation();
    const { seconds } = useTimerValue();
    const themeA = resolveTheme(teamA.color);
    const themeB = resolveTheme(teamB.color);

    return (
        <div className="relative z-50 pt-safe-top px-4 pb-1 flex flex-col gap-1 shrink-0 bg-transparent pointer-events-none">
            <div className="flex items-center justify-center gap-3 text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 opacity-80 pointer-events-auto">
                <div className="flex items-center gap-1"><Timer size={10} /> {formatTime(seconds)}</div>
                <div className="w-px h-3 bg-slate-300 dark:bg-white/20" />
                <div className="uppercase tracking-widest text-slate-400 dark:text-slate-300">Set {currentSet}</div>
            </div>
            
            <div className="flex items-center justify-between max-w-md mx-auto w-full pointer-events-auto">
                {/* TEAM A SCORE */}
                <div className="flex items-center gap-3">
                    <div className="flex flex-col items-end">
                        <div className="flex items-center gap-1.5 mb-0.5">
                            {isMatchPointA && <Crown size={10} className="text-amber-500 dark:text-amber-400" fill="currentColor" />}
                            {isSetPointA && <Zap size={10} className={`${themeA.text} ${themeA.textDark}`} fill="currentColor" />}
                            
                            {teamA.logo && (
                                <div className="w-6 h-6 flex-shrink-0">
                                    <TeamLogo src={teamA.logo} alt={teamA.name} className="w-full h-full object-contain drop-shadow-sm" />
                                </div>
                            )}
                            
                            <span className={`text-[10px] font-black uppercase tracking-wider ${themeA.text} ${themeA.textDark} truncate max-w-[80px]`}>{teamA.name}</span>
                            {servingTeam === 'A' && <div className={`w-1.5 h-1.5 rounded-full ${themeA.bg.replace('/20', '')} shadow-[0_0_8px_currentColor]`} />}
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-2 bg-white/60 dark:bg-slate-800/50 rounded-xl p-1 border border-slate-200 dark:border-white/5 backdrop-blur-sm shadow-sm">
                                <button onClick={() => onScore('A', -1)} className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 flex items-center justify-center text-slate-400 transition-colors"><Minus size={12} strokeWidth={3} /></button>
                                <span className="text-3xl font-black tabular-nums leading-none min-w-[32px] text-center text-slate-800 dark:text-white">{scoreA}</span>
                                <button onClick={() => onScore('A', 1)} className={`w-8 h-8 rounded-lg ${themeA.bg} hover:${themeA.bg.replace('/20', '/30')} flex items-center justify-center ${themeA.text} ${themeA.textDark}`}><Plus size={12} strokeWidth={3} /></button>
                            </div>
                            <TimeoutControl onTimeout={onTimeoutA} count={timeoutsA} theme={themeA} />
                        </div>
                    </div>
                </div>

                {/* SETS */}
                <div className="flex flex-col items-center justify-center px-3">
                    <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Sets</span>
                    <div className="flex items-center gap-2 text-lg font-black text-slate-400 dark:text-slate-300">
                        <span className={setsA > setsB ? `${themeA.text} ${themeA.textDark}` : ''}>{setsA}</span>
                        <span className="opacity-30 text-sm">:</span>
                        <span className={setsB > setsA ? `${themeB.text} ${themeB.textDark}` : ''}>{setsB}</span>
                    </div>
                </div>

                {/* TEAM B SCORE */}
                <div className="flex items-center gap-3 flex-row-reverse">
                    <div className="flex flex-col items-start">
                        <div className="flex items-center gap-1.5 mb-0.5 flex-row-reverse">
                            {isMatchPointB && <Crown size={10} className="text-amber-500 dark:text-amber-400" fill="currentColor" />}
                            {isSetPointB && <Zap size={10} className={`${themeB.text} ${themeB.textDark}`} fill="currentColor" />}
                            
                            {teamB.logo && (
                                <div className="w-6 h-6 flex-shrink-0">
                                    <TeamLogo src={teamB.logo} alt={teamB.name} className="w-full h-full object-contain drop-shadow-sm" />
                                </div>
                            )}

                            <span className={`text-[10px] font-black uppercase tracking-wider ${themeB.text} ${themeB.textDark} truncate max-w-[80px]`}>{teamB.name}</span>
                            {servingTeam === 'B' && <div className={`w-1.5 h-1.5 rounded-full ${themeB.bg.replace('/20', '')} shadow-[0_0_8px_currentColor]`} />}
                        </div>
                        <div className="flex items-center gap-2 flex-row-reverse">
                            <div className="flex items-center gap-2 bg-white/60 dark:bg-slate-800/50 rounded-xl p-1 border border-slate-200 dark:border-white/5 flex-row-reverse backdrop-blur-sm shadow-sm">
                                <button onClick={() => onScore('B', -1)} className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 flex items-center justify-center text-slate-400 transition-colors"><Minus size={12} strokeWidth={3} /></button>
                                <span className="text-3xl font-black tabular-nums leading-none min-w-[32px] text-center text-slate-800 dark:text-white">{scoreB}</span>
                                <button onClick={() => onScore('B', 1)} className={`w-8 h-8 rounded-lg ${themeB.bg} hover:${themeB.bg.replace('/20', '/30')} flex items-center justify-center ${themeB.text} ${themeB.textDark}`}><Plus size={12} strokeWidth={3} /></button>
                            </div>
                            <TimeoutControl onTimeout={onTimeoutB} count={timeoutsB} theme={themeB} />
                        </div>
                    </div>
                </div>
            </div>

            {(inSuddenDeath || isDeuce || isMatchPointA || isMatchPointB) && (
                <div className="flex justify-center gap-2 mt-1 pointer-events-auto">
                    {inSuddenDeath && <MiniBadge icon={Skull} text={t('status.sudden_death')} colorClass="bg-red-500 text-white" />}
                    {isDeuce && <MiniBadge icon={TrendingUp} text="DEUCE" colorClass="bg-indigo-500 text-white" />}
                    {(isMatchPointA || isMatchPointB) && <MiniBadge icon={Crown} text="MATCH POINT" colorClass="bg-amber-500 text-black" />}
                </div>
            )}
        </div>
    );
});
