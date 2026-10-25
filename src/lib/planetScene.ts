import {
  ACESFilmicToneMapping,
  AmbientLight,
  CatmullRomCurve3,
  DirectionalLight,
  DoubleSide,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PCFShadowMap,
  PerspectiveCamera,
  RingGeometry,
  Scene,
  SphereGeometry,
  SRGBColorSpace,
  TextureLoader,
  TubeGeometry,
  Vector3,
  WebGLRenderer,
} from 'three';

type PlanetKind = 'work' | 'life';

const themes = {
  work: {
    moon: 0xf3e5c7, orbit: 0x7098c2, fill: 0x91bce4,
    tilt: -0.32, start: -0.8, speed: 0.12,
  },
  life: {
    moon: 0xe0c8a3, orbit: 0xb98245, fill: 0xffd899,
    tilt: 0.28, start: 3.8, speed: -0.11,
  },
} as const;

export interface PlanetScene {
  pause: () => void;
  refresh: () => void;
  dispose: () => void;
}

// These lossless assets contain the original procedural pixels. Generate them
// once, rather than blocking every navigation with terrain and crater loops.
async function planetTextures(kind: PlanetKind) {
  const loader = new TextureLoader();
  const results = await Promise.allSettled([
    loader.loadAsync('/textures/' + kind + '-color.webp'),
    kind === 'life' ? loader.loadAsync('/textures/life-bump.webp') : undefined,
    kind === 'work' ? loader.loadAsync('/textures/rings.webp') : undefined,
  ]);
  if (results.some((result) => result.status === 'rejected')) {
    results.forEach((result) => { if (result.status === 'fulfilled') result.value?.dispose(); });
    throw new Error('Planet texture unavailable');
  }
  const [colorResult, bumpResult, ringsResult] = results;
  if (colorResult.status !== 'fulfilled' || bumpResult.status !== 'fulfilled' || ringsResult.status !== 'fulfilled') {
    throw new Error('Planet texture unavailable');
  }
  const color = colorResult.value;
  const bump = bumpResult.value;
  const rings = ringsResult.value;
  color.colorSpace = SRGBColorSpace;
  color.anisotropy = 4;
  if (bump) bump.anisotropy = 4;
  if (rings) rings.colorSpace = SRGBColorSpace;
  return { color, bump, rings };
}

