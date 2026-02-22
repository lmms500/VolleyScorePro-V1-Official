/**
 * SubstitutionScene - Premium Swap Animation
 * Compact layout showing player swap flow
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Users, ArrowRightLeft, Check, LogOut, LogIn } from 'lucide-react';
import { MotionSceneProps } from './types';

export const SubstitutionScene: React.FC<MotionSceneProps> = ({ color, isPaused }) => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 gap-4">
      {/* Title */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <span className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
          Substituições Rápidas
        </span>
        <p className="text-[10px] text-slate-400 mt-1">Toque no jogador que sai, depois no que entra</p>
      </motion.div>

      {/* Player swap visualization */}
      <div className="flex items-center justify-center gap-4 w-full max-w-[280px]">
        {/* Outgoing player */}
        <motion.div
          className="flex flex-col items-center gap-2"
          animate={isPaused ? {} : {
            x: [0, 15, 0],
            opacity: [1, 0.6, 1]
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <motion.div
            className="relative"
            whileHover={{ scale: 1.05 }}
          >
            <motion.div
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-400 to-rose-600 flex items-center justify-center shadow-lg"
              animate={isPaused ? {} : {
                boxShadow: [
                  '0 4px 15px -3px rgba(244, 63, 94, 0.3)',
                  '0 8px 25px -5px rgba(244, 63, 94, 0.4)',
                  '0 4px 15px -3px rgba(244, 63, 94, 0.3)'
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Users size={28} className="text-white" strokeWidth={1.5} />
            </motion.div>
            
            <motion.div
              className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-rose-500 flex items-center justify-center shadow-md border-2 border-white dark:border-slate-900"
              animate={isPaused ? {} : { scale: [1, 1.1, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <LogOut size={12} className="text-white" />
            </motion.div>
          </motion.div>

          <div className="text-center">
            <span className="text-[9px] font-bold text-rose-500 uppercase block">Sai</span>
            <span className="text-lg font-black text-slate-800 dark:text-white tabular-nums">#7</span>
          </div>
        </motion.div>

        {/* Swap animation */}
        <motion.div
          className="flex flex-col items-center gap-1"
          animate={isPaused ? {} : { opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <motion.div
            className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg"
            animate={isPaused ? {} : { rotate: [0, 180] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <ArrowRightLeft size={20} className="text-white" strokeWidth={2} />
          </motion.div>
          <span className="text-[9px] font-bold text-amber-600 uppercase">Troca</span>
        </motion.div>

        {/* Incoming player */}
        <motion.div
          className="flex flex-col items-center gap-2"
          animate={isPaused ? {} : {
            x: [0, -15, 0],
            opacity: [1, 0.6, 1]
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <motion.div
            className="relative"
            whileHover={{ scale: 1.05 }}
          >
            <motion.div
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg"
              animate={isPaused ? {} : {
                boxShadow: [
                  '0 4px 15px -3px rgba(16, 185, 129, 0.3)',
                  '0 8px 25px -5px rgba(16, 185, 129, 0.4)',
                  '0 4px 15px -3px rgba(16, 185, 129, 0.3)'
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Users size={28} className="text-white" strokeWidth={1.5} />
            </motion.div>
            
            <motion.div
              className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shadow-md border-2 border-white dark:border-slate-900"
              animate={isPaused ? {} : { scale: [1, 1.1, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
            >
              <LogIn size={12} className="text-white" />
            </motion.div>
          </motion.div>

          <div className="text-center">
            <span className="text-[9px] font-bold text-emerald-500 uppercase block">Entra</span>
            <span className="text-lg font-black text-slate-800 dark:text-white tabular-nums">#14</span>
          </div>
        </motion.div>
      </div>

      {/* Success indicator */}
      <motion.div
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={isPaused ? { opacity: 0.5, scale: 0.9 } : {
          opacity: [0, 0, 1, 1, 0],
          scale: [0.9, 0.9, 1, 1, 0.9]
        }}
        transition={{ duration: 3, repeat: Infinity, times: [0, 0.5, 0.6, 0.85, 1] }}
      >
        <motion.div
          className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center"
          animate={isPaused ? {} : { scale: [1, 1.2, 1] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        >
          <Check size={12} className="text-white" strokeWidth={3} />
        </motion.div>
        <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
          Substituição Confirmada
        </span>
      </motion.div>

      {/* Hint */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <p className="text-[9px] text-slate-400">
          Toque no botão <span className="font-bold text-amber-500">Troca</span> no menu para iniciar
        </p>
      </motion.div>
    </div>
  );
};
