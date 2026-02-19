
/**
 * VolleyScore Pro - Premium Design Tokens
 *
 * Extracted from ScoutModal + ProfileDetailsModal design language.
 * Reusable tokens for consistent premium styling across the entire app.
 */

// --- SPRING CONFIGS ---
export const scoutSpring = {
    type: "spring" as const,
    damping: 25,
    stiffness: 300,
    mass: 0.8
};

export const scoutSpringSnappy = {
    type: "spring" as const,
    damping: 30,
    stiffness: 400,
    mass: 0.5
};

export const scoutSpringBouncy = {
    type: "spring" as const,
    damping: 20,
    stiffness: 300,
    mass: 1
};

// --- CLOSE BUTTON (Scout Modal Pattern) ---
export const closeButtonClasses = "w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white hover:from-red-600 hover:to-red-700 active:scale-95 transition-all shadow-xl shadow-red-500/30 group";
export const closeButtonIconClasses = "group-hover:rotate-90 transition-transform duration-300";

// --- ICON BOX (Gradient icon container) ---
export const iconBoxClasses = (from: string, to: string) =>
    `inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-${from} to-${to} shadow-xl shadow-${from}/30`;

export const iconBoxSizes = {
    xs: "w-7 h-7",
    sm: "w-9 h-9",
    md: "w-12 h-12",
    lg: "w-14 h-14"
};

// --- GLASS CONTAINER ---
export const glassContainerClasses = "bg-white/40 dark:bg-white/5 border border-white/50 dark:border-white/5 backdrop-blur-xl rounded-2xl shadow-sm ring-1 ring-inset ring-white/10 dark:ring-white/5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15)]";

export const glassContainerInteractive = "hover:shadow-md hover:scale-[1.01] transition-all duration-300";

// --- GRADIENT TEXT ---
export const gradientTextClasses = (from: string, to: string) =>
    `bg-gradient-to-r from-${from} to-${to} bg-clip-text text-transparent`;

// --- ACTIVE / SELECTED STATE ---
export const activeStateClasses = (color: string) =>
    `bg-gradient-to-br from-${color}-500 to-${color}-600 text-white shadow-lg shadow-${color}-500/30 ring-1 ring-inset ring-white/10 border-${color}-400/20`;

// --- SHIMMER EFFECT CLASSES ---
export const shimmerClasses = "absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700 skew-x-12 pointer-events-none";

export const shimmerClassesFast = "absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-500 skew-x-12 pointer-events-none";

// --- BACKGROUND ORB (Animated hover glow) ---
export const backgroundOrbClasses = (color: string) =>
    `absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full blur-3xl bg-${color}-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 group-hover:scale-150 pointer-events-none`;

// --- SECTION TITLE ---
export const sectionTitleClasses = "text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500";

export const sectionTitleIconBoxClasses = (from: string, to: string) =>
    `w-7 h-7 rounded-lg bg-gradient-to-br from-${from} to-${to} flex items-center justify-center shadow-lg shadow-${from}/20`;

export const sectionAccentBarClasses = (from: string, to: string) =>
    `w-1 h-5 rounded-full bg-gradient-to-b from-${from} to-${to}`;

// --- INNER HIGHLIGHT (Premium glass depth) ---
export const innerHighlight = "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15)]";
export const innerHighlightStrong = "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.25)]";

// --- PREMIUM BORDERS ---
export const premiumBorder = "border border-white/50 dark:border-white/5 ring-1 ring-inset ring-white/10 dark:ring-white/5";
export const premiumBorderInteractive = "border border-white/40 dark:border-white/10 ring-1 ring-inset ring-white/5 dark:ring-white/5 hover:border-white/60 dark:hover:border-white/20";

// --- GRADIENT BUTTON PATTERNS ---
export const gradientButtonClasses = {
    indigo: "bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/20 ring-1 ring-inset ring-white/10",
    rose: "bg-gradient-to-br from-rose-500 to-rose-600 text-white shadow-lg shadow-rose-500/20 ring-1 ring-inset ring-white/10",
    emerald: "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/20 ring-1 ring-inset ring-white/10",
    amber: "bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/20 ring-1 ring-inset ring-white/10",
    purple: "bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/20 ring-1 ring-inset ring-white/10",
    cyan: "bg-gradient-to-br from-cyan-500 to-cyan-600 text-white shadow-lg shadow-cyan-500/20 ring-1 ring-inset ring-white/10",
    slate: "bg-gradient-to-br from-slate-500 to-slate-600 text-white shadow-lg shadow-slate-500/20 ring-1 ring-inset ring-white/10",
};

// --- STAGGER ANIMATION CONFIG ---
export const staggerConfig = {
    container: {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.04,
                delayChildren: 0.05
            }
        }
    },
    item: {
        hidden: { opacity: 0, y: 12, scale: 0.96 },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: scoutSpring
        }
    }
};

// --- SLIDE VARIANTS (Scout Modal multi-step pattern) ---
export const scoutSlideVariants = {
    enter: (direction: number) => ({
        x: direction > 0 ? "20%" : "-20%",
        opacity: 0,
        scale: 0.98
    }),
    center: {
        x: 0,
        opacity: 1,
        scale: 1,
        transition: { ...scoutSpring, delay: 0.05 }
    },
    exit: (direction: number) => ({
        x: direction < 0 ? "20%" : "-20%",
        opacity: 0,
        scale: 0.98,
        transition: { duration: 0.15, ease: "easeIn" as const }
    })
};

// --- COLOR MAPS for dynamic gradient generation ---
export const colorGradients: Record<string, { from: string; via?: string; to: string }> = {
    indigo: { from: 'indigo-500', via: 'indigo-500', to: 'indigo-600' },
    rose: { from: 'rose-500', via: 'rose-500', to: 'rose-600' },
    emerald: { from: 'emerald-500', via: 'emerald-500', to: 'emerald-600' },
    amber: { from: 'amber-500', via: 'amber-500', to: 'amber-600' },
    purple: { from: 'purple-500', via: 'purple-500', to: 'purple-600' },
    cyan: { from: 'cyan-500', via: 'cyan-500', to: 'cyan-600' },
    slate: { from: 'slate-400', via: 'slate-500', to: 'slate-600' },
};

// --- FOCUS RING (Premium gradient focus) ---
export const focusRingClasses = "focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:ring-offset-2 outline-none";

// --- TAP SCALE ---
export const tapScale = { scale: 0.94 };
export const tapScaleSubtle = { scale: 0.97 };
export const hoverScale = { scale: 1.02 };
export const hoverScaleCard = { scale: 1.01 };
