import { TeamId, Player, SkillType, VoiceCommandIntent } from '@types';
import { isFuzzyMatch } from '@lib/utils/stringUtils';

// ---------------------------------------------------------------------------
// CONTEXT INTERFACE
// ---------------------------------------------------------------------------

export interface VoiceContext {
  teamAName: string;
  teamBName: string;
  playersA: Player[];
  playersB: Player[];
  statsEnabled: boolean;
  servingTeam: TeamId | null;
  lastScorerTeam: TeamId | null;
  scoreA: number;
  scoreB: number;
  currentSet: number;
  isMatchOver: boolean;
}

// ---------------------------------------------------------------------------
// PHONETIC SYNONYMS — Normaliza variantes fonéticas comuns da Web Speech API
// ---------------------------------------------------------------------------

const PHONETIC_SYNONYMS_PT: Record<string, string> = {
  'pont ': 'ponto ',
  'pontu': 'ponto',
  'bloco': 'bloqueio',
  'bloquio': 'bloqueio',
  'bloqueou': 'bloqueio',
  'taime': 'time',
  'taimaute': 'timeout',
  'taimeaute': 'timeout',
  'time auto': 'timeout',
  'time aute': 'timeout',
  'pedido de tempo': 'timeout',
  'cortô': 'cortada',
  'cravô': 'cravou',
  'achei': 'ace',
  'aice': 'ace',
  'eis': 'ace',
  'ops ': 'desfazer ',
  'opss ': 'desfazer ',
};

const PHONETIC_SYNONYMS_EN: Record<string, string> = {
  'sack': 'serve',
  'eis': 'ace',
  'oops ': 'undo ',
  'oopss ': 'undo ',
  'killl': 'kill',
  'spik': 'spike',
  'swab': 'swap',
  'swop': 'swap',
};

const PHONETIC_SYNONYMS_ES: Record<string, string> = {
  'taime aute': 'timeout',
  'eis': 'ace',
  'cambié': 'cambiar',
};

const PHONETIC_SYNONYMS: Record<string, Record<string, string>> = {
  pt: PHONETIC_SYNONYMS_PT,
  en: PHONETIC_SYNONYMS_EN,
  es: PHONETIC_SYNONYMS_ES,
};

// ---------------------------------------------------------------------------
// NUMBERS (written → digit)
// ---------------------------------------------------------------------------

const WRITTEN_NUMBERS: Record<string, string> = {
  'zero': '0', 'um': '1', 'uma': '1', 'dois': '2', 'duas': '2',
  'três': '3', 'tres': '3', 'quatro': '4', 'cinco': '5', 'seis': '6',
  'sete': '7', 'oito': '8', 'nove': '9', 'dez': '10',
  'onze': '11', 'doze': '12', 'treze': '13',
  'catorze': '14', 'quatorze': '14', 'quinze': '15',
  'dezesseis': '16', 'dezessete': '17', 'dezoito': '18', 'dezenove': '19',
  'vinte': '20',
  // EN
  'one': '1', 'two': '2', 'three': '3', 'four': '4', 'five': '5',
  'six': '6', 'seven': '7', 'eight': '8', 'nine': '9', 'ten': '10',
  'eleven': '11', 'twelve': '12',
  // ES (only unique entries not already covered)
  'uno': '1', 'cuatro': '4',
  'siete': '7', 'ocho': '8', 'nueve': '9', 'diez': '10',
};

// ---------------------------------------------------------------------------
// VOCABULARY — Multi-language
// ---------------------------------------------------------------------------

