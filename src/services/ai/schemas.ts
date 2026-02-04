
import { Type } from "@google/genai";

/**
 * Shared Schema Definitions for Gemini API
 * Centralizes the contract between the AI model and the application logic.
 */

export const VOICE_COMMAND_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    type: { 
      type: Type.STRING, 
      description: "Tipo do comando: 'point', 'timeout', 'server', 'undo', 'unknown'" 
    },
    team: { 
      type: Type.STRING, 
      description: "ID do time: 'A' ou 'B'." 
    },
    playerId: { 
      type: Type.STRING, 
      description: "UUID do jogador. 'unknown' se não encontrado." 
    },
    skill: { 
      type: Type.STRING, 
      description: "Habilidade: 'attack', 'block', 'ace', 'opponent_error', 'generic'" 
    },
    isNegative: { 
      type: Type.BOOLEAN, 
      description: "True se for correção/remover ponto." 
    }
  },
  required: ["type", "isNegative"]
};

export const MATCH_ANALYSIS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    tacticalSummary: { type: Type.STRING, description: "Resumo tático profundo e profissional, focado em K1 (Side-out) e K2 (Break points)." },
    clutchMoment: { type: Type.STRING, description: "O momento chave (turnaround) onde a partida foi decidida psicologicamente." },
    momentumAnalysis: { type: Type.STRING, description: "Análise do fluxo de pontuação (runs de pontos) e consistência." },
    performanceTips: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "3 correções táticas específicas (ex: 'Ajustar bloqueio na saída de rede', 'Melhorar cobertura de largada')."
    },
    teamEfficiency: {
      type: Type.OBJECT,
      properties: {
        attack: { type: Type.NUMBER, description: "Nota 0-10 baseada em kills/erros" },
        defense: { type: Type.NUMBER, description: "Nota 0-10 baseada em blocks/digs implícitos" },
        consistency: { type: Type.NUMBER, description: "Nota 0-10 baseada em erros não forçados" }
      },
      required: ["attack", "defense", "consistency"]
    },
    futurePrediction: { type: Type.STRING, description: "Projeção estratégica para um próximo confronto entre estas equipes." }
  },
  required: ["tacticalSummary", "clutchMoment", "momentumAnalysis", "performanceTips", "teamEfficiency", "futurePrediction"]
};
