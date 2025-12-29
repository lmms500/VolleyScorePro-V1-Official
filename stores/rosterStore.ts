
import { create } from 'zustand';
import { Player, PlayerRole } from '../types';

export type EditingTarget = { type: 'player' | 'profile'; id: string } | null;

interface RosterState {
  // UI States
  activeTab: 'roster' | 'profiles' | 'input';
  editingTarget: EditingTarget;
  viewingProfileId: string | null;
  activePlayerMenu: { playerId: string; rect: DOMRect } | null;
  dragOverContainerId: string | null;
  activeNumberId: string | null;
  
  // Confirmation States
  benchConfirmState: { teamId: string; playerId: string; sourceId: string } | null;
  activateBenchConfirm: { teamId: string; playerId: string; fromId: string } | null;
  resetConfirmOpen: boolean;
  profileToDeleteId: string | null;

  // Actions
  setActiveTab: (tab: 'roster' | 'profiles' | 'input') => void;
  setEditingTarget: (target: EditingTarget) => void;
  setViewingProfileId: (id: string | null) => void;
  setActivePlayerMenu: (menu: { playerId: string; rect: DOMRect } | null) => void;
  setDragOverContainerId: (id: string | null) => void;
  setActiveNumberId: (id: string | null) => void;
  
  setBenchConfirmState: (state: { teamId: string; playerId: string; sourceId: string } | null) => void;
  setActivateBenchConfirm: (state: { teamId: string; playerId: string; fromId: string } | null) => void;
  setResetConfirmOpen: (open: boolean) => void;
  setProfileToDeleteId: (id: string | null) => void;
  
  resetStore: () => void;
}

export const useRosterStore = create<RosterState>((set) => ({
  activeTab: 'roster',
  editingTarget: null,
  viewingProfileId: null,
  activePlayerMenu: null,
  dragOverContainerId: null,
  activeNumberId: null,
  
  benchConfirmState: null,
  activateBenchConfirm: null,
  resetConfirmOpen: false,
  profileToDeleteId: null,

  setActiveTab: (activeTab) => set({ activeTab }),
  setEditingTarget: (editingTarget) => set({ editingTarget }),
  setViewingProfileId: (viewingProfileId) => set({ viewingProfileId }),
  setActivePlayerMenu: (activePlayerMenu) => set({ activePlayerMenu }),
  setDragOverContainerId: (dragOverContainerId) => set({ dragOverContainerId }),
  setActiveNumberId: (activeNumberId) => set({ activeNumberId }),
  
  setBenchConfirmState: (benchConfirmState) => set({ benchConfirmState }),
  setActivateBenchConfirm: (activateBenchConfirm) => set({ activateBenchConfirm }),
  setResetConfirmOpen: (resetConfirmOpen) => set({ resetConfirmOpen }),
  setProfileToDeleteId: (profileToDeleteId) => set({ profileToDeleteId }),

  resetStore: () => set({
    activeTab: 'roster',
    editingTarget: null,
    viewingProfileId: null,
    activePlayerMenu: null,
    dragOverContainerId: null,
    activeNumberId: null,
    benchConfirmState: null,
    activateBenchConfirm: null,
    resetConfirmOpen: false,
    profileToDeleteId: null,
  }),
}));
