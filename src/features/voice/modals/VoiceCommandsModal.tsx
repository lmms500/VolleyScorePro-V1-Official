
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

const Section = ({ title, icon: Icon, gradientFrom, gradientTo, shadowColor, children }: { title: string; icon: React.ElementType; gradientFrom: string; gradientTo: string; shadowColor: string; children?: React.ReactNode }) => (
    <div className="mb-4 bg-white/60 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/60 dark:border-white/10 ring-1 ring-inset ring-white/10 shadow-[0_1px_3px_rgba(0,0,0,0.04),inset_0_1px_0_0_rgba(255,255,255,0.15)]">
        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-black/5 dark:border-white/5">
            <div className={`p-1.5 rounded-lg bg-gradient-to-br ${gradientFrom} ${gradientTo} text-white shadow-sm ${shadowColor}`}><Icon size={12} /></div>
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
        <div className="p-3 bg-indigo-500/10 backdrop-blur-sm rounded-xl border border-indigo-500/20 ring-1 ring-inset ring-indigo-500/10 mb-4 flex gap-3 items-start">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-sm shadow-indigo-500/30 flex-shrink-0"><Mic size={14} /></div>
            <p className="text-xs text-indigo-800 dark:text-indigo-200 leading-relaxed">
                {t('voice.intro')}
            </p>
        </div>

        <Section title={t('voice.sections.basic')} icon={Zap} gradientFrom="from-amber-400" gradientTo="to-amber-500" shadowColor="shadow-amber-500/30">
            <CommandRow cmd={t('voice.commands.pointA')} desc={t('voice.commands.pointA_desc')} />
            <CommandRow cmd={t('voice.commands.pointDynamic')} desc={t('voice.commands.pointDynamic_desc')} />
            <CommandRow cmd={t('voice.commands.remove')} desc={t('voice.commands.remove_desc')} />
        </Section>

        <Section title={t('voice.sections.stats')} icon={User} gradientFrom="from-emerald-500" gradientTo="to-emerald-600" shadowColor="shadow-emerald-500/30">
            <CommandRow cmd={t('voice.commands.pointPlayer')} desc={t('voice.commands.pointPlayer_desc')} />
            <CommandRow cmd={t('voice.commands.ace')} desc={t('voice.commands.ace_desc')} />
            <CommandRow cmd={t('voice.commands.block')} desc={t('voice.commands.block_desc')} />
            <CommandRow cmd={t('voice.commands.attack')} desc={t('voice.commands.attack_desc')} />
        </Section>

        <Section title={t('voice.sections.controls')} icon={RotateCcw} gradientFrom="from-rose-500" gradientTo="to-rose-600" shadowColor="shadow-rose-500/30">
            <CommandRow cmd={t('voice.commands.undo')} desc={t('voice.commands.undo_desc')} />
            <CommandRow cmd={t('voice.commands.timeout')} desc={t('voice.commands.timeout_desc')} />
            <CommandRow cmd={t('voice.commands.serve')} desc={t('voice.commands.serve_desc')} />
        </Section>
      </div>
    </Modal>
  );
};
