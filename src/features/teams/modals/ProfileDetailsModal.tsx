
import React, { useMemo } from 'react';
import { Modal } from '@ui/Modal';
import { Button } from '@ui/Button';
import { PlayerProfile } from '@types';
import { Edit2, Trophy, Swords, Shield, Target, Zap, Activity, Star, TrendingUp } from 'lucide-react';
import { useTranslation } from '@contexts/LanguageContext';
import { motion } from 'framer-motion';

interface ProfileDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    profileId: string;
    profiles: Map<string, PlayerProfile>;
    onEdit: () => void;
}

const StatGlassBox = ({ label, value, icon: Icon, colorClass }: any) => (
    <div
        className="group relative flex flex-col items-center justify-center p-3 rounded-2xl bg-white/40 dark:bg-white/5 border border-white/50 dark:border-white/5 shadow-sm hover:shadow-md transition-all overflow-hidden"
    >
        <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity bg-gradient-to-br ${colorClass}`} />

        <div className={`p-2 rounded-full mb-1 bg-opacity-10 ${colorClass.split(' ')[0].replace('from-', 'bg-')}`}>
            <Icon size={14} className={colorClass.split(' ')[1].replace('to-', 'text-')} strokeWidth={2.5} />
        </div>

        <span className="text-xl font-black text-slate-800 dark:text-white leading-none tabular-nums tracking-tighter mt-1">{value}</span>
        <span className="text-[8px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">{label}</span>
    </div>
);

export const ProfileDetailsModal: React.FC<ProfileDetailsModalProps> = ({
    isOpen, onClose, profileId, profiles, onEdit
}) => {
    const { t } = useTranslation();
    const profile = profiles.get(profileId);

    // --- EFFICIENCY ENGINE ---
    const efficiencyData = useMemo(() => {
        if (!profile || !profile.stats || profile.stats.matchesPlayed === 0) {
            return { score: 0, label: t('profile.rookie'), color: 'text-slate-400', bg: 'bg-slate-400', percent: 0 };
        }

        const s = profile.stats;
        // Formula: Weighted contribution per match
        // Kills (1.0) + Blocks (1.5) + Aces (1.2)
        const weightedScore = (s.attacks * 1.0) + (s.blocks * 1.5) + (s.aces * 1.2);
        const avgImpact = weightedScore / s.matchesPlayed;

        // Scaling logic (0 to 10 scale essentially)
        // > 6.0 is MVP level
        let label = 'Developing';
        let color = 'text-slate-500';
        let bg = 'bg-slate-500';
        let gradient = 'from-slate-400 to-slate-600';

        if (avgImpact > 2.0) { label = 'Solid'; color = 'text-cyan-500'; bg = 'bg-cyan-500'; gradient = 'from-cyan-400 to-cyan-600'; }
        if (avgImpact > 4.0) { label = 'High Impact'; color = 'text-emerald-500'; bg = 'bg-emerald-500'; gradient = 'from-emerald-400 to-emerald-600'; }
        if (avgImpact > 6.0) { label = 'MVP Level'; color = 'text-amber-500'; bg = 'bg-amber-500'; gradient = 'from-amber-400 to-amber-600'; }

        // Cap percent at 100 for visual bar (assuming 8.0 is max visual "full bar")
        const percent = Math.min(100, (avgImpact / 8.0) * 100);

        return { score: avgImpact.toFixed(1), label, color, bg, percent, gradient };
    }, [profile, t]);

    if (!isOpen || !profile) return null;

    const stats = profile.stats || { matchesPlayed: 0, matchesWon: 0, totalPoints: 0, attacks: 0, blocks: 0, aces: 0, mvpCount: 0 };
    const winRate = stats.matchesPlayed > 0 ? Math.round((stats.matchesWon / stats.matchesPlayed) * 100) : 0;

    let roleColor = 'from-slate-500 to-slate-700';
    if (profile.role === 'hitter') roleColor = 'from-rose-500 to-rose-700';
    else if (profile.role === 'setter') roleColor = 'from-amber-500 to-amber-700';
    else if (profile.role === 'middle') roleColor = 'from-indigo-500 to-indigo-700';
    else if (profile.role === 'libero') roleColor = 'from-emerald-500 to-emerald-700';

    const roleLabel = profile.role !== 'none' ? t(`roles.${profile.role}`) : t('visuals.player');

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title=""
            maxWidth="max-w-4xl"
            variant="floating"
            backdropClassName="bg-black/60 backdrop-blur-md"
        >
            {/* Main Container - removed h-full/overflow-hidden to allow natural scroll */}
            <div className="flex flex-col min-h-full -mx-6 -mb-6 bg-transparent">

                {/* CONTENT AREA - Natural Height */}
                <div className="flex-1 p-6 sm:p-8 pt-6">

                    <div className="flex flex-col landscape:flex-row gap-6 sm:gap-8">

                        {/* 1. HERO CARD (Left Column) */}
                        <div className="w-full landscape:w-[40%] flex flex-col items-center landscape:sticky landscape:top-6 self-start">
                            <div className={`w-full relative rounded-[2.5rem] overflow-hidden bg-gradient-to-br ${roleColor} shadow-2xl p-8 text-white flex flex-col items-center ring-1 ring-white/10`}>
                                {/* Background Pattern */}
                                <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4yKSIvPjwvc3ZnPg==')] [mask-image:linear-gradient(to_bottom,black,transparent)]" />

                                <div className="relative z-10 w-28 h-28 rounded-[2rem] bg-white/20 backdrop-blur-md shadow-inner border border-white/30 flex items-center justify-center text-6xl mb-5 ring-4 ring-white/10">
                                    {profile.avatar || '👤'}
                                </div>

                                <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight leading-none text-center drop-shadow-md break-words max-w-full">
                                    {profile.name}
                                </h2>

                                <div className="flex items-center gap-2 mt-4 flex-wrap justify-center">
                                    <span className="px-4 py-1.5 rounded-full bg-black/20 backdrop-blur-sm border border-white/10 text-xs font-bold uppercase tracking-wider">
                                        {roleLabel}
                                    </span>
                                    {profile.number && (
                                        <span className="px-4 py-1.5 rounded-full bg-white text-slate-900 text-xs font-black shadow-lg">
                                            #{profile.number}
                                        </span>
                                    )}
                                </div>

                                {/* Quick Stats on Card */}
                                <div className="grid grid-cols-2 w-full mt-8 gap-3">
                                    <div className="bg-black/20 rounded-2xl p-3 text-center backdrop-blur-sm border border-white/5">
                                        <div className="text-[10px] font-bold opacity-70 uppercase tracking-widest mb-1">{t('profile.skillLevel')}</div>
                                        <div className="text-2xl font-black flex items-center justify-center gap-1">
                                            {profile.skillLevel} <Star size={14} fill="currentColor" className="text-yellow-400" />
                                        </div>
                                    </div>
                                    <div className="bg-black/20 rounded-2xl p-3 text-center backdrop-blur-sm border border-white/5">
                                        <div className="text-[10px] font-bold opacity-70 uppercase tracking-widest mb-1">{t('stats.winRate')}</div>
                                        <div className="text-2xl font-black">{winRate}%</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. STATS GRID (Right Column) */}
                        <div className="flex-1 w-full flex flex-col gap-6 min-w-0">
                            <div className="flex items-center gap-2 text-slate-400 px-1">
                                <Activity size={18} />
                                <span className="text-xs font-black uppercase tracking-[0.2em]">{t('profile.details.analytics')}</span>
                            </div>

                            <div className="grid grid-cols-3 gap-3 sm:gap-4">
                                <StatGlassBox label={t('stats.matches')} value={stats.matchesPlayed} icon={Trophy} colorClass="from-slate-400 to-slate-600" />
                                <StatGlassBox label={t('stats.points')} value={stats.totalPoints} icon={Zap} colorClass="from-amber-400 to-amber-600" />
                                <StatGlassBox label={t('stats.mvp')} value={stats.mvpCount} icon={Trophy} colorClass="from-purple-400 to-purple-600" />

                                <StatGlassBox label={t('stats.attackPoints')} value={stats.attacks} icon={Swords} colorClass="from-rose-400 to-rose-600" />
                                <StatGlassBox label={t('stats.killBlocks')} value={stats.blocks} icon={Shield} colorClass="from-indigo-400 to-indigo-600" />
                                <StatGlassBox label={t('stats.serviceAces')} value={stats.aces} icon={Target} colorClass="from-emerald-400 to-emerald-600" />
                            </div>

                            {/* EFFICIENCY CARD (Dynamic) */}
                            <div className="bg-white/80 dark:bg-white/5 rounded-3xl p-6 border border-white/60 dark:border-white/5 shadow-sm relative overflow-hidden">
                                <div className={`absolute top-0 right-0 p-32 rounded-full blur-[80px] opacity-20 pointer-events-none ${efficiencyData.bg}`} />

                                <div className="relative z-10">
                                    <div className="flex justify-between items-end mb-3">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2">
                                                <TrendingUp size={16} className={efficiencyData.color} />
                                                <span className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">{t('profile.details.impactScore')}</span>
                                            </div>
                                            <h3 className={`text-2xl sm:text-3xl font-black uppercase tracking-tight ${efficiencyData.color}`}>
                                                {efficiencyData.label}
                                            </h3>
                                        </div>
                                        <div className="text-right">
                                            <span className={`text-4xl font-black tabular-nums ${efficiencyData.color}`}>
                                                {efficiencyData.score}
                                            </span>
                                            <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">{t('profile.details.avgPts')}</span>
                                        </div>
                                    </div>

                                    {/* Custom Progress Bar */}
                                    <div className="h-4 w-full bg-slate-100 dark:bg-black/40 rounded-full overflow-hidden border border-black/5 dark:border-white/5 relative">
                                        {/* Ticks */}
                                        <div className="absolute inset-0 flex justify-between px-1 items-center z-10 opacity-30">
                                            {[...Array(10)].map((_, i) => <div key={i} className="w-px h-2 bg-slate-400" />)}
                                        </div>

                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${efficiencyData.percent}%` }}
                                            transition={{ duration: 1, ease: "circOut", delay: 0.2 }}
                                            className={`h-full rounded-full bg-gradient-to-r ${efficiencyData.gradient} shadow-lg relative`}
                                        >
                                            <div className="absolute inset-0 bg-white/20 animate-pulse" />
                                        </motion.div>
                                    </div>

                                    <p className="text-[10px] text-slate-400 mt-4 leading-relaxed font-medium">
                                        {t('profile.details.efficiencyDesc')}
                                    </p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* 3. STICKY FOOTER */}
                <div className="sticky bottom-0 pt-4 border-t border-slate-200 dark:border-white/5 flex gap-3 px-6 sm:px-8 pb-6 sm:pb-8 bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-md z-30 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
                    <Button variant="ghost" onClick={onClose} className="flex-1 bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 h-14 rounded-2xl hover:bg-slate-200 dark:hover:bg-white/10">
                        {t('common.back')}
                    </Button>
                    <Button onClick={onEdit} className="flex-[2] bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-500/20 h-14 rounded-2xl text-sm font-black uppercase tracking-widest ring-1 ring-white/20">
                        <Edit2 size={18} className="mr-2" strokeWidth={2.5} /> {t('profile.editTitle')}
                    </Button>
                </div>

            </div>
        </Modal>
    );
};
