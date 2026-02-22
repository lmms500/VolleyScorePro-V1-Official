import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '@contexts/LanguageContext';
import { GlassSurface } from '@ui/GlassSurface';
import { Check, Circle, ArrowRight } from 'lucide-react';

interface RoadmapItem {
  quarter: string;
  year: string;
  title: string;
  items: string[];
  status: 'completed' | 'current' | 'upcoming';
}

export const Roadmap: React.FC = () => {
  const { t } = useTranslation();

  const roadmapData: RoadmapItem[] = [
    {
      quarter: 'Q1',
      year: '2026',
      title: t('landing.roadmap.q1_2026.title'),
      items: [
        t('landing.roadmap.q1_2026.item1'),
        t('landing.roadmap.q1_2026.item2'),
        t('landing.roadmap.q1_2026.item3'),
      ],
      status: 'completed',
    },
    {
      quarter: 'Q2',
      year: '2026',
      title: t('landing.roadmap.q2_2026.title'),
      items: [
        t('landing.roadmap.q2_2026.item1'),
        t('landing.roadmap.q2_2026.item2'),
      ],
      status: 'current',
    },
    {
      quarter: 'Q3',
      year: '2026',
      title: t('landing.roadmap.q3_2026.title'),
      items: [
        t('landing.roadmap.q3_2026.item1'),
        t('landing.roadmap.q3_2026.item2'),
      ],
      status: 'upcoming',
    },
    {
      quarter: '2027',
      year: '+',
      title: t('landing.roadmap.future.title'),
      items: [
        t('landing.roadmap.future.item1'),
        t('landing.roadmap.future.item2'),
      ],
      status: 'upcoming',
    },
  ];

  const getStatusStyles = (status: RoadmapItem['status']) => {
    switch (status) {
      case 'completed':
        return {
          dot: 'bg-emerald-500 shadow-emerald-500/50',
          line: 'bg-gradient-to-b from-emerald-500 to-indigo-500',
          badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
        };
      case 'current':
        return {
          dot: 'bg-indigo-500 shadow-indigo-500/50 animate-pulse',
          line: 'bg-gradient-to-b from-indigo-500 to-purple-500',
          badge: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
        };
      case 'upcoming':
        return {
          dot: 'bg-white/30',
          line: 'bg-white/10',
          badge: 'bg-white/5 text-white/50 border-white/10',
        };
    }
  };

  return (
    <section id="roadmap" className="py-20 sm:py-32 px-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-0 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-72 h-72 bg-rose-500/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-5xl mx-auto relative">
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
              {t('landing.roadmap.title')}
            </span>
          </h2>
          <p className="text-white/50 text-lg max-w-2xl mx-auto">
            {t('landing.roadmap.subtitle')}
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Center Line */}
          <div className="absolute left-4 sm:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-500 via-purple-500 to-rose-500/30" />

          {roadmapData.map((item, index) => {
            const styles = getStatusStyles(item.status);
            const isLeft = index % 2 === 0;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: index * 0.15, duration: 0.5 }}
                className={`relative flex items-start gap-4 sm:gap-8 mb-8 sm:mb-12 ${
                  isLeft ? 'sm:flex-row' : 'sm:flex-row-reverse'
                }`}
              >
                {/* Timeline Dot */}
                <div className="absolute left-4 sm:left-1/2 -translate-x-1/2 z-10">
                  <div className={`w-4 h-4 rounded-full ${styles.dot} shadow-lg`} />
                </div>

                {/* Content Card */}
                <div className={`w-full sm:w-[calc(50%-2rem)] ml-10 sm:ml-0 ${isLeft ? 'sm:pr-8' : 'sm:pl-8'}`}>
                  <GlassSurface
                    intensity="medium"
                    className="p-5 sm:p-6 rounded-2xl group hover:scale-[1.02] transition-transform"
                  >
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${styles.badge}`}>
                        {item.quarter} {item.year}
                      </span>
                      {item.status === 'current' && (
                        <span className="px-2 py-0.5 text-xs bg-indigo-500/30 text-indigo-300 rounded-full">
                          {t('landing.roadmap.inProgress')}
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="text-lg sm:text-xl font-semibold text-white mb-3">
                      {item.title}
                    </h3>

                    {/* Items */}
                    <ul className="space-y-2">
                      {item.items.map((listItem, i) => (
                        <li key={i} className="flex items-start gap-2 text-white/60 text-sm">
                          {item.status === 'completed' ? (
                            <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                          ) : (
                            <Circle className="w-4 h-4 text-white/30 flex-shrink-0 mt-0.5" />
                          )}
                          <span>{listItem}</span>
                        </li>
                      ))}
                    </ul>
                  </GlassSurface>
                </div>

                {/* Empty space for alignment */}
                <div className="hidden sm:block w-[calc(50%-2rem)]" />
              </motion.div>
            );
          })}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <p className="text-white/40 text-sm mb-4">{t('landing.roadmap.moreComing')}</p>
          <div className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer">
            <span className="text-sm">{t('landing.roadmap.viewGithub')}</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </motion.div>
      </div>
    </section>
  );
};
