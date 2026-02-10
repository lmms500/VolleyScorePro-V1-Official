
import React, { memo, useCallback } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, UserPlus } from 'lucide-react';
import { Player } from '../../types';
import { useTranslation } from '../../contexts/LanguageContext';
import { PlayerListItem } from './PlayerListItem';
import { AddPlayerForm } from './AddPlayerForm';
import { staggerContainer } from '../../utils/animations';
import { useActions } from '../../contexts/GameContext';
import { useNotification } from '../../contexts/NotificationContext';
import { useHaptics } from '../../hooks/useHaptics';

interface BenchAreaProps {
    teamId: string;
    reserves: Player[];
    onClose: () => void;
    isFull: boolean;
}

export const BenchArea = memo(({ teamId, reserves, onClose, isFull }: BenchAreaProps) => {
    const { t } = useTranslation();
    const benchId = `${teamId}_Reserves`;
    const { addPlayer } = useActions();
    const { showNotification } = useNotification();
    const haptics = useHaptics();

    const { setNodeRef } = useDroppable({
        id: benchId,
        data: { type: 'container', containerId: benchId }
    });

    const handleAdd = useCallback((name: string, number?: string, skill?: number) => {
        const result = addPlayer(name, benchId, number, skill);
        if (!result.success) {
            haptics.notification('error');
            showNotification({
                type: 'error',
                mainText: result.errorKey ? t(result.errorKey, result.errorParams) : (result.error || t('notifications.cannotAdd')),
                subText: t('notifications.uniqueConstraint')
            });
        }
    }, [addPlayer, benchId, haptics, showNotification, t]);

    return (
        <div ref={setNodeRef} className="flex flex-col h-full w-full">
            {/* Bench Header */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/5 pb-2 mb-2">
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                    {t('teamManager.benchLabel')}
                </h4>
                <button
                    onClick={onClose}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 dark:bg-white/10 text-[9px] font-bold uppercase hover:bg-slate-200 transition-colors"
                >
                    <ChevronLeft size={12} /> {t('common.back')}
                </button>
            </div>

            {/* Bench List */}
            <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="space-y-2 min-h-[100px]"
            >
                {reserves.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 opacity-60 border-2 border-dashed border-slate-300/50 dark:border-white/10 rounded-xl bg-white/5 dark:bg-white/[0.02]">
                        <UserPlus size={20} className="text-slate-400 mb-2" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            {t('common.empty')}
                        </span>
                    </div>
                ) : (
                    <SortableContext items={reserves.map(p => p.id)} strategy={verticalListSortingStrategy}>
                        <AnimatePresence initial={false}>
                            {reserves.map(p => (
                                <PlayerListItem
                                    key={p.id}
                                    player={p}
                                    locationId={benchId}
                                    isCompact={true}
                                />
                            ))}
                        </AnimatePresence>
                    </SortableContext>
                )}
            </motion.div>

            <AddPlayerForm
                onAdd={handleAdd}
                disabled={isFull}
                customLabel={t('teamManager.benchLabel')}
            />
        </div>
    );
});
