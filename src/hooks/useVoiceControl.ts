
import { useState, useEffect, useCallback, useRef } from 'react';
import { TeamId, Player, SkillType, VoiceCommandIntent } from '../types';
import { VoiceRecognitionService } from '../services/VoiceRecognitionService';
import { VoiceCommandParser } from '../services/VoiceCommandParser';
import { GeminiCommandService } from '../services/GeminiCommandService';
import { useTranslation } from '../contexts/LanguageContext';

interface UseVoiceControlProps {
  enabled: boolean;
  enablePlayerStats: boolean;
  onAddPoint: (team: TeamId, playerId?: string, skill?: SkillType) => void;
  onSubtractPoint: (team: TeamId) => void;
  onUndo: () => void;
  onTimeout: (team: TeamId) => void;
  onSetServer: (team: TeamId) => void;
  onThinkingState?: (isThinking: boolean) => void;
  
  language: string;
  teamAName: string;
  teamBName: string;
  playersA: Player[];
  playersB: Player[];
  servingTeam: TeamId | null;
}

export const useVoiceControl = ({ 
    enabled, enablePlayerStats, onAddPoint, onSubtractPoint, onUndo, onTimeout, onSetServer,
    onThinkingState,
    language, teamAName, teamBName, playersA, playersB, servingTeam 
}: UseVoiceControlProps) => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const { t } = useTranslation();
  
  const geminiService = useRef(GeminiCommandService.getInstance()).current;
  const recognitionService = useRef(VoiceRecognitionService.getInstance()).current;

  const executeAction = useCallback(async (transcript: string, isFinal: boolean) => {
      // 1. Tentar parse local primeiro (rápido)
      const localIntent = VoiceCommandParser.parse(transcript, language, {
          teamAName, teamBName, playersA, playersB, statsEnabled: enablePlayerStats, servingTeam
      });

      // 2. Se local falhar ou for incerto, chamar Gemini
      if (!localIntent || localIntent.type === 'unknown' || localIntent.confidence < 0.8) {
          if (!isFinal) return; // Esperar frase completa para IA

          setIsProcessingAI(true);
          onThinkingState?.(true);
          
          const aiResult = await geminiService.parseCommand(transcript, {
              teamAName, teamBName, playersA, playersB
          });
          
          setIsProcessingAI(false);
          onThinkingState?.(false);

          if (aiResult && aiResult.type !== 'unknown') {
              processIntent(aiResult);
          }
      } else {
          // Local resolveu com confiança
          processIntent(localIntent);
      }
  }, [language, teamAName, teamBName, playersA, playersB, enablePlayerStats, servingTeam, onThinkingState]);

  const processIntent = (intent: VoiceCommandIntent) => {
      if (intent.isNegative) {
          if (intent.team) onSubtractPoint(intent.team);
          else onUndo();
          return;
      }

      switch (intent.type) {
          case 'point':
              if (intent.team) {
                  onAddPoint(intent.team, intent.player?.id, intent.skill);
              }
              break;
          case 'timeout':
              if (intent.team) onTimeout(intent.team);
              break;
          case 'server':
              if (intent.team) onSetServer(intent.team);
              break;
          case 'undo':
              onUndo();
              break;
      }
  };

  useEffect(() => {
      if (!enabled) return;
      
      recognitionService.setCallbacks(
          (text, isFinal) => executeAction(text, isFinal),
          (err) => console.error("Voice Error:", err),
          (status) => setIsListening(status)
      );
  }, [enabled, executeAction]);

  return { isListening, isProcessingAI, toggleListening: () => recognitionService.start(language) };
};
