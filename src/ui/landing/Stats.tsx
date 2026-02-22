import React, { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useTranslation } from '@contexts/LanguageContext';
import { GlassSurface } from '@ui/GlassSurface';
import { Trophy, Users, Zap, Globe } from 'lucide-react';

interface StatProps {
  value: number;
  suffix: string;
  label: string;
  icon: React.ElementType;
  color: string;
}

const AnimatedCounter: React.FC<{ value: number; suffix: string; inView: boolean }> = ({ 
  value, 
  suffix, 
  inView 
}) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;

    let start = 0;
    const duration = 2000;
    const increment = value / (duration / 16);

    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [inView, value]);

  return (
    <span>
      {count.toLocaleString()}{suffix}
    </span>
  );
};

export const Stats: React.FC = () => {
  const { t } = useTranslation();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  const stats: StatProps[] = [
    {
      value: 50,
      suffix: 'K+',
      label: t('landing.stats.matches'),
      icon: Trophy,
      color: 'from-amber-500 to-orange-500',
    },
    {
      value: 10,
      suffix: 'K+',
      label: t('landing.stats.users'),
      icon: Users,
      color: 'from-indigo-500 to-purple-500',
    },
    {
      value: 99,
      suffix: '%',
      label: t('landing.stats.uptime'),
      icon: Zap,
      color: 'from-emerald-500 to-teal-500',
    },
    {
      value: 3,
      suffix: '+',
      label: t('landing.stats.countries'),
      icon: Globe,
      color: 'from-rose-500 to-pink-500',
    },
  ];

  return (
    <section id="stats" className="py-20 sm:py-32 px-4" ref={ref}>
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
              {t('landing.stats.title')}
            </span>
          </h2>
          <p className="text-white/50 text-lg max-w-2xl mx-auto">
            {t('landing.stats.subtitle')}
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <GlassSurface
                  intensity="medium"
                  className="p-6 sm:p-8 rounded-2xl text-center group hover:scale-105 transition-transform cursor-default"
                >
                  {/* Icon */}
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 mx-auto rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3 sm:mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>

                  {/* Value */}
                  <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-1 sm:mb-2">
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} inView={inView} />
                  </div>

                  {/* Label */}
                  <p className="text-white/50 text-sm sm:text-base">{stat.label}</p>
                </GlassSurface>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
