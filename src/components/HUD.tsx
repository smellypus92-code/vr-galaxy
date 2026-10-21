import React from 'react';
import { User } from 'firebase/auth';
import { CHAMPIONS, ChampionId } from '../game/proceduralModels';
import { PlayerStats, ReticleConfig } from '../game/types';
import { ReticlePreview } from './ReticleCustomizer';
import { dailyMissionTracker } from '../game/dailyMissions';
import { ComboMultiplierDisplay } from './ComboMultiplierDisplay';

interface HUDProps {
  stats: PlayerStats;
  reticleConfig: ReticleConfig;
  user: User | null;
  selectedChampion: ChampionId;
  isMuted: boolean;
  onToggleMute: () => void;
  onPause: () => void;
  onTriggerOverdrive: () => void;
  onOpenReticleConfig: () => void;
  onOpenChampionSelector: () => void;
  onOpenLeaderboard: () => void;
  onOpenProfile: () => void;
  onOpenDailyMissions: () => void;
  onOpenAdMobConfig: () => void;
  onLogin: () => void;
  onLogout: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  stats,
  reticleConfig,
  user,
  selectedChampion,
  isMuted,
  onToggleMute,
  onPause,
  onTriggerOverdrive,
  onOpenReticleConfig,
  onOpenChampionSelector,
  onOpenLeaderboard,
  onOpenProfile,
  onOpenDailyMissions,
  onOpenAdMobConfig,
  onLogin,
  onLogout,
}) => {
  const champ = CHAMPIONS[selectedChampion];

  // Calculate Rank based on combo
  const getRank = (combo: number) => {
    if (combo >= 24) return { rank: 'SSS', color: 'text-amber-400' };
    if (combo >= 16) return { rank: 'SS', color: 'text-pink-400' };
    if (combo >= 10) return { rank: 'S', color: 'text-cyan-400' };
    if (combo >= 5) return { rank: 'A', color: 'text-emerald-400' };
    return { rank: 'B', color: 'text-slate-400' };
  };

  const { rank, color: rankColor } = getRank(stats.combo);
  const multiplier = Math.min(8, Math.floor(stats.combo / 4) + 1);

  return (
    <div className="absolute inset-0 z-10 pointer-events-none select-none flex flex-col justify-between p-4 sm:p-6">
      {/* TOP PERIMETER CLUSTER */}
      <div className="flex items-start justify-between w-full">
        {/* Top-Left: Vitality & Shield Integrity + Champion Badge */}
        <div className="flex flex-col gap-2 min-w-[220px]">
          {/* Health & Shield Bar */}
          <div className="bg-slate-950/80 border border-slate-800 p-2.5 rounded">
            <div className="flex justify-between items-center text-xs font-cyber mb-1">
              <span className="text-pink-500 font-bold tracking-wider flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
                VITALITY
              </span>
              <span className="tabular-nums font-semibold text-slate-200">
                {Math.round(stats.health)} / {stats.maxHealth}
              </span>
            </div>
            <div className="w-full h-2 bg-slate-900 rounded-sm overflow-hidden border border-pink-950">
              <div
                className="h-full bg-gradient-to-r from-pink-600 to-rose-400 transition-all duration-150"
                style={{ width: `${(stats.health / stats.maxHealth) * 100}%` }}
              />
            </div>

            {/* Shield Bar */}
            <div className="flex justify-between items-center text-xs font-cyber mt-2 mb-1">
              <span className="text-cyan-400 font-bold tracking-wider flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
                </svg>
                SHIELD
              </span>
              <span className="tabular-nums font-semibold text-slate-200">
                {Math.round(stats.shield)} / {stats.maxShield}
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-900 rounded-sm overflow-hidden border border-cyan-950">
              <div
                className="h-full bg-gradient-to-r from-cyan-600 to-cyan-300 transition-all duration-150"
                style={{ width: `${(stats.shield / stats.maxShield) * 100}%` }}
              />
            </div>
          </div>

          {/* Active Bikini Cyber Champion Co-Pilot Badge */}
          <div
            onClick={onOpenChampionSelector}
            className="bg-slate-950/80 hover:bg-slate-900/90 border border-pink-500/40 p-2 rounded flex items-center justify-between cursor-pointer pointer-events-auto transition group shadow-[0_0_12px_rgba(255,0,85,0.15)]"
          >
            <div className="flex items-center gap-2">
              <span className="text-pink-400 group-hover:scale-110 transition">👙</span>
              <div>
                <div className="text-[9px] font-cyber text-pink-400 tracking-widest uppercase">
                  CO-PILOT CHAMPION
                </div>
                <div className="font-cyber font-bold text-xs text-white">
                  {champ.name}
                </div>
              </div>
            </div>
            <span className="text-[10px] text-cyan-400 font-cyber font-bold px-1.5 py-0.5 rounded border border-cyan-500/40 bg-cyan-950/40">
              CHANGE
            </span>
          </div>
        </div>

        {/* Center: Wave Threat Tracker */}
        <div className="flex flex-col items-center">
          <div className="bg-slate-950/80 border border-slate-800 px-5 py-2 rounded text-center">
            <span className="text-[10px] font-cyber text-slate-400 tracking-widest uppercase block">
              COMBAT SECTOR // CYBER BEACH
            </span>
            <span className="font-cyber font-bold text-lg text-cyan-400 tracking-wider">
              WAVE {stats.wave} <span className="text-xs text-slate-400 font-normal">/ 5</span>
            </span>
          </div>

          {stats.isOverdriveActive > 0 && (
            <div className="mt-2 px-3 py-1 bg-cyan-950/90 border border-cyan-400 rounded text-cyan-300 font-cyber font-bold text-xs tracking-widest">
              CHRONO DILATION ACTIVE ({stats.isOverdriveActive.toFixed(1)}s)
            </div>
          )}
        </div>

        {/* Top-Right: Score, Combo, User Profile & Actions */}
        <div className="flex flex-col items-end gap-2 min-w-[210px]">
          {/* User Auth Info Bar */}
          <div className="flex items-center gap-2 pointer-events-auto">
            {/* Cyber Credits balance */}
            <button
              onClick={onOpenDailyMissions}
              title="Cyber Credits Earned (Click to view Daily Missions)"
              className="bg-slate-950/80 hover:bg-slate-900 border border-cyan-500/40 text-cyan-300 py-1 px-2.5 rounded text-[11px] font-cyber tracking-wider transition cursor-pointer flex items-center gap-1 shadow-[0_0_10px_rgba(0,243,255,0.15)]"
            >
              <span>💎</span>
              <span className="font-bold tabular-nums">{dailyMissionTracker.getCredits().toLocaleString()}</span>
            </button>

            {/* Daily Missions button */}
            <button
              onClick={onOpenDailyMissions}
              title="Daily Missions & Directives (M)"
              className="bg-slate-950/80 hover:bg-slate-900 border border-amber-500/50 text-amber-300 hover:text-white py-1 px-2 rounded text-[11px] font-cyber tracking-wider transition cursor-pointer flex items-center gap-1 shadow-[0_0_10px_rgba(245,158,11,0.2)]"
            >
              <span>🎯</span> MISSIONS
            </button>

            <button
              onClick={onOpenProfile}
              title="Operative Profile & Badges (P)"
              className="bg-slate-950/80 hover:bg-slate-900 border border-amber-500/50 text-amber-300 hover:text-white py-1 px-2 rounded text-[11px] font-cyber tracking-wider transition cursor-pointer flex items-center gap-1 shadow-[0_0_10px_rgba(251,191,36,0.2)]"
            >
              <span>👑</span> BADGES
            </button>

            <button
              onClick={onOpenAdMobConfig}
              title="Google AdMob Account Settings (A)"
              className="bg-slate-950/80 hover:bg-slate-900 border border-amber-500/50 text-amber-300 hover:text-white py-1 px-2 rounded text-[11px] font-cyber tracking-wider transition cursor-pointer flex items-center gap-1 shadow-[0_0_10px_rgba(245,158,11,0.2)]"
            >
              <span>📢</span> ADMOB
            </button>

            {user ? (
              <div
                onClick={onOpenProfile}
                title="View Operative Dossier"
                className="flex items-center gap-2 bg-slate-950/80 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/40 py-1 px-2.5 rounded text-xs cursor-pointer transition"
              >
                {user.photoURL && (
                  <img src={user.photoURL} alt="" className="w-5 h-5 rounded-full object-cover" />
                )}
                <span className="font-cyber text-slate-200 text-[11px] truncate max-w-[90px]">
                  {user.displayName || 'Player'}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onLogout();
                  }}
                  title="Sign Out"
                  className="text-slate-500 hover:text-slate-300 ml-1 cursor-pointer text-[10px] font-cyber"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                onClick={onLogin}
                className="bg-slate-950/80 hover:bg-slate-900 border border-cyan-500/40 text-cyan-300 hover:text-white py-1 px-2.5 rounded text-[11px] font-cyber tracking-wider transition cursor-pointer flex items-center gap-1.5 shadow-[0_0_10px_rgba(0,243,255,0.15)]"
              >
                <span>G</span> SIGN IN
              </button>
            )}

            <button
              onClick={onOpenLeaderboard}
              title="Global Hall of Fame Leaderboard"
              className="bg-slate-950/80 hover:bg-slate-900 border border-cyan-500/40 text-cyan-300 hover:text-white py-1 px-2.5 rounded text-[11px] font-cyber tracking-wider transition cursor-pointer flex items-center gap-1 shadow-[0_0_10px_rgba(0,243,255,0.15)]"
            >
              <span>🏆</span>
            </button>
          </div>

          {/* Score Box */}
          <div className="bg-slate-950/80 border border-slate-800 p-2.5 rounded w-full text-right">
            <div className="text-[10px] font-cyber text-slate-400 tracking-wider uppercase">
              CYBER SCORE
            </div>
            <div className="font-cyber font-bold text-xl text-white tracking-wider tabular-nums">
              {stats.score.toLocaleString()}
            </div>

            {/* Quick combo readout summary */}
            <div className="flex items-center justify-end gap-2 mt-1">
              {stats.combo > 0 && (
                <>
                  <span className={`font-cyber font-extrabold text-sm ${rankColor}`}>
                    {rank}
                  </span>
                  <span className="font-cyber text-xs text-pink-400 font-bold tabular-nums">
                    {stats.combo} HITS (x{multiplier})
                  </span>
                </>
              )}
            </div>
          </div>

          {/* High-Energy, Animated Combo Multiplier Display */}
          <ComboMultiplierDisplay
            combo={stats.combo}
            maxCombo={stats.maxCombo}
            comboTimer={stats.comboTimer}
          />

          {/* Quick Controls: Reticle Config, Audio Mute & Pause */}
          <div className="flex items-center gap-2 pointer-events-auto">
            <button
              onClick={onOpenReticleConfig}
              title="Customize VR Reticle & Crosshair (R)"
              className="px-2.5 py-1.5 rounded bg-slate-950/80 hover:bg-slate-900 border border-cyan-500/40 text-cyan-300 hover:text-white font-cyber text-xs tracking-wider transition cursor-pointer flex items-center gap-1.5 shadow-[0_0_10px_rgba(0,243,255,0.15)]"
            >
              <span className="text-cyan-400">⌖</span> RETICLE
            </button>

            <button
              onClick={onToggleMute}
              title={isMuted ? 'Unmute Audio (M)' : 'Mute Audio (M)'}
              className="p-2 rounded bg-slate-950/80 hover:bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
            >
              {isMuted ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
              )}
            </button>

            <button
              onClick={onPause}
              title="Pause Game (Esc)"
              className="px-3 py-1.5 rounded bg-slate-950/80 hover:bg-slate-900 border border-slate-800 text-slate-300 hover:text-white font-cyber text-xs tracking-wider transition cursor-pointer"
            >
              PAUSE [ESC]
            </button>
          </div>
        </div>
      </div>

      {/* CENTER CUSTOMIZABLE CROSSHAIR & TARGET LOCK DISPLAY */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none flex flex-col items-center">
        <ReticlePreview
          style={reticleConfig.style}
          color={stats.isTargetingDrone ? reticleConfig.targetColor : reticleConfig.idleColor}
          size={reticleConfig.size}
          isLocked={stats.isTargetingDrone}
        />

        {/* Dynamic Target Locked Readout */}
        {stats.isTargetingDrone && (
          <div className="mt-2.5 px-2.5 py-0.5 rounded border border-pink-500/60 bg-pink-950/80 text-[10px] font-cyber tracking-widest text-pink-300 animate-pulse flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-ping" />
            <span>
              LOCK: {stats.targetedEnemyType || 'DRONE'}
              {reticleConfig.showDistanceReadout && ` [${stats.targetedDistance.toFixed(1)}m]`}
            </span>
          </div>
        )}
      </div>

      {/* BOTTOM PERIMETER CLUSTER: OVERDRIVE CHRONO GAUGE */}
      <div className="flex flex-col items-center max-w-md mx-auto w-full">
        <div className="w-full bg-slate-950/80 border border-slate-800 p-2.5 rounded">
          <div className="flex justify-between items-center text-xs font-cyber mb-1">
            <span className="text-cyan-300 font-bold tracking-wider flex items-center gap-1.5">
              CHRONO OVERDRIVE
            </span>
            <span className="tabular-nums font-semibold text-slate-300">
              {Math.round(stats.overdrive)}%
            </span>
          </div>

          <div className="w-full h-2.5 bg-slate-900 rounded-sm overflow-hidden border border-cyan-950">
            <div
              className={`h-full transition-all duration-150 ${
                stats.overdrive >= 100
                  ? 'bg-gradient-to-r from-cyan-400 via-pink-400 to-cyan-300 shadow-[0_0_12px_rgba(0,243,255,0.8)]'
                  : 'bg-gradient-to-r from-blue-600 to-cyan-400'
              }`}
              style={{ width: `${stats.overdrive}%` }}
            />
          </div>

          {stats.overdrive >= 100 && stats.isOverdriveActive <= 0 && (
            <div className="mt-2 text-center pointer-events-auto">
              <button
                onClick={onTriggerOverdrive}
                className="px-4 py-1 bg-cyan-500/30 hover:bg-cyan-500/50 border border-cyan-400 text-cyan-200 text-xs font-cyber font-bold tracking-widest rounded transition cursor-pointer shadow-[0_0_15px_rgba(0,243,255,0.4)]"
              >
                OVERDRIVE READY [PRESS F / CLICK]
              </button>
            </div>
          )}
        </div>

        {/* Minimal Control hint line at bottom */}
        <div className="mt-2 text-[11px] font-mono text-slate-500/80 tracking-wide text-center">
          Left Click: Slice Blade · Right Click: Energy Shield · Aim at Drones to Lock On · [R] Reticle Settings
        </div>
      </div>
    </div>
  );
};
