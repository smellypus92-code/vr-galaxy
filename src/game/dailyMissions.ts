import { sound } from './audio';
import { PlayerStats } from './types';

export type DailyObjectiveType =
  | 'SHARDS_SLICED'
  | 'PROJECTILES_DEFLECTED'
  | 'DRONES_DESTROYED'
  | 'COMBO_STREAK'
  | 'OVERDRIVE_TRIGGERED'
  | 'WAVES_CLEARED'
  | 'SCORE_TARGET'
  | 'ELITE_KILLS'
  | 'PERFECT_WAVE';

export interface DailyMissionTemplate {
  id: string;
  type: DailyObjectiveType;
  title: string;
  description: string;
  targetCount: number;
  unit: string;
  icon: string;
  rewardCurrency: number; // Cyber Credits granted
  exclusiveBadgeId?: string; // Exclusive badge earned when claimed
}

export interface DailyMission extends DailyMissionTemplate {
  currentProgress: number;
  isCompleted: boolean;
  isClaimed: boolean;
}

export type ExclusiveBadgeRarity = 'EXCLUSIVE' | 'SPECIAL_OPS' | 'VANGUARD';

export interface ExclusiveBadge {
  id: string;
  title: string;
  description: string;
  symbol: string;
  color: string;
  glowColor: string;
  rarity: ExclusiveBadgeRarity;
  unlockedAt?: string;
}

export interface ArmoryItem {
  id: string;
  name: string;
  description: string;
  category: 'BLADE_CRYSTAL' | 'COMBAT_PERK';
  cost: number;
  icon: string;
  color: string;
  bladeHex?: number;
  perkEffect?: string;
  isUnlocked: boolean;
}

// Master pool of available daily mission objectives
export const MISSION_TEMPLATES_POOL: DailyMissionTemplate[] = [
  {
    id: 'slice_shards_20',
    type: 'SHARDS_SLICED',
    title: 'Shard Cleaver',
    description: 'Slice 20 flying rhythm data shards with twin sabers.',
    targetCount: 20,
    unit: 'shards',
    icon: '💎',
    rewardCurrency: 250,
    exclusiveBadgeId: 'badge_shard_cleaver',
  },
  {
    id: 'deflect_plasma_10',
    type: 'PROJECTILES_DEFLECTED',
    title: 'Kinetic Deflector',
    description: 'Deflect 10 enemy plasma bolts back with blade or shield.',
    targetCount: 10,
    unit: 'bolts',
    icon: '↩️',
    rewardCurrency: 250,
    exclusiveBadgeId: 'badge_kinetic_deflector',
  },
  {
    id: 'destroy_drones_30',
    type: 'DRONES_DESTROYED',
    title: 'Skynet Sweeper',
    description: 'Destroy 30 rogue aerial combat drones in the beach arena.',
    targetCount: 30,
    unit: 'drones',
    icon: '🎯',
    rewardCurrency: 300,
    exclusiveBadgeId: 'badge_aerial_sweeper',
  },
  {
    id: 'combo_streak_15',
    type: 'COMBO_STREAK',
    title: 'Harmonic Sync',
    description: 'Attain a continuous 15x combat combo multiplier.',
    targetCount: 15,
    unit: 'combo',
    icon: '🔥',
    rewardCurrency: 300,
    exclusiveBadgeId: 'badge_sync_master',
  },
  {
    id: 'trigger_overdrive_3',
    type: 'OVERDRIVE_TRIGGERED',
    title: 'Chrono Dilator',
    description: 'Trigger Slow-Mo Chrono Overdrive 3 times in combat.',
    targetCount: 3,
    unit: 'times',
    icon: '⏳',
    rewardCurrency: 250,
    exclusiveBadgeId: 'badge_chrono_flux',
  },
  {
    id: 'waves_cleared_3',
    type: 'WAVES_CLEARED',
    title: 'Wave Sentinel',
    description: 'Survive and clear 3 combat waves.',
    targetCount: 3,
    unit: 'waves',
    icon: '🌊',
    rewardCurrency: 350,
    exclusiveBadgeId: 'badge_sector_guard',
  },
  {
    id: 'score_target_25k',
    type: 'SCORE_TARGET',
    title: 'High Caliber Asset',
    description: 'Reach a combat score of 25,000 points.',
    targetCount: 25000,
    unit: 'pts',
    icon: '⚡',
    rewardCurrency: 400,
    exclusiveBadgeId: 'badge_high_value_asset',
  },
  {
    id: 'elite_kills_4',
    type: 'ELITE_KILLS',
    title: 'Titan Breaker',
    description: 'Eliminate 4 Elite Gunships or Sentinel Boss drones.',
    targetCount: 4,
    unit: 'elites',
    icon: '💀',
    rewardCurrency: 350,
    exclusiveBadgeId: 'badge_titan_hunter',
  },
  {
    id: 'perfect_wave_1',
    type: 'PERFECT_WAVE',
    title: 'Ghost Protocol',
    description: 'Complete 1 combat wave with zero vitality damage taken.',
    targetCount: 1,
    unit: 'wave',
    icon: '🛡️',
    rewardCurrency: 400,
    exclusiveBadgeId: 'badge_untouchable',
  },
  {
    id: 'slice_shards_35',
    type: 'SHARDS_SLICED',
    title: 'Prism Slasher',
    description: 'Slice 35 data shards with precision blade swings.',
    targetCount: 35,
    unit: 'shards',
    icon: '✨',
    rewardCurrency: 350,
    exclusiveBadgeId: 'badge_prism_slasher',
  },
  {
    id: 'deflect_plasma_20',
    type: 'PROJECTILES_DEFLECTED',
    title: 'Aegis Bastion',
    description: 'Parry and reflect 20 incoming plasma projectiles.',
    targetCount: 20,
    unit: 'bolts',
    icon: '🛡️',
    rewardCurrency: 350,
    exclusiveBadgeId: 'badge_aegis_wall',
  },
  {
    id: 'destroy_drones_45',
    type: 'DRONES_DESTROYED',
    title: 'Drone Annihilator',
    description: 'Purge 45 combat drones from the matrix perimeter.',
    targetCount: 45,
    unit: 'drones',
    icon: '💥',
    rewardCurrency: 450,
    exclusiveBadgeId: 'badge_drone_annihilator',
  },
];

