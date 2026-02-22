import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameState, TeamId, Player } from '@types';
import { getHexFromColor } from '@lib/utils/colors';

interface RotationDisplayProps {
  show: boolean;
  state: GameState;
  teamId: TeamId;
}

const PlayerCard: React.FC<{
  player: Player | undefined;
  zone: number;
  isServing: boolean;
  teamColor: string;
  isLibero: boolean;
  delay: number;
}> = ({ player, zone, isServing, teamColor, isLibero, delay }) => {
  const displayName = player?.name 
    ? (player.name.length > 8 ? player.name.substring(0, 7) + '.' : player.name)
    : `Zona ${zone}`;

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: delay * 0.05, type: "spring", stiffness: 400, damping: 20 }}
      className={`
        relative flex flex-col items-center gap-1 p-2 rounded-lg
        transition-all duration-200 min-w-[60px]
        ${isLibero 
          ? 'bg-cyan-500/20 border border-cyan-400/50' 
          : 'bg-white/5 border border-white/10'
        }
        ${isServing ? 'ring-2 ring-cyan-400 ring-offset-1 ring-offset-transparent' : ''}
      `}
      style={!isLibero ? { borderColor: `${teamColor}40` } : {}}
    >
      {isServing && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full"
          style={{ boxShadow: '0 0 8px rgba(34, 211, 238, 0.6)' }}
        />
      )}
      
      <div 
        className={`
          w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black
          ${isLibero ? 'bg-cyan-500/30 text-cyan-300' : 'text-white'}
        `}
        style={!isLibero ? { backgroundColor: `${teamColor}40` } : {}}
      >
        {player?.number || zone}
      </div>
      
      <span className={`text-[10px] font-medium text-center leading-tight ${
        isLibero ? 'text-cyan-300' : 'text-white/70'
      }`}>
        {displayName}
      </span>
    </motion.div>
  );
};

export const RotationDisplay: React.FC<RotationDisplayProps> = ({ show, state, teamId }) => {
  if (!show) return null;

  const teamColor = teamId === 'A'
    ? getHexFromColor(state.teamARoster.color || 'indigo')
    : getHexFromColor(state.teamBRoster.color || 'rose');

  const roster = teamId === 'A' ? state.teamARoster : state.teamBRoster;
  const teamName = teamId === 'A' ? state.teamAName : state.teamBName;
  const isServing = state.servingTeam === teamId;

  const players = roster.players.slice(0, 6);

  const zonePositions = [
    { zone: 4, row: 0, col: 0 },
    { zone: 3, row: 0, col: 1 },
    { zone: 2, row: 0, col: 2 },
    { zone: 5, row: 1, col: 0 },
    { zone: 6, row: 1, col: 1 },
    { zone: 1, row: 1, col: 2 },
  ];

  const getPlayerByZone = (zone: number): Player | undefined => {
    const playerIndex = (zone - 1) % 6;
    return players[playerIndex];
  };

  const isZoneServing = (zone: number): boolean => {
    return isServing && zone === 1;
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="pointer-events-none"
      >
        <div className="bg-black/80 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl overflow-hidden">
          <div 
            className="px-4 py-2 flex items-center justify-between"
            style={{ backgroundColor: `${teamColor}80` }}
          >
            <span className="text-xs font-bold text-white uppercase tracking-wider truncate max-w-[100px]">
              {teamName}
            </span>
            <div className="flex items-center gap-2">
              {isServing && (
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="w-2 h-2 bg-cyan-400 rounded-full"
                  style={{ boxShadow: '0 0 8px rgba(34, 211, 238, 0.6)' }}
                />
              )}
              <span className="text-[10px] font-bold text-white/70 uppercase">
                {isServing ? 'SACANDO' : 'RECEBENDO'}
              </span>
            </div>
          </div>

          <div className="p-3">
            <div className="relative">
              <div className="flex justify-center mb-1">
                <div className="w-24 h-0.5 bg-white/20 rounded-full" />
              </div>
              <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[8px] font-bold text-white/30 uppercase">
                Rede
              </span>

              <div className="grid grid-cols-3 gap-2 mb-2">
                {zonePositions.slice(0, 3).map((pos) => {
                  const player = getPlayerByZone(pos.zone);
                  return (
                    <PlayerCard
                      key={pos.zone}
                      player={player}
                      zone={pos.zone}
                      isServing={isZoneServing(pos.zone)}
                      teamColor={teamColor}
                      isLibero={player?.role === 'libero'}
                      delay={pos.row * 3 + pos.col}
                    />
                  );
                })}
              </div>

              <div className="grid grid-cols-3 gap-2">
                {zonePositions.slice(3, 6).map((pos) => {
                  const player = getPlayerByZone(pos.zone);
                  return (
                    <PlayerCard
                      key={pos.zone}
                      player={player}
                      zone={pos.zone}
                      isServing={isZoneServing(pos.zone)}
                      teamColor={teamColor}
                      isLibero={player?.role === 'libero'}
                      delay={pos.row * 3 + pos.col + 3}
                    />
                  );
                })}
              </div>

              <div className="flex justify-center mt-1">
                <div className="w-16 h-0.5 bg-white/10 rounded-full" />
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 mt-3 pt-2 border-t border-white/10">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-cyan-500/30 border border-cyan-400/50" />
                <span className="text-[9px] font-medium text-white/50">Líbero</span>
              </div>
              <div className="w-px h-3 bg-white/20" />
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-cyan-400" style={{ boxShadow: '0 0 6px rgba(34, 211, 238, 0.5)' }} />
                <span className="text-[9px] font-medium text-white/50">Saque</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
