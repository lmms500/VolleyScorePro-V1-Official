
import React, { memo } from 'react';
import { RotateCw, RotateCcw, ArrowRightLeft, Users, History, Settings, Wand2 } from 'lucide-react';
import { Team } from '@types';
import { resolveTheme } from '@lib/utils/colors';

interface CourtFooterProps {
    teamA: Team;
    teamB: Team;
    onRotate: (teamId: string, direction: 'clockwise' | 'counter') => void;
    onSubstituteRequest: (teamId: string) => void;
    /** Callback to auto-position players by their saved role (only available for 6v6) */
    onAutoPosition?: (teamId: string) => void;
    hideNavButtons?: boolean;
    onOpenManager?: () => void;
    onOpenHistory?: () => void;
    onOpenSettings?: () => void;
}

const RotationControls = memo(({
    teamName, theme, onRotateClockwise, onRotateCounter, onSubstitute, onAutoPosition, align
}: {
    teamName: string; theme: any; onRotateClockwise: () => void; onRotateCounter: () => void; onSubstitute: () => void; onAutoPosition?: () => void; align: 'left' | 'right';
}) => (
    <div className={`flex flex-col gap-1 pointer-events-auto relative z-10 ${align === 'left' ? 'items-start' : 'items-end'}`}>
        <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-300 bg-white/40 dark:bg-white/10 border border-white/30 dark:border-white/10 px-2 sm:px-2.5 py-0.5 rounded-full backdrop-blur-md mb-0.5 sm:mb-1 shadow-sm">
            {teamName}
        </span>
        <div className="flex gap-1.5 sm:gap-2">
            <button onClick={onRotateCounter} className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white/50 dark:bg-white/10 hover:bg-white/70 dark:hover:bg-white/15 border border-white/30 dark:border-white/10 flex items-center justify-center backdrop-blur-md active:scale-95 transition-all text-slate-500 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white shadow-[0_4px_12px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.4)] hover:shadow-lg">
                <RotateCcw size={20} strokeWidth={2.5} />
            </button>
            <button onClick={onRotateClockwise} className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl ${theme.bg} hover:${theme.bg.replace('/20', '/35')} border ${theme.border} flex items-center justify-center backdrop-blur-md active:scale-95 transition-all ${theme.text} dark:${theme.textDark} shadow-[0_4px_12px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.4)] hover:shadow-lg border-white/20`}>
                <RotateCw size={20} strokeWidth={2.5} />
            </button>
            <button onClick={onSubstitute} className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white/50 dark:bg-white/10 hover:bg-white/70 dark:hover:bg-white/15 border border-white/30 dark:border-white/10 flex items-center justify-center backdrop-blur-md active:scale-95 transition-all text-slate-500 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white shadow-[0_4px_12px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.4)] hover:shadow-lg">
                <ArrowRightLeft size={20} strokeWidth={2.5} />
            </button>
            {onAutoPosition && (
                <button
                    onClick={onAutoPosition}
                    title="Auto-posicionar por função"
                    className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 flex items-center justify-center backdrop-blur-md active:scale-95 transition-all text-violet-500 dark:text-violet-400 shadow-[0_4px_12px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.4)] hover:shadow-lg"
                >
                    <Wand2 size={20} strokeWidth={2.5} />
                </button>
            )}
        </div>
    </div>
));

export const CourtFooter: React.FC<CourtFooterProps> = memo(({
    teamA, teamB, onRotate, onSubstituteRequest, onAutoPosition, hideNavButtons, onOpenManager, onOpenHistory, onOpenSettings
}) => {
    const themeA = resolveTheme(teamA.color);
    const themeB = resolveTheme(teamB.color);

    return (
        <div className="w-full px-2 sm:px-4 pb-safe-bottom pt-1 mb-2 shrink-0 flex justify-between items-end relative z-40 bg-transparent pointer-events-auto">
            {/* Linha separadora central */}
            <div className="absolute left-1/2 bottom-1 w-px h-12 bg-black/10 dark:bg-white/10 -translate-x-1/2 pointer-events-none rounded-full" />

            <RotationControls
                teamName={teamA.name}
                theme={themeA}
                align="left"
                onRotateClockwise={() => onRotate('A', 'clockwise')}
                onRotateCounter={() => onRotate('A', 'counter')}
                onSubstitute={() => onSubstituteRequest('A')}
                onAutoPosition={onAutoPosition ? () => onAutoPosition('A') : undefined}
            />

            {!hideNavButtons && (
                <div className="absolute left-1/2 -translate-x-1/2 bottom-0 flex gap-1.5 p-1.5 bg-white/60 dark:bg-white/10 backdrop-blur-xl rounded-2xl border border-white/40 dark:border-white/10 shadow-[0_8px_24px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.4)] mb-0.5">
                    <button onClick={onOpenManager} className="w-12 h-12 flex items-center justify-center text-slate-500 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white transition-all active:scale-90 rounded-xl hover:bg-white/50 dark:hover:bg-white/10"><Users size={22} /></button>
                    <button onClick={onOpenHistory} className="w-12 h-12 flex items-center justify-center text-slate-500 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white transition-all active:scale-90 rounded-xl hover:bg-white/50 dark:hover:bg-white/10"><History size={22} /></button>
                    <button onClick={onOpenSettings} className="w-12 h-12 flex items-center justify-center text-slate-500 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white transition-all active:scale-90 rounded-xl hover:bg-white/50 dark:hover:bg-white/10"><Settings size={22} /></button>
                </div>
            )}

            <RotationControls
                teamName={teamB.name}
                theme={themeB}
                align="right"
                onRotateClockwise={() => onRotate('B', 'clockwise')}
                onRotateCounter={() => onRotate('B', 'counter')}
                onSubstitute={() => onSubstituteRequest('B')}
                onAutoPosition={onAutoPosition ? () => onAutoPosition('B') : undefined}
            />
        </div>
    );
});
