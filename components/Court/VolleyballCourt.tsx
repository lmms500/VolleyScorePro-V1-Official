
import React, { memo } from 'react';
import { Player, TeamColor } from '../../types';
import { resolveTheme } from '../../utils/colors';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
// Crown import removed as it is no longer visually used, though logic remains for MVP
import { Crown } from 'lucide-react';

interface VolleyballCourtProps {
  players: Player[];
  color: TeamColor;
  isServing: boolean;
  side: 'left' | 'right';
  teamId: string;
  variant?: 'full' | 'minimal';
  onPlayerClick?: (player: Player) => void;
  mvpId?: string | null;
}

const ZONE_MAP = [1, 6, 5, 4, 3, 2];

// --- 1. THE DROP ZONE (Glass Slot) ---
const ZoneMarker = memo(({ index, visualZone, teamId, isActive }: { index: number, visualZone: string, teamId: string, isActive: boolean }) => {
    const { setNodeRef, isOver } = useDroppable({
        id: `${teamId}-zone-${index}`,
        data: { index, teamId, type: 'zone' }
    });

    return (
        <div 
            ref={setNodeRef}
            className={`
                absolute inset-0 flex items-center justify-center rounded-2xl transition-all duration-300 pointer-events-none
                ${isOver ? 'bg-white/20 ring-2 ring-white/50 scale-105 shadow-[0_0_15px_rgba(255,255,255,0.3)]' : 'opacity-0'}
            `}
        >
            <span className="text-[80px] font-black text-white/5 select-none">{visualZone}</span>
        </div>
    );
});

