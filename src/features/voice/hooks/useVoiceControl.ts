
import { useState, useEffect, useCallback, useRef } from 'react';
import { TeamId, Player, SkillType, VoiceCommandIntent, TeamColor } from '@types';
import { VoiceRecognitionService } from '../services/VoiceRecognitionService';
import { VoiceCommandParser, VoiceContext } from '../services/VoiceCommandParser';
import { GeminiCommandService } from '../services/GeminiCommandService';
import { CommandBuffer } from '../services/CommandBuffer';
import { getCommandDeduplicator, resetCommandDeduplicator } from '../services/CommandDeduplicator';
import { FEATURE_FLAGS } from '@config/constants';
import { audioService } from '@lib/audio/AudioService';

// -----------------------------------------------------------------------
// CONSTANTS
// -----------------------------------------------------------------------

/** Faixa de confiança para executar imediatamente (sem confirmação) */
const CONFIDENCE_EXECUTE = 0.85;
/** Faixa de confiança para mostrar toast de confirmação */
const CONFIDENCE_CONFIRM = 0.60;
/** Máximo de entradas no histórico circular */
const MAX_HISTORY_SIZE = 20;

// -----------------------------------------------------------------------
// TYPES
// -----------------------------------------------------------------------

export interface CommandHistoryEntry {
  intent: VoiceCommandIntent;
  executedAt: number;
}

export interface DomainConflictState {
  type: 'team_conflict';
  player: { id: string; name: string };
  detectedTeam: TeamId;
  playerTeam: TeamId;
  skill?: SkillType;
  rawText: string;
}

interface UseVoiceControlProps {
  enabled: boolean;
  pushToTalkMode: boolean;
  enablePlayerStats: boolean;
  onAddPoint: (team: TeamId, playerId?: string, skill?: SkillType) => void;
  onSubtractPoint: (team: TeamId) => void;
  onUndo: () => void;
  onTimeout: (team: TeamId) => void;
  onSetServer: (team: TeamId) => void;
  onSwapSides: () => void;
  onThinkingState?: (isThinking: boolean) => void;

  language: string;
  teamAName: string;
  teamBName: string;
  playersA: Player[];
  playersB: Player[];
  servingTeam: TeamId | null;
  lastScorerTeam: TeamId | null;
  scoreA: number;
  scoreB: number;
  currentSet: number;
  isMatchOver: boolean;
  showNotification?: (options: any) => void;
  hideNotification?: () => void;
  colorA: TeamColor;
  colorB: TeamColor;
}

// -----------------------------------------------------------------------
// HOOK
// -----------------------------------------------------------------------

