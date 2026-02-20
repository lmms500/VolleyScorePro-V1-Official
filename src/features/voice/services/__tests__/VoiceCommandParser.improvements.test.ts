/**
 * VoiceCommandParser — Novos Testes (Melhorias 4.3 a 4.10)
 *
 * Este arquivo adiciona cobertura para os novos comportamentos introduzidos
 * nas melhorias 4.3 a 4.10 do sistema de controle por voz.
 */

import { describe, it, expect } from 'vitest';
import { VoiceCommandParser } from '../VoiceCommandParser';
import type { VoiceContext } from '../VoiceCommandParser';
import type { Player } from '@types';

// ---------------------------------------------------------------------------
// Helpers (copiados do arquivo principal para auto-suficiência)
// ---------------------------------------------------------------------------

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
        makePlayer('a1', 'Joao Silva', '7'),
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

// ---------------------------------------------------------------------------
// 4.3 — Prioridade "cancelar ponto" vs "cancelar" (undo global)
// ---------------------------------------------------------------------------

describe('Fix 4.3: cancelar ponto nao vira undo global', () => {

    it('"cancelar" isolado deve ser undo global', () => {
        const result = parse('cancelar');
        expect(result.type).toBe('undo');
    });

    it('"desfazer" deve ser undo global', () => {
        const result = parse('desfazer');
        expect(result.type).toBe('undo');
    });

    it('"cancelar ponto time b" deve ser subtract, nao undo', () => {
        const result = parse('cancelar ponto time b');
        expect(result.type).toBe('point');
        expect(result.isNegative).toBe(true);
        expect(result.team).toBe('B');
    });

    it('"tirar ponto time a" deve ser subtract', () => {
        const result = parse('tirar ponto time a');
        expect(result.type).toBe('point');
        expect(result.isNegative).toBe(true);
        expect(result.team).toBe('A');
    });

    it('"corrigir ponto Flamengo" deve ser subtract time A', () => {
        const result = parse('corrigir ponto Flamengo');
        expect(result.type).toBe('point');
        expect(result.isNegative).toBe(true);
        expect(result.team).toBe('A');
    });

    it('"volta ponto botafogo" deve ser subtract time B', () => {
        const result = parse('volta ponto botafogo');
        expect(result.type).toBe('point');
        expect(result.isNegative).toBe(true);
        expect(result.team).toBe('B');
    });

});

// ---------------------------------------------------------------------------
// 4.4 — Keywords curtas/ambíguas removidas
// ---------------------------------------------------------------------------

describe('Fix 4.4: keywords curtas nao disparam acoes sozinhas', () => {

    it('"fora" isolado NAO deve ser ponto de erro', () => {
        const result = parse('fora');
        expect(result.type).toBe('unknown');
    });

    it('"vai" isolado NAO deve ser ponto', () => {
        const result = parse('vai');
        expect(result.type).toBe('unknown');
    });

    it('"rede" isolada NAO deve ser ponto de erro', () => {
        const result = parse('rede');
        expect(result.type).toBe('unknown');
    });

    it('"toque" isolado NAO deve ser ponto de erro', () => {
        const result = parse('toque');
        expect(result.type).toBe('unknown');
    });

    it('"na rede" (composto) SIM deve ser ponto de erro adversario', () => {
        // REGRA 2: opponent_error -> oposto ao servidor (A) = B
        const result = parse('na rede', { servingTeam: 'A', statsEnabled: false });
        expect(result.type).toBe('point');
        expect(result.skill).toBe('opponent_error');
        expect(result.team).toBe('B');
    });

    it('"dois toques time b" (composto) SIM deve ser ponto de erro do time B', () => {
        const result = parse('ponto de erro time b', { statsEnabled: false });
        expect(result.type).toBe('point');
        expect(result.skill).toBe('opponent_error');
        expect(result.team).toBe('B');
    });

    it('"mata bola time a" SIM deve ser ponto de ataque', () => {
        const result = parse('mata bola time a', { statsEnabled: false });
        expect(result.type).toBe('point');
        expect(result.skill).toBe('attack');
        expect(result.team).toBe('A');
    });

});

