import React, { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import {
  ArmoryItem,
  DailyMission,
  DailyMissionTracker,
  dailyMissionTracker,
  EXCLUSIVE_BADGES,
  ExclusiveBadge,
} from '../game/dailyMissions';
import { sound } from '../game/audio';

interface DailyMissionsModalProps {
  user: User | null;
  onClose: () => void;
  onClaimSync?: () => void;
}

export const DailyMissionsModal: React.FC<DailyMissionsModalProps> = ({
  user,
  onClose,
  onClaimSync,
}) => {
  const [activeTab, setActiveTab] = useState<'OBJECTIVES' | 'BADGES' | 'ARMORY'>('OBJECTIVES');
  const [missions, setMissions] = useState<DailyMission[]>(dailyMissionTracker.getMissions());
  const [credits, setCredits] = useState<number>(dailyMissionTracker.getCredits());
  const [allClearClaimed, setAllClearClaimed] = useState<boolean>(dailyMissionTracker.isAllClearBonusClaimed());
  const [armoryItems, setArmoryItems] = useState<ArmoryItem[]>(dailyMissionTracker.getArmoryItems());
  const [unlockedBadgeIds, setUnlockedBadgeIds] = useState<string[]>(dailyMissionTracker.getUnlockedExclusiveBadgeIds());
  const [timeUntilReset, setTimeUntilReset] = useState<string>(DailyMissionTracker.getTimeUntilReset().formatted);
  const [notificationMsg, setNotificationMsg] = useState<{ text: string; type: 'success' | 'info' } | null>(null);

  // Live countdown to midnight reset
  useEffect(() => {
    const timer = setInterval(() => {
      const reset = DailyMissionTracker.getTimeUntilReset();
      setTimeUntilReset(reset.formatted);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Sync state when tracker emits updates
  const refreshState = () => {
    setMissions([...dailyMissionTracker.getMissions()]);
    setCredits(dailyMissionTracker.getCredits());
    setAllClearClaimed(dailyMissionTracker.isAllClearBonusClaimed());
    setArmoryItems(dailyMissionTracker.getArmoryItems());
    setUnlockedBadgeIds(dailyMissionTracker.getUnlockedExclusiveBadgeIds());
  };

  useEffect(() => {
    dailyMissionTracker.onStateUpdated = refreshState;
    dailyMissionTracker.onCurrencyUpdated = (c) => setCredits(c);
    refreshState();
  }, []);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.code === 'KeyM') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleClaimMission = (missionId: string) => {
    const result = dailyMissionTracker.claimMissionReward(missionId);
    if (result) {
      refreshState();
      onClaimSync?.();
      setNotificationMsg({
        text: `Claimed +${result.creditsEarned} Cyber Credits${result.badgeUnlocked ? ` and unlocked ${result.badgeUnlocked.title} Badge!` : '!'}`,
        type: 'success',
      });
      setTimeout(() => setNotificationMsg(null), 4000);
    }
  };

  const handleClaimAllClear = () => {
    const result = dailyMissionTracker.claimAllClearBonus();
    if (result) {
      refreshState();
      onClaimSync?.();
      setNotificationMsg({
        text: `TRI-VECTOR PROTOCOL CLAIMED! +${result.bonusCredits} Credits & ${result.badgeUnlocked.title} Badge!`,
        type: 'success',
      });
      setTimeout(() => setNotificationMsg(null), 4500);
    }
  };

  const handlePurchaseArmory = (itemId: string) => {
    const ok = dailyMissionTracker.purchaseArmoryItem(itemId);
    if (ok) {
      refreshState();
      onClaimSync?.();
      setNotificationMsg({
        text: `Requisition authorized! Armory item equipped.`,
        type: 'success',
      });
      setTimeout(() => setNotificationMsg(null), 3500);
    } else {
      setNotificationMsg({
        text: `Insufficient Cyber Credits for this requisition. Complete daily missions to earn more!`,
        type: 'info',
      });
      setTimeout(() => setNotificationMsg(null), 3500);
    }
  };

  const completedCount = missions.filter((m) => m.isCompleted).length;
  const allCompleted = completedCount === 3;
  const lifetimeCompleted = dailyMissionTracker.getLifetimeMissionsCompleted();
  const unlockedBadgesCount = unlockedBadgeIds.length;

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-3 sm:p-6 bg-slate-950/90 backdrop-blur-md pointer-events-auto">
      <div className="w-full max-w-4xl max-h-[92vh] flex flex-col bg-slate-900 border border-amber-500/50 rounded-xl shadow-[0_0_50px_rgba(245,158,11,0.2)] overflow-hidden">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-amber-400 shadow-[0_0_10px_#f59e0b] animate-pulse" />
            <div>
              <h2 className="font-cyber font-black text-lg sm:text-xl text-white tracking-wider flex items-center gap-2">
                <span>DAILY COMBAT MISSIONS</span>
                <span className="text-xs px-2 py-0.5 rounded border border-amber-500/50 bg-amber-950/60 text-amber-300 font-bold uppercase">
                  ACTIVE PROTOCOL
                </span>
              </h2>
              <div className="flex items-center gap-3 text-[11px] font-cyber text-slate-400 tracking-wider mt-0.5">
                <span>DEPLOYMENT: {DailyMissionTracker.getTodayDateKey()}</span>
                <span>•</span>
                <span className="text-amber-300 font-medium">RESETS IN: {timeUntilReset}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded border border-slate-700 bg-slate-800/80 hover:bg-rose-950/60 hover:border-rose-500 text-slate-400 hover:text-rose-300 flex items-center justify-center font-cyber text-sm transition cursor-pointer"
            title="Close Missions (ESC)"
          >
            ✕
          </button>
        </div>

        {/* Currency & Statistics Ribbon */}
        <div className="px-6 py-3 bg-slate-950/60 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-4 shrink-0">
          {/* Cyber Credits Balance */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-cyan-400/50 bg-cyan-950/40 shadow-[0_0_15px_rgba(0,243,255,0.15)]">
              <span className="text-cyan-400 text-base">💎</span>
              <div>
                <div className="text-[9px] font-cyber uppercase tracking-widest text-cyan-400">
                  OPERATIVE CURRENCY
                </div>
                <div className="text-sm font-cyber font-black text-white tabular-nums">
                  {credits.toLocaleString()} <span className="text-cyan-300 text-xs">CREDITS</span>
                </div>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-4 text-xs font-cyber text-slate-400">
              <div>
                <span className="text-slate-300">LIFETIME CLEARED:</span>{' '}
                <strong className="text-white">{lifetimeCompleted}</strong>
              </div>
              <span>•</span>
              <div>
                <span className="text-slate-300">TODAY:</span>{' '}
                <strong className={allCompleted ? 'text-amber-300' : 'text-cyan-300'}>
                  {completedCount} / 3 COMPLETED
                </strong>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-lg border border-slate-800 font-cyber text-xs">
            <button
              onClick={() => setActiveTab('OBJECTIVES')}
              className={`px-3 py-1.5 rounded transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'OBJECTIVES'
                  ? 'bg-amber-500/25 border border-amber-400 text-amber-200 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span>🎯</span>
              <span>OBJECTIVES ({completedCount}/3)</span>
            </button>

            <button
              onClick={() => setActiveTab('BADGES')}
              className={`px-3 py-1.5 rounded transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'BADGES'
                  ? 'bg-amber-500/25 border border-amber-400 text-amber-200 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span>👑</span>
              <span>EXCLUSIVE BADGES ({unlockedBadgesCount})</span>
            </button>

            <button
              onClick={() => setActiveTab('ARMORY')}
              className={`px-3 py-1.5 rounded transition cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'ARMORY'
                  ? 'bg-amber-500/25 border border-amber-400 text-amber-200 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span>🛒</span>
              <span>ARMORY REQUISITIONS</span>
            </button>
          </div>
        </div>

        {/* Dynamic Notification Banner */}
        {notificationMsg && (
          <div
            className={`px-6 py-2 text-xs font-cyber flex items-center justify-between border-b ${
              notificationMsg.type === 'success'
                ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300'
                : 'bg-amber-950/70 border-amber-500/50 text-amber-300'
            }`}
          >
            <span>{notificationMsg.text}</span>
            <button
              onClick={() => setNotificationMsg(null)}
              className="text-slate-400 hover:text-white cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Scrollable Content Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar">
          {/* TAB 1: OBJECTIVES */}
          {activeTab === 'OBJECTIVES' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-cyber font-bold text-sm text-slate-200 uppercase tracking-wider">
                    TODAY'S OPERATIONAL DIRECTIVES
                  </h3>
                  <p className="text-xs text-slate-400 font-sans mt-0.5">
                    Three random combat assignments updated daily at 00:00. Complete to receive Cyber Credits and unlock Exclusive Special Ops Badges.
                  </p>
                </div>

                <div className="text-xs font-cyber text-slate-400 hidden sm:block">
                  Auto-synced with active combat engine
                </div>
              </div>

              {/* Mission Cards Grid */}
              <div className="grid grid-cols-1 gap-3.5">
                {missions.map((mission, index) => {
                  const percent = Math.min(100, Math.round((mission.currentProgress / mission.targetCount) * 100));
                  const tiedBadge = EXCLUSIVE_BADGES.find((b) => b.id === mission.exclusiveBadgeId);

                  return (
                    <div
                      key={mission.id}
                      className={`relative p-4 sm:p-5 rounded-xl border transition-all duration-200 bg-gradient-to-r ${
                        mission.isClaimed
                          ? 'border-emerald-500/40 from-emerald-950/20 via-slate-900 to-slate-950 opacity-90'
                          : mission.isCompleted
                          ? 'border-amber-400 from-amber-950/30 via-slate-900 to-slate-950 shadow-[0_0_25px_rgba(251,191,36,0.2)]'
                          : 'border-slate-800 from-slate-950 via-slate-900 to-slate-950 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        {/* Icon & Details */}
                        <div className="flex items-start gap-4 flex-1 min-w-0">
                          {/* Objective Icon Box */}
                          <div
                            className={`w-14 h-14 rounded-xl border-2 flex items-center justify-center shrink-0 text-2xl ${
                              mission.isClaimed
                                ? 'border-emerald-400 bg-emerald-950/50 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                                : mission.isCompleted
                                ? 'border-amber-400 bg-amber-950/50 shadow-[0_0_15px_rgba(251,191,36,0.3)]'
                                : 'border-slate-700 bg-slate-950'
                            }`}
                          >
                            <span>{mission.icon}</span>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-cyber text-[10px] text-slate-400 tracking-wider">
                                DIRECTIVE #{index + 1}
                              </span>
                              <span className="text-slate-600">•</span>
                              <h4 className="font-cyber font-bold text-base text-white tracking-wide">
                                {mission.title}
                              </h4>

                              {/* Badge Tag Preview */}
                              {tiedBadge && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-purple-500/50 bg-purple-950/40 text-purple-300 text-[10px] font-cyber font-bold tracking-wider">
                                  <span>{tiedBadge.symbol}</span>
                                  <span>{tiedBadge.title}</span>
                                </span>
                              )}
                            </div>

                            <p className="text-xs text-slate-300/90 font-sans mt-1 leading-relaxed">
                              {mission.description}
                            </p>

                            {/* Progress Bar */}
                            <div className="mt-3">
                              <div className="flex justify-between items-center text-[10px] font-cyber mb-1">
                                <span
                                  className={
                                    mission.isCompleted ? 'text-amber-300 font-bold' : 'text-slate-400'
                                  }
                                >
                                  {mission.isCompleted ? 'OBJECTIVE COMPLETE!' : 'PROGRESS IN COMBAT'}
                                </span>
                                <span className="tabular-nums text-slate-300 font-medium">
                                  {mission.currentProgress.toLocaleString()} / {mission.targetCount.toLocaleString()}{' '}
                                  {mission.unit.toUpperCase()} ({percent}%)
                                </span>
                              </div>

                              <div className="w-full h-2 bg-slate-950 rounded-full border border-slate-800 overflow-hidden">
                                <div
                                  className={`h-full transition-all duration-300 rounded-full ${
                                    mission.isClaimed
                                      ? 'bg-gradient-to-r from-emerald-500 to-cyan-400'
                                      : mission.isCompleted
                                      ? 'bg-gradient-to-r from-amber-400 via-pink-500 to-cyan-400'
                                      : 'bg-gradient-to-r from-cyan-600 to-slate-500'
                                  }`}
                                  style={{ width: `${percent}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Reward & Claim Action Button */}
                        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center w-full sm:w-auto gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                          {/* Reward Tag */}
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-black/60 border border-amber-500/40 text-amber-300 font-cyber font-bold text-xs">
                            <span>💎</span>
                            <span>+{mission.rewardCurrency} CREDITS</span>
                          </div>

                          {/* Claim / Status Button */}
                          {mission.isClaimed ? (
                            <div className="px-4 py-2 rounded border border-emerald-500/50 bg-emerald-950/40 text-emerald-400 font-cyber font-bold text-xs tracking-wider flex items-center gap-1.5 shadow-[0_0_12px_rgba(16,185,129,0.2)]">
                              <span>✓</span>
                              <span>REWARD CLAIMED</span>
                            </div>
                          ) : mission.isCompleted ? (
                            <button
                              onClick={() => handleClaimMission(mission.id)}
                              className="px-4 py-2 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-cyber font-black text-xs tracking-wider transition cursor-pointer shadow-[0_0_20px_rgba(251,191,36,0.5)] active:scale-95 animate-pulse"
                            >
                              CLAIM REWARD
                            </button>
                          ) : (
                            <div className="px-3.5 py-1.5 rounded border border-slate-800 bg-slate-950 text-slate-400 font-cyber text-xs tracking-wider">
                              IN PROGRESS
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* TRI-VECTOR PROTOCOL ALL-CLEAR BONUS CARD */}
              <div
                className={`relative p-5 rounded-xl border transition-all duration-300 bg-gradient-to-r ${
                  allClearClaimed
                    ? 'border-emerald-500/50 from-emerald-950/30 via-slate-900 to-slate-950'
                    : allCompleted
                    ? 'border-amber-400 from-amber-950/40 via-purple-950/30 to-slate-950 shadow-[0_0_35px_rgba(251,191,36,0.3)]'
                    : 'border-slate-800 from-slate-950 to-slate-900 opacity-80'
                }`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-14 h-14 rounded-xl border-2 flex items-center justify-center shrink-0 text-3xl ${
                        allClearClaimed
                          ? 'border-emerald-400 bg-emerald-950/60 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                          : allCompleted
                          ? 'border-amber-400 bg-amber-950/60 shadow-[0_0_20px_rgba(251,191,36,0.5)] animate-bounce'
                          : 'border-slate-700 bg-slate-950'
                      }`}
                    >
                      <span>🔱</span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-cyber font-black text-sm text-amber-300 uppercase tracking-wider">
                          TRI-VECTOR PROTOCOL ALL-CLEAR BONUS
                        </span>
                        <span className="px-2 py-0.5 rounded font-cyber text-[9px] font-bold uppercase border border-amber-400 bg-amber-950 text-amber-300">
                          VANGUARD TIER
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 font-sans mt-0.5">
                        Complete all 3 daily missions in a single deployment to receive{' '}
                        <strong className="text-amber-300">+500 Cyber Credits</strong> and the exclusive{' '}
                        <strong className="text-amber-300">Tri-Vector Protocol Badge</strong>.
                      </p>
                      <div className="text-[11px] font-cyber text-slate-400 mt-1">
                        STATUS: {completedCount} / 3 DIRECTIVES COMPLETED
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 w-full sm:w-auto flex sm:flex-col items-center sm:items-end justify-between gap-2">
                    {allClearClaimed ? (
                      <div className="px-4 py-2 rounded border border-emerald-500/50 bg-emerald-950/50 text-emerald-400 font-cyber font-bold text-xs tracking-wider flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.25)]">
                        <span>✓</span>
                        <span>ALL-CLEAR CLAIMED</span>
                      </div>
                    ) : allCompleted ? (
                      <button
                        onClick={handleClaimAllClear}
                        className="w-full sm:w-auto px-5 py-2.5 rounded bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-cyber font-black text-xs tracking-wider transition cursor-pointer shadow-[0_0_25px_rgba(251,191,36,0.6)] active:scale-95"
                      >
                        CLAIM +500 💎 & BADGE
                      </button>
                    ) : (
                      <div className="text-xs font-cyber text-slate-500 border border-slate-800 px-3 py-1.5 rounded bg-slate-950">
                        {3 - completedCount} MISSIONS REMAINING
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: EXCLUSIVE BADGES */}
          {activeTab === 'BADGES' && (
            <div className="space-y-4">
              <div>
                <h3 className="font-cyber font-bold text-sm text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <span>👑</span>
                  <span>EXCLUSIVE SPECIAL OPS & DAILY BADGES</span>
                </h3>
                <p className="text-xs text-slate-400 font-sans mt-0.5">
                  Prestige emblems earned exclusively through Daily Combat Missions and the Tri-Vector Protocol.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {EXCLUSIVE_BADGES.map((badge) => {
                  const isUnlocked = unlockedBadgeIds.includes(badge.id);

                  return (
                    <div
                      key={badge.id}
                      className={`relative p-4 rounded-xl border transition-all duration-200 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 ${
                        isUnlocked
                          ? 'border-amber-400/80 shadow-[0_0_20px_rgba(251,191,36,0.2)]'
                          : 'border-slate-800 opacity-60 hover:opacity-80'
                      }`}
                    >
                      <div className="flex items-start gap-3.5">
                        {/* Badge Emblem */}
                        <div
                          className={`w-14 h-14 rounded-xl border-2 flex items-center justify-center shrink-0 bg-slate-950 text-2xl shadow-inner ${
                            isUnlocked
                              ? 'border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.4)]'
                              : 'border-slate-700 grayscale'
                          }`}
                        >
                          <span>{badge.symbol}</span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h4
                              className={`font-cyber font-bold text-sm tracking-wide truncate ${
                                isUnlocked ? 'text-white' : 'text-slate-400'
                              }`}
                            >
                              {badge.title}
                            </h4>

                            <span
                              className={`text-[9px] font-cyber font-black uppercase px-1.5 py-0.5 rounded border bg-black/60 ${
                                badge.rarity === 'VANGUARD'
                                  ? 'border-amber-400 text-amber-300'
                                  : badge.rarity === 'SPECIAL_OPS'
                                  ? 'border-cyan-400 text-cyan-300'
                                  : 'border-purple-400 text-purple-300'
                              }`}
                            >
                              {badge.rarity.replace('_', ' ')}
                            </span>
                          </div>

                          <p className="text-xs text-slate-300/80 font-sans mt-0.5 leading-relaxed">
                            {badge.description}
                          </p>

                          <div className="mt-2.5 flex items-center justify-between text-[10px] font-cyber">
                            <span
                              className={
                                isUnlocked
                                  ? 'text-emerald-400 font-bold flex items-center gap-1'
                                  : 'text-slate-500'
                              }
                            >
                              {isUnlocked ? 'UNLOCKED & EARNED ✓' : 'LOCKED — COMPLETE DAILY DIRECTIVE'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: REQUISITION ARMORY */}
          {activeTab === 'ARMORY' && (
            <div className="space-y-4">
              <div>
                <h3 className="font-cyber font-bold text-sm text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <span>🛒</span>
                  <span>OPERATIVE REQUISITIONS & COMBAT PERKS</span>
                </h3>
                <p className="text-xs text-slate-400 font-sans mt-0.5">
                  Exchange your earned Cyber Credits for custom Twin Saber plasma crystals and combat enhancements.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {armoryItems.map((item) => {
                  const canAfford = credits >= item.cost;

                  return (
                    <div
                      key={item.id}
                      className={`p-4 rounded-xl border transition-all duration-200 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 ${
                        item.isUnlocked
                          ? 'border-emerald-500/60 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                          : 'border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start gap-3.5">
                        <div
                          className="w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 bg-slate-950 text-2xl"
                          style={{ borderColor: item.color }}
                        >
                          <span>{item.icon}</span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="font-cyber font-bold text-sm text-white tracking-wide truncate">
                              {item.name}
                            </h4>

                            <span className="text-[10px] font-cyber px-1.5 py-0.5 rounded border border-slate-700 bg-black/60 text-slate-300">
                              {item.category === 'BLADE_CRYSTAL' ? 'COSMETIC' : 'COMBAT PERK'}
                            </span>
                          </div>

                          <p className="text-xs text-slate-300/80 font-sans mt-1">
                            {item.description}
                          </p>

                          <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-800">
                            <span className="font-cyber font-bold text-xs text-cyan-300 flex items-center gap-1">
                              <span>💎</span>
                              <span>{item.cost} CREDITS</span>
                            </span>

                            {item.isUnlocked ? (
                              <span className="px-3 py-1 rounded border border-emerald-500/40 bg-emerald-950/40 text-emerald-400 font-cyber font-bold text-xs flex items-center gap-1">
                                <span>✓</span>
                                <span>UNLOCKED & EQUIPPED</span>
                              </span>
                            ) : (
                              <button
                                onClick={() => handlePurchaseArmory(item.id)}
                                disabled={!canAfford}
                                className={`px-3 py-1 rounded font-cyber font-bold text-xs tracking-wider transition cursor-pointer ${
                                  canAfford
                                    ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_12px_rgba(0,243,255,0.3)] active:scale-95'
                                    : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                                }`}
                              >
                                {canAfford ? 'AUTHORIZE PURCHASE' : 'INSUFFICIENT CREDITS'}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Bar */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-400 font-sans hidden sm:block">
            Missions refresh automatically every 24 hours at 00:00. Press [M] or [ESC] to return.
          </div>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400 text-amber-300 font-cyber font-bold text-xs tracking-wider rounded transition cursor-pointer shadow-[0_0_15px_rgba(245,158,11,0.2)]"
          >
            CONFIRM & RETURN [ESC]
          </button>
        </div>
      </div>
    </div>
  );
};
