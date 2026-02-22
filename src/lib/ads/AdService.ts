
import { platformService } from '@lib/platform/PlatformService';
import { logger } from '@lib/utils/logger';
import { AdMob, BannerAdOptions, BannerAdSize, BannerAdPosition, AdOptions, InterstitialAdPluginEvents, AdLoadInfo, AdmobConsentStatus } from '@capacitor-community/admob';

/** Maximum interstitial ads per session */
const MAX_ADS_PER_SESSION = 3;
/** Minimum interval between interstitials (ms) */
const AD_COOLDOWN_MS = 3 * 60 * 1000; // 3 minutes

export interface AdMetrics {
  interstitialsShown: number;
  interstitialsFailed: number;
  interstitialsDismissed: number;
  bannersShown: number;
  consentStatus: 'obtained' | 'denied' | 'not_required' | 'pending';
  sessionStart: number;
}

export class AdService {
  private static instance: AdService;
  private initialized: boolean = false;
  private bannerVisible: boolean = false;
  private interstitialReady: boolean = false;
  private consentObtained: boolean = false;

  // Frequency cap state
  private adsShownThisSession: number = 0;
  private lastAdTimestamp: number = 0;

  // Ad metrics tracking
  private readonly metrics: AdMetrics = {
    interstitialsShown: 0,
    interstitialsFailed: 0,
    interstitialsDismissed: 0,
    bannersShown: 0,
    consentStatus: 'pending',
    sessionStart: Date.now(),
  };

  // Production Ad Unit IDs
  private readonly IDS = {
    ANDROID: {
      BANNER: 'ca-app-pub-7224184586087321/7314295767',
      INTERSTITIAL: 'ca-app-pub-7224184586087321/9225638657'
    },
    IOS: {
      BANNER: 'ca-app-pub-7224184586087321/7314295767',
      INTERSTITIAL: 'ca-app-pub-7224184586087321/9225638657'
    }
  };

  private constructor() { }

  public static getInstance(): AdService {
    if (!AdService.instance) AdService.instance = new AdService();
    return AdService.instance;
  }

  private get isNative() {
    return platformService.isNative;
  }

  /**
   * Request GDPR/UMP consent before initializing ads.
   * Uses Google's User Messaging Platform via @capacitor-community/admob.
   */
  private async requestConsent(): Promise<boolean> {
    try {
      const consentInfo = await AdMob.requestConsentInfo();

      if (consentInfo.isConsentFormAvailable && consentInfo.status === AdmobConsentStatus.REQUIRED) {
        const result = await AdMob.showConsentForm();
        return result.status === AdmobConsentStatus.OBTAINED;
      }

      // Consent not required (non-EEA) or already obtained
      const isNotRequired = consentInfo.status === AdmobConsentStatus.NOT_REQUIRED;
      const isObtained = consentInfo.status === AdmobConsentStatus.OBTAINED;
      const granted = isNotRequired || isObtained;

      if (isNotRequired) this.metrics.consentStatus = 'not_required';
      else if (isObtained) this.metrics.consentStatus = 'obtained';
      else this.metrics.consentStatus = 'denied';

      return granted;
    } catch (e) {
      logger.error('[AdService] Consent request error:', e);
      this.metrics.consentStatus = 'denied';
      // If consent request fails, do not show ads (safe default)
      return false;
    }
  }

  public async initialize(): Promise<void> {
    if (this.initialized) return;

    if (this.isNative) {
      try {
        await AdMob.initialize({
          testingDevices: [],
        });

        // Request GDPR/UMP consent before showing any ads
        this.consentObtained = await this.requestConsent();

        if (!this.consentObtained) {
          logger.log('[AdService] Consent not obtained — ads disabled');
          this.initialized = true;
          return;
        }

        this.setupInterstitialListeners();
        await this.prepareInterstitial();

        logger.log('[AdService] Native AdMob initialized with consent');
        this.initialized = true;
      } catch (e) {
        logger.error('[AdService] Init error:', e);
      }
    } else {
      logger.log('[AdService] Web mode — Mock ads active');
      this.consentObtained = true;
      this.initialized = true;
    }
  }

  /**
   * Allow user to re-trigger consent form (e.g., from Settings).
   */
  public async resetConsent(): Promise<void> {
    if (!this.isNative) return;
    try {
      await AdMob.resetConsentInfo();
      this.consentObtained = false;
      logger.log('[AdService] Consent reset — user can reconfigure');
    } catch (e) {
      logger.error('[AdService] Reset consent error:', e);
    }
  }

