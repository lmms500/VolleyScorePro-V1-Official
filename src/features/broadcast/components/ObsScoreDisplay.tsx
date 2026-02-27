import React, { memo } from 'react';
import { GameState, TeamId } from '@types';
import { motion, AnimatePresence } from 'framer-motion';
import { getHexFromColor } from '@lib/utils/colors';

interface ObsScoreDisplayProps {
    state: GameState;
    layout?: 'horizontal' | 'vertical';  // OBS layout preference
}

const ScoreTicker = memo(({ value, hex }: { value: number; hex: string }) => (
    <div className="relative h-24 w-32 flex items-center justify-center overflow-hidden">
        <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
                key={value}
                initial={{ y: 40, opacity: 0, scale: 0.9 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: -40, opacity: 0, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="absolute font-black text-8xl tabular-nums tracking-tighter"
                style={{ color: hex }}
            >
                {value}
            </motion.span>
        </AnimatePresence>
    </div>
));

const SetPill: React.FC<{ active: boolean; color: string }> = memo(({ active, color }) => (
    <motion.div 
        animate={{
            opacity: active ? 1 : 0.2,
            boxShadow: active ? `0 0 20px ${color}` : 'none'
        }}
        className={`w-4 h-3 rounded-full transition-all duration-500`}
        style={{ backgroundColor: color }}
    />
));

/**
 * OBS-Optimized Score Display
 * Designed for 1920x1080 streaming overlays with:
 * - Ultra-low latency updates
 * - Legible from distance
 * - No interactive elements (display-only)
 * - High contrast for green screen
 */
export const ObsScoreDisplay: React.FC<ObsScoreDisplayProps> = ({ state, layout = 'horizontal' }) => {
    const isTieBreak = state.config.hasTieBreak && state.currentSet === state.config.maxSets;
    const target = isTieBreak ? state.config.tieBreakPoints : state.config.pointsPerSet;
    const setsToWin = Math.ceil(state.config.maxSets / 2);

    const hexA = getHexFromColor(state.teamARoster.color || 'indigo');
    const hexB = getHexFromColor(state.teamBRoster.color || 'rose');

    const isSetPointA = state.scoreA >= target - 1 && state.scoreA > state.scoreB;
    const isSetPointB = state.scoreB >= target - 1 && state.scoreB > state.scoreA;

    const progressA = Math.min((state.scoreA / target) * 100, 100);
    const progressB = Math.min((state.scoreB / target) * 100, 100);

    if (layout === 'vertical') {
        return (
            <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center pointer-events-none gap-8">
                {/* TOP: Team A */}
                <div className="flex flex-col items-center gap-4">
                    <div className="flex gap-3 items-center">
                        <div className="flex gap-2">
                            {[...Array(setsToWin)].map((_, i) => (
                                <SetPill key={i} active={i < state.setsA} color={hexA} />
                            ))}
                        </div>
                        <span className="text-5xl font-black uppercase tracking-tight text-slate-100">
                            {state.teamAName}
                        </span>
                    </div>
                    <ScoreTicker value={state.scoreA} hex={hexA} />
                </div>

                {/* CENTER: Set Info */}
                <div className="text-center">
                    <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">SET</div>
                    <div className="text-7xl font-black text-white">{state.currentSet}</div>
                </div>

                {/* BOTTOM: Team B */}
                <div className="flex flex-col items-center gap-4">
                    <ScoreTicker value={state.scoreB} hex={hexB} />
                    <div className="flex gap-3 items-center flex-row-reverse">
                        <div className="flex gap-2">
                            {[...Array(setsToWin)].map((_, i) => (
                                <SetPill key={i} active={i < state.setsB} color={hexB} />
                            ))}
                        </div>
                        <span className="text-5xl font-black uppercase tracking-tight text-slate-100">
                            {state.teamBName}
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    // Horizontal layout (default for most OBS setups)
    return (
        <div className="fixed inset-0 bg-slate-950 flex items-center justify-center pointer-events-none">
            {/* Progress Bars (top) */}
            <div className="absolute top-0 left-0 w-full h-2 flex">
                <motion.div animate={{ width: `${progressA}%` }} className="h-full opacity-80" style={{ backgroundColor: hexA }} />
                <div className="w-1 h-full bg-white/20" />
                <motion.div animate={{ width: `${progressB}%` }} className="h-full opacity-80" style={{ backgroundColor: hexB }} />
            </div>

            <div className="flex items-center justify-between px-12 gap-16 w-full">
                {/* TEAM A */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center gap-4"
                >
                    <div className="flex gap-2 mb-2">
                        {[...Array(setsToWin)].map((_, i) => (
                            <SetPill key={i} active={i < state.setsA} color={hexA} />
                        ))}
                    </div>
                    <div className="text-4xl font-black uppercase tracking-tight text-slate-100">
                        {state.teamAName}
                    </div>
                    <ScoreTicker value={state.scoreA} hex={hexA} />
                    {isSetPointA && (
                        <div className="text-xl font-black text-amber-400 uppercase tracking-widest animate-pulse">
                            SET POINT
                        </div>
                    )}
                </motion.div>

                {/* CENTER: Set & Match Info */}
                <div className="flex flex-col items-center gap-6 py-8">
                    <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">Current Set</div>
                    <div className="text-9xl font-black text-white/90">{state.currentSet}</div>
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                        {isTieBreak ? `Tie Break (${target} pts)` : `Best of ${state.config.maxSets}`}
                    </div>
                </div>

                {/* TEAM B */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center gap-4"
                >
                    <div className="flex gap-2 mb-2">
                        {[...Array(setsToWin)].map((_, i) => (
                            <SetPill key={i} active={i < state.setsB} color={hexB} />
                        ))}
                    </div>
                    <div className="text-4xl font-black uppercase tracking-tight text-slate-100">
                        {state.teamBName}
                    </div>
                    <ScoreTicker value={state.scoreB} hex={hexB} />
                    {isSetPointB && (
                        <div className="text-xl font-black text-amber-400 uppercase tracking-widest animate-pulse">
                            SET POINT
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Bottom ticker: Spectators watching */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm font-bold text-slate-400 uppercase tracking-widest">
                VolleyScore Live • Real-time Score Broadcast
            </div>
        </div>
    );
};
