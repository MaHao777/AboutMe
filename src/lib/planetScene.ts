import {
  ACESFilmicToneMapping,
  AmbientLight,
  CanvasTexture,
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
  TubeGeometry,
  Vector3,
  WebGLRenderer,
} from 'three';

type PlanetKind = 'work' | 'life';
type RGB = readonly [number, number, number];

const themes = {
  work: {
    dark: [34, 73, 119], light: [145, 200, 232],
    moon: 0xf3e5c7, orbit: 0x7098c2, fill: 0x91bce4,
    tilt: -0.32, start: -0.8, speed: 0.12,
  },
  life: {
    dark: [143, 72, 47], light: [232, 173, 118],
    moon: 0xe0c8a3, orbit: 0xb98245, fill: 0xffd899,
    tilt: 0.28, start: 3.8, speed: -0.11,
  },
} as const;

const clamp = (value: number) => Math.max(0, Math.min(1, value));
const smoothstep = (low: number, high: number, value: number) => {
  const t = clamp((value - low) / (high - low));
  return t * t * (3 - 2 * t);
};

// Sample in sphere coordinates so the terrain joins at the texture seam and poles.
function noise(x: number, y: number, z: number): number {
  const ix = Math.floor(x), iy = Math.floor(y), iz = Math.floor(z);
  const fx = smoothstep(0, 1, x - ix), fy = smoothstep(0, 1, y - iy), fz = smoothstep(0, 1, z - iz);
  const hash = (a: number, b: number, c: number) => {
    let n = Math.imul(a, 374761393) + Math.imul(b, 668265263) + Math.imul(c, 2147483647);
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967295;
  };
  const mix = (a: number, b: number, t: number) => a + (b - a) * t;
  return mix(
    mix(mix(hash(ix, iy, iz), hash(ix + 1, iy, iz), fx), mix(hash(ix, iy + 1, iz), hash(ix + 1, iy + 1, iz), fx), fy),
    mix(mix(hash(ix, iy, iz + 1), hash(ix + 1, iy, iz + 1), fx), mix(hash(ix, iy + 1, iz + 1), hash(ix + 1, iy + 1, iz + 1), fx), fy),
    fz,
  );
}

function terrain(x: number, y: number, z: number) {
  let value = 0, amplitude = 0.55, frequency = 3.2;
  for (let octave = 0; octave < 5; octave++) {
    value += (noise(x * frequency + 13, y * frequency + 7, z * frequency - 5) - 0.5) * amplitude;
    frequency *= 2.08;
    amplitude *= 0.5;
  }
  return value;
}

const craters = [...Array.from({ length: 32 }, (_, index) => {
  const y = 1 - (index + 0.5) / 32 * 2;
  const longitude = index * 2.39996323 + 0.4;
  const radius = Math.sqrt(1 - y * y);
  return {
    x: Math.cos(longitude) * radius, y, z: Math.sin(longitude) * radius,
    size: 0.045 + ((index * 17) % 11) / 11 * 0.13,
  };
}),
  { x: -0.6, y: 0.3, z: Math.sqrt(0.55), size: 0.21 },
  { x: 0.35, y: -0.3, z: Math.sqrt(0.7875), size: 0.15 },
  { x: -0.24, y: -0.52, z: Math.sqrt(0.672), size: 0.1 },
];

