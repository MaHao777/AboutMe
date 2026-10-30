import { Group, Mesh, RingGeometry, ShaderMaterial, SphereGeometry } from 'three';
import type { PlanetData } from './universeData';
import { PLANET_HALO_SCALE, PLANET_RING_OUTER_SCALE } from './orbits';
import { createAtmosphere, createPlanetRing, createPlanetSurface } from './planetMaterials';

export class Planet {
  readonly group = new Group();
  readonly mesh: Mesh<SphereGeometry, ShaderMaterial>;
  private halo: Mesh<SphereGeometry, ShaderMaterial>;
  private glow = 0;
  private glowTarget = 0;

  constructor(readonly data: PlanetData) {
    const theme = Math.max(0, ['profile','research','internship','life','contact'].indexOf(data.id));
    this.mesh = new Mesh(new SphereGeometry(data.radius, 80, 56), createPlanetSurface(theme, data.color));
    this.mesh.rotation.set(.08, theme * .83, theme === 3 ? .18 : -.08);
    this.group.position.fromArray(data.position);
    this.group.add(this.mesh);
    this.halo = new Mesh(new SphereGeometry(data.radius * PLANET_HALO_SCALE, 64, 48), createAtmosphere(data.color));
    this.group.add(this.halo);
    if (data.ring) {
      const ring = new Mesh(new RingGeometry(1.19, PLANET_RING_OUTER_SCALE, 160, 2), createPlanetRing(data.color, data.id === 'life'));
      ring.scale.setScalar(data.radius);
      ring.rotation.set(1.1, .18, -.28); this.group.add(ring);
    }
  }

  highlight(active: boolean) {
    this.glowTarget = active ? 1 : 0;
  }

  update(dt: number, animate = true, reducedMotion = false) {
    if (animate) this.mesh.rotation.y += dt * .055;
    this.glow += (this.glowTarget - this.glow) * (reducedMotion ? 1 : 1 - Math.exp(-dt * 10));
    this.halo.material.uniforms.uHighlight.value = this.glow;
  }
}
