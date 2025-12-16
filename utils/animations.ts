
import { Variants, Transition } from "framer-motion";

/**
 * VolleyScore Pro - Liquid Motion System 3.2 (Accessibility Aware)
 * 
 * Manages global motion preferences.
 */

let isReducedMotion = false;

export const setGlobalReducedMotion = (enabled: boolean) => {
  isReducedMotion = enabled;
};

// --- ADAPTIVE TRANSITIONS ---

const getTransition = (standard: Transition): Transition => {
  if (isReducedMotion) {
    return { duration: 0 }; // Instant
  }
  return standard;
};

// "Liquid Spring": Fluid, responsive.
export const liquidSpring: Transition = {
  type: "spring",
  stiffness: 400,
  damping: 35,
  mass: 0.8
};

// "Soft Bounce": Playful elements.
export const softBounce: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 20,
  mass: 1
};

// "Ticker Slide": Fast numbers.
export const tickerSpring: Transition = {
  type: "spring",
  stiffness: 250,
  damping: 25,
  mass: 0.5
};

// "Snappy": Quick UI toggles.
export const springSnappy: Transition = {
  type: "spring",
  stiffness: 400,
  damping: 25,
  mass: 1
};

// "Premium": Standard interaction.
export const springPremium: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 20,
  mass: 0.8
};

// --- CORE VARIANTS (Dynamic) ---

// 1. Modal Entrance
export const modalVariants: Variants = {
  hidden: { 
    opacity: 0,
    scale: 0.92,
    y: 20,
    filter: "blur(4px)",
    transition: { duration: 0.2 }
  },
  visible: { 
    opacity: 1,
    scale: 1,
    y: 0,
    filter: "none", // Fix: Explicitly remove blur
    transition: isReducedMotion ? { duration: 0.1 } : liquidSpring
  },
  exit: { 
    opacity: 0, 
    scale: 0.96,
    y: 10,
    filter: "blur(4px)",
    transition: { duration: 0.2, ease: "easeIn" }
  }
};

// 2. Staggered Container
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: isReducedMotion ? 0 : 0.05,
      delayChildren: isReducedMotion ? 0 : 0.05
    }
  },
  exit: {
    opacity: 0,
    transition: { staggerChildren: isReducedMotion ? 0 : 0.02, staggerDirection: -1 }
  }
};

// 3. Staggered Item
export const staggerItem: Variants = {
  hidden: { 
    opacity: 0, 
    y: 15, 
    scale: 0.95 
  },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: isReducedMotion ? { duration: 0 } : liquidSpring 
  },
  exit: { 
    opacity: 0, 
    scale: 0.9, 
    transition: { duration: 0.15 } 
  }
};

// 4. Backdrop Fade
export const overlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { duration: isReducedMotion ? 0.1 : 0.4, ease: "easeOut" } 
  },
  exit: { 
    opacity: 0, 
    transition: { duration: 0.1, ease: "easeIn" } 
  }
};

// 5. Button Press
export const buttonTap: Variants = {
  idle: { scale: 1, filter: "brightness(1)" },
  tap: { 
    scale: isReducedMotion ? 1 : 0.94, 
    filter: "brightness(1.1)", 
    transition: { type: "spring", stiffness: 800, damping: 15 } 
  },
  hover: { 
    scale: isReducedMotion ? 1 : 1.02, 
    transition: { type: "spring", stiffness: 400, damping: 25 } 
  }
};

// 6. Liquid Ticker
export const tickerVariants: Variants = {
  enter: (direction: number) => ({
    y: isReducedMotion ? 0 : (direction > 0 ? "60%" : "-60%"), 
    opacity: 0,
    scale: isReducedMotion ? 1 : 0.5,
    filter: isReducedMotion ? "blur(0px)" : "blur(10px)",
    position: "absolute"
  }),
  center: {
    y: "0%",
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    position: "relative",
    zIndex: 1,
    transition: isReducedMotion ? { duration: 0 } : tickerSpring
  },
  exit: (direction: number) => ({
    y: isReducedMotion ? 0 : (direction > 0 ? "-60%" : "60%"),
    opacity: 0,
    scale: isReducedMotion ? 1 : 0.5,
    filter: isReducedMotion ? "blur(0px)" : "blur(10px)",
    position: "absolute",
    zIndex: 0,
    transition: { duration: isReducedMotion ? 0 : 0.25 }
  })
};

// 7. Pulse
export const pulseHeartbeat: Variants = {
  idle: { scale: 1, opacity: 1 },
  pulse: {
    scale: isReducedMotion ? 1 : [1, 1.05, 1],
    opacity: [1, 0.8, 1],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

// 8. Stamp
export const stampVariants: Variants = {
  hidden: { scale: 2, opacity: 0, filter: "blur(10px)" },
  visible: { 
    scale: 1, 
    opacity: 1, 
    filter: "blur(0px)", // Stamp effect needs blur to animate sharpness.
    transition: isReducedMotion ? { duration: 0 } : softBounce
  },
  exit: { 
    opacity: 0, 
    scale: 0.8,
    filter: "blur(5px)",
    transition: { duration: 0.2 } 
  }
};

// 9. Vignette
export const vignettePulse: Variants = {
  hidden: { opacity: 0 },
  pulse: {
    opacity: [0.2, 0.6],
    transition: {
      duration: 1,
      repeat: Infinity,
      repeatType: "reverse",
      ease: "easeInOut"
    }
  }
};

// 10. List Item
export const listItemVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9, x: -10 },
  visible: { opacity: 1, scale: 1, x: 0, transition: isReducedMotion ? { duration: 0 } : liquidSpring },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } }
};