const VOCABULARY: Record<string, {
  teamA_Strict: string[];
  teamB_Strict: string[];
  teamA_Sides: string[];
  teamB_Sides: string[];
  pointTriggers: string[];
  negative: string[];
  globalUndo: string[];
  timeout: string[];
  server: string[];
  swap: string[];
  prepositions: string[];
  pointAceIndicators: string[];
  skills: {
    attack: string[];
    block: string[];
    ace: string[];
    opponent_error: string[];
  };
  skillPatterns: string[];
}> = {
  pt: {
    teamA_Strict: ['time a', 'equipe a', 'mandante', 'casa', 'time da casa'],
    teamB_Strict: ['time b', 'equipe b', 'visitante', 'fora', 'time de fora'],
    teamA_Sides: ['esquerda', 'lado a', 'lado esquerdo'],
    teamB_Sides: ['direita', 'lado b', 'lado direito'],
    pointTriggers: ['ponto', 'marcou', 'vai', 'ponto para', 'ponto do', 'ponto da', 'numero', 'camisa', 'jogador', 'adicionar', 'mais um'],
    negative: ['tirar', 'remover', 'menos', 'subtrair', 'apagar', 'retirar', 'nao foi', 'cancelar ponto', 'volta ponto', 'corrigir'],
    globalUndo: ['desfazer', 'voltar', 'cancelar', 'engano', 'ops', 'undo'],
    timeout: ['timeout', 'time out', 'pausa', 'pedido de tempo', 'tempo tecnico'],
    server: ['troca de saque', 'mudanca de saque', 'bola com', 'servidor', 'servico de', 'rodar', 'girar', 'bola para', 'sacar', 'de quem e', 'com quem esta', 'saque'],
    swap: ['trocar lados', 'trocar lado', 'troca de lado', 'trocar de lado', 'inverter lados', 'inverter', 'mudar lados', 'mudar lado', 'swap', 'virar lado', 'virar lados', 'trocar posicao', 'mudar de lado'],
    prepositions: ['do', 'da', 'de', 'para', 'pelo', 'pela', 'o', 'no', 'na', 'com', 'ao', 'dos', 'das'],
    pointAceIndicators: ['ponto', 'marcou', 'direto', 'ace', 'mais um', 'foi'],
    skills: {
      attack: ['ataque', 'cortada', 'cravou', 'bomba', 'frente', 'fundo', 'atacou', 'largadinha', 'largada', 'mata', 'ponto de ataque', 'mate', 'matar'],
      block: ['bloqueio', 'block', 'paredao', 'toco', 'bloqueou', 'fechou', 'tampou', 'ponto de bloqueio'],
      ace: ['ace', 'saque direto', 'ponto de saque', 'direto', 'sacou', 'ponto no saque'],
      opponent_error: ['erro', 'na rede', 'rede', 'toque', 'invasao', 'dois toques', 'erro deles', 'conducao', 'fora da linha', 'ponto de erro', 'erro do adversario'],
    },
    skillPatterns: ['ponto de ataque', 'ponto de bloqueio', 'ponto de saque', 'ponto de erro'],
  },
  en: {
    teamA_Strict: ['team a', 'home', 'host', 'home team'],
    teamB_Strict: ['team b', 'guest', 'away', 'away team'],
    teamA_Sides: ['left', 'left side'],
    teamB_Sides: ['right', 'right side'],
    pointTriggers: ['point', 'score', 'goal', 'point for', 'number', 'jersey', 'player', 'add', 'plus one'],
    negative: ['remove', 'minus', 'subtract', 'delete', 'take', 'correction', 'not', 'cancel point'],
    globalUndo: ['undo', 'back', 'oops', 'revert'],
    timeout: ['timeout', 'time out', 'pause', 'break', 'call timeout', 'request timeout'],
    server: ['change server', 'change serve', 'ball to', 'service change', 'rotate', 'side out', 'possession', 'serve'],
    swap: ['swap sides', 'switch sides', 'swap', 'switch', 'flip sides', 'change sides', 'flip', 'reverse sides'],
    prepositions: ['of', 'for', 'by', 'the', 'from', 'with', 'to', 'a'],
    pointAceIndicators: ['point', 'score', 'ace', 'direct', 'in'],
    skills: {
      attack: ['attack', 'kill', 'spike', 'hit', 'smash', 'tip', 'dump', 'attack point'],
      block: ['block', 'roof', 'wall', 'stuff', 'block point'],
      ace: ['ace', 'service ace', 'serve ace'],
      opponent_error: ['error', 'out', 'net', 'fault', 'mistake', 'touch', 'error point'],
    },
    skillPatterns: ['attack point', 'block point', 'ace', 'error point'],
  },
  es: {
    teamA_Strict: ['equipo a', 'local', 'casa'],
    teamB_Strict: ['equipo b', 'visitante', 'fuera'],
    teamA_Sides: ['izquierda', 'lado a', 'lado izquierdo'],
    teamB_Sides: ['derecha', 'lado b', 'lado derecho'],
    pointTriggers: ['punto', 'marco', 'anoto', 'punto para', 'numero', 'jugador', 'sumar'],
    negative: ['quitar', 'restar', 'menos', 'borrar', 'no fue', 'cancelar punto'],
    globalUndo: ['deshacer', 'volver', 'cancelar', 'correccion', 'atras'],
    timeout: ['tiempo', 'pausa', 'time out', 'pedir tiempo', 'tiempo tecnico'],
    server: ['cambio de saque', 'cambio servicio', 'bola para', 'rotar', 'balon para', 'saque'],
    swap: ['cambiar lados', 'cambiar lado', 'invertir', 'cambio de lado', 'swap', 'voltear'],
    prepositions: ['de', 'del', 'para', 'por', 'el', 'la', 'con', 'al', 'los', 'las'],
    pointAceIndicators: ['punto', 'marco', 'ace', 'directo'],
    skills: {
      attack: ['ataque', 'remate', 'clavo', 'mate', 'finta', 'punto de ataque'],
      block: ['bloqueo', 'block', 'muro', 'tapa', 'punto de bloqueo'],
      ace: ['ace', 'saque directo', 'punto de saque'],
      opponent_error: ['error', 'fuera', 'red', 'falla', 'doble', 'punto de error'],
    },
    skillPatterns: ['punto de ataque', 'punto de bloqueo', 'punto de saque', 'punto de error'],
  },
};

