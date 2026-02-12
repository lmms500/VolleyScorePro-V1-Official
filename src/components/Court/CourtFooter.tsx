
import React, { memo } from 'react';
import { RotateCw, RotateCcw, ArrowRightLeft, Users, History, Settings } from 'lucide-react';
import { Team } from '../../types';
import { resolveTheme } from '../../utils/colors';

interface CourtFooterProps {
    teamA: Team;
    teamB: Team;
    onRotate: (teamId: string, direction: 'clockwise' | 'counter') => void;
    onSubstituteRequest: (teamId: string) => void;
    hideNavButtons?: boolean;
    onOpenManager?: () => void;
    onOpenHistory?: () => void;
    onOpenSettings?: () => void;
}

const RotationControls = memo(({ 
    teamName, theme, onRotateClockwise, onRotateCounter, onSubstitute, align 
}: { 
    teamName: string, theme: any, onRotateClockwise: () => void, onRotateCounter: () => void, onSubstitute: () => void, align: 'left' | 'right'
}) => (
    <div className={`flex flex-col gap-1 pointer-events-auto ${align === 'left' ? 'items-start' : 'items-end'}`}>
        <span className={`text-[8px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 bg-white/80 dark:bg-black/40 px-2 py-0.5 rounded-lg backdrop-blur-sm mb-1 shadow-sm`}>
            {teamName}
        </span>
        <div className="flex gap-1.5">
            <button onClick={onRotateCounter} className="w-10 h-10 rounded-xl bg-white/50 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 flex items-center justify-center backdrop-blur-md active:scale-95 transition-all text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white shadow-sm hover:shadow-md">
                <RotateCcw size={16} strokeWidth={2.5} />
            </button>
            <button onClick={onRotateClockwise} className={`w-10 h-10 rounded-xl ${theme.bg} hover:${theme.bg.replace('/20', '/30')} border ${theme.border} flex items-center justify-center backdrop-blur-md active:scale-95 transition-all ${theme.text} dark:${theme.textDark} shadow-sm hover:shadow-md`}>
                <RotateCw size={16} strokeWidth={2.5} />
            </button>
            <button onClick={onSubstitute} className="w-10 h-10 rounded-xl bg-white/50 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 flex items-center justify-center backdrop-blur-md active:scale-95 transition-all text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white shadow-sm hover:shadow-md">
                <ArrowRightLeft size={16} strokeWidth={2.5} />
            </button>
        </div>
    </div>
));

export const CourtFooter: React.FC<CourtFooterProps> = memo(({
    teamA, teamB, onRotate, onSubstituteRequest, hideNavButtons, onOpenManager, onOpenHistory, onOpenSettings
}) => {
    const themeA = resolveTheme(teamA.color);
    const themeB = resolveTheme(teamB.color);

    return (
        <div className="w-full px-4 pb-safe-bottom pt-1 mb-2 shrink-0 flex justify-between items-end relative z-40 pointer-events-auto">
            <RotationControls 
                teamName={teamA.name} 
                theme={themeA} 
                align="left" 
                onRotateClockwise={() => onRotate('A', 'clockwise')} 
                onRotateCounter={() => onRotate('A', 'counter')} 
                onSubstitute={() => onSubstituteRequest('A')} 
            />
            
            {!hideNavButtons && (
                <div className="absolute left-1/2 -translate-x-1/2 bottom-0 flex gap-2 p-1 bg-white/80 dark:bg-black/40 backdrop-blur-md rounded-2xl border border-black/5 dark:border-white/10 shadow-lg mb-0.5">
                    <button onClick={onOpenManager} className="w-10 h-10 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 transition-all active:scale-90"><Users size={18} /></button>
                    <button onClick={onOpenHistory} className="w-10 h-10 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 transition-all active:scale-90"><History size={18} /></button>
                    <button onClick={onOpenSettings} className="w-10 h-10 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 transition-all active:scale-90"><Settings size={18} /></button>
                </div>
            )}
            
            <RotationControls 
                teamName={teamB.name} 
                theme={themeB} 
                align="right" 
                onRotateClockwise={() => onRotate('B', 'clockwise')} 
                onRotateCounter={() => onRotate('B', 'counter')} 
                onSubstitute={() => onSubstituteRequest('B')} 
            />
        </div>
    );
});
