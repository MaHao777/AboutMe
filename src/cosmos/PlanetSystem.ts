import { BufferGeometry, LineLoop, LineBasicMaterial, Vector3 } from 'three';
import { Planet } from './Planet';
import { Satellite } from './Satellite';
import type { PlanetData } from './universeData';

export class PlanetSystem {
  readonly planet: Planet;
  readonly satellites: Satellite[];

  constructor(readonly data: PlanetData) {
    this.planet = new Planet(data);
    this.satellites = data.satellites.map((entry) => {
      const satellite = new Satellite(entry, data.color);
      this.planet.group.add(satellite.group);
      return satellite;
    });
    if (!data.satellites.length) return;
    const orbit = data.satellites[0].orbit;
    const points = Array.from({ length: 90 }, (_, i) => {
      const angle = i / 90 * Math.PI * 2;
      return new Vector3(Math.cos(angle) * orbit, Math.sin(angle) * orbit * .48 + .4, Math.sin(angle) * 1.7);
    });
    this.planet.group.add(new LineLoop(new BufferGeometry().setFromPoints(points), new LineBasicMaterial({ color: data.color, transparent: true, opacity: .16 })));
  }

  update(dt: number, animate: boolean) {
    if (animate) this.planet.update(dt);
    this.satellites.forEach((satellite) => satellite.update(dt, animate));
  }
}
