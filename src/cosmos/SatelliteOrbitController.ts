const TAU = Math.PI * 2;
const signedAngle = (angle: number) => ((angle + Math.PI) % TAU + TAU) % TAU - Math.PI;

/** One rotation for the entire system preserves the safe spacing between satellites. */
export class SatelliteOrbitController {
  readonly phases: readonly number[];
  rotation = 0;
  targetRotation = 0;
  active = false;
  private idleTime = 0;
  private needsSnap = false;

  constructor(phases: readonly number[]) { this.phases = [...phases]; }

  private nearest(rotation: number) {
    let index = -1, nearestDistance = Infinity;
    this.phases.forEach((phase, candidate) => {
      const distance = Math.abs(signedAngle(phase + rotation));
      if (distance < nearestDistance) { index = candidate; nearestDistance = distance; }
    });
    return index;
  }

  get selectedIndex() { return this.nearest(this.rotation); }

  enter(index = this.selectedIndex) {
    this.active = true;
    this.targetRotation = this.rotation;
    this.select(index);
  }

  select(index: number) {
    if (!this.active || !Number.isInteger(index) || index < 0 || index >= this.phases.length) return;
    this.targetRotation = this.rotation + signedAngle(-this.phases[index] - this.rotation);
    this.needsSnap = false; this.idleTime = 0;
  }

  step(direction: number) {
    if (!this.active || !this.phases.length || !direction) return;
    const index = (this.nearest(this.targetRotation) + Math.sign(direction) + this.phases.length) % this.phases.length;
    this.select(index);
  }

  wheel(delta: number, deltaMode = 0, pageHeight = 900) {
    if (!this.active || !this.phases.length || !Number.isFinite(delta) || delta === 0) return;
    const pixels = delta * (deltaMode === 1 ? 16 : deltaMode === 2 ? pageHeight : 1);
    this.targetRotation -= Math.max(-240, Math.min(240, pixels)) * .018;
    this.idleTime = 0; this.needsSnap = true;
  }

  exit() {
    this.active = false; this.targetRotation = this.rotation;
    this.needsSnap = false; this.idleTime = 0;
  }

  update(delta: number, animate = true) {
    const dt = Math.max(0, Math.min(.05, delta));
    if (!this.active) {
      if (animate) this.rotation += dt * .035;
      this.targetRotation = this.rotation;
      return;
    }
    this.idleTime += dt;
    if (this.needsSnap && this.idleTime >= .22) {
      if (this.phases.length > 1) {
        const index = this.nearest(this.targetRotation);
        this.targetRotation += signedAngle(-this.phases[index] - this.targetRotation);
      }
      this.needsSnap = false;
    }
    this.rotation += (this.targetRotation - this.rotation) * (1 - Math.exp(-9 * dt));
    if (Math.abs(this.targetRotation - this.rotation) < .0001) this.rotation = this.targetRotation;
  }
}
