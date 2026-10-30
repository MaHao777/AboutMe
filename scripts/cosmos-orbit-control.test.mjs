import assert from 'node:assert/strict';
import { test } from 'node:test';
import { SatelliteOrbitController } from '../src/cosmos/SatelliteOrbitController.ts';

const tick = (orbit, seconds = 1, fps = 120) => {
  for (let remaining = seconds; remaining > 1e-10;) {
    const delta = Math.min(1 / fps, remaining);
    orbit.update(delta, false); remaining -= delta;
  }
};
const aligned = (orbit, index) => assert.ok(Math.abs(Math.sin((orbit.phases[index] + orbit.rotation - orbit.frontAngle) / 2)) < 1e-10);
const three = () => { const orbit = new SatelliteOrbitController([.4, 2.5, 4.6]); orbit.enter(); return orbit; };

test('a detent moves continuously, then a small gesture gently returns to its foreground anchor', () => {
  const orbit = three(), start = orbit.rotation;
  orbit.wheel(120);
  assert.equal(orbit.rotation, start, 'wheel events must not teleport the rendered angle');
  const samples = [];
  for (let frame = 0; frame < 8; frame++) { orbit.update(1 / 60); samples.push(orbit.rotation); }
  assert.ok(samples[0] < start && samples[0] > start - .72);
  assert.ok(samples.slice(1).every((value, index) => value < samples[index]));
  assert.ok(Math.abs(orbit.rotation - (start - .72)) < 1e-10, 'direct wheel endpoint remains unchanged until quiet');
  tick(orbit, .05);
  assert.ok(Math.abs(orbit.rotation - (start - .72)) < 1e-10);
  tick(orbit, .12);
  assert.ok(orbit.rotation > start - .72 && orbit.rotation < start, 'snap should ease, not jump');
  tick(orbit, .3); aligned(orbit, 0);
  const settled = orbit.rotation; tick(orbit, 3); assert.equal(orbit.rotation, settled);
});

test('continuous wheel gestures postpone snapping even after multiple detents', () => {
  const orbit = three();
  for (let i = 0; i < 8; i++) {
    orbit.wheel(20); tick(orbit, .08);
    assert.ok(orbit.targetRotation <= orbit.rotation, 'active forward input must not attract backward');
  }
  const continuous = orbit.rotation;
  assert.ok(orbit.contentPosition > .4 && orbit.contentPosition < .5);
  tick(orbit, .08);
  assert.ok(orbit.rotation <= continuous, 'the last direct input should finish before attraction');
  tick(orbit, .7); aligned(orbit, 0);
});

test('the nearest-anchor threshold returns below halfway and advances above halfway', () => {
  const below = three(); below.wheel(160); tick(below); aligned(below, 0); assert.equal(below.selectedIndex, 0);
  const above = three(); above.wheel(180); tick(above); aligned(above, 1); assert.equal(above.selectedIndex, 1);
});

test('content commits on actual foreground arrival, rather than when the next anchor becomes nearest', () => {
  const orbit = three();
  orbit.wheel(200); tick(orbit, .2);
  assert.ok(orbit.contentPosition > .5 && orbit.contentPosition < 1);
  assert.equal(orbit.selectedIndex, 0);
  tick(orbit, .25);
  assert.equal(orbit.selectedIndex, 0, 'an incomplete snap must not commit its target');
  tick(orbit, .08); assert.equal(orbit.selectedIndex, 1); aligned(orbit, 1);
  orbit.wheel(-200); tick(orbit, .2);
  assert.equal(orbit.selectedIndex, 1);
  tick(orbit, .25); assert.equal(orbit.selectedIndex, 1);
  tick(orbit, .08); assert.equal(orbit.selectedIndex, 0); aligned(orbit, 0);
});

test('direct wheel motion still commits an anchor crossed before the quiet delay', () => {
  const orbit = three(); orbit.wheel(240); orbit.wheel(120); tick(orbit, .12);
  assert.equal(orbit.selectedIndex, 1);
  tick(orbit); aligned(orbit, 1);
});

test('forward and reverse snapping wrap between the first and last satellites', () => {
  const orbit = three(); orbit.enter(2);
  orbit.wheel(190); tick(orbit); assert.equal(orbit.selectedIndex, 0); aligned(orbit, 0);
  orbit.wheel(-190); tick(orbit); assert.equal(orbit.selectedIndex, 2); aligned(orbit, 2);
});

test('a halfway tie follows the input direction, including a nonuniform orbit', () => {
  const orbit = new SatelliteOrbitController([0, 1, 4]); orbit.enter(0);
  orbit.wheel(.5 / .006); tick(orbit); assert.equal(orbit.selectedIndex, 1); aligned(orbit, 1);
});

test('new wheel input interrupts attraction immediately and reverse input cancels old remainder', () => {
  const orbit = three(); orbit.wheel(200); tick(orbit, .3);
  const snappingAt = orbit.rotation;
  orbit.wheel(-100); orbit.update(.02);
  assert.ok(orbit.rotation > snappingAt, 'wheel reversal must take ownership during attraction');
  const directTarget = orbit.targetRotation;
  assert.ok(Math.abs(directTarget - snappingAt - .6) < 1e-10, 'the old snap target must be discarded');
  tick(orbit); aligned(orbit, 0);
});

