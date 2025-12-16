
import React, { useState, useMemo, useRef, useEffect, lazy, Suspense, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useHistoryStore, Match } from '../../stores/historyStore';
import { useTranslation } from '../../contexts/LanguageContext';
import { downloadJSON, exportMatchesToCSV, parseJSONFile } from '../../services/io';
import { 
  Search, Clock, Trash2, ChevronDown, ChevronUp, 
  Download, Upload, Filter, AlertCircle, BarChart2, Crown, Calendar, SortDesc, Check, FileSpreadsheet, FileJson, PieChart, FolderOpen, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button';
import { MatchDetail } from './MatchDetail';
import { resolveTheme, getHexFromColor } from '../../utils/colors';
import { Virtuoso } from 'react-virtuoso'; 
import { NotificationToast } from '../ui/NotificationToast';

// Lazy load the new stats modal
const TeamStatsModal = lazy(() => import('../modals/TeamStatsModal').then(module => ({ default: module.TeamStatsModal })));

// --- SUB-COMPONENTS ---

interface CustomSelectProps {
    value: string;
    onChange: (value: string) => void;
    options: { value: string; label: string }[];
    icon?: React.ReactNode;
    align?: 'left' | 'right';
}

const CustomSelect: React.FC<CustomSelectProps> = ({ value, onChange, options, icon, align = 'left' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedLabel = options.find(o => o.value === value)?.label || value;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        if(isOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    return (
        <div className="relative w-full group" ref={containerRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    w-full flex items-center justify-between
                    bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 
                    rounded-xl landscape:rounded-lg pl-3 pr-2 py-2.5 landscape:py-1.5
                    text-[10px] sm:text-xs font-bold uppercase tracking-wider 
                    text-slate-600 dark:text-slate-300 
                    hover:bg-slate-50 dark:hover:bg-white/10 hover:border-black/10 dark:hover:border-white/20
                    transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/30
                    ${isOpen ? 'ring-2 ring-indigo-500/30 bg-slate-50 dark:bg-white/10' : ''}
                `}
            >
                <span className="truncate mr-2 min-w-0">{selectedLabel}</span>
                <div className="text-slate-400 flex-shrink-0 scale-90">
                    {icon || (isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                </div>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className={`
                            absolute top-full ${align === 'right' ? 'right-0' : 'left-0'} mt-2 z-50 
                            min-w-full w-max max-w-[200px]
                            bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl 
                            border border-black/5 dark:border-white/10 
                            rounded-xl shadow-2xl shadow-black/20 
                            overflow-hidden max-h-60 overflow-y-auto custom-scrollbar
                        `}
                    >
                        {options.map((opt) => (
                            <button
                                key={opt.value}
                                onClick={() => { onChange(opt.value); setIsOpen(false); }}
                                className={`
                                    w-full flex items-center justify-between px-3 py-2 text-left
                                    text-[10px] font-bold uppercase tracking-wide transition-colors
                                    hover:bg-black/5 dark:hover:bg-white/10
                                    ${value === opt.value ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10' : 'text-slate-600 dark:text-slate-300'}
                                `}
                            >
                                <span className="mr-2 whitespace-nowrap">{opt.label}</span>
                                {value === opt.value && <Check size={12} className="text-indigo-500 flex-shrink-0" />}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// Export Menu Component
const ExportMenu = ({ onExportJSON, onExportCSV }: { onExportJSON: () => void, onExportCSV: () => void }) => {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        if(isOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    return (
        <div className="relative" ref={containerRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)} 
                className={`p-2.5 rounded-xl border border-black/5 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:text-indigo-500 dark:hover:text-white hover:bg-indigo-50 dark:hover:bg-white/10 transition-colors ${isOpen ? 'bg-indigo-50 dark:bg-white/10 text-indigo-500' : 'bg-white dark:bg-white/5'}`} 
            >
                <Upload size={16} /> 
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute top-full right-0 mt-2 z-50 min-w-[140px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-xl shadow-xl overflow-hidden p-1"
                    >
                        <button onClick={() => { onExportJSON(); setIsOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors">
                            <FileJson size={14} className="text-amber-500" /> {t('historyList.export.json')}
                        </button>
                        <button onClick={() => { onExportCSV(); setIsOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors">
                            <FileSpreadsheet size={14} className="text-emerald-500" /> {t('historyList.export.csv')}
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// Memoized History Card
const HistoryCard: React.FC<{ 
    match: Match; 
    onDelete: (id: string) => void;
    isExpanded: boolean;
    onToggle: () => void;
    onAnalyze: () => void;
    isSelected?: boolean;
}> = React.memo(({ match, onDelete, isExpanded, onToggle, onAnalyze, isSelected }) => {
    const { t } = useTranslation();
    const date = new Date(match.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    const time = new Date(match.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const h = Math.floor(match.durationSeconds / 3600);
    const m = Math.floor((match.durationSeconds % 3600) / 60);
    const durationStr = h > 0 ? `${h}h ${m}m` : `${m}m`;

    const isWinnerA = match.winner === 'A';
    const isWinnerB = match.winner === 'B';

    const themeA = resolveTheme(match.teamARoster?.color || 'indigo');
    const themeB = resolveTheme(match.teamBRoster?.color || 'rose');
    
    const hexA = getHexFromColor(match.teamARoster?.color || 'indigo');
    const hexB = getHexFromColor(match.teamBRoster?.color || 'rose');

    return (
        <div className="pb-3 px-1 landscape:pb-2 landscape:px-0"> 
            <motion.div 
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                // Removing backdrop-blur and transition-all to fix performance blur
                className={`group relative rounded-2xl landscape:rounded-xl shadow-sm hover:shadow-md transition-colors border ${isSelected ? 'bg-indigo-50/80 dark:bg-indigo-500/10 border-indigo-500/30' : 'bg-white dark:bg-white/[0.03] border-transparent hover:bg-white/80 dark:hover:bg-white/[0.05]'}`}
            >
                {/* Subtle Gradient Backing */}
                {isWinnerA && !isSelected && (
                    <div className="absolute inset-0 opacity-[0.02] pointer-events-none rounded-2xl landscape:rounded-xl transition-colors duration-500" style={{ background: `linear-gradient(135deg, ${hexA}, transparent)` }} />
                )}
                {isWinnerB && !isSelected && (
                    <div className="absolute inset-0 opacity-[0.02] pointer-events-none rounded-2xl landscape:rounded-xl transition-colors duration-500" style={{ background: `linear-gradient(135deg, ${hexB}, transparent)` }} />
                )}

                <div 
                    className="relative z-10 p-4 landscape:p-3 cursor-pointer flex flex-col gap-3 landscape:gap-2"
                    onClick={onToggle}
                >
                    <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-widest text-slate-400">
                        <div className="flex items-center gap-2">
                            <span>{date}</span>
                            <span className="w-0.5 h-0.5 rounded-full bg-slate-300 dark:bg-slate-700"></span>
                            <span>{time}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Clock size={10} /> {durationStr}
                        </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 w-full">
                        <div className={`flex-1 min-w-0 flex items-center justify-end gap-2 text-right ${isWinnerA ? 'opacity-100' : 'opacity-60 grayscale-[0.3]'}`}>
                            <span className={`text-xs sm:text-sm font-bold truncate leading-tight ${isWinnerA ? `${themeA.text} ${themeA.textDark}` : 'text-slate-600 dark:text-slate-400'}`}>{match.teamAName}</span>
                            {isWinnerA && <Crown size={12} className={`${themeA.crown} flex-shrink-0`} fill="currentColor" />}
                        </div>

                        <div className="flex-shrink-0 flex flex-col items-center justify-center px-2.5 py-1 bg-slate-100/50 dark:bg-black/20 rounded-lg min-w-[50px]">
                            <div className="flex items-center gap-1 font-inter text-sm font-black tabular-nums leading-none">
                                <span className={isWinnerA ? `${themeA.text} ${themeA.textDark}` : 'text-slate-400'}>{match.setsA}</span>
                                <span className="text-slate-300 dark:text-slate-600 text-[10px]">:</span>
                                <span className={isWinnerB ? `${themeB.text} ${themeB.textDark}` : 'text-slate-400'}>{match.setsB}</span>
                            </div>
                        </div>

                        <div className={`flex-1 min-w-0 flex items-center justify-start gap-2 text-left ${isWinnerB ? 'opacity-100' : 'opacity-60 grayscale-[0.3]'}`}>
                            {isWinnerB && <Crown size={12} className={`${themeB.crown} flex-shrink-0`} fill="currentColor" />}
                            <span className={`text-xs sm:text-sm font-bold truncate leading-tight ${isWinnerB ? `${themeB.text} ${themeB.textDark}` : 'text-slate-600 dark:text-slate-400'}`}>{match.teamBName}</span>
                        </div>
                    </div>

                    {/* Expand Chevron (Only show in Portrait or when explicitly requested) */}
                    <div className={`flex justify-center text-slate-300 dark:text-slate-700 -mt-1 ${isSelected ? 'text-indigo-400' : ''}`}>
                        {isExpanded ? <ChevronUp size={14} /> : (isSelected ? <div className="w-1 h-1 rounded-full bg-indigo-400" /> : <ChevronDown size={14} />)}
                    </div>
                </div>

                <AnimatePresence>
                    {isExpanded && (
                        <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="relative z-10 border-t border-black/5 dark:border-white/5 bg-slate-50/50 dark:bg-black/10"
                        >
                            <div className="p-4 landscape:p-3 flex flex-col items-center space-y-4 landscape:space-y-3">
                                
                                <div className="w-full overflow-x-auto pb-1 no-scrollbar flex justify-center">
                                    <div className="flex gap-2">
                                        {match.sets.map((set, idx) => {
                                            const isSetWinnerA = set.winner === 'A';
                                            const setTheme = isSetWinnerA ? themeA : themeB;
                                            return (
                                                <div key={idx} className="flex flex-col items-center flex-shrink-0">
                                                    <span className="text-[8px] font-bold text-slate-300 uppercase mb-1">{t('history.setLabel', {setNumber: set.setNumber})}</span>
                                                    <div className={`
                                                        min-w-[3rem] text-center px-1.5 py-1.5 rounded-lg text-[10px] font-black border backdrop-blur-sm shadow-sm tabular-nums
                                                        ${setTheme.bg} ${setTheme.text} ${setTheme.textDark} ${setTheme.border}
                                                    `}>
                                                        {set.scoreA}-{set.scoreB}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 w-full">
                                    {/* Analysis Button - Hidden in Landscape Split View since selection works there */}
                                    <Button 
                                        onClick={(e) => { e.stopPropagation(); onAnalyze(); }}
                                        className="flex-1 bg-slate-800 text-white hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 shadow-lg active:scale-95 h-9 text-[10px] landscape:hidden"
                                        size="sm"
                                    >
                                        <BarChart2 size={14} /> {t('historyList.analysis')}
                                    </Button>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); onDelete(match.id); }}
                                        className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all border border-rose-500/20 active:scale-95 flex-1 landscape:flex-none"
                                        title={t('historyList.delete')}
                                    >
                                        <Trash2 size={14} className="mx-auto" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
});

// --- MAIN COMPONENT ---

type FilterType = 'all' | 'A' | 'B' | 'scouted';
type SortType = 'newest' | 'oldest' | 'longest' | 'shortest';

export const HistoryList: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
    const { matches, deleteMatch, addMatch, importJSON, exportJSON } = useHistoryStore();
    const { t } = useTranslation();
    
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<FilterType>('all');
    const [sortOrder, setSortOrder] = useState<SortType>('newest');
    
    // UI State
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
    const [showMobileDetail, setShowMobileDetail] = useState(false);
    const [showStats, setShowStats] = useState(false);
    const [importMsg, setImportMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [deletedMatch, setDeletedMatch] = useState<Match | null>(null);
    const [showUndoToast, setShowUndoToast] = useState(false);
    
    // SCROLL HEADER LOGIC
    const [showHeader, setShowHeader] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);
    const lastScrollY = useRef(0);

    const onScroll = useCallback(() => {
        if (!scrollRef.current) return;
        const currentY = scrollRef.current.scrollTop;
        const diff = currentY - lastScrollY.current;

        // Bounce protection (iOS)
        if (currentY < 0) return;

        if (diff > 10 && showHeader && currentY > 50) { // Scroll Down & not at top
            setShowHeader(false);
        } else if (diff < -5 && !showHeader) { // Scroll Up
            setShowHeader(true);
        }
        lastScrollY.current = currentY;
    }, [showHeader]);
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    const filteredMatches = useMemo(() => {
        let filtered = matches.filter(m => {
            const matchesSearch = 
                m.teamAName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                m.teamBName.toLowerCase().includes(searchTerm.toLowerCase());
            
            let matchesFilter = true;
            if (filterType === 'A') matchesFilter = m.winner === 'A';
            if (filterType === 'B') matchesFilter = m.winner === 'B';
            if (filterType === 'scouted') {
                matchesFilter = (m.actionLog || []).some((log: any) => log.type === 'POINT' && log.playerId);
            }

            return matchesSearch && matchesFilter;
        });

        return filtered.sort((a, b) => {
            if (sortOrder === 'newest') return b.timestamp - a.timestamp;
            if (sortOrder === 'oldest') return a.timestamp - b.timestamp;
            if (sortOrder === 'longest') return b.durationSeconds - a.durationSeconds;
            if (sortOrder === 'shortest') return a.durationSeconds - b.durationSeconds;
            return 0;
        });

    }, [matches, searchTerm, filterType, sortOrder]);

    const handleExportJSON = () => {
        const json = JSON.parse(exportJSON());
        const dateStr = new Date().toISOString().split('T')[0];
        downloadJSON(`volleyscore_backup_${dateStr}`, json);
    };

    const handleExportCSV = () => {
        exportMatchesToCSV(filteredMatches);
    };

    const handleImportClick = () => {
        if (fileInputRef.current) fileInputRef.current.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const content = await parseJSONFile(file);
            const result = importJSON(JSON.stringify(content), { merge: true });
            
            if (result.success) {
                setImportMsg({ type: 'success', text: t('historyList.importSuccess') });
            } else {
                setImportMsg({ type: 'error', text: result.errors?.[0] || t('historyList.importError') });
            }
        } catch (err) {
            setImportMsg({ type: 'error', text: t('historyList.importError') });
        }
        
        if (fileInputRef.current) fileInputRef.current.value = '';
        setTimeout(() => setImportMsg(null), 3000);
    };

    const handleItemClick = (match: Match) => {
        setExpandedId(prev => prev === match.id ? null : match.id);
        setSelectedMatch(match);
    };

    const handleAnalyze = (match: Match) => {
        setSelectedMatch(match);
        setShowMobileDetail(true);
    };

    const handleDelete = (id: string) => {
        const match = matches.find(m => m.id === id);
        if (match) {
            setDeletedMatch(match);
            deleteMatch(id);
            setShowUndoToast(true);
            if (selectedMatch?.id === id) {
                setSelectedMatch(null);
                setShowMobileDetail(false);
            }
        }
    };

    const handleUndoDelete = () => {
        if (deletedMatch) {
            addMatch(deletedMatch);
            setDeletedMatch(null);
            setShowUndoToast(false);
        }
    };
    
    const filterOptions = [
        { value: 'all', label: t('historyList.filters.all') },
        { value: 'A', label: t('historyList.filters.winnerA') },
        { value: 'B', label: t('historyList.filters.winnerB') },
        { value: 'scouted', label: t('historyList.filters.scouted') },
    ];

    const sortOptions = [
        { value: 'newest', label: t('historyList.sort.newest') },
        { value: 'oldest', label: t('historyList.sort.oldest') },
        { value: 'longest', label: t('historyList.sort.longest') },
        { value: 'shortest', label: t('historyList.sort.shortest') },
    ];

    return (
        <div ref={scrollRef} onScroll={onScroll} className="flex flex-col h-full min-h-[50vh] overflow-y-auto custom-scrollbar relative">
            <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleFileChange} />
            <Suspense fallback={null}><TeamStatsModal isOpen={showStats} onClose={() => setShowStats(false)} /></Suspense>
            <NotificationToast visible={showUndoToast} type="info" mainText={t('teamManager.playerRemoved')} subText={t('common.undo')} onClose={() => setShowUndoToast(false)} systemIcon="delete" onUndo={handleUndoDelete} />

            {/* SPLIT VIEW CONTAINER */}
            <div className={`flex flex-col landscape:flex-row h-full overflow-visible ${selectedMatch ? 'landscape:gap-0' : ''}`}>
                
                {/* LEFT PANEL (LIST) */}
                <div className={`flex-col h-full w-full landscape:w-[320px] lg:landscape:w-[380px] landscape:border-r border-black/5 dark:border-white/5 ${showMobileDetail ? 'hidden landscape:flex' : 'flex'}`}>
                    
                    {/* SMART HEADER (Sticky inside scroll container) */}
                    {/* UPDATED: FULL TRANSPARENCY AS REQUESTED */}
                    <div className="sticky top-0 z-50 pt-safe-top pb-1 px-1 mb-1 pointer-events-none">
                        <motion.div 
                            initial={{ y: 0 }}
                            animate={{ y: showHeader ? 0 : -100, opacity: showHeader ? 1 : 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="bg-transparent pb-2 pt-2 px-2 pointer-events-auto flex flex-col gap-2"
                        >
                            {/* Row 1: Search + Close */}
                            <div className="flex gap-2 items-center">
                                <div className="relative flex-1 group">
                                    <div className="absolute inset-0 bg-slate-100 dark:bg-white/5 rounded-xl transition-all group-focus-within:ring-2 group-focus-within:ring-indigo-500/30"></div>
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                    <input 
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder={t('historyList.searchPlaceholder')}
                                        className="relative w-full bg-transparent border-none rounded-xl pl-9 pr-3 py-2 text-xs font-medium text-slate-800 dark:text-white focus:outline-none placeholder:text-slate-400"
                                    />
                                </div>
                                {onClose && (
                                    <button 
                                        onClick={onClose}
                                        className="w-10 h-9 flex items-center justify-center bg-slate-100 dark:bg-black/20 hover:bg-slate-200 dark:hover:bg-white/10 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors active:scale-90 border border-black/5 dark:border-white/5 shadow-sm shrink-0"
                                    >
                                        <X size={18} strokeWidth={2.5} />
                                    </button>
                                )}
                            </div>

                            {/* Row 2: Actions & Filters */}
                            <div className="flex gap-2 items-center">
                                <div className="grid grid-cols-2 gap-2 flex-1 relative z-20">
                                    <CustomSelect value={filterType} onChange={(val) => setFilterType(val as FilterType)} options={filterOptions} icon={<Filter size={12} />} align="left" />
                                    <CustomSelect value={sortOrder} onChange={(val) => setSortOrder(val as SortType)} options={sortOptions} icon={<SortDesc size={12} />} align="right" />
                                </div>
                                <div className="flex gap-1 shrink-0">
                                    <button onClick={() => setShowStats(true)} className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors shadow-sm active:scale-95" title={t('stats.teamStats')}><PieChart size={16} /></button>
                                    <ExportMenu onExportJSON={handleExportJSON} onExportCSV={handleExportCSV} />
                                    <button onClick={handleImportClick} className="p-2.5 rounded-xl bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:text-indigo-500 dark:hover:text-white hover:bg-indigo-50 dark:hover:bg-white/10 transition-colors shadow-sm active:scale-95" title={t('common.import')}><Download size={16} /></button>
                                </div>
                            </div>

                            <AnimatePresence>
                                {importMsg && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className={`text-[10px] px-3 py-2 rounded-lg font-bold flex items-center gap-2 ${importMsg.type === 'success' ? 'bg-emerald-500/20 text-emerald-600' : 'bg-rose-500/20 text-rose-600'}`}>
                                        <AlertCircle size={12} /> {importMsg.text}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </div>

                    {/* List Content */}
                    <div className="flex-1 min-w-0 bg-transparent px-1 pb-safe-bottom pt-2">
                        {filteredMatches.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-64 text-slate-400 opacity-60">
                                <div className="p-4 bg-slate-100 dark:bg-white/5 rounded-full mb-3 border border-slate-200 dark:border-white/10">
                                    <FolderOpen size={32} strokeWidth={1} className="opacity-50" />
                                </div>
                                <h3 className="text-xs font-black uppercase tracking-widest mb-1 opacity-80">{t('historyList.empty')}</h3>
                            </div>
                        ) : (
                            // Using standard mapping instead of Virtuoso here to simplify scroll container logic with sticky header
                            <div className="space-y-2 pb-24">
                                {filteredMatches.map(match => (
                                    <HistoryCard 
                                        key={match.id} 
                                        match={match} 
                                        onDelete={handleDelete}
                                        isExpanded={expandedId === match.id}
                                        isSelected={selectedMatch?.id === match.id}
                                        onToggle={() => handleItemClick(match)}
                                        onAnalyze={() => handleAnalyze(match)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT PANEL - MOBILE PORTAL */}
                {showMobileDetail && selectedMatch && createPortal(
                    <div className="fixed inset-0 z-[70] flex flex-col bg-slate-50/70 dark:bg-[#0f172a]/70 backdrop-blur-xl animate-in slide-in-from-bottom-5 duration-200 overflow-hidden landscape:hidden">
                        <MatchDetail match={selectedMatch} onBack={() => setShowMobileDetail(false)} />
                    </div>,
                    document.body
                )}

                {/* RIGHT PANEL - DESKTOP/LANDSCAPE */}
                <div className={`hidden landscape:flex landscape:flex-1 landscape:h-full landscape:overflow-hidden landscape:relative landscape:z-40 landscape:bg-transparent`}>
                    {selectedMatch ? (<MatchDetail match={selectedMatch} onBack={() => setShowMobileDetail(false)} />) : (<div className="hidden landscape:flex flex-1 items-center justify-center bg-transparent text-slate-300 dark:text-slate-700"><div className="flex flex-col items-center gap-4"><BarChart2 size={64} strokeWidth={1} className="opacity-20" /><p className="text-sm font-bold uppercase tracking-widest opacity-40">{t('history.welcomeDesc')}</p></div></div>)}
                </div>
            </div>
        </div>
    );
};
