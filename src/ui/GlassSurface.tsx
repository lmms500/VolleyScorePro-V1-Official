
import React from 'react';
import { motion, HTMLMotionProps, Transition } from 'framer-motion';
import { usePerformanceSafe } from '@contexts/PerformanceContext';

interface GlassSurfaceProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  intensity?: 'low' | 'medium' | 'high' | 'transparent';
  /** @deprecated Prefer PerformanceContext. Kept for backward compat - overrides context when explicitly set. */
  lowGraphics?: boolean;
  layout?: boolean | "position" | "size" | "preserve-aspect";
  layoutId?: string;
  transition?: Transition;
}

export const GlassSurface: React.FC<GlassSurfaceProps> = ({
  children,
  className = '',
  intensity = 'medium',
  lowGraphics: lowGraphicsProp,
  style,
  ...props
}) => {
  const { config: perf, isLowGraphics } = usePerformanceSafe();

  // Resolve: explicit prop overrides context
  const lowGraphics = lowGraphicsProp ?? isLowGraphics;

  const allowOverflow = className.includes('overflow-visible');
  const overflowClass = allowOverflow ? '' : 'overflow-hidden';

  // Adaptive blur class based on performance mode
  const blurClass = perf.visual.backdropBlur === 'none' ? ''
    : perf.visual.backdropBlur === 'sm' ? 'backdrop-blur-sm'
      : 'backdrop-blur-xl';

  const blur2xlClass = perf.visual.backdropBlur === 'none' ? ''
    : perf.visual.backdropBlur === 'sm' ? 'backdrop-blur-lg'
      : 'backdrop-blur-2xl';

  // Shadow classes based on performance mode
  const shadowMd = perf.visual.boxShadows === 'none' ? '' : 'shadow-md';

  // NEO-GLASS 3.0: Premium Tokens (Adaptive)
  const intensityMap = {
    // Low: Subtle gradient + adaptive blur
    low: `${overflowClass} bg-gradient-to-br from-white/10 to-white/5 dark:from-white/[0.05] dark:to-white/[0.02] ${blurClass || 'backdrop-blur-lg'} border border-white/20 dark:border-white/5 ${shadowMd}`,

    // Medium: Standard Glass - Double Border + Top Shine (adaptive)
    medium: `${overflowClass}
      bg-gradient-to-br from-white/15 to-white/5
      dark:bg-gradient-to-br dark:from-white/[0.08] dark:to-white/[0.02]
      ${blurClass}
      border border-white/20 dark:border-white/10
      ring-1 ring-inset ring-white/10 dark:ring-white/5
      ${perf.visual.boxShadows === 'none' ? '' : perf.visual.boxShadows === 'simple' ? 'shadow-md' : 'shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),inset_0_1px_0_0_rgba(255,255,255,0.15)]'}`,

    // High: Deep Glass - Stronger Gradients + Heavier Shadows (adaptive)
    high: `${overflowClass}
      bg-gradient-to-br from-white/95 to-slate-50/90
      dark:bg-gradient-to-br dark:from-slate-900/95 dark:to-slate-900/85
      ${blur2xlClass}
      border border-white/30 dark:border-white/10
      ring-1 ring-inset ring-white/20 dark:ring-white/5
      ${perf.visual.boxShadows === 'none' ? '' : perf.visual.boxShadows === 'simple' ? 'shadow-lg' : 'shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5),inset_0_1px_0_0_rgba(255,255,255,0.25)]'}`,

    transparent: 'bg-transparent border-none shadow-none ring-0 backdrop-blur-none'
  };

  // FLAT DESIGN (Performance Optimized for Low Graphics / REDUZIR_MOVIMENTO)
  const lowGraphicsMap = {
    low: `${overflowClass} bg-slate-100 dark:bg-[#0f172a] border border-slate-200 dark:border-white/10`,
    medium: `${overflowClass} bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-white/10`,
    high: `${overflowClass} bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-white/10 border-b-4`,
    transparent: 'bg-transparent border-none shadow-none'
  };

  const styleClass = lowGraphics ? lowGraphicsMap[intensity] : intensityMap[intensity];

  // PERFORMANCE: Only promote to GPU layer when actually animating (layout/layoutId)
  // AND when the performance mode allows it.
  const isAnimating = !!(props.layout || props.layoutId);
  const hardwareStyle: React.CSSProperties = {
    ...style,
    ...(isAnimating && perf.gpu.willChange ? {
      willChange: 'transform',
      backfaceVisibility: 'hidden' as const,
    } : {}),
  };

  return (
    <motion.div
      className={`
        relative
        ${styleClass}
        render-crisp
        ${className}
      `}
      style={hardwareStyle}
      {...props}
    >
      {/* Dynamic Noise - Disabled in Low Graphics or when noiseTexture is off */}
      {!lowGraphics && perf.visual.noiseTexture && intensity !== 'transparent' && (
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.02] pointer-events-none mix-blend-overlay"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
        />
      )}

      <div className={`relative z-10 w-full min-h-0 flex-1 ${className.includes('flex') ? 'flex flex-col' : 'block'}`}>
        {children}
      </div>
    </motion.div>
  );
};
