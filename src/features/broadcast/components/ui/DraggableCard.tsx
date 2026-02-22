import React, { useCallback, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Move } from 'lucide-react';

interface DraggableCardProps {
  children: React.ReactNode;
  positionKey: string;
  defaultX: number;
  defaultY: number;
  isEditMode: boolean;
}

export const DraggableCard: React.FC<DraggableCardProps> = ({
  children,
  positionKey,
  defaultX,
  defaultY,
  isEditMode,
}) => {
  const [pos, setPos] = useState({ x: defaultX, y: defaultY });

  useEffect(() => {
    const stored = localStorage.getItem(`vs_pos_${positionKey}`);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
          setPos({ x: parsed.x, y: parsed.y });
          return;
        }
      } catch (e) { console.warn('[DraggableCard] Failed to parse stored position:', e); }
    }
    setPos({ x: defaultX, y: defaultY });
  }, [positionKey, defaultX, defaultY]);

  const handleDragEnd = useCallback(
    (_: any, info: { point: { x: number; y: number } }) => {
      const newX = info.point.x;
      const newY = info.point.y;
      setPos({ x: newX, y: newY });
      localStorage.setItem(`vs_pos_${positionKey}`, JSON.stringify({ x: newX, y: newY }));
    },
    [positionKey]
  );

  return (
    <motion.div
      drag={isEditMode}
      dragMomentum={false}
      dragElastic={0}
      onDragEnd={handleDragEnd}
      className={`${isEditMode ? 'cursor-move z-50' : ''}`}
      style={{
        position: 'fixed',
        left: pos.x,
        top: pos.y,
        transform: 'translate(-50%, -50%)',
      }}
      whileDrag={{ scale: 1.02, outline: '2px solid rgba(34, 211, 238, 0.8)' }}
    >
      {isEditMode && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-cyan-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg whitespace-nowrap z-50">
          <Move size={12} />
          <span>{positionKey}</span>
        </div>
      )}
      {children}
    </motion.div>
  );
};

export const resetAllDraggablePositions = (keys: string[]) => {
  keys.forEach((key) => {
    localStorage.removeItem(`vs_pos_${key}`);
  });
};
