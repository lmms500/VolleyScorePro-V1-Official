import { describe, it, expect } from 'vitest';
import { VoiceCommandParser } from '../VoiceCommandParser';
import type { VoiceContext } from '../VoiceCommandParser';
import type { Player } from '@types';

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
// COMANDOS BÁSICOS
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

// -------------------------------------------------------------------------
// NOMES DE TIME DINÂMICOS (extraídos da frase)
// -------------------------------------------------------------------------

describe('VoiceCommandParser — Team Name Dinâmico', () => {

  it('deve reconhecer "ponto Time 3" com time chamado "Time 3"', () => {
    const result = parse('ponto Time 3', { teamAName: 'Time 3', teamBName: 'Time 7' });
    expect(result.type).toBe('point');
    expect(result.team).toBe('A');
  });

  it('deve reconhecer "ponto do Time 7" com time chamado "Time 7"', () => {
    const result = parse('ponto do Time 7', { teamAName: 'Time 3', teamBName: 'Time 7' });
    expect(result.type).toBe('point');
    expect(result.team).toBe('B');
  });

  it('deve reconhecer "ponto para o Time 3" com preposições', () => {
    const result = parse('ponto para o Time 3', { teamAName: 'Time 3', teamBName: 'Time 5' });
    expect(result.type).toBe('point');
    expect(result.team).toBe('A');
  });

  it('deve reconhecer "bloqueio Time 3" como ponto + skill + team', () => {
    const result = parse('bloqueio Time 3', { teamAName: 'Time 3', teamBName: 'Time 5', statsEnabled: false });
    expect(result.type).toBe('point');
    expect(result.team).toBe('A');
    expect(result.skill).toBe('block');
  });

  it('deve reconhecer "ponto de bloqueio Time 3" como ponto + skill + team', () => {
    const result = parse('ponto de bloqueio Time 3', { teamAName: 'Time 3', teamBName: 'Time 5', statsEnabled: false });
    expect(result.type).toBe('point');
    expect(result.team).toBe('A');
    expect(result.skill).toBe('block');
  });

  it('deve reconhecer time com nome longo "Escola de Vôlei Santos"', () => {
    const result = parse('ponto Escola de Vôlei Santos', { teamAName: 'Escola de Vôlei Santos', teamBName: 'Club Praia' });
    expect(result.type).toBe('point');
    expect(result.team).toBe('A');
  });

  it('deve reconhecer time com erro de transcrição (fuzzy)', () => {
    const result = parse('ponto do Flamengoo', { statsEnabled: false });
    expect(result.type).toBe('point');
    expect(result.team).toBe('A');
  });

  it('deve reconhecer time numérico em timeout', () => {
    const result = parse('timeout Time 3', { teamAName: 'Time 3', teamBName: 'Time 7' });
    expect(result.type).toBe('timeout');
    expect(result.team).toBe('A');
  });

  it('deve reconhecer time numérico em timeout (time B)', () => {
    const result = parse('timeout Time 7', { teamAName: 'Time 3', teamBName: 'Time 7' });
    expect(result.type).toBe('timeout');
    expect(result.team).toBe('B');
  });

});

// -------------------------------------------------------------------------
// LADOS (Esquerda/Direita)
// -------------------------------------------------------------------------

describe('VoiceCommandParser — Lados (Esquerda/Direita)', () => {

  it('deve reconhecer "esquerda" como Time A', () => {
    const result = parse('ponto esquerda');
    expect(result.type).toBe('point');
    expect(result.team).toBe('A');
  });

  it('deve reconhecer "direita" como Time B', () => {
    const result = parse('ponto direita');
    expect(result.type).toBe('point');
    expect(result.team).toBe('B');
  });

  it('deve reconhecer "lado esquerdo" como Time A', () => {
    const result = parse('lado esquerdo ponto');
    expect(result.type).toBe('point');
    expect(result.team).toBe('A');
  });

  it('deve reconhecer "lado direito" como Time B', () => {
    const result = parse('lado direito ponto');
    expect(result.type).toBe('point');
    expect(result.team).toBe('B');
  });

});

// -------------------------------------------------------------------------
// SWAP / TROCA DE LADOS
// -------------------------------------------------------------------------

describe('VoiceCommandParser — Swap de Lados', () => {

  it('deve reconhecer "trocar lados"', () => {
    const result = parse('trocar lados');
    expect(result.type).toBe('swap');
    expect(result.confidence).toBe(1);
  });

  it('deve reconhecer "trocar de lado"', () => {
    const result = parse('trocar de lado');
    expect(result.type).toBe('swap');
  });

  it('deve reconhecer "inverter"', () => {
    const result = parse('inverter');
    expect(result.type).toBe('swap');
  });

  it('deve reconhecer "mudar lados"', () => {
    const result = parse('mudar lados');
    expect(result.type).toBe('swap');
  });

  it('deve reconhecer "virar lado"', () => {
    const result = parse('virar lado');
    expect(result.type).toBe('swap');
  });

  it('deve reconhecer "swap sides" em inglês', () => {
    const result = parse('swap sides', {}, 'en');
    expect(result.type).toBe('swap');
  });

  it('deve reconhecer "switch sides" em inglês', () => {
    const result = parse('switch sides', {}, 'en');
    expect(result.type).toBe('swap');
  });

  it('deve reconhecer "cambiar lados" em espanhol', () => {
    const result = parse('cambiar lados', {}, 'es');
    expect(result.type).toBe('swap');
  });

});

