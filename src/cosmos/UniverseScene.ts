import {
  AmbientLight, BufferGeometry, Color, DirectionalLight, Float32BufferAttribute,
  FogExp2, HemisphereLight, Line, LineBasicMaterial, LineSegments, Mesh, PerspectiveCamera,
  Points, PointsMaterial, Raycaster, Scene, SRGBColorSpace, Vector2, Vector3, WebGLRenderer,
} from 'three';
import { BlackHole } from './BlackHole';
import { CameraController } from './CameraController';
import { FlightController } from './FlightController';
import { PlanetInfoPanel } from './PlanetInfoPanel';
import { PlanetSystem } from './PlanetSystem';
import { Spaceship } from './Spaceship';
import { ROUTE_LENGTH, universeData } from './universeData';
import type { ContentEntry, PlanetData } from './universeData';
import { orbitFrontAngle } from './orbits';

interface ExploreTarget {
  entry: ContentEntry;
  planet: PlanetData;
  mesh: Mesh;
  radius: number;
  satellite: boolean;
  highlight: (active: boolean) => void;
}

interface SceneLabel {
  element: HTMLButtonElement;
  target: ExploreTarget;
  anchor: Vector3;
}

/** Owns the scene lifecycle. The full-screen route never uses browser scroll as state. */
export function mountUniverse(host: HTMLElement) {
  const canvas = host.querySelector<HTMLCanvasElement>('[data-universe-canvas]')!;
  const error = host.querySelector<HTMLElement>('[data-scene-error]')!;
  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  } catch {
    error.hidden = false; host.dataset.state = 'unavailable';
    return () => {};
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.7));
  renderer.outputColorSpace = SRGBColorSpace;
  const scene = new Scene();
  scene.background = new Color('#050811');
  scene.fog = new FogExp2('#050811', .00165);
  scene.add(new AmbientLight('#b3c5de', .65));
  scene.add(new HemisphereLight('#bedbff', '#141c36', 1.4));
  const key = new DirectionalLight('#ffecd3', 3.2);
  scene.add(key, key.target);
  const rig = new CameraController();
  const flight = new FlightController(ROUTE_LENGTH);
  const ship = new Spaceship(); scene.add(ship.group);
  const blackHole = new BlackHole(); scene.add(blackHole.group);
  const catalog = JSON.parse(host.querySelector('[data-universe-content]')?.textContent ?? '{}') as Record<string, Partial<ContentEntry>>;
  const systems = universeData.map((data) => new PlanetSystem({ ...data, satellites: data.satellites.map((entry) => ({ ...entry, ...catalog[entry.id] })) }));
  systems.forEach((system) => scene.add(system.planet.group));
  addStarfield(scene); addRouteMarkers(scene);

  const targets: ExploreTarget[] = [];
  const labels: SceneLabel[] = [];
  const labelLayer = host.querySelector<HTMLElement>('[data-scene-labels]')!;
  systems.forEach((system) => {
    const target: ExploreTarget = {
      entry: system.data, planet: system.data, mesh: system.planet.mesh,
      radius: system.data.radius, satellite: false,
      highlight: (active) => system.planet.highlight(active),
    };
    targets.push(target);
    addLabel(target);
    system.satellites.forEach((satellite) => {
      const target: ExploreTarget = {
        entry: satellite.data, planet: system.data, mesh: satellite.mesh,
        radius: satellite.data.radius, satellite: true,
        highlight: (active) => satellite.highlight(active),
      };
      targets.push(target); addLabel(target);
    });
  });

  function addLabel(target: ExploreTarget) {
    const element = document.createElement('button');
    element.type = 'button';
    element.className = target.satellite ? 'scene-label satellite-label' : 'scene-label planet-label';
    element.style.setProperty('--planet-color', target.planet.color);
    const eyebrow = document.createElement('span'); eyebrow.className = 'label-index';
    eyebrow.textContent = target.satellite ? '↗ 项目卫星' : `${target.planet.index} / ${target.planet.subtitle}`;
    const title = document.createElement('strong'); title.textContent = target.entry.title;
    const description = document.createElement('span'); description.className = 'label-description'; description.textContent = target.entry.description;
    const hint = document.createElement('span'); hint.className = 'label-hint'; hint.textContent = '点击探索 ↗';
    element.append(eyebrow, title, description, hint);
    element.setAttribute('aria-label', `探索${target.entry.title}`);
    element.addEventListener('click', () => explore(target));
    element.addEventListener('pointerenter', () => setHover(target));
    element.addEventListener('pointerleave', () => setHover(null));
    labelLayer.append(element); labels.push({ element, target, anchor: new Vector3() });
  }

  let selected: ExploreTarget | null = null;
  let hovered: ExploreTarget | null = null;
  let focusedPosition: Vector3 | null = null;
  let exploredSystem: PlanetSystem | null = null;
  let focusPanelFraction = .3;
  let lastFrontAligned: boolean | undefined;
  let lastLoops = 0;
  let width = 1, height = 1;
  let frame = 0, lastTime = 0, time = 0, stateTime = 0;
  let disposed = false;
  let contextLost = false;
  const abort = new AbortController();
  const { signal } = abort;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const raycaster = new Raycaster();
  const pointer = new Vector2(2, 2);
  let pointerInside = false;
  let pointerDown: { x: number; y: number } | null = null;
  const world = new Vector3();
  const view = new Vector3();
  const projected = new Vector3();
  const labelDirection = new Vector3();
  const occluderPosition = new Vector3();
  const live = host.querySelector<HTMLElement>('[data-flight-live]')!;
  const veil = host.querySelector<HTMLElement>('[data-transition]')!;
  const transitionText = host.querySelector<HTMLElement>('[data-transition-text]')!;
  const panelHost = host.querySelector<HTMLElement>('[data-info-panel]')!;
  const panel = new PlanetInfoPanel(panelHost, closePanel, (planet, id) => {
    const target = targets.find((entry) => entry.planet.id === planet.id && entry.entry.id === id);
    if (target) explore(target);
  }, () => { exploredSystem?.orbit.stop(); setHover(null); });

  function setHover(target: ExploreTarget | null) {
    if (hovered === target) return;
    if (hovered !== selected) hovered?.highlight(false);
    hovered = target; hovered?.highlight(true);
    canvas.style.cursor = target ? 'pointer' : 'default';
    host.querySelector<HTMLElement>('[data-hover-hint]')!.textContent = target
      ? `${target.entry.title} · ${exploredSystem ? '点击转至前方' : '点击探索'}` : '';
  }

  function explore(target: ExploreTarget) {
    if (panel.isDetailOpen) return;
    if (flight.mode !== 'flight' && flight.mode !== 'exploring') return;
    if (flight.mode === 'flight' && !flight.explore()) return;
    const system = systems.find((system) => system.data.id === target.planet.id)!;
    const satelliteIndex = system.data.satellites.findIndex((entry) => entry.id === target.entry.id);
    if (exploredSystem === system) {
      if (target.satellite) system.orbit.select(satelliteIndex, motion.matches);
      return;
    }
    exploredSystem?.orbit.exit();
    exploredSystem = system;
    focusedPosition = new Vector3().fromArray(target.planet.position);
    panel.open(system.data, system.orbit.order); updateFocusFraming();
    system.orbit.enter(target.satellite ? satelliteIndex : 0);
    syncOrbitSelection();
    host.dataset.exploring = 'true';
  }

  function syncOrbitSelection() {
    if (!exploredSystem) return;
    panel.scrub(exploredSystem.orbit.contentPosition, exploredSystem.orbit.selectedIndex);
    const entry = exploredSystem.data.satellites[exploredSystem.orbit.selectedIndex] ?? exploredSystem.data;
    const target = targets.find((target) => target.planet.id === exploredSystem!.data.id && target.entry.id === entry.id)!;
    if (target !== selected) {
      setHover(null); selected?.highlight(false); selected = target; lastFrontAligned = undefined;
      live.textContent = `${target.planet.title}，当前项目：${target.entry.title}。`;
    }
    const aligned = exploredSystem.orbit.isFrontAligned;
    selected.highlight(aligned || hovered === selected);
    if (aligned !== lastFrontAligned) {
      lastFrontAligned = aligned;
      labels.forEach((label) => {
        const current = label.target === selected && aligned;
        label.element.dataset.selected = String(current);
        label.element.setAttribute('aria-pressed', String(current));
        if (label.target.satellite) label.element.querySelector('.label-index')!.textContent = current ? '● 当前卫星' : '↗ 项目卫星';
      });
    }
  }

  function updateFocusFraming() {
    if (exploredSystem) {
      if (!panel.isDetailOpen) focusPanelFraction = 1 - panelHost.offsetLeft / Math.max(1, width);
      const direction = rig.focusViewDirection(exploredSystem.extent, focusPanelFraction);
      exploredSystem.orbit.setFrontAngle(orbitFrontAngle(exploredSystem.data.orbitOrientation, direction.toArray() as [number, number, number]));
      panel.resize();
    }
  }

  function closePanel() {
    if (!selected) return;
    exploredSystem?.orbit.exit(); exploredSystem = null;
    selected.highlight(false);
    selected = null; focusedPosition = null; panel.hide(); flight.resume();
    host.dataset.exploring = 'false'; setHover(null);
    lastFrontAligned = undefined;
    labels.forEach((label) => {
      label.element.dataset.selected = 'false'; label.element.setAttribute('aria-pressed', 'false');
      if (label.target.satellite) label.element.querySelector('.label-index')!.textContent = '↗ 项目卫星';
    });
    delete host.dataset.orbitRotation; delete host.dataset.satellite; delete host.dataset.planet;
    delete host.dataset.orbitContentPosition; delete host.dataset.frontAngle; delete host.dataset.selectedFront;
    live.textContent = '已退出探索，镜头返回飞船。';
  }

  function resize() {
    width = host.clientWidth; height = host.clientHeight;
    renderer.setSize(width, height, false);
    rig.camera.aspect = width / Math.max(1, height); rig.camera.updateProjectionMatrix();
    updateFocusFraming();
  }
  const resizeObserver = new ResizeObserver(resize); resizeObserver.observe(host); resize();
  const panelResizeObserver = new ResizeObserver(updateFocusFraming); panelResizeObserver.observe(panelHost);

  host.addEventListener('wheel', (event) => {
    if (event.ctrlKey) return;
    if (panel.isDetailOpen) {
      // Only the second-level reader uses native scrolling; the orbit stays frozen.
      if (!(event.target instanceof Element && event.target.closest('[data-detail-scroll]'))) event.preventDefault();
      return;
    }
    event.preventDefault();
    if (exploredSystem) exploredSystem.orbit.wheel(event.deltaY, event.deltaMode, height, motion.matches);
    else flight.wheel(event.deltaY, event.deltaMode, height);
  }, { passive: false, signal });
  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      if (panel.closeDetail()) return;
      if (selected) closePanel();
      return;
    }
    if (event.target instanceof Element && event.target.closest('input, textarea, select, [contenteditable]')) return;
    if (panel.isDetailOpen) return;
    if (exploredSystem && ['ArrowLeft', 'ArrowRight'].includes(event.key)) {
      event.preventDefault(); exploredSystem.orbit.step(event.key === 'ArrowRight' ? 1 : -1, motion.matches); return;
    }
    if (event.target instanceof Element && event.target.closest('[data-info-panel]')) return;
    if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp'].includes(event.key)) {
      event.preventDefault(); flight.hold(event.key === 'ArrowDown' || event.key === 'PageDown' ? 1 : -1);
    }
    if (event.code === 'Space' && !(event.target instanceof Element && event.target.closest('button, a'))) {
      event.preventDefault(); flight.stop();
    }
  }, { signal });
  window.addEventListener('keyup', (event) => {
    if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp'].includes(event.key)) flight.hold(0);
  }, { signal });
  window.addEventListener('blur', () => { flight.stop(); pointerInside = false; setHover(null); }, { signal });
  canvas.addEventListener('pointermove', (event) => {
    const rect = canvas.getBoundingClientRect();
    pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1);
    pointerInside = true;
  }, { passive: true, signal });
  canvas.addEventListener('pointerleave', () => { pointerInside = false; setHover(null); }, { signal });
  canvas.addEventListener('pointerdown', (event) => { pointerDown = { x: event.clientX, y: event.clientY }; }, { signal });
  canvas.addEventListener('pointerup', (event) => {
    if (!pointerDown || Math.hypot(event.clientX - pointerDown.x, event.clientY - pointerDown.y) > 6) return;
    pointerDown = null;
    const rect = canvas.getBoundingClientRect();
    pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1);
    const target = pick(); if (target) explore(target);
  }, { signal });
  canvas.addEventListener('webglcontextlost', (event) => {
    event.preventDefault(); contextLost = true; cancelAnimationFrame(frame); flight.stop();
    error.hidden = false; host.dataset.state = 'unavailable';
  }, { signal });
  document.addEventListener('visibilitychange', () => {
    flight.stop(); lastTime = 0;
    if (document.hidden) cancelAnimationFrame(frame);
    else if (!disposed && !contextLost) frame = requestAnimationFrame(render);
  }, { signal });

  function pick() {
    if (flight.mode !== 'flight' && flight.mode !== 'exploring') return null;
    raycaster.setFromCamera(pointer, rig.camera);
    const hits = raycaster.intersectObjects(targets.map((target) => target.mesh), false);
    const hit = hits.find((entry) => entry.distance < 110);
    const target = hit ? targets.find((target) => target.mesh === hit.object) ?? null : null;
    if (exploredSystem && (!target?.satellite || target.planet.id !== exploredSystem.data.id)) return null;
    return target;
  }

  function updateLabels(camera: PerspectiveCamera) {
    const topInset = host.querySelector<HTMLElement>('.cosmos-header')!.offsetHeight + 12;
    for (const label of labels) {
      label.target.mesh.getWorldPosition(world);
      view.copy(world).applyMatrix4(camera.matrixWorldInverse);
      const distance = camera.position.distanceTo(world);
      const exploringThisSystem = selected?.planet.id === label.target.planet.id;
      const near = label.target.satellite ? distance < (exploringThisSystem ? 160 : 47) : distance < 105;
      const visibleMode = flight.mode === 'flight' || (flight.mode === 'exploring' && exploringThisSystem && label.target.satellite && ((label.target === selected && exploredSystem?.orbit.isFrontAligned) || label.target === hovered));
      // Label anchors sit above their own sphere, in world space, so perspective is real.
      label.anchor.copy(world); label.anchor.y += label.target.radius + (label.target.satellite ? .6 : 1.5);
      projected.copy(label.anchor).project(camera);
      const x = (projected.x * .5 + .5) * width;
      const y = (-projected.y * .5 + .5) * height;
      const labelWidth = label.target.satellite ? 140 : 238;
      const coveredByPanel = !!selected && x > width - Math.min(410, width * .42) - labelWidth / 2;
      const labelHeight = label.target.satellite ? 48 : 102;
      let hidden = !visibleMode || !near || view.z > -2 || projected.z > 1 || Math.abs(projected.y) > 1.35 || x < -20 || x > width + 20 || coveredByPanel;
      if (!hidden && label.target.satellite) {
        labelDirection.copy(world).sub(camera.position).normalize();
        // DOM labels must respect the planet's 3D occlusion, just like its satellites.
        hidden = targets.some((other) => {
          if (other.satellite) return false;
          other.mesh.getWorldPosition(occluderPosition).sub(camera.position);
          const alongRay = occluderPosition.dot(labelDirection);
          const perpendicularSq = occluderPosition.lengthSq() - alongRay * alongRay;
          return alongRay > 0 && alongRay < distance && perpendicularSq < other.radius * other.radius;
        });
      }
      label.element.hidden = hidden;
      if (!hidden) {
        const labelX = Math.max(labelWidth / 2 + 12, Math.min(width - labelWidth / 2 - 12, x));
        const labelY = Math.max(topInset + labelHeight, Math.min(height - 45, y));
        label.element.style.transform = `translate3d(${labelX}px,${labelY}px,0) translate(-50%,-100%)`;
        label.element.style.opacity = String(Math.min(1, (110 - distance) / 25));
      }
    }
  }

  function updateFlightState() {
    host.dataset.state = flight.mode;
    host.dataset.progress = flight.flightProgress.toFixed(5);
    host.dataset.velocity = flight.velocity.toFixed(3);
    host.dataset.loops = String(flight.loops);
    if (exploredSystem) {
      host.dataset.planet = exploredSystem.data.id;
      host.dataset.satellite = selected?.entry.id ?? '';
      host.dataset.orbitRotation = exploredSystem.orbit.rotation.toFixed(5);
      host.dataset.orbitContentPosition = exploredSystem.orbit.contentPosition.toFixed(6);
      host.dataset.frontAngle = exploredSystem.orbit.frontAngle.toFixed(6);
      host.dataset.selectedFront = String(exploredSystem.orbit.isFrontAligned);
    }
  }

  function render(timestamp: number) {
    if (disposed || contextLost || document.hidden) return;
    const dt = lastTime ? Math.min(.05, (timestamp - lastTime) / 1000) : 1 / 60;
    lastTime = timestamp; time += dt; stateTime += dt;
    flight.update(dt);
    if (flight.loops !== lastLoops) {
      rig.snap(0); ship.update(0, 0, time, motion.matches); lastLoops = flight.loops;
      live.textContent = '已穿过黑洞，回到宇宙起点。';
    }
    ship.update(flight.distance, flight.velocity, time, motion.matches);
    ship.group.visible = !exploredSystem;
    rig.update(dt, flight.distance, flight.velocity, focusedPosition && exploredSystem ? { position: focusedPosition, radius: exploredSystem.extent, panelFraction: focusPanelFraction } : null);
    key.position.set(-25, 28, -flight.distance + 35); key.target.position.set(0, 0, -flight.distance - 50);
    const animate = !motion.matches && flight.mode !== 'exploring';
    systems.forEach((system) => system.update(dt, animate));
    syncOrbitSelection();
    if (!motion.matches) blackHole.update(dt);
    renderer.render(scene, rig.camera);
    if (pointerInside) setHover(pick());
    updateLabels(rig.camera);
    if (stateTime > .08) { updateFlightState(); stateTime = 0; }
    veil.style.opacity = String(flight.transitionOpacity);
    veil.hidden = flight.transitionOpacity === 0;
    transitionText.textContent = flight.mode === 'departing' ? '穿越事件视界' : '回到起点 · 继续探索';
    frame = requestAnimationFrame(render);
  }

  host.dataset.state = 'flight'; updateFlightState(); frame = requestAnimationFrame(render);
  return () => {
    if (disposed) return;
    disposed = true; cancelAnimationFrame(frame); abort.abort(); resizeObserver.disconnect(); panelResizeObserver.disconnect();
    panel.dispose(); labelLayer.replaceChildren();
    const geometries = new Set<BufferGeometry>();
    const materials = new Set<import('three').Material>();
    scene.traverse((object) => {
      if (object instanceof Mesh || object instanceof Points || object instanceof Line) {
        geometries.add(object.geometry);
        for (const material of Array.isArray(object.material) ? object.material : [object.material]) materials.add(material);
      }
    });
    geometries.forEach((geometry) => geometry.dispose()); materials.forEach((material) => material.dispose());
    // Keep a retained canvas reusable on Astro page-load and bfcache restoration.
    // Geometry/material buffers and renderer caches are explicitly released above.
    scene.clear(); renderer.dispose();
  };
}

