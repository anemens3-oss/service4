import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export type PaintPresetId = 'obsidian' | 'destroyer' | 'crimson' | 'f8green';

export interface PaintPreset {
  id: PaintPresetId;
  name: string;
  hex: string;
  color: number;
  metalness: number;
  roughness: number;
  clearcoat: number;
}

export const PAINT_PRESETS: PaintPreset[] = [
  {
    id: 'obsidian',
    name: 'Pitch Black Metallic',
    hex: '#14171f',
    color: 0x14171f,
    metalness: 0.88,
    roughness: 0.18,
    clearcoat: 1.0,
  },
  {
    id: 'destroyer',
    name: 'Destroyer Grey',
    hex: '#464c56',
    color: 0x464c56,
    metalness: 0.62,
    roughness: 0.22,
    clearcoat: 1.0,
  },
  {
    id: 'crimson',
    name: 'Octane Red Pearl',
    hex: '#8f1d14',
    color: 0x8f1d14,
    metalness: 0.82,
    roughness: 0.19,
    clearcoat: 1.0,
  },
  {
    id: 'f8green',
    name: 'F8 Green Metallic',
    hex: '#213626',
    color: 0x213626,
    metalness: 0.84,
    roughness: 0.21,
    clearcoat: 1.0,
  },
];

export interface CarModelInstance {
  rootGroup: THREE.Group;
  isExternalModel: boolean;
  setPaintPreset: (presetId: PaintPresetId) => void;
  updateScrollState: (progress: number, elapsedTime: number) => void;
  dispose: () => void;
}

// Module-level cache so the GLB is only fetched and parsed once per session
let cachedGltfScene: THREE.Group | null = null;
let loadingPromise: Promise<THREE.Group> | null = null;

function fetchChallengerGlb(
  onProgress?: (percent: number) => void
): Promise<THREE.Group> {
  if (cachedGltfScene) {
    onProgress?.(100);
    return Promise.resolve(cachedGltfScene.clone(true));
  }

  if (loadingPromise) {
    return loadingPromise.then((scene) => scene.clone(true));
  }

  const loader = new GLTFLoader();
  // Relative URL works both at root (/) and on GitHub Pages subfolder (/service3/)
  const modelUrl = './models/dodge_challenger.glb';

  loadingPromise = new Promise<THREE.Group>((resolve, reject) => {
    loader.load(
      modelUrl,
      (gltf) => {
        cachedGltfScene = gltf.scene;
        onProgress?.(100);
        resolve(gltf.scene.clone(true));
      },
      (event) => {
        if (event.lengthComputable && event.total > 0) {
          const pct = Math.min(99, Math.round((event.loaded / event.total) * 100));
          onProgress?.(pct);
        }
      },
      (error) => {
        loadingPromise = null;
        reject(error);
      }
    );
  });

  return loadingPromise;
}

/**
 * Applies calibrated studio PBR materials to the loaded Dodge Challenger GLTF meshes
 * while preserving original UV-mapped tire and grille textures.
 */