// Exclusive badges granted only via Daily Mission performance
export const EXCLUSIVE_BADGES: ExclusiveBadge[] = [
  {
    id: 'badge_daily_vanguard',
    title: 'Tri-Vector Protocol',
    description: 'Awarded for completing all 3 daily missions in a single deployment.',
    symbol: '🔱',
    color: '#fbbf24',
    glowColor: 'rgba(251,191,36,0.5)',
    rarity: 'VANGUARD',
  },
  {
    id: 'badge_daily_operative',
    title: 'Daily Operative',
    description: 'Awarded for completing your first daily combat objective.',
    symbol: '⚡',
    color: '#00f3ff',
    glowColor: 'rgba(0,243,255,0.4)',
    rarity: 'EXCLUSIVE',
  },
  {
    id: 'badge_shard_cleaver',
    title: 'Harmonic Cleaver',
    description: 'Mastery badge for slicing data shards in daily mission protocol.',
    symbol: '💎',
    color: '#38bdf8',
    glowColor: 'rgba(56,189,248,0.4)',
    rarity: 'SPECIAL_OPS',
  },
  {
    id: 'badge_kinetic_deflector',
    title: 'Aegis Rebound',
    description: 'Deflected plasma barrage under daily combat parameters.',
    symbol: '↩️',
    color: '#f59e0b',
    glowColor: 'rgba(245,158,11,0.4)',
    rarity: 'SPECIAL_OPS',
  },
  {
    id: 'badge_aerial_sweeper',
    title: 'Skynet Reaper',
    description: 'Neutralized 30+ rogue drones in daily mission assignments.',
    symbol: '⚔️',
    color: '#f43f5e',
    glowColor: 'rgba(244,63,94,0.4)',
    rarity: 'SPECIAL_OPS',
  },
  {
    id: 'badge_sync_master',
    title: 'Hyper Resonance',
    description: 'Executed flawless 15x combo sequence during daily mission.',
    symbol: '🔥',
    color: '#ec4899',
    glowColor: 'rgba(236,72,153,0.4)',
    rarity: 'SPECIAL_OPS',
  },
  {
    id: 'badge_chrono_flux',
    title: 'Temporal Disruptor',
    description: 'Manipulated time dilation via Chrono Overdrive in daily mission.',
    symbol: '⏳',
    color: '#10b981',
    glowColor: 'rgba(16,185,129,0.4)',
    rarity: 'SPECIAL_OPS',
  },
  {
    id: 'badge_sector_guard',
    title: 'Sector Sentinel',
    description: 'Held the beach defense line across 3 full waves in daily combat.',
    symbol: '🌊',
    color: '#06b6d4',
    glowColor: 'rgba(6,182,212,0.4)',
    rarity: 'SPECIAL_OPS',
  },
  {
    id: 'badge_high_value_asset',
    title: 'High Value Asset',
    description: 'Exceeded 25,000 points in daily combat operations.',
    symbol: '👑',
    color: '#eab308',
    glowColor: 'rgba(234,179,8,0.5)',
    rarity: 'SPECIAL_OPS',
  },
  {
    id: 'badge_titan_hunter',
    title: 'Titan Hunter',
    description: 'Decimated heavily armored Elite Gunships and Sentinel Bosses.',
    symbol: '💀',
    color: '#a855f7',
    glowColor: 'rgba(168,85,247,0.4)',
    rarity: 'SPECIAL_OPS',
  },
  {
    id: 'badge_untouchable',
    title: 'Ghost Protocol',
    description: 'Achieved an untouchable zero-damage wave clear on daily duty.',
    symbol: '🛡️',
    color: '#38bdf8',
    glowColor: 'rgba(56,189,248,0.5)',
    rarity: 'EXCLUSIVE',
  },
  {
    id: 'badge_prism_slasher',
    title: 'Prism Virtuoso',
    description: 'Sliced 35+ rhythm data shards during a daily deployment.',
    symbol: '✨',
    color: '#c084fc',
    glowColor: 'rgba(192,132,252,0.4)',
    rarity: 'SPECIAL_OPS',
  },
  {
    id: 'badge_aegis_wall',
    title: 'Aegis Bastion',
    description: 'Deflected 20 plasma bolts in a single daily mission protocol.',
    symbol: '🛡️',
    color: '#e2e8f0',
    glowColor: 'rgba(226,232,240,0.4)',
    rarity: 'SPECIAL_OPS',
  },
  {
    id: 'badge_drone_annihilator',
    title: 'Drone Annihilator',
    description: 'Obliterated 45 rogue drones in daily matrix cleansing.',
    symbol: '💥',
    color: '#ef4444',
    glowColor: 'rgba(239,68,68,0.5)',
    rarity: 'VANGUARD',
  },
];

