
import { Variants, Transition } from "framer-motion";
import { getAnimationConfig, AnimationConfig } from "@lib/platform/animationConfig";

/**
 * VolleyScore Pro - Liquid Motion System 4.0 (Platform Adaptive)
 *
 * Provides platform-aware animation variants that optimize for Android
 * while maintaining visual quality on high-end devices.
 */

let isReducedMotion = false;

export const setGlobalReducedMotion = (enabled: boolean) => {
  isReducedMotion = enabled;
};

// --- ADAPTIVE TRANSITIONS ---

const getTransition = (standard: Transition): Transition => {
  if (isReducedMotion) {
    return { duration: 0 };
  }
  return standard;
};

export const getAdaptiveTransition = (): Transition => {
  const config = getAnimationConfig();
  if (isReducedMotion) return { duration: 0 };
  
  if (config.modalUseSpring) {
    return {
      type: "spring",
      stiffness: 300,
      damping: 30,
      mass: 0.8
    };
  }
  
  return {
    duration: config.modalDuration / 1000,
    ease: [0.25, 1, 0.5, 1] as const
  };
};

export const liquidSpring: Transition = {
  type: "tween",
  duration: 0.25,
  ease: [0.25, 1, 0.5, 1]
};

export const softBounce: Transition = {
  type: "tween",
  duration: 0.3,
  ease: [0.25, 1, 0.5, 1]
};

export const tickerSpring: Transition = {
  type: "tween",
  duration: 0.2,
  ease: [0.25, 1, 0.5, 1]
};

export const springSnappy: Transition = {
  type: "tween",
  duration: 0.2,
  ease: [0.25, 1, 0.5, 1]
};

export const springPremium: Transition = {
  type: "tween",
  duration: 0.25,
  ease: [0.25, 1, 0.5, 1]
};

// --- ADAPTIVE VARIANTS ---

export const getAdaptiveModalVariants = (): Variants => {
  const config = getAnimationConfig();
  const duration = config.modalDuration / 1000;
  
  return {
    hidden: {
      opacity: 0,
      ...(config.modalUseScale && { scale: 0.95 }),
      y: 20,
      transition: { duration: Math.max(0.1, duration * 0.5), ease: [0.25, 1, 0.5, 1] }
    },
    visible: {
      opacity: 1,
      ...(config.modalUseScale && { scale: 1 }),
      y: 0,
      transition: config.modalUseSpring
        ? { type: "spring", stiffness: 300, damping: 30, mass: 0.8 }
        : { duration, ease: [0.25, 1, 0.5, 1] }
    },
    exit: {
      opacity: 0,
      ...(config.modalUseScale && { scale: 0.96 }),
      y: 10,
      transition: { duration: Math.max(0.08, duration * 0.4), ease: [0.32, 0, 0.67, 0] }
    }
  };
};

// Legacy static variants (kept for backward compatibility)
export const modalVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.96,
    y: 16,
    transition: { duration: 0.2, ease: [0.25, 1, 0.5, 1] }
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: isReducedMotion ? { duration: 0.1 } : { duration: 0.25, ease: [0.25, 1, 0.5, 1] }
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: 8,
    transition: { duration: 0.15, ease: [0.32, 0, 0.67, 0] }
  }
};

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

export const staggerItem: Variants = {
  hidden: {
    opacity: 0,
    y: 12,
    scale: 0.96
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: isReducedMotion ? { duration: 0 } : { duration: 0.2, ease: [0.25, 1, 0.5, 1] }
  },
  exit: {
    opacity: 0,
    scale: 0.94,
    transition: { duration: 0.12, ease: [0.32, 0, 0.67, 0] }
  }
};

export const overlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: isReducedMotion ? 0.1 : 0.2, ease: [0.25, 1, 0.5, 1] }
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.12, ease: [0.32, 0, 0.67, 0] }
  }
};

export const buttonTap: Variants = {
  idle: { scale: 1 },
  tap: {
    scale: isReducedMotion ? 1 : 0.94,
    transition: { type: "spring", stiffness: 800, damping: 15 }
  },
  hover: {
    scale: isReducedMotion ? 1 : 1.02,
    transition: { type: "spring", stiffness: 400, damping: 25 }
  }
};

