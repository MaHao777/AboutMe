import assert from 'node:assert/strict';
import { test } from 'node:test';
import { accretionLight, accretionHalfThickness, lensShoulder, LENS_RADIUS, LENS_JOIN_START, LENS_JOIN_END } from '../src/cosmos/accretionProfile.ts';

test('radial light follows alternating peaks and troughs from the outer edge inward', () => {
  [0, 1, 0, 4, 1, 5, 2, 7, 2, 9].forEach((level, index) => {
    assert.ok(Math.abs(accretionLight(index / 9) - level / 9) < 1e-10);
  });
  for (let index = 0; index <= 1000; index++) {
    const value = accretionLight(index / 1000);
    assert.ok(value >= 0 && value <= 1);
  }
  const epsilon = 1e-5;
  for (let knot = 1; knot < 9; knot++) {
    const center = accretionLight(knot / 9);
    assert.ok(Math.abs(accretionLight(knot / 9 + epsilon) - center) / epsilon < .01);
    assert.ok(Math.abs(accretionLight(knot / 9 - epsilon) - center) / epsilon < .01);
  }
});

test('the inner body has real thickness and tapers continuously toward the outer edge', () => {
  assert.ok(accretionHalfThickness(1) > 3.5);
  assert.ok(accretionHalfThickness(0) < .1);
  for (let index = 0; index < 100; index++) {
    assert.ok(accretionHalfThickness(index / 100) <= accretionHalfThickness((index + 1) / 100));
  }
});

test('both optical shoulders preserve the circular tangent and flatten into the disk', () => {
  const epsilon = 1e-6;
  for (const side of [1, -1]) {
    const start = lensShoulder(LENS_JOIN_START, side);
    const y = side * Math.sqrt(LENS_RADIUS ** 2 - LENS_JOIN_START ** 2);
    assert.ok(Math.abs(start.height - y) < 1e-10);
    assert.ok(Math.abs(start.slope + LENS_JOIN_START / y) < 1e-10);
    const left = lensShoulder(LENS_JOIN_START - epsilon, side);
    const right = lensShoulder(LENS_JOIN_START + epsilon, side);
    assert.ok(Math.abs(left.slope - right.slope) < .0001);
    const end = lensShoulder(LENS_JOIN_END, side);
    assert.ok(Math.abs(end.height - side * .12) < 1e-10);
    assert.ok(Math.abs(end.slope) < 1e-10);
  }
});
