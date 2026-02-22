
import React, { useEffect, useRef } from 'react';
import { getHexFromColor } from '@lib/utils/colors';
import { TeamColor } from '@types';
import { useLayoutManager } from '@contexts/LayoutContext';
import { usePerformanceSafe } from '@contexts/PerformanceContext';
import { getMaxParticles, getAnimationConfig } from '@lib/platform/animationConfig';

interface ConfettiProps {
  colors: TeamColor[];
  intensity?: 'low' | 'high';
  physicsVariant?: 'interactive' | 'ambient';
  /** @deprecated Prefer PerformanceContext. Kept for backward compat. */
  enabled?: boolean;
}

interface Particle {
  x: number;
  y: number;
  prevY: number;
  wobble: number;
  wobbleSpeed: number;
  velocity: number;
  tiltAngle: number;
  color: string;
  shape: 'square' | 'circle';
  mass: number;
  drift: number;
  scale: number;
  rotation: number;
  rotationSpeed: number;
  sliding: boolean;
  slideSlope: number;
}

// Physics Types Enums for fast checking (Integers are faster than Strings)
const PHYS_FLAT = 0;
const PHYS_CURVED = 1; // Scoreboard numbers
const PHYS_PILL = 2;   // Buttons, History bar
const PHYS_TEXT = 3;   // Headers

interface OptimizedCollider {
    type: number;
    rect: DOMRect;
    left: number;
    right: number;
    top: number;
    width: number;
    centerX: number;
    // Pre-calculated values for curved surfaces
    sinkFactor: number;
    lineHeightTrim: number;
}

