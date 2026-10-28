import assert from 'node:assert/strict';
import { test } from 'node:test';
import { SatelliteOrbitController } from '../src/cosmos/SatelliteOrbitController.ts';

const tick = (orbit, seconds = 2) => {
  for (let elapsed = 0; elapsed < seconds; elapsed += 1 / 120) orbit.update(1 / 120, false);
};

test('a mouse detent is distributed across frames and finishes at its exact input endpoint', () => {
  const orbit = new SatelliteOrbitController([.4, 2.5, 4.6]);
  orbit.enter();
  const start = orbit.rotation;
  orbit.wheel(120);
  assert.equal(orbit.rotation, start, 'wheel events must not teleport the rendered angle');
  const samples = [];
  for (let frame = 0; frame < 8; frame++) { orbit.update(1 / 60); samples.push(orbit.rotation); }
  assert.ok(samples[0] < start && samples[0] > start - .72);
  assert.ok(samples.slice(1).every((value, index) => value < samples[index]));
  assert.ok(Math.abs(orbit.rotation - (start - .72)) < 1e-10);
  const stopped = orbit.rotation;
  tick(orbit, 3);
  assert.equal(orbit.rotation, stopped);
});

test('content commits only after reaching a foreground anchor, in either direction', () => {
  const orbit = new SatelliteOrbitController([.4, 2.5, 4.6]);
  orbit.enter(0); tick(orbit);
  assert.equal(orbit.selectedIndex, 0);
  orbit.wheel(200); orbit.wheel(100);
  tick(orbit, .2);
  assert.equal(orbit.selectedIndex, 0, 'being nearer the next satellite must not advance the page');
  const paused = orbit.rotation;
  tick(orbit, 5);
  assert.equal(orbit.rotation, paused);
  orbit.wheel(50);
  tick(orbit, .2);
  assert.equal(orbit.selectedIndex, 1);
  assert.ok(Math.abs(orbit.rotation - orbit.frontAngle + 2.5) < .001);
  orbit.wheel(-200); orbit.wheel(-100);
  tick(orbit, .2);
  assert.equal(orbit.selectedIndex, 1, 'reversing near a boundary must keep the arrived page');
  orbit.wheel(-50);
  tick(orbit, .2);
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
  tick(orbit, .2);
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
  orbit.enter(0); orbit.wheel(-100); tick(orbit, .2);
  assert.ok(orbit.contentPosition < 0 && orbit.contentPosition > -1);
  tick(orbit, 3);
  assert.equal(orbit.selectedIndex, 0);
});

test('wheel input interrupts click alignment and finishes only the new gesture', () => {
  const orbit = new SatelliteOrbitController([.4, 2.5, 4.6]);
  orbit.enter(0); orbit.select(1); orbit.update(.05);
  orbit.wheel(10);
  const rotation = orbit.targetRotation;
  tick(orbit, 3);
  assert.equal(orbit.rotation, rotation);
});

test('a changed viewing direction preserves the continuous content position', () => {
  const orbit = new SatelliteOrbitController([.4, 2.5, 4.6]);
  orbit.enter(0); orbit.wheel(100); orbit.update(.02);
  const position = orbit.contentPosition;
  orbit.setFrontAngle(orbit.frontAngle + .7);
  assert.ok(Math.abs(orbit.contentPosition - position) < 1e-10);
  assert.equal(orbit.selectedIndex, 0);
});

test('wheel smoothing has the same endpoint across frame rates and repeated detents', () => {
  const endpoints = [30, 60, 144].map((fps) => {
    const orbit = new SatelliteOrbitController([.4, 2.5, 4.6]); orbit.enter();
    orbit.wheel(40); orbit.wheel(40); orbit.wheel(40);
    for (let frame = 0; frame < fps; frame++) orbit.update(1 / fps);
    return orbit.rotation;
  });
  endpoints.forEach((angle) => assert.ok(Math.abs(angle - endpoints[0]) < 1e-10));
});

test('reversing input and opening details cancel unfinished wheel movement', () => {
  const orbit = new SatelliteOrbitController([.4, 2.5, 4.6]); orbit.enter();
  orbit.wheel(240); orbit.update(.02);
  const reversedAt = orbit.rotation;
  orbit.wheel(-10); orbit.update(.02);
  assert.ok(orbit.rotation > reversedAt, 'reverse input must immediately reverse visual direction');
  const stopped = orbit.rotation; orbit.stop(); tick(orbit);
  assert.equal(orbit.rotation, stopped);
  orbit.wheel(40, 0, 900, true);
  assert.ok(Math.abs(orbit.rotation - stopped + .24) < 1e-10);
});
