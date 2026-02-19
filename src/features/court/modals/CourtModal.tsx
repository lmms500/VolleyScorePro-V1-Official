
import React, { useState, useMemo } from 'react';
import { Modal } from '@ui/Modal';
import { Team, TeamId, SkillType, Player, ActionLog, GameConfig } from '@types';
import { VolleyballCourt } from '@features/court/components/VolleyballCourt';
import { X } from 'lucide-react';
import { useHaptics } from '@lib/haptics/useHaptics';
import { getCourtLayoutFromConfig } from '@config/gameModes';
import { DndContext, DragEndEvent, DragOverlay, useSensor, useSensors, MouseSensor, TouchSensor, closestCenter, DragStartEvent } from '@dnd-kit/core';
import { createPortal } from 'react-dom';
import { resolveTheme } from '@lib/utils/colors';
import { LayoutGroup } from 'framer-motion';
import { SubstitutionModal } from '@features/teams/modals/SubstitutionModal';
import { ScoutModal } from '@features/game/modals/ScoutModal';
import { CourtHeader } from '@features/court/components/CourtHeader';
import { CourtFooter } from '@features/court/components/CourtFooter';
import BeachSandTexture from '@features/court/components/BeachSandTexture';

interface CourtModalProps {
    isOpen: boolean;
    onClose: () => void;
    teamA: Team;
    teamB: Team;
    scoreA: number;
    scoreB: number;
    servingTeam: TeamId | null;
    onManualRotate: (teamId: string, direction: 'clockwise' | 'counter') => void;
    onAddPoint: (teamId: TeamId, playerId?: string, skill?: SkillType) => void;
    onSubtractPoint: (teamId: TeamId) => void;
    onMovePlayer: (teamId: string, indexA: number, indexB: number) => void;
    onSubstitute?: (teamId: string, pIn: string, pOut: string) => void;
    onTimeoutA?: () => void;
    onTimeoutB?: () => void;
    timeoutsA?: number;
    timeoutsB?: number;
    currentSet: number;
    setsA: number;
    setsB: number;
    isMatchPointA: boolean;
    isMatchPointB: boolean;
    isSetPointA: boolean;
    isSetPointB: boolean;
    isDeuce: boolean;
    inSuddenDeath: boolean;
    matchLog?: ActionLog[];
    config?: GameConfig;
    onOpenManager?: () => void;
    onOpenHistory?: () => void;
    onOpenSettings?: () => void;
    swappedSides?: boolean;
}

