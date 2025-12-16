
import React, { useEffect, useRef } from 'react';
import { getHexFromColor } from '../../utils/colors';
import { TeamColor } from '../../types';
import { useLayoutManager, ColliderRect } from '../../contexts/LayoutContext';

interface ConfettiProps {
  colors: TeamColor[]; 
  intensity?: 'low' | 'high';
  physicsVariant?: 'interactive' | 'ambient';
}

interface Particle {
  x: number;
  y: number;
  prevY: number; // For Continuous Collision Detection
  wobble: number;
  wobbleSpeed: number;
  velocity: number;
  tiltAngle: number;
  color: string;
  shape: 'square' | 'circle';
  // Physics Properties
  mass: number;
  drift: number;
  scale: number;
  rotation: number;
  rotationSpeed: number;
  // Interaction
  sliding: boolean;
  slideSlope: number; // Stores the slope of the surface currently sliding on
}

export const Confetti: React.FC<ConfettiProps> = ({ 
  colors, 
  intensity = 'high',
  physicsVariant = 'ambient' // Default to ambient (safer/performance)
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { colliders } = useLayoutManager(); // Access registered UI colliders
  
  // Ref to hold colliders for the animation loop (avoid stale closures)
  const collidersRef = useRef<ColliderRect[]>(colliders);
  
  useEffect(() => {
      collidersRef.current = colliders;
  }, [colliders]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true }); // Explicit alpha for transparency perf
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
        // Ambient: Slower wobble for floating effect. Interactive: Faster for chaotic energy.
        wobbleSpeed: isAmbient ? randomRange(0.01, 0.03) : randomRange(0.03, 0.07), 
        // Ambient: Low gravity start. Interactive: Explosive start.
        velocity: isAmbient ? randomRange(0.5, 1.5) : randomRange(1.5, 3.5),
        tiltAngle: Math.random() * Math.PI,
        color: palette[Math.floor(Math.random() * palette.length)],
        shape: Math.random() < 0.4 ? 'circle' : 'square',
        mass: randomRange(0.8, 1.2), 
        // Ambient: More horizontal sway (leaf-like).
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
      // Optimization: Ambient mode is cheaper (no collision), so we can afford slightly more particles visually
      const count = intensity === 'high' ? (physicsVariant === 'ambient' ? 250 : 200) : 80;
      
      particles = [];
      // Initialize spread out vertically ABOVE and ON screen
      for (let i = 0; i < count; i++) {
        particles.push(createParticle(
            randomRange(0, window.innerWidth), 
            randomRange(-window.innerHeight * 1.2, 0) // Higher start point
        ));
      }
    };

    /**
     * ADVANCED COLLISION LOGIC
     * Calculates specific hitboxes based on element type to simulate curves and text bodies.
     */
    const getHitSurfaceY = (p: Particle, collider: ColliderRect): { hitY: number, slope: number } | null => {
        const { rect, id } = collider;
        
        let xPad = 2; // Default horizontal tolerance
        
        // --- HISTORY BAR REFINEMENT ---
        // History items are small pills. We need tight collision to allow falling through gaps.
        if (id.includes('hist-')) {
            xPad = -4; // Negative padding: Particle must be 4px INSIDE the box to collide.
            
            // Check X bounds first with strict padding
            if (p.x < rect.left - xPad || p.x > rect.right + xPad) return null;

            // Flat surface, but sink it slightly to match the "text" height inside the pill
            return { hitY: rect.top + 4, slope: 0 };
        }

        // --- TIMEOUT / FOOTER REFINEMENT ---
        // The footer buttons usually have py-2 padding. We need to sink the collision surface
        // so particles land on the visible button, not the invisible padding box.
        if (id.includes('sc-footer')) {
            xPad = 4; // Tighten horizontal bounds for the pill shape
            if (p.x < rect.left + xPad || p.x > rect.right - xPad) return null;

            // Offset Y: The button has py-2 (~8px). 
            // We sink 6px to bypass the transparent area.
            const visualTopOffset = 6; 
            
            // Add slight curvature for rounded-xl corners
            // As particle gets closer to edge (dist -> 1), drop it slightly
            const width = rect.width;
            const centerX = rect.left + (width / 2);
            const dist = Math.abs(p.x - centerX) / (width / 2); // 0 (center) to 1 (edge)
            const curveDrop = Math.pow(dist, 3) * 3; // 3px drop at extreme edges

            return { 
                hitY: rect.top + visualTopOffset + curveDrop, 
                slope: dist * (p.x > centerX ? 0.5 : -0.5) // Slight slope to shed particles off corners
            };
        }

        // 1. HORIZONTAL CHECK (Broad Phase for standard elements)
        if (p.x < rect.left + xPad || p.x > rect.right - xPad) return null;

        // 2. CALCULATE SURFACE GEOMETRY (Narrow Phase)
        
        // A. Scoreboard Numbers: Parabolic/Curved Surface
        // Simulates the curvature of 0, 3, 6, 8, 9.
        if (id.includes('sc-number')) {
            const width = rect.width;
            const centerX = rect.left + (width / 2);
            const distFromCenter = (p.x - centerX) / (width / 2); // -1 (left) to 1 (right)
            
            // "Sink" amount: How much lower the edges are compared to center
            // 0.35 creates a nice curve but keeps the edges high enough to catch particles
            const sinkFactor = rect.height * 0.35; 
            
            // Base offset: Lower the whole surface just slightly to account for line-height
            // Reduced to 0.1 to prevent visual clipping/tunneling at the top
            const lineHeigthTrim = rect.height * 0.1; 

            // Parabolic function: y = x^2.2 (Slightly flatter top than 2.5)
            const curveOffset = Math.pow(Math.abs(distFromCenter), 2.2) * sinkFactor;
            
            const hitY = rect.top + lineHeigthTrim + curveOffset;
            
            // Calculate Slope for sliding
            const slope = distFromCenter * 2.5; // Steepness multiplier for sliding physics

            return { hitY, slope };
        }

        // B. Text Headers/Names: Flat but Deep Sunk
        if (id.includes('sc-header') || id.includes('hist-')) { // Fallback for other hist items if ID changes
            const textSink = rect.height * 0.3; 
            return { hitY: rect.top + textSink, slope: 0 };
        }

        // C. Standard Elements (Controls, Badges): Flat Surface
        return { hitY: rect.top + 2, slope: 0 };
    };

    const checkCollision = (p: Particle) => {
        // If sliding, we handle physics in update loop, but we need to check if it fell off
        if (p.sliding) return;

        for (const c of collidersRef.current) {
            const surface = getHitSurfaceY(p, c);
            
            if (surface) {
                // CONTINUOUS COLLISION DETECTION (CCD)
                if (p.y >= surface.hitY && p.prevY <= surface.hitY + 2) {
                    // LANDED!
                    // Snap exactly to surface
                    p.y = surface.hitY;
                    p.velocity = 0;
                    p.sliding = true;
                    p.slideSlope = surface.slope;
                    
                    // Dampen movement
                    p.rotationSpeed *= 0.5;
                    p.drift *= 0.5;
                    return;
                }
            }
        }
    };

    // Physics Update Logic - Separated by Variant
    const updatePhysics = (p: Particle, height: number) => {
        p.prevY = p.y; 

        if (physicsVariant === 'ambient') {
            // --- AMBIENT MODE (Leaf Falling) ---
            // Simulates air resistance and sway. Ignores collision.
            
            // Sway logic: Sine wave based on time (wobble)
            p.wobble += p.wobbleSpeed;
            
            // Apply drift + sway to X
            p.x += Math.sin(p.wobble) * 2 + (p.drift * 0.5);
            
            // Gravity with Air Resistance (Terminal Velocity is low)
            p.velocity += 0.05; 
            const terminalVelocity = 2.5; 
            if (p.velocity > terminalVelocity) p.velocity = terminalVelocity;
            p.y += p.velocity;

            // 3D-ish rotation
            p.tiltAngle += 0.1;
            p.rotation += p.rotationSpeed * 0.5;

        } else {
            // --- INTERACTIVE MODE (Bouncing / Sliding) ---
            
            if (p.sliding) {
                // SLIDING PHYSICS
                if (Math.abs(p.slideSlope) > 0.1) {
                    p.x += p.slideSlope * 1.5; // Slide down curve
                    p.rotation += p.slideSlope * 5; // Roll down
                } else {
                    // Flat surface friction/drift
                    p.x += p.drift + Math.sin(p.wobble) * 0.2;
                }
                
                p.wobble += p.wobbleSpeed * 0.5;
                
                // Check support
                let supported = false;
                for (const c of collidersRef.current) {
                    const surface = getHitSurfaceY(p, c);
                    if (surface && Math.abs(p.y - surface.hitY) < 15) {
                        supported = true;
                        p.y += (surface.hitY - p.y) * 0.5; // Snap/Lerp
                        p.slideSlope = surface.slope;
                        break;
                    }
                }

                if (!supported) {
                    p.sliding = false;
                    p.velocity = 1; 
                    p.rotationSpeed = randomRange(-2, 2);
                }

            } else {
                // FALLING PHYSICS (Heavier, Paper-like)
                p.velocity += 0.05; 
                const terminalVelocity = 4.5; 
                if (p.velocity > terminalVelocity) p.velocity = terminalVelocity;

                p.y += p.velocity;
                p.x += p.drift + Math.sin(p.wobble) * 1.5; 
                p.wobble += p.wobbleSpeed;
                p.rotation += p.rotationSpeed;
                
                checkCollision(p); // Only check collision in interactive mode
            }
        }
    };

    const update = () => {
      if (!isRunning || !ctx || !canvas) return;

      const width = window.innerWidth;
      const height = window.innerHeight;

      ctx.clearRect(0, 0, width, height);

      // --- SHADOW SETTINGS (Subtle Depth) ---
      ctx.shadowColor = "rgba(0, 0, 0, 0.1)";
      ctx.shadowBlur = physicsVariant === 'ambient' ? 0 : 1; // Perf check for ambient
      ctx.shadowOffsetY = 1;
      ctx.shadowOffsetX = 0.5;

      particles.forEach((p) => {
        updatePhysics(p, height);

        // RESET LOGIC (Looping)
        if (p.y > height + 20) {
           p.y = -20; 
           p.prevY = -20;
           p.x = randomRange(0, width);
           p.velocity = physicsVariant === 'ambient' ? randomRange(0.5, 1.0) : randomRange(1, 2); 
           p.drift = randomRange(-0.5, 0.5);
           p.sliding = false;
           p.slideSlope = 0;
        }

        // --- DRAWING ---
        const size = 6 * p.scale;
        
        // 3D Rotation Simulation
        // Ambient mode adds tiltAngle to simulate a flipping leaf
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

    window.addEventListener('resize', resize);
    init();
    update();

    return () => {
      isRunning = false;
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, [colors, intensity, physicsVariant]);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 pointer-events-none z-[100]" 
      style={{ width: '100%', height: '100%' }}
    />
  );
};
