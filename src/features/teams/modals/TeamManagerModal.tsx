
import React, { useMemo, useCallback, memo, useRef, lazy, useEffect, Suspense } from 'react';
import { Modal } from '@ui/Modal';
import { Player, TeamColor, PlayerRole, PlayerProfile } from '@types';
import { List, Search, X, ListOrdered, Plus, Sparkles } from 'lucide-react';
import { DndContext, DragEndEvent, DragOverEvent, DragStartEvent, DragOverlay, closestCenter, useSensor, useSensors, KeyboardSensor, TouchSensor, MouseSensor } from '@dnd-kit/core';
import { useTranslation } from '@contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ProfileCreationModal } from './ProfileCreationModal';
import { ProfileDetailsModal } from './ProfileDetailsModal';
import { ConfirmationModal } from '@features/game/modals/ConfirmationModal';
import { useHaptics } from '@lib/haptics/useHaptics';
import { useTutorial } from '@features/tutorial/hooks/useTutorial';
import { getCourtLayoutFromConfig } from '@config/gameModes';
import { useActions, useRoster } from '@contexts/GameContext';
import { useRosterStore } from '@features/teams/store/rosterStore';
import { useNotification } from '@contexts/NotificationContext';

import { BatchInputSection } from '@features/teams/components/TeamManagerUI';
import { PlayerContextMenu } from '@features/teams/components/PlayerContextMenu';
import { ProfileCard } from '@features/teams/components/ProfileCard';
import { RosterBoard } from '@features/teams/components/RosterBoard';

const RichTutorialModal = lazy(() => import('@features/tutorial/modals/RichTutorialModal').then(m => ({ default: m.RichTutorialModal })));

const DragOverlayFixed = DragOverlay as any;

interface TeamManagerModalProps {
    isOpen: boolean;
    onClose: () => void;
    developerMode?: boolean;
    zIndex?: string;
}

const SCROLL_EVENT = 'team-manager-scroll';
const dispatchScrollEvent = () => { if (typeof globalThis !== 'undefined' && globalThis.window) globalThis.dispatchEvent(new Event(SCROLL_EVENT)); };

const TEST_NAMES = [
    'Lucas', 'Gabriel', 'Mateus', 'Enzo', 'Pedro', 'João', 'Felipe', 'Bruno',
    'Thiago', 'Nicolas', 'Arthur', 'Leo', 'Vitor', 'Caio', 'Daniel', 'Marcos',
    'Gustavo', 'Rafael', 'Diego', 'Rodrigo', 'Fernando', 'Ricardo', 'Andre', 'Luiz'
];

