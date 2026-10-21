/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { User } from 'firebase/auth';
import { AchievementToast } from './components/AchievementToast';
import { AdMobBanner } from './components/AdMobBanner';
import { AdMobConfigModal } from './components/AdMobConfigModal';
import { AdMobRewardedModal } from './components/AdMobRewardedModal';
import { ChampionSelector } from './components/ChampionSelector';
import { DailyMissionsModal } from './components/DailyMissionsModal';
import { DailyMissionToast } from './components/DailyMissionToast';
import { GameOverModal } from './components/GameOverModal';
import { HUD } from './components/HUD';
import { LeaderboardModal } from './components/LeaderboardModal';
import { PauseModal } from './components/PauseModal';
import { ProfileModal } from './components/ProfileModal';
import { ReticleCustomizer } from './components/ReticleCustomizer';
import { TitleScreen } from './components/TitleScreen';
import { Achievement, achievementTracker } from './game/achievements';
import { DailyMission, dailyMissionTracker } from './game/dailyMissions';
import { admobManager } from './game/admob';
import { sound } from './game/audio';
import { GameEngine } from './game/engine';
import {
  auth,
  fetchUserProfile,
  loginWithGoogle,
  logout,
  onAuthStateChanged,
  saveUserProfile,
} from './game/firebase';
import { ChampionId } from './game/proceduralModels';
import { GameState, PlayerStats, ReticleConfig } from './game/types';

