
import React from 'react';
import { Modal } from '../ui/Modal';
import { Team, TeamId, SkillType, ActionLog, GameConfig } from '../../types';
import { X } from 'lucide-react';
import { CourtLayout } from '../Court/CourtLayout';

interface CourtModalProps {
    isOpen: boolean;
    onClose: () => void;
    teamA: Team;
    teamB: Team;
    scoreA: number;
    scoreB: number;
    servingTeam: TeamId | null;
    onManualRotate: (teamId: string, direction: 'clockwise' | 'counter') => void;
    onAddPoint: (teamId: TeamId, playerId?: string, skill?: SkillType) => void;
    onSubtractPoint: (teamId: TeamId) => void;
    onMovePlayer: (teamId: string, indexA: number, indexB: number) => void;
    onSubstitute?: (teamId: string, pIn: string, pOut: string) => void;
    onTimeoutA?: () => void;
    onTimeoutB?: () => void;
    timeoutsA?: number;
    timeoutsB?: number;
    currentSet: number;
    setsA: number;
    setsB: number;
    isMatchPointA: boolean;
    isMatchPointB: boolean;
    isSetPointA: boolean;
    isSetPointB: boolean;
    isDeuce: boolean;
    inSuddenDeath: boolean;
    matchLog?: ActionLog[];
    config?: GameConfig;
    onOpenManager?: () => void;
    onOpenHistory?: () => void;
    onOpenSettings?: () => void;
}

export const CourtModal: React.FC<CourtModalProps> = ({
    isOpen, onClose, ...courtProps
}) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="" variant="immersive" zIndex="z-[100]">
            <button onClick={onClose} className="absolute top-safe-top right-4 z-[60] p-2 mt-2 rounded-full bg-gradient-to-br from-white to-slate-100 dark:from-slate-800 dark:to-slate-900 hover:from-white hover:to-white dark:hover:from-slate-700 dark:hover:to-slate-800 text-slate-500 dark:text-white transition-all backdrop-blur-md border border-white/20 shadow-lg active:scale-95 pointer-events-auto"><X size={18} /></button>

            <CourtLayout
                {...courtProps}
                variant="modal"
            />
        </Modal>
    );
};
