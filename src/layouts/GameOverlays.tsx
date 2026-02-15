import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, Radio } from 'lucide-react';
import { useTimeoutContext } from '@contexts/TimeoutContext';
import { useRoster } from '@contexts/GameContext';
import { useModals } from '@contexts/ModalContext';
import { useTranslation } from '@contexts/LanguageContext';
import { TimeoutOverlay } from '@features/game/components/TimeoutOverlay';
import { FloatingTimeout } from '../ui/FloatingTimeout';
import { FEATURE_FLAGS } from '@config/constants';

interface GameOverlaysProps {
    /** Status de conectividade do dispositivo */
    isOnline: boolean;
    /** Se o jogo está em modo fullscreen */
    isFullscreen: boolean;
}

/**
 * GameOverlays - Renderiza todos os overlays informativos do jogo.
 *
 * Consome contextos internamente para timeout, roster, modals e tradução.
 * Recebe `isOnline` e `isFullscreen` como props.
 */
export const GameOverlays: React.FC<GameOverlaysProps> = ({ isOnline, isFullscreen }) => {
    const { t } = useTranslation();

    // Timeout context (todo o estado de timeout)
    const {
        activeTimeoutTeam,
        timeoutSeconds,
        isTimeoutMinimized,
        stopTimeout,
        minimizeTimeout,
        maximizeTimeout,
        handleTimeoutUndo,
        handleTacticalBoard
    } = useTimeoutContext();

    // Roster context (teams + sync role + session)
    const { teamARoster, teamBRoster, syncRole, sessionId } = useRoster();

    // Modals context
    const { openModal } = useModals();

    // Derived state
    const isHost = syncRole === 'host';
    const isSpectator = syncRole === 'spectator';

    return (
        <>
            {/* Offline Indicator */}
            <AnimatePresence>
                {!isOnline && (
                    <motion.div
                        initial={{ y: -50, x: '-50%', opacity: 0 }}
                        animate={{ y: 0, x: '-50%', opacity: 1 }}
                        exit={{ y: -50, x: '-50%', opacity: 0 }}
                        className={`fixed left-1/2 z-[110] px-4 py-1.5 bg-rose-600 text-white rounded-full flex items-center gap-2 shadow-2xl border border-white/20 backdrop-blur-md transition-all duration-300 ${isFullscreen ? 'top-24' : 'top-14'
                            }`}
                    >
                        <WifiOff size={14} strokeWidth={3} />
                        <span className="text-[10px] font-black uppercase tracking-widest">
                            {t('status.offline')}
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Timeout Overlay (Full) */}
            <AnimatePresence>
                {activeTimeoutTeam && !isTimeoutMinimized && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100]"
                    >
                        <TimeoutOverlay
                            team={activeTimeoutTeam === 'A' ? teamARoster : teamBRoster}
                            teamId={activeTimeoutTeam}
                            secondsLeft={timeoutSeconds}
                            onResume={stopTimeout}
                            onUndo={handleTimeoutUndo}
                            onTactical={handleTacticalBoard}
                            onMinimize={minimizeTimeout}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Timeout Minimized */}
            <AnimatePresence>
                {isTimeoutMinimized && activeTimeoutTeam && (
                    <FloatingTimeout
                        secondsLeft={timeoutSeconds}
                        color={
                            activeTimeoutTeam === 'A'
                                ? teamARoster.color || 'indigo'
                                : teamBRoster.color || 'rose'
                        }
                        onMaximize={maximizeTimeout}
                    />
                )}
            </AnimatePresence>

            {/* Live Sync Badge */}
            {FEATURE_FLAGS.ENABLE_LIVE_SYNC && (isHost || isSpectator) && (
                <button
                    onClick={() => openModal('liveSync')}
                    className={`fixed left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-1 pointer-events-auto transition-all duration-300 ease-in-out ${isFullscreen ? 'top-24' : 'bottom-28'
                        }`}
                >
                    <div
                        className={`px-3 py-1 rounded-full flex items-center gap-2 backdrop-blur-md border transition-all hover:scale-105 active:scale-95 ${isHost
                            ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-500 hover:bg-indigo-500/20 hover:border-indigo-500/40'
                            : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500 shadow-lg shadow-emerald-500/10 hover:bg-emerald-500/20 hover:border-emerald-500/40'
                            }`}
                    >
                        <Radio size={12} className="animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                            {isHost
                                ? `${t('status.broadcasting')}: ${sessionId}`
                                : `${t('status.live')}: ${sessionId}`}
                        </span>
                    </div>
                </button>
            )}
        </>
    );
};
