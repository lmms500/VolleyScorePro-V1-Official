
import React, { memo, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { MoreVertical, User, Edit2, Plus, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from '@contexts/LanguageContext';
import { PlayerProfile, TeamColor } from '@types';

interface ProfileCardProps {
    profile: PlayerProfile;
    onDelete: () => void;
    onAddToGame: (targetId: string, profile: PlayerProfile) => void;
    status: string | null;
    onEdit: () => void;
    placementOptions: { label: string; targetId: string; type: 'main' | 'bench' | 'queue'; teamColor?: string }[];
    onView: () => void;
    teamColor?: TeamColor;
    onShowToast: (msg: string, type: 'success' | 'info' | 'error', subText?: string, icon?: any, onUndo?: () => void) => void;
}

export const ProfileCard = memo(({ profile, onDelete, onAddToGame, status, onEdit, placementOptions, onView, teamColor, onShowToast }: ProfileCardProps) => {
    const { t } = useTranslation();
    const [showMenu, setShowMenu] = useState(false);
    const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});
    const buttonRef = useRef<HTMLButtonElement>(null);

    // Calcular posição do menu com base no botão (safe para grids/overflow)
    const openMenu = useCallback(() => {
        if (!buttonRef.current) return;
        const rect = buttonRef.current.getBoundingClientRect();
        const isBottomHalf = rect.bottom > window.innerHeight / 2;

        setMenuStyle({
            position: 'fixed',
            zIndex: 9999,
            top: isBottomHalf ? 'auto' : rect.bottom + 8,
            bottom: isBottomHalf ? window.innerHeight - rect.top + 8 : 'auto',
            right: window.innerWidth - rect.right,
        });
        setShowMenu(true);
    }, []);

    const closeMenu = useCallback(() => setShowMenu(false), []);

    const statusLabel = status ? (status.includes('Queue') ? t('teamManager.queue') : (status.includes('A') ? t('teamManager.location.courtA') : t('teamManager.location.courtB'))) : null;
    const statusColor = status ? (status.includes('A') ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300' : (status.includes('B') ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300' : 'bg-slate-100 text-slate-600')) : '';

    return (
        <div className={`relative flex flex-col p-3 rounded-2xl transition-all duration-300 border ${status ? 'bg-slate-50/50 dark:bg-white/5 opacity-70 border-dashed border-white/20 dark:border-white/5' : 'bg-gradient-to-b from-slate-50 to-slate-100 dark:from-white/5 dark:to-white/[0.02] border-white/40 dark:border-white/10 shadow-lg shadow-black/5 dark:shadow-black/20 ring-1 ring-black/5 dark:ring-white/5 backdrop-blur-md hover:shadow-xl hover:border-indigo-500/30 after:absolute after:inset-x-0 after:top-0 after:h-px after:bg-gradient-to-r after:from-transparent after:via-white/50 after:to-transparent after:rounded-t-2xl'} group`}>
            <div className="flex items-center gap-3">
                <div className="relative">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg bg-slate-100 dark:bg-black/20 shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] ring-1 ring-inset ring-black/5 dark:ring-white/5 border border-white/50 dark:border-white/5 overflow-hidden">
                        {profile.avatar ? (
                            profile.avatar.startsWith('http') || profile.avatar.length > 30 ? (
                                <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-base">{profile.avatar}</span>
                            )
                        ) : (
                            <User size={20} className="opacity-40" />
                        )}
                    </div>
                    {status && (<div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-full border-2 border-white dark:border-slate-800 shadow-sm shadow-emerald-500/30" />)}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-slate-800 dark:text-white truncate">{profile.name}</span>
                        {profile.number && <span className="text-[10px] font-black bg-white/60 dark:bg-white/10 backdrop-blur-sm border border-white/60 dark:border-white/10 ring-1 ring-inset ring-white/5 px-1.5 py-0.5 rounded-md text-slate-500 dark:text-slate-400">{profile.number}</span>}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-medium text-slate-400">Lvl {profile.skillLevel}</span>
                        {status && <span className={`text-[9px] font-bold uppercase px-1.5 rounded ${statusColor}`}>{statusLabel}</span>}
                    </div>
                </div>
                <button
                    ref={buttonRef}
                    onClick={openMenu}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-slate-600 transition-colors"
                >
                    <MoreVertical size={16} />
                </button>
            </div>

            {/* Menu via Portal — evita sobreposição pelo grid */}
            {showMenu && createPortal(
                <>
                    {/* Backdrop transparente para fechar ao clicar fora */}
                    <div
                        className="fixed inset-0 z-[9998] bg-transparent"
                        onPointerDown={closeMenu}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 6 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                        style={menuStyle}
                        className="min-w-[160px] bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.2),inset_0_1px_0_0_rgba(255,255,255,0.15)] border border-white/20 dark:border-white/10 ring-1 ring-inset ring-white/10 overflow-hidden p-1 flex flex-col gap-0.5"
                    >
                        <button onClick={() => { onView(); closeMenu(); }} className="w-full text-left px-3 py-2 text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 rounded-lg flex items-center gap-2">
                            <User size={14} /> {t('common.view')}
                        </button>
                        <button onClick={() => { onEdit(); closeMenu(); }} className="w-full text-left px-3 py-2 text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 rounded-lg flex items-center gap-2">
                            <Edit2 size={14} /> {t('common.edit')}
                        </button>
                        {!status && placementOptions.length > 0 && (
                            <>
                                <div className="h-px bg-slate-100 dark:bg-white/5 my-1" />
                                {placementOptions.map((opt, idx) => (
                                    <button key={idx} onClick={() => { onAddToGame(opt.targetId, profile); closeMenu(); }} className="w-full text-left px-3 py-2 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg flex items-center gap-2">
                                        <Plus size={14} /> {opt.label}
                                    </button>
                                ))}
                            </>
                        )}
                        <div className="h-px bg-slate-100 dark:bg-white/5 my-1" />
                        <button onClick={() => { onDelete(); closeMenu(); }} className="w-full text-left px-3 py-2 text-[10px] font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg flex items-center gap-2">
                            <Trash2 size={14} /> {t('common.delete')}
                        </button>
                    </motion.div>
                </>,
                document.body
            )}
        </div>
    );
});
