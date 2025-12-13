
import React, { useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { HistoryList } from '../History/HistoryList';
import { useTranslation } from '../../contexts/LanguageContext';
import { useTutorial } from '../../hooks/useTutorial';
import { TutorialModal } from './TutorialModal';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const { activeTutorial, triggerTutorial, completeTutorial, isLoaded } = useTutorial(false);

  useEffect(() => {
      if (isLoaded) {
          triggerTutorial('history');
      }
  }, [isLoaded, triggerTutorial]);

  return (
    <Modal 
        isOpen={isOpen} 
        onClose={onClose} 
        title={t('historyList.title')}
        maxWidth="max-w-xl"
    >
        <TutorialModal 
            isOpen={activeTutorial === 'history'} 
            tutorialKey="history" 
            onClose={completeTutorial} 
        />
        
        <div className="h-[70vh] flex flex-col">
            <HistoryList />
        </div>
    </Modal>
  );
};
