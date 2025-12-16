
import { Capacitor } from '@capacitor/core';
import { Toast } from '@capacitor/toast';

// Mock types since we can't install the plugin yet
// In a real scenario: import { AdMob, BannerAdSize, BannerAdPosition, AdOptions, AdLoadInfo } from '@capacitor-community/admob';

export class AdService {
  private static instance: AdService;
  private isNative: boolean = Capacitor.isNativePlatform();
  private initialized: boolean = false;
  private bannerVisible: boolean = false;

  // Google Test IDs (Official)
  private readonly IDS = {
    ANDROID: {
      APP_ID: 'ca-app-pub-3940256099942544~3347511713',
      BANNER: 'ca-app-pub-3940256099942544/6300978111',
      INTERSTITIAL: 'ca-app-pub-3940256099942544/1033173712',
    },
    IOS: {
      APP_ID: 'ca-app-pub-3940256099942544~1458002511',
      BANNER: 'ca-app-pub-3940256099942544/2934735716',
      INTERSTITIAL: 'ca-app-pub-3940256099942544/4411468910',
    }
  };

  private constructor() {}

  public static getInstance(): AdService {
    if (!AdService.instance) {
      AdService.instance = new AdService();
    }
    return AdService.instance;
  }

  public async initialize(): Promise<void> {
    if (this.initialized) return;

    if (this.isNative) {
      try {
        // Mocking the native call structure for future implementation
        // const { AdMob } = await import('@capacitor-community/admob');
        // await AdMob.initialize({
        //   requestTrackingAuthorization: true,
        //   initializeForTesting: true,
        // });
        console.log('[AdService] Native AdMob Initialized (Mocked for now)');
      } catch (e) {
        console.error('[AdService] Failed to init AdMob', e);
      }
    } else {
      console.log('[AdService] Web Mode: Ads will be simulated.');
    }
    this.initialized = true;
  }

  public async showBanner(): Promise<void> {
    if (this.bannerVisible) return;

    if (this.isNative) {
      try {
        // const { AdMob, BannerAdSize, BannerAdPosition } = await import('@capacitor-community/admob');
        // await AdMob.showBanner({
        //   adId: this.isAndroid ? this.IDS.ANDROID.BANNER : this.IDS.IOS.BANNER,
        //   adSize: BannerAdSize.ADAPTIVE_BANNER,
        //   position: BannerAdPosition.BOTTOM,
        //   margin: 0,
        //   isTesting: true
        // });
        console.log('[AdService] Native Banner Shown');
      } catch (e) {
        console.warn('[AdService] Banner Error', e);
      }
    } else {
      // Web: The visual component handles the rendering, this method just logs logic
      console.log('[AdService] Web Banner Request');
    }
    this.bannerVisible = true;
  }

  public async hideBanner(): Promise<void> {
    if (!this.bannerVisible) return;

    if (this.isNative) {
      try {
        // const { AdMob } = await import('@capacitor-community/admob');
        // await AdMob.hideBanner();
        console.log('[AdService] Native Banner Hidden');
      } catch (e) {
        console.warn('[AdService] Hide Banner Error', e);
      }
    }
    this.bannerVisible = false;
  }

  public async showInterstitial(): Promise<boolean> {
    // Return true if ad was shown and closed, false if failed or skipped
    return new Promise(async (resolve) => {
      if (this.isNative) {
        try {
          // const { AdMob } = await import('@capacitor-community/admob');
          // await AdMob.prepareInterstitial({
          //   adId: this.isAndroid ? this.IDS.ANDROID.INTERSTITIAL : this.IDS.IOS.INTERSTITIAL,
          //   isTesting: true
          // });
          // await AdMob.showInterstitial();
          
          // Mocking native behavior delay
          setTimeout(() => {
             console.log('[AdService] Native Interstitial Finished');
             resolve(true);
          }, 1000);
        } catch (e) {
          console.warn('[AdService] Interstitial Failed', e);
          resolve(false);
        }
      } else {
        // Web Simulation
        console.log('[AdService] Preparing Web Interstitial...');
        
        // Simulate "Loading"
        await new Promise(r => setTimeout(r, 800));
        
        // Simulate "Watching Ad"
        const confirmed = window.confirm('[MOCK AD]\n\nThis is a simulated video ad.\n\nImagine a cool video playing here for 5 seconds...\n\nClick OK to close ad.');
        
        if (confirmed) {
            console.log('[AdService] Web Interstitial Watched');
            resolve(true);
        } else {
            resolve(false);
        }
      }
    });
  }

  private get isAndroid(): boolean {
    return Capacitor.getPlatform() === 'android';
  }
}

export const adService = AdService.getInstance();
