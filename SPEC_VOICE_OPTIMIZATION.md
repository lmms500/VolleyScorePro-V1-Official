# SPEC — Otimização do Controle por Voz (Local Only)

> **Lote 12 • VolleyScore Pro v2**
> Especificação técnica com código-fonte completo para implementação.

---

## Visão Geral das Mudanças

| # | Arquivo | Ação |
|---|---------|------|
| 1 | `src/features/voice/services/CommandBuffer.ts` | **[NOVO]** Buffer com debounce |
| 2 | `src/features/voice/services/VoiceCommandParser.ts` | **[REESCREVER]** Parser robusto |
| 3 | `src/features/voice/hooks/useVoiceControl.ts` | **[MODIFICAR]** Injetar contexto + buffer |
| 4 | `src/features/game/screens/GameScreen.tsx` | **[MODIFICAR]** Passar novos props |
| 5 | `src/features/voice/services/__tests__/VoiceCommandParser.test.ts` | **[NOVO]** Testes unitários |

---

## 1. `CommandBuffer.ts` — NOVO ARQUIVO

**Propósito:** Evitar parse prematuro de frases incompletas acumulando texto interim por 400ms.

**Arquivo:** `src/features/voice/services/CommandBuffer.ts`

```typescript
/**
 * CommandBuffer
 *
 * Gerencia um buffer de texto de voz com debounce para evitar processar
 * frases incompletas. Dispara o callback apenas após 400ms de silêncio
 * ou imediatamente ao receber um resultado final (isFinal: true).
 */

type ProcessCallback = (text: string, isFinal: boolean) => void;

export class CommandBuffer {
  private debounceMs: number;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private pendingText = '';
  private onProcess: ProcessCallback;

  constructor(onProcess: ProcessCallback, debounceMs = 400) {
    this.onProcess = onProcess;
    this.debounceMs = debounceMs;
  }

  /**
   * Recebe texto do VoiceRecognitionService.
   * - Se isFinal: processa imediatamente e cancela qualquer timer pendente.
   * - Se interim: reinicia o debounce com o novo texto acumulado.
   */
  public push(text: string, isFinal: boolean): void {
    this.pendingText = text;

    if (isFinal) {
      this.flush(true);
      return;
    }

    // Reinicia o debounce a cada novo interim
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => this.flush(false), this.debounceMs);
  }

  /**
   * Processa o texto acumulado e limpa o estado.
   */
  private flush(isFinal: boolean): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    const text = this.pendingText.trim();
    if (text.length > 0) {
      this.onProcess(text, isFinal);
    }

    this.pendingText = '';
  }

  /**
   * Cancela qualquer operação pendente. Chamar ao parar o microfone.
   */
  public cancel(): void {
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
    this.pendingText = '';
  }
}
```

---

## 2. `VoiceCommandParser.ts` — REESCRITA COMPLETA

**Arquivo:** `src/features/voice/services/VoiceCommandParser.ts`

> **Mudanças em relação à versão atual:**
> - `normalizeText`: adiciona remoção de acentos + normalização de números por extenso
> - `resolveEntity`: integra `isFuzzyMatch` para nomes de jogadores
> - `resolveByContext`: método **novo** com 7 regras de inferência contextual
> - `VoiceContext`: interface expandida com `lastScorerTeam`, `scoreA/B`, `currentSet`, `isMatchOver`
> - Colisão "saque" resolvida via co-ocorrência com palavras de ponto

