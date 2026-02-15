


import React, { useEffect, useRef, useState, memo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { TeamColor, SkillType } from '@types';
import { resolveTheme, getHexFromColor } from '@lib/utils/colors';
import {
    Swords, Shield, Target, AlertTriangle, CheckCircle2, Mic,
    AlertCircle, HelpCircle, X, Sparkles, ArrowRightLeft, Save,
    Ban, RotateCcw, Trash2, UserPlus, Users, PartyPopper,
    Download
} from 'lucide-react';
import { useTranslation } from '@contexts/LanguageContext';
import { useNotification } from '@contexts/NotificationContext';

// --- ANIMATION CONFIG (Spring) ---
const TOAST_ANIMATION = {
    initial: { opacity: 0, y: -24, scale: 0.95, filter: 'blur(10px)' },
    animate: { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' },
    exit: { opacity: 0, scale: 0.9, y: -10, filter: 'blur(10px)', transition: { duration: 0.2 } },
    transition: {
        type: "spring",
        stiffness: 500,
        damping: 30,
        mass: 0.8
    }
};

interface NotificationToastProps {
    isFullscreen?: boolean;
}

const skillIcons: Record<SkillType | 'generic', any> = {
    attack: Swords,
    block: Shield,
    ace: Target,
    opponent_error: AlertTriangle,
    generic: CheckCircle2
};

const systemIconsMap: Record<string, any> = {
    transfer: ArrowRightLeft,
    save: Download,
    mic: Mic,
    alert: AlertCircle,
    block: Ban,
    undo: RotateCcw,
    delete: Trash2,
    add: UserPlus,
    roster: Users,
    party: PartyPopper
};

export const NotificationToast: React.FC<NotificationToastProps> = memo(({
    isFullscreen
}) => {
    const { t } = useTranslation();
    const {
        state: { visible, type, mainText, subText, color: teamColor, skill, systemIcon, onUndo, timestamp },
        hideNotification
    } = useNotification();

    const onCloseRef = useRef(hideNotification);
    const [mounted, setMounted] = useState(false);
    const duration = 3000; // default duration (internal)

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    useEffect(() => {
        onCloseRef.current = hideNotification;
    }, [hideNotification]);

    useEffect(() => {
        if (visible) {
            const isThinking = mainText === "Thinking..." || mainText === t('notifications.thinking');
            if (isThinking) return;

            const finalDuration = (type === 'error' || onUndo) ? 4000 : duration;
            const timer = setTimeout(() => {
                onCloseRef.current();
            }, finalDuration);

            return () => clearTimeout(timer);
        }
    }, [visible, duration, type, mainText, onUndo, t, timestamp]); // depend on timestamp to reset timer on new same notification

    if (!mounted) return null;

    let theme = {
        gradient: 'bg-gradient-to-b from-white/95 to-slate-50/95 dark:from-slate-800/95 dark:to-slate-900/95',
        border: 'border-white/40 dark:border-white/10',
        activeBorder: 'border-slate-200 dark:border-slate-700',
        iconBg: 'bg-slate-100 dark:bg-white/5',
        iconColor: 'text-slate-600 dark:text-slate-400',
        textColor: 'text-slate-700 dark:text-slate-200',
        labelColor: 'text-slate-500 dark:text-slate-500',
        Icon: HelpCircle,
        shadow: 'shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)]',
        glow: '' // Inner glow or colored shadow
    };

    if (type === 'success' && teamColor) {
        const resolved = resolveTheme(teamColor);
        const hex = getHexFromColor(teamColor);
        theme = {
            gradient: 'bg-gradient-to-b from-white/95 to-slate-50/95 dark:from-slate-800/95 dark:to-slate-900/95',
            border: resolved.border, // Tinted border
            activeBorder: resolved.border,
            iconBg: `${resolved.bg} ${resolved.bgDark}`,
            iconColor: `${resolved.text} ${resolved.textDark}`,
            textColor: `${resolved.text} ${resolved.textDark}`,
            labelColor: `${resolved.text} ${resolved.textDark}`, // Matching label for specialized toasts
            Icon: skillIcons[skill || 'generic'],
            shadow: `shadow-[0_8px_32px_-8px_${hex}40]`, // Colored shadow
            glow: `shadow-[inset_0_0_20px_${hex}10]` // Inner tint
        };
    } else if (type === 'error') {
        theme = {
            gradient: 'bg-gradient-to-b from-rose-50/95 to-rose-100/95 dark:from-slate-800/95 dark:to-slate-900/95',
            border: 'border-rose-200 dark:border-rose-500/20',
            activeBorder: 'border-rose-300 dark:border-rose-500/30',
            iconBg: 'bg-rose-100 dark:bg-rose-500/10',
            iconColor: 'text-rose-600 dark:text-rose-500',
            textColor: 'text-rose-800 dark:text-rose-200',
            labelColor: 'text-rose-500 dark:text-rose-400',
            Icon: AlertCircle,
            shadow: 'shadow-[0_8px_32px_-8px_rgba(244,63,94,0.3)]',
            glow: 'shadow-[inset_0_0_20px_rgba(244,63,94,0.1)]'
        };
    } else if (type === 'info') {
        theme = {
            gradient: 'bg-gradient-to-b from-sky-50/95 to-sky-100/95 dark:from-slate-800/95 dark:to-slate-900/95',
            border: 'border-sky-200 dark:border-sky-500/20',
            activeBorder: 'border-sky-300 dark:border-sky-500/30',
            iconBg: 'bg-sky-100 dark:bg-sky-500/10',
            iconColor: 'text-sky-600 dark:text-sky-400',
            textColor: 'text-sky-800 dark:text-sky-200',
            labelColor: 'text-sky-500 dark:text-sky-400',
            Icon: CheckCircle2,
            shadow: 'shadow-[0_8px_32px_-8px_rgba(14,165,233,0.3)]',
            glow: 'shadow-[inset_0_0_20px_rgba(14,165,233,0.1)]'
        };
    }

    // Thinking state overrides
    if (mainText === "Thinking..." || mainText === t('notifications.thinking')) {
        theme.Icon = Sparkles;
        theme.iconBg = 'bg-violet-100 dark:bg-violet-500/10';
        theme.iconColor = 'text-violet-600 dark:text-violet-400';
        theme.border = 'border-violet-200 dark:border-violet-500/20';
        theme.textColor = 'text-violet-700 dark:text-violet-200';
        theme.shadow = 'shadow-[0_8px_32px_-8px_rgba(139,92,246,0.25)]';
    }

    // System Icon Overrides
    if (systemIcon && systemIconsMap[systemIcon]) {
        theme.Icon = systemIconsMap[systemIcon];
        // We can keep the base theme or tinted theme depending on preference.
        // For system icons, usually keeping them clean (White/Dark card) but with tinted icons is best.

        // Reset to base cleaner card if it was Success/Info but triggered by system
        if (type === 'success' || type === 'info') {
            theme.gradient = 'bg-gradient-to-b from-white/95 to-slate-50/95 dark:from-slate-800/95 dark:to-slate-900/95';
            theme.border = 'border-slate-200 dark:border-white/10';
            theme.shadow = 'shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)]';
            theme.glow = '';
        }

        if (systemIcon === 'transfer') {
            theme.iconBg = 'bg-amber-100 dark:bg-amber-500/10';
            theme.iconColor = 'text-amber-600 dark:text-amber-500';
            theme.labelColor = 'text-amber-600/70 dark:text-amber-500/70';
        } else if (systemIcon === 'save') {
            theme.iconBg = 'bg-emerald-100 dark:bg-emerald-500/10';
            theme.iconColor = 'text-emerald-600 dark:text-emerald-500';
            theme.labelColor = 'text-emerald-600/70 dark:text-emerald-500/70';
        } else if (['block', 'delete'].includes(systemIcon)) {
            theme.iconBg = 'bg-rose-100 dark:bg-rose-500/10';
            theme.iconColor = 'text-rose-600 dark:text-rose-500';
            theme.labelColor = 'text-rose-600/70 dark:text-rose-500/70';
        } else if (systemIcon === 'mic') {
            theme.iconBg = 'bg-red-100 dark:bg-red-500/10';
            theme.iconColor = 'text-red-600 dark:text-red-500 animate-pulse';
            theme.labelColor = 'text-red-600/70 dark:text-red-500/70';
        }
    }

    let topLabel = '';
    let bottomLabel = mainText;

    if (type === 'success' && !systemIcon) {
        const labelKey = skill ? `scout.labels.${skill}` : 'scout.labels.generic';
        topLabel = subText || t(labelKey);
    } else if (type === 'error') {
        topLabel = subText || 'Error';
        bottomLabel = mainText ? mainText : t('errors.genericTitle');
    } else {
        topLabel = subText || 'Info';
        bottomLabel = mainText;
    }

    const positionClass = isFullscreen
        ? 'top-6'
        : 'top-4 supports-[padding-top:env(safe-area-inset-top)]:top-[calc(env(safe-area-inset-top)+12px)]';

    const containerClass = `
      pointer-events-auto
      flex items-center gap-3 pl-3 pr-5 py-2.5
      rounded-2xl
      backdrop-blur-2xl
      ${theme.gradient}
      ${theme.border} border
      ${theme.shadow} ${theme.glow}
      ring-1 ring-black/5 dark:ring-white/5
      min-w-[180px] w-auto max-w-sm h-auto
      cursor-pointer active:scale-95 transition-transform
    `;

    return createPortal(
        <div className="fixed inset-0 pointer-events-none z-[10000] flex justify-center overflow-visible">
            <AnimatePresence>
                {visible && (
                    <motion.div
                        key={timestamp}
                        {...TOAST_ANIMATION}
                        className={`absolute ${positionClass}`}
                        onClick={hideNotification}
                    >
                        <div className={containerClass}>

                            {/* Floating Icon Container */}
                            <div className={`
                                relative w-10 h-10 rounded-xl flex items-center justify-center shrink-0
                                ${theme.iconBg} 
                                shadow-sm
                            `}>
                                <theme.Icon size={20} className={theme.iconColor} strokeWidth={2} />

                                {type === 'success' && !systemIcon && (
                                    <motion.div
                                        className={`absolute inset-0 rounded-xl ${theme.iconBg}`}
                                        animate={{ scale: [1, 1.2], opacity: [0.5, 0] }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                                    />
                                )}
                                {(mainText === "Thinking..." || mainText === t('notifications.thinking')) && (
                                    <motion.div
                                        className={`absolute inset-0 rounded-xl border-2 border-violet-500/50 border-t-transparent`}
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                    />
                                )}
                            </div>

                            <div className="flex flex-col justify-center mr-2 flex-1 min-w-0">
                                {topLabel && (
                                    <span className={`text-[10px] font-bold uppercase tracking-widest leading-none mb-1 whitespace-normal ${theme.labelColor}`}>
                                        {topLabel}
                                    </span>
                                )}
                                <span className={`text-sm font-semibold leading-tight tracking-tight ${theme.textColor} whitespace-normal break-words`}>
                                    {bottomLabel}
                                </span>
                            </div>

                            {onUndo ? (
                                <button
                                    onClick={(e) => { e.stopPropagation(); onUndo(); hideNotification(); }}
                                    className="shrink-0 pl-4 border-l border-slate-200 dark:border-white/10 flex flex-col items-center justify-center hover:opacity-70 active:scale-95 transition-all group"
                                >
                                    <RotateCcw size={16} className="text-indigo-500 dark:text-indigo-400 mb-0.5 group-hover:-rotate-90 transition-transform" />
                                    <span className="text-[9px] font-black uppercase tracking-wider text-indigo-500 dark:text-indigo-400">{t('teamManager.undo')}</span>
                                </button>
                            ) : (
                                <div className="shrink-0 pl-2">
                                    {/* Spacer */}
                                </div>
                            )}

                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>,
        document.body
    );
});

