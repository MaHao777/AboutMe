import { Color, DoubleSide, Group, Mesh, MeshBasicMaterial, MeshStandardMaterial, RingGeometry, SphereGeometry } from 'three';
import type { PlanetData } from './universeData';

export class Planet {
  readonly group = new Group();
  readonly mesh: Mesh<SphereGeometry, MeshStandardMaterial>;
  private halo: Mesh;
  private color: Color;

  constructor(readonly data: PlanetData) {
    this.color = new Color(data.color);
    this.mesh = new Mesh(new SphereGeometry(data.radius, 40, 28), new MeshStandardMaterial({ color: this.color, roughness: .85, metalness: .12, flatShading: true, emissive: this.color, emissiveIntensity: .035 }));
    this.group.position.fromArray(data.position);
    this.group.add(this.mesh);
    this.halo = new Mesh(new SphereGeometry(data.radius * 1.055, 32, 20), new MeshBasicMaterial({ color: this.color, transparent: true, opacity: .055, wireframe: true, depthWrite: false }));
    this.group.add(this.halo);
    if (data.ring) {
      const ring = new Mesh(new RingGeometry(data.radius * 1.2, data.radius * 1.55, 72), new MeshBasicMaterial({ color: this.color, side: DoubleSide, transparent: true, opacity: .24, depthWrite: false }));
      ring.rotation.set(1.1, .18, -.28); this.group.add(ring);
    }
  }

  highlight(active: boolean) {
    this.mesh.material.emissiveIntensity = active ? .34 : .035;
    (this.halo.material as MeshBasicMaterial).opacity = active ? .23 : .055;
  }

  update(dt: number) { this.mesh.rotation.y += dt * .055; }
}
