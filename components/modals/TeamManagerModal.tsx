
import React, { useState, useMemo, useEffect, useCallback, memo, useRef, lazy } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Team, Player, RotationMode, PlayerProfile, TeamColor, ActionLog, PlayerRole } from '../../types';
import { calculateTeamStrength } from '../../utils/balanceUtils';
import { Pin, Trash2, Shuffle, Edit2, Plus, Undo2, Ban, Star, Save, RefreshCw, AlertCircle, User, Upload, List, Hash, Users, Layers, Search, X, ListFilter, ArrowDownAZ, ArrowDown01, ArrowUpWideNarrow, LogOut, ChevronRight, ChevronLeft, Armchair, ArrowRightLeft, ArrowUp, MoreVertical, Unlock, RefreshCcw, PlusCircle, ArrowUpCircle, Activity, ArrowDown, Check, ChevronsUp, ChevronUp, ChevronDown, ListOrdered, Hand, Zap, Target, Shield, Info, Image as ImageIcon, Lock, Palette, ChevronsDown, UserPlus } from 'lucide-react';
import { DndContext, DragEndEvent, DragOverEvent, DragStartEvent, DragOverlay, closestCenter, PointerSensor, useSensor, useSensors, KeyboardSensor, TouchSensor, useDndMonitor, useDroppable, MouseSensor } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { createPortal } from 'react-dom';
import { useTranslation } from '../../contexts/LanguageContext';
import { TEAM_COLORS, COLOR_KEYS, resolveTheme, getHexFromColor } from '../../utils/colors';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { SubstitutionModal } from './SubstitutionModal';
import { ProfileCreationModal } from './ProfileCreationModal';
import { ProfileDetailsModal } from './ProfileDetailsModal';
import { ConfirmationModal } from './ConfirmationModal';
import { useHaptics } from '../../hooks/useHaptics';
import { SkillSlider } from '../ui/SkillSlider'; 
import { useGameAudio } from '../../hooks/useGameAudio';
import { PlayerCard } from '../PlayerCard';
import { staggerContainer, staggerItem, liquidSpring } from '../../utils/animations';
import { useTutorial } from '../../hooks/useTutorial';
import { PLAYER_LIMIT_ON_COURT } from '../../constants';

const RichTutorialModal = lazy(() => import('./RichTutorialModal').then(m => ({ default: m.RichTutorialModal })));

const SortableContextFixed = SortableContext as any;
const DragOverlayFixed = DragOverlay as any;

// ... (Interface and types remain unchanged)
interface TeamManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  courtA: Team;
  courtB: Team;
  queue: Team[];
  rotationMode: RotationMode;
  onSetRotationMode: (mode: RotationMode) => void;
  onBalanceTeams: () => void;
  onGenerate: (names: string[]) => void;
  onToggleFixed: (playerId: string) => void;
  onRemove: (id: string) => void; 
  onDeletePlayer?: (id: string) => void;
  onMove: (playerId: string, fromId: string, toId: string, newIndex?: number) => void;
  onUpdateTeamName: (teamId: string, name: string) => void;
  onUpdateTeamColor: (teamId: string, color: TeamColor) => void;
  onUpdateTeamLogo: (teamId: string, logo: string) => void; 
  
  onUpdatePlayer: (playerId: string, updates: Partial<Player>) => { success: boolean, error?: string, errorKey?: string, errorParams?: any } | void;

  onSaveProfile: (playerId: string, overrides?: { name?: string, number?: string, avatar?: string, skill?: number, role?: PlayerRole }) => { success: boolean, error?: string, errorKey?: string, errorParams?: any } | void;
  onRevertProfile: (playerId: string) => void;
  onAddPlayer: (name: string, target: 'A' | 'B' | 'Queue' | 'A_Reserves' | 'B_Reserves' | string, number?: string, skill?: number, profileId?: string) => { success: boolean, errorKey?: string, errorParams?: any, error?: string };
  onRestorePlayer?: (player: Player, targetId: string, index?: number) => void;
  onUndoRemove: () => void;
  canUndoRemove: boolean;
  onCommitDeletions: () => void;
  deletedCount: number;
  profiles: Map<string, PlayerProfile>;
  deleteProfile?: (id: string) => PlayerProfile | undefined;
  upsertProfile?: (name: string, skill: number, id?: string, extras?: { number?: string, avatar?: string, role?: PlayerRole }) => PlayerProfile;
  relinkProfile?: (profile: PlayerProfile) => void; 
  onSortTeam: (teamId: string, criteria: 'name' | 'number' | 'skill') => void; 
  toggleTeamBench: (teamId: string) => void;
  substitutePlayers: (teamId: string, playerInId: string, playerOutId: string) => void;
  matchLog?: ActionLog[];
  enablePlayerStats?: boolean;
  reorderQueue?: (fromIndex: number, toIndex: number) => void;
  disbandTeam?: (teamId: string) => void;
  restoreTeam?: (team: Team, index: number) => void;
  resetRosters?: () => void;
  
  onShowToast: (msg: string, type: 'success' | 'info' | 'error', subText?: string, icon?: any, onUndo?: () => void) => void;
  
  developerMode?: boolean;
  zIndex?: string; // New prop for layering
}

type PlayerLocationStatus = 'A' | 'B' | 'Queue' | 'A_Bench' | 'B_Bench' | 'Queue_Bench' | null;

interface PlacementOption {
    label: string;
    targetId: string;
    type: 'main' | 'bench' | 'queue';
    teamColor?: string;
}

interface PlayerStats {
    k: number;
    b: number;
    a: number;
}

type EditingTarget = { type: 'player' | 'profile'; id: string };

const SCROLL_EVENT = 'team-manager-scroll';
const dispatchScrollEvent = () => { if (typeof window !== 'undefined') window.dispatchEvent(new Event(SCROLL_EVENT)); };

const ColorPicker = memo(({ selected, onChange, usedColors }: { selected: TeamColor, onChange: (c: TeamColor) => void, usedColors: Set<string> }) => {
    const sortedPalette = useMemo(() => {
        return [...COLOR_KEYS].sort((a, b) => {
            if (a === selected) return -1;
            if (b === selected) return 1;
            const isUsedA = usedColors.has(a);
            const isUsedB = usedColors.has(b);
            if (isUsedA && !isUsedB) return 1;
            if (!isUsedA && isUsedB) return -1;
            return a.localeCompare(b);
        });
    }, [selected, usedColors]);

    return (
        <div className="w-full relative z-20 py-2 min-h-[56px] landscape:min-h-[44px] landscape:py-1">
            <div 
                className="w-full overflow-x-auto overflow-y-visible no-scrollbar touch-pan-x flex items-center px-1" 
                onPointerDown={(e) => e.stopPropagation()} 
                style={{ overscrollBehaviorX: 'contain' }}
            >
                <div className="flex items-center gap-3 w-max pr-6 p-2"> 
                    {sortedPalette.map(color => {
                         const isSelected = selected === color;
                         const isTaken = usedColors.has(color) && !isSelected;
                         const hex = getHexFromColor(color);
                         
                         return (
                             <button
                                key={color} 
                                onClick={(e) => { 
                                    e.stopPropagation(); 
                                    if (!isTaken) onChange(color); 
                                }} 
                                onPointerDown={(e) => e.stopPropagation()} 
                                disabled={isTaken}
                                className={`
                                    relative w-9 h-9 landscape:w-7 landscape:h-7 rounded-full shrink-0
                                    flex items-center justify-center
                                    transition-all duration-300 ease-out
                                    border border-white/30 dark:border-white/10
                                    shadow-inner
                                    bg-gradient-to-br from-white/40 via-transparent to-black/20
                                    ${isSelected 
                                        ? `scale-110 z-10 ring-2 ring-offset-2 ring-offset-slate-100 dark:ring-offset-slate-900 ring-slate-400 dark:ring-white shadow-lg shadow-current/30` 
                                        : (isTaken ? 'opacity-30 grayscale scale-75 cursor-not-allowed' : 'hover:scale-105 hover:brightness-110 shadow-sm')
                                    }
                                `}
                                style={{ 
                                    backgroundColor: hex,
                                    color: hex 
                                }}
                                aria-label={`Select color ${color}`}
                             >
                                {isSelected && (
                                    <motion.div 
                                        layoutId="selected-color-check" 
                                        className="absolute inset-0 flex items-center justify-center"
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                    >
                                        <Check size={14} className="text-white drop-shadow-md" strokeWidth={3} />
                                    </motion.div>
                                )}
                                {isTaken && (
                                    <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40">
                                        <Lock size={12} className="text-white opacity-90" />
                                    </div>
                                )}
                             </button>
                         );
                    })}
                </div>
            </div>
        </div>
    );
});

// SUB COMPONENTS RE-INSERTED
const EditableTitle = memo(({ name, onSave, className, isPlayer }: { name: string; onSave: (val: string) => void; className?: string; isPlayer?: boolean }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [val, setVal] = useState(name);
  const inputRef = React.useRef<HTMLInputElement>(null);
  useEffect(() => { setVal(name); }, [name]);
  useEffect(() => { if(isEditing) inputRef.current?.focus(); }, [isEditing]);
  const save = () => { setIsEditing(false); if(val.trim() && val !== name) onSave(val.trim()); else setVal(name); };
  if(isEditing) return <input ref={inputRef} type="text" className={`bg-transparent text-slate-900 dark:text-white border-b-2 border-indigo-500 outline-none w-full px-0 py-1 font-bold placeholder-slate-400 ${isPlayer ? 'text-sm' : 'text-xl uppercase tracking-tight'}`} value={val} onChange={e => setVal(e.target.value)} onBlur={save} onKeyDown={e => { if(e.key === 'Enter') save(); if(e.key === 'Escape') setIsEditing(false); }} onPointerDown={e => e.stopPropagation()} />;
  return <div className={`flex items-center gap-2 group cursor-pointer min-w-0 ${className}`} onClick={() => setIsEditing(true)}><span className="truncate text-slate-900 dark:text-white">{name}</span><Edit2 size={12} className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 flex-shrink-0" /></div>;
});

const TeamLogoUploader = memo(({ currentLogo, onUpdate, teamName }: { currentLogo?: string, onUpdate: (logo: string) => void, teamName: string }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (file) { const reader = new FileReader(); reader.onloadend = () => { if (typeof reader.result === 'string') { onUpdate(reader.result); } }; reader.readAsDataURL(file); } };
    const triggerUpload = () => fileInputRef.current?.click();
    return <div className="relative group flex-shrink-0"><button onClick={triggerUpload} className="w-10 h-10 landscape:w-8 landscape:h-8 rounded-full border-2 border-white dark:border-white/10 bg-slate-100 dark:bg-white/5 flex items-center justify-center overflow-hidden hover:opacity-90 transition-opacity shadow-sm" title={`Change ${teamName} Logo`}>{currentLogo ? <img src={currentLogo} alt={teamName} className="w-full h-full object-cover" /> : <ImageIcon size={16} className="text-slate-400 dark:text-slate-500" />}<div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]"><Edit2 size={12} className="text-white" /></div></button><input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} /></div>;
});

