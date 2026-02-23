import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useTranslation } from '@contexts/LanguageContext';
import { usePWAInstall } from '@hooks/usePWAInstall';
import { Play, Download, ChevronDown, Check, Sparkles } from 'lucide-react';

export const Hero: React.FC<{ onEnterApp: () => void }> = ({ onEnterApp }) => {
  const { t } = useTranslation();
  const { isInstallable, isInstalled, installApp } = usePWAInstall();
  const containerRef = React.useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);

  const scrollToFeatures = () => {
    const features = document.getElementById('features');
    if (features) {
      features.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const floatingOrbs = [
    { x: '10%', y: '20%', size: 120, duration: 8, delay: 0 },
    { x: '85%', y: '30%', size: 80, duration: 7, delay: 1 },
    { x: '75%', y: '70%', size: 100, duration: 9, delay: 2 },
    { x: '15%', y: '75%', size: 60, duration: 6, delay: 0.5 },
  ];

  return (
    <section
      id="hero"
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center px-4 pt-20 pb-10 overflow-hidden"
    >
      {/* Floating Orbs Background */}
      {floatingOrbs.map((orb, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: orb.x,
            top: orb.y,
            width: orb.size,
            height: orb.size,
            background: i % 2 === 0
              ? 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(244, 63, 94, 0.12) 0%, transparent 70%)',
            filter: 'blur(20px)',
          }}
          animate={{
            y: [0, -20, 0],
            x: [0, 10, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: orb.duration,
            delay: orb.delay,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      ))}

      {/* Content */}
      <motion.div
        className="max-w-5xl mx-auto text-center relative z-10"
        style={{ y, opacity, scale }}
      >
        {/* Logo with Glow Animation */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', duration: 1.2, delay: 0.2, stiffness: 100 }}
          className="relative mb-8 inline-block"
        >
          <motion.div
            className="absolute inset-0 rounded-full"
            animate={{
              boxShadow: [
                "0 0 30px 10px rgba(99, 102, 241, 0.3)",
                "0 0 60px 20px rgba(99, 102, 241, 0.5)",
                "0 0 30px 10px rgba(99, 102, 241, 0.3)"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <img
            src="/logo.svg"
            alt="VolleyScore Pro"
            className="w-24 h-24 sm:w-32 sm:h-32 mx-auto drop-shadow-2xl relative z-10"
          />
          <motion.div
            className="absolute -top-2 -right-2"
            animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Sparkles className="w-6 h-6 text-amber-400" />
          </motion.div>
        </motion.div>

        {/* Title with Stagger Animation */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="text-4xl sm:text-5xl md:text-7xl font-bold mb-4 sm:mb-6"
        >
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="block bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent"
          >
            {t('landing.hero.title')}
          </motion.span>
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.6 }}
            className="block bg-gradient-to-r from-indigo-400 via-purple-400 to-rose-400 bg-clip-text text-transparent"
          >
            {t('landing.hero.subtitle')}
          </motion.span>
        </motion.h1>

        {/* Description with Fade */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          className="text-lg sm:text-xl text-white/60 max-w-2xl mx-auto mb-8 sm:mb-12 px-4"
        >
          {t('landing.hero.description')}
        </motion.p>

        {/* CTA Buttons with Glow */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.8 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
        >
          <motion.button
            onClick={onEnterApp}
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-indigo-500 to-rose-500 rounded-xl font-semibold text-lg shadow-xl shadow-indigo-500/30 flex items-center justify-center gap-2 relative overflow-hidden group"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              className="absolute inset-0 bg-white/20"
              initial={{ x: "-100%" }}
              whileHover={{ x: "100%" }}
              transition={{ duration: 0.5 }}
            />
            <span className="relative z-10 flex items-center gap-2">
              <Play className="w-5 h-5" />
              {t('landing.hero.cta')}
            </span>
          </motion.button>

          <motion.button
            onClick={installApp}
            disabled={isInstalled}
            className={`w-full sm:w-auto px-8 py-4 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-2 relative overflow-hidden ${isInstalled
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

        {/* Features Pills with Stagger */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="flex flex-wrap items-center justify-center gap-2 sm:gap-3"
        >
          {[
            { text: t('landing.hero.pills.pwa'), color: 'indigo' },
            { text: t('landing.hero.pills.offline'), color: 'purple' },
            { text: t('landing.hero.pills.voiceAI'), color: 'rose' },
            { text: t('landing.hero.pills.multiLang'), color: 'amber' },
          ].map((feature, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 1.3 + i * 0.1, duration: 0.4 }}
              whileHover={{ scale: 1.05, y: -2 }}
              className={`px-3 py-1 sm:px-4 sm:py-1.5 bg-white/5 border border-white/10 rounded-full text-xs sm:text-sm text-white/70 cursor-default hover:bg-white/10 transition-colors`}
            >
              {feature.text}
            </motion.span>
          ))}
        </motion.div>

        {/* Scroll Indicator with Bounce */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 cursor-pointer"
          onClick={scrollToFeatures}
        >
          <motion.div
            animate={{ y: [0, 8, 0], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex flex-col items-center gap-1"
          >
            <span className="text-xs text-white/30 uppercase tracking-widest">Scroll</span>
            <ChevronDown className="w-6 h-6 text-white/40" />
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
};
