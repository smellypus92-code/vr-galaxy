import * as THREE from 'three';
import type { ReticleConfig } from './types';

/**
 * Procedural textures and 3-12 part composite models for CyberStrike VR.
 * Conforms strictly to Three.js Craft & PBR standards:
 * - 3-12 distinct parts per subject
 * - Varied roughness and metalness
 * - Bottom-center/logical pivots
 * - 100% procedural textures (no external files)
 */

// Procedural grid canvas texture for floor and surfaces
export function createCyberGridTexture(primaryColor = '#00f3ff', gridColor = '#0b1d3a', bgColor = '#050a14'): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, size, size);

  // Sub-grid
  ctx.strokeStyle = gridColor;
  ctx.lineWidth = 1;
  const step = 32;
  for (let x = 0; x <= size; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, size);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, x);
    ctx.lineTo(size, x);
    ctx.stroke();
  }

  // Primary circuit lines
  ctx.strokeStyle = primaryColor;
  ctx.lineWidth = 3;
  ctx.shadowColor = primaryColor;
  ctx.shadowBlur = 8;
  for (let x = 0; x <= size; x += 128) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, size);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, x);
    ctx.lineTo(size, x);
    ctx.stroke();
  }

  // Micro nodes at intersections
  ctx.fillStyle = '#ffffff';
  for (let x = 0; x <= size; x += 128) {
    for (let y = 0; y <= size; y += 128) {
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Procedural normal map for brushed tech panels
export function createTechNormalTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Neutral normal color is rgb(128, 128, 255)
  ctx.fillStyle = 'rgb(128, 128, 255)';
  ctx.fillRect(0, 0, size, size);

  // Add bevels / indents
  ctx.fillStyle = 'rgb(160, 128, 240)';
  for (let i = 0; i < 4; i++) {
    const y = i * 64 + 16;
    ctx.fillRect(16, y, 224, 8);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

// -------------------------------------------------------------
// WEAPON 1: High-Tech Cyber Plasma Blade (Left / Right Saber)
// 6 Distinct Parts: Carbon grip, Emitter collar, Energy conduit,
// Power cell crystal, Inner plasma core, Outer glowing plasma blade
// -------------------------------------------------------------
export function createCyberSaber(bladeColorHex = 0x00f3ff): {
  group: THREE.Group;
  bladeMesh: THREE.Mesh;
  glowMesh: THREE.Mesh;
  light: THREE.PointLight;
} {
  const group = new THREE.Group();

  // 1. Carbon Grip (dark brushed metal)
  const gripGeo = new THREE.CylinderGeometry(0.022, 0.024, 0.22, 16);
  const gripMat = new THREE.MeshStandardMaterial({
    color: 0x1a202c,
    roughness: 0.35,
    metalness: 0.85,
  });
  const grip = new THREE.Mesh(gripGeo, gripMat);
  grip.position.y = 0.11;
  group.add(grip);

  // 2. Grip Ribs / Rings (Accent)
  const ribGeo = new THREE.TorusGeometry(0.025, 0.003, 8, 16);
  const ribMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    roughness: 0.2,
    metalness: 0.95,
  });
  for (let i = 0; i < 4; i++) {
    const rib = new THREE.Mesh(ribGeo, ribMat);
    rib.rotation.x = Math.PI / 2;
    rib.position.y = 0.05 + i * 0.04;
    group.add(rib);
  }

  // 3. Emitter Collar / Guard
  const collarGeo = new THREE.CylinderGeometry(0.032, 0.024, 0.06, 16);
  const collarMat = new THREE.MeshStandardMaterial({
    color: 0x475569,
    roughness: 0.15,
    metalness: 0.9,
  });
  const collar = new THREE.Mesh(collarGeo, collarMat);
  collar.position.y = 0.24;
  group.add(collar);

  // 4. Power Indicator Core (Emits light)
  const powerGeo = new THREE.SphereGeometry(0.012, 12, 12);
  const powerMat = new THREE.MeshBasicMaterial({ color: bladeColorHex });
  const powerCore = new THREE.Mesh(powerGeo, powerMat);
  powerCore.position.set(0, 0.16, 0.02);
  group.add(powerCore);

  // 5. Plasma Blade (Inner Core - Pure bright energy)
  const coreBladeGeo = new THREE.CylinderGeometry(0.014, 0.014, 0.95, 16);
  coreBladeGeo.translate(0, 0.475, 0); // pivot at base
  const coreBladeMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
  });
  const coreBlade = new THREE.Mesh(coreBladeGeo, coreBladeMat);
  coreBlade.position.y = 0.26;
  group.add(coreBlade);

  // 6. Plasma Blade (Outer Glow Sheath)
  const outerBladeGeo = new THREE.CylinderGeometry(0.03, 0.028, 0.97, 16);
  outerBladeGeo.translate(0, 0.485, 0);
  const outerBladeMat = new THREE.MeshStandardMaterial({
    color: bladeColorHex,
    emissive: bladeColorHex,
    emissiveIntensity: 0.85,
    transparent: true,
    opacity: 0.8,
    roughness: 0.1,
    metalness: 0.1,
  });
  const glowMesh = new THREE.Mesh(outerBladeGeo, outerBladeMat);
  glowMesh.position.y = 0.26;
  group.add(glowMesh);

  // Blade point light
  const light = new THREE.PointLight(bladeColorHex, 2.5, 4);
  light.position.y = 0.75;
  group.add(light);

  return { group, bladeMesh: coreBlade, glowMesh, light };
}

