import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useTranslation } from '@contexts/LanguageContext';
import { GlassSurface } from '@ui/GlassSurface';
import { Smartphone, Monitor, Tablet } from 'lucide-react';

interface ScreenCardProps {
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  gradient: string;
  index: number;
}

const ScreenCard: React.FC<ScreenCardProps> = ({ title, description, icon: Icon, gradient, index }) => {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [30, -30]);
  const rotate = useTransform(scrollYProgress, [0, 1], [1, -1]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ delay: index * 0.15, duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
      style={{ y, rotate }}
    >
      <GlassSurface
        intensity="medium"
        className={`rounded-2xl overflow-hidden group ${gradient}`}
      >
        {/* Device Frame */}
        <div className="aspect-[9/16] sm:aspect-[3/4] relative bg-gradient-to-br from-slate-900 to-slate-950 flex items-center justify-center overflow-hidden">
          {/* Screen Glow */}
          <motion.div
            className={`absolute inset-0 bg-gradient-to-br ${gradient.replace('/20', '')} opacity-0 group-hover:opacity-20 transition-opacity duration-500`}
          />

          {/* Floating Elements */}
          <motion.div
            className="absolute w-32 h-32 rounded-full bg-indigo-500/10 blur-3xl"
            animate={{
              x: [0, 20, 0],
              y: [0, -20, 0],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />

          {/* Placeholder Content */}
          <div className="absolute inset-4 sm:inset-6 rounded-xl bg-gradient-to-br from-white/5 to-white/0 border border-white/10 flex flex-col items-center justify-center gap-4 p-4 z-10">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br ${gradient.replace('/20', '')} flex items-center justify-center shadow-lg`}
            >
              <Icon className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </motion.div>
            <h3 className="text-white font-semibold text-center text-sm sm:text-base">{title}</h3>
            <p className="text-white/50 text-xs sm:text-sm text-center px-2">{description}</p>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-16 h-4 bg-slate-800 rounded-full" />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-24 h-6 bg-slate-800 rounded-full" />
        </div>

        {/* Caption */}
        <div className="p-4 sm:p-6 text-center">
          <motion.h3
            className="text-white font-semibold mb-1"
            whileHover={{ color: "#a5b4fc" }}
          >
            {title}
          </motion.h3>
          <p className="text-white/50 text-sm">{description}</p>
        </div>
      </GlassSurface>
    </motion.div>
  );
};

export const Demo: React.FC = () => {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end end"]
  });

  const headerOpacity = useTransform(scrollYProgress, [0, 0.3], [0, 1]);
  const headerY = useTransform(scrollYProgress, [0, 0.3], [30, 0]);

  const screens = [
    {
      title: t('landing.demo.scoreboard'),
      description: t('landing.demo.scoreboardDesc'),
      icon: Smartphone,
      gradient: 'from-indigo-500/20 to-indigo-600/20',
    },
    {
      title: t('landing.demo.court'),
      description: t('landing.demo.courtDesc'),
      icon: Tablet,
      gradient: 'from-purple-500/20 to-purple-600/20',
    },
    {
      title: t('landing.demo.stats'),
      description: t('landing.demo.statsDesc'),
      icon: Monitor,
      gradient: 'from-rose-500/20 to-rose-600/20',
    },
  ];

  return (
    <section id="demo" className="py-20 sm:py-32 px-4 relative" ref={containerRef}>
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-950/20 to-transparent pointer-events-none" />

      {/* Animated Background Orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 30, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -30, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

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
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
              {t('landing.demo.title')}
            </span>
          </h2>
          <p className="text-white/50 text-lg max-w-2xl mx-auto">
            {t('landing.demo.subtitle')}
          </p>
        </motion.div>

        {/* Mockups */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {screens.map((screen, index) => (
            <ScreenCard
              key={index}
              title={screen.title}
              description={screen.description}
              icon={screen.icon}
              gradient={screen.gradient}
              index={index}
            />
          ))}
        </div>

        {/* Bottom Note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="text-center text-white/40 text-sm mt-8"
        >
          {t('landing.demo.note')}
        </motion.p>
      </div>
    </section>
  );
};
