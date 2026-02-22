import React from 'react';
import { motion } from 'framer-motion';
import { Hand, ArrowRight, ArrowDown, Settings, Mic, Download, Check, Smartphone } from 'lucide-react';
import { VisualProps } from './types';
import { AppLogoSVG } from './AppScenes';

// --- SCENE: INSTALL APP (Premium) ---
export const SceneInstall = ({ color, isPaused }: VisualProps) => {
    const bgClass = color.replace('text-', 'bg-');
    
    return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-emerald-50/30 via-white to-cyan-50/30 dark:from-emerald-950/20 dark:via-slate-900 dark:to-cyan-950/20 relative overflow-hidden">
            {/* Floating particles */}
            {[...Array(8)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute w-1.5 h-1.5 rounded-full bg-gradient-to-br from-emerald-400/40 to-cyan-400/40"
                    style={{
                        left: `${15 + Math.random() * 70}%`,
                        top: `${15 + Math.random() * 70}%`
                    }}
                    animate={isPaused ? {} : {
                        y: [0, -20, 0],
                        x: [0, (Math.random() - 0.5) * 15, 0],
                        scale: [0.5, 1, 0.5],
                        opacity: [0.2, 0.5, 0.2]
                    }}
                    transition={{
                        duration: 3 + Math.random() * 2,
                        repeat: Infinity,
                        delay: i * 0.3,
                        ease: "easeInOut"
                    }}
                />
            ))}

            {/* Phone mockup */}
            <motion.div
                className="relative"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
            >
                {/* Glow effect */}
                <motion.div
                    className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 blur-2xl"
                    animate={isPaused ? {} : { scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
                    transition={{ duration: 3, repeat: Infinity }}
                />

                {/* Phone frame */}
                <div className="relative w-36 h-64 bg-gradient-to-br from-slate-800 to-slate-900 rounded-[2.5rem] border-4 border-slate-700 shadow-2xl flex flex-col items-center overflow-hidden">
                    {/* Notch */}
                    <div className="absolute top-0 w-20 h-6 bg-slate-800 rounded-b-2xl z-20 flex items-center justify-center">
                        <div className="w-12 h-3 bg-slate-900 rounded-full" />
                    </div>

                    {/* Screen content */}
                    <div className="flex-1 w-full bg-gradient-to-b from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 mt-6 flex flex-col items-center justify-center p-4">
                        {/* App icon */}
                        <motion.div
                            className={`w-14 h-14 rounded-2xl ${bgClass} flex items-center justify-center shadow-xl mb-3`}
                            animate={isPaused ? {} : {
                                scale: [1, 1.1, 1],
                                boxShadow: [
                                    '0 4px 15px -3px rgba(0,0,0,0.2)',
                                    '0 8px 25px -5px rgba(0,0,0,0.3)',
                                    '0 4px 15px -3px rgba(0,0,0,0.2)'
                                ]
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            <AppLogoSVG className="w-10 h-10 text-white" />
                        </motion.div>

                        {/* App name */}
                        <span className="text-xs font-bold text-slate-800 dark:text-white">VolleyScore</span>

                        {/* Install progress */}
                        <motion.div
                            className="w-20 h-7 bg-slate-100 dark:bg-slate-700 rounded-full mt-4 flex items-center justify-center overflow-hidden relative"
                        >
                            <motion.div
                                className={`absolute left-0 top-0 h-full ${bgClass} opacity-80`}
                                initial={{ width: 0 }}
                                animate={isPaused ? { width: '50%' } : { width: ['0%', '100%'] }}
                                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                            />
                            <motion.div
                                className="relative z-10 flex items-center gap-1"
                                animate={isPaused ? {} : { opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                            >
                                <Download size={12} className="text-white" />
                                <span className="text-[9px] font-bold text-white">INSTALL</span>
                            </motion.div>
                        </motion.div>
                    </div>

                    {/* Home indicator */}
                    <div className="h-6 w-full flex items-center justify-center">
                        <div className="w-24 h-1 bg-slate-600 rounded-full" />
                    </div>
                </div>

                {/* Floating arrow */}
                <motion.div
                    className="absolute -top-12 left-1/2 -translate-x-1/2"
                    animate={isPaused ? {} : { y: [0, 8, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                    <div className="flex flex-col items-center gap-1">
                        <motion.div
                            className={`w-10 h-10 rounded-full ${bgClass} flex items-center justify-center shadow-lg`}
                            animate={isPaused ? {} : { scale: [1, 1.1, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                        >
                            <Download size={20} className="text-white" />
                        </motion.div>
                        <ArrowDown size={16} className={color} />
                    </div>
                </motion.div>
            </motion.div>

            {/* Label */}
            <motion.div
                className="mt-6 flex items-center gap-2"
                animate={isPaused ? {} : { opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity }}
            >
                <Smartphone size={14} className={color} />
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Adicionar à Tela Inicial
                </span>
            </motion.div>
        </div>
    );
};

// --- SCENE: GESTURES (Premium Tap & Swipe) ---
export const GesturesVisual = ({ color, isPaused }: VisualProps) => {
    const bgClass = color.replace('text-', 'bg-');
    
    return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-violet-50/30 via-white to-indigo-50/30 dark:from-violet-950/10 dark:via-slate-900 dark:to-indigo-950/10 relative overflow-hidden gap-10">
            {/* Tap gesture */}
            <div className="flex flex-col items-center gap-3">
                <motion.div
                    className="relative w-20 h-20 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-white/10 flex items-center justify-center shadow-lg"
                    animate={isPaused ? {} : {
                        boxShadow: [
                            '0 4px 15px -3px rgba(0,0,0,0.1)',
                            '0 8px 25px -5px rgba(139, 92, 246, 0.3)',
                            '0 4px 15px -3px rgba(0,0,0,0.1)'
                        ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    {/* Ripple effect */}
                    <motion.div
                        className={`absolute inset-0 rounded-2xl ${bgClass} opacity-20`}
                        animate={isPaused ? {} : { scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    />
                    <Hand size={32} className={color} />
                </motion.div>
                <div className="text-center">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Toque</span>
                    <span className="text-[10px] text-slate-400 block">+1 Ponto</span>
                </div>
            </div>

            {/* Swipe gesture */}
            <div className="flex flex-col items-center gap-3">
                <motion.div
                    className="relative w-32 h-12 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-white/10 flex items-center px-3 shadow-lg overflow-hidden"
                >
                    {/* Swipe indicator background */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-20">
                        <ArrowDown size={20} className="text-slate-400" />
                    </div>
                    
                    {/* Swipe thumb */}
                    <motion.div
                        className={`w-8 h-8 rounded-xl ${bgClass} flex items-center justify-center text-white shadow-md z-10`}
                        animate={isPaused ? {} : { y: [0, 24, 0] }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                    >
                        <Hand size={16} />
                    </motion.div>
                </motion.div>
                <div className="text-center">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Deslize</span>
                    <span className="text-[10px] text-slate-400 block">-1 Ponto</span>
                </div>
            </div>
        </div>
    );
};

// --- SCENE: SETTINGS (Premium Gears) ---
export const SettingsConfigVisual = ({ color, isPaused }: VisualProps) => {
    return (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/20 relative overflow-hidden">
            {/* Background gradient */}
            <motion.div
                className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent"
                animate={isPaused ? {} : { opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 4, repeat: Infinity }}
            />

            {/* Gear system */}
            <div className="relative w-36 h-36">
                {/* Large gear */}
                <motion.div
                    className="absolute top-0 right-0 text-slate-200 dark:text-slate-700"
                    animate={isPaused ? {} : { rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                >
                    <Settings size={72} strokeWidth={1} />
                </motion.div>

                {/* Small gear */}
                <motion.div
                    className={`absolute bottom-2 left-2 ${color}`}
                    animate={isPaused ? {} : { rotate: -360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                >
                    <Settings size={44} strokeWidth={1.5} />
                </motion.div>

                {/* Central switch */}
                <motion.div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 shadow-xl border border-slate-100 dark:border-white/10 flex items-center justify-center"
                    animate={isPaused ? {} : {
                        boxShadow: [
                            '0 4px 15px -3px rgba(0,0,0,0.1)',
                            '0 8px 25px -5px rgba(99,102,241,0.2)',
                            '0 4px 15px -3px rgba(0,0,0,0.1)'
                        ]
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                >
                    <motion.div
                        className={`w-8 h-4 rounded-full bg-gradient-to-r ${color.replace('text-', 'from-').replace('-500', '-400')} ${color.replace('text-', 'to-').replace('-500', '-600')} relative`}
                    >
                        <motion.div
                            className="absolute top-0.5 w-3 h-3 bg-white rounded-full shadow-md"
                            animate={isPaused ? { left: '4px' } : { left: ['4px', '16px', '4px'] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        />
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
};

// --- SCENE: AUDIO NARRATOR (Premium Waves) ---
export const AudioNarratorVisual = ({ color, isPaused }: VisualProps) => {
    const bgClass = color.replace('text-', 'bg-');
    
    return (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-sky-50/30 via-white to-indigo-50/30 dark:from-sky-950/20 dark:via-slate-900 dark:to-indigo-950/20 relative overflow-hidden">
            {/* Pulse rings */}
            {[0, 1, 2].map((i) => (
                <motion.div
                    key={i}
                    className={`absolute rounded-full border-2 ${color.replace('text-', 'border-')} opacity-20`}
                    animate={isPaused ? { scale: 0.3, opacity: 0 } : {
                        scale: [0.3, 1.5],
                        opacity: [0.5, 0]
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.4,
                        ease: "easeOut"
                    }}
                    style={{ width: 50, height: 50 }}
                />
            ))}

            {/* Mic button */}
            <motion.div
                className="relative z-10"
                animate={isPaused ? {} : { scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
            >
                <motion.div
                    className={`absolute inset-0 rounded-full ${bgClass} opacity-30 blur-xl`}
                    animate={isPaused ? {} : { scale: [1, 1.3, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                />
                <div className={`w-20 h-20 rounded-full ${bgClass} flex items-center justify-center shadow-xl relative`}>
                    <Mic size={32} className="text-white" />
                </div>
            </motion.div>

            {/* Equalizer bars */}
            <div className="absolute bottom-10 flex items-end gap-1 h-12">
                {[...Array(7)].map((_, i) => (
                    <motion.div
                        key={i}
                        className={`w-2 rounded-full ${bgClass}`}
                        animate={isPaused ? { height: 8 } : {
                            height: [8, 24 + Math.sin(i) * 16, 8]
                        }}
                        transition={{
                            duration: 0.8 + Math.random() * 0.4,
                            repeat: Infinity,
                            delay: i * 0.08,
                            ease: "easeInOut"
                        }}
                    />
                ))}
            </div>
        </div>
    );
};