export const tickerVariants: Variants = {
  enter: (direction: number) => ({
    y: isReducedMotion ? 0 : (direction > 0 ? "60%" : "-60%"),
    opacity: 0,
    scale: isReducedMotion ? 1 : 0.8,
    position: "relative",
    transition: isReducedMotion ? { duration: 0 } : {
      y: tickerSpring,
      scale: tickerSpring,
      opacity: { duration: 0.15, ease: "easeOut" }
    }
  }),
  center: {
    y: "0%",
    opacity: 1,
    scale: 1,
    position: "relative",
    zIndex: 1,
    transition: isReducedMotion ? { duration: 0 } : {
      y: tickerSpring,
      scale: tickerSpring,
      opacity: { duration: 0.15, ease: "easeOut" }
    }
  },
  exit: (direction: number) => ({
    y: isReducedMotion ? 0 : (direction > 0 ? "-60%" : "60%"),
    opacity: 0,
    scale: isReducedMotion ? 1 : 0.8,
    position: "absolute",
    zIndex: 0,
    transition: isReducedMotion ? { duration: 0 } : {
      y: { duration: 0.2, ease: "easeIn" },
      scale: { duration: 0.2, ease: "easeIn" },
      opacity: { duration: 0.15, ease: "easeIn" }
    }
  })
};

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

export const ghostScoreVariants: Variants = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: {
    opacity: 0.08,
    scale: 1,
    transition: { duration: 0.6, ease: "easeOut" }
  },
  pulse: {
    scale: [1, 1.1, 1],
    opacity: [0.08, 0.12, 0.08],
    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
  }
};

export const stampVariants: Variants = {
  hidden: { scale: 1.5, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: isReducedMotion ? { duration: 0 } : softBounce
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    transition: { duration: 0.15 }
  }
};

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

export const listItemVariants: Variants = {
  hidden: { opacity: 0, scale: 0.96, x: -8 },
  visible: { opacity: 1, scale: 1, x: 0, transition: isReducedMotion ? { duration: 0 } : { duration: 0.2, ease: [0.25, 1, 0.5, 1] } },
  exit: { opacity: 0, scale: 0.96, transition: { duration: 0.12, ease: [0.32, 0, 0.67, 0] } }
};

// --- SCOUT MODAL DESIGN LANGUAGE ---

export const scoutSpring: Transition = {
  type: "tween",
  duration: 0.2,
  ease: [0.25, 1, 0.5, 1]
};

export const getAdaptiveScoutSlideVariants = (): Variants => {
  const config = getAnimationConfig();
  const duration = config.modalDuration / 1000;
  
  return {
    enter: (direction: number) => ({
      x: direction > 0 ? "20%" : "-20%",
      opacity: 0,
      scale: config.modalUseScale ? 0.98 : 1
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: config.modalUseSpring
        ? { ...scoutSpring, delay: 0.05 }
        : { duration, ease: [0.25, 1, 0.5, 1], delay: 0.03 }
    },
    exit: (direction: number) => ({
      x: direction < 0 ? "20%" : "-20%",
      opacity: 0,
      scale: config.modalUseScale ? 0.98 : 1,
      transition: { duration: Math.max(0.1, duration * 0.5), ease: "easeIn" as const }
    })
  };
};

export const scoutSlideVariants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "16%" : "-16%",
    opacity: 0,
    scale: 0.98
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: isReducedMotion ? { duration: 0.1 } : {
      duration: 0.2,
      ease: [0.25, 1, 0.5, 1],
      delay: 0.03
    }
  },
  exit: (direction: number) => ({
    x: direction < 0 ? "16%" : "-16%",
    opacity: 0,
    scale: 0.98,
    transition: { duration: 0.12, ease: [0.32, 0, 0.67, 0] }
  })
};

export const blurFocusVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.96
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: isReducedMotion ? { duration: 0.1 } : {
      duration: 0.25,
      ease: [0.25, 1, 0.5, 1]
    }
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    transition: { duration: 0.12, ease: [0.32, 0, 0.67, 0] }
  }
};

export const scoutStaggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: isReducedMotion ? 0 : 0.04,
      delayChildren: isReducedMotion ? 0 : 0.05
    }
  },
  exit: {
    opacity: 0,
    transition: { staggerChildren: isReducedMotion ? 0 : 0.02, staggerDirection: -1 }
  }
};

export const scoutStaggerItem: Variants = {
  hidden: {
    opacity: 0,
    y: 10,
    scale: 0.97
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: isReducedMotion ? { duration: 0 } : {
      duration: 0.2,
      ease: [0.25, 1, 0.5, 1]
    }
  },
  exit: {
    opacity: 0,
    scale: 0.94,
    transition: { duration: 0.1 }
  }
};

// --- COURT PLAYER ANIMATIONS ---

export const courtPlayerTransition: Transition = {
  type: "tween",
  duration: 0.25,
  ease: [0.25, 0.1, 0.25, 1]
};

export const courtPlayerTransitionSmooth: Transition = {
  type: "tween",
  duration: 0.3,
  ease: [0.25, 0.1, 0.25, 1]
};

