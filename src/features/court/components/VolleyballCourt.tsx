import React, { memo, useCallback } from 'react';
import { Player, TeamColor, CourtLayoutConfig } from '@types';
import { resolveTheme, getHexFromColor } from '@lib/utils/colors';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { motion } from 'framer-motion';
import { isEmptySlot } from '@config/gameModes';

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
    /** Where to place the name label relative to the player badge */
    namePlacement?: 'auto' | 'right' | 'left';
    /** Orientation of the court (landscape is default) */
    orientation?: 'landscape' | 'portrait';
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
const DraggablePlayer = memo(({ player, index, teamId, side, teamColor, isServer, onActivate, isMVP, isGlobalDragging, nameRotation, namePlacement = 'auto' }: { player: Player, index: number, teamId: string, side: 'left' | 'right', teamColor: TeamColor, isServer: boolean, onActivate?: (player: Player) => void, isMVP: boolean, isGlobalDragging: boolean, nameRotation?: number, namePlacement?: 'auto' | 'right' | 'left' }) => {
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

    // Determine layout based on rotation to ensure label appears "above" visually
    // When rotated 90deg (nameRotation = -90), visual "top" is local "left"
    const isRotatedLeft = nameRotation === -90;
    const isRotatedRight = nameRotation === 90;

    const positionClass = namePlacement === 'right'
        ? 'left-[100%] top-1/2 ml-0.5'
        : namePlacement === 'left'
            ? 'right-[100%] top-1/2 mr-0.5'
            : isRotatedLeft
                ? 'left-0 top-1/2'
                : isRotatedRight
                    ? 'right-0 top-1/2'
                    : '-top-5 left-1/2';

    const transformStyle = namePlacement === 'right'
        ? `translate(0, -50%)`
        : namePlacement === 'left'
            ? `translate(0, -50%)`
            : isRotatedLeft
                ? `translate(-50%, -50%) rotate(${nameRotation}deg) translateY(-140%)`
                : isRotatedRight
                    ? `translate(50%, -50%) rotate(${nameRotation}deg) translateY(-140%)`
                    : nameRotation
                        ? `translateX(-50%) rotate(${nameRotation}deg)`
                        : 'translateX(-50%)';

    return (
        <motion.div
            layoutId={nameRotation ? undefined : player.id}
            layout={nameRotation ? false : "position"}
            transition={{ type: "spring", stiffness: 220, damping: 24, mass: 0.9 }}
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            data-draggable
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
            {/* Server Indicator Ring - Ciano para máximo contraste em areia e quadra */}
            {isServer && (
                <motion.div
                    layoutId={nameRotation ? undefined : `serve-ring-${teamId}`}
                    className="absolute -inset-2.5 rounded-full border-[4px] border-dashed border-cyan-400 animate-[spin_6s_linear_infinite]"
                    style={{
                        boxShadow: '0 0 20px rgba(34, 211, 238, 0.7), 0 0 40px rgba(34, 211, 238, 0.4)'
                    }}
                    transition={{ type: "spring", stiffness: 220, damping: 24, mass: 0.9 }}
                />
            )}

            {/* MVP Glow - Branco com dourado interno para visibilidade universal */}
            {isMVP && (
                <>
                    <div
                        className="absolute -inset-1 rounded-full animate-pulse z-0"
                        style={{
                            boxShadow: '0 0 25px rgba(255, 255, 255, 0.8), 0 0 50px rgba(251, 191, 36, 0.5), inset 0 0 15px rgba(251, 191, 36, 0.3)'
                        }}
                    />
                    <div className="absolute inset-0 rounded-full ring-4 ring-white/90 z-0" />
                    <div className="absolute inset-0 rounded-full ring-2 ring-inset ring-amber-400 z-0" />
                </>
            )}

            {/* Main Token Body */}
            <div className={`
                w-full h-full rounded-full shadow-[0_4px_10px_rgba(0,0,0,0.3)] flex items-center justify-center relative overflow-hidden z-10 transition-transform duration-200 group-hover:scale-110
                border ${isMVP ? 'border-amber-400' : 'border-white/40'}
                ring-1 ring-black/10 dark:ring-white/10
                ${isMVP ? 'shadow-[0_0_20px_rgba(255,255,255,0.5)]' : ''}
            `}
                style={{
                    background: `linear-gradient(135deg, ${getHexFromColor(teamColor)} 20%, rgba(17, 24, 39, 0.6) 100%)`
                }}>
                {/* Glossy Reflection */}
                <div className="absolute inset-x-0 top-0 h-[45%] bg-gradient-to-b from-white/60 to-transparent pointer-events-none rounded-t-full" />

                <span
                    className={`text-lg sm:text-xl font-black ${isMVP ? 'text-white' : 'text-white'} drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)] z-10 font-mono tracking-tighter ${isMVP ? 'drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]' : ''}`}
                    style={nameRotation ? { transform: `rotate(${nameRotation}deg)`, display: 'inline-block' } : undefined}
                >
                    {player.number || '#'}
                </span>
            </div>

            {/* Name Label */}
            <div
                className={`absolute ${positionClass} backdrop-blur-md px-2.5 py-0.5 rounded-full border shadow-xl max-w-[200%] transition-opacity duration-200
                         ${isMVP ? 'bg-amber-500/95 dark:bg-amber-500/90 border-amber-300' : `border-white/20`}
                         ${isGlobalDragging ? 'opacity-0' : 'opacity-100'}
                         ${isMVP ? 'shadow-[0_0_15px_rgba(251,191,36,0.5)]' : ''}
                        `}
                style={{
                    transform: transformStyle,
                    backgroundColor: isMVP ? undefined : getHexFromColor(teamColor)
                }}
            >
                <span className={`text-[9px] font-bold uppercase tracking-wider block truncate text-center max-w-[80px] leading-tight text-white`}>
                    {player.name}
                </span>
            </div>
        </motion.div>
    );
});