export async function mountPlanetScene(host: HTMLElement, kind: PlanetKind): Promise<PlanetScene> {
  const fallback = (): PlanetScene => {
    host.classList.add('is-fallback');
    return { pause: () => {}, refresh: () => {}, dispose: () => host.classList.remove('is-fallback') };
  };
  const textures = await planetTextures(kind).catch(() => null);
  if (!textures) return fallback();
  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
  } catch {
    textures.color.dispose();
    textures.bump?.dispose();
    textures.rings?.dispose();
    return fallback();
  }

  const theme = themes[kind];
  const scene = new Scene();
  const camera = new PerspectiveCamera(38, 1, 0.1, 50);
  camera.position.set(0, 0, 10.2);
  camera.lookAt(0, 0, 0);
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;
  renderer.shadowMap.enabled = kind === 'work';
  renderer.shadowMap.type = PCFShadowMap;
  renderer.domElement.className = 'planet-canvas';
  renderer.domElement.setAttribute('aria-hidden', 'true');
  host.appendChild(renderer.domElement);

  const planet = new Mesh(
    new SphereGeometry(1.62, 72, 48),
    new MeshStandardMaterial({ map: textures.color, bumpMap: textures.bump ?? null, bumpScale: 0.13, roughness: 0.96, metalness: 0 }),
  );
  const planetAxis = new Group();
  planetAxis.rotation.set(kind === 'work' ? 0 : 0.36, 0, kind === 'work' ? -0.17 : -0.23);
  planet.rotation.y = kind === 'work' ? 0.12 : 0.4;
  planet.castShadow = kind === 'work';
  planetAxis.add(planet);
  scene.add(planetAxis);

  scene.add(new AmbientLight(0xffffff, 0.66));
  const keyLight = new DirectionalLight(0xffffff, 2.4);
  keyLight.position.set(-3, 4, 5.5);
  keyLight.castShadow = kind === 'work';
  keyLight.shadow.mapSize.set(1024, 1024);
  keyLight.shadow.camera.left = keyLight.shadow.camera.bottom = -4;
  keyLight.shadow.camera.right = keyLight.shadow.camera.top = 4;
  keyLight.shadow.camera.near = 1;
  keyLight.shadow.camera.far = 16;
  keyLight.shadow.bias = -0.0005;
  keyLight.shadow.normalBias = 0.025;
  scene.add(keyLight);
  const fillLight = new DirectionalLight(theme.fill, 0.48);
  fillLight.position.set(4, -2, 3);
  scene.add(fillLight);

  // The orbit is fixed in 3D. Depth testing naturally hides its far half behind the planet.
  const orbit = new Group();
  orbit.rotation.set(-1.29, 0, theme.tilt, 'ZYX');
  let ring: Mesh<RingGeometry, MeshStandardMaterial> | undefined;
  const rings = textures.rings;
  if (kind === 'work') {
    const inner = 1.98, outer = 2.73;
    const geometry = new RingGeometry(inner, outer, 192, 8);
    const position = geometry.attributes.position;
    const uv = geometry.attributes.uv;
    for (let index = 0; index < position.count; index++) {
      uv.setXY(index, (Math.hypot(position.getX(index), position.getY(index)) - inner) / (outer - inner), 0.5);
    }
    ring = new Mesh(geometry, new MeshStandardMaterial({
      map: rings, side: DoubleSide, transparent: true, alphaTest: 0.025,
      roughness: 1, metalness: 0, depthWrite: false,
    }));
    ring.receiveShadow = true;
    orbit.add(ring);
  }
  const radius = 3.05;
  const points = Array.from({ length: 128 }, (_, index) => {
    const angle = index / 128 * Math.PI * 2;
    return new Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, 0);
  });
  const track = new Mesh(
    new TubeGeometry(new CatmullRomCurve3(points, true), 256, 0.014, 5, true),
    new MeshBasicMaterial({ color: theme.orbit, transparent: true, opacity: kind === 'work' ? 0.5 : 0.7, depthTest: true, depthWrite: false }),
  );
  orbit.add(track);
  const moon = new Mesh(
    new SphereGeometry(0.25, 32, 24),
    new MeshStandardMaterial({ color: theme.moon, map: kind === 'life' ? textures.color : null, bumpMap: textures.bump ?? null, bumpScale: 0.045, roughness: 0.96, metalness: 0 }),
  );
  orbit.add(moon);
  scene.add(orbit);

  let angle = theme.start;
  const placeMoon = () => moon.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, 0);
  placeMoon();

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let visible = true;
  let previousTime = 0;
  let disposed = false;
  let suspended = false;
  const draw = () => renderer.render(scene, camera);
  const frame = (time: number) => {
    if (suspended || !host.isConnected) {
      renderer.setAnimationLoop(null);
      previousTime = 0;
      return;
    }
    if (previousTime) {
      const seconds = Math.min((time - previousTime) / 1000, 0.05);
      angle += seconds * theme.speed;
      placeMoon();
      planet.rotation.y += seconds * (kind === 'work' ? 0.045 : 0.035);
      moon.rotation.y += seconds * 0.09;
    }
    previousTime = time;
    draw();
  };
  const schedule = () => {
    if (disposed) return;
    const animate = !suspended && host.isConnected && visible && !document.hidden && !reducedMotion.matches;
    previousTime = 0;
    renderer.setAnimationLoop(animate ? frame : null);
    if (!animate && !suspended && host.isConnected) draw();
  };
  const resize = () => {
    const width = host.clientWidth;
    const height = host.clientHeight;
    if (!width || !height || disposed) return;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.75);
    if (renderer.getPixelRatio() !== pixelRatio) renderer.setPixelRatio(pixelRatio);
    if (renderer.domElement.width !== Math.floor(width * pixelRatio) || renderer.domElement.height !== Math.floor(height * pixelRatio)) {
      renderer.setSize(width, height, false);
    }
    draw();
    // Reveal the canvas only after its first complete frame; the fallback never overlaps it.
    host.classList.add('is-3d');
  };

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(host);
  const visibilityObserver = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    schedule();
  }, { threshold: 0.02 });
  visibilityObserver.observe(host);
  document.addEventListener('visibilitychange', schedule);
  reducedMotion.addEventListener('change', schedule);
  resize();
  schedule();

  return {
    pause: () => {
      suspended = true;
      renderer.setAnimationLoop(null);
      previousTime = 0;
    },
    refresh: () => {
      suspended = false;
      const bounds = host.getBoundingClientRect();
      visible = host.isConnected && bounds.bottom > 0 && bounds.top < innerHeight && bounds.right > 0 && bounds.left < innerWidth;
      resize();
      schedule();
    },
    dispose: () => {
      disposed = true;
      renderer.setAnimationLoop(null);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      document.removeEventListener('visibilitychange', schedule);
      reducedMotion.removeEventListener('change', schedule);
      planet.geometry.dispose();
      planet.material.dispose();
      textures.color.dispose();
      textures.bump?.dispose();
      ring?.geometry.dispose();
      ring?.material.dispose();
      rings?.dispose();
      keyLight.shadow.dispose();
      track.geometry.dispose();
      track.material.dispose();
      moon.geometry.dispose();
      moon.material.dispose();
      renderer.dispose();
      renderer.domElement.remove();
      host.classList.remove('is-3d');
    },
  };
}
