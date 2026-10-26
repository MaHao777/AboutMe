type Ripple = { x: number; y: number; born: number; amplitude: number };
type Signal = { x: number; y: number; age: number; positive: boolean; size: number };
type Point = { x: number; y: number; previousX: number; previousY: number; previousZ: number };

/** A playful optical illustration, not an event-camera or physical-wave simulation. */
export function createEventField(field: HTMLElement) {
  const canvas = field.querySelector('canvas');
  const context = canvas?.getContext('2d');
  const controls = field.querySelector<HTMLElement>('[data-event-controls]');
  const buttons = [...field.querySelectorAll<HTMLButtonElement>('[data-field-view]')];
  if (!canvas || !context || !controls) return () => {};

  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const points: Point[] = [];
  for (let row = 0; row < 37; row++) {
    for (let col = 0; col < 45; col++) {
      const x = (col - 22) / 22;
      const y = (row - 18) / 18;
      if (x * x + y * y <= 1.04) points.push({ x, y, previousX: 0, previousY: 0, previousZ: 0 });
    }
  }
  const pointer = { x: 0, y: 0, targetX: 0, targetY: 0, force: 0, active: false };
  let ripples: Ripple[] = [];
  let signals: Signal[] = [];
  let width = 0;
  let height = 0;
  let frame = 0;
  let previousTime = 0;
  let elapsed = 0;
  let lastRipple = 0;
  let inView = false;
  let disposed = false;
  let previousValid = false;
  let eventView = false;

  const render = (delta: number) => {
    if (!width || !height) return;
    context.clearRect(0, 0, width, height);
    pointer.x += (pointer.targetX - pointer.x) * .13;
    pointer.y += (pointer.targetY - pointer.y) * .13;
    pointer.force += ((pointer.active ? 1 : 0) - pointer.force) * .1;
    ripples = ripples.filter(ripple => elapsed - ripple.born < 4);
    signals = signals.filter(signal => signal.age < .8);

    const scale = Math.min(width * .43, height * .52);
    const angle = -.2 + Math.sin(elapsed * .13) * .08 + pointer.x * .12;
    const cosine = Math.cos(angle);
    const sine = Math.sin(angle);
    const projected = points.map(point => {
      const radius = Math.hypot(point.x, point.y);
      let z = Math.sin(radius * 7 - elapsed * .8) * .09 + Math.cos(point.x * 3 + elapsed * .5) * .045;
      const nearPointer = Math.hypot(point.x - pointer.x, point.y - pointer.y);
      z -= Math.exp(-nearPointer * nearPointer * 5) * pointer.force * .45;
      for (const ripple of ripples) {
        const age = elapsed - ripple.born;
        const distance = Math.hypot(point.x - ripple.x, point.y - ripple.y) - age * 1.15;
        z += Math.cos(distance * 11) * Math.exp(-distance * distance * 24 - age * .65) * ripple.amplitude;
      }
      z = Math.tanh(z / .55) * .55;
      const x = width * .5 + (point.x * cosine - point.y * sine) * scale;
      const y = height * .51 + (point.x * sine + point.y * cosine) * scale * .72 - z * scale * .72;
      const velocity = previousValid ? (z - point.previousZ) / Math.max(delta, .016) : 0;
      if (!motion.matches && previousValid && Math.abs(velocity) > .38 && signals.length < 700) {
        signals.push({ x, y, age: 0, positive: velocity > 0, size: Math.min(2.5, 1.2 + Math.abs(velocity) * .3) });
      }
      const oldX = point.previousX;
      const oldY = point.previousY;
      point.previousX = x; point.previousY = y; point.previousZ = z;
      return { x, y, z, oldX, oldY, point, velocity };
    });

    // A single path gives the surface structure without a dense background grid.
    context.beginPath();
    for (let i = 1; i < projected.length; i++) {
      const current = projected[i];
      const previous = projected[i - 1];
      if (current.point.y === previous.point.y && current.point.x - previous.point.x < .06) {
        context.moveTo(previous.x, previous.y); context.lineTo(current.x, current.y);
      }
    }
    context.strokeStyle = eventView ? '#a1c7db0b' : '#a1c7db24';
    context.lineWidth = .6;
    context.stroke();

    for (const point of projected) {
      const edge = 1 - Math.hypot(point.point.x, point.point.y) * .33;
      context.globalAlpha = eventView ? (motion.matches && Math.abs(point.z) > .1 ? .8 : .12) : .45 + edge * .45;
      context.fillStyle = point.z > .09 ? '#e8a582' : '#9cc5da';
      const size = eventView ? .8 : 1.1 + (point.z + .25) * .65;
      context.beginPath(); context.arc(point.x, point.y, Math.max(.6, size), 0, Math.PI * 2); context.fill();
      if (!eventView && previousValid && Math.abs(point.velocity) > .8) {
        context.globalAlpha = .15;
        context.beginPath(); context.moveTo(point.oldX, point.oldY); context.lineTo(point.x, point.y); context.strokeStyle = context.fillStyle; context.stroke();
      }
    }
    for (const signal of signals) {
      signal.age += delta;
      context.globalAlpha = Math.max(0, 1 - signal.age / .8) * (eventView ? .95 : .4);
      context.fillStyle = signal.positive ? '#f0a780' : '#86c2e7';
      context.fillRect(signal.x, signal.y, signal.size, signal.size);
    }
    context.globalAlpha = 1;
    previousValid = true;
  };

  const pause = () => { cancelAnimationFrame(frame); frame = 0; previousTime = 0; };
  const draw = (time: number) => {
    frame = 0;
    if (disposed || document.hidden || !inView || motion.matches) return;
    if (!previousTime || time - previousTime >= 1000 / 30) {
      const delta = previousTime ? Math.min((time - previousTime) / 1000, .065) : .033;
      previousTime = time; elapsed += delta; render(delta);
    }
    frame = requestAnimationFrame(draw);
  };
  const resume = () => {
    if (!disposed && inView && !document.hidden && !motion.matches && !frame) frame = requestAnimationFrame(draw);
  };
  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    width = rect.width; height = rect.height;
    const ratio = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    previousValid = false; signals = []; render(0);
  };
  const ripple = (x: number, y: number, amplitude = .65) => {
    ripples.push({ x, y, born: elapsed - (motion.matches ? .32 : 0), amplitude });
    ripples = ripples.slice(-8);
    if (motion.matches) { previousValid = false; render(0); }
    resume();
  };
  const position = (event: PointerEvent) => {
    const rect = canvas.getBoundingClientRect();
    return { x: Math.max(-1.15, Math.min(1.15, (event.clientX - rect.left - width * .5) / (width * .43))), y: Math.max(-1.15, Math.min(1.15, (event.clientY - rect.top - height * .51) / (height * .4))) };
  };
  const move = (event: PointerEvent) => {
    if (motion.matches) return;
    const next = position(event);
    const distance = Math.hypot(next.x - pointer.targetX, next.y - pointer.targetY);
    pointer.targetX = next.x; pointer.targetY = next.y; pointer.active = true;
    if (distance > .025 && elapsed - lastRipple > .14) {
      ripple(next.x, next.y, Math.min(.2, distance * .7)); lastRipple = elapsed;
    }
    resume();
  };
  const press = (event: PointerEvent) => { const next = position(event); ripple(next.x, next.y); };
  const leave = () => { pointer.active = false; };
  const keydown = (event: KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault(); ripple(pointer.targetX, pointer.targetY); return;
    }
    const directions: Record<string, number[]> = { ArrowLeft: [-.16, 0], ArrowRight: [.16, 0], ArrowUp: [0, -.16], ArrowDown: [0, .16] };
    const direction = directions[event.key];
    if (!direction) return;
    event.preventDefault();
    pointer.targetX = Math.max(-1, Math.min(1, pointer.targetX + direction[0]));
    pointer.targetY = Math.max(-1, Math.min(1, pointer.targetY + direction[1]));
    pointer.active = true; ripple(pointer.targetX, pointer.targetY, .3);
  };
  const setView = (event: Event) => {
    eventView = (event.currentTarget as HTMLButtonElement).dataset.fieldView === 'events';
    buttons.forEach(button => button.setAttribute('aria-pressed', String((button.dataset.fieldView === 'events') === eventView)));
    previousValid = false; signals = []; render(0);
    if (eventView && !motion.matches) ripple(0, 0, .45);
  };
  const visibility = () => {
    if (document.hidden) { pause(); pointer.active = false; signals = []; }
    else { previousValid = false; resume(); }
  };
  const preference = () => { pause(); signals = []; ripples = []; pointer.active = false; previousValid = false; render(0); resume(); };
  const viewport = new IntersectionObserver(entries => {
    inView = entries[0].isIntersecting;
    if (inView) { previousValid = false; resume(); }
    else { pause(); pointer.active = false; }
  }, { threshold: .08 });
  const observer = new ResizeObserver(resize);
  observer.observe(canvas); viewport.observe(field);
  canvas.tabIndex = 0; controls.hidden = false;
  field.classList.add('field-ready');
  canvas.addEventListener('pointermove', move, { passive: true });
  canvas.addEventListener('pointerdown', press, { passive: true });
  canvas.addEventListener('pointerleave', leave);
  canvas.addEventListener('blur', leave);
  canvas.addEventListener('keydown', keydown);
  buttons.forEach(button => button.addEventListener('click', setView));
  document.addEventListener('visibilitychange', visibility);
  motion.addEventListener('change', preference);

  return () => {
    disposed = true; pause(); observer.disconnect(); viewport.disconnect();
    canvas.removeEventListener('pointermove', move); canvas.removeEventListener('pointerdown', press);
    canvas.removeEventListener('pointerleave', leave); canvas.removeEventListener('blur', leave); canvas.removeEventListener('keydown', keydown);
    buttons.forEach(button => button.removeEventListener('click', setView));
    document.removeEventListener('visibilitychange', visibility); motion.removeEventListener('change', preference);
  };
}
