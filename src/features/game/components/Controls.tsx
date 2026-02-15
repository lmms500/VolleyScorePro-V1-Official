
import React, { memo } from 'react';
import { RotateCcw, ArrowLeftRight, Settings, Users, Undo2, Maximize2, History, Mic, MicOff, Radio } from 'lucide-react';
import { useTranslation } from '@contexts/LanguageContext';
import { motion } from 'framer-motion';
import { useCollider } from '@features/game/hooks/useCollider';
import { Badge } from '@ui/Badge';

interface ControlsProps {
    onUndo: () => void;
    canUndo: boolean;
    onSwap: () => void;
    onSettings: () => void;
    onRoster: () => void;
    onHistory: () => void;
    onReset: () => void;
    onToggleFullscreen: () => void;
    voiceEnabled: boolean;
    isListening: boolean;
    onToggleListening: () => void;
    onLiveSync: () => void;
    syncActive?: boolean;
}

// Spring animation refinada para microinterações premium
const premiumSpring = {
    type: "spring" as const,
    stiffness: 400,
    damping: 30
};

const ControlButton = memo(({ onClick, disabled, icon: Icon, active, title, badge, badgeColor = 'emerald' }: {
    onClick?: () => void;
    disabled?: boolean;
    icon: any;
    active?: boolean;
    title?: string;
    badge?: boolean;
    badgeColor?: 'emerald' | 'rose' | 'amber' | 'indigo';
}) => {
    return (
        <div className="relative">
            <motion.button
                onClick={onClick}
                disabled={disabled}
                whileHover={{
                    scale: 1.05,
                    transition: premiumSpring
                }}
                whileTap={{
                    scale: 0.95,
                    transition: premiumSpring
                }}
                className={`
                    relative
                    flex items-center justify-center 
                    w-10 h-10 sm:w-11 sm:h-11
                    rounded-xl
                    transition-all duration-300
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/50
                    ${active
                        ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                        : 'text-slate-300 hover:text-white hover:bg-white/5 hover:shadow-md'
                    }
                    ${disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
                `}
                aria-label={title || ''}
                title={title}
            >
                <Icon size={20} strokeWidth={1.75} />
            </motion.button>
            {badge && (
                <motion.div
                    className="absolute -top-0.5 -right-0.5 pointer-events-none"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={premiumSpring}
                >
                    <Badge variant="dot" color={badgeColor} className="w-2 h-2 shadow-lg" />
                </motion.div>
            )}
        </div>
    );
});

const Divider = memo(() => (
    <div className="w-px h-6 bg-gradient-to-b from-transparent via-white/20 to-transparent mx-0.5 flex-shrink-0"></div>
));

export const Controls: React.FC<ControlsProps> = memo(({
    onUndo, canUndo, onSwap, onSettings, onRoster, onHistory, onReset, onToggleFullscreen,
    voiceEnabled, isListening, onToggleListening, onLiveSync, syncActive
}) => {
    const { t } = useTranslation();
    const controlsRef = useCollider('controls-bar');

    return (
        <motion.div
            className="w-full flex justify-center px-4 pb-4 pointer-events-none"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
                delay: 0.1
            }}
        >
            <div
                ref={controlsRef}
                className="
                    pointer-events-auto
                    flex items-center justify-center gap-1
                    
                    /* Neo-Glass Background */
                    bg-gradient-to-br from-slate-900/80 via-slate-800/70 to-slate-900/80
                    backdrop-blur-xl
                    
                    /* Ring Border com efeito de profundidade */
                    ring-1 ring-inset ring-white/20
                    
                    /* Sombras multicamadas para profundidade premium */
                    shadow-[0_8px_32px_rgba(0,0,0,0.3),0_2px_8px_rgba(0,0,0,0.2)]
                    
                    /* Floating Look */
                    rounded-2xl
                    px-2 py-2
                    
                    /* Layout Responsivo */
                    max-w-fit
                    w-full
                    mx-auto
                "
            >
                {/* Grupo 1: Undo e Swap */}
                <div className="flex items-center gap-0.5">
                    <ControlButton onClick={onUndo} disabled={!canUndo} icon={Undo2} title={t('controls.undo')} />
                    <ControlButton onClick={onSwap} icon={ArrowLeftRight} title={t('controls.swap')} />
                </div>

                <Divider />

                {/* Grupo Smart Features: Live Sync e Voice */}
                <div className="flex items-center gap-0.5">
                    <ControlButton
                        onClick={onLiveSync}
                        icon={Radio}
                        active={syncActive}
                        title="Live Sync"
                        badge={syncActive}
                        badgeColor="emerald"
                    />
                    {voiceEnabled && (
                        <ControlButton
                            onClick={onToggleListening}
                            icon={isListening ? Mic : MicOff}
                            active={isListening}
                            title={t('controls.voiceControl')}
                            badge={isListening}
                            badgeColor="rose"
                        />
                    )}
                </div>

                <Divider />

                {/* Grupo 2: Roster e History */}
                <div className="flex items-center gap-0.5">
                    <ControlButton onClick={onRoster} icon={Users} title={t('controls.teams')} />
                    <ControlButton onClick={onHistory} icon={History} title={t('controls.history')} />
                </div>

                <Divider />

                {/* Grupo 3: Settings, Fullscreen e Reset */}
                <div className="flex items-center gap-0.5">
                    <ControlButton onClick={onSettings} icon={Settings} title={t('controls.settings')} />
                    <ControlButton onClick={onToggleFullscreen} icon={Maximize2} title={t('controls.fullscreen')} />
                    <ControlButton onClick={onReset} icon={RotateCcw} title={t('controls.reset')} />
                </div>

            </div>
        </motion.div>
    );
});