// -------------------------------------------------------------------------
// INFERÊNCIA CONTEXTUAL
// -------------------------------------------------------------------------

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
    expect(result.team).toBe('A');
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

// -------------------------------------------------------------------------
// JOGADOR + SKILL
// -------------------------------------------------------------------------

describe('VoiceCommandParser — Jogador + Skill', () => {

  it('deve reconhecer "João ataque" — jogador + skill', () => {
    const result = parse('João ataque', { statsEnabled: false });
    expect(result.type).toBe('point');
    expect(result.team).toBe('A');
    expect(result.player?.name).toBe('João Silva');
    expect(result.skill).toBe('attack');
  });

  it('deve reconhecer "Ana Paula bloqueio" — jogadora + skill', () => {
    const result = parse('Ana Paula bloqueio', { statsEnabled: false });
    expect(result.type).toBe('point');
    expect(result.team).toBe('B');
    expect(result.player?.name).toBe('Ana Paula');
    expect(result.skill).toBe('block');
  });

  it('deve reconhecer "Carlos ace" — jogador + skill', () => {
    const result = parse('Carlos ace', { statsEnabled: false });
    expect(result.type).toBe('point');
    expect(result.team).toBe('A');
    expect(result.player?.name).toBe('Carlos Lima');
    expect(result.skill).toBe('ace');
  });

  it('deve reconhecer "Beatriz erro" — jogadora + skill', () => {
    const result = parse('Beatriz erro', { statsEnabled: false });
    expect(result.type).toBe('point');
    expect(result.team).toBe('B');
    expect(result.player?.name).toBe('Beatriz Souza');
    expect(result.skill).toBe('opponent_error');
  });

});

// -------------------------------------------------------------------------
// TIME + SKILL
// -------------------------------------------------------------------------

describe('VoiceCommandParser — Time + Skill', () => {

  it('deve reconhecer "time A ataque"', () => {
    const result = parse('time A ataque', { statsEnabled: false });
    expect(result.type).toBe('point');
    expect(result.team).toBe('A');
    expect(result.skill).toBe('attack');
  });

  it('deve reconhecer "time B bloqueio"', () => {
    const result = parse('time B bloqueio', { statsEnabled: false });
    expect(result.type).toBe('point');
    expect(result.team).toBe('B');
    expect(result.skill).toBe('block');
  });

  it('deve reconhecer "ponto de ataque time A"', () => {
    const result = parse('ponto de ataque time A', { statsEnabled: false });
    expect(result.type).toBe('point');
    expect(result.team).toBe('A');
    expect(result.skill).toBe('attack');
  });

  it('deve reconhecer "ponto de bloqueio time B"', () => {
    const result = parse('ponto de bloqueio time B', { statsEnabled: false });
    expect(result.type).toBe('point');
    expect(result.team).toBe('B');
    expect(result.skill).toBe('block');
  });

  it('deve reconhecer "esquerda ataque"', () => {
    const result = parse('esquerda ataque', { statsEnabled: false });
    expect(result.type).toBe('point');
    expect(result.team).toBe('A');
    expect(result.skill).toBe('attack');
  });

  it('deve reconhecer "direita bloqueio"', () => {
    const result = parse('direita bloqueio', { statsEnabled: false });
    expect(result.type).toBe('point');
    expect(result.team).toBe('B');
    expect(result.skill).toBe('block');
  });

  it('deve reconhecer "ponto de bloqueio Flamengo"', () => {
    const result = parse('ponto de bloqueio Flamengo', { statsEnabled: false });
    expect(result.type).toBe('point');
    expect(result.team).toBe('A');
    expect(result.skill).toBe('block');
  });

  it('deve reconhecer "ponto de ataque Botafogo"', () => {
    const result = parse('ponto de ataque Botafogo', { statsEnabled: false });
    expect(result.type).toBe('point');
    expect(result.team).toBe('B');
    expect(result.skill).toBe('attack');
  });

});

// -------------------------------------------------------------------------
// TIMEOUT
// -------------------------------------------------------------------------

