import React, { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { GameEngine } from '../game/engine';
import { CHAMPIONS, ChampionId } from '../game/proceduralModels';
import { dailyMissionTracker } from '../game/dailyMissions';

interface TitleScreenProps {
  engine: GameEngine | null;
  vrSupported: boolean;
  user: User | null;
  selectedChampion: ChampionId;
  onStart: () => void;
  onEnterVR: () => void;
  onOpenReticleConfig: () => void;
  onOpenChampionSelector: () => void;
  onOpenLeaderboard: () => void;
  onOpenProfile: () => void;
  onOpenDailyMissions: () => void;
  onOpenAdMobConfig: () => void;
  onOpenRewardedAd: () => void;
  onLogin: () => void;
  onLogout: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  vrSupported,
  user,
  selectedChampion,
  onStart,
  onEnterVR,
  onOpenReticleConfig,
  onOpenChampionSelector,
  onOpenLeaderboard,
  onOpenProfile,
  onOpenDailyMissions,
  onOpenAdMobConfig,
  onOpenRewardedAd,
  onLogin,
  onLogout,
}) => {
  const champ = CHAMPIONS[selectedChampion];
  const [credits, setCredits] = useState<number>(dailyMissionTracker.getCredits());
  const [completedCount, setCompletedCount] = useState<number>(
    dailyMissionTracker.getMissions().filter((m) => m.isCompleted).length
  );

  useEffect(() => {
    const handleUpdate = () => {
      setCredits(dailyMissionTracker.getCredits());
      setCompletedCount(dailyMissionTracker.getMissions().filter((m) => m.isCompleted).length);
    };
    dailyMissionTracker.onCurrencyUpdated = (c) => setCredits(c);
    dailyMissionTracker.onStateUpdated = handleUpdate;
    handleUpdate();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        onStart();
      } else if (e.code === 'KeyR') {
        e.preventDefault();
        onOpenReticleConfig();
      } else if (e.code === 'KeyC') {
        e.preventDefault();
        onOpenChampionSelector();
      } else if (e.code === 'KeyP') {
        e.preventDefault();
        onOpenProfile();
      } else if (e.code === 'KeyM') {
        e.preventDefault();
        onOpenDailyMissions();
      } else if (e.code === 'KeyA') {
        e.preventDefault();
        onOpenAdMobConfig();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onStart, onOpenReticleConfig, onOpenChampionSelector, onOpenProfile, onOpenDailyMissions, onOpenAdMobConfig]);

  return (
    <div className="absolute inset-0 z-20 flex flex-col justify-between p-6 sm:p-10 pointer-events-none select-none">
      {/* Top Bar: System Status & User Account */}
      <div className="flex items-center justify-between pointer-events-auto flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
          <span className="font-cyber text-xs tracking-widest text-cyan-400/90 uppercase">
            NEURAL PROTOCOL // CYBER BEACH VR
          </span>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
          {/* Cyber Credits Balance */}
          <div
            onClick={onOpenDailyMissions}
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-slate-900/90 border border-cyan-500/40 text-cyan-300 font-cyber text-xs cursor-pointer hover:border-cyan-400 shadow-[0_0_12px_rgba(0,243,255,0.15)] transition"
            title="Cyber Credits Earned from Missions (Click to Requisition)"
          >
            <span className="text-cyan-400">💎</span>
            <span className="font-black tabular-nums">{credits.toLocaleString()}</span>
            <span className="text-[10px] text-cyan-400/80">CREDITS</span>
          </div>

          {/* Daily Missions Direct Access */}
          <button
            onClick={onOpenDailyMissions}
            className={`px-3 py-1 rounded font-cyber text-xs tracking-wider transition cursor-pointer flex items-center gap-1.5 shadow-[0_0_12px_rgba(245,158,11,0.2)] ${
              completedCount === 3
                ? 'bg-amber-500/25 border border-amber-400 text-amber-200'
                : 'bg-slate-900/80 hover:bg-slate-800 border border-amber-500/50 text-amber-300 hover:text-white'
            }`}
            title="Open Daily Missions & Directives (M)"
          >
            <span>🎯</span>
            <span>MISSIONS</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/60 font-bold border border-amber-500/50 text-amber-300">
              {completedCount}/3
            </span>
          </button>

          {/* Dossier & Badges button */}
          <button
            onClick={onOpenProfile}
            className="px-3 py-1 rounded bg-slate-900/80 hover:bg-slate-800 border border-amber-500/50 text-amber-300 hover:text-white font-cyber text-xs tracking-wider transition cursor-pointer flex items-center gap-1.5 shadow-[0_0_10px_rgba(251,191,36,0.2)]"
            title="Open Operative Profile & Achievements (P)"
          >
            <span>👑</span> DOSSIER & BADGES
          </button>

          {/* Google AdMob button */}
          <button
            onClick={onOpenAdMobConfig}
            className="px-3 py-1 rounded bg-slate-900/80 hover:bg-slate-800 border border-amber-500/50 text-amber-300 hover:text-white font-cyber text-xs tracking-wider transition cursor-pointer flex items-center gap-1.5 shadow-[0_0_10px_rgba(245,158,11,0.2)]"
            title="Configure Google AdMob Account & Ads (A)"
          >
            <span>📢</span> ADMOB [A]
          </button>

          {/* Rewarded Ad Fast Claim button */}
          <button
            onClick={onOpenRewardedAd}
            className="px-3 py-1 rounded bg-gradient-to-r from-amber-500/20 to-rose-500/20 hover:from-amber-500/30 hover:to-rose-500/30 border border-amber-400 text-amber-200 hover:text-white font-cyber text-xs tracking-wider transition cursor-pointer flex items-center gap-1.5 shadow-[0_0_12px_rgba(245,158,11,0.25)]"
            title="Watch Google AdMob Rewarded Video for +350 Credits"
          >
            <span>💎</span> +350 AD REWARD
          </button>

          {/* User Sign In / Profile status */}
          {user ? (
            <div
              onClick={onOpenProfile}
              className="flex items-center gap-2 bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-500/40 py-1 px-3 rounded text-xs cursor-pointer transition"
            >
              {user.photoURL && (
                <img src={user.photoURL} alt="" className="w-5 h-5 rounded-full object-cover" />
              )}
              <span className="font-cyber text-slate-200 text-xs">
                {user.displayName || 'Player'}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onLogout();
                }}
                className="text-slate-500 hover:text-slate-300 ml-1 text-xs cursor-pointer font-cyber"
              >
                LOGOUT
              </button>
            </div>
          ) : (
            <button
              onClick={onLogin}
              className="px-3 py-1 rounded bg-slate-900/80 hover:bg-slate-800 border border-cyan-500/40 text-cyan-300 hover:text-white font-cyber text-xs tracking-wider transition cursor-pointer flex items-center gap-1.5 shadow-[0_0_10px_rgba(0,243,255,0.15)]"
            >
              <span>G</span> GOOGLE SIGN IN
            </button>
          )}

          {vrSupported ? (
            <span className="font-cyber text-xs px-2.5 py-1 rounded border border-emerald-500/50 bg-emerald-950/40 text-emerald-400 tracking-wider">
              WEBXR READY
            </span>
          ) : (
            <span className="font-cyber text-xs px-2.5 py-1 rounded border border-cyan-500/30 bg-cyan-950/30 text-cyan-300/80 tracking-wider">
              DESKTOP / VR SIM
            </span>
          )}
        </div>
      </div>

      {/* Hero Centerpiece: Bespoke SVG Title Lockup */}
      <div className="flex flex-col items-center justify-center my-auto text-center max-w-3xl mx-auto">
        <div className="relative mb-5">
          <svg
            className="w-full max-w-[560px] h-auto drop-shadow-[0_0_24px_rgba(0,243,255,0.4)]"
            viewBox="0 0 560 110"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Hexagonal cyber bracket deco */}
            <path
              d="M10 20 L25 5 L120 5 L135 20 M550 20 L535 5 L440 5 L425 20"
              stroke="#00f3ff"
              strokeWidth="2"
              strokeOpacity="0.7"
            />
            {/* Core stylized title text */}
            <text
              x="280"
              y="64"
              textAnchor="middle"
              className="font-cyber font-black tracking-widest fill-transparent"
              stroke="#00f3ff"
              strokeWidth="1.5"
              fontSize="48"
              letterSpacing="6"
            >
              CYBERSTRIKE
            </text>
            <text
              x="280"
              y="62"
              textAnchor="middle"
              className="font-cyber font-black tracking-widest fill-white"
              fontSize="48"
              letterSpacing="6"
            >
              CYBERSTRIKE
            </text>
            <text
              x="280"
              y="94"
              textAnchor="middle"
              className="font-cyber font-bold tracking-[0.35em] fill-pink-500"
              fontSize="16"
            >
              CYBER BEACH // BIKINI CO-PILOT EDITION
            </text>
          </svg>
        </div>

        {/* Selected Co-Pilot Badge */}
        <div
          onClick={onOpenChampionSelector}
          className="mb-5 inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-pink-500/50 bg-slate-900/80 hover:bg-slate-800 text-slate-200 text-xs font-cyber tracking-wider cursor-pointer pointer-events-auto transition shadow-[0_0_15px_rgba(255,0,85,0.2)]"
        >
          <span className="text-pink-400">👙</span>
          <span>ACTIVE CO-PILOT: <strong className="text-pink-300">{champ.name}</strong></span>
          <span className="text-[10px] text-cyan-400 border-l border-slate-700 pl-2">
            {champ.perkDescription}
          </span>
        </div>

        <p className="text-slate-300/90 text-sm sm:text-base max-w-lg mb-8 leading-relaxed font-sans font-medium">
          Deflect enemy laser barrages and slice rogue combat drones alongside your Bikini Cyber-Squad co-pilots in neon virtual reality!
        </p>

        {/* Primary Start CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pointer-events-auto">
          <button
            onClick={onStart}
            className="group relative px-8 py-3.5 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400 text-cyan-300 hover:text-white font-cyber font-bold tracking-widest text-sm rounded transition-all duration-200 cursor-pointer shadow-[0_0_20px_rgba(0,243,255,0.25)] hover:shadow-[0_0_30px_rgba(0,243,255,0.5)] active:scale-95"
          >
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-cyan-400 rounded-sm transform rotate-45 group-hover:bg-white" />
              START COMBAT [SPACE / ENTER]
            </span>
          </button>

          <button
            onClick={onOpenChampionSelector}
            className="px-5 py-3.5 bg-pink-500/20 hover:bg-pink-500/30 border border-pink-500 text-pink-300 hover:text-white font-cyber text-xs font-bold tracking-wider rounded transition cursor-pointer flex items-center gap-1.5 shadow-[0_0_15px_rgba(255,0,85,0.25)]"
          >
            <span>👙</span> BIKINI SQUAD [C]
          </button>

          <button
            onClick={onOpenReticleConfig}
            className="px-4 py-3.5 bg-slate-900/80 hover:bg-slate-800 border border-cyan-500/50 text-cyan-300 hover:text-white font-cyber text-xs tracking-wider rounded transition cursor-pointer flex items-center gap-1.5"
          >
            <span>⌖</span> RETICLE [R]
          </button>

          <button
            onClick={onOpenDailyMissions}
            className="px-4 py-3.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500 text-amber-300 hover:text-white font-cyber text-xs font-bold tracking-wider rounded transition cursor-pointer flex items-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.25)]"
          >
            <span>🎯</span> MISSIONS [M]
          </button>

          <button
            onClick={onOpenProfile}
            className="px-4 py-3.5 bg-slate-900/80 hover:bg-slate-800 border border-amber-500/50 text-amber-300 hover:text-white font-cyber text-xs tracking-wider rounded transition cursor-pointer flex items-center gap-1.5 shadow-[0_0_12px_rgba(251,191,36,0.15)]"
          >
            <span>👑</span> BADGES [P]
          </button>

          <button
            onClick={onOpenLeaderboard}
            className="px-4 py-3.5 bg-slate-900/80 hover:bg-slate-800 border border-cyan-500/50 text-cyan-300 hover:text-white font-cyber text-xs tracking-wider rounded transition cursor-pointer flex items-center gap-1.5"
          >
            <span>🏆</span> SCORES
          </button>

          <button
            onClick={onOpenAdMobConfig}
            className="px-4 py-3.5 bg-slate-900/80 hover:bg-slate-800 border border-amber-500/50 text-amber-300 hover:text-white font-cyber text-xs tracking-wider rounded transition cursor-pointer flex items-center gap-1.5 shadow-[0_0_12px_rgba(245,158,11,0.2)]"
          >
            <span>📢</span> ADMOB [A]
          </button>

          {vrSupported && (
            <button
              onClick={onEnterVR}
              className="px-6 py-3.5 bg-gradient-to-r from-cyan-600 to-pink-600 hover:from-cyan-500 hover:to-pink-500 text-white font-cyber font-bold tracking-widest text-sm rounded transition-all duration-200 cursor-pointer shadow-[0_0_20px_rgba(255,0,85,0.3)] active:scale-95"
            >
              ENTER VR HEADSET
            </button>
          )}
        </div>
      </div>

      {/* Bottom Flat Control Hint Line */}
      <div className="w-full text-center">
        <div className="inline-block py-2 px-6 rounded-full border border-slate-700/60 bg-slate-900/70 text-slate-400 text-xs sm:text-sm font-medium tracking-wide">
          WASD Move · Left Click Slash · Right Click Shield · F Overdrive · M Daily Missions · A AdMob Ads · C Bikini Squad · R Reticle · P Badges
        </div>
      </div>
    </div>
  );
};
