
import React, { useState } from 'react';
import { Match } from '../store/historyStore';
import { useTranslation } from '@contexts/LanguageContext';
import { ArrowLeft, Crown, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { resolveTheme } from '@lib/utils/colors';
import { MatchTimeline } from './MatchTimeline';
import { MomentumGraph } from './MomentumGraph';
import { GlassSurface } from '@ui/GlassSurface';
// DISABLED FOR PLAY STORE v1: Pro Analysis
// import { ProAnalysis } from './ProAnalysis';
import { isFeatureEnabled } from '@config/featureFlags';

interface MatchDetailProps {
    match: Match;
    onBack: () => void;
}

const StatBar = ({ label, valueA, valueB, colorA, colorB, icon: Icon }: any) => {
    const total = valueA + valueB || 1;
    const percentA = Math.round((valueA / total) * 100);
    const percentB = Math.round((valueB / total) * 100);

    return (
        <div className="flex flex-col gap-1 w-full mb-3 last:mb-0">
            <div className="flex items-center justify-between px-0 w-full text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <span className={`font-black tabular-nums text-xs ${colorA.text} ${colorA.textDark}`}>{valueA}</span>
                <div className="flex items-center gap-1.5 opacity-80">
                    {Icon && <Icon size={10} />}
                    <span>{label}</span>
                </div>
                <span className={`font-black tabular-nums text-xs ${colorB.text} ${colorB.textDark}`}>{valueB}</span>
            </div>

            <div className="flex h-1.5 w-full rounded-full overflow-hidden bg-black/10 dark:bg-white/5 shadow-inner">
                <motion.div
                    initial={{ width: 0 }} animate={{ width: `${percentA}%` }}
                    className={`h-full ${colorA.halo} shadow-[inset_0_1px_0_rgba(255,255,255,0.3)] relative z-10`}
                />
                <div className="w-px bg-transparent" />
                <motion.div
                    initial={{ width: 0 }} animate={{ width: `${percentB}%` }}
                    className={`h-full ${colorB.halo} shadow-[inset_0_1px_0_rgba(255,255,255,0.3)] relative z-10`}
                />
            </div>
        </div>
    );
};

const TeamHero = ({ name, winner, isRight = false, theme }: { name: string, winner: boolean, isRight?: boolean, theme: any }) => {
    return (
        <div className={`flex flex-col justify-center ${isRight ? 'items-end text-right' : 'items-start text-left'} relative z-10 w-full min-w-0 flex-1`}>
            <div className={`flex items-center gap-2 max-w-full ${isRight ? 'flex-row-reverse' : 'flex-row'}`}>
                {winner && <Crown size={14} className={`${theme.crown} drop-shadow-[0_0_5px_currentColor] flex-shrink-0`} />}
                <h2 className={`text-base sm:text-lg lg:text-xl font-black uppercase tracking-tight leading-tight truncate ${winner ? `${theme.text} ${theme.textDark}` : 'text-slate-500 dark:text-slate-400'}`}>
                    {name}
                </h2>
            </div>
            {winner && <div className={`h-1 rounded-full mt-1 w-8 ${theme.halo}`} />}
        </div>
    );
};

export const MatchDetail: React.FC<MatchDetailProps> = ({ match, onBack }) => {
    const { t } = useTranslation();
    const [view, setView] = useState<'stats' | 'analysis'>('stats');

    const themeA = resolveTheme(match.teamARoster?.color || 'indigo');
    const themeB = resolveTheme(match.teamBRoster?.color || 'rose');

    const isWinnerA = match.winner === 'A';

    return (
        <div className="flex flex-col h-full bg-transparent overflow-hidden relative">

            <div className="px-4 py-4 landscape:py-2 flex items-center justify-between shrink-0 bg-transparent z-50">
                <button onClick={onBack} className="flex landscape:hidden items-center gap-1.5 text-slate-600 dark:text-slate-300 hover:text-indigo-500 font-bold text-xs uppercase tracking-wider transition-colors px-3 py-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10">
                    <ArrowLeft size={16} /> {t('common.back')}
                </button>

                {isFeatureEnabled('PLAYER_ANALYSIS_ENABLED') && (
                    <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-2xl border border-black/5 dark:border-white/10">
                        <button
                            onClick={() => setView('stats')}
                            className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all ${view === 'stats' ? 'bg-white dark:bg-slate-800 text-indigo-500 shadow-sm' : 'text-slate-400'}`}
                        >
                            {t('common.summary')}
                        </button>
                        <button
                            onClick={() => setView('analysis')}
                            className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-2 ${view === 'analysis' ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-400'}`}
                        >
                            <Sparkles size={12} /> Pro Analysis
                        </button>
                    </div>
                )}
            </div>

            <motion.div
                className="flex-1 overflow-y-auto custom-scrollbar px-4 pb-safe-bottom"
                key={view}
                initial={{ opacity: 0, x: view === 'stats' ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
            >
                {view === 'stats' ? (
                    <div className="space-y-6 pt-4 pb-20">
                        {/* HERO SCORE CARD */}
                        <GlassSurface
                            intensity="high"
                            className="rounded-3xl p-6"
                        >
                            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 w-full">
                                <TeamHero name={match.teamAName} winner={isWinnerA} theme={themeA} />

                                <div className="flex flex-col items-center justify-center px-4 sm:px-8 border-x border-black/5 dark:border-white/5">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Final</span>
                                    <div className="text-3xl sm:text-4xl font-black tabular-nums tracking-tighter text-slate-800 dark:text-white flex items-center gap-2">
                                        <span className={isWinnerA ? `${themeA.text} ${themeA.textDark}` : ''}>{match.setsA}</span>
                                        <span className="text-slate-300 dark:text-slate-600 text-xl">:</span>
                                        <span className={!isWinnerA ? `${themeB.text} ${themeB.textDark}` : ''}>{match.setsB}</span>
                                    </div>
                                </div>

                                <TeamHero name={match.teamBName} winner={!isWinnerA} isRight theme={themeB} />
                            </div>
                        </GlassSurface>

                        {/* MOMENTUM GRAPH - New */}
                        <MomentumGraph match={match} />

                        {/* TIMELINE */}
                        <MatchTimeline match={match} />
                    </div>
                ) : isFeatureEnabled('PLAYER_ANALYSIS_ENABLED') ? (
                    <div className="pt-4">
                        {/* <ProAnalysis match={match} /> */}
                        DISABLED FOR PLAY STORE v1
                    </div>
                ) : null}
            </motion.div>
        </div>
    );
};
