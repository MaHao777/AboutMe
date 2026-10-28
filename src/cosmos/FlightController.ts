export type FlightMode = 'flight' | 'exploring' | 'returning' | 'departing' | 'arriving';

/** Pure flight state; no scroll position or camera state is a second source of truth. */
export class FlightController {
  flightProgress = 0;
  velocity = 0;
  mode: FlightMode = 'flight';
  transitionOpacity = 0;
  loops = 0;
  private transitionTime = 0;
  private input = 0;
  private heldDirection = 0;

  readonly routeLength: number;

  constructor(routeLength: number) { this.routeLength = routeLength; }

  get distance() { return this.flightProgress * this.routeLength; }

  wheel(delta: number, deltaMode = 0, pageHeight = 900) {
    if (this.mode !== 'flight' || !Number.isFinite(delta)) return;
    const pixels = delta * (deltaMode === 1 ? 16 : deltaMode === 2 ? pageHeight : 1);
    // Consume on the next frame so a fast trackpad and a mouse use the same state path.
    this.input += Math.max(-240, Math.min(240, pixels)) * .09;
  }

  hold(direction: number) {
    this.heldDirection = this.mode === 'flight' ? Math.sign(direction) : 0;
  }

  stop() { this.velocity = 0; this.input = 0; this.heldDirection = 0; }

  explore() {
    if (this.mode !== 'flight') return false;
    this.stop(); this.mode = 'exploring'; return true;
  }

  resume() {
    if (this.mode !== 'exploring') return;
    this.stop(); this.mode = 'returning'; this.transitionTime = 0;
  }

  restart() {
    if (this.mode !== 'flight') return;
    this.startLoop();
  }

  private startLoop() {
    this.stop(); this.mode = 'departing'; this.transitionTime = 0;
  }

  update(delta: number) {
    const dt = Math.max(0, Math.min(.05, delta));
    if (this.mode === 'exploring') return;
    if (this.mode === 'returning') {
      this.transitionTime += dt;
      if (this.transitionTime >= .85) this.mode = 'flight';
      return;
    }
    if (this.mode === 'departing' || this.mode === 'arriving') {
      this.transitionTime += dt;
      if (this.mode === 'departing') {
        this.transitionOpacity = Math.min(1, this.transitionTime / .75);
        if (this.transitionTime >= .85) {
          this.flightProgress = 0; this.stop(); this.loops++;
          this.mode = 'arriving'; this.transitionTime = 0;
        }
      } else {
        this.transitionOpacity = Math.max(0, 1 - this.transitionTime / .95);
        if (this.transitionTime >= 1) { this.mode = 'flight'; this.transitionOpacity = 0; }
      }
      return;
    }
    const desired = Math.max(-48, Math.min(48, this.velocity + this.input + this.heldDirection * 100 * dt));
    this.input = 0;
    this.velocity = desired;
    const damping = 4.2;
    const decay = Math.exp(-damping * dt);
    // Integrate exponential decay exactly, independent of frame rate.
    const next = this.distance + this.velocity * (1 - decay) / damping;
    this.velocity *= decay;
    if (Math.abs(this.velocity) < .025) this.velocity = 0;
    this.flightProgress = Math.max(0, Math.min(1, next / this.routeLength));
    if (next <= 0 && this.velocity < 0) this.stop();
    if (this.flightProgress >= 1) this.startLoop();
  }
}