test('click and arrow alignment take over pending attraction and share the same rotation', () => {
  const orbit = three(); orbit.wheel(160); tick(orbit, .24);
  orbit.select(2); tick(orbit, 2); assert.equal(orbit.selectedIndex, 2); aligned(orbit, 2);
  orbit.step(1); tick(orbit, 2); assert.equal(orbit.selectedIndex, 0); aligned(orbit, 0);
  orbit.select(1, true); assert.equal(orbit.selectedIndex, 1); aligned(orbit, 1);
});

test('wheel input interrupts a click alignment before starting its own quiet snap', () => {
  const orbit = three(); orbit.select(1); orbit.update(.05);
  const interruptedAt = orbit.rotation;
  orbit.wheel(10); tick(orbit, .12);
  assert.ok(Math.abs(orbit.rotation - interruptedAt + .06) < 1e-10);
  tick(orbit); aligned(orbit, 0);
});

test('stop freezes pending input, quiet-delay attraction and an attraction already in progress', () => {
  for (const seconds of [.02, .15, .3]) {
    const orbit = three(); orbit.wheel(200); tick(orbit, seconds);
    const stopped = orbit.rotation; orbit.stop(); tick(orbit, 5);
    assert.equal(orbit.rotation, stopped, `detail opened at ${seconds}s must cancel every pending motion`);
    assert.equal(orbit.targetRotation, stopped);
  }
});

test('exiting discards snap state and reentering starts aligned without stale motion', () => {
  const orbit = three(); orbit.wheel(200); tick(orbit, .3); orbit.exit();
  const rotation = orbit.rotation; orbit.wheel(200); tick(orbit, 4); assert.equal(orbit.rotation, rotation);
  orbit.enter(2); tick(orbit, 4); assert.equal(orbit.selectedIndex, 2); aligned(orbit, 2);
});

test('resize preserves continuous progress during wheel smoothing, quiet delay and attraction', () => {
  for (const seconds of [.02, .15, .3]) {
    const orbit = three(); orbit.wheel(200); tick(orbit, seconds);
    const position = orbit.contentPosition, distanceToTarget = orbit.targetRotation - orbit.rotation;
    orbit.setFrontAngle(orbit.frontAngle + .7);
    assert.ok(Math.abs(orbit.contentPosition - position) < 1e-10);
    assert.ok(Math.abs(orbit.targetRotation - orbit.rotation - distanceToTarget) < 1e-10);
    tick(orbit); aligned(orbit, 1); assert.equal(orbit.selectedIndex, 1);
  }
});

test('pixel, line and page wheel units normalize to the same snap and reject invalid input', () => {
  const orbits = [three(), three(), three()];
  orbits[0].wheel(180); orbits[1].wheel(11.25, 1); orbits[2].wheel(.225, 2, 800);
  orbits.forEach((orbit) => { orbit.wheel(NaN); orbit.wheel(Infinity); tick(orbit); });
  orbits.forEach((orbit) => { aligned(orbit, 1); assert.equal(orbit.rotation, orbits[0].rotation); });
});

test('wheel smoothing and attraction have matching endpoints across frame rates and long frames', () => {
  const endpoints = [30, 60, 144].map((fps) => {
    const orbit = three(); orbit.wheel(80); orbit.wheel(80); orbit.wheel(40);
    tick(orbit, .6, fps); aligned(orbit, 1); return orbit.rotation;
  });
  const longFrame = three(); longFrame.wheel(200); longFrame.update(.6);
  aligned(longFrame, 1); endpoints.push(longFrame.rotation);
  endpoints.forEach((angle) => assert.ok(Math.abs(angle - endpoints[0]) < 1e-10));
});

test('a single satellite returns to its equivalent anchor and empty systems remain safe', () => {
  const single = new SatelliteOrbitController([.8]); single.enter();
  const before = single.rotation; single.wheel(100); tick(single, .15);
  assert.ok(single.rotation < before); tick(single); aligned(single, 0); assert.ok(Math.abs(single.rotation - before) < 1e-10);
  const empty = new SatelliteOrbitController([]); empty.enter(); empty.wheel(100); empty.step(1); tick(empty);
  assert.equal(empty.selectedIndex, -1); assert.equal(empty.rotation, 0);
});

test('reduced-motion input moves directly, then snaps directly only after input has gone quiet', () => {
  const orbit = three(), start = orbit.rotation;
  orbit.wheel(200, 0, 900, true);
  assert.ok(Math.abs(orbit.rotation - start + 1.2) < 1e-10);
  assert.equal(orbit.selectedIndex, 0);
  tick(orbit, .19); assert.ok(Math.abs(orbit.rotation - start + 1.2) < 1e-10);
  tick(orbit, .02); aligned(orbit, 1); assert.equal(orbit.selectedIndex, 1);
  const stopped = orbit.rotation; orbit.wheel(-40, 0, 900, true); orbit.stop(); tick(orbit, 3);
  assert.ok(Math.abs(orbit.rotation - stopped - .24) < 1e-10, 'stop must cancel the reduced-motion quiet snap too');
});
