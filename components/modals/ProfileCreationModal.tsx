
import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Save, UserCircle2, Shield, Hand, Zap, Target, Smile, Type, Grid } from 'lucide-react';
import { useTranslation } from '../../contexts/LanguageContext';
import { PlayerRole } from '../../types';
import { motion } from 'framer-motion';

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

// Categorized Avatar Library
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

  // Initialization Logic
  useEffect(() => {
      if (isOpen) {
          setName(initialName);
          setNumber(initialNumber);
          setSkill(initialSkill || 5);
          setRole(initialRole || 'none');
          
          // Detect if initial avatar (passed implicitly via props logic or default) is emoji or text
          // Currently props doesn't pass initialAvatar separate from component logic, assuming new or edit
          // If we were editing, we'd check if initialAvatar is in emoji list. 
          // For simplicity in this robust update, we default to emoji '🏐' or initials if name exists.
          if (initialName && !customText) {
             setCustomText(getInitials(initialName));
          }
      }
  }, [isOpen, initialName, initialNumber, initialSkill, initialRole]);

  // Auto-generate initials when name changes, if user hasn't manually overridden text
  useEffect(() => {
      if (mode === 'text') {
          const initials = getInitials(name);
          // Only auto-update if the current text matches old initials or is empty
          // Simple heuristic: just update it for fluid UX
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

  // Dynamic Color for Slider
  const getSkillColor = (s: number) => {
      if (s <= 3) return 'text-rose-500';
      if (s <= 7) return 'text-amber-500';
      return 'text-emerald-500';
  };
  const getTrackColor = (s: number) => {
      if (s <= 3) return 'bg-rose-500';
      if (s <= 7) return 'bg-amber-500';
      return 'bg-emerald-500';
  };

  const roles: { id: PlayerRole, label: string, icon: any, color: string }[] = [
      { id: 'setter', label: 'Setter', icon: Hand, color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' },
      { id: 'hitter', label: 'Hitter', icon: Zap, color: 'text-rose-500 bg-rose-500/10 border-rose-500/20' },
      { id: 'middle', label: 'Middle', icon: Target, color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20' },
      { id: 'libero', label: 'Libero', icon: Shield, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
  ];

  if (!isOpen) return null;

  return createPortal(
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title || t('profile.createTitle')}
      maxWidth="max-w-sm"
      zIndex="z-[9999]"
    >
      <div className="flex flex-col gap-5 pb-2">
        
        {/* --- 1. AVATAR PREVIEW & TOGGLE --- */}
        <div className="flex flex-col items-center gap-4">
            
            {/* The Big Avatar Display */}
            <div className="relative group">
                <div className="w-24 h-24 rounded-[2rem] bg-slate-100 dark:bg-white/5 flex items-center justify-center shadow-inner border border-slate-200 dark:border-white/10 overflow-hidden transition-all duration-300">
                    {mode === 'emoji' ? (
                        <span className="text-5xl animate-in zoom-in duration-300">{selectedEmoji}</span>
                    ) : (
                        <input 
                            type="text"
                            value={customText}
                            onChange={(e) => setCustomText(e.target.value.toUpperCase())}
                            maxLength={2}
                            className="w-full h-full bg-transparent text-center text-3xl font-black text-slate-700 dark:text-slate-200 outline-none uppercase placeholder:opacity-20"
                            placeholder="AB"
                        />
                    )}
                </div>
                {/* Number Badge */}
                {number && (
                    <div className="absolute -top-2 -right-2 w-8 h-8 flex items-center justify-center bg-indigo-600 text-white font-black text-sm rounded-xl shadow-lg border-2 border-white dark:border-slate-900 z-10">
                        {number}
                    </div>
                )}
            </div>

            {/* Mode Switcher */}
            <div className="flex p-1 bg-slate-100 dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/5">
                <button 
                    onClick={() => setMode('emoji')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${mode === 'emoji' ? 'bg-white dark:bg-white/10 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    <Smile size={14} /> Emoji
                </button>
                <button 
                    onClick={() => { setMode('text'); if(!customText) setCustomText(getInitials(name)); }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${mode === 'text' ? 'bg-white dark:bg-white/10 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    <Type size={14} /> Text
                </button>
            </div>

            {/* Selection Area (Conditional) */}
            {mode === 'emoji' && (
                <div className="w-full space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    {/* Categories */}
                    <div className="flex justify-center gap-1">
                        {(Object.keys(EMOJI_CATEGORIES) as Array<keyof typeof EMOJI_CATEGORIES>).map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-wide transition-colors ${activeCategory === cat ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                    
                    {/* Emojis Grid */}
                    <div className="w-full overflow-x-auto no-scrollbar mask-linear-fade-sides -mx-6 px-6">
                        <div className="flex gap-2 w-max px-2 py-1">
                            {EMOJI_CATEGORIES[activeCategory].map(emoji => (
                                <button
                                    key={emoji}
                                    onClick={() => setSelectedEmoji(emoji)}
                                    className={`
                                        w-10 h-10 rounded-xl flex items-center justify-center text-2xl transition-all duration-200
                                        ${selectedEmoji === emoji 
                                            ? 'bg-indigo-500 scale-110 shadow-lg shadow-indigo-500/30' 
                                            : 'bg-slate-50 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 opacity-70 hover:opacity-100'}
                                    `}
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>

        {/* --- 2. INPUT FIELDS --- */}
        <div className="space-y-3">
            <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <UserCircle2 size={18} />
                </div>
                <input 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t('profile.namePlaceholder')}
                    className="w-full bg-slate-100 dark:bg-white/5 border-none rounded-xl py-3 pl-10 pr-4 font-bold text-slate-800 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                />
            </div>
            <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-black text-xs">#</div>
                <input 
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                    placeholder={t('profile.numberPlaceholder')}
                    type="tel"
                    maxLength={3}
                    className="w-full bg-slate-100 dark:bg-white/5 border-none rounded-xl py-3 pl-10 pr-4 font-bold text-slate-800 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                />
            </div>
        </div>

        {/* --- 3. SKILL SLIDER --- */}
        <div className="bg-slate-50 dark:bg-black/20 rounded-2xl p-4 border border-black/5 dark:border-white/5 space-y-3">
            <div className="flex justify-between items-end">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{t('profile.skillLevel')}</label>
                <div className="flex items-baseline gap-1">
                    <span className={`text-2xl font-black tabular-nums transition-colors ${getSkillColor(skill)}`}>{skill}</span>
                    <span className="text-xs font-bold text-slate-300">/ 10</span>
                </div>
            </div>

            <div className="relative w-full h-8 flex items-center touch-none">
                <div className="absolute w-full h-3 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                    <div 
                        className={`h-full transition-all duration-200 ${getTrackColor(skill)}`}
                        style={{ width: `${(skill / 10) * 100}%` }}
                    />
                </div>
                <input 
                    type="range" min="1" max="10" step="1"
                    value={skill}
                    onChange={(e) => setSkill(Number(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                />
                <div 
                    className="absolute h-6 w-6 bg-white border-2 rounded-full shadow-md pointer-events-none transition-all duration-200 z-10 flex items-center justify-center"
                    style={{ left: `calc(${(skill / 10) * 100}% - 12px)` }}
                >
                    <div className={`w-2 h-2 rounded-full ${getTrackColor(skill)}`} />
                </div>
            </div>
        </div>

        {/* --- 4. ROLE SELECTION --- */}
        <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 block px-1">Primary Role</label>
            <div className="grid grid-cols-4 gap-2">
                {roles.map((r) => {
                    const isActive = role === r.id;
                    return (
                        <button
                            key={r.id}
                            onClick={() => setRole(isActive ? 'none' : r.id)}
                            className={`
                                flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl border transition-all duration-200
                                ${isActive ? r.color + ' ring-2 ring-offset-1 ring-offset-white dark:ring-offset-slate-900 ring-current' : 'bg-slate-50 dark:bg-white/5 border-transparent text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10'}
                            `}
                        >
                            <r.icon size={18} />
                            <span className="text-[9px] font-bold uppercase tracking-wide">{r.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>

        {/* --- 5. ACTIONS --- */}
        <div className="grid grid-cols-2 gap-3 pt-2">
            <Button variant="secondary" onClick={onClose}>{t('common.cancel')}</Button>
            <Button onClick={handleSave} className="bg-indigo-600 text-white shadow-indigo-500/20">
                <Save size={18} /> {t(title === "Create Profile" ? 'profile.create' : 'profile.save')}
            </Button>
        </div>

      </div>
    </Modal>,
    document.body
  );
};
