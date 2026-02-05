/**
 * SCENE: Team Composition - Shows how court, bench and queue work
 * Unique: 3 group boxes highlight sequentially (Court→Bench→Queue) with player animations
 */

import React from 'react';
import { motion } from 'framer-motion';
import { MotionSceneProps } from './types';

export const TeamCompositionScene: React.FC<MotionSceneProps> = ({ color, isPaused }) => {
  const groups = [
    { label: 'Quadra Ativa', count: 6, color: 'blue', start: 1, timing: [0, 0.2, 0.28] },
    { label: 'Banco de Reservas', count: 4, color: 'amber', start: 7, timing: [0.3, 0.5, 0.58] },
    { label: 'Fila', count: 3, color: 'slate', start: 11, timing: [0.6, 0.8, 0.88] }
  ];

  return (
    <div className="w-full h-full flex items-center justify-center bg-slate-50 dark:bg-white/5 relative overflow-hidden">
      <div className="space-y-4 w-full max-w-xs px-4">
        {groups.map((group, groupIdx) => {
          const bgClass = `bg-${group.color}-50 dark:bg-${group.color}-500/10`;
          const borderClass = `border-${group.color}-400`;
          const dotClass = `bg-${group.color}-500`;
          const playerClass = `bg-${group.color}-400`;
          const textClass = `text-${group.color}-700 dark:text-${group.color}-300`;
          const glowColor = group.color === 'blue' ? 'rgba(59,130,246,' : group.color === 'amber' ? 'rgba(251,146,60,' : 'rgba(148,163,184,';

          return (
            <motion.div
              key={group.label}
              className={`p-4 rounded-xl border-2 ${borderClass} ${bgClass}`}
              animate={isPaused ? { scale: 1 } : {
                boxShadow: [
                  `0 0 0px ${glowColor}0)`,
                  `0 0 20px ${glowColor}0.6)`,
                  `0 0 0px ${glowColor}0)`,
                  `0 0 0px ${glowColor}0)`,
                  `0 0 0px ${glowColor}0)`
                ],
                scale: [1, 1.02, 1.02, 1, 1]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                times: group.timing,
                ease: 'easeInOut'
              }}
            >
              {/* GROUP HEADER */}
              <div className="flex items-center gap-2 mb-3">
                <motion.div
                  className={`w-4 h-4 rounded-full ${dotClass}`}
                  animate={isPaused ? { scale: 1 } : {
                    scale: [1, 1.3, 1]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    times: group.timing,
                    ease: 'easeOut'
                  }}
                />
                <span className={`text-xs font-bold ${textClass} uppercase tracking-wider`}>{group.label}</span>
              </div>

              {/* PLAYER NUMBERS - Staggered entrance */}
              <div className="flex flex-wrap gap-2">
                {[...Array(group.count)].map((_, i) => (
                  <motion.div
                    key={i}
                    className={`w-8 h-8 rounded-full ${playerClass} flex items-center justify-center text-white text-xs font-bold shadow-md`}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={isPaused ? { scale: 1, opacity: 1 } : {
                      scale: [0, 1.15, 1],
                      opacity: [0, 1, 1],
                      rotate: [180, 0, 0]
                    }}
                    transition={{
                      duration: 0.5,
                      delay: group.timing[0] * 4 + i * 0.08,
                      ease: 'easeOut'
                    }}
                  >
                    {group.start + i}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
