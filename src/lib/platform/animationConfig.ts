/**
 * Animation Configuration - Adaptive Performance System
 *
 * Provides platform-aware animation settings that maintain visual aesthetics
 * while optimizing for device capabilities.
 *
 * Key Optimizations for Android:
 * - Reduced blur radius (12px vs 24px)
 * - Faster transitions (250ms vs 350ms)
 * - CSS containment for isolation
 * - No filter: blur() during animations
 */

import { Capacitor } from '@capacitor/core';

export interface AnimationConfig {
  readonly backdropBlur: 'none' | 'sm' | 'md' | 'xl' | '2xl';
  readonly blurRadius: number;
  readonly modalDuration: number;
  readonly modalUseSpring: boolean;
  readonly modalUseScale: boolean;
  readonly modalUseFilterBlur: boolean;
  readonly useWillChange: boolean;
  readonly useGPUTransform: boolean;
  readonly useContain: boolean;
  readonly containValue: 'none' | 'content' | 'strict';
  readonly maxParticles: number;
  readonly backgroundGlowBlur: number;
  readonly isAndroid: boolean;
  readonly isLowEnd: boolean;
}

const PLATFORM_ANDROID = 'android';

function detectAndroid(): boolean {
  if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === PLATFORM_ANDROID) {
    return true;
  }
  const ua = navigator.userAgent.toLowerCase();
  return ua.includes('android');
}

function detectLowEnd(): boolean {
  const cores = navigator.hardwareConcurrency || 2;
  const memory = (navigator as any).deviceMemory || 2;
  return cores <= 4 || memory <= 2;
}

function detectReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

const HIGH_END_CONFIG: AnimationConfig = {
  backdropBlur: 'xl',
  blurRadius: 24,
  modalDuration: 350,
  modalUseSpring: true,
  modalUseScale: true,
  modalUseFilterBlur: true,
  useWillChange: true,
  useGPUTransform: true,
  useContain: false,
  containValue: 'none',
  maxParticles: 120,
  backgroundGlowBlur: 90,
  isAndroid: false,
  isLowEnd: false,
};

const ANDROID_CONFIG: AnimationConfig = {
  backdropBlur: 'sm',
  blurRadius: 8,
  modalDuration: 250,
  modalUseSpring: false,
  modalUseScale: true,
  modalUseFilterBlur: false,
  useWillChange: false,
  useGPUTransform: false,
  useContain: true,
  containValue: 'content',
  maxParticles: 40,
  backgroundGlowBlur: 35,
  isAndroid: true,
  isLowEnd: false,
};

const LOW_END_CONFIG: AnimationConfig = {
  backdropBlur: 'sm',
  blurRadius: 8,
  modalDuration: 150,
  modalUseSpring: false,
  modalUseScale: false,
  modalUseFilterBlur: false,
  useWillChange: false,
  useGPUTransform: false,
  useContain: true,
  containValue: 'strict',
  maxParticles: 30,
  backgroundGlowBlur: 0,
  isAndroid: false,
  isLowEnd: true,
};

const REDUCED_MOTION_CONFIG: AnimationConfig = {
  backdropBlur: 'sm',
  blurRadius: 8,
  modalDuration: 0,
  modalUseSpring: false,
  modalUseScale: false,
  modalUseFilterBlur: false,
  useWillChange: false,
  useGPUTransform: false,
  useContain: true,
  containValue: 'strict',
  maxParticles: 0,
  backgroundGlowBlur: 0,
  isAndroid: false,
  isLowEnd: true,
};

let cachedConfig: AnimationConfig | null = null;
let cachedPlatform: { isAndroid: boolean; isLowEnd: boolean } | null = null;

export function getPlatformInfo(): { isAndroid: boolean; isLowEnd: boolean } {
  if (cachedPlatform) return cachedPlatform;
  cachedPlatform = {
    isAndroid: detectAndroid(),
    isLowEnd: detectLowEnd(),
  };
  return cachedPlatform;
}

export function getAnimationConfig(): AnimationConfig {
  if (cachedConfig) return cachedConfig;

  if (detectReducedMotion()) {
    cachedConfig = REDUCED_MOTION_CONFIG;
    return cachedConfig;
  }

  const { isAndroid, isLowEnd } = getPlatformInfo();

  if (isAndroid) {
    cachedConfig = ANDROID_CONFIG;
  } else if (isLowEnd) {
    cachedConfig = LOW_END_CONFIG;
  } else {
    cachedConfig = HIGH_END_CONFIG;
  }

  return cachedConfig;
}

export function getBlurClass(intensity: 'low' | 'medium' | 'high' = 'medium'): string {
  const config = getAnimationConfig();

  if (config.backdropBlur === 'none') return '';

  const blurMap: Record<string, Record<string, string>> = {
    none: { low: '', medium: '', high: '' },
    sm: { low: 'backdrop-blur-sm', medium: 'backdrop-blur-sm', high: 'backdrop-blur-sm' },
    md: { low: 'backdrop-blur-sm', medium: 'backdrop-blur-md', high: 'backdrop-blur-lg' },
    xl: { low: 'backdrop-blur-lg', medium: 'backdrop-blur-xl', high: 'backdrop-blur-xl' },
    '2xl': { low: 'backdrop-blur-xl', medium: 'backdrop-blur-2xl', high: 'backdrop-blur-2xl' },
  };

  return blurMap[config.backdropBlur]?.[intensity] || '';
}

export function getTransitionDuration(): number {
  return getAnimationConfig().modalDuration;
}

export function shouldUseSpringPhysics(): boolean {
  return getAnimationConfig().modalUseSpring;
}

export function getMaxParticles(): number {
  return getAnimationConfig().maxParticles;
}

export function clearConfigCache(): void {
  cachedConfig = null;
  cachedPlatform = null;
}
