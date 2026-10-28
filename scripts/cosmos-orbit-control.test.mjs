import assert from 'node:assert/strict';
import { test } from 'node:test';
import { SatelliteOrbitController } from '../src/cosmos/SatelliteOrbitController.ts';

const tick = (orbit, seconds = 2) => {
  for (let elapsed = 0; elapsed < seconds; elapsed += 1 / 120) orbit.update(1 / 120, false);
};

test('wheel rotates forward and backward and the selected satellite follows the actual rotation', () => {
  const orbit = new SatelliteOrbitController([.4, 2.5, 4.6]);
  orbit.enter(0); tick(orbit);
  assert.equal(orbit.selectedIndex, 0);
  orbit.wheel(100);
  assert.equal(orbit.selectedIndex, 0, 'panel must not jump ahead of the visible satellite');
  tick(orbit);
  assert.equal(orbit.selectedIndex, 1);
  assert.ok(Math.abs(orbit.rotation + 2.5) < .001);
  orbit.wheel(-100); tick(orbit);
  assert.equal(orbit.selectedIndex, 0);
});

test('the satellite carousel wraps in both directions', () => {
  const orbit = new SatelliteOrbitController([.4, 2.5, 4.6]);
  orbit.enter(2); tick(orbit);
  orbit.wheel(100); tick(orbit);
  assert.equal(orbit.selectedIndex, 0);
  orbit.wheel(-100); tick(orbit);
  assert.equal(orbit.selectedIndex, 2);
});

test('click and keyboard selection rotate the same system; exiting discards queued motion', () => {
  const orbit = new SatelliteOrbitController([.5, 3.4]);
  orbit.enter(0); tick(orbit);
  orbit.select(1); tick(orbit);
  assert.equal(orbit.selectedIndex, 1);
  orbit.step(1); tick(orbit);
  assert.equal(orbit.selectedIndex, 0);
  orbit.wheel(200); orbit.exit();
  const rotation = orbit.rotation;
  orbit.wheel(200); tick(orbit);
  assert.equal(orbit.rotation, rotation);
  orbit.enter(); tick(orbit);
  assert.equal(orbit.selectedIndex, 0);
});

test('wheel units are normalized and invalid input cannot corrupt the orbit', () => {
  const orbits = Array.from({ length: 3 }, () => new SatelliteOrbitController([.4, 2.5, 4.6]));
  orbits.forEach((orbit) => { orbit.enter(); tick(orbit); });
  orbits[0].wheel(160); orbits[1].wheel(10, 1); orbits[2].wheel(.2, 2, 800);
  orbits.forEach((orbit) => { orbit.wheel(NaN); tick(orbit); });
  assert.equal(orbits[0].rotation, orbits[1].rotation);
  assert.equal(orbits[0].rotation, orbits[2].rotation);
});

test('single-satellite systems still rotate; empty systems remain valid', () => {
  const single = new SatelliteOrbitController([.8]);
  single.enter(); tick(single);
  const before = single.rotation;
  single.wheel(100); tick(single);
  assert.ok(single.rotation < before);
  assert.equal(single.selectedIndex, 0);
  const empty = new SatelliteOrbitController([]);
  empty.enter(); empty.wheel(100); empty.step(1); tick(empty);
  assert.equal(empty.selectedIndex, -1);
  assert.equal(empty.rotation, 0);
});
