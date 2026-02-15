
import React, { useRef, useState } from 'react';
import { Crown, Zap, Check, Loader2, Terminal, Lock, User, LogOut, LogIn, Cloud, CloudDownload, UploadCloud, DownloadCloud, Power, RefreshCw, Key, Eye, EyeOff, Smartphone, RefreshCw as UpdateIcon } from 'lucide-react';
import { SectionTitle, SettingItem } from './SettingsUI';
import { Button } from '@ui/Button';
import { useTranslation } from '@contexts/LanguageContext';
import { useHaptics } from '@lib/haptics/useHaptics';
import { useAuth } from '@contexts/AuthContext';
import { useActions, useRoster } from '@contexts/GameContext';
import { SyncService } from '@features/broadcast/services/SyncService';
import { useHistoryStore } from '@features/history/store/historyStore';
import { BackupService } from '@lib/storage/BackupService';
import { parseJSONFile } from '@lib/storage/io';
import { useServiceWorker } from '@lib/pwa/useServiceWorker';
import { usePlatform } from '@lib/platform/usePlatform';
import { useTutorial } from '@features/tutorial/hooks/useTutorial';
import { AnimatePresence, motion } from 'framer-motion';
import { GameConfig } from '@types';

interface SystemTabProps {
    localConfig: GameConfig;
    setLocalConfig: React.Dispatch<React.SetStateAction<GameConfig>>;
    setPendingRestart: (val: boolean) => void;
    pendingRestart: boolean;
}

const APP_VERSION = '2.0.6';