```typescript
import { TeamId, Player, SkillType, VoiceCommandIntent } from '@types';
import { isFuzzyMatch } from '@lib/utils/stringUtils';

// ---------------------------------------------------------------------------
// CONTEXT INTERFACE (expandida)
// ---------------------------------------------------------------------------

export interface VoiceContext {
  teamAName: string;
  teamBName: string;
  playersA: Player[];
  playersB: Player[];
  statsEnabled: boolean;

  // Contexto de jogo para inferência
  servingTeam: TeamId | null;
  lastScorerTeam: TeamId | null; // NOVO — continuidade de pontuação
  scoreA: number;                // NOVO — para inferências de situação
  scoreB: number;                // NOVO
  currentSet: number;            // NOVO
  isMatchOver: boolean;          // NOVO — bloquear comandos pós-jogo
}

// ---------------------------------------------------------------------------
// SYNONYM MAPS
// Normaliza variantes fonéticas comuns da Web Speech API antes do parse.
// Ex: "pont" → "ponto", "taime aute" → "timeout"
// ---------------------------------------------------------------------------

const PHONETIC_SYNONYMS_PT: Record<string, string> = {
  'pont ':     'ponto ',  // Frase "pont do" → "ponto do"
  'pontu':     'ponto',
  'bloco':     'bloqueio',
  'bloquio':   'bloqueio',
  'bloqueou':  'bloqueio',
  'taime':     'time',
  'taimaute':  'timeout',
  'taimeaute': 'timeout',
  'pedido de tempo': 'timeout',
  'cortô':     'cortada',
  'cravô':     'cravou',
  'achei':     'ace',    // Phonetic corruption of "ace"
  'aice':      'ace',
  'eis':       'ace',
  'ops ':      'desfazer ',
  'opss ':     'desfazer ',
};

const PHONETIC_SYNONYMS_EN: Record<string, string> = {
  'sack':    'serve',   // Phonetic: "saque" → "sack" (common API error)
  'eis':     'ace',
  'oops ':   'undo ',
  'oopss ':  'undo ',
  'killl':   'kill',
  'spik':    'spike',
};

const PHONETIC_SYNONYMS_ES: Record<string, string> = {
  'taime aute': 'timeout',
  'eis':         'ace',
};

const PHONETIC_SYNONYMS: Record<string, Record<string, string>> = {
  pt: PHONETIC_SYNONYMS_PT,
  en: PHONETIC_SYNONYMS_EN,
  es: PHONETIC_SYNONYMS_ES,
};

// ---------------------------------------------------------------------------
// NUMBERS (written → digit), used primarily in PT
// ---------------------------------------------------------------------------

const WRITTEN_NUMBERS: Record<string, string> = {
  'zero': '0', 'um': '1', 'uma': '1', 'dois': '2', 'duas': '2',
  'três': '3', 'tres': '3', 'quatro': '4', 'cinco': '5', 'seis': '6',
  'sete': '7', 'oito': '8', 'nove': '9', 'dez': '10',
  'onze': '11', 'doze': '12', 'treze': '13',
  'catorze': '14', 'quatorze': '14', 'quinze': '15',
  'dezesseis': '16', 'dezessete': '17', 'dezoito': '18', 'dezenove': '19',
  'vinte': '20',
};

// ---------------------------------------------------------------------------
// VOCABULARY
// ---------------------------------------------------------------------------

const VOCABULARY: Record<string, {
  teamA_Strict: string[];
  teamB_Strict: string[];
  pointTriggers: string[];
  negative: string[];
  globalUndo: string[];
  timeout: string[];
  server: string[];
  prepositions: string[];
  pointAceIndicators: string[]; // Palavras que junto com "saque" indicam ACE, não server change
  skills: {
    attack: string[];
    block: string[];
    ace: string[];
    opponent_error: string[];
  };
}> = {
  pt: {
    teamA_Strict: ['time a', 'equipe a', 'lado a', 'mandante', 'casa', 'esquerda', 'time da casa'],
    teamB_Strict: ['time b', 'equipe b', 'lado b', 'visitante', 'fora', 'direita', 'time de fora'],
    pointTriggers: ['ponto', 'marcou', 'vai', 'ponto para', 'ponto do', 'ponto da', 'número', 'camisa', 'jogador', 'adicionar', 'mais um'],
    negative: ['tirar', 'remover', 'menos', 'subtrair', 'apagar', 'retirar', 'não foi', 'cancelar', 'volta', 'corrigir'],
    globalUndo: ['desfazer', 'voltar', 'cancelar', 'engano', 'ops', 'undo'],
    timeout: ['timeout', 'time out', 'pausa', 'pedido de tempo', 'tempo técnico'],
    server: ['troca de saque', 'mudança de saque', 'bola com', 'servidor', 'serviço de', 'rodar', 'girar', 'bola para', 'sacar', 'de quem é', 'com quem está'],
    prepositions: ['do', 'da', 'de', 'para', 'pelo', 'pela', 'o', 'no', 'na', 'com'],
    // Se "saque" aparecer junto com estas palavras → é ACE, não server change
    pointAceIndicators: ['ponto', 'marcou', 'direto', 'ace', 'mais um', 'foi'],
    skills: {
      attack: ['ataque', 'cortada', 'cravou', 'bomba', 'frente', 'fundo', 'atacou', 'largadinha', 'largada', 'mata'],
      block: ['bloqueio', 'block', 'paredão', 'toco', 'bloqueou', 'fechou', 'tampou'],
      ace: ['ace', 'saque direto', 'ponto de saque', 'direto', 'sacou', 'ponto no saque'],
      opponent_error: ['erro', 'na rede', 'rede', 'toque', 'invasão', 'dois toques', 'erro deles', 'condução', 'fora da linha'],
    },
  },
  en: {
    teamA_Strict: ['team a', 'home', 'host', 'left side', 'home team'],
    teamB_Strict: ['team b', 'guest', 'away', 'right side', 'away team'],
    pointTriggers: ['point', 'score', 'goal', 'point for', 'number', 'jersey', 'player', 'add', 'plus one'],
    negative: ['remove', 'minus', 'subtract', 'delete', 'take', 'correction', 'not', 'cancel'],
    globalUndo: ['undo', 'back', 'oops', 'revert'],
    timeout: ['timeout', 'time out', 'pause', 'break'],
    server: ['change server', 'change serve', 'ball to', 'service change', 'rotate', 'side out', 'possession'],
    prepositions: ['of', 'for', 'by', 'the', 'from', 'with', 'to'],
    pointAceIndicators: ['point', 'score', 'ace', 'direct', 'in'],
    skills: {
      attack: ['attack', 'kill', 'spike', 'hit', 'smash', 'tip', 'dump'],
      block: ['block', 'roof', 'wall', 'stuff'],
      ace: ['ace', 'service ace', 'serve ace'],
      opponent_error: ['error', 'out', 'net', 'fault', 'mistake', 'touch'],
    },
  },
  es: {
    teamA_Strict: ['equipo a', 'local', 'casa'],
    teamB_Strict: ['equipo b', 'visitante', 'fuera'],
    pointTriggers: ['punto', 'marcó', 'anotó', 'punto para', 'numero', 'jugador', 'sumar'],
    negative: ['quitar', 'restar', 'menos', 'borrar', 'no fue', 'cancelar'],
    globalUndo: ['deshacer', 'volver', 'cancelar', 'corrección', 'atrás'],
    timeout: ['tiempo', 'pausa', 'time out', 'pedir tiempo', 'tiempo técnico'],
    server: ['cambio de saque', 'cambio servicio', 'bola para', 'rotar', 'balón para'],
    prepositions: ['de', 'del', 'para', 'por', 'el', 'la', 'con'],
    pointAceIndicators: ['punto', 'marcó', 'ace', 'directo'],
    skills: {
      attack: ['ataque', 'remate', 'clavo', 'mate', 'finta'],
      block: ['bloqueo', 'block', 'muro', 'tapa'],
      ace: ['ace', 'saque directo', 'punto de saque'],
      opponent_error: ['error', 'fuera', 'red', 'falla', 'doble'],
    },
  },
};

// ---------------------------------------------------------------------------
// PARSER
// ---------------------------------------------------------------------------

export class VoiceCommandParser {

  // -------------------------------------------------------------------------
  // NORMALIZAÇÃO
  // Ordem: lowercase → acentos → pontuação → números → sinônimos fonéticos
  // -------------------------------------------------------------------------

  private static normalizeText(text: string, language: string): string {
    let normalized = text.toLowerCase().trim();

    // 1. Remover acentos (NFD decompõe caracteres acentuados; regex elimina diacríticos)
    normalized = normalized.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    // 2. Remover pontuação
    normalized = normalized.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '');

    // 3. Normalizar múltiplos espaços
    normalized = normalized.replace(/\s{2,}/g, ' ').trim();

    // 4. Converter números escritos por extenso (PT principalmente)
    for (const [word, digit] of Object.entries(WRITTEN_NUMBERS)) {
      // Substituir apenas palavras completas (word boundary)
      normalized = normalized.replace(new RegExp(`\\b${word}\\b`, 'g'), digit);
    }

    // 5. Aplicar sinônimos fonéticos do idioma
    const synonyms = PHONETIC_SYNONYMS[language] || {};
    for (const [bad, good] of Object.entries(synonyms)) {
      normalized = normalized.replace(new RegExp(bad, 'g'), good);
    }

    return normalized.trim();
  }

  // -------------------------------------------------------------------------
  // REMOÇÃO DE PREPOSIÇÕES
  // -------------------------------------------------------------------------

  private static removePrepositions(text: string, vocab: typeof VOCABULARY['pt']): string {
    const words = text.split(' ');
    return words.filter(w => !vocab.prepositions.includes(w)).join(' ');
  }

  // -------------------------------------------------------------------------
  // DETECÇÃO DE SKILL
  // Prioridade: Ace > Block > Attack > Error
  // -------------------------------------------------------------------------

  private static findSkill(text: string, vocab: typeof VOCABULARY['pt']): SkillType | undefined {
    if (vocab.skills.ace.some(k => text.includes(k))) return 'ace';
    if (vocab.skills.block.some(k => text.includes(k))) return 'block';
    if (vocab.skills.attack.some(k => text.includes(k))) return 'attack';
    if (vocab.skills.opponent_error.some(k => text.includes(k))) return 'opponent_error';
    return undefined;
  }

  // -------------------------------------------------------------------------
  // RESOLUÇÃO DE ENTIDADE (Time / Jogador)
  // Integra isFuzzyMatch para tolerância a erros de transcrição.
  // Prioridade: Exact > Jersey → FuzzyName → Team Name → Generic Keyword
  // -------------------------------------------------------------------------

  private static resolveEntity(
    text: string,
    playersA: Player[],
    playersB: Player[],
    teamAName: string,
    teamBName: string,
    vocab: typeof VOCABULARY['pt'],
  ): { player?: Player; team?: TeamId; confidence: number; isAmbiguous?: boolean; candidates?: string[] } | null {

    const cleanText = this.removePrepositions(text, vocab);
    const safeNameA = teamAName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
    const safeNameB = teamBName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

    // Rejeitar letras únicas ("a" / "b") para evitar falso-positivo
    const words = cleanText.split(' ');
    if (words.length === 1 && (words[0] === 'a' || words[0] === 'b')) return null;

    // --- JOGADORES ---
    const allPlayers = [
      ...playersA.map(p => ({ p, t: 'A' as TeamId })),
      ...playersB.map(p => ({ p, t: 'B' as TeamId })),
    ];

    const matches: Array<{ p: Player; t: TeamId; score: number }> = [];

    for (const { p, t } of allPlayers) {
      const playerNameNormalized = p.name.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '');

      // A. Match exato (100)
      if (cleanText === playerNameNormalized) {
        matches.push({ p, t, score: 100 });
        continue;
      }

      // B. Número de camisa (90)
      if (p.number && (
        cleanText.includes(`numero ${p.number}`) ||
        cleanText.includes(`number ${p.number}`) ||
        cleanText.includes(`camisa ${p.number}`) ||
        cleanText.includes(`jersey ${p.number}`) ||
        cleanText === p.number
      )) {
        matches.push({ p, t, score: 90 });
        continue;
      }

      // C. Starts With (70) — "Ana" casa com "Ana Paula"
      if (playerNameNormalized.startsWith(cleanText + ' ')) {
        matches.push({ p, t, score: 70 });
        continue;
      }

      // D. Contains (50) — "Paula" casa com "Ana Paula"
      if (playerNameNormalized.includes(cleanText)) {
        matches.push({ p, t, score: 50 });
        continue;
      }

      // E. Fuzzy match via Levenshtein (30) — "Joao" casa com "João"
      // Aplicar em cada token do nome para nomes compostos
      const playerTokens = playerNameNormalized.split(' ');
      const inputTokens = cleanText.split(' ');
      const hasFuzzyMatch = inputTokens.some(inputToken =>
        inputToken.length >= 3 && // Mínimo 3 chars para evitar ruído
        playerTokens.some(nameToken => isFuzzyMatch(inputToken, nameToken))
      );

      if (hasFuzzyMatch) {
        matches.push({ p, t, score: 30 });
      }
    }

    if (matches.length > 0) {
      matches.sort((a, b) => b.score - a.score);
      const topMatch = matches[0];
      const similarMatches = matches.filter(m => m.score === topMatch.score);

      // Ambiguidade: múltiplos matches com mesmo score (não é exact)
      if (similarMatches.length > 1 && topMatch.score < 100) {
        return {
          isAmbiguous: true,
          candidates: similarMatches.map(m => m.p.name),
          confidence: 0,
        };
      }

      return { player: topMatch.p, team: topMatch.t, confidence: topMatch.score / 100 };
    }

    // --- NOME DO TIME (fuzzy) ---
    if (safeNameA.length > 2 && isFuzzyMatch(cleanText, safeNameA)) return { team: 'A', confidence: 0.95 };
    if (safeNameB.length > 2 && isFuzzyMatch(cleanText, safeNameB)) return { team: 'B', confidence: 0.95 };

    // --- KEYWORDS GENÉRICAS ---
    if (vocab.teamA_Strict.some(k => cleanText.includes(k))) return { team: 'A', confidence: 0.9 };
    if (vocab.teamB_Strict.some(k => cleanText.includes(k))) return { team: 'B', confidence: 0.9 };

    // --- FALLBACK EXPLÍCITO ---
    if (cleanText.includes('ponto a') || cleanText.includes('point a')) return { team: 'A', confidence: 0.9 };
    if (cleanText.includes('ponto b') || cleanText.includes('point b')) return { team: 'B', confidence: 0.9 };

    return null;
  }

  // -------------------------------------------------------------------------
  // INFERÊNCIA POR CONTEXTO
  // Implementa as 7 regras definidas no PRD para preencher lacunas
  // quando o parser local não consegue identificar o time pela frase.
  // -------------------------------------------------------------------------

  private static resolveByContext(
    detectedSkill: SkillType | undefined,
    isNegative: boolean,
    isPointTrigger: boolean,
    context: VoiceContext,
  ): TeamId | null {

    // REGRA 0 — Bloquear comandos após fim do jogo
    if (context.isMatchOver) return null;

    // REGRA 1 — Ace → time que está sacando
    // "Ace!" ou "Saque direto!" sem mencionar time → servingTeam pontuou
    if (detectedSkill === 'ace' && context.servingTeam) {
      return context.servingTeam;
    }

    // REGRA 2 — Erro/Rede → time OPOSTO ao que cometeu o erro
    // Na prática: "Erro!" durante um rally → time adversário ao servidor pontuou
    // Ou: time adversário ao último marcador pontuou
    if (detectedSkill === 'opponent_error') {
      if (context.servingTeam) {
        return context.servingTeam === 'A' ? 'B' : 'A';
      }
      if (context.lastScorerTeam) {
        return context.lastScorerTeam === 'A' ? 'B' : 'A';
      }
    }

    // REGRA 3 — Bloqueio → time que bloqueou (OPOSTO ao que atacou)
    // Convenção: bloqueio é do time que recebe ataque/saque → oposto ao servidor
    if (detectedSkill === 'block' && context.servingTeam) {
      return context.servingTeam === 'A' ? 'B' : 'A';
    }

    // REGRA 4 — "Ponto!" / "Mais um!" sem time → continuidade (lastScorerTeam)
    if (isPointTrigger && !detectedSkill && context.lastScorerTeam) {
      return context.lastScorerTeam;
    }

    // REGRA 5 — Ataque sem time → servidor (atacante geralmente saca)
    // Baixa confiança; usado como último recurso quando statsEnabled
    if (detectedSkill === 'attack' && context.servingTeam) {
      return context.servingTeam;
    }

    // REGRA 6 — Qualquer skill com negativo sem time → oposto ao lastScorerTeam
    if (isNegative && context.lastScorerTeam) {
      return context.lastScorerTeam;
    }

    return null; // Regra 7: nenhuma inferência possível → `unknown`
  }

  // -------------------------------------------------------------------------
  // PARSE — Ponto de entrada principal
  // -------------------------------------------------------------------------

  public static parse(
    rawText: string,
    language: string,
    context: VoiceContext,
  ): VoiceCommandIntent {

    // Bloquear comandos pós-partida
    if (context.isMatchOver) {
      return {
        type: 'unknown',
        confidence: 0,
        rawText,
        debugMessage: 'Match is over — commands blocked',
      };
    }

    const text = this.normalizeText(rawText, language);
    const vocab = VOCABULARY[language] || VOCABULARY['en'];

    // --- 1. Desfazer Global (máxima prioridade) ---
    if (vocab.globalUndo.some(k => text.includes(k))) {
      return { type: 'undo', confidence: 1, rawText, debugMessage: 'Global Undo' };
    }

    // --- 2. Extrair componentes básicos ---
    const detectedSkill = this.findSkill(text, vocab);
    const entity = this.resolveEntity(text, context.playersA, context.playersB, context.teamAName, context.teamBName, vocab);

    if (entity?.isAmbiguous) {
      return {
        type: 'unknown',
        confidence: 0,
        rawText,
        isAmbiguous: true,
        ambiguousCandidates: entity.candidates,
        debugMessage: `Ambiguous: ${entity.candidates?.join(', ')}`,
      };
    }

    const isNegative = vocab.negative.some(k => text.includes(k));
    const isTimeout = vocab.timeout.some(k => text.includes(k));
    const isPointTrigger = vocab.pointTriggers.some(k => text.includes(k));

    // Detectar troca de server vs ace usando co-ocorrência
    // "saque" + indicador de ponto → ACE. "saque" sozinho → server change.
    const hasServerKeyword = vocab.server.some(k => text.includes(k));
    const hasPointAceIndicator = vocab.pointAceIndicators.some(k => text.includes(k));
    const isExplicitServerChange = hasServerKeyword && !hasPointAceIndicator;

    // --- 3. Roteamento de Lógica ---

    // A. TIMEOUT
    if (isTimeout) {
      const team = entity?.team ?? this.resolveByContext(undefined, false, false, context);
      if (team) return { type: 'timeout', team, confidence: 1, rawText, debugMessage: `Timeout Team ${team}` };
    }

    // B. TROCA DE SAQUE (server change)
    if (isExplicitServerChange) {
      if (entity?.team) {
        return { type: 'server', team: entity.team, confidence: 1, rawText, debugMessage: `Server: Team ${entity.team}` };
      }
      // Side-out: se não identificou time, assume troca do servidor atual
      if (context.servingTeam) {
        const nextServer = context.servingTeam === 'A' ? 'B' : 'A';
        return { type: 'server', team: nextServer, confidence: 0.8, rawText, debugMessage: `Side-out → Team ${nextServer}` };
      }
      return { type: 'server', confidence: 0.5, rawText, requiresMoreInfo: true, debugMessage: 'Server ambíguo' };
    }

    // C. PONTO / SKILL
    if (entity?.team || detectedSkill || isPointTrigger) {

      let targetTeam = entity?.team;

      // Sem team identificado → tentar inferência contextual
      if (!targetTeam) {
        const inferred = this.resolveByContext(detectedSkill, isNegative, isPointTrigger, context);
        if (inferred) {
          targetTeam = inferred;
        }
      }

      if (targetTeam) {
        const playerPayload = entity?.player
          ? { id: entity.player.id, name: entity.player.name }
          : undefined;

        // Se statsEnabled + skill detectada sem jogador → aguardar player
        if (context.statsEnabled && detectedSkill && !playerPayload && !isNegative) {
          return {
            type: 'point',
            team: targetTeam,
            skill: detectedSkill,
            confidence: 0.6,
            rawText,
            requiresMoreInfo: true,
            debugMessage: `Heard ${detectedSkill} for ${targetTeam}, waiting for player...`,
          };
        }

        let debugMsg = isNegative ? 'Remove Point' : 'Add Point';
        debugMsg += ` [${targetTeam}]`;
        if (playerPayload) debugMsg += ` Player: ${playerPayload.name}`;
        if (detectedSkill) debugMsg += ` (${detectedSkill})`;

        return {
          type: 'point',
          team: targetTeam,
          player: playerPayload,
          skill: detectedSkill,
          isNegative,
          confidence: entity?.confidence ?? 0.75,
          rawText,
          debugMessage: debugMsg,
        };
      }
    }

    // D. Skill órfã (ouviu skill mas não identificou contexto)
    if (detectedSkill && context.statsEnabled) {
      return {
        type: 'unknown',
        skill: detectedSkill,
        confidence: 0.5,
        rawText,
        requiresMoreInfo: true,
        debugMessage: `Orphan skill: ${detectedSkill}`,
      };
    }

    return { type: 'unknown', confidence: 0, rawText, debugMessage: 'Could not identify team or player' };
  }
}
```