// Requisition Armory Items purchasable with in-game currency earned from Daily Missions
export const ARMORY_ITEMS: ArmoryItem[] = [
  {
    id: 'saber_plasma_crimson',
    name: 'Solar Crimson Saber Crystals',
    description: 'Refracts twin saber blades into searing red solar plasma.',
    category: 'BLADE_CRYSTAL',
    cost: 500,
    icon: '🔴',
    color: '#ff0055',
    bladeHex: 0xff0055,
    isUnlocked: false,
  },
  {
    id: 'saber_plasma_emerald',
    name: 'Emerald Matrix Saber Crystals',
    description: 'Infuses saber edges with radiant cybernetic green energy.',
    category: 'BLADE_CRYSTAL',
    cost: 500,
    icon: '🟢',
    color: '#10b981',
    bladeHex: 0x10b981,
    isUnlocked: false,
  },
  {
    id: 'saber_plasma_amethyst',
    name: 'Void Amethyst Saber Crystals',
    description: 'Harnesses dark violet hyper-plasma resonance.',
    category: 'BLADE_CRYSTAL',
    cost: 500,
    icon: '🟣',
    color: '#a855f7',
    bladeHex: 0xa855f7,
    isUnlocked: false,
  },
  {
    id: 'perk_nanite_shield',
    name: 'Nanite Shield Capacity (+25)',
    description: 'Permanently increases operative energy shield capacity to 125.',
    category: 'COMBAT_PERK',
    cost: 800,
    icon: '🛡️',
    color: '#00f3ff',
    perkEffect: 'SHIELD_BOOST',
    isUnlocked: false,
  },
  {
    id: 'perk_overdrive_extender',
    name: 'Chrono Core Duration (+2.0s)',
    description: 'Extends Slow-Mo Chrono Overdrive duration from 6.0s to 8.0s.',
    category: 'COMBAT_PERK',
    cost: 1000,
    icon: '⏳',
    color: '#fbbf24',
    perkEffect: 'OVERDRIVE_EXTEND',
    isUnlocked: false,
  },
];

