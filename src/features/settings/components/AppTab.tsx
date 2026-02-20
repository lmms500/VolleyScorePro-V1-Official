
import React, { useState } from 'react';
import { Sun, Moon, Globe, Sparkles, Volume2, Megaphone, User, User2, AlignJustify, BellRing, Gauge, AudioWaveform, Loader2, Play, Mic, HelpCircle, Activity, Hand } from 'lucide-react';
import { GameConfig } from '@types';
import { SectionTitle, SettingItem } from './SettingsUI';
import { useTranslation } from '@contexts/LanguageContext';
import { useTheme } from '@contexts/ThemeContext';
import { usePerformance } from '@contexts/PerformanceContext';
import type { PerformanceMode } from '@lib/platform/deviceDetection';
import { motion, AnimatePresence } from 'framer-motion';
import { ttsService } from '@features/voice/services/TTSService';
import { VoiceCommandsModal } from '@features/voice/modals/VoiceCommandsModal';

interface AppTabProps {
    localConfig: GameConfig;
    setLocalConfig: React.Dispatch<React.SetStateAction<GameConfig>>;
}

export const AppTab: React.FC<AppTabProps> = ({ localConfig, setLocalConfig }) => {
    const { t, language, setLanguage } = useTranslation();
    const { theme, setTheme } = useTheme();
    const { mode: perfMode, setMode: setPerfMode } = usePerformance();
    const [isTestingVoice, setIsTestingVoice] = useState(false);
    const [showVoiceHelp, setShowVoiceHelp] = useState(false);

    const perfOptions: { key: PerformanceMode; label: string; color: string }[] = [
        { key: 'NORMAL', label: t('settings.appearance.perfNormal'), color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300' },
        { key: 'ECONOMICO', label: t('settings.appearance.perfEco'), color: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300' },
        { key: 'REDUZIR_MOVIMENTO', label: t('settings.appearance.perfMinimal'), color: 'bg-slate-200 text-slate-700 dark:bg-white/20 dark:text-white' },
    ];

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
            {/* Appearance */}
            <div className="space-y-3">
                <div>
                    <SectionTitle icon={Sun}>{t('settings.sections.visuals')}</SectionTitle>
                    <div className="space-y-2">
                        <SettingItem label={t('settings.appearance.theme')} icon={theme === 'light' ? Sun : Moon} color={{ bg: 'bg-indigo-500/10', text: 'text-indigo-500' }}>
                            <div className="flex bg-slate-100 dark:bg-black/20 rounded-xl p-1 border border-black/5 dark:border-white/5">
                                <button onClick={() => setTheme('light')} className={`p-2 rounded-lg transition-all ${theme === 'light' ? 'bg-white shadow-sm text-amber-500' : 'text-slate-400'}`}><Sun size={16} /></button>
                                <button onClick={() => setTheme('dark')} className={`p-2 rounded-lg transition-all ${theme === 'dark' ? 'bg-white/10 shadow-sm text-indigo-400' : 'text-slate-400'}`}><Moon size={16} /></button>
                            </div>
                        </SettingItem>
                        <SettingItem label={t('settings.appearance.language')} icon={Globe} color={{ bg: 'bg-emerald-500/10', text: 'text-emerald-500' }}>
                            <div className="flex bg-slate-100 dark:bg-black/20 rounded-xl p-1 border border-black/5 dark:border-white/5">
                                {(['en', 'pt', 'es'] as const).map(lang => (
                                    <button key={lang} onClick={() => setLanguage(lang)} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-colors ${language === lang ? 'bg-white dark:bg-white/10 shadow-sm text-slate-800 dark:text-white' : 'text-slate-400'}`}>{lang}</button>
                                ))}
                            </div>
                        </SettingItem>
                        <SettingItem label={t('settings.appearance.performanceMode')} sub={t('settings.appearance.performanceModeSub')} icon={Sparkles} color={{ bg: 'bg-violet-500/10', text: 'text-violet-500' }}>
                            <div className="flex bg-slate-100 dark:bg-black/20 rounded-xl p-1 border border-black/5 dark:border-white/5">
                                {perfOptions.map(opt => (
                                    <button
                                        key={opt.key}
                                        onClick={() => setPerfMode(opt.key)}
                                        className={`px-2.5 py-1.5 rounded-lg text-[9px] font-bold uppercase transition-colors ${perfMode === opt.key ? `${opt.color} shadow-sm` : 'text-slate-400'}`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </SettingItem>
                    </div>
                </div>
            </div>
        </div>
    );
};
