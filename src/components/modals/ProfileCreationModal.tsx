
import React, { useState, useEffect, useRef } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Save, UserCircle2, Shield, Hand, Zap, Target, Palette, Star, X } from 'lucide-react';
import { useTranslation } from '../../contexts/LanguageContext';
import { PlayerRole } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';

interface ProfileCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, number: string, avatar: string, skill: number, role: PlayerRole) => void;
  initialName: string;
  initialNumber: string;
  initialSkill?: number;
  initialRole?: PlayerRole;
  title?: string;
}

const EMOJI_CATEGORIES = {
  sports: ['🏐', '🏆', '🥇', '👟', '🎽', '🔥', '⚡', '💪', '🤕', '📢', '⏱️', '🏋️', '🚴', '🏊', '🧘'],
  faces:  ['😎', '😤', '🤠', '👿', '🤡', '🤖', '👽', '💀', '👻', '🧐', '🤩', '🥶', '🤯', '🤫', '🫡'],
  animals:['🦅', '🦈', '🦁', '🐯', '🦍', '🐐', '🐍', '🐂', '🦊', '🐺', '🐗', '🦖', '🐙', '🦋', '🐝'],
  misc:   ['💎', '🚀', '💣', '🛡️', '⚔️', '🧬', '🧿', '🎲', '👑', '🎩', '🧢', '🕶️', '🎧', '🍔', '🍕']
};

