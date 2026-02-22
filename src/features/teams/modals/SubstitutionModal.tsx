
import React, { useState, useEffect, memo } from 'react';
import { Modal } from '@ui/Modal';
import { Team, Player } from '@types';
import { User, Hash, ArrowRight, ArrowLeft, Check, X, ArrowRightLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHaptics } from '@lib/haptics/useHaptics';
import { audioService } from '@lib/audio/AudioService';
import { resolveTheme } from '@lib/utils/colors';
import { useTranslation } from '@contexts/LanguageContext';

interface SubstitutionModalProps {
    isOpen: boolean;
    onClose: () => void;
    team: Team;
    onConfirm: (playerInId: string, playerOutId: string) => void;
    zIndex?: string;
}

type SubPair = { outId: string; inId: string };

// --- PLAYER ROW CARD ---
const PlayerCardBlock = memo(({
    player,
    isSelected,
    isPending,
    pairIndex,
    type,
    onSelect,
}: {
    player: Player,
    isSelected: boolean,
    isPending: boolean,
    pairIndex: number | null,
    type: 'in' | 'out',
    onSelect: (id: string, type: 'in' | 'out') => void,
}) => {
    const isOut = type === 'out';

    const activeClass = isSelected || isPending
        ? isOut
            ? 'bg-gradient-to-br from-rose-500/20 to-rose-600/10 dark:from-rose-500/25 dark:to-rose-600/15 border-rose-400/30 dark:border-rose-400/20 ring-1 ring-rose-500/40 shadow-[0_2px_12px_rgba(244,63,94,0.2),inset_0_1px_0_0_rgba(255,255,255,0.1)]'
            : 'bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 dark:from-emerald-500/25 dark:to-emerald-600/15 border-emerald-400/30 dark:border-emerald-400/20 ring-1 ring-emerald-500/40 shadow-[0_2px_12px_rgba(16,185,129,0.2),inset_0_1px_0_0_rgba(255,255,255,0.1)]'
        : 'bg-white/60 dark:bg-white/[0.04] border-slate-200/80 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 backdrop-blur-sm ring-1 ring-inset ring-white/10 dark:ring-white/5 shadow-[0_1px_3px_rgba(0,0,0,0.04),inset_0_1px_0_0_rgba(255,255,255,0.15)] hover:bg-white/80 dark:hover:bg-white/10';

    const numberClass = isSelected
        ? isOut
            ? 'bg-gradient-to-br from-rose-500 to-rose-600 text-white shadow-sm shadow-rose-500/30 ring-1 ring-inset ring-white/10'
            : 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-sm shadow-emerald-500/30 ring-1 ring-inset ring-white/10'
        : isPending
            ? 'bg-rose-500/20 dark:bg-rose-500/15 text-rose-500 border border-rose-400/30 ring-1 ring-inset ring-rose-500/10'
            : 'bg-white/60 dark:bg-white/10 border border-white/60 dark:border-white/10 ring-1 ring-inset ring-white/10 text-slate-500 dark:text-slate-400';

    return (
        <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelect(player.id, type)}
            className={`
                relative flex items-center justify-between px-2.5 py-2 rounded-xl border transition-all duration-200
                w-full overflow-hidden group isolate
                ${activeClass}
                ${isPending ? 'animate-pulse' : ''}
            `}
        >
            <div className="flex items-center gap-2 min-w-0">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-black flex-shrink-0 transition-all ${numberClass}`}>
                    {player.number || <Hash size={10} />}
                </div>
                <span className={`text-[11px] font-bold tracking-tight truncate transition-colors ${isSelected || isPending ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300'}`}>
                    {player.name}
                </span>
            </div>

            <div className="flex items-center gap-1 flex-shrink-0">
                {player.isFixed && <User size={9} className="text-amber-500 opacity-60" fill="currentColor" />}
                {pairIndex !== null && (
                    <motion.div
                        initial={{ scale: 0, rotate: -90 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", damping: 15, stiffness: 450 }}
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black text-white shadow-md ring-1 ring-inset ring-white/20 ${isOut ? 'bg-gradient-to-br from-rose-500 to-rose-600' : 'bg-gradient-to-br from-emerald-500 to-emerald-600'}`}
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
            audioService.playConfirm();
            pairs.forEach(pair => onConfirm(pair.inId, pair.outId));
            onClose();
        }
    };

    const handleSelect = (id: string, type: 'in' | 'out') => {
        haptics.impact('light');
        audioService.playTap();
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
                setPairs(prev => [...prev, { outId: pendingOutId, inId: id }]);
                setPendingOutId(null);
                haptics.notification('success');
                audioService.playSuccess();
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

    // --- Sticky footer: pairs summary + confirm button ---
    const footer = (
        <div className="px-6 pt-3 pb-6 border-t border-black/5 dark:border-white/5 bg-gradient-to-t from-white/30 dark:from-black/20 to-transparent">
            {/* Pair summary chips */}
            <AnimatePresence>
                {pairs.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex gap-1.5 flex-wrap mb-3 overflow-hidden"
                    >
                        {pairs.map((pair, i) => {
                            const pOut = courtPlayers.find(p => p.id === pair.outId);
                            const pIn = benchPlayers.find(p => p.id === pair.inId);
                            return (
                                <motion.div
                                    key={i}
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0, opacity: 0 }}
                                    transition={{ type: "spring", damping: 15, stiffness: 450 }}
                                    className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/70 dark:bg-white/[0.07] border border-white/60 dark:border-white/10 ring-1 ring-inset ring-white/10 shadow-[0_1px_3px_rgba(0,0,0,0.06),inset_0_1px_0_0_rgba(255,255,255,0.15)] text-[9px] font-bold"
                                >
                                    <span className="text-rose-500 truncate max-w-[44px]">{pOut?.name || '?'}</span>
                                    <ChevronRight size={8} className="text-slate-400 flex-shrink-0" />
                                    <span className="text-emerald-500 truncate max-w-[44px]">{pIn?.name || '?'}</span>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Confirm Button */}
            <motion.button
                onClick={handleConfirm}
                disabled={pairs.length === 0}
                whileTap={{ scale: pairs.length > 0 ? 0.97 : 1 }}
                className={`
                    relative overflow-hidden w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl
                    font-black text-xs uppercase tracking-widest transition-all group
                    ${pairs.length > 0
                        ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white shadow-lg shadow-emerald-500/30 ring-1 ring-inset ring-white/10 active:scale-95'
                        : 'bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                    }
                `}
            >
                <Check size={14} strokeWidth={3} className="relative z-10" />
                <span className="relative z-10">
                    {pairs.length > 0 ? t('substitution.confirm', { count: pairs.length }) : t('common.confirm')}
                </span>
                {pairs.length > 0 && (
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-500 skew-x-12 pointer-events-none" />
                )}
            </motion.button>
        </div>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title=""
            showCloseButton={false}
            variant="floating"
            maxWidth="max-w-lg"
            zIndex={zIndex}
            footer={footer}
        >
            {/* ── Close Button ── */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 z-50 w-9 h-9 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white hover:from-red-600 hover:to-red-700 active:scale-95 transition-all shadow-lg shadow-red-500/30 ring-1 ring-inset ring-white/10 group/close"
            >
                <X size={16} strokeWidth={3} className="group-hover/close:rotate-90 transition-transform duration-300" />
            </button>

            {/* ── Header ── */}
            <div className="pt-5 pb-4 pr-10 flex items-center gap-3">
                <div className={`
                    p-2.5 rounded-xl flex-shrink-0 flex items-center justify-center
                    ${theme.bg} ${theme.text} ${theme.textDark}
                    shadow-[0_4px_12px_rgba(0,0,0,0.08),inset_0_1px_0_0_rgba(255,255,255,0.2)]
                    ring-1 ring-inset ring-white/20 border border-white/30 dark:border-white/10
                `}>
                    <ArrowRightLeft size={16} strokeWidth={2.5} />
                </div>
                <div className="flex-1 min-w-0">
                    <h2 className="text-base font-black text-slate-800 dark:text-white tracking-tight leading-none">
                        {t('substitution.title')}
                    </h2>
                    <p className={`text-[11px] font-bold uppercase tracking-wider mt-0.5 truncate ${theme.text} ${theme.textDark} opacity-80`}>
                        {team.name}
                    </p>
                </div>
            </div>

            {/* ── Two-Column Player Selection ── */}
            <div className="grid grid-cols-2 gap-3">

                {/* OUT — Court Players */}
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-1.5">
                        <div className="p-1.5 rounded-lg bg-gradient-to-br from-rose-500 to-rose-600 text-white shadow-sm shadow-rose-500/30 ring-1 ring-inset ring-white/10 flex-shrink-0">
                            <ArrowRight size={10} strokeWidth={3} />
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 truncate">
                            {t('substitution.outCourt')}
                        </span>
                        <span className="ml-auto text-[9px] font-bold text-slate-400 bg-slate-100/80 dark:bg-white/5 px-1.5 py-0.5 rounded-full flex-shrink-0 ring-1 ring-inset ring-black/5 dark:ring-white/5">
                            {courtPlayers.length}
                        </span>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        {courtPlayers.map((p, idx) => (
                            <PlayerCardBlock
                                key={(p.id && p.id.trim()) ? p.id : `sub-out-${idx}`}
                                player={p}
                                isSelected={getPairIndex(p.id) !== null}
                                isPending={pendingOutId === p.id}
                                pairIndex={getPairIndex(p.id)}
                                type="out"
                                onSelect={handleSelect}
                            />
                        ))}
                    </div>
                </div>

                {/* IN — Bench Players */}
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-1.5">
                        <div className="p-1.5 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-sm shadow-emerald-500/30 ring-1 ring-inset ring-white/10 flex-shrink-0">
                            <ArrowLeft size={10} strokeWidth={3} />
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 truncate">
                            {t('substitution.inBench')}
                        </span>
                        <span className="ml-auto text-[9px] font-bold text-slate-400 bg-slate-100/80 dark:bg-white/5 px-1.5 py-0.5 rounded-full flex-shrink-0 ring-1 ring-inset ring-black/5 dark:ring-white/5">
                            {benchPlayers.length}
                        </span>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        {benchPlayers.length === 0 ? (
                            <div className="py-6 flex flex-col items-center justify-center text-slate-400/50 gap-2 border-2 border-dashed border-slate-200 dark:border-white/5 rounded-xl bg-slate-50/50 dark:bg-white/[0.01]">
                                <User size={16} />
                                <span className="text-[9px] font-bold uppercase tracking-wider">
                                    {t('substitution.emptyBench')}
                                </span>
                            </div>
                        ) : (
                            benchPlayers.map((p, idx) => (
                                <PlayerCardBlock
                                    key={(p.id && p.id.trim()) ? p.id : `sub-in-${idx}`}
                                    player={p}
                                    isSelected={getPairIndex(p.id) !== null}
                                    isPending={false}
                                    pairIndex={getPairIndex(p.id)}
                                    type="in"
                                    onSelect={handleSelect}
                                />
                            ))
                        )}
                    </div>
                </div>
            </div>
        </Modal>
    );
};
