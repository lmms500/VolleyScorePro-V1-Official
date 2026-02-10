
import React, { memo, useCallback } from 'react';
import { Player, TeamColor, CourtLayoutConfig } from '../../types';
import { resolveTheme } from '../../utils/colors';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { motion } from 'framer-motion';
import { isEmptySlot } from '../../config/gameModes';

interface VolleyballCourtProps {
    players: Player[];
    color: TeamColor;
    isServing: boolean;
    side: 'left' | 'right';
    teamId: string;
    variant?: 'full' | 'minimal';
    onPlayerClick?: (player: Player) => void;
    mvpId?: string | null;
    layoutConfig: CourtLayoutConfig;
    isDragActive?: boolean;
}

// --- 1. THE DROP ZONE (Glass Slot) ---
const ZoneMarker = memo(({ index, visualZone, teamId }: { index: number, visualZone: string | number, teamId: string, isActive: boolean }) => {
    const { setNodeRef, isOver } = useDroppable({
        id: `${teamId}-zone-${index}`,
        data: { index, teamId, type: 'zone' }
    });

    return (
        <div
            ref={setNodeRef}
            className={`
                absolute inset-0 flex items-center justify-center rounded-2xl transition-all duration-300
                ${isOver ? 'bg-white/30 ring-4 ring-white/60 scale-105 shadow-[0_0_25px_rgba(255,255,255,0.5)] z-10 backdrop-blur-sm' : 'opacity-0'}
            `}
        >
            <span className="text-[80px] font-black text-white/10 select-none">{visualZone}</span>
        </div>
    );
});

// --- 2. THE PLAYER TOKEN (NeoGlass Jewel) ---
const DraggablePlayer = memo(({ player, index, teamId, theme, isServer, onActivate, isMVP, isGlobalDragging }: { player: Player, index: number, teamId: string, theme: any, isServer: boolean, onActivate?: (player: Player) => void, isMVP: boolean, isGlobalDragging: boolean }) => {
    // Draggable Logic Only (Collision handled by ZoneMarker underneath)
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: player.id,
        data: { index, teamId, player, type: 'player' }
    });

    const handleClick = (e: React.MouseEvent) => {
        if (onActivate && !isDragging) {
            e.stopPropagation();
            onActivate(player);
        }
    };

    return (
        <motion.div
            layoutId={player.id}
            layout="position"
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            onClick={handleClick}
            className={`
                relative w-10 h-10 sm:w-12 sm:h-12 flex flex-col items-center justify-center touch-none cursor-grab active:cursor-grabbing z-20
                ${isDragging ? 'opacity-0' : 'opacity-100'}
                ${isGlobalDragging ? 'pointer-events-none' : 'pointer-events-auto'}
            `}
            style={{
                touchAction: 'none'
            }}
        >
            {isServer && (
                <motion.div
                    layoutId={`serve-ring-${teamId}`}
                    className="absolute -inset-1.5 rounded-full border-2 border-dashed border-amber-400/80 animate-[spin_8s_linear_infinite]"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
            )}

            {isMVP && (
                <div className="absolute inset-0 rounded-full shadow-[0_0_20px_rgba(251,191,36,0.8)] ring-2 ring-amber-400/80 animate-pulse z-0" />
            )}

            <div className={`
                w-full h-full rounded-full shadow-2xl flex items-center justify-center relative overflow-hidden z-10
                bg-gradient-to-br ${theme.gradient.replace('/15', '/90').replace('to-transparent', 'to-black/40')}
                border border-white/30
                ring-1 ring-black/20
                ${isMVP ? 'border-amber-400/50' : ''}
            `}>
                <div className="absolute inset-x-0 top-0 h-[45%] bg-gradient-to-b from-white/40 to-transparent pointer-events-none rounded-t-full" />
                <span className={`text-base sm:text-lg font-black ${isMVP ? 'text-amber-100' : 'text-white'} drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] z-10 font-mono tracking-tighter`}>
                    {player.number || '#'}
                </span>
            </div>

            <div className={`absolute -bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-md px-2 py-0.5 rounded-full border shadow-xl max-w-[200%] ${isMVP ? 'border-amber-500/50' : 'border-white/10'}`}>
                <span className={`text-[8px] font-bold uppercase tracking-wider block truncate text-center max-w-[70px] ${isMVP ? 'text-amber-400' : 'text-slate-200'}`}>
                    {player.name}
                </span>
            </div>
        </motion.div>
    );
});

