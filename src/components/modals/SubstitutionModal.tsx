
import React, { useState, useEffect, memo } from 'react';
import { Modal } from '../ui/Modal';
import { ModalHeader } from '../ui/ModalHeader';
import { Team, Player, TeamColor } from '../../types';
import { Button } from '../ui/Button';
import { User, Hash, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { useHaptics } from '../../hooks/useHaptics';
import { resolveTheme } from '../../utils/colors';
import { useTranslation } from '../../contexts/LanguageContext';

interface SubstitutionModalProps {
    isOpen: boolean;
    onClose: () => void;
    team: Team;
    onConfirm: (playerInId: string, playerOutId: string) => void;
    zIndex?: string;
}

type SubPair = { outId: string; inId: string };

// --- COMPONENT 1: COMPACT GRID CARD (LANDSCAPE) ---
const CompactPlayerCard = memo(({
    player,
    isSelected,
    isPending,
    pairIndex,
    type,
    onSelect,
    teamColor
}: {
    player: Player,
    isSelected: boolean,
    isPending: boolean,
    pairIndex: number | null,
    type: 'in' | 'out',
    onSelect: (id: string, type: 'in' | 'out') => void,
    teamColor: TeamColor
}) => {
    const isOut = type === 'out';

    // Active states
    let activeClass = '';
    if (isSelected || isPending) {
        if (isOut) activeClass = 'bg-rose-500 border-rose-600 text-white ring-2 ring-rose-500/30 shadow-lg shadow-rose-500/20 z-10';
        else activeClass = 'bg-emerald-500 border-emerald-600 text-white ring-2 ring-emerald-500/30 shadow-lg shadow-emerald-500/20 z-10';
    } else {
        activeClass = 'bg-white/5 dark:bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20';
    }

    return (
        <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(player.id, type)}
            className={`
                relative flex flex-col items-center justify-center p-2 rounded-xl border transition-all duration-200 
                w-full aspect-[4/3] group overflow-visible
                ${activeClass}
                ${isPending ? 'animate-pulse' : ''}
            `}
        >
            <div className="text-xl font-black tabular-nums leading-none mb-1">
                {player.number || <Hash size={16} />}
            </div>
            <span className={`text-[9px] font-bold uppercase tracking-tight truncate w-full text-center opacity-90`}>
                {player.name}
            </span>

            {/* Pair Badge */}
            {pairIndex !== null && (
                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-white text-slate-900 flex items-center justify-center text-[10px] font-black shadow-sm z-20 border border-slate-200">
                    {pairIndex + 1}
                </div>
            )}

            {/* Context Icon (Arrow) */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-20 transition-opacity pointer-events-none">
                {isOut ? <ArrowRight size={24} /> : <ArrowLeft size={24} />}
            </div>
        </motion.button>
    );
});

// --- COMPONENT 2: ROW BLOCK CARD (PORTRAIT) ---
const PlayerCardBlock = memo(({
    player,
    isSelected,
    isPending,
    pairIndex,
    type,
    onSelect,
    teamColor
}: {
    player: Player,
    isSelected: boolean,
    isPending: boolean,
    pairIndex: number | null,
    type: 'in' | 'out',
    onSelect: (id: string, type: 'in' | 'out') => void,
    teamColor: TeamColor
}) => {
    const isOut = type === 'out';
    const theme = resolveTheme(teamColor);

    let activeBorder = '';
    let activeBg = '';
    let activeRing = '';

    if (isSelected || isPending) {
        if (isOut) {
            activeBorder = 'border-rose-500 dark:border-rose-400';
            activeBg = 'bg-rose-500/10 dark:bg-rose-500/20';
            activeRing = 'ring-1 ring-rose-500';
        } else {
            activeBorder = 'border-emerald-500 dark:border-emerald-400';
            activeBg = 'bg-emerald-500/10 dark:bg-emerald-500/20';
            activeRing = 'ring-1 ring-emerald-500';
        }
    }

    const passiveClass = `
        bg-white/60 dark:bg-white/[0.04] 
        border-slate-200 dark:border-white/10 
        hover:border-slate-300 dark:hover:border-white/20
    `;

    return (
        <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(player.id, type)}
            className={`
                relative flex items-center justify-between p-3 rounded-2xl border transition-all duration-300 
                w-full h-14 overflow-hidden group isolate
                ${isSelected || isPending
                    ? `${activeBg} ${activeBorder} ${activeRing} z-10`
                    : `${passiveClass} hover:bg-white/80 dark:hover:bg-white/10`
                }
                ${isPending ? 'animate-pulse' : ''}
            `}
        >
            <div className="flex items-center gap-3 min-w-0">
                <div className={`
                    w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black
                    ${isSelected
                        ? (isOut ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white')
                        : 'bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400'}
                `}>
                    {player.number || <Hash size={12} />}
                </div>
                <span className={`text-sm font-bold uppercase tracking-tight truncate max-w-[100px] ${isSelected ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300'}`}>
                    {player.name}
                </span>
            </div>

            <div className="flex items-center gap-2">
                {player.isFixed && <User size={12} className="text-amber-500 opacity-60" fill="currentColor" />}
                {pairIndex !== null && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm ${isOut ? 'bg-rose-600' : 'bg-emerald-600'}`}
                    >
                        {pairIndex + 1}
                    </motion.div>
                )}
            </div>
        </motion.button>
    );
});

export const SubstitutionModal: React.FC<SubstitutionModalProps> = ({
    isOpen, onClose, team, onConfirm, zIndex = "z-[60]"
}) => {
    const { t } = useTranslation();
    const [pairs, setPairs] = useState<SubPair[]>([]);
    const [pendingOutId, setPendingOutId] = useState<string | null>(null);
    const haptics = useHaptics();

    useEffect(() => {
        if (isOpen) {
            setPairs([]);
            setPendingOutId(null);
        }
    }, [isOpen]);

    const handleConfirm = () => {
        if (pairs.length > 0) {
            haptics.notification('success');
            pairs.forEach(pair => {
                onConfirm(pair.inId, pair.outId);
            });
            onClose();
        }
    };

    const handleSelect = (id: string, type: 'in' | 'out') => {
        haptics.impact('light');
        const existingPairIndex = pairs.findIndex(p => p.outId === id || p.inId === id);

        if (existingPairIndex !== -1) {
            const newPairs = [...pairs];
            newPairs.splice(existingPairIndex, 1);
            setPairs(newPairs);
            return;
        }

        if (type === 'out') {
            if (pendingOutId === id) setPendingOutId(null);
            else setPendingOutId(id);
        } else {
            if (pendingOutId) {
                const newPair = { outId: pendingOutId, inId: id };
                setPairs([...pairs, newPair]);
                setPendingOutId(null);
                haptics.notification('success');
            }
        }
    };

    const courtPlayers = team.players || [];
    const benchPlayers = team.reserves || [];
    const theme = resolveTheme(team.color || 'slate');

    const getPairIndex = (id: string) => {
        const idx = pairs.findIndex(p => p.outId === id || p.inId === id);
        return idx === -1 ? null : idx;
    };

    // --- Confirm Button for Header ---
    const confirmButton = (
        <Button
            onClick={handleConfirm}
            disabled={pairs.length === 0}
            size="sm"
            variant="ghost"
            className={`
        px-3 py-1.5 rounded-lg font-bold uppercase tracking-wider text-[10px] transition-all
        ${pairs.length > 0
                    ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                    : 'text-slate-500 cursor-not-allowed'}
      `}
        >
            <Check size={16} className="mr-1" />
            {pairs.length > 0 ? pairs.length : ''}
        </Button>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title=""
            showCloseButton={false}
            variant="fullscreen"
            zIndex={zIndex}
        >
            {/* ModalHeader */}
            <ModalHeader
                title={t('substitution.title')}
                subtitle={team.name}
                onClose={onClose}
                rightContent={confirmButton}
            />

            {/* CONTAINER WITH RESPONSIVE LAYOUT */}
            <div className="flex flex-col flex-1 bg-gradient-to-b from-slate-50/50 to-slate-100/50 dark:from-slate-950/50 dark:to-slate-900/50 backdrop-blur-md text-slate-900 dark:text-white overflow-hidden">

                {/* --- RESPONSIVE CONTENT AREA --- */}

                {/* PORTRAIT VIEW (Stacked Rows) */}
                <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-4 grid grid-cols-2 gap-6 landscape:hidden">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 px-1 mb-2">
                            <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500"><ArrowRight size={14} strokeWidth={3} /></div>
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">{t('substitution.outCourt')}</h3>
                        </div>
                        <div className="flex flex-col gap-3">
                            {courtPlayers.map(p => (
                                <PlayerCardBlock
                                    key={p.id}
                                    player={p}
                                    isSelected={getPairIndex(p.id) !== null}
                                    isPending={pendingOutId === p.id}
                                    pairIndex={getPairIndex(p.id)}
                                    type="out"
                                    onSelect={handleSelect}
                                    teamColor={team.color || 'slate'}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center gap-2 px-1 mb-2">
                            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500"><ArrowLeft size={14} strokeWidth={3} /></div>
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">{t('substitution.inBench')}</h3>
                        </div>
                        <div className="flex flex-col gap-3">
                            {benchPlayers.map(p => (
                                <PlayerCardBlock
                                    key={p.id}
                                    player={p}
                                    isSelected={getPairIndex(p.id) !== null}
                                    isPending={false}
                                    pairIndex={getPairIndex(p.id)}
                                    type="in"
                                    onSelect={handleSelect}
                                    teamColor={team.color || 'slate'}
                                />
                            ))}
                            {benchPlayers.length === 0 && (
                                <div className="py-8 flex flex-col items-center justify-center text-slate-400/60 gap-2 border-2 border-dashed border-slate-200 dark:border-white/5 rounded-2xl bg-slate-50/50 dark:bg-white/[0.01]">
                                    <User size={20} />
                                    <span className="text-[10px] font-bold uppercase tracking-wider">{t('substitution.emptyBench')}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* LANDSCAPE VIEW (Side-by-Side Grid) */}
                <div className="hidden landscape:grid flex-1 grid-cols-2 gap-4 min-h-0 overflow-hidden p-3">

                    {/* LEFT: COURT (OUT) */}
                    <div className="flex flex-col h-full bg-rose-500/5 rounded-2xl border border-rose-500/10 overflow-hidden">
                        <div className="flex items-center gap-2 p-3 pb-2 flex-shrink-0 bg-rose-500/10">
                            <div className="p-1 rounded-md bg-rose-500 text-white shadow-sm"><ArrowRight size={12} strokeWidth={3} /></div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-rose-400">{t('substitution.outCourt')}</span>
                            <div className="ml-auto px-1.5 py-0.5 rounded-full bg-rose-500/20 text-[9px] font-bold text-rose-300">{courtPlayers.length}</div>
                        </div>

                        {/* Fixed Height Scroll Area with Padding for Rings */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-3">
                            <div className="grid grid-cols-3 gap-3 content-start">
                                {courtPlayers.map(p => (
                                    <CompactPlayerCard
                                        key={p.id}
                                        player={p}
                                        isSelected={getPairIndex(p.id) !== null}
                                        isPending={pendingOutId === p.id}
                                        pairIndex={getPairIndex(p.id)}
                                        type="out"
                                        onSelect={handleSelect}
                                        teamColor={team.color || 'slate'}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: BENCH (IN) */}
                    <div className="flex flex-col h-full bg-emerald-500/5 rounded-2xl border border-emerald-500/10 overflow-hidden">
                        <div className="flex items-center gap-2 p-3 pb-2 flex-shrink-0 bg-emerald-500/10">
                            <div className="p-1 rounded-md bg-emerald-500 text-white shadow-sm"><ArrowLeft size={12} strokeWidth={3} /></div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">{t('substitution.inBench')}</span>
                            <div className="ml-auto px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-[9px] font-bold text-emerald-300">{benchPlayers.length}</div>
                        </div>

                        {/* Fixed Height Scroll Area with Padding for Rings */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-3">
                            <div className="grid grid-cols-3 gap-3 content-start">
                                {benchPlayers.length === 0 ? (
                                    <div className="col-span-3 flex flex-col items-center justify-center py-8 text-slate-500 opacity-50 gap-2 border border-dashed border-white/10 rounded-xl">
                                        <User size={20} />
                                        <span className="text-[10px] font-bold uppercase">{t('substitution.emptyBench')}</span>
                                    </div>
                                ) : (
                                    benchPlayers.map(p => (
                                        <CompactPlayerCard
                                            key={p.id}
                                            player={p}
                                            isSelected={getPairIndex(p.id) !== null}
                                            isPending={false}
                                            pairIndex={getPairIndex(p.id)}
                                            type="in"
                                            onSelect={handleSelect}
                                            teamColor={team.color || 'slate'}
                                        />
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
};
