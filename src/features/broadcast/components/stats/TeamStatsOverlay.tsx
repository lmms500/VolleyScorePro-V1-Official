import React from 'react';
import { motion } from 'framer-motion';
import { GameState } from '@types';
import { getHexFromColor } from '@lib/utils/colors';
import { calculateTeamStats } from '../../utils/statsCalculator';
import { Zap, Shield, Target, AlertCircle } from 'lucide-react';

interface TeamStatsOverlayProps {
  show: boolean;
  state: GameState;
}

interface StatRowProps {
  label: string;
  valueA: number;
  valueB: number;
  icon: React.ReactNode;
  colorA: string;
  colorB: string;
}

const StatRow: React.FC<StatRowProps> = ({ label, valueA, valueB, icon, colorA, colorB }) => {
  const total = valueA + valueB;
  const percentA = total > 0 ? (valueA / total) * 100 : 50;
  const percentB = total > 0 ? (valueB / total) * 100 : 50;

  return (
    <div className="flex items-center gap-3 py-1.5">
      <div className="w-8 text-right">
        <span className="text-lg font-black tabular-nums" style={{ color: colorA }}>
          {valueA}
        </span>
      </div>
      
      <div className="flex-1 flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentA}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="h-2 rounded-full"
            style={{ backgroundColor: `${colorA}cc` }}
          />
          <div className="flex items-center gap-1 text-white/60">
            {icon}
            <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
          </div>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentB}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="h-2 rounded-full ml-auto"
            style={{ backgroundColor: `${colorB}cc` }}
          />
        </div>
      </div>
      
      <div className="w-8 text-left">
        <span className="text-lg font-black tabular-nums" style={{ color: colorB }}>
          {valueB}
        </span>
      </div>
    </div>
  );
};

export const TeamStatsOverlay: React.FC<TeamStatsOverlayProps> = ({ show, state }) => {
  const colorA = getHexFromColor(state.teamARoster.color || 'indigo');
  const colorB = getHexFromColor(state.teamBRoster.color || 'rose');

  const statsA = calculateTeamStats(state.matchLog, 'A', state.teamAName);
  const statsB = calculateTeamStats(state.matchLog, 'B', state.teamBName);

  if (!show) return null;

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="pointer-events-none"
    >
      <div className="bg-black/80 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden min-w-[400px]">
        <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: colorA, boxShadow: `0 0 8px ${colorA}60` }}
            />
            <span className="text-sm font-bold text-white uppercase tracking-tight truncate max-w-[100px]">
              {state.teamAName}
            </span>
          </div>
          
          <span className="text-xs font-black text-white/40 uppercase tracking-widest">
            Estatísticas
          </span>
          
          <div className="flex items-center gap-2 flex-row-reverse">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: colorB, boxShadow: `0 0 8px ${colorB}60` }}
            />
            <span className="text-sm font-bold text-white uppercase tracking-tight truncate max-w-[100px]">
              {state.teamBName}
            </span>
          </div>
        </div>

        <div className="px-4 py-3">
          <StatRow 
            label="Ataques" 
            valueA={statsA.attacks} 
            valueB={statsB.attacks}
            icon={<Zap size={10} className="text-orange-400" />}
            colorA={colorA}
            colorB={colorB}
          />
          <StatRow 
            label="Bloqueios" 
            valueA={statsA.blocks} 
            valueB={statsB.blocks}
            icon={<Shield size={10} className="text-purple-400" />}
            colorA={colorA}
            colorB={colorB}
          />
          <StatRow 
            label="Aces" 
            valueA={statsA.aces} 
            valueB={statsB.aces}
            icon={<Target size={10} className="text-cyan-400" />}
            colorA={colorA}
            colorB={colorB}
          />
          <StatRow 
            label="Erros Adv." 
            valueA={statsA.opponentErrors} 
            valueB={statsB.opponentErrors}
            icon={<AlertCircle size={10} className="text-slate-400" />}
            colorA={colorA}
            colorB={colorB}
          />
        </div>

        <div className="flex items-center justify-between px-4 py-2 border-t border-white/10 bg-white/5">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black" style={{ color: colorA }}>
              {statsA.totalPoints}
            </span>
            <span className="text-[10px] font-bold text-white/40 uppercase">TOTAL</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold" style={{ color: colorA }}>
              {statsA.efficiency}%
            </span>
            <span className="text-[10px] font-bold text-white/40 uppercase">EFF</span>
            <div className="w-px h-4 bg-white/20 mx-2" />
            <span className="text-[10px] font-bold text-white/40 uppercase">EFF</span>
            <span className="text-sm font-bold" style={{ color: colorB }}>
              {statsB.efficiency}%
            </span>
          </div>
          
          <div className="flex items-center gap-2 flex-row-reverse">
            <span className="text-2xl font-black" style={{ color: colorB }}>
              {statsB.totalPoints}
            </span>
            <span className="text-[10px] font-bold text-white/40 uppercase">TOTAL</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
