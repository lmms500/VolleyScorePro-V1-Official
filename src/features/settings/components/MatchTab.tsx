import React, { useRef } from 'react';
import { Share2, FileDown, Trophy, Umbrella, Zap, Target, Layers, Scale, ToggleLeft, ToggleRight, Users, ArrowLeftRight, Activity } from 'lucide-react';
import { GameConfig, GameModePreset } from '@types';
import { SectionTitle, SettingItem, PresetButton } from './SettingsUI';
import { parseJSONFile, exportActiveMatch } from '@lib/storage/io';
import { useTranslation } from '@contexts/LanguageContext';
import { useActions, useScore, useRoster } from '@contexts/GameContext';
import { useNotification } from '@contexts/NotificationContext';
import { GAME_MODE_PRESETS } from '@config/gameModes';
import { useCombinedGameState } from '@features/game/hooks/useCombinedGameState';
import { ConfirmationModal } from '@features/game/modals/ConfirmationModal';

interface MatchTabProps {
    localConfig: GameConfig;
    setLocalConfig: React.Dispatch<React.SetStateAction<GameConfig>>;
    onClose: () => void;
    setPendingRestart: (val: boolean) => void; // Used if importing a game requires restart
}

export const MatchTab: React.FC<MatchTabProps> = ({ localConfig, setLocalConfig, onClose }) => {
    const { t } = useTranslation();
    const { showNotification } = useNotification();
    const gameImportRef = useRef<HTMLInputElement>(null);
    const { loadStateFromFile } = useActions();

    // We need the full state for export
    const fullState = useCombinedGameState();

    // Also need separate access for validation logic
    const scoreState = useScore();
    const rosterState = useRoster();

    // Local state for selected preset
    const [selectedPreset, setSelectedPreset] = React.useState<GameModePreset>(
        localConfig.modeConfig?.preset || 'indoor-6v6'
    );
    const [pendingConfigChange, setPendingConfigChange] = React.useState<{ action: () => void; warning: string } | null>(null);

    const handleExportGame = async () => {
        try {
            await exportActiveMatch(fullState);
        } catch (e) {
            console.error(e);
        }
    };

    const handleImportGameClick = () => { if (gameImportRef.current) { gameImportRef.current.value = ''; gameImportRef.current.click(); } };

    const handleGameImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            const json = await parseJSONFile(file);
            if (json.type === 'VS_ACTIVE_MATCH' && json.data) {
                loadStateFromFile(json.data);
                onClose();
            } else {
                showNotification({ mainText: t('historyList.importError'), type: 'error' });
            }
        } catch (e) {
            showNotification({ mainText: t('historyList.importError'), type: 'error' });
        }
    };

    // Wrapping configuration changes to check for warnings
    const hasMatchStarted = scoreState.scoreA > 0 || scoreState.scoreB > 0 || scoreState.setsA > 0 || scoreState.setsB > 0;

    const requestConfigChange = (newLimit: number, action: () => void) => {
        const currentLimit = localConfig.modeConfig?.courtLayout.playersOnCourt || (localConfig.mode === 'beach' ? 4 : 6);
        const playersOnCourtCount = rosterState.teamARoster.players.length + rosterState.teamBRoster.players.length;
        const willDownsize = newLimit < currentLimit;
        const excessPlayers = Math.max(0, playersOnCourtCount - (newLimit * 2));

        if (hasMatchStarted || willDownsize) {
            let msg = t('settings.warningMessage');
            if (willDownsize && excessPlayers > 0) {
                msg += `\n\n⚠️ ${t('settings.warnings.downsizing', { count: excessPlayers })}`;
            } else if (willDownsize) {
                msg += `\n\n⚠️ ${t('settings.warnings.resizing', { count: newLimit })}`;
            }
            msg += `\n\n${t('common.continue')}`;

            setPendingConfigChange({ action, warning: msg });
            return;
        }

        action();
    };

    // Handler for changing mode preset via PlayerCountSelector
    const handlePresetChange = (preset: GameModePreset) => {
        const config = GAME_MODE_PRESETS[preset];
        requestConfigChange(config.courtLayout.playersOnCourt, () => {
            setSelectedPreset(preset);
            setLocalConfig(prev => ({ ...prev, mode: config.type, modeConfig: config }));
        });
    };

    const setPresetFIVB = () => {
        const config = GAME_MODE_PRESETS['indoor-6v6'];
        requestConfigChange(config.courtLayout.playersOnCourt, () => {
            setSelectedPreset('indoor-6v6');
            setLocalConfig(prev => ({ ...prev, mode: 'indoor', modeConfig: config, maxSets: 5, pointsPerSet: 25, hasTieBreak: true, tieBreakPoints: 15, deuceType: 'standard', autoSwapSides: false }));
        });
    };

    const setPresetBeach = () => {
        const config = GAME_MODE_PRESETS['beach-4v4'];
        requestConfigChange(config.courtLayout.playersOnCourt, () => {
            setSelectedPreset('beach-4v4');
            setLocalConfig(prev => ({ ...prev, mode: 'beach', modeConfig: config, maxSets: 3, pointsPerSet: 21, hasTieBreak: true, tieBreakPoints: 15, deuceType: 'standard', autoSwapSides: true }));
        });
    };

    const setPresetSegunda = () => {
        const config = GAME_MODE_PRESETS['indoor-6v6'];
        requestConfigChange(config.courtLayout.playersOnCourt, () => {
            setSelectedPreset('indoor-6v6');
            setLocalConfig(prev => ({ ...prev, mode: 'indoor', modeConfig: config, maxSets: 1, pointsPerSet: 15, hasTieBreak: false, tieBreakPoints: 15, deuceType: 'sudden_death_3pt', autoSwapSides: false }));
        });
    };

    const isFIVB = localConfig.mode === 'indoor' && localConfig.maxSets === 5 && localConfig.pointsPerSet === 25 && localConfig.hasTieBreak && localConfig.tieBreakPoints === 15 && localConfig.deuceType === 'standard';
    const isBeach = localConfig.mode === 'beach' && localConfig.maxSets === 3 && localConfig.pointsPerSet === 21 && localConfig.hasTieBreak && localConfig.tieBreakPoints === 15 && localConfig.deuceType === 'standard';
    const isSegunda = localConfig.mode === 'indoor' && localConfig.maxSets === 1 && localConfig.pointsPerSet === 15 && !localConfig.hasTieBreak && localConfig.deuceType === 'sudden_death_3pt';

    // Internal Component: Player Count Selector
    const PlayerCountSelector: React.FC = () => {
        const mode = localConfig.mode;

        // Filter presets by mode type
        const availablePresets: Array<{ preset: GameModePreset; label: string; count: number }> =
            mode === 'indoor'
                ? [
                    { preset: 'quads-5v5', label: t('gameModes.labels.5v5'), count: 5 },
                    { preset: 'indoor-6v6', label: t('gameModes.labels.6v6'), count: 6 }
                ]
                : [
                    { preset: 'beach-2v2', label: t('gameModes.labels.2v2'), count: 2 },
                    { preset: 'triples-3v3', label: t('gameModes.labels.3v3'), count: 3 },
                    { preset: 'beach-4v4', label: t('gameModes.labels.4v4'), count: 4 }
                ];

        return (
            <div className="flex gap-1.5">
                {availablePresets.map(({ preset, label, count }) => (
                    <button
                        key={preset}
                        onClick={() => handlePresetChange(preset)}
                        className={`
                            w-14 h-9 rounded-xl text-xs font-bold transition-all border flex items-center justify-center
                            ${selectedPreset === preset
                                ? 'bg-indigo-500 text-white border-indigo-600 shadow-md scale-105'
                                : 'bg-slate-50 dark:bg-white/5 border-transparent text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10'
                            }
                        `}
                    >
                        {label}
                    </button>
                ))}
            </div>
        );
    };

    return (
        <div className="space-y-3 landscape:grid landscape:grid-cols-2 landscape:gap-4 landscape:space-y-0">
            <input type="file" ref={gameImportRef} className="hidden" accept=".vsg,.json" onChange={handleGameImport} />
            <ConfirmationModal
                isOpen={!!pendingConfigChange}
                onClose={() => setPendingConfigChange(null)}
                onConfirm={() => {
                    if (pendingConfigChange) {
                        pendingConfigChange.action();
                        setPendingConfigChange(null);
                    }
                }}
                title={t('settings.warningTitle') || 'Warning'}
                message={pendingConfigChange?.warning || ''}
            />
            {/* Left Col */}
            <div className="space-y-3">
                <div>
                    <SectionTitle icon={Share2}>{t('settings.portability.title')}</SectionTitle>
                    <div className="grid grid-cols-2 gap-3 p-1">
                        <button onClick={handleExportGame} className="flex items-center justify-center gap-2 px-3 py-3 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 rounded-2xl text-indigo-600 dark:text-indigo-300 font-bold text-[10px] hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors shadow-sm"><Share2 size={14} /> {t('settings.portability.shareGame')}</button>
                        <button onClick={handleImportGameClick} className="flex items-center justify-center gap-2 px-3 py-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-slate-600 dark:text-slate-300 font-bold text-[10px] hover:bg-slate-50 dark:hover:bg-white/10 transition-colors shadow-sm"><FileDown size={14} /> {t('settings.portability.loadFile')}</button>
                    </div>
                </div>
                <div>
                    <SectionTitle icon={Trophy}>{t('settings.sections.presets')}</SectionTitle>
                    <div className="flex gap-3 px-1">
                        <PresetButton active={isFIVB} onClick={setPresetFIVB} icon={Trophy} label={t('presets.fivb.label')} sub={t('presets.fivb.sub')} colorClass="indigo-500" borderClass="border-indigo-500" bgActive="bg-indigo-500/10" textActive="text-indigo-600 dark:text-indigo-300" />
                        <PresetButton active={isBeach} onClick={setPresetBeach} icon={Umbrella} label={t('presets.beach.label')} sub={t('presets.beach.sub')} colorClass="orange-500" borderClass="border-orange-500" bgActive="bg-orange-500/10" textActive="text-orange-600 dark:text-orange-300" />
                        <PresetButton active={isSegunda} onClick={setPresetSegunda} icon={Zap} label={t('presets.custom.label')} sub={t('presets.custom.sub')} colorClass="emerald-500" borderClass="border-emerald-500" bgActive="bg-emerald-500/10" textActive="text-emerald-600 dark:text-emerald-300" />
                    </div>
                </div>
            </div>
            {/* Right Col */}
            <div className="space-y-3">
                <div>
                    <SectionTitle icon={Target}>{t('settings.sections.coreRules')}</SectionTitle>
                    <div className="space-y-2">
                        {/* Court Type Selector (Indoor/Beach) */}
                        <SettingItem label={t('settings.rules.gameMode')} icon={Trophy} color={{ bg: 'bg-indigo-500/10', text: 'text-indigo-500' }}>
                            <div className="flex bg-slate-200/50 dark:bg-black/20 rounded-xl p-1 border border-black/5 dark:border-white/5 shadow-inner">
                                <button onClick={() => {
                                    const newMode = 'indoor';
                                    const defaultPreset = 'indoor-6v6';
                                    const config = GAME_MODE_PRESETS[defaultPreset];
                                    requestConfigChange(config.courtLayout.playersOnCourt, () => {
                                        setSelectedPreset(defaultPreset);
                                        setLocalConfig(prev => ({ ...prev, mode: newMode, modeConfig: config }));
                                    });
                                }} className={`flex flex-col items-center justify-center px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${localConfig.mode === 'indoor' ? 'bg-white dark:bg-white/10 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`}>
                                    <span>{t('settings.rules.modes.indoor')}</span>
                                </button>
                                <button onClick={() => {
                                    const newMode = 'beach';
                                    const defaultPreset = 'beach-4v4';
                                    const config = GAME_MODE_PRESETS[defaultPreset];
                                    requestConfigChange(config.courtLayout.playersOnCourt, () => {
                                        setSelectedPreset(defaultPreset);
                                        setLocalConfig(prev => ({ ...prev, mode: newMode, modeConfig: config }));
                                    });
                                }} className={`flex flex-col items-center justify-center px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${localConfig.mode === 'beach' ? 'bg-white dark:bg-white/10 shadow-sm text-orange-500' : 'text-slate-400'}`}>
                                    <span>{t('settings.rules.modes.beach')}</span>
                                </button>
                            </div>
                        </SettingItem>

                        {/* Player Count Selector */}
                        <SettingItem label={t('settings.rules.playerCount')} icon={Users} color={{ bg: 'bg-emerald-500/10', text: 'text-emerald-500' }}>
                            <PlayerCountSelector />
                        </SettingItem>

                        <SettingItem label={t('settings.rules.setsToPlay')} icon={Layers} color={{ bg: 'bg-slate-500/10', text: 'text-slate-500' }}>
                            <div className="flex gap-1.5">
                                {[1, 3, 5].map(val => (
                                    <button key={val} onClick={() => setLocalConfig(prev => ({ ...prev, maxSets: val as any }))} className={`w-9 h-9 rounded-xl text-xs font-bold transition-all border flex items-center justify-center ${localConfig.maxSets === val ? 'bg-indigo-500 text-white border-indigo-600 shadow-md scale-105' : 'bg-slate-50 dark:bg-white/5 border-transparent text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10'}`}>{val}</button>
                                ))}
                            </div>
                        </SettingItem>
                        <SettingItem label={t('settings.rules.pointsPerSet')} icon={Target} color={{ bg: 'bg-rose-500/10', text: 'text-rose-500' }}>
                            <div className="flex gap-1.5">
                                {[15, 21, 25].map(val => (
                                    <button key={val} onClick={() => setLocalConfig(prev => ({ ...prev, pointsPerSet: val as any }))} className={`w-9 h-9 rounded-xl text-xs font-bold transition-all border flex items-center justify-center ${localConfig.pointsPerSet === val ? 'bg-rose-500 text-white border-rose-600 shadow-md scale-105' : 'bg-slate-50 dark:bg-white/5 border-transparent text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10'}`}>{val}</button>
                                ))}
                            </div>
                        </SettingItem>
                    </div>
                </div>
                <div>
                    <SectionTitle icon={Scale}>{t('settings.sections.tieBreakDeuce')}</SectionTitle>
                    <div className="space-y-2">
                        <SettingItem label={t('settings.rules.tieBreak')} icon={Scale} color={{ bg: 'bg-amber-500/10', text: 'text-amber-500' }}>
                            {localConfig.hasTieBreak && (
                                <div className="flex bg-slate-100 dark:bg-black/20 rounded-xl p-1 mr-2 border border-black/5 dark:border-white/5">
                                    {[15, 25].map(val => (
                                        <button key={val} onClick={() => setLocalConfig(prev => ({ ...prev, tieBreakPoints: val as any }))} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold ${localConfig.tieBreakPoints === val ? 'bg-white dark:bg-white/10 shadow-sm text-slate-800 dark:text-white' : 'text-slate-400'}`}>{val}</button>
                                    ))}
                                </div>
                            )}
                            <button onClick={() => setLocalConfig(prev => ({ ...prev, hasTieBreak: !prev.hasTieBreak }))} className={`text-2xl transition-colors ${localConfig.hasTieBreak ? 'text-indigo-500' : 'text-slate-300'}`}>{localConfig.hasTieBreak ? <ToggleRight size={28} fill="currentColor" fillOpacity={0.2} /> : <ToggleLeft size={28} />}</button>
                        </SettingItem>
                        <div className="grid grid-cols-2 gap-3 mt-1">
                            <button onClick={() => setLocalConfig(prev => ({ ...prev, deuceType: 'standard' }))} className={`py-3 px-3 rounded-2xl border text-[10px] font-bold text-center transition-all truncate flex flex-col items-center justify-center gap-1 ${localConfig.deuceType === 'standard' ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-600 dark:text-indigo-300 ring-1 ring-indigo-500/20' : 'bg-white/40 dark:bg-white/5 border-transparent text-slate-400 hover:bg-white/60'}`}><span className="opacity-50 text-[9px] uppercase tracking-wider">{t('status.deuce_advantage')}</span>{t('settings.rules.deuceStandard')}</button>
                            <button onClick={() => setLocalConfig(prev => ({ ...prev, deuceType: 'sudden_death_3pt' }))} className={`py-3 px-3 rounded-2xl border text-[10px] font-bold text-center transition-all truncate flex flex-col items-center justify-center gap-1 ${localConfig.deuceType === 'sudden_death_3pt' ? 'bg-rose-500/10 border-rose-500/50 text-rose-600 dark:text-rose-300 ring-1 ring-rose-500/20' : 'bg-white/40 dark:bg-white/5 border-transparent text-slate-400 hover:bg-white/60'}`}><span className="opacity-50 text-[9px] uppercase tracking-wider">{t('status.sudden_death')}</span>{t('settings.rules.deuceSuddenDeath')}</button>
                        </div>
                        <SettingItem label={t('settings.rules.autoSwapSides')} icon={ArrowLeftRight} color={{ bg: 'bg-orange-500/10', text: 'text-orange-500' }} className={localConfig.mode === 'beach' ? 'ring-1 ring-orange-500/20' : ''}>
                            <button onClick={() => setLocalConfig(prev => ({ ...prev, autoSwapSides: !prev.autoSwapSides }))} className={`text-2xl transition-colors ${localConfig.autoSwapSides ? 'text-indigo-500' : 'text-slate-300'}`}>{localConfig.autoSwapSides ? <ToggleRight size={28} fill="currentColor" fillOpacity={0.2} /> : <ToggleLeft size={28} />}</button>
                        </SettingItem>
                    </div>
                </div>
                <div>
                    <SectionTitle icon={Activity}>{t('common.analysis')}</SectionTitle>
                    <div className="space-y-2">
                        <SettingItem label={t('settings.game.scoutMode')} sub={t('settings.game.scoutModeSub')} icon={Activity} color={{ bg: 'bg-cyan-500/10', text: 'text-cyan-500' }}>
                            <button onClick={() => setLocalConfig(prev => ({ ...prev, enablePlayerStats: !prev.enablePlayerStats }))} className={`w-10 h-6 rounded-full p-1 transition-colors ${localConfig.enablePlayerStats ? 'bg-cyan-500' : 'bg-slate-200 dark:bg-white/10'}`}>
                                <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${localConfig.enablePlayerStats ? 'translate-x-4' : ''}`} />
                            </button>
                        </SettingItem>
                    </div>
                </div>
            </div>
        </div>
    );
};
