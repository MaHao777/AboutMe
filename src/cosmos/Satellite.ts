import { Group, Mesh, MeshStandardMaterial, SphereGeometry } from 'three';
import type { OrbitOrientation, SatelliteData } from './universeData';
import { satelliteOrbitPosition } from './orbits';

export class Satellite {
  readonly group = new Group();
  readonly mesh: Mesh<SphereGeometry, MeshStandardMaterial>;

  constructor(readonly data: SatelliteData, color: string, readonly orbitRadius: number, private orientation: OrbitOrientation) {
    this.mesh = new Mesh(new SphereGeometry(data.radius, 20, 14), new MeshStandardMaterial({ color: '#c1cad6', roughness: .65, emissive: color, emissiveIntensity: .16, flatShading: true }));
    this.group.add(this.mesh); this.update(0);
  }

  update(rotation: number) {
    this.group.position.set(...satelliteOrbitPosition(this.orbitRadius, this.data.phase + rotation, this.orientation));
  }

  highlight(active: boolean) { this.mesh.material.emissiveIntensity = active ? .9 : .16; }
}