const DAILY_STORAGE_KEY = 'cyberstrike_daily_missions_v3';
const CREDITS_STORAGE_KEY = 'cyberstrike_cyber_credits_v3';
const EXCLUSIVE_BADGES_KEY = 'cyberstrike_exclusive_badges_v3';
const ARMORY_STORAGE_KEY = 'cyberstrike_armory_purchases_v3';

interface DailyPersistedState {
  dateKey: string;
  missions: {
    id: string;
    currentProgress: number;
    isCompleted: boolean;
    isClaimed: boolean;
  }[];
  allClearBonusClaimed: boolean;
  lifetimeMissionsCompleted: number;
}

export class DailyMissionTracker {
  private dateKey: string = '';
  private missions: DailyMission[] = [];
  private allClearBonusClaimed: boolean = false;
  private lifetimeMissionsCompleted: number = 0;
  private credits: number = 150; // Starter credits
  private unlockedExclusiveBadges: Set<string> = new Set();
  private unlockedArmoryItems: Set<string> = new Set();
  private activeBladeHex: number | null = null;

  // Listeners
  public onMissionCompleted?: (mission: DailyMission) => void;
  public onAllMissionsCompleted?: () => void;
  public onStateUpdated?: () => void;
  public onCurrencyUpdated?: (newBalance: number) => void;

  constructor() {
    this.initDailyState();
  }

