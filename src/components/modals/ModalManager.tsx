
import React, { lazy, Suspense, useCallback, useEffect, useRef, useState, memo } from 'react';
import { useModals } from '../../contexts/ModalContext';
import { useActions, useScore, useRoster } from '../../contexts/GameContext';
import { useTranslation } from '../../contexts/LanguageContext';
import { useNotification } from '../../contexts/NotificationContext';
import { GlobalLoader } from '../ui/GlobalLoader';
import { Heart } from 'lucide-react';
import { TeamId, SkillType } from '../../types';
import { useTutorial } from '../../hooks/useTutorial';
import { useServiceWorker } from '../../hooks/useServiceWorker';
import { usePWAInstallPrompt } from '../../hooks/usePWAInstallPrompt';
import { useSpectatorCount } from '../../hooks/useSpectatorCount';
import { useMatchSaver } from '../../hooks/useMatchSaver';
import { useSyncManager } from '../../hooks/useSyncManager';
import { useAuth } from '../../contexts/AuthContext';
import { useCombinedGameState } from '../../hooks/useCombinedGameState';


const SettingsModal = lazy(() => import('./SettingsModal').then(m => ({ default: m.SettingsModal })));
const TeamManagerModal = lazy(() => import('./TeamManagerModal').then(m => ({ default: m.TeamManagerModal })));
const HistoryModal = lazy(() => import('./HistoryModal').then(m => ({ default: m.HistoryModal })));
const ConfirmationModal = lazy(() => import('./ConfirmationModal').then(m => ({ default: m.ConfirmationModal })));
const CourtModal = lazy(() => import('./CourtModal').then(m => ({ default: m.CourtModal })));
const LiveSyncModal = lazy(() => import('./LiveSyncModal').then(m => ({ default: m.LiveSyncModal })));
const MatchOverModal = lazy(() => import('./MatchOverModal').then(m => ({ default: m.MatchOverModal })));
const RichTutorialModal = lazy(() => import('./RichTutorialModal').then(m => ({ default: m.RichTutorialModal })));
const ReloadPrompt = lazy(() => import('../ui/ReloadPrompt').then(m => ({ default: m.ReloadPrompt })));
const InstallReminder = lazy(() => import('../ui/InstallReminder').then(m => ({ default: m.InstallReminder })));

interface ModalManagerProps {
  handleNextGame: () => void;
  handleResetGame: () => void;
  showAdConfirm: boolean;
  confirmWatchAd: () => void;
  cancelWatchAd: () => void;
  isAdLoading: boolean;
}