export const SystemTab: React.FC<SystemTabProps> = ({ localConfig, setLocalConfig, setPendingRestart, pendingRestart }) => {
    const { t } = useTranslation();
    const haptics = useHaptics();
    const { user, signInWithGoogle, logout } = useAuth();
    const { mergeMatches } = useHistoryStore();
    const { profiles } = useRoster();
    const { mergeProfiles } = useActions();

    // Service Worker & Platform
    const {
        needRefresh, updateServiceWorker, checkForUpdates: checkSW, isChecking: isSWChecking,
        isInstallable, promptInstall, isStandalone
    } = useServiceWorker();
    const { isNative } = usePlatform();

    // Tutorials
    const { resetTutorials } = useTutorial(false);

    // Local UI States
    const [isRemovingAds, setIsRemovingAds] = useState(false);
    const [showDevInput, setShowDevInput] = useState(false);
    const [devPassword, setDevPassword] = useState('');
    const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
    const [backupStatus, setBackupStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [restoreStatus, setRestoreStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [statusMsg, setStatusMsg] = useState('');
    const [showKey, setShowKey] = useState(false);
    const [remoteCheckStatus, setRemoteCheckStatus] = useState<'idle' | 'checking' | 'latest' | 'available' | 'error'>('idle');
    const [remoteVersion, setRemoteVersion] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // -- LOGIC HANDLERS --

    const handleRemoveAds = () => {
        if (localConfig.adsRemoved || isRemovingAds) return;
        setIsRemovingAds(true);
        setTimeout(() => {
            setIsRemovingAds(false);
            setLocalConfig(prev => ({ ...prev, adsRemoved: true }));
            haptics.notification('success');
        }, 1500);
    };

    const handleDevLogin = () => {
        if (devPassword === 'devmode') {
            setLocalConfig(prev => ({ ...prev, developerMode: true, adsRemoved: true }));
            haptics.notification('success');
            setShowDevInput(false);
            setDevPassword('');
        } else {
            haptics.notification('error');
            setDevPassword('');
        }
    };

    const handleCloudSync = async () => {
        if (!user) {
            signInWithGoogle();
            return;
        }
        setSyncStatus('syncing');
        try {
            // 1. Pull Data
            const remoteMatches = await SyncService.pullMatches(user.uid);
            const remoteProfiles = await SyncService.pullProfiles(user.uid);

            // 2. Merge locally
            mergeMatches(remoteMatches);
            mergeProfiles(remoteProfiles);

            // 3. Push Local Data (Sync Up)
            await SyncService.pushProfiles(user.uid, Array.from(profiles.values()));

            setSyncStatus('success');
            haptics.notification('success');
            setTimeout(() => setSyncStatus('idle'), 2000);
        } catch (e) {
            console.error("Sync failed", e);
            setSyncStatus('error');
            haptics.notification('error');
        }
    };

    const handleGenerateBackup = async () => {
        setBackupStatus('loading');
        try {
            await BackupService.generateBackup();
            setBackupStatus('success');
            setTimeout(() => {
                if (!pendingRestart) setStatusMsg('');
                setBackupStatus('idle');
            }, 3000);
        } catch (e) {
            console.error('Backup failed:', e);
            setBackupStatus('error');
            setStatusMsg(t('settings.backup.error'));
        }
    };

    const handleRestoreClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
            fileInputRef.current.click();
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setRestoreStatus('loading');
        setStatusMsg(t('settings.backup.parsing'));
        try {
            const json = await parseJSONFile(file);
            const success = await BackupService.restoreBackup(json);
            if (success) {
                setRestoreStatus('success');
                setStatusMsg(t('settings.backup.success'));
                setPendingRestart(true);
            } else {
                setRestoreStatus('error');
                setStatusMsg(t('settings.backup.invalid'));
            }
        } catch (e) {
            console.error('Restore failed:', e);
            setRestoreStatus('error');
            setStatusMsg(t('settings.backup.error'));
        }
        e.target.value = '';
    };

    const handleResetTutorials = () => { resetTutorials(); haptics.notification('success'); };

    const handleSmartCheck = async () => {
        if (isNative) return;
        setRemoteCheckStatus('checking');
        checkSW();
        try {
            const response = await fetch(`/package.json?t=${Date.now()}`);
            if (response.ok) {
                const remotePkg = await response.json();
                setRemoteVersion(remotePkg.version);
                await new Promise(r => setTimeout(r, 800));
                if (remotePkg.version !== APP_VERSION) {
                    setRemoteCheckStatus('available');
                } else {
                    setRemoteCheckStatus('latest');
                }
            } else {
                setRemoteCheckStatus('error');
            }
        } catch (e) {
            console.error("Remote version check failed", e);
            setRemoteCheckStatus('error');
        }
    };

    const handleRestart = () => globalThis.location.reload();

    const isActuallyChecking = isSWChecking || remoteCheckStatus === 'checking';
    const showUpdateAvailable = needRefresh || remoteCheckStatus === 'available';

    return (
        <div className="space-y-3 landscape:grid landscape:grid-cols-2 landscape:gap-4 landscape:space-y-0">
            <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleFileChange} />

            {/* Column 1: Premium & Account */}
            <div className="space-y-3">
                <div>
                    <SectionTitle icon={Crown}>{t('settings.premium.title')}</SectionTitle>
                    <div className="space-y-2">
                        <SettingItem label={t('settings.premium.removeAds')} sub={t('settings.premium.supportDev')} icon={Zap} color={{ bg: 'bg-amber-500/10', text: 'text-amber-500' }}>
                            {localConfig.adsRemoved ? (
                                <span className="px-3 py-1.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 border border-amber-500/30"><Check size={10} strokeWidth={3} /> {t('settings.premium.active')}</span>
                            ) : (
                                <button onClick={handleRemoveAds} disabled={isRemovingAds} className="px-3 py-1.5 rounded-xl bg-amber-500 text-white text-[10px] font-bold uppercase tracking-wider shadow-md shadow-amber-500/20 hover:bg-amber-400 active:scale-95 transition-all flex items-center gap-1.5">{isRemovingAds ? <Loader2 size={12} className="animate-spin" /> : <Crown size={12} fill="currentColor" />} $4.99</button>
                            )}
                        </SettingItem>
                        <SettingItem label={t('settings.premium.devMode')} icon={Terminal} color={{ bg: 'bg-slate-500/10', text: 'text-slate-500' }}>
                            <button onClick={() => setShowDevInput(!showDevInput)} className={`p-2 rounded-xl transition-all ${localConfig.developerMode ? 'bg-emerald-500 text-white shadow-emerald-500/30' : 'bg-slate-100 dark:bg-white/10 text-slate-400 hover:text-slate-600'}`}>
                                {localConfig.developerMode ? <Check size={16} /> : <Terminal size={16} />}
                            </button>
                        </SettingItem>
                        <AnimatePresence>
                            {showDevInput && !localConfig.developerMode && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                    <div className="flex gap-2 pt-1 pb-1">
                                        <div className="relative flex-1">
                                            <Lock size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input type="password" placeholder={t('settings.premium.accessCode')} value={devPassword} onChange={(e) => setDevPassword(e.target.value)} className="w-full pl-8 pr-3 py-2 bg-slate-100 dark:bg-black/20 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 border border-transparent focus:border-indigo-500 transition-all" />
                                        </div>
                                        <button onClick={handleDevLogin} className="px-3 py-2 bg-slate-800 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-bold shadow-sm active:scale-95">{t('settings.premium.enter')}</button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* ACCOUNT & SYNC SECTION */}
                <div>
                    <SectionTitle icon={User}>{t('settings.sections.sync')}</SectionTitle>
                    {user ? (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between p-3 rounded-2xl bg-white/60 dark:bg-white/5 border border-black/5 dark:border-white/5">
                                <div className="flex items-center gap-3 min-w-0">
                                    {user.photoURL ? <img src={user.photoURL} alt="User" className="w-10 h-10 rounded-xl flex-shrink-0" /> : <div className="w-10 h-10 rounded-xl bg-indigo-500 text-white flex items-center justify-center font-bold flex-shrink-0 text-base">{user.displayName?.charAt(0)}</div>}
                                    <div className="min-w-0">
                                        <div className="text-sm font-bold text-slate-800 dark:text-white truncate">{user.displayName}</div>
                                        <div className="text-[10px] text-slate-400 truncate">{user.email}</div>
                                    </div>
                                </div>
                                <button onClick={logout} className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl flex-shrink-0 transition-colors"><LogOut size={18} /></button>
                            </div>

                            {/* CLOUD SYNC BUTTON */}
                            <button
                                onClick={handleCloudSync}
                                disabled={syncStatus === 'syncing'}
                                className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all border
                                ${syncStatus === 'syncing' ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 border-indigo-200' : (syncStatus === 'success' ? 'bg-emerald-500 text-white border-emerald-600' : 'bg-white dark:bg-white/5 text-indigo-600 dark:text-indigo-400 border-black/5 dark:border-white/10 hover:bg-indigo-50 dark:hover:bg-white/10')}`}
                            >
                                {syncStatus === 'syncing' ? <Loader2 size={14} className="animate-spin" /> : (syncStatus === 'success' ? <Check size={14} strokeWidth={3} /> : <Cloud size={14} />)}
                                {syncStatus === 'syncing' ? t('settings.sync.status.syncing') : (syncStatus === 'success' ? t('settings.sync.status.synced') : t('settings.sync.status.syncNow'))}
                            </button>
                        </div>
                    ) : (
                        <button onClick={signInWithGoogle} className="w-full flex items-center justify-center gap-2 py-3 bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-50 dark:hover:bg-white/10 transition-colors"><LogIn size={14} /> {t('settings.account.signInGoogle')}</button>
                    )}
                </div>

                {/* Data Backup */}
                <div>
                    <SectionTitle icon={CloudDownload}>{t('settings.backup.title')}</SectionTitle>
                    {pendingRestart ? (
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-600 dark:text-emerald-400 text-xs font-bold"><Check size={16} /> {t('settings.backup.restoredTitle')}</div>
                            <Button onClick={handleRestart} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg"><Power size={16} /> {t('settings.backup.restartBtn')}</Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-3 p-1">
                            <button onClick={handleGenerateBackup} disabled={backupStatus === 'loading'} className={`flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border transition-all ${backupStatus === 'loading' ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200' : 'bg-white dark:bg-white/5 border-black/5 dark:border-white/5 hover:border-indigo-500/30 active:scale-95 text-slate-600 dark:text-slate-300 shadow-sm'}`}>
                                {backupStatus === 'loading' ? <Loader2 size={20} className="animate-spin text-indigo-500" /> : <UploadCloud size={20} className="text-indigo-500" />}
                                <span className="text-[9px] font-bold uppercase tracking-wider">{t('settings.backup.backupBtn')}</span>
                            </button>
                            <button onClick={handleRestoreClick} disabled={restoreStatus === 'loading'} className={`flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border transition-all ${restoreStatus === 'loading' ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200' : 'bg-white dark:bg-white/5 border-black/5 dark:border-white/5 hover:border-emerald-500/30 active:scale-95 text-slate-600 dark:text-slate-300 shadow-sm'}`}>
                                {restoreStatus === 'loading' ? <Loader2 size={20} className="animate-spin text-emerald-500" /> : <DownloadCloud size={20} className="text-emerald-500" />}
                                <span className="text-[9px] font-bold uppercase tracking-wider">{t('settings.backup.restoreBtn')}</span>
                            </button>
                        </div>
                    )}
                    {(statusMsg && !pendingRestart) && <p className={`text-[9px] mt-2 text-center font-bold ${statusMsg.includes('Error') || statusMsg.includes('Failed') || statusMsg.includes('Invalid') ? 'text-rose-500' : 'text-emerald-500'}`}>{statusMsg}</p>}
                    {!pendingRestart && <p className="text-[9px] text-slate-400 mt-2 text-center">{t('settings.backup.description')}</p>}
                    <div className="mt-3 pt-3 border-t border-black/5 dark:border-white/5">
                        <button onClick={handleResetTutorials} className="w-full flex items-center justify-center gap-2 py-2 text-[9px] font-bold uppercase tracking-wider text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-colors"><RefreshCw size={12} /> {t('settings.backup.resetTutorials')}</button>
                    </div>
                </div>
            </div>

            {/* Column 2: System & AI */}
            <div className="space-y-3">
                <div className="bg-slate-50 dark:bg-white/5 p-3 rounded-2xl border border-black/5 dark:border-white/5">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300"><Key size={12} className="text-violet-500" /> {t('settings.ai.apiKey')}</div>
                        <button onClick={() => setShowKey(!showKey)} className="text-slate-400 hover:text-indigo-500">{showKey ? <EyeOff size={14} /> : <Eye size={14} />}</button>
                    </div>
                    <input type={showKey ? "text" : "password"} value={localConfig.userApiKey || ''} onChange={(e) => setLocalConfig(prev => ({ ...prev, userApiKey: e.target.value }))} placeholder={t('settings.ai.placeholder')} className="w-full bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-violet-500 transition-colors" />
                    <p className="text-[9px] text-slate-400 mt-2">{t('settings.ai.help')} <a href="https://aistudio.google.com/app/apikey" target="_blank" className="text-violet-500 underline hover:text-violet-400">{t('settings.ai.getKey')}</a></p>
                </div>

                <div>
                    <SectionTitle icon={Smartphone}>{t('settings.sections.install')}</SectionTitle>
                    {!isNative && isInstallable && !isStandalone && (
                        <Button onClick={promptInstall} size="sm" className="w-full bg-indigo-600 text-white shadow-indigo-500/20 mb-3"><Smartphone size={16} /> {t('install.installNow')}</Button>
                    )}
                    <div className="flex items-center justify-between p-3 rounded-2xl bg-white/60 dark:bg-white/5 border border-black/5 dark:border-white/5">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full ${showUpdateAvailable && !isNative ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-white/10 text-slate-400'}`}>{!isNative && isActuallyChecking ? <UpdateIcon size={16} className="animate-spin" /> : (!isNative && showUpdateAvailable ? <CloudDownload size={16} /> : <Check size={16} />)}</div>
                            <div>
                                <div className="text-xs font-bold text-slate-700 dark:text-slate-200">{t('settings.install.version')} {APP_VERSION}</div>
                                <div className={`text-[10px] ${!isNative && showUpdateAvailable ? 'text-emerald-600' : 'text-slate-400'}`}>{!isNative && showUpdateAvailable ? `${t('settings.install.updateAvailable')} ${remoteVersion ? `(v${remoteVersion})` : ''}` : t('settings.install.upToDate')}</div>
                            </div>
                        </div>
                        {!isNative && (showUpdateAvailable ? <button onClick={updateServiceWorker} className="px-3 py-1.5 bg-emerald-500 text-white text-[10px] font-bold rounded-xl shadow-sm hover:bg-emerald-400 transition-colors">{t('settings.install.update')}</button> : <button onClick={handleSmartCheck} className="px-3 py-1.5 bg-slate-100 dark:bg-white/10 text-slate-500 text-[10px] font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-white/20 transition-colors">{t('settings.install.check')}</button>)}
                    </div>
                    {isNative && <div className="text-center text-[10px] text-slate-400 mt-2 font-mono">{t('settings.install.native')}</div>}
                </div>
            </div>
        </div>
    );
};
