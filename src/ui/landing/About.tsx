import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '@contexts/LanguageContext';
import { GlassSurface } from '@ui/GlassSurface';
import { Heart, Sparkles, Users, Globe } from 'lucide-react';

export const About: React.FC = () => {
  const { t } = useTranslation();

  const highlights = [
    { icon: Heart, text: t('landing.about.highlight1') },
    { icon: Sparkles, text: t('landing.about.highlight2') },
    { icon: Users, text: t('landing.about.highlight3') },
    { icon: Globe, text: t('landing.about.highlight4') },
  ];

  return (
    <section id="about" className="py-20 sm:py-32 px-4 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-950/10 to-transparent pointer-events-none" />

      <div className="max-w-4xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
              {t('landing.about.title')}
            </span>
          </h2>
        </motion.div>

        <GlassSurface
          intensity="medium"
          className="p-6 sm:p-10 rounded-3xl"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <p className="text-lg sm:text-xl text-white/80 leading-relaxed">
              {t('landing.about.paragraph1')}
            </p>

            <p className="text-base sm:text-lg text-white/60 leading-relaxed">
              {t('landing.about.paragraph2')}
            </p>

            <p className="text-base sm:text-lg text-white/60 leading-relaxed">
              {t('landing.about.paragraph3')}
            </p>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="pt-6 border-t border-white/10"
            >
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {highlights.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="flex flex-col items-center text-center gap-2"
                    >
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-rose-500/20 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-indigo-400" />
                      </div>
                      <span className="text-xs sm:text-sm text-white/50">{item.text}</span>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        </GlassSurface>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="text-center mt-8"
        >
          <p className="text-white/40 text-sm italic">
            {t('landing.about.signature')}
          </p>
        </motion.div>
      </div>
    </section>
  );
};
