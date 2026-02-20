import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { CommandDeduplicator, getCommandDeduplicator, resetCommandDeduplicator } from '../CommandDeduplicator';
import type { VoiceCommandIntent } from '@types';

const makeIntent = (overrides: Partial<VoiceCommandIntent> = {}): VoiceCommandIntent => ({
  type: 'point',
  team: 'A',
  confidence: 0.9,
  rawText: 'ponto time a',
  ...overrides,
});

describe('CommandDeduplicator', () => {
  let deduplicator: CommandDeduplicator;

  beforeEach(() => {
    deduplicator = new CommandDeduplicator();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('generateHash', () => {
    it('deve gerar hash consistente para mesmo comando', () => {
      const intent = makeIntent();
      const hash1 = deduplicator.generateHash(intent);
      const hash2 = deduplicator.generateHash(intent);
      expect(hash1).toBe(hash2);
    });

    it('deve gerar hash diferente para times diferentes', () => {
      const hashA = deduplicator.generateHash(makeIntent({ team: 'A' }));
      const hashB = deduplicator.generateHash(makeIntent({ team: 'B' }));
      expect(hashA).not.toBe(hashB);
    });

    it('deve gerar hash diferente para skills diferentes', () => {
      const hashAttack = deduplicator.generateHash(makeIntent({ skill: 'attack' }));
      const hashBlock = deduplicator.generateHash(makeIntent({ skill: 'block' }));
      expect(hashAttack).not.toBe(hashBlock);
    });

    it('deve gerar hash diferente para players diferentes', () => {
      const hash1 = deduplicator.generateHash(makeIntent({ player: { id: '1', name: 'João' } }));
      const hash2 = deduplicator.generateHash(makeIntent({ player: { id: '2', name: 'Maria' } }));
      expect(hash1).not.toBe(hash2);
    });

    it('deve gerar hash diferente para negativo vs positivo', () => {
      const hashPos = deduplicator.generateHash(makeIntent({ isNegative: false }));
      const hashNeg = deduplicator.generateHash(makeIntent({ isNegative: true }));
      expect(hashPos).not.toBe(hashNeg);
    });
  });

  describe('canExecute', () => {
    it('deve permitir primeiro comando', () => {
      const result = deduplicator.canExecute(makeIntent());
      expect(result.allowed).toBe(true);
    });

    it('deve bloquear comando duplicado dentro do cooldown', () => {
      const intent = makeIntent();
      deduplicator.register(intent);
      
      const result = deduplicator.canExecute(intent);
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('Duplicate');
    });

    it('deve permitir comando duplicado após cooldown', () => {
      const intent = makeIntent();
      deduplicator.register(intent);
      
      vi.advanceTimersByTime(1501);
      
      const result = deduplicator.canExecute(intent);
      expect(result.allowed).toBe(true);
    });

    it('deve bloquear segundo ponto para mesmo time dentro do lockout', () => {
      const intent1 = makeIntent({ team: 'A', player: { id: '1', name: 'João' } });
      const intent2 = makeIntent({ team: 'A', player: { id: '2', name: 'Maria' } });
      
      deduplicator.register(intent1);
      
      const result = deduplicator.canExecute(intent2);
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('lockout');
    });

    it('deve permitir ponto para time diferente dentro do lockout', () => {
      const intent1 = makeIntent({ team: 'A' });
      const intent2 = makeIntent({ team: 'B' });
      
      deduplicator.register(intent1);
      
      const result = deduplicator.canExecute(intent2);
      expect(result.allowed).toBe(true);
    });

    it('deve sempre permitir undo', () => {
      deduplicator.register(makeIntent());
      
      const result = deduplicator.canExecute(makeIntent({ type: 'undo', team: undefined }));
      expect(result.allowed).toBe(true);
    });

    it('deve sempre permitir swap', () => {
      deduplicator.register(makeIntent());
      
      const result = deduplicator.canExecute(makeIntent({ type: 'swap', team: undefined }));
      expect(result.allowed).toBe(true);
    });

    it('deve permitir comando negativo após positivo para mesmo time', () => {
      const positive = makeIntent({ team: 'A', isNegative: false });
      const negative = makeIntent({ team: 'A', isNegative: true });
      
      deduplicator.register(positive);
      
      const result = deduplicator.canExecute(negative);
      expect(result.allowed).toBe(true);
    });
  });

  describe('register', () => {
    it('deve registrar comando no histórico', () => {
      const intent = makeIntent();
      deduplicator.register(intent);
      
      const debugInfo = deduplicator.getDebugInfo();
      expect(debugInfo.recentCount).toBe(1);
    });

    it('deve limitar histórico a 5 comandos', () => {
      for (let i = 0; i < 10; i++) {
        deduplicator.register(makeIntent({ player: { id: `${i}`, name: `Player ${i}` } }));
      }
      
      const debugInfo = deduplicator.getDebugInfo();
      expect(debugInfo.recentCount).toBe(5);
    });

    it('deve limpar comandos expirados', () => {
      const intent1 = makeIntent({ team: 'A', player: { id: '1', name: 'P1' } });
      deduplicator.register(intent1);
      
      vi.advanceTimersByTime(3001);
      
      const intent2 = makeIntent({ team: 'B', player: { id: '2', name: 'P2' } });
      deduplicator.register(intent2);
      
      const result = deduplicator.canExecute(makeIntent({ team: 'A', player: { id: '1', name: 'P1' } }));
      expect(result.allowed).toBe(true);
    });
  });

  describe('reset', () => {
    it('deve limpar histórico e lockouts', () => {
      deduplicator.register(makeIntent());
      deduplicator.reset();
      
      const debugInfo = deduplicator.getDebugInfo();
      expect(debugInfo.recentCount).toBe(0);
      expect(debugInfo.lockedTeams).toHaveLength(0);
    });
  });

  describe('getDebugInfo', () => {
    it('deve retornar times bloqueados', () => {
      deduplicator.register(makeIntent({ team: 'A' }));
      
      const debugInfo = deduplicator.getDebugInfo();
      expect(debugInfo.lockedTeams).toContain('A');
    });

    it('deve retornar array vazio após lockout expirar', () => {
      deduplicator.register(makeIntent({ team: 'A' }));
      
      vi.advanceTimersByTime(3001);
      
      const debugInfo = deduplicator.getDebugInfo();
      expect(debugInfo.lockedTeams).toHaveLength(0);
    });
  });
});

describe('Singleton functions', () => {
  it('getCommandDeduplicator deve retornar mesma instância', () => {
    const instance1 = getCommandDeduplicator();
    const instance2 = getCommandDeduplicator();
    expect(instance1).toBe(instance2);
  });

  it('resetCommandDeduplicator deve limpar instância', () => {
    const instance = getCommandDeduplicator();
    instance.register(makeIntent());
    
    resetCommandDeduplicator();
    
    const debugInfo = instance.getDebugInfo();
    expect(debugInfo.recentCount).toBe(0);
  });
});