function planetTextures(kind: PlanetKind) {
  const canvas = document.createElement('canvas');
  canvas.width = 768;
  canvas.height = 384;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas 2D is unavailable');
  const image = context.createImageData(canvas.width, canvas.height);
  const relief = context.createImageData(canvas.width, canvas.height);
  const { dark, light } = themes[kind];

  for (let y = 0; y < canvas.height; y++) {
    const latitude = y / canvas.height;
    const theta = latitude * Math.PI;
    const sy = Math.cos(theta), radial = Math.sin(theta);
    for (let x = 0; x < canvas.width; x++) {
      const longitude = x / canvas.width * Math.PI * 2;
      const sx = -Math.cos(longitude) * radial, sz = Math.sin(longitude) * radial;
      let shade: number, ice = 0, elevation = 0.5;
      if (kind === 'work') {
        const turbulence = noise(sx * 7 + 4, sy * 12, sz * 7) - 0.5;
        const bands = Math.sin((latitude + turbulence * 0.016) * 94);
        const wisps = Math.sin(latitude * 230 + turbulence * 9);
        const broad = Math.sin(latitude * 29 + turbulence * 1.4);
        // An oval storm interrupts the fine cloud bands on the visible hemisphere.
        const storm = Math.exp(-((sx + 0.26) ** 2 / 0.05 + (sy + 0.18) ** 2 / 0.009)) * smoothstep(0.3, 0.65, sz);
        shade = clamp(0.65 + bands * 0.075 + broad * 0.13 + wisps * 0.025 + turbulence * 0.13 + storm * 0.2);
      } else {
        const ground = terrain(sx, sy, sz);
        const fine = noise(sx * 90, sy * 90, sz * 90) - 0.5;
        let bowl = 0, rim = 0;
        for (const crater of craters) {
          const distanceSquared = 2 * (1 - sx * crater.x - sy * crater.y - sz * crater.z);
          if (distanceSquared > crater.size * crater.size * 1.4) continue;
          const distance = Math.sqrt(Math.max(0, distanceSquared)) / crater.size;
          bowl += Math.exp(-distance * distance * 7) * 0.28;
          rim += Math.exp(-(((distance - 0.83) / 0.12) ** 2)) * 0.19;
        }
        const canyon = 1 - smoothstep(0.012, 0.035, Math.abs(noise(sx * 4 + 11, sy * 4, sz * 4 - 3) - 0.5));
        shade = clamp(0.64 + ground * 1.1 + fine * 0.12 - canyon * 0.12 - bowl * 1.15 + rim * 0.65);
        ice = smoothstep(0.76, 0.88, sy + ground * 0.3) * 0.96
          + smoothstep(0.93, 0.99, -sy + ground * 0.12) * 0.55;
        elevation = clamp(0.5 + ground * 1.3 + fine * 0.065 - bowl + rim);
      }
      const offset = (y * canvas.width + x) * 4;
      for (let channel = 0; channel < 3; channel++) {
        const color = dark[channel] + (light[channel] - dark[channel]) * shade;
        image.data[offset + channel] = Math.round(color + ([237, 235, 220][channel] - color) * ice);
        relief.data[offset + channel] = Math.round(elevation * 255);
      }
      image.data[offset + 3] = 255;
      relief.data[offset + 3] = 255;
    }
  }

  context.putImageData(image, 0, 0);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 4;
  if (kind === 'work') return { color: texture };

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = canvas.width;
  bumpCanvas.height = canvas.height;
  bumpCanvas.getContext('2d')?.putImageData(relief, 0, 0);
  const bump = new CanvasTexture(bumpCanvas);
  bump.anisotropy = 4;
  return { color: texture, bump };
}

function ringTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 1;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas 2D is unavailable');
  const image = context.createImageData(512, 1);
  for (let x = 0; x < 512; x++) {
    const radial = x / 511;
    const divisions = 0.5 + 0.32 * Math.sin(radial * 136) + 0.14 * Math.sin(radial * 327);
    const gap = 1 - smoothstep(0.52, 0.535, radial) * (1 - smoothstep(0.57, 0.585, radial));
    const edge = smoothstep(0, 0.05, radial) * (1 - smoothstep(0.92, 1, radial));
    const shade = 0.65 + divisions * 0.3;
    const color: RGB = [183, 205, 210];
    for (let channel = 0; channel < 3; channel++) image.data[x * 4 + channel] = color[channel] * shade;
    image.data[x * 4 + 3] = (0.18 + divisions * 0.78) * gap * edge * 255;
  }
  context.putImageData(image, 0, 0);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

export function mountPlanetScene(host: HTMLElement, kind: PlanetKind): () => void {
  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
  } catch {
    host.classList.add('is-fallback');
    return () => host.classList.remove('is-fallback');
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

  const textures = planetTextures(kind);
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
  let rings: CanvasTexture | undefined;
  if (kind === 'work') {
    const inner = 1.98, outer = 2.73;
    const geometry = new RingGeometry(inner, outer, 192, 8);
    const position = geometry.attributes.position;
    const uv = geometry.attributes.uv;
    for (let index = 0; index < position.count; index++) {
      uv.setXY(index, (Math.hypot(position.getX(index), position.getY(index)) - inner) / (outer - inner), 0.5);
    }
    rings = ringTexture();
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
  const draw = () => renderer.render(scene, camera);
  const frame = (time: number) => {
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
    const animate = visible && !document.hidden && !reducedMotion.matches;
    previousTime = 0;
    renderer.setAnimationLoop(animate ? frame : null);
    if (!animate) draw();
  };
  const resize = () => {
    const width = host.clientWidth;
    const height = host.clientHeight;
    if (!width || !height || disposed) return;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
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

  return () => {
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
  };
}
