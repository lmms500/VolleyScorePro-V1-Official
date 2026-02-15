
import React, { useEffect, lazy, Suspense, memo } from 'react';
import { Modal } from '@ui/Modal';
import { HistoryList } from '../components/HistoryList';
import { useTranslation } from '@contexts/LanguageContext';
import { useTutorial } from '@features/tutorial/hooks/useTutorial';

const RichTutorialModal = lazy(() => import('@features/tutorial/modals/RichTutorialModal').then(m => ({ default: m.RichTutorialModal })));

interface HistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    developerMode?: boolean;
    zIndex?: string; // New prop for layering
}

export const HistoryModal: React.FC<HistoryModalProps> = memo(({ isOpen, onClose, developerMode, zIndex }) => {
    const { t } = useTranslation();
    // Pass developerMode to block tutorial if enabled
    const { activeTutorial, triggerTutorial, completeTutorial, isLoaded } = useTutorial(false, developerMode);

    useEffect(() => {
        if (isLoaded && isOpen) {
            triggerTutorial('history');
        }
    }, [isLoaded, triggerTutorial, isOpen]);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="" // Empty title to remove default header text
            showCloseButton={false} // Disable default close button, handled internally by HistoryList
            variant="immersive"
            zIndex={zIndex}
        >
            <Suspense fallback={null}>
                {activeTutorial === 'history' && (
                    <RichTutorialModal
                        isOpen={true}
                        tutorialKey="history"
                        onClose={completeTutorial}
                    />
                )}
            </Suspense>

            <div className="h-full flex flex-col pb-safe-bottom glass-hardware-accelerated">
                <HistoryList onClose={onClose} />
            </div>
        </Modal>
    );
});