export const TeamManagerModal: React.FC<TeamManagerModalProps> = memo((props) => {
    const { t } = useTranslation();
    const { activeTutorial, triggerTutorial, completeTutorial, isLoaded } = useTutorial(false, props.developerMode);

    // Trigger tutorial when modal opens
    useEffect(() => {
        if (isLoaded && props.isOpen) {
            triggerTutorial('manager');
        }
    }, [isLoaded, props.isOpen, triggerTutorial]);

    // Data from Hooks
    const { teamARoster: courtA, teamBRoster: courtB, queue, profiles, config, hasDeletedPlayers, rotationMode } = useRoster();
    const {
        generateTeams, togglePlayerFixed, deletePlayer, movePlayer,
        undoRemovePlayer, balanceTeams,
        savePlayerToProfile, upsertProfile, toggleTeamBench, deleteProfile,
        addPlayer, resetRosters, setRotationMode
    } = useActions();
    const { showNotification } = useNotification();

    // Local State
    const [activePlayer, setActivePlayer] = React.useState<Player | null>(null);
    const [showHeader, setShowHeader] = React.useState(true);
    const [playerToDeleteId, setPlayerToDeleteId] = React.useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const lastScrollY = useRef(0);

    // Store Selectors
    const activeTab = useRosterStore(s => s.activeTab);
    const setActiveTab = useRosterStore(s => s.setActiveTab);
    const editingTarget = useRosterStore(s => s.editingTarget);
    const setEditingTarget = useRosterStore(s => s.setEditingTarget);
    const viewingProfileId = useRosterStore(s => s.viewingProfileId);
    const setViewingProfileId = useRosterStore(s => s.setViewingProfileId);
    const activePlayerMenu = useRosterStore(s => s.activePlayerMenu);
    const setActivePlayerMenu = useRosterStore(s => s.setActivePlayerMenu);
    const resetConfirmOpen = useRosterStore(s => s.resetConfirmOpen);
    const setResetConfirmOpen = useRosterStore(s => s.setResetConfirmOpen);
    const profileToDeleteId = useRosterStore(s => s.profileToDeleteId);
    const setProfileToDeleteId = useRosterStore(s => s.setProfileToDeleteId);
    const activateBenchConfirm = useRosterStore(s => s.activateBenchConfirm);
    const setActivateBenchConfirm = useRosterStore(s => s.setActivateBenchConfirm);
    const benchConfirmState = useRosterStore(s => s.benchConfirmState);
    const setBenchConfirmState = useRosterStore(s => s.setBenchConfirmState);
    const setDragOverContainerId = useRosterStore(s => s.setDragOverContainerId);

    const layout = getCourtLayoutFromConfig(config);
    const courtLimit = layout.playersOnCourt;
    const benchLimit = layout.benchLimit;

    if (!props.isOpen) return null;

    const onScroll = useCallback(() => {
        if (!scrollRef.current) return;
        const currentY = scrollRef.current.scrollTop;
        const diff = currentY - lastScrollY.current;
        if (currentY < 0) return;
        if (diff > 10 && showHeader && currentY > 50) setShowHeader(false);
        else if (diff < -5 && !showHeader) setShowHeader(true);
        lastScrollY.current = currentY;
        dispatchScrollEvent();
    }, [showHeader]);

    const generateRandomTestRoster = useCallback(() => {
        const shuffled = [...TEST_NAMES].sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, 12);
        const randomPlayers = selected.map(name => {
            const num = Math.floor(Math.random() * 99) + 1;
            const skill = Math.floor(Math.random() * 10) + 1;
            return `${num} ${name} ${skill}`;
        });
        generateTeams(randomPlayers);
        setActiveTab('roster');
        showNotification({
            mainText: t('teamManager.teamAdded'),
            type: 'success',
            subText: t('common.players') + ': 12'
        });
    }, [generateTeams, setActiveTab, showNotification, t]);


    const getTeamById = (id: string) => {
        if (id === courtA.id || id === `${courtA.id}_Reserves`) return courtA;
        if (id === courtB.id || id === `${courtB.id}_Reserves`) return courtB;
        const queueId = id.split('_')[0];
        return queue.find(t => t.id === queueId || t.id === id);
    };

    const playersById = useMemo(() => {
        const map = new Map<string, Player>();
        [courtA, courtB, ...queue].forEach(team => {
            team.players.forEach(p => map.set(p.id, p));
            team.reserves?.forEach(p => map.set(p.id, p));
        });
        return map;
    }, [courtA, courtB, queue]);

    // Wrapper Actions
    const wrappedAdd = useCallback((name: string, target: string, number?: string, skill?: number, profileId?: string) => {
        const result = addPlayer(name, target, number, skill, profileId);
        if (!result.success) {
            useHaptics().notification('error');
            showNotification({
                type: 'error',
                mainText: result.errorKey ? t(result.errorKey, result.errorParams) : (result.error || t('notifications.cannotAdd')),
                subText: t('notifications.uniqueConstraint')
            });
        }
        return result;
    }, [addPlayer, showNotification, t]);

    const handleDeleteWithUndo = useCallback((playerId: string) => {
        setPlayerToDeleteId(playerId);
        setActivePlayerMenu(null);
    }, [setActivePlayerMenu]);

    const executeProfileDelete = useCallback(() => {
        if (!profileToDeleteId) return;
        const profileId = profileToDeleteId;
        const deletedProfile = deleteProfile(profileId);
        if (deletedProfile) {
            const backup = { ...deletedProfile };
            showNotification({
                mainText: t('teamManager.playerRemoved'), type: 'info', subText: backup.name,
                onUndo: () => {
                    upsertProfile(backup.name, backup.skillLevel, backup.id, { number: backup.number, avatar: backup.avatar, role: backup.role });
                }
            });
        }
        setProfileToDeleteId(null);
    }, [deleteProfile, upsertProfile, t, showNotification, profileToDeleteId, setProfileToDeleteId]);

    // DRAG & DROP LOGIC
    const sensors = useSensors(
        useSensor(MouseSensor, { activationConstraint: { distance: 10 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 100, tolerance: 5 } }),
        useSensor(KeyboardSensor)
    );

    const handleDragStart = (event: DragStartEvent) => { setActivePlayer(playersById.get(event.active.id as string) || null); };
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
            if (oldIndex !== newIndex && newIndex !== undefined) movePlayer(activeId, sourceContainerId, targetContainerId, newIndex);
            return;
        }
        const targetTeamObj = getTeamById(targetContainerId);
        if (!targetTeamObj) return;
        const isTargetReserves = targetContainerId.endsWith('_Reserves');
        const targetList = isTargetReserves ? (targetTeamObj.reserves || []) : targetTeamObj.players;
        const targetLimit = isTargetReserves ? benchLimit : courtLimit;

        if (targetList.length >= targetLimit) {
            if (!isTargetReserves && targetTeamObj.hasActiveBench && (targetTeamObj.reserves || []).length < benchLimit) {
                movePlayer(activeId, sourceContainerId, `${targetTeamObj.id}_Reserves`);
                showNotification({ type: 'info', mainText: t('teamManager.movedToBench'), subText: t('teamManager.teamFullSub') });
            } else if (!isTargetReserves && !targetTeamObj.hasActiveBench) {
                setBenchConfirmState({ teamId: targetTeamObj.id, playerId: activeId, sourceId: sourceContainerId });
            } else {
                showNotification({ type: 'error', mainText: isTargetReserves ? t('teamManager.benchFull') : t('teamManager.rosterFull'), subText: isTargetReserves ? t('teamManager.benchFullSub') : t('teamManager.rosterFullSub') });
            }
            return;
        }
        const newIndex = over.data.current?.sortable?.index;
        movePlayer(activeId, sourceContainerId, targetContainerId, newIndex);
    };

    return (
        <Modal isOpen={props.isOpen} onClose={props.onClose} title="" showCloseButton={false} variant="immersive" zIndex={props.zIndex}>
            <Suspense fallback={null}>
                {activeTutorial === 'manager' && (<RichTutorialModal isOpen={true} tutorialKey="manager" onClose={completeTutorial} />)}
            </Suspense>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
                <div ref={scrollRef} onScroll={onScroll} className="h-full overflow-y-auto custom-scrollbar w-full max-w-6xl mx-auto render-crisp relative">

                    {/* STICKY HEADER - Otimizado para proximidade do notch */}
                    <div className="sticky top-0 z-50 pt-safe-top px-1 pointer-events-none">
                        <motion.div 
                            initial={false} 
                            animate={{ y: showHeader ? 0 : -100 }} 
                            transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }} 
                            style={{ transform: 'translateZ(0)', willChange: 'transform' }}
                            className={`bg-transparent pb-2 pt-2 px-2 pointer-events-auto relative z-50 transition-opacity duration-200 ${showHeader ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                        >
                            <div className="flex gap-2 mb-2">
                                <div className="flex flex-1 bg-white/40 dark:bg-white/5 backdrop-blur-xl rounded-2xl p-1.5 gap-1 border border-white/50 dark:border-white/5 ring-1 ring-inset ring-white/10 dark:ring-white/5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15)]">
                                    <button onClick={() => setActiveTab('roster')} className={`flex-1 py-2 px-2 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all active:scale-95 ${activeTab === 'roster' ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/30 ring-1 ring-inset ring-white/10' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-white/10'}`}><List size={14} /> {t('teamManager.tabs.roster')}</button>
                                    <button onClick={() => setActiveTab('profiles')} className={`flex-1 py-2 px-2 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all active:scale-95 ${activeTab === 'profiles' ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/30 ring-1 ring-inset ring-white/10' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-white/10'}`}><Search size={14} /> {t('teamManager.tabs.profiles')}</button>
                                    <button onClick={() => setActiveTab('input')} className={`flex-1 py-2 px-2 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all active:scale-95 ${activeTab === 'input' ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/30 ring-1 ring-inset ring-white/10' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-white/10'}`}><ListOrdered size={14} /> {t('teamManager.tabs.batch')}</button>
                                </div>
                                <button onClick={props.onClose} className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-full text-white active:scale-95 transition-all shadow-xl shadow-red-500/30 group/close"><X size={18} strokeWidth={3} className="group-hover/close:rotate-90 transition-transform duration-300" /></button>
                            </div>
                            {activeTab === 'roster' && (
                                <div className="flex justify-between items-center px-1">
                                    <div className="flex gap-2">
                                        <button onClick={() => setRotationMode('standard')} className={`px-3 py-1.5 rounded-xl text-[9px] font-bold uppercase border transition-all active:scale-95 ${rotationMode === 'standard' ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white border-indigo-400/20 shadow-lg shadow-indigo-500/30 ring-1 ring-inset ring-white/10' : 'bg-white/40 dark:bg-white/5 backdrop-blur-sm border-white/60 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-white/10'}`}>{t('teamManager.modes.standard')}</button>
                                        <button onClick={() => setRotationMode('balanced')} className={`px-3 py-1.5 rounded-xl text-[9px] font-bold uppercase border transition-all active:scale-95 ${rotationMode === 'balanced' ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-emerald-400/20 shadow-lg shadow-emerald-500/30 ring-1 ring-inset ring-white/10' : 'bg-white/40 dark:bg-white/5 backdrop-blur-sm border-white/60 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-white/10'}`}>{t('teamManager.modes.balanced')}</button>
                                        <button onClick={generateRandomTestRoster} className="px-3 py-1.5 rounded-xl text-[9px] font-bold uppercase border bg-amber-500/10 dark:bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition-all active:scale-95 flex items-center gap-1">
                                            <Sparkles size={10} strokeWidth={2.5} />
                                            {t('teamManager.actions.randomTest')}
                                        </button>
                                    </div>
                                    <div className={`flex gap-1`}>
                                        {hasDeletedPlayers && (<button onClick={undoRemovePlayer} className="flex items-center justify-center bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-white/60 dark:border-white/10 hover:bg-white/80 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 rounded-xl px-3 py-1.5 text-[9px] font-bold uppercase transition-all active:scale-95 ring-1 ring-inset ring-white/10 shadow-sm">{t('teamManager.undo')}</button>)}
                                        <button onClick={balanceTeams} className="flex items-center justify-center gap-1.5 bg-indigo-500/10 dark:bg-indigo-500/10 border border-indigo-200/80 dark:border-indigo-500/20 hover:bg-indigo-500/20 dark:hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-xl px-3 py-1.5 text-[9px] font-bold uppercase transition-all active:scale-95 ring-1 ring-inset ring-indigo-500/10">{rotationMode === 'balanced' ? t('teamManager.actions.globalBalance') : t('teamManager.actions.restoreOrder')}</button>
                                        <button onClick={() => setResetConfirmOpen(true)} className="flex items-center justify-center bg-rose-500/10 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-xl px-3 py-1.5 text-[9px] font-bold uppercase transition-all hover:bg-rose-500/20 border border-rose-500/20 dark:border-rose-500/15 ring-1 ring-inset ring-rose-500/10 shadow-sm active:scale-95">{t('teamManager.sort.reset')}</button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </div>

                    {/* CONTENT AREA - Gap mínimo do header */}
                    <div className="relative flex flex-col min-h-0 pt-1">
                        {activeTab === 'roster' && (
                            <div className="px-1 pb-32">
                                <RosterBoard courtLimit={courtLimit} benchLimit={benchLimit} />
                            </div>
                        )}

                        {activeTab === 'profiles' && (
                            <div className="p-2 pb-24 space-y-4">
                                <button onClick={() => setEditingTarget({ type: 'profile', id: 'new' })} className="w-full py-6 border-2 border-dashed border-slate-300/60 dark:border-white/10 rounded-2xl flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-indigo-500 hover:border-indigo-400/60 hover:bg-indigo-50/50 dark:hover:bg-indigo-500/10 transition-all group bg-white/40 dark:bg-white/[0.01] backdrop-blur-sm active:scale-95"><div className="p-3 rounded-xl bg-white/60 dark:bg-white/5 border border-white/60 dark:border-white/10 ring-1 ring-inset ring-white/10 shadow-sm group-hover:bg-gradient-to-br group-hover:from-indigo-500 group-hover:to-indigo-600 group-hover:text-white group-hover:border-indigo-400/20 group-hover:shadow-lg group-hover:shadow-indigo-500/30 transition-all"><Plus size={24} /></div><span className="text-xs font-bold uppercase tracking-widest">{t('profile.create')}</span></button>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {Array.from(profiles.values()).length === 0 ? (<div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-400 italic gap-3 opacity-60"><p className="text-sm font-medium">{t('teamManager.profiles.empty')}</p></div>) : (
                                        Array.from(profiles.values()).map((profile: PlayerProfile, idx: number) => {
                                            const safeProfileKey = (profile.id && profile.id.trim()) ? profile.id : `profile-safe-${idx}`;
                                            let status: any = null; let teamColor: TeamColor | undefined = undefined;
                                            if (courtA.players.some(p => p.profileId === profile.id)) { status = 'A'; teamColor = courtA.color; }
                                            else if (courtA.reserves?.some(p => p.profileId === profile.id)) { status = 'A_Bench'; teamColor = courtA.color; }
                                            else if (courtB.players.some(p => p.profileId === profile.id)) { status = 'B'; teamColor = courtB.color; }
                                            else if (courtB.reserves?.some(p => p.profileId === profile.id)) { status = 'B_Bench'; teamColor = courtB.color; }
                                            else { for (const t of queue) { if (t.players.some(p => p.profileId === profile.id)) { status = 'Queue'; teamColor = t.color; break; } if (t.reserves?.some(p => p.profileId === profile.id)) { status = 'Queue_Bench'; teamColor = t.color; break; } } }
                                            const placementOptions: any[] = [];
                                            if (!status) {
                                                if (courtA.players.length < courtLimit) placementOptions.push({ label: t('teamManager.actions.addTo') + ' ' + courtA.name, targetId: courtA.id, type: 'main', teamColor: courtA.color });
                                                else if (courtA.hasActiveBench && (courtA.reserves || []).length < benchLimit) placementOptions.push({ label: t('teamManager.actions.addTo') + ' ' + courtA.name + ' (' + t('teamManager.benchLabel') + ')', targetId: `${courtA.id}_Reserves`, type: 'bench', teamColor: courtA.color });
                                                if (courtB.players.length < courtLimit) placementOptions.push({ label: t('teamManager.actions.addTo') + ' ' + courtB.name, targetId: courtB.id, type: 'main', teamColor: courtB.color });
                                                else if (courtB.hasActiveBench && (courtB.reserves || []).length < benchLimit) placementOptions.push({ label: t('teamManager.actions.addTo') + ' ' + courtB.name + ' (' + t('teamManager.benchLabel') + ')', targetId: `${courtB.id}_Reserves`, type: 'bench', teamColor: courtB.color });
                                                placementOptions.push({ label: t('teamManager.actions.addToQueue'), targetId: 'Queue', type: 'queue' });
                                            }
                                            return (<ProfileCard key={safeProfileKey} profile={profile} onDelete={() => setProfileToDeleteId(profile.id)} onAddToGame={(target: string, prof: PlayerProfile) => wrappedAdd(prof.name, target, prof.number, prof.skillLevel, prof.id)} status={status} onEdit={() => setEditingTarget({ type: 'profile', id: profile.id })} placementOptions={placementOptions} onView={() => setViewingProfileId(profile.id)} teamColor={teamColor} onShowToast={(m, t, s) => showNotification({ mainText: m, type: t, subText: s })} />);
                                        })
                                    )}
                                </div>
                            </div>
                        )}
                        {activeTab === 'input' && <BatchInputSection onGenerate={(names) => { generateTeams(names); setActiveTab('roster'); }} />}
                    </div>
                </div>

                <DragOverlayFixed dropAnimation={{ duration: 250, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)' }}>
                    {activePlayer ? (
                        <div className="w-full">
                            <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border border-indigo-400/50 dark:border-indigo-500/30 shadow-[0_25px_50px_-12px_rgba(99,102,241,0.3),inset_0_1px_0_0_rgba(255,255,255,0.15)] ring-2 ring-indigo-500/20 rounded-2xl flex items-center justify-between py-1.5 px-2.5 min-h-[50px]">
                                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center font-bold text-xs text-white shadow-sm shadow-indigo-500/30">{activePlayer.number || '#'}</div>
                                <span className="font-bold ml-2">{activePlayer.name}</span>
                            </div>
                        </div>
                    ) : null}
                </DragOverlayFixed>

                {editingTarget && (
                    <ProfileCreationModal
                        isOpen={true} onClose={() => setEditingTarget(null)} title={editingTarget.id === 'new' ? t('profile.createTitle') : t('profile.editTitle')}
                        initialName={editingTarget.type === 'player' ? playersById.get(editingTarget.id)?.name || '' : profiles.get(editingTarget.id)?.name || ''}
                        initialNumber={editingTarget.type === 'player' ? playersById.get(editingTarget.id)?.number || '' : profiles.get(editingTarget.id)?.number || ''}
                        initialSkill={editingTarget.type === 'player' ? playersById.get(editingTarget.id)?.skillLevel : profiles.get(editingTarget.id)?.skillLevel}
                        initialRole={editingTarget.type === 'player' ? playersById.get(editingTarget.id)?.role : profiles.get(editingTarget.id)?.role}
                        initialAvatar={editingTarget.type === 'profile' ? profiles.get(editingTarget.id)?.avatar : (
                            playersById.get(editingTarget.id)?.profileId ? profiles.get(playersById.get(editingTarget.id)?.profileId!)?.avatar : undefined
                        )}
                        onSave={(name: string, num: string, av: string, sk: number, role: PlayerRole) => {
                            const target = editingTarget; if (!target) return;
                            if (target.type === 'player') {
                                const result = savePlayerToProfile(target.id, { name, number: num, avatar: av, skill: sk, role });
                                if (result && !result.success) { showNotification({ mainText: result.errorKey ? t(result.errorKey) : t('notifications.saveFailed'), type: 'error', subText: t('notifications.numberConflict') }); return; }
                            } else { upsertProfile(name, sk, target.id === 'new' ? undefined : target.id, { number: num, avatar: av, role }); }
                            setEditingTarget(null);
                        }}
                    />
                )}

                {viewingProfileId && (<ProfileDetailsModal isOpen={true} onClose={() => setViewingProfileId(null)} profileId={viewingProfileId} profiles={profiles} onEdit={() => { const id = viewingProfileId!; setViewingProfileId(null); setEditingTarget({ type: 'profile', id }); }} />)}

                <ConfirmationModal isOpen={!!activateBenchConfirm} onClose={() => setActivateBenchConfirm(null)} title={t('teamManager.activateBenchTitle')} message={t('teamManager.activateBenchMsg')} confirmLabel={t('teamManager.btnActivateBench')} onConfirm={() => { if (activateBenchConfirm) { toggleTeamBench(activateBenchConfirm.teamId); movePlayer(activateBenchConfirm.playerId, activateBenchConfirm.fromId, `${activateBenchConfirm.teamId}_Reserves`); } }} />
                <ConfirmationModal isOpen={!!benchConfirmState} onClose={() => setBenchConfirmState(null)} title={t('teamManager.activateBenchTitle')} message={t('teamManager.activateBenchMsg')} confirmLabel={t('teamManager.btnActivateBench')} onConfirm={() => { if (benchConfirmState) { toggleTeamBench(benchConfirmState.teamId); movePlayer(benchConfirmState.playerId, benchConfirmState.sourceId, `${benchConfirmState.teamId}_Reserves`); } }} />
                <ConfirmationModal isOpen={resetConfirmOpen} onClose={() => setResetConfirmOpen(false)} onConfirm={() => { resetRosters(); }} title={t('confirm.reset.title')} message={t('confirm.reset.message')} confirmLabel={t('confirm.reset.confirmButton')} icon={X} />
                <ConfirmationModal isOpen={!!profileToDeleteId} onClose={() => setProfileToDeleteId(null)} onConfirm={executeProfileDelete} title={t('confirm.deleteProfile')} message={t('confirm.deleteProfileMsg')} confirmLabel={t('teamManager.menu.delete')} icon={X} />
                <ConfirmationModal
                    isOpen={!!playerToDeleteId}
                    onClose={() => setPlayerToDeleteId(null)}
                    title={t('teamManager.removePlayer') || 'Remove Player'}
                    message={t('teamManager.confirmRemovePlayer') || 'Are you sure you want to remove this player from the team?'}
                    confirmLabel={t('common.yes') || 'Yes'}
                    onConfirm={() => {
                        if (playerToDeleteId) {
                            let player: Player | undefined;
                            const findIn = (list: Player[]) => list.find(p => p.id === playerToDeleteId);
                            player = findIn(courtA.players) || findIn(courtA.reserves || []) || findIn(courtB.players) || findIn(courtB.reserves || []) || queue.flatMap(t => [...t.players, ...(t.reserves || [])]).find(p => p.id === playerToDeleteId);
                            deletePlayer(playerToDeleteId);
                            if (player) {
                                showNotification({ mainText: t('teamManager.playerRemoved'), type: 'info', subText: player.name, onUndo: undoRemovePlayer });
                            }
                        }
                        setPlayerToDeleteId(null);
                    }}
                />

                <AnimatePresence>
                    {activePlayerMenu && (
                        <PlayerContextMenu activePlayerMenu={activePlayerMenu} courtA={courtA} courtB={courtB} queue={queue} onToggleFixed={togglePlayerFixed} onRemove={handleDeleteWithUndo} toggleTeamBench={toggleTeamBench} onMove={movePlayer} handleTogglePlayerMenu={(id, target) => setActivePlayerMenu(target ? { playerId: id, rect: target.getBoundingClientRect() } : null)} t={t} setActivateBenchConfirm={setActivateBenchConfirm} />
                    )}
                </AnimatePresence>
            </DndContext>
        </Modal>
    );
});