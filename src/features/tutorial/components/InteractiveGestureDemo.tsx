import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Check } from 'lucide-react';
import { useHaptics } from '@lib/haptics/useHaptics';
import { useScoreGestures } from '@features/game/hooks/useScoreGestures';

interface InteractiveGestureDemoProps {
  colorTheme: any;
  onComplete: () => void;
}

export const InteractiveGestureDemo: React.FC<InteractiveGestureDemoProps> = ({
  colorTheme,
  onComplete
}) => {
  const [score, setScore] = useState(0);
  const [tasksCompleted, setTasksCompleted] = useState<Set<string>>(new Set());
  const [currentPhase, setCurrentPhase] = useState<'tap' | 'swipe'>('tap');
  
  const haptics = useHaptics(true);
  const bgColor = colorTheme?.crown || 'text-violet-500';
  const haloClass = colorTheme?.halo || 'bg-violet-500';

  const handleAddScore = () => {
    if (currentPhase === 'tap') {
      setScore(prev => prev + 1);
      haptics.impact('light').catch(() => {});
      
      const updated = new Set(tasksCompleted);
      updated.add('tap');
      setTasksCompleted(updated);
      setCurrentPhase('swipe');
    }
  };

  const handleSubtractScore = () => {
    if (currentPhase === 'swipe') {
      setScore(prev => Math.max(0, prev - 1));
      haptics.notification('success').catch(() => {});
      
      const updated = new Set(tasksCompleted);
      updated.add('swipe');
      setTasksCompleted(updated);
      
      setTimeout(() => onComplete(), 800);
    }
  };

  const gestureHandlers = useScoreGestures({
    onAdd: handleAddScore,
    onSubtract: handleSubtractScore,
    isLocked: false,
    onInteractionStart: () => {},
    onInteractionEnd: () => {}
  });

  const allTasksCompleted = tasksCompleted.has('tap') && tasksCompleted.has('swipe');

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 gap-4" style={{ touchAction: 'none' }}>
      {/* Scoreboard */}
      <motion.div
        className="w-full max-w-[240px] p-5 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 shadow-lg"
        {...gestureHandlers}
      >
        {/* Score */}
        <div className="text-center mb-4">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1">
            Placar
          </span>
          <motion.span
            className={`block text-5xl font-black ${bgColor} tabular-nums`}
            key={score}
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 0.2 }}
          >
            {score.toString().padStart(2, '0')}
          </motion.span>
        </div>

        {/* Progress */}
        <div className="flex gap-3 justify-center mb-3">
          <motion.div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
              ${tasksCompleted.has('tap') 
                ? `${haloClass} text-white` 
                : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}
            animate={tasksCompleted.has('tap') ? { scale: [1, 1.1, 1] } : {}}
          >
            {tasksCompleted.has('tap') ? <Check size={14} /> : '1'}
          </motion.div>
          <motion.div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
              ${tasksCompleted.has('swipe') 
                ? `${haloClass} text-white` 
                : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}
            animate={tasksCompleted.has('swipe') ? { scale: [1, 1.1, 1] } : {}}
          >
            {tasksCompleted.has('swipe') ? <Check size={14} /> : '2'}
          </motion.div>
        </div>

        {/* Instruction */}
        <p className="text-center text-sm font-bold text-slate-700 dark:text-slate-300">
          {currentPhase === 'tap' ? 'Toque para +1' : 'Deslize para -1'}
        </p>
      </motion.div>

      {/* Gesture hints */}
      <div className="flex gap-4">
        <div className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg ${
          currentPhase === 'tap' && !tasksCompleted.has('tap')
            ? `${haloClass}/20 border ${haloClass.replace('bg-', 'border-')}` 
            : 'bg-slate-100 dark:bg-slate-800'
        }`}>
          <ChevronUp size={16} className={bgColor} />
          <span className="text-[10px] font-bold text-slate-500">Toque</span>
        </div>
        <div className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg ${
          currentPhase === 'swipe' && !tasksCompleted.has('swipe')
            ? `${haloClass}/20 border ${haloClass.replace('bg-', 'border-')}` 
            : 'bg-slate-100 dark:bg-slate-800'
        }`}>
          <ChevronDown size={16} className={bgColor} />
          <span className="text-[10px] font-bold text-slate-500">Deslize</span>
        </div>
      </div>

      {/* Completion */}
      <AnimatePresence>
        {allTasksCompleted && (
          <motion.div
            className={`flex items-center gap-2 px-4 py-2 rounded-full ${haloClass} text-white font-bold text-sm`}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <Check size={16} />
            Pronto!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
