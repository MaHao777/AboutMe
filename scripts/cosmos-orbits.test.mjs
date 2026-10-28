import assert from 'node:assert/strict';
import { test } from 'node:test';
import { orbitFrontAngle, planetVisualRadius, satelliteOrbitPosition, satelliteOrbitRadius, SATELLITE_CLEARANCE } from '../src/cosmos/orbits.ts';
import { universeData } from '../src/cosmos/universeData.ts';

test('all satellites clear their planet, halo and rings throughout a complete orbit', () => {
  for (const planet of universeData) {
    for (const satellite of planet.satellites) {
      const radius = satelliteOrbitRadius(planet, satellite);
      for (let step = 0; step < 2048; step++) {
        const position = satelliteOrbitPosition(radius, satellite.phase + step / 2048 * Math.PI * 2, planet.orbitOrientation);
        const clearance = Math.hypot(...position) - planetVisualRadius(planet) - satellite.radius;
        assert.ok(clearance >= SATELLITE_CLEARANCE - 1e-10, `${planet.id}/${satellite.id} intersects the planet or rings at step ${step}`);
        assert.ok(Math.abs(planet.position[0] + position[0]) - satellite.radius > 3.3, `${satellite.id} enters the central flight corridor`);
      }
    }
  }
});

test('satellites in the same system stay separated as they orbit', () => {
  for (const planet of universeData) {
    for (let step = 0; step < 360; step++) {
      const positions = planet.satellites.map((satellite) => satelliteOrbitPosition(
        satelliteOrbitRadius(planet, satellite), satellite.phase + step / 360 * Math.PI * 2, planet.orbitOrientation,
      ));
      for (let i = 0; i < positions.length; i++) for (let j = i + 1; j < positions.length; j++) {
        const distance = Math.hypot(...positions[i].map((value, axis) => value - positions[j][axis]));
        assert.ok(distance > planet.satellites[i].radius + planet.satellites[j].radius, `${planet.id} satellites collide`);
      }
    }
  }
});

test('a requested orbit that is too small expands to fit the complete visual bounds', () => {
  const planet = { radius: 9, ring: true };
  const satellite = { radius: 1.5, orbit: 2 };
  const radius = satelliteOrbitRadius(planet, satellite);
  assert.ok(radius >= planetVisualRadius(planet) + satellite.radius + SATELLITE_CLEARANCE);
});

test('orbit orientation can rotate a circle into different three-dimensional planes', () => {
  const horizontal = satelliteOrbitPosition(5, Math.PI / 2, { tilt: Math.PI / 2, roll: 0 });
  assert.ok(Math.abs(horizontal[0]) < 1e-10 && Math.abs(horizontal[1]) < 1e-10);
  assert.ok(Math.abs(horizontal[2] - 5) < 1e-10);
  const rotated = satelliteOrbitPosition(5, 0, { tilt: 0, roll: Math.PI / 2 });
  assert.ok(Math.abs(rotated[0]) < 1e-10 && Math.abs(rotated[2]) < 1e-10);
  assert.ok(Math.abs(rotated[1] - 5) < 1e-10);
});

test('the foreground anchor is the nearest point toward the camera in every configured plane', () => {
  const view = [.35, .14, 1];
  const depth = (point) => point.reduce((sum, value, axis) => sum + value * view[axis], 0);
  for (const planet of universeData) {
    const front = orbitFrontAngle(planet.orbitOrientation, view);
    const frontDepth = depth(satelliteOrbitPosition(1, front, planet.orbitOrientation));
    for (let step = 0; step < 720; step++) {
      assert.ok(frontDepth >= depth(satelliteOrbitPosition(1, step / 720 * Math.PI * 2, planet.orbitOrientation)) - 1e-10);
    }
  }
});