export const Confetti: React.FC<ConfettiProps> = ({
  colors,
  intensity = 'high',
  physicsVariant = 'ambient',
  enabled: enabledProp = true
}) => {
  const { config: perf } = usePerformanceSafe();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { colliders } = useLayoutManager();

  // Adaptive: disable confetti if performance mode says so, or prop says so
  const enabled = enabledProp && perf.visual.confetti;

  // Cache Ref to avoid stale closures in RAF loop
  const physicsWorldRef = useRef<OptimizedCollider[]>([]);

  // 1. PRE-PROCESSING (Broad Phase Setup)
  useEffect(() => {
      if (!enabled) return;
      
      physicsWorldRef.current = colliders.map(c => {
          const { rect, id } = c;
          let type = PHYS_FLAT;
          let xPad = 2;

          if (id.includes('sc-number')) {
              type = PHYS_CURVED;
          } else if (id.includes('hist-')) {
              type = PHYS_PILL;
              xPad = -4; // Strict padding for history pills
          } else if (id.includes('sc-footer')) {
              type = PHYS_PILL;
              xPad = 4;
          } else if (id.includes('sc-header')) {
              type = PHYS_TEXT;
          }

          const sinkFactor = rect.height * 0.35;
          const lineHeightTrim = rect.height * 0.1;

          return {
              type,
              rect,
              left: rect.left + (type === PHYS_PILL ? -xPad : xPad), 
              right: rect.right - (type === PHYS_PILL ? -xPad : xPad),
              top: rect.top,
              width: rect.width,
              centerX: rect.left + (rect.width / 2),
              sinkFactor,
              lineHeightTrim
          };
      });
  }, [colliders, enabled]);

  useEffect(() => {
    if (!enabled) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true }); 
    if (!ctx) return;

    let animationId: number;
    let particles: Particle[] = [];
    let isRunning = true;

    const palette = [
        ...colors.map(c => getHexFromColor(c)),
        '#FFD700', // Gold
        '#FFFFFF', // White
    ];

    const resize = () => {
      if (canvas && isRunning) {
          const dpr = window.devicePixelRatio || 1;
          canvas.width = window.innerWidth * dpr;
          canvas.height = window.innerHeight * dpr;
          ctx.scale(dpr, dpr);
          canvas.style.width = `${window.innerWidth}px`;
          canvas.style.height = `${window.innerHeight}px`;
      }
    };

    const randomRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const createParticle = (x: number, y: number): Particle => {
      const isAmbient = physicsVariant === 'ambient';
      
      return {
        x: x,
        y: y,
        prevY: y,
        wobble: Math.random() * 10,
        wobbleSpeed: isAmbient ? randomRange(0.01, 0.03) : randomRange(0.03, 0.07), 
        velocity: isAmbient ? randomRange(0.5, 1.5) : randomRange(1.5, 3.5),
        tiltAngle: Math.random() * Math.PI,
        color: palette[Math.floor(Math.random() * palette.length)],
        shape: Math.random() < 0.4 ? 'circle' : 'square',
        mass: randomRange(0.8, 1.2), 
        drift: isAmbient ? randomRange(-1, 1) : randomRange(-0.5, 0.5), 
        scale: isAmbient ? randomRange(0.6, 0.9) : randomRange(0.7, 1.0),
        rotation: randomRange(0, 360),
        rotationSpeed: randomRange(-2, 2),
        sliding: false,
        slideSlope: 0
      };
    };

    const init = () => {
      resize();
      const adaptiveMaxParticles = getMaxParticles();
      const baseCount = intensity === 'high' ? (physicsVariant === 'ambient' ? 150 : 120) : 60;
      const count = Math.min(baseCount, adaptiveMaxParticles);
      particles = [];
      for (let i = 0; i < count; i++) {
        particles.push(createParticle(
            randomRange(0, window.innerWidth), 
            randomRange(-window.innerHeight * 1.2, 0)
        ));
      }
    };

    const resolveCollision = (p: Particle, collider: OptimizedCollider): { hitY: number, slope: number } | null => {
        if (p.x < collider.left || p.x > collider.right) return null;

        const { type, top, width, centerX } = collider;

        if (type === PHYS_CURVED) {
            const distFromCenter = (p.x - centerX) / (width / 2);
            const curveOffset = (distFromCenter * distFromCenter) * collider.sinkFactor;
            
            return { 
                hitY: top + collider.lineHeightTrim + curveOffset, 
                slope: distFromCenter * 2.0 
            };
        } 
        else if (type === PHYS_PILL) {
            const dist = Math.abs(p.x - centerX) / (width / 2); 
            if (dist > 0.8) { 
                const curveDrop = (dist * dist * dist) * 3; 
                const slope = dist * (p.x > centerX ? 0.5 : -0.5);
                return { hitY: top + 4 + curveDrop, slope };
            }
            return { hitY: top + 4, slope: 0 };
        } 
        else if (type === PHYS_TEXT) {
            return { hitY: top + (collider.rect.height * 0.3), slope: 0 };
        }
        return { hitY: top + 2, slope: 0 };
    };

    const checkCollision = (p: Particle) => {
        if (p.sliding) return;
        const world = physicsWorldRef.current;
        const len = world.length;
        
        for (let i = 0; i < len; i++) {
            const collider = world[i];
            if (p.y > collider.rect.bottom) continue;
            if (p.y < collider.top - 20) continue;

            const surface = resolveCollision(p, collider);
            
            if (surface) {
                if (p.y >= surface.hitY && p.prevY <= surface.hitY + 5) {
                    p.y = surface.hitY;
                    p.velocity = 0;
                    p.sliding = true;
                    p.slideSlope = surface.slope;
                    p.rotationSpeed *= 0.5;
                    p.drift *= 0.5;
                    return; 
                }
            }
        }
    };

    const updatePhysics = (p: Particle, height: number) => {
        p.prevY = p.y; 

        if (physicsVariant === 'ambient') {
            p.wobble += p.wobbleSpeed;
            p.x += Math.sin(p.wobble) * 2 + (p.drift * 0.5);
            p.velocity += 0.05; 
            if (p.velocity > 2.5) p.velocity = 2.5;
            p.y += p.velocity;
            p.tiltAngle += 0.1;
            p.rotation += p.rotationSpeed * 0.5;
        } else {
            if (p.sliding) {
                if (Math.abs(p.slideSlope) > 0.1) {
                    p.x += p.slideSlope * 1.5;
                    p.rotation += p.slideSlope * 5;
                } else {
                    p.x += p.drift + Math.sin(p.wobble) * 0.2;
                }
                p.wobble += p.wobbleSpeed * 0.5;
                
                let supported = false;
                const world = physicsWorldRef.current;
                for (let i = 0; i < world.length; i++) {
                    const c = world[i];
                    if (Math.abs(p.x - c.centerX) < c.width) {
                        const surface = resolveCollision(p, c);
                        if (surface && Math.abs(p.y - surface.hitY) < 15) {
                            supported = true;
                            p.y += (surface.hitY - p.y) * 0.5;
                            p.slideSlope = surface.slope;
                            break;
                        }
                    }
                }

                if (!supported) {
                    p.sliding = false;
                    p.velocity = 1; 
                    p.rotationSpeed = randomRange(-2, 2);
                }
            } else {
                p.velocity += 0.05; 
                if (p.velocity > 4.5) p.velocity = 4.5;
                p.y += p.velocity;
                p.x += p.drift + Math.sin(p.wobble) * 1.5; 
                p.wobble += p.wobbleSpeed;
                p.rotation += p.rotationSpeed;
                checkCollision(p); 
            }
        }
    };

    const update = () => {
      if (!isRunning || !ctx || !canvas) return;

      const width = window.innerWidth;
      const height = window.innerHeight;

      ctx.clearRect(0, 0, width, height);

      // Shadows removed: canvas shadows are extremely expensive (applied per-particle).
      // Particles are too small for shadow to be visually noticeable.

      particles.forEach((p) => {
        updatePhysics(p, height);

        if (p.y > height + 20) {
           p.y = -20; 
           p.prevY = -20;
           p.x = randomRange(0, width);
           p.velocity = physicsVariant === 'ambient' ? randomRange(0.5, 1.0) : randomRange(1, 2); 
           p.drift = randomRange(-0.5, 0.5);
           p.sliding = false;
           p.slideSlope = 0;
        }

        const size = 6 * p.scale;
        const rotationX = physicsVariant === 'ambient' ? Math.cos(p.tiltAngle) : 1;
        const widthTilted = size * Math.abs(Math.cos(p.rotation * (Math.PI / 180))) * Math.abs(rotationX);
        const heightTilted = size * (physicsVariant === 'ambient' ? Math.abs(Math.sin(p.tiltAngle)) : 1);
        
        ctx.fillStyle = p.color;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.tiltAngle + (p.sliding ? p.slideSlope : 0)); 
        ctx.beginPath();
        if (p.shape === 'circle') {
            ctx.ellipse(0, 0, widthTilted / 2, (physicsVariant === 'ambient' ? heightTilted : size) / 2, 0, 0, 2 * Math.PI);
        } else {
            ctx.fillRect(-widthTilted / 2, -size / 2, widthTilted, (physicsVariant === 'ambient' ? heightTilted : size));
        }
        ctx.fill();
        ctx.restore();
      });

      animationId = requestAnimationFrame(update);
    };

    if (enabled) {
        window.addEventListener('resize', resize);
        init();
        update();
    }

    return () => {
      isRunning = false;
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, [colors, intensity, physicsVariant, enabled]);

  if (!enabled) return null;

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 pointer-events-none z-[100]" 
      style={{ width: '100%', height: '100%' }}
    />
  );
};
