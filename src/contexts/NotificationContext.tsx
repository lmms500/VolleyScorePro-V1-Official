
import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { TeamColor, SkillType } from '../types';

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

  const showNotification = useCallback((params: Omit<NotificationState, 'visible' | 'timestamp'>) => {
    setState({
      ...params,
      visible: true,
      timestamp: Date.now(),
    });
  }, []);

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
