
import { Capacitor } from '@capacitor/core';

export interface IPlatformCapabilities {
  isNative: boolean;
  isWeb: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isPWA: boolean;
  isStandalone: boolean;
}

/**
 * PlatformService v1.0
 * Single Source of Truth for runtime environment detection.
 */
class PlatformService implements IPlatformCapabilities {
  private static instance: PlatformService;
  
  // Cache flags to avoid repeated window/navigator lookups
  private _isPWA: boolean;
  private _isStandalone: boolean;

  private constructor() {
    // Detect PWA/Standalone mode once on initialization
    this._isStandalone = typeof window !== 'undefined' && (
      window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as any).standalone === true
    );
    
    // Check if running as PWA (Web + Standalone + Not Native wrapper)
    this._isPWA = this._isStandalone && !this.isNative;
  }

  public static getInstance(): PlatformService {
    if (!PlatformService.instance) {
      PlatformService.instance = new PlatformService();
    }
    return PlatformService.instance;
  }

  /**
   * Returns true if running in Capacitor (iOS or Android wrapper).
   */
  public get isNative(): boolean {
    return Capacitor.isNativePlatform();
  }

  /**
   * Returns true if running in a standard browser or PWA.
   */
  public get isWeb(): boolean {
    return !this.isNative;
  }

  public get isIOS(): boolean {
    return Capacitor.getPlatform() === 'ios';
  }

  public get isAndroid(): boolean {
    return Capacitor.getPlatform() === 'android';
  }

  /**
   * Returns true if the app is installed to the home screen (PWA) but NOT a native app.
   */
  public get isPWA(): boolean {
    return this._isPWA;
  }

  /**
   * Returns true if the app is running without browser chrome (Native OR PWA).
   */
  public get isStandalone(): boolean {
    return this._isStandalone || this.isNative;
  }
}

export const platformService = PlatformService.getInstance();
