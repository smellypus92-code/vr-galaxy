export interface AdMobConfig {
  publisherId: string;
  bannerUnitId: string;
  rewardedUnitId: string;
  interstitialUnitId: string;
  isTestMode: boolean;
  bannerEnabled: boolean;
  autoShowGameOverAds: boolean;
  accountConnected: boolean;
  lastConnectedAt?: string;
}

// Official Google AdMob sample test credentials
// https://developers.google.com/admob/android/test-ads
export const GOOGLE_ADMOB_SAMPLE_TEST = {
  publisherId: 'ca-app-pub-3940256099942544',
  bannerUnitId: 'ca-app-pub-3940256099942544/6300978111',
  rewardedUnitId: 'ca-app-pub-3940256099942544/5224354917',
  interstitialUnitId: 'ca-app-pub-3940256099942544/1033173712',
};

const STORAGE_KEY = 'cyberstrike_admob_config_v1';

class AdMobManager {
  private config: AdMobConfig;
  private listeners: Set<(config: AdMobConfig) => void> = new Set();
  private scriptLoaded = false;

  constructor() {
    this.config = this.loadConfig();
    this.initScriptIfLive();
  }

  private loadConfig(): AdMobConfig {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return {
          ...GOOGLE_ADMOB_SAMPLE_TEST,
          isTestMode: true,
          bannerEnabled: true,
          autoShowGameOverAds: false,
          accountConnected: false,
          ...JSON.parse(saved),
        };
      }
    } catch (e) {
      console.warn('Failed to load AdMob config from storage:', e);
    }

    return {
      publisherId: GOOGLE_ADMOB_SAMPLE_TEST.publisherId,
      bannerUnitId: GOOGLE_ADMOB_SAMPLE_TEST.bannerUnitId,
      rewardedUnitId: GOOGLE_ADMOB_SAMPLE_TEST.rewardedUnitId,
      interstitialUnitId: GOOGLE_ADMOB_SAMPLE_TEST.interstitialUnitId,
      isTestMode: true,
      bannerEnabled: true,
      autoShowGameOverAds: false,
      accountConnected: false,
    };
  }

  public getConfig(): AdMobConfig {
    return { ...this.config };
  }

  public saveConfig(updates: Partial<AdMobConfig>): AdMobConfig {
    this.config = {
      ...this.config,
      ...updates,
      lastConnectedAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.config));
    } catch (e) {
      console.error('Failed to save AdMob config to localStorage:', e);
    }

    this.initScriptIfLive();
    this.notify();
    return { ...this.config };
  }

  public connectAccount(
    publisherId: string,
    bannerUnitId?: string,
    rewardedUnitId?: string,
    interstitialUnitId?: string,
    isTestMode = false
  ): AdMobConfig {
    const cleanPubId = publisherId.trim();
    return this.saveConfig({
      publisherId: cleanPubId,
      bannerUnitId: bannerUnitId?.trim() || `ca-app-pub-${cleanPubId.replace(/\D/g, '') || '0000000000000000'}/banner`,
      rewardedUnitId: rewardedUnitId?.trim() || `ca-app-pub-${cleanPubId.replace(/\D/g, '') || '0000000000000000'}/rewarded`,
      interstitialUnitId: interstitialUnitId?.trim() || `ca-app-pub-${cleanPubId.replace(/\D/g, '') || '0000000000000000'}/interstitial`,
      accountConnected: true,
      isTestMode,
    });
  }

  public resetToOfficialTestAccount(): AdMobConfig {
    return this.saveConfig({
      publisherId: GOOGLE_ADMOB_SAMPLE_TEST.publisherId,
      bannerUnitId: GOOGLE_ADMOB_SAMPLE_TEST.bannerUnitId,
      rewardedUnitId: GOOGLE_ADMOB_SAMPLE_TEST.rewardedUnitId,
      interstitialUnitId: GOOGLE_ADMOB_SAMPLE_TEST.interstitialUnitId,
      isTestMode: true,
      accountConnected: false,
    });
  }

  public toggleBanner(enabled?: boolean): boolean {
    const next = enabled !== undefined ? enabled : !this.config.bannerEnabled;
    this.saveConfig({ bannerEnabled: next });
    return next;
  }

  public serializeForCloud(): string {
    return JSON.stringify(this.config);
  }

  public syncFromCloud(serializedJson?: string) {
    if (!serializedJson) return;
    try {
      const parsed = JSON.parse(serializedJson);
      if (parsed && typeof parsed === 'object') {
        this.config = {
          ...this.config,
          ...parsed,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.config));
        this.initScriptIfLive();
        this.notify();
      }
    } catch (e) {
      console.warn('Failed to parse cloud AdMob config:', e);
    }
  }

  private initScriptIfLive() {
    if (this.scriptLoaded) return;
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    // If a valid Google AdSense/AdMob web client publisher ID is provided and not test sandbox
    const pubId = this.config.publisherId;
    const isGooglePub = /^ca-pub-\d{10,24}$/i.test(pubId) || /^pub-\d{10,24}$/i.test(pubId);

    if (isGooglePub && !this.config.isTestMode) {
      const formattedClient = pubId.startsWith('ca-') ? pubId : `ca-${pubId}`;
      const script = document.createElement('script');
      script.async = true;
      script.crossOrigin = 'anonymous';
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${formattedClient}`;
      document.head.appendChild(script);
      this.scriptLoaded = true;
    }
  }

  public subscribe(cb: (config: AdMobConfig) => void): () => void {
    this.listeners.add(cb);
    return () => {
      this.listeners.delete(cb);
    };
  }

  private notify() {
    this.listeners.forEach((cb) => {
      try {
        cb(this.getConfig());
      } catch (e) {
        console.error(e);
      }
    });
  }
}

export const admobManager = new AdMobManager();
