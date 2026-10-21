import React, { useEffect, useState } from 'react';
import { admobManager } from '../game/admob';
import { sound } from '../game/audio';

interface AdMobRewardedModalProps {
  onRewardClaimed: (credits: number) => void;
  onClose: () => void;
}

const SPONSORS = [
  {
    name: 'NEON KINETICS PROTOCOL',
    tagline: 'Hyper-frequency quantum cyber blades designed for deep-sector drone suppression.',
    badge: 'SPONSORED BY GOOGLE ADMOB',
    icon: '⚡',
    theme: 'from-cyan-600 via-blue-600 to-indigo-900',
    colorHex: '#00f3ff',
  },
  {
    name: 'SOLARIS BIKINI ENERGY DRINK',
    tagline: 'Electrolyte-charged cyber fuel endorsed by Combat Champion Elena. Instant reaction recovery.',
    badge: 'FEATURED PARTNER',
    icon: '🏖️',
    theme: 'from-amber-500 via-rose-600 to-purple-900',
    colorHex: '#fbbf24',
  },
  {
    name: 'QUANTUM SHIELD DYNAMICS',
    tagline: 'Triple-layer hexagonal kinetic barrier deflectors. Unbreakable perimeter defense.',
    badge: 'ADMOB PREMIUM PARTNER',
    icon: '🛡️',
    theme: 'from-pink-600 via-fuchsia-600 to-slate-950',
    colorHex: '#ff0055',
  },
];

export const AdMobRewardedModal: React.FC<AdMobRewardedModalProps> = ({
  onRewardClaimed,
  onClose,
}) => {
  const [secondsLeft, setSecondsLeft] = useState(10);
  const [isCompleted, setIsCompleted] = useState(false);
  const [sponsorIndex] = useState(() => Math.floor(Math.random() * SPONSORS.length));
  const sponsor = SPONSORS[sponsorIndex];
  const config = admobManager.getConfig();

  useEffect(() => {
    if (secondsLeft <= 0) {
      setIsCompleted(true);
      sound.playRewardClaimed();
      return;
    }

    const timer = setInterval(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsLeft]);

  const handleClaim = () => {
    sound.playRewardClaimed();
    onRewardClaimed(350);
    onClose();
  };

  const progressPercent = ((10 - secondsLeft) / 10) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-cyan-500/50 rounded-2xl max-w-xl w-full flex flex-col shadow-[0_0_50px_rgba(0,243,255,0.3)] overflow-hidden">
        {/* Top AdMob Header */}
        <div className="px-5 py-3 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-cyber font-bold text-cyan-400 tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              GOOGLE ADMOB REWARDED VIDEO
            </span>
            <span className="text-[10px] font-mono text-slate-500 hidden sm:inline">
              [{config.isTestMode ? 'TEST AD' : config.publisherId}]
            </span>
          </div>

          <div className="flex items-center gap-2">
            {!isCompleted ? (
              <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950/60 border border-amber-500/40 px-2 py-0.5 rounded">
                Reward in {secondsLeft}s
              </span>
            ) : (
              <span className="text-xs font-cyber font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-2 py-0.5 rounded animate-bounce">
                ✓ REWARD READY
              </span>
            )}

            <button
              onClick={onClose}
              className="text-slate-500 hover:text-white text-xs font-cyber px-2 py-0.5 rounded hover:bg-slate-800 transition cursor-pointer"
              title={isCompleted ? 'Close' : 'Skip (forfeit reward)'}
            >
              {isCompleted ? '✕' : 'SKIP'}
            </button>
          </div>
        </div>

        {/* 10s Timer Progress Bar */}
        <div className="w-full h-1.5 bg-slate-950 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 via-pink-400 to-amber-400 transition-all duration-1000 ease-linear shadow-[0_0_8px_rgba(0,243,255,0.8)]"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Video / Creative Sandbox Showcase */}
        <div className={`p-8 bg-gradient-to-br ${sponsor.theme} relative overflow-hidden flex flex-col items-center justify-center text-center min-h-[260px]`}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.2)_0%,rgba(0,0,0,0.7)_100%)] pointer-events-none" />

          {/* Ad Badge */}
          <div className="relative z-10 mb-3 px-3 py-0.5 rounded-full bg-black/50 border border-white/20 text-[10px] font-cyber tracking-widest text-white uppercase backdrop-blur-sm">
            {sponsor.badge}
          </div>

          {/* Animated Hero Icon */}
          <div className="relative z-10 text-6xl mb-3 animate-pulse drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]">
            {sponsor.icon}
          </div>

          {/* Title & Tagline */}
          <h3 className="relative z-10 font-cyber font-black text-2xl text-white tracking-wide mb-2 drop-shadow-[0_0_10px_rgba(0,0,0,0.8)]">
            {sponsor.name}
          </h3>

          <p className="relative z-10 text-sm font-sans text-slate-200 max-w-md mx-auto leading-relaxed drop-shadow">
            {sponsor.tagline}
          </p>

          <div className="relative z-10 mt-4 flex items-center gap-2">
            <span className="text-[11px] font-mono text-cyan-200 bg-black/40 px-3 py-1 rounded-full border border-cyan-400/30">
              Unit ID: {config.rewardedUnitId.substring(0, 25)}...
            </span>
          </div>
        </div>

        {/* Reward Confirmation Bottom Bar */}
        <div className="p-5 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-xl shadow-[0_0_12px_rgba(245,158,11,0.3)]">
              💎
            </div>
            <div>
              <div className="text-xs font-cyber text-slate-400 uppercase">
                GUARANTEED OPERATIVE REWARD
              </div>
              <div className="text-sm font-cyber font-bold text-amber-300">
                +350 CYBER CREDITS &amp; SHIELD REPAIR
              </div>
            </div>
          </div>

          <div>
            {isCompleted ? (
              <button
                onClick={handleClaim}
                className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-cyber font-black text-xs tracking-wider rounded-lg transition shadow-[0_0_20px_rgba(16,185,129,0.5)] cursor-pointer animate-pulse"
              >
                CLAIM REWARD (+350💎)
              </button>
            ) : (
              <button
                disabled
                className="w-full sm:w-auto px-6 py-2.5 bg-slate-800 text-slate-500 font-cyber font-bold text-xs tracking-wider rounded-lg cursor-not-allowed opacity-80"
              >
                WATCHING AD ({secondsLeft}s)...
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
