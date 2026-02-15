
import React from 'react';
import { Modal } from '@ui/Modal';
import { Button } from '@ui/Button';
import { AlertTriangle } from 'lucide-react';
import { useTranslation } from '@contexts/LanguageContext';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  icon?: React.ElementType;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ 
  isOpen, onClose, onConfirm, title, message, confirmLabel, icon: Icon = AlertTriangle 
}) => {
  const { t } = useTranslation();
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-sm">
      <div className="flex flex-col items-center text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
        <div className="p-4 bg-rose-500/10 rounded-full text-rose-500 border border-rose-500/20 shadow-[0_0_20px_-5px_rgba(244,63,94,0.4)]">
           <Icon size={32} strokeWidth={2.5} />
        </div>
        
        <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
          {message}
        </p>

        <div className="grid grid-cols-2 gap-3 w-full pt-2">
           <Button variant="secondary" onClick={onClose}>
             {t('confirm.cancel')}
           </Button>
           <Button variant="danger" onClick={() => { onConfirm(); onClose(); }}>
             {confirmLabel || t('confirm.reset.confirmButton')}
           </Button>
        </div>
      </div>
    </Modal>
  );
};