// ---------------------------------------------------------------------------
// PARSER
// ---------------------------------------------------------------------------

export class VoiceCommandParser {

  // -------------------------------------------------------------------------
  // NORMALIZAÇÃO
  // Ordem: lowercase → acentos → pontuação → espaços → números → sinônimos
  // -------------------------------------------------------------------------

  private static normalizeText(text: string, language: string): string {
    let normalized = text.toLowerCase().trim();

    // 1. Remover acentos (NFD decompõe; regex elimina diacríticos)
    normalized = normalized.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    // 2. Remover pontuação
    normalized = normalized.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '');

    // 3. Normalizar múltiplos espaços
    normalized = normalized.replace(/\s{2,}/g, ' ').trim();

    // 4. Converter números escritos por extenso
    for (const [word, digit] of Object.entries(WRITTEN_NUMBERS)) {
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
  // NORMALIZE TEAM NAME — mesma pipeline de normalização do texto
  // -------------------------------------------------------------------------

  private static normalizeTeamName(name: string): string {
    return name.toLowerCase().trim()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
      .replace(/\s{2,}/g, ' ').trim();
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
  // Prioridade: Patterns > Ace > Block > Attack > Error
  // -------------------------------------------------------------------------

  private static findSkill(text: string, vocab: typeof VOCABULARY['pt']): SkillType | undefined {
    // Check compound patterns first (more specific)
    for (const pattern of vocab.skillPatterns) {
      if (text.includes(pattern)) {
        if (pattern.includes('ataque') || pattern.includes('attack')) return 'attack';
        if (pattern.includes('bloqueio') || pattern.includes('block') || pattern.includes('bloqueo')) return 'block';
        if (pattern.includes('saque') || pattern.includes('ace')) return 'ace';
        if (pattern.includes('erro') || pattern.includes('error')) return 'opponent_error';
      }
    }

    if (vocab.skills.ace.some(k => text.includes(k))) return 'ace';
    if (vocab.skills.block.some(k => text.includes(k))) return 'block';
    if (vocab.skills.attack.some(k => text.includes(k))) return 'attack';
    if (vocab.skills.opponent_error.some(k => text.includes(k))) return 'opponent_error';
    return undefined;
  }

  // -------------------------------------------------------------------------
  // RESOLUÇÃO DE TIME — Busca nome do time DENTRO da frase
  // Suporta: match exato de substring, tokens com fuzzy, e keywords genéricas
  // -------------------------------------------------------------------------

  private static resolveTeamFromText(
    text: string,
    teamAName: string,
    teamBName: string,
    vocab: typeof VOCABULARY['pt'],
  ): { team: TeamId; confidence: number } | null {

    const safeNameA = this.normalizeTeamName(teamAName);
    const safeNameB = this.normalizeTeamName(teamBName);

    // 1. EXACT SUBSTRING — "ponto time 3" contém "time 3"
    if (safeNameA.length > 1 && text.includes(safeNameA)) return { team: 'A', confidence: 0.95 };
    if (safeNameB.length > 1 && text.includes(safeNameB)) return { team: 'B', confidence: 0.95 };

    // 2. STRICT KEYWORDS — "time a", "equipe b", "mandante", "visitante"
    if (vocab.teamA_Strict.some(k => text.includes(k))) return { team: 'A', confidence: 0.9 };
    if (vocab.teamB_Strict.some(k => text.includes(k))) return { team: 'B', confidence: 0.9 };

    // 3. SIDES — "esquerda", "direita", "left", "right"
    if (vocab.teamA_Sides.some(k => text.includes(k))) return { team: 'A', confidence: 0.85 };
    if (vocab.teamB_Sides.some(k => text.includes(k))) return { team: 'B', confidence: 0.85 };

    // 4. FUZZY MATCH — Para nomes de time com mais de 2 chars, tentar fuzzy por tokens
    if (safeNameA.length > 2) {
      const nameTokens = safeNameA.split(' ');
      const textTokens = text.split(' ');
      // Tenta extrair uma janela de tokens do tamanho do nome do time
      for (let i = 0; i <= textTokens.length - nameTokens.length; i++) {
        const candidate = textTokens.slice(i, i + nameTokens.length).join(' ');
        if (isFuzzyMatch(candidate, safeNameA)) return { team: 'A', confidence: 0.85 };
      }
      // Single-token fuzzy (para nomes de 1 palavra como "Flamengo")
      if (nameTokens.length === 1) {
        for (const token of textTokens) {
          if (token.length >= 3 && isFuzzyMatch(token, safeNameA)) return { team: 'A', confidence: 0.85 };
        }
      }
    }

    if (safeNameB.length > 2) {
      const nameTokens = safeNameB.split(' ');
      const textTokens = text.split(' ');
      for (let i = 0; i <= textTokens.length - nameTokens.length; i++) {
        const candidate = textTokens.slice(i, i + nameTokens.length).join(' ');
        if (isFuzzyMatch(candidate, safeNameB)) return { team: 'B', confidence: 0.85 };
      }
      if (nameTokens.length === 1) {
        for (const token of textTokens) {
          if (token.length >= 3 && isFuzzyMatch(token, safeNameB)) return { team: 'B', confidence: 0.85 };
        }
      }
    }

    // 5. GENERIC FALLBACKS — "ponto a" / "point a" / "ponto b" / "point b"
    if (text.includes('ponto a') || text.includes('point a')) return { team: 'A', confidence: 0.9 };
    if (text.includes('ponto b') || text.includes('point b')) return { team: 'B', confidence: 0.9 };

    return null;
  }

  // -------------------------------------------------------------------------
  // RESOLUÇÃO DE JOGADOR — Busca jogadores por nome, número, fuzzy
  // -------------------------------------------------------------------------

  private static resolvePlayer(
    text: string,
    playersA: Player[],
    playersB: Player[],
    vocab: typeof VOCABULARY['pt'],
  ): { player: Player; team: TeamId; confidence: number } | { isAmbiguous: true; candidates: string[] } | null {

    const cleanText = this.removePrepositions(text, vocab);

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

      // C. Starts With (70) — "Ana" match com "Ana Paula"
      if (playerNameNormalized.startsWith(cleanText + ' ')) {
        matches.push({ p, t, score: 70 });
        continue;
      }

      // D. Contains — nome contido no texto ou texto contém nome (50)
      if (playerNameNormalized.includes(cleanText) || cleanText.includes(playerNameNormalized)) {
        matches.push({ p, t, score: 50 });
        continue;
      }

      // E. Token match — algum token do texto match com algum token do nome (45)
      const playerTokens = playerNameNormalized.split(' ');
      const inputTokens = cleanText.split(' ');
      const hasTokenMatch = inputTokens.some(inputToken =>
        inputToken.length >= 3 &&
        playerTokens.some(nameToken => nameToken === inputToken)
      );
      if (hasTokenMatch) {
        matches.push({ p, t, score: 45 });
        continue;
      }

      // F. Fuzzy match via Levenshtein (30)
      const hasFuzzyMatch = inputTokens.some(inputToken =>
        inputToken.length >= 4 &&
        playerTokens.some(nameToken => nameToken.length >= 4 && isFuzzyMatch(inputToken, nameToken))
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
        };
      }

      return { player: topMatch.p, team: topMatch.t, confidence: topMatch.score / 100 };
    }

    return null;
  }

