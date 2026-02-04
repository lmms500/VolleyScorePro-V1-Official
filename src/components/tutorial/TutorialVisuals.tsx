
import React from 'react';
import { motion } from 'framer-motion';
import { 
    Hand, Users, Edit3, User, Crown, Swords, Zap, CheckCircle2, 
    Trophy, Mic, ArrowRight, Volume2, ArrowRightLeft, FileSpreadsheet,
    Share2, Image, FileText, RefreshCw, ChevronRight, ArrowUp, Star,
    List, BarChart2, Calendar, Target, Shield, AlertTriangle, Download,
    ClipboardList, Scale, FileJson, Settings, Smartphone, ArrowDown
} from 'lucide-react';
import { useTranslation } from '../../contexts/LanguageContext';

// Common interface for all visuals
interface VisualProps {
    color: string;
    isPaused: boolean;
}

// --- HELPERS & SVG ---
const AppLogoSVG = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect width="512" height="512" rx="128" fill="#0f172a"/>
    <circle cx="256" cy="256" r="160" stroke="url(#paint0_linear_logo_tut)" strokeWidth="32"/>
    <path d="M256 96C256 96 320 180 380 180" stroke="url(#paint1_linear_logo_tut)" strokeWidth="32" strokeLinecap="round"/>
    <path d="M256 416C256 416 192 332 132 332" stroke="url(#paint2_linear_logo_tut)" strokeWidth="32" strokeLinecap="round"/>
    <path d="M116 200C116 200 180 220 256 256" stroke="url(#paint3_linear_logo_tut)" strokeWidth="32" strokeLinecap="round"/>
    <path d="M396 312C396 312 332 292 256 256" stroke="url(#paint4_linear_logo_tut)" strokeWidth="32" strokeLinecap="round"/>
    <defs>
      <linearGradient id="paint0_linear_logo_tut" x1="96" y1="96" x2="416" y2="416" gradientUnits="userSpaceOnUse">
        <stop stopColor="#6366f1"/>
        <stop offset="1" stopColor="#f43f5e"/>
      </linearGradient>
      <linearGradient id="paint1_linear_logo_tut" x1="256" y1="96" x2="380" y2="180" gradientUnits="userSpaceOnUse">
        <stop stopColor="#6366f1"/>
        <stop offset="1" stopColor="#818cf8"/>
      </linearGradient>
      <linearGradient id="paint2_linear_logo_tut" x1="256" y1="416" x2="132" y2="332" gradientUnits="userSpaceOnUse">
        <stop stopColor="#f43f5e"/>
        <stop offset="1" stopColor="#fb7185"/>
      </linearGradient>
      <linearGradient id="paint3_linear_logo_tut" x1="116" y1="200" x2="256" y2="256" gradientUnits="userSpaceOnUse">
        <stop stopColor="#6366f1"/>
        <stop offset="1" stopColor="#f43f5e"/>
      </linearGradient>
      <linearGradient id="paint4_linear_logo_tut" x1="396" y1="312" x2="256" y2="256" gradientUnits="userSpaceOnUse">
        <stop stopColor="#f43f5e"/>
        <stop offset="1" stopColor="#6366f1"/>
      </linearGradient>
    </defs>
  </svg>
);

// --- SCENE 0: APP LOGO ---
const AppLogoVisual = ({ isPaused }: { isPaused: boolean }) => (
  <div className="w-full h-full flex items-center justify-center bg-slate-50 dark:bg-white/5 relative overflow-hidden">
      <motion.div
        className="absolute rounded-full bg-indigo-500/10 blur-3xl"
        initial={{ width: 150, height: 150, opacity: 0.2 }}
        animate={isPaused ? { width: 150, height: 150, opacity: 0.2 } : { width: [150, 250, 150], height: [150, 250, 150], opacity: [0.2, 0.6, 0.2] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="relative z-10"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, type: "spring", bounce: 0.5 }}
      >
          <motion.div
            className="w-32 h-32 drop-shadow-2xl"
            animate={isPaused ? { y: 0 } : { y: [0, -15, 0] }}
            transition={{ y: { duration: 4, repeat: Infinity, ease: "easeInOut" } }}
          >
              <AppLogoSVG className="w-full h-full" />
          </motion.div>
      </motion.div>
  </div>
);