// -------------------------------------------------------------
// WEAPON 2: Energy Deflection Shield
// Holographic Hex Shield with rim generator and power core
// -------------------------------------------------------------
export function createEnergyShield(): {
  group: THREE.Group;
  shieldMesh: THREE.Mesh;
  glowRing: THREE.Mesh;
} {
  const group = new THREE.Group();

  // 1. Center Power Emitter Hub
  const hubGeo = new THREE.CylinderGeometry(0.06, 0.07, 0.04, 16);
  hubGeo.rotateX(Math.PI / 2);
  const hubMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.25,
    metalness: 0.9,
  });
  const hub = new THREE.Mesh(hubGeo, hubMat);
  group.add(hub);

  // 2. Center Plasma Core
  const coreGeo = new THREE.SphereGeometry(0.03, 16, 16);
  const coreMat = new THREE.MeshBasicMaterial({ color: 0x00f3ff });
  const core = new THREE.Mesh(coreGeo, coreMat);
  group.add(core);

  // 3. Hexagonal Holographic Barrier (Main Shield Face)
  const shieldGeo = new THREE.CircleGeometry(0.55, 6);
  const shieldMat = new THREE.MeshStandardMaterial({
    color: 0x00f3ff,
    emissive: 0x00a3ff,
    emissiveIntensity: 0.5,
    transparent: true,
    opacity: 0.4,
    side: THREE.DoubleSide,
    roughness: 0.1,
    metalness: 0.1,
  });
  const shieldMesh = new THREE.Mesh(shieldGeo, shieldMat);
  group.add(shieldMesh);

  // 4. Perimeter Hex Border Frame
  const ringGeo = new THREE.RingGeometry(0.53, 0.57, 6);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    side: THREE.DoubleSide,
  });
  const glowRing = new THREE.Mesh(ringGeo, ringMat);
  glowRing.position.z = 0.005;
  group.add(glowRing);

  return { group, shieldMesh, glowRing };
}

// -------------------------------------------------------------
// ENEMY 1: Cyber Drone (Recon Scout)
// 6 Distinct Parts:
// 1. Central Core Sphere
// 2. Glowing Optic Eye
// 3. Outer Counter-Rotating Gyro Ring
// 4. Inner Gyro Ring
// 5. 3x Aerodynamic Thruster Fins
// 6. Plasma Jet Glow
// -------------------------------------------------------------
export function createDroneModel(): {
  group: THREE.Group;
  opticEye: THREE.Mesh;
  outerRing: THREE.Mesh;
  innerRing: THREE.Mesh;
  thrusterGlow: THREE.Mesh;
} {
  const group = new THREE.Group();

  // 1. Central Core Sphere (dark chrome)
  const coreGeo = new THREE.SphereGeometry(0.25, 20, 20);
  const coreMat = new THREE.MeshStandardMaterial({
    color: 0x111827,
    roughness: 0.2,
    metalness: 0.9,
  });
  const core = new THREE.Mesh(coreGeo, coreMat);
  group.add(core);

  // 2. Glowing Optic Eye
  const eyeGeo = new THREE.SphereGeometry(0.09, 16, 16);
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0x00f3ff }); // switches to red on attack
  const opticEye = new THREE.Mesh(eyeGeo, eyeMat);
  opticEye.position.set(0, 0, 0.22);
  group.add(opticEye);

  // 3. Outer Gyro Ring (accent metallic)
  const outerRingGeo = new THREE.TorusGeometry(0.42, 0.02, 12, 32);
  const ringMat = new THREE.MeshStandardMaterial({
    color: 0x3b82f6,
    emissive: 0x1d4ed8,
    emissiveIntensity: 0.3,
    roughness: 0.3,
    metalness: 0.8,
  });
  const outerRing = new THREE.Mesh(outerRingGeo, ringMat);
  group.add(outerRing);

  // 4. Inner Gyro Ring
  const innerRingGeo = new THREE.TorusGeometry(0.32, 0.015, 12, 28);
  const innerRingMat = new THREE.MeshStandardMaterial({
    color: 0x06b6d4,
    roughness: 0.2,
    metalness: 0.9,
  });
  const innerRing = new THREE.Mesh(innerRingGeo, innerRingMat);
  innerRing.rotation.x = Math.PI / 4;
  group.add(innerRing);

  // 5. 3x Stabilizing Thruster Fins
  const finGeo = new THREE.BoxGeometry(0.03, 0.35, 0.12);
  const finMat = new THREE.MeshStandardMaterial({
    color: 0x1f2937,
    roughness: 0.4,
    metalness: 0.7,
  });
  for (let i = 0; i < 3; i++) {
    const angle = (i * Math.PI * 2) / 3;
    const fin = new THREE.Mesh(finGeo, finMat);
    fin.position.set(Math.cos(angle) * 0.35, Math.sin(angle) * 0.35, -0.05);
    fin.rotation.z = angle;
    group.add(fin);
  }

  // 6. Plasma Jet Exhaust
  const jetGeo = new THREE.ConeGeometry(0.08, 0.25, 12);
  jetGeo.rotateX(Math.PI / 2);
  const jetMat = new THREE.MeshBasicMaterial({
    color: 0x00f3ff,
    transparent: true,
    opacity: 0.8,
  });
  const thrusterGlow = new THREE.Mesh(jetGeo, jetMat);
  thrusterGlow.position.z = -0.3;
  group.add(thrusterGlow);

  return { group, opticEye, outerRing, innerRing, thrusterGlow };
}

