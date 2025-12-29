
import React from 'react';
import { Check } from 'lucide-react';

export const SectionTitle = ({ children, icon: Icon }: { children?: React.ReactNode, icon?: any }) => (
    <div className="flex items-center gap-2 px-2 mt-3 mb-1.5">
        {Icon && <Icon size={12} className="text-slate-400" />}
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{children}</span>
    </div>
);

export const SettingItem = ({ label, icon: Icon, color, children, sub, onClick }: any) => (
    <div onClick={onClick} className={`flex items-center justify-between p-3 rounded-2xl bg-white/60 dark:bg-white/[0.03] border border-white/50 dark:border-white/5 shadow-sm hover:bg-white/80 dark:hover:bg-white/[0.06] hover:border-white/60 dark:hover:border-white/10 transition-all duration-200 ${onClick ? 'cursor-pointer active:scale-[0.99]' : ''}`}>
        <div className="flex items-center gap-3 min-w-0 flex-1 mr-4">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color.bg} ${color.text} flex-shrink-0 ring-1 ring-black/5 dark:ring-white/5`}><Icon size={16} strokeWidth={2} /></div>
            <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate leading-tight">{label}</span>
                {sub && <span className="text-[9px] text-slate-400 font-medium leading-tight truncate mt-0.5">{sub}</span>}
            </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">{children}</div>
    </div>
);

export const PresetButton = ({ active, onClick, icon: Icon, label, sub, colorClass, borderClass, bgActive, textActive }: any) => (
  <button onClick={onClick} className={`relative py-3 px-3 rounded-2xl border transition-all flex flex-col items-center gap-1.5 text-center group flex-1 min-w-0 ${active ? `${bgActive} ${borderClass} ${textActive} shadow-lg shadow-${colorClass}/20 ring-1 ring-${colorClass}/50 z-10` : `bg-white dark:bg-white/5 border-black/5 dark:border-white/5 text-slate-500 dark:text-slate-400 hover:bg-white/80 dark:hover:bg-white/10 hover:border-black/10 dark:hover:border-white/10`}`}>
      {active && <div className={`absolute top-2 right-2 p-0.5 rounded-full ${textActive} bg-white/20`}><Check size={10} strokeWidth={3} /></div>}
      <Icon size={20} className={`mb-0.5 transition-colors ${active ? textActive : 'text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300'}`} strokeWidth={1.5} />
      <div className="flex flex-col w-full">
          <span className="text-[10px] font-black uppercase tracking-tight leading-none w-full truncate">{label}</span>
          <span className={`text-[8px] font-medium opacity-70 leading-none w-full truncate mt-0.5`}>{sub}</span>
      </div>
  </button>
);
