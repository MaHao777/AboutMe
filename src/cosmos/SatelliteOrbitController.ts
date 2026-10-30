const TAU = Math.PI * 2;
const INPUT_SETTLE_TIME = .12;
const SNAP_IDLE_DELAY = .2;
const SNAP_DURATION = .32;
const signedAngle = (angle: number) => ((angle + Math.PI) % TAU + TAU) % TAU - Math.PI;

/** One rotation for the entire system preserves the safe spacing between satellites. */
export class SatelliteOrbitController {
  readonly phases: readonly number[];
  rotation = 0;
  targetRotation = 0;
  active = false;
  readonly order: readonly number[];
  frontAngle = Math.PI / 2;
  private selected = -1;
  private clickTarget: number | null = null;
  private wheelStart = 0;
  private wheelElapsed = 0;
  private wheelPending = false;
  private quietElapsed = 0;
  private snapPending = false;
  private snapIndex: number | null = null;
  private snapStart = 0;
  private snapElapsed = 0;
  private immediateWheel = false;
  private lastWheelIncrement = 0;
  private anchors: { angle: number; index: number }[];

  constructor(phases: readonly number[]) {
    this.phases = [...phases];
    this.anchors = phases.map((angle, index) => ({ angle: ((angle % TAU) + TAU) % TAU, index })).sort((a, b) => a.angle - b.angle);
    this.order = this.anchors.map((entry) => entry.index);
  }

  get contentPosition() {
    if (this.anchors.length < 2) return 0;
    const cursor = this.frontAngle - this.rotation;
    const cycle = Math.floor((cursor - this.anchors[0].angle) / TAU);
    const local = cursor - cycle * TAU;
    const slot = this.anchors.findLastIndex((entry) => entry.angle <= local + 1e-10);
    const start = this.anchors[Math.max(0, slot)].angle;
    const end = slot + 1 < this.anchors.length ? this.anchors[slot + 1].angle : this.anchors[0].angle + TAU;
    return cycle * this.anchors.length + Math.max(0, slot) + (local - start) / (end - start);
  }

  get selectedIndex() { return this.selected; }
  get isFrontAligned() {
    return this.selected >= 0 && Math.abs(signedAngle(this.phases[this.selected] + this.rotation - this.frontAngle)) < .12;
  }

  enter(index = 0, frontAngle = this.frontAngle) {
    this.active = true;
    this.frontAngle = frontAngle;
    this.selected = this.phases.length ? Math.max(0, Math.min(this.phases.length - 1, index)) : -1;
    if (this.selected >= 0) this.rotation = this.frontAngle - this.phases[this.selected];
    this.stop();
  }

  setFrontAngle(angle: number) {
    const difference = angle - this.frontAngle;
    this.frontAngle = angle; this.rotation += difference; this.targetRotation += difference;
    this.wheelStart += difference; this.snapStart += difference;
  }

  select(index: number, immediate = false) {
    if (!this.active || !Number.isInteger(index) || index < 0 || index >= this.phases.length) return;
    this.targetRotation = this.rotation + signedAngle(this.frontAngle - this.phases[index] - this.rotation);
    this.wheelPending = false; this.snapPending = false; this.snapIndex = null;
    this.clickTarget = index;
    if (immediate) { this.rotation = this.targetRotation; this.selected = index; this.clickTarget = null; }
  }

  step(direction: number, immediate = false) {
    if (!this.active || !this.phases.length || !direction) return;
    const current = this.order.indexOf(this.clickTarget ?? this.snapIndex ?? this.selected);
    this.select(this.order[(current + Math.sign(direction) + this.order.length) % this.order.length], immediate);
  }

  wheel(delta: number, deltaMode = 0, pageHeight = 900, immediate = false) {
    if (!this.active || !this.phases.length || !Number.isFinite(delta) || delta === 0) return;
    const pixels = delta * (deltaMode === 1 ? 16 : deltaMode === 2 ? pageHeight : 1);
    if (!Number.isFinite(pixels)) return;
    const increment = -Math.max(-240, Math.min(240, pixels)) * .006;
    // New wheel input always owns the angle again, even halfway through a snap.
    // Matching detents accumulate, while reversing discards old unfinished input.
    if (this.clickTarget !== null || this.snapIndex !== null || Math.sign(this.targetRotation - this.rotation) !== Math.sign(increment)) this.targetRotation = this.rotation;
    this.targetRotation += increment;
    this.wheelStart = this.rotation; this.wheelElapsed = 0;
    this.wheelPending = true; this.clickTarget = null; this.snapIndex = null;
    this.quietElapsed = 0; this.snapPending = true;
    this.immediateWheel = immediate; this.lastWheelIncrement = increment;
    if (immediate) {
      const previous = this.contentPosition;
      this.rotation = this.targetRotation; this.wheelPending = false;
      this.commitCrossing(previous);
    }
  }

