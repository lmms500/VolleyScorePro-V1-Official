import React, { useState } from 'react';
import { Volume2, Megaphone, User, User2, AlignJustify, BellRing, Gauge, AudioWaveform, Loader2, Play, Mic, HelpCircle, Hand } from 'lucide-react';
import { GameConfig } from '@types';
import { SectionTitle, SettingItem } from './SettingsUI';
import { useTranslation } from '@contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ttsService } from '@features/voice/services/TTSService';
import { VoiceCommandsModal } from '@features/voice/modals/VoiceCommandsModal';

interface AudioTabProps {
    localConfig: GameConfig;
    setLocalConfig: React.Dispatch<React.SetStateAction<GameConfig>>;
}

export const AudioTab: React.FC<AudioTabProps> = ({ localConfig, setLocalConfig }) => {
    const { t, language } = useTranslation();
    const [isTestingVoice, setIsTestingVoice] = useState(false);
    const [showVoiceHelp, setShowVoiceHelp] = useState(false);

    const handleTestVoice = async () => {
        if (isTestingVoice) return;
        setIsTestingVoice(true);
        const langMap: Record<string, string> = { 'pt': 'pt-BR', 'en': 'en-US', 'es': 'es-ES' };
        const targetLang = langMap[language] || 'en-US';
        await ttsService.speak("VolleyScore Pro", targetLang, localConfig.voiceGender || 'female', localConfig.voiceRate || 1.0, localConfig.voicePitch || 1.0);
        setTimeout(() => setIsTestingVoice(false), 2000);
    };

    return (
        <div className="space-y-3 landscape:grid landscape:grid-cols-2 landscape:gap-4 landscape:space-y-0">
            <VoiceCommandsModal isOpen={showVoiceHelp} onClose={() => setShowVoiceHelp(false)} />

            {/* General Audio */}
            <div className="space-y-3">
                <div>
                    <SectionTitle icon={Volume2}>{t('settings.sections.audio')}</SectionTitle>
                    <div className="space-y-2">
                        <SettingItem label={t('settings.audio.soundEffects')} icon={Volume2} color={{ bg: 'bg-emerald-500/10', text: 'text-emerald-500' }}>
                            <button onClick={() => setLocalConfig(prev => ({ ...prev, enableSound: !prev.enableSound }))} className={`w-10 h-6 rounded-full p-1 transition-colors ${localConfig.enableSound ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-white/10'}`}>
                                <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${localConfig.enableSound ? 'translate-x-4' : ''}`} />
                            </button>
                        </SettingItem>
                        <SettingItem label={t('settings.audio.announcer')} sub={t('settings.audio.tts')} icon={Megaphone} color={{ bg: 'bg-amber-500/10', text: 'text-amber-500' }}>
                            <button onClick={() => setLocalConfig(prev => ({ ...prev, announceScore: !prev.announceScore }))} className={`w-10 h-6 rounded-full p-1 transition-colors ${localConfig.announceScore ? 'bg-amber-500' : 'bg-slate-200 dark:bg-white/10'}`}>
                                <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${localConfig.announceScore ? 'translate-x-4' : ''}`} />
                            </button>
                        </SettingItem>
                        {/* Advanced TTS Controls */}
                        <AnimatePresence>
                            {localConfig.announceScore && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden pl-1">
                                    <div className="p-3 bg-slate-100/50 dark:bg-white/[0.02] rounded-2xl border border-black/5 dark:border-white/5 space-y-2">
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="flex bg-white dark:bg-white/5 rounded-xl p-1 border border-black/5 dark:border-white/5">
                                                <button onClick={() => setLocalConfig(prev => ({ ...prev, voiceGender: 'male' }))} className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-all ${localConfig.voiceGender === 'male' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 shadow-sm' : 'text-slate-400'}`}><User2 size={10} /> {t('settings.audio.gender.male')}</button>
                                                <button onClick={() => setLocalConfig(prev => ({ ...prev, voiceGender: 'female' }))} className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-all ${localConfig.voiceGender === 'female' ? 'bg-pink-100 text-pink-700 dark:bg-pink-500/20 dark:text-pink-300 shadow-sm' : 'text-slate-400'}`}><User size={10} /> {t('settings.audio.gender.female')}</button>
                                            </div>
                                            <div className="flex bg-white dark:bg-white/5 rounded-xl p-1 border border-black/5 dark:border-white/5">
                                                <button onClick={() => setLocalConfig(prev => ({ ...prev, announcementFreq: 'all' }))} className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-all ${localConfig.announcementFreq === 'all' ? 'bg-slate-200 text-slate-800 dark:bg-white/20 dark:text-white shadow-sm' : 'text-slate-400'}`}><AlignJustify size={10} /> {t('settings.audio.freq.always')}</button>
                                                <button onClick={() => setLocalConfig(prev => ({ ...prev, announcementFreq: 'critical_only' }))} className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-all ${localConfig.announcementFreq === 'critical_only' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300 shadow-sm' : 'text-slate-400'}`}><BellRing size={10} /> {t('settings.audio.freq.critical')}</button>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Gauge size={14} className="text-slate-400" />
                                            <div className="flex-1 relative h-6 flex items-center">
                                                <input type="range" min="0.5" max="1.5" step="0.1" value={localConfig.voiceRate || 1.0} onChange={(e) => setLocalConfig(prev => ({ ...prev, voiceRate: parseFloat(e.target.value) }))} className="w-full h-1.5 bg-slate-200 dark:bg-white/10 rounded-full appearance-none accent-indigo-500 cursor-pointer" />
                                            </div>
                                            <span className="text-[10px] font-mono font-bold w-8 text-right text-slate-500">{localConfig.voiceRate?.toFixed(1)}x</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <AudioWaveform size={14} className="text-slate-400" />
                                            <div className="flex-1 relative h-6 flex items-center">
                                                <input type="range" min="0.5" max="1.5" step="0.1" value={localConfig.voicePitch || 1.0} onChange={(e) => setLocalConfig(prev => ({ ...prev, voicePitch: parseFloat(e.target.value) }))} className="w-full h-1.5 bg-slate-200 dark:bg-white/10 rounded-full appearance-none accent-indigo-500 cursor-pointer" />
                                            </div>
                                            <span className="text-[10px] font-mono font-bold w-8 text-right text-slate-500">{localConfig.voicePitch?.toFixed(1)}</span>
                                        </div>
                                        <button onClick={handleTestVoice} disabled={isTestingVoice} className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${isTestingVoice ? 'bg-emerald-500 text-white animate-pulse' : 'bg-white dark:bg-white/5 border border-black/5 dark:border-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10'}`}>
                                            {isTestingVoice ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} fill="currentColor" />} {isTestingVoice ? t('app.loading') : t('settings.audio.testVoice')}
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Voice Control section */}
            <div className="space-y-3">
                <div>
                    <SectionTitle icon={Mic}>{t('settings.audio.voiceControl')}</SectionTitle>
                    <div className="space-y-2">
                        <SettingItem label={t('settings.audio.voiceControl')} sub={t('settings.audio.voiceControlSub')} icon={Mic} color={{ bg: 'bg-rose-500/10', text: 'text-rose-500' }}>
                            <div className="flex gap-2">
                                <button onClick={() => setShowVoiceHelp(true)} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-white/10 text-slate-500 hover:text-indigo-500 transition-colors"><HelpCircle size={14} /></button>
                                <button onClick={() => setLocalConfig(prev => ({ ...prev, voiceControlEnabled: !prev.voiceControlEnabled }))} className={`w-10 h-6 rounded-full p-1 transition-colors ${localConfig.voiceControlEnabled ? 'bg-rose-500' : 'bg-slate-200 dark:bg-white/10'}`}>
                                    <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${localConfig.voiceControlEnabled ? 'translate-x-4' : ''}`} />
                                </button>
                            </div>
                        </SettingItem>
                        <AnimatePresence>
                            {localConfig.voiceControlEnabled && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden pl-1">
                                    <SettingItem label="Push-to-Talk" sub="Segurar para falar — elimina captações acidentais" icon={Hand} color={{ bg: 'bg-violet-500/10', text: 'text-violet-500' }}>
                                        <button onClick={() => setLocalConfig(prev => ({ ...prev, pushToTalkMode: !prev.pushToTalkMode }))} className={`w-10 h-6 rounded-full p-1 transition-colors ${localConfig.pushToTalkMode ? 'bg-violet-500' : 'bg-slate-200 dark:bg-white/10'}`}>
                                            <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${localConfig.pushToTalkMode ? 'translate-x-4' : ''}`} />
                                        </button>
                                    </SettingItem>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

        </div>
    );
};
