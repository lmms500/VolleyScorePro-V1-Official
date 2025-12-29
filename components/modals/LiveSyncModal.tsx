import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { motion } from 'framer-motion';
import { Share2, Users, Radio, ArrowRight, Loader2, Check, ShieldAlert, Monitor, Copy } from 'lucide-react';
import { useTranslation } from '../../contexts/LanguageContext';
import { useHaptics } from '../../hooks/useHaptics';
import { SyncEngine } from '../../services/SyncEngine';
import { useAuth } from '../../contexts/AuthContext';
import { useRoster } from '../../contexts/GameContext'; // UPDATED

interface LiveSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onHost: (code: string) => void;
  onJoin: (code: string) => void;
}

export const LiveSyncModal: React.FC<LiveSyncModalProps> = ({ isOpen, onClose, onHost, onJoin }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  // Refactor: Use Roster context for sessionId
  const { sessionId } = useRoster(); 
  
  const haptics = useHaptics();
  const [code, setCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [mode, setMode] = useState<'selection' | 'join'>('selection');

  const handleCreateSession = async () => {
      if (!user) return;
      setIsProcessing(true);
      haptics.impact('medium');
      
      const newCode = SyncEngine.getInstance().generateCode();
      await new Promise(r => setTimeout(r, 800)); 
      
      onHost(newCode);
      setIsProcessing(false);
  };

  const handleJoinSession = () => {
      if (code.length === 6) {
          onJoin(code);
          haptics.notification('success');
          onClose();
      } else {
          haptics.notification('error');
      }
  };

  const copyOverlayUrl = () => {
      if (!sessionId) return;
      const baseUrl = window.location.origin + window.location.pathname;
      const url = `${baseUrl}?mode=broadcast&code=${sessionId}`;
      navigator.clipboard.writeText(url);
      haptics.notification('success');
      alert(t('liveSync.overlayCopied'));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('liveSync.title')} maxWidth="max-w-sm">
      <div className="flex flex-col gap-6 py-2">
        
        {mode === 'selection' ? (
          <div className="space-y-4">
            <div className="bg-indigo-500/10 p-4 rounded-2xl border border-indigo-500/20 text-center">
                <Radio size={32} className="mx-auto text-indigo-500 mb-2 animate-pulse" />
                <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-tight">{t('status.live')}</h3>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 uppercase font-bold">{t('liveSync.syncRequirement')}</p>
            </div>

            {sessionId ? (
                <div className="p-4 bg-slate-100 dark:bg-white/5 rounded-2xl border border-black/5 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('liveSync.activeSession')}</span>
                        <span className="text-xl font-black text-indigo-500">{sessionId}</span>
                    </div>
                    <button 
                        onClick={copyOverlayUrl}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
                    >
                        <Monitor size={14} /> {t('liveSync.copyOverlay')}
                    </button>
                </div>
            ) : (
                <button 
                    onClick={handleCreateSession}
                    disabled={isProcessing}
                    className="w-full group flex items-center justify-between p-4 bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl hover:border-indigo-500/50 transition-all active:scale-[0.98]"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-500 rounded-xl text-white shadow-lg shadow-indigo-500/20">
                            {isProcessing ? <Loader2 size={20} className="animate-spin" /> : <Share2 size={20} />}
                        </div>
                        <div className="text-left">
                            <span className="block font-black text-sm text-slate-800 dark:text-white uppercase">{t('liveSync.broadcastTitle')}</span>
                            <span className="block text-[9px] text-slate-400 font-bold uppercase">{t('liveSync.broadcastSub')}</span>
                        </div>
                    </div>
                    <ArrowRight size={18} className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
                </button>
            )}

            <button 
                onClick={() => setMode('join')}
                className="w-full group flex items-center justify-between p-4 bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl hover:border-emerald-500/50 transition-all active:scale-[0.98]"
            >
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-500 rounded-xl text-white shadow-lg shadow-emerald-500/20">
                        <Users size={20} />
                    </div>
                    <div className="text-left">
                        <span className="block font-black text-sm text-slate-800 dark:text-white uppercase">{t('liveSync.watchTitle')}</span>
                        <span className="block text-[9px] text-slate-400 font-bold uppercase">{t('liveSync.watchSub')}</span>
                    </div>
                </div>
                <ArrowRight size={18} className="text-slate-300 group-hover:text-emerald-500 transition-colors" />
            </button>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
             <div className="flex flex-col items-center gap-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('liveSync.enterCode')}</label>
                 <input 
                    type="tel" 
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="000 000"
                    className="w-full bg-slate-100 dark:bg-black/40 border-2 border-transparent focus:border-emerald-500 rounded-2xl py-4 text-center text-4xl font-black tracking-[0.2em] outline-none text-slate-800 dark:text-white"
                 />
             </div>

             <div className="flex gap-3">
                 <Button variant="secondary" onClick={() => setMode('selection')} className="flex-1">{t('common.back')}</Button>
                 <Button 
                    onClick={handleJoinSession} 
                    disabled={code.length < 6}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20"
                >
                    {t('liveSync.copy')}
                </Button>
             </div>
          </div>
        )}

        <div className="flex items-start gap-2 p-3 bg-amber-500/5 rounded-xl border border-amber-500/10">
            <ShieldAlert size={14} className="text-amber-500 shrink-0 mt-0.5" />
            <p className="text-[9px] text-amber-700 dark:text-amber-400 font-medium leading-relaxed">
                {t('liveSync.syncRequirement')}
            </p>
        </div>
      </div>
    </Modal>
  );
};