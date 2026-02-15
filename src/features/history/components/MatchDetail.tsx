
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
import { MatchStatistics } from './MatchStatistics';
import { isFeatureEnabled } from '@config/featureFlags';

interface MatchDetailProps {
    match: Match;
    onBack: () => void;
}

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
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 overflow-hidden relative w-full pt-safe-top pl-safe-left pr-safe-right">

            <div className="px-4 py-2 flex items-center justify-between shrink-0 bg-transparent z-50 min-h-[56px]">
                <button onClick={onBack} className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 hover:text-indigo-500 font-bold text-xs uppercase tracking-wider transition-colors px-3 py-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 active:bg-black/10 dark:active:bg-white/20">
                    <ArrowLeft size={18} /> {t('common.back')}
                </button>

                {isFeatureEnabled('PLAYER_ANALYSIS_ENABLED') && (
                    <div className="flex bg-slate-200 dark:bg-white/5 p-1 rounded-2xl border border-black/5 dark:border-white/10">
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
                className="flex-1 overflow-y-auto custom-scrollbar content-container pb-safe-bottom px-4"
                key={view}
                initial={{ opacity: 0, x: view === 'stats' ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
            >
                {view === 'stats' ? (
                    <div className="space-y-6 pt-2 pb-20 max-w-3xl mx-auto">
                        {/* HERO SCORE CARD */}
                        <GlassSurface
                            intensity="high"
                            className="rounded-3xl p-6 relative overflow-hidden"
                        >
                            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 w-full relative z-10">
                                <TeamHero name={match.teamAName} winner={isWinnerA} theme={themeA} />

                                <div className="flex flex-col items-center justify-center px-6 py-2 border-x border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5 rounded-2xl mx-2">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Final</span>
                                    <div className="text-4xl sm:text-5xl font-black tabular-nums tracking-tighter text-slate-800 dark:text-white flex items-center gap-3">
                                        <span className={isWinnerA ? `${themeA.text} ${themeA.textDark}` : ''}>{match.setsA}</span>
                                        <span className="text-slate-300 dark:text-slate-600 text-2xl">:</span>
                                        <span className={!isWinnerA ? `${themeB.text} ${themeB.textDark}` : ''}>{match.setsB}</span>
                                    </div>
                                </div>

                                <TeamHero name={match.teamBName} winner={!isWinnerA} isRight theme={themeB} />
                            </div>
                        </GlassSurface>

                        {/* MATCH STATISTICS */}
                        <MatchStatistics match={match} />

                        {/* MOMENTUM GRAPH - New */}
                        <MomentumGraph match={match} />

                        {/* TIMELINE */}
                        <MatchTimeline match={match} />
                    </div>
                ) : isFeatureEnabled('PLAYER_ANALYSIS_ENABLED') ? (
                    <div className="pt-4 max-w-3xl mx-auto">
                        {/* <ProAnalysis match={match} /> */}
                        <div className="p-8 text-center text-slate-400 text-sm">
                            Detailed analysis coming in Pro version
                        </div>
                    </div>
                ) : null}
            </motion.div>
        </div>
    );
};
