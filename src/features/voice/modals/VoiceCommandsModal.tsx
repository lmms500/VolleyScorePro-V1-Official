
import React from 'react';
import { Modal } from '@ui/Modal';
import { Mic, Zap, User, RotateCcw } from 'lucide-react';
import { useTranslation } from '@contexts/LanguageContext';

interface VoiceCommandsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CommandRow = ({ cmd, desc }: { cmd: string, desc: string }) => (
    <div className="flex flex-col py-2 border-b border-black/5 dark:border-white/5 last:border-0">
        <span className="text-sm font-bold text-slate-800 dark:text-white">"{cmd}"</span>
        <span className="text-xs text-slate-500 dark:text-slate-400">{desc}</span>
    </div>
);

const Section = ({ title, icon: Icon, colorClass, children }: any) => (
    <div className="mb-4 bg-white/50 dark:bg-white/5 rounded-2xl p-4 border border-black/5 dark:border-white/5">
        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-black/5 dark:border-white/5">
            <Icon size={16} className={colorClass} />
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">{title}</h4>
        </div>
        {children}
    </div>
);

export const VoiceCommandsModal: React.FC<VoiceCommandsModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('voice.title')} maxWidth="max-w-md">
      <div className="pb-6">
        <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20 mb-4 flex gap-3 items-start">
            <Mic size={20} className="text-indigo-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-indigo-800 dark:text-indigo-200 leading-relaxed">
                {t('voice.intro')}
            </p>
        </div>

        <Section title={t('voice.sections.basic')} icon={Zap} colorClass="text-amber-500">
            <CommandRow cmd={t('voice.commands.pointA')} desc={t('voice.commands.pointA_desc')} />
            <CommandRow cmd={t('voice.commands.pointDynamic')} desc={t('voice.commands.pointDynamic_desc')} />
            <CommandRow cmd={t('voice.commands.remove')} desc={t('voice.commands.remove_desc')} />
        </Section>

        <Section title={t('voice.sections.stats')} icon={User} colorClass="text-emerald-500">
            <CommandRow cmd={t('voice.commands.pointPlayer')} desc={t('voice.commands.pointPlayer_desc')} />
            <CommandRow cmd={t('voice.commands.ace')} desc={t('voice.commands.ace_desc')} />
            <CommandRow cmd={t('voice.commands.block')} desc={t('voice.commands.block_desc')} />
            <CommandRow cmd={t('voice.commands.attack')} desc={t('voice.commands.attack_desc')} />
        </Section>

        <Section title={t('voice.sections.controls')} icon={RotateCcw} colorClass="text-rose-500">
            <CommandRow cmd={t('voice.commands.undo')} desc={t('voice.commands.undo_desc')} />
            <CommandRow cmd={t('voice.commands.timeout')} desc={t('voice.commands.timeout_desc')} />
            <CommandRow cmd={t('voice.commands.serve')} desc={t('voice.commands.serve_desc')} />
        </Section>
      </div>
    </Modal>
  );
};
