import {
  ACESFilmicToneMapping, AmbientLight, BufferGeometry, Color, DirectionalLight, Float32BufferAttribute,
  FogExp2, HemisphereLight, Line, Mesh, PerspectiveCamera,
  Points, PointsMaterial, Raycaster, Scene, SRGBColorSpace, Vector2, Vector3, WebGLRenderer,
} from 'three';
import { BlackHole } from './BlackHole';
import { CameraController } from './CameraController';
import { FlightController } from './FlightController';
import { PlanetInfoPanel } from './PlanetInfoPanel';
import { PlanetSystem } from './PlanetSystem';
import { Spaceship } from './Spaceship';
import { ParticleMotto } from './ParticleMotto';
import { WarpTransit } from './WarpTransit';
import { BLACK_HOLE_Z, ROUTE_LENGTH, universeData } from './universeData';
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
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  const scene = new Scene();
  scene.background = new Color('#050811');
  scene.fog = new FogExp2('#050811', .00165);
  scene.add(new AmbientLight('#b3c5de', .3));
  scene.add(new HemisphereLight('#b7d3ec', '#10182c', .95));
  const key = new DirectionalLight('#fff0dc', 2.5);
  scene.add(key, key.target);
  const rim = new DirectionalLight('#6697d4', 1.4);
  rim.position.set(35, 12, -90); scene.add(rim, rim.target);
  const rig = new CameraController();
  const flight = new FlightController(ROUTE_LENGTH);
  const ship = new Spaceship(); scene.add(ship.group);
  const blackHole = new BlackHole(); scene.add(blackHole.group);
  const motto = new ParticleMotto(); scene.add(motto.group);
  const warp = new WarpTransit(); scene.add(warp.group);
  const systems = universeData.map((data) => new PlanetSystem(data));
  systems.forEach((system) => scene.add(system.planet.group));
  addStarfield(scene);

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
    element.dataset.visible = 'false'; element.inert = true; element.tabIndex = -1;
    element.setAttribute('aria-hidden', 'true');
    const surface = document.createElement('span'); surface.className = 'label-surface';
    const heading = document.createElement('span'); heading.className = 'label-heading';
    const eyebrow = document.createElement('span'); eyebrow.className = 'label-index';
    eyebrow.textContent = target.satellite ? '↗ 项目卫星' : `${target.planet.index} / ${target.planet.subtitle}`;
    const title = document.createElement('strong'); title.textContent = target.entry.title;
    heading.append(eyebrow, title); surface.append(heading);
    if (!target.satellite) {
      const preview = document.createElement('span'); preview.className = 'label-preview'; preview.setAttribute('aria-hidden', 'true');
      const inner = document.createElement('span'); inner.className = 'label-preview-inner';
      const description = document.createElement('span'); description.className = 'label-description'; description.textContent = target.entry.description;
      const summary = document.createElement('span'); summary.className = 'label-summary'; summary.textContent = target.entry.body.join(' ');
      const hint = document.createElement('span'); hint.className = 'label-hint'; hint.textContent = '进入这颗星球 ↗';
      inner.append(description, summary, hint); preview.append(inner); surface.append(preview);
      element.dataset.expanded = 'false'; element.setAttribute('aria-expanded', 'false');
    }
    element.append(surface);
    element.setAttribute('aria-label', `探索${target.entry.title}`);
    element.addEventListener('click', () => explore(target));
    element.addEventListener('pointerenter', () => { pointerInside = false; setHover(target); });
    element.addEventListener('pointerleave', () => setHover(null));
    element.addEventListener('focus', () => {
      if (element.matches(':focus-visible')) { focusedLabel = target; refreshLabelExpansion(); }
    });
    element.addEventListener('blur', () => {
      if (focusedLabel === target) { focusedLabel = null; refreshLabelExpansion(); }
    });
    labelLayer.append(element); labels.push({ element, target, anchor: new Vector3() });
  }

  let selected: ExploreTarget | null = null;
  let hovered: ExploreTarget | null = null;
  let focusedLabel: ExploreTarget | null = null;
  let hoverExit: ReturnType<typeof setTimeout> | undefined;
  let labelMode = flight.mode;
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
  const panelHost = host.querySelector<HTMLElement>('[data-info-panel]')!;
  const panel = new PlanetInfoPanel(panelHost, closePanel, (planet, id) => {
    const target = targets.find((entry) => entry.planet.id === planet.id && entry.entry.id === id);
    if (target) explore(target);
  }, () => { exploredSystem?.orbit.stop(); setHover(null, true); });

  function refreshLabelExpansion() {
    for (const label of labels) {
      if (label.target.satellite) continue;
      const expanded = flight.mode === 'flight' && (label.target === hovered || label.target === focusedLabel);
      if (label.element.dataset.expanded === String(expanded)) continue;
      label.element.dataset.expanded = String(expanded);
      label.element.setAttribute('aria-expanded', String(expanded));
      label.element.querySelector('.label-preview')!.setAttribute('aria-hidden', String(!expanded));
    }
  }

  function setHover(target: ExploreTarget | null, immediate = false) {
    if (target || immediate) { clearTimeout(hoverExit); hoverExit = undefined; }
    // 给鼠标从球面移到简介卡片留出短暂缓冲，反向移回可立即打断收起。
    if (!target && !immediate && hovered && !hovered.satellite && flight.mode === 'flight') {
      hoverExit ??= setTimeout(() => { hoverExit = undefined; setHover(null, true); }, 130);
      return;
    }
    if (hovered === target) { if (immediate) refreshLabelExpansion(); return; }
    if (hovered !== selected) hovered?.highlight(false);
    hovered = target; hovered?.highlight(true);
    canvas.style.cursor = target ? 'pointer' : 'default';
    refreshLabelExpansion();
  }

  function explore(target: ExploreTarget) {
    if (panel.isDetailOpen) return;
    if (flight.mode !== 'flight' && flight.mode !== 'exploring') return;
    if (flight.mode === 'flight' && !flight.explore()) return;
    setHover(null, true);
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
      setHover(null, true); selected?.highlight(false); selected = target; lastFrontAligned = undefined;
      live.textContent = `${target.planet.title}，当前项目：${target.entry.title}。`;
    }
    const aligned = exploredSystem.orbit.isFrontAligned;
    selected.highlight(aligned || hovered === selected);
    if (aligned !== lastFrontAligned) {
      lastFrontAligned = aligned;
      labels.forEach((label) => {
        const current = label.target === selected && aligned;
        label.element.dataset.selected = String(current);
        if (label.target.satellite) {
          label.element.setAttribute('aria-pressed', String(current));
          label.element.querySelector('.label-index')!.textContent = current ? '● 当前卫星' : '↗ 项目卫星';
        }
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
    host.dataset.exploring = 'false'; setHover(null, true);
    lastFrontAligned = undefined;
    labels.forEach((label) => {
      label.element.dataset.selected = 'false';
      if (label.target.satellite) {
        label.element.setAttribute('aria-pressed', 'false');
        label.element.querySelector('.label-index')!.textContent = '↗ 项目卫星';
      }
    });
    delete host.dataset.orbitRotation; delete host.dataset.satellite; delete host.dataset.planet;
    delete host.dataset.orbitContentPosition; delete host.dataset.frontAngle; delete host.dataset.selectedFront;
    delete host.dataset.planetSpin;
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
  // Touch uses the same wheel state paths; detail documents keep native scrolling.
  let touch: { id: number; y: number; startY: number; moved: boolean } | null = null;
  let suppressTouchClick = false;
  host.addEventListener('pointerdown', (event) => {
    if (event.pointerType !== 'touch') return;
    suppressTouchClick = false;
    if (panel.isDetailOpen || !(event.target instanceof Element) || !event.target.closest('canvas, .panel-scroll')) return;
    touch = { id: event.pointerId, y: event.clientY, startY: event.clientY, moved: false };
  }, { signal });
  host.addEventListener('pointermove', (event) => {
    if (!touch || touch.id !== event.pointerId) return;
    const delta = touch.y - event.clientY;
    touch.y = event.clientY;
    if (!touch.moved && Math.abs(event.clientY - touch.startY) < 8) return;
    touch.moved = true;
    if (exploredSystem) exploredSystem.orbit.wheel(delta * 2, 0, height, motion.matches);
    else flight.wheel(delta * 4, 0, height);
  }, { signal });
  const endTouch = () => { suppressTouchClick = touch?.moved ?? false; touch = null; };
  host.addEventListener('pointerup', endTouch, { signal });
  host.addEventListener('pointercancel', endTouch, { signal });
  host.addEventListener('click', (event) => {
    if (suppressTouchClick) { event.preventDefault(); event.stopImmediatePropagation(); suppressTouchClick = false; }
  }, { capture: true, signal });
  let panelPointerStart: { x: number; y: number; exploring: boolean; detail: boolean; leftScene: boolean } | null = null;
  host.addEventListener('pointerdown', (event) => {
    const inPanel = event.target instanceof Element && !!event.target.closest('[data-info-panel]');
    panelPointerStart = {
      x: event.clientX, y: event.clientY, exploring: !!exploredSystem, detail: panel.isDetailOpen,
      leftScene: !inPanel && event.clientX < panelHost.getBoundingClientRect().left,
    };
  }, { signal });
  host.addEventListener('click', (event) => {
    const started = panelPointerStart;
    panelPointerStart = null;
    if (!started?.exploring || !exploredSystem || event.detail === 0 || !(event.target instanceof Element)) return;
    if (event.target.closest('a, button, input, textarea, select, summary, video, audio, [role="button"], [contenteditable]')) return;
    if (Math.hypot(event.clientX - started.x, event.clientY - started.y) > 6) return;
    if (window.getSelection()?.isCollapsed === false) return;
    const inPanel = !!event.target.closest('[data-info-panel]');
    if (started.leftScene && !inPanel && event.clientX < panelHost.getBoundingClientRect().left) {
      // 一级页仍可点击卫星切换项目；二级页点击左侧场景直接返回飞船。
      if (!started.detail && event.target === canvas && pick()) return;
      event.stopPropagation(); closePanel(); return;
    }
    // 只有在二级页开始的点击才能返回一级，避免打开详情的事件又把它关闭。
    if (!started.detail || !panel.isDetailOpen) return;
    const reader = event.target.closest<HTMLElement>('[data-detail-scroll]');
    if (reader && event.clientX >= reader.getBoundingClientRect().left + reader.clientWidth) return;
    event.stopPropagation();
    panel.closeDetail();
  }, { signal });
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
  window.addEventListener('blur', () => { flight.stop(); pointerInside = false; setHover(null, true); }, { signal });
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
    if (labelMode !== flight.mode) { labelMode = flight.mode; refreshLabelExpansion(); }
    const topInset = host.querySelector<HTMLElement>('.cosmos-header')!.offsetHeight + 12;
    for (const label of labels) {
      label.target.mesh.getWorldPosition(world);
      view.copy(world).applyMatrix4(camera.matrixWorldInverse);
      const distance = camera.position.distanceTo(world);
      const exploringThisSystem = selected?.planet.id === label.target.planet.id;
      const near = label.target.satellite ? distance < (exploringThisSystem ? 160 : 47) : distance < 105;
      const visibleMode = (flight.mode === 'flight' && !label.target.satellite) || (flight.mode === 'exploring' && exploringThisSystem && label.target.satellite && ((label.target === selected && exploredSystem?.orbit.isFrontAligned) || label.target === hovered));
      // Label anchors sit above their own sphere, in world space, so perspective is real.
      label.anchor.copy(world); label.anchor.y += label.target.radius + (label.target.satellite ? .6 : 1.5);
      projected.copy(label.anchor).project(camera);
      const x = (projected.x * .5 + .5) * width;
      const y = (-projected.y * .5 + .5) * height;
      const labelWidth = label.target.satellite ? 148 : Math.min(280, width - 32);
      const coveredByPanel = !!selected && x > width - Math.min(410, width * .42) - labelWidth / 2;
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
      if (label.element.dataset.visible !== String(!hidden)) {
        label.element.dataset.visible = String(!hidden);
        label.element.inert = hidden;
        label.element.tabIndex = hidden ? -1 : 0;
        label.element.setAttribute('aria-hidden', String(hidden));
      }
      if (!hidden) {
        // 按动画中的实际高度避让页眉，展开时锚点不会突然跳动。
        const labelHeight = label.element.offsetHeight || (label.target.satellite ? 58 : 70);
        const outwardX = x + (label.target.satellite ? 0 : x < width/2 ? -64 : 64);
        const labelX = Math.max(labelWidth / 2 + 12, Math.min(width - labelWidth / 2 - 12, outwardX));
        const labelY = Math.max(topInset + labelHeight, Math.min(height - 45, y));
        label.element.style.transform = `translate3d(${labelX}px,${labelY}px,0) translate(-50%,-100%)`;
        label.element.style.setProperty('--label-opacity', String(label.target.satellite ? 1 : Math.max(0, Math.min(1, (110 - distance) / 25))));
      }
    }
  }

  function updateFlightState() {
    host.dataset.state = flight.mode;
    host.dataset.progress = flight.flightProgress.toFixed(5);
    host.dataset.velocity = flight.velocity.toFixed(3);
    host.dataset.loops = String(flight.loops);
    host.dataset.transitProgress = flight.transitProgress.toFixed(5);
    host.dataset.mottoLanguage = motto.language;
    host.dataset.mottoMorph = motto.morphProgress.toFixed(4);
    host.dataset.mottoElapsed = motto.elapsedSeconds.toFixed(2);
    if (exploredSystem) {
      host.dataset.planet = exploredSystem.data.id;
      host.dataset.satellite = selected?.entry.id ?? '';
      host.dataset.orbitRotation = exploredSystem.orbit.rotation.toFixed(5);
      host.dataset.orbitContentPosition = exploredSystem.orbit.contentPosition.toFixed(6);
      host.dataset.frontAngle = exploredSystem.orbit.frontAngle.toFixed(6);
      host.dataset.selectedFront = String(exploredSystem.orbit.isFrontAligned);
      host.dataset.planetSpin = exploredSystem.planet.mesh.rotation.y.toFixed(6);
    }
  }

  function render(timestamp: number) {
    if (disposed || contextLost || document.hidden) return;
    const elapsed = lastTime ? Math.max(0, (timestamp - lastTime) / 1000) : 1 / 60;
    const dt = Math.min(.05, elapsed);
    lastTime = timestamp; time += dt; stateTime += dt;
    flight.update(dt);
    if (flight.loops !== lastLoops) {
      rig.snap(0); ship.update(0, 0, time, motion.matches); lastLoops = flight.loops;
      live.textContent = '已穿过黑洞，回到宇宙起点。';
    }
    const transit = flight.transitProgress;
    const departing = flight.mode === 'departing';
    const smoothRange = (a: number, b: number, value: number) => {
      const t = Math.max(0, Math.min(1, (value - a) / (b - a)));
      return t * t * (3 - 2 * t);
    };
    const shipScale = motion.matches || transit === 0 ? 1 : departing ? 1 - smoothRange(.08, .28, transit) : smoothRange(.75, .94, transit);
    const shipDistance = departing && !motion.matches ? flight.distance + (-BLACK_HOLE_Z + 10 - flight.distance) * (transit * 2) ** 2 : flight.distance;
    ship.update(shipDistance, departing && !motion.matches ? 48 : flight.velocity, time, motion.matches);
    ship.group.scale.setScalar(Math.max(.001, shipScale));
    ship.group.visible = !exploredSystem && shipScale > .005;
    rig.update(dt, flight.distance, flight.velocity, focusedPosition && exploredSystem ? { position: focusedPosition, radius: exploredSystem.extent, panelFraction: focusPanelFraction } : null, transit, motion.matches);
    key.position.set(-25, 28, -flight.distance + 35); key.target.position.set(0, 0, -flight.distance - 50);
    rim.position.set(30, 8, -flight.distance - 35); rim.target.position.set(0, 0, -flight.distance);
    const animateOrbit = !motion.matches && flight.mode !== 'exploring';
    systems.forEach((system) => system.update(dt, animateOrbit, motion.matches));
    syncOrbitSelection();
    blackHole.update(dt, rig.camera, motion.matches, !!exploredSystem);
    motto.update(elapsed, rig.camera, motion.matches);
    warp.update(transit, rig.camera, motion.matches, width / Math.max(1, height));
    renderer.render(scene, rig.camera);
    if (pointerInside) setHover(pick());
    updateLabels(rig.camera);
    if (stateTime > .08) { updateFlightState(); stateTime = 0; }
    veil.style.opacity = String(flight.transitionOpacity);
    veil.hidden = flight.transitionOpacity === 0;
    frame = requestAnimationFrame(render);
  }

  host.dataset.state = 'flight'; updateFlightState(); frame = requestAnimationFrame(render);
  return () => {
    if (disposed) return;
    disposed = true; cancelAnimationFrame(frame); abort.abort(); resizeObserver.disconnect(); panelResizeObserver.disconnect();
    clearTimeout(hoverExit);
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