// -------------------------------------------------------------
// ENEMY 2: Heavy Mech Stalker (Assault Unit)
// 8 Distinct Parts:
// 1. Heavy Armored Torso / Cabin
// 2. Head Sensor Array
// 3. Left Shoulder Cannon
// 4. Right Shoulder Cannon
// 5. Left Articulated Leg Upper & Lower
// 6. Right Articulated Leg Upper & Lower
// 7. Stabilizer Feet Pads
// 8. Plasma Vents
// -------------------------------------------------------------
export function createStalkerModel(): {
  group: THREE.Group;
  leftCannon: THREE.Mesh;
  rightCannon: THREE.Mesh;
  sensorEye: THREE.Mesh;
  torso: THREE.Mesh;
  legLeft: THREE.Group;
  legRight: THREE.Group;
} {
  const group = new THREE.Group();

  // 1. Heavy Torso
  const torsoGeo = new THREE.BoxGeometry(0.8, 0.6, 0.7);
  const torsoMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.3,
    metalness: 0.85,
  });
  const torso = new THREE.Mesh(torsoGeo, torsoMat);
  torso.position.y = 1.1;
  group.add(torso);

  // 2. Sensor Eye / Visor
  const sensorGeo = new THREE.BoxGeometry(0.4, 0.1, 0.1);
  const sensorMat = new THREE.MeshBasicMaterial({ color: 0xff0055 });
  const sensorEye = new THREE.Mesh(sensorGeo, sensorMat);
  sensorEye.position.set(0, 1.25, 0.36);
  group.add(sensorEye);

  // 3. Shoulders & Heavy Twin Cannons
  const cannonGeo = new THREE.CylinderGeometry(0.07, 0.08, 0.65, 12);
  cannonGeo.rotateX(Math.PI / 2);
  const cannonMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    roughness: 0.2,
    metalness: 0.95,
  });
  const leftCannon = new THREE.Mesh(cannonGeo, cannonMat);
  leftCannon.position.set(-0.55, 1.25, 0.2);
  group.add(leftCannon);

  const rightCannon = new THREE.Mesh(cannonGeo, cannonMat);
  rightCannon.position.set(0.55, 1.25, 0.2);
  group.add(rightCannon);

  // 4. Articulated Legs (Left & Right)
  const legMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.45,
    metalness: 0.7,
  });
  const jointMat = new THREE.MeshStandardMaterial({
    color: 0x64748b,
    roughness: 0.2,
    metalness: 0.9,
  });

  function createLeg(isLeft: boolean): THREE.Group {
    const leg = new THREE.Group();
    const sign = isLeft ? -1 : 1;

    // Hip Joint
    const hip = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), jointMat);
    leg.add(hip);

    // Upper Thigh
    const thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.08, 0.55, 10), legMat);
    thigh.position.set(sign * 0.1, -0.28, -0.05);
    thigh.rotation.z = sign * 0.2;
    leg.add(thigh);

    // Knee Joint
    const knee = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 10), jointMat);
    knee.position.set(sign * 0.2, -0.55, -0.1);
    leg.add(knee);

    // Shin
    const shin = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.09, 0.6, 10), legMat);
    shin.position.set(sign * 0.15, -0.85, 0.05);
    leg.add(shin);

    // Foot Pad
    const foot = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.08, 0.4), jointMat);
    foot.position.set(sign * 0.15, -1.15, 0.1);
    leg.add(foot);

    return leg;
  }

  const legLeft = createLeg(true);
  legLeft.position.set(-0.35, 1.15, 0);
  group.add(legLeft);

  const legRight = createLeg(false);
  legRight.position.set(0.35, 1.15, 0);
  group.add(legRight);

  return { group, leftCannon, rightCannon, sensorEye, torso, legLeft, legRight };
}

// -------------------------------------------------------------
// ENEMY 3: Chrono Sentinel Boss (Colossal Rotating Core)
// 10 Distinct Parts:
// 1. Floating Segmented Octahedral Core
// 2. Outer Rotating Halo Ring
// 3. Middle Gyro Armature
// 4. 4x Orbiting Defense Shards
// 5. Heavy Concentrator Emitters
// -------------------------------------------------------------
export function createSentinelBossModel(): {
  group: THREE.Group;
  core: THREE.Mesh;
  haloRing: THREE.Mesh;
  middleRing: THREE.Mesh;
  shields: THREE.Group;
} {
  const group = new THREE.Group();

  // 1. Exposed Glowing Crystalline Core
  const coreGeo = new THREE.OctahedronGeometry(0.9, 2);
  const coreMat = new THREE.MeshStandardMaterial({
    color: 0xff0055,
    emissive: 0x990022,
    emissiveIntensity: 0.8,
    roughness: 0.1,
    metalness: 0.2,
  });
  const core = new THREE.Mesh(coreGeo, coreMat);
  group.add(core);

  // 2. Large Outer Halo Ring
  const haloGeo = new THREE.TorusGeometry(2.2, 0.08, 16, 48);
  const ringMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    emissive: 0x0ea5e9,
    emissiveIntensity: 0.4,
    roughness: 0.2,
    metalness: 0.9,
  });
  const haloRing = new THREE.Mesh(haloGeo, ringMat);
  group.add(haloRing);

  // 3. Middle Gyro Ring (counter-rotating)
  const midGeo = new THREE.TorusGeometry(1.6, 0.06, 12, 36);
  const midMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    emissive: 0xff0055,
    emissiveIntensity: 0.3,
    roughness: 0.25,
    metalness: 0.9,
  });
  const middleRing = new THREE.Mesh(midGeo, midMat);
  middleRing.rotation.x = Math.PI / 3;
  group.add(middleRing);

  // 4. 4x Orbiting Hex Defense Shields
  const shields = new THREE.Group();
  const shieldGeo = new THREE.CircleGeometry(0.4, 6);
  const shieldMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 0.6,
    transparent: true,
    opacity: 0.7,
    side: THREE.DoubleSide,
  });
  for (let i = 0; i < 4; i++) {
    const angle = (i * Math.PI * 2) / 4;
    const shield = new THREE.Mesh(shieldGeo, shieldMat);
    shield.position.set(Math.cos(angle) * 1.8, Math.sin(angle) * 1.8, 0);
    shields.add(shield);
  }
  group.add(shields);

  return { group, core, haloRing, middleRing, shields };
}

