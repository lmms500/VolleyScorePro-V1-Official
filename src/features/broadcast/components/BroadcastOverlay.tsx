
import React, { useMemo, memo } from 'react';
import { GameState, TeamId } from '@types';
import { motion, AnimatePresence } from 'framer-motion';
import { resolveTheme, getHexFromColor } from '@lib/utils/colors';
import { Volleyball, Trophy, Zap, ChevronRight, ChevronLeft } from 'lucide-react';

interface BroadcastOverlayProps {
    state: GameState;
}

const ScoreTicker = memo(({ value }: { value: number }) => (
    <div className="relative h-12 w-12 flex items-center justify-center overflow-hidden">
        <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
                key={value}
                initial={{ y: 20, opacity: 0, filter: 'blur(5px)' }}
                animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                exit={{ y: -20, opacity: 0, filter: 'blur(5px)' }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="absolute font-black text-4xl tabular-nums tracking-tighter"
            >
                {value}
            </motion.span>
        </AnimatePresence>
    </div>
));

const SetPill: React.FC<{ active: boolean; color: string }> = memo(({ active, color }) => (
    <div 
        className={`w-3 h-1.5 rounded-full transition-all duration-500 ${active ? 'opacity-100 shadow-[0_0_8px_currentColor]' : 'bg-slate-700 opacity-20'}`}
        style={{ backgroundColor: active ? color : undefined }}
    />
));

export const BroadcastOverlay: React.FC<BroadcastOverlayProps> = ({ state }) => {
    const isTieBreak = state.config.hasTieBreak && state.currentSet === state.config.maxSets;
    const target = isTieBreak ? state.config.tieBreakPoints : state.config.pointsPerSet;
    const setsToWin = Math.ceil(state.config.maxSets / 2);

    const hexA = getHexFromColor(state.teamARoster.color || 'indigo');
    const hexB = getHexFromColor(state.teamBRoster.color || 'rose');

    const isSetPointA = state.scoreA >= target - 1 && state.scoreA > state.scoreB;
    const isSetPointB = state.scoreB >= target - 1 && state.scoreB > state.scoreA;
    const isMatchPointA = isSetPointA && state.setsA === setsToWin - 1;
    const isMatchPointB = isSetPointB && state.setsB === setsToWin - 1;

    const progressA = Math.min((state.scoreA / target) * 100, 100);
    const progressB = Math.min((state.scoreB / target) * 100, 100);

    return (
        <div className="fixed inset-0 pointer-events-none flex items-end justify-center p-12 pb-16">
            <motion.div 
                initial={{ y: 100, opacity: 0, scale: 0.9 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                className="relative flex items-center bg-slate-950/80 backdrop-blur-2xl rounded-3xl border border-white/10 ring-1 ring-inset ring-white/10 shadow-[0_30px_70px_rgba(0,0,0,0.6)] overflow-hidden"
            >
                {/* Progress Bar Top */}
                <div className="absolute top-0 left-0 w-full h-1 flex">
                    <motion.div animate={{ width: `${progressA}%` }} className="h-full opacity-60" style={{ backgroundColor: hexA }} />
                    <div className="w-px h-full bg-white/20" />
                    <motion.div animate={{ width: `${progressB}%` }} className="h-full opacity-60" style={{ backgroundColor: hexB }} />
                </div>

                {/* TEAM A MODULE */}
                <div className="flex items-center h-20 px-8 gap-5 relative overflow-hidden">
                    <AnimatePresence>
                        {isMatchPointA && (
                            <motion.div 
                                initial={{ opacity: 0 }} animate={{ opacity: 0.15 }}
                                className="absolute inset-0 bg-amber-400 animate-pulse"
                            />
                        )}
                    </AnimatePresence>
                    
                    <div className="flex flex-col items-end">
                        <div className="flex gap-1 mb-1">
                            {[...Array(setsToWin)].map((_, i) => (
                                <SetPill key={i} active={i < state.setsA} color={hexA} />
                            ))}
                        </div>
                        <span className={`text-xl font-black uppercase tracking-tight transition-colors ${isSetPointA ? 'text-white' : 'text-slate-300'}`}>
                            {state.teamAName}
                        </span>
                    </div>

                    <div className="flex items-center justify-center bg-white rounded-2xl text-slate-950 px-2 shadow-inner ring-1 ring-black/5">
                        <ScoreTicker value={state.scoreA} />
                    </div>
                </div>

                {/* INFO CENTER */}
                <div className="w-24 h-20 flex flex-col items-center justify-center bg-white/[0.03] border-x border-white/10 gap-1">
                    <div className="flex flex-col items-center">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">SET</span>
                        <span className="text-xl font-black text-white leading-none">{state.currentSet}</span>
                    </div>
                    
                    <div className="h-6 flex items-center gap-2">
                        <AnimatePresence mode="wait">
                            {state.servingTeam === 'A' && (
                                <motion.div initial={{ x: 10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 10, opacity: 0 }}>
                                    <ChevronLeft size={16} className="text-cyan-400" strokeWidth={4} />
                                </motion.div>
                            )}
                        </AnimatePresence>
                        
                        <motion.div 
                            animate={state.servingTeam ? { rotate: 360 } : {}}
                            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                            className={state.servingTeam ? "drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]" : ""}
                        >
                            <Volleyball size={18} className={state.servingTeam ? "text-cyan-400" : "text-slate-800"} />
                        </motion.div>

                        <AnimatePresence mode="wait">
                            {state.servingTeam === 'B' && (
                                <motion.div initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -10, opacity: 0 }}>
                                    <ChevronRight size={16} className="text-cyan-400" strokeWidth={4} />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* TEAM B MODULE */}
                <div className="flex items-center h-20 px-8 gap-5 relative overflow-hidden flex-row-reverse">
                    <AnimatePresence>
                        {isMatchPointB && (
                            <motion.div 
                                initial={{ opacity: 0 }} animate={{ opacity: 0.15 }}
                                className="absolute inset-0 bg-amber-400 animate-pulse"
                            />
                        )}
                    </AnimatePresence>

                    <div className="flex flex-col items-start">
                        <div className="flex gap-1 mb-1">
                            {[...Array(setsToWin)].map((_, i) => (
                                <SetPill key={i} active={i < state.setsB} color={hexB} />
                            ))}
                        </div>
                        <span className={`text-xl font-black uppercase tracking-tight transition-colors ${isSetPointB ? 'text-white' : 'text-slate-300'}`}>
                            {state.teamBName}
                        </span>
                    </div>

                    <div className="flex items-center justify-center bg-white rounded-2xl text-slate-950 px-2 shadow-inner ring-1 ring-black/5">
                        <ScoreTicker value={state.scoreB} />
                    </div>
                </div>

                {/* DYNAMIC FOOTER STATUS */}
                <AnimatePresence>
                    {(isSetPointA || isSetPointB || isMatchPointA || isMatchPointB || state.inSuddenDeath) && (
                        <motion.div 
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 20, opacity: 0 }}
                            className={`absolute bottom-0 left-0 w-full py-1 text-center font-black text-[8px] uppercase tracking-[0.4em] z-20 
                                ${isMatchPointA || isMatchPointB ? 'bg-amber-500 text-black' : (state.inSuddenDeath ? 'bg-red-600 text-white' : 'bg-indigo-600 text-white')}`}
                        >
                            {isMatchPointA || isMatchPointB ? 'MATCH POINT' : (isSetPointA || isSetPointB ? 'SET POINT' : (state.inSuddenDeath ? 'SUDDEN DEATH' : ''))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};
