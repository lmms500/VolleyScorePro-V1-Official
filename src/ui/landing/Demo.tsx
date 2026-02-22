import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '@contexts/LanguageContext';
import { GlassSurface } from '@ui/GlassSurface';
import { Smartphone, Monitor, Tablet } from 'lucide-react';

export const Demo: React.FC = () => {
  const { t } = useTranslation();

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
    <section id="demo" className="py-20 sm:py-32 px-4 relative">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-950/20 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto relative">
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
              {t('landing.demo.title')}
            </span>
          </h2>
          <p className="text-white/50 text-lg max-w-2xl mx-auto">
            {t('landing.demo.subtitle')}
          </p>
        </motion.div>

        {/* Mockups */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {screens.map((screen, index) => {
            const Icon = screen.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.6 }}
                className="group"
              >
                <GlassSurface
                  intensity="medium"
                  className={`rounded-2xl overflow-hidden ${screen.gradient}`}
                >
                  {/* Device Frame */}
                  <div className="aspect-[9/16] sm:aspect-[3/4] relative bg-gradient-to-br from-slate-900 to-slate-950 flex items-center justify-center">
                    {/* Placeholder Content */}
                    <div className="absolute inset-4 sm:inset-6 rounded-xl bg-gradient-to-br from-white/5 to-white/0 border border-white/10 flex flex-col items-center justify-center gap-4 p-4">
                      <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br ${screen.gradient.replace('/20', '')} flex items-center justify-center`}>
                        <Icon className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                      </div>
                      <h3 className="text-white font-semibold text-center text-sm sm:text-base">{screen.title}</h3>
                      <p className="text-white/50 text-xs sm:text-sm text-center px-2">{screen.description}</p>
                    </div>

                    {/* Decorative Elements */}
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 w-16 h-4 bg-slate-800 rounded-full" />
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-24 h-6 bg-slate-800 rounded-full" />
                  </div>

                  {/* Caption */}
                  <div className="p-4 sm:p-6 text-center">
                    <h3 className="text-white font-semibold mb-1">{screen.title}</h3>
                    <p className="text-white/50 text-sm">{screen.description}</p>
                  </div>
                </GlassSurface>
              </motion.div>
            );
          })}
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