// -------------------------------------------------------------
// RHYTHM DATA SHARD (Sliceable flying energy target)
// -------------------------------------------------------------
export function createDataShard(colorHex = 0x00f3ff, direction: 'ANY' | 'HORIZONTAL' | 'VERTICAL' = 'ANY'): THREE.Group {
  const group = new THREE.Group();

  // Crystal Core
  const shardGeo = new THREE.ConeGeometry(0.2, 0.45, 4);
  shardGeo.rotateX(Math.PI / 2);
  const shardMat = new THREE.MeshStandardMaterial({
    color: colorHex,
    emissive: colorHex,
    emissiveIntensity: 0.6,
    roughness: 0.1,
    metalness: 0.2,
  });
  const top = new THREE.Mesh(shardGeo, shardMat);
  group.add(top);

  const bottomGeo = new THREE.ConeGeometry(0.2, 0.45, 4);
  bottomGeo.rotateX(-Math.PI / 2);
  const bottom = new THREE.Mesh(bottomGeo, shardMat);
  group.add(bottom);

  // Direction indicator chevron arrow
  if (direction !== 'ANY') {
    const chevronGeo = new THREE.TorusGeometry(0.24, 0.02, 6, 12, Math.PI);
    const chevronMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const chevron = new THREE.Mesh(chevronGeo, chevronMat);
    if (direction === 'HORIZONTAL') {
      chevron.rotation.z = Math.PI / 2;
    }
    chevron.position.z = 0.25;
    group.add(chevron);
  }

  return group;
}

// -------------------------------------------------------------
// CYBER ARENA ENVIRONMENT
// Elevated hexagonal arena platform, perimeter pylons,
// infinite cyber-grid floor, and horizon fog
// -------------------------------------------------------------
export function createCyberArena(scene: THREE.Scene): {
  platform: THREE.Mesh;
  pylons: THREE.Group;
  gridFloor: THREE.Mesh;
} {
  const gridTexture = createCyberGridTexture('#00f3ff', '#0f2942', '#030712');
  gridTexture.repeat.set(40, 40);

  // 1. Distant Infinite Cyber Grid
  const gridFloorGeo = new THREE.PlaneGeometry(300, 300);
  gridFloorGeo.rotateX(-Math.PI / 2);
  const gridFloorMat = new THREE.MeshBasicMaterial({
    map: gridTexture,
    transparent: true,
    opacity: 0.65,
  });
  const gridFloor = new THREE.Mesh(gridFloorGeo, gridFloorMat);
  gridFloor.position.y = -8;
  scene.add(gridFloor);

  // 2. Elevated Main Hexagonal Combat Platform (Radius ~16m)
  const hexTexture = createCyberGridTexture('#00f3ff', '#1e293b', '#0a0f1d');
  hexTexture.repeat.set(4, 4);

  const platformGeo = new THREE.CylinderGeometry(15, 16, 1.2, 6);
  const platformMat = new THREE.MeshStandardMaterial({
    map: hexTexture,
    roughness: 0.35,
    metalness: 0.85,
  });
  const platform = new THREE.Mesh(platformGeo, platformMat);
  platform.position.y = -0.6; // Top of platform sits at y = 0
  platform.receiveShadow = true;
  scene.add(platform);

  // Platform Glowing Rim
  const rimGeo = new THREE.RingGeometry(14.8, 15.2, 6);
  rimGeo.rotateX(-Math.PI / 2);
  const rimMat = new THREE.MeshBasicMaterial({
    color: 0x00f3ff,
    side: THREE.DoubleSide,
  });
  const rim = new THREE.Mesh(rimGeo, rimMat);
  rim.position.y = 0.01;
  platform.add(rim);

  // 3. Perimeter Energy Pylons at the 6 vertices of the hexagon
  const pylons = new THREE.Group();
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI * 2) / 6;
    const px = Math.cos(angle) * 15;
    const pz = Math.sin(angle) * 15;

    const pylonGroup = new THREE.Group();
    pylonGroup.position.set(px, 0, pz);

    // Pylon Column Base
    const baseMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.6, 0.8, 0.8, 8),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3, metalness: 0.9 })
    );
    baseMesh.position.y = 0.4;
    pylonGroup.add(baseMesh);

    // Vertical Pylon Column
    const colMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, 6.0, 0.4),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2, metalness: 0.95 })
    );
    colMesh.position.y = 3.4;
    pylonGroup.add(colMesh);

    // Glowing Neon Vertical Conduit
    const conduitMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 5.5, 0.45),
      new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? 0x00f3ff : 0xff0055 })
    );
    conduitMesh.position.y = 3.4;
    pylonGroup.add(conduitMesh);

    // Crown Energy Emitter
    const crown = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.4, 0),
      new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? 0x00f3ff : 0xff0055 })
    );
    crown.position.y = 6.6;
    pylonGroup.add(crown);

    // Point Light from Crown
    const pLight = new THREE.PointLight(i % 2 === 0 ? 0x00f3ff : 0xff0055, 1.8, 12);
    pLight.position.y = 6.6;
    pylonGroup.add(pLight);

    pylons.add(pylonGroup);
  }
  scene.add(pylons);

  // 4. Distant Cyber Monoliths / Holographic Towers
  const monoliths = new THREE.Group();
  for (let i = 0; i < 24; i++) {
    const angle = (i * Math.PI * 2) / 24;
    const dist = 55 + (i % 5) * 15;
    const height = 30 + (i % 7) * 20;
    const width = 6 + (i % 3) * 4;

    const monoMesh = new THREE.Mesh(
      new THREE.BoxGeometry(width, height, width),
      new THREE.MeshStandardMaterial({
        color: 0x0a101f,
        roughness: 0.4,
        metalness: 0.8,
      })
    );
    monoMesh.position.set(Math.cos(angle) * dist, height / 2 - 8, Math.sin(angle) * dist);
    monoliths.add(monoMesh);

    // Monolith glowing top beacon
    const beacon = new THREE.Mesh(
      new THREE.BoxGeometry(width * 0.9, 1.5, width * 0.9),
      new THREE.MeshBasicMaterial({ color: i % 3 === 0 ? 0x00f3ff : 0xff0055 })
    );
    beacon.position.set(Math.cos(angle) * dist, height - 7.5, Math.sin(angle) * dist);
    monoliths.add(beacon);
  }
  scene.add(monoliths);

  return { platform, pylons, gridFloor };
}

