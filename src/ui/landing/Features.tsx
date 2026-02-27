import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import { useTranslation } from '@contexts/LanguageContext';
import { GlassSurface } from '@ui/GlassSurface';
import {
  Target,
  BarChart3,
  Layout,
  Radio,
  Mic,
  Cloud,
  Zap
} from 'lucide-react';

const iconMap = {
  target: Target,
  chart: BarChart3,
  layout: Layout,
  radio: Radio,
  mic: Mic,
  cloud: Cloud,
};

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  gradient: string;
  index: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, gradient, index }) => {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rafPending = useRef(false);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const rotateX = useTransform(scrollYProgress, [0, 1], [3, 0]);
  const rotateY = useTransform(scrollYProgress, [0, 1], [-3, 0]);

  const springX = useSpring(x, { stiffness: 300, damping: 30 });
  const springY = useSpring(y, { stiffness: 300, damping: 30 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (rafPending.current) return;
    const clientX = e.clientX;
    const clientY = e.clientY;
    const target = e.currentTarget;
    rafPending.current = true;
    requestAnimationFrame(() => {
      const rect = target.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      x.set((clientX - centerX) / 12);
      y.set((clientY - centerY) / 12);
      rafPending.current = false;
    });
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const Icon = iconMap[icon as keyof typeof iconMap];

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: index * 0.1, duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: 1000 }}
      className="group"
    >
      <motion.div
        style={{
          rotateX: springX,
          rotateY: springY,
          transformStyle: "preserve-3d"
        }}
      >
        <GlassSurface
          intensity="medium"
          className="p-6 sm:p-8 rounded-2xl h-full cursor-pointer relative overflow-hidden"
        >
          {/* Gradient Glow Background */}
          <motion.div
            className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none`}
            style={{ transform: "translateZ(-10px)" }}
          />

          {/* Icon with Glow */}
          <motion.div
            className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 sm:mb-6 shadow-lg`}
            whileHover={{ scale: 1.1 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
          >
            <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            <div
              className="absolute inset-0 rounded-xl bg-white/30 blur-xl animate-pulse"
            />
          </motion.div>

          {/* Content */}
          <div className="relative z-10">
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3 group-hover:text-white/90 transition-colors">
              {title}
            </h3>
            <p className="text-white/60 text-sm sm:text-base leading-relaxed">
              {description}
            </p>
          </div>

          {/* Corner Accent */}
          <div
            className={`absolute -top-10 -right-10 w-20 h-20 bg-gradient-to-br ${gradient} opacity-20 blur-2xl animate-pulse`}
          />
        </GlassSurface>
      </motion.div>
    </motion.div>
  );
};

export const Features: React.FC = () => {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end end"]
  });

  const headerOpacity = useTransform(scrollYProgress, [0, 0.3], [0, 1]);
  const headerY = useTransform(scrollYProgress, [0, 0.3], [30, 0]);

  const features = [
    {
      icon: 'target',
      title: t('landing.features.smartScoreboard.title'),
      description: t('landing.features.smartScoreboard.description'),
      gradient: 'from-indigo-500 to-indigo-600',
    },
    {
      icon: 'chart',
      title: t('landing.features.stats.title'),
      description: t('landing.features.stats.description'),
      gradient: 'from-purple-500 to-purple-600',
    },
    {
      icon: 'layout',
      title: t('landing.features.court.title'),
      description: t('landing.features.court.description'),
      gradient: 'from-rose-500 to-rose-600',
    },
    {
      icon: 'radio',
      title: t('landing.features.broadcast.title'),
      description: t('landing.features.broadcast.description'),
      gradient: 'from-amber-500 to-orange-600',
    },
    {
      icon: 'mic',
      title: t('landing.features.voice.title'),
      description: t('landing.features.voice.description'),
      gradient: 'from-emerald-500 to-emerald-600',
    },
    {
      icon: 'cloud',
      title: t('landing.features.sync.title'),
      description: t('landing.features.sync.description'),
      gradient: 'from-cyan-500 to-cyan-600',
    },
  ];

  return (
    <section id="features" className="py-20 sm:py-32 px-4 relative" ref={containerRef}>
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-indigo-950/10 to-slate-950 pointer-events-none" />

      <div className="max-w-7xl mx-auto relative">
        {/* Section Header */}
        <motion.div
          style={{ opacity: headerOpacity, y: headerY }}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-16"
        >
          <motion.h2
            className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.6 }}
          >
            <span className="bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
              {t('landing.features.title')}
            </span>
          </motion.h2>
          <motion.p
            className="text-white/50 text-lg max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            {t('landing.features.subtitle')}
          </motion.p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              gradient={feature.gradient}
              index={index}
            />
          ))}
        </div>

        {/* Bottom Highlight */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-12 sm:mt-16 text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500/10 to-rose-500/10 border border-white/10 rounded-full hover:border-white/20 transition-colors cursor-default">
            <div className="animate-pulse">
              <Zap className="w-4 h-4 text-amber-400" />
            </div>
            <span className="text-white/70 text-sm">{t('landing.features.highlight')}</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
