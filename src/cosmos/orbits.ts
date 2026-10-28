import type { OrbitOrientation, PlanetData, SatelliteData } from './universeData';

export const PLANET_HALO_SCALE = 1.055;
export const PLANET_RING_OUTER_SCALE = 1.55;
export const SATELLITE_CLEARANCE = .75;
const DEFAULT_ORIENTATION: OrbitOrientation = { tilt: .4, roll: 0 };

export function planetVisualRadius(planet: Pick<PlanetData, 'radius' | 'ring'>) {
  return planet.radius * (planet.ring ? PLANET_RING_OUTER_SCALE : PLANET_HALO_SCALE);
}

export function satelliteOrbitRadius(
  planet: Pick<PlanetData, 'radius' | 'ring'>,
  satellite: Pick<SatelliteData, 'radius' | 'orbit'>,
) {
  return Math.max(satellite.orbit, planetVisualRadius(planet) + satellite.radius + SATELLITE_CLEARANCE);
}

/** Rotate an XY plane rigidly; circles and satellites share the same orientation. */
export function orbitPlanePosition(x: number, y: number, orientation: OrbitOrientation): [number, number, number] {
  const tiltedY = y * Math.cos(orientation.tilt);
  return [
    x * Math.cos(orientation.roll) - tiltedY * Math.sin(orientation.roll),
    x * Math.sin(orientation.roll) + tiltedY * Math.cos(orientation.roll),
    y * Math.sin(orientation.tilt),
  ];
}

export function satelliteOrbitPosition(radius: number, angle: number, orientation = DEFAULT_ORIENTATION): [number, number, number] {
  return orbitPlanePosition(Math.cos(angle) * radius, Math.sin(angle) * radius, orientation);
}

/** The point in the orbit nearest the viewing direction is the foreground anchor. */
export function orbitFrontAngle(orientation: OrbitOrientation, view: [number, number, number]) {
  const u = orbitPlanePosition(1, 0, orientation);
  const v = orbitPlanePosition(0, 1, orientation);
  return Math.atan2(v.reduce((sum, value, axis) => sum + value * view[axis], 0), u.reduce((sum, value, axis) => sum + value * view[axis], 0));
}
