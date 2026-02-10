
import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { TeamColor, SkillType } from '../types';
import { useHaptics } from '../hooks/useHaptics';

interface NotificationState {
  visible: boolean;
  type: 'success' | 'error' | 'info';
  mainText: string;
  subText?: string;
  skill?: SkillType;
  color?: TeamColor;
  systemIcon?: 'transfer' | 'save' | 'mic' | 'alert' | 'block' | 'undo' | 'delete' | 'add' | 'roster' | 'party';
  onUndo?: () => void;
  timestamp?: number;
}

interface NotificationContextType {
  showNotification: (params: Omit<NotificationState, 'visible' | 'timestamp'>) => void;
  hideNotification: () => void;
  state: NotificationState;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<NotificationState>({
    visible: false,
    type: 'info',
    mainText: '',
  });

  const { notification: hapticNotification, impact } = useHaptics();

  const showNotification = useCallback((params: Omit<NotificationState, 'visible' | 'timestamp'>) => {
    // Logic:
    // 1. If currently showing an Error, only another Error can replace it immediately (unless it's been a while? No, stick to simple priority).
    // Actually, user action usually dictates priority. If I click something that fails, I want to see the error.
    // If I undo, I want to see the undo.
    // The "Singleton" pattern primarily prevents stacking.
    // We will allow replacement always, as most recent user action is most relevant.

    // Haptics Integration
    if (params.type === 'error') {
      hapticNotification('error');
    } else if (params.type === 'success') {
      hapticNotification('success');
    } else if (params.type === 'info') {
      impact('light');
    }

    setState({
      ...params,
      visible: true,
      timestamp: Date.now(),
    });
  }, [hapticNotification, impact]);

  const hideNotification = useCallback(() => {
    setState(prev => ({ ...prev, visible: false }));
  }, []);

  const value = useMemo(() => ({ showNotification, hideNotification, state }), [showNotification, hideNotification, state]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotification must be used within NotificationProvider');
  return context;
};