export const CourtModal: React.FC<CourtModalProps> = ({
    isOpen, onClose, teamA, teamB, scoreA, scoreB, servingTeam, onManualRotate, onAddPoint, onSubtractPoint, onMovePlayer, onSubstitute,
    onTimeoutA, onTimeoutB, timeoutsA, timeoutsB,
    currentSet, setsA, setsB, isMatchPointA, isMatchPointB, isSetPointA, isSetPointB, isDeuce, inSuddenDeath,
    matchLog, config, onOpenManager, onOpenHistory, onOpenSettings, swappedSides
}) => {
    const haptics = useHaptics();

    const [activeDragPlayer, setActiveDragPlayer] = useState<any>(null);
    const [activeDragTeamColor, setActiveDragTeamColor] = useState<string>('slate');
    const [isDragging, setIsDragging] = useState(false);
    const [subModalTeamId, setSubModalTeamId] = useState<string | null>(null);
    const [scoutModalState, setScoutModalState] = useState<{ isOpen: boolean, teamId: TeamId, preSelectedPlayerId: string | null }>({
        isOpen: false, teamId: 'A', preSelectedPlayerId: null
    });

    const sensors = useSensors(
        useSensor(MouseSensor, { activationConstraint: { distance: 10 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
    );

    const currentMVPId = useMemo(() => {
        if (!matchLog) return null;
        const points: Record<string, number> = {};
        let maxPoints = 0;
        let mvp = null;
        matchLog.forEach(log => {
            if (log.type === 'POINT' && log.playerId && log.playerId !== 'unknown') {
                points[log.playerId] = (points[log.playerId] || 0) + 1;
                if (log.skill === 'block' || log.skill === 'ace') points[log.playerId] += 0.5;
            }
        });
        for (const [pid, pts] of Object.entries(points)) {
            if (pts > maxPoints) { maxPoints = pts; mvp = pid; }
        }
        return mvp;
    }, [matchLog]);

    const handleDragStart = (event: DragStartEvent) => {
        haptics.impact('medium');
        const player = event.active.data.current?.player;
        const teamId = event.active.data.current?.teamId;
        setActiveDragPlayer(player);
        setIsDragging(true);
        if (teamId === 'A') setActiveDragTeamColor(teamA.color || 'indigo');
        else if (teamId === 'B') setActiveDragTeamColor(teamB.color || 'rose');
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveDragPlayer(null);
        setIsDragging(false);

        if (!over) return;

        const sourceData = active.data.current;
        const targetData = over.data.current;

        if (!sourceData || !targetData || sourceData.teamId !== targetData.teamId) {
            if (sourceData?.teamId !== targetData?.teamId) haptics.notification('error');
            return;
        }

        const teamId = sourceData.teamId;
        const targetTeam = teamId === 'A' ? teamA : teamB;
        const fromIndex = targetTeam.players.findIndex(p => p.id === active.id);
        const toIndex = targetData.index;

        if (fromIndex !== -1 && typeof toIndex === 'number' && fromIndex !== toIndex) {
            haptics.impact('heavy');
            onMovePlayer(teamId, fromIndex, toIndex);
        }
    };

    const handleScore = (teamId: TeamId, delta: number) => {
        haptics.impact('light');
        if (delta > 0) {
            if (config?.enablePlayerStats) setScoutModalState({ isOpen: true, teamId, preSelectedPlayerId: null });
            else onAddPoint(teamId);
        } else onSubtractPoint(teamId);
    };

    const handlePlayerClick = (player: Player, teamId: TeamId) => {
        haptics.impact('light');
        setScoutModalState({ isOpen: true, teamId, preSelectedPlayerId: player.id });
    };

    const handleScoutConfirm = (playerId: string, skill: SkillType) => {
        onAddPoint(scoutModalState.teamId, playerId, skill);
        setScoutModalState({ ...scoutModalState, isOpen: false });
    };

    const handleRotate = (teamId: string, direction: 'clockwise' | 'counter') => {
        haptics.impact('medium');
        onManualRotate(teamId, direction);
    };

    const handleSubstituteRequest = (teamId: string) => {
        haptics.impact('light');
        setSubModalTeamId(teamId);
    };

    const handleSubstitutionConfirm = (pIn: string, pOut: string) => {
        if (subModalTeamId && onSubstitute) onSubstitute(subModalTeamId, pIn, pOut);
    };

    // --- SWAP DISPLAY LOGIC ---
    // Mirrors the main scoreboard swap so the court view stays in sync.
    const swapped = swappedSides ?? false;
    const flipTeamId = (id: TeamId): TeamId => id === 'A' ? 'B' : 'A';

    const leftTeamId: TeamId  = swapped ? 'B' : 'A';
    const rightTeamId: TeamId = swapped ? 'A' : 'B';
    const leftTeam  = swapped ? teamB : teamA;
    const rightTeam = swapped ? teamA : teamB;
    const scoreLeft  = swapped ? scoreB : scoreA;
    const scoreRight = swapped ? scoreA : scoreB;
    const setsLeft   = swapped ? setsB  : setsA;
    const setsRight  = swapped ? setsA  : setsB;
    const timeoutsLeft  = swapped ? (timeoutsB ?? 0) : (timeoutsA ?? 0);
    const timeoutsRight = swapped ? (timeoutsA ?? 0) : (timeoutsB ?? 0);
    const isMatchPointLeft  = swapped ? isMatchPointB : isMatchPointA;
    const isMatchPointRight = swapped ? isMatchPointA : isMatchPointB;
    const isSetPointLeft    = swapped ? isSetPointB   : isSetPointA;
    const isSetPointRight   = swapped ? isSetPointA   : isSetPointB;
    const onTimeoutLeft  = swapped ? onTimeoutB : onTimeoutA;
    const onTimeoutRight = swapped ? onTimeoutA : onTimeoutB;

    let servingTeamDisplay: TeamId | null;
    if (!swapped || servingTeam === null) servingTeamDisplay = servingTeam;
    else servingTeamDisplay = flipTeamId(servingTeam);

    const handleScoreForDisplay = (visualId: TeamId, delta: number) => {
        handleScore(swapped ? flipTeamId(visualId) : visualId, delta);
    };

    const handleRotateForDisplay = (visualId: string, dir: 'clockwise' | 'counter') => {
        handleRotate(swapped ? flipTeamId(visualId as TeamId) : visualId, dir);
    };

    const handleSubstituteForDisplay = (visualId: string) => {
        handleSubstituteRequest(swapped ? flipTeamId(visualId as TeamId) : visualId);
    };

    const dragTheme = resolveTheme(activeDragTeamColor);
    const isBeach = config?.mode === 'beach';
    const courtBgClass = isBeach ? "bg-[#e3cba5]" : "bg-orange-500";

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="" variant="immersive" zIndex="z-[100]">
            {subModalTeamId && (
                <SubstitutionModal isOpen={!!subModalTeamId} onClose={() => setSubModalTeamId(null)} team={subModalTeamId === 'A' ? teamA : teamB} onConfirm={handleSubstitutionConfirm} zIndex="z-[110]" />
            )}
            <ScoutModal isOpen={scoutModalState.isOpen} onClose={() => setScoutModalState({ ...scoutModalState, isOpen: false })} team={scoutModalState.teamId === 'A' ? teamA : teamB} colorTheme={scoutModalState.teamId === 'A' ? teamA.color : teamB.color} onConfirm={handleScoutConfirm} initialPlayerId={scoutModalState.preSelectedPlayerId} zIndex="z-[110]" />

            <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
                <div className="relative w-full h-full text-slate-900 dark:text-white flex flex-col overflow-hidden select-none z-10">

                    <CourtHeader
                        teamA={leftTeam} teamB={rightTeam}
                        scoreA={scoreLeft} scoreB={scoreRight}
                        setsA={setsLeft} setsB={setsRight}
                        currentSet={currentSet} servingTeam={servingTeamDisplay}
                        timeoutsA={timeoutsLeft} timeoutsB={timeoutsRight}
                        onScore={handleScoreForDisplay}
                        onTimeoutA={onTimeoutLeft} onTimeoutB={onTimeoutRight}
                        isMatchPointA={isMatchPointLeft} isMatchPointB={isMatchPointRight}
                        isSetPointA={isSetPointLeft} isSetPointB={isSetPointRight}
                        isDeuce={isDeuce} inSuddenDeath={inSuddenDeath}
                    />

                    <button onClick={onClose} className="absolute top-safe-top right-4 z-[60] p-2 mt-2 rounded-full bg-gradient-to-br from-white to-slate-100 dark:from-slate-800 dark:to-slate-900 hover:from-white hover:to-white dark:hover:from-slate-700 dark:hover:to-slate-800 text-slate-500 dark:text-white transition-all backdrop-blur-md border border-white/20 shadow-lg ring-1 ring-inset ring-white/10 active:scale-95 pointer-events-auto"><X size={18} /></button>

                    <LayoutGroup id="court-modal-layout">
                        <div className="flex-1 flex items-center justify-center relative w-full min-h-0 py-2 overflow-visible">
                            <div className={`relative w-full max-w-4xl max-h-[58vh] aspect-[1.8/1] flex shadow-[0_25px_50px_rgba(0,0,0,0.4),inset_0_1px_0_0_rgba(255,255,255,0.15)] ring-1 ring-inset ring-white/10 rounded-3xl ${courtBgClass} dark:bg-slate-900/40 backdrop-blur-md border border-white/40 dark:border-white/10 p-0 mx-2 overflow-hidden`}>
                                <div className="absolute inset-0 z-0 rounded-3xl overflow-hidden">
                                    {isBeach ? (
                                        <BeachSandTexture />
                                    ) : (
                                        <>
                                            <div className="absolute inset-0 bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 dark:from-orange-500/20 dark:via-orange-600/10 dark:to-slate-900/60 mix-blend-normal dark:mix-blend-overlay" />
                                            <div className="absolute inset-0 opacity-10 bg-[url('/assets/wood-pattern.png')] mix-blend-multiply" />
                                        </>
                                    )}
                                </div>
                                <div className="absolute top-0 bottom-0 left-1/2 w-1 -ml-0.5 z-30 shadow-[0_0_15px_rgba(0,0,0,0.1)] pointer-events-none bg-white/60 dark:bg-white/20 backdrop-blur-sm border-l border-white/50" />
                                {/* key força unmount/remount quando o time muda, prevenindo animações cross-court do Framer Motion */}
                                <div key={`left-${leftTeamId}`} className="flex-1 h-full relative z-10">
                                    <VolleyballCourt players={leftTeam.players} color={leftTeam.color} isServing={servingTeam === leftTeamId} side="left" teamId={leftTeamId} variant="minimal" onPlayerClick={(p) => handlePlayerClick(p, leftTeamId)} mvpId={currentMVPId} layoutConfig={getCourtLayoutFromConfig(config || { mode: 'indoor' } as any)} isDragActive={isDragging} namePlacement="right" />
                                </div>
                                <div key={`right-${rightTeamId}`} className="flex-1 h-full relative z-10">
                                    <VolleyballCourt players={rightTeam.players} color={rightTeam.color} isServing={servingTeam === rightTeamId} side="right" teamId={rightTeamId} variant="minimal" onPlayerClick={(p) => handlePlayerClick(p, rightTeamId)} mvpId={currentMVPId} layoutConfig={getCourtLayoutFromConfig(config || { mode: 'indoor' } as any)} isDragActive={isDragging} namePlacement="left" />
                                </div>
                            </div>
                        </div>
                    </LayoutGroup>

                    <CourtFooter
                        teamA={leftTeam} teamB={rightTeam}
                        onRotate={handleRotateForDisplay}
                        onSubstituteRequest={handleSubstituteForDisplay}
                        onOpenManager={() => onOpenManager?.()}
                        onOpenHistory={() => onOpenHistory?.()}
                        onOpenSettings={() => onOpenSettings?.()}
                    />
                </div>

                {createPortal(
                    <DragOverlay dropAnimation={{ duration: 250, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)' }} zIndex={1000}>
                        {activeDragPlayer ? (
                            <div className="w-20 h-20 flex flex-col items-center justify-center pointer-events-none">
                                <div className={`w-16 h-16 rounded-full shadow-2xl flex items-center justify-center bg-gradient-to-br ${dragTheme.gradient.replace('/15', '').replace('to-transparent', 'to-black/20')} border-2 border-white/40 ring-4 ring-white/20 backdrop-blur-xl`}>
                                    <span className="text-2xl font-black text-white drop-shadow-md font-mono tracking-tighter">{activeDragPlayer.number || '#'}</span>
                                </div>
                            </div>
                        ) : null}
                    </DragOverlay>,
                    document.body
                )}
            </DndContext>
        </Modal>
    );
};