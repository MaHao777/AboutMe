import { BufferGeometry, LineLoop, LineBasicMaterial, Vector3 } from 'three';
import { Planet } from './Planet';
import { Satellite } from './Satellite';
import type { PlanetData } from './universeData';
import { satelliteOrbitPosition, satelliteOrbitRadius } from './orbits';
import { SatelliteOrbitController } from './SatelliteOrbitController';

export class PlanetSystem {
  readonly planet: Planet;
  readonly satellites: Satellite[];
  readonly orbit: SatelliteOrbitController;
  readonly extent: number;

  constructor(readonly data: PlanetData) {
    this.planet = new Planet(data);
    this.orbit = new SatelliteOrbitController(data.satellites.map((entry) => entry.phase));
    this.satellites = data.satellites.map((entry) => {
      const satellite = new Satellite(entry, data.color, satelliteOrbitRadius(data, entry), data.orbitOrientation);
      this.planet.group.add(satellite.group);
      const points = Array.from({ length: 90 }, (_, i) =>
        new Vector3(...satelliteOrbitPosition(satellite.orbitRadius, i / 90 * Math.PI * 2, data.orbitOrientation)),
      );
      this.planet.group.add(new LineLoop(new BufferGeometry().setFromPoints(points), new LineBasicMaterial({ color: data.color, transparent: true, opacity: .1 })));
      return satellite;
    });
    this.extent = Math.max(data.radius * 1.6, ...this.satellites.map((entry) => entry.orbitRadius + entry.data.radius)) + .7;
  }

  update(dt: number, animateOrbit: boolean, reducedMotion = false) {
    // 阅读内容时只暂停自动公转，主星仍保持缓慢自转。
    this.planet.update(dt, !reducedMotion, reducedMotion);
    this.orbit.update(dt, animateOrbit);
    this.satellites.forEach((satellite) => satellite.update(this.orbit.rotation, dt, reducedMotion));
  }
}