export const getCourtPlayerVariants = (): Variants => {
  const config = getAnimationConfig();
  
  if (isReducedMotion || config.isLowEnd) {
    return {
      initial: { opacity: 0, scale: 0.9 },
      animate: { 
        opacity: 1, 
        scale: 1,
        transition: { duration: 0.15, ease: [0.25, 1, 0.5, 1] }
      },
      exit: { 
        opacity: 0, 
        scale: 0.9,
        transition: { duration: 0.1 }
      }
    };
  }
  
  return {
    initial: { opacity: 0, scale: 0.85 },
    animate: { 
      opacity: 1, 
      scale: 1,
      transition: courtPlayerTransition
    },
    exit: { 
      opacity: 0, 
      scale: 0.9,
      transition: { duration: 0.2, ease: [0.32, 0, 0.67, 0] }
    }
  };
};

export const courtPlayerPositionTransition: Transition = {
  type: "tween",
  duration: 0.3,
  ease: [0.25, 0.1, 0.25, 1]
};

export const courtServeRingTransition: Transition = {
  type: "tween",
  duration: 0.25,
  ease: [0.25, 0.1, 0.25, 1]
};

// --- PREMIUM LANDING PAGE ANIMATIONS ---

export const premiumSpring: Transition = {
  type: "spring",
  stiffness: 120,
  damping: 20,
  mass: 0.8
};

export const softEase: Transition = {
  duration: 0.4,
  ease: [0.25, 0.1, 0.25, 1]
};

export const revealUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }
  }
};

export const revealDown: Variants = {
  hidden: { opacity: 0, y: -40 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }
  }
};

export const revealScale: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }
  }
};

export const revealLeft: Variants = {
  hidden: { opacity: 0, x: -50 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }
  }
};

export const revealRight: Variants = {
  hidden: { opacity: 0, x: 50 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }
  }
};

export const staggerReveal: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1]
    }
  }
};

export const staggerRevealItem: Variants = {
  hidden: { opacity: 0, y: 25, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }
  }
};

export const floating: Variants = {
  initial: { y: 0 },
  animate: {
    y: [-8, 8, -8],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

export const float: Variants = {
  initial: { y: 0, rotate: 0 },
  animate: {
    y: [-10, 10, -10],
    rotate: [0, 2, 0, -2, 0],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

export const pulseGlow: Variants = {
  initial: { boxShadow: "0 0 0 0 rgba(99, 102, 241, 0)" },
  animate: {
    boxShadow: [
      "0 0 20px 5px rgba(99, 102, 241, 0.3)",
      "0 0 40px 15px rgba(99, 102, 241, 0.5)",
      "0 0 20px 5px rgba(99, 102, 241, 0.3)"
    ],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

export const shimmer: Variants = {
  hidden: { backgroundPosition: "-200% 0" },
  visible: {
    backgroundPosition: "200% 0",
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "linear"
    }
  }
};

export const typewriter: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.3
    }
  }
};

export const typewriterChar: Variants = {
  hidden: { opacity: 0, y: 5 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.1 }
  }
};

export const magneticHover: Variants = {
  idle: { scale: 1 },
  hover: { 
    scale: 1.05,
    transition: { type: "spring", stiffness: 400, damping: 25 }
  }
};

export const cardHover3D: Variants = {
  idle: { rotateX: 0, rotateY: 0 },
  hover: { 
    rotateX: 2, 
    rotateY: -2,
    transition: { duration: 0.3, ease: "easeOut" }
  }
};

export const morphIcon: Variants = {
  idle: { scale: 1 },
  hover: { 
    scale: 1.2,
    transition: { type: "spring", stiffness: 300, damping: 15 }
  }
};

export const glowTrail: Variants = {
  idle: { opacity: 0 },
  hover: { 
    opacity: 1,
    transition: { duration: 0.3 }
  }
};

export const timelineDraw: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: { 
    pathLength: 1, 
    opacity: 1,
    transition: { 
      pathLength: { duration: 1.5, ease: "easeInOut" },
      opacity: { duration: 0.3 }
    }
  }
};

export const scrollProgress: Variants = {
  initial: { scaleX: 0 },
  animate: { 
    scaleX: 1,
    transition: { duration: 0.3 }
  }
};

export const parallaxY: (offset: number) => Variants = (offset = 50) => ({
  hidden: { y: offset },
  visible: { 
    y: 0,
    transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }
  }
});

export const revealClip: Variants = {
  hidden: { clipPath: "inset(0 100% 0 0)" },
  visible: { 
    clipPath: "inset(0 0% 0 0)",
    transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }
  }
};

export const ripple: Variants = {
  initial: { scale: 0, opacity: 0.5 },
  animate: { 
    scale: 4, 
    opacity: 0,
    transition: { duration: 0.6 }
  }
};
