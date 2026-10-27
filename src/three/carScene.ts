import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  loadChallengerModel,
  CarModelInstance,
  PaintPresetId,
} from './carModel';

export interface HotspotScreenPos {
  id: string;
  code: string;
  title: string;
  spec: string;
  x: number;
  y: number;
  visible: boolean;
}

export interface CarSceneCallbacks {
  onLoadProgress?: (percent: number) => void;
  onLoadComplete?: (isExternalModel: boolean) => void;
  onWebGLError?: (reason: string) => void;
  onHotspotsUpdate?: (hotspots: HotspotScreenPos[]) => void;
}

export interface CarSceneController {
  mount: (container: HTMLElement, callbacks?: CarSceneCallbacks) => void;
  unmount: () => void;
  setProgress: (progress: number) => void;
  setPointerNormalized: (nx: number, ny: number) => void;
  setPaintPreset: (presetId: PaintPresetId) => void;
  setReducedMotion: (reduced: boolean) => void;
  resize: () => void;
}

interface KeyframePose {
  pos: THREE.Vector3;
  look: THREE.Vector3;
}

export function createCarScene(): CarSceneController {
  let containerEl: HTMLElement | null = null;
  let renderer: THREE.WebGLRenderer | null = null;
  let scene: THREE.Scene | null = null;
  let camera: THREE.PerspectiveCamera | null = null;
  let envTexture: THREE.Texture | null = null;
  let carInstance: CarModelInstance | null = null;
  let shadowTex: THREE.CanvasTexture | null = null;
  let shadowGeo: THREE.BufferGeometry | null = null;
  let shadowMat: THREE.Material | null = null;

  let animFrameId = 0;
  let isUnmounted = false;
  let isContextLost = false;
  let reducedMotion = false;

  let scrollProgress = 0;
  const pointerNorm = new THREE.Vector2(0, 0);
  const smoothedPointer = new THREE.Vector2(0, 0);

  const currentCamPos = new THREE.Vector3(3.25, 1.18, 4.35);
  const targetCamPos = new THREE.Vector3(3.25, 1.18, 4.35);
  const currentLookAt = new THREE.Vector3(-0.2, 0.56, 0.3);
  const targetLookAt = new THREE.Vector3(-0.2, 0.56, 0.3);

  let sceneCallbacks: CarSceneCallbacks = {};

  // Authentic world-space coordinates on the normalized 5.01m Dodge Challenger model
  const vehicleCallouts = [
    {
      id: 'hemi',
      code: 'HEMI 6.2L',
      title: 'Приводной нагнетатель и ГРМ',
      spec: 'Контроль фаз, герметичности впуска и контура интеркулера',
      worldPos: new THREE.Vector3(0.0, 0.96, 1.32),
      stages: [1, 2, 3],
    },
    {
      id: 'optics',
      code: 'AIR-CATCHER',
      title: 'Четырёхконтурная оптика и воздухозабор',
      spec: 'Юстировка светового пучка и инспекция фронтальных радиаторов',
      worldPos: new THREE.Vector3(0.64, 0.76, 2.24),
      stages: [2, 5],
    },
    {
      id: 'brembo',
      code: 'BREMBO 6-POT',
      title: 'Двухсоставной ротор 390 мм и моноблок',
      spec: 'Инструментальный контроль биения ступицы ≤ 0.015 мм',
      worldPos: new THREE.Vector3(0.86, 0.42, 1.55),
      stages: [3, 4, 5],
    },
    {
      id: 'drivetrain',
      code: 'ZF 8HP90 / LSD',
      title: 'Трансмиссия, выхлоп и задний редуктор',
      spec: 'Диагностика блокировки дифференциала и прямоточного тракта',
      worldPos: new THREE.Vector3(-0.48, 0.42, -2.28),
      stages: [4, 6],
    },
  ];

  // Software WebGL fallback detector
  const isSoftwareGl = (() => {
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

  const updateCameraAspect = () => {
    if (!containerEl || !camera) return;
    const width = containerEl.clientWidth || window.innerWidth;
    const height = containerEl.clientHeight || window.innerHeight;
    const aspect = width / height;
    camera.aspect = aspect;

    // On mobile portrait screens, widen FOV so the 5.01m Challenger fits with clean margins
    if (aspect < 1.0) {
      camera.fov = Math.min(54, 36 / Math.pow(aspect, 0.42));
    } else {
      camera.fov = 36;
    }
    camera.updateProjectionMatrix();
  };

  // 7-stage camera keyframes corresponding to the scroll choreography specification
  const keyframes: { at: number; pos: [number, number, number]; look: [number, number, number] }[] = [
    // Stage 1 (0.00): Darkened studio reveal, heroic low 3/4 stance
    { at: 0.0, pos: [3.25, 1.16, 4.35], look: [-0.22, 0.56, 0.25] },
    // Stage 2 (0.18): Smooth approach to the front fascia, split grille & quad halo optics
    { at: 0.18, pos: [0.55, 0.84, 4.18], look: [0.0, 0.62, 1.65] },
    // Stage 3 (0.35): Dynamic 3/4 view emphasizing widebody fenders & hood scoop
    { at: 0.35, pos: [-3.35, 1.28, 3.65], look: [0.0, 0.60, 0.20] },
    // Stage 4 (0.52): Tracking along the 5-meter side profile
    { at: 0.52, pos: [-4.25, 1.02, -0.05], look: [0.0, 0.62, -0.05] },
    // Stage 5 (0.68): Dedicated close-up on forged wheel, 6-piston Brembo caliper & front optics
    { at: 0.68, pos: [2.15, 0.72, 2.52], look: [0.62, 0.48, 1.58] },
    // Stage 6 (0.84): Rear 3/4 stance showcasing racetrack tail lamp & dual exhaust
    { at: 0.84, pos: [3.15, 1.22, -4.15], look: [0.0, 0.64, -0.85] },
    // Stage 7 (1.00): Elevated architectural composition transitioning into service sections
    { at: 1.0, pos: [0.0, 2.25, 4.85], look: [0.0, 0.48, 0.0] },
  ];

  const sampleChoreography = (p: number): KeyframePose => {
    const clamped = Math.max(0, Math.min(1, p));
    const width = containerEl?.clientWidth || window.innerWidth;
    const height = containerEl?.clientHeight || window.innerHeight;
    const aspect = width / height;
    const isMobile = aspect < 1.0;

    // On mobile portrait, pull camera slightly back and center horizontal framing
    const distScale = isMobile ? Math.min(1.38, 1.0 + (1.0 - aspect) * 0.48) : 1.0;
    const yOffset = isMobile ? 0.10 : 0.0;

    let idx = 0;
    for (let i = 0; i < keyframes.length - 1; i++) {
      if (clamped >= keyframes[i].at && clamped <= keyframes[i + 1].at) {
        idx = i;
        break;
      }
    }

    const k0 = keyframes[idx];
    const k1 = keyframes[idx + 1];
    const span = Math.max(0.0001, k1.at - k0.at);
    const localT = (clamped - k0.at) / span;
    // Smoothstep interpolation between keyframes for cinematic camera motion
    const smoothT = localT * localT * (3 - 2 * localT);

    const pos = new THREE.Vector3(
      THREE.MathUtils.lerp(k0.pos[0], k1.pos[0], smoothT) * distScale,
      THREE.MathUtils.lerp(k0.pos[1], k1.pos[1], smoothT) * distScale + yOffset,
      THREE.MathUtils.lerp(k0.pos[2], k1.pos[2], smoothT) * distScale
    );

    const lookX0 = isMobile && idx === 0 ? 0 : k0.look[0];
    const lookX1 = isMobile && idx + 1 === 0 ? 0 : k1.look[0];

    const look = new THREE.Vector3(
      THREE.MathUtils.lerp(lookX0, lookX1, smoothT),
      THREE.MathUtils.lerp(k0.look[1], k1.look[1], smoothT) + yOffset,
      THREE.MathUtils.lerp(k0.look[2], k1.look[2], smoothT)
    );

    return { pos, look };
  };

  const getCurrentStageNumber = (p: number): number => {
    if (p < 0.14) return 1;
    if (p < 0.28) return 2;
    if (p < 0.44) return 3;
    if (p < 0.60) return 4;
    if (p < 0.76) return 5;
    if (p < 0.90) return 6;
    return 7;
  };

  const updateHotspotProjections = () => {
    if (!camera || !containerEl || !sceneCallbacks.onHotspotsUpdate) return;
    const width = containerEl.clientWidth;
    const height = containerEl.clientHeight;
    if (width === 0 || height === 0) return;

    const stage = getCurrentStageNumber(scrollProgress);
    const results: HotspotScreenPos[] = [];

    vehicleCallouts.forEach((item) => {
      const v = item.worldPos.clone();
      v.project(camera!);

      const inFront = v.z > 0 && v.z < 1;
      const screenX = (v.x * 0.5 + 0.5) * width;
      const screenY = (-(v.y * 0.5) + 0.5) * height;
      const inBounds =
        screenX > 36 &&
        screenX < width - 36 &&
        screenY > 80 &&
        screenY < height - 110;

      results.push({
        id: item.id,
        code: item.code,
        title: item.title,
        spec: item.spec,
        x: screenX,
        y: screenY,
        visible: item.stages.includes(stage) && inFront && inBounds,
      });
    });

    sceneCallbacks.onHotspotsUpdate(results);
  };

  const initScene = async () => {
    if (!containerEl) return;
    const width = containerEl.clientWidth || window.innerWidth;
    const height = containerEl.clientHeight || window.innerHeight;
    const isMobileViewport = width < 768;

    scene = new THREE.Scene();
    scene.background = null;

    camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 45);
    updateCameraAspect();
    camera.position.copy(currentCamPos);

    renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    const maxDpr = isSoftwareGl ? 1 : isMobileViewport ? 1.5 : 2;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxDpr));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.22;
    renderer.shadowMap.enabled = !isSoftwareGl && !isMobileViewport;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const canvas = renderer.domElement;
    canvas.addEventListener('webglcontextlost', (e) => {
      e.preventDefault();
      isContextLost = true;
      sceneCallbacks.onWebGLError?.('WebGL context lost');
    });
    canvas.addEventListener('webglcontextrestored', () => {
      isContextLost = false;
    });

    containerEl.appendChild(canvas);

    // Studio IBL Reflection Environment
    const pmremGen = new THREE.PMREMGenerator(renderer);
    envTexture = pmremGen.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTexture;
    pmremGen.dispose();

    // 1. Overhead Warm Studio Key Light
    const keyLight = new THREE.DirectionalLight(0xfff5ea, 2.8);
    keyLight.position.set(4.5, 6.2, 4.8);
    keyLight.castShadow = !isSoftwareGl && !isMobileViewport;
    if (keyLight.castShadow) {
      keyLight.shadow.mapSize.width = 1024;
      keyLight.shadow.mapSize.height = 1024;
      keyLight.shadow.bias = -0.0004;
      keyLight.shadow.camera.near = 1.0;
      keyLight.shadow.camera.far = 16;
      keyLight.shadow.camera.left = -3.2;
      keyLight.shadow.camera.right = 3.2;
      keyLight.shadow.camera.top = 3.2;
      keyLight.shadow.camera.bottom = -3.2;
    }
    scene.add(keyLight);

    // 2. Cool Architectural Fill Light (Opposite side to define fender planes)
    const fillLight = new THREE.DirectionalLight(0x93c5fd, 1.35);
    fillLight.position.set(-5.0, 3.8, 2.5);
    scene.add(fillLight);

    // 3. Signature Warm Rim / Backlight (Separates fastback roofline from dark studio void)
    const rimLight = new THREE.DirectionalLight(0xe04f26, 2.6);
    rimLight.position.set(-3.5, 3.2, -5.0);
    scene.add(rimLight);

    // 4. Overhead Strip Highlight for Hood & Roof Clearcoat
    const topSweep = new THREE.SpotLight(0xf8fafc, 3.2, 14, Math.PI / 3, 0.65, 1.5);
    topSweep.position.set(0, 6.5, 1.2);
    scene.add(topSweep);

    // 5. Ambient Studio Hemisphere
    const hemiLight = new THREE.HemisphereLight(0x27303f, 0x08090c, 1.15);
    scene.add(hemiLight);

    // 6. Calibrated Ground Contact Shadow under the 5.01m × 2.19m Challenger Footprint
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 256;
    shadowCanvas.height = 512;
    const sCtx = shadowCanvas.getContext('2d');
    if (sCtx) {
      const grad = sCtx.createRadialGradient(128, 256, 20, 128, 256, 235);
      grad.addColorStop(0, 'rgba(0, 0, 0, 0.88)');
      grad.addColorStop(0.55, 'rgba(0, 0, 0, 0.52)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      sCtx.fillStyle = grad;
      sCtx.fillRect(0, 0, 256, 512);
    }

    shadowTex = new THREE.CanvasTexture(shadowCanvas);
    shadowGeo = new THREE.PlaneGeometry(3.1, 6.1);
    shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
      opacity: 0.92,
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.set(0, 0.004, 0);
    scene.add(shadowMesh);

    // Load the real Dodge Challenger 3D model
    carInstance = await loadChallengerModel((pct) => {
      if (!isUnmounted) {
        sceneCallbacks.onLoadProgress?.(pct);
      }
    });

    if (isUnmounted) {
      carInstance.dispose();
      return;
    }

    scene.add(carInstance.rootGroup);
    sceneCallbacks.onLoadComplete?.(carInstance.isExternalModel);

    startLoop();
  };

  const startLoop = () => {
    const startTime = performance.now();
    let lastTime = startTime;

    const tick = (now: number) => {
      if (isUnmounted) return;
      const delta = Math.min((now - lastTime) / 1000, 0.1);
      const elapsed = (now - startTime) / 1000;
      lastTime = now;

      if (!isContextLost && renderer && scene && camera && carInstance) {
        const pose = sampleChoreography(scrollProgress);

        // Apply subtle cursor parallax primarily in the Hero / early scroll zone on desktop
        const width = containerEl?.clientWidth || window.innerWidth;
        const allowParallax = !reducedMotion && width >= 768;
        const parallaxWeight = allowParallax ? Math.max(0.15, 1.0 - scrollProgress * 1.1) : 0;

        smoothedPointer.lerp(pointerNorm, Math.min(1, delta * 5.0));

        targetCamPos.set(
          pose.pos.x + smoothedPointer.x * 0.22 * parallaxWeight,
          pose.pos.y - smoothedPointer.y * 0.08 * parallaxWeight,
          pose.pos.z
        );
        targetLookAt.copy(pose.look);

        if (reducedMotion) {
          currentCamPos.copy(targetCamPos);
          currentLookAt.copy(targetLookAt);
        } else {
          const damp = Math.min(1, delta * 5.5);
          currentCamPos.lerp(targetCamPos, damp);
          currentLookAt.lerp(targetLookAt, damp);
        }

        camera.position.copy(currentCamPos);
        camera.lookAt(currentLookAt);

        carInstance.updateScrollState(scrollProgress, elapsed);
        updateHotspotProjections();

        renderer.render(scene, camera);
      }

      animFrameId = requestAnimationFrame(tick);
    };

    animFrameId = requestAnimationFrame(tick);
  };

  return {
    mount: (container: HTMLElement, callbacks?: CarSceneCallbacks) => {
      containerEl = container;
      sceneCallbacks = callbacks || {};
      isUnmounted = false;
      initScene().catch((err) => {
        console.warn('3D scene initialization error:', err);
        sceneCallbacks.onWebGLError?.(String(err));
      });
    },
    unmount: () => {
      isUnmounted = true;
      cancelAnimationFrame(animFrameId);
      if (carInstance) {
        carInstance.dispose();
        carInstance = null;
      }
      if (shadowGeo) shadowGeo.dispose();
      if (shadowMat) shadowMat.dispose();
      if (shadowTex) shadowTex.dispose();
      if (envTexture) envTexture.dispose();
      if (renderer) {
        renderer.dispose();
        if (renderer.domElement.parentElement) {
          renderer.domElement.parentElement.removeChild(renderer.domElement);
        }
        renderer = null;
      }
      scene = null;
      camera = null;
    },
    setProgress: (progress: number) => {
      scrollProgress = Math.max(0, Math.min(1, progress));
    },
    setPointerNormalized: (nx: number, ny: number) => {
      pointerNorm.set(
        Math.max(-1, Math.min(1, nx)),
        Math.max(-1, Math.min(1, ny))
      );
    },
    setPaintPreset: (presetId: PaintPresetId) => {
      carInstance?.setPaintPreset(presetId);
    },
    setReducedMotion: (reduced: boolean) => {
      reducedMotion = reduced;
    },
    resize: () => {
      if (!containerEl || !renderer || !camera) return;
      const width = containerEl.clientWidth || window.innerWidth;
      const height = containerEl.clientHeight || window.innerHeight;
      updateCameraAspect();
      renderer.setSize(width, height);
    },
  };
}
