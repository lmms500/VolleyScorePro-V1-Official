import { useState, useEffect, useCallback } from 'react';
import { PlayerProfile, PlayerRole, ProfileStats } from '../types';
import { SecureStorage } from '../services/SecureStorage';
import { mergeStats, StatsDelta } from '../utils/statsEngine';
import { v4 as uuidv4 } from 'uuid';

const PROFILES_STORAGE_KEY = 'player_profiles_master';

export const usePlayerProfiles = () => {
  const [profiles, setProfiles] = useState<Map<string, PlayerProfile>>(new Map());
  const [isReady, setIsReady] = useState(false);

  // Load profiles on mount
  useEffect(() => {
    const load = async () => {
      const storedData = await SecureStorage.load<PlayerProfile[]>(PROFILES_STORAGE_KEY);
      if (storedData && Array.isArray(storedData)) {
        const map = new Map();
        storedData.forEach(p => map.set(p.id, p));
        setProfiles(map);
      }
      setIsReady(true);
    };
    load();
  }, []);

  // Save profiles whenever they change
  useEffect(() => {
    if (!isReady) return;
    const array = Array.from(profiles.values());
    SecureStorage.save(PROFILES_STORAGE_KEY, array);
  }, [profiles, isReady]);

  const findProfileByName = useCallback((name: string): PlayerProfile | undefined => {
    const search = name.trim().toLowerCase();
    for (const profile of profiles.values()) {
        if (profile.name.toLowerCase() === search) return profile;
    }
    return undefined;
  }, [profiles]);

  /**
   * Smart Upsert
   */
  const upsertProfile = useCallback((name: string, skillLevel: number, id?: string, extras?: { number?: string, avatar?: string, role?: PlayerRole }): PlayerProfile => {
    const cleanName = name.trim();
    const now = Date.now();
    let existing: PlayerProfile | undefined;
    
    if (id) {
        existing = profiles.get(id);
    } else {
        existing = findProfileByName(cleanName);
    }
    
    const newProfile: PlayerProfile = {
      id: existing?.id || uuidv4(),
      name: cleanName,
      skillLevel: Math.min(10, Math.max(1, skillLevel)),
      number: extras?.number !== undefined ? extras.number : existing?.number,
      avatar: extras?.avatar !== undefined ? extras.avatar : existing?.avatar,
      role: extras?.role !== undefined ? extras.role : existing?.role,
      stats: existing?.stats, 
      createdAt: existing?.createdAt || now,
      lastUpdated: now
    };

    setProfiles(prev => {
      const next = new Map(prev);
      next.set(newProfile.id, newProfile);
      return next;
    });

    return newProfile;
  }, [profiles, findProfileByName]);

  const batchUpdateStats = useCallback((updates: Map<string, StatsDelta>) => {
    setProfiles((prev: Map<string, PlayerProfile>) => {
      const next = new Map(prev);
      let hasChanges = false;

      updates.forEach((delta, profileId) => {
        const profile = next.get(profileId);
        if (profile) {
          const newStats = mergeStats(profile.stats, delta);
          
          next.set(profileId, {
            ...profile,
            stats: newStats,
            lastUpdated: Date.now()
          });
          hasChanges = true;
        }
      });

      return hasChanges ? next : prev;
    });
  }, []);

  const deleteProfile = useCallback((id: string): PlayerProfile | undefined => {
    const profileToDelete = profiles.get(id);
    if (profileToDelete) {
        setProfiles(prev => {
          const next = new Map(prev);
          next.delete(id);
          return next;
        });
    }
    return profileToDelete;
  }, [profiles]);

  // NEW: Merge Profiles from Cloud
  const mergeProfiles = useCallback((remoteProfiles: PlayerProfile[]) => {
      setProfiles(prev => {
          // Explicit generic typing ensures 'next' is Map<string, PlayerProfile>
          const next = new Map<string, PlayerProfile>(prev);
          let changes = false;
          
          remoteProfiles.forEach(remote => {
              const local = next.get(remote.id);
              // Simple Merge: If remote is newer or local doesn't exist, take remote.
              // For safety, let's assume remote is valid if it doesn't exist locally.
              // If it exists locally, we might want to keep the one with lastUpdated (if we tracked it robustly).
              // For V1 Sync, we'll favor existing local unless it's missing.
              // Actually, SyncService typically implies merging data.
              
              if (!local) {
                  next.set(remote.id, remote);
                  changes = true;
              } else {
                  // Conflict resolution. 
                  // For now, if local has more matchesPlayed, keep local? Or trust lastUpdated.
                  if ((remote.lastUpdated || 0) > (local.lastUpdated || 0)) {
                      next.set(remote.id, remote);
                      changes = true;
                  }
              }
          });
          
          return changes ? next : prev;
      });
  }, []);

  const getProfile = useCallback((id: string) => profiles.get(id), [profiles]);

  return {
    profiles, 
    upsertProfile,
    deleteProfile,
    findProfileByName,
    getProfile,
    batchUpdateStats,
    mergeProfiles,
    isReady
  };
};