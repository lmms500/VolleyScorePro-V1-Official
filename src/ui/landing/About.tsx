import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useTranslation } from '@contexts/LanguageContext';
import { GlassSurface } from '@ui/GlassSurface';
import { Heart, Sparkles, Users, Globe } from 'lucide-react';

export const About: React.FC = () => {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end end"]
  });

  const headerOpacity = useTransform(scrollYProgress, [0, 0.3], [0, 1]);
  const headerY = useTransform(scrollYProgress, [0, 0.3], [30, 0]);

  const highlights = [
    { icon: Heart, text: t('landing.about.highlight1'), color: 'rose' },
    { icon: Sparkles, text: t('landing.about.highlight2'), color: 'amber' },
    { icon: Users, text: t('landing.about.highlight3'), color: 'indigo' },
    { icon: Globe, text: t('landing.about.highlight4'), color: 'emerald' },
  ];

  const getGradient = (color: string) => {
    const gradients: Record<string, string> = {
      rose: 'from-rose-500/20 to-rose-600/20',
      amber: 'from-amber-500/20 to-amber-600/20',
      indigo: 'from-indigo-500/20 to-indigo-600/20',
      emerald: 'from-emerald-500/20 to-emerald-600/20',
    };
    return gradients[color] || gradients.indigo;
  };

  return (
    <section id="about" className="py-20 sm:py-32 px-4 relative" ref={containerRef}>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-950/10 to-transparent pointer-events-none" />

      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute top-1/2 left-1/4 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, 20, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-1/3 right-1/4 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, -20, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="max-w-4xl mx-auto relative">
        <motion.div
          style={{ opacity: headerOpacity, y: headerY }}
          initial={{ opacity: 0, y: 30 }}
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
          className="p-6 sm:p-10 rounded-3xl relative overflow-hidden"
        >
          {/* Background Glow */}
          <motion.div
            className="absolute -top-20 -right-20 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="space-y-6 relative z-10"
          >
            <motion.p
              className="text-lg sm:text-xl text-white/80 leading-relaxed"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              {t('landing.about.paragraph1')}
            </motion.p>

            <motion.p
              className="text-base sm:text-lg text-white/60 leading-relaxed"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              {t('landing.about.paragraph2')}
            </motion.p>

            <motion.p
              className="text-base sm:text-lg text-white/60 leading-relaxed"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
            >
              {t('landing.about.paragraph3')}
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
              className="pt-6 border-t border-white/10"
            >
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {highlights.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20, scale: 0.9 }}
                      whileInView={{ opacity: 1, y: 0, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.7 + index * 0.1, type: "spring", stiffness: 300 }}
                      whileHover={{ scale: 1.05, y: -5 }}
                      className="flex flex-col items-center text-center gap-2 cursor-default"
                    >
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getGradient(item.color)} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <Icon className="w-5 h-5 text-white/80" />
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
          transition={{ delay: 0.8 }}
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
