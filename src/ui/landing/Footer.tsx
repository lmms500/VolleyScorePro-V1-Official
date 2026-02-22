import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '@contexts/LanguageContext';
import { GlassSurface } from '@ui/GlassSurface';
import { 
  Github, 
  Twitter, 
  Instagram, 
  Heart,
  Play
} from 'lucide-react';

export const Footer: React.FC<{ onEnterApp: () => void }> = ({ onEnterApp }) => {
  const { t } = useTranslation();

  const socialLinks = [
    { icon: Github, href: 'https://github.com', label: 'GitHub' },
    { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
    { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
  ];

  const footerLinks = [
    {
      title: t('landing.footer.product'),
      links: [
        { label: t('landing.footer.features'), href: '#features' },
        { label: t('landing.footer.pricing'), href: '#' },
        { label: t('landing.footer.changelog'), href: '#' },
        { label: t('landing.footer.roadmap'), href: '#roadmap' },
      ],
    },
    {
      title: t('landing.footer.support'),
      links: [
        { label: t('landing.footer.helpCenter'), href: '#' },
        { label: t('landing.footer.contact'), href: '#' },
        { label: t('landing.footer.feedback'), href: '#' },
        { label: t('landing.footer.bugs'), href: '#' },
      ],
    },
    {
      title: t('landing.footer.legal'),
      links: [
        { label: t('landing.footer.privacy'), href: '/privacy-policy.html' },
        { label: t('landing.footer.terms'), href: '#' },
      ],
    },
  ];

  return (
    <footer className="relative border-t border-white/10">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 py-12 sm:py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-3 mb-4"
            >
              <img 
                src="/logo.svg" 
                alt="VolleyScore Pro" 
                className="w-10 h-10"
              />
              <div>
                <h3 className="text-white font-bold">{t('landing.brand.name')}</h3>
                <p className="text-white/40 text-xs">{t('landing.footer.version')}</p>
              </div>
            </motion.div>
            <p className="text-white/50 text-sm mb-4 max-w-xs">
              {t('landing.footer.tagline')}
            </p>
            
            {/* Social Links */}
            <div className="flex items-center gap-3">
              {socialLinks.map((social, index) => {
                const Icon = social.icon;
                return (
                  <motion.a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label={social.label}
                  >
                    <Icon className="w-4 h-4" />
                  </motion.a>
                );
              })}
            </div>
          </div>

          {/* Links */}
          {footerLinks.map((section, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <h4 className="text-white font-semibold mb-4">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a
                      href={link.href}
                      className="text-white/50 hover:text-white text-sm transition-colors flex items-center gap-1"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* CTA Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <GlassSurface
            intensity="medium"
            className="p-6 sm:p-8 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 mb-12"
          >
            <div className="text-center sm:text-left">
              <h3 className="text-white font-semibold text-lg mb-1">
                {t('landing.footer.ctaTitle')}
              </h3>
              <p className="text-white/50 text-sm">
                {t('landing.footer.ctaSubtitle')}
              </p>
            </div>
            <motion.button
              onClick={onEnterApp}
              className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-rose-500 rounded-xl font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all flex items-center gap-2 whitespace-nowrap"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Play className="w-4 h-4" />
              {t('landing.footer.ctaButton')}
            </motion.button>
          </GlassSurface>
        </motion.div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-white/10">
          <p className="text-white/40 text-sm text-center sm:text-left">
            {t('landing.footer.copyright')}
          </p>
          <p className="text-white/30 text-xs flex items-center gap-1">
            {t('landing.footer.madeWith')}
            <Heart className="w-3 h-3 text-rose-500 inline" />
            {t('landing.footer.forVolleyball')}
          </p>
        </div>
      </div>
    </footer>
  );
};
