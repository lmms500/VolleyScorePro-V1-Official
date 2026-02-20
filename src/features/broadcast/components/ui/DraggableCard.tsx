import React, { useCallback } from 'react';
import { motion } from 'framer-motion';
import { Move } from 'lucide-react';

interface DraggableCardProps {
  children: React.ReactNode;
  positionKey: 'teamStats' | 'topPlayer' | 'rotationA' | 'rotationB';
  position: { x: number; y: number };
  isEditMode: boolean;
  onPositionChange: (key: 'teamStats' | 'topPlayer' | 'rotationA' | 'rotationB', pos: { x: number; y: number }) => void;
  defaultPosition?: { top?: string; bottom?: string; left?: string; right?: string };
}

export const DraggableCard: React.FC<DraggableCardProps> = ({
  children,
  positionKey,
  position,
  isEditMode,
  onPositionChange,
  defaultPosition,
}) => {
  const handleDragEnd = useCallback(
    (_: any, info: { point: { x: number; y: number }; offset: { x: number; y: number } }) => {
      onPositionChange(positionKey, {
        x: position.x + info.offset.x,
        y: position.y + info.offset.y,
      });
    },
    [positionKey, position, onPositionChange]
  );

  const transform = position.x !== 0 || position.y !== 0
    ? `translate(${position.x}px, ${position.y}px)`
    : undefined;

  return (
    <div
      className="relative"
      style={{
        ...(defaultPosition?.top && { top: defaultPosition.top }),
        ...(defaultPosition?.bottom && { bottom: defaultPosition.bottom }),
        ...(defaultPosition?.left && { left: defaultPosition.left }),
        ...(defaultPosition?.right && { right: defaultPosition.right }),
        transform,
      }}
    >
      <motion.div
        drag={isEditMode}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        className={`${isEditMode ? 'cursor-move' : ''}`}
        whileDrag={{ scale: 1.02, opacity: 0.9 }}
      >
        {isEditMode && (
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-cyan-500/20 text-cyan-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-cyan-400/30 z-50">
            <Move size={10} />
            <span>Arraste para mover</span>
          </div>
        )}
        {children}
      </motion.div>
    </div>
  );
};