  // -------------------------------------------------------------------------
  // RESOLUÇÃO COMBINADA — Time + Jogador
  // Prioridade: Team Name > Strict Keywords > Sides > Players > Fuzzy Team
  // -------------------------------------------------------------------------

  private static resolveEntity(
    text: string,
    playersA: Player[],
    playersB: Player[],
    teamAName: string,
    teamBName: string,
    vocab: typeof VOCABULARY['pt'],
  ): { player?: Player; team?: TeamId; confidence: number; isAmbiguous?: boolean; candidates?: string[] } | null {

    // Rejeitar "a" / "b" soltos (falso-positivo)
    const words = text.split(' ');
    if (words.length === 1 && (words[0] === 'a' || words[0] === 'b')) return null;

    // 1. Tentar resolver time pelo nome/keywords
    const teamResult = this.resolveTeamFromText(text, teamAName, teamBName, vocab);

    // 2. Tentar resolver jogador
    const playerResult = this.resolvePlayer(text, playersA, playersB, vocab);

    // Se ambos resolvidos
    if (teamResult && playerResult && !('isAmbiguous' in playerResult)) {
      return {
        player: playerResult.player,
        team: teamResult.team,
        confidence: Math.max(teamResult.confidence, playerResult.confidence),
      };
    }

    // Se só player (e não ambíguo)
    if (playerResult && !('isAmbiguous' in playerResult)) {
      return {
        player: playerResult.player,
        team: playerResult.team,
        confidence: playerResult.confidence,
      };
    }

    // Se ambíguo
    if (playerResult && 'isAmbiguous' in playerResult) {
      // Se temos time, filtrar candidatos do mesmo time
      if (teamResult) {
        const players = teamResult.team === 'A' ? playersA : playersB;
        const filtered = playerResult.candidates.filter(c => players.some(p => p.name === c));
        if (filtered.length === 1) {
          const player = players.find(p => p.name === filtered[0])!;
          return { player, team: teamResult.team, confidence: 0.8 };
        }
      }
      return {
        isAmbiguous: true,
        candidates: playerResult.candidates,
        confidence: 0,
      };
    }

    // Se só time
    if (teamResult) {
      return { team: teamResult.team, confidence: teamResult.confidence };
    }

    return null;
  }

