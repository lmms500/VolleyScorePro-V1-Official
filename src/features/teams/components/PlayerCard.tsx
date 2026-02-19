
import React, { memo, useMemo, useCallback, useRef, useState, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Player, PlayerProfile, PlayerRole } from '@types';
import { Pin, Save, Edit2, MoreVertical, Hash, RefreshCw, User, GripVertical } from 'lucide-react';
import { SkillSlider } from '@ui/SkillSlider';
import { motion } from 'framer-motion';
import { useRosterStore } from '@features/teams/store/rosterStore';

interface PlayerCardProps {
  player: Player;
  locationId: string;
  profile?: PlayerProfile;
  onUpdatePlayer: (id: string, updates: Partial<Player>) => void | { success: boolean; error?: string };
  onSaveProfile: (id: string, overrides: any) => void;
  onRequestProfileEdit: (id: string) => void;
  onViewProfile: (id: string) => void;
  onToggleMenu: (playerId: string, targetElement: HTMLElement) => void;
  isMenuActive: boolean;
  onShowToast?: (msg: string, type: 'success' | 'info' | 'error') => void;
  isCompact?: boolean;
  forceDragStyle?: boolean;
  activeNumberId?: string | null;
  onRequestEditNumber?: (id: string) => void;
}

const ROLE_STYLES: Record<string, string> = {
  setter: 'bg-gradient-to-br from-amber-500/20 to-amber-500/5 border-amber-500/30 ring-1 ring-inset ring-amber-500/10 hover:from-amber-500/30 hover:to-amber-500/10',
  hitter: 'bg-gradient-to-br from-rose-500/20 to-rose-500/5 border-rose-500/30 ring-1 ring-inset ring-rose-500/10 hover:from-rose-500/30 hover:to-rose-500/10',
  middle: 'bg-gradient-to-br from-indigo-500/20 to-indigo-500/5 border-indigo-500/30 ring-1 ring-inset ring-indigo-500/10 hover:from-indigo-500/30 hover:to-indigo-500/10',
  libero: 'bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border-emerald-500/30 ring-1 ring-inset ring-emerald-500/10 hover:from-emerald-500/30 hover:to-emerald-500/10',
  none: ''
};

const EditableTitle = memo(({ name, onSave, className }: { name: string; onSave: (val: string) => void; className?: string }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [val, setVal] = useState(name);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { setVal(name); }, [name]);
  useEffect(() => { if (isEditing) inputRef.current?.focus(); }, [isEditing]);
  const save = () => { setIsEditing(false); if (val.trim() && val !== name) onSave(val.trim()); else setVal(name); };
  if (isEditing) return <input ref={inputRef} type="text" className="bg-transparent text-slate-900 dark:text-white border-b-2 border-indigo-500 outline-none w-full min-w-0 px-0 py-0 font-bold text-sm" value={val} onChange={e => setVal(e.target.value)} onBlur={save} onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') setIsEditing(false); }} onPointerDown={e => e.stopPropagation()} onTouchStart={e => e.stopPropagation()} />;
  return <div className={`flex items-center gap-2 group cursor-pointer min-w-0 flex-1 ${className}`} onClick={(e) => { e.stopPropagation(); setIsEditing(true); }} onPointerDown={e => e.stopPropagation()}><span className="truncate flex-1 min-w-0 block">{name}</span><Edit2 size={10} className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 flex-shrink-0" /></div>;
});

const EditableNumber = memo(({ number, onSave, isOpen, onRequestOpen, onRequestClose }: any) => {
  const [val, setVal] = useState(number || '');
  const [isError, setIsError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { setVal(number || ''); if (!isOpen) setIsError(false); }, [number, isOpen]);
  useEffect(() => { if (isOpen) requestAnimationFrame(() => inputRef.current?.focus()); }, [isOpen]);
  const attemptSave = () => {
    const trimmed = val.trim(); if (trimmed === (number || '') || trimmed === '') { setIsError(false); if (onRequestClose) onRequestClose(); return; }
    const result = onSave(trimmed); if (result && result.success === false) { setIsError(true); inputRef.current?.focus(); } else { setIsError(false); if (onRequestClose) onRequestClose(); }
  };
  if (isOpen) return <><div className="fixed inset-0 z-40 bg-transparent" onPointerDown={(e) => { e.stopPropagation(); attemptSave(); }} /><motion.input ref={inputRef} type="tel" maxLength={3} animate={isError ? { x: [0, -4, 4, 0], borderColor: '#e11d48' } : { x: 0 }} className={`relative z-50 w-8 h-8 text-center rounded-lg border-2 outline-none text-xs font-black shadow-lg ${isError ? 'bg-rose-50 border-rose-600' : 'bg-white border-indigo-500'}`} value={val} onChange={e => { setVal(e.target.value); if (isError) setIsError(false); }} onKeyDown={e => { if (e.key === 'Enter') attemptSave(); if (e.key === 'Escape') onRequestClose(); }} onPointerDown={e => e.stopPropagation()} /></>;
  return <button onClick={(e) => { e.stopPropagation(); onRequestOpen(); }} onPointerDown={e => e.stopPropagation()} className={`w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-black border transition-all ${number ? 'bg-slate-500/10 dark:bg-white/5 text-slate-800 dark:text-white border-black/5 dark:border-transparent' : 'text-slate-300 dark:text-slate-600 border-transparent hover:border-slate-300'}`}>{number || <Hash size={12} />}</button>;
});

