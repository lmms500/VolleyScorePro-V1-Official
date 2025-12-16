
import React, { memo, useMemo, useCallback, useRef, useState, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Player, PlayerProfile, PlayerRole } from '../types';
import { Pin, Save, Check, MoreVertical, Hash, Edit2, RefreshCw, Shield, Hand, Zap, Target, Swords, Trophy, User, GripVertical } from 'lucide-react';
import { SkillSlider } from './ui/SkillSlider';
import { useHaptics } from '../hooks/useHaptics';
import { motion } from 'framer-motion';

interface PlayerCardProps {
    player: Player;
    locationId: string;
    profile?: PlayerProfile;
    
    // Unified Handler
    onUpdatePlayer: (id: string, updates: Partial<Player>) => void | { success: boolean; error?: string };

    onSaveProfile: (id: string, overrides: { name: string, number?: string, avatar?: string, skill: number, role?: PlayerRole }) => void;
    onRequestProfileEdit: (id: string) => void;
    onViewProfile: (id: string) => void; 
    onToggleMenu: (playerId: string, targetElement: HTMLElement) => void;
    isMenuActive: boolean;
    onShowToast?: (msg: string, type: 'success' | 'info' | 'error') => void;
    isCompact?: boolean;
    forceDragStyle?: boolean;
    
    // Controlled Editing Props
    activeNumberId?: string | null;
    onRequestEditNumber?: (id: string) => void;
}

// Map roles to specific color styles (Neo-Glass Tint)
const ROLE_STYLES: Record<string, string> = {
    setter: 'bg-amber-500/10 dark:bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20 dark:hover:bg-amber-500/20',
    hitter: 'bg-rose-500/10 dark:bg-rose-500/10 border-rose-500/30 hover:bg-rose-500/20 dark:hover:bg-rose-500/20',
    middle: 'bg-indigo-500/10 dark:bg-indigo-500/10 border-indigo-500/30 hover:bg-indigo-500/20 dark:hover:bg-indigo-500/20',
    libero: 'bg-emerald-500/10 dark:bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20 dark:hover:bg-emerald-500/20',
    none: ''
};

const EditableTitle = memo(({ name, onSave, className }: { name: string; onSave: (val: string) => void; className?: string }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [val, setVal] = useState(name);
    const inputRef = useRef<HTMLInputElement>(null);
  
    useEffect(() => { setVal(name); }, [name]);
    useEffect(() => { if(isEditing) inputRef.current?.focus(); }, [isEditing]);
  
    const save = () => {
      setIsEditing(false);
      if(val.trim() && val !== name) onSave(val.trim());
      else setVal(name);
    };
  
    if(isEditing) {
      return (
          <input 
              ref={inputRef} type="text"
              className={`bg-transparent text-slate-900 dark:text-white border-b-2 border-indigo-500 outline-none w-full min-w-0 px-0 py-0 font-bold text-sm`}
              value={val} onChange={e => setVal(e.target.value)} onBlur={save}
              onKeyDown={e => { if(e.key === 'Enter') save(); if(e.key === 'Escape') setIsEditing(false); }}
              onPointerDown={e => e.stopPropagation()} 
              onTouchStart={e => e.stopPropagation()}
          />
      );
    }
    return (
        <div 
            className={`flex items-center gap-2 group cursor-pointer min-w-0 flex-1 ${className}`} 
            onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
            onPointerDown={e => e.stopPropagation()} // Stop drag initiation here
        >
            <span className="truncate flex-1 min-w-0 block">{name}</span>
            <Edit2 size={10} className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 flex-shrink-0" />
        </div>
    );
});

/**
 * EditableNumber v2: Error Focus Trap Edition
 */