  // Get standardized date key YYYY-MM-DD in local time
  public static getTodayDateKey(): string {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  // Calculate milliseconds and formatted string remaining until midnight
  public static getTimeUntilReset(): { hours: number; minutes: number; seconds: number; formatted: string } {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0); // next midnight
    const diffMs = Math.max(0, midnight.getTime() - now.getTime());

    const totalSeconds = Math.floor(diffMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const formatted = `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
    return { hours, minutes, seconds, formatted };
  }

  // Deterministic pseudo-random selection of 3 distinct, diverse missions for a given date
  private selectMissionsForDate(dateKey: string): DailyMissionTemplate[] {
    // Hash the date string into a deterministic numeric seed
    let hash = 0;
    for (let i = 0; i < dateKey.length; i++) {
      hash = (hash << 5) - hash + dateKey.charCodeAt(i);
      hash |= 0;
    }
    const seed = Math.abs(hash);

    // Simple pseudo-random generator
    const rng = (offset: number) => {
      const x = Math.sin(seed + offset) * 10000;
      return x - Math.floor(x);
    };

    // Pick 3 diverse templates (prefer distinct types)
    const available = [...MISSION_TEMPLATES_POOL];
    const selected: DailyMissionTemplate[] = [];

    // Slot 1: Slicing or Deflecting (precision/defense)
    const precisionPool = available.filter(
      (m) => m.type === 'SHARDS_SLICED' || m.type === 'PROJECTILES_DEFLECTED'
    );
    const idx1 = Math.floor(rng(1) * precisionPool.length);
    const pick1 = precisionPool[idx1] || available[0];
    selected.push(pick1);

    // Slot 2: Combat or Score (kills/bosses/score)
    const combatPool = available.filter(
      (m) => (m.type === 'DRONES_DESTROYED' || m.type === 'SCORE_TARGET' || m.type === 'ELITE_KILLS') && m.id !== pick1.id
    );
    const idx2 = Math.floor(rng(2) * combatPool.length);
    const pick2 = combatPool[idx2] || available[1];
    selected.push(pick2);

    // Slot 3: Mastery / Special (combo/overdrive/waves/perfect)
    const masteryPool = available.filter(
      (m) => !selected.some((s) => s.id === m.id)
    );
    const idx3 = Math.floor(rng(3) * masteryPool.length);
    const pick3 = masteryPool[idx3] || available[2];
    selected.push(pick3);

    return selected;
  }

  // Initialize or roll over daily missions
  public initDailyState() {
    const today = DailyMissionTracker.getTodayDateKey();
    this.dateKey = today;

    // Load credits
    try {
      const savedCredits = localStorage.getItem(CREDITS_STORAGE_KEY);
      if (savedCredits !== null) {
        this.credits = Math.max(0, parseInt(savedCredits, 10) || 0);
      }
      const savedBadges = localStorage.getItem(EXCLUSIVE_BADGES_KEY);
      if (savedBadges) {
        this.unlockedExclusiveBadges = new Set(JSON.parse(savedBadges));
      }
      const savedArmory = localStorage.getItem(ARMORY_STORAGE_KEY);
      if (savedArmory) {
        this.unlockedArmoryItems = new Set(JSON.parse(savedArmory));
      }
    } catch {
      // storage unavailable
    }

    // Load missions state
    let loadedState: DailyPersistedState | null = null;
    try {
      const raw = localStorage.getItem(DAILY_STORAGE_KEY);
      if (raw) {
        loadedState = JSON.parse(raw);
      }
    } catch {
      loadedState = null;
    }

    if (loadedState && loadedState.dateKey === today && Array.isArray(loadedState.missions) && loadedState.missions.length === 3) {
      // Restore today's state
      this.lifetimeMissionsCompleted = loadedState.lifetimeMissionsCompleted || 0;
      this.allClearBonusClaimed = Boolean(loadedState.allClearBonusClaimed);

      // Reconstruct full mission objects from templates
      this.missions = loadedState.missions.map((saved) => {
        const tmpl = MISSION_TEMPLATES_POOL.find((t) => t.id === saved.id) || MISSION_TEMPLATES_POOL[0];
        return {
          ...tmpl,
          currentProgress: saved.currentProgress,
          isCompleted: saved.isCompleted,
          isClaimed: saved.isClaimed,
        };
      });
    } else {
      // New day: select fresh deterministic 3 missions!
      const templates = this.selectMissionsForDate(today);
      this.missions = templates.map((tmpl) => ({
        ...tmpl,
        currentProgress: 0,
        isCompleted: false,
        isClaimed: false,
      }));
      this.allClearBonusClaimed = false;
      this.saveToStorage();
    }
  }

  private saveToStorage() {
    try {
      const stateToSave: DailyPersistedState = {
        dateKey: this.dateKey,
        missions: this.missions.map((m) => ({
          id: m.id,
          currentProgress: m.currentProgress,
          isCompleted: m.isCompleted,
          isClaimed: m.isClaimed,
        })),
        allClearBonusClaimed: this.allClearBonusClaimed,
        lifetimeMissionsCompleted: this.lifetimeMissionsCompleted,
      };
      localStorage.setItem(DAILY_STORAGE_KEY, JSON.stringify(stateToSave));
      localStorage.setItem(CREDITS_STORAGE_KEY, String(this.credits));
      localStorage.setItem(EXCLUSIVE_BADGES_KEY, JSON.stringify(Array.from(this.unlockedExclusiveBadges)));
      localStorage.setItem(ARMORY_STORAGE_KEY, JSON.stringify(Array.from(this.unlockedArmoryItems)));
    } catch {
      // Ignore localStorage errors
    }
    this.onStateUpdated?.();
  }

  // Getters
  public getMissions(): DailyMission[] {
    return this.missions;
  }

  public getCredits(): number {
    return this.credits;
  }

  public addCredits(amount: number) {
    this.credits = Math.max(0, this.credits + amount);
    this.saveToStorage();
    this.onCurrencyUpdated?.(this.credits);
    this.onStateUpdated?.();
  }

  public getLifetimeMissionsCompleted(): number {
    return this.lifetimeMissionsCompleted;
  }

  public isAllClearBonusClaimed(): boolean {
    return this.allClearBonusClaimed;
  }

  public isAllMissionsCompleted(): boolean {
    return this.missions.every((m) => m.isCompleted);
  }

  public getUnlockedExclusiveBadgeIds(): string[] {
    return Array.from(this.unlockedExclusiveBadges);
  }

  public getUnlockedExclusiveBadges(): ExclusiveBadge[] {
    return EXCLUSIVE_BADGES.filter((b) => this.unlockedExclusiveBadges.has(b.id));
  }

  public getArmoryItems(): ArmoryItem[] {
    return ARMORY_ITEMS.map((item) => ({
      ...item,
      isUnlocked: this.unlockedArmoryItems.has(item.id),
    }));
  }

  public hasPerk(perkEffect: string): boolean {
    const item = ARMORY_ITEMS.find((a) => a.perkEffect === perkEffect);
    return item ? this.unlockedArmoryItems.has(item.id) : false;
  }

  public getActiveBladeHex(): number | null {
    return this.activeBladeHex;
  }

  public setActiveBladeHex(hex: number | null) {
    this.activeBladeHex = hex;
  }

  // Claim reward for a completed mission
  public claimMissionReward(missionId: string): { creditsEarned: number; badgeUnlocked?: ExclusiveBadge } | null {
    const mission = this.missions.find((m) => m.id === missionId);
    if (!mission || !mission.isCompleted || mission.isClaimed) return null;

    mission.isClaimed = true;
    this.lifetimeMissionsCompleted++;
    this.credits += mission.rewardCurrency;

    // Grant first daily mission badge
    if (this.lifetimeMissionsCompleted >= 1) {
      this.unlockedExclusiveBadges.add('badge_daily_operative');
    }

    // Grant exclusive badge tied to this mission if applicable
    let badgeUnlocked: ExclusiveBadge | undefined;
    if (mission.exclusiveBadgeId) {
      this.unlockedExclusiveBadges.add(mission.exclusiveBadgeId);
      badgeUnlocked = EXCLUSIVE_BADGES.find((b) => b.id === mission.exclusiveBadgeId);
    }

    sound.playRewardClaimed();
    this.saveToStorage();
    this.onCurrencyUpdated?.(this.credits);

    return {
      creditsEarned: mission.rewardCurrency,
      badgeUnlocked,
    };
  }

  // Claim all-clear daily bonus (+500 Cyber Credits & Tri-Vector Protocol Badge)
  public claimAllClearBonus(): { bonusCredits: number; badgeUnlocked: ExclusiveBadge } | null {
    if (!this.isAllMissionsCompleted() || this.allClearBonusClaimed) return null;

    const bonusCredits = 500;
    this.allClearBonusClaimed = true;
    this.credits += bonusCredits;
    this.unlockedExclusiveBadges.add('badge_daily_vanguard');

    sound.playAchievementUnlock();
    this.saveToStorage();
    this.onCurrencyUpdated?.(this.credits);

    const badgeUnlocked = EXCLUSIVE_BADGES.find((b) => b.id === 'badge_daily_vanguard')!;
    return {
      bonusCredits,
      badgeUnlocked,
    };
  }

  // Purchase an item from the armory using Cyber Credits
  public purchaseArmoryItem(itemId: string): boolean {
    const item = ARMORY_ITEMS.find((i) => i.id === itemId);
    if (!item || this.unlockedArmoryItems.has(itemId) || this.credits < item.cost) {
      return false;
    }

    this.credits -= item.cost;
    this.unlockedArmoryItems.add(itemId);

    if (item.category === 'BLADE_CRYSTAL' && item.bladeHex !== undefined) {
      this.activeBladeHex = item.bladeHex;
    }

    sound.playRewardClaimed();
    this.saveToStorage();
    this.onCurrencyUpdated?.(this.credits);
    return true;
  }

  // Check progress and potentially complete mission
  private progressMission(type: DailyObjectiveType, amountToAdd: number, absoluteMax?: number) {
    let stateChanged = false;

    for (const mission of this.missions) {
      if (mission.type === type && !mission.isCompleted) {
        if (absoluteMax !== undefined) {
          mission.currentProgress = Math.max(mission.currentProgress, absoluteMax);
        } else {
          mission.currentProgress += amountToAdd;
        }

        if (mission.currentProgress >= mission.targetCount) {
          mission.currentProgress = mission.targetCount;
          mission.isCompleted = true;
          stateChanged = true;

          sound.playMissionComplete();
          this.onMissionCompleted?.(mission);

          // Check if all are complete
          if (this.isAllMissionsCompleted()) {
            this.onAllMissionsCompleted?.();
          }
        } else {
          stateChanged = true;
        }
      }
    }

    if (stateChanged) {
      this.saveToStorage();
    }
  }

  // -------------------------------------------------------------
  // EVENT HOOKS FROM GAME ENGINE
  // -------------------------------------------------------------

  public onShardSliced(_stats: PlayerStats) {
    this.progressMission('SHARDS_SLICED', 1);
  }

  public onProjectileDeflected(_stats: PlayerStats) {
    this.progressMission('PROJECTILES_DEFLECTED', 1);
  }

  public onEnemyDestroyed(enemyType: string, _stats: PlayerStats) {
    this.progressMission('DRONES_DESTROYED', 1);
    if (enemyType === 'GUNSHIP_ELITE' || enemyType === 'SENTINEL_BOSS') {
      this.progressMission('ELITE_KILLS', 1);
    }
  }

  public onOverdriveTriggered() {
    this.progressMission('OVERDRIVE_TRIGGERED', 1);
  }

  public onWaveClear(waveNum: number, _stats: PlayerStats, isPerfect: boolean) {
    this.progressMission('WAVES_CLEARED', 1);
    if (isPerfect) {
      this.progressMission('PERFECT_WAVE', 1);
    }
  }

  public updateStats(stats: PlayerStats) {
    if (stats.combo >= 1) {
      this.progressMission('COMBO_STREAK', 0, stats.maxCombo);
    }
    if (stats.score >= 1) {
      this.progressMission('SCORE_TARGET', 0, stats.score);
    }
  }

  // Cloud Sync integration
  public syncFromCloud(credits?: number, exclusiveBadges?: string[], dailyStateStr?: string) {
    let changed = false;
    if (credits !== undefined && credits > this.credits) {
      this.credits = credits;
      changed = true;
    }
    if (exclusiveBadges && Array.isArray(exclusiveBadges)) {
      exclusiveBadges.forEach((b) => this.unlockedExclusiveBadges.add(b));
      changed = true;
    }
    if (dailyStateStr) {
      try {
        const parsed: DailyPersistedState = JSON.parse(dailyStateStr);
        if (parsed.dateKey === this.dateKey && Array.isArray(parsed.missions)) {
          parsed.missions.forEach((saved) => {
            const m = this.missions.find((curr) => curr.id === saved.id);
            if (m) {
              m.currentProgress = Math.max(m.currentProgress, saved.currentProgress);
              m.isCompleted = m.isCompleted || saved.isCompleted;
              m.isClaimed = m.isClaimed || saved.isClaimed;
            }
          });
          if (parsed.allClearBonusClaimed) {
            this.allClearBonusClaimed = true;
          }
          if (parsed.lifetimeMissionsCompleted > this.lifetimeMissionsCompleted) {
            this.lifetimeMissionsCompleted = parsed.lifetimeMissionsCompleted;
          }
          changed = true;
        }
      } catch {
        // ignore parse error
      }
    }
    if (changed) {
      this.saveToStorage();
    }
  }

  public getExportState(): { credits: number; exclusiveBadges: string[]; dailyState: string } {
    const stateObj: DailyPersistedState = {
      dateKey: this.dateKey,
      missions: this.missions.map((m) => ({
        id: m.id,
        currentProgress: m.currentProgress,
        isCompleted: m.isCompleted,
        isClaimed: m.isClaimed,
      })),
      allClearBonusClaimed: this.allClearBonusClaimed,
      lifetimeMissionsCompleted: this.lifetimeMissionsCompleted,
    };

    return {
      credits: this.credits,
      exclusiveBadges: Array.from(this.unlockedExclusiveBadges),
      dailyState: JSON.stringify(stateObj),
    };
  }
}

export const dailyMissionTracker = new DailyMissionTracker();