// -------------------------------------------------------------
// 3D VR HOLOGRAPHIC RETICLE & TARGET LOCK SYSTEM
// -------------------------------------------------------------
export function createVrReticle(config: ReticleConfig): {
  group: THREE.Group;
  materials: THREE.Material[];
  bracketGroup: THREE.Group;
  laserBeam: THREE.Line;
  update: (isTargetingDrone: boolean, distance: number, dt: number, cfg: ReticleConfig) => void;
  rebuildStyle: (cfg: ReticleConfig) => void;
} {
  const group = new THREE.Group();
  const materials: (THREE.MeshBasicMaterial | THREE.LineBasicMaterial)[] = [];

  // Helper to register material for dynamic color updating
  function makeMat(colorStr: string, opacity = 0.85): THREE.MeshBasicMaterial {
    const mat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(colorStr),
      transparent: true,
      opacity,
      depthTest: false,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    materials.push(mat);
    return mat;
  }

  // Laser beam connecting controller to target point
  const laserGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, -10),
  ]);
  const laserMat = new THREE.LineBasicMaterial({
    color: new THREE.Color(config.idleColor),
    transparent: true,
    opacity: config.showLaserPointer ? 0.35 : 0.0,
    depthWrite: false,
  });
  materials.push(laserMat);
  const laserBeam = new THREE.Line(laserGeo, laserMat);
  laserBeam.renderOrder = 998;
  group.add(laserBeam);

  // Reticle head container (placed at target distance)
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 0, -6);
  group.add(headGroup);

  // Central precise dot
  const centerDotGeo = new THREE.CircleGeometry(0.015, 16);
  const centerDotMat = makeMat(config.idleColor, 0.95);
  const centerDot = new THREE.Mesh(centerDotGeo, centerDotMat);
  centerDot.renderOrder = 999;
  headGroup.add(centerDot);

  // Style container
  const styleGroup = new THREE.Group();
  headGroup.add(styleGroup);

  // 4 Corner Lock-On Brackets (clamp inward when targeting drone)
  const bracketGroup = new THREE.Group();
  headGroup.add(bracketGroup);

  function buildBrackets(colorStr: string) {
    while (bracketGroup.children.length > 0) {
      bracketGroup.remove(bracketGroup.children[0]);
    }
    const bMat = makeMat(colorStr, 0.9);
    const armLen = 0.06;
    const offset = 0.16;

    // 4 brackets [ ] around reticle
    const corners = [
      { x: -offset, y: offset, rot: 0 },
      { x: offset, y: offset, rot: -Math.PI / 2 },
      { x: offset, y: -offset, rot: Math.PI },
      { x: -offset, y: -offset, rot: Math.PI / 2 },
    ];

    corners.forEach((c) => {
      const bGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, -armLen, 0),
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(armLen, 0, 0),
      ]);
      const bracketLine = new THREE.Line(bGeo, bMat);
      bracketLine.position.set(c.x, c.y, 0);
      bracketLine.rotation.z = c.rot;
      bracketLine.renderOrder = 999;
      bracketGroup.add(bracketLine);
    });
  }

  function buildStyleMesh(cfg: ReticleConfig) {
    while (styleGroup.children.length > 0) {
      styleGroup.remove(styleGroup.children[0]);
    }

    const sMat = makeMat(cfg.idleColor, 0.8);

    if (cfg.style === 'CYBER_RING') {
      // Outer segmented ring
      const ringGeo = new THREE.RingGeometry(0.09, 0.105, 32);
      const ring = new THREE.Mesh(ringGeo, sMat);
      ring.renderOrder = 999;
      styleGroup.add(ring);

      // 4 Cardinal ticks
      for (let i = 0; i < 4; i++) {
        const tickGeo = new THREE.PlaneGeometry(0.008, 0.04);
        const tick = new THREE.Mesh(tickGeo, sMat);
        const angle = (i * Math.PI) / 2;
        tick.position.set(Math.cos(angle) * 0.125, Math.sin(angle) * 0.125, 0);
        tick.rotation.z = angle + Math.PI / 2;
        tick.renderOrder = 999;
        styleGroup.add(tick);
      }
    } else if (cfg.style === 'TACTICAL_CROSS') {
      // Hairlines with center opening
      for (let i = 0; i < 4; i++) {
        const lineGeo = new THREE.PlaneGeometry(0.006, 0.08);
        const line = new THREE.Mesh(lineGeo, sMat);
        const angle = (i * Math.PI) / 2;
        line.position.set(Math.cos(angle) * 0.08, Math.sin(angle) * 0.08, 0);
        line.rotation.z = angle + Math.PI / 2;
        line.renderOrder = 999;
        styleGroup.add(line);
      }
      // Small enclosing circle
      const circGeo = new THREE.RingGeometry(0.05, 0.058, 24);
      const circ = new THREE.Mesh(circGeo, sMat);
      circ.renderOrder = 999;
      styleGroup.add(circ);
    } else if (cfg.style === 'TRI_CHEVRON') {
      // 3 Inward Pointing Chevrons at 120 degrees
      for (let i = 0; i < 3; i++) {
        const angle = (i * Math.PI * 2) / 3 - Math.PI / 2;
        const chevGeo = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(-0.035, 0.035, 0),
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(0.035, 0.035, 0),
        ]);
        const chev = new THREE.Line(chevGeo, sMat);
        chev.position.set(Math.cos(angle) * 0.1, Math.sin(angle) * 0.1, 0);
        chev.rotation.z = angle - Math.PI / 2;
        chev.renderOrder = 999;
        styleGroup.add(chev);
      }
    } else if (cfg.style === 'DIAMOND') {
      // Rotated square / diamond outline
      const diamondGeo = new THREE.RingGeometry(0.09, 0.102, 4);
      diamondGeo.rotateZ(Math.PI / 4);
      const diamond = new THREE.Mesh(diamondGeo, sMat);
      diamond.renderOrder = 999;
      styleGroup.add(diamond);

      // Inner subtle diamond
      const innerDiamondGeo = new THREE.RingGeometry(0.045, 0.052, 4);
      innerDiamondGeo.rotateZ(Math.PI / 4);
      const innerDiamond = new THREE.Mesh(innerDiamondGeo, sMat);
      innerDiamond.renderOrder = 999;
      styleGroup.add(innerDiamond);
    }

    buildBrackets(cfg.idleColor);
  }

  buildStyleMesh(config);

  // Dynamic animation and color update
  let currentTargetMix = 0;
  const idleCol = new THREE.Color(config.idleColor);
  const targetCol = new THREE.Color(config.targetColor);
  const tempCol = new THREE.Color();

  function update(isTargetingDrone: boolean, distance: number, dt: number, cfg: ReticleConfig) {
    // Interpolate target lock factor smoothly
    const targetMix = isTargetingDrone ? 1 : 0;
    currentTargetMix += (targetMix - currentTargetMix) * Math.min(1, dt * 14);

    // Update color
    idleCol.set(cfg.idleColor);
    targetCol.set(cfg.targetColor);
    tempCol.copy(idleCol).lerp(targetCol, currentTargetMix);

    materials.forEach((m) => {
      (m as THREE.MeshBasicMaterial).color.copy(tempCol);
    });

    // Update laser pointer visibility
    laserMat.opacity = cfg.showLaserPointer ? (isTargetingDrone ? 0.65 : 0.35) : 0.0;

    // Position headGroup along Ray at target distance (clamped 1.5m to 25m)
    const clampedDist = Math.max(1.8, Math.min(distance, 22));
    headGroup.position.z = -clampedDist;

    // Maintain apparent angular size regardless of distance
    const angularScale = (clampedDist / 6.0) * cfg.size;
    headGroup.scale.set(angularScale, angularScale, angularScale);

    // Update laser geometry length to reach reticle head
    const positions = (laserBeam.geometry as THREE.BufferGeometry).attributes.position;
    positions.setXYZ(1, 0, 0, -clampedDist);
    positions.needsUpdate = true;

    // Bracket clamping & pulse animation on lock
    if (isTargetingDrone) {
      // Clamps inward towards center and pulses
      const pulse = 1.0 + Math.sin(performance.now() * 0.015) * 0.08;
      bracketGroup.scale.set(0.85 * pulse, 0.85 * pulse, 1);
      styleGroup.rotation.z += dt * 2.2;
    } else {
      bracketGroup.scale.set(1.0, 1.0, 1);
      styleGroup.rotation.z += dt * 0.4;
    }
  }

  return {
    group,
    materials,
    bracketGroup,
    laserBeam,
    update,
    rebuildStyle: buildStyleMesh,
  };
}