// --- 2. THE PLAYER TOKEN (NeoGlass Jewel) ---
const DraggablePlayer = memo(({ player, index, teamId, theme, isServer, onClick, isMVP }: { player: Player, index: number, teamId: string, theme: any, isServer: boolean, onClick?: () => void, isMVP: boolean }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: player.id,
        data: { index, teamId, player, type: 'player' }
    });

    // Handle click manually to ensure dnd doesn't swallow it if intended
    const handleClick = (e: React.MouseEvent) => {
        if (onClick && !isDragging) {
            e.stopPropagation();
            onClick();
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
                relative w-12 h-12 sm:w-14 sm:h-14 flex flex-col items-center justify-center touch-none cursor-pointer active:cursor-grabbing z-20
                ${isDragging ? 'opacity-0' : 'opacity-100'} 
            `}
        >
            {/* Server Indicator - Rotating Glow Ring */}
            {isServer && (
                <motion.div 
                    layoutId={`serve-ring-${teamId}`}
                    className="absolute -inset-1.5 rounded-full border-2 border-dashed border-amber-400/60 animate-[spin_8s_linear_infinite]"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
            )}

            {/* MVP Indicator - Glow Ring ONLY (Crown removed) */}
            {isMVP && (
                <div className="absolute inset-0 rounded-full shadow-[0_0_15px_rgba(251,191,36,0.6)] ring-2 ring-amber-400/80 animate-pulse z-0" />
            )}

            {/* The Jewel (Token Body) */}
            <div className={`
                w-full h-full rounded-full shadow-xl flex items-center justify-center relative overflow-hidden z-10
                bg-gradient-to-br ${theme.gradient.replace('/15', '/90').replace('to-transparent', 'to-black/40')}
                border border-white/20
                ring-1 ring-black/20
                ${isMVP ? 'border-amber-400/50' : ''}
            `}>
                {/* Internal Gloss (Top Reflection) */}
                <div className="absolute inset-x-0 top-0 h-[45%] bg-gradient-to-b from-white/30 to-transparent pointer-events-none rounded-t-full" />
                
                {/* Number */}
                <span className={`text-lg sm:text-xl font-black ${isMVP ? 'text-amber-100' : 'text-white'} drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)] z-10 font-mono tracking-tighter`}>
                    {player.number || '#'}
                </span>
            </div>

            {/* Name Pill (Floating below) */}
            <div className={`absolute -bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/80 backdrop-blur-md px-2 py-0.5 rounded-full border shadow-lg max-w-[160%] ${isMVP ? 'border-amber-500/50' : 'border-white/10'}`}>
                <span className={`text-[8px] font-bold uppercase tracking-wider block truncate text-center max-w-[60px] ${isMVP ? 'text-amber-400' : 'text-slate-200'}`}>
                    {player.name}
                </span>
            </div>
        </motion.div>
    );
});

export const VolleyballCourt: React.FC<VolleyballCourtProps> = ({ 
    players, color, isServing, side, teamId, variant = 'full', onPlayerClick, mvpId
}) => {
    const theme = resolveTheme(color);
    const isMinimal = variant === 'minimal';
    
    // Normalize to 6 slots
    const slots = new Array(6).fill(null);
    players.slice(0, 6).forEach((p, i) => { slots[i] = p; });

    // Grid Layout Logic
    const gridOrder = side === 'left' 
        ? [2, 3, 1, 4, 0, 5] 
        : [5, 0, 4, 1, 3, 2];

    return (
        <div className={`w-full h-full relative ${isMinimal ? '' : 'p-2 sm:p-4'} flex items-center justify-center`}>
            
            {/* --- 3. THE FLOOR (Only if full variant) --- */}
            {!isMinimal && (
                <div className="absolute inset-0 rounded-[2rem] overflow-hidden shadow-[inset_0_0_40px_rgba(0,0,0,0.5)] border border-white/10 bg-orange-500/30 dark:bg-slate-900/40 backdrop-blur-sm transition-colors duration-300">
                    {/* Base Synthetic Color Gradient - Higher saturation/opacity in light mode */}
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/40 via-orange-600/30 to-slate-100/50 dark:from-orange-600/20 dark:via-orange-700/10 dark:to-slate-900/60 mix-blend-overlay" />
                    {/* Texture Grain */}
                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
                    {/* Glass Reflection Beam */}
                    <div className="absolute -top-1/2 left-0 w-[200%] h-full bg-gradient-to-b from-white/5 to-transparent -rotate-12 transform origin-bottom-left" />
                </div>
            )}

            {/* --- COURT MARKINGS (Shared) --- */}
            <div className={`
                absolute ${isMinimal ? 'inset-0' : 'inset-4'} border-2 border-white/90 dark:border-white/30 
                ${!isMinimal ? 'rounded-xl shadow-[0_0_15px_rgba(255,255,255,0.1)]' : ''}
                ${side === 'left' ? 'border-r-0 rounded-l-[1.2rem]' : 'border-l-0 rounded-r-[1.2rem]'}
            `}>
                {/* Attack Line (3m) */}
                <div className={`absolute top-0 bottom-0 w-0.5 bg-white/60 dark:bg-white/20 ${side === 'left' ? 'right-[33%]' : 'left-[33%]'}`} />
            </div>

            {/* --- 4. PLAYERS GRID --- */}
            <div className={`
                relative z-10 w-full h-full grid grid-rows-3 grid-cols-2 gap-1 sm:gap-2
                ${side === 'left' ? 'pr-6 pl-2 sm:pr-8 sm:pl-4' : 'pl-6 pr-2 sm:pl-8 sm:pr-4'}
            `}>
                {gridOrder.map((arrayIndex) => (
                    <div key={arrayIndex} className="relative flex items-center justify-center">
                        {/* Zone Number Background */}
                        <div className="absolute text-[40px] sm:text-[60px] font-black text-white/25 dark:text-white/5 select-none pointer-events-none">
                            {ZONE_MAP[arrayIndex]}
                        </div>

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
                                onClick={() => onPlayerClick && onPlayerClick(slots[arrayIndex])}
                                isMVP={mvpId === slots[arrayIndex].id}
                            />
                        ) : (
                            <div className="w-12 h-12 rounded-full border-2 border-dashed border-white/10 opacity-20" />
                        )}
                    </div>
                ))}
            </div>

        </div>
    );
};
