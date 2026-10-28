import { Group, Mesh, MeshStandardMaterial, SphereGeometry } from 'three';
import type { SatelliteData } from './universeData';

export class Satellite {
  readonly group = new Group();
  readonly mesh: Mesh<SphereGeometry, MeshStandardMaterial>;
  private angle: number;

  constructor(readonly data: SatelliteData, color: string) {
    this.angle = data.phase;
    this.mesh = new Mesh(new SphereGeometry(data.radius, 20, 14), new MeshStandardMaterial({ color: '#c1cad6', roughness: .65, emissive: color, emissiveIntensity: .16, flatShading: true }));
    this.group.add(this.mesh); this.update(0, false);
  }

  update(dt: number, animate: boolean) {
    if (animate) this.angle += dt * .035;
    this.group.position.set(Math.cos(this.angle) * this.data.orbit, Math.sin(this.angle) * this.data.orbit * .48 + .4, Math.sin(this.angle) * 1.7);
  }

  highlight(active: boolean) { this.mesh.material.emissiveIntensity = active ? .9 : .16; }
}