export const ProfileCreationModal: React.FC<ProfileCreationModalProps> = ({
  isOpen, onClose, onSave, initialName, initialNumber, initialSkill = 5, initialRole = 'none', title
}) => {
  const { t } = useTranslation();
  
  // Form State
  const [name, setName] = useState(initialName);
  const [number, setNumber] = useState(initialNumber);
  const [skill, setSkill] = useState(initialSkill);
  const [role, setRole] = useState<PlayerRole>(initialRole);

  // Avatar State
  const [mode, setMode] = useState<'emoji' | 'text'>('emoji');
  const [selectedEmoji, setSelectedEmoji] = useState('🏐');
  const [customText, setCustomText] = useState('');
  const [activeCategory, setActiveCategory] = useState<keyof typeof EMOJI_CATEGORIES>('sports');
  const [isAvatarExpanded, setIsAvatarExpanded] = useState(false);

  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
      if (isOpen) {
          setName(initialName);
          setNumber(initialNumber);
          setSkill(initialSkill || 5);
          setRole(initialRole || 'none');
          setIsAvatarExpanded(false);
          
          if (initialName && !customText) {
             setCustomText(getInitials(initialName));
          }
          setTimeout(() => nameInputRef.current?.focus(), 100);
      }
  }, [isOpen, initialName, initialNumber, initialSkill, initialRole]);

  useEffect(() => {
      if (mode === 'text') {
          const initials = getInitials(name);
          if (customText.length <= 2) {
             setCustomText(initials);
          }
      }
  }, [name, mode]);

  const getInitials = (fullName: string) => {
      const parts = fullName.trim().split(' ');
      if (parts.length === 0) return '';
      if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const handleSave = () => {
    if (!name.trim()) return;
    const finalAvatar = mode === 'emoji' ? selectedEmoji : (customText || getInitials(name)).substring(0, 2);
    onSave(name, number, finalAvatar, skill, role);
    onClose();
  };

  const roles: { id: PlayerRole, label: string, icon: any, color: string, bg: string, border: string }[] = [
      { id: 'setter', label: t('roles.setter'), icon: Hand, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
      { id: 'hitter', label: t('roles.hitter'), icon: Zap, color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
      { id: 'middle', label: t('roles.middle'), icon: Target, color: 'text-indigo-500', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
      { id: 'libero', label: t('roles.libero'), icon: Shield, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
      { id: 'none', label: t('roles.none'), icon: UserCircle2, color: 'text-slate-400', bg: 'bg-slate-100 dark:bg-white/5', border: 'border-slate-200 dark:border-white/10' },
  ];

  // Helper for slider color
  const getSliderColor = (s: number) => {
      if (s <= 3) return '#f43f5e'; // Rose
      if (s <= 7) return '#f59e0b'; // Amber
      return '#10b981'; // Emerald
  };
  const currentColor = getSliderColor(skill);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title || t('profile.createTitle')}
      maxWidth="max-w-2xl" 
      variant="floating" 
    >
      <div className="flex flex-col gap-6 overflow-x-hidden pb-24">
        
        {/* MAIN SPLIT CONTAINER */}
        <div className="flex flex-col landscape:flex-row gap-8 mx-1">
            
            {/* LEFT COL: IDENTITY (Avatar, Name, Number) */}
            <div className="flex flex-col gap-5 w-full landscape:w-[45%] flex-shrink-0 min-w-0">
                
                {/* Avatar Section */}
                <div className="flex items-start gap-5">
                    <button 
                        onClick={() => setIsAvatarExpanded(!isAvatarExpanded)}
                        className="relative group transition-transform active:scale-95 shrink-0 mt-1"
                    >
                        <div className="w-24 h-24 rounded-[1.5rem] bg-slate-100 dark:bg-white/5 flex items-center justify-center text-5xl shadow-lg border border-white/50 dark:border-white/10 overflow-hidden relative">
                            {mode === 'emoji' ? selectedEmoji : (customText || getInitials(name))}
                            
                            {/* Edit Overlay Hint */}
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
                                <Palette size={24} className="text-white drop-shadow-md" />
                            </div>
                        </div>
                        <div className="absolute -bottom-2 -right-2 bg-indigo-600 text-white p-2 rounded-full shadow-lg border-2 border-white dark:border-slate-800 z-10">
                            {isAvatarExpanded ? <X size={14} strokeWidth={3} /> : <Palette size={14} strokeWidth={3} />}
                        </div>
                    </button>

                    <div className="flex-1 space-y-3 min-w-0">
                        <div>
                            <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase ml-1 mb-1 block">{t('profile.namePlaceholder')}</label>
                            <input 
                                ref={nameInputRef}
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder={t('profile.namePlaceholder')}
                                className="w-full h-12 bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-xl px-4 text-base font-bold text-slate-800 dark:text-white outline-none transition-all placeholder:text-slate-400/50 shadow-sm"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase ml-1 mb-1 block">{t('profile.numberPlaceholder')}</label>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-400 font-black text-xs">#</div>
                                <input 
                                    type="tel"
                                    inputMode="numeric"
                                    value={number}
                                    onChange={(e) => setNumber(e.target.value)}
                                    placeholder="00"
                                    maxLength={3}
                                    className="w-full h-10 bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-xl px-3 text-center text-sm font-black text-slate-800 dark:text-white outline-none transition-all placeholder:text-slate-400/50 shadow-sm"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Inline Avatar Picker */}
                <AnimatePresence>
                    {isAvatarExpanded && (
                        <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden bg-slate-50 dark:bg-black/20 rounded-2xl border border-black/5 dark:border-white/5 p-3 shadow-inner"
                        >
                            <div className="flex gap-2 mb-3 bg-white dark:bg-white/5 p-1 rounded-xl shadow-sm border border-black/5 dark:border-white/5">
                                <button onClick={() => setMode('emoji')} className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${mode === 'emoji' ? 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>{t('profile.emoji')}</button>
                                <button onClick={() => setMode('text')} className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${mode === 'text' ? 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>{t('profile.text')}</button>
                            </div>

                            {mode === 'emoji' ? (
                                <>
                                    <div className="flex gap-1 overflow-x-auto pb-2 mb-1 no-scrollbar mask-linear-fade-right">
                                        {Object.keys(EMOJI_CATEGORIES).map(cat => (
                                            <button key={cat} onClick={() => setActiveCategory(cat as any)} className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase transition-colors shrink-0 border border-transparent ${activeCategory === cat ? 'bg-white dark:bg-white/10 text-indigo-500 shadow-sm border-black/5 dark:border-white/5' : 'text-slate-400 hover:bg-white/50 dark:hover:bg-white/5'}`}>
                                                {cat}
                                            </button>
                                        ))}
                                    </div>
                                    {/* Safe Responsive Grid */}
                                    <div className="grid grid-cols-5 sm:grid-cols-7 gap-2 p-1">
                                        {EMOJI_CATEGORIES[activeCategory].map(emoji => (
                                            <button key={emoji} onClick={() => { setSelectedEmoji(emoji); setIsAvatarExpanded(false); }} className={`aspect-square flex items-center justify-center text-xl rounded-xl hover:bg-white dark:hover:bg-white/10 transition-colors ${selectedEmoji === emoji ? 'bg-white dark:bg-white/10 shadow-md ring-2 ring-indigo-500/20' : ''}`}>
                                                {emoji}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className="flex justify-center py-4">
                                    <input 
                                        type="text" maxLength={2} value={customText} onChange={(e) => setCustomText(e.target.value.toUpperCase())}
                                        className="w-32 text-center bg-transparent border-b-2 border-indigo-500 py-2 text-4xl font-black uppercase focus:outline-none text-slate-800 dark:text-white placeholder:opacity-30"
                                        placeholder="AB"
                                    />
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* RIGHT COL: STATS & ROLE */}
            <div className="flex flex-col gap-6 w-full landscape:flex-1 flex-shrink-0 landscape:border-l border-slate-200 dark:border-white/5 landscape:pl-6 min-w-0">
                
                {/* SKILL SLIDER - Highly Responsive Rainbow */}
                <div className="bg-white/60 dark:bg-white/5 rounded-3xl p-5 border border-white/50 dark:border-white/5 shadow-lg shadow-black/5 overflow-visible">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-2.5">
                            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
                                <Star size={16} fill="currentColor" />
                            </div>
                            <span className="text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-300">{t('profile.skillLevel')}</span>
                        </div>
                        <span className="text-2xl font-black tabular-nums transition-colors duration-300" style={{ color: currentColor }}>
                            {skill}<span className="text-sm opacity-50 text-slate-400">/10</span>
                        </span>
                    </div>
                    
                    <div className="relative h-12 flex items-center mx-6 touch-none">
                        <input 
                            type="range" min="1" max="10" value={skill} onChange={(e) => setSkill(parseInt(e.target.value))}
                            className="w-full h-full opacity-0 absolute inset-0 cursor-pointer z-30"
                        />
                        
                        {/* Custom Track: Rainbow Gradient */}
                        <div className="absolute inset-x-0 h-4 rounded-full overflow-hidden border border-black/5 dark:border-white/5">
                            <div className="w-full h-full bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-500 opacity-20" />
                        </div>

                        {/* Ticks */}
                        <div className="absolute inset-x-0 h-4 flex justify-between px-1 pointer-events-none z-0">
                            {[...Array(10)].map((_, i) => (
                                <div key={i} className="w-px h-full bg-slate-900/5 dark:bg-white/10" />
                            ))}
                        </div>

                        {/* Custom Thumb */}
                        <motion.div 
                            className="absolute h-8 w-8 bg-white dark:bg-slate-800 shadow-[0_4px_12px_rgba(0,0,0,0.2)] border-4 rounded-full top-2 pointer-events-none z-20 flex items-center justify-center ring-4 ring-white/20 dark:ring-black/20"
                            style={{ borderColor: currentColor }}
                            animate={{ left: `calc(${((skill-1)/9)*100}% - 16px)` }}
                            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                        >
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: currentColor }} />
                        </motion.div>
                    </div>
                    
                    <div className="flex justify-between mt-1 px-1">
                        <span className="text-[9px] font-bold text-rose-500 uppercase tracking-widest">{t('profile.rookie')}</span>
                        <span className="text-[9px] font-bold text-amber-500 uppercase tracking-widest">Avg</span>
                        <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">{t('profile.pro')}</span>
                    </div>
                </div>

                {/* ROLE SELECTOR - Grid */}
                <div className="flex flex-col gap-3 min-w-0">
                    <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase ml-1">{t('profile.preferredRole')}</label>
                    <div className="grid grid-cols-3 sm:grid-cols-5 landscape:grid-cols-3 xl:landscape:grid-cols-5 gap-3">
                        {roles.map(r => (
                            <button
                                key={r.id}
                                onClick={() => setRole(r.id)}
                                className={`
                                    flex flex-col items-center justify-center gap-2 py-3 rounded-2xl border transition-all active:scale-95 duration-200 min-w-0
                                    ${role === r.id 
                                        ? `bg-white dark:bg-slate-800 ${r.color} border-transparent ring-2 ring-inset ${r.color.replace('text-', 'ring-')} shadow-lg transform scale-105` 
                                        : 'bg-white/40 dark:bg-white/5 border-transparent text-slate-400 hover:bg-white/80 dark:hover:bg-white/10 hover:shadow-sm'}
                                `}
                            >
                                <r.icon size={20} strokeWidth={2.5} />
                                <span className="text-[9px] font-bold uppercase tracking-wider leading-none truncate w-full text-center px-1">{r.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

            </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="fixed bottom-0 left-0 right-0 p-6 pt-4 border-t border-slate-200 dark:border-white/5 flex gap-4 z-50 shrink-0 bg-white/90 dark:bg-[#0f172a]/90 backdrop-blur-xl">
            <Button variant="ghost" onClick={onClose} className="flex-1 bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 h-14 rounded-2xl hover:bg-slate-200 dark:hover:bg-white/10">
                {t('common.cancel')}
            </Button>
            <Button onClick={handleSave} disabled={!name.trim()} className="flex-[2] bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-500/30 h-14 rounded-2xl text-sm font-black uppercase tracking-widest ring-1 ring-white/20">
                <Save size={18} className="mr-2" strokeWidth={2.5} /> {t('common.save')}
            </Button>
        </div>

      </div>
    </Modal>
  );
};