function upgradeChallengerMaterials(root: THREE.Object3D): {
  bodyMaterial: THREE.MeshPhysicalMaterial;
  haloOuterMat: THREE.MeshStandardMaterial;
  haloInnerMat: THREE.MeshStandardMaterial;
  tailLightMat: THREE.MeshStandardMaterial;
  disposableMaterials: THREE.Material[];
} {
  const disposableMaterials: THREE.Material[] = [];

  const bodyMaterial = new THREE.MeshPhysicalMaterial({
    color: PAINT_PRESETS[0].color,
    metalness: PAINT_PRESETS[0].metalness,
    roughness: PAINT_PRESETS[0].roughness,
    clearcoat: PAINT_PRESETS[0].clearcoat,
    clearcoatRoughness: 0.06,
    envMapIntensity: 1.9,
  });

  const glassMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x06080c,
    metalness: 0.15,
    roughness: 0.04,
    transparent: true,
    opacity: 0.84,
    clearcoat: 1.0,
    clearcoatRoughness: 0.02,
    envMapIntensity: 2.2,
  });

  const rimMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x222630,
    metalness: 0.92,
    roughness: 0.20,
    clearcoat: 0.7,
    clearcoatRoughness: 0.1,
    envMapIntensity: 1.75,
  });

  const rotorMaterial = new THREE.MeshStandardMaterial({
    color: 0xcad2de,
    metalness: 0.95,
    roughness: 0.24,
    envMapIntensity: 1.6,
  });

  const caliperMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xe04f26,
    metalness: 0.65,
    roughness: 0.22,
    clearcoat: 0.9,
    clearcoatRoughness: 0.08,
    envMapIntensity: 1.5,
  });

  const haloOuterMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xe0f2fe,
    emissiveIntensity: 3.4,
    roughness: 0.08,
    metalness: 0.1,
  });

  const haloInnerMat = new THREE.MeshStandardMaterial({
    color: 0xffa726,
    emissive: 0xff6d00,
    emissiveIntensity: 3.0,
    roughness: 0.1,
    metalness: 0.1,
  });

  const tailLightMat = new THREE.MeshStandardMaterial({
    color: 0xff2424,
    emissive: 0xe61919,
    emissiveIntensity: 2.8,
    roughness: 0.12,
    metalness: 0.2,
  });

  const exhaustMaterial = new THREE.MeshStandardMaterial({
    color: 0xd1d5db,
    metalness: 0.96,
    roughness: 0.16,
    envMapIntensity: 1.8,
  });

  const mirrorLensMaterial = new THREE.MeshStandardMaterial({
    color: 0xe5e7eb,
    metalness: 1.0,
    roughness: 0.02,
    envMapIntensity: 2.0,
  });

  const satinTrimMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x12141a,
    metalness: 0.35,
    roughness: 0.42,
    clearcoat: 0.22,
    clearcoatRoughness: 0.25,
    envMapIntensity: 1.2,
  });

  const interiorMaterial = new THREE.MeshStandardMaterial({
    color: 0x121419,
    metalness: 0.08,
    roughness: 0.82,
  });

  disposableMaterials.push(
    bodyMaterial,
    glassMaterial,
    rimMaterial,
    rotorMaterial,
    caliperMaterial,
    haloOuterMat,
    haloInnerMat,
    tailLightMat,
    exhaustMaterial,
    mirrorLensMaterial,
    satinTrimMaterial,
    interiorMaterial
  );

  root.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;

    child.castShadow = true;
    child.receiveShadow = true;

    const origMat = child.material as THREE.MeshStandardMaterial | undefined;
    const matName = origMat?.name || '';

    switch (matName) {
      case 'Material.011':
        // Main Challenger Body Shell
        child.material = bodyMaterial;
        break;

      case 'Material.014':
        // Windshield & Cabin Glass
        child.material = glassMaterial;
        break;

      case 'material':
        // Forged Multi-spoke Alloy Rims
        child.material = rimMaterial;
        break;

      case 'Material.003':
        // Slotted Brake Discs
        child.material = rotorMaterial;
        break;

      case 'Material.010':
        // Brembo 6-Piston Brake Calipers
        child.material = caliperMaterial;
        break;

      case 'Material.021':
        // Outer Quad Halo LED Rings
        child.material = haloOuterMat;
        break;

      case 'Material.020':
        // Inner Amber Air-Catcher DRL Rings
        child.material = haloInnerMat;
        break;

      case 'Material.015':
      case 'Material.004':
        // Rear Racetrack LED Tail Lamp Bar
        child.material = tailLightMat;
        break;

      case 'Material.005':
        // Twin Exhaust Tips
        child.material = exhaustMaterial;
        break;

      case 'Material.017':
        // Side Mirror Reflective Glass
        child.material = mirrorLensMaterial;
        break;

      case 'Material.013':
        // Interior Cabin
        child.material = interiorMaterial;
        break;

      case 'Material.009':
        // Tire Rubber (preserve original tread normal & albedo textures)
        if (origMat) {
          const tireMat = origMat.clone();
          tireMat.roughness = 0.82;
          tireMat.metalness = 0.08;
          tireMat.envMapIntensity = 0.7;
          if (tireMat.normalMap) {
            tireMat.normalScale = new THREE.Vector2(1.25, 1.25);
          }
          child.material = tireMat;
          disposableMaterials.push(tireMat);
        }
        break;

      case 'grills':
        // Front Split Grille & Intake Mesh (preserve original normal & baseColor textures)
        if (origMat) {
          const grillMat = origMat.clone();
          grillMat.metalness = 0.58;
          grillMat.roughness = 0.38;
          grillMat.envMapIntensity = 1.2;
          child.material = grillMat;
          disposableMaterials.push(grillMat);
        }
        break;

      default:
        // Front Chin Splitter, Rear Diffuser, Side Skirts, Window Trim, Headlight Bezels
        child.material = satinTrimMaterial;
        break;
    }
  });

  return {
    bodyMaterial,
    haloOuterMat,
    haloInnerMat,
    tailLightMat,
    disposableMaterials,
  };
}

