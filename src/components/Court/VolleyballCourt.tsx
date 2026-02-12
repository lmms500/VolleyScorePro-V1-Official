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
    /** Rotation angle for player name labels (e.g., -90 for inline portrait mode) */
    nameRotation?: number;
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
                absolute inset-0 flex items-center justify-center rounded-3xl transition-all duration-300
                ${isOver ? 'bg-white/20 ring-4 ring-white/40 scale-105 shadow-[0_0_30px_rgba(255,255,255,0.3)] z-10 backdrop-blur-sm' : 'opacity-0'}
            `}
        >
            <span className="text-[60px] font-black text-white/5 select-none">{visualZone}</span>
        </div>
    );
});

// --- 2. THE PLAYER TOKEN (Ultraglass Jewel) ---
const DraggablePlayer = memo(({ player, index, teamId, theme, isServer, onActivate, isMVP, isGlobalDragging, nameRotation }: { player: Player, index: number, teamId: string, theme: any, isServer: boolean, onActivate?: (player: Player) => void, isMVP: boolean, isGlobalDragging: boolean, nameRotation?: number }) => {
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
            transition={{ type: "spring", stiffness: 220, damping: 24, mass: 0.9 }}
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            onClick={handleClick}
            className={`
                relative w-12 h-12 sm:w-14 sm:h-14 flex flex-col items-center justify-center touch-none cursor-grab active:cursor-grabbing z-20 group
                ${isDragging ? 'opacity-0' : 'opacity-100'}
                ${isGlobalDragging ? 'pointer-events-none' : 'pointer-events-auto'}
            `}
            style={{
                touchAction: 'none'
            }}
        >
            {/* Server Indicator Ring */}
            {isServer && (
                <motion.div
                    layoutId={`serve-ring-${teamId}`}
                    className="absolute -inset-2 rounded-full border-[3px] border-dashed border-amber-400/90 animate-[spin_8s_linear_infinite]"
                    transition={{ type: "spring", stiffness: 220, damping: 24, mass: 0.9 }}
                />
            )}

            {/* MVP Glow */}
            {isMVP && (
                <div className="absolute inset-0 rounded-full shadow-[0_0_30px_rgba(251,191,36,0.6)] ring-2 ring-amber-400/80 animate-pulse z-0" />
            )}

            {/* Main Token Body */}
            <div className={`
                w-full h-full rounded-full shadow-[0_4px_10px_rgba(0,0,0,0.3)] flex items-center justify-center relative overflow-hidden z-10 transition-transform duration-200 group-hover:scale-110
                bg-gradient-to-br ${theme.gradient.replace('/15', '').replace('to-transparent', 'to-gray-900/40')}
                border border-white/40
                ring-1 ring-black/10 dark:ring-white/10
                ${isMVP ? 'border-amber-400/50 shadow-amber-500/20' : ''}
            `}>
                {/* Glossy Reflection */}
                <div className="absolute inset-x-0 top-0 h-[45%] bg-gradient-to-b from-white/60 to-transparent pointer-events-none rounded-t-full" />

                <span
                    className={`text-lg sm:text-xl font-black ${isMVP ? 'text-amber-50' : 'text-white'} drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)] z-10 font-mono tracking-tighter`}
                    style={nameRotation ? { transform: `rotate(${nameRotation}deg)`, display: 'inline-block' } : undefined}
                >
                    {player.number || '#'}
                </span>
            </div>

            {/* Name Label */}
            <div
                className={`absolute -bottom-5 left-1/2 -translate-x-1/2 bg-slate-900/80 backdrop-blur-md px-2.5 py-0.5 rounded-md border shadow-lg max-w-[200%] transition-opacity duration-200
                 ${isMVP ? 'border-amber-500/50' : 'border-white/10'}
                 ${isGlobalDragging ? 'opacity-0' : 'opacity-100'}
                `}
                style={{ transform: nameRotation ? `translateX(-50%) rotate(${nameRotation}deg)` : 'translateX(-50%)' }}
            >
                <span className={`text-[9px] font-bold uppercase tracking-wider block truncate text-center max-w-[80px] leading-tight ${isMVP ? 'text-amber-400' : 'text-slate-200'}`}>
                    {player.name}
                </span>
            </div>
        </motion.div>
    );
});

export const VolleyballCourt: React.FC<VolleyballCourtProps> = ({
    players, color, isServing, side, teamId, variant = 'full', onPlayerClick, mvpId, layoutConfig, isDragActive = false, nameRotation
}) => {
    const theme = resolveTheme(color);

    // Stable handler for player activation
    const handlePlayerActivate = useCallback((player: Player) => {
        if (onPlayerClick) {
            onPlayerClick(player);
        }
    }, [onPlayerClick]);
    const isMinimal = variant === 'minimal';
    const isBeachStyle = layoutConfig.playersOnCourt <= 4;
    const slotCount = layoutConfig.playersOnCourt;
    const slots = new Array(slotCount).fill(null);
    players.slice(0, slotCount).forEach((p, i) => { slots[i] = p; });

    const gridOrder = side === 'left' ? layoutConfig.gridOrderLeft : layoutConfig.gridOrderRight;

    // Grid Setup
    const gridRowsClass = layoutConfig.gridRows === 1 ? 'grid-rows-1' : layoutConfig.gridRows === 2 ? 'grid-rows-2' : 'grid-rows-3';
    const gridColsClass = layoutConfig.gridCols === 3 ? 'grid-cols-3' : 'grid-cols-2';

    // Visual Styles
    const lineColor = isBeachStyle ? 'border-blue-900/20' : 'border-white/50';

    return (
        <div className={`w-full h-full relative ${isMinimal ? '' : 'p-4'} flex items-center justify-center`}>
            {/* Court Floor removed here as it is now handled by the parent container for better layering */}

            {/* Court Lines (Simplified & Cleaner) */}
            <div className={`
                absolute ${isMinimal ? 'inset-0' : 'inset-4'} border-[4px] ${lineColor}
                ${side === 'left' ? 'border-r-0' : 'border-l-0'}
                opacity-80
            `}>
                {!isBeachStyle && (
                    <div className={`absolute top-0 bottom-0 w-[2px] bg-white/30 ${side === 'left' ? 'right-[33%]' : 'left-[33%]'}`} />
                )}
            </div>

            {/* Players Grid */}
            <div className={`
                relative z-10 w-full h-full grid gap-2 sm:gap-4 ${gridRowsClass} ${gridColsClass}
                ${side === 'left' ? 'pr-8 pl-4 lg:pr-12 lg:pl-6' : 'pl-8 pr-4 lg:pl-12 lg:pr-6'}
            `}>
                {gridOrder.map((arrayIndex, gridPosition) => {
                    if (isEmptySlot(arrayIndex)) return <div key={`empty-${gridPosition}`} className="relative" />;

                    return (
                        <div key={slots[arrayIndex]?.id || `empty-${arrayIndex}`} className="relative flex items-center justify-center">

                            {/* Watermark Zone Number */}
                            <div
                                className={`absolute text-[100px] leading-none font-black text-white/[0.03] select-none pointer-events-none z-0 transform scale-110`}
                                style={nameRotation ? { transform: `scale(1.1) rotate(${nameRotation}deg)` } : undefined}
                            >
                                {layoutConfig.zoneMap[arrayIndex]}
                            </div>

                            {/* Drop Zone */}
                            <ZoneMarker
                                index={arrayIndex}
                                visualZone={""}
                                teamId={teamId}
                                isActive={false}
                            />

                            {/* Player Token */}
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
                                    nameRotation={nameRotation}
                                />
                            ) : (
                                <div className="w-12 h-12 rounded-full border-2 border-dashed border-white/10 opacity-50 pointer-events-none" />
                            )}
                        </div>
                    );
                })}
            </div>

        </div>
    );
};
