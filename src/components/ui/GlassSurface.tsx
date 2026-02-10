
import React from 'react';
import { motion, HTMLMotionProps, Transition } from 'framer-motion';

interface GlassSurfaceProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  intensity?: 'low' | 'medium' | 'high' | 'transparent';
  lowGraphics?: boolean;
  layout?: boolean | "position" | "size" | "preserve-aspect";
  layoutId?: string;
  transition?: Transition;
}

export const GlassSurface: React.FC<GlassSurfaceProps> = ({
  children,
  className = '',
  intensity = 'medium',
  lowGraphics = false,
  style,
  ...props
}) => {

  const allowOverflow = className.includes('overflow-visible');
  const overflowClass = allowOverflow ? '' : 'overflow-hidden';

  // NEO-GLASS 3.0: Premium Tokens
  const intensityMap = {
    // Low: Subtle gradient + light blur
    low: `${overflowClass} bg-gradient-to-br from-white/10 to-white/5 dark:from-white/[0.05] dark:to-white/[0.02] backdrop-blur-lg border border-white/20 dark:border-white/5 shadow-md`,

    // Medium: Standard Glass - Double Border + Top Shine
    medium: `${overflowClass} 
      bg-gradient-to-br from-white/15 to-white/5 
      dark:bg-gradient-to-br dark:from-white/[0.08] dark:to-white/[0.02]
      backdrop-blur-xl 
      border border-white/20 dark:border-white/10 
      ring-1 ring-inset ring-white/10 dark:ring-white/5
      shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15)]
      shadow-xl shadow-black/10`,

    // High: Deep Glass - Stronger Gradients + Heavier Shadows
    high: `${overflowClass} 
      bg-gradient-to-br from-white/20 to-white/10
      dark:bg-gradient-to-br dark:from-white/[0.12] dark:to-white/[0.03]
      backdrop-blur-2xl 
      border border-white/30 dark:border-white/15 
      ring-1 ring-inset ring-white/20 dark:ring-white/10
      shadow-[inset_0_1px_0_0_rgba(255,255,255,0.25)]
      shadow-2xl shadow-black/30`,

    transparent: 'bg-transparent border-none shadow-none ring-0 backdrop-blur-none'
  };

  // FLAT DESIGN (Performance Optimized for Low Graphics)
  const lowGraphicsMap = {
    low: `${overflowClass} bg-slate-100 dark:bg-[#0f172a] border border-slate-200 dark:border-white/10`,
    medium: `${overflowClass} bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-white/10`,
    high: `${overflowClass} bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-white/10 border-b-4`,
    transparent: 'bg-transparent border-none shadow-none'
  };

  const styleClass = lowGraphics ? lowGraphicsMap[intensity] : intensityMap[intensity];

  // PERFORMANCE: 
  // - Hardware Acceleration (translateZ) is GOOD for opacity/transform animations.
  // - But BAD for static heavy repaints if memory is low.
  // In lowGraphics, we strip 'backdrop-filter' via class logic, but keep GPU layer for smooth movement if needed.
  const hardwareStyle: React.CSSProperties = {
    ...style,
    transform: 'translateZ(0)',
    willChange: 'transform, opacity', // Removed 'filter, backdrop-filter'
    backfaceVisibility: 'hidden',
    perspective: '1000px',
    isolation: 'isolate',
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
      {/* Dynamic Noise - Disable entirely in Low Graphics */}
      {!lowGraphics && intensity !== 'transparent' && (
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.02] pointer-events-none mix-blend-overlay"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
        />
      )}

      <div className="relative z-10 h-full w-full">
        {children}
      </div>
    </motion.div>
  );
};
