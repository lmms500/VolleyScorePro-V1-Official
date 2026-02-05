import React from 'react';
import { motion } from 'framer-motion';
import { Hand, User, Crown, RefreshCw, ClipboardList, Scale } from 'lucide-react';
import { VisualProps } from './types';

// --- SCENE: COMMAND CENTER (Intro) ---
export const SceneCommandCenter = ({ color, isPaused }: VisualProps) => {
    return (
        <div className="w-full h-full flex items-center justify-center bg-slate-50 dark:bg-white/5 relative">
            {/* Orbits */}
            <motion.div
                className="absolute border border-dashed border-slate-300 dark:border-white/10 rounded-full w-48 h-48"
                animate={isPaused ? {} : { rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
                <div className={`absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-white dark:bg-slate-700 shadow-sm border border-slate-200 dark:border-white/10 flex items-center justify-center`}>
                    <div className={`w-2 h-2 rounded-full ${color.replace('text-', 'bg-')}`} />
                </div>
            </motion.div>

            <motion.div
                className="absolute border border-slate-200 dark:border-white/5 rounded-full w-32 h-32"
                animate={isPaused ? {} : { rotate: -360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            >
                <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-slate-200 dark:bg-white/20`} />
            </motion.div>

            {/* Core */}
            <motion.div
                className="relative z-10 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-xl border border-white/20"
                animate={isPaused ? {} : { scale: [1, 1.05, 1], boxShadow: ["0 10px 25px -5px rgba(0,0,0,0.1)", "0 20px 25px -5px rgba(0,0,0,0.15)", "0 10px 25px -5px rgba(0,0,0,0.1)"] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
                <ClipboardList size={32} className={color} strokeWidth={2} />
            </motion.div>
        </div>
    );
};

// --- SCENE: DRAG & DROP (Physics) ---
export const SceneDragDrop = ({ color, isPaused }: VisualProps) => {
    const bgClass = color.replace('text-', 'bg-');

    return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 dark:bg-white/5 relative">
            <div className="grid grid-cols-3 gap-3 mb-8">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-white/10 border border-black/5" />
                ))}
                {/* Target Slot */}
                <motion.div
                    className="w-12 h-12 rounded-xl border-2 border-dashed border-slate-300 dark:border-white/20 flex items-center justify-center"
                    animate={isPaused ? {} : { scale: [1, 1.1, 1], borderColor: ["#cbd5e1", "currentColor", "#cbd5e1"] }}
                    transition={{ duration: 2, repeat: Infinity, times: [0, 0.5, 1], delay: 0.5 }}
                    style={{ color: '#6366f1' }}
                />
            </div>

            {/* Draggable Item + Hand */}
            <motion.div
                className="absolute z-20"
                initial={{ x: 0, y: 40 }}
                animate={isPaused ? {} : {
                    x: [0, 0, 50, 50, 0],
                    y: [40, 40, -40, -40, 40],
                    scale: [1, 0.9, 0.9, 1, 1]
                }}
                transition={{ duration: 2.5, repeat: Infinity, times: [0, 0.2, 0.5, 0.7, 1], ease: "easeInOut" }}
            >
                <div className={`w-12 h-12 rounded-full ${bgClass} shadow-lg flex items-center justify-center`}>
                    <User size={20} className="text-white" />
                </div>
                <motion.div
                    className="absolute bottom-[-20px] right-[-20px] text-slate-500 dark:text-slate-200 drop-shadow-md"
                    animate={isPaused ? {} : { scale: [1, 0.8, 0.8, 1, 1], x: [0, -5, -5, 0, 0], y: [0, -5, -5, 0, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity, times: [0, 0.2, 0.5, 0.7, 1] }}
                >
                    <Hand size={32} fill="currentColor" />
                </motion.div>
            </motion.div>
        </div>
    );
};

// --- SCENE: PLAYER PROFILES (Stats Binding) ---
export const SceneProfiles = ({ color, isPaused }: VisualProps) => {
    const bgClass = color.replace('text-', 'bg-');
    return (
        <div className="w-full h-full flex items-center justify-center bg-slate-50 dark:bg-white/5 relative overflow-hidden">
            {/* Particles */}
            {[...Array(6)].map((_, i) => (
                <motion.div
                    key={i}
                    className={`absolute w-6 h-6 rounded-full bg-slate-200 dark:bg-white/10 text-[8px] flex items-center justify-center font-bold text-slate-500`}
                    initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                    animate={isPaused ? {} : {
                        opacity: [0, 1, 0],
                        scale: [0, 1, 0],
                        x: Math.cos(i * 60 * (Math.PI/180)) * 60,
                        y: Math.sin(i * 60 * (Math.PI/180)) * 60
                    }}
                    transition={{ duration: 2, repeat: Infinity, delay: 1, repeatDelay: 1 }}
                >
                    {Math.floor(Math.random() * 10)}
                </motion.div>
            ))}

            {/* Avatar */}
            <motion.div
                className="w-20 h-20 rounded-full bg-slate-300 dark:bg-white/20 flex items-center justify-center z-10 overflow-hidden relative"
                animate={isPaused ? {} : { backgroundColor: ["#cbd5e1", "#f1f5f9", "#cbd5e1"] }}
            >
                <User size={40} className="text-slate-500 dark:text-slate-400 relative z-10" />
                <motion.div
                    className={`absolute inset-0 ${bgClass} opacity-0`}
                    animate={isPaused ? {} : { opacity: [0, 0, 1, 1, 0] }}
                    transition={{ duration: 3, repeat: Infinity, times: [0, 0.3, 0.4, 0.8, 1] }}
                />
            </motion.div>

            {/* Data Card */}
            <motion.div
                className="absolute z-0 w-16 h-24 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-black/5 flex flex-col items-center justify-end p-2 gap-1"
                animate={isPaused ? {} : { y: [40, 0, 0, 40], opacity: [0, 1, 1, 0], scale: [0.8, 1, 1, 0.8] }}
                transition={{ duration: 3, repeat: Infinity, times: [0, 0.3, 0.8, 1] }}
            >
                <div className="w-10 h-1 bg-slate-200 rounded-full" />
                <div className="w-8 h-1 bg-slate-200 rounded-full" />
            </motion.div>
        </div>
    );
};

// --- SCENE: SUBSTITUTIONS (The Swap) ---
export const SceneSubstitutions = ({ color, isPaused }: VisualProps) => {
    const bgClass = color.replace('text-', 'bg-');
    return (
        <div className="w-full h-full flex items-center justify-center bg-slate-50 dark:bg-white/5 relative">
            <div className="relative w-48 h-24">
                {/* Player A (Out) */}
                <motion.div
                    className="absolute w-14 h-14 rounded-2xl bg-white dark:bg-white/10 shadow-md border border-black/5 flex items-center justify-center"
                    style={{ left: 0, top: '50%', marginTop: -28 }}
                    animate={isPaused ? {} : {
                        x: [0, 136, 136, 0],
                        y: [0, -30, -30, 0],
                        scale: [1, 0.8, 0.8, 1],
                        opacity: [1, 0.5, 0.5, 1]
                    }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                >
                    <span className="text-xs font-bold text-slate-400">OUT</span>
                </motion.div>

                {/* Player B (In) */}
                <motion.div
                    className={`absolute w-14 h-14 rounded-2xl ${bgClass} shadow-lg flex items-center justify-center z-10`}
                    style={{ right: 0, top: '50%', marginTop: -28 }}
                    animate={isPaused ? {} : {
                        x: [0, -136, -136, 0],
                        y: [0, 30, 30, 0],
                        scale: [1, 1.2, 1.2, 1],
                        boxShadow: ["0 4px 6px -1px rgba(0,0,0,0.1)", "0 20px 25px -5px rgba(0,0,0,0.1)", "0 20px 25px -5px rgba(0,0,0,0.1)", "0 4px 6px -1px rgba(0,0,0,0.1)"]
                    }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                >
                    <span className="text-xs font-bold text-white">IN</span>
                </motion.div>

                {/* Center Icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                        animate={isPaused ? {} : { rotate: 360 }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                    >
                        <RefreshCw size={20} className="text-slate-300" />
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

// --- SCENE: ROTATIONS (Shuffle Logic) ---
export const SceneRotation = ({ color, isPaused }: VisualProps) => {
    const bgClass = color.replace('text-', 'bg-');

    // Positions for 4 items in a circle
    const positions = [
        { x: -30, y: -30 }, { x: 30, y: -30 }, { x: 30, y: 30 }, { x: -30, y: 30 }
    ];

    return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 dark:bg-white/5 relative">
            <div className="relative w-40 h-40 flex items-center justify-center">
                {/* Central Icon Swapper */}
                <div className="absolute inset-0 flex items-center justify-center z-0">
                    <motion.div
                        animate={isPaused ? {} : { opacity: [1, 0, 0, 1] }}
                        transition={{ duration: 4, repeat: Infinity, times: [0, 0.45, 0.55, 1] }}
                    >
                        <Crown size={24} className="text-amber-500" />
                    </motion.div>
                    <motion.div
                        className="absolute"
                        animate={isPaused ? {} : { opacity: [0, 1, 1, 0] }}
                        transition={{ duration: 4, repeat: Infinity, times: [0, 0.45, 0.55, 1] }}
                    >
                        <Scale size={24} className="text-indigo-500" />
                    </motion.div>
                </div>

                {/* Orbiting Items */}
                {[0, 1, 2, 3].map(i => (
                    <motion.div
                        key={i}
                        className={`absolute w-10 h-10 rounded-full border border-black/5 shadow-sm flex items-center justify-center text-[10px] font-bold ${i === 0 ? 'bg-amber-500 text-white z-10' : 'bg-white dark:bg-white/10 text-slate-500'}`}
                        animate={isPaused ? {} : {
                            x: i === 0
                                ? [positions[0].x, positions[0].x, 0, 0, positions[0].x]
                                : [positions[i].x, positions[(i+1)%4].x, positions[i].x * 1.5, positions[(i+2)%4].x, positions[i].x],
                            y: i === 0
                                ? [positions[0].y, positions[0].y, 0, 0, positions[0].y]
                                : [positions[i].y, positions[(i+1)%4].y, positions[i].y * 1.5, positions[(i+2)%4].y, positions[i].y],
                            scale: i === 0 ? [1.2, 1.2, 0.8, 0.8, 1.2] : 1,
                            backgroundColor: i === 0
                                ? ["#f59e0b", "#f59e0b", "#e2e8f0", "#e2e8f0", "#f59e0b"]
                                : ["#ffffff", "#ffffff", "#ffffff", "#ffffff", "#ffffff"]
                        }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    >
                        {i === 0 ? <Crown size={12} fill="currentColor"/> : i}
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

// --- SCENE: SKILL BALANCE (Leveling) ---
export const SceneBalance = ({ color, isPaused }: VisualProps) => {
    return (
        <div className="w-full h-full flex items-center justify-center bg-slate-50 dark:bg-white/5 gap-6">
            <div className="flex flex-col items-center gap-2">
                <motion.div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
                    animate={isPaused ? {} : {
                        backgroundColor: ["#f43f5e", "#f59e0b", "#10b981", "#f43f5e"],
                        scale: [0.9, 1, 1.1, 0.9]
                    }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                >
                    <User size={32} className="text-white" />
                </motion.div>
                <div className="w-16 h-2 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-slate-400"
                        animate={isPaused ? {} : { width: ["30%", "70%", "100%", "30%"] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    />
                </div>
            </div>

            {/* Level Bar */}
            <div className="h-32 w-4 bg-slate-200 dark:bg-white/10 rounded-full relative overflow-hidden flex flex-col-reverse p-0.5">
                <motion.div
                    className="w-full rounded-full"
                    animate={isPaused ? {} : {
                        height: ["30%", "70%", "100%", "30%"],
                        backgroundColor: ["#f43f5e", "#f59e0b", "#10b981", "#f43f5e"]
                    }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />
            </div>
        </div>
    );
};

// --- SCENE: BATCH INPUT (Text to People) ---
export const SceneBatchInput = ({ color, isPaused }: VisualProps) => {
    const bgClass = color.replace('text-', 'bg-');
    return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 dark:bg-white/5 relative">
            <div className="w-40 h-auto flex flex-col gap-3 relative">
                {[0, 1, 2].map(i => (
                    <div key={i} className="relative h-10 w-full flex items-center justify-center">
                        {/* Text Line Representation */}
                        <motion.div
                            className="absolute left-0 w-32 h-4 bg-slate-300 dark:bg-white/20 rounded-md"
                            animate={isPaused ? {} : { opacity: [1, 1, 0, 0, 1], x: [0, 0, 20, 0, 0] }}
                            transition={{ duration: 3, repeat: Infinity, times: [0, 0.4, 0.5, 0.9, 1], delay: i * 0.1 }}
                        />
                        {/* Scanner Light */}
                        <motion.div
                            className="absolute left-0 top-0 bottom-0 w-2 bg-white/50 blur-md z-10"
                            animate={isPaused ? {} : { left: ["-10%", "110%", "110%", "-10%"] }}
                            transition={{ duration: 3, repeat: Infinity, times: [0, 0.5, 0.51, 1], delay: 0.4 }}
                        />
                        {/* Avatar Result */}
                        <motion.div
                            className={`absolute w-10 h-10 rounded-full ${bgClass} shadow-md flex items-center justify-center text-white font-bold text-xs`}
                            initial={{ scale: 0 }}
                            animate={isPaused ? {} : { scale: [0, 0, 1, 1, 0] }}
                            transition={{ duration: 3, repeat: Infinity, times: [0, 0.45, 0.55, 0.9, 1], delay: i * 0.1 }}
                        >
                            {i+1}
                        </motion.div>
                    </div>
                ))}
            </div>
        </div>
    );
};
