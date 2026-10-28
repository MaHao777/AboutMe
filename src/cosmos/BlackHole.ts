import { DoubleSide, Group, Mesh, MeshBasicMaterial, RingGeometry, SphereGeometry, TorusGeometry } from 'three';
import { BLACK_HOLE_Z } from './universeData';

export class BlackHole {
  readonly group = new Group();
  private disk: Mesh;

  constructor() {
    this.group.position.set(0, 1.3, BLACK_HOLE_Z);
    this.group.add(new Mesh(new SphereGeometry(6.8, 48, 32), new MeshBasicMaterial({ color: '#010103' })));
    const rim = new Mesh(new TorusGeometry(7, .1, 12, 96), new MeshBasicMaterial({ color: '#ffd6a0' }));
    this.group.add(rim);
    this.disk = new Mesh(new RingGeometry(7.1, 11.8, 100), new MeshBasicMaterial({ color: '#d9a568', side: DoubleSide, transparent: true, opacity: .43, depthWrite: false }));
    this.disk.rotation.x = 1.15; this.disk.rotation.y = -.13;
    this.group.add(this.disk);
    const outer = new Mesh(new RingGeometry(7.3, 7.6, 100), new MeshBasicMaterial({ color: '#ffcf8c', side: DoubleSide, transparent: true, opacity: .25, depthWrite: false }));
    this.group.add(outer);
  }

  update(dt: number) { this.disk.rotation.z += dt * .08; }
}
