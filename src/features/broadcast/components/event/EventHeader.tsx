import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameState } from '@types';
import { MapPin, Trophy } from 'lucide-react';

interface EventHeaderProps {
  show: boolean;
  state: GameState;
  eventName?: string;
  eventPhase?: string;
  venue?: string;
}

export const EventHeader: React.FC<EventHeaderProps> = ({
  show,
  state,
  eventName,
  eventPhase,
  venue,
}) => {
  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -20, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed top-4 left-1/2 -translate-x-1/2 pointer-events-none z-40"
      >
        <div className="flex items-center gap-4 bg-black/60 backdrop-blur-xl rounded-full px-4 py-2 border border-white/10">
          {eventName && (
            <div className="flex items-center gap-2">
              <Trophy size={14} className="text-amber-400" />
              <span className="text-sm font-bold text-white uppercase tracking-tight">
                {eventName}
              </span>
            </div>
          )}

          {eventPhase && (
            <>
              <div className="w-px h-4 bg-white/20" />
              <span className="text-xs font-bold text-white/60 uppercase tracking-wider">
                {eventPhase}
              </span>
            </>
          )}

          {venue && (
            <>
              <div className="w-px h-4 bg-white/20" />
              <div className="flex items-center gap-1.5">
                <MapPin size={12} className="text-white/40" />
                <span className="text-xs font-medium text-white/50">
                  {venue}
                </span>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
