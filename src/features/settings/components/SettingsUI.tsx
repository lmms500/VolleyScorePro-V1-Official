
import React from 'react';
import { Check } from 'lucide-react';
import { motion } from 'framer-motion';

export const SectionTitle = ({ children, icon: Icon, color }: { children?: React.ReactNode; icon?: React.ElementType; color?: string }) => {
    const colorFrom = color ? `from-${color}-500` : 'from-slate-400';
    const colorTo = color ? `to-${color}-600` : 'to-slate-600';
    const shadowColor = color ? `shadow-${color}-500/20` : 'shadow-slate-500/20';
    const iconColor = color ? `text-${color}-100` : 'text-slate-100';

    return (
        <div className="flex items-center gap-2.5 px-2 mt-4 mb-2">
            {/* Accent bar */}
            <div className={`w-1 h-5 rounded-full bg-gradient-to-b ${colorFrom} ${colorTo} flex-shrink-0`} />
            {Icon && (
                <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${colorFrom} ${colorTo} flex items-center justify-center shadow-lg ${shadowColor} flex-shrink-0`}>
                    <Icon size={13} className={iconColor} strokeWidth={2.5} />
                </div>
            )}
            <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">{children}</span>
        </div>
    );
};

export const SettingItem = ({ label, icon: Icon, color, children, sub, onClick, className }: { label: string; icon: React.ElementType; color: { bg?: string; bgGradient?: string; text?: string; iconText?: string; shadow?: string }; children?: React.ReactNode; sub?: string; onClick?: () => void; className?: string }) => {
    const iconBgClass = color.bgGradient ? `bg-gradient-to-br ${color.bgGradient}` : color.bg;
    return <div
        onClick={onClick}
        className={`
            relative flex items-center justify-between p-3 rounded-2xl
            bg-white/60 dark:bg-white/[0.03]
            border border-white/60 dark:border-white/5
            ring-1 ring-inset ring-white/10 dark:ring-white/5
            shadow-[0_1px_2px_rgba(0,0,0,0.06),inset_0_1px_0_0_rgba(255,255,255,0.15)]
            hover:bg-white/80 dark:hover:bg-white/[0.06]
            hover:border-white/80 dark:hover:border-white/10
            hover:shadow-md
            hover:translate-x-0.5
            transition-all duration-200
            overflow-hidden group
            ${onClick ? 'cursor-pointer active:scale-[0.99]' : ''}
            ${className ?? ''}
        `}
    >
        {/* Shimmer on hover */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700 skew-x-12 pointer-events-none" />

        <div className="flex items-center gap-3 min-w-0 flex-1 mr-4 relative z-10">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ring-1 ring-inset ring-white/10 shadow-lg ${color.shadow || ''} ${iconBgClass}`}>
                <Icon size={16} strokeWidth={2} className={color.iconText || color.text || 'text-white'} />
            </div>
            <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate leading-tight">{label}</span>
                {sub && <span className="text-[9px] text-slate-400 dark:text-slate-500 font-medium leading-tight truncate mt-0.5">{sub}</span>}
            </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 relative z-10">{children}</div>
    </div>;
};

export const PresetButton = ({ active, onClick, icon: Icon, label, sub, colorClass, borderClass, bgActive, textActive }: { active: boolean; onClick: () => void; icon: React.ElementType; label: string; sub: string; colorClass: string; borderClass: string; bgActive: string; textActive: string }) => (
    <button
        onClick={onClick}
        className={`
            relative py-3 px-3 rounded-2xl border transition-all duration-200
            flex flex-col items-center gap-1.5 text-center group flex-1 min-w-0
            overflow-hidden
            ${active
                ? `bg-gradient-to-br ${bgActive} ${borderClass} ${textActive} shadow-lg shadow-${colorClass}/20 ring-1 ring-inset ring-white/10 z-10 scale-[1.02]`
                : `bg-white/50 dark:bg-white/[0.03] border-white/40 dark:border-white/5 text-slate-500 dark:text-slate-400 hover:bg-white/70 dark:hover:bg-white/[0.06] hover:border-white/60 dark:hover:border-white/10 hover:shadow-md hover:scale-[1.02] ring-1 ring-inset ring-white/10 dark:ring-white/5`
            }
        `}
    >
        {active && (
            <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className={`absolute top-2 right-2 p-0.5 rounded-full ${textActive} bg-white/20`}
            >
                <Check size={10} strokeWidth={3} />
            </motion.div>
        )}
        <div className={`
            w-10 h-10 rounded-xl flex items-center justify-center mb-0.5 transition-all
            ${active
                ? 'bg-white/20 shadow-inner'
                : 'bg-white/50 dark:bg-white/5 border border-white/40 dark:border-white/5 group-hover:bg-white/70 dark:group-hover:bg-white/10'
            }
        `}>
            <Icon size={18} className={`transition-colors ${active ? textActive : 'text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300'}`} strokeWidth={1.5} />
        </div>
        <div className="flex flex-col w-full">
            <span className="text-[10px] font-black uppercase tracking-tight leading-none w-full truncate">{label}</span>
            <span className="text-[8px] font-medium opacity-70 leading-none w-full truncate mt-0.5">{sub}</span>
        </div>
        {/* Shimmer on hover */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700 skew-x-12 pointer-events-none" />
    </button>
);