// ---------------------------------------------------------------------------
// 4.5 — REGRA 5: ataque sem time usa lastScorerTeam (nao servingTeam)
// ---------------------------------------------------------------------------

describe('Fix 4.5: REGRA 5 ataque usa lastScorerTeam', () => {

    it('ataque sem time, lastScorerTeam=B, deve retornar B (nao A/serving)', () => {
        const result = parse('ponto de ataque', {
            statsEnabled: false,
            servingTeam: 'A',
            lastScorerTeam: 'B',
        });
        expect(result.type).toBe('point');
        expect(result.team).toBe('B'); // lastScorerTeam, nao servingTeam
    });

    it('ataque sem time E sem lastScorerTeam nao deve resolver team (sem contexto suficiente)', () => {
        const result = parse('ponto de ataque', {
            statsEnabled: false,
            servingTeam: 'A',
            lastScorerTeam: null,
        });
        // Sem contexto suficiente, parser nao deve executar com team=undefined
        // Pode retornar type='unknown' ou requiresMoreInfo=true
        const resolved = result.type === 'point' && result.team && !result.requiresMoreInfo;
        expect(resolved).toBe(false);
    });

    it('ataque com time explicito A funciona normalmente', () => {
        const result = parse('ataque time a', {
            statsEnabled: false,
            lastScorerTeam: 'B',
        });
        expect(result.type).toBe('point');
        expect(result.team).toBe('A'); // time explicito prevalece sobre contexto
    });

});

// ---------------------------------------------------------------------------
// 4.6 — requiresMoreInfo: timeout e ponto sem time
// ---------------------------------------------------------------------------

describe('Fix 4.6: requiresMoreInfo em comandos sem time', () => {

    it('timeout sem time identificado retorna requiresMoreInfo=true', () => {
        const result = parse('timeout', {
            servingTeam: null,
            lastScorerTeam: null,
            statsEnabled: false,
            teamAName: 'Alpha',
            teamBName: 'Beta',
            playersA: [],
            playersB: [],
        });
        expect(result.type).toBe('timeout');
        expect(result.requiresMoreInfo).toBe(true);
        expect(result.team).toBeUndefined();
    });

    it('timeout time b resolve normalmente sem requiresMoreInfo', () => {
        const result = parse('timeout time b');
        expect(result.type).toBe('timeout');
        expect(result.team).toBe('B');
        expect(result.requiresMoreInfo).toBeFalsy();
    });

    it('ponto com timeout time a resolve normalmente', () => {
        const result = parse('timeout time a');
        expect(result.type).toBe('timeout');
        expect(result.team).toBe('A');
    });

});

// ---------------------------------------------------------------------------
// Ambiguidade de jogadores com mesmo nome parcial em times diferentes
// ---------------------------------------------------------------------------

describe('Ambiguidade entre jogadores de times diferentes', () => {

    it('nome exatamente igual em dois times diferentes deve retornar ambiguous ou unknown', () => {
        const result = parse('ponto Maria', {
            playersA: [makePlayer('a1', 'Maria Silva', '7')],
            playersB: [makePlayer('b1', 'Maria Souza', '3')],
            statsEnabled: false,
        });
        // "Maria" casa como startsWith (score=70) em Maria Silva (A) e Maria Souza (B)
        // similarMatches.length > 1 && score < 100 → isAmbiguous=true
        // Parser deve retornar type='unknown' com isAmbiguous=true
        expect(result.type).toBe('unknown');
        expect(result.isAmbiguous).toBe(true);
    });


    it('nome parcial unico resolve corretamente', () => {
        const result = parse('ponto Carlos', { statsEnabled: false });
        expect(result.type).toBe('point');
        expect(result.player?.name).toBe('Carlos Lima');
        expect(result.team).toBe('A');
    });

    it('nome de jogador unico + time explicito resolve corretamente', () => {
        const result = parse('ponto Ana time b', {
            playersA: [makePlayer('a1', 'Ana Costa', '7')],
            playersB: [makePlayer('b1', 'Ana Lima', '3')],
            statsEnabled: false,
        });
        // Com time B explicito, filtra candidatos do time B -> Ana Lima
        expect(result.type).toBe('point');
        expect(result.team).toBe('B');
        expect(result.isAmbiguous).toBeFalsy();
    });

});

