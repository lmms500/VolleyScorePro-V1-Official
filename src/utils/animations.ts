
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
    filter: "none",
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
    filter: "brightness(1.15)",
    transition: { type: "spring", stiffness: 800, damping: 15 }
  },
  hover: {
    scale: isReducedMotion ? 1 : 1.02,
    transition: { type: "spring", stiffness: 400, damping: 25 }
  }
};

// 6. Liquid Ticker - Increased scale from 0.5 to 0.8 for smoother headroom
export const tickerVariants: Variants = {
  enter: (direction: number) => ({
    y: isReducedMotion ? 0 : (direction > 0 ? "60%" : "-60%"),
    opacity: 0,
    scale: isReducedMotion ? 1 : 0.8,
    filter: isReducedMotion ? "blur(0px)" : "blur(10px)",
    position: "relative",
    transition: isReducedMotion ? { duration: 0 } : {
      y: tickerSpring,
      scale: tickerSpring,
      opacity: { duration: 0.2, ease: "easeOut" },
      filter: { type: "tween", ease: "easeOut", duration: 0.2 }
    }
  }),
  center: {
    y: "0%",
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    position: "relative",
    zIndex: 1,
    transition: isReducedMotion ? { duration: 0 } : {
      y: tickerSpring,
      scale: tickerSpring,
      opacity: { duration: 0.2, ease: "easeOut" },
      filter: { type: "tween", ease: "easeOut", duration: 0.2 }
    }
  },
  exit: (direction: number) => ({
    y: isReducedMotion ? 0 : (direction > 0 ? "-60%" : "60%"),
    opacity: 0,
    scale: isReducedMotion ? 1 : 0.8,
    filter: isReducedMotion ? "blur(0px)" : "blur(10px)",
    position: "absolute",
    zIndex: 0,
    transition: isReducedMotion ? { duration: 0 } : {
      y: { duration: 0.25, ease: "easeIn" },
      scale: { duration: 0.25, ease: "easeIn" },
      opacity: { duration: 0.2, ease: "easeIn" },
      filter: { type: "tween", ease: "easeIn", duration: 0.2 }
    }
  })
};

// 7. Pulse (Intensified for Critical Points)
export const pulseHeartbeat: Variants = {
  idle: { scale: 1, opacity: 1 },
  pulse: {
    scale: isReducedMotion ? 1 : [1, 1.08, 1],
    opacity: [1, 0.8, 1],
    transition: {
      duration: 1.2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

// 8. Ghost Score (Background Highlight)
export const ghostScoreVariants: Variants = {
  hidden: { opacity: 0, scale: 0.5, filter: "blur(10px)" },
  visible: {
    opacity: 0.08,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.8, ease: "easeOut" }
  },
  pulse: {
    scale: [1, 1.1, 1],
    opacity: [0.08, 0.12, 0.08],
    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
  }
};

// 9. Stamp
export const stampVariants: Variants = {
  hidden: { scale: 2, opacity: 0, filter: "blur(10px)" },
  visible: {
    scale: 1,
    opacity: 1,
    filter: "none",
    transition: isReducedMotion ? { duration: 0 } : softBounce
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    filter: "blur(5px)",
    transition: { duration: 0.2 }
  }
};

// 10. Vignette (Sudden Death - Phase 1 Polish)
export const vignettePulse: Variants = {
  hidden: {
    opacity: 0,
    scale: 1.2,
    transition: { duration: 0.5 }
  },
  pulse: {
    opacity: [0.4, 0.7],
    scale: [1.05, 1],
    transition: {
      opacity: { duration: 1.5, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" },
      scale: { duration: 3, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }
    }
  }
};

// 11. List Item
export const listItemVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9, x: -10 },
  visible: { opacity: 1, scale: 1, x: 0, transition: isReducedMotion ? { duration: 0 } : liquidSpring },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } }
};
