import React, { useState } from 'react';
import { User } from 'firebase/auth';
import {
  Achievement,
  ACHIEVEMENTS,
  achievementTracker,
  AchievementCategory,
} from '../game/achievements';
import { dailyMissionTracker, EXCLUSIVE_BADGES } from '../game/dailyMissions';
import { admobManager } from '../game/admob';
import { PlayerStats } from '../game/types';

interface ProfileModalProps {
  user: User | null;
  stats: PlayerStats;
  selectedChampion: string;
  onClose: () => void;
  onOpenAdMobConfig?: () => void;
  onLogin: () => void;
  onLogout: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  user,
  stats,
  selectedChampion,
  onClose,
  onOpenAdMobConfig,
  onLogin,
  onLogout,
}) => {
  const [activeCategory, setActiveCategory] = useState<AchievementCategory | 'ALL' | 'UNLOCKED' | 'DAILY_EXCLUSIVES'>('ALL');

  const rankInfo = achievementTracker.getPlayerRank();
  const unlockedIds = achievementTracker.getUnlockedIds();
  const cumulative = achievementTracker.getCumulativeStats();
  const credits = dailyMissionTracker.getCredits();
  const lifetimeMissions = dailyMissionTracker.getLifetimeMissionsCompleted();
  const unlockedExclusiveIds = dailyMissionTracker.getUnlockedExclusiveBadgeIds();

  const totalBadges = ACHIEVEMENTS.length;
  const unlockedCount = unlockedIds.length;
  const completionPercent = Math.round((unlockedCount / totalBadges) * 100);

  // Filtered achievements
  const filteredAchievements = ACHIEVEMENTS.filter((ach) => {
    if (activeCategory === 'ALL') return true;
    if (activeCategory === 'UNLOCKED') return achievementTracker.isUnlocked(ach.id);
    if (activeCategory === 'DAILY_EXCLUSIVES') return false;
    return ach.category === activeCategory;
  });

  const tierStyles = {
    BRONZE: {
      border: 'border-amber-700/60',
      badgeBorder: 'border-amber-600',
      bg: 'from-amber-950/20 to-slate-900/80',
      text: 'text-amber-500',
      glow: 'shadow-[0_0_15px_rgba(205,127,50,0.2)]',
    },
    SILVER: {
      border: 'border-slate-500/60',
      badgeBorder: 'border-slate-400',
      bg: 'from-slate-800/20 to-slate-900/80',
      text: 'text-slate-300',
      glow: 'shadow-[0_0_15px_rgba(148,163,184,0.2)]',
    },
    GOLD: {
      border: 'border-amber-400/70',
      badgeBorder: 'border-amber-400',
      bg: 'from-amber-950/30 to-slate-900/80',
      text: 'text-amber-300',
      glow: 'shadow-[0_0_20px_rgba(251,191,36,0.25)]',
    },
    PLATINUM: {
      border: 'border-cyan-400/80',
      badgeBorder: 'border-cyan-400',
      bg: 'from-cyan-950/30 to-slate-900/80',
      text: 'text-cyan-300',
      glow: 'shadow-[0_0_20px_rgba(56,189,248,0.3)]',
    },
  };

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-3 sm:p-6 bg-slate-950/90 backdrop-blur-md pointer-events-auto">
      <div className="w-full max-w-4xl max-h-[92vh] flex flex-col bg-slate-900 border border-cyan-500/50 rounded-xl shadow-[0_0_50px_rgba(0,243,255,0.2)] overflow-hidden">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f3ff]" />
            <div>
              <h2 className="font-cyber font-black text-lg sm:text-xl text-white tracking-wider">
                OPERATIVE DOSSIER & ACHIEVEMENT BADGES
              </h2>
              <span className="text-[10px] font-cyber text-slate-400 tracking-widest uppercase">
                CYBERSTRIKE VR // NEURAL MILITARY DATABASE
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded border border-slate-700 bg-slate-800/80 hover:bg-rose-950/60 hover:border-rose-500 text-slate-400 hover:text-rose-300 flex items-center justify-center font-cyber text-sm transition cursor-pointer"
            title="Close Dossier"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar">
          {/* PLAYER IDENTITY CARD */}
          <div className="relative p-5 rounded-xl border border-cyan-500/40 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 shadow-[0_0_25px_rgba(0,243,255,0.1)]">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
              {/* Avatar & Rank Lockup */}
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 rounded-xl border-2 border-cyan-400 p-1 bg-slate-950 shadow-[0_0_15px_rgba(0,243,255,0.3)] shrink-0 flex items-center justify-center overflow-hidden">
                  {user?.photoURL ? (
                    <img src={user.photoURL} alt="" className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <div className="w-full h-full rounded-lg bg-cyan-950/80 flex items-center justify-center text-cyan-300 font-cyber font-black text-2xl">
                      ⚡
                    </div>
                  )}
                  <span className="absolute bottom-0 right-0 px-1 py-0.2 bg-black/80 text-[9px] font-cyber font-bold text-cyan-300 border border-cyan-500/50 rounded">
                    LV.{rankInfo.level}
                  </span>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-cyber font-bold text-xl text-white tracking-wide">
                      {user?.displayName || 'Cyber Operative #702B'}
                    </h3>
                    <span className="font-cyber text-[10px] px-2 py-0.5 rounded border border-cyan-400/50 bg-cyan-950/50 text-cyan-300 font-bold uppercase tracking-wider">
                      {rankInfo.title}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 mt-1 font-sans flex items-center gap-3 flex-wrap">
                    <span>
                      ACTIVE CO-PILOT: <strong className="text-pink-400">{selectedChampion}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      BADGES: <strong className="text-cyan-300">{unlockedCount} / {totalBadges} ({completionPercent}%)</strong>
                    </span>
                    <span>•</span>
                    <span>
                      CREDITS: <strong className="text-amber-300">💎 {credits.toLocaleString()}</strong>
                    </span>
                  </p>
                </div>
              </div>

              {/* Cloud Sync Status & Login */}
              <div className="flex flex-col md:items-end gap-2 w-full md:w-auto">
                {user ? (
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-emerald-500/40 bg-emerald-950/40 text-emerald-400 text-xs font-cyber tracking-wider">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      FIRESTORE CLOUD SYNC ACTIVE
                    </span>
                    <button
                      onClick={onLogout}
                      className="px-2.5 py-1 rounded border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-cyber cursor-pointer"
                    >
                      LOGOUT
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-sans">
                      Local Offline Profile
                    </span>
                    <button
                      onClick={onLogin}
                      className="px-3 py-1.5 rounded bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400 text-cyan-300 font-cyber text-xs tracking-wider transition cursor-pointer flex items-center gap-1.5 shadow-[0_0_12px_rgba(0,243,255,0.2)]"
                    >
                      <span>G</span> SIGN IN TO CLOUD SYNC
                    </button>
                    {onOpenAdMobConfig && (
                      <button
                        onClick={onOpenAdMobConfig}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-amber-500/40 bg-amber-950/40 hover:bg-amber-900/50 text-amber-300 text-xs font-cyber tracking-wider transition cursor-pointer"
                        title="Configure Google AdMob Account"
                      >
                        <span>📢</span>
                        <span>{admobManager.getConfig().accountConnected ? 'ADMOB: LINKED' : 'ADMOB: TEST SANDBOX'}</span>
                        <span className="text-[10px] text-amber-400">⚙</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* XP Progression Bar */}
            <div className="mt-5 pt-4 border-t border-slate-800">
              <div className="flex justify-between items-center text-xs font-cyber mb-1.5">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <span className="text-cyan-400">XP PROGRESSION:</span>
                  <span className="text-white font-bold tabular-nums">
                    {rankInfo.totalXp.toLocaleString()} XP
                  </span>
                </span>
                <span className="text-slate-400 tabular-nums">
                  Next Rank: {rankInfo.nextLevelXp.toLocaleString()} XP ({rankInfo.progressPercent}%)
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-950 rounded-full border border-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 via-pink-500 to-amber-400 transition-all duration-500 rounded-full"
                  style={{ width: `${rankInfo.progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* CAREER COMBAT DOSSIER METRICS */}
          <div>
            <h4 className="font-cyber font-bold text-xs tracking-widest text-slate-400 uppercase mb-3 flex items-center gap-2">
              <span>📊</span> LIFETIME COMBAT DOSSIER & MILESTONES
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 font-cyber">
              {/* Drone Century Milestone Block */}
              <div className="p-3 rounded-lg border border-amber-500/40 bg-slate-950/70 shadow-[0_0_15px_rgba(251,191,36,0.1)]">
                <div className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                  DRONES PURGED
                </div>
                <div className="text-xl font-black text-white tabular-nums mt-0.5">
                  {cumulative.totalKills}
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  {cumulative.totalKills >= 100 ? (
                    <span className="text-amber-400 font-bold">100th Milestone ✓</span>
                  ) : (
                    <span>{100 - cumulative.totalKills} to 100th Badge</span>
                  )}
                </div>
              </div>

              {/* Perfect Wave Block */}
              <div className="p-3 rounded-lg border border-cyan-500/40 bg-slate-950/70 shadow-[0_0_15px_rgba(56,189,248,0.1)]">
                <div className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">
                  PERFECT WAVES
                </div>
                <div className="text-xl font-black text-white tabular-nums mt-0.5">
                  {cumulative.perfectWavesCount}
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  {cumulative.perfectWaveDone ? (
                    <span className="text-cyan-400 font-bold">Flawless Shield ✓</span>
                  ) : (
                    <span>Zero Damage Clear</span>
                  )}
                </div>
              </div>

              {/* Deflections */}
              <div className="p-3 rounded-lg border border-slate-800 bg-slate-950/70">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  DEFLECTIONS
                </div>
                <div className="text-xl font-black text-slate-200 tabular-nums mt-0.5">
                  {cumulative.totalDeflections}
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  Plasma Reflected
                </div>
              </div>

              {/* Shards Sliced */}
              <div className="p-3 rounded-lg border border-slate-800 bg-slate-950/70">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  SHARDS SLICED
                </div>
                <div className="text-xl font-black text-slate-200 tabular-nums mt-0.5">
                  {cumulative.totalShards}
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  Rhythm Data Cubes
                </div>
              </div>

              {/* Max Combo */}
              <div className="p-3 rounded-lg border border-slate-800 bg-slate-950/70">
                <div className="text-[10px] text-pink-400 font-bold uppercase tracking-wider">
                  MAX COMBO
                </div>
                <div className="text-xl font-black text-pink-400 tabular-nums mt-0.5">
                  {cumulative.maxCombo}x
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  Streak Peak
                </div>
              </div>

              {/* Max Wave Reached */}
              <div className="p-3 rounded-lg border border-slate-800 bg-slate-950/70">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  HIGHEST WAVE
                </div>
                <div className="text-xl font-black text-emerald-400 tabular-nums mt-0.5">
                  WAVE {cumulative.maxWave}
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  Sector Cleared
                </div>
              </div>

              {/* Daily Missions Completed */}
              <div className="p-3 rounded-lg border border-amber-500/40 bg-amber-950/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                <div className="text-[10px] text-amber-300 font-bold uppercase tracking-wider">
                  DAILY DIRECTIVES
                </div>
                <div className="text-xl font-black text-amber-300 tabular-nums mt-0.5">
                  {lifetimeMissions}
                </div>
                <div className="text-[10px] text-amber-400/80 mt-1">
                  Missions Cleared
                </div>
              </div>

              {/* Cyber Credits */}
              <div className="p-3 rounded-lg border border-cyan-400/40 bg-cyan-950/20 shadow-[0_0_15px_rgba(0,243,255,0.1)]">
                <div className="text-[10px] text-cyan-300 font-bold uppercase tracking-wider">
                  CYBER CREDITS
                </div>
                <div className="text-xl font-black text-cyan-300 tabular-nums mt-0.5">
                  {credits.toLocaleString()}
                </div>
                <div className="text-[10px] text-cyan-400/80 mt-1">
                  💎 Currency
                </div>
              </div>
            </div>
          </div>

          {/* BADGES FILTER TABS */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h4 className="font-cyber font-bold text-xs tracking-widest text-slate-300 uppercase flex items-center gap-2">
                <span>👑</span> MILESTONE BADGE MATRIX ({unlockedCount}/{totalBadges})
              </h4>

              <div className="flex flex-wrap items-center gap-1.5 font-cyber text-xs">
                {(['ALL', 'COMBAT', 'DEFENSE', 'PRECISION', 'MASTERY', 'UNLOCKED', 'DAILY_EXCLUSIVES'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveCategory(tab)}
                    className={`px-3 py-1 rounded transition cursor-pointer text-[11px] tracking-wider ${
                      activeCategory === tab
                        ? 'bg-cyan-500/30 border border-cyan-400 text-cyan-200 shadow-[0_0_10px_rgba(0,243,255,0.2)]'
                        : 'bg-slate-950/60 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    {tab === 'DAILY_EXCLUSIVES' ? `DAILY EXCLUSIVES (${unlockedExclusiveIds.length})` : tab}
                  </button>
                ))}
              </div>
            </div>

            {/* BADGES GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {activeCategory === 'DAILY_EXCLUSIVES' ? (
                EXCLUSIVE_BADGES.map((badge) => {
                  const isUnlocked = unlockedExclusiveIds.includes(badge.id);

                  return (
                    <div
                      key={badge.id}
                      className={`relative p-4 rounded-xl border bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 transition-all duration-200 ${
                        isUnlocked
                          ? 'border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.25)]'
                          : 'border-slate-800 opacity-60'
                      }`}
                    >
                      <div className="flex items-start gap-3.5">
                        <div
                          className={`w-14 h-14 rounded-xl border-2 flex items-center justify-center shrink-0 bg-slate-950 text-2xl ${
                            isUnlocked
                              ? 'border-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.4)]'
                              : 'border-slate-700 grayscale'
                          }`}
                        >
                          <span>{badge.symbol}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h5
                              className={`font-cyber font-bold text-sm tracking-wide truncate ${
                                isUnlocked ? 'text-white' : 'text-slate-400'
                              }`}
                            >
                              {badge.title}
                            </h5>
                            <span className="text-[9px] font-cyber font-bold uppercase px-1.5 py-0.5 rounded border border-amber-500/50 bg-amber-950/60 text-amber-300">
                              {badge.rarity}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300/80 font-sans mt-0.5 leading-relaxed">
                            {badge.description}
                          </p>
                          <div className="mt-2.5 text-[10px] font-cyber">
                            <span className={isUnlocked ? 'text-emerald-400 font-bold flex items-center gap-1' : 'text-slate-500'}>
                              {isUnlocked ? 'UNLOCKED & EARNED IN MISSIONS ✓' : 'LOCKED — COMPLETE DAILY DIRECTIVE'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                filteredAchievements.map((ach) => {
                  const prog = achievementTracker.getProgress(ach, stats);
                  const tierStyle = tierStyles[ach.tier] || tierStyles.GOLD;
                  const isCrown = ach.id === 'drone_century_100';
                  const isShield = ach.id === 'perfect_wave';

                return (
                  <div
                    key={ach.id}
                    className={`relative p-4 rounded-xl border bg-gradient-to-r ${tierStyle.bg} transition-all duration-200 ${
                      prog.isUnlocked
                        ? `${tierStyle.border} ${tierStyle.glow}`
                        : 'border-slate-800 opacity-70 hover:opacity-90'
                    }`}
                  >
                    {/* Special glow tag for crowning user milestones */}
                    {(isCrown || isShield) && prog.isUnlocked && (
                      <div className="absolute -top-2.5 right-4 px-2 py-0.5 rounded-full bg-black/90 border border-amber-400 text-amber-300 font-cyber font-bold text-[9px] tracking-widest uppercase shadow-[0_0_10px_rgba(251,191,36,0.5)]">
                        ★ PINNACLE MILESTONE ★
                      </div>
                    )}

                    <div className="flex items-start gap-3.5">
                      {/* Badge Emblem Hexagon */}
                      <div
                        className={`relative w-14 h-14 rounded-xl border-2 flex items-center justify-center shrink-0 bg-slate-950 shadow-inner ${
                          prog.isUnlocked
                            ? `${tierStyle.badgeBorder} ${tierStyle.glow}`
                            : 'border-slate-700 grayscale'
                        }`}
                      >
                        <span className="text-2xl filter drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">
                          {ach.badgeSymbol}
                        </span>

                        <span
                          className={`absolute -bottom-1.5 -right-1.5 px-1 py-0.2 rounded font-cyber text-[8px] font-black uppercase border bg-black/90 ${
                            prog.isUnlocked ? tierStyle.text : 'text-slate-500 border-slate-800'
                          }`}
                        >
                          {ach.tier}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h5
                            className={`font-cyber font-bold text-sm tracking-wide truncate ${
                              prog.isUnlocked ? 'text-white' : 'text-slate-300'
                            }`}
                          >
                            {ach.title}
                          </h5>

                          <span className={`text-[10px] font-cyber font-bold px-1.5 py-0.5 rounded border bg-black/50 ${tierStyle.border} ${tierStyle.text} shrink-0`}>
                            +{ach.xpReward} XP
                          </span>
                        </div>

                        <p className="text-xs text-slate-300/80 font-sans mt-0.5 leading-relaxed">
                          {ach.description}
                        </p>

                        {/* Progress Bar & Status */}
                        <div className="mt-3">
                          <div className="flex justify-between items-center text-[10px] font-cyber mb-1">
                            <span className={prog.isUnlocked ? 'text-emerald-400 font-bold flex items-center gap-1' : 'text-slate-400'}>
                              {prog.isUnlocked ? 'UNLOCKED ✓' : 'PROGRESS'}
                            </span>
                            <span className="tabular-nums text-slate-300 font-medium">
                              {prog.current} / {prog.max} ({prog.percent}%)
                            </span>
                          </div>

                          <div className="w-full h-1.5 bg-slate-950 rounded-full border border-slate-800 overflow-hidden">
                            <div
                              className={`h-full transition-all duration-300 rounded-full ${
                                prog.isUnlocked
                                  ? 'bg-gradient-to-r from-emerald-400 to-cyan-400'
                                  : 'bg-gradient-to-r from-cyan-600 to-slate-500'
                              }`}
                              style={{ width: `${prog.percent}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            </div>
          </div>
        </div>

        {/* Modal Bottom Bar */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-400 font-sans hidden sm:block">
            Achievements grant XP to advance your Operative Rank and unlock combat prestige.
          </div>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400 text-cyan-300 font-cyber font-bold text-xs tracking-wider rounded transition cursor-pointer shadow-[0_0_15px_rgba(0,243,255,0.2)]"
          >
            CONFIRM & RETURN [ESC]
          </button>
        </div>
      </div>
    </div>
  );
};
