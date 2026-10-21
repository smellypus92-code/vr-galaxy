import React, { useState } from 'react';
import {
  AdMobConfig,
  admobManager,
  GOOGLE_ADMOB_SAMPLE_TEST,
} from '../game/admob';
import { sound } from '../game/audio';

interface AdMobConfigModalProps {
  onClose: () => void;
  onTestRewarded: () => void;
  onSaveToCloud?: (configStr: string) => void;
}

export const AdMobConfigModal: React.FC<AdMobConfigModalProps> = ({
  onClose,
  onTestRewarded,
  onSaveToCloud,
}) => {
  const [config, setConfig] = useState<AdMobConfig>(admobManager.getConfig());
  const [pubId, setPubId] = useState(config.publisherId);
  const [bannerId, setBannerId] = useState(config.bannerUnitId);
  const [rewardedId, setRewardedId] = useState(config.rewardedUnitId);
  const [interstitialId, setInterstitialId] = useState(config.interstitialUnitId);
  const [testMode, setTestMode] = useState(config.isTestMode);
  const [bannerEnabled, setBannerEnabled] = useState(config.bannerEnabled);
  const [autoGameOver, setAutoGameOver] = useState(config.autoShowGameOverAds);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'CONNECT' | 'SETTINGS' | 'GUIDE'>('CONNECT');

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = admobManager.saveConfig({
      publisherId: pubId.trim(),
      bannerUnitId: bannerId.trim(),
      rewardedUnitId: rewardedId.trim(),
      interstitialUnitId: interstitialId.trim(),
      isTestMode: testMode,
      bannerEnabled,
      autoShowGameOverAds: autoGameOver,
      accountConnected: pubId.trim() !== GOOGLE_ADMOB_SAMPLE_TEST.publisherId,
    });
    setConfig(updated);
    setSaveSuccess(true);
    sound.playRewardClaimed();

    if (onSaveToCloud) {
      onSaveToCloud(JSON.stringify(updated));
    }

    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleUseTestAccount = () => {
    setPubId(GOOGLE_ADMOB_SAMPLE_TEST.publisherId);
    setBannerId(GOOGLE_ADMOB_SAMPLE_TEST.bannerUnitId);
    setRewardedId(GOOGLE_ADMOB_SAMPLE_TEST.rewardedUnitId);
    setInterstitialId(GOOGLE_ADMOB_SAMPLE_TEST.interstitialUnitId);
    setTestMode(true);

    const updated = admobManager.resetToOfficialTestAccount();
    setConfig(updated);
    setSaveSuccess(true);
    sound.playRewardClaimed();

    if (onSaveToCloud) {
      onSaveToCloud(JSON.stringify(updated));
    }

    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const isOfficialTest = pubId === GOOGLE_ADMOB_SAMPLE_TEST.publisherId;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-amber-500/50 rounded-xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-[0_0_40px_rgba(245,158,11,0.25)] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-rose-500 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.5)]">
              <span className="text-xl">📢</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-cyber font-bold text-white tracking-wider">
                  GOOGLE ADMOB INTEGRATION
                </h2>
                <span
                  className={`text-[10px] font-cyber px-2 py-0.5 rounded font-bold tracking-wider ${
                    config.accountConnected
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                  }`}
                >
                  {config.accountConnected ? '● ACCOUNT LINKED' : '● TEST SANDBOX'}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Connect your AdMob / Google Publisher ID & monetize CyberStrike
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition cursor-pointer font-cyber"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 px-6 bg-slate-950/40">
          <button
            onClick={() => setActiveTab('CONNECT')}
            className={`py-2.5 px-4 text-xs font-cyber tracking-wider font-semibold border-b-2 cursor-pointer transition ${
              activeTab === 'CONNECT'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            ACCOUNT LINK
          </button>
          <button
            onClick={() => setActiveTab('SETTINGS')}
            className={`py-2.5 px-4 text-xs font-cyber tracking-wider font-semibold border-b-2 cursor-pointer transition ${
              activeTab === 'SETTINGS'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            AD FORMATS & SLOTS
          </button>
          <button
            onClick={() => setActiveTab('GUIDE')}
            className={`py-2.5 px-4 text-xs font-cyber tracking-wider font-semibold border-b-2 cursor-pointer transition ${
              activeTab === 'GUIDE'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            SETUP GUIDE
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-200">
          {saveSuccess && (
            <div className="p-3 bg-emerald-950/80 border border-emerald-500/60 rounded-lg text-emerald-300 text-xs font-cyber flex items-center justify-between animate-in fade-in">
              <span>✓ GOOGLE ADMOB CONFIGURATION UPDATED AND SYNCED TO CLOUD</span>
              <span className="text-[10px] text-emerald-400">READY</span>
            </div>
          )}

          {activeTab === 'CONNECT' && (
            <form onSubmit={handleConnect} className="space-y-4">
              {/* Status Banner */}
              <div className="p-3 rounded-lg border border-slate-800 bg-slate-950/50 flex items-center justify-between">
                <div>
                  <div className="text-xs font-cyber text-slate-400 uppercase">
                    CURRENT AD SERVER STATUS
                  </div>
                  <div className="text-sm font-cyber font-bold text-white flex items-center gap-2 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    {isOfficialTest ? 'Official Google Sample Test Suite' : 'Custom Google AdMob Account'}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleUseTestAccount}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-cyber rounded transition cursor-pointer"
                >
                  LOAD SAMPLE TEST IDS
                </button>
              </div>

              {/* Publisher ID Input */}
              <div>
                <label className="block text-xs font-cyber text-amber-400 mb-1 font-semibold">
                  GOOGLE ADMOB PUBLISHER ID (ca-pub-XXXXXXXXXXXXXXXX)
                </label>
                <input
                  type="text"
                  value={pubId}
                  onChange={(e) => setPubId(e.target.value)}
                  placeholder="ca-app-pub-3940256099942544 or ca-pub-XXXXXXXXXXXXXXXX"
                  className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded px-3 py-2 text-sm font-mono text-white outline-none transition"
                  required
                />
                <span className="text-[10px] text-slate-500 font-mono mt-1 block">
                  Find your ID in Google AdMob Console &gt; Settings &gt; Account Information.
                </span>
              </div>

              {/* Ad Units Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-[11px] font-cyber text-slate-300 mb-1">
                    REWARDED AD UNIT ID
                  </label>
                  <input
                    type="text"
                    value={rewardedId}
                    onChange={(e) => setRewardedId(e.target.value)}
                    placeholder="ca-app-pub-.../5224354917"
                    className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded px-3 py-1.5 text-xs font-mono text-white outline-none"
                  />
                  <span className="text-[10px] text-slate-500 font-mono">
                    Used for bonus Cyber Credits &amp; Shield boost
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] font-cyber text-slate-300 mb-1">
                    BANNER AD UNIT ID
                  </label>
                  <input
                    type="text"
                    value={bannerId}
                    onChange={(e) => setBannerId(e.target.value)}
                    placeholder="ca-app-pub-.../6300978111"
                    className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded px-3 py-1.5 text-xs font-mono text-white outline-none"
                  />
                  <span className="text-[10px] text-slate-500 font-mono">
                    Used for in-arena perimeter banner
                  </span>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-cyber text-slate-300 mb-1">
                    INTERSTITIAL AD UNIT ID
                  </label>
                  <input
                    type="text"
                    value={interstitialId}
                    onChange={(e) => setInterstitialId(e.target.value)}
                    placeholder="ca-app-pub-.../1033173712"
                    className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded px-3 py-1.5 text-xs font-mono text-white outline-none"
                  />
                </div>
              </div>

              {/* Test Mode Switch */}
              <div className="pt-2 flex items-center justify-between p-3 rounded-lg border border-slate-800 bg-slate-950/40">
                <div>
                  <div className="text-xs font-cyber text-white font-bold">
                    TEST MODE (SAFE SANDBOX)
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Always enabled for safe development to avoid policy strikes during testing.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={testMode}
                  onChange={(e) => setTestMode(e.target.checked)}
                  className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex items-center justify-between border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    onTestRewarded();
                    onClose();
                  }}
                  className="px-3 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-cyber text-xs rounded transition flex items-center gap-1.5 shadow-[0_0_12px_rgba(0,243,255,0.3)] cursor-pointer"
                >
                  <span>▶</span> TEST REWARDED AD
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-cyber text-xs rounded transition cursor-pointer"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 font-cyber font-bold text-xs rounded transition shadow-[0_0_15px_rgba(245,158,11,0.4)] cursor-pointer"
                  >
                    SAVE &amp; CONNECT
                  </button>
                </div>
              </div>
            </form>
          )}

          {activeTab === 'SETTINGS' && (
            <div className="space-y-4">
              <div className="p-3 rounded-lg border border-slate-800 bg-slate-950/40 flex items-center justify-between">
                <div>
                  <div className="text-xs font-cyber font-bold text-white">
                    IN-ARENA BANNER AD
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Display banner ad slot at the bottom of the combat viewport.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={bannerEnabled}
                  onChange={(e) => {
                    setBannerEnabled(e.target.checked);
                    admobManager.saveConfig({ bannerEnabled: e.target.checked });
                  }}
                  className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                />
              </div>

              <div className="p-3 rounded-lg border border-slate-800 bg-slate-950/40 flex items-center justify-between">
                <div>
                  <div className="text-xs font-cyber font-bold text-white">
                    GAME OVER INTERSTITIALS
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Optionally trigger full-screen interstitial ad upon battle defeat.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={autoGameOver}
                  onChange={(e) => {
                    setAutoGameOver(e.target.checked);
                    admobManager.saveConfig({ autoShowGameOverAds: e.target.checked });
                  }}
                  className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                />
              </div>

              <div className="p-4 rounded-lg border border-cyan-500/30 bg-cyan-950/20">
                <h4 className="text-xs font-cyber font-bold text-cyan-300 mb-2">
                  REWARDED AD VALUE CONFIGURATION
                </h4>
                <div className="space-y-1 text-xs font-mono text-slate-300">
                  <div className="flex justify-between">
                    <span>CYBER CREDITS GRANTED:</span>
                    <span className="text-amber-400 font-bold">+350 💎</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ENERGY SHIELD CHARGE:</span>
                    <span className="text-cyan-400 font-bold">+50 🛡️</span>
                  </div>
                  <div className="flex justify-between">
                    <span>OVERDRIVE SURGE:</span>
                    <span className="text-pink-400 font-bold">+25% ⚡</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'GUIDE' && (
            <div className="space-y-3 text-xs leading-relaxed text-slate-300 font-mono">
              <div className="p-3 bg-slate-950/60 rounded border border-slate-800">
                <h4 className="font-cyber font-bold text-amber-400 text-sm mb-1">
                  1. How to find your AdMob Publisher ID
                </h4>
                <p>
                  Sign in to your Google AdMob account at <strong>admob.google.com</strong>.
                  Navigate to <strong>Settings</strong> &gt; <strong>Account Information</strong>.
                  Copy the Publisher ID starting with <code>pub-</code> or <code>ca-pub-</code>.
                </p>
              </div>

              <div className="p-3 bg-slate-950/60 rounded border border-slate-800">
                <h4 className="font-cyber font-bold text-amber-400 text-sm mb-1">
                  2. Web &amp; HTML5 / PWA Deployment
                </h4>
                <p>
                  Google AdMob is linked directly with Google AdSense and Google Ad Manager.
                  When deploying CyberStrike as a Web App / PWA or wrapped in Capacitor / Cordova for Android/iOS APK, your configured Publisher ID and Ad Unit IDs are used for live ad serving.
                </p>
              </div>

              <div className="p-3 bg-slate-950/60 rounded border border-slate-800">
                <h4 className="font-cyber font-bold text-amber-400 text-sm mb-1">
                  3. Test Mode Policy Safe
                </h4>
                <p>
                  Always keep <em>Test Mode</em> turned ON during development and review to prevent invalid traffic penalties from Google.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
