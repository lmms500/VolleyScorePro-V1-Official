import React, { useState, useMemo, useCallback } from 'react';
import { Team, TeamId, SkillType, Player, ActionLog, GameConfig } from '@types';
import { VolleyballCourt } from '@features/court/components/VolleyballCourt';
import { useHaptics } from '@lib/haptics/useHaptics';
import { getCourtLayoutFromConfig } from '@config/gameModes';
import { DndContext, DragEndEvent, DragOverlay, useSensor, useSensors, MouseSensor, TouchSensor, closestCenter, DragStartEvent, DragCancelEvent } from '@dnd-kit/core';
import { createPortal } from 'react-dom';
import { resolveTheme } from '@lib/utils/colors';
import { LayoutGroup, motion } from 'framer-motion';
import { SubstitutionModal } from '@features/teams/modals/SubstitutionModal';
import { ScoutModal } from '@features/game/modals/ScoutModal';
import { CourtHeader } from '@features/court/components/CourtHeader';
import { CourtFooter } from '@features/court/components/CourtFooter';
import BeachSandTexture from '@features/court/components/BeachSandTexture';
import { useElementSize } from '@features/game/hooks/useElementSize';
import { autoPositionPlayersByRole } from '@lib/utils/courtPositioning';

interface CourtLayoutProps {
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

    /** 'modal' = full features, 'inline' = hides nav buttons, reports drag state */
    variant: 'modal' | 'inline';

    /** Only used when variant='modal' */
    onOpenManager?: () => void;
    onOpenHistory?: () => void;
    onOpenSettings?: () => void;

    /** Called when drag state changes (for swipe lock in inline mode) */
    onDragActiveChange?: (isDragging: boolean) => void;

    /** Rotation applied to player name labels (e.g., -90 for inline portrait) */
    nameRotation?: number;

    /** Rotation applied to the court visualization only (not header/footer). E.g., 90 for portrait inline. */
    courtRotation?: number;

    /** Mirrors team display to match the main scoreboard swap state. */
    swappedSides?: boolean;
}

