import { BufferGeometry, LineLoop, LineSegments, LineBasicMaterial, Vector3 } from 'three';
import { Planet } from './Planet';
import { Satellite } from './Satellite';
import type { PlanetData } from './universeData';
import { orbitPlanePosition, satelliteOrbitPosition, satelliteOrbitRadius } from './orbits';
import { SatelliteOrbitController } from './SatelliteOrbitController';

export class PlanetSystem {
  readonly planet: Planet;
  readonly satellites: Satellite[];
  readonly orbit: SatelliteOrbitController;
  readonly extent: number;
  private selectionMarker: LineSegments;

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
    const radii = this.satellites.map((entry) => entry.orbitRadius);
    const left = radii.length ? Math.min(...radii) - 1.1 : data.radius + 1;
    const right = radii.length ? Math.max(...radii) + 1.1 : left + 1;
    const vertices = [
      left, .9, 0, left, -.9, 0, left, .9, 0, left + .35, .9, 0,
      right, .9, 0, right, -.9, 0, right, -.9, 0, right - .35, -.9, 0,
    ];
    this.selectionMarker = new LineSegments(
      new BufferGeometry().setFromPoints(Array.from({ length: vertices.length / 3 }, (_, i) =>
        new Vector3(...orbitPlanePosition(vertices[i * 3], vertices[i * 3 + 1], data.orbitOrientation)),
      )),
      new LineBasicMaterial({ color: data.color, transparent: true, opacity: .65 }),
    );
    this.selectionMarker.visible = false;
    this.planet.group.add(this.selectionMarker);
  }

  update(dt: number, animate: boolean) {
    if (animate) this.planet.update(dt);
    this.orbit.update(dt, animate);
    this.selectionMarker.visible = this.orbit.active && this.satellites.length > 1;
    this.satellites.forEach((satellite) => satellite.update(this.orbit.rotation));
  }
}
