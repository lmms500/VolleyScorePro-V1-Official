
import { TeamId, Player, ActionLog } from '../types';
import { MIN_LEAD_TO_WIN } from '../constants';

export const calculateWinner = (scoreA: number, scoreB: number, target: number, inSuddenDeath: boolean): TeamId | null => {
    if (inSuddenDeath) {
        if (scoreA >= 3 && scoreA > scoreB) return 'A';
        if (scoreB >= 3 && scoreB > scoreA) return 'B';
    } else {
        if (scoreA >= target && scoreA >= scoreB + MIN_LEAD_TO_WIN) return 'A';
        if (scoreB >= target && scoreB >= scoreA + MIN_LEAD_TO_WIN) return 'B';
    }
    return null;
};

export const rotateClockwise = (players: Player[]): Player[] => {
    if (players.length < 2) return players;
    const copy = [...players];
    const last = copy.pop(); 
    if (last) copy.unshift(last); 
    return copy;
};

export const rotateCounterClockwise = (players: Player[]): Player[] => {
    if (players.length < 2) return players;
    const copy = [...players];
    const first = copy.shift();
    if (first) copy.push(first); 
    return copy;
};

export const hasTeamServedInSet = (actionLog: ActionLog[], team: TeamId): boolean => {
    return actionLog.some(log => log.type === 'POINT' && log.prevServingTeam === team);
};