export const VolleyballCourt: React.FC<VolleyballCourtProps> = ({
    players, color, isServing, side, teamId, variant = 'full', onPlayerClick, mvpId, layoutConfig, isDragActive = false, nameRotation, namePlacement = 'auto', orientation = 'landscape'
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
    const isPortrait = orientation === 'portrait';

    // Determine Grid Order and Zone Map based on Orientation
    let gridOrder: number[] = [];
    if (isPortrait) {
        // In portrait mode:
        // 'left' side (Team A) becomes 'top'
        // 'right' side (Team B) becomes 'bottom'
        if (side === 'left') {
            gridOrder = layoutConfig.gridOrderTop || layoutConfig.gridOrderLeft; // Fallback if missing
        } else {
            gridOrder = layoutConfig.gridOrderBottom || layoutConfig.gridOrderRight; // Fallback
        }
    } else {
        gridOrder = side === 'left' ? layoutConfig.gridOrderLeft : layoutConfig.gridOrderRight;
    }

    const slotCount = layoutConfig.playersOnCourt;
    const slots = new Array(slotCount).fill(null);
    players.slice(0, slotCount).forEach((p, i) => { slots[i] = p; });

    // Grid Setup
    const rows = isPortrait ? (layoutConfig.gridRowsVertical || 2) : layoutConfig.gridRows;
    const cols = isPortrait ? (layoutConfig.gridColsVertical || 3) : layoutConfig.gridCols;

    const gridRowsClass = rows === 1 ? 'grid-rows-1' : rows === 2 ? 'grid-rows-2' : 'grid-rows-3';
    const gridColsClass = cols === 3 ? 'grid-cols-3' : 'grid-cols-2';

    // Visual Styles
    const lineColor = isBeachStyle ? 'border-blue-900/20' : 'border-white/50';

    return (
        <div className={`w-full h-full relative ${isMinimal ? '' : 'p-4'} flex items-center justify-center`}>
            {/* Court Floor removed here as it is now handled by the parent container for better layering */}

            {/* Court Lines (Simplified & Cleaner) */}
            <div className={`
                absolute ${isMinimal ? 'inset-0' : 'inset-4'} border-[4px] ${lineColor}
                ${isPortrait
                    ? (side === 'left'
                        ? 'border-b-0 rounded-tl-3xl rounded-tr-3xl'
                        : 'border-t-0 rounded-bl-3xl rounded-br-3xl')
                    : (side === 'left'
                        ? 'border-r-0 rounded-tl-3xl rounded-bl-3xl'
                        : 'border-l-0 rounded-tr-3xl rounded-br-3xl')
                }
                opacity-80
            `}>
                {!isBeachStyle && (
                    <div className={`
                        absolute bg-white/30
                        ${isPortrait
                            ? `left-0 right-0 h-[2px] ${side === 'left' ? 'bottom-[33%]' : 'top-[33%]'}`
                            : `top-0 bottom-0 w-[2px] ${side === 'left' ? 'right-[33%]' : 'left-[33%]'}`
                        }
                    `} />
                )}
            </div>

            {/* Players Grid */}
            <div className={`
                relative z-10 w-full h-full grid gap-2 sm:gap-4 ${gridRowsClass} ${gridColsClass}
                ${isPortrait
                    ? (side === 'left' ? 'pb-8 pt-4 lg:pb-12 lg:pt-6' : 'pt-8 pb-4 lg:pt-12 lg:pb-6')
                    : (side === 'left' ? 'pr-8 pl-4 lg:pr-12 lg:pl-6' : 'pl-8 pr-4 lg:pl-12 lg:pr-6')
                }
            `}>
                {gridOrder.map((arrayIndex, gridPosition) => {
                    if (isEmptySlot(arrayIndex)) return <div key={`zone-${gridPosition}`} className="relative" />;

                    return (
                        <div key={`zone-${arrayIndex}`} className="relative flex items-center justify-center">

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
                                    side={side}
                                    teamColor={color}
                                    isServer={isServing && arrayIndex === 0}
                                    onActivate={handlePlayerActivate}
                                    isMVP={mvpId === slots[arrayIndex].id}
                                    isGlobalDragging={isDragActive}
                                    nameRotation={nameRotation}
                                    namePlacement={namePlacement}
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
