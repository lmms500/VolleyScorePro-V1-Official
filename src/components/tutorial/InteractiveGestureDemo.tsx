import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Zap } from 'lucide-react';
import { useHaptics } from '../../hooks/useHaptics';
import { useScoreGestures } from '../../hooks/useScoreGestures';

interface InteractiveGestureDemoProps {
  colorTheme: any;
  onComplete: () => void;
}

interface Task {
  id: 'tap' | 'swipe';
  name: string;
  instruction: string;
  completed: boolean;
  icon: React.ReactNode;
}

/**
 * InteractiveGestureDemo
 * A playable, mini-scoreboard that demonstrates and teaches tap & swipe gestures
 * through muscle memory. The "Next" button unlocks only after successful completion.
 */
export const InteractiveGestureDemo: React.FC<InteractiveGestureDemoProps> = ({
  colorTheme,
  onComplete
}) => {
  const [score, setScore] = useState(0);
  const [tasksCompleted, setTasksCompleted] = useState<Set<string>>(new Set());
  const [currentPhase, setCurrentPhase] = useState<'tap' | 'swipe'>('tap');
  const [showConfetti, setShowConfetti] = useState(false);
  const [completionMessage, setCompletionMessage] = useState('');
  
  const haptics = useHaptics(true);
  const bgColor = colorTheme?.crown || 'text-violet-500';
  const haloClass = colorTheme?.halo || 'bg-violet-500';

  const tasks: Task[] = [
    {
      id: 'tap',
      name: 'Tap',
      instruction: 'Tap to add a point',
      completed: tasksCompleted.has('tap'),
      icon: <ChevronUp size={20} />
    },
    {
      id: 'swipe',
      name: 'Swipe Down',
      instruction: 'Swipe down to subtract',
      completed: tasksCompleted.has('swipe'),
      icon: <ChevronDown size={20} />
    }
  ];

  // Handle score increases (Tap)
  const handleAddScore = () => {
    if (currentPhase === 'tap') {
      const newScore = score + 1;
      setScore(newScore);
      
      // Haptic feedback (fire and forget)
      haptics.impact('light').catch(() => {});
      
      // Visual feedback
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 600);

      // Mark tap as completed
      const updated = new Set(tasksCompleted);
      updated.add('tap');
      setTasksCompleted(updated);

      // Auto-advance to swipe phase
      setCurrentPhase('swipe');
      setCompletionMessage('Great! Now swipe down to subtract.');
    }
  };

  // Handle score decreases (Swipe Down)
  const handleSubtractScore = () => {
    if (currentPhase === 'swipe') {
      const newScore = score > 0 ? score - 1 : 0;
      setScore(newScore);
      
      // Haptic feedback (fire and forget)
      haptics.notification('success').catch(() => {});
      
      // Mark swipe as completed
      const updated = new Set(tasksCompleted);
      updated.add('swipe');
      setTasksCompleted(updated);

      // All tasks done - trigger completion
      setCompletionMessage('Perfect! You are ready to keep score!');
      setShowConfetti(true);
      
      // Notify parent after brief delay for visual feedback
      setTimeout(() => {
        onComplete();
      }, 1000);
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
    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 dark:bg-white/5 relative overflow-hidden touch-none" style={{ touchAction: 'none' }}>
      {/* Non-Scrollable Container with touch-action: none to prevent scroll interference */}
      <div className="w-full h-full flex flex-col items-center justify-between p-2 sm:p-4 gap-3 sm:gap-6 overflow-hidden relative" style={{ touchAction: 'none' }}>
        {/* Mini Scoreboard */}
        <motion.div
          className={`
            relative w-full max-w-sm p-6 sm:p-8 rounded-3xl shadow-xl
            border-2 border-opacity-30
            bg-gradient-to-br from-white via-white/80 to-white/60
            dark:from-slate-800/80 dark:via-slate-800/60 dark:to-slate-900/40
            backdrop-blur-md
            flex-shrink-0
          `}
          style={{ 
            borderColor: bgColor.replace('text-', '#').replace('500', '600'),
            touchAction: 'none'
          }}
          animate={allTasksCompleted ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 0.5, repeat: allTasksCompleted ? Infinity : 0 }}
          {...gestureHandlers}
        >
          {/* Score Display */}
          <motion.div className="text-center mb-4 sm:mb-6">
            <span className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
              Current Score
            </span>
            <motion.span
              className={`block text-5xl sm:text-6xl font-black ${bgColor} tabular-nums`}
              key={score}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.3 }}
            >
              {score.toString().padStart(2, '0')}
            </motion.span>
          </motion.div>

          {/* Instructions */}
          <div className="text-center mb-4 sm:mb-6">
            <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
              {currentPhase === 'tap' ? 'Step 1 of 2' : 'Step 2 of 2'}
            </p>
            <p className="text-base sm:text-lg font-black text-slate-800 dark:text-white leading-tight">
              {currentPhase === 'tap'
                ? 'Tap to add a point'
                : 'Swipe down to correct'}
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="flex gap-3 justify-center">
            {tasks.map(task => (
              <motion.div
                key={task.id}
                className={`
                  w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold text-white
                  border-2 transition-all text-xs sm:text-sm
                  ${task.completed 
                    ? `${haloClass} border-opacity-50` 
                    : 'bg-slate-200 dark:bg-slate-700 border-slate-300 dark:border-slate-600'}
                `}
                animate={task.completed ? { scale: [1, 1.15, 1] } : {}}
                transition={{ duration: 0.4 }}
              >
                {task.completed ? '✓' : task.name.charAt(0)}
              </motion.div>
            ))}
          </div>

          {/* Confetti Particles - Positioned with overflow visible */}
          <div className="absolute inset-0 pointer-events-none overflow-visible">
            <AnimatePresence>
              {showConfetti && (
                <>
                  {Array.from({ length: 8 }).map((_, i) => {
                    const uniqueKey = `${currentPhase}-confetti-${i}`;
                    return (
                    <motion.div
                      key={uniqueKey}
                      className={`absolute w-2 h-2 rounded-full ${haloClass}`}
                      initial={{
                        x: 0,
                        y: 0,
                        opacity: 1,
                        scale: 1
                      }}
                      animate={{
                        x: (Math.random() - 0.5) * 180,
                        y: -Math.random() * 150 - 50,
                        opacity: 0,
                        scale: 0
                      }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      style={{
                        left: '50%',
                        top: '50%',
                        marginLeft: '-4px',
                        marginTop: '-4px'
                      }}
                    />
                    );
                  })}
                </>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Phase Feedback */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPhase}
            className="text-center max-w-xs px-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <p className={`text-xs sm:text-sm font-semibold ${bgColor}`}>
              {completionMessage || (currentPhase === 'tap' 
                ? 'Try tapping on the scoreboard above'
                : 'Now swipe downward on the scoreboard')}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Visual Guide - Gesture Indicators */}
        <div className="w-full flex gap-2 sm:gap-4 justify-center mt-2 sm:mt-4 pt-2 sm:pt-4 border-t border-slate-200 dark:border-white/10 px-2">
          {/* Tap Indicator */}
          <motion.div
            className={`flex flex-col items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm ${
              currentPhase === 'tap'
                ? `${haloClass}/20 border-2 ${haloClass.replace('bg-', 'border-')}`
                : 'bg-slate-100 dark:bg-white/5 border-2 border-slate-200 dark:border-white/10'
            }`}
            animate={currentPhase === 'tap' ? { scale: [1, 1.05, 1] } : {}}
            transition={{ duration: 1.5, repeat: currentPhase === 'tap' ? Infinity : 0 }}
          >
            <ChevronUp size={14} className={currentPhase === 'tap' ? bgColor : 'text-slate-400'} />
            <span className="text-xs font-bold uppercase">Tap</span>
          </motion.div>

          {/* Swipe Indicator */}
          <motion.div
            className={`flex flex-col items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm ${
              currentPhase === 'swipe'
                ? `${haloClass}/20 border-2 ${haloClass.replace('bg-', 'border-')}`
                : 'bg-slate-100 dark:bg-white/5 border-2 border-slate-200 dark:border-white/10'
            }`}
            animate={currentPhase === 'swipe' ? { scale: [1, 1.05, 1] } : {}}
            transition={{ duration: 1.5, repeat: currentPhase === 'swipe' ? Infinity : 0 }}
          >
            <ChevronDown size={14} className={currentPhase === 'swipe' ? bgColor : 'text-slate-400'} />
            <span className="text-xs font-bold uppercase">Swipe</span>
          </motion.div>
        </div>

        {/* Completion Badge - Below indicators in normal flow */}
        <AnimatePresence>
          {allTasksCompleted && (
            <motion.div
              className={`flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-full ${haloClass} text-white font-bold shadow-lg text-xs sm:text-sm`}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', bounce: 0.6 }}
            >
              <Zap size={16} fill="currentColor" />
              Ready to Play!
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
