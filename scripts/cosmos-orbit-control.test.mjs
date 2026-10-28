import assert from 'node:assert/strict';
import { test } from 'node:test';
import { SatelliteOrbitController } from '../src/cosmos/SatelliteOrbitController.ts';

const tick = (orbit, seconds = 2) => {
  for (let elapsed = 0; elapsed < seconds; elapsed += 1 / 120) orbit.update(1 / 120, false);
};

test('content commits only after reaching a foreground anchor, in either direction', () => {
  const orbit = new SatelliteOrbitController([.4, 2.5, 4.6]);
  orbit.enter(0); tick(orbit);
  assert.equal(orbit.selectedIndex, 0);
  orbit.wheel(200); orbit.wheel(100);
  assert.equal(orbit.selectedIndex, 0, 'being nearer the next satellite must not advance the page');
  const paused = orbit.rotation;
  tick(orbit, 5);
  assert.equal(orbit.rotation, paused);
  orbit.wheel(50);
  assert.equal(orbit.selectedIndex, 1);
  assert.ok(Math.abs(orbit.rotation - orbit.frontAngle + 2.5) < .001);
  orbit.wheel(-200); orbit.wheel(-100);
  assert.equal(orbit.selectedIndex, 1, 'reversing near a boundary must keep the arrived page');
  orbit.wheel(-50);
  assert.equal(orbit.selectedIndex, 0);
});

test('the satellite carousel wraps in both directions', () => {
  const orbit = new SatelliteOrbitController([.4, 2.5, 4.6]);
  orbit.enter(2); tick(orbit);
  orbit.wheel(240); orbit.wheel(120); tick(orbit);
  assert.equal(orbit.selectedIndex, 0);
  orbit.wheel(-240); orbit.wheel(-120); tick(orbit);
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

test('a wheel gesture can pause just before the next page without idle snapping', () => {
  const orbit = new SatelliteOrbitController([.4, 2.5, 4.6]);
  orbit.enter(0);
  orbit.wheel(240); orbit.wheel(100);
  assert.ok(orbit.contentPosition > .95 && orbit.contentPosition < 1);
  assert.equal(orbit.selectedIndex, 0);
  const rotation = orbit.rotation, position = orbit.contentPosition;
  tick(orbit, 8);
  assert.equal(orbit.rotation, rotation);
  assert.equal(orbit.contentPosition, position);
  assert.equal(orbit.selectedIndex, 0);
});

test('reverse scrubbing can pause between the first and last page without an early switch', () => {
  const orbit = new SatelliteOrbitController([.4, 2.5, 4.6]);
  orbit.enter(0); orbit.wheel(-100);
  assert.ok(orbit.contentPosition < 0 && orbit.contentPosition > -1);
  tick(orbit, 3);
  assert.equal(orbit.selectedIndex, 0);
});

test('wheel input interrupts click alignment and stops with the new exact position', () => {
  const orbit = new SatelliteOrbitController([.4, 2.5, 4.6]);
  orbit.enter(0); orbit.select(1); orbit.update(.05);
  orbit.wheel(10);
  const rotation = orbit.rotation;
  tick(orbit, 3);
  assert.equal(orbit.rotation, rotation);
});

test('a changed viewing direction preserves the continuous content position', () => {
  const orbit = new SatelliteOrbitController([.4, 2.5, 4.6]);
  orbit.enter(0); orbit.wheel(100);
  const position = orbit.contentPosition;
  orbit.setFrontAngle(orbit.frontAngle + .7);
  assert.ok(Math.abs(orbit.contentPosition - position) < 1e-10);
  assert.equal(orbit.selectedIndex, 0);
});
