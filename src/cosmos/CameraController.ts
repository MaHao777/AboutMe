import { MathUtils, PerspectiveCamera, Vector3 } from 'three';
import { BLACK_HOLE_Z } from './universeData';

export interface CameraFocus { position: Vector3; radius: number; panelFraction: number; }

export class CameraController {
  readonly camera = new PerspectiveCamera(53, 1, .1, 850);
  private look = new Vector3();
  private desiredPosition = new Vector3();
  private desiredLook = new Vector3();

  constructor() { this.snap(0); }

  focusViewDirection(radius: number, panelFraction: number) {
    const tangent = Math.tan(53 * Math.PI / 360);
    const availableWidth = Math.max(.3, 1 - panelFraction - .08);
    const distance = Math.max(radius / (tangent * .73), radius / (tangent * this.camera.aspect * availableWidth));
    return new Vector3(distance * tangent * this.camera.aspect * panelFraction, distance * .14, distance);
  }

  snap(distance: number) {
    this.camera.position.set(0, 6.3, -distance + 17);
    this.look.set(0, .2, -distance - 24);
    this.camera.lookAt(this.look);
  }

  update(dt: number, distance: number, velocity: number, focus: CameraFocus | null, transit = 0, reducedMotion = false) {
    let roll = 0;
    let fov = focus ? 53 : 53 + Math.abs(velocity) * .025;
    if (focus) {
      const scale = Math.max(2.6, focus.radius);
      const direction = this.focusViewDirection(scale, focus.panelFraction);
      this.desiredPosition.copy(focus.position).add(direction);
      this.desiredLook.copy(focus.position).add(new Vector3(direction.x, 0, 0));
    } else {
      this.desiredPosition.set(0, 6.3 + Math.abs(velocity) * .009, -distance + 17 + Math.abs(velocity) * .018);
      this.desiredLook.set(0, .2, -distance - 24);
    }
    if (!focus && transit > 0 && !reducedMotion) {
      if (transit < .5) {
        const plunge = (transit * 2) ** 2;
        this.desiredPosition.set(0, MathUtils.lerp(6.3, 1.3, plunge), MathUtils.lerp(-distance + 17, BLACK_HOLE_Z - 8, plunge));
        this.desiredLook.set(0, 1.3, BLACK_HOLE_Z - 65);
        fov = 53 + plunge * 25;
        roll = Math.sin(transit * Math.PI) * .17;
      } else {
        const emerge = (1 - transit) * 2;
        this.desiredPosition.set(0, 6.3 + emerge, 17 - emerge * 8);
        this.desiredLook.set(0, .2, -24 - emerge * 12);
        fov = 53 + emerge * 15;
        roll = -Math.sin(emerge * Math.PI) * .08;
      }
    }
    const smooth = 1 - Math.exp(-6.8 * dt);
    this.camera.position.lerp(this.desiredPosition, smooth);
    this.look.lerp(this.desiredLook, smooth);
    this.camera.lookAt(this.look);
    this.camera.rotateZ(roll);
    this.camera.fov = MathUtils.lerp(this.camera.fov, fov, smooth);
    this.camera.updateProjectionMatrix();
  }
}
