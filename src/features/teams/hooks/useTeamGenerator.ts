import { useCallback, MutableRefObject, Dispatch } from 'react';
import { GameState, GameAction } from '@types';
import { getPlayersOnCourtFromConfig } from '@config/gameModes';
import { createPlayer } from '@features/teams/utils/rosterLogic';
import { distributeStandard, balanceTeamsSnake } from '@features/game/utils/balanceUtils';

interface UseTeamGeneratorOptions {
  stateRef: MutableRefObject<GameState>;
  dispatch: Dispatch<GameAction>;
}

/**
 * Hook responsible for team generation and balancing logic.
 * Uses stateRef to access config/rosters without breaking callback stability.
 */
export const useTeamGenerator = ({
  stateRef,
  dispatch
}: UseTeamGeneratorOptions) => {

  /**
   * Parses raw input strings and generates balanced teams.
   * Input format: "Name", "Number Name", "Name Skill", or "Number Name Skill"
   */
  const generateTeams = useCallback((rawInputs: string[]) => {
    const s = stateRef.current;
    const courtLimit = getPlayersOnCourtFromConfig(s.config);

    const players = rawInputs.map((raw, index) => {
      const tokens = raw.trim().split(/\s+/);
      let pName = raw;
      let pNum: string | undefined;
      let pSkill = 5;

      if (tokens.length > 1) {
        const first = tokens[0];
        const last = tokens[tokens.length - 1];
        const firstIsNum = /^\d+$/.test(first);
        const lastIsNum = /^\d+$/.test(last);

        if (firstIsNum && lastIsNum && tokens.length > 2) {
          pNum = first;
          pSkill = Math.min(10, Math.max(1, parseInt(last)));
          pName = tokens.slice(1, -1).join(' ');
        } else if (firstIsNum) {
          pNum = first;
          pName = tokens.slice(1).join(' ');
        } else if (lastIsNum) {
          const val = parseInt(last);
          if (val <= 10) {
            pSkill = val;
            pName = tokens.slice(0, -1).join(' ');
          } else {
            pNum = last;
            pName = tokens.slice(0, -1).join(' ');
          }
        }
      }

      return createPlayer(pName, index, undefined, pSkill, pNum);
    });

    const result = distributeStandard(
      players,
      { ...s.teamARoster, players: [], tacticalOffset: 0 },
      { ...s.teamBRoster, players: [], tacticalOffset: 0 },
      [],
      courtLimit
    );

    dispatch({
      type: 'ROSTER_GENERATE',
      courtA: result.courtA,
      courtB: result.courtB,
      queue: result.queue
    });
  }, [stateRef, dispatch]);

  /**
   * Rebalances existing players across teams based on rotation mode.
   */
  const balanceTeams = useCallback(() => {
    const s = stateRef.current;
    const courtLimit = getPlayersOnCourtFromConfig(s.config);
    const allPlayers = [
      ...s.teamARoster.players,
      ...s.teamBRoster.players,
      ...s.queue.flatMap(t => t.players)
    ];

    let result;
    if (s.rotationMode === 'balanced') {
      result = balanceTeamsSnake(allPlayers, s.teamARoster, s.teamBRoster, s.queue, courtLimit);
    } else {
      result = distributeStandard(allPlayers, s.teamARoster, s.teamBRoster, s.queue, courtLimit);
    }

    dispatch({
      type: 'ROSTER_BALANCE',
      courtA: result.courtA,
      courtB: result.courtB,
      queue: result.queue
    });
  }, [stateRef, dispatch]);

  return {
    generateTeams,
    balanceTeams
  };
};
