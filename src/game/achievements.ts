import { sound } from './audio';
import { PlayerStats } from './types';

export type AchievementTier = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
export type AchievementCategory = 'COMBAT' | 'DEFENSE' | 'PRECISION' | 'MASTERY';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  tier: AchievementTier;
  category: AchievementCategory;
  badgeSymbol: string;
  badgeColor: string;
  targetCount: number;
  xpReward: number;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_drone',
    title: 'First Spark',
    description: 'Destroy your first rogue combat drone.',
    tier: 'BRONZE',
    category: 'COMBAT',
    badgeSymbol: '⚡',
    badgeColor: '#cd7f32',
    targetCount: 1,
    xpReward: 100,
  },
  {
    id: 'drone_hunter_25',
    title: 'Airspace Sweeper',
    description: 'Destroy 25 rogue cyber drones.',
    tier: 'SILVER',
    category: 'COMBAT',
    badgeSymbol: '⚔️',
    badgeColor: '#94a3b8',
    targetCount: 25,
    xpReward: 350,
  },
  {
    id: 'drone_century_100',
    title: '100th Drone Destroyed',
    description: 'Purge 100 combat drones from the matrix grid.',
    tier: 'GOLD',
    category: 'COMBAT',
    badgeSymbol: '👑',
    badgeColor: '#fbbf24',
    targetCount: 100,
    xpReward: 1000,
  },
  {
    id: 'perfect_wave',
    title: 'Perfect Wave Clearance',
    description: 'Complete an entire combat wave without taking any vitality damage.',
    tier: 'PLATINUM',
    category: 'MASTERY',
    badgeSymbol: '🛡️',
    badgeColor: '#38bdf8',
    targetCount: 1,
    xpReward: 1500,
  },
  {
    id: 'deflect_10',
    title: 'Kinetic Rebound',
    description: 'Deflect 10 enemy plasma bolts back with your blade or shield.',
    tier: 'BRONZE',
    category: 'DEFENSE',
    badgeSymbol: '↩️',
    badgeColor: '#cd7f32',
    targetCount: 10,
    xpReward: 200,
  },
  {
    id: 'deflect_master_50',
    title: 'Reflective Maestro',
    description: 'Parry and deflect 50 enemy projectiles in combat.',
    tier: 'GOLD',
    category: 'DEFENSE',
    badgeSymbol: '✨',
    badgeColor: '#fbbf24',
    targetCount: 50,
    xpReward: 800,
  },
  {
    id: 'shard_ninja_30',
    title: 'Rhythm Slicer',
    description: 'Slice 30 flying rhythm data shards.',
    tier: 'SILVER',
    category: 'PRECISION',
    badgeSymbol: '💎',
    badgeColor: '#94a3b8',
    targetCount: 30,
    xpReward: 400,
  },
  {
    id: 'combo_streak_20',
    title: 'Cyber S-Rank',
    description: 'Reach a continuous 20x combo multiplier streak.',
    tier: 'GOLD',
    category: 'PRECISION',
    badgeSymbol: '🔥',
    badgeColor: '#ff0055',
    targetCount: 20,
    xpReward: 750,
  },
  {
    id: 'boss_slayer',
    title: 'Sentinel Down',
    description: 'Eliminate the colossal rotating Chrono Sentinel Boss.',
    tier: 'PLATINUM',
    category: 'COMBAT',
    badgeSymbol: '💀',
    badgeColor: '#38bdf8',
    targetCount: 1,
    xpReward: 2000,
  },
  {
    id: 'overdrive_warp',
    title: 'Chrono Dilator',
    description: 'Activate Slow-Mo Chrono Overdrive in combat.',
    tier: 'BRONZE',
    category: 'MASTERY',
    badgeSymbol: '⏳',
    badgeColor: '#cd7f32',
    targetCount: 1,
    xpReward: 150,
  },
  {
    id: 'vr_immersion',
    title: 'Neural VR Immersion',
    description: 'Enter and engage combat in WebXR Virtual Reality.',
    tier: 'SILVER',
    category: 'MASTERY',
    badgeSymbol: '🥽',
    badgeColor: '#94a3b8',
    targetCount: 1,
    xpReward: 500,
  },
  {
    id: 'beach_liberator',
    title: 'Oasis Liberator',
    description: 'Conquer all 5 waves of the Cyber Beach Arena.',
    tier: 'PLATINUM',
    category: 'MASTERY',
    badgeSymbol: '🏖️',
    badgeColor: '#a855f7',
    targetCount: 5,
    xpReward: 2500,
  },
];

