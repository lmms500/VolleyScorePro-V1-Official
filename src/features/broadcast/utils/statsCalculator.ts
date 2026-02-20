import { ActionLog, TeamId, SkillType, Player, Team } from '@types';

export interface TeamStatsResult {
  attacks: number;
  blocks: number;
  aces: number;
  opponentErrors: number;
  totalPoints: number;
  efficiency: number;
}

export interface PlayerStatsResult {
  playerId: string;
  playerName: string;
  playerNumber?: string;
  teamId: TeamId;
  attacks: number;
  blocks: number;
  aces: number;
  opponentErrors: number;
  totalPoints: number;
}

export function calculateTeamStats(
  matchLog: ActionLog[],
  teamId: TeamId,
  teamName: string
): TeamStatsResult {
  const stats: TeamStatsResult = {
    attacks: 0,
    blocks: 0,
    aces: 0,
    opponentErrors: 0,
    totalPoints: 0,
    efficiency: 0,
  };

  matchLog.forEach((action) => {
    if (action.type !== 'POINT') return;
    if (action.team !== teamId) return;

    stats.totalPoints++;

    switch (action.skill) {
      case 'attack':
        stats.attacks++;
        break;
      case 'block':
        stats.blocks++;
        break;
      case 'ace':
        stats.aces++;
        break;
      case 'opponent_error':
        stats.opponentErrors++;
        break;
      default:
        break;
    }
  });

  const scoringPoints = stats.attacks + stats.blocks + stats.aces;
  stats.efficiency = stats.totalPoints > 0 
    ? Math.round((scoringPoints / stats.totalPoints) * 100) 
    : 0;

  return stats;
}

export function calculatePlayerStats(
  matchLog: ActionLog[],
  teamRoster: Team,
  teamId: TeamId
): PlayerStatsResult[] {
  const playerStatsMap = new Map<string, PlayerStatsResult>();

  teamRoster.players.forEach((player) => {
    playerStatsMap.set(player.id, {
      playerId: player.id,
      playerName: player.name,
      playerNumber: player.number,
      teamId,
      attacks: 0,
      blocks: 0,
      aces: 0,
      opponentErrors: 0,
      totalPoints: 0,
    });
  });

  matchLog.forEach((action) => {
    if (action.type !== 'POINT') return;
    if (action.team !== teamId) return;
    if (!action.playerId) return;

    const stats = playerStatsMap.get(action.playerId);
    if (!stats) return;

    stats.totalPoints++;

    switch (action.skill) {
      case 'attack':
        stats.attacks++;
        break;
      case 'block':
        stats.blocks++;
        break;
      case 'ace':
        stats.aces++;
        break;
      case 'opponent_error':
        stats.opponentErrors++;
        break;
      default:
        break;
    }
  });

  return Array.from(playerStatsMap.values())
    .filter((p) => p.totalPoints > 0)
    .sort((a, b) => b.totalPoints - a.totalPoints);
}

export function getTopScorer(
  matchLog: ActionLog[],
  teamARoster: Team,
  teamBRoster: Team
): PlayerStatsResult | null {
  const teamAStats = calculatePlayerStats(matchLog, teamARoster, 'A');
  const teamBStats = calculatePlayerStats(matchLog, teamBRoster, 'B');

  const allStats = [...teamAStats, ...teamBStats];
  
  if (allStats.length === 0) return null;

  return allStats.reduce((top, current) => 
    current.totalPoints > top.totalPoints ? current : top
  );
}

export function getLastPointScorer(
  matchLog: ActionLog[],
  teamARoster: Team,
  teamBRoster: Team
): { player: Player; teamId: TeamId; skill?: SkillType } | null {
  for (let i = matchLog.length - 1; i >= 0; i--) {
    const action = matchLog[i];
    if (action.type !== 'POINT') continue;
    if (!action.playerId) continue;

    const roster = action.team === 'A' ? teamARoster : teamBRoster;
    const player = roster.players.find((p) => p.id === action.playerId);
    
    if (player) {
      return { player, teamId: action.team, skill: action.skill };
    }
    break;
  }

  return null;
}

export function formatMatchTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function getPointsBySkill(stats: TeamStatsResult): { label: string; value: number; color: string }[] {
  return [
    { label: 'Ataques', value: stats.attacks, color: '#f97316' },
    { label: 'Bloqueios', value: stats.blocks, color: '#8b5cf6' },
    { label: 'Aces', value: stats.aces, color: '#06b6d4' },
    { label: 'Erros Adv.', value: stats.opponentErrors, color: '#64748b' },
  ];
}