  // -------------------------------------------------------------------------
  // INFERÊNCIA POR CONTEXTO
  // 7 regras para preencher lacunas quando o time não foi identificado
  // -------------------------------------------------------------------------

  private static resolveByContext(
    detectedSkill: SkillType | undefined,
    isNegative: boolean,
    isPointTrigger: boolean,
    context: VoiceContext,
  ): TeamId | null {

    if (context.isMatchOver) return null;

    // REGRA 1 — Ace → servingTeam
    if (detectedSkill === 'ace' && context.servingTeam) {
      return context.servingTeam;
    }

    // REGRA 2 — Erro → oposto ao servidor
    if (detectedSkill === 'opponent_error') {
      if (context.servingTeam) {
        return context.servingTeam === 'A' ? 'B' : 'A';
      }
      if (context.lastScorerTeam) {
        return context.lastScorerTeam === 'A' ? 'B' : 'A';
      }
    }

    // REGRA 3 — Bloqueio → oposto ao servidor
    if (detectedSkill === 'block' && context.servingTeam) {
      return context.servingTeam === 'A' ? 'B' : 'A';
    }

    // REGRA 4 — "Ponto!" sem time → lastScorerTeam (continuidade)
    if (isPointTrigger && !detectedSkill && context.lastScorerTeam) {
      return context.lastScorerTeam;
    }

    // REGRA 5 — Ataque sem time → servidor
    if (detectedSkill === 'attack' && context.servingTeam) {
      return context.servingTeam;
    }

    // REGRA 6 — Negativo sem time → lastScorerTeam
    if (isNegative && context.lastScorerTeam) {
      return context.lastScorerTeam;
    }

    return null; // REGRA 7: sem inferência
  }

