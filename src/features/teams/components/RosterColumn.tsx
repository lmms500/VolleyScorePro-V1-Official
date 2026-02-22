
import React, { useState, useMemo, useCallback, memo, useEffect } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Activity, ChevronsUp, ChevronUp, ChevronDown, Armchair, ListFilter, Trash2, ArrowDownAZ, ArrowDown01, ArrowUpWideNarrow, RefreshCcw, ArrowRightLeft, ChevronRight, UserPlus, ListOrdered, ArrowUpCircle } from 'lucide-react';
import { Team, Player, TeamColor } from '@types';
import { calculateTeamStrength } from '@features/game/utils/balanceUtils';
import { resolveTheme } from '@lib/utils/colors';
import { useTranslation } from '@contexts/LanguageContext';
import { staggerContainer } from '@lib/utils/animations';
import { ColorPicker, EditableTitle, TeamLogoUploader } from '@features/teams/components/TeamManagerUI';
import { AddPlayerForm } from '@features/teams/components/AddPlayerForm';
import { BenchArea } from '@features/teams/components/BenchArea';
import { PlayerListItem } from '@features/teams/components/PlayerListItem';
import { SubstitutionModal } from '@features/teams/modals/SubstitutionModal';
import { ConfirmationModal } from '@features/game/modals/ConfirmationModal';
import { useActions } from '@contexts/GameContext';
import { useNotification } from '@contexts/NotificationContext';
import { useHaptics } from '@lib/haptics/useHaptics';

const SCROLL_EVENT = 'team-manager-scroll';
const dispatchScrollEvent = () => { if (typeof window !== 'undefined') window.dispatchEvent(new Event(SCROLL_EVENT)); };

interface RosterColumnProps {
    id: string;
    team: Team;
    usedColors: Set<string>;
    isQueue?: boolean;
    isDragOver: boolean;
    highlighted?: boolean;
    isNext?: boolean;
    queueIndex?: number;
    queueSize?: number;
    onDisband?: (id: string) => void;
    onReorder?: (from: number, to: number) => void;
    maxPlayers?: number;
    maxBench?: number;
}

