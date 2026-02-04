
import React, { useState, useEffect } from 'react';
import { Match, useHistoryStore } from '../../stores/historyStore';
import { AnalysisEngine } from '../../services/AnalysisEngine';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Target, Zap, Shield, FileText, BrainCircuit, TrendingUp, BarChart3, Info, Flame, ChevronRight, Binary } from 'lucide-react';
import { useTranslation } from '../../contexts/LanguageContext';
import { PDFService } from '../../services/PDFService';
import { useHaptics } from '../../hooks/useHaptics';
import { MatchAnalysis } from '../../types';

const EfficiencyBadge = ({ label, value, colorClass, icon: Icon }: any) => (
    <div className="flex flex-col gap-2 p-4 bg-white/40 dark:bg-white/[0.03] rounded-3xl border border-black/5 dark:border-white/5 relative overflow-hidden group">
        <div className="flex items-center justify-between relative z-10">
            <div className={`p-2 rounded-xl ${colorClass.replace('bg-', 'bg-opacity-20 bg-')} ${colorClass.replace('bg-', 'text-')}`}>
                <Icon size={16} strokeWidth={2.5} />
            </div>
            <span className="text-xl font-black tabular-nums">{value}/10</span>
        </div>
        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 relative z-10">{label}</span>
        <div className="h-1 w-full bg-slate-200 dark:bg-white/10 rounded-full mt-1 overflow-hidden">
            <motion.div 
                initial={{ width: 0 }} animate={{ width: `${value * 10}%` }}
                className={`h-full ${colorClass}`}
            />
        </div>
    </div>
);

export const ProAnalysis: React.FC<{ match: Match }> = ({ match }) => {
    const { t } = useTranslation();
    const haptics = useHaptics();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<MatchAnalysis | null>(match.aiAnalysis || null);
    const { setMatchAnalysis } = useHistoryStore();

    useEffect(() => {
        const runAnalysis = async () => {
            // SE JÁ ANALISADO NO OBJETO DO STORE, USAR OS DADOS EXISTENTES
            if (match.aiAnalysis) {
                setData(match.aiAnalysis);
                return;
            }

            // SE NÃO TIVER DADOS E NÃO ESTIVER CARREGANDO, DISPARAR IA
            if (!data && !loading) {
                setLoading(true);
                const report = await AnalysisEngine.analyzeMatch(match);
                
                if (report) {
                    setData(report);
                    // SALVAR NA STORE PARA PERSISTÊNCIA DEFINITIVA
                    if (match.id !== 'temp-match') {
                        setMatchAnalysis(match.id, report);
                    }
                    haptics.notification('success');
                }
                setLoading(false);
            }
        };
        
        runAnalysis();
    }, [match.id, match.aiAnalysis, setMatchAnalysis]);

    if (loading && !data) return (
        <div className="flex flex-col items-center justify-center py-32 gap-6">
            <div className="relative">
                <motion.div 
                    animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="w-20 h-20 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full"
                />
                <BrainCircuit className="absolute inset-0 m-auto text-indigo-500 animate-pulse" size={28} />
            </div>
            <div className="text-center">
                <span className="text-xs font-black uppercase tracking-[0.3em] text-indigo-500">{t('analysis.aiCoach')}</span>
                <p className="text-[10px] font-bold text-slate-400 uppercase mt-2">{t('analysis.processing')}</p>
            </div>
        </div>
    );

    if (!data) return null;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-5 pb-20">
            
            {/* GAUGES */}
            <div className="grid grid-cols-3 gap-3">
                <EfficiencyBadge label={t('scout.skills.attack')} value={data.teamEfficiency.attack} colorClass="bg-rose-500" icon={Zap} />
                <EfficiencyBadge label={t('scout.skills.block')} value={data.teamEfficiency.defense} colorClass="bg-indigo-500" icon={Shield} />
                <EfficiencyBadge label={t('teamManager.modes.balanced')} value={data.teamEfficiency.consistency} colorClass="bg-emerald-500" icon={Target} />
            </div>

            {/* KEY INSIGHT */}
            <div className="bg-slate-900 dark:bg-indigo-950/40 rounded-[2rem] p-6 text-white shadow-2xl relative overflow-hidden ring-1 ring-white/10">
                <Sparkles className="absolute -top-4 -right-4 text-white/10" size={120} />
                <div className="relative z-10">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-300 mb-3 flex items-center gap-2">
                        <Flame size={12} className="text-amber-400" /> {t('analysis.insight')}
                    </h3>
                    <p className="text-xl font-black leading-tight tracking-tight mb-4">{data.tacticalSummary}</p>
                    <div className="flex items-start gap-3 p-4 bg-white/10 rounded-2xl border border-white/10">
                        <Info size={16} className="text-indigo-300 shrink-0 mt-1" />
                        <p className="text-xs font-medium text-indigo-100 leading-relaxed italic">"{data.clutchMoment}"</p>
                    </div>
                </div>
            </div>

            {/* FUTURE PREDICTION */}
            <div className="bg-white/60 dark:bg-white/[0.03] rounded-3xl p-5 border border-black/5 dark:border-white/5">
                <div className="flex items-center gap-2 mb-3">
                    <Binary size={16} className="text-slate-400" />
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('analysis.projection')}</h4>
                </div>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200 leading-snug">{data.futurePrediction}</p>
            </div>

            {/* TIPS LIST */}
            <div className="space-y-3">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">{t('analysis.nextSteps')}</h4>
                {data.performanceTips.map((tip: string, i: number) => (
                    <div key={i} className="flex gap-4 p-4 bg-white dark:bg-white/5 rounded-2xl border border-black/5 shadow-sm">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500 text-white flex items-center justify-center font-black text-xs shrink-0">{i+1}</div>
                        <p className="text-xs font-bold text-slate-600 dark:text-slate-300">{tip}</p>
                    </div>
                ))}
            </div>

            {/* EXPORT PDF */}
            <button 
                onClick={() => PDFService.generateReport(match)}
                className="w-full flex items-center justify-center gap-3 py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[2rem] text-xs font-black uppercase tracking-[0.2em] shadow-xl active:scale-[0.98] transition-all"
            >
                <FileText size={18} /> {t('analysis.downloadReport')}
            </button>
        </motion.div>
    );
};