export default function App() {
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<GameEngine | null>(null);

  const [gameState, setGameState] = useState<GameState>('TITLE');
  const [stats, setStats] = useState<PlayerStats>({
    health: 100,
    maxHealth: 100,
    shield: 100,
    maxShield: 100,
    score: 0,
    combo: 0,
    maxCombo: 0,
    comboTimer: 0,
    overdrive: 0,
    isOverdriveActive: 0,
    kills: 0,
    deflections: 0,
    shardsSliced: 0,
    wave: 1,
    isVrActive: false,
    vrSupported: false,
    isTargetingDrone: false,
    targetedEnemyType: null,
    targetedDistance: 10,
  });

  const [isMuted, setIsMuted] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [selectedChampion, setSelectedChampion] = useState<ChampionId>('ELENA');
  const [isReticleModalOpen, setIsReticleModalOpen] = useState(false);
  const [isChampionModalOpen, setIsChampionModalOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isDailyMissionsOpen, setIsDailyMissionsOpen] = useState(false);
  const [isAdMobModalOpen, setIsAdMobModalOpen] = useState(false);
  const [isRewardedAdOpen, setIsRewardedAdOpen] = useState(false);
  const [recentAchievement, setRecentAchievement] = useState<Achievement | null>(null);
  const [recentDailyMission, setRecentDailyMission] = useState<DailyMission | null>(null);

  const [reticleConfig, setReticleConfig] = useState<ReticleConfig>({
    style: 'CYBER_RING',
    idleColor: '#00f3ff',
    targetColor: '#ff0055',
    size: 1.0,
    showLaserPointer: true,
    showDistanceReadout: true,
  });

  // Achievement unlock notification listener & cloud sync
  useEffect(() => {
    achievementTracker.onAchievementUnlocked = (ach) => {
      setRecentAchievement(ach);
      // Auto-dismiss after 4.5 seconds
      setTimeout(() => {
        setRecentAchievement((current) => (current?.id === ach.id ? null : current));
      }, 4500);

      // Auto-sync unlocked achievement list to Firestore if logged in
      if (auth.currentUser) {
        saveUserProfile({
          unlockedAchievements: achievementTracker.getUnlockedIds(),
        }).catch(() => {});
      }
    };

    dailyMissionTracker.onMissionCompleted = (mission) => {
      setRecentDailyMission(mission);
      setTimeout(() => {
        setRecentDailyMission((current) => (current?.id === mission.id ? null : current));
      }, 4500);

      if (auth.currentUser) {
        const exportState = dailyMissionTracker.getExportState();
        saveUserProfile({
          credits: exportState.credits,
          unlockedExclusiveBadges: exportState.exclusiveBadges,
          dailyMissionsState: exportState.dailyState,
        }).catch(() => {});
      }
    };
  }, []);

  // Track Firebase Auth state & load user cloud save
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const profile = await fetchUserProfile(currentUser.uid);
          if (profile) {
            // Restore champion
            if (profile.selectedChampion && ['ELENA', 'MAYA', 'NYX'].includes(profile.selectedChampion)) {
              const champId = profile.selectedChampion as ChampionId;
              setSelectedChampion(champId);
              engineRef.current?.setSelectedChampion(champId);
            }
            // Restore reticle
            if (profile.reticleStyle) {
              const loadedReticle: Partial<ReticleConfig> = {
                style: profile.reticleStyle as ReticleConfig['style'],
                idleColor: profile.reticleIdleColor || '#00f3ff',
                targetColor: profile.reticleTargetColor || '#ff0055',
              };
              setReticleConfig((prev) => ({ ...prev, ...loadedReticle }));
              engineRef.current?.setReticleConfig(loadedReticle);
            }
            // Restore unlocked achievements & cumulative stats
            if (profile.unlockedAchievements) {
              achievementTracker.syncFromCloud(profile.unlockedAchievements, {
                totalKills: profile.totalKills,
                totalDeflections: profile.deflections,
                totalShards: profile.shardsSliced,
                maxCombo: profile.maxCombo,
                maxScore: profile.highScore,
              });
            }
            // Restore daily missions, credits, and exclusive badges
            if (profile.credits !== undefined || profile.unlockedExclusiveBadges || profile.dailyMissionsState) {
              dailyMissionTracker.syncFromCloud(
                profile.credits,
                profile.unlockedExclusiveBadges,
                profile.dailyMissionsState
              );
            }
            // Restore AdMob configuration
            if (profile.admobConfig) {
              admobManager.syncFromCloud(profile.admobConfig);
            }
          }
        } catch (e) {
          console.error('Error fetching user profile:', e);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!canvasContainerRef.current) return;

    // Initialize Game Engine once
    const engine = new GameEngine(canvasContainerRef.current);
    engineRef.current = engine;

    engine.onStatsUpdate = (newStats) => {
      setStats(newStats);
    };

    engine.onStateChange = (newState) => {
      setGameState(newState);
    };

    // Global Key Listener for Quick Reticle Toggle (R), Champion Selector (C), Profile & Badges (P), Daily Missions (M)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyR' && !e.repeat) {
        setIsReticleModalOpen((prev) => !prev);
      } else if (e.code === 'KeyC' && !e.repeat) {
        setIsChampionModalOpen((prev) => !prev);
      } else if (e.code === 'KeyP' && !e.repeat) {
        setIsProfileOpen((prev) => !prev);
      } else if (e.code === 'KeyM' && !e.repeat) {
        setIsDailyMissionsOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      engine.dispose();
      engineRef.current = null;
    };
  }, []);

  const handleUpdateReticleConfig = (newCfg: Partial<ReticleConfig>) => {
    setReticleConfig((prev) => {
      const updated = { ...prev, ...newCfg };
      engineRef.current?.setReticleConfig(updated);
      if (user) {
        saveUserProfile({
          reticleStyle: updated.style,
          reticleIdleColor: updated.idleColor,
          reticleTargetColor: updated.targetColor,
        }).catch(() => {});
      }
      return updated;
    });
  };

  const handleSelectChampion = (id: ChampionId) => {
    setSelectedChampion(id);
    engineRef.current?.setSelectedChampion(id);
    if (user) {
      saveUserProfile({ selectedChampion: id }).catch(() => {});
    }
  };

  const handleLogin = async () => {
    const loggedUser = await loginWithGoogle();
    if (loggedUser) {
      const exportState = dailyMissionTracker.getExportState();
      await saveUserProfile({
        displayName: loggedUser.displayName || 'Cyber Operative',
        unlockedAchievements: achievementTracker.getUnlockedIds(),
        credits: exportState.credits,
        unlockedExclusiveBadges: exportState.exclusiveBadges,
        dailyMissionsState: exportState.dailyState,
        admobConfig: admobManager.serializeForCloud(),
      });
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  const handleDailyMissionClaimSync = () => {
    if (auth.currentUser) {
      const exportState = dailyMissionTracker.getExportState();
      saveUserProfile({
        credits: exportState.credits,
        unlockedExclusiveBadges: exportState.exclusiveBadges,
        dailyMissionsState: exportState.dailyState,
        admobConfig: admobManager.serializeForCloud(),
      }).catch(() => {});
    }
  };

  const handleSaveAdMobToCloud = (admobConfigStr: string) => {
    if (auth.currentUser) {
      saveUserProfile({ admobConfig: admobConfigStr }).catch(() => {});
    }
  };

  const handleRewardClaimed = (earnedCredits = 350) => {
    dailyMissionTracker.addCredits(earnedCredits);
    // Shield recovery & combat perk if in game
    if (engineRef.current && (gameState === 'PLAYING' || gameState === 'PAUSED')) {
      engineRef.current.stats.shield = engineRef.current.stats.maxShield;
      engineRef.current.stats.health = Math.min(
        engineRef.current.stats.maxHealth,
        engineRef.current.stats.health + 25
      );
    }
    handleDailyMissionClaimSync();
  };

  const handleStartGame = () => {
    sound.unlock();
    engineRef.current?.startGame();
    setGameState('PLAYING');
  };

  const handleEnterVR = () => {
    sound.unlock();
    engineRef.current?.enterVR();
  };

  const handlePause = () => {
    engineRef.current?.pauseGame();
    setGameState('PAUSED');
  };

  const handleResume = () => {
    engineRef.current?.resumeGame();
    setGameState('PLAYING');
  };

  const handleRestart = () => {
    engineRef.current?.restartGame();
    setGameState('PLAYING');
  };

  const handleQuitToTitle = () => {
    if (engineRef.current) {
      engineRef.current.state = 'TITLE';
    }
    sound.stopMusic();
    setGameState('TITLE');
  };

  const handleToggleMute = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  const handleTriggerOverdrive = () => {
    engineRef.current?.triggerOverdrive();
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-slate-950 font-sans select-none">
      {/* Isolated WebGL Canvas Container: never re-rendered by React state */}
      <div ref={canvasContainerRef} className="absolute inset-0 z-0 w-full h-full cursor-crosshair" />

      {/* Atmospheric subtle scanlines layer */}
      <div className="absolute inset-0 z-5 scanlines pointer-events-none opacity-40" />

      {/* Achievement Unlocked Toast Notification */}
      <AchievementToast
        achievement={recentAchievement}
        onDismiss={() => setRecentAchievement(null)}
        onOpenProfile={() => setIsProfileOpen(true)}
      />

      {/* Daily Mission Completed Toast Notification */}
      <DailyMissionToast
        mission={recentDailyMission}
        onDismiss={() => setRecentDailyMission(null)}
        onOpenMissions={() => setIsDailyMissionsOpen(true)}
      />

      {/* Game Shell States */}
      {gameState === 'TITLE' && (
        <TitleScreen
          engine={engineRef.current}
          vrSupported={stats.vrSupported}
          user={user}
          selectedChampion={selectedChampion}
          onStart={handleStartGame}
          onEnterVR={handleEnterVR}
          onOpenReticleConfig={() => setIsReticleModalOpen(true)}
          onOpenChampionSelector={() => setIsChampionModalOpen(true)}
          onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
          onOpenProfile={() => setIsProfileOpen(true)}
          onOpenDailyMissions={() => setIsDailyMissionsOpen(true)}
          onOpenAdMobConfig={() => setIsAdMobModalOpen(true)}
          onOpenRewardedAd={() => setIsRewardedAdOpen(true)}
          onLogin={handleLogin}
          onLogout={handleLogout}
        />
      )}

      {gameState === 'PLAYING' && (
        <HUD
          stats={stats}
          reticleConfig={reticleConfig}
          user={user}
          selectedChampion={selectedChampion}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          onPause={handlePause}
          onTriggerOverdrive={handleTriggerOverdrive}
          onOpenReticleConfig={() => setIsReticleModalOpen(true)}
          onOpenChampionSelector={() => setIsChampionModalOpen(true)}
          onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
          onOpenProfile={() => setIsProfileOpen(true)}
          onOpenDailyMissions={() => setIsDailyMissionsOpen(true)}
          onOpenAdMobConfig={() => setIsAdMobModalOpen(true)}
          onLogin={handleLogin}
          onLogout={handleLogout}
        />
      )}

      {gameState === 'PAUSED' && (
        <PauseModal
          onResume={handleResume}
          onRestart={handleRestart}
          onQuitToTitle={handleQuitToTitle}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          onOpenReticleConfig={() => setIsReticleModalOpen(true)}
          onOpenProfile={() => setIsProfileOpen(true)}
          onOpenDailyMissions={() => setIsDailyMissionsOpen(true)}
          onOpenAdMobConfig={() => setIsAdMobModalOpen(true)}
          onOpenRewardedAd={() => setIsRewardedAdOpen(true)}
        />
      )}

      {(gameState === 'GAMEOVER' || gameState === 'VICTORY') && (
        <GameOverModal
          isVictory={gameState === 'VICTORY'}
          stats={stats}
          user={user}
          selectedChampion={selectedChampion}
          onRestart={handleRestart}
          onQuitToTitle={handleQuitToTitle}
          onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
          onOpenProfile={() => setIsProfileOpen(true)}
          onOpenDailyMissions={() => setIsDailyMissionsOpen(true)}
          onOpenAdMobConfig={() => setIsAdMobModalOpen(true)}
          onOpenRewardedAd={() => setIsRewardedAdOpen(true)}
        />
      )}

      {/* In-Game Non-Intrusive AdMob Banner Ad */}
      <AdMobBanner onOpenSettings={() => setIsAdMobModalOpen(true)} />

      {/* Modals */}
      {isReticleModalOpen && (
        <ReticleCustomizer
          config={reticleConfig}
          onChange={handleUpdateReticleConfig}
          onClose={() => setIsReticleModalOpen(false)}
        />
      )}

      {isChampionModalOpen && (
        <ChampionSelector
          selectedId={selectedChampion}
          onSelect={handleSelectChampion}
          onClose={() => setIsChampionModalOpen(false)}
        />
      )}

      {isLeaderboardOpen && (
        <LeaderboardModal onClose={() => setIsLeaderboardOpen(false)} />
      )}

      {isProfileOpen && (
        <ProfileModal
          user={user}
          stats={stats}
          selectedChampion={selectedChampion}
          onClose={() => setIsProfileOpen(false)}
          onOpenAdMobConfig={() => setIsAdMobModalOpen(true)}
          onLogin={handleLogin}
          onLogout={handleLogout}
        />
      )}

      {isDailyMissionsOpen && (
        <DailyMissionsModal
          user={user}
          onClose={() => setIsDailyMissionsOpen(false)}
          onClaimSync={handleDailyMissionClaimSync}
        />
      )}

      {/* Google AdMob Account & Configuration Modal */}
      {isAdMobModalOpen && (
        <AdMobConfigModal
          onClose={() => setIsAdMobModalOpen(false)}
          onTestRewarded={() => setIsRewardedAdOpen(true)}
          onSaveToCloud={handleSaveAdMobToCloud}
        />
      )}

      {/* Google AdMob Rewarded Video Player Modal */}
      {isRewardedAdOpen && (
        <AdMobRewardedModal
          onRewardClaimed={handleRewardClaimed}
          onClose={() => setIsRewardedAdOpen(false)}
        />
      )}
    </div>
  );
}