function addStarfield(scene: Scene) {
  const positions: number[] = [];
  const colors: number[] = [];
  let seed = 777;
  const random = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  for (let i = 0; i < 2800; i++) {
    let x = (random() - .5) * 450;
    const y = (random() - .5) * 280;
    if (Math.abs(x) < 22 && Math.abs(y) < 14) x += x < 0 ? -25 : 25;
    positions.push(x, y, 110 - random() * 850);
    const brightness = .28 + random() * .55;
    colors.push(brightness * .85, brightness * .92, brightness);
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new Float32BufferAttribute(colors, 3));
  scene.add(new Points(geometry, new PointsMaterial({ size: .23, sizeAttenuation: true, vertexColors: true, transparent: true, opacity: .8 })));
}

function addRouteMarkers(scene: Scene) {
  const vertices: number[] = [];
  for (let z = 12; z > -ROUTE_LENGTH - 20; z -= 8) {
    for (const x of [-3.3, 3.3]) vertices.push(x, -2.7, z, x, -2.7, z - 2.4);
    if (z % 24 === 12) vertices.push(-.45, -2.7, z, .45, -2.7, z);
  }
  const geometry = new BufferGeometry(); geometry.setAttribute('position', new Float32BufferAttribute(vertices, 3));
  scene.add(new LineSegments(geometry, new LineBasicMaterial({ color: '#77a4b8', transparent: true, opacity: .2 })));
}
