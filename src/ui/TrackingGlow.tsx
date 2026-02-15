import React, { useLayoutEffect, useRef, memo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TeamColor } from '@types';
import { resolveTheme } from '@lib/utils/colors';

interface TrackingGlowProps {
  targetRef: React.RefObject<HTMLElement>;
  colorTheme: TeamColor;
  isServing: boolean;
  isCritical: boolean;
  isMatchPoint: boolean;
  isPressed: boolean;
}

export const TrackingGlow: React.FC<TrackingGlowProps> = memo(({
  targetRef,
  colorTheme,
  isServing,
  isCritical,
  isMatchPoint,
  isPressed
}) => {
  const glowRef = useRef<HTMLDivElement>(null);
  
  // State refs for the animation loop
  const lastState = useRef({ x: 0, y: 0, w: 0, h: 0 });
  const lastActivity = useRef(Date.now());
  const rafId = useRef<number | null>(null);
  const isSleeping = useRef(false);

  // --- WAKE UP CALL ---
  // Chama isto sempre que algo mudar que exija recalcular a posição
  const wakeUp = () => {
    lastActivity.current = Date.now();
    if (isSleeping.current) {
        isSleeping.current = false;
        loop(); // Restart the heart
    }
  };

  // Trigger wake up on critical prop changes or events
  useEffect(() => {
      wakeUp();
  }, [targetRef.current, isPressed, isCritical]);

  useEffect(() => {
      const handleGlobalEvents = () => wakeUp();
      window.addEventListener('resize', handleGlobalEvents, { passive: true });
      window.addEventListener('scroll', handleGlobalEvents, { passive: true, capture: true });
      
      return () => {
          window.removeEventListener('resize', handleGlobalEvents);
          window.removeEventListener('scroll', handleGlobalEvents, { capture: true });
      };
  }, []);

  // --- THE LOOP ---
  const loop = () => {
      if (!targetRef.current || !glowRef.current) return;

      const now = Date.now();
      
      // CRYOGENIC SLEEP CHECK
      // Se não houve atividade (movimento detectado) nos últimos 500ms, mate o loop.
      if (now - lastActivity.current > 500) {
          isSleeping.current = true;
          rafId.current = null;
          return; // Stop RAF
      }

      const targetRect = targetRef.current.getBoundingClientRect();
      const centerX = targetRect.left + targetRect.width / 2;
      const centerY = targetRect.top + targetRect.height / 2;
      const calculatedSize = targetRect.height * 1.5;

      // Delta Check
      const dx = Math.abs(centerX - lastState.current.x);
      const dy = Math.abs(centerY - lastState.current.y);
      const dSize = Math.abs(calculatedSize - lastState.current.w);

      // Se mudou algo visualmente
      if (dx > 0.1 || dy > 0.1 || dSize > 0.5) {
          // Atualiza DOM
          glowRef.current.style.transform = `translate3d(${centerX}px, ${centerY}px, 0) translate(-50%, -50%)`;
          
          if (dSize > 0.5) {
              glowRef.current.style.width = `${calculatedSize}px`;
              glowRef.current.style.height = `${calculatedSize}px`;
          }

          // Atualiza estado e timestamp de atividade
          lastState.current = { x: centerX, y: centerY, w: calculatedSize, h: calculatedSize };
          lastActivity.current = now; // Mantém acordado
      }

      rafId.current = requestAnimationFrame(loop);
  };

  // Start loop on mount
  useLayoutEffect(() => {
      wakeUp();
      return () => {
          if (rafId.current) cancelAnimationFrame(rafId.current);
      };
  }, []);

  const theme = resolveTheme(colorTheme);
  const haloColorClass = isMatchPoint ? 'bg-amber-500 saturate-150' : theme.halo;

  return (
    <motion.div
      ref={glowRef}
      className={`
        fixed top-0 left-0 z-[5] rounded-full aspect-square pointer-events-none
        mix-blend-screen blur-[60px] md:blur-[100px]
        gpu-layer
        ${haloColorClass}
      `}
      animate={
        isPressed 
          ? { scale: 1.1, opacity: 0.8 } 
          : isCritical 
            ? { 
                scale: [1, 1.35, 1],
                opacity: isMatchPoint ? [0.6, 1, 0.6] : [0.4, 0.8, 0.4],
              }
            : { 
                scale: 1, 
                opacity: isServing ? 0.4 : 0 
              }
      }
      transition={
        isCritical 
          ? { duration: 1.2, repeat: Infinity, ease: "easeInOut" }
          : { duration: 0.3, ease: "easeOut" }
      }
    />
  );
});