// -------------------------------------------------------------
// BIKINI CYBER CHAMPION (3-12 Part Composite Procedural Model)
// Animated beach co-pilot / champion with neon swimwear
// -------------------------------------------------------------
export type ChampionId = 'ELENA' | 'MAYA' | 'NYX';

export interface ChampionConfig {
  id: ChampionId;
  name: string;
  title: string;
  perkDescription: string;
  hairColor: number;
  bikiniColor: number;
  trimColor: number;
  skinColor: number;
}

export const CHAMPIONS: Record<ChampionId, ChampionConfig> = {
  ELENA: {
    id: 'ELENA',
    name: 'Elena "Solar Blade"',
    title: 'Solar Champion',
    perkDescription: '+20% Shield Regeneration & Solar Vitality',
    hairColor: 0xf59e0b, // Golden blonde
    bikiniColor: 0xf59e0b, // Neon Solar Gold
    trimColor: 0xffffff,
    skinColor: 0xe0a980,
  },
  MAYA: {
    id: 'MAYA',
    name: 'Maya "Wave Striker"',
    title: 'Tropical Ace',
    perkDescription: '+15% Overdrive Chrono Gain on Slices',
    hairColor: 0x06b6d4, // Cyan blue
    bikiniColor: 0x00f3ff, // Neon Tropical Cyan
    trimColor: 0x38bdf8,
    skinColor: 0xd49b75,
  },
  NYX: {
    id: 'NYX',
    name: 'Nyx "Neon Pulse"',
    title: 'Cyber Siren',
    perkDescription: 'Extended Precision Guided Slicing Reach',
    hairColor: 0xd946ef, // Vivid magenta
    bikiniColor: 0xff0055, // Laser Pink
    trimColor: 0xa855f7,
    skinColor: 0xc88f6b,
  },
};

