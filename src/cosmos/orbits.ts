import type { PlanetData, SatelliteData } from './universeData';

export const PLANET_HALO_SCALE = 1.055;
export const PLANET_RING_OUTER_SCALE = 1.55;
export const SATELLITE_CLEARANCE = .75;
const ORBIT_TILT = .4;

export function planetVisualRadius(planet: Pick<PlanetData, 'radius' | 'ring'>) {
  return planet.radius * (planet.ring ? PLANET_RING_OUTER_SCALE : PLANET_HALO_SCALE);
}

export function satelliteOrbitRadius(
  planet: Pick<PlanetData, 'radius' | 'ring'>,
  satellite: Pick<SatelliteData, 'radius' | 'orbit'>,
) {
  return Math.max(satellite.orbit, planetVisualRadius(planet) + satellite.radius + SATELLITE_CLEARANCE);
}

/** Rotate a circle as a whole: tilting must never shrink its distance to the planet. */
export function satelliteOrbitPosition(radius: number, angle: number): [number, number, number] {
  const vertical = Math.sin(angle) * radius;
  return [Math.cos(angle) * radius, vertical * Math.cos(ORBIT_TILT), vertical * Math.sin(ORBIT_TILT)];
}
