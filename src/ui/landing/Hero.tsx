import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '@contexts/LanguageContext';
import { usePWAInstall } from '@hooks/usePWAInstall';
import { Play, Download, ChevronDown, Check } from 'lucide-react';

export const Hero: React.FC<{ onEnterApp: () => void }> = ({ onEnterApp }) => {
  const { t } = useTranslation();
  const { isInstallable, isInstalled, installApp } = usePWAInstall();

  const scrollToFeatures = () => {
    const features = document.getElementById('features');
    if (features) {
      features.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center px-4 pt-20 pb-10">
      <div className="max-w-5xl mx-auto text-center">
        {/* Logo Animation */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', duration: 1, delay: 0.2 }}
          className="mb-8"
        >
          <img 
            src="/logo.svg" 
            alt="VolleyScore Pro" 
            className="w-24 h-24 sm:w-32 sm:h-32 mx-auto drop-shadow-2xl"
          />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="text-4xl sm:text-5xl md:text-7xl font-bold mb-4 sm:mb-6"
        >
          <span className="bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent">
            {t('landing.hero.title')}
          </span>
          <br />
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-rose-400 bg-clip-text text-transparent">
            {t('landing.hero.subtitle')}
          </span>
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="text-lg sm:text-xl text-white/60 max-w-2xl mx-auto mb-8 sm:mb-12 px-4"
        >
          {t('landing.hero.description')}
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
        >
          <motion.button
            onClick={onEnterApp}
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-indigo-500 to-rose-500 rounded-xl font-semibold text-lg shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all flex items-center justify-center gap-2"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <Play className="w-5 h-5" />
            {t('landing.hero.cta')}
          </motion.button>

          <motion.button
            onClick={installApp}
            disabled={isInstalled}
            className={`w-full sm:w-auto px-8 py-4 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-2 ${
              isInstalled 
                ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 cursor-default' 
                : 'bg-white/5 border border-white/20 hover:bg-white/10'
            }`}
            whileHover={!isInstalled ? { scale: 1.05, y: -2 } : {}}
            whileTap={!isInstalled ? { scale: 0.95 } : {}}
          >
            {isInstalled ? (
              <>
                <Check className="w-5 h-5" />
                {t('landing.hero.installed')}
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                {t('landing.hero.install')}
              </>
            )}
          </motion.button>
        </motion.div>

        {/* Features Pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="flex flex-wrap items-center justify-center gap-2 sm:gap-3"
        >
          {[
            t('landing.hero.pills.pwa'),
            t('landing.hero.pills.offline'),
            t('landing.hero.pills.voiceAI'),
            t('landing.hero.pills.multiLang'),
          ].map((feature, i) => (
            <span
              key={i}
              className="px-3 py-1 sm:px-4 sm:py-1.5 bg-white/5 border border-white/10 rounded-full text-xs sm:text-sm text-white/70"
            >
              {feature}
            </span>
          ))}
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 cursor-pointer"
          onClick={scrollToFeatures}
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-white/30 hover:text-white/50 transition-colors"
          >
            <ChevronDown className="w-8 h-8" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
