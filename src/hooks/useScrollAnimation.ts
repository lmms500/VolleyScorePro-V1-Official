import { useScroll, useTransform, motionValue, useSpring, useMotionValueEvent } from 'framer-motion';
import { useRef, useCallback } from 'react';

export const useScrollReveal = (options?: {
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
}) => {
  const ref = useRef<HTMLElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end end"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.3], [0, 1]);
  const y = useTransform(scrollYProgress, [0, 0.3], [50, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.3], [0.95, 1]);

  return { ref, scrollYProgress, opacity, y, scale };
};

export const useParallax = (offset = 50) => {
  const ref = useRef<HTMLElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [-offset, offset]);

  return { ref, scrollYProgress, y };
};

export const useScrollProgress = () => {
  const { scrollYProgress } = useScroll({
    offset: ["start start", "end end"]
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return { scrollYProgress: smoothProgress };
};

export const useTilt = () => {
  const x = motionValue(0);
  const y = motionValue(0);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    x.set((e.clientX - centerX) / 20);
    y.set((e.clientY - centerY) / 20);
  }, [x, y]);

  const handleMouseLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  return { x, y, handleMouseMove, handleMouseLeave };
};

export const useMagnetic = (strength = 30) => {
  const x = motionValue(0);
  const y = motionValue(0);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    x.set((e.clientX - centerX) / strength);
    y.set((e.clientY - centerY) / strength);
  }, [x, y, strength]);

  const handleMouseLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  return { x, y, handleMouseMove, handleMouseLeave };
};

export const useSectionReveal = (threshold = 0.1) => {
  const ref = useRef<HTMLElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end end"]
  });

  const opacity = useTransform(scrollYProgress, [0, threshold, 1], [0, 1, 1]);
  const clipPath = useTransform(scrollYProgress, [0, threshold], ["inset(0 100% 0 0)", "inset(0 0% 0 0)"]);

  return { ref, scrollYProgress, opacity, clipPath };
};
