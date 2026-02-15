import React from 'react';
import { motion } from 'framer-motion';
import { Hand, ArrowRight, ArrowDown, Settings, Mic } from 'lucide-react';
import { VisualProps } from './types';
import { AppLogoSVG } from './AppScenes';

// --- SCENE: INSTALL APP ---
export const SceneInstall = ({ color, isPaused }: VisualProps) => {
    const bgClass = color.replace('text-', 'bg-');
    return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 dark:bg-white/5 relative">
            <div className="relative">
                {/* Phone Frame */}
                <div className="w-32 h-56 bg-white dark:bg-slate-800 rounded-3xl border-4 border-slate-200 dark:border-white/10 shadow-xl flex flex-col items-center justify-center relative overflow-hidden">
                    <div className="absolute top-0 w-16 h-4 bg-slate-200 dark:bg-white/10 rounded-b-xl z-20" />

                    {/* App Icon Inside */}
                    <motion.div
                        className={`w-16 h-16 rounded-2xl ${bgClass} flex items-center justify-center shadow-lg text-white mb-2 z-10`}
                        initial={{ scale: 0 }}
                        animate={isPaused ? {} : { scale: [0, 1.1, 1] }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <AppLogoSVG className="w-10 h-10 text-white" />
                    </motion.div>

                    {/* Install Bar */}
                    <motion.div
                        className="w-20 h-6 bg-slate-100 dark:bg-white/10 rounded-full mt-4 overflow-hidden relative"
                    >
                        <motion.div
                            className={`h-full ${bgClass} opacity-80`}
                            initial={{ width: 0 }}
                            animate={isPaused ? {} : { width: "100%" }}
                            transition={{ duration: 1.5, delay: 0.8, ease: "easeInOut" }}
                        />
                    </motion.div>
                </div>

                {/* Floating Arrow */}
                <motion.div
                    className={`absolute -top-10 left-1/2 -translate-x-1/2 ${color}`}
                    animate={isPaused ? {} : { y: [0, 10, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                    <ArrowDown size={32} strokeWidth={3} />
                </motion.div>
            </div>
        </div>
    );
};

// --- SCENE: GESTURES (Tap & Swipe) ---
export const GesturesVisual = ({ color, isPaused }: VisualProps) => {
    const bgClass = color.replace('text-', 'bg-');
    return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 dark:bg-white/5 relative gap-8">
            {/* Tap Gesture */}
            <div className="flex flex-col items-center gap-2">
                <div className="relative w-16 h-16 rounded-full bg-white dark:bg-white/10 shadow-sm border border-black/5 flex items-center justify-center">
                    <motion.div
                        className={`absolute inset-0 rounded-full ${bgClass} opacity-20`}
                        animate={isPaused ? {} : { scale: [1, 1.5], opacity: [0.5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                    />
                    <Hand size={24} className={color} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Tap</span>
            </div>

            {/* Swipe Gesture (Horizontal) */}
            <div className="flex flex-col items-center gap-2">
                <div className="relative w-32 h-16 rounded-2xl bg-white dark:bg-white/10 shadow-sm border border-black/5 flex items-center px-4">
                    <motion.div
                        className={`w-8 h-8 rounded-full ${bgClass} flex items-center justify-center text-white shadow-md`}
                        animate={isPaused ? {} : { x: [0, 60, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                        <ArrowRight size={16} />
                    </motion.div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Swipe</span>
            </div>
        </div>
    );
};

// --- SCENE: SETTINGS (Gears) ---
export const SettingsConfigVisual = ({ color, isPaused }: VisualProps) => {
    return (
        <div className="w-full h-full flex items-center justify-center bg-slate-50 dark:bg-white/5 relative">
            <div className="relative w-32 h-32">
                {/* Big Gear */}
                <motion.div
                    className="absolute top-0 right-0 text-slate-300 dark:text-slate-600"
                    animate={isPaused ? {} : { rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                >
                    <Settings size={80} strokeWidth={1} />
                </motion.div>

                {/* Small Gear */}
                <motion.div
                    className={`absolute bottom-0 left-0 ${color}`}
                    animate={isPaused ? {} : { rotate: -360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                >
                    <Settings size={48} strokeWidth={1.5} />
                </motion.div>

                {/* Switch Toggle */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-slate-800 rounded-full shadow-lg border border-black/5 p-2">
                    <motion.div
                        className={`w-8 h-4 rounded-full bg-slate-200 dark:bg-white/10 relative`}
                    >
                        <motion.div
                            className={`absolute top-0.5 bottom-0.5 w-3 h-3 rounded-full shadow-sm ${color.replace('text-', 'bg-')}`}
                            animate={isPaused ? {} : { left: ["2px", "18px", "2px"] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        />
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

// --- SCENE: VOICE & AUDIO (Waves) ---
export const AudioNarratorVisual = ({ color, isPaused }: VisualProps) => {
    const bgClass = color.replace('text-', 'bg-');
    return (
        <div className="w-full h-full flex items-center justify-center bg-slate-50 dark:bg-white/5 relative">
            {/* Concentric Waves */}
            {[0, 1, 2].map(i => (
                <motion.div
                    key={i}
                    className={`absolute rounded-full border-2 ${color.replace('text-', 'border-')} opacity-20`}
                    initial={{ width: 40, height: 40, opacity: 0.5 }}
                    animate={isPaused ? {} : {
                        width: [40, 120 + (i*40)],
                        height: [40, 120 + (i*40)],
                        opacity: [0.5, 0]
                    }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
                />
            ))}

            {/* Central Mic Icon */}
            <motion.div
                className={`relative z-10 w-16 h-16 rounded-full ${bgClass} flex items-center justify-center shadow-lg text-white`}
                animate={isPaused ? {} : { scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
                <Mic size={32} />
            </motion.div>

            {/* Sound Bars (Simulated EQ) */}
            <div className="absolute bottom-8 flex gap-1 items-end h-8">
                {[...Array(5)].map((_, i) => (
                    <motion.div
                        key={i}
                        className={`w-1.5 rounded-full ${bgClass}`}
                        animate={isPaused ? {} : { height: [4, 16 + Math.random()*16, 4] }}
                        transition={{ duration: 0.5 + Math.random()*0.5, repeat: Infinity, ease: "easeInOut" }}
                    />
                ))}
            </div>
        </div>
    );
};
