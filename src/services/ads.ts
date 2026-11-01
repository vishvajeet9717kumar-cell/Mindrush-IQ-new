// Monetization & Google AdMob / Web Ads Service
// Supports:
// 1. Web Preview / Dev Simulator (visual 5-second countdown simulation with real rewards)
// 2. Google AdMob via Capacitor (@capacitor-community/admob) when compiled to Android .apk / .aab
// 3. AdSense for Web Games (H5 Games Ads)

export interface AdConfig {
  admobAppId: string;
  bannerId: string;
  interstitialId: string;
  rewardedId: string;
  isTestMode: boolean;
}

// Official Google AdMob Test Ad Unit IDs for Android (safe for development and testing)
export const DEFAULT_AD_CONFIG: AdConfig = {
  admobAppId: 'ca-pub-9874274697470793',
  bannerId: 'ca-app-pub-3940256099942544/6300978111',
  interstitialId: 'ca-app-pub-3940256099942544/1033173712',
  rewardedId: 'ca-app-pub-3940256099942544/5224354917',
  isTestMode: false,
};

class AdService {
  private config: AdConfig = DEFAULT_AD_CONFIG;
  private runsSinceLastInterstitial = 0;
  private isCapacitor = false;
  private hasRemovedAds = false;

  constructor() {
    if (typeof window !== 'undefined') {
      // Check if running inside Capacitor Android app
      this.isCapacitor = !!(window as unknown as { Capacitor?: { isNativePlatform: () => boolean } }).Capacitor?.isNativePlatform();
      try {
        this.hasRemovedAds = localStorage.getItem('mindrush_no_ads') === 'true';
      } catch {}
    }
  }

  public setNoAds(active: boolean) {
    this.hasRemovedAds = active;
    try {
      localStorage.setItem('mindrush_no_ads', active ? 'true' : 'false');
    } catch {}
  }

  public getNoAds(): boolean {
    return this.hasRemovedAds;
  }

  // ----------------------------- Interstitial Ads -----------------------------
  // Best practice: Show an interstitial every 3-4 runs, never on run 1
  public shouldShowInterstitial(): boolean {
    if (this.hasRemovedAds) return false;
    this.runsSinceLastInterstitial += 1;
    if (this.runsSinceLastInterstitial >= 3) {
      this.runsSinceLastInterstitial = 0;
      return true;
    }
    return false;
  }

  public showInterstitial(onDismissed?: () => void) {
    if (this.hasRemovedAds) {
      onDismissed?.();
      return;
    }

    // If native Capacitor AdMob is present
    const nativeAdmob = (window as unknown as { AdMob?: { showInterstitial: () => Promise<void> } }).AdMob;
    if (this.isCapacitor && nativeAdmob) {
      nativeAdmob
        .showInterstitial()
        .then(() => onDismissed?.())
        .catch(() => onDismissed?.());
      return;
    }

    // In web/preview, execute callback cleanly without obstructing
    onDismissed?.();
  }

  // ----------------------------- Rewarded Video Ads -----------------------------
  // Used for:
  // 1. "Revive in-game / Second Chance"
  // 2. "Double Coins after a run"
  // 3. "Free +150 Coins Chest in Shop"
  public showRewardedVideo(
    rewardType: 'revive' | 'double_coins' | 'free_coins',
    onRewardSuccess: () => void,
    onFailed?: (msg: string) => void
  ) {
    // If player purchased "Remove Ads", grant reward immediately without watching ads!
    if (this.hasRemovedAds) {
      onRewardSuccess();
      return;
    }

    // If running in Android Capacitor native container with AdMob plugin
    const nativeAdmob = (window as unknown as {
      AdMob?: {
        showRewardVideoAd: () => Promise<{ type: string; amount: number }>;
      };
    }).AdMob;

    if (this.isCapacitor && nativeAdmob) {
      nativeAdmob
        .showRewardVideoAd()
        .then(() => onRewardSuccess())
        .catch(err => {
          console.warn('Native AdMob error:', err);
          onFailed?.('Ad unavailable, please try again later.');
        });
      return;
    }

    // For Web / AI Studio Preview: Render high-fidelity Rewarded Ad simulation dialog
    // so the user can test the exact end-to-end player earning experience
    this.showWebRewardedAdModal(rewardType, onRewardSuccess, onFailed);
  }

  private showWebRewardedAdModal(
    rewardType: 'revive' | 'double_coins' | 'free_coins',
    onRewardSuccess: () => void,
    onFailed?: (msg: string) => void
  ) {
    const existing = document.getElementById('ad-reward-modal-root');
    if (existing) existing.remove();

    const root = document.createElement('div');
    root.id = 'ad-reward-modal-root';
    root.className = 'fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn';

    let countdown = 5; // 5-second preview countdown for testing
    const labels = {
      revive: 'Second Chance Revive',
      double_coins: 'Double Run Coins (2x)',
      free_coins: 'Free +150 Coins Chest',
    };

    root.innerHTML = `
      <div class="w-full max-w-[320px] rounded-3xl border border-white/20 bg-[#0d0d1a] p-5 text-center shadow-2xl flex flex-col items-center gap-3">
        <div class="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center text-xl font-bold">
          📺
        </div>
        <div>
          <div class="text-[10px] font-black uppercase tracking-widest text-emerald-400">Sponsored Ad Preview</div>
          <h3 class="text-base font-black text-white mt-0.5">${labels[rewardType]}</h3>
          <p class="text-xs text-white/60 mt-1">Simulating Google AdMob Rewarded Video...</p>
        </div>
        
        <div class="my-2 flex items-center justify-center w-16 h-16 rounded-full border-2 border-emerald-400/50 bg-emerald-500/10 text-emerald-300 text-xl font-black tabular-nums" id="ad-timer-text">
          ${countdown}s
        </div>

        <button id="ad-skip-btn" class="w-full py-2.5 rounded-xl border border-white/10 text-xs font-bold text-white/50 hover:text-white transition">
          Skip (No Reward)
        </button>
      </div>
    `;

    document.body.appendChild(root);

    const timerEl = root.querySelector('#ad-timer-text');
    const skipBtn = root.querySelector('#ad-skip-btn');

    const interval = window.setInterval(() => {
      countdown -= 1;
      if (timerEl) timerEl.textContent = `${countdown}s`;
      if (countdown <= 0) {
        window.clearInterval(interval);
        root.remove();
        onRewardSuccess();
      }
    }, 1000);

    skipBtn?.addEventListener('click', () => {
      window.clearInterval(interval);
      root.remove();
      onFailed?.('Ad skipped. Reward not claimed.');
    });
  }
}

export const adService = new AdService();
