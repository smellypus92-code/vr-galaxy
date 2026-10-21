import type * as THREE from 'three';

export type GameState = 'TITLE' | 'PLAYING' | 'PAUSED' | 'GAMEOVER' | 'VICTORY';

export type WeaponMode = 'DUAL_SABERS' | 'SABER_SHIELD' | 'BLASTER';

export type ReticleStyle = 'CYBER_RING' | 'TACTICAL_CROSS' | 'TRI_CHEVRON' | 'DIAMOND';

export interface ReticleConfig {
  style: ReticleStyle;
  idleColor: string; // hex color e.g. '#00f3ff'
  targetColor: string; // hex color e.g. '#ff0055'
  size: number; // multiplier e.g. 1.0
  showLaserPointer: boolean;
  showDistanceReadout: boolean;
}

export interface PlayerStats {
  health: number;
  maxHealth: number;
  shield: number;
  maxShield: number;
  score: number;
  combo: number;
  maxCombo: number;
  comboTimer: number;
  overdrive: number; // 0 - 100
  isOverdriveActive: number; // timer remaining
  kills: number;
  deflections: number;
  shardsSliced: number;
  wave: number;
  isVrActive: boolean;
  vrSupported: boolean;
  isTargetingDrone: boolean;
  targetedEnemyType?: EnemyType | null;
  targetedDistance: number;
}

export type EnemyType = 'DRONE' | 'STALKER' | 'SENTINEL_BOSS';

export interface EnemyEntity {
  id: string;
  type: EnemyType;
  mesh: THREE.Group;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  health: number;
  maxHealth: number;
  attackCooldown: number;
  attackWindup: number; // >0 means telegraphing attack
  isWindingUp: boolean;
  aimLaserMesh?: THREE.Line;
  radius: number;
  scoreValue: number;
}

export interface ProjectileEntity {
  id: string;
  mesh: THREE.Mesh | THREE.Group;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  radius: number;
  isDeflected: boolean;
  damage: number;
  color: number;
  life: number;
}

export interface FlyingShardEntity {
  id: string;
  mesh: THREE.Group;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  sliceDirection: 'ANY' | 'HORIZONTAL' | 'VERTICAL';
  color: number;
  hit: boolean;
  radius: number;
}

export interface ParticleEntity {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  life: number;
  maxLife: number;
  active: boolean;
}

export interface CameraShake {
  intensity: number;
  decay: number;
}