  public hasConsent(): boolean {
    return this.consentObtained;
  }

  private setupInterstitialListeners(): void {
    AdMob.addListener(InterstitialAdPluginEvents.Loaded, (info: AdLoadInfo) => {
      this.interstitialReady = true;
      logger.log('[AdService] Interstitial loaded:', info);
    });

    AdMob.addListener(InterstitialAdPluginEvents.Dismissed, () => {
      this.interstitialReady = false;
      this.metrics.interstitialsDismissed++;
      this.prepareInterstitial();
      logger.log('[AdService] Interstitial dismissed, preloading next');
    });

    AdMob.addListener(InterstitialAdPluginEvents.FailedToLoad, (error) => {
      this.interstitialReady = false;
      this.metrics.interstitialsFailed++;
      logger.error('[AdService] Interstitial failed to load:', error);
    });
  }

  private getPlatformIds() {
    return platformService.isIOS ? this.IDS.IOS : this.IDS.ANDROID;
  }

  public async showBanner(): Promise<void> {
    if (this.bannerVisible || !this.consentObtained) return;

    if (this.isNative) {
      try {
        const ids = this.getPlatformIds();
        const options: BannerAdOptions = {
          adId: ids.BANNER,
          adSize: BannerAdSize.ADAPTIVE_BANNER,
          position: BannerAdPosition.BOTTOM_CENTER,
          margin: 0,
          isTesting: false,
        };

        await AdMob.showBanner(options);
        this.bannerVisible = true;
        this.metrics.bannersShown++;
        logger.log('[AdService] Banner shown');
      } catch (e) {
        logger.error('[AdService] Banner error:', e);
      }
    } else {
      logger.log('[AdService] Web Mock Banner Active');
      this.bannerVisible = true;
    }
  }

  public async hideBanner(): Promise<void> {
    if (!this.bannerVisible) return;

    if (this.isNative) {
      try {
        await AdMob.hideBanner();
        logger.log('[AdService] Banner hidden');
      } catch (e) {
        logger.error('[AdService] Hide banner error:', e);
      }
    }
    this.bannerVisible = false;
  }

  public async resumeBanner(): Promise<void> {
    if (this.bannerVisible && this.isNative) {
      try {
        await AdMob.resumeBanner();
      } catch (e) {
        logger.error('[AdService] Resume banner error:', e);
      }
    }
  }

  private async prepareInterstitial(): Promise<void> {
    if (!this.isNative || !this.consentObtained) return;

    try {
      const ids = this.getPlatformIds();
      const options: AdOptions = {
        adId: ids.INTERSTITIAL,
        isTesting: false,
      };

      await AdMob.prepareInterstitial(options);
      logger.log('[AdService] Interstitial prepared');
    } catch (e) {
      logger.error('[AdService] Prepare interstitial error:', e);
    }
  }

  /**
   * Check if an interstitial can be shown (frequency cap + cooldown).
   */
  public canShowInterstitial(): boolean {
    if (!this.consentObtained) return false;
    if (this.adsShownThisSession >= MAX_ADS_PER_SESSION) return false;
    if (Date.now() - this.lastAdTimestamp < AD_COOLDOWN_MS) return false;
    return true;
  }

  public async showInterstitial(): Promise<boolean> {
    if (!this.canShowInterstitial()) {
      logger.log('[AdService] Interstitial blocked by frequency cap');
      return false;
    }

    if (!this.isNative) {
      return new Promise(resolve => {
        logger.log('[AdService] Web Mock: Simulated Interstitial');
        this.adsShownThisSession++;
        this.lastAdTimestamp = Date.now();
        this.metrics.interstitialsShown++;
        setTimeout(() => resolve(true), 500);
      });
    }

    try {
      if (!this.interstitialReady) {
        await this.prepareInterstitial();
        await new Promise(r => setTimeout(r, 1000));
      }

      await AdMob.showInterstitial();
      this.adsShownThisSession++;
      this.lastAdTimestamp = Date.now();
      this.metrics.interstitialsShown++;
      return true;
    } catch (e) {
      this.metrics.interstitialsFailed++;
      logger.error('[AdService] Show interstitial error:', e);
      return false;
    }
  }

  public isInterstitialReady(): boolean {
    return this.interstitialReady;
  }

  /** Session-level ad metrics for analytics. */
  public getMetrics(): Readonly<AdMetrics> {
    return { ...this.metrics };
  }
}

export const adService = AdService.getInstance();
