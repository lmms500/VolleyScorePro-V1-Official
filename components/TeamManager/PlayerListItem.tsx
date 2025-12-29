
import React, { memo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Player } from '../../types';
import { PlayerCard } from '../PlayerCard';
import { staggerItem } from '../../utils/animations';
import { useActions, useRoster } from '../../contexts/GameContext';
import { useNotification } from '../../contexts/NotificationContext';
import { useTranslation } from '../../contexts/LanguageContext';
import { useHaptics } from '../../hooks/useHaptics';
import { useRosterStore } from '../../stores/rosterStore';

interface PlayerListItemProps {
    player: Player;
    locationId: string;
    isCompact?: boolean;
}

export const PlayerListItem = memo(({ player, locationId, isCompact }: PlayerListItemProps) => {
    const { updatePlayer, savePlayerToProfile } = useActions();
    const { profiles } = useRoster();
    const { showNotification } = useNotification();
    const { t } = useTranslation();
    const haptics = useHaptics();

    // Store Selectors
    const setEditingTarget = useRosterStore(s => s.setEditingTarget);
    const setViewingProfileId = useRosterStore(s => s.setViewingProfileId);
    const setActivePlayerMenu = useRosterStore(s => s.setActivePlayerMenu);
    const setActiveNumberId = useRosterStore(s => s.setActiveNumberId);
    const activeNumberId = useRosterStore(s => s.activeNumberId);
    const activePlayerMenuId = useRosterStore(s => s.activePlayerMenu?.playerId);

    const profile = player.profileId ? profiles.get(player.profileId) : undefined;

    const handleUpdatePlayer = useCallback((id: string, updates: Partial<Player>) => {
        const result = updatePlayer(id, updates);
        if (result && result.success === false) {
            haptics.notification('error');
            showNotification({
                type: 'error',
                mainText: result.errorKey ? t(result.errorKey, result.errorParams) : t('notifications.numberUnavailable'),
                subText: t('validation.uniqueConstraint')
            });
            return result;
        }
    }, [updatePlayer, showNotification, t, haptics]);

    const handleSaveProfile = useCallback((id: string, overrides: any) => {
        const result = savePlayerToProfile(id, overrides);
        if (result && !result.success) {
            haptics.notification('error');
            showNotification({
                type: 'error',
                mainText: result.errorKey ? t(result.errorKey) : t('notifications.saveFailed'),
                subText: t('notifications.numberConflict')
            });
        }
    }, [savePlayerToProfile, showNotification, t, haptics]);

    const handleToggleMenu = useCallback((id: string, target: HTMLElement) => {
        setActivePlayerMenu({ playerId: id, rect: target.getBoundingClientRect() });
    }, [setActivePlayerMenu]);

    return (
        <motion.div 
            layout
            variants={staggerItem}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="w-full"
        >
            <PlayerCard 
                player={player}
                locationId={locationId}
                profile={profile}
                onUpdatePlayer={handleUpdatePlayer}
                onSaveProfile={handleSaveProfile}
                onRequestProfileEdit={() => setEditingTarget({ type: 'player', id: player.id })}
                onViewProfile={() => setViewingProfileId(player.id)}
                onToggleMenu={handleToggleMenu}
                isMenuActive={activePlayerMenuId === player.id}
                onShowToast={(msg, type) => showNotification({ mainText: msg, type })}
                isCompact={isCompact}
                activeNumberId={activeNumberId}
                onRequestEditNumber={setActiveNumberId}
            />
        </motion.div>
    );
});