const EditableNumber = memo(({ 
    number, 
    onSave, 
    isOpen, 
    onRequestOpen, 
    onRequestClose 
}: { 
    number?: string; 
    onSave: (val: string) => void | { success: boolean; error?: string };
    isOpen?: boolean;
    onRequestOpen?: () => void;
    onRequestClose?: () => void;
}) => {
    const [val, setVal] = useState(number || '');
    const [isError, setIsError] = useState(false);
    const [localIsEditing, setLocalIsEditing] = useState(false);
    
    const isEditing = isOpen !== undefined ? isOpen : localIsEditing;
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => { 
        setVal(number || ''); 
        if (!isOpen) setIsError(false);
    }, [number, isOpen]);

    useEffect(() => { 
        if(isEditing) requestAnimationFrame(() => inputRef.current?.focus());
    }, [isEditing]);

    const attemptSaveAndClose = (source?: 'blur' | 'enter' | 'clickOutside') => {
        const trimmed = val.trim();
        if (trimmed === (number || '') || trimmed === '') {
            setVal(trimmed);
            setIsError(false);
            if(onRequestClose) onRequestClose();
            else setLocalIsEditing(false);
            return;
        }
        const result = onSave(trimmed);
        if (result && result.success === false) {
            setIsError(true);
            requestAnimationFrame(() => inputRef.current?.focus());
        } else {
            setIsError(false);
            if(onRequestClose) onRequestClose();
            else setLocalIsEditing(false);
        }
    };

    const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
        e.stopPropagation();
        e.preventDefault(); // Prevent accidental drags
        if(onRequestOpen) onRequestOpen();
        else setLocalIsEditing(true);
    };

    const handleOverlayClick = (e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault(); 
        e.stopPropagation();
        attemptSaveAndClose('clickOutside');
    };

    if(isEditing) {
        return (
            <>
                <div 
                    className="fixed inset-0 z-40 bg-transparent cursor-default"
                    onMouseDown={handleOverlayClick}
                    onTouchStart={handleOverlayClick}
                />
                <motion.input 
                    ref={inputRef} 
                    type="tel" 
                    maxLength={3}
                    autoFocus
                    animate={isError ? { 
                        x: [0, -4, 4, -4, 4, 0], 
                        borderColor: '#e11d48', 
                        color: '#e11d48', 
                        backgroundColor: 'rgba(255, 228, 230, 0.9)',
                        scale: [1, 1.1, 1],
                    } : { 
                        x: 0, 
                        borderColor: '#6366f1',
                        color: 'inherit',
                        backgroundColor: 'rgba(255, 255, 255, 1)' 
                    }}
                    transition={{ duration: 0.3 }}
                    className={`
                        relative z-50 w-8 h-8 text-center rounded-lg border-2 outline-none text-xs font-black shadow-lg transition-all
                        ${isError ? 'border-rose-600 text-rose-600 shadow-rose-500/30' : 'bg-white dark:bg-black/80 text-slate-900 dark:text-white border-indigo-500'}
                    `}
                    value={val} 
                    onChange={e => { setVal(e.target.value); if (isError) setIsError(false); }}
                    onBlur={() => attemptSaveAndClose('blur')}
                    onKeyDown={e => { 
                        if(e.key === 'Enter') { e.preventDefault(); attemptSaveAndClose('enter'); }
                        if(e.key === 'Escape') { setVal(number || ''); setIsError(false); if(onRequestClose) onRequestClose(); else setLocalIsEditing(false); } 
                    }}
                    onClick={e => e.stopPropagation()}
                    onPointerDown={e => e.stopPropagation()} 
                    onTouchStart={e => e.stopPropagation()}
                />
            </>
        );
    }

    return (
        <button 
            onClick={handleStart}
            onPointerDown={e => e.stopPropagation()} 
            onTouchStart={e => e.stopPropagation()}
            className={`w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-black border transition-all flex-shrink-0 ${number ? 'bg-slate-200 dark:bg-white/5 text-slate-800 dark:text-white border-transparent shadow-sm' : 'bg-transparent text-slate-300 dark:text-slate-600 border-transparent hover:border-slate-300 hover:text-slate-400'}`}
        >
            {number || <Hash size={12} />}
        </button>
    );
});

