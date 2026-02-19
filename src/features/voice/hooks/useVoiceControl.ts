
import { useState, useEffect, useCallback, useRef } from 'react';
import { TeamId, Player, SkillType, VoiceCommandIntent } from '@types';
import { VoiceRecognitionService } from '../services/VoiceRecognitionService';
import { VoiceCommandParser, VoiceContext } from '../services/VoiceCommandParser';
import { GeminiCommandService } from '../services/GeminiCommandService';
import { CommandBuffer } from '../services/CommandBuffer';
import { FEATURE_FLAGS } from '@config/constants';

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
// BEEP HELPER — 4.9: feedback sonoro via Web Audio API
// -----------------------------------------------------------------------

function playCommandBeep(type: 'success' | 'error' | 'confirm') {
  try {
    const AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'success') {
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.setValueAtTime(1100, ctx.currentTime + 0.06);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.15);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.15);
    } else if (type === 'confirm') {
      osc.frequency.setValueAtTime(660, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.1);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.1);
    } else {
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.1);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.1);
    }

    // Fechar contexto para liberar recursos
    osc.onended = () => { ctx.close(); };
  } catch {
    // Ignorar se Web Audio API não disponível
  }
}

// -----------------------------------------------------------------------
// TYPES
// -----------------------------------------------------------------------

export interface CommandHistoryEntry {
  intent: VoiceCommandIntent;
  executedAt: number;
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
}: UseVoiceControlProps) => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessingAI, setIsProcessingAI] = useState(false);

  // 4.2 — Pending intent aguardando confirmação
  const [pendingIntent, setPendingIntent] = useState<VoiceCommandIntent | null>(null);

  // 4.7 — Histórico circular de comandos executados
  const [commandHistory, setCommandHistory] = useState<CommandHistoryEntry[]>([]);

  const isListeningRef = useRef(isListening);
  isListeningRef.current = isListening;

  const geminiService = useRef(GeminiCommandService.getInstance()).current;
  const recognitionService = useRef(VoiceRecognitionService.getInstance()).current;
  const bufferRef = useRef<CommandBuffer | null>(null);
  const lastExecutedRef = useRef<{ text: string; time: number } | null>(null);
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
    playCommandBeep('success');

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

  // -----------------------------------------------------------------------
  // 4.6 — CONFIRMAR PENDING INTENT (chamado externamente pelo usuário)
  // -----------------------------------------------------------------------

  const confirmPendingIntent = useCallback((team: TeamId) => {
    const pending = pendingIntentRef.current;
    if (!pending) return;
    const resolved: VoiceCommandIntent = { ...pending, team, requiresMoreInfo: false };
    setPendingIntent(null);
    processIntent(resolved);
  }, [processIntent]);

  const cancelPendingIntent = useCallback(() => {
    setPendingIntent(null);
    playCommandBeep('error');
  }, []);

  // -----------------------------------------------------------------------
  // EXECUTE ACTION — Pipeline principal com filtro de confiança
  // -----------------------------------------------------------------------

  const executeAction = useCallback(async (transcript: string, isFinal: boolean) => {
    const normalizedTranscript = transcript.toLowerCase().trim();
    const now = Date.now();

    // Anti-duplicata
    if (lastExecutedRef.current) {
      const { text, time } = lastExecutedRef.current;
      if (text === normalizedTranscript && now - time < 1000) return;
    }

    const voiceContext: VoiceContext = {
      teamAName, teamBName, playersA, playersB,
      statsEnabled: enablePlayerStats,
      servingTeam,
      lastScorerTeam,
      scoreA, scoreB, currentSet, isMatchOver,
    };

    const localIntent = VoiceCommandParser.parse(transcript, language, voiceContext);

    // 4.6 — Se há pending intent aguardando time, tentar resolver com o transcript atual
    if (pendingIntentRef.current) {
      const vocabMap: Record<string, { A: string[]; B: string[] }> = {
        pt: { A: ['time a', 'equipe a', 'esquerda', 'lado a', teamAName.toLowerCase()], B: ['time b', 'equipe b', 'direita', 'lado b', teamBName.toLowerCase()] },
        en: { A: ['team a', 'home', 'left', teamAName.toLowerCase()], B: ['team b', 'away', 'right', teamBName.toLowerCase()] },
        es: { A: ['equipo a', 'local', 'izquierda', teamAName.toLowerCase()], B: ['equipo b', 'visitante', 'derecha', teamBName.toLowerCase()] },
      };
      const lang = vocabMap[language] || vocabMap['en'];
      const norm = normalizedTranscript.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      if (lang.A.some(k => norm.includes(k))) {
        confirmPendingIntent('A');
        lastExecutedRef.current = { text: normalizedTranscript, time: now };
        return;
      }
      if (lang.B.some(k => norm.includes(k))) {
        confirmPendingIntent('B');
        lastExecutedRef.current = { text: normalizedTranscript, time: now };
        return;
      }
    }

    // ---- FALLBACK IA (desabilitado por padrão) ----
    if (
      FEATURE_FLAGS.ENABLE_AI_VOICE_COMMANDS &&
      (!localIntent || localIntent.type === 'unknown' || localIntent.confidence < 0.8)
    ) {
      if (!isFinal) return;
      setIsProcessingAI(true);
      onThinkingState?.(true);
      const aiResult = await geminiService.parseCommand(transcript, {
        teamAName, teamBName, playersA, playersB,
      });
      setIsProcessingAI(false);
      onThinkingState?.(false);
      if (aiResult && aiResult.type !== 'unknown') {
        lastExecutedRef.current = { text: normalizedTranscript, time: now };
        processIntent(aiResult);
      }
      return;
    }

    if (!localIntent || localIntent.type === 'unknown') return;

    // -----------------------------------------------------------------------
    // 4.2 — FILTRO DE CONFIANÇA EM 3 FAIXAS
    // -----------------------------------------------------------------------

    // Faixa 1: requiresMoreInfo → pending intent (pedir time ao usuário)
    if (localIntent.requiresMoreInfo && localIntent.type !== 'server') {
      if (['point', 'timeout'].includes(localIntent.type)) {
        setPendingIntent(localIntent);
        playCommandBeep('confirm');
        lastExecutedRef.current = { text: normalizedTranscript, time: now };
        return;
      }
    }

    if (localIntent.confidence >= CONFIDENCE_EXECUTE) {
      // Faixa 2: Alta confiança → executar imediatamente
      lastExecutedRef.current = { text: normalizedTranscript, time: now };
      processIntent(localIntent);
    } else if (localIntent.confidence >= CONFIDENCE_CONFIRM) {
      // Faixa 3: Confiança média → pending para confirmação do usuário
      setPendingIntent(localIntent);
      playCommandBeep('confirm');
      lastExecutedRef.current = { text: normalizedTranscript, time: now };
    }
    // Faixa 4: Baixa confiança → descartar silenciosamente
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
      bufferRef.current?.resetCooldown();
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
      bufferRef.current?.resetCooldown();
      recognitionService.start(language);
    }
  }, [language, recognitionService]);

  return {
    isListening,
    isProcessingAI,
    toggleListening,
    // 4.1 — PTT
    startListening,
    stopListening,
    // 4.2/4.6 — Pending Intent
    pendingIntent,
    confirmPendingIntent,
    cancelPendingIntent,
    // 4.7 — Histórico
    commandHistory,
  };
};