---

## 3. `useVoiceControl.ts` — MODIFICAR

**Arquivo:** `src/features/voice/hooks/useVoiceControl.ts`

```typescript
import { useState, useEffect, useCallback, useRef } from 'react';
import { TeamId, Player, SkillType, VoiceCommandIntent } from '@types';
import { VoiceRecognitionService } from '../services/VoiceRecognitionService';
import { VoiceCommandParser } from '../services/VoiceCommandParser';
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
  onThinkingState?: (isThinking: boolean) => void;

  language: string;
  teamAName: string;
  teamBName: string;
  playersA: Player[];
  playersB: Player[];
  servingTeam: TeamId | null;

  // NOVOS props de contexto para inferência
  lastScorerTeam: TeamId | null;
  scoreA: number;
  scoreB: number;
  currentSet: number;
  isMatchOver: boolean;
}

export const useVoiceControl = ({
  enabled, enablePlayerStats, onAddPoint, onSubtractPoint, onUndo, onTimeout, onSetServer,
  onThinkingState,
  language, teamAName, teamBName, playersA, playersB, servingTeam,
  lastScorerTeam, scoreA, scoreB, currentSet, isMatchOver,
}: UseVoiceControlProps) => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const { t } = useTranslation();

  const geminiService = useRef(GeminiCommandService.getInstance()).current;
  const recognitionService = useRef(VoiceRecognitionService.getInstance()).current;

  // Ref estável para o buffer — recriado ao mudar idioma
  const bufferRef = useRef<CommandBuffer | null>(null);

  const executeAction = useCallback(async (transcript: string, isFinal: boolean) => {
    // Montar contexto completo para o parser
    const voiceContext = {
      teamAName, teamBName, playersA, playersB,
      statsEnabled: enablePlayerStats,
      servingTeam,
      lastScorerTeam,
      scoreA, scoreB, currentSet, isMatchOver,
    };

    // 1. Parse local (rápido, determinístico)
    const localIntent = VoiceCommandParser.parse(transcript, language, voiceContext);

    // 2. Fallback para IA apenas se configurado (por padrão: desabilitado)
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
        processIntent(aiResult);
      }
    } else if (localIntent && localIntent.type !== 'unknown') {
      processIntent(localIntent);
    }
  }, [
    language, teamAName, teamBName, playersA, playersB, enablePlayerStats,
    servingTeam, lastScorerTeam, scoreA, scoreB, currentSet, isMatchOver,
    onThinkingState,
  ]);

  const processIntent = (intent: VoiceCommandIntent) => {
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
      case 'undo':
        onUndo();
        break;
    }
  };

  // Recriar buffer quando executeAction ou idioma mudar
  useEffect(() => {
    if (!enabled) return;

    bufferRef.current?.cancel();
    bufferRef.current = new CommandBuffer(executeAction, 400);
  }, [enabled, executeAction]);

  // Conectar buffer ao VoiceRecognitionService
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

  return {
    isListening,
    isProcessingAI,
    toggleListening: () => recognitionService.start(language),
  };
};
```