export const PlayerCard = memo((props: PlayerCardProps) => {
  // Use granular selectors to avoid new object creation on every store update
  const setActiveNumberId = useRosterStore(s => s.setActiveNumberId);
  const activeNumberId = useRosterStore(s => s.activeNumberId);
  const setActivePlayerMenu = useRosterStore(s => s.setActivePlayerMenu);
  // This selector depends on props, but returns boolean, so it's stable if boolean doesn't change
  const isMenuActive = useRosterStore(s => s.activePlayerMenu?.playerId === props.player.id);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: props.player.id,
    data: { fromId: props.locationId, player: props.player },
    disabled: props.player.isFixed || isMenuActive || (activeNumberId === props.player.id),
  });

  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.9 : 1, zIndex: isDragging ? 100 : 'auto', willChange: 'transform' };
  const isLinked = !!props.player.profileId && !!props.profile;
  const isDirty = useMemo(() => {
    if (!isLinked || !props.profile) return false;
    const p = props.player;
    const pr = props.profile;
    const safeNum = (v: any) => { const n = Number(v); return isNaN(n) ? 0 : n; };
    const safeStr = (s: any) => (s || '').toString().trim();
    return (
      safeStr(pr.name) !== safeStr(p.name) ||
      safeNum(pr.skillLevel) !== safeNum(p.skillLevel) ||
      safeStr(pr.number) !== safeStr(p.number) ||
      (pr.role || 'none') !== (p.role || 'none')
    );
  }, [props.player, props.profile, isLinked]);

  const activeRole = props.profile?.role || props.player.role || 'none';
  const roleStyleClass = ROLE_STYLES[activeRole];
  let containerClass = `
      bg-gradient-to-br from-white/80 to-white/40 dark:from-white/[0.08] dark:to-white/[0.02] 
      backdrop-blur-md
      border border-white/40 dark:border-white/10
      ring-1 ring-inset ring-white/20 dark:ring-white/5
      shadow-[0_1px_3px_rgba(0,0,0,0.04),inset_0_1px_0_0_rgba(255,255,255,0.15)] hover:shadow-md
      transition-all duration-200 active:scale-[0.98]
  `;
  if (props.forceDragStyle) containerClass = `bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border border-indigo-400/50 shadow-[0_25px_50px_-12px_rgba(99,102,241,0.3),inset_0_1px_0_0_rgba(255,255,255,0.15)] z-50 ring-2 ring-indigo-500/20`;
  else if (props.locationId.includes('_Reserves')) containerClass = 'border-dashed border-slate-300 dark:border-white/10 bg-slate-50/50 dark:bg-black/20';
  else if (props.player.isFixed) containerClass = 'bg-amber-500/5 border-amber-500/20';
  else if (roleStyleClass) containerClass = roleStyleClass;

  return (
    <div ref={setNodeRef} style={style} className={`group relative flex items-center justify-between rounded-2xl border py-1.5 px-2.5 min-h-[50px] ${containerClass}`}>
      <div {...attributes} {...listeners} className="mr-2 cursor-grab active:cursor-grabbing p-1 -ml-1 text-slate-400 hover:text-indigo-500">{props.player.isFixed ? <Pin size={14} className="text-amber-500" fill="currentColor" /> : <GripVertical size={16} />}</div>
      <div className="flex items-center gap-2 flex-shrink-0 mr-2"><div className="w-7 h-7 rounded-full flex items-center justify-center bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-300 overflow-hidden border border-black/5">{props.profile?.avatar ? (props.profile.avatar.length <= 4 ? <span className="text-xs">{props.profile.avatar}</span> : <img src={props.profile.avatar} className="w-full h-full object-cover" />) : <User size={14} className="opacity-50" />}</div><EditableNumber number={props.player.number} onSave={(v: any) => props.onUpdatePlayer(props.player.id, { number: v })} isOpen={activeNumberId === props.player.id} onRequestOpen={() => setActiveNumberId(props.player.id)} onRequestClose={() => setActiveNumberId(null)} /></div>
      <div className="flex flex-1 items-center gap-2 min-w-0 px-1"><EditableTitle name={props.player.name} onSave={(v) => props.onUpdatePlayer(props.player.id, { name: v })} className="text-sm font-bold text-slate-900 dark:text-white" /></div>
      <div className="flex items-center gap-1 flex-shrink-0 relative z-30"><SkillSlider level={props.player.skillLevel} onChange={(v) => props.onUpdatePlayer(props.player.id, { skillLevel: v })} /><button onClick={(e) => { e.stopPropagation(); props.onRequestProfileEdit(props.player.id); }} className={`p-1.5 rounded-lg ${isLinked ? (isDirty ? 'text-amber-500 animate-pulse' : 'text-slate-400') : 'text-slate-300'}`}>{isLinked ? (isDirty ? <RefreshCw size={14} /> : <Edit2 size={14} />) : <Save size={14} />}</button><button onClick={(e) => { e.stopPropagation(); setActivePlayerMenu({ playerId: props.player.id, rect: e.currentTarget.getBoundingClientRect() }); }} className={`p-1.5 rounded-lg ${isMenuActive ? 'bg-slate-200 dark:bg-white/10 text-indigo-500' : 'text-slate-300 hover:text-slate-600'}`}><MoreVertical size={14} /></button></div>
    </div>
  );
});