const AddPlayerInput = memo(({ onAdd, disabled, customLabel }: { onAdd: (name: string, number?: string, skill?: number) => void; disabled?: boolean; customLabel?: string }) => {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [name, setName] = useState('');
    const [number, setNumber] = useState('');
    const [skill, setSkill] = useState(5);
    const inputRef = React.useRef<HTMLInputElement>(null);
    const containerRef = React.useRef<HTMLDivElement>(null);
    useEffect(() => { if(isOpen) { setTimeout(() => inputRef.current?.focus(), 50); } }, [isOpen]);
    useEffect(() => { if (!isOpen) return; const handleClickOutside = (event: MouseEvent | TouchEvent) => { if (containerRef.current && !containerRef.current.contains(event.target as Node)) { setIsOpen(false); } }; const handleScroll = () => { if (isOpen) setIsOpen(false); }; document.addEventListener('mousedown', handleClickOutside); document.addEventListener('touchstart', handleClickOutside); window.addEventListener(SCROLL_EVENT, handleScroll); window.addEventListener('scroll', handleScroll, { capture: true }); return () => { document.removeEventListener('mousedown', handleClickOutside); document.removeEventListener('touchstart', handleClickOutside); window.removeEventListener(SCROLL_EVENT, handleScroll); window.removeEventListener('scroll', handleScroll, { capture: true }); }; }, [isOpen]);
    const submit = () => { if(name.trim()) { onAdd(name.trim(), number.trim() || undefined, skill); setName(''); setNumber(''); setSkill(5); } inputRef.current?.focus(); };
    if (isOpen && !disabled) { return <div ref={containerRef} className="flex flex-col mt-4 animate-in fade-in slide-in-from-top-1 bg-white dark:bg-white/[0.08] p-4 rounded-2xl border border-indigo-500/30 shadow-xl ring-1 ring-indigo-500/20 backdrop-blur-md"><input ref={inputRef} autoFocus className="w-full bg-transparent border-b border-slate-200 dark:border-white/10 px-2 py-3 text-sm text-slate-900 dark:text-white focus:outline-none font-bold placeholder:text-slate-400 mb-4" placeholder={t('teamManager.addPlayerPlaceholder')} value={name} onChange={e => setName(e.target.value)} onKeyDown={e => { if(e.key === 'Enter') submit(); if(e.key === 'Escape') setIsOpen(false); }} /><div className="flex items-center gap-3"><input type="tel" className="w-16 text-center bg-slate-100 dark:bg-black/20 rounded-xl border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-black/40 px-1 py-3 text-xs font-black text-slate-800 dark:text-slate-200 outline-none transition-all placeholder:text-slate-400" placeholder="#" value={number} onChange={e => setNumber(e.target.value)} maxLength={3} /><div className="flex-1 flex items-center justify-center bg-slate-100 dark:bg-white/5 rounded-xl px-2 py-2"><SkillSlider level={skill} onChange={setSkill} /></div><button onClick={submit} className="p-3 bg-indigo-500 rounded-xl hover:bg-indigo-400 text-white shadow-lg shadow-indigo-500/30 active:scale-95 transition-all"><Plus size={20} /></button></div></div>; }
    const labelContent = customLabel || t('common.add');
    const isBenchLabel = customLabel?.toLowerCase().includes('bench') || customLabel?.toLowerCase().includes('reserve') || customLabel?.toLowerCase().includes('banco');
    return <button onClick={() => !disabled && setIsOpen(true)} disabled={disabled} className={`mt-2 w-full py-3 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest rounded-2xl border border-dashed transition-all group active:scale-95 ${disabled ? 'border-slate-200 dark:border-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed' : 'border-slate-300 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10'}`} >{disabled ? <><Ban size={14} /> {t('common.full')}</> : <>{isBenchLabel ? <Armchair size={14} className="text-emerald-500 group-hover:scale-110 transition-transform" /> : <Plus size={14} className="group-hover:scale-110 transition-transform" />} {labelContent}</>}</button>;
});

const ProfileCard = memo(({ profile, onDelete, onAddToGame, status, onEdit, placementOptions, onView, teamColor, onShowToast }: any) => {
    const { t } = useTranslation();
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    useEffect(() => { const handleClickOutside = (event: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(event.target as Node)) { setShowMenu(false); } }; if (showMenu) document.addEventListener('mousedown', handleClickOutside); return () => document.removeEventListener('mousedown', handleClickOutside); }, [showMenu]);
    const statusLabel = status ? (status.includes('Queue') ? t('teamManager.queue') : (status.includes('A') ? t('teamManager.location.courtA') : t('teamManager.location.courtB'))) : null;
    const statusColor = status ? (status.includes('A') ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300' : (status.includes('B') ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300' : 'bg-slate-100 text-slate-600')) : '';
    return (
        <div className={`relative flex flex-col p-3 rounded-2xl border transition-all ${status ? 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/5 opacity-70' : 'bg-white dark:bg-white/10 border-black/5 dark:border-white/10 shadow-sm hover:shadow-md hover:border-indigo-500/30'}`}>
            <div className="flex items-center gap-3">
                <div className="relative"><div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/10 flex items-center justify-center text-lg shadow-inner border border-black/5 dark:border-white/5">{profile.avatar || '👤'}</div>{status && (<div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-800" />)}</div>
                <div className="flex-1 min-w-0"><div className="flex items-center justify-between"><span className="text-sm font-bold text-slate-800 dark:text-white truncate">{profile.name}</span>{profile.number && <span className="text-[10px] font-black bg-slate-100 dark:bg-white/10 px-1.5 py-0.5 rounded text-slate-500 dark:text-slate-400">{profile.number}</span>}</div><div className="flex items-center gap-2 mt-0.5"><span className="text-[10px] font-medium text-slate-400">Lvl {profile.skillLevel}</span>{status && <span className={`text-[9px] font-bold uppercase px-1.5 rounded ${statusColor}`}>{statusLabel}</span>}</div></div>
                <div className="relative" ref={menuRef}><button onClick={() => setShowMenu(!showMenu)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-slate-600 transition-colors"><MoreVertical size={16} /></button><AnimatePresence>{showMenu && (<motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="absolute right-0 top-full mt-1 z-50 min-w-[160px] bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-black/5 dark:border-white/10 overflow-hidden p-1"><button onClick={() => { onView(); setShowMenu(false); }} className="w-full text-left px-3 py-2 text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 rounded-lg flex items-center gap-2"><User size={14} /> {t('common.view')}</button><button onClick={() => { onEdit(); setShowMenu(false); }} className="w-full text-left px-3 py-2 text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 rounded-lg flex items-center gap-2"><Edit2 size={14} /> {t('common.edit')}</button>{!status && placementOptions.length > 0 && (<><div className="h-px bg-slate-100 dark:bg-white/5 my-1" />{placementOptions.map((opt: any, idx: number) => (<button key={idx} onClick={() => { onAddToGame(opt.targetId, profile); setShowMenu(false); }} className="w-full text-left px-3 py-2 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg flex items-center gap-2"><Plus size={14} /> {opt.label}</button>))}</>)}<div className="h-px bg-slate-100 dark:bg-white/5 my-1" /><button onClick={() => { onDelete(); setShowMenu(false); }} className="w-full text-left px-3 py-2 text-[10px] font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg flex items-center gap-2"><Trash2 size={14} /> {t('common.delete')}</button></motion.div>)}</AnimatePresence></div>
            </div>
        </div>
    );
});

const BatchInputSection = ({ onGenerate }: { onGenerate: (names: string[]) => void }) => {
    const { t } = useTranslation();
    const [input, setInput] = useState('');
    const handleGenerate = () => { if (!input.trim()) return; const rawLines = input.split(/\r?\n|,\s*/); const names = rawLines.map(n => n.trim()).filter(n => n.length > 0); onGenerate(names); setInput(''); };
    return (
        <div className="flex flex-col h-full w-full"><div className="flex-1 overflow-y-auto custom-scrollbar p-4 pb-0"><div className="bg-slate-100 dark:bg-white/5 p-4 rounded-2xl mb-4 border border-black/5 dark:border-white/5"><div className="flex items-start gap-3 mb-3"><div className="p-2 bg-indigo-500/10 rounded-full text-indigo-500 shrink-0"><Info size={18} /></div><div><h4 className="text-sm font-bold text-slate-800 dark:text-white mb-1">{t('teamManager.batch.title')}</h4><p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{t('teamManager.batch.desc')}</p></div></div><div className="space-y-2 pl-2"><div className="flex items-center gap-2 text-[10px] text-slate-600 dark:text-slate-300"><span className="font-mono bg-white dark:bg-black/20 px-2 py-1 rounded border border-black/5 dark:border-white/10">Lucas</span><span className="opacity-50 text-[9px] uppercase tracking-wide">Nome</span></div><div className="flex items-center gap-2 text-[10px] text-slate-600 dark:text-slate-300"><span className="font-mono bg-white dark:bg-black/20 px-2 py-1 rounded border border-black/5 dark:border-white/10">10 Pedro</span><span className="opacity-50 text-[9px] uppercase tracking-wide"># + Nome</span></div></div></div><textarea className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 resize-none custom-scrollbar shadow-inner font-mono leading-relaxed placeholder:text-slate-400/50 flex-1 min-h-[200px]" placeholder={t('teamManager.batch.placeholder')} value={input} onChange={e => setInput(e.target.value)} /></div><div className="flex-shrink-0 p-10 pt-4 bg-transparent z-10 relative"><Button onClick={handleGenerate} disabled={!input.trim()} className="w-full bg-indigo-600 text-white shadow-xl shadow-indigo-500/30 py-4 rounded-2xl h-14 ring-1 ring-white/20 active:scale-[0.98] transition-all"><ListOrdered size={18} className="mr-2" strokeWidth={2.5} /> {t('teamManager.batch.generate')}</Button></div></div>
    );
};