export interface CumulativeStats {
  totalKills: number;
  totalDeflections: number;
  totalShards: number;
  maxCombo: number;
  maxWave: number;
  maxScore: number;
  overdriveCount: number;
  perfectWavesCount: number;
  perfectWaveDone: boolean;
  bossSlain: boolean;
  vrUsed: boolean;
}

export interface PlayerRankInfo {
  level: number;
  title: string;
  totalXp: number;
  currentLevelFloorXp: number;
  nextLevelXp: number;
  progressPercent: number;
}

const STORAGE_KEY = 'cyberstrike_achievements_v2';
const STATS_KEY = 'cyberstrike_cum_stats_v2';

export class AchievementTracker {
  private unlockedIds: Set<string> = new Set();
  private cumulativeStats: CumulativeStats = {
    totalKills: 0,
    totalDeflections: 0,
    totalShards: 0,
    maxCombo: 0,
    maxWave: 1,
    maxScore: 0,
    overdriveCount: 0,
    perfectWavesCount: 0,
    perfectWaveDone: false,
    bossSlain: false,
    vrUsed: false,
  };

  // Wave health monitoring for 'Perfect Wave Clearance'
  private waveStartHealth = 100;
  private currentWaveNum = 1;

  public onAchievementUnlocked?: (achievement: Achievement) => void;

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('cyberstrike_achievements_v1');
      if (saved) {
        const arr = JSON.parse(saved);
        if (Array.isArray(arr)) {
          this.unlockedIds = new Set(arr);
        }
      }
      const savedStats = localStorage.getItem(STATS_KEY) || localStorage.getItem('cyberstrike_cum_stats_v1');
      if (savedStats) {
        this.cumulativeStats = { ...this.cumulativeStats, ...JSON.parse(savedStats) };
      }
    } catch {
      // Storage unavailable
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(this.unlockedIds)));
      localStorage.setItem(STATS_KEY, JSON.stringify(this.cumulativeStats));
    } catch {
      // Storage unavailable
    }
  }

  public syncFromCloud(unlocked: string[], cloudStats?: Partial<CumulativeStats>) {
    let changed = false;
    if (Array.isArray(unlocked)) {
      unlocked.forEach((id) => {
        if (!this.unlockedIds.has(id)) {
          this.unlockedIds.add(id);
          changed = true;
        }
      });
    }
    if (cloudStats) {
      this.cumulativeStats.totalKills = Math.max(this.cumulativeStats.totalKills, cloudStats.totalKills || 0);
      this.cumulativeStats.totalDeflections = Math.max(this.cumulativeStats.totalDeflections, cloudStats.totalDeflections || 0);
      this.cumulativeStats.totalShards = Math.max(this.cumulativeStats.totalShards, cloudStats.totalShards || 0);
      this.cumulativeStats.maxCombo = Math.max(this.cumulativeStats.maxCombo, cloudStats.maxCombo || 0);
      this.cumulativeStats.maxScore = Math.max(this.cumulativeStats.maxScore, cloudStats.maxScore || 0);
      this.cumulativeStats.maxWave = Math.max(this.cumulativeStats.maxWave, cloudStats.maxWave || 1);
      changed = true;
    }
    if (changed) {
      this.saveToStorage();
    }
  }

  public getUnlockedIds(): string[] {
    return Array.from(this.unlockedIds);
  }

  public isUnlocked(id: string): boolean {
    return this.unlockedIds.has(id);
  }

  public getCumulativeStats(): CumulativeStats {
    return { ...this.cumulativeStats };
  }

  public getTotalXP(): number {
    return ACHIEVEMENTS.reduce((sum, ach) => {
      return this.unlockedIds.has(ach.id) ? sum + ach.xpReward : sum;
    }, 0);
  }

  public getPlayerRank(): PlayerRankInfo {
    const totalXp = this.getTotalXP();
    const thresholds = [
      { level: 1, title: 'NEURAL INITIATE', xp: 0 },
      { level: 2, title: 'CYBER OPERATIVE', xp: 400 },
      { level: 3, title: 'GRID DEFENDER', xp: 1000 },
      { level: 4, title: 'BLADE MASTER', xp: 2200 },
      { level: 5, title: 'SENTINEL SLAYER', xp: 4000 },
      { level: 6, title: 'CHRONO OVERLORD', xp: 6500 },
      { level: 7, title: 'APEX CYBER ARCHITECT', xp: 9500 },
    ];

    let current = thresholds[0];
    let next = thresholds[1];

    for (let i = thresholds.length - 1; i >= 0; i--) {
      if (totalXp >= thresholds[i].xp) {
        current = thresholds[i];
        next = thresholds[i + 1] || { level: current.level + 1, title: 'MAX ASCENDANT', xp: current.xp + 3000 };
        break;
      }
    }

    const span = next.xp - current.xp;
    const progress = Math.min(100, Math.max(0, Math.round(((totalXp - current.xp) / span) * 100)));

    return {
      level: current.level,
      title: current.title,
      totalXp,
      currentLevelFloorXp: current.xp,
      nextLevelXp: next.xp,
      progressPercent: progress,
    };
  }

  public getProgress(achievement: Achievement, currentSessionStats?: PlayerStats): {
    current: number;
    max: number;
    isUnlocked: boolean;
    percent: number;
  } {
    const isUnlocked = this.isUnlocked(achievement.id);
    let current = 0;
    const max = achievement.targetCount;

    const totalKills = Math.max(this.cumulativeStats.totalKills, currentSessionStats?.kills || 0);
    const totalDeflections = Math.max(this.cumulativeStats.totalDeflections, currentSessionStats?.deflections || 0);
    const totalShards = Math.max(this.cumulativeStats.totalShards, currentSessionStats?.shardsSliced || 0);
    const maxCombo = Math.max(this.cumulativeStats.maxCombo, currentSessionStats?.maxCombo || 0);

    switch (achievement.id) {
      case 'first_drone':
        current = totalKills >= 1 ? 1 : 0;
        break;
      case 'drone_hunter_25':
        current = Math.min(25, totalKills);
        break;
      case 'drone_century_100':
        current = Math.min(100, totalKills);
        break;
      case 'perfect_wave':
        current = this.cumulativeStats.perfectWaveDone ? 1 : 0;
        break;
      case 'deflect_10':
        current = Math.min(10, totalDeflections);
        break;
      case 'deflect_master_50':
        current = Math.min(50, totalDeflections);
        break;
      case 'shard_ninja_30':
        current = Math.min(30, totalShards);
        break;
      case 'combo_streak_20':
        current = Math.min(20, maxCombo);
        break;
      case 'boss_slayer':
        current = this.cumulativeStats.bossSlain ? 1 : 0;
        break;
      case 'overdrive_warp':
        current = this.cumulativeStats.overdriveCount >= 1 ? 1 : 0;
        break;
      case 'vr_immersion':
        current = (this.cumulativeStats.vrUsed || currentSessionStats?.isVrActive) ? 1 : 0;
        break;
      case 'beach_liberator':
        current = Math.min(5, Math.max(this.cumulativeStats.maxWave, currentSessionStats?.wave || 1));
        break;
      default:
        current = isUnlocked ? max : 0;
    }

    if (isUnlocked) current = max;

    return {
      current,
      max,
      isUnlocked,
      percent: Math.min(100, Math.round((current / max) * 100)),
    };
  }

  // Called whenever an enemy is eliminated in combat
  public onEnemyDestroyed(enemyType: string, sessionStats: PlayerStats) {
    this.cumulativeStats.totalKills++;
    this.saveToStorage();

    if (this.cumulativeStats.totalKills >= 1) this.unlock('first_drone');
    if (this.cumulativeStats.totalKills >= 25) this.unlock('drone_hunter_25');
    if (this.cumulativeStats.totalKills >= 100) this.unlock('drone_century_100');

    if (enemyType === 'SENTINEL_BOSS') {
      this.onBossKilled();
    }
  }

  // Called whenever a projectile is parried / deflected
  public onProjectileDeflected(sessionStats: PlayerStats) {
    this.cumulativeStats.totalDeflections++;
    this.saveToStorage();

    if (this.cumulativeStats.totalDeflections >= 10) this.unlock('deflect_10');
    if (this.cumulativeStats.totalDeflections >= 50) this.unlock('deflect_master_50');
  }

  // Called whenever a rhythm data shard is sliced
  public onShardSliced(sessionStats: PlayerStats) {
    this.cumulativeStats.totalShards++;
    this.saveToStorage();

    if (this.cumulativeStats.totalShards >= 30) this.unlock('shard_ninja_30');
  }

  // Called on wave start to record starting health
  public onWaveStart(waveNum: number, currentHealth: number) {
    this.currentWaveNum = waveNum;
    this.waveStartHealth = currentHealth;
  }

  // Called on wave clear: verifies if vitality remained 100% untouched
  public onWaveClear(waveNum: number, currentHealth: number) {
    this.cumulativeStats.maxWave = Math.max(this.cumulativeStats.maxWave, waveNum);

    // Perfect wave: completed wave without taking vitality damage
    if (currentHealth >= this.waveStartHealth) {
      this.cumulativeStats.perfectWaveDone = true;
      this.cumulativeStats.perfectWavesCount++;
      this.unlock('perfect_wave');
    }
    if (waveNum >= 5) {
      this.unlock('beach_liberator');
    }
    this.saveToStorage();
  }

  // Called when Sentinel Boss is destroyed
  public onBossKilled() {
    this.cumulativeStats.bossSlain = true;
    this.unlock('boss_slayer');
    this.saveToStorage();
  }

  // Called when Chrono Overdrive slow-mo is activated
  public onOverdriveTriggered() {
    this.cumulativeStats.overdriveCount++;
    this.unlock('overdrive_warp');
    this.saveToStorage();
  }

  // Called when WebXR VR session is activated
  public onVrEngaged() {
    this.cumulativeStats.vrUsed = true;
    this.unlock('vr_immersion');
    this.saveToStorage();
  }

  // General continuous stats sync
  public updateStats(stats: PlayerStats) {
    this.cumulativeStats.maxCombo = Math.max(this.cumulativeStats.maxCombo, stats.maxCombo);
    this.cumulativeStats.maxScore = Math.max(this.cumulativeStats.maxScore, stats.score);
    this.cumulativeStats.maxWave = Math.max(this.cumulativeStats.maxWave, stats.wave);

    if (stats.isVrActive) {
      this.onVrEngaged();
    }

    if (stats.combo >= 20) {
      this.unlock('combo_streak_20');
    }

    this.saveToStorage();
  }

  private unlock(id: string) {
    if (this.unlockedIds.has(id)) return;
    this.unlockedIds.add(id);
    this.saveToStorage();

    const ach = ACHIEVEMENTS.find((a) => a.id === id);
    if (ach) {
      sound.playAchievementUnlock();
      this.onAchievementUnlocked?.(ach);
    }
  }
}

export const achievementTracker = new AchievementTracker();
