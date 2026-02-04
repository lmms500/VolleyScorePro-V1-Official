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
  sessionId?: string;
  isHost?: boolean;
  isSpectator?: boolean;
  onStopBroadcast?: () => void;
  onLeaveSession?: () => void;
  spectatorCount?: number;  // Number of connected spectators
}

export const LiveSyncModal: React.FC<LiveSyncModalProps> = ({ isOpen, onClose, onHost, onJoin, sessionId: propSessionId, isHost, isSpectator, onStopBroadcast, onLeaveSession, spectatorCount = 0 }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const sessionId = propSessionId; 
  
  const haptics = useHaptics();
  const [code, setCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [mode, setMode] = useState<'selection' | 'join'>('selection');

  const handleCreateSession = async () => {
      if (!user) {
          alert(t('liveSync.syncRequirement'));
          haptics.notification('error');
          return;
      }
      setIsProcessing(true);
      haptics.impact('medium');
      
      const newCode = SyncEngine.getInstance().generateCode();
      await new Promise(r => setTimeout(r, 800)); 
      
      onHost(newCode);
      setIsProcessing(false);
      onClose();
  };

  const handleJoinSession = () => {
      if (code.length >= 5) {
          onJoin(code);
          haptics.notification('success');
          onClose();
      } else {
          haptics.notification('error');
      }
  };

  const copyCode = () => {
      if (!sessionId) return;
      navigator.clipboard.writeText(sessionId);
      haptics.notification('success');
      alert(t('liveSync.codeCopied'));
  };

  const copyObsUrl = () => {
      if (!sessionId) return;
      const baseUrl = window.location.origin + window.location.pathname;
      const url = `${baseUrl}?mode=broadcast&code=${sessionId}&obsLayout=horizontal`;
      navigator.clipboard.writeText(url);
      haptics.notification('success');
      alert(t('liveSync.overlayCopied'));
  };

  const handleCopyCode = () => {
      if (code.length < 5) {
          haptics.notification('error');
          return;
      }
      navigator.clipboard.writeText(code);
      haptics.notification('success');
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
                <div className="p-4 bg-slate-100 dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/10 flex flex-col gap-4">
                    {/* Status Badge */}
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 flex-1">
                            <div className={`h-2 w-2 rounded-full animate-pulse ${isHost ? 'bg-red-500' : 'bg-emerald-500'}`} />
                            <div className="flex-1">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    {isHost ? t('liveSync.broadcasting') : t('liveSync.watching')}
                                </p>
                                <p className="text-xl font-black text-indigo-500 tabular-nums">{sessionId}</p>
                            </div>
                        </div>
                        <button
                            onClick={copyCode}
                            title={t('liveSync.copyCode')}
                            className="p-2 hover:bg-indigo-500/10 rounded-lg transition-colors"
                        >
                            <Copy size={16} className="text-indigo-500" />
                        </button>
                    </div>

                    {/* Host Controls */}
                    {isHost && (
                        <div className="space-y-3">
                            <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                                <div className="p-2 bg-white/5 rounded-lg">
                                    <p className="text-slate-400 uppercase font-bold tracking-widest">Role</p>
                                    <p className="font-black text-red-500 mt-1">Host</p>
                                </div>
                                <div className="p-2 bg-white/5 rounded-lg">
                                    <p className="text-slate-400 uppercase font-bold tracking-widest">Status</p>
                                    <p className="font-black text-emerald-500 mt-1">Active</p>
                                </div>
                                <div className="p-2 bg-white/5 rounded-lg">
                                    <p className="text-slate-400 uppercase font-bold tracking-widest">Watching</p>
                                    <p className="font-black text-indigo-500 mt-1">{spectatorCount}</p>
                                </div>
                            </div>

                            <button 
                                onClick={copyObsUrl}
                                className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20 hover:shadow-lg hover:bg-indigo-600 active:scale-95 transition-all"
                            >
                                <Monitor size={14} /> {t('liveSync.copyObsLink')}
                            </button>

                            {onStopBroadcast && (
                                <button 
                                    onClick={() => {
                                        onStopBroadcast();
                                        onClose();
                                    }}
                                    className="w-full flex items-center justify-center gap-2 py-3 bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl text-[10px] font-black uppercase tracking-widest border border-rose-500/30 hover:bg-rose-500/30 active:scale-95 transition-all"
                                >
                                    <Radio size={14} /> {t('liveSync.stopBroadcast')}
                                </button>
                            )}
                        </div>
                    )}

                    {/* Spectator Controls */}
                    {isSpectator && (
                        <div className="space-y-3">
                            <div className="p-2 bg-white/5 rounded-lg text-center">
                                <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">Connected</p>
                                <p className="font-black text-emerald-500 mt-1">As Spectator</p>
                            </div>

                            {onLeaveSession && (
                                <button 
                                    onClick={() => {
                                        onLeaveSession();
                                        onClose();
                                    }}
                                    className="w-full flex items-center justify-center gap-2 py-3 bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl text-[10px] font-black uppercase tracking-widest border border-amber-500/30 hover:bg-amber-500/30 active:scale-95 transition-all"
                                >
                                    <Users size={14} /> {t('liveSync.leaveSession')}
                                </button>
                            )}
                        </div>
                    )}
                </div>
            ) : (
                <>
                    {!user && (
                        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-2">
                            <ShieldAlert size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
                            <p className="text-[10px] font-bold text-amber-600 dark:text-amber-500">
                                {t('liveSync.syncRequirement')}
                            </p>
                        </div>
                    )}
                    <button 
                        onClick={handleCreateSession}
                        disabled={isProcessing || !user}
                        className={`w-full group flex items-center justify-between p-4 rounded-2xl transition-all ${
                            !user 
                                ? 'bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 opacity-50 cursor-not-allowed' 
                                : 'bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 hover:border-indigo-500/50 active:scale-[0.98]'
                        }`}
                    >
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl shadow-lg ${!user ? 'bg-slate-300 dark:bg-slate-700' : 'bg-indigo-500 shadow-indigo-500/20'} text-white`}>
                                {isProcessing ? <Loader2 size={20} className="animate-spin" /> : <Share2 size={20} />}
                            </div>
                            <div className="text-left">
                                <span className={`block font-black text-sm uppercase ${!user ? 'text-slate-400' : 'text-slate-800 dark:text-white'}`}>
                                    {t('liveSync.broadcastTitle')}
                                </span>
                                <span className="block text-[9px] text-slate-400 font-bold uppercase">{t('liveSync.broadcastSub')}</span>
                            </div>
                        </div>
                        <ArrowRight size={18} className={`transition-colors ${!user ? 'text-slate-300' : 'text-slate-300 group-hover:text-indigo-500'}`} />
                    </button>
                </>
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
                    type="text" 
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, ''))}
                    placeholder="ABC-12"
                    className="w-full bg-slate-100 dark:bg-black/40 border-2 border-transparent focus:border-emerald-500 rounded-2xl py-4 text-center text-4xl font-black tracking-[0.15em] outline-none text-slate-800 dark:text-white"
                 />
             </div>

             <div className="flex gap-3">
                 <Button variant="secondary" onClick={() => setMode('selection')} className="flex-1">{t('common.back')}</Button>
                 <Button 
                    onClick={code.length >= 5 ? handleJoinSession : handleCopyCode} 
                    disabled={code.length === 0}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20"
                >
                    {code.length >= 5 ? t('liveSync.connect') : t('liveSync.copy')}
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