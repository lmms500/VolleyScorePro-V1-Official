import React, { memo } from 'react';
import { GameState } from '@types';
import { motion, AnimatePresence } from 'framer-motion';
import { getHexFromColor } from '@lib/utils/colors';
import { Volleyball } from 'lucide-react';
import { TeamLogo } from '@ui/TeamLogo';

interface BroadcastBarProps {
    state: GameState;
}

const ScoreTicker = memo(({ value }: { value: number }) => (
    <div className="relative h-10 w-14 flex items-center justify-center overflow-hidden">
        <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
                key={value}
                initial={{ y: 20, opacity: 0, filter: 'blur(4px)' }}
                animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                exit={{ y: -20, opacity: 0, filter: 'blur(4px)' }}
                transition={{ type: "spring", stiffness: 450, damping: 30 }}
                className="absolute font-black text-3xl tabular-nums tracking-tighter text-white"
            >
                {value}
            </motion.span>
        </AnimatePresence>
    </div>
));

const SetIndicator = memo(({ won, color }: { won: boolean; color: string }) => (
    <div
        className={`w-2 h-2 rounded-full transition-all duration-300 ${won ? 'opacity-100 shadow-[0_0_4px_currentColor]' : 'bg-white/20'}`}
        style={{ backgroundColor: won ? color : undefined }}
    />
));

export const BroadcastBar: React.FC<BroadcastBarProps> = ({ state }) => {
    const hexA = getHexFromColor(state.teamARoster.color || 'indigo');
    const hexB = getHexFromColor(state.teamBRoster.color || 'rose');

    const setsToWin = Math.ceil(state.config.maxSets / 2);
    const isTieBreak = state.config.hasTieBreak && state.currentSet === state.config.maxSets;
    const target = isTieBreak ? state.config.tieBreakPoints : state.config.pointsPerSet;

    return (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 pointer-events-none">
            {/* Global Style Injection for OBS Transparency */}
            <style>
                {`
                    html, body, #root { 
                        background-color: transparent !important; 
                        background: transparent !important; 
                    }
                `}
            </style>

            {/* Set History (Above Bar) */}
            {state.history.length > 0 && (
                <div className="absolute bottom-full left-0 right-0 flex justify-center mb-2">
                    <div className="flex gap-3 px-3 py-1">
                        {state.history.map((set, index) => (
                            <div key={`set-history-${index}`} className="flex items-center gap-2 text-xs font-bold shadow-black drop-shadow-md">
                                <span className="text-white/60 uppercase tracking-widest text-[10px]">SET {set.setNumber}</span>
                                <span className={set.winner === 'A' ? 'text-white' : 'text-white/60'}>{set.scoreA}</span>
                                <span className="text-white/20">-</span>
                                <span className={set.winner === 'B' ? 'text-white' : 'text-white/60'}>{set.scoreB}</span>
                                {index < state.history.length - 1 && (
                                    <div className="w-px h-3 bg-white/20 ml-1" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <motion.div
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="flex items-center bg-black/80 backdrop-blur-md rounded-full border border-white/10 shadow-2xl overflow-hidden px-1 py-1"
            >
                {/* TEAM A */}
                <div className="flex items-center pl-2 pr-4 gap-3 h-14">
                    {/* LOGO A */}
                    {state.teamARoster.logo ? (
                        <div className="w-12 h-12 flex items-center justify-center shrink-0">
                            <TeamLogo
                                src={state.teamARoster.logo}
                                alt={state.teamAName}
                                className="w-full h-full object-contain"
                            />
                        </div>
                    ) : (
                        null
                    )}

                    <div className="flex flex-col items-end justify-center min-w-[80px]">
                        <span className="text-white font-bold uppercase text-lg leading-none tracking-tight whitespace-nowrap">
                            {state.teamAName.substring(0, 12)}
                        </span>
                        <div className="flex gap-1 mt-1">
                            {[...Array(setsToWin)].map((_, i) => (
                                <SetIndicator key={`a-${i}`} won={i < state.setsA} color={hexA} />
                            ))}
                        </div>
                    </div>
                    {/* Color Bar A */}
                    <div className="w-1.5 h-8 rounded-full" style={{ backgroundColor: hexA, boxShadow: `0 0 8px ${hexA}60` }} />
                </div>

                {/* SCORES CENTER */}
                <div className="relative flex items-center justify-center gap-1 bg-white/5 rounded-2xl px-4 py-1 h-12 mx-1 border border-white/5">
                    {/* Serve Indicator A */}
                    <div className="w-5 flex justify-center">
                        <AnimatePresence>
                            {state.servingTeam === 'A' && (
                                <motion.div
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0, opacity: 0 }}
                                >
                                    <Volleyball size={14} className="text-white fill-white/20" />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="flex items-center gap-0.5">
                        <ScoreTicker value={state.scoreA} />
                        <span className="text-white/20 font-light text-xl">:</span>
                        <ScoreTicker value={state.scoreB} />
                    </div>

                    {/* Serve Indicator B */}
                    <div className="w-5 flex justify-center">
                        <AnimatePresence>
                            {state.servingTeam === 'B' && (
                                <motion.div
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0, opacity: 0 }}
                                >
                                    <Volleyball size={14} className="text-white fill-white/20" />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* TEAM B */}
                <div className="flex items-center pr-2 pl-4 gap-3 h-14 flex-row-reverse">
                    {/* LOGO B */}
                    {state.teamBRoster.logo && (
                        <div className="w-12 h-12 flex items-center justify-center shrink-0">
                            <TeamLogo
                                src={state.teamBRoster.logo}
                                alt={state.teamBName}
                                className="w-full h-full object-contain"
                            />
                        </div>
                    )}

                    <div className="flex flex-col items-start justify-center min-w-[80px]">
                        <span className="text-white font-bold uppercase text-lg leading-none tracking-tight whitespace-nowrap">
                            {state.teamBName.substring(0, 12)}
                        </span>
                        <div className="flex gap-1 mt-1">
                            {[...Array(setsToWin)].map((_, i) => (
                                <SetIndicator key={`b-${i}`} won={i < state.setsB} color={hexB} />
                            ))}
                        </div>
                    </div>
                    {/* Color Bar B */}
                    <div className="w-1.5 h-8 rounded-full" style={{ backgroundColor: hexB, boxShadow: `0 0 8px ${hexB}60` }} />
                </div>

            </motion.div>

            {/* Set Info / Match Point Indicator */}
            <div className="absolute top-full left-0 right-0 flex justify-center mt-2">
                <AnimatePresence mode="wait">
                    {(state.scoreA >= (target - 1) && state.scoreA > state.scoreB) || (state.scoreB >= (target - 1) && state.scoreB > state.scoreA) ? (
                        <motion.div
                            initial={{ y: -10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -10, opacity: 0 }}
                            className="bg-amber-500 text-black text-[10px] font-black tracking-widest uppercase px-2 py-0.5 rounded shadow-lg"
                        >
                            Set Point
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="bg-black/40 backdrop-blur text-white/70 text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded"
                        >
                            SET {state.currentSet}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
