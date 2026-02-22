import React from 'react';
import { motion } from 'framer-motion';
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

export const Features: React.FC = () => {
  const { t } = useTranslation();

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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <section id="features" className="py-20 sm:py-32 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
              {t('landing.features.title')}
            </span>
          </h2>
          <p className="text-white/50 text-lg max-w-2xl mx-auto">
            {t('landing.features.subtitle')}
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
        >
          {features.map((feature, index) => {
            const Icon = iconMap[feature.icon as keyof typeof iconMap];
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -5, scale: 1.02 }}
                className="group"
              >
                <GlassSurface
                  intensity="medium"
                  className="p-6 sm:p-8 rounded-2xl h-full cursor-pointer"
                >
                  {/* Icon */}
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 sm:mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-white/60 text-sm sm:text-base leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Hover Glow */}
                  <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none`} />
                </GlassSurface>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bottom Highlight */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-12 sm:mt-16 text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500/10 to-rose-500/10 border border-white/10 rounded-full">
            <Zap className="w-4 h-4 text-amber-400" />
            <span className="text-white/70 text-sm">{t('landing.features.highlight')}</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