export const ModalManager: React.FC<ModalManagerProps> = memo(({
  handleNextGame, handleResetGame,
  showAdConfirm, confirmWatchAd, cancelWatchAd, isAdLoading
}) => {
  const { activeModal, closeModal, openModal } = useModals();
  const { t } = useTranslation();

  // --- REFACTORED: Use split contexts ---
  const { applySettings, manualRotate, swapPositions, addPoint, subtractPoint, useTimeout, substitutePlayers, undo } = useActions();
  const { showNotification } = useNotification();
  const { handleHostSession, handleJoinSession, handleStopBroadcast, handleLeaveSession } = useSyncManager();
  const scoreState = useScore();
  const rosterState = useRoster();

  // Reconstruct necessary state parts for child components
  // We avoid creating the full GameState on every render unless needed, but for MatchOver saving we need it all.
  const { isMatchOver, matchWinner, scoreA, scoreB, setsA, setsB, matchDurationSeconds, history, inSuddenDeath, servingTeam, currentSet, timeoutsA, timeoutsB, isDeuce, isMatchPointA, isMatchPointB, isSetPointA, isSetPointB, matchLog, actionLog } = scoreState;
  const { teamAName, teamBName, teamARoster, teamBRoster, config, syncRole, sessionId } = rosterState;

  // Hooks managed here now
  const pwa = usePWAInstallPrompt();
  const tutorial = useTutorial((pwa.isStandalone), config.developerMode);
  const serviceWorker = useServiceWorker();
  const { user } = useAuth();

  // Match Saving Logic (delegated to hook)
  const { savedMatchId, undoMatchSave, resetSaveState } = useMatchSaver();

  // Real-time spectator count from Firestore
  const spectatorCount = useSpectatorCount(sessionId);

  // Wrapper Actions
  const handleAddPointWrapper = useCallback((teamId: TeamId, playerId?: string, skill?: SkillType) => {
    const metadata = playerId ? { playerId, skill: skill || 'generic' } : undefined;
    addPoint(teamId, metadata);
  }, [addPoint]);

  const onNextGameWrapper = () => {
    resetSaveState();
    handleNextGame();
  };

  const onResetWrapper = () => {
    resetSaveState();
    handleResetGame();
  };

  const overlayZIndex = activeModal === 'court' ? "z-[110]" : "z-[60]";

  // Construct full GameState for MatchOverModal visualization (it expects the big object)
  const fullGameStateForModal = useCombinedGameState();

  return (
    <Suspense fallback={<GlobalLoader />}>
      {activeModal === 'settings' && (
        <SettingsModal
          isOpen={true}
          onClose={closeModal}
          config={config}
          isMatchActive={scoreA > 0 || scoreB > 0}
          onSave={(newConfig, reset) => { applySettings(newConfig, reset); }}
          zIndex={overlayZIndex}
        />
      )}

      {activeModal === 'manager' && (
        <TeamManagerModal
          isOpen={true}
          onClose={closeModal}
          developerMode={config.developerMode}
          zIndex={overlayZIndex}
        />
      )}

      {activeModal === 'history' && <HistoryModal isOpen={true} onClose={closeModal} developerMode={config.developerMode} zIndex={overlayZIndex} />}

      {activeModal === 'court' && (
        <CourtModal
          isOpen={true} onClose={closeModal} teamA={teamARoster} teamB={teamBRoster}
          scoreA={scoreA} scoreB={scoreB} servingTeam={servingTeam} onManualRotate={manualRotate}
          onAddPoint={handleAddPointWrapper} onSubtractPoint={subtractPoint} onMovePlayer={swapPositions} onSubstitute={substitutePlayers}
          onTimeoutA={() => useTimeout('A')} onTimeoutB={() => useTimeout('B')}
          timeoutsA={timeoutsA} timeoutsB={timeoutsB}
          currentSet={currentSet} setsA={setsA} setsB={setsB}
          isMatchPointA={false} isMatchPointB={false} isSetPointA={false} isSetPointB={false}
          isDeuce={false} inSuddenDeath={inSuddenDeath} config={config} matchLog={matchLog}
          onOpenManager={() => openModal('manager')} onOpenHistory={() => openModal('history')} onOpenSettings={() => openModal('settings')}
        />
      )}

      {activeModal === 'liveSync' && (
        <LiveSyncModal
          isOpen={true}
          onClose={closeModal}
          onHost={handleHostSession}
          onJoin={handleJoinSession}
          sessionId={sessionId}
          isHost={syncRole === 'host'}
          isSpectator={syncRole === 'spectator'}
          onStopBroadcast={handleStopBroadcast}
          onLeaveSession={handleLeaveSession}
          spectatorCount={spectatorCount}
        />
      )}

      {activeModal === 'resetConfirm' && (
        <ConfirmationModal
          isOpen={true} onClose={closeModal} onConfirm={() => { onResetWrapper(); closeModal(); }}
          title={t('confirm.reset.title')} message={t('confirm.reset.message')} confirmLabel={t('confirm.reset.confirmButton')}
        />
      )}

      {showAdConfirm && (
        <ConfirmationModal
          isOpen={true} onClose={cancelWatchAd} onConfirm={confirmWatchAd}
          title="Support VolleyScore" message="Watch a short ad to support development?"
          confirmLabel={isAdLoading ? "Loading..." : "Watch Ad"} icon={Heart}
        />
      )}

      {/* STATE-DRIVEN OVERLAYS */}

      {isMatchOver && (
        <MatchOverModal
          isOpen={true}
          state={fullGameStateForModal}
          onRotate={onNextGameWrapper}
          onReset={onResetWrapper}
          onUndo={undoMatchSave}
          savedMatchId={savedMatchId}
          isSpectator={syncRole === 'spectator'}
        />
      )}

      {tutorial.activeTutorial === 'main' && (
        <RichTutorialModal
          isOpen={true}
          tutorialKey="main"
          onClose={tutorial.completeTutorial}
          canInstall={pwa.isInstallable}
          onInstall={pwa.promptInstall}
          isStandalone={pwa.isStandalone}
          isIOS={pwa.isIOS}
        />
      )}

      <ReloadPrompt />
      <InstallReminder
        isVisible={tutorial.showReminder}
        onInstall={pwa.promptInstall}
        onDismiss={tutorial.dismissReminder}
        canInstall={pwa.isInstallable}
        isIOS={pwa.isIOS}
      />

    </Suspense>
  );
});
