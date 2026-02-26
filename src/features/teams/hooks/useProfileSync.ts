
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@contexts/AuthContext';
import { usePlayerProfiles } from './usePlayerProfiles';

export const useProfileSync = () => {
    const { user } = useAuth();
    const { profiles, upsertProfile, isReady } = usePlayerProfiles();
    const [showSyncModal, setShowSyncModal] = useState(false);
    const [syncedUser, setSyncedUser] = useState<{ name: string; photo?: string } | null>(null);

    // Ref para evitar loops ou sincronizações repetidas na mesma sessão
    const lastProcessedUid = useRef<string | null>(null);

    useEffect(() => {
        if (!isReady || !user) {
            if (!user) lastProcessedUid.current = null;
            return;
        }

        // Se o usuário mudou ou ainda não foi processado
        if (user.uid !== lastProcessedUid.current) {
            const existingProfile = Array.from(profiles.values()).find(p => p.firebaseUid === user.uid);

            if (!existingProfile) {
                // Criar ou Vincular perfil
                const newProfile = upsertProfile(
                    user.displayName || 'Jogador',
                    5, // Skill level padrão
                    undefined,
                    {
                        firebaseUid: user.uid,
                        avatar: user.photoURL || undefined,
                    }
                );

                setSyncedUser({
                    name: newProfile.name,
                    photo: newProfile.avatar
                });
                setShowSyncModal(true);
            } else if (!existingProfile.avatar && user.photoURL) {
                // Se já existe mas não tem foto, atualiza com a foto do Google
                upsertProfile(existingProfile.name, existingProfile.skillLevel, existingProfile.id, {
                    avatar: user.photoURL
                });
            }

            lastProcessedUid.current = user.uid;
        }
    }, [user, isReady, profiles, upsertProfile]);

    return {
        showSyncModal,
        setShowSyncModal,
        syncedUser
    };
};
