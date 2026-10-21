import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { achievementTracker } from './achievements';
import { dailyMissionTracker } from './dailyMissions';
import { sound } from './audio';
import { InputManager } from './input';

// Screen-space red chromatic aberration shader
// Intensifies when the player takes damage, providing immediate visual feedback on health loss
export const ChromaticAberrationShader = {
  name: 'ChromaticAberrationShader',
  uniforms: {
    tDiffuse: { value: null },
    uIntensity: { value: 0.0 },
    uRedBoost: { value: 0.0 },
    uTime: { value: 0.0 },
    uResolution: { value: new THREE.Vector2(1, 1) },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float uIntensity;
    uniform float uRedBoost;
    uniform float uTime;
    uniform vec2 uResolution;
    varying vec2 vUv;

    float rand(vec2 co) {
      return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
    }

    void main() {
      vec2 uv = vUv;

      if (uIntensity <= 0.001 && uRedBoost <= 0.001) {
        gl_FragColor = texture2D(tDiffuse, uv);
        return;
      }

      vec2 center = vec2(0.5, 0.5);
      vec2 dir = uv - center;
      float dist = length(dir);

      // Cyber damage glitch jitter on heavy impacts
      if (uIntensity > 0.45) {
        float line = floor(uv.y * 140.0);
        if (mod(line, 5.0) == 0.0) {
          float jitter = (rand(vec2(line, floor(uTime * 28.0))) - 0.5) * 0.02 * uIntensity;
          uv.x += jitter;
        }
      }

      // Radial chromatic dispersion:
      // Red channel is displaced outward strongly, blue channel inward
      float spread = uIntensity * (0.045 + dist * 0.04);
      vec2 redOffset = dir * spread;
      vec2 blueOffset = -dir * (spread * 0.7);

      float r = texture2D(tDiffuse, uv + redOffset).r;
      float g = texture2D(tDiffuse, uv).g;
      float b = texture2D(tDiffuse, uv + blueOffset).b;

      vec3 color = vec3(r, g, b);

      // Screen-space red vignette & flash indicating health loss
      float vignette = smoothstep(0.2, 0.9, dist) * uRedBoost;
      color.r += vignette * 0.85;
      color.gb -= vec2(vignette * 0.4);

      // Subtle overall flash tint on damage
      color.r += uRedBoost * 0.15;
      color.g -= uRedBoost * 0.05;
      color.b -= uRedBoost * 0.05;

      gl_FragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
    }
  `,
};
import {
  createCyberArena,
  createCyberSaber,
  createDataShard,
  createDroneModel,
  createEnergyShield,
  createSentinelBossModel,
  createStalkerModel,
  createVrReticle,
  createBikiniChampionModel,
  createCyberPalmTree,
  CHAMPIONS,
  ChampionId,
} from './proceduralModels';
import {
  CameraShake,
  EnemyEntity,
  FlyingShardEntity,
  GameState,
  ParticleEntity,
  PlayerStats,
  ProjectileEntity,
  ReticleConfig,
} from './types';

// Pre-allocated math helpers to ensure zero GC in 60fps loop
const _v1 = new THREE.Vector3();
const _v2 = new THREE.Vector3();
const _v3 = new THREE.Vector3();
const _vForward = new THREE.Vector3();
const _vRight = new THREE.Vector3();

export class GameEngine {
  private container: HTMLElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private input: InputManager;
  private isSoftwareGl: boolean;
  private animationFrameId = 0;
  private lastTime = 0;

  // Reticle customization
  public reticleConfig: ReticleConfig = {
    style: 'CYBER_RING',
    idleColor: '#00f3ff',
    targetColor: '#ff0055',
    size: 1.0,
    showLaserPointer: true,
    showDistanceReadout: true,
  };
  private vrReticle!: ReturnType<typeof createVrReticle>;
  private wasTargetingLastFrame = false;

  // Bikini Cyber Champions Co-Pilots
  public selectedChampion: ChampionId = 'ELENA';
  private champions: ReturnType<typeof createBikiniChampionModel>[] = [];

  // Game state & callback
  public state: GameState = 'TITLE';
  public onStatsUpdate?: (stats: PlayerStats) => void;
  public onStateChange?: (state: GameState) => void;

  public stats: PlayerStats = {
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
  };

  // Player in-world variables
  private playerPos = new THREE.Vector3(0, 1.7, 4);
  private playerVelocity = new THREE.Vector3();
  private cameraPitch = 0;
  private cameraYaw = 0;
  private cameraShake: CameraShake = { intensity: 0, decay: 4.5 };
  private hitstopTimer = 0;

  // Screen-space red chromatic aberration post-processing
  private composer!: EffectComposer;
  private renderPass!: RenderPass;
  private aberrationPass!: ShaderPass;
  public damageAberrationIntensity = 0;

  // First-Person Player Rig & Weapons
  private playerRig = new THREE.Group();
  private firstPersonHands = new THREE.Group();
  private rightSaber: ReturnType<typeof createCyberSaber>;
  private leftSaber: ReturnType<typeof createCyberSaber>;
  private energyShield: ReturnType<typeof createEnergyShield>;

  // Weapon animations
  private rightSwingTimer = 0;
  private isSwingingRight = false;
  private leftSwingTimer = 0;
  private isShieldActive = false;

  // WebXR Controllers
  private xrController0: THREE.XRTargetRaySpace | null = null;
  private xrController1: THREE.XRTargetRaySpace | null = null;
  private xrControllerGrip0: THREE.XRGripSpace | null = null;
  private xrControllerGrip1: THREE.XRGripSpace | null = null;
  private vrLeftBlade: ReturnType<typeof createCyberSaber> | null = null;
  private vrRightBlade: ReturnType<typeof createCyberSaber> | null = null;
  private vrShield: ReturnType<typeof createEnergyShield> | null = null;

  // Entities
  private enemies: EnemyEntity[] = [];
  private projectiles: ProjectileEntity[] = [];
  private flyingShards: FlyingShardEntity[] = [];
  private particlePool: ParticleEntity[] = [];

  // Wave / Spawning
  private waveSpawnTimer = 0;
  private enemiesRemainingToSpawn = 0;
  private shardSpawnTimer = 0;

  // Title screen camera orbit
  private titleOrbitAngle = 0;

  constructor(container: HTMLElement) {
    this.container = container;

    // 1. Detect software WebGL per Three.js skill
    this.isSoftwareGl = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return false;
      }
    })();

    // 2. Initialize Three.js renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(this.renderer.domElement);

    // 3. Scene & Camera setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x030712);
    this.scene.fog = new THREE.FogExp2(0x030712, 0.022);

    this.camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      250
    );
    this.camera.position.set(0, 1.7, 4);

    // 4. Input Manager
    this.input = new InputManager();
    this.input.attachCanvas(this.renderer.domElement);

    // 5. Studio Environment Reflection (RoomEnvironment)
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 6. Lighting Rig
    this.setupLighting();

    // 7. Procedural Cyber Arena
    createCyberArena(this.scene);
    this.setupCyberBeach();

    // 8. Player Rig & Weapons
    this.rightSaber = createCyberSaber(0x00f3ff); // Cyan Blade
    this.leftSaber = createCyberSaber(0xff0055);  // Magenta Blade
    this.energyShield = createEnergyShield();

    this.setupPlayerRig();

    // 9. WebXR Setup
    this.setupWebXR();

    // 10. Particle Pool
    this.initParticlePool(100);

    // 11. Screen-Space Red Chromatic Aberration Post-Processing Pipeline
    this.composer = new EffectComposer(this.renderer);
    this.renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(this.renderPass);

    this.aberrationPass = new ShaderPass(ChromaticAberrationShader);
    this.aberrationPass.uniforms.uResolution.value.set(
      container.clientWidth,
      container.clientHeight
    );
    this.composer.addPass(this.aberrationPass);

    // 12. Window resize listener
    this.onResize = this.onResize.bind(this);
    window.addEventListener('resize', this.onResize);

    // 13. Check WebXR support
    if (typeof navigator !== 'undefined' && 'xr' in navigator && navigator.xr) {
      navigator.xr.isSessionSupported('immersive-vr').then((supported) => {
        this.stats.vrSupported = supported;
        this.emitStats();
      }).catch(() => {});
    }

    // Start loop
    this.lastTime = performance.now();
    this.tick = this.tick.bind(this);
    this.tick();
  }

  private setupLighting() {
    // Hemisphere fill: cool sky vs cyber deep ground
    const hemiLight = new THREE.HemisphereLight(0x38bdf8, 0x090d16, 0.7);
    this.scene.add(hemiLight);

    // Warm key directional with soft shadows
    const keyLight = new THREE.DirectionalLight(0xfff7ed, 1.8);
    keyLight.position.set(12, 22, 10);
    keyLight.castShadow = !this.isSoftwareGl;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 60;
    const d = 18;
    keyLight.shadow.camera.left = -d;
    keyLight.shadow.camera.right = d;
    keyLight.shadow.camera.top = d;
    keyLight.shadow.camera.bottom = -d;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    this.scene.add(keyLight);

    // Cyber Rim Light
    const rimLight = new THREE.DirectionalLight(0x00f3ff, 1.0);
    rimLight.position.set(-10, 8, -12);
    this.scene.add(rimLight);
  }

  private setupPlayerRig() {
    this.scene.add(this.playerRig);
    this.playerRig.add(this.camera);

    // First person hands container attached to camera
    this.camera.add(this.firstPersonHands);

    // Position Right Saber in first person view
    this.rightSaber.group.position.set(0.32, -0.32, -0.45);
    this.rightSaber.group.rotation.set(-0.25, 0.15, -0.2);
    this.firstPersonHands.add(this.rightSaber.group);

    // Position Left Saber / Shield
    this.leftSaber.group.position.set(-0.32, -0.32, -0.45);
    this.leftSaber.group.rotation.set(-0.25, -0.15, 0.2);
    this.firstPersonHands.add(this.leftSaber.group);

    // Shield attached to left hand (starts invisible/dormant)
    this.energyShield.group.position.set(-0.2, -0.15, -0.4);
    this.energyShield.group.visible = false;
    this.firstPersonHands.add(this.energyShield.group);

    // 3D VR Holographic Reticle
    this.vrReticle = createVrReticle(this.reticleConfig);
    this.camera.add(this.vrReticle.group);
  }

  public setReticleConfig(newCfg: Partial<ReticleConfig>) {
    const styleChanged = newCfg.style && newCfg.style !== this.reticleConfig.style;
    this.reticleConfig = { ...this.reticleConfig, ...newCfg };
    if (styleChanged) {
      this.vrReticle.rebuildStyle(this.reticleConfig);
    }
    this.emitStats();
  }

  public setSelectedChampion(id: ChampionId) {
    this.selectedChampion = id;
    this.emitStats();
  }

  private setupCyberBeach() {
    // Spawn 3 Bikini Cyber Champions on observation decks overlooking the combat arena
    const elena = createBikiniChampionModel(CHAMPIONS.ELENA);
    elena.group.position.set(-8, 0, -5);
    elena.group.lookAt(0, 1.2, 0);
    this.scene.add(elena.group);
    this.champions.push(elena);

    const maya = createBikiniChampionModel(CHAMPIONS.MAYA);
    maya.group.position.set(8, 0, -5);
    maya.group.lookAt(0, 1.2, 0);
    this.scene.add(maya.group);
    this.champions.push(maya);

    const nyx = createBikiniChampionModel(CHAMPIONS.NYX);
    nyx.group.position.set(0, 0, -11);
    nyx.group.lookAt(0, 1.2, 0);
    this.scene.add(nyx.group);
    this.champions.push(nyx);

    // Spawn Geometric Cyber Palm Trees along the tropical arena perimeter
    const palmLocations = [
      [-11, 0, -8],
      [11, 0, -8],
      [-13, 0, 4],
      [13, 0, 4],
      [-6, 0, -14],
      [6, 0, -14],
    ];
    palmLocations.forEach(([x, y, z]) => {
      const palm = createCyberPalmTree();
      palm.position.set(x, y, z);
      this.scene.add(palm);
    });
  }

  private setupWebXR() {
    this.renderer.xr.enabled = true;

    // Left controller
    this.xrController0 = this.renderer.xr.getController(0);
    this.playerRig.add(this.xrController0);

    // Right controller
    this.xrController1 = this.renderer.xr.getController(1);
    this.playerRig.add(this.xrController1);

    // Grip spaces for physical weapon attachments
    this.xrControllerGrip0 = this.renderer.xr.getControllerGrip(0);
    this.playerRig.add(this.xrControllerGrip0);

    this.xrControllerGrip1 = this.renderer.xr.getControllerGrip(1);
    this.playerRig.add(this.xrControllerGrip1);

    // Attach VR weapons
    this.vrLeftBlade = createCyberSaber(0xff0055);
    this.vrRightBlade = createCyberSaber(0x00f3ff);
    this.vrShield = createEnergyShield();

    // Rotate sabers to point forward naturally from VR grip
    this.vrLeftBlade.group.rotation.x = -Math.PI / 4;
    this.vrRightBlade.group.rotation.x = -Math.PI / 4;
    this.vrShield.group.position.set(0, 0, -0.1);
    this.vrShield.group.visible = false;

    this.xrControllerGrip0.add(this.vrLeftBlade.group);
    this.xrControllerGrip0.add(this.vrShield.group);
    this.xrControllerGrip1.add(this.vrRightBlade.group);

    // XR Session listener
    this.renderer.xr.addEventListener('sessionstart', () => {
      this.stats.isVrActive = true;
      this.firstPersonHands.visible = false; // Hide desktop hands in real VR
      // Reparent VR reticle to Right Controller in real VR
      this.camera.remove(this.vrReticle.group);
      if (this.xrController1) {
        this.xrController1.add(this.vrReticle.group);
      }
      achievementTracker.onVrEngaged();
      this.emitStats();
    });

    this.renderer.xr.addEventListener('sessionend', () => {
      this.stats.isVrActive = false;
      this.firstPersonHands.visible = true;
      if (this.xrController1) {
        this.xrController1.remove(this.vrReticle.group);
      }
      this.camera.add(this.vrReticle.group);
      this.emitStats();
    });

    // Controller input events
    this.xrController1.addEventListener('selectstart', () => {
      this.triggerRightSwing();
    });

    this.xrController0.addEventListener('selectstart', () => {
      this.isShieldActive = true;
      if (this.vrShield) this.vrShield.group.visible = true;
      if (this.vrLeftBlade) this.vrLeftBlade.group.visible = false;
      sound.playShieldBlock();
    });

    this.xrController0.addEventListener('selectend', () => {
      this.isShieldActive = false;
      if (this.vrShield) this.vrShield.group.visible = false;
      if (this.vrLeftBlade) this.vrLeftBlade.group.visible = true;
    });
  }

  public async enterVR() {
    if (!navigator.xr) return;
    try {
      const session = await navigator.xr.requestSession('immersive-vr', {
        optionalFeatures: ['local-floor', 'bounded-floor', 'hand-tracking'],
      });
      this.renderer.xr.setSession(session);
      if (this.state === 'TITLE') {
        this.startGame();
      }
    } catch {
      // VR session request failed, fallback to desktop
    }
  }

  private initParticlePool(count: number) {
    const geo = new THREE.BoxGeometry(0.04, 0.04, 0.04);
    const mat = new THREE.MeshBasicMaterial({ color: 0x00f3ff });

    for (let i = 0; i < count; i++) {
      const mesh = new THREE.Mesh(geo, mat.clone());
      mesh.visible = false;
      this.scene.add(mesh);
      this.particlePool.push({
        mesh,
        velocity: new THREE.Vector3(),
        life: 0,
        maxLife: 1,
        active: false,
      });
    }
  }

  public spawnParticleBurst(pos: THREE.Vector3, colorHex = 0x00f3ff, count = 12, speed = 4) {
    let spawned = 0;
    for (const p of this.particlePool) {
      if (!p.active) {
        p.active = true;
        p.life = 0;
        p.maxLife = 0.35 + Math.random() * 0.3;
        p.mesh.visible = true;
        p.mesh.position.copy(pos);
        (p.mesh.material as THREE.MeshBasicMaterial).color.setHex(colorHex);

        // Random spherical burst
        p.velocity.set(
          (Math.random() - 0.5) * speed,
          Math.random() * speed * 0.8,
          (Math.random() - 0.5) * speed
        );

        spawned++;
        if (spawned >= count) break;
      }
    }
  }

  public startGame() {
    this.state = 'PLAYING';
    sound.startMusic();
    const hasShieldPerk = dailyMissionTracker.hasPerk('SHIELD_BOOST');
    this.stats.maxShield = hasShieldPerk ? 125 : 100;
    this.stats.maxHealth = 100;
    this.stats.health = 100;
    this.stats.shield = this.stats.maxShield;
    this.stats.score = 0;
    this.stats.combo = 0;
    this.stats.overdrive = 20;
    this.stats.isOverdriveActive = 0;
    this.stats.kills = 0;
    this.stats.deflections = 0;
    this.stats.shardsSliced = 0;
    this.stats.wave = 1;

    // Reset player position
    this.playerPos.set(0, 1.7, 4);
    this.playerVelocity.set(0, 0, 0);
    this.cameraPitch = 0;
    this.cameraYaw = 0;

    // Clear existing entities
    this.clearEntities();

    // Start wave 1
    this.startWave(1);
    this.emitStats();
    this.onStateChange?.(this.state);

    if (!this.stats.isVrActive) {
      this.input.requestPointerLock();
    }
  }

  public pauseGame() {
    if (this.state === 'PLAYING') {
      this.state = 'PAUSED';
      this.input.exitPointerLock();
      this.onStateChange?.(this.state);
    }
  }

  public resumeGame() {
    if (this.state === 'PAUSED') {
      this.state = 'PLAYING';
      this.onStateChange?.(this.state);
      if (!this.stats.isVrActive) {
        this.input.requestPointerLock();
      }
    }
  }

  public restartGame() {
    this.startGame();
  }

  private clearEntities() {
    for (const e of this.enemies) {
      this.scene.remove(e.mesh);
      if (e.aimLaserMesh) this.scene.remove(e.aimLaserMesh);
    }
    this.enemies = [];

    for (const p of this.projectiles) {
      this.scene.remove(p.mesh);
    }
    this.projectiles = [];

    for (const s of this.flyingShards) {
      this.scene.remove(s.mesh);
    }
    this.flyingShards = [];
  }

  private startWave(waveNum: number) {
    this.stats.wave = waveNum;
    this.enemiesRemainingToSpawn = 3 + waveNum * 2;
    this.waveSpawnTimer = 1.0;
    achievementTracker.onWaveStart(waveNum, this.stats.health);
  }

  // Right Saber swing trigger
  public triggerRightSwing() {
    if (this.isSwingingRight) return;
    this.isSwingingRight = true;
    this.rightSwingTimer = 0.28;
    sound.playSaberSwing(1.3);

    // Collision check for melee slice against drones & data shards
    this.checkMeleeHits();
  }

  // Left Saber / Shield
  public setShieldActive(active: boolean) {
    if (this.isShieldActive === active) return;
    this.isShieldActive = active;
    this.energyShield.group.visible = active;
    this.leftSaber.group.visible = !active;
    if (active) {
      sound.playShieldBlock();
    }
  }

  // Trigger Overdrive (Time Dilation / Slow-Mo)
  public triggerOverdrive() {
    if (this.stats.overdrive >= 100 && this.stats.isOverdriveActive <= 0) {
      this.stats.overdrive = 0;
      const hasOverdrivePerk = dailyMissionTracker.hasPerk('OVERDRIVE_EXTEND');
      this.stats.isOverdriveActive = hasOverdrivePerk ? 8.0 : 6.0; // Extended if perk purchased
      sound.playOverdriveWarp();
      achievementTracker.onOverdriveTriggered();
      dailyMissionTracker.onOverdriveTriggered();
      this.emitStats();
    }
  }

  private checkMeleeHits() {
    // Enhanced precision reach with Nyx perk boost
    const baseReach = this.selectedChampion === 'NYX' ? 3.0 : 2.4;
    const maxLockedReach = this.selectedChampion === 'NYX' ? 5.2 : 4.2;
    const reach = this.stats.isTargetingDrone ? maxLockedReach : baseReach;
    _vForward.set(0, 0, -1).applyQuaternion(this.camera.quaternion);
    const attackOrigin = this.playerPos;

    // Check flying rhythm shards
    for (const shard of this.flyingShards) {
      if (shard.hit) continue;
      const dist = shard.position.distanceTo(attackOrigin);
      if (dist < reach) {
        shard.hit = true;
        this.stats.shardsSliced++;
        achievementTracker.onShardSliced(this.stats);
        dailyMissionTracker.onShardSliced(this.stats);
        this.addScore(150 + (this.stats.isTargetingDrone ? 50 : 0));
        sound.playSliceHit(true);
        this.spawnParticleBurst(shard.position, shard.color, 16, 6);
        this.hitstopTimer = 0.05; // 50ms hitstop
        this.addShake(0.2);
        this.champions.forEach((c) => c.cheer());
        this.scene.remove(shard.mesh);
      }
    }

    // Check enemies in reach
    for (const enemy of this.enemies) {
      const dist = enemy.position.distanceTo(attackOrigin);
      if (dist < reach + enemy.radius) {
        const damage = this.stats.isTargetingDrone ? 85 : 60;
        enemy.health -= damage;
        this.spawnParticleBurst(enemy.position, this.stats.isTargetingDrone ? 0xff0055 : 0x00f3ff, 16, 6);
        sound.playSliceHit(this.stats.isTargetingDrone);
        this.hitstopTimer = 0.06;
        this.addShake(0.35);
        this.champions.forEach((c) => c.cheer());

        if (enemy.health <= 0) {
          this.destroyEnemy(enemy);
        }
      }
    }

    // Check incoming projectiles to deflect!
    for (const proj of this.projectiles) {
      if (proj.isDeflected) continue;
      const dist = proj.position.distanceTo(attackOrigin);
      if (dist < reach) {
        proj.isDeflected = true;
        proj.damage = 100;
        proj.color = 0x00f3ff;
        (proj.mesh as THREE.Mesh).material = new THREE.MeshBasicMaterial({ color: 0x00f3ff });

        // Deflect back towards closest enemy or straight ahead
        let targetEnemy: EnemyEntity | null = null;
        let minD = Infinity;
        for (const e of this.enemies) {
          const d = e.position.distanceTo(proj.position);
          if (d < minD) {
            minD = d;
            targetEnemy = e;
          }
        }

        if (targetEnemy) {
          proj.velocity.copy(targetEnemy.position).sub(proj.position).normalize().multiplyScalar(28);
        } else {
          proj.velocity.copy(_vForward).multiplyScalar(28);
        }

        this.stats.deflections++;
        achievementTracker.onProjectileDeflected(this.stats);
        dailyMissionTracker.onProjectileDeflected(this.stats);
        this.addScore(250);
        sound.playDeflect();
        this.spawnParticleBurst(proj.position, 0x00f3ff, 12, 6);
        this.hitstopTimer = 0.04;
        this.addShake(0.25);
        this.champions.forEach((c) => c.cheer());
      }
    }
  }

  private destroyEnemy(enemy: EnemyEntity) {
    this.addScore(enemy.scoreValue);
    this.stats.kills++;
    achievementTracker.onEnemyDestroyed(enemy.type, this.stats);
    dailyMissionTracker.onEnemyDestroyed(enemy.type, this.stats);
    sound.playExplosion(enemy.type === 'SENTINEL_BOSS');
    this.spawnParticleBurst(enemy.position, 0xff0055, 24, 7);
    this.addShake(enemy.type === 'SENTINEL_BOSS' ? 0.7 : 0.4);
    this.champions.forEach((c) => c.cheer());

    if (enemy.aimLaserMesh) {
      this.scene.remove(enemy.aimLaserMesh);
    }
    this.scene.remove(enemy.mesh);
    this.enemies = this.enemies.filter((e) => e.id !== enemy.id);

    // Overdrive charge with Maya's perk boost
    const overdriveMultiplier = this.selectedChampion === 'MAYA' ? 1.4 : 1.0;
    const charge = (enemy.type === 'SENTINEL_BOSS' ? 50 : 20) * overdriveMultiplier;
    this.stats.overdrive = Math.min(100, this.stats.overdrive + charge);

    // Check wave clear
    if (this.enemiesRemainingToSpawn <= 0 && this.enemies.length === 0) {
      const isPerfectWave = this.stats.health >= 100;
      achievementTracker.onWaveClear(this.stats.wave, this.stats.health);
      dailyMissionTracker.onWaveClear(this.stats.wave, this.stats, isPerfectWave);
      if (this.stats.wave >= 5) {
        this.state = 'VICTORY';
        this.onStateChange?.(this.state);
      } else {
        this.startWave(this.stats.wave + 1);
      }
    }
    this.emitStats();
  }

  private addScore(pts: number) {
    const prevMultiplier = Math.min(8, Math.floor(this.stats.combo / 4) + 1);
    this.stats.combo++;
    if (this.stats.combo > this.stats.maxCombo) {
      this.stats.maxCombo = this.stats.combo;
    }
    this.stats.comboTimer = 3.5; // combo reset window
    const multiplier = Math.min(8, Math.floor(this.stats.combo / 4) + 1);
    if (multiplier > prevMultiplier) {
      sound.playComboLevelUp(multiplier);
    }
    this.stats.score += pts * multiplier;
    this.emitStats();
  }

  private addShake(amount: number) {
    this.cameraShake.intensity = Math.min(1.0, this.cameraShake.intensity + amount);
  }

  private emitStats() {
    achievementTracker.updateStats(this.stats);
    dailyMissionTracker.updateStats(this.stats);
    this.onStatsUpdate?.({ ...this.stats });
  }

  // -------------------------------------------------------------
  // SIMULATION TICK (60fps clamped delta)
  // -------------------------------------------------------------
  private tick() {
    const now = performance.now();
    const rawDt = (now - this.lastTime) / 1000;
    this.lastTime = now;
    const clampedDt = Math.min(rawDt, 0.05);

    // Simulation dilation: slow-mo when Overdrive is active
    const timeScale = this.stats.isOverdriveActive > 0 ? 0.35 : 1.0;
    const dt = clampedDt * timeScale;

    if (this.hitstopTimer > 0) {
      this.hitstopTimer -= rawDt;
      // Freeze simulation during hitstop, still render
    } else {
      if (this.state === 'TITLE') {
        this.updateTitleScreen(clampedDt);
      } else if (this.state === 'PLAYING') {
        this.updateGameplay(dt, clampedDt);
      }
    }

    // Camera shake decay
    if (this.cameraShake.intensity > 0) {
      this.cameraShake.intensity = Math.max(
        0,
        this.cameraShake.intensity - clampedDt * this.cameraShake.decay
      );
      const shakeAmt = this.cameraShake.intensity * 0.12;
      this.camera.position.x = this.playerPos.x + (Math.random() - 0.5) * shakeAmt;
      this.camera.position.y = this.playerPos.y + (Math.random() - 0.5) * shakeAmt;
      this.camera.position.z = this.playerPos.z + (Math.random() - 0.5) * shakeAmt;
    } else {
      this.camera.position.copy(this.playerPos);
    }

    // Decay damage chromatic aberration intensity
    if (this.damageAberrationIntensity > 0) {
      this.damageAberrationIntensity = Math.max(
        0,
        this.damageAberrationIntensity - clampedDt * 2.2
      );
    }

    // Update screen-space red chromatic aberration uniforms
    if (this.aberrationPass) {
      let currentIntensity = this.damageAberrationIntensity;
      // Add pulsing heartbeat warning when health is critically low (< 30%)
      if (this.state === 'PLAYING' && this.stats.health > 0 && this.stats.health < 30) {
        const pulse = (Math.sin(now * 0.008) * 0.5 + 0.5) * ((30 - this.stats.health) / 30) * 0.38;
        currentIntensity = Math.max(currentIntensity, pulse);
      }
      this.aberrationPass.uniforms.uIntensity.value = currentIntensity;
      this.aberrationPass.uniforms.uRedBoost.value = currentIntensity;
      this.aberrationPass.uniforms.uTime.value = now * 0.001;
    }

    // Render frame (composer for screen-space post-processing, fallback to direct renderer in WebXR)
    if (this.renderer.xr.isPresenting) {
      this.renderer.render(this.scene, this.camera);
    } else {
      this.composer.render();
    }

    this.input.endFrame();

    // Loop scheduling
    if (this.renderer.xr.isPresenting) {
      // In WebXR, renderer.setAnimationLoop handles VR refresh
    } else {
      this.animationFrameId = requestAnimationFrame(this.tick);
    }
  }

  private updateTitleScreen(dt: number) {
    this.titleOrbitAngle += dt * 0.25;
    const orbitRadius = 14;
    this.camera.position.set(
      Math.sin(this.titleOrbitAngle) * orbitRadius,
      4.5 + Math.sin(this.titleOrbitAngle * 0.5) * 1.5,
      Math.cos(this.titleOrbitAngle) * orbitRadius
    );
    this.camera.lookAt(0, 1.8, 0);

    // Idle weapon floating
    this.firstPersonHands.visible = false;
    this.vrReticle.group.visible = false;

    // Animate Bikini Cyber Champions during Title Screen
    const time = performance.now() * 0.001;
    this.champions.forEach((c) => c.update(dt, time));
  }

  private updateGameplay(dt: number, realDt: number) {
    this.firstPersonHands.visible = !this.stats.isVrActive;
    this.vrReticle.group.visible = true;

    // Animate Bikini Cyber Champions & Beach Squad
    const time = performance.now() * 0.001;
    this.champions.forEach((c) => c.update(realDt, time));

    // Elena Perk: Solar Shield Passive Regeneration
    if (this.selectedChampion === 'ELENA' && this.stats.shield < this.stats.maxShield) {
      this.stats.shield = Math.min(this.stats.maxShield, this.stats.shield + 4.0 * dt);
    }

    // Reticle Raycast Targeting
    this.updateTargeting(dt);

    // Overdrive timer
    if (this.stats.isOverdriveActive > 0) {
      this.stats.isOverdriveActive -= realDt;
      if (this.stats.isOverdriveActive <= 0) {
        this.stats.isOverdriveActive = 0;
      }
      this.emitStats();
    }

    // Combo timer
    if (this.stats.combo > 0) {
      this.stats.comboTimer -= realDt;
      if (this.stats.comboTimer <= 0) {
        this.stats.combo = 0;
        this.emitStats();
      }
    }

    // Desktop Input controls (if not in WebXR)
    if (!this.stats.isVrActive) {
      this.handleDesktopInput(dt);
    }

    // Weapon animations
    this.updateWeapons(realDt);

    // Spawn Waves & Entities
    this.updateSpawning(dt);

    // Update Enemies
    this.updateEnemies(dt);

    // Update Projectiles
    this.updateProjectiles(dt);

    // Update Flying rhythm shards
    this.updateFlyingShards(dt);

    // Update Particles
    this.updateParticles(dt);
  }

  private updateTargeting(dt: number) {
    const rayOrigin = _v1;
    const rayDir = _v2;

    if (this.stats.isVrActive && this.xrController1) {
      this.xrController1.getWorldPosition(rayOrigin);
      this.xrController1.getWorldDirection(rayDir);
      rayDir.negate();
    } else {
      this.camera.getWorldPosition(rayOrigin);
      this.camera.getWorldDirection(rayDir);
    }

    // Raycast against active enemies
    let closestEnemy: EnemyEntity | null = null;
    let closestDist = Infinity;

    for (const enemy of this.enemies) {
      _v3.copy(enemy.position).sub(rayOrigin);
      const proj = _v3.dot(rayDir);
      if (proj > 0.8 && proj < 35) {
        const perpDistSq = _v3.lengthSq() - proj * proj;
        // Targeted tolerance: enemy radius + generous precision cone
        const targetRadius = enemy.radius + 0.45;
        if (perpDistSq < targetRadius * targetRadius) {
          if (proj < closestDist) {
            closestDist = proj;
            closestEnemy = enemy;
          }
        }
      }
    }

    // Also check flying rhythm shards
    let targetedShard = false;
    if (!closestEnemy) {
      for (const shard of this.flyingShards) {
        if (shard.hit) continue;
        _v3.copy(shard.position).sub(rayOrigin);
        const proj = _v3.dot(rayDir);
        if (proj > 0.8 && proj < 25) {
          const perpDistSq = _v3.lengthSq() - proj * proj;
          if (perpDistSq < 0.6) {
            if (proj < closestDist) {
              closestDist = proj;
              targetedShard = true;
            }
          }
        }
      }
    }

    const isLocked = closestEnemy !== null || targetedShard;

    if (isLocked) {
      if (!this.wasTargetingLastFrame) {
        sound.playTargetLock();
        this.wasTargetingLastFrame = true;
      }
      this.stats.isTargetingDrone = true;
      this.stats.targetedEnemyType = closestEnemy ? closestEnemy.type : null;
      this.stats.targetedDistance = closestDist;
    } else {
      this.wasTargetingLastFrame = false;
      this.stats.isTargetingDrone = false;
      this.stats.targetedEnemyType = null;
      this.stats.targetedDistance = 8.0;
    }

    // Update 3D VR Reticle in Three.js
    this.vrReticle.update(
      this.stats.isTargetingDrone,
      this.stats.targetedDistance,
      dt,
      this.reticleConfig
    );
  }

  private handleDesktopInput(dt: number) {
    // Escape: Pause
    if (this.input.wasKeyJustPressed('Escape')) {
      this.pauseGame();
      return;
    }

    // F: Overdrive
    if (this.input.wasKeyJustPressed('KeyF')) {
      this.triggerOverdrive();
    }

    // M: Mute
    if (this.input.wasKeyJustPressed('KeyM')) {
      sound.toggleMute();
    }

    // Mouse look
    const mouseSensitivity = 0.0022;
    this.cameraYaw -= this.input.mouseDeltaX * mouseSensitivity;
    this.cameraPitch -= this.input.mouseDeltaY * mouseSensitivity;
    this.cameraPitch = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, this.cameraPitch));

    this.camera.quaternion.setFromEuler(
      new THREE.Euler(this.cameraPitch, this.cameraYaw, 0, 'YXZ')
    );

    // Mouse clicks
    if (this.input.wasMouseJustPressed(0)) {
      this.triggerRightSwing();
    }

    // Right mouse button: Energy shield
    const rightMouseDown = this.input.isMouseDown(2);
    this.setShieldActive(rightMouseDown);

    // Movement: WASD
    _vForward.set(-Math.sin(this.cameraYaw), 0, -Math.cos(this.cameraYaw)).normalize();
    _vRight.set(Math.cos(this.cameraYaw), 0, -Math.sin(this.cameraYaw)).normalize();

    _v1.set(0, 0, 0);
    if (this.input.isKey('KeyW') || this.input.isKey('ArrowUp')) _v1.add(_vForward);
    if (this.input.isKey('KeyS') || this.input.isKey('ArrowDown')) _v1.sub(_vForward);
    if (this.input.isKey('KeyD') || this.input.isKey('ArrowRight')) _v1.add(_vRight);
    if (this.input.isKey('KeyA') || this.input.isKey('ArrowLeft')) _v1.sub(_vRight);

    // Mobile touch move
    if (this.input.touchMoveX !== 0 || this.input.touchMoveZ !== 0) {
      _v1.addScaledVector(_vRight, this.input.touchMoveX);
      _v1.addScaledVector(_vForward, -this.input.touchMoveZ);
    }

    if (_v1.lengthSq() > 0) {
      _v1.normalize();
      const speed = this.input.isKey('ShiftLeft') ? 9.0 : 6.0;
      this.playerPos.addScaledVector(_v1, speed * dt);

      // Arena boundary clamping (Hexagon radius ~14m)
      const distFromCenter = Math.hypot(this.playerPos.x, this.playerPos.z);
      if (distFromCenter > 13.5) {
        this.playerPos.x = (this.playerPos.x / distFromCenter) * 13.5;
        this.playerPos.z = (this.playerPos.z / distFromCenter) * 13.5;
      }
    }
  }

  private updateWeapons(dt: number) {
    // Right Saber Swing Animation
    if (this.isSwingingRight) {
      this.rightSwingTimer -= dt;
      const progress = 1 - Math.max(0, this.rightSwingTimer / 0.28);
      // Smooth slash arc
      const swingAngle = Math.sin(progress * Math.PI) * 1.5;
      this.rightSaber.group.position.set(0.32 - swingAngle * 0.2, -0.32 + swingAngle * 0.15, -0.45 - swingAngle * 0.1);
      this.rightSaber.group.rotation.set(-0.25 + swingAngle * 1.2, 0.15 - swingAngle * 0.8, -0.2 - swingAngle * 1.0);

      if (this.rightSwingTimer <= 0) {
        this.isSwingingRight = false;
        this.rightSaber.group.position.set(0.32, -0.32, -0.45);
        this.rightSaber.group.rotation.set(-0.25, 0.15, -0.2);
      }
    }

    // Shield pulse animation
    if (this.isShieldActive) {
      const pulse = 1.0 + Math.sin(performance.now() * 0.01) * 0.04;
      this.energyShield.group.scale.set(pulse, pulse, pulse);
    }
  }

  private updateSpawning(dt: number) {
    // Spawn rhythm data shards flying towards arena
    this.shardSpawnTimer -= dt;
    if (this.shardSpawnTimer <= 0) {
      this.shardSpawnTimer = 1.8 + Math.random() * 1.2;
      this.spawnDataShard();
    }

    // Wave enemies spawn
    if (this.enemiesRemainingToSpawn > 0) {
      this.waveSpawnTimer -= dt;
      if (this.waveSpawnTimer <= 0) {
        this.waveSpawnTimer = 2.2;
        this.spawnEnemy();
        this.enemiesRemainingToSpawn--;
      }
    }
  }

  private spawnDataShard() {
    const isCyan = Math.random() > 0.5;
    const color = isCyan ? 0x00f3ff : 0xff0055;
    const dirType = Math.random() > 0.5 ? 'HORIZONTAL' : 'VERTICAL';

    const group = createDataShard(color, dirType);
    const laneX = (Math.random() - 0.5) * 4;
    const startZ = -25;
    const startY = 1.4 + Math.random() * 0.8;

    group.position.set(laneX, startY, startZ);
    this.scene.add(group);

    this.flyingShards.push({
      id: Math.random().toString(36).substring(2, 9),
      mesh: group,
      position: group.position,
      velocity: new THREE.Vector3(0, 0, 9 + this.stats.wave * 1.2),
      sliceDirection: dirType,
      color,
      hit: false,
      radius: 0.5,
    });
  }

  private spawnEnemy() {
    const wave = this.stats.wave;
    const isBoss = wave >= 3 && this.enemiesRemainingToSpawn === 1 && !this.enemies.some((e) => e.type === 'SENTINEL_BOSS');
    const isStalker = !isBoss && wave >= 2 && Math.random() > 0.6;

    const angle = Math.random() * Math.PI * 2;
    const spawnDist = 12 + Math.random() * 4;
    const posX = Math.cos(angle) * spawnDist;
    const posZ = Math.sin(angle) * spawnDist;

    if (isBoss) {
      const boss = createSentinelBossModel();
      boss.group.position.set(0, 5, -12);
      this.scene.add(boss.group);

      this.enemies.push({
        id: Math.random().toString(36).substring(2, 9),
        type: 'SENTINEL_BOSS',
        mesh: boss.group,
        position: boss.group.position,
        velocity: new THREE.Vector3(),
        health: 350,
        maxHealth: 350,
        attackCooldown: 3.5,
        attackWindup: 0,
        isWindingUp: false,
        radius: 2.2,
        scoreValue: 1200,
      });
    } else if (isStalker) {
      const stalker = createStalkerModel();
      stalker.group.position.set(posX, 0, posZ);
      this.scene.add(stalker.group);

      this.enemies.push({
        id: Math.random().toString(36).substring(2, 9),
        type: 'STALKER',
        mesh: stalker.group,
        position: stalker.group.position,
        velocity: new THREE.Vector3(),
        health: 120,
        maxHealth: 120,
        attackCooldown: 2.5 + Math.random(),
        attackWindup: 0,
        isWindingUp: false,
        radius: 0.9,
        scoreValue: 400,
      });
    } else {
      const drone = createDroneModel();
      const droneY = 2.0 + Math.random() * 2.5;
      drone.group.position.set(posX, droneY, posZ);
      this.scene.add(drone.group);

      // Create aim telegraph laser line
      const laserGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, 10),
      ]);
      const laserMat = new THREE.LineBasicMaterial({
        color: 0xff0055,
        transparent: true,
        opacity: 0,
      });
      const aimLaser = new THREE.Line(laserGeo, laserMat);
      this.scene.add(aimLaser);

      this.enemies.push({
        id: Math.random().toString(36).substring(2, 9),
        type: 'DRONE',
        mesh: drone.group,
        position: drone.group.position,
        velocity: new THREE.Vector3(),
        health: 50,
        maxHealth: 50,
        attackCooldown: 2.0 + Math.random() * 2.0,
        attackWindup: 0,
        isWindingUp: false,
        aimLaserMesh: aimLaser,
        radius: 0.5,
        scoreValue: 200,
      });
    }
  }

  private updateEnemies(dt: number) {
    for (const enemy of this.enemies) {
      // Look at player
      enemy.mesh.lookAt(this.playerPos.x, enemy.position.y, this.playerPos.z);

      if (enemy.type === 'DRONE') {
        // Drone hovering motion & bobbing
        enemy.position.y += Math.sin(performance.now() * 0.003 + enemy.position.x) * 0.004;

        // Maintain distance of ~7m
        const distToPlayer = enemy.position.distanceTo(this.playerPos);
        if (distToPlayer > 8.0) {
          _v1.copy(this.playerPos).sub(enemy.position).normalize();
          enemy.position.addScaledVector(_v1, 2.2 * dt);
        } else if (distToPlayer < 5.0) {
          _v1.copy(enemy.position).sub(this.playerPos).normalize();
          enemy.position.addScaledVector(_v1, 2.0 * dt);
        }

        // Drone attack cycle: telegraph windup -> shoot laser projectile
        if (enemy.isWindingUp) {
          enemy.attackWindup -= dt;
          // Update targeting laser line
          if (enemy.aimLaserMesh) {
            enemy.aimLaserMesh.visible = true;
            (enemy.aimLaserMesh.material as THREE.LineBasicMaterial).opacity = 0.85;
            const positions = (enemy.aimLaserMesh.geometry as THREE.BufferGeometry).attributes.position;
            positions.setXYZ(0, enemy.position.x, enemy.position.y, enemy.position.z);
            positions.setXYZ(1, this.playerPos.x, this.playerPos.y, this.playerPos.z);
            positions.needsUpdate = true;
          }

          if (enemy.attackWindup <= 0) {
            enemy.isWindingUp = false;
            enemy.attackCooldown = 3.0 + Math.random();
            if (enemy.aimLaserMesh) {
              enemy.aimLaserMesh.visible = false;
            }
            this.fireEnemyProjectile(enemy.position, this.playerPos, 14, 0xff0055);
          }
        } else {
          enemy.attackCooldown -= dt;
          if (enemy.attackCooldown <= 0) {
            enemy.isWindingUp = true;
            enemy.attackWindup = 0.85; // 850ms visible windup telegraph!
          }
        }
      } else if (enemy.type === 'STALKER') {
        // Mech walks towards player
        const dist = enemy.position.distanceTo(this.playerPos);
        if (dist > 5) {
          _v1.copy(this.playerPos).sub(enemy.position).normalize();
          enemy.position.x += _v1.x * 2.5 * dt;
          enemy.position.z += _v1.z * 2.5 * dt;
        }

        enemy.attackCooldown -= dt;
        if (enemy.attackCooldown <= 0) {
          enemy.attackCooldown = 3.0;
          // Double cannon blast
          this.fireEnemyProjectile(enemy.position.clone().add(new THREE.Vector3(0.5, 1.2, 0)), this.playerPos, 16, 0xff9900);
          this.fireEnemyProjectile(enemy.position.clone().add(new THREE.Vector3(-0.5, 1.2, 0)), this.playerPos, 16, 0xff9900);
        }
      } else if (enemy.type === 'SENTINEL_BOSS') {
        // Boss spins rings
        enemy.mesh.rotation.y += dt * 0.8;
        enemy.attackCooldown -= dt;
        if (enemy.attackCooldown <= 0) {
          enemy.attackCooldown = 2.8;
          // Radial 3-way burst
          for (let i = -1; i <= 1; i++) {
            const spreadTarget = this.playerPos.clone().add(new THREE.Vector3(i * 2.5, 0, 0));
            this.fireEnemyProjectile(enemy.position, spreadTarget, 12, 0xff0055);
          }
        }
      }
    }
  }

  private fireEnemyProjectile(from: THREE.Vector3, to: THREE.Vector3, speed: number, colorHex: number) {
    sound.playLaserShot();

    const geo = new THREE.SphereGeometry(0.18, 12, 12);
    const mat = new THREE.MeshBasicMaterial({ color: colorHex });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(from);
    this.scene.add(mesh);

    const dir = new THREE.Vector3().copy(to).sub(from).normalize();

    this.projectiles.push({
      id: Math.random().toString(36).substring(2, 9),
      mesh,
      position: mesh.position,
      velocity: dir.multiplyScalar(speed),
      radius: 0.25,
      isDeflected: false,
      damage: 15,
      color: colorHex,
      life: 6.0,
    });
  }

  private updateProjectiles(dt: number) {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.position.addScaledVector(p.velocity, dt);
      p.life -= dt;

      // Check collision with player
      if (!p.isDeflected) {
        const distToPlayer = p.position.distanceTo(this.playerPos);
        if (distToPlayer < 0.9) {
          // Check if blocked by shield!
          if (this.isShieldActive) {
            // Deflected by shield
            p.isDeflected = true;
            p.velocity.negate().multiplyScalar(1.2);
            sound.playShieldBlock();
            this.addScore(100);
            this.spawnParticleBurst(p.position, 0x00f3ff, 12, 4);
            continue;
          }

          // Player hit!
          this.damagePlayer(p.damage);
          sound.playPlayerHurt();
          this.spawnParticleBurst(p.position, 0xff0055, 10, 4);
          this.addShake(0.4);

          this.scene.remove(p.mesh);
          this.projectiles.splice(i, 1);
          continue;
        }
      } else {
        // Deflected projectile hitting enemy
        for (const enemy of this.enemies) {
          if (p.position.distanceTo(enemy.position) < enemy.radius + p.radius) {
            enemy.health -= p.damage;
            sound.playSliceHit(true);
            this.spawnParticleBurst(p.position, 0x00f3ff, 18, 6);
            this.hitstopTimer = 0.05;

            if (enemy.health <= 0) {
              this.destroyEnemy(enemy);
            }

            this.scene.remove(p.mesh);
            this.projectiles.splice(i, 1);
            break;
          }
        }
      }

      // Expire old projectiles
      if (p.life <= 0) {
        this.scene.remove(p.mesh);
        this.projectiles.splice(i, 1);
      }
    }
  }

  private updateFlyingShards(dt: number) {
    for (let i = this.flyingShards.length - 1; i >= 0; i--) {
      const shard = this.flyingShards[i];
      shard.position.addScaledVector(shard.velocity, dt);
      shard.mesh.rotation.z += dt * 3;

      // Pass behind player without hit
      if (shard.position.z > this.playerPos.z + 4) {
        this.scene.remove(shard.mesh);
        this.flyingShards.splice(i, 1);
      }
    }
  }

  private updateParticles(dt: number) {
    for (const p of this.particlePool) {
      if (p.active) {
        p.life += dt;
        p.mesh.position.addScaledVector(p.velocity, dt);
        p.velocity.y -= 9.8 * dt * 0.4; // subtle gravity

        const alpha = 1 - p.life / p.maxLife;
        p.mesh.scale.set(alpha, alpha, alpha);

        if (p.life >= p.maxLife) {
          p.active = false;
          p.mesh.visible = false;
        }
      }
    }
  }

  // Screen-space red chromatic aberration trigger (public for testing or external events)
  public triggerDamageAberration(intensity = 0.8) {
    this.damageAberrationIntensity = Math.min(1.2, this.damageAberrationIntensity + intensity);
  }

  private damagePlayer(amount: number) {
    const shieldBefore = this.stats.shield;
    const healthBefore = this.stats.health;

    if (this.stats.shield > 0) {
      this.stats.shield = Math.max(0, this.stats.shield - amount);
    } else {
      this.stats.health = Math.max(0, this.stats.health - amount);
    }

    // Reset combo on hit
    this.stats.combo = 0;
    this.emitStats();

    // Screen-space red chromatic aberration effect:
    // Intensifies when the player takes damage, providing immediate visual feedback on health loss.
    // If shield was breached or direct health loss occurred, the chromatic aberration is extra pronounced!
    const directHealthLoss = healthBefore - this.stats.health;
    const shieldDmg = shieldBefore - this.stats.shield;
    const intensityKick = (directHealthLoss > 0)
      ? Math.min(1.0, 0.5 + (directHealthLoss / 20) * 0.5)
      : Math.min(0.65, 0.25 + (shieldDmg / 25) * 0.35);

    this.damageAberrationIntensity = Math.min(1.2, this.damageAberrationIntensity + intensityKick);

    if (this.stats.health <= 0) {
      this.state = 'GAMEOVER';
      this.input.exitPointerLock();
      this.onStateChange?.(this.state);
    }
  }

  private onResize() {
    if (!this.container) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
    if (this.composer) {
      this.composer.setSize(width, height);
      if (this.aberrationPass?.uniforms?.uResolution) {
        this.aberrationPass.uniforms.uResolution.value.set(width, height);
      }
    }
  }

  public dispose() {
    cancelAnimationFrame(this.animationFrameId);
    window.removeEventListener('resize', this.onResize);
    this.input.dispose();
    this.clearEntities();
    if (this.composer) {
      this.composer.dispose();
    }
    this.renderer.dispose();
  }
}