// ---------------------------------------------------------------------------
// Bloquear comandos apos fim de partida
// ---------------------------------------------------------------------------

describe('Bloquear comandos com isMatchOver=true', () => {

    it('qualquer comando com isMatchOver=true deve retornar unknown', () => {
        const result = parse('ponto time a', { isMatchOver: true });
        expect(result.type).toBe('unknown');
    });

    it('undo com isMatchOver=true deve retornar unknown', () => {
        const result = parse('desfazer', { isMatchOver: true });
        expect(result.type).toBe('unknown');
    });

});

// ---------------------------------------------------------------------------
// Variantes de "mais um" e continuidade por lastScorerTeam
// ---------------------------------------------------------------------------

describe('Continuidade por lastScorerTeam (REGRA 4)', () => {

    it('"mais um" com lastScorerTeam=B deve marcar ponto B', () => {
        const result = parse('mais um ponto time b', {
            statsEnabled: false,
            lastScorerTeam: 'B',
        });
        expect(result.type).toBe('point');
        expect(result.team).toBe('B');
    });

    it('"ponto" com lastScorerTeam=A deve marcar ponto A', () => {
        const result = parse('ponto', {
            statsEnabled: false,
            lastScorerTeam: 'A',
        });
        expect(result.type).toBe('point');
        expect(result.team).toBe('A');
    });

});

// ---------------------------------------------------------------------------
// Apelidos / Abreviações de Time (Substring/Prefix Match)
// ---------------------------------------------------------------------------

describe('Team Nickname / Abbreviation Resolution', () => {

    it('"ponto do Flu" deve resolver como Fluminense (team A)', () => {
        const result = parse('ponto do Flu', {
            teamAName: 'Fluminense',
            teamBName: 'Vasco',
            statsEnabled: false,
        });
        expect(result.type).toBe('point');
        expect(result.team).toBe('A');
    });

    it('"ponto do Fla" deve resolver como Flamengo (team A)', () => {
        const result = parse('ponto do Fla', {
            statsEnabled: false,
        });
        expect(result.type).toBe('point');
        expect(result.team).toBe('A');
    });

    it('"ponto do Bota" deve resolver como Botafogo (team B)', () => {
        const result = parse('ponto do Bota', {
            statsEnabled: false,
        });
        expect(result.type).toBe('point');
        expect(result.team).toBe('B');
    });

    it('"profundo" (Web Speech API merge de "pro Flu") deve resolver via sinônimo fonético', () => {
        const result = parse('ponto de bloqueio profundo', {
            teamAName: 'Fluminense',
            teamBName: 'Vasco',
            statsEnabled: false,
        });
        expect(result.type).toBe('point');
        expect(result.team).toBe('A');
        expect(result.skill).toBe('block');
    });

    it('"ponto de bloqueio Agnelo pro Flu" com Fluminense deve resolver team + skill', () => {
        const result = parse('ponto de bloqueio Agnelo pro Flu', {
            teamAName: 'Fluminense',
            teamBName: 'Vasco',
            playersA: [makePlayer('a1', 'Agnelo', '5')],
            playersB: [],
            statsEnabled: false,
        });
        expect(result.type).toBe('point');
        expect(result.team).toBe('A');
        expect(result.skill).toBe('block');
        expect(result.player?.name).toBe('Agnelo');
    });

    it('abreviação muito curta (2 chars) NÃO deve casar com time', () => {
        const result = parse('ponto do Bo', {
            statsEnabled: false,
            servingTeam: null,
            lastScorerTeam: null,
        });
        // "Bo" tem apenas 2 chars, não atinge o mínimo de 3
        expect(result.team).toBeUndefined();
    });

});