export const RosterColumn = memo(({
    id, team,
    usedColors, isQueue = false,
    isDragOver, highlighted,
    queueIndex, queueSize, onDisband, onReorder,
    maxPlayers = 6, maxBench = 6
}: RosterColumnProps) => {
    const { t } = useTranslation();
    const haptics = useHaptics();

    // Hooks
    const {
        updateTeamName, updateTeamColor, updateTeamLogo, addPlayer,
        toggleTeamBench, substitutePlayers, deletePlayer, onRestorePlayer
    } = useActions();
    const { showNotification } = useNotification();

    const [showSortMenu, setShowSortMenu] = useState(false);
    const [viewMode, setViewMode] = useState<'main' | 'reserves'>('main');
    const [isSubModalOpen, setIsSubModalOpen] = useState(false);
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const [sortConfig, setSortConfig] = useState<{ criteria: 'name' | 'number' | 'skill' | 'original', direction: 'asc' | 'desc' }>({ criteria: 'original', direction: 'asc' });

    const colorConfig = resolveTheme(team.color);
    const { setNodeRef: droppableRef } = useDroppable({ id: id, data: { type: 'container', containerId: id } });

    useEffect(() => { if (!team.hasActiveBench && viewMode === 'reserves') setViewMode('main'); }, [team.hasActiveBench]);

    const rawPlayers = team.players;
    const displayedPlayers = useMemo(() => {
        let sorted = [...rawPlayers];
        if (sortConfig.criteria === 'original') {
            return sorted.sort((a, b) => (a.displayOrder ?? a.originalIndex ?? 0) - (b.displayOrder ?? b.originalIndex ?? 0));
        }
        sorted.sort((a, b) => {
            let valA: any = a[sortConfig.criteria as keyof Player] || '';
            let valB: any = b[sortConfig.criteria as keyof Player] || '';
            if (sortConfig.criteria === 'skill') { valA = a.skillLevel; valB = b.skillLevel; }
            if (sortConfig.criteria === 'number') { valA = parseInt(a.number || '0'); valB = parseInt(b.number || '0'); }
            if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
            if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
        return sorted;
    }, [rawPlayers, sortConfig]);

    const mainRosterFull = team.players.length >= maxPlayers;
    const reservesFull = (team.reserves || []).length >= maxBench;

    const handleUpdateName = useCallback((n: string) => updateTeamName(id, n), [updateTeamName, id]);
    const handleUpdateColor = useCallback((c: TeamColor) => updateTeamColor(id, c), [updateTeamColor, id]);
    const handleUpdateLogo = useCallback((l: string) => updateTeamLogo(id, l), [updateTeamLogo, id]);

    const toggleView = () => setViewMode(prev => prev === 'main' ? 'reserves' : 'main');

    const handleAdd = useCallback((n: string, num?: string, s?: number) => {
        const targetId = viewMode === 'main' ? id : `${id}_Reserves`;
        const result = addPlayer(n, targetId, num, s);
        if (!result.success) {
            haptics.notification('error');
            showNotification({
                type: 'error',
                mainText: result.errorKey ? t(result.errorKey, result.errorParams) : (result.error || t('notifications.cannotAdd')),
                subText: t('notifications.uniqueConstraint')
            });
        }
    }, [addPlayer, id, viewMode, haptics, showNotification, t]);

    const applySort = (criteria: any) => { setSortConfig(prev => ({ criteria, direction: prev.criteria === criteria && prev.direction === 'asc' ? 'desc' : 'asc' })); setShowSortMenu(false); };

    const bgClass = viewMode === 'reserves' ? 'bg-slate-100/80 dark:bg-white/[0.02] border-dashed border-slate-300 dark:border-white/10' : `bg-white/95 dark:bg-[#0f172a]/90 bg-gradient-to-b ${colorConfig.gradient} ${isQueue ? '' : 'border-slate-200 dark:border-white/5'} shadow-xl shadow-black/5 dark:shadow-black/20`;
    const containerBorder = isQueue ? 'border-transparent' : 'border';

    let dropBg = ""; if (isDragOver) dropBg = "bg-indigo-400/10";
    const containerClass = `flex flex-col w-full h-auto min-h-[300px] rounded-2xl ${containerBorder} relative transition-transform transition-colors duration-300 p-4 sm:p-6 landscape:p-2 ${bgClass} ${isDragOver ? `ring-4 ring-indigo-400/50 scale-[1.01] ${dropBg} z-20` : (isQueue ? '' : 'hover:border-slate-300 dark:hover:border-white/20')} ${(isQueue && queueIndex === 0) ? 'ring-2 ring-amber-500/50 dark:ring-amber-500/40 shadow-2xl shadow-amber-500/10' : ''} ${highlighted ? 'ring-4 ring-indigo-500/50 scale-[1.02] shadow-2xl z-30' : ''}`;

    return (
        <div ref={droppableRef} className={containerClass}>
            <SubstitutionModal isOpen={isSubModalOpen} onClose={() => setIsSubModalOpen(false)} team={team} onConfirm={(pIn, pOut) => substitutePlayers(id, pIn, pOut)} />
            <ConfirmationModal
                isOpen={showResetConfirm}
                onClose={() => setShowResetConfirm(false)}
                onConfirm={() => {
                    // 1. Snapshot for Undo
                    const backupLogo = team.logo;
                    const backupPlayers = [...team.players];
                    const backupReserves = [...(team.reserves || [])];

                    // 2. Clear logo
                    updateTeamLogo(id, '');
                    // 3. Delete all players from main roster
                    team.players.forEach(p => deletePlayer(p.id));
                    // 4. Delete all players from reserves
                    (team.reserves || []).forEach(p => deletePlayer(p.id));

                    showNotification({
                        mainText: t('teamManager.teamReset') || 'Team Reset',
                        type: 'info',
                        onUndo: () => {
                            if (backupLogo) updateTeamLogo(id, backupLogo);
                            // Restore players in order
                            backupPlayers.forEach(p => onRestorePlayer(p, id));
                            backupReserves.forEach(p => onRestorePlayer(p, `${id}_Reserves`));
                        }
                    });
                    setShowResetConfirm(false);
                }}
                title={t('teamManager.resetTeam') || 'Reset Team'}
                message={t('teamManager.confirmResetTeam') || 'Are you sure you want to reset this team? All players and the logo will be removed.'}
                confirmLabel={t('common.yes') || 'Yes'}
            />
            {isQueue && queueIndex !== undefined && (<div className={`absolute -top-4 right-6 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest z-10 flex items-center gap-1.5 shadow-md border border-white/50 dark:border-white/20 ${queueIndex === 0 ? 'bg-amber-500 text-amber-950' : 'bg-slate-200 text-slate-600 dark:bg-white/10 dark:text-slate-300'}`}>{queueIndex === 0 ? <ArrowUpCircle size={14} strokeWidth={3} /> : <ListOrdered size={12} strokeWidth={3} />}{queueIndex === 0 ? "NEXT UP" : `${queueIndex + 1}º`}</div>)}
            <div className="flex flex-col mb-2 w-full">
                <div className="flex items-center gap-3 mb-2 w-full">
                    <TeamLogoUploader
                        currentLogo={team.logo}
                        onUpdate={handleUpdateLogo}
                        teamName={team.name}
                        onColorUpdate={handleUpdateColor}
                    />
                    <div className="flex-1 min-w-0"><EditableTitle name={team.name} onSave={handleUpdateName} className={`text-lg landscape:text-base font-black uppercase tracking-tight ${colorConfig.text} ${colorConfig.textDark} drop-shadow-sm w-full`} /></div>
                    <div className="flex gap-1.5 flex-wrap"><div className={`px-2 py-0.5 rounded-md text-[9px] font-bold border flex items-center gap-1 shadow-sm text-white ${colorConfig.bg} ${colorConfig.border}`}><Users size={10} strokeWidth={2.5} /> {displayedPlayers.length} / {maxPlayers}</div><div className={`px-2 py-0.5 rounded-md text-[9px] font-bold border flex items-center gap-1 shadow-sm ${colorConfig.bg.replace('/20', '/40')} ${colorConfig.border} dark:text-white dark:border-white/20 text-slate-700`} title="Avg Team Skill"><Activity size={10} strokeWidth={2.5} /> {calculateTeamStrength(team.players)}</div></div>
                </div>
                <div className="flex items-center justify-between border-t border-slate-200 dark:border-white/5 pt-2 mt-1 mb-2 w-full">
                    {isQueue ? (<div className="flex items-center gap-1">{onReorder && queueIndex !== undefined && queueSize !== undefined && (<>{queueIndex > 0 && <button onClick={(e) => { e.stopPropagation(); onReorder(queueIndex, 0); }} className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 active:scale-95"><ChevronsUp size={14} strokeWidth={2.5} /></button>}{queueIndex > 1 && <button onClick={(e) => { e.stopPropagation(); onReorder(queueIndex, queueIndex - 1); }} className="p-1.5 rounded-lg bg-slate-100 dark:bg-white/10 text-slate-600 hover:bg-slate-200 active:scale-95"><ChevronUp size={14} /></button>}{queueIndex < queueSize - 1 && <button onClick={(e) => { e.stopPropagation(); onReorder(queueIndex, queueIndex + 1); }} className="p-1.5 rounded-lg bg-slate-100 dark:bg-white/10 text-slate-600 hover:bg-slate-200 active:scale-95"><ChevronDown size={14} /></button>}</>)}</div>) : <div />}
                    <div className="flex items-center gap-1">
                        <button onClick={(e) => { e.stopPropagation(); toggleTeamBench(id); }} className={`p-1.5 rounded-lg border border-transparent transition-all active:scale-95 ${team.hasActiveBench ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/20' : 'bg-slate-100 dark:bg-white/10 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`} title={team.hasActiveBench ? t('teamManager.benchLabel') : t('teamManager.activateBenchTitle')}><Armchair size={14} fill={team.hasActiveBench ? 'currentColor' : 'none'} /></button>
                        <div className="relative">
                            <button onClick={() => setShowSortMenu(!showSortMenu)} className={`p-1.5 rounded-lg border border-transparent hover:bg-slate-100 dark:hover:bg-white/10 transition-colors active:scale-95 ${showSortMenu ? 'bg-slate-100 dark:bg-white/10' : ''}`}><ListFilter size={14} /></button>
                            <AnimatePresence>{showSortMenu && (<motion.div initial={{ opacity: 0, y: 8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.95 }} className="absolute right-0 top-full mt-2 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-xl shadow-[0_20px_40px_rgba(0,0,0,0.2),inset_0_1px_0_0_rgba(255,255,255,0.15)] border border-black/5 dark:border-white/10 ring-1 ring-inset ring-white/10 p-1 flex flex-col min-w-[140px]"><button onClick={() => applySort('name')} className="flex items-center gap-2 px-2 py-2 text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg text-left w-full"><ArrowDownAZ size={12} /> {t('teamManager.sort.name')}</button><button onClick={() => applySort('number')} className="flex items-center gap-2 px-2 py-2 text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg text-left w-full"><ArrowDown01 size={12} /> {t('teamManager.sort.number')}</button><button onClick={() => applySort('skill')} className="flex items-center gap-2 px-2 py-2 text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg text-left w-full"><ArrowUpWideNarrow size={12} /> {t('teamManager.sort.skill')}</button><div className="h-px bg-black/5 dark:bg-white/5 my-1" /><button onClick={() => applySort('original')} className="flex items-center gap-2 px-2 py-2 text-[10px] font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg text-left w-full"><RefreshCcw size={12} /> {t('teamManager.sort.reset')}</button></motion.div>)}</AnimatePresence>
                        </div>
                        {/* Reset Team Button - Clears logo AND removes all players */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowResetConfirm(true);
                            }}
                            className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-600 hover:bg-amber-100 transition-colors active:scale-95"
                            title={t('teamManager.resetTeam') || 'Reset Team'}
                        >
                            <RefreshCcw size={14} />
                        </button>
                        {/* Delete/Disband Team Button - Visible for queue, disabled hint for main teams */}
                        {isQueue && onDisband && <button onClick={() => onDisband(id)} className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-500 hover:bg-rose-100 transition-colors active:scale-95"><Trash2 size={14} /></button>}
                    </div>
                </div>
                {viewMode === 'main' && <ColorPicker selected={team.color || 'slate'} onChange={handleUpdateColor} usedColors={usedColors} />}
            </div>
            {team.hasActiveBench && (
                <div className="flex justify-end mb-2 gap-2 px-1">
                    <button onClick={() => setIsSubModalOpen(true)} className="flex items-center justify-center p-2 rounded-xl text-[9px] font-bold uppercase tracking-wider transition-all bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-slate-500 hover:text-indigo-500 shadow-sm active:scale-95"><ArrowRightLeft size={16} /></button>
                    <button onClick={toggleView} className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[9px] font-bold uppercase tracking-wider transition-all active:scale-95 ${viewMode === 'reserves' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'bg-slate-100 dark:bg-white/5 text-slate-500 hover:bg-slate-200 dark:hover:bg-white/10'}`}>{viewMode === 'reserves' ? t('common.back') : t('teamManager.benchLabel')}{viewMode === 'main' && <ChevronRight size={14} />}</button>
                </div>
            )}
            {viewMode === 'reserves' ? (
                <BenchArea teamId={id} reserves={team.reserves || []} onClose={() => setViewMode('main')} isFull={reservesFull} />
            ) : (
                <>
                    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-2 mt-1 px-0" onScroll={dispatchScrollEvent}>
                        {displayedPlayers.length === 0 ? (<div className="flex flex-col items-center justify-center py-8 opacity-60 border border-dashed border-slate-200 dark:border-white/5 rounded-xl bg-slate-50/50 dark:bg-white/[0.01]"><div className="p-2 bg-slate-100 dark:bg-white/5 rounded-full mb-2"><UserPlus size={20} className="text-slate-400" /></div><span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('teamManager.dragPlayersHere')}</span></div>) : (
                            <SortableContext items={displayedPlayers.map((p, idx) => (p.id && p.id.trim()) ? p.id : `player-safe-${idx}`)} strategy={verticalListSortingStrategy}>
                                <AnimatePresence initial={false}>
                                    {displayedPlayers.map((p, idx) => {
                                        const safeKey = (p.id && p.id.trim()) ? p.id : `player-safe-${idx}`;
                                        return (
                                            <PlayerListItem
                                                key={safeKey}
                                                player={p}
                                                locationId={id}
                                                isCompact={window.innerWidth < 640 && !isQueue}
                                            />
                                        );
                                    })}
                                </AnimatePresence>
                            </SortableContext>
                        )}
                    </motion.div>
                    <AddPlayerForm onAdd={handleAdd} disabled={mainRosterFull} />
                </>
            )}
        </div>
    );
});
