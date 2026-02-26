
import React from 'react';
import { useProfileSync } from '../hooks/useProfileSync';
import { SyncConfirmationModal } from '@features/social/components/SyncConfirmationModal';

export const ProfileSyncManager: React.FC = () => {
    const { showSyncModal, setShowSyncModal, syncedUser } = useProfileSync();

    return (
        <SyncConfirmationModal
            isOpen={showSyncModal}
            onClose={() => setShowSyncModal(false)}
            userName={syncedUser?.name || ''}
            userPhoto={syncedUser?.photo}
        />
    );
};