export function createBikiniChampionModel(cfg: ChampionConfig): {
  group: THREE.Group;
  rightArm: THREE.Group;
  head: THREE.Group;
  cheer: () => void;
  update: (dt: number, time: number) => void;
} {
  const group = new THREE.Group();

  const skinMat = new THREE.MeshStandardMaterial({
    color: cfg.skinColor,
    roughness: 0.5,
    metalness: 0.1,
  });

  const bikiniMat = new THREE.MeshStandardMaterial({
    color: cfg.bikiniColor,
    emissive: cfg.bikiniColor,
    emissiveIntensity: 0.45,
    roughness: 0.25,
    metalness: 0.3,
  });

  const hairMat = new THREE.MeshStandardMaterial({
    color: cfg.hairColor,
    roughness: 0.35,
    metalness: 0.2,
  });

  const metalMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    roughness: 0.15,
    metalness: 0.9,
  });

  // 1. Torso & Midriff
  const torso = new THREE.Group();
  const upperTorsoGeo = new THREE.CylinderGeometry(0.18, 0.14, 0.28, 12);
  const upperTorso = new THREE.Mesh(upperTorsoGeo, skinMat);
  upperTorso.position.y = 1.25;
  torso.add(upperTorso);

  const waistGeo = new THREE.CylinderGeometry(0.14, 0.17, 0.22, 12);
  const waist = new THREE.Mesh(waistGeo, skinMat);
  waist.position.y = 1.02;
  torso.add(waist);
  group.add(torso);

  // 2. Neon Bikini Top (Cups + Straps)
  const cupGeo = new THREE.SphereGeometry(0.08, 12, 12);
  const leftCup = new THREE.Mesh(cupGeo, bikiniMat);
  leftCup.position.set(-0.08, 1.25, 0.12);
  torso.add(leftCup);

  const rightCup = new THREE.Mesh(cupGeo, bikiniMat);
  rightCup.position.set(0.08, 1.25, 0.12);
  torso.add(rightCup);

  // Metallic Center Ring Clasp
  const claspGeo = new THREE.TorusGeometry(0.02, 0.005, 8, 16);
  const clasp = new THREE.Mesh(claspGeo, metalMat);
  clasp.position.set(0, 1.25, 0.16);
  torso.add(clasp);

  // 3. Neon Bikini Bottom (Hips + Side Straps)
  const bottomGeo = new THREE.CylinderGeometry(0.175, 0.15, 0.14, 12);
  const bottom = new THREE.Mesh(bottomGeo, bikiniMat);
  bottom.position.y = 0.92;
  torso.add(bottom);

  // 4. Head, Sunglasses & Ponytail
  const head = new THREE.Group();
  head.position.y = 1.52;

  // Head sphere
  const headGeo = new THREE.SphereGeometry(0.12, 16, 16);
  const headMesh = new THREE.Mesh(headGeo, skinMat);
  head.add(headMesh);

  // Beach Cyber Sunglasses / Visor
  const glassesGeo = new THREE.BoxGeometry(0.18, 0.04, 0.06);
  const glassesMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    emissive: cfg.trimColor,
    emissiveIntensity: 0.6,
    roughness: 0.1,
    metalness: 0.9,
  });
  const glasses = new THREE.Mesh(glassesGeo, glassesMat);
  glasses.position.set(0, 0.02, 0.11);
  head.add(glasses);

  // Hair Base & High Ponytail
  const hairBaseGeo = new THREE.SphereGeometry(0.13, 14, 14);
  const hairBase = new THREE.Mesh(hairBaseGeo, hairMat);
  hairBase.position.set(0, 0.04, -0.02);
  head.add(hairBase);

  // Ponytail Tail
  const ponyGeo = new THREE.ConeGeometry(0.07, 0.35, 10);
  ponyGeo.rotateX(-Math.PI / 3);
  const ponytail = new THREE.Mesh(ponyGeo, hairMat);
  ponytail.position.set(0, 0.1, -0.22);
  head.add(ponytail);

  group.add(head);

  // 5. Left Arm (Resting on Hip)
  const leftArm = new THREE.Group();
  leftArm.position.set(-0.22, 1.34, 0);
  const leftUpperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.035, 0.32, 10), skinMat);
  leftUpperArm.position.set(-0.06, -0.14, 0.04);
  leftUpperArm.rotation.z = 0.35;
  leftArm.add(leftUpperArm);

  const leftForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.03, 0.3, 10), skinMat);
  leftForearm.position.set(-0.08, -0.38, 0.08);
  leftForearm.rotation.z = -0.4;
  leftArm.add(leftForearm);
  group.add(leftArm);

  // 6. Right Arm (Animated Wave & Cheer)
  const rightArm = new THREE.Group();
  rightArm.position.set(0.22, 1.34, 0);
  const rightUpperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.035, 0.32, 10), skinMat);
  rightUpperArm.position.set(0.08, -0.06, 0.04);
  rightUpperArm.rotation.z = -1.2;
  rightArm.add(rightUpperArm);

  const rightForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.03, 0.3, 10), skinMat);
  rightForearm.position.set(0.24, 0.12, 0.06);
  rightForearm.rotation.z = -0.5;
  rightArm.add(rightForearm);

  // Hand with cyber beach bracelet
  const bracelet = new THREE.Mesh(new THREE.TorusGeometry(0.04, 0.01, 8, 16), bikiniMat);
  bracelet.position.set(0.35, 0.25, 0.06);
  rightArm.add(bracelet);

  group.add(rightArm);

  // 7. Legs (Athletic & Grounded)
  const legMat = skinMat;
  function createLeg(isLeft: boolean): THREE.Group {
    const leg = new THREE.Group();
    const sign = isLeft ? -1 : 1;
    // Thigh
    const thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.06, 0.44, 12), legMat);
    thigh.position.set(sign * 0.09, 0.65, 0);
    thigh.rotation.z = sign * 0.05;
    leg.add(thigh);

    // Shin & Ankle
    const shin = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.045, 0.46, 12), legMat);
    shin.position.set(sign * 0.11, 0.22, 0);
    leg.add(shin);

    // Anklet
    const anklet = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.008, 6, 16), bikiniMat);
    anklet.position.set(sign * 0.11, 0.06, 0);
    anklet.rotation.x = Math.PI / 2;
    leg.add(anklet);

    // Beach Sandal / Foot
    const foot = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.04, 0.16), metalMat);
    foot.position.set(sign * 0.11, 0.02, 0.04);
    leg.add(foot);

    return leg;
  }

  group.add(createLeg(true));
  group.add(createLeg(false));

  // 8. VIP Elevated Beach Platform / Sunlounger Base
  const baseGeo = new THREE.CylinderGeometry(0.9, 1.0, 0.15, 16);
  const baseMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    emissive: cfg.bikiniColor,
    emissiveIntensity: 0.3,
    roughness: 0.3,
    metalness: 0.8,
  });
  const platform = new THREE.Mesh(baseGeo, baseMat);
  platform.position.y = -0.075;
  group.add(platform);

  // Neon Ring Trim around Platform
  const ringGeo = new THREE.RingGeometry(0.85, 0.92, 16);
  ringGeo.rotateX(-Math.PI / 2);
  const ring = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: cfg.bikiniColor }));
  ring.position.y = 0.005;
  group.add(ring);

  // State for celebration cheer
  let cheerTimer = 0;

  function cheer() {
    cheerTimer = 1.2;
  }

  function update(dt: number, time: number) {
    if (cheerTimer > 0) {
      cheerTimer -= dt;
      // Cheering jump & waving animation
      group.position.y = Math.sin((1.2 - cheerTimer) * 12) * 0.15;
      rightArm.rotation.z = Math.sin(time * 16) * 0.4 - 0.2;
      head.rotation.y = Math.sin(time * 6) * 0.2;
    } else {
      group.position.y = 0;
      // Gentle idle beach sway
      torso.rotation.y = Math.sin(time * 1.5) * 0.06;
      head.rotation.y = Math.sin(time * 1.2) * 0.1;
      rightArm.rotation.z = Math.sin(time * 2.5) * 0.15;
    }
  }

  return { group, rightArm, head, cheer, update };
}

