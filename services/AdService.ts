
import { platformService } from './PlatformService';

export class AdService {
  private static instance: AdService;
  private initialized: boolean = false;
  private bannerVisible: boolean = false;

  // IDs de Teste Oficiais do Google
  private readonly IDS = {
    ANDROID: { BANNER: 'ca-app-pub-3940256099942544/6300978111', INTERSTITIAL: 'ca-app-pub-3940256099942544/1033173712' },
    IOS: { BANNER: 'ca-app-pub-3940256099942544/2934735716', INTERSTITIAL: 'ca-app-pub-3940256099942544/4411468910' }
  };

  private constructor() {}

  public static getInstance(): AdService {
    if (!AdService.instance) AdService.instance = new AdService();
    return AdService.instance;
  }

  private get isNative() {
      return platformService.isNative;
  }

  public async initialize(): Promise<void> {
    if (this.initialized || !this.isNative) return;
    try {
        // O código real do plugin deve ser instalado via npm: @capacitor-community/admob
        // Mas o wrapper já está isolado aqui.
        console.log('[AdService] Ready for Native AdMob');
        this.initialized = true;
    } catch (e) {
        console.error('[AdService] Init error:', e);
    }
  }

  public async showBanner(): Promise<void> {
    if (this.bannerVisible) return;
    if (this.isNative) {
        // Chamada real ao plugin AdMob aqui
        console.log('[AdService] Native Banner Requested');
    } else {
        console.log('[AdService] Web Mock Banner Active');
    }
    this.bannerVisible = true;
  }

  public async hideBanner(): Promise<void> {
    if (!this.bannerVisible) return;
    if (this.isNative) {
        console.log('[AdService] Native Banner Hidden');
    }
    this.bannerVisible = false;
  }

  public async showInterstitial(): Promise<boolean> {
    if (!this.isNative) {
        // Simulação de Ad na Web para debug de fluxo
        return new Promise(resolve => {
            alert("Support VolleyScore!\n(Simulated Video Ad)");
            setTimeout(() => resolve(true), 1000);
        });
    }
    return true; 
  }
}

export const adService = AdService.getInstance();
