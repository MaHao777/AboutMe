import { MathUtils, PerspectiveCamera, Vector3 } from 'three';

export interface CameraFocus { position: Vector3; radius: number; }

export class CameraController {
  readonly camera = new PerspectiveCamera(53, 1, .1, 850);
  private look = new Vector3();
  private desiredPosition = new Vector3();
  private desiredLook = new Vector3();

  constructor() { this.snap(0); }

  snap(distance: number) {
    this.camera.position.set(0, 6.3, -distance + 17);
    this.look.set(0, .2, -distance - 24);
    this.camera.lookAt(this.look);
  }

  update(dt: number, distance: number, velocity: number, focus: CameraFocus | null) {
    if (focus) {
      const scale = Math.max(2.6, focus.radius);
      this.desiredPosition.copy(focus.position).add(new Vector3(0, scale * .65, scale * 4.2));
      this.desiredLook.copy(focus.position).add(new Vector3(scale * .95, 0, 0));
    } else {
      this.desiredPosition.set(0, 6.3 + Math.abs(velocity) * .009, -distance + 17 + Math.abs(velocity) * .018);
      this.desiredLook.set(0, .2, -distance - 24);
    }
    const smooth = 1 - Math.exp(-6.8 * dt);
    this.camera.position.lerp(this.desiredPosition, smooth);
    this.look.lerp(this.desiredLook, smooth);
    this.camera.lookAt(this.look);
    const fov = focus ? 53 : 53 + Math.abs(velocity) * .025;
    this.camera.fov = MathUtils.lerp(this.camera.fov, fov, smooth);
    this.camera.updateProjectionMatrix();
  }
}