// -------------------------------------------------------------
// CYBER PALM TREE (Geometric neon tropical beach flora)
// -------------------------------------------------------------
export function createCyberPalmTree(leafColor = 0x10b981, trunkColor = 0x1e293b): THREE.Group {
  const group = new THREE.Group();

  // Segmented Trunk with metallic rings
  const trunkGeo = new THREE.CylinderGeometry(0.18, 0.28, 5.0, 8);
  const trunkMat = new THREE.MeshStandardMaterial({
    color: trunkColor,
    roughness: 0.4,
    metalness: 0.8,
  });
  const trunk = new THREE.Mesh(trunkGeo, trunkMat);
  trunk.position.y = 2.5;
  trunk.rotation.z = 0.08;
  group.add(trunk);

  // Geometric Palm Fronds
  const frondMat = new THREE.MeshStandardMaterial({
    color: leafColor,
    emissive: leafColor,
    emissiveIntensity: 0.4,
    roughness: 0.2,
    metalness: 0.4,
    side: THREE.DoubleSide,
  });

  for (let i = 0; i < 7; i++) {
    const angle = (i * Math.PI * 2) / 7;
    const frondGeo = new THREE.ConeGeometry(0.4, 2.6, 4);
    frondGeo.rotateX(Math.PI / 2.5);
    const frond = new THREE.Mesh(frondGeo, frondMat);
    frond.position.set(Math.cos(angle) * 0.2, 5.0, Math.sin(angle) * 0.2);
    frond.rotation.y = angle;
    frond.rotation.z = 0.6;
    group.add(frond);
  }

  return group;
}


