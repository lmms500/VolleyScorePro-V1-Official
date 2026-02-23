import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useTranslation } from '@contexts/LanguageContext';
import { GlassSurface } from '@ui/GlassSurface';
import { Check, Circle, ArrowRight, Star } from 'lucide-react';

interface RoadmapItem {
  quarter: string;
  year: string;
  title: string;
  items: string[];
  status: 'completed' | 'current' | 'upcoming';
}

export const Roadmap: React.FC = () => {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end end"]
  });

  const headerOpacity = useTransform(scrollYProgress, [0, 0.3], [0, 1]);
  const headerY = useTransform(scrollYProgress, [0, 0.3], [30, 0]);

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
          icon: <Check className="w-3 h-3" />,
        };
      case 'current':
        return {
          dot: 'bg-indigo-500 shadow-indigo-500/50',
          line: 'bg-gradient-to-b from-indigo-500 to-purple-500',
          badge: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
          icon: <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="w-2 h-2 rounded-full bg-indigo-400" />,
        };
      case 'upcoming':
        return {
          dot: 'bg-white/30',
          line: 'bg-white/10',
          badge: 'bg-white/5 text-white/50 border-white/10',
          icon: null,
        };
    }
  };

  return (
    <section id="roadmap" className="py-20 sm:py-32 px-4 relative overflow-hidden" ref={containerRef}>
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-0 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 20, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-0 w-72 h-72 bg-rose-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -20, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="max-w-5xl mx-auto relative">
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
              {t('landing.roadmap.title')}
            </span>
          </h2>
          <p className="text-white/50 text-lg max-w-2xl mx-auto">
            {t('landing.roadmap.subtitle')}
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Animated Center Line */}
          <div className="absolute left-4 sm:left-1/2 top-0 bottom-0 w-0.5">
            <motion.div
              className="absolute inset-0 bg-gradient-to-b from-indigo-500 via-purple-500 to-rose-500/30"
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              style={{ originY: 0 }}
            />
          </div>

          {roadmapData.map((item, index) => {
            const styles = getStatusStyles(item.status);
            const isLeft = index % 2 === 0;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: index * 0.15, duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
                className={`relative flex items-start gap-4 sm:gap-8 mb-8 sm:mb-12 ${isLeft ? 'sm:flex-row' : 'sm:flex-row-reverse'
                  }`}
              >
                {/* Timeline Dot */}
                <div className="absolute left-4 sm:left-1/2 -translate-x-1/2 z-10">
                  <motion.div
                    className={`w-4 h-4 rounded-full ${styles.dot} shadow-lg flex items-center justify-center`}
                    whileHover={{ scale: 1.3 }}
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.15 + 0.3, type: "spring", stiffness: 500, damping: 25 }}
                  >
                    {styles.icon}
                  </motion.div>
                  {/* Pulse ring for current */}
                  {item.status === 'current' && (
                    <motion.div
                      className="absolute inset-0 rounded-full bg-indigo-500/50"
                      animate={{ scale: [1, 2], opacity: [0.5, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                </div>

                {/* Content Card */}
                <div className={`w-full sm:w-[calc(50%-2rem)] ml-10 sm:ml-0 ${isLeft ? 'sm:pr-8' : 'sm:pl-8'}`}>
                  <GlassSurface
                    intensity="medium"
                    className="p-5 sm:p-6 rounded-2xl group hover:scale-[1.02] transition-transform duration-300"
                  >
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${styles.badge}`}>
                        {item.quarter} {item.year}
                      </span>
                      {item.status === 'current' && (
                        <motion.span
                          className="px-2 py-0.5 text-xs bg-indigo-500/30 text-indigo-300 rounded-full flex items-center gap-1"
                          animate={{ opacity: [0.7, 1, 0.7] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                          {t('landing.roadmap.inProgress')}
                        </motion.span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 group-hover:text-indigo-300 transition-colors">
                      {item.title}
                    </h3>

                    {/* Items */}
                    <ul className="space-y-2">
                      {item.items.map((listItem, i) => (
                        <motion.li
                          key={i}
                          className="flex items-start gap-2 text-white/60 text-sm"
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: index * 0.15 + 0.4 + i * 0.1 }}
                        >
                          {item.status === 'completed' ? (
                            <motion.div
                              initial={{ scale: 0 }}
                              whileInView={{ scale: 1 }}
                              viewport={{ once: true }}
                              transition={{ delay: index * 0.15 + 0.5 + i * 0.1, type: "spring" }}
                            >
                              <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                            </motion.div>
                          ) : (
                            <Circle className="w-4 h-4 text-white/30 flex-shrink-0 mt-0.5" />
                          )}
                          <span>{listItem}</span>
                        </motion.li>
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
          <motion.a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
            whileHover={{ x: 5 }}
          >
            <span className="text-sm">{t('landing.roadmap.viewGithub')}</span>
            <ArrowRight className="w-4 h-4" />
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
};