export const VolleyballCourt: React.FC<VolleyballCourtProps> = ({
    players, color, isServing, side, teamId, variant = 'full', onPlayerClick, mvpId, layoutConfig, isDragActive = false
}) => {
    const theme = resolveTheme(color);

    // Stable handler for player activation (avoids inline arrow function in render)
    const handlePlayerActivate = useCallback((player: Player) => {
        if (onPlayerClick) {
            onPlayerClick(player);
        }
    }, [onPlayerClick]);
    const isMinimal = variant === 'minimal';

    // Determines if we should show beach style (≤ 4 players) or indoor style (> 4 players)
    const isBeachStyle = layoutConfig.playersOnCourt <= 4;

    const slotCount = layoutConfig.playersOnCourt;
    const slots = new Array(slotCount).fill(null);
    players.slice(0, slotCount).forEach((p, i) => { slots[i] = p; });

    // Grid order comes directly from layoutConfig
    const gridOrder = side === 'left'
        ? layoutConfig.gridOrderLeft
        : layoutConfig.gridOrderRight;

    // Dynamic grid rows - using explicit classes for Tailwind
    const gridRowsClass = layoutConfig.gridRows === 1 ? 'grid-rows-1'
                        : layoutConfig.gridRows === 2 ? 'grid-rows-2'
                        : 'grid-rows-3';

    const gridColsClass = layoutConfig.gridCols === 3 ? 'grid-cols-3' : 'grid-cols-2';

    const lineColor = isBeachStyle ? 'border-blue-900/30' : 'border-white/80';

    // Standard Orange for Indoor, Sand for Beach
    const courtColorClass = isBeachStyle ? 'bg-[#e3cba5]' : 'bg-orange-500';

    return (
        <div className={`w-full h-full relative ${isMinimal ? '' : 'p-2 sm:p-4'} flex items-center justify-center`}>

            {!isMinimal && (
                <div className={`absolute inset-0 rounded-[2rem] overflow-hidden shadow-inner border-4 border-white/10 transition-colors duration-300 ${courtColorClass}`}>
                    {isBeachStyle && <div className="absolute inset-0 opacity-20 mix-blend-multiply" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/sand.png')" }} />}
                    {!isBeachStyle && <div className="absolute inset-0 opacity-10 mix-blend-multiply" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/wood-pattern.png')" }} />}
                </div>
            )}

            {/* Court Lines */}
            <div className={`
                absolute ${isMinimal ? 'inset-0' : 'inset-4'} border-[6px] ${lineColor}
                ${!isMinimal ? 'rounded-xl shadow-lg' : ''}
                ${side === 'left' ? 'border-r-0 rounded-l-[1.2rem]' : 'border-l-0 rounded-r-[1.2rem]'}
            `}>
                {!isBeachStyle && (
                    <div className={`absolute top-0 bottom-0 w-1 bg-white/60 ${side === 'left' ? 'right-[33%]' : 'left-[33%]'}`} />
                )}
            </div>

            {/* Players Grid */}
            <div className={`
                relative z-10 w-full h-full grid gap-2 ${gridRowsClass} ${gridColsClass}
                ${side === 'left' ? 'pr-8 pl-4' : 'pl-8 pr-4'}
            `}>
                {gridOrder.map((arrayIndex, gridPosition) => {
                    // Check for empty slot (-1)
                    if (isEmptySlot(arrayIndex)) {
                        return (
                            <div key={`empty-${gridPosition}`} className="relative" />
                        );
                    }

                    return (
                        <div key={arrayIndex} className="relative flex items-center justify-center group">
                            <div className={`absolute text-[60px] sm:text-[80px] font-black ${isBeachStyle ? 'text-black/5' : 'text-white/10'} select-none pointer-events-none`}>
                                {layoutConfig.zoneMap[arrayIndex]}
                            </div>

                            {/* Zone Marker is the target for drops */}
                            <ZoneMarker
                                index={arrayIndex}
                                visualZone={""}
                                teamId={teamId}
                                isActive={false}
                            />

                            {slots[arrayIndex] ? (
                                <DraggablePlayer
                                    key={slots[arrayIndex].id}
                                    player={slots[arrayIndex]}
                                    index={arrayIndex}
                                    teamId={teamId}
                                    theme={theme}
                                    isServer={isServing && arrayIndex === 0}
                                    onActivate={handlePlayerActivate}
                                    isMVP={mvpId === slots[arrayIndex].id}
                                    isGlobalDragging={isDragActive}
                                />
                            ) : (
                                <div className="w-12 h-12 rounded-full border-2 border-dashed border-white/20 opacity-30 pointer-events-none" />
                            )}
                        </div>
                    );
                })}
            </div>

        </div>
    );
};