---

## 4. `GameScreen.tsx` — MODIFICAR

Adicionar os novos props ao chamar `useVoiceControl` (linha 138 do arquivo atual):

**Antes:**
```typescript
const { isListening, toggleListening } = useVoiceControl({
    enabled: config.voiceControlEnabled && !isSpectator,
    enablePlayerStats: config.enablePlayerStats,
    onAddPoint: handleAddPointGeneric,
    onSubtractPoint: (team) => {
        if (isSpectator) return;
        subtractPoint(team);
    },
    onUndo: handlers.handleUndo,
    onThinkingState: () => {},
    onTimeout: (team) => useTimeout(team),
    onSetServer: (team) => setServer(team),
    language,
    teamAName: rosterState.teamAName,
    teamBName: rosterState.teamBName,
    playersA: teamARoster.players,
    playersB: teamBRoster.players,
    servingTeam: scoreState.servingTeam
});
```

**Depois:**
```typescript
const { isListening, toggleListening } = useVoiceControl({
    enabled: config.voiceControlEnabled && !isSpectator,
    enablePlayerStats: config.enablePlayerStats,
    onAddPoint: handleAddPointGeneric,
    onSubtractPoint: (team) => {
        if (isSpectator) return;
        subtractPoint(team);
    },
    onUndo: handlers.handleUndo,
    onThinkingState: () => {},
    onTimeout: (team) => useTimeout(team),
    onSetServer: (team) => setServer(team),
    language,
    teamAName: rosterState.teamAName,
    teamBName: rosterState.teamBName,
    playersA: teamARoster.players,
    playersB: teamBRoster.players,
    servingTeam: scoreState.servingTeam,
    // Contexto para inferência sem IA
    lastScorerTeam: scoreState.lastScorerTeam,
    scoreA: scoreState.scoreA,
    scoreB: scoreState.scoreB,
    currentSet: scoreState.currentSet,
    isMatchOver: scoreState.isMatchOver,
});
```

