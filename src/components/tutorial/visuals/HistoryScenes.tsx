import React from 'react';
import { motion } from 'framer-motion';
import { Share2, FileSpreadsheet, Image, FileJson } from 'lucide-react';
import { VisualProps } from './types';

// --- SCENE: HISTORY SUMMARY (Drill Down) ---
export const SceneHistorySummary = ({ color, isPaused }: VisualProps) => {
    const bgClass = color.replace('text-', 'bg-');
    return (
        <div className="w-full h-full flex items-center justify-center bg-slate-50 dark:bg-white/5 relative overflow-hidden">
            <div className="flex flex-col gap-2 w-32 relative">
                {/* Top Card */}
                <motion.div
                    className="h-8 w-full bg-slate-200 dark:bg-white/10 rounded-lg"
                    animate={isPaused ? {} : { y: [0, -20, 0], opacity: [1, 0, 1] }}
                    transition={{ duration: 3, repeat: Infinity }}
                />

                {/* Hero Card (The one that expands) */}
                <motion.div
                    className={`h-20 w-full bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-black/5 overflow-hidden flex flex-col p-2 relative z-10`}
                    animate={isPaused ? {} : {
                        height: [80, 160, 80],
                        width: [128, 180, 128],
                        y: [0, 0, 0],
                        x: [0, 0, 0]
                    }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                    {/* Header */}
                    <div className="flex justify-between items-center mb-2">
                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10" />
                        <div className="text-xl font-black text-slate-300">VS</div>
                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10" />
                    </div>
                    {/* Expanding Content */}
                    <motion.div
                        className="flex-1 flex items-end gap-1"
                        animate={isPaused ? {} : { opacity: [0, 1, 0] }}
                        transition={{ duration: 3, repeat: Infinity, times: [0.2, 0.5, 0.8] }}
                    >
                        <div className={`w-1/3 h-[60%] ${bgClass} rounded-t-sm`} />
                        <div className="w-1/3 h-[40%] bg-slate-300 rounded-t-sm" />
                        <div className="w-1/3 h-[80%] bg-slate-300 rounded-t-sm" />
                    </motion.div>
                </motion.div>

                {/* Bottom Card */}
                <motion.div
                    className="h-8 w-full bg-slate-200 dark:bg-white/10 rounded-lg"
                    animate={isPaused ? {} : { y: [0, 20, 0], opacity: [1, 0, 1] }}
                    transition={{ duration: 3, repeat: Infinity }}
                />
            </div>
        </div>
    );
};

// --- SCENE: MOMENTUM GRAPH ---
export const SceneMomentum = ({ color, isPaused }: VisualProps) => {
    const strokeClass = color.replace('text-', 'stroke-');
    const fillClass = color.replace('text-', 'fill-');

    return (
        <div className="w-full h-full flex items-center justify-center bg-slate-50 dark:bg-white/5 relative">
            <svg width="200" height="100" viewBox="0 0 200 100" className="overflow-visible">
                {/* Center Line */}
                <line x1="0" y1="50" x2="200" y2="50" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="4 4" />

                {/* Animated Path */}
                <motion.path
                    d="M 0 50 Q 50 10, 100 50 T 200 50"
                    fill="none"
                    strokeWidth="3"
                    className={strokeClass}
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={isPaused ? {} : { pathLength: [0, 1, 1, 0], pathOffset: [0, 0, 1, 1] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                />

                {/* Moving Dot */}
                <motion.circle
                    r="4"
                    className={`${fillClass}`}
                    initial={{ offsetDistance: "0%" }}
                    animate={isPaused ? {} : { offsetDistance: "100%" }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    style={{ offsetPath: `path("M 0 50 Q 50 10, 100 50 T 200 50")` }}
                />

                {/* Turnaround Flash */}
                <motion.rect
                    x="0" y="0" width="200" height="100" fill="currentColor" className="text-white dark:text-slate-800"
                    initial={{ opacity: 0 }}
                    animate={isPaused ? {} : { opacity: [0, 0, 0.3, 0, 0] }}
                    transition={{ duration: 4, repeat: Infinity, times: [0, 0.45, 0.5, 0.55, 1] }}
                />
            </svg>
        </div>
    );
};

// --- SCENE: SCOUT MODE (Satellites) ---
export const SceneScout = ({ color, isPaused }: VisualProps) => {
    const bgClass = color.replace('text-', 'bg-');
    const items = ["ATK", "BLK", "ACE"];

    return (
        <div className="w-full h-full flex items-center justify-center bg-slate-50 dark:bg-white/5 relative">
            {/* Center Ball */}
            <div className="relative w-16 h-16 rounded-full bg-white dark:bg-white/10 shadow-md border border-black/5 flex items-center justify-center z-10">
                <div className="w-12 h-12 rounded-full border-2 border-slate-200 dark:border-white/20" />
            </div>

            {/* Orbiting Buttons */}
            {items.map((label, i) => (
                <motion.div
                    key={i}
                    className={`absolute w-12 h-12 rounded-full ${bgClass} text-white flex items-center justify-center text-[8px] font-bold shadow-lg`}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={isPaused ? {} : {
                        rotate: 360,
                        scale: [0.8, 1.1, 0.8],
                        opacity: 1
                    }}
                    style={{
                        rotate: i * 120,
                        translateX: 60,
                        originX: "-60px", originY: "50%"
                    }}
                    transition={{
                        rotate: { duration: 8, repeat: Infinity, ease: "linear" },
                        scale: { duration: 1, repeat: Infinity, repeatDelay: 2, delay: i * 1 }
                    }}
                >
                    {label}
                    {/* Particle Emitter on Pulse */}
                    <motion.div
                        className="absolute inset-0 rounded-full border border-white"
                        animate={isPaused ? {} : { scale: [1, 1.5], opacity: [0.5, 0] }}
                        transition={{ duration: 1, repeat: Infinity, repeatDelay: 2, delay: i * 1 }}
                    />
                </motion.div>
            ))}
        </div>
    );
};

// --- SCENE: EXPORT (Explosion) ---
export const SceneExport = ({ color, isPaused }: VisualProps) => {
    const bgClass = color.replace('text-', 'bg-');
    return (
        <div className="w-full h-full flex items-center justify-center bg-slate-50 dark:bg-white/5 relative">
            {/* Main File */}
            <motion.div
                className="w-16 h-20 bg-white dark:bg-white/10 rounded-xl border border-black/10 flex items-center justify-center shadow-lg relative z-10"
                animate={isPaused ? {} : { scale: [1, 0.9, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
                <Share2 size={24} className={color} />
            </motion.div>

            {/* Satellites */}
            {[FileSpreadsheet, Image, FileJson].map((Icon, i) => {
                const angle = (i * 120 - 90) * (Math.PI / 180);
                const x = Math.cos(angle) * 50;
                const y = Math.sin(angle) * 50;

                return (
                    <motion.div
                        key={i}
                        className={`absolute w-10 h-10 rounded-full ${bgClass} text-white flex items-center justify-center shadow-sm z-0`}
                        initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
                        animate={isPaused ? {} : {
                            x: [0, x, 0],
                            y: [0, y, 0],
                            opacity: [0, 1, 0],
                            scale: [0, 1, 0]
                        }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
                    >
                        <Icon size={16} />
                    </motion.div>
                );
            })}
        </div>
    );
};
