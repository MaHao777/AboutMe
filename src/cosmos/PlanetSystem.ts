import { BufferGeometry, LineLoop, LineBasicMaterial, Vector3 } from 'three';
import { Planet } from './Planet';
import { Satellite } from './Satellite';
import type { PlanetData } from './universeData';
import { satelliteOrbitPosition, satelliteOrbitRadius } from './orbits';

export class PlanetSystem {
  readonly planet: Planet;
  readonly satellites: Satellite[];

  constructor(readonly data: PlanetData) {
    this.planet = new Planet(data);
    this.satellites = data.satellites.map((entry) => {
      const satellite = new Satellite(entry, data.color, satelliteOrbitRadius(data, entry));
      this.planet.group.add(satellite.group);
      const points = Array.from({ length: 90 }, (_, i) =>
        new Vector3(...satelliteOrbitPosition(satellite.orbitRadius, i / 90 * Math.PI * 2)),
      );
      this.planet.group.add(new LineLoop(new BufferGeometry().setFromPoints(points), new LineBasicMaterial({ color: data.color, transparent: true, opacity: .1 })));
      return satellite;
    });
  }

  update(dt: number, animate: boolean) {
    if (animate) this.planet.update(dt);
    this.satellites.forEach((satellite) => satellite.update(dt, animate));
  }
}
