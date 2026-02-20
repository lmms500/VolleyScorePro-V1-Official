import { TeamId, VoiceCommandIntent } from '@types';

interface ExecutedCommand {
  hash: string;
  team: TeamId | undefined;
  executedAt: number;
  intent: VoiceCommandIntent;
}

export class CommandDeduplicator {
  private readonly COOLDOWN_MS = 1500;
  private readonly MAX_HISTORY = 5;
  private readonly TEAM_LOCKOUT_MS = 1500;

  private recentCommands: ExecutedCommand[] = [];
  private teamLockouts: Map<TeamId, number> = new Map();

  generateHash(intent: VoiceCommandIntent): string {
    const parts = [
      intent.type,
      intent.team || 'none',
      intent.skill || 'none',
      intent.player?.id || 'none',
      intent.isNegative ? 'neg' : 'pos',
    ];
    return parts.join('|');
  }

  canExecute(intent: VoiceCommandIntent): { allowed: boolean; reason?: string } {
    if (intent.type === 'unknown' || intent.type === 'undo' || intent.type === 'swap') {
      return { allowed: true };
    }

    const now = Date.now();
    const hash = this.generateHash(intent);

    const recentDuplicate = this.recentCommands.find(cmd => {
      const timeDiff = now - cmd.executedAt;
      return cmd.hash === hash && timeDiff < this.COOLDOWN_MS;
    });

    if (recentDuplicate) {
      return {
        allowed: false,
        reason: `Duplicate command blocked (hash: ${hash.substring(0, 30)}...)`,
      };
    }

    if (intent.type === 'point' && intent.team && !intent.isNegative) {
      const lastTeamPoint = this.teamLockouts.get(intent.team);
      if (lastTeamPoint && now - lastTeamPoint < this.TEAM_LOCKOUT_MS) {
        return {
          allowed: false,
          reason: `Team ${intent.team} lockout active (${this.TEAM_LOCKOUT_MS}ms)`,
        };
      }
    }

    return { allowed: true };
  }

  register(intent: VoiceCommandIntent): void {
    if (intent.type === 'unknown') return;

    const now = Date.now();
    const hash = this.generateHash(intent);

    this.recentCommands.unshift({
      hash,
      team: intent.team,
      executedAt: now,
      intent,
    });

    if (this.recentCommands.length > this.MAX_HISTORY) {
      this.recentCommands = this.recentCommands.slice(0, this.MAX_HISTORY);
    }

    if (intent.type === 'point' && intent.team && !intent.isNegative) {
      this.teamLockouts.set(intent.team, now);
    }

    this.cleanupExpired(now);
  }

  private cleanupExpired(now: number): void {
    const cutoff = now - this.COOLDOWN_MS * 2;
    this.recentCommands = this.recentCommands.filter(cmd => cmd.executedAt > cutoff);

    for (const [team, timestamp] of this.teamLockouts.entries()) {
      if (now - timestamp > this.TEAM_LOCKOUT_MS * 2) {
        this.teamLockouts.delete(team);
      }
    }
  }

  reset(): void {
    this.recentCommands = [];
    this.teamLockouts.clear();
  }

  getDebugInfo(): { recentCount: number; lockedTeams: TeamId[] } {
    const now = Date.now();
    const lockedTeams: TeamId[] = [];

    for (const [team, timestamp] of this.teamLockouts.entries()) {
      if (now - timestamp < this.TEAM_LOCKOUT_MS) {
        lockedTeams.push(team);
      }
    }

    return {
      recentCount: this.recentCommands.length,
      lockedTeams,
    };
  }
}

let instance: CommandDeduplicator | null = null;

export function getCommandDeduplicator(): CommandDeduplicator {
  if (!instance) {
    instance = new CommandDeduplicator();
  }
  return instance;
}

export function resetCommandDeduplicator(): void {
  instance?.reset();
}
