import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

export type ModalType = 'settings' | 'manager' | 'history' | 'court' | 'resetConfirm' | 'liveSync' | 'adConfirm' | 'fsMenu' | 'match_over' | 'none';

interface ModalContextType {
  activeModal: ModalType;
  openModal: (type: ModalType) => void;
  closeModal: () => void;
  closeAll: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [modalStack, setModalStack] = useState<ModalType[]>([]);

  const activeModal = useMemo(() => {
    return modalStack.length > 0 ? modalStack[modalStack.length - 1] : 'none';
  }, [modalStack]);

  const openModal = useCallback((type: ModalType) => {
    setModalStack(prev => {
      // Prevent pushing the same modal twice consecutively
      if (prev.length > 0 && prev[prev.length - 1] === type) return prev;
      return [...prev, type];
    });
  }, []);

  const closeModal = useCallback(() => {
    setModalStack(prev => {
      if (prev.length === 0) return prev;
      const newStack = [...prev];
      newStack.pop();
      return newStack;
    });
  }, []);

  const closeAll = useCallback(() => {
    setModalStack([]);
  }, []);

  const value = useMemo(() => ({ activeModal, openModal, closeModal, closeAll }), [activeModal, openModal, closeModal, closeAll]);

  return (
    <ModalContext.Provider value={value}>
      {children}
    </ModalContext.Provider>
  );
};

export const useModals = () => {
  const context = useContext(ModalContext);
  if (!context) throw new Error('useModals must be used within ModalProvider');
  return context;
};