describe('VoiceCommandParser — Timeout', () => {

  it('deve reconhecer "timeout Flamengo"', () => {
    const result = parse('timeout Flamengo');
    expect(result.type).toBe('timeout');
    expect(result.team).toBe('A');
  });

  it('deve reconhecer "timeout Botafogo"', () => {
    const result = parse('timeout Botafogo');
    expect(result.type).toBe('timeout');
    expect(result.team).toBe('B');
  });

  it('deve reconhecer "pausa time A"', () => {
    const result = parse('pausa time A');
    expect(result.type).toBe('timeout');
    expect(result.team).toBe('A');
  });

  it('deve reconhecer "timeout time B"', () => {
    const result = parse('timeout time B');
    expect(result.type).toBe('timeout');
    expect(result.team).toBe('B');
  });

  it('deve reconhecer timeout com variante fonética', () => {
    const result = parse('taimaute do Flamengo');
    expect(result.type).toBe('timeout');
    expect(result.team).toBe('A');
  });

  it('deve reconhecer "pedido de tempo Botafogo"', () => {
    const result = parse('pedido de tempo Botafogo');
    expect(result.type).toBe('timeout');
    expect(result.team).toBe('B');
  });

  it('deve reconhecer "timeout" em inglês com time', () => {
    const result = parse('timeout team a', {}, 'en');
    expect(result.type).toBe('timeout');
    expect(result.team).toBe('A');
  });

});

// -------------------------------------------------------------------------
// FUZZY MATCHING
// -------------------------------------------------------------------------

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
    const result = parse('ponto do Flamengoo', { statsEnabled: false });
    expect(result.type).toBe('point');
    expect(result.team).toBe('A');
  });

});

// -------------------------------------------------------------------------
// DESAMBIGUAÇÃO SAQUE VS ACE
// -------------------------------------------------------------------------

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

// -------------------------------------------------------------------------
// NORMALIZAÇÃO
// -------------------------------------------------------------------------

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

  it('deve converter números por extenso', () => {
    const result = parse('ponto camisa três', { statsEnabled: false });
    expect(result.type).toBe('point');
    expect(result.player?.name).toBe('Ana Paula');
  });

});

// -------------------------------------------------------------------------
// INGLÊS
// -------------------------------------------------------------------------

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

  it('deve reconhecer "left attack" como Time A + skill', () => {
    const result = parse('left attack', { statsEnabled: false }, 'en');
    expect(result.type).toBe('point');
    expect(result.team).toBe('A');
    expect(result.skill).toBe('attack');
  });

  it('deve reconhecer "right block" como Time B + skill', () => {
    const result = parse('right block', { statsEnabled: false }, 'en');
    expect(result.type).toBe('point');
    expect(result.team).toBe('B');
    expect(result.skill).toBe('block');
  });

  it('deve reconhecer "point Flamengo" com nome do time em inglês', () => {
    const result = parse('point Flamengo', { statsEnabled: false }, 'en');
    expect(result.type).toBe('point');
    expect(result.team).toBe('A');
  });

});

// -------------------------------------------------------------------------
// CASOS COMPLEXOS
// -------------------------------------------------------------------------

describe('VoiceCommandParser — Casos Complexos', () => {

  it('deve reconhecer "João ponto de ataque"', () => {
    const result = parse('João ponto de ataque', { statsEnabled: false });
    expect(result.type).toBe('point');
    expect(result.team).toBe('A');
    expect(result.player?.name).toBe('João Silva');
    expect(result.skill).toBe('attack');
  });

  it('deve reconhecer "time da casa bloqueio"', () => {
    const result = parse('time da casa bloqueio', { statsEnabled: false });
    expect(result.type).toBe('point');
    expect(result.team).toBe('A');
    expect(result.skill).toBe('block');
  });

  it('deve reconhecer "visitante ponto de erro"', () => {
    const result = parse('visitante ponto de erro', { statsEnabled: false });
    expect(result.type).toBe('point');
    expect(result.team).toBe('B');
    expect(result.skill).toBe('opponent_error');
  });

  it('deve reconhecer "ponto de bloqueio do Time 3" com time numérico', () => {
    const result = parse('ponto de bloqueio do Time 3', { teamAName: 'Time 3', teamBName: 'Time 5', statsEnabled: false });
    expect(result.type).toBe('point');
    expect(result.team).toBe('A');
    expect(result.skill).toBe('block');
  });

  it('deve reconhecer "ace do Time 7"', () => {
    const result = parse('ace do Time 7', { teamAName: 'Time 3', teamBName: 'Time 7', statsEnabled: false });
    expect(result.type).toBe('point');
    expect(result.team).toBe('B');
    expect(result.skill).toBe('ace');
  });

  it('deve reconhecer "ponto de ataque do Time 5"', () => {
    const result = parse('ponto de ataque do Time 5', { teamAName: 'Time 3', teamBName: 'Time 5', statsEnabled: false });
    expect(result.type).toBe('point');
    expect(result.team).toBe('B');
    expect(result.skill).toBe('attack');
  });

  it('deve reconhecer "mais um ponto para o Flamengo"', () => {
    const result = parse('mais um ponto para o Flamengo');
    expect(result.type).toBe('point');
    expect(result.team).toBe('A');
  });

});
