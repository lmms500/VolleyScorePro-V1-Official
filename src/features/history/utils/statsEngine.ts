
import { ActionLog, ProfileStats, TeamId } from '@types';

export interface StatsDelta {
  matchesPlayed: number;
  matchesWon: number;
  totalPoints: number;
  attacks: number;
  blocks: number;
  aces: number;
  mvpScore: number;
  mvpCount: number;
  experience: number;
}

/**
 * Calculates statistical deltas for a completed match.
 * 
 * @param matchLog Full history of actions
 * @param winnerTeamId ID of the winning team ('A' | 'B')
 * @param playerTeamMap Map of ProfileID -> TeamID. Used to attribute wins correctly.
 * @returns Map<ProfileID, StatsDelta>
 */
export const calculateMatchDeltas = (
  matchLog: ActionLog[],
  winnerTeamId: TeamId | null,
  playerTeamMap: Map<string, TeamId>,
  rosterMap: Map<string, string> // RosterID -> ProfileID
): Map<string, StatsDelta> => {

  const deltas = new Map<string, StatsDelta>();

  // Helper to init delta
  const getDelta = (id: string) => {
    if (!deltas.has(id)) {
      deltas.set(id, {
        matchesPlayed: 1,
        matchesWon: 0,
        totalPoints: 0,
        attacks: 0,
        blocks: 0,
        aces: 0,
        mvpScore: 0,
        mvpCount: 0,
        experience: 100 // XP base por participação
      });
    }
    return deltas.get(id)!;
  };

  // 1. Process Win/Loss (Base Stats for ALL participants with profiles)
  playerTeamMap.forEach((teamId, profileId) => {
    const d = getDelta(profileId);
    if (winnerTeamId && teamId === winnerTeamId) {
      d.matchesWon = 1;
      d.experience += 50; // Bônus de vitória
    }
  });

  // 2. Process Action Log (Points & Skills)
  for (const log of matchLog) {
    if (log.type !== 'POINT') continue;

    // Resolve Roster ID to Profile ID
    let targetProfileId: string | undefined;

    if (log.playerId && log.playerId !== 'unknown') {
      targetProfileId = rosterMap.get(log.playerId);
    }

    // Only process if mapped to a real profile
    if (targetProfileId) {
      const d = getDelta(targetProfileId);

      d.totalPoints += 1;
      d.mvpScore += 1;
      d.experience += 10; // XP por ponto

      switch (log.skill) {
        case 'attack':
          d.attacks += 1;
          d.mvpScore += 0.5;
          d.experience += 5;
          break;
        case 'block':
          d.blocks += 1;
          d.mvpScore += 1.0;
          d.experience += 15;
          break;
        case 'ace':
          d.aces += 1;
          d.mvpScore += 1.0;
          d.experience += 15;
          break;
      }
    }
  }

  // 3. Determine MVP(s)
  let maxScore = -1;
  deltas.forEach((delta) => {
    if (delta.mvpScore > maxScore) {
      maxScore = delta.mvpScore;
    }
  });

  if (maxScore > 0) {
    deltas.forEach((delta) => {
      if (delta.mvpScore === maxScore) {
        delta.mvpCount = 1;
        delta.experience += 100; // Bônus de MVP
      }
    });
  }

  return deltas;
};

export const mergeStats = (current: ProfileStats | undefined, delta: StatsDelta): ProfileStats => {
  const base = current || {
    matchesPlayed: 0,
    matchesWon: 0,
    totalPoints: 0,
    attacks: 0,
    blocks: 0,
    aces: 0,
    mvpCount: 0,
    experience: 0,
    level: 1
  };

  const newExperience = (base.experience || 0) + delta.experience;
  // Fórmula de Level: 500 XP por nível
  const newLevel = Math.floor(newExperience / 500) + 1;

  return {
    matchesPlayed: base.matchesPlayed + delta.matchesPlayed,
    matchesWon: base.matchesWon + delta.matchesWon,
    totalPoints: base.totalPoints + delta.totalPoints,
    attacks: base.attacks + delta.attacks,
    blocks: base.blocks + delta.blocks,
    aces: base.aces + delta.aces,
    mvpCount: (base.mvpCount || 0) + (delta.mvpCount || 0),
    experience: newExperience,
    level: newLevel
  };
};
