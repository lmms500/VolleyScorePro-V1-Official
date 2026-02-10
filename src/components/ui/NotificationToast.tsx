
import React, { useEffect, useRef, useState, memo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { TeamColor, SkillType } from '../../types';
import { resolveTheme, getHexFromColor } from '../../utils/colors';
import {
    Swords, Shield, Target, AlertTriangle, CheckCircle2, Mic,
    AlertCircle, HelpCircle, X, Sparkles, ArrowRightLeft, Save,
    Ban, RotateCcw, Trash2, UserPlus, Users, PartyPopper,
    Download
} from 'lucide-react';
import { useTranslation } from '../../contexts/LanguageContext';

// --- ANIMATION CONFIG (Spring) ---
const TOAST_ANIMATION = {
    initial: { opacity: 0, y: -20, scale: 0.96, filter: 'blur(8px)' },
    animate: { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' },
    exit: { opacity: 0, scale: 0.95, filter: 'blur(4px)', transition: { duration: 0.15 } },
    transition: {
        type: "spring",
        stiffness: 420,
        damping: 32,
        mass: 1
    }
};

interface NotificationToastProps {
    visible: boolean;
    type: 'success' | 'error' | 'info';
    mainText: string;
    subText?: string;
    teamColor?: TeamColor;
    skill?: SkillType;
    onClose: () => void;
    duration?: number;
    isFullscreen?: boolean;
    systemIcon?: 'transfer' | 'save' | 'mic' | 'alert' | 'block' | 'undo' | 'delete' | 'add' | 'roster' | 'party';
    onUndo?: () => void;
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
    save: Download, // Changed to Download/Image icon logic handled below if needed, keeping Save for generic save
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
    visible, type, mainText, subText, teamColor, skill, onClose, duration = 3000, isFullscreen, systemIcon, onUndo
}) => {
    const onCloseRef = useRef(onClose);
    const [mounted, setMounted] = useState(false);
    const { t } = useTranslation();

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    useEffect(() => {
        onCloseRef.current = onClose;
    }, [onClose]);

    useEffect(() => {
        if (visible) {
            // Keep "Thinking" state visible until manually cleared or updated
            const isThinking = mainText === "Thinking..." || mainText === t('notifications.thinking');
            if (isThinking) return;

            // Error toasts persist longer to be read
            const finalDuration = (type === 'error' || onUndo) ? 4000 : duration;
            const timer = setTimeout(() => {
                onCloseRef.current();
            }, finalDuration);

            return () => clearTimeout(timer);
        }
    }, [visible, duration, type, mainText, onUndo, t]);

    if (!mounted) return null;

    let theme = {
        iconBg: 'bg-white/10',
        iconColor: 'text-slate-600 dark:text-slate-300',
        textColor: 'text-slate-800 dark:text-gray-100',
        borderColor: 'border-white/20',
        halo: 'bg-slate-500',
        Icon: HelpCircle,
        shadowColor: 'shadow-black/20' // Default shadow
    };

    if (type === 'success' && teamColor) {
        const resolved = resolveTheme(teamColor);
        const hex = getHexFromColor(teamColor);
        theme = {
            iconBg: resolved.bg,
            iconColor: resolved.textDark,
            textColor: resolved.textDark,
            borderColor: resolved.border,
            halo: resolved.halo,
            Icon: skillIcons[skill || 'generic'],
            shadowColor: `shadow-[${hex}]/20` // Dynamic shadow approximation
        };
        // Fallback for dynamic shadow if needed, but Tailwind arbitrary values work if configured. 
        // For safety, let's use a standard nice shadow for success.
        theme.shadowColor = 'shadow-emerald-500/20';
    } else if (type === 'error') {
        theme = {
            iconBg: 'bg-rose-500/10',
            iconColor: 'text-rose-500',
            textColor: 'text-rose-200',
            borderColor: 'border-rose-500/20',
            halo: 'bg-rose-500',
            Icon: AlertCircle,
            shadowColor: 'shadow-rose-500/20'
        };
    } else if (type === 'info') {
        theme = {
            iconBg: 'bg-sky-500/10',
            iconColor: 'text-sky-400',
            textColor: 'text-sky-200',
            borderColor: 'border-white/10',
            halo: 'bg-sky-500',
            Icon: CheckCircle2,
            shadowColor: 'shadow-sky-500/20'
        };
    }

    // Handle "Thinking" state
    if (mainText === "Thinking..." || mainText === t('notifications.thinking')) {
        theme.Icon = Sparkles;
        theme.iconBg = 'bg-violet-500/10';
        theme.iconColor = 'text-violet-400';
        theme.borderColor = 'border-violet-500/20';
        theme.textColor = 'text-violet-200';
        theme.shadowColor = 'shadow-violet-500/20';
    }

    // Apply System Icon Override if provided
    if (systemIcon && systemIconsMap[systemIcon]) {
        theme.Icon = systemIconsMap[systemIcon];

        // Contextual styling for system icons
        if (systemIcon === 'transfer') {
            theme.iconBg = 'bg-amber-500/10';
            theme.iconColor = 'text-amber-500';
            theme.borderColor = 'border-amber-500/20';
            theme.textColor = 'text-amber-200';
            theme.shadowColor = 'shadow-amber-500/20';
        }
        if (systemIcon === 'save') {
            // Use Success/Emerald styling for Save
            theme.iconBg = 'bg-emerald-500/10';
            theme.iconColor = 'text-emerald-500';
            theme.borderColor = 'border-emerald-500/20';
            theme.textColor = 'text-emerald-200';
            theme.shadowColor = 'shadow-emerald-500/20';
        }
        if (systemIcon === 'block' || systemIcon === 'delete') {
            theme.iconBg = 'bg-rose-500/10';
            theme.iconColor = 'text-rose-500';
            theme.borderColor = 'border-rose-500/20';
            theme.textColor = 'text-rose-200';
            theme.shadowColor = 'shadow-rose-500/20';
        }
        if (systemIcon === 'mic') {
            theme.iconBg = 'bg-red-500/10';
            theme.iconColor = 'text-red-500 animate-pulse';
            theme.borderColor = 'border-red-500/20';
            theme.textColor = 'text-red-200';
            theme.shadowColor = 'shadow-red-500/20';
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

    // Safe Area Logic using Tailwind arbitrary values for env()
    // Fallback included in the class logic implicitly if env is not supported by browser (it treats as 0 usually or fails silently).
    // isFullscreen forces a fixed top position to avoid status bar overlap if immersive mode behaves oddly,
    // otherwise we try to respect the safe area.
    // The spec says: isFullscreen ? 'top-6' : 'top-[calc(env(safe-area-inset-top)+12px)]'
    const positionClass = isFullscreen
        ? 'top-6'
        : 'top-4 supports-[padding-top:env(safe-area-inset-top)]:top-[calc(env(safe-area-inset-top)+12px)]';

    const containerClass = `
      pointer-events-auto
      flex items-center gap-3 pl-3 pr-5 py-3
      rounded-2xl
      bg-slate-900/90 backdrop-blur-xl
      ${theme.borderColor} border
      shadow-2xl ${theme.shadowColor}
      ring-1 ring-white/5
      min-w-[180px] w-auto max-w-sm h-auto
      cursor-pointer active:scale-95 transition-transform
    `;

    return createPortal(
        <div className="fixed inset-0 pointer-events-none z-[10000] flex justify-center overflow-visible">
            <AnimatePresence>
                {visible && (
                    <motion.div
                        key="notification-toast"
                        {...TOAST_ANIMATION}
                        className={`absolute ${positionClass}`}
                        onClick={onClose}
                    >
                        <div className={containerClass}>

                            <div className={`
                                relative w-10 h-10 rounded-full flex items-center justify-center shrink-0
                                ${theme.iconBg} ${theme.borderColor} border
                            `}>
                                <theme.Icon size={20} className={theme.iconColor} strokeWidth={2} />

                                {type === 'success' && !systemIcon && (
                                    <motion.div
                                        className={`absolute inset-0 rounded-full ${theme.iconBg}`}
                                        animate={{ scale: [1, 1.4], opacity: [0.3, 0] }}
                                        transition={{ duration: 1.5, repeat: Infinity }}
                                    />
                                )}
                                {(mainText === "Thinking..." || mainText === t('notifications.thinking')) && (
                                    <motion.div
                                        className={`absolute inset-0 rounded-full border-2 border-violet-500 border-t-transparent`}
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    />
                                )}
                            </div>

                            <div className="flex flex-col justify-center mr-2 flex-1 min-w-0">
                                {topLabel && (
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 leading-none mb-1 whitespace-normal">
                                        {topLabel}
                                    </span>
                                )}
                                <span className={`text-sm font-semibold leading-tight tracking-tight ${theme.textColor} whitespace-normal break-words`}>
                                    {bottomLabel}
                                </span>
                            </div>

                            {onUndo ? (
                                <button
                                    onClick={(e) => { e.stopPropagation(); onUndo(); onClose(); }}
                                    className="shrink-0 pl-4 border-l border-white/10 flex flex-col items-center justify-center hover:opacity-70 active:scale-95 transition-all group"
                                >
                                    <RotateCcw size={16} className="text-indigo-400 mb-0.5 group-hover:-rotate-90 transition-transform" />
                                    <span className="text-[9px] font-black uppercase tracking-wider text-indigo-400">{t('teamManager.undo')}</span>
                                </button>
                            ) : (
                                <div className="shrink-0 pl-2 opacity-30">
                                    {/* Minimal indicator or nothing, keeping clean */}
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