/**
 * High-precision fallback Challenger silhouette constructed only if GLB network loading fails.
 */
function createFallbackChallenger(): {
  group: THREE.Group;
  bodyMaterial: THREE.MeshPhysicalMaterial;
  haloOuterMat: THREE.MeshStandardMaterial;
  haloInnerMat: THREE.MeshStandardMaterial;
  tailLightMat: THREE.MeshStandardMaterial;
  disposableMaterials: THREE.Material[];
} {
  const group = new THREE.Group();
  group.name = 'FallbackChallenger';

  const bodyMaterial = new THREE.MeshPhysicalMaterial({
    color: PAINT_PRESETS[0].color,
    metalness: 0.88,
    roughness: 0.18,
    clearcoat: 1.0,
    clearcoatRoughness: 0.07,
  });

  const trimMat = new THREE.MeshStandardMaterial({
    color: 0x12141a,
    metalness: 0.4,
    roughness: 0.45,
  });

  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0x06080c,
    metalness: 0.1,
    roughness: 0.05,
    transparent: true,
    opacity: 0.82,
    clearcoat: 1.0,
  });

  const haloOuterMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xe0f2fe,
    emissiveIntensity: 3.4,
  });

  const haloInnerMat = new THREE.MeshStandardMaterial({
    color: 0xffa726,
    emissive: 0xff6d00,
    emissiveIntensity: 3.0,
  });

  const tailLightMat = new THREE.MeshStandardMaterial({
    color: 0xff2424,
    emissive: 0xe61919,
    emissiveIntensity: 2.8,
  });

  // Main widebody muscle car hull (5.0m long, 2.0m wide)
  const hullGeo = new THREE.BoxGeometry(1.98, 0.56, 4.92);
  const hull = new THREE.Mesh(hullGeo, bodyMaterial);
  hull.position.set(0, 0.58, 0);
  hull.castShadow = true;
  group.add(hull);

  // Fastback cabin greenhouse
  const cabinGeo = new THREE.BoxGeometry(1.62, 0.42, 2.35);
  const cabin = new THREE.Mesh(cabinGeo, glassMat);
  cabin.position.set(0, 1.04, -0.22);
  group.add(cabin);

  // SRT Hood Power Bulge & Twin Snorkel Scoop
  const hoodBulgeGeo = new THREE.BoxGeometry(1.18, 0.09, 1.55);
  const hoodBulge = new THREE.Mesh(hoodBulgeGeo, trimMat);
  hoodBulge.position.set(0, 0.89, 1.35);
  group.add(hoodBulge);

  // Front Chin Splitter
  const splitterGeo = new THREE.BoxGeometry(2.02, 0.06, 0.28);
  const splitter = new THREE.Mesh(splitterGeo, trimMat);
  splitter.position.set(0, 0.26, 2.42);
  group.add(splitter);

  // Quad Halo Headlights
  [-0.72, -0.52, 0.52, 0.72].forEach((x, idx) => {
    const ringGeo = new THREE.TorusGeometry(0.065, 0.014, 12, 24);
    const mat = idx === 1 || idx === 2 ? haloInnerMat : haloOuterMat;
    const ring = new THREE.Mesh(ringGeo, mat);
    ring.position.set(x, 0.62, 2.47);
    group.add(ring);
  });

  // Rear Racetrack Taillight Bar
  const tailGeo = new THREE.BoxGeometry(1.76, 0.11, 0.04);
  const tail = new THREE.Mesh(tailGeo, tailLightMat);
  tail.position.set(0, 0.68, -2.46);
  group.add(tail);

  return {
    group,
    bodyMaterial,
    haloOuterMat,
    haloInnerMat,
    tailLightMat,
    disposableMaterials: [bodyMaterial, trimMat, glassMat, haloOuterMat, haloInnerMat, tailLightMat],
  };
}