  stop() {
    this.targetRotation = this.rotation; this.clickTarget = null; this.wheelPending = false;
    this.snapPending = false; this.snapIndex = null; this.quietElapsed = 0; this.snapElapsed = 0;
  }

  exit() {
    this.active = false; this.stop();
  }

  private commitCrossing(previous: number) {
    const current = this.contentPosition;
    if (!this.order.length || Math.abs(current - previous) < 1e-10) return;
    const forward = current > previous;
    const before = forward ? Math.floor(previous + 1e-9) : Math.ceil(previous - 1e-9);
    const after = forward ? Math.floor(current + 1e-9) : Math.ceil(current - 1e-9);
    if (after !== before) this.selected = this.order[((after % this.order.length) + this.order.length) % this.order.length];
  }

  private beginSnap() {
    let nearest = 0, difference = Infinity;
    this.phases.forEach((phase, index) => {
      const candidate = signedAngle(this.frontAngle - phase - this.rotation);
      const nearer = Math.abs(candidate) < Math.abs(difference) - 1e-10;
      const tiedInDirection = Math.abs(Math.abs(candidate) - Math.abs(difference)) < 1e-10 && Math.sign(candidate) === Math.sign(this.lastWheelIncrement);
      if (nearer || tiedInDirection) { nearest = index; difference = candidate; }
    });
    this.snapPending = false;
    this.snapStart = this.rotation; this.snapElapsed = 0;
    this.targetRotation = this.rotation + difference;
    this.snapIndex = nearest;
    if (this.immediateWheel || Math.abs(difference) < 1e-10) {
      this.rotation = this.targetRotation; this.selected = nearest; this.snapIndex = null;
    }
  }

  update(delta: number, animate = true) {
    const elapsed = Number.isFinite(delta) ? Math.max(0, delta) : 0;
    const dt = Math.min(.05, elapsed);
    if (!this.active) {
      if (animate) this.rotation += dt * .035;
      this.targetRotation = this.rotation;
      return;
    }
    if (this.wheelPending) {
      const previous = this.contentPosition;
      this.wheelElapsed = Math.min(INPUT_SETTLE_TIME, this.wheelElapsed + elapsed);
      const fraction = this.wheelElapsed / INPUT_SETTLE_TIME;
      this.rotation = this.wheelStart + (this.targetRotation - this.wheelStart) * (1 - (1 - fraction) ** 3);
      if (fraction === 1) { this.rotation = this.targetRotation; this.wheelPending = false; }
      this.commitCrossing(previous);
    }
    let snapDelta = elapsed;
    if (this.snapPending) {
      this.quietElapsed += elapsed;
      if (!this.wheelPending && this.quietElapsed >= SNAP_IDLE_DELAY) {
        this.beginSnap();
        // Only integrate time after the quiet threshold, including a long frame.
        snapDelta = this.quietElapsed - SNAP_IDLE_DELAY;
      }
    }
    if (this.snapIndex !== null) {
      const previous = this.contentPosition;
      this.snapElapsed = Math.min(SNAP_DURATION, this.snapElapsed + snapDelta);
      const fraction = this.snapElapsed / SNAP_DURATION;
      const eased = fraction * fraction * (3 - 2 * fraction);
      this.rotation = this.snapStart + (this.targetRotation - this.snapStart) * eased;
      this.commitCrossing(previous);
      if (fraction === 1) {
        this.rotation = this.targetRotation; this.selected = this.snapIndex; this.snapIndex = null;
      }
      return;
    }
    if (this.clickTarget === null) return;
    const previous = this.contentPosition;
    this.rotation += (this.targetRotation - this.rotation) * (1 - Math.exp(-9 * dt));
    this.commitCrossing(previous);
    if (Math.abs(this.targetRotation - this.rotation) < .0001) {
      this.rotation = this.targetRotation; this.selected = this.clickTarget; this.clickTarget = null;
    }
  }
}