// Helper for Initials
const getInitials = (name: string) => {
    if (!name) return '';
    const parts = name.trim().split(' ');
    if (parts.length === 0) return '';
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export const PlayerCard = memo(({ 
    player, locationId, profile, 
    onUpdatePlayer, onSaveProfile, onRequestProfileEdit, onViewProfile,
    onToggleMenu, isMenuActive, onShowToast, forceDragStyle = false,
    activeNumberId, onRequestEditNumber
}: PlayerCardProps) => {
  const haptics = useHaptics();

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: player.id,
    data: { fromId: locationId, player },
    disabled: player.isFixed || isMenuActive || (activeNumberId === player.id),
  });

  const style = { 
      transform: CSS.Transform.toString(transform), 
      transition, 
      opacity: isDragging ? 0.9 : 1, 
      zIndex: isDragging ? 50 : (isMenuActive || activeNumberId === player.id ? 40 : 'auto'),
      scale: isDragging ? 1.05 : 1, 
      boxShadow: isDragging ? '0 10px 30px -10px rgba(0,0,0,0.3)' : 'none',
  };
  
  const isLinked = !!player.profileId && !!profile;
  
  const isDirty = useMemo(() => {
    if (!isLinked || !profile) return false;
    return (
        profile.name !== player.name || 
        profile.skillLevel !== player.skillLevel || 
        (profile.number || '') !== (player.number || '') ||
        (profile.role || 'none') !== (player.role || 'none')
    );
  }, [player, profile, isLinked]);

  const handleEditRequest = useCallback((e: React.MouseEvent) => {
      e.stopPropagation();
      onRequestProfileEdit(player.id); 
  }, [player.id, onRequestProfileEdit]);

  const handleMenu = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      e.preventDefault();
      onToggleMenu(player.id, e.currentTarget);
  };

  const activeRole = profile?.role || player.role || 'none';
  
  // Base style for dragged items
  const dragClass = `bg-white dark:bg-slate-800 border-2 border-indigo-500 shadow-2xl z-50 ring-4 ring-indigo-500/20`;
  
  // Base style for normal items
  const baseClass = `bg-white/60 dark:bg-white/[0.04] hover:bg-white/80 dark:hover:bg-white/[0.08] border-transparent hover:border-slate-300 dark:hover:border-white/10 transition-all duration-200`;

  const roleStyleClass = ROLE_STYLES[activeRole];
  
  let containerClass = baseClass;
  if (forceDragStyle) {
      containerClass = dragClass;
  } else if (locationId.includes('_Reserves')) {
      containerClass = 'border-dashed border-slate-300 dark:border-white/10 bg-slate-50/50 dark:bg-black/20';
  } else if (player.isFixed) {
      containerClass = 'bg-amber-500/5 border-amber-500/20 shadow-sm shadow-amber-500/5';
  } else if (roleStyleClass) {
      containerClass = roleStyleClass;
  }

  let SyncIcon = Save;
  let syncColor = 'text-slate-300 hover:text-indigo-500 hover:bg-indigo-500/10';
  let syncTitle = "Save Profile";

  if (isLinked) {
      if (isDirty) {
          SyncIcon = RefreshCw; 
          syncColor = 'text-amber-500 hover:bg-amber-500/10 animate-pulse';
          syncTitle = "Unsaved Changes - Edit to Sync";
      } else {
          SyncIcon = Edit2;
          syncColor = 'text-slate-400 hover:text-indigo-500 hover:bg-indigo-500/10';
          syncTitle = "Edit Profile";
      }
  }

  let avatarContent: React.ReactNode = <User size={14} className="opacity-50" />;
  if (profile?.avatar) {
      if (profile.avatar.length <= 4) {
          avatarContent = <span className="text-xs leading-none">{profile.avatar}</span>;
      } else {
          avatarContent = <img src={profile.avatar} className="w-full h-full object-cover" alt="" />;
      }
  } else {
      const initials = getInitials(player.name);
      if (initials) {
          avatarContent = <span className="text-[9px] font-bold opacity-70">{initials}</span>;
      }
  }

  return (
    <div 
        ref={setNodeRef} style={style} data-player-card="true" 
        className={`group relative flex items-center justify-between rounded-2xl border touch-none py-1.5 px-2.5 min-h-[50px] ${containerClass}`}
    >
        {/* DRAG HANDLE: The only place that initiates drags */}
        <div 
            {...attributes} 
            {...listeners} 
            className={`
                mr-2 cursor-grab active:cursor-grabbing touch-none flex items-center justify-center p-1 -ml-1
                ${player.isFixed ? 'opacity-30 cursor-not-allowed' : 'text-slate-400 dark:text-slate-600 hover:text-indigo-500'}
            `}
        >
            {player.isFixed ? <Pin size={14} className="text-amber-500" fill="currentColor" /> : <GripVertical size={16} />}
        </div>

        {/* LEFT GROUP: Avatar + Number */}
        <div className="flex items-center gap-2 flex-shrink-0 self-center mr-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-300 overflow-hidden shadow-inner border border-black/5 dark:border-white/5`}>
                {avatarContent}
            </div>

            <EditableNumber 
                number={player.number} 
                onSave={(v) => onUpdatePlayer(player.id, { number: v })} 
                isOpen={activeNumberId === player.id}
                onRequestOpen={() => onRequestEditNumber && onRequestEditNumber(player.id)}
                onRequestClose={() => onRequestEditNumber && onRequestEditNumber('')}
            />
        </div>
        
        {/* NAME ZONE: Interaction Safe Area */}
        <div className="flex flex-1 items-center gap-2 min-w-0 px-1 h-full">
            <div className="flex flex-col min-w-0 flex-1">
                <EditableTitle 
                    name={player.name} 
                    onSave={(v) => onUpdatePlayer(player.id, { name: v })} 
                    className={`text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100 leading-tight`} 
                />
            </div>
        </div>
        
        {/* RIGHT GROUP: Controls */}
        <div className="flex items-center gap-1 flex-shrink-0 relative z-30 self-center">
            <div className="flex items-center scale-100 origin-right mr-1">
                <SkillSlider level={player.skillLevel} onChange={(v) => onUpdatePlayer(player.id, { skillLevel: v })} />
            </div>

            <button 
                onClick={handleEditRequest}
                onPointerDown={e => e.stopPropagation()} // Prevent drag leak
                className={`p-1.5 rounded-lg transition-colors ${syncColor}`} title={syncTitle}
            >
                <SyncIcon size={14} strokeWidth={isLinked && !isDirty ? 2 : 2} />
            </button>

            <button 
                onClick={handleMenu}
                onPointerDown={e => e.stopPropagation()} // Prevent drag leak
                className={`p-1.5 rounded-lg transition-colors ${isMenuActive ? 'bg-slate-200 dark:bg-white/10 text-indigo-500' : 'text-slate-300 hover:text-slate-600 dark:hover:text-slate-300'}`}
            >
                <MoreVertical size={14} />
            </button>
        </div>
    </div>
  );
}, (prev, next) => {
    if (prev.locationId !== next.locationId || prev.isCompact !== next.isCompact || prev.forceDragStyle !== next.forceDragStyle || prev.isMenuActive !== next.isMenuActive || prev.activeNumberId !== next.activeNumberId) return false;
    
    const playerEq = prev.player.id === next.player.id && prev.player.name === next.player.name && prev.player.number === next.player.number && prev.player.skillLevel === next.player.skillLevel && prev.player.isFixed === next.player.isFixed && prev.player.profileId === next.player.profileId && prev.player.role === next.player.role;
    if (!playerEq) return false;

    if (prev.profile !== next.profile) {
        if (!prev.profile || !next.profile) return false;
        if (
            prev.profile.name !== next.profile.name || 
            prev.profile.skillLevel !== next.profile.skillLevel || 
            prev.profile.number !== next.profile.number || 
            prev.profile.avatar !== next.profile.avatar || 
            prev.profile.role !== next.profile.role ||
            prev.profile.stats?.totalPoints !== next.profile.stats?.totalPoints
        ) return false;
    }
    return true;
});