export async function loadChallengerModel(
  onProgress?: (percent: number) => void
): Promise<CarModelInstance> {
  const rootGroup = new THREE.Group();
  rootGroup.name = 'ChallengerHellcatRoot';

  let bodyMaterial: THREE.MeshPhysicalMaterial;
  let haloOuterMat: THREE.MeshStandardMaterial;
  let haloInnerMat: THREE.MeshStandardMaterial;
  let tailLightMat: THREE.MeshStandardMaterial;
  let disposableMaterials: THREE.Material[] = [];
  let isExternalModel = false;

  try {
    const gltfScene = await fetchChallengerGlb(onProgress);
    isExternalModel = true;

    // Normalize scale from centimeters to meters (1 unit = 1 meter)
    gltfScene.scale.setScalar(0.01);
    gltfScene.updateMatrixWorld(true);

    // Compute exact world-space bounding box to center X/Z and place tires at y = 0
    const box = new THREE.Box3().setFromObject(gltfScene);
    const center = box.getCenter(new THREE.Vector3());

    gltfScene.position.x -= center.x;
    gltfScene.position.z -= center.z;
    gltfScene.position.y -= box.min.y;
    gltfScene.updateMatrixWorld(true);

    const upgraded = upgradeChallengerMaterials(gltfScene);
    bodyMaterial = upgraded.bodyMaterial;
    haloOuterMat = upgraded.haloOuterMat;
    haloInnerMat = upgraded.haloInnerMat;
    tailLightMat = upgraded.tailLightMat;
    disposableMaterials = upgraded.disposableMaterials;

    rootGroup.add(gltfScene);
  } catch (err) {
    console.warn('Primary Dodge Challenger GLB failed to load, using fallback model:', err);
    onProgress?.(100);
    const fallback = createFallbackChallenger();
    bodyMaterial = fallback.bodyMaterial;
    haloOuterMat = fallback.haloOuterMat;
    haloInnerMat = fallback.haloInnerMat;
    tailLightMat = fallback.tailLightMat;
    disposableMaterials = fallback.disposableMaterials;
    rootGroup.add(fallback.group);
  }

  // Subtle diagnostic floor ring under the vehicle that responds to technical inspection stages
  const scanRingGeo = new THREE.RingGeometry(2.75, 2.79, 96);
  scanRingGeo.rotateX(-Math.PI / 2);
  const scanRingMat = new THREE.MeshBasicMaterial({
    color: 0xe04f26,
    transparent: true,
    opacity: 0.0,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const scanRing = new THREE.Mesh(scanRingGeo, scanRingMat);
  scanRing.position.set(0, 0.008, 0);
  rootGroup.add(scanRing);
  disposableMaterials.push(scanRingMat);

  const setPaintPreset = (presetId: PaintPresetId) => {
    const preset = PAINT_PRESETS.find((p) => p.id === presetId) || PAINT_PRESETS[0];
    bodyMaterial.color.setHex(preset.color);
    bodyMaterial.metalness = preset.metalness;
    bodyMaterial.roughness = preset.roughness;
    bodyMaterial.clearcoat = preset.clearcoat;
    bodyMaterial.needsUpdate = true;
  };

  const updateScrollState = (progress: number, elapsedTime: number) => {
    const p = Math.max(0, Math.min(1, progress));

    // Dynamic headlight & taillight intensity modulation across the 7 scroll stages
    // Peak optic intensity during Stage 2 (front push-in) and Stage 5 (wheel/optics macro)
    const frontOpticsBoost =
      p > 0.10 && p < 0.32
        ? 1.35
        : p > 0.56 && p < 0.78
          ? 1.45
          : 1.0 + Math.sin(elapsedTime * 1.6) * 0.06;

    haloOuterMat.emissiveIntensity = 3.2 * frontOpticsBoost;
    haloInnerMat.emissiveIntensity = 2.9 * frontOpticsBoost;

    // Peak rear taillight intensity during Stage 6 (rear 3/4 view)
    const rearOpticsBoost = p > 0.72 && p < 0.94 ? 1.5 : 1.0;
    tailLightMat.emissiveIntensity = 2.6 * rearOpticsBoost;

    // Subtle technical calibration ring visibility during intermediate inspection stages
    const ringTargetOpacity = p > 0.12 && p < 0.92 ? 0.28 : 0.08;
    scanRingMat.opacity = ringTargetOpacity;
  };

  const dispose = () => {
    rootGroup.traverse((child) => {
      if (child instanceof THREE.Mesh && child.geometry) {
        child.geometry.dispose();
      }
    });
    disposableMaterials.forEach((m) => m.dispose());
  };

  return {
    rootGroup,
    isExternalModel,
    setPaintPreset,
    updateScrollState,
    dispose,
  };
}