> **Nota:** `scoreState` já expõe `lastScorerTeam`, `scoreA`, `scoreB`, `currentSet` e `isMatchOver` (verificado em `GameContext.tsx` linha 78 e `useCombinedGameState.ts` linha 52).

---

## 5. Testes Unitários

**Arquivo:** `src/features/voice/services/__tests__/VoiceCommandParser.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { VoiceCommandParser } from '../VoiceCommandParser';
import type { VoiceContext } from '../VoiceCommandParser';
import type { Player } from '@types';

// -------------------------------------------------------------------------
// HELPERS
// -------------------------------------------------------------------------

const makePlayer = (id: string, name: string, number?: string): Player => ({
  id,
  name,
  number,
  skillLevel: 3,
  isFixed: false,
  originalIndex: 0,
});

const makeContext = (overrides: Partial<VoiceContext> = {}): VoiceContext => ({
  teamAName: 'Flamengo',
  teamBName: 'Botafogo',
  playersA: [
    makePlayer('a1', 'João Silva', '7'),
    makePlayer('a2', 'Carlos Lima', '10'),
  ],
  playersB: [
    makePlayer('b1', 'Ana Paula', '3'),
    makePlayer('b2', 'Beatriz Souza', '15'),
  ],
  statsEnabled: true,
  servingTeam: 'A',
  lastScorerTeam: null,
  scoreA: 5,
  scoreB: 4,
  currentSet: 1,
  isMatchOver: false,
  ...overrides,
});

const parse = (text: string, context?: Partial<VoiceContext>, lang = 'pt') =>
  VoiceCommandParser.parse(text, lang, makeContext(context));

// -------------------------------------------------------------------------
// TESTES
// -------------------------------------------------------------------------

describe('VoiceCommandParser — Comandos Básicos', () => {

  it('deve reconhecer "desfazer" como undo', () => {
    const result = parse('desfazer');
    expect(result.type).toBe('undo');
    expect(result.confidence).toBe(1);
  });

  it('deve reconhecer "ops" como undo (sinônimo fonético)', () => {
    const result = parse('ops');
    expect(result.type).toBe('undo');
  });

  it('deve reconhecer ponto para time A por nome', () => {
    const result = parse('ponto para o Flamengo');
    expect(result.type).toBe('point');
    expect(result.team).toBe('A');
  });

  it('deve reconhecer ponto para time B por nome', () => {
    const result = parse('Botafogo marcou');
    expect(result.type).toBe('point');
    expect(result.team).toBe('B');
  });

  it('deve reconhecer "ponto do time a"', () => {
    const result = parse('ponto do time a');
    expect(result.type).toBe('point');
    expect(result.team).toBe('A');
  });

  it('deve reconhecer "tirar ponto do time b" como negativo', () => {
    const result = parse('tirar ponto do time b');
    expect(result.type).toBe('point');
    expect(result.team).toBe('B');
    expect(result.isNegative).toBe(true);
  });

  it('deve bloquear comandos quando isMatchOver = true', () => {
    const result = parse('ponto do Flamengo', { isMatchOver: true });
    expect(result.type).toBe('unknown');
  });

});

describe('VoiceCommandParser — Inferência Contextual', () => {

  it('REGRA 1 — "Ace" sem time → servingTeam (A)', () => {
    const result = parse('ace', { servingTeam: 'A' });
    expect(result.type).toBe('point');
    expect(result.team).toBe('A');
    expect(result.skill).toBe('ace');
  });

  it('REGRA 1 — "Ace" sem time → servingTeam (B)', () => {
    const result = parse('ace', { servingTeam: 'B' });
    expect(result.type).toBe('point');
    expect(result.team).toBe('B');
    expect(result.skill).toBe('ace');
  });

  it('REGRA 2 — "Erro" sem time → oposto ao servidor (B pontuou)', () => {
    const result = parse('erro', { servingTeam: 'A' });
    expect(result.type).toBe('point');
    expect(result.team).toBe('B');
    expect(result.skill).toBe('opponent_error');
  });

  it('REGRA 3 — "Bloqueio" sem time → oposto ao servidor', () => {
    const result = parse('bloqueio', { servingTeam: 'B' });
    expect(result.type).toBe('point');
    expect(result.team).toBe('A'); // A bloqueou B
  });

  it('REGRA 4 — "Ponto!" sem time → lastScorerTeam', () => {
    const result = parse('ponto', { lastScorerTeam: 'B', servingTeam: null });
    expect(result.type).toBe('point');
    expect(result.team).toBe('B');
  });

  it('deve retornar unknown quando não há contexto suficiente', () => {
    const result = parse('ponto', { lastScorerTeam: null, servingTeam: null });
    expect(result.type).toBe('unknown');
  });

});

describe('VoiceCommandParser — Fuzzy Matching', () => {

  it('deve casar "Joao" com jogador "João Silva" (acento)', () => {
    const result = parse('ponto do Joao', { statsEnabled: false });
    expect(result.type).toBe('point');
    expect(result.player?.name).toBe('João Silva');
    expect(result.team).toBe('A');
  });

  it('deve casar "carlos" com "Carlos Lima"', () => {
    const result = parse('ponto do carlos', { statsEnabled: false });
    expect(result.type).toBe('point');
    expect(result.player?.name).toBe('Carlos Lima');
  });

  it('deve casar jogador por número de camisa', () => {
    const result = parse('ponto camisa 3', { statsEnabled: false });
    expect(result.type).toBe('point');
    expect(result.player?.name).toBe('Ana Paula');
    expect(result.team).toBe('B');
  });

  it('deve tolerar "Joao Silv" (truncado) e casar com João Silva', () => {
    const result = parse('ponto do Joao Silv', { statsEnabled: false });
    expect(result.type).toBe('point');
    expect(result.player?.name).toBe('João Silva');
  });

  it('deve reconhecer nome de time com erro de transcrição', () => {
    // "Flamengoo" → fuzzy → "Flamengo"
    const result = parse('ponto do Flamengoo', { statsEnabled: false });
    expect(result.type).toBe('point');
    expect(result.team).toBe('A');
  });

});

describe('VoiceCommandParser — Desambiguação Saque vs Ace', () => {

  it('"saque" isolado → troca de server, não ace', () => {
    const result = parse('saque do Flamengo');
    expect(result.type).toBe('server');
    expect(result.team).toBe('A');
  });

  it('"saque direto" → ace, não server change', () => {
    const result = parse('saque direto do Flamengo');
    expect(result.type).toBe('point');
    expect(result.skill).toBe('ace');
    expect(result.team).toBe('A');
  });

  it('"ponto no saque" → ace para servingTeam se sem time explícito', () => {
    const result = parse('ponto no saque', { servingTeam: 'B' });
    expect(result.type).toBe('point');
    expect(result.skill).toBe('ace');
  });

});

describe('VoiceCommandParser — Normalização', () => {

  it('deve tolerar texto em maiúsculas', () => {
    const result = parse('PONTO DO TIME A');
    expect(result.type).toBe('point');
    expect(result.team).toBe('A');
  });

  it('deve tolerar "pont" (frase cortada) como "ponto"', () => {
    const result = parse('pont do Flamengo');
    expect(result.type).toBe('point');
    expect(result.team).toBe('A');
  });

  it('deve converter "bloco" → "bloqueio"', () => {
    const result = parse('bloco do time a');
    expect(result.skill).toBe('block');
  });

  it('deve reconhecer timeout com variante fonética', () => {
    const result = parse('taimaute do Flamengo');
    expect(result.type).toBe('timeout');
    expect(result.team).toBe('A');
  });

});

describe('VoiceCommandParser — EN', () => {

  it('deve reconhecer "point for team a" em inglês', () => {
    const result = parse('point for team a', {}, 'en');
    expect(result.type).toBe('point');
    expect(result.team).toBe('A');
  });

  it('deve reconhecer "undo" em inglês', () => {
    const result = parse('undo', {}, 'en');
    expect(result.type).toBe('undo');
  });

  it('deve casar "sack" como "serve" em inglês (fonético)', () => {
    const result = parse('sack for team b', {}, 'en');
    expect(result.type).toBe('server');
    expect(result.team).toBe('B');
  });

});
```

---

## Resumo da Verificação

### Testes Automatizados
```bash
# Rodar apenas os testes de voz
npx vitest run src/features/voice/services/__tests__/VoiceCommandParser.test.ts

# Com coverage
npx vitest run --coverage src/features/voice/services/__tests__/VoiceCommandParser.test.ts
```

### Verificação de Build
```bash
npm run type-check
npm run build
```

### Teste Manual no Browser
1. `npm run dev`
2. Iniciar partida com dois times ("Flamengo" vs "Botafogo") e jogadores cadastrados
3. Ativar controle por voz no menu de configurações
4. Testar frases:

| Frase | Resultado Esperado |
|-------|--------------------|
| "Ponto!" | +1 para `lastScorerTeam` (ou unknown se nenhum marcou ainda) |
| "Ace!" | +1 para `servingTeam`, skill: ace |
| "Erro!" | +1 time oposto ao `servingTeam` |
| "Ponto do Flamengo" | +1 Time A |
| "Pont do Flamengoo" | +1 Time A (fuzzy) |
| "Ponto do Joao" | +1 Time A, player: João Silva |
| "Desfazer" | Undo |
| "Saque do Botafogo" | Server: Team B |
| "Saque direto" | Ace, servingTeam |
