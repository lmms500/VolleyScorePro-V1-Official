
/**
 * Shared Schema Definitions for Gemini API
 * Centralizes the contract between the AI model and the application logic.
 *
 * Note: Using JSON Schema string literals instead of Type enum to enable tree-shaking
 * and lazy loading of @google/genai SDK (~40KB saved from initial bundle)
 */

export const VOICE_COMMAND_SCHEMA = {
  type: 'object' as const,
  properties: {
    type: {
      type: 'string' as const,
      description: "Tipo do comando: 'point', 'timeout', 'server', 'undo', 'unknown'"
    },
    team: {
      type: 'string' as const,
      description: "ID do time: 'A' ou 'B'."
    },
    playerId: {
      type: 'string' as const,
      description: "UUID do jogador. 'unknown' se não encontrado."
    },
    skill: {
      type: 'string' as const,
      description: "Habilidade: 'attack', 'block', 'ace', 'opponent_error', 'generic'"
    },
    isNegative: {
      type: 'boolean' as const,
      description: "True se for correção/remover ponto."
    }
  },
  required: ["type", "isNegative"]
};

export const MATCH_ANALYSIS_SCHEMA = {
  type: 'object' as const,
  properties: {
    tacticalSummary: { type: 'string' as const, description: "Resumo tático profundo e profissional, focado em K1 (Side-out) e K2 (Break points)." },
    clutchMoment: { type: 'string' as const, description: "O momento chave (turnaround) onde a partida foi decidida psicologicamente." },
    momentumAnalysis: { type: 'string' as const, description: "Análise do fluxo de pontuação (runs de pontos) e consistência." },
    performanceTips: {
      type: 'array' as const,
      items: { type: 'string' as const },
      description: "3 correções táticas específicas (ex: 'Ajustar bloqueio na saída de rede', 'Melhorar cobertura de largada')."
    },
    teamEfficiency: {
      type: 'object' as const,
      properties: {
        attack: { type: 'number' as const, description: "Nota 0-10 baseada em kills/erros" },
        defense: { type: 'number' as const, description: "Nota 0-10 baseada em blocks/digs implícitos" },
        consistency: { type: 'number' as const, description: "Nota 0-10 baseada em erros não forçados" }
      },
      required: ["attack", "defense", "consistency"]
    },
    futurePrediction: { type: 'string' as const, description: "Projeção estratégica para um próximo confronto entre estas equipes." }
  },
  required: ["tacticalSummary", "clutchMoment", "momentumAnalysis", "performanceTips", "teamEfficiency", "futurePrediction"]
};