const TeamColumn = memo(({ id, team, profiles, onUpdateTeamName, onUpdateTeamColor, onUpdateTeamLogo, onUpdatePlayer, onSaveProfile, onAddPlayer, onKnockoutRequest, usedColors, isQueue = false, onMove, toggleTeamBench, substitutePlayers, statsMap, onRequestProfileEdit, onViewProfile, onTogglePlayerMenu, activePlayerMenuId, isNext = false, onDisband, onReorder, queueIndex, queueSize, isDragOver, onShowToast, activeNumberId, onRequestEditNumber, highlighted }: any) => {
  const { t } = useTranslation();
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [viewMode, setViewMode] = useState<'main' | 'reserves'>('main'); 
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ criteria: 'name' | 'number' | 'skill' | 'original', direction: 'asc' | 'desc' }>({ criteria: 'original', direction: 'asc' });
  const colorConfig = resolveTheme(team.color);
  const listId = viewMode === 'main' ? id : `${id}_Reserves`;
  const { setNodeRef: droppableRef } = useDroppable({ id: listId, data: { type: 'container', containerId: listId } });
  useEffect(() => { if (!team.hasActiveBench && viewMode === 'reserves') setViewMode('main'); }, [team.hasActiveBench]);
  const rawPlayers = viewMode === 'main' ? team.players : (team.reserves || []);
  const displayedPlayers = useMemo(() => { let sorted = [...rawPlayers]; if (sortConfig.criteria === 'original') { return sorted.sort((a, b) => (a.originalIndex ?? 0) - (b.originalIndex ?? 0)); } sorted.sort((a, b) => { let valA: any = a[sortConfig.criteria as keyof Player] || ''; let valB: any = b[sortConfig.criteria as keyof Player] || ''; if (sortConfig.criteria === 'skill') { valA = a.skillLevel; valB = b.skillLevel; } if (sortConfig.criteria === 'number') { valA = parseInt(a.number || '0'); valB = parseInt(b.number || '0'); } if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1; if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1; return 0; }); return sorted; }, [rawPlayers, sortConfig]);
  const mainRosterFull = team.players.length >= 6;
  const reservesFull = (team.reserves || []).length >= 6;
  const isFull = viewMode === 'main' ? (mainRosterFull && reservesFull) : reservesFull; 
  const handleUpdateName = useCallback((n: string) => onUpdateTeamName(id, n), [onUpdateTeamName, id]);
  const handleUpdateColor = useCallback((c: TeamColor) => onUpdateTeamColor(id, c), [onUpdateTeamColor, id]);
  const handleUpdateLogo = useCallback((l: string) => onUpdateTeamLogo(id, l), [onUpdateTeamLogo, id]);
  const toggleView = () => setViewMode(prev => prev === 'main' ? 'reserves' : 'main');
  const handleAdd = useCallback((n: string, num?: string, s?: number, pId?: string) => { const result = onAddPlayer(n, viewMode === 'main' ? id : `${id}_Reserves`, num, s, pId); if (!result.success) { onShowToast( result.errorKey ? t(result.errorKey, result.errorParams) : (result.error || t('notifications.cannotAdd')), 'error', t('notifications.uniqueConstraint') ); } }, [onAddPlayer, id, viewMode, onShowToast, t]);
  const handleSubstitution = (pIn: string, pOut: string) => { substitutePlayers(id, pIn, pOut); };
  const applySort = (criteria: any) => { setSortConfig(prev => ({ criteria, direction: prev.criteria === criteria && prev.direction === 'asc' ? 'desc' : 'asc' })); setShowSortMenu(false); };
  const bgClass = viewMode === 'reserves' ? 'bg-slate-100/80 dark:bg-white/[0.02] border-dashed border-slate-300 dark:border-white/10' : `bg-white/95 dark:bg-[#0f172a]/90 bg-gradient-to-b ${colorConfig.gradient} ${isQueue ? '' : 'border-slate-200 dark:border-white/5'} shadow-xl shadow-black/5 dark:shadow-black/20`;
  let addButtonLabel = viewMode === 'reserves' ? t('teamManager.benchLabel') : (mainRosterFull ? t('teamManager.benchLabel') : t('common.add'));
  const teamStrength = calculateTeamStrength(team.players);
  let ringColor = "", dropBg = "";
  if (isDragOver) { if (!isQueue) { const currentCount = rawPlayers.length; if (currentCount >= 6) { if (viewMode === 'main' && team.hasActiveBench && (team.reserves || []).length < 6) { ringColor = "ring-amber-400"; dropBg = "bg-amber-400/10"; } else { ringColor = "ring-rose-500"; dropBg = "bg-rose-500/10"; } } else { ringColor = "ring-emerald-400"; dropBg = "bg-emerald-400/10"; } } else { ringColor = "ring-indigo-400"; dropBg = "bg-indigo-400/10"; } }
  const finalRing = ringColor || colorConfig.ring;
  let queueBadge = null;
  if (isQueue && typeof queueIndex === 'number') { const pos = queueIndex + 1; let badgeColor = 'bg-slate-200 text-slate-600 dark:bg-white/10 dark:text-slate-300'; let icon = <ListOrdered size={12} strokeWidth={3} />; let text = `${pos}º`; if (pos === 1) { badgeColor = 'bg-amber-500 text-amber-950 shadow-lg shadow-amber-500/20'; icon = <ArrowUpCircle size={14} strokeWidth={3} />; text = "NEXT UP"; } else if (pos === 2) { badgeColor = 'bg-slate-400 text-white shadow-sm'; text = "2º"; } else if (pos === 3) { text = "3º"; } queueBadge = <div className={`absolute -top-4 right-6 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest z-10 flex items-center gap-1.5 shadow-md border border-white/50 dark:border-white/20 ${badgeColor}`}>{icon} {text}</div>; }
  const containerBorder = isQueue ? 'border-transparent' : 'border';
  const containerClass = `flex flex-col w-full h-auto min-h-[300px] rounded-2xl ${containerBorder} relative transition-transform transition-colors duration-300 p-4 sm:p-6 landscape:p-2 ${bgClass} ${isDragOver ? `ring-4 ${finalRing} ring-opacity-50 scale-[1.01] ${dropBg} z-20` : (isQueue ? '' : 'hover:border-slate-300 dark:hover:border-white/20')} ${(isQueue && queueIndex === 0) ? 'ring-2 ring-amber-500/50 dark:ring-amber-500/40 ring-offset-2 ring-offset-slate-100 dark:ring-offset-slate-900 shadow-2xl shadow-amber-500/10' : ''} ${highlighted ? 'ring-4 ring-indigo-500/50 scale-[1.02] shadow-2xl z-30' : ''}`;
  const SortMenuDropdown = () => (<AnimatePresence>{showSortMenu && (<motion.div initial={{ opacity: 0, y: 8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.95 }} className="absolute right-0 top-full mt-2 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-xl shadow-2xl border border-black/5 dark:border-white/10 p-1 flex flex-col min-w-[140px]"><span className="text-[9px] font-bold text-slate-400 px-3 py-1 uppercase tracking-widest text-left">{t('teamManager.sort.label')}</span><button onClick={() => applySort('name')} className="flex items-center justify-start px-2 py-2 text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg text-left w-full active:scale-95 transition-transform"><div className="flex items-center gap-2 flex-1"><ArrowDownAZ size={12} className="flex-shrink-0 opacity-60" /> <span>{t('teamManager.sort.name')}</span></div></button><button onClick={() => applySort('number')} className="flex items-center justify-start px-2 py-2 text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg text-left w-full active:scale-95 transition-transform"><div className="flex items-center gap-2 flex-1"><ArrowDown01 size={12} className="flex-shrink-0 opacity-60" /> <span>{t('teamManager.sort.number')}</span></div></button><button onClick={() => applySort('skill')} className="flex items-center justify-start px-2 py-2 text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg text-left w-full active:scale-95 transition-transform"><div className="flex items-center gap-2 flex-1"><ArrowUpWideNarrow size={12} className="flex-shrink-0 opacity-60" /> <span>{t('teamManager.sort.skill')}</span></div></button><div className="h-px bg-black/5 dark:bg-white/5 my-1" /><button onClick={() => applySort('original')} className="flex items-center gap-2 px-2 py-2 text-[10px] font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg text-left w-full active:scale-95 transition-transform"><RefreshCcw size={12} className="flex-shrink-0 opacity-60" /> {t('teamManager.sort.reset')}</button></motion.div>)}</AnimatePresence>);

  return (
    <div ref={droppableRef} className={containerClass}>
      {queueBadge}
      <SubstitutionModal isOpen={isSubModalOpen} onClose={() => setIsSubModalOpen(false)} team={team} onConfirm={handleSubstitution} />
      
      {isQueue ? (
          <div className="flex flex-col mb-2 w-full">
              <div className="flex items-center gap-3 mb-2 w-full">
                  <TeamLogoUploader currentLogo={team.logo} onUpdate={handleUpdateLogo} teamName={team.name} />
                  <div className="flex-1 min-w-0"><EditableTitle name={team.name} onSave={handleUpdateName} className="text-lg font-black uppercase tracking-tight text-slate-800 dark:text-slate-200 drop-shadow-sm w-full" /></div>
                  <div className="flex gap-1.5 flex-wrap"><div className={`px-2 py-0.5 rounded-md text-[9px] font-bold border flex items-center gap-1 shadow-sm text-white bg-slate-500 border-slate-600`} title="Players"><Users size={10} strokeWidth={2.5} /> {displayedPlayers.length}</div><div className={`px-2 py-0.5 rounded-md text-[9px] font-bold border flex items-center gap-1 shadow-sm bg-slate-200 dark:bg-white/10 border-slate-300 dark:border-white/5 text-slate-700 dark:text-slate-200`} title="Avg Team Skill"><Activity size={10} strokeWidth={2.5} /> {teamStrength}</div></div>
              </div>
              {viewMode === 'main' && <ColorPicker selected={team.color || 'slate'} onChange={handleUpdateColor} usedColors={usedColors} />}
              <div className="flex items-center justify-between border-t border-slate-200 dark:border-white/5 pt-2 mt-1">
                  <div className="flex items-center gap-1">{onReorder && (<>{queueIndex > 0 && (<button onClick={(e) => { e.stopPropagation(); onReorder(queueIndex, 0); }} className={`p-1.5 rounded-lg transition-colors bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 dark:text-amber-400 active:scale-95`} title={t('teamManager.queueActions.moveToTop')}><ChevronsUp size={14} strokeWidth={2.5} /></button>)}{queueIndex > 1 && (<button onClick={(e) => { e.stopPropagation(); onReorder(queueIndex, queueIndex - 1); }} className="p-1.5 rounded-lg bg-slate-100 dark:bg-white/10 text-slate-600 hover:bg-slate-200 transition-colors active:scale-95" title={t('teamManager.queueActions.moveUp')}><ChevronUp size={14} /></button>)}{queueIndex < queueSize - 1 && (<button onClick={(e) => { e.stopPropagation(); onReorder(queueIndex, queueIndex + 1); }} className="p-1.5 rounded-lg bg-slate-100 dark:bg-white/10 text-slate-600 hover:bg-slate-200 transition-colors active:scale-95" title={t('teamManager.queueActions.moveDown')}><ChevronDown size={14} /></button>)}</>)}</div>
                  <div className="flex items-center gap-1"><button onClick={(e) => { e.stopPropagation(); toggleTeamBench(id); }} onPointerDown={(e) => e.stopPropagation()} className={`p-1.5 rounded-lg border border-transparent transition-all active:scale-95 ${team.hasActiveBench ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/20' : 'bg-slate-100 dark:bg-white/10 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`} title={team.hasActiveBench ? t('teamManager.benchLabel') : t('teamManager.activateBenchTitle')}><Armchair size={14} fill={team.hasActiveBench ? 'currentColor' : 'none'} /></button><div className="relative"><button onClick={(e) => { e.stopPropagation(); setShowSortMenu(!showSortMenu); }} className={`p-1.5 rounded-lg border border-transparent hover:bg-slate-100 dark:hover:bg-white/10 transition-colors active:scale-95 ${showSortMenu ? 'bg-slate-100 dark:bg-white/10' : 'bg-slate-100 dark:bg-white/10 text-slate-500'}`} title={t('teamManager.sort.label')}><ListFilter size={14} /></button><SortMenuDropdown /></div>{onDisband && (<button onClick={() => onDisband(id)} className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-500 hover:bg-rose-100 transition-colors ml-1 active:scale-95" title={t('teamManager.queueActions.disband')}><Trash2 size={14} /></button>)}</div>
              </div>
          </div>
      ) : (
        <div className="flex flex-col mb-2 w-full">
            <div className="flex items-center gap-3 mb-2 w-full">
                <TeamLogoUploader currentLogo={team.logo} onUpdate={handleUpdateLogo} teamName={team.name} />
                <div className="flex-1 min-w-0"><EditableTitle name={team.name} onSave={handleUpdateName} className={`text-lg landscape:text-base font-black uppercase tracking-tight ${colorConfig.text} ${colorConfig.textDark} drop-shadow-sm w-full`} /></div>
                <div className="flex gap-1.5 flex-wrap"><div className={`px-2 py-0.5 rounded-md text-[9px] font-bold border flex items-center gap-1 shadow-sm text-white ${colorConfig.bg} ${colorConfig.border}`}><Users size={10} strokeWidth={2.5} /> {displayedPlayers.length}</div><div className={`px-2 py-0.5 rounded-md text-[9px] font-bold border flex items-center gap-1 shadow-sm ${colorConfig.bg.replace('/20', '/40')} ${colorConfig.border} dark:text-white dark:border-white/20 text-slate-700`} title="Avg Team Skill"><Activity size={10} strokeWidth={2.5} /> {teamStrength}</div></div>
            </div>
            <div className="flex items-center justify-end gap-2 border-b border-slate-200 dark:border-white/5 pb-2 mb-2 w-full"><button onClick={(e) => { e.stopPropagation(); toggleTeamBench(id); }} onPointerDown={(e) => e.stopPropagation()} className={`p-1.5 rounded-lg border border-transparent transition-all active:scale-95 ${team.hasActiveBench ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/20' : 'bg-slate-100 dark:bg-white/10 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`} title={team.hasActiveBench ? "Deactivate Bench" : "Activate Bench (Reserves)"}><Armchair size={14} fill={team.hasActiveBench ? 'currentColor' : 'none'} /></button><div className="relative"><button onClick={() => setShowSortMenu(!showSortMenu)} className={`p-1.5 rounded-lg border border-transparent hover:bg-slate-100 dark:hover:bg-white/10 transition-colors active:scale-95 ${showSortMenu ? 'bg-slate-100 dark:bg-white/10' : ''}`}><ListFilter size={14} className={`${colorConfig.text}`} /></button><SortMenuDropdown /></div></div>
            {viewMode === 'main' && <ColorPicker selected={team.color || 'slate'} onChange={handleUpdateColor} usedColors={usedColors} />}
        </div>
      )}
      {team.hasActiveBench && (<div className="flex justify-end mb-2 gap-2 px-1"><button onClick={() => setIsSubModalOpen(true)} className={`flex items-center justify-center p-2 rounded-xl text-[9px] font-bold uppercase tracking-wider transition-all bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-slate-500 hover:text-indigo-500 shadow-sm active:scale-95`} title="Substitute Player"><ArrowRightLeft size={16} /></button><button onClick={toggleView} className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[9px] font-bold uppercase tracking-wider transition-all active:scale-95 ${viewMode === 'reserves' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'bg-slate-100 dark:bg-white/5 text-slate-500 hover:bg-slate-200 dark:hover:bg-white/10'}`}>{viewMode === 'reserves' ? <ChevronLeft size={14} /> : null}{viewMode === 'reserves' ? t('common.back') : t('teamManager.benchLabel')}{viewMode === 'main' ? <ChevronRight size={14} /> : null}</button></div>)}
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className={`space-y-2 mt-1 px-0`} onScroll={dispatchScrollEvent}>
        {displayedPlayers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 opacity-60 border border-dashed border-slate-200 dark:border-white/5 rounded-xl bg-slate-50/50 dark:bg-white/[0.01]"><div className="p-2 bg-slate-100 dark:bg-white/5 rounded-full mb-2"><UserPlus size={20} className="text-slate-400" /></div><span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{viewMode === 'reserves' ? t('common.empty') : t('teamManager.dragPlayersHere')}</span></div>
        ) : (
            <SortableContextFixed items={displayedPlayers.map(p => p.id)} strategy={verticalListSortingStrategy}><AnimatePresence initial={false}>{displayedPlayers.map(p => (<motion.div key={p.id} variants={staggerItem} layout><PlayerCard player={p} locationId={listId} profile={p.profileId ? profiles.get(p.profileId) : undefined} onUpdatePlayer={onUpdatePlayer} onSaveProfile={onSaveProfile} onRequestProfileEdit={(pid) => onRequestProfileEdit(pid)} onViewProfile={(pid) => onViewProfile(pid)} isCompact={viewMode === 'reserves' || (window.innerWidth < 640 && !isQueue)} onToggleMenu={onTogglePlayerMenu} isMenuActive={activePlayerMenuId === p.id} onShowToast={onShowToast} activeNumberId={activeNumberId} onRequestEditNumber={onRequestEditNumber} /></motion.div>))}</AnimatePresence></SortableContextFixed>
        )}
      </motion.div>
      <AddPlayerInput onAdd={handleAdd} disabled={isFull} customLabel={addButtonLabel} />
    </div>
  );
}, (prev, next) => {
    // Memoization check kept same as previous code
    if (prev.isDragOver !== next.isDragOver) return false;
    if (prev.highlighted !== next.highlighted) return false;
    if (prev.queueIndex !== next.queueIndex) return false;
    if (prev.isQueue !== next.isQueue) return false;
    if (prev.isNext !== next.isNext) return false;
    if (prev.queueSize !== next.queueSize) return false;
    if (prev.activeNumberId !== next.activeNumberId) return false;
    if (prev.activePlayerMenuId !== next.activePlayerMenuId) return false;
    if (prev.team.id !== next.team.id) return false;
    if (prev.team.name !== next.team.name) return false;
    if (prev.team.color !== next.team.color) return false;
    if (prev.team.logo !== next.team.logo) return false;
    if (prev.team.hasActiveBench !== next.team.hasActiveBench) return false;
    if (prev.usedColors !== next.usedColors) { if (prev.usedColors.size !== next.usedColors.size) return false; for (const color of prev.usedColors) { if (!next.usedColors.has(color)) return false; } }
    if (prev.team.players.length !== next.team.players.length) return false;
    if ((prev.team.reserves?.length || 0) !== (next.team.reserves?.length || 0)) return false;
    if (prev.team.players !== next.team.players) return false;
    if (prev.team.reserves !== next.team.reserves) return false;
    return true;
});

const RosterBoard = ({ courtA, courtB, queue, onUpdatePlayer, wrappedAdd, handleKnockoutRequest, usedColors, wrappedMove, playerStatsMap, setEditingTarget, setViewingProfileId, handleTogglePlayerMenu, activePlayerMenu, toggleTeamBench, wrappedUpdateColor, wrappedUpdateLogo, substitutePlayers, reorderQueue, handleDisbandTeam, dragOverContainerId, onShowToast, profiles, wrappedSaveProfile, onRequestProfileEdit, activeNumberId, onRequestEditNumber, onUpdateTeamName }: any) => {
    const { t } = useTranslation();
    const [queueSearchTerm, setQueueSearchTerm] = useState('');
    const queueScrollRef = useRef<HTMLDivElement>(null);
    const [highlightedTeamId, setHighlightedTeamId] = useState<string | null>(null);
    const [isAutoScrolling, setIsAutoScrolling] = useState(false);
    const autoScrollDirection = useRef<'left' | 'right' | null>(null);
    const [queuePage, setQueuePage] = useState(1);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);
    const lastMovedTeamId = useRef<string | null>(null);
    const prevQueueLen = useRef(queue.length);
    const pendingScrollToIndex = useRef<number | null>(null);

    const handleReorderLocal = useCallback((from: number, to: number) => { if (reorderQueue) { const team = queue[from]; if (team) { lastMovedTeamId.current = team.id; } reorderQueue(from, to); pendingScrollToIndex.current = to; } }, [reorderQueue, queue]);

    useEffect(() => { if (!queueSearchTerm.trim()) { setHighlightedTeamId(null); return; } const searchTerm = queueSearchTerm.toLowerCase(); const matchIndex = queue.findIndex((t: Team) => t.name.toLowerCase().includes(searchTerm)); if (matchIndex !== -1) { const teamId = queue[matchIndex].id; setHighlightedTeamId(teamId); if (queueScrollRef.current) { const cardWidth = queueScrollRef.current.firstElementChild?.clientWidth || 300; const scrollPos = matchIndex * (cardWidth + 16); queueScrollRef.current.scrollTo({ left: scrollPos, behavior: 'smooth' }); } } else { setHighlightedTeamId(null); } }, [queueSearchTerm, queue]);

    const checkScroll = useCallback(() => { if (!queueScrollRef.current) return; const { scrollLeft, scrollWidth, clientWidth } = queueScrollRef.current; setCanScrollLeft(scrollLeft > 20); setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 20); const width = clientWidth; if (width > 0) { const page = Math.round(scrollLeft / width) + 1; setQueuePage(page); } dispatchScrollEvent(); }, []);
    const onQueueScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => { checkScroll(); }, [checkScroll]);

    useEffect(() => { checkScroll(); if (queue.length > 1 && queueScrollRef.current) { setTimeout(() => { if (queueScrollRef.current) { queueScrollRef.current.scrollTo({ left: 60, behavior: 'smooth' }); setTimeout(() => { if (queueScrollRef.current) { queueScrollRef.current.scrollTo({ left: 0, behavior: 'smooth' }); } }, 400); } }, 600); } }, [queue.length, checkScroll]);

    const scrollContainer = (direction: 'left' | 'right') => { if (queueScrollRef.current) { const width = 320; const scrollAmount = direction === 'left' ? -width : width; queueScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' }); } };

    useDndMonitor({ onDragStart: () => setIsAutoScrolling(true), onDragEnd: () => { setIsAutoScrolling(false); autoScrollDirection.current = null; }, onDragCancel: () => { setIsAutoScrolling(false); autoScrollDirection.current = null; } });
    useEffect(() => { if (!isAutoScrolling) return; const handleMouseMove = (e: MouseEvent | TouchEvent) => { if (!queueScrollRef.current) return; const rect = queueScrollRef.current.getBoundingClientRect(); const x = (e as MouseEvent).clientX || (e as TouchEvent).touches?.[0]?.clientX || 0; const EDGE_SIZE = 50; const y = (e as MouseEvent).clientY || (e as TouchEvent).touches?.[0]?.clientY || 0; if (y < rect.top || y > rect.bottom) { autoScrollDirection.current = null; return; } if (x < rect.left + EDGE_SIZE) { autoScrollDirection.current = 'left'; } else if (x > rect.right - EDGE_SIZE) { autoScrollDirection.current = 'right'; } else { autoScrollDirection.current = null; } }; window.addEventListener('mousemove', handleMouseMove); window.addEventListener('touchmove', handleMouseMove); const interval = setInterval(() => { if (autoScrollDirection.current && queueScrollRef.current) { const scrollAmount = 10; queueScrollRef.current.scrollBy({ left: autoScrollDirection.current === 'left' ? -scrollAmount : scrollAmount, behavior: 'auto' }); } }, 16); return () => { window.removeEventListener('mousemove', handleMouseMove); window.removeEventListener('touchmove', handleMouseMove); clearInterval(interval); }; }, [isAutoScrolling]);
    
    useEffect(() => { if (lastMovedTeamId.current) { const el = document.getElementById(`queue-card-${lastMovedTeamId.current}`); if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' }); lastMovedTeamId.current = null; pendingScrollToIndex.current = null; } } if (pendingScrollToIndex.current !== null && queueScrollRef.current && !lastMovedTeamId.current) { const targetIndex = pendingScrollToIndex.current; const width = queueScrollRef.current.clientWidth; if (width > 0) { requestAnimationFrame(() => { queueScrollRef.current?.scrollTo({ left: targetIndex * width, behavior: 'smooth' }); setQueuePage(targetIndex + 1); pendingScrollToIndex.current = null; }); } } else if (queue.length > prevQueueLen.current) { requestAnimationFrame(() => { setTimeout(() => { if (queueScrollRef.current) { const scrollLeft = queueScrollRef.current.scrollWidth - queueScrollRef.current.clientWidth; queueScrollRef.current.scrollTo({ left: scrollLeft > 0 ? scrollLeft : 0, behavior: 'smooth' }); checkScroll(); } }, 150); }); } prevQueueLen.current = queue.length; }, [queue.length, queue, checkScroll]);

    return (
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="flex flex-col gap-6 landscape:gap-4 pb-24 landscape:pb-8 px-0 w-full pt-2">
            <div className="flex flex-col gap-6 md:gap-4 w-full landscape:grid landscape:grid-cols-2 landscape:gap-4 landscape:overflow-visible flex-shrink-0">
                <motion.div variants={staggerItem} className="w-full flex-1"><TeamColumn id={courtA.id} team={courtA} onUpdatePlayer={onUpdatePlayer} onAddPlayer={wrappedAdd} onKnockoutRequest={handleKnockoutRequest} usedColors={usedColors} onMove={wrappedMove} statsMap={playerStatsMap} onRequestProfileEdit={(pid: string) => setEditingTarget({ type: 'player', id: pid })} onViewProfile={(pid: string) => setViewingProfileId(pid)} onTogglePlayerMenu={handleTogglePlayerMenu} activePlayerMenuId={activePlayerMenu?.playerId || null} profiles={profiles} onUpdateTeamName={onUpdateTeamName} onUpdateTeamColor={wrappedUpdateColor} onUpdateTeamLogo={wrappedUpdateLogo} onSaveProfile={wrappedSaveProfile} onSortTeam={()=>{}} toggleTeamBench={toggleTeamBench} substitutePlayers={substitutePlayers} isDragOver={dragOverContainerId === courtA.id || dragOverContainerId === `${courtA.id}_Reserves`} onShowToast={onShowToast} activeNumberId={activeNumberId} onRequestEditNumber={onRequestEditNumber} /></motion.div>
                <motion.div variants={staggerItem} className="w-full flex-1"><TeamColumn id={courtB.id} team={courtB} onUpdatePlayer={onUpdatePlayer} onAddPlayer={wrappedAdd} onKnockoutRequest={handleKnockoutRequest} usedColors={usedColors} onMove={wrappedMove} statsMap={playerStatsMap} onRequestProfileEdit={(pid: string) => setEditingTarget({ type: 'player', id: pid })} onViewProfile={(pid: string) => setViewingProfileId(pid)} onTogglePlayerMenu={handleTogglePlayerMenu} activePlayerMenuId={activePlayerMenu?.playerId || null} profiles={profiles} onUpdateTeamName={onUpdateTeamName} onUpdateTeamColor={wrappedUpdateColor} onUpdateTeamLogo={wrappedUpdateLogo} onSaveProfile={wrappedSaveProfile} onSortTeam={()=>{}} toggleTeamBench={toggleTeamBench} substitutePlayers={substitutePlayers} isDragOver={dragOverContainerId === courtB.id || dragOverContainerId === `${courtB.id}_Reserves`} onShowToast={onShowToast} activeNumberId={activeNumberId} onRequestEditNumber={onRequestEditNumber} /></motion.div>
            </div>
            
            <motion.div variants={staggerItem} className={`w-full flex flex-col mt-4 relative ${queue.length === 0 ? 'min-h-[200px]' : ''}`}>
                <div className="flex items-center justify-between px-2 mb-3">
                    <div className="flex items-center gap-2"><div className="px-3 py-1 bg-slate-200 dark:bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 flex items-center gap-2"><Layers size={12} /><span>{t('teamManager.queue')}</span><span className="bg-white dark:bg-black/20 px-1.5 rounded text-slate-600 dark:text-slate-300">{queue.length}</span></div>{queue.length > 1 && (<div className="px-3 py-1 rounded-full bg-transparent text-[9px] font-bold text-slate-400 border border-slate-200 dark:border-white/10">{t('common.step', {number: `${queuePage} / ${queue.length}`})}</div>)}</div>
                    <div className="relative group w-32"><Search className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" size={14} /><input value={queueSearchTerm} onChange={(e) => setQueueSearchTerm(e.target.value)} placeholder={t('teamManager.searchQueue')} className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-xl pl-8 pr-6 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-slate-400" />{queueSearchTerm && (<button onClick={() => setQueueSearchTerm('')} className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 active:scale-90 transition-transform"><X size={12} strokeWidth={3} /></button>)}</div>
                </div>

                <div className="relative group/queue flex-1 min-h-0">
                    <div ref={queueScrollRef} onScroll={onQueueScroll} className="w-full overflow-x-auto snap-x snap-mandatory no-scrollbar flex items-stretch pb-2 gap-6 p-6 mask-linear-fade-sides" style={{ maskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)' }}>
                        {queue.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center h-full text-slate-400 italic gap-3 min-h-[160px] w-full border border-dashed border-slate-200 dark:border-white/10 rounded-2xl bg-slate-50/50 dark:bg-white/[0.01]"><div className="p-3 bg-slate-100 dark:bg-white/5 rounded-full"><List size={24} className="opacity-30" /></div><div className="flex flex-col items-center gap-1"><span className="text-xs font-bold uppercase tracking-widest opacity-60">{t('teamManager.queueEmpty')}</span><span className="text-[10px] opacity-40">Add teams to rotation</span></div></div>
                        ) : (
                            <AnimatePresence initial={false} mode="popLayout">
                                {queue.map((team: Team, idx: number) => (
                                    <motion.div id={`queue-card-${team.id}`} key={team.id} layout="position" layoutId={`queue-card-${team.id}`} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }} transition={{ type: "spring", stiffness: 60, damping: 15, mass: 1 }} className="snap-center w-80 sm:w-96 flex-shrink-0 h-full flex flex-col"> 
                                        <TeamColumn id={team.id} team={team} profiles={profiles} onUpdateTeamName={onUpdateTeamName} onUpdateTeamColor={wrappedUpdateColor} onUpdateTeamLogo={wrappedUpdateLogo} onSaveProfile={wrappedSaveProfile} onSortTeam={()=>{}} toggleTeamBench={toggleTeamBench} substitutePlayers={()=>{}} onUpdatePlayer={onUpdatePlayer} onAddPlayer={wrappedAdd} onKnockoutRequest={handleKnockoutRequest} usedColors={usedColors} isQueue={true} onMove={wrappedMove} statsMap={playerStatsMap} onRequestProfileEdit={(pid: string) => setEditingTarget({ type: 'player', id: pid })} onViewProfile={(pid: string) => setViewingProfileId(pid)} onTogglePlayerMenu={handleTogglePlayerMenu} activePlayerMenuId={activePlayerMenu?.playerId || null} isNext={idx === 0} onDisband={handleDisbandTeam} onReorder={handleReorderLocal} queueIndex={idx} queueSize={queue.length} isDragOver={dragOverContainerId === team.id || dragOverContainerId === `${team.id}_Reserves`} onShowToast={onShowToast} activeNumberId={activeNumberId} onRequestEditNumber={onRequestEditNumber} highlighted={highlightedTeamId === team.id} />
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        )}
                    </div>
                    <AnimatePresence>{canScrollLeft && (<motion.button initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} onClick={() => scrollContainer('left')} className="absolute left-2 top-1/2 -translate-y-1/2 z-40 w-9 h-9 flex items-center justify-center rounded-full bg-black/20 dark:bg-white/10 backdrop-blur-md shadow-lg border border-white/10 text-white hover:bg-black/40 dark:hover:bg-white/20 hover:scale-110 transition-transform active:scale-90"><ChevronLeft size={18} strokeWidth={2.5} /></motion.button>)}{canScrollRight && (<motion.button initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} onClick={() => scrollContainer('right')} className="absolute right-2 top-1/2 -translate-y-1/2 z-40 w-9 h-9 flex items-center justify-center rounded-full bg-black/20 dark:bg-white/10 backdrop-blur-md shadow-lg border border-white/10 text-white hover:bg-black/40 dark:hover:bg-white/20 hover:scale-110 transition-transform active:scale-90"><ChevronRight size={18} strokeWidth={2.5} /></motion.button>)}</AnimatePresence>
                </div>
                <div className="pt-2 flex-shrink-0"><AddPlayerInput onAdd={(n, num, s) => wrappedAdd(n, 'Queue', num, s)} customLabel={t('teamManager.addPlayerQueue')} /></div>
            </motion.div>
        </motion.div>
    );
};

// --- NEW COMPONENT: Player Context Menu ---
const PlayerContextMenu = ({ 
    activePlayerMenu, 
    courtA, courtB, queue, 
    onToggleFixed, onRemove, toggleTeamBench, 
    onMove, handleTogglePlayerMenu, t,
    setActivateBenchConfirm
}: any) => {
    
    if (!activePlayerMenu) return null;

    // Find the player's current context
    let targetPlayer: Player | undefined;
    let targetTeam: Team | undefined;
    let locationType: 'Main' | 'Reserves' | null = null;

    const findContext = (team: Team, teamType: string) => {
        if (team.players.some(p => p.id === activePlayerMenu.playerId)) {
            targetPlayer = team.players.find(p => p.id === activePlayerMenu.playerId);
            targetTeam = team;
            locationType = 'Main';
            return true;
        }
        if (team.reserves && team.reserves.some(p => p.id === activePlayerMenu.playerId)) {
            targetPlayer = team.reserves.find(p => p.id === activePlayerMenu.playerId);
            targetTeam = team;
            locationType = 'Reserves';
            return true;
        }
        return false;
    };

    if (!findContext(courtA, 'A')) {
        if (!findContext(courtB, 'B')) {
            queue.forEach((t: Team) => findContext(t, 'Queue'));
        }
    }

    if (!targetPlayer || !targetTeam) return null;

    // Calculate position
    const { top, left, height, width } = activePlayerMenu.rect;
    const isRightSide = left > window.innerWidth / 2;
    const isBottomHalf = top > window.innerHeight / 2;

    const style: React.CSSProperties = {
        position: 'fixed',
        zIndex: 9999, // Above everything
        top: isBottomHalf ? 'auto' : top + height + 8,
        bottom: isBottomHalf ? window.innerHeight - top + 8 : 'auto',
        left: isRightSide ? 'auto' : left,
        right: isRightSide ? window.innerWidth - (left + width) : 'auto',
    };

    const handleAction = (action: () => void) => {
        action();
        handleTogglePlayerMenu(activePlayerMenu.playerId, null); // Close menu
    };
    
    const handleMoveToBench = () => {
        if (!targetTeam) return;
        if (targetTeam.hasActiveBench) {
            onMove(targetPlayer!.id, targetTeam!.id, `${targetTeam!.id}_Reserves`);
        } else {
            setActivateBenchConfirm({ 
                teamId: targetTeam.id, 
                playerId: targetPlayer!.id, 
                fromId: targetTeam.id 
            });
        }
    };

    const isCourtFull = targetTeam.players.length >= PLAYER_LIMIT_ON_COURT;

    return createPortal(
        <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            style={style}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-black/10 dark:border-white/10 p-1 min-w-[160px] flex flex-col gap-1 origin-top-left"
        >
            {/* Contextual Action: Move to Bench/Court */}
            {locationType === 'Main' && (
                <button 
                    onClick={() => handleAction(handleMoveToBench)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors text-left"
                >
                    <Armchair size={14} className="text-indigo-500" />
                    {t('teamManager.menu.sendBench')}
                </button>
            )}
            {locationType === 'Reserves' && (
                <button 
                    onClick={() => handleAction(() => {
                        onMove(targetPlayer!.id, `${targetTeam!.id}_Reserves`, targetTeam!.id);
                    })}
                    disabled={isCourtFull}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors text-left disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    <ArrowUp size={14} className="text-emerald-500" />
                    {t('teamManager.menu.returnCourt')}
                </button>
            )}

            <div className="h-px bg-black/5 dark:bg-white/5 my-0.5" />

            {/* Lock/Unlock */}
            <button 
                onClick={() => handleAction(() => onToggleFixed(targetPlayer!.id))}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors text-left"
            >
                {targetPlayer.isFixed ? <Unlock size={14} className="text-slate-400" /> : <Lock size={14} className="text-amber-500" />}
                {targetPlayer.isFixed ? t('teamManager.menu.unlock') : t('teamManager.menu.lock')}
            </button>

            <div className="h-px bg-black/5 dark:bg-white/5 my-0.5" />

            {/* Delete */}
            <button 
                onClick={() => handleAction(() => onRemove(targetPlayer!.id))}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors text-left"
            >
                <Trash2 size={14} />
                {t('teamManager.menu.delete')}
            </button>
        </motion.div>,
        document.body
    );
};

export const TeamManagerModal: React.FC<TeamManagerModalProps> = memo((props) => {
  const { t } = useTranslation();
  const { activeTutorial, triggerTutorial, completeTutorial, isLoaded } = useTutorial(false, props.developerMode);
  
  if (!props.isOpen) return null;

  useEffect(() => {
      if (isLoaded) {
          triggerTutorial('manager');
      }
  }, [isLoaded, triggerTutorial]);

  const [activeTab, setActiveTab] = useState<'roster' | 'profiles' | 'input'>('roster');
  // ... (State declarations remain same)
  const [activePlayer, setActivePlayer] = useState<Player | null>(null);
  const [activeNumberId, setActiveNumberId] = useState<string | null>(null);
  const validationLockRef = useRef<string | null>(null);
  const [benchConfirmState, setBenchConfirmState] = useState<{ teamId: string; playerId: string; sourceId: string } | null>(null);
  const [activateBenchConfirm, setActivateBenchConfirm] = useState<{ teamId: string; playerId: string; fromId: string } | null>(null);
  const [dropConfirmState, setDropConfirmState] = useState<{ playerId: string; sourceId: string; targetTeamId: string; index: number; } | null>(null);
  const [resetConfirmState, setResetConfirmState] = useState(false);
  const [profileToDeleteId, setProfileToDeleteId] = useState<string | null>(null);
  const [editingTarget, setEditingTarget] = useState<EditingTarget | null>(null);
  const [viewingProfileId, setViewingProfileId] = useState<string | null>(null);
  const [activePlayerMenu, setActivePlayerMenu] = useState<{ playerId: string; rect: DOMRect } | null>(null);
  const [dragOverContainerId, setDragOverContainerId] = useState<string | null>(null);
  const playerMenuRef = useRef<HTMLDivElement>(null);
  const haptics = useHaptics();
  const audio = useGameAudio({ enableSound: true } as any);
  const lastMoveRef = useRef<{ id: string, from: string, to: string, index: number, ts: number } | null>(null);
  
  // SCROLL HEADER LOGIC
  const [showHeader, setShowHeader] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);

  const onScroll = useCallback(() => {
      if (!scrollRef.current) return;
      const currentY = scrollRef.current.scrollTop;
      const diff = currentY - lastScrollY.current;

      // Bounce protection (iOS)
      if (currentY < 0) return;

      if (diff > 10 && showHeader && currentY > 50) { // Scroll Down & not at top
          setShowHeader(false);
      } else if (diff < -5 && !showHeader) { // Scroll Up
          setShowHeader(true);
      }
      lastScrollY.current = currentY;
      
      // Dispatch legacy event for internal components
      dispatchScrollEvent();
  }, [showHeader]);

  // ... (Other callbacks remain same)
  const { onUpdatePlayer, restoreTeam, onRestorePlayer, upsertProfile, deleteProfile, relinkProfile, onShowToast } = props;
  
  const findContainer = useCallback((id: string) => {
    if (id === 'A' || props.courtA.players.some(p => p.id === id)) return 'A';
    if (props.courtA.reserves?.some(p => p.id === id)) return 'A_Reserves';
    if (id === 'B' || props.courtB.players.some(p => p.id === id)) return 'B';
    if (props.courtB.reserves?.some(p => p.id === id)) return 'B_Reserves';
    if (id === 'A_Reserves') return 'A_Reserves'; 
    if (id === 'B_Reserves') return 'B_Reserves';
    for (const team of props.queue) {
        if (id === team.id || team.players.some(p => p.id === id)) return team.id;
        if (id === `${team.id}_Reserves` || (team.reserves && team.reserves.some(p => p.id === id))) return `${team.id}_Reserves`;
    }
    return null;
  }, [props.courtA, props.courtB, props.queue]);

  const handleUpdatePlayerWrapper = useCallback((playerId: string, updates: Partial<Player>) => {
      const result = onUpdatePlayer(playerId, updates);
      if (result && result.success === false) {
          validationLockRef.current = playerId; 
          haptics.notification('error');
          onShowToast(
              result.errorKey ? t(result.errorKey, result.errorParams) : t('notifications.numberUnavailable'),
              'error',
              t('validation.uniqueConstraint'),
              'block'
          );
      } else {
          if (validationLockRef.current === playerId) {
              validationLockRef.current = null;
          }
          if (activeNumberId === playerId) {
              setActiveNumberId(null);
          }
      }
      return result;
  }, [onUpdatePlayer, haptics, onShowToast, activeNumberId, t]);

  const handleRequestEditNumber = useCallback((playerId: string) => {
      if (validationLockRef.current && validationLockRef.current !== playerId) {
          haptics.notification('warning');
          onShowToast(t('notifications.finishEditing'), 'info', t('notifications.finishEditingSub'), 'alert');
          return;
      }
      setActiveNumberId(playerId);
  }, [haptics, onShowToast, t]);

  const wrappedUpdateColor = useCallback((id: string, color: TeamColor) => { props.onUpdateTeamColor(id, color); }, [props.onUpdateTeamColor]);
  const wrappedUpdateLogo = useCallback((id: string, logo: string) => { props.onUpdateTeamLogo(id, logo); }, [props.onUpdateTeamLogo]);
  
  const wrappedMove = useCallback((playerId: string, fromId: string, toId: string, newIndex?: number) => { 
      const now = Date.now();
      const idx = newIndex ?? -1;
      if (lastMoveRef.current && lastMoveRef.current.id === playerId && lastMoveRef.current.from === fromId && lastMoveRef.current.to === toId && lastMoveRef.current.index === idx) return;
      if (lastMoveRef.current && (now - lastMoveRef.current.ts < 100)) return;
      lastMoveRef.current = { id: playerId, from: fromId, to: toId, index: idx, ts: now };
      props.onMove(playerId, fromId, toId, newIndex); 
  }, [props.onMove]);

  const wrappedAdd = useCallback((name: string, target: string, number?: string, skill?: number, profileId?: string) => { 
      const result = props.onAddPlayer(name, target, number, skill, profileId);
      if (!result.success) {
          haptics.notification('error');
          onShowToast(
              result.errorKey ? t(result.errorKey, result.errorParams) : (result.error || t('notifications.cannotAdd')),
              'error',
              t('notifications.uniqueConstraint'),
              'block'
          );
      }
      return result;
  }, [props.onAddPlayer, haptics, onShowToast, t]);
  
  const { disbandTeam, reorderQueue, resetRosters, onDeletePlayer } = props;
  
  const wrappedDisband = disbandTeam ? useCallback((id: string) => { 
      const teamToDisband = props.queue.find(t => t.id === id);
      const teamIndex = props.queue.findIndex(t => t.id === id);
      haptics.impact('medium'); audio.playUndo(); disbandTeam(id);
      if (teamToDisband && restoreTeam) {
          onShowToast(t('teamManager.playerRemoved'), 'info', teamToDisband.name, 'delete', () => restoreTeam(teamToDisband, teamIndex));
      }
  }, [disbandTeam, haptics, audio, props.queue, restoreTeam, t, onShowToast]) : undefined;

  const wrappedReorder = reorderQueue ? useCallback((from: number, to: number) => { haptics.impact('light'); audio.playTap(); reorderQueue(from, to); }, [reorderQueue, haptics, audio]) : undefined;

  const handleDeleteWithUndo = useCallback((playerId: string) => {
      let player: Player | undefined;
      const findIn = (list: Player[]) => list.find(p => p.id === playerId);
      player = findIn(props.courtA.players) || findIn(props.courtA.reserves || []) || findIn(props.courtB.players) || findIn(props.courtB.reserves || []) || props.queue.flatMap(t => [...t.players, ...(t.reserves || [])]).find(p => p.id === playerId);
      if (onDeletePlayer) onDeletePlayer(playerId);
      setActivePlayerMenu(null);
      if (player && props.onUndoRemove) onShowToast(t('teamManager.playerRemoved'), 'info', player.name, 'delete', props.onUndoRemove);
  }, [props.courtA, props.courtB, props.queue, onDeletePlayer, props.onUndoRemove, t, onShowToast]);

  const requestProfileDelete = useCallback((profileId: string) => { setProfileToDeleteId(profileId); }, []);

  const executeProfileDelete = useCallback(() => {
      if (!profileToDeleteId) return;
      const profileId = profileToDeleteId;
      if (!deleteProfile) return;
      const deletedProfile = deleteProfile(profileId);
      
      if (deletedProfile && upsertProfile && relinkProfile) {
          const backup = { ...deletedProfile };
          // Ensure callbacks have access to fresh closure
          onShowToast(t('teamManager.playerRemoved'), 'info', backup.name, 'delete', () => { 
              const restored = upsertProfile(backup.name, backup.skillLevel, backup.id, { number: backup.number, avatar: backup.avatar, role: backup.role });
              // Force relink via reducer action immediately after upsert
              relinkProfile(restored); 
          });
      }
      setProfileToDeleteId(null);
  }, [deleteProfile, upsertProfile, relinkProfile, t, onShowToast, profileToDeleteId]);

  const playerStatsMap = useMemo(() => {
      const map = new Map<string, PlayerStats>();
      if (props.matchLog) { props.matchLog.forEach((log: any) => { if (log.type === 'POINT' && log.playerId) { const s = map.get(log.playerId) || { k: 0, b: 0, a: 0 }; if (log.skill === 'attack') s.k++; else if (log.skill === 'block') s.b++; else if (log.skill === 'ace') s.a++; map.set(log.playerId, s); } }); }
      return map;
  }, [props.matchLog]);

  const handleTogglePlayerMenu = (playerId: string, targetElement: HTMLElement) => {
    if (activePlayerMenu?.playerId === playerId) setActivePlayerMenu(null);
    else setActivePlayerMenu({ playerId, rect: targetElement.getBoundingClientRect() });
  };

  useEffect(() => {
    const handleClose = (event: MouseEvent) => { if (playerMenuRef.current && playerMenuRef.current.contains(event.target as Node)) return; setActivePlayerMenu(null); };
    const handleScrollClose = () => { setActivePlayerMenu(null); };
    if (activePlayerMenu) { document.addEventListener('mousedown', handleClose); document.addEventListener(SCROLL_EVENT, handleScrollClose); window.addEventListener('scroll', handleScrollClose, { capture: true }); }
    return () => { document.removeEventListener('mousedown', handleClose); document.removeEventListener(SCROLL_EVENT, handleScrollClose); window.removeEventListener('scroll', handleScrollClose, { capture: true }); };
  }, [activePlayerMenu]);

  const handleCloseAttempt = () => { props.onClose(); }; 
  const getTeamById = (id: string) => {
      if (id === props.courtA.id || id === `${props.courtA.id}_Reserves`) return props.courtA;
      if (id === props.courtB.id || id === `${props.courtB.id}_Reserves`) return props.courtB;
      const queueId = id.split('_')[0]; 
      return props.queue.find(t => t.id === queueId || t.id === id);
  };

  const playersById = useMemo(() => {
    const map = new Map<string, Player>();
    [props.courtA, props.courtB, ...props.queue].forEach(team => {
        team.players.forEach(p => map.set(p.id, p));
        team.reserves?.forEach(p => map.set(p.id, p));
    });
    return map;
  }, [props.courtA, props.courtB, props.queue]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    // Improved Sensitivity: Instant drag when using dedicated handle (delay 0)
    useSensor(TouchSensor, { activationConstraint: { delay: 0, tolerance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const handleDragStart = (event: DragStartEvent) => { haptics.impact('light'); setActivePlayer(playersById.get(event.active.id as string) || null); };
  const handleDragOver = (event: DragOverEvent) => { const { over } = event; setDragOverContainerId(over ? (over.data.current?.containerId || over.id) : null); };
  
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActivePlayer(null);
    setDragOverContainerId(null);
    if (!over) return;
    const activeId = active.id as string;
    const sourceContainerId = active.data.current?.fromId;
    let targetContainerId = over.data.current?.containerId || over.data.current?.fromId || over.id;

    if (!sourceContainerId || !targetContainerId) return;

    if (sourceContainerId === targetContainerId) {
        const oldIndex = active.data.current?.sortable?.index;
        const newIndex = over.data.current?.sortable?.index;
        if (oldIndex !== newIndex && newIndex !== undefined) {
            haptics.impact('light');
            wrappedMove(activeId, sourceContainerId, targetContainerId, newIndex);
        }
        return;
    }

    const targetTeamObj = getTeamById(targetContainerId);
    if (!targetTeamObj) return;

    const isTargetReserves = targetContainerId.endsWith('_Reserves');
    const targetList = isTargetReserves ? (targetTeamObj.reserves || []) : targetTeamObj.players;
    const BENCH_LIMIT = 6;
    const targetLimit = isTargetReserves ? BENCH_LIMIT : PLAYER_LIMIT_ON_COURT;
    
    if (targetList.length >= targetLimit) {
        if (!isTargetReserves && targetTeamObj.hasActiveBench && (targetTeamObj.reserves || []).length < BENCH_LIMIT) {
            haptics.impact('medium');
            wrappedMove(activeId, sourceContainerId, `${targetTeamObj.id}_Reserves`);
            onShowToast(t('teamManager.movedToBench'), 'info', t('teamManager.teamFullSub'));
        } else if (!isTargetReserves && !targetTeamObj.hasActiveBench) {
            setBenchConfirmState({ teamId: targetTeamObj.id, playerId: activeId, sourceId: sourceContainerId });
        } else {
            haptics.notification('error');
            onShowToast(
                isTargetReserves ? t('teamManager.benchFull') : t('teamManager.rosterFull'), 
                'error', 
                isTargetReserves ? t('teamManager.benchFullSub') : t('teamManager.rosterFullSub')
            );
        }
        return;
    }

    haptics.impact('medium');
    const newIndex = over.data.current?.sortable?.index; 
    wrappedMove(activeId, sourceContainerId, targetContainerId, newIndex);
  };


  const usedColors = useMemo(() => {
      const set = new Set<string>();
      if (props.courtA.color) set.add(props.courtA.color);
      if (props.courtB.color) set.add(props.courtB.color);
      props.queue.forEach(t => { if (t.color) set.add(t.color); });
      return set;
  }, [props.courtA.color, props.courtB.color, props.queue]);

  const handleBatchGenerate = (names: string[]) => { props.onGenerate(names); setActiveTab('roster'); haptics.notification('success'); };
  const handleTabChange = (tab: 'roster' | 'profiles' | 'input') => { if (typeof React.startTransition === 'function') { React.startTransition(() => { setActiveTab(tab); }); } else { setActiveTab(tab); } };

  return (
    createPortal(
    <Modal isOpen={props.isOpen} onClose={handleCloseAttempt} title="" showCloseButton={false} variant="fullscreen" zIndex={props.zIndex}>
        {/* ... (Existing modal content wrappers) ... */}
        {activeTutorial === 'manager' && (
            <RichTutorialModal isOpen={true} tutorialKey="manager" onClose={completeTutorial} />
        )}

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
            
            {/* MAIN CONTENT AREA */}
            <div ref={scrollRef} onScroll={onScroll} className="h-full overflow-y-auto custom-scrollbar w-full max-w-6xl mx-auto render-crisp relative">
                
                {/* --- SMART HEADER (Nav + Actions + Close) --- */}
                {/* UPDATED: Deep Glass Effect (70% Opacity) */}
                <div className="sticky top-0 z-50 pt-safe-top pb-2 px-1 mb-1 pointer-events-none">
                    <motion.div 
                        initial={{ y: 0 }}
                        animate={{ y: showHeader ? 0 : -100, opacity: showHeader ? 1 : 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="bg-slate-50/70 dark:bg-[#020617]/70 backdrop-blur-xl border-b border-white/20 dark:border-white/10 shadow-sm rounded-b-2xl pb-2 pt-2 px-2 pointer-events-auto"
                    >
                        {/* Row 1: Navigation Tabs + Close Button */}
                        <div className="flex gap-2 mb-2">
                            <div className="flex flex-1 bg-slate-100 dark:bg-white/5 rounded-2xl p-1 gap-1">
                                <button onClick={() => handleTabChange('roster')} className={`flex-1 py-2 px-2 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all active:scale-95 ${activeTab === 'roster' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}>
                                    <Users size={14} /> {t('teamManager.tabs.roster')}
                                </button>
                                <button onClick={() => handleTabChange('profiles')} className={`flex-1 py-2 px-2 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all active:scale-95 ${activeTab === 'profiles' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}>
                                    <User size={14} /> {t('teamManager.tabs.profiles')}
                                </button>
                                <button onClick={() => handleTabChange('input')} className={`flex-1 py-2 px-2 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all active:scale-95 ${activeTab === 'input' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}>
                                    <List size={14} /> {t('teamManager.tabs.batch')}
                                </button>
                            </div>
                            
                            {/* INTEGRATED CLOSE BUTTON */}
                            <button 
                                onClick={handleCloseAttempt}
                                className="w-10 flex items-center justify-center bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-2xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors active:scale-90"
                            >
                                <X size={20} strokeWidth={2.5} />
                            </button>
                        </div>

                        {/* Row 2: Actions (Only visible in Roster Tab) */}
                        {activeTab === 'roster' && (
                            <div className="flex justify-between items-center px-1">
                                <div className="flex gap-2">
                                    <button onClick={() => props.onSetRotationMode('standard')} className={`px-3 py-1.5 rounded-xl text-[9px] font-bold uppercase border transition-all active:scale-95 ${props.rotationMode === 'standard' ? 'bg-indigo-500 text-white border-indigo-600 shadow-lg shadow-indigo-500/20' : 'bg-transparent border-slate-200 dark:border-white/10 text-slate-400'}`} title={t('teamManager.modes.standardTooltip')}>{t('teamManager.modes.standard')}</button>
                                    <button onClick={() => props.onSetRotationMode('balanced')} className={`px-3 py-1.5 rounded-xl text-[9px] font-bold uppercase border transition-all active:scale-95 ${props.rotationMode === 'balanced' ? 'bg-emerald-500 text-white border-emerald-600 shadow-lg shadow-emerald-500/20' : 'bg-transparent border-slate-200 dark:border-white/10 text-slate-400'}`} title={t('teamManager.modes.balancedTooltip')}>{t('teamManager.modes.balanced')}</button>
                                </div>
                                
                                <div className={`flex gap-1`}>
                                    {props.canUndoRemove && (
                                        <button onClick={props.onUndoRemove} className="flex items-center justify-center bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 rounded-xl px-3 py-1.5 text-[9px] font-bold uppercase transition-colors active:scale-95">
                                            <Undo2 size={14} />
                                        </button>
                                    )}
                                    <button onClick={() => { haptics.impact('medium'); props.onBalanceTeams(); }} className="flex items-center justify-center gap-1.5 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-xl px-3 py-1.5 text-[9px] font-bold uppercase transition-colors active:scale-95">
                                        <Shuffle size={14} /> {props.rotationMode === 'balanced' ? t('teamManager.actions.globalBalance') : t('teamManager.actions.restoreOrder')}
                                    </button>
                                    {resetRosters && (
                                        <button onClick={() => setResetConfirmState(true)} className="flex items-center justify-center bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-xl px-3 py-1.5 text-[9px] font-bold uppercase transition-colors hover:bg-rose-500/20 shadow-sm border border-rose-500/20 active:scale-95">
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>

                <div className="relative flex flex-col min-h-0 pt-2">
                    {/* ... (Rest of content unchanged) */}
                    {activeTab === 'roster' && (
                        /* ROSTER CONTENT - NO INTERNAL SCROLL */
                        <div className="px-1 pb-32">
                            <RosterBoard 
                                courtA={props.courtA} courtB={props.courtB} queue={props.queue} 
                                onUpdatePlayer={handleUpdatePlayerWrapper} 
                                wrappedAdd={wrappedAdd} wrappedMove={wrappedMove} wrappedUpdateColor={wrappedUpdateColor} wrappedUpdateLogo={wrappedUpdateLogo} wrappedSaveProfile={props.onSaveProfile}
                                handleKnockoutRequest={handleDeleteWithUndo} usedColors={usedColors} playerStatsMap={playerStatsMap}
                                setEditingTarget={(target: EditingTarget) => setEditingTarget(target)} 
                                setViewingProfileId={setViewingProfileId}
                                handleTogglePlayerMenu={handleTogglePlayerMenu} activePlayerMenu={activePlayerMenu} toggleTeamBench={props.toggleTeamBench} substitutePlayers={props.substitutePlayers} reorderQueue={wrappedReorder} handleDisbandTeam={wrappedDisband} dragOverContainerId={dragOverContainerId} onShowToast={onShowToast} profiles={props.profiles} onRequestProfileEdit={(id: string) => setEditingTarget({ type: 'player', id })}
                                activeNumberId={activeNumberId} onRequestEditNumber={handleRequestEditNumber}
                                onUpdateTeamName={props.onUpdateTeamName}
                            />
                        </div>
                    )}
                    {/* ... */}
                    {activeTab === 'profiles' && (
                        <div className="p-2 pb-24 space-y-4">
                            <button onClick={() => setEditingTarget({ type: 'profile', id: 'new' })} className="w-full py-6 border-2 border-dashed border-slate-300 dark:border-white/10 rounded-2xl flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-indigo-500 hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all group bg-slate-50/50 dark:bg-white/[0.01] active:scale-95">
                                <div className="p-3 rounded-full bg-slate-100 dark:bg-white/5 group-hover:bg-indigo-500 group-hover:text-white transition-colors"><Plus size={24} /></div>
                                <span className="text-xs font-bold uppercase tracking-widest">{t('profile.create')}</span>
                            </button>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {Array.from(props.profiles.values()).length === 0 ? (
                                    <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-400 italic gap-3 opacity-60">
                                        <div className="p-4 bg-slate-100 dark:bg-white/5 rounded-full">
                                            <User size={32} className="opacity-40" />
                                        </div>
                                        <p className="text-sm font-medium">{t('teamManager.profiles.empty')}</p>
                                    </div>
                                ) : (
                                    Array.from(props.profiles.values()).map((profile: PlayerProfile) => {
                                        let status: PlayerLocationStatus = null;
                                        let teamColor: TeamColor | undefined = undefined;
                                        
                                        if (props.courtA.players.some(p => p.profileId === profile.id)) { status = 'A'; teamColor = props.courtA.color; }
                                        else if (props.courtA.reserves?.some(p => p.profileId === profile.id)) { status = 'A_Bench'; teamColor = props.courtA.color; }
                                        else if (props.courtB.players.some(p => p.profileId === profile.id)) { status = 'B'; teamColor = props.courtB.color; }
                                        else if (props.courtB.reserves?.some(p => p.profileId === profile.id)) { status = 'B_Bench'; teamColor = props.courtB.color; }
                                        else {
                                            for (const t of props.queue) {
                                                if (t.players.some(p => p.profileId === profile.id)) { status = 'Queue'; teamColor = t.color; break; }
                                                if (t.reserves?.some(p => p.profileId === profile.id)) { status = 'Queue_Bench'; teamColor = t.color; break; }
                                            }
                                        }

                                        const placementOptions: PlacementOption[] = [];
                                        if (!status) {
                                            if (props.courtA.players.length < 6) placementOptions.push({ label: t('teamManager.actions.addTo') + ' ' + props.courtA.name, targetId: props.courtA.id, type: 'main', teamColor: props.courtA.color });
                                            else if (props.courtA.hasActiveBench) placementOptions.push({ label: t('teamManager.actions.addTo') + ' ' + props.courtA.name + ' (' + t('teamManager.benchLabel') + ')', targetId: `${props.courtA.id}_Reserves`, type: 'bench', teamColor: props.courtA.color });
                                            
                                            if (props.courtB.players.length < 6) placementOptions.push({ label: t('teamManager.actions.addTo') + ' ' + props.courtB.name, targetId: props.courtB.id, type: 'main', teamColor: props.courtB.color });
                                            else if (props.courtB.hasActiveBench) placementOptions.push({ label: t('teamManager.actions.addTo') + ' ' + props.courtB.name + ' (' + t('teamManager.benchLabel') + ')', targetId: `${props.courtB.id}_Reserves`, type: 'bench', teamColor: props.courtB.color });
                                            
                                            placementOptions.push({ label: t('teamManager.actions.addToQueue'), targetId: 'Queue', type: 'queue' });
                                        }

                                        return (
                                            <ProfileCard 
                                                key={profile.id} 
                                                profile={profile} 
                                                onDelete={() => requestProfileDelete(profile.id)}
                                                onAddToGame={(target: string, prof: PlayerProfile) => wrappedAdd(prof.name, target, prof.number, prof.skillLevel, prof.id)}
                                                status={status}
                                                onEdit={() => setEditingTarget({ type: 'profile', id: profile.id })}
                                                placementOptions={placementOptions}
                                                onView={() => setViewingProfileId(profile.id)}
                                                teamColor={teamColor}
                                                onShowToast={onShowToast}
                                            />
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'input' && <BatchInputSection onGenerate={handleBatchGenerate} />}
                </div>
            </div>
            
            {/* ... (Modals) ... */}
            <DragOverlayFixed dropAnimation={{ duration: 250, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)' }}>
                {activePlayer ? (
                    <PlayerCard 
                        player={activePlayer} 
                        locationId="overlay" 
                        onUpdatePlayer={()=>{}} 
                        onSaveProfile={()=>{}} 
                        onRequestProfileEdit={()=>{}} 
                        onViewProfile={()=>{}}
                        onToggleMenu={()=>{}} 
                        isMenuActive={false} 
                        forceDragStyle={true} 
                    />
                ) : null}
            </DragOverlayFixed>
            {/* ... (Confirmation Modals etc) */}
             {editingTarget && (
                <ProfileCreationModal 
                    isOpen={true} 
                    onClose={() => setEditingTarget(null)}
                    title={(editingTarget as EditingTarget).id === 'new' ? t('profile.createTitle') : t('profile.editTitle')}
                    initialName={
                        (editingTarget as EditingTarget).type === 'player' 
                            ? playersById.get((editingTarget as EditingTarget).id)?.name || '' 
                            : props.profiles.get((editingTarget as EditingTarget).id)?.name || ''
                    }
                    initialNumber={
                        (editingTarget as EditingTarget).type === 'player' 
                            ? playersById.get((editingTarget as EditingTarget).id)?.number || '' 
                            : props.profiles.get((editingTarget as EditingTarget).id)?.number || ''
                    }
                    initialSkill={
                        (editingTarget as EditingTarget).type === 'player' 
                            ? playersById.get((editingTarget as EditingTarget).id)?.skillLevel 
                            : props.profiles.get((editingTarget as EditingTarget).id)?.skillLevel
                    }
                    initialRole={
                        (editingTarget as EditingTarget).type === 'player' 
                            ? playersById.get((editingTarget as EditingTarget).id)?.role 
                            : props.profiles.get((editingTarget as EditingTarget).id)?.role
                    }
                    onSave={(name: string, num: string, av: string, sk: number, role: PlayerRole) => {
                        const target = editingTarget as EditingTarget;
                        if (!target) return;

                        if (target.type === 'player') {
                            const result = props.onSaveProfile(target.id, { name, number: num, avatar: av, skill: sk, role });
                            if (result && !result.success) {
                                onShowToast(
                                    result.errorKey ? t(result.errorKey, result.errorParams) : t('notifications.saveFailed'), 
                                    'error', 
                                    t('notifications.numberConflict')
                                );
                                return; 
                            }
                        } else {
                            props.upsertProfile?.(name, sk, target.id === 'new' ? undefined : target.id, { number: num, avatar: av, role });
                        }
                        setEditingTarget(null);
                    }}
                />
            )}

            {viewingProfileId && (
                <ProfileDetailsModal 
                    isOpen={!!viewingProfileId} 
                    onClose={() => setViewingProfileId(null)}
                    profileId={viewingProfileId}
                    profiles={props.profiles}
                    onEdit={() => { setViewingProfileId(null); setEditingTarget({ type: 'profile', id: viewingProfileId }); }}
                />
            )}
            
            <ConfirmationModal 
                isOpen={!!activateBenchConfirm} 
                onClose={() => setActivateBenchConfirm(null)} 
                title={t('teamManager.activateBenchTitle')}
                message={t('teamManager.activateBenchMsg')}
                confirmLabel={t('teamManager.btnActivateBench')}
                onConfirm={() => {
                    if (activateBenchConfirm) {
                        props.toggleTeamBench(activateBenchConfirm.teamId);
                        wrappedMove(activateBenchConfirm.playerId, activateBenchConfirm.fromId, `${activateBenchConfirm.teamId}_Reserves`);
                    }
                }}
            />

            <ConfirmationModal 
                isOpen={!!benchConfirmState} 
                onClose={() => setBenchConfirmState(null)} 
                title={t('teamManager.activateBenchTitle')}
                message={t('teamManager.activateBenchMsg')}
                confirmLabel={t('teamManager.btnActivateBench')}
                onConfirm={() => {
                    if (benchConfirmState) {
                        props.toggleTeamBench(benchConfirmState.teamId);
                        wrappedMove(benchConfirmState.playerId, benchConfirmState.sourceId, `${benchConfirmState.teamId}_Reserves`);
                    }
                }}
            />

            <ConfirmationModal 
                isOpen={resetConfirmState}
                onClose={() => setResetConfirmState(false)}
                onConfirm={() => {
                    if (resetRosters) resetRosters();
                }}
                title={t('confirm.reset.title')}
                message={t('confirm.reset.message')}
                confirmLabel={t('confirm.reset.confirmButton')}
                icon={Trash2}
            />

            <ConfirmationModal 
                isOpen={!!profileToDeleteId}
                onClose={() => setProfileToDeleteId(null)}
                onConfirm={executeProfileDelete}
                title={t('confirm.deleteProfile')}
                message={t('confirm.deleteProfileMsg')}
                confirmLabel={t('teamManager.menu.delete')}
                icon={Trash2}
            />

            {/* PLAYER CONTEXT MENU - Now actually rendered! */}
            <AnimatePresence>
                {activePlayerMenu && (
                    <PlayerContextMenu 
                        activePlayerMenu={activePlayerMenu}
                        courtA={props.courtA}
                        courtB={props.courtB}
                        queue={props.queue}
                        onToggleFixed={props.onToggleFixed}
                        onRemove={handleDeleteWithUndo}
                        toggleTeamBench={props.toggleTeamBench}
                        onMove={wrappedMove}
                        handleTogglePlayerMenu={handleTogglePlayerMenu}
                        t={t}
                        setActivateBenchConfirm={setActivateBenchConfirm}
                    />
                )}
            </AnimatePresence>

        </DndContext>
    </Modal>,
    document.body
    );
});
