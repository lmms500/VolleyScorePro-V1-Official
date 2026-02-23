import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import { useTranslation } from '@contexts/LanguageContext';
import { Language } from '@contexts/LanguageContext';
import { Hero } from '@ui/landing/Hero';
import { Features } from '@ui/landing/Features';
import { Demo } from '@ui/landing/Demo';
import { About } from '@ui/landing/About';
import { Roadmap } from '@ui/landing/Roadmap';
import { Footer } from '@ui/landing/Footer';
import { Globe, Menu, X, ArrowUp, Play, Pause, Music } from 'lucide-react';
import redeEmChamasAudio from '../../assets/Rede_em_Chamas.mp3';

export const LandingPage: React.FC<{ onEnterApp: () => void }> = ({ onEnterApp }) => {
  const { language, setLanguage, t } = useTranslation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const { scrollYProgress } = useScroll({ container: containerRef });
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      setScrolled(scrollTop > 50);
      setShowBackToTop(scrollTop > 500);
    };
    container.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    audioRef.current = new Audio(redeEmChamasAudio);
    audioRef.current.loop = true;
    audioRef.current.volume = 0.3;
    
    const playAudio = () => {
      if (audioRef.current && isMusicPlaying) {
        audioRef.current.play().catch(() => {});
      }
    };
    
    const unlockAudio = () => {
      playAudio();
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };
    
    window.addEventListener('click', unlockAudio);
    window.addEventListener('keydown', unlockAudio);
    
    playAudio();
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      if (isMusicPlaying) {
        audioRef.current.play().catch(() => {});
      } else {
        audioRef.current.pause();
      }
    }
  }, [isMusicPlaying]);

  const languages: { code: Language; label: string }[] = [
    { code: 'pt', label: 'PT' },
    { code: 'en', label: 'EN' },
    { code: 'es', label: 'ES' },
  ];

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setMobileMenuOpen(false);
  };

  const scrollToTop = () => {
    containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 overflow-y-auto overflow-x-hidden bg-gradient-to-br from-slate-950 via-indigo-950/30 to-slate-950 text-white"
    >
      {/* Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500 z-[60] origin-left"
        style={{ scaleX: smoothProgress }}
      />

      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <motion.div
          className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl"
          animate={{
            x: [0, 30, 0],
            y: [0, -20, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-rose-500/15 rounded-full blur-3xl"
          animate={{
            x: [0, -30, 0],
            y: [0, 30, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-indigo-500/5 to-rose-500/5 rounded-full blur-3xl" />
      </div>

      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-slate-950/80 backdrop-blur-xl border-b border-white/10' : ''
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <motion.div
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => scrollToSection('hero')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.img
                src="/logo.svg"
                alt="VolleyScore Pro"
                className="w-10 h-10 sm:w-12 sm:h-12"
                whileHover={{ rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              />
              <div className="hidden sm:block">
                <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                  {t('landing.brand.name')}
                </h1>
                <p className="text-xs text-white/50 -mt-0.5">{t('landing.brand.tagline')}</p>
              </div>
            </motion.div>

            <div className="hidden md:flex items-center gap-6">
              {[
                { id: 'features', label: t('landing.nav.features') },
                { id: 'demo', label: t('landing.nav.demo') },
                { id: 'about', label: t('landing.nav.about') },
                { id: 'roadmap', label: t('landing.nav.roadmap') },
              ].map((item) => (
                <motion.button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="text-white/70 hover:text-white transition-colors text-sm font-medium relative"
                  whileHover="hover"
                  initial="idle"
                >
                  {item.label}
                  <motion.span
                    className="absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-indigo-500 to-rose-500 rounded-full"
                    initial={{ width: 0 }}
                    whileHover={{ width: "100%" }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.button>
              ))}

              <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1 border border-white/10">
                <Globe className="w-4 h-4 text-white/50 ml-2" />
                {languages.map((lang) => (
                  <motion.button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={`px-2 py-1 text-xs rounded transition-all relative ${language === lang.code
                        ? 'bg-white/15 text-white'
                        : 'text-white/50 hover:text-white/80'
                      }`}
                    whileTap={{ scale: 0.9 }}
                  >
                    {lang.label}
                  </motion.button>
                ))}
              </div>

              <motion.button
                onClick={() => setIsMusicPlaying(!isMusicPlaying)}
                className="p-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label={isMusicPlaying ? t('landing.music.pause') : t('landing.music.play')}
              >
                {isMusicPlaying ? (
                  <Music className="w-5 h-5 text-indigo-400" />
                ) : (
                  <Music className="w-5 h-5 text-white/40" />
                )}
              </motion.button>

              <motion.button
                onClick={onEnterApp}
                className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-rose-500 rounded-lg font-medium text-sm shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                {t('landing.nav.openApp')}
              </motion.button>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-white/70 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-slate-950/95 backdrop-blur-xl border-t border-white/10"
            >
              <div className="px-4 py-4 space-y-3">
                {[
                  { id: 'features', label: t('landing.nav.features') },
                  { id: 'demo', label: t('landing.nav.demo') },
                  { id: 'about', label: t('landing.nav.about') },
                  { id: 'roadmap', label: t('landing.nav.roadmap') },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className="block w-full text-left text-white/70 hover:text-white py-2 font-medium"
                  >
                    {item.label}
                  </button>
                ))}

                <div className="flex items-center gap-2 py-2">
                  <Globe className="w-4 h-4 text-white/50" />
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => setLanguage(lang.code)}
                      className={`px-3 py-1 text-sm rounded transition-all ${language === lang.code
                          ? 'bg-white/15 text-white'
                          : 'text-white/50 hover:text-white/80'
                        }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>

                <motion.button
                  onClick={onEnterApp}
                  className="w-full px-4 py-3 bg-gradient-to-r from-indigo-500 to-rose-500 rounded-lg font-medium text-center shadow-lg"
                  whileTap={{ scale: 0.98 }}
                >
                  {t('landing.nav.openApp')}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      <main>
        <Hero onEnterApp={onEnterApp} />
        <Features />
        <Demo />
        <About />
        <Roadmap />
      </main>

      <Footer onEnterApp={onEnterApp} />

      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 z-50 w-12 h-12 bg-gradient-to-r from-indigo-500 to-rose-500 rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label={t('landing.nav.backToTop')}
          >
            <ArrowUp className="w-5 h-5 text-white" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};
