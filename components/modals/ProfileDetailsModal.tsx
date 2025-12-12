
import React from 'react';
import { createPortal } from 'react-dom';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { PlayerProfile, PlayerRole } from '../../types';
import { Edit2, Trophy, Swords, Shield, Target, Zap, Activity } from 'lucide-react';
import { useTranslation } from '../../contexts/LanguageContext';

interface ProfileDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileId: string;
  profiles: Map<string, PlayerProfile>;
  onEdit: () => void;
}

const StatBox = ({ label, value, icon: Icon, colorClass }: any) => (
    <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white/50 dark:bg-white/5 border border-black/5 dark:border-white/10 flex-1 min-w-[80px]">
        <div className={`p-2 rounded-full mb-1 bg-opacity-10 ${colorClass}`}>
            <Icon size={16} className={colorClass.replace('bg-', 'text-').replace('/10', '')} />
        </div>
        <span className="text-xl font-black text-slate-800 dark:text-white tabular-nums">{value}</span>
        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">{label}</span>
    </div>
);

export const ProfileDetailsModal: React.FC<ProfileDetailsModalProps> = ({
  isOpen, onClose, profileId, profiles, onEdit
}) => {
  const { t } = useTranslation();
  const profile = profiles.get(profileId);

  if (!isOpen || !profile) return null;

  const stats = profile.stats || { matchesPlayed: 0, matchesWon: 0, totalPoints: 0, attacks: 0, blocks: 0, aces: 0, mvpCount: 0 };
  const winRate = stats.matchesPlayed > 0 ? Math.round((stats.matchesWon / stats.matchesPlayed) * 100) : 0;

  return createPortal(
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      maxWidth="max-w-sm"
      zIndex="z-[9999]"
    >
      <div className="flex flex-col gap-6 pb-4">
        
        {/* HEADER: Avatar & Name */}
        <div className="flex flex-col items-center pt-2">
            <div className="relative">
                <div className="w-24 h-24 rounded-[2rem] bg-slate-100 dark:bg-white/5 flex items-center justify-center text-5xl shadow-lg border border-slate-200 dark:border-white/10">
                    {profile.avatar || '👤'}
                </div>
                {profile.number && (
                    <div className="absolute -top-2 -right-2 w-8 h-8 flex items-center justify-center bg-indigo-600 text-white font-black text-sm rounded-xl shadow-lg border-2 border-white dark:border-slate-900">
                        {profile.number}
                    </div>
                )}
            </div>
            
            <h2 className="text-2xl font-black text-slate-800 dark:text-white mt-4">{profile.name}</h2>
            <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-white/10 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-300">
                    Lvl {profile.skillLevel}
                </span>
                {profile.role && profile.role !== 'none' && (
                    <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-[10px] font-bold uppercase tracking-wider text-indigo-500">
                        {profile.role}
                    </span>
                )}
            </div>
        </div>

        {/* CAREER STATS */}
        <div className="space-y-3">
            <div className="flex items-center justify-between px-2">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Career Stats</h3>
                <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${winRate >= 50 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                    {winRate}% Win Rate ({stats.matchesWon}W - {stats.matchesPlayed - stats.matchesWon}L)
                </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
                <StatBox label="Points" value={stats.totalPoints} icon={Trophy} colorClass="bg-amber-500 text-amber-500" />
                <StatBox label="Attacks" value={stats.attacks} icon={Swords} colorClass="bg-rose-500 text-rose-500" />
                <StatBox label="Blocks" value={stats.blocks} icon={Shield} colorClass="bg-indigo-500 text-indigo-500" />
                <StatBox label="Aces" value={stats.aces} icon={Target} colorClass="bg-emerald-500 text-emerald-500" />
            </div>
        </div>

        {/* ACTIONS */}
        <div className="grid grid-cols-2 gap-3 mt-2 border-t border-black/5 dark:border-white/5 pt-4">
            <Button variant="secondary" onClick={onClose}>{t('common.back')}</Button>
            <Button onClick={onEdit} className="bg-indigo-600 text-white shadow-indigo-500/20">
                <Edit2 size={16} /> Edit Profile
            </Button>
        </div>

      </div>
    </Modal>,
    document.body
  );
};