export const useVoiceControl = ({
  enabled,
  pushToTalkMode,
  enablePlayerStats,
  onAddPoint,
  onSubtractPoint,
  onUndo,
  onTimeout,
  onSetServer,
  onSwapSides,
  onThinkingState,
  language,
  teamAName,
  teamBName,
  playersA,
  playersB,
  servingTeam,
  lastScorerTeam,
  scoreA,
  scoreB,
  currentSet,
  isMatchOver,
  showNotification,
  hideNotification,
  colorA,
  colorB,
}: UseVoiceControlProps) => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [visualFeedback, setVisualFeedback] = useState<string>('');

  const [pendingIntent, setPendingIntent] = useState<VoiceCommandIntent | null>(null);
  const [domainConflict, setDomainConflict] = useState<DomainConflictState | null>(null);

  const [commandHistory, setCommandHistory] = useState<CommandHistoryEntry[]>([]);

  const isListeningRef = useRef(isListening);
  isListeningRef.current = isListening;

  // Refs for values used inside stable callbacks (prevents stale closures)
  const teamANameRef = useRef(teamAName);
  teamANameRef.current = teamAName;
  const teamBNameRef = useRef(teamBName);
  teamBNameRef.current = teamBName;
  const colorARef = useRef(colorA);
  colorARef.current = colorA;
  const colorBRef = useRef(colorB);
  colorBRef.current = colorB;
  const showNotificationRef = useRef(showNotification);
  showNotificationRef.current = showNotification;
  const hideNotificationRef = useRef(hideNotification);
  hideNotificationRef.current = hideNotification;

  const geminiService = useRef(GeminiCommandService.getInstance()).current;
  const recognitionService = useRef(VoiceRecognitionService.getInstance()).current;
  const bufferRef = useRef<CommandBuffer | null>(null);
  const deduplicatorRef = useRef(getCommandDeduplicator());
  const pendingIntentRef = useRef<VoiceCommandIntent | null>(pendingIntent);
  pendingIntentRef.current = pendingIntent;

  // -----------------------------------------------------------------------
  // EXECUTE INTENT — Executa a ação e adiciona ao histórico
  // -----------------------------------------------------------------------

  const processIntent = useCallback((intent: VoiceCommandIntent) => {
    // Adicionar ao histórico circular
    setCommandHistory(prev => {
      const entry: CommandHistoryEntry = { intent, executedAt: Date.now() };
      const next = [entry, ...prev];
      return next.length > MAX_HISTORY_SIZE ? next.slice(0, MAX_HISTORY_SIZE) : next;
    });

    // 4.9 — Beep de confirmação
    audioService.playVoiceBeep('success');

    if (intent.isNegative) {
      if (intent.team) onSubtractPoint(intent.team);
      else onUndo();
      return;
    }

    switch (intent.type) {
      case 'point':
        if (intent.team) {
          onAddPoint(intent.team, intent.player?.id, intent.skill);

          // Show conditional visual feedback (notification) mapping the detailed intent
          const notify = showNotificationRef.current;
          if (notify) {
            const hasSkill = intent.skill && intent.skill !== 'generic';
            const hasPlayer = !!intent.player;

            if (hasSkill || hasPlayer) {
              let mainText = intent.team === 'A' ? teamANameRef.current : teamBNameRef.current;
              if (hasPlayer) {
                mainText += ` • ${intent.player?.name}`;
              }

              notify({
                type: 'success',
                mainText,
                skill: intent.skill || 'generic',
                color: intent.team === 'A' ? colorARef.current : colorBRef.current,
              });
            }
          }
        }
        break;
      case 'timeout':
        if (intent.team) onTimeout(intent.team);
        break;
      case 'server':
        if (intent.team) onSetServer(intent.team);
        break;
      case 'swap':
        onSwapSides();
        break;
      case 'undo':
        onUndo();
        if (showNotificationRef.current) {
          showNotificationRef.current({
            type: 'info',
            mainText: 'Ação desfeita',
            systemIcon: 'undo',
            duration: 1500,
          });
        }
        break;
    }
  }, [onAddPoint, onSubtractPoint, onUndo, onTimeout, onSetServer, onSwapSides]);

  // -----------------------------------------------------------------------
  // 4.6 — CONFIRMAR PENDING INTENT (chamado externamente pelo usuário)
  // -----------------------------------------------------------------------

  const confirmPendingIntent = useCallback((team: TeamId) => {
    const pending = pendingIntentRef.current;
    if (!pending) return;
    const resolved: VoiceCommandIntent = { ...pending, team, requiresMoreInfo: false };
    setPendingIntent(null);

    const dedupeResult = deduplicatorRef.current.canExecute(resolved);
    if (!dedupeResult.allowed) {
      console.log('[VoiceControl] Blocked by deduplicator:', dedupeResult.reason);
      return;
    }

    deduplicatorRef.current.register(resolved);
    processIntent(resolved);
  }, [processIntent]);

  const cancelPendingIntent = useCallback(() => {
    setPendingIntent(null);
    audioService.playVoiceBeep('error');
  }, []);

  const resolveDomainConflict = useCallback((useDetectedTeam: boolean) => {
    const conflict = domainConflict;
    if (!conflict) return;

    const resolvedTeam = useDetectedTeam ? conflict.detectedTeam : conflict.playerTeam;
    const intent: VoiceCommandIntent = {
      type: 'point',
      team: resolvedTeam,
      player: conflict.player,
      skill: conflict.skill,
      confidence: 0.9,
      rawText: conflict.rawText,
    };

    setDomainConflict(null);

    const dedupeResult = deduplicatorRef.current.canExecute(intent);
    if (!dedupeResult.allowed) {
      console.log('[VoiceControl] Blocked by deduplicator:', dedupeResult.reason);
      return;
    }

    deduplicatorRef.current.register(intent);
    processIntent(intent);
  }, [domainConflict, processIntent]);

  const cancelDomainConflict = useCallback(() => {
    setDomainConflict(null);
    audioService.playVoiceBeep('error');
  }, []);

  // -----------------------------------------------------------------------
  // EXECUTE ACTION — Pipeline principal com filtro de confiança
  // -----------------------------------------------------------------------

  const executeAction = useCallback(async (transcript: string, isFinal: boolean) => {
    const voiceContext: VoiceContext = {
      teamAName, teamBName, playersA, playersB,
      statsEnabled: enablePlayerStats,
      servingTeam,
      lastScorerTeam,
      scoreA, scoreB, currentSet, isMatchOver,
    };

    const localIntent = VoiceCommandParser.parse(transcript, language, voiceContext);

    if (pendingIntentRef.current) {
      const vocabMap: Record<string, { A: string[]; B: string[] }> = {
        pt: { A: ['time a', 'equipe a', 'esquerda', 'lado a', teamAName.toLowerCase()], B: ['time b', 'equipe b', 'direita', 'lado b', teamBName.toLowerCase()] },
        en: { A: ['team a', 'home', 'left', teamAName.toLowerCase()], B: ['team b', 'away', 'right', teamBName.toLowerCase()] },
        es: { A: ['equipo a', 'local', 'izquierda', teamAName.toLowerCase()], B: ['equipo b', 'visitante', 'derecha', teamBName.toLowerCase()] },
      };
      const lang = vocabMap[language] || vocabMap['en'];
      const norm = transcript.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      if (lang.A.some(k => norm.includes(k))) {
        confirmPendingIntent('A');
        return;
      }
      if (lang.B.some(k => norm.includes(k))) {
        confirmPendingIntent('B');
        return;
      }
    }

    if (
      FEATURE_FLAGS.ENABLE_AI_VOICE_COMMANDS &&
      (!localIntent || localIntent.type === 'unknown' || localIntent.confidence < 0.8)
    ) {
      if (!isFinal) return;
      console.log('[VoiceControl] Processing command via GEMINI:', transcript);
      setIsProcessingAI(true);
      onThinkingState?.(true);
      if (showNotificationRef.current) {
        showNotificationRef.current({
          type: 'info',
          mainText: 'Thinking...',
          systemIcon: 'party',
          duration: 10000,
        });
      }
      const aiResult = await geminiService.parseCommand(transcript, {
        teamAName, teamBName, playersA, playersB,
      });
      if (hideNotificationRef.current) hideNotificationRef.current();
      setIsProcessingAI(false);
      onThinkingState?.(false);
      if (aiResult && aiResult.type !== 'unknown') {
        console.log('[VoiceControl] Gemini result:', aiResult);
        const dedupeResult = deduplicatorRef.current.canExecute(aiResult);
        if (dedupeResult.allowed) {
          deduplicatorRef.current.register(aiResult);
          processIntent(aiResult);
        }
      } else {
        console.log('[VoiceControl] Gemini returned null/unknown for:', transcript);
        audioService.playVoiceBeep('error');
        if (showNotificationRef.current) {
          showNotificationRef.current({
            type: 'error',
            mainText: 'Comando não reconhecido',
            duration: 2000,
          });
        }
      }
      return;
    }

    if (!localIntent || localIntent.type === 'unknown') return;

    console.log('[VoiceControl] Processing command LOCALLY:', transcript, localIntent);

    if (localIntent.domainConflict) {
      setDomainConflict({
        type: 'team_conflict',
        player: localIntent.domainConflict.player,
        detectedTeam: localIntent.domainConflict.detectedTeam,
        playerTeam: localIntent.domainConflict.playerTeam,
        skill: localIntent.domainConflict.skill,
        rawText: localIntent.rawText,
      });
      audioService.playVoiceBeep('confirm');
      return;
    }

    if (localIntent.requiresMoreInfo && localIntent.type !== 'server') {
      if (['point', 'timeout'].includes(localIntent.type)) {
        setPendingIntent(localIntent);
        audioService.playVoiceBeep('confirm');
        return;
      }
    }

    const dedupeResult = deduplicatorRef.current.canExecute(localIntent);
    if (!dedupeResult.allowed) {
      console.log('[VoiceControl] Blocked by deduplicator:', dedupeResult.reason);
      return;
    }

    if (localIntent.confidence >= CONFIDENCE_EXECUTE) {
      deduplicatorRef.current.register(localIntent);
      processIntent(localIntent);
    } else if (localIntent.confidence >= CONFIDENCE_CONFIRM) {
      setPendingIntent(localIntent);
      audioService.playVoiceBeep('confirm');
    }
  }, [
    language, teamAName, teamBName, playersA, playersB, enablePlayerStats,
    servingTeam, lastScorerTeam, scoreA, scoreB, currentSet, isMatchOver,
    onThinkingState, processIntent, confirmPendingIntent,
  ]);

  // -----------------------------------------------------------------------
  // SETUP BUFFER
  // -----------------------------------------------------------------------

  useEffect(() => {
    if (!enabled) return;
    bufferRef.current?.cancel();
    bufferRef.current = new CommandBuffer(executeAction, 400);
  }, [enabled, executeAction]);

  // -----------------------------------------------------------------------
  // SETUP RECOGNITION CALLBACKS
  // -----------------------------------------------------------------------

  useEffect(() => {
    if (!enabled) return;

    recognitionService.setCallbacks(
      (text, isFinal) => bufferRef.current?.push(text, isFinal),
      (text) => setVisualFeedback(text),
      (err) => console.error('[VoiceControl] Recognition Error:', err),
      (status) => setIsListening(status),
    );

    return () => {
      bufferRef.current?.cancel();
    };
  }, [enabled, recognitionService]);

  // -----------------------------------------------------------------------
  // 4.1 — PUSH-TO-TALK: expõe startListening / stopListening separados
  // toggleListening: modo contínuo (pressionar = toggle on/off)
  // startListening / stopListening: modo PTT (pressionar e segurar)
  // -----------------------------------------------------------------------

  const startListening = useCallback(() => {
    if (!isListeningRef.current) {
      deduplicatorRef.current.reset();
      recognitionService.start(language);
    }
  }, [language, recognitionService]);

  const stopListening = useCallback(() => {
    if (isListeningRef.current) {
      recognitionService.stop();
    }
  }, [recognitionService]);

  const toggleListening = useCallback(() => {
    if (isListeningRef.current) {
      recognitionService.stop();
    } else {
      deduplicatorRef.current.reset();
      recognitionService.start(language);
    }
  }, [language, recognitionService]);

  return {
    isListening,
    isProcessingAI,
    visualFeedback,
    toggleListening,
    startListening,
    stopListening,
    pendingIntent,
    confirmPendingIntent,
    cancelPendingIntent,
    domainConflict,
    resolveDomainConflict,
    cancelDomainConflict,
    commandHistory,
  };
};