// --- SCENE 1: COMMAND CENTER (Intro) ---
const SceneCommandCenter = ({ color, isPaused }: VisualProps) => {
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

// --- SCENE 2: DRAG & DROP (Physics) ---
const SceneDragDrop = ({ color, isPaused }: VisualProps) => {
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
                    style={{ color: '#6366f1' }} // Hardcoded indigo for dashed target
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

// --- SCENE 3: PLAYER PROFILES (Stats Binding) ---
const SceneProfiles = ({ color, isPaused }: VisualProps) => {
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
                animate={isPaused ? {} : { backgroundColor: ["#cbd5e1", "#f1f5f9", "#cbd5e1"] }} // slate-300 to slate-100
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

// --- SCENE 4: SUBSTITUTIONS (The Swap) ---
const SceneSubstitutions = ({ color, isPaused }: VisualProps) => {
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

// --- SCENE 5: ROTATIONS (Shuffle Logic) ---
const SceneRotation = ({ color, isPaused }: VisualProps) => {
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
                            // Phase 1: King stays (i=0), others rotate
                            // Phase 2: All shuffle
                            x: i === 0 
                                ? [positions[0].x, positions[0].x, 0, 0, positions[0].x] 
                                : [positions[i].x, positions[(i+1)%4].x, positions[i].x * 1.5, positions[(i+2)%4].x, positions[i].x],
                            y: i === 0 
                                ? [positions[0].y, positions[0].y, 0, 0, positions[0].y] 
                                : [positions[i].y, positions[(i+1)%4].y, positions[i].y * 1.5, positions[(i+2)%4].y, positions[i].y],
                            scale: i === 0 ? [1.2, 1.2, 0.8, 0.8, 1.2] : 1,
                            backgroundColor: i === 0 
                                ? ["#f59e0b", "#f59e0b", "#e2e8f0", "#e2e8f0", "#f59e0b"] // Amber -> Slate -> Amber
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

// --- SCENE 6: SKILL BALANCE (Leveling) ---
const SceneBalance = ({ color, isPaused }: VisualProps) => {
    return (
        <div className="w-full h-full flex items-center justify-center bg-slate-50 dark:bg-white/5 gap-6">
            <div className="flex flex-col items-center gap-2">
                <motion.div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
                    animate={isPaused ? {} : { 
                        backgroundColor: ["#f43f5e", "#f59e0b", "#10b981", "#f43f5e"], // Rose -> Amber -> Emerald
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

// --- SCENE 7: BATCH INPUT (Text to People) ---
const SceneBatchInput = ({ color, isPaused }: VisualProps) => {
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

// --- SCENE 8: SUMMARY (Drill Down) ---
const SceneHistorySummary = ({ color, isPaused }: VisualProps) => {
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
                        x: [0, 0, 0] // Centered by flex
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

// --- SCENE 9: MOMENTUM GRAPH ---
const SceneMomentum = ({ color, isPaused }: VisualProps) => {
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

// --- SCENE 10: SCOUT MODE (Satellites) ---
const SceneScout = ({ color, isPaused }: VisualProps) => {
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
                        translateX: 60, // Radius
                        originX: "-60px", originY: "50%" // Pivot around center
                    }}
                    transition={{ 
                        rotate: { duration: 8, repeat: Infinity, ease: "linear" },
                        scale: { duration: 1, repeat: Infinity, repeatDelay: 2, delay: i * 1 } // Staggered Pulse
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

// --- SCENE 11: EXPORT (Explosion) ---
const SceneExport = ({ color, isPaused }: VisualProps) => {
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

// --- SCENE 12: INSTALL APP (New) ---
const SceneInstall = ({ color, isPaused }: VisualProps) => {
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
const GesturesVisual = ({ color, isPaused }: VisualProps) => {
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
const SettingsConfigVisual = ({ color, isPaused }: VisualProps) => {
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
const AudioNarratorVisual = ({ color, isPaused }: VisualProps) => {
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

// --- MAIN EXPORT ---
export const TutorialVisual: React.FC<{ visualId: string; colorTheme: any; isPaused: boolean }> = ({ visualId, colorTheme, isPaused }) => {
    // Map theme object back to a tailwind text class string required by visuals
    const color = colorTheme?.crown || 'text-indigo-500';

    const visualMap: Record<string, React.ReactElement> = {
        'app_logo': <AppLogoVisual isPaused={isPaused} />,
        'gestures': <GesturesVisual color={color} isPaused={isPaused} />,
        'settings_config': <SettingsConfigVisual color={color} isPaused={isPaused} />,
        'voice_control': <AudioNarratorVisual color={color} isPaused={isPaused} />, 
        'audio_narrator': <AudioNarratorVisual color={color} isPaused={isPaused} />,
        'team_management': <SceneCommandCenter color={color} isPaused={isPaused} />,
        'drag_and_drop': <SceneDragDrop color={color} isPaused={isPaused} />,
        'player_profile': <SceneProfiles color={color} isPaused={isPaused} />,
        'substitutions': <SceneSubstitutions color={color} isPaused={isPaused} />,
        'rotations': <SceneRotation color={color} isPaused={isPaused} />,
        'skill_balance_v2': <SceneBalance color={color} isPaused={isPaused} />,
        'batch_input': <SceneBatchInput color={color} isPaused={isPaused} />,
        'history_analytics': <SceneHistorySummary color={color} isPaused={isPaused} />,
        'history_timeline': <SceneMomentum color={color} isPaused={isPaused} />,
        'scout_mode_advanced': <SceneScout color={color} isPaused={isPaused} />,
        'export_data': <SceneExport color={color} isPaused={isPaused} />,
        'install_app': <SceneInstall color={color} isPaused={isPaused} />, // Added
    };

    return visualMap[visualId] || <AppLogoVisual isPaused={isPaused} />;
};
