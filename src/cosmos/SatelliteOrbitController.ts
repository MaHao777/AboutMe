const TAU = Math.PI * 2;
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
    this.targetRotation = this.rotation; this.clickTarget = null;
  }

  setFrontAngle(angle: number) {
    const difference = angle - this.frontAngle;
    this.frontAngle = angle; this.rotation += difference; this.targetRotation += difference;
  }

  select(index: number, immediate = false) {
    if (!this.active || !Number.isInteger(index) || index < 0 || index >= this.phases.length) return;
    this.targetRotation = this.rotation + signedAngle(this.frontAngle - this.phases[index] - this.rotation);
    this.clickTarget = index;
    if (immediate) { this.rotation = this.targetRotation; this.selected = index; this.clickTarget = null; }
  }

  step(direction: number, immediate = false) {
    if (!this.active || !this.phases.length || !direction) return;
    const current = this.order.indexOf(this.clickTarget ?? this.selected);
    this.select(this.order[(current + Math.sign(direction) + this.order.length) % this.order.length], immediate);
  }

  wheel(delta: number, deltaMode = 0, pageHeight = 900) {
    if (!this.active || !this.phases.length || !Number.isFinite(delta) || delta === 0) return;
    const pixels = delta * (deltaMode === 1 ? 16 : deltaMode === 2 ? pageHeight : 1);
    const previous = this.contentPosition;
    this.rotation -= Math.max(-240, Math.min(240, pixels)) * .006;
    this.targetRotation = this.rotation; this.clickTarget = null;
    this.commitCrossing(previous);
  }

  exit() {
    this.active = false; this.targetRotation = this.rotation;
    this.clickTarget = null;
  }

  private commitCrossing(previous: number) {
    const current = this.contentPosition;
    if (!this.order.length || Math.abs(current - previous) < 1e-10) return;
    const forward = current > previous;
    const before = forward ? Math.floor(previous + 1e-9) : Math.ceil(previous - 1e-9);
    const after = forward ? Math.floor(current + 1e-9) : Math.ceil(current - 1e-9);
    if (after !== before) this.selected = this.order[((after % this.order.length) + this.order.length) % this.order.length];
  }

  update(delta: number, animate = true) {
    const dt = Math.max(0, Math.min(.05, delta));
    if (!this.active) {
      if (animate) this.rotation += dt * .035;
      this.targetRotation = this.rotation;
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
