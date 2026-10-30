import assert from 'node:assert/strict';
import { test } from 'node:test';
import { MOTTO_MORPH_DURATION, mottoTimeline } from '../src/cosmos/mottoTimeline.ts';

test('Chinese is assembled at startup and throughout the first two minutes', () => {
  for (const time of [0, 30, 119.999]) {
    const state = mottoTimeline(time);
    assert.equal(state.text, '无限进步');
    assert.equal(state.changing, false);
    assert.equal(state.source, state.target);
  }
});

test('a particle reconstruction starts exactly every 120 seconds', () => {
  const start = mottoTimeline(120);
  assert.equal(start.source, 0); assert.equal(start.target, 1);
  assert.equal(start.progress, 0); assert.equal(start.changing, true);
  const middle = mottoTimeline(120 + MOTTO_MORPH_DURATION / 2);
  assert.ok(Math.abs(middle.progress - .5) < 1e-10);
  assert.equal(middle.text, 'NEVER STOP');
  const finished = mottoTimeline(120 + MOTTO_MORPH_DURATION);
  assert.equal(finished.changing, false); assert.equal(finished.text, 'NEVER STOP');
});

test('the phrases alternate indefinitely and reconstruct in both directions', () => {
  assert.equal(mottoTimeline(240).source, 1);
  assert.equal(mottoTimeline(240).target, 0);
  assert.equal(mottoTimeline(244).text, '无限进步');
  assert.equal(mottoTimeline(360).target, 1);
  assert.equal(mottoTimeline(120 * 1001 + 4).text, 'NEVER STOP');
  assert.equal(mottoTimeline(120 * 1002 + 4).text, '无限进步');
});

test('reduced motion switches language at the same interval without scattering', () => {
  const state = mottoTimeline(120, true);
  assert.equal(state.changing, false); assert.equal(state.progress, 1);
  assert.equal(state.source, 1); assert.equal(state.target, 1);
  assert.equal(state.text, 'NEVER STOP');
});

test('invalid and negative elapsed times safely use the initial language', () => {
  for (const time of [NaN, Infinity, -120]) {
    const state = mottoTimeline(time);
    assert.equal(state.text, '无限进步'); assert.equal(state.changing, false);
  }
});
