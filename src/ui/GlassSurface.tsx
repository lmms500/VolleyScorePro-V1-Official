
import React, { useMemo } from 'react';
import { motion, HTMLMotionProps, Transition } from 'framer-motion';
import { usePerformanceSafe } from '@contexts/PerformanceContext';
import { getAnimationConfig, getBlurClass, AnimationConfig } from '@lib/platform/animationConfig';

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
  const animConfig = getAnimationConfig();

  const lowGraphics = lowGraphicsProp ?? isLowGraphics;
  const allowOverflow = className.includes('overflow-visible');
  const overflowClass = allowOverflow ? '' : 'overflow-hidden';

  const isTransparent = intensity === 'transparent';

  const blurRadius = animConfig.blurRadius;

  const intensityStyles = useMemo(() => {
    if (lowGraphics) {
      const lowGraphicsStyles: Record<string, string> = {
        low: `${overflowClass} bg-slate-100 dark:bg-[#0f172a] border border-slate-200 dark:border-white/10`,
        medium: `${overflowClass} bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-white/10`,
        high: `${overflowClass} bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-white/10 border-b-4`,
        transparent: 'bg-transparent border-none shadow-none'
      };
      return lowGraphicsStyles[intensity];
    }

    const highEndStyles: Record<string, string> = {
      low: `${overflowClass} bg-gradient-to-br from-white/10 to-white/5 dark:from-white/[0.05] dark:to-white/[0.02] border border-white/20 dark:border-white/5`,
      medium: `${overflowClass}
        bg-gradient-to-br from-white/15 to-white/5
        dark:bg-gradient-to-br dark:from-white/[0.08] dark:to-white/[0.02]
        border border-white/20 dark:border-white/10
        ring-1 ring-inset ring-white/10 dark:ring-white/5`,
      high: `${overflowClass}
        bg-gradient-to-br from-white/95 to-slate-50/90
        dark:bg-gradient-to-br dark:from-slate-900/95 dark:to-slate-900/85
        border border-white/30 dark:border-white/10
        ring-1 ring-inset ring-white/20 dark:ring-white/5`,
      transparent: 'bg-transparent border-none shadow-none ring-0'
    };
    return highEndStyles[intensity];
  }, [lowGraphics, intensity, overflowClass]);

  const shadowClass = useMemo(() => {
    if (isTransparent || lowGraphics) return '';
    if (perf.visual.boxShadows === 'none') return '';
    if (perf.visual.boxShadows === 'simple') {
      return intensity === 'high' ? 'shadow-lg' : 'shadow-md';
    }
    return intensity === 'high'
      ? 'shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5),inset_0_1px_0_0_rgba(255,255,255,0.25)]'
      : 'shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),inset_0_1px_0_0_rgba(255,255,255,0.15)]';
  }, [intensity, lowGraphics, perf.visual.boxShadows, isTransparent]);

  const isAnimating = !!(props.layout || props.layoutId || props.initial || props.animate);

  const containerStyle: React.CSSProperties = {
    ...style,
    ...(animConfig.useContain && { contain: animConfig.containValue }),
    ...(animConfig.useGPUTransform && { transform: 'translateZ(0)', backfaceVisibility: 'hidden' }),
    ...(isAnimating && { willChange: 'transform, opacity' }),
  };

  const blurLayerStyle: React.CSSProperties = {
    backdropFilter: `blur(${blurRadius}px)`,
    WebkitBackdropFilter: `blur(${blurRadius}px)`,
    position: 'absolute',
    inset: 0,
    zIndex: 0,
    pointerEvents: 'none',
    borderRadius: 'inherit',
    contain: 'strict',
  };

  const showNoiseTexture = !lowGraphics && perf.visual.noiseTexture && intensity !== 'transparent' && !animConfig.isAndroid;

  return (
    <motion.div
      className={`
        relative
        ${intensityStyles}
        ${shadowClass}
        render-crisp
        ${className}
      `}
      style={containerStyle}
      {...props}
    >
      {!isTransparent && !lowGraphics && animConfig.blurRadius > 0 && (
        <div
          className="absolute inset-0 z-0 rounded-inherit"
          style={blurLayerStyle}
          aria-hidden="true"
        />
      )}

      {showNoiseTexture && (
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.02] pointer-events-none mix-blend-overlay z-[1]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            borderRadius: 'inherit',
            contain: 'strict',
          }}
        />
      )}

      <div
        className={`relative z-10 w-full min-h-0 flex-1 ${className.includes('flex') ? 'flex flex-col' : 'block'}`}
        style={animConfig.useContain ? { contain: 'content' } : undefined}
      >
        {children}
      </div>
    </motion.div>
  );
};
