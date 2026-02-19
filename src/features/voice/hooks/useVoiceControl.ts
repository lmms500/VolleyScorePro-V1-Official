
import { useState, useEffect, useCallback, useRef } from 'react';
import { TeamId, Player, SkillType, VoiceCommandIntent } from '@types';
import { VoiceRecognitionService } from '../services/VoiceRecognitionService';
import { VoiceCommandParser, VoiceContext } from '../services/VoiceCommandParser';
import { GeminiCommandService } from '../services/GeminiCommandService';
import { CommandBuffer } from '../services/CommandBuffer';
import { useTranslation } from '@contexts/LanguageContext';
import { FEATURE_FLAGS } from '@config/constants';

interface UseVoiceControlProps {
  enabled: boolean;
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
}

export const useVoiceControl = ({
  enabled, enablePlayerStats, onAddPoint, onSubtractPoint, onUndo, onTimeout, onSetServer, onSwapSides,
  onThinkingState,
  language, teamAName, teamBName, playersA, playersB, servingTeam,
  lastScorerTeam, scoreA, scoreB, currentSet, isMatchOver,
}: UseVoiceControlProps) => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const { t } = useTranslation();

  const isListeningRef = useRef(isListening);
  isListeningRef.current = isListening;

  const geminiService = useRef(GeminiCommandService.getInstance()).current;
  const recognitionService = useRef(VoiceRecognitionService.getInstance()).current;
  const bufferRef = useRef<CommandBuffer | null>(null);
  const lastExecutedRef = useRef<{ text: string; time: number } | null>(null);

  const processIntent = useCallback((intent: VoiceCommandIntent) => {
    if (intent.isNegative) {
      if (intent.team) onSubtractPoint(intent.team);
      else onUndo();
      return;
    }

    switch (intent.type) {
      case 'point':
        if (intent.team) onAddPoint(intent.team, intent.player?.id, intent.skill);
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
        break;
    }
  }, [onAddPoint, onSubtractPoint, onUndo, onTimeout, onSetServer, onSwapSides]);

  const executeAction = useCallback(async (transcript: string, isFinal: boolean) => {
    const normalizedTranscript = transcript.toLowerCase().trim();
    const now = Date.now();

    if (lastExecutedRef.current) {
      const { text, time } = lastExecutedRef.current;
      if (text === normalizedTranscript && now - time < 1000) {
        return;
      }
    }

    const voiceContext: VoiceContext = {
      teamAName, teamBName, playersA, playersB,
      statsEnabled: enablePlayerStats,
      servingTeam,
      lastScorerTeam,
      scoreA, scoreB, currentSet, isMatchOver,
    };

    const localIntent = VoiceCommandParser.parse(transcript, language, voiceContext);

    if (
      FEATURE_FLAGS.ENABLE_AI_VOICE_COMMANDS &&
      (!localIntent || localIntent.type === 'unknown' || localIntent.confidence < 0.8)
    ) {
      if (!isFinal) return;

      setIsProcessingAI(true);
      onThinkingState?.(true);

      const aiResult = await geminiService.parseCommand(transcript, {
        teamAName, teamBName, playersA, playersB
      });

      setIsProcessingAI(false);
      onThinkingState?.(false);

      if (aiResult && aiResult.type !== 'unknown') {
        lastExecutedRef.current = { text: normalizedTranscript, time: now };
        processIntent(aiResult);
      }
    } else if (localIntent && localIntent.type !== 'unknown') {
      lastExecutedRef.current = { text: normalizedTranscript, time: now };
      processIntent(localIntent);
    }
  }, [
    language, teamAName, teamBName, playersA, playersB, enablePlayerStats,
    servingTeam, lastScorerTeam, scoreA, scoreB, currentSet, isMatchOver,
    onThinkingState, processIntent,
  ]);

  useEffect(() => {
    if (!enabled) return;

    bufferRef.current?.cancel();
    bufferRef.current = new CommandBuffer(executeAction, 400);
  }, [enabled, executeAction]);

  useEffect(() => {
    if (!enabled) return;

    recognitionService.setCallbacks(
      (text, isFinal) => bufferRef.current?.push(text, isFinal),
      (err) => console.error('Voice Error:', err),
      (status) => setIsListening(status),
    );

    return () => {
      bufferRef.current?.cancel();
    };
  }, [enabled, recognitionService]);

  const toggleListening = useCallback(() => {
    console.log('[VoiceControl] toggleListening called, isListening:', isListeningRef.current);
    if (isListeningRef.current) {
      recognitionService.stop();
    } else {
      bufferRef.current?.resetCooldown();
      recognitionService.start(language);
    }
  }, [language, recognitionService]);

  return {
    isListening,
    isProcessingAI,
    toggleListening,
  };
};