export const CourtLayout: React.FC<CourtLayoutProps> = ({
    teamA, teamB, scoreA, scoreB, servingTeam, onManualRotate, onAddPoint, onSubtractPoint, onMovePlayer, onSubstitute,
    onTimeoutA, onTimeoutB, timeoutsA, timeoutsB,
    currentSet, setsA, setsB, isMatchPointA, isMatchPointB, isSetPointA, isSetPointB, isDeuce, inSuddenDeath,
    matchLog, config, variant, onOpenManager, onOpenHistory, onOpenSettings, onDragActiveChange, nameRotation, courtRotation,
    swappedSides
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

    const handleDragStart = useCallback((event: DragStartEvent) => {
        haptics.impact('medium');
        const player = event.active.data.current?.player;
        const teamId = event.active.data.current?.teamId;
        setActiveDragPlayer(player);
        setIsDragging(true);
        if (teamId === 'A') setActiveDragTeamColor(teamA.color || 'indigo');
        else if (teamId === 'B') setActiveDragTeamColor(teamB.color || 'rose');
        onDragActiveChange?.(true);
    }, [haptics, teamA.color, teamB.color, onDragActiveChange]);

    const handleDragEnd = useCallback((event: DragEndEvent) => {
        const { active, over } = event;
        setActiveDragPlayer(null);
        setIsDragging(false);
        onDragActiveChange?.(false);

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
    }, [haptics, teamA, teamB, onMovePlayer, onDragActiveChange]);

    const handleDragCancel = useCallback((_event: DragCancelEvent) => {
        setActiveDragPlayer(null);
        setIsDragging(false);
        onDragActiveChange?.(false);
    }, [onDragActiveChange]);

    const handleScore = useCallback((teamId: TeamId, delta: number) => {
        haptics.impact('light');
        if (delta > 0) {
            if (config?.enablePlayerStats) setScoutModalState({ isOpen: true, teamId, preSelectedPlayerId: null });
            else onAddPoint(teamId);
        } else onSubtractPoint(teamId);
    }, [haptics, config?.enablePlayerStats, onAddPoint, onSubtractPoint]);

    const handlePlayerClick = useCallback((player: Player, teamId: TeamId) => {
        haptics.impact('light');
        setScoutModalState({ isOpen: true, teamId, preSelectedPlayerId: player.id });
    }, [haptics]);

    const handleScoutConfirm = useCallback((playerId: string, skill: SkillType) => {
        onAddPoint(scoutModalState.teamId, playerId, skill);
        setScoutModalState(prev => ({ ...prev, isOpen: false }));
    }, [onAddPoint, scoutModalState.teamId]);

    const handleRotate = useCallback((teamId: string, direction: 'clockwise' | 'counter') => {
        haptics.impact('medium');
        onManualRotate(teamId, direction);
    }, [haptics, onManualRotate]);


    const handleSubstituteRequest = useCallback((teamId: string) => {
        haptics.impact('light');
        setSubModalTeamId(teamId);
    }, [haptics]);

    const handleSubstitutionConfirm = useCallback((pIn: string, pOut: string) => {
        if (subModalTeamId && onSubstitute) onSubstitute(subModalTeamId, pIn, pOut);
    }, [subModalTeamId, onSubstitute]);

    // --- SWAP DISPLAY LOGIC ---
    const swapped = swappedSides ?? false;
    const leftTeamId: TeamId = swapped ? 'B' : 'A';
    const rightTeamId: TeamId = swapped ? 'A' : 'B';
    const leftTeam = swapped ? teamB : teamA;
    const rightTeam = swapped ? teamA : teamB;
    const scoreLeft = swapped ? scoreB : scoreA;
    const scoreRight = swapped ? scoreA : scoreB;
    const setsLeft = swapped ? setsB : setsA;
    const setsRight = swapped ? setsA : setsB;
    const timeoutsLeft = swapped ? (timeoutsB ?? 0) : (timeoutsA ?? 0);
    const timeoutsRight = swapped ? (timeoutsA ?? 0) : (timeoutsB ?? 0);
    const isMatchPointLeft = swapped ? isMatchPointB : isMatchPointA;
    const isMatchPointRight = swapped ? isMatchPointA : isMatchPointB;
    const isSetPointLeft = swapped ? isSetPointB : isSetPointA;
    const isSetPointRight = swapped ? isSetPointA : isSetPointB;
    const onTimeoutLeft = swapped ? onTimeoutB : onTimeoutA;
    const onTimeoutRight = swapped ? onTimeoutA : onTimeoutB;
    const servingTeamDisplay: TeamId | null = swapped
        ? (servingTeam === 'A' ? 'B' : servingTeam === 'B' ? 'A' : null)
        : servingTeam;

    // Auto-position players: reorders the team's array to match standard rotation positions
    // Must be declared after `swapped` so it can resolve visual → actual teamId correctly
    const handleAutoPosition = useCallback((teamId: string) => {
        const actualTeamId = swapped ? (teamId === 'A' ? 'B' : 'A') : teamId;
        const team = actualTeamId === 'A' ? teamA : teamB;
        const layout = getCourtLayoutFromConfig(config || { mode: 'indoor' } as any);
        const playersOnCourt = layout.playersOnCourt;

        if (playersOnCourt !== 6) return;

        const currentPlayers = team.players.slice(0, playersOnCourt);
        const reordered = autoPositionPlayersByRole(currentPlayers, playersOnCourt);

        // Bubble-sort-style sequential swaps to move each player to their target slot
        const arr = [...currentPlayers];
        for (let targetIdx = 0; targetIdx < reordered.length; targetIdx++) {
            const targetPlayer = reordered[targetIdx];
            const currentIdx = arr.findIndex(p => p.id === targetPlayer.id);
            if (currentIdx !== targetIdx) {
                const tmp = arr[currentIdx];
                arr[currentIdx] = arr[targetIdx];
                arr[targetIdx] = tmp;
                onMovePlayer(actualTeamId, currentIdx, targetIdx);
            }
        }
        haptics.impact('heavy');
    }, [swapped, teamA, teamB, config, onMovePlayer, haptics]);

    const handleScoreForDisplay = useCallback((visualId: TeamId, delta: number) => {
        const actual = swapped ? (visualId === 'A' ? 'B' : 'A') as TeamId : visualId;
        handleScore(actual, delta);
    }, [swapped, handleScore]);

    const handleRotateForDisplay = useCallback((visualId: string, dir: 'clockwise' | 'counter') => {
        const actual = swapped ? (visualId === 'A' ? 'B' : 'A') : visualId;
        handleRotate(actual, dir);
    }, [swapped, handleRotate]);

    const handleSubstituteForDisplay = useCallback((visualId: string) => {
        const actual = swapped ? (visualId === 'A' ? 'B' : 'A') : visualId;
        handleSubstituteRequest(actual);
    }, [swapped, handleSubstituteRequest]);

    const dragTheme = resolveTheme(activeDragTeamColor);
    const isBeach = config?.mode === 'beach';
    const courtBgClass = isBeach ? "bg-[#e3cba5]" : "bg-orange-500";
    const isInline = variant === 'inline';

    // Check if we are in a vertical/portrait mode (approx 90 or -90 deg, or 270)
    // We treat anything close to +/- 90 as portrait.
    const isVertical = courtRotation === 90 || courtRotation === -90 || courtRotation === 270 || courtRotation === -270;

    // Standard courtelement (shared between rotated and non-rotated)
    const courtVisualization = (
        <div className={`
            relative flex rounded-3xl ${courtBgClass} dark:bg-slate-900/40 backdrop-blur-md border border-white/40 dark:border-white/10 p-0 overflow-hidden shadow-[0_20px_50px_-12px_rgba(0,0,0,0.25),inset_0_1px_0_0_rgba(255,255,255,0.15)] ring-1 ring-inset ring-white/10
            ${isVertical
                ? 'h-full max-h-full w-auto max-w-full aspect-[1/1.8] flex-col mx-auto'
                : 'w-full max-w-4xl max-h-[58vh] aspect-[1.8/1] flex-row mx-2'
            }
        `}>
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

            {/* Net / Center Line */}
            <div className={`
                absolute z-30 shadow-[0_0_15px_rgba(0,0,0,0.1)] pointer-events-none bg-white/60 dark:bg-white/20 backdrop-blur-sm 
                ${isVertical
                    ? 'left-0 right-0 top-1/2 h-1 -mt-0.5 border-t border-white/50'
                    : 'top-0 bottom-0 left-1/2 w-1 -ml-0.5 border-l border-white/50'
                }
            `} />

            {/* key removed: cross-court animations are now prevented by layoutId prefixing in VolleyballCourt, allowing instant swaps without DOM destruction */}
            <div className="flex-1 relative z-10 w-full h-full">
                <VolleyballCourt
                    players={leftTeam.players}
                    color={leftTeam.color}
                    isServing={servingTeam === leftTeamId}
                    side="left"
                    teamId={leftTeamId}
                    variant="minimal"
                    onPlayerClick={(p) => handlePlayerClick(p, leftTeamId)}
                    mvpId={currentMVPId}
                    layoutConfig={getCourtLayoutFromConfig(config || { mode: 'indoor' } as any)}
                    isDragActive={isDragging}
                    nameRotation={isVertical ? 0 : nameRotation}
                    namePlacement={variant === 'modal' ? 'right' : 'auto'}
                    orientation={isVertical ? 'portrait' : 'landscape'}
                />
            </div>
            <div className="flex-1 relative z-10 w-full h-full">
                <VolleyballCourt
                    players={rightTeam.players}
                    color={rightTeam.color}
                    isServing={servingTeam === rightTeamId}
                    side="right"
                    teamId={rightTeamId}
                    variant="minimal"
                    onPlayerClick={(p) => handlePlayerClick(p, rightTeamId)}
                    mvpId={currentMVPId}
                    layoutConfig={getCourtLayoutFromConfig(config || { mode: 'indoor' } as any)}
                    isDragActive={isDragging}
                    nameRotation={isVertical ? 0 : nameRotation}
                    namePlacement={variant === 'modal' ? 'right' : 'auto'}
                    orientation={isVertical ? 'portrait' : 'landscape'}
                />
            </div>
        </div>
    );

    return (
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDragCancel={handleDragCancel} collisionDetection={closestCenter}>
            {subModalTeamId && (
                <SubstitutionModal isOpen={!!subModalTeamId} onClose={() => setSubModalTeamId(null)} team={subModalTeamId === 'A' ? teamA : teamB} onConfirm={handleSubstitutionConfirm} zIndex="z-[110]" />
            )}
            <ScoutModal isOpen={scoutModalState.isOpen} onClose={() => setScoutModalState(prev => ({ ...prev, isOpen: false }))} team={scoutModalState.teamId === 'A' ? teamA : teamB} colorTheme={scoutModalState.teamId === 'A' ? teamA.color : teamB.color} onConfirm={handleScoutConfirm} initialPlayerId={scoutModalState.preSelectedPlayerId} zIndex="z-[110]" />

            <div className="relative w-full h-full text-slate-900 dark:text-white flex flex-col overflow-visible select-none z-10">
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
                    compact={isInline}
                />


                <div className={`flex-1 flex items-center justify-center relative w-full min-h-0 overflow-visible ${isInline ? 'py-0' : 'py-2'}`}>
                    <LayoutGroup id="court-layout">
                        {courtVisualization}
                    </LayoutGroup>
                </div>


                <CourtFooter
                    teamA={leftTeam} teamB={rightTeam}
                    onRotate={handleRotateForDisplay}
                    onSubstituteRequest={handleSubstituteForDisplay}
                    onAutoPosition={handleAutoPosition}
                    hideNavButtons={isInline}
                    onOpenManager={isInline ? undefined : () => onOpenManager?.()}
                    onOpenHistory={isInline ? undefined : () => onOpenHistory?.()}
                    onOpenSettings={isInline ? undefined : () => onOpenSettings?.()}
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
    );
};
