
import React from 'react';
import { motion } from 'framer-motion';
import { Play, RotateCcw, Activity, Minimize2 } from 'lucide-react';
import { Team, TeamId } from '@types';
import { resolveTheme } from '@lib/utils/colors';
import { useTranslation } from '@contexts/LanguageContext';

interface TimeoutOverlayProps {
    team: Team;
    teamId: TeamId;
    secondsLeft: number;
    onResume: () => void;
    onUndo: () => void;
    onTactical: () => void;
    onMinimize: () => void;
}

export const TimeoutOverlay: React.FC<TimeoutOverlayProps> = ({
    team, teamId, secondsLeft, onResume, onUndo, onTactical, onMinimize
}) => {
    const { t } = useTranslation();
    const theme = resolveTheme(team.color || 'slate');

    const isLandscape = typeof window !== 'undefined' && window.innerWidth > window.innerHeight;
    const size = isLandscape ? 200 : 280;
    const strokeWidth = isLandscape ? 12 : 16;
    const center = size / 2;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (secondsLeft / 30) * circumference;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center isolate bg-slate-950/95 backdrop-blur-sm p-safe">

            {/* Radial Gradient Overlay for Rich Background */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05),transparent_70%)] pointer-events-none" />

            {/* Minimize Button - Explicitly Top-Right Safe Area */}
            <button
                onClick={onMinimize}
                className="absolute top-6 right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 ring-1 ring-inset ring-white/10 shadow-[0_4px_12px_rgba(0,0,0,0.2),inset_0_1px_0_0_rgba(255,255,255,0.1)] text-white/40 hover:text-white transition-all z-[110] active:scale-95"
                title="Minimize Timer"
            >
                <Minimize2 size={24} strokeWidth={2} />
            </button>

            {/* Main Layout Container */}
            <div className="flex flex-col landscape:flex-row items-center justify-center gap-8 landscape:gap-16 w-full max-w-5xl h-full max-h-screen overflow-y-auto landscape:overflow-hidden p-6 relative z-10">

                {/* LEFT: Info & Timer */}
                <div className="flex flex-col items-center shrink-0">
                    {/* Header Badge */}
                    <motion.div
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="flex flex-col items-center mb-6 space-y-3"
                    >
                        <div className={`px-4 py-1.5 rounded-full border ${theme.border} ${theme.bg} ${theme.text} font-black text-xs uppercase tracking-[0.2em] shadow-[0_0_15px_-3px_currentColor]`}>
                            {t('announcer.timeout', { team: '' }).trim()}
                        </div>
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white uppercase tracking-tighter text-center leading-none drop-shadow-2xl max-w-md truncate px-2">
                            {team.name}
                        </h2>
                    </motion.div>

                    {/* The Timer Ring */}
                    <div className="relative flex items-center justify-center p-4">
                        {/* SVG Container */}
                        <svg
                            width={size}
                            height={size}
                            viewBox={`0 0 ${size} ${size}`}
                            className="-rotate-90 drop-shadow-2xl"
                            style={{ overflow: 'visible' }}
                        >
                            {/* Track */}
                            <circle
                                cx={center} cy={center} r={radius}
                                stroke="currentColor" strokeWidth={strokeWidth}
                                fill="transparent"
                                className="text-white/10"
                            />
                            {/* Progress */}
                            <motion.circle
                                cx={center} cy={center} r={radius}
                                stroke="currentColor" strokeWidth={strokeWidth}
                                fill="transparent"
                                className={`${theme.text}`}
                                strokeLinecap="round"
                                strokeDasharray={circumference}
                                animate={{ strokeDashoffset: offset }}
                                transition={{ duration: 1, ease: "linear" }}
                            />
                        </svg>

                        {/* Centered Text */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <motion.div
                                key={secondsLeft}
                                initial={{ scale: 0.9, opacity: 0.5 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="flex flex-col items-center"
                            >
                                <span className="text-7xl lg:text-8xl font-black text-white tabular-nums tracking-tighter leading-none" style={{ textShadow: '0 10px 20px rgba(0,0,0,0.5)' }}>
                                    {secondsLeft}
                                </span>
                                <span className="text-xs lg:text-sm font-bold text-white/50 uppercase tracking-widest mt-1">Seconds</span>
                            </motion.div>
                        </div>
                    </div>
                </div>

                {/* RIGHT: Actions */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex flex-row landscape:flex-col gap-3 w-full max-w-xs landscape:w-64 shrink-0"
                >
                    <button
                        onClick={onResume}
                        className="flex-1 flex flex-col items-center justify-center gap-2 p-5 rounded-3xl bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white shadow-[0_8px_20px_rgba(16,185,129,0.35),inset_0_1px_0_0_rgba(255,255,255,0.15)] ring-1 ring-inset ring-white/20 transition-all active:scale-95"
                    >
                        <Play size={32} fill="currentColor" />
                        <span className="text-xs font-black uppercase tracking-wider">Resume</span>
                    </button>

                    <div className="flex-1 flex flex-col gap-3">
                        <button
                            onClick={onTactical}
                            className="flex-1 flex items-center justify-center gap-2 p-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 ring-1 ring-inset ring-white/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)] transition-all active:scale-95 group"
                        >
                            <Activity size={18} className="text-indigo-400" />
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-200">Tactical</span>
                        </button>

                        <button
                            onClick={onUndo}
                            className="flex-1 flex items-center justify-center gap-2 p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 ring-1 ring-inset ring-white/5 transition-all active:scale-95 group"
                        >
                            <RotateCcw size={18} className="text-rose-400" />
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 group-hover:text-rose-400">Undo</span>
                        </button>
                    </div>
                </motion.div>

            </div>
        </div>
    );
};