  // -------------------------------------------------------------------------
  // PARSE — Ponto de entrada principal
  // -------------------------------------------------------------------------

  public static parse(
    rawText: string,
    language: string,
    context: VoiceContext,
  ): VoiceCommandIntent {

    // Bloquear pós-partida
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

    // --- 1. DESFAZER (máxima prioridade) ---
    if (vocab.globalUndo.some(k => text.includes(k))) {
      return { type: 'undo', confidence: 1, rawText, debugMessage: 'Global Undo' };
    }

    // --- 2. Extrair componentes ---
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
    const isSwap = vocab.swap.some(k => text.includes(k));

    const hasServerKeyword = vocab.server.some(k => text.includes(k));
    const hasPointAceIndicator = vocab.pointAceIndicators.some(k => text.includes(k));
    const isExplicitServerChange = hasServerKeyword && !hasPointAceIndicator && !detectedSkill;

    // --- 3. SWAP / TROCA DE LADOS (antes de timeout para não confundir) ---
    if (isSwap && !isTimeout && !isPointTrigger) {
      return { type: 'swap', confidence: 1, rawText, debugMessage: 'Swap Sides' };
    }

    // --- 4. TIMEOUT ---
    if (isTimeout) {
      const team = entity?.team ?? this.resolveByContext(undefined, false, false, context);
      if (team) return { type: 'timeout', team, confidence: 1, rawText, debugMessage: `Timeout Team ${team}` };
      // Timeout sem time identificado — retornar com requiresMoreInfo
      return { type: 'timeout', confidence: 0.5, rawText, requiresMoreInfo: true, debugMessage: 'Timeout — team not identified' };
    }

    // --- 5. TROCA DE SAQUE (server change) ---
    if (isExplicitServerChange) {
      if (entity?.team) {
        return { type: 'server', team: entity.team, confidence: 1, rawText, debugMessage: `Server: Team ${entity.team}` };
      }
      if (context.servingTeam) {
        const nextServer = context.servingTeam === 'A' ? 'B' : 'A';
        return { type: 'server', team: nextServer, confidence: 0.8, rawText, debugMessage: `Side-out → Team ${nextServer}` };
      }
      return { type: 'server', confidence: 0.5, rawText, requiresMoreInfo: true, debugMessage: 'Server ambíguo' };
    }

    // --- 6. PONTO / SKILL ---
    const hasTeamOrPlayer = entity?.team || entity?.player;
    const hasAnyIndicator = detectedSkill || isPointTrigger || hasTeamOrPlayer;

    if (hasAnyIndicator) {
      let targetTeam = entity?.team;

      // Player sem time → derivar do player
      if (!targetTeam && entity?.player) {
        const playerInA = context.playersA.some(p => p.id === entity.player!.id);
        targetTeam = playerInA ? 'A' : 'B';
      }

      // Sem team → inferência contextual
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

        // statsEnabled + skill sem jogador → aguardar player
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

    // --- 7. Skill órfã ---
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
