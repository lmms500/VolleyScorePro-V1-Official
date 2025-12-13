
import React from 'react';
import { motion } from 'framer-motion';
import { Hand, RefreshCw, Trophy, Zap, Shield, Target } from 'lucide-react';

// --- VISUAL SCENARIOS ---

const WelcomeHero = ({ color }: { color: string }) => (
  <div className="w-full h-full flex items-center justify-center relative overflow-hidden bg-slate-50 dark:bg-white/5">
      {/* Background Pulse Rings */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full border-2 ${color.replace('text-', 'border-')} opacity-20`}
          initial={{ width: '4rem', height: '4rem', opacity: 0.5 }}
          animate={{ width: '16rem', height: '16rem', opacity: 0 }}
          transition={{ duration: 3, repeat: Infinity, delay: i * 0.8, ease: "easeOut" }}
        />
      ))}
      
      {/* Central Hero Icon */}
      <motion.div 
        className="relative z-10 w-24 h-24 bg-white dark:bg-white/10 rounded-3xl shadow-2xl flex items-center justify-center ring-1 ring-black/5 dark:ring-white/10"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
          <div className={`w-16 h-16 rounded-2xl ${color.replace('text-', 'bg-')} flex items-center justify-center shadow-lg`}>
              <Trophy size={32} className="text-white" strokeWidth={2} />
          </div>
      </motion.div>
  </div>
);

const ScoreVisual = ({ color }: { color: string }) => (
  <div className="w-full h-full flex items-center justify-center relative overflow-hidden bg-slate-50 dark:bg-white/5">
    {/* Floating Scoreboard */}
    <div className="relative z-10 flex items-center gap-4 bg-white dark:bg-black/40 px-6 py-4 rounded-3xl shadow-xl border border-black/5 dark:border-white/10 backdrop-blur-md">
      <div className="flex flex-col items-center">
        <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">SET 1</span>
        <div className="flex items-center gap-4 text-4xl font-black text-slate-800 dark:text-white leading-none">
            <span>24</span>
            <div className="h-8 w-px bg-slate-200 dark:bg-white/10" />
            <div className="relative overflow-hidden h-10 w-12 flex justify-center">
                <motion.div
                    animate={{ y: [-40, 0, 0, 40] }}
                    transition={{ duration: 2, times: [0, 0.2, 0.8, 1], repeat: Infinity, repeatDelay: 0.5 }}
                    className="absolute flex flex-col items-center gap-2"
                >
                    <span className="opacity-50">22</span>
                    <span className={`${color}`}>23</span>
                    <span className="opacity-50">24</span>
                </motion.div>
            </div>
        </div>
      </div>
    </div>
  </div>
);

const GesturesVisual = ({ color }: { color: string }) => (
  <div className="w-full h-full flex items-center justify-center gap-8 relative bg-slate-50 dark:bg-white/5">
      {/* Tap Gesture */}
      <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-20 rounded-2xl bg-white dark:bg-white/10 shadow-sm border border-black/5 dark:border-white/5 flex items-center justify-center relative overflow-visible">
              <motion.div 
                className={`absolute w-12 h-12 rounded-full ${color.replace('text-', 'bg-')} opacity-20`}
                animate={{ scale: [0.5, 1.5], opacity: [0.5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <Hand size={20} className="text-slate-400" />
              <motion.div 
                className="absolute -top-3 -right-3 bg-emerald-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md shadow-sm"
                animate={{ scale: [0, 1, 1, 0], y: [5, 0, 0, -5] }}
                transition={{ duration: 1.5, repeat: Infinity, times: [0, 0.2, 0.8, 1] }}
              >
                  +1
              </motion.div>
          </div>
          <span className="text-[9px] font-bold uppercase text-slate-400 tracking-wider">Tap</span>
      </div>

      {/* Swipe Gesture */}
      <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-20 rounded-2xl bg-white dark:bg-white/10 shadow-sm border border-black/5 dark:border-white/5 flex items-center justify-center relative overflow-hidden">
              <motion.div 
                className={`absolute inset-x-0 top-1/2 h-0.5 ${color.replace('text-', 'bg-')}`}
                animate={{ y: [10, -10], opacity: [0, 1, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <Hand size={20} className="text-slate-400" />
              <motion.div 
                className="absolute bottom-2 bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md shadow-sm"
                animate={{ opacity: [0, 1, 0], y: [0, -5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
              >
                  -1
              </motion.div>
          </div>
          <span className="text-[9px] font-bold uppercase text-slate-400 tracking-wider">Swipe</span>
      </div>
  </div>
);

const TeamManagementVisual = ({ color }: { color: string }) => {
    const cardBase = "h-10 rounded-lg bg-white dark:bg-black/40 border border-black/5 dark:border-white/10 shadow-sm flex items-center px-2 gap-2";
    const bgClass = color.replace('text-', 'bg-');
    
    return (
      <div className="w-full h-full flex flex-col items-center justify-center relative bg-slate-50 dark:bg-white/5 overflow-hidden">
          {/* Top Row (Court) */}
          <div className="flex gap-2 mb-8">
             <div className={`${cardBase} w-20`}>
                 <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-white/10" />
                 <div className="h-1.5 w-6 bg-slate-200 dark:bg-white/20 rounded-full" />
             </div>
             <div className={`${cardBase} w-20 opacity-50`}>
                 <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-white/10" />
             </div>
          </div>

          {/* Draggable Card */}
          <motion.div 
            className={`${cardBase} w-24 absolute z-20 ring-2 ring-${color.replace('text-', '')}/30`}
            animate={{ y: [40, -30, -30, 40], scale: [1, 1.05, 1.05, 1], rotate: [0, -2, 2, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
              <div className={`w-6 h-6 rounded-full ${bgClass} text-white flex items-center justify-center text-[8px] font-bold`}>#7</div>
              <div className="flex flex-col gap-1">
                  <div className="h-1.5 w-8 bg-slate-800 dark:bg-slate-200 rounded-full" />
                  <div className="h-1 w-4 bg-slate-200 dark:bg-white/10 rounded-full" />
              </div>
          </motion.div>

          {/* Bottom Row (Bench) */}
          <div className="flex gap-2 mt-8 opacity-60">
             <div className={`${cardBase} w-20 border-dashed`}>
                 <div className="w-6 h-6 rounded-full bg-slate-50 dark:bg-white/5" />
             </div>
          </div>
      </div>
    );
};

const TeamCustomizationVisual = ({ color }: { color: string }) => {
    const bgClass = color.replace('text-', 'bg-');
    return (
        <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-slate-50 dark:bg-white/5">
            <motion.div 
                className="w-48 h-12 bg-white dark:bg-white/10 rounded-xl shadow-sm border border-black/5 dark:border-white/10 flex items-center px-4 gap-3"
                animate={{ borderColor: ["rgba(0,0,0,0.05)", color.replace('text-', 'rgba(').replace(')', ',0.5)'), "rgba(0,0,0,0.05)"] }}
                transition={{ duration: 2, repeat: Infinity }}
            >
                <motion.div 
                    className="w-6 h-6 rounded-full"
                    animate={{ backgroundColor: ["#e2e8f0", bgClass.replace('bg-', '#').replace('-500', ''), "#e2e8f0"] }} // Simplified for demo
                    transition={{ duration: 2, repeat: Infinity }}
                />
                <div className="h-2 w-20 bg-slate-200 dark:bg-white/20 rounded-full" />
                <Edit2Icon className="ml-auto text-slate-300" size={14} />
            </motion.div>
            
            <div className="flex gap-3">
                {['bg-indigo-500', 'bg-rose-500', 'bg-emerald-500'].map((c, i) => (
                    <motion.div 
                        key={i}
                        className={`w-8 h-8 rounded-full ${c} shadow-md border-2 border-white dark:border-white/20 cursor-pointer`}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: i * 0.1, type: "spring" }}
                        whileHover={{ scale: 1.2 }}
                    />
                ))}
            </div>
        </div>
    );
};

const PlayerProfileVisual = ({ color }: { color: string }) => {
    const barClass = "h-1.5 rounded-full bg-slate-100 dark:bg-white/5 overflow-hidden";
    const fillClass = color.replace('text-', 'bg-');
    
    return (
        <div className="w-full h-full flex items-center justify-center bg-slate-50 dark:bg-white/5 perspective-[500px]">
            <motion.div 
                className="w-32 bg-white dark:bg-black/40 rounded-2xl shadow-xl border border-black/5 dark:border-white/10 p-3"
                animate={{ rotateY: [0, 360] }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                style={{ transformStyle: 'preserve-3d' }}
            >
                <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-xs">🦁</div>
                    <div className="space-y-1">
                        <div className="h-2 w-12 bg-slate-800 dark:bg-slate-200 rounded-full" />
                        <div className="h-1.5 w-6 bg-slate-300 dark:bg-white/20 rounded-full" />
                    </div>
                </div>
                <div className="space-y-2">
                    <div className={barClass}><motion.div className={`h-full ${fillClass}`} animate={{ width: ["0%", "80%", "80%", "0%"] }} transition={{ duration: 3, repeat: Infinity }} /></div>
                    <div className={barClass}><motion.div className={`h-full ${fillClass}`} animate={{ width: ["0%", "40%", "40%", "0%"] }} transition={{ duration: 3, repeat: Infinity, delay: 0.2 }} /></div>
                    <div className={barClass}><motion.div className={`h-full ${fillClass}`} animate={{ width: ["0%", "60%", "60%", "0%"] }} transition={{ duration: 3, repeat: Infinity, delay: 0.4 }} /></div>
                </div>
            </motion.div>
        </div>
    );
};

const SkillBalanceVisual = ({ color }: { color: string }) => {
    const barClass = "w-10 rounded-t-lg bg-slate-200 dark:bg-white/10 relative overflow-hidden flex items-end justify-center pb-1";
    return (
        <div className="w-full h-full flex items-end justify-center gap-4 px-8 pb-8 bg-slate-50 dark:bg-white/5">
            <motion.div 
                className={`${barClass} border-b-4 border-indigo-500`}
                animate={{ height: ["30%", "60%", "60%", "30%"] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
                <span className="text-[10px] font-bold text-slate-500">A</span>
            </motion.div>
            
            <div className="mb-8 text-slate-300 text-xs font-bold">VS</div>

            <motion.div 
                className={`${barClass} border-b-4 border-rose-500`}
                animate={{ height: ["70%", "60%", "60%", "70%"] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
                <span className="text-[10px] font-bold text-slate-500">B</span>
            </motion.div>
        </div>
    );
};

const HistoryTimelineVisual = ({ color }: { color: string }) => (
    <div className="w-full h-full flex items-center justify-center bg-slate-50 dark:bg-white/5 pl-8">
        <div className="relative w-0.5 h-32 bg-slate-300 dark:bg-white/20">
            {/* Moving Nodes */}
            {[0, 1, 2].map((i) => (
                <motion.div
                    key={i}
                    className={`absolute -left-1.5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-800 ${color.replace('text-', 'bg-')}`}
                    initial={{ top: '100%', opacity: 0 }}
                    animate={{ top: `${i * 33}%`, opacity: 1 }}
                    transition={{ delay: i * 0.5, duration: 0.8, ease: "backOut", repeat: Infinity, repeatDelay: 2 }}
                />
            ))}
            
            {/* Popups */}
            <motion.div 
                className="absolute left-4 top-[33%] bg-white dark:bg-black/40 px-2 py-1 rounded shadow-sm border border-black/5 text-[8px] font-bold"
                initial={{ opacity: 0, x: -10, scale: 0.8 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ delay: 1, duration: 0.3, repeat: Infinity, repeatDelay: 3 }}
            >
                POINT
            </motion.div>
        </div>
    </div>
);

const ScoutModeVisual = ({ color }: { color: string }) => {
    return (
        <div className="w-full h-full flex items-center justify-center bg-slate-50 dark:bg-white/5">
            <div className="grid grid-cols-2 gap-2 p-3 bg-white dark:bg-white/5 rounded-2xl shadow-sm border border-black/5 dark:border-white/5 rotate-3">
                {['Attack', 'Block', 'Ace', 'Error'].map((label, i) => (
                    <motion.div 
                        key={i}
                        className="w-16 h-12 rounded-xl bg-slate-100 dark:bg-white/10 flex items-center justify-center"
                        animate={{ 
                            scale: [1, 0.95, 1],
                            backgroundColor: ["#f1f5f9", i===0 ? color.replace('text-', 'bg-').replace('-500', '-100') : "#f1f5f9", "#f1f5f9"] 
                        }}
                        transition={{ 
                            duration: 0.4, 
                            delay: i * 0.5, 
                            repeat: Infinity, 
                            repeatDelay: 2 
                        }}
                    >
                        <div className={`w-8 h-1 rounded-full ${i===0 ? color.replace('text-', 'bg-') : 'bg-slate-300 dark:bg-white/20'}`} />
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

const AnalyticsVisual = ({ color }: { color: string }) => {
    const bgClass = color.replace('text-', 'bg-');
    return (
      <div className="w-full h-full flex items-end justify-center gap-2 px-8 pb-8 bg-slate-50 dark:bg-white/5">
          {[20, 50, 80, 40, 60].map((h, i) => (
              <motion.div 
                key={i}
                className={`w-4 rounded-t-md ${i === 2 ? bgClass : 'bg-slate-200 dark:bg-white/10'}`}
                animate={{ height: [`${h}%`, `${h + 10}%`, `${h}%`] }}
                transition={{ duration: 2, delay: i * 0.1, repeat: Infinity, ease: "easeInOut" }}
              />
          ))}
      </div>
    );
};

const RotationVisual = ({ color }: { color: string }) => (
    <div className="w-full h-full flex items-center justify-center bg-slate-50 dark:bg-white/5 relative overflow-hidden">
        {/* Orbiting Elements */}
        <motion.div 
            className="w-32 h-32 rounded-full border-2 border-dashed border-slate-300 dark:border-white/10 absolute"
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Players */}
        {[0, 90, 180, 270].map((deg, i) => (
            <motion.div
                key={i}
                className={`absolute w-8 h-8 rounded-full shadow-sm flex items-center justify-center text-[8px] font-bold text-white
                    ${i===0 ? color.replace('text-', 'bg-') : 'bg-slate-300 dark:bg-white/20'}
                `}
                animate={{ rotate: -360 }} // Counter-rotate to stay upright
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                style={{ 
                    transformOrigin: 'center center',
                    top: '50%', left: '50%',
                    marginTop: -16, marginLeft: -16,
                    transform: `rotate(${deg}deg) translate(4rem) rotate(-${deg}deg)` // Static placement logic handled by parent rotation
                }}
            >
                {/* Actually relying on parent container rotation for orbit */}
            </motion.div>
        ))}
        
        {/* Parent Container for Orbit */}
        <motion.div 
            className="absolute inset-0 flex items-center justify-center"
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        >
             {[0, 90, 180, 270].map((deg, i) => (
                <div
                    key={i}
                    className={`absolute w-8 h-8 rounded-full shadow-sm flex items-center justify-center text-[8px] font-bold text-white
                        ${i===0 ? color.replace('text-', 'bg-') : 'bg-slate-300 dark:bg-white/20'}
                    `}
                    style={{ 
                        transform: `rotate(${deg}deg) translate(3rem) rotate(-${deg}deg)`
                    }}
                />
            ))}
        </motion.div>

        <RefreshCw size={24} className={`${color} absolute drop-shadow-sm z-10 bg-white dark:bg-slate-900 rounded-full p-1`} />
    </div>
);

// Small Icon Helper
const Edit2Icon = ({ className, size }: any) => (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
    </svg>
);

// --- MAIN EXPORT ---

export const TutorialVisual = ({ visualId, colorTheme }: { visualId: string, colorTheme: any }) => {
  const color = colorTheme.text || 'text-indigo-500';

  switch (visualId) {
    case 'welcome_hero': return <WelcomeHero color={color} />;
    case 'match_score': return <ScoreVisual color={color} />;
    case 'gestures': return <GesturesVisual color={color} />;
    case 'team_management': return <TeamManagementVisual color={color} />;
    case 'team_customization': return <TeamCustomizationVisual color={color} />;
    case 'player_profile': return <PlayerProfileVisual color={color} />;
    case 'skill_balance': return <SkillBalanceVisual color={color} />;
    case 'history_timeline': return <HistoryTimelineVisual color={color} />;
    case 'scout_mode': return <ScoutModeVisual color={color} />;
    case 'history_analytics': return <AnalyticsVisual color={color} />;
    case 'rotation': return <RotationVisual color={color} />;
    default: return null;
  }
};
